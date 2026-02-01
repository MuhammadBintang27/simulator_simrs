<template>
  <div class="login-page">
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
              placeholder="••••••••"
              required
            />
            <i
              :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"
              class="toggle-icon"
              @click="togglePassword"
            ></i>
          </div>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          Masuk
        </button>
      </form>

      <p class="footer-text">© 2025 SIMRS — All Rights Reserved</p>

      <Toast />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import axios from 'axios'
import { storeToRefs } from 'pinia'

// PrimeVue Components
import Toast from 'primevue/toast'
const logoUrl = 'https://ws-simrs.link/logo/sehat.png'
// Composables
const router = useRouter()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()
const penugasanStore = usePenugasanLayananStore()

// State
const showPassword = ref(false)
const loading = ref(false)

const formData = reactive({
  name: '',
  password: '',
})

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

    localStorage.setItem('use_tte_bsre', response.data.use_tte_bsre)
    localStorage.setItem('disable_jika_sediaan_nol', response.data.disable_jika_sediaan_nol)

    return response.data
  } catch (error) {
    // console.error('Auth error:', error)
    return null
  }
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

      // 1. Save basic data to localStorage dan authStore FIRST
      localStorage.setItem('loggedIn', 'true')
      localStorage.setItem('id_client', userData.ID_CLIENT)
      localStorage.setItem('user_name', userData.NAMA_USER)
      localStorage.setItem('user_id', formData.name)
      localStorage.setItem('id_lokasi', userData.ID_LOKASI)

      // 2. Set minimal user data to authStore first (so id_client is available)
      authStore.setIdClient(
        userData.ID_CLIENT,
        userData.NAMA_USER,
        formData.name,
        userData.NAMA_RS || 'RS', // fallback jika tidak ada di login
        userData.ALAMAT || '',
        userData.LINK_LOGO || '',
        userData.ID_LOKASI,
        userData.use_tte_bsre,
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
      }

      // 8. Finally redirect after everything is ready
      setTimeout(() => {
        router.push('/dashboard/home')
      }, 800)
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
</script>

<style scoped>
/* Background lembut abu-abu */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  padding: 1rem;
}

/* Card transparan elegan */
.login-card {
  background: rgba(255, 255, 255, 0.25);

  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 2rem 2.5rem;
  text-align: center;
  color: #333;
  position: relative;
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
</style>
