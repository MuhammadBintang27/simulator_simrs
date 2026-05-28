<template>
  <loading_overlay :is-loading="loading" message="Memuat data..." />

  <!-- Page Title -->
  <div class="page-header">
    <h2 class="page-title">
      <i class="fas fa-syringe"></i>
      Imunisasi
    </h2>
  </div>

  <!-- Patient Information Card -->
  <div class="card elevation-0">
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
  </div>

  <!-- Immunization Form Card -->
  <section class="card elevation-0">
    <div class="card-header">
      <h4><i class="fas fa-syringe"></i> Entri Imunisasi</h4>
    </div>
    <div class="card-body">
      <div class="immunization-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h5 class="section-title">Informasi Dasar</h5>
          <div class="form-grid">
            <div class="form-field">
              <label>Jenis Imunisasi <span class="required">*</span></label>

              <Select
                v-model="formData.jenisImunisasi"
                optionLabel="nama"
                :options="OPTIONS.jenisImunisasi"
                filter
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

              <Select
                v-model="formData.namaVaksin"
                :options="list_data_vaksin"
                option-label="kfa_display"
                placeholder="Masukkan nama vaksin"
                class="w-100"
              />
            </div>

            <div class="form-field">
              <label>No Batch</label>
              <InputText v-model="formData.noBatch" placeholder="Masukkan no batch" class="w-100" />
            </div>

            <div class="form-field">
              <label>Tanggal Expired</label>

              <InputMask
                id="basic"
                v-model="formData.tglExpired"
                placeholder="99/99/9999"
                mask="99/99/9999"
                slotChar="dd/mm/yyyy"
              />

              <!-- <DatePicker
                  v-model="formData.tglExpired"
                  dateFormat="yy-mm-dd"
                  showIcon
                  placeholder="Pilih tanggal expired"
                  class="w-100"
                /> -->
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
          <Button
            label="Simpan"
            icon="pi pi-save"
            :loading="saving"
            @click="handleSubmit"
            type="submit"
          />
        </div>
      </div>
    </div>
  </section>

  <section class="card elevation-0">
    <DataTable
      :value="riwayat_imunisasi"
      stripedRows
      paginator
      :rows="5"
      tableStyle="min-width: 50rem"
      responsiveLayout="stack"
      breakpoint="960px"
    >
      <template #header>
        <div class="card-header">
          <h4><i class="fas fa-hospital"></i> Riwayat imunisasi</h4>
        </div>
      </template>

      <Column column field="noregister" header="No. Register" sortable />
      <Column field="nama" header="Nama Pasien" sortable />
      <Column field="jenis_imunisasi" header="Jenis Imunisasi">
        <template #body="slotProps">
          <span>{{ slotProps.data.jenis_imunisasi }}</span
          ><br />
          <small class="text-muted"> {{ slotProps.data.kfa_display }}</small>
        </template>
      </Column>

      <Column header="Jadwal & Dosis">
        <template #body="slotProps">
          <div class="flex flex-column">
            <span class="font-bold">{{ slotProps.data.tanggal }}</span>
            <small>Dosis Ke-{{ slotProps.data.dosis_ke }} ({{ slotProps.data.rute }})</small>
          </div>
        </template>
      </Column>

      <Column field="lokasi_suntik" header="Lokasi" />

      <Column header="Vaksin & Batch">
        <template #body="slotProps">
          <span>{{ slotProps.data.nama_vaksin }}</span
          ><br />
          <small class="text-muted">Batch: {{ slotProps.data.no_batch }}</small>
        </template>
      </Column>

      <Column header="Petugas">
        <template #body="slotProps">
          <span>{{ slotProps.data.petugas }}</span
          ><br />
          <Tag :value="slotProps.data.profesi" severity="secondary" />
        </template>
      </Column>

      <Column header="KIPI">
        <template #body="slotProps">
          <Tag
            :value="getKipiLabel(slotProps.data.kipi)"
            :severity="getKipiSeverity(slotProps.data.kipi)"
          />
        </template>
      </Column>

      <Column header="Aksi" style="min-width: 5rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-text"
              v-tooltip="'Hapus Data'"
              @click="confirmDelete($event, slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <template #footer>
        Total data: {{ riwayat_imunisasi ? riwayat_imunisasi.length : 0 }} pasien.
      </template>
    </DataTable>
  </section>

  <ConfirmPopup></ConfirmPopup>
  <Toast />
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'

import Column from 'primevue/column'

import InputMask from 'primevue/inputmask'

// Stores & Router
const configStore = useConfigStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
import { useConfirm } from 'primevue/useconfirm' // Untuk konfirmasi
const { id_client, user_id } = storeToRefs(authStore)

import ConfirmPopup from 'primevue/confirmpopup'

const confirm = useConfirm()

// State
const loading = ref(false)
const saving = ref(false)

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
    { code: 'BCG', nama: 'BCG' },
    { code: 'HepB', nama: 'Hepatitis B' },
    { code: 'POLIO', nama: 'Polio' },
    { code: 'DPT-HB-Hib', nama: 'DPT-HB-Hib' },
    { code: 'CAM', nama: 'Campak' },
    { code: 'MR', nama: 'MR' },
    { code: 'PCV', nama: 'PCV' },
    { code: 'ROT', nama: 'Rotavirus' },
    { code: 'INF', nama: 'Influenza' },
    { code: 'COVID19', nama: 'COVID-19' },
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

// Fungsi Konfirmasi
const confirmDelete = (event, data) => {
  confirm.require({
    target: event.currentTarget,
    message: `Hapus data ${data.nama}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Batal',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Hapus',
      severity: 'danger',
    },
    accept: () => {
      deleteRow(data)
    },
  })
}

const deleteRow = async (data) => {
  try {
    // Ganti dengan endpoint API yang sesuai
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/deleted_data_imunisasi`,
      {
        id_client: id_client.value,
        user_id: user_id.value,
        id_imunisasi: data.id_imunisasi,
        id: data.id,
      },
    )

    if (response.data?.code == 200) {
      showToast('success', 'Berhasil', 'Data imunisasi berhasil dihapus')
      get_data_imunisasi() // Refresh data setelah hapus
    } else {
      throw new Error(response.data?.message || 'Gagal menghapus data')
    }
  } catch (error) {
    console.error('Error deleting immunization:', error)
    showToast('error', 'Error', error.message || 'Gagal menghapus data imunisasi')
  }
}

//dd watcher untuk formData.jenisImunisasi agar bisa mengambil data vaksin berdasarkan cvx_code
watch(
  () => formData.jenisImunisasi,
  (newValue) => {
    get_data_vaksin(newValue)
  },
)

const load_data_vaksin = ref(false)

const list_data_vaksin = ref([])
const get_data_vaksin = async (cvx_code) => {
  try {
    // Ganti dengan endpoint API yang sesuai

    const param = {
      cvx_code: cvx_code['code'] || '', // Pastikan mengirim kode CVX yang benar
    }
    list_data_vaksin.value = [] // Clear list sebelum mengambil data baru
    load_data_vaksin.value = true
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_data_vaksin`,
      param,
    )

    if (response.data?.code == 200) {
      list_data_vaksin.value = response.data?.data || []
      showToast('success', 'Berhasil', 'Data vaksin berhasil diambil')
    } else {
      throw new Error(response.data?.message || 'Gagal mengambil data vaksin')
    }

    load_data_vaksin.value = false
  } catch (error) {
    console.error('Error fetching vaccine data:', error)
    showToast('error', 'Error', error.message || 'Gagal mengambil data vaksin')
  }
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatDate_expired = (date) => {
  if (!date) return null

  const [day, month, year] = date.split('/')

  if (!day || !month || !year) return null

  const d = new Date(year, month - 1, day)

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
      nomr: patientData.value?.NOMR,
      jenis_imunisasi: formData.jenisImunisasi,
      tanggal: formatDate(formData.tanggal),
      jam: formatDateTime(formData.jam),
      dosis_ke: formData.dosisKe,
      rute: formData.rute,
      lokasi_suntik: formData.lokasiSuntik,
      nama_vaksin: formData.namaVaksin,
      no_batch: formData.noBatch,
      tgl_expired: formatDate_expired(formData.tglExpired),
      produsen: formData.produsen,
      petugas: formData.petugas,
      profesi: formData.profesi,
      kipi: formData.kipi ? 1 : 0,
      catatan: formData.catatan,
    }
    // Replace with your actual API endpoint

    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/insert_imunisasi`,
      payload,
    )

    if (response.data?.code == 200) {
      showToast('success', 'Berhasil', 'Data imunisasi berhasil disimpan')
      //router.back()
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

const riwayat_imunisasi = ref([])
const get_data_imunisasi = async () => {
  try {
    const payload = {
      id_client: id_client.value,
      user_id: user_id.value,
      noregister: route.params?.id,
      nomr: patientData.value?.NOMR,
    }
    // Replace with your actual API endpoint
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_data_imunisasi`,
      payload,
    )

    if (response.data?.code == 200) {
      riwayat_imunisasi.value = response.data.data
      //router.back()
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

// Fungsi pembantu untuk format KIPI
const getKipiSeverity = (value) => {
  return value === '0' ? 'success' : 'danger'
}

const getKipiLabel = (value) => {
  return value === '0' ? 'Tidak Ada' : 'Ada Gejala'
}

const handleCancel = () => {
  //router.back()
}

const patientData = ref({
  NOMR: '',
  NAMAPASIEN: '',
  NOKTP: '',
  POLI: '',
  NAMADOKTER: '',
  USIA_PASIEN: { tahun: 0, bulan: 0, hari: 0 },
})

// Lifecycle
onMounted(async () => {
  await fetchPatientData()
  await get_data_imunisasi()
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
