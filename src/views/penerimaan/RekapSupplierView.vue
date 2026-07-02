<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <div class="pm-hero-icon"><i class="pi pi-chart-bar"></i></div>
        <div>
          <h4 class="pm-hero-title">Rekap Pembelian per Supplier</h4>
          <p class="pm-hero-sub">Ringkasan nilai penerimaan barang per supplier × bulan</p>
        </div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pm-filter-bar">
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-calendar"></i>Tahun</span>
        <input
          v-model.number="filters.tahun"
          type="number"
          min="2000"
          :max="currentYear"
          class="tahun-input"
          :disabled="loading"
          @keyup.enter="fetchRekap"
        />
      </div>
      <div class="pm-filter-actions ms-auto">
        <Button icon="pi pi-search" label="Tampilkan" class="round-button2 btn-primary-pm" :loading="loading" @click="fetchRekap" />
        <Button icon="pi pi-refresh" severity="secondary" outlined class="round-button2" v-tooltip.top="'Reset'" @click="resetFilter" :disabled="loading" />
        <Button v-if="data.length" icon="pi pi-file-excel" label="Export Excel" severity="success" outlined class="round-button2" @click="exportExcel" />
      </div>
    </div>

    <!-- TABLE -->
    <div class="rekap-wrap">
      <div v-if="loading" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
        <p style="margin-top:10px;font-size:13px">Memuat rekap...</p>
      </div>
      <div v-else-if="!data.length && fetched" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
        <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">Tidak ada data untuk tahun {{ filters.tahun }}</p>
      </div>
      <div v-else-if="data.length" style="overflow-x:auto">
        <table class="rekap-table">
          <thead>
            <tr>
              <th style="width:32px;text-align:center">#</th>
              <th style="min-width:140px;max-width:160px">Supplier</th>
              <th v-for="bln in BULAN" :key="bln.key" class="th-bulan">{{ bln.label }}</th>
              <th class="th-total">Total</th>
              <th class="th-trx">Trx</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in data" :key="row.id_supplier" class="rekap-row">
              <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
              <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                <div style="font-size:12px;font-weight:600;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.nama_supplier">{{ row.nama_supplier }}</div>
              </td>
              <td
                v-for="bln in BULAN"
                :key="bln.key"
                class="td-bulan"
                :class="row.per_bulan[bln.key] > 0 ? 'td-aktif' : 'td-kosong'"
                @click="row.per_bulan[bln.key] > 0 && bukaDetail(row, bln)"
              >
                <div class="bulan-cell">
                  <span v-if="row.per_bulan[bln.key] > 0">{{ compact(row.per_bulan[bln.key]) }}</span>
                  <span v-else class="zero">0</span>
                  <span v-if="getTrend(row.per_bulan, bln.key) === 'up'" class="trend-up">▲</span>
                  <span v-else-if="getTrend(row.per_bulan, bln.key) === 'down'" class="trend-down">▼</span>
                </div>
              </td>
              <td class="td-total">{{ compact(row.total) }}</td>
              <td class="td-trx">{{ row.jumlah_transaksi }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="rekap-grand">
              <td colspan="2" style="font-weight:700;font-size:11px;letter-spacing:.4px">GRAND TOTAL</td>
              <td v-for="bln in BULAN" :key="bln.key" class="td-bulan" style="font-weight:700">
                <div class="bulan-cell">
                  <span v-if="grandPerBulan[bln.key]" style="color:#0d9488">{{ compact(grandPerBulan[bln.key]) }}</span>
                  <span v-else class="zero">0</span>
                  <span v-if="getTrend(grandPerBulan, bln.key) === 'up'" class="trend-up">▲</span>
                  <span v-else-if="getTrend(grandPerBulan, bln.key) === 'down'" class="trend-down">▼</span>
                </div>
              </td>
              <td class="td-total" style="font-weight:800;font-size:12px">{{ compact(grandTotal) }}</td>
              <td class="td-trx" style="font-weight:700">{{ grandTrx }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const BULAN = [
  { key: 'jan', label: 'Jan' }, { key: 'feb', label: 'Feb' }, { key: 'mar', label: 'Mar' },
  { key: 'apr', label: 'Apr' }, { key: 'mei', label: 'Mei' }, { key: 'jun', label: 'Jun' },
  { key: 'jul', label: 'Jul' }, { key: 'agt', label: 'Agt' }, { key: 'sep', label: 'Sep' },
  { key: 'okt', label: 'Okt' }, { key: 'nov', label: 'Nov' }, { key: 'des', label: 'Des' },
]

const currentYear = new Date().getFullYear()

const loading = ref(false)
const fetched = ref(false)
const data = ref([])

const filters = ref({ tahun: currentYear })

const grandPerBulan = computed(() => {
  const result = {}
  for (const bln of BULAN) {
    result[bln.key] = data.value.reduce((sum, row) => sum + (row.per_bulan[bln.key] || 0), 0)
  }
  return result
})

const grandTotal = computed(() => data.value.reduce((sum, r) => sum + (r.total || 0), 0))
const grandTrx = computed(() => data.value.reduce((sum, r) => sum + (r.jumlah_transaksi || 0), 0))

async function fetchRekap() {
  loading.value = true
  try {
    const params = { idclient: authStore.id_client, tahun: filters.value.tahun }
    if (authStore.id_lokasi) params.id_lokasi = authStore.id_lokasi
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_rekap_supplier`,
      { params }
    )
    data.value = res.data?.data || []
    fetched.value = true
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat rekap supplier', life: 3000 })
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filters.value = { tahun: currentYear }
  fetchRekap()
}

function bukaDetail(row, bln) {
  const bulanIndex = BULAN.findIndex(b => b.key === bln.key) + 1
  router.push({
    name: 'RekapSupplierDetail',
    query: {
      id_supplier: row.id_supplier,
      nama_supplier: row.nama_supplier,
      tahun: filters.value.tahun,
      bulan: bulanIndex,
      nama_bulan: bln.label,
    },
  })
}

function getTrend(perBulan, bulanKey) {
  const current = perBulan[bulanKey]
  if (!current) return null
  const idx = BULAN.findIndex(b => b.key === bulanKey)
  for (let i = idx - 1; i >= 0; i--) {
    const prev = perBulan[BULAN[i].key]
    if (prev) return current > prev ? 'up' : current < prev ? 'down' : null
  }
  return null
}

function compact(val) {
  if (!val) return '0'
  return Number(val).toLocaleString('id-ID')
}

function formatCurrency(val) {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function exportExcel() {
  import('xlsx').then(xlsx => {
    const rows = data.value.map((row, i) => ({
      'No': i + 1,
      'Supplier': row.nama_supplier,
      ...Object.fromEntries(BULAN.map(b => [b.label, row.per_bulan[b.key] || 0])),
      'Total': row.total || 0,
      'Trx': row.jumlah_transaksi || 0,
    }))
    rows.push({
      'No': '',
      'Supplier': 'GRAND TOTAL',
      ...Object.fromEntries(BULAN.map(b => [b.label, grandPerBulan.value[b.key] || 0])),
      'Total': grandTotal.value || 0,
      'Trx': grandTrx.value || 0,
    })
    const ws = xlsx.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 4 }, { wch: 30 }, ...Array(12).fill({ wch: 14 }), { wch: 16 }, { wch: 6 }]
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, `Rekap ${filters.value.tahun}`)
    xlsx.writeFile(wb, `Rekap_Supplier_${filters.value.tahun}.xlsx`)
  })
}

onMounted(fetchRekap)
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0; }

.pm-filter-bar { display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:10px;flex-wrap:wrap; }
.pm-filter-group { display:flex;align-items:center;gap:6px; }
.pm-filter-label { font-size:11px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:3px;white-space:nowrap; }
.pm-filter-actions { display:flex;align-items:center;gap:6px; }
.tahun-input { width:80px;border:1px solid #d1d5db;border-radius:6px;padding:5px 8px;font-size:13px;color:#1e293b;text-align:center; }
.tahun-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.tahun-input:disabled { background:#f8fafc;color:#94a3b8; }

.rekap-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }

.rekap-table { width:100%;border-collapse:collapse;font-size:12px; }
.rekap-table thead tr { background:#f0fdfa; }
.rekap-table thead th { padding:6px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #99f6e4;white-space:nowrap; }

.th-bulan { width:82px;text-align:center !important;padding:6px 4px !important; }
.th-total { min-width:115px;text-align:center !important; }
.th-trx   { width:48px;text-align:center !important; }

.rekap-row { border-bottom:1px solid #f1f5f9; }
.rekap-row:hover { background:#f8fafc; }
.rekap-table tbody td { padding:5px 8px;vertical-align:middle; }

.td-bulan { text-align:center !important;padding:5px 4px !important; }
.bulan-cell { display:inline-flex;align-items:center;gap:3px; }
.trend-up   { font-size:8px;color:#16a34a;line-height:1; }
.trend-down { font-size:8px;color:#dc2626;line-height:1; }
.td-aktif { cursor:pointer;color:#0f766e;font-weight:600;font-size:11px; }
.td-aktif:hover { background:#f0fdfa !important;border-radius:4px; }
.td-kosong { color:#cbd5e1;font-size:11px; }
.zero { color:#cbd5e1;font-size:11px; }

.td-total { text-align:center !important;font-size:11px;color:#0f766e;font-weight:600; }
.td-trx   { text-align:center !important;font-size:11px;color:#64748b; }

.rekap-grand { background:#f0fdfa;border-top:2px solid #99f6e4; }
.rekap-grand td { padding:7px 8px;font-size:11px;color:#374151; }

.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
</style>
