<template>
  <div class="login-page">
    <!-- ══ ANIMATED TICKER BACKGROUND ══ -->
    <div class="ticker-bg" aria-hidden="true">
      <div
        v-for="(row, ri) in tickerRows"
        :key="ri"
        class="ticker-row"
        :style="{ '--speed': row.speed }"
      >
        <div class="ticker-track" :class="row.dir === 'ltr' ? 'track-ltr' : 'track-rtl'">
          <div
            v-for="(item, ii) in [...row.items, ...row.items]"
            :key="`r${ri}-i${ii}`"
            class="ticker-box"
          >
            <i :class="item.icon" class="tb-icon"></i>
            <div class="tb-text">
              <span class="tb-title">{{ item.title }}</span>
              <span class="tb-sub">{{ item.sub }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ LOGIN CARD ══ -->
    <div class="login-card">
      <div class="logo-section">
        <h2><strong>SIMRS</strong> LOGIN</h2>
        <img :src="logoUrl" alt="Logo" class="logo" />
        <h2 class="app-title">SISTEM INFORMASI MANAJEMEN RUMAH SAKIT</h2>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input v-model="formData.name" type="text" placeholder="Masukkan username" required />
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="password-wrapper">
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="xxxxxxxx"
              required
            />
            <i
              :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
              class="toggle-icon"
              @click="togglePassword"
            ></i>
          </div>
        </div>

        <div class="remember-row">
          <label class="remember-label">
            <input type="checkbox" v-model="rememberMe" class="remember-check" />
            <span>Ingat saya</span>
          </label>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          Masuk
        </button>
      </form>

      <p class="footer-text">© 2025 SIMRS POINTMEDIC. All rights reserved.</p>

      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import axios from 'axios'

// PrimeVue Components
import Toast from 'primevue/toast'
const logoUrl = 'https://ws-simrs.net/logo/sehat.png'
// Composables
const router = useRouter()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()
const penugasanStore = usePenugasanLayananStore()

// State
const showPassword = ref(false)
const loading = ref(false)
const rememberMe = ref(false)

const formData = reactive({
  name: '',
  password: '',
})

// ── Ticker background data ─────────────────────────────────
const tickerRows = [
  {
    dir: 'ltr',
    speed: '38s',
    items: [
      { icon: 'fas fa-file-medical', title: 'Rekam Medis Elektronik', sub: 'EMR Terintegrasi' },
      { icon: 'fas fa-pills', title: 'Manajemen Apotek', sub: 'Farmasi & Stok Obat' },
      { icon: 'fas fa-microscope', title: 'Laboratorium', sub: 'Hasil Lab Digital' },
      { icon: 'fas fa-stethoscope', title: 'Pemeriksaan Klinis', sub: 'Rawat Jalan & Inap' },
      { icon: 'fas fa-user-md', title: 'Poli Spesialis', sub: 'Jadwal & Konsultasi' },
      { icon: 'fas fa-procedures', title: 'Rawat Inap', sub: 'Manajemen Kamar RS' },
    ],
  },
  {
    dir: 'rtl',
    speed: '28s',
    items: [
      { icon: 'fas fa-id-card', title: 'BPJS Kesehatan', sub: 'Klaim & Verifikasi' },
      { icon: 'fas fa-receipt', title: 'Billing Pasien', sub: 'Tagihan & Keuangan RS' },
      { icon: 'fas fa-x-ray', title: 'Radiologi', sub: 'Pencitraan Medis Digital' },
      { icon: 'fas fa-ambulance', title: 'IGD Triase', sub: 'Penanganan Gawat Darurat' },
      { icon: 'fas fa-calendar-alt', title: 'Pendaftaran Online', sub: 'Antrian Pasien Digital' },
      { icon: 'fas fa-lock', title: 'Keamanan Data', sub: 'Privasi & Kerahasiaan Pasien' },
    ],
  },
  {
    dir: 'ltr',
    speed: '44s',
    items: [
      { icon: 'fas fa-heartbeat', title: 'ICU Monitoring', sub: 'Intensive Care Unit' },
      { icon: 'fas fa-tint', title: 'Hemodialisis', sub: 'Terapi Cuci Darah' },
      { icon: 'fas fa-dumbbell', title: 'Fisioterapi', sub: 'Rehabilitasi Medis' },
      { icon: 'fas fa-apple-alt', title: 'Gizi & Dietisien', sub: 'Nutrisi Pasien RS' },
      { icon: 'fas fa-baby', title: 'Neonatal Care', sub: 'Perawatan Bayi Baru Lahir' },
      { icon: 'fas fa-syringe', title: 'Imunisasi', sub: 'Program Vaksinasi Pasien' },
    ],
  },
  {
    dir: 'rtl',
    speed: '24s',
    items: [
      { icon: 'fas fa-satellite-dish', title: 'Satu Sehat', sub: 'Integrasi Kemenkes RI' },
      { icon: 'fas fa-file-signature', title: 'TTE BSrE', sub: 'Tanda Tangan Elektronik' },
      { icon: 'fas fa-chart-bar', title: 'Laporan & Analitik', sub: 'Dashboard Manajemen RS' },
      { icon: 'fas fa-tooth', title: 'Odontogram Digital', sub: 'Rekam Medis Gigi' },
      { icon: 'fas fa-eye', title: 'Pemeriksaan Visus', sub: 'Poli Mata Oftalmologi' },
      { icon: 'fas fa-hospital-alt', title: 'Kamar Operasi', sub: 'Penjadwalan Tindakan OK' },
    ],
  },
]

// ── Toggle password ────────────────────────────────────────
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// ── Existing functions (tidak diubah) ──────────────────────
const profile_rs = async (id_client) => {
  try {
    const url = configStore.simrs

    const endpoint = `/index.php/api/Data_referensi/get_profile_rs/${id_client}`

    const response = await axios.get(`${url}${endpoint}`)

    localStorage.setItem('ALAMAT', response.data.ALAMAT)
    localStorage.setItem('LINK_LOGO', response.data.LINK_LOGO)
    localStorage.setItem('NAMA_RS', response.data.NAMA_RS)
    localStorage.setItem('ALAMAT', response.data.ALAMAT)
    localStorage.setItem('URL_ICARE', response.data.URL_ICARE)

    localStorage.setItem('satu_sehat_client_secret', response.data.satu_sehat_client_secret)
    localStorage.setItem('satu_sehat_idclient', response.data.satu_sehat_idclient)
    localStorage.setItem('satu_sehat_organization_id', response.data.satu_sehat_organization_id)
    localStorage.setItem('satu_sehat_struktur_org', response.data.satu_sehat_struktur_org)

    localStorage.setItem(
      'TAMPILKAN_NO_URUTAN_DISPLAY',
      response.data.TAMPILKAN_NO_URUTAN_DISPLAY !== undefined
        ? response.data.TAMPILKAN_NO_URUTAN_DISPLAY
        : 0,
    )

    localStorage.setItem('use_tte_bsre', response.data.use_tte_bsre)
    localStorage.setItem('disable_jika_sediaan_nol', response.data.disable_jika_sediaan_nol)

    return response.data
  } catch (error) {
    // console.error('Auth error:', error)
    return null
  }
}

const check_jam_server_dan_local = async () => {
  try {
    const url = configStore.simrs

    const endpoint = `/index.php/api/transaksi_pasien/check_jamserver`

    const response = await axios.get(`${url}${endpoint}`)

    const tanggalLocal = getTanggalLocal()
    const tanggalServer = response.data.waktuserver

    if (tanggalLocal !== tanggalServer) {
      toast.add({
        severity: 'warn',
        summary: 'Gagal Login',
        detail: `Tanggal server (${tanggalServer}) tidak sama dengan tanggal lokal (${tanggalLocal}).
        Pastikan tanggal dan waktu perangkat Anda benar untuk menghindari masalah sinkronisasi data. silahakan hubungi admin.`,
        life: 8000,
      })
      return false
    } else {
      return true
    }
  } catch (error) {
    // console.error('Auth error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal terkoneksi ke server. Pastikan komputer terhubung ke internet',
      life: 4000,
    })
  }
}

const getTanggalLocal = () => {
  const now = new Date()

  const tahun = now.getFullYear()
  const bulan = String(now.getMonth() + 1).padStart(2, '0')
  const tanggal = String(now.getDate()).padStart(2, '0')

  return `${tahun}-${bulan}-${tanggal}` // format: "2026-03-26"
}

const profile_apol = async (id_client) => {
  try {
    const url = configStore.simrs

    const endpoint = `/index.php/api/Data_referensi/get_profile_rs_apol/${id_client}`

    const response = await axios.get(`${url}${endpoint}`)

    localStorage.setItem('apol_kode_faskes', response.data.kode_faskes)
    localStorage.setItem('apol_consid', response.data.consid)
    localStorage.setItem('apol_scret_key', response.data.scret_key)
    localStorage.setItem('apol_user_key', response.data.user_key)
    return response.data
  } catch (error) {
    // console.error('Auth error:', error)
    return null
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const jamServerCheck = await check_jam_server_dan_local()
    if (jamServerCheck == false) {
      // Lanjutkan proses login
      return
    }
    const url = configStore.simrs
    const payload = { username: formData.name, pass: formData.password }

    const endpoint = '/index.php/api/data_referensi/userloginv3'

    const response = await axios.post(`${url}${endpoint}`, payload)

    if (response.data.metadata?.code === '200') {
      toast.add({
        severity: 'success',
        summary: 'Login Berhasil',
        detail: `Selamat datang, ${response.data.response.NAMA_USER}`,
        life: 3000,
      })

      const userData = response.data.response

      // Remember Me
      if (rememberMe.value) {
        localStorage.setItem('rm_username', formData.name)
        localStorage.setItem('rm_password', formData.password)
        localStorage.setItem('rm_flag', '1')
      } else {
        localStorage.removeItem('rm_username')
        localStorage.removeItem('rm_password')
        localStorage.removeItem('rm_flag')
      }

      // 1. Save basic data to localStorage dan authStore FIRST
      localStorage.setItem('loggedIn', 'true')
      localStorage.setItem('id_client', userData.ID_CLIENT)
      localStorage.setItem('user_name', userData.NAMA_USER)
      localStorage.setItem('user_id', formData.name)
      localStorage.setItem('id_lokasi', userData.ID_LOKASI)
      localStorage.setItem('group_user', userData.GROUP_USER)
      localStorage.setItem('kd_dokter', userData.KD_DOKTER || '')
      if (userData.token) {
        localStorage.setItem('token', userData.token)
      }
      if (userData.token_expires_at) {
        localStorage.setItem('token_expires_at', userData.token_expires_at)
      }

      // 2. Set minimal user data to authStore first (so id_client is available)
      authStore.setIdClient(
        userData.ID_CLIENT,
        userData.NAMA_USER,
        formData.name,
        userData.NAMA_RS || 'RS',
        userData.ALAMAT || '',
        userData.LINK_LOGO || '',
        userData.ID_LOKASI,
        userData.USE_TTE_BSRE || userData.use_tte_bsre,
        userData.DISABLE_JIKA_SEDIAAN_NOL || userData.disable_jika_sediaan_nol,
        userData.GROUP_USER || userData.group_user,
      )

      // 3. Get job_code and bidang_id from userData
      const jobCode = userData.KDJABATAN || userData.kdjabatan || null
      const bidangId = userData.ID_LOKASI_INV || null

      // 4. Fetch reference data if available (with id_client now available)
      let jabatanData = null
      let lokasiData = null

      if (jobCode) {
        jabatanData = await penugasanStore.fetchJabatanById(jobCode)
      }

      if (bidangId) {
        lokasiData = await penugasanStore.fetchLokasiById(bidangId)
      }

      // 5. Build complete user object
      const userObject = {
        user_id: userData.NIP || formData.name,
        user_name: userData.NAMA_USER,
        job_code: jobCode,
        job_title: jabatanData?.NAMA_JABATAN || userData.JABATAN || 'Unknown',
        bidang_id: bidangId,
        bidang_name: lokasiData?.LOKASI || userData.LOK_CAPTION || 'Unknown',
        department: userData.DEPARTEMEN,
        nik: userData.NIK,
        nip: userData.NIP,
        id_client: userData.ID_CLIENT,
        id_lokasi: userData.ID_LOKASI,
        group_user: userData.GROUP_USER,
        kd_dokter: userData.KD_DOKTER || '',
      }

      // 6. Update authStore with complete user data
      authStore.setUserData(userObject)

      // 7. Wait for all profile data to be fetched
      const [rsProfile] = await Promise.all([
        profile_rs(userData.ID_CLIENT),
        profile_apol(userData.ID_CLIENT),
      ])

      // 8. Update NAMA_RS in authStore if fetch succeeded
      if (rsProfile?.NAMA_RS) {
        authStore.company = rsProfile.NAMA_RS
        localStorage.setItem('NAMA_RS', rsProfile.NAMA_RS)

        authStore.LINK_LOGO = rsProfile.LINK_LOGO
        authStore.tampilkan_no_urutan_display =
          rsProfile.TAMPILKAN_NO_URUTAN_DISPLAY !== undefined
            ? rsProfile.TAMPILKAN_NO_URUTAN_DISPLAY
            : 0
      }

      // Hapus idle timer lama agar checkOnMount di MainLayouts tidak menganggap sesi expired
      localStorage.removeItem('idle_last_activity')

      // 8. Finally redirect after everything is ready
      await router.push('/dashboard/home')
    } else {
      throw new Error(response.data.metadata?.message || 'Authentication failed')
    }
  } catch (error) {
    // console.error('Auth error:', error)

    let errorMessage = 'Terjadi kesalahan saat login'

    if (error.response?.status === 401) {
      errorMessage = 'Email atau password salah'
    } else if (error.response?.status === 409) {
      errorMessage = 'Email sudah terdaftar'
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server sedang bermasalah, coba lagi nanti'
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (localStorage.getItem('rm_flag') === '1') {
    formData.name = localStorage.getItem('rm_username') || ''
    formData.password = localStorage.getItem('rm_password') || ''
    rememberMe.value = true
  }
})
</script>

<style scoped>
/* ── Root page ── */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* ══════════════════════════════════════════════════════════
   TICKER BACKGROUND
══════════════════════════════════════════════════════════ */
.ticker-bg {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  z-index: 0;
  /* Edge fade via mask */
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 10%,
    rgba(0, 0, 0, 0.6) 90%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 10%,
    rgba(0, 0, 0, 0.6) 90%,
    transparent 100%
  );
}

.ticker-row {
  flex: 1;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.ticker-row:last-child {
  border-bottom: none;
}

/* Track: flex, no-wrap, infinite width */
.ticker-track {
  display: flex;
  gap: 0;
  width: max-content;
  align-items: stretch;
  will-change: transform;
}

/* LTR: slides left → right */
@keyframes scroll-ltr {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

/* RTL: slides right → left */
@keyframes scroll-rtl {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.track-ltr {
  animation: scroll-ltr var(--speed, 35s) linear infinite;
}
.track-rtl {
  animation: scroll-rtl var(--speed, 35s) linear infinite;
}

/* Pause on hover (optional UX) */
.ticker-row:hover .ticker-track {
  animation-play-state: paused;
}

/* Individual box */
.ticker-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.06);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0;
  white-space: nowrap;
  flex-shrink: 0;
  height: 100%;
  box-sizing: border-box;
  transition: background 0.2s;
}

.tb-icon {
  font-size: 1.1rem;
  color: rgba(129, 230, 217, 0.9);
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.tb-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tb-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.2;
}

.tb-sub {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.48);
  line-height: 1.2;
}

/* ══════════════════════════════════════════════════════════
   LOGIN CARD
══════════════════════════════════════════════════════════ */
.login-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 2rem 2.5rem;
  text-align: center;
  color: #333;
  position: relative;
  z-index: 1;
}

.logo-section {
  margin-bottom: 2rem;
}

.logo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.app-title {
  font-weight: 100;
  font-size: 1rem;
  color: #1f2937;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  text-align: left;
}

label {
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
  display: block;
  color: #374151;
}

input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  color: #333;
  background: #fff;
  transition: 0.2s;
}

input:focus {
  border-color: #ec7c13;
  box-shadow: 0 0 0 3px rgba(236, 124, 19, 0.2);
}

.password-wrapper {
  position: relative;
}

.toggle-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #9ca3af;
  font-size: 1rem;
}

.toggle-icon:hover {
  color: #ec7c13;
}

.remember-row {
  display: flex;
  align-items: center;
  margin-top: -0.4rem;
}
.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.88rem;
  color: #374151;
  user-select: none;
}
.remember-check {
  width: 16px;
  height: 16px;
  accent-color: #ec7c13;
  cursor: pointer;
  margin: 0;
  padding: 0;
  border: none;
}

.btn-submit {
  background: #ec7c13;
  border: none;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  padding: 0.8rem;
  cursor: pointer;
  transition: 0.3s;
}

.btn-submit:hover {
  background: #f89b3c;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer-text {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: rgba(55, 65, 81, 0.6);
}

/* ── Responsive: sembunyikan ticker di layar sangat kecil ── */
@media (max-width: 480px) {
  .ticker-bg {
    display: none;
  }
}
</style>
