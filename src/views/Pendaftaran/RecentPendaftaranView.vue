<template>
  <div class="content">
    <!-- Desktop View -->
    <loading_overlay :is-loading="loading" message="Memuat data...." />
    <div class="hidden md:block">
      <Dialog
        v-model:visible="ShowRiwayatPendaftaran"
        modal
        :style="{ width: '1200px' }"
        :closable="true"
        header="Riwayat Pendaftaran"
      >
        <div class="flex justify-between mb-2 gap-2">
          <InputText
            v-model="searchKeyword"
            placeholder="Cari nama, NIK, No MR..."
            @keyup.enter="onSearch"
            class="w-64"
          />
          <Button label="Cari" icon="pi pi-search" :loading="loading" text @click="onSearch" />
        </div>

        <DataTable
          :value="fact"
          stripedRows
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20]"
          scrollable
          scrollHeight="700px"
          showGridlines
          responsiveLayout="scroll"
          rowHover
        >
          <Column field="NOPENDAFTARAN" header="NO REG" sortable></Column>
          <Column field="NOMR" header="NORM" sortable></Column>

          <Column field="NAMAPASIEN" header="PASIEN" sortable>
            <template #body="slotProps">
              <i class="fas fa-user text-blue-500 mr-2"></i>
              <strong style="font-size: 13px"> {{ slotProps.data.NAMAPASIEN }}</strong
              ><br />
              {{ slotProps.data.USIA_PASIEN.tahun }} Thn,
              {{ slotProps.data.USIA_PASIEN.bulan }} Bln, {{ slotProps.data.USIA_PASIEN.hari }} Hari
            </template>
          </Column>

          <Column field="NOSEP" header="No SEP" sortable>
            <template #body="slotProps">
              {{ slotProps.data.NOSEP }}
            </template>
          </Column>

          <Column field="NAMADOKTER" header="Dokter" sortable>
            <template #body="slotProps">
              {{ slotProps.data.NAMADOKTER }}
            </template>
          </Column>

          <Column field="POLI" header="POLI/RUANG" sortable>
            <template #body="slotProps">
              {{ slotProps.data.POLI }}
            </template>
          </Column>

          <Column
            field="CARABAYAR"
            header="Cara Bayar"
            style="width: 120px; text-align: center"
            sortable
          >
            <template #body="slotProps">
              <i class="fas fa-credit-card text-orange-500 mr-2"></i>
              {{ slotProps.data.CARABAYAR }}
            </template>
          </Column>

          <Column
            field="TGLREG"
            header="TGL REGISTER"
            style="width: 120px; text-align: center"
            sortable
          >
            <template #body="slotProps">
              {{ slotProps.data.TGLREG }}
            </template>
          </Column>

          <Column field="JENISRAWAT" header="JENISRAWAT" sortable>
            <template #body="slotProps">
              {{ slotProps.data.JENISRAWAT }}
            </template>
          </Column>

          <Column header="BATALKAN" style="width: 30px; text-align: center" sortable>
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                severity="danger"
                class="round-button2"
                rounded
                outlined
                @click="confirmDelete(slotProps.data)"
              />
            </template>
          </Column>

          <Column header="CETAK" style="width: 30px; text-align: center" sortable>
            <template #body="slotProps">
              <Button
                icon="pi pi-print"
                severity="info"
                class="round-button2"
                outlined
                :loading="slotProps.data.isLoading"
                @click="
                  PrintSEP(slotProps.data.NOSEP, slotProps.data.NOPENDAFTARAN, slotProps.data)
                "
              />
            </template>
          </Column>

          <Column header="AKSI" style="width: 30px; text-align: center" sortable>
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                severity="success"
                class="round-button2"
                outlined
                :loading="slotProps.data.isLoading"
                @click="editPendaftaran(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </Dialog>
    </div>

    <!-- Mobile View -->

    <div class="md:hidden">
      <Dialog
        v-model:visible="ShowRiwayatPendaftaran"
        modal
        :style="{ width: '95vw', maxWidth: '100%' }"
        :closable="true"
        header="Riwayat Pendaftaran"
      >
        <div class="flex flex-col gap-2 mb-4">
          <InputText
            v-model="searchKeyword"
            placeholder="Cari nama, NIK, No MR..."
            @keyup.enter="onSearch"
            class="w-full"
          />
          <Button
            label="Cari"
            icon="pi pi-search"
            :loading="loading"
            class="w-full"
            @click="onSearch"
          />
        </div>

        <div class="space-y-4">
          <div v-if="fact.length === 0" class="text-center text-gray-500 py-0">
            <p>Tidak ada data pendaftaran</p>
          </div>

          <div v-for="(item, index) in paginatedMobileFact" :key="index" class="card-mobile">
            <!-- Header -->
            <div class="card-mobile-header">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-xs text-gray-500">No Registrasi</p>
                  <p class="font-bold text-sm">{{ item.NOPENDAFTARAN }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-500">Tgl Register</p>
                  <p class="font-semibold text-sm">
                    {{ item.MASUKPOLY_DISPLAY }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Patient Info -->
            <div class="card-mobile-body">
              <div class="mb-0 pb-0 border-b">
                <div class="flex items-start gap-2">
                  <i class="fas fa-user text-blue-500 mt-1"></i>
                  <div class="flex-1">
                    <p class="font-semibold text-sm">{{ item.NAMAPASIEN }}</p>
                    <p class="text-xs text-gray-600">
                      {{ item.USIA_PASIEN.tahun }} Thn, {{ item.USIA_PASIEN.bulan }} Bln,
                      {{ item.USIA_PASIEN.hari }} Hari
                    </p>
                    <p class="font-semibold mt-0">
                      No MR: {{ item.NOMR }}, <br />
                      NIK : {{ item.NOKTP }} <br />
                      BPJS : {{ item.NOJAMINAN }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-0 mb-0 pb-0 border-b">
                <div>
                  <p class="text-xs text-gray-500">No SEP</p>
                  <p class="font-semibold text-sm">{{ item.NOSEP || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Dokter</p>
                  <p class="font-semibold text-sm text-truncate">{{ item.NAMADOKTER }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Poli/Ruang</p>
                  <p class="font-semibold text-sm">{{ item.POLI }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Jenis Rawat</p>
                  <p class="font-semibold text-sm">{{ item.JENISRAWAT }}</p>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="mb-0 pb-0 border-b">
                <p class="text-xs text-gray-500">Cara Bayar</p>
                <p class="flex items-center gap-2 font-semibold text-sm">
                  <i class="fas fa-credit-card text-orange-500"></i>
                  {{ item.CARABAYAR }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="card-mobile-footer">
              <div class="flex gap-2 flex-wrap justify-center">
                <Button
                  icon="pi pi-print"
                  label="Cetak"
                  severity="info"
                  size="small"
                  outlined
                  :loading="item.isLoading"
                  @click="PrintSEP(item.NOSEP, item.NOPENDAFTARAN, item)"
                  class="flex-1 min-w-20"
                />
                <Button
                  icon="pi pi-pencil"
                  label="Edit"
                  severity="success"
                  size="small"
                  outlined
                  @click="editPendaftaran(item)"
                  class="flex-1 min-w-20"
                />
                <Button
                  icon="pi pi-trash"
                  label="Hapus"
                  severity="danger"
                  size="small"
                  outlined
                  @click="confirmDelete(item)"
                  class="flex-1 min-w-20"
                />
                <Button
                  icon="pi pi-arrow-right"
                  label="Tindak Lanjut"
                  severity="success"
                  size="small"
                  @click="funtionSendToPoli(item)"
                  class="flex-1 min-w-20"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Pagination -->
        <div class="flex justify-between items-center mt-4 pt-4 border-t">
          <Button
            icon="pi pi-chevron-left"
            text
            rounded
            @click="mobilePage--"
            :disabled="mobilePage === 1"
            class="p-2"
          />
          <span class="text-sm text-gray-600"
            >{{ mobilePage }} / {{ Math.ceil(fact.length / mobileRowsPerPage) }}</span
          >
          <Button
            icon="pi pi-chevron-right"
            text
            rounded
            @click="mobilePage++"
            :disabled="mobilePage === Math.ceil(fact.length / mobileRowsPerPage)"
            class="p-2"
          />
        </div>
      </Dialog>
    </div>

    <!-- Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteConfirm"
      modal
      header="Konfirmasi Hapus"
      :style="{ width: '90vw', maxWidth: '450px' }"
    >
      <div class="flex gap-3">
        <i
          class="pi pi-exclamation-triangle"
          style="font-size: 2rem; color: var(--red-500); flex-shrink: 0"
        />
        <div class="flex-1">
          <span v-if="selectedRow">
            Apakah Anda yakin ingin menghapus pendaftaran
            <strong>{{ selectedRow.NOPENDAFTARAN }}</strong> atas nama
            <strong>{{ selectedRow.NAMAPASIEN }}</strong
            >?
          </span>
          <div class="mt-4">
            <label class="text-sm">Alasan Pembatalan :</label>
            <InputText v-model="txtalasan_batal" class="w-full mt-2" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="showDeleteConfirm = false" />
        <Button label="Hapus" icon="pi pi-check" severity="danger" @click="executeDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const ShowRiwayatPendaftaran = ref(false)
const searchKeyword = ref('')
const showDeleteConfirm = ref(false)
const selectedRow = ref(null)
const fact = ref([])
const txtalasan_batal = ref('')

// Mobile pagination
const mobilePage = ref(1)
const mobileRowsPerPage = ref(5)

const paginatedMobileFact = computed(() => {
  const start = (mobilePage.value - 1) * mobileRowsPerPage.value
  const end = start + mobileRowsPerPage.value
  return fact.value.slice(start, end)
})

const editPendaftaran = (data) => {
  const routeData = router.resolve({
    name: 'EditPendaftaranComponent',
    params: {
      noreg: data.NOPENDAFTARAN,
    },
  })
  window.open(routeData.href, '_blank')
}

const funtionSendToPoli = async (status) => {
  const routeData = router.resolve({
    name: 'FormPoliKlinikView',
    query: {
      noreg: status.NOPENDAFTARAN,
      noka: status.NOJAMINAN,
      nomr: status.NOMR,
      /* any query params */
    },
  })

  window.open(routeData.href, '_blank')
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

const PrintSEP = async (nosep, noregister, row) => {
  row.isLoading = true
  const payLoad = {
    data: {
      NOPENDAFTARAN: noregister,
      NOSEP: nosep,
      id_client: id_client.value,
    },
  }

  const url = configStore.laravel
  const response = await axios.post(`${url}/get_data_sep_api`, payLoad)
  row.isLoading = false

  window.open(response.data, '_blank')
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

const confirmDelete = (row) => {
  selectedRow.value = row
  txtalasan_batal.value = ''
  showDeleteConfirm.value = true
}

const executeDelete = () => {
  if (selectedRow.value) {
    if (!txtalasan_batal.value) {
      showError('Input alasan pembatalan')
      return
    }
    deleteRow(selectedRow.value)
    showDeleteConfirm.value = false
    selectedRow.value = null
  }
}

const deleteRow = async (row) => {
  try {
    loading.value = true
    const payLoads = {
      noregister: row.NOPENDAFTARAN,
      id_client: id_client.value,
      tglawal: formatDateOnlyForAPI(new Date()),
      nosep: row.NOSEP,
      user_id: user_id.value,
      norm: row.NOMR,
      alasan_batal: txtalasan_batal.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/batal_pendaftaran_v4`,
      payLoads,
    )

    if (response.data.code == 200) {
      showSuccess(`Pendaftaran ${row.NOPENDAFTARAN} berhasil dihapus`)
      fetchData(10)
    } else {
      showWarning(response.data.message)
    }

    loading.value = false
  } catch (error) {
    console.error('Error deleting data:', error)
    showError('Gagal menghapus data pendaftaran')
    loading.value = false
  }
}

const onSearch = () => {
  mobilePage.value = 1
  fetchData(7)
}

const fetchData = async (mode) => {
  try {
    const payLoads = {
      mod: mode,
      tglawal: formatDateOnlyForAPI(new Date()),
      id_client: id_client.value,
      norm: searchKeyword.value,
    }

    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/history_versi4`,
      payLoads,
    )

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

defineExpose({
  fetchData,
  ShowRiwayatPendaftaran,
})

onMounted(() => {})
</script>

<style scoped>
/* Desktop Styles */
:deep(.p-datatable-scrollable-header) {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff7ec;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.25rem 0.4rem;
  font-size: 0.8rem;
  line-height: 2rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
  line-height: 1rem;
}

:deep(.p-dialog .p-dialog-header) {
  background-color: #fff8f0;
  border-bottom: 1px solid #f5e7d5;
  font-weight: 600;
  font-size: 1rem;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar) {
  height: 6px;
}

:deep(.p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: #e4c292;
  border-radius: 8px;
}

/* Mobile Card Styles */
.card-mobile {
  border: 1px solid #f5e7d5;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-mobile-header {
  padding: 0.75rem;
  background: linear-gradient(135deg, #fff8f0 0%, #fff3e0 100%);
  border-bottom: 1px solid #f5e7d5;
}

.card-mobile-body {
  padding: 0.75rem;
}

.card-mobile-footer {
  padding: 0.75rem;
  background: #fffaf5;
  border-top: 1px solid #f5e7d5;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

/* Utility Classes */
.min-w-20 {
  min-width: 2rem;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.flex-col {
  flex-direction: column;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.w-full {
  width: 100%;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 0rem;
}

.pb-3 {
  padding-bottom: 0.75rem;
}

.pt-4 {
  padding-top: 1rem;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.font-semibold {
  font-weight: 600;
}

.font-bold {
  font-weight: 700;
}

/* Responsive */
@media (max-width: 768px) {
  .hidden.md\\:block {
    display: none !important;
  }

  .md\\:hidden {
    display: block !important;
  }
}

@media (min-width: 769px) {
  .hidden.md\\:block {
    display: block !important;
  }

  .md\\:hidden {
    display: none !important;
  }
}
</style>
