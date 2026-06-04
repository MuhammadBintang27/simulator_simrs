<template>
  <Toast />

  <Panel>
    <template #header>
      <div class="tindakan-header">
        <div class="tindakan-header-title">
          <!-- <i class="pi pi-heart-fill me-2" style="color: var(--p-primary-500)"></i> -->
          <span>Tindakan / Prosedur Medis</span>
          <Tag
            v-if="procedureList.length > 0"
            :value="`${procedureList.length} prosedur`"
            severity="info"
            class="ms-2"
          />
        </div>
        <Button
          icon="pi pi-plus"
          label="Tambah Prosedur"
          size="small"
          severity="success"
          :disabled="!canAddProcedure"
          :loading="loadingAddTindakan"
          @click="handleAddProcedure"
        />
      </div>
    </template>

    <!-- FORM INPUT -->
    <div class="tindakan-form">
      <div class="tindakan-form-row">
        <div class="tindakan-field tindakan-field-select">
          <label class="tindakan-label">
            Pilih Prosedur
            <span v-if="availableProcedures.length > 0" class="tindakan-count">
              ({{ availableProcedures.length }} ditemukan)
            </span>
          </label>
          <Select
            v-model="selectedProcedure"
            :options="availableProcedures"
            filter
            optionLabel="CAPTION"
            placeholder="Ketik nama prosedur..."
            class="w-100"
            :loading="loadingProcedures"
            @filter="searchProcedures"
            :filterFields="['CAPTION', 'KATEGORI']"
          >
            <template #option="{ option }">
              <div class="tindakan-option">
                <div class="tindakan-option-name">{{ option.CAPTION }}</div>
                <div class="tindakan-option-meta">
                  <Tag :value="option.KATEGORI" severity="success" style="font-size: 10px" />
                  <span v-if="option.HARGA_JUAL_JASA" class="tindakan-option-price">
                    {{ formatCurrency(option.HARGA_JUAL_JASA) }}
                  </span>
                </div>
              </div>
            </template>
            <template #empty>
              <div class="tindakan-empty-search">
                <i class="pi pi-search"></i>
                <span>{{
                  searchQuery.length < 2 ? 'Ketik minimal 2 karakter' : 'Prosedur tidak ditemukan'
                }}</span>
              </div>
            </template>
          </Select>
        </div>

        <div class="tindakan-field tindakan-field-desc">
          <label class="tindakan-label">Keterangan <span class="required">*</span></label>
          <Textarea
            v-model="procedureDescription"
            placeholder="Tuliskan keterangan tindakan..."
            rows="2"
            class="w-100"
            :disabled="!selectedProcedure"
            :class="{ 'p-invalid': showValidationErrors && !procedureDescription.trim() }"
          />
          <small v-if="showValidationErrors && !procedureDescription.trim()" class="p-error">
            Keterangan wajib diisi
          </small>
        </div>

        <div class="tindakan-field tindakan-field-qty">
          <label class="tindakan-label">Jumlah</label>
          <InputNumber
            v-model="QuantityTIndakan"
            mode="decimal"
            showButtons
            :min="1"
            :max="100"
            class="w-100"
          />
        </div>
      </div>
    </div>

    <!-- ── Sering Digunakan di Poli Ini ── -->
    <div v-if="recentTindakan.length > 0 || loadingRecentTindakan" class="recent-tindakan-section">
      <div class="recent-tindakan-hdr">
        <span class="recent-tindakan-hdr-left">
          <i class="pi pi-star-fill"></i>
          Tindakan/Administrasi Sering Dilakukan di Poli Ini
        </span>
        <div class="recent-tindakan-hdr-right">
          <span v-if="loadingRecentTindakan" class="recent-tindakan-loading">
            <i class="pi pi-spin pi-spinner"></i> Memuat…
          </span>
          <Button
            v-else
            icon="pi pi-refresh"
            text
            rounded
            size="small"
            severity="secondary"
            v-tooltip.left="'Perbarui daftar'"
            @click="refreshRecentTindakan"
          />
        </div>
      </div>
      <div class="recent-tindakan-grid">
        <div
          v-for="item in recentTindakan"
          :key="item.BARCODE"
          class="recent-tindakan-chip"
          @click="addRecentTindakan(item)"
          v-tooltip.bottom="'Klik untuk tambah prosedur'"
        >
          <div class="recent-tindakan-chip-name">{{ item.NAMABARANG }}</div>
          <div class="recent-tindakan-chip-price" v-if="item.HARGA > 0">
            {{ formatCurrency(item.HARGA) }}
          </div>
        </div>
      </div>
    </div>

    <Divider />

    <!-- DAFTAR PROSEDUR -->
    <div v-if="procedureList.length > 0">
      <div class="tindakan-list-header">
        <span class="fw-semibold">Daftar Prosedur yang Dilakukan</span>
        <Button
          icon="pi pi-refresh"
          text
          size="small"
          severity="secondary"
          :loading="loadingRefresh"
          v-tooltip.top="'Muat ulang'"
          @click="refreshProcedureList"
        />
      </div>
      <div class="tindakan-list">
        <div
          v-for="(procedure, index) in procedureList"
          :key="`procedure-${index}`"
          class="tindakan-item"
          :class="{ 'tindakan-item-signed': procedure.isSigned }"
        >
          <div class="tindakan-item-head">
            <div class="tindakan-item-info">
              <span class="tindakan-item-name">
                {{ procedure.tindakan.CAPTION || procedure.tindakan }}
              </span>
              <Tag
                v-if="procedure.tindakan.KATEGORI"
                :value="procedure.tindakan.KATEGORI"
                severity="success"
                style="font-size: 10px"
              />
              <Tag
                v-if="procedure.isSigned"
                :value="`Ditandatangani: ${procedure.AUTH_BY}`"
                severity="info"
                style="font-size: 10px"
              />
            </div>
            <div class="tindakan-item-actions">
              <small v-if="procedure.timestamp" class="tindakan-item-time">
                {{ formatTimestamp(procedure.timestamp) }}
              </small>
              <Button
                icon="pi pi-trash"
                text
                severity="danger"
                size="small"
                v-tooltip.left="'Hapus prosedur'"
                :disabled="procedure.isRemoving"
                @click="confirmRemoveProcedure(index)"
              />
            </div>
          </div>
          <div class="tindakan-item-body">
            <Textarea
              v-model="procedure.description"
              placeholder="Keterangan prosedur..."
              rows="2"
              :autoResize="true"
              class="w-100"
              :disabled="procedure.isUpdating || procedure.isSigned"
            />
            <div class="tindakan-item-btns">
              <Button
                icon="pi pi-check"
                label="Simpan Keterangan"
                text
                size="small"
                severity="success"
                :disabled="
                  !procedure.description?.trim() || procedure.isUpdating || procedure.isSigned
                "
                :loading="procedure.isUpdating"
                @click="updateProcedureDescription(index)"
              />
              <Button
                icon="pi pi-file-edit"
                label="Tandatangan"
                text
                size="small"
                severity="info"
                :disabled="procedure.isSigned || procedure.isUpdating"
                @click="signProcedure(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else class="tindakan-empty">
      <i class="pi pi-inbox"></i>
      <p>Belum ada prosedur yang ditambahkan</p>
      <small>Pilih prosedur dan isi keterangan untuk memulai</small>
    </div>
  </Panel>

  <ttdUser
    v-model:showFormOtorisasi="showDialog"
    :noregister="receipt_no"
    :mode="8"
    @otpVerified="handleOtpSuccess"
  />
  <ConfirmDialog />
</template>

<script setup>
import { ref, computed, onMounted, unref, toRaw, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import { useConfirm } from 'primevue/useconfirm'

const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const confirm = useConfirm()
const route = useRoute()
const { id_client, user_id, id_lokasi } = storeToRefs(authStore)

const showDialog = ref(false)

const props = defineProps({
  datapasien: { type: Object, required: true, validator: (v) => v && typeof v === 'object' },
})

const loadingPertindakan = ref(false)
const selectedProcedure = ref(null)
const procedureDescription = ref('-')
const procedureList = ref([])
const availableProcedures = ref([])
const searchQuery = ref('')
const receipt_no = ref('')
const QuantityTIndakan = ref(1)
const loadingAddTindakan = ref(false)
const loadingProcedures = ref(false)
const loadingRefresh = ref(false)
const showValidationErrors = ref(false)

const recentTindakan = ref([])
const loadingRecentTindakan = ref(false)

const getTodayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const getRecentTindakan = async () => {
  const kodePoli = props.datapasien?.KODERUANGAN || 'UNKNOWN'
  const KEY = `recent_tindakan_poly_${kodePoli}`
  const DATE_KEY = `recent_tindakan_poly_date_${kodePoli}`
  try {
    loadingRecentTindakan.value = true
    const today = getTodayStr()
    const savedDate = localStorage.getItem(DATE_KEY)
    if (savedDate === today) {
      const cached = localStorage.getItem(KEY)
      if (cached) {
        recentTindakan.value = JSON.parse(cached)
        return
      }
    }
    localStorage.removeItem(KEY)
    localStorage.removeItem(DATE_KEY)
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/data_referensi/get_recent_tindakan_poly`,
      {
        id_client: id_client.value,
        kategori: ['TENAGA AHLI', 'KEPERAWATAN'],
        kode_poli: kodePoli,
        limit: '20',
      },
    )
    if (res.data?.code === 200) {
      recentTindakan.value = res.data.result || []
      localStorage.setItem(KEY, JSON.stringify(recentTindakan.value))
      localStorage.setItem(DATE_KEY, today)
    }
  } catch (error) {
    console.error('Gagal memuat recent tindakan:', error)
  } finally {
    loadingRecentTindakan.value = false
  }
}

const refreshRecentTindakan = () => {
  const kodePoli = props.datapasien?.KODERUANGAN || 'UNKNOWN'
  localStorage.removeItem(`recent_tindakan_poly_${kodePoli}`)
  localStorage.removeItem(`recent_tindakan_poly_date_${kodePoli}`)
  recentTindakan.value = []
  getRecentTindakan()
}

const addRecentTindakan = async (item) => {
  selectedProcedure.value = {
    BARCODE: item.BARCODE,
    IDBARANG: item.BARCODE,
    CAPTION: item.NAMABARANG,
    NAMA: item.NAMABARANG,
    HARGA_JUAL_JASA: item.HARGA || 0,
    SATUAN: item.SATUAN,
    ID_LOKASI: id_lokasi.value,
    KATEGORI: 'Tindakan',
  }
  procedureDescription.value = '-'
  await handleAddProcedure()
}

const canAddProcedure = computed(
  () => selectedProcedure.value && procedureDescription.value.trim() && !loadingAddTindakan.value,
)

const formatDate = (date = new Date()) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)

const formatTimestamp = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const showSuccess = (msg = 'Berhasil') =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg = 'Terjadi kesalahan') =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })
const showWarning = (msg) =>
  toast.add({ severity: 'warn', summary: 'Perhatian', detail: msg, life: 4000 })

const searchProcedures = async (event) => {
  try {
    const query = event.value
    searchQuery.value = query
    if (!query || query.length < 2) {
      availableProcedures.value = []
      return
    }
    loadingProcedures.value = true
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/barang/getdatabarang_v31`,
      {
        barcode: '',
        mode: 17,
        id_client: id_client.value,
        breakdown: 0,
        nama: query,
        lokasi: id_lokasi.value,
      },
    )
    availableProcedures.value = res.data?.response ?? []
  } catch {
    showError('Gagal mencari prosedur')
    availableProcedures.value = []
  } finally {
    loadingProcedures.value = false
  }
}

const handleAddProcedure = async () => {
  showValidationErrors.value = true
  if (!canAddProcedure.value) {
    showWarning('Pilih prosedur dan isi keterangan terlebih dahulu')
    return
  }
  const exists = procedureList.value.some(
    (i) => (i.tindakan?.CAPTION || i.tindakan) === selectedProcedure.value.CAPTION,
  )
  if (exists) {
    showError('Prosedur ini sudah ditambahkan')
    return
  }
  await addProcedure()
}

const addProcedure = async () => {
  try {
    const tindakan = unref(selectedProcedure)
    const pasien = toRaw(unref(props.datapasien))
    const desc = unref(procedureDescription)
    const qty = unref(QuantityTIndakan)
    loadingAddTindakan.value = true
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/insert_sales_v2`,
      {
        metadata: 'request',
        header: {
          MODE: 'REG',
          RECEIPT_NO: '',
          SALESNO: '0',
          JML_RACIK: 0,
          BENTUK_RACIK: '',
          NOTE: '-',
          TAXAMOUNT: 0,
          TOTALBAYAR: 0,
          POTONGAN: 0,
          TAXPERCENT: 0,
          SUBTOTAL: 0,
          KEMBALIAN: 0,
          RESV_ID: 0,
          SERVER_NAME: '-',
          NO_REGISTER: pasien.NOPENDAFTARAN,
          MEMBERSHIP_ID: pasien.NOMR,
          IDPAYEMENT: 0,
          IDCLIENT: id_client.value,
          ID_LOKASI: tindakan.ID_LOKASI,
          POLI_RUANG: pasien.POLI,
          DPJP: pasien.NAMADOKTER,
          TANGGAL: formatDate(),
          IDUSER: user_id.value,
          STATUS_PROGRESS: 'C',
          TGL_SELESAI: formatDate(),
          OBAT_OBATAN: 4,
          SERVER_ID: '',
          details: [
            {
              BARCODE: tindakan.BARCODE,
              ID_BARANG: tindakan.IDBARANG,
              NAMA: tindakan.NAMA,
              MEREK: '',
              AS_PARENT: 1,
              ITEMSEQNO: 0,
              HARGA: tindakan.HARGA_JUAL_JASA,
              SATUAN: tindakan.SATUAN,
              DISCOUNT: 0,
              REMARK_ITEM: desc,
              POTONGSTOCK: 0,
              TANGGAL_TRANS: formatDate(),
              FLAG: 'NEW LINE',
              TOTALAMOUNT: 0,
              STATUS_PROGRESS: 'C',
              SUBITEMSEQNO: 0,
              ID_LOKASI: tindakan.ID_LOKASI,
              JENIS: 'TINDAKAN',
              NOTE: '',
              QTY: qty,
            },
          ],
        },
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    if (res.data?.metadata?.code == 200) {
      showSuccess('Prosedur berhasil ditambahkan')
      selectedProcedure.value = null
      procedureDescription.value = '-'
      QuantityTIndakan.value = 1
      showValidationErrors.value = false
      await loadProcedureHistory()
    } else {
      throw new Error(res.data?.metadata?.message || 'Gagal menambah prosedur')
    }
  } catch (e) {
    showError(e.message || 'Gagal menambah prosedur')
  } finally {
    loadingAddTindakan.value = false
  }
}

const loadProcedureHistory = async () => {
  try {
    loadingRefresh.value = true
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/get_laporan_tindakan`,
      { id_client: id_client.value, mode: 1, noregister: route.query.noreg },
      { headers: { 'Content-Type': 'application/json' } },
    )

    console.log('Update keterangan response:', res.data)
    if (res.data?.metadata?.code == '200') {
      procedureList.value = res.data.response.map((item, i) => ({
        id: `proc-${Date.now()}-${i}`,
        tindakan: { CAPTION: item.TINDAKAN, KATEGORI: item.KATEGORI || 'Medis' },
        no_receipt: item.RECEIPT_NO,
        description: item.REMARK_ITEM || '',
        timestamp: item.TANGGAL_TRANS || formatDate(),
        isSigned: item.AUTH == 1,
        AUTH_BY: item.AUTH_BY,
        isUpdating: false,
        isRemoving: false,
      }))
    } else {
      procedureList.value = []
    }
  } catch {
    showError('Gagal memuat riwayat prosedur')
  } finally {
    loadingRefresh.value = false
  }
}

const updateProcedureDescription = async (index) => {
  const proc = procedureList.value[index]
  if (!proc.description?.trim()) {
    showWarning('Isi keterangan sebelum menyimpan')
    return
  }
  try {
    proc.isUpdating = true
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/updateItemTindakan`,
      {
        id_client: id_client.value,
        no_receipt: proc.no_receipt,
        noregister: route.query.noreg,
        remark_item: proc.description,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (res.data?.metadata?.code == '200') {
      showSuccess('Keterangan berhasil disimpan')
    } else {
      showError(res.data?.metadata?.message)
    }
  } catch {
    showError('Gagal menyimpan keterangan')
  } finally {
    proc.isUpdating = false
  }
}

const handleOtpSuccess = (data) => {
  if (data?.verified == true) loadProcedureHistory()
}

const signProcedure = (index) => {
  receipt_no.value = procedureList.value[index].no_receipt
  showDialog.value = true
}

const confirmRemoveProcedure = (index) => {
  const name = procedureList.value[index].tindakan?.CAPTION || 'prosedur ini'
  confirm.require({
    message: `Anda ingin menghapus "${name}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => removeProcedure(index),
  })
}

const removeProcedure = async (index) => {
  const proc = procedureList.value[index]
  const name = proc.tindakan?.CAPTION || 'prosedur'
  try {
    proc.isRemoving = true
    loadingRefresh.value = true
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/voidtindakan`,
      { id_client: id_client.value, no_receipt: proc.no_receipt },
      { headers: { 'Content-Type': 'application/json' } },
    )
    if (res.data?.metadata?.code == '200') {
      procedureList.value.splice(index, 1)
      showSuccess(`"${name}" berhasil dihapus`)
    } else {
      showError(res.data?.metadata?.message)
      proc.isRemoving = false
    }
  } catch {
    showError('Gagal menghapus prosedur')
    proc.isRemoving = false
  } finally {
    loadingRefresh.value = false
  }
}

const refreshProcedureList = async () => {
  try {
    await loadProcedureHistory()
    showSuccess('Daftar prosedur diperbarui')
  } catch {
    showError('Gagal memuat ulang')
  }
}

watch(
  () => props.datapasien,
  (v) => {
    if (v?.NOPENDAFTARAN) loadProcedureHistory()
  },
  { deep: true },
)

defineExpose({
  procedureList,
  refreshProcedureList,
  clearProcedures: () => {
    procedureList.value = []
    selectedProcedure.value = null
    procedureDescription.value = ''
    showValidationErrors.value = false
  },
})

onMounted(async () => {
  if (props.datapasien?.NOPENDAFTARAN) await loadProcedureHistory()
  getRecentTindakan()
})
</script>

<style scoped>
.required {
  color: #dc3545;
}
.p-error {
  color: #e24c4c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.tindakan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.tindakan-header-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 0.95rem;
}

.tindakan-form {
  padding: 4px 0 8px;
}
.tindakan-form-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.tindakan-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tindakan-field-select {
  flex: 2;
}
.tindakan-field-desc {
  flex: 2;
}
.tindakan-field-qty {
  flex: 0 0 120px;
}
.tindakan-label {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
}
.tindakan-count {
  font-weight: 400;
  color: #adb5bd;
  margin-left: 4px;
}

.tindakan-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}
.tindakan-option-name {
  font-size: 13px;
  font-weight: 500;
}
.tindakan-option-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tindakan-option-price {
  font-size: 11px;
  color: #6c757d;
  margin-left: auto;
}
.tindakan-empty-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  color: #adb5bd;
  font-size: 13px;
  justify-content: center;
}

.tindakan-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
}
.tindakan-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tindakan-item {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 14px;
  background: #f8f9fa;
  transition: box-shadow 0.15s;
}
.tindakan-item:hover {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
}
.tindakan-item-signed {
  border-color: #b8daff;
  background: #f0f7ff;
}

.tindakan-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.tindakan-item-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}
.tindakan-item-name {
  font-size: 13px;
  font-weight: 600;
}
.tindakan-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.tindakan-item-time {
  font-size: 11px;
  color: #adb5bd;
}
.tindakan-item-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tindakan-item-btns {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tindakan-empty {
  text-align: center;
  padding: 48px 16px;
  color: #adb5bd;
}
.tindakan-empty i {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
}
.tindakan-empty p {
  margin: 0 0 4px;
  font-size: 14px;
  color: #6c757d;
}
.tindakan-empty small {
  font-size: 12px;
}

/* ── Recent Tindakan Poli ─────────────────────────── */
.recent-tindakan-section {
  margin: 10px 0 4px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 8px;
}

.recent-tindakan-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.recent-tindakan-hdr-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #14532d;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.recent-tindakan-hdr-left .pi-star-fill {
  color: #22c55e;
  font-size: 13px;
}
.recent-tindakan-hdr-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.recent-tindakan-loading {
  font-size: 11px;
  color: #14532d;
  display: flex;
  align-items: center;
  gap: 4px;
}

.recent-tindakan-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.recent-tindakan-chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #86efac;
  border-radius: 6px;
  cursor: pointer;
  min-width: 100px;
  max-width: 180px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.recent-tindakan-chip:hover {
  background: #f0fdf4;
  border-color: #22c55e;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
  transform: translateY(-1px);
}
.recent-tindakan-chip:active {
  transform: translateY(0);
}

.recent-tindakan-chip-name {
  font-size: 10px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
}
.recent-tindakan-chip-price {
  font-size: 10px;
  font-weight: 700;
  color: #16a34a;
}
</style>
