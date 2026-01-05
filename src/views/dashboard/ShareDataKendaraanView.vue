<template>
  <Nav></Nav>
  <div class="rental-container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Rental Kendaraan Premium</h1>
        <p class="hero-description">
          Pilih kendaraan terbaik untuk perjalanan Anda dengan harga terjangkau
        </p>
        <!-- Share Button in Hero -->
        <div class="hero-actions">
          <Button
            label="Bagikan Halaman"
            icon="pi pi-share-alt"
            @click="shareRentalPage"
            severity="secondary"
            outlined
            class="share-hero-btn"
          />
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">{{ totalVehicles }}</span>
          <span class="stat-label">Total Kendaraan</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ availableCount }}</span>
          <span class="stat-label">Tersedia</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ rentedCount }}</span>
          <span class="stat-label">Disewa</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ occupancyRate }}%</span>
          <span class="stat-label">Okupansi</span>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-item">
          <label class="filter-label">Cari Kendaraan</label>
          <InputText
            v-model="globalFilter"
            placeholder="Cari nomor polisi, jenis, atau merek..."
            class="search-input"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">Tanggal Mulai</label>
          <DatePicker
            v-model="startDate"
            dateFormat="dd/mm/yy"
            placeholder="Pilih tanggal"
            showIcon
            class="date-input"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">Tanggal Selesai</label>
          <DatePicker
            v-model="endDate"
            dateFormat="dd/mm/yy"
            placeholder="Pilih tanggal"
            showIcon
            class="date-input"
          />
        </div>
        <div class="filter-actions">
          <Button
            label="Reset"
            icon="pi pi-refresh"
            @click="resetFilters"
            severity="secondary"
            outlined
          />
        </div>
      </div>
    </div>

    <!-- Vehicle Grid -->
    <div class="vehicles-section">
      <div class="section-header">
        <h2 class="section-title">
          Daftar Kendaraan
          <span class="vehicle-count">({{ filteredVehicles.length }})</span>
        </h2>
        <div class="header-actions">
          <Button
            label="Bagikan Hasil"
            icon="pi pi-share-alt"
            @click="shareFilteredResults"
            severity="info"
            outlined
            class="share-results-btn"
          />
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            @click="fetchData"
            :loading="loading"
            severity="info"
            outlined
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <ProgressSpinner class="loading-spinner" />
        <p class="loading-text">Memuat data kendaraan...</p>
      </div>

      <!-- Vehicle Cards -->
      <div v-else-if="filteredVehicles.length > 0" class="vehicle-grid">
        <div v-for="vehicle in filteredVehicles" :key="vehicle.id" class="vehicle-card">
          <!-- Vehicle Image -->
          <div class="vehicle-image-container">
            <img
              v-if="getVehicleImages(vehicle).length > 0"
              :src="getVehicleImages(vehicle)[getCurrentImageIndex(vehicle.id)]?.url"
              :alt="vehicle.desc"
              class="vehicle-image"
              @error="handleImageError"
            />
            <div v-else class="no-image">
              <i class="pi pi-image"></i>
              <span>No Image</span>
            </div>

            <!-- Status Badge -->
            <div class="status-badge" :class="getStatusClass(vehicle.status)">
              {{ vehicle.status || 'Tersedia' }}
            </div>

            <!-- Navigation for multiple images -->
            <div v-if="getVehicleImages(vehicle).length > 1" class="image-nav">
              <Button
                icon="pi pi-chevron-left"
                @click="previousImage(vehicle.id)"
                class="nav-btn"
                text
                rounded
              />
              <Button
                icon="pi pi-chevron-right"
                @click="nextImage(vehicle.id)"
                class="nav-btn"
                text
                rounded
              />
            </div>

            <!-- Image indicators -->
            <div v-if="getVehicleImages(vehicle).length > 1" class="image-indicators">
              <span
                v-for="(img, idx) in getVehicleImages(vehicle)"
                :key="idx"
                class="indicator"
                :class="{ active: idx === getCurrentImageIndex(vehicle.id) }"
                @click="setCurrentImage(vehicle.id, idx)"
              ></span>
            </div>
          </div>

          <!-- Vehicle Info -->
          <div class="vehicle-info">
            <!-- License Plate & Year -->
            <div class="vehicle-header">
              <h3 class="vehicle-plate">{{ vehicle.deskripsi }}</h3>
              <span class="vehicle-year">{{ vehicle.tahun_pembuatan }}</span>
            </div>

            <!-- Vehicle Type -->
            <div class="vehicle-type">
              <i class="pi pi-car"></i>

              <span>{{ vehicle.no_pol || 'Mobil' }}</span>
            </div>

            <!-- Vehicle Specs -->
            <div class="vehicle-specs">
              <div v-if="vehicle.type_transamisi" class="spec-item">
                <i class="pi pi-cog"></i>
                <span>{{ vehicle.type_transamisi }}</span>
              </div>
              <div v-if="vehicle.kapasitas" class="spec-item">
                <i class="pi pi-users"></i>
                <span>{{ vehicle.kapasitas }} seat</span>
              </div>
              <div v-if="vehicle.bahan_bakar" class="spec-item">
                <i class="pi pi-bolt"></i>
                <span>{{ vehicle.bahan_bakar }}</span>
              </div>
            </div>

            <!-- Price Packages -->
            <div v-if="vehicle.paket_harga?.length" class="price-packages">
              <h4 class="price-title">Paket Sewa</h4>
              <div class="price-grid">
                <div
                  v-for="(paket, idx) in vehicle.paket_harga"
                  :key="idx"
                  class="price-tag"
                  @click="selectPricePackage(vehicle.id, paket)"
                >
                  <div class="package-name">{{ paket.nama_paket }}</div>
                  <div class="package-price">{{ formatPrice(paket.harga) }}</div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="card-actions">
              <div class="action-group">
                <!-- Contact Info -->
                <div class="contact-info">
                  <Button
                    icon="pi pi-whatsapp"
                    class="p-button-success whatsapp-btn"
                    @click="contactWhatsApp(vehicle)"
                  />
                  <p>ID: {{ vehicle.id }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="pi pi-car empty-icon"></i>
        <h3 class="empty-title">Tidak ada kendaraan tersedia</h3>
        <p class="empty-description">Coba ubah filter pencarian atau pilih tanggal lain.</p>
        <Button label="Reset Filter" icon="pi pi-refresh" @click="resetFilters" class="reset-btn" />
      </div>
    </div>

    <!-- Share Dialog -->
    <Dialog
      v-model:visible="showShareDialog"
      header="Bagikan"
      :modal="true"
      :style="{ width: '450px' }"
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

        <!-- Share Title & Description -->
        <div v-if="shareData.title" class="share-preview">
          <h4 class="share-preview-title">{{ shareData.title }}</h4>
          <p class="share-preview-desc">{{ shareData.description }}</p>
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
        </div>
      </div>
    </Dialog>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router' // Add this import
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'

import Nav from '@/views/dashboard/NavHeaderView.vue'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const { id_client } = storeToRefs(authStore)

import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const vehicles = ref([])
const loading = ref(false)
const globalFilter = ref('')
const startDate = ref(new Date())
const endDate = ref(new Date())
const currentImageIndex = ref({})
const route = useRoute()
// Share functionality
const showShareDialog = ref(false)
const currentShareUrl = ref('')
const shareData = ref({
  title: '',
  description: '',
  type: 'page', // 'page', 'vehicle', 'results'
})

const contactWhatsApp = (dataUnit) => {
  const message = `Halo, Saya tertarik untuk merental ${dataUnit.value?.desc} (ID: ${dataUnit.value?.id})`
  const url = `https://wa.me/${company_profile.value.kontak_person}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

// Computed properties
const filteredVehicles = computed(() => {
  let filtered = vehicles.value
  if (globalFilter.value) {
    const query = globalFilter.value.toLowerCase()
    filtered = filtered.filter(
      (v) =>
        v.no_pol?.toLowerCase().includes(query) ||
        v.desc?.toLowerCase().includes(query) ||
        v.jenis?.toLowerCase().includes(query) ||
        v.status?.toLowerCase().includes(query),
    )
  }
  return filtered
})

const company_profile = ref(null)

const get_profile = async () => {
  try {
    const url = configStore.apiBaseUrl

    const param = {
      mode: 1,
      id_client: route.query.client_id,
    }

    const response = await axios.post(`${url}/v1/get_profile_company`, param)

    company_profile.value = response.data.response
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const totalVehicles = computed(() => vehicles.value.length)
const availableCount = computed(
  () => filteredVehicles.value.filter((v) => v.status === 'Tersedia').length,
)
const rentedCount = computed(
  () => filteredVehicles.value.filter((v) => v.status === 'Sedang Rental').length,
)
const occupancyRate = computed(() =>
  totalVehicles.value ? Math.round((rentedCount.value / totalVehicles.value) * 100) : 0,
)

// Helper functions
const getVehicleImages = (vehicle) => {
  return vehicle.reff_pic?.original && Array.isArray(vehicle.reff_pic.original)
    ? vehicle.reff_pic.original
    : []
}

const getCurrentImageIndex = (vehicleId) => currentImageIndex.value[vehicleId] || 0

const setCurrentImage = (vehicleId, index) => {
  currentImageIndex.value[vehicleId] = index
}

const nextImage = (vehicleId) => {
  const vehicle = vehicles.value.find((v) => v.id === vehicleId)
  const images = getVehicleImages(vehicle)
  if (images.length <= 1) return
  const current = getCurrentImageIndex(vehicleId)
  setCurrentImage(vehicleId, (current + 1) % images.length)
}

const previousImage = (vehicleId) => {
  const vehicle = vehicles.value.find((v) => v.id === vehicleId)
  const images = getVehicleImages(vehicle)
  if (images.length <= 1) return
  const current = getCurrentImageIndex(vehicleId)
  setCurrentImage(vehicleId, current === 0 ? images.length - 1 : current - 1)
}

const handleImageError = (event) => {
  event.target.src = '/placeholder-car.jpg'
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Tersedia':
      return 'status-available'
    case 'Sedang Rental':
      return 'status-rented'
    case 'Maintenance':
      return 'status-maintenance'
    default:
      return 'status-available'
  }
}

const formatPrice = (price) => {
  if (!price) return 'Rp 0'
  const numPrice = typeof price === 'string' ? parseInt(price.replace(/[^\d]/g, '')) : price
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numPrice)
}

// Share Functions
const generateShareUrl = (params = {}) => {
  const baseUrl = window.location.origin + window.location.pathname
  const urlParams = new URLSearchParams(window.location.search)

  // Add current filters to URL
  if (globalFilter.value) urlParams.set('search', globalFilter.value)
  if (startDate.value) urlParams.set('start_date', formatDate(startDate.value))
  if (endDate.value) urlParams.set('end_date', formatDate(endDate.value))
  urlParams.set('client_id', id_client.value)

  // Add additional params
  Object.entries(params).forEach(([key, value]) => {
    if (value) urlParams.set(key, value)
  })

  return urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl
}

const shareRentalPage = async () => {
  const url = generateShareUrl()
  const title = 'Rental Kendaraan Premium'
  const description = `Temukan ${totalVehicles.value} kendaraan berkualitas dengan ${availableCount.value} unit tersedia. Sewa sekarang dengan harga terjangkau!`

  await handleShare({
    url,
    title,
    description,
    type: 'page',
  })
}

const shareFilteredResults = async () => {
  const url = generateShareUrl()
  const title = `${filteredVehicles.value.length} Kendaraan Rental Tersedia`
  let description = `Lihat pilihan kendaraan rental kami`

  if (globalFilter.value) {
    description += ` untuk "${globalFilter.value}"`
  }

  if (startDate.value && endDate.value) {
    description += ` dari ${formatDateForDisplay(startDate.value)} - ${formatDateForDisplay(endDate.value)}`
  }

  description += `. ${availableCount.value} unit siap disewa!`

  await handleShare({
    url,
    title,
    description,
    type: 'results',
  })
}

const shareVehicle = async (vehicle) => {
  const url = generateShareUrl({ vehicle_id: vehicle.id })
  const title = `${vehicle.desc || 'Kendaraan'} - ${vehicle.no_pol}`
  let description = `${vehicle.desc || 'Kendaraan'} ${vehicle.tahun_pembuatan || ''} tersedia untuk disewa`

  if (vehicle.paket_harga?.length) {
    const minPrice = Math.min(
      ...vehicle.paket_harga.map((p) => parseInt(p.harga.toString().replace(/[^\d]/g, ''))),
    )
    description += ` mulai dari ${formatPrice(minPrice)}`
  }

  if (vehicle.status === 'Tersedia') {
    description += '. Pesan sekarang!'
  } else {
    description += '. Hubungi kami untuk informasi lebih lanjut.'
  }

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
  currentShareUrl.value = shareInfo.url

  // Try Web Share API first (mobile)
  if (navigator.share && shareInfo.type !== 'page') {
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

const shareViaEmail = () => {
  const subject = encodeURIComponent(shareData.value.title)
  const body = encodeURIComponent(
    `${shareData.value.description}\n\nKunjungi: ${currentShareUrl.value}`,
  )
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

// Action functions
const viewDetails = (vehicle) => {
  const idClient = route.params.id_client
  const url = `/DetailsShareView?idunit=${vehicle.id}&client_id=${idClient}`
  window.open(url, '_blank')
}

const bookVehicle = (vehicle) => {
  if (vehicle.status !== 'Tersedia') {
    toast.add({
      severity: 'warn',
      summary: 'Not Available',
      detail: `${vehicle.desc} is currently not available`,
      life: 3000,
    })
    return
  }

  toast.add({
    severity: 'success',
    summary: 'Booking Started',
    detail: `Processing booking for ${vehicle.desc}`,
    life: 4000,
  })
}

const selectPricePackage = (vehicleId, paket) => {
  toast.add({
    severity: 'info',
    summary: 'Package Selected',
    detail: `${paket.nama_paket} - ${formatPrice(paket.harga)}`,
    life: 2000,
  })
}

const resetFilters = () => {
  globalFilter.value = ''
  startDate.value = new Date()
  endDate.value = new Date()
  toast.add({
    severity: 'info',
    summary: 'Filters Reset',
    detail: 'All filters have been reset',
    life: 2000,
  })
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatDateForDisplay = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

const fetchData = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const idClient = route.params.id_client

    const url = configStore.apiBaseUrl

    const param = {
      start_date: formatDate(startDate.value),
      end_date: formatDate(endDate.value),
      id_client: idClient,
    }
    console.log('data', param)

    const response = await axios.post(`${url}/utilitas/dashboard_available`, param)
    vehicles.value = response.data.data || []

    // Initialize image carousel
    vehicles.value.forEach((vehicle) => {
      const images = getVehicleImages(vehicle)
      const coverIndex = images.findIndex((img) => img.is_cover === 1)
      currentImageIndex.value[vehicle.id] = coverIndex >= 0 ? coverIndex : 0
    })

    toast.add({
      severity: 'success',
      summary: 'Data Loaded',
      detail: `${vehicles.value.length} vehicles loaded successfully`,
      life: 3000,
    })
  } catch (error) {
    console.error('Error:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Failed',
      detail: 'Failed to load vehicle data',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  get_profile()
})
</script>

<style scoped>
.rental-container {
  padding-top: 0.5rem;
  padding-left: 6rem;
  padding-right: 6rem;
  margin: 0 auto;
  background: #fafbfc;
  min-height: 100vh;
}

.contact-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* Hero Section - Enhanced with share */
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(6, 182, 212, 0.3);
}

.hero-content {
  text-align: center;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.025em;
}

.hero-description {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.share-hero-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
}

.share-hero-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 5px;
  padding: 1.25rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-number {
  display: block;
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.85;
  font-weight: 500;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.search-input,
.date-input {
  height: 2.75rem;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.search-input:focus,
.date-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Vehicles Section - Enhanced header */
.vehicles-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.vehicle-count {
  color: #6b7280;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.share-results-btn {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #4f46e5 !important;
}

/* Vehicle Grid */
.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.vehicle-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.vehicle-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

/* Vehicle Image */
.vehicle-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: #f8fafc;
}

.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.vehicle-card:hover .vehicle-image {
  transform: scale(1.02);
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  background: #f8fafc;
}

.no-image i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Status Badge */
.status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0.25rem 0.75rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  backdrop-filter: blur(10px);
}

.status-available {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-rented {
  background: rgba(251, 36, 36, 0.9);
  color: white;
}

.status-maintenance {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

/* Image Navigation */
.image-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.vehicle-image-container:hover .image-nav {
  opacity: 1;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  width: 2rem;
  height: 2rem;
  border: none !important;
}

/* Image Indicators */
.image-indicators {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.375rem;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator.active {
  background: white;
  transform: scale(1.3);
}

/* Vehicle Info */
.vehicle-info {
  padding: 1.25rem;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.vehicle-plate {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fd6943;
  margin: 0;
  letter-spacing: 0.5px;
}

.vehicle-year {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
}

.vehicle-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #64748b;
  font-weight: 500;
  font-size: 0.875rem;
}

.vehicle-type i {
  color: #fd6943;
}

/* Vehicle Specs */
.vehicle-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #f8fafc;
  padding: 0.375rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #475569;
}

.spec-item i {
  color: #4f46e5;
  font-size: 0.75rem;
}

/* Price Packages */
.price-packages {
  margin-bottom: 1rem;
}

.price-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.price-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.price-tag {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.price-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.package-name {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.125rem;
  opacity: 0.9;
}

.package-price {
  display: block;
  font-weight: 700;
  font-size: 0.875rem;
}

/* Action Buttons - Enhanced with share */
.card-actions {
  display: flex;
  gap: 0.5rem;
}

.book-btn {
  flex: 1;
  height: 2.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  background: #6b7280 !important;
  border-color: #6b7280 !important;
}

.book-btn.available {
  background: #10b981 !important;
  border-color: #10b981 !important;
}

.book-btn:hover.available {
  background: #059669 !important;
  border-color: #059669 !important;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.detail-btn {
  height: 2.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0 1rem;
}

.share-btn {
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 1rem;
}

.share-preview-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.share-preview-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
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

.email-btn {
  background: #ea4335 !important;
  border-color: #ea4335 !important;
  color: white !important;
}

.email-btn:hover {
  background: #d23321 !important;
  border-color: #d23321 !important;
}

.sms-btn {
  background: #34d399 !important;
  border-color: #34d399 !important;
  color: white !important;
}

.sms-btn:hover {
  background: #10b981 !important;
  border-color: #10b981 !important;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1rem;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .rental-container {
    padding: 1rem;
  }

  .hero-title {
    font-size: 1.875rem;
  }

  .hero-section {
    padding: 1.5rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .vehicle-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-group {
    justify-content: space-between;
  }

  .vehicle-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .price-grid {
    flex-direction: column;
  }

  .price-tag {
    min-width: auto;
  }

  .social-share-grid {
    grid-template-columns: 1fr;
  }

  .share-dialog :deep(.p-dialog) {
    width: 95vw !important;
    max-width: 400px;
  }
}

/* PrimeVue Overrides */
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
