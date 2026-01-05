<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Daftar Diet Pasien</h1>
          <p class="hero-description">
            Sistem manajemen diet pasien untuk monitoring dan pelaporan kebutuhan nutrisi pasien di
            rumah sakit dengan jadwal harian yang terorganisir dan terintegrasi
          </p>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPatients }}</div>
          <div class="stat-label">Total Pasien</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ totalDietTypes }}</div>
          <div class="stat-label">Jenis Diet</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ completedDiets }}</div>
          <div class="stat-label">Diet Selesai</div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="ChangeProgressFlg"
      modal
      :header="rowSelected?.NAMA"
      :style="{ width: '400px' }"
      class="patient-detail-dialog"
    >
      <div class="flex">
        <Button
          label="Menunggu"
          icon="pi pi-clock"
          severity="warning"
          style="width: 100%"
          class="mb-2"
          @click="change_status_progress_trans('M')"
        />
        <br />
        <Button
          label="Proses"
          icon="pi pi-spinner pi-spin"
          severity="info"
          style="width: 100%"
          class="mb-2"
          @click="change_status_progress_trans('P')"
        />
        <br />
        <Button
          label="Selesai"
          icon="pi pi-check-circle"
          severity="success"
          style="width: 100%"
          class="mb-2"
          @click="change_status_progress_trans('C')"
        />
      </div>
    </Dialog>
    <Panel class="mt-1">
      <template #header><h6>FILTER</h6></template>
      <div class="row">
        <div class="col-md-3">
          <label class="filter-label">
            <i class="pi pi-search"></i>
            Pencarian
          </label>
          <InputText
            v-model="filters['global'].value"
            placeholder="Cari pasien, diet, atau dokter..."
            class="search-input"
          />
        </div>

        <div class="col-md-2">
          <label class="filter-label">Tanggal</label>
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal"
            showIcon
            iconDisplay="input"
            style="width: 100%"
          />
        </div>

        <div class="col-md-2">
          <label class="filter-label">Pilih Jadwal</label>
          <Select
            v-model="selectedWilayah"
            :options="wilayahOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Jadwal"
            style="width: 100%"
            showClear
          />
        </div>

        <div class="col-md-2">
          <label class="filter-label">Ruang</label>

          <MultiSelect
            v-model="ruanganSelected"
            :options="list_ruangan"
            optionLabel="NAMA"
            optionValue="KODE"
            placeholder="Pilih Jadwal"
            style="width: 100%"
            display="chip"
            showClear
            filter
          />
        </div>

        <div class="col-md-2">
          <Button
            class="mt-4 round-button2"
            @click="fetchData()"
            icon="pi pi-refresh"
            label="Refresh"
            :loading="loading"
          />
        </div>
      </div>
    </Panel>
    <div class="row mt-1">
      <div class="col-md-9">
        <Panel>
          <template #header><h6>RINCIAN DIET</h6></template>
          <template #icons>
            <Button
              icon="fa-solid fa-file-pdf"
              severity="secondary"
              label="Cetak Daftar Diet"
              class="round-button2 mr-1"
              @click="donwloadEtiket('list_diet')"
            />
            <Button
              icon="fa-solid fa-file-pdf"
              severity="secondary"
              label="Etiket"
              class="round-button2"
              style="background-color: brown; color: wheat"
              @click="donwloadEtiket('etiket')"
            />
          </template>
          <DataTable
            :value="fact"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            stripedRows
            showGridlines
            responsiveLayout="scroll"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
            :globalFilterFields="['NAMA', 'NOMR', 'DPJP', 'DIET', 'POLI_RUANG']"
            v-model:filters="filters"
          >
            <Column field="#" header="#" sortable style="width: 60px">
              <template #body="slotProps">
                <span class="nomr-text">{{ slotProps.index + 1 }}</span>
              </template>
            </Column>

            <Column field="NAMA" header="Nama Pasien" sortable style="min-width: 150px">
              <template #body="{ data }">
                <div class="patient-info hover-grow">
                  <div class="patient-name">{{ data.NAMA || '-' }} - {{ data.NOMR || '-' }}</div>
                  <small class="patient-address">{{ data.ALAMAT || '-' }}</small>
                </div>
              </template>
            </Column>

            <Column field="STATUS_PROGRESS" header="Status" style="min-width: 100px">
              <template #body="{ data }">
                <div class="status-badge hover-grow" @click="changeStatusProgres(data)">
                  <i :class="getStatusIcon(data.STATUS_PROGRESS)"></i>
                  <span>{{ getStatusText(data.STATUS_PROGRESS) }}</span>
                </div>
                <small> {{ data.SELESAI }}</small>
              </template>
            </Column>

            <Column field="DIET" header="Diet" style="min-width: 250px">
              <template #body="{ data }">
                <div class="diet-tags">
                  <Tag
                    v-for="(item, index) in formatDiet(data.DIET)"
                    :key="index"
                    :value="item"
                    class="diet-tag ml-1 mt-1"
                    severity="info"
                  />
                </div>
                <small>{{ data.TRANS }}</small>
              </template>
            </Column>

            <Column field="DPJP" header="DPJP" sortable style="min-width: 150px">
              <template #body="{ data }">
                <div class="doctor-info">
                  <i class="pi pi-user-md doctor-icon"></i>
                  <span>{{ data.DPJP || '-' }}</span>
                </div>
              </template>
            </Column>

            <Column field="POLI_RUANG" header="Ruangan" sortable style="min-width: 120px">
              <template #body="{ data }">
                <Tag :value="data.POLI_RUANG || '-'" severity="success" />
              </template>
            </Column>

            <Column field="CARABAYAR" header="Cara Bayar" sortable style="min-width: 100px">
              <template #body="{ data }">
                <Tag
                  :value="data.CARABAYAR || '-'"
                  :severity="data.CARABAYAR === 'BPJS' ? 'info' : 'secondary'"
                />
              </template>
            </Column>

            <Column field="TANGGAL" header="Tanggal" sortable style="min-width: 130px">
              <template #body="{ data }">
                <div class="date-info">
                  <div class="date-text">{{ formatDate(data.TANGGAL) }}</div>
                  <small class="time-text">{{ formatTime(data.TANGGAL) }}</small>
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="empty-state">
                <i class="pi pi-inbox empty-icon"></i>
                <p class="empty-text">Tidak ada data diet pasien</p>
              </div>
            </template>
          </DataTable>
        </Panel>
      </div>

      <div class="col-md-3">
        <Panel>
          <template #header>
            <h5 class="panel-title">
              <i class="pi pi-chart-pie mr-2"></i>
              REKAP DIET
            </h5>
          </template>

          <DataTable
            :value="dataRekapDiet"
            stripedRows
            showGridlines
            responsiveLayout="scroll"
            size="small"
          >
            <Column field="NAMA" header="Ruangan" sortable>
              <template #body="{ data }">
                <div class="recap-item">{{ data.NAMA || '-' }}</div>
              </template>
            </Column>

            <Column field="REMARK_ITEM" header="Jadwal" sortable>
              <template #body="{ data }">
                <Tag
                  :value="data.REMARK_ITEM || '-'"
                  :severity="getScheduleSeverity(data.REMARK_ITEM)"
                  size="small"
                />
              </template>
            </Column>

            <Column field="JUMLAH" header="Jumlah" sortable style="width: 80px">
              <template #body="{ data }">
                <div class="count-badge">{{ data.JUMLAH || 0 }}</div>
              </template>
            </Column>

            <template #empty>
              <div class="empty-state-small">
                <i class="pi pi-info-circle"></i>
                <p>Belum ada data rekap</p>
              </div>
            </template>
          </DataTable>
        </Panel>
      </div>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

import axios from 'axios'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// Reactive data
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const ruanganSelected = ref(null)
const list_ruangan = ref([])

const get_nama_ruangan = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/1/${id_client.value}`,
    )
    list_ruangan.value = response.data
  } catch (error) {
    console.error('Error fetching rooms:', error)
  }
}

const startDate = ref(new Date())
const selectedWilayah = ref(null)
const loading = ref(false)
const fact = ref([])
const dataRekapDiet = ref([])

const wilayahOptions = ref([
  { label: 'PAGI', value: 'PAGI' },
  { label: 'SIANG', value: 'SIANG' },
  { label: 'MALAM', value: 'MALAM' },
])

const donwloadEtiket = async (jenis_dokumen) => {
  const formattedDate = formatDateForAPI(startDate.value)

  loading.value = true

  const param = {
    id_client: id_client.value,
    mode: 5,
    shif: selectedWilayah.value,
    tanggal: formattedDate,
    jenis_penunjang: 5,
    kd_unit: ruanganSelected.value,
    jenis_dokumen: jenis_dokumen,
  }

  ChangeProgressFlg.value = false

  const url = configStore.laravel

  // const plainParam = JSON.parse(JSON.stringify(param))
  const response = await axios.post(`${url}/getdata_print_out_list_diet`, param)
  loading.value = false

  if (response.data.success) {
    window.open(response.data.url, '_blank')
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Gagal',
      detail: `Gagal Memuat data`,
      life: 3000,
    })
  }
}

const rowSelected = ref(null)

const changeStatusProgres = (data) => {
  ChangeProgressFlg.value = true
  rowSelected.value = data
}

const ChangeProgressFlg = ref(false)

const change_status_progress_trans = async (status) => {
  const param = {
    id_client: id_client.value,
    status: status,
    receipt_no: rowSelected.value.TRANS,
  }

  ChangeProgressFlg.value = false

  const url = configStore.apiApotikUrl
  const response = await axios.post(
    `${url}/index.php/api/Data_referensi/change_status_progress_trans`,
    param,
  )

  if (response.data.metadata.code == 200) {
    const itemIndex = fact.value.findIndex((item) => item.TRANS === rowSelected.value.TRANS)
    if (itemIndex !== -1) {
      fact.value[itemIndex].STATUS_PROGRESS = status // atau nilai yang sesuai
    }
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `${response.data.metadata.message} `,
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Berhasil',
      detail: `${response.data.metadata.message} `,
      life: 3000,
    })
  }
  console.log(response.data)
}

// Computed properties for statistics
const totalPatients = computed(() => fact.value.length)

const totalDietTypes = computed(() => {
  const dietSet = new Set()
  fact.value.forEach((item) => {
    if (item.DIET) {
      item.DIET.split(',').forEach((diet) => {
        dietSet.add(diet.trim())
      })
    }
  })
  return dietSet.size
})

const completedDiets = computed(
  () => fact.value.filter((item) => item.STATUS_PROGRESS === 'S').length,
)

// Utility functions
const formatDiet = (dietString) => {
  if (!dietString) return ['Tidak ada diet']
  return dietString
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'

    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch (error) {
    return '-'
  }
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'

    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return '-'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'M':
      return 'pi pi-clock status-waiting'
    case 'C':
      return 'pi pi-check-circle status-done'
    case 'P':
      return 'pi pi-spinner pi-spin'
    default:
      return 'pi pi-question-circle status-unknown'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'M':
      return 'Menunggu'
    case 'C':
      return 'Selesai'
    case 'P':
      return 'Proses'
    default:
      return 'Unknown'
  }
}

const getScheduleSeverity = (schedule) => {
  switch (schedule?.toUpperCase()) {
    case 'PAGI':
      return 'success'
    case 'SIANG':
      return 'warning'
    case 'MALAM':
      return 'info'
    default:
      return 'secondary'
  }
}

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

// API functions
const fetchData = async () => {
  try {
    loading.value = true

    const formattedDate = formatDateForAPI(startDate.value)
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
      mode: 5,
      jenis_penunjang: 5,
      shif: selectedWilayah.value,
      tanggal: formattedDate,
      kd_unit: ruanganSelected.value,
    }

    fact.value = []
    dataRekapDiet.value = []

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/Data_referensi/getlist_penunjang_order_jasa_penunjang`,
      param,
    )

    console.log(response.data)

    if (response.data && response.data.response) {
      fact.value = [...response.data.response]
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `Data berhasil dimuat: ${fact.value.length} pasien`,
        life: 3000,
      })
    } else {
      fact.value = []
      toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Tidak ada data untuk tanggal dan jadwal yang dipilih',
        life: 3000,
      })
    }

    await rekapData()
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data. Silakan coba lagi.',
      life: 3000,
    })
    fact.value = []
  } finally {
    loading.value = false
  }
}

const rekapData = async () => {
  try {
    const formattedDate = formatDateForAPI(startDate.value) || formatDateForAPI(new Date())

    const param = {
      id_client: id_client.value,
      mode: 1,
      jenis_penunjang: 5,
      shif: selectedWilayah.value,
      tanggal: formattedDate,
      kd_unit: ruanganSelected.value,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/Data_referensi/rekap_diet_pasien`,
      param,
    )

    if (response.data && response.data.response) {
      dataRekapDiet.value = [...response.data.response]
    } else {
      dataRekapDiet.value = []
    }
  } catch (error) {
    console.error('Error fetching recap data:', error)
    dataRekapDiet.value = []
  }
}

// Lifecycle
onMounted(() => {
  // Auto load data on mount with current date
  // fetchData()
  get_nama_ruangan()
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #134e5e 0%, #059669 100%);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  color: white;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.2);
}

.hover-grow {
  cursor: pointer; /* hand cursor */
  transition: transform 0.1s ease-in-out;
}

.hover-grow:hover {
  transform: scale(1.1); /* grow 10% on hover */
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1rem;
  min-width: 140px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.filter-label i {
  margin-right: 0.5rem;
  color: #6b7280;
}

.search-input {
  width: 100%;
}

.panel-title {
  margin: 0;
  color: #374151;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.nomr-text {
  font-weight: 600;
  color: #3498db;
}

.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.patient-address {
  color: #6c757d;
  font-size: 0.85rem;
}

.diet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.diet-tag {
  margin-bottom: 4px;
  font-size: 0.75rem;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doctor-icon {
  color: #3498db;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.time-text {
  color: #6c757d;
  font-size: 0.85rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  font-size: 0.85rem;
}

.status-waiting {
  color: #f39c12;
}
.status-done {
  color: #27ae60;
}
.status-process {
  color: #3498db;
}
.status-unknown {
  color: #95a5a6;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  color: #bdc3c7;
  margin-bottom: 15px;
  display: block;
}

.empty-text {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
}

.empty-state-small {
  text-align: center;
  padding: 20px;
  font-size: 0.85rem;
  color: #6c757d;
}

.empty-state-small i {
  font-size: 1.5rem;
  margin-bottom: 8px;
  display: block;
}

.empty-state-small p {
  margin: 0;
}

.recap-item {
  font-weight: 500;
  color: #374151;
}

.count-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-align: center;
  font-size: 0.85rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-stats {
    justify-content: center;
  }

  .stat-card {
    min-width: 120px;
  }
}
</style>
