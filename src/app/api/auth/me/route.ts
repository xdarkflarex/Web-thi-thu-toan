import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserAndRole, createSupabaseServerClient } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, role } = await getSessionUserAndRole()
    
    if (!user) {
      return NextResponse.json(
        { success: false, user: null, role: null, language: null, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user profile to get language preference
    const supabase = await createSupabaseServerClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('language')
      .eq('id', user.id)
      .single()

    const language = (profile?.language as 'vi' | 'en') || 'vi'

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      role,
      language,
      message: 'success',
    })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json(
      { success: false, user: null, role: null, language: null, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update user profile (currently only supports language)
export async function PATCH(request: NextRequest) {
  try {
    const { user } = await getSessionUserAndRole()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const supabase = await createSupabaseServerClient()

    const updateData: { language?: 'vi' | 'en' } = {}
    if (body.language && (body.language === 'vi' || body.language === 'en')) {
      updateData.language = body.language
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      language: data.language,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

