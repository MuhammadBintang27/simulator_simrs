<template>
  <ProgressBar v-if="isLoading" mode="indeterminate" style="height: 3px"></ProgressBar>
  <Panel>
    <template #header>
      <h6 style="color: darkcyan">
        <strong>TINDAK LANJUT PASIEN</strong>
      </h6>
    </template>

    <p>Pasien telah diperiksa dan dievaluasi. Rencana tindak lanjut:</p>
    <ul>
      <li><strong>Lanjut Terapi:</strong> Pasien melanjutkan pengobatan sesuai aturan.</li>
      <li><strong>Kontrol Ulang:</strong> Pasien datang kembali sesuai jadwal yang ditentukan.</li>
      <li>
        <strong>Rujuk ke RS Lain:</strong> Jika layanan tidak tersedia, pasien dirujuk ke rumah
        sakit rujukan.
      </li>
      <li>
        <strong>Rujuk Rawat Inap:</strong> Bila diperlukan perawatan intensif, pasien dirujuk ke
        rawat inap.
      </li>
    </ul>
    <hr />
    <div class="row">
      <div class="col-md-3">
        <div class="field-radiobutton">
          <div class="radio-option">
            <RadioButton id="Pulang" name="cara_keluar" value="1" v-model="form.cara_keluar" />
            <label for="Pulang">Pulang Atas Persetujuan Dokter</label>
          </div>

          <div class="radio-option" v-if="datapasien?.JENISRAWAT == 'JALAN'">
            <RadioButton id="ranap" name="cara_keluar" value="7" v-model="form.cara_keluar" />
            <label for="ranap">Rujuk ke Rawat Inap</label>
          </div>

          <div class="radio-option">
            <RadioButton
              id="rujuk_ke_rs_lain"
              name="cara_keluar"
              value="2"
              v-model="form.cara_keluar"
            />
            <label for="rujuk_ke_rs_lain">Rujuk Ke Rumah Sakit Lain</label>
          </div>

          <div class="radio-option">
            <RadioButton
              id="batal_pulang"
              name="cara_keluar"
              value="6"
              v-model="form.cara_keluar"
            />
            <label for="batal_pulang">Rujuk Internal</label>
          </div>
        </div>
      </div>

      <div class="col-md-6" v-if="form.cara_keluar == 1 || form.cara_keluar == 3">
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label for="tanggal_pulang">Jam & Tanggal pulang</label>

              <DatePicker
                id="tanggal_pulang"
                v-model="form.tanggal_pulang"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal"
                showIcon
                showTime
                hourFormat
                iconDisplay="input"
                style="width: 100%"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group">
              <br />
              <Button
                severity="warn"
                class="w-100 mt-1"
                :loading="loadingStts1"
                icon="pi pi-save"
                label="Selesai Berobat"
                @click="selesaiBerobat()"
              />
            </div>
          </div>
          <div class="col-md-1">
            <br />
            <div class="mt-3">
              <strong>Atau</strong>
            </div>
          </div>
          <div class="col-md-3">
            <br />
            <Button
              severity="info"
              @click="batalPendftaranPasienTidakHadir"
              :loading="loadingBatalkanPasien"
              class="w-100 mt-1"
              label="Pasien tidak hadir"
            />
          </div>
        </div>
        <hr />
        <div class="row">
          <div class="col-md-6" v-if="form.cara_keluar != 3">
            <div class="form-group">
              <label>Apakah ada rencana kontrol?</label>
              <Button
                label="Rencana Kontrol Ulang"
                @click="showKontrolUlang = true"
                icon="pi pi-calendar"
                class="p-button p-button-warning"
                style="width: 100%"
              />
              <!-- :disabled="disabled_kontrol_ulang" -->
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
      </div>
      <div class="col-md-9" v-if="form.cara_keluar == 2">
        <RujukKeRsLainView
          :NOSEP="datapasien?.NOSEP || ''"
          :datapasien="datapasien"
        ></RujukKeRsLainView>
      </div>
      <div class="col-md-9" v-if="form.cara_keluar == 7">
        <RujukPasienKeRanap></RujukPasienKeRanap>
      </div>

      <div class="col-md-9" v-if="form.cara_keluar == 6 && datapasien?.JENISRAWAT == 'JALAN'">
        <RujukInternalview :datapasien="datapasien"></RujukInternalview>
      </div>
    </div>

    <template #icons></template>

    <!-- <template #footer>
      <div class="flex justify-content-between align-items-center mt-3">
        <div class="flex gap-2">
          <Button
            label="Simpan"
            icon="pi pi-save"
            class="p-button p-button-success"
            @click="pemulangan_pasien"
            :loading="isLoading"
            :disabled="!isFormValid"
          />
          <Button
            label="Reset"
            icon="pi pi-refresh"
            class="p-button p-button-secondary ml-2"
            @click="resetForm"
          />
        </div>
      </div>
    </template> -->
  </Panel>

  <Dialog
    v-model:visible="showKontrolUlang"
    modal
    :style="{ width: '400px' }"
    :closable="true"
    header="Penerbitan Surat Kontrol"
  >
    <div>
      <Message severity="success">
        <p style="font-size: 12px">
          Data dokter ini bersumber langsung dari server resmi BPJS Kesehatan melalui sistem HFIS
          (Health Facility Information System).
        </p>
      </Message>
      <div class="form-group mt-3">
        <label for="tanggal_pulang"> <strong>Jam & Tanggal pulang</strong></label>
        <DatePicker
          id="tanggal_pulang"
          v-model="tanggal_kontrol"
          dateFormat="dd M yy"
          placeholder="Pilih tanggal"
          showIcon
          iconDisplay="input"
          style="width: 100%"
        />
      </div>
      <div class="form-group">
        <label>
          <strong>Pilih Dokter, data ditemukan ({{ list_dokter_live_bpjs.length }}) </strong></label
        >
        <Select
          v-model="dokterkontrolSelected"
          :options="list_dokter_live_bpjs"
          optionLabel="namaDokter"
          placeholder="Pilih dokter tujuan kontrol"
          class="w-100"
          showClear
          :loading="loading_load_dokter"
        />
      </div>
      <div>
        <div class="button-group mt-5">
          <Button
            label="Simpan"
            severity="success"
            @click="do_terbitkan_kontrol_ulang()"
            :disabled="dokterkontrolSelected === null"
            :loading="loadding_terbitkan_kontrol"
            icon="pi pi-save"
            class="p-button p-button-warning flex-button"
          />
          <Button
            label="Batal"
            @click="showKontrolUlang = false"
            icon="pi pi-times"
            class="p-button p-button-warning flex-button p-button p-button-secondary"
          />
        </div>
        <div class="button-group mt-3">
          <Button
            label="Riwayat Surat Kontrol"
            severity="success"
            @click="callRiwayatKontrol"
            icon="pi pi-list"
            class="p-button flex-button p-button-secondary p-button-text"
          />
        </div>
      </div>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="showRiwayatKontrol"
    modal
    :style="{ width: '800px' }"
    :closable="true"
    header="Riwayat penerbitan Surat Kontrol"
  >
    <div>
      <DataTable
        :value="riwayatKontrolUlang"
        :paginator="true"
        :rows="5"
        :responsive-layout="'scroll'"
        :sort-field="'TGLSEP'"
        :sort-order="-1"
        showGridlines
        removable-sort
        stripedRows
        class="p-datatable-gridlines"
      >
        <Column field="NOMR" header="NOMR" sortable />
        <Column field="NAMA" header="Nama" sortable />
        <Column field="USIA" header="Usia" style="width: 5rem" />
        <Column field="NAMADOKTER" header="Dokter" sortable />
        <Column field="KODE_DIAGNOSA" header="Diagnosa" :style="{ minWidth: '20rem' }" />
        <Column field="TANGGAL_KONTROL" header="Tgl Kontrol" sortable />
        <Column field="POLI" header="Poli" />
        <Column field="NO_KONTROL_ULANG" header="No SURAT KONTROL" />
        <Column field="TGLSEP" header="Tgl SEP" />
        <Column field="STTS" header="Status SEP" />
        <Column field="AKSI" header="AKSI">
          <template #body="slotProps">
            <Button
              label=""
              severity="warn"
              @click="confirmRemoveKontrol(slotProps.data)"
              icon="pi pi-times"
              class="p-button flex-button p-button-secondary p-button-text round-button"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>
  <Toast />
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import RujukPasienKeRanap from '@/views/Poliklinik/TindakLanjutPasien/RujukPasienKeRanap.vue'

import RujukKeRsLainView from '@/views/Poliklinik/TindakLanjutPasien/RujukKeRsLainView.vue'

import RujukInternalview from '@/views/Poliklinik/TindakLanjutPasien/RujukInternalview.vue'

import ProgressBar from 'primevue/progressbar'
// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()

import { useRoute } from 'vue-router'
const route = useRoute()

// Reactive state
const loading = ref(false)
const isLoading = ref(false)
const fullPage = ref(true)
const showOtorisasi = ref(false)
const showKontrolUlang = ref(false)
const fact = ref([])

const showRiwayatKontrol = ref(false)

const dokterkontrolSelected = ref(null)

const tanggal_kontrol = ref(new Date())
// Props
const props = defineProps({
  datapasien: {
    type: Object,
    default: null,
  },
})

const callRiwayatKontrol = async () => {
  showKontrolUlang.value = false
  showRiwayatKontrol.value = true
  getRiwayanKontrolUlang()
}
// Emits
const emit = defineEmits(['update', 'saved'])

// Form data
const form = reactive({
  cara_keluar: '1',
  tanggal_pulang: new Date(),
  tanggal_kontrol: new Date(),
})

const loadingStts1 = ref(false)
const selesaiBerobat = async () => {
  try {
    const payload = {
      STATUS: 1,
      KETERANGAN_STATUS: '1',
      NOPENDAFTARAN: route.query.noreg,
      NORM: route.query.nomr,
      KONDISISAATPULANG: 1,
      KDCARABAYAR: props.datapasien.KODECARABAYAR,
      JENISRAWAT: 'JALAN',
      KELUARPOLY: formatDateForAPI(form.tanggal_pulang),
      NOREF: '',
      NOSEP: props.datapasien.NOSEP,
      POLI: props.datapasien?.POLI,
      USER_ID: user_id.value,
      ID_CLIENT: id_client.value,
    }

    loadingStts1.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/pulangkan_pasienv3`,
      payload,
    )

    console.log(response.data)

    if (response.data.code == 200) {
      showSuccess('Telah berhasil di update')
    } else {
      showInfo(response.data.message)
    }
    loadingStts1.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loadingStts1.value = false
  }
}

const loadingBatalkanPasien = ref(false)

const batalPendftaranPasienTidakHadir = async () => {
  try {
    const payload = {
      STATUS: 1,
      KETERANGAN_STATUS: '1',
      noregister: route.query.noreg,
      norm: route.query.nomr,
      KONDISISAATPULANG: 1,
      KDCARABAYAR: props.datapasien.KODECARABAYAR,
      JENISRAWAT: 'JALAN',
      KELUARPOLY: formatDateForAPI(form.tanggal_pulang),
      rujuk_internal: props.datapasien.RUJUK_INTERNAL,
      nosep: props.datapasien.NOSEP,
      POLI: props.datapasien?.POLI,
      alasan_batal: 'Pasien Tidak hadir',
      user_id: user_id.value,
      id_client: id_client.value,
    }

    loadingBatalkanPasien.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/batal_pendaftaran_v4`,
      payload,
    )

    if (response.data.code == 200) {
      showSuccess(response.data.message)
    } else {
      showError(response.data.message)
    }
    loadingBatalkanPasien.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loadingBatalkanPasien.value = false
  }
}

// Computed
const isFormValid = computed(() => {
  return form.cara_keluar !== '' && (form.cara_keluar === '6' || form.tanggal_pulang !== null)
})
// Watch for form changes
watch(
  () => form.cara_keluar,
  (newValue) => {
    if (newValue === '6') {
      // Batalkan Pemulangan
      form.tanggal_pulang = null
    }
  },
)
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
    console.error('Error formatting datetime:', error)
    return null
  }
}

// Methods
const formatDateForAPI = (date) => {
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
    console.error('Error formatting datetime:', error)
    return null
  }
}

const disabled_kontrol_ulang = ref(true)

const pemulangan_pasien = async () => {
  try {
    isLoading.value = true
    const url = configStore.apiBaseUrl

    const param = {
      STATUS: form.cara_keluar,
      KDCARABAYAR: props.datapasien.KODECARABAYAR,
      KETERANGAN_STATUS: 'Sembuh',
      NOSEP: props.datapasien.NOSEP,
      KELUARPOLY: formatDateForAPI(form.tanggal_pulang),
      NOPENDAFTARAN: props.datapasien.NOPENDAFTARAN,
      KONDISISAATPULANG: '',
      NORM: props.datapasien.NOMR,
      USER_ID: user_id.value,
      ID_CLIENT: id_client.value,
      NOREF: '',
    }

    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/pemulangan_pasienv2`,
      param,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (response.data.code == 200) {
      disabled_kontrol_ulang.value = false
      showSuccess('Telah berhasil di update')
    }
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    isLoading.value = false
  }
}

const confirmRemoveKontrol = (data) => {
  confirm.require({
    message: `Anda ingin menghapus surat kontrol "${data.NO_KONTROL_ULANG} Untuk rencana kontrol ${data.TANGGAL_KONTROL}"?`,
    header: 'Konfirm hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => hapusSuratKontol(data),
  })
}

const hapusSuratKontol = async (data) => {
  try {
    isLoading.value = true
    const url = configStore.apiBaseUrl

    const payload = {
      no_kontrol: data.NO_KONTROL_ULANG,
      user_id: user_id.value,
      id_client: id_client.value,
    }

    const response = await axios.post(
      `${url}/index.php/api/data_referensi/hapusSuratKontrol`,
      payload,
    )

    if (response.data.code == 200) {
      showSuccess('Telah berhasil di hapus')
      getRiwayanKontrolUlang()
    } else {
      showInfo(response.data.message)
    }

    isLoading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    isLoading.value = false
  }
}

const riwayatKontrolUlang = ref([])

const getRiwayanKontrolUlang = async () => {
  try {
    isLoading.value = true
    const url = configStore.apiBaseUrl

    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdatakontrolulang/${id_client.value}/${props.datapasien.NOMR}/3`,
    )

    riwayatKontrolUlang.value = response.data.response

    isLoading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    isLoading.value = false
  }
}

const loadding_terbitkan_kontrol = ref(false)

const do_terbitkan_kontrol_ulang = async () => {
  try {
    loadding_terbitkan_kontrol.value = true
    const url = configStore.apiBaseUrl

    const param = {
      data: {
        nosep: props.datapasien.NOSEP,
        dokter: {
          KDDOKTER: dokterkontrolSelected.value['kodeDokter'],
        },
        poli_klinik: {
          KodePoliBPJS: props.datapasien.KODEPOLI,
        },
        nokartu: props.datapasien.NOJAMINAN,
        tanggal: formatDateForAPI(tanggal_kontrol.value),
        norm: props.datapasien.NOMR,
      },
      id_client: id_client.value,
      user_id: user_id.value,
    }

    const response = await axios.post(
      `${url}/index.php/api/data_referensi/terbitkan_kontrolulang`,
      param,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log(response.data)

    if (response.data.code == 200) {
      showSuccess(response.data.message)
    } else {
      if (response.data?.metaData?.code == '200') {
        showInfo(response.data.metaData.message)
      } else {
        showInfo(response.data.metaData.message)
      }
    }

    loadding_terbitkan_kontrol.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loadding_terbitkan_kontrol.value = false
  }
}

const showSuccess = (message = 'Data berhasil disimpan') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

const showInfo = (message = 'Data berhasil disimpan') => {
  toast.add({
    severity: 'info',
    summary: 'Informasi',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'Terjadi kesalahan') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const list_dokter_live_bpjs = ref([])

const loading_load_dokter = ref(false)

const Get_dokter_live_bpjs = async () => {
  try {
    const payload = {
      kode_poli: props.datapasien.KODEPOLI,
      tanggal: formatDateOnlyForAPI(tanggal_kontrol.value),
      id_client: id_client.value,
    }

    loading_load_dokter.value = true
    const url = configStore.apiBaseUrl

    list_dokter_live_bpjs.value = []

    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_dokter_live_bpjs`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log(response.data)

    if (response.data && response.data.response.list) {
      list_dokter_live_bpjs.value = [...response.data.response.list]
    } else {
      showInfo(response.data.metaData.message)
    }

    loading_load_dokter.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loading_load_dokter.value = false
  }
}

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/get_data`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data && response.data.response) {
      fact.value = [...response.data.response]
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

const saveData = async () => {
  if (!isFormValid.value) {
    showError('Mohon lengkapi form terlebih dahulu')
    return
  }

  try {
    isLoading.value = true
    const url = configStore.apiBaseUrl

    const payload = {
      cara_keluar: form.cara_keluar,
      tanggal_pulang: formatDateForAPI(form.tanggal_pulang),
      id_pasien: props.datapasien?.id || props.datapasien?.ID,
      id_client: id_client.value,
    }

    const response = await axios.post(`${url}/save_patient_followup`, payload, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.data.success) {
      showSuccess('Data tindak lanjut berhasil disimpan')
      emit('saved', payload)
    } else {
      throw new Error(response.data.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error('Error saving data:', error)
    showError(error.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    cara_keluar: '',
    tanggal_pulang: new Date(),
  })
}

// Watch for date changes
watch([tanggal_kontrol], () => {
  if (tanggal_kontrol.value) {
    dokterkontrolSelected.value = null
    Get_dokter_live_bpjs()
  }
})

const refreshData = () => {
  fetchData()
}

// Lifecycle
onMounted(() => {})
</script>

<style scoped>
.radio-option {
  margin-bottom: 8px;
}

.radio-option label {
  margin-left: 8px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 4px;
  display: block;
}

.round-button {
  border-radius: 50%;
}

.ml-2 {
  margin-left: 8px;
}

.mt-3 {
  margin-top: 16px;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.flex-button {
  flex: 1;
  width: auto;
}

/* Responsive design for smaller screens */
@media (max-width: 576px) {
  .button-group {
    flex-direction: column;
  }

  .flex-button {
    width: 100%;
  }
}
</style>
