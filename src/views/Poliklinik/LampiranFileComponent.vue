<template>
  <div class="file-viewer-container">
    <!-- Header with Refresh Button -->
    <div class="header-section">
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="fetchData()"
        :loading="loading"
        class="p-button-sm"
      />
    </div>

    <!-- Data Table -->
    <div class="table-section p-4">
      <DataTable
        :value="files"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        :globalFilter="globalFilter"
        :globalFilterFields="['norm', 'caption_file', 'namadokter', 'poli']"
        responsiveLayout="scroll"
        stripedRows
        class="p-datatable-sm"
        filterDisplay="row"
      >
        <!-- Thumbnail Column -->
        <Column
          header="Gambar"
          headerStyle="width:110px;text-align:center"
          bodyClass="p-text-center"
        >
          <template #body="slotProps">
            <Image
              :src="slotProps.data.src"
              :alt="slotProps.data.caption_file"
              width="100"
              preview
              imageStyle="
                cursor: pointer;
                max-width: 90px;
                max-height: 70px;
                border-radius: 6px;
                object-fit: cover;
              "
            />
          </template>
        </Column>

        <!-- Caption Column -->
        <Column field="caption_file" header="Keterangan" sortable />

        <!-- Date Column -->
        <Column field="tglreg" header="Tanggal" sortable />

        <!-- Doctor Column -->
        <Column field="namadokter" header="Dokter" sortable />

        <!-- Clinic Column -->
        <Column field="poli" header="Poli" sortable />

        <!-- Treatment Type Column -->
        <Column field="jenisrawat" header="Jenis Rawat" />

        <!-- Action Column -->
        <Column header="Aksi" bodyClass="p-text-center" headerStyle="width:120px">
          <template #body="slotProps">
            <Button
              icon="pi pi-download"
              class="p-button-text p-button-sm"
              @click="download(slotProps.data)"
              v-tooltip="'Download file'"
              aria-label="Download"
            />
          </template>
        </Column>

        <!-- Empty Message -->
        <template #empty>
          <div class="p-4 p-text-center">
            <p>Tidak ada file ditemukan</p>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Toast Messages -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import { useAuthStore } from '@/stores/config'
import { useConfigStore } from '@/stores/config'

// ==================== Store Setup ====================
const authStore = useAuthStore()
const configStore = useConfigStore()
const { id_client } = storeToRefs(authStore)
const route = useRoute()

// ==================== Toast Setup ====================
const toast = useToast()

// ==================== State ====================
const loading = ref(false)
const files = ref([])
const globalFilter = ref(null)

// ==================== Props ====================
defineProps({
  initialFiles: {
    type: Array,
    default: () => [],
  },
})

// ==================== Toast Functions ====================
const showSuccess = (message = 'Operasi berhasil') => {
  toast.add({
    severity: 'success',
    summary: 'Sukses',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'Terjadi kesalahan') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const showWarning = (message = 'Peringatan') => {
  toast.add({
    severity: 'warn',
    summary: 'Peringatan',
    detail: message,
    life: 4000,
  })
}

// ==================== Methods ====================
const download = (item) => {
  if (!item.file_lampiran) {
    showWarning('File tidak tersedia')
    return
  }
  window.open(item.file_lampiran, '_blank')
  showSuccess('File download dimulai')
}

const fetchData = async () => {
  try {
    loading.value = true

    if (!route.query.nomr) {
      showWarning('Nomor rekam medis tidak ditemukan')
      loading.value = false
      return
    }

    const payload = {
      id_client: id_client.value,
      jenisrawat: 'JALAN',
      nomr: route.query.nomr,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/get_filelampiran_pasien`,
      payload,
    )

    if (response.data.response && Array.isArray(response.data.response)) {
      files.value = response.data.response
    } else {
      files.value = []
      showWarning('Tidak ada file ditemukan')
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat file lampiran. Periksa koneksi internet Anda.')
    files.value = []
    loading.value = false
  }
}

// ==================== Lifecycle ====================
onMounted(() => {
  // fetchData()
})
</script>

<style scoped>
.file-viewer-container {
  width: 100%;
  background-color: #f5f5f5;
}

.header-section {
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-start;
}

.search-section {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.table-section {
  background-color: #fff;
  border-radius: 4px;
  margin: 1rem;
}

.w-full {
  width: 100%;
}
</style>
