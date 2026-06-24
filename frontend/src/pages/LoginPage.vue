<template>
  <q-page class="flex flex-center bg-grey-2" style="min-height:100vh">
    <q-card style="width:360px;max-width:95vw" class="q-pa-md shadow-4">
      <q-card-section class="text-center">
        <q-icon name="face" size="64px" color="primary" />
        <div class="text-h5 text-weight-bold q-mt-sm">FaceAttend</div>
        <div class="text-caption text-grey">Facial Attendance System</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="login" class="q-gutter-md">
          <q-input v-model="form.email" label="Email" type="email" outlined dense
            :rules="[v => !!v || 'Required', v => /.+@.+/.test(v) || 'Invalid email']">
            <template #prepend><q-icon name="email" /></template>
          </q-input>

          <q-input v-model="form.password" label="Password" :type="showPwd ? 'text' : 'password'"
            outlined dense :rules="[v => !!v || 'Required']">
            <template #prepend><q-icon name="lock" /></template>
            <template #append>
              <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPwd = !showPwd" />
            </template>
          </q-input>

          <q-btn type="submit" label="Login" color="primary" class="full-width" :loading="loading" />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <router-link to="/register" class="text-primary">Don't have an account? Register</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { AuthApi } from 'src/api/auth.api';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const showPwd = ref(false);
const form = reactive({ email: '', password: '' });

async function login() {
  loading.value = true;
  try {
    const { data } = await AuthApi.login(form);
    auth.pendingUserId = data.userId;
    router.push({ path: '/verify-otp', query: { mode: 'login' } });
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.error ?? 'Login failed';
    if (status === 403) {
      auth.pendingUserId = err.response.data.userId;
      router.push({ path: '/verify-otp', query: { mode: 'verify' } });
    } else {
      $q.notify({ type: 'negative', message: msg });
    }
  } finally {
    loading.value = false;
  }
}
</script>
