import { useState, useCallback } from 'react';
import { BENGALURU_CENTER } from '../utils/constants';

// Wraps the browser Geolocation API with a manual-fallback friendly state shape
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser. Please select your location manually.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus('success');
      },
      (err) => {
        setError(err.message || 'Unable to retrieve your location. Please select it manually on the map.');
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const setManualLocation = useCallback((lat, lng) => {
    setLocation({ lat, lng });
    setStatus('success');
    setError(null);
  }, []);

  return {
    location: location || BENGALURU_CENTER,
    hasLocation: !!location,
    status,
    error,
    requestLocation,
    setManualLocation
  };
}
