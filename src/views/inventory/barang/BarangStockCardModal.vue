<template>
  <Dialog
    v-model:visible="isVisible"
    header="Kartu Stok"
    modal
    maximizable
    :style="{ width: '980px', maxWidth: '96vw' }"
    :breakpoints="{ '1024px': '96vw' }"
    :contentStyle="{ padding: '1rem', overflowY: 'auto', maxHeight: '82vh' }"
  >
    <loading_overlay :is-loading="loading" message="Memuat kartu stok..." />

    <!-- INFO BARANG -->
    <div v-if="barang" class="ks-info-strip">
      <div class="ks-info-item">
        <span class="ks-info-label">ID Barang</span>
        <span class="ks-info-value mono">{{ barang.IDBARANG || '-' }}</span>
      </div>
      <div class="ks-info-item">
        <span class="ks-info-label">Nama</span>
        <span class="ks-info-value fw-semibold">{{ barang.NAMA || '-' }}</span>
      </div>
      <div class="ks-info-item">
        <span class="ks-info-label">Kategori</span>
        <span class="ks-info-value">{{ barang.KATEGORI || '-' }}</span>
      </div>
      <div class="ks-info-item">
        <span class="ks-info-label">Satuan</span>
        <span class="ks-info-value">{{ barang.SATUAN_KECIL || '-' }}</span>
      </div>
      <div class="ks-info-item">
        <span class="ks-info-label">Barcode</span>
        <span class="ks-info-value mono">{{ barang.BARCODE || '-' }}</span>
      </div>
      <Tag
        v-if="barang.is_below_minimum"
        value="Stok di bawah minimum"
        severity="danger"
        style="font-size: 10px"
      />
    </div>

    <!-- FILTER TANGGAL -->
    <div class="ks-filter-bar">
      <div class="ks-filter-group">
        <span class="ks-filter-label"><i class="pi pi-calendar"></i>Dari Tanggal</span>
        <DatePicker
          v-model="dateStart"
          dateFormat="dd/mm/yy"
          placeholder="Tanggal mulai"
          showIcon
          iconDisplay="input"
          style="min-width: 150px"
          :disabled="loading"
        />
      </div>
      <div class="ks-filter-group">
        <span class="ks-filter-label"><i class="pi pi-calendar"></i>Sampai Tanggal</span>
        <DatePicker
          v-model="dateEnd"
          dateFormat="dd/mm/yy"
          placeholder="Tanggal akhir"
          showIcon
          iconDisplay="input"
          style="min-width: 150px"
          :disabled="loading"
        />
      </div>
      <div class="ks-filter-actions ms-auto">
        <Button
          icon="pi pi-search"
          label="Tampilkan"
          class="round-button2 btn-primary-ks"
          :loading="loading"
          @click="fetchStockCard"
        />
        <Button
          icon="pi pi-file-excel"
          severity="success"
          outlined
          class="round-button2"
          v-tooltip.top="'Export Excel'"
          :disabled="loading || !rows.length"
          @click="exportExcel"
        />
      </div>
    </div>

    <!-- SUMMARY STRIP -->
    <div class="ks-summary-strip">
      <div class="ks-summary-item">
        <span class="ks-summary-lbl">Total Masuk</span>
        <span class="ks-summary-val" style="color: #166534">{{ totalMasuk }}</span>
      </div>
      <div class="ks-summary-div"></div>
      <div class="ks-summary-item">
        <span class="ks-summary-lbl">Total Keluar</span>
        <span class="ks-summary-val" style="color: #dc2626">{{ totalKeluar }}</span>
      </div>
      <div class="ks-summary-div"></div>
      <div class="ks-summary-item">
        <span class="ks-summary-lbl">Saldo Akhir</span>
        <span class="ks-summary-val" style="color: #0369a1">{{ saldoAkhir }}</span>
      </div>
    </div>

    <!-- TABLE -->
    <div class="ks-table-wrap">
      <DataTable
        :value="rows"
        :loading="loading"
        showGridlines
        rowHover
        scrollable
        scrollHeight="45vh"
        size="small"
        class="ks-datatable"
      >
        <template #empty>
          <div class="ks-empty">
            <div class="ks-empty-icon"><i class="pi pi-book"></i></div>
            <p class="ks-empty-title">Tidak ada mutasi pada periode ini</p>
          </div>
        </template>
        <Column header="#" style="width: 40px; text-align: center">
          <template #body="{ index }">
            <span style="font-size: 11px; color: #94a3b8">{{ index + 1 }}</span>
          </template>
        </Column>
        <Column header="TANGGAL" style="min-width: 130px">
          <template #body="{ data }">
            <span class="mono">{{ formatDateTime(data.TANGGAL_TRANS) }}</span>
          </template>
        </Column>
        <Column header="KETERANGAN" style="min-width: 150px">
          <template #body="{ data }">
            <Tag
              :value="data.CAPTION || data.JENIS_TRANS"
              :severity="data.JENIS_TRANS === 'IN' ? 'success' : 'danger'"
              style="font-size: 9px; padding: 1px 5px"
            />
          </template>
        </Column>
        <Column header="NO. REFERENSI" style="min-width: 130px">
          <template #body="{ data }">
            <span class="mono">{{ data.REFF_NUMBER || '-' }}</span>
          </template>
        </Column>
        <Column header="BATCH" style="min-width: 110px">
          <template #body="{ data }">
            <span class="mono">{{ data.SUB_BARCODE || '-' }}</span>
          </template>
        </Column>
        <Column header="MASUK" style="min-width: 80px; text-align: right">
          <template #body="{ data }">
            <span class="mono fw-semibold" style="color: #166534">{{
              data.JENIS_TRANS === 'IN' ? data.QTY : ''
            }}</span>
          </template>
        </Column>
        <Column header="KELUAR" style="min-width: 80px; text-align: right">
          <template #body="{ data }">
            <span class="mono fw-semibold" style="color: #dc2626">{{
              data.JENIS_TRANS === 'OUT' ? data.QTY : ''
            }}</span>
          </template>
        </Column>
        <Column header="HARGA SATUAN" style="min-width: 110px; text-align: right">
          <template #body="{ data }">
            <span class="mono">{{
              data.HARGA_SATUAN != null ? formatCurrency(data.HARGA_SATUAN) : '-'
            }}</span>
          </template>
        </Column>
        <Column header="SALDO" style="min-width: 80px; text-align: right">
          <template #body="{ data }">
            <span class="mono fw-semibold">{{ data.SALDO }}</span>
          </template>
        </Column>
        <Column header="SALDO BATCH" style="min-width: 90px; text-align: right">
          <template #body="{ data }">
            <span class="mono">{{ data.SALDO_SUB ?? '-' }}</span>
          </template>
        </Column>
        <Column header="LOKASI" style="min-width: 110px">
          <template #body="{ data }">
            <span>{{ data.LOKASI || '-' }}</span>
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
        class="round-button2"
        @click="isVisible = false"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import { useConfigStore, useAuthStore } from '@/stores/config'

const props = defineProps({
  visible: { type: Boolean, required: true },
  itemId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:visible'])

const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()

const loading = ref(false)
const barang = ref(null)
const rows = ref([])

const now = new Date()
const dateStart = ref(new Date(now.getFullYear(), now.getMonth(), 1))
const dateEnd = ref(now)

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const totalMasuk = computed(() =>
  rows.value.reduce((s, r) => s + (r.JENIS_TRANS === 'IN' ? Number(r.QTY) || 0 : 0), 0),
)
const totalKeluar = computed(() =>
  rows.value.reduce((s, r) => s + (r.JENIS_TRANS === 'OUT' ? Number(r.QTY) || 0 : 0), 0),
)
const saldoAkhir = computed(() => {
  if (!rows.value.length) return barang.value?.TOTAL_STOCK ?? '-'
  return rows.value[rows.value.length - 1].SALDO
})

function formatDateOnlyForAPI(date) {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function formatDateTime(val) {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

async function fetchStockCard() {
  if (!props.itemId) return
  loading.value = true
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/inventory/barang_stock_card/${props.itemId}`,
      {
        params: {
          clientId: authStore.id_client,
          lokasiId: authStore.id_lokasi,
          DATE_MIN: formatDateOnlyForAPI(dateStart.value),
          DATE_MAX: formatDateOnlyForAPI(dateEnd.value),
        },
      },
    )
    barang.value = res.data?.response?.barang || null
    rows.value = res.data?.response?.rows || []
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.metadata?.message || 'Gagal memuat kartu stok',
      life: 3000,
    })
    barang.value = null
    rows.value = []
  } finally {
    loading.value = false
  }
}

function exportExcel() {
  import('xlsx').then((xlsx) => {
    const sheetRows = rows.value.map((d) => ({
      TANGGAL: formatDateTime(d.TANGGAL_TRANS),
      KETERANGAN: d.CAPTION || d.JENIS_TRANS,
      'NO. REFERENSI': d.REFF_NUMBER,
      BATCH: d.SUB_BARCODE,
      MASUK: d.JENIS_TRANS === 'IN' ? d.QTY : '',
      KELUAR: d.JENIS_TRANS === 'OUT' ? d.QTY : '',
      'HARGA SATUAN': d.HARGA_SATUAN,
      SALDO: d.SALDO,
      'SALDO BATCH': d.SALDO_SUB,
      LOKASI: d.LOKASI,
    }))
    const ws = xlsx.utils.json_to_sheet(sheetRows)
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'Kartu Stok')
    xlsx.writeFile(wb, `Kartu_Stok_${barang.value?.IDBARANG || props.itemId}.xlsx`)
  })
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.itemId) {
      dateStart.value = new Date(now.getFullYear(), now.getMonth(), 1)
      dateEnd.value = now
      fetchStockCard()
    }
  },
)
</script>

<style scoped>
.ks-info-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 10px;
}
.ks-info-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.ks-info-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ks-info-value {
  font-size: 12.5px;
  color: #1e293b;
}
.ks-filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #0369a1;
  border-radius: 8px;
  margin-bottom: 8px;
}
.ks-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ks-filter-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ks-filter-label i {
  color: #0369a1;
  font-size: 9px;
}
.ks-filter-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ks-summary-strip {
  display: flex;
  align-items: center;
  height: 40px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 14px;
  margin-bottom: 8px;
}
.ks-summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
}
.ks-summary-lbl {
  font-size: 10.5px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ks-summary-val {
  font-size: 14px;
  font-weight: 700;
}
.ks-summary-div {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
}
.ks-table-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}
:deep(.ks-datatable .p-datatable-thead > tr > th) {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  font-size: 10.5px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 0.35rem 0.6rem !important;
  white-space: nowrap;
}
:deep(.ks-datatable .p-datatable-tbody > tr > td) {
  font-size: 12px !important;
  padding: 0.25rem 0.6rem !important;
  vertical-align: middle;
}
:deep(.ks-datatable .p-datatable-tbody > tr:hover > td) {
  background: #eff6ff !important;
}
.ks-empty {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}
.ks-empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  color: #cbd5e1;
}
.ks-empty-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}
.mono {
  font-family: monospace;
  font-size: 12px;
}
.btn-primary-ks {
  background: #0369a1 !important;
  border-color: #0369a1 !important;
  color: #fff !important;
}
.btn-primary-ks:hover {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
}
.round-button2 {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}
</style>
