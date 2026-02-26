import { memo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Place } from '../types';
import AudioPlayer from './AudioPlayer';

interface PlaceDetailsProps {
  place: Place;
  onClose: () => void;
}

/**
 * PlaceDetails Component
 * 
 * Floating card displaying selected place details.
 * 
 * Features:
 * - Place title and description
 * - Integrated audio player
 * - Close button
 * - Positioned at bottom center
 * - Memoized for performance
 */
function PlaceDetails({ place, onClose }: PlaceDetailsProps) {
  const { t } = useLanguage();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%)',
      border: '3px solid #c9a961',
      borderRadius: '20px',
      padding: '25px',
      maxWidth: '500px',
      width: 'calc(100% - 40px)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
      zIndex: 1001,
    }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        aria-label="Close place details"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(201, 169, 97, 0.2)',
          border: '2px solid #c9a961',
          color: '#c9a961',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(201, 169, 97, 0.4)';
          e.currentTarget.style.transform = 'rotate(90deg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(201, 169, 97, 0.2)';
          e.currentTarget.style.transform = 'rotate(0deg)';
        }}
      >
        ✕
      </button>

      {/* Place Title */}
      <h2 style={{
        color: '#c9a961',
        fontSize: '1.5rem',
        marginBottom: '10px',
        fontFamily: 'Georgia, serif',
        paddingRight: '30px', // Space for close button
      }}>
        {t(place.title)}
      </h2>

      {/* Place Description */}
      <p style={{
        color: '#f4e4c1',
        fontSize: '1rem',
        marginBottom: '20px',
        fontFamily: 'Georgia, serif',
        lineHeight: '1.5',
      }}>
        {t(place.description)}
      </p>

      {/* Audio Player */}
      <AudioPlayer 
        audioSrc={t(place.audio)} 
        placeName={t(place.title)}
      />
    </div>
  );
}

export default memo(PlaceDetails);
