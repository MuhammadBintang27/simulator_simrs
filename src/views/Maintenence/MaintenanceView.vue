<template>
  <div class="content">
    <Panel severity="warn">
      <div>
        <div class="panel-content">
          <div class="icon-container">
            <i class="pi pi-building text-primary"></i>
          </div>
          <div class="text-container">
            <h2 class="panel-title">Ketersediaan Kendaraan</h2>
            <p class="panel-description">
              Jika terdapat rencana bahwa suatu kendaraan tidak akan tersedia — baik karena alasan
              perawatan (maintenance) maupun alasan lainnya (non-maintenance) seperti peminjaman
              khusus atau keperluan operasional — silakan input informasi tersebut melalui formulir
              ini untuk memastikan data ketersediaan selalu akurat
            </p>
          </div>
        </div>
      </div>
      <div class="mt-20">
        <div class="back-button mt-4" @click="goBack">
          <a href="javascript:window.history.back();">
            <i class="pi pi-arrow-left"></i>
            <span> Kembali</span></a
          >
        </div>
      </div>
    </Panel>
  </div>
  <div class="content">
    <!-- Header Section -->
    <div class="table-header">
      <h1 class="table-title"></h1>
      <div class="table-actions"></div>
    </div>

    <!-- Add Expense Dialog -->
    <Dialog
      v-model:visible="ShowForm"
      modal
      header="Keterangan Kendaraan Tidak Tersedia"
      :style="{ width: '40rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      class="expense-dialog"
    >
      <div class="p-grid">
        <div class="p-col-12 p-md-12 mt-3">
          <label for="unit">Pilih unit*</label>

          <Select
            id="unit"
            filter
            v-model="form.UnitSelected"
            :options="master_unit"
            optionLabel="desc"
            placeholder="Pilih unit kendaraan"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex items-center">
                <div>
                  <strong>{{ slotProps.option.desc }}</strong>
                </div>
                <small>
                  <Tag severity="warn" :value="slotProps.option.no_pol"></Tag>
                </small>
              </div>
            </template>
          </Select>
        </div>
        <div class="p-col-12 p-md-12 mt-3">
          <label for="tanggal">Tanggal Mulai Sampai dengan</label><br />
          <DatePicker
            id="tanggal_start"
            v-model="form.tanggal_start"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            class="modern-datepicker mr-2"
            showIcon
            iconDisplay="input"
          />

          <DatePicker
            id="tanggal_end"
            v-model="form.tanggal_end"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal akhir"
            class="modern-datepicker"
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="p-col-12 p-md-12 mt-3">
          <label for="alasan">Alasan</label><br />
          <Select
            id="alasan"
            v-model="form.alasanSelected"
            :options="jenis_ketidaktersediaan"
            placeholder="Pilih alasan ketidaktersediaan"
            optionLabel="caption"
            class="w-full"
          ></Select>
        </div>
        <div class="p-col-12 p-md-12 mt-3">
          <label for="deskripsi">Deskripsi *</label><br />
          <InputText
            id="deskripsi"
            v-model="form.deskripsi"
            placeholder="Deskripsi (opsional)"
            class="p-inputtext w-full"
          />
        </div>
      </div>

      <template #footer>
        <hr />
        <Button label="Tutup" icon="pi pi-times" @click="closeForm" class="p-button-text" />
        <Button
          label="Simpan"
          icon="pi pi-save"
          @click="simpanDataNonAvailable()"
          class="p-button round-button2"
          :disabled="loading"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- DataTable -->
    <DataTable
      :value="fact"
      :paginator="true"
      :rows="20"
      :rowsPerPageOptions="[10, 20, 50]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      :globalFilterFields="['desc', 'no_pol', 'alasan', 'deskripsi']"
      v-model:filters="filters"
      filterDisplay="menu"
      responsiveLayout="scroll"
      class="maintenance-datatable"
      stripedRows
      :emptyMessage="emptyMessage"
    >
      <template #header>
        <div class="table-controls">
          <span class="p-input-icon-left">
            <i class="pi pi-search mr-3" />
            <InputText v-model="filters['global'].value" placeholder="Cari data kendaraan..." />
          </span>
          <div class="status-filters mt-3">
            <DatePicker
              v-model="form.dateParameter"
              dateFormat="M yy"
              placeholder="Pilih tanggal mulai"
              @date-select="getdata"
              showIcon
              small
              iconDisplay="input"
              view="month"
            />

            <Button
              icon="pi pi-search"
              label="Cari Data"
              @click="getdata"
              class="search-button round-button2"
              size="small"
              :loading="loading"
            />
            <Button
              label="Clear Filters"
              icon="pi pi-filter-slash"
              class="p-button-outlined p-button-sm round-button2"
              @click="clearFilters"
            />
            <Button
              label="Add Service"
              @click="ShowForm = true"
              icon="pi pi-plus"
              severity="warn"
              class="p-button-sm round-button2"
            />
          </div>
        </div>
      </template>

      <!-- Vehicle Column -->
      <Column field="desc" header="Kendaraan" :sortable="true" style="min-width: 200px">
        <template #body="slotProps">
          <div class="vehicle-cell">
            <div class="vehicle-avatar">
              {{ slotProps.data.desc ? slotProps.data.desc.charAt(0) : 'N' }}
            </div>
            <div class="vehicle-info">
              <div class="vehicle-name">{{ slotProps.data.desc || 'N/A' }}</div>
              <div class="vehicle-plate">{{ slotProps.data.no_pol || 'N/A' }}</div>
            </div>
          </div>
        </template>
      </Column>

      <!-- License Plate Column -->
      <Column field="no_pol" header="No. Polisi" :sortable="true" style="min-width: 120px">
        <template #body="slotProps">
          <div class="service-info">
            <i class="pi pi-car service-icon"></i>
            <span>{{ slotProps.data.no_pol || 'N/A' }}</span>
          </div>
        </template>
      </Column>

      <!-- Date Range Column -->
      <Column header="Periode" :sortable="false" style="min-width: 200px">
        <template #body="slotProps">
          <div class="date-range">
            <div class="date-start">
              <i class="pi pi-calendar"></i>
              {{ formatDisplayDate(slotProps.data.tanggal_start_real) }}
            </div>
            <div class="date-separator">-</div>
            <div class="date-end">
              {{ formatDisplayDate(slotProps.data.tanggal_end_real) }}
            </div>
          </div>
        </template>
      </Column>

      <!-- Reason Column -->
      <Column field="alasan" header="Alasan" :sortable="true" style="min-width: 150px">
        <template #body="slotProps">
          <Tag
            :value="getReasonCaption(slotProps.data.mode)"
            :severity="getReasonSeverity(slotProps.data.mode)"
          />
        </template>
      </Column>

      <!-- Description Column -->
      <Column field="remark" header="Deskripsi" :sortable="true" style="min-width: 200px">
        <template #body="slotProps">
          <span>{{ slotProps.data.remark || '-' }}</span>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Aksi" style="min-width: 100px">
        <template #body="slotProps">
          <div class="action-buttons">
            <Button
              icon="pi pi-eye"
              class="p-button-rounded p-button-text action-btn"
              @click="viewDetails(slotProps.data)"
              v-tooltip.top="'Lihat Detail'"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-text action-btn"
              @click="editItem(slotProps.data)"
              v-tooltip.top="'Edit'"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-text action-btn p-button-danger"
              @click="confirmDeleteTransaction(slotProps.data)"
              v-tooltip.top="'Hapus'"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <ConfirmDialog />
  <Toast />
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'

import { useConfirm } from 'primevue/useconfirm'
import { useConfigStore } from '@/stores/config'
const configStore = useConfigStore()
const confirm = useConfirm()

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import axios from 'axios'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'

import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from '@primevue/core/api'

import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)

const ShowForm = ref(false)
const loading = ref(false)

const jenis_ketidaktersediaan = ref([
  {
    code: 'MTN',
    caption: 'Maintenance',
  },
  {
    code: 'NA',
    caption: 'Non Maintenance',
  },
])

const currentDate = new Date()

const form = reactive({
  deskripsi: null,
  tanggal_start: currentDate,
  tanggal_end: currentDate,
  alasanSelected: null,
  UnitSelected: null,
  dateParameter: currentDate,
})

// Filter configuration
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  no_pol: { value: null, matchMode: FilterMatchMode.CONTAINS },
  desc: { value: null, matchMode: FilterMatchMode.CONTAINS },
  alasan: { value: null, matchMode: FilterMatchMode.CONTAINS },
  deskripsi: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const master_unit = ref([])
const fact = ref([])

// Computed properties
const isFormValid = computed(() => {
  return form.UnitSelected && form.tanggal_start && form.tanggal_end && form.alasanSelected
})

const emptyMessage = computed(() => {
  return loading.value ? 'Memuat data...' : 'Tidak ada data ditemukan'
})

// Helper functions
const showToast = (type = 'success', summary = 'Success', detail = 'Data berhasil dimuat') => {
  toast.add({
    severity: type,
    summary,
    detail,
    life: 3000,
  })
}

const getMasterUnit = async () => {
  try {
    const url = configStore.apiBaseUrl
    const param = {
      id_client: id_client.value,
      mode: 1,
    }
    const response = await axios.post(`${url}/v1/get_master_unit`, param)
    master_unit.value = [...response.data.response]
  } catch (error) {
    console.error('Error fetching master unit:', error)
    showToast('error', 'Error', 'Terjadi kesalahan saat memuat data unit')
  }
}

const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    return dateString
  }
}

const getReasonCaption = (code) => {
  const reason = jenis_ketidaktersediaan.value.find((item) => item.code === code)
  return reason ? reason.caption : code
}

const getReasonSeverity = (code) => {
  switch (code) {
    case 'MTN':
      return 'warning'
    case 'NA':
      return 'info'
    default:
      return 'secondary'
  }
}

const resetForm = () => {
  form.deskripsi = null
  form.tanggal_start = null
  form.tanggal_end = null
  form.alasanSelected = null
  form.UnitSelected = null
}

const closeForm = () => {
  ShowForm.value = false
}

const deleteTransaction = async (transaction) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const params = {
      no_transaksi: transaction.no_transaksi,
      tanggalEnd: formatDate(form.tanggal_end),
      id_client: id_client.value,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/v1/batalkanTransaksi`, params)
    if (response.data.code == 200) {
      showToast('success', 'Success', response.data.message)
      getdata() // Refresh data after saving
    } else {
      showToast('error', 'Gagal', response.data.message)
    }
  } catch (error) {
    console.error('Error saving data:', error)
    showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data')
  } finally {
    loading.value = false
  }
}

const confirmDeleteTransaction = (transaction) => {
  confirm.require({
    message: `Apakah Anda yakin ingin menghapus data ${transaction.desc}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Batal',
      severity: 'secondary',
      class: 'round-button2',
      outlined: true,
    },
    acceptProps: {
      label: 'Hapus',
      class: 'round-button2',
      severity: 'danger',
    },
    accept: () => {
      deleteTransaction(transaction)
    },
    reject: () => {
      showToast('info', 'Dibatalkan', 'Penghapusan transaksi dibatalkan')
    },
  })
}

const simpanDataNonAvailable = async () => {
  if (!isFormValid.value) {
    showToast('warn', 'Peringatan', 'Mohon lengkapi semua field yang wajib diisi')
    return
  }

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    if (form.deskripsi === '') {
      showToast('warn', 'Peringatan', 'deskripsi wajib diisi')
      return
    }
    const params = {
      tanggalStart: formatDate(form.tanggal_start),
      tanggalEnd: formatDate(form.tanggal_end),
      alasan: form.alasanSelected,
      deskripsi: form.deskripsi,
      id_client: id_client.value,
      id_unit: form.UnitSelected,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/v1/simpanDatatidakTersedia`, params)
    if (response.data.code == 200) {
      showToast('success', 'Success', 'Data berhasil disimpan')

      closeForm()
      resetForm()
      getdata() // Refresh data after saving
    } else {
      showToast('error', 'Gagal', response.data.message)
    }
  } catch (error) {
    console.error('Error saving data:', error)
    showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data')
  } finally {
    loading.value = false
  }
}

const getdata = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const params = {
      tanggal_start: formatDate(form.dateParameter),
      tanggalEnd: formatDate(form.dateParameter),
      id_client: id_client.value,
      user_id: user_id.value,
      mode: 1,
    }

    console.log(JSON.stringify(params))

    const response = await axios.post(`${url}/v1/getdata_ketidak_tersediaan`, params)
    if (response.data.code == 200) {
      fact.value = response.data.response || []
      showToast('success', 'Success', `${fact.value.length} data berhasil dimuat`)
    } else {
      fact.value = []
      showToast('error', 'Gagal', response.data.message)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    fact.value = []
    showToast('error', 'Gagal', 'Terjadi kesalahan saat memuat data')
  } finally {
    loading.value = false
  }
}

// Event handlers
const clearFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    no_pol: { value: null, matchMode: FilterMatchMode.CONTAINS },
    desc: { value: null, matchMode: FilterMatchMode.CONTAINS },
    alasan: { value: null, matchMode: FilterMatchMode.CONTAINS },
    deskripsi: { value: null, matchMode: FilterMatchMode.CONTAINS },
  }
  // Clear search form

  // Reload data
  getdata()
}

const viewDetails = (item) => {
  console.log('View details:', item)
  // Implement view details logic
  showToast('info', 'Info', `Melihat detail untuk ${item.desc}`)
}

const editItem = (item) => {
  console.log('Edit item:', item)
  // Implement edit logic
  showToast('info', 'Info', `Edit data untuk ${item.desc}`)
}

onMounted(() => {
  getMasterUnit()
  getdata()
})
</script>

<style scoped>
.maintenance-table {
  background-color: #f8f9fa;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.table-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.maintenance-datatable {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.p-input-icon-left input {
  padding-left: 2.5rem;
  width: 300px;
}

/* Status Filters Container */
.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 5px;
}

.modern-datepicker {
  min-width: 160px;
  flex: 1;
  max-width: 200px;
}

.modern-datepicker .p-inputtext {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: #ffffff;
}

.modern-datepicker .p-inputtext:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.status-dropdown {
  min-width: 160px;
  flex: 1;
  max-width: 200px;
}

/* Vehicle Cell Styling */
.vehicle-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vehicle-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.vehicle-info .vehicle-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.vehicle-info .vehicle-plate {
  color: #6b7280;
  font-size: 12px;
}

/* Service Info Styling */
.service-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-icon {
  color: #6b7280;
  font-size: 14px;
}

/* Date Range Styling */
.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.date-start,
.date-end {
  display: flex;
  align-items: center;
  gap: 4px;
}

.date-separator {
  color: #6b7280;
  font-weight: 500;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
}

/* Form Field Styling */
.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

/* DataTable Customizations */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  border-color: #e5e7eb;
  color: #374151;
  font-weight: 600;
  padding: 12px 16px;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 12px 16px;
  border-color: #f3f4f6;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f9fafb;
}

:deep(.p-paginator) {
  background: #f8f9fa;
  border-color: #e5e7eb;
  padding: 12px 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .maintenance-table {
    padding: 16px;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .p-input-icon-left input {
    width: 100%;
  }

  .status-filters {
    justify-content: space-between;
  }

  .vehicle-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
