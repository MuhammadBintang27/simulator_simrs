<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Pendaftaran Pasien Operasi</h1>
          <p class="hero-description">
            Pendaftaran pasien operasi dilakukan sebagai langkah awal sebelum tindakan bedah. Proses
            ini mencakup pengisian data identitas pasien, riwayat kesehatan, diagnosa medis, serta
            jenis operasi yang akan dilakukan. Selain itu, pasien atau keluarga akan diberikan
            penjelasan mengenai prosedur operasi, risiko, dan persetujuan tindakan medis. Data
            pendaftaran ini menjadi dasar untuk perencanaan jadwal operasi, persiapan ruang bedah,
            serta koordinasi antar unit terkait seperti dokter bedah, anestesi, dan perawat.
          </p>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ 0 }}</div>
          <div class="stat-label">Total Beban Operasional</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ 0 }}</div>
          <div class="stat-label">Total Pendapatan</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ 0 }}</div>
          <div class="stat-label">Laba Bersih</div>
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
            <i class="pi pi-search"></i>
            Pencarian Global
          </label>
          <InputText v-model="globalFilter" placeholder="Cari nama, NO MR, alamat..." />
        </div>

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
          />
        </div>

        <div class="filter-group">
          <div>
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              style="width: 10em"
              @click="fetchData"
              class="round-button2"
              size="small"
            />
            <Button
              icon="pi pi-plus"
              label="Daftar"
              style="width: 10em"
              @click="fetchData"
              class="round-button2 ml-1"
              size="small"
            />
          </div>
        </div>
        <div class="filter-group"></div>
      </div>
    </div>

    <Panel class="mt-2">
      <DataTable
        :value="fact"
        paginator
        :rows="5"
        responsiveLayout="scroll"
        :rowsPerPageOptions="[5, 10, 20]"
        sortMode="multiple"
        showGridlines
        scrollable
        scrollHeight="500px"
      >
        <Column field="nomorrm" header="No. RM" sortable />
        <Column field="nama" header="Nama Pasien" sortable />
        <Column field="jeniskelamin" header="JK" sortable />
        <Column field="usia" header="Usia" sortable />
        <Column field="alamat" header="Alamat" />
        <Column field="kodebooking" header="Kode Booking" />
        <Column field="jenistindakan" header="Kode Tindakan" />
        <Column field="tindakan" header="Nama Tindakan" />
        <Column field="namapoli" header="Poli" sortable />
        <Column field="dokter" header="Dokter" />
        <Column field="tanggaloperasi" header="Tanggal Operasi" :body="formatDate" sortable />
        <Column field="jam" header="Jam" />
        <Column field="terlaksana" header="Status" />
        <Column field="" header="Aksi">
          <template #body="slotProps">
            <div class="flex inline">
              <Button icon="pi pi-pencil" @click="fetchData" class="round-button2" size="small" />
              <Button
                icon="pi pi-arrow-right"
                label=""
                @click="lakukan_persiapan(slotProps.data)"
                class="round-button2"
                size="small"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </Panel>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

import { useRouter } from 'vue-router'

const router = useRouter()

const configStore = useConfigStore() // ✅ Define configStore properly

import DatePicker from 'primevue/datepicker'

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

const startDate = ref(null)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const lakukan_persiapan = (status) => {
  console.log(status)
  const routeData = router.resolve({
    name: 'PersiapanOperasiVIew',
    params: { id: status.NOPENDAFTARAN },
    query: {
      noreg: status.noregister,
      kodebooking: status.kodebooking,
      nomr: status.nomorrm,
      /* any query params */
    },
  })
  window.open(routeData.href, '_blank')
  // Or with named route:
  // router.push({ name: 'AboutPage' })
  //  localStorage.setItem('datapasienpoli', JSON.stringify({ id: 1, name: 'Zafira' }))
}

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: 'Message Content',
    life: 3000,
  })
}

const formatDate = (rowData) => {
  const date = new Date(rowData.tanggaloperasi)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fact = ref([])

const fetchData = async () => {
  try {
    const param = {
      tanggalawal: '2022-11-22',
      tanggalakhir: '2022-11-22',
      id_client: id_client.value,
      mode: 3,
    }

    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Mobil_jkn/getjadwaloperasi_v3`, param) // ✅ Cleaner syntax

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
  border-radius: 5px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(6, 182, 212, 0.3);
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
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.8rem;
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
  min-width: 160px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.diet-patient-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  color: #2c3e50;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
}

.page-title i {
  margin-right: 10px;
}

.page-subtitle {
  color: #7f8c8d;
  margin: 10px 0 0 0;
  font-size: 1.1rem;
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

/* Custom DataTable Styling */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: linear-gradient(135deg, #619e6f 100%);
  color: rgb(255, 255, 255);
  font-weight: 600;
  border: 1px solid #71b280;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f8f9fa;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #e3f2fd;
}

:deep(.p-card) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.5rem; /* default sekitar 0.5rem, diperbesar */
}
</style>
