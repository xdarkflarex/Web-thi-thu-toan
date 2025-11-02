import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

type UserRole = 'admin' | 'teacher' | 'student'

interface UseAuthOptions {
  /** Array of allowed roles. If not provided, defaults to ['teacher', 'admin'] */
  allowedRoles?: UserRole[]
  /** Redirect path when authentication fails. Defaults to '/auth/sign-in' */
  redirectTo?: string
  /** Whether to require authentication at all. Defaults to true */
  requireAuth?: boolean
}

interface UseAuthReturn {
  /** Whether the authentication check is still in progress */
  isCheckingAuth: boolean
  /** The authenticated user, or null if not authenticated */
  user: User | null
  /** The user's role, or null if not authenticated or role not found */
  role: UserRole | null
}

/**
 * Custom hook to check authentication and role-based access control
 * 
 * @param options Configuration options for authentication check
 * @returns Object containing authentication state
 * 
 * @example
 * // Check for teacher/admin role (default)
 * const { isCheckingAuth, user, role } = useAuth()
 * 
 * @example
 * // Check for specific roles
 * const { isCheckingAuth, user, role } = useAuth({ allowedRoles: ['admin'] })
 * 
 * @example
 * // Only check authentication, no role requirement
 * const { isCheckingAuth, user, role } = useAuth({ requireAuth: true, allowedRoles: [] })
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const {
    allowedRoles = ['teacher', 'admin'],
    redirectTo = '/auth/sign-in',
    requireAuth = true,
  } = options

  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          if (requireAuth) {
            router.replace(redirectTo)
            return
          } else {
            setIsCheckingAuth(false)
            return
          }
        }

        setUser(authUser)

        // If no role requirement, skip role check
        if (allowedRoles.length === 0) {
          setIsCheckingAuth(false)
          return
        }

        // Check user role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()

        if (profileError || !profile) {
          if (requireAuth) {
            router.replace(redirectTo)
            return
          } else {
            setIsCheckingAuth(false)
            return
          }
        }

        const userRole = profile.role as UserRole | null
        setRole(userRole)

        // Check if user has required role
        if (userRole && allowedRoles.includes(userRole)) {
          setIsCheckingAuth(false)
        } else {
          if (requireAuth) {
            router.replace(redirectTo)
            return
          } else {
            setIsCheckingAuth(false)
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        if (requireAuth) {
          router.replace(redirectTo)
        } else {
          setIsCheckingAuth(false)
        }
      }
    }

    checkAuth()
  }, [router, allowedRoles, redirectTo, requireAuth])

  return { isCheckingAuth, user, role }
}

