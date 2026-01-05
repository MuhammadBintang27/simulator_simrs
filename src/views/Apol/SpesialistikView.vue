<template>
  <Panel>
    <template #header> </template>

    <DataTable
      :value="listSpesialistik"
      :paginator="true"
      :rows="10"
      :rows-per-page-options="[5, 10, 20]"
      responsiveLayout="scroll"
      striped-rows
      showGridlines
    >
      <Column field="kode" header="Kode" sortable style="width: 150px"></Column>
      <Column field="nama" header="Nama Klinik" sortable></Column>
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

const listSpesialistik = ref([])

const fetchData = async () => {
  try {
    loading.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/bpjs_api/spesialistik/${id_client.value}`,
    ) // ✅ Cleaner syntax

    console.log(response.data)
    listSpesialistik.value = [...response.data.response.list]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
