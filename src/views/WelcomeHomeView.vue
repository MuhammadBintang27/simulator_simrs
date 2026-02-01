<template>
  <div class="card p-4">
    <!-- ====================== PELAYANAN PASIEN ====================== -->
    <div class="text-2xl font-semibold mb-3">Pelayanan Pasien</div>

    <div class="surface-card">
      <!-- Main Menu Items with Submenus -->
      <div v-for="item in mainMenuItems_real" :key="item.id" class="menu-container">
        <!-- Main Menu Item -->
        <div
          class="menu-item"
          @click="toggleSubmenu(item.id)"
          :class="{ active: expandedMenus.includes(item.id) }"
        >
          <div class="icon-container">
            <i :class="item.icon"></i>
          </div>
          <div class="menu-label">{{ item.title }}</div>
          <!-- Arrow for items with children -->
          <i
            v-if="item.children && item.children.length > 0"
            class="arrow-icon fas"
            :class="expandedMenus.includes(item.id) ? 'fa-chevron-up' : 'fa-chevron-down'"
          ></i>
        </div>

        <!-- Submenu Items -->
        <transition name="slide">
          <div
            v-if="item.children && item.children.length > 0 && expandedMenus.includes(item.id)"
            class="submenu"
          >
            <div
              v-for="child in item.children"
              :key="child.id"
              class="submenu-item"
              @click="go(child.path)"
            >
              <div class="submenu-icon-container">
                <i :class="child.icon"></i>
              </div>
              <div class="submenu-label">{{ child.title }}</div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <hr class="my-4" />

    <!-- ====================== INFORMASI ====================== -->
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const router = useRouter()
const { LINK_LOGO } = storeToRefs(authStore)

const expandedMenus = ref([])
const mainMenuItems_real = ref([])

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
        title: 'Data Rawat Pasien',
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
    icon: 'fas fa-coins',
    children: [
      {
        id: 'klaim-manajemen',
        title: 'Klaim Manajemen',
        path: '/keuangan/klaim-manajemen',
        icon: 'fas fa-file-invoice-dollar',
      },
      {
        id: 'kasir',
        title: 'Kasir',
        path: '/keuangan/kasir',
        icon: 'fas fa-money-bill-wave',
      },
    ],
  },
])

const go = (to) => {
  if (to) router.push(to)
}

const toggleSubmenu = (itemId) => {
  const index = expandedMenus.value.indexOf(itemId)
  if (index > -1) {
    expandedMenus.value.splice(index, 1)
  } else {
    expandedMenus.value.push(itemId)
  }
}

const LoadMenu = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/get_menu_item/${user_id.value}/${id_client.value}`,
    )
    mainMenuItems_real.value = response.data || mainMenuItems.value
  } catch (error) {
    // console.error('Error fetchi  ng data:', error)
    mainMenuItems_real.value = mainMenuItems.value
  }
}

onMounted(() => {
  const hasRefreshed = sessionStorage.getItem('page_refreshed')

  if (!hasRefreshed) {
    sessionStorage.setItem('page_refreshed', 'true')

    setTimeout(() => {
      window.location.reload()
    }, 3000) // 3 detik

    return
  }
  LoadMenu()
})
</script>

<style scoped>
.surface-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
}

.menu-item:hover {
  background-color: #f0f5ff;
  border-color: #1a73e8;
}

.menu-item.active {
  background-color: #e8f0fe;
  border-color: #1a73e8;
  color: #1a73e8;
}

.icon-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-container i {
  font-size: 18px;
  color: #1a73e8;
}

.menu-label {
  font-weight: 500;
  font-size: 14px;
  flex: 1;
}

.arrow-icon {
  font-size: 12px;
  color: #666;
  transition: transform 0.3s ease;
}

.submenu {
  background-color: #f9fafb;
  border-top: 1px solid #e0e0e0;
  padding: 8px 0;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 56px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  font-size: 13px;
}

.submenu-item:hover {
  background-color: #f0f5ff;
  border-left-color: #1a73e8;
  color: #1a73e8;
}

.submenu-icon-container {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e8f0fe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.submenu-icon-container i {
  font-size: 14px;
  color: #1a73e8;
}

.submenu-label {
  font-weight: 400;
  font-size: 13px;
}

/* Transition animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .menu-item {
    padding: 10px 12px;
  }

  .submenu-item {
    padding: 8px 12px 8px 44px;
  }

  .icon-container {
    width: 36px;
    height: 36px;
  }

  .icon-container i {
    font-size: 16px;
  }
}
</style>
