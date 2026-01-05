<template>
  <!-- <loading_overlay :is-loading="loading" message="Memuat...." /> -->
  <div class="content">
    <!-- Hero Section with improved visual appeal -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Revenue Penyewaan</h1>
          <p class="hero-description">
            Kelola dan pantau pendapatan dari penyewaan kendaraan dengan analisis mendalam
            berdasarkan periode waktu dan performa driver.
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalIncome) }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ total_trans }}</div>
          <div class="stat-label">Total Transaksi</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ avgOkupasi }} %</div>
          <div class="stat-label">RATA2 OKUPASI</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totaljasaDriver) }}</div>
          <div class="stat-label">Jasa Driver</div>
        </div>
        <!-- <div class="stat-card">
          <div class="stat-value">{{ fact.length }}</div>
          <div class="stat-label">Total Transaksi</div>
        </div> -->
      </div>
    </div>

    <!-- Enhanced Filter Panel -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <i class="pi pi-filter"></i>
          Filter & Pencarian
        </h3>
        <Button
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          size="small"
          @click="resetForm"
          outlined
        />
      </div>

      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar"></i>
            TANGGAL MULAI
          </label>
          <DatePicker
            v-model="param.start"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            class="modern-datepicker"
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-plus"></i>
            TANGGAL SELESAI
          </label>
          <DatePicker
            v-model="param.end"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            class="modern-datepicker"
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="filter-group search-group">
          <Button
            icon="pi pi-search"
            label="Cari Data"
            class="search-button"
            @click="fetchData"
            :disabled="!isFormValid || loading"
            :loading="loading"
            size="large"
          />
        </div>
      </div>
    </div>

    <!-- Enhanced Tabs -->
    <div class="tabs-section">
      <Tabs value="0" class="modern-tabs">
        <TabList>
          <Tab value="0" class="tab-item">
            <i class="pi pi-table"></i>
            Data Transaksi
          </Tab>
          <Tab value="1" class="tab-item">
            <i class="pi pi-users"></i>
            Berdasarkan Driver
          </Tab>
          <Tab value="2" class="tab-item">
            <i class="pi pi-chart-bar"></i>
            Analisis Lanjutan
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="0">
            <div class="table-container">
              <div class="table-header">
                <div class="table-title">
                  <i class="pi pi-list"></i>
                  <span>Daftar Transaksi Penyewaan</span>
                </div>
                <div class="table-actions" v-if="fact.length > 0">
                  <Button
                    icon="pi pi-download"
                    label="Export"
                    severity="secondary"
                    size="small"
                    outlined
                  />
                </div>
              </div>

              <DataTable
                :value="fact"
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                stripedRows
                responsiveLayout="scroll"
                scrollable
                scrollHeight="500px"
              >
                <Column field="no_pol" header="NO POLISI" sortable class="col-license">
                  <template #body="{ data }">
                    <div class="license-plate">
                      <i class="pi pi-car text-primary"></i>
                      <span class="font-bold">{{ data.no_pol }}</span>
                    </div>
                  </template>
                </Column>

                <Column field="desc" header="DESKRIPSI" sortable class="col-license">
                  <template #body="{ data }">
                    <div class="license-plate">
                      <i class="pi pi-check text-primary"></i>
                      <span class="font-bold">{{ data.desc }}</span>
                    </div>
                  </template>
                </Column>

                <Column field="durasi" header="DURASI" sortable class="col-duration">
                  <template #body="{ data }">
                    <div class="duration-info">
                      <span class="duration-value">{{ data.durasi }}</span>
                      <span class="duration-unit">{{ data.satuan }}</span>
                    </div>
                  </template>
                </Column>

                <Column field="status" header="OKUPASI" sortable class="col-status">
                  <template #body="{ data }">
                    <Tag :value="data.okupasi + ' %'" class="status-tag" />
                  </template>
                </Column>

                <Column field="pengeluaran" header="PENGELUARAN" sortable class="col-amount">
                  <template #body="{ data }">
                    <div class="amount-container">
                      {{ formatCurrency(data.pengeluaran) }}
                    </div>
                  </template>
                </Column>

                <Column field="amount" header="REVENUE" sortable class="col-amount">
                  <template #body="{ data }">
                    <div class="amount-container">
                      <span
                        :class="['amount-container', data.amount >= 0 ? 'positive' : 'negative']"
                      >
                        {{ formatCurrency(data.amount) }}
                      </span>
                    </div>
                  </template>
                </Column>

                <Column field="profit" header="PROFIT" sortable class="col-amount">
                  <template #body="{ data }">
                    <div class="amount-container">
                      <span
                        :class="['amount-container', data.profit >= 0 ? 'positive' : 'negative']"
                      >
                        {{ formatCurrency(data.profit) }}
                      </span>
                    </div>
                  </template>
                </Column>

                <template #empty>
                  <div class="empty-state">
                    <div class="empty-icon">
                      <i class="pi pi-inbox"></i>
                    </div>
                    <h4 class="empty-title">Belum ada data transaksi</h4>
                    <p class="empty-description">
                      Pilih rentang tanggal dan klik tombol "Cari Data" untuk menampilkan transaksi
                    </p>
                    <Button
                      v-if="!dataFetched"
                      label="Mulai Pencarian"
                      icon="pi pi-search"
                      @click="fetchData"
                      :disabled="!isFormValid"
                      class="mt-3"
                    />
                  </div>
                </template>

                <template #footer>
                  <div class="datatable-footer">
                    <div class="footer-summary">
                      <div class="summary-row">
                        <div class="summary-item">
                          <span class="summary-label">Total Income : </span>
                          <span class="summary-value income">
                            <strong> {{ formatCurrency(totalIncome) }}</strong></span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel value="1">
            <div class="tab-content-placeholder" v-if="details_trans == 0">
              <div class="placeholder-icon">
                <i class="pi pi-users"></i>
              </div>
              <h3>Analisis Berdasarkan Driver</h3>
              <p>
                Fitur ini akan menampilkan analisis pendapatan berdasarkan performa masing-masing
                driver. Termasuk statistik seperti total revenue per driver, jumlah trip, dan rating
                performa.
              </p>
              <Button label="Segera Hadir" disabled />
            </div>
            <div v-else>
              <div class="table-container">
                <div class="table-header">
                  <div class="table-title">
                    <i class="pi pi-list"></i>
                    <span>Daftar Transaksi Penyewaan</span>
                  </div>
                  <div class="table-actions" v-if="fact.length > 0">
                    <Button
                      icon="pi pi-download"
                      label="Export"
                      severity="secondary"
                      size="small"
                      outlined
                    />
                  </div>
                </div>

                <DataTable
                  :value="details_trans"
                  :paginator="true"
                  :rows="10"
                  :rowsPerPageOptions="[5, 10, 20, 50]"
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                  stripedRows
                  responsiveLayout="scroll"
                  scrollable
                  scrollHeight="500px"
                >
                  <Column field="no_pol" header="NO POLISI" sortable class="col-license">
                    <template #body="{ data }">
                      <div class="license-plate">
                        <i class="pi pi-car text-primary"></i>
                        <span class="font-bold">{{ data.no_pol }}</span>
                      </div>
                    </template>
                  </Column>

                  <Column field="nama" header="CUSTOMER" sortable class="col-license">
                    <template #body="{ data }">
                      <div class="license-plate">
                        <span class="font-bold">{{ data.nama }}</span>
                      </div>
                    </template>
                  </Column>

                  <Column field="desc" header="DESKRIPSI" sortable class="col-license">
                    <template #body="{ data }">
                      <div class="license-plate">
                        <i class="pi pi-check text-primary"></i>
                        <span class="font-bold">{{ data.desc }}</span>
                      </div>
                    </template>
                  </Column>

                  <Column field="tanggal_start" header="DARI TGL" sortable class="col-license">
                    <template #body="{ data }">
                      <div class="license-plate">
                        <i class="pi pi-car text-primary"></i>
                        <span class="font-bold">{{ data.tanggal_start }}</span>
                      </div>
                    </template>
                  </Column>

                  <Column field="tanggal_end" header="SAMPAI TGL" sortable class="col-license">
                    <template #body="{ data }">
                      <div class="license-plate">
                        <i class="pi pi-car text-primary"></i>
                        <span class="font-bold">{{ data.tanggal_end }}</span>
                      </div>
                    </template>
                  </Column>

                  <Column field="durasi" header="DURASI" sortable class="col-duration">
                    <template #body="{ data }">
                      <div class="duration-info">
                        <span class="duration-value">{{ data.durasi }}</span>
                        <span class="duration-unit">{{ data.satuan }}</span>
                      </div>
                    </template>
                  </Column>

                  <Column field="driver" header="DRIVER" sortable class="col-duration">
                    <template #body="{ data }">
                      <div class="duration-info">
                        <span class="duration-value"
                          >{{ data.driver }} {{ formatCurrency(data.jasa_driver) }}</span
                        >
                      </div>
                    </template>
                  </Column>

                  <Column field="status" header="OKUPASI" sortable class="col-status">
                    <template #body="{ data }">
                      <Tag :value="data.okupasi + ' %'" class="status-tag" />
                    </template>
                  </Column>

                  <Column field="amount" header="REVENUE" sortable class="col-amount">
                    <template #body="{ data }">
                      <div class="amount-container">
                        <span :class="['amount-value', data.total >= 0 ? 'positive' : 'negative']">
                          {{ formatCurrency(data.total) }}
                        </span>
                      </div>
                    </template>
                  </Column>

                  <template #empty>
                    <div class="empty-state">
                      <div class="empty-icon">
                        <i class="pi pi-inbox"></i>
                      </div>
                      <h4 class="empty-title">Belum ada data transaksi</h4>
                      <p class="empty-description">
                        Pilih rentang tanggal dan klik tombol "Cari Data" untuk menampilkan
                        transaksi
                      </p>
                      <Button
                        v-if="!dataFetched"
                        label="Mulai Pencarian"
                        icon="pi pi-search"
                        @click="fetchData"
                        :disabled="!isFormValid"
                        class="mt-3"
                      />
                    </div>
                  </template>

                  <template #footer>
                    <div class="datatable-footer">
                      <div class="footer-summary">
                        <div class="summary-row">
                          <div class="summary-item">
                            <span class="summary-label">Total Income : </span>
                            <span class="summary-value income">
                              <strong> {{ formatCurrency(totalIncome) }}</strong></span
                            >
                          </div>
                          <div class="summary-item">
                            <span class="summary-label">Total Jasa Driver : </span>
                            <span class="summary-value income">
                              <strong> {{ formatCurrency(totaljasaDriver) }}</strong></span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </DataTable>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="2">
            <div class="tab-content-placeholder">
              <div class="placeholder-icon">
                <i class="pi pi-chart-bar"></i>
              </div>
              <h3>Analisis Lanjutan</h3>
              <p>
                Dapatkan insights mendalam dengan grafik tren revenue, perbandingan periode, dan
                prediksi pendapatan masa depan berdasarkan data historis.
              </p>
              <Button label="Segera Hadir" disabled />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import DatePicker from 'primevue/datepicker'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'

// Store and toast setup
const configStore = useConfigStore()
const toast = useToast()

// Reactive state
const loading = ref(false)
const dataFetched = ref(false)
const fact = ref([])
const details_trans = ref([])
const globalFilter = ref('')
const searchQuery = ref('')

const avgOkupasi = ref(0)
const total_trans = ref(0)

import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// Form parameters
const param = reactive({
  start: null,
  end: null,
  id_client: id_client.value,
  sortBy: 'case',
})

// Sort options for dropdown
const sortOptions = ref([
  { label: 'Berdasarkan Kasus', value: 'case' },
  { label: 'Berdasarkan Tanggal', value: 'date' },
  { label: 'Berdasarkan Jumlah', value: 'amount' },
  { label: 'Berdasarkan Status', value: 'status' },
])

// Computed properties
const isFormValid = computed(() => {
  return param.start && param.end && param.id_client > 0
})

const totalIncome = computed(() => {
  return fact.value.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0)
})

const totaljasaDriver = computed(() => {
  return details_trans.value
    .filter((item) => item.jasa_driver > 0)
    .reduce((sum, item) => sum + item.jasa_driver, 0)
})

// Toast notifications
const showSuccess = (message = 'Data berhasil dimuat') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'Terjadi kesalahan saat memuat data') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

// Data fetching function
const fetchData = async () => {
  if (!isFormValid.value) {
    showError('Mohon lengkapi semua field yang diperlukan')
    return
  }

  try {
    loading.value = true
    dataFetched.value = false

    const params = {
      start: formatDate(param.start),
      end: formatDate(param.end),
      id_client: param.id_client,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/report/penjualan_per_unit`, params)

    if (response.data && response.data.response) {
      total_trans.value = response.data.total_trans
      avgOkupasi.value = response.data.rata_rata_okp
      // Transform the data to match the expected structure
      fact.value = response.data.response.map((item) => ({
        no_pol: item.no_pol,
        durasi: item.durasi,
        desc: item.desc,
        satuan: item.satuan,
        okupasi: item.okupasi,
        amount: parseFloat(item.amount || item.total || 0),
        status: item.status || 'completed',
        pengeluaran: item.pengeluaran,
        profit: item.profit,
      }))

      detail_transaksi()
      showSuccess(`Berhasil memuat ${fact.value.length} data`)
    } else {
      fact.value = []
      showError('Format response tidak sesuai')
    }

    dataFetched.value = true
  } catch (error) {
    console.error('Error fetching data:', error)
    fact.value = []

    if (error.response) {
      showError(`Server error: ${error.response.status}`)
    } else if (error.request) {
      showError('Tidak dapat terhubung ke server')
    } else {
      showError('Terjadi kesalahan yang tidak diketahui')
    }
  } finally {
    loading.value = false
  }
}

const detail_transaksi = async () => {
  if (!isFormValid.value) {
    showError('Mohon lengkapi semua field yang diperlukan')
    return
  }

  try {
    loading.value = true
    dataFetched.value = false

    const params = {
      start: formatDate(param.start),
      end: formatDate(param.end),
      id_client: param.id_client,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/report/details_transaksi`, params)

    if (response.data.data && response.data.data.transactions) {
      // Transform the data to match the expected structure
      details_trans.value = response.data.data.transactions.map((item) => ({
        no_pol: item.no_pol,
        tanggal_start: item.tanggal_start,
        tanggal_end: item.tanggal_end,
        driver: item.driver,
        jasa_driver: parseFloat(item.jasa_driver || item.jasa_driver || 0),
        durasi: item.durasi,
        desc: item.desc,
        satuan: item.satuan,
        nama: item.nama,
        amount: parseFloat(item.amount || item.amount || 0),
        total: parseFloat(item.total || item.total || 0),
      }))

      showSuccess(`Berhasil memuat ${details_trans.value.length} data`)
    } else {
      details_trans.value = []
      showError('Format response tidak sesuai')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    details_trans.value = []

    if (error.response) {
      showError(`Server error: ${error.response.status}`)
    } else if (error.request) {
      showError('Tidak dapat terhubung ke server')
    } else {
      showError('Terjadi kesalahan yang tidak diketahui')
    }
  } finally {
    loading.value = false
  }
}

// Helper functions
const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const resetForm = () => {
  param.start = null
  param.end = null
  param.id_client = 1
  param.sortBy = 'case'
  fact.value = []
  dataFetched.value = false
  globalFilter.value = ''
  searchQuery.value = ''
}

// Lifecycle
onMounted(() => {
  // Auto-fetch can be enabled by uncommenting the line below
  // fetchData()
})
</script>

<style scoped>
/* Global Styles */
.content {
  margin: 0 auto;
  padding: 0.5rem;
  /* background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); */
  /* min-height: 100vh; */
}

.negative {
  color: #e74c3c; /* Merah */
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #272364 100%);
  border-radius: 5px;
  padding: 2.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  /* font-size: 2rem; */
}

.hero-title {
  /* font-size: 2.5rem; */
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
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 180px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: white;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.search-group {
  display: flex;
  align-items: end;
}

.search-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.search-button:hover:not(:disabled) {
  /* transform: translateY(-2px); */
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* Tabs Section */
.tabs-section {
  background: white;
  border-radius: 5px;
  overflow: hidden;
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); */
  border: 1px solid #e2e8f0;
}

.modern-tabs :deep(.p-tablist) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  font-weight: 500;
  border-radius: 3px;
  transition: all 0.3s ease;
}

/* Table Styles */
.table-container {
  padding: 0.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.modern-datatable {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.license-plate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.duration-info {
  display: flex;
  flex-direction: column;
}

.duration-value {
  font-weight: 600;
  color: #1e293b;
}

.duration-unit {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
}

.amount-container {
  text-align: right;
}

.amount-value {
  font-weight: 700;
  font-size: 1.1rem;
}

/* .amount-value.positive {
  color: #059669;
} */

.amount-value.negative {
  color: #dc2626;
}

.status-tag {
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

/* Table Footer */
.table-footer {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-top: 2px solid #e2e8f0;
  padding: 0;
}

.footer-content {
  padding: 2rem;
}

.total-summary {
  display: flex;
  justify-content: center;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.summary-card.income {
  border-left: 4px solid #10b981;
}

.summary-icon {
  background: #10b981;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.summary-label {
  font-size: 0.9rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.summary-amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10b981;
}

/* Tab Content Placeholder */
.tab-content-placeholder {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #cbd5e1;
}

.tab-content-placeholder h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.tab-content-placeholder p {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 2rem auto;
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

  .summary-card {
    flex-direction: column;
    text-align: center;
  }
}

/* PrimeVue Component Overrides */
:deep(.modern-select .p-select) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.footer-summary {
  display: flex;
  justify-content: center;
}

.summary-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 120px;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 23px;
  font-weight: 700;
  color: #374151;
}

.summary-value.income {
  color: #059669;
}

.summary-value.outcome {
  color: #dc2626;
}

.summary-value.positive {
  color: #059669;
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

:deep(.modern-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #1e293b;
  font-weight: 600;
  padding: 1rem;
}

:deep(.modern-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

:deep(.modern-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
  transform: translateY(-1px);
}

:deep(.modern-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  border: none;
}
</style>
