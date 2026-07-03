<template>
  <div class="sep-wrap">
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span>
      Memuat data SEP...
    </div>

    <div v-else-if="!sepData" class="rme-empty-note">
      Data SEP tidak tersedia — pasien Non-BPJS atau SEP belum dibuat.
    </div>

    <div v-else class="sep-doc">
      <!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
      <div class="sep-hdr">
        <!-- Logo BPJS -->
        <div class="sep-hdr-logo">
          <img src="https://ws-simrs.net/logo/bpjs.jpg" />
        </div>

        <!-- Judul -->
        <div class="sep-hdr-center">
          <div class="sep-title">SURAT ELEGIBILITAS PESERTA</div>
          <div class="sep-rs-name">{{ company }}</div>
        </div>

        <!-- QR Code (menggantikan barcode) -->
        <div class="sep-hdr-qr">
          <QrcodeVue :value="sepData.NOSEP || noreg" :size="40" level="M" render-as="svg" />
        </div>
      </div>

      <div class="sep-divider"></div>

      <!-- ══ BODY ════════════════════════════════════════════════════════════ -->
      <div class="sep-body">
        <!-- Kolom kiri -->
        <div class="sep-col-l">
          <table class="sep-tbl sep-tbl-l">
            <colgroup>
              <col style="width: 108px" />
              <col style="width: 14px" />
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
                  <span class="sep-norm-inline">
                    &ensp;<b>No.MR</b>&ensp;{{ sepData.NORM || dataPasien?.NOMR || '-' }}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="sl">Nama Peserta</td>
                <td class="ss">:</td>
                <td class="sv bold">{{ sepData.NAMA || '-' }}</td>
              </tr>
              <tr>
                <td class="sl">Tgl Lahir</td>
                <td class="ss">:</td>
                <td class="sv">{{ fmtDate(sepData.TGLLAHIR) }}</td>
              </tr>
              <tr>
                <td class="sl">Jenis Kelamin</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.JENISKELAMIN === 'L' ? 'L' : 'P' }}</td>
              </tr>
              <tr>
                <td class="sl">No.Telepon</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.NOTLP || '-' }}</td>
              </tr>
              <tr>
                <td class="sl">Sub/Spesialis</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.POLI || '-' }}</td>
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
                <td class="sl">Diagnosa Awal</td>
                <td class="ss">:</td>
                <td class="sv">{{ diagAwal }}</td>
              </tr>
              <tr>
                <td class="sl">Catatan</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.CTT_KLL || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Kolom kanan -->
        <div class="sep-col-r">
          <table class="sep-tbl sep-tbl-r">
            <colgroup>
              <col style="width: 100px" />
              <col style="width: 14px" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td class="sl">Peserta</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.JENISPESERTA || '-' }}</td>
              </tr>
              <tr>
                <td class="sl">Jns.Rawat</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.JENISPELAYANAN || '-' }}</td>
              </tr>
              <tr>
                <td class="sl">Jns.Kunjungan</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.TUJUAN_KUNJUNGAN || '-' }}</td>
              </tr>
              <tr>
                <td class="sl">Poli perujuk</td>
                <td class="ss">:</td>
                <td class="sv">{{ sepData.POLI || '-' }}</td>
              </tr>
              <tr>
                <td class="sl">Kelas Hak</td>
                <td class="ss">:</td>
                <td class="sv">
                  {{ sepData.HAKKELAS ? 'Kelas ' + sepData.HAKKELAS : '-' }}
                </td>
              </tr>
              <tr>
                <td class="sl">Kelas Rawat</td>
                <td class="ss">:</td>
                <td class="sv">
                  {{ sepData.KELASRAWAT ? 'Kelas ' + sepData.KELASRAWAT : '-' }}
                </td>
              </tr>
              <!-- spacer row -->
              <tr>
                <td colspan="3" style="padding: 5px 0"></td>
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
            </tbody>
          </table>
        </div>
      </div>

      <div class="sep-divider"></div>

      <!-- ══ FOOTER ══════════════════════════════════════════════════════════ -->
      <div class="sep-footer">
        <div class="sep-foot-l">
          <p class="sep-disclaimer">
            *Saya menyetujui BPJS Kesehatan menggunakan informasi medis pasien jika diperlukan. SEP
            bukan sebagai bukti penjamin peserta
          </p>
          <p class="sep-printinfo">
            &ensp;<em>Cetakan Ke: 1 &ensp; Tanggal Cetak : {{ printDateTime }} &ensp; WIB</em>
          </p>
        </div>
        <div class="sep-foot-r">
          Dengan tampilnya SEP ini merupakan validasi terhadap eligibilitas Peserta secara
          elektronik dan peserta dapat engakses pelayanan kesehatan rujukan sesuai ketentuan berlaku
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
import QrcodeVue from 'qrcode.vue'

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

// ── Computed ──────────────────────────────────────────────────────────────
const diagAwal = computed(() => {
  const kode = sepData.value?.KODEDIAGNOSA || ''
  const nama = sepData.value?.NAMADIAGNOSA || ''
  if (kode && nama) return `${kode} - ${nama}`
  return nama || kode || '-'
})

const printDateTime = computed(() => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
})

// ── Format helpers ────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return '-'
  const parts = String(d).split('-')
  if (parts.length < 3) return d
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

// ── Fetch ─────────────────────────────────────────────────────────────────
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
.sep-wrap {
  width: 100%;
}

/* ══ Dokumen utama ═══════════════════════════════════════════════════════ */
.sep-doc {
  width: 100%;
  border-radius: 1px;
  overflow: hidden;
  font-size: 12px;
  color: #111;
  line-height: 1;
  font-family: Arial, sans-serif;
}

/* ══ HEADER ══════════════════════════════════════════════════════════════ */
.sep-hdr {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 8px;
  width: 100%;
  box-sizing: border-box;
}

/* Logo BPJS */
.sep-hdr-logo {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
.sep-hdr-logo img {
  height: 52px;
  width: auto;
  max-width: 160px;
  object-fit: contain;
  display: block;
}
.sep-logo-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.sep-logo-bpjs {
  font-size: 40px;
  font-weight: 800;
  color: #0067b1;
  line-height: 1.1;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sep-logo-sub {
  font-size: 9px;
  color: #333;
  line-height: 1.2;
}

/* Judul center */
.sep-hdr-center {
  flex: 1 1 0%;
  min-width: 0;
  text-align: center;
}
.sep-title {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.sep-rs-name {
  font-size: 12px;
  font-weight: 600;
  color: #222;
  margin-top: 2px;
}

/* QR code kanan */
.sep-hdr-qr {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ══ Divider ═════════════════════════════════════════════════════════════ */
.sep-divider {
  border: none;
  border-top: 1px solid #aab8c4;
  margin: 0;
}

/* ══ BODY ════════════════════════════════════════════════════════════════ */
.sep-body {
  display: flex;
  gap: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 16px 10px;
  align-items: flex-start;
}

.sep-tbl {
  border-collapse: collapse;
  vertical-align: top;
  width: 100%;
}

.sep-col-l {
  flex: 1 1 0%;
  min-width: 0;
  overflow: hidden;
}
.sep-col-r {
  flex: 0 0 230px;
  width: 230px;
  padding-left: 16px;
}

.sl {
  color: #222;
  font-size: 11.5px;
  white-space: nowrap;
  vertical-align: top;
  padding: 2px 0;
}
.ss {
  color: #555;
  vertical-align: top;
  padding: 2px 4px;
}
.sv {
  color: #111;
  font-size: 11.5px;
  vertical-align: top;
  padding: 2px 0;
}
.bold {
  font-weight: 700;
}
.mono {
  font-family: 'Courier New', monospace;
}

.sep-norm-inline {
  font-size: 11.5px;
  color: #111;
}

/* ══ FOOTER ══════════════════════════════════════════════════════════════ */
.sep-footer {
  display: flex;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 0;
  font-size: 9.5px;
  color: #333;
  line-height: 1.55;
  border-top: 1px solid #aab8c4;
  align-items: flex-start;
}
.sep-foot-l {
  flex: 1 1 0%;
  min-width: 0;
}
.sep-disclaimer {
  margin: 0 0 6px;
  font-size: 9.5px;
}
.sep-printinfo {
  font-size: 10px;
  color: #333;
  margin-top: 2px;
}
.sep-foot-r {
  flex: 1 1 0%;
  min-width: 0;
  text-align: justify;
  font-size: 9.5px;
}

@media print {
  .sep-doc {
    border-color: #999 !important;
  }
  .sep-logo-bpjs {
    color: #0067b1 !important;
  }
}
</style>
