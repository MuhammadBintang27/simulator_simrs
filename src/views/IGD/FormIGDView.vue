<template>
  <section class="content">
    <div class="container-fluid">
      <div class="card elevation-0">
        <div class="card-header">
          <div class="row">
            <div class="col-md-6" style="text-align: right">
              <h5>TRIASE</h5>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-8 right-center" style="text-align: right"></div>
            <div class="col-md-4 right-center" style="text-align: right">
              <div class="row">
                <div class="col-md-2 elevation-0">
                  <div
                    class="small-box bg-danger elevation-0"
                    style="text-align: center; padding: 20px"
                  >
                    <h5>{{ nilai_triase.EMERGENSI }}</h5>
                  </div>
                </div>
                <div class="col-md-2" style="text-align: center">
                  <div
                    class="small-box bg-warning elevation-0"
                    style="text-align: center; padding: 20px"
                  >
                    <h5>{{ nilai_triase.URGENT }}</h5>
                  </div>
                </div>
                <div class="col-md-2" style="text-align: center">
                  <div
                    class="small-box bg-success elevation-0"
                    style="text-align: center; padding: 20px"
                  >
                    <h5>{{ nilai_triase.NON_URGENT }}</h5>
                  </div>
                </div>
                <div class="col-md-2" style="text-align: center">
                  <div
                    class="small-box bg-black elevation-0"
                    style="text-align: center; padding: 20px"
                  >
                    <h5>{{ nilai_triase.DEATH_ON_ARRIVAL }}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Vue 3: ProgressBar uses v-show, no change needed -->
          <ProgressBar mode="indeterminate" v-show="isLoading" style="height: 0.2em" />
        </div>
      </div>

      <!-- Vue 3 + PrimeVue 4: Dialog uses v-model:visible instead of :visible.sync -->
      <Dialog
        header=""
        v-model:visible="displayConfirmation"
        :style="{ width: '20vw' }"
        :modal="true"
      >
        <h5>{{ message }}</h5>
        <template #footer>
          <Button label="Tutup" icon="pi pi-check" @click="closeConfirmation" autofocus />
        </template>
      </Dialog>

      <div class="card card card-primary card-outline elevation-0">
        <div class="card-header">
          <strong>CARA MASUK PASIEN</strong>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-sm-2">
              <div class="form-group">
                <label for="caradatang">Masuk diantar oleh</label><br />
                <!-- PrimeVue 4: Dropdown renamed to Select -->
                <Select
                  id="caradatang"
                  v-model="form.diantar_oleh"
                  :options="caradatang"
                  optionLabel="diantar_oleh"
                  placeholder="Pilih cara datang"
                />
              </div>
            </div>
            <div class="col-sm-3">
              <div class="form-group">
                <label for="transportasi">Transportasi</label><br />
                <Select
                  id="transportasi"
                  style="width: 20em"
                  :options="transportasi"
                  v-model="form.transportasi"
                  optionLabel="transportasi"
                  placeholder="Pilih transportasi"
                />
              </div>
            </div>
            <div class="col-sm-3">
              <div class="form-group">
                <label for="waktu_masuk">Waktu masuk</label><br />
                <!-- PrimeVue 4: DatePicker replaces Calendar -->
                <DatePicker
                  id="waktu_masuk"
                  v-model="form.waktu_masuk"
                  :showTime="true"
                  :showSeconds="true"
                />
                <Button
                  label="Jam skrg"
                  @click="set_datetime_now"
                  icon="pi pi-stopwatch"
                  class="p-button p-btn-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-primary card-outline elevation-0">
        <div class="card-header">
          <strong>ANAMNESE SINGKAT</strong>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-sm-8">
              <div class="form-group">
                <label for="keluhanutama">Keluhan Utama</label><br />
                <Textarea
                  id="keluhanutama"
                  v-model="form.keluhan_utama"
                  style="width: 100%"
                  rows="5"
                  cols="30"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-8">
              <div class="form-group">
                <label for="riwayat_penyakit_dahulu">Riwayat Penyakit dahulu</label><br />
                <Textarea
                  id="riwayat_penyakit_dahulu"
                  placeholder="Riwayat Penyakit dahulu"
                  v-model="form.riwayat_penyakit_dahulu"
                  rows="5"
                  style="width: 100%"
                  cols="30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-primary card-outline elevation-0">
        <div class="card-body">
          <div class="row">
            <div class="col-sm-6">
              <div class="form-group">
                <label for="status_psikologi">STATUS PSIKOLOGI</label><br />
                <div class="row">
                  <div class="col-md-4">
                    <div
                      class="field-radiobutton"
                      v-for="opt in ['Marah', 'Takut', 'Cemas', 'Depresi']"
                      :key="opt"
                    >
                      <!-- PrimeVue 4: RadioButton uses v-model directly (no name grouping needed) -->
                      <RadioButton
                        :inputId="opt"
                        name="status_psikologi"
                        :value="opt"
                        v-model="form.status_psikologi"
                      />
                      <label :for="opt">{{ opt }}</label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div
                      class="field-radiobutton"
                      v-for="opt in [
                        'Kecendrungan Bunuh Diri',
                        'Gelisah',
                        'Lain-lain',
                        'Tidak-masalah',
                      ]"
                      :key="opt"
                    >
                      <RadioButton
                        :inputId="opt"
                        name="status_psikologi"
                        :value="opt"
                        v-model="form.status_psikologi"
                      />
                      <label :for="opt">{{ opt }}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br />
            <div class="col-sm-6">
              <div class="form-group">
                <label for="resiko_jatuh">RESIKO JATUH</label><br />
                <div class="field-radiobutton" v-for="opt in ['YA', 'TIDAK']" :key="opt">
                  <RadioButton
                    :inputId="opt"
                    name="resiko_jatuh"
                    :value="opt"
                    v-model="form.resiko_jatuh"
                  />
                  <label :for="opt">{{ opt === 'YA' ? 'YA' : 'Tidak' }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div class="card card card-outline elevation-0">
        <div class="card-header">
          <strong>ALERGI</strong>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="card card-primary card-outline elevation-0">
                <div class="card-header">
                  <strong>Makanan &amp; Lingkungan</strong>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card card-primary card-outline elevation-0">
                <div class="card-header">
                  <strong>Obat</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-primary card-outline elevation-0">
        <div class="card-header">
          <strong>KEADAAN UMUM / TANDA VITAL</strong>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-12">
              <div class="row">
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="suhu">Suhu (C)</label><br />
                    <InputNumber
                      id="suhu"
                      :minFractionDigits="1"
                      v-model="form.suhu"
                      prefix="↑ "
                      suffix=" ℃"
                      :min="0"
                      :max="50"
                    />
                  </div>
                </div>
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="tensi">Tensi</label><br />
                    <!-- PrimeVue 4: InputGroup replaces p-inputgroup -->
                    <InputGroup>
                      <InputGroupAddon>SYS</InputGroupAddon>
                      <InputNumber
                        id="tensi_sistol"
                        :minFractionDigits="0"
                        v-model="form.tensi_sistol"
                        :min="0"
                        :max="300"
                      />
                      <InputGroupAddon>/</InputGroupAddon>
                      <InputNumber
                        id="tensi_distol"
                        :minFractionDigits="0"
                        v-model="form.tensi_distol"
                        :min="0"
                        :max="300"
                      />
                      <InputGroupAddon>mmHG</InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="nyeri">Skala Nyeri</label><br />
                    <InputNumber
                      v-model="form.nyeri"
                      @update:modelValue="changeSlider"
                      :min="0"
                      :max="10"
                    />
                  </div>
                </div>
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="nadipermenit">Nadi /menit</label><br />
                    <InputNumber
                      v-model="form.nadipermenit"
                      suffix=" x/Menit"
                      :min="0"
                      :max="300"
                    />
                  </div>
                </div>
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="saturasi">Saturasi O2(%)</label><br />
                    <InputNumber v-model="form.saturasi" suffix=" %" :min="0" :max="300" />
                  </div>
                </div>
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="respirasi">Respirasi/Menit</label><br />
                    <InputNumber v-model="form.respirasi" suffix=" /Menit" :min="0" :max="300" />
                  </div>
                </div>
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="tb">Tinggi Badan</label><br />
                    <InputNumber v-model="form.tb" suffix=" cm" :min="0" :max="300" />
                  </div>
                </div>
                <div class="col-sm-2">
                  <div class="form-group">
                    <label for="bb">Berat Badan</label><br />
                    <InputNumber v-model="form.bb" suffix=" Kg" :min="0" :max="300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScreeningGiziComponent
        ref="gizi_form"
        :dataset="datapasien"
        :noregister="form.noregister"
      ></ScreeningGiziComponent>

      <div class="card card-primary card-outline elevation-0">
        <div class="card-header">
          <strong>SKALA NYERI</strong>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-sm-1">
              Skor nyeri :
              <h3>{{ form.nyeri }}</h3>
            </div>
            <div class="col-sm-1">
              <img :src="prev_skala_nyeri_pic" height="70" width="70" />
            </div>
            <div class="col-sm-6">
              <br /><br />
              <!-- PrimeVue 4: Slider @change → @update:modelValue or @slideend -->
              <Slider v-model="form.nyeri" @update:modelValue="changeSlider" :max="10" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-3">
              <p>
                Skala 0-10:<br />
                0: Tidak ada nyeri<br />
                1-3: Nyeri ringan<br />
                4-6: Nyeri sedang<br />
                7-9: Nyeri berat<br />
                10: Nyeri sangat berat, tak tertahankan
              </p>
            </div>
            <div class="col-md-3">
              <label for="lokasi_nyeri">Lokasi Nyeri</label>
              <!-- PrimeVue 4: InputText stays the same -->
              <InputText id="lokasi_nyeri" v-model="form.lokasinyeri" />
            </div>
          </div>
        </div>
      </div>

      <screening-gizi-dewasa
        ref="gizi_form"
        :dataset="datapasien"
        :noregister="form.noregister"
      ></screening-gizi-dewasa>

      <div class="card card-primary card-outline elevation-0">
        <div class="card-header">
          <strong>KESADARAN</strong>
        </div>
        <div class="card-body">
          <div class="row">
            <div
              class="col-sm-2"
              v-for="opt in [
                'Composmetis',
                'Apatis',
                'Delerium',
                'Somnolen',
                'Sopor',
                'Semi koma',
                'Koma',
              ]"
              :key="opt"
            >
              <div class="field-radiobutton">
                <RadioButton
                  :inputId="opt"
                  name="kesadaran"
                  :value="opt"
                  v-model="form.kesadaran"
                />
                <label :for="opt">{{ opt }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-primary card-outline elevation-0">
        <div class="card-body">
          <table class="table table-bordered table-striped dataTable dtr-inline">
            <thead>
              <tr>
                <th>PEMERIKSAAN</th>
                <th style="background-color: red; color: white">EMERGENSI</th>
                <th style="background-color: yellow">URGENT</th>
                <th style="background-color: green; color: white">NON URGENT</th>
                <th style="background-color: black; color: white; width: 20%">DEATH ON ARRIVAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="data in fact" :key="data.grouping">
                <td>
                  <strong>{{ data.grouping }}</strong>
                </td>
                <td>
                  <span v-for="(det, k) in data.details" :key="k">
                    <div class="field-checkbox" v-if="det.sk_1 != ''">
                      <!-- PrimeVue 4: Checkbox uses v-model array binding same way, but inputId replaces id -->
                      <Checkbox
                        v-model="form.check_triase"
                        :value="det.val_1"
                        :binary="false"
                        :inputId="det.val_1"
                        class="mb-2"
                        @change="checkboxChanged()"
                      />
                      <label :for="det.val_1">{{ det.sk_1 }}</label>
                    </div>
                  </span>
                </td>
                <td>
                  <span v-for="(det, k) in data.details" :key="k">
                    <div class="field-checkbox" v-if="det.sk_2 != ''">
                      <Checkbox
                        v-model="form.check_triase"
                        :value="det.val_2"
                        :binary="false"
                        :inputId="det.val_2"
                        class="mb-2"
                      />
                      <label :for="det.val_2">{{ det.sk_2 }}</label>
                    </div>
                  </span>
                </td>
                <td>
                  <span v-for="(det, k) in data.details" :key="k">
                    <div class="field-checkbox" v-if="det.sk_4 != ''">
                      <Checkbox
                        v-model="form.check_triase"
                        :value="det.val_4"
                        :binary="false"
                        :inputId="det.val_4"
                        class="mb-2"
                      />
                      <label :for="det.val_4">{{ det.sk_4 }}</label>
                    </div>
                  </span>
                </td>
                <td>
                  <span v-for="(det, k) in data.details" :key="k">
                    <div class="field-checkbox" v-if="det.sk_5 != ''">
                      <Checkbox
                        v-model="form.check_triase"
                        :value="det.val_5"
                        :binary="false"
                        :inputId="det.val_5"
                        class="mb-2"
                      />
                      <label :for="det.val_5">{{ det.sk_5 }}</label>
                    </div>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card card-primary elevation-0">
        <div class="card-body">
          <soap-form
            :datapasien="datapasien"
            :noregister="form.noregister"
            :isCppt="true"
            :data_igd="form"
          ></soap-form>
        </div>
      </div>

      <div class="card card-primary card-outline elevation-0">
        <div class="card-header">
          <strong>SECONDARY SURVEY</strong>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <table class="table table-bordered table-striped dataTable dtr-inline">
                <thead>
                  <tr>
                    <th>OBJEK</th>
                    <th>NORMAL</th>
                    <th>JIKA TIDAK NORMAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="data in secondary_surver_list" :key="data.id">
                    <td>{{ data.organ }}</td>
                    <td style="width: 20px">
                      <div class="field-radiobutton">
                        <RadioButton
                          :inputId="'normal_' + data.id"
                          :name="'survey_' + data.id"
                          value="NORMAL"
                          v-model="data.kondisi"
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        v-model="data.kondisi"
                        class="form-control"
                        autocomplete="off"
                        type="text"
                        placeholder="Kondisi"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                <strong>{{ stts_verif }}</strong>
              </p>
            </div>
            <div class="col-md-6">
              <media-marking ref="childComponent" :dataset="datapasien"></media-marking>
            </div>
          </div>
        </div>
      </div>

      <div class="card card-primary elevation-0">
        <div class="card-body">
          <Button label="Otorisasi" @click="call_oto()" icon="" />
          <Button label="Simpan" @click="simpan()" icon="pi pi-save" />
        </div>
      </div>
    </div>

    <!-- PrimeVue 4: Dialog v-model:visible -->
    <Dialog
      header="Otorisasi"
      v-model:visible="showOtorisasi"
      :style="{ width: '40vw' }"
      class="container_modal"
      :modal="true"
    >
      <otorisasi-form
        @getvalue="handleValue"
        :mode="1"
        :noregister="datapasien.NOPENDAFTARAN"
      ></otorisasi-form>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          @click="showOtorisasi = false"
          class="p-button-text"
        />
        <Button label="Tutup" icon="pi pi-check" @click="showOtorisasi = false" autofocus />
      </template>
    </Dialog>
  </section>
</template>

<script setup>
// Vue 3 Composition API with <script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import DatePicker from 'primevue/datepicker'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, id_lokasi } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

// PrimeVue 4 imports — note renamed components
import Slider from 'primevue/slider'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select' // Renamed from Calendar in PrimeVue 4
import InputGroup from 'primevue/inputgroup' // New in PrimeVue 4
import InputGroupAddon from 'primevue/inputgroupaddon' // New in PrimeVue 4

import ScreeningGiziComponent from '@/components/GiziComp/ScreeningGiziComponent.vue'
import SoapComponent from '@/components/Soap/SoapComponent.vue'

// ── Props ──────────────────────────────────────────────────────────────────────
// Vue 3: defineProps replaces props option
const props = defineProps({
  datapasien: {
    type: Object,
    default: () => ({}),
  },
})

// ── Template Refs ──────────────────────────────────────────────────────────────
// Vue 3: ref() for template refs instead of this.$refs
const gizi_form = ref(null)
const childComponent = ref(null)

// ── Reactive State ─────────────────────────────────────────────────────────────
const isLoading = ref(false)
const displayConfirmation = ref(false)
const showOtorisasi = ref(false)
const message = ref('')
const stts_verif = ref('')
const responvalue = ref(0)
const nilai_triase = ref('')
const fact = ref([])
const caradatang = ref([])
const transportasi = ref([])
const prev_skala_nyeri_pic = ref('')

const secondary_surver_list = ref([
  { id: 1, organ: 'MATA', kondisi: 'NORMAL' },
  { id: 2, organ: 'LEHER', kondisi: 'NORMAL' },
  { id: 3, organ: 'DADA', kondisi: 'NORMAL' },
  { id: 4, organ: 'PERUT', kondisi: 'NORMAL' },
  { id: 5, organ: 'ALAT GERAK', kondisi: 'NORMAL' },
])

const prev_skala_nyeri = [
  { nomor: 0, link: 'https://ws-simrs.link/skala_nyeri/a.png' },
  { nomor: 1, link: 'https://ws-simrs.link/skala_nyeri/b.png' },
  { nomor: 2, link: 'https://ws-simrs.link/skala_nyeri/c.png' },
  { nomor: 3, link: 'https://ws-simrs.link/skala_nyeri/d.png' },
  { nomor: 4, link: 'https://ws-simrs.link/skala_nyeri/e.png' },
  { nomor: 5, link: 'https://ws-simrs.link/skala_nyeri/f.png' },
]

const dokter = reactive({
  nama: '',
  master: [],
  dokterSelected: '',
  mode: 0,
})

const form = reactive({
  check_triase: [],
  norm: '',
  noregister: '',
  waktu_masuk: '',
  diantar_oleh: '',
  transportasi: '',
  keluhan_utama: '',
  riwayat_penyakit_dahulu: '',
  suhu: 0,
  tensi_sistol: 0,
  tensi_distol: 0,
  nyeri_distol: 0,
  bb: 0,
  tb: 0,
  nadipermenit: 0,
  saturasi: 0,
  respirasi: 0,
  catatanpenting: '',
  resiko_jatuh: 'TIDAK',
  status_psikologi: 'Tidak-masalah',
  dpjpSelected: { NAMADOKTER: '', KDDOKTER: '' },
  kesadaran: 'Composmetis',
  rencana_tindak_lanjut: '',
  survey: [],
  data_gizi: '',
  lokasinyeri: '',
  nyeri: 0,
  dpjp: '',
  id_client: id_client.value,
})

// ── Lifecycle ──────────────────────────────────────────────────────────────────
// Vue 3: onMounted / no "created" — use setup() body or onMounted for initialization
onMounted(() => {
  form.waktu_masuk = new Date()
  form.dpjp = props.datapasien.NAMADOKTER

  if (props.datapasien.NOREFF_IGD === '') {
    form.noregister = props.datapasien.NOPENDAFTARAN
  } else {
    form.noregister = props.datapasien.NOREFF_IGD
  }

  changeSlider(0)
  getdatareferensi()
  fetchData()
})

// ── Methods ────────────────────────────────────────────────────────────────────

function changeSlider(value) {
  if (value === 0) {
    prev_skala_nyeri_pic.value = prev_skala_nyeri.find((x) => x.nomor === 0)?.link
  } else if (value >= 1 && value <= 3) {
    prev_skala_nyeri_pic.value = prev_skala_nyeri.find((x) => x.nomor === 1)?.link
  } else if (value >= 4 && value <= 6) {
    prev_skala_nyeri_pic.value = prev_skala_nyeri.find((x) => x.nomor === 2)?.link
  } else if (value >= 7 && value <= 9) {
    prev_skala_nyeri_pic.value = prev_skala_nyeri.find((x) => x.nomor === 3)?.link
  } else if (value > 9 && value <= 10) {
    prev_skala_nyeri_pic.value = prev_skala_nyeri.find((x) => x.nomor === 4)?.link
  }
  form.nyeri = value
}

function set_datetime_now() {
  form.waktu_masuk = new Date()
}

function openConfirmation() {
  displayConfirmation.value = true
}

function closeConfirmation() {
  displayConfirmation.value = false
}

function checkboxChanged() {
  // hook for checkbox change
}

function call_oto() {
  showOtorisasi.value = true
}

function handleValue(value) {
  responvalue.value = value
  if (responvalue.value === 200) {
    showOtorisasi.value = false
  }
}

// Vue 3: $toast replaced by useToast composable
function open(type, msg) {
  toast.add({
    severity: type === 'info' ? 'info' : type === 'warning' ? 'warn' : type,
    summary: msg,
    life: 5000,
  })
}

function validasi() {
  let IsValid = true

  if (form.rencana_tindak_lanjut?.STATUS === 7) {
    if (form.dpjpSelected.NAMADOKTER === '') {
      IsValid = false
      open('warning', 'Rujuk kerawat inap wajib pilih dokter')
    }
  }
  if (!form.diantar_oleh?.code) {
    IsValid = false
    open('warning', 'Gagal menyimpan, Cara Masuk pasien belum dipilih')
  }
  if (!form.transportasi?.id) {
    IsValid = false
    open('warning', 'Gagal menyimpan, Transportasi pasien belum dipilih')
  }
  if (form.nyeri > 0 && form.lokasinyeri === '') {
    IsValid = false
    open('warning', 'Lokasi nyeri wajib di isi')
  }

  return IsValid
}

function filled_load_header(data) {
  form.waktu_masuk = data.waktu
  form.diantar_oleh = { diantar_oleh: data.diantar_oleh, code: data.id_diantar_oleh }
  form.transportasi = { transportasi: data.transportasi, id: data.id_transportasi }
  form.rencana_tindak_lanjut = { STATUS: data.STATUS, KETERANGAN: data.KETERANGAN }
  form.dpjpSelected = { KDDOKTER: data.dokter_sp, NAMADOKTER: data.namadokter_sp }

  if (data.code === 200) {
    form.keluhan_utama = data.keluhan_utama
    form.suhu = data.suhu
    form.tensi_sistol = data.tensi_sistol
    form.tensi_distol = data.tensi_distol
    form.nadipermenit = data.nadipermenit
    form.saturasi = data.saturasi
    form.respirasi = data.respirasi
    form.bb = data.bb
    form.tb = data.tb
    form.riwayat_penyakit_dahulu = data.riwayat_penyakit_dahulu
    form.resiko_jatuh = data.resiko_jatuh
    form.status_psikologi = data.status_psikologi
    form.kesadaran = data.kesadaran
    stts_verif.value = `${data.telah_verif} ${data.jam_verif}`
    form.nyeri = data.nyeri
    form.lokasinyeri = data.lokasinyeri
    changeSlider(form.nyeri)
  }
}

function initdata() {
  try {
    for (const group of fact.value) {
      for (const det of group.details) {
        if (det.checked_val_1) form.check_triase.push(det.val_1)
        if (det.checked_val_2) form.check_triase.push(det.val_2)
        if (det.checked_val_3) form.check_triase.push(det.val_3)
        if (det.checked_val_4) form.check_triase.push(det.val_4)
        if (det.checked_val_5) form.check_triase.push(det.val_5)
      }
    }
  } catch (error) {
    console.error('An error occurred:', error.message)
  }
}

async function getdatareferensi() {
  isLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Triaseigd/getref_triase`, form)

    console.log('API Response for getdatareferensi:', response.data) // Debug log for API response
    caradatang.value = response.data.response.diantar
    transportasi.value = response.data.response.transport
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

async function fetchData() {
  isLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Triaseigd/getitem_triase`, form)
    console.log('API Response:', response.data) // Debug log for API response
    fact.value = response.data.response
    nilai_triase.value = response.data.nilatriase
    if (response.data.survey.length > 0) {
      secondary_surver_list.value = response.data.survey
    }
    filled_load_header(response.data.header)
    initdata()
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

async function input_header_triase() {
  isLoading.value = true
  form.survey = secondary_surver_list.value
  form.norm = props.datapasien.NOMR
  // Vue 3: access template ref via .value
  form.data_gizi = gizi_form.value?.get_value()
  try {
    await axios.post('/input_header_triase', form)
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

async function simpan() {
  if (!validasi()) return

  isLoading.value = true
  try {
    const response = await axios.post('/simpan_triase', form)
    if (response.data.metadata.code === 200) {
      open('info', response.data.metadata.message)
      message.value = response.data.metadata.message
      await input_header_triase()
    } else {
      open('warning', response.data.metadata.message)
      message.value = response.data.metadata.message
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}
</script>
