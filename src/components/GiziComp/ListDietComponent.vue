<template>
  <!-- <loading_overlay :is-loading="loading" message="Memuat data...." /> -->
  <Dialog
    v-model:visible="showHistoryTeraphy"
    modal
    header="Pilih diet"
    :style="{ width: '1300px' }"
    class="patient-detail-dialog"
  >
    <div class="row">
      <!-- Kolom Kiri: Kajian Gizi & Pilih Diet -->
      <div class="col-md-6">
        <Card class="assessment-card">
          <template #title>
            <div class="card-title-wrapper">
              <span>KAJIAN GIZI (MST / STRONGKIDS)</span>
            </div>
          </template>

          <template #content>
            <div v-if="assessmentLoading" class="empty-state">
              <i class="pi pi-spin pi-spinner empty-icon"></i>
              <p>Memuat kajian gizi...</p>
            </div>
            <div v-else-if="!assessmentData" class="empty-state">
              <i class="pi pi-info-circle empty-icon"></i>
              <p>Belum ada data kajian gizi</p>
            </div>
            <div v-else class="assessment-body">
              <div class="assessment-scores-row">
                <div
                  v-if="skorGizi !== null"
                  class="assessment-score"
                  :class="`score-${statusGizi.severity}`"
                >
                  <div class="score-label">SKOR {{ jenisSkoring }}</div>
                  <div class="score-value">{{ skorGizi }}</div>
                  <Tag :severity="statusGizi.severity" :value="statusGizi.label" />
                </div>

                <div v-if="bmiInfo" class="assessment-score" :class="`score-${bmiInfo.severity}`">
                  <div class="score-label">IMT (BMI)</div>
                  <div class="score-value">{{ bmiInfo.value }}</div>
                  <Tag :severity="bmiInfo.severity" :value="bmiInfo.kategori" />
                </div>
              </div>

              <div class="assessment-questions" v-if="assessmentRows.length > 0">
                <div class="assessment-row" v-for="(row, idx) in assessmentRows" :key="idx">
                  <span class="assessment-question">{{ row.label }}</span>
                  <span class="assessment-answer">
                    {{ row.jawaban }}
                    <Badge
                      v-if="row.nilai !== undefined && row.nilai !== null"
                      :value="row.nilai"
                    />
                  </span>
                </div>
              </div>

              <div class="assessment-vitals" v-if="vitalRows.length > 0">
                <div class="vitals-title">Tanda Vital</div>
                <div class="vitals-grid">
                  <div class="vital-item" v-for="(v, idx) in vitalRows" :key="idx">
                    <span class="vital-label">{{ v.label }}</span>
                    <span class="vital-value">{{ v.value }} {{ v.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <Card class="items-card">
          <template #title>
            <div class="card-title-wrapper">
              <span>LIST DIET</span>
              <Badge
                v-if="itemAvailable.length > 0"
                :value="itemAvailable.length"
                class="results-badge"
              />
            </div>
          </template>

          <template #content>
            <div class="diet-select-wrapper">
              <Select
                v-model="selectedDietOption"
                :options="itemAvailable"
                optionLabel="NAMA"
                filter
                filterPlaceholder="Cari jenis diet..."
                placeholder="Pilih jenis diet"
                :loading="loading"
                :emptyMessage="emptyMessage"
                showClear
                class="diet-select"
              />
              <Button
                label="Tambah"
                icon="pi pi-plus"
                severity="success"
                :disabled="!selectedDietOption"
                @click="addSelectedDiet"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- Kolom Kanan: Item yang dipilih -->
      <div class="col-md-6">
        <Card class="selected-items-card">
          <template #title>
            <div class="card-title-wrapper">
              <span>DIET TERPILIH #{{ formatDateTime(tanggal_diet) }}</span>
              <Badge
                v-if="selectedItems.length > 0"
                :value="selectedItems.length"
                severity="success"
              />
            </div>
          </template>

          <template #content>
            <div v-if="selectedItems.length > 0" class="selected-items-actions">
              <Button
                label="Hapus Semua"
                icon="pi pi-trash"
                severity="danger"
                outlined
                size="small"
                @click="clearAllSelected"
              />
            </div>

            <DataTable
              :value="selectedItems"
              stripedRows
              showGridlines
              :emptyMessage="'Belum ada diet yang dipilih'"
              class="medicine-table"
            >
              <template #empty>
                <div class="empty-state">
                  <i class="pi pi-heart empty-icon"></i>
                  <p>Belum ada diet yang dipilih</p>
                  <small>Pilih diet dari tabel sebelah kiri</small>
                </div>
              </template>

              <Column field="NAMA" header="JENIS DIET">
                <template #body="slotProps">
                  <strong>{{ slotProps.data.NAMA }}</strong>
                </template>
              </Column>

              <Column field="JADWAL" header="JADWAL" style="width: 150px">
                <template #body="slotProps">
                  <Select
                    v-model="slotProps.data.REMARK_ITEM"
                    :options="jadwalOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih jadwal"
                    class="jadwal-select"
                    @change="updateJadwal(slotProps.data, slotProps.index, $event)"
                  />
                </template>
              </Column>

              <Column header="Aksi" style="width: 80px">
                <template #body="slotProps">
                  <Button
                    icon="pi pi-times"
                    size="small"
                    severity="danger"
                    outlined
                    @click="removeItem(slotProps.index)"
                    v-tooltip="'Hapus dari pilihan'"
                  />
                </template>
              </Column>
            </DataTable>

            <ScrollPanel style="height: 500px; padding-right: 4px">
              <DataTable :value="list_diet_added" stripedRows paginator :rows="5">
                <Column field="NAMA" header="NAMA">
                  <template #body="slotProps">
                    <Button
                      icon="pi pi-times"
                      severity="warn"
                      @click="ConfirmVoidResep(slotProps.data.TRANS, slotProps.index)"
                      class="round-button2"
                      text
                    ></Button>
                  </template>
                </Column>
                <Column field="NAMA" header="NAMA" />

                <Column field="DIET" header="DIET">
                  <template #body="slotProps">
                    <strong>{{ slotProps.data.DIET }}</strong>
                  </template>
                </Column>
                <Column field="DPJP" header="DOKTER" />

                <Column field="STATUS_PROGRESS" header="STATUS">
                  <template #body="slotProps">
                    <Tag
                      :severity="slotProps.data?.STATUS_PROGRESS === 'P' ? 'success' : 'warning'"
                      :value="slotProps.data?.STATUS_PROGRESS === 'C' ? 'Completed' : 'In Progress'"
                    />
                  </template>
                </Column>
                <!-- <Column field="PROSES" header="PROSES" />
                <Column field="SELESAI" header="SELESAI" /> -->
              </DataTable>
              <!-- <Panel class="mb-1">
                <template #header> </template>
                {{ list_diet_added }}

                <div class="row" v-for="(data, index) in list_diet_added" :key="index">
                  <div class="col-md-4">
                    <Button
                      icon="pi pi-times"
                      severity="warn"
                      @click="ConfirmVoidResep(data.RECEIPT_NO, index)"
                      class="round-button2"
                      text
                    ></Button>
                  </div>
                  <div class="col-md-4">
                    <Tag severity="success" style="font-size: 10px">{{ data.DIET }} </Tag>
                  </div>
                </div>

                <template #footer> </template>
              </Panel> -->
            </ScrollPanel>
          </template>
        </Card>
      </div>
    </div>

    <template #footer>
      <Button label="Simpan" icon="pi pi-check" @click="saveItems" class="round-button2" />
      <Button label="Tutup" icon="pi pi-times" @click="CloseButton" class="p-button-outlined" />
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="get_riwayat()"
        class="p-button-outlined"
      />
    </template>
  </Dialog>

  <ConfirmDialog />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ScrollPanel from 'primevue/scrollpanel'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import Badge from 'primevue/badge'
import { type } from 'jquery'

// Stores and composables
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
// atau jika menggunakan injection

// Reactive variables
const loading = ref(false)
const itemAvailable = ref([])

const RewayatDiet = ref([])

const ConfirmVoidResep = (RECEIPT_NO, index) => {
  RemoveResep(RECEIPT_NO, index)
}

const RemoveResep = async (RECEIPT_NO) => {
  const url = configStore.apiApotikUrl

  const paramUrl = `${RECEIPT_NO}/${id_client.value}/${0}`
  const response = await axios.post(`${url}/index.php/api/sales/void_sales/${paramUrl}`)
  if (response.data.metadata.code == '200') {
    get_riwayat()
    showSuccess('Resep berhasil dibatalkan')
  } else {
    showError(response.data.metadata.message)
  }
}

// method kirim resep
const kirim_resep = async (rcpt_no) => {
  loading.value = true
  const param = {
    RECEIPT_NO: rcpt_no,
  }

  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/kirim_resep/${id_client.value}`,
      param,
    )
    console.log(response.data)
    await get_riwayat()
    showSuccess('Resep berhasil dikirim')
  } catch (error) {
    console.error(error)
    showError('Gagal mengirim resep')
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['update:showHistoryTeraphy'])

const props = defineProps({
  datapasien: {
    type: Object,
    required: false,
    validator: (value) => value && typeof value === 'object',
  },
  showHistoryTeraphy: {
    type: Boolean,
    default: false,
  },
  showDetailDialog: {
    type: Boolean,
    default: false,
  },
  tanggal_diet: {
    type: Date,
    default: false,
  },
  shif_diet: {
    type: String,
    default: '',
  },
})

const formatDateForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return null
  }
}

const list_diet_added = ref([])
// API functions
const get_riwayat = async () => {
  try {
    loading.value = true

    const formattedDate = formatDateForAPI(props.tanggal_diet)
    if (!formattedDate) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: 'Pilih tanggal terlebih dahulu',
        life: 3000,
      })
      loading.value = false
      return
    }

    const param = {
      id_client: id_client.value,
      mode: 2,
      jenis_penunjang: 5,
      shif: props.shif_diet,
      tanggal: formattedDate,
      nomr: props.datapasien?.NOMR,
    }

    // console.log('param to get list diet', param)

    list_diet_added.value = []

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/Data_referensi/getlist_penunjang_order_jasa_penunjang`,
      param,
    )

    if (response.data && response.data.response) {
      list_diet_added.value = [...response.data.response]
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data. Silakan coba lagi.',
      life: 3000,
    })
    list_diet_added.value = []
  } finally {
    loading.value = false
  }
}

const showHistoryTeraphy = computed({
  get: () => props.showHistoryTeraphy,
  set: (value) => emit('update:showHistoryTeraphy', value),
})

const CloseButton = async () => {
  showHistoryTeraphy.value = false
}
// Tambahan: daftar item terpilih
const selectedItems = ref([])
const selectedDietOption = ref(null)

// Jadwal options
const jadwalOptions = ref([
  { label: 'PAGI', value: 'PAGI' },
  { label: 'SIANG', value: 'SIANG' },
  { label: 'MALAM', value: 'MALAM' },
])

// Computed
const emptyMessage = computed(() => {
  return loading.value ? 'Memuat data...' : 'Tidak ada data diet ditemukan'
})

// Kajian gizi (MST / Strongkids)
const assessmentLoading = ref(false)
const assessmentData = ref(null)

const getAssessmentGizi = async () => {
  try {
    console.log('Fetching kajian gizi for noregister:', props.datapasien)
    assessmentLoading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Gizi/get_assesment_gizi`, {
      noregister: props.datapasien?.NOREFF_IGD,
      id_client: id_client.value,
    })
    assessmentData.value = response.data?.response ?? response.data?.data ?? response.data ?? null
  } catch (error) {
    console.error('Error fetching kajian gizi:', error)
    assessmentData.value = null
  } finally {
    assessmentLoading.value = false
  }
}

const assessmentQuestionDefs = [
  { key: 'tampak_kurus', label: 'Tampak Kurus' },
  { key: 'penurunanBB_1bulan', label: 'Penurunan BB 1 Bulan Terakhir' },
  { key: 'gejala_asupan', label: 'Gejala Gangguan Asupan Makan' },
  { key: 'penyakit_beresiko', label: 'Penyakit/Kondisi Berisiko' },
  { key: 'penurunanBB', label: 'Penurunan Berat Badan' },
  { key: 'turunnafsu_makan', label: 'Penurunan Nafsu Makan' },
]

const assessmentRows = computed(() => {
  const data = assessmentData.value
  if (!data) return []

  return assessmentQuestionDefs
    .filter((def) => data[def.key] !== undefined && data[def.key] !== null && data[def.key] !== '')
    .map((def) => {
      const raw = data[def.key]
      if (raw !== null && typeof raw === 'object') {
        return { label: def.label, jawaban: raw.caption, nilai: raw.value }
      }
      return { label: def.label, jawaban: raw, nilai: data[`${def.key}_value`] }
    })
})

const vitalFieldDefs = [
  { key: 'bb', label: 'Berat Badan', unit: 'kg' },
  { key: 'tb', label: 'Tinggi Badan', unit: 'cm' },
  { key: 'tensi_sistol', label: 'Tensi Sistol', unit: 'mmHg' },
  { key: 'tensi_distol', label: 'Tensi Distol', unit: 'mmHg' },
  { key: 'nadipermenit', label: 'Nadi', unit: 'x/menit' },
  { key: 'respirasi', label: 'Respirasi', unit: 'x/menit' },
  { key: 'saturasi', label: 'Saturasi O2', unit: '%' },
  { key: 'nyeri', label: 'Skala Nyeri', unit: '' },
]

const vitalRows = computed(() => {
  const data = assessmentData.value
  if (!data) return []

  return vitalFieldDefs
    .filter((def) => data[def.key] !== undefined && data[def.key] !== null)
    .map((def) => ({ label: def.label, value: data[def.key], unit: def.unit }))
})

// IMT / BMI = BB(kg) / TB(m)^2, kategori mengikuti standar Kemenkes RI
const bmiInfo = computed(() => {
  const data = assessmentData.value
  const bb = Number(data?.bb)
  const tb = Number(data?.tb)
  if (!data || !bb || !tb) return null

  const tbMeter = tb / 100
  const bmi = bb / (tbMeter * tbMeter)
  const value = Math.round(bmi * 10) / 10

  let kategori = ''
  let severity = 'success'
  if (bmi < 17) {
    kategori = 'Sangat Kurus'
    severity = 'danger'
  } else if (bmi < 18.5) {
    kategori = 'Kurus'
    severity = 'warn'
  } else if (bmi <= 25) {
    kategori = 'Normal'
    severity = 'success'
  } else if (bmi <= 27) {
    kategori = 'Gemuk'
    severity = 'warn'
  } else {
    kategori = 'Sangat Gemuk (Obesitas)'
    severity = 'danger'
  }

  return { value, kategori, severity }
})

const skorGizi = computed(() => {
  const data = assessmentData.value
  if (!data) return null
  if (data.nilai_strongkids !== undefined && data.nilai_strongkids !== null) {
    return data.nilai_strongkids
  }
  if (data.nilai_mst !== undefined && data.nilai_mst !== null) {
    return data.nilai_mst
  }
  return null
})

const jenisSkoring = computed(() => {
  const data = assessmentData.value
  return data?.nilai_strongkids !== undefined && data?.nilai_strongkids !== null
    ? 'STRONGKIDS'
    : 'MST'
})

const statusGizi = computed(() => {
  const total = skorGizi.value
  if (total === null || total === undefined) return { label: '', severity: 'success' }

  if (jenisSkoring.value === 'STRONGKIDS') {
    if (total <= 1) return { label: 'RISIKO RENDAH', severity: 'success' }
    if (total <= 3) return { label: 'RISIKO SEDANG', severity: 'warn' }
    return { label: 'RISIKO TINGGI', severity: 'danger' }
  }

  if (total <= 1) return { label: 'RISIKO RENDAH', severity: 'success' }
  if (total === 2) return { label: 'RISIKO SEDANG', severity: 'warn' }
  return { label: 'RISIKO TINGGI', severity: 'danger' }
})

// Methods
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'

  try {
    const date = new Date(dateTimeString)

    if (isNaN(date.getTime())) {
      return dateTimeString
    }

    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour12: false,
    })
  } catch (error) {
    console.error('DateTime formatting error:', error)
    return dateTimeString
  }
}

const formatDateTime_tosave = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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

const currentDateTime = ref('')

//currentDateTime.value = formatDateTime()

const saveItems = async () => {
  if (selectedItems.value.length === 0) {
    showWarning('Tidak ada item yang akan disimpan')
    return
  }
  currentDateTime.value = formatDateTime()

  const headerObat = {
    header: {
      RECEIPT_NO: '',
      MEMBERSHIP_ID: props.datapasien?.NOMR,
      SALESNO: 0,
      IDUSER: '11',
      TANGGAL: formatForDatabase(props.tanggal_diet),
      IDPAYEMENT: 0,
      NOTE: '',
      SUBTOTAL: 0,
      TAXPERCENT: 0,
      TAXAMOUNT: 0,
      TOTALBAYAR: 0,
      POTONGAN: 0,
      MODE: 'REG',
      IDCLIENT: id_client.value,
      GRANDTOTAL: 0,
      KEMBALIAN: 0,
      ID_LOKASI: 92,
      ROOM_TABLE_NUMBER: 0,
      RESV_ID: 0,
      NO_REGISTER: props.datapasien?.NOPENDAFTARAN,
      SERVER_ID: 0,
      POLI_RUANG: props.datapasien?.POLI,
      DPJP: props.datapasien?.NAMADOKTER,
      SERVER_NAME: '',
      STATUS_PROGRESS: '',
      OBAT_OBATAN: 5,
      AS_PARENT: 1,
      TGL_SELESAI: '',
      KLINIS: '',
      JENIS_RESEP: 'RT',
      CARAPAKAI_RACIK: '',
      JML_RACIK: '',
      BENTUK_RACIK: '',
      OBAT_PULANG: 0,
      details: selectedItems.value,
    },
  }

  loading.value = true
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/insert_sales_v2`, headerObat)
    console.log(response.data)

    if (response.data?.metadata?.code == 200) {
      showSuccess('Data berhasil disimpan')
      selectedItems.value = []
      await get_riwayat()
    } else {
      showError(response.data?.metadata?.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error(error)
    showError('Terjadi kesalahan saat menyimpan data')
  } finally {
    loading.value = false
  }
}

const selectMedicine = (item, index) => {
  // Tambahkan ke daftar selectedItems jika belum ada

  // Buat copy dari medicine dengan jadwal default kosong
  const medicineWithSchedule = {
    BARCODE: item.BARCODE,
    ID_BARANG: item.BARCODE,
    JENIS_R: 'R/',
    NAMA: item.NAMA || item.CAPTION,
    SATUAN: item.SATUAN,
    RECEIPT_NO: '',
    HARGA: item.HARGAJUAL,
    POTONGSTOCK: item.POTONGSTOCK,
    TOTAL_ITEM: 0,
    QTY_RACIK: item.QTY_RACIK || 0,
    PERSEDIAAN: item.QUANTITY || item.QUNATITY,
    SATUAN_RACIK: item.SATUAN_RACIK,
    MEREK: item.SATUAN,
    TOTALAMOUNT: 0,
    DISCOUNT: 0,
    ITEMSEQNO: index,
    SUBITEMSEQNO: 1,
    QTY: 1,
    STATUS: '',
    DOSIS: '',
    STATUS_PROGRESS: 'M',
    SUB_BARCODE: item.SUB_BARCODE,
    OBAT_OBATAN: 1,
    AS_PARENT: 0,
    SAT_RACIK: '',
    FLAG: 'NEW LINE',
    JENIS: item.JENIS,
    JENIS_RESEP: 'RT',
    ID_LOKASI: 0,
    REMARK: '',
    REMARK_ITEM: props.shif_diet,
    TANGGAL_TRANS: currentDateTime.value,
    JML_RACIK: 0,
  }
  selectedItems.value.push(medicineWithSchedule)
}

const addSelectedDiet = () => {
  if (!selectedDietOption.value) return

  const index = itemAvailable.value.indexOf(selectedDietOption.value)
  selectMedicine(selectedDietOption.value, index)
  selectedDietOption.value = null
}

const removeItem = (index) => {
  selectedItems.value.splice(index, 1)
}

const clearAllSelected = () => {
  if (selectedItems.value.length > 0) {
    selectedItems.value = []
    showInfo('Semua pilihan diet telah dihapus')
  }
}

const updateJadwal = (medicine, event, index) => {
  // Update jadwal di selected item
  if (selectedItems.value[index]) {
    selectedItems.value[index].REMARK_ITEM = event.value
  }
}

// API functions
const findItem = async (mode, barcode) => {
  try {
    const param = {
      barcode: barcode,
      mode: mode,
      id_client: id_client.value,
      breakdown: 0,
      nama: '',
      lokasi: 0,
    }
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    if (response.data?.metadata?.code == 200) {
      itemAvailable.value = response.data.response || []
      if (itemAvailable.value.length === 0) {
        showWarning('Tidak ada data diet ditemukan')
      }
    } else {
      itemAvailable.value = []
      showWarning('Tidak ada data diet ditemukan')
    }
  } catch (error) {
    console.error('Error loading data:', error)
    itemAvailable.value = []
    showError('Gagal memuat data diet')
  } finally {
    loading.value = false
  }
}

// Toast functions
const showSuccess = (message) => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

const showError = (message) => {
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
    summary: 'Peringatan',
    detail: message,
    life: 4000,
  })
}

const showInfo = (message) => {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: message,
    life: 4000,
  })
}

watch(
  () => showHistoryTeraphy.value,
  (newVal) => {
    if (newVal) {
      // Dialog dibuka
      get_riwayat()
      getAssessmentGizi()
    }
  },
)

// Lifecycle
onMounted(() => {
  findItem(20, '') // Load semua data saat pertama kali dengan mode 19
})
</script>

<style scoped>
.medicine-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.search-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.search-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  flex: 1;
  height: 2.5rem;
}

.items-card,
.selected-items-card {
  background: white;
  border: 1px solid #e9ecef;
  margin-bottom: 1rem;
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.results-badge {
  background-color: #6c757d;
}

.medicine-table {
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1rem;
}

.medicine-name-cell strong {
  color: #2c3e50;
  font-size: 0.95rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.selected-items-actions {
  margin-bottom: 1rem;
  text-align: right;
}

.jadwal-select {
  width: 100%;
}

.assessment-card {
  margin-bottom: 1rem;
}

.diet-select-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.diet-select {
  flex: 1;
}

.assessment-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assessment-scores-row {
  display: flex;
  gap: 0.75rem;
}

.assessment-score {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.assessment-score .score-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 0.03em;
}

.assessment-score .score-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.assessment-score.score-success {
  background: #e6f7ec;
  border-color: #b7e4c7;
}

.assessment-score.score-warn {
  background: #fff6e5;
  border-color: #ffe1a8;
}

.assessment-score.score-danger {
  background: #fdecec;
  border-color: #f5b8b8;
}

.assessment-questions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.assessment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #f1f3f4;
}

.assessment-row:last-child {
  border-bottom: none;
}

.assessment-question {
  color: #495057;
  font-size: 0.9rem;
}

.assessment-answer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.assessment-vitals {
  border-top: 1px solid #e9ecef;
  padding-top: 0.75rem;
}

.vitals-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.vitals-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.vital-item {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0.6rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.85rem;
}

.vital-label {
  color: #6c757d;
}

.vital-value {
  font-weight: 600;
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 2.5rem;
  color: #dee2e6;
  margin-bottom: 0.5rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.medicine-dialog .medicine-info {
  padding: 1rem 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row label {
  font-weight: 600;
  color: #495057;
  min-width: 120px;
}

.info-row span {
  color: #6c757d;
  text-align: right;
  flex: 1;
  margin-left: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .medicine-container {
    padding: 1rem;
  }

  .search-wrapper {
    flex-direction: column;
  }

  .table-header {
    justify-content: center;
  }

  .card-title-wrapper {
    justify-content: center;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-row span {
    text-align: left;
    margin-left: 0;
  }

  .selected-items-actions {
    text-align: center;
  }

  .diet-select-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .assessment-scores-row {
    flex-direction: column;
  }

  .vitals-grid {
    grid-template-columns: 1fr;
  }
}

/* Custom DataTable styling */
:deep(.p-datatable .p-datatable-header) {
  background: #f8f9fa;
  border-color: #e9ecef;
  padding: 0;
  border: none;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #495057;
  font-weight: 600;
  border-color: #e9ecef;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border-color: #e9ecef;
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
  background: #f8f9fa;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #e7f3ff;
}

:deep(.p-button:disabled) {
  opacity: 0.4;
}

:deep(.jadwal-select .p-select) {
  width: 100%;
}
</style>
