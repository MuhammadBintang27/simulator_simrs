<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Back Navigation -->
    <div class="back-nav">
      <Button icon="pi pi-arrow-left" label="Kembali" text @click="$router.push('/penugasan-layanan')" />
    </div>

    <!-- Hero Section Component -->
    <HeroSection
      icon="pi pi-file-alt"
      title="Laporan Saya"
      description="Daftar laporan keluhan yang Anda buat. Pantau status dan progress penanganan laporan Anda."
      :stats="heroStats"
    />

    <!-- Filter Section Component -->
    <FilterSection
      :filters="filters"
      @update:filters="filters = $event"
      :filtered-count="filteredReports.length"
      :total-count="myReports.length"
      :loading="loading"
      search-placeholder="Cari judul, lokasi, ID laporan..."
      @refresh="loadData"
      @reset="resetFilters"
    >
      <template #actions>
        <Button
          label="Buat Laporan Baru"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
          severity="success"
          size="small"
        />
      </template>
    </FilterSection>

    <!-- Reports Grid -->
    <div class="reports-container">
      <!-- Empty State - No Data -->
      <template v-if="filteredReports.length === 0 && myReports.length === 0">
        <Card class="empty-state-card">
          <template #content>
            <div class="empty-state">
              <i class="pi pi-inbox empty-icon"></i>
              <h4 class="empty-title">Belum Ada Laporan</h4>
              <p class="empty-text">Anda belum membuat laporan. Mulai buat laporan pertama Anda.</p>
              <Button
                label="Buat Laporan Pertama"
                icon="pi pi-plus"
                @click="showCreateDialog = true"
                class="p-button-lg"
              />
            </div>
          </template>
        </Card>
      </template>

      <!-- Empty State - No Results -->
      <template v-else-if="filteredReports.length === 0">
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
          :reports="filteredReports"
          :show-reporter="false"
          :show-edit="true"
          :show-assign-to-dept="false"
          :show-assign-to-staff="false"
          :enable-pagination="false"
          @view-detail="viewDetail"
          @edit="openEditDialog"
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

    <!-- Dialog Edit -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Laporan"
      :modal="true"
      :closable="true"
      :style="{ width: '650px' }"
    >
      <FormLaporanComponent
        :reportData="selectedReport"
        @submit="handleUpdate"
        @cancel="showEditDialog = false"
      />
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { storeToRefs } from 'pinia'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import Paginator from 'primevue/paginator'

import loading_overlay from '@/components/LoadingFormCompnent.vue'
import HeroSection from './components/HeroSection.vue'
import FilterSection from './components/FilterSection.vue'
import FormLaporanComponent from './components/FormLaporanComponent.vue'
import ReportsDataTable from './components/ReportsDataTable.vue'

const router = useRouter()
const store = usePenugasanLayananStore()
const authStore = useAuthStore()
const toast = useToast()

// Destructure untuk reactive access
const { reportsStats, pagination, myReports } = storeToRefs(store)

const loading = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const selectedReport = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

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
  { label: 'Total Laporan Saya', value: reportsStats.value.total_reports || 0 },
  { label: 'Hari Ini', value: reportsStats.value.tickets_today || 0 },
  { label: 'Minggu Ini', value: reportsStats.value.tickets_this_week || 0 },
  { label: 'Bulan Ini', value: reportsStats.value.tickets_this_month || 0 }
])

// Filtered Reports - langsung dari API, tidak perlu filter client-side
const filteredReports = computed(() => {
  return myReports.value
})

// Watch filters dan trigger reload API
watch(() => filters.value, () => {
  currentPage.value = 1
  loadData()
}, { deep: true })

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
    
    // Parallel fetch: stats + reports paginated dengan filter
    await Promise.all([
      store.fetchReportsStats({ 
        reporter_user_id: userId // Filter untuk stats user ini
      }),
      store.fetchMyReports(apiParams)
    ])
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

const openEditDialog = (report) => {
  selectedReport.value = report
  showEditDialog.value = true
}

const handleCreate = async (formData) => {
  try {
    console.log('📋 MY REPORTS VIEW - Received formData:', formData)
    console.log('📋 MY REPORTS VIEW - FormData type:', formData instanceof FormData ? 'FormData' : typeof formData)
    
    loading.value = true
    await store.createReport(formData)
    showCreateDialog.value = false
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Laporan berhasil dibuat',
      life: 3000
    })
    await loadData()
  } catch (error) {
    console.error('❌ MY REPORTS VIEW - Create report failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal membuat laporan',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const handleUpdate = async (formData) => {
  try {
    loading.value = true
    await store.updateReport(selectedReport.value.report_id, formData)
    showEditDialog.value = false
    selectedReport.value = null
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Laporan berhasil diupdate',
      life: 3000
    })
    await loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal mengupdate laporan',
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

/* Responsive */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }

  .reports-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
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
