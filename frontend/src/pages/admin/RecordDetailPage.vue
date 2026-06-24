<template>
  <q-page class="q-pa-md" v-if="record">
    <q-btn flat icon="arrow_back" label="Back" @click="$router.back()" class="q-mb-md" />
    <div class="text-h6 q-mb-md">Attendance Record – {{ record.name }}</div>

    <div class="row q-gutter-md">
      <!-- Detail card -->
      <q-card class="col-12 col-md-6">
        <q-card-section>
          <q-list>
            <q-item><q-item-section><q-item-label caption>Employee</q-item-label><q-item-label>{{ record.name }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>Email</q-item-label><q-item-label>{{ record.email }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>Date</q-item-label><q-item-label>{{ record.date }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>Punch In</q-item-label><q-item-label>{{ fmt(record.punch_in) }}</q-item-label></q-item-section></q-item>
            <q-item><q-item-section><q-item-label caption>Punch Out</q-item-label><q-item-label>{{ fmt(record.punch_out) }}</q-item-label></q-item-section></q-item>
            <q-item v-if="record.shift">
              <q-item-section>
                <q-item-label caption>Total Shift</q-item-label>
                <q-item-label class="text-positive text-weight-bold text-h6">{{ record.shift }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="record.lat">
              <q-item-section><q-item-label caption>Location</q-item-label><q-item-label>{{ record.lat.toFixed(4) }}, {{ record.lng.toFixed(4) }}</q-item-label></q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Photos -->
      <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Punch In Photo</div>
          <q-img v-if="record.punch_in_photo" :src="`${apiUrl}/api/admin/photo/${record.punch_in_photo}`"
            style="border-radius:8px;max-height:200px" fit="contain" />
          <div v-else class="text-grey text-center q-py-md">No photo</div>

          <div class="text-subtitle1 q-mt-md q-mb-sm">Punch Out Photo</div>
          <q-img v-if="record.punch_out_photo" :src="`${apiUrl}/api/admin/photo/${record.punch_out_photo}`"
            style="border-radius:8px;max-height:200px" fit="contain" />
          <div v-else class="text-grey text-center q-py-md">No photo</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
  <q-page v-else class="flex flex-center"><q-spinner size="48px" /></q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';

const apiUrl = process.env.API_URL || 'http://localhost:3000';
const route = useRoute();
const record = ref(null);

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN');
}

onMounted(async () => {
  const { data } = await api.get(`/api/admin/attendance/${route.params.id}`);
  record.value = data;
});
</script>
