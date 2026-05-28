<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Pendaftaran Pasien</h1>
          <p class="hero-description">
            Pendaftaran pasien merupakan langkah awal dalam proses pelayanan kesehatan.
          </p>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien }}</div>
          <div class="stat-label">Total Pasien</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienHariIni }}</div>
          <div class="stat-label">Pasien Hari Ini</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienAktif }}</div>
          <div class="stat-label">Pasien Aktif</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rataKunjungan }}</div>
          <div class="stat-label">Batal</div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-3">
        <!-- Patient Information Panel -->
        <div class="pi-card">
          <!-- Header -->
          <div class="pi-card-header">
            <i class="pi pi-user-circle" style="font-size: 13px"></i>
            <span>Informasi Pasien</span>
          </div>

          <!-- Avatar + Nama + Status -->
          <div
            class="pi-identity"
            :class="peserta.nama ? 'pi-identity-active' : 'pi-identity-empty'"
          >
            <div class="pi-avatar">
              <span v-if="peserta.nama">{{ peserta.nama?.charAt(0)?.toUpperCase() }}</span>
              <i v-else class="pi pi-user" style="font-size: 1.4rem"></i>
            </div>
            <div class="pi-identity-info">
              <div class="pi-name">{{ peserta.nama || 'Belum ada data' }}</div>
              <div class="pi-nokartu" v-if="peserta.noKartu">{{ peserta.noKartu }}</div>
              <span
                v-if="peserta.noKartu"
                class="pi-status-badge"
                :class="
                  peserta.statusPeserta?.keterangan === 'AKTIF'
                    ? 'pi-status-aktif'
                    : 'pi-status-nonaktif'
                "
              >
                <i
                  :class="
                    peserta.statusPeserta?.keterangan === 'AKTIF'
                      ? 'pi pi-check-circle'
                      : 'pi pi-times-circle'
                  "
                ></i>
                {{ peserta.statusPeserta?.keterangan || 'TIDAK AKTIF' }}
              </span>
            </div>
          </div>

          <Divider style="margin: 0" />

          <!-- Info Rows -->
          <div class="pi-info-list" v-if="peserta.nama">
            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #eff6ff; color: #1d4ed8">
                <i class="pi pi-id-card"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">NIK</div>
                <div class="pi-info-val">{{ peserta.nik || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #f0fdf4; color: #15803d">
                <i class="pi pi-mars" v-if="peserta.sex == 'L'"></i>
                <i class="pi pi-venus" v-else-if="peserta.sex == 'P'"></i>
                <i class="pi pi-user" v-else></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Jenis Kelamin</div>
                <div class="pi-info-val">{{ getGenderText(peserta.sex) || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #fef9c3; color: #b45309">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Tanggal Lahir</div>
                <div class="pi-info-val">{{ peserta.tglLahir || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #f5f3ff; color: #6d28d9">
                <i class="pi pi-building"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Faskes Tingkat I</div>
                <div class="pi-info-val">{{ peserta.provUmum?.nmProvider || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #fff1f2; color: #be123c">
                <i class="pi pi-star"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Hak Kelas</div>
                <div class="pi-info-val">{{ peserta.hakKelas?.keterangan || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div class="pi-empty" v-else>
            <img
              src="https://ws-simrs.net/ilustration/ilustrasi1.png"
              alt="Ilustrasi"
              style="width: 100%; max-width: 200px; opacity: 0.6"
            />
            <p>Cari pasien untuk menampilkan informasi</p>
          </div>
        </div>
      </div>

      <div class="col-md-9">
        <FormPendaftaranComponent
          @fungsiInduk="CallDialogPendaftarn"
          :os="peserta"
          ref="GetCaraBayarChild"
        />
      </div>
    </div>

    <Dialog
      v-model:visible="showDialogPendaftaran"
      modal
      :closable="true"
      :style="{ width: '45rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <!-- Icon Header with Gradient -->
      <div class="row">
        <div class="col-md-4">
          <div class="d-flex align-items-center">
            <div class="bg-light p-3 rounded-circle mr-3">
              <i class="fas fa-handshake text-primary fa-lg"></i>
            </div>
          </div>
        </div>

        <div class="col-md-6 d-flex align-items-center">
          <!-- <label class="mb-0 me-2">No. RM</label> -->
          <div class="d-flex align-items-center w-100">
            <div class="d-flex align-items-center mr-2">
              <InputText
                v-model="norm"
                class="flex-grow-1 me-2"
                @keydown.enter="cariByRM"
                placeholder="Cari... RM"
              />
              <Button
                label=""
                icon="pi pi-search"
                @click="cariByRM"
                class="p-button-success p-button-sm"
              />
            </div>
            <Button
              label="Tambah"
              icon="pi pi-user-plus"
              @click="InputPasienBaru"
              class="p-button-success p-button-sm me-2"
            />
            <Button
              label="Edit"
              @click="EditPasien"
              icon="pi pi-user-edit"
              class="p-button-warning p-button-sm"
            />
            <Button
              label="Pasien"
              @click="openPatientDialog()"
              icon="pi pi-database"
              class="p-button-info p-button-sm"
            />
          </div>
        </div>
      </div>
      <div class="card border-0 p-4 elevation-0">
        <!-- Form -->
        <div class="card-body p-0">
          <div class="form-group row align-items-center mb-3">
            <label class="col-md-2 font-weight-semibold" style="color: #4a5568">
              <i class="far fa-calendar-alt mr-2 text-primary"></i>
              Tanggal SEP
            </label>
            <div class="col-md-10">
              <DatePicker v-model="tanggalSEP" dateFormat="dd/mm/yy" showIcon class="w-30" />
            </div>
          </div>

          <div class="form-group row align-items-center mb-3">
            <label class="col-md-2 font-weight-semibold" style="color: #4a5568">
              <i class="fas fa-hashtag mr-2 text-info"></i>
              Nomor BPJS/NIK
            </label>
            <div class="col-md-10">
              <InputText
                v-model="nomorSepOrNik"
                class="w-100"
                placeholder="Masukkan Nomor Rujukan atau SEP"
              />
            </div>
          </div>
          <div class="form-group row align-items-center mb-3">
            <label class="col-md-2 font-weight-semibold" style="color: #4a5568">
              <i class="fas fa-hospital mr-2 text-success"></i>
              Asal Rujukan
            </label>
            <div class="col-md-10">
              <Select
                v-model="asalRujukan"
                :options="asalOptions"
                optionLabel="label"
                optionValue="value"
                class="w-100"
                style="min-width: 150px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)"
              />
            </div>
          </div>

          <div class="form-group row mb-3">
            <div class="col-md-8 offset-md-2">
              <div class="d-flex justify-content-start gap-2">
                <Button
                  label="Cari"
                  @click="callDataOnlinOfline"
                  severity="warn"
                  :loading="isLoading"
                  icon="pi pi-search"
                  class="p-button-sm flex-fill round-button2 mr-1"
                />
                <Button
                  label="Lanjutkan"
                  severity="success"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  @click="showDialogPendaftaran = false"
                  class="p-button-sm flex-fill round-button2 mr-1"
                />
                <Button
                  label="Riwayat BPJS"
                  text
                  icon="pi pi-arrow-"
                  iconPos="right"
                  @click="showDialogPendaftaran = false"
                  class="p-button-sm flex-fill round-button2"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Data Pasien & Riwayat -->
        <div
          class="card mt-4 elevation-0"
          style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)"
        >
          <div
            class="p-4 rounded position-relative overflow-hidden"
            style="min-height: 200px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%)"
          >
            <ScrollPanel style="width: 100%; height: 250px">
              <div class="text-white d-flex align-items-center justify-content-center h-40">
                <table class="table table-sm">
                  <tbody>
                    <!-- Personal Information -->
                    <tr>
                      <th colspan="2" class="text-center">
                        <strong>INFORMASI PRIBADI</strong>
                      </th>
                    </tr>
                    <tr>
                      <td class="font-weight-bold" style="width: 30%">Nomor Kartu</td>
                      <td>{{ peserta.noKartu || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">NIK</td>
                      <td>{{ peserta?.nik || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Nama</td>
                      <td>{{ peserta?.nama || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Jenis Kelamin</td>
                      <td>{{ peserta?.sex || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Tanggal Lahir</td>
                      <td>{{ peserta?.tglLahir || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Umur</td>
                      <td>{{ peserta?.umur?.umurSekarang || '-' }}</td>
                    </tr>

                    <!-- Medical Record -->
                    <tr>
                      <th colspan="2" class="text-center"><strong>REKAM MEDIS</strong></th>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Nomor MR</td>
                      <td>{{ peserta?.mr?.noMR || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">No. Telepon</td>
                      <td>{{ peserta?.mr?.noTelepon || '-' }}</td>
                    </tr>

                    <!-- Insurance Information -->
                    <tr>
                      <th colspan="2" class="text-center">
                        <strong>INFORMASI KEPESERTAAN</strong>
                      </th>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Status Peserta</td>
                      <td style="font-size: small">
                        {{ peserta?.statusPeserta?.keterangan || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Jenis Peserta</td>
                      <td>{{ peserta?.jenisPeserta?.keterangan || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Hak Kelas</td>
                      <td>{{ peserta?.hakKelas?.keterangan || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Tanggal TMT</td>
                      <td>{{ peserta?.tglTMT || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Tanggal TAT</td>
                      <td>{{ peserta?.tglTAT || '-' }}</td>
                    </tr>

                    <!-- Provider Information -->
                    <tr>
                      <th colspan="2" class="text-center">
                        <strong>INFORMASI PROVIDER</strong>
                      </th>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Kode Provider</td>
                      <td>{{ peserta?.provUmum?.kdProvider || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-bold">Nama Provider</td>
                      <td>{{ peserta?.provUmum?.nmProvider || '-' }}</td>
                    </tr>

                    <!-- Additional Information -->
                    <tr v-if="peserta?.informasi || peserta?.cob">
                      <th colspan="2" class="text-center">
                        <strong>INFORMASI TAMBAHAN</strong>
                      </th>
                    </tr>
                    <tr v-if="peserta?.informasi?.noSKTM">
                      <td class="font-weight-bold">No. SKTM</td>
                      <td>{{ peserta?.informasi?.noSKTM }}</td>
                    </tr>
                    <tr v-if="peserta?.informasi?.prolanisPRB">
                      <td class="font-weight-bold">Prolanis/PRB</td>
                      <td>{{ peserta?.informasi?.prolanisPRB }}</td>
                    </tr>
                    <tr v-if="peserta?.cob?.nmAsuransi">
                      <td class="font-weight-bold">COB - Asuransi</td>
                      <td>{{ peserta?.cob?.nmAsuransi }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollPanel>
          </div>
        </div>

        <!-- Bottom gradient card -->
        <div
          class="mt-4 p-3 rounded"
          style="
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #bfdbfe;
          "
        >
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <small class="d-block font-weight-bold" style="color: #1e40af">
                <i class="fas fa-ticket-alt mr-2"></i> NOMOR ANTRIAN
              </small>
              <small style="color: #3b82f6"
                >LOKET <span class="font-weight-bold" style="color: #1e40af">1</span></small
              >
            </div>

            <div class="d-flex align-items-center">
              <a href="#" class="mr-3 font-weight-bold text-decoration-none" style="color: #2563eb">
                <i class="fas fa-users mr-1"></i> Antrian Pasien Online
              </a>
              <span class="mr-3 px-3 py-1 rounded font-weight-bold"> 0 </span>
              <Button label="Panggil Ulang" icon="pi pi-refresh" class="p-button-sm mr-2" />
              <Button label="Panggil" icon="pi pi-volume-up" class="p-button-sm" />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
    <FormInputPasienComponent :os="peserta" :mode="mode_proses_data" :norm="norm" ref="childRef" />

    <ListPasienComponent ref="showPatientDialog" />
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import DatePicker from 'primevue/datepicker'
import ScrollPanel from 'primevue/scrollpanel'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'

import FormPendaftaranComponent from '@/views/Pendaftaran/FormPendaftaranComponent.vue'
import FormInputPasienComponent from '@/views/Pendaftaran/FormInputPasienComponent.vue'
import ListPasienComponent from '@/views/Pendaftaran/ListPasienComponent.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const toast = useToast()

// reactive state
const loading = ref(false)
const showDialogPendaftaran = ref(false)
const totalPasien = ref(0)
const pasienHariIni = ref(0)
const rataKunjungan = ref(0)
const pasienAktif = ref(0)
const fact = ref([])
const listDataRiwayat = ref([])

const tanggalSEP = ref(new Date())
const norm = ref('')
const nomorSepOrNik = ref(null)

const mode_proses_data = ref(1) //1 = input, 2 edit

const GetCaraBayarChild = ref(0)
const function_GetCaraBayarChild = async () => {
  // Access exposed property from child
  return GetCaraBayarChild.value.carabayarSelected.KODE
}
const showPatientDialog = ref(null)
const openPatientDialog = () => {
  showPatientDialog.value.showDialogInputPasien()
}

const childRef = ref(null)
function callChildFunction() {
  if (childRef.value && childRef.value.showDialogInputPasien) {
    childRef.value.showDialogInputPasien()
  }
}

const peserta = ref({
  noKartu: '',
  nik: '',
  nama: '',
  pisa: '',
  sex: '',
  mr: { noMR: '', noTelepon: null },
  tglLahir: '',
  tglCetakKartu: '',
  tglTAT: '',
  tglTMT: '',
  statusPeserta: { kode: '', keterangan: '' },
  provUmum: { kdProvider: '', nmProvider: '' },
  jenisPeserta: { kode: '', keterangan: '' },
  hakKelas: { kode: '', keterangan: '' },
  umur: { umurSekarang: '', umurSaatPelayanan: '' },
  informasi: { dinsos: null, prolanisPRB: null, noSKTM: null, eSEP: null },
  cob: { noAsuransi: null, nmAsuransi: null, tglTMT: null, tglTAT: null },
})

const getGenderText = (sex) => (sex === 'P' ? 'Perempuan' : sex === 'L' ? 'Laki-laki' : '-')

function resetPeserta() {
  peserta.value = {
    noKartu: '',
    nik: '',
    nama: '',
    pisa: '',
    sex: '',
    mr: { noMR: '', noTelepon: null },
    tglLahir: '',
    tglCetakKartu: '',
    tglTAT: '',
    tglTMT: '',
    statusPeserta: { kode: '', keterangan: '' },
    provUmum: { kdProvider: '', nmProvider: '' },
    jenisPeserta: { kode: '', keterangan: '' },
    hakKelas: { kode: '', keterangan: '' },
    umur: { umurSekarang: '', umurSaatPelayanan: '' },
    informasi: { dinsos: null, prolanisPRB: null, noSKTM: null, eSEP: null },
    cob: { noAsuransi: null, nmAsuransi: null, tglTMT: null, tglTAT: null },
  }
}

// search helpers
const cariByRM = async () => {
  // If user typed an RM in norm -> try local lookup first
  if (!norm.value) {
    showWarning('Masukkan No. RM terlebih dahulu')
    return
  }

  await GetDataPasienLocal(3, norm.value)

  // try to load online details if nomorSepOrNik is filled after local fetch
  if (nomorSepOrNik.value) {
    await get_data_pesertaOnline(nomorSepOrNik.value)
  }
}

const setPasienNonBPJS = async () => {
  peserta.value = {
    noKartu: listDataRiwayat.value.NO_KARTU,
    nik: listDataRiwayat.value.NOKTP,
    nama: listDataRiwayat.value.NAMAPASIEN,
    pisa: '',
    sex: listDataRiwayat.value.JENISKELAMIN,
    mr: { noMR: listDataRiwayat.value.NOMR, noTelepon: listDataRiwayat.value.NOTELP },
    tglLahir: listDataRiwayat.value.TGLLAHIR,
    tglCetakKartu: '',
    tglTAT: '',
    tglTMT: '',
    statusPeserta: { kode: '', keterangan: '' },
    provUmum: { kdProvider: '', nmProvider: '' },
    jenisPeserta: { kode: '', keterangan: '' },
    hakKelas: { kode: '', keterangan: '' },
    umur: { umurSekarang: '', umurSaatPelayanan: '' },
    informasi: { dinsos: null, prolanisPRB: null, noSKTM: null, eSEP: null },
    cob: { noAsuransi: null, nmAsuransi: null, tglTMT: null, tglTAT: null },
  }
}

const callDataOnlinOfline = async () => {
  // prefer nomorSepOrNik for online call, otherwise try norm
  const param = nomorSepOrNik.value
  if (!param) {
    showWarning('Masukkan Nomor BPJS / NIK atau No. RM untuk mencari')
    return
  }
  await get_data_pesertaOnline(param)

  if (peserta.value?.noKartu) {
    await GetDataPasienLocal(1, peserta.value?.noKartu)
  }
}
// API calls
const get_data_pesertaOnline = async (nomor) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    resetPeserta()
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/get_data_peserta_v2/${nomor}/${id_client.value}`,
    )

    if (response.data.metaData.code !== '200') {
      showWarning(response.data.metaData.message)
      return
    }

    if (response?.data?.response) {
      peserta.value = response.data.response.peserta
      showSuccess('Data ditemukan')
    } else {
      showWarning('Peserta tidak ditemukan di layanan BPJS')
    }
  } catch (error) {
    console.error('Error get_data_pesertaOnline:', error)
    showError('Gagal mengambil data peserta online')
  } finally {
    loading.value = false
  }
}

const EditPasien = async () => {
  mode_proses_data.value = 2
  callChildFunction()
}

const InputPasienBaru = async () => {
  mode_proses_data.value = 1
  resetPeserta()
  callChildFunction()
}

const GetDataPasienLocal = async (mode, parameter) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = { mode: mode, noka: parameter, nomr: parameter, id_client: id_client.value }
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/GetDataPasien_v3`,
      payload,
    )

    if (response?.data?.metadata?.code === 200 && response.data.response?.length) {
      const first = response.data.response[0]

      listDataRiwayat.value = first
      norm.value = first.NOMR
      nomorSepOrNik.value = first.NO_KARTU

      peserta.value = {
        ...peserta.value,
        mr: { noMR: listDataRiwayat.value.NOMR, noTelepon: listDataRiwayat.value.NOTELP },
      }
      if (!peserta.value?.noKartu) {
        setPasienNonBPJS()
      }
      // let cara_bayar = await function_GetCaraBayarChild()
      // if (cara_bayar != '5') {

      //}
    } else {
      showError('Data pasien tidak ditemukan (lokal)')
      mode_proses_data.value = 1
      callChildFunction()
    }
  } catch (error) {
    console.error('Error fetching pasien lokal:', error)
    showError('Terjadi kesalahan saat memuat data pasien lokal')
  } finally {
    loading.value = false
  }
}

const isLoading = ref(false)
const carabayarSelected = ref(null)

watch(carabayarSelected, (newVal) => {
  if (newVal) {
    try {
      localStorage.setItem('carabayarSelected', JSON.stringify(newVal))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  } else {
    localStorage.removeItem('carabayarSelected')
  }
})

const nomor = ref('')
const jenis = ref('BPJS')
const asalRujukan = ref('FK1')

const asalOptions = [
  { label: 'FK 1', value: 'FK1' },
  { label: 'FK 2', value: 'FK2' },
  { label: 'RS', value: 'RS' },
]

// Toast helpers
const showSuccess = (message = 'Operation successful') => {
  toast.add({ severity: 'success', summary: 'Success Message', detail: message, life: 3000 })
}
const showError = (message = 'An error occurred') => {
  toast.add({ severity: 'error', summary: 'Error', detail: String(message), life: 5000 })
}
const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Warning', detail: message, life: 4000 })
}

const CallDialogPendaftarn = async () => {
  showDialogPendaftaran.value = true
}

onMounted(() => {
  window.addEventListener('patient-selected', (event) => {
    const selectedPatient = event.detail
    console.log('Selected patient:', selectedPatient)

    // Use the patient data
    // For example:
    // form.NAMAPASIEN = selectedPatient.NAMAPASIEN
    // form.NOMR = selectedPatient.NOMR
    // form.NO_KARTU = selectedPatient.NO_KARTU
  })
  showDialogPendaftaran.value = true
  //GetCaraBayar()
})
</script>

<style scoped>
/* ── Informasi Pasien Card ── */
.pi-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.pi-card-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}

.pi-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}
.pi-identity-empty {
  opacity: 0.5;
}

.pi-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--p-primary-500, #3b82f6), var(--p-primary-700, #1d4ed8));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}
.pi-identity-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.pi-name {
  font-size: 13px;
  font-weight: 700;
  color: #212529;
  line-height: 1.2;
}
.pi-nokartu {
  font-size: 11px;
  color: #6c757d;
  font-family: monospace;
}

.pi-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  width: fit-content;
}
.pi-status-aktif {
  background: #dcfce7;
  color: #15803d;
}
.pi-status-nonaktif {
  background: #fee2e2;
  color: #b91c1c;
}

/* Info list */
.pi-info-list {
  padding: 8px 0;
}
.pi-info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid #f8f9fa;
  transition: background 0.1s;
}
.pi-info-row:last-child {
  border-bottom: none;
}
.pi-info-row:hover {
  background: #f8f9fa;
}

.pi-info-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}
.pi-info-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.pi-info-lbl {
  font-size: 10px;
  color: #adb5bd;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pi-info-val {
  font-size: 12px;
  font-weight: 500;
  color: #343a40;
  word-break: break-word;
}

/* Empty state */
.pi-empty {
  text-align: center;
  padding: 20px 14px;
  color: #adb5bd;
}
.pi-empty p {
  font-size: 12px;
  margin-top: 10px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.hover-grow {
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
}
.hover-grow:hover {
  transform: scale(1.1);
}

.custom-textarea {
  font-size: 14px !important;
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  padding: 12px !important;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 2rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.table-secondary th {
  background-color: #f3f4f6 !important;
  color: #374151;
}
</style>
