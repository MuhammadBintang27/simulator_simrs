<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <Button icon="pi pi-arrow-left" text rounded class="me-2" @click="goBack" />
        <div class="pm-hero-icon"><i class="pi pi-chart-bar"></i></div>
        <div>
          <h4 class="pm-hero-title">{{ namaSupplier }}</h4>
          <p class="pm-hero-sub">Penerimaan bulan <strong>{{ namaBulan }}</strong> {{ tahun }}</p>
        </div>
      </div>
    </div>

    <div class="det-wrap">
      <div v-if="loading" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
        <p style="margin-top:10px;font-size:13px">Memuat detail...</p>
      </div>
      <div v-else-if="!data.length" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
        <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">Tidak ada penerimaan pada bulan ini</p>
      </div>
      <template v-else>

        <!-- STAT STRIP -->
        <div class="det-stat-strip">
          <div class="stat-card">
            <div class="stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-receipt"></i></div>
            <div>
              <div class="stat-lbl">Transaksi</div>
              <div class="stat-val" style="color:#0d9488">
                {{ filteredData.length }}
                <span v-if="filteredData.length !== data.length" style="font-size:11px;font-weight:400;color:#94a3b8"> / {{ data.length }}</span>
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-ico" style="background:#eff6ff;color:#2563eb"><i class="pi pi-box"></i></div>
            <div><div class="stat-lbl">Total Item</div><div class="stat-val" style="color:#2563eb">{{ filteredTotalItem }}</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-ico" style="background:#f5f3ff;color:#7c3aed"><i class="pi pi-sort-amount-up"></i></div>
            <div><div class="stat-lbl">Total Qty</div><div class="stat-val" style="color:#7c3aed">{{ filteredTotalQty }}</div></div>
          </div>
          <div class="stat-card">
            <div class="stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-wallet"></i></div>
            <div>
              <div class="stat-lbl">Grand Total</div>
              <div class="stat-val" style="color:#0d9488;font-size:15px">{{ formatCurrency(filteredGrandTotal) }}</div>
            </div>
          </div>
        </div>

        <!-- ACTION BAR -->
        <div class="action-bar">
          <Button
            :icon="expandMode ? 'pi pi-compress' : 'pi pi-expand'"
            :label="expandMode ? 'Tutup Detail Item' : 'Expand Item'"
            :severity="expandMode ? 'contrast' : 'secondary'"
            :outlined="!expandMode"
            size="small"
            class="round-button2"
            :loading="mode2Loading"
            @click="toggleExpandMode"
          />
          <Button
            icon="pi pi-file-excel"
            :label="expandMode ? 'Export + Item' : 'Export Excel'"
            severity="success"
            outlined
            size="small"
            class="round-button2"
            @click="exportExcel"
          />
          <Button
            v-if="hasActiveFilter"
            icon="pi pi-filter-slash"
            label="Reset Filter"
            severity="secondary"
            outlined
            size="small"
            class="round-button2"
            @click="resetFilter"
          />
        </div>

        <!-- TABLE -->
        <div style="overflow-x:auto">
          <table class="det-table">
            <thead>
              <!-- Header labels -->
              <tr>
                <th style="width:32px;text-align:center">#</th>
                <th style="width:130px">No Penerimaan</th>
                <th style="width:105px">No Faktur</th>
                <th style="width:95px">Tanggal</th>
                <th style="width:75px;text-align:center">Status</th>
                <th style="width:68px;text-align:center">Jml Item</th>
                <th style="width:70px;text-align:center">Total Qty</th>
                <th style="width:100px;text-align:right">Sub Total</th>
                <th style="width:108px;text-align:right">Grand Total</th>
              </tr>
              <!-- Filter row -->
              <tr class="filter-row">
                <th></th>
                <!-- No Penerimaan: text search -->
                <th>
                  <input v-model="colFilter.no_penerimaan" class="col-input" placeholder="cari..." />
                </th>
                <!-- No Faktur: text search -->
                <th>
                  <input v-model="colFilter.no_faktur" class="col-input" placeholder="cari..." />
                </th>
                <!-- Tanggal: sort toggle -->
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('tanggal') }" @click="toggleSort('tanggal')">
                    <i :class="sortIcon('tanggal')"></i>
                    <span>{{ isSortActive('tanggal') ? (colSort.dir === 'asc' ? 'Lama' : 'Baru') : 'Urut' }}</span>
                  </button>
                </th>
                <!-- Status: select -->
                <th>
                  <select v-model="colFilter.status_lunas" class="col-input col-input-select">
                    <option value="">Semua</option>
                    <option value="1">Lunas</option>
                    <option value="0">Kredit</option>
                  </select>
                </th>
                <!-- Jml Item: sort -->
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('jumlah_item') }" @click="toggleSort('jumlah_item')">
                    <i :class="sortIcon('jumlah_item')"></i>
                    <span>{{ isSortActive('jumlah_item') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                  </button>
                </th>
                <!-- Total Qty: sort -->
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('total_qty') }" @click="toggleSort('total_qty')">
                    <i :class="sortIcon('total_qty')"></i>
                    <span>{{ isSortActive('total_qty') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                  </button>
                </th>
                <!-- Sub Total: sort -->
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('sub_total') }" @click="toggleSort('sub_total')">
                    <i :class="sortIcon('sub_total')"></i>
                    <span>{{ isSortActive('sub_total') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                  </button>
                </th>
                <!-- Grand Total: sort -->
                <th>
                  <button class="sort-btn" :class="{ 'sort-active': isSortActive('grand_total') }" @click="toggleSort('grand_total')">
                    <i :class="sortIcon('grand_total')"></i>
                    <span>{{ isSortActive('grand_total') ? (colSort.dir === 'asc' ? 'Kecil' : 'Besar') : 'Urut' }}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredData.length" class="empty-row">
                <td colspan="9">
                  <i class="pi pi-filter-slash"></i>
                  Tidak ada data yang cocok dengan filter
                </td>
              </tr>
              <template v-for="(row, i) in filteredData" v-else :key="row.no_penerimaan">
                <!-- DATA ROW -->
                <tr :class="{ 'row-expanded': expandMode }">
                  <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
                  <td><span class="mono" style="font-weight:600;color:#0d9488;font-size:12px">{{ row.no_penerimaan }}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:5px">
                      <span class="mono" style="font-size:12px;color:#475569">{{ row.no_faktur || '-' }}</span>
                      <a v-if="row.lampiran_url" :href="row.lampiran_url" target="_blank" class="lampiran-btn" title="Lihat lampiran faktur">
                        <i class="pi pi-file-pdf"></i>
                      </a>
                    </div>
                  </td>
                  <td><span class="mono" style="font-size:11px">{{ formatDate(row.tanggal) }}</span></td>
                  <td style="text-align:center">
                    <span v-if="Number(row.status_lunas) === 1" class="chip-lunas">Lunas</span>
                    <span v-else class="chip-kredit">Kredit</span>
                  </td>
                  <td style="text-align:center"><span class="mono" style="font-size:12px;color:#64748b">{{ row.jumlah_item ?? '-' }}</span></td>
                  <td style="text-align:center"><span class="mono" style="font-size:12px;color:#64748b">{{ row.total_qty ?? '-' }}</span></td>
                  <td style="text-align:right">
                    <span class="mono" style="font-size:11px;color:#64748b">{{ row.sub_total ? formatCurrency(row.sub_total) : '-' }}</span>
                  </td>
                  <td style="text-align:right;padding-right:12px">
                    <span class="mono" style="font-weight:700;font-size:12px;color:#0f766e">{{ formatCurrency(row.grand_total) }}</span>
                  </td>
                </tr>
                <!-- EXPAND ROW -->
                <tr v-if="expandMode" class="item-expand-row">
                  <td colspan="9" style="padding:0 0 6px 32px !important">
                    <div v-if="mode2Loading" style="padding:12px;text-align:center;color:#94a3b8;font-size:12px">
                      <i class="pi pi-spin pi-spinner" style="margin-right:6px"></i>Memuat item...
                    </div>
                    <table v-else class="item-table">
                      <thead>
                        <tr>
                          <th>Nama Barang</th>
                          <th>No Batch</th>
                          <th>Tgl Exp</th>
                          <th style="text-align:center">Qty</th>
                          <th>Satuan</th>
                          <th style="text-align:right">Harga Satuan</th>
                          <th style="text-align:center">Diskon</th>
                          <th style="text-align:right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="!(mode2Data[row.no_penerimaan]?.length)">
                          <td colspan="8" style="text-align:center;color:#94a3b8;padding:10px;font-size:11px">Tidak ada item</td>
                        </tr>
                        <tr v-for="item in (mode2Data[row.no_penerimaan] || [])" :key="item.id_barang">
                          <td>{{ item.nama_barang }}</td>
                          <td><span style="font-size:10px;color:#64748b">{{ item.no_batch || '-' }}</span></td>
                          <td><span style="font-size:10px;color:#64748b">{{ formatDate(item.tgl_expired) }}</span></td>
                          <td style="text-align:center;font-weight:600">{{ item.qty }}</td>
                          <td style="color:#64748b">{{ item.satuan }}</td>
                          <td style="text-align:right">{{ formatCurrency(item.harga_satuan) }}</td>
                          <td style="text-align:center;color:#64748b">{{ item.diskon ? `${item.diskon}%` : '—' }}</td>
                          <td style="text-align:right;font-weight:600;color:#0f766e">{{ formatCurrency(item.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr class="grand-row">
                <td colspan="5" style="font-weight:700;font-size:11px;color:#374151;text-transform:uppercase;letter-spacing:.4px">
                  Total{{ filteredData.length !== data.length ? ` (${filteredData.length} / ${data.length})` : '' }}
                </td>
                <td style="text-align:center;font-weight:700;color:#374151">{{ filteredTotalItem }}</td>
                <td style="text-align:center;font-weight:700;color:#374151">{{ filteredTotalQty }}</td>
                <td style="text-align:right;font-weight:700;color:#64748b">{{ formatCurrency(filteredSubTotal) }}</td>
                <td style="text-align:right;padding-right:12px;font-weight:800;font-size:13px;color:#0d9488">{{ formatCurrency(filteredGrandTotal) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const idSupplier   = route.query.id_supplier
const namaSupplier = route.query.nama_supplier || 'Detail Supplier'
const tahun        = route.query.tahun
const bulan        = route.query.bulan
const namaBulan    = route.query.nama_bulan || `Bulan ${bulan}`

const loading = ref(false)
const data    = ref([])

// ── EXPAND STATE ──
const expandMode   = ref(false)
const mode2Data    = reactive({})
const mode2Loading = ref(false)
const mode2Fetched = ref(false)

async function fetchMode2() {
  mode2Loading.value = true
  try {
    const params = { idclient: authStore.id_client, tahun, bulan, id_supplier: idSupplier, mode: 2 }
    if (authStore.id_lokasi) params.id_lokasi = authStore.id_lokasi
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_rekap_supplier_detail`,
      { params }
    )
    ;(res.data?.data || []).forEach(doc => {
      mode2Data[doc.no_penerimaan] = doc.items || []
    })
    mode2Fetched.value = true
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail item', life: 3000 })
  } finally {
    mode2Loading.value = false
  }
}

async function toggleExpandMode() {
  expandMode.value = !expandMode.value
  if (expandMode.value && !mode2Fetched.value) {
    await fetchMode2()
  }
}

// ── FILTER STATE ──
const colFilter = ref({
  no_penerimaan: '',
  no_faktur:     '',
  status_lunas:  '',
})

// ── SORT STATE ──
const colSort = ref({ field: 'tanggal', dir: 'asc' })

function toggleSort(field) {
  if (colSort.value.field === field) {
    colSort.value.dir = colSort.value.dir === 'asc' ? 'desc' : 'asc'
  } else {
    colSort.value = { field, dir: 'asc' }
  }
}

function isSortActive(field) { return colSort.value.field === field }

function sortIcon(field) {
  if (!isSortActive(field)) return 'pi pi-sort-alt'
  return colSort.value.dir === 'asc' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'
}

const hasActiveFilter = computed(() => {
  const f = colFilter.value
  const sortChanged = colSort.value.field !== 'tanggal' || colSort.value.dir !== 'asc'
  return !!(f.no_penerimaan || f.no_faktur || f.status_lunas || sortChanged)
})

function resetFilter() {
  colFilter.value = { no_penerimaan: '', no_faktur: '', status_lunas: '' }
  colSort.value   = { field: 'tanggal', dir: 'asc' }
}

// ── FILTERED & SORTED ──
const filteredData = computed(() => {
  const f = colFilter.value
  let result = data.value.filter(r => {
    if (f.no_penerimaan && !r.no_penerimaan?.toLowerCase().includes(f.no_penerimaan.toLowerCase())) return false
    if (f.no_faktur     && !r.no_faktur?.toLowerCase().includes(f.no_faktur.toLowerCase()))         return false
    if (f.status_lunas === '1' && Number(r.status_lunas) !== 1) return false
    if (f.status_lunas === '0' && Number(r.status_lunas) !== 0) return false
    return true
  })

  result = [...result].sort((a, b) => {
    const { field, dir } = colSort.value
    let va, vb
    if      (field === 'tanggal')     { va = new Date(a.tanggal);    vb = new Date(b.tanggal)    }
    else if (field === 'jumlah_item') { va = Number(a.jumlah_item);  vb = Number(b.jumlah_item)  }
    else if (field === 'total_qty')   { va = Number(a.total_qty);    vb = Number(b.total_qty)    }
    else if (field === 'sub_total')   { va = Number(a.sub_total);    vb = Number(b.sub_total)    }
    else if (field === 'grand_total') { va = Number(a.grand_total);  vb = Number(b.grand_total)  }
    else return 0
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })

  return result
})

const filteredGrandTotal = computed(() => filteredData.value.reduce((s, r) => s + (Number(r.grand_total) || 0), 0))
const filteredSubTotal   = computed(() => filteredData.value.reduce((s, r) => s + (Number(r.sub_total)   || 0), 0))
const filteredTotalItem  = computed(() => filteredData.value.reduce((s, r) => s + (Number(r.jumlah_item) || 0), 0))
const filteredTotalQty   = computed(() => filteredData.value.reduce((s, r) => s + (Number(r.total_qty)   || 0), 0))

async function fetchDetail() {
  loading.value = true
  try {
    const params = { idclient: authStore.id_client, tahun, bulan, id_supplier: idSupplier }
    if (authStore.id_lokasi) params.id_lokasi = authStore.id_lokasi
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_rekap_supplier_detail`,
      { params }
    )
    data.value = res.data?.data || []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail rekap', life: 3000 })
  } finally {
    loading.value = false
  }
}

function exportExcel() {
  import('xlsx').then(xlsx => {
    const rows = []
    const withItems = expandMode.value && mode2Fetched.value

    filteredData.value.forEach((doc, i) => {
      rows.push({
        'No': i + 1,
        'No Penerimaan': doc.no_penerimaan,
        'No Faktur': doc.no_faktur || '-',
        'Tanggal': formatDate(doc.tanggal),
        'Status': Number(doc.status_lunas) === 1 ? 'Lunas' : 'Kredit',
        'Jml Item': doc.jumlah_item || 0,
        'Total Qty': doc.total_qty || 0,
        'Sub Total': Number(doc.sub_total) || 0,
        'Grand Total': Number(doc.grand_total) || 0,
        ...(withItems ? { 'Nama Barang': '', 'No Batch': '', 'Tgl Expired': '', 'Qty Item': '', 'Satuan': '', 'Harga Satuan': '', 'Diskon': '', 'Subtotal Item': '' } : {}),
      })
      if (withItems) {
        ;(mode2Data[doc.no_penerimaan] || []).forEach(item => {
          rows.push({
            'No': '', 'No Penerimaan': '', 'No Faktur': '', 'Tanggal': '', 'Status': '',
            'Jml Item': '', 'Total Qty': '', 'Sub Total': '', 'Grand Total': '',
            'Nama Barang': item.nama_barang,
            'No Batch': item.no_batch || '-',
            'Tgl Expired': formatDate(item.tgl_expired),
            'Qty Item': item.qty,
            'Satuan': item.satuan,
            'Harga Satuan': Number(item.harga_satuan) || 0,
            'Diskon': item.diskon ? `${item.diskon}%` : '-',
            'Subtotal Item': Number(item.subtotal) || 0,
          })
        })
      }
    })

    const ws = xlsx.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 4 }, { wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 8 },
      { wch: 8 }, { wch: 9 }, { wch: 14 }, { wch: 14 },
      ...(withItems ? [{ wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 7 }, { wch: 14 }] : []),
    ]
    const wb = xlsx.utils.book_new()
    const sheetName = `${namaSupplier}_${namaBulan}`.slice(0, 31)
    xlsx.utils.book_append_sheet(wb, ws, sheetName)
    xlsx.writeFile(wb, `Detail_${namaSupplier}_${namaBulan}_${tahun}.xlsx`)
  })
}

function goBack() { router.push({ name: 'RekapSupplier' }) }

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(val) {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchDetail)
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0; }

/* STAT STRIP */
.det-stat-strip { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 16px;background:#fafafa;border-bottom:1px solid #e2e8f0; }
.stat-card { display:flex;align-items:center;gap:10px; }
.stat-ico { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0; }
.stat-lbl { font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.stat-val { font-size:16px;font-weight:700;color:#1e293b;margin-top:1px; }

/* ACTION BAR */
.action-bar { display:flex;align-items:center;gap:8px;padding:6px 12px;background:#fff;border-bottom:1px solid #e2e8f0; }

/* WRAPPER */
.det-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }

/* TABLE */
.det-table { width:100%;border-collapse:collapse;font-size:12px; }
.det-table thead tr:first-child { background:#f0fdfa; }
.det-table thead tr:first-child th { padding:7px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #ccfbf1;white-space:nowrap; }
.det-table tbody tr { border-bottom:1px solid #f1f5f9; }
.det-table tbody tr:hover { background:#f8fafc; }
.det-table tbody td { padding:7px 8px;vertical-align:middle; }
.grand-row { background:#f0fdfa;border-top:2px solid #99f6e4; }
.grand-row td { padding:8px 8px;font-size:11px; }
.empty-row td { padding:28px 12px;text-align:center;color:#94a3b8;font-size:12px; }
.empty-row .pi { color:#cbd5e1;margin-right:6px; }

.row-expanded { background:#f8fffe !important; }
.row-expanded td { border-bottom:none !important; }
.item-expand-row { background:#f8fffe; }
.item-expand-row > td { border-bottom:1px solid #e2e8f0 !important; }

/* ITEM TABLE */
.item-table { width:100%;border-collapse:collapse;font-size:11px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden; }
.item-table thead tr { background:#f0fdfa; }
.item-table thead th { padding:5px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid #ccfbf1;white-space:nowrap; }
.item-table tbody tr { border-bottom:1px solid #f1f5f9; }
.item-table tbody tr:last-child { border-bottom:none; }
.item-table tbody td { padding:5px 8px;vertical-align:middle;color:#374151; }

/* FILTER ROW */
.filter-row { background:#f8fafc; }
.filter-row th { padding:4px 4px 5px !important;border-bottom:2px solid #99f6e4 !important; }
.col-input {
  width:100%;border:1px solid #d1d5db;border-radius:4px;padding:3px 6px;
  font-size:11px;font-family:inherit;color:#1e293b;background:#fff;height:26px;
}
.col-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.12); }
.col-input::placeholder { color:#b0bec5; }
.col-input-select { cursor:pointer;appearance:auto; }

/* SORT BUTTON */
.sort-btn {
  display:inline-flex;align-items:center;justify-content:center;gap:3px;
  width:100%;padding:3px 5px;border:1px solid #d1d5db;border-radius:4px;
  background:#fff;cursor:pointer;font-size:10px;color:#94a3b8;white-space:nowrap;
  font-family:inherit;transition:all .15s;height:26px;
}
.sort-btn:hover { border-color:#0d9488;color:#0d9488;background:#f0fdfa; }
.sort-btn.sort-active { background:#f0fdfa;border-color:#0d9488;color:#0d9488;font-weight:700; }
.sort-btn .pi { font-size:10px; }

/* CHIPS */
.chip-lunas  { display:inline-block;padding:1px 7px;border-radius:6px;font-size:10px;font-weight:700;background:#dcfce7;color:#166534; }
.chip-kredit { display:inline-block;padding:1px 7px;border-radius:6px;font-size:10px;font-weight:700;background:#fef3c7;color:#92400e; }
.pajak-chip  { display:inline-block;padding:1px 6px;border-radius:6px;font-size:10px;font-weight:600;background:#fef9c3;color:#854d0e; }

/* LAMPIRAN */
.lampiran-btn { display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:5px;background:#fff1f2;color:#e11d48;text-decoration:none;font-size:13px;transition:background .15s; }
.lampiran-btn:hover { background:#ffe4e6; }

.mono { font-family:inherit;font-size:12px; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
</style>
