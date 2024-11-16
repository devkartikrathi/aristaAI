export const API_URL = 'https://aristaproj.onrender.com';

export const COLORS = {
  primary: '#6366f1',
  secondary: '#ec4899',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  error: '#ef4444',
};

export const WEATHER_OPTIONS = [
  { value: 'hot', label: 'Hot' },
  { value: 'mild', label: 'Mild' },
  { value: 'cold', label: 'Cold' },
  { value: 'rainy', label: 'Rainy' },
] as const;

export const PURPOSE_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'leisure', label: 'Leisure' },
  { value: 'family', label: 'Family' },
  { value: 'adventure', label: 'Adventure' },
] as const;