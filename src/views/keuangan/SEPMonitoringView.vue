<template>
  <div class="content">

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-shield"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Monitoring SEP</h1>
          <p class="hero-description">
            Pemantauan dan pengecekan status SEP (Surat Eligibilitas Peserta) secara otomatis untuk
            memastikan seluruh SEP masih aktif dan valid.
          </p>
        </div>
        <div class="hero-actions">
          <MultiSelect
            v-model="selectedClients"
            :options="clientOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih ID Client"
            display="chip"
            :maxSelectedLabels="3"
            style="min-width: 180px"
          />
          <Button
            label="Refresh Data"
            icon="pi pi-refresh"
            severity="secondary"
            @click="fetchData"
            :loading="loading"
            :disabled="loading || loadingCheckSEP"
          />
          <Button
            label="Mulai Scan SEP"
            icon="pi pi-search"
            @click="loopPengecheckanSEP"
            :loading="loadingCheckSEP"
            :disabled="loading || loadingCheckSEP || filteredItems.length === 0 || selectedClients.length === 0"
          />
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ items.length }}</div>
          <div class="stat-label">Total SEP</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ filteredItems.length }}</div>
          <div class="stat-label">Akan Discan</div>
        </div>
        <div class="stat-card" v-if="scanStarted">
          <div class="stat-value">{{ doneScan }}</div>
          <div class="stat-label">Sudah Discan</div>
        </div>
        <div class="stat-card" v-if="scanStarted">
          <div class="stat-value">{{ filteredItems.length - doneScan }}</div>
          <div class="stat-label">Sisa</div>
        </div>
        <div class="stat-card" v-if="scanStarted && !loadingCheckSEP">
          <div class="stat-value" :style="{ color: listRespons.length > 0 ? '#fca5a5' : '#86efac' }">
            {{ listRespons.length }}
          </div>
          <div class="stat-label">Bermasalah</div>
        </div>
      </div>
    </div>

    <!-- Progress Section -->
    <div v-if="scanStarted" class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <i class="pi pi-spin pi-spinner" v-if="loadingCheckSEP"></i>
          <i class="pi pi-check-circle" v-else style="color: #16a34a"></i>
          {{ loadingCheckSEP ? 'Sedang Memproses...' : 'Scan Selesai' }}
        </h3>
        <div class="flex align-items-center gap-2">
          <span v-if="loadingCheckSEP" style="font-size: 0.8rem; color: #64748b">
            {{ doneScan }} / {{ filteredItems.length }}
          </span>
          <Tag v-if="loadingCheckSEP" severity="info" :value="nosepSedangSign" />
        </div>
      </div>
      <ProgressBar :value="progress" />

      <div
        v-if="!loadingCheckSEP && listRespons.length === 0"
        style="margin-top: 1rem"
      >
        <Message severity="success" :closable="false">
          Semua SEP aktif — tidak ada yang bermasalah
        </Message>
      </div>
    </div>

    <!-- Table Section -->
    <div v-if="listRespons.length > 0" class="tabs-section">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">
            <i class="pi pi-list"></i>
            SEP Bermasalah ({{ listRespons.length }})
          </h3>
          <div class="table-actions">
            <Button
              icon="pi pi-file-excel"
              label="Export Excel"
              severity="success"
              outlined
              size="small"
              @click="exportToExcel"
            />
          </div>
        </div>

        <DataTable
          :value="listRespons"
          stripedRows
          showGridlines
          size="small"
          ref="dt"
          tableStyle="min-width: 30rem"
          paginator
          :rows="25"
          :rowsPerPageOptions="[25, 50, 100]"
        >
          <Column header="No" style="width: 4rem; text-align: center">
            <template #body="{ index }">{{ index + 1 }}</template>
          </Column>
          <Column field="sep" header="No. SEP" />
          <Column field="metadata" header="Keterangan">
            <template #body="{ data }">
              <Tag severity="danger" :value="data.metadata || '-'" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const configStore = useConfigStore()

const clientOptions = [
  { label: 'Client 7', value: '7' },
  { label: 'Client 8', value: '8' },
  { label: 'Client 11', value: '11' },
]
const selectedClients = ref(['7', '8', '11'])

const items = ref([])
const loading = ref(false)
const dt = ref(null)

const filteredItems = computed(() => {
  if (!selectedClients.value || selectedClients.value.length === 0) return []
  return items.value.filter((item) => selectedClients.value.includes(String(item.ID_CLIENT)))
})

const loadingCheckSEP = ref(false)
const scanStarted = ref(false)
const progress = ref(0)
const doneScan = ref(0)
const nosepSedangSign = ref(null)
const listRespons = ref([])

async function fetchData() {
  loading.value = true
  scanStarted.value = false
  listRespons.value = []
  progress.value = 0
  doneScan.value = 0
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/check_sep_exit`)
    items.value = response.data
  } catch (error) {
    console.error('Gagal memuat data SEP:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

const loopPengecheckanSEP = async () => {
  loadingCheckSEP.value = true
  scanStarted.value = true
  listRespons.value = []
  progress.value = 0
  doneScan.value = 0

  await nextTick()

  const total = filteredItems.value.length

  for (const element of filteredItems.value) {
    nosepSedangSign.value = element.NOSEP
    await checkSEPAktif(element.NOSEP, element.ID_CLIENT)

    doneScan.value++
    progress.value = Math.round((doneScan.value / total) * 100)
  }

  loadingCheckSEP.value = false
  nosepSedangSign.value = null
}

const checkSEPAktif = async (nosep, idClient) => {
  try {
    const payload = { id_client: idClient, nosep }
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/check_stts_sep_aktif`,
      payload,
    )
    if (response.data?.metadata?.toLowerCase() !== 'sukses') {
      listRespons.value.push(response.data)
    }
  } catch (error) {
    console.error('Error cek SEP:', error)
  }
}

function exportToExcel() {
  if (!dt.value) return
  dt.value.exportCSV()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  margin-bottom: 0.75rem;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba(14, 165, 233, 0.25);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.6rem;
  font-size: 1.2rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.75rem;
  opacity: 0.85;
  line-height: 1.4;
  margin: 0;
}

.hero-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hero-stats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(15px);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  min-width: 90px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.1rem;
}

.stat-label {
  font-size: 0.65rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Filter / Progress Section */
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
  margin-bottom: 1rem;
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

/* Table Section */
.tabs-section {
  background: white;
  border-radius: 1px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-container {
  padding: 0.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.01em;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
