import { memo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import type { Place } from '../types';

interface PlaceListProps {
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
}

/**
 * PlaceList Component
 * 
 * Sidebar displaying all available places.
 * 
 * Features:
 * - Scrollable list of places
 * - Highlighted places have gold border
 * - Selected place is highlighted
 * - Click to select a place
 * - Memoized for performance
 */
function PlaceList({ selectedPlace, onPlaceSelect }: PlaceListProps) {
  const { places } = useData();
  const { t } = useLanguage();

  return (
    <aside style={{
      position: 'absolute',
      top: '80px',
      left: '20px',
      background: 'rgba(26, 15, 10, 0.95)',
      border: '2px solid #c9a961',
      borderRadius: '12px',
      padding: '15px',
      maxWidth: '300px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      <h2 style={{ 
        color: '#c9a961', 
        fontSize: '1.2rem', 
        marginBottom: '15px',
        fontFamily: 'Georgia, serif',
      }}>
        Locations ({places.length})
      </h2>
      
      {places.map(place => (
        <div
          key={place.id}
          onClick={() => onPlaceSelect(place)}
          role="button"
          tabIndex={0}
          aria-label={`Select ${t(place.title)}`}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onPlaceSelect(place);
            }
          }}
          style={{
            background: place.highlight ? 'rgba(201, 169, 97, 0.2)' : 'rgba(139, 69, 19, 0.2)',
            border: selectedPlace?.id === place.id 
              ? `2px solid #d4af37`
              : `1px solid ${place.highlight ? '#c9a961' : '#8B4513'}`,
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(201, 169, 97, 0.4)';
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = place.highlight 
              ? 'rgba(201, 169, 97, 0.2)' 
              : 'rgba(139, 69, 19, 0.2)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div style={{ 
            color: '#c9a961', 
            fontWeight: 'bold',
            fontFamily: 'Georgia, serif',
            marginBottom: '5px',
            fontSize: '0.95rem',
          }}>
            {t(place.title)}
          </div>
          <div style={{ 
            color: '#f4e4c1', 
            fontSize: '0.85rem',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.3',
          }}>
            {t(place.description)}
          </div>
        </div>
      ))}
    </aside>
  );
}

export default memo(PlaceList);
