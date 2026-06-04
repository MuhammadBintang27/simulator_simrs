<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :style="{ width: '420px' }"
    class="ttd-dialog"
    @hide="handleClose"
    :closable="false"
  >
    <div class="ttd-wrap">
      <!-- Header -->
      <div class="ttd-header">
        <div class="ttd-header-icon">
          <i class="pi pi-pen-to-square" />
        </div>
        <div class="ttd-header-text">
          <h3 class="ttd-title">Otorisasi Tanda Tangan</h3>
          <p class="ttd-subtitle">
            {{
              isDokter
                ? 'Masukkan PIN untuk mengonfirmasi identitas Anda'
                : 'Masukkan username dan PIN untuk konfirmasi'
            }}
          </p>
        </div>
        <button class="ttd-close" @click="handleClose">
          <i class="pi pi-times" />
        </button>
      </div>

      <div class="ttd-divider" />
      <!-- Form -->
      <div class="ttd-body">
        <div v-if="!isDokter" class="ttd-field">
          <label class="ttd-label">Username</label>
          <div class="ttd-input-wrap" :class="{ 'is-invalid': usernameError }">
            <i class="pi pi-user ttd-input-icon" />
            <InputText
              id="username"
              v-model="username"
              type="text"
              placeholder="Masukkan username"
              class="ttd-input"
              autocomplete="username"
            />
          </div>

          <span v-if="usernameError" class="ttd-error">{{ usernameError }}</span>
        </div>

        <div class="ttd-field">
          <label class="ttd-label">Kode PIN / Passphrase</label>
          <div class="ttd-input-wrap" :class="{ 'is-invalid': otpError }">
            <i class="pi pi-lock ttd-input-icon" />
            <InputText
              v-model="password"
              type="password"
              placeholder="Masukkan PIN atau passphrase"
              class="ttd-input"
              autocomplete="current-password"
              @keydown.enter="handleEnterPress"
            />
          </div>
          <span v-if="otpError" class="ttd-error">{{ otpError }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="ttd-footer">
        <Button
          label="Batal"
          icon="pi pi-times"
          class="ttd-btn-cancel"
          @click="handleClose"
          :disabled="loading"
          text
        />
        <Button
          label="Verifikasi"
          icon="pi pi-check"
          class="ttd-btn-verify"
          :loading="loading"
          @click="verifyOtp"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const toast = useToast()
const authStore = useAuthStore()
const { id_client, use_tte_bsre, group_user, user_id } = storeToRefs(authStore)

const loading = ref(false)
const password = ref('')
const username = ref('')
const usernameError = ref('')
const otpError = ref('')
let timerInterval = null

const isDokter = computed(() => group_user.value === 'DOKTER')

// DOKTER → ambil dari store login, non-DOKTER → dari input form
const apiUserId = computed(() => (isDokter.value ? user_id.value : username.value))

const props = defineProps({
  showFormOtorisasi: { type: Boolean, default: false },
  noregister: { type: [String, Number] },
  mode: { type: Number },
  link_ttd: { type: String, default: null },
  record_id: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:showFormOtorisasi', 'otpVerified'])

const localVisible = computed({
  get: () => props.showFormOtorisasi,
  set: (value) => emit('update:showFormOtorisasi', value),
})

const validateUsername = () => {
  if (isDokter.value) return true
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

const validatePassword = () => {
  if (!password.value) {
    otpError.value = 'PIN atau passphrase tidak boleh kosong'
    return false
  }
  otpError.value = ''
  return true
}

const handleEnterPress = (e) => {
  e.preventDefault()
  verifyOtp()
}

const handleClose = () => {
  usernameError.value = ''
  otpError.value = ''
  password.value = ''
  username.value = ''
  emit('update:showFormOtorisasi', false)
}

// Hanya load username dari localStorage untuk non-DOKTER
const loadUsername = () => {
  if (isDokter.value) return
  try {
    const saved = localStorage.getItem('username')
    if (saved?.trim()) username.value = saved
  } catch {}
}

watch(
  () => props.showFormOtorisasi,
  (visible) => {
    if (visible) loadUsername()
  },
)

watch(username, (val) => {
  if (!isDokter.value && val) {
    try {
      localStorage.setItem('username', val)
    } catch {}
  }
})

const verifyOtp = async () => {
  usernameError.value = ''
  otpError.value = ''

  if (!validateUsername() || !validatePassword()) return

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
    const response = await axios.post(`${configStore.apiBaseUrl}/index.php/api/Triaseigd/${link}`, payload)

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

onMounted(() => loadUsername())
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
/* ── Dialog override ── */
:deep(.ttd-dialog .p-dialog-header) {
  display: none;
}
:deep(.ttd-dialog .p-dialog-content) {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
}

/* ── Wrapper ── */
.ttd-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

/* ── Header ── */
.ttd-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 20px 16px;
  border-left: 4px solid darkcyan;
  background: #f8fffe;
}

.ttd-header-icon {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  background: rgba(0, 139, 139, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ttd-header-icon i {
  font-size: 17px;
  color: darkcyan;
}

.ttd-header-text {
  flex: 1;
}

.ttd-title {
  margin: 0 0 3px;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.ttd-subtitle {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.ttd-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition:
    background 0.15s,
    color 0.15s;
}
.ttd-close:hover {
  background: #fee2e2;
  color: #ef4444;
}
.ttd-close i {
  font-size: 12px;
}

.ttd-divider {
  height: 1px;
  background: #e2e8f0;
}

/* ── Body ── */
.ttd-body {
  padding: 20px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ttd-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ttd-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.ttd-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ttd-input-icon {
  position: absolute;
  left: 11px;
  font-size: 13px;
  color: #94a3b8;
  pointer-events: none;
  z-index: 1;
}

.ttd-input {
  width: 100%;
  height: 40px;
  padding-left: 34px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  background: #fff !important;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

:deep(.ttd-input:focus) {
  border-color: darkcyan !important;
  box-shadow: 0 0 0 3px rgba(0, 139, 139, 0.12) !important;
  outline: none;
}

.ttd-input-wrap.is-invalid .ttd-input {
  border-color: #ef4444 !important;
}

.ttd-error {
  font-size: 11px;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Footer ── */
.ttd-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 20px;
}

.ttd-btn-cancel {
  height: 36px;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #64748b !important;
  border-radius: 8px !important;
  padding: 0 14px !important;
}
.ttd-btn-cancel:hover {
  color: #ef4444 !important;
}

.ttd-btn-verify {
  height: 36px;
  font-size: 13px !important;
  font-weight: 600 !important;
  background: darkcyan !important;
  border-color: darkcyan !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 0 18px !important;
  box-shadow: 0 2px 8px rgba(0, 139, 139, 0.25);
  transition:
    background 0.15s,
    box-shadow 0.15s;
}
.ttd-btn-verify:hover:not(:disabled) {
  background: #006666 !important;
  border-color: #006666 !important;
  box-shadow: 0 4px 12px rgba(0, 139, 139, 0.35);
}
.ttd-btn-verify:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
