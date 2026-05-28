<template>
  <!-- ===== DOCUMENT VIEWER ===== -->
  <div class="doc-viewer">
    <!-- Toolbar -->
    <div class="doc-toolbar">
      <div class="toolbar-brand">
        <i class="pi pi-file-edit me-2"></i>
        <span>Informed Consent Rawat Inap</span>
      </div>
      <div class="toolbar-actions">
        <Button
          label="Cetak"
          icon="pi pi-print"
          severity="secondary"
          outlined
          size="small"
          @click="window.print()"
        />
      </div>
    </div>

    <!-- A4 Paper -->
    <div class="a4-paper">
      <!-- ── KOP SURAT ── -->
      <div class="doc-kop">
        <div class="doc-kop-logo">
          <img :src="LINK_LOGO" alt="Logo Rumah Sakit" style="max-width: 60px; max-height: 60px" />
        </div>
        <div class="doc-kop-info">
          <div class="doc-kop-rs">{{ company }}</div>
          <div class="doc-kop-alamat">{{ ALAMAT }}</div>
        </div>
      </div>
      <div class="doc-kop-line"></div>

      <!-- ── JUDUL ── -->
      <div class="doc-title-block">
        <h2 class="doc-title">FORMULIR PERSETUJUAN RAWAT INAP</h2>
        <h3 class="doc-subtitle">GENERAL CONSENT</h3>
      </div>

      <!-- ── IDENTITAS PASIEN ── -->
      <div class="doc-patient-box" v-if="patientData">
        <div class="doc-patient-row">
          <div class="doc-patient-field">
            <span class="dpf-label">Nama Pasien</span>
            <span class="dpf-value dpf-name">{{ patientData.NAMAPASIEN }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">No. Rekam Medis</span>
            <span class="dpf-value dpf-mono">{{ patientData.NOMR }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Jenis Kelamin / Usia</span>
            <span class="dpf-value">
              {{ patientData.JENISKELAMIN === 'L' ? 'Laki-laki' : 'Perempuan' }},
              {{ patientData.USIA_PASIEN?.tahun }} tahun
            </span>
          </div>
        </div>
        <div class="doc-patient-row">
          <div class="doc-patient-field">
            <span class="dpf-label">Dokter Penanggung Jawab</span>
            <span class="dpf-value">{{ extraForm.dpjp || '-' }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Diagnosis / Keluhan</span>
            <span class="dpf-value">{{ extraForm.diagnosa || '-' }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Cara Pembayaran</span>
            <span class="dpf-value">{{ extraForm.caraBayar || '-' }}</span>
          </div>
        </div>
        <div class="doc-patient-row">
          <div class="doc-patient-field">
            <span class="dpf-label">Tanggal Masuk</span>
            <span class="dpf-value">
              {{
                extraForm.tanggalMasuk
                  ? new Date(extraForm.tanggalMasuk).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'
              }}
            </span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Asal Poli / Unit</span>
            <span class="dpf-value">{{ patientData.POLI }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">No. SEP</span>
            <span class="dpf-value dpf-mono">{{ patientData.NOSEP || '-' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="doc-patient-loading">
        <i class="pi pi-spin pi-spinner me-2"></i> Memuat data pasien...
      </div>

      <div class="doc-section-line"></div>

      <!-- ── TEKS PERSETUJUAN ── -->
      <div class="doc-body">
        <p class="doc-body-intro">
          Yang bertanda tangan di bawah ini, menyatakan dengan sesungguhnya bahwa telah mendapatkan
          penjelasan yang jelas dan lengkap dari
          <strong>{{ extraForm.dpjp || 'Dokter Penanggung Jawab' }}</strong>
          mengenai rencana perawatan rawat inap sehubungan dengan kondisi:
          <strong>{{ extraForm.diagnosa || '...' }}</strong
          >.
        </p>

        <!-- HTML dari database -->
        <div v-if="consentHtml" class="doc-consent-html" v-html="consentHtml"></div>

        <!-- Fallback statis -->
        <template v-else>
          <p class="doc-body-sub">Penjelasan yang telah diterima meliputi:</p>
          <ol class="doc-list">
            <li>Diagnosis awal dan alasan medis dilakukannya rawat inap</li>
            <li>Rencana pengobatan, perawatan, dan prosedur yang akan dilakukan</li>
            <li>Hak dan kewajiban pasien selama menjalani perawatan di rumah sakit</li>
            <li>Peraturan dan tata tertib rumah sakit yang wajib ditaati</li>
            <li>Hak untuk menolak tindakan medis dan konsekuensinya</li>
            <li>Perkiraan biaya perawatan sesuai jenis layanan dan cara pembayaran</li>
            <li>Prosedur pengaduan apabila ada ketidakpuasan terhadap pelayanan</li>
          </ol>
        </template>

        <!-- Pernyataan setuju -->
        <div class="doc-statement">
          <p>
            Pernyataan ini dibuat dengan sadar, tanpa paksaan dari pihak manapun, sebagai bukti
            persetujuan untuk menjalani perawatan medis di rumah sakit ini.
          </p>
        </div>
      </div>

      <div class="doc-section-line"></div>

      <!-- ── TEMPAT & TANGGAL ── -->
      <div class="doc-date-row">
        <div class="doc-place-field">
          <span>Dibuat di, </span>
          <strong class="ml-2"> {{ ALAMAT }}</strong>
        </div>
        <div>
          <span
            >Tanggal:&nbsp;<strong>{{ tanggalDisplay }}</strong></span
          >
        </div>
      </div>

      <!-- ── TANDA TANGAN DI A4 ── -->
      <div class="a4-sig-section">
        <div class="a4-sig-inner">
          <div class="a4-sig-cards">
            <div class="a4-sig-row">
              <div v-for="signer in viewSignersWithAuth" :key="signer.id" class="a4-sig-box">
                <!-- Foto -->
                <div class="a4-sig-photo">
                  <img v-if="signer.photoData" :src="signer.photoData" class="a4-sig-photo-img" />
                  <div v-else class="a4-sig-photo-empty">
                    <i class="pi pi-user" style="font-size: 1.5rem; opacity: 0.3"></i>
                  </div>
                </div>
                <!-- Tanda tangan -->
                <div class="a4-sig-canvas-wrap" :class="{ 'has-signature': signer.signatureData }">
                  <img
                    v-if="signer.signatureData"
                    :src="signer.signatureData"
                    class="a4-sig-canvas-img"
                  />
                  <div v-else class="a4-sig-canvas-empty"></div>
                </div>
                <!-- Nama & Peran -->
                <div class="a4-sig-line-name"></div>
                <div class="a4-sig-name">{{ signer.nama || '( ' + signer.hubungan + ' )' }}</div>
                <div class="a4-sig-role">{{ signer.hubungan }}</div>
              </div>
            </div>
          </div>

          <div class="a4-qr-block">
            <div class="a4-qr-title">Verifikasi TTE</div>

            <!-- QR code: tampil jika sudah diverifikasi (server atau sesi ini) -->
            <div v-if="isVerified" class="a4-qr-code">
              <QrcodeVue :value="qrCodeData" :size="120" level="H" render-as="svg" />
            </div>
            <div v-if="isVerified" class="a4-qr-info">
              <div class="a4-qr-label">
                <i class="pi pi-verified me-1" style="color: #16a34a"></i>Petugas Rumah Sakit
              </div>
              <div class="a4-qr-user">{{ verifName }}</div>
              <div class="a4-qr-time">{{ verifTime }}</div>
            </div>

            <!-- Tombol TTE hanya tampil jika belum diverifikasi -->
            <div v-if="!isVerified" class="a4-qr-actions">
              <Button
                label="TTE Petugas"
                icon="pi pi-sign-in"
                severity="info"
                size="small"
                @click="showTteDialog = true"
              />
            </div>
            <div v-if="!isVerified" class="a4-qr-pending">
              <i class="pi pi-clock me-1"></i>Menunggu verifikasi
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- /A4 Paper -->

    <!-- ── BANNER CONSENT SELESAI ── -->
    <div v-if="isAllSigned" class="consent-done-banner">
      <div class="consent-done-icon">
        <i class="pi pi-verified"></i>
      </div>
      <div class="consent-done-text">
        <p class="consent-done-title">General Consent Telah Selesai</p>
        <p class="consent-done-sub">
          Semua penandatangan telah menandatangani formulir ini. Dokumen tidak dapat diubah.
        </p>
      </div>
    </div>

    <!-- ── KONFIRMASI PERSETUJUAN ── -->
    <div v-if="!isAllSigned" ref="confirmSectionRef" class="confirm-section">
      <div class="confirm-title"><i class="pi pi-check-square me-2"></i>Konfirmasi Persetujuan</div>
      <div class="confirm-body">
        <div
          class="confirm-item"
          :class="{ 'confirm-item--checked': conf.mengerti }"
          @click="conf.mengerti = !conf.mengerti"
        >
          <Checkbox v-model="conf.mengerti" :binary="true" inputId="cf1" @click.stop />
          <label for="cf1">
            Saya telah <strong>mengerti dan memahami</strong> seluruh penjelasan yang diberikan
            mengenai rencana perawatan rawat inap
          </label>
        </div>
        <div
          class="confirm-item"
          :class="{ 'confirm-item--checked': conf.bertanya }"
          @click="conf.bertanya = !conf.bertanya"
        >
          <Checkbox v-model="conf.bertanya" :binary="true" inputId="cf2" @click.stop />
          <label for="cf2">
            Saya telah diberikan <strong>kesempatan untuk bertanya</strong> dan seluruh pertanyaan
            saya telah dijawab dengan memuaskan
          </label>
        </div>
        <div
          class="confirm-item"
          :class="{ 'confirm-item--checked': conf.setuju }"
          @click="conf.setuju = !conf.setuju"
        >
          <Checkbox v-model="conf.setuju" :binary="true" inputId="cf3" @click.stop />
          <label for="cf3">
            Saya <strong>menyetujui</strong> untuk menjalani perawatan rawat inap di rumah sakit ini
            dengan segala prosedur yang telah dijelaskan
          </label>
        </div>

        <div class="confirm-status" :class="allConfirmed ? 'status-ok' : 'status-pending'">
          <i :class="allConfirmed ? 'pi pi-verified' : 'pi pi-info-circle'" class="me-1"></i>
          {{
            allConfirmed
              ? 'Semua konfirmasi telah disetujui'
              : 'Harap centang semua pernyataan di atas sebelum menandatangani'
          }}
        </div>
      </div>
    </div>

    <!-- ── BAGIAN TANDA TANGAN (selalu tampil; view-only jika isAllSigned) ── -->
    <div class="signature-section-wrapper">
      <div class="sig-section-label" :class="{ 'sig-section-label--done': isAllSigned }">
        <i :class="isAllSigned ? 'pi pi-verified me-2' : 'pi pi-pen-to-square me-2'"></i>
        FOTO &amp; TANDA TANGAN PENANDATANGAN
        <span v-if="!isAllSigned" class="sig-section-hint">
          Klik area tanda tangan → layar penuh · Klik kamera → ambil foto
        </span>
        <span v-else class="sig-section-hint">Dokumen telah ditandatangani — hanya tampilan</span>
      </div>
      <InformedConsentBase
        ref="baseRef"
        :signer-only="true"
        apiEndpoint="/index.php/api/triaseigd/upload_consent_assets"
        :extraForm="extraForm"
        :confirmations="conf"
        :defaultSigners="defaultSigners"
        :initialAssets="consentAssets"
        @patient-loaded="handlePatientLoaded"
        @saved="onConsentSaved"
      />
    </div>

    <!-- ── TOMBOL SIMPAN DI BAWAH ── -->
    <div v-if="!isAllSigned" class="bottom-action-bar">
      <span v-if="!allConfirmed" class="save-block-hint">
        <i class="pi pi-lock me-1"></i>Centang semua konfirmasi untuk mengaktifkan simpan
      </span>
      <Button
        label="Simpan Consent"
        icon="pi pi-save"
        severity="success"
        :loading="saving"
        :disabled="!allConfirmed"
        @click="baseRef?.simpanData()"
      />
    </div>

    <ttdUser
      v-model:showFormOtorisasi="showTteDialog"
      :noregister="route.params.noreg || route.query.noreg"
      :mode="tteMode"
      link_ttd="ttd_petugas_general_consent"
      @otpVerified="handleTTEVerified"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import InformedConsentBase from '@/components/InformedConsentBase.vue'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import QrcodeVue from 'qrcode.vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const configStore = useConfigStore()
const authStore = useAuthStore()
const route = useRoute()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

// ─── State ────────────────────────────────────────────────────────────────────

const consentHtml = ref('')
const consentAssets = ref(null)
const baseRef = ref(null)
const confirmSectionRef = ref(null)
const patientData = ref(null)
const saving = ref(false)
const conf = reactive({ mengerti: false, bertanya: false, setuju: false })
const allConfirmed = computed(() => conf.mengerti && conf.bertanya && conf.setuju)

const showTteDialog = ref(false)
const tte = reactive({ signed: false, username: '', nama: '', timestamp: '' })
const tteMode = ref(8)

// Ambil data auth dari consentAssets (signer pertama yang is_auth=1)
const serverAuth = computed(() => {
  const s = (consentAssets.value?.signers || []).find((a) => a.is_auth === '1' || a.is_auth === 1)
  return s ?? null
})

// Gabungan: sudah diverifikasi jika dari server ATAU dari TTE sesi ini
const isVerified = computed(() => tte.signed || !!serverAuth.value)

// Semua penandatangan sudah punya is_auth = 1 → mode preview-only
const isAllSigned = computed(() => {
  const list = consentAssets.value?.signers || []
  return list.length > 0 && list.every((s) => s.is_auth === '1' || s.is_auth === 1)
})

// Nama & waktu verifikasi: prioritaskan TTE sesi ini, fallback ke server
const verifName = computed(() => tte.nama || serverAuth.value?.verif_name || '')
const verifTime = computed(() => tte.timestamp || serverAuth.value?.verif_times || '')

const qrCodeData = computed(() =>
  JSON.stringify({
    dokumen: 'Consent Rawat Inap',
    noregister: route.params.noreg || route.query.noreg || '',
    petugas: {
      nama: verifName.value,
      nip: tte.username || serverAuth.value?.verif_by || '',
      waktu: verifTime.value,
    },
    is_auth: isVerified.value,
  }),
)

const handleTTEVerified = ({ username, verified }) => {
  console.log('[RanapConsent] TTE verification result:', { username, verified })
  if (!verified) return
  tte.signed = true
  tte.username = username
  tte.nama = username
  tte.timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// ─── Computed ─────────────────────────────────────────────────────────────────

// Baca signers dari base component (exposed via defineExpose)
const viewSigners = computed(() => baseRef.value?.signers || [])

// Gabungkan viewSigners dengan data auth dari consentAssets
const viewSignersWithAuth = computed(() => {
  const assets = consentAssets.value?.signers || []
  return viewSigners.value.map((s) => {
    const asset = assets.find((a) => a.hubungan === s.hubungan) || {}
    return {
      ...s,
      verif_name: asset.verif_name || null,
      is_auth: asset.is_auth === '1' || asset.is_auth === 1,
      verif_times: asset.verif_times || null,
    }
  })
})

// Format tanggal persetujuan
const tanggalDisplay = computed(() => {
  const d = extraForm.tanggalMasuk
  if (!d) return '________________________________'
  return new Date(d).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// ─── Form ─────────────────────────────────────────────────────────────────────

const extraForm = reactive({
  dpjp: '',
  diagnosa: '',
  caraBayar: '',
  tanggalMasuk: new Date(),
  tempat: '',
})

// ─── Default Signers ──────────────────────────────────────────────────────────

const defaultSigners = [
  { hubungan: 'Pasien Sendiri', nama: '' },
  { hubungan: 'Keluarga / Wali', nama: '' },
  { hubungan: 'Perawat', nama: '' },
]

// ─── Setelah consent berhasil disimpan: scroll ke konfirmasi & tanda tangan ────

const onConsentSaved = () => {
  confirmSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ─── Handle Patient Loaded (emit dari base) ────────────────────────────────────

const handlePatientLoaded = (d) => {
  patientData.value = d
  const diagnosaTeks = d.DX_CAPTION
    ? String(d.DIAGNOSA_AWAL || '') + ' - ' + d.DX_CAPTION
    : d.DIAGNOSA_AWAL || ''

  extraForm.dpjp = d.NAMADOKTER || ''
  extraForm.diagnosa = diagnosaTeks
  extraForm.caraBayar = d.CARABAYAR || ''
  extraForm.tanggalMasuk = d.MASUKPOLY ? new Date(d.MASUKPOLY) : new Date()
}

// ─── Fetch Teks General Consent dari Database ──────────────────────────────────

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
  } catch (err) {
    console.error('[RanapConsent] fetchConsentText error:', err)
  }
}

const fetchConsentAssets = async () => {
  try {
    const noregister = route.params.noreg

    const { data } = await axios.post(
      configStore.apiBaseUrl + '/index.php/api/triaseigd/get_consent_assets/',
      { id_client: id_client.value, noregister: noregister },
    )

    if (data.metadata?.code === '200') {
      consentAssets.value = data.response
    } else {
      console.warn('[RanapConsent] fetchConsentAssets warning:', data)
    }
  } catch (err) {
    console.error('[RanapConsent] fetchConsentAssets error:', err)
  }
}

onMounted(() => {
  fetchConsentText()
  fetchConsentAssets()
})
</script>

<style scoped>
/* ====== Document Viewer ====== */
.doc-viewer {
  min-height: 100vh;
  background: #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 3rem;
}

/* ====== Toolbar ====== */
.doc-toolbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.5rem;
  background: #1e293b;
  color: #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  gap: 1rem;
}
.toolbar-brand {
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 700;
}
.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

/* ====== A4 Paper ====== */
.a4-paper {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.1);
  margin: 1.5rem auto 0;
  padding: 18mm 20mm 20mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #111;
  position: relative;
}

/* ====== Kop Surat ====== */
.doc-kop {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.doc-kop-logo {
  flex-shrink: 0;
}
.doc-kop-rs {
  font-size: 16pt;
  font-weight: 900;
  text-transform: uppercase;
  color: #1e3a8a;
}
.doc-kop-alamat {
  font-size: 9pt;
  color: #555;
}
.doc-kop-line {
  border-top: 3px double #1e3a8a;
  margin-bottom: 0.75rem;
}

/* ====== Judul ====== */
.doc-title-block {
  text-align: center;
  margin-bottom: 0.85rem;
}
.doc-title {
  font-size: 13pt;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 0.1rem;
  letter-spacing: 0.03em;
}
.doc-subtitle {
  font-size: 11pt;
  font-weight: 700;
  margin: 0;
  text-decoration: underline;
}

/* ====== Identitas Pasien ====== */
.doc-patient-box {
  border: 1px solid #aaa;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: #fafafa;
}
.doc-patient-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}
.doc-patient-field {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
}
.dpf-label {
  font-size: 7.5pt;
  font-weight: 700;
  text-transform: uppercase;
  color: #555;
  letter-spacing: 0.04em;
}
.dpf-value {
  font-size: 10pt;
  font-weight: 600;
  color: #111;
  border-bottom: 1px dotted #bbb;
  padding-bottom: 1px;
}
.dpf-name {
  font-size: 12pt;
  font-weight: 900;
}
.dpf-mono {
  font-family: 'Courier New', monospace;
  font-size: 10pt;
}
.doc-patient-loading {
  font-size: 9pt;
  color: #888;
  padding: 0.5rem 0;
  text-align: center;
}

/* ====== Section Line ====== */
.doc-section-line {
  border-top: 1px solid #bbb;
  margin: 0.75rem 0;
}

/* ====== Body ====== */
.doc-body {
  font-size: 10.5pt;
  line-height: 1.65;
  text-align: justify;
}
.doc-body-intro {
  margin-bottom: 0.6rem;
}
.doc-body-sub {
  font-weight: 700;
  margin-bottom: 0.35rem;
}
.doc-list {
  padding-left: 1.5rem;
  margin: 0 0 0.75rem;
}
.doc-list li {
  margin-bottom: 0.2rem;
}
.doc-statement {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid #1e3a8a;
  background: #f0f4ff;
  font-style: italic;
  font-size: 10pt;
}

/* HTML dari database */
.doc-consent-html {
  font-size: 10.5pt;
  line-height: 1.65;
  text-align: justify;
}
.doc-consent-html h4 {
  font-size: 11pt;
  font-weight: 700;
  margin: 0.6rem 0 0.2rem;
}
.doc-consent-html p {
  margin-bottom: 0.4rem;
}

/* ====== Tanggal ====== */
.doc-date-row {
  display: flex;
  justify-content: space-between;
  font-size: 10pt;
  margin: 0.5rem 0 1.5rem;
}

/* ====== Signature Section ====== */
.signature-section-wrapper {
  width: 210mm;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  margin: 1rem auto 2rem;
  border-radius: 4px;
  overflow: hidden;
}
.sig-section-label {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.sig-section-hint {
  font-size: 0.72rem;
  font-weight: 400;
  opacity: 0.7;
}
.sig-section-label--done {
  background: linear-gradient(135deg, #14532d 0%, #16a34a 100%);
}

.tte-sign-area {
  width: 210mm;
  margin: 0 auto 1rem;
  padding: 1rem 1.2rem;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}
.tte-sign-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.tte-sign-hint {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #475569;
}
.tte-not-signed {
  padding: 0.85rem 1rem;
  border: 1px dashed #fbbf24;
  color: #92400e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tte-signed-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #c7d2fe;
}
.tte-signed-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 1rem;
}
.tte-signed-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #475569;
  letter-spacing: 0.04em;
}
.tte-signed-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}
.qr-code-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}
.qr-code-caption {
  font-size: 0.78rem;
  color: #475569;
  text-align: center;
}

/* signer-only prop menangani visibilitas — tidak perlu override CSS */

/* ====== Print ====== */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm 15mm 15mm 15mm;
  }

  /* Reset body & layout AdminLTE */
  html,
  body {
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    overflow: visible !important;
  }

  /* Sembunyikan sidebar, navbar, dan semua elemen non-dokumen */
  .main-sidebar,
  .main-header,
  .content-header,
  .main-footer,
  .doc-toolbar,
  .confirm-section,
  .signature-section-wrapper,
  .bottom-action-bar,
  .tte-sign-area,
  .p-dialog,
  .p-dialog-mask,
  .p-toast,
  .p-overlay {
    display: none !important;
  }

  /* Hilangkan margin sidebar pada content-wrapper */
  .content-wrapper,
  .wrapper,
  #app {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    width: 100% !important;
    float: none !important;
  }

  /* Wrapper doc-viewer */
  .doc-viewer {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }

  /* A4 paper: full width, tanpa dekorasi, padding sesuai @page margin */
  .a4-paper {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    font-size: 10pt !important;
    page-break-inside: avoid;
  }

  /* Paksa warna & gambar tercetak */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Tanda tangan & foto */
  .a4-sig-canvas-img,
  .a4-sig-photo-img {
    display: block !important;
  }

  /* Input inline (kota) tampil sebagai teks biasa */
  .doc-input-inline {
    border: none !important;
    border-bottom: 1px solid #444 !important;
    outline: none !important;
    background: transparent !important;
  }
}

/* ====== Tempat & Tanggal di A4 ====== */
.doc-date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10pt;
  margin: 0.5rem 0 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.doc-place-field {
  display: flex;
  align-items: center;
}
.doc-input-inline {
  border: none;
  border-bottom: 1px solid #444;
  outline: none;
  font-family: 'Times New Roman', serif;
  font-size: 10pt;
  width: 160px;
  padding: 1px 4px;
  background: transparent;
}
.doc-input-inline:focus {
  border-bottom-color: #1d4ed8;
}

/* ====== Signature Boxes di A4 ====== */
.a4-sig-section {
  margin-top: 0.5rem;
}
.a4-sig-inner {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 1rem 0.5rem 0.5rem;
}
.a4-sig-cards {
  flex: 1 1 0;
}
.a4-qr-block {
  flex: 0 0 170px;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  padding: 0.85rem;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.a4-qr-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e40af;
  text-align: center;
}
.a4-qr-code {
  width: 140px;
  height: 140px;
}
.a4-qr-info {
  text-align: center;
  font-size: 0.72rem;
  color: #334155;
}
.a4-qr-label {
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.a4-qr-user,
.a4-qr-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.a4-qr-actions {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 0.6rem;
}
.a4-qr-pending {
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: center;
  margin-top: 0.5rem;
}
.a4-sig-row {
  display: flex;
  gap: 0.5rem;
  justify-content: space-around;
}
.a4-sig-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 120px;
}

.a4-sig-photo {
  width: 80px;
  height: 80px;
  border: 1px solid #aaa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  margin-bottom: 4px;
}
.a4-sig-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.a4-sig-photo-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ccc;
}

.a4-sig-canvas-wrap {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 2px;
  transition: height 0.2s ease;
}
.a4-sig-canvas-wrap.has-signature {
  height: 100px;
}
.a4-sig-canvas-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.a4-sig-canvas-empty {
  width: 100%;
  height: 2px;
  background: #444;
  align-self: flex-end;
}

.a4-sig-line-name {
  width: 100%;
  border-top: 2px solid #444;
  margin-bottom: 2px;
}
.a4-sig-name {
  font-size: 9pt;
  text-align: center;
  font-weight: 700;
  word-break: break-word;
}
.a4-sig-role {
  font-size: 10pt;
  text-align: center;
  color: #555;
}
.a4-sig-auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin-top: 4px;
  padding: 3px 6px;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 4px;
  width: 100%;
}
.a4-sig-auth .pi-verified {
  color: #16a34a;
  font-size: 9pt;
}
.a4-sig-auth-name {
  font-size: 7.5pt;
  font-weight: 700;
  color: #15803d;
  text-align: center;
  word-break: break-word;
}
.a4-sig-auth-time {
  font-size: 6.5pt;
  color: #166534;
  text-align: center;
}

/* ====== Consent Done Banner ====== */
.consent-done-banner {
  width: 210mm;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1.5px solid #86efac;
  border-left: 5px solid #16a34a;
  border-radius: 0 8px 8px 0;
  margin: 1rem auto 0;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.1);
}
.consent-done-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}
.consent-done-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #14532d;
  margin: 0 0 0.15rem;
}
.consent-done-sub {
  font-size: 0.78rem;
  color: #15803d;
  margin: 0;
  line-height: 1.4;
}

/* ====== Bottom Action Bar ====== */
.save-block-hint {
  font-size: 0.78rem;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
}

.bottom-action-bar {
  width: 210mm;
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 1rem;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  border-radius: 0 0 4px 4px;
}

/* ====== Konfirmasi Section ====== */
.confirm-section {
  width: 210mm;
  background: #fff;
  border-left: 4px solid #2563a8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 1rem auto 0;
  border-radius: 0 6px 6px 0;
  overflow: hidden;
}
.confirm-title {
  padding: 0.6rem 1rem;
  background: #2563a8;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.confirm-body {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.confirm-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.83rem;
  color: #374151;
}
.confirm-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.confirm-item--checked {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.confirm-item label {
  cursor: pointer;
  flex: 1;
  line-height: 1.4;
}

.confirm-status {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 0.25rem;
}
.status-ok {
  background: #dcfce7;
  color: #15803d;
}
.status-pending {
  background: #fef3c7;
  color: #92400e;
}

@page {
  size: A4;
  margin: 0;
}
</style>
