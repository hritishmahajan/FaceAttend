import { ref, onUnmounted } from 'vue';
import * as faceapi from 'face-api.js';

const MATCH_FRAMES_REQUIRED = 3;
const SCAN_INTERVAL_MS = 300;

/**
 * Encapsulates all face-api.js camera + detection logic.
 *
 * @param {{ mode: 'register'|'verify', storedDescriptor?: number[], threshold?: number }} options
 * @param {{ onDetected, onMatch, onNoMatch }} callbacks
 */
export function useFaceScanner(options, callbacks) {
  const { mode, storedDescriptor = null, threshold = 0.5 } = options;
  const { onDetected, onMatch, onNoMatch } = callbacks;

  const videoEl  = ref(null);
  const canvasEl = ref(null);
  const status   = ref('Position your face in the oval');
  const state    = ref('idle'); // idle | scanning | success | error

  let stream     = null;
  let intervalId = null;
  let matchCount = 0;

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      videoEl.value.srcObject = stream;
      videoEl.value.onloadedmetadata = () => {
        state.value = 'scanning';
        _startDetectionLoop();
      };
    } catch {
      status.value = 'Camera access denied';
      state.value  = 'error';
    }
  }

  function stop() {
    clearInterval(intervalId);
    stream?.getTracks().forEach(t => t.stop());
    intervalId = null;
    stream     = null;
  }

  function captureSnapshot() {
    const c = document.createElement('canvas');
    c.width  = videoEl.value.videoWidth;
    c.height = videoEl.value.videoHeight;
    c.getContext('2d').drawImage(videoEl.value, 0, 0);
    return c.toDataURL('image/jpeg', 0.85);
  }

  function _startDetectionLoop() {
    const displaySize = { width: videoEl.value.videoWidth, height: videoEl.value.videoHeight };
    faceapi.matchDimensions(canvasEl.value, displaySize);

    intervalId = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoEl.value, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvasEl.value.getContext('2d');
      ctx.clearRect(0, 0, canvasEl.value.width, canvasEl.value.height);
      faceapi.draw.drawDetections(canvasEl.value, resized);
      faceapi.draw.drawFaceLandmarks(canvasEl.value, resized);

      if (detections.length === 0) {
        status.value = 'No face detected';
        state.value  = 'scanning';
        matchCount   = 0;
        return;
      }
      if (detections.length > 1) {
        status.value = 'Multiple faces — use one face only';
        state.value  = 'error';
        return;
      }

      const descriptor = Array.from(detections[0].descriptor);

      if (mode === 'register') {
        status.value = 'Face detected – ready to capture';
        state.value  = 'success';
        onDetected?.({ descriptor, detection: detections[0] });
        return;
      }

      if (mode === 'verify' && storedDescriptor) {
        const distance = faceapi.euclideanDistance(
          new Float32Array(storedDescriptor),
          new Float32Array(descriptor)
        );
        if (distance < threshold) {
          matchCount++;
          status.value = `Match confirmed (${((1 - distance) * 100).toFixed(0)}%)`;
          state.value  = 'success';
          if (matchCount >= MATCH_FRAMES_REQUIRED) {
            clearInterval(intervalId);
            onMatch?.({ descriptor, snapshot: captureSnapshot(), distance });
          }
        } else {
          matchCount   = 0;
          status.value = 'Face not recognised – hold still';
          state.value  = 'error';
          onNoMatch?.({ distance });
        }
      }
    }, SCAN_INTERVAL_MS);
  }

  onUnmounted(stop);

  return { videoEl, canvasEl, status, state, start, stop, captureSnapshot };
}
