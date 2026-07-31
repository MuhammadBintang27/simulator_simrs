<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />
    <ConfirmDialog />

    <!-- HERO -->
    <div class="barang-hero mb-2">
      <div class="barang-hero-left">
        <div class="barang-hero-icon"><i class="pi pi-wrench"></i></div>
        <div>
          <h4 class="barang-hero-title">Master Jasa</h4>
          <p class="barang-hero-sub">Kelola data tarif layanan dan jasa</p>
        </div>
      </div>
      <Button v-if="isGudang" icon="pi pi-plus" label="Tambah Jasa" class="round-button2 btn-primary-barang" @click="openForm()" />
    </div>

    <!-- STAT STRIP -->
    <div class="barang-stat-strip">
      <div class="strip-stat">
        <i class="pi pi-wrench strip-ico" style="color:#b45309"></i>
        <span class="strip-num" style="color:#b45309">{{ totalBarangs }}</span>
        <span class="strip-lbl">Total Jasa</span>
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
        <label class="barang-filter-label"><i class="pi pi-search me-1"></i>CARI</label>
        <InputText v-model="localSearch" placeholder="Nama, ID jasa..." style="min-width:200px" @keydown.enter="onEnterSearch" :disabled="loading" />
      </div>
      <div class="barang-filter-group">
        <label class="barang-filter-label"><i class="pi pi-archive me-1"></i>STATUS</label>
        <Select v-model="filters.ARSIPKAN" :options="arsipOptions" optionLabel="label" optionValue="value" placeholder="Semua" style="min-width:130px" @change="onFilterChange" :disabled="loading" />
      </div>
      <div class="barang-filter-group">
        <label class="barang-filter-label"><i class="pi pi-tag me-1"></i>KATEGORI</label>
        <Select v-model="filters.KATEGORI" :options="kategoriOptions" optionLabel="label" optionValue="value" placeholder="Semua Kategori" style="min-width:160px" filter @change="onFilterChange" :disabled="loading" />
      </div>
      <div class="barang-filter-actions ms-auto">
        <Button icon="pi pi-search" label="Cari" class="round-button2 btn-primary-barang" :loading="loading" @click="onEnterSearch" />
        <Button icon="pi pi-refresh" severity="secondary" outlined class="round-button2 ms-1" v-tooltip.top="'Reset'" @click="resetFilter" :disabled="loading" />
      </div>
    </div>

    <!-- TABLE -->
    <div class="barang-table-wrap">
      <DataTable
        :value="filteredBarangs" :loading="loading" :lazy="true" :paginator="true"
        :rows="filters.pageSize" :totalRecords="totalBarangs"
        @page="onPageChange" @sort="onSortChange"
        showGridlines rowHover scrollable scrollHeight="65vh" size="small"
        :rowsPerPageOptions="[20,50,100,500,1000]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="barang-datatable"
        :sortField="filters.sortField" :sortOrder="filters.sortOrder === 'ASC' ? 1 : -1"
      >
        <template #empty>
          <div class="barang-empty">
            <div class="barang-empty-icon"><i class="pi pi-wrench"></i></div>
            <p class="barang-empty-title">Belum ada data jasa</p>
            <small>Klik "Tambah Jasa" untuk menambahkan data baru.</small>
          </div>
        </template>

        <Column header="#" style="width:45px;text-align:center">
          <template #body="{ index }">
            <span style="font-size:11px;color:#94a3b8">{{ (filters.currentPage-1)*filters.pageSize+index+1 }}</span>
          </template>
        </Column>
        <Column field="IDBARANG" header="ID JASA" style="min-width:110px" sortable>
          <template #body="{ data }"><span class="mono text-amber fw-semibold">{{ data.IDBARANG }}</span></template>
        </Column>
        <Column field="NAMA" header="NAMA" style="min-width:220px" sortable>
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
        <Column field="KATEGORI" header="KATEGORI" style="min-width:130px" sortable>
          <template #body="{ data }"><span>{{ data.KATEGORI||'-' }}</span></template>
        </Column>
        <Column field="SATUAN_KECIL" header="SATUAN" style="min-width:100px">
          <template #body="{ data }"><span>{{ data.SATUAN_KECIL||'-' }}</span></template>
        </Column>
        <Column header="HARGA JUAL" style="min-width:140px">
          <template #body="{ data }">
            <span class="mono fw-semibold" style="color:#b45309">{{ formatCurrency(data.HARGAJUAL) }}</span>
          </template>
        </Column>

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
    <BarangFormModal v-model:visible="formModal.visible" bucket="JASA" :itemId="formModal.itemId" @saved="fetchBarang" />

    <!-- DETAIL DIALOG -->
    <Dialog v-model:visible="detailDialog" :header="selectedBarang?.NAMA||'Detail Jasa'" modal :style="{width:'520px',maxWidth:'95vw'}">
      <div v-if="selectedBarang" class="detail-body">
        <div class="detail-section-title"><i class="pi pi-info-circle me-1"></i>Informasi Umum</div>
        <div class="detail-grid">
          <div class="detail-row"><span class="detail-label">ID Jasa</span><span class="detail-value mono text-amber">{{ selectedBarang.IDBARANG||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Nama</span><span class="detail-value fw-semibold">{{ selectedBarang.NAMA||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Kategori</span><span class="detail-value">{{ selectedBarang.KATEGORI||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Satuan</span><span class="detail-value">{{ selectedBarang.SATUAN_KECIL||'-' }}</span></div>
          <div class="detail-row"><span class="detail-label">Keterangan</span><span class="detail-value">{{ selectedBarang.KETERANGAN||'-' }}</span></div>
        </div>
        <div class="detail-section-title mt-3"><i class="pi pi-money-bill me-1"></i>Tarif</div>
        <div class="detail-grid">
          <div class="detail-row"><span class="detail-label">Harga Beli/Modal</span><span class="detail-value mono">{{ formatCurrency(selectedBarang.HARGABELI) }}</span></div>
          <div class="detail-row"><span class="detail-label">Harga Jual</span><span class="detail-value mono fw-semibold" style="color:#b45309">{{ formatCurrency(selectedBarang.HARGAJUAL) }}</span></div>
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
const formModal = ref({ visible: false, itemId: null })

const filters = ref({ search: '', ARSIPKAN: '0', KATEGORI: '', currentPage: 1, pageSize: 20, sortField: 'NAMA', sortOrder: 'ASC' })
const arsipOptions = [{ label: 'Semua Status', value: '' }, { label: 'Aktif', value: '0' }, { label: 'Diarsipkan', value: '1' }]
const localSearch = ref('')
const kategoriList = ref([])
const kategoriOptions = computed(() => [
  { label: 'Semua Kategori', value: '' },
  ...kategoriList.value
    .filter((k) => k.NAMA_KATEGORI?.trim())
    .map((k) => ({ label: k.NAMA_KATEGORI, value: k.NAMA_KATEGORI })),
])

const filteredBarangs = computed(() => {
  const q = localSearch.value.trim().toLowerCase()
  if (!q) return barangs.value
  return barangs.value.filter(b =>
    b.NAMA?.toLowerCase().includes(q) ||
    b.IDBARANG?.toLowerCase().includes(q) ||
    b.KATEGORI?.toLowerCase().includes(q)
  )
})

function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

async function fetchBarang() {
  loading.value = true
  try {
    const params = {
      clientId: authStore.id_client, lokasiId: authStore.id_lokasi,
      bucket: 'JASA', search: filters.value.search,
      page: filters.value.currentPage, limit: filters.value.pageSize,
      sortField: filters.value.sortField, sortOrder: filters.value.sortOrder,
    }
    if (filters.value.ARSIPKAN !== '') params.ARSIPKAN = filters.value.ARSIPKAN
    if (filters.value.KATEGORI !== '') params.KATEGORI = filters.value.KATEGORI
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_list`, { params })
    barangs.value = res.data?.response || res.data?.data || []
    const p = res.data?.metadata?.pagination
    totalBarangs.value = p?.total ?? res.data?.total ?? 0
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 })
  } finally { loading.value = false }
}

async function fetchKategoriList() {
  try {
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/kategori_list`, {
      params: { clientId: authStore.id_client, bucket: 'JASA' },
    })
    kategoriList.value = res.data?.response || res.data || []
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat daftar kategori', life: 3000 })
  }
}

function arsipkanBarang(id, nama) {
  confirm.require({
    message: `Arsipkan "${nama}"? Item tidak akan muncul di list default.`,
    header: 'Konfirmasi Arsipkan', icon: 'pi pi-inbox',
    rejectLabel: 'Batal', acceptLabel: 'Arsipkan', acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await axios.put(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_arsip/${id}`, null, { params: { clientId: authStore.id_client, lokasiId: authStore.id_lokasi } })
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jasa diarsipkan', life: 3000 })
        fetchBarang()
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengarsipkan', life: 3000 }) }
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
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jasa diaktifkan', life: 3000 })
        fetchBarang()
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengaktifkan', life: 3000 }) }
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
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jasa dihapus', life: 3000 })
        fetchBarang()
      } catch { toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus', life: 3000 }) }
    },
  })
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
  filters.value = { search: '', ARSIPKAN: '0', KATEGORI: '', currentPage: 1, pageSize: 20, sortField: 'NAMA', sortOrder: 'ASC' }
  fetchBarang()
}
function openForm(id = null) { formModal.value = { visible: true, itemId: id || null } }
function viewBarang(data) { selectedBarang.value = data; detailDialog.value = true }

onMounted(() => {
  fetchBarang()
  fetchKategoriList()
  fetchIsGudang()
})
</script>

<style scoped>
.barang-hero { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:14px 18px;background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%);border-radius:10px;color:#fff; }
.barang-hero-left { display:flex;align-items:center;gap:14px; }
.barang-hero-icon { width:44px;height:44px;border-radius:10px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff; }
.barang-hero-title { margin:0;font-size:16px;font-weight:700;color:#fbbf24;letter-spacing:.5px; }
.barang-hero-sub { margin:0;font-size:11px;color:rgba(255,255,255,.65); }
.barang-stat-strip { display:flex;align-items:center;height:40px;background:#fff;border:1px solid #e2e8f0;border-top:3px solid #b45309;border-radius:0 0 6px 6px;padding:0 6px;overflow:hidden;margin-bottom:6px; }
.strip-stat { display:flex;align-items:center;gap:5px;padding:0 14px; }
.strip-ico { font-size:13px; }
.strip-num { font-size:15px;font-weight:700; }
.strip-lbl { font-size:10.5px;color:#64748b;text-transform:uppercase;letter-spacing:.5px; }
.strip-div { width:1px;height:22px;background:#e2e8f0;flex-shrink:0; }
.barang-filter-bar { display:flex;align-items:flex-end;flex-wrap:wrap;gap:10px;padding:10px 14px;background:#fff;border:1px solid #e2e8f0;border-top:3px solid #b45309;border-radius:6px;margin-bottom:6px; }
.barang-filter-group { display:flex;flex-direction:column;gap:3px; }
.barang-filter-label { font-size:10.5px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.4px; }
.barang-filter-actions { display:flex;align-items:center; }
.barang-table-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #b45309;border-radius:6px;overflow:hidden; }
:deep(.barang-datatable .p-datatable-thead > tr > th) { background:#fffbeb !important;color:#92400e !important;font-size:11px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.5px !important;padding:.25rem .6rem !important;white-space:nowrap; }
:deep(.barang-datatable .p-datatable-tbody > tr > td) { font-size:12px !important;padding:.25rem .6rem !important;vertical-align:middle; }
:deep(.barang-datatable .p-datatable-tbody > tr:hover > td) { background:#fffbeb !important; }
:deep(.barang-datatable .p-paginator) { padding:6px 10px;font-size:12px;background:#fafafa;border-top:1px solid #e2e8f0; }
.barang-empty { text-align:center;padding:40px 20px;color:#94a3b8; }
.barang-empty-icon { font-size:36px;margin-bottom:10px;color:#cbd5e1; }
.barang-empty-title { font-size:13px;font-weight:600;color:#64748b;margin:0 0 4px; }
.detail-body { padding:0 2px; }
.detail-section-title { font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#92400e;padding:4px 0;border-bottom:1px solid #fde68a;margin-bottom:8px; }
.detail-grid { display:flex;flex-direction:column;gap:4px; }
.detail-row { display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:baseline; }
.detail-label { font-size:11px;color:#64748b; }
.detail-value { font-size:12px;color:#1e293b;font-weight:500; }
.action-btns { display:flex;gap:2px;align-items:center; }
:deep(.action-btns .p-button.p-button-text) { padding:0 .2rem !important;font-size:10px !important;height:1.4rem !important;min-height:unset !important;width:1.4rem !important; }
.mono { font-family:monospace;font-size:12px; }
.text-amber { color:#b45309; }
.text-teal { color:#00838f; }
.btn-primary-barang { background:#b45309 !important;border-color:#b45309 !important;color:#fff !important; }
.btn-primary-barang:hover { background:#92400e !important;border-color:#92400e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
</style>
