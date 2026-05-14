'use client'

import { useState } from 'react'

interface Props {
  recipeId: string
  initialRating: number
}

export default function StarRating({ recipeId, initialRating }: Props) {
  const [rating, setRating] = useState(initialRating || 0)
  console.log('StarRating initialRating:', initialRating)
  const [hover, setHover] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleRate = async (star: number) => {
    setSaving(true)
    setRating(star)
    await fetch(`/api/recipes/${recipeId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: star })
    })
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          disabled={saving}
          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '22px',
            padding: '2px',
            lineHeight: 1,
            transition: 'transform 0.1s',
            transform: hover === star ? 'scale(1.2)' : 'scale(1)',
            filter: (hover || rating) >= star ? 'none' : 'grayscale(1) opacity(0.3)',
          }}
        >
          ⭐
        </button>
      ))}
      {rating > 0 && (
        <span style={{ fontSize: '12px', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif", marginLeft: '4px' }}>
          {saving ? 'Saving…' : `${rating}/5`}
        </span>
      )}
    </div>
  )
}
