<template>
  <div class="page-wrapper">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Page Header with Breadcrumb -->
    <div class="page-header">
      <div class="breadcrumb-nav">
        <button class="breadcrumb-link" @click="$router.push('/penugasan-layanan')">
          <i class="pi pi-th-large"></i>
          <span>Penugasan Layanan</span>
        </button>
        <i class="pi pi-chevron-right breadcrumb-sep"></i>
        <span class="breadcrumb-current">{{ isKabid ? 'Laporan Bidang Saya' : 'Tugas Saya' }}</span>
      </div>
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
    />

    <!-- Status Tab Navigation -->
    <div class="tab-nav-card">
      <div class="tab-nav-header">
        <i class="pi pi-sliders-h tab-nav-icon"></i>
        <span>Filter Status Tugas</span>
      </div>
      <div class="tab-nav-list">
        <button
          class="tab-nav-item"
          :class="{ active: activeTab === 0 }"
          @click="activeTab = 0"
        >
          <i class="pi pi-list"></i>
          <span class="tab-label">Semua</span>
          <span class="tab-count">{{ tabCounts.all }}</span>
        </button>

        <button
          v-if="isKabid"
          class="tab-nav-item"
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
        >
          <i class="pi pi-clock"></i>
          <span class="tab-label">Perlu Ditugaskan</span>
          <span class="tab-count" :class="{ 'count-warn': tabCounts.needsAssign > 0 }">{{ tabCounts.needsAssign }}</span>
        </button>

        <button
          v-if="!isKabid"
          class="tab-nav-item"
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
        >
          <i class="pi pi-sync"></i>
          <span class="tab-label">Sedang Dikerjakan</span>
          <span class="tab-count">{{ tabCounts.inProgress }}</span>
        </button>

        <button
          v-if="!isKabid"
          class="tab-nav-item"
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
        >
          <i class="pi pi-pause-circle"></i>
          <span class="tab-label">Ditunda</span>
          <span class="tab-count">{{ tabCounts.suspended }}</span>
        </button>

        <button
          v-if="isKabid"
          class="tab-nav-item"
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
        >
          <i class="pi pi-sync"></i>
          <span class="tab-label">Sedang Dikerjakan</span>
          <span class="tab-count">{{ tabCounts.inProgress }}</span>
        </button>

        <button
          class="tab-nav-item"
          :class="{ active: activeTab === 3 }"
          @click="activeTab = 3"
        >
          <i class="pi pi-check-circle"></i>
          <span class="tab-label">Selesai</span>
          <span class="tab-count" :class="{ 'count-success': tabCounts.completed > 0 && activeTab !== 3 }">{{ tabCounts.completed }}</span>
        </button>
      </div>
    </div>

    <!-- Tasks Content -->
    <div class="tasks-section">
      <!-- Empty State - No Data -->
      <template v-if="filteredTasks.length === 0 && myTasks.length === 0">
        <div class="empty-state-wrapper">
          <div class="empty-state-icon">
            <i class="pi pi-inbox"></i>
          </div>
          <h4 class="empty-state-title">Belum Ada Tugas</h4>
          <p class="empty-state-desc">Anda belum memiliki tugas yang ditugaskan saat ini.</p>
        </div>
      </template>

      <!-- Empty State - No Results -->
      <template v-else-if="filteredTasks.length === 0">
        <div class="empty-state-wrapper">
          <div class="empty-state-icon secondary">
            <i class="pi pi-search"></i>
          </div>
          <h4 class="empty-state-title">Tidak Ada Hasil</h4>
          <p class="empty-state-desc">Tidak ada tugas yang sesuai dengan filter yang dipilih. Coba ubah atau reset filter Anda.</p>
          <Button
            label="Reset Filter"
            icon="pi pi-filter-slash"
            @click="resetFilters"
            outlined
            size="small"
          />
        </div>
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

        <!-- Pagination -->
        <div class="pagination-card" v-if="pagination && pagination.total > 0">
          <Paginator
            :rows="pageSize"
            :totalRecords="pagination.total"
            :first="(currentPage - 1) * pageSize"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            @page="onPageChange"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          />
          <div class="pagination-summary">
            <i class="pi pi-info-circle"></i>
            Menampilkan <strong>{{ myTasks.length }}</strong> dari <strong>{{ pagination.total }}</strong> tugas
            &mdash; Halaman {{ pagination.page }} / {{ pagination.total_pages }}
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
        <div class="dialog-section">
          <div class="dialog-section-header">
            <i class="pi pi-file-edit"></i>
            <span>Informasi Laporan</span>
          </div>
          <div class="report-info-grid">
            <div class="info-item">
              <span class="info-key">Judul Laporan</span>
              <span class="info-val">{{ selectedReport?.problem_title }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Kategori</span>
              <span class="info-val">
                <CategoryBadge :category="selectedReport?.problem_category" />
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">Prioritas</span>
              <span class="info-val">
                <PriorityBadge :priority="selectedReport?.priority" />
              </span>
            </div>
          </div>
        </div>

        <!-- Assignment Section -->
        <div class="dialog-section">
          <div class="dialog-section-header">
            <i class="pi pi-users"></i>
            <span>Detail Penugasan</span>
          </div>
          <div class="dialog-section-body">
            <div class="form-field">
              <label class="field-label">
                Pilih Staff <span class="required">*</span>
              </label>
              <Select
                v-model="selectedStaff"
                :options="staffList"
                optionLabel="user_name"
                optionValue="user_id"
                placeholder="Pilih staff yang akan menangani..."
                filter
                showClear
                class="w-full"
              >
                <template #option="{ option }">
                  <div class="staff-option">
                    <div class="staff-avatar">
                      <i class="pi pi-user"></i>
                    </div>
                    <div class="staff-info">
                      <span class="staff-name">{{ option.user_name }}</span>
                      <small class="staff-title">{{ option.job_title }}</small>
                    </div>
                  </div>
                </template>
              </Select>
              <small class="field-hint">
                <i class="pi pi-info-circle"></i>
                Pilih satu staff untuk menangani laporan ini
              </small>
            </div>

            <div class="form-field">
              <label class="field-label">
                Catatan untuk Staff
                <span class="optional">(opsional)</span>
              </label>
              <Textarea
                v-model="assignStaffNotes"
                rows="4"
                placeholder="Tambahkan instruksi atau catatan khusus untuk staff..."
                class="w-full"
                style="resize: none;"
              />
              <small class="field-hint">
                <i class="pi pi-info-circle"></i>
                Maksimal 500 karakter
              </small>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Batal"
            icon="pi pi-times"
            @click="showAssignStaffDialog = false"
            severity="secondary"
            outlined
          />
          <Button
            label="Tugaskan Sekarang"
            icon="pi pi-check"
            @click="handleAssignToStaff"
            :loading="loading"
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
  
  return myTasks.value
})

// Watch filters dan trigger reload API
watch(() => filters.value, () => {
  
  currentPage.value = 1
  loadData()
}, { deep: true })

// Watch activeTab dan trigger reload dengan status filter
watch(activeTab, () => {
  
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
    
    
    
    // Build stats params berdasarkan role
    const statsParams = {
      id_client: clientId
    }
    if (isKabid.value) {
      statsParams.bidang_id = currentBidangId.value
    } else if (isStaff.value) {
      statsParams.assigned_staff_id = userId
    }
    
    
    
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
  } catch (error) {
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
/* ── Page Layout ── */
.page-wrapper {
  padding: 1.5rem;
  min-height: 100vh;
  background: #f8fafc;
}

/* ── Breadcrumb Navigation ── */
.page-header {
  margin-bottom: 1.25rem;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  color: #4f8f7a;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.breadcrumb-link:hover {
  background: #f0faf6;
  border-color: #4f8f7a;
  box-shadow: 0 2px 6px rgba(79, 143, 122, 0.15);
}

.breadcrumb-sep {
  color: #cbd5e1;
  font-size: 0.7rem;
}

.breadcrumb-current {
  color: #334155;
  font-weight: 600;
  font-size: 0.875rem;
}

/* ── Status Tab Navigation ── */
.tab-nav-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tab-nav-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tab-nav-icon {
  color: #4f8f7a;
}

.tab-nav-list {
  display: flex;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  overflow-x: auto;
}

.tab-nav-item {
  flex: 1;
  min-width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5625rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-nav-item i {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.tab-nav-item:hover {
  background: #f0faf6;
  border-color: #4f8f7a;
  color: #4f8f7a;
}

.tab-nav-item.active {
  background: #4f8f7a;
  border-color: #4f8f7a;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(79, 143, 122, 0.35);
}

.tab-count {
  min-width: 1.25rem;
  height: 1.375rem;
  padding: 0 0.4rem;
  background: rgba(0, 0, 0, 0.07);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.2s ease;
}

.tab-nav-item.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.tab-count.count-warn {
  background: #fef9c3;
  color: #a16207;
}

.tab-count.count-success {
  background: #dcfce7;
  color: #15803d;
}

/* ── Tasks Section ── */
.tasks-section {
  min-height: 200px;
}

/* ── Empty States ── */
.empty-state-wrapper {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.empty-state-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, rgba(79, 143, 122, 0.12) 0%, rgba(79, 143, 122, 0.05) 100%);
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.empty-state-icon i {
  font-size: 2rem;
  color: #4f8f7a;
}

.empty-state-icon.secondary {
  background: linear-gradient(135deg, rgba(100, 116, 139, 0.1) 0%, rgba(100, 116, 139, 0.04) 100%);
}

.empty-state-icon.secondary i {
  color: #64748b;
}

.empty-state-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.empty-state-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 auto 1.5rem;
  max-width: 340px;
  line-height: 1.6;
}

/* ── Pagination Card ── */
.pagination-card {
  margin-top: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.25rem 1rem 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.pagination-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: #64748b;
  padding-top: 0.25rem;
}

.pagination-summary i {
  font-size: 0.75rem;
}

.pagination-summary strong {
  color: #1e293b;
  font-weight: 600;
}

:deep(.p-paginator) {
  padding: 0.5rem;
  border: none;
  background: transparent;
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  color: #475569;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background: #4f8f7a;
  border-color: #4f8f7a;
  color: white;
  box-shadow: 0 2px 6px rgba(79, 143, 122, 0.3);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover) {
  background: #f0faf6;
  border-color: #4f8f7a;
  color: #4f8f7a;
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  min-width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  color: #475569;
  transition: all 0.2s ease;
}

:deep(.p-paginator .p-paginator-first):hover,
:deep(.p-paginator .p-paginator-prev):hover,
:deep(.p-paginator .p-paginator-next):hover,
:deep(.p-paginator .p-paginator-last):hover {
  background: #f0faf6;
  border-color: #4f8f7a;
  color: #4f8f7a;
}

/* ── Dialog ── */
.assign-dialog {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:deep(.p-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #4f8f7a 0%, #3f7663 100%);
  color: white;
  padding: 1.125rem 1.5rem;
  border-radius: 12px 12px 0 0;
}

:deep(.p-dialog .p-dialog-title) {
  font-size: 1.0625rem;
  font-weight: 700;
  color: white;
}

:deep(.p-dialog .p-dialog-header-icons button) {
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
}

:deep(.p-dialog .p-dialog-header-icons button:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
}

:deep(.p-dialog .p-dialog-footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: white;
  border-radius: 0 0 12px 12px;
}

.dialog-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.dialog-section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(79, 143, 122, 0.07) 0%, rgba(79, 143, 122, 0.03) 100%);
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #4f8f7a;
}

.report-info-grid {
  padding: 0.5rem 1.25rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child {
  border-bottom: none;
}

.info-key {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  min-width: 115px;
  flex-shrink: 0;
}

.info-val {
  flex: 1;
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
}

.dialog-section-body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.required {
  color: #ef4444;
}

.optional {
  color: #94a3b8;
  font-weight: 400;
  font-size: 0.8rem;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.staff-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.125rem 0;
}

.staff-avatar {
  width: 30px;
  height: 30px;
  background: rgba(79, 143, 122, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.staff-avatar i {
  font-size: 0.8rem;
  color: #4f8f7a;
}

.staff-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.staff-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.staff-title {
  font-size: 0.75rem;
  color: #64748b;
}

/* ── Dialog Footer ── */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 1rem;
  }

  .tab-nav-list {
    padding: 0.625rem 0.75rem;
    gap: 0.375rem;
  }

  .tab-label {
    display: none;
  }

  .tab-nav-item {
    flex: 0 0 auto;
    padding: 0.625rem 0.75rem;
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  :deep(.p-paginator) {
    flex-wrap: wrap;
  }
}
</style>

