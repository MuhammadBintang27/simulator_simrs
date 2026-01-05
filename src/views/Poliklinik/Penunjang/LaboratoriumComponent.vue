<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Toast />

  <Dialog
    v-model:visible="listObat"
    modal
    header="PERIKSAAN LAB"
    :style="{ width: '1200px' }"
    class="patient-detail-dialog"
    :closable="false"
  >
    <div>
      <DataTable
        :value="availableObat"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :scrollable="true"
        scrollHeight="700px"
        class="p-datatable-sm"
        :rowHover="true"
        :showGridlines="true"
      >
        <!-- Header with search -->
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-2 mr-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search mr-2" />
                <InputText
                  v-model="searchQuery"
                  @input="get_item(11, '')"
                  style="font-size: 12px"
                  placeholder="Cari item pemeriksaan..."
                />
              </span>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
            <p class="text-gray-600 m-0">Tidak ada data pemeriksaan yang tersedia</p>
          </div>
        </template>

        <!-- Loading template -->
        <template #loading>
          <div class="text-center p-4">
            <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
            <p class="mt-2 text-gray-600">Memuat data...</p>
          </div>
        </template>

        <!-- Columns -->

        <Column
          field="CAPTION"
          header="Nama Pemeriksaan"
          :sortable="true"
          :showFilterMenuOptions="false"
          style="min-width: 200px"
        >
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <span class="font-semibold">
                {{ slotProps.data.CAPTION }}
                <span v-if="slotProps.data.QUANTITY" class="ml-2">
                  <Tag severity="warn" :value="slotProps.data.QUANTITY"></Tag>
                  <small>tersedia</small>
                </span>
              </span>
            </div>
          </template>
        </Column>

        <Column
          field="KATEGORI"
          header="Kategori"
          :sortable="true"
          :showFilterMenuOptions="false"
          style="min-width: 150px"
        >
          <template #body="slotProps">
            <span class="badge badge-success">{{ slotProps.data.KATEGORI }}</span>
          </template>
        </Column>

        <Column
          field="HARGAJUAL"
          header="Harga"
          :sortable="true"
          dataType="numeric"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <div class="text-right font-semibold text-green-600">
              {{ formatCurrency(slotProps.data.HARGAJUAL) }}
            </div>
          </template>
        </Column>

        <!-- Action column -->
        <Column header="Aksi" :exportable="false" style="min-width: 120px">
          <template #body="slotProps">
            <div class="flex gap-1">
              <Button
                icon="pi pi-plus"
                class="p-button-rounded p-button-success round-button2 p-button-sm"
                @click="addItem(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Footer template -->
    <template #footer>
      <div class="dialog-footer">
        <Button label="Close" icon="pi pi-times" @click="listObat = false" class="p-button-text" />
      </div>
    </template>
  </Dialog>

  <Panel>
    <template #header>
      <h6 style="color: darkcyan">
        <strong>PEMERIKSAAN LABORATORIUM</strong>
        <Button @click="get_riwayat" text class="round-button" icon="pi pi-refresh" />
      </h6>
    </template>

    <div class="row">
      <ScrollPanel class="col-md-2" style="height: 500px; padding-right: 4px">
        <Panel v-for="(data, index) in riwayat_obat" :key="index" class="mb-1">
          <!-- Header -->
          <template #header>
            <div>
              <Tag severity="info" class="ml-0 text-xs mb-1">
                <i class="pi pi-calendar text-blue-500"></i>{{ data.SHORTDATE }} -
                {{ data.JAM }}
              </Tag>
            </div>
          </template>

          <Tag v-if="data.TELAH_DIKIRIM == 1" severity="success" style="font-size: 10px">
            Dikirim
            {{ data.TANGGAL_KIRIM }} - {{ data.JAM_KIRIM }}
          </Tag>
          <Tag v-else severity="danger" value="Belum Terkirim" class="text-xs" />

          <template #footer>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <Button
                  icon="pi pi-times"
                  severity="warn"
                  @click="ConfirmVoidResep(data.RECEIPT_NO, index)"
                  class="round-button2"
                  text
                />
                <Button
                  icon="pi pi-eye"
                  label="lihat"
                  class="round-button2"
                  @click="getHasil_pemeriksaan_lab(data.RECEIPT_NO)"
                  rounded
                  text
                />
                <button
                  v-if="data.TELAH_DIKIRIM == 0"
                  type="button"
                  @click="kirim_resep(data.RECEIPT_NO)"
                  class="btn btn-block btn-danger btn-xs"
                >
                  Kirim
                  <i class="pi pi-send" style="font-size: 10px; margin-right: 4px"></i>
                </button>
                <!-- <span style="color: gray">{{ data.RECEIPT_NO }}</span> -->
              </div>
            </div>
          </template>
        </Panel>
      </ScrollPanel>
      <div class="col-md-10">
        <Panel>
          <template #header>
            <div class="panel-header-content">
              <!-- Tombol -->
              <div class="button-section">
                <Button
                  class="p-button-success"
                  icon="pi pi-plus"
                  label="Pilih Item Pemeriksaan"
                  size="small"
                  @click="listObat = true"
                />
              </div>

              <!-- Input Klinis & Catatan -->
              <div class="input-section">
                <div class="input-group">
                  <div class="input-field">
                    <label for="klinis" class="input-label">Klinis:</label>
                    <InputText
                      id="klinis"
                      v-model="klinis"
                      size="small"
                      placeholder="Masukkan diagnosa klinis"
                      class="input-control"
                    />
                  </div>
                  <div class="input-field">
                    <label for="catatan" class="input-label">Catatan:</label>
                    <InputText
                      id="catatan"
                      v-model="catatan"
                      size="small"
                      placeholder="Catatan tambahan"
                      class="input-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
          <DataTable
            :value="selectedObatObatan"
            :paginator="false"
            :scrollable="true"
            scrollHeight="400px"
            :breakpoints="{ '1100px': '75vw', '575px': '90vw' }"
            class="p-datatable-sm"
            :rowHover="true"
            :showGridlines="true"
          >
            <!-- Empty state -->
            <template #empty>
              <div class="text-center p-4">
                <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
                <p class="text-gray-600 m-0">Tidak ada pemeriksaan yang dipilih</p>
              </div>
            </template>

            <!-- Loading template -->
            <template #loading>
              <div class="text-center p-4">
                <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
                <p class="mt-2 text-gray-600">Memuat data...</p>
              </div>
            </template>

            <!-- Columns -->
            <Column field="BARCODE" header="BARCODE" style="min-width: 10px"></Column>
            <Column field="NAMA" header="NAMA"></Column>

            <Column field="QTY" header="QTY">
              <template #body="slotProps">
                <InputNumber v-model="slotProps.data.QTY" style="width: 9em" :min="1" />
              </template>
            </Column>
            <Column field="AKSI" header="AKSI">
              <template #body="slotProps">
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  class="p-button-text round-button2"
                  @click.stop.prevent="confirmRemoveItemObat(slotProps.index)"
                />
              </template>
            </Column>
          </DataTable>

          <!-- Add Footer Template -->
          <template #footer>
            <div class="panel-footer">
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-2">
                  <small>Total Items: {{ selectedObatObatan.length }}</small>
                </div>
                <div class="flex gap-2">
                  <Button
                    label="Clear All"
                    icon="pi pi-trash"
                    severity="danger"
                    class="p-button-outlined round-button2"
                    @click="clearAllItems"
                    :disabled="selectedObatObatan.length === 0"
                  />
                  <Button
                    label="Save"
                    icon="pi pi-save"
                    class="p-button-success round-button2 ml-1"
                    @click="saveItems"
                    :disabled="selectedObatObatan.length === 0"
                  />
                  <Button
                    label="Histori"
                    icon="pi pi-history"
                    @click="showHistoryTeraphy = true"
                    class="p-button-info round-button2 ml-1"
                  />
                </div>
              </div>
            </div>
          </template>
        </Panel>
      </div>
    </div>
  </Panel>

  <Drawer
    v-model:visible="hasilLab"
    modal
    class="patient-detail-dialog"
    :closable="true"
    position="bottom"
    style="height: 90%; width: 90%"
  >
    <div>
      <Tag :severity="progress == 'C' ? 'success' : 'warn'">
        {{ progress === 'C' ? 'Selesai Pada Pukul' : 'Menunggu' }} {{ jamSelesai }}
      </Tag>
    </div>

    <div class="row">
      <div class="patient-details col-md-3">
        <dt>Pasien</dt>
        <dd>
          <strong>
            {{ datalab_pasien?.NAMA }} ({{ datalab_pasien?.JENISKELAMIN
            }}{{ datalab_pasien?.USIA }})</strong
          >
        </dd>
      </div>
      <div class="patient-details col-md-3">
        <dt>Otorisasi Oleh</dt>
        <dd>
          <strong v-if="datalab_pasien?.IS_VERIFIED == 0"> Belum </strong>
          <strong v-else> {{ datalab_pasien?.PETUGAS_OTENTIKASI }}</strong>
        </dd>
      </div>
      <div class="patient-details col-md-3">
        <dt>Otorisasi</dt>
        <dd>
          <strong> {{ formatDateTimeIndonesiaFromDate(datalab_pasien?.DATE_VERIFIED) }} </strong>
        </dd>
      </div>
      <div class="patient-details col-md-3">
        <dt>Catatan/Kesan</dt>
        <dd>
          <strong> {{ catatan_kesan }} </strong>
        </dd>
      </div>
      <div class="patient-details col-md-3">
        <dt>Klinis</dt>
        <dd>
          <strong> {{ datalab_pasien?.KLINIS }} </strong>
        </dd>
      </div>
    </div>

    <div>
      <table class="table table-sm tb-sm table-bordered table-striped small-table">
        <thead>
          <tr>
            <th>PEMERIKSAAN</th>
            <th>ITEM PEMERIKSAAN</th>
            <th>HASIL</th>

            <th>NORMAL</th>
            <th>SATUAN</th>
            <th>KET HASIL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(hasil, index) in processedResults" :key="hasil.originalIndex || index">
            <td
              v-if="hasil.showCategory"
              :rowspan="hasil.categoryRowspan"
              class="merged-category align-middle text-center font-weight-bold"
              style="background-color: #f8f9fa; vertical-align: middle"
            >
              {{ hasil.NAMA }}
            </td>
            <td>{{ hasil.PEMERIKSAAN }}</td>
            <td>
              <span v-if="hasil.HASIL_TIDAK_NORMAL == 1">
                <strong style="color: red">{{ hasil.HASIL }}</strong>
              </span>
              <span v-else>
                <strong style="color: black">{{ hasil.HASIL }}</strong>
              </span>
            </td>
            <td>{{ hasil.NORMAL }}</td>
            <td>{{ hasil.SATUAN }}</td>
            <td>{{ hasil.KET_HASIL }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Drawer>

  <HIstoryTeraphy v-model:showHistoryTeraphy="showHistoryTeraphy" @sendData="getDataHistori" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HIstoryTeraphy from '@/components/PoliklinikComponent/HIstoryTeraphy.vue'

import ScrollPanel from 'primevue/scrollpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Panel from 'primevue/panel'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'

import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import Drawer from 'primevue/drawer'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi } = storeToRefs(authStore)
const route = useRoute()
const confirm = useConfirm()
const toast = useToast()

// Props
const props = defineProps({
  datapasien: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object',
  },
})

// Reactive variables
const loading = ref(false)
const listObat = ref(false)
const hasilLab = ref(false)
const showHistoryTeraphy = ref(false)

const selectedObatObatan = ref([])
const availableObat = ref([])
const riwayat_obat = ref([])
const detils_obat = ref([])
const datafromCopyResep = ref(null)

const searchQuery = ref('')
const currentDateTime = ref('')
const progress = ref(null)
const jamSelesai = ref(null)
const RECEIPT_NO = ref(null)
const klinis = ref('')
const catatan = ref('')

// Utility functions
const formatDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatCurrency = (amount) => {
  if (!amount) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const hasil_pemeriksaan_lab = ref([])
const datalab_pasien = ref(null)
const catatan_kesan = ref(null)
const getHasil_pemeriksaan_lab = async (no_receipt) => {
  // $url = $this->ws_inv.'index.php/api/sales/get_item_lab_master_detail/'.$request->receipt.'/'.Session::get('id_client'); // Replace this with the API endpoint URL
  try {
    hasilLab.value = true
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/sales/get_item_lab_master_detail/${no_receipt}/${id_client.value}`,
    )

    console.log(response.data)
    if (response.data?.metadata?.code == '200') {
      hasil_pemeriksaan_lab.value = response.data.response || []
      datalab_pasien.value = response.data?.pasien
      catatan_kesan.value = response.data?.catatan_kesan

      getdetail_sales(no_receipt)
    } else {
      availableObat.value = []
      showWarning('Tidak ada data pemeriksaan ditemukan')
    }
  } catch (error) {
    console.error('Error searching procedures:', error)
    availableObat.value = []
    showError('Gagal mencari data pemeriksaan')
  } finally {
    loading.value = false
  }
}

// Format specific date to Indonesian format: DD/MM/YYYY HH:MM
const formatDateTimeIndonesiaFromDate = (date) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Computed property to process results and merge categories
const processedResults = computed(() => {
  const results = []
  const categoryGroups = {}

  // Group by category
  hasil_pemeriksaan_lab.value.forEach((item, index) => {
    const category = item.NAMA
    if (!categoryGroups[category]) {
      categoryGroups[category] = []
    }
    categoryGroups[category].push({ ...item, originalIndex: index })
  })

  // Process each group to add merge information
  Object.keys(categoryGroups).forEach((category) => {
    const categoryItems = categoryGroups[category]
    categoryItems.forEach((item, index) => {
      results.push({
        ...item,
        showCategory: index === 0, // Only show category cell on first item
        categoryRowspan: categoryItems.length, // Number of rows to span
      })
    })
  })

  return results
})

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

// Confirmation functions
const confirmRemoveItemObat = (index) => {
  const obat = selectedObatObatan.value[index]
  const namaObat = obat?.NAMA

  confirm.require({
    message: `Anda ingin menghapus item "${namaObat}"?`,
    header: 'Konfirmasi hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => removeItem(index),
  })
}

const ConfirmVoidResep = (RECEIPT_NO, index) => {
  confirm.require({
    message: `Anda ingin menghapus resep "${RECEIPT_NO}"?`,
    header: 'Konfirmasi hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => RemoveResep(RECEIPT_NO, index),
  })
}

// Item management functions
const addItem = async (item) => {
  console.log(item)
  currentDateTime.value = formatDateTime()

  // Check if item already exists
  const existingItem = selectedObatObatan.value.find((x) => x.BARCODE === item.BARCODE)
  if (existingItem) {
    showWarning('Item sudah ada dalam daftar')
    return
  }

  selectedObatObatan.value.push({
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
    ITEMSEQNO: '',
    SUBITEMSEQNO: 1,
    QTY: item.QTY || 1,
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
    REMARK_ITEM: '',
    TANGGAL_TRANS: currentDateTime.value,
    JML_RACIK: 0,
  })
}

const removeItem = (index) => {
  selectedObatObatan.value.splice(index, 1)
}

const clearAllItems = () => {
  selectedObatObatan.value = []
}

// API functions
const get_item = async (mode, barcode) => {
  try {
    if (searchQuery.value.length <= 3) {
      return
    }
    const param = {
      barcode: barcode,
      mode: mode,
      lokasi: id_lokasi.value,
      id_client: id_client.value,
      breakdown: 1,
      nama: searchQuery.value,
      kategori: 'LABORATORIUM',
    }
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    console.log(response.data)
    if (response.data?.metadata?.code == 200) {
      availableObat.value = response.data.response || []
    } else {
      availableObat.value = []
      showWarning('Tidak ada data pemeriksaan ditemukan')
    }
  } catch (error) {
    console.error('Error searching procedures:', error)
    availableObat.value = []
    showError('Gagal mencari data pemeriksaan')
  } finally {
    loading.value = false
  }
}

const get_riwayat = async () => {
  loading.value = true
  try {
    const param = {
      noregister: route.query.noreg,
      id_client: id_client.value,
      jenisdata: 2,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/riwayatpenunjang`, param, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.data?.response) {
      riwayat_obat.value = response.data.response
      loading.value = false
    } else {
      riwayat_obat.value = []
      loading.value = false
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat riwayat pemeriksaan')
  } finally {
    loading.value = false
  }
}

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

const RemoveResep = async (RECEIPT_NO, index) => {
  const url = configStore.apiApotikUrl

  const paramUrl = `${RECEIPT_NO}/${id_client.value}/${0}`
  const response = await axios.post(`${url}/index.php/api/sales/void_sales/${paramUrl}`)
  if (response.data.metadata.code == '200') {
    riwayat_obat.value.splice(index, 1)
    showSuccess('Resep berhasil dibatalkan')
  } else {
    showError(response.data.metadata.message)
  }
}

const getdetail_sales = async (no_receipt) => {
  loading.value = true
  try {
    RECEIPT_NO.value = no_receipt
    const param = {
      NOREGIRTER_KLINIK: no_receipt,
      RECEIPT_NO: no_receipt,
      MODE: 'RCPT',
      IDCLIENT: id_client.value,
      TGLMIN: '',
      TGLMAX: '',
      MEMBERSHIP: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/billv2`, param)
    console.log(response.data)
    detils_obat.value = response.data.response
    if (response.data.response) {
      jamSelesai.value = response.data.response[0].SELESAI
      progress.value = response.data.response[0].STATUS_PROGRESS
    }
    hasilLab.value = true

    loading.value = false
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const saveItems = async () => {
  if (selectedObatObatan.value.length === 0) {
    showWarning('Tidak ada item yang akan disimpan')
    return
  }
  currentDateTime.value = formatDateTime()

  if (klinis.value == '') {
    showWarning('Klinis wajib disi')
    return
  }

  const headerObat = {
    header: {
      RECEIPT_NO: '',
      MEMBERSHIP_ID: props.datapasien?.NOMR,
      SALESNO: 0,
      IDUSER: '11',
      TANGGAL: currentDateTime.value,
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
      OBAT_OBATAN: 2,
      AS_PARENT: 1,
      TGL_SELESAI: '',
      KLINIS: klinis.value,
      JENIS_RESEP: 'RT',
      CARAPAKAI_RACIK: '',
      JML_RACIK: '',
      BENTUK_RACIK: '',
      OBAT_PULANG: 0,
      details: selectedObatObatan.value,
    },
  }

  loading.value = true
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/insert_sales_v2`, headerObat)
    console.log(response.data)

    if (response.data?.metadata?.code == 200) {
      showSuccess('Data berhasil disimpan')
      selectedObatObatan.value = []
      klinis.value = ''
      catatan.value = ''
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

const getDataHistori = async (data) => {
  const plain = data._rawValue || data.value || data

  // Store the actual data (not stringified)
  datafromCopyResep.value = plain

  // Iterate over the data
  datafromCopyResep.value.forEach((item) => {
    console.log(item)
    const setItem = {
      BARCODE: item.BARCODE,
      NAMA: item.NAMABARANG,
      SATUAN: item.SATUAN,
      HARGA: 0,
      POTONGSTOCK: item.POTONGSTOCK,
      QTY_RACIK: 0,
      PERSEDIAAN: 0,
      MEREK: item.SATUAN,
      QTY: parseFloat(item.QTY),
      JENIS: item.JENIS,
      SATUAN_RACIK: '',
    }
    addItem(setItem)
  })
}

// Lifecycle
onMounted(() => {
  get_riwayat()
})
</script>

<style scoped>
.patient-detail-dialog {
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.patient-name {
  margin: 0 0 1rem 0;
  color: brown;
}

.patient-details {
  margin: 0;
}

.patient-details dt {
  color: #6b7280;
  font-size: 12px;
  font-weight: normal;
}

.patient-details dd {
  margin: 0 0 1rem 0;
  font-size: 14px;
}

.panel-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  margin-top: 16px;
}

.round-button2 {
  border-radius: 6px;
}

.badge-success {
  background-color: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Panel header styling */
.panel-header-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.button-section {
  display: flex;
  align-items: center;
}

.input-section {
  width: 100%;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: center;
}

.input-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-label {
  min-width: 60px;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
  text-align: left;
}

.input-control {
  flex: 1;
  min-width: 200px;
}

/* Responsive design */
@media (max-width: 768px) {
  .input-group {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .panel-header-content {
    gap: 1.5rem;
  }
}

/* Additional styles for better UX */
.btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
}

.btn-danger {
  background-color: #dc2626;
  color: white;
}

.btn-xs {
  font-size: 10px;
  padding: 2px 6px;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.text-xs {
  font-size: 0.75rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.font-semibold {
  font-weight: 600;
}

.text-blue-400 {
  color: #60a5fa;
}

.text-blue-500 {
  color: #3b82f6;
}

.text-gray-600 {
  color: #4b5563;
}

.text-green-600 {
  color: #059669;
}

.p-4 {
  padding: 1rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.small-table {
  font-size: 0.875rem;
}

.merged-category {
  vertical-align: middle !important;
  text-align: center !important;
  font-weight: bold !important;
  background-color: #f8f9fa !important;
}

/* AdminLTE compatible styling */
.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
