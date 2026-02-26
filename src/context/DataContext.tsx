import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { City, Place, CitiesData, PlacesData } from '../types';

interface DataContextType {
  cities: City[];
  currentCity: City | null;
  places: Place[];
  loading: boolean;
  error: string | null;
  selectCity: (cityId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * DataProvider Component
 * 
 * Manages data loading for cities and places.
 * 
 * Features:
 * - Loads cities.json on mount
 * - Auto-selects first enabled city
 * - Loads places for selected city
 * - Proper loading and error states
 * - No duplicate fetches
 * - StrictMode safe (ignores double renders)
 * 
 * @param children - React children to wrap
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if cities have been loaded to prevent double-fetch in StrictMode
  const citiesLoadedRef = useRef(false);

  /**
   * Load cities from cities.json and auto-select first city
   * Only runs once on mount
   */
  useEffect(() => {
    // Prevent double-load in React StrictMode
    if (citiesLoadedRef.current) return;
    citiesLoadedRef.current = true;

    const loadCitiesAndFirstCity = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load cities.json
        const response = await fetch('/data/cities.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load cities: ${response.status} ${response.statusText}`);
        }
        
        const data: CitiesData = await response.json();
        
        if (!data.cities || !Array.isArray(data.cities)) {
          throw new Error('Invalid cities.json format: expected { cities: [...] }');
        }

        // Find first enabled city
        const firstCity = data.cities.find(c => c.enabled);
        if (!firstCity) {
          throw new Error('No enabled cities found in cities.json');
        }

        // Load places for first city
        const placesResponse = await fetch(firstCity.placesFile);
        
        if (!placesResponse.ok) {
          throw new Error(`Failed to load places: ${placesResponse.status} ${placesResponse.statusText}`);
        }
        
        const placesData: PlacesData = await placesResponse.json();
        
        if (!placesData.places || !Array.isArray(placesData.places)) {
          throw new Error(`Invalid places file format: expected { places: [...] }`);
        }

        // Set all states at once
        setCities(data.cities);
        setCurrentCity(firstCity);
        setPlaces(placesData.places);
        setLoading(false);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading data';
        console.error('Error loading data:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadCitiesAndFirstCity();
  }, []);

  /**
   * Select a city and load its places
   * 
   * @param cityId - ID of the city to select
   */
  const selectCity = async (cityId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const city = cities.find(c => c.id === cityId);
      
      if (!city) {
        throw new Error(`City not found: ${cityId}`);
      }
      
      const response = await fetch(city.placesFile);
      
      if (!response.ok) {
        throw new Error(`Failed to load places: ${response.status} ${response.statusText}`);
      }
      
      const data: PlacesData = await response.json();
      
      if (!data.places || !Array.isArray(data.places)) {
        throw new Error(`Invalid places file format: expected { places: [...] }`);
      }

      setPlaces(data.places);
      setCurrentCity(city);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading places';
      console.error('Error loading places:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{ cities, currentCity, places, loading, error, selectCity }}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook to access data context
 * 
 * @throws Error if used outside DataProvider
 * @returns DataContextType
 */
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
