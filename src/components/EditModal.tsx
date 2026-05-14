'use client'

import { useState } from 'react'
import { Recipe, Ingredient, Instruction } from '@/lib/types'

interface Props {
  recipe: Recipe
  onClose: () => void
  onSave: (updated: Recipe) => void
}

const UNITS = [
  { group: 'Count', options: ['—', 'piece', 'pinch', 'slice', 'clove', 'handful'] },
  { group: 'Volume', options: ['ml', 'l', 'tsp', 'tbsp', 'cup', 'fl oz'] },
  { group: 'Weight', options: ['g', 'kg', 'oz', 'lb'] },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e8e0d0',
  borderRadius: '8px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: '#2c2416',
  background: '#fff',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 500,
  color: '#9b8e7a',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '6px',
  fontFamily: "'DM Sans', sans-serif",
}

function UnitSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, width: '100px', flexShrink: 0, cursor: 'pointer' }}
    >
      {UNITS.map(group => (
        <optgroup key={group.group} label={group.group}>
          {group.options.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

export default function EditModal({ recipe, onClose, onSave }: Props) {
  const [tab, setTab] = useState<'info' | 'ingredients' | 'instructions'>('info')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(recipe.title || '')
  const [description, setDescription] = useState(recipe.description || '')
  const parseMinutes = (v: string) => parseInt(v?.replace(/[^0-9]/g, '')) || 0
  const [prepMins, setPrepMins] = useState(parseMinutes(recipe.prepTime))
  const [cookMins, setCookMins] = useState(parseMinutes(recipe.cookTime))
  const [servings, setServings] = useState(recipe.servings || '')
  const [difficulty, setDifficulty] = useState(recipe.difficulty || 'Easy')
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe.ingredients || [])
  const [instructions, setInstructions] = useState<Instruction[]>(recipe.instructions || [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const updated: Recipe = {
        ...recipe,
        title, description,
        prepTime: prepMins + ' minutes',
        cookTime: cookMins + ' minutes',
        totalTime: (prepMins + cookMins) + ' minutes',
        servings, difficulty, ingredients, instructions,
      }
      const res = await fetch(`/api/recipes/${recipe.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error('Save failed')
      onSave(updated)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const updateIngredient = (i: number, field: keyof Ingredient, value: string) => {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  const addIngredient = () => {
    setIngredients(prev => [...prev, { amount: '', unit: '—', item: '' }])
  }

  const removeIngredient = (i: number) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateInstruction = (i: number, text: string) => {
    setInstructions(prev => prev.map((inst, idx) => idx === i ? { ...inst, text } : inst))
  }

  const addInstruction = () => {
    setInstructions(prev => [...prev, { step: prev.length + 1, text: '' }])
  }

  const removeInstruction = (i: number) => {
    setInstructions(prev =>
      prev.filter((_, idx) => idx !== i).map((inst, idx) => ({ ...inst, step: idx + 1 }))
    )
  }

  const tabs = [
    { id: 'info' as const, label: 'Info' },
    { id: 'ingredients' as const, label: 'Ingredients' },
    { id: 'instructions' as const, label: 'Instructions' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #f0ebe2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#2c2416', margin: 0, fontWeight: 700 }}>Edit Recipe</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9b8e7a', padding: '4px' }}>×</button>
          </div>
          <div style={{ display: 'flex' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: tab === t.id ? '2px solid #6b4423' : '2px solid transparent',
                color: tab === t.id ? '#6b4423' : '#9b8e7a',
                fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px'
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Info tab */}
          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
              </div>
              <div style={{ borderTop: '1px solid #f0ebe2', paddingTop: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Prep time</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="number" min={0} value={prepMins} onChange={e => setPrepMins(parseInt(e.target.value) || 0)}
                        style={{ ...inputStyle, width: '70px' }} />
                      <span style={{ fontSize: '13px', color: '#9b8e7a', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>min</span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Cook time</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="number" min={0} value={cookMins} onChange={e => setCookMins(parseInt(e.target.value) || 0)}
                        style={{ ...inputStyle, width: '70px' }} />
                      <span style={{ fontSize: '13px', color: '#9b8e7a', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>min</span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Total time</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ ...inputStyle, width: '70px', background: '#f7f3ed', color: '#9b8e7a', textAlign: 'center' as const }}>
                        {prepMins + cookMins}
                      </div>
                      <span style={{ fontSize: '13px', color: '#9b8e7a', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>min</span>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Servings</label>
                    <input type="number" min={1} value={servings} onChange={e => setServings(e.target.value)}
                      placeholder="4" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Ingredients tab */}
          {tab === 'ingredients' && (
            <div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', paddingRight: '28px' }}>
                <span style={{ ...labelStyle, width: '60px', flexShrink: 0, marginBottom: 0 }}>Amt</span>
                <span style={{ ...labelStyle, width: '100px', flexShrink: 0, marginBottom: 0 }}>Unit</span>
                <span style={{ ...labelStyle, flex: 1, marginBottom: 0 }}>Ingredient</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)}
                      placeholder="1" style={{ ...inputStyle, width: '60px', flexShrink: 0 }} />
                    <UnitSelect value={ing.unit || '—'} onChange={v => updateIngredient(i, 'unit', v)} />
                    <input value={ing.item} onChange={e => updateIngredient(i, 'item', e.target.value)}
                      placeholder="ingredient" style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={() => removeIngredient(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8b89a', fontSize: '18px', flexShrink: 0, padding: '4px' }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={addIngredient} style={{ marginTop: '12px', width: '100%', padding: '10px', border: '1px dashed #e8e0d0', borderRadius: '8px', background: 'none', cursor: 'pointer', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500 }}>
                + Add ingredient
              </button>
            </div>
          )}

          {/* Instructions tab */}
          {tab === 'instructions' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {instructions.map((inst, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6b4423, #c17a3a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '8px' }}>
                      {inst.step}
                    </div>
                    <textarea value={inst.text} onChange={e => updateInstruction(i, e.target.value)} rows={2}
                      style={{ ...inputStyle, flex: 1, resize: 'vertical', lineHeight: '1.6' }} />
                    <button onClick={() => removeInstruction(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8b89a', fontSize: '18px', flexShrink: 0, padding: '4px', marginTop: '4px' }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={addInstruction} style={{ marginTop: '12px', width: '100%', padding: '10px', border: '1px dashed #e8e0d0', borderRadius: '8px', background: 'none', cursor: 'pointer', color: '#9b8e7a', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500 }}>
                + Add step
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ebe2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error
            ? <span style={{ fontSize: '13px', color: '#8b2020' }}>⚠️ {error}</span>
            : <span />
          }
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e8e0d0', borderRadius: '8px', background: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#9b8e7a', fontWeight: 500 }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: saving ? '#c8b89a' : 'linear-gradient(135deg, #6b4423, #c17a3a)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600 }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
