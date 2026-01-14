<template>
  <div class="file-viewer-container">
    <!-- Header with Refresh Button -->
    <div class="header-section">
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="fetchData()"
        :loading="loading"
        class="p-button-sm"
      />
      <Button
        label="Upload File"
        icon="pi pi-upload"
        @click="showUploadDialog()"
        class="p-button-sm ml-1"
      />
      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelected"
      />
    </div>

    <!-- Data Table -->
    <div class="table-section p-4">
      <DataTable
        :value="files"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        :globalFilter="globalFilter"
        :globalFilterFields="['norm', 'caption_file', 'namadokter', 'poli']"
        responsiveLayout="scroll"
        stripedRows
        class="p-datatable-sm"
        filterDisplay="row"
      >
        <!-- Thumbnail Column -->
        <Column
          header="Gambar"
          headerStyle="width:110px;text-align:center"
          bodyClass="p-text-center"
        >
          <template #body="slotProps">
            <Image
              :src="slotProps.data.src"
              :alt="slotProps.data.caption_file"
              width="100"
              preview
              imageStyle="
                cursor: pointer;
                max-width: 90px;
                max-height: 70px;
                border-radius: 6px;
                object-fit: cover;
              "
            />
          </template>
        </Column>

        <!-- Caption Column -->
        <Column field="caption_file" header="Keterangan" sortable />

        <!-- Date Column -->
        <Column field="tglreg" header="Tanggal" sortable />

        <!-- Doctor Column -->
        <Column field="namadokter" header="Dokter" sortable />

        <!-- Clinic Column -->
        <Column field="poli" header="Poli" sortable />

        <!-- Treatment Type Column -->
        <Column field="jenisrawat" header="Jenis Rawat" />

        <!-- Action Column -->
        <Column header="Aksi" bodyClass="p-text-center" headerStyle="width:120px">
          <template #body="slotProps">
            <Button
              icon="pi pi-download"
              class="p-button-text p-button-sm"
              @click="download(slotProps.data)"
              v-tooltip="'Download file'"
              aria-label="Download"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              @click="confirmDelete(slotProps.data)"
              v-tooltip="'Hapus file'"
              aria-label="Delete"
            />
          </template>
        </Column>

        <!-- Empty Message -->
        <template #empty>
          <div class="p-4 p-text-center">
            <p>Tidak ada file ditemukan</p>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Upload Dialog -->
    <Dialog
      v-model:visible="uploadDialogVisible"
      header="Upload Gambar"
      :modal="true"
      :style="{ width: '500px' }"
      @hide="resetUploadForm"
    >
      <div class="upload-dialog-content">
        <!-- Preview Section -->
        <div v-if="imagePreview" class="preview-section mb-4">
          <div class="preview-container">
            <img :src="imagePreview" alt="Preview" class="preview-image" />
          </div>
          <Button
            label="Ubah Gambar"
            icon="pi pi-image"
            @click="handleUploadClick()"
            class="p-button-sm p-button-default w-full mt-3"
          />
        </div>

        <!-- Upload Area (when no preview) -->
        <div v-else class="upload-area mb-4">
          <div class="upload-box" @click="handleUploadClick()">
            <i class="pi pi-cloud-upload"></i>
            <p>Klik untuk memilih gambar</p>
            <small>atau drag & drop gambar di sini</small>
          </div>
        </div>

        <!-- File Name Display -->
        <div v-if="selectedFileName" class="file-info mb-3">
          <small
            >File: <strong>{{ selectedFileName }}</strong></small
          >
        </div>

        <!-- Buttons -->
        <div class="button-group">
          <Button
            v-if="imagePreview"
            label="Batal"
            icon="pi pi-times"
            @click="resetUploadForm"
            security="warn"
          />
          <Button
            v-if="imagePreview"
            label="Upload"
            icon="pi pi-check"
            @click="uploadImage(selectedFile)"
            :loading="loading"
            class="p-button-sm p-button-success ml-2"
          />
          <Button
            v-if="!imagePreview"
            label="Batal"
            icon="pi pi-times"
            @click="uploadDialogVisible = false"
            class="p-button-sm p-button-secondary w-full"
          />
        </div>
      </div>
    </Dialog>

    <!-- Toast Messages -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import { useAuthStore } from '@/stores/config'
import { useConfigStore } from '@/stores/config'

import { useConfirm as usePrimeVueConfirm } from 'primevue/useconfirm'
const confirm = usePrimeVueConfirm()

// ==================== Store Setup ====================
const authStore = useAuthStore()
const configStore = useConfigStore()
const { id_client } = storeToRefs(authStore)
const route = useRoute()

// ==================== Toast Setup ====================
const toast = useToast()

// ==================== State ====================
const loading = ref(false)
const files = ref([])
const globalFilter = ref(null)
const fileInput = ref(null)
const uploadDialogVisible = ref(false)
const selectedFile = ref(null)
const selectedFileName = ref('')
const imagePreview = ref('')

// ==================== Props ====================
defineProps({
  initialFiles: {
    type: Array,
    default: () => [],
  },
})

// ==================== Toast Functions ====================
const showSuccess = (message = 'Operasi berhasil') => {
  toast.add({
    severity: 'success',
    summary: 'Sukses',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'Terjadi kesalahan') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const showWarning = (message = 'Peringatan') => {
  toast.add({
    severity: 'warn',
    summary: 'Peringatan',
    detail: message,
    life: 4000,
  })
}

// ==================== Dialog Functions ====================
const showUploadDialog = () => {
  uploadDialogVisible.value = true
}

const resetUploadForm = () => {
  selectedFile.value = null
  selectedFileName.value = ''
  imagePreview.value = ''
  uploadDialogVisible.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// ==================== File Upload ====================
const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleFileSelected = async (event) => {
  try {
    const file = event.target.files?.[0]

    if (!file) {
      showWarning('Tidak ada file yang dipilih')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('File harus berupa gambar')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showError('Ukuran file maksimal 5MB')
      return
    }

    // Store file and create preview
    selectedFile.value = file
    selectedFileName.value = file.name

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result || ''
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error selecting file:', error)
    showError('Gagal memproses file')
  }
}

const uploadImage = async (file) => {
  try {
    loading.value = true

    if (!file) {
      showError('File tidak ditemukan')
      return
    }

    const formData = new FormData()
    formData.append('file', file, `lampiran_file${new Date().getTime()}.png`)
    formData.append('timestamp', new Date().toISOString())
    formData.append('type', 'lampiran_file')
    formData.append(
      'data',
      JSON.stringify({
        noregister: route.query.noreg,
        noreceipt: '',
        caption_file: 'LAMPIRAN FILE',
        noreff: '',
        module_upload: 'LAMPIRAN',
        foldername: 'LAMPIRAN',
        directori: 'LAMPIRAN',
        file_lampiran: '',
        id_client: id_client.value,
      }),
    )

    const url = configStore.laravel
    const response = await axios.post(`${url}/uploadlampiran_for_api`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    loading.value = false

    console.log(response.data)
    if (response.data.metadata.code !== 200) {
      showError(response.data.metadata.message)
    } else {
      showSuccess('Gambar berhasil disimpan')
      resetUploadForm()
      await fetchData()
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    showError(
      error.response?.data?.metadata?.message ||
        error.message ||
        'Terjadi kesalahan saat menyimpan',
    )
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item) => {
  //   confirm.require({
  //     message: `Apakah Anda yakin ingin menghapus file "${item.caption_file}"?`,
  //     header: 'Konfirmasi Hapus',
  //     icon: 'pi pi-exclamation-triangle',
  //     accept: () => {
  //       //deleteFile(item)
  //     },
  //     reject: () => {
  //       showWarning('Penghapusan dibatalkan')
  //     },
  //   })
  // }

  confirm.require({
    message: `Apakah Anda yakin ingin menghapus file "${item.caption_file}"?`,
    header: 'Konfirm hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => {
      deleteFile(item)
    },
  })
}

const deleteFile = async (item) => {
  try {
    loading.value = true

    if (!item.id) {
      showError('ID file tidak ditemukan')
      return
    }

    const payload = {
      id_client: id_client.value,
      id: item.id,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/hapus_lampiran`, payload)

    if (response.data.metadata.code !== 200) {
      showError(response.data.metadata.message)
    } else {
      showSuccess('File berhasil dihapus')
      await fetchData()
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    showError(
      error.response?.data?.metadata?.message ||
        error.message ||
        'Terjadi kesalahan saat menghapus file',
    )
  } finally {
    loading.value = false
  }
}

// ==================== Methods ====================
const download = (item) => {
  if (!item.file_lampiran) {
    showWarning('File tidak tersedia')
    return
  }
  window.open(item.file_lampiran, '_blank')
  showSuccess('File download dimulai')
}

const fetchData = async () => {
  try {
    loading.value = true

    if (!route.query.nomr) {
      showWarning('Nomor rekam medis tidak ditemukan')
      loading.value = false
      return
    }

    const payload = {
      id_client: id_client.value,
      jenisrawat: 'JALAN',
      nomr: route.query.nomr,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/get_filelampiran_pasien`,
      payload,
    )

    if (response.data.response && Array.isArray(response.data.response)) {
      files.value = response.data.response
    } else {
      files.value = []
      showWarning('Tidak ada file ditemukan')
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat file lampiran. Periksa koneksi internet Anda.')
    files.value = []
    loading.value = false
  }
}

// ==================== Lifecycle ====================
onMounted(() => {
  // fetchData()
})
</script>

<style scoped>
.file-viewer-container {
  width: 100%;
  background-color: #f5f5f5;
}

.header-section {
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-start;
  gap: 0.5rem;
}

.search-section {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.table-section {
  background-color: #fff;
  border-radius: 4px;
  margin: 1rem;
}

.w-full {
  width: 100%;
}

/* Upload Dialog Styles */
.upload-dialog-content {
  padding: 1rem 0;
}

.preview-section {
  text-align: center;
}

.preview-container {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 6px;
  object-fit: contain;
}

.upload-area {
  margin-bottom: 2rem;
}

.upload-box {
  border: 2px dashed #d0d0d0;
  border-radius: 8px;
  padding: 3rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.upload-box:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-box i {
  font-size: 2rem;
  color: #3b82f6;
  display: block;
  margin-bottom: 0.5rem;
}

.upload-box p {
  margin: 0.5rem 0;
  font-weight: 500;
  color: #333;
}

.upload-box small {
  color: #666;
  display: block;
}

.file-info {
  padding: 0.75rem;
  background-color: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 1rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.p-button-secondary {
  background-color: #6b7280 !important;
  border-color: #6b7280 !important;
}

.p-button-secondary:hover {
  background-color: #4b5563 !important;
  border-color: #4b5563 !important;
}

.p-button-success {
  background-color: #10b981 !important;
  border-color: #10b981 !important;
}

.p-button-success:hover {
  background-color: #059669 !important;
  border-color: #059669 !important;
}
</style>
