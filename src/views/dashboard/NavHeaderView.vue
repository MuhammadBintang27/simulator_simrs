<template>
  <div class="navbar-header">
    <div class="navbar-container">
      <!-- Logo -->

      <div class="logo-section">
        <span class="logo-text">{{ company_profile?.perusahaan }}</span>
      </div>

      <!-- Right Section -->
      <div class="right-section">
        <!-- User Account Dropdown -->
        <Select
          v-model="selectedAccount"
          :options="[]"
          optionLabel="name"
          placeholder="Akun"
          class="account-dropdown"
        >
          <template #value="slotProps">
            <div class="account-value" v-if="slotProps.value">
              <i class="pi pi-user"></i>
              <span>{{ slotProps.value.name }}</span>
            </div>
            <div class="account-placeholder" v-else>
              <i class="pi pi-user"></i>
              <span>Akun</span>
            </div>
          </template>
          <template #option="slotProps">
            <div class="account-option">
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Select>

        <!-- Contact Info -->
        <div class="contact-info">
          <span class="contact-label">HUBUNGI KAMI</span>
          <span class="contact-number">{{ company_profile?.kontak_person }} </span>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click="toggleMobileMenu">
      <div class="mobile-menu-content" @click.stop>
        <div class="mobile-menu-header">
          <span class="mobile-menu-title">Menu</span>
          <Button
            @click="toggleMobileMenu"
            icon="pi pi-times"
            text
            severity="secondary"
            class="close-btn"
          />
        </div>

        <div class="mobile-menu-items">
          <Button
            label="Beli Mobil"
            class="mobile-nav-button"
            text
            severity="secondary"
            @click="toggleMobileMenu"
          />
          <Button
            label="Jual Mobil"
            class="mobile-nav-button"
            text
            severity="secondary"
            @click="toggleMobileMenu"
          />
          <Button
            label="Carro Certified"
            class="mobile-nav-button"
            text
            severity="secondary"
            @click="toggleMobileMenu"
          />

          <div class="mobile-dropdown-section">
            <Select
              v-model="selectedOption"
              :options="lainnyaOptions"
              optionLabel="name"
              placeholder="Lainnya"
              class="mobile-dropdown"
            />
          </div>

          <div class="mobile-account-section">
            <Select
              v-model="selectedAccount"
              :options="accountOptions"
              optionLabel="name"
              placeholder="Akun"
              class="mobile-dropdown"
            >
              <template #value="slotProps">
                <div class="account-value" v-if="slotProps.value">
                  <i class="pi pi-user"></i>
                  <span>{{ slotProps.value.name }}</span>
                </div>
                <div class="account-placeholder" v-else>
                  <i class="pi pi-user"></i>
                  <span>Akun</span>
                </div>
              </template>
            </Select>
          </div>

          <div class="mobile-contact-info">
            <span class="contact-label">HUBUNGI KAMI</span>
            <span class="contact-number">021-50996789</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'

import Button from 'primevue/button'
import Select from 'primevue/dropdown'

import { useRoute } from 'vue-router'

const route = useRoute()

import { useConfigStore } from '@/stores/config'
const configStore = useConfigStore()

import axios from 'axios'

// Reactive data
const selectedOption = ref(null)
const selectedAccount = ref(null)
const mobileMenuOpen = ref(false)

// Methods
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
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
onBeforeMount(() => {
  get_profile()
})

onMounted(() => {})
</script>

<style scoped>
.navbar-header {
  background: linear-gradient(135deg, #fff9f9 0%, rgb(255, 243, 230) 50%, #eafdfc 100%);
  border-bottom: 1px solid #fed7c7;
  padding: 0;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
}

.logo-section {
  flex-shrink: 0;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b35;
  letter-spacing: 1px;
}

.navigation-menu {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  margin-left: 60px;
}

.nav-button {
  font-weight: 500;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-button:hover {
  background-color: #f3f4f6;
  color: #ff6b35;
}

.lainnya-dropdown {
  min-width: 120px;
}

.mobile-menu-button {
  display: none;
}

.burger-btn {
  padding: 8px;
  color: #374151;
}

.burger-btn:hover {
  color: #ff6b35;
  background-color: #f3f4f6;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.account-dropdown {
  min-width: 100px;
}

.account-value,
.account-placeholder {
  display: flex;
  align-items: center;
  gap: 6px;
}

.account-option {
  padding: 4px 0;
}

.language-dropdown {
  min-width: 60px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 16px;
}

.contact-label {
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.contact-number {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

/* Mobile Menu Styles */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  backdrop-filter: blur(4px);
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background: linear-gradient(180deg, #d1ffd5 0%, #ffc891 100%);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #fed7c7;
}

.mobile-menu-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  padding: 8px;
  color: #6b7280;
}

.close-btn:hover {
  color: #ff6b35;
  background-color: #f3f4f6;
}

.mobile-menu-items {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-nav-button {
  justify-content: flex-start;
  padding: 12px 16px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: 100%;
}

.mobile-nav-button:hover {
  background-color: #f3f4f6;
  color: #ff6b35;
}

.mobile-dropdown-section,
.mobile-account-section {
  margin-top: 8px;
}

.mobile-dropdown {
  width: 100%;
}

.mobile-contact-info {
  margin-top: 24px;
  padding: 16px;
  background-color: rgba(255, 107, 53, 0.05);
  border-radius: 8px;
  text-align: center;
}

.mobile-contact-info .contact-label {
  display: block;
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.mobile-contact-info .contact-number {
  font-size: 16px;
  color: #ff6b35;
  font-weight: 600;
}
@media (max-width: 1024px) {
  .navigation-menu {
    margin-left: 30px;
    gap: 16px;
  }

  .contact-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 10px 16px;
  }

  .navigation-menu {
    display: none;
  }

  .right-section {
    gap: 12px;
  }
}

/* Custom PrimeVue overrides */
:deep(.p-dropdown) {
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

:deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: #ff6b35;
}

:deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #ff6b35;
  box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
}

:deep(.p-button.p-button-text) {
  border: none;
}

:deep(.p-button.p-button-text:enabled:hover) {
  background: #f3f4f6;
  color: #ff6b35;
}
</style>
