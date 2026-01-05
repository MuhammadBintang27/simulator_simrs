<template>
  <div>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

    <DataTable
      v-model:filters="filters"
      :value="patients"
      :paginator="true"
      :rows="10"
      @filter="onFilter"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      filterDisplay="row"
      removableSort
      sortMode="multiple"
      stripedRows
      showGridlines
      tableStyle="min-width: 50rem"
      :scrollable="true"
    >
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <div class="flex gap-2">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear Filters"
              outlined
              @click="clearFilters"
            />
            <Button
              type="button"
              icon="pi pi-refresh"
              label="Refresh"
              outlined
              @click="loadData"
              severity="info"
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

      <template #empty>
        <div class="text-center">
          <i class="pi pi-inbox text-4xl text-gray-400 mb-0"></i>
          <p class="text-gray-500">No patients found.</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center py-8">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-0"></i>
          <p class="text-gray-500">Loading patient data...</p>
        </div>
      </template>

      <!-- Registration Number -->
      <Column field="NOPENDAFTARAN" header="No Reg" :sortable="true" style="min-width: 150px">
        <template #body="{ data }">
          <span>{{ data.NOPENDAFTARAN }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Search"
          />
        </template>
      </Column>

      <!-- Patient Name -->
      <Column field="NAMAPASIEN" header="Nama" :sortable="true" style="min-width: 200px">
        <template #body="{ data }">
          <div class="flex flex-col">
            <span>{{ data.NAMAPASIEN }}</span>
            <span>{{ data.DATA_SINGKAT }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Search name"
          />
        </template>
      </Column>

      <!-- Medical Record -->
      <Column field="NOMR" header="No RM" :sortable="true" style="min-width: 120px">
        <template #body="{ data }">
          <span>{{ data.NOMR }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Search"
          />
        </template>
      </Column>

      <!-- Gender -->
      <Column field="JENISKELAMIN" header="JK" :sortable="true" style="min-width: 100px">
        <template #body="{ data }">
          <Tag :value="data.JENISKELAMIN" />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="genderOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select"
            class="p-column-filter"
            showClear
          />
        </template>
      </Column>

      <!-- Age -->
      <Column
        field="USIA"
        header="USIA"
        :sortable="true"
        dataType="numeric"
        style="min-width: 100px"
      >
        <template #body="{ data }">
          <span class="font-semibold"
            >{{ data.USIA_PASIEN.tahun }} Thn,{{ data.USIA_PASIEN.bulan }} Bln,{{
              data.USIA_PASIEN.hari
            }}
            Hr
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputNumber
            v-model="filterModel.value"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Age"
          />
        </template>
      </Column>

      <!-- Registration Date -->
      <Column
        field="TGLREG"
        header="TGL REG"
        :sortable="true"
        dataType="date"
        style="min-width: 150px"
      >
        <template #body="{ data }">
          <span>{{ formatDate(data.TGLREG) }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <DatePicker
            v-model="filterModel.value"
            @date-select="filterCallback()"
            dateFormat="yy-mm-dd"
            placeholder="Select date"
            class="p-column-filter"
            showIcon
          />
        </template>
      </Column>

      <!-- Doctor -->
      <Column field="NAMADOKTER" header="DOKTER" :sortable="true" style="min-width: 200px">
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <i class="pi pi-user-md text-blue-500"></i>
            <span>{{ data.NAMADOKTER }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="doctorOptions"
            placeholder="Select doctors"
            class="p-column-filter"
            :maxSelectedLabels="1"
          />
        </template>
      </Column>

      <!-- Department -->
      <Column field="POLI" header="POLI/RUANG" :sortable="true" style="min-width: 180px">
        <template #body="{ data }">
          {{ data.POLI }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="departmentOptions"
            placeholder="Select departments"
            :maxSelectedLabels="1"
          />
        </template>
      </Column>

      <!-- Payment Method -->
      <Column field="CARABAYAR" header="CARA BAYAR" :sortable="true" style="min-width: 120px">
        <template #body="{ data }">
          <Tag :value="data.CARABAYAR" :severity="data.CARABAYAR === 'BPJS' ? 'warning' : 'info'" />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="paymentOptions"
            placeholder="Select payment"
            class="p-column-filter"
            :maxSelectedLabels="1"
            display="chip"
          />
        </template>
      </Column>

      <!-- Diagnosis Code -->
      <Column field="DIAGNOSA_AWAL" header="DX AWL" :sortable="true" style="min-width: 150px">
        <template #body="{ data }">
          <span>{{ data.DIAGNOSA_AWAL }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Search code"
          />
        </template>
      </Column>

      <!-- Diagnosis Description -->
      <Column field="DX_CAPTION" header="NAMA DX" :sortable="true" style="min-width: 250px">
        <template #body="{ data }">
          <span>{{ data.DX_CAPTION }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Search diagnosis"
          />
        </template>
      </Column>

      <!-- Length of Stay -->
      <Column field="LOS" header="LOS" :sortable="true" dataType="numeric" style="min-width: 100px">
        <template #body="{ data }">
          {{ data.LOS }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputNumber
            v-model="filterModel.value"
            @input="filterCallback()"
            class="p-column-filter"
            placeholder="Days"
          />
        </template>
      </Column>

      <!-- Status -->
      <Column field="KETERANGAN" header="CARA PULANG" :sortable="true" style="min-width: 150px">
        <template #body="{ data }">
          {{ data.KETERANGAN }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="statusOptions"
            placeholder="Select status"
            :maxSelectedLabels="1"
          />
        </template>
      </Column>

      <!-- District -->
      <Column field="NAMAKECAMATAN" header="KEC" :sortable="true" style="min-width: 180px">
        <template #body="{ data }">
          <span>{{ data.NAMAKECAMATAN }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="districtOptions"
            placeholder="Select districts"
            class="p-column-filter"
            :maxSelectedLabels="1"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'

import * as XLSX from 'xlsx'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const patients = ref([])

const props = defineProps({
  datapasien: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object',
  },
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  NOPENDAFTARAN: { value: null, matchMode: FilterMatchMode.CONTAINS },
  NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
  NOMR: { value: null, matchMode: FilterMatchMode.CONTAINS },
  JENISKELAMIN: { value: null, matchMode: FilterMatchMode.EQUALS },
  USIA: { value: null, matchMode: FilterMatchMode.EQUALS },
  TGLREG: { value: null, matchMode: FilterMatchMode.DATE_IS },
  NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
  POLI: { value: null, matchMode: FilterMatchMode.IN },
  CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
  DIAGNOSA_AWAL: { value: null, matchMode: FilterMatchMode.CONTAINS },
  DX_CAPTION: { value: null, matchMode: FilterMatchMode.CONTAINS },
  LOS: { value: null, matchMode: FilterMatchMode.EQUALS },
  KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
  NAMAKECAMATAN: { value: null, matchMode: FilterMatchMode.IN },
})

const genderOptions = ref([
  { label: 'Male', value: 'L' },
  { label: 'Female', value: 'P' },
])

const paymentOptions = ref([])
const statusOptions = ref([])
const doctorOptions = ref([])
const departmentOptions = ref([])
const districtOptions = ref([])

const exportToExcel = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Convert JSON to worksheet
  const ws = XLSX.utils.json_to_sheet(filteredData.value)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'data_kunjungan_BNBA.xlsx')
}

const filteredData = ref([])
const onFilter = (event) => {
  filteredData.value = event.filteredValue
}

const loadData = () => {
  loading.value = true

  const rawData = props.datapasien
  patients.value = props.datapasien

  // Extract unique options for filters
  paymentOptions.value = [...new Set(rawData.map((p) => p.CARABAYAR))]
  statusOptions.value = [...new Set(rawData.map((p) => p.KETERANGAN))]
  doctorOptions.value = [...new Set(rawData.map((p) => p.NAMADOKTER))]
  departmentOptions.value = [...new Set(rawData.map((p) => p.POLI))]
  districtOptions.value = [...new Set(rawData.map((p) => p.NAMAKECAMATAN))]

  loading.value = false
}

const clearFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    NOPENDAFTARAN: { value: null, matchMode: FilterMatchMode.CONTAINS },
    NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
    NOMR: { value: null, matchMode: FilterMatchMode.CONTAINS },
    JENISKELAMIN: { value: null, matchMode: FilterMatchMode.EQUALS },
    USIA: { value: null, matchMode: FilterMatchMode.EQUALS },
    TGLREG: { value: null, matchMode: FilterMatchMode.DATE_IS },
    NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
    POLI: { value: null, matchMode: FilterMatchMode.IN },
    CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
    DIAGNOSA_AWAL: { value: null, matchMode: FilterMatchMode.CONTAINS },
    DX_CAPTION: { value: null, matchMode: FilterMatchMode.CONTAINS },
    LOS: { value: null, matchMode: FilterMatchMode.EQUALS },
    KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
    NAMAKECAMATAN: { value: null, matchMode: FilterMatchMode.IN },
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

// Toast functions
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

const fact = ref([])

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/index.php/api/transaksi_pasien/history3`)

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Methods
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
    return null
  }
}

onMounted(() => {})
</script>
