'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Recipe } from '@/lib/types'
import RecipeCard from '@/components/RecipeCard'

const LOADING_STEPS = [
  'Fetching the recipe page…',
  'Reading ingredients & instructions…',
  'Structuring the recipe…',
  'Almost done!',
]

export default function HomePage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState('')
  const [stepIdx, setStepIdx] = useState(0)

  const handleExtract = async () => {
    if (!url.trim()) return
    setState('loading')
    setError('')
    setRecipe(null)
    setStepIdx(0)

    const interval = setInterval(() => {
      setStepIdx(s => Math.min(s + 1, LOADING_STEPS.length - 1))
    }, 5000)

    try {
      const res = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await res.json()

     if (!res.ok) {
	  if (data.error === 'no_recipe') {
		setError('This page does not appear to contain a recipe. Please try a different URL.')
	  } else {
		throw new Error(data.error || 'Something went wrong')
	  }
	  setState('error')
	  return
	}

      setRecipe(data.recipe)
      setState('success')
    } catch (e: any) {
      setError(e.message)
      setState('error')
    } finally {
      clearInterval(interval)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ed', padding: '36px 16px 80px' }}>

      {/* Nav */}
      <nav style={{ maxWidth: '680px', margin: '0 auto 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700', color: '#2c2416' }}>🍳 RecipeBox</span>
        <a href="/library" style={{ fontSize: '13px', color: '#6b4423', fontWeight: '600', textDecoration: 'none', background: '#fff', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e8e0d0' }}>
          My Library →
        </a>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 48px)', color: '#2c2416', margin: '0 0 10px', fontWeight: '700' }}>
          Save any recipe,<br />from anywhere.
        </h1>
        <p style={{ color: '#7a6a52', fontSize: '16px', margin: 0, maxWidth: '420px', marginInline: 'auto', lineHeight: '1.6' }}>
          Paste a URL — we fetch the page, extract the recipe, and save it to your library automatically.
        </p>
      </div>

      {/* URL Input */}
      <div style={{ maxWidth: '680px', margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#fff', borderRadius: '16px', padding: '8px', boxShadow: '0 2px 20px rgba(0,0,0,0.07)', border: '1px solid #e8e0d0' }}>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleExtract()}
            placeholder="https://www.allrecipes.com/recipe/..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#2c2416', background: 'transparent', padding: '10px 14px', fontFamily: "'DM Sans', sans-serif" }}
          />
          <button
            onClick={handleExtract}
            disabled={state === 'loading' || !url.trim()}
            style={{
              background: state === 'loading' ? '#c8b89a' : 'linear-gradient(135deg, #6b4423, #c17a3a)',
              color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px',
              fontSize: '14px', fontWeight: '600', cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: 'opacity 0.2s'
            }}
          >
            {state === 'loading' ? 'Extracting…' : 'Extract Recipe →'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#b0a090', marginTop: '10px' }}>
          Works with AllRecipes, BBC Good Food, Serious Eats, Chefkoch, Kochkarussell & more
        </p>
      </div>

      {/* Loading */}
      {state === 'loading' && (
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #e8e0d0', borderTop: '3px solid #c17a3a', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: '#6b4423', fontSize: '15px', fontWeight: '500', animation: 'pulse 1.5s ease infinite', margin: '0 0 6px' }}>
            {LOADING_STEPS[stepIdx]}
          </p>
          <p style={{ color: '#b0a090', fontSize: '12px' }}>Usually takes 10–20 seconds</p>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div style={{ maxWidth: '680px', margin: '0 auto 24px', background: '#fff5f5', border: '1px solid #fbd0cc', borderRadius: '12px', padding: '18px 22px', color: '#8b2020', fontSize: '14px', lineHeight: '1.6' }}>
          ⚠️ <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success */}
      {state === 'success' && recipe && (
        <div>
          <p style={{ textAlign: 'center', color: '#4a7c4e', fontSize: '14px', marginBottom: '20px', fontWeight: '600' }}>
            ✅ Recipe saved to your library!
          </p>
          <RecipeCard recipe={recipe} />
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => { setState('idle'); setUrl(''); setRecipe(null); }}
              style={{ background: 'transparent', border: '1px solid #c8b89a', borderRadius: '20px', padding: '10px 24px', color: '#6b4423', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginRight: '12px', fontFamily: "'DM Sans', sans-serif" }}
            >
              Add another
            </button>
            <a href="/library" style={{ background: 'linear-gradient(135deg, #6b4423, #c17a3a)', borderRadius: '20px', padding: '10px 24px', color: '#fff', fontSize: '13px', fontWeight: '600', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
              Go to Library →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
