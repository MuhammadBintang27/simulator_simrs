<template>
  <div class="rme-section">
    <div class="rme-section-title bill-section-title">
      <i class="pi pi-receipt no-print" style="color: #e65100"></i>
      RINCIAN TAGIHAN PASIEN
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data tagihan...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data tagihan untuk kunjungan ini.
    </div>

    <div v-else class="bill-body">
      <!-- ── Info Pasien & Transaksi ─────────────────────────────────────────── -->
      <div class="bill-info-row">
        <!-- Kiri: Data Pasien -->
        <div class="bill-info-col">
          <div class="bill-info-hdr">DATA PASIEN</div>
          <table class="bill-info-tbl">
            <tbody>
              <tr>
                <td class="bi-lbl">Nama Pasien</td>
                <td class="bi-sep">:</td>
                <td class="bi-val bi-accent">{{ billing.PASIEN?.NAMAPASIEN || '—' }}</td>
              </tr>
              <tr>
                <td class="bi-lbl">No. RM</td>
                <td class="bi-sep">:</td>
                <td class="bi-val bi-bold">{{ billing.PASIEN?.NOMR || '—' }}</td>
              </tr>
              <tr>
                <td class="bi-lbl">Usia</td>
                <td class="bi-sep">:</td>
                <td class="bi-val">{{ billing.PASIEN?.USIA_LENGKAP || '—' }}</td>
              </tr>
              <tr>
                <td class="bi-lbl">Alamat</td>
                <td class="bi-sep">:</td>
                <td class="bi-val">
                  {{ billing.PASIEN?.ALAMAT
                  }}{{ billing.PASIEN?.namakecamatan ? ', ' + billing.PASIEN.namakecamatan : ''
                  }}{{ billing.PASIEN?.namakota ? ', ' + billing.PASIEN.namakota : '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Kanan: Data Kunjungan -->
        <div class="bill-info-col">
          <div class="bill-info-hdr">DATA KUNJUNGAN</div>
          <table class="bill-info-tbl">
            <tbody>
              <tr>
                <td class="bi-lbl">No. Register</td>
                <td class="bi-sep">:</td>
                <td class="bi-val bi-accent bi-bold">{{ billing.NOREGISTER || '—' }}</td>
              </tr>
              <tr>
                <td class="bi-lbl">Poli / Ruang</td>
                <td class="bi-sep">:</td>
                <td class="bi-val">{{ billing.RUANGPOLI || '—' }}</td>
              </tr>
              <tr>
                <td class="bi-lbl">Dokter</td>
                <td class="bi-sep">:</td>
                <td class="bi-val">{{ billing.NAMADOKTER || '—' }}</td>
              </tr>
              <tr>
                <td class="bi-lbl">Tgl. Masuk</td>
                <td class="bi-sep">:</td>
                <td class="bi-val">{{ formatDateTime(billing.MASUKPOLY) }}</td>
              </tr>
              <tr>
                <td class="bi-lbl">Tgl. Selesai</td>
                <td class="bi-sep">:</td>
                <td class="bi-val">{{ formatDateTime(billing.KELUARPOLY) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Tabel Rincian Tagihan ────────────────────────────────────────────── -->
      <div class="bill-tbl-wrap">
        <table class="bill-tbl">
          <thead>
            <tr>
              <th class="col-item">Item / Layanan</th>
              <th class="col-harga">Harga</th>
              <th class="col-qty">Qty</th>
              <th class="col-sat">Satuan</th>
              <th class="col-sub">Subtotal</th>
              <th class="col-tgl">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(items, kategori) in groupedByCategory" :key="kategori">
              <!-- Header kategori -->
              <tr class="bill-kategori-row">
                <td colspan="6">
                  <span class="bill-kategori-lbl">{{ kategori }}</span>
                </td>
              </tr>
              <!-- Item rows -->
              <tr
                v-for="(item, idx) in items"
                :key="idx"
                :class="idx % 2 === 0 ? 'bill-row-even' : 'bill-row-odd'"
              >
                <td>{{ item.ITEM }}</td>
                <td class="text-right">{{ formatCurrency(item.HARGA) }}</td>
                <td class="text-center">{{ item.QTY }}</td>
                <td class="text-center">{{ item.SATUAN }}</td>
                <td class="text-right">{{ formatCurrency(item.TOTALAMOUNT) }}</td>
                <td>{{ item.TANGGAL }}</td>
              </tr>
              <!-- Subtotal per kategori -->
              <tr class="bill-subtotal-row">
                <td colspan="4" class="text-right">
                  Subtotal <em>{{ kategori }}</em>
                </td>
                <td class="text-right">
                  {{ formatCurrency(items.reduce((s, i) => s + Number(i.TOTALAMOUNT || 0), 0)) }}
                </td>
                <td></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ── Total ───────────────────────────────────────────────────────────── -->
      <div class="bill-total-box">
        <div class="bill-total-label">TOTAL PEMBAYARAN</div>
        <div class="bill-total-amount">Rp {{ formatCurrency(totalAmount) }}</div>
      </div>

      <!-- ── Footer TTD Kasir ────────────────────────────────────────────────── -->
      <div class="bill-footer">
        <div class="bill-footer-inner">
          <div class="bill-footer-city">{{ formatDateTime(billing.KELUARPOLY) }}</div>
          <div class="bill-footer-title">Petugas Kasir</div>
          <div class="bill-footer-space"></div>
          <div class="bill-footer-line"></div>
          <div class="bill-footer-name">(…………………………………)</div>
        </div>
      </div>

      <div class="bill-disclaimer">
        — Dokumen ini dicetak secara elektronik sebagai bukti rincian tagihan pasien
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})

// ── State ──────────────────────────────────────────────────────────────────────
const loading = ref(true)
const error = ref(null)
const billing = ref(null)

// ── Computed ───────────────────────────────────────────────────────────────────
const hasData = computed(() => !!billing.value?.NOREGISTER)

const groupedByCategory = computed(() => {
  if (!billing.value?.DETAIL) return {}
  return billing.value.DETAIL.reduce((groups, item) => {
    const kat = item.KATEGORI || 'Lainnya'
    if (!groups[kat]) groups[kat] = []
    groups[kat].push(item)
    return groups
  }, {})
})

const totalAmount = computed(
  () => billing.value?.DETAIL?.reduce((sum, i) => sum + parseFloat(i.TOTALAMOUNT || 0), 0) || 0,
)

const tanggalCetak = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
})

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val || 0)

const formatDateTime = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return date
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Fetch ──────────────────────────────────────────────────────────────────────
const fetchData = async () => {
  const norm = props.dataPasien?.NOMR
  if (!props.noreg || !norm) return
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const paramURL = `${norm}/${id_client.value}/${props.noreg}`
    const res = await axios.post(`${url}/index.php/api/laporan/history_berobat_pasien/${paramURL}`)
    if (res.data && res.data.length > 0) {
      const raw = res.data[0]
      raw.PASIEN = Array.isArray(raw.PASIEN) ? raw.PASIEN[0] : raw.PASIEN
      billing.value = raw
    } else {
      billing.value = null
    }
  } catch (e) {
    error.value = 'Gagal memuat data tagihan: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    reportSectionData('billing', !!billing.value?.NOREGISTER)
  }
}

// Tunggu NOMR tersedia (async dari parent) lalu fetch
watch(
  () => props.dataPasien?.NOMR,
  (nomr) => {
    if (nomr && props.noreg) fetchData()
  },
  { immediate: true },
)
</script>

<style scoped>
/* ── Section title override ─────────────────────────────────────── */
.bill-section-title {
  /* warna orange — billing berbeda dari section medis */
  background: linear-gradient(90deg, #bf360c 0%, #e64a19 60%, #ff5722 100%) !important;
}

/* ── Body ───────────────────────────────────────────────────────── */
.bill-body {
  font-size: 11px;
  color: #212529;
}

/* ── Info block ─────────────────────────────────────────────────── */
.bill-info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-bottom: 1px solid #ffd5b0;
}
.bill-info-col {
  padding: 0;
}
.bill-info-col:first-child {
  border-right: 1px solid #ffd5b0;
}

.bill-info-hdr {
  background: linear-gradient(90deg, #fff4e0 0%, #ffe0b2 100%);
  color: #bf360c;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-bottom: 1px solid #ffd5b0;
}

.bill-info-tbl {
  width: 100%;
  border-collapse: collapse;
  padding: 6px 10px;
}
.bill-info-tbl td {
  padding: 2px 4px;
  vertical-align: top;
  font-size: 11px;
}
.bi-lbl {
  width: 95px;
  color: #795548;
  flex-shrink: 0;
  padding-left: 10px !important;
}
.bi-sep {
  width: 10px;
  color: #bcaaa4;
  text-align: center;
}
.bi-val {
  font-weight: 500;
  padding-right: 10px !important;
}
.bi-accent {
  color: #bf360c;
}
.bi-bold {
  font-weight: 700;
}

/* ── Rincian table ──────────────────────────────────────────────── */
.bill-tbl-wrap {
  overflow-x: auto;
}
.bill-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
}
.bill-tbl thead th {
  background: #fff4e0;
  color: #663c00;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.04em;
  padding: 5px 8px;
  text-align: left;
  border-bottom: 2px solid #ffd5b0;
  white-space: nowrap;
}
.col-harga,
.col-sub {
  text-align: right !important;
}
.col-qty,
.col-sat {
  text-align: center !important;
  width: 50px;
}
.col-tgl {
  width: 90px;
}
.col-item {
  min-width: 160px;
}

/* Kategori header row */
.bill-kategori-row td {
  background: #ffecd2;
  padding: 3px 8px;
  border-top: 1px solid #ffd5b0;
  border-bottom: 1px solid #ffd5b0;
}
.bill-kategori-lbl {
  font-size: 10px;
  font-weight: 700;
  color: #bf360c;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Detail rows — striped orange */
.bill-row-even td {
  background: #fffaf5;
}
.bill-row-odd td {
  background: #fff3e8;
}
.bill-tbl td {
  padding: 3px 8px;
  border-bottom: 1px solid #f5e6d8;
  vertical-align: middle;
}

/* Subtotal row */
.bill-subtotal-row td {
  background: #fff8f0;
  border-top: 1px solid #ffd5b0;
  border-bottom: 2px solid #ffd5b0;
  font-size: 10.5px;
  padding: 3px 8px;
  font-weight: 600;
  color: #663c00;
  font-style: italic;
}

.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}

/* ── Total box ──────────────────────────────────────────────────── */
.bill-total-box {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #fff8f0 0%, #ffecd2 100%);
  border-top: 2px solid #ffd5b0;
  border-bottom: 2px solid #ffd5b0;
  margin-top: 4px;
}
.bill-total-label {
  font-size: 11px;
  font-weight: 700;
  color: #795548;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.bill-total-amount {
  font-size: 18px;
  font-weight: 700;
  color: #e65100;
  letter-spacing: 0.02em;
}

/* ── Footer TTD ─────────────────────────────────────────────────── */
.bill-footer {
  display: flex;
  justify-content: flex-end;
  padding: 14px 20px 6px;
}
.bill-footer-inner {
  text-align: center;
}
.bill-footer-city {
  font-size: 11px;
  color: #6c757d;
  margin-bottom: 3px;
}
.bill-footer-title {
  font-size: 11px;
  font-weight: 700;
  color: #bf360c;
  margin-bottom: 4px;
}
.bill-footer-space {
  height: 40px;
}
.bill-footer-line {
  width: 160px;
  border-top: 1px solid #343a40;
  margin: 4px auto;
}
.bill-footer-name {
  font-size: 11px;
  color: #495057;
}

/* ── Disclaimer ─────────────────────────────────────────────────── */
.bill-disclaimer {
  text-align: center;
  font-size: 10px;
  color: #adb5bd;
  font-style: italic;
  padding: 6px 12px 10px;
  border-top: 1px dashed #dee2e6;
}

/* ── Print ──────────────────────────────────────────────────────── */
@media print {
  .bill-kategori-row td {
    background: #ffecd2 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bill-row-even td {
    background: #fffaf5 !important;
  }
  .bill-row-odd td {
    background: #fff3e8 !important;
  }
  .bill-total-box {
    background: #ffecd2 !important;
  }
  .bill-section-title {
    background: #bf360c !important;
  }
}
</style>
