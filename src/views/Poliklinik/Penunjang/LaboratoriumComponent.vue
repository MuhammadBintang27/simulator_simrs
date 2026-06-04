<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Toast />

  <!-- ══════════════════════ Dialog: Cari Item Lab ════════════════════ -->
  <Dialog
    v-model:visible="listObat"
    modal
    :style="{ width: '1100px', maxWidth: '96vw' }"
    :closable="false"
    class="lab-search-dialog"
  >
    <template #header>
      <div class="lab-dlg-header">
        <div class="lab-dlg-header__icon">
          <i class="pi pi-flask" style="font-size: 15px" />
        </div>
        <div>
          <div class="lab-dlg-header__title">Cari Item Pemeriksaan Laboratorium</div>
          <div class="lab-dlg-header__sub">Pilih item untuk ditambahkan ke permintaan</div>
        </div>
      </div>
    </template>

    <div class="lab-dialog-search">
      <span class="lab-search-wrap">
        <i class="pi pi-search lab-search-icon" />
        <InputText
          v-model="searchQuery"
          @input="get_item(11, '')"
          placeholder="Ketik nama pemeriksaan…"
          class="lab-search-input"
          autofocus
        />
      </span>
      <Tag
        :value="`${availableObat.length} item ditemukan`"
        severity="info"
        class="lab-found-tag"
      />
    </div>

    <!-- Sering Diminta -->
    <div v-if="searchQuery.length <= 2" class="lab-recent-section">
      <div class="lab-recent-hdr">
        <span class="lab-recent-hdr-left">
          <i class="pi pi-star-fill"></i>
          Sering Diminta di Poli Ini
        </span>
        <span v-if="loadingRecent" class="lab-recent-loading">
          <i class="pi pi-spin pi-spinner"></i> Memuat…
        </span>
      </div>
      <div v-if="!loadingRecent && recentLab.length === 0" class="lab-recent-empty">
        <i class="pi pi-inbox"></i> Belum ada data
      </div>
      <div class="lab-recent-grid">
        <div
          v-for="item in recentLab"
          :key="item.KODE || item.BARCODE"
          class="lab-recent-chip"
          @click="addRecentLabItem(item)"
          v-tooltip.bottom="'Klik untuk tambah ke permintaan'"
        >
          <div class="lab-recent-chip-name">{{ item.NAMABARANG || item.NAMA }}</div>
          <div v-if="item.HARGA > 0" class="lab-recent-chip-price">
            {{ formatCurrency(item.HARGA) }}
          </div>
          <div class="lab-recent-chip-footer">
            <span class="lab-recent-chip-satuan">{{ item.SATUAN }}</span>
            <span class="lab-recent-chip-count">
              <i class="pi pi-chart-bar"></i>{{ item.JML }}x
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lab-table-container">
      <DataTable
        :value="availableObat"
        :paginator="true"
        :rows="8"
        :rowsPerPageOptions="[5, 8, 20]"
        class="p-datatable-sm lab-list-table"
        :rowHover="true"
        :showGridlines="false"
        tableStyle="width: 100%; table-layout: fixed"
        stripedRows
      >
        <template #empty>
          <div class="lab-tbl-empty">
            <i class="pi pi-flask"></i>
            <p>Ketik nama pemeriksaan untuk mencari</p>
          </div>
        </template>

        <Column field="CAPTION" header="Nama Pemeriksaan" sortable style="width: 55%">
          <template #body="slotProps">
            <div class="lab-item-caption">{{ slotProps.data.CAPTION }}</div>
            <span v-if="slotProps.data.QUANTITY" class="lab-qty-badge">
              {{ slotProps.data.QUANTITY }} tersedia
            </span>
          </template>
        </Column>

        <Column field="KATEGORI" header="Kategori" sortable style="width: 20%">
          <template #body="slotProps">
            <Tag :value="slotProps.data.KATEGORI" severity="info" class="text-xs" />
          </template>
        </Column>

        <Column field="HARGAJUAL" header="Harga" sortable dataType="numeric" style="width: 18%">
          <template #body="slotProps">
            <span class="lab-price-text">{{ formatCurrency(slotProps.data.HARGAJUAL) }}</span>
          </template>
        </Column>

        <Column style="width: 7%; text-align: center">
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
    </div>

    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        severity="secondary"
        outlined
        size="small"
        @click="listObat = false"
      />
    </template>
  </Dialog>

  <!-- ══════════════════════ Main Layout ═══════════════════════════════ -->
  <div class="lab-wrapper">
    <!-- ── Sidebar: Riwayat ── -->
    <div class="lab-sidebar">
      <div class="sidebar-hdr">
        <i class="pi pi-history sidebar-hdr-icon"></i>
        <span class="sidebar-hdr-title">Riwayat Lab</span>
        <Tag :value="String(riwayat_obat.length)" severity="secondary" class="sidebar-count" />
      </div>

      <div class="sidebar-list">
        <div v-if="riwayat_obat.length === 0" class="sidebar-empty">
          <i class="pi pi-inbox"></i>
          <p>Belum ada permintaan</p>
        </div>

        <div
          v-for="(data, index) in riwayat_obat"
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
              @click="getHasil_pemeriksaan_lab(data.RECEIPT_NO)"
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
    <div class="lab-main">
      <!-- Toolbar -->
      <div class="lab-toolbar">
        <div class="toolbar-left">
          <i class="pi pi-flask toolbar-icon"></i>
          <span class="toolbar-title">Item Pemeriksaan Laboratorium</span>
          <Tag
            :value="`${selectedObatObatan.length} item`"
            severity="secondary"
            class="toolbar-count"
          />
        </div>
        <div class="toolbar-right">
          <Button
            icon="pi pi-plus"
            label="Pilih Item"
            size="small"
            severity="success"
            @click="listObat = true"
          />
          <Button
            icon="pi pi-refresh"
            size="small"
            text
            severity="secondary"
            @click="get_riwayat"
            v-tooltip="'Refresh riwayat'"
          />
        </div>
      </div>

      <!-- Klinis Bar -->
      <div class="lab-klinis-bar">
        <div class="klinis-field">
          <label class="klinis-label">Klinis</label>
          <InputText
            v-model="klinis"
            size="small"
            placeholder="Diagnosa klinis…"
            class="klinis-input"
          />
        </div>
        <div class="klinis-field">
          <label class="klinis-label">Catatan</label>
          <InputText
            v-model="catatan"
            size="small"
            placeholder="Catatan tambahan…"
            class="klinis-input"
          />
        </div>
      </div>

      <!-- Selected Items Table -->
      <div class="lab-table-wrap">
        <DataTable
          :value="selectedObatObatan"
          scrollable
          scrollHeight="380px"
          class="lab-selected-table"
          :rowHover="true"
        >
          <template #empty>
            <div class="lab-selected-empty">
              <i class="pi pi-flask" style="font-size: 2rem; color: var(--surface-300)" />
              <p>Belum ada item pemeriksaan yang dipilih.</p>
            </div>
          </template>

          <Column header="No" style="width: 44px; text-align: center">
            <template #body="{ index }">
              <span class="lab-seq">{{ index + 1 }}</span>
            </template>
          </Column>

          <Column field="NAMA" header="Nama Pemeriksaan">
            <template #body="{ data }">
              <div class="lab-sel-name">{{ data.NAMA }}</div>
            </template>
          </Column>

          <Column field="QTY" header="Qty" style="width: 130px">
            <template #body="slotProps">
              <InputNumber
                v-model="slotProps.data.QTY"
                :min="1"
                showButtons
                buttonLayout="horizontal"
                decrementButtonClass="p-button-secondary"
                incrementButtonClass="p-button-secondary"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                :inputStyle="{ textAlign: 'center', fontSize: '12px', padding: '4px 6px' }"
              />
            </template>
          </Column>

          <Column style="width: 48px; text-align: center">
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                size="small"
                @click.stop.prevent="confirmRemoveItemObat(slotProps.index)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Footer -->
      <div class="lab-footer">
        <span class="lab-footer-info">
          <i class="pi pi-list"></i>
          {{ selectedObatObatan.length }} item dipilih
        </span>
        <div class="lab-footer-actions">
          <Button
            label="Histori"
            icon="pi pi-history"
            text
            size="small"
            severity="secondary"
            @click="showHistoryTeraphy = true"
          />
          <Button
            label="Hapus Semua"
            icon="pi pi-trash"
            outlined
            size="small"
            severity="danger"
            @click="clearAllItems"
            :disabled="selectedObatObatan.length === 0"
          />
          <Button
            label="Simpan"
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

  <!-- ══════════════════════ Dialog: Hasil Lab ════════════════════════ -->
  <Dialog
    v-model:visible="hasilLab"
    modal
    :style="{ width: '1100px', maxWidth: '96vw' }"
    class="lab-hasil-dialog"
  >
    <template #header>
      <div class="lab-drawer-hdr">
        <div class="lab-drawer-hdr__icon">
          <i class="pi pi-chart-bar" style="font-size: 14px" />
        </div>
        <div>
          <div class="lab-drawer-hdr__title">Hasil Pemeriksaan Laboratorium</div>
          <div class="lab-drawer-hdr__sub">Hasil & nilai referensi pemeriksaan pasien</div>
        </div>
        <Tag
          :severity="progress == 'C' ? 'success' : 'warn'"
          :value="progress === 'C' ? `Selesai: ${jamSelesai}` : 'Menunggu'"
          class="ml-auto"
        />
      </div>
    </template>

    <!-- Patient Banner -->
    <div v-if="datalab_pasien" class="lab-patient-banner">
      <div class="lab-patient-avatar">
        {{ datalab_pasien?.NAMA?.charAt(0) || 'P' }}
      </div>
      <div class="lab-patient-info">
        <div class="lab-patient-name">{{ datalab_pasien?.NAMA }}</div>
        <div class="lab-patient-meta">
          <span class="lab-chip">{{ datalab_pasien?.JENISKELAMIN }}</span>
          <span class="lab-chip">{{ datalab_pasien?.USIA }} Tahun</span>
          <span class="lab-chip">Klinis: {{ datalab_pasien?.KLINIS || '—' }}</span>
        </div>
      </div>
      <div class="lab-patient-auth">
        <div class="lab-patient-auth__label">Otorisasi</div>
        <div class="lab-patient-auth__val">
          <span v-if="datalab_pasien?.IS_VERIFIED == 0" style="color: #dc2626">Belum</span>
          <span v-else style="color: #059669">{{ datalab_pasien?.PETUGAS_OTENTIKASI }}</span>
        </div>
        <div class="lab-patient-auth__date">
          {{ formatDateTimeIndonesiaFromDate(datalab_pasien?.DATE_VERIFIED) }}
        </div>
      </div>
      <div v-if="catatan_kesan" class="lab-patient-kesan">
        <span class="lab-patient-kesan__label">Catatan/Kesan:</span>
        {{ catatan_kesan }}
      </div>
    </div>

    <!-- Results Table -->
    <div class="lab-hasil-wrap">
      <table class="lab-hasil-table">
        <thead>
          <tr>
            <th>Pemeriksaan</th>
            <th>Item</th>
            <th>Hasil</th>
            <th>Nilai Normal</th>
            <th>Satuan</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(hasil, index) in processedResults" :key="hasil.originalIndex || index">
            <td
              v-if="hasil.showCategory"
              :rowspan="hasil.categoryRowspan"
              class="lab-hasil-category"
            >
              {{ hasil.NAMA }}
            </td>
            <td>{{ hasil.PEMERIKSAAN }}</td>
            <td>
              <span
                :class="hasil.HASIL_TIDAK_NORMAL == 1 ? 'lab-hasil-abnormal' : 'lab-hasil-normal'"
              >
                {{ hasil.HASIL }}
              </span>
            </td>
            <td class="lab-hasil-ref">{{ hasil.NORMAL }}</td>
            <td>{{ hasil.SATUAN }}</td>
            <td>{{ hasil.KET_HASIL }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        severity="secondary"
        outlined
        size="small"
        @click="hasilLab = false"
      />
    </template>
  </Dialog>

  <HIstoryTeraphy v-model:showHistoryTeraphy="showHistoryTeraphy" @sendData="getDataHistori" />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import HIstoryTeraphy from '@/components/PoliklinikComponent/HIstoryTeraphy.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

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

const hasil_pemeriksaan_lab = ref([])
const datalab_pasien = ref(null)
const catatan_kesan = ref(null)

/* ── Sering Diminta (Laboratorium) ───────────────────── */
const recentLab = ref([])
const loadingRecent = ref(false)

const getTodayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const getRecentLab = async () => {
  const kodePoli = props.datapasien?.KDPOLY || props.datapasien?.KODERUANGAN || 'UNKNOWN'
  const RECENT_LAB_KEY = `recent_lab_poly_${kodePoli}`
  const RECENT_LAB_DATE_KEY = `recent_lab_poly_date_${kodePoli}`

  try {
    loadingRecent.value = true
    const today = getTodayStr()
    const savedDate = localStorage.getItem(RECENT_LAB_DATE_KEY)

    if (savedDate === today) {
      const cached = localStorage.getItem(RECENT_LAB_KEY)
      if (cached) {
        recentLab.value = JSON.parse(cached)
        return
      }
    }

    localStorage.removeItem(RECENT_LAB_KEY)
    localStorage.removeItem(RECENT_LAB_DATE_KEY)

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/get_recent_lab_poly`,
      {
        mode: 'insert',
        id_client: id_client.value,
        kode_poli: kodePoli,
        limit: '10',
      },
    )
    if (response.data?.code === 200) {
      recentLab.value = response.data.result || []
      localStorage.setItem(RECENT_LAB_KEY, JSON.stringify(recentLab.value))
      localStorage.setItem(RECENT_LAB_DATE_KEY, today)
    }
  } catch (error) {
    console.error('Gagal memuat sering diminta lab:', error)
  } finally {
    loadingRecent.value = false
  }
}

const addRecentLabItem = (item) => {
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

watch(listObat, (val) => {
  if (val && recentLab.value.length === 0) getRecentLab()
})

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

const formatDateTimeIndonesiaFromDate = (date) => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

const processedResults = computed(() => {
  const results = []
  const categoryGroups = {}
  hasil_pemeriksaan_lab.value.forEach((item, index) => {
    const category = item.NAMA
    if (!categoryGroups[category]) categoryGroups[category] = []
    categoryGroups[category].push({ ...item, originalIndex: index })
  })
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
  toast.add({ severity: 'success', summary: 'Success Message', detail: message, life: 3000 })
}
const showError = (message = 'An error occurred') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}
const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Warning', detail: message, life: 4000 })
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

const ConfirmVoidResep = (receipt, index) => {
  confirm.require({
    message: `Anda ingin menghapus resep "${receipt}"?`,
    header: 'Konfirmasi hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => RemoveResep(receipt, index),
  })
}

// Item management
const addItem = async (item) => {
  currentDateTime.value = formatDateTime()
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
    if (searchQuery.value.length < 3) return
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
    } else {
      riwayat_obat.value = []
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat riwayat pemeriksaan')
  } finally {
    loading.value = false
  }
}

const getHasil_pemeriksaan_lab = async (no_receipt) => {
  try {
    hasilLab.value = true
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/sales/get_item_lab_master_detail/${no_receipt}/${id_client.value}`,
    )
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

const kirim_resep = async (rcpt_no) => {
  loading.value = true
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/kirim_resep/${id_client.value}`, {
      RECEIPT_NO: rcpt_no,
    })
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

const RemoveResep = async (receipt, index) => {
  const url = configStore.apiApotikUrl
  const paramUrl = `${receipt}/${id_client.value}/${0}`
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
    detils_obat.value = response.data.response
    if (response.data.response) {
      jamSelesai.value = response.data.response[0].SELESAI
      progress.value = response.data.response[0].STATUS_PROGRESS
    }
    hasilLab.value = true
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
.lab-wrapper {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  min-height: 520px;
}

/* ── Sidebar ─────────────────────────────────── */
.lab-sidebar {
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

/* ── Main Content ────────────────────────────── */
.lab-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

/* Toolbar */
.lab-toolbar {
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
.lab-klinis-bar {
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
}
.klinis-input {
  flex: 1;
  font-size: 12px !important;
}

/* Selected items table */
.lab-table-wrap {
  flex: 1;
  overflow: hidden;
}
.lab-selected-table {
  height: 100%;
}
.lab-selected-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  color: #94a3b8;
  font-size: 13px;
}
.lab-selected-empty p {
  margin: 0;
}
.lab-seq {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #e2e8f0;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: #475569;
}
.lab-sel-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}

/* Footer */
.lab-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 8px;
}
.lab-footer-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}
.lab-footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Dialog: Cari Item Lab ───────────────────── */
.lab-dlg-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lab-dlg-header__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.lab-dlg-header__title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.lab-dlg-header__sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

.lab-dialog-search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.lab-search-wrap {
  display: inline-flex;
  align-items: center;
  position: relative;
  flex: 1;
}
.lab-search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
  z-index: 1;
}
.lab-search-input {
  padding-left: 32px !important;
  width: 100%;
  font-size: 13px;
  height: 36px;
}
.lab-found-tag {
  white-space: nowrap;
  flex-shrink: 0;
}

/* Search list table */
:deep(.lab-list-table .p-datatable-thead > tr > th) {
  background: #eef6ff;
  color: #3b6fa0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-bottom: 2px solid #bfdbfe;
  padding: 0.5rem 0.75rem;
}
:deep(.lab-list-table .p-datatable-tbody > tr) {
  background: #ffffff;
}
:deep(.lab-list-table .p-datatable-tbody > tr:nth-child(even)) {
  background: #f5f9ff;
}
:deep(.lab-list-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #e8f0fa;
  padding: 0.35rem 0.75rem;
  color: #334155;
}
:deep(.lab-list-table .p-datatable-tbody > tr:hover > td) {
  background: #dbeafe !important;
  transition: background 0.15s;
}
:deep(.lab-list-table .p-paginator) {
  background: #f0f7ff;
  border-top: 1px solid #bfdbfe;
  padding: 6px 10px;
}

.lab-item-caption {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.lab-table-container {
  width: 100%;
  overflow: hidden;
}
.lab-qty-badge {
  font-size: 10px;
  color: #d97706;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 1px 6px;
  border-radius: 3px;
  margin-left: 6px;
}
.lab-price-text {
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
}
.lab-table-container {
  width: 100%;
  overflow-x: auto;
}

.lab-tbl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: #94a3b8;
  font-size: 13px;
}
.lab-tbl-empty i {
  font-size: 28px;
}
.lab-tbl-empty p {
  margin: 0;
}

/* ── Drawer: Hasil Lab ───────────────────────── */
.lab-drawer-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  width: 100%;
}
.lab-drawer-hdr__icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.lab-drawer-hdr__title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.lab-drawer-hdr__sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

/* Patient banner */
.lab-patient-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.lab-patient-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.lab-patient-info {
  flex: 1;
  min-width: 0;
}
.lab-patient-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}
.lab-patient-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.lab-chip {
  font-size: 10px;
  background: #fff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}
.lab-patient-auth {
  text-align: right;
  flex-shrink: 0;
}
.lab-patient-auth__label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
}
.lab-patient-auth__val {
  font-size: 12px;
  font-weight: 600;
}
.lab-patient-auth__date {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}
.lab-patient-kesan {
  width: 100%;
  font-size: 12px;
  color: #334155;
  background: #fff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 6px 10px;
  margin-top: 4px;
}
.lab-patient-kesan__label {
  font-weight: 600;
  color: #0369a1;
  margin-right: 4px;
}

/* Results table */
.lab-hasil-wrap {
  overflow-x: auto;
}
.lab-hasil-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.lab-hasil-table thead tr {
  background: #eef6ff;
}
.lab-hasil-table th {
  padding: 8px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #3b6fa0;
  border-bottom: 2px solid #bfdbfe;
}
.lab-hasil-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e8f0fa;
  vertical-align: middle;
  color: #334155;
}
.lab-hasil-table tbody tr:nth-child(even) {
  background: #f5f9ff;
}
.lab-hasil-table tbody tr:hover td {
  background: #dbeafe;
}
.lab-hasil-category {
  vertical-align: middle !important;
  text-align: center !important;
  font-weight: 700;
  background: #f1f5f9 !important;
  color: #334155;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.lab-hasil-abnormal {
  color: #dc2626;
  font-weight: 700;
}
.lab-hasil-normal {
  color: #334155;
}
.lab-hasil-ref {
  color: #64748b;
  font-size: 11px;
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

/* ── Sering Diminta ──────────────────────────── */
.lab-recent-section {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 8px;
}
.lab-recent-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.lab-recent-hdr-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.lab-recent-hdr-left .pi-star-fill {
  color: #f59e0b;
  font-size: 13px;
}
.lab-recent-loading {
  font-size: 11px;
  color: #a16207;
  display: flex;
  align-items: center;
  gap: 4px;
}
.lab-recent-empty {
  font-size: 12px;
  color: #a16207;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
}
.lab-recent-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.lab-recent-chip {
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
.lab-recent-chip:hover {
  background: #fef9c3;
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
  transform: translateY(-1px);
}
.lab-recent-chip:active {
  transform: translateY(0);
}
.lab-recent-chip-name {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}
.lab-recent-chip-price {
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
  margin-top: 2px;
}
.lab-recent-chip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.lab-recent-chip-satuan {
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
}
.lab-recent-chip-count {
  font-size: 10px;
  font-weight: 700;
  color: #d97706;
  display: flex;
  align-items: center;
  gap: 3px;
}
.lab-recent-chip-count .pi {
  font-size: 9px;
}

/* ── Misc ────────────────────────────────────── */
.round-button2 {
  border-radius: 6px;
}
.text-xs {
  font-size: 10px;
}
.ml-auto {
  margin-left: auto;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 768px) {
  .lab-wrapper {
    flex-direction: column;
  }
  .lab-sidebar {
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
  .lab-klinis-bar {
    flex-direction: column;
  }
  .lab-search-input {
    width: 100%;
  }
}
</style>
