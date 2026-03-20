import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState({
    latitude: 52.52, // Default to Berlin or someone else
    longitude: 13.41,
    loaded: false,
    error: null,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocation((state) => ({
        ...state,
        loaded: true,
        error: "Geolocation not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loaded: true,
          error: null,
        });
      },
      (error) => {
        setLocation((state) => ({
          ...state,
          loaded: true,
          error: error.message,
        }));
      }
    );
  }, []);

  return location;
}
