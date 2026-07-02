<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />
    <ConfirmDialog />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <div class="pm-hero-icon"><i class="pi pi-shopping-cart"></i></div>
        <div>
          <h4 class="pm-hero-title">{{ isBRG ? 'Surat Pesanan Barang' : 'Surat Pesanan Obat-obatan' }}</h4>
          <p class="pm-hero-sub">{{ isBRG ? 'Kelola pemesanan barang ke supplier' : 'Kelola pemesanan obat ke distributor / PBF' }}</p>
        </div>
      </div>
      <Button icon="pi pi-plus" label="Buat SP Baru" class="round-button2 btn-primary-pm" @click="openForm" :disabled="loading" />
    </div>

    <!-- STAT STRIP -->
    <div class="pm-stat-strip">
      <div class="strip-stat">
        <i class="pi pi-file strip-ico" style="color:#0d9488"></i>
        <span class="strip-num" style="color:#0d9488">{{ stats.total }}</span>
        <span class="strip-lbl">Total SP</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat">
        <i class="pi pi-clock strip-ico" style="color:#0369a1"></i>
        <span class="strip-num" style="color:#0369a1">{{ stats.aktif }}</span>
        <span class="strip-lbl">Aktif</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat">
        <i class="pi pi-check-circle strip-ico" style="color:#16a34a"></i>
        <span class="strip-num" style="color:#16a34a">{{ stats.selesai }}</span>
        <span class="strip-lbl">Selesai</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat">
        <i class="pi pi-wallet strip-ico" style="color:#9333ea"></i>
        <span class="strip-num" style="color:#9333ea;font-size:14px">{{ formatCurrencyCompact(stats.grandTotal) }}</span>
        <span class="strip-lbl">Grand Total</span>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pm-filter-bar">
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-search"></i>Cari</span>
        <InputText v-model="localSearch" placeholder="No SP, supplier..." style="min-width:180px" :disabled="loading" @keyup.enter="doSearch" />
      </div>
      <div class="filter-vdiv"></div>
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-circle"></i>Status</span>
        <Select
          v-model="filters.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          style="min-width:140px"
          @change="fetchSP"
          :disabled="loading"
        />
      </div>
      <div v-if="!isBRG" class="filter-vdiv"></div>
      <div v-if="!isBRG" class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-tag"></i>Jenis SP</span>
        <Select
          v-model="filters.jenis_sp"
          :options="jenisSPFilterOptions"
          optionLabel="label"
          optionValue="value"
          style="min-width:130px"
          @change="() => { filters.currentPage = 1; fetchSP() }"
          :disabled="loading"
        />
      </div>
      <div class="filter-vdiv"></div>
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-calendar"></i>Dari</span>
        <input type="date" v-model="filters.start_date" class="pm-date-input" :disabled="loading" />
      </div>
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-calendar"></i>Sampai</span>
        <input type="date" v-model="filters.end_date" class="pm-date-input" :disabled="loading" />
      </div>
      <div class="pm-filter-actions ms-auto">
        <Button icon="pi pi-search" label="Cari" class="round-button2 btn-primary-pm" :loading="loading" @click="doSearch" />
        <Button icon="pi pi-refresh" severity="secondary" outlined class="round-button2" v-tooltip.top="'Reset'" @click="resetFilter" :disabled="loading" />
      </div>
    </div>

    <!-- TABLE -->
    <div class="pm-table-wrap">
      <DataTable
        :value="displayList"
        :loading="loading"
        :lazy="true"
        :paginator="true"
        :rows="filters.pageSize"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="[10, 20, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="{first}-{last} dari {totalRecords}"
        @page="onPageChange"
        showGridlines
        rowHover
        scrollable
        scrollHeight="65vh"
        size="small"
        class="pm-datatable"
      >
        <template #empty>
          <div class="pm-empty">
            <div class="pm-empty-icon"><i class="pi pi-shopping-cart"></i></div>
            <p class="pm-empty-title">Belum ada surat pesanan</p>
            <small>Klik "Buat SP Baru" untuk membuat surat pesanan baru.</small>
          </div>
        </template>

        <Column header="#" style="width:40px;text-align:center">
          <template #body="{ index }">
            <span style="font-size:11px;color:#94a3b8">{{ (filters.currentPage - 1) * filters.pageSize + index + 1 }}</span>
          </template>
        </Column>

        <Column header="NO SP" style="min-width:160px">
          <template #body="{ data }">
            <span class="mono fw-semibold" style="color:#0d9488;font-size:12px">{{ data.no_sp }}</span>
          </template>
        </Column>

        <Column header="SUPPLIER" style="min-width:180px">
          <template #body="{ data }">
            <div style="font-size:12px;font-weight:600;color:#1e293b">{{ data.nama_supplier }}</div>
          </template>
        </Column>

        <Column header="JENIS SP" style="min-width:120px">
          <template #body="{ data }">
            <span style="font-size:12px">{{ labelJenisSP(data.jenis_sp) }}</span>
          </template>
        </Column>

        <Column header="TANGGAL" style="min-width:110px">
          <template #body="{ data }">
            <span class="mono">{{ formatDate(data.tanggal_sp) }}</span>
          </template>
        </Column>

        <Column header="JUMLAH ITEM" style="width:70px;text-align:center">
          <template #body="{ data }">
            <span class="mono" style="font-size:12px;color:#64748b">{{ data.jumlah_item ?? '-' }}</span>
          </template>
        </Column>

        <Column header="GRAND TOTAL" style="min-width:130px">
          <template #body="{ data }">
            <span class="mono" style="font-size:12px">{{ data.grand_total ? formatCurrency(data.grand_total) : '-' }}</span>
          </template>
        </Column>

        <Column header="STATUS" style="min-width:110px">
          <template #body="{ data }">
            <span class="status-badge" :class="`status-${(data.status_label || '').toLowerCase().replace(/\s+/g, '-')}`">
              {{ data.persentase != null ? `${data.status_label} ${Math.round(data.persentase)}%` : data.status_label }}
            </span>
          </template>
        </Column>

        <Column header="AKSI" style="width:130px">
          <template #body="{ data }">
            <div class="action-btns">
              <Button
                icon="pi pi-eye"
                size="small" text rounded severity="info"
                v-tooltip.top="'Detail / Edit SP'"
                @click="openDetail(data)"
              />
              <Button
                icon="pi pi-print"
                size="small" text rounded severity="secondary"
                v-tooltip.top="'Cetak Surat Pesanan'"
                @click="cetakSP(data)"
              />
              <Button
                v-if="data.status_label?.toLowerCase() === 'draft'"
                icon="pi pi-pen-to-square"
                size="small" text rounded severity="warning"
                v-tooltip.top="isBRG ? 'Otorisasi PJ' : 'Otorisasi Apoteker'"
                @click="openOtorisasi(data)"
              />
              <Button
                v-if="data.status_label?.toLowerCase() === 'siap dikirim'"
                icon="pi pi-send"
                size="small" text rounded severity="success"
                v-tooltip.top="'Kirim SP ke Supplier'"
                @click="kirimSP(data)"
              />
              <Button
                v-if="['draft','siap dikirim'].includes(data.status_label?.toLowerCase())"
                icon="pi pi-trash"
                size="small" text rounded severity="danger"
                v-tooltip.top="'Hapus SP'"
                @click="hapusSP(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>


    <!-- TTD DIGITAL APOTEKER -->
    <ttdUser
      v-model:showFormOtorisasi="showOtorisasi"
      link_ttd="otorisasi_suratpemesanan"
      :record_id="otorisasiRow?.id_pemesanan"
      @otpVerified="onOtorisasiSuccess"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import ttdUser from '@/components/TtdDigitalComponent.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()
const router = useRouter()
const route = useRoute()

const isBRG = computed(() => route.query.mode === 'brg')

const loading = ref(false)
const spList = ref([])
const totalRecords = ref(0)
const localSearch = ref('')

const filters = ref({
  status: 'semua',
  jenis_sp: 'semua',
  start_date: '',
  end_date: '',
  currentPage: 1,
  pageSize: 20,
})

const statusOptions = [
  { label: 'Semua Status', value: 'semua' },
  { label: 'Draft', value: 'draft' },
  { label: 'Siap Dikirim', value: 'siap dikirim' },
  { label: 'Dikirim', value: 'dikirim' },
  { label: 'Diterima', value: 'diterima' },
  { label: 'Selesai', value: 'selesai' },
]

const jenisSPFilterOptions = computed(() => isBRG.value
  ? [{ label: 'Surat Pesanan Barang', value: 'BRG' }]
  : [
      { label: 'Semua Jenis', value: 'semua' },
      { label: 'Obat Umum', value: 'OBT' },
      { label: 'Psikotropika', value: 'PSI' },
      { label: 'Prekursor', value: 'PRE' },
      { label: 'Narkotika', value: 'NAR' },
    ]
)

const modeFilteredList = computed(() =>
  isBRG.value
    ? spList.value.filter(s => s.jenis_sp === 'BRG')
    : spList.value.filter(s => s.jenis_sp !== 'BRG')
)

const displayList = computed(() => {
  const q = localSearch.value.trim().toLowerCase()
  if (!q) return modeFilteredList.value
  return modeFilteredList.value.filter(s =>
    s.no_sp?.toLowerCase().includes(q) ||
    s.nama_supplier?.toLowerCase().includes(q)
  )
})

const stats = computed(() => ({
  total: totalRecords.value,
  aktif: modeFilteredList.value.filter(s => ['draft', 'siap dikirim', 'dikirim', 'diterima'].includes(s.status_label?.toLowerCase())).length,
  selesai: modeFilteredList.value.filter(s => s.status_label?.toLowerCase() === 'selesai').length,
  grandTotal: modeFilteredList.value.reduce((sum, s) => sum + (Number(s.grand_total) || 0), 0),
}))

function formatCurrencyCompact(val) {
  if (!val) return 'Rp 0'
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1).replace('.', ',')}M`
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1).replace('.', ',')}jt`
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function onPageChange(event) {
  filters.value.currentPage = event.page + 1
  filters.value.pageSize = event.rows
  fetchSP()
}

function doSearch() {
  filters.value.currentPage = 1
  fetchSP()
}

function openForm() {
  router.push({ name: 'PemesananBuatSP', query: { mode: isBRG.value ? 'brg' : 'obat' } })
}

function cetakSP(row) {
  const url = router.resolve({ name: 'PrintSuratPesanan', params: { id_pemesanan: row.id_pemesanan } }).href
  window.open(url, '_blank')
}

function openDetail(row) {
  router.push({ name: 'PemesananDetailSP', params: { id_pemesanan: row.id_pemesanan } })
}

function hapusSP(row) {
  confirm.require({
    message: `Hapus SP ${row.no_sp}? Tindakan ini tidak dapat dibatalkan.`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-trash',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const res = await axios.post(`${configStore.apiApotikUrl}/index.php/api/Pemesanan/hapus_pemesanan`, {
          id_pemesanan: row.id_pemesanan,
          idclient: authStore.id_client,
        })
        if (res.data?.code !== 200) {
          toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.message || 'Gagal menghapus SP', life: 3000 })
          return
        }
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'SP berhasil dihapus', life: 3000 })
        fetchSP()
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Gagal menghapus SP', life: 3000 })
      }
    },
  })
}

const showOtorisasi = ref(false)
const otorisasiRow = ref(null)

function openOtorisasi(row) {
  otorisasiRow.value = row
  showOtorisasi.value = true
}

function onOtorisasiSuccess() {
  toast.add({ severity: 'success', summary: 'Otorisasi Berhasil', detail: 'SP siap dikirim ke supplier', life: 3000 })
  fetchSP()
}

function kirimSP(row) {
  confirm.require({
    message: `Kirim SP ${row.no_sp} ke supplier? Status akan berubah menjadi Dikirim.`,
    header: 'Konfirmasi Kirim SP',
    icon: 'pi pi-send',
    rejectLabel: 'Batal',
    acceptLabel: 'Kirim',
    acceptClass: 'p-button-success',
    accept: async () => {
      try {
        const res = await axios.post(`${configStore.apiApotikUrl}/index.php/api/Pemesanan/kirim_sp`, {
          id_pemesanan: row.id_pemesanan,
          idclient: authStore.id_client,
        })
        if (res.data?.code !== 200) {
          toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.message || 'Gagal mengirim SP', life: 3000 })
          return
        }
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'SP berhasil dikirim ke supplier', life: 3000 })
        fetchSP()
        cetakSP(row)
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Gagal mengirim SP', life: 3000 })
      }
    },
  })
}

async function fetchSP() {
  loading.value = true
  try {
    const body = {
      idclient: authStore.id_client,
      page: filters.value.currentPage,
      limit: filters.value.pageSize,
    }
    if (authStore.id_lokasi) body.id_lokasi = authStore.id_lokasi
    if (filters.value.status && filters.value.status !== 'semua') body.status = filters.value.status
    if (isBRG.value) {
      body.jenis_sp = 'BRG'
    } else if (filters.value.jenis_sp && filters.value.jenis_sp !== 'semua') {
      body.jenis_sp = filters.value.jenis_sp
    }
    if (filters.value.start_date) body.start_date = filters.value.start_date
    if (filters.value.end_date) body.end_date = filters.value.end_date
    if (localSearch.value?.trim()) body.search = localSearch.value.trim()

    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/Pemesanan/get_list_pemesanan`,
      body
    )
    spList.value = res.data?.response || []
    totalRecords.value = res.data?.total ?? spList.value.length
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat daftar SP', life: 3000 })
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  localSearch.value = ''
  filters.value = { status: 'semua', jenis_sp: 'semua', start_date: '', end_date: '', currentPage: 1, pageSize: 20 }
  fetchSP()
}

const jenisSPLabel = { OBT: 'Obat Umum', PSI: 'Psikotropika', PRE: 'Prekursor', NAR: 'Narkotika', BRG: 'Barang' }
function labelJenisSP(kode) { return jenisSPLabel[kode] || kode || 'Obat Umum' }

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(val) {
  if (!val) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchSP)
</script>

<style scoped>
/* ── HERO ── */
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0;white-space:nowrap; }

/* ── STAT STRIP ── */
.pm-stat-strip { display:flex;align-items:center;gap:0;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 16px;margin-bottom:10px;flex-wrap:wrap; }
.strip-stat { display:flex;align-items:center;gap:6px;padding:4px 12px; }
.strip-ico { font-size:15px; }
.strip-num { font-size:17px;font-weight:700; }
.strip-lbl { font-size:11px;color:#64748b; }
.strip-div { width:1px;height:28px;background:#e2e8f0;margin:0 4px; }

/* ── FILTER BAR ── */
.pm-filter-bar { display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:10px;flex-wrap:wrap; }
.pm-filter-group { display:flex;align-items:center;gap:6px; }
.pm-filter-label { font-size:11px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:3px;white-space:nowrap; }
.pm-filter-actions { display:flex;align-items:center;gap:6px;padding-left:16px;border-left:1px solid #f1f5f9; }
.filter-vdiv { width:1px;height:28px;background:#e2e8f0;margin:0 4px; }
.pm-date-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;color:#1e293b;background:#fff;height:36px; }
.pm-date-input:focus { outline:none;border-color:#0d9488; }
.pm-date-input:disabled { background:#f8fafc;color:#94a3b8; }

/* ── TABLE ── */
.pm-table-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }
:deep(.pm-datatable .p-datatable-thead > tr > th) { background:#f0fdfa !important;color:#0d9488 !important;font-size:11px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.5px !important;padding:.25rem .6rem !important;white-space:nowrap; }
:deep(.pm-datatable .p-datatable-tbody > tr > td) { font-size:12px !important;padding:.03rem .5rem !important;vertical-align:middle; }
:deep(.pm-datatable .p-datatable-tbody > tr:hover > td) { background:#f0fdfa !important; }
:deep(.pm-datatable .p-paginator) { padding:6px 10px;font-size:12px;background:#fafafa;border-top:1px solid #e2e8f0; }
:deep(.pm-datatable .p-paginator .p-paginator-page.p-highlight) { background:#0d9488;border-color:#0d9488;color:#fff; }

/* ── EMPTY ── */
.pm-empty { text-align:center;padding:40px 20px;color:#94a3b8; }
.pm-empty-icon { font-size:36px;margin-bottom:10px;color:#cbd5e1; }
.pm-empty-title { font-size:13px;font-weight:600;color:#64748b;margin:0 0 4px; }

/* ── ACTION BUTTONS ── */
.action-btns { display:flex;gap:2px;align-items:center; }
:deep(.action-btns .p-button.p-button-text) { padding:0 .2rem !important;font-size:10px !important;height:1.4rem !important;min-height:unset !important;width:1.4rem !important; }

/* ── BADGES ── */
.jenis-badge { display:inline-block;padding:2px 7px;border-radius:10px;font-size:10.5px;font-weight:700;letter-spacing:.4px;white-space:nowrap; }
.jenis-obt   { background:#dbeafe;color:#1d4ed8; }
.jenis-brg   { background:#f1f5f9;color:#475569; }
.jenis-keras { background:#fef3c7;color:#92400e; }
.jenis-psi   { background:#ede9fe;color:#6d28d9; }
.jenis-pre   { background:#fce7f3;color:#9d174d; }
.jenis-nar   { background:#fee2e2;color:#dc2626; }

.status-badge { display:inline-block;padding:2px 8px;border-radius:10px;font-size:10.5px;font-weight:700; }
.status-draft         { background:#fef9c3;color:#854d0e; }
.status-siap-dikirim  { background:#fef3c7;color:#d97706; }
.status-dikirim       { background:#dbeafe;color:#1d4ed8; }
.status-diterima      { background:#dcfce7;color:#15803d; }
.status-selesai       { background:#f1f5f9;color:#475569; }


/* ── MISC ── */
.mono { font-family:monospace;font-size:12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
</style>
