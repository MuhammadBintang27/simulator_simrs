<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <div class="pm-hero-icon"><i class="pi pi-inbox"></i></div>
        <div>
          <h4 class="pm-hero-title">Penerimaan Barang</h4>
          <p class="pm-hero-sub">Manajemen penerimaan dari SP &amp; langsung</p>
        </div>
      </div>
      <Button
        icon="pi pi-plus"
        label="Penerimaan Langsung"
        size="small"
        class="round-button2 btn-primary-pm"
        @click="$router.push({ name: 'PenerimaanTanpaSP' })"
      />
    </div>

    <!-- STAT STRIP -->
    <div class="pm-stat-strip">
      <div class="sum-card">
        <div class="sum-icon" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-calendar-clock"></i></div>
        <div class="sum-body">
          <div class="sum-label">Minggu Ini</div>
          <div class="sum-num" style="color:#0d9488">{{ summary.minggu_ini.jumlah }} <span class="sum-unit">transaksi</span></div>
          <div class="sum-total">{{ summary.minggu_ini.total ? formatCurrency(summary.minggu_ini.total) : 'Rp 0' }}</div>
        </div>
      </div>
      <div class="sum-card">
        <div class="sum-icon" style="background:#f5f3ff;color:#7c3aed"><i class="pi pi-calendar"></i></div>
        <div class="sum-body">
          <div class="sum-label">Bulan Ini</div>
          <div class="sum-num" style="color:#7c3aed">{{ summary.bulan_ini.jumlah }} <span class="sum-unit">transaksi</span></div>
          <div class="sum-total">{{ summary.bulan_ini.total ? formatCurrency(summary.bulan_ini.total) : 'Rp 0' }}</div>
        </div>
      </div>
      <div class="sum-card">
        <div class="sum-icon" style="background:#eff6ff;color:#1d4ed8"><i class="pi pi-chart-bar"></i></div>
        <div class="sum-body">
          <div class="sum-label">Tahun Ini</div>
          <div class="sum-num" style="color:#1d4ed8">{{ summary.tahun_ini.jumlah }} <span class="sum-unit">transaksi</span></div>
          <div class="sum-total">{{ summary.tahun_ini.total ? formatCurrency(summary.tahun_ini.total) : 'Rp 0' }}</div>
        </div>
      </div>
    </div>

    <!-- FILTER BAR -->
    <div class="pm-filter-bar">
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-search"></i>Cari</span>
        <InputText v-model="localSearch" placeholder="No SP, supplier..." style="min-width:200px" :disabled="loading" @keyup.enter="doSearch" />
      </div>
      <div class="filter-vdiv"></div>
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-tag"></i>Jenis</span>
        <Select
          v-model="filters.jenis"
          :options="jenisOptions"
          optionLabel="label"
          optionValue="value"
          style="min-width:150px"
          :disabled="loading"
          @change="doSearch"
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
        :value="list"
        :loading="loading"
        :lazy="true"
        :paginator="true"
        :rows="filters.pageSize"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="[10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
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
            <div class="pm-empty-icon"><i class="pi pi-inbox"></i></div>
            <p class="pm-empty-title">Tidak ada penerimaan ditemukan</p>
            <small>Penerimaan dari SP maupun langsung akan muncul di sini.</small>
          </div>
        </template>

        <Column header="#" style="width:40px;text-align:center">
          <template #body="{ index }">
            <span style="font-size:11px;color:#94a3b8">{{ (filters.currentPage - 1) * filters.pageSize + index + 1 }}</span>
          </template>
        </Column>

        <Column header="NO REFERENSI" style="width:140px">
          <template #body="{ data }">
            <span class="mono" style="font-size:12px;font-weight:600" :style="data.type === 'sp' ? 'color:#0f766e' : 'color:#475569'">
              {{ data.type === 'sp' ? data.no_sp : data.no_penerimaan }}
            </span>
          </template>
        </Column>

        <Column header="JENIS" style="width:80px">
          <template #body="{ data }">
            <span style="font-size:11px;color:#64748b">{{ data.type === 'sp' ? 'Dari SP' : 'Langsung' }}</span>
          </template>
        </Column>

        <Column header="SUPPLIER" style="min-width:170px">
          <template #body="{ data }">
            <div style="font-size:12px;font-weight:600;color:#1e293b">{{ data.nama_supplier }}</div>
          </template>
        </Column>

        <Column header="TANGGAL" style="width:105px">
          <template #body="{ data }">
            <span class="mono" style="font-size:11px">{{ formatDate(data.tanggal) }}</span>
          </template>
        </Column>

        <Column header="JML ITEM" style="width:90px;text-align:center">
          <template #body="{ data }">
            <span class="mono" style="font-size:12px;color:#64748b">{{ data.jumlah_penerimaan ?? '-' }}</span>
          </template>
        </Column>

        <Column header="GRAND TOTAL" style="width:130px;text-align:right">
          <template #body="{ data }">
            <span v-if="data.grand_total" class="mono" style="font-size:11px;color:#0f766e;font-weight:600">
              {{ formatCurrency(data.grand_total) }}
            </span>
            <span v-else style="color:#cbd5e1">—</span>
          </template>
        </Column>

        <Column header="STATUS" style="width:100px">
          <template #body="{ data }">
            <span class="status-badge" :class="`status-${(data.status_label || '').toLowerCase().replace(/\s+/g,'-')}`">
              {{ data.persentase != null ? `${data.status_label} ${Math.round(data.persentase)}%` : (data.status_label || '-') }}
            </span>
          </template>
        </Column>

        <Column header="AKSI" style="width:130px;text-align:center">
          <template #body="{ data }">
            <div class="action-btns">
              <!-- SP Dikirim / Diterima → Terima Barang -->
              <Button
                v-if="data.type === 'sp' && ['dikirim','diterima'].includes((data.status_label||'').toLowerCase())"
                icon="pi pi-arrow-down"
                label="Terima"
                size="small"
                class="aksi-btn aksi-dikirim"
                @click="terimaBarang(data)"
              />
              <!-- SP Selesai atau Direct (apapun statusnya) → Detail -->
              <Button
                v-if="data.type === 'direct' || (data.type === 'sp' && (data.status_label||'').toLowerCase() === 'selesai')"
                icon="pi pi-eye"
                label="Detail"
                size="small"
                class="aksi-btn aksi-selesai"
                @click="bukaDetail(data)"
              />
              <!-- Direct Selesai → Batalkan -->
              <Button
                v-if="data.type === 'direct' && (data.status_label||'').toLowerCase() === 'selesai'"
                icon="pi pi-times"
                label="Batal"
                size="small"
                class="aksi-btn aksi-batal"
                @click="konfirmasiBatal(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- DETAIL DIALOG (Direct) -->
    <Dialog
      v-model:visible="detailVisible"
      modal
      :closable="false"
      :style="{ width: '860px', maxWidth: '96vw' }"
    >
      <template #header>
        <div class="det-dialog-header">
          <div class="det-dialog-header-left">
            <div class="det-dialog-icon" :class="detailRow?.is_batal ? 'det-icon-batal' : 'det-icon-normal'">
              <i :class="detailRow?.is_batal ? 'pi pi-times-circle' : 'pi pi-inbox'"></i>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="det-dialog-no mono">{{ detailData?.header?.no_penerimaan ?? detailRow?.no_penerimaan ?? '...' }}</span>
              </div>
              <div style="font-size:11px;color:#64748b;margin-top:2px">
                {{ detailRow?.nama_supplier || '-' }} · {{ formatDate(detailRow?.tanggal) }}
              </div>
            </div>
          </div>
          <Button icon="pi pi-times" text rounded severity="secondary" @click="detailVisible = false" />
        </div>
      </template>

      <div v-if="detailLoading" style="text-align:center;padding:50px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
      </div>
      <template v-else-if="detailData">

        <!-- BANNER DIBATALKAN -->
        <div v-if="detailRow?.is_batal" class="det-batal-banner">
          <i class="pi pi-exclamation-triangle" style="font-size:15px;flex-shrink:0"></i>
          <div>
            <div style="font-weight:700;font-size:12px">Penerimaan ini telah dibatalkan</div>
            <div style="font-size:11px;margin-top:2px;opacity:.9">
              Dibatalkan oleh <strong>{{ detailRow.nama_batalkan_oleh || '-' }}</strong>
              <template v-if="detailRow.tanggal_batal"> · {{ detailRow.tanggal_batal }}</template>
            </div>
            <div v-if="detailRow.keterangan_batal || detailData?.header?.keterangan_batal" style="font-size:11px;margin-top:4px;opacity:.9">
              Keterangan: <em>{{ detailRow.keterangan_batal || detailData?.header?.keterangan_batal }}</em>
            </div>
          </div>
        </div>

        <div class="det-stat-row">
          <div class="det-stat-card">
            <div class="det-stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-calendar"></i></div>
            <div><div class="det-stat-lbl">Tanggal</div><div class="det-stat-val mono">{{ detailData.header?.tanggal_penerimaan || '-' }}</div></div>
          </div>
          <div class="det-stat-card">
            <div class="det-stat-ico" style="background:#eff6ff;color:#2563eb"><i class="pi pi-file-edit"></i></div>
            <div><div class="det-stat-lbl">No Faktur</div><div class="det-stat-val mono">{{ detailData.header?.no_faktur || '-' }}</div></div>
          </div>
          <div class="det-stat-card">
            <div class="det-stat-ico" :style="Number(detailData.header?.payment_id) === 1 ? 'background:#f0fdf4;color:#16a34a' : 'background:#fefce8;color:#ca8a04'">
              <i :class="Number(detailData.header?.payment_id) === 1 ? 'pi pi-wallet' : 'pi pi-credit-card'"></i>
            </div>
            <div><div class="det-stat-lbl">Cara Bayar</div><div class="det-stat-val">{{ Number(detailData.header?.payment_id) === 1 ? 'Tunai' : 'Kredit' }}</div></div>
          </div>
          <div class="det-stat-card">
            <div class="det-stat-ico" :style="Number(detailData.header?.status_lunas) === 1 ? 'background:#f0fdf4;color:#16a34a' : 'background:#fff7ed;color:#ea580c'">
              <i :class="Number(detailData.header?.status_lunas) === 1 ? 'pi pi-check-circle' : 'pi pi-clock'"></i>
            </div>
            <div>
              <div class="det-stat-lbl">Status Lunas</div>
              <div class="det-stat-val" :style="Number(detailData.header?.status_lunas) === 1 ? 'color:#16a34a' : 'color:#ea580c'">
                {{ Number(detailData.header?.status_lunas) === 1 ? 'Lunas' : 'Belum Lunas' }}
              </div>
            </div>
          </div>
        </div>

        <div class="det-info-grid">
          <div class="det-info-box">
            <div class="det-box-title"><i class="pi pi-building me-1"></i>SUPPLIER</div>
            <div class="det-kv"><span class="det-k">Nama</span><span class="det-v fw-semibold">{{ detailData.header?.nama_supplier || '-' }}</span></div>
            <div class="det-kv"><span class="det-k">No. Telp</span><span class="det-v mono">{{ detailData.header?.no_telp || '-' }}</span></div>
            <div v-if="Number(detailData.header?.payment_id) !== 1" class="det-kv">
              <span class="det-k">Jatuh Tempo</span><span class="det-v mono">{{ detailData.header?.jatuh_tempo || '-' }}</span>
            </div>
            <div v-if="detailData.header?.lampiran_url" class="det-kv">
              <span class="det-k">Lampiran</span>
              <a :href="detailData.header.lampiran_url" target="_blank" class="det-lampiran-link">
                <i class="pi pi-paperclip me-1"></i>Lihat Faktur
              </a>
            </div>
          </div>
          <div class="det-info-box det-total-box">
            <div class="det-box-title"><i class="pi pi-calculator me-1"></i>RINGKASAN TOTAL</div>
            <div class="det-kv"><span class="det-k">Pajak</span><span class="det-v">{{ detailData.header?.PAJAK ?? '-' }}%</span></div>
            <div class="det-kv"><span class="det-k">Sub Total</span><span class="det-v mono">{{ detailData.header?.SUB_TOTAL ? formatCurrency(detailData.header.SUB_TOTAL) : '-' }}</span></div>
            <div class="det-kv det-kv-grand">
              <span class="det-k">Grand Total</span>
              <span class="det-v mono" style="font-size:15px;font-weight:700;color:#0d9488">{{ detailData.header?.GRAND_TOTAL ? formatCurrency(detailData.header.GRAND_TOTAL) : '-' }}</span>
            </div>
          </div>
        </div>

        <div class="det-box-title mt-3 mb-2"><i class="pi pi-list me-1"></i>ITEM DITERIMA ({{ detailData.details?.length ?? 0 }} item)</div>
        <div style="overflow-x:auto">
          <table class="det-table">
            <thead>
              <tr>
                <th style="width:30px;text-align:center">#</th>
                <th>Nama Barang</th>
                <th style="width:70px;text-align:center">Qty</th>
                <th style="width:80px">Satuan</th>
                <th style="width:130px;text-align:right">Harga Satuan</th>
                <th style="width:130px;text-align:right">Total</th>
                <th style="width:100px">No Batch</th>
                <th style="width:110px">Tgl Expired</th>
                <th v-if="!detailRow?.is_batal" style="width:80px;text-align:center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in detailData.details" :key="i" :class="d.is_batal ? 'row-batal' : ''">
                <td class="mono" style="color:#94a3b8;text-align:center">{{ i + 1 }}</td>
                <td><div style="font-size:12px;font-weight:600;color:#1e293b">{{ d.nama_barang }}</div></td>
                <td class="mono" style="text-align:center;font-weight:600">{{ d.qty_diterima }}</td>
                <td style="font-size:11px;color:#64748b">{{ d.satuan }}</td>
                <td class="mono" style="text-align:right;color:#475569">{{ d.harga_satuan ? formatCurrency(d.harga_satuan) : '-' }}</td>
                <td class="mono" style="text-align:right;font-weight:700;color:#0f766e">{{ d.HARGA_TOTAL ? formatCurrency(d.HARGA_TOTAL) : '-' }}</td>
                <td class="mono" style="font-size:11px;color:#64748b">{{ d.no_batch || '-' }}</td>
                <td class="mono" style="font-size:11px;color:#64748b">{{ d.tgl_expired || '-' }}</td>
                <td v-if="!detailRow?.is_batal" class="no-strike" style="text-align:center">
                  <div v-if="d.is_batal" style="line-height:1.4">
                    <span style="font-size:10px;font-weight:700;color:#dc2626;opacity:1">Dibatalkan</span>
                    <div v-if="d.keterangan_batal" style="font-size:10px;color:#64748b;margin-top:2px;font-style:italic;text-decoration:none;opacity:1">{{ d.keterangan_batal }}</div>
                  </div>
                  <Button
                    v-else
                    icon="pi pi-times"
                    v-tooltip.top="'Batal Item'"
                    size="small" text rounded
                    style="color:#dc2626;width:1.6rem;height:1.6rem;padding:0"
                    :loading="batalItemLoading === d.id_barang"
                    @click="openBatalItem(d)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Dialog>

    <!-- KONFIRMASI BATALKAN -->
    <Dialog
      v-model:visible="batalKonfirmasi.visible"
      modal
      header="Batalkan Penerimaan?"
      :style="{ width: '420px' }"
    >
      <div style="display:flex;align-items:flex-start;gap:12px;padding:4px 0">
        <div style="width:40px;height:40px;border-radius:10px;background:#fee2e2;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="pi pi-exclamation-triangle" style="color:#dc2626;font-size:18px"></i>
        </div>
        <div>
          <div style="font-weight:700;color:#1e293b;margin-bottom:4px">
            {{ batalKonfirmasi.row?.no_penerimaan }}
          </div>
          <div style="font-size:13px;color:#64748b">
            Penerimaan ini akan dibatalkan dan stok akan dikembalikan. Tindakan ini tidak dapat diurungkan.
          </div>
        </div>
      </div>
      <Textarea
        v-model="batalKonfirmasi.keterangan"
        placeholder="Keterangan pembatalan (opsional)"
        rows="2"
        style="width:100%;margin-top:12px;font-size:12px"
        :disabled="batalLoading"
      />
      <template #footer>
        <Button label="Batal" severity="secondary" outlined size="small" @click="batalKonfirmasi.visible = false" :disabled="batalLoading" />
        <Button label="Ya, Batalkan" icon="pi pi-times" severity="danger" size="small" :loading="batalLoading" @click="batalPenerimaan" />
      </template>
    </Dialog>

    <!-- DIALOG BATAL ITEM -->
    <Dialog
      v-model:visible="batalItemDialog.visible"
      header="Batalkan Item Penerimaan?"
      modal
      :closable="!batalItemLoading"
      :style="{ width: '420px', maxWidth: '96vw' }"
    >
      <p style="font-size:13px;color:#374151;margin:0 0 8px">
        Item <strong>{{ batalItemDialog.item?.nama_barang }}</strong> akan dibatalkan dan stok dikembalikan.
      </p>
      <div class="det-batal-banner" style="margin-bottom:0">
        <i class="pi pi-exclamation-triangle" style="font-size:15px;flex-shrink:0"></i>
        <div style="font-size:12px">Tindakan ini tidak dapat diurungkan.</div>
      </div>
      <Textarea
        v-model="batalItemDialog.keterangan"
        placeholder="Keterangan pembatalan (opsional)"
        rows="2"
        style="width:100%;margin-top:10px;font-size:12px"
        :disabled="batalItemLoading"
      />
      <template #footer>
        <Button label="Tidak" severity="secondary" outlined size="small" @click="batalItemDialog.visible = false" :disabled="batalItemLoading" />
        <Button label="Ya, Batalkan Item" icon="pi pi-times" severity="danger" size="small" :loading="batalItemLoading" @click="batalItem" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const loading = ref(false)
const list = ref([])
const totalRecords = ref(0)
const localSearch = ref('')

const jenisOptions = [
  { label: 'Semua', value: 'semua' },
  { label: 'Dari SP', value: 'sp' },
  { label: 'Langsung (Tanpa SP)', value: 'direct' },
]

const filters = ref({
  jenis: 'semua',
  start_date: '',
  end_date: '',
  currentPage: 1,
  pageSize: 20,
})

const summary = ref({
  minggu_ini: { jumlah: 0, total: 0 },
  bulan_ini:  { jumlah: 0, total: 0 },
  tahun_ini:  { jumlah: 0, total: 0 },
})

async function fetchSummary() {
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_summary_penerimaan`,
      { params: { idclient: authStore.id_client, id_lokasi: authStore.id_lokasi } }
    )
    if (res.data?.response) summary.value = res.data.response
  } catch { /* silent */ }
}

function onPageChange(event) {
  filters.value.currentPage = event.page + 1
  filters.value.pageSize = event.rows
  fetchList()
}

function doSearch() {
  filters.value.currentPage = 1
  fetchList()
}

function resetFilter() {
  localSearch.value = ''
  filters.value = { jenis: 'semua', start_date: '', end_date: '', currentPage: 1, pageSize: 20 }
  fetchList()
}

async function fetchList() {
  loading.value = true
  try {
    const body = {
      idclient: authStore.id_client,
      page: filters.value.currentPage,
      limit: filters.value.pageSize,
    }
    if (authStore.id_lokasi) body.id_lokasi = authStore.id_lokasi
    if (filters.value.jenis && filters.value.jenis !== 'semua') body.jenis = filters.value.jenis
    if (filters.value.start_date) body.start_date = filters.value.start_date
    if (filters.value.end_date) body.end_date = filters.value.end_date
    if (localSearch.value?.trim()) body.search = localSearch.value.trim()

    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_list_penerimaan`,
      body
    )
    list.value = res.data?.response || []
    totalRecords.value = res.data?.total ?? list.value.length
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat daftar penerimaan', life: 3000 })
  } finally {
    loading.value = false
  }
}

function terimaBarang(row) {
  router.push({ name: 'PenerimaanForm', params: { id_pemesanan: row.id_pemesanan } })
}

// ── DETAIL DIALOG ──
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)
const detailRow = ref(null)

async function bukaDetail(row) {
  if (row.type === 'sp') {
    terimaBarang(row)
    return
  }
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  detailRow.value = row
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_detail_penerimaan_sp/${row.no_penerimaan}/${authStore.id_client}`
    )
    detailData.value = res.data?.response ?? null
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail penerimaan', life: 3000 })
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}


// ── BATAL ITEM ──
const batalItemDialog = ref({ visible: false, item: null, keterangan: '' })
const batalItemLoading = ref(false)

function openBatalItem(d) {
  batalItemDialog.value = { visible: true, item: d, keterangan: '' }
}

async function batalItem() {
  const d = batalItemDialog.value.item
  if (!d) return
  batalItemLoading.value = true
  try {
    const body = {
      no_penerimaan: detailRow.value.no_penerimaan,
      id_barang: d.id_barang,
      user_id: authStore.user_id,
      idclient: authStore.id_client,
      id_lokasi: authStore.id_lokasi,
    }
    if (batalItemDialog.value.keterangan?.trim()) body.keterangan_batal = batalItemDialog.value.keterangan.trim()
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/batal_item_penerimaan`,
      body
    )
    const meta = res.data?.metadata
    const code = meta?.code ?? res.data?.code
    if (code === 200) {
      batalItemDialog.value.visible = false
      toast.add({ severity: 'success', summary: 'Berhasil', detail: meta?.message || 'Item berhasil dibatalkan', life: 4000 })
      // Update lokal langsung tanpa tunggu re-fetch (API belum tentu return is_batal per item)
      if (detailData.value?.details) {
        const idx = detailData.value.details.findIndex(x => x.id_barang === d.id_barang)
        if (idx >= 0) {
          detailData.value.details[idx] = {
            ...detailData.value.details[idx],
            is_batal: 1,
            keterangan_batal: batalItemDialog.value.keterangan.trim() || null,
          }
        }
      }
      if (meta?.semua_item_batal) {
        detailRow.value = { ...detailRow.value, is_batal: 1 }
        fetchList()
      }
    } else {
      const errMsg = code === 500 ? 'Terjadi kesalahan server, coba lagi' : (meta?.message || 'Gagal membatalkan item')
      toast.add({ severity: 'error', summary: 'Gagal', detail: errMsg, life: 5000 })
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal membatalkan item', life: 5000 })
  } finally {
    batalItemLoading.value = false
  }
}

// ── BATALKAN PENERIMAAN (direct) ──
const batalKonfirmasi = ref({ visible: false, row: null })
const batalLoading = ref(false)

function konfirmasiBatal(row) {
  batalKonfirmasi.value = { visible: true, row, keterangan: '' }
}

async function batalPenerimaan() {
  const row = batalKonfirmasi.value.row
  if (!row) return
  batalLoading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/batal_penerimaan`,
      {
        no_penerimaan: row.no_penerimaan,
        user_id: authStore.user_id,
        idclient: authStore.id_client,
        id_lokasi: authStore.id_lokasi,
        ...(batalKonfirmasi.value.keterangan?.trim() ? { keterangan_batal: batalKonfirmasi.value.keterangan.trim() } : {}),
      }
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code === 200) {
      batalKonfirmasi.value.visible = false
      toast.add({ severity: 'success', summary: 'Dibatalkan', detail: res.data?.metadata?.message || `${row.no_penerimaan} berhasil dibatalkan`, life: 4000 })
      fetchList()
    } else {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Gagal membatalkan penerimaan', life: 5000 })
    }
  } catch (err) {
    const msg = err.response?.data?.metadata?.message || err.response?.data?.message || 'Gagal membatalkan penerimaan'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
  } finally {
    batalLoading.value = false
  }
}

// ── SELESAIKAN SP (dari list) ──
const selesaiLoadingId = ref(null)

async function selesaikanSP(row) {
  selesaiLoadingId.value = row.id_pemesanan
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/selesaikan_sp`,
      { id_pemesanan: Number(row.id_pemesanan), idclient: authStore.id_client, id_lokasi: authStore.id_lokasi }
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code !== 200) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Gagal menyelesaikan SP', life: 4000 })
      return
    }
    const persen = res.data?.metadata?.persentase
    const detailMsg = persen != null ? `${row.no_sp} diselesaikan. Diterima ${Math.round(persen)}%` : `${row.no_sp} berhasil diselesaikan`
    toast.add({ severity: 'success', summary: 'SP Selesai', detail: detailMsg, life: 4000 })
    fetchList()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Gagal menyelesaikan SP', life: 4000 })
  } finally {
    selesaiLoadingId.value = null
  }
}

function labelJenisSP(kode) {
  const map = { OBT: 'Obat Umum', PSI: 'Psikotropika', PRE: 'Prekursor', NAR: 'Narkotika', BRG: 'Barang' }
  return map[kode] || kode || '-'
}

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(() => { fetchList(); fetchSummary() })
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0;white-space:nowrap; }

.pm-stat-strip { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px; }
.sum-card { display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px; }
.sum-icon { width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
.sum-body { display:flex;flex-direction:column;gap:1px;min-width:0; }
.sum-label { font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#94a3b8; }
.sum-num { font-size:20px;font-weight:700;line-height:1.1; }
.sum-unit { font-size:11px;font-weight:400;color:#94a3b8; }
.sum-total { font-size:12px;font-weight:600;color:#475569;margin-top:1px; }

.pm-filter-bar { display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:10px;flex-wrap:wrap; }
.pm-filter-group { display:flex;align-items:center;gap:6px; }
.pm-filter-label { font-size:11px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:3px;white-space:nowrap; }
.pm-filter-actions { display:flex;align-items:center;gap:6px;padding-left:16px;border-left:1px solid #f1f5f9; }
.filter-vdiv { width:1px;height:28px;background:#e2e8f0;margin:0 4px; }
.pm-date-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;color:#1e293b;background:#fff;height:36px; }
.pm-date-input:focus { outline:none;border-color:#0d9488; }
.pm-date-input:disabled { background:#f8fafc;color:#94a3b8; }

.pm-table-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }
:deep(.pm-datatable .p-datatable-thead > tr > th) { background:#f0fdfa !important;color:#0d9488 !important;font-size:11px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.5px !important;padding:.25rem .6rem !important;white-space:nowrap; }
:deep(.pm-datatable .p-datatable-tbody > tr > td) { font-size:12px !important;padding:.03rem .5rem !important;vertical-align:middle; }
:deep(.pm-datatable .p-datatable-tbody > tr:hover > td) { background:#f0fdfa !important; }
:deep(.pm-datatable .p-paginator) { padding:6px 10px;font-size:12px;background:#fafafa;border-top:1px solid #e2e8f0; }
:deep(.pm-datatable .p-paginator .p-paginator-page.p-highlight) { background:#0d9488;border-color:#0d9488;color:#fff; }

.pm-empty { text-align:center;padding:40px 20px;color:#94a3b8; }
.pm-empty-icon { font-size:36px;margin-bottom:10px;color:#cbd5e1; }
.pm-empty-title { font-size:13px;font-weight:600;color:#64748b;margin:0 0 4px; }

.action-btns { display:flex;gap:4px;align-items:center;justify-content:center;padding:3px 4px; }
:deep(.aksi-btn.p-button) { padding:0 6px !important;height:1.6rem !important;min-width:1.6rem !important;width:auto !important;border-radius:6px !important;gap:3px !important; }
:deep(.aksi-btn.p-button .p-button-icon) { font-size:10px !important; }
:deep(.aksi-btn .p-button-label) { font-size:10px !important;font-weight:600 !important;letter-spacing:.2px !important; }
:deep(.aksi-dikirim.p-button)  { background:#dbeafe !important;color:#1d4ed8 !important;border:1px solid #bfdbfe !important; }
:deep(.aksi-dikirim.p-button:hover)  { background:#bfdbfe !important; }
:deep(.aksi-selesai.p-button)  { background:#f1f5f9 !important;color:#475569 !important;border:1px solid #e2e8f0 !important; }
:deep(.aksi-selesai.p-button:hover)  { background:#e2e8f0 !important; }
:deep(.aksi-batal.p-button)   { background:#fee2e2 !important;color:#dc2626 !important;border:1px solid #fecaca !important; }
:deep(.aksi-batal.p-button:hover)   { background:#fecaca !important; }

.type-badge { display:inline-flex;align-items:center;padding:2px 7px;border-radius:8px;font-size:10px;font-weight:700; }
.type-sp     { background:#dbeafe;color:#1d4ed8; }
.type-direct { background:#ede9fe;color:#7c3aed; }

.status-badge { display:inline-block;padding:2px 8px;border-radius:10px;font-size:10.5px;font-weight:700; }
.status-dikirim    { background:#dbeafe;color:#1d4ed8; }
.status-diterima   { background:#dcfce7;color:#15803d; }
.status-selesai    { background:#f1f5f9;color:#475569; }
.status-dibatalkan { background:#fee2e2;color:#dc2626; }

.mono { font-family:inherit;font-size:12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }

/* ── DETAIL DIALOG ── */
.det-batal-banner { display:flex;align-items:flex-start;gap:10px;background:#fff1f2;border:1px solid #fca5a5;border-radius:8px;padding:10px 14px;margin-bottom:14px;color:#b91c1c;font-size:12px; }
.det-dialog-header { display:flex;align-items:center;justify-content:space-between;width:100%; }
.det-dialog-header-left { display:flex;align-items:center;gap:12px; }
.det-dialog-icon { width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
.det-icon-normal { background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff; }
.det-icon-batal  { background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff; }
.det-dialog-no { font-size:15px;font-weight:700;color:#0d9488; }
.det-status-aktif { display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:#dcfce7;color:#15803d; }
.det-status-batal { display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:#fee2e2;color:#dc2626; }
.det-stat-row { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px; }
.det-stat-card { display:flex;align-items:center;gap:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px; }
.det-stat-ico { width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0; }
.det-stat-lbl { font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.det-stat-val { font-size:12px;font-weight:700;color:#1e293b;margin-top:1px; }
.det-info-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px; }
.det-info-box { background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px; }
.det-total-box { background:#f0fdfa;border-color:#99f6e4; }
.det-box-title { font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;margin-bottom:8px;display:flex;align-items:center; }
.det-kv { display:grid;grid-template-columns:110px 1fr;gap:6px;padding:3px 0;font-size:12px; }
.det-kv-grand { border-top:1px solid #99f6e4;padding-top:8px;margin-top:4px; }
.det-k { color:#64748b; }
.det-v { color:#1e293b;font-weight:500; }
.det-lampiran-link { color:#0d9488;text-decoration:none;display:inline-flex;align-items:center;font-size:12px; }
.det-lampiran-link:hover { text-decoration:underline; }
.det-table { width:100%;border-collapse:collapse;font-size:12px; }
.det-table thead tr { background:#f0fdfa; }
.det-table thead th { padding:6px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.det-table tbody tr { border-bottom:1px solid #f1f5f9; }
.det-table tbody tr:hover { background:#f0fdfa; }
.det-table tbody td { padding:6px 8px;vertical-align:middle; }
.det-table tbody tr.row-batal { opacity:.45; }
.det-table tbody tr.row-batal td:not(.no-strike) { text-decoration:line-through; }
</style>
