<template>
  <div class="content">
    <cardPasien></cardPasien>

    <Panel class="mt-2">
      <p>
        Asesmen gizi adalah langkah awal dalam pelayanan gizi klinik untuk menilai status gizi
        pasien. Petugas gizi melakukan pengumpulan data melalui anamnesis, pemeriksaan fisik,
        antropometri, biokimia, riwayat makan, serta kondisi klinis pasien. Hasil asesmen digunakan
        sebagai dasar penyusunan diagnosis gizi dan intervensi gizi.
      </p>
    </Panel>

    <Panel class="mt-2">
      <h5 class="mb-3">Form Asesmen Gizi (Antropometri)</h5>
      <hr />
      <p>
        Antropometri adalah pengukuran fisik tubuh pasien yang digunakan untuk menilai status gizi
        secara kuantitatif. Data ini menjadi dasar dalam menentukan adanya gizi kurang, gizi lebih,
        atau obesitas, serta memantau perubahan status gizi dari waktu ke waktu
      </p>
      <div class="row">
        <!-- Kolom 1 -->
        <div class="col-md-4">
          <div class="mb-3">
            <label>Berat Badan (kg)</label>
            <InputNumber v-model="form.berat_badan" class="w-100" />
          </div>
          <div class="mb-3">
            <label>Tinggi Badan (cm)</label>
            <InputNumber v-model="form.tinggi_badan" class="w-100" />
          </div>
          <div class="mb-3">
            <label>IMT (kg/m²)</label>
            <InputNumber v-model="computedIMT" class="w-100" :readonly="true" />
          </div>
          <div class="mb-3">
            <label>Berat Badan Ideal (kg)</label>
            <InputNumber v-model="form.bbi" class="w-100" />
          </div>

          <!-- Status Gizi Radio Buttons -->
          <div class="mb-3">
            <label class="block font-semibold mb-2">Status Gizi</label>
            <div class="flex flex-column gap-3">
              <div
                class="flex align-items-center"
                v-for="option in statusGiziOptions"
                :key="option.value"
              >
                <RadioButton
                  v-model="form.status_gizi"
                  :inputId="option.value"
                  name="status_gizi"
                  :value="option.value"
                />
                <label :for="option.value" class="ml-2">{{ option.label }}</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom 2 -->
        <div class="col-md-4">
          <div class="mb-3">
            <label>Panjang Badan (cm)</label>
            <InputNumber v-model="form.panjang_badan" class="w-100" />
          </div>
          <div class="mb-3">
            <label>Lingkar Kepala (cm)</label>
            <InputNumber v-model="form.lingkar_kepala" class="w-100" />
          </div>
          <div class="mb-3">
            <label>Lingkar Lengan Atas (cm)</label>
            <InputNumber v-model="form.lingkar_lengan" class="w-100" />
          </div>
          <div class="mb-3">
            <label>LLA/U</label>
            <InputText v-model="form.lla_u" class="w-100" />
          </div>
        </div>

        <!-- Kolom 3 -->
        <div class="col-md-4">
          <div class="mb-3">
            <label>BB/U</label>
            <InputText v-model="form.bb_u" class="w-100" />
          </div>
          <div class="mb-3">
            <label>TB/U</label>
            <InputText v-model="form.tb_u" class="w-100" />
          </div>
          <div class="mb-3">
            <label>BB/TB</label>
            <InputText v-model="form.bb_tb" class="w-100" />
          </div>
          <div class="mb-3">
            <label>BBA/BBI (%)</label>
            <InputNumber v-model="form.bba_bbi" class="w-100" />
          </div>
        </div>
      </div>
    </Panel>

    <Panel class="mt-2">
      <h5 class="mb-3">Biokimia</h5>
      <hr />
      <p>
        Data biokimia merupakan hasil pemeriksaan laboratorium yang digunakan untuk menilai status
        gizi dan kondisi kesehatan pasien. Informasi ini membantu mengidentifikasi adanya kekurangan
        atau kelebihan zat gizi, serta memantau respon terhadap terapi gizi.
      </p>
      <Divider />
      <div class="row">
        <div class="col-md-6">
          <label class="block font-semibold mb-2">Biokimia</label>
          <div class="flex align-items-center mb-2">
            <RadioButton
              inputId="bio_normal"
              name="biokimia"
              value="Normal"
              v-model="form.biokimia_status"
            />
            <label for="bio_normal" class="ml-2">Normal</label>
            <RadioButton
              inputId="bio_bemasalah"
              name="biokimia"
              value="Bermasalah"
              v-model="form.biokimia_status"
              class="ml-4"
            />
            <label for="bio_bemasalah" class="ml-2">Bermasalah</label>
          </div>
          <Textarea
            v-model="form.biokimia_ket"
            rows="3"
            style="width: 100%"
            placeholder="Biokimia (Isi Jika Bermasalah)"
          />
        </div>
        <div class="col-md-6">
          <label class="block font-semibold mb-2">Klinik/Fisik</label>
          <div class="flex align-items-center mb-2">
            <RadioButton
              inputId="klinik_normal"
              name="klinik"
              value="Normal"
              v-model="form.klinik_status"
            />
            <label for="klinik_normal" class="ml-2">Normal</label>
            <RadioButton
              inputId="klinik_bemasalah"
              name="klinik"
              value="Bermasalah"
              v-model="form.klinik_status"
              class="ml-4"
            />
            <label for="klinik_bemasalah" class="ml-2">Bermasalah</label>
          </div>
          <Textarea
            v-model="form.klinik_ket"
            rows="3"
            style="width: 100%"
            placeholder="Klinik/Fisik (Isi Jika Bermasalah)"
          />
        </div>
      </div>
    </Panel>

    <Panel class="mt-2">
      <h5 class="mb-3">Rencana Asuhan Gizi/Diagnosa Gizi</h5>
      <hr />

      <div class="row">
        <div class="col-md-6">
          <!-- Alergi Makanan -->
          <div class="form-group mb-3">
            <label class="block font-semibold mb-2">Alergi Makanan</label>
            <MultiSelect
              v-model="form.alergi_makanan"
              :options="alergiOptions"
              optionLabel="name"
              optionValue="value"
              placeholder="Pilih Alergi Makanan"
              class="w-100"
            />
            <div class="input-group mt-2 flex">
              <InputText
                v-model="form.alergi_lainnya"
                placeholder="Alergi Lainnya"
                class="flex-grow-1"
              />
              <Button icon="pi pi-plus" @click="tambahAlergi" class="ml-2" />
            </div>
          </div>

          <!-- Pola Makan -->
          <div class="form-group mb-3">
            <label class="block font-semibold mb-2">Pola Makan</label>
            <Textarea v-model="form.pola_makan" rows="3" placeholder="Pola Makan" class="w-100" />
          </div>

          <!-- Diet Sekarang -->
          <div class="form-group mb-3">
            <label class="block font-semibold mb-2">Diet Sekarang</label>
            <InputText
              v-model="form.diet_sekarang"
              placeholder="Diet Yang Dijalani Sekarang"
              class="w-100"
            />
          </div>

          <!-- Nafsu Makan -->
          <div class="form-group mb-3">
            <label class="block font-semibold mb-2">Nafsu Makan</label>
            <div class="flex align-items-center gap-4">
              <div class="flex align-items-center">
                <RadioButton
                  inputId="nafsu_baik"
                  name="nafsuMakan"
                  value="Baik"
                  v-model="form.nafsu_makan"
                />
                <label for="nafsu_baik" class="ml-2">Baik</label>
              </div>
              <div class="flex align-items-center">
                <RadioButton
                  inputId="nafsu_kurang"
                  name="nafsuMakan"
                  value="Kurang"
                  v-model="form.nafsu_makan"
                />
                <label for="nafsu_kurang" class="ml-2">Kurang</label>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="block font-semibold mb-2">Problem</label>
            <Textarea v-model="form.problem" rows="3" placeholder="Pola Makan" class="w-100" />
          </div>
          <div class="form-group mb-3">
            <label class="block font-semibold mb-2">Etiologi</label>
            <Textarea v-model="form.etiologi" rows="3" placeholder="Etiologi" class="w-100" />
          </div>
          <div class="form-group mb-3">
            <label class="block font-semibold mb-2">Sings/Symptomp</label>
            <Textarea v-model="form.symtomp" rows="3" placeholder="Sings/Symptomp" class="w-100" />
          </div>
        </div>
      </div>
    </Panel>

    <Panel class="mt-2">
      <!-- Tombol -->
      <div class="mt-3 text-end">
        <Button
          label="Simpan"
          icon="pi pi-save"
          severity="success"
          @click="simpanForm"
          :loading="loading"
        />
        <Button
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          class="ms-2"
          @click="resetForm"
        />
      </div>
    </Panel>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import axios from 'axios'

// Components
import cardPasien from '@/components/umum/CardPasienTransComponent.vue'

// Stores
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const toast = useToast()
const route = useRoute()
const loading = ref(false)

// Form data dengan konsistensi naming snake_case
const form = ref({
  //nomor

  no_konsul: route.query.no_konsul,
  // Antropometri
  berat_badan: 95,
  panjang_badan: null,
  tinggi_badan: 175,
  lingkar_kepala: null,
  imt: 31.02,
  lingkar_lengan: null,
  bbi: null, // Berat Badan Ideal
  status_gizi: 'Normal',

  // Z-Score measurements
  lla_u: '',
  bb_u: '',
  tb_u: '',
  bb_tb: '',
  bba_bbi: null,

  // Biokimia dan Klinik
  biokimia_status: 'Normal',
  biokimia_ket: '',
  klinik_status: 'Normal',
  klinik_ket: '',

  // Rencana Asuhan Gizi
  alergi_makanan: [],
  alergi_lainnya: '',
  pola_makan: '',
  diet_sekarang: '',
  nafsu_makan: 'Baik',

  problem: '',
  etiologi: '',
  symtomp: '',
})

const dataAssesmentGizi = ref([])

const getdata_assesment = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const param = {
      no_konsul: route.query.no_konsul,
      mode: 1,
    }

    const response = await axios.post(
      `${url}/index.php/api/triaseigd/get_data_assesment_gizi_lanjut`,
      param,
    )

    console.log(response.data)

    dataAssesmentGizi.value = response.data.response[0]
    form.value = dataAssesmentGizi.value
    form.value.alergi_makanan = dataAssesmentGizi.value['alergi_makanan']
      ? JSON.parse(dataAssesmentGizi.value['alergi_makanan'])
      : []
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// Computed IMT otomatis
const computedIMT = computed({
  get() {
    if (form.value.tinggi_badan && form.value.berat_badan) {
      const tinggiMeter = form.value.tinggi_badan / 100
      return parseFloat((form.value.berat_badan / (tinggiMeter * tinggiMeter)).toFixed(2))
    }
    return form.value.imt || null
  },
  set(value) {
    form.value.imt = value
  },
})

// Watch untuk update IMT otomatis
import { watch } from 'vue'
watch([() => form.value.berat_badan, () => form.value.tinggi_badan], () => {
  if (form.value.tinggi_badan && form.value.berat_badan) {
    const tinggiMeter = form.value.tinggi_badan / 100
    form.value.imt = parseFloat((form.value.berat_badan / (tinggiMeter * tinggiMeter)).toFixed(2))
  }
})

const statusGiziOptions = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Obesitas', value: 'Obesitas' },
  { label: 'Lebih', value: 'Lebih' },
  { label: 'Kurang', value: 'Kurang' },
  { label: 'Buruk', value: 'Buruk' },
]

const alergiOptions = [
  { name: 'Telur', value: 'Telur', snomed: '235719002' },
  { name: 'Susu Sapi & Produk Olahannya', value: 'Susu', snomed: '235706003' },
  { name: 'Kacang Kedelai/Tanah', value: 'Kacang', snomed: '256349002' },
  { name: 'Gluten/Gandum', value: 'Gluten', snomed: '235719002' },
  { name: 'Udang', value: 'Udang', snomed: '235721000' },
  { name: 'Ikan', value: 'Ikan', snomed: '235718006' },
  { name: 'Hazelnut/Almond', value: 'Hazelnut', snomed: '256350002' },
]
// Methods
const tambahAlergi = () => {
  if (form.value.alergi_lainnya.trim()) {
    // Tambahkan alergi baru ke options
    const newAlergi = {
      name: form.value.alergi_lainnya,
      value: form.value.alergi_lainnya,
      snomed: 'custom',
    }
    alergiOptions.push(newAlergi)

    // Tambahkan ke form selection
    form.value.alergi_makanan.push(form.value.alergi_lainnya)

    // Reset input
    form.value.alergi_lainnya = ''
  }
}

const simpanForm = async () => {
  try {
    loading.value = true

    // Validasi dasar
    if (!form.value.berat_badan || !form.value.tinggi_badan) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Berat badan dan tinggi badan harus diisi',
        life: 3000,
      })
      return
    }

    // Prepare data untuk API
    const formData = {
      ...form.value,
      id_client: id_client.value,
      tanggal: new Date().toISOString().split('T')[0],
    }

    const url = configStore.apiBaseUrl
    // API call
    const response = await axios.post(`${url}/index.php/api/triaseigd/update_gizi`, formData, {
      headers: {
        Authorization: ``,
        'Content-Type': 'application/json',
      },
    })

    console.log(formData)

    if (response.data.code == 200) {
      showSuccess('Data asesmen gizi berhasil disimpan!')
      // Optional: redirect atau reset form
    }
  } catch (error) {
    console.error('Error saving form:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.keys(form.value).forEach((key) => {
    if (Array.isArray(form.value[key])) {
      form.value[key] = []
    } else if (typeof form.value[key] === 'string') {
      form.value[key] = ''
    } else {
      form.value[key] = null
    }
  })

  // Set default values
  form.value.status_gizi = 'Normal'
  form.value.biokimia_status = 'Normal'
  form.value.klinik_status = 'Normal'
  form.value.nafsu_makan = 'Baik'

  showSuccess('Form berhasil direset!')
}

const showSuccess = (message = 'Operasi berhasil') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

onMounted(() => {
  // Initialize form or load existing data
  getdata_assesment()
  console.log('Form initialized')
})
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  align-items: center;
}

.flex-grow-1 {
  flex: 1;
}
</style>
