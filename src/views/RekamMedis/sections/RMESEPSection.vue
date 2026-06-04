<template>
  <div class="sep-wrap">
    <div class="rme-section-title">Surat Eligibilitas Peserta (SEP) BPJS Kesehatan</div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span>
      Memuat data SEP...
    </div>

    <div v-else-if="!sepData" class="rme-empty-note">
      Data SEP tidak tersedia - pasien Non-BPJS atau SEP belum dibuat.
    </div>

    <div v-else class="sep-doc">
      <!-- ═══ LAYER 1: Header ══════════════════════════════════════════ -->
      <div class="sep-header">
        <div class="sep-logo">
          <img
            src="https://ws-simrs.net/assets/bpjs_icon.png"
            class="sep-logo-img"
            alt="BPJS Kesehatan"
            crossorigin="anonymous"
          />
        </div>
        <div class="sep-title-col">
          <div class="sep-title">SURAT ELIGIBILITAS PESERTA</div>
          <div class="sep-rs-name">{{ company }}</div>
        </div>
      </div>

      <!-- ═══ LAYER 2: Status Bar ══════════════════════════════════════ -->
      <div class="sep-statusbar no-print">
        <div class="ssb-left">
          <span class="sep-badge sep-badge-eligible">
            <i class="pi pi-verified"></i> Eligible
          </span>
          <span v-if="isNaikKelas" class="sep-badge sep-badge-naik">
            <i class="pi pi-arrow-up-right"></i>
            Naik Kelas &nbsp;<b>{{ kelasHakLabel }}</b
            >&nbsp;→&nbsp;<b>{{ kelasRawatLabel }}</b>
          </span>
          <span v-if="isCOB" class="sep-badge sep-badge-cob">
            <i class="pi pi-shield"></i> COB Aktif
          </span>
          <span v-if="isKecelakaan" class="sep-badge sep-badge-kll">
            <i class="pi pi-exclamation-triangle"></i> Kecelakaan
          </span>
          <span v-if="isSudahPulang" class="sep-badge sep-badge-pulang">
            <i class="pi pi-sign-out"></i> Sudah Pulang
          </span>
        </div>
        <div class="ssb-right">
          <span v-if="sepData.JENISPESERTA" class="sep-badge sep-badge-jenis">
            <i class="pi pi-id-card"></i> {{ sepData.JENISPESERTA }}
          </span>
          <span v-if="sepData.JENISPELAYANAN" class="sep-badge sep-badge-rawat">
            <i class="pi pi-building"></i> {{ sepData.JENISPELAYANAN }}
          </span>
        </div>
      </div>

      <!-- ═══ LAYER 3: Body tabel data ════════════════════════════════ -->
      <div class="sep-body">
        <!-- Left column -->
        <table class="sep-tbl sep-tbl-l">
          <colgroup>
            <col class="col-label" />
            <col class="col-sep-c" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td class="sl">No.SEP</td>
              <td class="ss">:</td>
              <td class="sv mono">{{ sepData.NOSEP }}</td>
            </tr>
            <tr>
              <td class="sl">Tgl SEP</td>
              <td class="ss">:</td>
              <td class="sv">{{ fmtDate(sepData.TGLSEP) }}</td>
            </tr>
            <tr>
              <td class="sl">No. Kartu</td>
              <td class="ss">:</td>
              <td class="sv">
                <span class="mono">{{ sepData.NOKARTU }}</span>
                <span v-if="sepData.NORM" class="sep-norm-tag">No.Mr {{ sepData.NORM }}</span>
              </td>
            </tr>
            <tr>
              <td class="sl">Nama Peserta</td>
              <td class="ss">:</td>
              <td class="sv sv-bold">{{ sepData.NAMA }}</td>
            </tr>
            <tr>
              <td class="sl">Tgl Lahir</td>
              <td class="ss">:</td>
              <td class="sv">{{ fmtDate(sepData.TGLLAHIR) }}</td>
            </tr>
            <tr>
              <td class="sl">Jenis Kelamin</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.JENISKELAMIN === 'L' ? 'Laki-laki' : 'Perempuan' }}</td>
            </tr>
            <tr>
              <td class="sl">No. Telp</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.NOTLP || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Nama DPJP</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.NAMADOKTER || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Faskes Perujuk</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.PPKPERUJUK || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Diagnosis Awal</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.NAMADIAGNOSA || '-' }}</td>
            </tr>
            <tr v-if="sepData.NAMADIAGNOSAAKHIR">
              <td class="sl">Diagnosis Akhir</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.NAMADIAGNOSAAKHIR }}</td>
            </tr>
            <tr>
              <td class="sl">Catatan Kll</td>
              <td class="ss">:</td>
              <td class="sv">
                {{ sepData.CTT_KLL || '-' }}
                <em v-if="sepData.KELUAR" class="sep-keluar">
                  Tanggal Keluar: {{ fmtKeluar(sepData.KELUAR) }} WIB
                </em>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="sep-col-div"></div>

        <!-- Right column -->
        <table class="sep-tbl sep-tbl-r">
          <colgroup>
            <col class="col-label" />
            <col class="col-sep-c" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td class="sl">Peserta</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.JENISPESERTA || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Jns. Rawat</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.JENISPELAYANAN || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Jns. Kunjungan</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.TUJUAN_KUNJUNGAN || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Poli-penjuk</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.POLI || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Kelas Rawat</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.KELASRAWAT ? 'Kelas ' + sepData.KELASRAWAT : '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Kelas Hak</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.HAKKELAS || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Penjamin</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.PENJAMIN || '-' }}</td>
            </tr>
            <tr>
              <td class="sl">Petugas</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.USER_NAME || '-' }}</td>
            </tr>
            <tr v-if="sepData.NORUJUKAN">
              <td class="sl">No. Rujukan</td>
              <td class="ss">:</td>
              <td class="sv mono">{{ sepData.NORUJUKAN }}</td>
            </tr>
            <tr v-if="sepData.NAIK_KELAS">
              <td class="sl">Naik Kelas</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.NAIK_KELAS }}</td>
            </tr>
            <tr v-if="sepData.COB">
              <td class="sl">COB</td>
              <td class="ss">:</td>
              <td class="sv">{{ sepData.COB }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="sep-footer">
        <div class="sep-foot-l">
          <em
            >*Saya menyatakan BPJS Kesehatan menggunakan informasi medis pasien jika diperlukan. SEP
            bukan sebagai bukti penjamin peserta</em
          >
        </div>
        <div class="sep-foot-r">
          Dengan sampilnya SEP ini merupakan validasi terhadap eligibilitas Peserta secara
          elektronik dan peserta dapat mengklaim pelayanan kesehatan rujukan sesuai ketentuan
          berlaku
        </div>
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
  noreg: { type: String, default: '' },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(false)
const sepData = ref(null)

// ── Computed: Status Badges ────────────────────────────────────────────
const isNaikKelas = computed(() => !!sepData.value?.NAIK_KELAS)
const isCOB = computed(() => !!sepData.value?.COB)
const isKecelakaan = computed(() => {
  const ctt = sepData.value?.CTT_KLL
  return !!ctt && ctt !== '-' && ctt.trim() !== ''
})
const isSudahPulang = computed(() => !!sepData.value?.KELUAR)

const kelasHakLabel = computed(() => sepData.value?.HAKKELAS || '-')
const kelasRawatLabel = computed(() => {
  const k = sepData.value?.KELASRAWAT
  return k ? 'Kelas ' + k : '-'
})

// ── Format helpers ─────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '-'
  const parts = String(d).split('-')
  if (parts.length < 3) return d
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

const fmtKeluar = (dt) => {
  if (!dt) return '-'
  const [date, time] = String(dt).split(' ')
  const parts = date.split('-')
  const timePart = time ? time.slice(0, 5) : ''
  return `${parts[2]}/${parts[1]}/${parts[0]} ${timePart}`
}

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchData = async () => {
  const noregVal = props.noreg
  const idClientVal = id_client.value
  const dataPasienReady = props.dataPasien && Object.keys(props.dataPasien).length > 0

  if (!noregVal || !idClientVal || !configStore.apiBaseUrl || !dataPasienReady) return

  loading.value = true
  try {
    const nosep = props.dataPasien?.NOSEP || '0'
    const res = await axios.get(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/getdataSEP/${idClientVal}/${nosep}/${noregVal}`,
    )
    const list = res.data?.response ?? res.data ?? []
    sepData.value = Array.isArray(list) && list.length > 0 ? list[0] : null
  } catch (e) {
    console.error('SEP fetch error:', e)
    sepData.value = null
  } finally {
    loading.value = false
    reportSectionData('sep', !!sepData.value)
  }
}

watch(
  [() => props.noreg, id_client, () => props.dataPasien],
  ([noreg, idClient, dataPasien]) => {
    if (noreg && idClient && dataPasien && Object.keys(dataPasien).length > 0) fetchData()
  },
  { immediate: true, deep: false },
)
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────────────────────────── */
.sep-wrap {
  font-size: 0px;
}
.sep-doc {
  overflow: hidden;
}

/* ── LAYER 1: Header ─────────────────────────────────────────────────── */
.sep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff;
}
.sep-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}
.sep-logo-img {
  height: 30px;
  width: auto;
  object-fit: contain;
  display: block;
}
.sep-title-col {
  flex: 1;
  text-align: center;
}
.sep-title {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-rs-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin-top: 3px;
}

/* ── LAYER 2: Status Bar ─────────────────────────────────────────────── */
.sep-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 7px 14px;
  background: #f4faf6;
  border-top: 1px solid #c6e0cc;
  border-bottom: 1px solid #c6e0cc;
  flex-wrap: wrap;
  font-size: 12px;
}
.ssb-left,
.ssb-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.sep-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-badge-eligible {
  background: #e6f4ec;
  color: #1a6e35;
  border: 1px solid #a8d8b6;
}
.sep-badge-naik {
  background: #fff3e0;
  color: #b75c00;
  border: 1px solid #ffcc80;
}
.sep-badge-cob {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}
.sep-badge-kll {
  background: #fdecea;
  color: #c62828;
  border: 1px solid #ef9a9a;
}
.sep-badge-pulang {
  background: #f3e5f5;
  color: #6a1b9a;
  border: 1px solid #ce93d8;
}
.sep-badge-jenis {
  background: #f5f5f5;
  color: #444;
  border: 1px solid #ddd;
}
.sep-badge-rawat {
  background: #f5f5f5;
  color: #444;
  border: 1px solid #ddd;
}

/* ── LAYER 3: Body tabel ─────────────────────────────────────────────── */
.sep-body {
  display: flex;
}
.sep-col-div {
  width: 1px;
  background: #c0d8c0;
  margin: 0 14px;
  flex-shrink: 0;
}
.sep-tbl {
  border-collapse: collapse;
}
.col-label {
  width: 108px;
}
.col-sep-c {
  width: 12px;
}
.sl {
  color: #444;
  white-space: nowrap;
  vertical-align: top;
  font-size: 12px;
}
.ss {
  color: #777;
  vertical-align: top;
}
.sv {
  color: #111;
  vertical-align: top;
  font-size: 12px;
}
.sv-bold {
  font-weight: 700;
}
.sep-norm-tag {
  font-size: 10px;
  color: #555;
  margin-left: 8px;
  padding: 0 5px;
  border: 1px solid #a8c8a8;
  border-radius: 3px;
  background: #f4fbf4;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-keluar {
  display: block;
  font-style: italic;
  font-size: 10px;
  color: #666;
  margin-top: 1px;
}

/* ── Footer ──────────────────────────────────────────────────────────── */
.sep-footer {
  display: flex;
  gap: 20px;
  padding: 8px 16px;
  border-top: 1px solid #c0d8c0;
  background: #f4fbf4;
  font-size: 9.5px;
  color: #444;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-foot-l {
  flex: 1;
  color: #555;
}
.sep-foot-r {
  flex: 1;
  text-align: right;
  color: #444;
}

@media print {
  .sep-doc {
    border-color: #aaa !important;
  }
}
</style>
