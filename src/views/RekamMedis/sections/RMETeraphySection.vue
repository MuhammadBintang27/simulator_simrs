<template>
  <div class="rme-section">
    <!-- ═══════════════════════════════════════════════════════
         BAGIAN 1 — TERAPI / RESEP OBAT
    ════════════════════════════════════════════════════════ -->
    <div class="rme-section-title">
      <i class="pi pi-shopping-bag no-print" style="color: #558b2f"></i>
      TERAPI / RESEP OBAT
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data terapi...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!resepList || resepList.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data terapi/resep obat.
    </div>

    <div v-else>
      <div v-for="resep in resepList" :key="resep.RECEIPT_NO" class="rme-lab-card">
        <div class="rme-lab-card-header">
          <div>
            <strong>No. Resep: </strong>
            <span class="mono">{{ resep.RECEIPT_NO }}</span>
          </div>
          <div class="rme-lab-meta">
            <span>Tgl: {{ fmtDate(resep.TANGGAL || resep.TGL_TRANS) }}</span>
            <span>Dokter: {{ resep.DPJP || resep.DOKTER || '-' }}</span>
            <span
              :class="[
                'rme-badge',
                resep.STATUS_KIRIM == 1 ? 'rme-badge-success' : 'rme-badge-info',
              ]"
            >
              {{ resep.STATUS_KIRIM == 1 ? 'Dikirim' : 'Lokal' }}
            </span>
          </div>
        </div>

        <table class="rme-tbl-data" v-if="resep._items && resep._items.length > 0">
          <thead>
            <tr>
              <th style="width: 5%">No.</th>
              <th style="width: 35%">Nama Obat</th>
              <th style="width: 15%">Jumlah</th>
              <th style="width: 15%">Satuan</th>
              <th style="width: 30%">Aturan Pakai / Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in resep._items" :key="i">
              <td class="text-center">{{ i + 1 }}</td>
              <td>
                <strong>{{ item.NAMA || item.CAPTION || item.NAMA_BARANG || '-' }}</strong>
              </td>
              <td>{{ item.QTY || item.JUMLAH || '-' }}</td>
              <td>{{ item.SATUAN || item.UNIT || '-' }}</td>
              <td>{{ item.REMARK || item.ATURAN_PAKAI || item.KETERANGAN || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-else-if="resep.OBAT_OBATAN == 1" class="rme-empty-note" style="margin-top: 6px">
          Detail obat belum tersedia.
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         BAGIAN 2 — KARTU CATATAN OBAT PASIEN (KCO)
    ════════════════════════════════════════════════════════ -->
    <div class="kco-block">
      <!-- Sub-header -->
      <div class="rme-section-title kco-title">
        <i class="pi pi-calendar-clock no-print" style="color: #4a7ab5"></i>
        KARTU CATATAN OBAT PASIEN
        <span class="kco-title-sub no-print">Riwayat Pemberian per Tanggal</span>

        <!-- Filter + Reload + Cetak (screen only) -->
        <div class="kco-toolbar no-print">
          <label class="kco-lbl">Dari</label>
          <input type="date" v-model="kcoForm.startdate" class="kco-date-input" />
          <label class="kco-lbl">s/d</label>
          <input type="date" v-model="kcoForm.enddate" class="kco-date-input" />
          <button class="kco-btn" :disabled="kcoLoading" @click="fetchKco" title="Reload">
            <i class="pi pi-refresh"></i>
          </button>
          <button
            class="kco-btn kco-btn-cetak"
            :disabled="kcoLoading || !kcoData.itembarang?.length"
            @click="openKcoPage"
          >
            <i class="pi pi-print"></i> Cetak KCO
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="kcoLoading" class="rme-loading-row">
        <span class="rme-loading-dot"></span> Memuat kartu catatan obat...
      </div>

      <!-- Error -->
      <div v-else-if="kcoError" class="rme-empty-note">
        <i class="pi pi-info-circle"></i> {{ kcoError }}
      </div>

      <!-- Empty -->
      <div
        v-else-if="!kcoData.itembarang || kcoData.itembarang.length === 0"
        class="rme-empty-note"
      >
        <i class="pi pi-minus-circle"></i> Tidak ada data riwayat pemberian obat.
      </div>

      <!-- Table (crosstab) -->
      <div v-else class="kco-table-wrap">
        <table class="kco-tbl">
          <thead>
            <tr>
              <th class="kth-no">No.</th>
              <th class="kth-kode">Kode</th>
              <th class="kth-nama">Nama Obat / Alkes</th>
              <th class="kth-sat">Satuan</th>
              <th v-for="(hdr, i) in kcoData.header" :key="'h' + i" class="kth-tgl">
                {{ hdr.datacaption }}
              </th>
              <th class="kth-total">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in kcoData.itembarang" :key="idx">
              <td class="ktd-no">{{ idx + 1 }}</td>
              <td class="ktd-kode">{{ item.BARCODE }}</td>
              <td class="ktd-nama">
                <span class="kco-obat-nama">{{ item.NAMABARANG }}</span>
                <span
                  v-if="item.ITEM_PENGGANTI && item.ITEM_PENGGANTI !== ''"
                  class="kco-obat-pengganti"
                >
                  <i class="pi pi-arrow-right-arrow-left"></i> {{ item.ITEM_PENGGANTI }}
                </span>
              </td>
              <td class="ktd-sat">{{ item.SATUAN }}</td>
              <!-- Crosstab — aggregated per BARCODE + DT_ONLY -->
              <td v-for="(hdr, hi) in kcoData.header" :key="'d' + hi" class="ktd-qty">
                <template v-if="getQty(item.BARCODE, hdr.tgl)">
                  <div class="kco-qty-cell">
                    <span class="kco-qty-req">{{ getQty(item.BARCODE, hdr.tgl).req }}</span>
                    <span class="kco-qty-sep">/</span>
                    <span class="kco-qty-given">{{ getQty(item.BARCODE, hdr.tgl).given }}</span>
                  </div>
                </template>
                <span v-else class="kco-qty-empty">—</span>
              </td>
              <td class="ktd-total">
                <span class="kco-total-badge">{{ fmtQty(item.TOTAL) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div v-if="kcoData.itembarang && kcoData.itembarang.length > 0" class="kco-legend-row">
        <div class="kco-legend">
          <span class="kco-legend-title">Keterangan kolom tanggal :</span>
          <span class="kco-legend-item">
            <span class="kco-ldot req"></span>
            <strong>Angka kiri</strong>&nbsp;= Jumlah diresepkan
          </span>
          <span class="kco-legend-sep">/</span>
          <span class="kco-legend-item">
            <span class="kco-ldot given"></span>
            <strong>Angka kanan</strong>&nbsp;= Jumlah diterima di ruangan
          </span>
        </div>
        <span class="kco-legend-summary">
          Total <strong>{{ kcoData.itembarang.length }}</strong> item
          <template v-if="kcoData.header && kcoData.header.length > 0">
            &mdash; <strong>{{ kcoData.header.length }}</strong> hari
          </template>
        </span>
      </div>
    </div>
    <!-- /kco-block -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

/* ── Resep / Terapi ─────────────────────────────────────────────── */
const loading = ref(true)
const error = ref(null)
const resepList = ref([])

const fmtDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return d
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_data_kco`,
      {
        NOPENDAFTARAN: props.noreg,
        id_client: id_client.value,
        MODE: 2,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    resepList.value = response.data?.response || []
  } catch (e) {
    error.value = 'Gagal memuat data terapi: ' + (e.message || '')
  } finally {
    loading.value = false
  }
}

/* ── Kartu Catatan Obat (KCO) ───────────────────────────────────── */
const kcoLoading = ref(false)
const kcoError = ref(null)
const kcoData = ref({ header: [], itembarang: [], sub_item: [] })

const today = new Date()
const toDateStr = (d) => d.toISOString().slice(0, 10)

const kcoForm = ref({
  startdate: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)),
  enddate: toDateStr(today),
})

const fetchKco = async () => {
  if (!props.noreg) return
  kcoLoading.value = true
  kcoError.value = null
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/apotik/get_data_kco`,
      {
        NOREGISTER: props.noreg,
        MODE: 'KCO',
        startdate: kcoForm.value.startdate,
        enddate: kcoForm.value.enddate,
        IDCLIENT: id_client.value,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    const data = res.data?.response || {}
    kcoData.value = {
      header: data.header || [],
      itembarang: data.itembarang || [],
      sub_item: data.sub_item || [],
    }
  } catch (e) {
    kcoError.value = 'Gagal memuat data KCO: ' + (e.message || '')
  } finally {
    kcoLoading.value = false
  }
}

/* ── Helpers ────────────────────────────────────────────────────── */
const fmtQty = (val) => {
  const n = parseFloat(val || 0)
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2)
}

const getQty = (barcode, tgl) => {
  const matches = kcoData.value.sub_item.filter((s) => s.BARCODE === barcode && s.DT_ONLY === tgl)
  if (!matches.length) return null
  return {
    req: fmtQty(matches.reduce((sum, s) => sum + parseFloat(s.QTY_REQ || 0), 0)),
    given: fmtQty(matches.reduce((sum, s) => sum + parseFloat(s.QTY || 0), 0)),
  }
}

const openKcoPage = () => {
  const url = router.resolve({
    name: 'KartuCatatanObatView',
    query: {
      noreg: props.noreg,
      startdate: kcoForm.value.startdate,
      enddate: kcoForm.value.enddate,
      nama: props.dataPasien?.NAMAPASIEN || '',
      ruangan: props.dataPasien?.RUANGAN || props.dataPasien?.KAMAR || '',
    },
  })
  window.open(url.href, '_blank')
}

onMounted(() => {
  fetchData()
  fetchKco()
})
</script>

<style scoped>
/* ── KCO block wrapper ──────────────────────────────────────────── */
.kco-block {
  margin-top: 20px;
}

.kco-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.kco-title-sub {
  font-size: 0.72rem;
  font-weight: 400;
  color: #6a8ab0;
  letter-spacing: 0.02em;
}

.kco-toolbar {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.kco-lbl {
  font-size: 0.72rem;
  color: #6a8ab0;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.kco-date-input {
  border: 1px solid #b2c8dd;
  border-radius: 4px;
  padding: 3px 7px;
  font-size: 0.75rem;
  color: #162d4e;
  outline: none;
  background: #f8fbff;
}

.kco-date-input:focus {
  border-color: #4a7ab5;
}

.kco-btn {
  border: 1px solid #b2c8dd;
  border-radius: 4px;
  background: #eef4fb;
  color: #4a7ab5;
  padding: 3px 9px;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.kco-btn:hover:not(:disabled) {
  background: #ddeeff;
}

.kco-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.kco-btn-cetak {
  background: #162d4e;
  color: #fff;
  border-color: #162d4e;
  font-weight: 600;
}

.kco-btn-cetak:hover:not(:disabled) {
  background: #1a3a5f;
}

/* ── Table ──────────────────────────────────────────────────────── */
.kco-table-wrap {
  overflow-x: auto;
  margin-top: 8px;
}

.kco-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  min-width: 480px;
}

.kco-tbl th {
  background: #e6edf7;
  color: #162d4e;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 6px 8px;
  border: 1px solid #b2c8dd;
  white-space: nowrap;
  vertical-align: middle;
  text-align: center;
}

.kco-tbl td {
  padding: 5px 7px;
  border: 1px solid #cdd8e8;
  vertical-align: middle;
}

.kco-tbl tbody tr:hover {
  background: #f0f6fc;
}

.kth-no {
  width: 34px;
}
.kth-kode {
  width: 88px;
}
.kth-nama {
  min-width: 160px;
  text-align: left !important;
}
.kth-sat {
  width: 60px;
}
.kth-tgl {
  min-width: 72px;
}
.kth-total {
  width: 58px;
}

.ktd-no {
  text-align: center;
  font-size: 0.75rem;
  color: #4a6080;
}
.ktd-kode {
  font-family: monospace;
  font-size: 0.74rem;
  color: #4a6080;
}
.ktd-nama {
  text-align: left;
}
.ktd-sat {
  text-align: center;
  font-weight: 600;
  font-size: 0.76rem;
  color: #1a3a5f;
}
.ktd-qty {
  text-align: center;
  padding: 3px;
}
.ktd-total {
  text-align: center;
}

.kco-obat-nama {
  font-weight: 600;
  color: #162d4e;
  display: block;
}

.kco-obat-pengganti {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  color: #7a5800;
  background: #fff8e1;
  border: 1px solid #f0d080;
  border-radius: 10px;
  padding: 1px 5px;
  margin-top: 2px;
}

.kco-obat-pengganti .pi {
  font-size: 0.62rem;
}

.kco-qty-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  line-height: 1.2;
}

.kco-qty-req {
  color: #1a3a5f;
  font-weight: 700;
}
.kco-qty-sep {
  color: #aac;
  margin: 0 1px;
}
.kco-qty-given {
  color: #2a6a3a;
  font-weight: 700;
}

.kco-qty-empty {
  color: #ccd8e8;
  font-size: 0.8rem;
}

.kco-total-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #162d4e;
  color: #fff;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.76rem;
}

/* ── Legend ─────────────────────────────────────────────────────── */
.kco-legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 10px;
  margin-top: 6px;
  background: #f5f8fc;
  border: 1px solid #dde8f4;
  border-radius: 6px;
  font-size: 0.76rem;
}

.kco-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  color: #4a6080;
}

.kco-legend-title {
  font-weight: 600;
}

.kco-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.kco-legend-sep {
  color: #aac;
  font-weight: 700;
  margin: 0 2px;
}

.kco-ldot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kco-ldot.req {
  background: #1a3a5f;
}
.kco-ldot.given {
  background: #2a6a3a;
}

.kco-legend-summary {
  color: #6a80a0;
}

/* ── Print ──────────────────────────────────────────────────────── */
@media print {
  .kco-table-wrap {
    overflow-x: visible;
  }

  .kco-tbl th {
    background: #e6edf7 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .kco-total-badge {
    background: #162d4e !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .kco-legend-row {
    background: #f5f8fc !important;
  }
}
</style>
