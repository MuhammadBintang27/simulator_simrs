<template>
  <div class="skm-wrap">
    <!-- ══ JUDUL ══════════════════════════════════════════════════════════ -->
    <div class="skm-header">
      <img v-if="LINK_LOGO" :src="LINK_LOGO" class="skm-logo" alt="logo" />
      <div class="skm-title-block">
        <div class="skm-title">SURAT KETERANGAN KEMATIAN</div>
        <div class="skm-nomor">
          Nomor: {{ dataPasien?.NOPENDAFTARAN || '.........' }} / SKK / RSSIM / {{ tahunMeninggal }}
        </div>
      </div>
    </div>

    <div class="skm-divider"></div>

    <!-- ══ PEMBUKA ════════════════════════════════════════════════════════ -->
    <p class="skm-pembuka">
      Yang bertanda tangan di bawah ini, Dokter yang bertugas di
      <strong>{{ company }}</strong
      >, dengan ini menerangkan bahwa telah meninggal dunia pasien dengan data sebagai berikut:
    </p>

    <!-- ══ I. DATA PASIEN ════════════════════════════════════════════════ -->
    <div class="skm-section-hdr">I. DATA PASIEN</div>
    <table class="skm-tbl">
      <colgroup>
        <col style="width: 210px" />
        <col style="width: 14px" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td class="skm-lbl">Nama Lengkap</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ dataPasien?.NAMAPASIEN || '' }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">No. Rekam Medis</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ dataPasien?.NOMR || '' }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">NIK</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ dataPasien?.NOKTP || '' }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Jenis Kelamin</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ jenisKelamin }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Tempat, Tanggal Lahir</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ formatTglLahir }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Umur</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ usiaText }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Pekerjaan</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">Tidak disebutkan<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Alamat</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ alamatLengkap }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Nama Orang Tua / Suami / Istri</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">Tidak disebutkan<span class="skm-line"></span></td>
        </tr>
      </tbody>
    </table>

    <!-- ══ II. DATA KEMATIAN ═════════════════════════════════════════════ -->
    <div class="skm-section-hdr" style="margin-top: 18px">II. DATA KEMATIAN</div>
    <table class="skm-tbl">
      <colgroup>
        <col style="width: 210px" />
        <col style="width: 14px" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <td class="skm-lbl">Ruang Perawatan / Poli</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ dataPasien?.POLI || '' }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Tanggal Masuk RS</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ formatTglMasuk }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Hari, Tanggal Meninggal</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ hariTanggalMeninggal }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Pukul Meninggal</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ pukulMeninggal }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Tempat Meninggal</td>
          <td class="skm-sep">:</td>
          <td class="skm-val">{{ company }}<span class="skm-line"></span></td>
        </tr>
        <tr>
          <td class="skm-lbl">Sebab Kematian</td>
          <td class="skm-sep">:</td>
          <td class="skm-val skm-val--capitalize">
            {{ dataPasien?.SEBAB_KEMATIAN || '' }}<span class="skm-line"></span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ══ PENUTUP ════════════════════════════════════════════════════════ -->
    <p class="skm-penutup">
      Surat keterangan ini dibuat berdasarkan catatan rekam medis dan pemeriksaan yang dilakukan,
      serta digunakan sebagai keterangan resmi kematian pasien tersebut di atas untuk keperluan
      administrasi (pengurusan akta kematian, klaim asuransi/BPJS, pemakaman, atau keperluan lain
      yang sah).
    </p>
    <p class="skm-penutup">
      Demikian surat keterangan kematian ini dibuat dengan sebenar-benarnya dan dapat dipergunakan
      sebagaimana mestinya.
    </p>

    <!-- ══ TANDA TANGAN ═══════════════════════════════════════════════════ -->
    <div class="skm-ttd-area">
      <div class="skm-ttd-block">
        <div class="skm-ttd-place">{{ ALAMAT }}, {{ tanggalTtd }}</div>
        <div class="skm-ttd-role">Dokter yang Merawat / Menyatakan,</div>
        <div class="skm-ttd-qr">
          <QrcodeVue :value="qrValue" :size="50" level="M" />
        </div>
        <div class="skm-ttd-name">
          (
          {{ dataPasien?.NAMADOKTER || '......................................................' }} )
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  dataPasien: { type: Object, default: null },
  noreg: { type: String, default: '' },
})

const authStore = useAuthStore()
const { company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN = [
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

const formatTgl = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

const jenisKelamin = computed(() => {
  const jk = props.dataPasien?.JENISKELAMIN
  if (jk === 'L') return 'Laki-laki'
  if (jk === 'P') return 'Perempuan'
  return jk || ''
})

const formatTglLahir = computed(() => formatTgl(props.dataPasien?.TGLLAHIR))

const usiaText = computed(() => {
  const u = props.dataPasien?.USIA_PASIEN
  if (u && typeof u === 'object') {
    const parts = []
    if (u.tahun) parts.push(`${u.tahun} Tahun`)
    if (u.bulan) parts.push(`${u.bulan} Bulan`)
    if (u.hari) parts.push(`${u.hari} Hari`)
    if (parts.length) return parts.join(' ')
  }
  const raw = props.dataPasien?.USIA
  return raw ? `${raw} Tahun` : ''
})

const alamatLengkap = computed(() => {
  const parts = []
  if (props.dataPasien?.ALAMAT) parts.push(props.dataPasien.ALAMAT)
  if (props.dataPasien?.NAMAKECAMATAN) parts.push(`Kec. ${props.dataPasien.NAMAKECAMATAN}`)
  return parts.join(', ')
})

const formatTglMasuk = computed(() => formatTgl(props.dataPasien?.TGLREG))

// KELUARPOLY format: "DD-MM-YYYY HH:MM"
const parseKeluar = () => {
  const raw = props.dataPasien?.KELUARPOLY
  if (!raw) return null
  const [datePart, timePart] = raw.split(' ')
  if (!datePart) return null
  const [dd, mm, yyyy] = datePart.split('-').map(Number)
  const [hh = 0, mn = 0] = (timePart || '').split(':').map(Number)
  const d = new Date(yyyy, mm - 1, dd, hh, mn)
  return isNaN(d.getTime()) ? null : d
}

const hariTanggalMeninggal = computed(() => {
  const d = parseKeluar()
  if (!d) return ''
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
})

const pukulMeninggal = computed(() => {
  const d = parseKeluar()
  if (!d) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mn = String(d.getMinutes()).padStart(2, '0')
  return `${hh}.${mn} WIB`
})

const tanggalTtd = computed(() => {
  const d = parseKeluar()
  if (!d) return '..........................'
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
})

const tahunMeninggal = computed(() => {
  const d = parseKeluar()
  return d ? d.getFullYear() : '.........'
})

const qrValue = computed(() => {
  const p = props.dataPasien
  if (!p) return '-'
  return JSON.stringify({
    dokumen: 'Surat Keterangan Kematian',
    no_pendaftaran: p.NOPENDAFTARAN || '',
    nomr: p.NOMR || '',
    nama_pasien: p.NAMAPASIEN || '',
    waktu_meninggal: p.KELUARPOLY || '',
    sebab_kematian: p.SEBAB_KEMATIAN || '',
    dokter: p.NAMADOKTER || '',
  })
})
</script>

<style scoped>
.skm-wrap {
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  color: #111;
  padding: 24px 32px;
  line-height: 1.6;
}

/* ── Header ── */
.skm-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 4px;
}
.skm-logo {
  height: 64px;
  object-fit: contain;
}
.skm-title-block {
  text-align: center;
}
.skm-title {
  font-size: 15pt;
  font-weight: 700;
  text-decoration: underline;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.skm-nomor {
  font-size: 11pt;
  margin-top: 4px;
}
.skm-divider {
  border-top: 2px solid #111;
  margin: 10px 0 14px;
}

/* ── Pembuka ── */
.skm-pembuka {
  margin: 0 0 14px;
  text-align: justify;
  font-size: 12pt;
}

/* ── Section Header ── */
.skm-section-hdr {
  font-weight: 700;
  font-size: 12pt;
  margin-bottom: 6px;
}

/* ── Table ── */
.skm-tbl {
  width: 100%;
  border-collapse: collapse;
}
.skm-tbl tr td {
  padding: 3px 0;
  vertical-align: top;
}
.skm-lbl {
  font-size: 11.5pt;
  padding-left: 16px;
}
.skm-sep {
  text-align: center;
  padding: 3px 6px;
}
.skm-val {
  font-size: 11.5pt;
  position: relative;
}
.skm-val--capitalize {
  text-transform: capitalize;
}

/* Garis bawah di setiap baris nilai */
.skm-line {
  display: block;
  border-bottom: 1px solid #333;
  margin-top: 2px;
  min-height: 4px;
}

/* ── Penutup ── */
.skm-penutup {
  margin: 14px 0 0;
  text-align: justify;
  font-size: 11.5pt;
}

/* ── Tanda Tangan ── */
.skm-ttd-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
}
.skm-ttd-qr {
  display: flex;
  justify-content: center;
  margin: 8px 0 4px;
}
.skm-ttd-block {
  text-align: center;
  min-width: 240px;
}
.skm-ttd-place {
  font-size: 11.5pt;
  margin-bottom: 2px;
}
.skm-ttd-role {
  font-size: 11.5pt;
  margin-bottom: 2px;
}
.skm-ttd-space {
  height: 64px;
}
.skm-ttd-name {
  font-size: 11.5pt;
  font-weight: 600;
  border-top: 1px solid #111;
  padding-top: 4px;
}
.skm-ttd-nip {
  font-size: 11pt;
  margin-top: 2px;
}

/* ── Print ── */
@media print {
  .skm-wrap {
    padding: 0;
  }
}
</style>
