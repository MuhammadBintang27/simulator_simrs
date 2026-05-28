<template>
  <Panel>
    <template #header>
      <span class="form-header-title">PERMINTAAN RUANG OPERASI</span>
    </template>
    <div class="form-body">
      <!-- Row 1: No. Rekam Medis & Nama Pasien -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label required">No. Rekam Medis</label>
          <InputText
            v-model="form.no_rekam_medis"
            placeholder="663254"
            class="w-full"
            :disabled="true"
          />
        </div>
        <div class="form-field">
          <label class="form-label required">Nama Pasien</label>
          <InputText v-model="form.nama_pasien" class="w-50" :disabled="true" />
        </div>
      </div>

      <!-- Row 2: Jenis Kelamin & Tanggal Lahir -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label">Jenis Kelamin</label>
          <InputText v-model="form.jenis_kelamin" placeholder="L" class="w-full" :disabled="true" />
        </div>
        <div class="form-field">
          <label class="form-label">Tanggal Lahir :</label>
          <label for="">{{ form.tanggal_lahir }} ({{ form.usia }})</label>
        </div>
      </div>
      <Divider />
      <!-- Jenis Operasi / Tindakan -->
      <div class="form-field full-width">
        <label class="form-label required">Jenis Operasi / Tindakan</label>
        <Select
          v-model="form.jenis_operasi"
          :options="listRuangPoli"
          filter
          optionLabel="NAMA"
          class="w-50"
          placeholder="Pilih Jenis Operasi"
        />
      </div>

      <!-- Tanggal Operasi -->
      <div class="form-field half-width">
        <label class="form-label required">Tanggal Operasi</label>
        <DatePicker
          v-model="form.tanggal_operasi"
          dateFormat="dd/mm/yy"
          showIcon
          iconDisplay="input"
          class="w-50"
          placeholder="Pilih tanggal operasi"
        />
      </div>
      <!-- Dokter Operator -->
      <div class="form-field half-width">
        <label class="form-label required">Dokter Operator</label>
        <Select
          v-model="form.dokter_operator"
          :options="list_dokter"
          filter
          optionLabel="NAMADOKTER"
          placeholder="Pilih Dokter Operator"
          class="w-50"
        />
      </div>

      <!-- Diagnosis / Indikasi Operasi -->
      <div class="form-field full-width">
        <label class="form-label required">Diagnosis / Indikasi Operasi</label>
        <Textarea
          v-model="form.diagnosis"
          placeholder="Tuliskan diagnosis dan indikasi operasi..."
          rows="4"
          class="w-full"
          autoResize
        />
      </div>
      <!-- Catatan Tambahan -->
      <div class="form-field full-width">
        <label class="form-label">Catatan Tambahan</label>
        <Textarea
          v-model="form.catatan_tambahan"
          placeholder="Catatan khusus, persiapan, atau hal lain..."
          rows="4"
          class="w-full"
          autoResize
        />
      </div>
      <!-- Action Buttons -->
      <div class="form-actions">
        <Button
          label="Batal"
          severity="secondary"
          outlined
          icon="pi pi-times"
          @click="handleBatal"
          :disabled="loading"
        />
        <Button
          label="Refresh"
          icon="pi pi-refresh"
          :loading="loading_jadwal"
          class="p-button-sm p-button-outlined"
          @click="get_jadwal_operasi(2)"
        />
        <Button
          label="Simpan Permintaan"
          icon="pi pi-check"
          :loading="loading"
          @click="handleSubmit(1)"
        />
      </div>
    </div>

    <hr />
    <!-- ===== TABEL JADWAL OPERASI ===== -->
    <div class="card mt-3 elevation-0" elevation="0">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title mb-0">
          <i class="fas fa-calendar-alt mr-2"></i>Daftar Jadwal Operasi
        </h3>
      </div>
      <div class="card-body p-0">
        <DataTable
          :value="listJadwalOperasi"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 25]"
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
          responsiveLayout="scroll"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="Tidak ada data jadwal operasi."
        >
          <Column field="nomor" header="No." :style="{ width: '60px', textAlign: 'center' }">
            <template #body="slotProps">
              {{ slotProps.index + 1 }}
            </template>
          </Column>

          <Column field="nomorrm" header="No. RM" :sortable="true" />

          <Column field="nama" header="Nama Pasien" :sortable="true">
            <template #body="slotProps">
              <span class="text-capitalize">{{ slotProps.data.nama }}</span>
            </template>
          </Column>

          <Column field="jeniskelamin" header="JK" :style="{ width: '60px', textAlign: 'center' }">
            <template #body="slotProps">
              <span :class="slotProps.data.jeniskelamin === 'L' ? 'badge-jk-l' : 'badge-jk-p'">
                {{ slotProps.data.jeniskelamin === 'L' ? 'L' : 'P' }}
              </span>
            </template>
          </Column>

          <Column field="usia" header="Usia" />

          <Column field="namapoli" header="Poli / Unit" :sortable="true">
            <template #body="slotProps">
              <span class="badge badge-info badge-poli">{{ slotProps.data.namapoli }}</span>
            </template>
          </Column>

          <Column field="dokter" header="Dokter Operator" :sortable="true" />

          <Column field="tanggaloperasi" header="Tanggal & Jam Operasi" :sortable="true">
            <template #body="slotProps">
              <div>
                <i class="far fa-calendar mr-1 text-muted"></i>
                {{ formatDateTimeForAPI(slotProps.data.tanggaloperasi) }}
              </div>
              <small class="text-muted">
                <i class="far fa-clock mr-1"></i>{{ slotProps.data.jam }}
              </small>
            </template>
          </Column>

          <Column field="jenistindakan" header="Jenis Tindakan">
            <template #body="slotProps">
              <span v-if="slotProps.data.jenistindakan">{{ slotProps.data.jenistindakan }}</span>
              <span v-else class="text-muted font-italic">-</span>
            </template>
          </Column>

          <Column field="terlaksana" header="Status" :style="{ textAlign: 'center' }">
            <template #body="slotProps">
              <span :class="getStatusClass(slotProps.data.terlaksana)">
                <i :class="getStatusIcon(slotProps.data.terlaksana)"></i>
                {{ getStatusLabel(slotProps.data.terlaksana) }}
              </span>
            </template>
          </Column>

          <Column header="Aksi" :style="{ width: '100px', textAlign: 'center' }">
            <template #body="slotProps">
              <Button
                icon="pi pi-eye"
                class="p-button-sm p-button-rounded p-button-info p-button-text mr-1"
                v-tooltip.top="'Detail'"
                @click="lihatDetail(slotProps.data)"
              />
              <Button
                v-if="slotProps.data.terlaksana === '0'"
                icon="pi pi-trash"
                class="p-button-sm p-button-rounded p-button-danger p-button-text"
                v-tooltip.top="'Batalkan'"
                @click="konfirmasiBatal(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Dialog Detail -->
  </Panel>
  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'

import DatePicker from 'primevue/datepicker'
import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()

const configStore = useConfigStore()
const loading = ref(false)

// Props
const props = defineProps({
  datapasien: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object',
  },
})

// Form data
const form = ref({
  no_rekam_medis: props.datapasien.NOMR || '',
  nama_pasien: props.datapasien.NAMAPASIEN || '',
  jenis_kelamin: props.datapasien.JENISKELAMIN || '',
  tanggal_lahir: props.datapasien.TGLLAHIR || '',
  usia: props.datapasien.USIA_PASIEN.tahun
    ? `${props.datapasien.USIA_PASIEN.tahun} tahun ${props.datapasien.USIA_PASIEN.bulan} bulan ${props.datapasien.USIA_PASIEN.hari} hari`
    : '',
  jenis_operasi: null,
  tanggal_operasi: null,
  dokter_operator: null,
  diagnosis: '',
  catatan_tambahan: '',
})

const dokterOptions = ref([
  { label: 'dr.Nasrul Wahdi.Sp.Og', value: 'dr_nasrul' },
  { label: 'dr.Ahmad Fauzi.Sp.B', value: 'dr_ahmad' },
  { label: 'dr.Siti Rahayu.Sp.PD', value: 'dr_siti' },
])

// Toast helpers
const showSuccess = (message = 'Operasi berhasil') => {
  toast.add({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 })
}

const showError = (message = 'Terjadi kesalahan') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}

const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: message, life: 4000 })
}

const getStatusLabel = (terlaksana) => {
  if (terlaksana === '1' || terlaksana === 1) return 'Terlaksana'
  if (terlaksana === '2' || terlaksana === 2) return 'Dibatalkan'
  return 'Dijadwalkan'
}

const getStatusClass = (terlaksana) => {
  if (terlaksana === '1' || terlaksana === 1) return 'status-badge status-done'
  if (terlaksana === '2' || terlaksana === 2) return 'status-badge status-cancel'
  return 'status-badge status-scheduled'
}

const getStatusIcon = (terlaksana) => {
  if (terlaksana === '1' || terlaksana === 1) return 'pi pi-check-circle mr-1'
  if (terlaksana === '2' || terlaksana === 2) return 'pi pi-times-circle mr-1'
  return 'pi pi-clock mr-1'
}

// Date formatter
const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return null
  }
}

const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch {
    return null
  }
}

// Fetch patient data
const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/get_data`)
    const data = response.data.response
    if (data && data.length > 0) {
      const pasien = data[0]
      form.value.no_rekam_medis = pasien.no_rekam_medis || ''
      form.value.nama_pasien = pasien.nama_pasien || ''
      form.value.jenis_kelamin = pasien.jenis_kelamin || ''
      form.value.tanggal_lahir = pasien.tanggal_lahir || ''
    }
  } catch (error) {
    // console.error('Error fetching data:', error)
    // showError('Gagal memuat data pasien')
  } finally {
    loading.value = false
  }
}

const listRuangPoli = ref([])
const getdataPoliRuang = async (mode) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    loading.value = true

    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/${mode}/${id_client.value}`,
    )

    // Process the response data to add computed fields
    listRuangPoli.value = response.data || []

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const listJadwalOperasi = ref([])
const loading_jadwal = ref(false)
const get_jadwal_operasi = async () => {
  try {
    loading_jadwal.value = true
    const url = configStore.apiBaseUrl

    const param = {
      id_client: id_client.value,
      mode: '2',
      nopeserta: props.datapasien.NOJAMINAN || '',
    }

    const response = await axios.post(`${url}/index.php/api/mobil_jkn/getjadwaloperasi_v4/`, param)

    // console.log('Response Jadwal Operasi:', response.data.response)

    if (response.data.metadata.code == '200') {
      listJadwalOperasi.value = response.data.response || []
    } else {
      listJadwalOperasi.value = []
      // showWarning('Gagal memuat jadwal operasi: ' + response.data.metadata.message)
    }
    // Process the response data to add computed fields

    loading_jadwal.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const konfirmasiBatal = (data) => {
  confirm.require({
    message: `Apakah Anda yakin ingin membatalkan jadwal ini ini?`,
    header: 'Konfirmasi Pembatalan',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Tidak',
    acceptLabel: 'Ya, Batalkan',
    rejectProps: {
      label: 'Tidak',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Ya, Batalkan',
      severity: 'danger',
    },
    accept: () => {
      batal_jadwal_operasi(data)
    },
  })
}

const batal_jadwal_operasi = async (data) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    loading.value = true
    const param = {
      id_client: id_client.value,
      kodebooking: data.kodebooking,
      noregister: props.datapasien.NOPENDAFTARAN,
      nopeserta: props.datapasien.NOJAMINAN,
    }

    console.log('param data', param)

    const response = await axios.post(
      `${url}/index.php/api/mobil_jkn/deletedjadwaloperasi/${id_client.value}`,
      param,
    )

    console.log('Response Batal Jadwal Operasi:', response.data)

    if (response.data.metadata.code == '200') {
      showSuccess('Jadwal operasi berhasil dibatalkan')
      get_jadwal_operasi(2)
    } else {
      listJadwalOperasi.value = []
      showWarning('Gagal memuat jadwal operasi: ' + response.data.metadata.message)
    }
    // Process the response data to add computed fields

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Validate form
const validateForm = () => {
  if (!form.value.jenis_operasi) {
    showWarning('Jenis Operasi / Tindakan wajib diisi')
    return false
  }
  if (!form.value.tanggal_operasi) {
    showWarning('Tanggal Operasi wajib diisi')
    return false
  }
  if (!form.value.dokter_operator) {
    showWarning('Dokter Operator wajib diisi')
    return false
  }
  if (!form.value.diagnosis.trim()) {
    showWarning('Diagnosis / Indikasi Operasi wajib diisi')
    return false
  }
  return true
}

const list_dokter = ref([])
// API methods
const getdataDokter = async () => {
  try {
    loading.value = true
    const param = {
      id_client: id_client.value,
      mode: 2,
    }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/datadokterv3`, param)

    if (response.data && response.data.response) {
      list_dokter.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching doctors:', error)
    showError('Error fetching doctors: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Submit handler
const handleSubmit = async (save_mode) => {
  if (!validateForm()) return
  const mode = save_mode
  try {
    loading.value = true

    const payload = {
      mode: mode,
      no_rm: form.value.no_rekam_medis,
      nama_pasien: form.value.nama_pasien,
      jenis_operasi: form.value.jenis_operasi,
      nokartu: props.datapasien.NOJAMINAN || '',
      tgl_operasi: formatDateOnlyForAPI(form.value.tanggal_operasi),
      dokter_operator: form.value.dokter_operator,
      noregister: props.datapasien.NOPENDAFTARAN || '',
      diagnosis: form.value.diagnosis,
      catatan_tambahan: form.value.catatan_tambahan,
      user_id: user_id.value,
      id_client: id_client.value,
    }
    const url = configStore.apiBaseUrl

    const response = await axios.post(
      `${url}/index.php/api/mobil_jkn/insert_jadwal_operasi_v2`,
      payload,
    )

    console.log('Response Submit:', response.data)

    if (response.data.metadata.code == 200) {
      showSuccess('Permintaan operasi berhasil disimpan')
      handleReset()
    } else {
      showError('Gagal menyimpan permintaan operasi: ' + response.data.metadata.message)
    }
  } catch (error) {
    console.error('Error submitting:', error)
    showError('Gagal menyimpan permintaan operasi')
  } finally {
    loading.value = false
  }
}

// Reset form (keep patient info)
const handleReset = () => {
  form.value.jenis_operasi = null
  form.value.tanggal_operasi = null
  form.value.dokter_operator = null
  form.value.diagnosis = ''
  form.value.catatan_tambahan = ''
}

const handleBatal = () => {
  handleReset()
}

onMounted(() => {
  getdataPoliRuang(0)
  getdataDokter()
  // get_jadwal_operasi(2)
})
</script>

<style scoped>
.form-wrapper {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.form-header-icon {
  color: #3b82f6;
  font-size: 1rem;
}

.form-header-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full-width {
  width: 100%;
}

.form-field.half-width {
  width: 50%;
  padding-right: 10px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  margin-top: 4px;
}

:deep(.p-button) {
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.p-divider) {
  margin: 0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-field.half-width {
    width: 100%;
    padding-right: 0;
  }
}
</style>
<style scoped>
/* Patient Strip */

.patient-item .val-muted {
  font-size: 12px;
  color: #64748b;
  display: block;
  margin-top: 1px;
}

.badge-jk {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}
.badge-l {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-p {
  background: #fce7f3;
  color: #9d174d;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-full {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}
.field .req {
  color: #ef4444;
  margin-left: 2px;
}

:deep(.field .p-select),
:deep(.field .p-datepicker),
:deep(.field .p-textarea) {
  width: 100%;
  border-radius: 8px;
  border-color: #e2e8f0;
  font-size: 13px;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

/* Table */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.table-header h2 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.table-count {
  font-size: 12px;
  color: #94a3b8;
}

.patient-name {
  font-weight: 500;
  text-transform: capitalize;
}

.poli-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 99px;
  font-size: 11px;
  color: #475569;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
}
.status-scheduled {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-done {
  background: #dcfce7;
  color: #166534;
}
.status-cancel {
  background: #fee2e2;
  color: #991b1b;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}
.dot-blue {
  background: #1d4ed8;
}
.dot-green {
  background: #166534;
}
.dot-red {
  background: #991b1b;
}

@media (max-width: 640px) {
  .patient-strip {
    grid-template-columns: 1fr 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
