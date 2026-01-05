<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <section class="content">
    <CardPasienTransComponent></CardPasienTransComponent>
    <Tabs value="0" scrollable>
      <TabList>
        <Tab value="0">CHECK LIST PERSIAPAN </Tab>
        <Tab value="1">CHECK LIST KESELAMATAN</Tab>
        <Tab value="2">PENANDAAN LOKASI OPERASI</Tab>
        <Tab value="3">PETUGAS PELAKSANA OPERASI</Tab>
        <Tab value="4">LAPORAN OPERASI</Tab>
        <Tab value="5">FORMULIR ANASTESI</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <Message style="background-color: blanchedalmond; color: gray">
            <p style="font-size: 14px">
              Form Check List Persiapan Operasi ini digunakan untuk memastikan bahwa seluruh
              persyaratan medis, administrasi, serta kebutuhan pasien telah dipenuhi sebelum
              tindakan pembedahan dilaksanakan. Pemeriksaan dilakukan secara berjenjang oleh
              perawat, dokter anestesi, dan dokter operator untuk menjamin keselamatan pasien
              (patient safety) serta menghindari kesalahan prosedur.
            </p></Message
          >

          <Panel class="mt-1">
            <!-- KONDISI PASIEN -->
            <template #header>
              <h5><b>KONDISI PASIEN</b></h5>
            </template>
            <hr />
            <div class="row">
              <div class="col-md-6 mb-2">
                <label>Diagnosa Pasien</label>
                <InputText
                  v-model="form.diagnosa"
                  class="form-control"
                  placeholder="Diagnosa Pasien"
                />
              </div>
              <div class="col-md-3 mb-2">
                <label>Nadi</label>
                <div class="input-group">
                  <InputText
                    v-model="form.nadi"
                    class="form-control"
                    placeholder="Kondisi Nadi Pasien"
                  />
                  <span class="input-group-text">bpm</span>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <label>Nafas</label>
                <div class="input-group">
                  <InputText v-model="form.nafas" class="form-control" placeholder="Nafas Pasien" />
                  <span class="input-group-text">x/menit</span>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-3 mb-2">
                <label>Tekanan Darah</label>
                <div class="input-group">
                  <InputText
                    v-model="form.tekananDarahSistol"
                    class="form-control"
                    placeholder="Tekanan Darah"
                  />
                  <span class="input-group-text">/</span>
                  <InputText v-model="form.tekananDarahDiastol" class="form-control" />
                  <span class="input-group-text">mmHg</span>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <label>Suhu Badan</label>
                <div class="input-group">
                  <InputText
                    v-model="form.suhu"
                    class="form-control"
                    placeholder="Suhu Badan Pasien"
                  />
                  <span class="input-group-text">°C</span>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <label>Tinggi Badan</label>
                <div class="input-group">
                  <InputText
                    v-model="form.tinggi"
                    class="form-control"
                    placeholder="Tinggi Badan Pasien"
                  />
                  <span class="input-group-text">cm</span>
                </div>
              </div>
              <div class="col-md-3 mb-2">
                <label>Berat Badan</label>
                <div class="input-group">
                  <InputText
                    v-model="form.berat"
                    class="form-control"
                    placeholder="Berat Badan Pasien"
                  />
                  <span class="input-group-text">kg</span>
                </div>
              </div>
            </div>
          </Panel>
          <!-- PERSIAPAN PASIEN -->
          <Panel class="mt-1">
            <template #header>
              <h5 class="mt-0"><b>PERSIAPAN PASIEN</b></h5>
            </template>

            <hr />
            <div class="row">
              <div class="col-md-6 mb-2">
                <label>Persiapan Darah CC</label>
                <div class="input-group">
                  <InputText
                    v-model="form.persiapanDarah"
                    type="number"
                    class="form-control"
                    placeholder="Persiapan Darah"
                  />
                  <span class="input-group-text">CC</span>
                </div>
              </div>
              <div class="col-md-6 mb-2">
                <label>Puasa Mulai Jam</label>
                <div class="input-group">
                  <span class="input-group-text"></span>
                  <InputText
                    v-model="form.puasaMulai"
                    class="form-control"
                    placeholder="Puasa Mulai Jam"
                  />
                </div>
              </div>
            </div>

            <div class="row mt-2">
              <div class="col-md-6 mb-2">
                <label>Lakukan Clysma/Glycerin</label><br />
                <RadioButton inputId="clysmaYa" name="clysma" value="Ya" v-model="form.clysma" />
                <label for="clysmaYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="clysmaTidak"
                  name="clysma"
                  class="ml-5"
                  value="Tidak"
                  v-model="form.clysma"
                />
                <label for="clysmaTidak" class="ms-1">Tidak</label>
              </div>

              <div class="col-md-6 mb-2">
                <label>Lepas Gigi Palsu/lensa kontak/hearing aid</label><br />
                <RadioButton inputId="gigiYa" name="gigi" value="Ya" v-model="form.gigi" />

                <label for="gigiYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="gigiTidak"
                  class="ml-5"
                  name="gigi"
                  value="Tidak"
                  v-model="form.gigi"
                />
                <label for="gigiTidak" class="ms-1">Tidak</label>
              </div>
            </div>

            <div class="row mt-2">
              <div class="col-md-6 mb-2">
                <label>Amankan Barang Berharga</label><br />
                <RadioButton inputId="barangYa" name="barang" value="Ya" v-model="form.barang" />
                <label for="barangYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="barangTidak"
                  class="ml-5"
                  name="barang"
                  value="Tidak"
                  v-model="form.barang"
                />
                <label for="barangTidak" class="ms-1">Tidak</label>
              </div>

              <div class="col-md-6 mb-2">
                <label>Hapus Makeup/Cutex</label><br />
                <RadioButton inputId="makeupYa" name="makeup" value="Ya" v-model="form.makeup" />
                <label for="makeupYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="makeupTidak"
                  name="makeup"
                  class="ml-5"
                  value="Tidak"
                  v-model="form.makeup"
                />
                <label for="makeupTidak" class="ms-1">Tidak</label>
              </div>
            </div>

            <div class="row mt-2">
              <div class="col-md-6 mb-2">
                <label>Pengosongan Kandung Kemih</label><br />
                <RadioButton inputId="kemihYa" name="kemih" value="Ya" v-model="form.kemih" />
                <label for="kemihYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="kemihTidak"
                  class="ml-5"
                  name="kemih"
                  value="Tidak"
                  v-model="form.kemih"
                />
                <label for="kemihTidak" class="ms-1">Tidak</label>
              </div>

              <div class="col-md-6 mb-2">
                <label>Pasien Sedang Haid</label><br />
                <RadioButton inputId="haidYa" name="haid" value="Ya" v-model="form.haid" />
                <label for="haidYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="haidTidak"
                  class="ml-5"
                  name="haid"
                  value="Tidak"
                  v-model="form.haid"
                />
                <label for="haidTidak" class="ms-1">Tidak</label>
              </div>
            </div>
          </Panel>

          <Panel class="mt-1">
            <!-- PERSIAPAN ADMINISTRASI -->
            <template #header>
              <h5 class="mt-0"><b>PERSIAPAN ADMINISTRASI</b></h5>
            </template>

            <hr />
            <div class="row">
              <div class="col-md-4 mb-2">
                <label>Status Sudah Dilengkapi</label><br />
                <RadioButton inputId="statusYa" name="status" value="Ya" v-model="form.status" />
                <label for="statusYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="statusTidak"
                  class="ml-5"
                  name="status"
                  value="Tidak"
                  v-model="form.status"
                />
                <label for="statusTidak" class="ms-1">Tidak</label>
              </div>

              <div class="col-md-4 mb-2">
                <label>Tandatangan Persetujuan Tindakan Operasi</label><br />
                <RadioButton inputId="operasiYa" name="operasi" value="Ya" v-model="form.operasi" />
                <label for="operasiYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="operasiTidak"
                  class="ml-5"
                  name="operasi"
                  value="Tidak"
                  v-model="form.operasi"
                />
                <label for="operasiTidak" class="ms-1">Tidak</label>
              </div>

              <div class="col-md-4 mb-2">
                <label>Tandatangan Persetujuan Tindakan Anestesi</label><br />
                <RadioButton
                  inputId="anestesiYa"
                  name="anestesi"
                  value="Ya"
                  v-model="form.anestesi"
                />
                <label for="anestesiYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="anestesiTidak"
                  name="anestesi"
                  value="Tidak"
                  class="ml-5"
                  v-model="form.anestesi"
                />
                <label for="anestesiTidak" class="ms-1">Tidak</label>
              </div>
            </div>

            <div class="row mt-2">
              <div class="col-md-4 mb-2">
                <label>Ada Hasil Pemeriksaan Laboratorium</label><br />
                <RadioButton inputId="labYa" name="lab" value="Ya" v-model="form.laboratorium" />
                <label for="labYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="labTidak"
                  class="ml-5"
                  name="lab"
                  value="Tidak"
                  v-model="form.laboratorium"
                />
                <label for="labTidak" class="ms-1">Tidak</label>
              </div>

              <div class="col-md-4 mb-2">
                <label>Ada Hasil Pemeriksaan Radiologi</label><br />
                <RadioButton
                  inputId="radiologiYa"
                  name="radiologi"
                  value="Ya"
                  v-model="form.radiologi"
                />
                <label for="radiologiYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="radiologiTidak"
                  name="radiologi"
                  value="Tidak"
                  class="ml-5"
                  v-model="form.radiologi"
                />
                <label for="radiologiTidak" class="ms-1">Tidak</label>
              </div>

              <div class="col-md-4 mb-2">
                <label>Ada Hasil Pemeriksaan EKG</label><br />
                <RadioButton inputId="ekgYa" name="ekg" value="Ya" v-model="form.ekg" />
                <label for="ekgYa" class="me-3 ms-1">Ya</label>
                <RadioButton
                  inputId="ekgTidak"
                  class="ml-5"
                  name="ekg"
                  value="Tidak"
                  v-model="form.ekg"
                />
                <label for="ekgTidak" class="ms-1">Tidak</label>
              </div>
            </div>

            <hr />
            <!-- BUTTON ACTION -->
            <div class="text-center mt-4">
              <Button label="Simpan" icon="pi pi-save" @click="simpan_data" />
              <Button
                label="Lakukan Otorisasi"
                severity="danger"
                @click="showDialog = true"
                icon="pi pi-lock"
              />
            </div>
          </Panel>
        </TabPanel>
        <TabPanel value="1">
          <ChecklistKeselamatanView></ChecklistKeselamatanView>
        </TabPanel>
        <TabPanel value="2">
          <PenandaanLokasiOperasiView></PenandaanLokasiOperasiView>
        </TabPanel>
        <TabPanel value="3">
          <PetugasPelaksanaOperasiView></PetugasPelaksanaOperasiView>
        </TabPanel>
        <TabPanel value="4">
          <LaporanOperasiView></LaporanOperasiView>
        </TabPanel>
        <TabPanel value="5">
          <FormulirAnastesi></FormulirAnastesi>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </section>
  <Toast />
  <ttdUser
    v-model:showFormOtorisasi="showDialog"
    :noregister="route.query.kodebooking"
    :mode="8"
    @otpVerified="handleOtpSuccess"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'

import CardPasienTransComponent from '@/components/umum/CardPasienTransComponent.vue'

import ChecklistKeselamatanView from '@/views/RuangOperasi/ChecklistKeselamatanView.vue'

import PenandaanLokasiOperasiView from '@/views/RuangOperasi/PenandaanLokasiOperasiView.vue'

import PetugasPelaksanaOperasiView from '@/views/RuangOperasi/PetugasPelaksanaOperasiView.vue'

import LaporanOperasiView from '@/views/RuangOperasi/LaporanOperasiView.vue'

import FormulirAnastesi from '@/views/RuangOperasi/Anestesi/FormulisAnastesiView.vue'

import ttdUser from '@/components/TtdDigitalComponent.vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const showDialog = ref(false)

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'

import { useRoute } from 'vue-router'
const route = useRoute()

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: 'Message Content',
    life: 3000,
  })
}

const form = ref({
  noregister: route.query.noreg,
  kodeboking: route.query.kodebooking,
  diagnosa: '',
  nadi: '',
  nafas: '',
  tekananDarahSistol: '',
  tekananDarahDiastol: '',
  suhu: '',
  tinggi: '',
  berat: '',
  persiapanDarah: '',
  puasaMulai: '',
  clysma: 'Tidak',
  gigi: 'Tidak',
  barang: 'Tidak',
  makeup: 'Tidak',
  kemih: 'Tidak',
  haid: 'Tidak',
  id_client: id_client.value,
})

const fact = ref([])

const handleOtpSuccess = (data) => {
  if (data?.verified == true) {
    console.log(data)
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
    const response = await axios.post(`${url}/index.php/api/triaseigd/get_persiapan_operasi`, param) // ✅ Cleaner syntax

    if (response.data.metadata.code == 200) {
      form.value = response.data.response
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const simpan_data = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/persiapan_operasi`,
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped></style>
