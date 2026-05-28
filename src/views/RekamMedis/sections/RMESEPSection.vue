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
      <!-- Header BPJS -->
      <div class="sep-header">
        <div class="sep-logo">
          <img
            src="https://ws-simrs.net/assets/bpjs_icon.png"
            class="sep-logo-img"
            alt="BPJS Kesehatan"
          />
        </div>

        <div class="sep-title-col">
          <div class="sep-title">SURAT ELIGIBILITAS PESERTA</div>
          <div class="sep-rs-name">{{ company }}</div>
        </div>

        <div class="sep-qr-col">
          <div class="sep-qr-box">
            <div class="sep-qr-finder sep-qr-tl"></div>
            <div class="sep-qr-finder sep-qr-tr"></div>
            <div class="sep-qr-finder sep-qr-bl"></div>
            <div class="sep-qr-dots"></div>
          </div>
          <div class="sep-qr-label"></div>
        </div>
      </div>

      <!-- Body -->
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
import { ref, watch } from 'vue'
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

const loading = ref(false)
const sepData = ref(null)

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
  }
}

// Tunggu noreg, id_client, DAN dataPasien semuanya tersedia baru fetch
watch(
  [() => props.noreg, id_client, () => props.dataPasien],
  ([noreg, idClient, dataPasien]) => {
    if (noreg && idClient && dataPasien && Object.keys(dataPasien).length > 0) fetchData()
  },
  { immediate: true, deep: false },
)
</script>

<style scoped>
/* Wrapper */
.sep-wrap {
  font-size: 0px;
}

/* Document card */
.sep-doc {
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0px;
}

/* Header */
.sep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 3px solid #2b2b2b;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* BPJS Logo */
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
.sep-logo-tagline {
  font-size: 7px;
  color: #555;
  text-align: center;
  max-width: 80px;
  line-height: 1.3;
}

/* Title center */
.sep-title-col {
  flex: 1;
  text-align: center;
}
.sep-title {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: #007d3a;
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

/* QR placeholder */

.sep-qr-box {
  width: 64px;
  height: 64px;
  border: 2px solid #222;
  position: relative;
  background: #fff;
  overflow: hidden;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-qr-finder {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 3px solid #222;
  background: #fff;
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-qr-tl {
  top: 3px;
  left: 3px;
}
.sep-qr-tr {
  top: 3px;
  right: 3px;
}
.sep-qr-bl {
  bottom: 3px;
  left: 3px;
}
.sep-qr-dots {
  position: absolute;
  top: 22px;
  left: 22px;
  right: 3px;
  bottom: 22px;
  background-image:
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 5px 5px;
  background-position:
    0 0,
    0 2.5px,
    2.5px -2.5px,
    -2.5px 0;
  opacity: 0.4;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-qr-label {
  font-size: 7px;
  font-family: 'Courier New', monospace;
  color: #555;
  text-align: center;
  word-break: break-all;
  max-width: 72px;
}

/* Green stripe */
.sep-stripe {
  height: 4px;
  background: linear-gradient(90deg, #007d3a 0%, #00b86e 60%, #80ddb0 100%);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Body */
.sep-body {
  display: flex;
  padding: 10px 16px 8px;
}
.sep-col-div {
  width: 1px;
  background: #c0d8c0;
  margin: 0 14px;
  flex-shrink: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-tbl {
  border-collapse: collapse;
  flex: 1;
}
.sep-tbl-r {
  flex: 0.72;
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
  padding: 2.5px 4px 2.5px 0;
  vertical-align: top;
  font-size: 11px;
}
.ss {
  color: #777;
  padding: 2.5px 2px;
  vertical-align: top;
}
.sv {
  color: #111;
  padding: 2.5px 0 2.5px 4px;
  vertical-align: top;
  font-size: 11px;
}
.sv-bold {
  font-weight: 700;
}
.mono {
  font-family: 'Courier New', monospace;
  font-size: 10.5px;
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

/* Footer */
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
