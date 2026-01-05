<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Silahkan menunggu...." />
    <div class="card">
      <div class="card-header">
        <h4><i class="fas fa-file-invoice-dollar mr-2"></i> Stock Opname</h4>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <label class="block mb-2 font-weight-bold mr-2">Bulan : </label>
        <DatePicker
          v-model="bulanThn"
          dateFormat="mm/yy"
          view="month"
          placeholder="Pilih bulan tahun"
        />
        <Button label="Refresh" class="ml-2" severity="warn" @click="fetchData">
          <template #icon>
            <i class="fa-solid fa-refresh fa-lg"></i>
          </template>
        </Button>
      </div>
      <div class="card-body">
        <DataTable
          v-model:filters="filters"
          v-model:expandedRows="expandedRows"
          :value="fact"
          striped-rows
          showGridlines
          paginator
          rowHover
          responsiveLayout="scroll"
          scrollable
          scrollHeight="70vh"
          :rowClass="rowClassFn"
          :rows="25"
          :rowsPerPageOptions="[5, 10, 20, 25, 50, 100]"
          @filter="onFilter"
          tableStyle="min-width: 50rem"
          filterDisplay="row"
          :globalFilterFields="['BARCODE', 'BARCODE_NAMA', 'KATEGORI', 'QTY', 'FISIK', 'TOTAL']"
        >
          <Column field="BARCODE_NAMA" header="Nama Barang" sortable filter>
            <template #filter>
              <InputText
                style="width: 100%"
                v-model="filters.BARCODE_NAMA.value"
                placeholder="Cari Nama..."
                class="p-column-filter"
              />
            </template>

            <template #body="{ data }">
              <strong>{{ data.NAMA }} ({{ data.SATUAN }})</strong><br />
              {{ data.IDBARANG }} - BTCH : {{ data.BATCH_NUMBER }}
            </template>
          </Column>

          <!-- KATEGORI -->
          <Column field="KATEGORI" header="Kategori" style="max-width: 13em" filter sortable>
          </Column>

          <!-- FISIK -->
          <Column
            field="QTY"
            header="QTY SISTEM"
            sortable
            style="max-width: 15em; text-align: center"
            filter
          >
            <!-- FILTER DROPDOWN -->
            <template #filter="{ filterModel }">
              <MultiSelect
                v-model="filterModel.value"
                :options="qtyList"
                placeholder="Filter Total"
                class="p-column-filter"
                :filter="true"
              />
            </template>

            <!-- BODY TEMPLATE UNTUK FORMAT ANGGKA -->
            <template #body="{ data }">
              {{ formatInteger(data.QTY) }}
            </template>
          </Column>
          <Column field="FISIK" header="FISIK" style="width: 1em" sortable filter>
            <template #body="{ data }">
              <InputText
                v-model="data.FISIK"
                type="number"
                :class="{ 'soft-blue-bg': data.FISIK > 0 }"
              />
            </template>
          </Column>

          <!-- TOTAL -->
          <!-- <Column field="TOTAL" header="TOTAL" sortable filter>
            <template #filter="{ filterModel }">
              <MultiSelect
                v-model="filterModel.value"
                :options="totalList"
                placeholder="Filter Total"
                class="p-column-filter"
                :filter="true"
              />
            </template>
          </Column> -->
          <Column field="TGL_EXPIRED" header="EXP" sortable filter></Column>
          <Column field="HARGA" header="HARGA" sortable filter></Column>
          <Column field="TOTAL" header="TOTAL" sortable filter></Column>
        </DataTable>
      </div>
    </div>
  </div>
  <Toast />
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { FilterMatchMode } from '@primevue/core/api'

import DatePicker from 'primevue/datepicker'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi } = storeToRefs(authStore)

const toast = useToast()
const loading = ref(false)
const fact = ref([])

const bulanThn = ref(new Date())

const rowClassFn = (rowData) => {
  if (rowData.FISIK > 0) {
    return 'soft-blue-row'
  }
  return ''
}

/* --------------------------------
    BUILD FILTER OPTION LISTS
----------------------------------*/
const barcodeList = ref([])
const barcodeNamaList = ref([])
const kategoriList = ref([])
const fisikList = ref([])
const totalList = ref([])
const qtyList = ref([])
const expandedRows = ref([]) // required untuk row expansion
/* Fetch Data */
const fetchData = async () => {
  try {
    loading.value = true

    const response = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/barang/getdatabarang_foropname_v2`,
      { mode: 1, id_client: id_client.value, lokasi: id_lokasi.value },
    )

    console.log(response.data)

    fact.value = response.data.response ?? []
    // Build dropdown filter options
    barcodeList.value = [...new Set(fact.value.map((x) => x.BARCODE))]
    barcodeNamaList.value = [...new Set(fact.value.map((x) => x.BARCODE_NAMA))]
    kategoriList.value = [...new Set(fact.value.map((x) => x.KATEGORI))]
    fisikList.value = [...new Set(fact.value.map((x) => x.FISIK))]
    totalList.value = [...new Set(fact.value.map((x) => x.TOTAL))]
    qtyList.value = [...new Set(fact.value.map((x) => formatInteger(x.QTY)))]
    loading.value = false
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data' })
  } finally {
    loading.value = false
  }
}

// ⚡ Expand semua row otomatis
const expandAll = () => {
  expandedRows.value = fact.value.reduce((acc, item) => {
    acc[item.BARCODE] = true
    return acc
  }, {})
}

/* ----------------------------
   PRIMEVUE MULTISELECT FILTER
-----------------------------*/
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  BARCODE: { value: null, matchMode: FilterMatchMode.IN },
  BARCODE_NAMA: { value: null, matchMode: FilterMatchMode.CONTAINS },
  KATEGORI: { value: null, matchMode: FilterMatchMode.IN },
  FISIK: { value: null, matchMode: FilterMatchMode.IN },
  TOTAL: { value: null, matchMode: FilterMatchMode.IN },
  QTY: { value: null, matchMode: FilterMatchMode.IN },
})

const TempfilteredData = ref([])

const onFilter = (event) => {
  TempfilteredData.value = event.filteredValue || []
}

const formatCurrency = (value) => {
  if (value == null || value === '') return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    // currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
const formatInteger = (value) => {
  if (value == null || value === '') return '-'

  const num = parseInt(value, 10)
  if (isNaN(num)) return '-'

  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(num)
}
onMounted(async () => {
  await fetchData()
  // if (fact.value.length > 0) expandAll()
})
</script>
<style scoped>
/* Warna baris selang-seling oranye dan putih */
.table-orange.table-striped tbody tr:nth-of-type(odd) {
  background-color: #fffaf5; /* putih-oranye lembut */
}

:deep(.soft-blue-row) {
  background-color: rgba(173, 216, 230, 0.4) !important;
}

:deep(.soft-blue-row:hover) {
  background-color: rgba(173, 216, 230, 0.6) !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 1rem;
}

.table-orange.table-striped tbody tr:nth-of-type(even) {
  background-color: #faf3eb; /* oranye muda */
}

/* Efek hover */
.table-orange tbody tr:hover {
  background-color: #faf3eb !important; /* oranye sedikit lebih gelap */
  transition: background-color 0.2s ease;
}

/* Header */
.table-orange thead th {
  background-color: #fff4e0;
  color: #663c00;
  font-weight: 600;
  border-bottom: 2px solid #faf3eb;
}

/* Tambahan opsional: garis tabel lembut */
.table-orange td,
.table-orange th {
  border-color: #faf3eb;
}

/* === Baris lebih rapat (compact mode) === */
.table-compact td,
.table-compact th {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  vertical-align: middle !important;
  font-size: 0.8rem; /* opsional: sedikit kecil agar rapi */
  line-height: 1.2;
}

/* (Opsional) Sudut lembut */
.table-orange {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
