import { neon } from '@neondatabase/serverless'
import { Recipe } from './types'

function sql() {
  return neon(process.env.DATABASE_URL!)
}

async function ensureTable() {
  const db = sql()
  await db`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      prep_time TEXT,
      cook_time TEXT,
      total_time TEXT,
      servings TEXT,
      difficulty TEXT,
      ingredients JSONB,
      instructions JSONB,
      tags JSONB,
      source_url TEXT,
      saved_at TEXT,
      rating INTEGER DEFAULT 0,
      cuisine TEXT DEFAULT 'Other',
      diet JSONB DEFAULT '[]',
      meal_type TEXT DEFAULT 'Lunch & Dinner'
    )
  `
  // Add columns for existing databases
  await db`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0`
  await db`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine TEXT DEFAULT 'Other'`
  await db`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS diet JSONB DEFAULT '[]'`
  await db`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS meal_type TEXT DEFAULT 'Lunch & Dinner'`
}

async function backfillClassifications() {
  const db = sql()
  // Find recipes that haven't been classified yet (cuisine is still default or null)
  const unclassified = await db`
    SELECT id, title, description, ingredients, tags
    FROM recipes
    WHERE cuisine IS NULL OR cuisine = 'Other' AND meal_type IS NULL
    LIMIT 50
  `
  if (unclassified.length === 0) return

  console.log(`Backfilling ${unclassified.length} recipes...`)
  const { classifyRecipe } = await import('./classify')

  for (const row of unclassified) {
    try {
      const fakeRecipe = {
        id: row.id,
        title: row.title,
        description: row.description,
        ingredients: row.ingredients || [],
        tags: row.tags || [],
      } as Recipe

      const { cuisine, diet, mealType } = await classifyRecipe(fakeRecipe)
      await db`
        UPDATE recipes SET
          cuisine = ${cuisine},
          diet = ${JSON.stringify(diet)},
          meal_type = ${mealType}
        WHERE id = ${row.id}
      `
      console.log(`Classified ${row.title}: ${cuisine}, ${mealType}`)
    } catch (e) {
      console.error(`Failed to classify ${row.id}:`, e)
    }
  }
}

let backfillRun = false

export async function getAllRecipes(): Promise<Recipe[]> {
  await ensureTable()
  if (!backfillRun) {
    backfillRun = true
    backfillClassifications().catch(console.error)
  }
  const db = sql()
  const rows = await db`SELECT * FROM recipes ORDER BY saved_at DESC`
  return rows.map(rowToRecipe)
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  await ensureTable()
  const db = sql()
  const rows = await db`SELECT * FROM recipes WHERE id = ${id}`
  return rows.length > 0 ? rowToRecipe(rows[0]) : null
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  await ensureTable()
  const db = sql()
  await db`
    INSERT INTO recipes (
      id, title, description, prep_time, cook_time, total_time,
      servings, difficulty, ingredients, instructions, tags,
      source_url, saved_at, rating, cuisine, diet, meal_type
    ) VALUES (
      ${recipe.id}, ${recipe.title}, ${recipe.description},
      ${recipe.prepTime}, ${recipe.cookTime}, ${recipe.totalTime},
      ${recipe.servings}, ${recipe.difficulty},
      ${JSON.stringify(recipe.ingredients)}, ${JSON.stringify(recipe.instructions)},
      ${JSON.stringify(recipe.tags)}, ${recipe.sourceUrl}, ${recipe.savedAt},
      ${recipe.rating || 0}, ${recipe.cuisine || 'Other'},
      ${JSON.stringify(recipe.diet || [])}, ${recipe.mealType || 'Lunch & Dinner'}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      ingredients = EXCLUDED.ingredients,
      instructions = EXCLUDED.instructions,
      tags = EXCLUDED.tags,
      cuisine = EXCLUDED.cuisine,
      diet = EXCLUDED.diet,
      meal_type = EXCLUDED.meal_type
  `
}

export async function deleteRecipe(id: string): Promise<void> {
  await ensureTable()
  const db = sql()
  await db`DELETE FROM recipes WHERE id = ${id}`
}

function rowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    totalTime: row.total_time,
    servings: row.servings,
    difficulty: row.difficulty,
    ingredients: row.ingredients,
    instructions: row.instructions,
    tags: row.tags,
    sourceUrl: row.source_url,
    savedAt: row.saved_at,
    rating: row.rating || 0,
    cuisine: row.cuisine || 'Other',
    diet: row.diet || [],
    mealType: row.meal_type || 'Lunch & Dinner',
  }
}
