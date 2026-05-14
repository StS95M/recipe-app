'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
      <div
        style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #ede8df', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', opacity: deleting ? 0.5 : 1, height: '220px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {recipe.difficulty && <Badge color="terracotta">{recipe.difficulty}</Badge>}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#2c2416', margin: '0 0 6px', fontWeight: '700', lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {recipe.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#9b8e7a', margin: '0 0 10px', lineHeight: '1.5', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {recipe.description}
            </p>
          </div>
          <button onClick={handleDelete} title="Remove from library" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8b89a', fontSize: '18px', padding: '4px', lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
        <div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#b0a090', fontFamily: "'DM Sans', sans-serif", alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
            {recipe.totalTime && <span>⏰ {recipe.totalTime}</span>}
            {recipe.servings && <span>🍽️ {recipe.servings} servings</span>}
            <Stars rating={recipe.rating} />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {recipe.cuisine && <Badge color="cream">{recipe.cuisine}</Badge>}
            {recipe.mealType && <Badge color="sage">{recipe.mealType}</Badge>}
          </div>
        </div>
      </div>
    </a>
  )
}

const DDKeys = ['sort', 'time', 'cuisine', 'diet', 'meal', 'rating'] as const
type DDKey = typeof DDKeys[number]

function Dropdown({ id, label, icon, children }: { id: DDKey; label: string; icon: string; children: React.ReactNode; }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }} id={`wrap-${id}`}>
      <button id={`btn-${id}`} onClick={() => toggleDD(id)} style={{ fontSize: '13px', padding: '0 13px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px', height: '34px', whiteSpace: 'nowrap', cursor: 'pointer', border: '1px solid #e8e0d0', background: '#fff', fontFamily: "'DM Sans', sans-serif", color: '#2c2416' }}>
        <span>{icon}</span> {label} <span style={{ fontSize: '10px', color: '#9b8e7a' }}>▾</span>
      </button>
      <div id={`dd-${id}`} style={{ display: 'none', position: 'absolute', top: '40px', left: 0, background: '#fff', border: '1px solid #e8e0d0', borderRadius: '12px', padding: '6px', zIndex: 50, minWidth: '160px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {children}
      </div>
    </div>
  )
}

function toggleDD(id: DDKey) {
  DDKeys.forEach(k => {
    const el = document.getElementById(`dd-${k}`)
    if (el) el.style.display = k === id ? (el.style.display === 'none' ? 'block' : 'none') : 'none'
  })
}

function closeAllDD() {
  DDKeys.forEach(k => { const el = document.getElementById(`dd-${k}`); if (el) el.style.display = 'none' })
}

function DDItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '8px', fontSize: '13px', color: '#2c2416', fontFamily: "'DM Sans', sans-serif" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#faf8f4'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
      {label}
    </div>
  )
}

function parseMinutes(t: string): number {
  if (!t) return 9999
  const h = t.match(/(\d+)\s*h/i)
  const m = t.match(/(\d+)\s*m/i)
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0) || parseInt(t) || 9999
}

export default function LibraryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date')
  const [sortLabel, setSortLabel] = useState('Sort by')
  const [filterTime, setFilterTime] = useState<string | null>(null)
  const [filterCuisine, setFilterCuisine] = useState<string | null>(null)
  const [filterDiet, setFilterDiet] = useState<string[]>([])
  const [filterMeal, setFilterMeal] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const loadRecipes = useCallback(() => {
    setLoading(true)
    fetch('/api/recipes?t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setRecipes(d.recipes || []); setLoading(false) })
  }, [])

  useEffect(() => {
    loadRecipes()
    const onFocus = () => loadRecipes()
    window.addEventListener('focus', onFocus)
    window.addEventListener('pageshow', onFocus)
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('pageshow', onFocus) }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[id^="dd-"]') && !target.closest('[id^="btn-"]') && !target.closest('#search-wrap')) {
        closeAllDD()
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const activePills: { key: string; label: string }[] = []
  if (filterTime) activePills.push({ key: 'time', label: filterTime })
  if (filterCuisine) activePills.push({ key: 'cuisine', label: filterCuisine })
  if (filterDiet.length) activePills.push({ key: 'diet', label: filterDiet.join(', ') })
  if (filterMeal) activePills.push({ key: 'meal', label: filterMeal })
  if (filterRating) activePills.push({ key: 'rating', label: filterRating })

  const clearFilter = (key: string) => {
    if (key === 'time') setFilterTime(null)
    if (key === 'cuisine') setFilterCuisine(null)
    if (key === 'diet') setFilterDiet([])
    if (key === 'meal') setFilterMeal(null)
    if (key === 'rating') setFilterRating(null)
  }

  const clearAll = () => {
    setFilterTime(null); setFilterCuisine(null); setFilterDiet([])
    setFilterMeal(null); setFilterRating(null)
    setSortBy('date'); setSortLabel('Sort by')
  }

  const filtered = recipes
    .filter(r => {
      if (search && !r.title?.toLowerCase().includes(search.toLowerCase()) &&
        !r.description?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterTime) {
        const mins = parseMinutes(r.totalTime)
        if (filterTime === 'Under 20 min' && mins >= 20) return false
        if (filterTime === 'Under 45 min' && mins >= 45) return false
        if (filterTime === 'Under 1 hour' && mins >= 60) return false
        if (filterTime === '1 hour+' && mins < 60) return false
      }
      if (filterCuisine && r.cuisine !== filterCuisine) return false
      if (filterDiet.length && !filterDiet.every(d => r.diet?.includes(d))) return false
      if (filterMeal && r.mealType !== filterMeal) return false
      if (filterRating) {
        if (filterRating === '4+ stars' && (r.rating || 0) < 4) return false
        if (filterRating === '3+ stars' && (r.rating || 0) < 3) return false
        if (filterRating === 'Unrated' && (r.rating || 0) > 0) return false
      }
      return true
    })
    .sort((a, b) => sortBy === 'rating' ? (b.rating || 0) - (a.rating || 0) : 0)

  const handleDelete = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id))

  const btnStyle: React.CSSProperties = {
    fontSize: '13px', padding: '0 13px', borderRadius: '20px',
    display: 'flex', alignItems: 'center', gap: '5px', height: '34px',
    whiteSpace: 'nowrap', cursor: 'pointer', border: '1px solid #e8e0d0',
    background: '#fff', fontFamily: "'DM Sans', sans-serif", color: '#2c2416'
  }

  const ddStyle: React.CSSProperties = {
    position: 'absolute', top: '40px', left: 0, background: '#fff',
    border: '1px solid #e8e0d0', borderRadius: '12px', padding: '6px',
    zIndex: 50, minWidth: '160px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  }

  const itemStyle: React.CSSProperties = {
    padding: '8px 12px', cursor: 'pointer', borderRadius: '8px',
    fontSize: '13px', color: '#2c2416', fontFamily: "'DM Sans', sans-serif"
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ed', padding: '36px 16px 80px' }}>
      <nav style={{ maxWidth: '900px', margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#2c2416', textDecoration: 'none' }}>🍳 RecipeBox</a>
        <a href="/" style={{ fontSize: '13px', color: '#6b4423', fontWeight: '600', textDecoration: 'none', background: '#fff', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e8e0d0' }}>
          + Add Recipe
        </a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 4vw, 36px)', color: '#2c2416', margin: '0 0 20px', fontWeight: '700' }}>
          My Recipe Library
        </h1>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>

          {/* Search */}
          <div id="search-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #e8e0d0', borderRadius: '20px', background: '#fff', padding: '0 10px', height: '34px', width: searchExpanded ? '200px' : '34px', overflow: 'hidden', transition: 'width 0.3s ease', flexShrink: 0 }}>
            <span onClick={() => { setSearchExpanded(true); setTimeout(() => searchRef.current?.focus(), 50) }} style={{ fontSize: '15px', cursor: 'pointer', flexShrink: 0 }}>🔍</span>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onBlur={() => { if (!search) setSearchExpanded(false) }}
              placeholder="Search…"
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#2c2416', width: searchExpanded ? '150px' : '0', marginLeft: searchExpanded ? '8px' : '0', transition: 'all 0.3s ease', fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          {/* Sort */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button id="btn-sort" onClick={() => toggleDD('sort')} style={btnStyle}>
              ↕ {sortLabel} <span style={{ fontSize: '10px', color: '#9b8e7a' }}>▾</span>
            </button>
            <div id="dd-sort" style={{ ...ddStyle, display: 'none' }}>
              <div style={itemStyle} onClick={() => { setSortBy('date'); setSortLabel('By date'); closeAllDD() }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#faf8f4'} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>By date</div>
              <div style={itemStyle} onClick={() => { setSortBy('rating'); setSortLabel('By rating'); closeAllDD() }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#faf8f4'} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>By rating</div>
            </div>
          </div>

          <div style={{ width: '1px', height: '18px', background: '#e8e0d0', flexShrink: 0 }} />

          {/* Time */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button id="btn-time" onClick={() => toggleDD('time')} style={{ ...btnStyle, ...(filterTime ? { background: '#6b4423', color: '#fff', borderColor: '#6b4423' } : {}) }}>
              ⏱ Time <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
            </button>
            <div id="dd-time" style={{ ...ddStyle, display: 'none' }}>
              {['Under 20 min', 'Under 45 min', 'Under 1 hour', '1 hour+'].map(t => (
                <div key={t} style={itemStyle} onClick={() => { setFilterTime(t); closeAllDD() }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#faf8f4'} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>{t}</div>
              ))}
            </div>
          </div>

          {/* Cuisine */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button id="btn-cuisine" onClick={() => toggleDD('cuisine')} style={{ ...btnStyle, ...(filterCuisine ? { background: '#6b4423', color: '#fff', borderColor: '#6b4423' } : {}) }}>
              🌍 Cuisine <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
            </button>
            <div id="dd-cuisine" style={{ ...ddStyle, display: 'none' }}>
              {['Italian', 'Asian', 'Bavarian', 'Mediterranean', 'French', 'Mexican', 'Other'].map(c => (
                <div key={c} style={itemStyle} onClick={() => { setFilterCuisine(c); closeAllDD() }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#faf8f4'} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>{c}</div>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button id="btn-diet" onClick={() => toggleDD('diet')} style={{ ...btnStyle, ...(filterDiet.length ? { background: '#6b4423', color: '#fff', borderColor: '#6b4423' } : {}) }}>
              🥗 Diet <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
            </button>
            <div id="dd-diet" style={{ ...ddStyle, display: 'none' }}>
              {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free'].map(d => (
                <label key={d} style={{ ...itemStyle, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={e => (e.currentTarget as HTMLLabelElement).style.background = '#faf8f4'} onMouseLeave={e => (e.currentTarget as HTMLLabelElement).style.background = 'transparent'}>
                  <input type="checkbox" checked={filterDiet.includes(d)} onChange={e => setFilterDiet(prev => e.target.checked ? [...prev, d] : prev.filter(x => x !== d))} />
                  {d}
                </label>
              ))}
            </div>
          </div>

          {/* Meal */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button id="btn-meal" onClick={() => toggleDD('meal')} style={{ ...btnStyle, ...(filterMeal ? { background: '#6b4423', color: '#fff', borderColor: '#6b4423' } : {}) }}>
              🍽️ Meal <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
            </button>
            <div id="dd-meal" style={{ ...ddStyle, display: 'none' }}>
              {['Breakfast', 'Lunch & Dinner', 'Snack', 'Dessert', 'Soup'].map(m => (
                <div key={m} style={itemStyle} onClick={() => { setFilterMeal(m); closeAllDD() }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#faf8f4'} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>{m}</div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button id="btn-rating" onClick={() => toggleDD('rating')} style={{ ...btnStyle, ...(filterRating ? { background: '#6b4423', color: '#fff', borderColor: '#6b4423' } : {}) }}>
              ⭐ Rating <span style={{ fontSize: '10px', opacity: 0.7 }}>▾</span>
            </button>
            <div id="dd-rating" style={{ ...ddStyle, display: 'none' }}>
              {[['4+ stars', '⭐⭐⭐⭐ 4+ stars'], ['3+ stars', '⭐⭐⭐ 3+ stars'], ['Unrated', 'Unrated']].map(([val, lbl]) => (
                <div key={val} style={itemStyle} onClick={() => { setFilterRating(val); closeAllDD() }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#faf8f4'} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>{lbl}</div>
              ))}
            </div>
          </div>

          {activePills.length > 1 && (
            <button onClick={clearAll} style={{ fontSize: '12px', color: '#9b8e7a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Clear all
            </button>
          )}
        </div>

        {/* Active pills */}
        {activePills.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {activePills.map(p => (
              <span key={p.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f5e6dc', color: '#8b3a1a', fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {p.label}
                <button onClick={() => clearFilter(p.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b3a1a', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        {loading && <p style={{ textAlign: 'center', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif" }}>Loading your recipes…</p>}

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
          <p style={{ textAlign: 'center', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif" }}>No recipes match your filters.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map(recipe => (
            <RecipeTile key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}
