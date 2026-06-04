<template>
  <loading_overlay :is-loading="loading" message="Memuat data partograf..." />

  <!-- ═══ Page Header ══════════════════════════════════════════════════════ -->
  <div class="content">
    <div class="parto-page-header mb-3">
      <div class="parto-page-header__icon"><i class="pi pi-heart-fill"></i></div>
      <div>
        <div class="parto-page-header__title">Partograf Kebidanan</div>
        <div class="parto-page-header__sub">
          Pemantauan kemajuan persalinan standar WHO secara interaktif
        </div>
      </div>
    </div>

    <!-- ═══ Form Data Pasien & Pengaturan Waktu ══════════════════════════════ -->
    <div class="row g-3 mb-3">
      <div class="col-lg-6">
        <div class="parto-card h-100">
          <div class="parto-card-header"><i class="pi pi-user me-2"></i>DATA PASIEN</div>
          <div class="parto-card-body">
            <div class="row g-2">
              <div class="col-md-7">
                <label class="field-label">Nama Pasien</label>
                <InputText
                  v-model="form.namaPasien"
                  placeholder="Nama lengkap pasien"
                  class="w-100"
                />
              </div>
              <div class="col-md-5">
                <label class="field-label">No. Register</label>
                <InputText v-model="form.noRegister" class="w-100" disabled />
              </div>
              <div class="col-4">
                <label class="field-label">Gravida (G)</label>
                <InputNumber
                  v-model="form.gravida"
                  :min="0"
                  :max="20"
                  class="w-100"
                  inputClass="text-center"
                />
              </div>
              <div class="col-4">
                <label class="field-label">Para (P)</label>
                <InputNumber
                  v-model="form.para"
                  :min="0"
                  :max="20"
                  class="w-100"
                  inputClass="text-center"
                />
              </div>
              <div class="col-4">
                <label class="field-label">Abortus (A)</label>
                <InputNumber
                  v-model="form.abortus"
                  :min="0"
                  :max="20"
                  class="w-100"
                  inputClass="text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="parto-card h-100">
          <div class="parto-card-header"><i class="pi pi-clock me-2"></i>PENGATURAN WAKTU</div>
          <div class="parto-card-body">
            <div class="row g-2">
              <div class="col-md-5">
                <label class="field-label">Tanggal Persalinan</label>
                <InputText type="date" v-model="form.tanggal" class="w-100" />
              </div>
              <div class="col-md-4">
                <label class="field-label">Jam Mulai <span class="required">*</span></label>
                <InputText
                  type="time"
                  v-model="form.jamMulai"
                  class="w-100"
                  @change="onJamMulaiChange"
                />
              </div>
              <div class="col-md-3">
                <label class="field-label">Total Slot</label>
                <InputNumber
                  v-model="form.totalSlot"
                  :min="12"
                  :max="60"
                  class="w-100"
                  inputClass="text-center"
                />
              </div>
              <div class="col-12">
                <div v-if="form.jamMulai" class="timeline-info">
                  <i class="pi pi-check-circle me-1"></i>
                  Mulai <strong>{{ form.jamMulai }}</strong> — interval 30 mnt —
                  <strong>{{ timeLabels.length }}</strong> slot (s/d
                  <strong>{{ timeLabels[timeLabels.length - 1] }}</strong
                  >)
                </div>
                <div v-else class="timeline-info timeline-info--warn">
                  <i class="pi pi-exclamation-triangle me-1"></i>
                  Masukkan jam mulai untuk mengaktifkan input observasi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Grafik Utama: PEMBUKAAN SERVIKS & KONTRAKSI ═════════════════════ -->
    <div class="parto-card mb-3">
      <div class="parto-card-header parto-card-header--teal">
        <i class="fas fa-chart-area me-2"></i>
        PEMBUKAAN SERVIKS &amp; KONTRAKSI
      </div>
      <div class="parto-card-body p-0">
        <v-chart
          ref="chartPembukaanRef"
          :option="chartPembukaanOption"
          :autoresize="true"
          style="height: 600px; width: 100%; cursor: crosshair"
          @zrender:click="onChartPembukaanClick"
        />
      </div>
    </div>

    <!-- ═══ Grafik DJJ (Denyut Jantung Janin) ═══════════════════════════════ -->
    <div class="parto-card mb-3">
      <div class="parto-card-header parto-card-header--teal">
        <i class="fas fa-heartbeat me-2"></i>
        DENYUT JANTUNG JANIN (DJJ)
      </div>
      <div class="parto-card-body p-0">
        <v-chart
          ref="chartDjjRef"
          :option="chartDjjOption"
          :autoresize="true"
          style="height: 200px; width: 100%; cursor: crosshair"
          @zrender:click="onChartDjjClick"
        />
      </div>
    </div>

    <!-- ═══ Grafik Tensi Ibu ════════════════════════════════════════════════ -->
    <div class="parto-card mb-3">
      <div class="parto-card-header parto-card-header--teal">
        <i class="fas fa-tachometer-alt me-2"></i>
        TENSI IBU (Tekanan Darah)
      </div>
      <div class="parto-card-body p-0">
        <v-chart
          ref="chartTensiRef"
          :option="chartTensiOption"
          :autoresize="true"
          style="height: 240px; width: 100%; cursor: crosshair"
          @zrender:click="onChartTensiClick"
        />
      </div>
    </div>

    <!-- ═══ Tabel Data Observasi ═════════════════════════════════════════════ -->
    <div class="parto-card mb-3">
      <div class="parto-card-header parto-card-header--teal">
        <i class="pi pi-table me-2"></i>
        DATA OBSERVASI
        <span class="obs-count-badge">{{ observations.length }} catatan</span>
        <div class="ms-auto">
          <Button
            :label="showModal ? 'Tutup Form' : 'Tambah'"
            :icon="showModal ? 'pi pi-times' : 'pi pi-plus'"
            size="small"
            :severity="showModal ? 'secondary' : undefined"
            class="btn-obs-tambah"
            :disabled="!form.jamMulai"
            @click="showModal ? (showModal = false) : openModal()"
          />
        </div>
      </div>

      <!-- ── Inline Form Input Observasi ──────────────────────────────────── -->
      <div v-if="showModal" class="obs-inline-form">
        <div class="oif-title">
          {{ editIndex !== null ? '✏️ Edit Observasi' : '➕ Tambah Observasi' }}
        </div>

        <!-- Baris 1: Waktu + Serviks + DJJ + Kontraksi -->
        <div class="row g-2 mb-2">
          <div class="col-md-3 col-sm-6">
            <label class="oif-label">Waktu <span class="required">*</span></label>
            <Select
              v-model="modalForm.timeIndex"
              :options="timeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih waktu..."
              class="w-100 oif-select"
              :disabled="editIndex !== null"
              filter
            />
          </div>
          <div class="col-md-2 col-sm-6">
            <label class="oif-label"><span class="sym-x">✕</span> Pembukaan (cm)</label>
            <InputNumber v-model="modalForm.pembukaan" :min="0" :max="10" :step="0.5" class="w-100 oif-input" />
          </div>
          <div class="col-md-2 col-sm-6">
            <label class="oif-label"><span class="sym-o">○</span> Penurunan (/5)</label>
            <InputNumber v-model="modalForm.penurunan" :min="0" :max="5" class="w-100 oif-input" />
          </div>
          <div class="col-md-2 col-sm-6">
            <label class="oif-label">DJJ (bpm)</label>
            <InputNumber v-model="modalForm.djj" :min="60" :max="200" class="w-100 oif-input" placeholder="100–180" />
          </div>
          <div class="col-md-1 col-sm-6">
            <label class="oif-label">Kontraksi</label>
            <InputNumber v-model="modalForm.kontraksi" :min="0" :max="5" class="w-100 oif-input" />
          </div>
          <div class="col-md-1 col-sm-6">
            <label class="oif-label">Nadi</label>
            <InputNumber v-model="modalForm.nadi" :min="40" :max="200" class="w-100 oif-input" />
          </div>
          <div class="col-md-1 col-sm-6">
            <label class="oif-label">Suhu (°C)</label>
            <InputNumber v-model="modalForm.suhu" :min="35" :max="42" :step="0.1" :minFractionDigits="1" class="w-100 oif-input" />
          </div>
        </div>

        <!-- Baris 2: Tensi + Durasi + Aksi -->
        <div class="row g-2 align-items-end">
          <div class="col-md-2 col-sm-6">
            <label class="oif-label tensi-sub-label">
              <span class="tensi-badge tensi-badge--s">S</span> Sistolik (mmHg)
            </label>
            <InputNumber v-model="modalForm.tensiSistolik" :min="60" :max="220" class="w-100 oif-input" />
          </div>
          <div class="col-md-2 col-sm-6">
            <label class="oif-label tensi-sub-label">
              <span class="tensi-badge tensi-badge--d">D</span> Diastolik (mmHg)
            </label>
            <InputNumber v-model="modalForm.tensiDiastolik" :min="40" :max="140" class="w-100 oif-input" />
          </div>
          <div class="col-md-5 col-sm-12">
            <label class="oif-label">Durasi Kontraksi</label>
            <div class="durasi-group-h">
              <label
                v-for="opt in durasiOptions"
                :key="opt.value"
                :class="['durasi-radio-h', `durasi-radio--${opt.value}`, { selected: modalForm.durasiKontraksi === opt.value }]"
              >
                <input type="radio" v-model="modalForm.durasiKontraksi" :value="opt.value" class="visually-hidden" />
                <span class="durasi-dot-h"></span>
                {{ opt.label }}
              </label>
            </div>
          </div>
          <div class="col-md-3 col-sm-12 d-flex justify-content-end gap-2 pt-1">
            <Button label="Batal" icon="pi pi-times" severity="secondary" outlined size="small" @click="showModal = false" />
            <Button label="Simpan" icon="pi pi-check" class="btn-simpan" size="small" @click="simpanObservasi" />
          </div>
        </div>
      </div>

      <div class="parto-card-body p-0">
        <div class="table-responsive">
          <table class="parto-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pembukaan</th>
                <th>Penurunan</th>
                <th>DJJ</th>
                <th>Kontraksi</th>
                <th>Durasi Kontraksi</th>
                <th>Nadi</th>
                <th>Suhu</th>
                <th>Tensi</th>
                <th style="width: 88px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="observations.length === 0">
                <td colspan="10" class="empty-row">
                  <i class="pi pi-inbox me-2"></i>Belum ada data observasi
                </td>
              </tr>
              <tr v-for="(obs, idx) in observations" :key="idx">
                <td>
                  <strong>{{ obs.time }}</strong>
                </td>
                <td>{{ obs.pembukaan ?? '—' }} cm</td>
                <td>{{ obs.penurunan ?? '—' }}/5</td>
                <td>{{ obs.djj ?? '—' }} bpm</td>
                <td>{{ obs.kontraksi ?? '—' }}×</td>
                <td>
                  <span :class="getDurasiClass(obs.durasiKontraksi)">
                    {{ getDurasiLabel(obs.durasiKontraksi) }}
                  </span>
                </td>
                <td>{{ obs.nadi ?? '—' }} x/mnt</td>
                <td>{{ obs.suhu ?? '—' }} °C</td>
                <td>
                  <span v-if="obs.tensiSistolik || obs.tensiDiastolik" class="tensi-cell">
                    <span class="tensi-s">{{ obs.tensiSistolik ?? '?' }}</span>/<span class="tensi-d">{{ obs.tensiDiastolik ?? '?' }}</span>
                    <small> mmHg</small>
                  </span>
                  <span v-else>—</span>
                </td>
                <td>
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="info"
                    text
                    @click="editObservasi(idx)"
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    text
                    @click="hapusObservasi(idx)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ Action Bar ═══════════════════════════════════════════════════════ -->
    <div class="parto-action-bar mb-4">
      <div class="action-inner">
        <span class="action-info">
          <i class="pi pi-info-circle me-2"></i>
          Klik pada grafik atau tombol "Tambah" di card observasi untuk input data
        </span>
        <div class="d-flex gap-2">
          <Button
            label="Reset Grafik"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            @click="resetData"
          />
          <Button
            label="Simpan Partograf"
            icon="pi pi-save"
            class="btn-simpan"
            :loading="loading"
            @click="savePartograf"
          />
        </div>
      </div>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// ── ECharts tree-shakeable imports ────────────────────────────────────────
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
])

import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'
import { useAuthStore, useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const toast = useToast()
const route = useRoute()
const authStore = useAuthStore()
const configStore = useConfigStore()
const { id_client } = storeToRefs(authStore)

// ── State ─────────────────────────────────────────────────────────────────
const loading = ref(false)
const showModal = ref(false)
const editIndex = ref(null)
const chartPembukaanRef = ref(null)
const chartDjjRef = ref(null)
const chartTensiRef = ref(null)
const stripePattern = ref(null) // canvas pattern untuk kontraksi 20–40 detik

// ── Form Data Pasien ──────────────────────────────────────────────────────
const form = ref({
  noRegister: route.query.noreg || '',
  namaPasien: route.query.nama || '',
  gravida: null,
  para: null,
  abortus: null,
  tanggal: new Date().toISOString().split('T')[0],
  jamMulai: '',
  totalSlot: 32, // 32 × 30 mnt = 16 jam (sesuai gambar)
})

const observations = ref([])

// ── Form Modal ────────────────────────────────────────────────────────────
const defaultModalForm = () => ({
  timeIndex: null,
  pembukaan: null,
  penurunan: null,
  djj: null,
  kontraksi: null,
  durasiKontraksi: null,
  nadi: null,
  suhu: null,
  tensiSistolik: null,
  tensiDiastolik: null,
})
const modalForm = ref(defaultModalForm())

const durasiOptions = [
  { label: '< 20 detik (his lemah)', value: 'kurang20' },
  { label: '20–40 detik (his sedang)', value: '20_40' },
  { label: '> 40 detik (his kuat / adekuat)', value: 'lebih40' },
]

// ── Timeline Generator ────────────────────────────────────────────────────
const timeLabels = computed(() => {
  const total = form.value.totalSlot || 32
  if (!form.value.jamMulai) {
    return Array.from({ length: total }, (_, i) => `T+${i * 30}m`)
  }
  const [h, m] = form.value.jamMulai.split(':').map(Number)
  return Array.from({ length: total }, (_, i) => {
    const mins = h * 60 + m + i * 30
    const hh = Math.floor(mins / 60) % 24
    const mm = mins % 60
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  })
})

const timeOptions = computed(() => timeLabels.value.map((label, idx) => ({ label, value: idx })))

// ── Persistensi otomatis ke localStorage ─────────────────────────────────
// Key dinamis berdasarkan noRegister agar setiap pasien punya slot sendiri.
const storageKey = computed(() => `partograf_${form.value.noRegister || 'temp'}`)

const persist = () => {
  try {
    localStorage.setItem(storageKey.value, JSON.stringify({
      form: form.value,
      observations: observations.value,
    }))
  } catch (_) {}
}

// Auto-save setiap kali form atau observations berubah (deep watch).
watch([form, observations], persist, { deep: true })

// ── Canvas Pattern: diagonal stripe untuk kontraksi 20–40 detik ──────────
const createStripePattern = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 10
  canvas.height = 10
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fb923c'
  ctx.fillRect(0, 0, 10, 10)
  ctx.strokeStyle = 'rgba(255,255,255,0.65)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(0, 10)
  ctx.lineTo(10, 0)
  ctx.stroke()
  return ctx.createPattern(canvas, 'repeat')
}

// ── Warna kontraksi berdasarkan durasi ────────────────────────────────────
const getKontraksiColor = (durasi) => {
  if (durasi === 'kurang20') return '#d1d5db' // abu-abu tipis
  if (durasi === '20_40') return stripePattern.value ?? '#fb923c' // stripe oranye
  if (durasi === 'lebih40') return '#374151' // hitam solid
  return '#9ca3af'
}

// ── Build sparse arrays dari observations ─────────────────────────────────
const buildSeriesData = () => {
  const total = timeLabels.value.length
  const pembukaan = new Array(total).fill(null)
  const penurunan = new Array(total).fill(null)
  const djj = new Array(total).fill(null)
  const kontraksi = new Array(total).fill(null)

  const sistolik = new Array(total).fill(null)
  const diastolik = new Array(total).fill(null)
  const tensiGap = new Array(total).fill(null)

  observations.value.forEach((obs) => {
    const i = obs.timeIndex
    if (i < 0 || i >= total) return
    if (obs.pembukaan != null) pembukaan[i] = obs.pembukaan
    if (obs.penurunan != null) penurunan[i] = obs.penurunan
    if (obs.djj != null) djj[i] = obs.djj
    if (obs.kontraksi != null)
      kontraksi[i] = {
        value: obs.kontraksi,
        itemStyle: { color: getKontraksiColor(obs.durasiKontraksi) },
      }
    if (obs.tensiDiastolik != null) diastolik[i] = obs.tensiDiastolik
    if (obs.tensiSistolik != null) {
      sistolik[i] = obs.tensiSistolik
      if (obs.tensiDiastolik != null)
        tensiGap[i] = obs.tensiSistolik - obs.tensiDiastolik
    }
  })

  return { pembukaan, penurunan, djj, kontraksi, sistolik, diastolik, tensiGap }
}

// ── Garis Waspada & Garis Bertindak ──────────────────────────────────────
// Standar WHO: Garis Waspada dimulai dari pembukaan 4 cm (t=0), naik 1 cm/jam
//   → 0,5 cm per interval 30 mnt
// Garis Bertindak: persis sama kemiringannya, digeser 4 jam (8 slot) ke kanan
//
// Teks "WASPADA" dan "BERTINDAK" disisipkan sebagai label pada data point
// di sekitar 1/3 panjang masing-masing garis (pendekatan label-on-series).
const buildAlertSeries = (total) => {
  // Posisi label: ~28% dan ~58% dari total slot
  const waspadaLabelIdx = Math.floor(total * 0.28)
  const bertindakLabelIdx = Math.floor(total * 0.58)

  // Sudut rotasi teks dalam derajat — harus cocok dengan kemiringan visual garis.
  // Kemiringan bergantung pada rasio skala Y (0–10) vs X (total slot).
  // Estimasi rata-rata untuk chart standar ≈ -22 derajat (CW = teks miring ke atas-kanan)
  const LABEL_ROTATE = -22

  const waspadaData = Array.from({ length: total }, (_, i) => {
    const val = 4 + i * 0.5
    if (val > 10) return null
    const v = parseFloat(val.toFixed(1))
    if (i === waspadaLabelIdx) {
      return {
        value: v,
        label: {
          show: true,
          formatter: 'W A S P A D A',
          rotate: LABEL_ROTATE,
          position: 'top',
          offset: [0, -14],
          color: '#94a3b8',
          fontSize: 12,
          fontStyle: 'italic',
        },
      }
    }
    return v
  })

  const bertindakData = Array.from({ length: total }, (_, i) => {
    if (i < 8) return null
    const val = 4 + (i - 8) * 0.5
    if (val > 10) return null
    const v = parseFloat(val.toFixed(1))
    if (i === bertindakLabelIdx) {
      return {
        value: v,
        label: {
          show: true,
          formatter: 'B E R T I N D A K',
          rotate: LABEL_ROTATE,
          position: 'top',
          offset: [0, -14],
          color: '#94a3b8',
          fontSize: 12,
          fontStyle: 'italic',
        },
      }
    }
    return v
  })

  return { waspadaData, bertindakData }
}

// ── Shared tooltip formatter ───────────────────────────────────────────────
const tooltipFormatter = (params) => {
  const time = params[0]?.axisValue ?? ''
  let html = `<div style="font-weight:700;margin-bottom:4px;border-bottom:1px solid #e5e7eb;padding-bottom:3px">${time}</div>`
  params.forEach((p) => {
    const val = typeof p.value === 'object' ? p.value?.value : p.value
    if (val == null) return
    html += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`
  })
  return html
}

// ── ECharts Option: Pembukaan Serviks & Kontraksi ────────────────────────
// Layout: Grid[0]=Pembukaan Serviks (atas, besar), Grid[1]=Kontraksi (bawah)
const chartPembukaanOption = computed(() => {
  const labels = timeLabels.value
  const total = labels.length
  const { pembukaan, penurunan, kontraksi } = buildSeriesData()
  const { waspadaData, bertindakData } = buildAlertSeries(total)

  const xAxisCommon = {
    type: 'category',
    data: labels,
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#9ca3af', width: 1 } },
    axisTick: { lineStyle: { color: '#d1d5db' } },
    splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1 } },
    axisLabel: {
      fontSize: 9,
      color: '#6b7280',
      interval: Math.max(0, Math.ceil(total / 24) - 1),
      rotate: total > 24 ? 45 : 0,
    },
  }

  return {
    backgroundColor: '#ffffff',
    animation: false,

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        link: [{ xAxisIndex: 'all' }],
        crossStyle: { color: '#9ca3af' },
      },
      formatter: tooltipFormatter,
    },

    // DataZoom: scroll horizontal sinkron antar grid
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 0, end: 100 },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        bottom: 4,
        height: 18,
        borderColor: '#e5e7eb',
        fillerColor: 'rgba(13,148,136,0.1)',
        handleStyle: { color: '#0d9488' },
      },
    ],

    // Grid 0: Pembukaan Serviks (tinggi ~68% chart)
    // Grid 1: Kontraksi        (tinggi ~20% chart)
    grid: [
      { left: 46, right: 18, top: 20, height: 350 },
      { left: 46, right: 18, top: 415, height: 120 },
    ],

    xAxis: [
      { ...xAxisCommon, gridIndex: 0, axisLabel: { show: true } }, // label disembunyikan di grid atas
      { ...xAxisCommon, gridIndex: 1, boundaryGap: true }, // label hanya di grid bawah
    ],

    yAxis: [
      {
        // Pembukaan Serviks 0–10
        gridIndex: 0,
        type: 'value',
        min: 0,
        max: 10,
        interval: 1,
        name: 'Pembukaan Serviks',
        nameLocation: 'middle',
        nameGap: 32,
        nameTextStyle: { fontSize: 9, color: '#374151', fontWeight: 600 },
        axisLabel: { fontSize: 10, color: '#374151', margin: 6 },
        axisLine: { show: true, lineStyle: { color: '#9ca3af', width: 1 } },
        splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1 } },
        axisTick: { show: true },
      },
      {
        // Penurunan Kepala 0–5 (sumbu kanan grid 0)
        gridIndex: 0,
        type: 'value',
        min: 0,
        max: 5,
        interval: 1,
        position: 'right',
        name: 'Penurunan',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { fontSize: 9, color: '#dc2626' },
        axisLabel: { fontSize: 10, color: '#dc2626', margin: 6 },
        axisLine: { show: true, lineStyle: { color: '#dc2626', width: 1 } },
        splitLine: { show: false },
        axisTick: { show: true },
      },
      {
        // Kontraksi 0–5 (grid 1)
        gridIndex: 1,
        type: 'value',
        min: 0,
        max: 5,
        interval: 1,
        name: 'Kontraksi',
        nameLocation: 'middle',
        nameGap: 28,
        nameTextStyle: { fontSize: 9, color: '#374151', fontWeight: 600 },
        axisLabel: { fontSize: 10, color: '#374151', margin: 6 },
        axisLine: { show: true, lineStyle: { color: '#9ca3af', width: 1 } },
        splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1 } },
        axisTick: { show: true },
      },
    ],

    series: [
      // ── 1. Pembukaan Serviks ─────────────────────────────────────────
      // Simbol: ✕ (custom SVG path), warna hitam/gelap — mengikuti standar WHO
      {
        name: 'Pembukaan Serviks',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: pembukaan,
        symbol: 'path://M-6,-6 L6,6 M-6,6 L6,-6', // X custom symbol
        symbolSize: 13,
        lineStyle: { color: '#111827', width: 2 },
        itemStyle: { color: '#111827' },
        label: { show: true, position: 'top', fontSize: 11, color: '#111827' },
        connectNulls: false,
        z: 5,
      },

      // ── 2. Penurunan Kepala ──────────────────────────────────────────
      // Simbol: O (emptyCircle), warna merah — sumbu Y kanan grid 0
      {
        name: 'Penurunan Kepala',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 1,
        data: penurunan,
        symbol: 'emptyCircle',
        symbolSize: 11,
        lineStyle: { color: '#dc2626', width: 2 },
        itemStyle: { color: '#dc2626', borderWidth: 2 },
        label: { show: true, position: 'top', fontSize: 11, color: '#dc2626' },
        connectNulls: false,
        z: 5,
      },

      // ── 3. Garis Waspada ─────────────────────────────────────────────
      // Dimulai dari (t=0, 4 cm), naik 1 cm/jam = 0,5 cm per slot 30 mnt.
      // Teks "WASPADA" muncul sebagai label pada data point di ~28% posisi.
      {
        name: 'Garis Waspada',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: waspadaData,
        symbol: 'none',
        lineStyle: { color: '#9ca3af', width: 1.5, type: 'solid' },
        itemStyle: { color: '#9ca3af' },
        emphasis: { label: { show: true } },
        connectNulls: false,
        z: 2,
      },

      // ── 4. Garis Bertindak ───────────────────────────────────────────
      // Sama kemiringan dengan Garis Waspada, digeser 4 jam (8 slot) ke kanan.
      // Jika pembukaan menyentuh garis ini → perlu tindakan segera.
      {
        name: 'Garis Bertindak',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: bertindakData,
        symbol: 'none',
        lineStyle: { color: '#9ca3af', width: 1.5, type: 'solid' },
        itemStyle: { color: '#9ca3af' },
        emphasis: { label: { show: true } },
        connectNulls: false,
        z: 2,
      },

      // ── 5. Kontraksi Uterus ──────────────────────────────────────────
      // Bar chart — warna per-item sesuai durasi kontraksi:
      //   < 20 det  → abu-abu tipis
      //   20–40 det → stripe oranye (canvas pattern)
      //   > 40 det  → hitam solid (his adekuat)
      {
        name: 'Kontraksi',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 2,
        data: kontraksi,
        barWidth: '80%',
        label: { show: true },
        z: 3,
      },
    ],
  }
})

// ── ECharts Option: DJJ (chart terpisah) ─────────────────────────────────
const chartDjjOption = computed(() => {
  const labels = timeLabels.value
  const total = labels.length
  const { djj } = buildSeriesData()

  return {
    backgroundColor: '#ffffff',
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#9ca3af' } },
      formatter: tooltipFormatter,
    },
    dataZoom: [{ type: 'inside', xAxisIndex: [0], start: 0, end: 100 }],
    grid: { left: 46, right: 18, top: 10, bottom: 30 },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#9ca3af', width: 1 } },
      axisLabel: {
        fontSize: 9,
        color: '#6b7280',
        interval: Math.max(0, Math.ceil(total / 24) - 1),
        rotate: total > 24 ? 45 : 0,
      },
      splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1 } },
    },
    yAxis: {
      type: 'value',
      min: 100,
      max: 180,
      interval: 20,
      name: 'DJJ (bpm)',
      nameLocation: 'middle',
      nameGap: 32,
      nameTextStyle: { fontSize: 9, color: '#374151', fontWeight: 600 },
      axisLabel: { fontSize: 10, color: '#374151', margin: 6 },
      axisLine: { show: true, lineStyle: { color: '#9ca3af', width: 1 } },
      splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1 } },
      // Garis referensi batas normal DJJ: 120 & 160 bpm
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#fca5a5', type: 'dashed', width: 1 },
        label: { fontSize: 9, color: '#ef4444' },
        data: [
          { yAxis: 120, name: '120' },
          { yAxis: 160, name: '160' },
        ],
      },
    },
    series: [
      {
        name: 'DJJ',
        type: 'line',
        data: djj,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: '#0d9488', width: 2 },
        itemStyle: { color: '#0d9488' },
        connectNulls: false,
      },
    ],
  }
})

// ── ECharts Option: Tensi Ibu ─────────────────────────────────────────────
// Band chart: area antara Diastolik (bawah) dan Sistolik (atas) diisi warna.
// Teknik: Diastolik di-stack dengan nilai transparan, "gap" (sistolik-diastolik)
// di-stack di atasnya dengan fill merah muda. Sistolik digambar terpisah (z tinggi).
const chartTensiOption = computed(() => {
  const labels = timeLabels.value
  const total = labels.length
  const { sistolik, diastolik, tensiGap } = buildSeriesData()

  return {
    backgroundColor: '#ffffff',
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: '#9ca3af' } },
      formatter: (params) => {
        const time = params[0]?.axisValue ?? ''
        let html = `<div style="font-weight:700;margin-bottom:4px;border-bottom:1px solid #e5e7eb;padding-bottom:3px">${time}</div>`
        params.forEach((p) => {
          if (p.seriesName === '_tensiGap') return
          const val = typeof p.value === 'object' ? p.value?.value : p.value
          if (val == null) return
          html += `${p.marker} ${p.seriesName}: <strong>${val} mmHg</strong><br/>`
        })
        return html
      },
    },
    dataZoom: [{ type: 'inside', xAxisIndex: [0], start: 0, end: 100 }],
    legend: {
      data: ['Sistolik', 'Diastolik'],
      top: 4,
      right: 20,
      itemWidth: 14,
      itemHeight: 8,
      textStyle: { fontSize: 10, color: '#374151' },
    },
    grid: { left: 46, right: 18, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#9ca3af', width: 1 } },
      axisLabel: {
        fontSize: 9,
        color: '#6b7280',
        interval: Math.max(0, Math.ceil(total / 24) - 1),
        rotate: total > 24 ? 45 : 0,
      },
      splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1 } },
    },
    yAxis: {
      type: 'value',
      min: 60, max: 180, interval: 20,
      name: 'Tensi (mmHg)',
      nameLocation: 'middle',
      nameGap: 32,
      nameTextStyle: { fontSize: 9, color: '#374151', fontWeight: 600 },
      axisLabel: { fontSize: 10, color: '#374151', margin: 6 },
      axisLine: { show: true, lineStyle: { color: '#9ca3af', width: 1 } },
      splitLine: { show: true, lineStyle: { color: '#e5e7eb', width: 1 } },
      markLine: {
        silent: true,
        symbol: 'none',
        lineStyle: { color: '#fca5a5', type: 'dashed', width: 1 },
        label: { fontSize: 9, color: '#ef4444' },
        data: [{ yAxis: 140, name: '140' }],
      },
    },
    series: [
      // Diastolik — bagian bawah band (stack, fill transparan)
      {
        name: 'Diastolik',
        type: 'line',
        data: diastolik,
        stack: 'tensi',
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: '#2563eb', width: 2 },
        itemStyle: { color: '#2563eb' },
        areaStyle: { color: 'rgba(255,255,255,0)' },
        connectNulls: false,
      },
      // Gap (Sistolik - Diastolik) — area band merah muda (stack di atas diastolik)
      {
        name: '_tensiGap',
        type: 'line',
        data: tensiGap,
        stack: 'tensi',
        symbol: 'none',
        lineStyle: { width: 0, color: 'transparent' },
        itemStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(220,38,38,0.15)' },
        connectNulls: false,
        silent: true,
        showSymbol: false,
        emphasis: { scale: false, lineStyle: { width: 0 } },
      },
      // Sistolik — garis atas, digambar terpisah (tidak di-stack)
      {
        name: 'Sistolik',
        type: 'line',
        data: sistolik,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { color: '#dc2626', width: 2 },
        itemStyle: { color: '#dc2626' },
        connectNulls: false,
        z: 10,
      },
    ],
  }
})

// ── Event Handlers ────────────────────────────────────────────────────────
const onJamMulaiChange = () => {
  if (observations.value.length > 0)
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Mengubah jam mulai akan menggeser posisi seluruh data grafik',
      life: 4000,
    })
}

// Konversi posisi pixel klik → indeks slot waktu menggunakan ECharts convertFromPixel.
// vue-echarts v8 mem-proxy convertFromPixel langsung di ref.value (bukan ref.value.chart).
// Koordinat ZRender event tersedia di zrX/zrY; offsetX/offsetY sebagai fallback.
const resolveTimeIndexFromPixel = (chartRef, x, y) => {
  const instance = chartRef.value
  if (!instance) return null

  for (let gridIdx = 0; gridIdx <= 1; gridIdx++) {
    try {
      const pt = instance.convertFromPixel({ gridIndex: gridIdx }, [x, y])
      if (!Array.isArray(pt)) continue
      const idx = Math.round(pt[0])
      if (idx >= 0 && idx < timeLabels.value.length) return idx
    } catch (_) {
      continue
    }
  }
  return null
}

const onChartPembukaanClick = (event) => {
  if (!form.value.jamMulai) return
  const x = event.zrX ?? event.offsetX
  const y = event.zrY ?? event.offsetY
  const idx = resolveTimeIndexFromPixel(chartPembukaanRef, x, y)
  openModal(idx)
}

const onChartDjjClick = (event) => {
  if (!form.value.jamMulai) return
  const x = event.zrX ?? event.offsetX
  const y = event.zrY ?? event.offsetY
  const idx = resolveTimeIndexFromPixel(chartDjjRef, x, y)
  openModal(idx)
}

const onChartTensiClick = (event) => {
  if (!form.value.jamMulai) return
  const x = event.zrX ?? event.offsetX
  const y = event.zrY ?? event.offsetY
  const idx = resolveTimeIndexFromPixel(chartTensiRef, x, y)
  openModal(idx)
}

const openModal = (timeIndex = null) => {
  editIndex.value = null
  modalForm.value = defaultModalForm()
  if (timeIndex !== null) modalForm.value.timeIndex = timeIndex
  showModal.value = true
}

const editObservasi = (idx) => {
  editIndex.value = idx
  modalForm.value = { ...observations.value[idx] }
  showModal.value = true
}

const hapusObservasi = (idx) => {
  observations.value.splice(idx, 1)
  toast.add({
    severity: 'info',
    summary: 'Dihapus',
    detail: 'Observasi berhasil dihapus',
    life: 2000,
  })
}

const simpanObservasi = () => {
  if (modalForm.value.timeIndex === null) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Pilih waktu observasi terlebih dahulu',
      life: 3000,
    })
    return
  }
  const timeIndex = modalForm.value.timeIndex
  const time = timeLabels.value[timeIndex]
  const newObs = { ...modalForm.value, time, timeIndex }

  if (editIndex.value !== null) {
    observations.value[editIndex.value] = newObs
    toast.add({
      severity: 'success',
      summary: 'Diperbarui',
      detail: `Observasi ${time} diperbarui`,
      life: 2000,
    })
  } else {
    const existIdx = observations.value.findIndex((o) => o.timeIndex === timeIndex)
    if (existIdx !== -1) {
      observations.value[existIdx] = newObs
    } else {
      observations.value.push(newObs)
      observations.value.sort((a, b) => a.timeIndex - b.timeIndex)
    }
    toast.add({
      severity: 'success',
      summary: 'Tersimpan',
      detail: `Observasi ${time} ditambahkan`,
      life: 2000,
    })
  }
  showModal.value = false
}

// ── Helpers ───────────────────────────────────────────────────────────────
const getDurasiLabel = (val) => durasiOptions.find((o) => o.value === val)?.label ?? '—'

const getDurasiClass = (val) => {
  const map = {
    kurang20: 'durasi-badge badge-lemah',
    '20_40': 'durasi-badge badge-sedang',
    lebih40: 'durasi-badge badge-kuat',
  }
  return map[val] ?? ''
}

// ── Save & Reset ──────────────────────────────────────────────────────────
const savePartograf = async () => {
  if (!form.value.jamMulai) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Masukkan jam mulai persalinan',
      life: 3000,
    })
    return
  }
  try {
    loading.value = true
    persist()
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Partograf berhasil disimpan',
      life: 3000,
    })
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyimpan partograf',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const resetData = () => {
  observations.value = []
  localStorage.removeItem(storageKey.value)
  toast.add({
    severity: 'info',
    summary: 'Reset',
    detail: 'Data observasi telah direset',
    life: 2000,
  })
}

// ── Data Dummy / Sample ───────────────────────────────────────────────────
const loadDummyData = () => {
  const JAM_MULAI = '08:00'
  const toTime = (idx) => {
    const [h, m] = JAM_MULAI.split(':').map(Number)
    const mins = h * 60 + m + idx * 30
    return `${String(Math.floor(mins / 60) % 24).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
  }

  Object.assign(form.value, {
    namaPasien: form.value.namaPasien || 'Siti Rahayu',
    noRegister: form.value.noRegister || 'REG-240001',
    gravida: 2,
    para: 1,
    abortus: 0,
    jamMulai: JAM_MULAI,
    totalSlot: 32,
  })

  observations.value = [
    { timeIndex: 0,  time: toTime(0),  pembukaan: 4,   penurunan: 5, djj: 140, kontraksi: 2, durasiKontraksi: 'kurang20', nadi: 80, suhu: 36.7, tensiSistolik: 110, tensiDiastolik: 70  },
    { timeIndex: 2,  time: toTime(2),  pembukaan: 4.5, penurunan: 5, djj: 144, kontraksi: 2, durasiKontraksi: '20_40',   nadi: 82, suhu: 36.8, tensiSistolik: 112, tensiDiastolik: 72  },
    { timeIndex: 4,  time: toTime(4),  pembukaan: 5.5, penurunan: 4, djj: 148, kontraksi: 3, durasiKontraksi: '20_40',   nadi: 84, suhu: 37.0, tensiSistolik: 115, tensiDiastolik: 74  },
    { timeIndex: 6,  time: toTime(6),  pembukaan: 6.5, penurunan: 4, djj: 150, kontraksi: 3, durasiKontraksi: '20_40',   nadi: 86, suhu: 37.1, tensiSistolik: 118, tensiDiastolik: 76  },
    { timeIndex: 8,  time: toTime(8),  pembukaan: 7,   penurunan: 3, djj: 145, kontraksi: 4, durasiKontraksi: 'lebih40', nadi: 88, suhu: 37.0, tensiSistolik: 122, tensiDiastolik: 78  },
    { timeIndex: 10, time: toTime(10), pembukaan: 8,   penurunan: 3, djj: 152, kontraksi: 4, durasiKontraksi: 'lebih40', nadi: 90, suhu: 37.2, tensiSistolik: 125, tensiDiastolik: 80  },
    { timeIndex: 12, time: toTime(12), pembukaan: 9,   penurunan: 2, djj: 158, kontraksi: 5, durasiKontraksi: 'lebih40', nadi: 92, suhu: 37.3, tensiSistolik: 130, tensiDiastolik: 82  },
    { timeIndex: 14, time: toTime(14), pembukaan: 10,  penurunan: 1, djj: 162, kontraksi: 5, durasiKontraksi: 'lebih40', nadi: 94, suhu: 37.4, tensiSistolik: 128, tensiDiastolik: 80  },
  ]
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  stripePattern.value = createStripePattern()

  const saved = localStorage.getItem(storageKey.value)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (data.form) Object.assign(form.value, data.form)
      if (data.observations) observations.value = data.observations
    } catch (_) {
      localStorage.removeItem(storageKey.value)
      loadDummyData()
    }
  } else {
    loadDummyData()
  }
})
</script>

<style scoped>
/* ═══ Page Header ══════════════════════════════════════════════════════════ */
.parto-page-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%);
  border-radius: 4px;
  padding: 0.9rem 1.4rem;
  color: #fff;
  flex-wrap: wrap;
}
.parto-page-header__icon {
  font-size: 2rem;
  opacity: 0.9;
  flex-shrink: 0;
}
.parto-page-header__title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.15rem;
}
.parto-page-header__sub {
  font-size: 0.76rem;
  opacity: 0.85;
}

/* ═══ Cards ═══════════════════════════════════════════════════════════════ */
.parto-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.parto-card-header {
  display: flex;
  align-items: center;
  padding: 0.65rem 1.1rem;
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
  color: #fff;
  font-weight: 700;
  font-size: 0.86rem;
  letter-spacing: 0.05em;
  flex-wrap: wrap;
  gap: 0.4rem;
}
/* Header teal — sesuai gambar referensi */
.parto-card-header--teal {
  background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
}
.parto-card-body {
  padding: 0.95rem 1.1rem;
}

/* ═══ Fields ══════════════════════════════════════════════════════════════ */
.field-label {
  display: block;
  font-size: 0.79rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.3rem;
}
.required {
  color: #dc2626;
}

/* ═══ Tombol Tambah di header card ═══════════════════════════════════════ */
.btn-obs-tambah {
  background: rgba(255, 255, 255, 0.18) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  color: #fff !important;
  font-weight: 600;
  font-size: 0.78rem !important;
}
.btn-obs-tambah:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.32) !important;
}

/* ═══ Inline Form Observasi ══════════════════════════════════════════════ */
.obs-inline-form {
  padding: 0.9rem 1.1rem;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}
.oif-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.65rem;
  letter-spacing: 0.02em;
}
.oif-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.73rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  white-space: nowrap;
}
:deep(.oif-input .p-inputnumber-input),
:deep(.oif-input input) {
  font-size: 0.8rem;
  padding: 0.3rem 0.4rem;
}
:deep(.oif-select .p-select-label) {
  font-size: 0.8rem;
  padding: 0.32rem 0.5rem;
}

/* Durasi horizontal */
.durasi-group-h {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.durasi-radio-h {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  transition: border-color 0.12s, background 0.12s;
  user-select: none;
  white-space: nowrap;
}
.durasi-radio-h:hover { border-color: #0d9488; background: #f0fdfa; }
.durasi-radio-h.selected { border-color: #0d9488; background: #f0fdfa; }
.durasi-radio-h.durasi-radio--kurang20.selected { border-color: #9ca3af; background: #f9fafb; }
.durasi-radio-h.durasi-radio--20_40.selected    { border-color: #f97316; background: #fff7ed; }
.durasi-radio-h.durasi-radio--lebih40.selected  { border-color: #374151; background: #f9fafb; }
.durasi-dot-h {
  width: 12px; height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
.durasi-radio--kurang20 .durasi-dot-h { background: #d1d5db; }
.durasi-radio--20_40    .durasi-dot-h { background: repeating-linear-gradient(-45deg,#fb923c 0,#fb923c 3px,#fff 3px,#fff 6px); }
.durasi-radio--lebih40  .durasi-dot-h { background: #1f2937; }
.sym-x {
  color: #111827;
  font-weight: 900;
  margin-right: 3px;
}
.sym-o {
  color: #dc2626;
  font-weight: 900;
  margin-right: 3px;
}

/* ═══ Timeline Info ═══════════════════════════════════════════════════════ */
.timeline-info {
  padding: 0.4rem 0.75rem;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 6px;
  font-size: 0.77rem;
  color: #134e4a;
}
.timeline-info--warn {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

/* ═══ Obs Count Badge ═════════════════════════════════════════════════════ */
.obs-count-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1px 9px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* ═══ Tabel Observasi ═════════════════════════════════════════════════════ */
.parto-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.81rem;
}
.parto-table thead tr {
  background: #f8fafc;
}
.parto-table th {
  padding: 0.5rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}
.parto-table td {
  padding: 0.45rem 0.8rem;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
  white-space: nowrap;
}
.parto-table tr:hover td {
  background: #f8fafc;
}
.empty-row {
  text-align: center;
  padding: 2rem !important;
  color: #9ca3af;
}

/* ═══ Durasi Badges ═══════════════════════════════════════════════════════ */
.durasi-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.69rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge-lemah {
  background: #f3f4f6;
  color: #6b7280;
}
.badge-sedang {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
}
.badge-kuat {
  background: #1f2937;
  color: #f3f4f6;
}

/* ═══ Durasi Radio Group (Modal) ══════════════════════════════════════════ */
.durasi-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.durasi-radio {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.48rem 0.85rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
  transition:
    border-color 0.15s,
    background 0.15s;
  user-select: none;
}
.durasi-radio:hover {
  border-color: #0d9488;
  background: #f0fdfa;
}
.durasi-radio.selected {
  border-color: #0d9488;
  background: #f0fdfa;
}
.durasi-radio--kurang20.selected {
  border-color: #9ca3af;
  background: #f9fafb;
}
.durasi-radio--20_40.selected {
  border-color: #f97316;
  background: #fff7ed;
}
.durasi-radio--lebih40.selected {
  border-color: #374151;
  background: #f9fafb;
}
.durasi-dot {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}
.durasi-radio--kurang20 .durasi-dot {
  background: #d1d5db;
}
.durasi-radio--20_40 .durasi-dot {
  background: repeating-linear-gradient(-45deg, #fb923c 0, #fb923c 3px, #fff 3px, #fff 6px);
}
.durasi-radio--lebih40 .durasi-dot {
  background: #1f2937;
}

/* ═══ Action Bar ══════════════════════════════════════════════════════════ */
.parto-action-bar {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75rem 1.1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.action-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.action-info {
  font-size: 0.78rem;
  color: #6b7280;
}

/* ═══ Tensi — tabel & modal ══════════════════════════════════════════════ */
.tensi-cell { white-space: nowrap; font-size: 0.83rem; }
.tensi-s { color: #dc2626; font-weight: 700; }
.tensi-d { color: #2563eb; font-weight: 700; }
.tensi-sub-label { display: flex; align-items: center; gap: 0.35rem; }
.tensi-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.tensi-badge--s { background: #dc2626; }
.tensi-badge--d { background: #2563eb; }

/* ═══ Buttons ════════════════════════════════════════════════════════════ */
.btn-add-obs {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.45) !important;
  color: #fff !important;
  font-weight: 600;
}
.btn-add-obs:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.32) !important;
}
.btn-simpan {
  background: linear-gradient(135deg, #0f766e, #0d9488) !important;
  border: none !important;
  font-weight: 600;
}

/* ═══ PrimeVue overrides ══════════════════════════════════════════════════ */
:deep(.p-inputtext),
:deep(.p-inputnumber-input) {
  font-size: 0.83rem;
}
:deep(.p-select),
:deep(.p-select .p-select-label) {
  font-size: 0.83rem;
}
:deep(.p-dialog-header) {
  background: linear-gradient(135deg, #0f766e, #0d9488);
  color: #fff;
  padding: 0.9rem 1.25rem;
}
:deep(.p-dialog-header .p-dialog-title) {
  color: #fff;
  font-weight: 700;
}
:deep(.p-dialog-header .p-dialog-header-icon) {
  color: rgba(255, 255, 255, 0.75);
}

/* ═══ Responsive ══════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .action-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .parto-table {
    font-size: 0.74rem;
  }
  .parto-table th,
  .parto-table td {
    padding: 0.38rem 0.5rem;
  }
}
</style>
