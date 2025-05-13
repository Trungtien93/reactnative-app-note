// LanguageContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

type LanguageContextType = {
  language: 'en' | 'vi';
  toggleLanguage: () => void;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<'en' | 'vi'>('en'); // Mặc định là tiếng Anh

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'vi' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
