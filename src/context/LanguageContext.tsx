import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageInfo = {
  code: 'en' | 'ja';
  label: string;
};

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }
];

type TranslationDict = {
  [key: string]: string;
};

const translations: Record<'en' | 'ja', TranslationDict> = {
  en: {
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.studio': 'Studio',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'settings.title': 'Settings',
    'post.like': 'Like',
    'post.comment': 'Comment',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.search': '検索',
    'nav.studio': 'スタジオ',
    'nav.messages': 'メッセージ',
    'nav.profile': 'プロフィール',
    'settings.title': '設定',
    'post.like': 'いいね',
    'post.comment': 'コメント',
  }
};

interface LanguageContextType {
  language: 'en' | 'ja';
  setLanguage: (lang: 'en' | 'ja') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'ja'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'ja') setLanguageState('ja');
  }, []);

  const setLanguage = (lang: 'en' | 'ja') => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
