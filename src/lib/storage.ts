import { neon } from '@neondatabase/serverless'
import { Recipe } from './types'

function sql() {
  const db = neon(process.env.DATABASE_URL!)
  return db
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
      category TEXT,
      ingredients JSONB,
      instructions JSONB,
      tags JSONB,
      source_url TEXT,
      saved_at TEXT,
      rating INTEGER DEFAULT 0
    )
  `
  await db`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0`
}

export async function getAllRecipes(): Promise<Recipe[]> {
  await ensureTable()
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
    INSERT INTO recipes (id, title, description, prep_time, cook_time, total_time, servings, difficulty, category, ingredients, instructions, tags, source_url, saved_at)
    VALUES (
      ${recipe.id}, ${recipe.title}, ${recipe.description},
      ${recipe.prepTime}, ${recipe.cookTime}, ${recipe.totalTime},
      ${recipe.servings}, ${recipe.difficulty}, ${recipe.category},
      ${JSON.stringify(recipe.ingredients)}, ${JSON.stringify(recipe.instructions)},
      ${JSON.stringify(recipe.tags)}, ${recipe.sourceUrl}, ${recipe.savedAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      ingredients = EXCLUDED.ingredients,
      instructions = EXCLUDED.instructions,
      tags = EXCLUDED.tags
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
    category: row.category,
    ingredients: row.ingredients,
    instructions: row.instructions,
    tags: row.tags,
    sourceUrl: row.source_url,
    savedAt: row.saved_at,
	rating: row.rating || 0,
  }
}
