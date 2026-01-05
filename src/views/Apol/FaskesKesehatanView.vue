<template>
  <div class="content">
    <Panel>
      <template #header>
        <h6 style="color: darkcyan"><strong>FASKES</strong></h6></template
      >
      <template #icons>
        <div class="form-group">
          <label class="ml-2">Cari nama faskes</label>
          <InputText class="ml-2" style="width: 20em" v-model="nama_faskes_find" />

          <Select
            class="ml-2"
            :options="jenisFaskes"
            optionLabel="caption"
            v-model="jenisFaskesSelected"
          />
          <Button
            class="round-button2 ml-2"
            :loading="loading"
            @click="fetchData"
            label="Cari data"
          />
        </div>
      </template>
      <DataTable
        :value="listFaskes"
        :paginator="true"
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
        responsiveLayout="scroll"
        striped-rows
        showGridlines
      >
        <Column field="kode" header="Kode" sortable style="width: 150px"></Column>
        <Column field="nama" header="Nama Klinik" sortable></Column>
      </DataTable>
    </Panel>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const jenisFaskesSelected = ref({
  code: 1,
  caption: 'Faskes 1',
})
const jenisFaskes = ref([
  {
    code: 1,
    caption: 'Faskes 1',
  },
  {
    code: 2,
    caption: 'Faskes 2',
  },
])

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

const showinfo = (message) => {
  toast.add({
    severity: 'info',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

const listFaskes = ref([])

const nama_faskes_find = ref(null)

const fetchData = async () => {
  try {
    if (nama_faskes_find.value == null) {
      showError('Kata kuncil wajib diisi')
      return
    }
    loading.value = true
    const url = configStore.apiBaseUrl

    const payload = {
      id_client: id_client.value,
      jenis_faskes: jenisFaskesSelected.value.code,
      nama_faskes: nama_faskes_find.value,
    }

    const response = await axios.post(`${url}/index.php/api/bpjs_api/referensi_ppk`, payload) // ✅ Cleaner syntax

    // Handle different response structures

    if (response.data.metaData.code != '200') {
      showWarning(response.data.metaData.message)
    } else {
      if (response.data) {
        if (response.data.response?.list) {
          listFaskes.value = response.data.response.list
        } else if (Array.isArray(response.data)) {
          listFaskes.value = response.data
        } else {
          listFaskes.value = []
        }
      } else {
        listFaskes.value = []
      }
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError(error)
    loading.value = false
  }
}

onMounted(() => {})
</script>
