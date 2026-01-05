<template>
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Permintaan Assessment Gizi</h1>

          <!-- <h3 style="color: cadetblue">Poli : {{ namadokterSelected?.POLI }}</h3> -->
          <p class="hero-description">
            Asesmen gizi adalah langkah awal dalam pelayanan gizi klinik untuk menilai status gizi
            pasien. Petugas gizi melakukan pengumpulan data melalui anamnesis, pemeriksaan fisik,
            antropometri, biokimia, riwayat makan, serta kondisi klinis pasien. Hasil asesmen
            digunakan sebagai dasar penyusunan diagnosis gizi dan intervensi gizi
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien }}</div>
          <div class="stat-label">Total Pasien</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienHariIni }}</div>
          <div class="stat-label">Pasien Hari Ini</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ rataKunjungan }}</div>
          <div class="stat-label">Batal</div>
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
            <i class="pi pi-filter"></i>
            Filter Status
          </label>
          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Status"
            class="w-full"
            :clearable="true"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-minus"></i>
            Tanggal Selesai
          </label>
          <DatePicker
            v-model="tanggal"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            showIcon
            iconDisplay="input"
            :clearable="true"
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
          <Column header="#" style="width: 30px">
            <template #body="slotProps">
              <h6>{{ slotProps.data.NOMORANTRIAN }}</h6>
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
                  <div class="patient-details">
                    <strong class="patient-name">
                      {{ slotProps.data.NAMAPASIEN }} - {{ slotProps.data.NOMR }}
                    </strong>
                    <div class="patient-extra" style="color: darkcyan">
                      {{ slotProps.data.USIA_PASIEN.tahun }} Thn,
                      {{ slotProps.data.USIA_PASIEN.bulan }} Bln,
                      {{ slotProps.data.USIA_PASIEN.hari }} Hari
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column
            field="NAMADOKTER"
            header="DOKTER PENGIRIM"
            :sortable="true"
            style="min-width: 200px"
          >
            <template #body="slotProps">
              <div class="address-info">
                <i
                  class="pi pi-users"
                  style="margin-right: 8px; color: #6b7280; color: darkturquoise"
                ></i>
                <span style="color: steelblue">
                  {{ slotProps.data.NAMADOKTER }}<br />{{ slotProps.data.POLI }}
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

          <Column field="TANGGAL" header="TANGGAL" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="address-info">
                <span> M: {{ slotProps.data.TANGGAL_REQ }} </span>
              </div>
            </template>
          </Column>

          <Column field="NOMR" header="NO REKAM MEDIS" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <div class="mr-badge">
                <i class="pi pi-id-card" style="margin-right: 6px"></i>
                {{ slotProps.data.NOMR }}
              </div>
            </template>
          </Column>

          <Column field="PROGRES" header="PROGRES" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <div class="progress-status">
                <!-- Option 1: Simple span with conditional styling -->
                <Tag
                  v-if="slotProps.data.PROGRES === 'M'"
                  severity="warn"
                  class="status-badge status-waiting"
                >
                  Menunggu
                </Tag>
                <Tag
                  v-else-if="slotProps.data.PROGRES === 'C'"
                  class="status-badge status-completed"
                >
                  Selesai
                </Tag>
                <span v-else class="status-badge status-unknown">
                  {{ slotProps.data.PROGRES }}
                </span>
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
          <Column header="AKSI" style="min-width: 120px">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button
                  icon="pi pi-arrow-right"
                  label=""
                  @click="keformAsesmen(slotProps.data)"
                  class="round-button2"
                  size="small"
                />
              </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

// Import PrimeVue components
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import { useRouter } from 'vue-router'

const router = useRouter()

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

// Reactive refs
const loading = ref(false)
const tanggal = ref(new Date())
const globalFilter = ref('')
const listpasienStore = ref([])
const selectedStatus = ref(null)
const selectedWilayah = ref(null)

// Status options for filter
const statusOptions = ref([
  { label: 'Semua Status', value: null },
  { label: 'Sedang dirawat', value: 'Sedang dirawat' },
  { label: 'Pulang', value: 'Pulang' },
])

// Computed properties
const totalPasien = computed(() => {
  return listpasienStore.value.length
})

const pasienHariIni = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return filteredPasien.value.filter((p) => {
    return p.TANGGAL_DAFTAR?.includes(today)
  }).length
})

const rataKunjungan = computed(() => {
  return Math.round(totalPasien.value / 30)
})

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

  // Wilayah filter
  if (selectedWilayah.value) {
    filtered = filtered.filter((patient) => patient.NAMADOKTER === selectedWilayah.value)
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter((patient) => patient.STTS_PULANG === selectedStatus.value)
  }

  return filtered
})

const keformAsesmen = (status) => {
  console.log(status)
  const routeData = router.resolve({
    name: 'Gizi',
    params: { id: status.NOPENDAFTARAN },
    query: {
      noreg: status.NOPENDAFTARAN,
      noka: status.NOJAMINAN,
      nomr: status.NOMR,
      no_konsul: status.no_konsul,
      /* any query params */
    },
  })
  window.open(routeData.href, '_blank')
  // Or with named route:
  // router.push({ name: 'AboutPage' })
  //  localStorage.setItem('datapasienpoli', JSON.stringify({ id: 1, name: 'Zafira' }))
}

// Methods
const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const resetFilters = () => {
  globalFilter.value = ''
  tanggal.value = new Date()
  selectedStatus.value = null
  selectedWilayah.value = null

  toast.add({
    severity: 'info',
    summary: 'Filter Reset',
    detail: 'Semua filter telah direset',
    life: 2000,
  })
}

const fetchData = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const param = {
      tanggal: formatDate(tanggal.value),
      id_client: id_client.value,
      mod: 1,
    }

    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_data_permintaan_ass_gizi`,
      param,
    )

    const rawData = response.data.response || []
    listpasienStore.value = rawData.map((patient) => ({
      ...patient,
    }))

    toast.add({
      severity: 'success',
      detail: `Berhasil memuat ${listpasienStore.value.length} data pasien`,
      life: 3000,
    })
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

const viewPatientDetail = (patient) => {
  // Handle patient detail view
  console.log('View patient:', patient)
}

const keformpoli = (patient) => {
  // Handle navigation to form
  console.log('Navigate to form:', patient)
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background: linear-gradient(
    135deg,
    #03045e 0%,
    #38a3a5 100%
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.custom-textarea {
  font-size: 14px !important;
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
  font-size: 1rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-weight: 600;
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
