import { createContext, useContext, useState, ReactNode } from 'react';
import type { Language, LocalizedString } from '../types';

interface LanguageContextType {
  /** Current selected language */
  language: Language;
  
  /** Function to change language */
  setLanguage: (lang: Language) => void;
  
  /** Translation helper function */
  t: (text: LocalizedString) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * LanguageProvider Component
 * 
 * Provides multilingual support throughout the app.
 * 
 * Features:
 * - Manages current language state (EN/DE)
 * - Provides translation helper function
 * - Default language: English
 * 
 * @param children - React children to wrap
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  /**
   * Translation helper
   * Returns the text in the current language
   * 
   * @param text - LocalizedString object with EN and DE translations
   * @returns Translated string in current language
   */
  const t = (text: LocalizedString): string => {
    return text[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 * 
 * @throws Error if used outside LanguageProvider
 * @returns LanguageContextType with language, setLanguage, and t() function
 * 
 * @example
 * const { language, setLanguage, t } = useLanguage();
 * const title = t(place.title); // Returns EN or DE version
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
