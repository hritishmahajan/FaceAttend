<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">Admin Dashboard – {{ todayLabel }}</div>

    <!-- Stats row -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card class="col" v-for="s in statCards" :key="s.label">
        <q-card-section class="text-center">
          <q-icon :name="s.icon" :color="s.color" size="32px" />
          <div class="text-h4 text-weight-bold q-mt-xs" :class="`text-${s.color}`">{{ stats[s.key] ?? '–' }}</div>
          <div class="text-caption text-grey">{{ s.label }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Recent punches -->
    <div class="text-subtitle1 q-mb-sm">Today's Punches</div>
    <q-table
      :rows="attendance"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      dense
      @row-click="(_, row) => $router.push(`/admin/record/${row.id}`)"
    >
      <template #body-cell-punch_in="{ value }">
        <q-td>{{ formatTime(value) }}</q-td>
      </template>
      <template #body-cell-punch_out="{ value }">
        <q-td>{{ formatTime(value) }}</q-td>
      </template>
      <template #body-cell-shift="{ row }">
        <q-td>{{ calcShift(row.punch_in, row.punch_out) }}</q-td>
      </template>
      <template #body-cell-photo="{ row }">
        <q-td>
          <q-avatar size="36px" v-if="row.punch_in_photo">
            <img :src="`${apiUrl}/api/admin/photo/${row.punch_in_photo}`" />
          </q-avatar>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';

const apiUrl = process.env.API_URL || 'http://localhost:3000';
const loading = ref(true);
const stats = ref({});
const attendance = ref([]);

const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });

const statCards = [
  { key: 'total',     label: 'Total Employees', icon: 'group',           color: 'primary' },
  { key: 'present',   label: 'Present Today',   icon: 'event_available', color: 'positive' },
  { key: 'absent',    label: 'Absent Today',     icon: 'event_busy',      color: 'negative' },
  { key: 'punchedOut',label: 'Punched Out',      icon: 'logout',          color: 'orange' },
];

const columns = [
  { name: 'name',      label: 'Employee',   field: 'name',      align: 'left', sortable: true },
  { name: 'punch_in',  label: 'Punch In',   field: 'punch_in',  align: 'center' },
  { name: 'punch_out', label: 'Punch Out',  field: 'punch_out', align: 'center' },
  { name: 'shift',     label: 'Shift',      field: 'punch_in',  align: 'center' },
  { name: 'photo',     label: 'Photo',      field: 'punch_in_photo', align: 'center' },
];

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function calcShift(in_, out_) {
  if (!in_ || !out_) return '—';
  const ms = new Date(out_) - new Date(in_);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

onMounted(async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [s, a] = await Promise.all([
      api.get('/api/admin/stats'),
      api.get(`/api/admin/attendance?date=${today}`),
    ]);
    stats.value = s.data;
    attendance.value = a.data;
  } finally {
    loading.value = false;
  }
});
</script>
