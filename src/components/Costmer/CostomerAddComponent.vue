<template>
  <loading_overlay :is-loading="loading" message="Memuat...." />
  <section class="content light-theme">
    <div class="form-container">
      <Message :severity="jenismessage" v-if="nama_penyewa">
        <span style="color: red"> {{ nama_penyewa }}</span></Message
      >
      <Panel class="form-panel">
        <div class="form-grid">
          <div class="form-group">
            <label for="nama" class="form-label">Nama Lengkap * </label>
            <InputText
              type="text"
              v-model="form.nama"
              class=""
              id="nama"
              placeholder="Enter full name"
            />
          </div>

          <div class="form-group">
            <label for="nik" class="form-label">NIK *</label>
            <div style="display: flex; align-items: center; gap: 10px">
              <InputText v-model="form.nik" class="" id="nik" placeholder="Enter NIK" />
              <Button
                icon="pi pi-check"
                severity="info"
                class="round-button2"
                @click="call_name_bynik()"
                size="small"
                :loading="buttonLoading"
                text
                v-tooltip="'cehck'"
              />
            </div>
          </div>

          <div class="form-group full-width">
            <label for="alamat" class="form-label">Alamat</label>
            <InputText v-model="form.alamat" class="" id="alamat" placeholder="Enter address" />
          </div>

          <div class="form-group">
            <label for="pekerjaan" class="form-label">Apa pekerjaan Anda?</label>
            <InputText
              v-model="form.pekerjaan"
              class=""
              id="pekerjaan"
              placeholder="Enter occupation"
            />
          </div>

          <div class="form-group">
            <label for="tempat_lahir" class="form-label">Tempat Lahir</label>
            <InputText
              v-model="form.tempat_lahir"
              class=""
              id="tempat_lahir"
              placeholder="Enter place of birth"
            />
          </div>

          <div class="form-group">
            <label for="tanggal_lahir" class="form-label">Tanggal Lahir</label>
            <date-picker
              v-model:value="form.tanggal_lahir"
              format="DD/MM/YYYY"
              type="date"
              placeholder="Select date"
              class=""
            />
          </div>

          <div class="form-group">
            <label for="no_hp" class="form-label">No HP</label>
            <InputText v-model="form.no_hp" class="" id="no_hp" placeholder="Enter phone number" />
          </div>

          <div class="form-group">
            <label for="jenis_kelamin" class="form-label">Jenis Kelamin</label>
            <Select
              v-model="form.jenisKelaminSelected"
              :options="['PRIA', 'WANITA']"
              id="jenis_kelamin"
              class=""
              placeholder="Select gender"
            />
          </div>

          <div class="form-group">
            <label for="jenis_customer" class="form-label">Tipe </label>
            <Select
              v-model="form.jenisCustomerSelected"
              :options="['INDIVIDU', 'PERUSAHAAN', 'MITRA', 'PEMERINTAHAN', 'KARYAWAN']"
              id="jenis_customer"
              class=""
              placeholder="Select customer type"
            />
          </div>
        </div>

        <Message severity="info" class="info-message">
          <i class="pi pi-info-circle"></i>
          Attachments can be in the form of ID Card, Driver's License, Passport or other
          identification
        </Message>

        <div class="dialog-footer">
          <Button
            label="Save Customer"
            icon="pi pi-save"
            severity="success"
            @click="SimpanData"
            class="round-button2"
          />
        </div>
      </Panel>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'

import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import axios from 'axios'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const props = defineProps({
  data: Object,
  mode: Number,
})

// Reactive state
const loading = ref(false)

const visbleForm = ref(false)
const searchTerm = ref('')
const fact = ref([])

// Form initialization
const form = ref({
  nama: null,
  nik: '',
  alamat: null,
  no_hp: null,
  diskon: null,
  jenisKelaminSelected: null,
  jenisCustomerSelected: null,
  pekerjaan: '',
  mode: 0,
  tempat_lahir: null,
  tanggal_lahir: null,
  id_client: id_client.value,
})

// Functions
const resetForm = () => {
  form.value = {
    nama: null,
    nik: '',
    alamat: null,
    no_hp: null,
    diskon: null,
    jenisKelaminSelected: null,
    jenisCustomerSelected: null,
    pekerjaan: '',
    mode: 0,
    tempat_lahir: null,
    tanggal_lahir: new Date(),
    id_client: id_client.value,
  }
}

const closeForm = () => {
  visbleForm.value = false
  resetForm()
}

const showToast = (type, summary, detail = '') => {
  toast.add({
    severity: type,
    summary,
    detail,
    life: 3000,
  })
}

const result = ref(null)

const buttonLoading = ref(false)

const nama_penyewa = ref('')

const mode_load = ref(1)

const jenismessage = ref('success')

const call_name_bynik = async () => {
  try {
    const url = configStore.getSimrsApi
    form.value.id_client = id_client.value

    if (form.value.nik == '') {
      jenismessage.value = 'error'
      nama_penyewa.value = 'data tidak ditemukan'
      return
    }
    buttonLoading.value = true

    const response = await axios.post(
      `${url}/index.php/api/satusehat/get_nama_by_id/11/${form.value.nik}`,
    )

    if (response.data.code == 200) {
      jenismessage.value = 'success'
      result.value = response.data
      nama_penyewa.value = result.value.nama
      buttonLoading.value = false
    } else {
      jenismessage.value = 'error'
      nama_penyewa.value = 'Data tidak ditemukan secara online'
      buttonLoading.value = false
    }

    load_data_costomer(form.value.nik)
  } catch (error) {
    console.error('API Error:', error)
  }
}

const load_data_costomer = async (nik) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const param = {
      nik: nik,
      id_client: id_client.value,
      mode: 2,
    }

    const response = await axios.post(`${url}/getCusomer`, param)
    fact.value = response.data.response || []

    fact.value = fact.value[0]

    // form.value.id = fact.value.data.id
    form.value.nama = fact.value.nama
    form.value.nik = fact.value.nik
    form.value.alamat = fact.value.alamat
    form.value.pekerjaan = fact.value.pekerjaan
    form.value.tanggal_lahir = new Date(fact.value.tanggal_lahir)
    form.value.tempat_lahir = fact.value.tempat_lahir
    form.value.no_hp = fact.value.no_hp
    form.value.jenisKelaminSelected = fact.value.jenis_kelamin
    form.value.jenisCustomerSelected = fact.value.jenis_customer
  } catch (error) {
    console.error('Error fetching data:', error)
    showToast('error', 'Data retrieval failed', error.message)
  } finally {
    loading.value = false
  }
}
// API calls
const fetchData = async (mode) => {
  if (loading.value) return
  try {
    if (mode == 1) {
      form.value.id = props.data.id
      form.value.nama = props.data.nama
      form.value.nik = props.data.nik
      form.value.alamat = props.data.alamat
      form.value.pekerjaan = props.data.pekerjaan
      form.value.tanggal_lahir = new Date(props.data.tanggal_lahir)
      form.value.tempat_lahir = props.data.tempat_lahir
      form.value.no_hp = props.data.no_hp
      form.value.jenisKelaminSelected = props.data.jenis_kelamin
      form.value.jenisCustomerSelected = props.data.jenis_customer
    } else {
      resetForm()
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showToast('error', 'Data retrieval failed', error.message)
  } finally {
    loading.value = false
  }
}

const SimpanData = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    form.value.id_client = id_client.value
    form.value.mode = props.mode
    console.log('data inputan', form.value)
    const response = await axios.post(`${url}/insertCustomer`, form.value)

    if (response.data.code === 200) {
      visbleForm.value = false
      resetForm()
      showToast('success', 'Customer successfully added')
    } else {
      showToast('warn', 'Failed', response.data.message)
    }
  } catch (error) {
    console.error('Process failed:', error)
    showToast('error', 'Failed', error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Light Theme Base */
.light-theme {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 80vh;
  padding: 20px;
}

/* Summary Cards */
.summary-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 5px;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-radius: 5px;
  padding: 24px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
}

.summary-card.total-customers::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.summary-card.active-customers::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.summary-card.customer-types::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.summary-card.avg-discount::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.total-customers .card-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.active-customers .card-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.customer-types .card-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.avg-discount .card-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.card-content h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.card-content p {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
  font-weight: 500;
}

/* Main Panel */
.main-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 4px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 250px;
}

.search-input {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.title-text {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Action Buttons */
.action-button {
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
}

.action-button.primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-button.primary:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.action-button.secondary {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
}

.action-button.secondary:hover {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  color: #64748b;
  font-size: 16px;
  margin: 16px 0 24px;
}

/* Table Styles */
.customer-table {
  background: white;
  border-radius: 5px;
  overflow: hidden;
}

.id-badge {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
}

.customer-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.customer-icon {
  color: #3b82f6;
}

.phone-number {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
}

.gender-badge {
  padding: 4px 12px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.gender-badge.pria {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
}

.gender-badge.wanita {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #be185d;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* Dialog Styles */
.customer-dialog {
  border-radius: 5px;
  overflow: hidden;
}

.dialog-header h3 {
  margin: 0;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-container {
  padding: 0;
}

.form-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: none;
  box-shadow: none;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-select {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.info-message {
  margin-top: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: 1px solid #93c5fd;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .summary-cards-container {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
