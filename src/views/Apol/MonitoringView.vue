<template>
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-shopping-cart"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Apotek Online/Monitoring</h1>
          <p class="hero-description">
            Form ini digunakan untuk memantau status klaim obat kronis peserta BPJS. Melalui
            tampilan ini, user dapat dengan mudah mengetahui klaim mana yang sudah diproses maupun
            yang belum diajukan atau masih tertunda. Sudah diproses → klaim obat kronis telah
            diverifikasi/dibayarkan oleh BPJS. Belum diproses → klaim masih menunggu pengajuan,
            verifikasi, atau sedang dalam proses pemeriksaan. Dengan adanya form ini, proses
            pemantauan klaim menjadi lebih transparan, cepat, dan akurat, sehingga memudahkan
            fasilitas kesehatan dalam mengelola klaim obat kronis peserta BPJS.
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ jumlahdata }}</div>
          <div class="stat-label">Jumlah data</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalbiayapengajuan }}</div>
          <div class="stat-label">Total Biaya Pengajuan</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalbiayasetuju }}</div>
          <div class="stat-label">Total Biaya Disetujui</div>
        </div>
      </div>
    </div>

    <!-- Filter Form Card -->
    <div class="filter-card">
      <div class="filter-grid">
        <!-- Bulan -->
        <div class="filter-field">
          <label for="bulan" class="field-label">
            <i class="pi pi-calendar"></i>
            Bulan
            <span class="required">*</span>
          </label>
          <DatePicker
            v-model="filters.bulan"
            view="month"
            dateFormat="mm/yy"
            placeholder="Pilih Bulan"
            showIcon
            :iconDisplay="'input'"
            :manualInput="false"
            class="w-full"
          />
        </div>

        <!-- Jenis Obat -->
        <div class="filter-field">
          <label for="jenisObat" class="field-label">
            <i class="pi pi-tag"></i>
            Jenis Obat
          </label>
          <Select
            id="jenisObat"
            v-model="filters.jenisObat"
            :options="jenisObatOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Jenis Obat"
            class="w-full"
          />
        </div>

        <!-- Status -->
        <div class="filter-field">
          <label for="status" class="field-label">
            <i class="pi pi-check-square"></i>
            Status Verifikasi
          </label>
          <Select
            id="status"
            v-model="filters.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Status"
            class="w-full"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <Button
          label="Lakukan pencarian"
          icon="pi pi-search"
          @click="applyFilter"
          :disabled="!isFormValid"
          :loading="loading"
        />
        <Button
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          @click="resetFilter"
          outlined
        />
      </div>
    </div>

    <div class="filter-card mt-2">
      <DataTable
        :value="fact"
        :paginator="true"
        :rows="20"
        responsiveLayout="scroll"
        showGridlines
        :sortField="'nama'"
        :sortOrder="1"
        striped-rows
      >
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px">
            <span style="margin-left: auto; font-weight: 500"> Total: {{ fact.length }} </span>
          </div>
        </template>
        <Column field="#" header="#" filter>
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>
        <Column field="nosepaasal" header="SEP" sortable style="min-width: 120px" />
        <Column field="nosepapotek" header="SJP" sortable style="min-width: 120px" />
        <Column field="nmjnsobat" header="JENIS" sortable filter style="min-width: 200px" />
        <Column field="harga" header="BIAYA PENGAJUAN" sortable filter style="min-width: 120px">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.biayapengajuan) }}
          </template>
        </Column>
        <Column field="harga" header="BIAYA SETUJUI" sortable filter style="min-width: 120px">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.biayasetujui) }}
          </template>
        </Column>

        <Column field="tglpelayanan" header="TGL" filter style="min-width: 100px">
          <template #body="slotProps">
            {{ slotProps.data.tglpelayanan }}
          </template>
        </Column>
        <Column field="nokapst" header="NO BPJS" filter style="min-width: 100px">
          <template #body="slotProps">
            {{ slotProps.data.nokapst }}
          </template>
        </Column>
        <Column field="nmpst" header="PASIEN" filter style="min-width: 100px">
          <template #body="slotProps">
            {{ slotProps.data.nmpst }}
          </template>
        </Column>
        <Column field="Cttn" header="Catatan" filter style="min-width: 150px">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.catatan" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import axios from 'axios'

// Stores
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

// State
const loading = ref(false)
const fact = ref([])

const totalbiayasetuju = ref(0)
const totalbiayapengajuan = ref(0)
const jumlahdata = ref(0)

// Filter state
const filters = ref({
  bulan: null,
  jenisObat: '0',
  status: '1',
})

// Applied filters
const appliedFilters = ref(null)

// Options
const jenisObatOptions = [
  { value: '0', label: 'Semua' },
  { value: '1', label: 'Obat PRB' },
  { value: '2', label: 'Obat Kronis Belum Stabil' },
  { value: '3', label: 'Obat Kemoterapi' },
]

const statusOptions = [
  { value: '0', label: 'Belum Diverifikasi' },
  { value: '1', label: 'Sudah Verifikasi' },
]

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

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format helpers
const formatMonth = (date) => {
  if (!date) return '-'
  const month = date.getMonth() + 1
  return month.toString().padStart(2, '0')
}

const formatYear = (date) => {
  if (!date) return '-'
  return date.getFullYear().toString()
}

// Form validation
const isFormValid = computed(() => {
  return filters.value.bulan
})

// Apply filter
const applyFilter = async () => {
  if (!isFormValid.value) {
    showWarning('Bulan dan Tahun wajib diisi!')
    return
  }

  loading.value = true

  appliedFilters.value = {
    bulan: formatMonth(filters.value.bulan),
    tahun: formatYear(filters.value.bulan),
    jenisObat: filters.value.jenisObat,
    status: filters.value.status,
    id_client: id_client.value,
  }

  const url = configStore.apiBaseUrl
  const response = await axios.post(
    `${url}/index.php/api/bpjs_api/klaim_monitoringApol`,
    appliedFilters.value,
  )

  console.log('data response', response.data)

  if (response.data.metaData.code !== 200) {
    showError(response.data.metaData.message)
    loading.value = false
    return
  }
  jumlahdata.value = response.data.response.jumlahdata
  totalbiayapengajuan.value = response.data.response.totalbiayapengajuan
  totalbiayasetuju.value = response.data.response.totalbiayasetuju
  fact.value = [...response.data.response.listsep]

  loading.value = false

  console.log(response.data)
}

// Reset filter
const resetFilter = () => {
  filters.value = {
    bulan: null,
    jenisObat: '0',
    status: '1',
  }
  appliedFilters.value = null
  showSuccess('Filter berhasil direset!')
}
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

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0;
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
  font-size: 0.91rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.custom-textarea {
  font-size: 14px !important;
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  padding: 12px !important;
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
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 2rem;
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

/* Filter Card */
.filter-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Filter Field */
.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  color: #134e5e;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.field-label i {
  color: #134e5e;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  padding: 0.75rem 2rem;
  font-weight: 600;
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

/* Responsive Design */
@media (max-width: 768px) {
  .filter-card {
    padding: 1rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-description {
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons :deep(button) {
    width: 100%;
  }
}
</style>
