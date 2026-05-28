<template>
  <div class="card elevation-0">
    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            Poli asal <strong>{{ datapasien.POLI }}</strong>
          </div>
          <div class="form-group">
            <label for="">Poli Tujuan</label>

            <Select
              v-model="PoliSelected"
              :options="listRuangPoli"
              optionLabel="NAMA"
              placeholder="Poli Tujuan"
              class="w-100"
              filter
            />
          </div>
          <div class="form-group">
            <label>
              <strong
                >Pilih Dokter, data ditemukan ({{ list_dokter_live_bpjs.length }})
              </strong></label
            >

            <Select
              v-model="dokterkontrolSelected"
              :options="list_dokter_live_bpjs"
              optionLabel="namaDokter"
              placeholder="Pilih dokter tujuan kontrol"
              class="w-100"
              showClear
              :loading="loading_load_dokter"
            />
          </div>
          <div class="form-group">
            <Button
              label="Simpan"
              @click="konfirmasi_rujuk_internal()"
              class="round-button2 w-100"
              :loading="loading"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()

const loading = ref(false)

const PoliSelected = ref(null)

const list_dokter_live_bpjs = ref([])

const dokterkontrolSelected = ref(null)

const loading_load_dokter = ref(false)

import { useRoute } from 'vue-router'
const route = useRoute()

// Watch for date changes
watch([PoliSelected], () => {
  if (PoliSelected.value) {
    dokterkontrolSelected.value = null
    Get_dokter_live_bpjs()
  }
})

const showInfo = (message = 'Data berhasil disimpan') => {
  toast.add({
    severity: 'info',
    summary: 'Informasi',
    detail: message,
    life: 3000,
  })
}

// Fungsi konfirmasi sebelum simpan
const konfirmasi_rujuk_internal = () => {
  // Validasi input sebelum menampilkan konfirmasi
  if (!PoliSelected.value?.KODE) {
    showWarning('Silakan pilih poli terlebih dahulu')
    return
  }

  if (!dokterkontrolSelected.value?.kodeDokter) {
    showWarning('Silakan pilih dokter terlebih dahulu')
    return
  }

  if (!PoliSelected.value?.KODE_BPJS) {
    showError('Kode BPJS poli tidak ditemukan')
    return
  }

  // Tampilkan dialog konfirmasi
  confirm.require({
    message: `Apakah Anda yakin akan merujuk pasien dari ${props.datapasien.POLI}  ke ${PoliSelected.value.NAMA}  dengan dokter ${dokterkontrolSelected.value.namaDokter} `,
    header: 'Konfirmasi Rujukan Internal',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: 'Batal',
    acceptLabel: 'Ya, Rujuk',
    accept: () => {
      lakukan_rujuk_internal()
    },
    reject: () => {
      showInfo('Rujukan internal dibatalkan')
    },
  })
}

const lakukan_rujuk_internal = async () => {
  try {
    loading.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/rujuk_internal/${route.query.noreg}/${PoliSelected.value.KODE}/${dokterkontrolSelected.value.kodeDokter}/${user_id.value}/${id_client.value}/${PoliSelected.value.KODE_BPJS}`,
    )

    // Validasi response
    if (response.data?.metadata.code == 200) {
      showSuccess('Data rujukan internal berhasil disimpan')
      // Reset form setelah berhasil
      PoliSelected.value = null
      dokterkontrolSelected.value = null
      list_dokter_live_bpjs.value = []
    } else {
      showWarning(response.data?.metadata?.message || 'Data rujukan tidak dapat disimpan')
    }
  } catch (error) {
    console.error('Error fetching data:', error)

    // Handle berbagai jenis error
    if (error.response) {
      // Error dari server
      const status = error.response.status
      const message = error.response.data?.message || 'Terjadi kesalahan pada server'

      if (status === 404) {
        showError('Data tidak ditemukan')
      } else if (status === 401) {
        showError('Sesi Anda telah berakhir. Silakan login kembali')
      } else if (status === 500) {
        showError('Terjadi kesalahan pada server')
      } else {
        showError(message)
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      showError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda')
    } else {
      // Error lainnya
      showError('Terjadi kesalahan: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}

const Get_dokter_live_bpjs = async () => {
  try {
    const payload = {
      kode_poli: PoliSelected.value.KODE_BPJS,
      tanggal: formatDateOnlyForAPI(new Date()),
      id_client: id_client.value,
    }

    console.log(payload)

    loading_load_dokter.value = true
    const url = configStore.apiBaseUrl

    list_dokter_live_bpjs.value = []

    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_dokter_live_bpjs`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.data && response.data.response.list) {
      list_dokter_live_bpjs.value = [...response.data.response.list]
    } else {
      showInfo(response.data.metaData.message)
    }

    loading_load_dokter.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loading_load_dokter.value = false
  }
}
// Props
const props = defineProps({
  datapasien: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object',
  },
})

// Toast functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
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
    summary: 'Peringatan',
    detail: message,
    life: 4000,
  })
}

const fact = ref([])

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/get_data`) // ✅ Cleaner syntax

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
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

const listRuangPoli = ref([])
const getdataPoliRuang = async (mode) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    loading.value = true

    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/${mode}/${id_client.value}`,
    )

    // Process the response data to add computed fields
    listRuangPoli.value = response.data || []

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 5000,
    })
  } finally {
    loading.value = false
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

onMounted(() => {
  getdataPoliRuang(0)
})
</script>
