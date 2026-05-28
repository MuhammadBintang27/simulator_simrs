<template>
  <section class="content">
    <div class="container-fluid">
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <ProgressSpinner />
      </div>

      <ConfirmDialog />

      <!-- SOAP / SBAR Modal -->
      <Dialog
        header="Pengisian Soap"
        v-model:visible="showModal"
        :style="{ width: '70vw' }"
        :modal="true"
      >
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <strong>
                <p class="text-muted">
                  Pasien: {{ datapasien.NAMAPASIEN }} ({{ datapasien.JENISKELAMIN }}) - ({{
                    datapasien.USIA_PASIEN?.tahun
                  }}T -{{ datapasien.USIA_PASIEN?.bulan }}B- {{ datapasien.USIA_PASIEN?.hari }}H)
                </p>
              </strong>
            </h3>
          </div>
          <div class="card-body">
            <div class="field col-12 md:col-4">
              <table class="table" style="width: 70%">
                <thead>
                  <tr>
                    <td style="width: 5em"><strong>Tanggal</strong></td>
                    <td>
                      <DatePicker
                        v-model="form.tglsoap"
                        showTime
                        hourFormat="24"
                        placeholder="Select tanggal waktu"
                      />
                    </td>
                    <td>
                      <Button
                        class="p-button-sm p-button-success"
                        v-tooltip.top="'Tanggal dan Jam Sekarang'"
                        icon="pi pi-stopwatch"
                        @click="tanggal_skrg"
                      />
                      <Button
                        v-if="data_igd == null"
                        class="p-button-sm p-button-secondary"
                        v-tooltip.top="'Ambil data soap terakhir'"
                        icon="pi pi-copy"
                        @click="ambil_soap_terakhir"
                        label="Soap Terakhir"
                      />
                      <Button
                        v-if="data_igd != null"
                        class="p-button-sm p-button-success"
                        v-tooltip.top="'Ambil ttv terakhir'"
                        icon="pi pi-copy"
                        @click="auto_input_igd"
                        label="TTV"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 5em"><strong>Suhu</strong></td>
                    <td>
                      <InputNumber
                        v-model="form.suhu"
                        :minFractionDigits="1"
                        prefix="↑ "
                        suffix="℃"
                        :min="0"
                        :max="50"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 5em"><strong>Tensi</strong></td>
                    <td>
                      Sys:
                      <InputNumber v-model="form.sistole" suffix=" mmHg" :min="0" :max="300" />
                    </td>
                    <td>
                      Ds:
                      <InputNumber v-model="form.diastole" suffix=" mmHg" :min="0" :max="300" />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 5em"><strong>Nadi</strong></td>
                    <td>
                      <InputNumber v-model="form.nadi" suffix=" x/Menit" :min="0" :max="300" />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 5em"><strong>GCS</strong></td>
                    <td>
                      <InputNumber v-model="form.gcs" :min="0" :max="300" />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 5em"><strong>SPo2</strong></td>
                    <td>
                      <InputNumber v-model="form.spo2" suffix=" %" :min="0" :max="300" />
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 5em"><strong>Pernapasan</strong></td>
                    <td>
                      <InputNumber
                        v-model="form.pernafasan"
                        suffix=" x/Menit"
                        :min="0"
                        :max="300"
                      />
                    </td>
                  </tr>
                </thead>
              </table>
            </div>

            <hr />

            <div class="field col-12 md:col-6">
              <div class="row">
                <div class="col-md-3">
                  <h5>Apakah Pasien menggunakan alat bantu nafas?</h5>
                </div>
                <div class="col-md-4">
                  <Select
                    v-model="form.alatbantu_nafasSelected"
                    :options="alatbantu_nafas"
                    style="width: 7em"
                  />
                </div>
              </div>
            </div>

            <hr />

            <div class="field col-12 md:col-4">
              <h5>Subject</h5>
              <p class="text-muted">Keluhan pasien</p>
              <Textarea v-model="form.subject" :autoResize="true" rows="5" style="width: 80%" />
            </div>
            <div class="field col-12 md:col-4">
              <h5>Object</h5>
              <p class="text-muted">Pemeriksaan Fisik</p>
              <Textarea v-model="form.object" :autoResize="true" rows="5" style="width: 80%" />
            </div>
            <div class="field col-12 md:col-4">
              <h5>Asesment</h5>
              <p class="text-muted">Diagnosa</p>
              <Textarea v-model="form.asessment" :autoResize="true" rows="5" style="width: 80%" />
            </div>
            <div class="field col-12 md:col-4">
              <h5>Plan</h5>
              <p class="text-muted">Tindak lanjut</p>
              <Textarea v-model="form.plan" :autoResize="true" rows="5" style="width: 80%" />
            </div>
          </div>
        </div>

        <template #footer>
          <Button
            label="Batal"
            icon="pi pi-times"
            @click="displayModal_close"
            class="p-button-text"
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            @click="simpan_soap"
            autofocus
            :loading="isLoading"
          />
        </template>
      </Dialog>

      <!-- Confirmation Dialog -->
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

      <!-- Main Card -->
      <div class="card card-primary card-outline elevation-0">
        <div class="card-header">
          <h3 class="card-title"><strong></strong></h3>
        </div>
        <div class="card-body">
          <Button
            label="S O A P"
            icon="pi pi-external-link"
            class="p-button-info mb-1"
            @click="displayModal_open(false, 0, true)"
          />
          <Button
            label="S B A R"
            icon="pi pi-external-link"
            class="p-button-info mb-1"
            @click="displayModal_open(false, 0, false)"
          />
          <Button
            label="CETAK"
            icon="pi pi-print"
            class="p-button-warning mb-1"
            @click="cetakSoap"
          />

          <DataTable :value="fact" class="table table-bordered table-striped">
            <Column field="auth" header="AUTH">
              <template #body="{ data: input }">
                <span v-if="input.hasbeen_auth == 1">
                  <Button icon="pi pi-verified" class="p-button-rounded p-button-success" />
                </span>
                <span v-if="input.hasbeen_auth == 0">
                  <Button
                    icon="pi pi-lock-open"
                    class="p-button-rounded p-button-warning"
                    @click="call_oto(input.id, 2)"
                  />
                </span>
                <span v-if="input.jenis_dok == 'SBAR'">
                  <b>{{ input.jenis_dok }}</b>
                </span>
              </template>
            </Column>

            <Column header="No.">
              <template #body="{ index }">
                {{ index + 1 }}
              </template>
            </Column>

            <Column field="waktu_display" header="WAKTU">
              <template #body="{ data: input }">
                <h6>{{ input.waktu_display }}</h6>
              </template>
            </Column>

            <Column header="SOAP">
              <template #body="{ data: input }">
                <strong>{{ input.caption1 }}:</strong>
                <h6><span v-html="convert_chart(input.subject)"></span></h6>
                <strong>{{ input.caption2 }}:</strong>
                <h6><span v-html="convert_chart(input.object_display)"></span></h6>
                <h6>
                  <span>{{ input.object }}</span>
                </h6>
                <strong>{{ input.caption3 }}:</strong>
                <h6><span v-html="convert_chart(input.asessment)"></span></h6>
                <strong v-if="input.jenis_dok == 'CPPT'">{{ input.caption4 }}:</strong>
                <h6><span v-html="convert_chart(input.plan)"></span></h6>
              </template>
            </Column>

            <Column header="INSTRUKSI/VARIF">
              <template #body="{ data: input }">
                <span v-if="input.jenis_dok == 'SBAR'">
                  <strong>{{ input.caption4 }}:</strong>
                  <h6><span v-html="convert_chart(input.plan)"></span></h6>
                  <span v-if="input.verif == 0">
                    <Button
                      label="Verif DPJP"
                      icon="pi pi-plus"
                      @click="call_oto(input.id, 21)"
                      class="p-button-rounded p-button-text"
                    />
                  </span>
                  <span v-else>
                    <!-- <qrcode-vue :value="input.verif_by_name" :size="size" level="H" /> -->
                    <p>
                      ({{ input.profesi_verif }}) <br />
                      {{ input.verif_by_name }}
                    </p>
                  </span>
                </span>
              </template>
            </Column>

            <Column header="PPA">
              <template #body="{ data: input }">
                <h6>
                  ({{ input.profesi }}) <br />
                  {{ input.verif_user_display }}
                </h6>
              </template>
            </Column>

            <Column header="AUTH">
              <template #body="{ data: input }">
                <span v-if="input.hasbeen_auth == 1">
                  <qrcode-vue :value="input.id" :size="size" level="H" />
                </span>
              </template>
            </Column>

            <Column header="AKSI">
              <template #body="{ data: input }">
                <Button
                  icon="pi pi-pencil"
                  @click="displayModal_open(true, input.id)"
                  class="p-button-rounded p-button-text"
                />
                <br />
                <Button
                  icon="pi pi-delete-left"
                  @click="confirm1(input.id, input.waktu)"
                  class="p-button-rounded p-button-primary"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <!-- Instruksi Dialog -->
      <Dialog
        header="Pengisian Intruksi"
        v-model:visible="showIntruksi"
        :style="{ width: '70vw' }"
        :modal="true"
      >
        <div class="card">
          <div class="card-header"></div>
          <div class="card-body">
            <div class="field col-12 md:col-4">
              <h5>Intruksi</h5>
              <p class="text-muted">Intruksi DPJP</p>
              <Textarea :autoResize="true" rows="5" style="width: 80%" />
            </div>
          </div>
        </div>
        <template #footer>
          <Button label="Simpan" icon="pi pi-check" @click="showIntruksi = false" autofocus />
          <Button
            label="Batal"
            icon="pi pi-times"
            @click="showIntruksi = false"
            class="p-button-text"
          />
        </template>
      </Dialog>

      <!-- Otorisasi Dialog -->
      <Dialog
        header="Otorisasi"
        v-model:visible="showOtorisasi"
        :style="{ width: '40vw' }"
        class="container_modal"
        :modal="true"
      >
        <otorisasi-form @getvalue="handleValue" :mode="mode_otto" :noregister="soapId" />
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
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

// PrimeVue 4 components are auto-imported or imported as needed:
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select' // Renamed from Dropdown in PrimeVue 4
import DatePicker from 'primevue/datepicker' // Renamed from Calendar in PrimeVue 4
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import ProgressSpinner from 'primevue/progressspinner'
// import QrcodeVue from 'qrcode.vue'

// Props
const props = defineProps({
  isInput: Boolean,
  noregister: [String, Number],
  datapasien: Object,
  isCppt: Boolean,
  data_igd: Object,
})

// Composables
const confirm = useConfirm()
const toast = useToast()

// State
const fact = ref([])
const showModal = ref(false)
const showOtorisasi = ref(false)
const responvalue = ref(0)
const showIntruksi = ref(false)
const soapId = ref(0)
const mode_otto = ref(2)
const isLoading = ref(false)
const displayConfirmation = ref(false)
const message = ref('')
const is_update = ref(false)
const id_soap = ref(0)
const size = ref(40)
const alatbantu_nafas = ['Ya', 'Tidak']

const form = reactive({
  startdate: '',
  tglsoap: '',
  subject: '',
  object: '',
  object_display: '',
  asessment: '',
  plan: '',
  mode: '',
  noregister: '',
  id: '',
  verif_user_display: '',
  suhu: 0.0,
  sistole: 0,
  diastole: 0,
  nadi: 0,
  gcs: 0,
  spo2: 0,
  pernafasan: 0,
  jenis_dok: '',
  alatbantu_nafasSelected: 'Tidak',
})

// Lifecycle
onMounted(() => {
  const currentDate = new Date()
  form.startdate = currentDate
  form.tglsoap = currentDate
  auto_input_igd()
  get_soap(1, '')
})

// Methods
function cetakSoap() {
  window.open('/print-soap/' + form.noregister, '_blank')
}

function auto_input_igd() {
  if (props.data_igd !== null && props.data_igd !== undefined) {
    form.sistole = props.data_igd.tensi_sistol
    form.diastole = props.data_igd.tensi_distol
    form.suhu = props.data_igd.suhu
    form.nadi = props.data_igd.nadipermenit
    form.pernafasan = props.data_igd.respirasi
    form.spo2 = props.data_igd.saturasi
  }
}

function convert_chart(data) {
  if (data == null) return ''
  return data.replace(/\n/g, '<br>')
}

function open(type, msg) {
  toast.add({
    severity: type,
    summary: type === 'success' ? 'Berhasil' : 'Peringatan',
    detail: msg,
    life: 2500,
  })
}

function call_oto(soapid, modeOtto) {
  soapId.value = soapid
  mode_otto.value = modeOtto
  showOtorisasi.value = true
}

function handleValue(value) {
  responvalue.value = value
  if (responvalue.value === 200) {
    showOtorisasi.value = false
    get_soap(1)
  }
}

function call_intruksi() {
  showIntruksi.value = true
}

function tanggal_skrg() {
  form.tglsoap = new Date()
}

function ambil_soap_terakhir() {
  if (!fact.value || !Array.isArray(fact.value) || fact.value.length === 0) {
    open('warn', 'Data soap belum ada')
  } else {
    const maxId = Math.max(...fact.value.map((item) => parseInt(item.id)))
    get_soap(2, maxId)
  }
}

async function simpan_soap() {
  form.mode = is_update.value ? 2 : 1
  form.lokasi = 'IGD'
  form.id = id_soap.value
  form.noregister = props.noregister
  isLoading.value = true
  try {
    const response = await axios.post('/simpan_soap', form)
    message.value = response.data.metadata.message
    get_soap(1)
    showModal.value = false
    if (response.data.metadata.code === '200') {
      open('success', message.value)
    } else {
      open('warn', message.value)
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

function clearfield() {
  form.subject = ''
  form.object = ''
  form.asessment = ''
  form.plan = ''
  form.suhu = 0
  form.sistole = 0
  form.diastole = 0
  form.nadi = 0
  form.gcs = 0
  form.spo2 = 0
  form.respirasi = 0
  form.pernafasan = 0
}

async function get_soap(mode, id) {
  isLoading.value = true
  form.mode = mode
  form.noregister = props.noregister
  form.lokasi = 'IGD'
  form.id = id
  try {
    const response = await axios.post('/get_soap', form)
    if (mode === 1) {
      fact.value = response.data.response
    }
    if (mode === 2) {
      const r = response.data.response[0]
      form.subject = r.subject
      form.object = r.object
      form.object_display = r.object_display
      form.asessment = r.asessment
      form.plan = r.plan
      form.suhu = r.suhu
      form.sistole = r.sistole
      form.diastole = r.diastole
      form.nadi = r.nadi
      form.gcs = r.gcs
      form.spo2 = r.spo2
      form.respirasi = r.respirasi
      form.pernafasan = r.pernafasan
      form.verif_user_display = r.verif_user_display
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

async function deleted_soap(id) {
  isLoading.value = true
  form.mode = '1'
  form.noregister = props.noregister
  form.id = id
  try {
    const response = await axios.post('/hapus_soap', form)
    message.value = response.data.metadata.message
    open('success', message.value)
    if (response.data.metadata.code === 200) {
      get_soap(1)
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

function confirm1(id, tanggal) {
  confirm.require({
    message: 'Anda ingin menghapus soap dengan tanggal ' + tanggal + ' ?',
    header: 'Hapus konfirmasi',
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleted_soap(id)
    },
    reject: () => {
      console.log('batal')
    },
  })
}

function displayModal_open(isUpdate, id, adalahCPPT) {
  showModal.value = true
  if (isUpdate === true) {
    is_update.value = true
    id_soap.value = id
    get_soap(2, id)
  } else {
    form.subject = ''
    form.object = ''
    form.asessment = ''
    form.plan = ''
    form.jenis_dok = adalahCPPT ? 'CPPT' : 'SBAR'
    clearfield()
    is_update.value = false
    get_soap(1, id)
  }
}

function displayModal_close() {
  showModal.value = false
}

function openConfirmation() {
  displayConfirmation.value = true
}

function closeConfirmation() {
  displayConfirmation.value = false
  showModal.value = false
}
</script>
