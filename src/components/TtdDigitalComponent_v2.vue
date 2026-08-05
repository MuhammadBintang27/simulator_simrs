<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :style="{ width: '500px' }"
    class="patient-detail-dialog"
    @hide="handleClose"
    :closable="false"
  >
    <div class="otp-container">
      <div class="otp-content">
        <!-- Header -->
        <div class="otp-header">
          <div class="otp-icon">
            <i class="pi pi-shield" />
          </div>
          <h2 class="otp-title">Tanda Tangan Digital</h2>
          <p class="otp-description">
            {{
              isVerifyMode
                ? isDokter
                  ? 'Masukkan PIN untuk mengonfirmasi identitas Anda'
                  : 'Masukkan username dan PIN untuk konfirmasi'
                : 'Masukkan username dan kode PIN untuk verifikasi tanda tangan digital Anda'
            }}
          </p>
        </div>

        <!-- Form -->
        <div class="otp-form">
          <div v-if="showUsernameField" class="form-field">
            <label class="form-label"> <i class="pi pi-user" /> Username </label>

            <InputText
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              class="form-input"
              :class="{ 'p-invalid': usernameError }"
            />
            <small v-if="usernameError" class="error-text">{{ usernameError }}</small>
          </div>

          <div class="form-field">
            <label class="form-label"> <i class="pi pi-lock" /> Kode PIN / Passphrase </label>

            <InputText
              v-model="password"
              type="password"
              placeholder="PIN atau passphrase"
              class="form-input"
              :class="{ 'p-invalid': otpError }"
              @keydown.enter="onSubmit"
            />
            <small v-if="otpError" class="error-text">{{ otpError }}</small>
          </div>
        </div>

        <!-- Action -->
        <div class="otp-actions">
          <Button
            label="Verifikasi"
            @click="onSubmit"
            :loading="loading"
            class="verify-btn"
            icon="pi pi-check"
          />
        </div>

        <!-- Close -->
        <Button @click="handleClose" class="close-btn" icon="pi pi-times" text rounded />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'

const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, group_user, user_id } = storeToRefs(authStore)

/* Props */
const props = defineProps({
  showFormOtorisasi: {
    type: Boolean,
    default: false,
  },
  noregister: [String, Number],
  mode: Number,
  link_ttd: { type: String, default: null },
  record_id: { type: [Number, String], default: null },
  // formMode 1: verifikasi langsung ke server (perilaku TtdDigitalComponent lama) —
  //   username/PIN divalidasi lewat endpoint otorisasi, event 'otpVerified' baru terpicu
  //   setelah server mengonfirmasi valid.
  // formMode 2 (default, perilaku form ini sejak awal): form HANYA menampung ketikan
  //   username & password, tanpa panggilan API. Isian di-emit apa adanya lewat 'otpVerified'
  //   supaya form pemanggil yang menentukan mau diapakan (mis. dipakai untuk API otorisasi
  //   miliknya sendiri, seperti di ProsesLabView.vue).
  formMode: { type: Number, default: 2 },
})

/* Emits */
const emit = defineEmits(['update:showFormOtorisasi', 'otpVerified'])

/* State */
const username = ref('')
const password = ref('')
const usernameError = ref('')
const otpError = ref('')
const loading = ref(false)

const isVerifyMode = computed(() => props.formMode === 1)
const isDokter = computed(() => group_user.value === 'DOKTER')
// DOKTER → ambil dari store login, non-DOKTER / mode input → dari input form
const apiUserId = computed(() => (isVerifyMode.value && isDokter.value ? user_id.value : username.value))
// Di mode verifikasi, DOKTER tidak perlu isi username (identitasnya dari sesi login).
// Di mode input, username selalu ditampilkan karena form ini murni penampung ketikan.
const showUsernameField = computed(() => !(isVerifyMode.value && isDokter.value))

/* Visibility using v-model */
const localVisible = computed({
  get: () => props.showFormOtorisasi,
  set: (value) => emit('update:showFormOtorisasi', value),
})

/* Auto load username from localStorage */
const loadUsername = () => {
  if (isVerifyMode.value && isDokter.value) return
  const saved = localStorage.getItem('username')
  if (saved) username.value = saved
}

watch(username, (val) => {
  if (showUsernameField.value && val) {
    localStorage.setItem('username', val)
  }
})

watch(
  () => props.showFormOtorisasi,
  (val) => {
    if (val) loadUsername()
  },
)

onMounted(() => {
  loadUsername()
})

/* Validation */
const validate = () => {
  let valid = true

  if (showUsernameField.value) {
    if (!username.value.trim()) {
      usernameError.value = 'Username tidak boleh kosong'
      valid = false
    } else {
      usernameError.value = ''
    }
  } else {
    usernameError.value = ''
  }

  if (!password.value.trim()) {
    otpError.value = 'PIN / passphrase tidak boleh kosong'
    valid = false
  } else {
    otpError.value = ''
  }

  return valid
}

/* formMode 2 (default): tidak ada panggilan API, langsung emit isian ke parent */
const submitInputOnly = () => {
  loading.value = true

  setTimeout(() => {
    emit('otpVerified', {
      username: username.value,
      password: password.value,
      verified: true,
      noregister: props.noregister,
      mode: props.mode,
    })

    loading.value = false
    handleClose()
  }, 500)
}

/* formMode 1: verifikasi ke endpoint otorisasi (sama seperti TtdDigitalComponent lama) */
const submitVerify = async () => {
  try {
    loading.value = true

    const link = props.link_ttd?.trim() || 'otorisasi_v3'
    const payload = {
      id_client: id_client.value,
      user_id: apiUserId.value,
      pwd: password.value,
      noregister: props.noregister,
      mode: props.mode,
    }
    if (props.record_id != null) payload.id = props.record_id

    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/${link}`,
      payload,
    )

    if (response.data.metadata.code == '200') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Tanda tangan digital telah dikonfirmasi.',
        life: 3000,
      })

      if (props.mode == 10 && response.data.metadata?.url) {
        window.open(response.data.metadata.url, '_blank')
      }

      emit('otpVerified', { username: apiUserId.value, verified: true })
      handleClose()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Verifikasi Gagal',
        detail: response.data?.message || 'Username atau PIN tidak valid',
        life: 4000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan koneksi.',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

const onSubmit = () => {
  if (!validate()) return
  isVerifyMode.value ? submitVerify() : submitInputOnly()
}

/* Close Dialog */
const handleClose = () => {
  usernameError.value = ''
  otpError.value = ''
  password.value = ''
  localVisible.value = false
}
</script>

<style scoped>
/* Container Styles */
.otp-container {
  position: relative;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  min-height: 400px;
}

.otp-content {
  max-width: 100%;
  margin: 0 auto;
}

/* Header Styles */
.otp-header {
  text-align: center;
  margin-bottom: 2rem;
}

.otp-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.otp-icon i {
  font-size: 24px;
  color: white;
}

.otp-title {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.otp-description {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Form Styles */
.otp-form {
  margin-bottom: 2rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-label i {
  color: #6366f1;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.form-input.p-invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

/* OTP Input Styles */
.centered-otp {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin: 1rem 0;
}

.custom-otp-input {
  width: 48px !important;
  height: 56px !important;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  transition: all 0.2s ease;
  color: #1e293b;
}

.custom-otp-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  outline: none;
  transform: scale(1.05);
}

.custom-otp-input:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #fefefe;
}

/* Timer Styles */
.timer-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
}

.timer-section i {
  font-size: 1rem;
}

/* Action Buttons */
.otp-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.verify-btn {
  height: 48px;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.resend-btn {
  height: 44px;
  font-weight: 500;
  border-radius: 0.75rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  transition: all 0.2s ease;
}

.resend-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f8fafc;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.1);
  border: none;
  color: #64748b;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.1);
}

/* Error Text */
.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* Responsive Design */
@media (max-width: 768px) {
  .otp-container {
    padding: 1.5rem 1rem;
  }

  .otp-title {
    font-size: 1.375rem;
  }

  .centered-otp {
    gap: 0.5rem;
  }

  .custom-otp-input {
    width: 42px !important;
    height: 50px !important;
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .otp-container {
    padding: 1rem 0.75rem;
  }

  .centered-otp {
    gap: 0.375rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .custom-otp-input {
    width: 38px !important;
    height: 46px !important;
    font-size: 1rem;
  }
}

/* Dialog Overrides */
:deep(.patient-detail-dialog .p-dialog-content) {
  padding: 0;
  border-radius: 1rem;
  overflow: hidden;
}

:deep(.patient-detail-dialog .p-dialog-header) {
  display: none;
}

/* Loading States */
.custom-otp-input:disabled {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Animation for success */
@keyframes success-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.verify-btn.success {
  animation: success-pulse 0.3s ease;
}
</style>
