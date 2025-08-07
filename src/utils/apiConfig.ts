// Helper function to get the correct API base URL based on environment
export const getApiBaseUrl = (): string => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Use protocol to determine environment
    const isProduction = window.location.protocol === 'https:';
    return isProduction 
      ? 'https://montevar-hotel-server.onrender.com'
      : 'http://localhost:3001';
  }
  
  // Server-side fallback
  return process.env.NODE_ENV === 'production' 
    ? 'https://montevar-hotel-server.onrender.com'
    : 'http://localhost:3001';
};
