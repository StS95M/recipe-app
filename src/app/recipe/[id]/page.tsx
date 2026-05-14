import { getRecipeById } from '@/lib/storage'
import RecipeCard from '@/components/RecipeCard'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipeById(params.id)
  if (!recipe) notFound()

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
