<template>
  <div class="rme-section">
    <div class="rme-section-title" style="background:linear-gradient(90deg,#eef2ff,#f5f3ff);border-left-color:#4f46e5">
      <i class="pi pi-chart-bar" style="color:#4f46e5"></i> MONITORING INTRA OPERASI
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.
    </div>
    <div v-else-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data monitoring intra operasi...
    </div>
    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>
    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data monitoring intra operasi untuk kunjungan ini.
    </div>

    <div v-else>
      <!-- Meta -->
      <div class="io-meta">
        <span class="rme-badge rme-badge-info">{{ totalMeasurements }} pengukuran tercatat</span>
        <span v-if="timeRange" class="io-range">⏱ {{ timeRange }}</span>
      </div>

      <!-- Grafik Tanda Vital -->
      <div class="rme-subsection-title"><span>📊</span> Grafik Tanda Vital</div>
      <div class="io-chart-wrap">
        <VChart :option="chartOption" autoresize class="io-chart" />
      </div>

      <!-- Tanda Vital Grid -->
      <div class="rme-subsection-title"><span>📈</span> Tanda Vital per Waktu</div>
      <div v-if="vitalSlots.length" class="io-scroll">
        <table class="io-tbl">
          <thead>
            <tr>
              <th class="io-th-time">Waktu</th>
              <th v-for="p in vitalParams" :key="p.id" class="io-th-param">
                {{ p.name }}<br /><small>{{ p.unit }}</small>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in vitalSlots" :key="slot.id">
              <td class="io-td-time">{{ slot.label }}</td>
              <td v-for="p in vitalParams" :key="p.id" class="io-td-val">
                {{ p.values[slot.id] || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak ada data tanda vital.</div>

      <!-- Gas -->
      <div v-if="gasRows.length" class="rme-subsection-title" style="margin-top:.65rem"><span>💨</span> Gas Anestesi per Waktu</div>
      <div v-if="gasRows.length" class="io-scroll">
        <table class="io-tbl">
          <thead>
            <tr>
              <th class="io-th-time">Waktu</th>
              <th v-for="p in gasRows" :key="p.id" class="io-th-param">
                {{ p.name }}<br /><small>{{ p.unit }}</small>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in gasSlots" :key="slot.id">
              <td class="io-td-time">{{ slot.label }}</td>
              <td v-for="p in gasRows" :key="p.id" class="io-td-val">
                {{ p.values[slot.id] || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Penanda Waktu -->
      <div v-if="penandaRows.length" class="rme-subsection-title" style="margin-top:.65rem"><span>🕐</span> Penanda Waktu</div>
      <div v-if="penandaRows.length" class="io-penanda-wrap">
        <div v-for="p in penandaRows" :key="p.id" class="io-penanda-item">
          <span class="io-penanda-label">{{ p.name }}</span>
          <span class="io-penanda-val">{{ p.slotLabel || '-' }}</span>
        </div>
      </div>

      <!-- Medikasi & Cairan -->
      <div class="io-two-col">
        <div v-if="medikasiList.length">
          <div class="rme-subsection-title" style="margin-top:.65rem"><span>💉</span> Medikasi</div>
          <ol class="io-list">
            <li v-for="(m, i) in medikasiList" :key="i">{{ m }}</li>
          </ol>
        </div>
        <div v-if="cairanList.length">
          <div class="rme-subsection-title" style="margin-top:.65rem"><span>🫧</span> Pemberian Cairan</div>
          <ol class="io-list">
            <li v-for="(c, i) in cairanList" :key="i">{{ c }}</li>
          </ol>
        </div>
      </div>

      <!-- Masalah & Tindakan -->
      <div class="io-two-col" style="margin-top:.5rem">
        <div v-if="masalah">
          <div class="rme-subsection-title"><span>⚠️</span> Masalah Durante Operasi</div>
          <p class="io-text-block">{{ masalah }}</p>
        </div>
        <div v-if="tindakan">
          <div class="rme-subsection-title"><span>✅</span> Tindakan</div>
          <p class="io-text-block">{{ tindakan }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  DataZoomComponent, MarkLineComponent,
} from 'echarts/components'
use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent,
     DataZoomComponent, MarkLineComponent])

const props = defineProps({
  noreg:      { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore   = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportSectionData   = inject('reportSectionData',   () => {})
const kodebookingOperasi  = inject('kodebookingOperasi',  ref(null))
const noregisterOperasi   = inject('noregisterOperasi',   ref(''))

// ── Master param config ───────────────────────────────────────────────────────
const VITAL_IDS = ['sistolik', 'diastolik', 'nadi', 'spo2', 'suhu']
const GAS_IDS   = ['o2', 'n2o', 'volatile', 'ekg']
const TIME_IDS  = ['t_induksi', 't_inhalasi', 't_intubasi', 't_op_mulai', 't_op_done', 't_ekstubasi', 't_an_done']

const PARAM_META = {
  sistolik:    { name: 'TD Sistolik',  unit: 'mmHg', type: 'vital' },
  diastolik:   { name: 'TD Diastolik', unit: 'mmHg', type: 'vital' },
  nadi:        { name: 'Nadi',         unit: 'bpm',  type: 'vital' },
  spo2:        { name: 'SpO₂',         unit: '%',    type: 'vital' },
  suhu:        { name: 'Suhu',         unit: '°C',   type: 'vital' },
  o2:          { name: 'O₂',           unit: 'L/mnt',type: 'gas'   },
  n2o:         { name: 'N₂O',          unit: 'L/mnt',type: 'gas'   },
  volatile:    { name: 'Volatile',     unit: '%',    type: 'gas'   },
  ekg:         { name: 'EKG',          unit: '',     type: 'gas'   },
  t_induksi:   { name: 'Induksi',      type: 'time' },
  t_inhalasi:  { name: 'Inhalasi',     type: 'time' },
  t_intubasi:  { name: 'Intubasi',     type: 'time' },
  t_op_mulai:  { name: 'Mulai Operasi',type: 'time' },
  t_op_done:   { name: 'Selesai Operasi', type: 'time' },
  t_ekstubasi: { name: 'Ekstubasi',    type: 'time' },
  t_an_done:   { name: 'Akhir Anestesi', type: 'time' },
}

const slotLabel = (timeId) => {
  const m = timeId.match(/^h(\d+)_m(\d+)$/)
  if (!m) return timeId
  const h = parseInt(m[1])
  const min = parseInt(m[2])
  return min === 0 ? `Jam ${h}` : `${(h - 1) * 60 + min}'`
}

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const error   = ref(null)
const detail  = ref([])   // [{ kondisi_id, time_id, hour, minute, value }]
const medikasi = ref([])
const cairan   = ref([])
const masalah  = ref('')
const tindakan = ref('')

const hasData = computed(() =>
  detail.value.length > 0 ||
  medikasi.value.some(Boolean) ||
  cairan.value.some(Boolean) ||
  !!masalah.value ||
  !!tindakan.value
)

// ── Build value maps per kondisi_id ──────────────────────────────────────────
const buildParamRows = (ids) =>
  ids.map((id) => {
    const meta = PARAM_META[id] || { name: id, unit: '' }
    const values = {}
    detail.value.filter((d) => d.kondisi_id === id).forEach((d) => {
      values[d.time_id] = d.value
    })
    return { id, name: meta.name, unit: meta.unit || '', values }
  }).filter((p) => Object.keys(p.values).length > 0)

const vitalParams = computed(() => buildParamRows(VITAL_IDS))
const gasRows     = computed(() => buildParamRows(GAS_IDS))

// Slot lists (sorted by time)
const buildSlots = (params) => {
  const map = new Map()
  params.forEach((p) => {
    Object.keys(p.values).forEach((tid) => {
      if (!map.has(tid)) map.set(tid, { id: tid, label: slotLabel(tid), ...parseTimeId(tid) })
    })
  })
  return [...map.values()].sort((a, b) => a.totalMin - b.totalMin)
}

const parseTimeId = (tid) => {
  const m = tid.match(/^h(\d+)_m(\d+)$/)
  const h = m ? parseInt(m[1]) : 0
  const min = m ? parseInt(m[2]) : 0
  return { totalMin: (h - 1) * 60 + min }
}

const vitalSlots = computed(() => buildSlots(vitalParams.value))
const gasSlots   = computed(() => buildSlots(gasRows.value))

// Penanda waktu
const penandaRows = computed(() =>
  TIME_IDS.map((id) => {
    const d = detail.value.find((x) => x.kondisi_id === id && x.value === 'checked')
    return {
      id,
      name: PARAM_META[id]?.name || id,
      slotLabel: d ? slotLabel(d.time_id) : null,
    }
  }).filter((p) => p.slotLabel)
)

// Medikasi & cairan (non-empty)
const medikasiList = computed(() => medikasi.value.filter(Boolean))
const cairanList   = computed(() => cairan.value.filter(Boolean))

// Meta
const totalMeasurements = computed(() =>
  detail.value.filter((d) => !TIME_IDS.includes(d.kondisi_id)).length
)
const timeRange = computed(() => {
  const items = detail.value.filter((d) => !TIME_IDS.includes(d.kondisi_id))
  if (!items.length) return null
  const sorted = [...items].sort((a, b) => parseTimeId(a.time_id).totalMin - parseTimeId(b.time_id).totalMin)
  const first = slotLabel(sorted[0].time_id)
  const last  = slotLabel(sorted[sorted.length - 1].time_id)
  return first === last ? first : `${first} — ${last}`
})

// ── Chart ─────────────────────────────────────────────────────────────────────
const chartOption = computed(() => {
  // X-axis: union of all slots with vital data, sorted
  const slotSet = new Map()
  VITAL_IDS.forEach((id) => {
    detail.value.filter((d) => d.kondisi_id === id).forEach((d) => {
      if (!slotSet.has(d.time_id)) slotSet.set(d.time_id, parseTimeId(d.time_id).totalMin)
    })
  })
  const sortedSlots = [...slotSet.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id)
  const xLabels = sortedSlots.map((id) => slotLabel(id))

  const getSeriesData = (id) =>
    sortedSlots.map((tid) => {
      const d = detail.value.find((x) => x.kondisi_id === id && x.time_id === tid)
      return d ? Number(d.value) : null
    })

  const markLines = penandaRows.value.map((p) => {
    const xi = sortedSlots.indexOf(
      detail.value.find((d) => d.kondisi_id === p.id && d.value === 'checked')?.time_id
    )
    if (xi < 0) return null
    return {
      xAxis: xi,
      name: p.name,
      label: { formatter: p.name, position: 'insideEndTop', fontSize: 9 },
      lineStyle: { type: 'dashed', color: '#6b7280', width: 1.5 },
    }
  }).filter(Boolean)

  return {
    backgroundColor: 'transparent',
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#1e293b' } },
      formatter: (params) => {
        const lbl = xLabels[params[0]?.dataIndex] ?? ''
        let html = `<div style="font-weight:700;margin-bottom:4px">${lbl}</div>`
        params.forEach((p) => {
          if (p.value == null) return
          html += `<div>${p.marker} ${p.seriesName}: <b>${p.value}</b></div>`
        })
        return html
      },
    },
    legend: {
      top: 4, left: 'center',
      data: ['TD Sistolik', 'TD Diastolik', 'Nadi', 'SpO₂', 'Suhu'],
      textStyle: { fontSize: 10 }, itemWidth: 16, itemHeight: 9,
    },
    grid: { left: 48, right: 52, top: 42, bottom: 60 },
    xAxis: {
      type: 'category', data: xLabels,
      axisLabel: {
        fontSize: 9, interval: 0, rotate: sortedSlots.length > 20 ? 45 : 0,
        color: (val) => val.startsWith('Jam') ? '#3730a3' : '#6b7280',
        fontWeight: (val) => val.startsWith('Jam') ? 700 : 400,
      },
      splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.2 } },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
    },
    yAxis: [
      {
        type: 'value', name: 'mmHg / bpm', nameTextStyle: { fontSize: 9, color: '#64748b' },
        min: 0, max: 230, interval: 20,
        axisLabel: { fontSize: 9, color: '#64748b' },
        splitLine: { lineStyle: { type: 'dashed', opacity: 0.25 } },
      },
      {
        type: 'value', name: '% / °C', nameTextStyle: { fontSize: 9, color: '#64748b' },
        min: 30, max: 110, interval: 10,
        axisLabel: { fontSize: 9, color: '#64748b' },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
      { type: 'slider', xAxisIndex: 0, start: 0, end: 100, height: 18, bottom: 6,
        handleStyle: { color: '#4f46e5' },
        selectedDataBackground: { lineStyle: { color: '#4f46e5' }, areaStyle: { color: '#4f46e5', opacity: .1 } } },
    ],
    series: [
      {
        name: 'TD Sistolik', type: 'line', yAxisIndex: 0,
        data: getSeriesData('sistolik'),
        symbol: 'triangle', symbolRotate: 180, symbolSize: 7,
        itemStyle: { color: '#dc2626' }, lineStyle: { color: '#dc2626', width: 2 },
        connectNulls: false,
        markLine: markLines.length ? { silent: true, data: markLines } : undefined,
      },
      {
        name: 'TD Diastolik', type: 'line', yAxisIndex: 0,
        data: getSeriesData('diastolik'),
        symbol: 'triangle', symbolSize: 7,
        itemStyle: { color: '#7c3aed' }, lineStyle: { color: '#7c3aed', width: 2 },
        connectNulls: false,
      },
      {
        name: 'Nadi', type: 'line', yAxisIndex: 0,
        data: getSeriesData('nadi'),
        symbol: 'circle', symbolSize: 6,
        itemStyle: { color: '#16a34a' }, lineStyle: { color: '#16a34a', width: 2 },
        connectNulls: false,
      },
      {
        name: 'SpO₂', type: 'line', yAxisIndex: 1,
        data: getSeriesData('spo2'),
        symbol: 'emptyCircle', symbolSize: 6,
        itemStyle: { color: '#0891b2' }, lineStyle: { color: '#0891b2', width: 2, type: 'dashed' },
        connectNulls: false,
      },
      {
        name: 'Suhu', type: 'line', yAxisIndex: 1,
        data: getSeriesData('suhu'),
        symbol: 'diamond', symbolSize: 7,
        itemStyle: { color: '#f59e0b' }, lineStyle: { color: '#f59e0b', width: 2, type: 'dotted' },
        connectNulls: false,
      },
    ],
  }
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
const fetchData = async (kodebok) => {
  loading.value = true
  error.value   = null
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/intraoperasi/get_cell/${kodebok}`
    )
    if (res.data?.code === 200) {
      detail.value   = res.data.detail   || []
      medikasi.value = res.data.medikasi || []
      cairan.value   = res.data.cairan   || []
      masalah.value  = res.data.masalah  || ''
      tindakan.value = res.data.tindakan || ''
    }
  } catch (e) {
    error.value = 'Gagal memuat data intra operasi: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('intra-operasi', hasData.value)
  }
}

watch(kodebookingOperasi, (val) => {
  if (val) fetchData(val)
  else reportSectionData('intra-operasi', false)
}, { immediate: true })
</script>

<style scoped>
.io-meta { display:flex; align-items:center; gap:.75rem; margin-bottom:.6rem; flex-wrap:wrap }
.io-range { font-size:.75rem; color:#555 }

.io-scroll { overflow-x:auto; margin-bottom:.25rem }
.io-tbl { border-collapse:collapse; font-size:.76rem; white-space:nowrap; min-width:100% }
.io-tbl th,.io-tbl td { border:1px solid #e5e7eb; padding:.28rem .45rem }
.io-th-time { background:#e0e7ff; color:#3730a3; font-weight:700; font-size:.7rem; position:sticky; left:0; min-width:52px; text-align:center }
.io-th-param { background:#eef2ff; color:#4338ca; font-weight:700; font-size:.7rem; text-align:center; min-width:52px }
.io-td-time { background:#f5f3ff; font-weight:700; font-size:.72rem; color:#374151; position:sticky; left:0; text-align:center; border-right:2px solid #a5b4fc }
.io-td-val { text-align:center; color:#1f2937; font-size:.76rem }

.io-penanda-wrap { display:flex; flex-wrap:wrap; gap:.35rem .75rem; margin-bottom:.25rem }
.io-penanda-item { display:inline-flex; align-items:center; gap:.35rem; background:#eef2ff; border:1px solid #a5b4fc; border-radius:6px; padding:.18rem .55rem }
.io-penanda-label { font-size:.7rem; font-weight:700; color:#3730a3 }
.io-penanda-val   { font-size:.72rem; color:#374151; font-weight:600 }

.io-chart-wrap { margin-bottom:.5rem; border:1px solid #e5e7eb; border-radius:6px; overflow:hidden; background:#fff }
.io-chart { height: 260px; width:100% }

.io-two-col { display:grid; grid-template-columns:1fr 1fr; gap:.5rem 1.25rem }
.io-list { margin:.2rem 0 0 1rem; padding:0; font-size:.76rem; color:#1f2937; list-style:decimal }
.io-list li { padding:.1rem 0 }
.io-text-block { font-size:.78rem; color:#374151; margin:.2rem 0 0; line-height:1.5; white-space:pre-wrap }
</style>
