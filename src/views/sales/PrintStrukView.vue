<template>
  <div class="tp-wrap">
    <div class="tp-toolbar">
      <button class="tp-btn tp-btn-print" @click="downloadPdf" :disabled="!payload || downloading">
        {{ downloading ? 'Membuat PDF...' : '⬇ Unduh PDF' }}
      </button>
      <button class="tp-btn tp-btn-close" @click="closeTab">✕ Tutup</button>
    </div>

    <div v-if="!payload" class="tp-center-msg">
      Data struk tidak ditemukan. Buka halaman ini dari Kasir setelah transaksi/tutup shift.
    </div>

    <!-- ══ STRUK PENJUALAN ══ -->
    <div v-else-if="payload.type === 'penjualan'" class="tp-paper">
      <div class="struk" ref="strukRef">
        <div class="struk-center">
          <div class="struk-title">{{ company || 'Apotik' }}</div>
          <div class="struk-sub" v-if="ALAMAT">{{ ALAMAT }}</div>
        </div>
        <div class="struk-divider"></div>
        <div class="struk-row"><span>No. Struk</span><span>{{ receipt.RECEIPT_NO }}</span></div>
        <div class="struk-row"><span>Tanggal</span><span>{{ formatDateTime(receipt.WAKTU) }}</span></div>
        <div class="struk-row"><span>Kasir</span><span>{{ receipt.KASIR }}</span></div>
        <div class="struk-row" v-if="receipt.PASIEN"><span>Pasien</span><span>{{ receipt.PASIEN.NAMA }}</span></div>
        <div class="struk-divider"></div>
        <div v-for="it in receipt.items" :key="it.IS_RACIKAN ? it.RACIKAN_KEY : it.BARCODE + '-' + it.SUB_BARCODE" class="struk-item">
          <template v-if="it.IS_RACIKAN">
            <div class="struk-item-name">{{ it.NAMA }} ({{ it.BENTUK }})</div>
            <div class="struk-row">
              <span>{{ it.JML_BUNGKUS }} bungkus<template v-if="it.CARA_PAKAI"> — {{ it.CARA_PAKAI }}</template></span>
              <span>{{ formatRupiah(lineTotal(it)) }}</span>
            </div>
            <div v-for="(b, idx) in it.bahan" :key="idx" class="struk-racikan-bahan">
              - {{ b.NAMA }} ({{ b.QTY }})
            </div>
          </template>
          <template v-else>
            <div class="struk-item-name">{{ it.NAMA }}</div>
            <div class="struk-row">
              <span
                >{{ it.QTY }} {{ it.SATUAN }} x {{ formatRupiah(it.HARGA) }}<template v-if="Number(it.DISCOUNT) > 0"
                  >&nbsp;(-{{ it.DISCOUNT_TYPE === 'RUPIAH' ? formatRupiah(it.DISCOUNT) + '/u' : it.DISCOUNT + '%' }})</template
                ></span
              >
              <span>{{ formatRupiah(lineTotal(it)) }}</span>
            </div>
          </template>
        </div>
        <div class="struk-divider"></div>
        <div class="struk-row"><span>Subtotal</span><span>{{ formatRupiah(receiptSubtotal) }}</span></div>
        <div class="struk-row" v-if="receipt.POTONGAN > 0">
          <span>Potongan</span><span>-{{ formatRupiah(receipt.POTONGAN) }}</span>
        </div>
        <div class="struk-row struk-bold"><span>Grand Total</span><span>{{ formatRupiah(receipt.GRANDTOTAL) }}</span></div>
        <div class="struk-row">
          <span>{{ receipt.IDPAYEMENT === 1 ? 'Tunai' : 'Non-Tunai' }}</span>
          <span>{{ formatRupiah(receipt.TOTALBAYAR) }}</span>
        </div>
        <div class="struk-row"><span>Kembalian</span><span>{{ formatRupiah(receipt.KEMBALIAN) }}</span></div>
        <div class="struk-divider"></div>
        <div class="struk-center struk-thanks">Terima kasih atas kunjungan Anda</div>
      </div>
    </div>

    <!-- ══ STRUK TUTUP SHIFT ══ -->
    <div v-else-if="payload.type === 'tutup_shift'" class="tp-paper">
      <div class="struk" ref="strukRef">
        <div class="struk-center struk-bold struk-title-lg">Laporan Shift</div>
        <div class="struk-divider"></div>

        <div class="struk-row"><span>Toko</span><span>{{ company || 'Apotik' }}</span></div>
        <div class="struk-row" v-if="ALAMAT"><span>Alamat</span><span>{{ ALAMAT }}</span></div>
        <div class="struk-divider"></div>

        <div class="struk-row"><span>Kasir</span><span>{{ receipt.IDUSER }}</span></div>
        <div class="struk-row"><span>Dibuka</span><span>{{ formatDateTime(receipt.WAKTU_BUKA) }}</span></div>
        <div class="struk-row"><span>Ditutup</span><span>{{ formatDateTime(receipt.WAKTU_TUTUP) }}</span></div>
        <div class="struk-row struk-bold"><span>Durasi Shift</span><span>{{ shiftDuration }}</span></div>

        <div class="struk-section-title">Laci uang</div>

        <div class="struk-row"><span>Modal awal</span><span>{{ formatRupiah(receipt.MODAL_AWAL) }}</span></div>
        <div class="struk-row"><span>Pembayaran tunai</span><span>{{ formatRupiah(receipt.TOTAL_TUNAI) }}</span></div>
        <div class="struk-row"><span>Pemasukan lain (tunai)</span><span>{{ formatRupiah(receipt.PEMASUKAN_LAIN_TUNAI) }}</span></div>
        <div class="struk-row"><span>Pengeluaran lain (tunai)</span><span>-{{ formatRupiah(receipt.PENGELUARAN_LAIN_TUNAI) }}</span></div>
        <div class="struk-row struk-bold"><span>Jumlah uang tunai yang diharapkan</span><span>{{ formatRupiah(expectedCash) }}</span></div>
        <div class="struk-divider"></div>
        <div class="struk-row"><span>Kas fisik (dihitung)</span><span>{{ formatRupiah(receipt.MODAL_AKHIR) }}</span></div>
        <div class="struk-row struk-bold" :class="{ 'struk-danger': roundMoney(receipt.SELISIH) !== 0 }">
          <span>Selisih</span><span>{{ formatRupiah(receipt.SELISIH) }}</span>
        </div>

        <div class="struk-section-title">Ringkasan penjualan</div>

        <div class="struk-row"><span>Total transaksi</span><span>{{ receipt.JUMLAH_TRANSAKSI }}</span></div>
        <div class="struk-row"><span>Transaksi refund</span><span>{{ receipt.JUMLAH_TRANSAKSI_REFUND }}</span></div>
        <div class="struk-row struk-bold"><span>Penjualan kotor</span><span>{{ formatRupiah(receipt.TOTAL_PENJUALAN_KOTOR) }}</span></div>
        <div class="struk-row"><span>Refund</span><span>{{ formatRupiah(receipt.TOTAL_REFUND) }}</span></div>
        <div class="struk-row struk-bold"><span>Penjualan bersih</span><span>{{ formatRupiah(receipt.TOTAL_OMZET) }}</span></div>
        <div class="struk-row"><span>Tunai</span><span>{{ formatRupiah(receipt.TOTAL_TUNAI) }}</span></div>
        <div class="struk-row"><span>Non-Tunai</span><span>{{ formatRupiah(receipt.TOTAL_NONTUNAI) }}</span></div>

        <template v-if="receipt.CATATAN">
          <div class="struk-divider"></div>
          <div class="struk-row"><span>Catatan</span><span>{{ receipt.CATATAN }}</span></div>
        </template>

        <div class="struk-divider"></div>
        <div class="struk-center struk-sub">{{ formatDateTime(receipt.WAKTU_TUTUP) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatRupiah, roundMoney } from './utils/format'
import { formatDateTime } from './utils/date'
import { lineTotal } from './utils/salesCalc'

const authStore = useAuthStore()
const { company, ALAMAT } = storeToRefs(authStore)

// Data dikirim dari KasirView (doCheckout / submitTutupShift) lewat sessionStorage, bukan API —
// datanya sudah lengkap di FE begitu transaksi/tutup-shift sukses. sessionStorage ikut ke-copy
// ke tab baru saat dibuka via window.open dari origin yang sama, jadi tidak perlu fetch ulang.
// Payload: { type: 'penjualan' | 'tutup_shift', data: {...} }
const payload = ref(null)
const receipt = computed(() => payload.value?.data ?? null)
const downloading = ref(false)
const strukRef = ref(null)

const receiptSubtotal = computed(() => (receipt.value?.items || []).reduce((s, i) => s + lineTotal(i), 0))

const expectedCash = computed(() => {
  if (!receipt.value) return 0
  return (
    (Number(receipt.value.MODAL_AWAL) || 0) +
    (Number(receipt.value.TOTAL_TUNAI) || 0) +
    (Number(receipt.value.PEMASUKAN_LAIN_TUNAI) || 0) -
    (Number(receipt.value.PENGELUARAN_LAIN_TUNAI) || 0)
  )
})

const shiftDuration = computed(() => {
  if (!receipt.value?.WAKTU_BUKA || !receipt.value?.WAKTU_TUTUP) return '-'
  const buka = new Date(String(receipt.value.WAKTU_BUKA).replace(' ', 'T'))
  const tutup = new Date(String(receipt.value.WAKTU_TUTUP).replace(' ', 'T'))
  if (isNaN(buka.getTime()) || isNaN(tutup.getTime())) return '-'
  const totalMinutes = Math.max(0, Math.round((tutup - buka) / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours} jam ${minutes} menit`
})


async function downloadPdf() {
  if (!strukRef.value || downloading.value) return
  downloading.value = true
  try {
    const canvas = await html2canvas(strukRef.value, { scale: 3, backgroundColor: '#ffffff', logging: false })
    const imgData = canvas.toDataURL('image/png')
    // Ukuran PDF mengikuti lebar struk thermal rollpaper 58mm, tinggi menyesuaikan konten —
    // beda dengan Surat Pesanan yang pakai A4, karena ini format struk bukan surat resmi.
    const pageW = 58
    const pageH = (canvas.height * pageW) / canvas.width
    const pdf = new jsPDF({ unit: 'mm', format: [pageW, pageH] })
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH)

    const filename =
      payload.value.type === 'penjualan'
        ? `Struk_${receipt.value.RECEIPT_NO}.pdf`
        : `Tutup_Shift_${receipt.value.IDUSER}_${(receipt.value.WAKTU_TUTUP || '').slice(0, 10)}.pdf`
    pdf.save(filename)
  } catch (err) {
    console.error('Gagal membuat PDF struk:', err)
  } finally {
    downloading.value = false
  }
}

function closeTab() {
  window.close()
}

onMounted(() => {
  const raw = sessionStorage.getItem('strukPrintPayload')
  if (raw) {
    try {
      payload.value = JSON.parse(raw)
    } catch {
      payload.value = null
    }
  }
  sessionStorage.removeItem('strukPrintPayload')
})
</script>

<style>
* { box-sizing: border-box; }

body {
  background: #e5e7eb;
  font-family: ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, Consolas, monospace;
}

.tp-toolbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: #1e293b;
  padding: 8px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.tp-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  font-family: sans-serif;
}
.tp-btn-print { background: #0d9488; color: #fff; }
.tp-btn-print:hover:not(:disabled) { background: #0f766e; }
.tp-btn-print:disabled { opacity: .5; cursor: default; }
.tp-btn-close { background: #64748b; color: #fff; }
.tp-btn-close:hover { background: #475569; }

.tp-wrap { padding: 56px 0 24px; min-height: 100vh; }

.tp-center-msg {
  text-align: center;
  margin-top: 80px;
  font-family: sans-serif;
  color: #475569;
}

.tp-paper {
  width: 58mm;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
}

.struk { width: 100%; padding: 5px; font-size: 9.5px; color: #000; }
.struk-center { text-align: center; }
.struk-title { font-weight: 800; font-size: 11px; }
.struk-title-lg { font-size: 12px; }
.struk-sub { font-size: 8.5px; }
.struk-divider { border-top: 1px dashed #000; margin: 4px 0; }
.struk-row { display: flex; justify-content: space-between; gap: 4px; }
.struk-item { margin-bottom: 2px; }
.struk-item-name { font-weight: 700; }
.struk-racikan-bahan { font-size: 8.5px; padding-left: 5px; }
.struk-bold { font-weight: 800; }
.struk-thanks { margin-top: 6px; font-size: 8.5px; }
.struk-danger { color: #b91c1c; }
.struk-section-title { text-align: center; font-style: italic; margin: 8px 0 3px; }
.struk-section-title::before, .struk-section-title::after { content: ''; display: block; border-top: 1px dashed #000; margin: 3px 0; }
</style>
