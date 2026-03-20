import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Move the platform check inside a function to avoid immediate setState in the effect body
    const handleLocationRequest = () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          // Providing a fallback or more descriptive error for the UI
          setError(err.message || "Unable to retrieve your location");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Performance optimization
      );
    };

    handleLocationRequest();
  }, []); // Empty dependency array ensures this runs once on mount

  return { coords, error, loading };
};