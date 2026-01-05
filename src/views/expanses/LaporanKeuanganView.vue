<template>
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Laporan Pengeluaran Tahun 2025</h1>
          <p class="hero-description">
            Untuk biaya pengeluaran, baik yang berkaitan dengan kendaraan maupun non-kendaraan.
            Deskripsi ini bisa digunakan dalam laporan keuangan, aplikasi manajemen rental mobil,
            atau dokumentasi internal
          </p>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(totalExpenses) }}</div>
          <div class="stat-label">Total Beban Operasional</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(TotalPendapatan) }}</div>
          <div class="stat-label">Total Pendapatan</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(TotalPendapatan - totalExpenses) }}</div>
          <div class="stat-label">Laba Bersih</div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
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
            Pilih Tahun
          </label>
          <DatePicker
            v-model="tahunSelected"
            dateFormat="yy"
            placeholder="Pilih tahun"
            showIcon
            :manualInput="false"
            @date-select="onYearChange"
          />
        </div>

        <div class="filter-group">
          <Button
            icon="pi pi-refresh"
            label="Refresh"
            @click="refreshData"
            :loading="loading"
            class="round-button"
            size="small"
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
            Beban Operasional
          </Tab>
          <Tab value="1" class="tab-item">
            <i class="pi pi-users"></i>
            Pendapatan
          </Tab>
          <Tab value="2" class="tab-item">
            <i class="pi pi-chart-bar"></i>
            Analisis Lanjutan
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="0">
            <!-- Data Table Section -->
            <div style="display: flex; justify-content: space-between; align-items: center">
              <h6 class="section-title">Detail Pengeluaran per Akun</h6>
              <Button
                label=""
                icon="pi pi-download"
                style="background-color: green"
                class="round-button2"
                @click="exportToExcel"
                size="small"
              />
            </div>

            <div class="filter-group" style="margin: 5px">
              <label class="filter-label">
                <i class="pi pi-search"></i>
                Pencarian
              </label>
              <InputText v-model="searchTerm" type="text" placeholder="Cari akun..." />
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <span>Memuat data...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
              <div class="error-icon">⚠️</div>
              <span>{{ error }}</span>
              <button @click="retryLoad" class="retry-button">Coba Lagi</button>
            </div>

            <!-- Data Table -->
            <div v-else-if="filteredExpenses.length > 0">
              <DataTable
                :value="filteredExpenses"
                :scrollable="true"
                scrollHeight="700px"
                :resizableColumns="true"
                tableStyle="min-width: 1200px"
                stripedRows
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              >
                <Column field="akun" header="Akun" :sortable="true" style="min-width: 250px" frozen>
                  <template #body="{ data }">
                    <div class="account-cell">
                      <span class="account-name">{{ data.akun }}</span>
                    </div>
                  </template>
                  <template #footer>
                    <div class="summary-cell">
                      <strong>Total ({{ filteredExpenses.length }} akun)</strong>
                    </div>
                  </template>
                </Column>

                <!-- Monthly Columns -->
                <Column
                  v-for="month in months"
                  :key="month.key"
                  :field="`biaya.${month.key}`"
                  :header="month.label"
                  :sortable="true"
                  style="min-width: 120px"
                >
                  <template #body="{ data }">
                    <span
                      :class="['currency-cell', { 'zero-value': getCost(data, month.key) === 0 }]"
                    >
                      {{ formatCurrency(getCost(data, month.key)) }}
                      <div
                        class="percentage-cell percentage-change"
                        :class="{
                          positive: getPercentageChange(data, month.key) > 0,
                          negative: getPercentageChange(data, month.key) < 0,
                          neutral: getPercentageChange(data, month.key) === 0,
                        }"
                      >
                        {{ formatPercentage(getPercentageChange(data, month.key)) }}
                      </div>
                    </span>
                  </template>
                  <template #footer>
                    <div class="summary-cell">
                      <strong class="summary-total">{{
                        formatCurrency(getMonthlyTotal(month.key))
                      }}</strong>
                    </div>
                  </template>
                </Column>

                <Column
                  field="total_biaya_tahun"
                  header="Total Tahunan"
                  :sortable="true"
                  style="min-width: 150px"
                >
                  <template #body="{ data }">
                    <span class="total-cell">
                      {{ formatCurrency(data.total_biaya_tahun || 0) }}
                    </span>
                  </template>
                  <template #footer>
                    <div class="summary-cell">
                      <strong class="summary-grand-total">{{
                        formatCurrency(totalExpenses)
                      }}</strong>
                      <div class="summary-accounts">Grand Total</div>
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>Tidak ada data yang ditemukan</h3>
              <p>Coba ubah filter atau kriteria pencarian Anda.</p>
            </div>
          </TabPanel>

          <TabPanel value="1">
            <h6 class="section-title">Detail Pendapatan</h6>

            <div class="filter-group" style="margin: 5px">
              <label class="filter-label">
                <i class="pi pi-search"></i>
                Pencarian Global
              </label>
              <InputText v-model="searchTermRevenue" type="text" placeholder="Cari akun..." />
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <span>Memuat data...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
              <div class="error-icon">⚠️</div>
              <span>{{ error }}</span>
              <button @click="retryLoad" class="retry-button">Coba Lagi</button>
            </div>

            <!-- Data Table -->
            <div v-else-if="filteredPendapatan.length > 0">
              <DataTable
                :value="filteredPendapatan"
                :scrollable="true"
                scrollHeight="700px"
                :resizableColumns="true"
                tableStyle="min-width: 1200px"
                stripedRows
                :paginator="true"
                :rows="10"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              >
                <Column
                  field="kategori"
                  header="Kategori"
                  :sortable="true"
                  style="min-width: 250px"
                  frozen
                >
                  <template #body="{ data }">
                    <div class="account-cell">
                      <span class="account-name">{{ data.kategori }}</span>
                    </div>
                  </template>
                  <template #footer>
                    <div class="summary-cell">
                      <strong>Total ({{ filteredPendapatan.length }} akun)</strong>
                    </div>
                  </template>
                </Column>

                <!-- Monthly Columns -->
                <Column
                  v-for="month in months"
                  :key="month.key"
                  :field="`monthly_data.${month.key}`"
                  :header="month.label"
                  :sortable="true"
                  style="min-width: 120px"
                >
                  <template #body="{ data }">
                    <span
                      :class="[
                        'currency-cell',
                        { 'zero-value': getCostPendapatan(data, month.key) === 0 },
                      ]"
                    >
                      {{ formatCurrency(getCostPendapatan(data, month.key)) }}
                      <div
                        class="percentage-cell percentage-change"
                        :class="{
                          positive: getPercentageChangePendapatan(data, month.key) > 0,
                          negative: getPercentageChangePendapatan(data, month.key) < 0,
                          neutral: getPercentageChangePendapatan(data, month.key) === 0,
                        }"
                      >
                        {{ formatPercentage(getPercentageChangePendapatan(data, month.key)) }}
                      </div>
                    </span>
                  </template>
                  <template #footer>
                    <div class="summary-cell">
                      <strong class="summary-total">{{
                        formatCurrency(getMonthlyTotalPendapatan(month.key))
                      }}</strong>
                    </div>
                  </template>
                </Column>

                <Column
                  field="total_biaya_tahun"
                  header="Total Tahunan"
                  :sortable="true"
                  style="min-width: 150px"
                >
                  <template #body="{ data }">
                    <span class="total-cell">
                      {{ formatCurrency(data.yearly_total || 0) }}
                    </span>
                  </template>
                  <template #footer>
                    <div class="summary-cell">
                      <strong class="summary-grand-total">{{
                        formatCurrency(totalRevenue)
                      }}</strong>
                      <div class="summary-accounts">Grand Total</div>
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>Tidak ada data yang ditemukan</h3>
              <p>Coba ubah filter atau kriteria pencarian Anda.</p>
            </div>
          </TabPanel>

          <TabPanel value="2">
            <h6 class="section-title">Analisis Lanjutan</h6>
            <div class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>Fitur Analisis Lanjutan</h3>
              <p>Fitur ini akan segera tersedia.</p>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'

import * as XLSX from 'xlsx' //npm install xlsx

import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

// Store initialization
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const confirm = useConfirm()
const toast = useToast()

// Reactive data
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const searchTermRevenue = ref('')
const showZeroExpenses = ref(true)
const expenses = ref([])
const pendapatan = ref([])

// Initialize with current year as a Date object
const tahunSelected = ref(new Date())

// Month configuration
const months = [
  { key: 'jan', label: 'Jan' },
  { key: 'feb', label: 'Feb' },
  { key: 'mar', label: 'Mar' },
  { key: 'apr', label: 'Apr' },
  { key: 'may', label: 'Mei' },
  { key: 'jun', label: 'Jun' },
  { key: 'jul', label: 'Jul' },
  { key: 'aug', label: 'Agu' },
  { key: 'sep', label: 'Sep' },
  { key: 'oct', label: 'Okt' },
  { key: 'nov', label: 'Nov' },
  { key: 'dec', label: 'Des' },
]

// Computed properties for expenses
const totalExpenses = computed(() => {
  return filteredExpenses.value.reduce((sum, item) => sum + (item.total_biaya_tahun || 0), 0)
})

const TotalPendapatan = computed(() => {
  return pendapatan.value.reduce((sum, item) => sum + (item.yearly_total || 0), 0)
})

const activeAccounts = computed(() => {
  return filteredExpenses.value.filter((item) => (item.total_biaya_tahun || 0) > 0).length
})

const averagePerAccount = computed(() => {
  return activeAccounts.value > 0 ? totalExpenses.value / activeAccounts.value : 0
})

const filteredExpenses = computed(() => {
  let filtered = expenses.value

  // Filter by search term
  if (searchTerm.value) {
    filtered = filtered.filter(
      (item) => item.akun && item.akun.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  // Filter by zero expenses
  if (!showZeroExpenses.value) {
    filtered = filtered.filter((item) => (item.total_biaya_tahun || 0) > 0)
  }

  return filtered
})

// Computed properties for revenue
const totalRevenue = computed(() => {
  return filteredPendapatan.value.reduce((sum, item) => sum + (item.yearly_total || 0), 0)
})

const filteredPendapatan = computed(() => {
  let filtered = pendapatan.value

  // Filter by search term
  if (searchTermRevenue.value) {
    filtered = filtered.filter(
      (item) =>
        item.kategori &&
        item.kategori.toLowerCase().includes(searchTermRevenue.value.toLowerCase()),
    )
  }

  return filtered
})

// Summary computation functions
const getMonthlyTotal = (monthKey) => {
  return filteredExpenses.value.reduce((sum, item) => {
    const cost = getCost(item, monthKey)
    return sum + cost
  }, 0)
}

const getMonthlyTotalPendapatan = (monthKey) => {
  return filteredPendapatan.value.reduce((sum, item) => {
    const cost = getCostPendapatan(item, monthKey)
    return sum + cost
  }, 0)
}

const getActiveAccountsForMonth = (monthKey) => {
  return filteredExpenses.value.filter((item) => getCost(item, monthKey) > 0).length
}

// Helper functions to safely access nested properties
const getCost = (data, monthKey) => {
  return data.biaya && data.biaya[monthKey] ? data.biaya[monthKey] : 0
}

const getCostPendapatan = (data, monthKey) => {
  return data.monthly_data && data.monthly_data[monthKey] ? data.monthly_data[monthKey] : 0
}

const getPercentageChange = (data, monthKey) => {
  return data.persentase_perubahan && data.persentase_perubahan[monthKey]
    ? data.persentase_perubahan[monthKey]
    : 0
}

const getPercentageChangePendapatan = (data, monthKey) => {
  return data.percentage_difference && data.percentage_difference[monthKey]
    ? data.percentage_difference[monthKey]
    : 0
}

// Utility functions
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Rp 0'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  const formatted = Math.abs(value) === 100 && value < 0 ? '-100' : value.toFixed(2)
  return `${formatted}%`
}

const formatDate = (date) => {
  if (!date) return new Date().getFullYear()

  // Handle both Date objects and year numbers
  if (date instanceof Date) {
    return date.getFullYear()
  }

  if (typeof date === 'number' && date > 1900 && date < 3000) {
    return date
  }

  // Try to parse as date string
  const parsed = new Date(date)
  if (!isNaN(parsed.getTime())) {
    return parsed.getFullYear()
  }

  // Fallback to current year
  return new Date().getFullYear()
}

// Event handlers
const onYearChange = (date) => {
  if (date) {
    tahunSelected.value = date
    refreshData()
  }
}

const loadPendapatan = async () => {
  try {
    // Ensure we have required values
    if (!id_client.value) {
      throw new Error('Client ID tidak tersedia')
    }

    const tahun = formatDate(tahunSelected.value)
    const url = configStore.apiBaseUrl

    if (!url) {
      throw new Error('API Base URL tidak dikonfigurasi')
    }

    const response = await axios.get(`${url}/v1/getRevenueReport/${id_client.value}/${tahun}`)

    if (response.data && response.data.response) {
      pendapatan.value = [...response.data.response]
    } else {
      pendapatan.value = []
    }
  } catch (err) {
    console.error('Error fetching revenue:', err)
    pendapatan.value = []
    throw err // Re-throw to handle in main error handler
  }
}

const exportToExcel = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Convert JSON to worksheet
  const ws = XLSX.utils.json_to_sheet(expenses.value)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'revenue.xlsx')
}

const loadExpenses = async () => {
  try {
    // Ensure we have required values
    if (!id_client.value) {
      throw new Error('Client ID tidak tersedia')
    }

    const tahun = formatDate(tahunSelected.value)
    const url = configStore.apiBaseUrl

    if (!url) {
      throw new Error('API Base URL tidak dikonfigurasi')
    }

    const response = await axios.get(`${url}/v1/pengeluaran/${id_client.value}/${tahun}`)

    if (response.data && response.data.response) {
      expenses.value = [...response.data.response]
    } else {
      expenses.value = []
    }
  } catch (err) {
    console.error('Error fetching expenses:', err)
    expenses.value = []
    throw err // Re-throw to handle in main error handler
  }
}

const refreshData = async () => {
  try {
    loading.value = true
    error.value = null

    // Load both expenses and revenue concurrently
    await Promise.all([loadExpenses(), loadPendapatan()])

    showToast('success', 'Berhasil', 'Data berhasil dimuat')
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = err.message || 'Terjadi kesalahan saat memuat data'
    showToast('error', 'Error', error.value)
  } finally {
    loading.value = false
  }
}

const showToast = (type = 'success', summary = 'Success', detail = 'Data berhasil dimuat') => {
  toast.add({
    severity: type,
    summary,
    detail,
    life: 3000,
  })
}

const retryLoad = () => {
  refreshData()
}

// Watch for year changes
watch(
  tahunSelected,
  (newValue) => {
    if (newValue) {
      refreshData()
    }
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  // Ensure we have a valid date
  if (!tahunSelected.value || isNaN(tahunSelected.value.getTime())) {
    tahunSelected.value = new Date()
  }

  refreshData()
})
</script>

<style scoped>
/* Hero Section - Compact Version */
.hero-section {
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
  border-radius: 5px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(6, 182, 212, 0.3);
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
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1rem;
  min-width: 160px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #f8fafc;
}

.filter-section {
  background: white;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1rem;
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
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Loading spinner */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin: 2rem;
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-state h3 {
  color: #475569;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

/* Table styling */
.table-container {
  background: white;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #1e293b;
  margin: 0 0 1rem 0;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
}

/* Table Cell Styles */
.account-cell {
  font-weight: 600;
  color: #1f2937;
}

.currency-cell {
  font-weight: 500;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.currency-cell.zero-value {
  color: #9ca3af;
}

.total-cell {
  font-weight: 600;
  color: #059669;
  text-align: right;
}

.percentage-cell {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.percentage-change.positive {
  background: #dcfce7;
  color: #166534;
}

.percentage-change.negative {
  background: #fee2e2;
  color: #991b1b;
}

.percentage-change.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

/* Summary Cell Styles */
.summary-cell {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 2px solid #e2e8f0;
}

.summary-total {
  color: #1e40af;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.25rem;
}

.summary-grand-total {
  color: #059669;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.25rem;
}

.summary-accounts {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 1.5rem;
  }
}

/* Deep styling for PrimeVue components */
:deep(.p-datatable) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc !important;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.p-datatable-tfoot > tr > td) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 2px solid #e2e8f0;
  font-weight: 600;
  padding: 1rem 0.75rem;
}

:deep(.p-panel .p-panel-content) {
  padding: 0;
}
</style>
