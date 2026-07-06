<template>
  <div class="gp-wrapper">
    <Toast />
    <div class="gp-layout">
      <!-- Panel Petunjuk -->
      <div class="gp-guide">
        <div class="gp-guide-header">
          <i class="fas fa-shield-alt"></i>
          <span>Keamanan Password</span>
        </div>

        <div class="gp-guide-section">
          <div class="gp-guide-section-title">
            <i class="fas fa-info-circle"></i> Mengapa Mengganti Password?
          </div>
          <p class="gp-guide-text">
            Password adalah kunci utama keamanan akun Anda di sistem ini. Mengganti password secara
            berkala membantu melindungi data pasien dan informasi rumah sakit dari akses yang tidak
            sah. Pastikan Anda menjaga kerahasiaan password dan tidak membagikannya kepada siapapun,
            termasuk sesama petugas.
          </p>
        </div>

        <div class="gp-guide-section">
          <div class="gp-guide-section-title">
            <i class="fas fa-check-double"></i> Syarat Password yang Kuat
          </div>
          <ul class="gp-guide-list">
            <li><i class="fas fa-circle-check"></i> Minimal <strong>6 karakter</strong></li>
            <li>
              <i class="fas fa-circle-check"></i> Kombinasi <strong>huruf besar dan kecil</strong>
            </li>
            <li>
              <i class="fas fa-circle-check"></i> Sisipkan <strong>angka</strong> (contoh: 12, 99)
            </li>
            <li>
              <i class="fas fa-circle-check"></i> Tambahkan
              <strong>karakter khusus</strong> (contoh: @, #, !)
            </li>
            <li>
              <i class="fas fa-circle-check"></i> Jangan gunakan
              <strong>nama atau tanggal lahir</strong>
            </li>
            <li>
              <i class="fas fa-circle-check"></i> Hindari password yang
              <strong>sama dengan sebelumnya</strong>
            </li>
          </ul>
        </div>

        <div class="gp-guide-section">
          <div class="gp-guide-section-title">
            <i class="fas fa-list-ol"></i> Cara Mengganti Password
          </div>
          <ol class="gp-guide-steps">
            <li>Masukkan <strong>password lama</strong> Anda yang sedang aktif.</li>
            <li>Masukkan <strong>password baru</strong> yang memenuhi syarat keamanan.</li>
            <li>Ulangi password baru pada kolom <strong>konfirmasi</strong>.</li>
            <li>Klik tombol <strong>Simpan Password</strong> untuk menyimpan perubahan.</li>
          </ol>
        </div>

        <div class="gp-guide-warning">
          <i class="fas fa-triangle-exclamation"></i>
          <div>
            <strong>Perhatian!</strong> Setelah mengganti password, gunakan password baru untuk
            login berikutnya. Jangan catat password di tempat yang mudah dilihat orang lain.
          </div>
        </div>
      </div>

      <!-- Card Form -->
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
              <i class="fas fa-key" style="color: #6b7280"></i> Password Lama
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
              <i class="fas fa-lock" style="color: #0891b2"></i> Password Baru
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
              <i class="fas fa-check-circle" style="color: #16a34a"></i> Konfirmasi Password Baru
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
    <!-- end gp-layout -->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { user_id, id_client } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)

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
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/ganti_password_user_v1`,
      {
        user_id: user_id.value,
        id_client: id_client.value,
        password_lama: form.password_lama,
        password_baru: form.password_baru,
      },
    )

    const code = res.data?.metadata?.code ?? res.data?.code
    const message = res.data?.metadata?.message || res.data?.message

    if (code === 200 || code === '200') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: message || 'Password berhasil diubah.',
        life: 3000,
      })
      resetForm()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: message || 'Gagal mengubah password.',
        life: 5000,
      })
    }
  } catch (err) {
    const errMsg = err.response?.data?.metadata?.message || 'Terjadi kesalahan. Coba lagi.'
    toast.add({ severity: 'error', summary: 'Error', detail: errMsg, life: 5000 })
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

.gp-layout {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 960px;
  align-items: flex-start;
}

/* ── Panel Petunjuk ── */
.gp-guide {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  min-width: 0;
}

.gp-guide-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 1.2rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e0f2fe;
}

.gp-guide-header i {
  font-size: 18px;
  color: #0891b2;
}

.gp-guide-section {
  margin-bottom: 1.2rem;
}

.gp-guide-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.gp-guide-section-title i {
  color: #0891b2;
}

.gp-guide-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
  margin: 0;
}

.gp-guide-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gp-guide-list li {
  font-size: 13px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.gp-guide-list li i {
  color: #16a34a;
  font-size: 12px;
  flex-shrink: 0;
}

.gp-guide-steps {
  padding-left: 1.2rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gp-guide-steps li {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
}

.gp-guide-warning {
  display: flex;
  gap: 10px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #92400e;
  line-height: 1.6;
}

.gp-guide-warning i {
  color: #f97316;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ── Card Form ── */
.gp-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .gp-layout {
    flex-direction: column-reverse;
  }

  .gp-card {
    max-width: 100%;
  }
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
