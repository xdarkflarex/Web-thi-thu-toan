import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Debug logging for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    console.log('Middleware running on API route:', req.nextUrl.pathname)
    console.log('Request cookies:', Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value])))
  }
  
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

  const url = req.nextUrl
  const path = url.pathname

  // Protect /teacher and /admin
  if (path.startsWith('/teacher') || path.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = profile?.role as 'admin' | 'teacher' | 'student' | undefined
    if (path.startsWith('/admin')) {
      if (role !== 'admin') {
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    } else if (path.startsWith('/teacher')) {
      if (role !== 'teacher' && role !== 'admin') {
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

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


