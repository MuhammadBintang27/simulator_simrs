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
        :value="assets"
        paginator
        :rows="10"
        :filters="filters"
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
        <Column header="Aksi" style="width: 110px; text-align: center">
          <template #body="slotProps">
            <button
              class="btn btn-info btn-xs mr-1"
              @click="editAsset(slotProps.data)"
              title="Edit"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>
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

    <!-- ===== DIALOG FORM ===== -->
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
      <!-- Custom Header -->
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

      <!-- Form Body -->
      <div style="padding: 20px 24px; background: #fff">
        <!-- Section: Identitas -->
        <div class="section-label"><i class="fas fa-tag mr-1"></i> Identitas Asset</div>

        <div class="row">
          <div class="col-md-5">
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
          <div class="col-md-7">
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
            <div class="form-group" :class="{ 'has-error': errors.ruangan }">
              <label class="col-form-label-sm fw-semibold">
                Ruangan / Lokasi <span class="text-danger">*</span>
              </label>
              <InputText
                v-model="form.ruangan"
                placeholder="Contoh: Ruang Server Lt.2"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors.ruangan }"
              />
              <div v-if="errors.ruangan" class="invalid-feedback d-block">
                <i class="fas fa-exclamation-circle mr-1"></i>{{ errors.ruangan }}
              </div>
            </div>
          </div>
        </div>

        <hr class="my-3" style="border-color: #e9ecef" />

        <!-- Section: Detail -->
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
      <!-- /.form body -->

      <!-- Footer -->
      <template #footer>
        <div class="d-flex justify-content-between align-items-center w-100">
          <small class="text-muted"><span class="text-danger">*</span> Wajib diisi</small>
          <div class="d-flex gap-2">
            <Button class="btn btn-default btn-sm" @click="closeDialog">
              <i class="fas fa-times mr-1"></i>Batal
            </Button>
            <Button @click="submitForm">
              <i :class="isEditMode ? 'fas fa-save' : 'fas fa-plus'" class="mr-1"></i>
              {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Asset' }}
            </Button>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import DatePicker from 'primevue/datepicker'
import { FilterMatchMode } from '@primevue/core/api'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const visible = ref(false)

// ─── Static data ─────────────────────────────────────────
const assets = ref([
  {
    id: 1,
    no_inventaris: 'AST-001',
    nama_aset: 'Server Dell R740',
    kategori: 'IT',
    ruangan: 'Ruang Server',
    harga_beli: 250000000,
    kondisi: 'Baik',
    garansi_sampai: '2027-12-31',
  },
  {
    id: 2,
    no_inventaris: 'AST-002',
    nama_aset: 'Monitor Pasien',
    kategori: 'Medis',
    ruangan: 'ICU',
    harga_beli: 45000000,
    kondisi: 'Dalam Perbaikan',
    garansi_sampai: '2026-05-10',
  },
])

const kategoriOptions = ['IT', 'Medis', 'Furnitur', 'Kendaraan', 'Elektronik', 'Lainnya']
const kondisiOptions = ['Baik', 'Dalam Perbaikan', 'Rusak', 'Tidak Aktif']

// ─── Kondisi helpers ──────────────────────────────────────
const kondisiClass = (k) =>
  ({
    Baik: 'btn-success',
    'Dalam Perbaikan': 'btn-warning',
    Rusak: 'btn-danger',
    'Tidak Aktif': 'btn-secondary',
  })[k] || 'btn-light'

const kondisiIcon = (k) =>
  ({
    Baik: 'fas fa-check-circle',
    'Dalam Perbaikan': 'fas fa-tools',
    Rusak: 'fas fa-times-circle',
    'Tidak Aktif': 'fas fa-ban',
  })[k] || 'fas fa-circle'

// ─── Dialog state ─────────────────────────────────────────
const dialogVisible = ref(false)
const isEditMode = ref(false)
const editId = ref(null)

const defaultForm = () => ({
  no_inventaris: '',
  nama_aset: '',
  kategori: null,
  ruangan: '',
  harga_beli: null,
  kondisi: null,
  garansi_sampai: null,
  tanggal_perolehan: null,
  keterangan: '',
})

const form = reactive(defaultForm())
const errors = reactive({})

const clearErrors = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
}

const openForm = () => {
  isEditMode.value = false
  editId.value = null
  Object.assign(form, defaultForm())

  console.log('Form reset:', { ...form }) // Debug log to verify form reset
  clearErrors()
  dialogVisible.value = true
}

const editAsset = (data) => {
  isEditMode.value = true
  editId.value = data.id
  Object.assign(form, {
    no_inventaris: data.no_inventaris,
    nama_aset: data.nama_aset,
    kategori: data.kategori,
    ruangan: data.ruangan,
    harga_beli: data.harga_beli,
    kondisi: data.kondisi,
    garansi_sampai: data.garansi_sampai,
    tanggal_perolehan: data.tanggal_perolehan ?? null,
    keterangan: data.keterangan ?? '',
  })
  clearErrors()
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

// ─── Validation ───────────────────────────────────────────
const validate = () => {
  clearErrors()
  if (!form.no_inventaris.trim()) errors.no_inventaris = 'No Inventaris wajib diisi.'
  if (!form.nama_aset.trim()) errors.nama_aset = 'Nama Aset wajib diisi.'
  if (!form.kategori) errors.kategori = 'Kategori wajib dipilih.'
  if (!form.ruangan.trim()) errors.ruangan = 'Ruangan wajib diisi.'
  if (!form.kondisi) errors.kondisi = 'Kondisi wajib dipilih.'
  return Object.keys(errors).length === 0
}

// ─── Submit ───────────────────────────────────────────────
const submitForm = () => {
  if (!validate()) return
  const payload = { ...form }
  if (isEditMode.value) {
    insertAsset({ id: editId.value, ...payload })
  } else {
    assets.value.push({ id: Date.now(), ...payload })
  }
  closeDialog()
}

const fact = ref([])
const insertAsset = async (data) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/input_asset`, data) // ✅ Cleaner syntax
    console.log(response.data)
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const deleteAsset = (data) => {
  if (confirm(`Yakin hapus asset "${data.nama_aset}"?`))
    assets.value = assets.value.filter((a) => a.id !== data.id)
}

// ─── Table helpers ────────────────────────────────────────
const globalFilter = ref('')
const filters = computed(() => ({
  global: { value: globalFilter.value, matchMode: FilterMatchMode.CONTAINS },
}))

const formatCurrency = (v) => new Intl.NumberFormat('id-ID').format(v)

const getSeverity = (k) =>
  ({
    Baik: 'success',
    'Dalam Perbaikan': 'warning',
    Rusak: 'danger',
    'Tidak Aktif': 'secondary',
  })[k] ?? null
</script>

<style scoped>
/* ── Section label ── */
.section-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #3c8dbc;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #d2e9f7;
}

/* ── Kondisi toggle buttons ── */
.kondisi-btn {
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 20px !important;
  transition: all 0.15s ease;
  opacity: 0.65;
}
.kondisi-btn.active {
  opacity: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}
.kondisi-btn:hover {
  opacity: 0.9;
}

/* ── Form group spacing ── */
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

/* ── PrimeVue Select flush style ── */
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

/* ── Dialog shadow ── */
:deep(.p-dialog) {
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
}
:deep(.p-dialog-header) {
  border-radius: 8px 8px 0 0 !important;
}
</style>
