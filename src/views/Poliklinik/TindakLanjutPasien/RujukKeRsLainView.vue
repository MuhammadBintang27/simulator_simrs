<template>
  <div class="card elevation-0">
    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label class="font-bold">JENIS RAWAT<span class="text-danger">*</span></label>
            <Select
              v-model="jenisRawat"
              :options="jenisRawatOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Jenis Rawat"
              class="w-100"
            />
          </div>

          <div class="form-group">
            <label class="font-bold">TANGGAL RUJUK <span class="text-danger">*</span></label>
            <DatePicker
              v-model="tanggalRujuk"
              :showIcon="true"
              view="date"
              dateFormat="dd/mm/yy"
              :yearNavigator="true"
              yearRange="2000:2030"
              placeholder="Pilih Tanggal"
              class="w-100"
            />
          </div>

          <div class="form-group">
            <label class="font-bold">TIPE RUJUKAN <span class="text-danger">*</span></label>
            <div class="field-radiobutton-horizontal">
              <div class="radio-option">
                <RadioButton id="penuh" name="tipe_rujukan" value="0" v-model="tipe_rujukan" />
                <label for="penuh">Penuh</label>
              </div>

              <div class="radio-option">
                <RadioButton id="partial" name="tipe_rujukan" value="2" v-model="tipe_rujukan" />
                <label for="partial">Partial</label>
              </div>

              <div class="radio-option">
                <RadioButton
                  id="rujuk_balik"
                  name="tipe_rujukan"
                  value="6"
                  v-model="tipe_rujukan"
                />
                <label for="rujuk_balik">Rujuk Balik</label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="font-bold"
              >TANGGAL RENCANA KUNJUNGAN <span class="text-danger">*</span></label
            >
            <DatePicker
              v-model="tanggalRencanaKunjungan"
              :showIcon="true"
              view="date"
              dateFormat="dd/mm/yy"
              :yearNavigator="true"
              yearRange="2000:2030"
              placeholder="Pilih Tanggal"
              class="w-100"
            />
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label class="font-bold">PILIH DIAGNOSA <span class="text-danger">*</span></label>

            <Select
              v-model="diagnoseSelected"
              :options="listDiagnose"
              optionLabel="dx"
              :filter="true"
              :showClear="true"
              :loading="isLoadingDiagnose"
              @filter="searchDiagnose"
              placeholder="Search diagnose..."
              appendTo="body"
              class="w-100"
            >
              <template #option="{ option }">
                <div class="diagnose-option">
                  <div class="diagnose-code">{{ option.icd_code }}</div>
                  <div class="diagnose-name">{{ option.dx }}</div>
                </div>
              </template>
            </Select>
          </div>

          <div class="form-group">
            <label class="font-bold">FASKES TUJUAN RUJUK<span class="text-danger">*</span></label>

            <Select
              v-model="faskesSelected"
              :options="listRFaskes"
              optionLabel="nama"
              :filter="true"
              :showClear="true"
              :loading="loadingFaskes"
              @filter="get_list_rs_bpjs"
              @change="onFaskesChange"
              placeholder="Search fasilitas kesehatan..."
              appendTo="body"
              class="w-100"
            >
              <template #option="{ option }">
                <div class="faskes-option">
                  <div class="faskes-code">[{{ option.kode }}]</div>
                  <div class="faskes-name">{{ option.nama }}</div>
                </div>
              </template>
            </Select>
          </div>

          <div class="form-group">
            <label class="font-bold">PILIH SPESIALISTIK <span class="text-danger">*</span></label>

            <Select
              v-model="SpesialistikSelected"
              :options="listSpesialis"
              optionLabel="namaSpesialis"
              :filter="true"
              :showClear="true"
              :loading="loadingSpesialis"
              :disabled="!faskesSelected"
              placeholder="Pilih faskes terlebih dahulu..."
              appendTo="body"
              class="specialist-select"
            >
              <!-- Custom option template -->
              <template #option="{ option }">
                <div class="specialist-option-content">
                  <div class="specialist-header">
                    <span class="specialist-code">[{{ option.kodeSpesialis }}]</span>
                    <span class="specialist-name">{{ option.namaSpesialis }}</span>
                  </div>
                  <div class="specialist-details">
                    <div class="detail-item">
                      <span class="detail-label">Kapasitas:</span>
                      <span class="detail-value">{{ option.kapasitas }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Rujukan:</span>
                      <span class="detail-value">{{ option.jumlahRujukan }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Persentase:</span>
                      <span class="detail-value percentage">{{ option.persentase }}%</span>
                    </div>
                  </div>
                  <!-- Progress bar for capacity utilization -->
                  <div class="progress-container">
                    <div
                      class="progress-bar"
                      :style="{ width: option.persentase + '%' }"
                      :class="getProgressBarClass(parseFloat(option.persentase))"
                    ></div>
                  </div>
                </div>
              </template>

              <!-- Custom selected value template -->
              <template #selectedOption="{ option }">
                <div v-if="option" class="selected-specialist">
                  <span class="selected-code">[{{ option.kodeSpesialis }}]</span>
                  <span class="selected-name">{{ option.namaSpesialis }}</span>
                  <span class="selected-stats">
                    ({{ option.jumlahRujukan }}/{{ option.kapasitas }})
                  </span>
                </div>
              </template>
            </Select>
          </div>

          <div class="form-group">
            <label>Catatan</label><br />
            <Textarea v-model="Catatan" style="width: 100%" rows="3" />
          </div>
        </div>
      </div>
      <!-- Action buttons -->
      <div class="form-actions mt-3">
        <Button
          class="round-button2"
          icon="pi pi-save"
          :loading="loading"
          label="RUJUK PASIEN"
          @click="submitForm"
        >
        </Button>
        <Button
          class="round-button2"
          severity="warn"
          icon="pi pi-list"
          label="LIST RUJUKAN"
          :loading="loadingRujukan"
          @click="listRujukan()"
        >
        </Button>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="showListRujukan"
    modal
    :style="dialogWidth"
    :closable="true"
    header="Riwayat Rujukan"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
  >
    <DataTable
      :value="datalistRujukan"
      :paginator="true"
      :rows="isMobile ? 5 : 10"
      :rows-per-page-options="isMobile ? [5, 10] : [5, 10, 20]"
      responsive-layout="scroll"
      sort-mode="multiple"
      class="p-datatable-sm"
      stripedRows
      :scrollable="true"
      scroll-height="flex"
    >
      <Column field="NOMR" header="NOMR" sortable :style="columnStyle.nomr"></Column>
      <Column field="NOSEP" header="NOSEP" sortable :style="columnStyle.nosep"></Column>
      <Column
        field="NORUJUKAN"
        header="NO RUJUKAN"
        sortable
        :style="columnStyle.noRujukan"
      ></Column>
      <Column field="NAMATUJUANRUJUKAN" header="TUJUAN" :style="columnStyle.tujuan"></Column>
      <Column field="NAMADIAGNOSA" header="DX" sortable :style="columnStyle.dx"></Column>
      <Column field="NOKARTU" header="No Kartu" :style="columnStyle.noKartu"></Column>
      <Column field="JENISRAWAT" header="RAWAT" :style="columnStyle.jenisRawat"></Column>
      <Column field="TGLRUJUKAN" header="TGL RUJUK" sortable>
        <template #body="slotProps">
          {{ formatDateOnlyForAPI(slotProps.data.TGLRUJUKAN) }}
        </template>
      </Column>
      <Column header="AKSI" :style="columnStyle.aksi" frozen align="center">
        <template #body="slotProps">
          <div :class="isMobile ? 'flex gap-2' : 'flex gap-2'">
            <Button
              icon="pi pi-times"
              severity="danger"
              class="p-button-sm round-button2"
              :title="isMobile ? 'Batalkan' : ''"
              @click="confirmRemoveRujukan(slotProps.data)"
            />
            <Button
              icon="pi pi-print"
              class="p-button-sm round-button2"
              :loading="slotProps.data.loadingPrint"
              :title="isMobile ? 'Cetak' : ''"
              @click="cetakRujukan(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </Dialog>

  <Dialog
    v-model:visible="showConfirmDelete"
    modal
    :style="{ width: '450px' }"
    header="Konfirmasi Hapus Rujukan"
  >
    <template #header>
      <div class="dialog-header-warning">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>Konfirmasi Hapus Rujukan</span>
      </div>
    </template>
    <div class="confirmation-content">
      <i class="fa-solid fa-circle-exclamation confirmation-icon"></i>
      <p class="confirmation-message">Apakah Anda yakin ingin membatalkan rujukan ini?</p>
      <div v-if="selectedRujukan" class="rujukan-details">
        <div class="detail-row">
          <span class="detail-label"> <i class="fa-solid fa-hashtag"></i> No Rujukan: </span>
          <span class="detail-value">{{ selectedRujukan.NORUJUKAN }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label"> <i class="fa-solid fa-hospital"></i> Tujuan: </span>
          <span class="detail-value">{{ selectedRujukan.NAMATUJUANRUJUKAN }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label"> <i class="fa-solid fa-calendar"></i> Tanggal: </span>
          <span class="detail-value">
            {{ formatDateOnlyForAPI(selectedRujukan.TGLRUJUKAN) }}
          </span>
        </div>
      </div>
      <p class="confirmation-warning">
        <i class="fa-solid fa-info-circle"></i>
        Tindakan ini tidak dapat dibatalkan!
      </p>
    </div>
    <template #footer>
      <Button
        label="Batal"
        severity="secondary"
        @click="showConfirmDelete = false"
        :disabled="loadingRemove"
      >
        <template #icon>
          <i class="fa-solid fa-xmark"></i>
        </template>
      </Button>
      <Button label="Ya, Hapus" severity="danger" @click="removeRujukan" :loading="loadingRemove">
        <template #icon>
          <i class="fa-solid fa-trash-can"></i>
        </template>
      </Button>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

// Import PrimeVue components
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import RadioButton from 'primevue/radiobutton'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, company } = storeToRefs(authStore)
const toast = useToast()

// Form data
const jenisRawat = ref('')
const tanggalRujuk = ref(new Date())
const tanggalRencanaKunjungan = ref(new Date())
const tipe_rujukan = ref('0')
const diagnoseSelected = ref(null)
const faskesSelected = ref(null)
const SpesialistikSelected = ref(null)
const Catatan = ref('-')

import { RouterLink, useRoute } from 'vue-router'
import { type } from 'jquery'
const route = useRoute()

// Props
const props = defineProps({
  NOSEP: {
    type: String,
    required: true,
  },
  datapasien: {
    type: Object,
    required: true,
  },
})

// Options for select
const jenisRawatOptions = ref([
  { label: 'JALAN', value: '2' },
  { label: 'INAP', value: '1' },
])

const showListRujukan = ref(false)
// Data lists
const listDiagnose = ref([])
const listRFaskes = ref([])
const listSpesialis = ref([])

const showConfirmDelete = ref(false)
const selectedRujukan = ref(null)

// Loading states
const loading = ref(false)
const isLoadingDiagnose = ref(false)
const loadingFaskes = ref(false)
const loadingSpesialis = ref(false)

// Computed form validation
const isFormValid = computed(() => {
  return (
    jenisRawat.value &&
    tanggalRujuk.value &&
    tanggalRencanaKunjungan.value &&
    tipe_rujukan.value !== null &&
    diagnoseSelected.value &&
    faskesSelected.value
  )
})

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

// Date formatting utilities
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
    console.error('Error formatting date:', error)
    return null
  }
}

// Search diagnose function with debounce
let diagnoseTimeout = null
const searchDiagnose = async (event) => {
  const query = event.value
  if (!query || query.length < 2) {
    listDiagnose.value = []
    return
  }

  // Clear existing timeout
  if (diagnoseTimeout) {
    clearTimeout(diagnoseTimeout)
  }

  // Set new timeout for debounce
  diagnoseTimeout = setTimeout(async () => {
    const payload = {
      mode: 1,
      param: query,
    }

    try {
      isLoadingDiagnose.value = true
      const url = configStore.apiBaseUrl
      const response = await axios.post(`${url}/index.php/api/data_referensi/get_icd_v2`, payload)
      listDiagnose.value = response.data || []
    } catch (error) {
      console.error('Error searching diagnose:', error)
      showError('Error searching diagnose')
      listDiagnose.value = []
    } finally {
      isLoadingDiagnose.value = false
    }
  }, 300) // 300ms debounce
}

const datalistRujukan = ref([])

const loadingRujukan = ref(false)

const listRujukan = async () => {
  // Set new timeout for debounce
  datalistRujukan.value = []

  diagnoseTimeout = setTimeout(async () => {
    const payload = {
      mode: 1,
      mod: 'history2',
      id_client: id_client.value,
      noka: route.query.nomr,
    }
    try {
      loadingRujukan.value = true
      const url = configStore.apiBaseUrl
      const response = await axios.post(
        `${url}/index.php/api/transaksi_pasien/getdatarujukanv1`,
        payload,
      )

      if (response.data && response.data.length > 0) {
        datalistRujukan.value = response.data.map((item) => ({
          ...item,
          loadingPrint: false,
        }))
      }

      showListRujukan.value = true
      loadingRujukan.value = false
    } catch (error) {
      showError(error)
      datalistRujukan.value = []
    } finally {
      loadingRujukan.value = false
    }
  }, 300) // 300ms debounce
}

const loadingRemove = ref(false)
const confirmRemoveRujukan = (rujukan) => {
  selectedRujukan.value = rujukan
  showConfirmDelete.value = true
}

const removeRujukan = async () => {
  if (!selectedRujukan.value) return

  try {
    loadingRemove.value = true
    const url = configStore.apiBaseUrl

    // Adjust this payload according to your API requirements
    const payload = {
      id_client: id_client.value,
      no_rujukan: selectedRujukan.value.NORUJUKAN,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/index.php/api/bpjs_api/deleted_rujukan`, payload)

    console.log('Remove rujukan response:', response.data)

    if (response.data.code === 200 || response.data.success) {
      showSuccess('Rujukan berhasil dibatalkan')
      showConfirmDelete.value = false
      selectedRujukan.value = null
      // Refresh the list
      await listRujukan()
    } else {
      showError(response.data?.message || 'Gagal membatalkan rujukan')
    }
  } catch (error) {
    console.error('Error removing rujukan:', error)
    showError(error.response?.data?.message || 'Terjadi kesalahan saat membatalkan rujukan')
  } finally {
    loadingRemove.value = false
  }
}

// Search faskes function with debounce
let faskesTimeout = null
const get_list_rs_bpjs = async (event) => {
  const query = event.value
  if (!query || query.length < 3) {
    listRFaskes.value = []
    return
  }

  // Clear existing timeout
  if (faskesTimeout) {
    clearTimeout(faskesTimeout)
  }

  // Set new timeout for debounce
  faskesTimeout = setTimeout(async () => {
    const payload = {
      mode: 1,
      parameter: query,
      jenis_faskes: 2,
      id_client: id_client.value,
    }

    try {
      loadingFaskes.value = true
      const url = configStore.apiBaseUrl
      const response = await axios.post(`${url}/index.php/api/bpjs_api/get_rs_bpjs`, payload)

      if (response.data && response.data.response && response.data.response.faskes) {
        listRFaskes.value = response.data.response.faskes
      } else {
        listRFaskes.value = []
      }
    } catch (error) {
      console.error('Error searching faskes:', error)
      showError('Error searching fasilitas kesehatan')
      listRFaskes.value = []
    } finally {
      loadingFaskes.value = false
    }
  }, 300) // 300ms debounce
}

// Handle faskes change
const onFaskesChange = () => {
  // Reset specialist selection when faskes changes
  SpesialistikSelected.value = null
  listSpesialis.value = []

  // Load specialists for selected faskes
  if (faskesSelected.value && jenisRawat.value.value == '2') {
    getSpesialistik()
  }
}

// Get specialists function
const getSpesialistik = async () => {
  if (!faskesSelected.value || !tanggalRujuk.value) {
    return
  }

  const payload = {
    kode_rs: faskesSelected.value.kode,
    tanggal_rujuk: formatDateOnlyForAPI(tanggalRujuk.value),
    id_client: id_client.value,
  }

  try {
    loadingSpesialis.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/bpjs_api/spesialistik_rujuanRujuk`,
      payload,
    )

    if (response.data && response.data.response && response.data.response.list) {
      listSpesialis.value = response.data.response.list
      // console.log('Specialists loaded:', listSpesialis.value)
    } else {
      listSpesialis.value = []
      showWarning('Tidak ada spesialis tersedia untuk fasilitas kesehatan yang dipilih')
    }
  } catch (error) {
    console.error('Error getting specialists:', error)
    showError('Error loading specialists')
    listSpesialis.value = []
  } finally {
    loadingSpesialis.value = false
  }
}

const getProgressBarClass = (percentage) => {
  if (percentage >= 80) return 'high-utilization'
  if (percentage >= 50) return 'medium-utilization'
  return 'low-utilization'
}

const cetakRujukan = async (data) => {
  try {
    data.loadingPrint = true

    const formData = {
      no_rujukan: data.NORUJUKAN,
      mod: 'history1',
      noka: data.NOKARTU,
      id_client: id_client.value,
    }

    const url = configStore.laravel
    const response = await axios.post(`${url}/setRujukan`, formData)
    data.loadingPrint = false
    window.open(response.data, '_blank')
  } catch (error) {
    console.error('Error submitting form:', error)
    showError(error.response?.data?.message || 'An error occurred while submitting the rujukan')
    data.loadingPrint = false
  } finally {
    data.loadingPrint = false
  }
}

// Form methods
const submitForm = async () => {
  if (!isFormValid.value) {
    showWarning('Please fill in all required fields')
    return
  }

  try {
    loading.value = true

    const formData = {
      noSep: props.NOSEP,
      tglRujukan: formatDateOnlyForAPI(tanggalRujuk.value),
      jenis_rawat: jenisRawat.value,
      tglRencanaKunjungan: formatDateOnlyForAPI(tanggalRencanaKunjungan.value),
      ppkDirujuk: faskesSelected.value,
      tipeRujukan: tipe_rujukan.value,
      diagnose: diagnoseSelected.value.icd_code,
      poliRujukan: {
        kodeSpesialis: jenisRawat.value == 2 ? SpesialistikSelected.value.kodeSpesialis : null,
        namaSpesialis: jenisRawat.value == 2 ? SpesialistikSelected.value.namaSpesialis : null,
      },
      id_client: id_client.value,
      user: user_id.value,
      catatan: Catatan.value,
      noregister: route.query.noreg,
      poli: props.datapasien?.POLI,
      norm: props.datapasien?.NOMR,
      created_at: formatDateTimeForAPI(new Date()),
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Bpjs_api/createRujukan`, formData)
    console.log('Form submission response:', response.data)

    if (response.data.metadata.code == 200) {
      showSuccess('Rujukan submitted successfully')

      const formData = {
        NORUJUKAN: response.data.metadata.rujukan.noRujukan,
        mod: 'history1',
        NOKARTU: response.data.metadata.rujukan.peserta.noKartu,
        id_client: id_client.value,
      }

      cetakRujukan(formData)
      resetForm()
    } else {
      showError(response.data?.metadata.message || 'Failed to submit rujukan')
    }
  } catch (error) {
    // console.error('Error submitting form:', error)
    showError(error.response?.data?.message || 'An error occurred while submitting the rujukan')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  jenisRawat.value = ''
  tanggalRujuk.value = new Date()
  tanggalRencanaKunjungan.value = new Date()
  tipe_rujukan.value = '0'
  diagnoseSelected.value = null
  faskesSelected.value = null
  SpesialistikSelected.value = null
  Catatan.value = null

  // Clear lists
  listDiagnose.value = []
  listRFaskes.value = []
  listSpesialis.value = []
}

// Watch for tanggal rujuk changes to reload specialists
watch(tanggalRencanaKunjungan, () => {
  if (faskesSelected.value) {
    SpesialistikSelected.value = null
    getSpesialistik()
  }
})

// Watch for specialist selection changes
watch(SpesialistikSelected, (newValue) => {
  if (newValue) {
    console.log('Selected Specialist:', {
      kode: newValue.kodeSpesialis,
      nama: newValue.namaSpesialis,
      kapasitas: newValue.kapasitas,
      rujukan: newValue.jumlahRujukan,
    })
  }
})
const isMobile = ref(false)
const windowWidth = ref(window.innerWidth)

const columnStyle = computed(() => ({
  nomr: { width: isMobile.value ? '80px' : '100px' },
  nosep: { width: isMobile.value ? '80px' : '100px' },
  noRujukan: { width: isMobile.value ? '100px' : '120px' },
  tujuan: { width: isMobile.value ? '150px' : '220px' },
  dx: { width: isMobile.value ? '80px' : '100px' },
  noKartu: { width: isMobile.value ? '100px' : '120px' },
  jenisRawat: { width: isMobile.value ? '80px' : '100px' },
  aksi: { width: isMobile.value ? '80px' : '100px', minWidth: '80px' },
}))

const dialogWidth = computed(() => ({
  width: isMobile.value ? '95vw' : '1200px',
}))

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  checkMobile()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
:deep(.p-datatable-sm) {
  font-size: 0.875rem;
}

:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  :deep(.p-datatable) {
    font-size: 0.75rem;
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.5rem;
    font-size: 0.7rem;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
    word-break: break-word;
  }

  :deep(.p-button.p-button-sm) {
    padding: 0.25rem 0.5rem;
    width: 32px;
    height: 32px;
  }

  :deep(.p-paginator) {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  :deep(.p-paginator-current) {
    font-size: 0.75rem;
  }

  :deep(.p-dropdown.p-paginator-rpp-options) {
    font-size: 0.75rem;
  }
}

/* Desktop optimizations */
@media (min-width: 769px) {
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.75rem;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem;
  }

  :deep(.p-button.p-button-sm) {
    padding: 0.375rem 0.75rem;
  }
}

/* Utility class */
.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}
.form-group {
  margin-bottom: 1.5rem;
}

.font-bold {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

.text-danger {
  color: #dc3545;
}

.field-radiobutton-horizontal {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-option label {
  cursor: pointer;
  font-weight: normal;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.w-100 {
  width: 100%;
}

/* Diagnose option styling */
.diagnose-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.diagnose-code {
  background: #17a2b8;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.diagnose-name {
  flex: 1;
  font-size: 14px;
}

/* Faskes option styling */
.faskes-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.faskes-code {
  background: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.faskes-name {
  flex: 1;
  font-size: 14px;
}

/* Specialist styling */
.specialist-select {
  width: 100%;
  min-height: 40px;
}

.specialist-option-content {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.specialist-option-content:last-child {
  border-bottom: none;
}

.specialist-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.specialist-code {
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
  min-width: 45px;
  text-align: center;
}

.specialist-name {
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.specialist-details {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.percentage {
  color: #059669;
}

.progress-container {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.low-utilization {
  background: #10b981;
}

.medium-utilization {
  background: #f59e0b;
}

.high-utilization {
  background: #ef4444;
}

.selected-specialist {
  display: flex;
  align-items: center;
  gap: 6px;
}

.selected-code {
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
}

.selected-name {
  font-weight: 500;
  color: #111827;
}

.selected-stats {
  font-size: 12px;
  color: #6b7280;
  margin-left: auto;
}

.placeholder {
  color: #9ca3af;
}

.radio-option label {
  cursor: pointer;
  font-weight: normal;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.mt-3 {
  margin-top: 1rem;
}

.w-100 {
  width: 100%;
}

/* Dialog Headers */
.dialog-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.dialog-header i {
  color: #3b82f6;
}

.dialog-header-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.dialog-header-warning i {
  color: #f59e0b;
  font-size: 1.5rem;
}

/* Confirmation Dialog */
.confirmation-content {
  text-align: center;
  padding: 1.5rem 1rem;
}

.confirmation-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.confirmation-message {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.rujukan-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.confirmation-warning {
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.confirmation-warning i {
  color: #dc2626;
}

.detail-row:last-child {
  border-bottom: none;
}
/* Responsive adjustments */
@media (max-width: 640px) {
  .specialist-details {
    flex-direction: column;
    gap: 4px;
  }

  .detail-item {
    justify-content: space-between;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
