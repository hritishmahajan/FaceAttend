import { ref, onUnmounted } from 'vue';

/**
 * Reactive GPS wrapper.
 * - `position`     — { lat, lng, accuracy } or null
 * - `error`        — string or null
 * - `loading`      — boolean
 * - `refresh()`    — trigger a one-shot position update
 * - `startWatch()` — start continuous watching
 */
export function useGeolocation() {
  const position = ref(null);
  const error    = ref(null);
  const loading  = ref(false);
  let watchId    = null;

  function onSuccess(pos) {
    position.value = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
    error.value    = null;
    loading.value  = false;
  }

  function onError(err) {
    error.value   = err.message ?? 'Location access denied';
    loading.value = false;
  }

  const GEO_OPTS = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 };

  function refresh() {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported';
      return;
    }
    loading.value = true;
    navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTS);
  }

  function startWatch() {
    if (!navigator.geolocation) { error.value = 'Geolocation not supported'; return; }
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, { ...GEO_OPTS, maximumAge: 10_000 });
  }

  onUnmounted(() => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  });

  return { position, error, loading, refresh, startWatch };
}
