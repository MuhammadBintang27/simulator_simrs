<template>
  <div class="content">
    <!-- Header Card -->
    <loading_overlay :is-loading="loading" message="Memuat data...." />
    <div class="card elevation-0">
      <div class="card-header">
        <h4><i class="fas fa-file-invoice-dollar mr-2"></i> Riwayat Retur</h4>
      </div>
    </div>
    <!-- Summary Cards -->
    <div class="row mb-3">
      <div class="col-md-3">
        <div class="summary-card elevation-0">
          <div class="summary-icon" style="background-color: #e3f2fd">
            <i class="pi pi-calendar" style="color: #1976d2"></i>
          </div>
          <div class="summary-content">
            <p class="summary-label">Minggu Ini</p>
            <p class="summary-value">{{ formatCurrency(apiResponse?.total_minggu_ini) }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="summary-card elevation-0">
          <div class="summary-icon" style="background-color: #f3e5f5">
            <i class="pi pi-calendar" style="color: #7b1fa2"></i>
          </div>
          <div class="summary-content elevation-0">
            <p class="summary-label">Bulan Ini</p>
            <p class="summary-value">{{ formatCurrency(apiResponse?.total_bulan_ini) }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="summary-card elevation-0">
          <div class="summary-icon" style="background-color: #e8f5e9">
            <i class="pi pi-calendar" style="color: #388e3c"></i>
          </div>
          <div class="summary-content elevation-0">
            <p class="summary-label">Tahun Ini</p>
            <p class="summary-value">{{ formatCurrency(apiResponse?.total_tahun_ini) }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="summary-card elevation-0">
          <div class="summary-icon" style="background-color: #fff3e0">
            <i class="pi pi-list" style="color: #f57c00"></i>
          </div>
          <div class="summary-content">
            <p class="summary-label">Total Retur</p>
            <p class="summary-value">{{ returList.length || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card elevation-0 mb-3">
      <div class="card-body">
        <!-- Date Filter -->
        <div class="row">
          <div class="col-md-2">
            <label class="block mb-2 font-weight-bold">Tanggal Mulai</label>
            <DatePicker
              v-model="startDate"
              dateFormat="dd/mm/yy"
              placeholder="Pilih tanggal mulai"
              class="w-100"
            />
          </div>
          <div class="col-md-2">
            <label class="block mb-2 font-weight-bold">Tanggal Akhir</label>
            <DatePicker
              v-model="endDate"
              dateFormat="dd/mm/yy"
              placeholder="Pilih tanggal akhir"
              class="w-100"
            />
          </div>
          <div class="col-md-2">
            <label class="block mb-2 font-weight-bold">&nbsp;</label>
            <Button
              label="Cari"
              icon="pi pi-search"
              @click="fetchReturList"
              class="w-100 round-button2"
              :loading="loading"
            />
          </div>
          <div class="col-md-6 text-right">
            <label class="block mb-2 font-weight-bold">&nbsp; </label>
            <Button
              label="Buat Retur Baru"
              severity="warn"
              icon="pi pi-plus"
              class="round-button2"
              @click="$router.push({ name: 'ReturPersediaanView' })"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card elevation-0">
      <div class="card-body">
        <DataTable
          :value="filteredReturList()"
          :rows="10"
          paginator
          responsiveLayout="scroll"
          stripedRows
          dataKey="id"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} retur"
          class="p-datatable-striped"
        >
          <Column field="id" header="ID" :sortable="true" style="width: 8%" />

          <Column field="no_retur" header="No. Retur" :sortable="true" style="width: 18%">
            <template #body="slotProps">
              <span class="font-weight-bold text-primary">{{ slotProps.data.no_retur }}</span>
            </template>
          </Column>

          <Column
            field="nama_supplier"
            header="Nama Supplier"
            :sortable="true"
            style="width: 22%"
          />

          <Column field="tanggal" header="Tanggal" :sortable="true" style="width: 18%">
            <template #body="slotProps">
              <span class="text-muted">{{ slotProps.data.tanggal }}</span>
            </template>
          </Column>

          <Column field="alasan_retur" header="Alasan" style="width: 18%">
            <template #body="slotProps">
              <span v-if="slotProps.data.alasan_retur" class="text-dark">
                {{ slotProps.data.alasan_retur }}
              </span>
              <span v-else class="text-muted italic">-</span>
            </template>
          </Column>

          <Column field="status" header="status" style="width: 18%">
            <template #body="slotProps">
              <Tag severity="info" v-if="slotProps.data.deleted == 0">
                <small> {{ slotProps.data.status }} </small>
              </Tag>
              <Tag severity="warn" v-if="slotProps.data.deleted == 1">
                <small> {{ slotProps.data.status }} </small>
              </Tag>
            </template>
          </Column>

          <Column header="Aksi" style="width: 10%" frozen alignFrozen="right">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-info p-button-sm round-button"
                  @click="handleView(slotProps.data)"
                />

                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm round-button"
                  @click="confirmDelete(slotProps.data)"
                />
              </div>
            </template>
          </Column>

          <!-- Empty Message -->
          <template #empty>
            <div class="text-center py-5">
              <i class="pi pi-inbox text-4xl text-muted mb-3"></i>
              <p class="text-muted">Tidak ada data retur</p>
            </div>
          </template>

          <!-- Loading Message -->
          <template #loadingicon>
            <i class="pi pi-spin pi-spinner"></i>
          </template>
        </DataTable>
      </div>
    </div>
  </div>

  <!-- Detail Dialog -->
  <Dialog
    v-model:visible="ShowDetailDialog"
    header="Detail Item Retur"
    :modal="true"
    :style="{ width: '70vw' }"
  >
    <DataTable
      :value="details_retur_item"
      responsiveLayout="scroll"
      stripedRows
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} returns"
      class="p-datatable-striped"
    >
      <Column field="no_retur" header="NO RETUR" :sortable="true">
        <template #body="slotProps">
          <span class="font-weight-bold text-primary">{{ slotProps.data.no_retur }}</span>
        </template>
      </Column>
      <Column field="barcode" header="BARCODE" :sortable="true" />
      <Column field="item" header="ITEM" :sortable="true" />
      <Column field="qty" header="QTY" :sortable="true" />
      <Column field="harga" header="HARGA" :sortable="true" style="text-align: right">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.harga) }}
        </template>
      </Column>
      <Column field="amount" header="AMOUNT" :sortable="true" style="text-align: right">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.amount) }}
        </template>
      </Column>
    </DataTable>

    <div
      class="p-3 border-top"
      style="background-color: #f8f9fa; margin-top: 1rem; font-weight: bold"
    >
      <div class="row">
        <div class="col-md-9 text-right">
          <strong>Total Amount:</strong>
        </div>
        <div class="col-md-3">
          {{ formatCurrency(totalAmount) }}
        </div>
      </div>
    </div>
  </Dialog>

  <!-- Confirm Delete Dialog -->
  <ConfirmDialog></ConfirmDialog>
  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import DatePicker from 'primevue/datepicker'
import ConfirmDialog from 'primevue/confirmdialog'

// Store
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, id_lokasi } = storeToRefs(authStore)

// Toast & Confirm
const toast = useToast()
const confirm = useConfirm()

// State
const loading = ref(false)
const searchValue = ref('')
const returList = ref([])

const startDate = ref(new Date())
const endDate = ref(new Date())

const ShowDetailDialog = ref(false)

const totalAmount = computed(() => {
  return details_retur_item.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

// Computed properties for summary cards
const returMingguIni = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const startOfWeek = new Date(today.setDate(diff))

  return returList.value.filter((item) => {
    const itemDate = new Date(item.tanggal)
    return itemDate >= startOfWeek && itemDate <= new Date()
  }).length
})

const returBulanIni = computed(() => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return returList.value.filter((item) => {
    const itemDate = new Date(item.tanggal)
    return itemDate >= startOfMonth && itemDate <= today
  }).length
})

const returTahunIni = computed(() => {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 1)

  return returList.value.filter((item) => {
    const itemDate = new Date(item.tanggal)
    return itemDate >= startOfYear && itemDate <= today
  }).length
})

// Toast Functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: message,
    life: 3000,
  })
}

const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const showError = (message = 'An error occurred') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

// Format Functions
const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
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
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return null
  }
}

// API Functions
const fetchReturList = async () => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl

    const payload = {
      id_client: id_client.value,
      mode: 1,
      start_date: formatDateOnlyForAPI(startDate.value),
      end_date: formatDateOnlyForAPI(endDate.value),
    }

    const response = await axios.post(`${url}/index.php/api/retur/get_data_retur`, payload)

    if (response.data.code === 200) {
      returList.value = response.data.response
    } else {
      showError(response.data.message || 'Gagal mengambil data retur')
    }
  } catch (error) {
    console.error('Error fetching retur list:', error)
    showError('Terjadi kesalahan saat mengambil data')
  } finally {
    loading.value = false
  }
}

// Filter Functions
const filteredReturList = () => {
  if (!searchValue.value) {
    return returList.value
  }
  return returList.value.filter(
    (item) =>
      item.no_retur.toLowerCase().includes(searchValue.value.toLowerCase()) ||
      item.nama_supplier.toLowerCase().includes(searchValue.value.toLowerCase()),
  )
}

// Action Functions
const handleView = async (item) => {
  ShowDetailDialog.value = true
  await details_item_retur(item.no_retur)
}

const confirmDelete = (item) => {
  confirm.require({
    message: `Yakin ingin menghapus retur ${item.no_retur}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Hapus',
    rejectLabel: 'Batal',
    accept: () => {
      handleDelete(item)
    },
  })
}

const handleDelete = async (item) => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/retur/hapus_data_retur`, {
      no_retur: item.no_retur,
      id_client: id_client.value,
      user_id: user_id.value,
      id_lokasi: id_lokasi.value,
    })

    console.log(response.data)
    if (response.data.code === 200) {
      showSuccess('Retur berhasil dihapus')
      fetchReturList()
    } else {
      showError(response.data.message || 'Gagal menghapus retur')
    }
  } catch (error) {
    console.error('Error deleting retur:', error)
    showError('Terjadi kesalahan saat menghapus retur')
  } finally {
    loading.value = false
  }
}

const apiResponse = ref({
  total_count: 0,
  total_minggu_ini: 0,
  total_bulan_ini: 0,
  total_tahun_ini: 0,
})

const summary_retur = async () => {
  try {
    loading.value = true

    const payload = {
      id_client: id_client.value,
      id_lokasi: id_lokasi.value,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/retur/summary_retur`, payload)
    console.log(response.data)
    if (response.data.code === 200) {
      apiResponse.value = response.data.response
      //summary_retur()
    } else {
      showError(response.data.message || 'Gagal mengambil data retur')
    }
  } catch (error) {
    console.error('Error deleting retur:', error)
    showError('Terjadi kesalahan saat menghapus retur')
  } finally {
    loading.value = false
  }
}

const details_retur_item = ref([])

const details_item_retur = async (no_retur) => {
  try {
    loading.value = true

    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/retur/get_details_retur/${id_lokasi.value}/${no_retur}/${id_client.value}`,
    )
    details_retur_item.value = response.data
  } catch (error) {
    console.error('Error fetching retur details:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchReturList()
  summary_retur()
})
</script>

<style scoped>
.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-label {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.summary-value {
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  font-weight: 700;
  color: #212529;
}

.round-button2 {
  border-radius: 20px;
  padding: 8px 20px;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}

.w-100 {
  width: 100%;
}

.italic {
  font-style: italic;
}

.mb-3 {
  margin-bottom: 1rem;
}

.p-button-sm {
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
}

.block {
  display: block;
}

.font-weight-bold {
  font-weight: 700;
}

.text-right {
  text-align: right;
}
</style>
