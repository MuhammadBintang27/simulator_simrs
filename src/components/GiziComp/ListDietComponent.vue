<template>
  <!-- <loading_overlay :is-loading="loading" message="Memuat data...." /> -->
  <Dialog
    v-model:visible="showHistoryTeraphy"
    modal
    header="Pilih diet"
    :style="{ width: '1200px' }"
    class="patient-detail-dialog"
  >
    <div class="row">
      <!-- Kolom Kiri: Daftar Item -->
      <div class="col-md-6">
        <Card class="items-card">
          <template #title>
            <div class="card-title-wrapper">
              <span>LIST DIET</span>
              <Badge
                v-if="itemAvailable.length > 0"
                :value="itemAvailable.length"
                class="results-badge"
              />
            </div>
          </template>

          <template #content>
            <DataTable
              :value="itemAvailable"
              :paginator="true"
              :rows="10"
              :rowsPerPageOptions="[5, 10, 15, 25]"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Menampilkan {first} - {last} dari {totalRecords} data"
              stripedRows
              showGridlines
              :globalFilter="globalFilter"
              :emptyMessage="emptyMessage"
              class="medicine-table"
            >
              <template #header>
                <div class="table-header">
                  <div class="header-right">
                    <IconField>
                      <InputIcon class="pi pi-search" />
                      <InputText
                        v-model="globalFilter"
                        placeholder="Filter tabel..."
                        size="small"
                      />
                    </IconField>
                  </div>
                </div>
              </template>

              <template #empty>
                <div class="empty-state">
                  <i class="pi pi-inbox empty-icon"></i>
                  <p>
                    {{
                      globalFilter
                        ? 'Tidak ada hasil yang cocok dengan pencarian'
                        : 'Tidak ada data diet ditemukan'
                    }}
                  </p>
                  <Button
                    v-if="globalFilter"
                    label="Reset Filter"
                    icon="pi pi-refresh"
                    size="small"
                    outlined
                    @click="clearAllFilters"
                  />
                </div>
              </template>

              <Column field="NAMA" header="JENIS DIET" sortable>
                <template #body="slotProps">
                  <div class="medicine-name-cell">
                    <strong>{{ slotProps.data.NAMA }}</strong>
                  </div>
                </template>
              </Column>

              <Column header="Aksi" style="width: 120px">
                <template #body="slotProps">
                  <div class="action-buttons">
                    <Button
                      icon="pi pi-plus"
                      size="small"
                      severity="success"
                      @click="selectMedicine(slotProps.data, slotProps.index)"
                      v-tooltip="'Pilih Diet'"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <!-- Kolom Kanan: Item yang dipilih -->
      <div class="col-md-6">
        <Card class="selected-items-card">
          <template #title>
            <div class="card-title-wrapper">
              <span>DIET TERPILIH #{{ formatDateTime(tanggal_diet) }}</span>
              <Badge
                v-if="selectedItems.length > 0"
                :value="selectedItems.length"
                severity="success"
              />
            </div>
          </template>

          <template #content>
            <div v-if="selectedItems.length > 0" class="selected-items-actions">
              <Button
                label="Hapus Semua"
                icon="pi pi-trash"
                severity="danger"
                outlined
                size="small"
                @click="clearAllSelected"
              />
            </div>

            <DataTable
              :value="selectedItems"
              stripedRows
              showGridlines
              :emptyMessage="'Belum ada diet yang dipilih'"
              class="medicine-table"
            >
              <template #empty>
                <div class="empty-state">
                  <i class="pi pi-heart empty-icon"></i>
                  <p>Belum ada diet yang dipilih</p>
                  <small>Pilih diet dari tabel sebelah kiri</small>
                </div>
              </template>

              <Column field="NAMA" header="JENIS DIET">
                <template #body="slotProps">
                  <strong>{{ slotProps.data.NAMA }}</strong>
                </template>
              </Column>

              <Column field="JADWAL" header="JADWAL" style="width: 150px">
                <template #body="slotProps">
                  <Select
                    v-model="slotProps.data.REMARK_ITEM"
                    :options="jadwalOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih jadwal"
                    class="jadwal-select"
                    @change="updateJadwal(slotProps.data, slotProps.index, $event)"
                  />
                </template>
              </Column>

              <Column header="Aksi" style="width: 80px">
                <template #body="slotProps">
                  <Button
                    icon="pi pi-times"
                    size="small"
                    severity="danger"
                    outlined
                    @click="removeItem(slotProps.index)"
                    v-tooltip="'Hapus dari pilihan'"
                  />
                </template>
              </Column>
            </DataTable>

            <ScrollPanel style="height: 500px; padding-right: 4px">
              <DataTable :value="list_diet_added" stripedRows paginator :rows="5">
                <Column field="NAMA" header="NAMA">
                  <template #body="slotProps">
                    <Button
                      icon="pi pi-times"
                      severity="warn"
                      @click="ConfirmVoidResep(slotProps.data.TRANS, slotProps.index)"
                      class="round-button2"
                      text
                    ></Button>
                  </template>
                </Column>
                <Column field="NAMA" header="NAMA" />

                <Column field="DIET" header="DIET">
                  <template #body="slotProps">
                    <strong>{{ slotProps.data.DIET }}</strong>
                  </template>
                </Column>
                <Column field="DPJP" header="DOKTER" />

                <Column field="STATUS_PROGRESS" header="STATUS">
                  <template #body="slotProps">
                    <Tag
                      :severity="slotProps.data?.STATUS_PROGRESS === 'P' ? 'success' : 'warning'"
                      :value="slotProps.data?.STATUS_PROGRESS === 'C' ? 'Completed' : 'In Progress'"
                    />
                  </template>
                </Column>
                <!-- <Column field="PROSES" header="PROSES" />
                <Column field="SELESAI" header="SELESAI" /> -->
              </DataTable>
              <!-- <Panel class="mb-1">
                <template #header> </template>
                {{ list_diet_added }}

                <div class="row" v-for="(data, index) in list_diet_added" :key="index">
                  <div class="col-md-4">
                    <Button
                      icon="pi pi-times"
                      severity="warn"
                      @click="ConfirmVoidResep(data.RECEIPT_NO, index)"
                      class="round-button2"
                      text
                    ></Button>
                  </div>
                  <div class="col-md-4">
                    <Tag severity="success" style="font-size: 10px">{{ data.DIET }} </Tag>
                  </div>
                </div>

                <template #footer> </template>
              </Panel> -->
            </ScrollPanel>
          </template>
        </Card>
      </div>
    </div>

    <template #footer>
      <Button label="Simpan" icon="pi pi-check" @click="saveItems" class="round-button2" />
      <Button label="Tutup" icon="pi pi-times" @click="CloseButton" class="p-button-outlined" />
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="get_riwayat()"
        class="p-button-outlined"
      />
    </template>
  </Dialog>

  <ConfirmDialog />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ScrollPanel from 'primevue/scrollpanel'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import Badge from 'primevue/badge'
import { type } from 'jquery'

// Stores and composables
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
// atau jika menggunakan injection

// Reactive variables
const loading = ref(false)
const searchQuery = ref('')
const globalFilter = ref('')
const itemAvailable = ref([])

const RewayatDiet = ref([])

const ConfirmVoidResep = (RECEIPT_NO, index) => {
  RemoveResep(RECEIPT_NO, index)
}

const RemoveResep = async (RECEIPT_NO) => {
  const url = configStore.apiApotikUrl

  const paramUrl = `${RECEIPT_NO}/${id_client.value}/${0}`
  const response = await axios.post(`${url}/index.php/api/sales/void_sales/${paramUrl}`)
  if (response.data.metadata.code == '200') {
    get_riwayat()
    showSuccess('Resep berhasil dibatalkan')
  } else {
    showError(response.data.metadata.message)
  }
}

// method kirim resep
const kirim_resep = async (rcpt_no) => {
  loading.value = true
  const param = {
    RECEIPT_NO: rcpt_no,
  }

  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/kirim_resep/${id_client.value}`,
      param,
    )
    console.log(response.data)
    await get_riwayat()
    showSuccess('Resep berhasil dikirim')
  } catch (error) {
    console.error(error)
    showError('Gagal mengirim resep')
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['update:showHistoryTeraphy'])

const props = defineProps({
  datapasien: {
    type: Object,
    required: false,
    validator: (value) => value && typeof value === 'object',
  },
  showHistoryTeraphy: {
    type: Boolean,
    default: false,
  },
  showDetailDialog: {
    type: Boolean,
    default: false,
  },
  tanggal_diet: {
    type: Date,
    default: false,
  },
  shif_diet: {
    type: String,
    default: '',
  },
})

const formatDateForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return null
  }
}

const list_diet_added = ref([])
// API functions
const get_riwayat = async () => {
  try {
    loading.value = true

    const formattedDate = formatDateForAPI(props.tanggal_diet)
    if (!formattedDate) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Pilih tanggal terlebih dahulu',
        life: 3000,
      })
      loading.value = false
      return
    }

    const param = {
      id_client: id_client.value,
      mode: 2,
      jenis_penunjang: 5,
      shif: props.shif_diet,
      tanggal: formattedDate,
      nomr: props.datapasien?.NOMR,
    }

    // console.log('param to get list diet', param)

    list_diet_added.value = []

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/Data_referensi/getlist_penunjang_order_jasa_penunjang`,
      param,
    )

    if (response.data && response.data.response) {
      list_diet_added.value = [...response.data.response]
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data. Silakan coba lagi.',
      life: 3000,
    })
    list_diet_added.value = []
  } finally {
    loading.value = false
  }
}

const showHistoryTeraphy = computed({
  get: () => props.showHistoryTeraphy,
  set: (value) => emit('update:showHistoryTeraphy', value),
})

const CloseButton = async () => {
  showHistoryTeraphy.value = false
}
// Tambahan: daftar item terpilih
const selectedItems = ref([])

// Jadwal options
const jadwalOptions = ref([
  { label: 'PAGI', value: 'PAGI' },
  { label: 'SIANG', value: 'SIANG' },
  { label: 'MALAM', value: 'MALAM' },
])

// Computed
const emptyMessage = computed(() => {
  return loading.value ? 'Memuat data...' : 'Tidak ada data diet ditemukan'
})

// Methods
const handleSearch = () => {
  // Set global filter untuk mencari di dalam table
  globalFilter.value = searchQuery.value.trim()
}

const resetSearch = () => {
  searchQuery.value = ''
  globalFilter.value = ''
}

const clearAllFilters = () => {
  searchQuery.value = ''
  globalFilter.value = ''
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'

  try {
    const date = new Date(dateTimeString)

    if (isNaN(date.getTime())) {
      return dateTimeString
    }

    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour12: false,
    })
  } catch (error) {
    console.error('DateTime formatting error:', error)
    return dateTimeString
  }
}

const formatDateTime_tosave = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatForDatabase = (dateValue) => {
  try {
    if (!dateValue) return null

    // Ensure we have a Date object
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateValue)
      return null
    }

    // Use Intl.DateTimeFormat for reliable formatting
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false,
    })

    return formatter.format(date).replace('T', ' ')
  } catch (error) {
    console.error('Error formatting date:', error, dateValue)
    return null
  }
}

const currentDateTime = ref('')

//currentDateTime.value = formatDateTime()

const saveItems = async () => {
  if (selectedItems.value.length === 0) {
    showWarning('Tidak ada item yang akan disimpan')
    return
  }
  currentDateTime.value = formatDateTime()

  const headerObat = {
    header: {
      RECEIPT_NO: '',
      MEMBERSHIP_ID: props.datapasien?.NOMR,
      SALESNO: 0,
      IDUSER: '11',
      TANGGAL: formatForDatabase(props.tanggal_diet),
      IDPAYEMENT: 0,
      NOTE: '',
      SUBTOTAL: 0,
      TAXPERCENT: 0,
      TAXAMOUNT: 0,
      TOTALBAYAR: 0,
      POTONGAN: 0,
      MODE: 'REG',
      IDCLIENT: id_client.value,
      GRANDTOTAL: 0,
      KEMBALIAN: 0,
      ID_LOKASI: 92,
      ROOM_TABLE_NUMBER: 0,
      RESV_ID: 0,
      NO_REGISTER: props.datapasien?.NOPENDAFTARAN,
      SERVER_ID: 0,
      POLI_RUANG: props.datapasien?.POLI,
      DPJP: props.datapasien?.NAMADOKTER,
      SERVER_NAME: '',
      STATUS_PROGRESS: '',
      OBAT_OBATAN: 5,
      AS_PARENT: 1,
      TGL_SELESAI: '',
      KLINIS: '',
      JENIS_RESEP: 'RT',
      CARAPAKAI_RACIK: '',
      JML_RACIK: '',
      BENTUK_RACIK: '',
      OBAT_PULANG: 0,
      details: selectedItems.value,
    },
  }

  loading.value = true
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/insert_sales_v2`, headerObat)
    console.log(response.data)

    if (response.data?.metadata?.code == 200) {
      showSuccess('Data berhasil disimpan')
      selectedItems.value = []
      await get_riwayat()
    } else {
      showError(response.data?.metadata?.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error(error)
    showError('Terjadi kesalahan saat menyimpan data')
  } finally {
    loading.value = false
  }
}

const selectMedicine = (item, index) => {
  // Tambahkan ke daftar selectedItems jika belum ada

  // Buat copy dari medicine dengan jadwal default kosong
  const medicineWithSchedule = {
    BARCODE: item.BARCODE,
    ID_BARANG: item.BARCODE,
    JENIS_R: 'R/',
    NAMA: item.NAMA || item.CAPTION,
    SATUAN: item.SATUAN,
    RECEIPT_NO: '',
    HARGA: item.HARGAJUAL,
    POTONGSTOCK: item.POTONGSTOCK,
    TOTAL_ITEM: 0,
    QTY_RACIK: item.QTY_RACIK || 0,
    PERSEDIAAN: item.QUANTITY || item.QUNATITY,
    SATUAN_RACIK: item.SATUAN_RACIK,
    MEREK: item.SATUAN,
    TOTALAMOUNT: 0,
    DISCOUNT: 0,
    ITEMSEQNO: index,
    SUBITEMSEQNO: 1,
    QTY: 1,
    STATUS: '',
    DOSIS: '',
    STATUS_PROGRESS: 'M',
    SUB_BARCODE: item.SUB_BARCODE,
    OBAT_OBATAN: 1,
    AS_PARENT: 0,
    SAT_RACIK: '',
    FLAG: 'NEW LINE',
    JENIS: item.JENIS,
    JENIS_RESEP: 'RT',
    ID_LOKASI: 0,
    REMARK: '',
    REMARK_ITEM: props.shif_diet,
    TANGGAL_TRANS: currentDateTime.value,
    JML_RACIK: 0,
  }
  selectedItems.value.push(medicineWithSchedule)
}

const removeItem = (index) => {
  selectedItems.value.splice(index, 1)
}

const clearAllSelected = () => {
  if (selectedItems.value.length > 0) {
    selectedItems.value = []
    showInfo('Semua pilihan diet telah dihapus')
  }
}

const updateJadwal = (medicine, event, index) => {
  // Update jadwal di selected item
  if (selectedItems.value[index]) {
    selectedItems.value[index].REMARK_ITEM = event.value
  }
}

// API functions
const findItem = async (mode, barcode) => {
  try {
    const param = {
      barcode: barcode,
      mode: mode,
      id_client: id_client.value,
      breakdown: 0,
      nama: '',
      lokasi: 0,
    }
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    if (response.data?.metadata?.code == 200) {
      itemAvailable.value = response.data.response || []
      if (itemAvailable.value.length === 0) {
        showWarning('Tidak ada data diet ditemukan')
      }
    } else {
      itemAvailable.value = []
      showWarning('Tidak ada data diet ditemukan')
    }
  } catch (error) {
    console.error('Error loading data:', error)
    itemAvailable.value = []
    showError('Gagal memuat data diet')
  } finally {
    loading.value = false
  }
}

// Toast functions
const showSuccess = (message) => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

const showError = (message) => {
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
    summary: 'Peringatan',
    detail: message,
    life: 4000,
  })
}

const showInfo = (message) => {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: message,
    life: 4000,
  })
}

watch(
  () => showHistoryTeraphy.value,
  (newVal) => {
    if (newVal) {
      // Dialog dibuka
      get_riwayat()
    }
  },
)

// Lifecycle
onMounted(() => {
  findItem(20, '') // Load semua data saat pertama kali dengan mode 19
})
</script>

<style scoped>
.medicine-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.search-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.search-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 2.5rem;
}

.items-card,
.selected-items-card {
  background: white;
  border: 1px solid #e9ecef;
  margin-bottom: 1rem;
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.results-badge {
  background-color: #6c757d;
}

.medicine-table {
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1rem;
}

.medicine-name-cell strong {
  color: #2c3e50;
  font-size: 0.95rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.selected-items-actions {
  margin-bottom: 1rem;
  text-align: right;
}

.jadwal-select {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 2.5rem;
  color: #dee2e6;
  margin-bottom: 0.5rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.medicine-dialog .medicine-info {
  padding: 1rem 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
}

.info-row span {
  color: #6c757d;
  text-align: right;
  flex: 1;
  margin-left: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .medicine-container {
    padding: 1rem;
  }

  .search-wrapper {
    flex-direction: column;
  }

  .table-header {
    justify-content: center;
  }

  .card-title-wrapper {
    justify-content: center;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-row span {
    text-align: left;
    margin-left: 0;
  }

  .selected-items-actions {
    text-align: center;
  }
}

/* Custom DataTable styling */
:deep(.p-datatable .p-datatable-header) {
  background: #f8f9fa;
  border-color: #e9ecef;
  padding: 0;
  border: none;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-color: #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border-color: #e9ecef;
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background: #f8f9fa;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #e7f3ff;
}

:deep(.p-button:disabled) {
  opacity: 0.4;
}

:deep(.jadwal-select .p-select) {
  width: 100%;
}
</style>
