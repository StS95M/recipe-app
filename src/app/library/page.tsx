'use client'

import { useEffect, useState } from 'react'
import { Recipe } from '@/lib/types'
import Badge from '@/components/Badge'

function Stars({ rating }: { rating: number }) {
  if (!rating) return null
  return (
    <span style={{ fontSize: '13px', letterSpacing: '1px' }}>
      {'⭐'.repeat(rating)}
      <span style={{ color: '#b0a090', fontSize: '11px', marginLeft: '4px' }}>{rating}/5</span>
    </span>
  )
}
function RecipeTile({ recipe, onDelete }: { recipe: Recipe; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Remove this recipe from your library?')) return
    setDeleting(true)
    await fetch(`/api/recipes/${recipe.id}`, { method: 'DELETE' })
    onDelete(recipe.id)
  }

  return (
    <a href={`/recipe/${recipe.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #ede8df', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', opacity: deleting ? 0.5 : 1 }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {recipe.category && <Badge color="cream">{recipe.category}</Badge>}
              {recipe.difficulty && <Badge color="terracotta">{recipe.difficulty}</Badge>}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#2c2416', margin: '0 0 6px', fontWeight: '700', lineHeight: '1.3' }}>
              {recipe.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#9b8e7a', margin: '0 0 12px', lineHeight: '1.5', fontFamily: "'DM Sans', sans-serif" }}>
              {recipe.description?.slice(0, 100)}{recipe.description?.length > 100 ? '…' : ''}
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#b0a090', fontFamily: "'DM Sans', sans-serif" }}>
              {recipe.totalTime && <span>⏰ {recipe.totalTime}</span>}
              {recipe.servings && <span>🍽️ {recipe.servings} servings</span>}
			  <Stars rating={recipe.rating} />
            </div>
          </div>
          <button
            onClick={handleDelete}
            title="Remove from library"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8b89a', fontSize: '18px', padding: '4px', lineHeight: 1, flexShrink: 0 }}
          >
            ×
          </button>
        </div>
        {recipe.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            {recipe.tags.slice(0, 4).map((tag, i) => <Badge key={i} color="sage">{tag}</Badge>)}
          </div>
        )}
      </div>
    </a>
  )
}

export default function LibraryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recipes?t=' + Date.now())
      .then(r => r.json())
      .then(d => { setRecipes(d.recipes); setLoading(false) })
  }, [])

  const filtered = recipes.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase()) ||
    r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id))

  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ed', padding: '36px 16px 80px' }}>

      {/* Nav */}
      <nav style={{ maxWidth: '800px', margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#2c2416', textDecoration: 'none' }}>🍳 RecipeBox</a>
        <a href="/" style={{ fontSize: '13px', color: '#6b4423', fontWeight: '600', textDecoration: 'none', background: '#fff', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e8e0d0' }}>
          + Add Recipe
        </a>
      </nav>

      {/* Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 24px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 36px)', color: '#2c2416', margin: '0 0 16px', fontWeight: '700' }}>
          My Recipe Library
        </h1>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, category, or tag…"
          style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '1px solid #e8e0d0', borderRadius: '12px', background: '#fff', color: '#2c2416', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading && (
          <p style={{ textAlign: 'center', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif" }}>Loading your recipes…</p>
        )}

        {!loading && recipes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#2c2416', marginBottom: '8px' }}>No recipes yet</h2>
            <p style={{ color: '#9b8e7a', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>Paste your first recipe URL to get started.</p>
            <a href="/" style={{ background: 'linear-gradient(135deg, #6b4423, #c17a3a)', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" }}>
              Add your first recipe →
            </a>
          </div>
        )}

        {!loading && recipes.length > 0 && filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif" }}>No recipes match "{search}"</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filtered.map(recipe => (
            <RecipeTile key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}
