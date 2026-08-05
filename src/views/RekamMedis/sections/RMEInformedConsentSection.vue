<template>
  <!-- KOP SURAT -->
  <div class="ic-kop">
    <div class="ic-kop-logo">
      <img :src="LINK_LOGO" alt="Logo RS" style="max-width: 56px; max-height: 56px" />
    </div>
    <div class="ic-kop-info">
      <div class="ic-kop-rs">{{ company }}</div>
      <div class="ic-kop-alamat">{{ ALAMAT }}</div>
    </div>
  </div>
  <div class="ic-kop-line"></div>

  <!-- JUDUL -->
  <div class="ic-title-block">
    <h2 class="ic-title">FORMULIR PERSETUJUAN RAWAT INAP</h2>
    <h3 class="ic-subtitle">GENERAL CONSENT</h3>
  </div>

  <!-- IDENTITAS PASIEN -->
  <div class="ic-patient-box" v-if="dataPasien?.NAMAPASIEN">
    <div class="ic-patient-row">
      <div class="ic-pf">
        <span class="ic-pf-label">Nama Pasien</span>
        <span class="ic-pf-value ic-pf-name">{{ dataPasien.NAMAPASIEN }}</span>
      </div>
      <div class="ic-pf">
        <span class="ic-pf-label">No. Rekam Medis</span>
        <span class="ic-pf-value ic-pf-mono">{{ dataPasien.NOMR }}</span>
      </div>
      <div class="ic-pf">
        <span class="ic-pf-label">Jenis Kelamin / Usia</span>
        <span class="ic-pf-value">
          {{ dataPasien.JENISKELAMIN === 'L' ? 'Laki-laki' : 'Perempuan' }},
          {{ dataPasien.USIA_PASIEN?.tahun }} tahun
        </span>
      </div>
    </div>
    <div class="ic-patient-row">
      <div class="ic-pf">
        <span class="ic-pf-label">Dokter Penanggung Jawab</span>
        <span class="ic-pf-value">{{ dataPasien.NAMADOKTER || '-' }}</span>
      </div>
      <div class="ic-pf">
        <span class="ic-pf-label">Diagnosis / Keluhan</span>
        <span class="ic-pf-value">{{ diagnosaTeks || '-' }}</span>
      </div>
      <div class="ic-pf">
        <span class="ic-pf-label">Cara Pembayaran</span>
        <span class="ic-pf-value">{{ dataPasien.CARABAYAR || '-' }}</span>
      </div>
    </div>
    <div class="ic-patient-row">
      <div class="ic-pf">
        <span class="ic-pf-label">Tanggal Masuk</span>
        <span class="ic-pf-value">{{ tanggalMasukDisplay }}</span>
      </div>
      <div class="ic-pf">
        <span class="ic-pf-label">Asal Poli / Unit</span>
        <span class="ic-pf-value">{{ dataPasien.POLI }}</span>
      </div>
      <div class="ic-pf">
        <span class="ic-pf-label">No. SEP</span>
        <span class="ic-pf-value ic-pf-mono">{{ dataPasien.NOSEP || '-' }}</span>
      </div>
    </div>
  </div>

  <div class="ic-section-line"></div>

  <!-- TEKS PERSETUJUAN -->
  <div class="ic-body">
    <p class="ic-body-intro">
      Yang bertanda tangan di bawah ini, menyatakan dengan sesungguhnya bahwa telah mendapatkan
      penjelasan yang jelas dan lengkap dari
      <strong>{{ dataPasien?.NAMADOKTER || 'Dokter Penanggung Jawab' }}</strong>
      mengenai rencana perawatan rawat inap sehubungan dengan kondisi:
      <strong>{{ diagnosaTeks || '...' }}</strong
      >.
    </p>
    <div v-if="consentHtml" class="ic-consent-html" v-html="consentHtml"></div>
    <template v-else>
      <p class="ic-body-sub">Penjelasan yang telah diterima meliputi:</p>
      <ol class="ic-list">
        <li>Diagnosis awal dan alasan medis dilakukannya rawat inap</li>
        <li>Rencana pengobatan, perawatan, dan prosedur yang akan dilakukan</li>
        <li>Hak dan kewajiban pasien selama menjalani perawatan di rumah sakit</li>
        <li>Peraturan dan tata tertib rumah sakit yang wajib ditaati</li>
        <li>Hak untuk menolak tindakan medis dan konsekuensinya</li>
        <li>Perkiraan biaya perawatan sesuai jenis layanan dan cara pembayaran</li>
        <li>Prosedur pengaduan apabila ada ketidakpuasan terhadap pelayanan</li>
      </ol>
    </template>
    <div class="ic-statement">
      <p>
        Pernyataan ini dibuat dengan sadar, tanpa paksaan dari pihak manapun, sebagai bukti
        persetujuan untuk menjalani perawatan medis di rumah sakit ini.
      </p>
    </div>
  </div>

  <div class="ic-section-line"></div>

  <!-- TEMPAT & TANGGAL -->
  <div class="ic-date-row">
    <span
      >Dibuat di, <strong>{{ ALAMAT }}</strong></span
    >
    <span
      >Tanggal: <strong>{{ tanggalMasukDisplay }}</strong></span
    >
  </div>

  <!-- TANDA TANGAN & QR -->
  <div class="ic-sig-section">
    <div class="ic-sig-inner">
      <!-- Signature boxes -->
      <div class="ic-sig-cards">
        <div class="ic-sig-row">
          <div v-for="signer in signers" :key="signer.hubungan" class="ic-sig-box">
            <!-- Foto -->
            <div class="ic-sig-photo">
              <img v-if="signer.photoData" :src="signer.photoData" class="ic-sig-photo-img" />
              <div v-else class="ic-sig-photo-empty">
                <i class="pi pi-user" style="font-size: 1.3rem; opacity: 0.25"></i>
              </div>
            </div>
            <!-- Tanda tangan -->
            <div class="ic-sig-canvas-wrap" :class="{ 'has-sig': signer.signatureData }">
              <img
                v-if="signer.signatureData"
                :src="signer.signatureData"
                class="ic-sig-canvas-img"
              />
              <div v-else class="ic-sig-canvas-empty"></div>
            </div>
            <div class="ic-sig-line-name"></div>
            <div class="ic-sig-name">{{ signer.nama || '( ' + signer.hubungan + ' )' }}</div>
            <div class="ic-sig-role">{{ signer.hubungan }}</div>
            <!-- Badge terverifikasi -->
            <div v-if="signer.is_auth" class="ic-sig-auth">
              <i class="pi pi-verified" style="color: #16a34a; font-size: 8pt"></i>
              <span class="ic-sig-auth-label">Terverifikasi</span>
            </div>
          </div>

          <!-- Placeholder jika belum ada signer -->
          <div v-if="signers.length === 0 && !loading" class="ic-sig-empty-hint">
            <i class="pi pi-info-circle me-1"></i>Belum ada tanda tangan
          </div>
        </div>
      </div>

      <!-- QR / TTE block -->
      <div class="ic-qr-block">
        <div class="ic-qr-title">Verifikasi TTE</div>
        <div v-if="tteAuth" class="ic-qr-code">
          <QrcodeVue :value="qrData" :size="70" level="H" render-as="svg" />
        </div>
        <div v-if="tteAuth" class="ic-qr-info">
          <div class="ic-qr-label">
            <i class="pi pi-verified me-1" style="color: #16a34a"></i>Petugas Rumah Sakit
          </div>
          <div class="ic-qr-user">{{ tteAuth.verif_by }}</div>
          <div class="ic-qr-time">{{ tteVerifTimesDisplay }}</div>
        </div>
        <div v-if="!tteAuth" class="ic-qr-pending">
          <i class="pi pi-clock me-1"></i>Menunggu verifikasi
        </div>
      </div>
    </div>
  </div>

  <!-- Belum ada data overlay -->
  <div v-if="!loading && !hasData" class="rme-section-no-data">
    <i class="pi pi-file-edit"></i>
    <span>Informed Consent belum diisi</span>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import QrcodeVue from 'qrcode.vue'
import axios from 'axios'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)
const reportSectionData = inject('reportSectionData', null)

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(true)
const consentHtml = ref('')
const signers = ref([])
const tteAuth = ref(null)

// ─── Computed ─────────────────────────────────────────────────────────────────
const diagnosaTeks = computed(() => {
  const d = props.dataPasien
  if (!d) return ''
  return d.DX_CAPTION ? String(d.DIAGNOSA_AWAL || '') + ' - ' + d.DX_CAPTION : d.DIAGNOSA_AWAL || ''
})

const tanggalMasukDisplay = computed(() => {
  const d = props.dataPasien?.MASUKPOLY
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const tteVerifTimesDisplay = computed(() => {
  const d = tteAuth.value?.verif_times
  if (!d) return ''
  return new Date(d).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const hasData = computed(() => signers.value.length > 0)

const qrData = computed(() =>
  JSON.stringify({
    dokumen: 'Consent Rawat Inap',
    noregister: props.noreg,
    petugas: {
      nama: tteAuth.value?.verif_name || '',
      nip: tteAuth.value?.verif_by || '',
      waktu: tteAuth.value?.verif_times || '',
    },
    is_auth: !!tteAuth.value,
  }),
)

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchConsentText = async () => {
  try {
    const { data } = await axios.post(
      configStore.apiBaseUrl + '/index.php/api/resumepulang/get_consent_pasien/',
      { id_client: id_client.value },
    )
    if (data.metadata?.code === '200' && data.response?.length > 0) {
      const found =
        data.response.find(
          (r) =>
            (r.jenis_consent || '').toUpperCase().includes('GENERAL') ||
            (r.jenis_consent || '').toUpperCase().includes('RAWAT'),
        ) || data.response[0]
      consentHtml.value = found?.display || ''
    }
  } catch {}
}

const fetchConsentAssets = async () => {
  if (!props.noreg) return
  try {
    const { data } = await axios.post(
      configStore.apiBaseUrl + '/index.php/api/triaseigd/get_consent_assets/',
      { id_client: id_client.value, noregister: props.noreg },
    )
    if (data.metadata?.code === '200' && data.response?.signers) {
      const raw = data.response.signers
      signers.value = raw.map((a) => ({
        hubungan: a.hubungan || '',
        nama: a.nama_lengkap || '',
        signatureData: a.signature_url || '',
        photoData: a.photo_url || '',
        is_auth: a.is_auth === '1' || a.is_auth === 1,
        verif_name: a.verif_name || '',
        verif_times: a.verif_times || '',
      }))
      tteAuth.value = raw.find((s) => s.is_auth === '1' || s.is_auth === 1) || null
    }
  } catch {}
}

const loadAll = async () => {
  loading.value = true
  await Promise.all([fetchConsentText(), fetchConsentAssets()])
  loading.value = false
  reportSectionData?.('informed-consent', hasData.value)
}

watch(
  () => props.noreg,
  (v) => {
    if (v) loadAll()
  },
)
onMounted(() => {
  if (props.noreg) loadAll()
})
</script>

<style scoped>
/* Font dasar dokumen */
.ic-kop,
.ic-title-block,
.ic-patient-box,
.ic-body,
.ic-date-row,
.ic-sig-section {
  font-family: 'Times New Roman', Times, serif;
  color: #111;
}

/* ── KOP ── */
.ic-kop {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.ic-kop-logo {
  flex-shrink: 0;
}
.ic-kop-rs {
  font-size: 15pt;
  font-weight: 900;
  text-transform: uppercase;
  color: #1e3a8a;
}
.ic-kop-alamat {
  font-size: 9pt;
  color: #555;
}
.ic-kop-line {
  border-top: 3px double #1e3a8a;
  margin-bottom: 0.75rem;
}

/* ── Judul ── */
.ic-title-block {
  text-align: center;
  margin-bottom: 0.85rem;
}
.ic-title {
  font-size: 13pt;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 0.1rem;
  letter-spacing: 0.03em;
}
.ic-subtitle {
  font-size: 11pt;
  font-weight: 700;
  margin: 0;
  text-decoration: underline;
}

/* ── Identitas ── */
.ic-patient-box {
  border: 1px solid #aaa;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: #fafafa;
}
.ic-patient-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}
.ic-pf {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
}
.ic-pf-label {
  font-size: 7.5pt;
  font-weight: 700;
  text-transform: uppercase;
  color: #555;
  letter-spacing: 0.04em;
}
.ic-pf-value {
  font-size: 10pt;
  font-weight: 600;
  color: #111;
  border-bottom: 1px dotted #bbb;
  padding-bottom: 1px;
}
.ic-pf-name {
  font-size: 12pt;
  font-weight: 900;
}
.ic-pf-mono {
  font-family: 'Courier New', monospace;
}

/* ── Lines ── */
.ic-section-line {
  border-top: 1px solid #bbb;
  margin: 0.75rem 0;
}

/* ── Body ── */
.ic-body {
  font-size: 10.5pt;
  line-height: 1.65;
  text-align: justify;
}
.ic-body-intro {
  margin-bottom: 0.6rem;
}
.ic-body-sub {
  font-weight: 700;
  margin-bottom: 0.35rem;
}
.ic-list {
  padding-left: 1.5rem;
  margin: 0 0 0.75rem;
}
.ic-list li {
  margin-bottom: 0.2rem;
}
.ic-statement {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid #1e3a8a;
  background: #f0f4ff;
  font-style: italic;
  font-size: 10pt;
}
.ic-consent-html {
  font-size: 10.5pt;
  line-height: 1.65;
  text-align: justify;
}
.ic-consent-html h4 {
  font-size: 11pt;
  font-weight: 700;
  margin: 0.6rem 0 0.2rem;
}
.ic-consent-html p {
  margin-bottom: 0.4rem;
}

/* ── Date row ── */
.ic-date-row {
  display: flex;
  justify-content: space-between;
  font-size: 10pt;
  margin: 0.5rem 0 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* ── Signature section ── */
.ic-sig-section {
  margin-top: 0.5rem;
}
.ic-sig-inner {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 0.75rem 0.25rem 0.5rem;
}
.ic-sig-cards {
  flex: 1 1 0;
}
.ic-sig-row {
  display: flex;
  gap: 0.5rem;
  justify-content: space-around;
  flex-wrap: wrap;
}

.ic-sig-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 110px;
  min-width: 80px;
}
.ic-sig-photo {
  width: 72px;
  height: 72px;
  border: 1px solid #aaa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.ic-sig-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ic-sig-photo-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ccc;
}

.ic-sig-canvas-wrap {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 2px;
  transition: height 0.2s;
}
.ic-sig-canvas-wrap.has-sig {
  height: 90px;
}
.ic-sig-canvas-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ic-sig-canvas-empty {
  width: 100%;
  height: 2px;
  background: #444;
  align-self: flex-end;
}

.ic-sig-line-name {
  width: 100%;
  border-top: 2px solid #444;
  margin-bottom: 2px;
}
.ic-sig-name {
  font-size: 8pt;
  text-align: center;
  font-weight: 700;
  word-break: break-word;
}
.ic-sig-role {
  font-size: 9pt;
  text-align: center;
  color: #555;
}
.ic-sig-auth {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 3px;
  padding: 2px 5px;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 4px;
  width: 100%;
  justify-content: center;
}
.ic-sig-auth-label {
  font-size: 7pt;
  font-weight: 700;
  color: #15803d;
}

.ic-sig-empty-hint {
  font-size: 9pt;
  color: #94a3b8;
  font-style: italic;
  padding: 1rem;
}

/* ── QR block ── */
.ic-qr-block {
  flex: 0 0 155px;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  padding: 0.75rem;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.ic-qr-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e40af;
  text-align: center;
}
.ic-qr-code {
  width: 70px;
  height: 70px;
}
.ic-qr-info {
  text-align: center;
  font-size: 0.68rem;
  color: #334155;
  width: 100%;
}
.ic-qr-label {
  font-weight: 700;
  margin-bottom: 0.2rem;
}
.ic-qr-user,
.ic-qr-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ic-qr-pending {
  font-size: 0.68rem;
  color: #94a3b8;
  text-align: center;
}
</style>
