<template>
  <div class="content">
    <div class="grid formgrid p-fluid">
      <!-- No Inventaris -->
      <div class="field col-12 md:col-6">
        <label>No Inventaris</label>
        <InputText v-model="form.no_inventaris" />
      </div>

      <!-- Nama Aset -->
      <div class="field col-12 md:col-6">
        <label>Nama Aset *</label>
        <InputText v-model="form.nama_aset" />
      </div>

      <!-- Kategori -->
      <div class="field col-12 md:col-6">
        <label>Kategori *</label>
        <Dropdown
          v-model="form.kategori_id"
          :options="kategoriOptions"
          optionLabel="nama"
          optionValue="id"
          placeholder="Pilih kategori"
        />
      </div>

      <!-- Kondisi -->
      <div class="field col-12 md:col-6">
        <label>Kondisi</label>
        <Dropdown v-model="form.kondisi" :options="kondisiOptions" placeholder="Pilih kondisi" />
      </div>

      <!-- Merek -->
      <div class="field col-12 md:col-6">
        <label>Merek</label>
        <InputText v-model="form.merek" />
      </div>

      <!-- Model -->
      <div class="field col-12 md:col-6">
        <label>Model / Tipe</label>
        <InputText v-model="form.model_tipe" />
      </div>

      <!-- Serial -->
      <div class="field col-12 md:col-6">
        <label>Serial Number</label>
        <InputText v-model="form.serial_number" />
      </div>

      <!-- Ruangan -->
      <div class="field col-12 md:col-6">
        <label>Ruangan</label>
        <Dropdown
          v-model="form.room_id"
          :options="roomOptions"
          optionLabel="nama"
          optionValue="id"
          placeholder="Pilih ruangan"
        />
      </div>

      <!-- PIC -->
      <div class="field col-12 md:col-6">
        <label>Penanggung Jawab</label>
        <Dropdown
          v-model="form.user_id"
          :options="userOptions"
          optionLabel="nama"
          optionValue="id"
          placeholder="Pilih PIC"
        />
      </div>

      <!-- Tanggal Beli -->
      <div class="field col-12 md:col-6">
        <label>Tanggal Beli</label>
        <Calendar v-model="form.tanggal_beli" dateFormat="yy-mm-dd" />
      </div>

      <!-- Harga -->
      <div class="field col-12 md:col-6">
        <label>Harga Beli</label>
        <InputNumber v-model="form.harga_beli" mode="currency" currency="IDR" locale="id-ID" />
      </div>

      <!-- Garansi -->
      <div class="field col-12 md:col-6">
        <label>Garansi Sampai</label>
        <Calendar v-model="form.garansi_sampai" dateFormat="yy-mm-dd" />
      </div>

      <!-- Keterangan -->
      <div class="field col-12">
        <label>Keterangan</label>
        <Textarea v-model="form.keterangan" rows="3" />
      </div>
    </div>

    <div>
      <Button label="Batal" severity="secondary" @click="visible = false" />
      <Button label="Simpan" icon="pi pi-check" @click="submitForm" />
    </div>
  </div>

  <Button label="Tambah Asset" icon="pi pi-plus" @click="visible = true" />
</template>

<script setup>
import { ref } from 'vue'
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

const visible = ref(false)

const form = ref({
  no_inventaris: '',
  nama_aset: '',
  kategori_id: null,
  kondisi: 'Baik',
  merek: '',
  model_tipe: '',
  serial_number: '',
  room_id: null,
  user_id: null,
  tanggal_beli: null,
  harga_beli: 0,
  garansi_sampai: null,
  keterangan: '',
})

/* Dummy data – ganti dari API */
const kategoriOptions = ref([
  { id: 1, nama: 'IT' },
  { id: 2, nama: 'Alat Medis' },
])

const roomOptions = ref([
  { id: 1, nama: 'Ruang Server' },
  { id: 2, nama: 'IGD' },
])

const userOptions = ref([
  { id: 1, nama: 'Ahmad Fauzi' },
  { id: 2, nama: 'Siti Aminah' },
])

const kondisiOptions = ['Baik', 'Dalam Perbaikan', 'Rusak', 'Tidak Aktif']

const submitForm = () => {
  if (!form.value.nama_aset || !form.value.kategori_id) {
    alert('Nama aset dan kategori wajib diisi')
    return
  }
  // contoh axios:
  // axios.post('/api/assets', form.value)

  visible.value = false
}

const fact = ref([])
const push_data = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/input_asset`, form.value) // ✅ Cleaner syntax

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
</script>

<style scoped>
.field label {
  font-weight: 600;
}
</style>
