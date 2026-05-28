<template>
  <Toast />
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <!-- Header -->
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">Paket Obat Operasi</h1>
      <p class="page-subtitle">Buat dan kelola paket obat untuk tindakan operasi</p>
    </div>
    <div class="header-actions">
      <Button label="Refresh" severity="warn" icon="pi pi-sync" @click="fetchPaketObat()" />
      <Button label="Buat Paket Baru" icon="pi pi-plus" @click="openFormDialog('create')" />
    </div>
  </div>

  <!-- Tabel Paket Obat -->
  <Panel>
    <template #header>
      <div class="panel-header">
        <span class="panel-title">
          <i class="pi pi-box" style="margin-right: 8px" />
          Daftar Paket Obat
        </span>
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.global.value" placeholder="Cari paket..." size="small" />
        </IconField>
      </div>
    </template>

    <DataTable
      :value="paketList"
      :filters="filters"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      dataKey="id_paket"
      filterDisplay="menu"
      removableSort
      showGridlines
      scrollable
      scrollHeight="450px"
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="empty-table">
          <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8" />
          <p style="color: #64748b; margin-top: 8px">Belum ada paket obat</p>
        </div>
      </template>

      <!-- <Column field="kode_paket" header="Kode Paket" sortable style="min-width: 130px" /> -->
      <Column field="nama_paket" header="Nama Paket" sortable style="min-width: 200px" />
      <Column field="jenis_operasi" header="Jenis Operasi" sortable style="min-width: 160px">
        <template #body="{ data }">
          <Tag :value="data.jenis_operasi" severity="info" />
        </template>
      </Column>
      <Column
        field="jumlah_item"
        header="Jumlah Item"
        sortable
        style="min-width: 120px; text-align: center"
      >
        <template #body="{ data }">
          <Badge :value="data.jumlah_item" severity="secondary" />
        </template>
      </Column>
      <Column field="total_harga" header="Estimasi Harga" sortable style="min-width: 160px">
        <template #body="{ data }">
          {{ formatRupiah(data.total_harga) }}
        </template>
      </Column>
      <Column field="status" header="Status" style="min-width: 100px">
        <template #body="{ data }">
          <Tag
            :value="data.status === 1 ? 'Aktif' : 'Nonaktif'"
            :severity="data.status === 1 ? 'success' : 'danger'"
          />
        </template>
      </Column>
      <Column field="created_at" header="Dibuat" sortable style="min-width: 140px">
        <template #body="{ data }">
          {{ formatDateOnly(data.created_at) }}
        </template>
      </Column>
      <Column header="Aksi" frozen alignFrozen="right" style="min-width: 140px">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              icon="pi pi-eye"
              size="small"
              text
              severity="info"
              v-tooltip.top="'Detail'"
              @click="openDetailDialog(data)"
            />
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              severity="warning"
              v-tooltip.top="'Edit'"
              @click="openFormDialog('edit', data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              v-tooltip.top="'Hapus'"
              @click="confirmHapusPaket(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </Panel>

  <!-- Dialog Form Buat / Edit Paket -->
  <Dialog
    v-model:visible="showFormDialog"
    :header="formMode === 'create' ? 'Buat Paket Obat Baru' : 'Edit Paket Obat'"
    :style="{ width: '90vw', maxWidth: '1100px' }"
    modal
    :draggable="false"
    :closable="!loadingSave"
    @hide="resetForm"
  >
    <div class="form-dialog-body">
      <!-- Form Info Paket -->
      <div class="form-section">
        <p class="section-label">Informasi Paket</p>
        <div class="form-grid">
          <div class="form-field">
            <label>Nama Paket <span class="required">*</span></label>
            <InputText
              v-model="form.nama_paket"
              placeholder="Contoh: Paket SC Caesar Elektif"
              :invalid="submitted && !form.nama_paket"
              class="w-full"
            />
            <small v-if="submitted && !form.nama_paket" class="p-error"
              >Nama paket wajib diisi</small
            >
          </div>
          <div class="form-field">
            <label>Jenis Operasi <span class="required">*</span></label>
            <Select
              v-model="form.jenis_operasi"
              :options="jenisOperasiOptions"
              placeholder="Pilih jenis operasi"
              :invalid="submitted && !form.jenis_operasi"
              class="w-full"
            />
            <small v-if="submitted && !form.jenis_operasi" class="p-error"
              >Jenis operasi wajib dipilih</small
            >
          </div>
          <div class="form-field">
            <label>Status</label>
            <Select
              v-model="form.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
          <div class="form-field form-field--full">
            <label>Keterangan</label>
            <Textarea
              v-model="form.keterangan"
              placeholder="Deskripsi atau catatan tambahan..."
              rows="2"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Section Pilih Obat -->
      <div class="form-section">
        <p class="section-label">Pilih Obat</p>
        <div class="obat-picker">
          <!-- Panel Kiri: List Obat -->
          <div class="picker-panel picker-panel--left">
            <div class="picker-search">
              <IconField class="w-full">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="searchQuery"
                  @input="fetchMasterObat(19, searchQuery)"
                  placeholder="Cari nama atau kode obat..."
                  class="w-full"
                  size="small"
                />
              </IconField>
            </div>
            <div class="picker-filter-tags">
              <button
                v-for="kat in kategoriOptions"
                :key="kat.value"
                class="filter-tag"
                :class="{ active: activeKategori === kat.value }"
                @click="activeKategori = kat.value"
              >
                {{ kat.label }}
              </button>
            </div>
            <div class="picker-list">
              <div v-if="masterObat.length === 0" class="picker-empty">
                <i class="pi pi-search" />
                <span>Obat tidak ditemukan</span>
              </div>

              <div
                v-for="obat in masterObat"
                :key="obat.ID"
                class="obat-item"
                :class="{ selected: isObatDipilih(obat.ID) }"
              >
                <div class="obat-item__info">
                  <p class="obat-item__nama">{{ obat.CAPTION }}</p>
                  <p class="obat-item__meta">
                    {{ obat.BARCODE }} &middot; {{ obat.KATEGORI }} &middot; {{ obat.SATUAN }}
                  </p>
                  <p class="obat-item__harga">{{ formatRupiah(obat.HARGAJUAL) }}</p>
                </div>
                <Button
                  v-if="!isObatDipilih(obat.ID)"
                  icon="pi pi-plus"
                  label="Pilih"
                  size="small"
                  outlined
                  @click="tambahObatKePaket(obat)"
                />
                <Button
                  v-else
                  icon="pi pi-check"
                  label="Dipilih"
                  size="small"
                  severity="success"
                  @click="hapusObatDariPaket(obat.ID)"
                />
              </div>
            </div>
          </div>

          <!-- Panel Kanan: Obat Terpilih -->
          <div class="picker-panel picker-panel--right">
            <div class="picker-right-header">
              <span class="picker-right-title">Obat dalam paket</span>
              <Badge :value="form.detail_obat.length" severity="info" />
            </div>

            <div class="picker-list">
              <div v-if="form.detail_obat.length === 0" class="picker-empty">
                <i class="pi pi-inbox" />
                <span>Belum ada obat dipilih</span>
              </div>
              <div v-for="item in form.detail_obat" :key="item.id_obat" class="paket-item">
                <div class="paket-item__info">
                  <p class="paket-item__nama">{{ item.nama_obat }}</p>
                  <p class="paket-item__meta">
                    {{ item.satuan }} &middot; {{ formatRupiah(item.harga) }}/item
                  </p>
                </div>
                <div class="paket-item__qty">
                  <Button
                    icon="pi pi-minus"
                    text
                    rounded
                    size="small"
                    :disabled="item.qty <= 1"
                    @click="ubahQty(item.id_obat, -1)"
                  />
                  <span class="qty-value">{{ item.qty }}</span>
                  <Button
                    icon="pi pi-plus"
                    text
                    rounded
                    size="small"
                    @click="ubahQty(item.id_obat, 1)"
                  />
                </div>
                <Button
                  icon="pi pi-times"
                  text
                  rounded
                  size="small"
                  severity="danger"
                  @click="hapusObatDariPaket(item.id_obat)"
                />
              </div>
            </div>

            <!-- Summary -->
            <div class="paket-summary">
              <div class="summary-row">
                <span>Total jenis obat</span>
                <span class="summary-val">{{ form.detail_obat.length }} item</span>
              </div>
              <div class="summary-row">
                <span>Total qty</span>
                <span class="summary-val">{{ totalQty }}</span>
              </div>
              <div class="summary-row summary-row--total">
                <span>Estimasi harga</span>
                <span class="summary-val">{{ formatRupiah(totalHarga) }}</span>
              </div>
            </div>
          </div>
        </div>

        <small
          v-if="submitted && form.detail_obat.length === 0"
          class="p-error"
          style="display: block; margin-top: 6px"
        >
          Pilih minimal satu obat untuk paket ini
        </small>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button
          label="Batal"
          icon="pi pi-times"
          text
          severity="secondary"
          :disabled="loadingSave"
          @click="showFormDialog = false"
        />
        <Button
          :label="formMode === 'create' ? 'Simpan Paket' : 'Update Paket'"
          icon="pi pi-save"
          :loading="loadingSave"
          @click="savePaketObat"
        />
      </div>
    </template>
  </Dialog>

  <!-- Dialog Detail Paket -->
  <Dialog
    v-model:visible="showDetailDialog"
    header="Detail Paket Obat"
    :style="{ width: '700px' }"
    modal
    :draggable="false"
  >
    <div v-if="selectedPaket" class="detail-body">
      <div class="detail-info-grid">
        <div class="detail-info-item">
          <span class="detail-label">Kode Paket</span>
          <span class="detail-value">{{ selectedPaket.kode_paket }}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-label">Nama Paket</span>
          <span class="detail-value">{{ selectedPaket.nama_paket }}</span>
        </div>
        <div class="detail-info-item">
          <span class="detail-label">Jenis Operasi</span>
          <Tag :value="selectedPaket.jenis_operasi" severity="info" />
        </div>
        <div class="detail-info-item">
          <span class="detail-label">Status</span>
          <Tag
            :value="selectedPaket.status === 1 ? 'Aktif' : 'Nonaktif'"
            :severity="selectedPaket.status === 1 ? 'success' : 'danger'"
          />
        </div>
        <div class="detail-info-item detail-info-item--full">
          <span class="detail-label">Keterangan</span>
          <span class="detail-value">{{ selectedPaket.keterangan || '-' }}</span>
        </div>
      </div>

      <Divider />

      <p class="section-label">Daftar Obat</p>
      <DataTable :value="selectedPaket.detail_obat" showGridlines class="p-datatable-sm">
        <Column field="kode_obat" header="Kode" style="width: 110px" />
        <Column field="nama_obat" header="Nama Obat" />
        <Column field="kategori" header="Kategori" style="width: 120px" />
        <Column field="qty" header="Qty" style="width: 70px; text-align: center" />
        <Column field="satuan" header="Satuan" style="width: 90px" />
        <Column header="Harga Satuan" style="width: 140px">
          <template #body="{ data }">{{ formatRupiah(data.harga) }}</template>
        </Column>
        <Column header="Subtotal" style="width: 150px">
          <template #body="{ data }">{{ formatRupiah(data.harga * data.qty) }}</template>
        </Column>
      </DataTable>

      <div class="detail-total">
        <span>Total Estimasi Harga</span>
        <span class="detail-total-value">{{ formatRupiah(selectedPaket.total_harga) }}</span>
      </div>
    </div>

    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        text
        severity="secondary"
        @click="showDetailDialog = false"
      />
      <Button
        label="Edit Paket"
        icon="pi pi-pencil"
        severity="warning"
        @click="
          () => {
            showDetailDialog = false
            openFormDialog('edit', selectedPaket)
          }
        "
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'

import Badge from 'primevue/badge'
import { sub } from 'date-fns'
import { id } from 'date-fns/locale'
// Stores
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, id_lokasi } = storeToRefs(authStore)

// Toast & Confirm
const toast = useToast()
const confirm = useConfirm()

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(false)
const loadingSave = ref(false)
const loadingObat = ref(false)
const submitted = ref(false)

// Dialog visibility
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const formMode = ref('create') // 'create' | 'edit'

// Data
const paketList = ref([])
const masterObat = ref([])
const selectedPaket = ref(null)

// Filter untuk DataTable utama
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Filter obat di picker
const searchObat = ref('')
const activeKategori = ref('semua')

// Form state
const defaultForm = () => ({
  id_paket: null,
  nama_paket: '',
  jenis_operasi: '',
  keterangan: '',
  status: 1,
  detail_obat: [],
})
const form = ref(defaultForm())

// ─── Options ──────────────────────────────────────────────────────────────────
const jenisOperasiOptions = [
  'Operasi Mayor',
  'Operasi Minor',
  'SC / Sectio Caesarea',
  'Laparotomi',
  'Appendektomi',
  'Debridement',
  'Herniotomi',
  'Histerektomi',
  'Orif / ORIF',
  'Lainnya',
]

const statusOptions = [
  { label: 'Aktif', value: 1 },
  { label: 'Nonaktif', value: 0 },
]

const kategoriOptions = [
  { label: 'Semua', value: 'semua' },
  { label: 'Antibiotik', value: 'antibiotik' },
  { label: 'Analgetik', value: 'analgetik' },
  { label: 'Anestesi', value: 'anestesi' },
  { label: 'Cairan Infus', value: 'infus' },
  { label: 'Vitamin', value: 'vitamin' },
  { label: 'Lainnya', value: 'lainnya' },
]

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredObat = computed(() => {
  return masterObat.value.filter((o) => {
    const matchKat = activeKategori.value === 'semua' || o.kategori === activeKategori.value
    const q = searchObat.value.toLowerCase()
    const matchSearch =
      !q || o.nama_obat.toLowerCase().includes(q) || o.kode_obat.toLowerCase().includes(q)
    return matchKat && matchSearch
  })
})

const totalQty = computed(() => form.value.detail_obat.reduce((acc, o) => acc + o.qty, 0))

const totalHarga = computed(() =>
  form.value.detail_obat.reduce((acc, o) => acc + o.harga * o.qty, 0),
)

// ─── Fetch Data ───────────────────────────────────────────────────────────────
const fetchPaketObat = async () => {
  try {
    loading.value = true

    const param = {
      id_client: id_client.value,
      id_lokasi: id_lokasi.value,
      mode: 1,
    }
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_data_paket/`,
      param,
    )
    console.log('Fetch paket obat response:', response.data)
    if (response.data?.code === 200) {
      paketList.value = response.data.data
    }
  } catch (err) {
    console.error(err)
    showError('Gagal memuat daftar paket obat')
  } finally {
    loading.value = false
  }
}

const searchQuery = ref('')

const fetchMasterObat = async (mode, barcode) => {
  try {
    if (searchQuery.value.length <= 2) {
      return
    }

    const param = {
      barcode: barcode || '',
      mode: mode || 19,
      id_client: id_client.value,
      breakdown: 0,
      nama: searchQuery.value || '',
      lokasi: id_lokasi.value,
    }

    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    if (response.data?.metadata?.code == 200) {
      masterObat.value = response.data.response || []
    } else {
      masterObat.value = []
      showWarning('Tidak ada data obat ditemukan')
    }
  } catch (error) {
    console.error('Error searching medicines:', error)
    masterObat.value = []
    showError('Gagal mencari data obat')
  } finally {
    loading.value = false
  }
}

// ─── Dialog Handlers ──────────────────────────────────────────────────────────
const openFormDialog = (mode, data = null) => {
  formMode.value = mode
  submitted.value = false
  searchObat.value = ''
  activeKategori.value = 'semua'

  if (mode === 'edit' && data) {
    form.value = {
      id_paket: data.id_paket,
      nama_paket: data.nama_paket,
      jenis_operasi: data.jenis_operasi,
      keterangan: data.keterangan ?? '',
      status: data.status,
      detail_obat: data.detail_obat ? [...data.detail_obat] : [],
    }
  } else {
    form.value = defaultForm()
  }

  showFormDialog.value = true
}

const openDetailDialog = async (data) => {
  selectedPaket.value = null
  showDetailDialog.value = true
  try {
    const { data: res } = await axios.get(`${configStore.apiBaseUrl}/get_paket_obat_detail`, {
      params: { id_paket: data.id_paket, id_client: id_client.value },
    })
    selectedPaket.value = res.response
  } catch {
    selectedPaket.value = data
  }
}

const resetForm = () => {
  form.value = defaultForm()
  submitted.value = false
  searchObat.value = ''
  activeKategori.value = 'semua'
}

// ─── Obat Picker ─────────────────────────────────────────────────────────────
const isObatDipilih = (id_obat) => form.value.detail_obat.some((o) => o.id_obat === id_obat)

const tambahObatKePaket = (obat) => {
  if (isObatDipilih(obat.id_obat)) return
  form.value.detail_obat.push({
    id_obat: obat.ID,
    kode_obat: obat.BARCODE,
    nama_obat: obat.CAPTION,
    kategori: obat.KATEGORI,
    satuan: obat.SATUAN,
    harga: obat.HARGAJUAL,
    sub_barcode: obat.SUB_BARCODE,
    qty: 1,
  })
}

const hapusObatDariPaket = (id_obat) => {
  form.value.detail_obat = form.value.detail_obat.filter((o) => o.id_obat !== id_obat)
}

const ubahQty = (id_obat, delta) => {
  const item = form.value.detail_obat.find((o) => o.id_obat === id_obat)
  if (!item) return
  item.qty = Math.max(1, item.qty + delta)
}

// ─── Save / Delete ────────────────────────────────────────────────────────────
const savePaketObat = async () => {
  submitted.value = true

  if (!form.value.nama_paket || !form.value.jenis_operasi || form.value.detail_obat.length === 0) {
    showWarning('Lengkapi semua field yang wajib diisi')
    return
  }

  try {
    loadingSave.value = true
    const payload = {
      id_client: id_client.value,
      user_id: user_id.value,
      id_paket: form.value.id_paket,
      nama_paket: form.value.nama_paket,
      jenis_operasi: form.value.jenis_operasi,
      keterangan: form.value.keterangan,
      status: form.value.status,
      total_harga: totalHarga.value,
      id_lokasi: id_lokasi.value,
      detail_obat: form.value.detail_obat.map((o) => ({
        id_obat: o.id_obat,
        qty: o.qty,
        harga: o.harga,
        sub_barcode: o.sub_barcode,
      })),
    }

    const endpoint =
      formMode.value === 'create'
        ? `${configStore.apiBaseUrl}/index.php/api/penunjang/insert_data_paket/`
        : `${configStore.apiBaseUrl}/index.php/api/penunjang/insert_data_paket/`

    console.log('Save response:', JSON.stringify(payload))

    const response = await axios.post(endpoint, payload)

    if (response.data.code === 200) {
      showSuccess(
        formMode.value === 'create'
          ? 'Paket obat berhasil dibuat'
          : 'Paket obat berhasil diperbarui',
      )
      showFormDialog.value = false
      await fetchPaketObat()
    } else {
      showError(response.data.message || 'Gagal menyimpan paket obat')
    }
  } catch (err) {
    console.error(err)
    showError('Terjadi kesalahan saat menyimpan paket obat')
  } finally {
    loadingSave.value = false
  }
}

const confirmHapusPaket = (data) => {
  confirm.require({
    message: `Hapus paket "${data.nama_paket}"? Tindakan ini tidak dapat dibatalkan.`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptSeverity: 'danger',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    accept: () => hapusPaketObat(data),
  })
}

const hapusPaketObat = async (data) => {
  try {
    loading.value = true
    await axios.post(`${configStore.apiBaseUrl}/delete_paket_obat`, {
      id_paket: data.id_paket,
      id_client: id_client.value,
      user_id: user_id.value,
    })
    showSuccess('Paket obat berhasil dihapus')
    await fetchPaketObat()
  } catch {
    showError('Gagal menghapus paket obat')
  } finally {
    loading.value = false
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatRupiah = (val) => {
  if (val == null) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)
}

const formatDateOnly = (date) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return date
  }
}

const showSuccess = (message = 'Berhasil') => {
  toast.add({ severity: 'success', summary: 'Sukses', detail: message, life: 3000 })
}
const showError = (message = 'Terjadi kesalahan') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}
const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: message, life: 4000 })
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchPaketObat(), fetchMasterObat()])
})
</script>

<style scoped>
.paket-obat-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.page-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--p-text-color);
}
.page-subtitle {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Panel header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}
.panel-title {
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
}

/* Action buttons in table */
.action-buttons {
  display: flex;
  gap: 4px;
}

/* Empty table */
.empty-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

/* Form Dialog */
.form-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.section-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--p-text-muted-color);
  margin: 0;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--p-content-border-color);
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-field label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--p-text-color);
}
.form-field--full {
  grid-column: 1 / -1;
}
.required {
  color: var(--p-red-500);
}
.w-full {
  width: 100%;
}

/* Obat Picker */
.obat-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  min-height: 400px;
}
.picker-panel {
  border: 1px solid var(--p-content-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.picker-search {
  padding: 10px;
  border-bottom: 1px solid var(--p-content-border-color);
}
.picker-filter-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 10px;
  border-bottom: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
}
.filter-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid var(--p-content-border-color);
  background: transparent;
  color: var(--p-text-muted-color);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.filter-tag:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}
.filter-tag.active {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: #fff;
}
.picker-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.picker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  min-height: 100px;
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
}

/* Obat item (kiri) */
.obat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--p-content-border-color);
  border-radius: 6px;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.obat-item.selected {
  border-color: var(--p-green-500);
  background: var(--p-green-50);
}
.obat-item__info {
  flex: 1;
  min-width: 0;
}
.obat-item__nama {
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.obat-item__meta {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin: 2px 0 0;
}
.obat-item__harga {
  font-size: 0.75rem;
  color: var(--p-primary-color);
  margin: 2px 0 0;
  font-weight: 500;
}

/* Panel kanan */
.picker-right-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--p-content-border-color);
}
.picker-right-title {
  font-size: 0.85rem;
  font-weight: 600;
}

/* Paket item (kanan) */
.paket-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--p-content-border-color);
  border-radius: 6px;
}
.paket-item__info {
  flex: 1;
  min-width: 0;
}
.paket-item__nama {
  font-size: 0.83rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.paket-item__meta {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin: 2px 0 0;
}
.paket-item__qty {
  display: flex;
  align-items: center;
  gap: 4px;
}
.qty-value {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

/* Summary */
.paket-summary {
  padding: 10px 12px;
  border-top: 1px solid var(--p-content-border-color);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}
.summary-row--total {
  font-weight: 600;
  color: var(--p-text-color);
  padding-top: 6px;
  border-top: 1px dashed var(--p-content-border-color);
  margin-top: 4px;
  font-size: 0.85rem;
}
.summary-val {
  font-weight: 500;
}

/* Dialog footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Detail dialog */
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.detail-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;
}
.detail-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-info-item--full {
  grid-column: 1 / -1;
}
.detail-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.detail-value {
  font-size: 0.9rem;
  color: var(--p-text-color);
}
.detail-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--p-primary-50);
  border-radius: 6px;
  margin-top: 8px;
}
.detail-total span:first-child {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}
.detail-total-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .obat-picker {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
  }
  .detail-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
