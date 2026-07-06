<template>
  <div class="rme-section">
    <div class="rme-section-title" style="background:linear-gradient(90deg,#ecfeff,#f0fdff);border-left-color:#00838f">
      <i class="pi pi-chart-line" style="color:#00838f"></i> FORMULIR MONITORING ANESTESI
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.</div>
    <div v-else-if="loading" class="rme-loading-row"><span class="rme-loading-dot"></span> Memuat data formulir anestesi...</div>
    <div v-else-if="error" class="rme-empty-note"><i class="pi pi-info-circle"></i> {{ error }}</div>
    <div v-else-if="!hasData" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Belum ada data monitoring anestesi untuk kunjungan ini.</div>

    <div v-else>
      <div class="fa-meta">
        <span class="rme-badge rme-badge-info">{{ totalMeasurements }} pengukuran tercatat</span>
        <span v-if="timeRange" class="fa-range">⏱ {{ timeRange }}</span>
      </div>

      <!-- Tabel ringkasan per parameter -->
      <div class="rme-subsection-title"><span>📊</span> Ringkasan Parameter</div>
      <div class="fa-table-wrap">
        <table class="fa-table">
          <thead>
            <tr>
              <th class="fa-th-param">Parameter</th>
              <th class="fa-th-group">Grup</th>
              <th class="fa-th-count">Jml Data</th>
              <th class="fa-th-range">Rentang Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in summaryRows" :key="row.id">
              <td class="fa-td-param">{{ row.name }}</td>
              <td><span class="fa-group-badge" :style="groupStyle(row.type)">{{ groupLabel(row.type) }}</span></td>
              <td class="fa-td-count">{{ row.count }}</td>
              <td class="fa-td-range">
                <span v-if="row.type==='time'">{{ row.checkedSlots.join(', ')||'-' }}</span>
                <span v-else-if="row.count>0">{{ row.min }}{{ row.unit }} — {{ row.max }}{{ row.unit }}</span>
                <span v-else class="rme-empty-note" style="margin:0;padding:0">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Detail per waktu (vital signs saja) -->
      <div class="rme-subsection-title" style="margin-top:.75rem"><span>📈</span> Detail Tanda Vital per Waktu</div>
      <div v-if="vitalTimeSlots.length" class="fa-vital-scroll">
        <table class="fa-vital-tbl">
          <thead>
            <tr>
              <th class="fa-vt-hdr">Waktu</th>
              <th v-for="p in vitalParams" :key="p.id" class="fa-vt-hdr">{{ p.name }}<br><small>{{ p.unit }}</small></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in vitalTimeSlots" :key="slot.id">
              <td class="fa-vt-time">{{ slot.label }}</td>
              <td v-for="p in vitalParams" :key="p.id" class="fa-vt-val">{{ p.values[slot.id]||'-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak ada data tanda vital per waktu.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})
const kodebookingOperasi = inject('kodebookingOperasi', ref(null))
const noregisterOperasi = inject('noregisterOperasi', ref(''))

const loading = ref(false)
const error = ref(null)
const detail = ref([])
const allSlots = ref([])

const hasData = computed(() => detail.value.some(d => d.measurements?.length > 0))

const typeGroupConfig = {
  medication: { label: 'MEDIKASI', color: '#1d4ed8', bg: '#eff6ff' },
  vital:      { label: 'TANDA VITAL', color: '#dc2626', bg: '#fff1f2' },
  pressure:   { label: 'TEKANAN DARAH', color: '#9333ea', bg: '#faf5ff' },
  respiratory:{ label: 'RESPIRASI', color: '#16a34a', bg: '#f0fdf4' },
  procedure:  { label: 'PROSEDUR', color: '#d97706', bg: '#fffbeb' },
  airway:     { label: 'JALAN NAFAS', color: '#0891b2', bg: '#ecfeff' },
  time:       { label: 'PENANDA WAKTU', color: '#6b7280', bg: '#f9fafb' },
}

const groupLabel = (t) => typeGroupConfig[t]?.label || t
const groupStyle = (t) => {
  const c = typeGroupConfig[t] || { color:'#6b7280', bg:'#f9fafb' }
  return { background: c.bg, color: c.color, border: `1px solid ${c.color}44` }
}

const summaryRows = computed(() =>
  detail.value.map(d => {
    const nums = (d.measurements || []).filter(m => m.value !== 'checked').map(m => parseFloat(m.value)).filter(v => !isNaN(v))
    const checked = (d.measurements || []).filter(m => m.value === 'checked').map(m => m.timestamp)
    return {
      id: d.kondisi_id,
      name: d.kondisi_name,
      type: d.type || '',
      unit: d.unit || '',
      count: d.measurements?.length || 0,
      min: nums.length ? Math.min(...nums) : null,
      max: nums.length ? Math.max(...nums) : null,
      checkedSlots: checked,
    }
  })
)

const totalMeasurements = computed(() => detail.value.reduce((s, d) => s + (d.measurements?.length || 0), 0))

const timeRange = computed(() => {
  const all = detail.value.flatMap(d => d.measurements || []).map(m => m.timestamp).filter(Boolean)
  if (!all.length) return null
  return `${all[0]} — ${all[all.length - 1]}`
})

const VITAL_IDS = ['nadi', 'sistolik', 'diastolik', 'suhu', 'spo2']

const vitalParams = computed(() =>
  detail.value
    .filter(d => VITAL_IDS.includes(d.kondisi_id))
    .map(d => ({
      id: d.kondisi_id,
      name: d.kondisi_name,
      unit: d.unit || '',
      values: Object.fromEntries((d.measurements || []).map(m => [m.time_id, m.value])),
    }))
)

const vitalTimeSlots = computed(() => {
  const slotSet = new Map()
  vitalParams.value.forEach(p => {
    Object.entries(p.values).forEach(([tid, val]) => {
      if (!slotSet.has(tid)) {
        const m = allSlots.value.find(s => s.id === tid)
        slotSet.set(tid, { id: tid, label: m?.label || tid, hour: m?.hour || 0, minute: m?.minute || 0 })
      }
    })
  })
  return [...slotSet.values()].sort((a, b) => a.hour*60+a.minute - (b.hour*60+b.minute))
})

const fetchData = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/triaseigd/get_cell/${kodebok}`, {
      noregister: noregisterOperasi.value || props.noreg,
      kodeboking: kodebok,
      id_client: id_client.value,
    })
    if (res.data?.code === 200) {
      detail.value = res.data.detail || []
      allSlots.value = res.data.timeSlots || []
      // Inject type & unit from master if provided
      const masterMap = Object.fromEntries((res.data.master || []).map(m => [m.id, m]))
      detail.value = detail.value.map(d => ({
        ...d,
        type: masterMap[d.kondisi_id]?.type || d.type || '',
        unit: masterMap[d.kondisi_id]?.unit || d.unit || '',
      }))
    }
  } catch (e) {
    error.value = 'Gagal memuat formulir anestesi: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('formulir-anestesi', hasData.value)
  }
}

watch(kodebookingOperasi, (val) => {
  if (val) fetchData(val)
  else reportSectionData('formulir-anestesi', false)
}, { immediate: true })
</script>

<style scoped>
.fa-meta { display:flex; align-items:center; gap:.75rem; margin-bottom:.6rem; flex-wrap:wrap }
.fa-range { font-size:.75rem; color:#555 }
.fa-table-wrap { overflow-x:auto }
.fa-table { width:100%; border-collapse:collapse; font-size:.78rem }
.fa-table th,.fa-table td { border:1px solid #e5e7eb; padding:.3rem .5rem }
.fa-th-param,.fa-th-group,.fa-th-count,.fa-th-range { background:#f3f4f6; font-weight:700; font-size:.72rem; color:#374151; text-align:left }
.fa-td-param { font-weight:600; color:#1f2937 }
.fa-td-count { text-align:center; font-weight:600; color:#4b5563 }
.fa-td-range { color:#374151 }
.fa-group-badge { display:inline-block; border-radius:10px; padding:1px 7px; font-size:.68rem; font-weight:700 }
.fa-vital-scroll { overflow-x:auto }
.fa-vital-tbl { width:100%; border-collapse:collapse; font-size:.76rem; white-space:nowrap }
.fa-vt-hdr { background:#f0fdfa; border:1px solid #b2dfdb; padding:.3rem .5rem; font-weight:700; color:#004d40; text-align:center; position:sticky; top:0 }
.fa-vt-time { border:1px solid #e5e7eb; padding:.25rem .5rem; font-weight:700; color:#374151; background:#f9f9f9 }
.fa-vt-val { border:1px solid #e5e7eb; padding:.25rem .5rem; text-align:center; color:#1f2937 }
</style>
