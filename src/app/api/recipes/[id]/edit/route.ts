import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const db = neon(process.env.DATABASE_URL!)
    await db`
      UPDATE recipes SET
        title = ${body.title},
        description = ${body.description},
        prep_time = ${body.prepTime},
        cook_time = ${body.cookTime},
        total_time = ${body.totalTime},
        servings = ${body.servings},
        difficulty = ${body.difficulty},
        ingredients = ${JSON.stringify(body.ingredients)},
        instructions = ${JSON.stringify(body.instructions)}
      WHERE id = ${params.id}
    `
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
