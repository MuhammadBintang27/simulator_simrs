<template>
  <div class="modern-form-laporan">
    <!-- Section: Informasi Pelapor -->
    <div class="form-section">
      <h6 class="section-title">
        <i class="pi pi-user"></i>
        Informasi Pelapor
      </h6>
      
      <div class="form-field">
        <label class="field-label">
          Nama Pelapor <span class="required">*</span>
        </label>
        <InputText 
          v-model="form.reporter_name" 
          placeholder="Masukkan nama lengkap"
          :class="{ 'p-invalid': errors.reporter_name }"
          class="modern-input"
        />
        <small v-if="errors.reporter_name" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ errors.reporter_name }}
        </small>
      </div>
    </div>

    <!-- Section: Detail Masalah -->
    <div class="form-section">
      <h6 class="section-title">
        <i class="pi pi-exclamation-triangle"></i>
        Detail Masalah
      </h6>

      <div class="form-field">
        <label class="field-label">
          Kategori <span class="required">*</span>
        </label>
        <Select
          v-model="form.problem_category"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih kategori"
          :class="{ 'p-invalid': errors.problem_category }"
          class="modern-select"
        />
        <small v-if="errors.problem_category" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ errors.problem_category }}
        </small>
      </div>

      <div class="form-field">
        <label class="field-label">
          Judul Masalah <span class="required">*</span>
        </label>
        <InputText 
          v-model="form.problem_title" 
          placeholder="Judul singkat dan jelas"
          :class="{ 'p-invalid': errors.problem_title }"
          class="modern-input"
        />
        <small v-if="errors.problem_title" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ errors.problem_title }}
        </small>
      </div>

      <div class="form-field">
        <label class="field-label">
          Deskripsi Lengkap <span class="required">*</span>
        </label>
        <Textarea
          v-model="form.problem_description"
          rows="5"
          placeholder="Jelaskan masalah secara detail, termasuk kronologi kejadian..."
          :class="{ 'p-invalid': errors.problem_description }"
          class="modern-textarea"
        />
        <div class="field-hint">
          <small>Minimal 20 karakter</small>
          <small class="char-count">{{ form.problem_description?.length || 0 }}/500</small>
        </div>
        <small v-if="errors.problem_description" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ errors.problem_description }}
        </small>
      </div>

      <div class="form-field">
        <label class="field-label">
          Lokasi <span class="required">*</span>
        </label>
        <InputText 
          v-model="form.location" 
          placeholder="Ruangan, gedung, atau area kejadian"
          :class="{ 'p-invalid': errors.location }"
          class="modern-input"
        />
        <small v-if="errors.location" class="error-message">
          <i class="pi pi-exclamation-circle"></i> {{ errors.location }}
        </small>
      </div>
    </div>

    <!-- Section: Foto Bukti Masalah -->
    <div class="form-section">
      <h6 class="section-title">
        <i class="pi pi-camera"></i>
        Foto Bukti Masalah <span class="optional-badge">Opsional</span>
      </h6>

      <div class="upload-area">
        <FileUpload
          ref="fileUploadRef"
          name="photos[]"
          :multiple="true"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp"
          :maxFileSize="5000000"
          :fileLimit="5"
          :showUploadButton="false"
          :auto="false"
          chooseLabel="Pilih Foto"
          @select="onPhotoSelect"
          @remove="onPhotoRemove"
          class="modern-upload"
        >
          <template #empty>
            <div class="upload-placeholder">
              <i class="pi pi-cloud-upload upload-icon"></i>
              <p class="upload-text">Drag & drop foto atau klik untuk memilih</p>
              <small class="upload-hint">
                Maksimal 5 foto, masing-masing 5MB • Format: JPG, PNG, GIF, BMP
              </small>
            </div>
          </template>
        </FileUpload>
        
        <div v-if="selectedPhotos.length > 0" class="selected-files-info">
          <i class="pi pi-check-circle"></i>
          <span>{{ selectedPhotos.length }} foto dipilih (akan diupload setelah laporan dibuat)</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions">
      <Button 
        label="Batal" 
        icon="pi pi-times"
        severity="secondary" 
        @click="handleCancel" 
        outlined
        class="cancel-btn"
      />
      <Button
        label="Simpan Laporan"
        icon="pi pi-check"
        :loading="submitting"
        @click="handleSubmit"
        class="submit-btn"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const props = defineProps({
  reportData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const store = usePenugasanLayananStore()
const authStore = useAuthStore()
const { user_name, user_id } = storeToRefs(authStore)

const form = ref({
  reporter_name: '',
  problem_category: null,
  problem_title: '',
  problem_description: '',
  location: '',
})

const fileUploadRef = ref(null)
const selectedPhotos = ref([])
const errors = ref({})
const submitting = ref(false)

const categoryOptions = ref([
  { label: 'IT', value: 'IT' },
  { label: 'Listrik', value: 'Listrik' },
  { label: 'Obat-obatan/BMHP', value: 'Obat-obatan/BMHP' },
  { label: 'Alat Kesehatan', value: 'alat kesehatan' },
  { label: 'Bangunan', value: 'bangunan' },
  { label: 'Kebersihan', value: 'kebersihan' },
])

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.reporter_name?.trim()) {
    errors.value.reporter_name = 'Nama pelapor wajib diisi'
    isValid = false
  }

  if (!form.value.problem_category) {
    errors.value.problem_category = 'Kategori wajib dipilih'
    isValid = false
  } else {
    const validCategories = ['IT', 'Listrik', 'Obat-obatan/BMHP', 'alat kesehatan', 'bangunan', 'kebersihan']
    if (!validCategories.includes(form.value.problem_category)) {
      errors.value.problem_category = `Kategori tidak valid: ${form.value.problem_category}`
      isValid = false
    }
  }

  if (!form.value.problem_title?.trim()) {
    errors.value.problem_title = 'Judul masalah wajib diisi'
    isValid = false
  }

  if (!form.value.problem_description?.trim()) {
    errors.value.problem_description = 'Deskripsi masalah wajib diisi'
    isValid = false
  } else if (form.value.problem_description.length < 20) {
    errors.value.problem_description = 'Deskripsi minimal 20 karakter'
    isValid = false
  }

  if (!form.value.location?.trim()) {
    errors.value.location = 'Lokasi wajib diisi'
    isValid = false
  }

  return isValid
}

const onPhotoSelect = (event) => {
  selectedPhotos.value = event.files || []
  errors.value.photos = ''
}

const onPhotoRemove = (event) => {
  selectedPhotos.value = fileUploadRef.value?.files || []
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  try {
    // ✅ Create FormData untuk multipart upload
    const formData = new FormData()
    
    // Add form fields
    formData.append('reporter_name', form.value.reporter_name)
    formData.append('problem_category', form.value.problem_category)
    formData.append('problem_title', form.value.problem_title)
    formData.append('problem_description', form.value.problem_description)
    formData.append('location', form.value.location)
    
    // ✅ Add photos as actual file objects
    selectedPhotos.value.forEach((file, index) => {
      formData.append('photos[]', file) // Backend expects photos[] array
    })
    
    
    // Emit FormData object instead of plain object
    emit('submit', formData)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

watch(
  () => props.reportData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!props.reportData && user_name.value) {
    form.value.reporter_name = user_name.value
  }

  if (props.reportData) {
    selectedPhotos.value = []
  }

  if (store.enums.categories.length === 0) {
    await store.fetchEnums()
  }
})
</script>

<style scoped>
.modern-form-laporan {
  max-width: 900px;
  margin: 0 auto;
}

/* Form Section */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #4f8f7a;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 2px solid #4f8f7a;
}

.section-title i {
  font-size: 18px;
}

/* Form Field */
.form-field {
  margin-bottom: 20px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.required {
  color: #e74c3c;
}

.optional-badge {
  background: #6c757d;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  margin-left: 8px;
}

/* Modern Input Styles */
.modern-input,
.modern-select,
.modern-textarea {
  width: 100%;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.modern-input:hover,
.modern-select:hover,
.modern-textarea:hover {
  border-color: #4f8f7a;
}

.modern-input:focus,
.modern-select:focus,
.modern-textarea:focus {
  border-color: #4f8f7a;
  box-shadow: 0 0 0 3px rgba(79, 143, 122, 0.1);
}

.modern-input.p-invalid,
.modern-select.p-invalid,
.modern-textarea.p-invalid {
  border-color: #e74c3c;
}

/* Form Row (for side-by-side fields) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.half-width {
  margin-bottom: 0 !important;
}

/* Field Hint */
.field-hint {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  color: #6c757d;
  font-size: 12px;
}

.char-count {
  color: #4f8f7a;
  font-weight: 500;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e74c3c;
  font-size: 13px;
  margin-top: 6px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Info Section */
.info-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
}

.info-section .section-title {
  color: #92400e;
  border-bottom-color: #f59e0b;
}

.info-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.info-text {
  flex: 1;
}

.info-text p {
  margin: 0;
  color: #78350f;
}

.info-text strong {
  color: #92400e;
}

/* Upload Area */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 24px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #4f8f7a;
  background: #f0f9f6;
}

.modern-upload {
  width: 100%;
}

.upload-placeholder {
  text-align: center;
  padding: 32px 16px;
}

.upload-icon {
  font-size: 48px;
  color: #4f8f7a;
  margin-bottom: 16px;
  opacity: 0.7;
}

.upload-text {
  font-size: 15px;
  font-weight: 500;
  color: #4f8f7a;
  margin-bottom: 8px;
}

.upload-hint {
  color: #6c757d;
  font-size: 13px;
}

.selected-files-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #d4edda;
  border-radius: 8px;
  color: #155724;
  font-weight: 500;
}

.selected-files-info i {
  font-size: 18px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  min-width: 120px;
}

.submit-btn {
  min-width: 160px;
  background: linear-gradient(135deg, #4f8f7a 0%, #3f7663 100%);
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #3f7663 0%, #2f5d4f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 143, 122, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .form-section {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

/* Animation */
.form-section {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
