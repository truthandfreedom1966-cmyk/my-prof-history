/**
 * Type Definitions for Prof. History
 * 
 * All TypeScript interfaces and types used across the application.
 */

/**
 * Supported languages
 */
export type Language = 'en' | 'de';

/**
 * Localized string object
 * Contains translations for all supported languages
 */
export interface LocalizedString {
  en: string;
  de: string;
}

/**
 * A single place/location
 * 
 * Represents a historical location with multilingual content
 */
export interface Place {
  /** Unique identifier (e.g., "frankfurt-001") */
  id: string;
  
  /** Localized place name */
  title: LocalizedString;
  
  /** Localized place description */
  description: LocalizedString;
  
  /** Latitude coordinate */
  lat: number;
  
  /** Longitude coordinate */
  lng: number;
  
  /** Localized audio file paths */
  audio: LocalizedString;
  
  /** Whether this is a highlighted/featured location */
  highlight: boolean;
}

/**
 * A city configuration
 * 
 * Defines a city with its center point and places data file
 */
export interface City {
  /** Unique city identifier (e.g., "frankfurt") */
  id: string;
  
  /** Localized city name */
  name: LocalizedString;
  
  /** Country name (English) */
  country: string;
  
  /** Map center point */
  center: {
    lat: number;
    lng: number;
  };
  
  /** Default map zoom level */
  zoom: number;
  
  /** Path to the places JSON file */
  placesFile: string;
  
  /** Whether this city is active/enabled */
  enabled: boolean;
}

/**
 * Structure of cities.json file
 */
export interface CitiesData {
  cities: City[];
}

/**
 * Structure of places.{city}.json files
 */
export interface PlacesData {
  places: Place[];
}
