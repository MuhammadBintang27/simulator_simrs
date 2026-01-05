<template>
  <section class="content">
    <Message style="background-color: blanchedalmond; color: gray">
      <p style="font-size: 14px">
        Petugas Operasi digunakan untuk menentukan tenaga medis yang terlibat dalam sebuah tindakan
        operasi. Pada tahap ini, pengguna dapat memilih dokter maupun perawat sesuai peran dan
        tanggung jawab masing-masing dalam tim operasi.
      </p>
    </Message>

    <hr />

    <Panel>
      <h5 class="mt-0 mb-3"><b>PETUGAS PELAKSANA</b></h5>
      <hr />
      <div class="row mt">
        <!-- dr_bedah -->
        <div class="col-md-4 mb-3">
          <label>Dr. Bedah/Obgyn</label>
          <Select
            v-model="form.dr_bedah"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="-- Dokter Bedah --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- dr_anestesi -->
        <div class="col-md-4 mb-3">
          <label>Dr. Anestesi</label>
          <Select
            v-model="form.dr_anestesi"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="-- Dokter Anestesi --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- prw_bedah_1 -->
        <div class="col-md-4 mb-3">
          <label>Prw. Bedah 1</label>
          <Select
            v-model="form.prw_bedah_1"
            @filter="(event) => getda_user(event, 'prw_bedah_1')"
            :options="data_user.prw_bedah_1 || []"
            optionLabel="NAMA_USER"
            placeholder="-- Perawat Bedah --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- ast_dr_bedah_1 -->
        <div class="col-md-4 mb-3">
          <label>Ast. Dr. Bedah 1</label>
          <Select
            v-model="form.ast_dr_bedah_1"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="-- Asisten Dokter Bedah --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- ast_dr_anestesi -->
        <div class="col-md-4 mb-3">
          <label>Ast. Dr. Anestesi</label>
          <Select
            v-model="form.ast_dr_anestesi"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="-- Asisten Dr. Anestesi --"
            class="w-100"
            showClear
            filter
          />
        </div>
        <!-- prw_bedah_2 -->
        <div class="col-md-4 mb-3">
          <label>Prw. Bedah 2</label>
          <Select
            v-model="form.prw_bedah_2"
            @filter="(event) => getda_user(event, 'prw_bedah_2')"
            :options="data_user.prw_bedah_2 || []"
            optionLabel="NAMA_USER"
            placeholder="-- Perawat Bedah --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- ast_dr_bedah_2 -->
        <div class="col-md-4 mb-3">
          <label>Ast. Dr. Bedah 2</label>
          <Select
            v-model="form.ast_dr_bedah_2"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="-- Asisten Dokter Bedah --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- dr_anak -->
        <div class="col-md-4 mb-3">
          <label>Dr. Anak</label>
          <Select
            v-model="form.dr_anak"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="-- Dokter Anak --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- prw_sirkuler -->
        <div class="col-md-4 mb-3">
          <label>Prw. Sirkuler</label>
          <Select
            v-model="form.prw_sirkuler"
            @filter="(event) => getda_user(event, 'prw_sirkuler')"
            :options="data_user.prw_sirkuler || []"
            optionLabel="NAMA_USER"
            placeholder="-- Perawat Sirkuler --"
            class="w-100"
            showClear
            filter
          />
        </div>

        <!-- ast_dr_bedah_3 -->
        <div class="col-md-4 mb-3">
          <label>Ast. Dr. Bedah 3</label>
          <Select
            v-model="form.ast_dr_bedah_3"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="-- Asisten Dokter Bedah --"
            class="w-100"
            showClear
            filter
          />
        </div>
        <!-- prw_anak -->
        <div class="col-md-4 mb-3">
          <label>Prw. Anak</label>

          <Select
            v-model="form.prw_anak"
            @filter="(event) => getda_user(event, 'prw_anak')"
            :options="data_user.prw_anak || []"
            optionLabel="NAMA_USER"
            placeholder="-- Perawat Anak --"
            class="w-100"
            showClear
            filter
          />
        </div>
        <!-- prw_instrumen -->
        <div class="col-md-4 mb-3">
          <label>Prw. Instrumen</label>
          <Select
            v-model="form.prw_instrumen"
            @filter="(event) => getda_user(event, 'prw_instrumen')"
            :options="data_user.prw_instrumen || []"
            optionLabel="NAMA_USER"
            placeholder="-- Perawat Instrumen --"
            class="w-100"
            showClear
            filter
          />
        </div>
      </div>

      <!-- Submit -->
      <div class="row">
        <div class="col-12 text-center">
          <Button
            label="Simpan"
            class="round-button2"
            icon="pi pi-save"
            @click="simpan_data"
            :loading="loading"
          />
        </div>
      </div>
    </Panel>
    <Toast />
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

import { useRoute } from 'vue-router'
const route = useRoute()

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// Form data with proper initial values
const form = ref({
  noregister: route.query.noreg,
  kodeboking: route.query.kodebooking,
  dr_bedah: { KDDOKTER: null, NAMADOKTER: null },
  dr_anestesi: { KDDOKTER: null, NAMADOKTER: null },
  prw_bedah_1: { NIP: null, NAMA_USER: null },
  ast_dr_bedah_1: { KDDOKTER: null, NAMADOKTER: null },
  ast_dr_anestesi: { KDDOKTER: null, NAMADOKTER: null },
  prw_bedah_2: { NIP: null, NAMA_USER: null },
  ast_dr_bedah_2: { KDDOKTER: null, NAMADOKTER: null },
  dr_anak: { KDDOKTER: null, NAMADOKTER: null },
  prw_sirkuler: { NIP: null, NAMA_USER: null },
  ast_dr_bedah_3: { KDDOKTER: null, NAMADOKTER: null },
  prw_anak: { NIP: null, NAMA_USER: null },
  prw_instrumen: { NIP: null, NAMA_USER: null },
  id_client: id_client.value,
})

const loading = ref(false)
const list_dokter = ref([])

// Separate data for each select to avoid conflicts
const data_user = reactive({
  prw_bedah_1: [],
  prw_bedah_2: [],
  prw_sirkuler: [],
  prw_anak: [],
  prw_instrumen: [],
})

const time_selected = ref(null)

// Get doctors data
const get_data_tim_operasi = async () => {
  try {
    loading.value = true

    const param = {
      id_client: id_client.value,
      kodeboking: route.query.kodebooking,
      mode: 1,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/get_data_tim_operasi`, param)

    if (response.data.response) {
      time_selected.value = response.data.response[0]

      form.value.dr_bedah.KDDOKTER = time_selected.value?.dr_bedah
      form.value.dr_bedah.NAMADOKTER = time_selected.value?.nama_dokter_bedah

      form.value.dr_anestesi.KDDOKTER = time_selected.value?.dr_anestesi
      form.value.dr_anestesi.NAMADOKTER = time_selected.value?.nama_dr_anestesi

      form.value.ast_dr_anestesi.KDDOKTER = time_selected.value?.ast_dr_anestesi
      form.value.ast_dr_anestesi.NAMADOKTER = time_selected.value?.nama_ast_dr_anestesi

      form.value.ast_dr_bedah_1.KDDOKTER = time_selected.value?.ast_dr_bedah_1
      form.value.ast_dr_bedah_1.NAMADOKTER = time_selected.value?.nama_ast_dr_bedah_1

      form.value.ast_dr_bedah_2.KDDOKTER = time_selected.value?.ast_dr_bedah_2
      form.value.ast_dr_bedah_2.NAMADOKTER = time_selected.value?.nama_ast_dr_bedah_2

      form.value.ast_dr_bedah_3.KDDOKTER = time_selected.value?.ast_dr_bedah_3
      form.value.ast_dr_bedah_3.NAMADOKTER = time_selected.value?.nama_ast_dr_bedah_3

      form.value.dr_anak.KDDOKTER = time_selected.value?.dr_anak
      form.value.dr_anak.NAMADOKTER = time_selected.value?.nama_dr_anak

      //////////////////

      data_user.prw_bedah_1.push({
        NIP: time_selected.value?.prw_bedah_1 || null,
        NAMA_USER: time_selected.value?.nama_prw_bdh_1 || '',
      })

      data_user.prw_bedah_2.push({
        NIP: time_selected.value?.prw_bedah_2 || null,
        NAMA_USER: time_selected.value?.nama_prw_bdh_2 || '',
      })

      form.value.prw_bedah_1.NIP = time_selected.value?.prw_bedah_1
      form.value.prw_bedah_1.NAMA_USER = time_selected.value?.nama_prw_bdh_1

      form.value.prw_bedah_2.NIP = time_selected.value?.prw_bedah_2
      form.value.prw_bedah_2.NAMA_USER = time_selected.value?.nama_prw_bdh_2

      /////data bedah
      form.value.prw_sirkuler.NIP = time_selected.value?.prw_sirkuler
      form.value.prw_sirkuler.NAMA_USER = time_selected.value?.nama_prw_sirkuler

      data_user.prw_sirkuler.push({
        NIP: time_selected.value?.prw_sirkuler || null,
        NAMA_USER: time_selected.value?.nama_prw_sirkuler || '',
      })

      ///////
      form.value.prw_anak.NIP = time_selected.value?.prw_anak
      form.value.prw_anak.NAMA_USER = time_selected.value?.nama_prw_anak

      data_user.prw_anak.push({
        NIP: time_selected.value?.prw_anak || null,
        NAMA_USER: time_selected.value?.nama_prw_anak || '',
      })

      ////

      form.value.prw_instrumen.NIP = time_selected.value?.prw_instrumen
      form.value.prw_instrumen.NAMA_USER = time_selected.value?.nama_prw_instrumen

      data_user.prw_instrumen.push({
        NIP: time_selected.value?.prw_instrumen || null,
        NAMA_USER: time_selected.value?.nama_prw_instrumen || '',
      })
    }
  } catch (error) {
    console.error('Error fetching doctors:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch doctors data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const simpan_data = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/simpan_tim_operasi`,
      form.value,
    ) // ✅ Cleaner syntax

    if (response.data.metadata.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: response.data.metadata.message,
        life: 3000,
      })
      loading.value = false
    } else {
      console.log(response.data.message)
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Get doctors data
const getda_tadokter = async () => {
  try {
    loading.value = true

    const param = {
      id_client: id_client.value,
      mode: 2,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/datadokterv3`, param)

    if (response.data && response.data.response) {
      list_dokter.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching doctors:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch doctors data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

// Get users data with field-specific filtering
const getda_user = async (event, fieldName) => {
  try {
    // Get the filter value from the event
    const filterValue = event?.value || ''

    if (!filterValue || filterValue.length < 2) {
      data_user[fieldName] = []
      return
    }

    const param = {
      id_client: id_client.value,
      mode: 1,
      nama: filterValue,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/get_list_nama_user`,
      param,
    )
    if (response.data && response.data.metadata && response.data.metadata.code == 200) {
      // Update the specific field's options
      data_user[fieldName] = response.data.response || []
    } else {
      data_user[fieldName] = []
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    data_user[fieldName] = [] // Reset on error
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch user data',
      life: 3000,
    })
  }
}

// Submit form function

onMounted(() => {
  getda_tadokter()
  get_data_tim_operasi()
})
</script>

<style scoped>
label {
  font-weight: 600;
}
</style>
