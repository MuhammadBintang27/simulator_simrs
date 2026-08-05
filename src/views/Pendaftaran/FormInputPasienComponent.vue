<template>
  <Dialog v-model:visible="ShowInputPasien" modal :style="{ width: '900px' }" :closable="true">
    <!-- <loading_overlay :is-loading="loading" message="Memuat data...." /> -->
    <section class="content">
      <div class="container-fluid">
        <div class="card patient-info-card elevation-0">
          <div class="card-header bg-header">
            <h5 class="m-0"><i class="pi pi-heart header-icon"></i> REGISTER PASIEN</h5>
          </div>
          <div class="card-body">
            <!-- ================= Data Pribadi ================= -->
            <h6 class="section-title"><i class="pi pi-user section-icon mr-2"></i> Data Pribadi</h6>
            <hr />
            <div class="row">
              <div class="col-md-6">
                <!-- No RM -->
                <div class="form-group">
                  <label class="font-bold">No Rekam Medis <span class="text-danger">*</span></label>
                  <span class="text-danger" style="font-size: 9px">
                    Jika tidak diisi maka akan dibuat otomatis oleh sistem
                  </span>
                  <InputText
                    v-model="form.rm"
                    :class="{ 'input-error': errors.rm }"
                    style="width: 100%"
                    id="field-rm"
                    @keydown="handleEnterKey($event, '#field-nama-pasien')"
                  />
                  <small class="text-danger" v-if="errors.rm">{{ errors.rm }}</small>
                </div>

                <!-- Nama -->
                <div class="form-group">
                  <label class="font-bold">Nama Pasien <span class="text-danger">*</span></label>
                  <InputText
                    v-model="form.nama_pasien"
                    :class="{ 'input-error': errors.nama_pasien }"
                    style="width: 100%"
                    id="field-nama-pasien"
                    @keydown="handleEnterKey($event, '#field-nik')"
                  />
                  <small class="text-danger" v-if="errors.nama_pasien">{{
                    errors.nama_pasien
                  }}</small>
                </div>

                <!-- NIK -->
                <div class="form-group">
                  <label class="font-bold">NIK <span class="text-danger">*</span></label>
                  <InputText
                    v-model="form.nik"
                    :class="{ 'input-error': errors.nik }"
                    style="width: 100%"
                    maxlength="16"
                    id="field-nik"
                    @keydown="handleEnterKey($event, '#field-noka')"
                  />
                  <small class="text-danger" v-if="errors.nik">{{ errors.nik }}</small>
                </div>

                <!-- Nomor Kartu -->
                <div class="form-group">
                  <label class="font-bold">Nomor Kartu BPJS</label>
                  <div class="input-group">
                    <InputText
                      id="noka"
                      v-model="form.noka"
                      placeholder="Masukkan Nomor Kartu BPJS"
                      autocomplete="off"
                      style="width: 80%"
                      @keydown="handleEnterKey($event, '.p-datepicker-input')"
                    />
                    <div class="input-group-append">
                      <Button
                        label="Cari"
                        icon="pi pi-search"
                        :loading="loadingCheckData"
                        @click="get_data_pesertaOnline()"
                        class="p-button-primary"
                      />
                    </div>
                  </div>
                </div>
                <!-- Nomor Kartu -->
                <div class="form-group">
                  <label class="font-bold">Hak Kelas pasien (BPJS)</label>
                  <div class="input-group">
                    <Select
                      v-model="form.hakKelas"
                      :options="HakKelasList"
                      optionLabel="keterangan"
                      placeholder="Pilih Jenis Kelamin"
                      :class="{ 'input-error': errors.jeniskelamin }"
                      class="w-100"
                    />
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <!-- Tanggal Lahir & Usia -->
                <div class="form-group">
                  <label class="font-bold">Tanggal Lahir <span class="text-danger">*</span></label>
                  <DatePicker
                    v-model="form.tanggal_lahir"
                    showIcon
                    dateFormat="dd/mm/yy"
                    placeholder="Tanggal Lahir"
                    :class="{ 'input-error': errors.tanggal_lahir }"
                    class="w-100 calendar-high-z"
                  />
                  <small class="text-danger" v-if="errors.tanggal_lahir">{{
                    errors.tanggal_lahir
                  }}</small>
                </div>

                <div class="form-group">
                  <label class="font-bold">Usia (tahun)</label>
                  <InputText
                    type="number"
                    style="text-align: right"
                    v-model.number="form.usia"
                    class="w-100"
                    placeholder="Usia akan dihitung otomatis atau isi manual"
                  />
                </div>
                <!-- Jenis Kelamin -->
                <div class="form-group">
                  <label class="font-bold">Jenis Kelamin <span class="text-danger">*</span></label>
                  <Select
                    v-model="form.jeniskelamin"
                    :options="['LAKI-LAKI', 'PEREMPUAN']"
                    placeholder="Pilih Jenis Kelamin"
                    :class="{ 'input-error': errors.jeniskelamin }"
                    class="w-100"
                  />
                  <small class="text-danger" v-if="errors.jeniskelamin">{{
                    errors.jeniskelamin
                  }}</small>
                </div>

                <!-- Status Perkawinan -->
                <div class="form-group">
                  <label class="font-bold">Status Perkawinan</label>
                  <Select
                    v-model="form.status_perkawinan"
                    :options="listStatus"
                    optionLabel="nama"
                    :class="{ 'input-error': errors.status_perkawinan }"
                    placeholder="Pilih Status"
                    class="w-100"
                  />
                  <small class="text-danger" v-if="errors.status_perkawinan">{{
                    errors.status_perkawinan
                  }}</small>
                </div>
              </div>
            </div>

            <!-- ================= Alamat & Domisili ================= -->
            <h6 class="section-title mt-4">
              <i class="pi pi-map-marker section-icon mr-2"></i> Alamat & Domisili
            </h6>
            <hr />
            <div class="row">
              <div class="col-md-6">
                <!-- Desa -->
                <div class="form-group">
                  <label class="font-bold"
                    >Desa / Kelurahan <span class="text-danger">*</span></label
                  >
                  <Select
                    v-model="form.desaselected"
                    filter
                    @filter="getdata_lokasi"
                    @change="pilihDesa"
                    :options="datalokasi"
                    :loading="loadingDesa"
                    optionLabel="id_desa"
                    placeholder="🔍 Ketik minimal 4 huruf untuk mencari desa..."
                    class="w-100"
                    appendTo="body"
                  >
                    <template #option="slotProps">
                      <div class="flex items-center">
                        <!-- <strong>{{ slotProps.option.nama_desa }}</strong> -->
                        <small>
                          <div style="white-space: normal; width: 400px; overflow-wrap: break-word">
                            <Tag severity="info"> {{ slotProps.option.namaprovinsi }}</Tag> >
                            <strong style="font-size: x-small">{{
                              slotProps.option.nama_kabkota
                            }}</strong>
                            >
                            <strong style="font-size: x-small">{{
                              slotProps.option.nama_kecamatan
                            }}</strong>
                            >
                            <strong style="font-size: x-small">{{
                              slotProps.option.nama_desa
                            }}</strong>
                          </div>
                        </small>
                      </div>
                    </template>
                  </Select>
                </div>
              </div>

              <div class="col-md-6">
                <!-- Alamat -->
                <div class="form-group">
                  <label class="font-bold">No TELP <span class="text-danger">*</span></label>
                  <InputText
                    v-model="form.no_telp"
                    :class="{ 'input-error': errors.no_telp }"
                    style="width: 100%"
                  />
                  <small class="text-danger" v-if="errors.no_telp">{{ errors.no_telp }}</small>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="font-bold">Alamat Lengkap <span class="text-danger">*</span></label>
                  <InputText
                    v-model="form.alamat"
                    :class="{ 'input-error': errors.alamat }"
                    style="width: 100%"
                  />
                  <small class="text-danger" v-if="errors.alamat">{{ errors.alamat }}</small>
                </div>
              </div>
            </div>

            <!-- ================= Informasi Tambahan ================= -->
            <h6 class="section-title mt-4">
              <i class="pi pi-info-circle section-icon mr-2"></i> Informasi Tambahan
            </h6>
            <hr />
            <div class="row">
              <div class="col-md-6">
                <!-- Pendidikan -->
                <div class="form-group">
                  <label class="font-bold">Pendidikan Terakhir</label>
                  <Select
                    v-model="form.pendidikan"
                    :options="listPendidikan"
                    optionLabel="nama"
                    placeholder="Pilih Pendidikan"
                    class="w-100"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <!-- Pekerjaan -->
                <div class="form-group">
                  <div class="d-flex gap-2">
                    <div
                      :style="
                        ['TNI', 'POLRI'].includes(form.pekerjaan?.label)
                          ? 'width: 50%'
                          : 'width: 100%'
                      "
                    >
                      <label class="font-bold">Pekerjaan</label>
                      <Select
                        v-model="form.pekerjaan"
                        :options="pekerjaanOptions"
                        optionLabel="label"
                        :class="{ 'input-error': errors.pekerjaan }"
                        placeholder="Contoh: Pegawai Swasta"
                        style="width: 100%"
                      />
                    </div>
                    <div v-if="['TNI', 'POLRI'].includes(form.pekerjaan?.label)" style="width: 50%">
                      <label class="font-bold">NRP</label>
                      <InputText v-model="form.no_nrp" placeholder="No NRP" style="width: 100%" />
                    </div>
                  </div>
                  <div v-if="['TNI', 'POLRI'].includes(form.pekerjaan?.label)" class="mt-2">
                    <label class="font-bold">Hubungan dengan TNI/POLRI</label>
                    <Select
                      v-model="form.hubungan_tni_polri"
                      :options="hubunganTNIOptions"
                      optionLabel="label"
                      placeholder="Pilih Hubungan"
                      style="width: 100%"
                    />
                  </div>
                  <small class="text-danger" v-if="errors.pekerjaan">{{ errors.pekerjaan }}</small>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <!-- Suku -->
                <div class="form-group">
                  <label class="font-bold">Suku <span class="text-danger">*</span></label>
                  <Select
                    v-model="form.suku"
                    :options="listSuku"
                    optionLabel="nama_suku"
                    placeholder="Pilih Suku"
                    :class="{ 'input-error': errors.suku }"
                    class="w-100"
                    filter
                  />
                  <small class="text-danger" v-if="errors.suku">{{ errors.suku }}</small>
                </div>
              </div>
              <div class="col-md-6">
                <!-- Agama -->
                <div class="form-group">
                  <label class="font-bold">Agama <span class="text-danger">*</span></label>

                  <Select
                    v-model="form.agama"
                    :options="listAgama"
                    optionLabel="nama"
                    placeholder="Pilih Agama"
                    :class="{ 'input-error': errors.agama }"
                    class="w-100"
                  />
                  <small class="text-danger" v-if="errors.agama">{{ errors.agama }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Aksi -->
      <div class="row mt-3">
        <div class="col-md-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="warn"
            class="p-button-outline mr-2 w-100 round-button2"
            @click="handleCancel"
          />
        </div>
        <div class="col-md-9">
          <Button
            label="Simpan"
            icon="pi pi-save"
            class="p-button-success w-100 round-button2"
            :loading="loading"
            @click="handleSave"
          />
        </div>
      </div>
    </section>
    <Toast />
  </Dialog>
</template>

<script setup>
import { ref, onMounted, defineExpose, watch } from 'vue'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'

const ShowInputPasien = ref(false)
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const datalokasi = ref([])

const loading = ref(false)

const props = defineProps({
  os: {
    type: Object,
    required: true,
  },
  mode: {
    type: Number,
    required: true,
  },
  norm: {
    type: String,
    required: true,
  },
})

const localOs = ref({ ...props.os })

const listAgama = ref([
  { kode: '1', nama: 'ISLAM' },
  { kode: '2', nama: 'KRISTEN PROTESTAN' },
  { kode: '3', nama: 'KRISTEN KATHOLIK' },
  { kode: '4', nama: 'HINDU' },
  { kode: '5', nama: 'BUDHA' },
  { kode: '6', nama: 'LAIN-LAIN' },
])

// Daftar pendidikan
const listPendidikan = ref([
  { kode: '1', nama: 'SD' },
  { kode: '2', nama: 'SMP' },
  { kode: '3', nama: 'SMA' },
  { kode: '4', nama: 'D3/AKADEMIK' },
  { kode: '5', nama: 'UNIVERSITAS' },
  { kode: '6', nama: 'TIDAK TAHU' },
])

const listStatus = ref([
  { kode: '1', nama: 'BELUM KAWIN' },
  { kode: '2', nama: 'KAWIN' },
  { kode: '3', nama: 'JANDA/DUDA' },
])

const pekerjaanOptions = ref([
  { kode: '1', label: 'PNS' },
  { kode: '2', label: 'POLRI' },
  { kode: '7', label: 'TNI' },
  { kode: '3', label: 'SWASTA' },
  { kode: '4', label: 'BUMN' },
  { kode: '5', label: 'MAHASISWA' },
  { kode: '6', label: 'TIDAK/BELUM BEKERJA' },
])

const hubunganTNIOptions = ref([
  { kode: '1', label: 'Diri Sendiri' },
  { kode: '2', label: 'Suami' },
  { kode: '3', label: 'Istri' },
  { kode: '4', label: 'Anak' },
])

const HakKelasList = ref([
  {
    kode: '1',
    keterangan: 'KELAS 1',
  },
  {
    kode: '2',
    keterangan: 'KELAS 2',
  },
  {
    kode: '3',
    keterangan: 'KELAS 3',
  },
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
// === FORM PASIEN ===
const form = ref({
  rm: '',
  nama_pasien: localOs.value?.nama || '',
  nik: localOs.value?.nik || '',
  noka: localOs.value?.noKartu || '',
  tanggal_lahir: localOs.value?.tglLahir || null,
  usia: localOs.value?.umur?.umurSekarang || '',
  jeniskelamin:
    localOs.value?.sex === 'L' ? 'Laki-laki' : localOs.value?.sex === 'P' ? 'Perempuan' : '',
  status_perkawinan: '',
  alamat: localOs.value?.provUmum?.nmProvider || '',
  desaselected: null,
  pendidikan: '',
  pekerjaan: localOs.value?.jenisPeserta?.keterangan || '',
  no_nrp: '',
  hubungan_tni_polri: null,
  agama: '',
  suku: '',
  no_telp: '',
  hakKelas: '',
  id_client: id_client.value,
})

const errors = ref({
  rm: '',
  nama_pasien: '',
  nik: '',
  tanggal_lahir: '',
  jeniskelamin: '',
  alamat: '',
  agama: '',
  suku: '',
  no_telp: '',
})

// Validasi Form
const validateForm = () => {
  errors.value = {
    rm: '',
    nama_pasien: '',
    nik: '',
    tanggal_lahir: '',
    jeniskelamin: '',
    alamat: '',
    agama: '',
    suku: '',
    no_telp: '',
    pekerjaan: '',
    status_perkawinan: '',
  }

  let isValid = true

  if (!form.value.nama_pasien || form.value.nama_pasien.trim() === '') {
    errors.value.nama_pasien = 'Nama Pasien harus diisi'
    isValid = false
  }

  if (!form.value.nik || form.value.nik.trim() === '') {
    errors.value.nik = 'NIK harus diisi'
    isValid = false
  } else if (form.value.nik.trim() !== '-' && form.value.nik.length !== 16) {
    errors.value.nik = 'NIK harus 16 digit'
    isValid = false
  }

  if (!form.value.tanggal_lahir) {
    errors.value.tanggal_lahir = 'Tanggal Lahir belum diisi'
    isValid = false
  }

  if (!form.value.jeniskelamin || form.value.jeniskelamin.trim() === '') {
    errors.value.jeniskelamin = 'Jenis Kelamin harus dipilih'
    isValid = false
  }

  if (!form.value.alamat || form.value.alamat.trim() === '') {
    errors.value.alamat = 'Alamat belum diisi'
    isValid = false
  }

  if (!form.value.agama.nama || form.value.agama.nama.trim() === '') {
    errors.value.agama = 'Agama belum dipilih'
    isValid = false
  }

  if (!form.value.suku || form.value.suku.nama_suku === '') {
    errors.value.suku = 'Suku belum dipilih'
    isValid = false
  }

  if (!form.value.no_telp || form.value.no_telp.trim() === '') {
    errors.value.no_telp = 'No Telp belum di isi'
    isValid = false
  }

  if (!form.value.pekerjaan || form.value.pekerjaan === null) {
    errors.value.pekerjaan = 'Pekerjaan belum dipilih'
    isValid = false
  }

  if (!form.value.status_perkawinan || form.value.status_perkawinan.label === '') {
    errors.value.status_perkawinan = 'Stts perkawinan belum dipilih'
    isValid = false
  }

  if (localOs.value?.noKartu) {
    const kodeOs = localOs.value?.hakKelas?.kode || ''
    const kodeForm = form.value?.hakKelas?.kode || ''

    if (kodeOs !== kodeForm) {
      showWarning('Data kelas pasien tidak sesuai')
      isValid = false
    }
  }

  return isValid
}

const listSuku = ref([])

const getSuku = async () => {
  const url = configStore.apiBaseUrl
  const response = await axios.post(`${url}/index.php/api/data_referensi/get_suku`)
  listSuku.value = response.data
}

onMounted(async () => {
  await getSuku()
})

// Hitung Usia dari Tanggal Lahir
const calculateAge = (birthDate) => {
  if (!birthDate) return null

  const today = new Date()
  const birth = new Date(birthDate)

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// Hitung Tanggal Lahir dari Usia
const calculateBirthDate = (age) => {
  if (!age || age < 0) return null

  const today = new Date()
  const birthDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())

  return birthDate
}

// Watch Tanggal Lahir - Hitung Usia Otomatis
watch(
  () => form.value.tanggal_lahir,
  (newDate) => {
    if (newDate) {
      const calculatedAge = calculateAge(newDate)
      form.value.usia = calculatedAge
    }
  },
)

// Watch Usia - Hitung Tanggal Lahir
watch(
  () => form.value.usia,
  (newAge) => {
    if (newAge && newAge > 0) {
      const calculatedBirthDate = calculateBirthDate(newAge)
      if (calculatedBirthDate) {
        form.value.tanggal_lahir = calculatedBirthDate
      }
    }
  },
)

const setDataFromOnline = async () => {
  form.value = {
    rm: props.mode == 1 ? '' : form.value.rm,
    mode: props.mode,
    nama_pasien: localOs.value?.nama || '',
    nik: localOs.value?.nik || '',
    noka: localOs.value?.noKartu || '',
    tanggal_lahir: localOs.value?.tglLahir ? new Date(localOs.value.tglLahir) : null,
    usia: localOs.value?.umur?.umurSekarang || '',
    jeniskelamin:
      localOs.value?.sex === 'L' ? 'LAKI-LAKI' : localOs.value?.sex === 'P' ? 'PEREMPUAN' : '',
    status_perkawinan: '',
    alamat: localOs.value?.provUmum?.nmProvider || '',
    desaselected: form.value.desaselected,
    pendidikan: '',
    pekerjaan:
      pekerjaanOptions.value.find(
        (x) => x.label?.toLowerCase() === localOs.value?.jenisPeserta?.keterangan?.toLowerCase(),
      ) || '',
    agama: '',
    suku: '',
    hakKelas: localOs.value.noKartu
      ? HakKelasList.value.find((x) => x.kode === localOs.value.hakKelas?.kode) || ''
      : '',
    no_telp: localOs.value?.mr?.noTelepon || '',
    id_client: id_client.value,
  }
}

watch(ShowInputPasien, (val) => {
  if (val && localOs) {
    localOs.value = { ...props.os }
    setDataFromOnline()
  }
})

// API calls
const loadingCheckData = ref(false)
const get_data_pesertaOnline = async () => {
  loadingCheckData.value = true
  try {
    const url = configStore.apiBaseUrl

    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/get_data_peserta_v2/${form.value.noka}/${id_client.value}`,
    )

    if (response.data.metaData.code !== '200') {
      showWarning(response.data.metaData.message)
      return
    }

    if (response?.data?.response) {
      form.value = {
        ...form.value, // simpan semua field lama
        nama_pasien: response.data.response.peserta.nama,
        nik: response.data.response.peserta?.nik || '',
        noka: response.data.response.peserta?.noKartu || '',
        hakKelas: HakKelasList.value.find(
          (x) => x.kode === response.data.response.peserta.hakKelas?.kode,
        ),
        tanggal_lahir: formatDateOnlyForAPI(response.data.response.peserta?.tglLahir),
      }

      //setDataFromOnline()
    } else {
      showWarning('Peserta tidak ditemukan di layanan BPJS')
    }
  } catch (error) {
    console.error('Error get_data_pesertaOnline:', error)
    showError('Gagal mengambil data peserta online')
  } finally {
    loadingCheckData.value = false
    loading.value = false
  }
}

const listDataRiwayat = ref(null)
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
      form.value.noKartu = first.NO_KARTU

      if (listDataRiwayat.value.KDKELURAHAN != '') {
        await getdata_lokasi_by_id(listDataRiwayat.value.KDKELURAHAN)
      }

      form.value = {
        rm: props.norm,
        mode: props.mode,
        id_pasien: listDataRiwayat.value.IDPASIEN,
        nama_pasien: listDataRiwayat.value.NAMAPASIEN || '',
        nik: listDataRiwayat.value.NOKTP || '',
        noka: listDataRiwayat.value.NO_KARTU || '',
        tanggal_lahir: listDataRiwayat.value.TGLLAHIR,
        jeniskelamin:
          listDataRiwayat.value.JENISKELAMIN === 'L'
            ? 'LAKI-LAKI'
            : listDataRiwayat.value.JENISKELAMIN === 'P'
              ? 'PEREMPUAN'
              : '',
        status_perkawinan: listStatus.value.find((x) => x.kode === listDataRiwayat.value.STATUS),
        alamat: listDataRiwayat.value.TEMPAT || '',
        desaselected: datalokasi.value[0],
        pendidikan: listPendidikan.value.find((x) => x.kode === listDataRiwayat.value.PENDIDIKAN),
        pekerjaan: pekerjaanOptions.value.find((x) => x.kode === listDataRiwayat.value.PEKERJAAN),
        no_nrp: listDataRiwayat.value.NO_NRP || '',
        hubungan_tni_polri:
          hubunganTNIOptions.value.find(
            (x) => x.kode === listDataRiwayat.value.HUBUNGAN_TNI_POLRI,
          ) || null,
        agama: listAgama.value.find((x) => x.kode === listDataRiwayat.value.AGAMA),
        suku: listSuku.value.find((x) => x.id_suku === listDataRiwayat.value.SUKU),
        no_telp: listDataRiwayat.value.NOTELP || '',
        hakKelas: HakKelasList.value.find((x) => x.kode === listDataRiwayat.value.Kelas),
        id_client: id_client.value,
      }
    } else {
      showError('Data pasien tidak ditemukan (lokal)')
    }
  } catch (error) {
    console.error('Error fetching pasien lokal:', error)
    showError('Terjadi kesalahan saat memuat data pasien lokal')
  } finally {
    loading.value = false
  }
}

watch(ShowInputPasien, (val) => {
  if (val && props.mode == 2) {
    GetDataPasienLocal('3', props.norm)
  } else {
    //resetForm()
  }
})

const getdata_lokasi = async (event) => {
  const query = event.value
  if (!query || query.length < 4) return (datalokasi.value = [])
  try {
    const url = configStore.apiBaseUrl
    const param = { mode: 1, nama_desa: query }
    const { data } = await axios.post(`${url}/index.php/api/data_referensi/get_desa_v3`, param)
    datalokasi.value = data
  } catch (error) {
    console.error(error)
    showError(error)
  }
}

const loadingDesa = ref(false)

const getdata_lokasi_by_id = async (id_desa) => {
  try {
    const url = configStore.apiBaseUrl
    loadingDesa.value = true
    const param = { mode: 3, nama_desa: id_desa }
    const { data } = await axios.post(`${url}/index.php/api/data_referensi/get_desa_v3`, param)
    datalokasi.value = data
    loadingDesa.value = false
    return datalokasi.value
  } catch (error) {
    console.error(error)
    showError(error)
  }
}

const pilihDesa = () => {
  form.value.alamat = form.value.desaselected?.nama_desa || ''
}

const showDialogInputPasien = () => {
  resetForm()
  ShowInputPasien.value = true
}

const resetForm = () => {
  form.value = {
    mode: props.mode,
    rm: '',
    nama_pasien: '',
    nik: '',
    noka: '',
    tanggal_lahir: null,
    usia: null,
    jeniskelamin: '',
    status_perkawinan: '',
    alamat: '',
    desaselected: null,
    pendidikan: '',
    pekerjaan: '',
    agama: '',
    suku: '',
    no_telp: '',
    id_client: id_client.value,
  }
  errors.value = {
    rm: '',
    nama_pasien: '',
    nik: '',
    tanggal_lahir: '',
    jeniskelamin: '',
    alamat: '',
    agama: '',
    suku: '',
    no_telp: '',
  }
}

const handleCancel = () => {
  resetForm()
  ShowInputPasien.value = false
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

const handleSave = async () => {
  if (!validateForm()) {
    //showWarning('Silakan lengkapi semua field yang wajib diisi')

    return
  }

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const response = await axios.post(
      `${url}/index.php/api/data_referensi/inputPasienMode5`,
      form.value,
    )
    loading.value = false
    console.log(response.data)

    if (response.data.code == 200) {
      form.value = {
        rm: response.data.no_rm,
      }
      showSuccess(response.data.message)

      if (props.mode == 2) {
        setTimeout(() => {
          ShowInputPasien.value = false
        }, 500) // 2000 ms = 2 detik
      }
    } else {
      showWarning(response.data.message)
    }
  } catch (error) {
    console.error(error)
    showWarning(error)
  }

  // Lanjutkan proses simpan
  // handleCancel()
}

// Menangani Enter Key untuk fokus ke field berikutnya
const handleEnterKey = (event, nextFieldSelector) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const nextElement = document.querySelector(nextFieldSelector)
    if (nextElement) {
      nextElement.focus()
      if (nextElement.tagName === 'INPUT' && nextElement.type === 'text') {
        nextElement.select()
      }
    }
  }
}

defineExpose({ showDialogInputPasien })
</script>

<style scoped>
.bg-header {
  background: linear-gradient(135deg, #faf6f1 0%, #f5ede3 100%);
  border-bottom: 2px solid #e8dcc8;
}

.header-icon {
  color: #e74c3c;
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.section-icon {
  color: #3498db;
  font-weight: 600;
}

.section-title {
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.patient-info-card {
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  padding-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.input-group-append {
  display: flex;
  align-items: center;
}

.input-group-append .p-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -1px;
}

.calendar-high-z .p-datepicker {
  z-index: 9999 !important;
}

.input-error {
  border-color: #dc3545 !important;
  background-color: #fff5f5;
}

.text-danger {
  color: #dc3545;
}

.text-muted {
  color: #6c757d;
}

small.text-danger {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

small.text-muted {
  display: block;
  margin-top: 0.25rem;
}

.mt-3 {
  margin-top: 1.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}
</style>
