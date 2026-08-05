<template>
  <loading_overlay :is-loading="loading" message="Memuat data..." />

  <div class="content">
    <!-- Page Header -->
    <div class="card elevation-0">
      <div class="card-header d-flex align-items-center justify-content-between">
        <h4 class="m-0"><i class="pi pi-file-edit mr-2"></i> Master Jenis Surat Keterangan</h4>
        <Button
          label="Tambah Jenis Surat"
          icon="pi pi-plus"
          severity="success"
          size="small"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card elevation-0">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Cari Nama / Kode Surat</label>
            <InputText v-model="filterKeyword" placeholder="Cari nama atau kode..." class="w-100" />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Kategori</label>
            <Select
              v-model="filterKategori"
              :options="KATEGORI_SURAT_OPTIONS"
              optionLabel="label"
              optionValue="value"
              placeholder="Semua kategori"
              showClear
              class="w-100"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Status</label>
            <Select
              v-model="filterStatus"
              :options="[
                { label: 'Aktif', value: 1 },
                { label: 'Non-Aktif', value: 0 },
              ]"
              optionLabel="label"
              optionValue="value"
              placeholder="Semua"
              showClear
              class="w-100"
            />
          </div>
          <div class="col-md-3 d-flex gap-2">
            <Button label="Refresh" icon="pi pi-refresh" severity="secondary" @click="fetchData" />
            <Button
              label="Reset"
              icon="pi pi-filter-slash"
              severity="secondary"
              outlined
              @click="resetFilter"
            />
          </div>
        </div>
        <div class="mt-2 small text-muted">
          Menampilkan <b>{{ filteredList.length }}</b> dari <b>{{ listData.length }}</b> jenis surat
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card elevation-0">
      <div class="card-body p-0">
        <div v-if="!loading && filteredList.length === 0" class="empty-state">
          <i class="pi pi-file-edit empty-icon"></i>
          <h5 class="empty-title">Belum Ada Jenis Surat</h5>
          <p class="empty-desc">
            Tambahkan jenis surat keterangan (mis. Surat Sehat, Surat Sakit) beserta tarif dan
            template cetaknya.
          </p>
          <Button
            label="Tambah Jenis Surat"
            icon="pi pi-plus"
            severity="success"
            @click="openDialog()"
          />
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover table-bordered mb-0">
            <thead class="thead-primary">
              <tr>
                <th style="width: 4%">#</th>
                <th style="width: 10%">Kode</th>
                <th>Nama Surat</th>
                <th style="width: 10%">Kategori</th>
                <th style="width: 22%">Barang / Tarif</th>
                <th style="width: 8%; text-align: center">Status</th>
                <th style="width: 10%; text-align: center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in filteredList" :key="item.ID">
                <td class="text-center align-middle">{{ idx + 1 }}</td>
                <td class="align-middle mono">{{ item.KODE_SURAT || '-' }}</td>
                <td class="align-middle fw-semibold" style="font-size: 0.88rem">
                  {{ item.NAMA_SURAT }}
                </td>
                <td class="align-middle">
                  <span class="badge-jenis" :class="badgeClass(item.KATEGORI_SURAT)">
                    {{ labelKategori(item.KATEGORI_SURAT) }}
                  </span>
                </td>
                <td class="align-middle">
                  <div style="font-size: 0.82rem">
                    {{ item.NAMA_BARANG || '(barang tidak ditemukan)' }}
                  </div>
                  <div class="mono fw-semibold text-amber" style="font-size: 0.82rem">
                    {{ formatCurrency(item.HARGAJUAL) }}
                  </div>
                </td>
                <td class="text-center align-middle">
                  <Tag
                    :severity="Number(item.AKTIF) === 1 ? 'success' : 'secondary'"
                    :value="Number(item.AKTIF) === 1 ? 'Aktif' : 'Non-Aktif'"
                    style="font-size: 0.7rem"
                  />
                </td>
                <td class="text-center align-middle">
                  <div class="d-flex justify-content-center gap-1">
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      severity="warning"
                      rounded
                      title="Edit"
                      @click="openDialog(item)"
                    />
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      severity="danger"
                      rounded
                      title="Hapus"
                      @click="confirmDelete(item)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Dialog Input / Edit ── -->
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '92vw', maxWidth: '1200px' }"
    :closable="!isSaving"
    :header="editMode ? 'Edit Jenis Surat' : 'Tambah Jenis Surat'"
  >
    <div class="js-form">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label fw-semibold">Kode Surat</label>
          <InputText v-model="form.kode_surat" class="w-100" placeholder="mis. SAKIT" />
        </div>
        <div class="col-md-5">
          <label class="form-label fw-semibold">
            Nama Surat <span class="text-danger">*</span>
          </label>
          <InputText
            v-model="form.nama_surat"
            class="w-100"
            placeholder="mis. Surat Keterangan Sakit"
            :class="{ 'p-invalid': errors.nama_surat }"
          />
          <small v-if="errors.nama_surat" class="text-danger">{{ errors.nama_surat }}</small>
        </div>
        <div class="col-md-2">
          <label class="form-label fw-semibold">
            Kategori <span class="text-danger">*</span>
          </label>
          <Select
            v-model="form.kategori_surat"
            :options="KATEGORI_SURAT_OPTIONS"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih..."
            class="w-100"
            :class="{ 'p-invalid': errors.kategori_surat }"
          />
          <small v-if="errors.kategori_surat" class="text-danger">{{
            errors.kategori_surat
          }}</small>
        </div>
        <div class="col-md-2">
          <label class="form-label fw-semibold">Status</label>
          <div class="d-flex align-items-center gap-2 mt-2">
            <ToggleSwitch v-model="form.aktifBool" />
            <span :class="form.aktifBool ? 'text-success fw-semibold' : 'text-secondary'">
              {{ form.aktifBool ? 'Aktif' : 'Non-Aktif' }}
            </span>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-md-6">
          <label class="form-label fw-semibold">
            Barang / Tarif <span class="text-danger">*</span>
          </label>

          <Select
            v-model="form.barang"
            :options="barangOptions"
            filter
            optionLabel="NAMA"
            placeholder="Ketik nama barang jasa..."
            class="w-100"
            :loading="loadingBarang"
            :filterFields="['NAMA']"
            :class="{ 'p-invalid': errors.barang }"
            @filter="onFilterBarang"
          >
            <template #option="{ option }">
              <div class="d-flex justify-content-between">
                <span>{{ option.NAMA }}</span>
                <span class="mono text-amber fw-semibold">{{
                  formatCurrency(option.HARGAJUAL)
                }}</span>
              </div>
            </template>
            <template #empty>
              <div class="text-center text-muted small py-2">
                {{
                  barangKeyword.length < 2 ? 'Ketik minimal 2 karakter' : 'Barang tidak ditemukan'
                }}
              </div>
            </template>
          </Select>
          <small v-if="errors.barang" class="text-danger">{{ errors.barang }}</small>
          <small class="text-muted d-block mt-1">
            Hanya barang jasa (tidak potong stok) yang muncul di pencarian ini.
          </small>
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold">Masa Berlaku (hari)</label>
          <InputNumber
            v-model="form.masa_berlaku_hari"
            class="w-100"
            placeholder="Kosongkan jika tidak ada batas"
          />
        </div>
      </div>

      <!-- Template Word (.docx) -->
      <div class="mt-3">
        <label class="form-label fw-semibold mb-1 d-block">
          Template Cetak (Word .docx) <span class="text-danger">*</span>
        </label>

        <div class="docx-upload-box" :class="{ 'p-invalid': errors.template_file }">
          <div v-if="form.template_file" class="docx-current">
            <i class="pi pi-file-word docx-icon"></i>
            <div class="docx-current-info">
              <div class="docx-current-name">{{ templateFileName }}</div>
              <div class="docx-current-hint">
                Template tersimpan — unggah file baru untuk mengganti.
              </div>
            </div>
            <Button
              label="Lihat / Unduh"
              icon="pi pi-external-link"
              size="small"
              severity="secondary"
              outlined
              @click="previewTemplate"
            />
          </div>

          <FileUpload
            mode="basic"
            name="file"
            accept=".docx"
            :maxFileSize="5 * 1024 * 1024"
            :auto="true"
            chooseLabel="Pilih File .docx"
            :customUpload="true"
            :disabled="uploadingTemplate"
            @uploader="onUploadTemplate"
          />
          <ProgressBar
            v-if="uploadingTemplate"
            mode="indeterminate"
            style="height: 4px"
            class="mt-2"
          />
        </div>
        <small v-if="errors.template_file" class="text-danger d-block">{{
          errors.template_file
        }}</small>

        <div class="textarea-hint mt-2">
          <i class="pi pi-info-circle mr-1"></i>
          Buat surat di Microsoft Word seperti biasa (termasuk kop surat &amp; logo bila perlu),
          lalu tulis variabel dengan format <code>${nama_variabel}</code> persis di posisi yang
          ingin diisi otomatis. Saat dicetak, sistem mengisi variabel tersebut lalu mengonversi
          dokumen menjadi PDF.
        </div>
      </div>
    </div>

    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          :disabled="isSaving"
          @click="dialogVisible = false"
        />
        <Button
          :label="editMode ? 'Simpan Perubahan' : 'Simpan Jenis Surat'"
          icon="pi pi-save"
          severity="success"
          :loading="isSaving"
          @click="saveData"
        />
      </div>
    </template>
  </Dialog>

  <ConfirmDialog />
  <Toast />
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useSuratStore, KATEGORI_SURAT_OPTIONS } from '@/stores/surat'

const toast = useToast()
const confirm = useConfirm()
const suratStore = useSuratStore()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi } = storeToRefs(authStore)

// ── Data ──────────────────────────────────────────────────────────────────────
const loading = ref(false)
const isSaving = ref(false)
const listData = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    listData.value = await suratStore.fetchJenisSurat({ hanyaAktif: null })
    console.log('Fetched jenis surat:', listData.value)
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data jenis surat.',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

// ── Filter ────────────────────────────────────────────────────────────────────
const filterKeyword = ref('')
const filterKategori = ref(null)
const filterStatus = ref(null)

const filteredList = computed(() => {
  let result = listData.value
  const kw = filterKeyword.value.trim().toLowerCase()
  if (kw) {
    result = result.filter((d) =>
      (d.NAMA_SURAT + ' ' + (d.KODE_SURAT || '')).toLowerCase().includes(kw),
    )
  }
  if (filterKategori.value) result = result.filter((d) => d.KATEGORI_SURAT === filterKategori.value)
  if (filterStatus.value != null)
    result = result.filter((d) => Number(d.AKTIF) === filterStatus.value)
  return result
})

const resetFilter = () => {
  filterKeyword.value = ''
  filterKategori.value = null
  filterStatus.value = null
}

// ── Barang picker ─────────────────────────────────────────────────────────────
// Sumber data: layanan POS/apotik (apiApotikUrl), sama seperti pencarian barang
// jasa di TindakanCompnent.vue — bukan endpoint api/surat/search_barang di ws_sim_v2.
const barangOptions = ref([])
const loadingBarang = ref(false)
const barangKeyword = ref('')

const findItemSurat_Harga = async (mode, barcode) => {
  loadingBarang.value = true
  try {
    const param = {
      barcode: barcode || '',
      mode: 18,
      id_client: id_client.value,
      breakdown: 2,
      nama: barangKeyword.value || '',
      lokasi: id_lokasi.value,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    if (response.data?.metadata?.code == 200) {
      barangOptions.value = (response.data.response || []).map((item) => ({
        IDBARANG: item.BARCODE,
        NAMA: item.NAMABARANG || item.CAPTION,
        HARGAJUAL: item.HARGA,
      }))
    } else {
      barangOptions.value = []
      toast.add({
        severity: 'warn',
        summary: 'Tidak Ditemukan',
        detail: 'Tidak ada data barang ditemukan',
        life: 3000,
      })
    }
  } catch (error) {
    console.error('Error searching barang:', error)
    barangOptions.value = []
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal mencari data barang',
      life: 4000,
    })
  } finally {
    loadingBarang.value = false
  }
}

const onFilterBarang = async (event) => {
  barangKeyword.value = event.value || ''
  //await findItemSurat_Harga()
}

// ── Dialog Form ───────────────────────────────────────────────────────────────
const dialogVisible = ref(false)
const editMode = ref(false)
const editId = ref(null)

const form = reactive({
  kode_surat: '',
  nama_surat: '',
  kategori_surat: null,
  barang: null,
  masa_berlaku_hari: null,
  aktifBool: true,
  template_file: null,
})

const errors = reactive({ nama_surat: '', kategori_surat: '', barang: '', template_file: '' })
const clearErrors = () => {
  errors.nama_surat = ''
  errors.kategori_surat = ''
  errors.barang = ''
  errors.template_file = ''
}

const templateFileName = computed(() => {
  if (!form.template_file) return ''
  const parts = form.template_file.split('/')
  return parts[parts.length - 1]
})

// Buka file .docx yang tersimpan di tab baru — browser akan menampilkan/mengunduhnya
// sesuai aplikasi default (Word/LibreOffice), karena docx tidak bisa dirender langsung
// di dalam halaman web tanpa document server (OnlyOffice/Collabora/dll).
const previewTemplate = () => {
  if (!form.template_file) return
  window.open(`${configStore.apiBaseUrl}/${form.template_file}`, '_blank')
}

const labelKategori = (val) =>
  KATEGORI_SURAT_OPTIONS.find((o) => o.value === val)?.label || val || '—'
const badgeClassMap = { SEHAT: 'badge-sehat', SAKIT: 'badge-sakit', KEJIWAAN: 'badge-kejiwaan' }
const badgeClass = (val) => badgeClassMap[val] || 'badge-lainnya'

const formatCurrency = (val) =>
  val || val === 0
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(val)
    : '-'

// ── Upload template Word (.docx) ───────────────────────────────────────────────
const uploadingTemplate = ref(false)

const onUploadTemplate = async (event) => {
  const file = event.files?.[0]
  if (!file) return

  uploadingTemplate.value = true
  try {
    const res = await suratStore.uploadTemplateFile(file)
    if (Number(res?.code) === 200) {
      form.template_file = res.template_file
      errors.template_file = ''
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Template berhasil diunggah.',
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res?.message || 'Gagal mengunggah template.',
        life: 5000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Koneksi ke server gagal.',
      life: 5000,
    })
  } finally {
    uploadingTemplate.value = false
  }
}

// ── Open / Validate / Save ─────────────────────────────────────────────────────
const openDialog = async (item = null) => {
  clearErrors()
  barangKeyword.value = ''
  barangOptions.value = []

  if (item) {
    editMode.value = true
    editId.value = item.ID
    loading.value = true
    try {
      const res = await suratStore.getJenisSurat(item.ID)
      const detail = res?.response || item
      form.kode_surat = detail.KODE_SURAT || ''
      form.nama_surat = detail.NAMA_SURAT || ''
      form.kategori_surat = detail.KATEGORI_SURAT || null
      form.masa_berlaku_hari =
        detail.MASA_BERLAKU_HARI !== null &&
        detail.MASA_BERLAKU_HARI !== undefined &&
        detail.MASA_BERLAKU_HARI !== ''
          ? Number(detail.MASA_BERLAKU_HARI)
          : null
      form.aktifBool = Number(detail.AKTIF) === 1
      form.template_file = detail.TEMPLATE_FILE || null

      if (detail.IDBARANG) {
        // Cari barang aslinya langsung ke layanan apotik berdasarkan IDBARANG,
        // supaya nama & harga yang tampil akurat (bukan bergantung pada join
        // lokal ws_sim_v2 yang IDBARANG-nya bisa tidak match dengan sumber picker).
        await findItemSurat_Harga(undefined, detail.IDBARANG)
        const found = barangOptions.value.find(
          (b) => String(b.IDBARANG) === String(detail.IDBARANG),
        )

        if (found) {
          form.barang = found
        } else {
          // Tidak ketemu sama sekali — tetap tampilkan ID barang-nya sebagai
          // fallback supaya field ini tidak kosong total.
          form.barang = {
            IDBARANG: detail.IDBARANG,
            NAMA: detail.NAMA_BARANG || `ID Barang: ${detail.IDBARANG}`,
            HARGAJUAL: detail.HARGAJUAL,
          }
          barangOptions.value = [form.barang, ...barangOptions.value]
          toast.add({
            severity: 'warn',
            summary: 'Barang Tidak Ditemukan',
            detail:
              'Barang dengan ID tersebut tidak ditemukan di layanan apotik. Pilih ulang jika perlu memperbarui.',
            life: 5000,
          })
        }
      } else {
        form.barang = null
      }
    } finally {
      loading.value = false
    }
  } else {
    editMode.value = false
    editId.value = null
    form.kode_surat = ''
    form.nama_surat = ''
    form.kategori_surat = null
    form.barang = null
    form.masa_berlaku_hari = null
    form.aktifBool = true
    form.template_file = null

    // Muat daftar barang begitu form "Tambah" dibuka, supaya Select "Barang/Tarif"
    // sudah terisi tanpa perlu mengetik dulu.
    await findItemSurat_Harga()
  }
  dialogVisible.value = true
}

const validate = () => {
  clearErrors()
  let ok = true
  if (!form.nama_surat.trim()) {
    errors.nama_surat = 'Nama surat wajib diisi.'
    ok = false
  }
  if (!form.kategori_surat) {
    errors.kategori_surat = 'Kategori wajib dipilih.'
    ok = false
  }
  if (!form.barang) {
    errors.barang = 'Barang/tarif wajib dipilih.'
    ok = false
  }
  if (!form.template_file) {
    errors.template_file = 'Template Word (.docx) wajib diunggah.'
    ok = false
  }
  return ok
}

const saveData = async () => {
  if (!validate()) return
  isSaving.value = true
  try {
    const res = await suratStore.saveJenisSurat({
      id: editId.value || null,
      kode_surat: form.kode_surat.trim() || null,
      nama_surat: form.nama_surat.trim(),
      kategori_surat: form.kategori_surat,
      idbarang: form.barang?.IDBARANG,
      masa_berlaku_hari: form.masa_berlaku_hari,
      aktif: form.aktifBool ? 1 : 0,
      template_file: form.template_file,
    })
    if (Number(res?.code) === 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: editMode.value
          ? 'Jenis surat berhasil diperbarui.'
          : 'Jenis surat baru berhasil disimpan.',
        life: 3000,
      })
      dialogVisible.value = false
      fetchData()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res?.message || 'Terjadi kesalahan saat menyimpan.',
        life: 5000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Koneksi ke server gagal.',
      life: 5000,
    })
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (item) => {
  confirm.require({
    message: `Hapus jenis surat "${item.NAMA_SURAT}"? Surat yang sudah pernah dibuat sebelumnya tidak akan terhapus.`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => deleteData(item),
  })
}

const deleteData = async (item) => {
  loading.value = true
  try {
    const res = await suratStore.deleteJenisSurat(item.ID)
    if (Number(res?.code) === 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Jenis surat berhasil dihapus.',
        life: 3000,
      })
      fetchData()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res?.message || 'Gagal menghapus jenis surat.',
        life: 5000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Koneksi ke server gagal.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

findItemSurat_Harga()
fetchData()
</script>

<style scoped>
.thead-primary th {
  background: linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  border-color: rgba(255, 255, 255, 0.15) !important;
  padding: 0.6rem 0.85rem;
  white-space: nowrap;
}

.mono {
  font-family: monospace;
}
.text-amber {
  color: #b45309;
}

.badge-jenis {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.badge-sehat {
  background: #dcfce7;
  color: #15803d;
}
.badge-sakit {
  background: #fee2e2;
  color: #b91c1c;
}
.badge-kejiwaan {
  background: #f3e8ff;
  color: #6b21a8;
}
.badge-lainnya {
  background: #f1f5f9;
  color: #475569;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}
.empty-icon {
  font-size: 3.5rem;
  opacity: 0.15;
  display: block;
  margin-bottom: 1rem;
}
.empty-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.4rem;
}
.empty-desc {
  font-size: 0.88rem;
  max-width: 420px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
}

.js-form {
  padding: 0.25rem 0;
}
.char-count {
  font-size: 0.75rem;
  color: #94a3b8;
}
.textarea-hint {
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.docx-upload-box {
  padding: 0.9rem 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
}
.docx-upload-box.p-invalid {
  border-color: #ef4444;
}
.docx-current {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 0.7rem;
  margin-bottom: 0.75rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.docx-icon {
  font-size: 1.6rem;
  color: #2563a8;
}
.docx-current-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  word-break: break-all;
}
.docx-current-hint {
  font-size: 0.72rem;
  color: #94a3b8;
}
</style>
