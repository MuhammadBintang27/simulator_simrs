<template>
  <div class="content">
    <!-- Back Navigation -->
    <div class="back-nav">
      <Button icon="pi pi-arrow-left" label="Kembali" text @click="$router.push('/penugasan-layanan')" />
    </div>

    <!-- Hero Section Component -->
    <HeroSection
      icon="pi pi-clipboard"
      title="Semua Laporan"
      description="Kelola semua laporan keluhan yang masuk. Review, tugaskan, dan pantau progress penanganan."
      :stats="heroStats"
      :loading="loadingStats"
    />

    <!-- Filter Section Component -->
    <FilterSection
      :filters="filters"
      @update:filters="filters = $event"
      :filtered-count="currentTabReports.length"
      :total-count="reports.length"
      :loading="loadingData"
      search-placeholder="Cari judul, pelapor, lokasi..."
      @refresh="loadData"
      @reset="resetFilters"
    >
      <template #actions>
        <Button
          label="Buat Laporan"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
          severity="success"
          size="small"
        />
        <Button
          label="Export Excel"
          icon="pi pi-file-excel"
          @click="exportToExcel"
          severity="info"
          size="small"
          outlined
        />
      </template>
    </FilterSection>

    <!-- Custom Tabs for Status Filter -->
    <div class="custom-tabs-wrapper">
      <div class="custom-tabs">
        <button 
          class="custom-tab" 
          :class="{ active: activeTab === 0 }"
          @click="activeTab = 0"
        >
          <i class="pi pi-list"></i>
          <span>Semua</span>
          <span class="tab-badge">{{ tabCounts.all }}</span>
        </button>
        <button 
          class="custom-tab" 
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
        >
          <i class="pi pi-clock"></i>
          <span>Belum Ditugaskan</span>
          <span class="tab-badge">{{ tabCounts.needsReview }}</span>
        </button>
        <button 
          class="custom-tab" 
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
        >
          <i class="pi pi-send"></i>
          <span>Sudah Ditugaskan</span>
          <span class="tab-badge">{{ tabCounts.assigned }}</span>
        </button>
        <button 
          class="custom-tab" 
          :class="{ active: activeTab === 3 }"
          @click="activeTab = 3"
        >
          <i class="pi pi-check-circle"></i>
          <span>Selesai</span>
          <span class="tab-badge">{{ tabCounts.completed }}</span>
        </button>
      </div>
    </div>

    <!-- Reports Grid -->
    <div class="reports-container">
      <loading_overlay :is-loading="loadingData" message="Memuat data laporan..." />
      
      <!-- Empty State - No Data -->
      <template v-if="currentTabReports.length === 0 && reports.length === 0">
        <Card class="empty-state-card">
          <template #content>
            <div class="empty-state">
              <i class="pi pi-inbox empty-icon"></i>
              <h4 class="empty-title">Belum Ada Laporan</h4>
              <p class="empty-text">Belum ada laporan yang masuk ke sistem.</p>
            </div>
          </template>
        </Card>
      </template>

      <!-- Empty State - No Results -->
      <template v-else-if="currentTabReports.length === 0">
        <Card class="empty-state-card">
          <template #content>
            <div class="empty-state">
              <i class="pi pi-search empty-icon"></i>
              <h4 class="empty-title">Tidak Ada Hasil</h4>
              <p class="empty-text">Tidak ada laporan yang sesuai dengan filter yang dipilih.</p>
              <Button
                label="Reset Filter"
                icon="pi pi-filter-slash"
                @click="resetFilters"
                outlined
              />
            </div>
          </template>
        </Card>
      </template>

      <!-- Report Table -->
      <template v-else>
        <ReportsDataTable
          :reports="currentTabReports"
          :show-reporter="true"
          :show-edit="false"
          :show-assign-to-dept="true"
          :show-assign-to-staff="false"
          :can-assign="canAssignReport"
          :enable-pagination="false"
          @view-detail="viewDetail"
          @assign-dept="openAssignDialog"
        />
        
        <!-- Pagination Controls -->
        <div class="pagination-wrapper" v-if="pagination && pagination.total > 0">
          <Paginator
            :rows="pageSize"
            :totalRecords="pagination.total"
            :first="(currentPage - 1) * pageSize"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            @page="onPageChange"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          />
          
          <div class="pagination-info">
            Halaman {{ currentPage }} dari {{ pagination.total_pages }} - 
            Menampilkan {{ ((currentPage - 1) * pageSize) + 1 }} 
            hingga {{ Math.min(currentPage * pageSize, pagination.total) }} 
            dari {{ pagination.total }} laporan
          </div>
        </div>
      </template>
    </div>

    <!-- Dialog Create -->
    <Dialog
      v-model:visible="showCreateDialog"
      header="Buat Laporan Baru"
      :modal="true"
      :closable="true"
      :style="{ width: '650px' }"
    >
      <FormLaporanComponent @submit="handleCreate" @cancel="showCreateDialog = false" />
    </Dialog>

    <!-- Dialog Assign to Department (Direktur/Wadir/Kabid) -->
    <Dialog
      v-model:visible="showAssignDialog"
      header="Tugaskan Laporan"
      :modal="true"
      :closable="true"
      :style="{ width: '600px' }"
    >
      <div class="assign-dialog">
        <!-- Report Info Section -->
        <div class="form-section">
          <h6 class="section-title">
            <i class="pi pi-file"></i>
            Informasi Laporan
          </h6>
          <div class="report-info">
            <div class="info-row">
              <label class="info-label">Judul Laporan:</label>
              <p class="info-value">{{ selectedReport?.problem_title }}</p>
            </div>
            <div class="info-row">
              <label class="info-label">Kategori:</label>
              <p class="info-value">
                <CategoryBadge :category="selectedReport?.problem_category" />
              </p>
            </div>
            <div class="info-row">
              <label class="info-label">Prioritas:</label>
              <p class="info-value">
                <PriorityBadge :priority="selectedReport?.priority" />
              </p>
            </div>
          </div>
        </div>

        <!-- Assignment Fields Section -->
        <div class="form-section">
          <h6 class="section-title">
            <i class="pi pi-send"></i>
            Detail Penugasan
          </h6>

          <!-- Department Selection -->
          <div class="form-field">
            <label class="field-label">
              Pilih Bidang <span class="required">*</span>
            </label>
            <Select
              v-model="selectedDepartment"
              :options="availableDepartments"
              optionLabel="name"
              optionValue="id"
              placeholder="Pilih bidang yang sesuai..."
              filter
              showClear
              class="modern-select"
            >
              <template #option="{ option }">
                <div class="department-option">
                  <i class="pi pi-building"></i>
                  <span>{{ option.name }}</span>
                </div>
              </template>
            </Select>
            <small class="field-hint">{{ isKabid ? 'Anda hanya dapat menugaskan ke bidang Anda sendiri' : 'Pilih bidang yang paling sesuai untuk menangani masalah ini' }}</small>
          </div>

          <!-- Priority Selection -->
          <div class="form-field">
            <label class="field-label">
              Prioritas Penanganan <span class="required">*</span>
            </label>
            <Select
              v-model="selectedPriority"
              :options="priorityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Tentukan prioritas penanganan..."
              class="modern-select"
            />
            <small class="field-hint">Prioritas yang Anda tentukan akan diterapkan pada laporan ini</small>
          </div>

          <!-- Assignment Notes -->
          <div class="form-field">
            <label class="field-label">Catatan untuk Bidang</label>
            <Textarea
              v-model="assignNotes"
              rows="4"
              placeholder="Tambahkan catatan atau instruksi khusus untuk bidang yang ditugaskan..."
              class="modern-textarea"
            />
            <small class="field-hint">Maksimal 500 karakter</small>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button 
            label="Batal" 
            @click="showAssignDialog = false" 
            severity="secondary"
            outlined
          />
          <Button
            label="Tugaskan"
            icon="pi pi-send"
            @click="handleAssignToDepartment"
            :loading="loading"
            severity="success"
          />
        </div>
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import { useAuthStore } from '@/stores/config'
import { useRole } from '@/composables/useRole'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'
import { storeToRefs } from 'pinia'
import * as XLSX from 'xlsx'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Badge from 'primevue/badge'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import Paginator from 'primevue/paginator'

import loading_overlay from '@/components/LoadingFormCompnent.vue'
import HeroSection from './components/HeroSection.vue'
import FilterSection from './components/FilterSection.vue'
import FormLaporanComponent from './components/FormLaporanComponent.vue'
import ReportsDataTable from './components/ReportsDataTable.vue'
import CategoryBadge from './components/CategoryBadge.vue'
import PriorityBadge from './components/PriorityBadge.vue'

const router = useRouter()
const store = usePenugasanLayananStore()
const authStore = useAuthStore()
const toast = useToast()

// Destructure untuk reactive access
const { reportsStats, pagination, reports } = storeToRefs(store)

// Role Management - DYNAMIC dari database, JANGAN HARDCODE!
const {
  currentJobCode,
  currentJobTitle,
  currentBidangName,
  currentBidangId,
  isDirektur,
  isWadir,
  isKabid,
  isStaff,
  canAssignToDepartment,
  canAssignToStaff,
  canUpdateProgress,
  canAssignReport,
  canAssignToBidang
} = useRole()

const loading = ref(false)
const loadingStats = ref(false)
const loadingData = ref(false)
const showCreateDialog = ref(false)
const showAssignDialog = ref(false)
const selectedReport = ref(null)
const selectedDepartment = ref(null)
const selectedPriority = ref(null)
const assignNotes = ref('')
const activeTab = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const departments = ref([])

const priorityOptions = ref([
  { label: 'Sangat Mendesak', value: 'urgent' },
  { label: 'Tinggi', value: 'high' },
  { label: 'Sedang', value: 'medium' },
  { label: 'Rendah', value: 'low' },
])

// Available Departments - filter untuk Kabid (hanya bidang sendiri)
const availableDepartments = computed(() => {
  if (isKabid.value && currentBidangId.value) {
    // Kabid hanya bisa lihat bidangnya sendiri
    return departments.value.filter(dept => dept.id === currentBidangId.value)
  }
  // Direktur dan Wadir bisa lihat semua bidang
  return departments.value
})

// Filters
const filters = ref({
  search: '',
  category: null,
  priority: null,
  status: null,
  dateRange: null
})

// Hero Stats dari API stats (tanpa pagination)
const heroStats = computed(() => [
  { label: 'Total Laporan', value: reportsStats.value.total_reports || 0 },
  { label: 'Hari Ini', value: reportsStats.value.tickets_today || 0 },
  { label: 'Minggu Ini', value: reportsStats.value.tickets_this_week || 0 },
  { label: 'Belum Review', value: reportsStats.value.tickets_unreviewed || 0 }
])

// Tab Counts dari stats API
const tabCounts = computed(() => {
  const statuses = reportsStats.value.statuses || []
  const getCount = (status) => {
    const found = statuses.find(s => s.status === status)
    return found ? Number(found.count) || 0 : 0
  }
  
  return {
    all: Number(reportsStats.value.total_reports) || 0,
    needsReview: getCount('submitted') + getCount('pending'),
    assigned: getCount('assigned_to_dept') + getCount('assigned_to_staff') + getCount('in_progress'),
    completed: getCount('completed')
  }
})

// Current Tab Reports - langsung dari API, tidak perlu filter client-side
const currentTabReports = computed(() => {
  return reports.value
})

// Watch filters dan trigger reload API
watch(() => filters.value, () => {
  currentPage.value = 1 // Reset ke halaman 1 saat filter berubah
  loadData()
}, { deep: true })

// Watch activeTab dan trigger reload dengan status filter
watch(activeTab, (newTab) => {
  currentPage.value = 1
  loadData()
})

const onPageChange = (event) => {
  // PrimeVue Paginator uses 0-based index, API uses 1-based
  currentPage.value = event.page + 1
  
  // Update page size if changed
  if (event.rows && event.rows !== pageSize.value) {
    pageSize.value = event.rows
  }
  
  loadData()
}

const loadData = async () => {
  // Build filter params untuk API
  const apiParams = {
    page: currentPage.value,
    limit: pageSize.value
  }
  
  // Add filter params
  if (filters.value.priority) {
    apiParams.priority = filters.value.priority
  }
  
  if (filters.value.category) {
    apiParams.problem_category = filters.value.category
  }
  
  if (filters.value.search) {
    apiParams.search = filters.value.search
  }
  
  if (filters.value.status) {
    apiParams.status = filters.value.status
  }
  
  // Convert date range to date_from and date_to
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    const [startDate, endDate] = filters.value.dateRange
    if (startDate) {
      apiParams.date_from = format(startDate, 'yyyy-MM-dd')
    }
    if (endDate) {
      apiParams.date_to = format(endDate, 'yyyy-MM-dd')
    }
  }
  
  // Add status dari activeTab hanya jika tidak ada status dari filter
  if (!apiParams.status) {
    if (activeTab.value === 1) {
      apiParams.status = 'submitted'
    } else if (activeTab.value === 2) {
      // Tab "Sudah Ditugaskan" - coba kirim sebagai comma-separated
      // Jika backend tidak support, akan perlu refactor
      apiParams.status = 'assigned_to_dept,assigned_to_staff,in_progress'
    } else if (activeTab.value === 3) {
      apiParams.status = 'completed'
    }
    // activeTab 0 = semua, tidak kirim filter status
  }
  
  // Parallel fetch dengan independent loading states
  // Stats loading (untuk header)
  loadingStats.value = true
  store.fetchReportsStats()
    .catch(error => {
      toast.add({
        severity: 'error',
        summary: 'Error Stats',
        detail: error.message || 'Gagal memuat statistik',
        life: 5000
      })
    })
    .finally(() => {
      loadingStats.value = false
    })
  
  // Data loading (untuk table) dengan filter
  loadingData.value = true
  store.fetchReports(apiParams)
    .catch(error => {
      toast.add({
        severity: 'error',
        summary: 'Error Data',
        detail: error.message || 'Gagal memuat data laporan',
        life: 5000
      })
    })
    .finally(() => {
      loadingData.value = false
    })
  
  // Departments loading (background, tidak blocking)
  store.fetchDepartments()
    .then(deps => {
      departments.value = deps || []
    })
    .catch(() => {
      // Silent fail untuk departments
    })
}

const resetFilters = () => {
  activeTab.value = 0
  currentPage.value = 1
  filters.value = {
    search: '',
    category: null,
    priority: null,
    status: null,
    dateRange: null
  }
}

const viewDetail = (report) => {
  router.push(`/penugasan-layanan/laporan/${report.report_id}`)
}

const openAssignDialog = (report) => {
  // Validasi: Hanya DIREKTUR, WADIR, atau KABID yang bisa assign
  if (!isDirektur.value && !isWadir.value && !isKabid.value) {
    toast.add({
      severity: 'error',
      summary: 'Akses Ditolak',
      detail: 'Hanya DIREKTUR, WADIR, atau KABID yang dapat menugaskan laporan',
      life: 4000
    })
    return
  }

  selectedReport.value = report
  selectedDepartment.value = null
  selectedPriority.value = null
  assignNotes.value = ''
  showAssignDialog.value = true
}

const handleAssignToDepartment = async () => {
  if (!selectedDepartment.value) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Pilih bidang terlebih dahulu',
      life: 3000
    })
    return
  }

  // Validasi: Cek apakah user bisa assign ke bidang yang dipilih
  if (!canAssignToBidang(selectedDepartment.value)) {
    toast.add({
      severity: 'error',
      summary: 'Akses Ditolak',
      detail: 'Kabid hanya bisa assign ke bidangnya sendiri',
      life: 4000
    })
    return
  }

  if (!selectedPriority.value) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Tentukan prioritas penanganan',
      life: 3000
    })
    return
  }

  try {
    const assignButton = event?.target?.closest('.dialog-footer')?.querySelector('.p-button-success')
    if (assignButton) {
      assignButton.disabled = true
      assignButton.classList.add('p-disabled')
    }
    
    await store.assignToDepartment(
      selectedReport.value.report_id,
      selectedDepartment.value,
      assignNotes.value,
      selectedPriority.value
    )
    
    showAssignDialog.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `Laporan ${selectedReport.value.report_no || '#' + selectedReport.value.report_id} berhasil ditugaskan ke bidang`,
      life: 3000
    })
    
    // Refresh data in background
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal menugaskan laporan',
      life: 5000
    })
  }
}

const handleCreate = async (data) => {
  const tempLoading = ref(true)
  try {
    
    console.log('📋 LAPORAN LIST VIEW - Received data:', data)
    console.log('📋 LAPORAN LIST VIEW - Data type:', data instanceof FormData ? 'FormData' : typeof data)
    
    // Handle both formats: FormData object or {formData, photos} object
    let formData, photos = []
    
    if (data instanceof FormData) {
      // New format: FormData object directly
      formData = data
      // Photos are already in FormData as 'photos[]'
    } else if (data && typeof data === 'object' && data.formData) {
      // Old format: {formData, photos} object
      formData = data.formData
      photos = data.photos || []
    } else {
      throw new Error('Invalid data format received')
    }
    
    // Step 1: Create report (photos are included in FormData)
    const newReport = await store.createReport(formData)
    const reportId = newReport?.report_id || newReport?.id

    console.log('📋 LAPORAN LIST VIEW - Created report:', newReport)
    console.log('📋 LAPORAN LIST VIEW - Report ID:', reportId)

    showCreateDialog.value = false
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Laporan berhasil dibuat',
      life: 3000
    })
    
    // Refresh data in background
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal membuat laporan',
      life: 5000
    })
  }
}

const exportToExcel = () => {
  try {
    const data = currentTabReports.value.map(report => ({
      'ID Laporan': report.report_id,
      'Nomor Laporan': report.report_no,
      'Tanggal': report.report_date,
      'Pelapor': report.reporter_name,
      'Judul': report.problem_title,
      'Kategori': report.problem_category,
      'Prioritas': report.priority,
      'Status': report.status,
      'Lokasi': report.location
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan')
    XLSX.writeFile(wb, `laporan_${new Date().getTime()}.xlsx`)

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil diexport ke Excel',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal export ke Excel',
      life: 5000
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.content {
  padding: 1.5rem;
}

/* Back Nav */
.back-nav {
  margin-bottom: 1.5rem;
}

.back-nav :deep(.p-button) {
  color: #4f8f7a !important;
  font-weight: 600;
}

.back-nav :deep(.p-button:hover) {
  background: rgba(79, 143, 122, 0.1) !important;
}

.reports-container {
  margin-top: 1.5rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Empty State */
.empty-state-card {
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.75rem;
}

.empty-text {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Custom Tabs */
.custom-tabs-wrapper {
  background: linear-gradient(135deg, #4f8f7a 0%, #3d7461 100%);
  padding: 0.75rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-tabs {
  display: flex;
  gap: 0.75rem;
}

.custom-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.custom-tab i {
  font-size: 0.95rem;
}

.custom-tab:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.custom-tab.active {
  background: white;
  color: #4f8f7a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.tab-badge {
  background: rgba(79, 143, 122, 0.2);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.custom-tab.active .tab-badge {
  background: #4f8f7a;
  color: white;
}

/* Tabs */
.tab-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

:deep(.p-tabview .p-tabview-nav) {
  background: #f8f9fa;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link) {
  border: none;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

:deep(.p-tabview .p-tabview-nav li .p-tabview-nav-link:hover) {
  background: rgba(79, 143, 122, 0.1);
}

:deep(.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background: white;
  border-bottom-color: #4f8f7a;
  color: #4f8f7a;
}

:deep(.p-tabview .p-tabview-panels) {
  padding: 0;
  background: transparent;
}

/* Assign Dialog */
.assign-dialog {
  padding: 0;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #4f8f7a;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 2px solid #4f8f7a;
  margin-top: 0;
}

.section-title i {
  font-size: 18px;
}

/* Form Field */
.form-field {
  margin-bottom: 20px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
}

/* Modern Select & Textarea */
.modern-select,
.modern-textarea {
  width: 100% !important;
  border: 2px solid #e9ecef !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  transition: all 0.3s ease !important;
}

.modern-select:hover,
.modern-textarea:hover {
  border-color: #4f8f7a !important;
}

.modern-select:focus,
.modern-textarea:focus,
.modern-select.p-focus,
.modern-textarea.p-focus {
  border-color: #4f8f7a !important;
  box-shadow: 0 0 0 3px rgba(79, 143, 122, 0.1) !important;
}

/* Field Hint */
.field-hint {
  display: block;
  margin-top: 6px;
  color: #6c757d;
  font-size: 12px;
}

/* Report Info */
.report-info {
  background: white;
  border: none;
  padding: 0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  min-width: 130px;
  flex-shrink: 0;
  text-transform: none;
  letter-spacing: normal;
  margin-bottom: 0;
  display: block;
}

.info-value {
  flex: 1;
  margin: 0;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
}

.department-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.department-option i {
  color: #4f8f7a;
  font-size: 16px;
}

/* Dialog Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.dialog-footer :deep(.p-button) {
  min-width: 120px;
}

/* Dialog Header Styling */
:deep(.p-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #4f8f7a 0%, #3f7663 100%);
  color: white;
  padding: 1.25rem 1.5rem;
  border-radius: 8px 8px 0 0;
}

:deep(.p-dialog .p-dialog-title) {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

:deep(.p-dialog .p-dialog-header-icons button) {
  color: white !important;
}

:deep(.p-dialog .p-dialog-header-icons button:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 1.5rem;
  background: white;
}

:deep(.p-divider) {
  margin: 1.5rem 0;
}

.report-summary strong {
  font-size: 1.125rem;
  color: #2c3e50;
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
  line-height: 1.4;
}

.field {
  margin-bottom: 1.25rem;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: block;
}

.required {
  color: #e74c3c;
}

.field-hint {
  display: block;
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.8125rem;
  font-style: italic;
}

.field :deep(.p-select),
.field :deep(.p-textarea) {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.field :deep(.p-select):hover,
.field :deep(.p-textarea):hover {
  border-color: #4f8f7a;
}

.field :deep(.p-select):focus,
.field :deep(.p-textarea):focus,
.field :deep(.p-select.p-focus),
.field :deep(.p-textarea.p-focus) {
  border-color: #4f8f7a;
  box-shadow: 0 0 0 3px rgba(79, 143, 122, 0.1);
}

.department-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.department-option i {
  color: #4f8f7a;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }

  .reports-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .pagination-wrapper {
    padding: 0.75rem;
  }
  
  :deep(.p-paginator) {
    flex-wrap: wrap;
  }
  
  .pagination-info {
    font-size: 0.8rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .reports-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .reports-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Pagination Styling */
.pagination-wrapper {
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pagination-info {
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

:deep(.p-paginator) {
  padding: 0.75rem;
  border: none;
  background: transparent;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

:deep(.p-paginator .p-paginator-pages) {
  display: flex;
  gap: 0.25rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  color: #495057;
  margin: 0 0.125rem;
  transition: all 0.2s ease;
  font-weight: 500;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background: #4f8f7a;
  border-color: #4f8f7a;
  color: white;
  box-shadow: 0 2px 4px rgba(79, 143, 122, 0.3);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #212529;
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  color: #495057;
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-first:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-prev:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-next:not(.p-disabled):hover),
:deep(.p-paginator .p-paginator-last:not(.p-disabled):hover) {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #212529;
}

:deep(.p-paginator .p-dropdown) {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  height: 2.5rem;
}
</style>
