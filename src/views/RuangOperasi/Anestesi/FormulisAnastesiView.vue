<template>
  <!-- Banner -->
  <div class="anestesi-banner mb-3">
    <div class="banner-icon"><i class="fa-solid fa-clipboard-list"></i></div>
    <div class="banner-content">
      <h4 class="banner-title">Formulir Monitoring Anestesi</h4>
      <p class="banner-desc">
        Monitoring kondisi pasien setiap 5 menit. Navigasi: Panah/Enter pindah sel &middot; Space
        centang waktu
      </p>
    </div>
    <div class="banner-status-wrap">
      <div class="save-status" :class="saveStatus.type">
        <i :class="saveStatus.icon"></i>
        <span>{{ saveStatus.message }}</span>
      </div>
    </div>
  </div>

  <div class="anestesi-card">
    <div class="anestesi-toolbar">
      <div class="toolbar-legend">
        <span
          v-for="(cfg, type) in typeGroupConfig"
          :key="type"
          class="legend-chip"
          :style="{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '55' }"
        >
          {{ cfg.label }}
        </span>
      </div>
      <div class="toolbar-actions">
        <span v-if="pendingSaves.size > 0" class="pending-badge">
          <i class="fa-solid fa-clock me-1"></i>{{ pendingSaves.size }} belum tersimpan
        </span>
        <button class="tool-action-btn" @click="showDebug = !showDebug">
          <i class="fa-solid fa-code me-1"></i>{{ showDebug ? 'Sembunyikan' : 'JSON' }}
        </button>
        <button class="tool-action-btn tool-clear" @click="clearData">
          <i class="fa-solid fa-trash me-1"></i>Clear
        </button>
        <button class="tool-action-btn tool-save" :disabled="isSavingAll" @click="saveAllData">
          <i
            :class="isSavingAll ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"
            class="me-1"
          ></i>
          {{ isSavingAll ? 'Menyimpan...' : 'Simpan Semua' }}
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-sm excel-table">
        <thead>
          <tr>
            <th class="sticky-col header-corner">Parameter \ Waktu</th>
            <th
              v-for="hour in TOTAL_HOURS"
              :key="'hour-' + hour"
              :colspan="SLOTS_PER_HOUR"
              class="text-center hour-header"
              :class="'hour-' + hour"
            >
              <i class="fa-regular fa-clock me-1"></i> Jam ke-{{ hour }}
            </th>
          </tr>
          <tr>
            <th class="sticky-col sub-header-corner"></th>
            <th
              v-for="slot in timeSlots"
              :key="slot.id"
              class="text-center slot-header"
              :class="'hour-' + slot.hour + '-sub'"
            >
              {{ slot.minute }}'
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in displayRows" :key="row.isGroupHeader ? 'gh-' + row.type : row.id">
            <tr v-if="row.isGroupHeader" class="group-header-row">
              <td
                class="sticky-col group-header-cell"
                :style="{
                  background: row.config.bg,
                  color: row.config.color,
                  borderLeft: '4px solid ' + row.config.color,
                }"
              >
                {{ row.config.label }}
              </td>
              <td
                v-for="slot in timeSlots"
                :key="slot.id"
                class="group-filler"
                :style="{ background: row.config.bg }"
              ></td>
            </tr>
            <tr v-else :data-type="row.type">
              <td class="sticky-col text-start kondisi-label">
                <i :class="row.icon" class="me-1"></i>
                <span>{{ row.name }}</span>
                <span v-if="row.unit" class="unit-badge">{{ row.unit }}</span>
              </td>
              <td
                v-for="slot in timeSlots"
                :key="row.id + '-' + slot.id"
                class="cell-td"
                :class="getCellClass(row.id, slot.id)"
              >
                <input
                  v-if="row.type === 'time'"
                  type="checkbox"
                  :checked="row.values[slot.id] === true"
                  class="cell-checkbox"
                  tabindex="0"
                  :ref="(el) => setCellRef(el, row.id, slot.id)"
                  @change="onCheckboxChange(row.id, slot.id, $event.target.checked)"
                  @keydown="handleKeydown($event, row.id, slot.id)"
                  @focus="activeCell = { kondisiId: row.id, slotId: slot.id }"
                />
                <InputText
                  v-else
                  v-model="row.values[slot.id]"
                  class="cell-input p-inputtext-sm"
                  tabindex="0"
                  :ref="(el) => setCellRef(el, row.id, slot.id)"
                  @input="onInput(row.id, slot.id)"
                  @blur="onBlur(row.id, slot.id)"
                  @keydown="handleKeydown($event, row.id, slot.id)"
                  @focus="activeCell = { kondisiId: row.id, slotId: slot.id }"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="showDebug" class="debug-panel mt-2">
      <div class="debug-header"><i class="fa-solid fa-code me-1"></i> JSON Output</div>
      <pre class="debug-body">{{ JSON.stringify(getFormattedData(), null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'

const toast = useToast()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const TOTAL_HOURS = 3
const SLOTS_PER_HOUR = 12
const MINUTES_PER_SLOT = 5

const masterData = reactive([
  {
    id: 'im',
    name: 'i.m',
    type: 'medication',
    unit: 'ml',
    icon: 'fa-solid fa-arrow-down',
    values: {},
  },
  {
    id: 'iv',
    name: 'i.v',
    type: 'medication',
    unit: 'ml',
    icon: 'fa-solid fa-syringe',
    values: {},
  },
  {
    id: 'nadi',
    name: 'Nadi',
    type: 'vital',
    unit: 'bpm',
    icon: 'fa-solid fa-heart-pulse',
    values: {},
  },
  {
    id: 'suhu',
    name: 'Suhu',
    type: 'vital',
    unit: '\u00b0C',
    icon: 'fa-solid fa-temperature-half',
    values: {},
  },
  {
    id: 'sistolik',
    name: 'Sistolik',
    type: 'pressure',
    unit: 'mmHg',
    icon: 'fa-solid fa-gauge-high',
    values: {},
  },
  {
    id: 'diastolik',
    name: 'Diastolik',
    type: 'pressure',
    unit: 'mmHg',
    icon: 'fa-solid fa-gauge',
    values: {},
  },
  {
    id: 'resp_spontan',
    name: 'Resp. Spontan',
    type: 'respiratory',
    unit: '/min',
    icon: 'fa-solid fa-lungs',
    values: {},
  },
  {
    id: 'resp_kontrol',
    name: 'Resp. Kontrol',
    type: 'respiratory',
    unit: '/min',
    icon: 'fa-solid fa-lungs-virus',
    values: {},
  },
  {
    id: 'anestesi',
    name: 'Anestesi',
    type: 'procedure',
    unit: '',
    icon: 'fa-solid fa-pills',
    values: {},
  },
  {
    id: 'operasi',
    name: 'Operasi',
    type: 'procedure',
    unit: '',
    icon: 'fa-solid fa-scalpel',
    values: {},
  },
  {
    id: 'kateter_epidural',
    name: 'Kateter Epidural',
    type: 'procedure',
    unit: '',
    icon: 'fa-solid fa-pills',
    values: {},
  },
  {
    id: 'intubasi',
    name: 'Intubasi',
    type: 'airway',
    unit: '',
    icon: 'fa-solid fa-wind',
    values: {},
  },
  {
    id: 'ekstubasi',
    name: 'Ekstubasi',
    type: 'airway',
    unit: '',
    icon: 'fa-solid fa-wind',
    values: {},
  },
  {
    id: 'mulai_anestesi',
    name: 'Mulai Anestesi',
    type: 'time',
    unit: '',
    icon: 'fa-solid fa-clock',
    values: {},
  },
  {
    id: 'selesai_anestesi',
    name: 'Selesai Anestesi',
    type: 'time',
    unit: '',
    icon: 'fa-solid fa-clock',
    values: {},
  },
  {
    id: 'mulai_operasi',
    name: 'Mulai Operasi',
    type: 'time',
    unit: '',
    icon: 'fa-solid fa-clock',
    values: {},
  },
])

const timeSlots = Array.from({ length: TOTAL_HOURS * SLOTS_PER_HOUR }, (_, i) => {
  const hour = Math.floor(i / SLOTS_PER_HOUR) + 1
  const minute = (i % SLOTS_PER_HOUR) * MINUTES_PER_SLOT
  return { id: `h${hour}_m${minute}`, hour, minute, label: `Jam ${hour} - ${minute} menit` }
})

const kondisiMap = new Map(masterData.map((k) => [k.id, k]))
const timeSlotMap = new Map(timeSlots.map((t) => [t.id, t]))

masterData.forEach((kondisi) => {
  timeSlots.forEach((slot) => {
    kondisi.values[slot.id] = kondisi.type === 'time' ? false : ''
  })
})

const showDebug = ref(false)
const isSavingAll = ref(false)
const activeCell = ref({ kondisiId: null, slotId: null })
const cellState = reactive({})
const pendingSaves = reactive(new Set())

const getCellClass = (kondisiId, slotId) => {
  const key = `${kondisiId}-${slotId}`
  return {
    'cell-saving': cellState[key] === 'saving',
    'cell-saved': cellState[key] === 'saved',
    'cell-error': cellState[key] === 'error',
  }
}

const saveStatus = computed(() => {
  const errors = Object.values(cellState).filter((s) => s === 'error').length
  if (isSavingAll.value)
    return { type: 'status-saving', icon: 'fa-solid fa-spinner fa-spin', message: 'Menyimpan...' }
  if (errors > 0)
    return {
      type: 'status-error',
      icon: 'fa-solid fa-triangle-exclamation',
      message: `${errors} gagal disimpan`,
    }
  if (pendingSaves.size > 0)
    return {
      type: 'status-pending',
      icon: 'fa-solid fa-circle-dot',
      message: 'Ada perubahan belum tersimpan',
    }
  return { type: 'status-ok', icon: 'fa-solid fa-circle-check', message: 'Tersimpan' }
})

const typeGroupConfig = {
  medication: { label: 'MEDIKASI', color: '#1d4ed8', bg: '#eff6ff' },
  vital: { label: 'TANDA VITAL', color: '#dc2626', bg: '#fff1f2' },
  pressure: { label: 'TEKANAN DARAH', color: '#9333ea', bg: '#faf5ff' },
  respiratory: { label: 'RESPIRASI', color: '#16a34a', bg: '#f0fdf4' },
  procedure: { label: 'PROSEDUR', color: '#d97706', bg: '#fffbeb' },
  airway: { label: 'JALAN NAFAS', color: '#0891b2', bg: '#ecfeff' },
  time: { label: 'PENANDA WAKTU', color: '#6b7280', bg: '#f9fafb' },
}

const displayRows = computed(() => {
  const result = []
  let lastType = null
  masterData.forEach((kondisi) => {
    if (kondisi.type !== lastType) {
      result.push({
        isGroupHeader: true,
        type: kondisi.type,
        config: typeGroupConfig[kondisi.type] ?? {
          label: kondisi.type,
          color: '#6b7280',
          bg: '#f9fafb',
        },
      })
      lastType = kondisi.type
    }
    result.push({ isGroupHeader: false, ...kondisi })
  })
  return result
})

const cellRefs = {}
const setCellRef = (el, kondisiId, slotId) => {
  const key = `${kondisiId}-${slotId}`
  if (el) cellRefs[key] = el.$el ? (el.$el.querySelector('input') ?? el.$el) : el
  else delete cellRefs[key]
}
const focusCell = async (kondisiId, slotId) => {
  await nextTick()
  cellRefs[`${kondisiId}-${slotId}`]?.focus()
  activeCell.value = { kondisiId, slotId }
}

const getIdentitas = () => ({
  kode_booking: route.query.kodebooking ?? '',
  no_register: route.query.noreg ?? '',
  id_client: id_client.value ?? '',
})

const getFormattedData = () => ({
  metadata: {
    ...getIdentitas(),
    created_at: new Date().toISOString(),
    total_kondisi: masterData.length,
    total_timeSlots: timeSlots.length,
    duration_hours: TOTAL_HOURS,
  },
  master: masterData.map(({ id, name, type, unit }) => ({ id, name, type, unit })),
  detail: masterData
    .map((k) => ({
      kondisi_id: k.id,
      kondisi_name: k.name,
      measurements: Object.entries(k.values)
        .filter(([, v]) => (k.type === 'time' ? v === true : v !== ''))
        .map(([timeId, v]) => {
          const slot = timeSlotMap.get(timeId)
          return {
            time_id: timeId,
            hour: slot?.hour,
            minute: slot?.minute,
            value: k.type === 'time' ? 'checked' : v,
            timestamp: slot?.label,
          }
        }),
    }))
    .filter((d) => d.measurements.length > 0),
})

const saveCellToApi = async (kondisiId, slotId) => {
  const kondisi = kondisiMap.get(kondisiId)
  const slot = timeSlotMap.get(slotId)
  if (!kondisi || !slot) return
  const rawValue = kondisi.values[slotId]
  const isEmpty = kondisi.type === 'time' ? rawValue === false : rawValue === ''
  if (isEmpty) {
    pendingSaves.delete(`${kondisiId}-${slotId}`)
    return
  }
  const key = `${kondisiId}-${slotId}`
  cellState[key] = 'saving'
  pendingSaves.delete(key)
  const payload = {
    kondisi_id: kondisiId,
    time_id: slotId,
    value: kondisi.type === 'time' ? 'checked' : String(rawValue),
    hour: slot.hour,
    minute: slot.minute,
    kode_booking: route.query.kodebooking ?? '',
    no_register: route.query.noreg ?? '',
    id_client: id_client.value ?? '',
    metadata: {
      kode_booking: route.query.kodebooking ?? '',
      no_register: route.query.noreg ?? '',
      id_client: id_client.value ?? '',
      created_at: new Date().toISOString(),
      total_kondisi: masterData.length,
      total_timeSlots: timeSlots.length,
      duration_hours: TOTAL_HOURS,
    },
  }
  try {
    const { data } = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/triaseigd/save_cell`,
      payload,
    )
    console.log('[Response lengkap]:', JSON.stringify(data))
    if (data.code === 200) {
      cellState[key] = 'saved'
      setTimeout(() => {
        if (cellState[key] === 'saved') delete cellState[key]
      }, 3000)
    } else throw new Error(data.message ?? 'Respon tidak dikenali')
  } catch (err) {
    cellState[key] = 'error'
    pendingSaves.add(key)
    console.error(`[save_cell] ${key}:`, err)
    toast.add({
      severity: 'error',
      summary: 'Gagal Menyimpan',
      detail: `${kondisi.name} - Jam ${slot.hour} menit ${slot.minute}`,
      life: 3000,
    })
  }
}

const get_data = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/get_cell/${route.query.kodebooking}`,
    )
    console.log('[get_data] Response:', response.data)
    if (response.data.code === 200) loadData(response.data)
    else throw new Error(response.message ?? 'Gagal memuat data')
  } catch (err) {
    console.error('[get_data]', err)
    toast.add({
      severity: 'error',
      summary: 'Gagal Memuat',
      detail: 'Tidak dapat memuat data formulir anestesi',
      life: 3000,
    })
  }
}

const saveAllData = async () => {
  isSavingAll.value = true
  try {
    const { data } = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/triaseigd/form_anestesi`,
      { ...getIdentitas(), ...getFormattedData() },
    )
    if (data.code === 200) {
      Object.keys(cellState).forEach((key) => {
        cellState[key] = 'saved'
        setTimeout(() => {
          if (cellState[key] === 'saved') delete cellState[key]
        }, 3000)
      })
      pendingSaves.clear()
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: 'Semua data berhasil disimpan',
        life: 3000,
      })
    } else throw new Error(data.message ?? 'Gagal menyimpan')
  } catch (err) {
    console.error('[saveAllData]', err)
    pendingSaves.forEach((key) => {
      cellState[key] = 'error'
    })
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal menyimpan semua data',
      life: 3000,
    })
  } finally {
    isSavingAll.value = false
  }
}

const onInput = (kondisiId, slotId) => {
  pendingSaves.add(`${kondisiId}-${slotId}`)
}
const onBlur = (kondisiId, slotId) => {
  if (pendingSaves.has(`${kondisiId}-${slotId}`)) saveCellToApi(kondisiId, slotId)
}
const onCheckboxChange = (kondisiId, slotId, checked) => {
  const kondisi = kondisiMap.get(kondisiId)
  if (!kondisi) return
  kondisi.values[slotId] = Boolean(checked)
  saveCellToApi(kondisiId, slotId)
}

const handleKeydown = (event, kondisiId, slotId) => {
  const ki = masterData.findIndex((k) => k.id === kondisiId)
  const ti = timeSlots.findIndex((t) => t.id === slotId)
  const moves = {
    ArrowUp: [ki - 1, ti],
    ArrowDown: [ki + 1, ti],
    Enter: [ki + 1, ti],
    ArrowLeft: [ki, ti - 1],
    ArrowRight: [ki, ti + 1],
  }
  if (event.key === 'Escape') {
    event.target.blur()
    return
  }
  if ((event.key === ' ' || event.key === 'Space') && kondisiMap.get(kondisiId)?.type === 'time') {
    event.preventDefault()
    const kondisi = kondisiMap.get(kondisiId)
    kondisi.values[slotId] = !kondisi.values[slotId]
    saveCellToApi(kondisiId, slotId)
    return
  }
  if (!moves[event.key]) return
  event.preventDefault()
  cellRefs[`${kondisiId}-${slotId}`]?.blur()
  const [nextKi, nextTi] = moves[event.key]
  const nextKondisiId = masterData[Math.max(0, Math.min(masterData.length - 1, nextKi))]?.id
  const nextSlotId = timeSlots[Math.max(0, Math.min(timeSlots.length - 1, nextTi))]?.id
  if (nextKondisiId && nextSlotId) focusCell(nextKondisiId, nextSlotId)
}

const loadData = (jsonData) => {
  try {
    jsonData.detail?.forEach(({ kondisi_id, measurements }) => {
      const kondisi = kondisiMap.get(kondisi_id)
      if (!kondisi) return
      measurements.forEach(({ time_id, value }) => {
        kondisi.values[time_id] = kondisi.type === 'time' ? value === 'checked' : value
      })
    })
  } catch (err) {
    console.error('[loadData]', err)
  }
}

const clearData = () => {
  if (!confirm('Hapus semua data?')) return
  masterData.forEach((k) => {
    Object.keys(k.values).forEach((key) => {
      k.values[key] = k.type === 'time' ? false : ''
    })
  })
  Object.keys(cellState).forEach((k) => delete cellState[k])
  pendingSaves.clear()
}

onMounted(() => {
  get_data()
})
defineExpose({ masterData, timeSlots, getFormattedData, loadData, clearData, saveAllData })
</script>

<style scoped>
.anestesi-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%);
  border-radius: 4px;
  padding: 0.9rem 1.4rem;
  color: #fff;
}
.banner-icon {
  flex-shrink: 0;
  font-size: 1.8rem;
  opacity: 0.85;
}
.banner-title {
  margin: 0 0 0.15rem;
  font-size: 1rem;
  font-weight: 700;
}
.banner-desc {
  margin: 0;
  font-size: 0.76rem;
  opacity: 0.82;
  line-height: 1.45;
}
.banner-status-wrap {
  flex-shrink: 0;
  margin-left: auto;
}
.save-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}
.status-ok {
  background: #d1fae5;
  color: #065f46;
}
.status-saving {
  background: #dbeafe;
  color: #1e40af;
}
.status-pending {
  background: #fef9c3;
  color: #854d0e;
}
.status-error {
  background: #fee2e2;
  color: #991b1b;
}
.anestesi-card {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}
.anestesi-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.toolbar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  flex: 1;
}
.legend-chip {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  border: 1px solid;
  letter-spacing: 0.03em;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}
.pending-badge {
  font-size: 0.72rem;
  color: #92400e;
  background: #fef3c7;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
.tool-action-btn {
  display: flex;
  align-items: center;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
  color: #374151;
}
.tool-action-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #9ca3af;
}
.tool-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.tool-clear:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #d97706;
  color: #92400e;
}
.tool-save {
  background: linear-gradient(135deg, #0f172a, #1e40af);
  color: #fff;
  border: none;
}
.tool-save:hover:not(:disabled) {
  opacity: 0.9;
}
.table-responsive {
  overflow-x: auto;
  max-height: 72vh;
}
.excel-table {
  border-collapse: collapse;
  font-size: 12px;
}
.excel-table th,
.excel-table td {
  border: 1px solid #dee2e6 !important;
  padding: 0 !important;
  text-align: center;
  vertical-align: middle;
}
.excel-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 11px;
}
.excel-table thead tr:nth-child(2) th {
  top: 28px;
}
.sticky-col {
  position: sticky;
  left: 0;
  z-index: 5;
  background: #f8f9fa;
}
.header-corner {
  background: #1e293b !important;
  color: #fff;
  font-size: 10px;
  min-width: 150px;
  padding: 4px 8px !important;
  z-index: 15 !important;
}
.sub-header-corner {
  background: #f8f9fa;
  z-index: 15 !important;
}
.hour-header {
  font-size: 11px;
  font-weight: 700;
  padding: 4px !important;
}
.hour-1 {
  background: #dbeafe;
  color: #1e40af;
}
.hour-2 {
  background: #dcfce7;
  color: #14532d;
}
.hour-3 {
  background: #fef3c7;
  color: #78350f;
}
.hour-1-sub {
  background: #eff6ff;
  font-size: 10px;
  color: #1d4ed8;
}
.hour-2-sub {
  background: #f0fdf4;
  font-size: 10px;
  color: #15803d;
}
.hour-3-sub {
  background: #fffbeb;
  font-size: 10px;
  color: #b45309;
}
.slot-header {
  min-width: 38px;
  font-weight: 500;
}
.group-header-row td {
  padding: 3px 8px !important;
}
.group-header-cell {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  min-width: 150px;
  padding: 3px 8px !important;
}
.group-filler {
  height: 18px;
  opacity: 0.35;
}
.kondisi-label {
  min-width: 150px;
  font-weight: 500;
  padding: 4px 8px !important;
  white-space: nowrap;
  font-size: 12px;
  color: #374151;
}
.unit-badge {
  font-size: 9px;
  color: #9ca3af;
  margin-left: 3px;
}
.cell-td {
  padding: 0 !important;
}
.cell-input {
  border: none !important;
  width: 38px;
  height: 32px;
  text-align: center;
  background: transparent;
  font-size: 11px;
}
.cell-input:hover {
  background: #eff6ff !important;
  border: 2px solid #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  position: relative;
  z-index: 20;
}
.cell-input:focus {
  outline: none;
  border: 2px solid #1d4ed8 !important;
  background: #dbeafe !important;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.25) !important;
  position: relative;
  z-index: 30;
}
.cell-checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  transform: scale(1.2);
  accent-color: #1d4ed8;
}
.cell-checkbox:hover {
  transform: scale(1.4);
}
.cell-checkbox:focus {
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}
.cell-saving {
  background: rgba(219, 234, 254, 0.7) !important;
}
.cell-saved {
  background: rgba(209, 250, 229, 0.7) !important;
  transition: background 0.5s;
}
.cell-error {
  background: rgba(254, 202, 202, 0.9) !important;
  outline: 2px solid #ef4444;
}
.excel-table tbody tr:hover td {
  background: rgba(255, 251, 235, 0.5) !important;
}
.excel-table tbody tr:hover .sticky-col {
  background: rgba(254, 243, 199, 0.7) !important;
}
.excel-table td:hover {
  background: rgba(59, 130, 246, 0.07) !important;
}
tr[data-type='medication'] .sticky-col {
  background: #eff6ff;
  border-left: 3px solid #3b82f6 !important;
}
tr[data-type='vital'] .sticky-col {
  background: #fff1f2;
  border-left: 3px solid #f43f5e !important;
}
tr[data-type='pressure'] .sticky-col {
  background: #faf5ff;
  border-left: 3px solid #a855f7 !important;
}
tr[data-type='respiratory'] .sticky-col {
  background: #f0fdf4;
  border-left: 3px solid #22c55e !important;
}
tr[data-type='procedure'] .sticky-col {
  background: #fffbeb;
  border-left: 3px solid #f59e0b !important;
}
tr[data-type='airway'] .sticky-col {
  background: #ecfeff;
  border-left: 3px solid #06b6d4 !important;
}
tr[data-type='time'] .sticky-col {
  background: #f9fafb;
  border-left: 3px solid #94a3b8 !important;
}
.debug-panel {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
.debug-header {
  padding: 0.4rem 0.75rem;
  background: #1e293b;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
}
.debug-body {
  font-size: 11px;
  max-height: 300px;
  overflow-y: auto;
  background: #0f172a;
  color: #94a3b8;
  padding: 0.75rem;
  margin: 0;
}
@media (max-width: 768px) {
  .anestesi-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .banner-status-wrap {
    margin-left: 0;
  }
  .toolbar-legend {
    display: none;
  }
}
</style>
