<template>
  <div class="rujukan-wrap">
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span>
      Memuat data rujukan...
    </div>

    <div v-else-if="!rujukanData" class="rme-empty-note">
      ℹ️ Tidak ada data rujukan untuk kunjungan ini.
    </div>

    <div v-else class="rujukan-doc">
      <!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
      <div class="rujukan-hdr">
        <div class="rujukan-hdr-logo">
          <img src="https://ws-simrs.net/logo/bpjs.jpg" alt="BPJS" class="rujukan-bpjs-img" />
        </div>
        <div class="rujukan-hdr-title">SURAT RUJUKAN RUMAH SAKIT</div>
        <div></div>
      </div>

      <div class="rujukan-divider"></div>

      <!-- ══ BODY ════════════════════════════════════════════════════════════ -->
      <div class="rujukan-body">
        <!-- Kolom Kiri -->
        <div class="rujukan-col-l">
          <table class="rujukan-tbl">
            <colgroup>
              <col style="width: 90px" />
              <col style="width: 12px" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td class="rl">Kepada Yth</td>
                <td class="rs">:</td>
                <td class="rv bold">
                  {{ rujukanData.NAMATUJUANRUJUKAN || rujukanData.NAMAMRSJUJUAN || '-' }}
                </td>
              </tr>
            </tbody>
          </table>

          <p class="rujukan-request-text">
            Mohon pemeriksaan dan penanganan lebih lanjut penderita :
          </p>

          <table class="rujukan-tbl">
            <colgroup>
              <col style="width: 90px" />
              <col style="width: 12px" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td class="rl">Nama</td>
                <td class="rs">:</td>
                <td class="rv bold">
                  {{ rujukanData.NAMAPASIEN || dataPasien?.NAMAPASIEN || '-' }}
                </td>
              </tr>
              <tr>
                <td class="rl">No Kartu</td>
                <td class="rs">:</td>
                <td class="rv mono">{{ rujukanData.NOKARTU || '-' }}</td>
              </tr>
              <tr>
                <td class="rl" style="vertical-align: top; padding-top: 3px">Diagnosa</td>
                <td class="rs" style="vertical-align: top; padding-top: 3px">:</td>
                <td class="rv">{{ diagnosaText }}</td>
              </tr>
              <tr>
                <td class="rl">Keterangan</td>
                <td class="rs">:</td>
                <td class="rv">{{ rujukanData.KETERANGAN || '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Kolom Kanan -->
        <div class="rujukan-col-r">
          <div class="rujukan-jenis-badge">{{ rujukanData.JENISRUJUKAN || 'PENUH' }}</div>

          <table class="rujukan-tbl">
            <colgroup>
              <col style="width: 108px" />
              <col style="width: 12px" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td class="rl">No.Rujukan</td>
                <td class="rs">:</td>
                <td class="rv bold mono">{{ rujukanData.NORUJUKAN || '-' }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Barcode visual -->
          <div class="rujukan-barcode-area" v-if="rujukanData.NORUJUKAN">
            <div class="rujukan-barcode-bars"></div>
          </div>

          <table class="rujukan-tbl" style="margin-top: 6px">
            <colgroup>
              <col style="width: 108px" />
              <col style="width: 12px" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td class="rl">Asal Rumah Sakit</td>
                <td class="rs">:</td>
                <td class="rv">
                  <strong>{{ daataRS || '' }}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="rujukan-detail-grid">
            <table class="rujukan-tbl" style="margin-top: 10px">
              <colgroup>
                <col style="width: 84px" />
                <col style="width: 12px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td class="rl">Umur</td>
                  <td class="rs">:</td>
                  <td class="rv">{{ rujukanData.UMUR || dataPasien?.UMUR || '-' }} Tahun</td>
                </tr>
                <tr>
                  <td class="rl">L/P</td>
                  <td class="rs">:</td>
                  <td class="rv">{{ jenisKelaminText }}</td>
                </tr>
                <tr>
                  <td class="rl">Jenis Rawat</td>
                  <td class="rs">:</td>
                  <td class="rv">{{ rujukanData.JENISRAWAT || dataPasien?.JENISRAWAT || '-' }}</td>
                </tr>
                <tr>
                  <td class="rl">Poli Tujuan</td>
                  <td class="rs">:</td>
                  <td class="rv bold">
                    {{ rujukanData.POLITUJUAN || rujukanData.NAMAPOLITUJUAN || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ══ FOOTER ══════════════════════════════════════════════════════════ -->
      <div class="rujukan-footer">
        <div class="rujukan-foot-l">
          <p class="rujukan-closing">Demikian atas bantuannya, diucapkan banyak terima kasih</p>
          <div class="rujukan-ttd-line"></div>
          <p v-if="masaBerlaku" class="rujukan-masa-berlaku">
            <strong>Masa rujukan berlaku 90 hari sampai dengan {{ masaBerlaku }}</strong>
          </p>
        </div>
        <div class="rujukan-foot-r">
          <p class="rujukan-tgl-cetak">{{ fmtDateLong(rujukanData.TGLRUJUKAN) }}</p>
          <p class="rujukan-mengetahui">Mengetahui</p>
          <div class="rujukan-ttd-space"></div>
          <div class="rujukan-ttd-line-short"></div>
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
const { id_client } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(false)
const rujukanData = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────
const diagnosaText = computed(() => {
  const kode = rujukanData.value?.KDDIAGNOSA || rujukanData.value?.KODEDIAGNOSA || ''
  const nama = rujukanData.value?.NMDIAGNOSA || rujukanData.value?.NAMADIAGNOSA || ''
  if (kode && nama) return `${kode} - ${nama}`
  return nama || kode || rujukanData.value?.DIAGNOSA || '-'
})

const jenisKelaminText = computed(() => {
  const jk = rujukanData.value?.JENISKELAMIN || props.dataPasien?.JENISKELAMIN || ''
  if (!jk) return '-'
  const upper = String(jk).toUpperCase()
  if (upper === 'L' || upper === 'LAKI-LAKI' || upper === 'LAKI') return 'Laki-laki'
  if (upper === 'P' || upper === 'PEREMPUAN' || upper === 'WANITA') return 'Perempuan'
  return jk
})

const masaBerlaku = computed(() => {
  const tgl =
    rujukanData.value?.TGLAKHIRRUJUKAN ||
    rujukanData.value?.BERLAKUSAMPAI ||
    rujukanData.value?.TGLAKHIR
  return tgl ? fmtDateSlash(tgl) : null
})

// ── Format helpers ────────────────────────────────────────────────────────
const fmtDateSlash = (d) => {
  if (!d) return '-'
  const parts = String(d).split('-')
  if (parts.length < 3) return d
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

const fmtDateLong = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return d
  }
}

const daataRS = ref(null)

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchData = async () => {
  if (!props.noreg || !id_client.value || !configStore.apiBaseUrl) return
  if (!props.dataPasien || Object.keys(props.dataPasien).length === 0) return

  loading.value = true
  try {
    const payload = {
      noregister: props.noreg,
      id_client: id_client.value,
    }
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/getdatarujukanv3/`,
      payload,
    )

    const raw = res.data?.response
    daataRS.value = res.data?.profile
    rujukanData.value = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null)
    reportSectionData('rujukan', !!rujukanData.value)
  } catch {
    rujukanData.value = null
    reportSectionData('rujukan', false)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.noreg, props.dataPasien],
  ([noreg, dp]) => {
    if (noreg && dp && Object.keys(dp).length > 0) fetchData()
  },
  { immediate: true, deep: false },
)
</script>

<style scoped>
.rujukan-wrap {
  font-size: 12px;
  color: #1a1a2e;
}

/* ── Header ── */
.rujukan-hdr {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
}

.rujukan-hdr-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rujukan-bpjs-img {
  height: 30px;
  object-fit: contain;
}

.rujukan-bpjs-brand {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.rujukan-bpjs-name {
  font-size: 14px;
  color: #006837;
}

.rujukan-bpjs-name b {
  color: #006837;
  font-weight: 800;
  margin-right: 2px;
}

.rujukan-bpjs-sub {
  font-size: 9px;
  color: #555;
}

.rujukan-hdr-title {
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #1a1a2e;
}

/* ── Divider ── */
.rujukan-divider {
  border: none;
  border-top: 1.5px solid #1a1a2e;
  margin: 6px 0 14px;
}

/* ── Body ── */
.rujukan-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 220px;
}

.rujukan-col-l,
.rujukan-col-r {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── Table rows ── */
.rujukan-tbl {
  width: 100%;
  border-collapse: collapse;
}

.rujukan-tbl .rl {
  font-size: 12px;
  color: #333;
  padding: 2px 0;
  vertical-align: top;
}

.rujukan-tbl .rs {
  padding: 2px 4px;
  color: #555;
  vertical-align: top;
}

.rujukan-tbl .rv {
  font-size: 12px;
  color: #1a1a2e;
  padding: 2px 0;
  vertical-align: top;
}

.rujukan-tbl .bold {
  font-weight: 700;
}

.rujukan-tbl .mono {
  font-family: 'Courier New', monospace;
}

/* ── Request text ── */
.rujukan-request-text {
  font-size: 12px;
  color: #333;
  margin: 10px 0 6px;
  line-height: 1.5;
}

/* ── Jenis badge (PENUH / PARSIAL) ── */
.rujukan-jenis-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #555;
  text-align: right;
  margin-bottom: 4px;
}

/* ── Barcode ── */
.rujukan-barcode-area {
  margin: 4px 0 6px;
}

.rujukan-barcode-bars {
  height: 20px;
  background-image: repeating-linear-gradient(
    to right,
    #000 0px,
    #000 2px,
    transparent 2px,
    transparent 4px,
    #000 4px,
    #000 7px,
    transparent 7px,
    transparent 9px,
    #000 9px,
    #000 10px,
    transparent 10px,
    transparent 13px,
    #000 13px,
    #000 16px,
    transparent 16px,
    transparent 17px,
    #000 17px,
    #000 19px,
    transparent 19px,
    transparent 21px,
    #000 21px,
    #000 22px,
    transparent 22px,
    transparent 25px,
    #000 25px,
    #000 27px,
    transparent 27px,
    transparent 28px,
    #000 28px,
    #000 31px,
    transparent 31px,
    transparent 33px
  );
  background-size: 33px 100%;
  width: 100%;
  max-width: 260px;
}

/* ── Footer ── */
.rujukan-footer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: end;
  margin-top: 24px;
}

.rujukan-foot-l {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rujukan-closing {
  font-size: 12px;
  color: #333;
  margin: 0;
}

.rujukan-ttd-line {
  border-top: 1px solid #333;
  width: 100%;
  max-width: 360px;
}

.rujukan-masa-berlaku {
  font-size: 11.5px;
  color: #1a1a2e;
  margin: 0;
}

.rujukan-foot-r {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 160px;
}

.rujukan-tgl-cetak,
.rujukan-mengetahui {
  font-size: 12px;
  color: #333;
  margin: 0;
}

.rujukan-ttd-space {
  height: 44px;
}

.rujukan-ttd-line-short {
  border-top: 1px solid #333;
  width: 140px;
}
</style>
