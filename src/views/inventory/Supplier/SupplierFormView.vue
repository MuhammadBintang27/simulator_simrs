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
          <div class="form-header-title">{{ isEditMode ? 'Edit Supplier' : 'Tambah Supplier Baru' }}</div>
          <div class="form-header-sub">{{ isEditMode ? 'Ubah data supplier yang sudah ada' : 'Buat data supplier baru' }}</div>
        </div>
      </div>
    </div>

    <!-- ══ FORM SECTION ══ -->
    <div class="row">
      <div class="col-md-8">
        <Panel>
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="pi pi-info-circle me-1 mr-1"></i>
              <strong>INFORMASI SUPPLIER</strong>
            </h6>
          </template>

          <!-- Nama Supplier -->
          <div class="mb-3">
            <label for="namasuplier" class="form-label">Nama Supplier <span class="required">*</span></label>
            <div class="input-group">
              <span class="input-group-text" style="background: #f3f4f6; border: 1px solid #e5e7eb">
                <i class="fas fa-building" style="color: #6b7280"></i>
              </span>
              <InputText
                id="namasuplier"
                v-model="formData.NAMASUPLIER"
                placeholder="Masukkan nama supplier..."
                class="form-control"
                :class="{ 'is-invalid': errors.NAMASUPLIER }"
                maxlength="100"
                @blur="validateField('NAMASUPLIER')"
                :disabled="loading"
              />
            </div>
            <small v-if="errors.NAMASUPLIER" class="text-danger">{{ errors.NAMASUPLIER }}</small>
            <small class="form-text text-muted">{{ formData.NAMASUPLIER.length }}/100 karakter</small>
          </div>

          <!-- Alamat -->
          <div class="mb-3">
            <label for="alamat" class="form-label">Alamat <span class="required">*</span></label>
            <div class="input-group">
              <span class="input-group-text" style="background: #f3f4f6; border: 1px solid #e5e7eb">
                <i class="fas fa-map-marker-alt" style="color: #6b7280"></i>
              </span>
              <InputText
                id="alamat"
                v-model="formData.ALAMAT"
                placeholder="Masukkan alamat lengkap..."
                class="form-control"
                :class="{ 'is-invalid': errors.ALAMAT }"
                maxlength="200"
                @blur="validateField('ALAMAT')"
                :disabled="loading"
              />
            </div>
            <small v-if="errors.ALAMAT" class="text-danger">{{ errors.ALAMAT }}</small>
            <small class="form-text text-muted">{{ formData.ALAMAT.length }}/200 karakter</small>
          </div>

          <!-- Kota -->
          <div class="mb-3">
            <label for="kota" class="form-label">Kota <span class="required">*</span></label>
            <div class="input-group">
              <span class="input-group-text" style="background: #f3f4f6; border: 1px solid #e5e7eb">
                <i class="fas fa-city" style="color: #6b7280"></i>
              </span>
              <InputText
                id="kota"
                v-model="formData.KOTA"
                placeholder="Masukkan nama kota..."
                class="form-control"
                :class="{ 'is-invalid': errors.KOTA }"
                @blur="validateField('KOTA')"
                :disabled="loading"
              />
            </div>
            <small v-if="errors.KOTA" class="text-danger">{{ errors.KOTA }}</small>
          </div>

          <!-- No. HP -->
          <div class="mb-3">
            <label for="nohp" class="form-label">No. HP <span class="required">*</span></label>
            <div class="input-group">
              <span class="input-group-text" style="background: #f3f4f6; border: 1px solid #e5e7eb">
                <i class="fas fa-phone" style="color: #6b7280"></i>
              </span>
              <InputText
                id="nohp"
                v-model="formData.NOHP"
                placeholder="Contoh: 08123456789"
                class="form-control"
                :class="{ 'is-invalid': errors.NOHP }"
                @blur="validateField('NOHP')"
                @input="validatePhoneInput"
                :disabled="loading"
              />
            </div>
            <small v-if="errors.NOHP" class="text-danger">{{ errors.NOHP }}</small>
            <small class="form-text text-muted">Masukkan angka saja (7-20 digit)</small>
          </div>

          <!-- Catatan -->
          <div class="mb-3">
            <label for="catatan" class="form-label">Catatan (Opsional)</label>
            <div class="input-group">
              <span class="input-group-text" style="background: #f3f4f6; border: 1px solid #e5e7eb">
                <i class="fas fa-comment" style="color: #6b7280"></i>
              </span>
              <Textarea
                id="catatan"
                v-model="formData.CATATAN"
                placeholder="Masukkan catatan tambahan..."
                class="form-control"
                maxlength="100"
                rows="3"
                :disabled="loading"
              />
            </div>
            <small class="form-text text-muted">{{ formData.CATATAN.length }}/100 karakter</small>
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
              :disabled="loading"
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
              <i class="pi pi-information me-1 mr-1"></i>
              <strong>PETUNJUK</strong>
            </h6>
          </template>

          <div class="info-box">
            <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6">
              <strong>Wajib diisi:</strong><br />
              ✓ Nama Supplier<br />
              ✓ Alamat<br />
              ✓ Kota<br />
              ✓ No. HP<br />
              <br />
              <strong>Opsional:</strong><br />
              • Catatan
            </p>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dialog from 'primevue/dialog'
import Panel from 'primevue/panel'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const supplierId = ref(null)
const formData = ref({
  NAMASUPLIER: '',
  ALAMAT: '',
  KOTA: '',
  NOHP: '',
  CATATAN: '',
})

const errors = ref({
  NAMASUPLIER: '',
  ALAMAT: '',
  KOTA: '',
  NOHP: '',
})

const isEditMode = computed(() => !!route.params.id)

const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })

const validationRules = {
  NAMASUPLIER: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  ALAMAT: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },
  KOTA: {
    required: true,
    minLength: 2,
  },
  NOHP: {
    required: true,
    minDigits: 7,
    maxDigits: 20,
  },
}

const validateField = (fieldName) => {
  const value = formData.value[fieldName]
  const rules = validationRules[fieldName]

  if (!value && rules.required) {
    errors.value[fieldName] = `${fieldName} wajib diisi`
    return false
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    errors.value[fieldName] = `Minimal ${rules.minLength} karakter`
    return false
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    errors.value[fieldName] = `Maksimal ${rules.maxLength} karakter`
    return false
  }

  if (fieldName === 'NOHP' && value) {
    const digits = value.toString()
    if (digits.length < rules.minDigits || digits.length > rules.maxDigits) {
      errors.value[fieldName] = `No. HP harus ${rules.minDigits}-${rules.maxDigits} digit`
      return false
    }
  }

  errors.value[fieldName] = ''
  return true
}

const validatePhoneInput = (event) => {
  // Hanya allow angka, hapus karakter lain
  let value = formData.value.NOHP || ''
  let filteredValue = value.replace(/[^\d]/g, '')
  
  if (filteredValue !== value) {
    formData.value.NOHP = filteredValue
  }
}

const validateForm = () => {
  Object.keys(validationRules).forEach((field) => validateField(field))
  return !Object.values(errors.value).some((err) => err)
}

const fetchSupplier = async (id) => {
  loading.value = true
  try {
    const clientId = authStore.id_client
    const response = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/inventory/supplier_all`,
      { params: { clientId } }
    )

    if (response.data) {
      let suppliersList = response.data.response || []
      const supplier = suppliersList.find((s) => s.IDSUPLIER == id)
      
      if (supplier) {
        formData.value = {
          NAMASUPLIER: supplier.NAMASUPLIER || '',
          ALAMAT: supplier.ALAMAT || '',
          KOTA: supplier.KOTA || '',
          NOHP: supplier.NOHP || '',
          CATATAN: supplier.CATATAN || '',
        }
      } else {
        showError('Data supplier tidak ditemukan')
        router.push('/supplier/list')
      }
    }
  } catch (error) {
    console.error('Error fetching supplier:', error)
    showError('Gagal mengambil data supplier')
    router.push('/supplier/list')
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
      NAMASUPLIER: formData.value.NAMASUPLIER,
      ALAMAT: formData.value.ALAMAT,
      KOTA: formData.value.KOTA,
      NOHP: formData.value.NOHP,
      CATATAN: formData.value.CATATAN,
    }

    let response
    if (isEditMode.value) {
      response = await axios.post(
        `${configStore.apiApotikUrl}/index.php/api/inventory/supplier_update/${supplierId.value}`,
        payload,
        { params: { clientId } }
      )
    } else {
      response = await axios.post(
        `${configStore.apiApotikUrl}/index.php/api/inventory/supplier_create`,
        payload,
        { params: { clientId } }
      )
    }

    if (response.data) {
      showSuccess(isEditMode.value ? 'Supplier berhasil diperbarui' : 'Supplier berhasil ditambahkan')
      router.push('/supplier/list')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    showError('Gagal menyimpan data supplier')
  } finally {
    loading.value = false
  }
}

const showDeleteConfirm = () => {
  if (confirm(`Apakah Anda yakin ingin menghapus supplier ini? Data tidak dapat dikembalikan.`)) {
    deleteSupplier()
  }
}

const deleteSupplier = async () => {
  loading.value = true
  try {
    const clientId = authStore.id_client
    await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/inventory/supplier_delete/${supplierId.value}`,
      {},
      { params: { clientId } }
    )
    showSuccess('Supplier berhasil dihapus')
    router.push('/supplier/list')
  } catch (error) {
    console.error('Error deleting supplier:', error)
    showError('Gagal menghapus supplier')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/supplier/list')
}

onBeforeMount(() => {
  if (route.params.id) {
    supplierId.value = route.params.id
    fetchSupplier(supplierId.value)
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

/* ── Form Controls ── */
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
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

.input-group-text {
  font-size: 14px;
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
}
</style>
