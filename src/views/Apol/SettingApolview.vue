<template>
  <Panel>
    <template #header> <h6>SETTING</h6> </template>

    <div class="row">
      <!-- Bagian Kiri -->
      <div class="col-md-6">
        <div class="form-group">
          <label>KODE PPK</label><br />
          <InputText v-model="dataSetting.kode" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>NAMA APOTEK</label><br />
          <InputText v-model="dataSetting.namaapoteker" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>KEPALA APOTEK</label><br />
          <InputText v-model="dataSetting.namakepala" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>JABATAN KEPALA</label><br />
          <InputText v-model="dataSetting.jabatankepala" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>NIP KEPALA</label><br />
          <InputText v-model="dataSetting.nipkepala" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>SIUP</label><br />
          <InputText v-model="dataSetting.siup" class="w-100" />
        </div>
      </div>

      <!-- Bagian Kanan -->
      <div class="col-md-6">
        <div class="form-group">
          <label>ALAMAT</label><br />
          <InputText v-model="dataSetting.alamat" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>KOTA</label><br />
          <InputText v-model="dataSetting.kota" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>NAMA VERIFIKATOR</label><br />
          <InputText v-model="dataSetting.namaverifikator" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>NPP VERIFIKATOR</label><br />
          <InputText v-model="dataSetting.nppverifikator" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>NAMA PETUGAS APOTEK</label><br />
          <InputText v-model="dataSetting.namapetugasapotek" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>NIP PETUGAS APOTEK</label><br />
          <InputText v-model="dataSetting.nippetugasapotek" class="w-100" />
        </div>

        <div class="form-group mt-3">
          <label>CHECK STOCK</label><br />
          <Checkbox v-model="dataSetting.checkstock" :binary="true" />
        </div>
      </div>
    </div>
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

const dataSetting = ref({
  kode: '',
  namaapoteker: '',
  namakepala: '',
  jabatankepala: '',
  nipkepala: '',
  siup: '',
  alamat: '',
  kota: '',
  namaverifikator: '',
  nppverifikator: '',
  namapetugasapotek: '',
  nippetugasapotek: '',
  checkstock: false,
})

const loading = ref(false)

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: 'Message Content',
    life: 3000,
  })
}

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/bpjs_api/get_settingppk/${id_client.value}`,
    ) // ✅ Cleaner syntax

    dataSetting.value = response.data.response
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
