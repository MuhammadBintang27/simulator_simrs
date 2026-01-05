<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Silahkan menunggu...." />

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Permintaan pemeriksaan lab</h1>

          <p class="hero-description">
            "Daftar permintaan pemeriksaan lab dari seluruh unit pelayanan, digunakan untuk
            monitoring, verifikasi, dan tindak lanjut proses pemeriksaan."
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien }}</div>
          <div class="stat-label">Total Pasien</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienSelesai }}</div>
          <div class="stat-label">Selesai Dilayani</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienAktif }}</div>
          <div class="stat-label">Belum dilayani</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienProses }}</div>
          <div class="stat-label">Proses</div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <i class="pi pi-filter"></i>
          Filter & Pencarian
        </h3>
      </div>
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-plus"></i>
            Tanggal Mulai
          </label>
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            showIcon
            iconDisplay="input"
            @date-select="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-minus"></i>
            Tanggal Selesai
          </label>
          <DatePicker
            v-model="endDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            showIcon
            iconDisplay="input"
            @date-select="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-search"></i>
            Pencarian Global
          </label>
          <InputText
            v-model="globalFilter"
            @keyup="applyFilters"
            placeholder="Cari nama, NO MR, alamat..."
          />
        </div>
        <div class="filter-group">
          <Button label="Cari" icon="pi pi-search" @click="fetchData(1)" />
        </div>
      </div>
    </div>

    <div class="card elevation-0">
      <div class="card-header">
        <Button label="Semua Data" severity="warn" @click="fetchDataWithStatus(null)">
          <template #icon>
            <i class="fa-solid fa-list"></i>
          </template>
        </Button>

        <Button label="Selesai" severity="success" @click="fetchDataWithStatus('C')">
          <template #icon>
            <i class="fa-solid fa-check"></i>
          </template>
        </Button>

        <Button label="Refresh" severity="info" @click="fetchData(1)">
          <template #icon>
            <i class="fa-solid fa-rotate"></i>
          </template>
        </Button>
      </div>

      <div class="card-body">
        <DataTable
          :value="filteredData"
          striped-rows
          showGridlines
          paginator
          rowHover
          responsiveLayout="scroll"
          scrollable
          scrollHeight="70vh"
          :rows="25"
          :rowsPerPageOptions="[5, 10, 20, 25, 50, 100]"
          tableStyle="min-width: 50rem"
        >
          <!-- TRANS -->
          <Column field="TRANS" header="TRANS" style="max-width: 11em"></Column>

          <!-- STATUS -->
          <Column field="STATUS_PROGRESS" header="STTS" style="text-align: center; max-width: 5em">
            <template #body="{ data }">
              <Tag :severity="getStatusColorClass(data.STATUS_PROGRESS)" role="status">
                {{ data.STATUS_PROGRESS }}
              </Tag>
            </template>
          </Column>

          <!-- WAKTU -->
          <Column field="TANGGAL" header="WAKTU">
            <template #body="{ data }">
              {{ formatDateTimeForAPI_V2(data.TANGGAL) }}
            </template>
          </Column>

          <!-- NOMR -->
          <Column field="NOMR" header="NOMR" sortable></Column>

          <!-- NAMA -->
          <Column field="NAMA" header="NAMA" style="max-width: 14em" sortable></Column>

          <!-- ALAMAT -->
          <Column field="ALAMAT" header="ALAMAT" sortable></Column>

          <!-- DPJP -->
          <Column field="DPJP" header="DPJP" sortable></Column>
          <Column field="POLI_RUANG" header="POLI/RUANG" sortable></Column>

          <!-- JENIS RAWAT -->
          <Column field="JENISRAWAT" header="JENISRAWAT" sortable></Column>

          <!-- CARA BAYAR -->
          <Column field="CARABAYAR" header="CB" style="max-width: 5em" sortable></Column>

          <!-- MASUK -->
          <Column field="MASUK" header="MASUK" sortable></Column>

          <!-- PROSES -->
          <Column field="PROSES" header="PROSES" sortable></Column>

          <!-- SELESAI -->
          <Column field="SELESAI" header="SELESAI" sortable></Column>

          <!-- AKSI -->
          <Column header="AKSI" style="min-width: 8em; text-align: center">
            <template #body="{ data }">
              <span v-if="data.STTS_SPESIMEN == 'A'">
                <i class="fas fa-check-circle fa-1x" style="color: cornflowerblue"></i>
              </span>
              <span v-else>
                <i class="fas fa-minus-circle fa-1x" style="color: gray"></i>
              </span>

              <button class="btn btn-xs btn-default" @click="CallSpesimenForm(data)">
                Spesimen
              </button>
            </template>
          </Column>
          <Column header="AKSI" style="text-align: center">
            <template #body="{ data }">
              <button class="btn btn-sm btn-default" @click="prosesHasilLab(data)">
                <i class="fa-solid fa-search"></i>
              </button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="showSpesimen"
    :style="{ width: '700px' }"
    :modal="true"
    :closable="false"
  >
    <Panel class="container-fluid">
      <template #header> <h5>Spesimen Pasien</h5> </template>
      <!-- Jenis Spesimen -->
      <div class="form-group row mb-2">
        <label class="col-md-3 col-form-label">Jenis Spesimen</label>
        <div class="col-md-9">
          <MultiSelect
            :maxSelectedLabels="3"
            style="width: 100%"
            v-model="spesimen.type"
            :options="spesimenTypeList"
            @change="get_by_kategori"
            placeholder="Pilih jenis spesimen"
            optionLabel="label"
            class="w-full"
            filter
          />
        </div>
      </div>
      <!-- Metode Pengambilan -->
      <div class="form-group row mb-2">
        <label class="col-md-3 col-form-label">Metode</label>
        <div class="col-md-9">
          <MultiSelect
            :maxSelectedLabels="3"
            v-model="spesimen.collectionMethod"
            :options="metodeList"
            placeholder="Pilih metode"
            class="w-full"
            :loading="loadingMethod"
            optionLabel="display_id"
            style="width: 100%"
          />
        </div>
      </div>
      <!-- Waktu Diterima -->
      <div class="form-group row mb-2">
        <label class="col-md-3 col-form-label">Waktu Diterima</label>
        <div class="col-md-9">
          <DatePicker v-model="spesimen.receivedTime" showTime hourFormat="24" class="w-full" />
        </div>
      </div>

      <!-- Waktu Diterima -->
      <div class="form-group row mb-2">
        <label class="col-md-3 col-form-label">Item Pemeriksaan</label>
        <div class="col-md-9">
          <span v-for="(item, index) in itemPemeriksaan" :key="index">
            <small><Tag :value="item.NAMABARANG" class="ml-1 mt-1"></Tag></small>
          </span>
        </div>
      </div>
    </Panel>

    <div class="flex justify-content-end gap-2 mt-3">
      <Button
        label="Batal"
        icon="pi pi-times"
        class="p-button-secondary"
        @click="showSpesimen = false"
      />
      <Button label="Simpan" icon="pi pi-save" class="p-button-success" @click="simpanSpesimen" />
    </div>
  </Dialog>

  <Toast />
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

import { useRouter } from 'vue-router'

const router = useRouter()

const showSpesimen = ref(false)

const spesimen = reactive({
  type: ref([]), // Kode SNOMED jenis spesimen
  collectedDateTime: null,
  collectionMethod: ref([]),
  receivedTime: new Date(),
})

const tempRowdata = ref(null)
const CallSpesimenForm = (row) => {
  tempRowdata.value = row
  showSpesimen.value = true

  SelectedSpesimen()

  getItemPemeriksaanLab(row.TRANS)
}

const metodeList = ref([])

const loading = ref(false)
const fact = ref([])
const globalFilter = ref('')
const startDate = ref(new Date())
const endDate = ref(new Date())

// ✅ FIX 1: Computed property for filtered data
const filteredData = computed(() => {
  return fact.value.filter((item) => {
    // Filter by global search
    if (globalFilter.value) {
      const searchTerm = globalFilter.value.toLowerCase()
      const matchesSearch =
        (item.NAMA_PASIEN || '').toLowerCase().includes(searchTerm) ||
        (item.NOMR || '').toLowerCase().includes(searchTerm) ||
        (item.NAMA || '').toLowerCase().includes(searchTerm) ||
        (item.ALAMAT || '').toLowerCase().includes(searchTerm) ||
        (item.DPJP || '').toLowerCase().includes(searchTerm)

      if (!matchesSearch) return false
    }

    // Filter by date range
    if (startDate.value && endDate.value && item.TANGGAL) {
      const itemDate = new Date(item.TANGGAL)
      const start = new Date(startDate.value)
      const end = new Date(endDate.value)

      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      if (itemDate < start || itemDate > end) return false
    }

    return true
  })
})

// ✅ FIX 2: Corrected computed properties
const totalPasien = computed(() => fact.value.length)

const pasienSelesai = computed(() => {
  return fact.value.filter((p) => p.STATUS_PROGRESS === 'C').length
})

const pasienProses = computed(() => {
  return fact.value.filter((p) => p.STATUS_PROGRESS === 'P').length
})

const pasienAktif = computed(() => {
  return fact.value.filter((p) => p.STATUS_PROGRESS !== 'C').length
})

const rataKunjungan = computed(() => 0)

// Helper functions
const getStatusColorClass = (s) => {
  const key = String(s || '').toUpperCase()
  switch (key) {
    case 'M':
      return 'warn'
    case 'C':
      return 'success'
    default:
      return 'bg-gray-400'
  }
}

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

const itemPemeriksaan = ref([])

const getItemPemeriksaanLab = async (noreceipt) => {
  try {
    loading.value = true

    itemPemeriksaan.value = []

    const payload = {
      RECEIPT_NO: noreceipt,
      IDCLIENT: id_client.value,
      MODE: 'RCPT',
      TGLMIN: '',
      TGLMAX: '',
      MEMBERSHIP: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/bill`, payload)

    //itemPemeriksaan.value = response.data.response || []
    itemPemeriksaan.value = (response.data.response || []).filter(
      (item) => item.KATEGORI?.toUpperCase() === 'LABORATORIUM',
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    showError(error.message)
  } finally {
    loading.value = false
  }
}

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

// ✅ FIX 3: Date formatting functions
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

const formatDateTimeForAPI_V2 = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return ` ${day}/${month}/${year}`
  } catch (error) {
    return null
  }
}

const listReceipts = ref([])
// ✅ FIX 4: Fetch data functions
const fetchData = async (mode, stts = null, nomr = null) => {
  try {
    loading.value = true

    const payload = {
      id_client: id_client.value,
      kategori: 'LABORATORIUM',
      mode: mode,
      status: stts,
      nomr: nomr,
      tanggal: formatDateOnlyForAPI(startDate.value),
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_list_labor_dan_radiologiv2`,
      payload,
    )

    // Set data + tambah field STTS_SPESIMEN = 'N'
    fact.value = (response.data.response || []).map((item) => ({
      ...item,
      STTS_SPESIMEN: 'N', // field baru
    }))

    listReceipts.value = fact.value.map((item) => item.TRANS)
    await get_list_spesimen()

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
    showError(error.message)
  }
}

const prosesHasilLab = (noreceipt) => {
  if (noreceipt.STTS_SPESIMEN != 'A') {
    showWarning('Data ini belum memiliki Spesimen Pemeriksaan, silahkan input data spesimen')
    return
  }

  const routeData = router.resolve({
    name: 'ProsesLabView',
    params: {
      noreceipt: noreceipt.TRANS, // <-- ini benar
    },
  })

  window.open(routeData.href, '_blank')
}
const simpanSpesimen = async () => {
  try {
    //loading.value = true

    const payload = {
      id_client: id_client.value,
      receipt_no: tempRowdata.value.TRANS,
      tanggal: formatDateTimeForAPI(spesimen.receivedTime),
      spesimen: spesimen,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/penunjang/simpan_trans_spesimen`,
      payload,
    )

    if (response.data.code == 200) {
      showSuccess(response.data.message)

      fact.value.forEach((element) => {
        const found = element.TRANS === tempRowdata.value.TRANS
        if (found) {
          element.STTS_SPESIMEN = 'A'
        }
      })
    } else {
      showWarning(response.data.message)
    }

    showSpesimen.value = false

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false

    showError(error.message)
  }
}

const get_list_spesimen_list = ref([])
const get_list_spesimen = async () => {
  try {
    //loading.value = true

    const payload = {
      receipts: listReceipts.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/get_spesimen`, payload)

    get_list_spesimen_list.value = response.data || []

    fact.value.forEach((element) => {
      const found = get_list_spesimen_list.value.find((x) => x.receipt_no === element.TRANS)
      if (found) {
        element.STTS_SPESIMEN = 'A'
      }
    })

    showSpesimen.value = false

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false

    showError(error.message)
  }
}

// Date formatting
const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
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

const spesimenTypeList = ref([])

const spesimenType = async () => {
  try {
    loading.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/specimen_type`)

    spesimenTypeList.value = response.data || []
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
    showError(error.message)
  }
}

const loadingMethod = ref(false)

const selectedSpesimenList = ref([])

const SelectedSpesimen = async () => {
  try {
    loading.value = true
    const payload = {
      kategori: spesimen.kategori,
      id_client: id_client.value,
      receipt_no: tempRowdata.value.TRANS,
    }

    spesimen.type = []
    spesimen.collectionMethod = []
    metodeList.value = []

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/spesimen_selected`, payload)

    if (response.data.type?.length > 0) {
      response.data.type.forEach((element) => {
        const found = spesimenTypeList.value.find((x) => x.snomed_code === element.snomed_code)
        if (found) {
          // console.log('data spesimen saved', response.data.type[0].waktu_terima_spesimen)
          spesimen.type.push(found)
          spesimen.receivedTime = response.data.type[0].waktu_terima_spesimen
        }
      })
      await get_by_kategori(spesimen.type)
    }

    if (response.data.collectionMethod?.length > 0) {
      response.data.collectionMethod.forEach((element) => {
        const found = metodeList.value.find((x) => x.snomed_code === element.snomed_code)
        if (found) {
          spesimen.collectionMethod.push(found)
        }
      })
    }

    loading.value = false
  } catch (error) {
    loading.value = false
    showError(error)
  }
}

const get_by_kategori = async (selected) => {
  ///methode
  try {
    const list = Array.isArray(selected) ? selected : selected.value

    if (!Array.isArray(list)) {
      console.error('Bukan array:', selected)
      return
    }

    metodeList.value = []

    spesimen.kategori = list.map((item) => item.kategori)

    loadingMethod.value = true

    if (spesimen.kategori.length == 0) {
      loadingMethod.value = false
      return
    }

    const payload = {
      kategori: spesimen.kategori,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/get_by_kategori`, payload)

    metodeList.value = response.data || []
    loadingMethod.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loadingMethod.value = false
    showError(error.message)
  }
}

const fetchDataWithStatus = (status) => {
  globalFilter.value = ''
  fetchData(1, status)
}

// ✅ FIX 5: Apply filters trigger
const applyFilters = () => {
  // This will automatically trigger the computed property update
}

onMounted(() => {
  fetchData(1)
  spesimenType()
})
</script>

<style scoped>
/* Compact table styling */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 1rem;
}

/* Hover effect */
.table-orange tbody tr:hover {
  background-color: #faf3eb !important;
  transition: background-color 0.2s ease;
}

.table-orange thead th {
  background-color: #fff4e0;
  color: #663c00;
  font-weight: 600;
  border-bottom: 2px solid #faf3eb;
}

.table-orange td,
.table-orange th {
  border-color: #faf3eb;
}

.table-compact td,
.table-compact th {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  vertical-align: middle !important;
  font-size: 0.8rem;
  line-height: 1.2;
}

.table-orange {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(15px);
  border-radius: 4px;
  padding: 1.5rem;
  min-width: 180px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filter Section */
.filter-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 5px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header {
  display: flex;
}

.card-body {
  overflow: auto;
}
</style>
