<template>
  <q-page class="flex flex-center bg-grey-2" style="min-height:100vh">
    <q-card style="width:360px;max-width:95vw" class="q-pa-md shadow-4">
      <q-card-section class="text-center">
        <q-icon name="verified_user" size="48px" color="primary" />
        <div class="text-h6 text-weight-bold q-mt-sm">Verify OTP</div>
        <div class="text-caption text-grey">Enter the 6-digit code sent to your email</div>
      </q-card-section>

      <q-card-section>
        <q-input
          ref="otpInput"
          v-model="otp"
          mask="######"
          unmasked-value
          inputmode="numeric"
          outlined
          class="q-mb-lg"
          input-style="text-align:center;font-size:1.8rem;font-weight:bold;letter-spacing:0.5rem"
          placeholder="------"
          @keyup.enter="verify"
        />

        <q-btn label="Verify" color="primary" class="full-width q-mb-sm" :loading="loading" @click="verify" />
        <q-btn label="Resend OTP" flat color="primary" class="full-width"
          :loading="resending" :disable="countdown > 0" @click="resend" />
        <div class="text-center text-caption text-grey q-mt-xs">
          {{ countdown > 0 ? `Resend in ${countdown}s` : 'You can resend now' }}
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { AuthApi } from 'src/api/auth.api';
import { useAuthStore } from 'src/stores/auth';

const $q     = useQuasar();
const router = useRouter();
const auth   = useAuthStore();

const otp      = ref('');
const otpInput = ref(null);
const loading  = ref(false);
const resending = ref(false);
const countdown = ref(60);
let timer = null;

onMounted(() => {
  otpInput.value?.focus();
  timer = setInterval(() => { if (countdown.value > 0) countdown.value--; }, 1000);
});
onUnmounted(() => clearInterval(timer));

async function verify() {
  if (otp.value.length !== 6) return $q.notify({ type: 'warning', message: 'Enter all 6 digits' });
  loading.value = true;
  try {
    const { data } = await AuthApi.verifyOtp({ userId: auth.pendingUserId, otp: otp.value });
    auth.setToken(data.token);
    auth.setUser(data.user);
    $q.notify({ type: 'positive', message: 'Verified successfully!' });
    router.replace(data.user.face_descriptor ? (auth.isAdmin ? '/admin' : '/dashboard') : '/face-setup');
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error ?? 'Invalid OTP' });
    otp.value = '';
    otpInput.value?.focus();
  } finally {
    loading.value = false;
  }
}

async function resend() {
  if (countdown.value > 0) return;
  resending.value = true;
  try {
    await AuthApi.resendOtp({ userId: auth.pendingUserId });
    countdown.value = 60;
    $q.notify({ type: 'positive', message: 'OTP resent to your email' });
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to resend OTP' });
  } finally {
    resending.value = false;
  }
}
</script>
