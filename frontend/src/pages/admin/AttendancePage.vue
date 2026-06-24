<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md q-gutter-sm">
      <div class="text-h6">Attendance Records</div>
      <q-space />
      <q-input v-model="dateFilter" type="date" dense outlined label="Date" style="width:160px" @update:model-value="load" />
    </div>

    <q-table
      :rows="records"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
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
const records = ref([]);
const loading = ref(true);
const dateFilter = ref(new Date().toISOString().slice(0, 10));

const columns = [
  { name: 'name',      label: 'Employee',  field: 'name',      align: 'left', sortable: true },
  { name: 'date',      label: 'Date',      field: 'date',      align: 'center', sortable: true },
  { name: 'punch_in',  label: 'Punch In',  field: 'punch_in',  align: 'center' },
  { name: 'punch_out', label: 'Punch Out', field: 'punch_out', align: 'center' },
  { name: 'shift',     label: 'Shift',     field: 'punch_in',  align: 'center' },
  { name: 'photo',     label: 'In Photo',  field: 'punch_in_photo', align: 'center' },
];

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function calcShift(in_, out_) {
  if (!in_ || !out_) return '—';
  const ms = new Date(out_) - new Date(in_);
  return `${Math.floor(ms/3600000)}h ${Math.floor((ms%3600000)/60000)}m`;
}

async function load() {
  loading.value = true;
  try {
    const { data } = await api.get(`/api/admin/attendance?date=${dateFilter.value}`);
    records.value = data;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>
