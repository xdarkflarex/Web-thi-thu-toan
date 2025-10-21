import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

type UserRole = 'admin' | 'teacher' | 'student'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const headerStore = await headers()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
      headers: {
        get(name: string) {
          return headerStore.get(name) ?? undefined
        },
      },
    }
  )
}

export async function getSessionUserAndRole() {
  const supabase = await createSupabaseServerClient()
  const authHeader = (await headers()).get('authorization')
  
  console.log('getSessionUserAndRole - authHeader:', authHeader)
  
  let user: any = null
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7)
    console.log('Using Bearer token for auth')
    const { data } = await supabase.auth.getUser(token)
    user = data.user
  } else {
    console.log('Using cookie-based auth')
    const result = await supabase.auth.getUser()
    user = result.data.user
  }
  
  console.log('getSessionUserAndRole - user:', user ? { id: user.id, email: user.email } : null)
  
  if (!user) return { user: null, role: null as null | UserRole }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  console.log('getSessionUserAndRole - profile:', profile, 'error:', profileError)
  
  return { user, role: (profile?.role as UserRole) ?? null }
}

export async function requireRole(roles: UserRole[]) {
  const { user, role } = await getSessionUserAndRole()
  if (!user || !role || !roles.includes(role)) {
    throw new Error('Forbidden')
  }
  return { user, role }
}


