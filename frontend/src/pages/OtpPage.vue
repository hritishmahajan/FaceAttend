<template>
  <q-page class="flex flex-center bg-grey-2" style="min-height:100vh">
    <q-card style="width:360px;max-width:95vw" class="q-pa-md shadow-4">
      <q-card-section class="text-center">
        <q-icon name="verified_user" size="48px" color="primary" />
        <div class="text-h6 text-weight-bold q-mt-sm">Verify OTP</div>
        <div class="text-caption text-grey">Enter the 6-digit code sent to your email</div>
      </q-card-section>

      <q-card-section>
        <div class="row justify-center q-gutter-sm q-mb-lg">
          <q-input
            v-for="(_, i) in digits"
            :key="i"
            v-model="digits[i]"
            :ref="el => { if (el) inputs[i] = el; }"
            maxlength="1"
            outlined dense
            style="width:44px"
            input-style="text-align:center;font-size:1.4rem;font-weight:bold"
            @input="onDigit(i, $event)"
            @keydown.backspace="onBack(i)"
          />
        </div>

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
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { AuthApi } from 'src/api/auth.api';
import { useAuthStore } from 'src/stores/auth';

const $q     = useQuasar();
const router = useRouter();
const auth   = useAuthStore();

const digits   = reactive(['', '', '', '', '', '']);
const inputs   = ref([]);
const loading  = ref(false);
const resending = ref(false);
const countdown = ref(60);
let timer = null;

onMounted(() => {
  inputs.value[0]?.focus();
  timer = setInterval(() => { if (countdown.value > 0) countdown.value--; }, 1000);
});
onUnmounted(() => clearInterval(timer));

function onDigit(i, e) {
  const val = e.target.value.replace(/\D/g, '');
  digits[i] = val.slice(-1);
  if (val && i < 5) inputs.value[i + 1]?.focus();
}
function onBack(i) {
  if (!digits[i] && i > 0) { digits[i - 1] = ''; inputs.value[i - 1]?.focus(); }
}

async function verify() {
  const otp = digits.join('');
  if (otp.length !== 6) return $q.notify({ type: 'warning', message: 'Enter all 6 digits' });
  loading.value = true;
  try {
    const { data } = await AuthApi.verifyOtp({ userId: auth.pendingUserId, otp });
    auth.setToken(data.token);
    auth.setUser(data.user);
    $q.notify({ type: 'positive', message: 'Verified successfully!' });
    router.replace(data.user.face_descriptor ? (auth.isAdmin ? '/admin' : '/dashboard') : '/face-setup');
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error ?? 'Invalid OTP' });
    digits.fill('');
    inputs.value[0]?.focus();
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
