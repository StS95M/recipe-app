import { NextRequest, NextResponse } from 'next/server'
import { deleteRecipe } from '@/lib/storage'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteRecipe(params.id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
