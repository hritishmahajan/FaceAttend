<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">
      Good {{ timeOfDay }}, <strong>{{ auth.user?.name }}</strong>
    </div>

    <!-- Geofence card -->
    <q-card class="q-mb-md" :class="locationReady ? 'bg-green-1' : 'bg-red-1'">
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon :name="locationReady ? 'location_on' : 'location_off'"
          :color="locationReady ? 'positive' : 'negative'" size="32px" />
        <div>
          <div class="text-subtitle1 text-weight-bold">
            {{ locationReady ? 'Location acquired' : (geoError ?? 'Acquiring location…') }}
          </div>
          <div v-if="geoPosition" class="text-caption text-grey">
            {{ geoPosition.lat.toFixed(4) }}, {{ geoPosition.lng.toFixed(4) }}
          </div>
        </div>
        <q-space />
        <q-btn flat round dense icon="refresh" :loading="geoLoading" @click="refreshGeo" />
      </q-card-section>
    </q-card>

    <!-- Today's record -->
    <q-card class="attendance-card q-mb-md" :class="attendance.isPunchedOut ? 'punched-out' : ''">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold">Today – {{ todayLabel }}</div>
        <div class="row q-mt-sm q-gutter-md">
          <div>
            <div class="text-caption text-grey">Punch In</div>
            <div class="text-body1 text-weight-medium">{{ fmt(attendance.today?.punch_in) }}</div>
          </div>
          <div>
            <div class="text-caption text-grey">Punch Out</div>
            <div class="text-body1 text-weight-medium">{{ fmt(attendance.today?.punch_out) }}</div>
          </div>
          <div v-if="attendance.shiftDuration">
            <div class="text-caption text-grey">Shift</div>
            <div class="text-body1 text-weight-medium text-positive">{{ attendance.shiftDuration }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Action buttons -->
    <div class="row q-gutter-md justify-center q-mt-lg">
      <q-btn
        v-if="!attendance.isPunchedIn"
        label="Punch In"
        icon="login"
        color="positive"
        size="lg"
        class="q-px-xl"
        :disable="!locationReady || !auth.hasFace"
        @click="openScan('in')"
      />
      <q-btn
        v-else-if="!attendance.isPunchedOut"
        label="Punch Out"
        icon="logout"
        color="negative"
        size="lg"
        class="q-px-xl"
        :disable="!locationReady"
        @click="openScan('out')"
      />
      <q-chip v-else color="positive" icon="check_circle" text-color="white" size="lg">
        Shift Complete – {{ attendance.shiftDuration }}
      </q-chip>
    </div>

    <!-- No face banner -->
    <q-banner v-if="!auth.hasFace" inline-actions class="bg-orange-1 q-mt-lg" rounded>
      <template #avatar><q-icon name="warning" color="warning" /></template>
      Face not registered yet.
      <template #action>
        <q-btn flat color="warning" label="Register Now" to="/face-setup" />
      </template>
    </q-banner>

    <!-- Face scan dialog -->
    <q-dialog v-model="scanOpen" persistent>
      <q-card style="width:400px;max-width:95vw">
        <q-card-section class="text-center">
          <q-icon name="face_retouching_natural" size="40px" :color="scanType === 'in' ? 'positive' : 'negative'" />
          <div class="text-h6 q-mt-xs">Face Scan – Punch {{ scanType === 'in' ? 'In' : 'Out' }}</div>
        </q-card-section>

        <q-card-section>
          <div style="height:280px;position:relative">
            <FaceScanner
              v-if="scanOpen"
              mode="verify"
              :stored-descriptor="storedDescriptor"
              @match="onMatch"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore }       from 'src/stores/auth';
import { useAttendanceStore } from 'src/stores/attendance.store';
import { useGeolocation }     from 'src/composables/useGeolocation';
import { useAttendance }      from 'src/composables/useAttendance';
import FaceScanner            from 'src/components/FaceScanner.vue';

const auth       = useAuthStore();
const attendance = useAttendanceStore();
const { punch }  = useAttendance();

const { position: geoPosition, error: geoError, loading: geoLoading, refresh: refreshGeo, startWatch } = useGeolocation();

const locationReady = computed(() => !!geoPosition.value && !geoError.value);
const scanOpen  = ref(false);
const scanType  = ref('in');

const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const timeOfDay  = computed(() => {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
});

const storedDescriptor = computed(() => {
  const d = auth.user?.face_descriptor;
  if (!d) return null;
  try { return JSON.parse(d); } catch { return null; }
});

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function openScan(type) {
  scanType.value = type;
  scanOpen.value = true;
}

async function onMatch({ snapshot }) {
  scanOpen.value = false;
  const result = await punch(scanType.value, {
    lat: geoPosition.value.lat,
    lng: geoPosition.value.lng,
    snapshot,
  });
  if (!result.success && result.outsideGeofence) {
    // Force re-check location — server confirmed we're outside
    refreshGeo();
  }
}

onMounted(() => {
  startWatch();
  attendance.fetchToday();
});
</script>
