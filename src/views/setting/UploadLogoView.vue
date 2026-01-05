<template>
  <Toast />
  <Panel>
    <template #header>
      <h5>Logo perusahaan</h5>
    </template>
    <div class="logo-wrapper">
      <img class="logo-preview" :src="props.data" alt="Logo Preview" />
    </div>
    <div class="p-col-12 text-right mt-2">
      <Button class="round-button2" @click="openDialog">✏️ Ubah</Button>
    </div>
  </Panel>

  <Dialog
    v-model:visible="visible"
    :style="{ width: '40rem' }"
    :modal="true"
    :closable="true"
    :closeOnEscape="true"
    header="Perusahaan"
    class="company-dialog"
  >
    <div class="form-container">
      <div class="form-section">
        <label class="form-label">Logo Perusahaan (max 20MB)</label>
        <div class="upload-container">
          <div class="upload-area">
            <div v-if="logoPreview" class="preview-container">
              <Image :src="logoPreview" alt="Logo Preview" preview width="150" />
            </div>
            <div v-else class="upload-placeholder">
              <!-- Empty placeholder -->
            </div>
          </div>
          <div class="action-buttons">
            <!-- <Button icon="pi pi-upload" label="Unggah Ulang" text @click="uploadLogo" /> -->
            <!-- <input type="file" icon="pi pi-upload" accept="image/*" @change="handleFileChange" /> -->
            <label for="file-upload" class="file-upload-label">
              <span class="upload-icon"><i class="pi pi-upload"></i></span>
              <span class="upload-text">Pilih File</span>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="file-input"
              />
            </label>
            <Button icon="pi pi-trash" label="Hapus" text severity="danger" @click="deleteLogo" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button label="Simpan" icon="pi pi-check" small @click="uploadLogo" class="round-button" />
        <Button
          label="Batalkan"
          icon="pi pi-times"
          small
          @click="closeDialog"
          outlined
          class="cancel-button"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config' // Adjust path based on your project structure
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore) // Makes it reactive

const openDialog = () => {
  visible.value = true
}

const props = defineProps({
  data: String,
  // other props...
})

const emit = defineEmits(['file-selected', 'file-removed'])
const fileName = ref('')
const selectedFile = ref(null)

// Methods
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file
  fileName.value = file.name

  // Create image preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  emit('file-selected', file)
}

const closeDialog = () => {
  visible.value = false
}

const uploadLogo = async () => {
  try {
    const formData = new FormData()

    formData.append('file', selectedFile.value)
    formData.append('id_client', id_client.value)

    const url = configStore.apiBaseUrl // Replace with actual API config

    const response = await axios.post(`${url}/v1/upload_logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Handle successful response
    if (response.status === 200) {
      //showSuccess('success', 'Data telah berhasil di upload')

      toast.add({
        severity: 'success',
        summary: 'Sukses',
        detail: 'logo berhasil di uload',
        life: 3000,
      })

      closeDialog()
    }
  } catch (error) {
    console.error('Error uploading files:', error)

    toast.add({
      severity: 'warn',
      summary: 'Error',
      detail: error,
      life: 3000,
    })
  }
}
const logoPreview = ref(null)

const deleteLogo = () => {
  logoPreview.value = null
  console.log('Delete logo')
}

onMounted(() => {
  //logoPreview.value = props.data
  //   logoPreview.value = props.data.response.url
})
</script>

<style>
.file-upload-label {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
}

.file-upload-label:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.upload-icon {
  margin-right: 10px;
  color: #4a90e2;
  font-size: 1.2rem;
}

.upload-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input {
  display: none;
}

.w-full {
  width: 100%;
}
.p-col-12 {
  flex: 0 0 100%;
  padding: 0 0.5rem;
}

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: scale-down;
  border-radius: 8px;
  margin: 30px;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 150px; /* allow space but not force size */
  border: 1px dashed #ccc;
  overflow: hidden;
}
</style>
<style scoped>
.form-container {
  padding: 0 1rem;
}

.form-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.upload-container {
  border: 1px dashed #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.upload-area {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  min-height: 150px;
  align-items: center;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  min-height: 150px;
  align-items: center;
}

.upload-placeholder {
  width: 100%;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  border-top: 2px solid #eee;
  padding: 0.75rem 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
}

.save-button {
  border-radius: 2rem;
  padding: 0.75rem 2rem;
}

.cancel-button {
  border-radius: 2rem;
  padding: 0.75rem 2rem;
}

/* Override PrimeVue dialog header for "Perusahaan" tab look */
::v-deep(.p-dialog-header) {
  padding-bottom: 0.5rem;
}

::v-deep(.p-dialog-title) {
  background-color: #e6f0fa;
  color: #4a90e2;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
}

.company-dialog ::v-deep(.p-dialog-header-close) {
  font-size: 1.5rem;
}
</style>
