"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Home, Layers3, Settings, Users2 } from "lucide-react";
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
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        const user = data.user;
        setIsAuthed(!!user);
        setEmail(user?.email ?? "");
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          const r = profile?.role as string | undefined
          setRole(r === 'admin' || r === 'teacher' || r === 'student' ? r : null);
        } else {
          setRole(null);
        }
      }
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setIsAuthed(!!user);
      setEmail(user?.email ?? "");
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        const r = profile?.role as string | undefined
        setRole(r === 'admin' || r === 'teacher' || r === 'student' ? r : null);
      } else {
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
