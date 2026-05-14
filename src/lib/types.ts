export interface Ingredient {
  amount: string
  unit: string
  item: string
}

export interface Instruction {
  step: number
  text: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  prepTime: string
  cookTime: string
  totalTime: string
  servings: string
  difficulty: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  tags: string[]
  sourceUrl: string
  savedAt: string
  rating: number
  cuisine: string
  diet: string[]
  mealType: string
}
