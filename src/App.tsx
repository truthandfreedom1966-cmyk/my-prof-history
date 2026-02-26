import { useState, useCallback } from 'react';
import { useData } from './context/DataContext';
import Header from './components/Header';
import MapView from './components/MapView';
import PlaceList from './components/PlaceList';
import PlaceDetails from './components/PlaceDetails';
import type { Place } from './types';

/**
 * Main App Component
 * 
 * Root component that orchestrates all features.
 * 
 * Features:
 * - Loading and error states
 * - Place selection management
 * - Responsive layout
 * - Proper component composition
 */
export default function App() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { loading, error } = useData();

  /**
   * Handle place selection
   * Memoized to prevent unnecessary re-renders
   */
  const handlePlaceSelect = useCallback((place: Place) => {
    setSelectedPlace(place);
  }, []);

  /**
   * Close place details
   */
  const handleClose = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%)',
        color: '#c9a961',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
        padding: '20px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
        <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Loading Prof. History...</div>
        <div style={{ fontSize: '1rem', opacity: 0.7 }}>Preparing your historical journey</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%)',
        color: '#f44336',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
        padding: '20px',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#f44336' }}>
          Error Loading Data
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6', color: '#f4e4c1' }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#1a0f0a',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Main app
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: 'Georgia, serif',
      background: 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%)',
    }}>
      <Header />
      
      <div style={{
        position: 'absolute',
        top: '80px',
        left: 0,
        right: 0,
        bottom: 0,
      }}>
        <MapView 
          selectedPlace={selectedPlace}
          onPlaceSelect={handlePlaceSelect}
        />
      </div>

      <PlaceList 
        selectedPlace={selectedPlace}
        onPlaceSelect={handlePlaceSelect}
      />

      {selectedPlace && (
        <PlaceDetails 
          place={selectedPlace}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
