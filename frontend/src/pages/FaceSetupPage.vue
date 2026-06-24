<template>
  <q-page class="flex flex-center bg-grey-2 q-pa-md">
    <q-card style="width:420px;max-width:100%" class="shadow-4">
      <q-card-section class="text-center">
        <q-icon name="face_retouching_natural" size="48px" color="primary" />
        <div class="text-h6 text-weight-bold q-mt-sm">Register Your Face</div>
        <div class="text-caption text-grey">This is a one-time setup. Look directly at the camera.</div>
      </q-card-section>

      <q-card-section>
        <!-- Steps -->
        <q-stepper v-model="step" color="primary" animated flat>
          <q-step :name="1" title="Prepare" icon="info" :done="step > 1">
            <ul class="text-body2 q-mb-md">
              <li>Ensure good lighting on your face</li>
              <li>Remove glasses if possible</li>
              <li>Look directly at the camera</li>
              <li>Keep a neutral expression</li>
            </ul>
            <q-btn label="Start Camera" color="primary" @click="step = 2" />
          </q-step>

          <q-step :name="2" title="Scan Face" icon="videocam" :done="step > 2">
            <div class="relative-position" style="height:300px">
              <FaceScanner
                v-if="step === 2"
                ref="scanner"
                mode="register"
                @detected="onDetected"
              />
            </div>
            <q-btn
              v-if="detectedDescriptor"
              label="Capture & Save"
              color="positive"
              class="full-width q-mt-md"
              :loading="saving"
              @click="saveFace"
            />
          </q-step>

          <q-step :name="3" title="Done" icon="check_circle">
            <div class="text-center q-py-lg">
              <q-icon name="check_circle" size="64px" color="positive" />
              <div class="text-h6 q-mt-md">Face Registered!</div>
              <div class="text-caption text-grey q-mb-lg">You can now use facial recognition to punch in/out.</div>
              <q-btn label="Go to Dashboard" color="primary" @click="goToDashboard" />
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'src/stores/auth';
import FaceScanner from 'src/components/FaceScanner.vue';

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const step = ref(1);
const scanner = ref(null);
const detectedDescriptor = ref(null);
const saving = ref(false);

function onDetected({ descriptor }) {
  detectedDescriptor.value = descriptor;
}

async function saveFace() {
  if (!detectedDescriptor.value) return;
  saving.value = true;
  try {
    const snapshot = scanner.value?.captureSnapshot();
    const blob = await (await fetch(snapshot)).blob();
    const formData = new FormData();
    formData.append('descriptor', JSON.stringify(detectedDescriptor.value));
    formData.append('photo', blob, 'face.jpg');

    await api.post('/api/face/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    auth.updateFaceDescriptor(JSON.stringify(detectedDescriptor.value));
    scanner.value?.stopCamera();
    step.value = 3;
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error ?? 'Face registration failed' });
  } finally {
    saving.value = false;
  }
}

function goToDashboard() {
  router.replace(auth.isAdmin ? '/admin' : '/dashboard');
}
</script>
