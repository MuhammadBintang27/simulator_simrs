<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />
    <ConfirmDialog />

    <!-- HERO -->
    <div class="barang-hero mb-2">
      <div class="barang-hero-left">
        <div class="barang-hero-icon"><i class="pi pi-pen-to-square"></i></div>
        <div>
          <h4 class="barang-hero-title">Master ATK</h4>
          <p class="barang-hero-sub">Kelola data alat tulis dan perlengkapan kantor</p>
        </div>
      </div>
      <Button v-if="isGudang" icon="pi pi-plus" label="Tambah ATK" class="round-button2 btn-primary-barang" @click="openForm()" />
    </div>

    <!-- STAT STRIP -->
    <div class="barang-stat-strip">
      <div class="strip-stat">
        <i class="pi pi-pen-to-square strip-ico" style="color:#166534"></i>
        <span class="strip-num" style="color:#166534">{{ totalBarangs }}</span>
        <span class="strip-lbl">Total ATK</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat">
        <i class="pi pi-eye strip-ico" style="color:#475569"></i>
        <span class="strip-num" style="color:#475569">{{ filteredBarangs.length }}</span>
        <span class="strip-lbl">Ditampilkan</span>
      </div>
      <template v-if="filters.search">
        <div class="strip-div"></div>
        <div class="strip-stat">
          <i class="pi pi-filter strip-ico" style="color:#b45309"></i>
          <span class="strip-lbl" style="color:#b45309;font-weight:600">Filter aktif</span>
        </div>
      </template>
    </div>

    <!-- FILTER BAR -->
    <div class="barang-filter-bar">
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-search"></i>Cari</span>
        <InputText v-model="localSearch" placeholder="Nama, merek, ID barang..." style="min-width:200px" @keydown.enter="onEnterSearch" :disabled="loading" />
      </div>
      <div class="filter-vdiv"></div>
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-circle"></i>Status</span>
        <Select v-model="filters.ARSIPKAN" :options="arsipOptions" optionLabel="label" optionValue="value" placeholder="Semua" style="min-width:130px" @change="onFilterChange" :disabled="loading" />
      </div>
      <div class="filter-vdiv"></div>
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-sliders-h"></i>Tampilan</span>
        <div class="filter-chip-row">
          <button type="button" class="filter-chip" :class="{ active: expandAll }" @click="expandAll = !expandAll; onToggleExpand()" :disabled="loading">
            <i class="pi pi-list"></i>Expand Semua
          </button>
          <button type="button" class="filter-chip" :class="{ 'active-warn': showBelowMin }" @click="showBelowMin = !showBelowMin; filters.currentPage = 1; fetchBarang()" :disabled="loading">
            <i class="pi pi-exclamation-triangle"></i>Stok Min
          </button>
        </div>
      </div>
      <div class="barang-filter-actions ms-auto">
        <Button icon="pi pi-search" label="Cari" class="round-button2 btn-primary-barang" :loading="loading" @click="onEnterSearch" />
        <Button icon="pi pi-refresh" severity="secondary" outlined class="round-button2" v-tooltip.top="'Reset'" @click="resetFilter" :disabled="loading" />
        <Button icon="pi pi-file-excel" severity="success" outlined class="round-button2" v-tooltip.top="'Export Excel'" @click="exportExcel" :disabled="loading" />
      </div>
    </div>

    <!-- TABLE -->
    <div class="barang-table-wrap">
      <DataTable
        :value="filteredBarangs" :loading="loading" :lazy="true" :paginator="true"
        :rows="filters.pageSize" :totalRecords="totalBarangs"
        @page="onPageChange" @sort="onSortChange"
        @row-expand="onRowExpand" v-model:expandedRows="expandedRows"
        showGridlines rowHover scrollable scrollHeight="65vh" size="small"
        :rowsPerPageOptions="[20,50,100,500,1000]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="barang-datatable"
        :sortField="filters.sortField" :sortOrder="filters.sortOrder === 'ASC' ? 1 : -1"
      >
        <template #empty>
          <div class="barang-empty">
            <div class="barang-empty-icon"><i class="pi pi-pen-to-square"></i></div>
            <p class="barang-empty-title">Belum ada data ATK</p>
            <small>Klik "Tambah ATK" untuk menambahkan data baru.</small>
          </div>
        </template>

        <Column expander style="width:40px" />
        <Column header="#" style="width:45px;text-align:center">
          <template #body="{ index }">
            <span style="font-size:11px;color:#94a3b8">{{ (filters.currentPage-1)*filters.pageSize+index+1 }}</span>
          </template>
        </Column>
        <Column field="IDBARANG" header="ID BARANG" style="min-width:110px">
          <template #body="{ data }"><span class="mono fw-semibold">{{ data.IDBARANG }}</span></template>
        </Column>
        <Column field="NAMA" header="NAMA" style="min-width:200px" sortable>
          <template #body="{ data }">
            <div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:12px;font-weight:600;color:#1e293b">{{ data.NAMA || '(Belum ada nama)' }}</span>
                <Tag v-if="data.ARSIPKAN==='1'" value="Diarsipkan" severity="secondary" style="font-size:9px;padding:1px 5px" />
              </div>
              <div v-if="data.MEREK" style="font-size:10px;color:#94a3b8">{{ data.MEREK }}</div>
            </div>
          </template>
        </Column>
        <Column field="KATEGORI" header="KATEGORI" style="min-width:120px" sortable>
          <template #body="{ data }"><span>{{ data.KATEGORI||'-' }}</span></template>
        </Column>
        <Column field="TOTAL_STOCK" header="STOK" style="min-width:80px;text-align:right" sortable>
          <template #body="{ data }">
            <div style="display:inline-flex;align-items:center;gap:3px;justify-content:flex-end">
              <span class="mono fw-semibold">{{ data.TOTAL_STOCK??'-' }}</span>
              <i v-if="data.is_below_minimum" class="pi pi-exclamation-triangle" style="color:#dc2626;font-size:10px" v-tooltip.top="'Stok di bawah minimum'"></i>
            </div>
          </template>
        </Column>
        <Column field="TOTAL_PERSEDIAAN" header="PERSEDIAAN" style="min-width:130px;text-align:right" sortable>
          <template #body="{ data }">
            <span class="mono">{{ data.TOTAL_PERSEDIAAN != null ? formatCurrency(data.TOTAL_PERSEDIAAN) : '-' }}</span>
          </template>
        </Column>
        <Column header="SATUAN" style="min-width:150px">
          <template #body="{ data }">
            <span>
              {{ data.SATUAN_KECIL||'-' }}
              <span v-if="data.SATUAN_SEDANG" style="color:#6b7280"> / {{ data.SATUAN_SEDANG }}</span>
              <span v-if="data.SATUAN_BESAR" style="color:#6b7280"> / {{ data.SATUAN_BESAR }}</span>
            </span>
          </template>
        </Column>

        <template #expansion="{ data }">
          <div class="batch-expansion">
            <div class="batch-expansion-header">
              <i class="pi pi-list me-1"></i>Detail Batch — <strong>{{ data.NAMA }}</strong>
              <span style="color:#94a3b8;font-weight:400"> ({{ data.IDBARANG }})</span>
            </div>
            <div v-if="batchLoading[data.ID]" class="batch-loading"><i class="pi pi-spin pi-spinner me-2"></i>Memuat batch...</div>
            <div v-else-if="!batchData[data.ID]||batchData[data.ID].length===0" class="batch-empty"><i class="pi pi-inbox me-1"></i>Tidak ada data batch di lokasi ini.</div>
            <table v-else class="batch-table">
              <thead><tr>
                <th>SUB BARCODE</th>
                <th style="text-align:right">QTY</th><th style="text-align:right">HARGA BELI</th>
                <th style="text-align:right">PERSEDIAAN</th>
                <th>BATCH / NO.LOT</th><th>EXPIRED</th><th>STATUS</th><th>AKSI</th>
              </tr></thead>
              <tbody>
                <tr v-for="batch in batchData[data.ID]" :key="batch.ID" :class="{'batch-row-arsip':batch.ARSIPKAN == 1}">
                  <td class="mono">{{ batch.SUB_BARCODE }}</td>
                  <td style="text-align:right" class="mono fw-semibold">{{ batch.QTY }}</td>
                  <td style="text-align:right" class="mono">{{ formatCurrency(batch.HARGA) }}</td>
                  <td style="text-align:right" class="mono">{{ batch.PERSEDIAAN != null ? formatCurrency(batch.PERSEDIAAN) : '-' }}</td>
                  <td class="mono">{{ batch.BATCH_NUMBER||'-' }}</td>
                  <td><span v-if="batch.USE_EXP==='1'&&batch.TGL_EXPIRED" class="mono">{{ formatDate(batch.TGL_EXPIRED) }}</span><span v-else style="color:#94a3b8">-</span></td>
                  <td>
                    <Tag v-if="batch.ARSIPKAN == 1" value="Diarsipkan" severity="secondary" style="font-size:9px;padding:1px 5px" />
                    <Tag v-else value="Aktif" severity="success" style="font-size:9px;padding:1px 5px" />
                  </td>
                  <td>
                    <Button v-if="batch.ARSIPKAN != 1" icon="pi pi-inbox" size="small" text rounded severity="warning" v-tooltip.top="'Arsipkan Batch'" @click="arsipkanBatch(batch.ID, batch.BATCH_NUMBER || batch.SUB_BARCODE, data.ID)" />
                    <Button v-else icon="pi pi-check-circle" size="small" text rounded severity="success" v-tooltip.top="'Aktifkan Batch'" @click="aktifkanBatch(batch.ID, batch.BATCH_NUMBER || batch.SUB_BARCODE, data.ID)" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <Column header="AKSI" frozen alignFrozen="right" style="min-width:100px">
          <template #body="{ data }">
            <div class="action-btns">
              <Button icon="pi pi-eye" size="small" text rounded severity="info" v-tooltip.top="'Detail'" @click="viewBarang(data)" />
              <Button icon="pi pi-pencil" size="small" text rounded severity="warn" v-tooltip.top="'Edit'" @click="openForm(data.ID)" />
              <Button v-if="data.ARSIPKAN !== '1'" icon="pi pi-inbox" size="small" text rounded severity="warning" v-tooltip.top="'Arsipkan'" @click="arsipkanBarang(data.ID, data.NAMA)" />
              <Button v-else icon="pi pi-check-circle" size="small" text rounded severity="success" v-tooltip.top="'Aktifkan'" @click="aktifkanBarang(data.ID, data.NAMA)" />
              <Button icon="pi pi-trash" size="small" text rounded severity="danger" v-tooltip.top="'Hapus'" @click="deleteBarang(data.ID, data.NAMA)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- FORM MODAL -->
    <BarangFormModal v-model:visible="formModal.visible" bucket="ATK" :itemId="formModal.itemId" @saved="fetchBarang" />

    <!-- DETAIL DIALOG -->
    <Dialog v-model:visible="detailDialog" :header="selectedBarang?.NAMA||'Detail ATK'" modal :style="{width:'580px',maxWidth:'95vw'}">
      <div v-if="selectedBarang" class="detail-body">
        <div class="detail-section-title"><i class="pi pi-info-circle me-1"></i>Informasi Umum</div>
        <div class="detail-grid">
          <div class="detail-row"><span class="detail-label">ID Barang</span><span class="detail-value mono text-teal">{{ selectedBarang.IDBARANG||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Nama</span><span class="detail-value fw-semibold">{{ selectedBarang.NAMA||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Merek</span><span class="detail-value">{{ selectedBarang.MEREK||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Kategori</span><span class="detail-value">{{ selectedBarang.KATEGORI||'-' }}</span></div>
        </div>
        <div class="detail-section-title mt-3"><i class="pi pi-box me-1"></i>Satuan &amp; Konversi</div>
        <div class="detail-grid">
          <div class="detail-row"><span class="detail-label">Satuan Kecil</span><span class="detail-value">{{ selectedBarang.SATUAN_KECIL||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Satuan Sedang</span><span class="detail-value">{{ selectedBarang.SATUAN_SEDANG||'-' }}<span v-if="selectedBarang.KONVERSI_SEDANG" style="color:#6b7280"> (1={{ selectedBarang.KONVERSI_SEDANG }} {{ selectedBarang.SATUAN_KECIL }})</span></span></div>
          <div class="detail-row"><span class="detail-label">Satuan Besar</span><span class="detail-value">{{ selectedBarang.SATUAN_BESAR||'-' }}<span v-if="selectedBarang.KONVERSI_BESAR" style="color:#6b7280"> (1={{ selectedBarang.KONVERSI_BESAR }} {{ selectedBarang.SATUAN_KECIL }})</span></span></div>
        </div>
      </div>
      <template #footer>
        <Button label="Edit" icon="pi pi-pencil" class="btn-primary-barang round-button2" @click="openForm(selectedBarang?.ID); detailDialog=false" />
        <Button label="Tutup" icon="pi pi-times" severity="secondary" outlined class="round-button2" @click="detailDialog=false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import BarangFormModal from './BarangFormModal.vue'
import { useLokasiGudang } from '@/composables/useLokasiGudang'

const configStore = useConfigStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()
const { isGudang, fetchIsGudang } = useLokasiGudang()

const loading = ref(false)
const barangs = ref([])
const totalBarangs = ref(0)
const detailDialog = ref(false)
const selectedBarang = ref(null)
const expandedRows = ref([])
const batchData = ref({})
const batchLoading = ref({})
const formModal = ref({ visible: false, itemId: null })
const expandAll = ref(false)
const expandMode = ref(1)
const showBelowMin = ref(false)

const filters = ref({ search: '', ARSIPKAN: '0', currentPage: 1, pageSize: 20, sortField: 'NAMA', sortOrder: 'ASC' })
const arsipOptions = [{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '0' }, { label: 'Diarsipkan', value: '1' }]
const localSearch = ref('')

const filteredBarangs = computed(() => {
  const q = localSearch.value.trim().toLowerCase()
  if (!q) return barangs.value
  return barangs.value.filter(b =>
    b.NAMA?.toLowerCase().includes(q) ||
    b.IDBARANG?.toLowerCase().includes(q) ||
    b.KATEGORI?.toLowerCase().includes(q)
  )
})

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

async function fetchBarang() {
  loading.value = true
  try {
    let url, params
    if (showBelowMin.value) {
      url = `${configStore.apiApotikUrl}/index.php/api/inventory/barang_stok_minimum`
      params = {
        clientId: authStore.id_client, lokasiId: authStore.id_lokasi,
        bucket: 'ATK', search: filters.value.search,
        page: filters.value.currentPage, limit: filters.value.pageSize,
      }
    } else {
      url = `${configStore.apiApotikUrl}/index.php/api/inventory/barang_list`
      params = {
        clientId: authStore.id_client, lokasiId: authStore.id_lokasi,
        bucket: 'ATK', mode: expandMode.value,
        search: filters.value.search,
        page: filters.value.currentPage, limit: filters.value.pageSize,
        sortField: filters.value.sortField, sortOrder: filters.value.sortOrder,
      }
      if (filters.value.ARSIPKAN !== '') params.ARSIPKAN = filters.value.ARSIPKAN
    }
    const res = await axios.get(url, { params })
    barangs.value = res.data?.response || res.data?.data || []
    const p = res.data?.metadata?.pagination
    totalBarangs.value = p?.total ?? res.data?.total ?? 0

    if (expandMode.value === 2) {
      barangs.value.forEach((b) => { if (b.batches) batchData.value[b.ID] = b.batches })
      expandedRows.value = [...barangs.value]
    } else {
      expandedRows.value = []
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 })
  } finally { loading.value = false }
}

async function fetchBatchDetail(id) {
  if (batchData.value[id]) return
  batchLoading.value[id] = true
  try {
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_stock_detail/${id}`, {
      params: { clientId: authStore.id_client, lokasiId: authStore.id_lokasi, ...(filters.value.ARSIPKAN !== '' ? { ARSIPKAN: filters.value.ARSIPKAN } : {}) },
    })
    batchData.value[id] = res.data?.response || []
  } catch { batchData.value[id] = [] }
  finally { batchLoading.value[id] = false }
}

function onRowExpand(event) { fetchBatchDetail(event.data.ID) }

function arsipkanBarang(id, nama) {
  confirm.require({
    message: `Arsipkan "${nama}"? Item tidak akan muncul di list default.`,
    header: 'Konfirmasi Arsipkan', icon: 'pi pi-inbox',
    rejectLabel: 'Batal', acceptLabel: 'Arsipkan', acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await axios.put(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_arsip/${id}`, null, { params: { clientId: authStore.id_client, lokasiId: authStore.id_lokasi } })
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Barang diarsipkan', life: 3000 })
        fetchBarang()
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengarsipkan', life: 3000 }) }
    },
  })
}

function arsipkanBatch(batchId, label, itemId) {
  confirm.require({
    message: `Arsipkan batch "${label || batchId}"?`,
    header: 'Konfirmasi Arsipkan Batch', icon: 'pi pi-inbox',
    rejectLabel: 'Batal', acceptLabel: 'Arsipkan', acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await axios.put(`${configStore.apiApotikUrl}/index.php/api/inventory/batch_arsip/${batchId}`, null, { params: { clientId: authStore.id_client } })
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Batch diarsipkan', life: 3000 })
        delete batchData.value[itemId]
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengarsipkan batch', life: 3000 }) }
    },
  })
}

function aktifkanBarang(id, nama) {
  confirm.require({
    message: `Aktifkan kembali "${nama}"? Master barang akan diaktifkan (batch tidak ikut otomatis).`,
    header: 'Konfirmasi Aktifkan', icon: 'pi pi-check-circle',
    rejectLabel: 'Batal', acceptLabel: 'Aktifkan', acceptClass: 'p-button-success',
    accept: async () => {
      try {
        await axios.put(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_aktif/${id}`, null, { params: { clientId: authStore.id_client } })
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Barang diaktifkan', life: 3000 })
        fetchBarang()
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengaktifkan', life: 3000 }) }
    },
  })
}

function aktifkanBatch(batchId, label, itemId) {
  confirm.require({
    message: `Aktifkan batch "${label || batchId}"?`,
    header: 'Konfirmasi Aktifkan Batch', icon: 'pi pi-check-circle',
    rejectLabel: 'Batal', acceptLabel: 'Aktifkan', acceptClass: 'p-button-success',
    accept: async () => {
      try {
        await axios.put(`${configStore.apiApotikUrl}/index.php/api/inventory/batch_aktif/${batchId}`, null, { params: { clientId: authStore.id_client } })
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Batch diaktifkan', life: 3000 })
        delete batchData.value[itemId]
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengaktifkan batch', life: 3000 }) }
    },
  })
}

function deleteBarang(id, nama) {
  confirm.require({
    message: `Hapus "${nama}"? Data akan ditandai sebagai dihapus.`,
    header: 'Konfirmasi Hapus', icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal', acceptLabel: 'Hapus', acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_delete/${id}`, { params: { clientId: authStore.id_client } })
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Barang dihapus', life: 3000 })
        fetchBarang()
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus', life: 3000 }) }
    },
  })
}

function onToggleExpand() {
  expandMode.value = expandAll.value ? 2 : 1
  filters.value.currentPage = 1
  if (!expandAll.value) { expandedRows.value = []; batchData.value = {} }
  fetchBarang()
}
function onEnterSearch() {
  filters.value.search = localSearch.value
  filters.value.currentPage = 1
  fetchBarang()
}
function onFilterChange() { filters.value.currentPage = 1; fetchBarang() }
function onPageChange(e) { filters.value.currentPage = e.page + 1; filters.value.pageSize = e.rows; fetchBarang() }
function onSortChange(e) { filters.value.sortField = e.sortField; filters.value.sortOrder = e.sortOrder === 1 ? 'ASC' : 'DESC'; filters.value.currentPage = 1; fetchBarang() }
function resetFilter() {
  localSearch.value = ''
  expandAll.value = false; expandMode.value = 1; showBelowMin.value = false; expandedRows.value = []; batchData.value = {}
  filters.value = { search: '', ARSIPKAN: '0', currentPage: 1, pageSize: 20, sortField: 'NAMA', sortOrder: 'ASC' }
  fetchBarang()
}
function openForm(id = null) { formModal.value = { visible: true, itemId: id || null } }
function viewBarang(data) { selectedBarang.value = data; detailDialog.value = true }

function exportExcel() {
  import('xlsx').then((xlsx) => {
    const rows = barangs.value.map(d => ({
      'ID BARANG': d.IDBARANG,
      'NAMA': d.NAMA,
      'KATEGORI': d.KATEGORI,
      'STOK': d.TOTAL_STOCK,
      'PERSEDIAAN': d.TOTAL_PERSEDIAAN,
      'SATUAN': d.SATUAN,
      'MEREK': d.GROUPING,
    }))
    const ws = xlsx.utils.json_to_sheet(rows)
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'ATK')
    xlsx.writeFile(wb, 'ATK.xlsx')
  })
}

onMounted(() => {
  fetchBarang()
  fetchIsGudang()
})
</script>

<style scoped>
.barang-hero { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:14px 18px;background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%);border-radius:10px;color:#fff; }
.barang-hero-left { display:flex;align-items:center;gap:14px; }
.barang-hero-icon { width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff; }
.barang-hero-title { margin:0;font-size:16px;font-weight:700;color:#4ade80;letter-spacing:.5px; }
.barang-hero-sub { margin:0;font-size:11px;color:rgba(255,255,255,.65); }
.barang-stat-strip { display:flex;align-items:center;height:40px;background:#fff;border:1px solid #e2e8f0;border-top:3px solid #166534;border-radius:0 0 6px 6px;padding:0 6px;overflow:hidden;margin-bottom:6px; }
.strip-stat { display:flex;align-items:center;gap:5px;padding:0 14px; }
.strip-ico { font-size:13px; }
.strip-num { font-size:15px;font-weight:700; }
.strip-lbl { font-size:10.5px;color:#64748b;text-transform:uppercase;letter-spacing:.5px; }
.strip-div { width:1px;height:22px;background:#e2e8f0;flex-shrink:0; }
.barang-filter-bar { display:flex;align-items:center;flex-wrap:wrap;gap:0;padding:10px 16px;background:#fff;border:1px solid #e2e8f0;border-top:3px solid #166534;border-radius:8px;margin-bottom:6px;box-shadow:0 1px 4px rgba(0,0,0,.05); }
.barang-filter-group { display:flex;flex-direction:column;gap:4px;padding:0 16px; }
.barang-filter-group:first-child { padding-left:0; }
.barang-filter-label { font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.7px;display:flex;align-items:center;gap:4px;margin-bottom:1px; }
.barang-filter-label i { color:#166534;font-size:9px; }
.filter-vdiv { width:1px;height:46px;background:#f1f5f9;flex-shrink:0;align-self:center; }
.filter-chip-row { display:flex;gap:5px;align-items:center; }
.filter-chip { display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;border:1.5px solid #e2e8f0;background:#f8fafc;font-size:11px;color:#64748b;cursor:pointer;font-weight:500;transition:background .15s,border-color .15s,color .15s;user-select:none;line-height:1.5;white-space:nowrap;outline:none; }
.filter-chip i { font-size:10px; }
.filter-chip:hover:not(:disabled) { border-color:#bbf7d0;background:#f0fdf4;color:#166534; }
.filter-chip.active { border-color:#166534 !important;background:#dcfce7 !important;color:#166534 !important;font-weight:600 !important; }
.filter-chip.active-warn { border-color:#dc2626 !important;background:#fef2f2 !important;color:#dc2626 !important;font-weight:600 !important; }
.filter-chip:disabled { opacity:.45;cursor:not-allowed; }
.barang-filter-actions { display:flex;align-items:center;gap:6px;padding-left:16px;border-left:1px solid #f1f5f9; }
.barang-table-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #166534;border-radius:6px;overflow:hidden; }
:deep(.barang-datatable .p-datatable-thead > tr > th) { background:#f0fdf4 !important;color:#166534 !important;font-size:11px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.5px !important;padding:.25rem .6rem !important;white-space:nowrap; }
:deep(.barang-datatable .p-datatable-tbody > tr > td) { font-size:12px !important;padding:.03rem .5rem !important;vertical-align:middle; }
:deep(.barang-datatable .p-datatable-tbody > tr:hover > td) { background:#f0fdf4 !important; }
:deep(.barang-datatable .p-paginator) { padding:6px 10px;font-size:12px;background:#fafafa;border-top:1px solid #e2e8f0; }
.barang-empty { text-align:center;padding:40px 20px;color:#94a3b8; }
.barang-empty-icon { font-size:36px;margin-bottom:10px;color:#cbd5e1; }
.barang-empty-title { font-size:13px;font-weight:600;color:#64748b;margin:0 0 4px; }
.detail-body { padding:0 2px; }
.detail-section-title { font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#166534;padding:4px 0;border-bottom:1px solid #bbf7d0;margin-bottom:8px; }
.detail-grid { display:flex;flex-direction:column;gap:4px; }
.detail-row { display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:baseline; }
.detail-label { font-size:11px;color:#64748b; }
.detail-value { font-size:12px;color:#1e293b;font-weight:500; }
.action-btns { display:flex;gap:2px;align-items:center; }
:deep(.action-btns .p-button.p-button-text),
:deep(.batch-table .p-button.p-button-text) { padding:0 .2rem !important;font-size:10px !important;height:1.4rem !important;min-height:unset !important;width:1.4rem !important; }
.mono { font-family:monospace;font-size:12px; }
.text-teal { color:#00838f; }
.btn-primary-barang { background:#166534 !important;border-color:#166534 !important;color:#fff !important; }
.btn-primary-barang:hover { background:#15803d !important;border-color:#15803d !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
.batch-expansion { padding:10px 16px;background:#f8fafc;border-top:2px dashed #e2e8f0; }
.batch-expansion-header { font-size:11.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px; }
.batch-loading,.batch-empty { font-size:12px;color:#94a3b8;padding:10px 0; }
.batch-table { width:100%;border-collapse:collapse;font-size:12px; }
.batch-table thead tr { background:#dcfce7; }
.batch-table thead th { padding:4px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;border-bottom:1px solid #bbf7d0; }
.batch-table tbody tr { border-bottom:1px solid #e2e8f0; }
.batch-table tbody tr:hover { background:#f0fdf4; }
.batch-table tbody td { padding:1px 6px;vertical-align:middle; }
.batch-row-arsip { opacity:.55; }
</style>
