<template>
  <!-- ── Loading / Error / Kosong: satu halaman A4 ── -->
  <div v-if="loading || error || !fact.length" class="rme-a4-page" data-section="cppt">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Reg: {{ dataPasien?.NOPENDAFTARAN }}</span>
    </div>
    <div class="rme-section-title">
      <i class="pi pi-file-edit no-print" style="color: #1a3a5f"></i>
      CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT / SOAP)
    </div>
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat catatan CPPT...
    </div>
    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>
    <div v-else class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada catatan CPPT/SOAP untuk kunjungan ini.
    </div>
  </div>

  <!-- ── Satu halaman A4 per chunk data ── -->
  <template v-else>
    <div
      v-for="(chunk, pageIdx) in chunks"
      :key="pageIdx"
      class="rme-a4-page cppt-a4-page"
      data-section="cppt"
    >
      <!-- Header repeat setiap halaman -->
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg"> CPPT Hal. {{ pageIdx + 1 }}/{{ chunks.length }} </span>
      </div>

      <!-- Judul section hanya di halaman pertama -->
      <div v-if="pageIdx === 0" class="rme-section-title">
        <i class="pi pi-file-edit no-print" style="color: #1a3a5f"></i>
        CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT / SOAP)
      </div>

      <!-- Tabel CPPT untuk chunk ini -->
      <table class="rme-cppt-table">
        <thead>
          <tr>
            <th class="col-auth">AUTH</th>
            <th class="col-no">No.</th>
            <th class="col-waktu">WAKTU</th>
            <th class="col-soap">SOAP / SBAR</th>
            <th class="col-instruksi">INSTRUKSI / VERIF</th>
            <th class="col-ppa">PPA</th>
            <th class="col-qr">AUTH</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in chunk" :key="item.id" :class="{ 'row-auth': item.hasbeen_auth == 1 }">
            <td class="col-auth td-center">
              <span v-if="item.hasbeen_auth == 1" class="rme-badge rme-badge-success auth-icon"
                >&#10003;</span
              >
              <span v-else class="rme-badge rme-badge-warning auth-icon">&#9203;</span>
              <div v-if="item.jenis_dok === 'SBAR'" class="mt-1">
                <span class="rme-badge rme-badge-warning">SBAR</span>
              </div>
            </td>

            <td class="col-no td-center">
              <strong>{{ globalIndex(pageIdx, item) }}</strong>
            </td>

            <td class="col-waktu">
              <div class="cppt-waktu">{{ item.waktu_display || '-' }}</div>
            </td>

            <td class="col-soap">
              <div v-if="hasTTV(item)" class="rme-cppt-ttv">
                <span v-if="Number(item.suhu) > 0"
                  ><i class="fas fa-thermometer-half"></i> {{ item.suhu }}°C</span
                >
                <span v-if="Number(item.sistole) > 0"
                  ><i class="pi pi-heart"></i> {{ item.sistole }}/{{ item.diastole }} mmHg</span
                >
                <span v-if="Number(item.nadi) > 0"
                  ><i class="pi pi-wave-pulse"></i> {{ item.nadi }}x/mnt</span
                >
                <span v-if="Number(item.spo2) > 0"
                  ><i class="pi pi-cloud"></i> SpO&#8322; {{ item.spo2 }}%</span
                >
                <span v-if="Number(item.pernafasan) > 0 || Number(item.respirasi) > 0">
                  <i class="pi pi-replay"></i> {{ item.pernafasan || item.respirasi }}x/mnt
                </span>
                <span v-if="Number(item.gcs) > 0"
                  ><i class="pi pi-eye"></i> GCS {{ item.gcs }}</span
                >
              </div>
              <div v-if="item.subject" class="cppt-soap-row">
                <span class="cppt-soap-lbl">{{ item.caption1 || 'S' }}:</span>
                <span class="cppt-soap-val" v-html="formatText(item.subject)"></span>
              </div>
              <div v-if="item.object_display" class="cppt-soap-row">
                <span class="cppt-soap-lbl">{{ item.caption2 || 'O' }}:</span>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px">
                  <span
                    class="cppt-soap-val rme-cppt-obj-html"
                    v-html="item.object_display || formatText(item.object)"
                  ></span>
                  <span class="cppt-soap-val">{{ item.object }}</span>
                </div>
              </div>
              <div v-if="item.asessment" class="cppt-soap-row">
                <span class="cppt-soap-lbl">{{ item.caption3 || 'A' }}:</span>
                <span class="cppt-soap-val" v-html="formatText(item.asessment)"></span>
              </div>
              <div v-if="item.jenis_dok !== 'SBAR' && item.plan" class="cppt-soap-row">
                <span class="cppt-soap-lbl">{{ item.caption4 || 'P' }}:</span>
                <span class="cppt-soap-val" v-html="formatText(item.plan)"></span>
              </div>
              <div v-if="item.catatan_penting" class="rme-cppt-catatan">
                <span class="rme-cppt-catatan-lbl">Catatan Penting:</span>
                {{ item.catatan_penting }}
              </div>
            </td>

            <td class="col-instruksi">
              <template v-if="item.jenis_dok === 'SBAR'">
                <div v-if="item.plan" class="cppt-soap-row">
                  <span class="cppt-soap-lbl">{{ item.caption4 || 'R' }}:</span>
                  <span class="cppt-soap-val" v-html="formatText(item.plan)"></span>
                </div>
                <div class="rme-cppt-verif mt-1">
                  <template v-if="item.verif == 1">
                    <div class="rme-badge rme-badge-success">Terverifikasi DPJP</div>
                    <div v-if="item.profesi_verif" class="cppt-verif-name mt-1">
                      {{ item.profesi_verif }} - {{ item.verif_by_name }}
                    </div>
                  </template>
                  <span v-else class="rme-badge rme-badge-warning">Menunggu Verif DPJP</span>
                </div>
              </template>
              <span v-else class="text-muted-sm">-</span>
            </td>

            <td class="col-ppa">
              <div class="cppt-ppa-profesi" :style="profesiStyle(item.profesi)">
                {{ item.profesi || '-' }}
              </div>
              <div class="cppt-ppa-name">{{ item.verif_user_display || '' }}</div>
            </td>

            <td class="col-qr td-center">
              <template v-if="item.hasbeen_auth == 1">
                <QrcodeVue
                  :value="qrValue(item)"
                  :size="50"
                  level="H"
                  render-as="svg"
                  class="cppt-qr-img"
                />
                <div v-if="item.time_auth" class="cppt-qr-time">
                  <!-- {{ item.time_auth }} -->
                </div>
              </template>
              <span v-else class="text-muted-sm">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Analisis Tren TTV ── -->
    <div v-if="ttvItems.length >= 2" class="rme-a4-page" data-section="cppt-ttv">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ dataPasien?.NOPENDAFTARAN }}</span>
      </div>
      <div class="ttv-trend-section">
        <div class="ttv-trend-header">
          <i class="pi pi-chart-line"></i> ANALISIS TREN TANDA-TANDA VITAL
        </div>
        <div v-if="ttvFlags.length > 0" class="ttv-flag-wrap">
          <div class="ttv-flag-title">
            <i class="pi pi-exclamation-triangle"></i> Peringatan Nilai Abnormal
          </div>
          <div class="ttv-flag-list">
            <span
              v-for="flag in ttvFlags"
              :key="flag.id + flag.param"
              class="ttv-flag-badge"
              :class="flag.level"
            >
              {{ flag.msg }} <span class="ttv-flag-time">({{ flag.waktu }})</span>
            </span>
          </div>
        </div>
        <div v-else class="ttv-flag-ok">
          <i class="pi pi-check-circle"></i> Semua nilai TTV dalam rentang normal
        </div>
        <div class="ttv-chart-wrap">
          <canvas ref="trendCanvas" style="height: 180px; width: 100%"></canvas>
        </div>
        <div v-if="shiftData.length > 0" class="ttv-shift-wrap">
          <div class="ttv-shift-title"><i class="pi pi-clock"></i> Rata-rata TTV per Shift</div>
          <table class="ttv-shift-table">
            <thead>
              <tr>
                <th>Shift</th>
                <th>Entri</th>
                <th><i class="fas fa-thermometer-half"></i> Suhu</th>
                <th><i class="pi pi-heart"></i> TD (mmHg)</th>
                <th><i class="pi pi-wave-pulse"></i> Nadi</th>
                <th><i class="pi pi-cloud"></i> SpO&#8322;</th>
                <th><i class="pi pi-replay"></i> RR</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in shiftData"
                :key="row.shift"
                :class="'shift-' + row.shift.toLowerCase()"
              >
                <td class="shift-name">{{ row.shift }}</td>
                <td class="td-center">{{ row.count }}</td>
                <td :class="{ 'val-warn': row.suhuWarn }">{{ row.suhu }} °C</td>
                <td :class="{ 'val-warn': row.tdWarn }">{{ row.td }}</td>
                <td :class="{ 'val-warn': row.nadiWarn }">{{ row.nadi }} x/mnt</td>
                <td :class="{ 'val-warn': row.spo2Warn }">{{ row.spo2 }} %</td>
                <td :class="{ 'val-warn': row.rrWarn }">{{ row.rr }} x/mnt</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, inject } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})
const addTimelineEvent = inject('addTimelineEvent', () => {})

const ROWS_PER_PAGE = 5

const loading = ref(true)
const error = ref(null)
const fact = ref([])
const trendCanvas = ref(null)
let chartInstance = null

// ── Chunking: pecah data menjadi kelompok per halaman A4 ──────────────────
const chunks = computed(() => {
  const result = []
  for (let i = 0; i < fact.value.length; i += ROWS_PER_PAGE) {
    result.push(fact.value.slice(i, i + ROWS_PER_PAGE))
  }
  return result
})

const globalIndex = (pageIdx, item) => {
  const flatIdx = fact.value.findIndex((f) => f.id === item.id)
  return flatIdx >= 0 ? flatIdx + 1 : pageIdx * ROWS_PER_PAGE + 1
}

// ── helpers ────────────────────────────────────────────────────────────────

const hasTTV = (item) =>
  Number(item.suhu) > 0 ||
  Number(item.sistole) > 0 ||
  Number(item.nadi) > 0 ||
  Number(item.spo2) > 0 ||
  Number(item.pernafasan) > 0 ||
  Number(item.respirasi) > 0 ||
  Number(item.gcs) > 0

const qrValue = (item) =>
  ['CPPT', item.id, props.noreg, item.profesi, item.verif_user_display]
    .map((v) => v ?? '')
    .join('|')

const PROFESI_STYLE = {
  DPJP: { color: '#7b1fa2', background: '#f3e5f5', borderColor: '#ce93d8' },
  'DOKTER SPESIALIS': { color: '#1565c0', background: '#e3f2fd', borderColor: '#90caf9' },
  'DOKTER UMUM': { color: '#0277bd', background: '#e1f5fe', borderColor: '#81d4fa' },
  'DOKTER GIGI': { color: '#00695c', background: '#e0f2f1', borderColor: '#80cbc4' },
  PERAWAT: { color: '#2e7d32', background: '#e8f5e9', borderColor: '#a5d6a7' },
  APOTEKER: { color: '#e65100', background: '#fff3e0', borderColor: '#ffcc80' },
  'TENAGA KEFARMASIAN': { color: '#bf360c', background: '#fbe9e7', borderColor: '#ffab91' },
  'AHLI GIZI': { color: '#f57f17', background: '#fffde7', borderColor: '#ffe082' },
}

const profesiStyle = (profesi) => {
  const key = (profesi || '').trim().toUpperCase()
  return PROFESI_STYLE[key] ?? { color: '#37474f', background: '#eceff1', borderColor: '#b0bec5' }
}

const formatText = (text) => {
  if (!text) return '-'
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

// ── TTV items (hanya entri yang punya TTV, urut kronologis) ────────────────

const ttvItems = computed(() => [...(fact.value || []).filter(hasTTV)])

// ── Flag nilai abnormal ────────────────────────────────────────────────────

const NORMAL = {
  suhu: { min: 36.0, max: 37.5, critMin: 35.0, critMax: 39.0 },
  sistole: { min: 90, max: 140, critMin: 80, critMax: 180 },
  diastole: { min: 60, max: 90, critMin: 50, critMax: 120 },
  nadi: { min: 60, max: 100, critMin: 40, critMax: 130 },
  spo2: { min: 95, max: 100, critMin: 90 },
  rr: { min: 12, max: 20, critMin: 8, critMax: 30 },
  gcs: { min: 14, max: 15, critMin: 8 },
}

const ttvFlags = computed(() => {
  const flags = []
  ttvItems.value.forEach((item) => {
    const waktu = item.waktu_display || ''
    const checks = [
      { key: 'suhu', val: Number(item.suhu), label: 'Suhu', unit: '°C' },
      { key: 'sistole', val: Number(item.sistole), label: 'Sistole', unit: ' mmHg' },
      { key: 'nadi', val: Number(item.nadi), label: 'Nadi', unit: 'x/mnt' },
      { key: 'spo2', val: Number(item.spo2), label: 'SpO₂', unit: '%' },
      {
        key: 'rr',
        val: Number(item.pernafasan || item.respirasi || 0),
        label: 'RR',
        unit: 'x/mnt',
      },
      { key: 'gcs', val: Number(item.gcs), label: 'GCS', unit: '' },
    ]
    checks.forEach(({ key, val, label, unit }) => {
      if (!val) return
      const n = NORMAL[key]
      if (!n) return
      let level = null,
        msg = ''
      if (n.critMin && val < n.critMin) {
        level = 'flag-danger'
        msg = `${label} KRITIS rendah: ${val}${unit}`
      } else if (val < n.min) {
        level = 'flag-warning'
        msg = `${label} rendah: ${val}${unit}`
      } else if (n.critMax && val > n.critMax) {
        level = 'flag-danger'
        msg = `${label} KRITIS tinggi: ${val}${unit}`
      } else if (n.max && val > n.max) {
        level = 'flag-warning'
        msg = `${label} tinggi: ${val}${unit}`
      }
      if (level) flags.push({ id: item.id, waktu, level, msg, param: key })
    })
  })
  return flags
})

// ── Perbandingan shift ─────────────────────────────────────────────────────

const shiftData = computed(() => {
  const shifts = { Pagi: [], Sore: [], Malam: [] }
  ttvItems.value.forEach((item) => {
    const m = (item.waktu_display || '').match(/(\d{1,2}):(\d{2})/)
    const hour = m ? parseInt(m[1]) : -1
    const shift = hour >= 7 && hour < 14 ? 'Pagi' : hour >= 14 && hour < 21 ? 'Sore' : 'Malam'
    shifts[shift].push(item)
  })

  const avg = (arr, ...keys) => {
    const vals = arr.flatMap((x) => keys.map((k) => Number(x[k]))).filter((v) => v > 0)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-'
  }

  return Object.entries(shifts)
    .filter(([, items]) => items.length > 0)
    .map(([shift, items]) => {
      const suhu = avg(items, 'suhu')
      const sys = avg(items, 'sistole')
      const dia = avg(items, 'diastole')
      const nadi = avg(items, 'nadi')
      const spo2 = avg(items, 'spo2')
      const rr = avg(items, 'pernafasan', 'respirasi')
      return {
        shift,
        count: items.length,
        suhu,
        suhuWarn: suhu !== '-' && (suhu < 36.0 || suhu > 37.5),
        td: sys !== '-' ? `${sys}/${dia}` : '-',
        tdWarn: sys !== '-' && (Number(sys) < 90 || Number(sys) > 140),
        nadi,
        nadiWarn: nadi !== '-' && (Number(nadi) < 60 || Number(nadi) > 100),
        spo2,
        spo2Warn: spo2 !== '-' && Number(spo2) < 95,
        rr,
        rrWarn: rr !== '-' && (Number(rr) < 12 || Number(rr) > 20),
      }
    })
})

// ── Chart.js ───────────────────────────────────────────────────────────────

const buildChart = () => {
  if (!trendCanvas.value || ttvItems.value.length < 2) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const items = ttvItems.value
  const labels = items.map((x) => {
    const m = (x.waktu_display || '').match(/(\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})/)
    return m ? `${m[1]} ${m[2]}` : (x.waktu_display || '').slice(0, 14)
  })

  const ds = (label, getter, color, yAxisID = 'y') => ({
    label,
    data: items.map((x) => {
      const v = Number(getter(x))
      return v > 0 ? v : null
    }),
    borderColor: color,
    backgroundColor: color + '18',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0.35,
    spanGaps: true,
    yAxisID,
  })

  chartInstance = new Chart(trendCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        ds('Sistole', (x) => x.sistole, '#e53935'),
        ds('Diastole', (x) => x.diastole, '#fb8c00'),
        ds('Nadi', (x) => x.nadi, '#8e24aa'),
        ds('RR', (x) => x.pernafasan || x.respirasi || 0, '#43a047'),
        ds('GCS', (x) => x.gcs, '#00838f'),
        ds('SpO₂', (x) => x.spo2, '#1e88e5', 'y1'),
        ds('Suhu', (x) => x.suhu, '#f4511e', 'y1'),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10, padding: 6 } },
        tooltip: { bodyFont: { size: 10 }, titleFont: { size: 10 } },
      },
      scales: {
        x: {
          ticks: { font: { size: 9 }, maxRotation: 30 },
          grid: { color: '#f0f0f0' },
        },
        y: {
          type: 'linear',
          position: 'left',
          min: 0,
          max: 220,
          title: { display: true, text: 'mmHg / bpm', font: { size: 9 } },
          ticks: { font: { size: 9 } },
          grid: { color: '#efefef' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: 34,
          max: 100,
          title: { display: true, text: 'SpO₂(%) / Suhu(°C)', font: { size: 9 } },
          ticks: { font: { size: 9 } },
          grid: { drawOnChartArea: false },
        },
      },
    },
  })
}

// ── Data fetch ─────────────────────────────────────────────────────────────

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Triaseigd/get_soap`,
      { mode: 4, noregister: props.noreg, id_client: id_client.value },
      { headers: { 'Content-Type': 'application/json' } },
    )
    fact.value = (response.data?.response || []).filter((x) => x.deleted !== '1')
  } catch (e) {
    error.value = 'Gagal memuat data CPPT: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    const hasCppt = fact.value.length > 0
    reportSectionData('cppt', hasCppt)
    if (hasCppt) {
      addTimelineEvent('cppt', {
        key: 'cppt',
        label: 'CPPT / SOAP',
        icon: 'file',
        color: '#1a3a5f',
        datetime: fact.value[0]?.waktu_display || '',
        meta: fact.value.length + ' catatan',
      })
    }
    await nextTick()
    buildChart()
  }
}

watch(fact, async () => {
  await nextTick()
  buildChart()
})

onMounted(fetchData)
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>

<style scoped>
/* ── Halaman CPPT berukuran A4 ── */
.cppt-a4-page {
  min-height: 267mm !important;
  box-sizing: border-box;
}

/* ── Tabel CPPT ── */
.rme-cppt-table-wrap {
  overflow-x: hidden;
  margin-top: 4px;
}
.rme-cppt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.rme-cppt-table thead tr {
  background: linear-gradient(90deg, #1a3a5f 0%, #2c5282 100%);
  color: #fff;
}
.rme-cppt-table thead th {
  padding: 7px 9px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  border: 1px solid #1a3a5f;
  white-space: nowrap;
}
.rme-cppt-table tbody tr {
  border-bottom: 1px solid #d5e3f0;
}
.rme-cppt-table tbody tr:nth-child(odd),
.rme-cppt-table tbody tr:nth-child(even),
.rme-cppt-table tbody tr.row-auth,
.rme-cppt-table tbody tr.row-auth:nth-child(even) {
  background: #ffffff;
}
.rme-cppt-table tbody td {
  padding: 7px 9px;
  border: 1px solid #dde8f4;
  vertical-align: top;
}
.col-auth {
  width: 48px;
}
.col-no {
  width: 34px;
}
.col-waktu {
  width: 100px;
}
.col-soap {
  min-width: 220px;
}
.col-instruksi {
  min-width: 140px;
}
.col-ppa {
  width: 120px;
}
.col-qr {
  width: 68px;
}
.td-center {
  text-align: center;
}
.cppt-waktu {
  font-size: 12px;
  font-weight: 600;
  color: #1a3a5f;
  white-space: pre-line;
}
.cppt-soap-row {
  display: flex;
  gap: 4px;
  margin-bottom: 3px;
  align-items: flex-start;
  font-size: 12px;
}
.cppt-soap-lbl {
  font-weight: 800;
  color: #162d4e;
  border-left: 3px solid #162d4e;
  padding-left: 4px;
  min-width: 20px;
  flex-shrink: 0;
}
.cppt-soap-val {
  color: #333;
  flex: 1;
  word-break: break-word;
}
.auth-icon {
  font-size: 14px;
  padding: 3px 6px;
}
.cppt-ppa-profesi {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.cppt-ppa-name {
  font-size: 11px;
  color: #555;
  margin-top: 2px;
}
.cppt-verif-name {
  font-size: 11px;
  color: #444;
  font-style: italic;
}
.cppt-qr-img {
  background: #fff;
  padding: 2px;
  border-radius: 2px;
  display: block;
  margin: 0 auto;
}
.cppt-qr-time {
  font-size: 10px;
  color: #4a6e4c;
  margin-top: 2px;
  text-align: center;
  word-break: break-all;
}
.rme-cppt-ttv {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #455a64;
  margin-bottom: 5px;
  padding: 2px 0;
}
.rme-cppt-ttv .pi,
.rme-cppt-ttv .fas {
  font-size: 11px;
}
.rme-cppt-catatan {
  margin-top: 5px;
  padding: 3px 7px;
  background: #fff8e1;
  border-left: 3px solid #f9a825;
  border-radius: 2px;
  font-size: 11px;
  color: #5d4037;
}
.rme-cppt-catatan-lbl {
  font-weight: 700;
  margin-right: 4px;
}
.rme-cppt-verif {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.rme-cppt-obj-html :deep(*) {
  font-size: 12px !important;
  font-family: 'Segoe UI', Arial, sans-serif !important;
  line-height: 1.55 !important;
  color: #333 !important;
}
.text-muted-sm {
  font-size: 11px;
  color: #aaa;
}
.mt-1 {
  margin-top: 4px;
}

/* ── Analisis Tren ── */
.ttv-trend-section {
  margin-top: 14px;
  border: 1px solid #dde8f4;
  border-top: 3px solid #1a3a5f;
  border-radius: 4px;
  background: #fff;
  padding: 10px 12px 14px;
  box-sizing: border-box;
}
.ttv-trend-header {
  font-size: 12px;
  font-weight: 800;
  color: #1a3a5f;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
}

/* Flags */
.ttv-flag-wrap {
  margin-bottom: 8px;
}
.ttv-flag-title {
  font-size: 11px;
  font-weight: 700;
  color: #b71c1c;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ttv-flag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.ttv-flag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}
.ttv-flag-badge.flag-danger {
  background: #fde8e8;
  color: #b71c1c;
  border: 1px solid #ef9a9a;
}
.ttv-flag-badge.flag-warning {
  background: #fff8e1;
  color: #e65100;
  border: 1px solid #ffcc02;
}
.ttv-flag-time {
  font-weight: 400;
  font-size: 10px;
  color: #888;
}
.ttv-flag-ok {
  font-size: 11px;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

/* Grafik */
.ttv-chart-wrap {
  position: relative;
  height: 180px;
  margin-bottom: 14px;
}

/* Tabel Shift */
.ttv-shift-wrap {
  margin-top: 10px;
}
.ttv-shift-title {
  font-size: 12px;
  font-weight: 700;
  color: #1a3a5f;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.ttv-shift-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.ttv-shift-table thead tr {
  background: #eef3fa;
}
.ttv-shift-table thead th {
  padding: 5px 9px;
  font-weight: 700;
  color: #1a3a5f;
  border: 1px solid #d5e3f0;
  text-align: center;
  font-size: 11px;
}
.ttv-shift-table tbody td {
  padding: 5px 9px;
  border: 1px solid #e8eef6;
  text-align: center;
  font-size: 12px;
}
.shift-name {
  font-weight: 700;
  text-align: left !important;
}
.shift-pagi td {
  background: #fffde7;
}
.shift-sore td {
  background: #fff3e0;
}
.shift-malam td {
  background: #e8eaf6;
}
.val-warn {
  color: #d32f2f;
  font-weight: 700;
}

@media print {
  .no-print {
    display: none !important;
  }
  .rme-cppt-table thead tr {
    background: #1a3a5f !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .cppt-qr-img {
    background: #fff !important;
  }
}
</style>
