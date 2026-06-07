export const Accuracy = {
  Lowest: 1,
  Low: 2,
  Balanced: 3,
  High: 4,
  Highest: 5,
  BestForNavigation: 6,
};

export async function requestForegroundPermissionsAsync() {
  return { status: 'granted' };
}

export async function getCurrentPositionAsync() {
  return {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 10,
      altitudeAccuracy: 10,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  };
}
