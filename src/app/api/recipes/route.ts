import { NextResponse } from 'next/server'
import { getAllRecipes } from '@/lib/storage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const recipes = await getAllRecipes()
    return NextResponse.json({ recipes }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}