<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <section class="content">
    <Panel>
      <template #header>
        <h5 class="mt-0"><b>LAPORAN OPERASI</b></h5>
        Last update {{ formatDate(data_laporan?.created_at) }}
      </template>

      <div class="row">
        <!-- Pemeriksaan PA -->
        <div class="col-md-12 mb-3">
          <label class="d-block mb-2">Pemeriksaan PA</label>
          <div class="form-check form-check-inline">
            <RadioButton inputId="paTidak" name="pa" value="Tidak" v-model="form.pa" />
            <label for="paTidak" class="ml-2">Tidak</label>
          </div>
          <div class="form-check form-check-inline">
            <RadioButton inputId="paYa" name="pa" value="Ya" v-model="form.pa" />
            <label for="paYa" class="ml-2">Ya</label>
          </div>
        </div>

        <!-- Jaringan yang Dieksisi -->
        <div class="col-md-6 mb-3">
          <label>Jaringan yang Dieksisi/Insisi</label>
          <InputText
            v-model="form.jaringan"
            placeholder="Jaringan yang Dieksisi/Insisi"
            class="w-100 form-control"
          />
        </div>

        <!-- Jumlah Perdarahan -->
        <div class="col-md-6 mb-3">
          <label>Jumlah Perdarahan</label>
          <div class="input-group">
            <InputNumber v-model="form.perdarahan" placeholder="Jumlah Perdarahan" class="w-90" />
            <span class="input-group-text">CC</span>
          </div>
        </div>

        <!-- Jenis Anestesi -->
        <div class="col-md-6 mb-3">
          <label>Jenis Anestesi</label>
          <InputText
            v-model="form.anestesi"
            placeholder="Jenis Anestesi"
            class="w-100 form-control"
          />
        </div>

        <!-- Diagnosa Pra Operasi -->
        <div class="col-md-6 mb-3">
          <label>Diagnosa Pra Operasi</label>
          <InputText
            v-model="form.diagnosaPra"
            placeholder="Diagnosa Pra Operasi"
            class="w-100 form-control"
          />
        </div>

        <!-- Komplikasi Penyulit -->
        <div class="col-md-6 mb-3">
          <label>Komplikasi Penyulit</label>
          <InputText
            v-model="form.komplikasi"
            placeholder="Komplikasi Penyulit"
            class="w-100 form-control"
          />
        </div>

        <!-- Diagnosa Pasca Operasi -->
        <div class="col-md-6 mb-3">
          <label>Diagnosa Pasca Operasi</label>
          <InputText
            v-model="form.diagnosaPasca"
            placeholder="Diagnosa Pasca Operasi"
            class="w-100 form-control"
          />
        </div>

        <!-- Uraian Pembedahan -->
        <div class="col-md-6 mb-3">
          <label>Uraian Pembedahan</label>
          <InputTextarea
            v-model="form.uraian"
            placeholder="Uraian Pembedahan"
            class="w-100 form-control"
            rows="5"
          />
        </div>

        <!-- Instruksi Pasca Operasi -->
        <div class="col-md-6 mb-3">
          <label>Instruksi Pasca Operasi</label>
          <InputTextarea
            v-model="form.instruksi"
            placeholder="Instruksi Pasca Operasi"
            class="w-100 form-control"
            rows="5"
          />
        </div>

        <!-- Upload Multiple Images -->
        <div class="col-md-6 mb-3">
          <label>Gambar Medis</label>
          <div class="custom-file-upload">
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*"
              @change="onFileChange"
              class="file-input"
              id="medical-images"
            />
            <label for="medical-images" class="file-upload-label">
              <i class="pi pi-upload"></i>
              Pilih Gambar (Multiple)
            </label>
            <div v-if="getTotalImageCount() > 0" class="file-count">
              {{ getTotalImageCount() }} gambar total
            </div>
          </div>

          <!-- Display all images (existing + newly uploaded) -->
          <div v-if="allImages.length > 0" class="mt-3">
            <div class="row">
              <div v-for="(image, index) in allImages" :key="index" class="col-md-4 mb-2">
                <div class="image-preview">
                  <img :src="image.preview" :alt="`Preview ${index + 1}`" class="preview-img" />
                  <button
                    type="button"
                    class="btn btn-danger btn-sm remove-btn"
                    @click="removeImage(index)"
                  >
                    <i class="pi pi-times"></i>
                  </button>
                  <div class="image-info">
                    <small>{{ image.name }}</small>
                    <div class="image-type">
                      <span :class="image.isExisting ? 'badge-existing' : 'badge-new'">
                        {{ image.isExisting ? 'Tersimpan' : 'Upload Baru' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Keterangan Gambar -->
        <div class="col-md-6 mb-3">
          <label>Keterangan Gambar</label>
          <InputTextarea
            v-model="form.keterangan_gambar"
            placeholder="Keterangan Gambar"
            class="w-100 form-control"
            rows="5"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-12 text-center">
          <Button
            label="Simpan"
            class="round-button2"
            icon="pi pi-save"
            @click="saveForm"
            :loading="loading"
          />
        </div>
      </div>
    </Panel>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputTextarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'
const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

import { useRoute } from 'vue-router'
const route = useRoute()

const form = ref({
  pa: 'Tidak',
  noregister: route.query.noreg,
  kodeboking: route.query.kodebooking,
  jaringan: '',
  perdarahan: 0,
  anestesi: '',
  diagnosaPra: '',
  diagnosaPasca: '',
  komplikasi: '',
  uraian: '',
  instruksi: '',
  keterangan_gambar: '',
  id_client: id_client.value,
})

// Separate arrays for different image types
const existingImages = ref([]) // Images from database
const uploadedImages = ref([]) // Newly uploaded images
const fileInputRef = ref(null)

// Computed property to combine all images for display
const allImages = computed(() => {
  return [
    ...existingImages.value.map((img) => ({
      ...img,
      isExisting: true,
    })),
    ...uploadedImages.value.map((img) => ({
      ...img,
      isExisting: false,
    })),
  ]
})

// Function to get total image count
const getTotalImageCount = () => {
  return existingImages.value.length + uploadedImages.value.length
}

// Function untuk menangani perubahan file input
const onFileChange = (event) => {
  const files = Array.from(event.target.files)

  if (files.length === 0) return

  let successCount = 0

  files.forEach((file) => {
    // Cek apakah file sudah ada (berdasarkan nama dan ukuran)
    const isDuplicate =
      uploadedImages.value.some((img) => img.name === file.name && img.size === file.size) ||
      existingImages.value.some((img) => img.name === file.name)

    if (isDuplicate) {
      toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `File ${file.name} sudah ada`,
        life: 3000,
      })
      return
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `File ${file.name} bukan file gambar`,
        life: 3000,
      })
      return
    }

    // Validasi ukuran file (5MB max)
    if (file.size > 5000000) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `File ${file.name} terlalu besar (max 5MB)`,
        life: 3000,
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImages.value.push({
        file: file,
        name: file.name,
        size: file.size,
        preview: e.target.result,
      })
    }
    reader.readAsDataURL(file)
    successCount++
  })

  // Reset input untuk memungkinkan upload file yang sama
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  if (successCount > 0) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${successCount} gambar berhasil dipilih`,
      life: 3000,
    })
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

// Function untuk menghapus gambar dari preview
const removeImage = async (index) => {
  const totalExisting = existingImages.value.length

  if (index < totalExisting) {
    // Removing existing image from database
    const removedImage = existingImages.value[index]
    const respons = await removeImageFromDB(removedImage.id)
    if (respons) {
      console.log(removedImage)
      existingImages.value.splice(index, 1)

      toast.add({
        severity: 'info',
        summary: 'Info',
        detail: `Gambar database "${removedImage.name}" berhasil dihapus`,
        life: 3000,
      })
    }
  } else {
    // Removing newly uploaded image
    const uploadIndex = index - totalExisting
    const removedImage = uploadedImages.value[uploadIndex]
    uploadedImages.value.splice(uploadIndex, 1)

    toast.add({
      severity: 'info',
      summary: 'Info',
      detail: `Gambar upload "${removedImage.name}" berhasil dihapus`,
      life: 3000,
    })
  }
}

const removeImageFromDB = async (id) => {
  try {
    loading.value = true

    const param = {
      id: id,
      kodeboking: route.query.kodebooking,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/hapus_gambar_lampiran`, param) // ✅ Cleaner syntax
    loading.value = false

    console.log(response)

    return response
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Function untuk menyimpan form
const saveForm = async () => {
  try {
    loading.value = true

    // Validasi form
    if (!form.value.jaringan || !form.value.diagnosaPra) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Harap lengkapi field yang wajib diisi',
        life: 3000,
      })
      return
    }

    // Buat FormData untuk upload file
    const formData = new FormData()

    // Append form data text fields
    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null && form.value[key] !== '') {
        formData.append(key, form.value[key])
      }
    })

    // Append newly uploaded images
    if (uploadedImages.value.length > 0) {
      uploadedImages.value.forEach((imageObj, index) => {
        formData.append(`medical_images[${index}]`, imageObj.file)
      })
    }

    // Append existing images (as filenames/URLs to keep)
    if (existingImages.value.length > 0) {
      const existingImageNames = existingImages.value.map((img) => img.name)
      formData.append('existing_images', JSON.stringify(existingImageNames))
    }

    formData.append('data', JSON.stringify(form.value))

    // Send request
    const url = configStore.apiBaseUrl

    const response = await axios.post(
      `${url}/index.php/api/triaseigd/insert_laporan_operasi`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 detik timeout untuk upload gambar
      },
    )

    if (response.status == 200) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Laporan operasi berhasil disimpan',
        life: 3000,
      })

      // Refresh data after successful save
      await getdata_laporan()
    } else {
      throw new Error(response.data.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error('Error saving form:', error)

    let errorMessage = 'Gagal menyimpan laporan operasi'
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
    } else if (error.request) {
      // Network error
      errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const data_laporan = ref(null)

const getdata_laporan = async () => {
  try {
    loading.value = true

    const param = {
      kodeboking: route.query.kodebooking,
      id_client: id_client.value,
      mode: 1,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/get_laporan_operasi`, param)

    if (response.data.metadata?.code == '200') {
      data_laporan.value = response.data?.response

      // Populate form fields
      form.value.pa = data_laporan.value?.pa || 'Tidak'
      form.value.jaringan = data_laporan.value?.jaringan || ''
      form.value.perdarahan = data_laporan.value?.perdarahan || 0
      form.value.anestesi = data_laporan.value?.anestesi || ''
      form.value.diagnosaPra = data_laporan.value?.diagnosaPra || ''
      form.value.diagnosaPasca = data_laporan.value?.diagnosaPasca || ''
      form.value.komplikasi = data_laporan.value?.komplikasi || ''
      form.value.uraian = data_laporan.value?.uraian || ''
      form.value.instruksi = data_laporan.value?.instruksi || ''
      form.value.keterangan_gambar = data_laporan.value?.keterangan_gambar || ''

      // Clear existing images and populate with database images
      existingImages.value = []
      uploadedImages.value = []

      if (response.data?.lampiran) {
        existingImages.value = response.data.lampiran.map((item) => ({
          name: item.filename,
          preview: item.filename, // Assuming this is a URL or path to the image
          id: item.id,
          isExisting: true,
        }))
      }

      console.log('Existing images loaded:', existingImages.value.length)
      console.log('Form data loaded successfully')
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data laporan operasi',
      life: 3000,
    })
  }
}

// Function untuk reset form
const resetForm = () => {
  // Reset form data
  form.value = {
    pa: 'Tidak',
    noregister: route.query.noreg,
    kodeboking: route.query.kodebooking,
    jaringan: '',
    perdarahan: 0,
    anestesi: '',
    diagnosaPra: '',
    diagnosaPasca: '',
    komplikasi: '',
    uraian: '',
    instruksi: '',
    keterangan_gambar: '',
    id_client: id_client.value,
  }

  // Reset images
  existingImages.value = []
  uploadedImages.value = []

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

onMounted(() => {
  getdata_laporan()
})
</script>

<style scoped>
label {
  font-weight: 600;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group-text {
  background: #f4f6f9;
  border: 1px solid #ced4da;
  padding: 0.375rem 0.75rem;
}

.image-preview {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.preview-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.image-info {
  padding: 8px;
  background: white;
  text-align: center;
}

.image-info small {
  color: #666;
  word-break: break-all;
}

.image-type {
  margin-top: 4px;
}

.badge-existing {
  background: #28a745;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

.badge-new {
  background: #007bff;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

/* Custom file upload styling */
.custom-file-upload {
  position: relative;
  width: 100%;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  background: #38a3a5;
  color: white;
  border: 1px solid #38a3a5;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  margin-bottom: 0;
}

.file-upload-label:hover {
  background: #43aa8b;
  border-color: #43aa8b;
}

.file-upload-label i {
  margin-right: 8px;
}

.file-count {
  margin-top: 5px;
  padding: 5px 10px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #495057;
  text-align: center;
}

/* Custom FileUpload styling */
:deep(.p-fileupload-basic) {
  width: 100%;
}

:deep(.p-fileupload-choose) {
  width: 100%;
  background: #007bff;
  border-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

:deep(.p-fileupload-choose:hover) {
  background: #0056b3;
  border-color: #0056b3;
}
</style>
