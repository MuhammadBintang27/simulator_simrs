<template>
  <Panel>
    <template #header>
      <h6 style="color: darkcyan"><strong>LIST OBAT</strong></h6></template
    >
    <div class="form-group">
      <label class="ml-2">Kode Jenis Obat</label>
      <Select
        class="ml-2"
        style="width: 20em"
        :options="JenisObat"
        optionLabel="caption"
        v-model="JenisObatSelected"
      />

      <label class="ml-2">Nama Obat</label>
      <InputText class="ml-2" v-model="kunci_pencarian" @keyup.enter="fetchData" />

      <label class="filter-label ml-2"> Tanggal Resep </label>
      <DatePicker
        v-model="tanggalResep"
        dateFormat="dd M yy"
        placeholder="Pilih tanggal mulai"
        showIcon
        class="ml-2"
        iconDisplay="input"
      />

      <Button class="round-button2 ml-2" :loading="loading" @click="fetchData" label="Cari data" />
    </div>

    <DataTable
      :value="listObat"
      :paginator="true"
      :rows="5"
      :rows-per-page-options="[5, 10, 20]"
      responsiveLayout="scroll"
      striped-rows
      showGridlines
    >
      <Column field="kode" header="Kode" sortable style="width: 150px"></Column>
      <Column field="nama" header="Nama" sortable></Column>
      <Column field="harga" header="Harga" sortable></Column>
    </DataTable>
  </Panel>
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

import DatePicker from 'primevue/datepicker'

const tanggalResep = ref(new Date())

const JenisObat = ref([
  {
    code: 1,
    caption: 'Obat PRB',
  },
  {
    code: 2,
    caption: 'Obat Kronis Belum Stabil',
  },
  {
    code: 3,
    caption: 'Obat Kemoterapi',
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

const fact = ref([])

const kunci_pencarian = ref(null)

const listObat = ref([])

const JenisObatSelected = ref({
  code: 1,
  caption: 'Obat PRB',
})

const fetchData = async () => {
  try {
    loading.value = true

    const payload = {
      kd_jenis_resep: JenisObatSelected.value.code,
      key_word: kunci_pencarian.value,
      tanggal_resep: formatDateForAPI(tanggalResep.value),
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/obat`, payload) // ✅ Cleaner syntax

    if (response.data.metaData.code == '200') {
      listObat.value = response.data.response.list || []
    } else {
      showWarning(response.data.metaData.message)
    }

    console.log(response.data)
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const formatDateForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return null
  }
}

onMounted(() => {
  fetchData
})
</script>
