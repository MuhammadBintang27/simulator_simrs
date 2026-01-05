<template>
  <Nav></Nav>
  <div class="car-rental-container">
    <!-- Header -->
    <div class="breadcrumb-nav">
      <span class="nav-item">Home</span>
      <span class="separator">></span>
      <span class="nav-item">Dashboard</span>
      <span class="separator">></span>
      <span class="nav-item active">{{ dataUnit?.desc }}</span>
    </div>

    <div class="main-content">
      <!-- Car Image Section -->
      <div class="car-section">
        <div class="car-galleria-container">
          <Galleria
            v-model:activeIndex="activeImageIndex"
            :value="dataUnit?.reff_pic?.original"
            :responsiveOptions="responsiveOptions"
            :numVisible="6"
            :circular="true"
            :autoPlay="false"
            :showThumbnails="true"
            :showIndicators="false"
            :showItemNavigators="true"
            :showThumbnailNavigators="false"
            :fullScreen="displayFullscreen"
            class="car-galleria"
          >
            <template #item="slotProps">
              <div class="galleria-item card flex justify-left">
                <Image :src="slotProps.item.url" :alt="slotProps.item.car_id" preview />
                <!-- Action Buttons Overlay -->
                <div class="action-buttons-overlay">
                  <Button
                    icon="pi pi-arrow-right"
                    class="p-button-rounded p-button-sm next-image-btn"
                    @click="nextImage"
                    label="Next Image"
                  />
                </div>
              </div>
            </template>

            <template #thumbnail="slotProps">
              <div class="galleria-thumbnail">
                <img
                  :src="slotProps.item.url"
                  :alt="slotProps.item.car_id"
                  class="thumbnail-image"
                />
              </div>
            </template>
          </Galleria>

          <!-- Custom Next Image Button (outside gallery) -->
          <div class="custom-controls">
            <Button
              icon="pi pi-arrow-right"
              class="p-button-outlined next-btn-custom"
              @click="nextImage"
              label="Next Image"
            />
            <span class="image-counter"
              >{{ activeImageIndex + 1 }} / {{ dataUnit?.reff_pic?.original.length }}</span
            >
          </div>
        </div>
      </div>

      <!-- Rental Form Section -->
      <div class="rental-section">
        <div class="price-section">
          <!-- Price Packages -->
          <div v-if="PaketHarga?.length" class="price-packages">
            <h4 class="price-title">PAKET SEWA</h4>
            <div class="price-grid">
              <div v-for="(paket, idx) in PaketHarga" :key="idx" class="price-tag">
                <div class="package-name">{{ paket.nama_paket }}</div>
                <div class="package-price">Rp.{{ formatPrice(paket.harga) }}</div>
              </div>
            </div>
          </div>
          <div class="original-price">
            {{ formatPrice(originalPrice) }} <span class="discount">-Rp10Jt</span>
          </div>
          <div class="monthly-info">Monthly rate Rp{{ formatPrice(monthlyRate) }}/month</div>
          <div class="certified-badge">linkrental Certified</div>
        </div>

        <div class="car-info">
          <h2 class="car-title">{{ dataUnit?.desc }}</h2>
          <div class="car-specs">
            <div class="spec-item">
              <i class="pi pi-gauge"></i>
              <span>{{ dataUnit?.no_pol }}</span>
            </div>
            <div class="spec-item">
              <i class="pi pi-cog"></i>
              <span>{{ dataUnit?.type_transamisi }}</span>
            </div>
            <div class="spec-item">
              <i class="pi pi-calendar"></i>
              <span>{{ dataUnit?.tahun_pembuatan }}</span>
            </div>
          </div>
          <div class="location">
            <i class="pi pi-map-canvas"></i>
            <span>{{ dataUnit?.warna }}</span>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="contact-info">
          <Button
            icon="pi pi-whatsapp"
            class="p-button-success whatsapp-btn"
            @click="contactWhatsApp"
          />
          <p>ID: {{ carDetails.id }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'

import Nav from '@/views/dashboard/NavHeaderView.vue'

import Galleria from 'primevue/galleria'
import Image from 'primevue/image'

import { useRoute } from 'vue-router'

const route = useRoute()

import { useConfigStore } from '@/stores/config'
const configStore = useConfigStore()

import axios from 'axios'
// Get query parameters directly
const idunit = ref(route.query.idunit) // "56"
const clientId = ref(route.query.client_id) // "1"

const loading = ref(false)

const dataUnit = ref(null)

const PaketHarga = ref([])
// API calls
const fetchData = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const param = {
      unit_id: route.query.idunit,
      id_client: route.query.client_id,
      mode: 2,
    }

    const response = await axios.post(`${url}/v1/get_master_unit`, param)
    dataUnit.value = response.data.response[0]
    PaketHarga.value = response.data.response[0].paket_harga.response
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

// Car data
const carDetails = ref({
  name: 'Daihatsu Terios R AT 2021 Silver',
  mileage: '43,450',
  transmission: 'Automatic',
  year: '2021',
  location: 'CARRO Square',
  id: 'R906R80741',
})

// Pricing
const originalPrice = ref(214000)
const monthlyRate = ref(4140200)

// Fullscreen state
const displayFullscreen = ref(false)

const activeImageIndex = ref(0)

// Galleria responsive options
const responsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 5,
  },
  {
    breakpoint: '768px',
    numVisible: 3,
  },
  {
    breakpoint: '560px',
    numVisible: 1,
  },
])

// New method to navigate to next image
const nextImage = () => {
  if (activeImageIndex.value < dataUnit.value?.reff_pic?.original.length - 1) {
    activeImageIndex.value++
  } else {
    // Loop back to first image if at the end
    activeImageIndex.value = 0
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const contactWhatsApp = () => {
  const message = `Halo, Saya tertarik untuk merental ${dataUnit.value?.desc} (ID: ${dataUnit.value?.id})`
  const url = `https://wa.me/${company_profile.value.kontak_person}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

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

onMounted(() => {
  get_profile()
  fetchData()
})
</script>

<style scoped>
.car-rental-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.nav-item {
  color: #666;
  text-decoration: none;
  cursor: pointer;
}

.nav-item.active {
  color: #333;
  font-weight: 600;
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

.separator {
  margin: 0 8px;
  color: #999;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 400px;
}

/* Car Section with Galleria */
.car-section {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.car-galleria-container {
  padding: 20px;
}

.car-galleria {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 12px;
  overflow: hidden;
}

.galleria-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  min-height: 400px;
}

.galleria-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.action-buttons-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.galleria-item:hover .action-buttons-overlay {
  opacity: 1;
}

.action-buttons-overlay .p-button {
  border-radius: 25px;
  padding: 6px 12px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #333;
  backdrop-filter: blur(10px);
}

.action-buttons-overlay .p-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Custom controls outside gallery */
.custom-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
  padding: 0 10px;
}

.next-btn-custom {
  border-color: #ff6b35;
  color: #ff6b35;
}

.next-btn-custom:hover {
  background: #ff6b35;
  color: white;
}

.image-counter {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.galleria-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.galleria-thumbnail:hover {
  border-color: #ff6b35;
}

.thumbnail-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
}

/* Override PrimeVue Galleria styles */
:deep(.p-galleria-item-wrapper) {
  background: transparent;
}

:deep(.p-galleria-item-container) {
  background: transparent;
}

:deep(.p-galleria-thumbnails) {
  background: white;
  padding: 15px;
  border-radius: 0 0 12px 12px;
}

:deep(.p-galleria-thumbnail-item) {
  margin: 0 4px;
}

:deep(.p-galleria-thumbnail-item.p-galleria-thumbnail-item-current .galleria-thumbnail) {
  border-color: #ff6b35;
}

:deep(.p-galleria-item-nav) {
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: 0 15px;
  backdrop-filter: blur(10px);
}

:deep(.p-galleria-item-nav:hover) {
  background: rgba(255, 255, 255, 0.95);
}

/* Fullscreen Galleria Styles */
:deep(.p-galleria-fullscreen) {
  z-index: 1200;
}

:deep(.p-galleria-fullscreen .p-galleria-item-wrapper) {
  background: rgba(0, 0, 0, 0.9);
}

:deep(.p-galleria-fullscreen .galleria-image) {
  max-height: 90vh;
  max-width: 90vw;
}

/* Rental Section */
.rental-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.price-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.current-price {
  font-size: 32px;
  font-weight: bold;
  color: #ff6b35;
  margin-bottom: 5px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 5px;
}

.discount {
  color: #ff6b35;
  font-weight: 600;
  text-decoration: none;
}

.monthly-info {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.certified-badge {
  display: inline-block;
  background: #ff6b35;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.car-info {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.car-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.car-specs {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

/* Rental Form */
.rental-form-card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.rental-form h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.date-range,
.time-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.p-inputtext,
.p-dropdown,
.p-calendar {
  width: 100%;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item label {
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.total-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.cost-item.total {
  font-weight: bold;
  font-size: 16px;
  color: #ff6b35;
}

.action-buttons-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.book-btn {
  background: #ff6b35;
  border: none;
}

.quote-btn {
  border-color: #ff6b35;
  color: #ff6b35;
}

.contact-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.contact-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.whatsapp-btn {
  border-radius: 50%;
  width: 45px;
  height: 45px;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .date-range,
  .time-range {
    grid-template-columns: 1fr;
  }

  .car-specs {
    flex-direction: column;
    gap: 10px;
  }

  .action-buttons-overlay {
    position: static;
    transform: none;
    justify-content: center;
    margin-top: 20px;
    opacity: 1;
  }

  .custom-controls {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}
</style>
