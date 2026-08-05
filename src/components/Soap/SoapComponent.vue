<template>
  <section class="content">
    <div class="container-fluid">
      <ConfirmDialog :group="confirmGroup" />

      <!-- ===== ACTION BAR ===== -->
      <div class="soap-action-bar mb-2">
        <div class="soap-bar-left">
          <span class="soap-bar-info">
            <i class="pi pi-file-edit mr-1"></i>
            {{ fact.length }} Catatan SOAP/SBAR
          </span>
        </div>
        <div class="soap-bar-right">
          <Button
            label="+ SOAP / CPPT"
            icon="pi pi-plus"
            size="small"
            severity="info"
            class="round-button2"
            @click="displayModal_open(false, 0, true)"
          />
          <Button
            label="+ SBAR"
            icon="pi pi-plus"
            size="small"
            class="round-button2"
            outlined
            @click="displayModal_open(false, 0, false)"
          />
          <Button
            label="Cetak"
            icon="pi pi-print"
            size="small"
            severity="secondary"
            class="round-button2"
            outlined
            @click="cetakSoap"
          />
        </div>
      </div>

      <!-- ===== DATA TABLE ===== -->
      <DataTable
        :value="fact"
        stripedRows
        showGridlines
        class="p-datatable-sm soap-datatable"
        scrollable
        scrollHeight="420px"
        :rowClass="(row) => (row.id == deletingId ? 'row-deleting' : '')"
      >
        <!-- AUTH -->
        <Column header="AUTH" style="width: 70px; text-align: center">
          <template #body="{ data }">
            <span v-if="data.hasbeen_auth == 1">
              <i class="pi pi-verified text-success" style="font-size: 1.1rem" />
            </span>
            <span v-else>
              <Button
                icon="pi pi-lock-open"
                rounded
                severity="warning"
                size="small"
                @click="call_oto(data.id, 2)"
              />
            </span>
            <div v-if="data.jenis_dok === 'SBAR'" class="mt-1">
              <span class="badge-sbar">SBAR</span>
            </div>
          </template>
        </Column>

        <!-- No -->
        <Column header="No." style="width: 45px; text-align: center">
          <template #body="{ index }">{{ index + 1 }}</template>
        </Column>

        <!-- Waktu -->
        <Column header="Waktu" style="min-width: 110px">
          <template #body="{ data }">
            <strong>{{ data.waktu_display }}</strong>
          </template>
        </Column>

        <!-- SOAP -->
        <Column header="SOAP / SBAR" style="min-width: 280px">
          <template #body="{ data }">
            <!-- TTV Chips -->
            <div v-if="hasTTV(data)" class="ttv-row mb-1">
              <span v-if="+data.suhu" class="ttv-chip" :class="chipLevel('suhu', data.suhu)">
                🌡 {{ data.suhu }}°C
              </span>
              <span
                v-if="+data.sistole"
                class="ttv-chip"
                :class="chipLevelBP(data.sistole, data.diastole)"
                >BP {{ data.sistole }}/{{ data.diastole }}</span
              >
              <span v-if="+data.nadi" class="ttv-chip" :class="chipLevel('nadi', data.nadi)">
                ♥ {{ data.nadi }}x/m
              </span>
              <span v-if="+data.spo2" class="ttv-chip" :class="chipLevel('spo2', data.spo2)">
                SpO₂ {{ data.spo2 }}%
              </span>
              <span
                v-if="+data.pernafasan || +data.respirasi"
                class="ttv-chip"
                :class="chipLevel('rr', data.pernafasan || data.respirasi)"
              >
                RR {{ data.pernafasan || data.respirasi }}x/m
              </span>
              <span v-if="+data.gcs" class="ttv-chip" :class="chipLevel('gcs', data.gcs)">
                GCS {{ data.gcs }}
              </span>
            </div>
            <div>
              <strong>{{ data.caption1 }}:</strong>
              <span v-html="nl2br(data.subject)" class="soap-text" />
            </div>
            <div>
              <strong>{{ data.caption2 }}:</strong>
              <span v-html="nl2br(data.object_display || data.object)" class="soap-text" />
            </div>
            <div>
              <strong>{{ data.caption3 }}:</strong>
              <span v-html="nl2br(data.asessment)" class="soap-text" />
            </div>
            <div v-if="data.jenis_dok !== 'SBAR'">
              <strong>{{ data.caption4 }}:</strong>
              <span v-html="nl2br(data.plan)" class="soap-text" />
            </div>
          </template>
        </Column>

        <!-- Instruksi / Verif -->
        <Column header="Instruksi / Verif" style="min-width: 160px">
          <template #body="{ data }">
            <div v-if="data.jenis_dok === 'SBAR'">
              <strong>{{ data.caption4 }}:</strong>
              <span v-html="nl2br(data.plan)" class="soap-text" />
              <div v-if="data.verif == 0" class="mt-1">
                <Button
                  label="Verif DPJP"
                  icon="pi pi-plus"
                  size="small"
                  text
                  @click="call_oto(data.id, 21)"
                />
              </div>
              <div v-else class="verif-info">
                <i class="pi pi-verified text-success mr-1" />
                <small>({{ data.profesi_verif }}) {{ data.verif_by_name }}</small>
              </div>
            </div>
          </template>
        </Column>

        <!-- PPA -->
        <Column header="PPA" style="min-width: 120px">
          <template #body="{ data }">
            <small>({{ data.profesi }})<br />{{ data.verif_user_display }}</small>
          </template>
        </Column>

        <!-- QR -->
        <Column header="QR" style="width: 60px; text-align: center">
          <template #body="{ data }">
            <span v-if="data.hasbeen_auth == 1">
              <qrcode-vue :value="String(data.id)" :size="size" level="H" />
            </span>
          </template>
        </Column>

        <!-- Aksi -->
        <Column header="Aksi" style="width: 80px; text-align: center">
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              rounded
              text
              size="small"
              @click="displayModal_open(true, data.id)"
            />
            <Button
              icon="pi pi-trash"
              rounded
              text
              size="small"
              severity="danger"
              @click="confirm1(data.id, data.waktu_display)"
            />
          </template>
        </Column>
      </DataTable>

      <!-- ===== SOAP / SBAR DIALOG ===== -->
      <Dialog
        :header="isUpdate ? 'Edit ' + form.jenis_dok : 'Pengisian ' + form.jenis_dok"
        v-model:visible="showModal"
        :style="{ width: '750px' }"
        :breakpoints="{ '768px': '95vw', '480px': '100vw' }"
        :modal="true"
        :draggable="false"
      >
        <div class="form-soap">
          <p class="patient-info-line">
            <i class="pi pi-user mr-1"></i>
            <strong>{{ datapasien?.NAMAPASIEN }}</strong>
            ({{ datapasien?.JENISKELAMIN }}) &mdash; {{ datapasien?.USIA_PASIEN?.tahun }}T
            {{ datapasien?.USIA_PASIEN?.bulan }}B {{ datapasien?.USIA_PASIEN?.hari }}H
          </p>

          <!-- Tanggal & TTV -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-heartbeat mr-1"></i> Tanggal &amp; Tanda Vital
            </h6>

            <div class="tgl-row mb-2">
              <label class="form-lbl">Tanggal / Jam</label>
              <div class="tgl-inputs">
                <input
                  type="datetime-local"
                  class="native-datetime"
                  :value="tglsoapInput"
                  @change="onTglChange"
                />
                <Button
                  icon="pi pi-clock"
                  label="Sekarang"
                  size="small"
                  severity="success"
                  outlined
                  @click="setNow"
                />
                <Button
                  v-if="!isUpdate"
                  icon="pi pi-copy"
                  label="SOAP Terakhir"
                  size="small"
                  severity="secondary"
                  outlined
                  :disabled="!fact.length"
                  @click="ambilSoapTerakhir"
                />
              </div>
            </div>

            <div class="ttv-grid">
              <div class="ttv-item">
                <label class="form-lbl">Suhu</label>
                <InputNumber
                  v-model="form.suhu"
                  :minFractionDigits="1"
                  suffix=" °C"
                  :min="0"
                  :max="50"
                  class="w-100"
                />
              </div>
              <div class="ttv-item">
                <label class="form-lbl">Sistole</label>
                <InputNumber
                  v-model="form.sistole"
                  suffix=" mmHg"
                  :min="0"
                  :max="300"
                  class="w-100"
                />
              </div>
              <div class="ttv-item">
                <label class="form-lbl">Diastole</label>
                <InputNumber
                  v-model="form.diastole"
                  suffix=" mmHg"
                  :min="0"
                  :max="300"
                  class="w-100"
                />
              </div>
              <div class="ttv-item">
                <label class="form-lbl">Nadi</label>
                <InputNumber
                  v-model="form.nadi"
                  suffix=" x/mnt"
                  :min="0"
                  :max="300"
                  class="w-100"
                />
              </div>
              <div class="ttv-item">
                <label class="form-lbl">Pernapasan</label>
                <InputNumber
                  v-model="form.pernafasan"
                  suffix=" x/mnt"
                  :min="0"
                  :max="100"
                  class="w-100"
                />
              </div>
              <div class="ttv-item">
                <label class="form-lbl">SPO₂</label>
                <InputNumber v-model="form.spo2" suffix=" %" :min="0" :max="100" class="w-100" />
              </div>
              <div class="ttv-item">
                <label class="form-lbl">GCS</label>
                <InputNumber v-model="form.gcs" :min="0" :max="15" class="w-100" />
              </div>
              <div class="ttv-item">
                <label class="form-lbl">Alat Bantu Nafas</label>
                <Select
                  v-model="form.alatbantu_nafasSelected"
                  :options="alatbantu_nafas"
                  class="w-100"
                />
              </div>
            </div>
          </div>

          <Divider />

          <!-- SOAP / SBAR Fields -->
          <div class="form-section">
            <h6 class="section-title">
              <i class="fas fa-notes-medical mr-1"></i>
              {{ form.jenis_dok === 'SBAR' ? 'S · B · A · R' : 'S · O · A · P' }}
            </h6>

            <div class="mb-3">
              <label class="form-lbl">
                {{ form.jenis_dok === 'SBAR' ? 'S — Situation' : 'S — Subjektif' }}
                <small class="text-muted ml-1">
                  {{ form.jenis_dok === 'SBAR' ? '(Kondisi saat ini)' : '(Keluhan pasien)' }}
                </small>
              </label>
              <Textarea v-model="form.subject" :autoResize="true" rows="3" class="w-100" />
            </div>

            <div class="mb-3">
              <label class="form-lbl">
                {{ form.jenis_dok === 'SBAR' ? 'B — Background' : 'O — Objektif' }}
                <small class="text-muted ml-1">
                  {{
                    form.jenis_dok === 'SBAR' ? '(Riwayat / latar belakang)' : '(Pemeriksaan fisik)'
                  }}
                </small>
              </label>
              <Textarea v-model="form.object" :autoResize="true" rows="3" class="w-100" />
            </div>

            <div class="mb-3">
              <label class="form-lbl">
                {{ form.jenis_dok === 'SBAR' ? 'A — Assessment' : 'A — Asesment' }}
                <small class="text-muted ml-1">(Diagnosa / penilaian)</small>
              </label>
              <Textarea v-model="form.asessment" :autoResize="true" rows="3" class="w-100" />
            </div>

            <div class="mb-3">
              <label class="form-lbl">
                {{ form.jenis_dok === 'SBAR' ? 'R — Recommendation' : 'P — Plan' }}
                <small class="text-muted ml-1">
                  {{ form.jenis_dok === 'SBAR' ? '(Rekomendasi / instruksi)' : '(Tindak lanjut)' }}
                </small>
                <a
                  v-if="form.jenis_dok !== 'SBAR'"
                  href="#"
                  class="ml-2"
                  style="font-size: 0.72rem"
                  @click.prevent="panggil_terapy_terakhir()"
                  >Terapi Terakhir</a
                >
              </label>
              <Textarea v-model="form.plan" :autoResize="true" rows="4" class="w-100" />
            </div>
          </div>
        </div>

        <template #footer>
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            text
            @click="displayModal_close"
          />
          <Button
            :label="isUpdate ? 'Update' : 'Simpan'"
            icon="pi pi-check"
            @click="simpan"
            autofocus
            :loading="saving"
          />
        </template>
      </Dialog>

      <!-- Otorisasi -->
      <ttdUser
        v-model:showFormOtorisasi="showOtorisasi"
        :noregister="soapId"
        :mode="mode_otto"
        @otpVerified="handleOtpVerified"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Divider from 'primevue/divider'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  isInput: Boolean,
  noregister: [String, Number],
  datapasien: Object,
  isCppt: Boolean,
  data_igd: Object,
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const confirm = useConfirm()
const toast = useToast()

const fact = ref([])
const showModal = ref(false)
const showOtorisasi = ref(false)
const soapId = ref(0)
const mode_otto = ref(2)
const isLoading = ref(false)
const saving = ref(false)
const isUpdate = ref(false)
const id_soap = ref(0)
const size = ref(40)
const deletingId = ref(null)
const alatbantu_nafas = ['Ya', 'Tidak']
const confirmGroup = ref('soap-' + Math.random().toString(36).substr(2, 9))

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
  tb: 0,
  bb: 0,
})

// ── TTV Normal ranges ──────────────────────────────────────────────────────────
const NORMAL = {
  suhu: { min: 36.0, max: 37.5, critMin: 35.0, critMax: 39.0 },
  sistole: { min: 90, max: 140, critMin: 80, critMax: 180 },
  diastole: { min: 60, max: 90, critMin: 50, critMax: 120 },
  nadi: { min: 60, max: 100, critMin: 40, critMax: 130 },
  spo2: { min: 95, max: 100, critMin: 90 },
  rr: { min: 12, max: 20, critMin: 8, critMax: 30 },
  gcs: { min: 14, max: 15, critMin: 8 },
}

const hasTTV = (item) =>
  [item.suhu, item.sistole, item.nadi, item.spo2, item.pernafasan, item.respirasi, item.gcs].some(
    (v) => Number(v) > 0,
  )

const chipLevel = (key, val) => {
  const v = Number(val)
  if (!v) return ''
  const n = NORMAL[key]
  if (!n) return ''
  if ((n.critMin && v < n.critMin) || (n.critMax && v > n.critMax)) return 'chip-danger'
  if (v < n.min || (n.max && v > n.max)) return 'chip-warn'
  return ''
}

const chipLevelBP = (sys, dia) => {
  const s = Number(sys),
    d = Number(dia)
  if (!s && !d) return ''
  if (s > 180 || d > 120 || s < 80 || d < 50) return 'chip-danger'
  if (s > 140 || d > 90 || s < 90 || d < 60) return 'chip-warn'
  return ''
}

const nl2br = (text) => (text ? String(text).replace(/\n/g, '<br>') : '')

// Computed: format tglsoap as datetime-local string for native input
const tglsoapInput = computed(() => {
  const d = form.tglsoap instanceof Date ? form.tglsoap : new Date(form.tglsoap)
  if (isNaN(d.getTime())) return ''
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`
})

onMounted(() => {
  const currentDate = new Date()
  form.startdate = currentDate
  form.tglsoap = currentDate
  auto_input_igd()
  get_soap(1, '')
})

function cetakSoap() {
  window.open('/print-soap/' + form.noregister, '_blank')
}

function tingkat_kesadaran(teks) {
  if (!teks) return 0
  const t = teks.toLowerCase().replace(/\s/g, '')
  if (t.includes('composmentis') || t.includes('composmetis')) return 15
  if (t.includes('apatis')) return 13
  if (t.includes('delirium')) return 10
  if (t.includes('somnolen')) return 7
  if (t.includes('stupor')) return 5
  if (t.includes('koma')) return 4
  return 0
}

function auto_input_igd() {
  if (props.data_igd !== null && props.data_igd !== undefined) {
    form.sistole = props.data_igd.tensi_sistol
    form.diastole = props.data_igd.tensi_distol
    form.suhu = props.data_igd.suhu
    form.nadi = props.data_igd.nadipermenit
    form.pernafasan = props.data_igd.respirasi
    form.spo2 = props.data_igd.saturasi
    form.gcs = tingkat_kesadaran(props.data_igd.kesadaran)
  }
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

function handleOtpVerified() {
  showOtorisasi.value = false
  get_soap(1)
}

function setNow() {
  form.tglsoap = new Date()
}

function onTglChange(e) {
  form.tglsoap = e.target.value ? new Date(e.target.value) : new Date()
}

function ambilSoapTerakhir() {
  if (!fact.value || !Array.isArray(fact.value) || fact.value.length === 0) {
    open('warn', 'Data soap belum ada')
  } else {
    const maxId = Math.max(...fact.value.map((item) => parseInt(item.id)))
    get_soap(2, maxId)
  }
}

function simpan() {
  simpan_soap()
}

async function simpan_soap() {
  form.mode = isUpdate.value ? 2 : 1
  form.lokasi = 'IGD'
  form.id = id_soap.value
  form.noregister = props.noregister
  saving.value = true
  try {
    const tgl = form.tglsoap instanceof Date ? form.tglsoap : new Date(form.tglsoap)
    const pad = (n) => String(n).padStart(2, '0')
    const tglFormatted = `${tgl.getFullYear()}-${pad(tgl.getMonth() + 1)}-${pad(tgl.getDate())} ${pad(tgl.getHours())}:${pad(tgl.getMinutes())}:${pad(tgl.getSeconds())}`
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/inputsoap`,
      {
        ...form,
        tglsoap: tglFormatted,
        user_id: configStore.user_id || localStorage.getItem('user_id') || '',
        id_client: id_client.value,
      },
    )
    get_soap(1)
    showModal.value = false
    if (response.data.metadata.code == 200) {
      open('success', response.data.metadata.message)
    } else {
      open('warn', response.data.metadata.message)
    }
  } catch (error) {
    console.log(error)
  } finally {
    saving.value = false
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
  try {
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/get_soap`,
      {
        mode,
        noregister: props.noregister,
        id: id ?? '',
        lokasi: 'IGD',
        id_client: id_client.value,
      },
    )
    if (mode === 1) {
      fact.value = response.data.response
    }
    if (mode === 2) {
      const r = response.data.response[0]
      form.tglsoap = new Date(r.waktu)
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
  deletingId.value = id
  try {
    const response = await axios.post('/hapus_soap', {
      mode: 1,
      noregister: props.noregister,
      id,
    })
    if (response.data.metadata.code === 200) {
      await new Promise((r) => setTimeout(r, 400))
      fact.value = fact.value.filter((x) => x.id != id)
      open('success', response.data.metadata.message)
    } else {
      open('warn', response.data.metadata.message)
    }
  } catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
    deletingId.value = null
  }
}

function confirm1(id, tanggal) {
  confirm.require({
    group: confirmGroup.value,
    message: 'Hapus catatan SOAP tanggal ' + tanggal + '?',
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-secondary p-button-text',
    accept: () => deleted_soap(id),
  })
}

function displayModal_open(isUpdateMode, id, adalahCPPT) {
  showModal.value = true
  if (isUpdateMode === true) {
    isUpdate.value = true
    id_soap.value = id
    get_soap(2, id)
  } else {
    form.jenis_dok = adalahCPPT ? 'CPPT' : 'SBAR'
    clearfield()
    isUpdate.value = false
    get_soap(1, id)
  }
}

async function panggil_terapy_terakhir() {
  isLoading.value = true
  try {
    const response = await axios.post('/getdetils_sales', {
      NOPENDAFTARAN: props.noregister,
      RECEIPT_NO: '',
      MODE: 'LAST_TERAPHY',
    })
    const data = response.data
    if (data.metadata && data.metadata.code == '200' && data.response?.length > 0) {
      const lines = data.response.map((item) => {
        const nama = item.NAMABARANG_REQ || ''
        const remark = item.REMARK_ITEM && item.REMARK_ITEM !== '-' ? ' - ' + item.REMARK_ITEM : ''
        return nama + remark
      })
      form.plan = lines.join('\n')
    } else {
      open('warn', 'Data terapi terakhir tidak ditemukan')
    }
  } catch (error) {
    console.log(error)
    open('warn', 'Gagal mengambil data terapi terakhir')
  } finally {
    isLoading.value = false
  }
}

function displayModal_close() {
  showModal.value = false
}
</script>

<style scoped>
/* ===== ACTION BAR ===== */
.soap-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 0;
}
.soap-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.soap-bar-info {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}
.soap-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.round-button2 {
  font-size: 0.75rem !important;
  padding: 0.3rem 0.75rem !important;
  border-radius: 20px !important;
}

/* ===== DATATABLE ===== */
:deep(.soap-datatable .p-datatable-thead > tr > th) {
  background: #e6edf7;
  color: #162d4e;
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.4rem 0.6rem;
}
:deep(.soap-datatable .p-datatable-tbody > tr > td) {
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  vertical-align: top;
}

/* TTV chips */
.ttv-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.ttv-chip {
  background: #dde8f4;
  color: #1a3a5f;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
}
.ttv-chip.chip-warn {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}
.ttv-chip.chip-danger {
  background: #fde8e8;
  color: #b91c1c;
  border-color: #f87171;
}

.soap-text {
  font-size: 0.8rem;
  color: #333;
  display: block;
  margin-left: 4px;
  margin-bottom: 2px;
}

.badge-sbar {
  background: #6c757d;
  color: #fff;
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.verif-info {
  font-size: 0.6875rem;
  color: #2a6a40;
  margin-top: 4px;
}

/* ===== FORM DIALOG ===== */
.form-soap {
  padding: 4px 0;
}

.patient-info-line {
  font-size: 0.78rem;
  color: #475569;
  margin-bottom: 0.75rem;
  padding: 6px 10px;
  background: #f1f5f9;
  border-radius: 6px;
}

.form-section {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a3a5f;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #dde8f4;
}

.form-lbl {
  font-size: 0.75rem;
  font-weight: 600;
  color: #3a5070;
  display: block;
  margin-bottom: 4px;
}

.tgl-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tgl-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tgl-inputs .native-datetime {
  flex: 1;
  min-width: 180px;
}

.native-datetime {
  height: 36px;
  padding: 4px 10px;
  font-size: 0.8125rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #1e293b;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.native-datetime:focus {
  border-color: #4f8f7a;
  box-shadow: 0 0 0 2px rgba(79, 143, 122, 0.18);
}

.ttv-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 14px;
}
.ttv-item {
  display: flex;
  flex-direction: column;
}

@media (max-width: 600px) {
  .ttv-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .tgl-inputs {
    flex-direction: column;
    align-items: stretch;
  }
}

/* ===== DELETE ANIMATION ===== */
:deep(.row-deleting) {
  animation: rowFadeOut 0.4s ease forwards;
  pointer-events: none;
}
@keyframes rowFadeOut {
  0% {
    opacity: 1;
    transform: translateX(0);
    background: #fde8e8;
  }
  60% {
    opacity: 0.4;
    transform: translateX(14px);
    background: #fca5a5;
  }
  100% {
    opacity: 0;
    transform: translateX(28px);
  }
}
</style>
