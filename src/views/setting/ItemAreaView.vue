<template>
  <div class="content">
    <!-- Header section with expected return date and sorting -->
    <div class="header-section">
      <div class="expected-return">
        <span class="label">Expected Return Date:</span>
        <div class="date-picker">
          <span>02/12/2019</span>
          <i class="pi pi-clock text-primary"></i>
        </div>
      </div>
      <div class="sort-section">
        <span>Sort by:</span>
        <Select
          v-model="selectedSort"
          :options="sortOptions"
          optionLabel="name"
          placeholder="Closest to me"
          class="sort-dropdown"
        />
      </div>
    </div>

    <!-- Lab options list -->
    <div class="lab-options">
      <div v-for="lab in labs" :key="lab.id" class="lab-card">
        <div class="lab-info">
          <div class="lab-icon">
            <i class="pi pi-map-marker text-danger"></i>
          </div>
          <div class="lab-details">
            <h3>{{ lab.name }}</h3>
            <div class="distance-info">
              <span>{{ lab.distance }}</span>
              <Button @click="toggleDetails(lab.id)" class="view-details-btn" link>
                View Details
                <i
                  :class="visibleDetails === lab.id ? 'pi pi-chevron-down' : 'pi pi-arrow-right'"
                ></i>
              </Button>
              <Button
                @click="removeLab(lab.id)"
                icon="pi pi-times"
                class="p-button-text text-red-500 ml-2"
              />
            </div>
          </div>
        </div>

        <div v-if="visibleDetails === lab.id" class="lab-details-section">
          <div class="lab-details-content">
            <h4>Lab Information</h4>
            <p>
              <strong>Address:</strong> {{ lab.address }}<br />
              <strong>Phone:</strong> {{ lab.phone }}<br />
              <strong>Business Hours:</strong> {{ lab.hours }}
            </p>
            <h4>Available Tests</h4>
            <ul>
              <li v-for="test in lab.tests" :key="test">{{ test }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification when a lab is selected -->
    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

// Import PrimeVue components
import Toast from 'primevue/toast'
import Select from 'primevue/select'

// Initialize toast service
const toast = useToast()

// Dropdown options
const sortOptions = ref([
  { name: 'Closest to me', code: 'closest' },
  { name: 'Price: Low to High', code: 'price_asc' },
  { name: 'Price: High to Low', code: 'price_desc' },
  { name: 'Fastest turnaround', code: 'fastest' },
])
const selectedSort = ref(sortOptions.value[0])

const labs = ref([
  {
    id: 'plymouth',
    name: 'Plymouth Meeting, Pennsylvania Testing Laboratory',
    distance: '60 miles',
    address: '555 Plymouth Road, Plymouth Meeting, PA 19462',
    phone: '(215) 555-1234',
    hours: 'Monday - Friday: 8:00 AM - 6:00 PM',
    tests: [
      'Complete Blood Count (CBC)',
      'Comprehensive Metabolic Panel (CMP)',
      'Lipid Panel',
      'Thyroid Function Tests',
      'Urinalysis',
    ],
  },
  {
    id: 'sanLeandro',
    name: 'San Leandro, California Testing Laboratory',
    distance: '60 miles',
    address: '1234 Marina Blvd, San Leandro, CA 94577',
    phone: '(510) 555-9876',
    hours: 'Monday - Friday: 7:00 AM - 5:00 PM',
    tests: [
      'Complete Blood Count (CBC)',
      'Comprehensive Metabolic Panel (CMP)',
      'Allergy Testing',
      'Hormone Testing',
      'Genetic Testing',
    ],
  },
  // ... add others
])

// Lab selection options
const plymouthOption = ref('1day')
const vegasOption = ref('2days')
const sanLeandroOption = ref('1day')
const bostonOption = ref('1day')
const portlandOption = ref('1day')

// Shipping option
const shippingOption = ref('standard')

// Track which lab details are visible
const visibleDetails = ref(null)

// Toggle details section for a lab
const toggleDetails = (labId) => {
  if (visibleDetails.value === labId) {
    visibleDetails.value = null
  } else {
    visibleDetails.value = labId
  }
}

// Expand lab (for arrow down button)
const expandLab = (labId) => {
  visibleDetails.value = labId
}

// Collapse lab (for arrow up button)
const collapseLab = (labId) => {
  visibleDetails.value = null
}

// Select a lab
const selectLab = (labId) => {
  toast.add({
    severity: 'success',
    summary: 'Lab Selected',
    detail: `You have selected the ${labId === 'vegas' ? 'Las Vegas' : labId} lab`,
    life: 3000,
  })
}
</script>

<style scoped>
.lab-selection-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.lab-details-section {
  transition: all 0.3s ease;
  animation: slideDown 0.3s ease;
  border-top: 1px solid #e0e0e0;
  background-color: #f8faff;
  padding: 15px 20px;
  margin-top: -1px;
}
.rotate-90 {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9e9e9;
  background-color: #ffffff;
  border-radius: 6px 6px 0 0;
}

.expected-return {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
}

.text-primary {
  color: #3b82f6;
}

.text-danger {
  color: #ef4444;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-dropdown {
  width: 180px;
}

.lab-options {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lab-card {
  background-color: #ffffff;
  border-bottom: 1px solid #e9e9e9;
  transition: all 0.3s ease;
}

.lab-card.selected {
  border: 1px solid #3b82f6;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
  margin: 10px 0;
  border-radius: 6px;
}

.lab-info {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  gap: 15px;
}

.lab-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f3f3f3;
  border-radius: 50%;
  color: #ef4444;
}

.lab-details h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.distance-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
  align-items: center;
}

.view-details-btn {
  color: #3b82f6 !important;
  font-size: 14px;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.turnaround-options {
  display: flex;
  padding: 10px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  gap: 10px;
  align-items: center;
}

.turnaround-label {
  font-size: 12px;
  color: #888;
  flex: 0 0 120px;
}

.time-options {
  display: flex;
  gap: 30px;
  flex: 1;
}

.time-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.time-option label {
  font-size: 14px;
  margin-top: 4px;
  cursor: pointer;
}

.price {
  font-size: 14px;
  font-weight: 500;
}

.action-button {
  flex: 0 0 40px;
}

/* Lab details section */
.lab-details-section {
  border-top: 1px solid #e0e0e0;
  background-color: #f8faff;
  padding: 15px 20px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lab-details-content h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.lab-details-content p {
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.lab-details-content ul {
  margin: 0;
  padding-left: 20px;
}

.lab-details-content li {
  margin-bottom: 5px;
}

.shipping-section {
  padding: 15px 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #e0e0e0;
  margin-top: 10px;
}

.shipping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.shipping-title {
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.fedex-logo {
  font-weight: bold;
  color: #4169e1;
}

.shipping-info p {
  color: #555;
  margin: 0 0 15px 0;
}

.shipping-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shipping-option {
  display: grid;
  grid-template-columns: 30px 1fr 1fr auto;
  gap: 10px;
  align-items: center;
}

.delivery-time {
  font-size: 14px;
  cursor: pointer;
}

.shipping-type {
  font-size: 14px;
  color: #555;
}

.shipping-price {
  font-weight: 500;
  justify-self: end;
}

.shipping-addresses {
  display: flex;
  margin-top: 20px;
  gap: 40px;
  font-size: 14px;
  color: #555;
}

.address-label {
  font-weight: 500;
  margin-right: 5px;
}

.choose-lab {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
