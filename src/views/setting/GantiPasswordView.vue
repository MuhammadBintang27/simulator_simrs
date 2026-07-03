<template>
  <div class="gp-wrapper">
    <div class="gp-card">
      <!-- Header -->
      <div class="gp-header">
        <div class="gp-header-icon">
          <i class="fas fa-lock"></i>
        </div>
        <div>
          <h4 class="gp-title">Ganti Password</h4>
          <p class="gp-subtitle">Perbarui password akun Anda</p>
        </div>
      </div>

      <Divider />

      <!-- Info User -->
      <div class="gp-user-info">
        <i class="pi pi-user gp-user-icon"></i>
        <div>
          <div class="gp-user-name">{{ authStore.user_name }}</div>
          <div class="gp-user-label">Pengguna aktif</div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitGantiPassword" class="gp-form">
        <!-- Password Lama -->
        <div class="gp-field">
          <label class="gp-label">
            <i class="fas fa-key" style="color:#6b7280"></i> Password Lama
          </label>
          <Password
            v-model="form.password_lama"
            :feedback="false"
            toggleMask
            placeholder="Masukkan password lama"
            class="w-full"
            inputClass="w-full"
            :class="{ 'p-invalid': errors.password_lama }"
          />
          <small v-if="errors.password_lama" class="gp-error">{{ errors.password_lama }}</small>
        </div>

        <!-- Password Baru -->
        <div class="gp-field">
          <label class="gp-label">
            <i class="fas fa-lock" style="color:#0891b2"></i> Password Baru
          </label>
          <Password
            v-model="form.password_baru"
            toggleMask
            placeholder="Minimal 6 karakter"
            class="w-full"
            inputClass="w-full"
            :class="{ 'p-invalid': errors.password_baru }"
            promptLabel="Masukkan password"
            weakLabel="Lemah"
            mediumLabel="Sedang"
            strongLabel="Kuat"
          />
          <small v-if="errors.password_baru" class="gp-error">{{ errors.password_baru }}</small>
        </div>

        <!-- Konfirmasi Password -->
        <div class="gp-field">
          <label class="gp-label">
            <i class="fas fa-check-circle" style="color:#16a34a"></i> Konfirmasi Password Baru
          </label>
          <Password
            v-model="form.konfirmasi"
            :feedback="false"
            toggleMask
            placeholder="Ulangi password baru"
            class="w-full"
            inputClass="w-full"
            :class="{ 'p-invalid': errors.konfirmasi }"
          />
          <small v-if="errors.konfirmasi" class="gp-error">{{ errors.konfirmasi }}</small>
        </div>

        <!-- Alert sukses / error -->
        <Message v-if="alertMsg" :severity="alertSeverity" :closable="true" class="mb-2">
          {{ alertMsg }}
        </Message>

        <!-- Tombol -->
        <div class="gp-actions">
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="resetForm"
            :disabled="loading"
          />
          <Button
            type="submit"
            label="Simpan Password"
            icon="pi pi-check"
            :loading="loading"
            severity="success"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { user_name, user_id, id_client } = storeToRefs(authStore)

const loading = ref(false)
const alertMsg = ref('')
const alertSeverity = ref('success')

const form = reactive({
  password_lama: '',
  password_baru: '',
  konfirmasi: '',
})

const errors = reactive({
  password_lama: '',
  password_baru: '',
  konfirmasi: '',
})

const clearErrors = () => {
  errors.password_lama = ''
  errors.password_baru = ''
  errors.konfirmasi = ''
  alertMsg.value = ''
}

const validate = () => {
  clearErrors()
  let valid = true

  if (!form.password_lama) {
    errors.password_lama = 'Password lama wajib diisi'
    valid = false
  }
  if (!form.password_baru) {
    errors.password_baru = 'Password baru wajib diisi'
    valid = false
  } else if (form.password_baru.length < 6) {
    errors.password_baru = 'Password baru minimal 6 karakter'
    valid = false
  }
  if (!form.konfirmasi) {
    errors.konfirmasi = 'Konfirmasi password wajib diisi'
    valid = false
  } else if (form.konfirmasi !== form.password_baru) {
    errors.konfirmasi = 'Konfirmasi password tidak cocok'
    valid = false
  }

  return valid
}

const submitGantiPassword = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/ganti_password`,
      {
        user_id: user_id.value,
        id_client: id_client.value,
        password_lama: form.password_lama,
        password_baru: form.password_baru,
      },
    )

    const code = res.data?.metadata?.code ?? res.data?.code
    if (code === 200 || code === '200') {
      alertSeverity.value = 'success'
      alertMsg.value = 'Password berhasil diubah.'
      resetForm()
    } else {
      alertSeverity.value = 'error'
      alertMsg.value = res.data?.metadata?.message || res.data?.message || 'Gagal mengubah password.'
    }
  } catch (err) {
    alertSeverity.value = 'error'
    alertMsg.value = err.response?.data?.metadata?.message || 'Terjadi kesalahan. Coba lagi.'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.password_lama = ''
  form.password_baru = ''
  form.konfirmasi = ''
  clearErrors()
}
</script>

<style scoped>
.gp-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.gp-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2rem;
  width: 100%;
  max-width: 480px;
}

.gp-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.gp-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0891b2, #0e7490);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
}

.gp-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.gp-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.gp-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 1.5rem;
}

.gp-user-icon {
  font-size: 22px;
  color: #0891b2;
}

.gp-user-name {
  font-weight: 600;
  font-size: 14px;
  color: #0c4a6e;
}

.gp-user-label {
  font-size: 11px;
  color: #6b7280;
}

.gp-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.gp-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gp-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.gp-error {
  color: #ef4444;
  font-size: 12px;
}

.gp-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 0.5rem;
}
</style>
