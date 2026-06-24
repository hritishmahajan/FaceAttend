<template>
  <q-page class="flex flex-center bg-grey-2" style="min-height:100vh">
    <q-card style="width:380px;max-width:95vw" class="q-pa-md shadow-4">
      <q-card-section class="text-center">
        <q-icon name="person_add" size="48px" color="primary" />
        <div class="text-h6 text-weight-bold q-mt-sm">Create Account</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="register" class="q-gutter-md">
          <q-input v-model="form.name" label="Full Name" outlined dense :rules="[v => !!v || 'Required']">
            <template #prepend><q-icon name="person" /></template>
          </q-input>
          <q-input v-model="form.email" label="Email" type="email" outlined dense
            :rules="[v => !!v || 'Required', v => /.+@.+/.test(v) || 'Invalid email']">
            <template #prepend><q-icon name="email" /></template>
          </q-input>
          <q-input v-model="form.phone" label="Phone (10 digits)" type="tel" outlined dense
            :rules="[v => !!v || 'Required', v => /^\d{10}$/.test(v) || '10 digits required']">
            <template #prepend><q-icon name="phone" /></template>
          </q-input>
          <q-input v-model="form.password" label="Password" :type="showPwd ? 'text' : 'password'"
            outlined dense :rules="[v => !!v || 'Required', v => v.length >= 6 || 'Min 6 chars']">
            <template #prepend><q-icon name="lock" /></template>
            <template #append>
              <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPwd = !showPwd" />
            </template>
          </q-input>
          <q-btn type="submit" label="Register" color="primary" class="full-width" :loading="loading" />
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <router-link to="/login" class="text-primary">Already have an account? Login</router-link>
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
const form = reactive({ name: '', email: '', phone: '', password: '' });

async function register() {
  loading.value = true;
  try {
    const { data } = await AuthApi.register(form);
    auth.pendingUserId = data.userId;
    $q.notify({ type: 'positive', message: 'Account created! Check your email for OTP.' });
    router.push({ path: '/verify-otp', query: { mode: 'register' } });
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error ?? 'Registration failed' });
  } finally {
    loading.value = false;
  }
}
</script>
