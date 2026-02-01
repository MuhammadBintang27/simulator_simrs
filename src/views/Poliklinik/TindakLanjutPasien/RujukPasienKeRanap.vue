<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <div class="card elevation-0">
    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>Tanggal Jam Masuk RS</label><br />
            <DatePicker
              id="tanggal_pulang"
              v-model="TanggalRawat"
              dateFormat="dd M yy"
              placeholder="Pilih tanggal"
              showIcon
              showTime
              hourFormat="24"
              iconDisplay="input"
              style="width: 100%"
            />
          </div>
          <div class="form-group" v-if="carabayarSelected?.KODE == 5">
            <label>Tanggal SEP</label><br />
            <DatePicker
              id="tanggal_pulang"
              v-model="TanggalSEP"
              dateFormat="dd M yy"
              placeholder="Pilih tanggal"
              showIcon
              iconDisplay="input"
              style="width: 100%"
            />
          </div>

          <div class="form-group">
            <label>Cara Bayar</label><br />

            <Select
              v-model="carabayarSelected"
              :options="listcaraBayar"
              optionLabel="NAMA"
              placeholder="Pilih Cara Bayar"
              class="w-100"
              filter
              showClear
            />
          </div>

          <div class="form-group">
            <label>Pilih DPJP</label><br />
            <Select
              v-model="dokterSelected"
              :options="list_dokter"
              optionLabel="NAMADOKTER"
              placeholder="Pilih DPJP"
              class="w-100"
              filter
              showClear
            />
          </div>

          <!-- <div class="form-group">
            <label>Spesialisasi</label><br />
            {{ listPoliKlinik }}
            <Select
              v-model="poliKlinikSelected"
              :options="listPoliKlinik"
              optionLabel="NAMA"
              placeholder="Spesialis"
              class="w-100"
              filter
              showClear
            />
          </div> -->

          <div class="form-group">
            <label>Pilih Diagnosa Pasien</label><br />
            <Select
              v-model="diagnoseSelected"
              :options="listDiagnose"
              optionLabel="dx"
              :filter="true"
              :showClear="false"
              @filter="searchDiagnose"
              placeholder="Search diagnose..."
              appendTo="body"
              style="width: 100%; height: 35px"
            />
          </div>

          <div class="form-group">
            <label>No Kartu BPJS</label><br />
            <InputText v-model="NoBPJS" style="width: 100%; height: 35px" />
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-group" v-if="carabayarSelected?.KODE == 5">
            <label>SPRI (Surat Perintah Rawat Inap)</label><br />
            <div class="input-group">
              <InputText v-model="NoSPRI" style="width: 70%" />
              <Button
                label="SPRI"
                severity="success"
                text
                @click="callFOrmListSPRI()"
                icon="pi pi-history"
                style="height: 35px"
                class="p-button p-button-secondary round-button2 mt-0"
              />
            </div>
          </div>

          <div class="form-group">
            <label>
              Ruang Rawat Inap
              <small>update terakhir pada: {{ formatDateTimeForAPI(last_update_ruangan) }}</small>
            </label>
            <div class="input-group">
              <Select
                v-model="ruanganSelected"
                :options="listRuangan"
                optionLabel="NAMA"
                :filter="true"
                :showClear="true"
                :loading="load_ruangan"
                placeholder="Pilih Ruang Rawat Inap"
                appendTo="body"
                style="width: 80%; height: 35px"
              >
                <template #option="slotProps">
                  <div class="flex flex-col gap-1 py-2">
                    <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {{ slotProps.option?.NAMA }}
                      <span class="ml-1"><small>Tersedia</small></span>
                      <Tag
                        severity="success"
                        :value="slotProps.option?.TERSEDIA"
                        :class="`text-xs ml-2 px-2 py-1 rounded-full ml-1${slotProps.option?.COLOR}`"
                        style="font-size: 10px; font-weight: 500"
                      />
                      <small class="ml-2">dari</small>
                      <Tag
                        severity="success"
                        :value="slotProps.option?.JUMLAH_TT"
                        :class="`text-xs px-2 py-1 rounded-full ml-1`"
                        style="font-size: 10px; font-weight: 500"
                      />
                      <!-- <small class="ml-1"> {{ slotProps.option.LAST_UPDATE_KELUAR }}</small> -->
                    </div>
                  </div>
                </template>
              </Select>
              <Button
                small
                class="text"
                @click="getRuangan"
                style="height: 35px"
                :loading="load_ruangan"
                text
                icon="pi pi-refresh"
              />
            </div>
          </div>

          <div class="form-group">
            <div style="display: flex; align-items: center; margin-top: 3rem; margin-bottom: 25px">
              <Checkbox v-model="pasienkatarak" :binary="true" id="pasienkatarak" />
              <label
                for="pasienkatarak"
                style="margin-left: 8px; margin-bottom: 0em; cursor: pointer"
              >
                Pasien Katarak
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="font-bold">Naik Kelas Rawat <span class="text-danger">*</span></label>

            <Select
              v-model="selectedKelas"
              :options="klsRawatNaik"
              optionLabel="caption"
              placeholder="Pilih Kelas Rawat"
              class="w-100"
            />
          </div>

          <!-- Traffic Accident -->
          <div class="form-group">
            <label class="font-bold">Pasien KLL? <span class="text-danger">*</span></label>
            <Select
              v-model="lakaLantasSelected"
              :options="lakaLantasOptions"
              optionLabel="caption"
              placeholder="Pilih status KLL"
              class="w-100"
            />
          </div>

          <!-- Traffic Accident Details (conditional) -->
          <div v-if="lakaLantasSelected.code > 0" class="kll-details">
            <div class="form-group">
              <label class="font-bold">Tanggal KLL <span class="text-danger">*</span></label>
              <DatePicker
                v-model="tanggalKLL"
                :showIcon="true"
                view="date"
                dateFormat="dd/mm/yy"
                :yearNavigator="true"
                yearRange="2000:2030"
                placeholder="Pilih Tanggal KLL"
                class="w-100"
              />
            </div>

            <div class="form-group">
              <label class="font-bold"
                >Provinsi Lokasi KLL <span class="text-danger">*</span></label
              >
              <Select
                v-model="provinsiKLL"
                :options="provinsiOptions"
                optionLabel="nama"
                :filter="true"
                :showClear="true"
                @change="GeKabupaten_bpjs"
                placeholder="Pilih Provinsi"
                class="w-100"
              />
            </div>

            <div class="form-group">
              <label class="font-bold">Kabupaten/Kota <span class="text-danger">*</span></label>

              <Select
                v-model="kabupatenKLL"
                :options="kabupatenOptions"
                optionLabel="nama"
                :filter="true"
                :showClear="true"
                :disabled="!provinsiKLL"
                @change="GetKecamatan_bpjs"
                placeholder="Pilih Kabupaten/Kota"
                :loading="loading_load_kab"
                class="w-100"
              />
            </div>

            <div class="form-group">
              <label class="font-bold">Kecamatan <span class="text-danger">*</span></label>

              <Select
                v-model="kecamatanKLL"
                :options="kecamatanOptions"
                optionLabel="nama"
                :filter="true"
                :showClear="true"
                :disabled="!kabupatenKLL"
                :loading="loading_load_kec"
                placeholder="Pilih Kecamatan"
                class="w-100"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Catatan</label><br />
            <Textarea v-model="Catatan" style="width: 100%" rows="3" />
          </div>

          <!-- <div class="form-group">
            <label>NOSEP</label><br />
            <div class="input-group">
              <InputText v-model="nomor_sep" style="width: 70%" />
              <Button
                label="SPRI"
                severity="success"
                text
                @click="callFOrmListSPRI()"
                icon="pi pi-history"
                style="height: 35px"
                class="p-button p-button-secondary round-button2 mt-0"
              />
            </div>
          </div> -->
        </div>
      </div>

      <hr />

      <div class="flex justify-content-between align-items-center mt-3">
        <div class="flex gap-2">
          <Button
            label="Rujuk Ke Rawat Inap"
            icon="pi pi-save"
            class="p-button p-button-success"
            @click="submitForm"
          />
          <!-- <Button
            label="Reset"
            icon="pi pi-refresh"
            class="p-button p-button-secondary ml-2"
            @click="hapusSEP"
          /> -->
          <Button
            label="Riwayat Pendaftaran"
            severity="warn"
            icon="pi pi-save"
            class="p-button p-button-success ml-2"
            @click="callChildFetch"
          />
          <Button
            label="Cetak SEP"
            severity="info"
            icon="pi pi-print"
            class="p-button p-button-success ml-2"
            @click="CetakSEP"
          />
        </div>
      </div>
    </div>
  </div>
  <RecentPendaftaranView ref="childRef"></RecentPendaftaranView>

  <!-- <Dialog
    v-model:visible="showListSPRI"
    modal
    :style="{ width: '900px' }"
    :closable="true"
    header="Riwayat Perintah Rawat Inap"
  >
    <div class="table-responsive" style="max-height: 500px; overflow-y: auto">
      <table class="table table-bordered table-striped table-hover">
        <thead class="thead-light sticky-top">
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 15%">No. SPRI</th>
            <th style="width: 10%">Tanggal</th>
            <th style="width: 20%">Dokter</th>
            <th style="width: 10%">Jenis Rawat</th>
            <th style="width: 15%">Poli/Ruang</th>
            <th style="width: 10%">No. Register</th>
            <th style="width: 10%">Cetak</th>
            <th style="width: 10%">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoadingSPRI">
            <td colspan="9" class="text-center py-4">
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Memuat data SPRI...
            </td>
          </tr>
          <tr v-else-if="spriHistoryData.length === 0">
            <td colspan="9" class="text-center py-4 text-muted">
              <i class="pi pi-info-circle mr-2"></i>
              Tidak ada data SPRI ditemukan
            </td>
          </tr>
          <tr v-else v-for="(spri, index) in spriHistoryData" :key="spri.SPRI || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <div style="display: flex; align-items: center; justify-content: space-between">
                <div>
                  <strong>{{ spri?.SPRI }}</strong>
                  <br />
                  <small class="text-muted">{{ spri?.NO_KARTU }}</small>
                </div>
                <Button
                  icon="pi pi-copy"
                  @click="copySPRI(spri.SPRI, index)"
                  class="p-button-text p-button-sm copy-btn"
                  :title="copiedSPRIIndex === index ? 'Tersalin!' : 'Salin SPRI'"
                  style="padding: 0.25rem; margin-left: 8px"
                />
              </div>
            </td>
            <td>{{ spri.TANGGAL }}</td>
            <td>
              <strong>{{ spri.NAMADOKTER }}</strong>
              <br />
              <small class="text-muted">Kode: {{ spri.KODE_DOKTER_BPJS }}</small>
            </td>
            <td>{{ spri.JENISRAWAT }}</td>
            <td>{{ spri.POLI_KONTROL || '-' }}</td>
            <td>
              <code>{{ spri.NOREGISTER }}</code>
            </td>
            <td>
              <Button
                label="Cetak"
                @click="cetakSPRI(spri)"
                icon="pi pi-print"
                style="padding: 0.25rem"
              />
            </td>
            <td>
              <div class="flex items-center space-x-2">
                <Button
                  severity="warn"
                  class="round-button2"
                  icon="pi pi-times"
                  @click="hapus_SPRI(spri?.SPRI)"
                  style="padding: 0.25rem"
                  title="Hapus SPRI"
                />
                <Button
                  severity="info"
                  class="round-button2"
                  icon="pi pi-pencil"
                  style="padding: 0.25rem"
                  title="Edit SPRI"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-group mt-2">
      <Button
        label="Terbitkan SPRI Baru"
        @click="doterbitkanSPRI()"
        :loading="loading"
        severity="success"
        icon="pi pi-save"
        class="p-button p-button-warning flex-button"
      />
      <Button
        label="Batal"
        icon="pi pi-times"
        @click="showListSPRI = false"
        class="p-button p-button-warning flex-button p-button p-button-secondary"
      />
    </div>
  </Dialog> -->

  <Dialog
    v-model:visible="showListSPRI"
    modal
    :style="getDialogStyle()"
    :closable="true"
    header="Riwayat Perintah Rawat Inap"
    :class="{ 'mobile-dialog': isMobile }"
  >
    <Button
      label="Data server BPJS"
      icon="pi pi-list"
      class="p-button p-button-sm copy-btn round-button2"
    />
    <!-- Mobile Card View -->
    <div v-if="isMobile" class="mobile-view">
      <div v-if="isLoadingSPRI" class="text-center py-4">
        <i class="pi pi-spin pi-spinner mr-0"></i>
        Memuat data SPRI...
      </div>

      <div v-else-if="spriHistoryData.length === 0" class="text-center py-4 text-muted">
        <i class="pi pi-info-circle mr-2"></i>
        Tidak ada data SPRI ditemukan
      </div>

      <div v-else class="space-y-3">
        <div v-for="(spri, index) in spriHistoryData" :key="spri.SPRI || index" class="spri-card">
          <div class="card-header">
            <div class="card-title-section">
              <strong>{{ spri?.SPRI }}</strong>
              <Button
                icon="pi pi-copy"
                @click="copySPRI(spri.SPRI, index)"
                class="p-button-text p-button-sm copy-btn"
                :title="copiedSPRIIndex === index ? 'Tersalin!' : 'Salin SPRI'"
              />
            </div>
            <small class="text-muted">{{ spri?.NO_KARTU }}</small>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Tanggal:</span>
              <span class="value">{{ spri.TANGGAL }}</span>
            </div>
            <div class="info-row">
              <span class="label">Dokter:</span>
              <div class="value">
                <strong>{{ spri.NAMADOKTER }}</strong>
                <br />
                <small class="text-muted">Kode: {{ spri.KODE_DOKTER_BPJS }}</small>
              </div>
            </div>
            <div class="info-row">
              <span class="label">Jenis Rawat:</span>
              <span class="value">{{ spri.JENISRAWAT }}</span>
            </div>
            <div class="info-row">
              <span class="label">Poli/Ruang:</span>
              <span class="value">{{ spri.POLI_KONTROL || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">No. Register:</span>
              <code class="value">{{ spri.NOREGISTER }}</code>
            </div>
          </div>

          <div class="card-actions">
            <Button
              label="Cetak"
              @click="cetakSPRI(spri)"
              :loading="loadingPrint"
              icon="pi pi-print"
              class="p-button-sm flex-button"
            />
            <Button
              severity="warn"
              icon="pi pi-times"
              @click="hapus_SPRI(spri?.SPRI)"
              class="p-button-sm flex-button"
              title="Hapus"
            />
            <!-- <Button
              severity="info"
              icon="pi pi-pencil"
              class="p-button-sm flex-button"
              title="Edit"
            /> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div v-else class="table-responsive" style="max-height: 500px; overflow-y: auto">
      <table class="table table-bordered table-striped table-hover">
        <thead class="thead-light sticky-top">
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 15%">No. SPRI</th>
            <th style="width: 10%">Tanggal</th>
            <th style="width: 20%">Dokter</th>
            <th style="width: 10%">Jenis Rawat</th>
            <th style="width: 15%">Poli/Ruang</th>
            <th style="width: 10%">No. Register</th>
            <th style="width: 10%">Cetak</th>
            <th style="width: 10%">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoadingSPRI">
            <td colspan="9" class="text-center py-4">
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Memuat data SPRI...
            </td>
          </tr>
          <tr v-else-if="spriHistoryData.length === 0">
            <td colspan="9" class="text-center py-4 text-muted">
              <i class="pi pi-info-circle mr-2"></i>
              Tidak ada data SPRI ditemukan
            </td>
          </tr>
          <tr v-else v-for="(spri, index) in spriHistoryData" :key="spri.SPRI || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <div style="display: flex; align-items: center; justify-content: space-between">
                <div>
                  <strong>{{ spri?.SPRI }}</strong>
                  <br />
                  <small class="text-muted">{{ spri?.NO_KARTU }}</small>
                </div>
                <Button
                  icon="pi pi-copy"
                  @click="copySPRI(spri.SPRI, index)"
                  class="p-button-text p-button-sm copy-btn"
                  :title="copiedSPRIIndex === index ? 'Tersalin!' : 'Salin SPRI'"
                  style="padding: 0.25rem; margin-left: 8px"
                />
              </div>
            </td>
            <td>{{ spri.TANGGAL }}</td>
            <td>
              <strong>{{ spri.NAMADOKTER }}</strong>
              <br />
              <small class="text-muted">Kode: {{ spri.KODE_DOKTER_BPJS }}</small>
            </td>
            <td>{{ spri.JENISRAWAT }}</td>
            <td>{{ spri.POLI_KONTROL || '-' }}</td>
            <td>
              <code>{{ spri.NOREGISTER }}</code>
            </td>
            <td>
              <Button
                label="Cetak"
                @click="cetakSPRI(spri)"
                icon="pi pi-print"
                style="padding: 0.25rem"
              />
            </td>
            <td>
              <div class="flex items-center space-x-2">
                <Button
                  severity="warn"
                  class="round-button2"
                  icon="pi pi-times"
                  @click="hapus_SPRI(spri?.SPRI)"
                  style="padding: 0.25rem"
                  title="Hapus SPRI"
                />
                <!-- <Button
                  severity="info"
                  class="round-button2"
                  icon="pi pi-pencil"
                  style="padding: 0.25rem"
                  title="Edit SPRI"
                /> -->
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-group mt-2" :class="{ 'mobile-button-group': isMobile }">
      <Button
        label="Terbitkan SPRI Baru"
        @click="doterbitkanSPRI()"
        :loading="loading"
        severity="success"
        icon="pi pi-save"
        class="p-button flex-button"
        :class="{ 'w-full': isMobile }"
      />
      <Button
        label="Batal"
        icon="pi pi-times"
        @click="showListSPRI = false"
        class="p-button p-button-secondary flex-button"
        :class="{ 'w-full': isMobile }"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'
const route = useRoute()
import { storeToRefs } from 'pinia'
import axios from 'axios'

// Stores
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, company } = storeToRefs(authStore)
const toast = useToast()

import RecentPendaftaranView from '@/views/Pendaftaran/RecentPendaftaranView.vue'

const lakaLantasSelected = ref({
  caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]',
  code: 0,
})

const nomor_sep = ref(null)
// Reactive data
const TanggalRawat = ref(new Date())

const TanggalSEP = ref(new Date())
const loading = ref(false)
const showListSPRI = ref(false)
const NoBPJS = ref(route.query.noka)
const NoSPRI = ref(null)
const ruanganSelected = ref(null)
const isLoadingSPRI = ref(false)
const copiedSPRIIndex = ref(null)
const pasienkatarak = ref(false)
const Catatan = ref(null)

// KLL related data
const tanggalKLL = ref(null)
const provinsiKLL = ref(null)
const kabupatenKLL = ref(null)
const kecamatanKLL = ref(null)
const provinsiOptions = ref([])
const kabupatenOptions = ref([])
const kecamatanOptions = ref([])

// Doctor and other data
const list_dokter = ref([])
const dokterSelected = ref(null)
const diagnoseSelected = ref(null)
const listDiagnose = ref([])
const isLoading = ref(false)
const carabayarSelected = ref(null)
const listcaraBayar = ref([])

// Room data
const listRuangan = ref([])
const load_ruangan = ref(false)
const last_update_ruangan = ref(new Date())

// SPRI data
const spriHistoryData = ref([])

// Options
const lakaLantasOptions = ref([
  { caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]', code: 0 },
  { caption: '1 - KLL dan bukan kecelakaan Kerja [BKK]', code: 1 },
  { caption: '2 - KLL dan KK', code: 2 },
  { caption: '3 - Kecelakaan Kerja [KK]', code: 3 },
])

const selectedKelas = ref(null)

const klsRawatHak = ref({
  kode: '',
})

const isMobile = ref(false)

const getDialogStyle = () => {
  return {
    width: isMobile.value ? '95vw' : '900px',
    maxHeight: isMobile.value ? '90vh' : 'auto',
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const childRef = ref(null)
const callChildFetch = async () => {
  if (childRef.value) {
    childRef.value.ShowRiwayatPendaftaran = true
    childRef.value.fetchData(10) // misalnya mode = 10
  }
}

const klsRawatNaik = ref([
  { caption: 'VVIP', kode: 1 },
  { caption: 'VIP', kode: 2 },
  { caption: 'Kelas 1', kode: 3 },
  { caption: 'Kelas 2', kode: 4 },
  { caption: 'Kelas 3', kode: 5 },
  { caption: 'ICCU', kode: 6 },
  { caption: 'ICU', kode: 7 },
  { caption: 'Diatas Kelas 1', kode: 8 },
])

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

// Toast methods
const showSuccess = (message = 'Data berhasil disimpan') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

const showInfo = (message = 'Informasi') => {
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

// API methods
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
    showError('Error fetching doctors: ' + error.message)
  } finally {
    loading.value = false
  }
}

const searchDiagnose = async (event) => {
  const query = event.value
  if (!query || query.length < 2) {
    listDiagnose.value = []
    return
  }

  const payload = {
    mode: 1,
    param: query,
  }

  try {
    isLoading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/get_icd_v2`, payload)
    console.log(response.data)
    listDiagnose.value = response.data
  } catch (error) {
    console.error('Error searching diagnose:', error)
    showError('Error searching diagnose')
  } finally {
    isLoading.value = false
  }
}

const GetCaraBayar = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/datacarabayar2/${id_client.value}`,
    )

    if (response.data) {
      listcaraBayar.value = response.data
    }
  } catch (error) {
    console.error('Error fetching cara bayar:', error)
    showError('Error fetching cara bayar')
  }
}

const listPoliKlinik = ref([])

const GetNamaPOliklinik = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/0/${id_client.value}`,
    )

    if (response.data) {
      listPoliKlinik.value = response.data
    }
  } catch (error) {
    console.error('Error fetching cara bayar:', error)
    showError('Error fetching cara bayar')
  }
}

const getRuangan = async () => {
  try {
    load_ruangan.value = true
    last_update_ruangan.value = new Date()

    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/laporan/pasien_sedang_rawat_inap/${id_client.value}`,
    )

    if (response.data.response) {
      listRuangan.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching rooms:', error)
    showError('Error fetching rooms')
  } finally {
    load_ruangan.value = false
  }
}

const doterbitkanSPRI = async () => {
  if (dokterSelected.value == null) {
    showInfo('Silahkan pilih DPJP')
    return
  }
  if (diagnoseSelected.value == null) {
    showInfo('Diagnosa belum diisi')
    return
  }

  try {
    loading.value = true

    const param = {
      data: {
        nokartu: route.query.noka,
        KDDOKTER: dokterSelected.value.KDDOKTER,
        KODE_DOKTER_BPJS: dokterSelected.value.KODE_DOKTER_BPJS,
        KodePoliBPJS: dokterSelected.value.SUB_SP,
        tglRencanaKontrol: formatDateOnlyForAPI(TanggalRawat.value),
        nomr: route.query.nomr,
      },
      user_id: user_id.value,
      id_client: id_client.value,
    }
 

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/terbitkan_SPRI`, param)

    console.log(`${url}/index.php/api/transaksi_pasien/terbitkan_SPRI`)

    console.log(response.data)
    if (response.data.metadata.code == 200) {
      showSuccess(response.data.metadata.message)
      GetListSPRI()
    } else {
      showError(response.data.metadata.message)
    }
  } catch (error) {
    console.error('Error creating SPRI:', error)
    showError('Error creating SPRI: ' + error.message)
  } finally {
    loading.value = false
  }
}

const hapus_SPRI = async (noSPRI) => {
  try {
    loading.value = true

    const param = {
      id_client: id_client.value,
      noSuratKontrol: noSPRI,
      user_id: user_id.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/deleted_spri_v2`,
      param,
    )

    if (response.data.code == 200) {
      showSuccess(response.data.message)
      GetListSPRI()
    } else {
      showError(response.data.message)
    }
  } catch (error) {
    console.error('Error deleting SPRI:', error)
    showError('Error deleting SPRI: ' + error.message)
  } finally {
    loading.value = false
  }
}

const copySPRI = async (spriNumber, index) => {
  try {
    await navigator.clipboard.writeText(spriNumber)
    copiedSPRIIndex.value = index
    showSuccess(`SPRI ${spriNumber} berhasil disalin`)
    showListSPRI.value = false

    setTimeout(() => {
      copiedSPRIIndex.value = null
    }, 2000)
  } catch (error) {
    console.error('Error copying SPRI:', error)
    showError('Error copying SPRI')
  }
}

const callFOrmListSPRI = () => {
  showListSPRI.value = true
  GetListSPRI()
}

const GetListSPRI = async () => {
  try {
    isLoadingSPRI.value = true

    const payload = {
      mode: 'history3',
      SPRI: route.query.nomr,
      id_client: id_client.value,
      tgl: null,
      norm: route.query.nomr,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/sprigetdata/`, payload)

    spriHistoryData.value = response.data.response || []
  } catch (error) {
    console.error('Error fetching SPRI history:', error)
    showError('Error fetching SPRI history')
  } finally {
    isLoadingSPRI.value = false
  }
}

// Reactive data

// Method converted to function
const get_provinsi_bpjs = async () => {
  isLoading.value = true

  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/getdata_propinsi_BPJS_V2/${id_client.value}`,
    )

    if (response.data.metaData.code == 200) {
      provinsiOptions.value = response.data?.response?.list
    }
  } catch (error) {
    console.log(error)
    // Optional: Add error handling/toast notification here
  } finally {
    isLoading.value = false
  }
}
// Method converted to function

const loading_load_kab = ref(false)

const GeKabupaten_bpjs = async (e) => {
  console.log(e.value)
  loading_load_kab.value = true

  if (e.value == null) {
    kabupatenOptions.value = []
  }
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/getdata_kabupaten_v2/${id_client.value}/${e.value.kode}`,
    )

    if (response.data.metaData.code == 200) {
      kabupatenOptions.value = response.data?.response?.list
    }

    loading_load_kab.value = false
  } catch (error) {
    console.log(error)
    // Optional: Add error handling/toast notification here
  } finally {
    loading_load_kab.value = false
  }
}

// Method converted to function
const loading_load_kec = ref(false)
const GetKecamatan_bpjs = async (e) => {
  console.log(e.value)
  loading_load_kec.value = true

  if (e.value == null) {
    kecamatanOptions.value = []
  }
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/getdata_kecamatan_v2/${id_client.value}/${e.value.kode}`,
    )

    if (response.data.metaData.code == 200) {
      kecamatanOptions.value = response.data?.response?.list
    }
    loading_load_kec.value = false
  } catch (error) {
    console.log(error)
    // Optional: Add error handling/toast notification here
  } finally {
    loading_load_kec.value = false
  }
}

const hapusSEP = async () => {
  const url = configStore.apiBaseUrl
  const response = await axios.post(
    `${url}/index.php/api/Bpjs_api/hapus_sep/${nomor_sep.value}/${id_client.value}/${user_id.value}`,
  )

  showInfo(response.data.metaData.message)
}

const noSEP = ref(null)

const tempNOSEP = ref('')
const tempNOREG = ref('')

const submitForm = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const payload = {
      param: {
        tglsep: formatDateOnlyForAPI(TanggalSEP.value),
        tanggalMasukRS: formatDateTimeForAPI(TanggalRawat.value),
        tanggalKLL: formatDateOnlyForAPI(tanggalKLL.value),
        noka: route.query.noka,
        norm: route.query.nomr,
        id_client: id_client.value,
        diagnoseSelected: diagnoseSelected.value,
        jenisrawatSelected: {
          code: 1,
        },
        poliSelected: {
          kode: dokterSelected.value.KDPOLY_BPJS,
        },
        jenisTrans: {
          code: 1,
        },
        kd_cara_bayar: carabayarSelected.value.KODE,
        jenis_kunj: 1,
        cara_bayar: carabayarSelected.value.KODE,
        pasienkatarak: pasienkatarak.value ? 1 : 0,
        lakaLantas: lakaLantasSelected.value,
        nospri: NoSPRI.value,
        dokterSelected: dokterSelected.value,
        provSelected: provinsiKLL.value,
        kabSelected: kabupatenKLL.value,
        kecSelected: kecamatanKLL.value,
        noreggister_origin: route.query.noreg,
        ruanganSelected: {
          kode: ruanganSelected.value.KD_RUANGAN,
        },
      },
      id_client: id_client.value,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/index.php/api/Bpjs_api/createSEP`, payload)

    if (response.data.metadata.code == 200) {
      showSuccess(response.data.metadata.message)

      if (carabayarSelected.value.KODE == 5) {
        tempNOSEP.value = response.data.data_trans.data_trans.sep
        tempNOREG.value = response.data.data_trans.data_trans.no_register

        PrintSEP(
          response.data.data_trans.data_trans.sep,
          response.data.data_trans.data_trans.no_register,
        )
        //PrintSEP('0020R0010126V002881', '112601387738')
      }
    } else {
      showInfo(response.data.metadata.message)
    }
    // Implementation depends on your submit API
  } catch (error) {
    console.error('Error submitting form:', error)
    showError('Error submitting form')
  } finally {
    loading.value = false
  }
}

const CetakSEP = async () => {
  PrintSEP(tempNOSEP.value, tempNOREG.value)
}

const PrintSEP = async (nosep, noregister) => {
  loading.value = true
  const payLoad = {
    data: {
      NOPENDAFTARAN: noregister,
      NOSEP: nosep,
      id_client: id_client.value,
    },
  }

  const url = configStore.laravel
  const response = await axios.post(`${url}/get_data_sep_api`, payLoad)
  loading.value = false
  window.open(response.data, '_blank')
}

// KLL related methods
const onProvinsiChange = () => {
  kabupatenKLL.value = null
  kecamatanKLL.value = null
  kabupatenOptions.value = []
  kecamatanOptions.value = []
  // Load kabupaten based on selected provinsi
  // Implementation depends on your API
}

const onKabupatenChange = () => {
  kecamatanKLL.value = null
  kecamatanOptions.value = []
  // Load kecamatan based on selected kabupaten
  // Implementation depends on your API
}

// Form methods
const validateForm = () => {
  if (!dokterSelected.value) {
    showInfo('Silahkan pilih DPJP')
    return false
  }
  if (ruanganSelected.value.TERSEDIA <= 0) {
    showInfo('Ruang rawat inap yang dipiliih tidak tersedia')
    return false
  }

  if (!diagnoseSelected.value) {
    showInfo('Silahkan pilih diagnosa')
    return false
  }
  if (!carabayarSelected.value) {
    showInfo('Silahkan pilih cara bayar')
    return false
  }
  if (!ruanganSelected.value) {
    showInfo('Silahkan pilih ruangan')
    return false
  }
  if (lakaLantasSelected.value?.code > 0) {
    if (!tanggalKLL.value) {
      showInfo('Silahkan isi tanggal KLL')
      return false
    }
    if (!provinsiKLL.value) {
      showInfo('Silahkan pilih provinsi KLL')
      return false
    }
    if (!kabupatenKLL.value) {
      showInfo('Silahkan pilih kabupaten KLL')
      return false
    }
    if (!kecamatanKLL.value) {
      showInfo('Silahkan pilih kecamatan KLL')
      return false
    }
  }
  return true
}

const resetForm = () => {
  TanggalRawat.value = new Date()
  dokterSelected.value = null
  diagnoseSelected.value = null
  carabayarSelected.value = null
  ruanganSelected.value = null

  lakaLantasSelected.value = {
    caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]',
    code: 0,
  }

  tanggalKLL.value = null
  provinsiKLL.value = null
  kabupatenKLL.value = null
  kecamatanKLL.value = null
  pasienkatarak.value = false
  Catatan.value = null
  NoSPRI.value = null
}

const loadingPrint = ref(false)
const cetakSPRI = async (data) => {
  // Implementation for printing SPRI

  try {
    loadingPrint.value = true

    const formData = {
      NO_KARTU: data.NO_KARTU,
      NAMA: data.NAMA,
      TGLLAHIR: data.TGLLAHIR,
      USIA: data.USIA,
      JENISKELAMIN: data.JENISKELAMIN,
      diagnosa: '-',
      TANGGAL: data.TANGGAL,
      NORM: data.NORM,
      SPRI: data.SPRI,
      NAMADOKTER: data.NAMADOKTER,
      NAMA_RS: company.value,
      id_client: id_client.value,
    }

    const url = configStore.laravel
    const response = await axios.post(`${url}/generateSPRI`, formData)
    loadingPrint.value = false
    window.open(response.data, '_blank')
  } catch (error) {
    console.error('Error submitting form:', error)
    showError(error.response?.data?.message || 'An error occurred while submitting the rujukan')
  } finally {
    loadingPrint.value = false
  }
}

// Watch for localStorage
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

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

// Lifecycle
onMounted(() => {
  getda_tadokter()
  GetCaraBayar()
  getRuangan()
  get_provinsi_bpjs()
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Load from localStorage
  try {
    const saved = localStorage.getItem('carabayarSelected')
    if (saved) {
      carabayarSelected.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
})
</script>

<style scoped>
.kll-details {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.mobile-view {
  padding: 0;
}

.spri-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: #f5f5f5;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.card-title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.card-body {
  padding: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
  flex-shrink: 0;
}

.info-row .value {
  text-align: right;
  flex-grow: 1;
  margin-left: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

.flex-button {
  flex: 1;
  min-width: 0;
}

.mobile-button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.mobile-button-group .p-button {
  width: 100%;
}

.copy-btn {
  margin-left: 8px !important;
}

.text-muted {
  color: #999;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .mobile-dialog {
    width: 100vw !important;
    max-width: 100% !important;
  }

  .spri-card {
    margin-bottom: 8px;
  }

  .info-row {
    flex-direction: column;
  }

  .info-row .label {
    margin-bottom: 4px;
    min-width: auto;
  }

  .info-row .value {
    text-align: left;
    margin-left: 0;
  }

  .card-actions {
    gap: 6px;
  }

  .card-actions .p-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .mobile-dialog {
    border-radius: 12px 12px 0 0;
  }

  .spri-card {
    border-radius: 6px;
  }

  .card-header,
  .card-body,
  .card-actions {
    padding: 10px;
  }

  .info-row {
    font-size: 0.85rem;
  }

  .info-row .label {
    margin-bottom: 2px;
  }
}
</style>
