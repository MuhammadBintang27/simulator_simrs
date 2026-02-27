<template>
  <div class="immunization-entry">
    <loading_overlay :is-loading="loading" message="Memuat data..." />

    <!-- Page Title -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="fas fa-syringe"></i>
        Imunisasi
      </h2>
    </div>
    <!-- Patient Information Card -->
    <section class="card elevation-0">
      <div class="card-header">
        <h4><i class="fas fa-user-circle"></i> Informasi Pasien</h4>
      </div>
      <div class="card-body">
        <div class="patient-grid">
          <div class="info-item">
            <span class="label">No RM</span>
            <strong>{{ patientData.NOMR }}</strong>
          </div>
          <div class="info-item">
            <span class="label">Nama</span>
            <strong>{{ patientData.NAMAPASIEN }}</strong>
          </div>
          <div class="info-item">
            <span class="label">NIK</span>
            <strong>{{ patientData.NOKTP }}</strong>
          </div>
          <div class="info-item">
            <span class="label">Usia</span>
            <strong>{{ formatAge(patientData.USIA_PASIEN) }}</strong>
          </div>
          <div class="info-item">
            <span class="label">Poli</span>
            <strong>{{ patientData.POLI }}</strong>
          </div>
          <div class="info-item">
            <span class="label">Dokter</span>
            <strong>{{ patientData.NAMADOKTER }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Immunization Form Card -->
    <section class="card elevation-0">
      <div class="card-header">
        <h4><i class="fas fa-syringe"></i> Entri Imunisasi</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="immunization-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h5 class="section-title">Informasi Dasar</h5>
            <div class="form-grid">
              <div class="form-field">
                <label>Jenis Imunisasi <span class="required">*</span></label>
                <Select
                  v-model="formData.jenisImunisasi"
                  :options="OPTIONS.jenisImunisasi"
                  placeholder="Pilih jenis imunisasi"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Tanggal <span class="required">*</span></label>
                <DatePicker
                  v-model="formData.tanggal"
                  dateFormat="yy-mm-dd"
                  showIcon
                  placeholder="Pilih tanggal"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Jam <span class="required">*</span></label>
                <DatePicker
                  v-model="formData.jam"
                  timeOnly
                  hourFormat="24"
                  placeholder="Pilih jam"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Dosis Ke <span class="required">*</span></label>
                <Select
                  v-model="formData.dosisKe"
                  :options="OPTIONS.dosis"
                  placeholder="Pilih dosis"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Rute <span class="required">*</span></label>
                <Select
                  v-model="formData.rute"
                  :options="OPTIONS.rute"
                  placeholder="Pilih rute"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Lokasi Suntik <span class="required">*</span></label>
                <Select
                  v-model="formData.lokasiSuntik"
                  :options="OPTIONS.lokasiSuntik"
                  placeholder="Pilih lokasi"
                  class="w-100"
                />
              </div>
            </div>
          </div>

          <!-- Vaccine Information -->
          <div class="form-section">
            <h5 class="section-title">Informasi Vaksin</h5>
            <div class="form-grid">
              <div class="form-field">
                <label>Nama Vaksin <span class="required">*</span></label>
                <InputText
                  v-model="formData.namaVaksin"
                  placeholder="Masukkan nama vaksin"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>No Batch</label>
                <InputText
                  v-model="formData.noBatch"
                  placeholder="Masukkan no batch"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Tanggal Expired</label>
                <DatePicker
                  v-model="formData.tglExpired"
                  dateFormat="yy-mm-dd"
                  showIcon
                  placeholder="Pilih tanggal expired"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Produsen</label>
                <InputText
                  v-model="formData.produsen"
                  placeholder="Masukkan produsen"
                  class="w-100"
                />
              </div>
            </div>
          </div>

          <!-- Officer Information -->
          <div class="form-section">
            <h5 class="section-title">Informasi Petugas</h5>
            <div class="form-grid">
              <div class="form-field">
                <label>Nama Petugas <span class="required">*</span></label>
                <InputText
                  v-model="formData.petugas"
                  placeholder="Masukkan nama petugas"
                  class="w-100"
                />
              </div>

              <div class="form-field">
                <label>Profesi <span class="required">*</span></label>
                <Select
                  v-model="formData.profesi"
                  :options="OPTIONS.profesi"
                  placeholder="Pilih profesi"
                  class="w-100"
                />
              </div>

              <div class="form-field kipi-field">
                <label>Status KIPI</label>
                <div class="kipi-toggle">
                  <Checkbox v-model="formData.kipi" binary inputId="kipi" />
                  <label for="kipi" class="ms-2">
                    <span class="badge" :class="formData.kipi ? 'bg-danger' : 'bg-success'">
                      {{ formData.kipi ? 'Ada KIPI' : 'Normal' }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-section">
            <div class="form-field full-width">
              <label>Catatan</label>
              <Textarea
                v-model="formData.catatan"
                rows="3"
                placeholder="Tambahkan catatan jika diperlukan"
                class="w-100"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <Button
              label="Batal"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="handleCancel"
              type="button"
            />
            <Button label="Simpan" icon="pi pi-save" :loading="saving" type="submit" />
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'

// Stores & Router
const configStore = useConfigStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const { id_client, user_id } = storeToRefs(authStore)

// State
const loading = ref(false)
const saving = ref(false)

const patientData = ref({
  NOMR: '',
  NAMAPASIEN: '',
  NOKTP: '',
  POLI: '',
  NAMADOKTER: '',
  USIA_PASIEN: { tahun: 0, bulan: 0, hari: 0 },
})

const formData = reactive({
  jenisImunisasi: null,
  tanggal: new Date(),
  jam: new Date(),
  dosisKe: null,
  rute: null,
  lokasiSuntik: null,
  namaVaksin: '',
  noBatch: '',
  tglExpired: null,
  produsen: '',
  petugas: '',
  profesi: null,
  kipi: false,
  catatan: '',
})

// Options
const OPTIONS = {
  jenisImunisasi: [
    'BCG',
    'Hepatitis B',
    'Polio',
    'DPT-HB-Hib',
    'Campak',
    'MR',
    'PCV',
    'Rotavirus',
    'Influenza',
    'COVID-19',
  ],
  dosis: [1, 2, 3, 'Booster'],
  rute: ['IM', 'SC', 'ORAL'],
  lokasiSuntik: ['Lengan Kanan', 'Lengan Kiri', 'Paha Kanan', 'Paha Kiri'],
  profesi: ['Dokter', 'Perawat', 'Bidan'],
}

// Methods
const formatAge = (usia) => {
  if (!usia) return '-'
  return `${usia.tahun} th ${usia.bulan} bl ${usia.hari} hr`
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatDateTime = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null

  const dateStr = formatDate(d)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

  return `${dateStr} ${time}`
}

const showToast = (severity, summary, detail) => {
  toast.add({ severity, summary, detail, life: 3000 })
}

const validateForm = () => {
  const required = [
    'jenisImunisasi',
    'tanggal',
    'jam',
    'dosisKe',
    'rute',
    'lokasiSuntik',
    'namaVaksin',
    'petugas',
    'profesi',
  ]

  for (const field of required) {
    if (!formData[field]) {
      showToast('warn', 'Peringatan', 'Mohon lengkapi semua field yang wajib diisi')
      return false
    }
  }

  return true
}

const fetchPatientData = async () => {
  try {
    loading.value = true

    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`,
      {
        mod: 1,
        id_client: id_client.value,
        noregister: route.params?.id,
      },
    )

    if (response.data?.response?.length > 0) {
      patientData.value = response.data.response[0]
    } else {
      showToast('warn', 'Peringatan', 'Data pasien tidak ditemukan')
    }
  } catch (error) {
    console.error('Error fetching patient data:', error)
    showToast('error', 'Error', 'Gagal memuat data pasien')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    saving.value = true

    const payload = {
      id_client: id_client.value,
      user_id: user_id.value,
      noregister: route.params?.id,
      jenis_imunisasi: formData.jenisImunisasi,
      tanggal: formatDate(formData.tanggal),
      jam: formatDateTime(formData.jam),
      dosis_ke: formData.dosisKe,
      rute: formData.rute,
      lokasi_suntik: formData.lokasiSuntik,
      nama_vaksin: formData.namaVaksin,
      no_batch: formData.noBatch,
      tgl_expired: formatDate(formData.tglExpired),
      produsen: formData.produsen,
      petugas: formData.petugas,
      profesi: formData.profesi,
      kipi: formData.kipi ? 1 : 0,
      catatan: formData.catatan,
    }

    // Replace with your actual API endpoint
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/imunisasi/save`,
      payload,
    )

    if (response.data?.success) {
      showToast('success', 'Berhasil', 'Data imunisasi berhasil disimpan')
      router.back()
    } else {
      throw new Error(response.data?.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error('Error saving immunization:', error)
    showToast('error', 'Error', error.message || 'Gagal menyimpan data imunisasi')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.back()
}

// Lifecycle
onMounted(() => {
  fetchPatientData()
})
</script>

<style scoped>
.immunization-entry {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body {
  padding: 1.5rem;
}

.patient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.info-item strong {
  color: #111827;
}

.immunization-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.kipi-field {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.kipi-toggle {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.bg-success {
  background-color: #10b981;
  color: white;
}

.bg-danger {
  background-color: #ef4444;
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .immunization-entry {
    padding: 0.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
