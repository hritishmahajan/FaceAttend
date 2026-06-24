<template>
  <div class="face-scanner relative-position">
    <video ref="videoEl" autoplay muted playsinline class="full-width" style="border-radius:12px;background:#000" />
    <canvas ref="canvasEl" class="absolute-full" style="border-radius:12px" />

    <!-- Oval overlay -->
    <div class="face-scan-overlay" :class="overlayClass" />

    <!-- Status text -->
    <div class="absolute-bottom text-center q-pb-md">
      <q-chip :color="chipColor" text-color="white" :icon="chipIcon" dense>
        {{ statusText }}
      </q-chip>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import * as faceapi from 'face-api.js';

const props = defineProps({
  mode: { type: String, default: 'detect' }, // 'detect' | 'register' | 'verify'
  storedDescriptor: { type: Array, default: null },
  threshold: { type: Number, default: 0.5 },
});

const emit = defineEmits(['detected', 'match', 'no-match', 'snapshot']);

const videoEl = ref(null);
const canvasEl = ref(null);
const statusText = ref('Position your face in the oval');
const overlayClass = ref('scanning');
const chipColor = ref('primary');
const chipIcon = ref('center_focus_weak');

let stream = null;
let intervalId = null;
let matchCount = 0;
const MATCH_FRAMES = 3;

const overlayClassComputed = computed(() => overlayClass.value);

onMounted(async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
    videoEl.value.srcObject = stream;
    videoEl.value.onloadedmetadata = () => startDetection();
  } catch {
    statusText.value = 'Camera access denied';
    chipColor.value = 'negative';
    chipIcon.value = 'videocam_off';
  }
});

onUnmounted(stopCamera);

function stopCamera() {
  clearInterval(intervalId);
  stream?.getTracks().forEach(t => t.stop());
}

function startDetection() {
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
      statusText.value = 'No face detected';
      overlayClass.value = 'scanning';
      chipColor.value = 'primary';
      chipIcon.value = 'center_focus_weak';
      matchCount = 0;
      return;
    }

    if (detections.length > 1) {
      statusText.value = 'Multiple faces detected';
      overlayClass.value = 'error';
      chipColor.value = 'warning';
      chipIcon.value = 'group';
      return;
    }

    const detection = detections[0];
    const descriptor = Array.from(detection.descriptor);

    if (props.mode === 'register') {
      statusText.value = 'Face detected – ready to capture';
      overlayClass.value = 'success';
      chipColor.value = 'positive';
      chipIcon.value = 'check_circle';
      emit('detected', { descriptor, detection });
      return;
    }

    if (props.mode === 'verify' && props.storedDescriptor) {
      const stored = new Float32Array(props.storedDescriptor);
      const live = new Float32Array(descriptor);
      const distance = faceapi.euclideanDistance(stored, live);

      if (distance < props.threshold) {
        matchCount++;
        statusText.value = `Match (${(1 - distance).toFixed(2) * 100 | 0}%)`;
        overlayClass.value = 'success';
        chipColor.value = 'positive';
        chipIcon.value = 'verified';

        if (matchCount >= MATCH_FRAMES) {
          clearInterval(intervalId);
          // Take snapshot
          const snap = captureSnapshot();
          emit('match', { descriptor, snapshot: snap, distance });
        }
      } else {
        matchCount = 0;
        statusText.value = `No match (${(distance).toFixed(2)})`;
        overlayClass.value = 'error';
        chipColor.value = 'negative';
        chipIcon.value = 'cancel';
        emit('no-match', { distance });
      }
    }
  }, 300);
}

function captureSnapshot() {
  const c = document.createElement('canvas');
  c.width = videoEl.value.videoWidth;
  c.height = videoEl.value.videoHeight;
  c.getContext('2d').drawImage(videoEl.value, 0, 0);
  return c.toDataURL('image/jpeg', 0.8);
}

defineExpose({ captureSnapshot, stopCamera });
</script>
