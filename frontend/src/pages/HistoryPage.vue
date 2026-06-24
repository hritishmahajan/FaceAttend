<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">My Attendance History</div>

    <q-list bordered separator rounded>
      <q-item v-if="loading">
        <q-item-section><q-skeleton type="text" /></q-item-section>
      </q-item>

      <q-item v-for="rec in records" :key="rec.id" class="attendance-card" :class="rec.punch_out ? 'punched-out' : ''">
        <q-item-section>
          <q-item-label>{{ formatDate(rec.date) }}</q-item-label>
          <q-item-label caption>
            In: {{ formatTime(rec.punch_in) }} &nbsp;|&nbsp; Out: {{ formatTime(rec.punch_out) }}
            <span v-if="rec.punch_in && rec.punch_out" class="text-positive q-ml-sm">
              {{ calcShift(rec.punch_in, rec.punch_out) }}
            </span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-chip dense :color="rec.punch_out ? 'positive' : 'orange'" text-color="white" size="sm">
            {{ rec.punch_out ? 'Complete' : 'Partial' }}
          </q-chip>
        </q-item-section>
      </q-item>

      <q-item v-if="!loading && !records.length">
        <q-item-section class="text-center text-grey q-py-lg">No records yet</q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';

const records = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get('/api/attendance/my');
    records.value = data;
  } finally {
    loading.value = false;
  }
});

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function calcShift(in_, out_) {
  const ms = new Date(out_) - new Date(in_);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}
</script>
