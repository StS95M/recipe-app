import { GoogleGenerativeAI } from '@google/generative-ai'
import { Recipe } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const CUISINES = ['Italian', 'Asian', 'Bavarian', 'Mediterranean', 'French', 'Mexican', 'Other']
const DIETS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free']
const MEAL_TYPES = ['Breakfast', 'Lunch & Dinner', 'Snack', 'Dessert', 'Soup']

const CLASSIFY_PROMPT = `You are a recipe classifier. Given a recipe, classify it into exactly these fixed categories.

Return ONLY a JSON object with no markdown, no explanation:
{
  "cuisine": one of exactly: ${CUISINES.join(', ')},
  "diet": array of zero or more from: ${DIETS.join(', ')},
  "mealType": one of exactly: ${MEAL_TYPES.join(', ')}
}

Rules:
- cuisine must be exactly one value from the list
- diet can be empty array [] if none apply
- mealType must be exactly one value from the list
- If unsure about cuisine, use "Other"
- Lunch and Dinner are combined as "Lunch & Dinner"`

export async function classifyRecipe(recipe: Recipe): Promise<{ cuisine: string; diet: string[]; mealType: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const content = `Title: ${recipe.title}
Description: ${recipe.description}
Ingredients: ${recipe.ingredients?.map(i => i.item).join(', ')}
Tags: ${recipe.tags?.join(', ')}`

    const result = await model.generateContent(`${CLASSIFY_PROMPT}\n\nRecipe:\n${content}`)
    const text = result.response.text().trim()
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in classification response')

    const data = JSON.parse(match[0])

    return {
      cuisine: CUISINES.includes(data.cuisine) ? data.cuisine : 'Other',
      diet: Array.isArray(data.diet) ? data.diet.filter((d: string) => DIETS.includes(d)) : [],
      mealType: MEAL_TYPES.includes(data.mealType) ? data.mealType : 'Lunch & Dinner',
    }
  } catch (e) {
    console.error('Classification failed:', e)
    return { cuisine: 'Other', diet: [], mealType: 'Lunch & Dinner' }
  }
}
