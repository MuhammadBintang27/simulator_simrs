<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <div class="content">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Pendataan Diet Pasien</h1>

          <!-- <h3 style="color: cadetblue">Poli : {{ namadokterSelected?.POLI }}</h3> -->
          <p class="hero-description">
            Modul Pendataan Diet Pasien digunakan untuk mencatat, memantau, dan mengelola kebutuhan
            diet setiap pasien sesuai kondisi medis dan rekomendasi tim gizi.
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien }}</div>
          <div class="stat-label">Total Pasien</div>
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
            <i class="pi pi-search"></i>
            Pencarian Global
          </label>
          <InputText v-model="globalFilter" placeholder="Cari nama, NO MR, alamat..." />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-home"></i>
            Pilih Ruangan
          </label>
          <!-- Removed debug display -->
          <Select
            v-model="ruanganSelected"
            :options="list_ruangan"
            optionLabel="NAMA"
            optionValue="KODE"
            placeholder="Pilih Ruangan"
            @change="fetchData"
            filter
            showClear
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-plus"></i>
            Tanggal Pemberian Diet
          </label>
          <DatePicker
            v-model="tanggal_diet_pasien_selected"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Pilih Jadwal</label>
          <Select
            v-model="selectedWilayah"
            :options="wilayahOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Jadwal"
            style="width: 100%"
            showClear
          />
        </div>
      </div>
    </div>

    <!-- DataTable Section -->
    <div class="tabs-section">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">
            <i class="pi pi-list"></i>
            Daftar Pasien ({{ filteredPasien.length }})
          </h3>
          <div class="table-actions">
            <Button
              icon="pi pi-filter-slash"
              label="Reset Filter"
              @click="resetFilters"
              class="p-button-outlined p-button-secondary"
              size="small"
            />
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              @click="fetchData"
              :loading="loading"
              class="round-button"
              size="small"
            />
          </div>
        </div>

        <DataTable
          :value="filteredPasien"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50, 100]"
          :globalFilter="globalFilter"
          :globalFilterFields="['NAMAPASIEN', 'NOMR', 'ALAMAT']"
          :sortField="'NOMR'"
          :sortOrder="1"
          responsiveLayout="scroll"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} pasien"
          class="elegant-datatable"
          stripedRows
        >
          <Column header="AKSI">
            <template #body="slotProps">
              <div class="action-buttons">
                <!-- <Button
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-outlined p-button-info"
                    size="small"
                    @click="viewPatientDetail(slotProps.data)"
                    v-tooltip.top="'Lengkapi TTV'"
                  />
                  <Button
                    icon="pi pi-arrow-right"
                    label=""
                    @click="keformpoli(slotProps.data)"
                    class="round-button2"
                    size="small"
                  /> -->
                <i
                  :class="slotProps.data.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                  :style="{
                    fontSize: '32px',
                    color: slotProps.data.JENISKELAMIN === 'P' ? 'violet' : 'steelblue',
                  }"
                >
                </i>
                <!-- sedikit lebih besar -->
              </div>
            </template>
          </Column>
          <Column
            field="DATA_SINGKAT"
            header="INFORMASI PASIEN"
            :sortable="true"
            style="min-width: 280px"
          >
            <template #body="slotProps">
              <div class="patient-info">
                <div class="patient-header">
                  <div
                    class="patient-details hover-grow"
                    @click="viewPatientDetail(slotProps.data)"
                  >
                    <strong class="patient-name"
                      >{{ slotProps.data.NAMAPASIEN }} - {{ slotProps.data.NOMR }}
                    </strong>
                    <!-- <div class="patient-mr">NO MR: {{ slotProps.data.NOMR }}</div> -->
                    <div class="patient-extra" style="color: darkcyan">
                      <!-- {{ slotProps.data.NAMADOKTER }} -->
                      {{ slotProps.data.USIA_PASIEN?.tahun }} Thn,{{
                        slotProps.data.USIA_PASIEN?.bulan
                      }}
                      Bln,
                      {{ slotProps.data.USIA_PASIEN?.hari }} Hari
                    </div>

                    <Tag v-if="slotProps.data?.highlight" severity="warn">YA</Tag>
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="NAMADOKTER" header="DOKTER" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="address-info">
                <i
                  class="pi pi-users"
                  style="margin-right: 8px; color: #6b7280; color: darkturquoise"
                ></i>

                <span style="color: steelblue"
                  >{{ slotProps.data.NAMADOKTER }}<br />
                  <strong>{{ slotProps.data.POLI }}</strong>
                </span>
              </div>
            </template>
          </Column>

          <Column field="ALAMAT" header="ALAMAT" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="address-info">
                <i class="pi pi-map-marker" style="margin-right: 8px; color: #6b7280"></i>
                <span>{{ slotProps.data.ALAMAT || 'Alamat tidak tersedia' }}</span>
              </div>
            </template>
          </Column>

          <Column field="MASUKPOLY" header="TGL RAWAT" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="address-info">
                <span
                  >M: {{ slotProps.data.MASUKPOLY_DISPLAY }} <br />
                  K : {{ slotProps.data.KELUARPOLY }}</span
                >
              </div>
            </template>
          </Column>

          <Column field="CARABAYAR" header="CARA BAYAR" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <div class="mr-badge">
                <i class="pi pi-id-card" style="margin-right: 6px"></i>
                {{ slotProps.data.CARABAYAR }}
              </div>
            </template>
          </Column>
          <Column field="AKSI" header="AKSI" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <Button
                icon="pi pi-eye"
                class="p-button-rounded p-button-outlined p-button-info"
                label="RM EL"
                size="small"
                @click="PrintRekamMedisEl(slotProps.data.NOPENDAFTARAN)"
                v-tooltip.top="'Lengkapi TTV'"
              />
            </template>
          </Column>
        </DataTable>

        <!-- Empty State -->
        <div v-if="!loading && filteredPasien.length === 0" class="empty-state">
          <i class="pi pi-users empty-icon"></i>
          <h3 class="empty-title">Tidak Ada Data Pasien</h3>
          <p class="empty-description">
            Belum ada data pasien yang sesuai dengan filter yang dipilih. Coba ubah kriteria
            pencarian atau reset filter.
          </p>
        </div>
      </div>
    </div>

    <!-- Patient Detail Dialog -->

    <ListDietComponent
      v-model:showHistoryTeraphy="showDetailDialog"
      :datapasien="selectedPatient"
      :tanggal_diet="tanggal_diet_pasien_selected"
      :shif_diet="selectedWilayah"
    ></ListDietComponent>

    <!-- Toast for notifications -->

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

import ListDietComponent from '@/components/GiziComp/ListDietComponent.vue'

import DatePicker from 'primevue/datepicker'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Select from 'primevue/select'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

// Store and toast setup
const configStore = useConfigStore()
const toast = useToast()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// Reactive data
const listpasienStore = ref([])
const loading = ref(false)
const globalFilter = ref('')
const selectedWilayah = ref(null)
const selectedStatus = ref(null)
const tanggal_diet_pasien_selected = ref(new Date())
const endDate = ref(new Date())
const showDetailDialog = ref(false)
const selectedPatient = ref(null)

const namadokterSelected = ref(null)

// Selected level

const wilayahOptions = ref([
  { label: 'PAGI', value: 'PAGI' },
  { label: 'SIANG', value: 'SIANG' },
  { label: 'MALAM', value: 'MALAM' },
])

const keformpoli = (status) => {
  console.log(status)
  const routeData = router.resolve({
    name: 'FormPoliKlinikView',
    params: { id: status.NOPENDAFTARAN },
    query: {
      noreg: status.NOPENDAFTARAN,
      noka: status.NOJAMINAN,
      nomr: status.NOMR,
    },
  })
  window.open(routeData.href, '_blank')
}

const PrintRekamMedisEl = (NOPENDAFTARAN) => {
  //onHide()
  const routeData = router.resolve({
    name: 'RMEViewer',
    query: { noreg: NOPENDAFTARAN },
  })
  window.open(routeData.href, '_blank')
}

const ruanganSelected = ref(null)
const list_ruangan = ref([])

const get_nama_ruangan = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/1/${id_client.value}`,
    )
    list_ruangan.value = response.data
  } catch (error) {
    console.error('Error fetching rooms:', error)
  }
}

// Computed properties
const filteredPasien = computed(() => {
  let filtered = [...listpasienStore.value]

  // Global filter
  if (globalFilter.value) {
    const query = globalFilter.value.toLowerCase()
    filtered = filtered.filter(
      (patient) =>
        patient.NAMAPASIEN?.toLowerCase().includes(query) ||
        patient.NOMR?.toLowerCase().includes(query) ||
        patient.ALAMAT?.toLowerCase().includes(query) ||
        patient.DATA_SINGKAT?.toLowerCase().includes(query),
    )
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter((patient) => patient.STATUS_KUNJUNGAN === selectedStatus.value)
  }

  return filtered
})

const totalPasien = computed(() => listpasienStore.value.length)

const viewPatientDetail = (patient) => {
  selectedPatient.value = patient
  showDetailDialog.value = true
}

const resetFilters = () => {
  globalFilter.value = ''
  selectedWilayah.value = null
  selectedStatus.value = null
  tanggal_diet_pasien_selected.value = new Date()
  endDate.value = new Date()
  ruanganSelected.value = null

  toast.add({
    severity: 'info',
    summary: 'Filter Reset',
    detail: 'Semua filter telah direset',
    life: 2000,
  })
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
    return null
  }
}

const data_list_diet = ref(null)

const updateHighlight = () => {
  const factNomrSet = new Set(data_list_diet.value.map((f) => f.NOMR))

  listpasienStore.value = listpasienStore.value.map((pasien) => ({
    ...pasien,
    highlight: factNomrSet.has(pasien.NOMR),
  }))
}

// API functions
const getDataListDietPasien = async () => {
  try {
    loading.value = true

    const formattedDate = formatDateForAPI(tanggal_diet_pasien_selected.value)
    if (!formattedDate) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Pilih tanggal terlebih dahulu',
        life: 3000,
      })
      loading.value = false
      return
    }

    const param = {
      id_client: id_client.value,
      mode: 1,
      jenis_penunjang: 5,
      shif: selectedWilayah.value,
      tanggal: formattedDate,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/Data_referensi/getlist_penunjang_order_jasa_penunjang`,
      param,
    )

    if (response.data && response.data.response) {
      data_list_diet.value = [...response.data.response]
      updateHighlight()
    } else {
      data_list_diet.value = []
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data. Silakan coba lagi.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// API calls
const fetchData = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const param = {
      tglawal: formatDate(tanggal_diet_pasien_selected.value),
      tglakhir: formatDate(endDate.value),
      id_client: id_client.value,
      mod: 5,
      kodeunit: ruanganSelected.value || '', // Fixed: Use .value to get the actual value
      noregister: '',
      nosep: '',
      jenisrawat: '',
    }

    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, param)

    // Process the response data to add computed fields
    const rawData = response.data.response || []
    namadokterSelected.value = rawData[0] || null
    listpasienStore.value = rawData.map((patient) => ({
      ...patient,
      NAMAPASIEN: patient.NAMAPASIEN || extractNameFromDataSingkat(patient.DATA_SINGKAT),
    }))

    await getDataListDietPasien()
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

const extractNameFromDataSingkat = (dataSingkat) => {
  if (!dataSingkat) return 'Nama tidak tersedia'
  const parts = dataSingkat.split(',')
  return parts[0] || 'Nama tidak tersedia'
}

const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Initialize data
onMounted(() => {
  get_nama_ruangan()
})

// Watch for date changes
watch([tanggal_diet_pasien_selected, endDate], () => {
  if (tanggal_diet_pasien_selected.value && endDate.value) {
    // Uncomment if you want auto-fetch on date change
    // fetchData()
  }
})
</script>

<style scoped>
/* Hero Section */

.hover-grow {
  cursor: pointer; /* hand cursor */
  transition: transform 0.1s ease-in-out;
}

.hover-grow:hover {
  transform: scale(1.1); /* grow 10% on hover */
}
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.custom-textarea {
  font-size: 14px !important;
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  padding: 12px !important;
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
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 2rem;
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
  justify-content: flex-start;
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

.elegant-input {
  height: 50px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.elegant-input:focus {
  border-color: #667eea;
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Radio button styling */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-group > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

/* Table Section */
.tabs-section {
  background: white;
  border-radius: 1px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-container {
  padding: 0.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

/* Patient Info Styles */
.patient-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.patient-name {
  color: #2563eb;
  font-size: 1rem;
  display: block;
}

.patient-mr {
  color: #6b7280;
  font-size: 0.9rem;
}

.patient-extra {
  color: #9ca3af;
  font-size: 0.85rem;
}

.address-info {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.mr-badge {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-tag-elegant {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

/* Patient Detail Dialog */
.patient-detail-content {
  padding: 1rem 0;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
}

.detail-item span {
  color: #1e293b;
  font-size: 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.5rem;
}

.col-md-3 {
  flex: 0 0 25%;
  padding: 0 0.5rem;
}

.col-md-12 {
  flex: 0 0 100%;
  padding: 0 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mt-5 {
  margin-top: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-stats {
    justify-content: center;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .row {
    flex-direction: column;
  }

  .col-md-3,
  .col-md-12 {
    flex: 0 0 100%;
    margin-bottom: 1rem;
  }
}

/* PrimeVue Component Overrides */
:deep(.modern-select .p-select) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.modern-select .p-select:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.modern-datepicker .p-datepicker-input) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.modern-datepicker .p-datepicker-input:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.elegant-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #1e293b;
  font-weight: 600;
  padding: 1rem;
}

:deep(.elegant-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

:deep(.elegant-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
  transform: translateY(-1px);
}

:deep(.elegant-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  border: none;
}

:deep(.p-button) {
  border-radius: 8px;
  font-weight: 600;
}

:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-datepicker input) {
  border-radius: 8px;
}

:deep(.p-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.p-dialog-header) {
  padding: 1.5rem 2rem;
}

:deep(.p-dialog-header .p-dialog-header-icon) {
  color: white;
}

:deep(.p-dialog-header .p-dialog-title) {
  font-weight: 600;
  font-size: 1.125rem;
}

:deep(.p-toast .p-toast-message) {
  border-radius: 8px;
}

:deep(.patient-detail-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}
</style>
