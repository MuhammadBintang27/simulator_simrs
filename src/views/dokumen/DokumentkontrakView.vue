<template>
  <loading_overlay :is-loading="loading" message="Memuat...." />

  <section class="content">
    <ContentHeader title="Dokumen Kontrak" icon="pi pi-spin pi-cog" />

    <Panel>
      <template #icons>
        <Button
          type="button"
          label="Tambah"
          icon="pi pi-plus"
          size="small"
          class="p-button cancel-button round-button2"
          @click="handleAdd"
        />
      </template>
      <template #header>
        <div
          class="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-2"
        >
          <div class="flex items-center gap-2">
            <SelectButton v-model="layout" :options="options" :allowEmpty="false">
              <template #option="{ option }">
                <i :class="[option === 'list' ? 'pi pi-bars' : 'pi pi-table']" />
              </template>
            </SelectButton>
            <span class="font-bold"><strong> DAFTAR DOKUMEN KONTRAK</strong></span>
          </div>

          <!-- Search Input -->
          <div class="p-inputgroup mt-2">
            <InputText
              v-model="searchQuery"
              placeholder="Cari dokumen..."
              @input="handleSearch"
              class="w-full md:w-20rem"
            />
          </div>
        </div>
      </template>

      <!-- Grid Thumbnail View -->
      <Message severity="info" class="mb-2 gradient-message">File hanya dalam bentuk word</Message>
      <div v-if="layout === 'grid'" class="grid">
        <div
          v-for="item in filteredDocuments"
          :key="item.id_dok"
          class="col-12 md:col-6 lg:col-3 xl:col-3 p-2"
        >
          <div class="surface-card shadow-2 border-round p-4 h-full flex flex-column">
            <div class="flex align-items-center justify-content-center mb-3">
              <i class="pi pi-file-word text-4xl text-primary"></i>
            </div>
            <div class="text-center mb-3">
              <h4>{{ item.caption }}</h4>
              <div class="text-600 mb-2">ID: {{ item.id_dok }}</div>
              <div class="text-500">{{ formatDate(item.created_at) }}</div>
            </div>
            <div class="flex justify-content-center gap-2 mt-auto pt-3">
              <Button icon="pi pi-pencil" size="small" outlined @click="handleEdit(item)" />
              <Button
                icon="pi pi-trash"
                size="small"
                outlined
                severity="danger"
                @click="confirmDelete(item)"
                aria-label="Delete"
              />
              <Button
                icon="pi pi-print"
                size="small"
                outlined
                severity="warn"
                @click="openPdf(item.url)"
                aria-label="Print"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Mode List (Table) -->
      <DataTable
        v-else
        :value="filteredDocuments"
        dataKey="id_dok"
        responsiveLayout="scroll"
        stripedRows
        class="p-datatable-sm"
      >
        <Column field="caption" header="Judul Dokumen" />
        <Column field="id_dok" header="ID" />
        <Column
          field="created_at"
          header="Tanggal"
          :body="(rowData) => formatDate(rowData.created_at)"
        />
        <Column header="Aksi">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                size="small"
                outlined
                @click="handleEdit(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                outlined
                severity="danger"
                @click="confirmDelete(slotProps.data)"
              />
              <Button
                icon="pi pi-print"
                size="small"
                outlined
                severity="warn"
                @click="openPdf(slotProps.data.url)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Empty State -->
      <div
        v-if="filteredDocuments.length === 0"
        class="flex justify-content-center align-items-center p-5"
      >
        <div class="text-center">
          <i class="pi pi-folder-open text-5xl text-500 mb-3"></i>
          <div class="text-xl text-600">
            {{
              searchQuery
                ? 'Tidak ada dokumen yang sesuai dengan pencarian'
                : 'Tidak ada dokumen kontrak'
            }}
          </div>
        </div>
      </div>
    </Panel>
  </section>

  <!-- Dialog Form -->
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '40rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    header="Form Dokumen"
    :closable="true"
  >
    <div class="p-fluid">
      <!-- Judul -->
      <div class="row align-items-center mb-3">
        <label for="caption" class="col-md-3 col-form-label font-semibold">Judul</label>
        <div class="col-md-9">
          <InputText id="caption" v-model="form.caption" class="w-100" />
        </div>
      </div>

      <!-- File Upload -->
      <div class="row align-items-center mb-3">
        <label for="file" class="col-md-3 col-form-label font-semibold">File</label>
        <div class="col-md-9">
          <input
            type="file"
            id="file"
            class="form-control"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            @change="handleFileUpload"
          />
        </div>
      </div>

      <!-- Tombol -->
      <div class="row mt-3">
        <div class="col-md-12 d-flex justify-content-end gap-2">
          <Button
            label="Batal"
            icon="pi pi-times"
            class="p-button-text round-button2"
            size="small"
            @click="dialogVisible = false"
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            size="small"
            class="ml-2 round-button2"
            @click="handleSave"
          />
        </div>
      </div>
    </div>
  </Dialog>
  <Toast />
  <ConfirmDialog />
</template>

<script setup>
import { ref, onMounted, toRaw, computed } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'

import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'

const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const layout = ref('grid')
const options = ref(['list', 'grid'])
const loading = ref(false)
const documents = ref([])
const searchQuery = ref('')

import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()

const dialogVisible = ref(false)

const form = ref({
  id_dok: null,
  caption: '',
  url: '',
  id_client: id_client.value,
  mode: 1, // 1 = add, 2 = edit
})

// Search functionality
const handleSearch = () => {
  // Debounce could be added here if needed
  console.log('Searching for:', searchQuery.value)
}

const filteredDocuments = computed(() => {
  if (!searchQuery.value.trim()) {
    return documents.value
  }

  const query = searchQuery.value.toLowerCase()
  return documents.value.filter((doc) => {
    // Search in different fields
    return doc.caption.toLowerCase().includes(query) || doc.id_dok.toString().includes(query)
  })
})

const resetForm = () => {
  form.value = {
    id_dok: null,
    caption: '',
    url: '',
    id_client: id_client.value,
    mode: 1,
  }
}

// File Upload handler
const handleFileUpload = (event) => {
  const file = event.target.files[0] // Get the first file
  if (file) {
    form.value.file = file // Store it in the form
  }
}

const showToast = (type = 'success', summary = 'Success', detail = 'Data berhasil dimuat') => {
  toast.add({
    severity: type,
    summary,
    detail,
    life: 3000,
  })
}

const confirmDelete = (item) => {
  confirm.require({
    message: `Apakah kamu yakin ingin menghapus dokumen "${item.caption}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya',
    rejectLabel: 'Tidak',
    class: 'round-button2',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await hapus_dokument(item.id_dok)
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: 'Dibatalkan',
        detail: 'Penghapusan dibatalkan',
        life: 3000,
      })
    },
  })
}

const hapus_dokument = async (id_dok) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/v1/hapus_dokument`,
      toRaw({ id_client: id_client.value, id_dok: id_dok }),
    )

    console.log(response.data)
    if (response.data.code == 200) {
      fetchDocuments()
    }
  } catch (error) {
    console.error('Gagal memuat dokumen:', error)
    showToast('error', 'Gagal', 'Terjadi kesalahan saat memuat data')
  } finally {
    loading.value = false
  }
}

const fetchDocuments = async () => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/v1/getDokumentsByClient`,
      toRaw({ id_client: id_client.value, mode: 1 }),
    )
    documents.value = response.data.response || []
    showToast()
  } catch (error) {
    console.error('Gagal memuat dokumen:', error)
    showToast('error', 'Gagal', 'Terjadi kesalahan saat memuat data')
  } finally {
    loading.value = false
  }
}

const openPdf = (url) => {
  window.open(url, '_blank')
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (item) => {
  form.value = {
    ...item,
    mode: 2,
  }
  console.log(form)
  dialogVisible.value = true
}

const handleSave = async () => {
  loading.value = true
  const url = configStore.apiBaseUrl
  try {
    const endpoint = form.value.mode === 1 ? `${url}/v1/addDokumen` : `${url}/v1/updateDokumen`

    const formData = new FormData()
    formData.append('caption', form.value.caption)
    formData.append('url', form.value.url || '') // optional
    formData.append('mode', form.value.mode) // jika diperlukan untuk logika backend
    formData.append('id_dok', form.value.id_dok) // jika diperlukan untuk logika backend
    formData.append('id_client', id_client.value) // jika diperlukan untuk logika backend

    // Cek apakah ada file yang dipilih
    if (form.value.file) {
      formData.append('file', form.value.file)
    }

    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('data respons', response.data)
    loading.value = false
    dialogVisible.value = false
    fetchDocuments()
  } catch (error) {
    console.error('Gagal menyimpan dokumen:', error)
    loading.value = false
    showToast('error', 'Gagal', 'Terjadi kesalahan saat menyimpan dokumen')
  }
}

onMounted(fetchDocuments)
</script>

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  margin: -0.5rem;
}

.col-12 {
  flex: 0 0 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .md\:col-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .md\:w-20rem {
    width: 20rem;
  }
}

@media (min-width: 992px) {
  .lg\:col-3 {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

/* Hover effect on card */
.surface-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.surface-card:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

/* Hover effect on card */
.surface-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  border: 1px solid #dcdcdc; /* Light gray border */
  border-radius: 0.75rem; /* Keep rounded corners */
}

.gradient-message {
  background: linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  border-radius: 0.5rem;
}

.surface-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-color: #8ab4f8; /* Optional: highlight border on hover */
  cursor: pointer;
}
</style>
