<template>
  <div class="content">
    <div class="card elevation-0">
      <div class="card-header">
        <h4><i class="fas fa-file-invoice-dollar mr-2"></i> Imunsasi</h4>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            {{ SelectedPasien }}
          </div>
        </div>
      </div>
    </div>

    <div class="card elevation-0">
      <div class="card-body">
        <Button
          label="Imunisasi Baru"
          icon="pi pi-plus"
          @click="$refs.dialogRef.openDialog()"
          class="mb-3 round-button2"
        />
      </div>
    </div>

    <PasienFinderComponent ref="dialogRef" @select:pasien="onPasienSelected" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

import PasienFinderComponent from '@/components/umum/PasienFinderComponent.vue'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const dialogRef = ref(null)

import { useRouter } from 'vue-router'
const router = useRouter()

const SelectedPasien = ref(null)
const onPasienSelected = (pasien) => {
  Entri_imunisasi(pasien)
  //SelectedPasien.value = pasien
}

const Entri_imunisasi = (data) => {
  const routeData = router.resolve({
    name: 'EntriImunisasiView',
    params: {
      id: data.NOPENDAFTARAN,
    },
  })
  window.open(routeData.href, '_blank')
}

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
