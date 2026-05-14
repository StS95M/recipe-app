import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { saveRecipe } from '@/lib/storage'
import { Recipe } from '@/lib/types'
import { randomUUID } from 'crypto'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `You are a recipe extraction expert. You will be given the raw HTML/text content of a recipe webpage.
Extract the recipe and return ONLY a valid JSON object with this exact structure — no markdown, no explanation, just the raw JSON:

{
  "title": "Recipe name",
  "description": "Short 1-2 sentence description of the dish",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "totalTime": "45 minutes",
  "servings": "4",
  "difficulty": "Easy",
  "category": "Dinner",
  "ingredients": [
    { "amount": "2", "unit": "cups", "item": "all-purpose flour" }
  ],
  "instructions": [
    { "step": 1, "text": "Full instruction text here" }
  ],
  "tags": ["vegetarian", "quick"]
}

Rules:
- difficulty must be one of: Easy, Medium, Hard
- If a field is not found, use an empty string "" or empty array []
- amounts should be numbers or fractions as strings e.g. "1", "1/2", "2.5"
- units examples: cups, tbsp, tsp, g, kg, ml, l, oz, lb, pinch, or "" for countable items
- Return ONLY the JSON object, nothing else`

async function fetchPageContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      // Pretend to be a regular browser so recipe sites don't block us
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    signal: AbortSignal.timeout(15000) // 15 second timeout
  })

  if (!response.ok) {
    throw new Error(`Could not load the page (HTTP ${response.status}). The website may be blocking automated access.`)
  }

  const html = await response.text()

  // Strip HTML tags and clean up whitespace to reduce token usage
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 15000) // Keep first 15k chars — enough for any recipe

  return text
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Please provide a valid URL starting with http or https' }, { status: 400 })
    }

    // Step 1: Fetch the page
    let pageContent: string
    try {
      pageContent = await fetchPageContent(url)
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Failed to fetch the page' }, { status: 422 })
    }

    // Step 2: Send to Gemini for extraction
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `${SYSTEM_PROMPT}\n\nPage content from ${url}:\n\n${pageContent}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Step 3: Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not extract recipe data from this page' }, { status: 422 })
    }

    const recipeData = JSON.parse(jsonMatch[0])

    // Step 4: Save to our library
    const recipe: Recipe = {
      ...recipeData,
      id: randomUUID(),
      sourceUrl: url,
      savedAt: new Date().toISOString(),
    }

	try {
	  await saveRecipe(recipe)
	  console.log('Recipe saved successfully:', recipe.id)
	} catch (saveErr: any) {
	  console.error('SAVE FAILED:', saveErr.message)
	  return NextResponse.json({ error: 'Recipe extracted but could not be saved: ' + saveErr.message }, { status: 500 })
	}

	return NextResponse.json({ recipe })

  } catch (err: any) {
    console.error('Extraction error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
