<template>
  <div class="card card-outline">
    <!-- Card Header -->
    <div class="card-header">
      <h3 class="card-title"><i class="fas fa-boxes mr-2"></i>Master Assets</h3>
      <div class="card-tools">
        <Button label="Tambah Asset" icon="pi pi-plus" severity="success" @click="openForm()" />
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <!-- Search -->
      <div class="row mb-3">
        <div class="col-md-4">
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
            </div>
            <InputText
              v-model="globalFilter"
              placeholder="Cari asset..."
              class="form-control form-control-sm"
            />
          </div>
        </div>
      </div>

      <!-- DataTable -->
      <DataTable
        :value="data_asset"
        paginator
        :rows="10"
        :globalFilterFields="['no_inventaris', 'nama_aset', 'kategori', 'ruangan', 'kondisi']"
        responsiveLayout="scroll"
        stripedRows
        showGridlines
        class="table table-bordered table-striped table-hover"
      >
        <Column field="no_inventaris" header="No Inventaris" sortable />
        <Column field="nama_aset" header="Nama Aset" sortable />
        <Column field="kategori" header="Kategori" sortable />
        <Column field="ruangan" header="Ruangan" sortable />
        <Column header="Harga">
          <template #body="slotProps">
            Rp {{ formatCurrency(slotProps.data.harga_beli) }}
          </template>
        </Column>
        <Column header="Kondisi">
          <template #body="slotProps">
            <Tag :value="slotProps.data.kondisi" :severity="getSeverity(slotProps.data.kondisi)" />
          </template>
        </Column>
        <Column header="Garansi">
          <template #body="slotProps">{{ slotProps.data.garansi_sampai }}</template>
        </Column>
        <Column header="Aksi" style="width: 140px; text-align: center">
          <template #body="slotProps">
            <!-- Edit -->
            <button
              class="btn btn-info btn-xs mr-1"
              @click="editAsset(slotProps.data)"
              title="Edit"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>
            <!-- Link Asset -->
            <button
              class="btn btn-warning btn-xs mr-1"
              @click="openLinkDialog(slotProps.data)"
              title="Link Tindakan"
            >
              <i class="fas fa-link"></i>
            </button>
            <!-- Hapus -->
            <button
              class="btn btn-danger btn-xs"
              @click="deleteAsset(slotProps.data)"
              title="Hapus"
            >
              <i class="fas fa-trash"></i>
            </button>
          </template>
        </Column>
      </DataTable>
    </div>
    <!-- /.card-body -->

    <!-- ===== DIALOG FORM TAMBAH / EDIT ===== -->
    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :draggable="false"
      :closable="true"
      :style="{ width: '680px', borderRadius: '8px', overflow: 'hidden' }"
      :pt="{
        header: { style: 'background:#4A8C7A; color:#fff; padding: 14px 20px;' },
        closeButton: { style: 'color:#fff' },
        content: { style: 'padding: 0' },
        footer: { style: 'background:#f8f9fa; border-top: 1px solid #dee2e6; padding: 12px 20px;' },
      }"
    >
      <template #header>
        <div class="d-flex align-items-center gap-2">
          <i
            :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"
            style="font-size: 1.1rem"
          ></i>
          <span style="font-size: 1rem; font-weight: 600; letter-spacing: 0.3px">
            {{ isEditMode ? 'Edit Asset' : 'Tambah Asset Baru' }}
          </span>
        </div>
      </template>

      <div style="padding: 20px 24px; background: #fff">
        <div class="section-label"><i class="fas fa-tag mr-1"></i> Identitas Asset</div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group" :class="{ 'has-error': errors.no_inventaris }">
              <label class="col-form-label-sm fw-semibold">
                No. Inventaris <span class="text-danger">*</span>
              </label>
              <InputText
                v-model="form.no_inventaris"
                placeholder="Contoh: AST-003"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors.no_inventaris }"
              />
              <div v-if="errors.no_inventaris" class="invalid-feedback d-block">
                <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.no_inventaris }}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group" :class="{ 'has-error': errors.nama_aset }">
              <label class="col-form-label-sm fw-semibold">
                Nama Aset <span class="text-danger">*</span>
              </label>
              <InputText
                v-model="form.nama_aset"
                placeholder="Contoh: Laptop Dell Latitude"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors.nama_aset }"
              />
              <div v-if="errors.nama_aset" class="invalid-feedback d-block">
                <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.nama_aset }}
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group" :class="{ 'has-error': errors.kategori }">
              <label class="col-form-label-sm fw-semibold">
                Kategori <span class="text-danger">*</span>
              </label>
              <Select
                v-model="form.kategori"
                :options="kategoriOptions"
                placeholder="— Pilih Kategori —"
                class="w-100"
                :class="{ 'p-invalid': errors.kategori }"
                :pt="{ root: { class: 'form-select-sm-wrapper' } }"
              />
              <div v-if="errors.kategori" class="invalid-feedback d-block">
                <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.kategori }}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group" :class="{ 'has-error': errors.lokasi }">
              <label class="col-form-label-sm fw-semibold">
                Ruangan/Lokasi <span class="text-danger">*</span>
              </label>
              <div class="d-flex gap-2 flex-wrap mt-1">
                <Select
                  v-model="form.lokasi"
                  :options="lokasi_arr"
                  optionLabel="DISPLAY"
                  placeholder="— Pilih Lokasi —"
                  class="w-100"
                  filter
                  :class="{ 'p-invalid': errors.lokasi }"
                />
              </div>
              <div v-if="errors.lokasi" class="invalid-feedback d-block">
                <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.lokasi }}
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group" :class="{ 'has-error': errors.manufaktur }">
              <label class="col-form-label-sm fw-semibold">
                Manufaktur <span class="text-danger">*</span>
              </label>
              <InputText
                v-model="form.manufaktur"
                placeholder="Contoh: Dell, HP, Lenovo"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors.manufaktur }"
              />
              <div v-if="errors.manufaktur" class="invalid-feedback d-block">
                <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.manufaktur }}
              </div>
            </div>
          </div>
        </div>

        <hr class="my-3" style="border-color: #e9ecef" />

        <div class="section-label"><i class="fas fa-info-circle mr-1"></i> Detail & Kondisi</div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-form-label-sm fw-semibold">Harga Beli (Rp)</label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text" style="background: #f8f9fa; font-weight: 600"
                    >Rp</span
                  >
                </div>
                <InputNumber
                  v-model="form.harga_beli"
                  locale="id-ID"
                  :min="0"
                  placeholder="0"
                  :pt="{
                    root: { style: 'flex:1' },
                    input: {
                      class: 'form-control form-control-sm',
                      style: 'border-left:0; border-radius:0 4px 4px 0',
                    },
                  }"
                />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group" :class="{ 'has-error': errors.kondisi }">
              <label class="col-form-label-sm fw-semibold">
                Kondisi <span class="text-danger">*</span>
              </label>
              <div class="d-flex gap-2 flex-wrap mt-1">
                <Select
                  v-model="form.kondisi"
                  :options="kondisiOptions"
                  placeholder="— Pilih Kondisi —"
                  class="w-100"
                  :class="{ 'p-invalid': errors.kondisi }"
                />
              </div>
              <div v-if="errors.kondisi" class="invalid-feedback d-block mt-1">
                <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.kondisi }}
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-form-label-sm fw-semibold">Garansi Sampai</label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                </div>
                <DatePicker
                  v-model="form.garansi_sampai"
                  dateFormat="yy-mm-dd"
                  placeholder="Pilih tanggal"
                  style="width: 90%"
                  :pt="{
                    input: {
                      class: 'form-control form-control-sm',
                      style: 'border-left:0; border-radius:0 4px 4px 0',
                    },
                  }"
                />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-form-label-sm fw-semibold">Tanggal Perolehan</label>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text"><i class="fas fa-calendar-check"></i></span>
                </div>
                <DatePicker
                  v-model="form.tanggal_perolehan"
                  dateFormat="yy-mm-dd"
                  placeholder="Pilih tanggal"
                  style="width: 90%"
                  :pt="{
                    input: {
                      class: 'form-control form-control-sm',
                      style: 'border-left:0; border-radius:0 4px 4px 0',
                    },
                  }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-group mb-0">
          <label class="col-form-label-sm fw-semibold">Keterangan</label>
          <Textarea
            v-model="form.keterangan"
            :rows="3"
            placeholder="Catatan tambahan (opsional)..."
            autoResize
            class="form-control form-control-sm"
          />
        </div>
      </div>

      <template #footer>
        <div class="d-flex justify-content-between align-items-center w-100">
          <small class="text-muted"><span class="text-danger">*</span> Wajib diisi</small>
          <div class="d-flex gap-2">
            <Button class="btn btn-default btn-sm" @click="closeDialog">
              <i class="fas fa-times mr-1"></i>Batal
            </Button>
            <Button @click="submitForm" :loading="loading">
              <i :class="isEditMode ? 'fas fa-save' : 'fas fa-plus'" class="mr-1"></i>
              {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Asset' }}
            </Button>
          </div>
        </div>
      </template>
    </Dialog>

    <!-- ===== DIALOG LINK TINDAKAN (MULTIPLE) ===== -->
    <Dialog
      v-model:visible="linkDialogVisible"
      :modal="true"
      :draggable="false"
      :closable="true"
      :style="{ width: '820px', borderRadius: '8px', overflow: 'hidden' }"
      :pt="{
        header: { style: 'background:#5B6EAE; color:#fff; padding: 14px 20px;' },
        closeButton: { style: 'color:#fff' },
        content: { style: 'padding: 0' },
        footer: { style: 'background:#f8f9fa; border-top: 1px solid #dee2e6; padding: 12px 20px;' },
      }"
    >
      <!-- Header Dialog Link -->
      <template #header>
        <div class="d-flex align-items-center gap-2">
          <i class="fas fa-link" style="font-size: 1.1rem"></i>
          <span style="font-size: 1rem; font-weight: 600; letter-spacing: 0.3px">
            Link Tindakan — {{ linkSourceAsset?.nama_aset ?? '' }}
          </span>
        </div>
      </template>

      <!-- Body Dialog Link -->
      <div style="padding: 20px 24px; background: #fff">
        <!-- Info asset sumber -->
        <div class="link-source-info mb-3">
          <div class="link-source-badge">
            <i class="fas fa-cube mr-2"></i>
            <strong>Asset Sumber:</strong>
            <span class="ml-2">{{ linkSourceAsset?.no_inventaris }}</span>
            <span class="mx-2">·</span>
            <span>{{ linkSourceAsset?.nama_aset }}</span>
            <span class="mx-2">·</span>
            <Tag
              :value="linkSourceAsset?.kondisi"
              :severity="getSeverity(linkSourceAsset?.kondisi)"
              style="font-size: 0.72rem"
            />
          </div>
        </div>

        <!-- Layout dua kolom: kiri = daftar terpilih, kanan = browse -->
        <div class="link-two-col">
          <!-- ── Kolom Kiri: Tindakan yang sudah terhubung ── -->
          <div class="link-col-left">
            <div class="section-label link-section-label">
              <i class="fas fa-check-circle mr-1"></i>
              Tindakan Terhubung
              <span v-if="linkedAssets.length > 0" class="linked-count-badge">
                {{ linkedAssets.length }}
              </span>
            </div>

            <!-- Daftar item terpilih -->
            <div v-if="linkedAssets.length > 0" class="linked-multi-list">
              <div
                v-for="(item, idx) in linkedAssets"
                :key="item.BARCODE ?? idx"
                class="linked-multi-card"
              >
                <div class="linked-multi-index">{{ idx + 1 }}</div>
                <div class="linked-multi-icon">
                  <i class="fas fa-stethoscope"></i>
                </div>
                <div class="linked-multi-info">
                  <span class="linked-multi-caption">{{ item.BARCODE }} - {{ item.NAMA }}</span>
                  <span v-if="item.KATEGORI" class="linked-multi-cat">{{ item.KATEGORI }}</span>
                </div>
                <button
                  class="linked-remove-btn"
                  @click="removeLinkAsset(item)"
                  title="Hapus tindakan ini"
                >
                  <i class="fas fa-times-circle"></i>
                </button>
              </div>
            </div>

            <!-- Kosong -->
            <div v-else class="empty-linked">
              <i class="fas fa-unlink mr-2"></i>
              <span>Belum ada tindakan<br />yang terhubung.</span>
            </div>

            <!-- Hapus semua -->
            <div v-if="linkedAssets.length > 1" class="mt-2 text-right">
              <button
                class="btn btn-outline-danger btn-xs"
                @click="clearAllLinked"
                title="Hapus semua tindakan terpilih"
              >
                <i class="fas fa-trash mr-1"></i>Hapus Semua
              </button>
            </div>
          </div>

          <!-- ── Divider vertikal ── -->
          <div class="link-col-divider"></div>

          <!-- ── Kolom Kanan: Browse tindakan ── -->
          <div class="link-col-right">
            <div class="section-label link-section-label">
              <i class="fas fa-search mr-1"></i> Browse Tindakan
            </div>

            <!-- Input pencarian -->
            <div class="input-group input-group-sm mb-2">
              <div class="input-group-prepend">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
              </div>
              <InputText
                v-model="browseFilter"
                placeholder="Ketik nama / no. inventaris..."
                class="form-control form-control-sm"
              />
              <div v-if="browseFilter" class="input-group-append">
                <button class="btn btn-outline-secondary btn-sm" @click="browseFilter = ''">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Hint ketik dulu -->
            <div v-if="!browseFilter.trim()" class="browse-hint">
              <i class="fas fa-keyboard mr-2"></i>Ketik untuk mencari tindakan yang tersedia.
            </div>

            <!-- Loading browse -->
            <div v-else-if="browseLoading" class="browse-hint">
              <i class="fas fa-spinner fa-spin mr-2"></i>Memuat data...
            </div>

            <!-- Tabel browse -->
            <DataTable
              v-else
              :value="masterBarangAssets"
              :rows="6"
              paginator
              responsiveLayout="scroll"
              stripedRows
              showGridlines
              class="table table-bordered table-hover browse-table"
              style="font-size: 0.82rem"
            >
              <!-- Kolom aksi -->
              <Column style="width: 48px; text-align: center">
                <template #body="slotProps">
                  <!-- Sudah terpilih → tombol merah untuk hapus -->
                  <button
                    v-if="isLinked(slotProps.data)"
                    class="btn btn-danger btn-xs link-toggle-btn linked"
                    @click="removeLinkAsset(slotProps.data)"
                    title="Hapus dari pilihan"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <!-- Belum terpilih → tombol hijau untuk tambah -->
                  <button
                    v-else
                    class="btn btn-success btn-xs link-toggle-btn"
                    @click="addLinkAsset(slotProps.data)"
                    title="Tambahkan tindakan ini"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </template>
              </Column>
              <Column field="CAPTION" header="Nama Tindakan" sortable />
              <Column field="KATEGORI" header="Kategori" sortable />
            </DataTable>

            <!-- Kosong hasil browse -->
            <div
              v-if="browseFilter.trim() && !browseLoading && masterBarangAssets.length === 0"
              class="browse-hint"
            >
              <i class="fas fa-search-minus mr-2"></i>Tidak ada hasil untuk
              <strong>"{{ browseFilter }}"</strong>.
            </div>
          </div>
        </div>
        <!-- /.link-two-col -->
      </div>
      <!-- /.body link dialog -->

      <!-- Footer Link Dialog -->
      <template #footer>
        <div class="d-flex justify-content-between align-items-center w-100">
          <small class="text-muted">
            <i class="fas fa-info-circle mr-1"></i>
            Satu alat dapat memiliki <strong>beberapa tindakan</strong> yang terhubung.
          </small>
          <div class="d-flex gap-2">
            <Button class="btn btn-default btn-sm" @click="closeLinkDialog">
              <i class="fas fa-times mr-1"></i>Tutup
            </Button>
            <Button class="btn btn-primary btn-sm" @click="saveLinkAssets" :loading="linkLoading">
              <i class="fas fa-save mr-1"></i>Simpan Link
              <span v-if="linkedAssets.length > 0" class="ml-1">({{ linkedAssets.length }})</span>
            </Button>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
  <Toast />
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import DatePicker from 'primevue/datepicker'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, id_lokasi } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

// ─── Static data ─────────────────────────────────────────
const kategoriOptions = ['IT', 'Medis', 'Furnitur', 'Kendaraan', 'Elektronik', 'Lainnya']
const kondisiOptions = ['Baik', 'Dalam Perbaikan', 'Rusak', 'Tidak Aktif']

// ─── Dialog state (Tambah / Edit) ────────────────────────
const dialogVisible = ref(false)
const isEditMode = ref(false)
const editId = ref(null)

const defaultForm = () => ({
  no_inventaris: '',
  nama_aset: '',
  kategori: null,
  manufaktur: '',
  ruangan: '',
  lokasi: null,
  harga_beli: null,
  kondisi: null,
  garansi_sampai: null,
  tanggal_perolehan: null,
  keterangan: '',
  id_client: id_client.value,
})

const form = reactive(defaultForm())
const errors = reactive({})

const clearErrors = () => Object.keys(errors).forEach((k) => delete errors[k])
const resetForm = () => {
  Object.assign(form, defaultForm())
  clearErrors()
}

const formatDateToString = (date) => {
  if (!date) return null
  if (typeof date === 'string') return date
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const openForm = () => {
  isEditMode.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const editAsset = (data) => {
  isEditMode.value = true
  editId.value = data.id
  Object.assign(form, {
    no_inventaris: data.no_inventaris ?? '',
    nama_aset: data.nama_aset ?? '',
    kategori: data.kategori ?? null,
    manufaktur: data.manufaktur ?? '',
    ruangan: data.ruangan ?? '',
    lokasi: lokasi_arr.value.find((l) => l.DISPLAY === data.ruangan) ?? null,
    harga_beli: data.harga_beli ?? null,
    kondisi: data.kondisi ?? null,
    garansi_sampai: data.garansi_sampai ? new Date(data.garansi_sampai) : null,
    tanggal_perolehan: data.tanggal_perolehan ? new Date(data.tanggal_perolehan) : null,
    keterangan: data.keterangan ?? '',
    id_client: id_client.value,
  })
  clearErrors()
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const validate = () => {
  clearErrors()
  if (!form.no_inventaris.trim()) errors.no_inventaris = 'No Inventaris wajib diisi.'
  if (!form.nama_aset.trim()) errors.nama_aset = 'Nama Aset wajib diisi.'
  if (!form.kategori) errors.kategori = 'Kategori wajib dipilih.'
  if (!form.kondisi) errors.kondisi = 'Kondisi wajib dipilih.'
  if (!form.manufaktur?.trim()) errors.manufaktur = 'Manufaktur wajib diisi.'
  return Object.keys(errors).length === 0
}

const submitForm = () => {
  if (!validate()) return
  const payload = {
    ...form,
    ruangan: form.lokasi?.DISPLAY ?? form.ruangan ?? '',
    garansi_sampai: formatDateToString(form.garansi_sampai),
    tanggal_perolehan: formatDateToString(form.tanggal_perolehan),
  }
  if (isEditMode.value) updateAsset({ id: editId.value, ...payload })
  else insertAsset(payload)
}

// ─── Insert asset ─────────────────────────────────────────
const insertAsset = async (data) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/asset/insert_asset`, data)
    if (response.data.metadata.code !== 200) {
      showError(response.data.metadata.message || 'Gagal menambahkan asset')
      return
    }
    showSuccess(response.data.metadata.message || 'Asset berhasil ditambahkan')
    await get_master_data()
    closeDialog()
  } catch (error) {
    console.error('Error inserting asset:', error)
    showError('Terjadi kesalahan saat menambahkan asset')
  } finally {
    loading.value = false
  }
}

// ─── Update asset ─────────────────────────────────────────
const updateAsset = async (data) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const response = await axios.post(`${url}/index.php/api/asset/update_asset`, data)
    if (response.data.metadata.code !== 200) {
      showError(response.data.metadata.message || 'Gagal mengupdate asset')
      return
    }
    showSuccess(response.data.metadata.message || 'Asset berhasil diupdate')
    const idx = data_asset.value.findIndex((a) => a.id === data.id)
    if (idx !== -1) data_asset.value[idx] = { ...data_asset.value[idx], ...data }
    closeDialog()
  } catch (error) {
    console.error('Error updating asset:', error)
    if (error.response?.status === 404) showError('Asset tidak ditemukan')
    else if (error.response?.status === 422)
      showError('Data tidak valid: ' + (error.response.data?.message ?? ''))
    else showError('Terjadi kesalahan saat mengupdate asset')
  } finally {
    loading.value = false
  }
}

// ─── Delete asset ─────────────────────────────────────────
const deleteAsset = async (data) => {
  if (!confirm(`Yakin hapus asset "${data.nama_aset}"?`)) return
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const param = {
      id_client: id_client.value,
      id: data.id,
    }
    const response = await axios.post(`${url}/index.php/api/asset/delete_asset`, param)
    if (response.data.metadata.code !== 200) {
      showError(response.data.metadata.message || 'Gagal menghapus asset')
      return
    }
    showSuccess(response.data.metadata.message || 'Asset berhasil dihapus')
    data_asset.value = data_asset.value.filter((a) => a.id !== data.id)
  } catch (error) {
    console.error('Error deleting asset:', error)
    showError('Terjadi kesalahan saat menghapus asset')
  } finally {
    loading.value = false
  }
}

// ─── Fetch lokasi ─────────────────────────────────────────
const lokasi_arr = ref([])
const get_lokasi = async () => {
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/get_list_stock_lokasi/${id_client.value}`,
    )
    lokasi_arr.value = response.data.response
  } catch (error) {
    console.error('Error fetching lokasi data:', error)
    showError('Gagal memuat data lokasi')
  }
}

// ─── Fetch master asset ───────────────────────────────────
const data_asset = ref([])
const get_master_data = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/asset/get_data_asset`, {
      id_client: id_client.value,
    })
    data_asset.value = response.data.response
  } catch (error) {
    console.error('Error fetching master asset data:', error)
    showError('Gagal memuat data asset')
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────────────────
// ===== FITUR LINK TINDAKAN (MULTIPLE) =====
// ─────────────────────────────────────────────────────────

const linkDialogVisible = ref(false)
const linkSourceAsset = ref(null) // Asset yang sedang di-link
const linkedAssets = ref([]) // Array tindakan yang terpilih (tidak terbatas)
const linkLoading = ref(false)

// Filter browse
const browseFilter = ref('')
const browseLoading = ref(false)

// ── Buka dialog link ──────────────────────────────────────
const openLinkDialog = async (asset) => {
  linkSourceAsset.value = asset
  browseFilter.value = ''
  linkedAssets.value = []
  masterBarangAssets.value = []
  linkDialogVisible.value = true
  // Muat data tindakan yang sudah tersimpan sebelumnya
  await fetchLinkedAssets(asset.id)
}

// ── Tutup dialog link ─────────────────────────────────────
const closeLinkDialog = () => {
  linkDialogVisible.value = false
  linkSourceAsset.value = null
  linkedAssets.value = []
  masterBarangAssets.value = []
  browseFilter.value = ''
}

// ── Ambil tindakan yang sudah terhubung dari API ──────────
const fetchLinkedAssets = async (assetId) => {
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      id_client: id_client.value,
      id_asset: assetId,
    }

    const response = await axios.post(`${url}/index.php/api/asset/get_linked_assets`, payload)

    if (response.data.metadata.code === 200) {
      linkedAssets.value = response.data.response ?? []
    } else {
      linkedAssets.value = []
    }
  } catch (error) {
    console.error('Error fetching linked assets:', error)
    linkedAssets.value = []
  }
}

// ── Debounce watch browseFilter → panggil API ─────────────
let browseDebounce = null
watch(browseFilter, () => {
  clearTimeout(browseDebounce)
  browseDebounce = setTimeout(() => {
    getMasterBarangAsset()
  }, 400)
})

// ── Fetch tindakan dari API berdasarkan keyword ───────────
const masterBarangAssets = ref([])
const getMasterBarangAsset = async () => {
  if (browseFilter.value.trim() === '') {
    masterBarangAssets.value = []
    return
  }
  try {
    browseLoading.value = true
    const url = configStore.apiApotikUrl
    const payload = {
      id_client: id_client.value,
      breakdown: 1,
      nama: browseFilter.value,
      mode: 17,
      lokasi: id_lokasi.value,
    }
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, payload)
    if (response.data.metadata.code === '200') {
      masterBarangAssets.value = response.data.response ?? []
    } else {
      masterBarangAssets.value = []
    }
  } catch (error) {
    console.error('Error fetching master barang assets:', error)
    masterBarangAssets.value = []
  } finally {
    browseLoading.value = false
  }
}

// ── Cek apakah tindakan sudah ada di linkedAssets ─────────
const isLinked = (asset) => linkedAssets.value.some((a) => a.BARCODE === asset.BARCODE)

// ── Tambah tindakan ke daftar terpilih (tidak terbatas) ───
const addLinkAsset = (asset) => {
  if (isLinked(asset)) return
  linkedAssets.value = [...linkedAssets.value, asset]
}

// ── Hapus satu tindakan dari daftar terpilih ──────────────
const removeLinkAsset = (asset) => {
  linkedAssets.value = linkedAssets.value.filter((a) => a.BARCODE !== asset.BARCODE)
}

// ── Hapus semua tindakan terpilih ─────────────────────────
const clearAllLinked = () => {
  if (!confirm('Yakin hapus semua tindakan yang terpilih?')) return
  linkedAssets.value = []
}

// ── Simpan semua link tindakan ke API ─────────────────────
const saveLinkAssets = async () => {
  try {
    linkLoading.value = true
    const url = configStore.apiBaseUrl
    const payload = {
      id_asset: linkSourceAsset.value.id,
      id_client: id_client.value,
      linked_ids: linkedAssets.value, // array banyak item
    }

    const response = await axios.post(`${url}/index.php/api/asset/save_linked_asset`, payload)
    if (response.data.metadata.code !== 200) {
      showError(response.data.metadata.message || 'Gagal menyimpan link tindakan')
      return
    }
    showSuccess(response.data.metadata.message || 'Link tindakan berhasil disimpan')
    closeLinkDialog()
  } catch (error) {
    console.error('Error saving linked assets:', error)
    showError('Terjadi kesalahan saat menyimpan link tindakan')
  } finally {
    linkLoading.value = false
  }
}

// ─── Table helpers ────────────────────────────────────────
const globalFilter = ref('')

// ─── Toast helpers ────────────────────────────────────────
const showSuccess = (message = 'Operasi berhasil') =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 })

const showError = (message = 'Terjadi kesalahan') =>
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })

const showWarning = (message) =>
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: message, life: 4000 })

// ─── Format helpers ───────────────────────────────────────
const formatCurrency = (v) => new Intl.NumberFormat('id-ID').format(v ?? 0)

const getSeverity = (k) =>
  ({
    Baik: 'success',
    'Dalam Perbaikan': 'warning',
    Rusak: 'danger',
    'Tidak Aktif': 'secondary',
  })[k] ?? null

// ─── Init ─────────────────────────────────────────────────
onMounted(() => {
  get_lokasi()
  get_master_data()
})
</script>

<style scoped>
/* ── Section label ───────────────────────────────────────── */
.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #3c8dbc;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #d2e9f7;
  display: flex;
  align-items: center;
  gap: 4px;
}

.link-section-label {
  color: #5b6eae;
  border-bottom-color: #d5dbf7;
}

/* ── Form group spacing ──────────────────────────────────── */
.form-group {
  margin-bottom: 14px;
}

label.col-form-label-sm {
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  display: block;
}

/* ── Info asset sumber ───────────────────────────────────── */
.link-source-info {
  background: #f0f4ff;
  border: 1px solid #c7d2f7;
  border-radius: 6px;
  padding: 10px 14px;
}

.link-source-badge {
  font-size: 0.83rem;
  color: #3a4a8a;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}

/* ── Two-column layout ───────────────────────────────────── */
.link-two-col {
  display: flex;
  gap: 0;
  min-height: 340px;
}

.link-col-left {
  width: 280px;
  flex-shrink: 0;
  padding-right: 16px;
}

.link-col-divider {
  width: 1px;
  background: #e9ecef;
  margin: 0 16px;
  flex-shrink: 0;
}

.link-col-right {
  flex: 1;
  min-width: 0;
}

/* ── Count badge di section label ───────────────────────── */
.linked-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #5b6eae;
  color: #fff;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 4px;
}

/* ── Daftar tindakan terpilih ────────────────────────────── */
.linked-multi-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 2px;
}

.linked-multi-list::-webkit-scrollbar {
  width: 4px;
}
.linked-multi-list::-webkit-scrollbar-thumb {
  background: #c7d2f7;
  border-radius: 4px;
}

.linked-multi-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  padding: 7px 10px;
  transition: background 0.15s;
}

.linked-multi-card:hover {
  background: #dcedc8;
}

.linked-multi-index {
  width: 20px;
  height: 20px;
  background: #5b6eae;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.63rem;
  font-weight: 700;
  flex-shrink: 0;
}

.linked-multi-icon {
  width: 26px;
  height: 26px;
  background: #43a047;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.72rem;
  flex-shrink: 0;
}

.linked-multi-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.linked-multi-caption {
  font-weight: 600;
  font-size: 0.76rem;
  color: #1b5e20;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linked-multi-cat {
  font-size: 0.7rem;
  color: #558b2f;
  font-style: italic;
}

.linked-remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #c62828;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  transition:
    color 0.15s,
    transform 0.15s;
}

.linked-remove-btn:hover {
  color: #b71c1c;
  transform: scale(1.15);
}

/* ── Empty linked ────────────────────────────────────────── */
.empty-linked {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #aaa;
  font-style: italic;
  padding: 12px 6px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
}

/* ── Browse hint ─────────────────────────────────────────── */
.browse-hint {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
  padding: 20px 0;
  text-align: center;
}

/* ── Toggle button di tabel browse ──────────────────────── */
.link-toggle-btn {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
  padding: 0 !important;
  font-size: 0.75rem;
  transition:
    transform 0.15s,
    opacity 0.15s;
}

.link-toggle-btn:hover {
  transform: scale(1.15);
}

.link-toggle-btn.linked {
  opacity: 0.85;
}

/* ── Browse table ────────────────────────────────────────── */
.browse-table :deep(.p-datatable-tbody > tr > td) {
  padding: 5px 8px;
}

/* ── PrimeVue Select flush style ─────────────────────────── */
:deep(.p-select) {
  width: 100%;
  height: calc(1.5em + 0.5rem + 2px);
  border-radius: 4px;
  border: 1px solid #ced4da;
  font-size: 0.875rem;
}
:deep(.p-select .p-select-label) {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}
:deep(.p-inputtext.form-control) {
  height: calc(1.5em + 0.5rem + 2px);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}
:deep(.p-textarea.form-control) {
  height: auto;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}
:deep(.p-datepicker-input.form-control) {
  height: calc(1.5em + 0.5rem + 2px);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}
:deep(.p-inputnumber-input.form-control) {
  border-left: 0 !important;
  border-radius: 0 4px 4px 0 !important;
  font-size: 0.875rem;
  height: calc(1.5em + 0.5rem + 2px);
  padding: 0.25rem 0.5rem;
}

/* ── Dialog shadow ───────────────────────────────────────── */
:deep(.p-dialog) {
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
}
:deep(.p-dialog-header) {
  border-radius: 8px 8px 0 0 !important;
}
</style>
