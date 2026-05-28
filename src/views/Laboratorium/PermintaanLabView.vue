<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Silahkan menunggu...." />

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Permintaan pemeriksaan lab</h1>

          <p class="hero-description">
            "Daftar permintaan pemeriksaan lab dari seluruh unit pelayanan, digunakan untuk
            monitoring, verifikasi, dan tindak lanjut proses pemeriksaan."
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien }}</div>
          <div class="stat-label">Total Pasien</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienSelesai }}</div>
          <div class="stat-label">Selesai Dilayani</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienAktif }}</div>
          <div class="stat-label">Belum dilayani</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienProses }}</div>
          <div class="stat-label">Proses</div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <i class="pi pi-filter"></i>
          Filter & Pencarian
        </h3>
      </div>
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-plus"></i>
            Tanggal Mulai
          </label>
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            showIcon
            iconDisplay="input"
            @date-select="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-minus"></i>
            Tanggal Selesai
          </label>
          <DatePicker
            v-model="endDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            showIcon
            iconDisplay="input"
            @date-select="applyFilters"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-search"></i>
            Pencarian Global
          </label>
          <InputText
            v-model="globalFilter"
            @keyup="applyFilters"
            placeholder="Cari nama, NO MR, alamat..."
          />
        </div>
        <div class="filter-group">
          <Button label="Cari" icon="pi pi-search" @click="fetchData(1)" />
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="tabs-section">
      <div class="table-header">
        <h3 class="table-title">
          <i class="pi pi-list"></i>
          Daftar Permintaan Lab ({{ filteredData.length }})
        </h3>
        <div class="table-actions">
          <Button
            label="Semua"
            icon="pi pi-list"
            severity="warn"
            outlined
            size="small"
            @click="fetchDataWithStatus(null)"
          />
          <Button
            label="Selesai"
            icon="pi pi-check"
            severity="success"
            outlined
            size="small"
            @click="fetchDataWithStatus('C')"
          />
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            size="small"
            :loading="loading"
            @click="fetchData(1)"
          />
        </div>
      </div>

      <DataTable
        :value="filteredData"
        striped-rows
        paginator
        rowHover
        responsiveLayout="scroll"
        scrollable
        scrollHeight="65vh"
        :rows="25"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        size="small"
        class="elegant-datatable"
        tableStyle="min-width: 60rem"
        currentPageReportTemplate="{first}-{last} dari {totalRecords}"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      >
        <!-- Status -->
        <Column field="STATUS_PROGRESS" header="Status" style="width: 80px" frozen>
          <template #body="{ data }">
            <Tag
              :severity="getStatusColorClass(data.STATUS_PROGRESS)"
              :value="
                data.STATUS_PROGRESS === 'C'
                  ? 'Selesai'
                  : data.STATUS_PROGRESS === 'P'
                    ? 'Proses'
                    : 'Baru'
              "
              style="font-size: 0.68rem; padding: 2px 7px"
            />
          </template>
        </Column>

        <!-- Tanggal -->
        <Column field="TANGGAL" header="Tanggal" style="width: 90px" sortable>
          <template #body="{ data }">
            <span class="col-date">{{ formatDateTimeForAPI_V2(data.TANGGAL) }}</span>
          </template>
        </Column>

        <!-- No. Trans -->
        <Column field="TRANS" header="No. Trans" style="width: 130px" sortable>
          <template #body="{ data }">
            <span class="col-trans">{{ data.TRANS }}</span>
          </template>
        </Column>

        <!-- Pasien -->
        <Column field="NAMA" header="Informasi Pasien" style="min-width: 180px" sortable>
          <template #body="{ data }">
            <div class="patient-info">
              <div class="patient-header">
                <div class="patient-details">
                  <strong class="patient-name">
                    {{ data.NAMA }}
                    <i
                      :class="data.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                      :style="{
                        fontSize: '13px',
                        color: data.JENISKELAMIN === 'P' ? 'violet' : 'steelblue',
                      }"
                    ></i>
                  </strong>
                  <div class="patient-extra">{{ data.NOMR }}</div>
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- DPJP + Poli -->
        <Column field="DPJP" header="DPJP / Unit" style="min-width: 160px" sortable>
          <template #body="{ data }">
            <div class="address-info dpjp-block">
              <i class="pi pi-users" style="color: darkturquoise; margin-right: 8px"></i>
              <div>
                <span class="dpjp-nama">{{ data.DPJP }}</span>
                <span class="dpjp-poli">{{ data.POLI_RUANG }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Klinis -->
        <Column field="KLINIS" header="Klinis" style="min-width: 130px" sortable>
          <template #body="{ data }">
            <span class="col-klinis" :title="data.KLINIS">{{ data.KLINIS }}</span>
          </template>
        </Column>

        <!-- Jenis Rawat + Cara Bayar -->
        <Column field="JENISRAWAT" header="Rawat / CB" style="width: 120px">
          <template #body="{ data }">
            <div class="mr-badge rawat-block">
              <i class="pi pi-id-card" style="margin-right: 6px"></i>
              <div>
                <span class="rawat-jenis">{{ data.JENISRAWAT }}</span>
                <span class="rawat-cb">{{ data.CARABAYAR }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Timeline Waktu -->
        <Column header="Waktu Proses" style="width: 145px">
          <template #body="{ data }">
            <div class="col-timeline">
              <div v-if="data.MASUK" class="timeline-row">
                <i class="pi pi-sign-in timeline-icon icon-masuk"></i>
                <span>{{ data.MASUK }}</span>
              </div>
              <div v-if="data.PROSES" class="timeline-row">
                <i class="pi pi-cog timeline-icon icon-proses"></i>
                <span>{{ data.PROSES }}</span>
              </div>
              <div v-if="data.SELESAI" class="timeline-row">
                <i class="pi pi-check-circle timeline-icon icon-selesai"></i>
                <span>{{ data.SELESAI }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Aksi -->
        <Column header="Aksi" style="width: 160px; text-align: center" frozen alignFrozen="right">
          <template #body="{ data }">
            <div class="action-buttons">
              <Button
                icon="pi pi-vial"
                label="Spesimen"
                :severity="data.STTS_SPESIMEN === 'A' ? 'success' : 'secondary'"
                :outlined="data.STTS_SPESIMEN !== 'A'"
                size="small"
                class="specimen-action-button p-button-sm"
                v-tooltip.top="data.STTS_SPESIMEN === 'A' ? 'Spesimen Terisi' : 'Input Spesimen'"
                @click="CallSpesimenForm(data)"
              />
              <Button
                icon="pi pi-arrow-right"
                severity="info"
                size="small"
                outlined
                class="process-action-button p-button-sm"
                v-tooltip.top="'Proses Hasil Lab'"
                @click="prosesHasilLab(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="empty-state">
        <i class="pi pi-inbox empty-icon"></i>
        <h3 class="empty-title">Tidak Ada Data Permintaan Lab</h3>
        <p class="empty-description">
          Belum ada data permintaan pemeriksaan lab yang sesuai dengan filter yang dipilih. Coba
          ubah kriteria pencarian atau refresh data.
        </p>
      </div>
    </div>
  </div>

  <!-- ===== SPESIMEN DIALOG ===== -->
  <Dialog
    v-model:visible="showSpesimen"
    :style="{ width: '620px' }"
    :modal="true"
    :draggable="false"
    :closable="false"
  >
    <template #header>
      <div class="spesimen-dialog-header">
        <div class="spesimen-dialog-icon">
          <i class="fas fa-vial"></i>
        </div>
        <div class="spesimen-dialog-title">
          <span class="dialog-title-main">Input Spesimen Pasien</span>
          <span v-if="tempRowdata" class="dialog-title-sub">
            {{ tempRowdata?.NAMA }} &mdash; {{ tempRowdata?.NOMR }}
          </span>
        </div>
      </div>
    </template>

    <div class="spesimen-form">
      <!-- Patient Info Strip -->
      <div v-if="tempRowdata" class="patient-info-strip mb-3">
        <div class="pi-item">
          <span class="pi-label">No. Trans</span>
          <span class="pi-value mono">{{ tempRowdata.TRANS }}</span>
        </div>
        <div class="pi-item">
          <span class="pi-label">Unit / Poli</span>
          <span class="pi-value">{{ tempRowdata.POLI_RUANG }}</span>
        </div>
        <div class="pi-item">
          <span class="pi-label">DPJP</span>
          <span class="pi-value">{{ tempRowdata.DPJP }}</span>
        </div>
        <div class="pi-item">
          <span class="pi-label">Klinis</span>
          <span class="pi-value">{{ tempRowdata.KLINIS || '-' }}</span>
        </div>
      </div>

      <!-- Item Pemeriksaan -->
      <div class="spesimen-field-group mb-3">
        <label class="spesimen-label"> <i class="pi pi-list me-1"></i>Item Pemeriksaan </label>
        <div class="item-tags-wrap">
          <Tag
            v-for="(item, index) in itemPemeriksaan"
            :key="index"
            :value="item.NAMABARANG"
            severity="secondary"
            class="item-tag"
          />
          <span v-if="!itemPemeriksaan.length" class="no-items">Tidak ada item</span>
        </div>
      </div>

      <Divider />

      <!-- Jenis Spesimen -->
      <div class="spesimen-field-group mb-3">
        <label class="spesimen-label required">
          <i class="pi pi-tag me-1"></i>Jenis Spesimen
        </label>
        <MultiSelect
          v-model="spesimen.type"
          :options="spesimenTypeList"
          @change="get_by_kategori"
          placeholder="Pilih jenis spesimen..."
          optionLabel="label"
          :maxSelectedLabels="4"
          filter
          filterPlaceholder="Cari spesimen..."
          class="w-100"
        />
      </div>

      <!-- Metode Pengambilan -->
      <div class="spesimen-field-group mb-3">
        <label class="spesimen-label required">
          <i class="pi pi-cog me-1"></i>Metode Pengambilan
        </label>
        <MultiSelect
          v-model="spesimen.collectionMethod"
          :options="metodeList"
          placeholder="Pilih metode pengambilan..."
          optionLabel="display_id"
          :maxSelectedLabels="4"
          :loading="loadingMethod"
          class="w-100"
        />
        <small v-if="loadingMethod" class="loading-hint">
          <i class="pi pi-spin pi-spinner me-1"></i>Memuat metode...
        </small>
        <small v-else-if="!metodeList.length && spesimen.type?.length" class="hint-text">
          Pilih jenis spesimen terlebih dahulu untuk memuat metode
        </small>
      </div>

      <!-- Waktu Diterima -->
      <div class="spesimen-field-group">
        <label class="spesimen-label required">
          <i class="pi pi-clock me-1"></i>Waktu Diterima Spesimen
        </label>
        <DatePicker
          v-model="spesimen.receivedTime"
          showTime
          hourFormat="24"
          showIcon
          class="w-100"
          placeholder="Pilih tanggal & waktu..."
        />
      </div>
    </div>

    <template #footer>
      <div class="spesimen-footer">
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showSpesimen = false"
        />
        <Button
          label="Simpan Spesimen"
          icon="pi pi-save"
          severity="success"
          :loading="loading"
          @click="simpanSpesimen"
        />
      </div>
    </template>
  </Dialog>

  <Toast />
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

import { useRouter } from 'vue-router'

const router = useRouter()

const showSpesimen = ref(false)

const spesimen = reactive({
  type: ref([]), // Kode SNOMED jenis spesimen
  collectedDateTime: null,
  collectionMethod: ref([]),
  receivedTime: new Date(),
})

const tempRowdata = ref(null)
const CallSpesimenForm = (row) => {
  tempRowdata.value = row
  showSpesimen.value = true

  SelectedSpesimen()

  getItemPemeriksaanLab(row.TRANS)
}

const metodeList = ref([])

const loading = ref(false)
const fact = ref([])
const globalFilter = ref('')
const startDate = ref(new Date())
const endDate = ref(new Date())

// ✅ FIX 1: Computed property for filtered data
const filteredData = computed(() => {
  return fact.value.filter((item) => {
    // Filter by global search
    if (globalFilter.value) {
      const searchTerm = globalFilter.value.toLowerCase()
      const matchesSearch =
        (item.NAMA_PASIEN || '').toLowerCase().includes(searchTerm) ||
        (item.NOMR || '').toLowerCase().includes(searchTerm) ||
        (item.NAMA || '').toLowerCase().includes(searchTerm) ||
        (item.ALAMAT || '').toLowerCase().includes(searchTerm) ||
        (item.DPJP || '').toLowerCase().includes(searchTerm)

      if (!matchesSearch) return false
    }

    // Filter by date range
    if (startDate.value && endDate.value && item.TANGGAL) {
      const itemDate = new Date(item.TANGGAL)
      const start = new Date(startDate.value)
      const end = new Date(endDate.value)

      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)

      if (itemDate < start || itemDate > end) return false
    }

    return true
  })
})

// ✅ FIX 2: Corrected computed properties
const totalPasien = computed(() => fact.value.length)

const pasienSelesai = computed(() => {
  return fact.value.filter((p) => p.STATUS_PROGRESS === 'C').length
})

const pasienProses = computed(() => {
  return fact.value.filter((p) => p.STATUS_PROGRESS === 'P').length
})

const pasienAktif = computed(() => {
  return fact.value.filter((p) => p.STATUS_PROGRESS !== 'C').length
})

const rataKunjungan = computed(() => 0)

// Helper functions
const getStatusColorClass = (s) => {
  const key = String(s || '').toUpperCase()
  switch (key) {
    case 'M':
      return 'warn'
    case 'C':
      return 'success'
    default:
      return 'bg-gray-400'
  }
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

const itemPemeriksaan = ref([])

const getItemPemeriksaanLab = async (noreceipt) => {
  try {
    loading.value = true

    itemPemeriksaan.value = []

    const payload = {
      RECEIPT_NO: noreceipt,
      IDCLIENT: id_client.value,
      MODE: 'RCPT',
      TGLMIN: '',
      TGLMAX: '',
      MEMBERSHIP: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/bill`, payload)

    //itemPemeriksaan.value = response.data.response || []
    itemPemeriksaan.value = (response.data.response || []).filter(
      (item) => item.KATEGORI?.toUpperCase() === 'LABORATORIUM',
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    showError(error.message)
  } finally {
    loading.value = false
  }
}

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

// ✅ FIX 3: Date formatting functions
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

const formatDateTimeForAPI_V2 = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return ` ${day}/${month}/${year}`
  } catch (error) {
    return null
  }
}

const listReceipts = ref([])
// ✅ FIX 4: Fetch data functions
const fetchData = async (mode, stts = null, nomr = null) => {
  try {
    loading.value = true

    const payload = {
      id_client: id_client.value,
      kategori: 'LABORATORIUM',
      mode: mode,
      status: stts,
      nomr: nomr,
      tanggal: formatDateOnlyForAPI(startDate.value),
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_list_labor_dan_radiologiv2`,
      payload,
    )

    // Set data + tambah field STTS_SPESIMEN = 'N'
    fact.value = (response.data.response || []).map((item) => ({
      ...item,
      STTS_SPESIMEN: 'N', // field baru
    }))

    listReceipts.value = fact.value.map((item) => item.TRANS)
    await get_list_spesimen()

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
    showError(error.message)
  }
}

const prosesHasilLab = (noreceipt) => {
  if (noreceipt.STTS_SPESIMEN != 'A') {
    showWarning('Data ini belum memiliki Spesimen Pemeriksaan, silahkan input data spesimen')
    return
  }

  const routeData = router.resolve({
    name: 'ProsesLabView',
    params: {
      noreceipt: noreceipt.TRANS, // <-- ini benar
    },
  })

  window.open(routeData.href, '_blank')
}
const simpanSpesimen = async () => {
  try {
    //loading.value = true

    const payload = {
      id_client: id_client.value,
      receipt_no: tempRowdata.value.TRANS,
      tanggal: formatDateTimeForAPI(spesimen.receivedTime),
      spesimen: spesimen,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/penunjang/simpan_trans_spesimen`,
      payload,
    )

    if (response.data.code == 200) {
      showSuccess(response.data.message)

      fact.value.forEach((element) => {
        const found = element.TRANS === tempRowdata.value.TRANS
        if (found) {
          element.STTS_SPESIMEN = 'A'
        }
      })
    } else {
      showWarning(response.data.message)
    }

    showSpesimen.value = false

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false

    showError(error.message)
  }
}

const get_list_spesimen_list = ref([])
const get_list_spesimen = async () => {
  try {
    //loading.value = true

    const payload = {
      receipts: listReceipts.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/get_spesimen`, payload)

    get_list_spesimen_list.value = response.data || []

    fact.value.forEach((element) => {
      const found = get_list_spesimen_list.value.find((x) => x.receipt_no === element.TRANS)
      if (found) {
        element.STTS_SPESIMEN = 'A'
      }
    })

    showSpesimen.value = false

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false

    showError(error.message)
  }
}

// Date formatting
const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
}

const spesimenTypeList = ref([])

const spesimenType = async () => {
  try {
    loading.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/specimen_type`)

    spesimenTypeList.value = response.data || []
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
    showError(error.message)
  }
}

const loadingMethod = ref(false)

const selectedSpesimenList = ref([])

const SelectedSpesimen = async () => {
  try {
    loading.value = true
    const payload = {
      kategori: spesimen.kategori,
      id_client: id_client.value,
      receipt_no: tempRowdata.value.TRANS,
    }

    spesimen.type = []
    spesimen.collectionMethod = []
    metodeList.value = []

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/spesimen_selected`, payload)

    if (response.data.type?.length > 0) {
      response.data.type.forEach((element) => {
        const found = spesimenTypeList.value.find((x) => x.snomed_code === element.snomed_code)
        if (found) {
          // console.log('data spesimen saved', response.data.type[0].waktu_terima_spesimen)
          spesimen.type.push(found)
          spesimen.receivedTime = response.data.type[0].waktu_terima_spesimen
        }
      })
      await get_by_kategori(spesimen.type)
    }

    if (response.data.collectionMethod?.length > 0) {
      response.data.collectionMethod.forEach((element) => {
        const found = metodeList.value.find((x) => x.snomed_code === element.snomed_code)
        if (found) {
          spesimen.collectionMethod.push(found)
        }
      })
    }

    loading.value = false
  } catch (error) {
    loading.value = false
    showError(error)
  }
}

const get_by_kategori = async (selected) => {
  ///methode
  try {
    const list = Array.isArray(selected) ? selected : selected.value

    if (!Array.isArray(list)) {
      console.error('Bukan array:', selected)
      return
    }

    metodeList.value = []

    spesimen.kategori = list.map((item) => item.kategori)

    loadingMethod.value = true

    if (spesimen.kategori.length == 0) {
      loadingMethod.value = false
      return
    }

    const payload = {
      kategori: spesimen.kategori,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/get_by_kategori`, payload)

    metodeList.value = response.data || []
    loadingMethod.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loadingMethod.value = false
    showError(error.message)
  }
}

const fetchDataWithStatus = (status) => {
  globalFilter.value = ''
  fetchData(1, status)
}

// ✅ FIX 5: Apply filters trigger
const applyFilters = () => {
  // This will automatically trigger the computed property update
}

onMounted(() => {
  fetchData(1)
  spesimenType()
})
</script>

<style scoped>
/* ====== Spesimen Dialog ====== */
.spesimen-dialog-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.spesimen-dialog-icon {
  width: 38px;
  height: 38px;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}
.dialog-title-main {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--p-text-color);
}
.dialog-title-sub {
  display: block;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin-top: 1px;
}
.patient-info-strip {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
}
.pi-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pi-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
}
.pi-value {
  font-size: 0.8rem;
  color: var(--p-text-color);
  font-weight: 500;
}
.pi-value.mono {
  font-family: monospace;
  color: var(--p-primary-color);
}
.spesimen-form {
  padding: 0.25rem 0;
}
.spesimen-field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.spesimen-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--p-text-color);
  display: flex;
  align-items: center;
}
.spesimen-label.required::after {
  content: *;
  color: #ef4444;
  margin-left: 3px;
}
.hint-text {
  color: var(--p-text-muted-color);
  font-size: 0.72rem;
}
.loading-hint {
  color: var(--p-primary-color);
  font-size: 0.72rem;
}
.item-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.5rem 0.65rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  min-height: 38px;
  align-items: center;
}
.item-tag {
  font-size: 0.72rem !important;
}
.no-items {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  font-style: italic;
}
.spesimen-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}

/* ====== Table Section ====== */
.tabs-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.07);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.table-title .pi {
  color: #3b82f6;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

/* ====== Elegant DataTable ====== */
:deep(.elegant-datatable .p-datatable-thead > tr > th) {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f8fafc;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
  color: #475569;
}

:deep(.elegant-datatable .p-datatable-tbody > tr > td) {
  padding: 0.85rem 1rem;
  font-size: 0.84rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

:deep(.elegant-datatable .p-datatable-tbody > tr) {
  transition: all 0.2s ease;
}

:deep(.elegant-datatable .p-datatable-tbody > tr:hover > td) {
  background: #f8fafc;
}

:deep(.elegant-datatable .p-paginator) {
  border-top: 1px solid #e2e8f0;
  padding: 0.6rem 0.75rem;
  font-size: 0.82rem;
}

:deep(.elegant-datatable .p-tag) {
  font-size: 0.68rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
}

/* ====== Patient Info ====== */
.patient-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.patient-name {
  color: #2563eb;
  font-size: 0.88rem;
  display: block;
}

.patient-extra {
  color: #9ca3af;
  font-size: 0.78rem;
}

/* ====== Address / DPJP Info ====== */
.address-info {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 0.84rem;
}

.dpjp-block {
  align-items: flex-start;
}

.dpjp-nama {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: steelblue;
}

.dpjp-poli {
  display: block;
  font-size: 0.72rem;
  color: #9ca3af;
}

/* ====== Mr Badge / Rawat ====== */
.mr-badge {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  padding: 0.4rem 0.7rem;
  border-radius: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.82rem;
}

.rawat-block {
  align-items: flex-start;
  background: transparent;
  padding: 0;
}

.rawat-jenis {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
}

.rawat-cb {
  display: block;
  font-size: 0.7rem;
  color: #9ca3af;
}

/* ====== Shared Column Styles ====== */
.col-date {
  font-size: 0.76rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.col-trans {
  font-family: monospace;
  font-size: 0.73rem;
  color: var(--p-primary-color);
  font-weight: 600;
}

.col-klinis {
  font-size: 0.76rem;
  color: var(--p-text-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.col-timeline {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: var(--p-text-muted-color);
}

.timeline-icon {
  font-size: 0.62rem;
}

.icon-masuk {
  color: var(--p-primary-400);
}

.icon-proses {
  color: #f59e0b;
}

.icon-selesai {
  color: #22c55e;
}

/* ====== Action Buttons ====== */
.action-buttons {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
}

.specimen-action-button,
.process-action-button {
  min-width: 84px;
  padding: 0.35rem 0.7rem !important;
  font-size: 0.72rem;
  font-weight: 600;
}

/* ====== Empty State ====== */
.empty-state {
  text-align: center;
  padding: 3.5rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1.25rem;
  opacity: 0.25;
  display: block;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.92rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

/* ====== Legacy ====== */
/* Compact table styling */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 1rem;
}

/* Hover effect */
.table-orange tbody tr:hover {
  background-color: #faf3eb !important;
  transition: background-color 0.2s ease;
}

.table-orange thead th {
  background-color: #fff4e0;
  color: #663c00;
  font-weight: 600;
  border-bottom: 2px solid #faf3eb;
}

.table-orange td,
.table-orange th {
  border-color: #faf3eb;
}

.table-compact td,
.table-compact th {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  vertical-align: middle !important;
  font-size: 0.8rem;
  line-height: 1.2;
}

.table-orange {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(15px);
  border-radius: 4px;
  padding: 1.5rem;
  min-width: 180px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filter Section */
.filter-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 5px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header {
  display: flex;
}

.card-body {
  overflow: auto;
}
</style>
