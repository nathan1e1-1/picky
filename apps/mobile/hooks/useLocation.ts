import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  });

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ lat: null, lng: null, loading: false, error: 'Location permission denied' });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({ lat: null, lng: null, loading: false, error: 'Failed to get location' });
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, refetch: requestLocation };
}
