<template>
  <Dialog v-model:visible="showPatientDialog" modal :closable="true" :style="dialogStyle">
    <div>
      <DataTable
        v-model:filters="filters"
        :value="listDataRiwayat"
        striped-rows
        showGridlines
        paginator
        rowHover
        scrollable
        :scrollHeight="isMobile ? '50vh' : '65vh'"
        :rows="isMobile ? 10 : 25"
        :rowsPerPageOptions="isMobile ? [5, 10] : [10, 25, 50, 100]"
        :globalFilterFields="[
          'NAMAPASIEN',
          'NOKTP_ENKRIP',
          'NO_KARTU',
          'ALAMAT',
          'JENISKELAMIN',
          'AGAMA',
          'PEKERJAAN',
        ]"
        :tableStyle="tableStyle"
        filterDisplay="row"
        responsiveLayout="stack"
      >
        <!-- Header Buttons -->
        <template #header>
          <div class="filter-container">
            <!-- Standard Filter Section -->
            <div class="button-group">
              <Button
                type="button"
                icon="pi pi-filter-slash"
                :label="isMobile ? '' : 'Clear'"
                outlined
                size="small"
                @click="clearFilters"
                v-tooltip.top="'Clear Filters'"
              />
              <Button
                type="button"
                icon="pi pi-file-excel"
                :label="isMobile ? '' : 'Export'"
                severity="success"
                size="small"
                @click="exportToExcel"
                v-tooltip.top="'Export to Excel'"
              />
              <Button
                type="button"
                icon="pi pi-sync"
                severity="warn"
                :label="isMobile ? '' : 'Refresh'"
                :loading="loading"
                size="small"
                @click="loadPatients(2)"
                v-tooltip.top="'Refresh Data'"
              />
            </div>

            <!-- Search Fields -->
            <div class="search-fields">
              <div class="field">
                <label>Nama Pasien</label>
                <InputText
                  v-model="NamaPasien"
                  placeholder="Cari Nama..."
                  size="small"
                  @keydown.enter="loadPatients(4)"
                />
              </div>
              <div class="field">
                <label>No RM</label>
                <InputText
                  v-model="selectedNOMR"
                  placeholder="Cari No RM..."
                  size="small"
                  @keydown.enter="loadPatients(3)"
                />
              </div>
              <div class="field">
                <label>No BPJS</label>
                <InputText
                  v-model="selectedNOBPJS"
                  placeholder="Cari No BPJS..."
                  size="small"
                  @keydown.enter="loadPatients(6)"
                />
              </div>
              <div class="field">
                <label>NIK</label>
                <InputText
                  v-model="selectedNIK"
                  placeholder="Cari NIK..."
                  size="small"
                  @keydown.enter="loadPatients(5)"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Patient Data Columns -->
        <Column field="NOMR" header="No RM" sortable :style="colStyle.nomr">
          <template #body="{ data }">
            <div class="cell-content">
              <span>{{ data.NOMR }}</span>
              <Button
                v-if="data.NOMR"
                icon="pi pi-copy"
                severity="secondary"
                text
                rounded
                size="small"
                @click="copyToClipboard(data.NOMR, 'No RM')"
                v-tooltip="'Copy'"
              />
            </div>
          </template>
        </Column>

        <Column field="NAMAPASIEN" header="NAMA PASIEN" sortable :style="colStyle.nama">
          <template #body="{ data }">
            {{ data.NAMAPASIEN }}
          </template>
        </Column>

        <Column field="JENISKELAMIN" header="JK" sortable :style="colStyle.jk" />

        <Column field="TGLLAHIR" header="TGL LAHIR" sortable :style="colStyle.tgl" />

        <Column field="USIA_LENGKAP" header="USIA" :style="colStyle.usia" />

        <Column field="ALAMAT" header="ALAMAT" sortable :style="colStyle.alamat" />

        <Column field="NO_KARTU" header="No BPJS" sortable :style="colStyle.bpjs">
          <template #body="{ data }">
            <div class="cell-content">
              <span>{{ data.NO_KARTU }}</span>
              <Button
                v-if="data.NO_KARTU"
                icon="pi pi-copy"
                severity="secondary"
                text
                rounded
                size="small"
                @click="copyToClipboard(data.NO_KARTU, 'No BPJS')"
                v-tooltip="'Copy'"
              />
            </div>
          </template>
        </Column>

        <Column field="NOKTP" header="NIK" sortable :style="colStyle.nik">
          <template #body="{ data }">
            <div class="cell-content">
              <span>{{ data.NOKTP }}</span>
              <Button
                v-if="data.NOKTP"
                icon="pi pi-copy"
                severity="secondary"
                text
                rounded
                size="small"
                @click="copyToClipboard(data.NOKTP, 'NIK')"
                v-tooltip="'Copy'"
              />
            </div>
          </template>
        </Column>

        <Column field="" header="RIWAYAT" :style="colStyle.riwayat">
          <template #body="{ data }">
            <Button
              icon="pi pi-history"
              severity="info"
              text
              rounded
              @click="RiwayatKunjungan(data)"
              :label="isMobile ? '' : 'Riwayat'"
            />
          </template>
        </Column>
        <Column field="" header="AKSI" :style="colStyle.riwayat">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              severity="warn"
              text
              rounded
              @click="HapusdataPasien(data)"
              :label="isMobile ? '' : 'Hapus'"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>

  <!-- Detail History Dialog -->
  <Dialog v-model:visible="showDetailDialog" modal :closable="true" :style="detailDialogStyle">
    <template #header>
      <div class="dialog-header">
        <i class="pi pi-info-circle"></i>
        <span>Detail Riwayat Pendaftaran</span>
      </div>
    </template>

    <div v-if="listHistoryData && listHistoryData.length > 0">
      <DataTable
        :value="listHistoryData"
        striped-rows
        showGridlines
        paginator
        rowHover
        scrollable
        :scrollHeight="isMobile ? '40vh' : '65vh'"
        :rows="isMobile ? 5 : 10"
        :rowsPerPageOptions="isMobile ? [5] : [5, 10, 25]"
        :tableStyle="isMobile ? 'min-width: 100%' : 'min-width: 100%'"
        responsiveLayout="stack"
      >
        <Column
          field="NOPENDAFTARAN"
          header="No Pendaftaran"
          sortable
          :style="detailColStyle.pendaftaran"
        >
          <template #body="{ data }">
            {{ data.NOPENDAFTARAN }}
          </template>
        </Column>

        <Column field="NOMR" header="No RM" sortable :style="detailColStyle.nomr">
          <template #body="{ data }">
            {{ data.NOMR }}
          </template>
        </Column>

        <Column field="TGLREG" header="TGL KUNJUNGAN" sortable :style="detailColStyle.tgl">
          <template #body="{ data }">
            {{ formatDate(data.TGLREG) }}
          </template>
        </Column>

        <Column field="NAMAPASIEN" header="Nama Pasien" sortable :style="detailColStyle.nama" />

        <Column field="DOKTER" header="DOKTER" sortable :style="detailColStyle.dokter">
          <template #body="{ data }">
            {{ data.NAMADOKTER }}
          </template>
        </Column>

        <Column field="POLI" header="POLI/RUANG" sortable :style="detailColStyle.poli" />
      </DataTable>
    </div>

    <template #footer>
      <Button label="Tutup" icon="pi pi-times" @click="showDetailDialog = false" text />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)

// Composables
const toast = useToast()

// State
const loading = ref(false)
const loadingFilters = ref(false)
const showPatientDialog = ref(false)
const listDataRiwayat = ref([])
const selectedPatient = ref(null)
const isMobile = ref(window.innerWidth < 768)

// Filter list states
const listNOMR = ref([])
const listNOBPJS = ref([])
const listNIK = ref([])

// Selected filter values
const selectedNOMR = ref('')
const selectedNOBPJS = ref('')
const selectedNIK = ref('')
const NamaPasien = ref('')

// Store original data for filtering
const originalListDataRiwayat = ref([])

// Filter setup
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Responsive Dialogs Styles
const dialogStyle = computed(() => ({
  width: isMobile.value ? '95vw' : '1300px',
  maxWidth: '100%',
}))

const detailDialogStyle = computed(() => ({
  width: isMobile.value ? '95vw' : '1100px',
  maxWidth: '100%',
}))

// Column Styles
const colStyle = computed(() => ({
  nomr: { minWidth: isMobile.value ? '80px' : '120px' },
  nama: { minWidth: isMobile.value ? '120px' : '180px' },
  jk: { minWidth: isMobile.value ? '50px' : '70px', textAlign: 'center' },
  tgl: { minWidth: isMobile.value ? '100px' : '130px' },
  usia: { minWidth: isMobile.value ? '60px' : '90px', textAlign: 'center' },
  alamat: { minWidth: isMobile.value ? '120px' : '220px' },
  bpjs: { minWidth: isMobile.value ? '110px' : '170px' },
  nik: { minWidth: isMobile.value ? '110px' : '180px' },
  riwayat: { minWidth: '80px', textAlign: 'center' },
}))

const detailColStyle = computed(() => ({
  pendaftaran: { minWidth: isMobile.value ? '100px' : '140px' },
  nomr: { minWidth: isMobile.value ? '80px' : '120px' },
  tgl: { minWidth: isMobile.value ? '110px' : '180px' },
  nama: { minWidth: isMobile.value ? '100px' : '180px' },
  dokter: { minWidth: isMobile.value ? '100px' : '160px' },
  poli: { minWidth: isMobile.value ? '100px' : '180px' },
}))

const tableStyle = computed(() => (isMobile.value ? 'min-width: 100%' : 'min-width: 70rem'))

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const HapusdataPasien = async (data) => {
  console.log('Hapus data pasien:', data)

  const payload = {
    id: data.IDPASIEN,
    id_client: id_client.value,
  }
  const url = configStore.apiBaseUrl
  const response = await axios.post(
    `${url}/index.php/api/transaksi_pasien/hapusrm_pasien_v2`,
    payload,
  )

  if (response.data.metadata.code == 200) {
    showSuccess('Data pasien berhasil dihapus')
    loadPatients(2)
  } else {
    showError('Gagal menghapus data pasien')
  }
  // Implementasi penghapusan data pasien di sini
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// Watch for dialog visibility changes
watch(showPatientDialog, (newVal) => {
  if (newVal === true) {
    showPatientDialog.value = true
    selectedNIK.value = ''
    selectedNOBPJS.value = ''
    selectedNOMR.value = ''
    NamaPasien.value = ''
    //loadPatients(2) ga erpu load pasien di awal
    loadFilterOptions()
  }
})

// Copy to clipboard function
const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccess(`${label} berhasil dicopy`)
    showPatientDialog.value = false
  } catch (error) {
    console.error('Failed to copy:', error)
    showError(`Gagal mencopy ${label}`)
  }
}

const clearFilters = () => {
  filters.value.global.value = null
  selectedNOMR.value = ''
  selectedNOBPJS.value = ''
  selectedNIK.value = ''
  loadPatients(2)
}
// Load filter options from database
const loadFilterOptions = async () => {
  loadingFilters.value = true
  try {
    const url = configStore.apiBaseUrl
    if (!url) {
      showError('API URL not configured')
      return
    }

    const payload = {
      mode: 2,
      id_client: id_client.value,
    }

    const response = await axios.post(
      `${url}/index.php/api/data_referensi/GetDataPasien_v3`,
      payload,
    )

    if (response?.data?.metadata?.code === 200 && response.data.response?.length) {
      const patients = response.data.response

      listNOMR.value = Array.from(
        new Map(patients.map((p) => [p.NOMR, { NOMR: p.NOMR }])).values(),
      ).sort((a, b) => a.NOMR.localeCompare(b.NOMR))

      listNOBPJS.value = Array.from(
        new Map(patients.map((p) => [p.NO_KARTU, { NO_KARTU: p.NO_KARTU }])).values(),
      ).sort((a, b) => a.NO_KARTU.localeCompare(b.NO_KARTU))

      listNIK.value = Array.from(
        new Map(patients.map((p) => [p.NOKTP, { NOKTP: p.NOKTP }])).values(),
      ).sort((a, b) => a.NOKTP.localeCompare(b.NOKTP))
    }
  } catch (error) {
    console.error('Error loading filter options:', error)
    showError('Terjadi kesalahan saat memuat opsi filter')
  } finally {
    loadingFilters.value = false
  }
}

// Apply all filters together
const applyFilters = () => {
  let filtered = [...originalListDataRiwayat.value]

  if (selectedNOMR.value) {
    filtered = filtered.filter((p) =>
      p.NOMR?.toString().toLowerCase().includes(selectedNOMR.value.toLowerCase()),
    )
  }

  if (selectedNOBPJS.value) {
    filtered = filtered.filter((p) =>
      p.NO_KARTU?.toString().toLowerCase().includes(selectedNOBPJS.value.toLowerCase()),
    )
  }

  if (selectedNIK.value) {
    filtered = filtered.filter((p) =>
      p.NOKTP?.toString().toLowerCase().includes(selectedNIK.value.toLowerCase()),
    )
  }

  listDataRiwayat.value = filtered
}

const showDetailDialog = ref(false)
const listHistoryData = ref([])
const selectedHistoryDetail = ref(null)

const RiwayatKunjungan = async (data) => {
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      mod: 'history5',
      id_client: id_client.value,
      norm: data.NOMR,
      jenisrawat: '',
    }

    selectedHistoryDetail.value = data

    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history3`, payload)

    if (response.data.metadata.code == 200) {
      listHistoryData.value = response.data.response
      showDetailDialog.value = true
      showSuccess('Data pasien berhasil dimuat')
    } else {
      listHistoryData.value = []
      showWarning('Tidak ada data pasien ditemukan')
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
    showError('Terjadi kesalahan saat memuat data pasien')
    listDataRiwayat.value = []
  } finally {
    loading.value = false
  }
}

// Export to Excel
const exportToExcel = () => {
  if (!listDataRiwayat.value || listDataRiwayat.value.length === 0) {
    showWarning('No data to export')
    return
  }

  try {
    console.log('Exporting to Excel...', listDataRiwayat.value)
    showSuccess('Data exported successfully')
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    showError('Failed to export data')
  }
}

// Load patients from API
const loadPatients = async (mode) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    if (!url) {
      showError('API URL not configured')
      return
    }

    if (mode == 4) {
      if (NamaPasien.value.length < 3) {
        return
      }
    }

    const payload = {
      mode: mode,
      id_client: id_client.value,
      nama: NamaPasien.value,
      nik: selectedNIK.value,
      noka: selectedNOBPJS.value,
      nomr: selectedNOMR.value,
    }

    const response = await axios.post(
      `${url}/index.php/api/data_referensi/GetDataPasien_v3`,
      payload,
    )

    if (response?.data?.metadata?.code === 200 && response.data.response?.length) {
      listDataRiwayat.value = response.data.response
      originalListDataRiwayat.value = response.data.response
      showSuccess('Data pasien berhasil dimuat')
    } else {
      listDataRiwayat.value = []
      showWarning('Tidak ada data pasien ditemukan')
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
    showError('Terjadi kesalahan saat memuat data pasien')
    listDataRiwayat.value = []
  } finally {
    loading.value = false
  }
}

// Toast functions
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

const showWarning = (message = 'Perhatian') => {
  toast.add({
    severity: 'warn',
    summary: 'Peringatan',
    detail: message,
    life: 4000,
  })
}

// Date formatting utilities
const formatDate = (date) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    return date
  }
}

const showDialogInputPasien = () => {
  showPatientDialog.value = true
}

defineExpose({ showDialogInputPasien })
</script>

<style scoped>
/* ===== RESPONSIVE UTILITIES ===== */
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.cell-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

/* ===== DATATABLE STYLING ===== */
:deep(.p-datatable-scrollable-header) {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff7ec;
}

:deep(.p-datatable-thead > tr > th) {
  font-weight: 300;
  padding: 0.25rem 0.4rem;
  font-size: 0.8rem;
  line-height: 2rem;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
  line-height: 1rem;
}

:deep(.p-datatable-tbody > tr:nth-child(odd)) {
  background-color: #fffdf9;
}

:deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: #fff9f1;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #ffe6c0 !important;
  transition: background-color 0.2s ease;
}

/* Dialog styling */
:deep(.p-dialog .p-dialog-header) {
  background-color: #fff8f0;
  border-bottom: 1px solid #f5e7d5;
  padding: 1rem;
}

/* Scrollbar styling */
:deep(.p-datatable-wrapper::-webkit-scrollbar) {
  height: 6px;
  width: 6px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  border-radius: 8px;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 767px) {
  .search-fields {
    grid-template-columns: 1fr;
  }

  .button-group {
    justify-content: center;
  }

  :deep(.p-button) {
    padding: 0.5rem 0.75rem;
  }

  :deep(.p-button-label) {
    display: none;
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.5rem 0.25rem;
    font-size: 0.7rem;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }

  :deep(.p-datatable-responsive-stack) {
    flex-direction: column;
  }

  :deep(.p-datatable-responsive-stack > .p-datatable-tbody-row > .p-datatable-tbody-row-data) {
    display: flex;
    width: 100%;
  }

  :deep(.p-paginator) {
    padding: 0.5rem;
  }

  :deep(.p-paginator-bottom) {
    flex-wrap: wrap;
  }
}

/* ===== TABLET RESPONSIVE ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .search-fields {
    grid-template-columns: repeat(2, 1fr);
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.3rem 0.3rem;
    font-size: 0.75rem;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.3rem 0.3rem;
    font-size: 0.8rem;
  }
}

/* ===== DESKTOP ===== */
@media (min-width: 1025px) {
  .search-fields {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
