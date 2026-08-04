<template>
  <div class="content">
    <Toast />
    <ConfirmDialog />

    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="router.push('/sales/pos')" />
          <div>
            <div style="font-weight: 800; font-size: 15px">Pemasukan &amp; Pengeluaran Lain</div>
            <div style="font-size: 11.5px; color: var(--p-text-muted-color)">Sales Langsung — Apotik</div>
          </div>
        </div>
      </template>
    </Toolbar>

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="transaksi"><i class="pi pi-wallet me-1"></i> Transaksi</Tab>
        <Tab value="kategori"><i class="pi pi-tags me-1"></i> Master Kategori</Tab>
      </TabList>
      <TabPanels>
        <!-- ══ TRANSAKSI ══ -->
        <TabPanel value="transaksi">
          <div class="card elevation-0">
            <div class="card-body">
              <div class="filter-bar mb-3">
                <div class="filter-group">
                  <label class="filter-label">Periode</label>
                  <div class="filter-group-row">
                    <DatePicker v-model="dateStart" dateFormat="dd M yy" placeholder="Tanggal mulai" showIcon iconDisplay="input" class="filter-date" />
                    <span class="filter-sep">—</span>
                    <DatePicker v-model="dateEnd" dateFormat="dd M yy" placeholder="Tanggal akhir" showIcon iconDisplay="input" class="filter-date" />
                    <Button label="Terapkan" icon="pi pi-search" size="small" :loading="loadingTransaksi" @click="fetchTransaksi" />
                  </div>
                </div>
                <div class="filter-group">
                  <label class="filter-label">Jenis</label>
                  <SelectButton v-model="filterJenis" :options="jenisFilterOptions" optionLabel="label" optionValue="value" @change="fetchTransaksi" />
                </div>
                <div class="ms-auto d-flex" style="gap: 8px">
                  <Button icon="pi pi-plus" label="Tambah Transaksi" size="small" @click="openTransaksiDialog" />
                </div>
              </div>

              <div class="stat-row stat-row-2 mb-3">
                <div class="stat-tile">
                  <div class="stat-icon" style="background: #e6f6ef; color: #1baf7a"><i class="pi pi-arrow-down-left"></i></div>
                  <div>
                    <div class="stat-value">{{ formatRupiah(totalPemasukan) }}</div>
                    <div class="stat-label">Pemasukan Lain</div>
                  </div>
                </div>
                <div class="stat-tile">
                  <div class="stat-icon" style="background: #fdeceb; color: #e05252"><i class="pi pi-arrow-up-right"></i></div>
                  <div>
                    <div class="stat-value">{{ formatRupiah(totalPengeluaran) }}</div>
                    <div class="stat-label">Pengeluaran Lain</div>
                  </div>
                </div>
              </div>

              <DataTable :value="transaksiList" size="small" showGridlines stripedRows :loading="loadingTransaksi" paginator :rows="20">
                <Column header="Tanggal" sortable field="TANGGAL">
                  <template #body="{ data }">{{ formatTglFull(data.TANGGAL) }}</template>
                </Column>
                <Column header="Jenis" sortable field="JENIS">
                  <template #body="{ data }">
                    <Tag :value="data.JENIS === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'" :severity="data.JENIS === 'PEMASUKAN' ? 'success' : 'danger'" style="font-size: 10px" />
                  </template>
                </Column>
                <Column field="NAMA_KATEGORI" header="Kategori" sortable />
                <Column field="TIPE" header="Induk">
                  <template #body="{ data }"><span class="induk-chip">{{ tipeLabel(data.TIPE) }}</span></template>
                </Column>
                <Column header="Jumlah" sortable field="JUMLAH">
                  <template #body="{ data }">
                    <b :class="data.JENIS === 'PEMASUKAN' ? 'text-success' : 'text-danger'">{{ data.JENIS === 'PEMASUKAN' ? '' : '-' }}{{ formatAngka(data.JUMLAH) }}</b>
                  </template>
                </Column>
                <Column field="KETERANGAN" header="Keterangan" style="min-width: 12rem" />
                <Column header="" style="width: 3rem">
                  <template #body="{ data }">
                    <Button icon="pi pi-trash" text rounded severity="danger" size="small" @click="confirmDeleteTransaksi(data)" />
                  </template>
                </Column>
                <template #empty>
                  <div class="state-box-sm">
                    <i class="pi pi-inbox"></i>
                    <span>Belum ada transaksi pada rentang ini</span>
                  </div>
                </template>
              </DataTable>
            </div>
          </div>
        </TabPanel>

        <!-- ══ MASTER KATEGORI ══ -->
        <TabPanel value="kategori">
          <div class="card elevation-0">
            <div class="card-body">
              <div class="filter-bar mb-3">
                <SelectButton v-model="kategoriFilterJenis" :options="jenisFilterOptions" optionLabel="label" optionValue="value" @change="fetchKategori" />
                <div class="ms-auto d-flex" style="gap: 8px">
                  <Button icon="pi pi-plus" label="Tambah Induk Baru" severity="secondary" outlined size="small" @click="openKategoriDialog(null, { forceNewTipe: true })" />
                  <Button icon="pi pi-plus" label="Tambah Kategori" size="small" @click="openKategoriDialog()" />
                </div>
              </div>

              <div v-if="loadingKategori" class="state-box-sm">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Memuat kategori...</span>
              </div>
              <div v-else-if="!kategoriGroups.length" class="state-box-sm">
                <i class="pi pi-inbox"></i>
                <span>Belum ada kategori. Mulai dengan "Tambah Induk Baru".</span>
              </div>
              <div v-else class="kategori-tree">
                <div v-for="grp in kategoriGroups" :key="grp.JENIS + '|' + grp.TIPE" class="kategori-group">
                  <div class="kategori-group-header">
                    <div class="kategori-group-icon">
                      <i class="pi pi-folder-open"></i>
                    </div>
                    <div class="kategori-group-heading">
                      <span class="kategori-group-title">{{ tipeLabel(grp.TIPE) }}</span>
                      <div class="kategori-group-meta">
                        <Tag
                          :value="grp.JENIS === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'"
                          :severity="grp.JENIS === 'PEMASUKAN' ? 'success' : 'danger'"
                          style="font-size: 9.5px"
                        />
                        <span class="kategori-group-count">{{ grp.items.length }} kategori</span>
                      </div>
                    </div>
                    <Button
                      icon="pi pi-plus"
                      label="Tambah Kategori"
                      text
                      size="small"
                      class="ms-auto kategori-group-add-btn"
                      @click="openKategoriDialog(null, { presetJenis: grp.JENIS, presetTipe: grp.TIPE })"
                    />
                  </div>
                  <div class="kategori-child-list">
                    <div v-for="k in grp.items" :key="k.ID" class="kategori-child-row">
                      <i class="pi pi-angle-right kategori-child-icon"></i>
                      <span class="kategori-child-nama">{{ k.NAMA }}</span>
                      <div class="kategori-child-actions">
                        <Button icon="pi pi-pencil" text rounded size="small" @click="openKategoriDialog(k)" />
                        <Button icon="pi pi-trash" text rounded severity="danger" size="small" @click="confirmDeleteKategori(k)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- ══ Dialog: Tambah/Edit Kategori ══ -->
    <Dialog v-model:visible="showKategoriDialog" modal :draggable="false" :style="{ width: '95vw', maxWidth: '460px' }" :header="kategoriForm.ID ? 'Edit Kategori' : 'Tambah Kategori'">
      <div class="dialog-form">
        <label class="dialog-label">1. Jenis <span class="text-danger">*</span></label>
        <SelectButton v-model="kategoriForm.JENIS" :options="jenisOptions" optionLabel="label" optionValue="value" class="w-100" @change="onKategoriJenisChange" />

        <label class="dialog-label mt-3">2. Induk (Tipe) <span class="text-danger">*</span></label>
        <template v-if="!isNewTipeMode">
          <Select
            v-model="kategoriForm.TIPE"
            :options="existingTipeOptionsForJenis"
            optionLabel="label"
            optionValue="value"
            class="w-100"
            placeholder="Pilih induk yang sudah ada"
          />
          <button type="button" class="kategori-newtipe-toggle" @click="isNewTipeMode = true">
            <i class="pi pi-plus-circle"></i> Buat induk baru
          </button>
        </template>
        <template v-else>
          <InputText v-model="kategoriForm.TIPE" class="w-100" placeholder="mis. BIAYA OPERASIONAL" />
          <button v-if="existingTipeOptionsForJenis.length" type="button" class="kategori-newtipe-toggle" @click="isNewTipeMode = false">
            <i class="pi pi-list"></i> Pilih dari induk yang sudah ada
          </button>
        </template>
        <small class="dialog-hint">Induk = grup tingkat-2 buat mengelompokkan kategori (mis. "Biaya Operasional", "Marketing", dll — bebas). Kosongkan untuk pakai "Lainnya".</small>

        <label class="dialog-label mt-3">3. Nama Kategori (Anak) <span class="text-danger">*</span></label>
        <InputText v-model="kategoriForm.NAMA" class="w-100" placeholder="mis. Gaji Karyawan" />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" text @click="showKategoriDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="savingKategori" @click="submitKategori" />
      </template>
    </Dialog>

    <!-- ══ Dialog: Tambah Transaksi ══ -->
    <Dialog v-model:visible="showTransaksiDialog" modal :draggable="false" :style="{ width: '95vw', maxWidth: '440px' }" header="Tambah Transaksi">
      <div class="dialog-form">
        <label class="dialog-label">Jenis <span class="text-danger">*</span></label>
        <SelectButton v-model="transaksiForm.JENIS" :options="jenisOptions" optionLabel="label" optionValue="value" class="w-100" @change="onTransaksiJenisChange" />

        <label class="dialog-label mt-2">Kategori <span class="text-danger">*</span></label>
        <Select
          v-model="transaksiForm.ID_KATEGORI"
          :options="kategoriOptionsForForm"
          optionLabel="NAMA"
          optionValue="ID"
          class="w-100"
          placeholder="Pilih kategori"
          filter
        />

        <label class="dialog-label mt-2">Tanggal <span class="text-danger">*</span></label>
        <DatePicker v-model="transaksiForm.TANGGAL" dateFormat="dd M yy" showIcon iconDisplay="input" class="w-100" />

        <label class="dialog-label mt-2">Jumlah <span class="text-danger">*</span></label>
        <InputNumber v-model="transaksiForm.JUMLAH" mode="currency" currency="IDR" locale="id-ID" :maxFractionDigits="0" :min="0" class="w-100" placeholder="Rp 0" />

        <label class="dialog-label mt-2">Keterangan</label>
        <Textarea v-model="transaksiForm.KETERANGAN" rows="2" class="w-100" autoResize placeholder="Opsional..." />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" text @click="showTransaksiDialog = false" />
        <Button label="Simpan" icon="pi pi-check" :loading="savingTransaksi" @click="submitTransaksi" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toolbar from 'primevue/toolbar'
import DatePicker from 'primevue/datepicker'
import { formatRupiah, formatAngka } from './utils/format'
import { formatTglFull, formatDateOnlyForAPI } from './utils/date'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const apiUrl = computed(() => `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`)

const activeTab = ref('transaksi')

const jenisOptions = [
  { label: 'Pemasukan', value: 'PEMASUKAN' },
  { label: 'Pengeluaran', value: 'PENGELUARAN' },
]
const jenisFilterOptions = [{ label: 'Semua', value: null }, ...jenisOptions]
const tipeLabel = (tipe) => (tipe === 'BEBAN_USAHA' ? 'Beban Usaha' : tipe && tipe !== 'LAINNYA' ? tipe : 'Lainnya')

/* ══════════ Master Kategori ══════════ */
const kategoriList = ref([])
const loadingKategori = ref(false)
const kategoriFilterJenis = ref(null)

const fetchKategori = async () => {
  loadingKategori.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/kategori_transaksi_lain`, {
      params: { clientId: id_client.value, jenis: kategoriFilterJenis.value || undefined },
    })
    kategoriList.value = data?.response ?? []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat kategori', life: 4000 })
  } finally {
    loadingKategori.value = false
  }
}

// Kategori dikelompokkan per induk (TIPE) di dalam masing-masing JENIS — TIPE bukan tabel
// master tersendiri, cuma nilai bebas yang "muncul" begitu ada kategori pertama memakainya.
const kategoriGroups = computed(() => {
  const filtered = kategoriFilterJenis.value
    ? kategoriList.value.filter((k) => k.JENIS === kategoriFilterJenis.value)
    : kategoriList.value
  const map = new Map()
  for (const k of filtered) {
    const tipe = k.TIPE || 'LAINNYA'
    const key = `${k.JENIS}|${tipe}`
    if (!map.has(key)) map.set(key, { JENIS: k.JENIS, TIPE: tipe, items: [] })
    map.get(key).items.push(k)
  }
  return Array.from(map.values()).sort((a, b) => a.JENIS.localeCompare(b.JENIS) || tipeLabel(a.TIPE).localeCompare(tipeLabel(b.TIPE)))
})

const showKategoriDialog = ref(false)
const savingKategori = ref(false)
const isNewTipeMode = ref(false)
const emptyKategoriForm = () => ({ ID: null, NAMA: '', JENIS: 'PENGELUARAN', TIPE: '' })
const kategoriForm = ref(emptyKategoriForm())

// Induk (TIPE) yang sudah pernah dipakai untuk JENIS yang lagi dipilih di form
const existingTipeOptionsForJenis = computed(() => {
  const tipes = new Set(
    kategoriList.value.filter((k) => k.JENIS === kategoriForm.value.JENIS && k.TIPE).map((k) => k.TIPE),
  )
  return Array.from(tipes)
    .sort((a, b) => tipeLabel(a).localeCompare(tipeLabel(b)))
    .map((t) => ({ label: tipeLabel(t), value: t }))
})

const onKategoriJenisChange = () => {
  kategoriForm.value.TIPE = ''
  isNewTipeMode.value = !existingTipeOptionsForJenis.value.length
}

// row = kategori yang diedit; opts = { presetJenis, presetTipe, forceNewTipe } saat tambah baru
const openKategoriDialog = (row, opts = {}) => {
  if (row) {
    kategoriForm.value = { ID: row.ID, NAMA: row.NAMA, JENIS: row.JENIS, TIPE: row.TIPE || '' }
    isNewTipeMode.value = false
  } else {
    kategoriForm.value = emptyKategoriForm()
    if (opts.presetJenis) kategoriForm.value.JENIS = opts.presetJenis
    if (opts.presetTipe) kategoriForm.value.TIPE = opts.presetTipe
    isNewTipeMode.value = !!opts.forceNewTipe || !existingTipeOptionsForJenis.value.length
  }
  showKategoriDialog.value = true
}

const submitKategori = async () => {
  if (!kategoriForm.value.NAMA?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Nama kategori wajib diisi', life: 3000 })
    return
  }
  savingKategori.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/kategori_transaksi_lain`, {
      ID: kategoriForm.value.ID || undefined,
      IDCLIENT: Number(id_client.value),
      NAMA: kategoriForm.value.NAMA.trim(),
      JENIS: kategoriForm.value.JENIS,
      TIPE: kategoriForm.value.TIPE || 'LAINNYA',
    })
    if (data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Kategori disimpan', life: 3000 })
      showKategoriDialog.value = false
      fetchKategori()
    } else {
      toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal menyimpan kategori', life: 4000 })
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.metadata?.message || 'Gagal menyimpan kategori', life: 4000 })
  } finally {
    savingKategori.value = false
  }
}

const confirmDeleteKategori = (row) => {
  confirm.require({
    message: `Hapus kategori "${row.NAMA}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Hapus',
    rejectLabel: 'Batal',
    acceptProps: { severity: 'danger' },
    accept: async () => {
      try {
        const { data } = await axios.post(`${apiUrl.value}/kategori_transaksi_lain_hapus`, {
          ID: row.ID,
          IDCLIENT: Number(id_client.value),
        })
        if (data?.metadata?.code === 200) {
          toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Kategori dihapus', life: 3000 })
          fetchKategori()
        } else {
          toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal menghapus kategori', life: 4000 })
        }
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.metadata?.message || 'Gagal menghapus kategori', life: 4000 })
      }
    },
  })
}

/* ══════════ Transaksi ══════════ */
const transaksiList = ref([])
const loadingTransaksi = ref(false)
const filterJenis = ref(null)
const now = new Date()
const dateStart = ref(new Date(now.getFullYear(), now.getMonth(), 1))
const dateEnd = ref(now)

const totalPemasukan = computed(() =>
  transaksiList.value.filter((t) => t.JENIS === 'PEMASUKAN').reduce((s, t) => s + (Number(t.JUMLAH) || 0), 0),
)
const totalPengeluaran = computed(() =>
  transaksiList.value.filter((t) => t.JENIS === 'PENGELUARAN').reduce((s, t) => s + (Number(t.JUMLAH) || 0), 0),
)

const fetchTransaksi = async () => {
  loadingTransaksi.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/transaksi_lain`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        dateStart: formatDateOnlyForAPI(dateStart.value),
        dateEnd: formatDateOnlyForAPI(dateEnd.value),
        jenis: filterJenis.value || undefined,
      },
    })
    transaksiList.value = data?.response ?? []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat transaksi', life: 4000 })
  } finally {
    loadingTransaksi.value = false
  }
}

const showTransaksiDialog = ref(false)
const savingTransaksi = ref(false)
const emptyTransaksiForm = () => ({ JENIS: 'PENGELUARAN', ID_KATEGORI: null, TANGGAL: new Date(), JUMLAH: null, KETERANGAN: '' })
const transaksiForm = ref(emptyTransaksiForm())

const kategoriOptionsForForm = computed(() => kategoriList.value.filter((k) => k.JENIS === transaksiForm.value.JENIS))

const onTransaksiJenisChange = () => {
  transaksiForm.value.ID_KATEGORI = null
}

const openTransaksiDialog = async () => {
  transaksiForm.value = emptyTransaksiForm()
  // Kategori mungkin belum dimuat kalau user belum buka tab Master Kategori
  if (!kategoriList.value.length) await fetchKategori()
  showTransaksiDialog.value = true
}

const submitTransaksi = async () => {
  if (!transaksiForm.value.ID_KATEGORI) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Kategori wajib dipilih', life: 3000 })
    return
  }
  if (!transaksiForm.value.JUMLAH || transaksiForm.value.JUMLAH <= 0) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Jumlah wajib diisi dan lebih dari 0', life: 3000 })
    return
  }
  savingTransaksi.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/transaksi_lain`, {
      IDCLIENT: Number(id_client.value),
      ID_LOKASI: Number(id_lokasi.value),
      ID_KATEGORI: transaksiForm.value.ID_KATEGORI,
      TANGGAL: formatDateOnlyForAPI(transaksiForm.value.TANGGAL),
      JUMLAH: transaksiForm.value.JUMLAH,
      KETERANGAN: transaksiForm.value.KETERANGAN || '',
      IDUSER: user_id.value,
    })
    if (data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Transaksi disimpan', life: 3000 })
      showTransaksiDialog.value = false
      fetchTransaksi()
    } else {
      toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal menyimpan transaksi', life: 4000 })
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.metadata?.message || 'Gagal menyimpan transaksi', life: 4000 })
  } finally {
    savingTransaksi.value = false
  }
}

const confirmDeleteTransaksi = (row) => {
  confirm.require({
    message: `Hapus transaksi "${row.NAMA_KATEGORI}" senilai ${formatRupiah(row.JUMLAH)}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Hapus',
    rejectLabel: 'Batal',
    acceptProps: { severity: 'danger' },
    accept: async () => {
      try {
        const { data } = await axios.post(`${apiUrl.value}/transaksi_lain_hapus`, {
          ID: row.ID,
          IDCLIENT: Number(id_client.value),
        })
        if (data?.metadata?.code === 200) {
          toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Transaksi dihapus', life: 3000 })
          fetchTransaksi()
        } else {
          toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal menghapus transaksi', life: 4000 })
        }
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: err?.response?.data?.metadata?.message || 'Gagal menghapus transaksi', life: 4000 })
      }
    },
  })
}

onMounted(() => {
  fetchKategori()
  fetchTransaksi()
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.filter-date {
  width: 150px;
}

.filter-sep {
  color: var(--p-text-muted-color);
}

.stat-row {
  display: grid;
  gap: 12px;
}

.stat-row-2 {
  grid-template-columns: repeat(2, 1fr);
}

.stat-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 10px;
  background: var(--p-surface-0, #fff);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 16px;
  font-weight: 800;
}

.stat-label {
  font-size: 11px;
  color: var(--p-text-muted-color);
}

.state-box-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 30px 10px;
  color: var(--p-text-muted-color);
  font-size: 13px;
}

.dialog-form {
  display: flex;
  flex-direction: column;
}

.dialog-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--p-text-muted-color);
  margin-bottom: 4px;
  display: block;
}

.dialog-hint {
  font-size: 11px;
  color: var(--p-text-muted-color);
  margin-top: 4px;
  display: block;
}

.kategori-newtipe-toggle {
  align-self: flex-start;
  margin-top: 6px;
  border: none;
  background: transparent;
  color: var(--p-primary-color);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.kategori-newtipe-toggle:hover {
  text-decoration: underline;
}

.kategori-tree {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.kategori-group {
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.15s ease;
}

.kategori-group:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.kategori-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--p-surface-50, #f8fafc);
  border-bottom: 1px solid var(--p-content-border-color, #eee);
}

.kategori-group-icon {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  background: var(--p-surface-100, #f1f5f9);
  color: var(--p-primary-color);
}

.kategori-group-heading {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.kategori-group-title {
  font-weight: 700;
  font-size: 13.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kategori-group-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kategori-group-count {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
}

.kategori-group-add-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

.kategori-child-list {
  display: flex;
  flex-direction: column;
}

.kategori-child-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px 9px 28px;
  border-bottom: 1px dashed var(--p-content-border-color, #eee);
  transition: background-color 0.12s ease;
}

.kategori-child-row:hover {
  background: var(--p-surface-50, #f8fafc);
}

.kategori-child-row:last-child {
  border-bottom: none;
}

.kategori-child-icon {
  font-size: 10px;
  color: var(--p-text-muted-color);
}

.kategori-child-nama {
  flex: 1;
  font-size: 13px;
}

.kategori-child-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.induk-chip {
  font-size: 12.5px;
  color: var(--p-text-color);
  white-space: nowrap;
}

.text-success {
  color: var(--p-green-600, #16a34a);
}

.text-danger {
  color: var(--p-red-500, #ef4444);
}

:deep(.p-datatable-thead > tr > th) {
  padding: 0.2rem 0.6rem;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.02rem 0.6rem;
}
</style>
