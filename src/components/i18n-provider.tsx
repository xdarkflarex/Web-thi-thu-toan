"use client";

import { useEffect } from 'react';
import '@/lib/i18n';
import { initializeLanguage } from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18n on client side and load user language preference
    initializeLanguage();
  }, []);

  return <>{children}</>;
}