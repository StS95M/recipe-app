'use client'

import { useEffect, useState } from 'react'
import { Recipe } from '@/lib/types'
import RecipeCard from '@/components/RecipeCard'

export default function RecipePage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    fetch(`/api/recipes/${params.id}?t=` + Date.now())
      .then(r => r.json())
      .then(d => setRecipe(d.recipe))
  }, [params.id])

  if (!recipe) return (
    <div style={{ minHeight: '100vh', background: '#f7f3ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif" }}>Loading recipe…</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ed', padding: '36px 16px 80px' }}>
      <nav style={{ maxWidth: '680px', margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#2c2416', textDecoration: 'none' }}>🍳 RecipeBox</a>
        <a href="/library" style={{ fontSize: '13px', color: '#6b4423', fontWeight: '600', textDecoration: 'none', background: '#fff', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e8e0d0' }}>
          ← Library
        </a>
      </nav>
      <RecipeCard recipe={recipe} />
    </div>
  )
}
