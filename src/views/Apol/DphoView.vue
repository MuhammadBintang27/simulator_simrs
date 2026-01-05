<template>
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

  <Panel>
    <template #header>
      <h6>DAFTAR OBAT PHO</h6>
    </template>

    <template #icons>
      <Button
        class="round-button2 ml-2"
        icon="pi pi-refresh"
        :loading="loading"
        @click="fetchData"
        label="Refresh"
      />
      <Button
        class="round-button2 ml-2"
        icon="pi pi-filter-slash"
        @click="clearFilters"
        label="Clear Filters"
        severity="secondary"
      />
    </template>

    <DataTable
      :value="medicines"
      :paginator="true"
      :rows="100"
      :rowsPerPageOptions="[10, 25, 50, 100, 500]"
      responsiveLayout="scroll"
      showGridlines
      :globalFilter="globalFilter"
      :globalFilterFields="['kodeobat', 'namaobat', 'generik', 'restriksi']"
      :sortField="'namaobat'"
      :sortOrder="1"
      striped-rows
      v-model:filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} item obat"
      filterDisplay="row"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
          <!-- Quick Filter Buttons -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <Button
              :class="[
                'p-button-sm',
                activeQuickFilter === 'prb' ? 'p-button-success' : 'p-button-outlined',
              ]"
              @click="setQuickFilter('prb')"
              label="PRB"
              size="small"
            />
            <Button
              :class="[
                'p-button-sm',
                activeQuickFilter === 'kronis' ? 'p-button-info' : 'p-button-outlined',
              ]"
              @click="setQuickFilter('kronis')"
              label="Kronis"
              size="small"
            />
            <Button
              :class="[
                'p-button-sm',
                activeQuickFilter === 'kemo' ? 'p-button-warning' : 'p-button-outlined',
              ]"
              @click="setQuickFilter('kemo')"
              label="Kemo"
              size="small"
            />
          </div>

          <span style="margin-left: auto; font-weight: 500">
            Total: {{ filteredCount }} / {{ medicines.length }}
          </span>
        </div>
      </template>
      <Column header="#" style="text-align: right" field="">
        <template #body="slotProps">
          {{ slotProps.index + 1 }}
        </template>
      </Column>
      <!-- Kode Obat Column with Filter -->
      <Column field="kodeobat" header="Kode Obat" sortable style="min-width: 120px">
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Filter kode..."
            class="p-column-filter"
            style="width: 100%"
          />
        </template>
      </Column>

      <!-- Nama Obat Column with Filter -->
      <Column field="namaobat" header="Nama Obat" sortable style="min-width: 200px">
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Filter nama..."
            class="p-column-filter"
            style="width: 100%"
          />
        </template>
      </Column>

      <!-- PRB Column with Filter -->
      <Column header="PRB" style="width: 100px; text-align: center" field="prb" sortable>
        <template #body="slotProps">
          <span v-if="slotProps.data.prb == 'True'">
            <i class="fas fa-check-square fa-lg" style="color: green"></i>
          </span>
          <span v-else>
            <i class="fas fa-times" style="color: #ccc"></i>
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="booleanOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua"
            class="p-column-filter"
            style="width: 100%"
            :showClear="true"
          />
        </template>
      </Column>

      <!-- Kronis Column with Filter -->
      <Column header="Kronis" style="width: 100px; text-align: center" field="kronis" sortable>
        <template #body="slotProps">
          <span v-if="slotProps.data.kronis == 'True'">
            <i class="fas fa-check-square fa-lg" style="color: green"></i>
          </span>
          <span v-else>
            <i class="fas fa-times" style="color: #ccc"></i>
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="booleanOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua"
            class="p-column-filter"
            style="width: 100%"
            :showClear="true"
          />
        </template>
      </Column>

      <!-- Kemo Column with Filter -->
      <Column header="Kemo" style="width: 100px; text-align: center" field="kemo" sortable>
        <template #body="slotProps">
          <span v-if="slotProps.data.kemo == 'True'">
            <i class="fas fa-check-square fa-lg" style="color: green"></i>
          </span>
          <span v-else>
            <i class="fas fa-times" style="color: #ccc"></i>
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="booleanOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua"
            class="p-column-filter"
            style="width: 100%"
            :showClear="true"
          />
        </template>
      </Column>

      <!-- Harga Column with Filter -->
      <Column header="Harga" sortable style="text-align: right; width: 150px" field="harga">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.harga) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <div style="display: flex; gap: 4px">
            <InputNumber
              v-model="filterModel.value"
              @input="filterCallback()"
              placeholder="Min harga..."
              class="p-column-filter"
              style="width: 100%"
              :useGrouping="false"
            />
          </div>
        </template>
      </Column>

      <!-- Generik Column with Filter -->
      <Column field="generik" header="Generik" sortable style="min-width: 150px">
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Filter generik..."
            class="p-column-filter"
            style="width: 100%"
          />
        </template>
      </Column>

      <!-- Restriksi Column with Filter -->
      <Column field="restriksi" header="Restriksi" style="min-width: 200px">
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Filter restriksi..."
            class="p-column-filter"
            style="width: 100%"
          />
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)
const globalFilter = ref('')
const medicines = ref([])
const activeQuickFilter = ref(null)

// Filter options
const booleanOptions = ref([
  { label: 'Ya', value: 'True' },
  { label: 'Tidak', value: 'False' },
])

// Initialize filters
const filters = ref({
  kodeobat: { value: null, matchMode: FilterMatchMode.CONTAINS },
  namaobat: { value: null, matchMode: FilterMatchMode.CONTAINS },
  prb: { value: null, matchMode: FilterMatchMode.EQUALS },
  kronis: { value: null, matchMode: FilterMatchMode.EQUALS },
  kemo: { value: null, matchMode: FilterMatchMode.EQUALS },
  harga: { value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
  generik: { value: null, matchMode: FilterMatchMode.CONTAINS },
  restriksi: { value: null, matchMode: FilterMatchMode.CONTAINS },
  aktif: { value: null, matchMode: FilterMatchMode.EQUALS },
})

// Computed property to count filtered results
const filteredCount = computed(() => {
  // This is an approximation - PrimeVue handles the actual filtering internally
  // For exact count, you'd need to implement the filtering logic manually
  return medicines.value.length
})

// Clear all filters
const clearFilters = () => {
  filters.value = {
    kodeobat: { value: null, matchMode: FilterMatchMode.CONTAINS },
    namaobat: { value: null, matchMode: FilterMatchMode.CONTAINS },
    prb: { value: null, matchMode: FilterMatchMode.EQUALS },
    kronis: { value: null, matchMode: FilterMatchMode.EQUALS },
    kemo: { value: null, matchMode: FilterMatchMode.EQUALS },
    harga: { value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
    generik: { value: null, matchMode: FilterMatchMode.CONTAINS },
    restriksi: { value: null, matchMode: FilterMatchMode.CONTAINS },
    aktif: { value: null, matchMode: FilterMatchMode.EQUALS },
  }
  globalFilter.value = ''
  activeQuickFilter.value = null
}

// Quick filter functions
const setQuickFilter = (filterType) => {
  // Clear all filters first
  clearFilters()

  // Set the specific filter
  if (activeQuickFilter.value === filterType) {
    // If already active, clear it
    activeQuickFilter.value = null
  } else {
    activeQuickFilter.value = filterType
    filters.value[filterType].value = 'True'
  }
}

// Utility function to convert string boolean values
const convertToBoolean = (value) => {
  if (value === null || value === undefined || value === '') return null
  const stringValue = String(value).toLowerCase().trim()
  if (stringValue === 'true' || stringValue === '1' || stringValue === 'ya') return true
  if (stringValue === 'false' || stringValue === '0' || stringValue === 'tidak') return false
  return null
}

// Column body formatters
const prbBody = (rowData) => {
  const value = convertToBoolean(rowData.prb)
  return value === true ? 'Ya' : value === false ? 'Tidak' : '-'
}

const kronisBody = (rowData) => {
  const value = convertToBoolean(rowData.kronis)
  return value === true ? 'Ya' : value === false ? 'Tidak' : '-'
}

const kemoBody = (rowData) => {
  const value = convertToBoolean(rowData.kemo)
  return value === true ? 'Ya' : value === false ? 'Tidak' : '-'
}

const aktifBody = (rowData) => {
  const value = convertToBoolean(rowData.aktif)
  return value === true ? 'Aktif' : value === false ? 'Tidak Aktif' : '-'
}

const formatCurrency = (value) => {
  const price = Number(value || 0)
  if (price === 0) return '-'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Fetch data function
const fetchData = async () => {
  if (!id_client.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'ID Client tidak ditemukan',
      life: 3000,
    })
    return
  }

  loading.value = true

  try {
    const apiUrl = configStore.apiBaseUrl
    if (!apiUrl) {
      throw new Error('API Base URL not configured')
    }

    const response = await axios.get(
      `${apiUrl}/index.php/api/bpjs_api/getdata_dpho/${id_client.value}`,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.data) {
      if (response.data.response?.list) {
        medicines.value = response.data.response.list
      } else if (Array.isArray(response.data)) {
        medicines.value = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        medicines.value = response.data.data
      } else {
        medicines.value = []
      }
    } else {
      medicines.value = []
    }

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `Data obat berhasil dimuat (${medicines.value.length} item)`,
      life: 3000,
    })
  } catch (error) {
    console.error('Error fetching DPHO data:', error)

    let errorMessage = 'Gagal mengambil data obat'
    if (error.response) {
      errorMessage = `Server Error: ${error.response.status} - ${error.response.statusText}`
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server'
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Permintaan timeout, coba lagi'
    }

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    })

    medicines.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {})

defineExpose({
  fetchData,
  medicines,
})
</script>

<style scoped>
.content {
  padding: 1rem;
}

@media (max-width: 768px) {
  .content {
    padding: 0.5rem;
  }
}

:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  white-space: nowrap;
  padding: 12px 8px;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 12px 8px;
}

:deep(.p-column-filter) {
  width: 100%;
  font-size: 0.875rem;
}

:deep(.p-inputtext) {
  transition: border-color 0.2s ease;
}

:deep(.p-inputtext:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:deep(.p-datatable .p-datatable-filter-row > td) {
  padding: 8px;
  border-top: 1px solid #e5e7eb;
}

:deep(.p-button-sm) {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}
</style>
