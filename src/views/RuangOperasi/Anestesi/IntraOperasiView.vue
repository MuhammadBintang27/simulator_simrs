<template>
  <!-- BANNER -->
  <div class="intra-banner mb-2">
    <div class="banner-icon"><i class="fa-solid fa-heart-pulse"></i></div>
    <div class="banner-content">
      <h4 class="banner-title">Monitoring Intra Operasi</h4>
      <p class="banner-desc">
        Monitoring tanda vital setiap 5 menit selama 3 jam &middot; Klik cell untuk input angka
      </p>
    </div>
    <div class="ms-auto d-flex align-items-center gap-2">
      <span v-if="pendingSaves.size > 0" class="pending-badge">
        <i class="fa-solid fa-clock me-1"></i>{{ pendingSaves.size }} belum tersimpan
      </span>
      <button class="btn-banner-save" :disabled="isSaving" @click="saveAll">
        <i
          :class="isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"
          class="me-1"
        ></i>
        {{ isSaving ? 'Menyimpan...' : 'Simpan Semua' }}
      </button>
    </div>
  </div>

  <!-- ===== MONITORING GRID (full screen) ===== -->
  <div class="intra-card grid-card">
    <div class="intra-card-header">
      <i class="fa-solid fa-chart-line me-2"></i>MONITORING
      <div class="ms-auto legend-wrap">
        <span class="leg"><b>▼</b> TD Sistolik</span>
        <span class="leg"><b>▲</b> TD Diastolik</span>
        <span class="leg"><b>•</b> Nadi</span>
        <span class="leg"><b>X</b> Induksi</span>
        <span class="leg"><b>T</b> Intubasi</span>
        <span class="leg"><b>↓</b> Ekstubasi</span>
      </div>
    </div>

    <!-- Zoom toolbar -->
    <div class="zoom-toolbar">
      <!-- Horizontal (lebar kolom) -->
      <i class="fa-solid fa-arrows-left-right zoom-icon" title="Lebar kolom"></i>
      <button
        class="zoom-btn"
        :disabled="cellSize <= 24"
        @click="cellSize = Math.max(24, cellSize - 4)"
        title="Perkecil lebar"
      >
        <i class="fa-solid fa-minus"></i>
      </button>
      <input
        type="range"
        v-model.number="cellSize"
        min="24"
        max="72"
        step="4"
        class="zoom-slider"
        title="Lebar kolom"
      />
      <button
        class="zoom-btn"
        :disabled="cellSize >= 72"
        @click="cellSize = Math.min(72, cellSize + 4)"
        title="Perbesar lebar"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
      <span class="zoom-label">{{ cellSize }}px</span>

      <span class="zoom-sep"></span>

      <!-- Vertikal (tinggi baris) -->
      <i class="fa-solid fa-arrows-up-down zoom-icon" title="Tinggi baris"></i>
      <button
        class="zoom-btn"
        :disabled="rowSize <= 20"
        @click="rowSize = Math.max(20, rowSize - 4)"
        title="Perkecil tinggi"
      >
        <i class="fa-solid fa-minus"></i>
      </button>
      <input
        type="range"
        v-model.number="rowSize"
        min="20"
        max="64"
        step="4"
        class="zoom-slider"
        title="Tinggi baris"
      />
      <button
        class="zoom-btn"
        :disabled="rowSize >= 64"
        @click="rowSize = Math.min(64, rowSize + 4)"
        title="Perbesar tinggi"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
      <span class="zoom-label">{{ rowSize }}px</span>

      <button class="zoom-reset ms-1" @click="resetZoomGrid" title="Reset semua ukuran">
        <i class="fa-solid fa-arrows-to-dot"></i>
      </button>
    </div>

    <div class="table-scroll" ref="tableScrollRef">
      <table class="excel-table" :style="cellStyle">
        <thead>
          <tr>
            <th class="sticky-col corner-th">Parameter</th>
            <th
              v-for="hour in TOTAL_HOURS"
              :key="hour"
              :colspan="SLOTS_PER_HOUR"
              class="hour-th"
              :class="'h' + hour"
            >
              Jam ke-{{ hour }}
            </th>
          </tr>
          <tr>
            <th class="sticky-col corner-th2"></th>
            <th
              v-for="slot in timeSlots"
              :key="slot.id"
              class="slot-th"
              :class="'h' + slot.hour + 's'"
            >
              {{ slot.minute }}'
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Gas / Vital group -->
          <tr class="group-sep">
            <td class="sticky-col group-td gas-group">O₂ / GAS &amp; TANDA VITAL</td>
            <td v-for="slot in timeSlots" :key="slot.id" class="group-fill gas-group"></td>
          </tr>
          <tr v-for="row in gasRows" :key="row.id" :data-type="row.type">
            <td class="sticky-col param-td">
              <i :class="row.icon" class="me-1"></i>{{ row.name }}
              <span v-if="row.unit" class="unit-badge">{{ row.unit }}</span>
            </td>
            <td
              v-for="slot in timeSlots"
              :key="row.id + '-' + slot.id"
              class="data-td"
              :class="gridState[row.id + '-' + slot.id]"
            >
              <div class="cell-wrap">
                <!-- Opsi 1: ketik langsung -->
                <input
                  v-model="row.values[slot.id]"
                  type="text"
                  class="cell-kbd"
                  :ref="(el) => setRef(el, row.id, slot.id)"
                  @focus="$event.target.select()"
                  @input="onInput(row.id, slot.id)"
                  @blur="onBlur(row.id, slot.id)"
                  @keydown="onKey($event, row.id, slot.id)"
                />
                <!-- Opsi 2: quick pick button -->
                <button
                  class="cell-pick-btn"
                  tabindex="-1"
                  title="Quick pick"
                  @mousedown.prevent="openPickerFromTd($event, row.id, slot.id)"
                >
                  <i class="fa-solid fa-table-cells-large"></i>
                </button>
              </div>
            </td>
          </tr>

          <!-- Penanda Waktu group -->
          <tr class="group-sep">
            <td class="sticky-col group-td time-group">PENANDA WAKTU</td>
            <td v-for="slot in timeSlots" :key="slot.id" class="group-fill time-group"></td>
          </tr>
          <tr v-for="row in timeRows" :key="row.id" data-type="time">
            <td class="sticky-col param-td time-param">
              <i class="fa-solid fa-clock me-1"></i>{{ row.name }}
            </td>
            <td v-for="slot in timeSlots" :key="row.id + '-' + slot.id" class="data-td radio-td">
              <input
                type="radio"
                :name="row.id"
                :value="slot.id"
                v-model="row.selected"
                class="cell-radio"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="legend-bottom">
      <span class="leg-sep">Tanda-tanda:</span>
      <span class="leg"><b>•</b> Nadi</span>
      <span class="leg"><b>○</b> Pernafasan</span>
      <span class="leg"><b>▼</b> TD Sistolik</span>
      <span class="leg"><b>▲</b> TD Diastolik</span>
      <span class="leg"><b>X</b> Induksi</span>
      <span class="leg"><b>T</b> Intubasi</span>
      <span class="leg"><b>↓</b> Ekstubasi</span>
      <span class="leg"><b>▲</b> Infus Kristaloid</span>
      <span class="leg"><b>△</b> Infus Koloid</span>
      <span class="leg"><b>▽</b> Transfusi</span>
      <span class="leg"><b>←K</b> Akhir Anestesi</span>
      <span class="leg"><b>←O</b> Akhir Operasi</span>
    </div>
  </div>

  <!-- ===== GRAFIK VITAL SIGNS ===== -->
  <div class="intra-card mt-2 mb-3">
    <div class="intra-card-header">
      <i class="fa-solid fa-chart-area me-2"></i>GRAFIK TANDA VITAL
      <span class="chart-hint ms-2">
        <i class="fa-solid fa-magnifying-glass-plus"></i> Scroll untuk zoom &middot;
        <i class="fa-solid fa-hand"></i> Drag untuk geser &middot; Klik legend untuk sembunyikan
      </span>
      <div class="ms-auto d-flex gap-2">
        <button class="chart-ctrl-btn" @click="resetZoom" title="Reset zoom">
          <i class="fa-solid fa-expand"></i>
        </button>
      </div>
    </div>
    <div class="chart-wrap">
      <VChart ref="chartRef" :option="chartOption" autoresize class="vital-chart" />
    </div>
  </div>

  <!-- ===== MEDIKASI & CAIRAN ===== -->
  <div class="row g-3 mb-3 mt-2">
    <div class="col-md-6">
      <div class="intra-card h-100">
        <div class="intra-card-header"><i class="fa-solid fa-syringe me-2"></i>MEDIKASI</div>
        <div class="intra-card-body">
          <div class="list-grid">
            <div v-for="n in 14" :key="'med-' + n" class="list-row">
              <span class="list-num">{{ n }}.</span>
              <InputText
                v-model="medikasi[n - 1]"
                size="small"
                :placeholder="'Medikasi ' + n"
                class="w-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="intra-card h-100">
        <div class="intra-card-header">
          <i class="fa-solid fa-bottle-water me-2"></i>PEMBERIAN CAIRAN
        </div>
        <div class="intra-card-body">
          <div class="list-grid">
            <div v-for="n in 14" :key="'cair-' + n" class="list-row">
              <span class="list-num">{{ n }}.</span>
              <InputText
                v-model="cairan[n - 1]"
                size="small"
                :placeholder="'Cairan ' + n"
                class="w-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== MASALAH & TINDAKAN ===== -->
  <div class="row g-3">
    <div class="col-md-6">
      <div class="intra-card">
        <div class="intra-card-header">
          <i class="fa-solid fa-triangle-exclamation me-2"></i>MASALAH DURANTE OPERASI
        </div>
        <div class="intra-card-body">
          <Textarea
            v-model="masalah"
            rows="4"
            class="w-100"
            placeholder="Masalah selama operasi..."
            autoResize
          />
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="intra-card">
        <div class="intra-card-header"><i class="fa-solid fa-list-check me-2"></i>TINDAKAN</div>
        <div class="intra-card-body">
          <Textarea
            v-model="tindakan"
            rows="4"
            class="w-100"
            placeholder="Tindakan yang dilakukan..."
            autoResize
          />
        </div>
      </div>
    </div>
  </div>

  <!-- ===== VALUE PICKER OVERLAY ===== -->
  <Teleport to="body">
    <div v-if="picker.visible" class="picker-backdrop" @click.self="closePicker(false)"></div>
    <Transition name="picker-pop">
      <div v-if="picker.visible" class="picker-panel" :style="pickerStyle" @mousedown.prevent>
        <!-- Header: nama + nilai aktif -->
        <div class="picker-header">
          <div class="picker-header-left">
            <span class="picker-param">{{ pickerRow?.name }}</span>
            <span class="picker-unit">{{ pickerRow?.unit }}</span>
          </div>
          <div class="picker-header-right">
            <span class="picker-display">{{ picker.value || '—' }}</span>
            <button class="picker-clear" @click="clearPicker" title="Hapus">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Input manual -->
        <div class="picker-search">
          <input
            ref="pickerInputRef"
            v-model="picker.inputText"
            class="picker-input"
            placeholder="Ketik nilai atau cari..."
            @keydown.enter.prevent="confirmInput"
            @keydown.escape.prevent="closePicker(false)"
          />
          <button
            v-if="isNewValue"
            class="add-btn"
            @click="addCustomValue"
            title="Tambahkan nilai baru"
          >
            <i class="fa-solid fa-plus me-1"></i>Tambah
          </button>
        </div>

        <!-- Value grid (scrollable) -->
        <div class="picker-values" ref="pickerValuesRef">
          <button
            v-for="val in pickerFilteredOptions"
            :key="val"
            class="val-btn"
            :class="{ 'val-active': picker.value === String(val) }"
            @click="selectValue(val)"
          >
            {{ val }}
          </button>
          <div v-if="pickerFilteredOptions.length === 0" class="val-empty">
            Tidak ada pilihan &middot; tekan Enter untuk tambah
          </div>
        </div>

        <!-- Footer -->
        <div class="picker-footer">
          <button class="foot-btn foot-cancel" @click="closePicker(false)">Batal</button>
          <button class="foot-btn foot-ok" @click="closePicker(true)">
            <i class="fa-solid fa-check me-1"></i>OK
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from 'echarts/components'
import axios from 'axios'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkAreaComponent,
])
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

const tableScrollRef = ref(null)

// ── Lists ────────────────────────────────────────────────────────────────────
const medikasi = reactive(Array(14).fill(''))
const cairan = reactive(Array(14).fill(''))
const masalah = ref('')
const tindakan = ref('')

// ── Time slots ───────────────────────────────────────────────────────────────
const timeSlots = Array.from({ length: TOTAL_HOURS * SLOTS_PER_HOUR }, (_, i) => {
  const hour = Math.floor(i / SLOTS_PER_HOUR) + 1
  const minute = (i % SLOTS_PER_HOUR) * MINUTES_PER_SLOT
  return { id: `h${hour}_m${minute}`, hour, minute }
})
const slotMap = new Map(timeSlots.map((s) => [s.id, s]))

// helper: generate range array
const range = (min, max, step = 1) => {
  const result = []
  const factor = 1 / step
  for (let v = Math.round(min * factor); v <= Math.round(max * factor); v++) {
    result.push(Math.round((v / factor) * 10) / 10)
  }
  return result
}

// ── Gas / vital rows ──────────────────────────────────────────────────────────
const gasRows = reactive([
  {
    id: 'o2',
    name: 'O₂',
    type: 'gas',
    unit: 'L/mnt',
    icon: 'fa-solid fa-wind',
    values: {},
    options: range(0, 15, 0.5),
  },
  {
    id: 'n2o',
    name: 'N₂O',
    type: 'gas',
    unit: 'L/mnt',
    icon: 'fa-solid fa-vial',
    values: {},
    options: range(0, 10, 0.5),
  },
  {
    id: 'volatile',
    name: 'Volatile',
    type: 'gas',
    unit: '%',
    icon: 'fa-solid fa-flask',
    values: {},
    options: range(0, 8, 0.5),
  },
  {
    id: 'ekg',
    name: 'EKG',
    type: 'gas',
    unit: '',
    icon: 'fa-solid fa-wave-square',
    values: {},
    options: ['SR', 'SVT', 'AF', 'VF', 'VT', 'Asistol', 'PEA', 'LBBB', 'RBBB'],
  },
  {
    id: 'spo2',
    name: 'SpO₂',
    type: 'vital',
    unit: '%',
    icon: 'fa-solid fa-droplet',
    values: {},
    options: range(50, 100),
  },
  {
    id: 'sistolik',
    name: 'TD Sistolik',
    type: 'vital',
    unit: 'mmHg',
    icon: 'fa-solid fa-gauge-high',
    values: {},
    options: range(40, 200, 5),
  },
  {
    id: 'diastolik',
    name: 'TD Diastolik',
    type: 'vital',
    unit: 'mmHg',
    icon: 'fa-solid fa-gauge',
    values: {},
    options: range(20, 140, 5),
  },
  {
    id: 'nadi',
    name: 'Nadi',
    type: 'vital',
    unit: 'bpm',
    icon: 'fa-solid fa-heart-pulse',
    values: {},
    options: range(20, 200, 5),
  },
  {
    id: 'suhu',
    name: 'Suhu',
    type: 'vital',
    unit: '°C',
    icon: 'fa-solid fa-temperature-half',
    values: {},
    options: range(33, 42, 0.5),
  },
])

// ── Penanda waktu rows ────────────────────────────────────────────────────────
const timeRows = reactive([
  { id: 't_induksi', name: 'Induksi', selected: null },
  { id: 't_inhalasi', name: 'Inhalasi', selected: null },
  { id: 't_intubasi', name: 'Intubasi', selected: null },
  { id: 't_op_mulai', name: 'Mulai Operasi', selected: null },
  { id: 't_op_done', name: 'Selesai Operasi', selected: null },
  { id: 't_ekstubasi', name: 'Ekstubasi', selected: null },
  { id: 't_an_done', name: 'Akhir Anestesi', selected: null },
])

const gasMap = new Map(gasRows.map((r) => [r.id, r]))
gasRows.forEach((r) =>
  timeSlots.forEach((s) => {
    r.values[s.id] = ''
  }),
)

// ── Chart ─────────────────────────────────────────────────────────────────────
const chartRef = ref(null)

const xLabels = timeSlots.map((s) => (s.minute === 0 ? `Jam ${s.hour}` : `${s.minute}'`))

const getSeriesData = (rowId) =>
  timeSlots.map((s) => {
    const v = gasMap.get(rowId)?.values[s.id]
    return v !== '' && v !== undefined ? Number(v) : null
  })

const timeMarkLines = computed(() => {
  const lines = []
  timeRows.forEach((row) => {
    if (!row.selected) return
    const si = timeSlots.findIndex((s) => s.id === row.selected)
    if (si < 0) return
    lines.push({
      xAxis: si,
      name: row.name,
      label: { formatter: row.name, position: 'insideEndTop', fontSize: 9 },
      lineStyle: { type: 'dashed', color: '#6b7280', width: 1.5 },
    })
  })
  return lines
})

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  animation: false,
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross', label: { backgroundColor: '#1e293b' } },
    formatter: (params) => {
      const label = xLabels[params[0]?.dataIndex] ?? ''
      let html = `<div style="font-weight:700;margin-bottom:4px">${label}</div>`
      params.forEach((p) => {
        if (p.value == null) return
        html += `<div>${p.marker} ${p.seriesName}: <b>${p.value}</b></div>`
      })
      return html
    },
  },
  legend: {
    top: 6,
    left: 'center',
    data: ['TD Sistolik', 'TD Diastolik', 'Nadi', 'SpO₂', 'Suhu'],
    textStyle: { fontSize: 11 },
    itemWidth: 18,
    itemHeight: 10,
  },
  grid: { left: 55, right: 60, top: 48, bottom: 70 },
  xAxis: {
    type: 'category',
    data: xLabels,
    axisLabel: {
      fontSize: 9,
      interval: 2,
      color: (val) => (val.startsWith('Jam') ? '#1e40af' : '#6b7280'),
      fontWeight: (val) => (val.startsWith('Jam') ? 700 : 400),
    },
    splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.25 } },
    axisLine: { lineStyle: { color: '#cbd5e1' } },
  },
  yAxis: [
    {
      type: 'value',
      name: 'mmHg / bpm',
      nameTextStyle: { fontSize: 10, color: '#64748b' },
      min: 0,
      max: 230,
      interval: 20,
      axisLabel: { fontSize: 10, color: '#64748b' },
      splitLine: { lineStyle: { type: 'dashed', opacity: 0.3 } },
    },
    {
      type: 'value',
      name: '%  /  °C',
      nameTextStyle: { fontSize: 10, color: '#64748b' },
      min: 30,
      max: 110,
      interval: 10,
      axisLabel: { fontSize: 10, color: '#64748b' },
      splitLine: { show: false },
    },
  ],
  dataZoom: [
    {
      type: 'inside',
      xAxisIndex: 0,
      start: 0,
      end: 100,
      zoomOnMouseWheel: true,
      moveOnMouseMove: true,
    },
    {
      type: 'slider',
      xAxisIndex: 0,
      start: 0,
      end: 100,
      height: 22,
      bottom: 8,
      handleStyle: { color: 'var(--p-primary-color, #3b82f6)' },
      selectedDataBackground: {
        lineStyle: { color: 'var(--p-primary-color, #3b82f6)' },
        areaStyle: { color: 'var(--p-primary-color, #3b82f6)', opacity: 0.1 },
      },
    },
  ],
  series: [
    {
      name: 'TD Sistolik',
      type: 'line',
      yAxisIndex: 0,
      data: getSeriesData('sistolik'),
      symbol: 'triangle',
      symbolRotate: 180,
      symbolSize: 8,
      itemStyle: { color: '#dc2626' },
      lineStyle: { color: '#dc2626', width: 2 },
      connectNulls: false,
      markLine: timeMarkLines.value.length
        ? { silent: true, data: timeMarkLines.value }
        : undefined,
    },
    {
      name: 'TD Diastolik',
      type: 'line',
      yAxisIndex: 0,
      data: getSeriesData('diastolik'),
      symbol: 'triangle',
      symbolSize: 8,
      itemStyle: { color: '#7c3aed' },
      lineStyle: { color: '#7c3aed', width: 2 },
      connectNulls: false,
    },
    {
      name: 'Nadi',
      type: 'line',
      yAxisIndex: 0,
      data: getSeriesData('nadi'),
      symbol: 'circle',
      symbolSize: 7,
      itemStyle: { color: '#16a34a' },
      lineStyle: { color: '#16a34a', width: 2 },
      connectNulls: false,
    },
    {
      name: 'SpO₂',
      type: 'line',
      yAxisIndex: 1,
      data: getSeriesData('spo2'),
      symbol: 'emptyCircle',
      symbolSize: 7,
      itemStyle: { color: '#0891b2' },
      lineStyle: { color: '#0891b2', width: 2, type: 'dashed' },
      connectNulls: false,
    },
    {
      name: 'Suhu',
      type: 'line',
      yAxisIndex: 1,
      data: getSeriesData('suhu'),
      symbol: 'diamond',
      symbolSize: 8,
      itemStyle: { color: '#f59e0b' },
      lineStyle: { color: '#f59e0b', width: 2, type: 'dotted' },
      connectNulls: false,
    },
  ],
}))

const resetZoom = () => {
  chartRef.value?.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
}

// ── UI state ──────────────────────────────────────────────────────────────────
const isSaving = ref(false)
const gridState = reactive({})
const pendingSaves = reactive(new Set())

// ── Cell zoom ─────────────────────────────────────────────────────────────────
const ZOOM_LS_KEY = 'intra_grid_zoom'
const _savedZoom = (() => {
  try {
    return JSON.parse(localStorage.getItem(ZOOM_LS_KEY) || '{}')
  } catch {
    return {}
  }
})()
const cellSize = ref(typeof _savedZoom.cellSize === 'number' ? _savedZoom.cellSize : 36)
const rowSize = ref(typeof _savedZoom.rowSize === 'number' ? _savedZoom.rowSize : 30)
const cellStyle = computed(() => ({
  '--cell-w': cellSize.value + 'px',
  '--cell-h': rowSize.value + 'px',
}))
watch([cellSize, rowSize], ([w, h]) => {
  try {
    localStorage.setItem(ZOOM_LS_KEY, JSON.stringify({ cellSize: w, rowSize: h }))
  } catch {}
})
const resetZoomGrid = () => {
  cellSize.value = 36
  rowSize.value = 30
}

// ── Cell refs & keyboard nav ──────────────────────────────────────────────────
const refs = {}
const setRef = (el, rId, sId) => {
  const k = `${rId}-${sId}`
  if (el) refs[k] = el
  else delete refs[k]
}

const onInput = (rId, sId) => {
  const k = `${rId}-${sId}`
  const row = gasMap.get(rId)
  if (!row) return
  if (row.values[sId] !== '') pendingSaves.add(k)
  else pendingSaves.delete(k)
}

const onBlur = (rId, sId) => {
  const row = gasMap.get(rId)
  if (!row) return
  if (row.values[sId] !== '') saveCellApi(rId, sId)
  else pendingSaves.delete(`${rId}-${sId}`)
}

const onKey = (e, rId, sId) => {
  const rowIdx = gasRows.findIndex((r) => r.id === rId)
  const slotIdx = timeSlots.findIndex((s) => s.id === sId)
  let nextR = rowIdx
  let nextS = slotIdx

  if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey) || e.key === 'Enter') {
    e.preventDefault()
    nextS = slotIdx + 1
    if (nextS >= timeSlots.length) {
      nextS = 0
      nextR++
    }
  } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
    e.preventDefault()
    nextS = slotIdx - 1
    if (nextS < 0) {
      nextS = timeSlots.length - 1
      nextR--
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    nextR = rowIdx + 1
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    nextR = rowIdx - 1
  } else {
    return
  }

  nextR = Math.max(0, Math.min(nextR, gasRows.length - 1))
  nextS = Math.max(0, Math.min(nextS, timeSlots.length - 1))
  const nextRId = gasRows[nextR]?.id
  const nextSId = timeSlots[nextS]?.id
  if (nextRId && nextSId) nextTick(() => refs[`${nextRId}-${nextSId}`]?.focus())
}

// ── Number picker state ───────────────────────────────────────────────────────
const picker = reactive({
  visible: false,
  rId: null,
  sId: null,
  value: '',
  inputText: '',
  x: 0,
  y: 0,
})

const pickerRow = computed(() => gasMap.get(picker.rId))
const pickerOptions = computed(() => pickerRow.value?.options ?? [])

const pickerStyle = computed(() => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const pw = 260
  const ph = 380
  let x = picker.x
  let y = picker.y
  if (x + pw > vw - 8) x = vw - pw - 8
  if (y + ph > vh - 8) y = picker.y - ph - 4
  if (y < 8) y = 8
  return { left: x + 'px', top: y + 'px' }
})

const pickerValuesRef = ref(null)
const pickerInputRef = ref(null)

// ── Custom options (localStorage) ────────────────────────────────────────────
const LS_KEY = 'intra_custom_options'
const customOptions = reactive(
  (() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
    } catch {
      return {}
    }
  })(),
)
const saveCustomOptions = () => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(customOptions))
  } catch {}
}

// ── Picker computed ───────────────────────────────────────────────────────────
const pickerAllOptions = computed(() => {
  const base = pickerRow.value?.options ?? []
  const custom = customOptions[picker.rId] ?? []
  const baseStr = base.map(String)
  const extras = custom.filter((v) => !baseStr.includes(String(v)))
  return [...base, ...extras]
})

const pickerFilteredOptions = computed(() => {
  const q = picker.inputText.trim().toLowerCase()
  if (!q) return pickerAllOptions.value
  return pickerAllOptions.value.filter((v) => String(v).toLowerCase().includes(q))
})

const isNewValue = computed(() => {
  const q = picker.inputText.trim()
  if (!q) return false
  return !pickerAllOptions.value.map(String).includes(q)
})

// ── Picker actions ────────────────────────────────────────────────────────────
const isActiveCell = (rId, sId) => picker.visible && picker.rId === rId && picker.sId === sId
const clearPicker = () => {
  picker.value = ''
  picker.inputText = ''
}

// Buka picker dari tombol quick-pick di cell
const openPickerFromTd = async (event, rId, sId) => {
  // sync nilai terkini dari input sebelum buka picker
  const currentVal = gasMap.get(rId)?.values[sId] ?? ''
  const td = event.currentTarget.closest('td')
  const rect = (td ?? event.currentTarget).getBoundingClientRect()
  picker.rId = rId
  picker.sId = sId
  picker.value = currentVal
  picker.inputText = ''
  picker.x = rect.left
  picker.y = rect.bottom + 4
  picker.visible = true
  await nextTick()
  pickerInputRef.value?.focus()
  const active = pickerValuesRef.value?.querySelector('.val-active')
  active?.scrollIntoView({ block: 'center' })
}

const closePicker = (apply) => {
  if (apply && picker.rId && picker.sId) {
    const row = gasMap.get(picker.rId)
    if (row) {
      row.values[picker.sId] = picker.value
      const k = `${picker.rId}-${picker.sId}`
      if (picker.value !== '') {
        pendingSaves.add(k)
        saveCellApi(picker.rId, picker.sId)
      } else pendingSaves.delete(k)
    }
    // kembalikan fokus ke cell input setelah picker tutup
    const savedRId = picker.rId
    const savedSId = picker.sId
    nextTick(() => refs[`${savedRId}-${savedSId}`]?.focus())
  }
  picker.visible = false
  picker.rId = null
  picker.sId = null
  picker.inputText = ''
}

const selectValue = (val) => {
  picker.value = String(val)
  closePicker(true)
}

const addCustomValue = () => {
  const val = picker.inputText.trim()
  if (!val || !picker.rId) return
  if (!customOptions[picker.rId]) customOptions[picker.rId] = []
  if (!customOptions[picker.rId].map(String).includes(val)) {
    customOptions[picker.rId].push(val)
    saveCustomOptions()
  }
  picker.value = val
  closePicker(true)
}

const confirmInput = () => {
  const q = picker.inputText.trim()
  if (!q) {
    closePicker(true)
    return
  }
  // jika ada satu hasil filter, pilih itu
  if (pickerFilteredOptions.value.length === 1) {
    selectValue(pickerFilteredOptions.value[0])
    return
  }
  // jika exact match, pilih
  const exact = pickerAllOptions.value.find((v) => String(v).toLowerCase() === q.toLowerCase())
  if (exact !== undefined) {
    selectValue(exact)
    return
  }
  // nilai baru — tambahkan
  addCustomValue()
}

const onKeydown = (e) => {
  if (!picker.visible) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closePicker(false)
  }
}

// ── API ───────────────────────────────────────────────────────────────────────
const getIdentitas = () => ({
  kode_booking: route.query.kodebooking ?? '',
  no_register: route.query.noreg ?? '',
  id_client: id_client.value ?? '',
})

const saveCellApi = async (rId, sId) => {
  const row = gasMap.get(rId)
  const slot = slotMap.get(sId)
  if (!row || !slot) return
  const val = row.values[sId]
  const k = `${rId}-${sId}`
  if (val === '') {
    pendingSaves.delete(k)
    return
  }
  gridState[k] = 'cell-saving'
  pendingSaves.delete(k)
  try {
    const { data } = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/intraoperasi/save_cell`,
      {
        ...getIdentitas(),
        kondisi_id: rId,
        time_id: sId,
        value: String(val),
        hour: slot.hour,
        minute: slot.minute,
      },
    )
    if (data.code === 200) {
      gridState[k] = 'cell-saved'
      setTimeout(() => {
        if (gridState[k] === 'cell-saved') delete gridState[k]
      }, 2500)
    } else throw new Error(data.message)
  } catch {
    gridState[k] = 'cell-error'
    pendingSaves.add(k)
  }
}

const loadData = (json) => {
  try {
    if (json.medikasi)
      json.medikasi.forEach((v, i) => {
        medikasi[i] = v
      })
    if (json.cairan)
      json.cairan.forEach((v, i) => {
        cairan[i] = v
      })
    masalah.value = json.masalah ?? ''
    tindakan.value = json.tindakan ?? ''
    json.detail?.forEach(({ kondisi_id, value, time_id }) => {
      const gasRow = gasMap.get(kondisi_id)
      const timeRow = timeRows.find((r) => r.id === kondisi_id)
      if (gasRow) gasRow.values[time_id] = value
      if (timeRow) timeRow.selected = time_id
    })
  } catch (err) {
    console.error('[loadData]', err)
  }
}

const get_data = async () => {
  try {
    const { data } = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/intraoperasi/get_cell/${route.query.kodebooking}`,
    )
    if (data.code === 200) loadData(data)
  } catch (err) {
    console.error('[intra get_data]', err)
  }
}

const saveAll = async () => {
  isSaving.value = true
  try {
    const gasDetail = gasRows.flatMap((r) =>
      Object.entries(r.values)
        .filter(([, v]) => v !== '')
        .map(([sId, v]) => {
          const s = slotMap.get(sId)
          return { kondisi_id: r.id, time_id: sId, hour: s?.hour, minute: s?.minute, value: v }
        }),
    )
    const timeDetail = timeRows
      .filter((r) => r.selected)
      .map((r) => {
        const s = slotMap.get(r.selected)
        return {
          kondisi_id: r.id,
          time_id: r.selected,
          hour: s?.hour,
          minute: s?.minute,
          value: 'checked',
        }
      })
    const { data } = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/intraoperasi/save_all`,
      {
        ...getIdentitas(),
        medikasi: [...medikasi],
        cairan: [...cairan],
        masalah: masalah.value,
        tindakan: tindakan.value,
        detail: [...gasDetail, ...timeDetail],
      },
    )
    if (data.code === 200) {
      pendingSaves.clear()
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: 'Data intra operasi berhasil disimpan',
        life: 3000,
      })
    } else throw new Error(data.message)
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menyimpan data', life: 3000 })
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  get_data()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* ── Banner ── */
.intra-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--p-primary-color);
  border-radius: var(--p-border-radius);
  padding: 0.85rem 1.4rem;
  color: var(--p-primary-contrast-color);
}
.banner-icon {
  font-size: 1.8rem;
  opacity: 0.9;
  flex-shrink: 0;
}
.banner-title {
  margin: 0 0 0.15rem;
  font-size: 1rem;
  font-weight: 700;
}
.banner-desc {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.85;
}
.pending-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  white-space: nowrap;
}
.btn-banner-save {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  color: var(--p-primary-contrast-color);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--p-border-radius);
  padding: 0.32rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-banner-save:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.28);
}
.btn-banner-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Card ── */
.intra-card {
  border-radius: var(--p-border-radius);
  overflow: hidden;
  box-shadow: var(--p-card-shadow);
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
}
.grid-card {
  display: flex;
  flex-direction: column;
}
.intra-card-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 0.65rem 1.1rem;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: 700;
  font-size: 0.86rem;
  letter-spacing: 0.04em;
}
.intra-card-body {
  padding: 0.85rem 1.1rem;
}

/* ── Legend ── */
.legend-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 0.5rem;
}
.legend-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.2rem 0.6rem;
  flex-shrink: 0;
  padding: 0.38rem 1rem;
  background: var(--p-surface-50, #f8f9fa);
  border-top: 1px solid var(--p-content-border-color);
  font-size: 0.67rem;
  color: var(--p-text-muted-color, #6b7280);
}
.legend-bottom b {
  color: var(--p-text-color);
}
.leg-sep {
  font-weight: 600;
  color: var(--p-text-color);
}
.leg {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* ── Grid ── */
.table-scroll {
  overflow: auto;
  flex: 1;
  height: calc(100vh - 240px);
}
.excel-table {
  border-collapse: collapse;
  font-size: 11.5px;
  width: max-content;
}
.excel-table th,
.excel-table td {
  border: 1px solid var(--p-content-border-color);
  padding: 0;
  text-align: center;
  vertical-align: middle;
}
.excel-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
}
.excel-table thead tr:nth-child(2) th {
  top: 26px;
}

.sticky-col {
  position: sticky;
  left: 0;
  z-index: 5;
}
.corner-th {
  background: var(--p-primary-color) !important;
  color: var(--p-primary-contrast-color);
  min-width: 152px;
  padding: 4px 8px !important;
  font-size: 10px;
  text-align: left;
  z-index: 15 !important;
}
.corner-th2 {
  background: var(--p-surface-100, #f8f9fa);
  z-index: 15 !important;
}

.hour-th {
  font-size: 11px;
  font-weight: 700;
  padding: 3px !important;
}
.h1 {
  background: #dbeafe;
  color: #1e40af;
}
.h2 {
  background: #dcfce7;
  color: #14532d;
}
.h3 {
  background: #fef3c7;
  color: #78350f;
}

.slot-th {
  width: var(--cell-w, 36px);
  min-width: var(--cell-w, 36px);
  max-width: var(--cell-w, 36px);
  font-size: 10px;
  font-weight: 500;
}
.h1s {
  background: #eff6ff;
  color: #1d4ed8;
}
.h2s {
  background: #f0fdf4;
  color: #15803d;
}
.h3s {
  background: #fffbeb;
  color: #b45309;
}

.group-sep td {
  height: 17px;
}
.group-td {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  min-width: 152px;
  padding: 2px 7px !important;
  text-align: left;
}
.gas-group {
  background: #eff6ff;
  color: #1d4ed8;
  border-left: 4px solid #3b82f6 !important;
}
.time-group {
  background: #f0fdf4;
  color: #15803d;
  border-left: 4px solid #22c55e !important;
}
.group-fill {
  opacity: 0.35;
}

.param-td {
  min-width: 152px;
  font-weight: 500;
  padding: 3px 7px !important;
  white-space: nowrap;
  text-align: left;
  color: var(--p-text-color);
  background: var(--p-surface-50, #f8f9fa);
}
.time-param {
  color: var(--p-text-muted-color, #6b7280);
  font-style: italic;
}
.unit-badge {
  font-size: 9px;
  color: var(--p-text-muted-color, #9ca3af);
  margin-left: 2px;
}

/* data cell — clickable */
.data-td {
  padding: 0 !important;
  cursor: pointer;
  height: var(--cell-h, 30px);
  width: var(--cell-w, 36px);
  min-width: var(--cell-w, 36px);
  max-width: var(--cell-w, 36px);
  overflow: hidden;
  transition: background 0.1s;
}
.data-td:hover {
  background: color-mix(in srgb, var(--p-primary-color) 8%, transparent) !important;
}
.cell-active {
  background: color-mix(in srgb, var(--p-primary-color) 18%, transparent) !important;
  outline: 2px solid var(--p-primary-color);
  outline-offset: -2px;
}

.cell-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--cell-w, 36px);
  height: var(--cell-h, 30px);
  font-size: 11px;
  font-weight: 500;
  color: var(--p-text-muted-color, #9ca3af);
  user-select: none;
}
.cell-display.has-value {
  color: var(--p-text-color);
  font-weight: 600;
}

.radio-td {
  vertical-align: middle;
  cursor: pointer;
}
.cell-radio {
  width: 13px;
  height: 13px;
  cursor: pointer;
  accent-color: var(--p-primary-color);
}

.cell-saving {
  background: #dbeafe !important;
}
.cell-saved {
  background: #d1fae5 !important;
  transition: background 0.5s;
}
.cell-error {
  background: #fecaca !important;
  outline: 2px solid #ef4444;
}

tr[data-type='gas'] .param-td {
  border-left: 3px solid #3b82f6 !important;
}
tr[data-type='vital'] .param-td {
  border-left: 3px solid var(--p-primary-color) !important;
}
tr[data-type='time'] .param-td {
  border-left: 3px solid #22c55e !important;
}
.excel-table tbody tr:hover td:not(.sticky-col) {
  background: color-mix(in srgb, var(--p-primary-color) 3%, transparent) !important;
}

/* ── Picker overlay ── */
.picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
}
.picker-panel {
  position: fixed;
  z-index: 1051;
  width: 260px;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  user-select: none;
  display: flex;
  flex-direction: column;
}

/* header */
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  flex-shrink: 0;
}
.picker-header-left {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.picker-param {
  font-size: 0.75rem;
  font-weight: 700;
}
.picker-unit {
  font-size: 0.65rem;
  opacity: 0.75;
}
.picker-header-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.picker-display {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  min-width: 52px;
  text-align: right;
}
.picker-clear {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--p-primary-contrast-color);
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.picker-clear:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* manual input row */
.picker-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--p-content-border-color);
  background: var(--p-surface-50, #f8f9fa);
  flex-shrink: 0;
}
.picker-input {
  flex: 1;
  height: 32px;
  border-radius: 6px;
  font-size: 0.83rem;
  border: 1px solid var(--p-content-border-color);
  padding: 0 0.5rem;
  outline: none;
  background: var(--p-content-background);
  color: var(--p-text-color);
}
.picker-input:focus {
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--p-primary-color) 18%, transparent);
}
.add-btn {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  height: 32px;
  padding: 0 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border: none;
  white-space: nowrap;
  transition: opacity 0.12s;
}
.add-btn:hover {
  opacity: 0.85;
}

.val-empty {
  grid-column: span 4;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.75rem;
  color: var(--p-text-muted-color, #9ca3af);
  font-style: italic;
}

/* scrollable value grid */
.picker-values {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  padding: 0.5rem;
  overflow-y: auto;
  max-height: 260px;
  flex: 1;
}
.val-btn {
  height: 36px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
  color: var(--p-text-color);
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.val-btn:hover {
  background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
  border-color: var(--p-primary-color);
}
.val-btn:active {
  transform: scale(0.93);
}
.val-active {
  background: var(--p-primary-color) !important;
  color: var(--p-primary-contrast-color) !important;
  border-color: var(--p-primary-color) !important;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--p-primary-color) 40%, transparent);
}

/* footer */
.picker-footer {
  display: flex;
  gap: 6px;
  padding: 0.45rem 0.5rem;
  border-top: 1px solid var(--p-content-border-color);
  background: var(--p-surface-50, #f8f9fa);
  flex-shrink: 0;
}
.foot-btn {
  flex: 1;
  height: 34px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--p-content-border-color);
  transition: all 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.foot-cancel {
  background: var(--p-content-background);
  color: var(--p-text-muted-color, #6b7280);
}
.foot-cancel:hover {
  background: var(--p-surface-100, #f1f5f9);
}
.foot-ok {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border-color: var(--p-primary-color);
}
.foot-ok:hover {
  opacity: 0.88;
}

/* picker animation */
.picker-pop-enter-active {
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.picker-pop-leave-active {
  transition: all 0.1s ease-in;
}
.picker-pop-enter-from,
.picker-pop-leave-to {
  opacity: 0;
  transform: scale(0.88);
}

/* ── Chart ── */
.chart-hint {
  font-size: 0.68rem;
  opacity: 0.75;
  font-weight: 400;
  letter-spacing: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.chart-ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.15);
  color: var(--p-primary-contrast-color);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.15s;
}
.chart-ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}
.chart-wrap {
  padding: 0.5rem 0.5rem 0;
}
.vital-chart {
  height: 320px;
  width: 100%;
}

/* ── Dual-input cell ── */
.cell-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}
.cell-kbd {
  flex: 1;
  width: 0;
  min-width: 0;
  height: var(--cell-h, 30px);
  border: none;
  outline: none;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  background: transparent;
  color: var(--p-text-color);
  padding: 0 20px 0 2px;
  cursor: pointer;
}
.cell-kbd:focus {
  background: color-mix(in srgb, var(--p-primary-color) 8%, transparent);
  outline: 2px solid var(--p-primary-color);
  outline-offset: -2px;
  cursor: text;
}
.cell-pick-btn {
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 3px;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  cursor: pointer;
  font-size: 8px;
  opacity: 0;
  transition: opacity 0.12s;
  padding: 0;
}
.data-td:hover .cell-pick-btn {
  opacity: 1;
}

/* ── Lists ── */
.list-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.28rem 0.85rem;
}
.list-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.list-num {
  flex-shrink: 0;
  width: 18px;
  font-size: 0.75rem;
  color: var(--p-text-muted-color, #6b7280);
  font-weight: 600;
}

/* ── Zoom toolbar ── */
.zoom-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.85rem;
  background: var(--p-surface-50, #f8f9fa);
  border-bottom: 1px solid var(--p-content-border-color);
  flex-shrink: 0;
}
.zoom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--p-content-border-color);
  border-radius: 5px;
  background: var(--p-content-background);
  color: var(--p-text-color);
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.12s;
  flex-shrink: 0;
}
.zoom-btn:hover:not(:disabled) {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border-color: var(--p-primary-color);
}
.zoom-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}
.zoom-slider {
  flex: 1;
  max-width: 220px;
  height: 4px;
  cursor: pointer;
  accent-color: var(--p-primary-color);
}
.zoom-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--p-text-muted-color, #6b7280);
  min-width: 34px;
  text-align: center;
}
.zoom-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--p-text-muted-color, #9ca3af);
  cursor: pointer;
  font-size: 0.75rem;
  transition: color 0.12s;
}
.zoom-reset:hover {
  color: var(--p-primary-color);
}
.zoom-icon {
  font-size: 0.72rem;
  color: var(--p-text-muted-color, #9ca3af);
  flex-shrink: 0;
}
.zoom-sep {
  width: 1px;
  height: 20px;
  background: var(--p-content-border-color);
  flex-shrink: 0;
  margin: 0 0.2rem;
}
</style>
