import { memo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import type { Language } from '../types';

/**
 * Header Component
 * 
 * App header with branding and language switcher.
 * 
 * Features:
 * - Displays app name and current city
 * - EN/DE language toggle buttons
 * - Responsive design
 * - Memoized to prevent unnecessary re-renders
 */
function Header() {
  const { language, setLanguage } = useLanguage();
  const { currentCity } = useData();

  /**
   * Handle language switch
   */
  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <header style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%)',
      border: '2px solid #c9a961',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '15px 20px',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    }}>
      {/* Branding */}
      <div>
        <h1 style={{
          color: '#c9a961',
          fontSize: '1.5rem',
          margin: 0,
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
        }}>
          My Prof. History
        </h1>
        {currentCity && (
          <p style={{
            color: '#f4e4c1',
            fontSize: '0.9rem',
            margin: '5px 0 0 0',
            fontFamily: 'Georgia, serif',
          }}>
            {currentCity.name[language]} - Historical Audio Guide
          </p>
        )}
      </div>

      {/* Language Switcher */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => switchLanguage('en')}
          aria-label="Switch to English"
          aria-pressed={language === 'en'}
          style={{
            background: language === 'en' 
              ? 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)' 
              : 'rgba(201, 169, 97, 0.2)',
            border: '2px solid #c9a961',
            color: language === 'en' ? '#1a0f0a' : '#c9a961',
            padding: '8px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (language !== 'en') {
              e.currentTarget.style.background = 'rgba(201, 169, 97, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (language !== 'en') {
              e.currentTarget.style.background = 'rgba(201, 169, 97, 0.2)';
            }
          }}
        >
          EN
        </button>
        
        <button
          onClick={() => switchLanguage('de')}
          aria-label="Auf Deutsch wechseln"
          aria-pressed={language === 'de'}
          style={{
            background: language === 'de' 
              ? 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)' 
              : 'rgba(201, 169, 97, 0.2)',
            border: '2px solid #c9a961',
            color: language === 'de' ? '#1a0f0a' : '#c9a961',
            padding: '8px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (language !== 'de') {
              e.currentTarget.style.background = 'rgba(201, 169, 97, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (language !== 'de') {
              e.currentTarget.style.background = 'rgba(201, 169, 97, 0.2)';
            }
          }}
        >
          DE
        </button>
      </div>
    </header>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(Header);
