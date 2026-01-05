<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Message style="background-color: blanchedalmond; color: gray">
    <p style="font-size: 14px">
      Form Checklist Keselamatan Pasien Operasi merupakan instrumen standar yang digunakan untuk
      menjamin keselamatan pasien selama menjalani tindakan pembedahan. Checklist ini harus diisi
      oleh tim medis yang terlibat, meliputi perawat, dokter anestesi, dan dokter operator, dengan
      tujuan mencegah terjadinya kesalahan identitas, kesalahan prosedur, dan kesalahan lokasi
      operasi.
    </p>
  </Message>

  <div class="row mt-1">
    <!-- SIGN IN -->
    <div class="col-md-4">
      <Panel>
        <template #header>
          <h5><b>SIGN IN</b></h5>
        </template>

        <div class="form-group">
          <label>Tanggal & Jam</label>

          <DatePicker
            v-model="form.signInDate"
            placeholder="Pilih tanggal mulai"
            dateFormat="dd MM yy"
            class="ml-2"
            showTime
            hourFormat="24"
            showIcon
          />
        </div>

        <div class="form-group">
          <label
            >Sudahkah pasien dikonfirmasi ulang identitas, prosedur, lokasi operasi dan inform
            consent?</label
          >
          <div>
            <RadioButton inputId="confirmYes" value="Sudah" v-model="form.confirmPatient" />
            <label for="confirmYes" class="ml-2 mr-4">Sudah</label>

            <RadioButton inputId="confirmNo" value="Belum" v-model="form.confirmPatient" />
            <label for="confirmNo" class="ml-2">Belum</label>
          </div>
        </div>

        <div class="form-group">
          <label>Apakah lokasi operasi sudah ditandai?</label>
          <div>
            <RadioButton inputId="lokasiYes" value="Sudah" v-model="form.lokasiOperasi" />
            <label for="lokasiYes" class="ml-2 mr-4">Sudah</label>

            <RadioButton inputId="lokasiNo" value="Belum" v-model="form.lokasiOperasi" />
            <label for="lokasiNo" class="ml-2">Belum</label>
          </div>
        </div>

        <div class="form-group">
          <label>Apakah mesin anastesi dan obat-obatan anastesi sudah lengkap?</label>
          <div>
            <RadioButton inputId="anastesiYes" value="Sudah" v-model="form.anastesi" />
            <label for="anastesiYes" class="ml-2 mr-4">Sudah</label>

            <RadioButton inputId="anastesiNo" value="Belum" v-model="form.anastesi" />
            <label for="anastesiNo" class="ml-2">Belum</label>
          </div>
        </div>

        <div class="form-group">
          <label
            >Apakah pulse oksimetri sudah dipasang pada pasien dan berfungsi dengan baik?</label
          >
          <div>
            <RadioButton inputId="oksiYes" value="Sudah" v-model="form.oksimetri" />
            <label for="oksiYes" class="ml-2 mr-4">Sudah</label>

            <RadioButton inputId="oksiNo" value="Belum" v-model="form.oksimetri" />
            <label for="oksiNo" class="ml-2">Belum</label>
          </div>
        </div>

        <div class="form-group">
          <label>Pasien Memiliki Alergi?</label>
          <div>
            <RadioButton inputId="alergiYes" value="Ya" v-model="form.alergi" />
            <label for="alergiYes" class="ml-2 mr-4">Ya</label>

            <RadioButton inputId="alergiNo" value="Tidak" v-model="form.alergi" />
            <label for="alergiNo" class="ml-2">Tidak</label>
          </div>
        </div>

        <div class="form-group">
          <label>Adakah Resiko Aspirasi?</label>
          <div>
            <RadioButton inputId="aspirasiYes" value="Ya" v-model="form.aspirasi" />
            <label for="aspirasiYes" class="ml-2 mr-4">Ya</label>

            <RadioButton inputId="aspirasiNo" value="Tidak" v-model="form.aspirasi" />
            <label for="aspirasiNo" class="ml-2">Tidak</label>
          </div>
        </div>

        <div class="form-group">
          <label>Adakah Resiko Pendarahan?</label>
          <div>
            <RadioButton inputId="darahYes" value="Ya" v-model="form.pendarahan" />
            <label for="darahYes" class="ml-2 mr-4">Ya</label>

            <RadioButton inputId="darahNo" value="Tidak" v-model="form.pendarahan" />
            <label for="darahNo" class="ml-2">Tidak</label>
          </div>
        </div>
      </Panel>
    </div>

    <!-- TIME OUT -->
    <div class="col-md-4">
      <Panel>
        <template #header>
          <h5><b>TIME OUT</b></h5>
        </template>

        <div class="form-group">
          <label>Tanggal & Jam</label>

          <DatePicker
            v-model="form.timeOutDate"
            dateFormat="dd MM yy"
            placeholder="Pilih tanggal dan waktu"
            class="ml-2"
            showTime
            hourFormat="24"
            showIcon
          />
        </div>

        <div class="form-group">
          <label>Konfirmasi semua anggota tim, memperkenalkan nama dan tugasnya</label>
          <div>
            <RadioButton inputId="timYes" value="Sudah" v-model="form.konfirmasiTim" />
            <label for="timYes" class="ml-2 mr-4">Sudah</label>

            <RadioButton inputId="timNo" value="Belum" v-model="form.konfirmasiTim" />
            <label for="timNo" class="ml-2">Belum</label>
          </div>
        </div>

        <div class="form-group">
          <label
            >Dokter Bedah, Anestesi dan Perawat melakukan konfirmasi secara verbal nama pasien,
            prosedur dan dimana insisi akan dilakukan</label
          >
          <div>
            <RadioButton inputId="verbalYes" value="Sudah" v-model="form.konfirmasiVerbal" />
            <label for="verbalYes" class="ml-2 mr-4">Sudah</label>

            <RadioButton inputId="verbalNo" value="Belum" v-model="form.konfirmasiVerbal" />
            <label for="verbalNo" class="ml-2">Belum</label>
          </div>
        </div>

        <div class="form-group">
          <label><strong>Antisipasi Keadaan Kritis</strong></label>
          <div class="ml-3">
            <div>
              <Checkbox inputId="kritisdokter" v-model="form.kritis" value="dokter" />
              <label for="kritisdokter" class="ml-2"
                >Dokter Bedah: Keadaan kritis, langkah tidak diharapkan, lama operasi,<br />
                antisipasi kehilangan darah</label
              >
            </div>
            <div>
              <Checkbox inputId="kritisAnestesi" v-model="form.kritis" value="anestesi" />
              <label for="kritisAnestesi" class="ml-2"
                >Dokter Anestesi: Apakah pasien membutuhkan perhatian khusus?</label
              >
            </div>
            <div>
              <Checkbox inputId="kritisPerawat" v-model="form.kritis" value="perawat" />
              <label for="kritisPerawat" class="ml-2"
                >Tim Perawat: Peralatan steril & ada masalah?</label
              >
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Apakah obat profilaksis sudah diberikan 60 menit sebelumnya?</label>
          <div>
            <RadioButton inputId="profilYes" value="Sudah" v-model="form.profilaksis" />
            <label for="profilYes" class="ml-2 mr-4">Sudah</label>

            <RadioButton inputId="profilNo" value="Belum" v-model="form.profilaksis" />
            <label for="profilNo" class="ml-2">Belum</label>
          </div>
        </div>

        <div class="form-group">
          <label>Apakah ada hasil rontgen yang perlu ditampilkan</label>
          <div>
            <RadioButton inputId="rontgenYes" value="Ya" v-model="form.rontgen" />
            <label for="rontgenYes" class="ml-2 mr-4">Ya</label>

            <RadioButton inputId="rontgenNo" value="Tidak" v-model="form.rontgen" />
            <label for="rontgenNo" class="ml-2">Tidak</label>
          </div>
        </div>
      </Panel>
    </div>

    <div class="col-md-4">
      <Panel>
        <template #header>
          <h5><b>SIGN OUT</b></h5>
        </template>

        <!-- Konfirmasi Perawat -->
        <!-- Tanggal -->
        <div class="form-group">
          <label>Tanggal & Waktu</label>

          <DatePicker
            v-model="form.timeSignOut"
            dateFormat="dd MM yy"
            class="ml-2"
            showTime
            showIcon
            hourFormat="24"
          />
        </div>
        <div class="form-group">
          <label>1. Perawat melakukan konfirmasi secara verbal</label>
          <div class="ml-3">
            <div class="form-check">
              <Checkbox v-model="form.konfirmasi" inputId="prosedur" value="prosedur" />
              <label for="prosedur" class="ml-2">Nama prosedur tindakan</label>
            </div>
            <div class="form-check">
              <Checkbox v-model="form.konfirmasi" inputId="instrumen" value="instrumen" />
              <label for="instrumen" class="ml-2"
                >Instrumen, kasa dan jarum telah dihitung dengan benar/lengkap</label
              >
            </div>
            <div class="form-check">
              <Checkbox v-model="form.konfirmasi" inputId="spesimen" value="spesimen" />
              <label for="spesimen" class="ml-2"
                >Spesimen telah diberi label <br />
                (termasuk nama pasien & asal jaringan spesimen)</label
              >
            </div>
          </div>
        </div>

        <!-- Masalah Peralatan -->
        <div class="form-group">
          <label>Apakah ada masalah dengan peralatan selama operasi?</label>
          <div class="ml-3">
            <div class="form-check form-check-inline">
              <RadioButton v-model="form.masalahPeralatan" inputId="ya" value="Ya" />
              <label for="ya" class="ml-2">Ya</label>
            </div>
            <div class="form-check form-check-inline">
              <RadioButton v-model="form.masalahPeralatan" inputId="tidak" value="Tidak" />
              <label for="tidak" class="ml-2">Tidak</label>
            </div>
          </div>
        </div>

        <!-- Review Dokter -->
        <div class="form-group">
          <label>2. Dokter Bedah, Dokter Anestesi & Perawat</label>
          <div class="ml-3">
            <div class="form-check">
              <Checkbox v-model="form.review" inputId="review" value="done" />
              <label for="review" class="ml-2"
                >Telah melakukan review masalah utama untuk pemulihan pasien</label
              >
            </div>
          </div>
        </div>
      </Panel>
    </div>
  </div>

  <!-- Submit -->
  <div class="row">
    <div class="col-12 text-center">
      <Button label="Simpan" icon="pi pi-save" class="round-button2" @click="simpan_data" />
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

import DatePicker from 'primevue/datepicker'

import { useRoute } from 'vue-router'
const route = useRoute()

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const loading = ref(false)

const form = ref({
  noregister: route.query.noreg,
  kodeboking: route.query.kodebooking,
  signInDate: new Date(),
  timeOutDate: new Date(),
  timeSignOut: new Date(),
  confirmPatient: '',
  lokasiOperasi: '',
  anastesi: '',
  oksimetri: '',
  alergi: '',
  aspirasi: '',
  pendarahan: '',
  konfirmasiTim: '',
  konfirmasiVerbal: '',
  kritis: [],
  profilaksis: '',
  rontgen: '',
  konfirmasi: [],
  masalahPeralatan: null,
  review: [],
  id_client: id_client.value,
})

const formatDateTime = (date) => {
  if (!date) return ''
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const formatForDatabase = (dateValue) => {
  try {
    if (!dateValue) return null

    // Ensure we have a Date object
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateValue)
      return null
    }

    // Use Intl.DateTimeFormat for reliable formatting
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false,
    })

    return formatter.format(date).replace('T', ' ')
  } catch (error) {
    console.error('Error formatting date:', error, dateValue)
    return null
  }
}
const simpan_data = async () => {
  try {
    form.value.signInDate = formatForDatabase(form.value.signInDate)
    form.value.timeSignOut = formatForDatabase(form.value.timeSignOut)
    form.value.timeOutDate = formatForDatabase(form.value.timeOutDate)
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/insert_checklist_operasi`,
      form.value,
    ) // ✅ Cleaner syntax

    if (response.data.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: response.data.message,
        life: 3000,
      })
      fetchData()
    } else {
      showSuccess(response.data.message)
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const fetchData = async () => {
  try {
    loading.value = true

    const param = {
      kodeboking: route.query.kodebooking,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/get_check_list_keselamatan`,
      param,
    ) // ✅ Cleaner syntax

    if (response.data.metadata.code == 200) {
      form.value = response.data.response
      form.value.kritis = form.value.kritis ? JSON.parse(form.value.kritis) : []
      form.value.konfirmasi = form.value.konfirmasi ? JSON.parse(form.value.konfirmasi) : []
      form.value.review = form.value.review ? JSON.parse(form.value.review) : []
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>
