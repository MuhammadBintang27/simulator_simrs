<template>
  <div class="print-page">
    <!-- ══ HEADER RUMAH SAKIT ══ -->
    <div class="print-header">
      <img :src="LINK_LOGO || '/img/logo.png'" class="print-logo" alt="Logo RS" />
      <div class="print-rs-info">
        <h2 class="print-rs-name">{{ company || 'RUMAH SAKIT' }}</h2>
        <p class="print-rs-addr">{{ ALAMAT || '' }}</p>
        <p class="print-rs-unit">Unit Transfusi Darah (UTD)</p>
      </div>
    </div>
    <div class="print-divider"></div>

    <!-- ══ MODE: SINGLE (Detail 1 Sesi) ══ -->
    <template v-if="mode === 'single' && sesiData">
      <h3 class="print-title">FORMULIR SESI DONOR DARAH</h3>

      <!-- Info sesi -->
      <div class="print-meta-row">
        <span class="print-meta-item">
          <span class="print-meta-lbl">No. Sesi</span>
          <span class="print-meta-val mono">{{ sesiData.no_sesi || '-' }}</span>
        </span>
        <span class="print-meta-item">
          <span class="print-meta-lbl">Tanggal Donor</span>
          <span class="print-meta-val">{{ formatTgl(sesiData.tgl_donor) }}</span>
        </span>
        <span class="print-meta-item">
          <span class="print-meta-lbl">Jenis Donor</span>
          <span class="print-meta-val">{{ jenisDonorLabel(sesiData.jenis_donor) }}</span>
        </span>
        <span class="print-meta-item">
          <span class="print-meta-lbl">Petugas</span>
          <span class="print-meta-val">{{ sesiData.id_petugas || '-' }}</span>
        </span>
      </div>

      <!-- Data Pendonor -->
      <div class="print-section">
        <div class="print-section-title">DATA PENDONOR</div>
        <table class="print-info-table">
          <tr>
            <td class="print-td-lbl">Nama Pendonor</td>
            <td class="print-td-sep">:</td>
            <td class="print-td-val">
              <strong>{{ sesiData.nama_donor || '-' }}</strong>
            </td>
            <td class="print-td-lbl">No. Rekam Medis</td>
            <td class="print-td-sep">:</td>
            <td class="print-td-val mono">{{ sesiData.norm || '-' }}</td>
          </tr>
          <tr>
            <td class="print-td-lbl">Jenis Kelamin</td>
            <td class="print-td-sep">:</td>
            <td class="print-td-val">
              {{ sesiData.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki' }}
            </td>
            <td class="print-td-lbl">Tanggal Lahir</td>
            <td class="print-td-sep">:</td>
            <td class="print-td-val">{{ formatTgl(sesiData.tgl_lahir) }}</td>
          </tr>
        </table>
      </div>

      <!-- Tanda Vital -->
      <div class="print-section">
        <div class="print-section-title">PEMERIKSAAN FISIK & TANDA VITAL</div>
        <table class="print-vital-table">
          <thead>
            <tr>
              <th>Berat Badan</th>
              <th>Tekanan Darah</th>
              <th>Hemoglobin</th>
              <th>Suhu Tubuh</th>
              <th>Denyut Nadi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ sesiData.berat_badan ?? '-' }} <small>kg</small></td>
              <td>{{ sesiData.tekanan_darah || '-' }} <small>mmHg</small></td>
              <td>{{ sesiData.hemoglobin ?? '-' }} <small>g/dL</small></td>
              <td>{{ sesiData.suhu_tubuh ?? '-' }} <small>°C</small></td>
              <td>{{ sesiData.nadi ?? '-' }} <small>/menit</small></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Riwayat Penyakit -->
      <div class="print-section">
        <div class="print-section-title">RIWAYAT PENYAKIT</div>
        <div class="print-textarea-box">
          {{ sesiData.riwayat_penyakit || '— Tidak ada —' }}
        </div>
      </div>

      <!-- Hasil Screening -->
      <div class="print-section">
        <div class="print-section-title">HASIL SCREENING</div>
        <div class="print-screening-row">
          <span
            :class="[
              'print-screening-badge',
              'badge-' + (sesiData.hasil_screening || '').toLowerCase(),
            ]"
          >
            {{ sesiData.hasil_screening || '-' }}
          </span>
          <span v-if="sesiData.alasan_tolak" class="print-alasan">
            Alasan: {{ sesiData.alasan_tolak }}
          </span>
        </div>
      </div>

      <!-- Tanda Tangan -->
      <div class="print-signature-row">
        <div class="print-sig-box">
          <div class="print-sig-title">Pendonor</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">
            ( {{ sesiData.nama_donor || '.........................' }} )
          </div>
        </div>
        <div class="print-sig-box">
          <div class="print-sig-title">Petugas UTD</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">
            ( {{ sesiData.id_petugas || '.........................' }} )
          </div>
        </div>
        <div class="print-sig-box">
          <div class="print-sig-title">Mengetahui</div>
          <div class="print-sig-space"></div>
          <div class="print-sig-name">( ......................... )</div>
        </div>
      </div>

      <div class="print-footer-note">Dicetak pada: {{ nowStr }} &nbsp;|&nbsp; {{ company }}</div>
    </template>

    <!-- ══ MODE: LIST (Tabel Daftar) ══ -->
    <template v-else-if="mode === 'list' && listData.length > 0">
      <h3 class="print-title">DAFTAR SESI DONOR DARAH</h3>
      <p class="print-period">
        Periode: <strong>{{ route.query.tgl_dari }}</strong> s/d
        <strong>{{ route.query.tgl_sampai }}</strong>
        &nbsp;|&nbsp; Total: <strong>{{ listData.length }}</strong> sesi
      </p>

      <table class="print-list-table">
        <thead>
          <tr>
            <th style="width: 30px">#</th>
            <th>No. Sesi</th>
            <th>Pendonor</th>
            <th>RM</th>
            <th>Tgl. Donor</th>
            <th>Jenis Donor</th>
            <th>BB</th>
            <th>TD</th>
            <th>Hb</th>
            <th>Suhu</th>
            <th>Nadi</th>
            <th>Screening</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in listData" :key="row.no_sesi">
            <td class="text-center">{{ i + 1 }}</td>
            <td class="mono">{{ row.no_sesi }}</td>
            <td>
              {{ row.nama_donor }}
              <small style="color: #6b7280">({{ row.jenis_kelamin }})</small>
            </td>
            <td class="mono">{{ row.norm }}</td>
            <td>{{ row.tgl_donor }}</td>
            <td style="font-size: 9px">{{ jenisDonorLabel(row.jenis_donor) }}</td>
            <td class="text-center">{{ row.berat_badan }}</td>
            <td class="text-center">{{ row.tekanan_darah }}</td>
            <td class="text-center">{{ row.hemoglobin }}</td>
            <td class="text-center">{{ row.suhu_tubuh }}</td>
            <td class="text-center">{{ row.nadi }}</td>
            <td class="text-center">
              <span :class="['tbl-badge', 'badge-' + (row.hasil_screening || '').toLowerCase()]">
                {{ row.hasil_screening }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Ringkasan -->
      <div class="print-summary-row">
        <span class="print-sum-item sum-total">Total: {{ listData.length }}</span>
        <span class="print-sum-item sum-layak">Layak: {{ countBy('LAYAK') }}</span>
        <span class="print-sum-item sum-ditunda">Ditunda: {{ countBy('DITUNDA') }}</span>
        <span class="print-sum-item sum-ditolak">Ditolak: {{ countBy('DITOLAK') }}</span>
      </div>

      <div class="print-footer-note">Dicetak pada: {{ nowStr }} &nbsp;|&nbsp; {{ company }}</div>
    </template>

    <!-- ══ FALLBACK ══ -->
    <div v-else class="print-no-data">
      <p>Data tidak tersedia. Silakan tutup tab ini dan coba lagi.</p>
    </div>

    <!-- ══ TOMBOL PRINT (hidden saat print) ══ -->
    <div class="no-print print-action-bar">
      <button class="btn-print" @click="doPrint">
        <i class="pi pi-print me-2"></i>Cetak / Simpan PDF
      </button>
      <button class="btn-close-tab" @click="doClose">Tutup</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const route = useRoute()
const authStore = useAuthStore()
const { company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

// ── Mode: 'single' | 'list' ───────────────────────────────
const mode = computed(() => route.query.mode ?? 'single')
const sesiData = ref(null)
const listData = ref([])

// ── Options (lookup label) ────────────────────────────────
const jenisDonorOptions = [
  { label: 'Darah Lengkap (Whole Blood)', value: 'WB' },
  { label: 'Apheresis Trombosit', value: 'APHERESIS_TC' },
  { label: 'Apheresis Plasma', value: 'APHERESIS_PLASMA' },
  { label: 'Apheresis Eritrosit', value: 'APHERESIS_RBC' },
  { label: 'Darah Tali Pusat', value: 'CORD_BLOOD' },
]

// ── Helpers ───────────────────────────────────────────────
const formatTgl = (val) => {
  if (!val) return '-'
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return val
  }
}

const jenisDonorLabel = (val) => jenisDonorOptions.find((o) => o.value === val)?.label ?? val ?? '-'

const countBy = (val) => listData.value.filter((d) => d.hasil_screening === val).length

const nowStr = new Date().toLocaleString('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// ── Action handlers ───────────────────────────────────────
const doPrint = () => window.print()
const doClose = () => window.close()

// ── Load data dari sessionStorage ────────────────────────
onMounted(() => {
  if (mode.value === 'single') {
    const raw = sessionStorage.getItem('print_sesi_donor')
    if (raw) {
      try {
        sesiData.value = JSON.parse(raw)
      } catch {
        /* ignore */
      }
    }
  } else {
    const raw = sessionStorage.getItem('print_sesi_donor_list')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        listData.value = parsed.list ?? []
      } catch {
        /* ignore */
      }
    }
  }

  // Auto print setelah render
  setTimeout(() => window.print(), 600)
})
</script>

<style>
/* ── Reset & base ── */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #111;
  background: #fff;
}

.print-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 28px;
}

/* ── Header RS ── */
.print-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 6px;
}
.print-logo {
  width: 65px;
  height: 65px;
  object-fit: contain;
  flex-shrink: 0;
}
.print-rs-name {
  font-size: 16px;
  font-weight: 800;
  color: #1a365d;
  margin-bottom: 2px;
}
.print-rs-addr {
  font-size: 11px;
  color: #4a5568;
  margin-bottom: 1px;
}
.print-rs-unit {
  font-size: 11px;
  color: #2b6cb0;
  font-weight: 700;
}
.print-divider {
  border-bottom: 2.5px double #1a365d;
  margin-bottom: 10px;
}

/* ── Title ── */
.print-title {
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 4px;
  color: #1a365d;
}
.print-period {
  text-align: center;
  font-size: 11px;
  color: #4a5568;
  margin-bottom: 12px;
}

/* ── Meta row (No. Sesi, Tgl, dll) ── */
.print-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  background: #f7fafc;
  border: 1px solid #bee3f8;
  border-left: 4px solid #2b6cb0;
  border-radius: 3px;
  padding: 8px 12px;
  margin-bottom: 12px;
}
.print-meta-item {
  display: flex;
  gap: 6px;
  align-items: baseline;
}
.print-meta-lbl {
  font-size: 10px;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  white-space: nowrap;
}
.print-meta-val {
  font-size: 12px;
  font-weight: 600;
  color: #1a202c;
}

/* ── Section block ── */
.print-section {
  margin-bottom: 12px;
}
.print-section-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #2b6cb0;
  border-bottom: 1px solid #bee3f8;
  padding-bottom: 3px;
  margin-bottom: 6px;
}

/* ── Info table (pasien) ── */
.print-info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.print-info-table tr + tr td {
  padding-top: 4px;
}
.print-td-lbl {
  width: 18%;
  color: #4a5568;
  white-space: nowrap;
}
.print-td-sep {
  width: 2%;
  padding: 0 4px;
  color: #718096;
}
.print-td-val {
  width: 28%;
  font-weight: 600;
  padding-right: 16px;
}

/* ── Vital table ── */
.print-vital-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: center;
}
.print-vital-table thead tr {
  background: #ebf8ff;
}
.print-vital-table th {
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #2b6cb0;
  border: 1px solid #bee3f8;
}
.print-vital-table td {
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 14px;
}
.print-vital-table td small {
  font-size: 9px;
  font-weight: 400;
  color: #718096;
}

/* ── Riwayat penyakit ── */
.print-textarea-box {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 3px;
  padding: 8px 10px;
  min-height: 36px;
  font-size: 12px;
  color: #4a5568;
}

/* ── Hasil Screening ── */
.print-screening-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.print-screening-badge {
  display: inline-block;
  padding: 5px 20px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.05em;
}
.print-alasan {
  font-size: 11px;
  color: #c53030;
}
.badge-layak {
  background: #c6f6d5;
  color: #22543d;
  border: 1.5px solid #68d391;
}
.badge-ditunda {
  background: #fefcbf;
  color: #744210;
  border: 1.5px solid #f6e05e;
}
.badge-ditolak {
  background: #fed7d7;
  color: #742a2a;
  border: 1.5px solid #fc8181;
}

/* ── Signature ── */
.print-signature-row {
  display: flex;
  gap: 16px;
  margin-top: 28px;
  margin-bottom: 16px;
}
.print-sig-box {
  flex: 1;
  text-align: center;
}
.print-sig-title {
  font-size: 11px;
  font-weight: 700;
  color: #4a5568;
  margin-bottom: 4px;
}
.print-sig-space {
  height: 60px;
  border-bottom: 1px solid #a0aec0;
  margin-bottom: 4px;
}
.print-sig-name {
  font-size: 11px;
  color: #1a202c;
}

/* ── List table ── */
.print-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
  margin-bottom: 10px;
}
.print-list-table th {
  background: #ebf8ff;
  color: #2b6cb0;
  font-weight: 700;
  font-size: 9.5px;
  text-transform: uppercase;
  padding: 5px 6px;
  border: 1px solid #bee3f8;
  text-align: center;
}
.print-list-table td {
  padding: 4px 6px;
  border: 1px solid #e2e8f0;
  vertical-align: middle;
}
.print-list-table tbody tr:nth-child(even) {
  background: #f7fafc;
}
.tbl-badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 700;
}

/* ── Summary ── */
.print-summary-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.print-sum-item {
  padding: 4px 14px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}
.sum-total {
  background: #ebf8ff;
  color: #2b6cb0;
}
.sum-layak {
  background: #c6f6d5;
  color: #22543d;
}
.sum-ditunda {
  background: #fefcbf;
  color: #744210;
}
.sum-ditolak {
  background: #fed7d7;
  color: #742a2a;
}

/* ── Footer note ── */
.print-footer-note {
  font-size: 9.5px;
  color: #718096;
  text-align: right;
  margin-top: 8px;
  border-top: 1px solid #e2e8f0;
  padding-top: 4px;
}

/* ── Action bar (no-print) ── */
.print-action-bar {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 16px 0;
  margin-top: 20px;
  border-top: 1px dashed #e2e8f0;
}
.btn-print {
  background: #2b6cb0;
  color: #fff;
  border: none;
  padding: 8px 22px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.btn-print:hover {
  background: #2c5282;
}
.btn-close-tab {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}
.btn-close-tab:hover {
  background: #cbd5e0;
}

/* ── Utilities ── */
.mono {
  font-family: monospace;
}
.text-center {
  text-align: center;
}
.print-no-data {
  text-align: center;
  padding: 40px;
  color: #718096;
}

/* ── @media print ── */
@media print {
  .no-print {
    display: none !important;
  }
  .print-page {
    padding: 12px 16px;
    max-width: 100%;
  }
  body {
    font-size: 11px;
  }
  .print-list-table {
    font-size: 9.5px;
  }
  @page {
    margin: 10mm 12mm;
    size: A4 landscape;
  }
}
@media print and (max-width: 900px) {
  @page {
    size: A4 portrait;
  }
}
</style>
