<template>
  <div class="content">
    <Toast />
    <!-- Hero -->
    <div class="hero-section">
      <div class="hero-icon"><i class="pi pi-lock"></i></div>
      <div class="hero-text">
        <h1 class="hero-title">Akses Button Monitoring Ranap</h1>
        <p class="hero-desc">
          Atur tombol mana saja yang dapat diakses oleh setiap dokter pada halaman Monitoring Pasien
          Rawat Inap.
        </p>
      </div>
    </div>

    <div class="setting-card">
      <!-- Mode Tab (PrimeVue 4) -->
      <Tabs v-model:value="mode" @update:value="onTabChange">
        <TabList>
          <Tab value="1"><i class="pi pi-user mr-2"></i>Mode 1 — Satu Dokter</Tab>
          <Tab value="2"><i class="pi pi-users mr-2"></i>Mode 2 — Beberapa Dokter</Tab>
        </TabList>

        <TabPanels>
          <!-- Mode 1: Satu dokter -->
          <TabPanel value="1">
            <div class="setting-section">
              <label class="setting-label"><i class="pi pi-user mr-1"></i> Pilih Dokter</label>
              <Select
                v-model="selectedDokter"
                :options="listDokter"
                optionLabel="NAMADOKTER"
                placeholder="Cari dan pilih dokter..."
                filter
                showClear
                class="w-full"
                @change="onDokterChange"
                :loading="loadingDokter"
              />
            </div>
          </TabPanel>

          <!-- Mode 2: Beberapa dokter -->
          <TabPanel value="2">
            <div class="setting-section">
              <label class="setting-label"
                ><i class="pi pi-users mr-1"></i> Pilih Dokter (bisa lebih dari 1)</label
              >
              <MultiSelect
                v-model="selectedDokterList"
                :options="listDokter"
                optionLabel="NAMADOKTER"
                placeholder="Cari dan pilih dokter..."
                filter
                :maxSelectedLabels="0"
                selectedItemsLabel="{0} dokter dipilih"
                class="w-full"
                :loading="loadingDokter"
                @change="onDokterListChange"
              />
              <!-- List dokter terpilih (muncul jika > 5) -->
              <div v-if="selectedDokterList.length > 5" class="selected-dokter-list">
                <div class="selected-dokter-list-header">
                  <i class="pi pi-users mr-1"></i>
                  {{ selectedDokterList.length }} Dokter Terpilih
                </div>
                <div class="selected-dokter-grid">
                  <div
                    v-for="(d, i) in selectedDokterList"
                    :key="d.KDDOKTER"
                    class="selected-dokter-item"
                  >
                    <span class="selected-dokter-num">{{ i + 1 }}</span>
                    <span class="selected-dokter-name">{{ d.NAMADOKTER }}</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedDokterList.length > 0" class="mode2-info">
                <i class="pi pi-info-circle mr-1"></i>
                Konfigurasi yang sama akan diterapkan ke
                <strong>{{ selectedDokterList.length }} dokter</strong> terpilih. Konfigurasi lama
                tiap dokter akan ditimpa.
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <!-- Panel Button -->
      <div v-if="panelVisible" class="button-panel">
        <div class="button-panel-header">
          <div class="button-panel-title">
            <i class="pi pi-th-large mr-2"></i>
            <template v-if="mode === '1'">
              Hak Akses Button — {{ selectedDokter.NAMADOKTER }}
            </template>
            <template v-else>
              Hak Akses Button — diterapkan ke {{ selectedDokterList.length }} dokter
            </template>
          </div>
          <div class="button-panel-actions">
            <Button
              label="Pilih Semua"
              icon="pi pi-check-square"
              size="small"
              severity="secondary"
              outlined
              @click="selectAll"
            />
            <Button
              label="Hapus Semua"
              icon="pi pi-times"
              size="small"
              severity="danger"
              outlined
              @click="clearAll"
            />
          </div>
        </div>

        <div v-if="loadingButtons" class="loading-state">
          <i class="pi pi-spin pi-spinner mr-2"></i> Memuat data...
        </div>

        <div v-else class="button-grid">
          <div
            v-for="btn in allButtons"
            :key="btn.key"
            class="button-item"
            :class="{ active: selectedKeys.includes(btn.key) }"
            @click="toggleKey(btn.key)"
          >
            <Checkbox
              :modelValue="selectedKeys.includes(btn.key)"
              :binary="true"
              @change="toggleKey(btn.key)"
              @click.stop
            />
            <div class="button-item-info">
              <i :class="btn.icon" class="button-item-icon"></i>
              <span class="button-item-label">{{ btn.label }}</span>
            </div>
            <Tag
              :value="btn.severity"
              :severity="
                btn.severity === 'warn'
                  ? 'warn'
                  : btn.severity === 'danger'
                    ? 'danger'
                    : btn.severity === 'success'
                      ? 'success'
                      : btn.severity === 'secondary'
                        ? 'secondary'
                        : 'info'
              "
              class="button-item-tag"
            />
          </div>
        </div>

        <div class="button-panel-footer">
          <span class="footer-info">
            <i class="pi pi-info-circle mr-1"></i>
            {{ selectedKeys.length }} dari {{ allButtons.length }} button dipilih
            <span v-if="selectedKeys.length === 0" class="text-muted ml-1"
              >(semua button tampil jika kosong)</span
            >
          </span>
          <Button
            :label="mode === '2' ? `Simpan ke ${selectedDokterList.length} Dokter` : 'Simpan'"
            icon="pi pi-save"
            :loading="loadingSave"
            @click="simpan"
          />
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="pi pi-arrow-up" style="font-size: 2rem; color: #94a3b8"></i>
        <p v-if="mode === '1'">Pilih dokter terlebih dahulu untuk mengatur akses button.</p>
        <p v-else>Pilih minimal satu dokter untuk mengatur akses button.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const mode = ref('1') // '1' atau '2'

const listDokter = ref([])
const selectedDokter = ref(null) // mode 1
const selectedDokterList = ref([]) // mode 2
const loadingDokter = ref(false)

const allButtons = ref([])
const selectedKeys = ref([])
const loadingButtons = ref(false)
const loadingSave = ref(false)

const panelVisible = computed(() => {
  if (mode.value === '1') return !!selectedDokter.value
  return selectedDokterList.value.length > 0
})

function onTabChange() {
  selectedDokter.value = null
  selectedDokterList.value = []
  selectedKeys.value = []
}

async function fetchDokter() {
  loadingDokter.value = true
  try {
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/datadokterv3`,
      { id_client: id_client.value, mode: 2 },
    )
    listDokter.value = response.data?.response ?? []
  } catch {
    listDokter.value = []
  } finally {
    loadingDokter.value = false
  }
}

async function fetchAllButtons() {
  try {
    const res = await axios.get(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/button_ranap`,
    )
    allButtons.value = Array.isArray(res.data) ? res.data : []
  } catch {
    allButtons.value = []
  }
}

async function fetchAkses() {
  if (!selectedDokter.value) return
  loadingButtons.value = true
  try {
    const res = await axios.get(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/akses_button_ranap`,
      { params: { kddokter: selectedDokter.value.KDDOKTER, id_client: id_client.value } },
    )
    selectedKeys.value = res.data.button_keys ?? []
  } catch {
    selectedKeys.value = []
  } finally {
    loadingButtons.value = false
  }
}

function onDokterChange() {
  selectedKeys.value = []
  if (selectedDokter.value) fetchAkses()
}

function onDokterListChange() {
  // Mode 2: tidak auto-fetch, user konfigurasi dari awal
  if (selectedDokterList.value.length === 0) selectedKeys.value = []
}

function toggleKey(key) {
  const idx = selectedKeys.value.indexOf(key)
  if (idx === -1) selectedKeys.value.push(key)
  else selectedKeys.value.splice(idx, 1)
}

function selectAll() {
  selectedKeys.value = allButtons.value.map((b) => b.key)
}

function clearAll() {
  selectedKeys.value = []
}

async function saveForDokter(kddokter) {
  const response = await axios.post(
    `${configStore.apiBaseUrl}/index.php/api/data_referensi/save_akses_button_ranap`,
    {
      kddokter,
      id_client: id_client.value,
      button_keys: selectedKeys.value.length > 0 ? selectedKeys.value : null,
    },
  )
  return response.data
}

async function simpan() {
  if (!panelVisible.value) return

  loadingSave.value = true
  try {
    if (mode.value === '1') {
      const data = await saveForDokter(selectedDokter.value.KDDOKTER)
      if (data?.code === 200) {
        toast.add({ severity: 'success', summary: 'Berhasil', detail: data.message, life: 3000 })
      } else {
        toast.add({
          severity: 'warn',
          summary: 'Perhatian',
          detail: data?.message ?? 'Respons tidak dikenali',
          life: 3000,
        })
      }
    } else {
      let sukses = 0
      let gagal = 0
      for (const dokter of selectedDokterList.value) {
        try {
          const data = await saveForDokter(dokter.KDDOKTER)
          if (data?.code === 200) sukses++
          else gagal++
        } catch {
          gagal++
        }
      }
      if (gagal === 0) {
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: `Akses button berhasil disimpan ke ${sukses} dokter.`,
          life: 3000,
        })
      } else {
        toast.add({
          severity: 'warn',
          summary: 'Sebagian Berhasil',
          detail: `${sukses} dokter berhasil, ${gagal} dokter gagal disimpan.`,
          life: 4000,
        })
      }
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Terjadi kesalahan saat menyimpan',
      life: 3000,
    })
  } finally {
    loadingSave.value = false
  }
}

onMounted(() => {
  fetchDokter()
  fetchAllButtons()
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 20px rgba(14, 165, 233, 0.25);
}
.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.6rem;
  font-size: 1.2rem;
}
.hero-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.1rem 0;
}
.hero-desc {
  font-size: 0.75rem;
  opacity: 0.85;
  margin: 0;
}

.setting-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.setting-section {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}
.setting-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mode2-info {
  margin-top: 0.6rem;
  font-size: 0.78rem;
  color: #0369a1;
  background: #e0f2fe;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
}

.selected-dokter-list {
  margin-top: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.selected-dokter-list-header {
  padding: 0.4rem 0.75rem;
  background: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}
.selected-dokter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  max-height: 180px;
  overflow-y: auto;
}
.selected-dokter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
}
.selected-dokter-num {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  min-width: 1.2rem;
  text-align: right;
}
.selected-dokter-name {
  font-size: 0.78rem;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Button Panel */
.button-panel {
  padding: 0;
}
.button-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.button-panel-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
}
.button-panel-actions {
  display: flex;
  gap: 0.5rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}
.button-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  background: #fafafa;
}
.button-item:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}
.button-item.active {
  border-color: var(--p-primary-color, #0ea5e9);
  background: var(--p-primary-50, #e0f2fe);
}
.button-item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.button-item-icon {
  font-size: 0.8rem;
  color: #64748b;
  flex-shrink: 0;
}
.button-item-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.button-item-tag {
  font-size: 0.65rem !important;
  flex-shrink: 0;
}

.button-panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.footer-info {
  font-size: 0.8rem;
  color: #64748b;
}
.text-muted {
  color: #94a3b8;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}
.loading-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .button-grid {
    grid-template-columns: 1fr 1fr;
  }
  .button-panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
