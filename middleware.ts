import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set() {},
        remove() {},
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
  matcher: ['/teacher/:path*', '/admin/:path*'],
}


