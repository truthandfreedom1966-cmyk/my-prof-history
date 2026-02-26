import { useEffect, useRef, memo } from 'react';
import L from 'leaflet';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import type { Place } from '../types';

// Fix Leaflet default marker icons for production
// This is required because Vite doesn't bundle Leaflet's default marker images
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
}

/**
 * MapView Component
 * 
 * Displays an interactive Leaflet map with location markers.
 * 
 * Features:
 * - OpenStreetMap tiles
 * - Custom markers for each place (gold for highlights, brown for regular)
 * - Click markers to select places
 * - Auto-centers on selected place without jumping during state updates
 * 
 * @param selectedPlace - Currently selected place (or null)
 * @param onPlaceSelect - Callback when a place marker is clicked
 */
function MapView({ selectedPlace, onPlaceSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const isInitializedRef = useRef(false);
  
  const { currentCity, places } = useData();
  const { t } = useLanguage();

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || !currentCity || isInitializedRef.current) return;

    const map = L.map(mapRef.current, {
      // Disable auto-pan to prevent jumping during state updates
      zoomControl: true,
      attributionControl: true,
    }).setView(
      [currentCity.center.lat, currentCity.center.lng],
      currentCity.zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    isInitializedRef.current = true;

    return () => {
      map.remove();
      isInitializedRef.current = false;
    };
  }, [currentCity]);

  // Update markers when places change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    places.forEach(place => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${place.highlight ? '#c9a961' : '#8B4513'}; 
            width: 30px; 
            height: 30px; 
            border-radius: 50%; 
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">
            📍
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(map)
        .bindPopup(t(place.title))
        .on('click', () => onPlaceSelect(place));

      markersRef.current.push(marker);
    });
  }, [places, onPlaceSelect, t]);

  // Center on selected place (only when explicitly selected, not on re-renders)
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current) {
      // Use flyTo for smooth animation without jumping
      mapInstanceRef.current.flyTo(
        [selectedPlace.lat, selectedPlace.lng],
        16,
        {
          duration: 1.0,
          easeLinearity: 0.5,
        }
      );
    }
  }, [selectedPlace?.id]); // Only trigger when the ID changes, not the whole object

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }} 
    />
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(MapView);
