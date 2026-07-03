<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />

  <!-- Banner -->
  <div class="laporan-banner mb-3">
    <div class="banner-icon">
      <i class="pi pi-file-edit"></i>
    </div>
    <div class="banner-content">
      <h4 class="banner-title">Laporan Operasi</h4>
      <p class="banner-desc">
        Dokumentasi hasil tindakan pembedahan meliputi diagnosa, uraian pembedahan, instruksi pasca
        operasi, dan dokumentasi gambar medis.
      </p>
    </div>
    <div v-if="data_laporan?.created_at" class="banner-meta">
      <i class="pi pi-clock me-1"></i>
      <span>Update: {{ formatDate(data_laporan.created_at) }}</span>
    </div>
  </div>

  <div class="row g-3">
    <!-- ===== INFORMASI OPERASI ===== -->
    <div class="col-md-6">
      <div class="laporan-card h-100">
        <div class="laporan-card-header info-header">
          <i class="pi pi-info-circle me-2"></i>
          <span>INFORMASI OPERASI</span>
          <small class="ms-auto">Diagnosa &amp; Anestesi</small>
        </div>
        <div class="laporan-card-body">
          <div class="field-group">
            <label class="field-label">Pemeriksaan PA</label>
            <div class="radio-group">
              <RadioButton inputId="paTidak" value="Tidak" v-model="form.pa" />
              <label for="paTidak" class="radio-label">Tidak</label>
              <RadioButton inputId="paYa" value="Ya" v-model="form.pa" />
              <label for="paYa" class="radio-label">Ya</label>
            </div>
          </div>

          <div class="section-divider"><span>Diagnosa</span></div>

          <div class="field-group">
            <label class="field-label">Diagnosa Pra Operasi <span class="required">*</span></label>
            <InputText
              v-model="form.diagnosaPra"
              placeholder="Diagnosa pra operasi..."
              class="w-100"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Diagnosa Pasca Operasi</label>
            <InputText
              v-model="form.diagnosaPasca"
              placeholder="Diagnosa pasca operasi..."
              class="w-100"
            />
          </div>

          <div class="section-divider"><span>Anestesi &amp; Klinis</span></div>

          <div class="field-group">
            <label class="field-label">Jenis Anestesi</label>
            <InputText
              v-model="form.anestesi"
              placeholder="Jenis anestesi yang digunakan..."
              class="w-100"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Komplikasi Penyulit</label>
            <InputText
              v-model="form.komplikasi"
              placeholder="Komplikasi penyulit..."
              class="w-100"
            />
          </div>
          <div class="field-group">
            <label class="field-label"
              >Jaringan yang Dieksisi/Insisi <span class="required">*</span></label
            >
            <InputText
              v-model="form.jaringan"
              placeholder="Jaringan yang dieksisi/insisi..."
              class="w-100"
            />
          </div>
          <div class="field-group mb-0">
            <label class="field-label">Jumlah Perdarahan</label>
            <div class="input-group input-group-sm">
              <InputNumber v-model="form.perdarahan" placeholder="0" class="w-90" />
              <span class="input-group-text">CC</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== WAKTU OPERASI ===== -->
    <div class="col-md-6">
      <div class="laporan-card h-100">
        <div class="laporan-card-header waktu-header">
          <i class="pi pi-clock me-2"></i>
          <span>WAKTU OPERASI</span>
          <small class="ms-auto">Durasi Tindakan</small>
        </div>
        <div class="laporan-card-body">
          <div class="section-divider"><span>Jadwal Tindakan</span></div>

          <div class="field-group">
            <label class="field-label"
              ><i class="pi pi-calendar me-1"></i>Tanggal &amp; Jam Mulai</label
            >
            <DatePicker
              v-model="form.tanggal_jam_mulai"
              placeholder="Pilih tanggal &amp; jam mulai"
              class="w-100"
              dateFormat="yy-mm-dd"
              showTime
              showIcon
              hourFormat="24"
            />
          </div>
          <div class="field-group">
            <label class="field-label"
              ><i class="pi pi-calendar me-1"></i>Tanggal &amp; Jam Selesai</label
            >
            <DatePicker
              v-model="form.tanggal_jam_selesai"
              placeholder="Pilih tanggal &amp; jam selesai"
              class="w-100"
              dateFormat="yy-mm-dd"
              showTime
              showIcon
              hourFormat="24"
            />
          </div>

          <div class="section-divider"><span>Durasi</span></div>

          <div class="field-group mb-0">
            <label class="field-label">Durasi Operasi</label>
            <div class="durasi-display" v-if="form.durasi">
              <i class="pi pi-stopwatch me-2" style="color: var(--p-yellow-600)"></i>
              <span class="durasi-value">{{ form.durasi }}</span>
              <span class="durasi-unit">menit</span>
            </div>
            <InputText
              v-else
              v-model="form.durasi"
              placeholder="Otomatis terisi..."
              class="w-100"
              disabled
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== URAIAN PEMBEDAHAN ===== -->
    <div class="col-md-6">
      <div class="laporan-card h-100">
        <div class="laporan-card-header uraian-header">
          <i class="pi pi-list me-2"></i>
          <span>URAIAN PEMBEDAHAN</span>
        </div>
        <div class="laporan-card-body">
          <div class="field-group mb-0">
            <label class="field-label">Detail Prosedur Pembedahan</label>
            <InputTextarea
              v-model="form.uraian"
              placeholder="Persiapan pasien, Insisi, Temuan selama operasi, Tindakan yang dilakukan, Penutupan luka..."
              class="w-100"
              rows="10"
              autoResize
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== INSTRUKSI PASCA OPERASI ===== -->
    <div class="col-md-6">
      <div class="laporan-card h-100">
        <div class="laporan-card-header instruksi-header">
          <i class="pi pi-book me-2"></i>
          <span>INSTRUKSI PASCA OPERASI</span>
        </div>
        <div class="laporan-card-body">
          <div class="field-group mb-0">
            <label class="field-label">Instruksi &amp; Catatan Pemulihan</label>
            <InputTextarea
              v-model="form.instruksi"
              placeholder="Instruksi pasca operasi, perawatan luka, obat-obatan, jadwal kontrol..."
              class="w-100"
              rows="10"
              autoResize
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== DOKUMENTASI GAMBAR ===== -->
    <div class="col-12">
      <div class="laporan-card">
        <div class="laporan-card-header gambar-header">
          <i class="pi pi-images me-2"></i>
          <span>DOKUMENTASI GAMBAR MEDIS</span>
          <div v-if="getTotalImageCount() > 0" class="ms-auto badge-count">
            {{ getTotalImageCount() }} gambar
          </div>
        </div>
        <div class="laporan-card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <!-- Upload Area -->
              <div class="field-group">
                <label class="field-label">Upload Gambar</label>
                <div class="upload-zone">
                  <input
                    ref="fileInputRef"
                    type="file"
                    multiple
                    accept="image/*"
                    @change="onFileChange"
                    class="file-input"
                    id="medical-images"
                  />
                  <label for="medical-images" class="upload-zone-label">
                    <i class="pi pi-cloud-upload"></i>
                    <span class="upload-text">Klik untuk pilih gambar</span>
                    <span class="upload-hint">PNG, JPG, JPEG • Maks 5MB per file</span>
                  </label>
                </div>
                <div v-if="getTotalImageCount() > 0" class="upload-count-badge">
                  <i class="pi pi-images me-1"></i>
                  {{ getTotalImageCount() }} gambar terpilih
                </div>
              </div>

              <!-- Keterangan Gambar -->
              <div class="field-group mb-0">
                <label class="field-label">Keterangan Gambar</label>
                <InputTextarea
                  v-model="form.keterangan_gambar"
                  placeholder="Keterangan gambar medis..."
                  class="w-100"
                  rows="5"
                  autoResize
                />
              </div>
            </div>

            <div class="col-md-8">
              <!-- Image Gallery -->
              <label class="field-label mb-2">Pratinjau Gambar</label>
              <div v-if="allImages.length === 0" class="gallery-empty">
                <i class="pi pi-image"></i>
                <span>Belum ada gambar</span>
              </div>
              <div v-else class="image-gallery">
                <div v-for="(image, index) in allImages" :key="index" class="gallery-item">
                  <img :src="image.preview" :alt="`Gambar ${index + 1}`" class="gallery-img" />
                  <button type="button" class="gallery-remove" @click="removeImage(index)">
                    <i class="pi pi-times"></i>
                  </button>
                  <div class="gallery-info">
                    <span class="gallery-name">{{ image.name }}</span>
                    <span :class="image.isExisting ? 'badge-existing' : 'badge-new'">
                      {{ image.isExisting ? 'Tersimpan' : 'Baru' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Bar -->
  <div class="laporan-action-bar mt-3">
    <div class="action-inner">
      <div class="action-info">
        <i class="pi pi-info-circle me-2" style="color: var(--p-text-muted-color)"></i>
        <span>Field bertanda <span class="required">*</span> wajib diisi sebelum menyimpan.</span>
      </div>
      <div class="action-buttons">
        <Button
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          class="me-2"
          @click="resetForm"
        />
        <Button
          label="Simpan Laporan"
          icon="pi pi-save"
          severity="success"
          :loading="loading"
          @click="saveForm"
        />
      </div>
    </div>
  </div>

  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputTextarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import DatePicker from 'primevue/datepicker'

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
  durasi: '',
  tanggal_jam_mulai: null,
  tanggal_jam_selesai: null,
  keterangan_gambar: '',
  id_client: id_client.value,
})

const existingImages = ref([])
const uploadedImages = ref([])
const fileInputRef = ref(null)

const allImages = computed(() => [
  ...existingImages.value.map((img) => ({ ...img, isExisting: true })),
  ...uploadedImages.value.map((img) => ({ ...img, isExisting: false })),
])

const getTotalImageCount = () => existingImages.value.length + uploadedImages.value.length

const onFileChange = (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  let successCount = 0
  files.forEach((file) => {
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
    if (!file.type.startsWith('image/')) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `File ${file.name} bukan file gambar`,
        life: 3000,
      })
      return
    }
    if (file.size > 5000000) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `File ${file.name} terlalu besar (max 5MB)`,
        life: 3000,
      })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImages.value.push({
        file,
        name: file.name,
        size: file.size,
        preview: e.target.result,
      })
    }
    reader.readAsDataURL(file)
    successCount++
  })

  if (fileInputRef.value) fileInputRef.value.value = ''
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

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  const yyyy = date.getFullYear()
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const HH = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`
}

const removeImage = async (index) => {
  const totalExisting = existingImages.value.length
  if (index < totalExisting) {
    const removedImage = existingImages.value[index]
    const respons = await removeImageFromDB(removedImage.id)
    if (respons) {
      existingImages.value.splice(index, 1)
      toast.add({
        severity: 'info',
        summary: 'Info',
        detail: `Gambar "${removedImage.name}" berhasil dihapus`,
        life: 3000,
      })
    }
  } else {
    const uploadIndex = index - totalExisting
    const removedImage = uploadedImages.value[uploadIndex]
    uploadedImages.value.splice(uploadIndex, 1)
    toast.add({
      severity: 'info',
      summary: 'Info',
      detail: `Gambar "${removedImage.name}" berhasil dihapus`,
      life: 3000,
    })
  }
}

const removeImageFromDB = async (id) => {
  try {
    loading.value = true
    const param = { id, kodeboking: route.query.kodebooking, id_client: id_client.value }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/hapus_gambar_lampiran`, param)
    loading.value = false
    return response
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

const toLocalDateString = (date) => {
  if (!date) return null
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const HH = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
}

const saveForm = async () => {
  try {
    loading.value = true
    form.value.tanggal_jam_mulai = toLocalDateString(form.value.tanggal_jam_mulai)
    form.value.tanggal_jam_selesai = toLocalDateString(form.value.tanggal_jam_selesai)

    if (!form.value.jaringan || !form.value.diagnosaPra) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Harap lengkapi field yang wajib diisi',
        life: 3000,
      })
      loading.value = false
      return
    }

    const formData = new FormData()
    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null && form.value[key] !== '') formData.append(key, form.value[key])
    })
    if (uploadedImages.value.length > 0) {
      uploadedImages.value.forEach((imageObj, index) =>
        formData.append(`medical_images[${index}]`, imageObj.file),
      )
    }
    if (existingImages.value.length > 0) {
      formData.append(
        'existing_images',
        JSON.stringify(existingImages.value.map((img) => img.name)),
      )
    }
    formData.append('data', JSON.stringify(form.value))

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/insert_laporan_operasi`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 },
    )

    if (response.status == 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Laporan operasi berhasil disimpan',
        life: 3000,
      })
      await getdata_laporan()
    } else {
      throw new Error(response.data.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error('Error saving form:', error)
    let errorMessage = 'Gagal menyimpan laporan operasi'
    if (error.response)
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
    else if (error.request) errorMessage = 'Gagal terhubung ke server. Periksa koneksi Anda.'
    toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 5000 })
  } finally {
    loading.value = false
  }
}

const data_laporan = ref(null)

const getdata_laporan = async () => {
  try {
    loading.value = true
    const param = { kodeboking: route.query.kodebooking, id_client: id_client.value, mode: 1 }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/get_laporan_operasi`, param)

    if (response.data.metadata?.code == '200') {
      data_laporan.value = response.data?.response
      const d = data_laporan.value
      form.value.pa = d?.pa || 'Tidak'
      form.value.jaringan = d?.jaringan || ''
      form.value.perdarahan = d?.perdarahan || 0
      form.value.anestesi = d?.anestesi || ''
      form.value.diagnosaPra = d?.diagnosaPra || ''
      form.value.diagnosaPasca = d?.diagnosaPasca || ''
      form.value.komplikasi = d?.komplikasi || ''
      form.value.uraian = d?.uraian || ''
      form.value.instruksi = d?.instruksi || ''
      form.value.keterangan_gambar = d?.keterangan_gambar || ''
      form.value.durasi = d?.durasi || ''
      form.value.tanggal_jam_mulai = d?.tanggal_jam_mulai
      form.value.tanggal_jam_selesai = d?.tanggal_jam_selesai

      existingImages.value = []
      uploadedImages.value = []
      if (response.data?.lampiran) {
        existingImages.value = response.data.lampiran.map((item) => ({
          name: item.filename,
          preview: item.filename,
          id: item.id,
          isExisting: true,
        }))
      }
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

const resetForm = () => {
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
  existingImages.value = []
  uploadedImages.value = []
  if (fileInputRef.value) fileInputRef.value.value = ''
}

onMounted(() => {
  getdata_laporan()
})
</script>

<style scoped>
/* ====== Banner ====== */
.laporan-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--p-primary-color);
  border-radius: var(--p-border-radius);
  padding: 1rem 1.5rem;
  color: var(--p-primary-contrast-color);
}
.banner-icon {
  flex-shrink: 0;
  font-size: 2rem;
  opacity: 0.9;
}
.banner-title {
  margin: 0 0 0.2rem;
  font-size: 1.05rem;
  font-weight: 700;
}
.banner-desc {
  margin: 0;
  font-size: 0.78rem;
  opacity: 0.85;
  line-height: 1.4;
}
.banner-meta {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--p-border-radius);
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  white-space: nowrap;
}

/* ====== Cards ====== */
.laporan-card {
  border-radius: var(--p-border-radius);
  overflow: hidden;
  box-shadow: var(--p-card-shadow);
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
}
.laporan-card-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.1rem;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--p-primary-contrast-color);
  letter-spacing: 0.04em;
}
.laporan-card-header small {
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.88;
}
.laporan-card-header .badge-count {
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--p-border-radius);
  padding: 0.15rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
}
.info-header,
.waktu-header,
.uraian-header,
.instruksi-header,
.gambar-header {
  background: var(--p-primary-color);
}
.laporan-card-body {
  padding: 1rem 1.1rem;
}

/* ====== Fields ====== */
.field-group {
  margin-bottom: 0.9rem;
}
.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin-bottom: 0.3rem;
}
.required {
  color: var(--p-red-600);
}
.radio-group {
  display: flex;
  align-items: center;
  gap: 0.3rem 0.6rem;
  flex-wrap: wrap;
}
.radio-label {
  font-size: 0.82rem;
  color: var(--p-text-color);
  cursor: pointer;
}

/* ====== Section Divider ====== */
.section-divider {
  display: flex;
  align-items: center;
  margin: 0.6rem 0;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--p-content-border-color);
}

/* ====== Durasi Display ====== */
.durasi-display {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.85rem;
  background: var(--p-yellow-50);
  border: 1px solid var(--p-yellow-200);
  border-radius: 8px;
  gap: 0.4rem;
}
.durasi-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--p-yellow-800);
}
.durasi-unit {
  font-size: 0.78rem;
  color: var(--p-yellow-800);
  opacity: 0.75;
}

/* ====== Upload Zone ====== */
.upload-zone {
  border: 2px dashed var(--p-content-border-color);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
  margin-bottom: 0.5rem;
}
.upload-zone:hover {
  border-color: var(--p-primary-color);
}
.file-input {
  display: none;
}
.upload-zone-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.upload-zone-label:hover {
  background: var(--p-primary-50);
}
.upload-zone-label .pi {
  font-size: 1.8rem;
  color: var(--p-primary-color);
  opacity: 0.7;
}
.upload-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--p-text-color);
}
.upload-hint {
  font-size: 0.72rem;
  color: var(--p-text-muted-color);
}
.upload-count-badge {
  padding: 0.3rem 0.75rem;
  background: var(--p-primary-50);
  border: 1px solid var(--p-primary-200);
  border-radius: 6px;
  font-size: 0.78rem;
  color: var(--p-primary-color);
  font-weight: 600;
}

/* ====== Image Gallery ====== */
.gallery-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  background: var(--p-surface-50);
  border: 2px dashed var(--p-content-border-color);
  border-radius: 10px;
  color: var(--p-text-muted-color);
  font-size: 0.82rem;
}
.gallery-empty .pi {
  font-size: 2rem;
}
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.6rem;
}
.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--p-content-border-color);
  background: var(--p-surface-50);
}
.gallery-img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}
.gallery-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  background: color-mix(in srgb, var(--p-red-600) 90%, transparent);
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.65rem;
  transition: background 0.15s;
}
.gallery-remove:hover {
  background: var(--p-red-600);
}
.gallery-info {
  padding: 0.3rem 0.4rem;
  background: var(--p-content-background);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
}
.gallery-name {
  font-size: 0.65rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.badge-existing {
  background: var(--p-green-600);
  color: #fff;
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 0.62rem;
  font-weight: 600;
  flex-shrink: 0;
}
.badge-new {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 0.62rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* ====== Action Bar ====== */
.laporan-action-bar {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: 10px;
  padding: 0.8rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.action-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.action-info {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}
.action-buttons {
  display: flex;
  align-items: center;
}

/* ====== PrimeVue overrides ====== */
:deep(.p-inputtext),
:deep(.p-textarea),
:deep(.p-inputnumber-input) {
  font-size: 0.83rem;
}
:deep(.p-datepicker) {
  width: 100%;
  font-size: 0.83rem;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .action-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .image-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
