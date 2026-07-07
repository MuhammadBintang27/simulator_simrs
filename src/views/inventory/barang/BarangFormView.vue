<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memproses..." />
    <Toast />
    <ConfirmDialog />

    <!-- ══ HERO HEADER ══ -->
    <div class="form-header mb-2">
      <div class="form-header-left">
        <div class="form-header-icon">
          <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
        </div>
        <div>
          <div class="form-header-title">{{ isEditMode ? 'Edit Barang' : 'Tambah Barang Baru' }}</div>
          <div class="form-header-sub">
            {{ isEditMode ? 'Ubah data barang yang sudah ada' : 'Buat data barang baru' }}
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- ══ FORM UTAMA ══ -->
      <div class="col-md-8">

        <!-- TIPE BARANG -->
        <Panel class="mb-2">
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="pi pi-tag me-1 mr-1"></i>
              <strong>TIPE BARANG</strong>
            </h6>
          </template>
          <div class="bucket-selector">
            <div
              v-for="opt in bucketOptions"
              :key="opt.value"
              class="bucket-option"
              :class="{ active: currentBucket === opt.value, disabled: isBucketLocked }"
              @click="!isBucketLocked && selectBucket(opt.value)"
            >
              <i :class="opt.icon" class="bucket-icon"></i>
              <span class="bucket-label">{{ opt.label }}</span>
              <span class="bucket-desc">{{ opt.desc }}</span>
            </div>
          </div>
          <small v-if="isBucketLocked" style="font-size: 12px; color: #94a3b8; margin-top: 8px; display: block">
            <i class="pi pi-info-circle me-1"></i> Tipe barang tidak dapat diubah.
          </small>
          <small v-if="!isEditMode && !currentBucket" class="text-danger" style="font-size: 12px; margin-top: 6px; display: block">
            Pilih salah satu tipe barang untuk melanjutkan.
          </small>
        </Panel>

        <!-- INFORMASI DASAR -->
        <Panel class="mb-2">
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="pi pi-info-circle me-1 mr-1"></i>
              <strong>INFORMASI DASAR</strong>
            </h6>
          </template>

          <!-- Nama -->
          <div class="mb-3">
            <label class="form-label">Nama Barang <span class="required">*</span></label>
            <InputText
              v-model="formData.NAMA"
              placeholder="Masukkan nama barang..."
              class="w-100 form-control"
              :class="{ 'is-invalid': errors.NAMA }"
              maxlength="200"
              @blur="validateField('NAMA')"
              :disabled="loading"
            />
            <small v-if="errors.NAMA" class="text-danger">{{ errors.NAMA }}</small>
            <small class="form-text text-muted">{{ formData.NAMA.length }}/200 karakter</small>
          </div>

          <!-- Kategori -->
          <div class="mb-3">
            <label class="form-label">Kategori <span class="required">*</span></label>
            <InputText
              v-model="formData.KATEGORI"
              placeholder="Contoh: OBAT-OBATAN, ATK, TINDAKAN..."
              class="w-100 form-control"
              :class="{ 'is-invalid': errors.KATEGORI }"
              maxlength="100"
              @blur="validateField('KATEGORI')"
              :disabled="loading"
            />
            <small v-if="errors.KATEGORI" class="text-danger">{{ errors.KATEGORI }}</small>
            <small class="form-text text-muted">Nilai bebas — backend menentukan bucket dari kategori ini</small>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Merek</label>
              <InputText
                v-model="formData.MEREK"
                placeholder="Nama merek / produsen..."
                class="w-100 form-control"
                maxlength="100"
                :disabled="loading"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Jenis</label>
              <InputText
                v-model="formData.JENIS"
                placeholder="Jenis barang..."
                class="w-100 form-control"
                maxlength="100"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Barcode</label>
              <InputText
                v-model="formData.BARCODE"
                placeholder="Kosongkan untuk auto-generate"
                class="w-100 form-control"
                maxlength="50"
                :disabled="loading"
              />
              <small class="form-text text-muted">Kosongkan untuk auto-generate</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">ID Barang</label>
              <InputText
                v-model="formData.IDBARANG"
                placeholder="Kosongkan untuk auto-generate"
                class="w-100 form-control"
                maxlength="20"
                :disabled="loading"
              />
              <small class="form-text text-muted">Kosongkan untuk auto-generate</small>
            </div>
          </div>
        </Panel>

        <!-- ══ SATUAN (OBAT_BMHP dan ATK) ══ -->
        <Panel v-if="currentBucket && currentBucket !== 'JASA'" class="mb-2">
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="fas fa-balance-scale me-1 mr-1"></i>
              <strong>SATUAN BERTINGKAT</strong>
            </h6>
          </template>

          <div class="row mb-3">
            <div class="col-md-4">
              <label class="form-label">Satuan Kecil <span class="required">*</span></label>
              <InputText
                v-model="formData.SATUAN_KECIL"
                placeholder="Tablet, Pcs, Lembar..."
                class="w-100 form-control"
                :class="{ 'is-invalid': errors.SATUAN_KECIL }"
                @blur="validateSatuan"
                :disabled="loading"
              />
              <small v-if="errors.SATUAN_KECIL" class="text-danger">{{ errors.SATUAN_KECIL }}</small>
            </div>
            <div class="col-md-4">
              <label class="form-label">
                Satuan Sedang <span style="color: #6b7280; font-weight: 400">(opsional)</span>
              </label>
              <InputText
                v-model="formData.SATUAN_SEDANG"
                placeholder="Strip, Pack..."
                class="w-100 form-control"
                @input="validateSatuan"
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label">
                Satuan Besar <span style="color: #6b7280; font-weight: 400">(opsional)</span>
              </label>
              <InputText
                v-model="formData.SATUAN_BESAR"
                placeholder="Box, Rim..."
                class="w-100 form-control"
                @input="validateSatuan"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">
                Isi Sedang ke Kecil
                <span v-if="formData.SATUAN_SEDANG" class="required">*</span>
                <span v-else style="color: #6b7280; font-weight: 400">(opsional)</span>
              </label>
              <InputText
                v-model.number="formData.ISI_SEDANG_KE_KECIL"
                placeholder="Contoh: 10"
                type="number"
                min="1"
                class="w-100 form-control"
                :class="{ 'is-invalid': errors.ISI_SEDANG_KE_KECIL }"
                :disabled="loading || !formData.SATUAN_SEDANG"
              />
              <small v-if="errors.ISI_SEDANG_KE_KECIL" class="text-danger">{{ errors.ISI_SEDANG_KE_KECIL }}</small>
              <small v-if="formData.SATUAN_SEDANG && formData.SATUAN_KECIL" class="form-text text-muted">
                1 {{ formData.SATUAN_SEDANG }} = ? {{ formData.SATUAN_KECIL }}
              </small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">
                Isi Besar ke Sedang
                <span v-if="formData.SATUAN_BESAR" class="required">*</span>
                <span v-else style="color: #6b7280; font-weight: 400">(opsional)</span>
              </label>
              <InputText
                v-model.number="formData.ISI_BESAR_KE_SEDANG"
                placeholder="Contoh: 10"
                type="number"
                min="1"
                class="w-100 form-control"
                :class="{ 'is-invalid': errors.ISI_BESAR_KE_SEDANG }"
                :disabled="loading || !formData.SATUAN_BESAR"
              />
              <small v-if="errors.ISI_BESAR_KE_SEDANG" class="text-danger">{{ errors.ISI_BESAR_KE_SEDANG }}</small>
              <small
                v-if="formData.SATUAN_BESAR && (formData.SATUAN_SEDANG || formData.SATUAN_KECIL)"
                class="form-text text-muted"
              >
                1 {{ formData.SATUAN_BESAR }} = ? {{ formData.SATUAN_SEDANG || formData.SATUAN_KECIL }}
              </small>
            </div>
          </div>

          <!-- Konversi preview -->
          <div
            v-if="formData.SATUAN_KECIL && formData.SATUAN_SEDANG && formData.ISI_SEDANG_KE_KECIL"
            class="konversi-preview"
          >
            <i class="pi pi-calculator me-1"></i>
            Konversi:
            <span v-if="formData.SATUAN_BESAR && formData.ISI_BESAR_KE_SEDANG">
              1 {{ formData.SATUAN_BESAR }} = {{ formData.ISI_BESAR_KE_SEDANG }} {{ formData.SATUAN_SEDANG }}
              = {{ formData.ISI_BESAR_KE_SEDANG * formData.ISI_SEDANG_KE_KECIL }} {{ formData.SATUAN_KECIL }}
            </span>
            <span v-else>
              1 {{ formData.SATUAN_SEDANG }} = {{ formData.ISI_SEDANG_KE_KECIL }} {{ formData.SATUAN_KECIL }}
            </span>
          </div>
        </Panel>

        <!-- ══ HARGA (JASA) ══ -->
        <Panel v-if="currentBucket === 'JASA'" class="mb-2">
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="fas fa-tag me-1 mr-1"></i>
              <strong>HARGA JASA</strong>
            </h6>
          </template>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Harga Beli / Modal</label>
              <InputText
                v-model.number="formData.HARGABELI"
                placeholder="0"
                type="number"
                min="0"
                class="w-100 form-control"
                :disabled="loading"
              />
              <small class="form-text text-muted">Biaya atau modal jasa</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Harga Jual</label>
              <InputText
                v-model.number="formData.HARGAJUAL"
                placeholder="0"
                type="number"
                min="0"
                class="w-100 form-control"
                :disabled="loading"
              />
              <small class="form-text text-muted">Harga yang ditagihkan ke pasien</small>
            </div>
          </div>
        </Panel>

        <!-- ══ FARMASI (OBAT_BMHP) ══ -->
        <Panel v-if="currentBucket === 'OBAT_BMHP'" class="mb-2">
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="fas fa-pills me-1 mr-1"></i>
              <strong>INFORMASI FARMASI</strong>
            </h6>
          </template>

          <!-- Grouping / Zat Aktif -->
          <div class="mb-3">
            <label class="form-label">Zat Aktif / Grouping</label>
            <div class="input-with-add">
              <Select
                v-model="formData.GROUPING"
                :options="groupingList"
                optionLabel="NAMA_GROUP"
                optionValue="NAMA_GROUP"
                placeholder="Pilih zat aktif..."
                class="flex-grow-1"
                filter
                :disabled="loading"
              />
              <Button
                icon="pi pi-plus"
                severity="success"
                outlined
                v-tooltip="'Tambah Zat Aktif Baru'"
                @click="showAddGroupingDialog = true"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Bentuk Sediaan -->
          <div class="mb-3">
            <label class="form-label">Bentuk Sediaan</label>
            <div class="input-with-add">
              <Select
                v-model="selectedSediaan"
                :options="sediaanList"
                optionLabel="NAMA_SEDIAAN"
                placeholder="Pilih bentuk sediaan..."
                class="flex-grow-1"
                filter
                :disabled="loading"
                @change="onSediaanChange"
              />
              <Button
                icon="pi pi-plus"
                severity="success"
                outlined
                v-tooltip="'Tambah Bentuk Sediaan Baru'"
                @click="showAddSediaanDialog = true"
                :disabled="loading"
              />
            </div>
            <small v-if="formData.CODE_SEDIAAN" class="form-text text-muted">
              Kode: {{ formData.CODE_SEDIAAN }}
            </small>
          </div>

          <!-- Rute Pemberian -->
          <div class="mb-3">
            <label class="form-label">Rute Pemberian</label>
            <div class="input-with-add">
              <Select
                v-model="selectedRute"
                :options="ruteList"
                optionLabel="NAMA_RUTE"
                placeholder="Pilih rute pemberian..."
                class="flex-grow-1"
                filter
                :disabled="loading"
                @change="onRuteChange"
              />
              <Button
                icon="pi pi-plus"
                severity="success"
                outlined
                v-tooltip="'Tambah Rute Baru'"
                @click="showAddRuteDialog = true"
                :disabled="loading"
              />
            </div>
            <small v-if="formData.KODE_RUTE" class="form-text text-muted">
              Kode: {{ formData.KODE_RUTE }}
            </small>
          </div>

          <!-- Kandungan -->
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Kandungan (angka)</label>
              <InputText
                v-model.number="formData.KANDUNGAN"
                placeholder="500"
                type="number"
                min="0"
                class="w-100 form-control"
                :disabled="loading"
              />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Satuan Kandungan</label>
              <InputText
                v-model="formData.SATUAN_KANDUNGAN"
                placeholder="mg, ml, mcg..."
                class="w-100 form-control"
                :disabled="loading"
              />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Volume UOM</label>
              <InputText
                v-model="formData.VOLUME_UOM_NAME"
                placeholder="mL, L..."
                class="w-100 form-control"
                :disabled="loading"
              />
            </div>
          </div>
        </Panel>

        <!-- ══ KONFIGURASI ══ -->
        <Panel class="mb-2">
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="pi pi-cog me-1 mr-1"></i>
              <strong>KONFIGURASI</strong>
            </h6>
          </template>

          <div class="row">
            <div class="col-md-6 mb-2">
              <div class="config-toggle">
                <ToggleSwitch v-model="formData.UNTUK_DIJUAL" :disabled="loading" />
                <span class="config-label">Untuk Dijual</span>
              </div>
            </div>
            <div class="col-md-6 mb-2">
              <div class="config-toggle">
                <ToggleSwitch v-model="formData.POTONGSTOCK" :disabled="loading" />
                <span class="config-label">Potong Stok</span>
              </div>
            </div>
            <div class="col-md-6 mb-2">
              <div class="config-toggle">
                <ToggleSwitch v-model="formData.GUNAKAN_STOCK_MIN" :disabled="loading" />
                <span class="config-label">Gunakan Stok Minimum</span>
              </div>
            </div>
            <div class="col-md-6 mb-2">
              <div class="config-toggle">
                <ToggleSwitch v-model="formData.NEED_TOBE_APROVE" :disabled="loading" />
                <span class="config-label">Perlu Persetujuan</span>
              </div>
            </div>
          </div>

          <div v-if="formData.GUNAKAN_STOCK_MIN" class="mt-2 mb-3">
            <label class="form-label">Stok Minimum</label>
            <InputText
              v-model.number="formData.STOCKMINIMUM"
              placeholder="0"
              type="number"
              min="0"
              style="max-width: 200px"
              class="form-control"
              :disabled="loading"
            />
          </div>

          <div class="mt-2 mb-1">
            <label class="form-label">Catatan (Opsional)</label>
            <Textarea
              v-model="formData.CATATAN"
              placeholder="Catatan tambahan..."
              class="w-100 form-control"
              maxlength="255"
              rows="3"
              :disabled="loading"
            />
          </div>
        </Panel>
      </div>

      <!-- ══ SIDEBAR ══ -->
      <div class="col-md-4">
        <!-- Action Panel -->
        <Panel class="mb-2">
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="pi pi-bars me-1 mr-1"></i>
              <strong>AKSI</strong>
            </h6>
          </template>
          <div class="d-grid gap-2">
            <Button
              label="Simpan"
              icon="pi pi-save"
              class="btn-primary-form"
              @click="submitForm()"
              :loading="loading"
              :disabled="loading || !currentBucket"
            />
            <Button
              label="Batal"
              icon="pi pi-times"
              severity="secondary"
              @click="goBack()"
              :disabled="loading"
            />
            <hr class="my-2" />
            <Button
              v-if="isEditMode"
              label="Hapus"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="showDeleteConfirm()"
              :disabled="loading"
            />
          </div>
        </Panel>

        <!-- Info Panel -->
        <Panel>
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="pi pi-info-circle me-1 mr-1"></i>
              <strong>PETUNJUK</strong>
            </h6>
          </template>
          <div class="info-box">
            <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.8">
              <strong>Wajib diisi:</strong><br />
              ✓ Tipe Barang<br />
              ✓ Nama Barang<br />
              ✓ Kategori<br />
              <span v-if="currentBucket && currentBucket !== 'JASA'">✓ Satuan Kecil<br /></span>
              <br />
              <strong>Aturan Satuan:</strong><br />
              • Isi Sedang→Kecil wajib jika Satuan Sedang diisi<br />
              • Isi Besar→Sedang wajib jika Satuan Besar diisi<br />
              <span v-if="currentBucket === 'JASA'">
                <br />
                <strong>Harga Jasa:</strong><br />
                • Harga Beli = biaya/modal<br />
                • Harga Jual = tarif ke pasien
              </span>
              <span v-if="currentBucket === 'OBAT_BMHP'">
                <br />
                <strong>Farmasi:</strong><br />
                • Pilih atau tambah zat aktif, sediaan, dan rute dari dropdown
              </span>
            </p>
          </div>
        </Panel>
      </div>
    </div>

    <!-- ══ DIALOG: Tambah Grouping ══ -->
    <Dialog
      v-model:visible="showAddGroupingDialog"
      header="Tambah Zat Aktif"
      :modal="true"
      :style="{ width: '380px' }"
    >
      <div class="mb-3">
        <label class="form-label">Nama Zat Aktif <span class="required">*</span></label>
        <InputText
          v-model="newGrouping.NAMA_GROUP"
          placeholder="Paracetamol..."
          class="w-100 form-control"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Kode <span style="color: #6b7280; font-weight: 400">(opsional)</span></label>
        <InputText
          v-model="newGrouping.KODE_GROUP"
          placeholder="Auto-generate jika kosong"
          class="w-100 form-control"
        />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="showAddGroupingDialog = false" />
        <Button
          label="Simpan"
          icon="pi pi-save"
          class="btn-primary-form"
          @click="createGrouping()"
          :loading="loadingDropdown"
        />
      </template>
    </Dialog>

    <!-- ══ DIALOG: Tambah Sediaan ══ -->
    <Dialog
      v-model:visible="showAddSediaanDialog"
      header="Tambah Bentuk Sediaan"
      :modal="true"
      :style="{ width: '380px' }"
    >
      <div class="mb-3">
        <label class="form-label">Nama Sediaan <span class="required">*</span></label>
        <InputText
          v-model="newSediaan.NAMA_SEDIAAN"
          placeholder="Tablet, Kapsul, Sirup..."
          class="w-100 form-control"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Kode <span style="color: #6b7280; font-weight: 400">(opsional)</span></label>
        <InputText
          v-model="newSediaan.KODE_SEDIAAN"
          placeholder="Auto-generate jika kosong"
          class="w-100 form-control"
        />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="showAddSediaanDialog = false" />
        <Button
          label="Simpan"
          icon="pi pi-save"
          class="btn-primary-form"
          @click="createSediaan()"
          :loading="loadingDropdown"
        />
      </template>
    </Dialog>

    <!-- ══ DIALOG: Tambah Rute ══ -->
    <Dialog
      v-model:visible="showAddRuteDialog"
      header="Tambah Rute Pemberian"
      :modal="true"
      :style="{ width: '380px' }"
    >
      <div class="mb-3">
        <label class="form-label">Nama Rute <span class="required">*</span></label>
        <InputText
          v-model="newRute.NAMA_RUTE"
          placeholder="Oral, Intravena, Topikal..."
          class="w-100 form-control"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Kode <span style="color: #6b7280; font-weight: 400">(opsional)</span></label>
        <InputText
          v-model="newRute.KODE_RUTE"
          placeholder="PO, IV, TOP..."
          class="w-100 form-control"
        />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="showAddRuteDialog = false" />
        <Button
          label="Simpan"
          icon="pi pi-save"
          class="btn-primary-form"
          @click="createRute()"
          :loading="loadingDropdown"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Panel from 'primevue/panel'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()

const loading = ref(false)
const loadingDropdown = ref(false)
const barangId = ref(null)
const currentBucket = ref('')

const isEditMode = computed(() => !!route.params.id)

// Bucket yang ter-lock dari route path (obat / atk / jasa)
const bucketFromRoute = computed(() => {
  const path = route.path
  if (path.includes('/inventory/obat/')) return 'OBAT_BMHP'
  if (path.includes('/inventory/atk/')) return 'ATK'
  if (path.includes('/inventory/jasa/')) return 'JASA'
  return ''
})

// Path list untuk navigasi kembali — ditentukan dari route aktif
const listPath = computed(() => {
  const path = route.path
  if (path.includes('/inventory/obat/')) return '/inventory/obat/list'
  if (path.includes('/inventory/atk/')) return '/inventory/atk/list'
  if (path.includes('/inventory/jasa/')) return '/inventory/jasa/list'
  return '/inventory/barang/list'
})

// Bucket ter-lock jika edit mode ATAU route sudah spesifik per kategori
const isBucketLocked = computed(() => isEditMode.value || !!bucketFromRoute.value)

const bucketOptions = [
  { value: 'OBAT_BMHP', label: 'Obat / BMHP', desc: 'Obat & bahan medis habis pakai', icon: 'fas fa-pills' },
  { value: 'ATK', label: 'ATK', desc: 'Alat tulis & perlengkapan kantor', icon: 'fas fa-pen' },
  { value: 'JASA', label: 'Jasa', desc: 'Tindakan, radiologi, laboratorium', icon: 'fas fa-stethoscope' },
]

const formData = ref({
  NAMA: '',
  KATEGORI: '',
  MEREK: '',
  JENIS: '',
  BARCODE: '',
  IDBARANG: '',
  SATUAN_KECIL: '',
  SATUAN_SEDANG: '',
  SATUAN_BESAR: '',
  ISI_SEDANG_KE_KECIL: null,
  ISI_BESAR_KE_SEDANG: null,
  HARGABELI: null,
  HARGAJUAL: null,
  GROUPING: '',
  BENTUK_SEDIAAN: '',
  CODE_SEDIAAN: '',
  RUTE: '',
  KODE_RUTE: '',
  KANDUNGAN: null,
  SATUAN_KANDUNGAN: '',
  VOLUME_UOM_NAME: '',
  UNTUK_DIJUAL: true,
  POTONGSTOCK: true,
  GUNAKAN_STOCK_MIN: false,
  STOCKMINIMUM: 0,
  NEED_TOBE_APROVE: false,
  GARANSI: false,
  CATATAN: '',
})

const errors = ref({
  NAMA: '',
  KATEGORI: '',
  SATUAN_KECIL: '',
  ISI_SEDANG_KE_KECIL: '',
  ISI_BESAR_KE_SEDANG: '',
})

// Farmasi dropdown data
const sediaanList = ref([])
const ruteList = ref([])
const groupingList = ref([])
const selectedSediaan = ref(null)
const selectedRute = ref(null)

// Dialog visibility
const showAddSediaanDialog = ref(false)
const showAddRuteDialog = ref(false)
const showAddGroupingDialog = ref(false)

// New item forms
const newSediaan = ref({ NAMA_SEDIAAN: '', KODE_SEDIAAN: '' })
const newRute = ref({ NAMA_RUTE: '', KODE_RUTE: '' })
const newGrouping = ref({ NAMA_GROUP: '', KODE_GROUP: '' })

const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })

const selectBucket = (bucket) => {
  currentBucket.value = bucket
}

const validateField = (fieldName) => {
  const value = formData.value[fieldName]
  if (!value || !value.toString().trim()) {
    errors.value[fieldName] = fieldName === 'NAMA' ? 'Nama barang wajib diisi' : 'Kategori wajib diisi'
    return false
  }
  if (fieldName === 'NAMA' && value.length < 2) {
    errors.value[fieldName] = 'Minimal 2 karakter'
    return false
  }
  errors.value[fieldName] = ''
  return true
}

const validateSatuan = () => {
  errors.value.SATUAN_KECIL = ''
  errors.value.ISI_SEDANG_KE_KECIL = ''
  errors.value.ISI_BESAR_KE_SEDANG = ''

  if (currentBucket.value !== 'JASA') {
    if (!formData.value.SATUAN_KECIL) {
      errors.value.SATUAN_KECIL = 'Satuan kecil wajib diisi'
    }
    if (formData.value.SATUAN_SEDANG && !formData.value.ISI_SEDANG_KE_KECIL) {
      errors.value.ISI_SEDANG_KE_KECIL = 'Wajib diisi jika satuan sedang diisi'
    }
    if (formData.value.SATUAN_BESAR && !formData.value.ISI_BESAR_KE_SEDANG) {
      errors.value.ISI_BESAR_KE_SEDANG = 'Wajib diisi jika satuan besar diisi'
    }
  }
}

const validateForm = () => {
  let valid = true
  if (!validateField('NAMA')) valid = false
  if (!validateField('KATEGORI')) valid = false
  if (!currentBucket.value) {
    showError('Tipe barang wajib dipilih')
    valid = false
  }
  validateSatuan()
  if (Object.values(errors.value).some((e) => e)) valid = false
  return valid
}

const onSediaanChange = () => {
  if (selectedSediaan.value) {
    formData.value.BENTUK_SEDIAAN = selectedSediaan.value.NAMA_SEDIAAN
    formData.value.CODE_SEDIAAN = selectedSediaan.value.KODE_SEDIAAN || ''
  }
}

const onRuteChange = () => {
  if (selectedRute.value) {
    formData.value.RUTE = selectedRute.value.NAMA_RUTE
    formData.value.KODE_RUTE = selectedRute.value.KODE_RUTE || ''
  }
}

const fetchMasterDropdowns = async () => {
  const clientId = authStore.id_client
  try {
    const [sediaanRes, ruteRes, groupingRes] = await Promise.all([
      axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/master_sediaan_list`, {
        params: { clientId },
      }),
      axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/master_rute_list`, {
        params: { clientId },
      }),
      axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/master_grouping_list`, {
        params: { clientId },
      }),
    ])
    sediaanList.value = sediaanRes.data?.response || sediaanRes.data || []
    ruteList.value = ruteRes.data?.response || ruteRes.data || []
    groupingList.value = groupingRes.data?.response || groupingRes.data || []
  } catch (error) {
    console.error('Error fetching master dropdowns:', error)
  }
}

const fetchBarangDetail = async (id) => {
  loading.value = true
  try {
    const clientId = authStore.id_client
    const response = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/inventory/barang_detail/${id}`,
      { params: { clientId } }
    )

    const data = response.data?.response || response.data
    if (data) {
      currentBucket.value = data.bucket || ''
      formData.value = {
        NAMA: data.NAMA || '',
        KATEGORI: data.KATEGORI || '',
        MEREK: data.MEREK || '',
        JENIS: data.JENIS || '',
        BARCODE: data.BARCODE || '',
        IDBARANG: data.IDBARANG || '',
        SATUAN_KECIL: data.SATUAN_KECIL || '',
        SATUAN_SEDANG: data.SATUAN_SEDANG || '',
        SATUAN_BESAR: data.SATUAN_BESAR || '',
        ISI_SEDANG_KE_KECIL: data.ISI_SEDANG_KE_KECIL || null,
        ISI_BESAR_KE_SEDANG: data.ISI_BESAR_KE_SEDANG || null,
        HARGABELI: data.HARGABELI || null,
        HARGAJUAL: data.HARGAJUAL || null,
        GROUPING: data.GROUPING || '',
        BENTUK_SEDIAAN: data.BENTUK_SEDIAAN || '',
        CODE_SEDIAAN: data.CODE_SEDIAAN || '',
        RUTE: data.RUTE || '',
        KODE_RUTE: data.KODE_RUTE || '',
        KANDUNGAN: data.KANDUNGAN || null,
        SATUAN_KANDUNGAN: data.SATUAN_KANDUNGAN || '',
        VOLUME_UOM_NAME: data.VOLUME_UOM_NAME || '',
        UNTUK_DIJUAL: !!data.UNTUK_DIJUAL,
        POTONGSTOCK: !!data.POTONGSTOCK,
        GUNAKAN_STOCK_MIN: !!data.GUNAKAN_STOCK_MIN,
        STOCKMINIMUM: data.STOCKMINIMUM || 0,
        NEED_TOBE_APROVE: !!data.NEED_TOBE_APROVE,
        GARANSI: !!data.GARANSI,
        CATATAN: data.CATATAN || '',
      }

      if (data.BENTUK_SEDIAAN) {
        selectedSediaan.value =
          sediaanList.value.find((s) => s.NAMA_SEDIAAN === data.BENTUK_SEDIAAN) || null
      }
      if (data.RUTE) {
        selectedRute.value = ruteList.value.find((r) => r.NAMA_RUTE === data.RUTE) || null
      }
    } else {
      showError('Data barang tidak ditemukan')
      router.push(listPath.value)
    }
  } catch (error) {
    console.error('Error fetching barang detail:', error)
    showError('Gagal mengambil data barang')
    router.push(listPath.value)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!validateForm()) {
    showError('Mohon periksa kembali data yang diisi')
    return
  }

  loading.value = true
  try {
    const clientId = authStore.id_client
    const payload = {
      NAMA: formData.value.NAMA,
      KATEGORI: formData.value.KATEGORI,
      MEREK: formData.value.MEREK,
      JENIS: formData.value.JENIS,
      BARCODE: formData.value.BARCODE,
      IDBARANG: formData.value.IDBARANG,
      UNTUK_DIJUAL: formData.value.UNTUK_DIJUAL ? 1 : 0,
      POTONGSTOCK: formData.value.POTONGSTOCK ? 1 : 0,
      GUNAKAN_STOCK_MIN: formData.value.GUNAKAN_STOCK_MIN ? 1 : 0,
      STOCKMINIMUM: formData.value.STOCKMINIMUM,
      NEED_TOBE_APROVE: formData.value.NEED_TOBE_APROVE ? 1 : 0,
      GARANSI: formData.value.GARANSI ? 1 : 0,
      CATATAN: formData.value.CATATAN,
    }

    // Satuan (OBAT_BMHP dan ATK)
    if (currentBucket.value !== 'JASA') {
      payload.SATUAN_KECIL = formData.value.SATUAN_KECIL
      if (formData.value.SATUAN_SEDANG) {
        payload.SATUAN_SEDANG = formData.value.SATUAN_SEDANG
        payload.ISI_SEDANG_KE_KECIL = formData.value.ISI_SEDANG_KE_KECIL
      }
      if (formData.value.SATUAN_BESAR) {
        payload.SATUAN_BESAR = formData.value.SATUAN_BESAR
        payload.ISI_BESAR_KE_SEDANG = formData.value.ISI_BESAR_KE_SEDANG
      }
    }

    // Harga (JASA)
    if (currentBucket.value === 'JASA') {
      payload.HARGABELI = formData.value.HARGABELI
      payload.HARGAJUAL = formData.value.HARGAJUAL
    }

    // Farmasi (OBAT_BMHP)
    if (currentBucket.value === 'OBAT_BMHP') {
      payload.GROUPING = formData.value.GROUPING
      payload.BENTUK_SEDIAAN = formData.value.BENTUK_SEDIAAN
      payload.CODE_SEDIAAN = formData.value.CODE_SEDIAAN
      payload.RUTE = formData.value.RUTE
      payload.KODE_RUTE = formData.value.KODE_RUTE
      payload.KANDUNGAN = formData.value.KANDUNGAN
      payload.SATUAN_KANDUNGAN = formData.value.SATUAN_KANDUNGAN
      payload.VOLUME_UOM_NAME = formData.value.VOLUME_UOM_NAME
    }

    let response
    if (isEditMode.value) {
      response = await axios.put(
        `${configStore.apiApotikUrl}/index.php/api/inventory/barang_update/${barangId.value}`,
        payload,
        { params: { clientId } }
      )
    } else {
      response = await axios.post(
        `${configStore.apiApotikUrl}/index.php/api/inventory/barang_create`,
        payload,
        { params: { clientId, lokasiId: authStore.id_lokasi } }
      )
    }

    if (response.data) {
      const meta = response.data.metadata
      if (meta && meta.code !== 200) {
        showError(meta.message || 'Gagal menyimpan data')
        return
      }
      showSuccess(isEditMode.value ? 'Barang berhasil diperbarui' : 'Barang berhasil ditambahkan')
      router.push(listPath.value)
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    showError('Gagal menyimpan data barang')
  } finally {
    loading.value = false
  }
}

const showDeleteConfirm = () => {
  if (confirm('Apakah Anda yakin ingin menghapus barang ini? Data tidak dapat dikembalikan.')) {
    deleteBarang()
  }
}

const deleteBarang = async () => {
  loading.value = true
  try {
    const clientId = authStore.id_client
    await axios.delete(
      `${configStore.apiApotikUrl}/index.php/api/inventory/barang_delete/${barangId.value}`,
      { params: { clientId } }
    )
    showSuccess('Barang berhasil dihapus')
    router.push(listPath.value)
  } catch (error) {
    console.error('Error deleting barang:', error)
    showError('Gagal menghapus barang')
  } finally {
    loading.value = false
  }
}

const createSediaan = async () => {
  if (!newSediaan.value.NAMA_SEDIAAN) {
    showError('Nama sediaan wajib diisi')
    return
  }
  loadingDropdown.value = true
  try {
    const clientId = authStore.id_client
    await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/inventory/master_sediaan_create`,
      newSediaan.value,
      { params: { clientId } }
    )
    showSuccess('Bentuk sediaan berhasil ditambahkan')
    showAddSediaanDialog.value = false
    newSediaan.value = { NAMA_SEDIAAN: '', KODE_SEDIAAN: '' }
    await fetchMasterDropdowns()
  } catch (error) {
    showError('Gagal menambahkan bentuk sediaan')
  } finally {
    loadingDropdown.value = false
  }
}

const createRute = async () => {
  if (!newRute.value.NAMA_RUTE) {
    showError('Nama rute wajib diisi')
    return
  }
  loadingDropdown.value = true
  try {
    const clientId = authStore.id_client
    await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/inventory/master_rute_create`,
      newRute.value,
      { params: { clientId } }
    )
    showSuccess('Rute pemberian berhasil ditambahkan')
    showAddRuteDialog.value = false
    newRute.value = { NAMA_RUTE: '', KODE_RUTE: '' }
    await fetchMasterDropdowns()
  } catch (error) {
    showError('Gagal menambahkan rute pemberian')
  } finally {
    loadingDropdown.value = false
  }
}

const createGrouping = async () => {
  if (!newGrouping.value.NAMA_GROUP) {
    showError('Nama zat aktif wajib diisi')
    return
  }
  loadingDropdown.value = true
  try {
    const clientId = authStore.id_client
    await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/inventory/master_grouping_create`,
      newGrouping.value,
      { params: { clientId } }
    )
    showSuccess('Zat aktif berhasil ditambahkan')
    showAddGroupingDialog.value = false
    newGrouping.value = { NAMA_GROUP: '', KODE_GROUP: '' }
    await fetchMasterDropdowns()
  } catch (error) {
    showError('Gagal menambahkan zat aktif')
  } finally {
    loadingDropdown.value = false
  }
}

const goBack = () => {
  router.push(listPath.value)
}

onBeforeMount(async () => {
  // Pre-select bucket dari route path di mode tambah baru
  if (!isEditMode.value && bucketFromRoute.value) {
    currentBucket.value = bucketFromRoute.value
  }
  await fetchMasterDropdowns()
  if (route.params.id) {
    barangId.value = route.params.id
    await fetchBarangDetail(barangId.value)
  }
})
</script>

<style scoped>
/* ── Form Header ── */
.form-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
  border-radius: 4px;
  padding: 0.85rem 1.25rem;
  gap: 0.75rem;
}
.form-header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.form-header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.form-header-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.form-header-sub {
  font-size: 0.72rem;
  opacity: 0.85;
  margin-top: 2px;
}

/* ── Bucket Selector ── */
.bucket-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.bucket-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  gap: 6px;
  user-select: none;
}
.bucket-option:hover:not(.disabled) {
  border-color: #11998e;
  background: #f0fdfa;
}
.bucket-option.active {
  border-color: #11998e;
  background: #f0fdfa;
}
.bucket-option.disabled {
  cursor: not-allowed;
  opacity: 0.8;
}
.bucket-icon {
  font-size: 1.4rem;
  color: #6b7280;
}
.bucket-option.active .bucket-icon {
  color: #11998e;
}
.bucket-label {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}
.bucket-option.active .bucket-label {
  color: #11998e;
}
.bucket-desc {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.3;
}

/* ── Form Controls ── */
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  display: block;
}
.required {
  color: #dc2626;
}
.form-control {
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  height: auto;
}
.form-control:focus {
  border-color: #11998e;
  box-shadow: 0 0 0 0.2rem rgba(17, 153, 142, 0.15);
}
.form-control.is-invalid {
  border-color: #dc2626;
}
.form-control:disabled {
  background-color: #f3f4f6;
}
.text-danger {
  color: #dc2626 !important;
  font-size: 12px;
}
.form-text {
  font-size: 12px;
  color: #6b7280;
  display: block;
  margin-top: 4px;
}

/* ── Input with Add Button ── */
.input-with-add {
  display: flex;
  gap: 8px;
  align-items: center;
}
.input-with-add .flex-grow-1 {
  flex: 1;
}

/* ── Config Toggle ── */
.config-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}
.config-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

/* ── Konversi Preview ── */
.konversi-preview {
  background: #f0fdfa;
  border: 1px solid #b2dfdb;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  color: #0f766e;
  margin-top: 4px;
}

/* ── Primary Form Button ── */
.btn-primary-form {
  background: #c62828 !important;
  border-color: #c62828 !important;
  color: white !important;
  font-weight: 600;
}
.btn-primary-form:hover {
  background: #b71c1c !important;
  border-color: #b71c1c !important;
}

/* ── Info Box ── */
.info-box {
  background: #ecf3ff;
  border-left: 3px solid #11998e;
  padding: 12px;
  border-radius: 2px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    text-align: center;
  }
  .form-header-left {
    width: 100%;
    justify-content: center;
  }
  .bucket-selector {
    grid-template-columns: 1fr;
  }
}
</style>
