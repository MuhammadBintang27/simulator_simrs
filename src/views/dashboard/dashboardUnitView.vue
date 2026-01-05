<template>
  <div class="content">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-car"> </i>
        </div>

        <div class="hero-text">
          <h1 class="hero-title">Dashboard Ketersediaan Unit</h1>
          <p class="hero-description">
            Dashboard ini menyajikan informasi lengkap dan terkini mengenai status seluruh unit
            kendaraan dalam sistem. Anda dapat memantau jumlah unit yang tersedia, sedang disewa,
            dalam pemeliharaan, maupun yang tidak aktif secara real-time
          </p>

          <!-- Share Button in Hero -->
          <div class="hero-actions">
            <Button
              label="Bagikan Dashboard"
              icon="pi pi-share-alt"
              @click="shareDashboard"
              severity="secondary"
              outlined
              class="share-hero-btn"
            />
          </div>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalVehicles }}</div>
          <div class="stat-label">Total Unit</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ availableCount }}</div>
          <div class="stat-label">Tersedia</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rentedCount }}</div>
          <div class="stat-label">Sedang Rental</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ occupancyRate }}%</div>
          <div class="stat-label">Tingkat Okupasi</div>
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
          <InputText v-model="globalFilter" placeholder="Cari..." />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-car"></i>
            Jenis Kendaraan
          </label>
          <Select
            v-model="selectedVehicleType"
            :options="vehicleTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua Jenis"
            showClear
            class="w-full modern-select"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-info-circle"></i>
            Status
          </label>
          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua Status"
            showClear
            class="w-full modern-select"
          />
        </div>

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
            placeholder="Pilih tanggal mulai"
            showIcon
            iconDisplay="input"
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
            Daftar Kendaraan ({{ filteredVehicles.length }} unit)
          </h3>
          <div class="table-actions">
            <Button
              icon="pi pi-share-alt"
              label="Bagikan Data"
              @click="shareFilteredData"
              class="p-button-outlined p-button-info share-data-btn"
              size="small"
            />
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
          :value="filteredVehicles"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50, 100]"
          :globalFilterFields="['no_pol', 'desc', 'jenis', 'STATUS']"
          :sortField="'no_pol'"
          :sortOrder="1"
          responsiveLayout="scroll"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} kendaraan"
          class="elegant-datatable"
          stripedRows
        >
          <Column
            field="no_pol"
            header="Informasi Kendaraan"
            :sortable="true"
            style="min-width: 280px"
          >
            <template #body="slotProps">
              <div class="vehicle-info">
                <div class="license-plate">
                  <div class="vehicle-icon">
                    <i :class="getVehicleIcon(slotProps.data.jenis)"></i>
                  </div>
                  <RouterLink></RouterLink>
                  <div class="vehicle-details">
                    <strong class="plate-number">{{ slotProps.data.no_pol }}</strong>
                    <div class="vehicle-desc">{{ slotProps.data.desc }}</div>
                    <div class="vehicle-year">
                      <i class="pi pi-calendar"></i>
                      Tahun: {{ slotProps.data.tahun_pembuatan }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="jenis" header="Jenis" :sortable="true" style="min-width: 140px">
            <template #body="slotProps">
              <div class="vehicle-type-badge">
                <i :class="getVehicleIcon(slotProps.data.jenis)"></i>
                <span>{{ slotProps.data.jenis }}</span>
              </div>
            </template>
          </Column>

          <Column field="STATUS" header="Status" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.status"
                :severity="getStatusSeverity(slotProps.data.status)"
                class="status-tag-elegant"
              >
                <i :class="getStatusIcon(slotProps.data.status)" style="margin-right: 6px"></i>
                {{ slotProps.data.status }}
              </Tag>
            </template>
          </Column>

          <Column field="no_transaksi" header="Informasi Transaksi" style="min-width: 320px">
            <template #body="slotProps">
              <div
                v-if="slotProps.data.no_transaksi && slotProps.data.no_transaksi !== '0'"
                class="transaction-info-elegant"
              >
                <div class="transaction-card">
                  <div class="transaction-header mb-1">
                    <i class="pi pi-file-o mr-1"></i>
                    <span class="transaction-number">{{ slotProps.data.no_transaksi }}</span>
                  </div>
                  <div v-if="slotProps.data.tanggal_start" class="transaction-details mb-1">
                    <div class="date-range">
                      <i class="pi pi-calendar mr-1"></i>
                      <span>{{
                        formatDateRange(slotProps.data.tanggal_start, slotProps.data.tanggal_end)
                      }}</span>
                    </div>
                    <div class="duration-info mt-1">
                      <i class="pi pi-clock mr-1"></i>
                      <span class="duration-value">
                        {{
                          calculateDuration(
                            slotProps.data.tanggal_start,
                            slotProps.data.tanggal_end,
                          )
                        }}
                        hari
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-transaction-elegant">
                <i class="pi pi-minus-circle mr-1"></i>
                <span>Tidak ada transaksi aktif</span>
              </div>
            </template>
          </Column>

          <Column header="Aksi" style="min-width: 180px">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button
                  :icon="slotProps.data.STATUS === 'Tersedia' ? 'pi pi-play' : 'pi pi-eye'"
                  :label="slotProps.data.STATUS === 'Tersedia' ? 'Sewa' : 'Detail'"
                  :severity="slotProps.data.STATUS === 'Tersedia' ? 'success' : 'info'"
                  size="small"
                  @click="handleAction(slotProps.data)"
                  class="elegant-button round-button2"
                />
                <Button
                  icon="pi pi-share-alt"
                  @click="shareVehicle(slotProps.data)"
                  severity="secondary"
                  outlined
                  size="small"
                  class="share-vehicle-btn"
                  v-tooltip.top="'Bagikan Kendaraan'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Share Dialog -->
    <Dialog
      v-model:visible="showShareDialog"
      header="Bagikan Dashboard"
      :modal="true"
      :style="{ width: '500px' }"
      class="share-dialog"
    >
      <div class="share-content">
        <!-- Share URL -->
        <div class="share-url-section">
          <label class="share-label">Link untuk dibagikan</label>
          <div class="p-inputgroup">
            <InputText :value="currentShareUrl" readonly class="share-url-input" />
            <Button
              icon="pi pi-copy"
              @click="copyToClipboard"
              severity="secondary"
              v-tooltip.top="'Salin Link'"
            />
          </div>
        </div>

        <!-- Share Preview -->
        <div v-if="shareData.title" class="share-preview">
          <h4 class="share-preview-title">{{ shareData.title }}</h4>
          <p class="share-preview-desc">{{ shareData.description }}</p>

          <!-- Share Stats Preview -->
          <div v-if="shareData.type === 'dashboard'" class="share-stats">
            <div class="share-stat-item">
              <span class="share-stat-number">{{ totalVehicles }}</span>
              <span class="share-stat-label">Total Unit</span>
            </div>
            <div class="share-stat-item">
              <span class="share-stat-number">{{ availableCount }}</span>
              <span class="share-stat-label">Tersedia</span>
            </div>
            <div class="share-stat-item">
              <span class="share-stat-number">{{ occupancyRate }}%</span>
              <span class="share-stat-label">Okupansi</span>
            </div>
          </div>
        </div>

        <!-- Social Share Buttons -->
        <div class="social-share-grid">
          <Button
            label="WhatsApp"
            icon="pi pi-whatsapp"
            @click="shareViaWhatsApp"
            class="social-btn whatsapp-btn"
          />
          <Button
            label="Telegram"
            icon="pi pi-send"
            @click="shareViaTelegram"
            class="social-btn telegram-btn"
          />
          <Button
            label="Facebook"
            icon="pi pi-facebook"
            @click="shareOnFacebook"
            class="social-btn facebook-btn"
          />
          <Button
            label="Twitter"
            icon="pi pi-twitter"
            @click="shareOnTwitter"
            class="social-btn twitter-btn"
          />
          <Button
            label="Email"
            icon="pi pi-envelope"
            @click="shareViaEmail"
            class="social-btn email-btn"
          />
          <Button
            label="LinkedIn"
            icon="pi pi-linkedin"
            @click="shareOnLinkedIn"
            class="social-btn linkedin-btn"
          />
        </div>
      </div>
    </Dialog>

    <!-- Toast for notifications -->
  </div>
  <Toast />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import Select from 'primevue/select'

// Store and toast setup
const configStore = useConfigStore()
const toast = useToast()

// Reactive data
const vehicles = ref([])
const loading = ref(false)
const globalFilter = ref('')
const selectedVehicleType = ref(null)
const selectedStatus = ref(null)
const selectedYear = ref(null)
const startDate = ref(new Date())
const endDate = ref(new Date())

import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// Share functionality
const showShareDialog = ref(false)
const currentShareUrl = ref('')
const shareData = ref({
  title: '',
  description: '',
  type: 'dashboard', // 'dashboard', 'data', 'vehicle'
})

// Vehicle data from your JSON
const vehicleData = ref([])

// Filter options
const vehicleTypes = computed(() => {
  const types = [...new Set(vehicles.value.map((v) => v.jenis).filter(Boolean))]
  return types.map((type) => ({ label: type, value: type }))
})

const statusOptions = ref([
  { label: 'Tersedia', value: 'Tersedia' },
  { label: 'Sedang Rental', value: 'Sedang Rental' },
])

// Computed properties
const filteredVehicles = computed(() => {
  let filtered = [...vehicles.value]

  // Global filter
  if (globalFilter.value) {
    const query = globalFilter.value.toLowerCase()
    filtered = filtered.filter(
      (vehicle) =>
        vehicle.no_pol?.toLowerCase().includes(query) ||
        vehicle.desc?.toLowerCase().includes(query) ||
        vehicle.jenis?.toLowerCase().includes(query) ||
        vehicle.STATUS?.toLowerCase().includes(query),
    )
  }

  // Vehicle type filter
  if (selectedVehicleType.value) {
    filtered = filtered.filter((vehicle) => vehicle.jenis === selectedVehicleType.value)
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter((vehicle) => vehicle.STATUS === selectedStatus.value)
  }

  // Year filter
  if (selectedYear.value) {
    filtered = filtered.filter((vehicle) => vehicle.tahun_pembuatan === selectedYear.value)
  }

  return filtered
})

const totalVehicles = computed(() => vehicles.value.length)

const availableCount = computed(
  () => filteredVehicles.value.filter((v) => v.STATUS === 'Tersedia').length,
)

const rentedCount = computed(
  () => filteredVehicles.value.filter((v) => v.STATUS === 'Sedang Rental').length,
)

const occupancyRate = computed(() => {
  if (totalVehicles.value === 0) return 0
  return Math.round((rentedCount.value / totalVehicles.value) * 100)
})

// Share Functions
const generateShareUrl = (params = {}) => {
  // Base URL for sharing - menggunakan format custom
  const baseUrl = 'https://link-rental.id/unitid'

  // Get client ID from store
  const clientId = id_client.value || '0' // fallback jika tidak ada client ID

  // Format tanggal untuk URL (YYYY-MM-DD)
  const startDateFormatted = formatDate(startDate.value) || formatDate(new Date())
  const endDateFormatted = formatDate(endDate.value) || formatDate(new Date())

  // Generate URL dengan format: baseUrl/clientId/startDate/endDate
  let shareUrl = `${baseUrl}/${clientId}/${startDateFormatted}/${endDateFormatted}`

  // Tambahkan parameter tambahan sebagai query string jika diperlukan
  const queryParams = new URLSearchParams()

  if (globalFilter.value) queryParams.set('search', globalFilter.value)
  if (selectedVehicleType.value) queryParams.set('vehicle_type', selectedVehicleType.value)
  if (selectedStatus.value) queryParams.set('status', selectedStatus.value)

  // Add additional params from function parameter
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.set(key, value)
  })

  // Tambahkan query string jika ada filter
  if (queryParams.toString()) {
    shareUrl += `?${queryParams.toString()}`
  }

  return shareUrl
}

const shareDashboard = async () => {
  const url = generateShareUrl()
  const title = '📊 Dashboard Ketersediaan Unit Kendaraan'
  const description = `Dashboard real-time dengan ${totalVehicles.value} unit kendaraan. ${availableCount.value} unit tersedia, ${rentedCount.value} unit sedang disewa. Tingkat okupansi: ${occupancyRate.value}%. Data terkini untuk periode ${formatDateForDisplay(startDate.value)} - ${formatDateForDisplay(endDate.value)}.`

  await handleShare({
    url,
    title,
    description,
    type: 'dashboard',
  })
}

const shareFilteredData = async () => {
  const url = generateShareUrl()
  const title = `📋 Data Kendaraan - ${filteredVehicles.value.length} Unit`
  let description = `Lihat data ${filteredVehicles.value.length} kendaraan dari total ${totalVehicles.value} unit`

  if (globalFilter.value) {
    description += ` dengan filter "${globalFilter.value}"`
  }

  if (selectedVehicleType.value) {
    description += ` jenis ${selectedVehicleType.value}`
  }

  if (selectedStatus.value) {
    description += ` status ${selectedStatus.value}`
  }

  description += ` untuk periode ${formatDateForDisplay(startDate.value)} - ${formatDateForDisplay(endDate.value)}. ${availableCount.value} unit tersedia untuk disewa.`

  await handleShare({
    url,
    title,
    description,
    type: 'data',
  })
}

const shareVehicle = async (vehicle) => {
  // Untuk kendaraan spesifik, tambahkan vehicle_id sebagai parameter
  const url = generateShareUrl({
    vehicle_id: vehicle.id,
    highlight: vehicle.no_pol,
  })

  const title = ` ${vehicle.desc || 'Kendaraan'} - ${vehicle.no_pol}`
  let description = `${vehicle.desc || 'Kendaraan'} ${vehicle.tahun_pembuatan || ''} jenis ${vehicle.jenis || 'Mobil'}`

  if (vehicle.STATUS === 'Tersedia') {
    description += ' - TERSEDIA untuk disewa! Hubungi kami sekarang.'
  } else if (vehicle.STATUS === 'Sedang Rental') {
    description += ' - sedang dalam masa rental'
    if (vehicle.tanggal_end) {
      description += ` hingga ${formatDateForDisplay(vehicle.tanggal_end)}`
    }
  }

  description += ` Lihat periode ${formatDateForDisplay(startDate.value)} - ${formatDateForDisplay(endDate.value)}.`

  await handleShare({
    url,
    title,
    description,
    type: 'vehicle',
    vehicle,
  })
}

const handleShare = async (shareInfo) => {
  shareData.value = shareInfo
  currentShareUrl.value = shareInfo.url + `?client_id=${id_client.value}`

  // Try Web Share API first (mobile)
  if (navigator.share && shareInfo.type !== 'dashboard') {
    try {
      await navigator.share({
        title: shareInfo.title,
        text: shareInfo.description,
        url: shareInfo.url,
      })
      return
    } catch (error) {
      if (error.name === 'AbortError') return // User cancelled
    }
  }

  // Fallback to custom dialog
  showShareDialog.value = true
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentShareUrl.value)
    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Link berhasil disalin ke clipboard',
      life: 3000,
    })
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = currentShareUrl.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)

    toast.add({
      severity: 'success',
      summary: 'Berhasil!',
      detail: 'Link berhasil disalin',
      life: 3000,
    })
  }
}

const shareViaWhatsApp = () => {
  const text = encodeURIComponent(
    `${shareData.value.title}\n\n${shareData.value.description}\n\n${currentShareUrl.value}`,
  )
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

const shareViaTelegram = () => {
  const text = encodeURIComponent(`${shareData.value.title}\n\n${shareData.value.description}`)
  const url = encodeURIComponent(currentShareUrl.value)
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
}

const shareOnFacebook = () => {
  const url = encodeURIComponent(currentShareUrl.value)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const shareOnTwitter = () => {
  const text = encodeURIComponent(`${shareData.value.title}\n\n${shareData.value.description}`)
  const url = encodeURIComponent(currentShareUrl.value)
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}

const shareOnLinkedIn = () => {
  const url = encodeURIComponent(currentShareUrl.value)
  const title = encodeURIComponent(shareData.value.title)
  const summary = encodeURIComponent(shareData.value.description)
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`,
    '_blank',
  )
}

const shareViaEmail = () => {
  const subject = encodeURIComponent(shareData.value.title)
  const body = encodeURIComponent(
    `${shareData.value.description}\n\nLihat selengkapnya: ${currentShareUrl.value}`,
  )
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

// Helper functions
const getVehicleIcon = (jenis) => {
  switch (jenis) {
    case 'Mobil':
      return 'pi pi-car mr-1'
    case 'Motor':
      return 'pi pi-circle mr-1'
    case 'Bus':
      return 'pi pi-truck mr-1'
    default:
      return 'pi pi-car mr-1'
  }
}

const getStatusSeverity = (status) => {
  switch (status) {
    case 'Tersedia':
      return 'success'
    case 'Sedang Rental':
      return 'warn'
    default:
      return 'info'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Tersedia':
      return 'pi pi-check-circle'
    case 'Sedang Rental':
      return 'pi pi-clock'
    default:
      return 'pi pi-info-circle'
  }
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '-'

  const start = new Date(startDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const end = new Date(endDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return `${start} - ${end}`
}

const formatDateForDisplay = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

const handleAction = (vehicle) => {
  if (vehicle.STATUS === 'Tersedia') {
    toast.add({
      severity: 'info',
      summary: 'Aksi Sewa',
      detail: `Memulai proses sewa untuk ${vehicle.no_pol}`,
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'info',
      summary: 'Detail Kendaraan',
      detail: `Menampilkan detail untuk ${vehicle.no_pol}`,
      life: 3000,
    })
  }
}

const resetFilters = () => {
  globalFilter.value = ''
  selectedVehicleType.value = null
  selectedStatus.value = null
  selectedYear.value = null
  startDate.value = null
  endDate.value = null

  toast.add({
    severity: 'info',
    summary: 'Filter Reset',
    detail: 'Semua filter telah direset',
    life: 2000,
  })
}

// API calls
const fetchData = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const param = {
      start_date: formatDate(startDate.value),
      end_date: formatDate(endDate.value),
      id_client: id_client.value,
    }

    const response = await axios.post(`${url}/utilitas/dashboard_available`, param)
    vehicleData.value = response.data.data || []
    vehicles.value = vehicleData.value

    console.log(response.data.data)
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const refreshData = async () => {
  loading.value = true

  try {
    // Simulate API call or use your actual API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    vehicles.value = vehicleData

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data berhasil diperbarui',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memperbarui data',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Initialize data
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Your existing styles from the original component */

.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 4px;
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
  margin: 0 0 1.5rem 0;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.share-hero-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.share-hero-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-2px);
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

/* Enhanced Filter Section */
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

.share-data-btn {
  background: #f0f9ff !important;
  border-color: #0ea5e9 !important;
  color: #0ea5e9 !important;
}

.share-data-btn:hover {
  background: #0ea5e9 !important;
  color: white !important;
}

.modern-datatable {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.license-plate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plate-number {
  color: #2563eb;
  font-size: 1rem;
}

.vehicle-desc {
  color: #6b7280;
  font-size: 0.9rem;
}

.vehicle-year {
  color: #9ca3af;
  font-size: 0.85rem;
}

.vehicle-type-badge {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-number {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.date-range {
  color: #6b7280;
  font-size: 0.85rem;
}

.duration-info {
  color: #059669;
  font-size: 0.85rem;
  font-weight: 500;
}

.no-transaction {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.share-vehicle-btn {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #6b7280 !important;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-vehicle-btn:hover {
  background: #4f46e5 !important;
  border-color: #4f46e5 !important;
  color: white !important;
}

.status-tag {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* Share Dialog Styles */
.share-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border-radius: 12px 12px 0 0;
}

.share-dialog :deep(.p-dialog-content) {
  padding: 2rem;
}

.share-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.share-url-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.share-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.share-url-input {
  font-size: 0.875rem;
  background: #f8fafc;
}

.p-inputgroup {
  display: flex;
}

.p-inputgroup .p-inputtext {
  flex: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.p-inputgroup .p-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.share-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.share-preview-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.share-preview-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.share-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.share-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.share-stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #4f46e5;
}

.share-stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.social-share-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.social-btn {
  height: 2.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.whatsapp-btn {
  background: #25d366 !important;
  border-color: #25d366 !important;
  color: white !important;
}

.whatsapp-btn:hover {
  background: #1ebe57 !important;
  border-color: #1ebe57 !important;
}

.telegram-btn {
  background: #0088cc !important;
  border-color: #0088cc !important;
  color: white !important;
}

.telegram-btn:hover {
  background: #0077b3 !important;
  border-color: #0077b3 !important;
}

.facebook-btn {
  background: #1877f2 !important;
  border-color: #1877f2 !important;
  color: white !important;
}

.facebook-btn:hover {
  background: #166fe5 !important;
  border-color: #166fe5 !important;
}

.twitter-btn {
  background: #1da1f2 !important;
  border-color: #1da1f2 !important;
  color: white !important;
}

.twitter-btn:hover {
  background: #1a91da !important;
  border-color: #1a91da !important;
}

.linkedin-btn {
  background: #0077b5 !important;
  border-color: #0077b5 !important;
  color: white !important;
}

.linkedin-btn:hover {
  background: #006396 !important;
  border-color: #006396 !important;
}

.email-btn {
  background: #ea4335 !important;
  border-color: #ea4335 !important;
  color: white !important;
}

.email-btn:hover {
  background: #d23321 !important;
  border-color: #d23321 !important;
}

.table-footer {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-top: 2px solid #e2e8f0;
  padding: 0;
}

.footer-content {
  padding: 2rem;
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

  .hero-actions {
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

  .social-share-grid {
    grid-template-columns: 1fr;
  }

  .share-dialog :deep(.p-dialog) {
    width: 95vw !important;
    max-width: 450px;
  }

  .share-stats {
    justify-content: center;
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
</style>
