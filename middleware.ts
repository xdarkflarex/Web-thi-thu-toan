import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Debug: Always log when middleware runs - THIS MUST APPEAR
  console.log('========================================')
  console.log('🔵 [Middleware] START - Path:', path)
  console.log('🔵 [Middleware] URL:', req.url)
  console.log('========================================')
  
  const res = NextResponse.next()
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/auth/sign-in',
    '/auth',
    '/exam/guest',
    '/student', // Student exam page is public (không cần đăng nhập)
  ]
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route + '/'))

  // For API routes, let them handle their own authentication (they return JSON, not redirects)
  if (path.startsWith('/api/')) {
    console.log('🔵 [Middleware] API route, skipping auth check')
    return res
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    console.log('🔵 [Middleware] Public route, allowing access:', path)
    return res
  }

  // Create Supabase client for authentication check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: Record<string, unknown>) {
          res.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('🔵 [Middleware] User check - Path:', path, 'User:', user ? `exists (${user.email})` : 'NONE')

  // If not a public route and no user, redirect to login
  if (!user) {
    console.log('❌ [Middleware] REDIRECTING - No user for path:', path)
    const redirectUrl = new URL('/auth/sign-in', req.url)
    redirectUrl.searchParams.set('redirected', 'true')
    redirectUrl.searchParams.set('from', path)
    const response = NextResponse.redirect(redirectUrl, 307)
    console.log('❌ [Middleware] Redirect URL:', redirectUrl.toString())
    return response
  }

  console.log('✅ [Middleware] User authenticated, allowing access to:', path)
    
  // Continue with role-based checks for specific routes
  // Protect /teacher and /admin routes
  if (path.startsWith('/teacher') || path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = profile?.role as 'admin' | 'teacher' | 'student' | undefined
    if (path.startsWith('/admin')) {
      if (role !== 'admin') {
        console.log('[Middleware] User does not have admin role, redirecting from', path)
        const redirectUrl = new URL('/auth/sign-in', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    } else if (path.startsWith('/teacher')) {
      if (role !== 'teacher' && role !== 'admin') {
        console.log('[Middleware] User does not have teacher/admin role, redirecting from', path)
        const redirectUrl = new URL('/auth/sign-in', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // Protect /question routes - listing, create, and edit all require authentication
  if (path.startsWith('/question')) {
    // For create and edit, require teacher/admin role
    if (path.startsWith('/question/create') || path.startsWith('/question/edit')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = profile?.role as 'admin' | 'teacher' | 'student' | undefined
      if (role !== 'teacher' && role !== 'admin') {
        console.log('[Middleware] User does not have teacher/admin role for question route, redirecting from', path)
        const redirectUrl = new URL('/auth/sign-in', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
    // For /question listing page, also require teacher/admin role
    else if (path === '/question' || path === '/question/') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = profile?.role as 'admin' | 'teacher' | 'student' | undefined
      if (role !== 'teacher' && role !== 'admin') {
        console.log('[Middleware] User does not have teacher/admin role for question route, redirecting from', path)
        const redirectUrl = new URL('/auth/sign-in', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // Protect /examples routes (admin/developer tools)
  // User check already done above for all non-public routes

  return res
}

export const config = {
  // Run on all routes so Supabase can sync auth cookies for API and pages
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}


