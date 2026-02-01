<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- DATA PASIEN -->
    <div class="card elevation-0">
      <div class="card-header">
        <h4><i class="fas fa-syringe mr-2"></i> Entri Imunisasi</h4>
      </div>

      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-2">
            <label class="text-muted">No RM</label><br />
            <strong>{{ fact.NOMR }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">Nama Pasien</label><br />
            <strong>{{ fact.NAMAPASIEN }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">NIK</label><br />
            <strong>{{ fact.NOKTP }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">Alamat</label><br />
            <strong>{{ fact.ALAMAT }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">Usia</label><br />
            <strong>
              {{ fact.USIA_PASIEN.tahun }} th {{ fact.USIA_PASIEN.bulan }} bl
              {{ fact.USIA_PASIEN.hari }} hr
            </strong>
          </div>

          <div class="col-md-3 mb-2">
            <label class="text-muted">No Telp</label><br />
            <strong>{{ fact.NOTELP }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">Poli</label><br />
            <strong>{{ fact.POLI }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">Dokter</label><br />
            <strong>{{ fact.NAMADOKTER }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">Cara Bayar</label><br />
            <strong>{{ fact.CARABAYAR }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">No SEP</label><br />
            <strong>{{ fact.NOSEP }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">Diagnosa Awal</label><br />
            <strong>{{ fact.DIAGNOSA_AWAL }}</strong>
          </div>

          <div class="col-md-4 mb-2">
            <label class="text-muted">No Jaminan</label><br />
            <strong>{{ fact.NOJAMINAN }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- FORM IMUNISASI -->
    <div class="card elevation-0">
      <div class="card-header bg-soft-secondary">
        <h5 class="mb-0 text-secondary"><i class="pi pi-clipboard me-2"></i> Data Imunisasi</h5>
      </div>

      <div class="card-body">
        <div class="row">
          <!-- JENIS -->
          <div class="col-md-3 mb-3">
            <label> <i class="pi pi-list me-1 text-info"></i> Jenis Imunisasi </label>
            <Select
              v-model="IMUNISASI.JENIS_IMUNISASI"
              :options="JENIS_IMUNISASI_OPTIONS"
              class="w-100"
            />
          </div>

          <!-- TANGGAL -->
          <div class="col-md-3 mb-3">
            <label> <i class="pi pi-calendar me-1 text-success"></i> Tanggal </label>
            <DatePicker
              v-model="IMUNISASI.TANGGAL_IMUNISASI"
              dateFormat="yy-mm-dd"
              showIcon
              class="w-100"
            />
          </div>

          <!-- JAM -->
          <div class="col-md-3 mb-3">
            <label> <i class="pi pi-clock me-1 text-warning"></i> Jam </label>
            <DatePicker v-model="IMUNISASI.JAM_IMUNISASI" timeOnly hourFormat="24" class="w-100" />
          </div>

          <!-- DOSIS -->
          <div class="col-md-3 mb-3">
            <label> <i class="pi pi-sort-numeric-up me-1"></i> Dosis Ke </label>
            <Select v-model="IMUNISASI.DOSIS_KE" :options="DOSIS_OPTIONS" class="w-100" />
          </div>

          <!-- RUTE -->
          <div class="col-md-3 mb-3">
            <label><i class="pi pi-directions me-1"></i> Rute</label>
            <Select v-model="IMUNISASI.RUTE" :options="RUTE_OPTIONS" class="w-100" />
          </div>

          <!-- LOKASI -->
          <div class="col-md-3 mb-3">
            <label><i class="pi pi-map-marker me-1"></i> Lokasi Suntik</label>
            <Select
              v-model="IMUNISASI.LOKASI_SUNTIK"
              :options="LOKASI_SUNTIK_OPTIONS"
              class="w-100"
            />
          </div>

          <!-- VAKSIN -->
          <div class="col-md-3 mb-3">
            <label><i class="pi pi-box me-1"></i> Nama Vaksin</label>
            <InputText v-model="IMUNISASI.NAMA_VAKSIN" class="w-100" />
          </div>

          <!-- BATCH -->
          <div class="col-md-3 mb-3">
            <label><i class="pi pi-hashtag me-1"></i> No Batch</label>
            <InputText v-model="IMUNISASI.NO_BATCH" class="w-100" />
          </div>

          <!-- EXPIRED -->
          <div class="col-md-3 mb-3">
            <label><i class="pi pi-calendar-times me-1"></i> Expired</label>
            <DatePicker
              v-model="IMUNISASI.TGL_EXPIRED"
              dateFormat="yy-mm-dd"
              showIcon
              class="w-100"
            />
          </div>

          <!-- PRODUSEN -->
          <div class="col-md-3 mb-3">
            <label><i class="pi pi-building me-1"></i> Produsen</label>
            <InputText v-model="IMUNISASI.PRODUSEN" class="w-100" />
          </div>

          <!-- PETUGAS -->
          <div class="col-md-4 mb-3">
            <label><i class="pi pi-user me-1"></i> Petugas</label>
            <InputText v-model="IMUNISASI.PETUGAS" class="w-100" />
          </div>

          <!-- PROFESI -->
          <div class="col-md-3 mb-3">
            <label><i class="pi pi-briefcase me-1"></i> Profesi</label>
            <Select v-model="IMUNISASI.PROFESI_PETUGAS" :options="PROFESI_OPTIONS" class="w-100" />
          </div>

          <!-- KIPI -->
          <div class="col-md-2 mb-3 d-flex align-items-center">
            <Checkbox v-model="IMUNISASI.KIPI" binary />
            <span class="badge ms-2" :class="IMUNISASI.KIPI ? 'bg-danger' : 'bg-success'">
              {{ IMUNISASI.KIPI ? 'KIPI' : 'Normal' }}
            </span>
          </div>

          <!-- CATATAN -->
          <div class="col-md-12">
            <label><i class="pi pi-pencil me-1"></i> Catatan</label>
            <Textarea v-model="IMUNISASI.CATATAN" rows="3" class="w-100" />
          </div>
        </div>
      </div>
    </div>

    <div class="card elevation-0">
      <div class="card-body">
        <Button label="Simpan Imunisasi" icon="pi pi-save" class="round-button2" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id } = storeToRefs(authStore)

import DatePicker from 'primevue/datepicker'

import { useToast } from 'primevue/usetoast'
const toast = useToast()
import { useRoute } from 'vue-router'
const loading = ref(false)
const route = useRoute()

// Toast functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'An error occurred') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

const IMUNISASI = ref({
  JENIS_IMUNISASI: null,
  TANGGAL_IMUNISASI: null,
  JAM_IMUNISASI: null,
  DOSIS_KE: null,
  RUTE: null,
  LOKASI_SUNTIK: null,

  NAMA_VAKSIN: null,
  NO_BATCH: null,
  TGL_EXPIRED: null,
  PRODUSEN: null,

  PETUGAS: null,
  PROFESI_PETUGAS: null,

  KONDISI_PASIEN: 'SEHAT',
  KIPI: false,
  CATATAN: '',
})

const JENIS_IMUNISASI_OPTIONS = [
  'BCG',
  'Hepatitis B',
  'Polio',
  'DPT-HB-Hib',
  'Campak',
  'MR',
  'PCV',
  'Rotavirus',
  'Influenza',
  'COVID-19',
]

const DOSIS_OPTIONS = [1, 2, 3, 'Booster']

const RUTE_OPTIONS = ['IM', 'SC', 'ORAL']

const LOKASI_SUNTIK_OPTIONS = ['Lengan Kanan', 'Lengan Kiri', 'Paha Kanan', 'Paha Kiri']

const KONDISI_OPTIONS = ['SEHAT', 'DEMAM', 'DITUNDA']

const PROFESI_OPTIONS = ['Dokter', 'Perawat', 'Bidan']

const fact = ref({
  NOPENDAFTARAN: '',
  NOKTP: '',
  NAMAPASIEN: '',
  ALAMAT: '',
  NOMR: '',
  JENISRAWAT: '',
  NAMADOKTER: '',
  POLI: '',
  KODEPOLI: '',
  NOSEP: '',
  CARABAYAR: '',
  DIAGNOSA_AWAL: '',
  NAMAKECAMATAN: '',
  NOJAMINAN: '',
  NOTELP: '',
  USIA_PASIEN: {
    tahun: 0,
    bulan: 0,
    hari: 0,
  },
})

// Fetch patient data
const fetchData = async () => {
  try {
    loading.value = true
    const payload = {
      mod: 1,
      id_client: id_client.value,
      noregister: route.params?.id,
    }

    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`,
      payload,
    )

    if (response.data.response.length > 0) {
      fact.value = response.data.response[0]
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

// Methods
const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
}

const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return null
  }
}

onMounted(async () => {
  await fetchData()
})
</script>
