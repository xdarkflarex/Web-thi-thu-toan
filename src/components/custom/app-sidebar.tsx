"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Home, Layers3, Settings, Users2, FolderTree } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AppSidebar() {
  const { t } = useTranslation(['common', 'navigation']);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  type Role = 'admin' | 'teacher' | 'student'
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // First try to get user from Supabase client
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          // It's normal to not have a session when logged out, so only log non-session errors
          if (authError.name !== 'AuthSessionMissingError') {
            console.error('Error getting user:', authError);
          }
          if (mounted) {
            setIsAuthed(false);
            setEmail("");
            setRole(null);
          }
          return;
        }
        
        if (mounted) {
          const user = authData.user;
          const isAuthenticated = !!user;
          setIsAuthed(isAuthenticated);
          setEmail(user?.email ?? "");
          
          if (!isAuthenticated) {
            setRole(null);
            return;
          }

          // Try fetching role from API first (more reliable with server-side auth)
          try {
            const res = await fetch('/api/auth/me', {
              credentials: 'include',
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.role && mounted) {
                const validRole = data.role === 'admin' || data.role === 'teacher' || data.role === 'student' 
                  ? data.role as Role 
                  : null;
                setRole(validRole);
                if (!validRole && data.role) {
                  console.warn('Invalid role value from API:', data.role);
                }
                return;
              }
            }
          } catch {
            // Silently fall back to direct query
          }

          // Fallback: try direct Supabase query
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile directly:', profileError);
            console.error('User ID:', user.id);
            console.error('Profile error details:', {
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              code: profileError.code
            });
            
            if (mounted) {
              setRole(null);
            }
          } else {
            const r = profile?.role as string | undefined;
            if (mounted) {
              const validRole = r === 'admin' || r === 'teacher' || r === 'student' ? r as Role : null;
              setRole(validRole);
              if (!validRole && r) {
                console.warn('Invalid role value:', r, 'Expected: admin, teacher, or student');
              }
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error in sidebar init:', error);
        if (mounted) {
          setIsAuthed(false);
          setRole(null);
        }
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        const user = session?.user ?? null;
        setIsAuthed(!!user);
        setEmail(user?.email ?? "");
        
        // When user logs out, clear role immediately
        if (!user || event === 'SIGNED_OUT') {
          setRole(null);
          return;
        }
        
        if (user) {
          // Try fetching role from API first
          try {
            const res = await fetch('/api/auth/me', {
              credentials: 'include',
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.role) {
                const validRole = data.role === 'admin' || data.role === 'teacher' || data.role === 'student' 
                  ? data.role as Role 
                  : null;
                setRole(validRole);
                return;
              }
            }
          } catch {
            // Silently fall back to direct query
          }
          
          // Fallback: try direct Supabase query
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            // Don't log errors for expected cases (like user not found after logout)
            if (profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
              console.error('Error fetching profile on auth change:', profileError);
            }
            setRole(null);
          } else {
            const r = profile?.role as string | undefined;
            const validRole = r === 'admin' || r === 'teacher' || r === 'student' ? r as Role : null;
            setRole(validRole);
            if (!validRole && r) {
              console.warn('Invalid role value on auth change:', r);
            }
          }
        }
      } catch (error) {
        // Only log unexpected errors, not session-related ones
        if (error instanceof Error && error.name !== 'AuthSessionMissingError') {
          console.error('Unexpected error in auth state change:', error);
        }
        setRole(null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!isAuthed) return null;

  const items = [
    { title: t('home', { ns: 'navigation' }), url: "/", icon: Home, show: true },
    { title: t('questions', { ns: 'navigation' }), url: "/question", icon: Layers3, show: role === 'teacher' || role === 'admin' },
    { title: t('categories', { ns: 'navigation' }), url: "/teacher/categories", icon: FolderTree, show: role === 'teacher' || role === 'admin' },
    { title: t('students', { ns: 'navigation' }), url: "/student", icon: Users2, show: true },
    { title: t('calendar', { ns: 'navigation' }), url: "/examples/tree", icon: Calendar, show: true },
    { title: t('settings', { ns: 'navigation' }), url: "/teacher", icon: Settings, show: role === 'teacher' || role === 'admin' },
  ];
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('menu')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.filter((i) => i.show).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2 px-2 py-1">
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate" title={email}>{email}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.assign("/auth/sign-in");
              }}
            >
              {t('logout', { ns: 'navigation' })}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
