<template>
  <section class="content">
    <loading_overlay :is-loading="loading" message="Memuat data..." />

    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <i class="pi pi-star-fill header-icon"></i>
        <h1 class="header-title">Rating Customer</h1>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-input-group">
          <i class="pi pi-search search-icon"></i>
          <input
            v-model="costumerId"
            type="text"
            class="search-input"
            placeholder="Masukkan NIK untuk mencari customer..."
          />
          <button class="search-button" @click="fetchData">Cari</button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content" v-if="contact.name">
      <!-- Customer Profile Card -->
      <div class="profile-section">
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-wrapper">
              <img :src="contact.avatar" class="avatar" alt="Customer Avatar" />
            </div>
            <div class="profile-info">
              <h2 class="customer-name">{{ contact.name }}</h2>
              <p class="customer-details" v-if="contact.position && contact.company">
                {{ contact.position }} - {{ contact.company }}
              </p>

              <div class="rating-display">
                <star-rating
                  v-model:rating="rating"
                  :increment="0.5"
                  :max-rating="5"
                  inactive-color="#E5E7EB"
                  active-color="#F59E0B"
                  :star-size="20"
                  :show-rating="false"
                />
                <span class="rating-text">{{ rating.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <div class="contact-info">
            <div class="info-grid">
              <div class="info-item" v-if="contact.jenis_kelamin">
                <span class="info-label">Jenis Kelamin</span>
                <span class="info-value">{{ contact.jenis_kelamin }}</span>
              </div>
              <div class="info-item" v-if="contact.phone">
                <span class="info-label">Telepon</span>
                <span class="info-value">{{ contact.phone }}</span>
              </div>
              <div class="info-item full-width" v-if="contact.address.street">
                <span class="info-label">Alamat</span>
                <span class="info-value">
                  {{ contact.address.street }}
                  <span v-if="contact.address.city">, {{ contact.address.city }}</span>
                  <span v-if="contact.address.state">, {{ contact.address.state }}</span>
                </span>
              </div>
            </div>
          </div>
          <!-- Rating Summary -->
          <div class="rating-summary">
            <h4 class="summary-title">Ringkasan Rating</h4>
            <div class="rating-breakdown">
              <div v-for="star in 5" :key="star" class="rating-row">
                <div class="star-label">
                  <span class="star-number">{{ star }}</span>
                  <i class="pi pi-star-fill star-icon"></i>
                </div>
                <div class="rating-bar">
                  <div
                    class="rating-fill"
                    :style="{ width: getRatingPercentage(star) + '%' }"
                  ></div>
                </div>
                <span class="rating-count">{{ getRatingCount(star) }}</span>
              </div>
            </div>
            <div class="total-reviews">
              Total: {{ getTotalReviews() }} review{{ getTotalReviews() !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Section -->
      <div class="timeline-section">
        <div class="timeline-header">
          <h3 class="timeline-title">
            <i class="pi pi-history"></i>
            Riwayat Rating
          </h3>
        </div>

        <div class="timeline-content">
          <div v-for="(month, monthIndex) in timeline" :key="monthIndex" class="month-group">
            <div class="month-header" v-if="month.name">
              <span class="month-name">{{ month.name }}</span>
            </div>

            <div class="events-list">
              <div v-for="(event, eventIndex) in month.events" :key="eventIndex" class="event-item">
                <div class="event-date">
                  <span class="date">{{ event.date }}</span>
                </div>

                <div class="event-content">
                  <div class="event-header">
                    <div class="company-info">
                      <span class="company-name">{{ event.perusahaan }}</span>
                      <span class="company-address" v-if="event.alamat">{{ event.alamat }}</span>
                    </div>
                    <div class="event-rating">
                      <star-rating
                        v-model:rating="event.rating"
                        :increment="0.5"
                        :max-rating="5"
                        inactive-color="#E5E7EB"
                        active-color="#F59E0B"
                        :star-size="16"
                        :show-rating="false"
                        :read-only="true"
                      />
                    </div>
                  </div>

                  <div class="event-comment" v-if="event.coment">
                    {{ event.coment }}
                  </div>
                </div>
              </div>

              <div v-if="month.events.length === 0" class="empty-state">
                <i class="pi pi-calendar-times empty-icon"></i>
                <p class="empty-text">Tidak ada riwayat untuk bulan ini</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-customer-state">
      <div class="empty-content">
        <i class="pi pi-user-plus empty-customer-icon"></i>
        <h3 class="empty-title">Cari Customer</h3>
        <p class="empty-description">
          Masukkan NIK customer untuk melihat profil dan riwayat rating
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, toRaw } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import StarRating from 'vue-star-rating'

const configStore = useConfigStore()
const loading = ref(false)
const rating = ref(4.5)
const costumerId = ref(null)

const form = ref({
  nik: '',
  mode: 2,
})

const customers = ref([])

const timeline = ref([
  {
    name: '',
    events: [
      {
        date: '',
        type: '',
        status: '',
        title: '',
        time: '',
        alamat: '',
        perusahaan: '',
        rating: 0,
        coment: '',
        created_at: '',
      },
    ],
  },
])

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    form.value.mode = 2
    form.value.nik = costumerId.value
    const rawForm = toRaw(form.value)
    console.log(rawForm)
    const response = await axios.post(`${url}/getCusomer`, rawForm)

    if (response.data.code == 200) {
      customers.value = [...response.data.response]
      get_customer_history()
      const data = customers.value[0]
      contact.value.name = data['nama']
      contact.value.jenis_kelamin = data['jenis_kelamin']
      contact.value.phone = data['no_hp']
      contact.value.address.street = data['alamat']
    } else {
      resetContact()
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

const get_customer_history = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    form.value.nik = costumerId.value
    const rawForm = toRaw(form.value)
    console.log(rawForm)
    const response = await axios.post(`${url}/v1/get_histori_customer`, rawForm)
    console.log(response.data)
    timeline.value = response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

const contact = ref({
  avatar: 'https://cbx-prod.b-cdn.net/COLOURBOX30527018.jpg?width=800&height=800&quality=70',
  name: null,
  position: null,
  company: null,
  rating: 0,
  likes: 0,
  jenis_kelamin: null,
  phone: null,
  address: {
    street: null,
    city: null,
    state: null,
    zipCode: null,
    country: null,
  },
  social: {
    facebook: 'facebook.com/claudiamills',
  },
  personalPhone: '+919533480564',
})

const resetContact = () => {
  contact.value = {
    avatar: 'https://cbx-prod.b-cdn.net/COLOURBOX30527018.jpg?width=800&height=800&quality=70',
    name: null,
    position: null,
    company: null,
    rating: 0,
    likes: 0,
    email: null,
    phone: null,
    address: {
      street: null,
      city: null,
      state: null,
      zipCode: null,
      country: null,
    },
    social: {
      facebook: 'facebook.com/claudiamills',
    },
    personalPhone: '+919533480564',
  }
}

// Rating summary methods
const getRatingCount = (star) => {
  let count = 0
  timeline.value.forEach((month) => {
    month.events.forEach((event) => {
      if (Math.floor(event.rating) === star) {
        count++
      }
    })
  })
  return count
}

const getTotalReviews = () => {
  let total = 0
  timeline.value.forEach((month) => {
    total += month.events.length
  })
  return total
}

const getRatingPercentage = (star) => {
  const count = getRatingCount(star)
  const total = getTotalReviews()
  return total > 0 ? (count / total) * 100 : 0
}
</script>

<style scoped>
/* Base Styles */
.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 32px;
  color: #f59e0b;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Search Section */
.search-section {
  margin-bottom: 32px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-group {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 4px;
  transition: border-color 0.2s ease;
}

.search-input-group:focus-within {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.search-icon {
  color: #9ca3af;
  margin-left: 16px;
  font-size: 18px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 16px;
  font-size: 16px;
  color: #1f2937;
  background: transparent;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-button {
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background: #d97706;
}

/* Main Content */
.main-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
  align-items: start;
}

/* Profile Section */
.profile-section {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.profile-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.profile-header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.avatar-wrapper {
  margin-bottom: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f59e0b;
}

.customer-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.customer-details {
  color: #6b7280;
  margin: 0 0 16px 0;
  font-size: 14px;
}

.rating-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.rating-text {
  font-weight: 600;
  color: #f59e0b;
  font-size: 18px;
}

.contact-info {
  padding: 24px;
}

/* Rating Summary */
.rating-summary {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.star-label {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 40px;
  flex-shrink: 0;
}

.star-number {
  font-weight: 500;
  color: #374151;
}

.star-icon {
  color: #f59e0b;
  font-size: 12px;
}

.rating-bar {
  flex: 1;
  height: 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.rating-count {
  font-weight: 500;
  color: #6b7280;
  width: 30px;
  text-align: right;
  flex-shrink: 0;
}

.total-reviews {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.contact-info {
  padding: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

/* Timeline Section */
.timeline-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.timeline-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.timeline-content {
  padding: 24px;
}

.month-group {
  margin-bottom: 32px;
}

.month-group:last-child {
  margin-bottom: 0;
}

.month-header {
  margin-bottom: 16px;
}

.month-name {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 20px;
  display: inline-block;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.event-item:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.event-date {
  flex-shrink: 0;
  width: 80px;
}

.date {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.event-content {
  flex: 1;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.company-info {
  flex: 1;
}

.company-name {
  font-weight: 600;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.company-address {
  font-size: 12px;
  color: #6b7280;
}

.event-rating {
  flex-shrink: 0;
}

.event-comment {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.empty-text {
  margin: 0;
  font-size: 14px;
}

.empty-customer-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-customer-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #374151;
  margin: 0 0 12px 0;
}

.empty-description {
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .profile-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }

  .header-title {
    font-size: 24px;
  }

  .search-input-group {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }

  .search-button {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .event-item {
    flex-direction: column;
    gap: 12px;
  }

  .event-date {
    width: auto;
  }

  .event-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
