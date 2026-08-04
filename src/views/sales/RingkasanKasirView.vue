<template>
  <div class="content">
    <Toast />
    <ConfirmDialog />

    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="router.push('/sales/pos')" />
          <div>
            <div style="font-weight: 800; font-size: 15px">Ringkasan Saya</div>
            <div style="font-size: 11.5px; color: var(--p-text-muted-color)">Aktivitas kasir pribadi — {{ user_name }}</div>
          </div>
        </div>
      </template>
      <template #end>
        <Button icon="pi pi-refresh" label="Muat Ulang" size="small" severity="secondary" :loading="loading" @click="fetchRingkasan" />
      </template>
    </Toolbar>

    <!-- ══ Status shift ══ -->
    <div v-if="pakaiShift && isShiftOpen" class="shift-banner shift-banner-open">
      <div class="shift-banner-icon"><i class="pi pi-check-circle"></i></div>
      <div class="shift-banner-main">
        <div class="shift-banner-title">Shift Aktif</div>
        <div class="shift-banner-sub">Angka di bawah untuk shift yang sedang berjalan</div>
      </div>
      <div class="shift-banner-stats">
        <div class="shift-banner-stat">
          <div class="shift-banner-stat-label">Dibuka</div>
          <div class="shift-banner-stat-value">{{ formatDateTime(shift.WAKTU_BUKA) }}</div>
        </div>
        <div class="shift-banner-stat">
          <div class="shift-banner-stat-label">Modal Awal</div>
          <div class="shift-banner-stat-value">{{ formatRupiah(shift.MODAL_AWAL) }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="pakaiShift && !loadingShift" class="shift-banner shift-banner-closed">
      <div class="shift-banner-icon"><i class="pi pi-times-circle"></i></div>
      <div class="shift-banner-main">
        <div class="shift-banner-title">Shift Belum Dibuka</div>
        <div class="shift-banner-sub">Menampilkan riwayat hari ini</div>
      </div>
    </div>
    <div v-else-if="!pakaiShift" class="periode-hint">Periode: {{ periodeAktifLabel }}</div>

    <!-- ══ Stat cards ══ -->
    <div class="stat-row stat-row-auto">
      <div class="stat-tile">
        <div class="stat-icon" style="background: #f1f2f4; color: #6b7280"><i class="pi pi-inbox"></i></div>
        <div>
          <div class="stat-value">{{ formatRupiah(ringkasan.TOTAL_PENJUALAN_KOTOR) }}</div>
          <div class="stat-label">Total Penjualan</div>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-icon" style="background: #fdeceb; color: #e05252"><i class="pi pi-replay"></i></div>
        <div>
          <div class="stat-value">{{ formatRupiah(ringkasan.TOTAL_REFUND) }}</div>
          <div class="stat-label">Total Refund</div>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-icon" style="background: #e7f0fd; color: #2a78d6"><i class="pi pi-wallet"></i></div>
        <div>
          <div class="stat-value">{{ formatRupiah(ringkasan.TOTAL_OMZET) }}</div>
          <div class="stat-label">Total Omzet</div>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-icon" style="background: #e6f6ef; color: #1baf7a"><i class="pi pi-arrow-down-left"></i></div>
        <div>
          <div class="stat-value">{{ formatRupiah(ringkasan.PEMASUKAN_LAIN) }}</div>
          <div class="stat-label">Pemasukan Lain</div>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-icon" style="background: #fdeceb; color: #e05252"><i class="pi pi-arrow-up-right"></i></div>
        <div>
          <div class="stat-value">{{ formatRupiah(ringkasan.PENGELUARAN_LAIN) }}</div>
          <div class="stat-label">Pengeluaran Lain</div>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-icon" style="background: #e6f6ef; color: #1baf7a"><i class="pi pi-receipt"></i></div>
        <div>
          <div class="stat-value">{{ ringkasan.JUMLAH_TRANSAKSI }}</div>
          <div class="stat-label">Jumlah Transaksi</div>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-icon" style="background: #fdeceb; color: #e05252"><i class="pi pi-exclamation-triangle"></i></div>
        <div>
          <div class="stat-value">{{ ringkasan.JUMLAH_TRANSAKSI_REFUND }}</div>
          <div class="stat-label">Jumlah Refund</div>
        </div>
      </div>
    </div>

    <!-- ══ Breakdown metode bayar ══ -->
    <div class="card elevation-0">
      <div class="card-body">
        <div class="chart-title">Breakdown Metode Bayar</div>
        <div v-if="loading" class="state-box-sm"><i class="pi pi-spin pi-spinner"></i><span>Memuat...</span></div>
        <div v-else class="payment-breakdown">
          <div v-for="p in breakdownPayment" :key="p.IDPAYEMENT" class="payment-tile">
            <div class="payment-label">{{ p.NAMA_PAYMENT }}</div>
            <div class="payment-value">{{ formatRupiah(p.TOTAL) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Riwayat transaksi ══ -->
    <div class="card elevation-0">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <div class="chart-title" style="margin-bottom: 0">Transaksi Terakhir</div>
          <Button icon="pi pi-refresh" label="Muat Ulang" size="small" severity="secondary" :loading="loadingRecent" @click="fetchRecentSales" />
        </div>
        <div class="recent-grouped-wrap">
          <div v-if="loadingRecent" class="state-box-sm">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Memuat transaksi...</span>
          </div>
          <div v-else-if="recentReceipts.length === 0" class="state-box-sm">
            <i class="pi pi-inbox"></i>
            <span>Belum ada transaksi</span>
          </div>
          <div v-else class="receipt-list">
            <div v-for="receipt in recentReceipts" :key="receipt.RECEIPT_NO" class="receipt-card">
              <button type="button" class="receipt-card-header" @click="toggleReceipt(receipt.RECEIPT_NO)">
                <i class="pi" :class="isExpanded(receipt.RECEIPT_NO) ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                <span class="mono receipt-no">{{ receipt.RECEIPT_NO }}</span>
                <span class="receipt-meta">{{ formatDateTime(receipt.TANGGAL) }} — {{ namaPayment(receipt.idPayement) }}</span>
                <Tag v-if="receipt.voided" icon="pi pi-ban" value="Dibatalkan" severity="danger" style="font-size: 10px" />
                <Tag v-else-if="receipt.partialVoid" icon="pi pi-info-circle" value="Sebagian Dibatalkan" severity="warn" style="font-size: 10px" />
                <Tag v-else value="Aktif" severity="success" style="font-size: 10px" />
                <b class="receipt-total" :class="{ 'receipt-total-voided': receipt.voided }">{{ formatRupiah(receipt.displayTotal) }}</b>
                <Button
                  v-if="!receipt.voided && canVoid(receipt)"
                  icon="pi pi-times-circle"
                  severity="danger"
                  size="small"
                  text
                  rounded
                  v-tooltip.left="'Batalkan transaksi'"
                  :loading="voidingReceipt === receipt.RECEIPT_NO"
                  @click.stop="confirmVoid(receipt)"
                />
                <Tag
                  v-else-if="!receipt.voided && receipt.idPayement === 3 && receipt.totalBayar > 0"
                  icon="pi pi-lock"
                  value="Sudah Dicicil"
                  severity="secondary"
                  style="font-size: 10px"
                  v-tooltip.left="'Piutang ini sudah pernah dicicil, tidak bisa dibatalkan'"
                />
                <Tag
                  v-else-if="!receipt.voided"
                  icon="pi pi-lock"
                  value="Terkunci"
                  severity="secondary"
                  style="font-size: 10px"
                  v-tooltip.left="'Transaksi di luar shift yang sedang terbuka — sudah masuk rekap closing dan tidak bisa dibatalkan'"
                />
              </button>

              <div v-if="isExpanded(receipt.RECEIPT_NO)" class="receipt-items-wrap">
                <table class="receipt-items-table">
                  <thead>
                    <tr>
                      <th>Nama Barang</th>
                      <th style="text-align: center">Qty</th>
                      <th style="text-align: right">Harga</th>
                      <th>Diskon</th>
                      <th style="text-align: right">Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="item in receipt.items" :key="item.ID_DETAIL ?? item.BARCODE + '-' + item.SUB_BARCODE">
                      <tr :class="{ 'receipt-item-voided': item.voided }">
                        <td>
                          {{ item.NAMA }}
                          <Tag v-if="item.isRacikanParent" value="Racikan" severity="help" style="font-size: 9px; margin-left: 4px" />
                        </td>
                        <td style="text-align: center">{{ item.isRacikanParent ? `${item.QTY} bks` : item.QTY }}</td>
                        <td style="text-align: right">{{ formatRupiah(item.HARGA) }}</td>
                        <td>
                          <span v-if="itemDiscount(item)" class="discount-badge">
                            -{{ formatRupiah(itemDiscount(item).cut) }} ({{ itemDiscount(item).pct.toFixed(0) }}%)
                          </span>
                          <span v-else class="text-muted">-</span>
                        </td>
                        <td style="text-align: right"><b>{{ formatRupiah(item.TOTALAMOUNT) }}</b></td>
                        <td>
                          <Tag v-if="item.voided" value="Dibatalkan" severity="danger" style="font-size: 10px" />
                          <Button
                            v-else-if="canVoid(receipt)"
                            icon="pi pi-times"
                            severity="danger"
                            text
                            rounded
                            size="small"
                            v-tooltip.left="item.isRacikanParent ? 'Batalkan racikan ini (bahan ikut dibatalkan)' : 'Batalkan item ini'"
                            :loading="voidingItemKey === receipt.RECEIPT_NO + '-' + item.ID_DETAIL"
                            @click="confirmVoidItem(receipt, item)"
                          />
                          <Tag v-else value="Aktif" severity="success" style="font-size: 10px" />
                        </td>
                      </tr>
                      <tr v-for="bahan in item.bahan" :key="bahan.ID_DETAIL" class="receipt-bahan-row">
                        <td colspan="6">— {{ bahan.NAMA }} ({{ bahan.QTY }})</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toolbar from 'primevue/toolbar'
import { formatRupiah } from './utils/format'
import { formatDateTime, formatTglFull, formatDateOnlyForAPI } from './utils/date'
import { itemDiscount } from './utils/salesCalc'
import { groupReceiptsByReceiptNo } from './utils/receiptGrouping'
import { useShift } from './composables/useShift'
import { usePosSetting } from './composables/usePosSetting'
import { useVoidTransaction } from './composables/useVoidTransaction'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi, user_id, user_name } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const apiUrl = computed(() => `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`)

/* ══════════ Pengaturan POS (pakai shift) ══════════ */
const { pakaiShift, fetchPosSetting } = usePosSetting(apiUrl, { id_client })

/* ══════════ Shift aktif ══════════ */
const { shift, loadingShift, isShiftOpen, fetchShiftAktif } = useShift(apiUrl, { id_client, id_lokasi, user_id })

/* ══════════ Filter tanggal (dipakai kalau shift tidak aktif) ══════════ */
const dateStart = ref(new Date())
const dateEnd = ref(new Date())
const periodeAktifLabel = computed(() => {
  const start = formatTglFull(dateStart.value)
  const end = formatTglFull(dateEnd.value)
  if (!start || !end) return ''
  return start === end ? start : `${start} — ${end}`
})

/* ══════════ Ringkasan aktivitas kasir ══════════
   Endpoint BE yang dibutuhkan: GET {apiUrl}/ringkasan_kasir
   Params: clientId, lokasiId, idUser (wajib — scope ke kasir yang login),
           idShift (opsional, dipakai kalau shift lagi aktif),
           tglAwal/tglAkhir (fallback kalau tidak ada shift aktif / client non-shift).
   Response TIDAK boleh berisi HARGABELI/margin/laba — itu ranah Laba Rugi (owner), bukan halaman ini. */
const emptyRingkasan = () => ({
  JUMLAH_TRANSAKSI: 0,
  JUMLAH_TRANSAKSI_REFUND: 0,
  TOTAL_PENJUALAN_KOTOR: 0,
  TOTAL_REFUND: 0,
  TOTAL_OMZET: 0,
  PEMASUKAN_LAIN: 0,
  PENGELUARAN_LAIN: 0,
  BREAKDOWN_PAYMENT: [],
  TRANSAKSI_TERAKHIR: [],
})
const ringkasan = ref(emptyRingkasan())
const loading = ref(false)
const paymentNameMap = ref({})
const namaPayment = (id) => paymentNameMap.value[id] || `Metode #${id}`

// Metode bayar tetap (samain sama paymentOptions di CartPanel) — supaya semua metode
// tetap tampil di breakdown walau belum ada transaksi buat metode itu (nilainya Rp 0).
const PAYMENT_METHODS = [
  { IDPAYEMENT: 1, NAMA_PAYMENT: 'Tunai' },
  { IDPAYEMENT: 2, NAMA_PAYMENT: 'Non-Tunai' },
  { IDPAYEMENT: 3, NAMA_PAYMENT: 'Piutang' },
]
const breakdownPayment = computed(() => {
  const byId = new Map(ringkasan.value.BREAKDOWN_PAYMENT.map((p) => [p.IDPAYEMENT, p]))
  return PAYMENT_METHODS.map((m) => byId.get(m.IDPAYEMENT) || { ...m, TOTAL: 0 })
})

const fetchRingkasan = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/ringkasan_kasir`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        idUser: user_id.value,
        idShift: pakaiShift.value && isShiftOpen.value ? shift.value?.ID : undefined,
        tglAwal: formatDateOnlyForAPI(dateStart.value),
        tglAkhir: formatDateOnlyForAPI(dateEnd.value),
      },
    })
    ringkasan.value = { ...emptyRingkasan(), ...(data?.response ?? {}) }
    paymentNameMap.value = Object.fromEntries(
      (ringkasan.value.BREAKDOWN_PAYMENT || []).map((p) => [p.IDPAYEMENT, p.NAMA_PAYMENT]),
    )
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat ringkasan aktivitas', life: 4000 })
  } finally {
    loading.value = false
  }
}

/* ══════════ Transaksi Terakhir (expandable + bisa dibatalkan) ══════════
   Dipisah dari ringkasan_kasir.TRANSAKSI_TERAKHIR (yang cuma flat, tanpa breakdown
   item) — pakai recent_sales yang sama kayak KasirView, difilter ke kasir yang
   login karena halaman ini scope-nya "Ringkasan Saya". */
const recentSales = ref([])
const loadingRecent = ref(false)

const fetchRecentSales = async () => {
  loadingRecent.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/recent_sales`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        limit: 50,
        idShift: pakaiShift.value && isShiftOpen.value ? shift.value?.ID : undefined,
      },
    })
    recentSales.value = (data?.response ?? []).filter((row) => String(row.IDUSER) === String(user_id.value))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat transaksi terakhir', life: 4000 })
  } finally {
    loadingRecent.value = false
  }
}

const recentReceipts = computed(() => groupReceiptsByReceiptNo(recentSales.value))

const expandedReceipts = ref(new Set())
const isExpanded = (receiptNo) => expandedReceipts.value.has(receiptNo)
const toggleReceipt = (receiptNo) => {
  const next = new Set(expandedReceipts.value)
  if (next.has(receiptNo)) next.delete(receiptNo)
  else next.add(receiptNo)
  expandedReceipts.value = next
}

const { canVoid, voidingReceipt, confirmVoid, confirmVoidItem, voidingItemKey } = useVoidTransaction(apiUrl, {
  id_client,
  pakaiShift,
  isShiftOpen,
  shift,
  toast,
  confirm,
  onVoided: () => Promise.all([fetchRecentSales(), fetchRingkasan()]),
})

onMounted(async () => {
  await fetchPosSetting()
  if (pakaiShift.value) await fetchShiftAktif()
  fetchRingkasan()
  fetchRecentSales()
})
</script>

<style scoped>
.shift-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.shift-banner-open {
  background: var(--p-green-50, #e6f6ef);
  border: 1px solid var(--p-green-200, #b8ecd3);
}

.shift-banner-closed {
  background: var(--p-red-50, #fdeceb);
  border: 1px solid var(--p-red-200, #f5c6c2);
}

.shift-banner-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.shift-banner-open .shift-banner-icon {
  background: var(--p-surface-0, #fff);
  color: #1baf7a;
}

.shift-banner-closed .shift-banner-icon {
  background: var(--p-surface-0, #fff);
  color: #e05252;
}

.shift-banner-main {
  flex: 1;
  min-width: 140px;
}

.shift-banner-title {
  font-size: 13.5px;
  font-weight: 700;
}

.shift-banner-open .shift-banner-title {
  color: #1baf7a;
}

.shift-banner-closed .shift-banner-title {
  color: #e05252;
}

.shift-banner-sub {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
  margin-top: 1px;
}

.shift-banner-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.shift-banner-stat {
  text-align: right;
}

.shift-banner-stat-label {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.shift-banner-stat-value {
  font-size: 13.5px;
  font-weight: 700;
  margin-top: 1px;
}

.periode-hint {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
  margin-bottom: 14px;
}

.chart-title {
  font-size: 12px;
  color: var(--p-text-muted-color);
  margin-bottom: 8px;
}

.stat-row {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-row-auto {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.stat-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--p-surface-0, #fff);
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 12px;
  padding: 14px 16px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-label {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
}

.payment-breakdown {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.payment-tile {
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 10px;
  padding: 10px 14px;
}

.payment-label {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
}

.payment-value {
  font-size: 15px;
  font-weight: 700;
  margin-top: 2px;
}

.state-box-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 10px;
  color: var(--p-text-muted-color);
  font-size: 13px;
}

.state-box-sm i {
  font-size: 1.8rem;
  opacity: 0.4;
}

.recent-grouped-wrap {
  max-height: 65vh;
  overflow-y: auto;
}

.receipt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.receipt-card {
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 10px;
  overflow: hidden;
}

.receipt-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: var(--p-surface-0, #fff);
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.receipt-card-header:hover {
  background: var(--p-surface-50, #f8fafc);
}

.receipt-no {
  font-weight: 700;
  font-size: 13px;
}

.receipt-meta {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
}

.receipt-total {
  margin-left: auto;
  font-size: 14px;
  white-space: nowrap;
}

.receipt-total-voided {
  text-decoration: line-through;
  color: var(--p-text-muted-color);
}

.receipt-items-wrap {
  border-top: 1px solid var(--p-content-border-color, #eee);
  overflow-x: auto;
}

.receipt-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.receipt-items-table th {
  text-align: left;
  font-size: 10.5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  background: var(--p-surface-50, #f8fafc);
  padding: 6px 10px;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
  white-space: nowrap;
}

.receipt-items-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--p-content-border-color, #f1f1ee);
}

.receipt-items-table tbody tr:last-child td {
  border-bottom: none;
}

.receipt-item-voided {
  opacity: 0.55;
}

.receipt-item-voided td {
  text-decoration: line-through;
}

.receipt-bahan-row td {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
  padding-left: 24px;
  background: var(--p-surface-50, #f8fafc);
}

.discount-badge {
  color: var(--p-orange-600, #ea580c);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.mono {
  font-family: ui-monospace, "Cascadia Code", "SF Mono", Menlo, Consolas, monospace;
}
</style>
