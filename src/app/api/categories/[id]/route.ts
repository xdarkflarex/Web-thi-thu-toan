import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth'
import { requireRole } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Get single category
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      statusCode: 200,
      success: true,
      data,
      message: 'success',
    })
  } catch (error: unknown) {
    console.error('Error fetching category:', error)
    const message = error instanceof Error ? error.message : 'Not found'
    return NextResponse.json(
      { statusCode: 404, success: false, data: null, message },
      { status: 404 }
    )
  }
}

// PATCH - Update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['teacher', 'admin'])
    const { id } = await params
    const body = await req.json()
    
    // Use admin client to bypass RLS (similar to QuestionService)
    const client = supabaseAdmin || await createSupabaseServerClient()
    
    const updateData: any = {}
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.name !== undefined) updateData.name = body.name
    if (body.parent_id !== undefined) updateData.parent_id = body.parent_id || null
    if (body.description !== undefined) updateData.description = body.description
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.color !== undefined) updateData.color = body.color
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    
    const { data, error } = await client
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      statusCode: 200,
      success: true,
      data,
      message: 'Category updated',
    })
  } catch (error: unknown) {
    console.error('Error updating category:', error)
    const message = error instanceof Error ? error.message : 'Failed to update category'
    const status = message === 'Forbidden' ? 401 : 500
    return NextResponse.json(
      { statusCode: status, success: false, data: null, message },
      { status }
    )
  }
}

// DELETE - Soft delete category (set is_active = false)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['teacher', 'admin'])
    const { id } = await params
    
    // Use admin client to bypass RLS (similar to QuestionService)
    const client = supabaseAdmin || await createSupabaseServerClient()
    
    // Check if category has questions
    const { count } = await client
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
    
    if (count && count > 0) {
      return NextResponse.json(
        {
          statusCode: 400,
          success: false,
          data: null,
          message: 'Cannot delete category with existing questions',
        },
        { status: 400 }
      )
    }
    
    // Soft delete by setting is_active = false
    const { error } = await client
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({
      statusCode: 200,
      success: true,
      data: null,
      message: 'Category deleted',
    })
  } catch (error: unknown) {
    console.error('Error deleting category:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete category'
    const status = message === 'Forbidden' ? 401 : 500
    return NextResponse.json(
      { statusCode: status, success: false, data: null, message },
      { status }
    )
  }
}

