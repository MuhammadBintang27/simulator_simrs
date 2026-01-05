<template>
  <div></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id } = storeToRefs(authStore)

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

const fact = ref([])

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/get_data`) // ✅ Cleaner syntax

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Methods
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

const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return null
  }
}

onMounted(() => {})
</script>
