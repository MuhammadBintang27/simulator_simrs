<template>
  <div class="content">
    <div class="card elevation-0">
      <div class="card-header">
        <h4>Data kunjungan Pasien</h4>
      </div>

      <div class="card-body">
        <div class="row">
          <div class="col-md-2">
            <div class="control-group">
              <label class="filter-label">
                <i class="pi pi-calendar-plus"></i>
                TANGGAL MULAI
              </label>
              <br />
              <DatePicker
                v-model="startDate"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal mulai"
                showIcon
                class="w-100"
                iconDisplay="input"
              />
            </div>
          </div>

          <div class="col-md-2">
            <div class="control-group">
              <label class="filter-label">
                <i class="pi pi-calendar-plus"></i>
                TANGGAL AKHIR
              </label>
              <br />
              <DatePicker
                v-model="endDate"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal akhir"
                showIcon
                class="w-100"
                iconDisplay="input"
              />
            </div>
          </div>
          <div class="col-md-1">
            <label class="filter-label">
              <i class="pi pi-calendar-plus"></i>
              JENIS RAWAT
            </label>
            <br />
            <Select
              v-model="jenisRawatSelected"
              :options="jenis_rawat"
              placeholder="Pilih Jenis"
              class="p-column-filter mt-0"
              optionLabel="caption"
            />
          </div>
          <div class="col-md-1">
            <br />
            <Button
              class="w-100 mt-2 round-button2"
              @click="callData"
              label="Cari"
              icon="pi pi-search"
              :loading="loading"
              :disabled="loading"
            />
          </div>
        </div>
      </div>
    </div>

    <Tabs value="0" @update:value="handleTabChange">
      <TabList>
        <Tab value="0">Rekap</Tab>
        <Tab value="1">Detail (Rincian)</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="card elevation-0">
            <DataTable
              v-model:filters="filters"
              :value="medicalData"
              paginator
              :rows="20"
              @filter="onFilter"
              :rowsPerPageOptions="[5, 10, 20, 50, 100]"
              tableStyle="min-width: 50rem"
              filterDisplay="row"
              :globalFilterFields="[
                'TAHUN',
                'BULAN',
                'DIAGNOSA_AWAL',
                'jenis_penyakit',
                'POLI_RUANG',
              ]"
              striped-rows
            >
              <template #header>
                <div class="flex justify-content-between align-items-center">
                  <div class="flex gap-2">
                    <Button
                      type="button"
                      icon="pi pi-filter-slash"
                      label="Clear Filters"
                      outlined
                      @click="clearFilters()"
                    />
                    <Button
                      type="button"
                      icon="pi pi-chart-bar"
                      label="Rekap Data"
                      severity="info"
                      @click="showRecapDialog = true"
                    />
                    <Button
                      type="button"
                      icon="pi pi-file-excel"
                      label="Export Ke Excel"
                      severity="success"
                      @click="exportToExcel()"
                    />
                  </div>
                </div>
              </template>

              <Column field="TAHUN" header="Tahun" :showFilterMenu="false" style="min-width: 10rem">
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="tahunOptions"
                    placeholder="Pilih Tahun"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>

              <Column field="BULAN" header="Bulan" :showFilterMenu="false" style="min-width: 10rem">
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="bulanOptions"
                    placeholder="Pilih Bulan"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>
              <Column
                field="NOJAMINAN"
                header="NOJAMINAN"
                :showFilterMenu="false"
                style="min-width: 10rem"
              ></Column>
              <Column field="NOMR" header="NOMR" :showFilterMenu="false" style="min-width: 10rem">
              </Column>
              <Column field="NAMA" header="NAMA" :showFilterMenu="false" style="min-width: 10rem">
              </Column>
              <Column
                field="NAMADOKTER"
                header="DOKTER"
                :showFilterMenu="false"
                style="min-width: 10rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="5"
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="namaDokterOptions"
                    placeholder="Pilih Bulan"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>
              <Column
                field="USIA"
                header="USIA"
                :sortable="true"
                :showFilterMenu="true"
                style="min-width: 10rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="5"
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="UsiaSelected"
                    placeholder="Pilih Bulan"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>
              <Column
                field="JENISKELAMIN"
                header="JENISKELAMIN"
                :showFilterMenu="true"
                style="min-width: 10rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    :maxSelectedLabels="5"
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="JenisKelaminOptions"
                    placeholder="Pilih Bulan"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>

              <Column
                field="POLI_RUANG"
                header="Poli/Ruang"
                :showFilterMenu="false"
                style="min-width: 12rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="poliOptions"
                    placeholder="Pilih Poli"
                    class="p-column-filter"
                    showClear
                    :maxSelectedLabels="5"
                    filter
                  />
                </template>
              </Column>

              <Column
                field="DIAGNOSA_AWAL"
                header="Kode Diagnosa"
                :showFilterMenu="true"
                style="min-width: 12rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="diagnosaOptions"
                    placeholder="Pilih Diagnosa"
                    class="p-column-filter"
                    showClear
                    :maxSelectedLabels="5"
                    filter
                  />
                </template>
              </Column>

              <Column
                field="jenis_penyakit"
                header="Jenis Penyakit"
                :showFilterMenu="true"
                style="min-width: 16rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="jenisPenyakitOptions"
                    placeholder="Pilih Jenis Penyakit"
                    class="p-column-filter"
                    showClear
                    filter
                  />
                </template>
              </Column>

              <Column
                field="JML_LAMA_L"
                header="Lama (L)"
                :showFilterMenu="false"
                :sortable="true"
                style="min-width: 5rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="jmlLamaLOptions"
                    placeholder="Pilih Jumlah"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>

              <Column
                field="JML_LAMA_P"
                header="Lama (P)"
                :showFilterMenu="false"
                :sortable="true"
                style="min-width: 10rem"
                sort-field
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="jmlLamaPOptions"
                    placeholder="Pilih Jumlah"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>

              <Column
                field="JML_BARU_L"
                header="Baru (L)"
                :showFilterMenu="false"
                style="min-width: 10rem"
                :sortable="true"
                sort-field
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="jmlBaruLOptions"
                    placeholder="Pilih Jumlah"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>

              <Column
                field="JML_BARU_P"
                header="Baru (P)"
                :showFilterMenu="false"
                :sortable="true"
                style="min-width: 10rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="jmlBaruPOptions"
                    placeholder="Pilih Jumlah"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>

              <Column
                field="JML_KUNJUNGAN"
                header="Total Kunjungan"
                :showFilterMenu="false"
                :sortable="true"
                style="min-width: 12rem"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <MultiSelect
                    v-model="filterModel.value"
                    @change="filterCallback()"
                    :options="jmlKunjunganOptions"
                    placeholder="Pilih Total"
                    class="p-column-filter"
                    showClear
                  />
                </template>
              </Column>

              <template #empty> Tidak ada data. </template>
            </DataTable>
          </div>
        </TabPanel>
        <TabPanel value="1">
          <DataKunjunganDetails :datapasien="listDataRincian || []"></DataKunjunganDetails>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <!-- Recap Dialog -->
    <Dialog
      v-model:visible="showRecapDialog"
      modal
      header="Data Rekap"
      :style="{ width: '80vw' }"
      :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
    >
      <div class="mb-3">
        <label class="font-semibold mb-2 block">Pilih Kolom untuk Rekap:</label>
        <div class="flex flex-wrap gap-3">
          <div v-for="col in recapColumns" :key="col.field" class="flex align-items-center">
            <Checkbox v-model="selectedRecapColumns" :inputId="col.field" :value="col.field" />
            <label :for="col.field" class="ml-2">{{ col.header }}</label>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <Button
          label="Generate Recap"
          icon="pi pi-calculator"
          @click="generateRecap"
          :disabled="selectedRecapColumns.length === 0"
          severity="success"
        />
        <Button
          label="Export to Excel"
          icon="pi pi-file-excel"
          @click="exportRecapToExcel"
          :disabled="!recapData.length"
          severity="info"
          class="ml-2"
        />
      </div>

      <DataTable
        v-if="recapData.length > 0"
        :value="recapData"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        tableStyle="min-width: 50rem"
        striped-rows
        showGridlines
      >
        <Column
          v-for="col in recapTableColumns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :style="col.style"
          :sortable="true"
        />
      </DataTable>

      <div v-else class="text-center py-4 text-gray-500">
        Pilih kolom dan klik "Generate Recap" untuk melihat rekapitulasi data
      </div>
    </Dialog>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import * as XLSX from 'xlsx'

import DataKunjunganDetails from '@/views/Statistik/DataKunjunganDetails.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const startDate = ref(null)
const endDate = ref(null)
const jenisRawatSelected = ref(null)

const jenis_rawat = ref([
  {
    code: '1',
    caption: 'INAP',
  },
  {
    code: '2',
    caption: 'JALAN',
  },
])

const medicalData = ref([])
const poliOptions = ref([])
const tahunOptions = ref([])
const bulanOptions = ref([])
const diagnosaOptions = ref([])
const jenisPenyakitOptions = ref([])
const jmlLamaLOptions = ref([])
const jmlLamaPOptions = ref([])
const NoMROptions = ref([])
const jmlBaruLOptions = ref([])
const jmlBaruPOptions = ref([])
const jmlKunjunganOptions = ref([])
const UsiaSelected = ref([])
const JenisKelaminOptions = ref([])
const namaDokterOptions = ref([])

// Recap related refs
const showRecapDialog = ref(false)
const selectedRecapColumns = ref([])
const recapData = ref([])
const recapTableColumns = ref([])

const activeTab = ref('0')

const handleTabChange = (value) => {
  activeTab.value = value

  // Add your custom logic here
  if (value === '0') {
    // Handle Non Racikan tab
  } else if (value === '1') {
    // Handle Racikan tab
  }
}

const recapColumns = [
  { field: 'TAHUN', header: 'Tahun' },
  { field: 'BULAN', header: 'Bulan' },
  { field: 'POLI_RUANG', header: 'Poli/Ruang' },
  { field: 'DIAGNOSA_AWAL', header: 'Kode Diagnosa' },
  { field: 'jenis_penyakit', header: 'Jenis Penyakit' },
  { field: 'USIA', header: 'USIA' },
]

const filteredData = ref([])

const onFilter = (event) => {
  filteredData.value = event.filteredValue
}

const filters = ref({
  TAHUN: { value: null, matchMode: FilterMatchMode.IN },
  BULAN: { value: null, matchMode: FilterMatchMode.IN },
  POLI_RUANG: { value: null, matchMode: FilterMatchMode.IN },
  DIAGNOSA_AWAL: { value: null, matchMode: FilterMatchMode.IN },
  jenis_penyakit: { value: null, matchMode: FilterMatchMode.IN },
  JML_LAMA_L: { value: null, matchMode: FilterMatchMode.IN },
  JML_LAMA_P: { value: null, matchMode: FilterMatchMode.IN },
  JML_BARU_L: { value: null, matchMode: FilterMatchMode.IN },
  JML_BARU_P: { value: null, matchMode: FilterMatchMode.IN },
  NOMR: { value: null, matchMode: FilterMatchMode.IN },
  USIA: { value: null, matchMode: FilterMatchMode.IN },
  JML_KUNJUNGAN: { value: null, matchMode: FilterMatchMode.IN },
  JENISKELAMIN: { value: null, matchMode: FilterMatchMode.IN },
  NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
})

const clearFilters = () => {
  filters.value = {
    TAHUN: { value: null, matchMode: FilterMatchMode.IN },
    BULAN: { value: null, matchMode: FilterMatchMode.IN },
    POLI_RUANG: { value: null, matchMode: FilterMatchMode.IN },
    DIAGNOSA_AWAL: { value: null, matchMode: FilterMatchMode.IN },
    jenis_penyakit: { value: null, matchMode: FilterMatchMode.IN },
    JML_LAMA_L: { value: null, matchMode: FilterMatchMode.IN },
    JML_LAMA_P: { value: null, matchMode: FilterMatchMode.IN },
    JML_BARU_L: { value: null, matchMode: FilterMatchMode.IN },
    JML_BARU_P: { value: null, matchMode: FilterMatchMode.IN },
    NOMR: { value: null, matchMode: FilterMatchMode.IN },
    USIA: { value: null, matchMode: FilterMatchMode.IN },
    JML_KUNJUNGAN: { value: null, matchMode: FilterMatchMode.IN },
    JENISKELAMIN: { value: null, matchMode: FilterMatchMode.IN },
    NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
  }
}

const exportToExcel = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Convert JSON to worksheet
  const ws = XLSX.utils.json_to_sheet(filteredData.value)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'data_kunjungan.xlsx')
}

const generateRecap = () => {
  if (medicalData.value.length === 0) {
    showWarning('Tidak ada data untuk direkap')
    return
  }

  if (selectedRecapColumns.value.length === 0) {
    showWarning('Pilih minimal satu kolom untuk rekap')
    return
  }

  // Group data by selected columns
  const grouped = {}

  filteredData.value.forEach((row) => {
    // Create key from selected columns
    const keyParts = selectedRecapColumns.value.map((col) => row[col] || '')
    const key = keyParts.join('|')

    if (!grouped[key]) {
      grouped[key] = {
        JML_LAMA_L: 0,
        JML_LAMA_P: 0,
        JML_BARU_L: 0,
        JML_BARU_P: 0,
        JML_KUNJUNGAN: 0,
        count: 0,
      }

      // Add selected column values
      selectedRecapColumns.value.forEach((col) => {
        grouped[key][col] = row[col]
      })
    }

    // Sum numeric fields
    grouped[key].JML_LAMA_L += Number(row.JML_LAMA_L) || 0
    grouped[key].JML_LAMA_P += Number(row.JML_LAMA_P) || 0
    grouped[key].JML_BARU_L += Number(row.JML_BARU_L) || 0
    grouped[key].JML_BARU_P += Number(row.JML_BARU_P) || 0
    grouped[key].JML_KUNJUNGAN += Number(row.JML_KUNJUNGAN) || 0
    grouped[key].count += 1
  })

  // Convert to array and sort
  recapData.value = Object.values(grouped).sort((a, b) => {
    for (const col of selectedRecapColumns.value) {
      if (a[col] !== b[col]) {
        return String(a[col]).localeCompare(String(b[col]))
      }
    }
    return 0
  })

  // Setup table columns
  recapTableColumns.value = [
    ...selectedRecapColumns.value.map((field) => ({
      field,
      header: recapColumns.find((c) => c.field === field)?.header || field,
      style: 'min-width: 12rem',
    })),
    { field: 'USIA', header: 'USIA', style: 'min-width: 10rem' },
    { field: 'JML_LAMA_L', header: 'Total Lama (L)', style: 'min-width: 10rem' },
    { field: 'JML_LAMA_P', header: 'Total Lama (P)', style: 'min-width: 10rem' },
    { field: 'JML_BARU_L', header: 'Total Baru (L)', style: 'min-width: 10rem' },
    { field: 'JML_BARU_P', header: 'Total Baru (P)', style: 'min-width: 10rem' },
    { field: 'JML_KUNJUNGAN', header: 'Total Kunjungan', style: 'min-width: 12rem' },
    { field: 'count', header: 'Jumlah Record', style: 'min-width: 10rem' },
  ]

  showSuccess(`Berhasil membuat rekap ${recapData.value.length} baris data`)
}

const exportRecapToExcel = () => {
  if (recapData.value.length === 0) {
    showWarning('Tidak ada data rekap untuk diekspor')
    return
  }

  try {
    // Create CSV content
    const wb = XLSX.utils.book_new()

    // Convert JSON to worksheet
    const ws = XLSX.utils.json_to_sheet(recapData.value)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'dataRekap.xlsx')

    showSuccess('Data berhasil diekspor ke Excel')
  } catch (error) {
    console.error('Error exporting data:', error)
    showError('Gagal mengekspor data')
  }
}

const getUniqueValues = (field) => {
  return [...new Set(medicalData.value.map((item) => item[field]))].sort((a, b) => {
    if (!isNaN(a) && !isNaN(b)) {
      return Number(a) - Number(b)
    }
    return a.toString().localeCompare(b.toString())
  })
}

const updateFilterOptions = () => {
  tahunOptions.value = getUniqueValues('TAHUN')
  bulanOptions.value = getUniqueValues('BULAN')
  poliOptions.value = getUniqueValues('POLI_RUANG')
  diagnosaOptions.value = getUniqueValues('DIAGNOSA_AWAL')
  jenisPenyakitOptions.value = getUniqueValues('jenis_penyakit')
  jmlLamaLOptions.value = getUniqueValues('JML_LAMA_L')
  jmlLamaPOptions.value = getUniqueValues('JML_LAMA_P')
  NoMROptions.value = getUniqueValues('NOMR')
  jmlBaruLOptions.value = getUniqueValues('JML_BARU_L')
  jmlBaruPOptions.value = getUniqueValues('JML_BARU_P')
  jmlKunjunganOptions.value = getUniqueValues('JML_KUNJUNGAN')
  UsiaSelected.value = getUniqueValues('USIA')
  JenisKelaminOptions.value = getUniqueValues('JENISKELAMIN')
  namaDokterOptions.value = getUniqueValues('NAMADOKTER')
}

const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: message,
    life: 3000,
  })
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

const validateInputs = () => {
  if (!startDate.value) {
    showWarning('Tanggal mulai harus diisi')
    return false
  }
  if (!endDate.value) {
    showWarning('Tanggal akhir harus diisi')
    return false
  }
  if (new Date(startDate.value) > new Date(endDate.value)) {
    showWarning('Tanggal mulai tidak boleh lebih besar dari tanggal akhir')
    return false
  }
  if (!jenisRawatSelected.value) {
    showWarning('Jenis rawat harus dipilih')
    return false
  }
  return true
}

const callData = async () => {
  if (activeTab.value == '0') {
    fetchData()
  } else {
    CallDataRincian()
  }
}

const listDataRincian = ref([])

const childRef = ref(null)

const CallDataRincian = async () => {
  if (!validateInputs()) {
    return
  }

  try {
    loading.value = true
    const payload = {
      id_client: id_client.value,
      tglawal: formatDateOnlyForAPI(startDate.value),
      tglakhir: formatDateOnlyForAPI(endDate.value),
      jenisrawat: jenisRawatSelected.value?.caption,
      mod: 'history20',
    }

    console.log('Request payload:', payload)

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history3`, payload)

    console.log(response.data)

    if (response.data && response.data.response) {
      listDataRincian.value = [...response.data.response]
      // filters.value = medicalData.value
      // childRef.value.loadData()
      if (listDataRincian.value.length === 0) {
        showWarning('Tidak ada data yang ditemukan')
      } else {
        showSuccess(`Berhasil memuat ${listDataRincian.value.length} data`)
      }
    } else {
      listDataRincian.value = []
      showWarning('Tidak ada data yang ditemukan')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    listDataRincian.value = []

    if (error.response) {
      showError(`Error: ${error.response.data?.message || 'Terjadi kesalahan saat mengambil data'}`)
    } else if (error.request) {
      showError('Tidak dapat terhubung ke server')
    } else {
      showError('Terjadi kesalahan saat memproses permintaan')
    }
  } finally {
    loading.value = false
  }
}

const fetchData = async () => {
  if (!validateInputs()) {
    return
  }

  try {
    loading.value = true
    const payload = {
      id_client: id_client.value,
      tglawal: formatDateOnlyForAPI(startDate.value),
      tglakhir: formatDateOnlyForAPI(endDate.value),
      jenisrawat: jenisRawatSelected.value?.caption,
    }

    console.log('Request payload:', payload)

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/laporan/laporan_rl5_5`, payload)

    console.log('Response:', response.data)

    if (response.data && response.data.response) {
      medicalData.value = [...response.data.response]
      // filters.value = medicalData.value
      updateFilterOptions()

      if (medicalData.value.length === 0) {
        showWarning('Tidak ada data yang ditemukan')
      } else {
        showSuccess(`Berhasil memuat ${medicalData.value.length} data`)
      }
    } else {
      medicalData.value = []
      showWarning('Tidak ada data yang ditemukan')
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    medicalData.value = []

    if (error.response) {
      showError(`Error: ${error.response.data?.message || 'Terjadi kesalahan saat mengambil data'}`)
    } else if (error.request) {
      showError('Tidak dapat terhubung ke server')
    } else {
      showError('Terjadi kesalahan saat memproses permintaan')
    }
  } finally {
    loading.value = false
  }
}

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

onMounted(() => {
  // Initialize with empty options - will be populated after data fetch
  updateFilterOptions()
})
</script>
