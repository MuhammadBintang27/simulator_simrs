<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Hero Section with Stats and Charts -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Dashboard Penugasan Layanan</h1>
          <p class="hero-description">Sistem manajemen tugas dan laporan keluhan dengan workflow approval bertingkat. Pantau status laporan, kelola penugasan, dan monitoring progress pekerjaan secara real-time.</p>
        </div>
      </div>

      <!-- Date Filter - Left Aligned -->
      <div class="date-filter-inline">
        <Calendar
          v-model="dateFrom"
          :maxDate="new Date()"
          dateFormat="dd/mm/yy"
          placeholder="Dari tanggal"
          class="inline-date-picker"
          :showIcon="true"
          iconDisplay="input"
          @date-select="handleDateChange"
        />
        <span class="date-dash">s/d</span>
        <Calendar
          v-model="dateTo"
          :maxDate="new Date()"
          :minDate="dateFrom"
          dateFormat="dd/mm/yy"
          placeholder="Sampai tanggal"
          class="inline-date-picker"
          :showIcon="true"
          iconDisplay="input"
          @date-select="handleDateChange"
        />
        <Button
          icon="pi pi-refresh"
          @click="loadData"
          :loading="loading"
          class="inline-refresh-btn"
          severity="info"
          v-tooltip.top="'Refresh Data'"
        />
      </div>
      
      <!-- Stats Grid -->
      <div class="hero-stats">
        <div v-for="stat in heroStats" :key="stat.label" class="stat-card">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
      
      <!-- Mini Charts -->
      <div class="hero-charts">
        <div class="chart-row">
          <div class="mini-chart">
            <h6 class="chart-title">Tiket Masuk vs Selesai 2026</h6>
            <div class="chart-container-mini">
              <Chart type="bar" :data="monthlyChartData" :options="monthlyChartOptions" />
            </div>
          </div>
          <div class="mini-chart">
            <h6 class="chart-title">Status Tiket</h6>
            <div class="chart-container-mini">
              <Chart type="pie" :data="statusChartData" :options="statusChartOptions" />
            </div>
          </div>
          <div class="mini-chart">
            <h6 class="chart-title">Kategori Masalah</h6>
            <div class="chart-container-mini">
              <Chart type="pie" :data="categoryChartData" :options="categoryChartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Cards - Quick Access -->
    <div class="card elevation-0">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3" @click="goTo('/penugasan-layanan/laporan')">
            <div class="menu-card">
              <div class="menu-icon bg-primary bg-opacity-10">
                <i class="pi pi-file-lines" style="color: #1e90ff; font-size: 1.75rem; font-weight: 700;"></i>
              </div>
              <div class="menu-content">
                <h5 class="menu-title">Semua Laporan</h5>
                <p class="menu-desc">Lihat dan kelola semua laporan keluhan</p>
              </div>
              <div class="menu-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>

          <div class="col-md-3" @click="goTo('/penugasan-layanan/tugas-saya')">
            <div class="menu-card">
              <div class="menu-icon bg-info bg-opacity-10">
                <i class="pi pi-briefcase" style="color: #00bcd4; font-size: 1.75rem; font-weight: 700;"></i>
              </div>
              <div class="menu-content">
                <h5 class="menu-title">Tugas Saya</h5>
                <p class="menu-desc">Kelola tugas yang ditugaskan kepada Anda</p>
              </div>
              <div class="menu-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>

          <div class="col-md-3" @click="goTo('/penugasan-layanan/laporan-saya')">
            <div class="menu-card">
              <div class="menu-icon bg-success bg-opacity-10">
                <i class="pi pi-file" style="color: #00c853; font-size: 1.75rem; font-weight: 700;"></i>
              </div>
              <div class="menu-content">
                <h5 class="menu-title">Laporan Saya</h5>
                <p class="menu-desc">Laporan yang Anda buat</p>
              </div>
              <div class="menu-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>

          <div class="col-md-3" @click="showCreateDialog = true">
            <div class="menu-card">
              <div class="menu-icon bg-warning bg-opacity-10">
                <i class="pi pi-plus" style="color: #ff9800; font-size: 1.75rem; font-weight: 700;"></i>
              </div>
              <div class="menu-content">
                <h5 class="menu-title">Buat Laporan</h5>
                <p class="menu-desc">Buat laporan keluhan baru</p>
              </div>
              <div class="menu-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Reports -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-history mr-2"></i>
          Laporan Terbaru
        </h5>
      </div>
      <div class="card-body">
        <DataTable
          :value="recentReports"
          :paginator="true"
          :rows="5"
          responsiveLayout="scroll"
          stripedRows
          class="elegant-datatable"
        >
          <Column field="report_no" header="No. Laporan" style="min-width: 120px">
            <template #body="slotProps">
              {{ slotProps.data.report_no || `#${slotProps.data.report_id}` }}
            </template>
          </Column>
          <Column field="problem_title" header="Judul" style="min-width: 200px" />
          <Column header="Kategori" style="min-width: 120px">
            <template #body="slotProps">
              <CategoryBadge :category="slotProps.data.problem_category" />
            </template>
          </Column>
          <Column header="Prioritas" style="min-width: 150px">
            <template #body="slotProps">
              <PriorityBadge :priority="slotProps.data.priority" />
            </template>
          </Column>
          <Column header="Status" style="min-width: 180px">
            <template #body="slotProps">
              <StatusBadge :status="slotProps.data.status" :department-name="slotProps.data.bidang_name || 'Bidang'" />
            </template>
          </Column>
          <Column field="report_date" header="Tanggal" style="min-width: 120px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.report_date) }}
            </template>
          </Column>
          <Column header="Aksi" style="min-width: 100px">
            <template #body="slotProps">
              <Button
                icon="pi pi-eye"
                class="p-button-sm p-button-text"
                @click="viewDetail(slotProps.data.report_id)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Dialog Create Report -->
    <Dialog
      v-model:visible="showCreateDialog"
      header="Buat Laporan Baru"
      :modal="true"
      :closable="true"
      :style="{ width: '600px' }"
    >
      <FormLaporanComponent @submit="handleCreateReport" @cancel="showCreateDialog = false" />
    </Dialog>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import { useToast } from 'primevue/usetoast'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { storeToRefs } from 'pinia'

import loading_overlay from '@/components/LoadingFormCompnent.vue'
import StatusBadge from './components/StatusBadge.vue'
import PriorityBadge from './components/PriorityBadge.vue'
import CategoryBadge from './components/CategoryBadge.vue'
import FormLaporanComponent from './components/FormLaporanComponent.vue'
import Chart from 'primevue/chart'
import Calendar from 'primevue/calendar'

const router = useRouter()
const store = usePenugasanLayananStore()
const toast = useToast()

// Destructure untuk reactive access ke pagination dan stats
const { reportsStats, pagination } = storeToRefs(store)

const loading = ref(false)
const showCreateDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// Date filter state - default to current month
const dateFrom = ref(new Date(2026, 0, 1)) // January 1, 2026
const dateTo = ref(new Date(2026, 0, 31)) // January 31, 2026

// Category Options for Visualization
const categoryOptions = [
  { label: 'IT', value: 'IT' },
  { label: 'Listrik', value: 'Listrik' },
  { label: 'Obat-obatan/BMHP', value: 'Obat-obatan/BMHP' },
  { label: 'Alat Kesehatan', value: 'alat kesehatan' },
  { label: 'Bangunan', value: 'bangunan' },
  { label: 'Kebersihan', value: 'kebersihan' }
]

// Hero stats dari API stats endpoint (tanpa pagination)
const heroStats = computed(() => [
  { label: 'Total Laporan', value: reportsStats.value.total_reports || 0 },
  { label: 'Tiket Hari Ini', value: reportsStats.value.tickets_today || 0 },
  { label: 'Tiket Minggu Ini', value: reportsStats.value.tickets_this_week || 0 },
  { label: 'Tiket Bulan Ini', value: reportsStats.value.tickets_this_month || 0 },
  { label: 'Belum Direview', value: reportsStats.value.tickets_unreviewed || 0 }
])

// Keep existing computed for charts (menggunakan data lokal untuk detail bulan)
const ticketsToday = computed(() => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return store.reports.filter(r => 
    r.report_date && format(parseISO(r.report_date), 'yyyy-MM-dd') === today
  ).length
})

const ticketsThisWeek = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return store.reports.filter(r => {
    if (!r.report_date) return false
    const reportDate = parseISO(r.report_date)
    return reportDate >= startOfWeek && reportDate <= endOfWeek
  }).length
})

const ticketsThisMonth = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return store.reports.filter(r => {
    if (!r.report_date) return false
    const reportDate = parseISO(r.report_date)
    return reportDate >= startOfMonth && reportDate <= endOfMonth
  }).length
})

const ticketsUnreviewed = computed(() => {
  return store.reports.filter(r => r.status === 'pending' || r.status === 'submitted').length
})

const categoryCounts = computed(() => {
  const counts = {}
  store.reports.forEach(r => {
    const category = r.problem_category || 'Lainnya'
    counts[category] = (counts[category] || 0) + 1
  })
  return counts
})

const monthlyChartData = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  const incoming = []
  const completed = []
  
  for (let i = 0; i < 12; i++) {
    const startOfMonth = new Date(2026, i, 1)
    const endOfMonth = new Date(2026, i + 1, 0)
    
    const incomingCount = store.reports.filter(r => {
      if (!r.report_date) return false
      const reportDate = parseISO(r.report_date)
      return reportDate >= startOfMonth && reportDate <= endOfMonth
    }).length
    
    const completedCount = store.reports.filter(r => {
      if (r.status !== 'completed') return false
      // Jika ada completed_at, gunakan itu, jika tidak gunakan report_date sebagai fallback
      const completedDate = r.completed_at ? parseISO(r.completed_at) : parseISO(r.report_date)
      return completedDate >= startOfMonth && completedDate <= endOfMonth
    }).length
    
    incoming.push(incomingCount)
    completed.push(completedCount)
  }
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Tiket Masuk',
        data: incoming,
        backgroundColor: '#42A5F5',
        borderColor: '#42A5F5',
        borderWidth: 1
      },
      {
        label: 'Tiket Selesai',
        data: completed,
        backgroundColor: '#66BB6A',
        borderColor: '#66BB6A',
        borderWidth: 1
      }
    ]
  }
})

const statusChartData = computed(() => {
  // Status yang harus selalu ditampilkan
  const requiredStatuses = [
    'Diajukan',        // submitted
    'Ditugaskan ke Bidang', // assigned_to_dept
    'Sedang Dikerjakan',    // assigned_to_staff
    'Ditunda',         // deferred
    'Selesai'          // completed
  ]
  
  // Mapping dari raw status ke display status
  const statusMapping = {
    submitted: 'Diajukan',
    reviewed: 'Direview', 
    assigned_to_dept: 'Ditugaskan ke Bidang',
    assigned_to_staff: 'Sedang Dikerjakan',
    completed: 'Selesai',
    deferred: 'Ditunda',
    rejected: 'Ditolak'
  }
  
  // Hitung jumlah untuk setiap status
  const statusCounts = {}
  requiredStatuses.forEach(status => {
    statusCounts[status] = 0
  })
  
  store.reports.forEach(r => {
    const rawStatus = r.status || 'unknown'
    const displayStatus = statusMapping[rawStatus] || rawStatus
    if (requiredStatuses.includes(displayStatus)) {
      statusCounts[displayStatus] = (statusCounts[displayStatus] || 0) + 1
    }
  })
  
  return {
    labels: requiredStatuses,
    datasets: [
      {
        data: requiredStatuses.map(status => statusCounts[status] || 0),
        backgroundColor: [
          '#FF6384', // Diajukan
          '#36A2EB', // Ditugaskan ke Bidang
          '#FFCE56', // Sedang Dikerjakan
          '#4BC0C0', // Ditunda
          '#9966FF'  // Selesai
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  }
})

const categoryChartData = computed(() => {
  const categories = categoryOptions.map(opt => opt.value)
  const data = categories.map(cat => categoryCounts.value[cat] || 0)
  
  return {
    labels: categoryOptions.map(opt => opt.label),
    datasets: [
      {
        data: data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56', 
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  }
})

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 12
        },
        boxWidth: 12,
        padding: 8
      }
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 11
        },
        maxRotation: 45
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          size: 11
        }
      }
    }
  },
  elements: {
    bar: {
      borderRadius: 2,
    }
  }
}

const statusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      align: 'center',
      labels: {
        font: {
          size: 12
        },
        boxWidth: 12,
        padding: 8
      }
    },
    title: {
      display: false,
    },
  }
}

const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      align: 'center',
      labels: {
        font: {
          size: 12
        },
        boxWidth: 12,
        padding: 8
      }
    },
    title: {
      display: false,
    },
  }
}

const stats = computed(() => ({
  totalReports: store.reports.length,
  urgentReports: store.urgentReportsCount,
  inProgressTasks: store.inProgressTasksCount,
  completedToday: store.reports.filter(
    (r) =>
      r.status === 'completed' &&
      format(parseISO(r.completed_at || r.report_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
  ).length,
}))

const recentReports = computed(() => {
  return [...store.reports]
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date))
    .slice(0, 5)
})

const formatDate = (date) => {
  if (!date) return '-'
  return format(parseISO(date), 'dd MMM yyyy', { locale: id })
}

const goTo = (path) => {
  router.push(path)
}

const viewDetail = (reportId) => {
  router.push(`/penugasan-layanan/laporan/${reportId}`)
}

const handleCreateReport = async (formData) => {
  try {
    loading.value = true
    await store.createReport(formData)

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Laporan berhasil dibuat',
      life: 3000,
    })

    showCreateDialog.value = false
    await loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal membuat laporan',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const handleDateChange = () => {
  // Auto refresh data when date changes
  loadData()
}

const loadData = async () => {
  try {
    loading.value = true
    // Format dates for API call
    const formattedDateFrom = dateFrom.value ? format(dateFrom.value, 'yyyy-MM-dd') : null
    const formattedDateTo = dateTo.value ? format(dateTo.value, 'yyyy-MM-dd') : null
    
    // Parallel fetch: stats untuk header + recent reports dengan pagination dan date filter
    await Promise.all([
      store.fetchReportsStats({ 
        date_from: formattedDateFrom,
        date_to: formattedDateTo
      }), // Stats dengan date filter
      store.fetchReports({ 
        page: currentPage.value, 
        limit: pageSize.value,
        date_from: formattedDateFrom,
        date_to: formattedDateTo
      }), // Data dengan pagination dan date filter
      store.fetchEnums()
    ])
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data',
      life: 5000,
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
/* Menu Cards */
.menu-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.menu-card:hover {
  border-color: #4f8f7a;
  box-shadow: 0 4px 12px rgba(79, 143, 122, 0.15);
  transform: translateY(-2px);
}

.menu-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon i {
  font-size: 1.5rem;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.menu-desc {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.menu-arrow {
  color: #999;
  font-size: 1.25rem;
}

.menu-card:hover .menu-arrow {
  color: #4f8f7a;
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

/* Chart Styling */
.chart-container {
  height: 300px;
  width: 100%;
}

/* Hero Section with Charts */
.hero-section {
  background: linear-gradient(135deg, #4f8f7a 0%, #3f7663 50%, #2e5f4f 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 8px 32px rgba(79, 143, 122, 0.3);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.hero-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.hero-icon i {
  font-size: 2rem;
  color: white;
}

.hero-text {
  flex: 1;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
  position: relative;
  z-index: 1;
}

.hero-description {
  font-size: 0.875rem;
  opacity: 0.95;
  margin: 0;
  line-height: 1.5;
  color: white;
  position: relative;
  z-index: 1;
}

/* Date Filter Inline */
.date-filter-inline {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.inline-date-picker {
  width: 140px;
}

.inline-date-picker:deep(.p-calendar) {
  width: 100%;
}

.inline-date-picker:deep(.p-calendar-input) {
  font-size: 0.875rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border-radius: 8px;
}

.inline-date-picker:deep(.p-calendar .p-inputtext) {
  border-radius: 8px;
}

.date-dash {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
}

.inline-refresh-btn {
  flex-shrink: 0;
  border-radius: 8px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: #f8f9fa;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.stat-card:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333 !important;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 1;
  font-weight: 600;
  line-height: 1.2;
  color: #666 !important;
}

.hero-charts {
  margin-top: 1rem;
  position: relative;
  z-index: 1;
}

.chart-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr;
  gap: 1rem;
}

.mini-chart {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  z-index: 1;
  border: 1px solid #e9ecef;
}

.chart-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-align: center;
  color: #333;
  position: relative;
  z-index: 1;
}

.chart-container-mini {
  height: 200px;
  width: 100%;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 1.5rem;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 1.25rem;
  }

  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-row {
    grid-template-columns: 1fr;
  }

  .chart-container-mini {
    height: 150px;
  }
}
</style>
