<template>
  <!-- <loading_overlay :is-loading="loading" message="Memuat data...." /> -->
  <Toast />

  <!-- ══════════════════════ Dialog: Cari Pemeriksaan ══════════════════ -->
  <Dialog
    v-model:visible="listObat"
    modal
    header="Cari Pemeriksaan Radiologi"
    :style="{ width: '1100px', maxWidth: '96vw' }"
    :closable="false"
  >
    <div class="radio-dialog-search">
      <span class="radio-search-wrap">
        <i class="pi pi-search search-icon" />
        <InputText
          v-model="searchQuery"
          @input="get_item(11, '')"
          placeholder="Ketik nama pemeriksaan lalu tekan Enter…"
          class="radio-search-input"
          autofocus
        />
        <Button
          icon="pi pi-search"
          label="Cari"
          size="small"
          severity="info"
          class="radio-search-btn"
          @click="get_item(11, '')"
        />
      </span>
      <Tag
        :value="`${availableObat.length} item ditemukan`"
        severity="info"
        class="radio-found-tag"
      />
    </div>

    <!-- Sering Diminta (tampil saat belum ada pencarian) -->
    <div v-if="searchQuery.length <= 2" class="radio-recent-section">
      <div class="radio-recent-hdr">
        <span class="radio-recent-hdr-left">
          <i class="pi pi-star-fill"></i>
          Sering Diminta di Poli Ini
        </span>
        <span v-if="loadingRecent" class="radio-recent-loading">
          <i class="pi pi-spin pi-spinner"></i> Memuat…
        </span>
      </div>

      <div v-if="!loadingRecent && recentRadiologi.length === 0" class="radio-recent-empty">
        <i class="pi pi-inbox"></i> Belum ada data
      </div>

      <div class="radio-recent-grid">
        <div
          v-for="item in recentRadiologi"
          :key="item.KODE || item.BARCODE"
          class="radio-recent-chip"
          @click="addRecentItem(item)"
          v-tooltip.bottom="'Klik untuk tambah ke permintaan'"
        >
          <div class="radio-recent-chip-name">{{ item.NAMABARANG || item.NAMA }}</div>
          <div v-if="item.HARGA > 0" class="radio-recent-chip-price">
            {{ formatCurrency(item.HARGA) }}
            <span class="radio-recent-chip-per">/ {{ item.SATUAN }}</span>
          </div>
          <div class="radio-recent-chip-footer">
            <span class="radio-recent-chip-satuan">{{ item.SATUAN }}</span>
            <span class="radio-recent-chip-count">
              <i class="pi pi-chart-bar"></i>{{ item.JML }}x
            </span>
          </div>
        </div>
      </div>
    </div>

    <DataTable
      :value="availableObat"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :scrollable="true"
      scrollHeight="380px"
      class="p-datatable-sm radio-list-table"
      :rowHover="true"
      :showGridlines="false"
      stripedRows
    >
      <template #empty>
        <div class="tbl-empty">
          <i class="pi pi-desktop"></i>
          <p>Ketik nama pemeriksaan dan tekan Cari</p>
        </div>
      </template>
      <template #loading>
        <div class="tbl-empty">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Memuat data…</p>
        </div>
      </template>

      <Column field="CAPTION" header="Nama Pemeriksaan" :sortable="true" style="min-width: 240px">
        <template #body="slotProps">
          <div class="item-name">{{ slotProps.data.CAPTION }}</div>
          <span v-if="slotProps.data.QUANTITY" class="item-qty-badge">
            {{ slotProps.data.QUANTITY }} tersedia
          </span>
        </template>
      </Column>

      <Column field="KATEGORI" header="Kategori" :sortable="true" style="min-width: 140px">
        <template #body="slotProps">
          <Tag :value="slotProps.data.KATEGORI" severity="info" class="text-xs" />
        </template>
      </Column>

      <Column
        field="HARGAJUAL"
        header="Harga"
        :sortable="true"
        dataType="numeric"
        style="min-width: 130px"
      >
        <template #body="slotProps">
          <span class="price-text">{{ formatCurrency(slotProps.data.HARGAJUAL) }}</span>
        </template>
      </Column>

      <Column style="width: 70px; text-align: center">
        <template #body="slotProps">
          <Button
            icon="pi pi-plus"
            rounded
            size="small"
            severity="success"
            @click="addItem(slotProps.data)"
            v-tooltip.left="'Tambah ke permintaan'"
          />
        </template>
      </Column>
    </DataTable>

    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        @click="listObat = false"
        severity="secondary"
        outlined
      />
    </template>
  </Dialog>

  <!-- ══════════════════════ Main Layout ═══════════════════════════════ -->
  <div class="radio-wrapper">
    <!-- ── Sidebar: Riwayat ── -->
    <div class="radio-sidebar">
      <div class="sidebar-hdr">
        <i class="pi pi-history sidebar-hdr-icon"></i>
        <span class="sidebar-hdr-title">Riwayat Radiologi</span>
        <Tag :value="String(riwayat_radiologi.length)" severity="secondary" class="sidebar-count" />
      </div>

      <div class="sidebar-list">
        <div v-if="riwayat_radiologi.length === 0" class="sidebar-empty">
          <i class="pi pi-inbox"></i>
          <p>Belum ada permintaan</p>
        </div>

        <div
          v-for="(data, index) in riwayat_radiologi"
          :key="index"
          class="resep-card"
          :class="data.TELAH_DIKIRIM == 1 ? 'resep-sent' : 'resep-pending'"
        >
          <div class="resep-card-top">
            <span class="resep-date">
              <i class="pi pi-calendar"></i>
              {{ data.SHORTDATE }}
            </span>
            <span class="resep-time">{{ data.JAM }}</span>
          </div>

          <div class="resep-status-row">
            <Tag v-if="data.TELAH_DIKIRIM == 1" severity="success" class="resep-tag">
              <i class="pi pi-check-circle"></i>&nbsp;Terkirim
            </Tag>
            <Tag v-else severity="danger" class="resep-tag">
              <i class="pi pi-hourglass"></i>&nbsp;Pending
            </Tag>
          </div>

          <div v-if="data.TELAH_DIKIRIM == 1" class="resep-sent-time">
            {{ data.TANGGAL_KIRIM }} {{ data.JAM_KIRIM }}
          </div>

          <div class="resep-actions">
            <Button
              icon="pi pi-eye"
              label="Lihat"
              size="small"
              text
              severity="info"
              class="resep-btn"
              @click="getHasil_pemeriksaan_radiologi(data.RECEIPT_NO)"
            />
            <Button
              v-if="data.TELAH_DIKIRIM == 0"
              icon="pi pi-send"
              label="Kirim"
              size="small"
              severity="success"
              class="resep-btn"
              @click="kirim_resep(data.RECEIPT_NO)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              class="resep-btn-del"
              @click="ConfirmVoidResep(data.RECEIPT_NO, index)"
              v-tooltip.right="'Batalkan permintaan'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Main Content ── -->
    <div class="radio-main">
      <!-- Toolbar -->
      <div class="radio-toolbar">
        <div class="toolbar-left">
          <i class="pi pi-desktop toolbar-icon"></i>
          <span class="toolbar-title">Item Pemeriksaan Radiologi</span>
          <Tag
            :value="`${selectedObatObatan.length} item`"
            severity="secondary"
            class="toolbar-count"
          />
        </div>
        <div class="toolbar-right">
          <Button
            icon="pi pi-search"
            label="Pilih Pemeriksaan"
            size="small"
            severity="success"
            @click="listObat = true"
          />
          <Button
            icon="pi pi-history"
            label="Histori"
            size="small"
            severity="info"
            outlined
            @click="showRadiologi = true"
          />
          <Button
            icon="pi pi-refresh"
            size="small"
            severity="secondary"
            text
            @click="get_riwayat"
            v-tooltip.bottom="'Refresh riwayat'"
          />
        </div>
      </div>

      <!-- Klinis & Catatan bar -->
      <div class="klinis-bar">
        <div class="klinis-field">
          <label class="klinis-label">
            <i class="pi pi-heart-fill"></i> Klinis <span class="required">*</span>
          </label>
          <InputText
            v-model="klinis"
            placeholder="Diagnosa klinis…"
            class="klinis-input"
            size="small"
          />
        </div>
        <div class="klinis-field">
          <label class="klinis-label"> <i class="pi pi-pencil"></i> Catatan </label>
          <InputText
            v-model="catatan"
            placeholder="Catatan tambahan…"
            class="klinis-input"
            size="small"
          />
        </div>
      </div>

      <!-- Table -->
      <DataTable
        :value="selectedObatObatan"
        :scrollable="true"
        scrollHeight="340px"
        class="p-datatable-sm radio-table"
        :rowHover="true"
        :showGridlines="false"
        stripedRows
      >
        <template #empty>
          <div class="tbl-empty">
            <i class="pi pi-desktop"></i>
            <p>Belum ada pemeriksaan dipilih</p>
            <Button
              label="Pilih Pemeriksaan"
              icon="pi pi-search"
              size="small"
              severity="success"
              @click="listObat = true"
            />
          </div>
        </template>
        <template #loading>
          <div class="tbl-empty">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Memuat data…</p>
          </div>
        </template>

        <Column field="BARCODE" header="Kode" style="width: 100px">
          <template #body="slotProps">
            <span class="barcode-text">{{ slotProps.data.BARCODE }}</span>
          </template>
        </Column>

        <Column field="NAMA" header="Nama Pemeriksaan" style="min-width: 200px">
          <template #body="slotProps">
            <span class="item-cell-name">{{ slotProps.data.NAMA }}</span>
          </template>
        </Column>

        <Column field="QTY" header="Qty" style="width: 130px">
          <template #body="slotProps">
            <InputNumber
              v-model="slotProps.data.QTY"
              class="qty-number"
              :min="1"
              showButtons
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              :inputStyle="{ width: '50px', textAlign: 'center', fontSize: '12px' }"
            />
          </template>
        </Column>

        <Column field="HARGA" header="Harga" style="width: 130px">
          <template #body="slotProps">
            <span class="price-text">{{ formatCurrency(slotProps.data.HARGA) }}</span>
          </template>
        </Column>

        <Column style="width: 48px; text-align: center">
          <template #body="slotProps">
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              size="small"
              @click.stop.prevent="confirmRemoveItemObat(slotProps.index)"
              v-tooltip.left="'Hapus item'"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Footer -->
      <div class="radio-footer">
        <div class="footer-info">
          <span class="footer-total-lbl">Total Item</span>
          <span class="footer-total-count">{{ selectedObatObatan.length }}</span>
        </div>
        <div class="footer-actions">
          <Button
            label="Hapus Semua"
            icon="pi pi-trash"
            size="small"
            severity="danger"
            outlined
            @click="clearAllItems"
            :disabled="selectedObatObatan.length === 0"
          />
          <Button
            label="Simpan Permintaan"
            icon="pi pi-save"
            size="small"
            severity="success"
            @click="saveItems"
            :disabled="selectedObatObatan.length === 0"
          />
        </div>
      </div>
    </div>
  </div>

  <HistoryRadiologiComponent v-model="showRadiologi" :datapasien="props.datapasien" />

  <!-- ══════════════════════ Drawer: Hasil Radiologi ════════════════════ -->
  <Drawer v-model:visible="hasilLab" :closable="true" position="bottom" style="height: 88vh">
    <template #header>
      <div class="hasil-drawer-hdr">
        <span class="hasil-drawer-title">
          <i class="pi pi-desktop"></i>
          Hasil Pemeriksaan Radiologi
        </span>
        <Tag :severity="progress == 'C' ? 'success' : 'warn'" class="hasil-status-tag">
          <i
            :class="progress == 'C' ? 'pi pi-check-circle' : 'pi pi-clock'"
            style="margin-right: 4px"
          ></i>
          {{ progress === 'C' ? 'Selesai' : 'Menunggu' }}
          <span v-if="jamSelesai">&nbsp;· {{ jamSelesai }}</span>
        </Tag>
      </div>
    </template>

    <div class="hasil-table-wrap">
      <table class="hasil-table">
        <thead>
          <tr>
            <th style="width: 20%">Pemeriksaan</th>
            <th>Hasil / Bacaan</th>
            <th style="width: 30%">Lampiran</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(hasil, index) in processedResults" :key="hasil.originalIndex || index">
            <td v-if="hasil.showCategory" :rowspan="hasil.categoryRowspan" class="merged-category">
              <span v-html="hasil.NAMA"></span>
            </td>
            <td><span v-html="hasil.HASIL_BACA"></span></td>
            <td>
              <div class="attachment-row">
                <Image
                  v-for="(image, idx) in hasil.attachment"
                  :key="idx"
                  :src="image.link_img"
                  alt="Lampiran"
                  width="180"
                  preview
                  class="attachment-img"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Drawer>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import HistoryRadiologiComponent from '@/views/Poliklinik/Penunjang/HistoryRadiologiComponent.vue'

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
const { id_client, id_lokasi, user_id } = storeToRefs(authStore)
const route = useRoute()
const confirm = useConfirm()
const toast = useToast()

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
const showRadiologi = ref(false)

const selectedObatObatan = ref([])
const availableObat = ref([])
const riwayat_radiologi = ref([])
const detils_obat = ref([])
const datafromCopyResep = ref(null)

watch(listObat, (val) => {
  if (val && recentRadiologi.value.length === 0) getRecentRadiologi()
})

const searchQuery = ref('')
const currentDateTime = ref('')
const progress = ref(null)
const jamSelesai = ref(null)
const RECEIPT_NO = ref(null)
const klinis = ref('null')
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

const hasil_pemeriksaan_radiologi = ref([])
const datalab_pasien = ref(null)
const catatan_kesan = ref(null)

const getHasil_pemeriksaan_radiologi = async (no_receipt) => {
  try {
    hasilLab.value = true
    loading.value = true

    const param = {
      id_client: id_client.value,
      no_receipt: no_receipt,
      barcode: '',
      mode: 1,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/get_detail_radiologi_v2`, param)

    console.log(response.data)
    if (response.data?.metadata?.code == '200') {
      hasil_pemeriksaan_radiologi.value = response.data.response || []

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

/* ── Sering Diminta (Radiologi) ───────────────────────── */
const recentRadiologi = ref([])
const loadingRecent = ref(false)

const getRecentRadiologi = async () => {
  try {
    loadingRecent.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/get_recent_obat_poly`, {
      mode: 'insert',
      id_client: id_client.value,
      kode_poli: props.datapasien?.KODERUANGAN || '',
      kategori: ['RADIOLOGI'],
      limit: '10',
    })
    if (response.data?.code === 200) {
      recentRadiologi.value = response.data.result || []
    }
  } catch (error) {
    console.error('Gagal memuat sering diminta radiologi:', error)
  } finally {
    loadingRecent.value = false
  }
}

const addRecentItem = (item) => {
  addItem({
    BARCODE: item.KODE || item.BARCODE,
    CAPTION: item.NAMABARANG || item.NAMA,
    NAMA: item.NAMABARANG || item.NAMA,
    SATUAN: item.SATUAN || '',
    HARGAJUAL: item.HARGA || 0,
    QUANTITY: 0,
    QTY: 1,
  })
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
  hasil_pemeriksaan_radiologi.value.forEach((item, index) => {
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
        showCategory: index === 0,
        categoryRowspan: categoryItems.length,
      })
    })
  })

  return results
})

// Toast functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
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
    summary: 'Perhatian',
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
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => removeItem(index),
  })
}

const ConfirmVoidResep = (RECEIPT_NO, index) => {
  confirm.require({
    message: `Anda ingin membatalkan permintaan "${RECEIPT_NO}"?`,
    header: 'Konfirmasi Batal',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Tidak',
    acceptLabel: 'Batalkan',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
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
    OBAT_OBATAN: 3,
    AS_PARENT: 0,
    SAT_RACIK: '',
    FLAG: 'NEW LINE',
    JENIS: item.JENIS,
    JENIS_RESEP: 'RT',
    ID_LOKASI: id_lokasi.value,
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
    if (searchQuery.value.length < 3) {
      availableObat.value = []
      return
    }
    const param = {
      barcode: barcode,
      mode: mode,
      lokasi: id_lokasi.value,
      id_client: id_client.value,
      breakdown: 1,
      nama: searchQuery.value,
      kategori: 'RADIOLOGI',
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
      jenisdata: 3,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/riwayatpenunjang`, param, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.data?.response) {
      riwayat_radiologi.value = response.data.response
      loading.value = false
    } else {
      riwayat_radiologi.value = []
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
    riwayat_radiologi.value.splice(index, 1)
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

  if (!klinis.value) {
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
      OBAT_OBATAN: 3,
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

  datafromCopyResep.value = plain

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
/* ═══════════════════════════════════════════════
   Layout utama
═══════════════════════════════════════════════ */
.radio-wrapper {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  min-height: 520px;
}

/* ── Sidebar ─────────────────────────────────── */
.radio-sidebar {
  width: 188px;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.sidebar-hdr {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;
}
.sidebar-hdr-icon {
  color: #64748b;
  font-size: 13px;
}
.sidebar-hdr-title {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  flex: 1;
}
.sidebar-count {
  font-size: 10px !important;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 8px;
  color: #94a3b8;
  font-size: 11px;
  text-align: center;
}
.sidebar-empty i {
  font-size: 22px;
}
.sidebar-empty p {
  margin: 0;
}

/* Riwayat card */
.resep-card {
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  padding: 8px 9px;
  background: #fff;
  transition: box-shadow 0.15s;
}
.resep-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.resep-sent {
  border-left: 3px solid #22c55e;
}
.resep-pending {
  border-left: 3px solid #f97316;
}

.resep-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.resep-date {
  font-size: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3px;
}
.resep-time {
  font-size: 10px;
  color: #94a3b8;
}

.resep-status-row {
  margin-bottom: 3px;
}
.resep-tag {
  font-size: 10px !important;
  padding: 2px 6px !important;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.resep-sent-time {
  font-size: 9px;
  color: #64748b;
  margin-bottom: 4px;
}
.resep-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.resep-btn {
  font-size: 10px !important;
  padding: 2px 6px !important;
  height: 24px !important;
}
.resep-btn-del {
  margin-left: auto;
}

/* ── Main ────────────────────────────────────── */
.radio-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

/* Toolbar */
.radio-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 8px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-icon {
  color: #64748b;
  font-size: 14px;
}
.toolbar-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}
.toolbar-count {
  font-size: 10px !important;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* Klinis bar */
.klinis-bar {
  display: flex;
  gap: 12px;
  padding: 8px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #fafcff;
  flex-wrap: wrap;
}
.klinis-field {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}
.klinis-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}
.klinis-input {
  flex: 1;
  font-size: 12px !important;
}
.required {
  color: #dc2626;
}

/* Table */
.radio-table {
  flex: 1;
}

.barcode-text {
  font-size: 10px;
  color: #64748b;
  font-family: monospace;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
}
.item-cell-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}
.price-text {
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
}

/* Footer */
.radio-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 8px;
}
.footer-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.footer-total-lbl {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
.footer-total-count {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Dialog: Cari Pemeriksaan ────────────────── */
.radio-dialog-search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.radio-search-wrap {
  display: inline-flex;
  align-items: center;
  position: relative;
  gap: 6px;
}
.search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
  z-index: 1;
}
.radio-search-input {
  padding-left: 32px !important;
  width: 380px;
  font-size: 13px;
  height: 36px;
}
.radio-search-btn {
  height: 36px;
}
.radio-found-tag {
  white-space: nowrap;
  flex-shrink: 0;
}

/* Table list pemeriksaan */
:deep(.radio-list-table .p-datatable-thead > tr > th) {
  background: #eef6ff;
  color: #3b6fa0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-bottom: 2px solid #bfdbfe;
  padding: 0.5rem 0.75rem;
}
:deep(.radio-list-table .p-datatable-tbody > tr) {
  background: #ffffff;
}
:deep(.radio-list-table .p-datatable-tbody > tr:nth-child(even)) {
  background: #f5f9ff;
}
:deep(.radio-list-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #e8f0fa;
  padding: 0.35rem 0.75rem;
  color: #334155;
}
:deep(.radio-list-table .p-datatable-tbody > tr:hover > td) {
  background: #dbeafe !important;
  transition: background 0.15s;
}
:deep(.radio-list-table .p-paginator) {
  background: #f0f7ff;
  border-top: 1px solid #bfdbfe;
  padding: 6px 10px;
}

.item-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}
.item-qty-badge {
  font-size: 10px;
  color: #d97706;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 1px 6px;
  border-radius: 3px;
  margin-left: 6px;
}

/* ── Drawer: Hasil ───────────────────────────── */
.hasil-drawer-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.hasil-drawer-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.hasil-status-tag {
  font-size: 12px !important;
  padding: 4px 10px !important;
}

.hasil-table-wrap {
  overflow-x: auto;
}
.hasil-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.hasil-table thead tr {
  background: #eef6ff;
}
.hasil-table th {
  padding: 8px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #3b6fa0;
  border-bottom: 2px solid #bfdbfe;
}
.hasil-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e8f0fa;
  vertical-align: top;
  color: #334155;
}
.hasil-table tbody tr:nth-child(even) {
  background: #f5f9ff;
}
.hasil-table tbody tr:hover td {
  background: #dbeafe;
}

.merged-category {
  vertical-align: middle !important;
  text-align: center !important;
  font-weight: 700;
  background: #f1f5f9 !important;
  color: #334155;
}

.attachment-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.attachment-img {
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

/* ── DataTable global ────────────────────────── */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.25rem 0.6rem;
  font-size: 12px;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.45rem 0.6rem;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #f8fafc;
  color: #475569;
}

/* ── Empty state ─────────────────────────────── */
.tbl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: #94a3b8;
  font-size: 13px;
}
.tbl-empty i {
  font-size: 28px;
}
.tbl-empty p {
  margin: 0;
}

/* ── Misc ────────────────────────────────────── */
.text-xs {
  font-size: 10px;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 768px) {
  .radio-wrapper {
    flex-direction: column;
  }
  .radio-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 180px;
  }
  .sidebar-list {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .resep-card {
    min-width: 160px;
  }
  .klinis-bar {
    flex-direction: column;
  }
  .radio-search-input {
    width: 240px;
  }
}

/* ── Sering Diminta ────────────────────────────────── */
.radio-recent-section {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 8px;
}
.radio-recent-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.radio-recent-hdr-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.radio-recent-hdr-left .pi-star-fill {
  color: #f59e0b;
  font-size: 13px;
}
.radio-recent-loading {
  font-size: 11px;
  color: #a16207;
  display: flex;
  align-items: center;
  gap: 4px;
}
.radio-recent-empty {
  font-size: 12px;
  color: #a16207;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
}
.radio-recent-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.radio-recent-chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  cursor: pointer;
  min-width: 130px;
  max-width: 200px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.radio-recent-chip:hover {
  background: #fef9c3;
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
  transform: translateY(-1px);
}
.radio-recent-chip:active {
  transform: translateY(0);
}
.radio-recent-chip-name {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}
.radio-recent-chip-price {
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
  margin-top: 2px;
}
.radio-recent-chip-per {
  font-size: 10px;
  font-weight: 400;
  color: #64748b;
}
.radio-recent-chip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.radio-recent-chip-satuan {
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
}
.radio-recent-chip-count {
  font-size: 10px;
  font-weight: 700;
  color: #d97706;
  display: flex;
  align-items: center;
  gap: 3px;
}
.radio-recent-chip-count .pi {
  font-size: 9px;
}
</style>
