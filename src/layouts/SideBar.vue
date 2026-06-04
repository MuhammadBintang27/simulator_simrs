<template>
  <!-- Mobile backdrop -->
  <div
    v-if="mobileSidebarOpen"
    class="sb__mobile-backdrop"
    @click="configStore.closeMobileSidebar()"
  ></div>

  <aside
    class="sb"
    :class="{ 'sb--collapsed': isCollapsedView, 'sb--mobile-open': mobileSidebarOpen }"
    @mouseenter="sidebarHovered = true"
    @mouseleave="sidebarHovered = false"
  >
    <!-- Brand -->
    <div class="sb__brand">
      <img
        :src="LINK_LOGO"
        alt="Logo"
        class="sb__logo"
        :class="{ 'sb__logo--sm': isCollapsedView }"
      />
    </div>

    <!-- Search (hidden when collapsed) -->
    <div v-show="!isCollapsedView" class="sb__search-wrap">
      <div class="sb__search-box">
        <i class="fas fa-search sb__search-icon"></i>
        <input
          v-model="searchQuery"
          @input="filterMenu"
          @focus="showSearchResults = true"
          @blur="hideSearchResults"
          @keydown.escape="clearSearch"
          type="search"
          placeholder="Cari menu..."
          class="sb__search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="sb__search-clear">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div v-if="showSearchResults && searchQuery" class="sb__search-results">
        <template v-if="filteredMenuItems.length > 0">
          <div
            v-for="item in filteredMenuItems"
            :key="item.path"
            class="sb__search-item"
            @mousedown="navigateToItem(item)"
          >
            <i :class="item.icon" class="sb__search-item-icon"></i>
            <div>
              <div class="sb__search-item-title">{{ item.title }}</div>
              <div class="sb__search-item-cat">{{ item.category }}</div>
            </div>
          </div>
        </template>
        <div v-else class="sb__search-empty">
          <i class="fas fa-inbox"></i><span>Tidak ditemukan</span>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="sb__nav">
      <div v-show="!isCollapsedView" class="sb__section-label">MENU</div>

      <template v-for="item in mainMenuItems_real" :key="item.id">
        <!-- Single item -->
        <div class="sb__hw">
          <router-link
            v-if="!item.children || item.children.length === 0"
            :to="item.path || '#'"
            class="sb__item"
            active-class="sb__item--active"
          >
            <i :class="item.icon" class="sb__item-icon"></i>
            <span v-show="!isCollapsedView" class="sb__item-label">{{ item.title }}</span>
          </router-link>

          <!-- Group item -->
          <template v-else>
            <button
              class="sb__item sb__item--group"
              :class="{ 'sb__item--open': !isCollapsedView && openGroups.includes(item.id) }"
              @click="toggleGroup(item.id)"
            >
              <i :class="item.icon" class="sb__item-icon"></i>
              <span v-show="!isCollapsedView" class="sb__item-label">{{ item.title }}</span>
              <i v-show="!isCollapsedView" class="fas fa-chevron-right sb__chevron"></i>
            </button>
            <Transition name="slide">
              <div v-if="!isCollapsedView && openGroups.includes(item.id)" class="sb__children">
                <router-link
                  v-for="child in item.children"
                  :key="child.id"
                  :to="child.path"
                  class="sb__child"
                  active-class="sb__child--active"
                >
                  <span class="sb__child-dot"></span>
                  <span>{{ child.title }}</span>
                  <span v-if="child.badge" class="sb__badge">{{ child.badge }}</span>
                </router-link>
              </div>
            </Transition>
          </template>

          <!-- Hover popup (hanya tampil saat fully collapsed, bukan hover-expand) -->
          <div v-if="isCollapsedView" class="sb__popup">
            <div class="sb__popup-title">
              <i :class="item.icon" class="sb__popup-icon"></i>
              {{ item.title }}
            </div>
            <template v-if="item.children && item.children.length">
              <router-link
                v-for="child in item.children"
                :key="child.id"
                :to="child.path"
                class="sb__popup-child"
                active-class="sb__popup-child--active"
              >
                <i :class="child.icon" class="sb__popup-child-icon"></i>
                {{ child.title }}
              </router-link>
            </template>
          </div>
        </div>
      </template>

      <div v-show="!isCollapsedView" class="sb__section-label" style="margin-top: 8px">
        AKSES CEPAT
      </div>

      <template v-for="item in quickAccessItems" :key="item.id">
        <div class="sb__hw">
          <router-link
            v-if="!item.isLogout"
            :to="item.path"
            class="sb__item"
            active-class="sb__item--active"
          >
            <i :class="item.icon" class="sb__item-icon"></i>
            <span v-show="!isCollapsedView" class="sb__item-label">{{ item.title }}</span>
            <span v-if="item.badge && !isCollapsedView" class="sb__badge">{{ item.badge }}</span>
          </router-link>
          <button v-else class="sb__item sb__item--logout" @click="logout">
            <i :class="item.icon" class="sb__item-icon"></i>
            <span v-show="!isCollapsedView" class="sb__item-label">{{ item.title }}</span>
          </button>

          <!-- Hover popup quick access -->
          <div v-if="isCollapsedView" class="sb__popup">
            <div class="sb__popup-title">
              <i :class="item.icon" class="sb__popup-icon"></i>
              {{ item.title }}
            </div>
          </div>
        </div>
      </template>
    </nav>

    <!-- Footer -->
    <div class="sb__footer">
      <span class="sb__online-dot"><i class="fas fa-circle"></i></span>
      <span v-show="!isCollapsedView">Online</span>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, LINK_LOGO } = storeToRefs(authStore)

const { sidebarCollapsed: collapsed, mobileSidebarOpen } = storeToRefs(configStore)

const router = useRouter()

const sidebarHovered = ref(false)
// Sidebar terlihat collapsed hanya jika collapsed = true DAN mouse tidak sedang hover
const isCollapsedView = computed(() => collapsed.value && !sidebarHovered.value)

const searchQuery = ref('')
const showSearchResults = ref(false)
const filteredMenuItems = ref([])
const openGroups = ref([])
let searchDebounceTimer = null

// Tutup mobile sidebar ketika navigasi
watch(
  () => router.currentRoute.value.path,
  () => configStore.closeMobileSidebar(),
)

// Sinkronisasi body class (sb-collapsed = CSS kita, sidebar-collapse = AdminLTE)
watch(
  collapsed,
  (val) => {
    document.body.classList.toggle('sb-collapsed', val)
    document.body.classList.toggle('sidebar-collapse', val)
    if (val) openGroups.value = []
  },
  { immediate: true },
)

const toggleGroup = (id) => {
  const idx = openGroups.value.indexOf(id)
  if (idx === -1) openGroups.value.push(id)
  else openGroups.value.splice(idx, 1)
}

const filterMenu = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  const query = searchQuery.value.trim()
  if (!query) {
    filteredMenuItems.value = []
    return
  }
  searchDebounceTimer = setTimeout(() => {
    const lq = query.toLowerCase()
    filteredMenuItems.value = getAllMenuItems()
      .filter((i) => i.title.toLowerCase().includes(lq) || i.category.toLowerCase().includes(lq))
      .sort(
        (a, b) =>
          (a.title.toLowerCase().startsWith(lq) ? 0 : 1) -
          (b.title.toLowerCase().startsWith(lq) ? 0 : 1),
      )
      .slice(0, 10)
  }, 300)
}

const useFavicon = () => {
  const setFavicon = (url = null) => {
    const iconUrl = url || localStorage.getItem('app_icon_url')
    const el = document.createElement('link')
    el.rel = 'icon'
    el.type = 'image/png'
    el.href = iconUrl
    document.head.appendChild(el)
  }
  return { setFavicon }
}

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
    id: 'fisioterapi',
    title: 'Fisioterapi',
    icon: 'fas fa-walking',
    children: [
      {
        id: 'home-fisioterapi',
        title: 'Daftar Permintaan',
        path: '/fisioterapi/home',
        icon: 'fas fa-clipboard-list',
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
    id: 'keuangan',
    title: 'Keuangan',
    icon: 'fas fa-coins',
    children: [
      {
        id: 'klaim-manajemen',
        title: 'Klaim Manajemen',
        path: '/keuangan/klaim-manajemen',
        icon: 'fas fa-file-invoice-dollar',
      },
      { id: 'kasir', title: 'Kasir', path: '/keuangan/kasir', icon: 'fas fa-money-bill-wave' },
    ],
  },
  {
    id: 'manajemen',
    title: 'Manajemen',
    icon: 'fas fa-cogs',
    children: [
      {
        id: 'manajemen-menu-items',
        title: 'Manajemen Menu',
        path: '/manajemen/menu-items',
        icon: 'fas fa-bars',
      },
    ],
  },
])

const mainMenuItems_real = ref([])
const LoadMenu = async () => {
  try {
    const res = await axios.get(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/get_menu_item/${user_id.value}/${id_client.value}`,
    )
    let data = res.data || []
    if (data && typeof data === 'object' && !Array.isArray(data)) data = Object.values(data)
    mainMenuItems_real.value = data
  } catch {
    mainMenuItems_real.value = mainMenuItems.value
  }
}

const quickAccessItems = ref([
  { id: 'home', title: 'Home', path: '/', icon: 'fas fa-home' },
  {
    id: 'notifications',
    title: 'Notifikasi',
    path: '/Setting/Notification',
    icon: 'fas fa-bell',
    badge: '3',
  },
  { id: 'help', title: 'Bantuan', path: '/help', icon: 'fas fa-question-circle' },
  { id: 'logout', title: 'Keluar', icon: 'fas fa-sign-out-alt', isLogout: true },
])

const getAllMenuItems = () => {
  const items = []
  mainMenuItems_real.value.forEach((menu) => {
    if (menu.children?.length > 0)
      menu.children.forEach((child) =>
        items.push({
          title: child.title,
          path: child.path,
          icon: child.icon,
          category: menu.title,
        }),
      )
    else items.push({ title: menu.title, path: menu.path, icon: menu.icon, category: 'Main' })
  })
  quickAccessItems.value.forEach((item) => {
    if (!item.isLogout)
      items.push({ title: item.title, path: item.path, icon: item.icon, category: 'Akses Cepat' })
  })
  return items
}

const navigateToItem = (item) => {
  router.push(item.path)
  clearSearch()
}
const clearSearch = () => {
  searchQuery.value = ''
  filteredMenuItems.value = []
  showSearchResults.value = false
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
}
const hideSearchResults = () =>
  setTimeout(() => {
    showSearchResults.value = false
  }, 150)
const logout = () => {
  authStore.clearAuthData()
  router.push('/login')
}

const onKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    if (!collapsed.value) document.querySelector('.sb__search-input')?.focus()
  }
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
  const { setFavicon } = useFavicon()
  setFavicon(LINK_LOGO.value)
  await LoadMenu()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.sb {
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #162d4e 0%, #1a3a5f 60%, #1e4475 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1038;
  overflow: hidden;
  transition: width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.sb--collapsed {
  width: 64px;
}

.sb__brand {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.9rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}
.sb--collapsed .sb__brand {
  padding: 0 0.5rem;
}
.sb__logo {
  height: 44px;
  width: auto;
  object-fit: contain;
  filter: brightness(1.1) drop-shadow(0 1px 4px rgba(0, 0, 0, 0.3));
}
.sb__logo--sm {
  height: 36px;
  width: 44px;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}

.sb__search-wrap {
  padding: 0.75rem 0.9rem 0.5rem;
  position: relative;
  flex-shrink: 0;
}
.sb__search-box {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 0 0.6rem;
  height: 36px;
  gap: 0.4rem;
}
.sb__search-box:focus-within {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
}
.sb__search-icon {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}
.sb__search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.9);
  outline: none;
  min-width: 0;
}
.sb__search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}
.sb__search-clear {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  font-size: 0.65rem;
  padding: 0;
}
.sb__search-results {
  position: absolute;
  top: calc(100% - 2px);
  left: 0.9rem;
  right: 0.9rem;
  background: #1a3a5f;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 100;
  max-height: 260px;
  overflow-y: auto;
}
.sb__search-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  transition: background 0.1s;
}
.sb__search-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
.sb__search-item-icon {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  width: 13px;
  text-align: center;
  flex-shrink: 0;
}
.sb__search-item-title {
  font-size: 0.82rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}
.sb__search-item-cat {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 1px;
}
.sb__search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 1.1rem;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.78rem;
}
.sb__search-empty i {
  font-size: 1rem;
}

.sb__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.3rem 0.6rem 0.75rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
.sb--collapsed .sb__nav {
  padding: 0.3rem 0.5rem 0.75rem;
}
.sb__nav::-webkit-scrollbar {
  width: 3px;
}
.sb__nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 99px;
}

.sb__section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  padding: 0.65rem 0.5rem 0.3rem;
  white-space: nowrap;
}

.sb__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s,
    color 0.15s;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
}
.sb--collapsed .sb__item {
  justify-content: center;
  padding: 0.55rem 0;
  gap: 0;
  border-radius: 8px;
}
.sb__item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.sb__item--active {
  background: rgba(255, 255, 255, 0.18);
  color: #fff !important;
  font-weight: 600;
}
.sb__item-icon {
  width: 18px;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  transition: color 0.15s;
}
.sb--collapsed .sb__item-icon {
  width: 20px;
  font-size: 1rem;
}
.sb__item:hover .sb__item-icon {
  color: #fff;
}
.sb__item--active .sb__item-icon {
  color: #fff;
}
.sb__item-label {
  flex: 1;
  line-height: 1.3;
}
.sb__chevron {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.35);
  transition:
    transform 0.18s,
    color 0.15s;
  flex-shrink: 0;
}
.sb__item--open .sb__chevron {
  transform: rotate(90deg);
  color: rgba(255, 255, 255, 0.8);
}

.sb__children {
  margin: 2px 0 4px 1rem;
  padding-left: 0.75rem;
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.sb__child {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.42rem 0.5rem;
  border-radius: 5px;
  font-size: 0.82rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition:
    background 0.12s,
    color 0.12s;
  white-space: nowrap;
}
.sb__child:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.sb__child--active {
  color: #fff !important;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.12);
}
.sb__child-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
  transition: background 0.12s;
}
.sb__child--active .sb__child-dot {
  background: #fff;
}

.sb__badge {
  margin-left: auto;
  font-size: 0.6rem;
  font-weight: 700;
  background: #e74c3c;
  color: #fff;
  border-radius: 10px;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}

.sb__item--logout {
  color: rgba(255, 150, 150, 0.85);
}
.sb__item--logout:hover {
  background: rgba(220, 50, 50, 0.2);
  color: #ffaaaa;
}
.sb__item--logout .sb__item-icon {
  color: rgba(255, 150, 150, 0.7);
}

.sb__footer {
  padding: 0.65rem 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
}
.sb--collapsed .sb__footer {
  justify-content: center;
  padding: 0.65rem 0;
}
.sb__online-dot {
  font-size: 0.4rem;
  color: #2ecc71;
  flex-shrink: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.sb__hw {
  position: relative;
}
.sb__hw::after {
  content: '';
  position: absolute;
  top: 0;
  right: -12px;
  width: 12px;
  height: 100%;
}

.sb__popup {
  position: absolute;
  left: calc(100% + 4px);
  top: 0;
  min-width: 190px;
  background: linear-gradient(135deg, #1a3a5f 0%, #1e4475 100%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  box-shadow: 4px 4px 24px rgba(0, 0, 0, 0.4);
  padding: 6px;
  z-index: 2000;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-4px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.sb__hw:hover .sb__popup {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.sb__popup-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  padding: 0.45rem 0.65rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 4px;
}
.sb__popup-icon {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  width: 14px;
  text-align: center;
  flex-shrink: 0;
}
.sb__popup-child {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.42rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition:
    background 0.12s,
    color 0.12s;
  white-space: nowrap;
}
.sb__popup-child:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.sb__popup-child--active {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 500;
}
.sb__popup-child-icon {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.4);
  width: 13px;
  text-align: center;
  flex-shrink: 0;
}
.sb__popup-child--active .sb__popup-child-icon {
  color: rgba(255, 255, 255, 0.9);
}
.sb__popup::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 14px;
  border: 6px solid transparent;
  border-right-color: rgba(255, 255, 255, 0.18);
  border-left: none;
}
.sb__popup::after {
  content: '';
  position: absolute;
  left: -5px;
  top: 15px;
  border: 5px solid transparent;
  border-right-color: #1a3a5f;
  border-left: none;
}
</style>

<style>
/* Global: backdrop mobile sidebar */
.sb__mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1037;
}

/* Global: adjust content-wrapper when sidebar collapses */
body .content-wrapper,
body .main-footer {
  margin-left: 250px;
  transition: margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
body .main-header.navbar {
  margin-left: 250px;
  transition: margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
body.sb-collapsed .content-wrapper,
body.sb-collapsed .main-footer {
  margin-left: 64px;
}
body.sb-collapsed .main-header.navbar {
  margin-left: 64px;
}

/* ── Mobile: sidebar sebagai drawer dari kiri ── */
@media (max-width: 768px) {
  .sb {
    transform: translateX(-100%);
    width: 250px !important;
    transition:
      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sb--mobile-open {
    transform: translateX(0);
  }
  body .content-wrapper,
  body .main-footer,
  body.sb-collapsed .content-wrapper,
  body.sb-collapsed .main-footer {
    margin-left: 0 !important;
  }
  body .main-header.navbar,
  body.sb-collapsed .main-header.navbar {
    margin-left: 0 !important;
  }
}
</style>
