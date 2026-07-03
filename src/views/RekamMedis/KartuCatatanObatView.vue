<template>
  <!-- wrapper: full-page when standalone, transparent when embedded -->
  <div :class="embedded ? 'kco-embedded' : 'kco-page'">
    <!-- Toolbar — standalone only -->
    <div v-if="!embedded" class="kco-toolbar no-print">
      <div class="kco-toolbar-left">
        <i class="pi pi-tablets"></i>
        <span>Kartu Catatan Obat Pasien</span>
        <span class="kco-noreg">{{ resolvedNoreg }}</span>
      </div>
      <div class="kco-toolbar-right">
        <label class="kco-lbl">Dari</label>
        <input type="date" v-model="form.startdate" class="kco-date-input" />
        <label class="kco-lbl">s/d</label>
        <input type="date" v-model="form.enddate" class="kco-date-input" />
        <button class="kco-btn-reload" :disabled="loading" @click="fetchData">
          <i class="pi pi-refresh"></i> Reload
        </button>
        <button class="kco-btn-print" @click="window.print()">
          <i class="pi pi-print"></i> Cetak
        </button>
      </div>
    </div>

    <!-- Filter bar — embedded only (screen only) -->
    <div v-if="embedded" class="kco-embed-filter no-print"></div>

    <!-- Document -->
    <div :class="embedded ? '' : 'kco-doc'">
      <!-- Doc header — standalone only -->
      <div v-if="!embedded" class="kco-doc-header">
        <div>
          <div class="kco-doc-title">KARTU CATATAN OBAT PASIEN</div>
          <div class="kco-doc-sub">Medication Administration Record (MAR)</div>
        </div>
        <table class="kco-info-tbl">
          <tbody>
            <tr>
              <td class="il">No. Register</td>
              <td class="is">:</td>
              <td class="iv">
                <strong>{{ resolvedNoreg }}</strong>
              </td>
              <td class="il">Nama Pasien</td>
              <td class="is">:</td>
              <td class="iv">
                <strong>{{ resolvedNama || '-' }}</strong>
              </td>
            </tr>
            <tr>
              <td class="il">Periode</td>
              <td class="is">:</td>
              <td class="iv">{{ form.startdate }} s/d {{ form.enddate }}</td>
              <td class="il">Ruangan</td>
              <td class="is">:</td>
              <td class="iv">{{ resolvedRuangan || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section title — embedded only -->
      <div v-if="embedded" class="rme-section-title" style="margin-bottom: 10px">
        <i class="pi pi-calendar-clock no-print" style="color: #4a7ab5"></i>
        KARTU CATATAN OBAT PASIEN
      </div>

      <!-- Loading -->
      <div v-if="loading" class="kco-state">
        <div class="kco-spinner"></div>
        <span>Memuat data...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="kco-state kco-state-err">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ error }}</span>
      </div>

      <!-- Empty -->
      <div v-else-if="!data.itembarang || data.itembarang.length === 0" class="kco-state">
        <i class="pi pi-inbox" style="font-size: 1.8rem; opacity: 0.35"></i>
        <span>Tidak ada data riwayat pemberian obat pada periode ini.</span>
      </div>

      <!-- Crosstab table -->
      <div v-else class="kco-tbl-wrap">
        <table class="kco-tbl">
          <thead>
            <tr>
              <th class="th-no">No.</th>
              <th class="th-kode">Kode</th>
              <th class="th-nama">Nama Obat / Alkes</th>
              <th class="th-sat">Sat.</th>
              <th v-for="(hdr, i) in data.header" :key="'h' + i" class="th-tgl">
                {{ hdr.datacaption }}
              </th>
              <th class="th-total">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in data.itembarang" :key="idx">
              <td class="td-no">{{ idx + 1 }}</td>
              <td class="td-kode">{{ item.BARCODE }}</td>
              <td class="td-nama">
                <span class="obat-nama">{{ item.NAMABARANG }}</span>
                <span
                  v-if="item.ITEM_PENGGANTI && item.ITEM_PENGGANTI !== ''"
                  class="obat-pengganti"
                  >&#8644; {{ item.ITEM_PENGGANTI }}</span
                >
              </td>
              <td class="td-sat">{{ item.SATUAN }}</td>
              <td v-for="(hdr, hi) in data.header" :key="'d' + hi" class="td-qty">
                <template v-if="getQty(item.BARCODE, hdr.tgl)">
                  <span class="qty-req">{{ getQty(item.BARCODE, hdr.tgl).req }}</span
                  ><span class="qty-sep">/</span
                  ><span class="qty-given">{{ getQty(item.BARCODE, hdr.tgl).given }}</span>
                </template>
                <span v-else class="qty-empty">—</span>
              </td>
              <td class="td-total">
                <span class="total-badge">{{ fmtQty(item.TOTAL) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div v-if="data.itembarang && data.itembarang.length > 0" class="kco-legend">
        <div class="legend-group">
          <span class="legend-title">Keterangan kolom tanggal :</span>
          <span class="legend-item">
            <span class="ldot req"></span>
            <strong>Angka kiri</strong> = Jumlah diresepkan
          </span>
          <span class="legend-sep">/</span>
          <span class="legend-item">
            <span class="ldot given"></span>
            <strong>Angka kanan</strong> = Jumlah diterima di ruangan
          </span>
        </div>
        <span class="legend-count">
          {{ data.itembarang.length }} item &mdash; {{ data.header.length }} hari
        </span>
      </div>

      <!-- Signature row -->
      <div v-if="data.itembarang && data.itembarang.length > 0" class="kco-sign-row">
        <div class="sign-box">
          <div class="sign-label">Petugas Farmasi</div>
          <div class="sign-space"></div>
          <div class="sign-name">( ……………………… )</div>
        </div>
        <div class="sign-box">
          <div class="sign-label">Perawat / Bidan</div>
          <div class="sign-space"></div>
          <div class="sign-name">( ……………………… )</div>
        </div>
        <div class="sign-box">
          <div class="sign-label">Dokter DPJP</div>
          <div class="sign-space"></div>
          <div class="sign-name">( ……………………… )</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const props = defineProps({
  noreg: { type: String, default: '' },
  dataPasien: { type: Object, default: () => ({}) },
  embedded: { type: Boolean, default: false },
})

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const resolvedNoreg = computed(() => props.noreg || route.query.noreg || '')
const resolvedNama = computed(() => props.dataPasien?.NAMAPASIEN || route.query.nama || '')
const resolvedRuangan = computed(
  () => props.dataPasien?.RUANGAN || props.dataPasien?.KAMAR || route.query.ruangan || '',
)

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(false)
const error = ref(null)
const data = ref({ header: [], itembarang: [], sub_item: [] })

const today = new Date()
const toStr = (d) => d.toISOString().slice(0, 10)

const form = ref({
  startdate: route.query.startdate || toStr(new Date(today.getFullYear(), today.getMonth(), 1)),
  enddate: route.query.enddate || toStr(today),
})

const fetchData = async () => {
  if (!resolvedNoreg.value) return
  loading.value = true
  error.value = null
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/get_data_kco`,
      {
        NOPENDAFTARAN: resolvedNoreg.value,
        MODE: 'KCO',
        id_client: id_client.value,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    console.log(res.data)
    const r = res.data?.response || {}
    data.value = {
      header: r.header || [],
      itembarang: r.itembarang || [],
      sub_item: r.sub_item || [],
    }
  } catch (e) {
    error.value = 'Gagal memuat data: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('kartu-obat', data.value.itembarang.length > 0)
  }
}

const fmtQty = (val) => {
  const n = parseFloat(val || 0)
  return n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2)
}

const getQty = (barcode, tgl) => {
  const m = data.value.sub_item.filter((s) => s.BARCODE === barcode && s.DT_ONLY === tgl)
  if (!m.length) return null
  return {
    req: fmtQty(m.reduce((sum, s) => sum + parseFloat(s.QTY_REQ || 0), 0)),
    given: fmtQty(m.reduce((sum, s) => sum + parseFloat(s.QTY || 0), 0)),
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* -- Wrappers -- */
.kco-page {
  background: #eef2f7;
}
.kco-embedded {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  color: inherit;
}

/* -- Standalone toolbar -- */
.kco-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(90deg, #162d4e, #1a3a5f, #1e4475);
  color: #fff;
  position: sticky;
  top: 0;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}
.kco-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.kco-toolbar-left .pi {
  color: #7eb8f0;
}
.kco-noreg {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 1px 10px;
  letter-spacing: 0.06em;
}
.kco-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.kco-embed-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.kco-lbl {
  font-size: 12px;
  color: #6a8ab0;
}
.kco-date-input {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
  border: 1px solid #b2c8dd;
  border-radius: 4px;
  padding: 3px 7px;
  color: #162d4e;
  outline: none;
  background: #f8fbff;
}
.kco-date-input:focus {
  border-color: #4a7ab5;
}
.kco-btn-reload,
.kco-btn-print {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}
.kco-btn-reload {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.kco-btn-reload:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}
.kco-btn-reload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.kco-btn-print {
  background: #4a7ab5;
  color: #fff;
}
.kco-btn-print:hover {
  background: #3a6aa0;
}

/* -- Standalone doc shell -- */
.kco-doc {
  margin: 16px auto;
  max-width: 1280px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 20px rgba(22, 45, 78, 0.13);
  overflow: hidden;
}
.kco-doc-header {
  color: #fff;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.kco-doc-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.kco-doc-sub {
  font-size: 12px;
  color: #a8c8e8;
  margin-top: 2px;
}
.kco-info-tbl {
  border-collapse: collapse;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
}
.kco-info-tbl td {
  padding: 1px 5px;
}
.il {
  color: #8fbcd9;
  white-space: nowrap;
}
.is {
  color: #8fbcd9;
  padding: 0 2px;
}
.iv {
  color: #fff;
}

/* -- States -- */
.kco-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 36px 16px;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  color: #7a9cc0;
  text-align: center;
}
.kco-state-err {
  color: #a03030;
}
.kco-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #dde8f4;
  border-top-color: #4a7ab5;
  border-radius: 50%;
  animation: kspin 0.7s linear infinite;
}
@keyframes kspin {
  to {
    transform: rotate(360deg);
  }
}

/* -- Crosstab table -- */
.kco-tbl-wrap {
  overflow: visible;
  padding: 8px 0 0;
}
.kco-tbl {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 12px;
  table-layout: fixed;
}
.kco-tbl th {
  background: #e6edf7;
  color: #162d4e;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 5px 4px;
  border: 1px solid #b2c8dd;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
  font-size: 11px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.kco-tbl td {
  padding: 4px 4px;
  border: 1px solid #cdd8e8;
  vertical-align: middle;
  overflow: hidden;
}
.kco-tbl tbody tr:nth-child(even) td {
  background: #f5f9ff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.kco-tbl tbody tr:hover td {
  background: #eef4fb !important;
}

/* Column widths — th-nama takes remaining width */
.th-no {
  width: 20px;
}
.th-kode {
  width: 56px;
}
.th-nama {
  text-align: left !important;
}
.th-sat {
  width: 40px;
}
.th-tgl {
  width: 95px;
}
.th-total {
  width: 34px;
}

/* Cell content */
.td-no {
  text-align: center;
  color: #5a7090;
}
.td-kode {
  font-size: 11px;
  color: #5a7090;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.td-nama {
  text-align: left;
}
.td-sat {
  text-align: center;
  font-weight: 600;
  color: #1a3a5f;
}
.td-qty {
  text-align: center;
  padding: 2px 1px;
  white-space: nowrap;
}
.td-total {
  text-align: center;
}
.obat-nama {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.obat-pengganti {
  display: inline-block;
  font-size: 10.5px;
  color: #7a5800;
  background: #fff8e1;
  border: 1px solid #f0d080;
  border-radius: 6px;
  padding: 0 4px;
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.qty-req {
  color: #1a3a5f;
  font-weight: 700;
}
.qty-sep {
  color: #b2bfd0;
  margin: 0 0.5px;
}
.qty-given {
  color: #2a6a3a;
  font-weight: 700;
}
.qty-empty {
  color: #ccd8e8;
}
.total-badge {
  display: inline-block;
  padding: 1px 6px;
  background: #162d4e;
  color: #fff;
  border-radius: 8px;
  font-weight: 700;
  font-size: 11px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* -- Legend -- */
.kco-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px 0;
  margin-top: 6px;
  background: #f5f8fc;
  border-top: 1px solid #dde8f4;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 11px;
  color: #4a6080;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.legend-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}
.legend-title {
  font-weight: 600;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.legend-sep {
  color: #b2bfd0;
  margin: 0 2px;
  font-weight: 700;
}
.legend-count {
  color: #6a80a0;
}
.ldot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ldot.req {
  background: #1a3a5f;
}
.ldot.given {
  background: #2a6a3a;
}

/* -- Signature -- */
.kco-sign-row {
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  padding: 14px 0 8px;
  border-top: 1px solid #e6edf7;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}
.sign-box {
  text-align: center;
  min-width: 100px;
}
.sign-label {
  font-size: 11px;
  color: #4a6080;
  margin-bottom: 22px;
}
.sign-space {
  height: 20px;
}
.sign-name {
  border-top: 1px solid #162d4e;
  font-size: 11px;
  color: #6a80a0;
  padding-top: 3px;
}

/* -- Print overrides -- */
@media print {
  .kco-tbl-wrap {
    overflow: visible;
  }
  .kco-tbl tbody tr:hover td {
    background: inherit !important;
  }
  .kco-doc {
    margin: 0;
    max-width: 100%;
    box-shadow: none;
    border-radius: 0;
  }
  .kco-doc-header {
    background: #162d4e !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    padding: 6px 10px;
  }
  .kco-sign-row {
    padding: 10px 0 5px;
  }
  .kco-page {
    background: #fff !important;
  }
}
</style>
