<template>
  <div class="content">
    <Dialog
      v-model:visible="showListSPRI"
      modal
      :style="getDialogStyle()"
      :closable="true"
      header="Riwayat Perintah Rawat Inap (data Server BPJS)"
      :class="{ 'mobile-dialog': isMobile }"
    >
      <!-- Filter Bar -->
      <div class="filter-bar" :class="{ 'filter-bar-mobile': isMobile }">
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar mr-1"></i>
            Filter Bulan & Tahun
          </label>
          <div class="filter-controls">
            <DatePicker
              v-model="selectedDate"
              view="month"
              dateFormat="mm/yy"
              placeholder="Pilih Bulan & Tahun"
              showButtonBar
              @update:modelValue="fetchData"
              class="filter-datepicker"
            />
            <Button
              v-if="selectedDate"
              icon="pi pi-filter-slash"
              label="Reset"
              class="p-button-sm p-button-outlined p-button-secondary"
              @click="resetFilter"
              title="Reset filter"
            />
          </div>
        </div>

        <!-- Bulk Delete -->
        <div class="bulk-actions" v-if="selectedSPRIs.length > 0">
          <span class="selected-count">
            <i class="pi pi-check-circle mr-1"></i>
            {{ selectedSPRIs.length }} dipilih
          </span>
          <Button
            label="Hapus Dipilih"
            icon="pi pi-trash"
            severity="danger"
            class="p-button-sm"
            @click="hapusBulkSPRI"
            :loading="loadingBulkDelete"
          />
        </div>
      </div>

      <!-- Mobile Card View -->
      <div v-if="isMobile" class="mobile-view">
        <div v-if="isLoadingSPRI" class="text-center py-4">
          <i class="pi pi-spin pi-spinner mr-2"></i>
          Memuat data SPRI...
        </div>

        <div v-else-if="filteredSpriData.length === 0" class="text-center py-4 text-muted">
          <i class="pi pi-info-circle mr-2"></i>
          Tidak ada data SPRI ditemukan
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(spri, index) in filteredSpriData"
            :key="spri.noSuratKontrol || index"
            class="spri-card"
            :class="{ 'spri-card-selected': selectedSPRIs.includes(spri.noSuratKontrol) }"
          >
            <div class="card-header">
              <small class="text-muted">{{ spri?.noKartu }}</small>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Tanggal:</span>
                <span class="value">{{ spri.tglRencanaKontrol }} -({{ spri.noSuratKontrol }})</span>
              </div>
              <div class="info-row">
                <span class="label">Dokter:</span>
                <div class="value">
                  <strong>{{ spri.namaDokter }}</strong>
                  <br />
                  <small class="text-muted">Kode: {{ spri.kodeDokter }}</small>
                </div>
              </div>
              <div class="info-row">
                <span class="label">Jenis Rawat:</span>
                <span class="value">{{ spri.jnsPelayanan }}</span>
              </div>
              <div class="info-row">
                <span class="label">Poli/Ruang:</span>
                <span class="value">{{ spri.namaPoliTujuan || '-' }}</span>
              </div>
            </div>

            <div class="card-actions">
              <Button
                label="Cetak"
                @click="cetakSPRI(spri)"
                icon="pi pi-print"
                class="p-button-sm flex-button"
              />
              <Button
                severity="warn"
                icon="pi pi-times"
                @click="hapus_SPRI(spri?.noSuratKontrol)"
                class="p-button-sm flex-button"
                title="Hapus"
              />
              <Button
                severity="info"
                icon="pi pi-pencil"
                class="p-button-sm flex-button"
                title="Edit"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div v-else class="table-responsive" style="max-height: 500px; overflow-y: auto">
        <table class="table table-bordered table-striped table-hover">
          <thead class="thead-light sticky-top">
            <tr>
              <th style="width: 4%">#</th>
              <th style="width: 15%">No. SPRI</th>
              <th style="width: 10%">Tanggal</th>
              <th style="width: 18%">Dokter</th>
              <th style="width: 10%">Jenis Rawat</th>
              <th style="width: 13%">Poli/Ruang</th>
              <th style="width: 9%">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoadingSPRI">
              <td colspan="10" class="text-center py-4">
                <i class="pi pi-spin pi-spinner mr-2"></i>
                Memuat data SPRI...
              </td>
            </tr>
            <tr v-else-if="filteredSpriData.length === 0">
              <td colspan="10" class="text-center py-4 text-muted">
                <i class="pi pi-info-circle mr-2"></i>
                Tidak ada data SPRI ditemukan
              </td>
            </tr>
            <tr
              v-else
              v-for="(spri, index) in filteredSpriData"
              :key="spri.SPRI || index"
              :class="{ 'row-selected': selectedSPRIs.includes(spri.SPRI) }"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div style="display: flex; align-items: center; justify-content: space-between">
                  <div>
                    <strong>{{ spri?.noSuratKontrol }}</strong>
                    <br />
                    <small class="text-muted">{{ spri?.noKartu }}</small>
                  </div>
                </div>
              </td>
              <td>{{ spri.tglRencanaKontrol }}</td>
              <td>
                <strong>{{ spri.namaDokter }}</strong>
                <br />
                <small class="text-muted">Kode: {{ spri.kodeDokter }}</small>
              </td>
              <td>{{ spri.jnsPelayanan }}</td>
              <td>{{ spri.namaPoliTujuan || '-' }}</td>

              <td>
                <div class="flex items-center space-x-2">
                  <Button
                    severity="warn"
                    class="round-button2"
                    icon="pi pi-times"
                    @click="hapus_SPRI(spri?.noSuratKontrol)"
                    style="padding: 0.25rem"
                    title="Hapus SPRI"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer summary -->
      <div class="table-summary" v-if="!isLoadingSPRI && filteredSpriData.length > 0">
        <small class="text-muted">
          Menampilkan {{ filteredSpriData.length }} dari {{ spriHistoryData.length }} data
          <span v-if="selectedMonth || selectedYear">
            (difilter: {{ selectedMonth ? months[selectedMonth - 1] : '' }} {{ selectedYear }})
          </span>
        </small>
      </div>

      <div class="button-group mt-2" :class="{ 'mobile-button-group': isMobile }">
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="success"
          @click="showListSPRI = false"
          class="p-button p-button-secondary flex-button"
          :class="{ 'w-full': isMobile }"
        />
      </div>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import DatePicker from 'primevue/datepicker'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

// ── Props ──────────────────────────────────────────────────
const props = defineProps({
  noKartu: {
    type: String,
    default: null,
  },
})

// ── State ──────────────────────────────────────────────────
const loading = ref(false)
const isLoadingSPRI = ref(false)
const loadingBulkDelete = ref(false)
const showListSPRI = ref(false)
const spriHistoryData = ref([])
const copiedSPRIIndex = ref(null)
const isMobile = ref(false)

// ── Selection ──────────────────────────────────────────────
const selectedSPRIs = ref([])

const toggleSelectSPRI = (spriId) => {
  const idx = selectedSPRIs.value.indexOf(spriId)
  if (idx === -1) selectedSPRIs.value.push(spriId)
  else selectedSPRIs.value.splice(idx, 1)
}

const isAllSelected = computed(
  () =>
    filteredSpriData.value.length > 0 &&
    filteredSpriData.value.every((s) => selectedSPRIs.value.includes(s.SPRI)),
)

const isIndeterminate = computed(() => selectedSPRIs.value.length > 0 && !isAllSelected.value)

const toggleSelectAll = (val) => {
  selectedSPRIs.value = val ? filteredSpriData.value.map((s) => s.SPRI) : []
}

// ── Month / Year Filter ────────────────────────────────────

const selectedMonth = ref('')
const selectedYear = ref('')

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const yearsFromData = spriHistoryData.value
    .map((s) => {
      const d = new Date(s.TANGGAL)
      return isNaN(d) ? null : d.getFullYear()
    })
    .filter(Boolean)
  const uniqueYears = [
    ...new Set([...yearsFromData, currentYear - 1, currentYear, currentYear + 1]),
  ]
  return uniqueYears.sort((a, b) => b - a)
})

const filteredSpriData = computed(() => {
  return spriHistoryData.value.filter((spri) => {
    const d = new Date(spri.TANGGAL)
    const matchMonth = selectedMonth.value ? d.getMonth() + 1 === Number(selectedMonth.value) : true
    const matchYear = selectedYear.value ? d.getFullYear() === Number(selectedYear.value) : true
    return matchMonth && matchYear
  })
})

const applyFilter = () => {
  selectedSPRIs.value = []
}

const resetFilter = () => {
  selectedMonth.value = ''
  selectedYear.value = ''
  selectedSPRIs.value = []
}

// ── Toast helpers ──────────────────────────────────────────
const showSuccess = (message = 'Operation successful') => {
  toast.add({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 })
}
const showError = (message = 'An error occurred') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}
const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: message, life: 4000 })
}

const selectedDate = ref(new Date())

// ── API ────────────────────────────────────────────────────
const fetchData = async () => {
  try {
    isLoadingSPRI.value = true
    const url = configStore.apiBaseUrl

    const param = {
      no_kartu: props.noKartu,
      id_client: id_client.value,
      tanggal: formatDateForAPI(selectedDate.value),
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/index.php/api/bpjs_api/ListRencanaKontrol`, param)

    spriHistoryData.value = response.data.response.list ?? []
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data.')
  } finally {
    isLoadingSPRI.value = false
  }
}

// Date formatting
const formatDateForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}  `
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
}

// ── Delete single ──────────────────────────────────────────
const hapus_SPRI = (spriId) => {
  confirm.require({
    message: `Yakin ingin menghapus SPRI ${spriId}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const url = configStore.apiBaseUrl
        const param = {
          noSuratKontrol: spriId,
          id_client: id_client.value,
          user_id: user_id.value,
        }
        await axios.post(`${url}/index.php/api/bpjs_api/hapus_spri_dari_bpjs`, param)

        spriHistoryData.value = spriHistoryData.value.filter((s) => s.noSuratKontrol !== spriId)
        selectedSPRIs.value = selectedSPRIs.value.filter((id) => id !== spriId)

        showSuccess(`SPRI ${spriId} berhasil dihapus.`)
      } catch (error) {
        console.error(error)
        showError('Gagal menghapus SPRI.')
      }
    },
  })
}

// ── Delete bulk ────────────────────────────────────────────
const hapusBulkSPRI = () => {
  const count = selectedSPRIs.value.length
  confirm.require({
    message: `Yakin ingin menghapus ${count} SPRI yang dipilih?`,
    header: 'Konfirmasi Hapus Massal',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: `Ya, Hapus ${count} Data`,
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger',
    accept: async () => {
      loadingBulkDelete.value = true
      try {
        const url = configStore.apiBaseUrl
        await axios.post(`${url}/index.php/api/bpjs_api/BulkDeleteSPRI`, {
          spri_ids: selectedSPRIs.value,
        })
        const deleted = [...selectedSPRIs.value]
        spriHistoryData.value = spriHistoryData.value.filter((s) => !deleted.includes(s.SPRI))
        selectedSPRIs.value = []
        showSuccess(`${count} SPRI berhasil dihapus.`)
      } catch (error) {
        console.error(error)
        showError('Gagal menghapus data massal.')
      } finally {
        loadingBulkDelete.value = false
      }
    },
  })
}

// ── Helpers ────────────────────────────────────────────────
const copySPRI = async (spriId, index) => {
  try {
    await navigator.clipboard.writeText(spriId)
    copiedSPRIIndex.value = index
    setTimeout(() => (copiedSPRIIndex.value = null), 2000)
  } catch {
    showWarning('Gagal menyalin SPRI.')
  }
}

const getDialogStyle = () => ({ width: isMobile.value ? '95vw' : '80vw' })

// ── Expose ke parent ───────────────────────────────────────
const open = () => {
  showListSPRI.value = true
  fetchData()
}

defineExpose({ open })

// ── Lifecycle ──────────────────────────────────────────────
onMounted(() => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}
.filter-bar-mobile {
  flex-direction: column;
  align-items: stretch;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
}
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.filter-select {
  padding: 0.375rem 0.6rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  background: #fff;
  color: #212529;
  cursor: pointer;
  transition: border-color 0.15s;
}
.filter-select:focus {
  outline: none;
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  animation: fadeIn 0.2s ease;
}
.selected-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: #856404;
  white-space: nowrap;
}
.row-selected td {
  background-color: #e8f4fd !important;
}
.table-summary {
  padding: 0.4rem 0.5rem;
  text-align: right;
}
.spri-card-selected {
  border-color: #0d6efd !important;
  background: #e8f4fd;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
