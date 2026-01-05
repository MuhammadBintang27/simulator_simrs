<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <div class="content">
    <div class="card elevation-0">
      <div class="card-header">
        <h4><i class="pi pi-calendar mr-2"></i> Jadwal Dokter</h4>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card elevation-0">
      <div class="card-header">
        <h6 class="font-bold m-0 d-flex align-items-center gap-2">
          <i class="pi pi-filter"></i> Filter Pencarian
        </h6>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Search Dokter -->
          <div class="col-md-4">
            <label class="form-label fw-semibold">Cari Dokter</label>
            <InputText v-model="filters.namadokter" placeholder="Nama dokter..." class="w-100" />
          </div>

          <!-- Poli -->
          <div class="col-md-4">
            <label class="form-label fw-semibold">Poli</label>
            <Select
              v-model="filters.namapoli"
              :options="poliOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Poli"
              filter
              class="w-100"
              :showClear="true"
            />
          </div>

          <!-- Hari -->
          <div class="col-md-4">
            <label class="form-label fw-semibold">Hari</label>
            <Select
              v-model="filters.namahari"
              :options="hariOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Hari"
              class="w-100"
              :showClear="true"
            />
          </div>
        </div>

        <!-- Buttons -->
        <div class="mt-3 d-flex gap-2">
          <Button label="Cari" icon="pi pi-search" @click="applyFilters" class="p-button-primary" />
          <Button
            label="Reset"
            icon="pi pi-filter-slash"
            @click="resetFilters"
            class="p-button-secondary"
          />
          <Button
            label="Refresh Data"
            icon="pi pi-refresh"
            @click="fetchData"
            class="p-button-success"
          />
        </div>
        <!-- Result count -->
        <div class="mt-3 small text-muted">
          Menampilkan <b>{{ filteredFact.length }}</b> dari <b>{{ fact.length }}</b> data
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card elevation-0">
      <div class="card-body">
        <DataTable
          :value="filteredFact"
          stripedRows
          paginator
          :rows="10"
          selectionMode="single"
          dataKey="id"
          class="p-datatable-sm shadow-md rounded-xl"
        >
          <template #empty> Tidak ada data tersedia. </template>

          <Column header="Aksi">
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                class="p-button-sm p-button-warning"
                @click="openEdit(slotProps.data)"
              />
              <Button
                icon="pi pi-times"
                severity="warn"
                class="p-button-sm p-button-warning"
                @click="confirmDelete(slotProps.data)"
              />
            </template>
          </Column>

          <Column field="namadokter" header="Dokter" sortable />
          <Column field="namapoli" header="Poli" sortable />
          <Column field="namasubspesialis" header="Spesialisasi" sortable />
          <Column field="namahari" header="Hari" sortable />
          <Column field="jadwal" header="Jadwal" sortable />
          <Column field="kapasitaspasien" header="Kapasitas" sortable />

          <Column field="lastupdated" header="Last Updated" sortable />
        </DataTable>
      </div>

      <!-- Edit Dialog -->
    </div>
  </div>
  <Dialog v-model:visible="showEdit" header="Edit Jadwal Dokter" :modal="true" :closable="true">
    <div class="container-fluid">
      <div class="form-group row mb-3">
        <label class="col-md-3 col-form-label fw-semibold">Dokter</label>
        <div class="col-md-9">
          <InputText v-model="editForm.namadokter" class="w-full" disabled />
        </div>
      </div>

      <div class="form-group row mb-3">
        <label class="col-md-3 col-form-label fw-semibold">Poli</label>
        <div class="col-md-9">
          <InputText v-model="editForm.namapoli" class="w-full" disabled />
        </div>
      </div>

      <div class="form-group row mb-3">
        <label class="col-md-3 col-form-label fw-semibold">Hari</label>
        <div class="col-md-9">
          <Select
            disabled
            v-model="editForm.namahari"
            :options="hariOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>

      <div class="form-group row mb-3">
        <label class="col-md-3 col-form-label fw-semibold">Jadwal</label>
        <div class="col-md-9">
          <InputMask
            v-model="editForm.jadwal"
            mask="99:99-99:99"
            placeholder="00:00-00:00"
            class="w-full"
            @blur="validateTime"
            @input="validateTime"
          />
        </div>
      </div>

      <div class="form-group row mb-3">
        <label class="col-md-3 col-form-label fw-semibold">Kapasitas Pasien</label>
        <div class="col-md-9">
          <InputNumber v-model="editForm.kapasitaspasien" class="w-full" />
        </div>
      </div>
    </div>

    <div class="flex justify-content-end gap-2 mt-3">
      <Button
        label="Batal"
        icon="pi pi-times"
        class="p-button-secondary"
        @click="showEdit = false"
      />
      <Button label="Simpan" icon="pi pi-save" class="p-button-success" @click="saveEdit" />
    </div>
  </Dialog>
  <Toast />
  <ConfirmDialog />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { storeToRefs } from 'pinia'

// PrimeVue
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputMask from 'primevue/inputmask'

// Pinia store
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import Select from 'primevue/select'

const configStore = useConfigStore()
const authStore = useAuthStore()

const showEdit = ref(false)

const { id_client, user_id } = storeToRefs(authStore)

const toast = useToast()
const loading = ref(false)
const fact = ref([])
import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()
// Filter state
const filters = ref({
  namadokter: '',
  namapoli: '',
  namahari: '',
  kapasitasMin: null,
})

const editForm = ref({
  id: null,
  namadokter: '',
  namapoli: '',
  namahari: '',
  jadwal: '',
  kapasitaspasien: '',
})

// buka dialog
const openEdit = (row) => {
  editForm.value = { ...row, kapasitaspasien: Number(row.kapasitaspasien) || 0 }
  showEdit.value = true

  console.log(row)
}

const saveEdit = async () => {
  await update_jadwal_dokterpoli(1) // Simulate update with mode 2
  showEdit.value = false
}

// Filter options
const poliOptions = computed(() => {
  const unique = [...new Set(fact.value.map((item) => item.namapoli))]
  return unique.map((poli) => ({
    label: poli,
    value: poli,
  }))
})

const hariOptions = computed(() => {
  const unique = [...new Set(fact.value.map((item) => item.namahari))]
  return unique.map((hari) => ({
    label: hari,
    value: hari,
  }))
})

const confirmDelete = (row) => {
  confirm.require({
    message: `Yakin ingin menghapus jadwal dokter ${row.namadokter}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    acceptClass: 'p-button-danger',
    accept: () => {
      editForm.value = { ...row, kapasitaspasien: Number(row.kapasitaspasien) || 0 }
      update_jadwal_dokterpoli(2)
    },
  })
}
const validateTime = () => {
  const v = editForm.value.jadwal

  if (!v || v.length !== 13) return

  const [start, end] = v.split('-')

  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)

  // Validasi
  if (sh > 23 || sm > 59 || eh > 23 || em > 59) {
    editForm.value.jadwal = ''
  }
}

// Filtered data computed
const filteredFact = computed(() => {
  return fact.value.filter((item) => {
    const matchDokter = item.namadokter
      .toLowerCase()
      .includes(filters.value.namadokter.toLowerCase())
    const matchPoli = !filters.value.namapoli || item.namapoli === filters.value.namapoli
    const matchHari = !filters.value.namahari || item.namahari === filters.value.namahari
    const matchKapasitas =
      !filters.value.kapasitasMin || parseInt(item.kapasitaspasien) >= filters.value.kapasitasMin

    return matchDokter && matchPoli && matchHari && matchKapasitas
  })
})

// Toast wrappers
const showSuccess = (message = 'Operation successful') => {
  toast.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 })
}

const showError = (message = 'An error occurred') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}

const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Warning', detail: message, life: 4000 })
}

// API Fetch
const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const payload = {
      id_client: id_client.value,
      mode: 1,
    }
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/getjadwaldokter_v1`,
      payload,
    )
    fact.value = [...response.data]
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

const update_jadwal_dokterpoli = async (mode) => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const payload = {
      id_client: id_client.value,
      id: editForm.value.id,
      jadwal: editForm.value.jadwal,
      kapasitaspasien: editForm.value.kapasitaspasien,
      mode: mode,
    }
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/update_jadwal_dokter`,
      payload,
    )
    console.log(response.data)
    if (response.data.code === 200) {
      showSuccess('Jadwal Dokter berhasil diperbarui')
      fetchData() // Refresh data after update
    } else {
      showError('Gagal memperbarui jadwal dokter')
    }
    loading.value = false
    //fact.value = [...response.data]
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

// Filter functions
const applyFilters = () => {
  showSuccess('Filter diterapkan')
}

const resetFilters = () => {
  filters.value = {
    namadokter: '',
    namapoli: '',
    namahari: '',
    kapasitasMin: null,
  }
  showWarning('Filter direset')
}

// Date formatters
const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return null
  }
}

const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    return (
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    )
  } catch {
    return null
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.p-text-bold {
  font-weight: 600;
}
.p-text-secondary {
  color: rgba(0, 0, 0, 0.6);
}
</style>
