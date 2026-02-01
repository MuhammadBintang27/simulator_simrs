<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    maximizable
    :style="{ width: '70vw' }"
    @hide="closeDialog"
  >
    <!-- BODY -->

    <div class="flex flex-column">
      <div class="mb-4 border-bottom pb-2">
        <h5 class="fw-bold">
          <i class="pi pi-search me-2 mr-3"></i>Pencarian Data Transaksi Pasien
        </h5>

        <div class="row g-3 mb-4">
          <div class="col-12 col-md-3">
            <label class="form-label fw-semibold">Cari Pasien</label>
            <div class="p-input-icon-left w-100">
              <InputText
                v-model="searchKeyword"
                placeholder="No RM / Nama / NIK..."
                class="w-100"
              />
            </div>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold">Periode Kunjungan</label>
            <div class="d-flex gap-2">
              <DatePicker v-model="startDate" showIcon dateFormat="dd/mm/yy" class="flex-grow-1" />
              <DatePicker v-model="endDate" showIcon dateFormat="dd/mm/yy" class="flex-grow-1" />
            </div>
          </div>
          <div class="col-12 col-md-2">
            <label class="form-label fw-semibold">Jenis Rawat</label>

            <div class="d-flex gap-2">
              <Select
                v-model="jenisrawatSelected"
                :options="jenisRawatOptions"
                optionLabel="caption"
                class="w-100"
              />
            </div>
          </div>
          <div class="col-12 col-md-3 d-flex align-items-end">
            <Button
              label="Cari Transaksi"
              icon="pi pi-search"
              class="w-100"
              @click="cariTransaksi(13)"
              :loading="loading"
            />
          </div>
        </div>

        <DataTable
          :value="listPasienPencarian"
          stripedRows
          paginator
          :rows="5"
          responsiveLayout="stack"
          class="p-datatable-sm border rounded shadow-sm"
        >
          <Column field="NOPENDAFTARAN" header="NO REG"></Column>
          <Column field="NOMR" header="NORM"></Column>
          <Column field="DATA_SINGKAT" header="NAMA PASIEN">
            <template #body="slotProps">
              <div>
                <div class="fw-bold">
                  {{ slotProps.data.NAMAPASIEN }} ({{ slotProps.data.JENISKELAMIN }})
                </div>
                <div class="text-muted">
                  Umur: {{ slotProps.data.USIA_PASIEN.tahun }} T,
                  {{ slotProps.data.USIA_PASIEN.bulan }}B,{{ slotProps.data.USIA_PASIEN.hari }} H
                </div>
              </div>
            </template>
          </Column>
          <Column field="NOKTP" header="NOKTP"></Column>
          <Column field="NOSEP" header="NOSEP"></Column>
          <Column field="TGLREG" header="TGL REG"></Column>
          <Column field="JENISRAWAT" header="JENIS RAWAT"></Column>
          <Column field="NAMADOKTER" header="DPJP"></Column>
          <Column header="AKSI" class="text-center">
            <template #body="slotProps">
              <Button
                label="Pilih"
                icon="pi pi-check-circle"
                severity="info"
                size="small"
                @click="selectCard(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- FOOTER -->
    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        severity="secondary"
        size="small"
        @click="closeDialog"
      />
      <Button
        v-if="selectedPasien"
        label="Pilih"
        icon="pi pi-check"
        size="small"
        @click="selectCard"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'

import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'

import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// ===== STATE =====
const isVisible = ref(false)
const loading = ref(false)

const startDate = ref(new Date())
const endDate = ref(new Date())
const jenisrawatSelected = ref({ caption: 'INAP', value: 'INAP' })

const fact = ref([])
const selectedPasien = ref(null)

// ===== STORES =====
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// ===== OPTIONS =====
const jenisRawatOptions = ref([
  { caption: 'JALAN', value: 'JALAN' },
  { caption: 'INAP', value: 'INAP' },
])

// ===== COMPUTED =====
const dialogTitle = computed(() => 'Cari Data Pasien')

// ===== TOAST =====
const toast = useToast()

// ===== METHODS =====
const openDialog = () => {
  isVisible.value = true
}

const closeDialog = () => {
  isVisible.value = false
}

const searchKeyword = ref(null)
const listPasienPencarian = ref([])
const cariTransaksi = async (mode) => {
  try {
    const payLoads = {
      mod: mode,
      tglawal: formatDate(startDate.value),
      tglakhir: formatDate(endDate.value),
      id_client: id_client.value,
      jenisrawat: jenisrawatSelected.value.value,
      norm: searchKeyword.value,
    }

    loading.value = true
    listPasienPencarian.value = []
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/history_versi4`,
      payLoads,
    )

    if (response.data.response.length > 0) {
      listPasienPencarian.value = [...response.data.response]
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}
// ===== UTIL =====
const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

// ===== EMIT =====
const emit = defineEmits(['select:pasien'])

const selectCard = (datapasien) => {
  if (datapasien) {
    emit('select:pasien', datapasien)
    closeDialog()
  }
}

onMounted(() => {
  // Initial fetch or setup if needed
})

defineExpose({
  openDialog,
  closeDialog,
})
</script>
