import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

type UserRole = 'admin' | 'teacher' | 'student'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function getSessionUserAndRole() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null as null | UserRole }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return { user, role: (profile?.role as UserRole) ?? null }
}

export async function requireRole(roles: UserRole[]) {
  const { user, role } = await getSessionUserAndRole()
  if (!user || !role || !roles.includes(role)) {
    throw new Error('Forbidden')
  }
  return { user, role }
}


