import { NextRequest, NextResponse } from 'next/server'
import { deleteRecipe, getRecipeById } from '@/lib/storage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recipe = await getRecipeById(params.id)
    if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ recipe }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteRecipe(params.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}