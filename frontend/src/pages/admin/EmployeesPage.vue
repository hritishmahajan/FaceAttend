<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">Employees</div>

    <q-table
      :rows="employees"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
      :filter="filter"
    >
      <template #top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search">
          <template #append><q-icon name="search" /></template>
        </q-input>
      </template>

      <template #body-cell-face="{ row }">
        <q-td class="text-center">
          <q-avatar size="40px" v-if="row.face_photo">
            <img :src="`${apiUrl}/uploads/${row.face_photo}`" />
          </q-avatar>
          <q-icon v-else name="no_photography" color="grey" />
        </q-td>
      </template>

      <template #body-cell-verified="{ row }">
        <q-td>
          <q-chip dense :color="row.is_verified ? 'positive' : 'warning'" text-color="white" size="sm">
            {{ row.is_verified ? 'Verified' : 'Pending' }}
          </q-chip>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';

const apiUrl = process.env.API_URL || 'http://localhost:3000';
const employees = ref([]);
const loading = ref(true);
const filter = ref('');

const columns = [
  { name: 'face',     label: 'Photo',    field: 'face_photo',   align: 'center' },
  { name: 'name',     label: 'Name',     field: 'name',         align: 'left', sortable: true },
  { name: 'email',    label: 'Email',    field: 'email',        align: 'left' },
  { name: 'phone',    label: 'Phone',    field: 'phone',        align: 'left' },
  { name: 'verified', label: 'Status',   field: 'is_verified',  align: 'center' },
];

onMounted(async () => {
  try {
    const { data } = await api.get('/api/admin/employees');
    employees.value = data;
  } finally {
    loading.value = false;
  }
});
</script>
