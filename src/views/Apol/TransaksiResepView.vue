<template>
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="fas fa-capsules mr-1"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Peresepan (Obat Kronis)</h1>
          <p class="hero-description">Sistem Entrian Resep Elektronik</p>
        </div>
      </div>
    </div>
    <ProgressBar v-if="loadingObat" mode="indeterminate" style="height: 3px" />
    <Panel>
      <template #header>
        <h6 style="color: darkcyan"><strong>ENTRIAN RESEP</strong></h6>
      </template>

      <div class="form-group">
        <label for="nosep-input">NOSEP</label>

        <InputText
          id="nosep-input"
          class="ml-2"
          v-model="nosepInput"
          style="width: 20em"
          placeholder="Masukkan nomor SEP"
        />
        <Button
          icon="pi pi-refresh"
          @click="fetchData"
          :loading="loading"
          :disabled="!nosepInput.trim()"
          class="ml-2"
        />
      </div>
      <hr />
      <!-- Show content only if we have data -->
      <div v-if="sepResponse.response && sepResponse.metaData.code === '200'" class="row">
        <div class="col-md-4">
          <div class="form-group">
            <dt>Pasien</dt>
            <dd>
              <i class="pi pi-user"></i>
              <Tag severity="warn" class="text-xs py-1 flex-shrink-0 round-button2">
                {{ sepResponse.response.peserta?.nama || sepResponse.response.namapeserta }} ({{
                  sepResponse.response.peserta?.kelamin || sepResponse.response.jnskelamin
                }})
              </Tag>
              <Tag
                :severity="
                  sepResponse.response.peserta?.keterangan.kode == `1` ? 'warn' : 'success'
                "
                class="text-xs py-1 flex-shrink-0 round-button2 ml-2"
                >{{ sepResponse.response.peserta?.keterangan.keterangan }}</Tag
              >
            </dd>
            <dt>Tanggal Lahir</dt>
            <dd>
              {{ sepResponse.response.peserta?.tglLahir || sepResponse.response.tgllhr }}
            </dd>
            <dt>No. Kartu</dt>
            <dd>{{ sepResponse.response.peserta?.noKartu || sepResponse.response.nokartu }}</dd>
          </div>
        </div>

        <div class="col-md-4">
          <div class="form-group">
            <dt>Dokter</dt>
            <dd>
              <i class="pi pi-user-edit"></i>
              {{ sepResponse.response.dpjp?.nmDPJP || sepResponse.response.namadokter }}
            </dd>
            <dt>Poli</dt>
            <dd>{{ sepResponse.response.poli }}</dd>
            <dt>Jenis Pelayanan</dt>
            <dd>{{ sepResponse.response.jnsPelayanan || sepResponse.response.jnspelayanan }}</dd>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <dt>Diagnosa</dt>
            <dd>
              <i class="pi pi-file-edit"></i>
              {{ sepResponse.response.diagnosa || sepResponse.response.nmdiag }}
            </dd>
            <dt>No. SEP</dt>
            <dd>{{ sepResponse.response.noSep }}</dd>
            <dt>Tanggal SEP</dt>
            <dd>{{ sepResponse.response.tglSep }}</dd>
          </div>
        </div>
      </div>

      <!-- Show message when no data -->
      <div
        v-else-if="!loading && nosepInput && sepResponse.metaData.code"
        class="alert alert-warning"
      >
        <i class="pi pi-exclamation-triangle"></i>
        Data tidak ditemukan atau terjadi kesalahan: {{ sepResponse.metaData.message }}
      </div>

      <!-- Show instruction when no input -->
      <div v-else-if="!nosepInput && !loading" class="alert alert-info">
        <i class="pi pi-info-circle"></i>
        Masukkan nomor SEP untuk mencari data pasien
      </div>

      <hr />

      <!-- Prescription form - only show when we have patient data -->
      <div
        v-if="sepResponse.response && sepResponse.metaData.code === '200'"
        class="prescription-form"
      >
        <div class="row">
          <div class="col-md-4">
            <dt>Jenis Obat</dt>
            <dd>
              <Select
                class="ml-2 mt-2"
                style="width: 20em"
                :options="JenisObat"
                optionLabel="caption"
                v-model="JenisObatSelected"
                placeholder="Pilih jenis obat"
              />
            </dd>
          </div>
          <div class="col-md-4">
            <dt>Iterasi Obat</dt>
            <dd>
              <Select
                class="ml-2 mt-2"
                style="width: 20em"
                :options="ObatIterasi"
                optionLabel="caption"
                v-model="ObatIterasiSelected"
                placeholder="Pilih iterasi obat"
              />
            </dd>
          </div>

          <div class="col-md-4">
            <dt>Tanggal Resep</dt>
            <dd>
              <DatePicker
                v-model="tanggalResep"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal resep"
                showIcon
                class="ml-2 mt-2"
                iconDisplay="input"
              />
            </dd>
          </div>
        </div>
        <hr />
        <Button
          label="Simpan Resep"
          @click="SimpanResep"
          :loading="loading"
          class="round-button2"
        />
        <Button
          label="Daftar Resep"
          @click="ShowListResep = true"
          severity="info"
          :loading="loading"
          class="round-button2 ml-2"
        />

        <Button
          :label="`Riwayat Pelanan Obat ${sepResponse.response.peserta?.nama}`"
          @click="ShowTanggalRiwayat = true"
          severity="info"
          :loading="loading"
          class="round-button2 ml-2"
        />

        <!-- <div class="row mt-4">
          <div class="col-12">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pilih Obat
              <span v-if="availableObat.length > 0">({{ availableObat.length }} ditemukan)</span>
            </label>

            <Select
              v-model="selectedItemObat"
              :options="availableObat"
              filter
              optionLabel="nama"
              placeholder="Cari dan pilih obat..."
              class="mt-0"
              :loading="loadingObat"
              style="width: 100%"
              @filter="searchItemObat"
              :filterFields="['nama', 'kode']"
              @change="onObatSelected"
            >
              <template #option="slotProps">
                <div class="flex flex-col gap-1 py-2">
                  <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    <Tag
                      severity="info"
                      :value="slotProps.option.kode"
                      class="text-xs px-2 py-1 flex-shrink-0 round-button2"
                    />
                    {{ slotProps.option.nama }}

                    <Tag
                      severity="warn"
                      :value="formatCurrency(slotProps.option.harga)"
                      class="text-xs px-2 ml-2 py-1 flex-shrink-0 round-button2"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500"> </span>
                  </div>
                </div>
              </template>

              <template #empty>
                <div class="text-center py-4 text-gray-500">
                  {{
                    !searchQuery || searchQuery.length < 2
                      ? 'Ketik minimal 2 karakter untuk pencarian'
                      : 'Obat tidak ditemukan'
                  }}
                </div>
              </template>
            </Select>
          </div>
        </div> -->
      </div>
    </Panel>

    <Dialog
      v-model:visible="RiwayatPelObat"
      :style="{ width: '1200px' }"
      header="Riwayat Pelayanan Obat"
      :modal="true"
    >
      <DataTable :value="listRiwayatPelayanan" paginator :rows="10" stripedRows>
        <Column field="nosjp" header="nosjp" sortable>
          <template #body="slotProps">
            <i class="fas fa-user-injured" style="color: #3b82f6; margin-right: 8px"></i>
            {{ slotProps.data.nosjp }}
          </template>
        </Column>
        <Column field="tglpelayanan" header="Tanggal Pelayanan" sortable>
          <template #body="slotProps">
            <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
            {{ slotProps.data.tglpelayanan }}
          </template>
        </Column>
        <Column field="kodeobat" header="Kode obat" sortable>
          <template #body="slotProps">
            <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
            {{ slotProps.data.kodeobat }}
          </template>
        </Column>
        <Column field="namaobat" header="Nama obat" sortable>
          <template #body="slotProps">
            <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
            {{ slotProps.data.namaobat }}
          </template>
        </Column>
        <Column field="jmlobat" header="Jml obat" sortable>
          <template #body="slotProps">
            <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
            {{ slotProps.data.jmlobat }}
          </template>
        </Column>
      </DataTable>
    </Dialog>

    <Dialog v-model:visible="ShowTanggalRiwayat" modal :style="{ width: '350px' }" :closable="true">
      <div class="form-group">
        <h6>Pilih tanggal Riwayat Pelayanan</h6>
        <br />
        <label><i class="fas fa-clock"></i> Mulai</label>
        <DatePicker
          id="tanggal_akhir"
          v-model="TanggalMulai"
          dateFormat="dd M yy"
          placeholder="Pilih tanggal"
          showIcon
          iconDisplay="input"
          style="width: 100%"
        />
      </div>
      <div class="form-group">
        <label><i class="fas fa-clock"></i> Sampain dengan</label>
        <DatePicker
          id="tanggal_akhir"
          v-model="TanggalAkhir"
          dateFormat="dd M yy"
          placeholder="Pilih tanggal"
          showIcon
          iconDisplay="input"
          style="width: 100%"
        />
      </div>
      <Button label="Tampilkan" @click="funcRiwayatPelObat" :loading="loadingRiwayatPel" />
    </Dialog>

    <Dialog
      v-model:visible="ShowListResep"
      modal
      :style="{ width: '1200px' }"
      :closable="true"
      header="Riwayat Resep Pasien"
    >
      <List_resepApol
        :noka="sepResponse.response.peserta?.noKartu || sepResponse.response.nokartu"
      />
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import DatePicker from 'primevue/datepicker'
import Panel from 'primevue/panel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'

// stores
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)

const ShowTanggalRiwayat = ref(false)

const TanggalMulai = ref(new Date())
const TanggalAkhir = ref(new Date())

const tanggalResep = ref(new Date())

import List_resepApol from '@/views/Apol/List_resepApol.vue'

import { useRoute } from 'vue-router'

const route = useRoute()

// toast notifications
const toast = useToast()
const showSuccess = (msg = 'Operation successful') =>
  toast.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 })
const showError = (msg = 'An error occurred') =>
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
const showWarning = (msg) =>
  toast.add({ severity: 'warn', summary: 'Warning', detail: msg, life: 4000 })

// reactive state
const loading = ref(false)
const nosepInput = ref(route.params.nosep || null) // Akan null jika tidak dikirim)
const selectedItemObat = ref(null)

// Initialize sepResponse with proper structure
const sepResponse = reactive({
  response: null,
  metaData: {
    code: '',
    message: '',
  },
})

const ShowListResep = ref(false)

const RiwayatPelObat = ref(false)

const availableObat = ref([])

const arrObat = ref([])

const ObatIterasiSelected = ref({
  code: 0,
  caption: 'Non Iterasi',
})

const ObatIterasi = ref([
  {
    code: 0,
    caption: 'Non Iterasi',
  },
  {
    code: 1,
    caption: 'Iterasi 1x',
  },
  {
    code: 2,
    caption: 'Iterasi 2x',
  },
])

const JenisObatSelected = ref({
  code: 2,
  caption: 'Obat Kronis Belum Stabil',
})

const JenisObat = ref([
  {
    code: 1,
    caption: 'Obat PRB',
  },
  {
    code: 2,
    caption: 'Obat Kronis Belum Stabil',
  },
  {
    code: 3,
    caption: 'Obat Kemoterapi',
  },
])

const searchQuery = ref('')
const loadingObat = ref(false)

const loadingRiwayatPel = ref(false)

const listRiwayatPelayanan = ref([])

const funcRiwayatPelObat = async () => {
  try {
    const payload = {
      TglMulai: formatDateForAPI(TanggalMulai.value),
      TglAkhir: formatDateForAPI(TanggalAkhir.value),
      nokartu: sepResponse.response?.peserta?.noKartu,
      id_client: id_client.value,
    }

    listRiwayatPelayanan.value = []

    loadingRiwayatPel.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/riwayatobat_apol`, payload)

    loadingRiwayatPel.value = false //loading

    RiwayatPelObat.value = true //panggil form

    if (response.data.metaData.code == '200') {
      {
        listRiwayatPelayanan.value = response.data.response.list.history || []
      }
    } else {
      showWarning(response.data.metaData.message)
    }
  } catch (error) {
    console.error('Error searching medicines:', error)
    showError(error)
  } finally {
    loadingRiwayatPel.value = false
  }
}

// Watch for changes in prescription parameters and clear search results
watch(
  [JenisObatSelected, ObatIterasiSelected, tanggalResep],
  () => {
    availableObat.value = []
    selectedItemObat.value = null
    searchQuery.value = ''
  },
  { deep: true },
)

const onObatSelected = () => {
  arrObat.value.push({
    nosjp: nosepInput.value,
    kode: selectedItemObat.value.kode,
    nama: selectedItemObat.value.nama,
    harga: selectedItemObat.value.harga,
    signa1: selectedItemObat.value.sina1,
    signa2: selectedItemObat.value.signa2,
    hari: selectedItemObat.value.hari,
    catatan: selectedItemObat.value.catatan,
  })
}

const SimpanResep = async () => {
  try {
    loading.value = true

    const payLoad = {
      REFASALSJP: sepResponse.response.noSep,
      TGLSJP: formatDateForAPI(new Date()),
      POLIRSP: sepResponse.response.poli,
      KDJNSOBAT: JenisObatSelected.value.code,
      IDUSERSJP: user_id.value,
      TGLRSP: formatDateForAPI(tanggalResep.value),
      TGLPELRSP: formatDateForAPI(tanggalResep.value),
      KdDokter:
        sepResponse.response.dpjp.kdDPJP == '0'
          ? sepResponse.response.kontrol.kdDokter
          : sepResponse.response.dpjp.kdDPJP,
      iterasi: ObatIterasiSelected.value.code,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/simpanResep`, payLoad)

    if (response.data?.metaData?.code == '200') {
      showSuccess()
    } else {
      showWarning(response.data?.metaData?.message)
    }

    loading.value = false
  } catch (error) {
    console.error(error)
    showError(error)
    availableObat.value = []
  } finally {
    loading.value = false
  }
}

const SimpanObat = async (data) => {
  try {
    data.isloading = true

    const payLoad = {
      NOSJP: data.nosjp,
      KDOBT: data.kode,
      NMOBAT: data.nama,
      SIGNA1OBT: parseInt(data.signa1) || 0,
      SIGNA2OBT: parseInt(data.signa2) || 0,
      HARI: parseInt(data.hari) || 0,
      JMLOBT: parseInt(data.hari) || 0, // sementara ikut hari
      CatKhsObt: data.catatan,
      id_client: id_client.value,
    }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/simpan_obat_apol`, payLoad)

    console.log(response.data)

    if (response.data.metaData.code == '200') {
      showSuccess()
    } else {
      showWarning(response.data.metaData.message)
    }

    data.isDisbaled = true

    data.isloading = false
  } catch (error) {
    console.error('Error searching medicines:', error)
    showError('Gagal mencari obat')
    availableObat.value = []
  } finally {
    data.isloading = false
  }
}

// API functions
const searchItemObat = async (event) => {
  try {
    const query = event.value
    searchQuery.value = query

    if (!query || query.length < 2) {
      availableObat.value = []
      return
    }

    if (!JenisObatSelected.value?.code) {
      showWarning('Silakan pilih jenis obat terlebih dahulu')
      return
    }

    const payload = {
      kd_jenis_resep: JenisObatSelected.value.code,
      key_word: query,
      tanggal_resep: formatDateForAPI(tanggalResep.value),
      id_client: id_client.value,
    }

    loadingObat.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/obat`, payload)

    console.log(response.data)

    if (response.data?.response && Array.isArray(response.data.response.list)) {
      availableObat.value = response.data.response.list
    } else {
      availableObat.value = []
    }
    loadingObat.value = false
  } catch (error) {
    console.error('Error searching medicines:', error)
    showError('Gagal mencari obat')
    availableObat.value = []
  } finally {
    loadingObat.value = false
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
    console.error('DateTime formatting error:', error)
    return null
  }
}

const formatDateForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Date formatting error:', error)
    return null
  }
}

// fetch data function
const fetchData = async () => {
  try {
    // Validate input
    if (!nosepInput.value?.trim()) {
      showError('NoSEP wajib diisi')
      return
    }

    loading.value = true

    // Reset previous data
    sepResponse.response = null
    sepResponse.metaData = { code: '', message: '' }
    selectedItemObat.value = null
    availableObat.value = []

    const url = configStore.apiBaseUrl

    const response = await axios.get(
      `${url}/index.php/api/bpjs_api/getdata_SEP_v2/${nosepInput.value.trim()}/${id_client.value}`,
      {
        timeout: 10000, // 10 second timeout
      },
    )
    // Handle API response
    if (response.data?.metaData) {
      Object.assign(sepResponse.metaData, response.data.metaData)

      if (response.data.metaData.code === '200') {
        if (response.data.response) {
          sepResponse.response = response.data.response
          showSuccess('Data berhasil ditemukan')
        } else {
          showWarning('Data tidak ditemukan')
        }
      } else {
        showWarning(response.data.metaData.message || 'Terjadi kesalahan pada server')
      }
    } else {
      showError('Format response tidak valid')
    }
  } catch (error) {
    console.error('Error fetching data:', error)

    if (error.code === 'ECONNABORTED') {
      showError('Request timeout - silakan coba lagi')
    } else if (error.response?.status === 404) {
      showError('Endpoint tidak ditemukan')
    } else if (error.response?.status >= 500) {
      showError('Server error - silakan coba lagi nanti')
    } else {
      showError(error.response?.data?.message || error.message || 'Terjadi kesalahan')
    }

    // Reset data on error
    sepResponse.response = null
    sepResponse.metaData = { code: '', message: '' }
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #134e5e 0%, #059669 100%);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  color: white;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.2);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.91rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.prescription-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group dt {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  margin-top: 0.75rem;
}

.form-group dt:first-child {
  margin-top: 0;
}

.form-group dd {
  margin: 0 0 0.5rem 0;
  padding-left: 0.5rem;
  color: #6b7280;
}

.form-group dd i {
  margin-right: 0.5rem;
  color: #059669;
}

.selected-medicine .card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.medicine-info .info-row {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.medicine-info .info-row:last-child {
  margin-bottom: 0;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-info {
  background-color: #dbeafe;
  border: 1px solid #93c5fd;
  color: #1e40af;
}

.alert-warning {
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
}

.hover-grow {
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
}

.hover-grow:hover {
  transform: scale(1.1);
}

/* Additional responsive styles */
@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }

  .col-md-4,
  .col-12 {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>
