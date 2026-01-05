<template>
  <aside class="main-sidebar sidebar-dark-primary elevation-2">
    <!-- Brand Logo -->
    <a href="/" class="brand-link custom-brand">
      <img
        :src="LINK_LOGO"
        alt="Link Rental Logo"
        class="brand-image img-circle elevation-3"
        style="opacity: 0.9"
      />
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
      <!-- Search Form -->
      <div class="form-inline mb-3 position-relative">
        <div class="input-group" data-widget="sidebar-search">
          <input
            v-model="searchQuery"
            @input="filterMenu"
            @focus="showSearchResults = true"
            @blur="hideSearchResults"
            class="form-control form-control-sidebar"
            type="search"
            placeholder="Search menu..."
            aria-label="Search"
            style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2)"
          />
          <div class="input-group-append">
            <button
              @click="clearSearch"
              class="btn btn-sidebar"
              style="background: rgba(255, 255, 255, 0.1)"
            >
              <i class="fas" :class="searchQuery ? 'fa-times' : 'fa-search'"></i>
            </button>
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="showSearchResults && filteredMenuItems.length > 0" class="search-results">
          <div class="search-results-header">
            <small class="text-muted">Found {{ filteredMenuItems.length }} result(s)</small>
          </div>
          <div class="search-results-list">
            <div
              v-for="item in filteredMenuItems"
              :key="item.path"
              class="search-result-item"
              @click="navigateToItem(item)"
            >
              <i :class="item.icon" class="search-result-icon"></i>
              <div class="search-result-content">
                <div class="search-result-title">{{ item.title }}</div>
                <div class="search-result-path">{{ item.category }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div
          v-if="showSearchResults && searchQuery && filteredMenuItems.length === 0"
          class="search-results"
        >
          <div class="search-no-results">
            <i class="fas fa-search text-muted"></i>
            <p class="text-muted mb-0">No menu items found</p>
            <small class="text-muted">Try different keywords</small>
          </div>
        </div>
      </div>

      <!-- Sidebar Menu -->
      <nav class="mt-2">
        <ul
          class="nav nav-pills nav-sidebar flex-column nav-child-indent nav-collapse-hide-child"
          data-widget="treeview"
          role="menu"
          data-accordion="false"
        >
          <!-- Main Menu Items Loop -->
          <template v-for="menuItem in mainMenuItems_real" :key="menuItem.id">
            <!-- Single Item (No Children) -->
            <li v-if="!menuItem.children" class="nav-item">
              <router-link :to="menuItem.path" class="nav-link">
                <i class="nav-icon" :class="menuItem.icon"></i>
                <p>{{ menuItem.title }}</p>
              </router-link>
            </li>
            <!-- Item with Children -->
            <li v-else class="nav-item menu-is-opening menu-open">
              <a href="#" class="nav-link">
                <i class="nav-icon" :class="menuItem.icon"></i>
                <p>
                  {{ menuItem.title }}
                  <i class="right fas fa-angle-left"></i>
                </p>
              </a>
              <ul class="nav nav-treeview">
                <li v-for="child in menuItem.children" :key="child.id" class="nav-item">
                  <router-link :to="child.path" class="nav-link">
                    <i class="nav-icon" :class="child.icon"></i>
                    <p>{{ child.title }}</p>
                    <span v-if="child.badge" class="badge" :class="child.badgeClass">
                      {{ child.badge }}
                    </span>
                  </router-link>
                </li>
              </ul>
            </li>
          </template>
          <!-- Quick Access Section -->
          <li class="nav-header">QUICK ACCESS</li>

          <!-- Quick Access Items Loop -->
          <li v-for="quickItem in quickAccessItems" :key="quickItem.id" class="nav-item">
            <component
              :is="quickItem.isLogout ? 'a' : 'router-link'"
              :to="!quickItem.isLogout ? quickItem.path : undefined"
              :href="quickItem.isLogout ? '#' : undefined"
              class="nav-link"
              @click="quickItem.isLogout ? logout : undefined"
            >
              <i class="nav-icon" :class="quickItem.icon"></i>
              <p>
                {{ quickItem.title }}
                <span v-if="quickItem.badge" class="badge" :class="quickItem.badgeClass">
                  {{ quickItem.badge }}
                </span>
              </p>
            </component>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const router = useRouter()
const { LINK_LOGO } = storeToRefs(authStore)

const searchQuery = ref('')
const showSearchResults = ref(false)
const filteredMenuItems = ref([])

const useFavicon = () => {
  /**
   * Ganti favicon secara dinamis
   * @param {string|null} url - URL icon baru, atau null untuk fallback
   */
  const setFavicon = (url = null) => {
    const faviconId = ''
    let faviconEl = '' //document.getElementById(faviconId)

    // Ambil dari localStorage jika URL tidak diberikan
    const storedIcon = localStorage.getItem('app_icon_url')
    const iconUrl = url || storedIcon

    if (faviconEl) {
      faviconEl.href = iconUrl
    } else {
      faviconEl = document.createElement('link')
      faviconEl.id = faviconId
      faviconEl.rel = 'icon'
      faviconEl.type = 'image/png'
      faviconEl.href = iconUrl
      document.head.appendChild(faviconEl)
    }
  }
  return {
    setFavicon,
  }
}
// Main Menu Structure
const mainMenuItems = ref([
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard/dashboardUnitView',
    icon: 'fas fa-chart-line',
    children: null,
  },
  {
    id: 'pendaftaran',
    title: 'Pendaftaran',
    icon: 'fas fa-clipboard-list',
    children: [
      {
        id: 'pendaftaran-pasien',
        title: 'Pendaftaran Pasien',
        path: '/pendaftaran',
        icon: 'fas fa-user-plus',
      },
    ],
  },
  {
    id: 'poliklinik',
    title: 'Poliklinik',
    icon: 'fas fa-hospital',
    children: [
      {
        id: 'data-rawat-pasien',
        title: 'Data rawat pasien',
        path: '/ListPasien',
        icon: 'fas fa-bed',
      },
    ],
  },
  {
    id: 'gizi',
    title: 'Gizi',
    icon: 'fas fa-apple-alt',
    children: [
      {
        id: 'assesmen-gizi',
        title: 'Assesmen Gizi',
        path: '/gizi/list-assesment-gizi',
        icon: 'fas fa-clipboard-check',
      },
      {
        id: 'pendataan-diet-pasien',
        title: 'Pendataan Diet Pasien',
        path: '/gizi/pendataan-diet-pasien',
        icon: 'fas fa-file-medical',
      },
      {
        id: 'diet-pasien',
        title: 'Diet Pasien',
        path: '/gizi/diet-pasien',
        icon: 'fas fa-utensils',
      },
    ],
  },
  {
    id: 'ruang-operasi',
    title: 'Ruang Operasi',
    icon: 'fas fa-procedures',
    children: [
      {
        id: 'daftar-pasien-op',
        title: 'Daftar Pasien Op',
        path: '/operasi/data-pasien-op',
        icon: 'fas fa-user-injured',
      },
    ],
  },
  {
    id: 'apotek-online',
    title: 'Apotek Online (BPJS)',
    icon: 'fas fa-pills',
    children: [
      {
        id: 'referensi',
        title: 'Referensi',
        path: '/apotik-online/referensi',
        icon: 'fas fa-book-medical',
      },
      {
        id: 'peresepan',
        title: 'Peresapan',
        path: '/apotik-online/peresepan',
        icon: 'fas fa-prescription',
      },
      {
        id: 'monitoring-klaim',
        title: 'Monitoring',
        path: '/apotik-online/monitoring-klaim',
        icon: 'fas fa-chart-bar',
      },
    ],
  },
  {
    id: 'statistik',
    title: 'Statistik',
    icon: 'fas fa-chart-pie',
    children: [
      {
        id: 'data-kunjungan',
        title: 'Data Kunjungan',
        path: '/statistik/data-kunjungan',
        icon: 'fas fa-users',
      },
    ],
  },

  {
    id: 'manajemenklaim',
    title: 'Keuangan',
    icon: 'fas fa-coins', // lebih cocok untuk keuangan
    children: [
      {
        id: 'data-kunjungan',
        title: 'Klaim manajemen',
        path: '/keuangan/klaim-manajemen',
        icon: 'fas fa-file-invoice-dollar', // ikon klaim atau invoice
      },
      {
        id: 'asir',
        title: 'Kasir',
        path: '/keuangan/kasir',
        icon: 'fas fa-money-bill-wave',
      },
    ],
  },
])

const mainMenuItems_real = ref([])
const LoadMenu = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/get_menu_item/${user_id.value}/${id_client.value}`,
    ) // ✅ Cleaner syntax

    // console.log('Menu items fetched:', response.data)
    mainMenuItems_real.value = response.data || []
  } catch (error) {
    // console.error('Error fetching data:', error)
  }
}

// Quick Access Items
const quickAccessItems = ref([
  {
    id: 'home',
    title: 'Home',
    path: '/',
    icon: 'fas fa-home text-info',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    path: '/Setting/Notification',
    icon: 'fas fa-bell text-success',
    badge: '3',
    badgeClass: 'badge-danger right',
  },
  {
    id: 'help',
    title: 'Help & Support',
    path: '/help',
    icon: 'fas fa-question-circle text-primary',
  },
  {
    id: 'logout',
    title: 'Logout',
    icon: 'fas fa-sign-out-alt text-danger',
    isLogout: true,
  },
])

// Flatten menu items for search
const getAllMenuItems = () => {
  const items = []
  console.log('panggil menu', mainMenuItems_real.value)

  mainMenuItems_real.value.forEach((menu) => {
    if (menu.children) {
      menu.children.forEach((child) => {
        items.push({
          title: child.title,
          path: child.path,
          icon: child.icon,
          category: menu.title,
        })
      })
    } else {
      items.push({
        title: menu.title,
        path: menu.path,
        icon: menu.icon,
        category: 'Main',
      })
    }
  })

  quickAccessItems.value.forEach((item) => {
    if (!item.isLogout) {
      items.push({
        title: item.title,
        path: item.path,
        icon: item.icon,
        category: 'Quick Access',
      })
    }
  })

  return items
}

const filterMenu = () => {
  if (!searchQuery.value.trim()) {
    filteredMenuItems.value = []
    return
  }

  const query = searchQuery.value.toLowerCase()
  const allItems = getAllMenuItems()

  filteredMenuItems.value = allItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query),
    )
    .slice(0, 8)
}

const navigateToItem = (item) => {
  router.push(item.path)
  clearSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredMenuItems.value = []
  showSearchResults.value = false
}

const hideSearchResults = () => {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

onMounted(async () => {
  // Inisialisasi favicon saat komponen dimuat
  const { setFavicon } = useFavicon()
  setFavicon(LINK_LOGO.value)
  await LoadMenu()
})

const logout = () => {
  console.log('Logout clicked')
  // Add your logout logic here
}
</script>

<style scoped>
/* Custom Sidebar Enhancements */
.main-sidebar {
  transition: all 0.3s ease;
}

.nav-link {
  transition: all 0.2s ease;
  border-radius: 0.25rem;
  margin: 1px 8px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  font-weight: 600;
}

.nav-treeview .nav-link {
  padding-left: 2.5rem;
  font-size: 0.9rem;
}

.nav-header {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.6);
  margin: 15px 0 5px 0;
  padding: 0 1rem;
}

.badge {
  font-size: 0.7rem;
  padding: 0.2em 0.5em;
}

.user-panel {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-panel .info a {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Search Enhancement */
.form-control-sidebar {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.form-control-sidebar::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-control-sidebar:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
}

/* Search Results Styling */
.search-results {
  position: absolute;
  top: 100%;
  left: 8px;
  right: 8px;
  background: #2c3e50;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.search-results-header {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.search-results-list {
  max-height: 250px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-result-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-icon {
  margin-right: 12px;
  color: rgba(255, 255, 255, 0.7);
  width: 16px;
  text-align: center;
}

.search-result-content {
  flex: 1;
}

.search-result-title {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.search-result-path {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.search-no-results {
  padding: 20px;
  text-align: center;
}

.search-no-results i {
  font-size: 2rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.search-no-results p {
  font-size: 0.9rem;
}

.search-no-results small {
  font-size: 0.75rem;
}

/* Icon Colors */
.text-info {
  color: #17a2b8 !important;
}

.text-success {
  color: #28a745 !important;
}

.text-warning {
  color: #ffc107 !important;
}

.text-primary {
  color: #007bff !important;
}

.text-danger {
  color: #dc3545 !important;
}

/* Responsive Improvements */
@media (max-width: 768px) {
  .nav-treeview .nav-link {
    padding-left: 2rem;
    font-size: 0.85rem;
  }

  .brand-text {
    font-size: 1rem;
  }
}
</style>
