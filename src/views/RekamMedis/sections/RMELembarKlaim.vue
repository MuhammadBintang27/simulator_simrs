<template>
  <div class="lk-wrap">
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span>
      Memuat data klaim...
    </div>

    <div v-else-if="!klaimData" class="rme-empty-note">
      <span>📭</span>
      Data klaim tidak tersedia — pastikan pasien memiliki No. SEP.
    </div>

    <div v-else class="lk-doc">
      <!-- ══ HEADER ══════════════════════════════════════════════════════ -->
      <div class="lk-header">
        <div class="lk-header-left">
          <img src="https://ws-simrs.net/logo/logo_kemkes.jpg" alt="Kemenkes" class="lk-logo" />
          <div class="lk-header-titles">
            <div class="lk-ministry">KEMENTERIAN KESEHATAN REPUBLIK INDONESIA</div>
            <div class="lk-doc-title">Berkas Klaim Individual Pasien</div>
          </div>
        </div>
        <div class="lk-header-right">
          <div class="lk-jkn-badge">JKN</div>
          <div class="lk-print-date">{{ formatDate(klaimData.TGLGROUPER) }}</div>
        </div>
      </div>
      <hr class="lk-hr" />

      <!-- ══ INFO RUMAH SAKIT ═════════════════════════════════════════════ -->
      <table class="lk-tbl">
        <colgroup>
          <col style="width: 200px" />
          <col style="width: 2px" />
          <col />
          <col style="width: 150px" />
          <col style="width: 2px" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td class="lk-lbl">Kode Rumah Sakit</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ klaimData.profile_rs.KODE_PPK || '' }}</td>
            <td class="lk-lbl">Kelas Rumah Sakit</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ klaimData.profile_rs.KELAS_RS || '-' }}</td>
          </tr>
          <tr>
            <td class="lk-lbl">Nama Rumah Sakit</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ klaimData.profile_rs.NAMA_PPK || company }}</td>
            <td class="lk-lbl">Jenis Tarif</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ klaimData.profile_rs.JENIS_TARIF || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <hr class="lk-hr lk-hr-dashed" />

      <!-- ══ INFO PASIEN ══════════════════════════════════════════════════ -->
      <table class="lk-tbl lk-tbl-patient">
        <colgroup>
          <col style="width: 200px" />
          <col style="width: 2px" />
          <col />
          <col style="width: 150px" />
          <col style="width: 2px" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td class="lk-lbl lk-lbl-c">Nomor Peserta</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">
              {{ pasien.NOJAMINAN || pasien.NOPESERTA || pasien.NOKARTU || '-' }}
            </td>
            <td class="lk-lbl">No SEP</td>
            <td class="lk-sep">:</td>
            <td class="lk-val lk-mono">{{ klaimData.NOSEP }}</td>
          </tr>
          <tr>
            <td class="lk-lbl lk-lbl-c">Nomor Rekam Medis</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.NOMR || '-' }}</td>
            <td class="lk-lbl">Tanggal Masuk</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ formatDate(pasien.MASUKPOLY) }}</td>
          </tr>
          <tr>
            <td class="lk-lbl lk-lbl-c">Umur Tahun</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.USIA_PASIEN?.tahun ?? pasien.USIA ?? '-' }}</td>
            <td class="lk-lbl">Tanggal Keluar</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ formatDate(pasien.KELUARPOLY_NULL || pasien.KELUARPOLY) }}</td>
          </tr>
          <tr>
            <td class="lk-lbl lk-lbl-c">Umur Hari</td>
            <td class="lk-sep">:</td>
            <td class="lk-val lk-val-c">{{ umurHari }}</td>
            <td class="lk-lbl">Jenis Perawatan</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.JENISRAWAT || klaimData.JENIS_RAWAT || '-' }}</td>
          </tr>
          <tr>
            <td class="lk-lbl lk-lbl-c">Tanggal Lahir</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.TGLLAHIR || '-' }}</td>
            <td class="lk-lbl">Cara Pulang</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.STTS_PULANG || pasien.CARAPULANG || '-' }}</td>
          </tr>
          <tr>
            <td class="lk-lbl lk-lbl-c">Jenis Kelamin</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.JENISKELAMIN || '-' }}</td>
            <td class="lk-lbl">LOS</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ los }} Hari</td>
          </tr>
          <tr>
            <td class="lk-lbl lk-lbl-c">Kelas Perawatan</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.HAKKELAS || pasien.KELAS || pasien.KELASBPJS || '-' }}</td>
            <td class="lk-lbl">Berat Lahir</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ pasien.BERAT_LAHIR || '-' }}</td>
          </tr>
          <tr>
            <td class="lk-lbl lk-lbl-c">No Register SITB</td>
            <td class="lk-sep">:</td>
            <td class="lk-val">{{ klaimData.NO_SITB || '-' }}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <hr class="lk-hr" />

      <!-- ══ DIAGNOSA ══════════════════════════════════════════════════════ -->
      <div class="lk-sec-title">Diagnosa</div>
      <table class="lk-tbl lk-tbl-dx">
        <colgroup>
          <col style="width: 130px" />
          <col style="width: 60px" />
          <col style="width: 8px" />
          <col />
        </colgroup>
        <tbody>
          <tr v-for="dx in klaimData.dx" :key="dx.ID">
            <td class="lk-lbl lk-lbl-c">{{ dx.JENIS_DIAGNOSA }}</td>
            <td class="lk-val lk-mono">{{ dx.KODE_DIAGNOSA }}</td>
            <td class="lk-sep">:</td>
            <td class="lk-val lk-italic">{{ dx.NAMA_DIAGNOSA }}</td>
          </tr>
          <tr v-if="!klaimData.dx?.length">
            <td colspan="4" class="rme-empty-note">Tidak ada data diagnosa</td>
          </tr>
        </tbody>
      </table>

      <!-- ══ PROCEDURE ════════════════════════════════════════════════════ -->
      <div class="lk-sec-title" style="margin-top: 14px">Procedure</div>
      <table class="lk-tbl lk-tbl-proc">
        <colgroup>
          <col style="width: 130px" />
          <col style="width: 60px" />
          <col style="width: 8px" />
          <col />
        </colgroup>
        <tbody>
          <tr v-for="proc in klaimData.proc" :key="proc.ID">
            <td></td>
            <td class="lk-val lk-mono">{{ proc.KODE_TINDAKAN }}</td>
            <td class="lk-sep">:</td>
            <td class="lk-val lk-italic">{{ proc.NAMA_TINDAKAN || '-' }}</td>
          </tr>
          <tr v-if="!klaimData.proc?.length">
            <td colspan="4" class="rme-empty-note">Tidak ada data prosedur</td>
          </tr>
        </tbody>
      </table>

      <!-- ══ ADL ══════════════════════════════════════════════════════════ -->
      <div class="lk-adl-row" style="margin-top: 40em">
        <div class="lk-adl-item">
          <span class="lk-lbl">ADL Sub Acute</span>
          <span class="lk-sep-inline"> : </span>
          <span class="lk-val">-</span>
        </div>
        <div class="lk-adl-item">
          <span class="lk-lbl">ADL Chronic</span>
          <span class="lk-sep-inline"> : </span>
          <span class="lk-val">-</span>
        </div>
      </div>

      <hr class="lk-hr" />

      <!-- ══ HASIL GROUPING ════════════════════════════════════════════════ -->
      <div class="lk-grouping-title">Hasil Grouping</div>
      <table class="lk-tbl-grouping">
        <colgroup>
          <col style="width: 90px" />
          <col style="width: 8px" />
          <col style="width: 70px" />
          <col />
          <col style="width: 28px" />
          <col style="width: 90px" />
        </colgroup>
        <tbody>
          <tr>
            <td class="kg-lbl">INA-CBG</td>
            <td class="kg-sep">:</td>
            <td class="kg-code">{{ klaimData.CODE }}</td>
            <td class="kg-desc">{{ klaimData.DESKRIPSI }}</td>
            <td class="kg-rp">Rp.</td>
            <td class="kg-amount">{{ fmtRp(klaimData.TARIF_BASE_CBG) }}</td>
          </tr>
          <tr>
            <td class="kg-lbl">Sub Acute</td>
            <td class="kg-sep">:</td>
            <td class="kg-code">-</td>
            <td class="kg-desc"></td>
            <td class="kg-rp">Rp.</td>
            <td class="kg-amount">0</td>
          </tr>
          <tr>
            <td class="kg-lbl">Chronic</td>
            <td class="kg-sep">:</td>
            <td class="kg-code">-</td>
            <td class="kg-desc"></td>
            <td class="kg-rp">Rp.</td>
            <td class="kg-amount">0</td>
          </tr>
          <tr>
            <td class="kg-lbl">Special CMG</td>
            <td class="kg-sep">:</td>
            <td class="kg-code">{{ klaimData.CMG_CODE || '' }}</td>
            <td class="kg-desc">{{ klaimData.CMG_DES || '' }}</td>
            <td class="kg-rp">Rp.</td>
            <td class="kg-amount">{{ fmtRp(klaimData.CMG_TARIF) }}</td>
          </tr>
          <tr class="kg-total">
            <td class="kg-lbl">Total Tarif</td>
            <td class="kg-sep">:</td>
            <td class="kg-code">-</td>
            <td class="kg-desc"></td>
            <td class="kg-rp">Rp.</td>
            <td class="kg-amount">{{ fmtRp(klaimData.TOTAL_TARIF) }}</td>
          </tr>
        </tbody>
      </table>
      <!-- ══ FOOTER ════════════════════════════════════════════════════════ -->
      <hr class="lk-hr" />
      <div class="lk-footer">
        <div class="lk-footer-left">
          <span class="lk-footer-lbl">Genarate</span>
          <span class="lk-footer-sep"> : </span>
          <span class="lk-footer-val">{{ klaimData.VERSI_INACBG }}</span>
        </div>
        <div class="lk-footer-right">{{ formatDateTime() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const props = defineProps({
  noreg: { type: String, default: '' },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(false)
const klaimData = ref(null)

// ── Pasien: dari klaim response (nested), fallback ke prop ───────────────────
const pasien = computed(() => klaimData.value?.pasien || props.dataPasien || {})

// ── Umur detail dari USIA_PASIEN ──────────────────────────────────────────────
const umurHari = computed(() => {
  const u = pasien.value?.USIA_PASIEN
  if (!u) return pasien.value?.USIA || '-'
  const parts = []
  if (u.tahun) parts.push(`${u.tahun} Tahun`)
  if (u.bulan) parts.push(`${u.bulan} Bulan`)
  if (u.hari) parts.push(`${u.hari} Hari`)
  return parts.length ? parts.join(' ') : '-'
})

// ── LOS ───────────────────────────────────────────────────────────────────────
const los = computed(() => {
  const p = pasien.value
  if (p?.LOS) return p.LOS
  if (p?.JLM_HARI_RAWAT) return p.JLM_HARI_RAWAT
  const masuk = p?.MASUKPOLY
  const keluar = p?.KELUARPOLY_NULL || p?.KELUARPOLY
  if (!masuk || !keluar) return '-'
  const diff = new Date(keluar) - new Date(masuk)
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  return isNaN(days) ? '-' : days
})

// ── Fetch ─────────────────────────────────────────────────────────────────────
const fetchKlaim = async () => {
  const nosep = props.dataPasien?.NOSEP

  // dataPasien belum terisi dari parent (masih loading) — jangan lapor false dulu
  if (!props.dataPasien?.NOMR) return

  if (!nosep || !id_client.value) {
    klaimData.value = null
    reportSectionData('lembar-klaim', false)
    return
  }

  loading.value = true
  try {
    const res = await axios.get(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/get_data_klaim_v2/${nosep}/${id_client.value}`,
    )
    // Response: { data: [ { ...klaim, pasien: {...} } ] }

    console.log('fetchKlaim response:', res.data)
    const arr = res.data?.data
    klaimData.value = Array.isArray(arr) ? (arr[0] ?? null) : (arr ?? null)
    reportSectionData('lembar-klaim', klaimData.value !== null)
  } catch (e) {
    console.error('fetchKlaim error:', e)
    klaimData.value = null
    reportSectionData('lembar-klaim', false)
  } finally {
    loading.value = false
  }
}

// ── Format helpers ────────────────────────────────────────────────────────────
const formatDate = (val) => {
  if (!val) return '-'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch {
    return val
  }
}

const formatDateTime = () => {
  const d = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const day = days[d.getDay()]
  const date = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${day}, ${date} ${month} ${year} ${hh}:${mi}:${ss}`
}

const fmtRp = (val) => {
  const n = parseFloat(val) || 0
  return n.toLocaleString('id-ID')
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
watch(() => props.dataPasien?.NOMR, fetchKlaim, { immediate: true })
</script>

<style scoped>
.lk-wrap {
  font-size: 11px;
  color: #1a1a2e;
}

/* ── Header ── */
.lk-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}
.lk-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lk-logo {
  width: 70px;
  height: 70px;
  object-fit: cover;
  flex-shrink: 0;
}
.lk-ministry {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #1a1a2e;
  line-height: 1.4;
}
.lk-doc-title {
  font-size: 12px;
  font-style: italic;
  color: #0c7a6a;
  margin-top: 2px;
}
.lk-header-right {
  text-align: right;
  line-height: 1.5;
}
.lk-jkn-badge {
  font-size: 12px;
  font-weight: 700;
  color: #1a1a2e;
}
.lk-print-date {
  font-size: 10.5px;
  color: #555;
}

/* ── Dividers ── */
.lk-hr {
  border: none;
  border-top: 1.5px solid #333;
  margin: 5px 0;
}
.lk-hr-dashed {
  border-top: 1px dashed #aaa;
}

/* ── Info table ── */
.lk-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 4px;
}
.lk-tbl td {
  padding: 1.5px 2px;
  vertical-align: top;
}
.lk-lbl {
  color: #333;
  white-space: nowrap;
}

.lk-sep {
  color: #555;
  padding: 1.5px 3px;
}
.lk-val {
  color: #1a1a2e;
}
.lk-val-c {
}
.lk-mono {
  font-size: 12px;
}
.lk-italic {
  font-style: italic;
}

/* ── Section title ── */
.lk-sec-title {
  font-size: 12px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 8px 0 4px;
}

/* ── ADL row ── */
.lk-adl-row {
  display: flex;
  gap: 40px;
  margin: 10px 0 8px;
  font-size: 10.5px;
}
.lk-adl-item {
  display: flex;
  align-items: baseline;
  gap: 0;
}
.lk-sep-inline {
  color: #555;
  margin: 0 2px;
}

/* ── Grouping section ── */
.lk-grouping-title {
  font-size: 10.5px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 6px 0 4px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 3px;
}
.lk-tbl-grouping {
  width: 100%;
  border-collapse: collapse;
  font-size: 10.5px;
}
.lk-tbl-grouping td {
  padding: 2px 3px;
  vertical-align: top;
}
.kg-lbl {
  color: #333;
  white-space: nowrap;
}
.kg-sep {
  color: #555;
  padding: 2px 3px;
}
.kg-code {
  white-space: nowrap;
  font-weight: 600;
}
.kg-desc {
  color: #1a1a2e;
}
.kg-rp {
  text-align: right;
  white-space: nowrap;
  padding-right: 4px;
  color: #333;
}
.kg-amount {
  text-align: right;
  font-weight: 600;
  white-space: nowrap;
}
.kg-total {
  border-top: 1px solid #ccc;
  margin-top: 2px;
}
.kg-total td {
  padding-top: 4px;
  font-weight: 700;
}

/* ── Footer ── */
.lk-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  color: #666;
  margin-top: 4px;
}
.lk-footer-lbl {
  color: #888;
}
.lk-footer-sep {
  margin: 0 2px;
}
.lk-footer-val {
  color: #555;
}
</style>
