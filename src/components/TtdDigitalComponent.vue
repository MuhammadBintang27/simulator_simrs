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
        <!-- Header Section -->
        <div class="otp-header">
          <div class="otp-icon">
            <i class="pi pi-shield" />
          </div>
          <h2 class="otp-title">Tanda Tangan Digital</h2>
          <p class="otp-description">
            Masukkan username dan kode PIN untuk verifikasi tanda tangan digital Anda
          </p>
        </div>

        <!-- Form Section -->
        <div class="otp-form">
          <div class="form-field">
            <label for="username" class="form-label">
              <i class="pi pi-user" />
              Username
            </label>
            <InputText
              id="username"
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              class="form-input"
              :class="{ 'p-invalid': usernameError }"
            />
            <small v-if="usernameError" class="error-text">{{ usernameError }}</small>
          </div>

          <div class="form-field">
            <label class="form-label">
              <i class="pi pi-lock" />
              Kode PIN/Passphrase
            </label>
            <InputText
              v-model="password"
              type="password"
              placeholder="Pin atau passphrase"
              class="form-input"
              @keydown.enter="handleEnterPress"
            />

            <small v-if="otpError" class="error-text">{{ otpError }}</small>
          </div>
        </div>

        <!-- Actions Section -->
        <div class="otp-actions">
          <Button
            label="Verifikasi"
            @click="verifyOtp"
            :loading="loading"
            class="verify-btn"
            icon="pi pi-check"
          />
        </div>

        <!-- Close Button -->
        <Button
          @click="handleClose"
          class="close-btn"
          icon="pi pi-times"
          severity="secondary"
          text
          rounded
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import InputOtp from 'primevue/inputotp'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const toast = useToast()

const loading = ref(false)
const password = ref('')
const username = ref('')
const otp_user = ref('')
const usernameError = ref('')
const otpError = ref('')
let timerInterval = null

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, use_tte_bsre } = storeToRefs(authStore)

const props = defineProps({
  showFormOtorisasi: {
    type: Boolean,
    default: false,
  },
  noregister: {
    type: String,
  },
  mode: {
    type: Number,
  },
})

// Watch for localStorage
watch(username, (newVal) => {
  if (newVal) {
    try {
      localStorage.setItem('username', newVal)
      const saved = localStorage.getItem('username')
      console.log(saved)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  } else {
    //localStorage.removeItem('username')
  }
})

// Define emits
const emit = defineEmits(['update:showFormOtorisasi', 'otpVerified'])

// Computed properties
const localVisible = computed({
  get: () => props.showFormOtorisasi,
  set: (value) => emit('update:showFormOtorisasi', value),
})

const canVerify = computed(() => {
  return username.value.trim() && username.value && username.value.length > 3 && !loading.value
})

// Methods
const validateUsername = () => {
  if (!username.value.trim()) {
    usernameError.value = 'Username tidak boleh kosong'
    return false
  }
  if (username.value.length < 3) {
    usernameError.value = 'Username minimal 3 karakter'
    return false
  }
  usernameError.value = ''
  return true
}

const validateOtp = () => {
  if (!username.value) {
    otpError.value = 'Pin atau passphrase tidak boleh kosong'
    return false
  }
  otpError.value = ''
  return true
}

const handleEnterPress = (event) => {
  event.preventDefault()
  if (canVerify.value) {
    verifyOtp()
  }
}

const handleClose = () => {
  clearErrors()
  username.value = ''
  password.value = ''
  otp_user.value = ''
  emit('update:showFormOtorisasi', false)
}

// Create a separate function to load username
const loadUsernameFromStorage = () => {
  try {
    const saved = localStorage.getItem('username')
    if (saved && saved.trim()) {
      username.value = saved
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
}

// Add a watcher for when the dialog becomes visible
watch(
  () => props.showFormOtorisasi,
  (isVisible) => {
    if (isVisible) {
      loadUsernameFromStorage()
    }
  },
)

const clearErrors = () => {
  usernameError.value = ''
  otpError.value = ''
}

const verifyOtp = async () => {
  clearErrors()

  if (!validateOtp()) {
    return
  }

  try {
    loading.value = true

    const data_param = {
      id_client: id_client.value,
      user_id: username.value,
      pwd: password.value,
      noregister: props.noregister,
      mode: props.mode,
    }

    // Simulate API call - replace with your actual verification logic
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Triaseigd/otorisasi_v3`, data_param)

    console.log(response.data)

    if (response.data.metadata.code == '200') {
      showSuccess('Verifikasi berhasil! Tanda tangan digital telah dikonfirmasi.')

      if (props.mode == 10) {
        if (response.data.metadata?.url != '') {
          window.open(response.data.metadata?.url, '_blank')
        }
      }

      emit('otpVerified', { username: username.value, verified: true })
      handleClose()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Verifikasi Gagal',
        detail: response.data?.message || 'Kode OTP atau username tidak valid',
        life: 4000,
      })
    }
    // Simulate delay for better UX
  } catch (error) {
    console.error('Error verifying OTP:', error)
  } finally {
    loading.value = false
  }
}

const showSuccess = (message) => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 4000,
  })
}

// Lifecycle
onMounted(() => {
  loadUsernameFromStorage()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
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
