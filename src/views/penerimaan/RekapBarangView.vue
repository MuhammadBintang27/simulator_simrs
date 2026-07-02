<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <div class="pm-hero-icon"><i class="pi pi-box"></i></div>
        <div>
          <h4 class="pm-hero-title">Rekap Penerimaan Barang</h4>
          <p class="pm-hero-sub">Ringkasan barang yang diterima per bulan</p>
        </div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pm-filter-bar">
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-calendar"></i>Bulan & Tahun</span>
        <DatePicker
          v-model="filterDate"
          view="month"
          dateFormat="mm/yy"
          placeholder="Pilih bulan..."
          showIcon
          iconDisplay="input"
          :maxDate="maxDate"
          style="min-width:150px"
          :disabled="loading"
          @update:modelValue="fetchRekap"
        />
      </div>
      <div class="pm-filter-actions ms-auto">
        <Button icon="pi pi-search" label="Tampilkan" class="round-button2 btn-primary-pm" :loading="loading" @click="fetchRekap" />
        <Button v-if="data.length" icon="pi pi-file-excel" label="Export" severity="success" outlined class="round-button2" @click="exportExcel" />
      </div>
    </div>

    <!-- TABLE WRAP -->
    <div class="rekap-wrap">
      <div v-if="loading" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
        <p style="margin-top:10px;font-size:13px">Memuat rekap...</p>
      </div>
      <div v-else-if="!data.length && fetched" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
        <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">
          Tidak ada data untuk {{ namaBulanAktif }} {{ tahun }}
        </p>
      </div>
      <div v-else-if="data.length" style="overflow-x:auto">
        <table class="rekap-table">
          <thead>
            <tr>
              <th style="width:32px;text-align:center">#</th>
              <th style="width:280px">Nama Barang</th>
              <th style="width:120px">Kategori</th>
              <th style="width:90px">Satuan</th>
              <th style="width:110px;text-align:center">Transaksi</th>
              <th style="width:110px;text-align:center">Total Qty</th>
              <th style="width:115px;text-align:right">Total Nilai</th>
            </tr>
            <tr class="filter-row">
              <th></th>
              <th><input v-model="colFilter.nama_barang" class="col-input" placeholder="cari nama..." /></th>
              <th>
                <select v-model="colFilter.kategori" class="col-input col-input-select">
                  <option value="">Semua</option>
                  <option v-for="k in kategoriOptions" :key="k" :value="k">{{ k }}</option>
                </select>
              </th>
              <th><input v-model="colFilter.satuan" class="col-input" placeholder="cari..." /></th>
              <th>
                <button class="sort-btn" :class="{ 'sort-active': isSortActive('jumlah_transaksi') }" @click="toggleSort('jumlah_transaksi')">
                  <i :class="sortIcon('jumlah_transaksi')"></i>
                  <span>{{ isSortActive('jumlah_transaksi') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                </button>
              </th>
              <th>
                <button class="sort-btn" :class="{ 'sort-active': isSortActive('total_qty') }" @click="toggleSort('total_qty')">
                  <i :class="sortIcon('total_qty')"></i>
                  <span>{{ isSortActive('total_qty') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                </button>
              </th>
              <th>
                <button class="sort-btn" :class="{ 'sort-active': isSortActive('total_nilai') }" @click="toggleSort('total_nilai')">
                  <i :class="sortIcon('total_nilai')"></i>
                  <span>{{ isSortActive('total_nilai') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredData.length" class="empty-row">
              <td colspan="7"><i class="pi pi-filter-slash"></i> Tidak ada data yang cocok dengan filter</td>
            </tr>
            <tr v-for="(row, i) in filteredData" v-else :key="row.id_barang" class="rekap-row" @click="bukaDetail(row)">
              <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
              <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                <div style="font-size:12px;font-weight:600;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.nama_barang">{{ row.nama_barang }}</div>
              </td>
              <td><span class="kategori-chip">{{ row.kategori || '—' }}</span></td>
              <td><span style="font-size:11px;color:#64748b">{{ row.satuan }}</span></td>
              <td style="text-align:center"><span style="font-size:12px;color:#64748b;font-weight:600">{{ row.jumlah_transaksi }}</span></td>
              <td style="text-align:center"><span style="font-size:12px;color:#475569;font-weight:600">{{ row.total_qty }}</span></td>
              <td style="text-align:right;padding-right:12px">
                <span style="font-size:12px;font-weight:700;color:#0f766e">{{ formatCurrency(row.total_nilai) }}</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="rekap-grand">
              <td colspan="4" style="font-weight:700;font-size:11px;letter-spacing:.4px">
                TOTAL{{ filteredData.length !== data.length ? ` (${filteredData.length} / ${data.length})` : '' }}
              </td>
              <td style="text-align:center;font-weight:700">{{ grandTrx }}</td>
              <td style="text-align:center;font-weight:700">{{ grandQty }}</td>
              <td style="text-align:right;padding-right:12px;font-weight:800;font-size:12px;color:#0d9488">{{ formatCurrency(grandNilai) }}</td>
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
import DatePicker from 'primevue/datepicker'
import axios from 'axios'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const maxDate    = new Date()
const filterDate = ref(new Date())

const tahun        = computed(() => filterDate.value?.getFullYear())
const bulan        = computed(() => filterDate.value ? filterDate.value.getMonth() + 1 : null)
const namaBulanAktif = computed(() =>
  filterDate.value?.toLocaleDateString('id-ID', { month: 'long' }) ?? ''
)

const loading = ref(false)
const fetched = ref(false)
const data    = ref([])

// ── COLUMN FILTER + SORT ──
const colFilter = ref({ nama_barang: '', satuan: '', kategori: '' })

const kategoriOptions = computed(() =>
  [...new Set(data.value.map(r => r.kategori).filter(Boolean))].sort()
)
const colSort   = ref({ field: 'total_nilai', dir: 'desc' })

function toggleSort(field) {
  colSort.value = colSort.value.field === field
    ? { field, dir: colSort.value.dir === 'asc' ? 'desc' : 'asc' }
    : { field, dir: 'desc' }
}
function isSortActive(field) { return colSort.value.field === field }
function sortIcon(field) {
  if (!isSortActive(field)) return 'pi pi-sort-alt'
  return colSort.value.dir === 'asc' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'
}

const filteredData = computed(() => {
  const f = colFilter.value
  let result = data.value.filter(r => {
    if (f.nama_barang && !r.nama_barang?.toLowerCase().includes(f.nama_barang.toLowerCase())) return false
    if (f.satuan      && !r.satuan?.toLowerCase().includes(f.satuan.toLowerCase()))           return false
    if (f.kategori    && r.kategori !== f.kategori)                                           return false
    return true
  })
  const { field, dir } = colSort.value
  return [...result].sort((a, b) => {
    const va = Number(a[field]) || 0, vb = Number(b[field]) || 0
    return dir === 'asc' ? va - vb : vb - va
  })
})

const grandTrx   = computed(() => filteredData.value.reduce((s, r) => s + (Number(r.jumlah_transaksi) || 0), 0))
const grandQty   = computed(() => filteredData.value.reduce((s, r) => s + (Number(r.total_qty)        || 0), 0))
const grandNilai = computed(() => filteredData.value.reduce((s, r) => s + (Number(r.total_nilai)      || 0), 0))

async function fetchRekap() {
  if (!filterDate.value) return
  loading.value = true
  try {
    const params = { idclient: authStore.id_client, tahun: tahun.value, bulan: bulan.value }
    if (authStore.id_lokasi) params.id_lokasi = authStore.id_lokasi
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_rekap_barang`,
      { params }
    )
    data.value = res.data?.data || []
    fetched.value = true
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat rekap barang', life: 3000 })
  } finally {
    loading.value = false
  }
}

function bukaDetail(row) {
  router.push({
    name: 'RekapBarangDetail',
    query: {
      id_barang:   row.id_barang,
      nama_barang: row.nama_barang,
      satuan:      row.satuan,
      tahun:       tahun.value,
      bulan:       bulan.value,
      nama_bulan:  namaBulanAktif.value,
    },
  })
}

function exportExcel() {
  import('xlsx').then(xlsx => {
    const rows = filteredData.value.map((r, i) => ({
      'No': i + 1,
      'Nama Barang': r.nama_barang,
      'Kategori': r.kategori || '',
      'Satuan': r.satuan,
      'Jml Transaksi': r.jumlah_transaksi || 0,
      'Total Qty': r.total_qty || 0,
      'Total Nilai': Number(r.total_nilai) || 0,
    }))
    rows.push({ 'No': '', 'Nama Barang': 'TOTAL', 'Kategori': '', 'Satuan': '', 'Jml Transaksi': grandTrx.value, 'Total Qty': grandQty.value, 'Total Nilai': grandNilai.value })
    const ws = xlsx.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 4 }, { wch: 35 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 16 }]
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, `${namaBulanAktif.value} ${tahun.value}`)
    xlsx.writeFile(wb, `Rekap_Barang_${namaBulanAktif.value}_${tahun.value}.xlsx`)
  })
}

function formatCurrency(val) {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchRekap)
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0; }

.pm-filter-bar { display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:10px;flex-wrap:wrap; }
.pm-filter-group { display:flex;align-items:center;gap:6px; }
.pm-filter-label { font-size:11px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:3px;white-space:nowrap; }
.pm-filter-actions { display:flex;align-items:center;gap:6px; }

.rekap-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }
.rekap-table { width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed; }
.rekap-table thead tr:first-child { background:#f0fdfa; }
.rekap-table thead th { padding:6px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #ccfbf1;white-space:nowrap; }
.rekap-row { border-bottom:1px solid #f1f5f9;cursor:pointer; }
.rekap-row:hover { background:#f0fdfa; }
.rekap-table tbody td { padding:7px 8px;vertical-align:middle; }
.rekap-grand { background:#f0fdfa;border-top:2px solid #99f6e4; }
.rekap-grand td { padding:7px 8px;font-size:11px;color:#374151; }

.filter-row { background:#f8fafc; }
.filter-row th { padding:4px 4px 5px !important;border-bottom:2px solid #99f6e4 !important; }
.col-input { width:100%;border:1px solid #d1d5db;border-radius:4px;padding:3px 6px;font-size:11px;font-family:inherit;color:#1e293b;background:#fff;height:26px; }
.col-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.12); }
.col-input::placeholder { color:#b0bec5; }

.sort-btn { display:inline-flex;align-items:center;justify-content:center;gap:3px;width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer;font-size:10px;color:#94a3b8;font-family:inherit;transition:all .15s;height:26px; }
.sort-btn:hover { border-color:#0d9488;color:#0d9488;background:#f0fdfa; }
.sort-btn.sort-active { background:#f0fdfa;border-color:#0d9488;color:#0d9488;font-weight:700; }
.sort-btn .pi { font-size:10px; }

.col-input-select { cursor:pointer;appearance:auto; }
.kategori-chip { display:inline-block;padding:1px 7px;border-radius:6px;font-size:10px;font-weight:600;background:#e0f2fe;color:#0369a1; }
.empty-row td { padding:28px;text-align:center;color:#94a3b8;font-size:12px; }
.empty-row .pi { color:#cbd5e1;margin-right:6px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
</style>
