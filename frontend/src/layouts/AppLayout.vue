<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>
          <q-avatar size="28px" class="q-mr-sm">
            <q-icon name="face" />
          </q-avatar>
          FaceAttend
        </q-toolbar-title>
        <div class="row items-center q-gutter-xs">
          <span class="geofence-indicator" :class="geoStatus" />
          <span class="text-caption">{{ geoLabel }}</span>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered>
      <q-list>
        <q-item-label header>{{ auth.user?.name }}</q-item-label>
        <q-item-label caption class="q-px-md q-pb-sm text-grey">{{ auth.user?.email }}</q-item-label>
        <q-separator />

        <template v-if="!auth.isAdmin">
          <q-item clickable to="/dashboard" exact>
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          <q-item clickable to="/dashboard/history">
            <q-item-section avatar><q-icon name="history" /></q-item-section>
            <q-item-section>My Attendance</q-item-section>
          </q-item>
          <q-item clickable to="/dashboard/profile">
            <q-item-section avatar><q-icon name="person" /></q-item-section>
            <q-item-section>Profile</q-item-section>
          </q-item>
        </template>

        <template v-else>
          <q-item clickable to="/admin" exact>
            <q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section>
            <q-item-section>Admin Dashboard</q-item-section>
          </q-item>
          <q-item clickable to="/admin/employees">
            <q-item-section avatar><q-icon name="group" /></q-item-section>
            <q-item-section>Employees</q-item-section>
          </q-item>
          <q-item clickable to="/admin/attendance">
            <q-item-section avatar><q-icon name="event_available" /></q-item-section>
            <q-item-section>Attendance Records</q-item-section>
          </q-item>
        </template>

        <q-separator class="q-mt-auto" />
        <q-item clickable @click="logout" class="text-negative">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const drawer = ref(false);
const geoStatus = ref('outside');
const geoLabel = ref('Locating...');

let watchId = null;

function startGeoWatch() {
  if (!navigator.geolocation) { geoLabel.value = 'No GPS'; return; }
  watchId = navigator.geolocation.watchPosition(
    pos => {
      // Status updated via attendance store after API call
      geoStatus.value = 'inside';
      geoLabel.value = 'GPS active';
    },
    () => { geoStatus.value = 'outside'; geoLabel.value = 'GPS error'; },
    { enableHighAccuracy: true, maximumAge: 10000 }
  );
}

onMounted(startGeoWatch);
onUnmounted(() => { if (watchId) navigator.geolocation.clearWatch(watchId); });

function logout() {
  auth.logout();
  router.replace('/login');
}
</script>
