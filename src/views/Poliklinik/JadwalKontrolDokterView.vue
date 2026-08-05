<template>
  <div class="content">
    <!-- Header -->
    <div class="card elevation-0 mb-3">
      <div class="card-header d-flex align-items-center justify-content-between">
        <h4 class="m-0"><i class="pi pi-calendar mr-2"></i> Jadwal Kontrol Ulang Dokter</h4>
      </div>
    </div>

    <!-- Filter -->
    <div class="card elevation-0 mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Dokter</label>

            <!-- Jika login sebagai DOKTER: tampilkan readonly -->
            <div v-if="isDokter" class="dokter-readonly">
              <i class="pi pi-user mr-1" style="color: #2563eb"></i>
              <strong>{{ namaDokterLogin }}</strong>
              <span class="dokter-readonly-badge">Akun Dokter</span>
            </div>

            <!-- Selain DOKTER: dropdown bebas pilih -->
            <Select
              v-else
              v-model="selectedDokter"
              :options="listDokter"
              optionLabel="NAMADOKTER"
              optionValue="KDDOKTER"
              placeholder="— Semua Dokter —"
              showClear
              filter
              class="w-100"
              :loading="loadingDokter"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Bulan / Tahun</label>
            <DatePicker
              v-model="selectedBulan"
              view="month"
              dateFormat="MM yy"
              showIcon
              iconDisplay="input"
              class="w-100"
            />
          </div>
          <div class="col-md-2">
            <Button
              label="Tampilkan"
              icon="pi pi-search"
              severity="primary"
              :loading="loadingKalender"
              @click="fetchKalender"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Keterangan -->
    <div class="card elevation-0 mb-3">
      <div class="card-body py-2 px-3">
        <div class="legend-wrap">
          <span class="legend-title"><i class="pi pi-info-circle mr-1"></i> Cara Baca Data:</span>
          <div class="legend-item">
            <span class="legend-badge legend-badge--example">3/4</span>
            <span class="legend-desc">
              <strong>3</strong> = Pasien sudah ambil nomor antrian &nbsp;/&nbsp;
              <strong>4</strong> = Total pasien punya surat kontrol di hari itu
            </span>
          </div>
          <div class="legend-bar-demo">
            <div class="legend-bar-track">
              <div class="legend-bar-fill" style="width: 75%"></div>
            </div>
            <span class="legend-desc">Bar menunjukkan persentase yang sudah ambil antrian</span>
          </div>
          <div class="legend-colors">
            <span class="legend-dot legend-dot--past"></span><span class="legend-desc mr-3">Sudah lewat</span>
            <span class="legend-dot legend-dot--today"></span><span class="legend-desc mr-3">Hari ini</span>
            <span class="legend-dot legend-dot--future"></span><span class="legend-desc">Akan datang</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigasi Bulan -->
    <div class="card elevation-0">
      <div class="card-body p-0">
        <!-- Nav bar -->
        <div class="cal-nav">
          <Button icon="pi pi-chevron-left" text rounded @click="prevMonth" />
          <span class="cal-nav-title">{{ namabulanTahun }}</span>
          <Button icon="pi pi-chevron-right" text rounded @click="nextMonth" />
          <span class="ms-3 badge-total" v-if="totalPasien > 0">
            Total: {{ totalPasien }} pasien
          </span>
        </div>

        <!-- Loading kalender -->
        <div v-if="loadingKalender" class="cal-loading">
          <i class="pi pi-spin pi-spinner"></i> Memuat jadwal...
        </div>

        <!-- Kalender Grid -->
        <div v-else class="cal-grid">
          <!-- Header hari -->
          <div v-for="h in hariHeader" :key="h" class="cal-header-cell">{{ h }}</div>

          <!-- Sel kosong sebelum hari pertama -->
          <div v-for="n in firstDayOffset" :key="'e' + n" class="cal-cell cal-cell--empty"></div>

          <!-- Sel hari -->
          <div
            v-for="day in daysInMonth"
            :key="day"
            class="cal-cell"
            :class="{
              'cal-cell--today': isToday(day),
              'cal-cell--past': !isToday(day) && isPast(day) && getJumlah(day) > 0,
              'cal-cell--future': isFuture(day) && getJumlah(day) > 0,
            }"
          >
            <span class="cal-day-num">{{ day }}</span>

            <!-- Label status di pojok kanan atas -->
            <span v-if="getJumlah(day) > 0 && !isToday(day)" class="cal-status-label">
              {{ isPast(day) ? 'Selesai' : 'Akan Datang' }}
            </span>
            <span
              v-if="getJumlah(day) > 0 && isToday(day)"
              class="cal-status-label cal-status-label--today"
            >
              Hari Ini
            </span>

            <div v-if="getJumlah(day) > 0" class="cal-badge-wrap">
              <div
                v-for="(dokRow, di) in getDokterOnDay(day)"
                :key="di"
                class="cal-badge-block"
                :class="{
                  'cal-badge-block--past': !isToday(day) && isPast(day),
                  'cal-badge-block--future': isFuture(day),
                  'cal-badge-block--today': isToday(day),
                }"
                :title="dokRow.NAMADOKTER"
              >
                <div class="cal-badge-top">
                  <span class="cal-badge-dokter">{{ truncate(dokRow.NAMADOKTER) }}</span>
                  <span class="cal-badge-ratio">
                    {{ dokRow.JUMLAH_SUDAH_ANTRIAN }}/{{ dokRow.JUMLAH_PASIEN }}
                  </span>
                </div>
                <div class="cal-progress-bar">
                  <div
                    class="cal-progress-fill"
                    :style="{
                      width: progressPct(dokRow) + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const isDokter = authStore.group_user === 'DOKTER'
const kdDokterMe = authStore.kd_dokter || null

// Nama dokter yang login (diambil setelah listDokter loaded)
const namaDokterLogin = computed(() => {
  if (!isDokter || !kdDokterMe) return authStore.user_name || '—'
  const found = listDokter.value.find((d) => d.KDDOKTER === kdDokterMe)
  return found ? found.NAMADOKTER : authStore.user_name || kdDokterMe
})

// ── State filter ───────────────────────────────────────────────
const selectedDokter = ref(isDokter ? kdDokterMe : null)
const selectedBulan = ref(new Date())
const listDokter = ref([])
const loadingDokter = ref(false)

// ── State kalender ─────────────────────────────────────────────
const loadingKalender = ref(false)
const kalenderData = ref([]) // array { TANGGAL_KONTROL, DOKTER, NAMADOKTER, JUMLAH_PASIEN, JUMLAH_SUDAH_ANTRIAN }
const viewDate = ref(new Date())

// ── Kalender helpers ───────────────────────────────────────────
const hariHeader = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const BULAN_NAMA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const namabulanTahun = computed(() => {
  const d = viewDate.value
  return `${BULAN_NAMA[d.getMonth()]} ${d.getFullYear()}`
})

const daysInMonth = computed(() => {
  const d = viewDate.value
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
})

const firstDayOffset = computed(() => {
  const d = viewDate.value
  return new Date(d.getFullYear(), d.getMonth(), 1).getDay()
})

const totalPasien = computed(() =>
  kalenderData.value.reduce((s, r) => s + parseInt(r.JUMLAH_PASIEN || 0), 0),
)

const isToday = (day) => {
  const t = new Date()
  const d = viewDate.value
  return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth() && t.getDate() === day
}

const isPast = (day) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = viewDate.value
  const cellDate = new Date(d.getFullYear(), d.getMonth(), day)
  return cellDate < today
}

const isFuture = (day) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = viewDate.value
  const cellDate = new Date(d.getFullYear(), d.getMonth(), day)
  return cellDate > today
}

const toDateStr = (day) => {
  const d = viewDate.value
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dd}`
}

const getDokterOnDay = (day) => {
  const key = toDateStr(day)
  return kalenderData.value.filter((r) => r.TANGGAL_KONTROL === key)
}

const getJumlah = (day) => {
  return getDokterOnDay(day).reduce((s, r) => s + parseInt(r.JUMLAH_PASIEN || 0), 0)
}

const truncate = (str, len = 14) => (str && str.length > len ? str.slice(0, len) + '…' : str || '')

const progressPct = (row) => {
  const total = parseInt(row.JUMLAH_PASIEN || 0)
  const done = parseInt(row.JUMLAH_SUDAH_ANTRIAN || 0)
  if (total === 0) return 0
  return Math.min(100, Math.round((done / total) * 100))
}

// ── Navigasi bulan ─────────────────────────────────────────────
const prevMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
  selectedBulan.value = d
  fetchKalender()
}

const nextMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
  selectedBulan.value = d
  fetchKalender()
}

// ── API calls ──────────────────────────────────────────────────
const fetchListDokter = async () => {
  loadingDokter.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.get(
      `${url}/index.php/api/jadwal_kontrol/get_list_dokter/${id_client.value}`,
    )

    if (res.data?.code === 200) {
      listDokter.value = res.data.data
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat daftar dokter.',
      life: 4000,
    })
  } finally {
    loadingDokter.value = false
  }
}

const fetchKalender = async () => {
  loadingKalender.value = true
  kalenderData.value = []

  const d = selectedBulan.value ? new Date(selectedBulan.value) : new Date(viewDate.value)
  viewDate.value = d

  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/jadwal_kontrol/get_jadwal_per_bulan`, {
      id_client: id_client.value,
      bulan: d.getMonth() + 1,
      tahun: d.getFullYear(),
      kd_dokter: selectedDokter.value || '',
    })

    console.log('fetchListDokter res:', JSON.stringify(res.data))
    if (res.data?.code === 200) {
      kalenderData.value = res.data.data
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res.data?.message || 'Data tidak ditemukan.',
        life: 3500,
      })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat jadwal.', life: 4000 })
  } finally {
    loadingKalender.value = false
  }
}

onMounted(() => {
  fetchListDokter()
  fetchKalender()
})
</script>

<style scoped>
/* ── Legend ────────────────────────────────────────────── */
.legend-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
  font-size: 0.82rem;
  color: #334155;
}
.legend-title {
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
}
.legend-badge--example {
  display: inline-block;
  background: #15803d;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 6px;
  white-space: nowrap;
}
.legend-desc {
  color: #475569;
  font-size: 0.8rem;
}
.legend-bar-demo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.legend-bar-track {
  width: 64px;
  height: 5px;
  background: #cbd5e1;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}
.legend-bar-fill {
  height: 100%;
  background: #15803d;
  border-radius: 3px;
}
.legend-colors {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}
.legend-dot--past   { background: #6b7280; }
.legend-dot--today  { background: #b45309; }
.legend-dot--future { background: #15803d; }
.mr-3 { margin-right: 10px; }

/* ── Dokter readonly ───────────────────────────────────── */
.dokter-readonly {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.45rem 0.75rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 0.88rem;
  color: #1e40af;
  min-height: 38px;
}
.dokter-readonly-badge {
  margin-left: auto;
  font-size: 0.65rem;
  font-weight: 600;
  background: #2563eb;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.03em;
}

/* ── Navigasi ──────────────────────────────────────────── */
.cal-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.cal-nav-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  min-width: 180px;
  text-align: center;
}
.badge-total {
  font-size: 0.78rem;
  background: #0f4c75;
  color: #fff;
  padding: 3px 10px;
  border-radius: 20px;
}

/* ── Grid kalender ─────────────────────────────────────── */
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cal-header-cell {
  padding: 0.5rem 0.25rem;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cal-cell {
  min-height: 90px;
  border-right: 1px solid #e9edf2;
  border-bottom: 1px solid #e9edf2;
  padding: 6px 7px;
  cursor: default;
  transition: background 0.12s;
  position: relative;
}
.cal-cell--empty {
  background: #fafafa;
  cursor: default;
}
/* Sudah lewat — abu-abu kehijauan redup */
.cal-cell--past {
  background: #f1f5f0;
}
.cal-cell--past:hover {
  background: #e2eade;
}
.cal-cell--past .cal-day-num {
  color: #6b7280;
}

/* Akan datang — biru terang */
.cal-cell--future {
  background: #eff6ff;
}
.cal-cell--future:hover {
  background: #dbeafe;
}

/* Hari ini — kuning lembut */
.cal-cell--today {
  background: #fefce8;
}
.cal-cell--today:hover {
  background: #fef08a44;
}
.cal-cell--today .cal-day-num {
  background: #b45309;
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.cal-day-num {
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  margin-bottom: 4px;
}

/* ── Label status (pojok kanan atas) ───────────────────── */
.cal-status-label {
  position: absolute;
  top: 4px;
  right: 5px;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  background: #16a34a22;
  color: #15803d;
  letter-spacing: 0.03em;
}
.cal-cell--past .cal-status-label {
  background: #6b728022;
  color: #6b7280;
}
.cal-status-label--today {
  background: #ca8a0422;
  color: #b45309;
}

/* ── Badge pasien ──────────────────────────────────────── */
.cal-badge-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.cal-badge-block {
  border-radius: 6px;
  padding: 3px 6px 4px;
  background: #1d4ed8;
  color: #fff;
  max-width: 100%;
  overflow: hidden;
}
.cal-badge-block--past {
  background: #6b7280;
}
.cal-badge-block--future {
  background: #15803d;
}
.cal-badge-block--today {
  background: #b45309;
}

.cal-badge-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  margin-bottom: 3px;
}
.cal-badge-dokter {
  font-size: 0.62rem;
  font-weight: 500;
  opacity: 0.92;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.cal-badge-ratio {
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Progress bar */
.cal-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}
.cal-progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* ── Loading ───────────────────────────────────────────── */
.cal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 4rem;
  color: #64748b;
  font-size: 0.9rem;
}
</style>
