import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth'
import { requireRole } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

interface Category {
  id: string
  parent_id: string | null
  slug: string
  name_en: string
  name_vi: string
  description: string | null
  icon: string | null
  color: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  children?: Category[]
}

function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<string, Category>()
  const roots: Category[] = []
  
  // Create map with children arrays
  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] })
  })
  
  // Build tree structure
  categories.forEach(cat => {
    const node = map.get(cat.id)!
    if (cat.parent_id) {
      const parent = map.get(cat.parent_id)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(node)
      } else {
        // Parent not found, treat as root
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  })
  
  // Sort each level by sort_order
  const sortTree = (nodes: Category[]): Category[] => {
    return nodes
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(node => ({
        ...node,
        children: node.children ? sortTree(node.children) : []
      }))
  }
  
  return sortTree(roots)
}

// GET - Fetch all categories as tree
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    // Build tree structure
    const tree = buildCategoryTree(data || [])
    
    return NextResponse.json({
      statusCode: 200,
      success: true,
      data: tree,
      message: 'success',
    })
  } catch (error: unknown) {
    console.error('Error fetching categories:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch categories'
    return NextResponse.json(
      { statusCode: 500, success: false, data: null, message },
      { status: 500 }
    )
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole(['teacher', 'admin'])
    const body = await request.json()
    
    // Use admin client to bypass RLS (similar to QuestionService)
    // We've already verified the user has the correct role via requireRole
    const client = supabaseAdmin || await createSupabaseServerClient()
    
    const { data, error } = await client
      .from('categories')
      .insert({
        slug: body.slug,
        name_en: body.name_en,
        name_vi: body.name_vi,
        parent_id: body.parent_id || null,
        description: body.description || null,
        icon: body.icon || null,
        color: body.color || null,
        sort_order: body.sort_order || 0,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(
      { statusCode: 201, success: true, data, message: 'Category created' },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error creating category:', error)
    const message = error instanceof Error ? error.message : 'Failed to create category'
    const status = message === 'Forbidden' ? 401 : 500
    return NextResponse.json(
      { statusCode: status, success: false, data: null, message },
      { status }
    )
  }
}

