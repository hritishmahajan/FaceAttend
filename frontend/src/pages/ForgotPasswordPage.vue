<template>
  <q-page class="flex flex-center bg-grey-2" style="min-height:100vh">
    <q-card style="width:360px;max-width:95vw" class="q-pa-md shadow-4">
      <q-card-section class="text-center">
        <q-icon name="lock_reset" size="48px" color="primary" />
        <div class="text-h6 text-weight-bold q-mt-sm">Reset password</div>
        <div class="text-caption text-grey">
          {{ step === 1 ? 'Enter your email to get an OTP' : 'Enter the OTP and your new password' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form v-if="step === 1" @submit.prevent="requestOtp" class="q-gutter-md">
          <q-input v-model="email" label="Email" type="email" outlined dense
            :rules="[v => !!v || 'Email required']" />
          <q-btn label="Send OTP" type="submit" color="primary" class="full-width" :loading="loading" />
        </q-form>

        <q-form v-else @submit.prevent="reset" class="q-gutter-md">
          <q-input v-model="otp" label="6-digit OTP" mask="######" unmasked-value outlined dense
            inputmode="numeric"
            input-style="text-align:center;font-size:1.3rem;letter-spacing:0.4rem" />
          <q-input v-model="password" label="New password" :type="showPwd ? 'text' : 'password'" outlined dense
            :rules="[v => v.length >= 6 || 'Min 6 characters']">
            <template #append>
              <q-icon :name="showPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="showPwd = !showPwd" />
            </template>
          </q-input>
          <q-btn label="Reset password" type="submit" color="primary" class="full-width" :loading="loading" />
          <q-btn label="Back" flat color="primary" class="full-width" @click="step = 1" />
        </q-form>

        <div class="text-center q-mt-md">
          <router-link to="/login" class="text-primary">Back to login</router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { AuthApi } from 'src/api/auth.api';

const $q = useQuasar();
const router = useRouter();

const step = ref(1);
const email = ref('');
const otp = ref('');
const password = ref('');
const showPwd = ref(false);
const loading = ref(false);

async function requestOtp() {
  loading.value = true;
  try {
    await AuthApi.forgotPassword({ email: email.value });
    $q.notify({ type: 'positive', message: 'If that email is registered, an OTP has been sent.' });
    step.value = 2;
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error ?? 'Something went wrong' });
  } finally {
    loading.value = false;
  }
}

async function reset() {
  if (otp.value.length !== 6) return $q.notify({ type: 'warning', message: 'Enter the 6-digit OTP' });
  loading.value = true;
  try {
    await AuthApi.resetPassword({ email: email.value, otp: otp.value, password: password.value });
    $q.notify({ type: 'positive', message: 'Password updated. Please log in.' });
    router.replace('/login');
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.error ?? 'Reset failed' });
  } finally {
    loading.value = false;
  }
}
</script>
