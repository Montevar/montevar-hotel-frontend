// Helper function to get the correct API base URL based on environment.
// Set NEXT_PUBLIC_API_URL (e.g. https://api.montevarhotel.com) to override.
const PRODUCTION_API_URL = 'https://montevar-hotel-server.onrender.com';
const LOCAL_API_URL = 'http://localhost:3001';

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Use protocol to determine environment
    const isProduction = window.location.protocol === 'https:';
    return isProduction ? PRODUCTION_API_URL : LOCAL_API_URL;
  }

  // Server-side fallback
  return process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : LOCAL_API_URL;
};
