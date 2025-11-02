import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserAndRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { user, role } = await getSessionUserAndRole()
    
    if (!user) {
      return NextResponse.json(
        { success: false, user: null, role: null, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      role,
      message: 'success',
    })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json(
      { success: false, user: null, role: null, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

