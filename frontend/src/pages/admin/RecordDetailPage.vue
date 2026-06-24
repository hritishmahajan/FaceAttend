<template>
  <q-page class="q-pa-md" v-if="record">
    <q-btn flat icon="arrow_back" label="Back" @click="$router.back()" class="q-mb-md" />
    <div class="text-h6 q-mb-md">Attendance Record – {{ record.name }}</div>

    <div class="row q-gutter-md">
      <q-card class="col-12 col-md-6">
        <q-card-section>
          <q-list>
            <q-item v-for="f in fields" :key="f.label">
              <q-item-section>
                <q-item-label caption>{{ f.label }}</q-item-label>
                <q-item-label :class="f.class">{{ f.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-md-5">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">Punch In Photo</div>
          <q-img v-if="record.punch_in_photo" :src="AdminApi.photoUrl(record.punch_in_photo)"
            style="border-radius:8px;max-height:200px" fit="contain" />
          <div v-else class="text-grey text-center q-py-md">No photo</div>

          <div class="text-subtitle1 q-mt-md q-mb-sm">Punch Out Photo</div>
          <q-img v-if="record.punch_out_photo" :src="AdminApi.photoUrl(record.punch_out_photo)"
            style="border-radius:8px;max-height:200px" fit="contain" />
          <div v-else class="text-grey text-center q-py-md">No photo</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
  <q-page v-else class="flex flex-center"><q-spinner size="48px" /></q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { AdminApi } from 'src/api/admin.api';

const route  = useRoute();
const record = ref(null);

function fmt(iso) { return iso ? new Date(iso).toLocaleString('en-IN') : '—'; }

const fields = computed(() => record.value ? [
  { label: 'Employee',   value: record.value.name },
  { label: 'Email',      value: record.value.email },
  { label: 'Date',       value: record.value.date },
  { label: 'Punch In',   value: fmt(record.value.punch_in) },
  { label: 'Punch Out',  value: fmt(record.value.punch_out) },
  { label: 'Total Shift', value: record.value.shift ?? '—', class: record.value.shift ? 'text-positive text-weight-bold text-h6' : '' },
  { label: 'Location',   value: record.value.lat ? `${record.value.lat.toFixed(4)}, ${record.value.lng.toFixed(4)}` : '—' },
] : []);

onMounted(async () => {
  const { data } = await AdminApi.getRecord(route.params.id);
  record.value = data;
});
</script>
