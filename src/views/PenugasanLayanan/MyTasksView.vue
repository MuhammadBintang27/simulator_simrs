<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Back Navigation -->
    <div class="back-nav">
      <Button icon="pi pi-arrow-left" label="Kembali" text @click="$router.push('/penugasan-layanan')" />
    </div>

    <!-- Hero Section -->
    <HeroSection
      icon="pi pi-briefcase"
      :title="isKabid ? 'Laporan Bidang Saya' : 'Tugas Saya'"
      :description="isKabid ? `Laporan yang ditugaskan ke ${currentBidangName}. Tugaskan ke staff untuk penanganan.` : 'Daftar tugas yang ditugaskan kepada Anda. Kelola dan selesaikan tugas Anda dengan efisien.'"
      :stats="heroStats"
    />

    <!-- Filter Section -->
    <FilterSection
      :filters="filters"
      @update:filters="filters = $event"
      :filtered-count="filteredTasks.length"
      :total-count="myTasks.length"
      :loading="loading"
      search-placeholder="Cari judul, lokasi..."
      @refresh="loadData"
      @reset="resetFilters"
    >
  
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
          v-if="isKabid"
          class="custom-tab" 
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
        >
          <i class="pi pi-clock"></i>
          <span>Perlu Ditugaskan</span>
          <span class="tab-badge">{{ tabCounts.needsAssign }}</span>
        </button>
        <button 
          v-if="!isKabid"
          class="custom-tab" 
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
        >
          <i class="pi pi-sync"></i>
          <span>Sedang Dikerjakan</span>
          <span class="tab-badge">{{ tabCounts.inProgress }}</span>
        </button>
        <button 
          v-if="!isKabid"
          class="custom-tab" 
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
        >
          <i class="pi pi-pause-circle"></i>
          <span>Ditunda</span>
          <span class="tab-badge">{{ tabCounts.suspended }}</span>
        </button>
        <button 
          v-if="isKabid"
          class="custom-tab" 
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
        >
          <i class="pi pi-sync"></i>
          <span>Sedang Dikerjakan</span>
          <span class="tab-badge">{{ tabCounts.inProgress }}</span>
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

    <!-- Tasks Grid -->
    <div class="tasks-container">
      <!-- Empty State - No Data -->
      <template v-if="filteredTasks.length === 0 && myTasks.length === 0">
        <Card class="empty-state-card">
          <template #content>
            <div class="empty-state">
              <i class="pi pi-inbox empty-icon"></i>
              <h4 class="empty-title">Belum Ada Tugas</h4>
              <p class="empty-text">Anda belum memiliki tugas yang ditugaskan.</p>
            </div>
          </template>
        </Card>
      </template>

      <!-- Empty State - No Results -->
      <template v-else-if="filteredTasks.length === 0">
        <Card class="empty-state-card">
          <template #content>
            <div class="empty-state">
              <i class="pi pi-search empty-icon"></i>
              <h4 class="empty-title">Tidak Ada Hasil</h4>
              <p class="empty-text">Tidak ada tugas yang sesuai dengan filter yang dipilih.</p>
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

      <!-- Task Table -->
      <template v-else>
        <ReportsDataTable
          :reports="filteredTasks"
          :show-reporter="true"
          :show-edit="false"
          :show-assign-to-dept="false"
          :show-assign-to-staff="isKabid"
          :enable-pagination="false"
          :can-assign-staff="(task) => ['assigned_to_dept', 'assigned_to_department'].includes(task.status)"
          @view-detail="viewDetail"
          @assign-staff="openAssignStaffDialog"
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
            Menampilkan {{ myTasks.length }} tugas dari {{ pagination.total }} total
            (Halaman {{ pagination.page }} dari {{ pagination.total_pages }})
          </div>
        </div>
      </template>
    </div>

    <!-- Dialog Assign to Staff (Kabid) -->
    <Dialog
      v-model:visible="showAssignStaffDialog"
      header="Tugaskan ke Staff"
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
            <i class="pi pi-users"></i>
            Detail Penugasan
          </h6>

          <!-- Staff Selection -->
          <div class="form-field">
            <label class="field-label">
              Pilih Staff <span class="required">*</span>
            </label>
            <Select
              v-model="selectedStaff"
              :options="staffList"
              optionLabel="user_name"
              optionValue="user_id"
              placeholder="Pilih staff..."
              filter
              showClear
              class="modern-select"
            >
              <template #option="{ option }">
                <div class="staff-option">
                  <i class="pi pi-user"></i>
                  <span>{{ option.user_name }}</span>
                  <small class="text-muted">({{ option.job_title }})</small>
                </div>
              </template>
            </Select>
            <small class="field-hint">
              Pilih satu staff untuk menangani laporan ini
            </small>
          </div>

          <!-- Assignment Notes -->
          <div class="form-field">
            <label class="field-label">Catatan untuk Staff</label>
            <Textarea
              v-model="assignStaffNotes"
              rows="4"
              placeholder="Tambahkan instruksi atau catatan khusus untuk staff..."
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
            @click="showAssignStaffDialog = false"
            severity="secondary"
            outlined
          />
          <Button
            label="Tugaskan"
            icon="pi pi-check"
            @click="handleAssignToStaff"
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
import Card from 'primevue/card'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import Paginator from 'primevue/paginator'

import loading_overlay from '@/components/LoadingFormCompnent.vue'
import HeroSection from './components/HeroSection.vue'
import FilterSection from './components/FilterSection.vue'
import ReportsDataTable from './components/ReportsDataTable.vue'
import CategoryBadge from './components/CategoryBadge.vue'
import PriorityBadge from './components/PriorityBadge.vue'

const router = useRouter()
const store = usePenugasanLayananStore()
const authStore = useAuthStore()
const toast = useToast()

// Destructure untuk reactive access
const { reportsStats, pagination, myTasks } = storeToRefs(store)

// Role Management - DYNAMIC dari database
const {
  currentJobCode,
  currentJobTitle,
  currentBidangId,
  currentBidangName,
  isKabid,
  isStaff,
  canAssignToStaff,
  canUpdateProgress
} = useRole()

const loading = ref(false)
const staffList = ref([])
const activeTab = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// Assign to Staff Dialog (Kabid)
const showAssignStaffDialog = ref(false)
const selectedReport = ref(null)
const selectedStaff = ref(null)
const assignStaffNotes = ref('')

// Filters
const filters = ref({
  search: '',
  category: null,
  priority: null,
  status: null,
  dateRange: null
})

// Hero Stats dari API stats (tanpa pagination) - Dynamic per role
const heroStats = computed(() => {
  const stats = reportsStats.value
  const statuses = stats.statuses || []
  
  // Helper function to get count by status
  const getCount = (status) => {
    const found = statuses.find(s => s.status === status)
    return found ? Number(found.count) || 0 : 0
  }
  
  // Helper to get combined count
  const getCombinedCount = (...statusList) => {
    return statusList.reduce((total, status) => total + getCount(status), 0)
  }
  
  if (isKabid.value) {
    // Hero Stats untuk KABID
    return [
      { label: 'Total Tugas', value: Number(stats.total_reports) || 0 },
      { label: 'Belum Ditugaskan', value: getCount('assigned_to_dept') },
      { label: 'Sedang Dikerjakan', value: getCombinedCount('assigned_to_staff', 'in_progress') },
      { label: 'Ditunda', value: getCount('deferred') },
      { label: 'Selesai', value: getCount('completed') }
    ]
  } else {
    // Hero Stats untuk STAFF
    return [
      { label: 'Total Tugas', value: Number(stats.total_reports) || 0 },
      { label: 'Sedang Dikerjakan', value: getCombinedCount('assigned_to_staff', 'in_progress') },
      { label: 'Ditunda', value: getCount('deferred') },
      { label: 'Selesai', value: getCount('completed') }
    ]
  }
})

// Tab Counts dari stats API
const tabCounts = computed(() => {
  const statuses = reportsStats.value.statuses || []
  const getCount = (status) => {
    const found = statuses.find(s => s.status === status)
    return found ? Number(found.count) || 0 : 0
  }
  
  return {
    all: Number(reportsStats.value.total_reports) || 0,
    needsAssign: getCount('assigned_to_dept'),
    inProgress: getCount('assigned_to_staff') + getCount('in_progress'),
    suspended: getCount('deferred'),
    completed: getCount('completed')
  }
})

// Current Tab Tasks - langsung dari API, tidak perlu filter client-side
const filteredTasks = computed(() => {
  console.log('🎯 [filteredTasks] Computing filtered tasks...')
  console.log('📝 myTasks.value:', myTasks.value)
  console.log('🔢 myTasks.value.length:', myTasks.value.length)
  return myTasks.value
})

// Watch filters dan trigger reload API
watch(() => filters.value, () => {
  console.log('🔍 [MyTasksView] Filters changed:', filters.value)
  currentPage.value = 1
  loadData()
}, { deep: true })

// Watch activeTab dan trigger reload dengan status filter
watch(activeTab, () => {
  console.log('📑 [MyTasksView] Active tab changed:', activeTab.value)
  currentPage.value = 1
  loadData()
})

const onPageChange = (event) => {
  currentPage.value = event.page + 1
  
  if (event.rows && event.rows !== pageSize.value) {
    pageSize.value = event.rows
  }
  
  loadData()
}

const loadData = async () => {
  try {
    loading.value = true
    
    const userId = authStore.user_id
    const clientId = authStore.id_client
    
    console.log('🔄 [MyTasksView] Loading data...')
    console.log('👤 User ID:', userId)
    console.log('🏢 Client ID:', clientId)
    console.log('👔 Is Kabid:', isKabid.value)
    console.log('📄 Current Page:', currentPage.value)
    console.log('📊 Page Size:', pageSize.value)
    console.log('🎯 Active Tab:', activeTab.value)
    
    // Build stats params berdasarkan role
    const statsParams = {
      id_client: clientId
    }
    if (isKabid.value) {
      statsParams.bidang_id = currentBidangId.value
    } else if (isStaff.value) {
      statsParams.assigned_staff_id = userId
    }
    
    console.log('📋 Stats Params:', statsParams)
    
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
        if (isKabid.value) {
          apiParams.status = 'assigned_to_dept'
        } else {
          apiParams.status = 'assigned_to_staff'
        }
      } else if (activeTab.value === 2) {
        if (isKabid.value) {
          apiParams.status = 'assigned_to_staff'
        } else {
          apiParams.status = 'deferred'
        }
      } else if (activeTab.value === 3) {
        apiParams.status = 'completed'
      }
      // activeTab 0 = semua, tidak kirim filter status
    }
    
    console.log('🚀 API Params:', apiParams)
    
    // Parallel fetch: stats + tasks paginated dengan filter
    const promises = [
      store.fetchReportsStats(statsParams),
      store.fetchMyTasks(apiParams)
    ]
    
    // Fetch staff list untuk Kabid
    if (isKabid.value && currentBidangId.value) {
      promises.push(
        store.fetchStaffByDepartment(currentBidangId.value).then(staff => {
          staffList.value = staff || []
        })
      )
    }
    
    await Promise.all(promises)
    
    console.log('✅ [MyTasksView] Data loaded successfully')
    console.log('📊 Reports Stats FULL:', JSON.stringify(reportsStats.value, null, 2))
    console.log('📊 Reports Stats - Total Reports:', reportsStats.value.total_reports)
    console.log('📊 Reports Stats - Statuses:', reportsStats.value.statuses)
    console.log('📊 Reports Stats - Categories:', reportsStats.value.categories)
    console.log('📝 My Tasks:', myTasks.value)
    console.log('📄 Pagination:', pagination.value)
    console.log('🔢 Total Tasks:', myTasks.value.length)
  } catch (error) {
    console.error('❌ [MyTasksView] Error loading data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal memuat data',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}


const resetFilters = () => {
  currentPage.value = 1
  activeTab.value = 0
  filters.value = {
    search: '',
    category: null,
    priority: null,
    status: null,
    dateRange: null
  }
}

const viewDetail = (task) => {
  router.push(`/penugasan-layanan/tugas-saya/${task.report_id}/${task.staff_assignment_id}`)
}

// Kabid: Open Assign to Staff Dialog
const openAssignStaffDialog = (report) => {
  // Validasi: Hanya KABID yang bisa assign ke staff
  if (!isKabid.value) {
    toast.add({
      severity: 'error',
      summary: 'Akses Ditolak',
      detail: 'Hanya KEPALA BIDANG yang dapat menugaskan ke staff',
      life: 4000
    })
    return
  }


  selectedReport.value = report
  selectedStaff.value = null
  assignStaffNotes.value = ''
  showAssignStaffDialog.value = true
}

// Kabid: Handle Assign to Staff
const handleAssignToStaff = async () => {
  if (!selectedStaff.value) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Pilih staff terlebih dahulu',
      life: 3000
    })
    return
  }

  try {
    loading.value = true
    
    // Build staff assignment dengan format yang diminta API
    const staffAssignments = [{
      staff_user_id: selectedStaff.value,
      is_primary: 1,
      assignment_notes: assignStaffNotes.value || ''
    }]
    
    const response = await store.assignToStaff(
      selectedReport.value.report_id,
      staffAssignments
    )
    
    showAssignStaffDialog.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Laporan berhasil ditugaskan ke staff',
      life: 3000
    })
    
    await loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal menugaskan ke staff',
      life: 5000
    })
  } finally {
    loading.value = false
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

/* Assign Dialog */
.assign-dialog {
  padding: 0.5rem 0;
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

/* Form Section Styling */
.form-section {
  background: white;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #4f8f7a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #4f8f7a;
}

.section-title i {
  font-size: 1.25rem;
}

/* Report Info Display */
.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
}

.info-value {
  flex: 1;
  margin: 0;
  color: #334155;
  font-size: 0.875rem;
}

/* Form Field Styling */
.form-field {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
}

.form-field:last-child {
  margin-bottom: 0;
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
}

/* Modern Input Styling */
.modern-select,
.modern-multiselect,
.modern-textarea {
  width: 100%;
  border: 2px solid #e9ecef !important;
  border-radius: 8px !important;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.modern-select:hover,
.modern-multiselect:hover,
.modern-textarea:hover {
  border-color: #cbd5e1 !important;
}

.modern-select:focus,
.modern-multiselect:focus,
.modern-textarea:focus,
.modern-select.p-focus,
.modern-multiselect.p-focus,
.modern-textarea.p-focus {
  border-color: #4f8f7a !important;
  box-shadow: 0 0 0 3px rgba(79, 143, 122, 0.1) !important;
}

:deep(.modern-select .p-select-trigger),
:deep(.modern-multiselect .p-multiselect-trigger) {
  border-radius: 6px;
}

.staff-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

/* Dialog Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.dialog-footer :deep(.p-button) {
  min-width: 120px;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.dialog-footer :deep(.p-button-secondary) {
  border-color: #cbd5e1 !important;
  color: #64748b !important;
}

.dialog-footer :deep(.p-button-secondary):hover {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

.dialog-footer :deep(.p-button-success) {
  background: linear-gradient(135deg, #4f8f7a 0%, #3f7663 100%);
  border: none;
  color: white;
}

.dialog-footer :deep(.p-button-success):hover {
  background: linear-gradient(135deg, #3f7663 0%, #2f5d4f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 143, 122, 0.3);
}

/* Responsive for dialog */
@media (max-width: 768px) {
  .dialog-footer {
    flex-direction: column-reverse;
  }

  .dialog-footer :deep(.p-button) {
    width: 100%;
  }
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

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
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

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  color: #495057;
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
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-dropdown) {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  height: 2.5rem;
}
</style>

