<template>
  <div class="content">
    <Toast />

    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="router.push('/sales/pos')" />
          <div>
            <div style="font-weight: 800; font-size: 15px">Laporan Laba Rugi</div>
            <div style="font-size: 11.5px; color: var(--p-text-muted-color)">Sales Langsung — Apotik · Tahunan (skala bulanan)</div>
          </div>
        </div>
      </template>
      <template #end>
        <div class="filter-bar">
          <div class="year-nav">
            <Button icon="pi pi-chevron-left" text rounded severity="secondary" size="small" @click="changeYear(-1)" />
            <span class="year-label">{{ year }}</span>
            <Button icon="pi pi-chevron-right" text rounded severity="secondary" size="small" :disabled="year >= maxYear" @click="changeYear(1)" />
          </div>
          <Button icon="pi pi-refresh" severity="secondary" text v-tooltip.bottom="'Muat ulang'" @click="fetchYear" />
          <Button icon="pi pi-wallet" label="Kas Lain" severity="secondary" text size="small" @click="router.push('/sales/transaksi-lain')" />
        </div>
      </template>
    </Toolbar>

    <!-- ══ Grafik tren bulanan ══ -->
    <div class="card elevation-0">
      <div class="card-body">
        <div class="chart-title">Tren Laba Rugi {{ year }} · per bulan</div>
        <div v-if="loading" class="state-box-sm">
          <i class="pi pi-spin pi-spinner"></i><span>Memuat data {{ year }}...</span>
        </div>
        <VChart v-else :option="chartOption" autoresize style="height: 320px" />
      </div>
    </div>

    <!-- ══ Rincian total setahun ══ -->
    <div class="card elevation-0 laba-rugi-summary-card">
      <div class="card-body">
        <div v-if="loading" class="state-box-sm">
          <i class="pi pi-spin pi-spinner"></i><span>Memuat rincian...</span>
        </div>
        <div v-else class="laba-rugi-detail">
          <div class="lr-period-select">
            <label>Tampilkan</label>
            <Select v-model="selectedPeriod" :options="periodOptions" optionLabel="label" optionValue="value" style="width: 200px" />
          </div>

          <div class="lr-hero">
            <div class="lr-hero-label">Laba Bersih · {{ selectedPeriodLabel }}</div>
            <div class="lr-hero-value" :class="{ 'lr-negative': displayedTotals.LABA_BERSIH < 0 }">{{ formatAngka(displayedTotals.LABA_BERSIH) }}</div>
          </div>

          <div class="lr-row">
            <span class="lr-label">Income Penjualan</span>
            <span class="lr-value">{{ formatAngka(displayedTotals.PENDAPATAN_PENJUALAN) }}</span>
          </div>
          <div class="lr-row lr-minus">
            <span class="lr-label">(-) Harga Pokok Penjualan (HPP)</span>
            <span class="lr-value">{{ formatAngka(displayedTotals.HPP) }}</span>
          </div>
          <div class="lr-row lr-subtotal">
            <span class="lr-label">= Laba Kotor</span>
            <span class="lr-value">{{ formatAngka(displayedTotals.LABA_KOTOR) }}</span>
          </div>

          <div class="lr-row lr-plus lr-expand" @click="showPemasukanDetail = !showPemasukanDetail">
            <span class="lr-label"><i class="pi" :class="showPemasukanDetail ? 'pi-chevron-down' : 'pi-chevron-right'"></i> (+) Pemasukan Lain</span>
            <span class="lr-value">{{ formatAngka(displayedTotalPemasukanLain) }}</span>
          </div>
          <div v-if="showPemasukanDetail" class="lr-breakdown">
            <div v-if="!displayedPemasukanGrouped.length" class="lr-breakdown-empty">Tidak ada pemasukan lain pada periode ini</div>
            <div v-for="grp in displayedPemasukanGrouped" :key="grp.TIPE" class="lr-breakdown-group">
              <div class="lr-breakdown-induk">
                <span>{{ grp.TIPE }}</span>
                <span>{{ formatAngka(grp.TOTAL) }}</span>
              </div>
              <div v-for="p in grp.DETAIL" :key="p.ID_KATEGORI" class="lr-breakdown-row lr-breakdown-row-child">
                <span>{{ p.NAMA }}</span>
                <span>{{ formatAngka(p.TOTAL) }}</span>
              </div>
            </div>
          </div>

          <div class="lr-row lr-minus lr-expand" @click="showPengeluaranDetail = !showPengeluaranDetail">
            <span class="lr-label"><i class="pi" :class="showPengeluaranDetail ? 'pi-chevron-down' : 'pi-chevron-right'"></i> (-) Pengeluaran Lain</span>
            <span class="lr-value">{{ formatAngkaNeg(displayedTotalPengeluaranLain) }}</span>
          </div>
          <div v-if="showPengeluaranDetail" class="lr-breakdown">
            <div v-if="!displayedPengeluaranGrouped.length" class="lr-breakdown-empty">Tidak ada pengeluaran lain pada periode ini</div>
            <div v-for="grp in displayedPengeluaranGrouped" :key="grp.TIPE" class="lr-breakdown-group">
              <div class="lr-breakdown-induk">
                <span>{{ grp.TIPE }}</span>
                <span>{{ formatAngkaNeg(grp.TOTAL) }}</span>
              </div>
              <div v-for="p in grp.DETAIL" :key="p.ID_KATEGORI" class="lr-breakdown-row lr-breakdown-row-child">
                <span>{{ p.NAMA }}</span>
                <span>{{ formatAngkaNeg(p.TOTAL) }}</span>
              </div>
            </div>
          </div>

          <div class="lr-row lr-final">
            <span class="lr-label">= Laba Bersih</span>
            <span class="lr-value" :class="{ 'lr-negative': displayedTotals.LABA_BERSIH < 0 }">{{ formatAngka(displayedTotals.LABA_BERSIH) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Tabel bulanan (kolom = bulan) ══ -->
    <div class="card elevation-0">
      <div class="card-body">
        <div class="chart-title">Rincian per Bulan {{ year }}</div>
        <div class="monthly-table-wrap">
          <table class="monthly-table">
            <thead>
              <tr>
                <th class="monthly-table-rowhead">Komponen</th>
                <th
                  v-for="(m, idx) in months"
                  :key="m.label"
                  class="monthly-table-month-th"
                  :class="{ active: selectedPeriod === idx }"
                  @click="selectedPeriod = idx"
                >
                  {{ m.label }}
                </th>
                <th class="monthly-table-total" :class="{ active: selectedPeriod === 'TAHUN' }" style="cursor: pointer" @click="selectedPeriod = 'TAHUN'">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="monthly-table-rowhead">Income</td>
                <td v-for="m in monthlyData" :key="m.label">{{ formatAngka(m.PENDAPATAN_PENJUALAN) }}</td>
                <td class="monthly-table-total">{{ formatAngka(yearTotals.PENDAPATAN_PENJUALAN) }}</td>
              </tr>
              <tr>
                <td class="monthly-table-rowhead">HPP</td>
                <td v-for="m in monthlyData" :key="m.label">{{ formatAngka(m.HPP) }}</td>
                <td class="monthly-table-total">{{ formatAngka(yearTotals.HPP) }}</td>
              </tr>
              <tr class="monthly-table-subtotal">
                <td class="monthly-table-rowhead">Laba Kotor</td>
                <td v-for="m in monthlyData" :key="m.label"><b>{{ formatAngka(m.LABA_KOTOR) }}</b></td>
                <td class="monthly-table-total"><b>{{ formatAngka(yearTotals.LABA_KOTOR) }}</b></td>
              </tr>
              <tr>
                <td class="monthly-table-rowhead monthly-table-expand" @click="showMonthlyPemasukanDetail = !showMonthlyPemasukanDetail">
                  <i class="pi" :class="showMonthlyPemasukanDetail ? 'pi-chevron-down' : 'pi-chevron-right'"></i> Pemasukan Lain
                </td>
                <td v-for="m in monthlyData" :key="m.label">{{ formatAngka(sumGroupTotal(m.PEMASUKAN_LAIN)) }}</td>
                <td class="monthly-table-total">{{ formatAngka(totalPemasukanLain) }}</td>
              </tr>
              <template v-if="showMonthlyPemasukanDetail">
                <template v-for="grp in pemasukanLainMonthlyBreakdown" :key="'pemasukan-' + grp.TIPE">
                  <tr class="monthly-table-detail-induk-row">
                    <td class="monthly-table-rowhead monthly-table-detail-induk">{{ grp.TIPE }}</td>
                    <td v-for="(v, idx) in grp.monthly" :key="idx">{{ formatAngka(v) }}</td>
                    <td class="monthly-table-total">{{ formatAngka(grp.total) }}</td>
                  </tr>
                  <tr v-for="cat in grp.categories" :key="cat.ID_KATEGORI" class="monthly-table-detail-row">
                    <td class="monthly-table-rowhead monthly-table-detail-child">{{ cat.NAMA }}</td>
                    <td v-for="(v, idx) in cat.monthly" :key="idx">{{ formatAngka(v) }}</td>
                    <td class="monthly-table-total">{{ formatAngka(cat.total) }}</td>
                  </tr>
                </template>
                <tr v-if="!pemasukanLainMonthlyBreakdown.length" class="monthly-table-detail-row">
                  <td class="monthly-table-rowhead monthly-table-detail-child" colspan="14">Tidak ada pemasukan lain pada tahun ini</td>
                </tr>
              </template>
              <tr>
                <td class="monthly-table-rowhead monthly-table-expand" @click="showMonthlyPengeluaranDetail = !showMonthlyPengeluaranDetail">
                  <i class="pi" :class="showMonthlyPengeluaranDetail ? 'pi-chevron-down' : 'pi-chevron-right'"></i> Pengeluaran Lain
                </td>
                <td v-for="m in monthlyData" :key="m.label">{{ formatAngkaNeg(sumGroupTotal(m.PENGELUARAN_LAIN)) }}</td>
                <td class="monthly-table-total">{{ formatAngkaNeg(totalPengeluaranLain) }}</td>
              </tr>
              <template v-if="showMonthlyPengeluaranDetail">
                <template v-for="grp in pengeluaranLainMonthlyBreakdown" :key="'pengeluaran-' + grp.TIPE">
                  <tr class="monthly-table-detail-induk-row">
                    <td class="monthly-table-rowhead monthly-table-detail-induk">{{ grp.TIPE }}</td>
                    <td v-for="(v, idx) in grp.monthly" :key="idx">{{ formatAngkaNeg(v) }}</td>
                    <td class="monthly-table-total">{{ formatAngkaNeg(grp.total) }}</td>
                  </tr>
                  <tr v-for="cat in grp.categories" :key="cat.ID_KATEGORI" class="monthly-table-detail-row">
                    <td class="monthly-table-rowhead monthly-table-detail-child">{{ cat.NAMA }}</td>
                    <td v-for="(v, idx) in cat.monthly" :key="idx">{{ formatAngkaNeg(v) }}</td>
                    <td class="monthly-table-total">{{ formatAngkaNeg(cat.total) }}</td>
                  </tr>
                </template>
                <tr v-if="!pengeluaranLainMonthlyBreakdown.length" class="monthly-table-detail-row">
                  <td class="monthly-table-rowhead monthly-table-detail-child" colspan="14">Tidak ada pengeluaran lain pada tahun ini</td>
                </tr>
              </template>
              <tr class="monthly-table-final">
                <td class="monthly-table-rowhead">Laba Bersih</td>
                <td v-for="m in monthlyData" :key="m.label" :class="{ 'text-danger': m.LABA_BERSIH < 0 }">
                  <b>{{ formatAngka(m.LABA_BERSIH) }}</b>
                </td>
                <td class="monthly-table-total" :class="{ 'text-danger': yearTotals.LABA_BERSIH < 0 }">
                  <b>{{ formatAngka(yearTotals.LABA_BERSIH) }}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import Toolbar from 'primevue/toolbar'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { formatAngka, formatAngkaNeg, formatCompact } from './utils/format'
import { formatDateOnlyForAPI } from './utils/date'

use([CanvasRenderer, BarChart, TooltipComponent, LegendComponent, GridComponent])

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi } = storeToRefs(authStore)
const toast = useToast()

const apiUrl = computed(() => `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`)

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/* ══════════ Tahun aktif ══════════ */
const maxYear = new Date().getFullYear()
const year = ref(maxYear)
const changeYear = (delta) => {
  if (year.value + delta > maxYear) return
  year.value += delta
  fetchYear()
}

const months = computed(() =>
  monthNames.map((label, idx) => ({
    label,
    start: new Date(year.value, idx, 1),
    end: new Date(year.value, idx + 1, 0),
  })),
)

/* ══════════ Fetch 12 bulan sekaligus ══════════ */
// laba_rugi cuma ngasih total 1 rentang tanggal (nggak ada groupBy) — jadi laporan tahunan
// per-bulan ini manggil endpoint itu 12x paralel, satu per bulan.
const emptyLabaRugi = () => ({ PENDAPATAN_PENJUALAN: 0, HPP: 0, LABA_KOTOR: 0, PEMASUKAN_LAIN: [], PENGELUARAN_LAIN: [], LABA_BERSIH: 0 })
const loading = ref(true)
const monthlyData = ref(months.value.map((m) => ({ ...emptyLabaRugi(), label: m.label })))

const fetchYear = async () => {
  loading.value = true
  try {
    const results = await Promise.all(
      months.value.map((m) =>
        axios.get(`${apiUrl.value}/laba_rugi`, {
          params: {
            clientId: id_client.value,
            lokasiId: id_lokasi.value,
            dateStart: formatDateOnlyForAPI(m.start),
            dateEnd: formatDateOnlyForAPI(m.end),
          },
        }),
      ),
    )
    monthlyData.value = results.map((res, idx) => ({ ...emptyLabaRugi(), ...(res.data?.response || {}), label: months.value[idx].label }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat laporan laba rugi', life: 4000 })
  } finally {
    loading.value = false
  }
}

/* ══════════ Agregasi setahun ══════════ */
const sumGroupTotal = (groups) => (groups || []).reduce((s, g) => s + (Number(g.TOTAL) || 0), 0)

const yearTotals = computed(() => {
  const t = { PENDAPATAN_PENJUALAN: 0, HPP: 0, LABA_KOTOR: 0, LABA_BERSIH: 0 }
  for (const m of monthlyData.value) {
    t.PENDAPATAN_PENJUALAN += Number(m.PENDAPATAN_PENJUALAN) || 0
    t.HPP += Number(m.HPP) || 0
    t.LABA_KOTOR += Number(m.LABA_KOTOR) || 0
    t.LABA_BERSIH += Number(m.LABA_BERSIH) || 0
  }
  return t
})

// Gabungin breakdown per induk (TIPE) dari 12 bulan jadi satu rekap setahun — kategori yang
// sama (ID_KATEGORI) di bulan berbeda dijumlah, bukan ditampilkan 12x baris terpisah.
const mergeYearGroups = (field) => {
  const tipeMap = new Map()
  for (const m of monthlyData.value) {
    for (const grp of m[field] || []) {
      if (!tipeMap.has(grp.TIPE)) tipeMap.set(grp.TIPE, { TIPE: grp.TIPE, TOTAL: 0, detailMap: new Map() })
      const tipeEntry = tipeMap.get(grp.TIPE)
      tipeEntry.TOTAL += Number(grp.TOTAL) || 0
      for (const d of grp.DETAIL || []) {
        if (!tipeEntry.detailMap.has(d.ID_KATEGORI)) tipeEntry.detailMap.set(d.ID_KATEGORI, { ID_KATEGORI: d.ID_KATEGORI, NAMA: d.NAMA, TOTAL: 0 })
        tipeEntry.detailMap.get(d.ID_KATEGORI).TOTAL += Number(d.TOTAL) || 0
      }
    }
  }
  return Array.from(tipeMap.values())
    .map((t) => ({ TIPE: t.TIPE, TOTAL: t.TOTAL, DETAIL: Array.from(t.detailMap.values()) }))
    .sort((a, b) => a.TIPE.localeCompare(b.TIPE))
}

const pemasukanLainGrouped = computed(() => mergeYearGroups('PEMASUKAN_LAIN'))
const pengeluaranLainGrouped = computed(() => mergeYearGroups('PENGELUARAN_LAIN'))
const totalPemasukanLain = computed(() => sumGroupTotal(pemasukanLainGrouped.value))
const totalPengeluaranLain = computed(() => sumGroupTotal(pengeluaranLainGrouped.value))

// Sama kayak mergeYearGroups, tapi tetap menyimpan nilai per bulan (bukan cuma total
// setahun) — dipakai buat baris detail di tabel "Rincian per Bulan" biar breakdown
// kategori tetap tampil per kolom bulan, bukan cuma satu angka gabungan.
const monthlyBreakdown = (field) => {
  const tipeMap = new Map()
  monthlyData.value.forEach((m, monthIdx) => {
    for (const grp of m[field] || []) {
      if (!tipeMap.has(grp.TIPE)) tipeMap.set(grp.TIPE, { TIPE: grp.TIPE, monthly: Array(12).fill(0), catMap: new Map() })
      const tipeEntry = tipeMap.get(grp.TIPE)
      tipeEntry.monthly[monthIdx] += Number(grp.TOTAL) || 0
      for (const d of grp.DETAIL || []) {
        if (!tipeEntry.catMap.has(d.ID_KATEGORI)) {
          tipeEntry.catMap.set(d.ID_KATEGORI, { ID_KATEGORI: d.ID_KATEGORI, NAMA: d.NAMA, monthly: Array(12).fill(0) })
        }
        tipeEntry.catMap.get(d.ID_KATEGORI).monthly[monthIdx] += Number(d.TOTAL) || 0
      }
    }
  })
  return Array.from(tipeMap.values())
    .map((t) => ({
      TIPE: t.TIPE,
      monthly: t.monthly,
      total: t.monthly.reduce((s, v) => s + v, 0),
      categories: Array.from(t.catMap.values())
        .map((c) => ({ ...c, total: c.monthly.reduce((s, v) => s + v, 0) }))
        .sort((a, b) => a.NAMA.localeCompare(b.NAMA)),
    }))
    .sort((a, b) => a.TIPE.localeCompare(b.TIPE))
}

const showMonthlyPemasukanDetail = ref(false)
const showMonthlyPengeluaranDetail = ref(false)
const pemasukanLainMonthlyBreakdown = computed(() => monthlyBreakdown('PEMASUKAN_LAIN'))
const pengeluaranLainMonthlyBreakdown = computed(() => monthlyBreakdown('PENGELUARAN_LAIN'))

const showPemasukanDetail = ref(false)
const showPengeluaranDetail = ref(false)

// Card "Rincian" bisa nunjukin total setahun ATAU 1 bulan spesifik — datanya udah ke-fetch
// semua sekaligus di monthlyData, jadi tinggal pilih sumbernya tanpa perlu request baru.
const selectedPeriod = ref('TAHUN')
const periodOptions = computed(() => [
  { label: `Total Tahun ${year.value}`, value: 'TAHUN' },
  ...months.value.map((m, idx) => ({ label: m.label, value: idx })),
])
const selectedPeriodLabel = computed(() =>
  selectedPeriod.value === 'TAHUN' ? `Total Tahun ${year.value}` : `${monthNames[selectedPeriod.value]} ${year.value}`,
)
// Balik ke "Total Tahun" tiap ganti tahun/reload, biar nggak nyangkut nunjuk index bulan
// dari tahun sebelumnya yang datanya udah beda.
watch(year, () => {
  selectedPeriod.value = 'TAHUN'
})

const displayedTotals = computed(() => (selectedPeriod.value === 'TAHUN' ? yearTotals.value : monthlyData.value[selectedPeriod.value]))
const displayedPemasukanGrouped = computed(() =>
  selectedPeriod.value === 'TAHUN' ? pemasukanLainGrouped.value : monthlyData.value[selectedPeriod.value].PEMASUKAN_LAIN || [],
)
const displayedPengeluaranGrouped = computed(() =>
  selectedPeriod.value === 'TAHUN' ? pengeluaranLainGrouped.value : monthlyData.value[selectedPeriod.value].PENGELUARAN_LAIN || [],
)
const displayedTotalPemasukanLain = computed(() =>
  selectedPeriod.value === 'TAHUN' ? totalPemasukanLain.value : sumGroupTotal(displayedPemasukanGrouped.value),
)
const displayedTotalPengeluaranLain = computed(() =>
  selectedPeriod.value === 'TAHUN' ? totalPengeluaranLain.value : sumGroupTotal(displayedPengeluaranGrouped.value),
)

/* ══════════ Chart ══════════ */
const chartOption = computed(() => {
  const data = monthlyData.value
  return {
    color: ['#2a78d6', '#f2994a', '#1baf7a'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (v) => formatAngka(v) },
    legend: { data: ['Income', 'Laba Kotor', 'Laba Bersih'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 55, right: 16, top: 20, bottom: 40, containLabel: false },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisLabel: { fontSize: 10, color: '#898781' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: '#898781', formatter: (v) => formatCompact(v) },
      splitLine: { lineStyle: { color: '#e1e0d9' } },
    },
    series: [
      { name: 'Income', type: 'bar', data: data.map((d) => Number(d.PENDAPATAN_PENJUALAN) || 0), barMaxWidth: 20 },
      { name: 'Laba Kotor', type: 'bar', data: data.map((d) => Number(d.LABA_KOTOR) || 0), barMaxWidth: 20 },
      { name: 'Laba Bersih', type: 'bar', data: data.map((d) => Number(d.LABA_BERSIH) || 0), barMaxWidth: 20 },
    ],
  }
})

onMounted(fetchYear)
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.year-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.year-label {
  font-size: 15px;
  font-weight: 800;
  min-width: 48px;
  text-align: center;
}

.chart-title {
  font-size: 12px;
  color: var(--p-text-muted-color);
  margin-bottom: 8px;
}

.state-box-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 10px;
  color: var(--p-text-muted-color);
  font-size: 13px;
}

/* ── Rincian setahun ── */
.laba-rugi-summary-card .card-body {
  display: flex;
  justify-content: center;
}

.laba-rugi-detail {
  width: 100%;
  max-width: 520px;
}

.lr-period-select {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.lr-period-select label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--p-text-muted-color);
}

.lr-hero {
  text-align: center;
  padding-bottom: 18px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
}

.lr-hero-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  margin-bottom: 6px;
}

.lr-hero-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--p-primary-color);
}

.lr-hero-value.lr-negative {
  color: var(--p-red-600, #dc2626);
}

.lr-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px;
  font-size: 14px;
}

.lr-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lr-expand {
  cursor: pointer;
  user-select: none;
}

.lr-expand .lr-label i {
  font-size: 10px;
  color: var(--p-text-muted-color);
}

.lr-minus .lr-value {
  color: var(--p-red-600, #dc2626);
}

.lr-plus .lr-value {
  color: var(--p-green-600, #16a34a);
}

.lr-subtotal {
  font-weight: 700;
  border-top: 1px solid var(--p-content-border-color, #eee);
  border-bottom: 1px solid var(--p-content-border-color, #eee);
  margin: 4px 0;
}

.lr-final {
  font-weight: 800;
  font-size: 17px;
  color: var(--p-primary-color);
  border-top: 2px solid var(--p-primary-color);
  margin-top: 8px;
  padding-top: 14px;
}

.lr-final .lr-negative {
  color: var(--p-red-600, #dc2626);
}

.lr-breakdown {
  padding: 4px 4px 4px 22px;
  margin-bottom: 4px;
}

.lr-breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--p-text-muted-color);
  padding: 4px 0;
}

.lr-breakdown-empty {
  font-size: 12px;
  color: var(--p-text-muted-color);
  padding: 4px 0;
  font-style: italic;
}

.lr-breakdown-group:not(:last-child) {
  margin-bottom: 6px;
}

.lr-breakdown-induk {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
  font-weight: 700;
  padding: 4px 0;
}

.lr-breakdown-row-child {
  padding-left: 14px;
}

/* ── Tabel bulanan ── */
.monthly-table-wrap {
  overflow-x: auto;
}

.monthly-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
  white-space: nowrap;
}

.monthly-table th,
.monthly-table td {
  padding: 7px 10px;
  text-align: right;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
}

.monthly-table th {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--p-text-muted-color);
  font-weight: 700;
}

.monthly-table-rowhead {
  text-align: left;
  font-weight: 600;
  position: sticky;
  left: 0;
  background: var(--p-surface-0, #fff);
}

.monthly-table-total {
  font-weight: 700;
  background: var(--p-surface-50, #f8fafc);
}

.monthly-table-month-th {
  cursor: pointer;
  border-radius: 6px 6px 0 0;
}

.monthly-table-month-th:hover {
  background: var(--p-surface-50, #f8fafc);
  color: var(--p-primary-color);
}

.monthly-table-month-th.active,
.monthly-table-total.active {
  background: var(--p-primary-50, #f2f8f6);
  color: var(--p-primary-color);
}

.monthly-table-subtotal td {
  border-top: 1px solid var(--p-content-border-color, #eee);
}

.monthly-table-final td {
  border-top: 2px solid var(--p-primary-color);
  font-weight: 800;
}

.monthly-table-expand {
  cursor: pointer;
  user-select: none;
}

.monthly-table-expand i {
  font-size: 10px;
  color: var(--p-text-muted-color);
  margin-right: 2px;
}

.monthly-table-detail-induk {
  font-weight: 700;
  padding-left: 22px;
}

.monthly-table-detail-child {
  font-weight: 400;
  color: var(--p-text-muted-color);
  padding-left: 36px;
}

.monthly-table-detail-induk-row td,
.monthly-table-detail-row td {
  font-size: 11.5px;
  background: var(--p-surface-50, #f8fafc);
}

.text-danger {
  color: var(--p-red-500, #ef4444);
}
</style>
