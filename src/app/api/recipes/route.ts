import { NextResponse } from 'next/server'
import { getAllRecipes } from '@/lib/storage'

export async function GET() {
  try {
    const recipes = await getAllRecipes()
    return NextResponse.json({ recipes })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
