<template>
  <div class="content">
    <!-- Hero -->
    <div class="hero-section">
      <div class="hero-left">
        <div class="hero-icon-wrap"><i class="fas fa-user-cog"></i></div>
        <div>
          <h1 class="hero-title">Assign Menu ke User</h1>
          <p class="hero-desc">Atur hak akses menu navigasi untuk setiap pengguna</p>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-stats">
          <div class="stat-card">
            <span class="stat-num">{{ userList.length }}</span>
            <span class="stat-lbl">Total User</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ allMenuItems.length }}</span>
            <span class="stat-lbl">Total Menu</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ activeMode === 'user' ? selectedMenuIds.size : m2MenuIds.size }}</span>
            <span class="stat-lbl">Menu Dipilih</span>
          </div>
          <div v-if="activeMode === 'menu'" class="stat-card">
            <span class="stat-num">{{ m2SelectedNips.size }}</span>
            <span class="stat-lbl">User Dipilih</span>
          </div>
        </div>
        <Button
          label="Manajemen User"
          icon="pi pi-users"
          size="small"
          class="btn-user-mgmt"
          @click="router.push('/manajemen/user-management')"
        />
      </div>
    </div>

    <Tabs v-model:value="activeMode" class="assign-tabs">
      <TabList>
        <Tab value="user"><i class="pi pi-user"></i> Mode 1 — Pilih User, Atur Menu</Tab>
        <Tab value="menu"><i class="pi pi-list"></i> Mode 2 — Pilih Menu, Assign ke Banyak User</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="user">
    <!-- ── MODE 1: Pilih User → Atur Menu ───────────── -->
    <div class="main-layout">
      <!-- LEFT: User List -->
      <div class="user-panel">
        <div class="panel-header">
          <span class="panel-title"><i class="fas fa-users"></i> Daftar User</span>
        </div>
        <div class="user-search-wrap">
          <i class="pi pi-search"></i>
          <input v-model="userSearch" placeholder="Cari user..." class="user-search-input" />
        </div>
        <div v-if="loadingUsers" class="panel-loading">
          <i class="pi pi-spin pi-spinner"></i> Memuat...
        </div>
        <div v-else-if="filteredUsers.length === 0" class="panel-empty">
          <i class="pi pi-inbox"></i>
          <p>Tidak ada user ditemukan</p>
        </div>
        <div v-else class="user-list">
          <div
            v-for="user in filteredUsers"
            :key="user.nip"
            class="user-item"
            :class="{ 'user-item--active': selectedUser?.nip === user.nip }"
            @click="selectUser(user)"
          >
            <div class="user-avatar">{{ getInitials(user.nama_user) }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.nama_user }}</div>
              <div class="user-id">{{ user.nip }}</div>
            </div>
            <i v-if="selectedUser?.nip === user.nip" class="pi pi-chevron-right user-arrow"></i>
          </div>
        </div>
      </div>

      <!-- RIGHT: Menu Assignment -->
      <div class="menu-panel">
        <div v-if="!selectedUser" class="panel-placeholder">
          <i class="fas fa-hand-pointer"></i>
          <p>Pilih user dari daftar kiri untuk mengatur<br />hak akses menu mereka</p>
        </div>

        <template v-else>
          <div class="menu-panel-header">
            <div class="menu-panel-title-wrap">
              <div class="selected-user-badge">
                <div class="selected-user-avatar">{{ getInitials(selectedUser.nama_user) }}</div>
                <div>
                  <div class="selected-user-name">{{ selectedUser.nama_user }}</div>
                  <div class="selected-user-id">{{ selectedUser.nip }}</div>
                </div>
              </div>
            </div>
            <div class="menu-panel-actions">
              <Button
                label="Pilih Semua"
                icon="pi pi-check-square"
                size="small"
                text
                @click="selectAll"
              />
              <Button
                label="Hapus Semua"
                icon="pi pi-stop"
                size="small"
                text
                severity="secondary"
                @click="clearAll"
              />
              <Button
                :label="saving ? 'Menyimpan...' : 'Simpan'"
                :icon="saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'"
                size="small"
                severity="success"
                :loading="saving"
                @click="saveAssignment"
              />
            </div>
          </div>

          <!-- Menu Search -->
          <div class="menu-search-wrap">
            <i class="pi pi-search menu-search-icon"></i>
            <input
              v-model="menuSearch"
              placeholder="Cari menu..."
              class="menu-search-input"
            />
            <button v-if="menuSearch" class="menu-search-clear" @click="menuSearch = ''">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div v-if="loadingMenus" class="panel-loading">
            <i class="pi pi-spin pi-spinner"></i> Memuat data menu...
          </div>

          <div v-else-if="filteredMenuTree.length === 0" class="panel-empty">
            <i class="pi pi-search"></i>
            <p>Tidak ada menu yang cocok dengan "{{ menuSearch }}"</p>
          </div>

          <div v-else class="menu-tree-wrap">
            <div v-for="parent in filteredMenuTree" :key="parent.id" class="menu-group">
              <!-- Parent row -->
              <div class="menu-parent-row" :class="{ 'is-group': parent.children.length > 0 }">
                <!-- Standalone parent (tidak punya anak): beri checkbox -->
                <Checkbox
                  v-if="parent.children.length === 0"
                  :modelValue="selectedMenuIds.has(Number(parent.id))"
                  :binary="true"
                  @change="toggleStandalone(parent)"
                />
                <!-- Group parent (punya anak): spacer tanpa checkbox -->
                <span v-else class="checkbox-spacer"></span>

                <span class="menu-icon"><i v-if="parent.icon" :class="parent.icon"></i></span>
                <span class="menu-parent-title">{{ parent.title }}</span>

                <!-- Badge anak yang dipilih (hanya untuk group parent) -->
                <span
                  v-if="parent.children.length"
                  class="menu-child-count"
                  :class="{
                    'count--none': checkedChildCount(parent) === 0,
                    'count--some':
                      checkedChildCount(parent) > 0 &&
                      checkedChildCount(parent) < parent.children.length,
                    'count--all': checkedChildCount(parent) === parent.children.length,
                  }"
                >
                  {{ checkedChildCount(parent) }}/{{ parent.children.length }}
                </span>
              </div>

              <!-- Anak-anak: masing-masing punya checkbox sendiri -->
              <div v-if="parent.children.length" class="menu-children">
                <div v-for="child in parent.children" :key="child.id" class="menu-child-row">
                  <span class="child-connector"></span>
                  <Checkbox
                    :modelValue="selectedMenuIds.has(Number(child.id))"
                    :binary="true"
                    @change="toggleChild(child)"
                  />
                  <span class="menu-icon menu-icon--sm">
                    <i v-if="child.icon" :class="child.icon"></i>
                  </span>
                  <div class="menu-child-info">
                    <span class="menu-child-title">{{ child.title }}</span>
                    <code v-if="child.path" class="menu-child-path">{{ child.path }}</code>
                  </div>
                </div>
              </div>

              <!-- Standalone parent yang punya path: tampilkan path-nya -->
              <div v-else-if="parent.path" class="menu-no-children-note">
                <code class="menu-child-path" style="margin-left: 2.5rem">{{ parent.path }}</code>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
        </TabPanel>
        <TabPanel value="menu">
    <!-- ── MODE 2: Pilih Menu → Assign ke Banyak User ── -->
    <div class="main-layout">

      <!-- LEFT: Menu Tree -->
      <div class="menu-panel mode2-menu-panel">
        <div class="panel-header">
          <span class="panel-title"><i class="pi pi-list-check"></i> Pilih Menu</span>
          <div class="mode2-menu-actions">
            <Button label="Semua" icon="pi pi-check-square" size="small" text @click="m2SelectAllMenus" />
            <Button label="Hapus" icon="pi pi-stop" size="small" text severity="secondary" @click="m2ClearAllMenus" />
          </div>
        </div>
        <div class="menu-search-wrap">
          <i class="pi pi-search menu-search-icon"></i>
          <input v-model="m2MenuSearch" placeholder="Cari menu..." class="menu-search-input" />
          <button v-if="m2MenuSearch" class="menu-search-clear" @click="m2MenuSearch = ''">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="m2FilteredMenuTree.length === 0" class="panel-empty">
          <i class="pi pi-search"></i>
          <p>Tidak ada menu yang cocok dengan "{{ m2MenuSearch }}"</p>
        </div>
        <div v-else class="menu-tree-wrap">
          <div v-for="parent in m2FilteredMenuTree" :key="parent.id" class="menu-group">
            <div class="menu-parent-row" :class="{ 'is-group': parent.children.length > 0 }">
              <Checkbox
                v-if="parent.children.length === 0"
                :modelValue="m2MenuIds.has(Number(parent.id))"
                :binary="true"
                @change="m2ToggleStandalone(parent)"
              />
              <span v-else class="checkbox-spacer"></span>
              <span class="menu-icon"><i v-if="parent.icon" :class="parent.icon"></i></span>
              <span class="menu-parent-title">{{ parent.title }}</span>
              <span
                v-if="parent.children.length"
                class="menu-child-count"
                :class="{
                  'count--none': m2CheckedChildCount(parent) === 0,
                  'count--some': m2CheckedChildCount(parent) > 0 && m2CheckedChildCount(parent) < parent.children.length,
                  'count--all': m2CheckedChildCount(parent) === parent.children.length,
                }"
              >{{ m2CheckedChildCount(parent) }}/{{ parent.children.length }}</span>
            </div>
            <div v-if="parent.children.length" class="menu-children">
              <div v-for="child in parent.children" :key="child.id" class="menu-child-row">
                <span class="child-connector"></span>
                <Checkbox
                  :modelValue="m2MenuIds.has(Number(child.id))"
                  :binary="true"
                  @change="m2ToggleChild(child)"
                />
                <span class="menu-icon menu-icon--sm"><i v-if="child.icon" :class="child.icon"></i></span>
                <div class="menu-child-info">
                  <span class="menu-child-title">{{ child.title }}</span>
                  <code v-if="child.path" class="menu-child-path">{{ child.path }}</code>
                </div>
              </div>
            </div>
            <div v-else-if="parent.path" class="menu-no-children-note">
              <code class="menu-child-path" style="margin-left: 2.5rem">{{ parent.path }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: User Multi-select -->
      <div class="user-panel mode2-user-panel">
        <div class="panel-header">
          <span class="panel-title"><i class="fas fa-users"></i> Pilih User</span>
          <div class="mode2-menu-actions">
            <Button label="Semua" icon="pi pi-check-square" size="small" text @click="m2SelectAllUsers" />
            <Button label="Hapus" icon="pi pi-stop" size="small" text severity="secondary" @click="m2ClearAllUsers" />
          </div>
        </div>
        <div class="user-search-wrap">
          <i class="pi pi-search"></i>
          <input v-model="m2UserSearch" placeholder="Cari user..." class="user-search-input" />
        </div>

        <div v-if="loadingUsers" class="panel-loading">
          <i class="pi pi-spin pi-spinner"></i> Memuat...
        </div>
        <div v-else-if="m2FilteredUsers.length === 0" class="panel-empty">
          <i class="pi pi-inbox"></i>
          <p>Tidak ada user ditemukan</p>
        </div>
        <div v-else class="user-list">
          <div
            v-for="user in m2FilteredUsers"
            :key="user.nip"
            class="user-item user-item--checkable"
            :class="{ 'user-item--active': m2SelectedNips.has(user.nip) }"
            @click="m2ToggleUser(user)"
          >
            <Checkbox
              :modelValue="m2SelectedNips.has(user.nip)"
              :binary="true"
              @change="m2ToggleUser(user)"
              @click.stop
            />
            <div class="user-avatar" :class="{ 'user-avatar--checked': m2SelectedNips.has(user.nip) }">
              {{ getInitials(user.nama_user) }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.nama_user }}</div>
              <div class="user-id">{{ user.nip }}</div>
            </div>
          </div>
        </div>

        <!-- Save bar -->
        <div class="mode2-save-bar">
          <span class="mode2-summary">
            <span v-if="m2MenuIds.size && m2SelectedNips.size">
              {{ m2MenuIds.size }} menu → {{ m2SelectedNips.size }} user
            </span>
            <span v-else class="mode2-summary--hint">Pilih menu &amp; user untuk assign</span>
          </span>
          <Button
            :label="m2Saving ? 'Menyimpan...' : 'Simpan Assignment'"
            :icon="m2Saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'"
            size="small"
            severity="success"
            :loading="m2Saving"
            :disabled="m2MenuIds.size === 0 || m2SelectedNips.size === 0"
            @click="m2SaveAssignment"
          />
        </div>
      </div>

    </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>

  <Toast />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const apiBase = computed(() => configStore.apiBaseUrl)

// ── State ──────────────────────────────────────────
const activeMode = ref('user') // 'user' | 'menu'

const loadingUsers = ref(false)
const loadingMenus = ref(false)
const saving = ref(false)

const userList = ref([])
const allMenuItems = ref([])
const userSearch = ref('')
const menuSearch = ref('')
const selectedUser = ref(null)
const selectedMenuIds = ref(new Set())

// Mode 2
const m2MenuIds = ref(new Set())
const m2SelectedNips = ref(new Set())
const m2UserSearch = ref('')
const m2MenuSearch = ref('')
const m2Saving = ref(false)

// ── Computed ───────────────────────────────────────
const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return userList.value
  const q = userSearch.value.toLowerCase()
  return userList.value.filter(
    (u) => u.nama_user?.toLowerCase().includes(q) || u.nip?.toLowerCase().includes(q),
  )
})

const menuTree = computed(() => {
  const parents = allMenuItems.value.filter((i) => !i.parent_id)
  return parents
    .map((p) => ({
      ...p,
      children: allMenuItems.value
        .filter((c) => c.parent_id === p.menu_id)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order)),
    }))
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
})

const filteredMenuTree = computed(() => {
  const q = menuSearch.value.trim().toLowerCase()
  if (!q) return menuTree.value
  return menuTree.value
    .map((parent) => {
      const parentMatch = parent.title.toLowerCase().includes(q)
      const matchedChildren = parent.children.filter((c) => c.title.toLowerCase().includes(q))
      if (parentMatch) return { ...parent }
      if (matchedChildren.length) return { ...parent, children: matchedChildren }
      return null
    })
    .filter(Boolean)
})

// Mode 2 computed
const m2FilteredUsers = computed(() => {
  const q = m2UserSearch.value.toLowerCase()
  if (!q) return userList.value
  return userList.value.filter(
    (u) => u.nama_user?.toLowerCase().includes(q) || u.nip?.toLowerCase().includes(q),
  )
})

const m2FilteredMenuTree = computed(() => {
  const q = m2MenuSearch.value.trim().toLowerCase()
  if (!q) return menuTree.value
  return menuTree.value
    .map((parent) => {
      const parentMatch = parent.title.toLowerCase().includes(q)
      const matchedChildren = parent.children.filter((c) => c.title.toLowerCase().includes(q))
      if (parentMatch) return { ...parent }
      if (matchedChildren.length) return { ...parent, children: matchedChildren }
      return null
    })
    .filter(Boolean)
})

const m2CheckedChildCount = (parent) =>
  parent.children.filter((c) => m2MenuIds.value.has(Number(c.id))).length

// ── Helpers ────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const checkedChildCount = (parent) =>
  parent.children.filter((c) => selectedMenuIds.value.has(Number(c.id))).length

// ── Data Fetching ──────────────────────────────────
const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const res = await axios.get(
      `${apiBase.value}/index.php/api/data_referensi/get_user/${id_client.value}`,
    )
    if (res.data?.metadata?.code == 200) {
      userList.value = res.data.response || []
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data user', life: 3000 })
  } finally {
    loadingUsers.value = false
  }
}

const fetchAllMenus = async () => {
  try {
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/get_all_menu_items`)
    allMenuItems.value = res.data?.response || []
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data menu', life: 3000 })
  }
}

const fetchUserAssignedMenus = async (userId) => {
  loadingMenus.value = true
  selectedMenuIds.value = new Set()
  try {
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/get_assigned_menus`, {
      user_id: userId,
      id_client: id_client.value,
    })
    const ids = res.data?.response || []
    selectedMenuIds.value = new Set(ids.map(Number))
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat assignment menu user',
      life: 3000,
    })
  } finally {
    loadingMenus.value = false
  }
}

// ── Actions ────────────────────────────────────────
const selectUser = (user) => {
  selectedUser.value = user
  fetchUserAssignedMenus(user.nip)
}

const toggleChild = (child) => {
  const id = Number(child.id)
  const set = new Set(selectedMenuIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  selectedMenuIds.value = set
}

// Toggle standalone parent (induk tanpa anak)
const toggleStandalone = (parent) => {
  const set = new Set(selectedMenuIds.value)
  const id = Number(parent.id)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  selectedMenuIds.value = set
}

// Pilih semua: hanya anak-anak + standalone parent (induk tanpa anak)
const selectAll = () => {
  const ids = new Set()
  menuTree.value.forEach((parent) => {
    if (parent.children.length === 0) {
      ids.add(Number(parent.id))
    } else {
      parent.children.forEach((c) => ids.add(Number(c.id)))
    }
  })
  selectedMenuIds.value = ids
}

const clearAll = () => {
  selectedMenuIds.value = new Set()
}

// ── Mode 2 Actions ─────────────────────────────────
const m2ToggleUser = (user) => {
  const set = new Set(m2SelectedNips.value)
  if (set.has(user.nip)) set.delete(user.nip)
  else set.add(user.nip)
  m2SelectedNips.value = set
}

const m2ToggleChild = (child) => {
  const id = Number(child.id)
  const set = new Set(m2MenuIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  m2MenuIds.value = set
}

const m2ToggleStandalone = (parent) => {
  const id = Number(parent.id)
  const set = new Set(m2MenuIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  m2MenuIds.value = set
}

const m2SelectAllMenus = () => {
  const ids = new Set()
  menuTree.value.forEach((parent) => {
    if (parent.children.length === 0) ids.add(Number(parent.id))
    else parent.children.forEach((c) => ids.add(Number(c.id)))
  })
  m2MenuIds.value = ids
}

const m2ClearAllMenus = () => {
  m2MenuIds.value = new Set()
}

const m2SelectAllUsers = () => {
  m2SelectedNips.value = new Set(userList.value.map((u) => u.nip))
}

const m2ClearAllUsers = () => {
  m2SelectedNips.value = new Set()
}

const m2SaveAssignment = async () => {
  if (m2MenuIds.value.size === 0) {
    toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Pilih setidaknya 1 menu', life: 3000 })
    return
  }
  if (m2SelectedNips.value.size === 0) {
    toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Pilih setidaknya 1 user', life: 3000 })
    return
  }

  m2Saving.value = true
  const nips = [...m2SelectedNips.value]
  const menuIds = [...m2MenuIds.value]

  try {
    const results = await Promise.all(
      nips.map((nip) =>
        axios.post(`${apiBase.value}/index.php/api/setting/save_menu_assign`, {
          user_id: nip,
          id_client: id_client.value,
          menu_ids: menuIds,
        }),
      ),
    )
    const allOk = results.every((r) => r.data?.metadata?.code == 200)
    if (allOk) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `${menuIds.length} menu berhasil diassign ke ${nips.length} user`,
        life: 3000,
      })
    } else {
      toast.add({ severity: 'warn', summary: 'Sebagian Gagal', detail: 'Beberapa assignment gagal disimpan', life: 4000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menyimpan assignment', life: 3000 })
  } finally {
    m2Saving.value = false
  }
}

const saveAssignment = async () => {
  if (!selectedUser.value) return
  saving.value = true
  try {
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/save_menu_assign`, {
      user_id: selectedUser.value.nip,
      id_client: id_client.value,
      menu_ids: [...selectedMenuIds.value],
    })
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `Assignment menu untuk ${selectedUser.value.nama_user} (${selectedUser.value.nip}) berhasil disimpan`,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: res.data?.metadata?.message || res.data?.message || 'Terjadi kesalahan',
        life: 5000,
      })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: err.response?.data?.metadata?.message || 'Gagal menyimpan assignment',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchAllMenus()])
})
</script>

<style scoped>
/* ── Hero ─────────────────────────────────────────── */
.hero-section {
  background: linear-gradient(135deg, #1a237e 0%, #283593 60%, #3949ab 100%);
  border-radius: 6px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 8px 24px rgba(26, 35, 126, 0.3);
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hero-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.hero-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}
.hero-desc {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
}
.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}
.hero-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.btn-user-mgmt {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  color: #fff !important;
  white-space: nowrap;
}
.btn-user-mgmt:hover {
  background: rgba(255, 255, 255, 0.28) !important;
}
.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  text-align: center;
  min-width: 90px;
}
.stat-num {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
}
.stat-lbl {
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Main Layout ──────────────────────────────────── */
.main-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

/* ── Shared Panel ─────────────────────────────────── */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.panel-title i {
  color: #6366f1;
}
.panel-loading {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
}
.panel-empty {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
}
.panel-empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

/* ── User Panel ───────────────────────────────────── */
.user-panel {
  width: 300px;
  min-width: 260px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}
.user-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.user-search-wrap i {
  color: #94a3b8;
  font-size: 0.8rem;
}
.user-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.82rem;
  color: #1e293b;
  background: transparent;
}
.menu-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  flex-shrink: 0;
}
.menu-search-icon {
  color: #94a3b8;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.menu-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.82rem;
  color: #1e293b;
  background: transparent;
}
.menu-search-clear {
  border: none;
  background: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}
.menu-search-clear:hover {
  color: #475569;
}
.user-list {
  overflow-y: auto;
  flex: 1;
  padding: 0.4rem;
}
.user-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  margin-bottom: 2px;
}
.user-item:hover {
  background: #f1f5f9;
}
.user-item--active {
  background: #eff6ff;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6366f1;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-info {
  flex: 1;
  min-width: 0;
}
.user-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-id {
  font-size: 0.68rem;
  color: #94a3b8;
  font-family: monospace;
}
.user-arrow {
  font-size: 0.7rem;
  color: #6366f1;
  flex-shrink: 0;
}

/* ── Menu Panel ───────────────────────────────────── */
.menu-panel {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}
.panel-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  text-align: center;
  padding: 3rem;
  min-height: 300px;
}
.panel-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.panel-placeholder p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #94a3b8;
}
.menu-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.menu-panel-title-wrap {
  display: flex;
  align-items: center;
}
.selected-user-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.selected-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #6366f1;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.selected-user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}
.selected-user-id {
  font-size: 0.72rem;
  color: #94a3b8;
  font-family: monospace;
}
.menu-panel-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* ── Menu Tree ────────────────────────────────────── */
.menu-tree-wrap {
  overflow-y: auto;
  flex: 1;
  padding: 0.75rem;
}
.menu-group {
  margin-bottom: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}
.menu-parent-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  background: #f8fafc;
  cursor: default;
}
.menu-parent-row:hover {
  background: #f1f5f9;
}
/* group parent (punya anak): tidak bisa diklik untuk assign */
.menu-parent-row.is-group {
  cursor: default;
}
/* spacer pengganti checkbox untuk group parent */
.checkbox-spacer {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: inline-block;
}
.menu-icon {
  width: 18px;
  text-align: center;
  color: #6366f1;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.menu-icon--sm {
  font-size: 0.75rem;
  color: #94a3b8;
}
.menu-parent-title {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
.menu-child-count {
  font-size: 0.7rem;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 600;
}
/* badge warna: tidak ada yang dipilih */
.menu-child-count.count--none {
  background: #f1f5f9;
  color: #94a3b8;
}
/* badge warna: sebagian dipilih */
.menu-child-count.count--some {
  background: #fef3c7;
  color: #92400e;
}
/* badge warna: semua dipilih */
.menu-child-count.count--all {
  background: #dcfce7;
  color: #15803d;
}
/* fallback jika tidak ada class */
.menu-child-count:not(.count--none):not(.count--some):not(.count--all) {
  background: #e0e7ff;
  color: #4338ca;
}
.menu-children {
  border-top: 1px solid #e2e8f0;
}
.menu-child-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.75rem 0.45rem 1.5rem;
  transition: background 0.1s;
}
.menu-child-row:hover {
  background: #fafafa;
}
.child-connector {
  width: 10px;
  height: 1px;
  background: #cbd5e1;
  flex-shrink: 0;
}
.menu-child-info {
  flex: 1;
  min-width: 0;
}
.menu-child-title {
  display: block;
  font-size: 0.82rem;
  color: #374151;
}
.menu-child-path {
  display: block;
  font-size: 0.68rem;
  color: #94a3b8;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.menu-no-children-note {
  border-top: 1px solid #f1f5f9;
  padding: 0.3rem 0;
}

/* ── Tabs ─────────────────────────────────────────── */
.assign-tabs {
  margin-bottom: 0;
}
.assign-tabs :deep(.p-tabpanels) {
  padding: 0.75rem 0 0;
  background: transparent;
}

/* ── Mode 2 ───────────────────────────────────────── */
.mode2-menu-panel {
  flex: 1;
}
.mode2-user-panel {
  width: 320px;
  min-width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
}
.mode2-menu-actions {
  display: flex;
  gap: 0.25rem;
}
.user-item--checkable {
  cursor: pointer;
}
.user-avatar--checked {
  background: #16a34a !important;
}
.mode2-save-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.75rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.mode2-summary {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  min-width: 0;
}
.mode2-summary--hint {
  color: #94a3b8;
  font-weight: 400;
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 820px) {
  .main-layout {
    flex-direction: column;
  }
  .user-panel {
    width: 100%;
    min-width: unset;
    max-height: 300px;
  }
  .mode2-user-panel {
    width: 100%;
    min-width: unset;
    max-height: 350px;
  }
  .menu-panel {
    max-height: unset;
  }
  .hero-section {
    flex-direction: column;
  }
  .mode-toggle {
    flex-direction: column;
  }
}
</style>
