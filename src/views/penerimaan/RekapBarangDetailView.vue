<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <Button icon="pi pi-arrow-left" text rounded class="me-2" @click="goBack" />
        <div class="pm-hero-icon"><i class="pi pi-box"></i></div>
        <div>
          <h4 class="pm-hero-title">{{ namaBarang }}</h4>
          <p class="pm-hero-sub">Penerimaan bulan <strong>{{ namaBulanAktif }}</strong> {{ activeTahun }} · {{ satuan }}</p>
        </div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pm-filter-bar">
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-calendar"></i>Periode</span>
        <DatePicker v-model="filterDate" view="month" dateFormat="mm/yy" showIcon :manualInput="false" placeholder="Pilih bulan" class="date-picker-sm" />
      </div>
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-list"></i>Mode</span>
        <div class="mode-toggle">
          <button :class="['mode-btn', mode === 1 && 'mode-active']" @click="setMode(1)">Per Supplier</button>
          <button :class="['mode-btn', mode === 2 && 'mode-active']" @click="setMode(2)">Per Batch</button>
        </div>
      </div>
      <div class="pm-filter-actions ms-auto">
        <Button icon="pi pi-search" label="Tampilkan" class="round-button2 btn-primary-pm" :loading="loading" @click="fetchDetail" />
      </div>
    </div>

    <div class="det-wrap">
      <div v-if="loading" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
        <p style="margin-top:10px;font-size:13px">Memuat detail...</p>
      </div>
      <div v-else-if="!data.length" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
        <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">Tidak ada data untuk periode ini</p>
      </div>
      <template v-else>

        <!-- STAT STRIP -->
        <div class="det-stat-strip">
          <div class="stat-card">
            <div class="stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-building"></i></div>
            <div>
              <div class="stat-lbl">Supplier</div>
              <div class="stat-val" style="color:#0d9488">
                {{ grandSupplier }}
                <span v-if="grandSupplier !== totalSupplier" style="font-size:11px;font-weight:400;color:#94a3b8"> / {{ totalSupplier }}</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-ico" style="background:#eff6ff;color:#2563eb"><i class="pi pi-receipt"></i></div>
            <div>
              <div class="stat-lbl">{{ mode === 1 ? 'Total Trx' : 'Total Batch' }}</div>
              <div class="stat-val" style="color:#2563eb">{{ grandTrx }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-ico" style="background:#f5f3ff;color:#7c3aed"><i class="pi pi-sort-amount-up"></i></div>
            <div><div class="stat-lbl">Total Qty</div><div class="stat-val" style="color:#7c3aed">{{ grandQty }}</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-wallet"></i></div>
            <div>
              <div class="stat-lbl">Total Nilai</div>
              <div class="stat-val" style="color:#0d9488;font-size:15px">{{ formatCurrency(grandNilai) }}</div>
            </div>
          </div>
        </div>

        <!-- ACTION BAR -->
        <div class="action-bar">
          <Button icon="pi pi-file-excel" label="Export Excel" severity="success" outlined size="small" class="round-button2" @click="exportExcel" />
          <Button v-if="hasActiveFilter" icon="pi pi-filter-slash" label="Reset Filter" severity="secondary" outlined size="small" class="round-button2" @click="resetFilter" />
        </div>

        <!-- MODE 1: Per Supplier -->
        <div v-if="mode === 1" style="overflow-x:auto">
          <table class="det-table">
            <thead>
              <tr>
                <th style="width:32px;text-align:center">#</th>
                <th style="width:210px">Nama Supplier</th>
                <th style="width:110px;text-align:center">Transaksi</th>
                <th style="width:110px;text-align:center">Total Qty</th>
                <th style="width:130px;text-align:right">Rata Harga</th>
                <th style="width:120px;text-align:right">Total Nilai</th>
              </tr>
              <tr class="filter-row">
                <th></th>
                <th><input v-model="colFilter.nama_supplier" class="col-input" placeholder="cari supplier..." /></th>
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
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('rata_harga_satuan') }" @click="toggleSort('rata_harga_satuan')">
                    <i :class="sortIcon('rata_harga_satuan')"></i>
                    <span>{{ isSortActive('rata_harga_satuan') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
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
                <td colspan="6"><i class="pi pi-filter-slash"></i> Tidak ada data yang cocok dengan filter</td>
              </tr>
              <tr v-for="(row, i) in filteredData" v-else :key="row.id_supplier">
                <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
                <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  <span style="font-size:12px;font-weight:600;color:#1e293b" :title="row.nama_supplier">{{ row.nama_supplier }}</span>
                </td>
                <td style="text-align:center"><span style="font-size:12px;color:#64748b;font-weight:600">{{ row.jumlah_transaksi }}</span></td>
                <td style="text-align:center"><span style="font-size:12px;color:#475569;font-weight:600">{{ row.total_qty }}</span></td>
                <td style="text-align:right"><span style="font-size:11px;color:#64748b">{{ formatCurrency(row.rata_harga_satuan) }}</span></td>
                <td style="text-align:right;padding-right:12px">
                  <span style="font-size:12px;font-weight:700;color:#0f766e">{{ formatCurrency(row.total_nilai) }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="grand-row">
                <td colspan="2" style="font-weight:700;font-size:11px;color:#374151;text-transform:uppercase;letter-spacing:.4px">
                  Total{{ filteredData.length !== data.length ? ` (${filteredData.length} / ${data.length})` : '' }}
                </td>
                <td style="text-align:center;font-weight:700;color:#374151">{{ grandTrx }}</td>
                <td style="text-align:center;font-weight:700;color:#374151">{{ grandQty }}</td>
                <td></td>
                <td style="text-align:right;padding-right:12px;font-weight:800;font-size:13px;color:#0d9488">{{ formatCurrency(grandNilai) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- MODE 2: Per Batch -->
        <div v-else style="overflow-x:auto">
          <table class="det-table">
            <thead>
              <tr>
                <th style="width:32px;text-align:center">#</th>
                <th style="width:165px">No Penerimaan</th>
                <th style="width:155px">Nama Supplier</th>
                <th style="width:110px">No Batch</th>
                <th style="width:110px">Sub Barcode</th>
                <th style="width:90px;text-align:center">Tgl Expired</th>
                <th style="width:70px;text-align:center">Qty</th>
                <th style="width:105px;text-align:right">Harga/Sat</th>
                <th style="width:105px;text-align:right">Subtotal</th>
              </tr>
              <tr class="filter-row">
                <th></th>
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('tanggal') }" @click="toggleSort('tanggal')">
                    <i :class="sortIcon('tanggal')"></i>
                    <span>{{ isSortActive('tanggal') ? (colSort.dir === 'asc' ? 'Lama' : 'Baru') : 'Urut' }}</span>
                  </button>
                </th>
                <th><input v-model="colFilter.nama_supplier" class="col-input" placeholder="cari supplier..." /></th>
                <th><input v-model="colFilter.no_batch" class="col-input" placeholder="cari batch..." /></th>
                <th><input v-model="colFilter.sub_barcode" class="col-input" placeholder="cari sub barcode..." /></th>
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('tgl_expired') }" @click="toggleSort('tgl_expired')">
                    <i :class="sortIcon('tgl_expired')"></i>
                    <span>{{ isSortActive('tgl_expired') ? (colSort.dir === 'asc' ? 'Lama' : 'Baru') : 'Urut' }}</span>
                  </button>
                </th>
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('qty') }" @click="toggleSort('qty')">
                    <i :class="sortIcon('qty')"></i>
                    <span>{{ isSortActive('qty') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                  </button>
                </th>
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('harga_satuan') }" @click="toggleSort('harga_satuan')">
                    <i :class="sortIcon('harga_satuan')"></i>
                    <span>{{ isSortActive('harga_satuan') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                  </button>
                </th>
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('subtotal') }" @click="toggleSort('subtotal')">
                    <i :class="sortIcon('subtotal')"></i>
                    <span>{{ isSortActive('subtotal') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredData.length" class="empty-row">
                <td colspan="9"><i class="pi pi-filter-slash"></i> Tidak ada data yang cocok dengan filter</td>
              </tr>
              <tr v-for="(row, i) in filteredData" v-else :key="`${row.no_penerimaan}-${row.sub_barcode}-${i}`">
                <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
                <td style="overflow:hidden">
                  <div style="font-size:11px;font-weight:600;color:#1e293b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" :title="row.no_penerimaan">{{ row.no_penerimaan }}</div>
                  <div style="font-size:10px;color:#94a3b8">{{ row.tanggal }}</div>
                </td>
                <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  <span style="font-size:11px;font-weight:500;color:#374151" :title="row.nama_supplier">{{ row.nama_supplier }}</span>
                </td>
                <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  <span style="font-size:11px;color:#475569" :title="row.no_batch">{{ row.no_batch || '-' }}</span>
                </td>
                <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  <span style="font-size:11px;color:#475569" :title="row.sub_barcode">{{ row.sub_barcode || '-' }}</span>
                </td>
                <td style="text-align:center">
                  <span style="font-size:11px;color:#64748b">{{ row.tgl_expired || '-' }}</span>
                </td>
                <td style="text-align:center">
                  <span style="font-size:12px;font-weight:600;color:#475569">{{ row.qty }}</span>
                </td>
                <td style="text-align:right">
                  <span style="font-size:11px;color:#64748b">{{ formatCurrency(row.harga_satuan) }}</span>
                </td>
                <td style="text-align:right;padding-right:12px">
                  <span style="font-size:12px;font-weight:700;color:#0f766e">{{ formatCurrency(row.subtotal) }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="grand-row">
                <td colspan="6" style="font-weight:700;font-size:11px;color:#374151;text-transform:uppercase;letter-spacing:.4px">
                  Total{{ filteredData.length !== data.length ? ` (${filteredData.length} / ${data.length})` : '' }}
                </td>
                <td style="text-align:center;font-weight:700;color:#374151">{{ grandQty }}</td>
                <td></td>
                <td style="text-align:right;padding-right:12px;font-weight:800;font-size:13px;color:#0d9488">{{ formatCurrency(grandNilai) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import DatePicker from 'primevue/datepicker'
import axios from 'axios'

const router = useRouter()
const route  = useRoute()
const configStore = useConfigStore()
const authStore   = useAuthStore()
const toast = useToast()

const idBarang   = route.query.id_barang
const namaBarang = route.query.nama_barang || 'Detail Barang'
const satuan     = route.query.satuan || ''

const initYear  = Number(route.query.tahun) || new Date().getFullYear()
const initMonth = Number(route.query.bulan) || (new Date().getMonth() + 1)
const filterDate = ref(new Date(initYear, initMonth - 1, 1))

const activeTahun    = computed(() => filterDate.value?.getFullYear() || new Date().getFullYear())
const activeBulan    = computed(() => (filterDate.value?.getMonth() ?? new Date().getMonth()) + 1)
const namaBulanAktif = computed(() =>
  filterDate.value?.toLocaleDateString('id-ID', { month: 'long' }) || ''
)

const mode    = ref(1)
const loading = ref(false)
const data    = ref([])

watch(filterDate, (val) => { if (val) fetchDetail() })

const colFilter = ref({ nama_supplier: '', no_batch: '', sub_barcode: '' })
const colSort   = ref({ field: 'total_nilai', dir: 'desc' })

function setMode(m) {
  if (mode.value === m) return
  mode.value = m
  resetFilter()
  fetchDetail()
}

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

const hasActiveFilter = computed(() => {
  if (mode.value === 1) {
    return !!(colFilter.value.nama_supplier ||
      colSort.value.field !== 'total_nilai' || colSort.value.dir !== 'desc')
  }
  return !!(colFilter.value.nama_supplier || colFilter.value.no_batch || colFilter.value.sub_barcode ||
    colSort.value.field !== 'tanggal' || colSort.value.dir !== 'desc')
})

function resetFilter() {
  colFilter.value = { nama_supplier: '', no_batch: '', sub_barcode: '' }
  colSort.value   = mode.value === 1
    ? { field: 'total_nilai', dir: 'desc' }
    : { field: 'tanggal', dir: 'desc' }
}

const filteredData = computed(() => {
  const f = colFilter.value
  let result = data.value.filter(r => {
    if (f.nama_supplier && !r.nama_supplier?.toLowerCase().includes(f.nama_supplier.toLowerCase())) return false
    if (mode.value === 2 && f.no_batch && !r.no_batch?.toLowerCase().includes(f.no_batch.toLowerCase())) return false
    if (mode.value === 2 && f.sub_barcode && !r.sub_barcode?.toLowerCase().includes(f.sub_barcode.toLowerCase())) return false
    return true
  })
  const { field, dir } = colSort.value
  result = [...result].sort((a, b) => {
    if (field === 'tanggal' || field === 'tgl_expired') {
      const va = a[field] ? new Date(a[field]).getTime() : 0
      const vb = b[field] ? new Date(b[field]).getTime() : 0
      return dir === 'asc' ? va - vb : vb - va
    }
    const va = Number(a[field]) || 0
    const vb = Number(b[field]) || 0
    return dir === 'asc' ? va - vb : vb - va
  })
  return result
})

const grandSupplier = computed(() => {
  if (mode.value === 1) return filteredData.value.length
  return new Set(filteredData.value.map(r => r.id_supplier)).size
})
const totalSupplier = computed(() => {
  if (mode.value === 1) return data.value.length
  return new Set(data.value.map(r => r.id_supplier)).size
})
const grandTrx = computed(() => {
  if (mode.value === 1) return filteredData.value.reduce((s, r) => s + (Number(r.jumlah_transaksi) || 0), 0)
  return new Set(filteredData.value.map(r => r.no_penerimaan)).size
})
const grandQty = computed(() => {
  const field = mode.value === 1 ? 'total_qty' : 'qty'
  return filteredData.value.reduce((s, r) => s + (Number(r[field]) || 0), 0)
})
const grandNilai = computed(() => {
  const field = mode.value === 1 ? 'total_nilai' : 'subtotal'
  return filteredData.value.reduce((s, r) => s + (Number(r[field]) || 0), 0)
})

async function fetchDetail() {
  loading.value = true
  try {
    const params = {
      idclient: authStore.id_client,
      tahun: activeTahun.value,
      bulan: activeBulan.value,
      id_barang: idBarang,
      mode: mode.value,
    }
    if (authStore.id_lokasi) params.id_lokasi = authStore.id_lokasi
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_rekap_barang_detail`,
      { params }
    )
    data.value = res.data?.data || []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail rekap barang', life: 3000 })
  } finally {
    loading.value = false
  }
}

function exportExcel() {
  import('xlsx').then(xlsx => {
    let rows, cols
    if (mode.value === 1) {
      rows = filteredData.value.map((r, i) => ({
        'No': i + 1,
        'Nama Supplier': r.nama_supplier,
        'Jml Transaksi': r.jumlah_transaksi || 0,
        'Total Qty': r.total_qty || 0,
        'Rata Harga Satuan': Number(r.rata_harga_satuan) || 0,
        'Total Nilai': Number(r.total_nilai) || 0,
      }))
      rows.push({ 'No': '', 'Nama Supplier': 'TOTAL', 'Jml Transaksi': grandTrx.value, 'Total Qty': grandQty.value, 'Rata Harga Satuan': '', 'Total Nilai': grandNilai.value })
      cols = [{ wch: 4 }, { wch: 35 }, { wch: 13 }, { wch: 10 }, { wch: 16 }, { wch: 16 }]
    } else {
      rows = filteredData.value.map((r, i) => ({
        'No': i + 1,
        'No Penerimaan': r.no_penerimaan,
        'Tanggal': r.tanggal,
        'Nama Supplier': r.nama_supplier,
        'Sub Barcode': r.sub_barcode,
        'No Batch': r.no_batch,
        'Tgl Expired': r.tgl_expired,
        'Qty': Number(r.qty) || 0,
        'Harga Satuan': Number(r.harga_satuan) || 0,
        'Subtotal': Number(r.subtotal) || 0,
      }))
      rows.push({ 'No': '', 'No Penerimaan': 'TOTAL', 'Tanggal': '', 'Nama Supplier': '', 'Sub Barcode': '', 'No Batch': '', 'Tgl Expired': '', 'Qty': grandQty.value, 'Harga Satuan': '', 'Subtotal': grandNilai.value })
      cols = [{ wch: 4 }, { wch: 22 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 14 }]
    }
    const ws = xlsx.utils.json_to_sheet(rows)
    ws['!cols'] = cols
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, `${namaBarang}`.slice(0, 31))
    xlsx.writeFile(wb, `Rekap_${namaBarang}_${namaBulanAktif.value}_${activeTahun.value}_M${mode.value}.xlsx`.replace(/[/\\?*[\]]/g, '_'))
  })
}

function goBack() { router.push({ name: 'RekapBarang' }) }

function formatCurrency(val) {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchDetail)
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

.mode-toggle { display:inline-flex;border:1px solid #d1d5db;border-radius:6px;overflow:hidden; }
.mode-btn { padding:5px 14px;font-size:11px;font-weight:600;color:#64748b;background:#fff;border:none;cursor:pointer;transition:all .15s;white-space:nowrap; }
.mode-btn:hover { background:#f0fdfa;color:#0d9488; }
.mode-btn.mode-active { background:#0d9488;color:#fff; }

:deep(.date-picker-sm .p-datepicker-input) { padding:4px 8px;font-size:12px;height:32px; }
:deep(.date-picker-sm) { height:32px; }

.det-stat-strip { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 16px;background:#fafafa;border-bottom:1px solid #e2e8f0; }
.stat-card { display:flex;align-items:center;gap:10px; }
.stat-ico { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0; }
.stat-lbl { font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.stat-val { font-size:16px;font-weight:700;color:#1e293b;margin-top:1px; }

.action-bar { display:flex;align-items:center;gap:8px;padding:6px 12px;background:#fff;border-bottom:1px solid #e2e8f0; }
.det-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }

.det-table { width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed; }
.det-table thead tr:first-child { background:#f0fdfa; }
.det-table thead th { padding:7px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #ccfbf1;white-space:nowrap; }
.det-table tbody tr { border-bottom:1px solid #f1f5f9; }
.det-table tbody tr:hover { background:#f8fafc; }
.det-table tbody td { padding:7px 8px;vertical-align:middle; }
.grand-row { background:#f0fdfa;border-top:2px solid #99f6e4; }
.grand-row td { padding:8px 8px;font-size:11px; }

.filter-row { background:#f8fafc; }
.filter-row th { padding:4px 4px 5px !important;border-bottom:2px solid #99f6e4 !important; }
.col-input { width:100%;border:1px solid #d1d5db;border-radius:4px;padding:3px 6px;font-size:11px;font-family:inherit;color:#1e293b;background:#fff;height:26px; }
.col-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.12); }
.col-input::placeholder { color:#b0bec5; }

.sort-btn { display:inline-flex;align-items:center;justify-content:center;gap:3px;width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer;font-size:10px;color:#94a3b8;font-family:inherit;transition:all .15s;height:26px; }
.sort-btn:hover { border-color:#0d9488;color:#0d9488;background:#f0fdfa; }
.sort-btn.sort-active { background:#f0fdfa;border-color:#0d9488;color:#0d9488;font-weight:700; }
.sort-btn .pi { font-size:10px; }

.empty-row td { padding:28px;text-align:center;color:#94a3b8;font-size:12px; }
.empty-row .pi { color:#cbd5e1;margin-right:6px; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
</style>
