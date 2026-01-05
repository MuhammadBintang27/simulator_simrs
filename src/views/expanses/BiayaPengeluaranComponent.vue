<template>
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Biaya Pengeluaran</h1>
          <p class="hero-description">
            Untuk biaya pengeluaran, baik yang berkaitan dengan kendaraan maupun non-kendaraan.
            Deskripsi ini bisa digunakan dalam laporan keuangan, aplikasi manajemen rental mobil,
            atau dokumentasi internal
            <Button
              class="round-button"
              small
              label="more..."
              @click="showDialogMore = true"
              style="background-color: #06b6d4"
            ></Button>
          </p>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(summary.total_biaya) }}</div>
          <div class="stat-label">Total Pengeluaran</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatCurrency(summary.total_pengeluaran_kendaraan) }}</div>
          <div class="stat-label">Pengeluaran Kendaraan</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">
            {{ formatCurrency(summary.total_pengeluaran_non_kendaraan) }}
          </div>
          <div class="stat-label">Pengeluaran Non Kendaraan</div>
        </div>
      </div>
    </div>

    <!-- Enhanced Filter Panel -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <i class="pi pi-filter"></i>
          Filter & Pencarian
        </h3>

        <div>
          <Button
            label="Tambah"
            icon="pi pi-plus"
            severity="warn"
            class="round-button2"
            @click="addNewPengeluaran = true"
            size="small"
          />
        </div>
      </div>

      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar"></i>
            TANGGAL MULAI
          </label>
          <DatePicker
            v-model="form.startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            class="modern-datepicker"
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-plus"></i>
            TANGGAL SELESAI
          </label>
          <DatePicker
            v-model="form.endDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            class="modern-datepicker"
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="filter-group search-group">
          <Button
            icon="pi pi-search"
            label="Cari Data"
            class="search-button"
            :disabled="!isFormValid || loading"
            @click="fetchData"
            :loading="loading"
            size="large"
          />
        </div>
      </div>
    </div>

    <!-- Add Expense Dialog -->
    <Dialog
      v-model:visible="addNewPengeluaran"
      modal
      header="Pengeluaran"
      :style="{ width: '40rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      class="expense-dialog"
    >
      <div class="p-grid">
        <div class="p-col-12 p-md-12 form-field">
          <label for="jenis_akun">Akun Pengeluaran</label>
          <Select
            id="jenis_akun"
            filter
            v-model="form.AkunSelected"
            :options="template_biaya"
            placeholder="Pilih akun pengeluaran"
            optionLabel="akun"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex items-center">
                <Tag
                  v-if="slotProps.option.jenis_pengeluaran == 1"
                  severity="info"
                  :value="slotProps.option.caption"
                >
                </Tag>
                <Tag
                  v-if="slotProps.option.jenis_pengeluaran == 2"
                  severity="success"
                  :value="slotProps.option.caption"
                ></Tag>
                <strong>{{ slotProps.option.akun }}</strong>
                <small>
                  <div style="white-space: normal; width: 500px; overflow-wrap: break-word">
                    {{ slotProps.option.deskripsi }}
                  </div>
                </small>
              </div>
            </template>
          </Select>
        </div>

        <div class="p-col-12 p-md-12 form-field mt-3">
          <label for="biaya">Biaya (Rp)</label><br />
          <InputNumber v-model="form.biaya" :min="0" id="biaya" placeholder="Masukkan biaya" />
        </div>

        <div class="p-col-12 p-md-12 mt-3" v-if="form.AkunSelected?.jenis_pengeluaran == 1">
          <label for="unit">Pilih unit*</label>
          <Select
            id="unit"
            filter
            v-model="form.UnitSelected"
            :options="master_unit"
            optionLabel="desc"
            placeholder="Pilih unit kendaraan"
            class="w-full"
          >
            <template #option="slotProps">
              <div class="flex items-center">
                <div>
                  <strong>{{ slotProps.option.desc }}</strong>
                </div>
                <small>
                  <Tag severity="warn" :value="slotProps.option.no_pol"></Tag>
                </small>
              </div>
            </template>
          </Select>
        </div>

        <div class="p-col-12 p-md-12 form-field mt-3">
          <label for="tanggal">Tanggal Transaksi</label><br />
          <DatePicker
            id="tanggal"
            v-model="tanggal_trans"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal transaksi"
            class="modern-datepicker"
            showIcon
            iconDisplay="input"
          />
        </div>

        <div class="p-col-12 p-md-12 form-field mt-3">
          <label for="catatan">Deskripsi</label><br />
          <InputText
            id="catatan"
            v-model="form.deskripsi"
            placeholder="Deskripsi (opsional)"
            class="p-inputtext w-full"
          />
        </div>
      </div>

      <template #footer>
        <hr />
        <Button
          label="Tutup"
          icon="pi pi-times"
          @click="addNewPengeluaran = false"
          class="p-button-text"
        />
        <Button
          label="Simpan"
          icon="pi pi-save"
          @click="simpan_data_pengeluaran()"
          class="p-button round-button2"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- Info Dialog -->
    <Dialog
      v-model:visible="showDialogMore"
      modal
      header="Deskripsi Biaya Pengeluaran"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      class="expense-dialog"
    >
      <div class="dialog-content">
        <h6>
          Berikut adalah contoh deskripsi umum untuk biaya pengeluaran, baik yang berkaitan dengan
          kendaraan maupun non-kendaraan. Deskripsi ini bisa digunakan dalam laporan keuangan,
          aplikasi manajemen rental mobil, atau dokumentasi internal.
        </h6>
        <h3>1. Pengeluaran Kendaraan</h3>
        <ul>
          <li>
            <strong>Biaya Servis Berkala:</strong>
            Pengeluaran untuk servis rutin kendaraan seperti ganti oli, tune-up, pemeriksaan rem,
            dan perawatan mesin lainnya guna menjaga performa kendaraan tetap optimal.
          </li>
          <li>
            <strong>Biaya Perbaikan:</strong>
            Pengeluaran untuk perbaikan akibat kerusakan atau kecelakaan, termasuk penggantian suku
            cadang dan tenaga kerja bengkel.
          </li>
          <li>
            <strong>Biaya Cuci Kendaraan:</strong>
            Biaya rutin untuk mencuci kendaraan agar tetap bersih dan layak pakai bagi pelanggan.
          </li>
          <li>
            <strong>Biaya Ganti Ban/Aki:</strong>
            Pengeluaran untuk penggantian ban yang aus atau aki yang sudah tidak layak pakai.
          </li>
          <li>
            <strong>Biaya Bahan Bakar (jika ditanggung perusahaan):</strong>
            Pengeluaran untuk pengisian bahan bakar kendaraan yang digunakan dalam operasional
            tertentu.
          </li>
          <li>
            <strong>Biaya Pajak dan STNK:</strong>
            Pembayaran pajak tahunan kendaraan dan perpanjangan STNK.
          </li>
        </ul>

        <h3>2. Pengeluaran Non-Kendaraan</h3>
        <ul>
          <li>
            <strong>Biaya Listrik dan Air:</strong>
            Pengeluaran untuk kebutuhan utilitas kantor atau garasi operasional.
          </li>
          <li>
            <strong>Biaya Sewa Tempat:</strong>
            Biaya sewa kantor, garasi, atau lahan parkir kendaraan.
          </li>
          <li>
            <strong>Biaya Gaji Karyawan:</strong>
            Gaji untuk staf operasional, administrasi, dan sopir (jika ada).
          </li>
          <li>
            <strong>Biaya ATK dan Keperluan Kantor:</strong>
            Pengeluaran untuk alat tulis kantor, tinta printer, kertas, dan kebutuhan administrasi
            lainnya.
          </li>
          <li>
            <strong>Biaya Internet dan Komunikasi:</strong>
            Pengeluaran untuk paket internet dan pulsa telepon guna menunjang komunikasi bisnis.
          </li>
          <li>
            <strong>Biaya Promosi dan Pemasaran:</strong>
            Biaya untuk iklan online/offline, brosur, dan kegiatan pemasaran lainnya.
          </li>
          <li>
            <strong>Biaya Sistem dan Aplikasi:</strong>
            Langganan aplikasi manajemen rental, domain, hosting, atau software pendukung lainnya.
          </li>
          <li>
            <strong>Biaya Transportasi Umum/Operasional:</strong>
            Pengeluaran transportasi untuk keperluan operasional di luar penggunaan kendaraan
            rental.
          </li>
        </ul>
      </div>

      <template #footer>
        <Button
          label="Tutup"
          icon="pi pi-times"
          @click="showDialogMore = false"
          class="p-button-text"
        />
      </template>
    </Dialog>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog />

    <!-- Data Table -->
    <DataTable
      :value="filteredFact"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      selectionMode="multiple"
      dataKey="id"
      removableSort
      showGridlines
      stripedRows
      responsiveLayout="scroll"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <h6 class="m-0">Transaksi Pengeluaran</h6>
            <Button
              label=""
              icon="pi pi-download"
              style="background-color: green"
              class="round-button2"
              @click="exportToExcel"
              size="small"
            />
          </div>

          <!-- Global Search -->
          <div class="flex justify-between items-center mt-2">
            <div class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText
                v-model="globalFilter"
                placeholder="Cari transaksi..."
                class="search-input"
              />
            </div>
          </div>
        </div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

      <Column field="id" header="No" sortable style="width: 5rem">
        <template #body="{ index }">
          {{ index + 1 }}
        </template>
      </Column>

      <Column field="trans_id" header="Transaction ID" sortable>
        <template #body="{ data }">
          <Tag
            :severity="data.jenis_pengeluaran == 1 ? 'info' : 'success'"
            :value="data.trans_id"
          />
        </template>
      </Column>

      <Column field="akun" header="Akun" sortable>
        <template #body="{ data }">
          <div class="max-w-xs truncate" :title="data.akun">
            {{ data.akun }}
          </div>
        </template>
      </Column>

      <Column field="deskripsi" header="Deskripsi" sortable>
        <template #body="{ data }">
          {{ data.deskripsi || '-' }}
        </template>
      </Column>

      <Column field="tanggal" header="Tanggal" sortable>
        <template #body="{ data }">
          {{ data.tanggal }}
        </template>
      </Column>

      <Column field="biaya" header="Biaya" sortable>
        <template #body="{ data }">
          <div class="font-semibold text-green-600" style="text-align: right" v-if="data.biaya < 0">
            <span style="color: red">
              {{ formatCurrency(data.biaya) }}
            </span>
          </div>
          <div class="font-semibold text-green-600" style="text-align: right" v-else>
            <span>
              {{ formatCurrency(data.biaya) }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="no_pol" header="No Polisi" sortable>
        <template #body="{ data }">
          {{ data.no_pol || '-' }}
        </template>
      </Column>

      <Column header="Actions" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-outlined p-button-danger p-button-sm round-button2"
              @click="confirmDeleteTransaction(data)"
              :loading="deletingTransactionId === data.id"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">
            {{
              globalFilter
                ? 'Tidak ada transaksi yang cocok dengan pencarian.'
                : 'Tidak ada transaksi ditemukan.'
            }}
          </p>
        </div>
      </template>
    </DataTable>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'

import * as XLSX from 'xlsx' //npm install xlsx

const configStore = useConfigStore()
const confirm = useConfirm()
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
const toast = useToast()
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const loading = ref(false)
const deletingTransactionId = ref(null)

const showDialogMore = ref(false)
const globalFilter = ref('')
const addNewPengeluaran = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return form.startDate && form.endDate && form.id_client > 0
})

// Global search computed property
const filteredFact = computed(() => {
  if (!globalFilter.value) {
    return fact.value
  }

  const searchTerm = globalFilter.value.toLowerCase()
  return fact.value.filter((item) => {
    return (
      (item.trans_id && item.trans_id.toLowerCase().includes(searchTerm)) ||
      (item.akun && item.akun.toLowerCase().includes(searchTerm)) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm)) ||
      (item.no_pol && item.no_pol.toLowerCase().includes(searchTerm)) ||
      (item.tanggal && item.tanggal.toLowerCase().includes(searchTerm)) ||
      (item.biaya && item.biaya.toString().includes(searchTerm))
    )
  })
})

const summary = ref({
  total_pengeluaran_kendaraan: 0,
  total_pengeluaran_non_kendaraan: 0,
  total_biaya: 0,
})

const currentDate = new Date()

const form = reactive({
  AkunSelected: null,
  biaya: 0,
  UnitSelected: null,
  tanggal: currentDate,
  deskripsi: '-',
  id_client: id_client.value,
  user_id: user_id.value,
  mode: 1,
  startDate: currentDate,
  endDate: currentDate,
})

const resetForm = () => {
  form.AkunSelected = null
  form.biaya = 0
  form.UnitSelected = null
  form.tanggal = currentDate
  form.deskripsi = '-'
  form.id_client = id_client.value
  form.user_id = user_id.value
  form.mode = 1
  form.startDate = currentDate
  form.endDate = currentDate
}

const fact = ref([])
const tanggal_trans = ref(currentDate)

const showToast = (type = 'success', summary = 'Success', detail = 'Data berhasil dimuat') => {
  toast.add({
    severity: type,
    summary,
    detail,
    life: 3000,
  })
}

const simpan_data_pengeluaran = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    form.tanggal = formatDate(tanggal_trans.value)

    const response = await axios.post(`${url}/utilitas/simpan_pengeluaran`, form)
    if (response.data.code == 200) {
      showToast('success', 'Success', 'Berhasil tersimpan')
      addNewPengeluaran.value = false
      resetForm()
      await fetchData()
    } else {
      showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data')
    }
  } catch (error) {
    console.error('Error saving data:', error)
    showToast('error', 'Error', 'Terjadi kesalahan pada server')
  } finally {
    loading.value = false
  }
}

const confirmDeleteTransaction = (transaction) => {
  confirm.require({
    message: `Apakah Anda yakin ingin menghapus transaksi ${transaction.trans_id}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Batal',
      severity: 'secondary',
      class: 'round-button2',
      outlined: true,
    },
    acceptProps: {
      label: 'Hapus',
      class: 'round-button2',
      severity: 'danger',
    },
    accept: () => {
      deleteTransaction(transaction)
    },
    reject: () => {
      showToast('info', 'Dibatalkan', 'Penghapusan transaksi dibatalkan')
    },
  })
}

const deleteTransaction = async (transaction) => {
  try {
    deletingTransactionId.value = transaction.id
    const url = configStore.apiBaseUrl

    const response = await axios.post(`${url}/utilitas/remove_data_trans_pengeluaran`, {
      trans_id: transaction.trans_id,
      id_client: id_client.value,
      deskripsi: 'salah input',
      user_id: user_id.value,
    })

    if (response.data.code == 200) {
      showToast('success', 'Berhasil', 'Transaksi berhasil dihapus')
      await fetchData()
    } else {
      showToast('error', 'Gagal', response.data.message)
    }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    showToast('error', 'Error', 'Terjadi kesalahan pada server')
  } finally {
    deletingTransactionId.value = null
  }
}

const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const params = {
      id_client: id_client.value,
      start: formatDate(form.startDate),
      end: formatDate(form.endDate),
    }

    const response = await axios.post(`${url}/utilitas/get_data_pengeluaran`, params)

    fact.value = [...response.data.response]
    summary.value = response.data.summary
  } catch (error) {
    console.error('Error fetching data:', error)
    showToast('error', 'Error', 'Terjadi kesalahan saat memuat data')
  } finally {
    loading.value = false
  }
}

const exportToExcel = () => {
  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Convert JSON to worksheet
  const ws = XLSX.utils.json_to_sheet(fact.value)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'BiayaPengeluaran.xlsx')
}

const master_unit = ref([])

const getMasterUnit = async () => {
  try {
    const url = configStore.apiBaseUrl
    const param = {
      id_client: id_client.value,
      mode: 1,
    }
    const response = await axios.post(`${url}/v1/get_master_unit`, param)
    master_unit.value = [...response.data.response]
  } catch (error) {
    console.error('Error fetching master unit:', error)
    showToast('error', 'Error', 'Terjadi kesalahan saat memuat data unit')
  }
}

const template_biaya = ref([])

const getTemplate = async () => {
  try {
    const url = configStore.apiBaseUrl
    const param = {
      id_client: id_client.value,
    }
    const response = await axios.post(`${url}/report/get_data_pengeluaran`, param)
    template_biaya.value = [...response.data.response]
  } catch (error) {
    console.error('Error fetching template:', error)
    showToast('error', 'Error', 'Terjadi kesalahan saat memuat template')
  }
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

onMounted(() => {
  getTemplate()
  getMasterUnit()
})
</script>

<style scoped>
/* Global Styles */
.content {
  margin: 0 auto;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  /* min-height: 100vh; */
}

.expense-dialog-container {
  padding: 1rem;
}

.dialog-content {
  line-height: 1.6;
  color: #374151;
}

.dialog-content h2 {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.dialog-content h3 {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  padding: 0.5rem 0;
  border-left: 4px solid #06b6d4;
  padding-left: 1rem;
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%);
}

.dialog-content ul {
  margin: 1rem 0;
  padding-left: 0;
  list-style: none;
}

.dialog-content li {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #06b6d4;
  transition: all 0.2s ease;
}

.dialog-content li:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.dialog-content strong {
  color: #1f2937;
  font-weight: 600;
}

/* Hero Section - Compact Version */
.hero-section {
  background: linear-gradient(135deg, #06b6d4 0%, #1e40af 100%);
  border-radius: 5px;
  padding: 1.5rem; /* Reduced from 2.5rem */
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(6, 182, 212, 0.3);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem; /* Reduced from 1.5rem */
  margin-bottom: 1.5rem; /* Reduced from 2rem */
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px; /* Reduced from 16px */
  padding: 1rem; /* Reduced from 1.5rem */
  /* font-size: 2rem; */
}

.hero-title {
  font-size: 2rem; /* Reduced from 2.5rem */
  font-weight: 700;
  margin: 0 0 0.25rem 0; /* Reduced bottom margin */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 1rem; /* Reduced from 1.1rem */
  opacity: 0.9;
  line-height: 1.5; /* Reduced from 1.6 */
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 1.5rem; /* Reduced from 2rem */
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px; /* Reduced from 12px */
  padding: 1rem; /* Reduced from 1.5rem */
  min-width: 160px; /* Reduced from 180px */
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 1.3rem; /* Reduced from 1.5rem */
  font-weight: 700;
  margin-bottom: 0.25rem; /* Reduced from 0.5rem */
}

.stat-label {
  font-size: 0.8rem; /* Reduced from 0.9rem */
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 5px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.search-group {
  display: flex;
  align-items: end;
}

.search-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.search-button:hover:not(:disabled) {
  /* transform: translateY(-2px); */
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* Tabs Section */
.tabs-section {
  background: white;
  border-radius: 5px;
  overflow: hidden;
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); */
  border: 1px solid #e2e8f0;
}

.modern-tabs :deep(.p-tablist) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  font-weight: 500;
  border-radius: 3px;
  transition: all 0.3s ease;
}

/* Table Styles */
.table-container {
  padding: 0.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.modern-datatable {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.license-plate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.duration-info {
  display: flex;
  flex-direction: column;
}

.duration-value {
  font-weight: 600;
  color: #1e293b;
}

.duration-unit {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
}

.amount-container {
  text-align: right;
}

.amount-value {
  font-weight: 700;
  font-size: 1.1rem;
}

/* .amount-value.positive {
  color: #059669;
} */

.amount-value.negative {
  color: #dc2626;
}

.status-tag {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

/* Table Footer */
.table-footer {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-top: 2px solid #e2e8f0;
  padding: 0;
}

.footer-content {
  padding: 2rem;
}

.total-summary {
  display: flex;
  justify-content: center;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.summary-card.income {
  border-left: 4px solid #10b981;
}

.summary-icon {
  background: #10b981;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.summary-label {
  font-size: 0.9rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.summary-amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10b981;
}

/* Tab Content Placeholder */
.tab-content-placeholder {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #cbd5e1;
}

.tab-content-placeholder h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.tab-content-placeholder p {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 2rem auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 1.75rem; /* Reduced for mobile */
  }

  .hero-stats {
    justify-content: center;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
  }
}

/* PrimeVue Component Overrides */
:deep(.modern-select .p-select) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.footer-summary {
  display: flex;
  justify-content: center;
}

.summary-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 120px;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 23px;
  font-weight: 700;
  color: #374151;
}

.summary-value.income {
  color: #059669;
}

.summary-value.outcome {
  color: #dc2626;
}

.summary-value.positive {
  color: #059669;
}

:deep(.modern-select .p-select:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.modern-datepicker .p-datepicker-input) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.modern-datepicker .p-datepicker-input:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.modern-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #1e293b;
  font-weight: 600;
  padding: 1rem;
}

:deep(.modern-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

:deep(.modern-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
  transform: translateY(-1px);
}

:deep(.modern-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  border: none;
}
</style>
