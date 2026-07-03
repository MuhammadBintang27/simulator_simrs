<template>
  <div class="cetak-resep-wrap">
    <!-- Toolbar (hidden on print) -->
    <div class="cetak-toolbar no-print">
      <button class="cetak-btn-back" @click="$router.back()">
        <i class="pi pi-arrow-left" /> Kembali
      </button>
      <button class="cetak-btn-print" @click="doCetak">
        <i class="pi pi-print" /> Cetak Resep
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="cetak-loading no-print">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <div style="margin-top: 10px">Memuat data resep...</div>
    </div>

    <!-- Print page -->
    <div v-else id="resep-print" class="resep-page">
      <!-- ── HEADER RS ── -->
      <div class="rp-header">
        <div class="rp-header-brand">
          <img v-if="LINK_LOGO" :src="LINK_LOGO" class="rp-logo" alt="logo" />
          <div v-else class="rp-logo-placeholder"><i class="pi pi-building" /></div>
          <div class="rp-rs-info">
            <div class="rp-rs-name">{{ company || 'RSUD' }}</div>
            <div class="rp-rs-addr">{{ ALAMAT }}</div>
          </div>
        </div>
        <div class="rp-page-num">P1</div>
      </div>
      <div class="rp-divider"></div>

      <!-- ── JUDUL + POLI ── -->
      <div class="rp-title-row">
        <div class="rp-title">Resep Pasien</div>
        <div class="rp-poli">{{ poliName }}</div>
      </div>

      <!-- ── DATA PASIEN ── -->
      <div class="rp-patient-grid">
        <div class="rp-patient-col">
          <div class="rp-info-row">
            <span class="rp-info-label">R.M</span>
            <span class="rp-info-sep">:</span>
            <span>{{ noRM }}</span>
          </div>
          <div class="rp-info-row">
            <span class="rp-info-label">Nama</span>
            <span class="rp-info-sep">:</span>
            <span>{{ namaPasien }}</span>
          </div>
          <div class="rp-info-row">
            <span class="rp-info-label">JK &amp; Usia</span>
            <span class="rp-info-sep">:</span>
            <span>{{ jkUsia }}</span>
          </div>
          <div class="rp-info-row">
            <span class="rp-info-label">Domisili</span>
            <span class="rp-info-sep">:</span>
            <span>{{ domisili }}</span>
          </div>
        </div>
        <div class="rp-patient-col">
          <div class="rp-info-row">
            <span class="rp-info-label">No Register</span>
            <span class="rp-info-sep">:</span>
            <span>{{ noRegister }}</span>
          </div>
          <div class="rp-info-row">
            <span class="rp-info-label">Jenis Rawat</span>
            <span class="rp-info-sep">:</span>
            <span>{{ jenisRawat }}</span>
          </div>
          <div class="rp-info-row">
            <span class="rp-info-label">Cara Bayar</span>
            <span class="rp-info-sep">:</span>
            <span>{{ caraBayar }}</span>
          </div>
          <div class="rp-info-row">
            <span class="rp-info-label">Tgl Masuk</span>
            <span class="rp-info-sep">:</span>
            <span>{{ tglMasuk }}</span>
          </div>
        </div>
      </div>
      <div class="rp-divider"></div>

      <!-- ── DAFTAR OBAT ── -->
      <div class="rp-items">
        <template v-for="(group, gIdx) in groupedItems" :key="gIdx">

          <!-- ─ Resep Tunggal ─ -->
          <div v-if="group.type === 'tunggal'" class="rp-group">
            <div class="rp-item-row">
              <span class="rp-rx">R/</span>
              <span class="rp-drug-name">{{ group.item.NAMA }}</span>
              <span class="rp-no-qty">
                <span class="rp-no-label">No.</span>
                <span class="rp-qty-roman">{{ fmtQty(group.item) }}</span>
              </span>
            </div>
            <div v-if="group.item.REMARK_ITEM" class="rp-signa">
              <span class="rp-signa-s">S</span>
              <span>{{ group.item.REMARK_ITEM }}</span>
            </div>
          </div>

          <!-- ─ Resep Racikan ─ -->
          <div v-else class="rp-group rp-group-racikan">
            <div class="rp-item-row">
              <span class="rp-rx">R/</span>
              <span class="rp-drug-name rp-racikan-title">{{ group.parent.NAMA }}</span>
              <span class="rp-no-qty">
                <span class="rp-no-label">No.</span>
                <span class="rp-qty-roman">{{ fmtQty(group.parent) }}</span>
              </span>
            </div>
            <div v-for="(child, cIdx) in group.children" :key="cIdx" class="rp-child-row">
              <span class="rp-child-bullet">—</span>
              <span class="rp-child-name">{{ child.NAMA }}</span>
            </div>
            <div v-if="group.parent.REMARK_ITEM" class="rp-signa">
              <span class="rp-signa-s">S</span>
              <span>{{ group.parent.REMARK_ITEM }}</span>
            </div>
          </div>

          <!-- separator antar group -->
          <div v-if="gIdx < groupedItems.length - 1" class="rp-group-sep"></div>
        </template>
      </div>
      <div class="rp-dashed"></div>

      <!-- ── BOTTOM : TELAAH + TTD ── -->
      <div class="rp-bottom">
        <!-- Telaah Resep -->
        <div class="rp-telaah-wrap">
          <table class="rp-telaah-table">
            <thead>
              <tr>
                <th>Telaah Resep</th>
                <th>Ya/Tidak (V)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in TELAAH_RESEP" :key="row">
                <td :class="{ 'td-grey': row === 'Nama Penelaah' }">{{ row }}</td>
                <td :class="{ 'td-grey': row === 'Nama Penelaah' }"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Telaah Obat + Tanda Tangan -->
        <div class="rp-telaah-wrap">
          <table class="rp-telaah-table">
            <thead>
              <tr>
                <th>Telaah Obat</th>
                <th>Ya/Tidak (V)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in TELAAH_OBAT" :key="row">
                <td :class="{ 'td-grey': row === 'Nama Penelaah' }">{{ row }}</td>
                <td :class="{ 'td-grey': row === 'Nama Penelaah' }"></td>
              </tr>
            </tbody>
          </table>
          <table class="rp-telaah-table rp-sign-table">
            <tbody>
              <tr>
                <td class="td-bold">Petugas Farmasi</td>
                <td class="td-bold">Pasien</td>
              </tr>
              <tr style="height: 52px">
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Kolom TTD Dokter -->
        <div class="rp-dokter-col">
          <div class="rp-sign-date">{{ formattedDate }}</div>
          <div class="rp-sign-lbl">Dokter Pemberi Resep</div>
          <div class="rp-qr-wrap">
            <QrcodeVue :value="qrValue" :size="50" level="M" render-as="canvas" />
          </div>
          <div class="rp-dokter-name">{{ dpjp }}</div>
          <div class="rp-sign-lbl">Dokter Pemberi Resep</div>
        </div>
      </div>
    </div>
    <!-- /resep-page -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

const loading = ref(true)
const allData = ref(null)

const ps = computed(() => allData.value?.PS?.[0] || {})
const drugItems = computed(() => allData.value?.RESEP || [])
const resepInfo = computed(() => drugItems.value[0] || {})

/* ── Telaah rows ── */
const TELAAH_RESEP = [
  'Btk sediaan Obat',
  'Dosis Obat',
  'Jumlah Obat',
  'Aturan Pakai',
  'Tepat Indikasi',
  'Tepat Dosis',
  'Tepat Waktu',
  'Duplikasi',
  'Alergi',
  'Interaksi Obat',
  'Efek Samping',
  'Kontra Indikasi',
  'Nama Penelaah',
]
const TELAAH_OBAT = [
  'Tepat Pasien',
  'Tepat Obat',
  'Tepat Dosis',
  'Tepat Rute',
  'Tepat Waktu',
  'Nama Penelaah',
]

/* ── Patient fields from PS[0] ── */
const noRM = computed(() => ps.value.NOMR || '—')
const namaPasien = computed(() => ps.value.NAMAPASIEN || '—')
const jkUsia = computed(() => {
  const jk = ps.value.JENISKELAMIN || ''
  const usia = ps.value.USIA ? `${ps.value.USIA} Thn` : ''
  const tglLahir = ps.value.TGLLAHIR || ''
  return [jk, usia, tglLahir].filter(Boolean).join('  ') || '—'
})
const domisili = computed(() => ps.value.ALAMAT || '—')
const noRegister = computed(() => ps.value.NOPENDAFTARAN || route.query.noregister || '—')
const jenisRawat = computed(() => ps.value.JENISRAWAT || '—')
const caraBayar = computed(() => ps.value.CARABAYAR || '—')
const tglMasuk = computed(() => {
  const raw = ps.value.MASUKPOLY
  if (!raw) return '—'
  const d = new Date(raw.replace(' ', 'T'))
  if (isNaN(d)) return raw
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
})

/* ── Group resep: tunggal vs racikan ──
   Tunggal : NO = "No. "  AND  BARCODE ≠ "00000"
   Racikan header : NO = "No. "  AND  BARCODE = "00000"
   Racikan child  : NO = ""  AND  JENIS_RESEP = ""
*/
const groupedItems = computed(() => {
  const items = [...drugItems.value].sort((a, b) => Number(a.ITEMSEQNO) - Number(b.ITEMSEQNO))
  const groups = []
  let currentRacikan = null

  for (const item of items) {
    if (item.NO === 'No. ' && item.BARCODE !== '00000') {
      currentRacikan = null
      groups.push({ type: 'tunggal', item })
    } else if (item.NO === 'No. ' && item.BARCODE === '00000') {
      currentRacikan = { type: 'racikan', parent: item, children: [] }
      groups.push(currentRacikan)
    } else if (item.NO === '' && item.JENIS_RESEP === '') {
      if (currentRacikan) currentRacikan.children.push(item)
    }
  }

  return groups
})

const fmtQty = (item) => {
  if (item.QTY_ROMAWI) return item.QTY_ROMAWI
  const n = parseFloat(item.QTY_INT)
  if (!isNaN(n) && n > 0) return String(n)
  return ''
}

/* ── Resep info from RESEP[0] ── */
const poliName = computed(() => resepInfo.value.POLI_RUANG || ps.value.POLI || '—')
const dpjp = computed(() => resepInfo.value.DPJP || ps.value.NAMADOKTER || '—')
const qrValue = computed(() => resepInfo.value.RECEIPT_NO || route.params.trans || '')

/* ── Format tanggal dokter column ── */
const formattedDate = computed(() => {
  const raw = resepInfo.value.TANGGAL
  if (!raw) return '—'
  const d = new Date(raw.replace(' ', 'T'))
  if (isNaN(d)) return raw
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
})

/* ── Fetch resep + pasien dari satu endpoint ── */
const fetchPatient = async () => {
  const noregister = route.query.noregister || ''
  const notrans = route.params.trans || ''
  const nomr = route.query.nomr || ''
  const idclient = id_client.value || ''

  const url = `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/get_all_resepv2/${noregister}/${notrans}/${nomr}/${idclient}`
  const res = await axios.get(url)
  console.log(res.data)
  allData.value = res.data || null
}

const doCetak = () => window.print()

onMounted(async () => {
  loading.value = true
  try {
    await fetchPatient()
  } catch (err) {
    console.error('CetakResep:', err)
  } finally {
    loading.value = false
    await nextTick()
    window.print()
  }
})
</script>

<style scoped>
/* ── Wrapper & toolbar ── */
.cetak-resep-wrap {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 16px;
}
.cetak-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.cetak-btn-back,
.cetak-btn-print {
  padding: 6px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.cetak-btn-back {
  background: #6c757d;
  color: #fff;
}
.cetak-btn-print {
  background: #198754;
  color: #fff;
}
.cetak-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #666;
}

/* ── Resep page ── */
.resep-page {
  background: #fff;
  width: 148mm;
  min-height: 210mm;
  margin: 0 auto;
  padding: 8mm 10mm 8mm;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  font-family: Arial, sans-serif;
  font-size: 9pt;
  color: #000;
  box-sizing: border-box;
}

/* ── Header RS ── */
.rp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
}
.rp-header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rp-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.rp-logo-placeholder {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  border-radius: 50%;
  font-size: 18px;
  color: #aaa;
}
.rp-rs-name {
  font-size: 12pt;
  font-weight: 700;
  text-transform: uppercase;
}
.rp-rs-addr {
  font-size: 7.5pt;
  color: #444;
  margin-top: 2px;
}
.rp-page-num {
  font-size: 16pt;
  font-weight: 700;
  color: #000;
  align-self: center;
}
.rp-divider {
  border: none;
  border-top: 1.5px solid #000;
  margin: 5px 0;
}

/* ── Judul + Poli ── */
.rp-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0 8px;
}
.rp-title {
  font-size: 10pt;
  font-weight: 700;
  text-transform: capitalize;
  font-variant: small-caps;
}
.rp-poli {
  font-size: 9.5pt;
  font-weight: 700;
}

/* ── Data Pasien ── */
.rp-patient-grid {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
}
.rp-patient-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rp-info-row {
  display: flex;
  gap: 3px;
  font-size: 8pt;
}
.rp-info-label {
  width: 70px;
  flex-shrink: 0;
}
.rp-info-sep {
  width: 10px;
  flex-shrink: 0;
}

/* ── Daftar Obat ── */
.rp-items {
  margin: 6px 0 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rp-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rp-item-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 9pt;
}
.rp-rx {
  font-style: italic;
  width: 24px;
  flex-shrink: 0;
}
.rp-drug-name {
  flex: 1;
  font-weight: 600;
}
.rp-racikan-title {
  flex: 1;
  font-weight: 600;
}
.rp-no-qty {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}
.rp-no-label {
  flex-shrink: 0;
  color: #555;
}
.rp-qty-roman {
  width: 36px;
  font-weight: 700;
  text-align: right;
}
.rp-child-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding-left: 30px;
  font-size: 8.5pt;
}
.rp-child-bullet {
  flex-shrink: 0;
  color: #444;
}
.rp-child-name {
  flex: 1;
}
.rp-signa {
  display: flex;
  align-items: baseline;
  gap: 5px;
  padding-left: 24px;
  font-size: 8.5pt;
  margin-top: 1px;
}
.rp-signa-s {
  font-style: italic;
  font-weight: 700;
}
.rp-group-sep {
  border: none;
  border-top: 1px dotted #bbb;
  margin: 2px 0;
}

.rp-dashed {
  border: none;
  border-top: 1px dashed #555;
  margin: 6px 0;
}

/* ── Bottom 3-col ── */
.rp-bottom {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-top: 4px;
}
.rp-telaah-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rp-telaah-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7pt;
}
.rp-telaah-table th {
  border: 1px solid #000;
  padding: 2px 4px;
  background: #fff;
  text-align: left;
  font-weight: 700;
}
.rp-telaah-table td {
  border: 1px solid #000;
  padding: 1px 4px;
  height: 13px;
}
.td-grey {
  background: #c0c0c0 !important;
}
.td-bold {
  font-weight: 700;
  text-align: center;
}
.rp-sign-table {
  margin-top: 4px;
}

/* ── Kolom dokter ── */
.rp-dokter-col {
  width: 100px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 3px;
  font-size: 7.5pt;
}
.rp-sign-date {
  font-weight: 600;
  font-size: 8pt;
}
.rp-sign-lbl {
  font-size: 7pt;
  color: #222;
}
.rp-qr-wrap {
  margin: 2px 0;
}
.rp-dokter-name {
  font-weight: 700;
  font-size: 8pt;
}

/* ── Print media ── */
@media print {
  @page {
    size: A5 portrait;
    margin: 0;
  }
  .no-print {
    display: none !important;
  }
  .cetak-resep-wrap {
    background: #fff !important;
    padding: 0 !important;
  }
  .resep-page {
    box-shadow: none !important;
    width: 148mm !important;
    min-height: 210mm !important;
    margin: 0 !important;
    padding: 8mm 10mm !important;
  }
}
</style>
