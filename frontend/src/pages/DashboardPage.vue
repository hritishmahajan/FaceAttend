<template>
  <q-page class="q-pa-md">
    <!-- Greeting -->
    <div class="text-h6 q-mb-md">
      Good {{ timeOfDay }}, <strong>{{ auth.user?.name }}</strong>
    </div>

    <!-- Geofence status card -->
    <q-card class="q-mb-md" :class="insideGeofence ? 'bg-green-1' : 'bg-red-1'">
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon :name="insideGeofence ? 'location_on' : 'location_off'"
          :color="insideGeofence ? 'positive' : 'negative'" size="32px" />
        <div>
          <div class="text-subtitle1 text-weight-bold">
            {{ insideGeofence ? 'Inside Office Zone' : 'Outside Office Zone' }}
          </div>
          <div class="text-caption text-grey">
            {{ locationStatus }}
          </div>
        </div>
        <q-space />
        <q-btn flat round dense icon="refresh" :loading="geoLoading" @click="checkLocation" />
      </q-card-section>
    </q-card>

    <!-- Today's attendance card -->
    <q-card class="attendance-card q-mb-md" :class="todayRecord?.punch_out ? 'punched-out' : ''">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold">Today – {{ todayDate }}</div>
        <div class="row q-mt-sm q-gutter-md">
          <div>
            <div class="text-caption text-grey">Punch In</div>
            <div class="text-body1 text-weight-medium">{{ formatTime(todayRecord?.punch_in) }}</div>
          </div>
          <div>
            <div class="text-caption text-grey">Punch Out</div>
            <div class="text-body1 text-weight-medium">{{ formatTime(todayRecord?.punch_out) }}</div>
          </div>
          <div v-if="shiftDuration">
            <div class="text-caption text-grey">Shift</div>
            <div class="text-body1 text-weight-medium text-positive">{{ shiftDuration }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Action buttons -->
    <div class="row q-gutter-md justify-center q-mt-lg">
      <q-btn
        v-if="!todayRecord?.punch_in"
        label="Punch In"
        icon="login"
        color="positive"
        size="lg"
        :disable="!insideGeofence || !auth.hasFace"
        @click="openPunchDialog('in')"
        class="q-px-xl"
      />
      <q-btn
        v-else-if="!todayRecord?.punch_out"
        label="Punch Out"
        icon="logout"
        color="negative"
        size="lg"
        :disable="!insideGeofence"
        @click="openPunchDialog('out')"
        class="q-px-xl"
      />
      <q-chip v-else color="positive" icon="check_circle" text-color="white" size="lg">
        Shift Complete – {{ shiftDuration }}
      </q-chip>
    </div>

    <!-- No face warning -->
    <q-banner v-if="!auth.hasFace" inline-actions class="bg-orange-1 q-mt-lg" rounded>
      <template #avatar><q-icon name="warning" color="warning" /></template>
      Face not registered yet.
      <template #action>
        <q-btn flat color="warning" label="Register Now" to="/face-setup" />
      </template>
    </q-banner>

    <!-- Face scan dialog -->
    <q-dialog v-model="punchDialog" persistent>
      <q-card style="width:400px;max-width:95vw">
        <q-card-section class="text-center">
          <q-icon name="face_retouching_natural" size="40px" :color="punchType === 'in' ? 'positive' : 'negative'" />
          <div class="text-h6 q-mt-xs">Face Scan – Punch {{ punchType === 'in' ? 'In' : 'Out' }}</div>
        </q-card-section>

        <q-card-section>
          <div style="height:280px;position:relative">
            <FaceScanner
              v-if="punchDialog"
              ref="scanner"
              mode="verify"
              :stored-descriptor="storedDescriptor"
              @match="onFaceMatch"
              @no-match="onFaceNoMatch"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closePunchDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'src/stores/auth';
import { getCurrentPosition } from 'src/services/geofence';
import FaceScanner from 'src/components/FaceScanner.vue';

const $q = useQuasar();
const auth = useAuthStore();

const todayRecord = ref(null);
const punchDialog = ref(false);
const punchType = ref('in');
const scanner = ref(null);
const insideGeofence = ref(false);
const locationStatus = ref('Checking location...');
const geoLoading = ref(false);
const currentLocation = ref(null);

const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const timeOfDay = computed(() => {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
});

const storedDescriptor = computed(() => {
  const d = auth.user?.face_descriptor;
  if (!d) return null;
  try { return JSON.parse(d); } catch { return null; }
});

const shiftDuration = computed(() => {
  if (!todayRecord.value?.punch_in || !todayRecord.value?.punch_out) return null;
  const ms = new Date(todayRecord.value.punch_out) - new Date(todayRecord.value.punch_in);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
});

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

async function checkLocation() {
  geoLoading.value = true;
  try {
    currentLocation.value = await getCurrentPosition();
    // Geofence check is done server-side on punch; here we do a soft check via admin endpoint
    locationStatus.value = `Lat: ${currentLocation.value.lat.toFixed(4)}, Lng: ${currentLocation.value.lng.toFixed(4)}`;
    insideGeofence.value = true; // Optimistic; server will reject if outside
  } catch (err) {
    locationStatus.value = 'Location access denied';
    insideGeofence.value = false;
  } finally {
    geoLoading.value = false;
  }
}

async function fetchTodayRecord() {
  try {
    const { data } = await api.get('/api/attendance/today');
    todayRecord.value = data;
  } catch { /* ignore */ }
}

onMounted(() => {
  checkLocation();
  fetchTodayRecord();
});

function openPunchDialog(type) {
  punchType.value = type;
  punchDialog.value = true;
}

function closePunchDialog() {
  scanner.value?.stopCamera();
  punchDialog.value = false;
}

async function onFaceMatch({ snapshot }) {
  closePunchDialog();
  $q.loading.show({ message: 'Recording attendance...' });
  try {
    if (!currentLocation.value) currentLocation.value = await getCurrentPosition();
    const blob = await (await fetch(snapshot)).blob();
    const fd = new FormData();
    fd.append('lat', currentLocation.value.lat);
    fd.append('lng', currentLocation.value.lng);
    fd.append('photo', blob, 'punch.jpg');

    const { data } = await api.post(`/api/attendance/punch-${punchType.value}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    $q.notify({ type: 'positive', message: data.message + (data.shift ? ` – Shift: ${data.shift}` : '') });
    await fetchTodayRecord();
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error ?? 'Failed to record attendance' });
    if (err.response?.status === 403) insideGeofence.value = false;
  } finally {
    $q.loading.hide();
  }
}

function onFaceNoMatch() {
  // scanner keeps trying; no dialog close
}
</script>
