import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Load all translation namespaces
const loadTranslations = (locale: string) => {
  try {
    return {
      common: require(`../../public/locales/${locale}/common.json`),
      auth: require(`../../public/locales/${locale}/auth.json`),
      navigation: require(`../../public/locales/${locale}/navigation.json`),
      question: require(`../../public/locales/${locale}/question.json`),
      exam: require(`../../public/locales/${locale}/exam.json`),
      student: require(`../../public/locales/${locale}/student.json`),
      teacher: require(`../../public/locales/${locale}/teacher.json`),
      category: require(`../../public/locales/${locale}/category.json`),
    };
  } catch (error) {
    console.warn(`Failed to load some translations for locale: ${locale}`, error);
    return {
      common: require(`../../public/locales/${locale}/common.json`),
      auth: require(`../../public/locales/${locale}/auth.json`),
      navigation: require(`../../public/locales/${locale}/navigation.json`),
    };
  }
};

const resources = {
  vi: loadTranslations('vi'),
  en: loadTranslations('en'),
};

// Initialize with default language, will be updated when user data is loaded
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // default language, will be overridden by user preference
    fallbackLng: 'vi',
    debug: false,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    defaultNS: 'common',
    ns: ['common', 'auth', 'navigation', 'question', 'exam', 'student', 'teacher', 'category'],
  });

// Function to initialize language from user profile (called from client components)
export async function initializeLanguage() {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.language && (result.language === 'vi' || result.language === 'en')) {
        i18n.changeLanguage(result.language);
        return result.language;
      }
    }
  } catch (error) {
    console.warn('Failed to load user language preference:', error);
  }
  
  // Fallback to browser language or default
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en' || browserLang === 'vi') {
      i18n.changeLanguage(browserLang);
      return browserLang;
    }
  }
  
  return 'vi';
}

export default i18n;

