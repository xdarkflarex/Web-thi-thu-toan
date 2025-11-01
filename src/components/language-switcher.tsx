"use client";

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={i18n.language === 'vi' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('vi')}
      >
        VI
      </Button>
      <Button
        variant={i18n.language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => switchLanguage('en')}
      >
        EN
      </Button>
    </div>
  );
}

