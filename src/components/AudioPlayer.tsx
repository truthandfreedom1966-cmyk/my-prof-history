import { useState, useRef, useEffect, memo } from 'react';

interface AudioPlayerProps {
  audioSrc: string;
  placeName: string; // For better error messages
}

/**
 * AudioPlayer Component
 * 
 * Production-ready HTML5 audio player with proper error handling.
 * 
 * Features:
 * - Metadata preloading (fast initial load)
 * - Auto-stops when audio source changes
 * - Error state display if file missing
 * - Loading indicator
 * - Respects browser autoplay policies
 * - Clean UI with time display
 * 
 * @param audioSrc - URL of the audio file
 * @param placeName - Name of the place (for error messages)
 */
function AudioPlayer({ audioSrc, placeName }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset state when audio source changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setHasError(false);

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioSrc]);

  /**
   * Toggle play/pause
   */
  const togglePlay = async () => {
    if (!audioRef.current || hasError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Browser may block autoplay, handle the promise
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setHasError(true);
      setIsPlaying(false);
    }
  };

  /**
   * Update current time as audio plays
   */
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  /**
   * Set duration once metadata loads
   */
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  /**
   * Handle audio loading errors
   */
  const handleError = () => {
    console.error(`Failed to load audio: ${audioSrc}`);
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
  };

  /**
   * Handle successful audio load
   */
  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  /**
   * Seek to specific time
   */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  /**
   * Format seconds to MM:SS
   */
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Error state
  if (hasError) {
    return (
      <div style={{
        background: 'rgba(244, 67, 54, 0.2)',
        border: '2px solid #f44336',
        borderRadius: '12px',
        padding: '15px',
        textAlign: 'center',
      }}>
        <div style={{ color: '#f44336', marginBottom: '8px', fontSize: '1.1rem' }}>
          ⚠️ Audio nicht verfügbar
        </div>
        <div style={{ color: '#f4e4c1', fontSize: '0.85rem' }}>
          Die Audio-Datei für "{placeName}" konnte nicht geladen werden.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(139, 69, 19, 0.3)',
      border: '2px solid #8B4513',
      borderRadius: '12px',
      padding: '15px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '10px'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          style={{
            background: isLoading 
              ? '#999' 
              : 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(201, 169, 97, 0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
        </button>

        {/* Progress Bar & Time */}
        <div style={{ flex: 1 }}>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading}
            style={{
              width: '100%',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              accentColor: '#c9a961',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#f4e4c1',
            fontSize: '0.8rem',
            marginTop: '5px',
            fontFamily: 'Georgia, serif'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{isLoading ? 'Lädt...' : formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata" // Faster loading, downloads metadata only
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onEnded={() => setIsPlaying(false)}
        onError={handleError}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(AudioPlayer);
