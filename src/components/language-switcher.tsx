"use client";

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);

  const switchLanguage = async (lng: string) => {
    // Update frontend immediately for better UX
    i18n.changeLanguage(lng);
    
    // Save to backend
    try {
      setIsUpdating(true);
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ language: lng }),
      });

      const result = await res.json();
      
      if (!res.ok || !result.success) {
        console.error('Failed to save language preference:', result.message);
        // Still keep the frontend language change even if backend save fails
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
      // Still keep the frontend language change even if backend save fails
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={i18n.language === 'vi' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('vi')}
        disabled={isUpdating}
      >
        VI
      </Button>
      <Button
        variant={i18n.language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('en')}
        disabled={isUpdating}
      >
        EN
      </Button>
    </div>
  );
}

