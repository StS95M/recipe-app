'use client'

import { useState } from 'react'
import { Recipe } from '@/lib/types'
import Badge from './Badge'
import StarRating from './StarRating'

function MetaCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: '#faf8f4', border: '1px solid #e8e0d0', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', flex: '1', minWidth: '65px' }}>
      <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: '700', color: '#2c2416', fontFamily: "'Playfair Display', serif" }}>{value || '—'}</div>
      <div style={{ fontSize: '10px', color: '#9b8e7a', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>{label}</div>
    </div>
  )
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [tab, setTab] = useState<'ingredients' | 'instructions'>('ingredients')
  const fmt = (v: string) => v?.replace(/ minutes?/i, 'm').replace(/ hours?/i, 'h') || '—'

  return (
    <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.08)', border: '1px solid #ede8df', maxWidth: '680px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3d2b1a 0%, #6b4423 50%, #8b5e3c 100%)', padding: '28px 28px 24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {recipe.category && <Badge color="cream">{recipe.category}</Badge>}
          {recipe.difficulty && <Badge color="terracotta">{recipe.difficulty}</Badge>}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 4vw, 30px)', color: '#fff', margin: '0 0 8px', lineHeight: '1.25', fontWeight: '700' }}>
          {recipe.title}
        </h1>
        {recipe.description && (
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '14px', margin: 0, lineHeight: '1.6', fontFamily: "'DM Sans', sans-serif" }}>
            {recipe.description}
          </p>
        )}
		<StarRating recipeId={recipe.id} initialRating={recipe.rating} />
      </div>

      {/* Meta */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0ebe2' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <MetaCard icon="⏱️" label="Prep"   value={fmt(recipe.prepTime)} />
          <MetaCard icon="🔥" label="Cook"   value={fmt(recipe.cookTime)} />
          <MetaCard icon="⏰" label="Total"  value={fmt(recipe.totalTime)} />
          <MetaCard icon="🍽️" label="Serves" value={recipe.servings} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f0ebe2' }}>
        {(['ingredients', 'instructions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '13px', background: 'none', border: 'none',
            borderBottom: tab === t ? '2px solid #6b4423' : '2px solid transparent',
            color: tab === t ? '#6b4423' : '#9b8e7a',
            fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: '600',
            textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer',
            marginBottom: '-1px', transition: 'all 0.2s'
          }}>
            {t === 'ingredients'
              ? `🥕 Ingredients (${recipe.ingredients?.length || 0})`
              : `📋 Instructions (${recipe.instructions?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {tab === 'ingredients' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recipe.ingredients?.map((ing, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', background: i % 2 === 0 ? '#faf8f4' : 'transparent', borderRadius: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c17a3a', flexShrink: 0 }} />
                <span style={{ fontWeight: '700', color: '#6b4423', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', minWidth: '80px' }}>
                  {ing.amount} {ing.unit}
                </span>
                <span style={{ color: '#2c2416', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                  {ing.item}
                </span>
              </div>
            ))}
          </div>
        )}
        {tab === 'instructions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recipe.instructions?.map((inst, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #6b4423, #c17a3a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                  {inst.step}
                </div>
                <p style={{ margin: '5px 0 0', color: '#3d3226', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', lineHeight: '1.7' }}>
                  {inst.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #f0ebe2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {recipe.tags?.map((tag, i) => <Badge key={i} color="sage">{tag}</Badge>)}
        </div>
        <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '12px', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', borderBottom: '1px dotted #c8b89a' }}>
          View original →
        </a>
      </div>
    </div>
  )
}
