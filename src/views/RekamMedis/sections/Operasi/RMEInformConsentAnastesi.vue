<template>
  <div class="rme-section">
    <div class="rme-section-title ica-title">
      <i class="pi pi-file-check"></i> INFORMED CONSENT TINDAKAN ANESTESI
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.
    </div>
    <div v-else-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data informed consent anestesi...
    </div>
    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>
    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data informed consent anestesi untuk kunjungan
      ini.
    </div>

    <div v-else>
      <!-- IDENTITAS PENANDATANGAN -->
      <div class="ica-block">
        <div class="ica-block-hdr">IDENTITAS PENANDATANGAN</div>
        <div class="ica-row">
          <span class="ica-lbl">Nama Penandatangan</span>
          <span class="ica-sep">:</span>
          <span class="ica-val">{{ header.nama_penandatangan || '-' }}</span>
        </div>
        <div class="ica-row">
          <span class="ica-lbl">Hubungan dengan Pasien</span>
          <span class="ica-sep">:</span>
          <span class="ica-val">{{ header.hubungan || '-' }}</span>
        </div>
        <div class="ica-row">
          <span class="ica-lbl">No. KTP / Identitas</span>
          <span class="ica-sep">:</span>
          <span class="ica-val">{{ header.no_ktp || '-' }}</span>
        </div>
        <div class="ica-row">
          <span class="ica-lbl">Dokter Anestesi</span>
          <span class="ica-sep">:</span>
          <span class="ica-val ica-val-strong">{{ header.dokter_anestesi || '-' }}</span>
        </div>
      </div>

      <!-- ISI PERSETUJUAN -->
      <div class="ica-block">
        <div class="ica-block-hdr">ISI PERSETUJUAN</div>
        <div class="ica-consent-body">
          <p class="ica-consent-p">
            Menyatakan dengan sesungguhnya bahwa saya telah mendapatkan penjelasan yang jelas dan
            lengkap dari <strong>{{ header.dokter_anestesi || 'Dokter Anestesi' }}</strong>
            mengenai tindakan anestesi yang akan dilakukan, meliputi:
          </p>
          <ol class="ica-consent-list">
            <li>Diagnosis penyakit yang memerlukan tindakan pembedahan dan pembiusan</li>
            <li>Jenis tindakan anestesi yang akan dilakukan beserta tujuannya</li>
            <li>Tata cara pelaksanaan tindakan anestesi</li>
            <li>
              Risiko dan komplikasi yang mungkin terjadi selama atau setelah tindakan:
              <ul class="ica-risk-list">
                <li>Reaksi alergi terhadap obat anestesi</li>
                <li>Gangguan jalan napas (airway complications)</li>
                <li>Penurunan tekanan darah (hipotensi)</li>
                <li>Mual, muntah, sakit kepala pasca anestesi</li>
                <li>Dalam kondisi tertentu, risiko yang mengancam jiwa</li>
              </ul>
            </li>
            <li>Alternatif tindakan anestesi yang tersedia</li>
            <li>Prognosis dan perkiraan pemulihan pasca anestesi</li>
          </ol>
        </div>
      </div>

      <!-- KONFIRMASI -->
      <div class="ica-block">
        <div class="ica-block-hdr">KONFIRMASI PERSETUJUAN</div>
        <div class="ica-conf-list">
          <div class="ica-conf-item" :class="{ 'ica-conf-checked': header.conf_mengerti == 1 }">
            <span class="ica-conf-chk">{{ header.conf_mengerti == 1 ? '✓' : '✗' }}</span>
            <span>Saya telah mengerti dan memahami seluruh penjelasan yang diberikan</span>
          </div>
          <div class="ica-conf-item" :class="{ 'ica-conf-checked': header.conf_bertanya == 1 }">
            <span class="ica-conf-chk">{{ header.conf_bertanya == 1 ? '✓' : '✗' }}</span>
            <span
              >Saya telah diberikan kesempatan untuk bertanya dan pertanyaan saya telah dijawab
              dengan memuaskan</span
            >
          </div>
          <div class="ica-conf-item" :class="{ 'ica-conf-checked': header.conf_setuju == 1 }">
            <span class="ica-conf-chk">{{ header.conf_setuju == 1 ? '✓' : '✗' }}</span>
            <span
              ><strong>Saya menyetujui</strong> dilakukannya tindakan anestesi dengan segala
              risikonya yang telah dijelaskan</span
            >
          </div>
        </div>
      </div>

      <!-- TEMPAT & TANGGAL -->
      <div class="ica-block">
        <div class="ica-block-hdr">WAKTU &amp; TEMPAT PERSETUJUAN</div>
        <div class="ica-row">
          <span class="ica-lbl">Tempat</span>
          <span class="ica-sep">:</span>
          <span class="ica-val">{{ header.tempat || '-' }}</span>
        </div>
        <div class="ica-row">
          <span class="ica-lbl">Tanggal &amp; Waktu</span>
          <span class="ica-sep">:</span>
          <span class="ica-val ica-val-strong">{{ formatTanggal(header.tanggal_consent) }}</span>
        </div>
      </div>

      <!-- TANDA TANGAN PENANDATANGAN -->
      <div class="ica-block" v-if="signers.length">
        <div class="ica-block-hdr">TANDA TANGAN</div>
        <div class="ica-signers-grid">
          <div v-for="signer in signers" :key="signer.id" class="ica-signer-card">
            <!-- Foto -->
            <div class="ica-photo-wrap">
              <img
                v-if="signer.photo_url"
                :src="fullUrl(signer.photo_url)"
                class="ica-photo-img"
                alt="Foto penandatangan"
              />
              <div v-else class="ica-photo-empty">
                <i class="pi pi-user"></i>
              </div>
            </div>

            <!-- Tanda Tangan -->
            <div class="ica-sig-wrap">
              <img
                v-if="signer.signature_url"
                :src="fullUrl(signer.signature_url)"
                class="ica-sig-img"
                alt="Tanda tangan"
              />
              <div v-else class="ica-sig-empty">
                <i class="pi pi-pen-to-square"></i>
                <span>Belum ada tanda tangan</span>
              </div>
            </div>

            <!-- Label & Nama -->
            <div class="ica-signer-label">{{ signer.label || 'Penandatangan' }}</div>
            <div class="ica-signer-nama">{{ signer.nama || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- METADATA -->
      <div class="ica-meta">
        <span v-if="header.created_at">Dibuat: {{ header.created_at }}</span>
        <span v-if="header.updated_at" class="ica-meta-sep">|</span>
        <span v-if="header.updated_at">Diperbarui: {{ header.updated_at }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})
const kodebookingOperasi = inject('kodebookingOperasi', ref(null))
const noregisterOperasi = inject('noregisterOperasi', ref(''))

const loading = ref(false)
const error = ref(null)
const header = ref({})
const signers = ref([])

const hasData = computed(() => !!header.value?.nama_penandatangan)

const fullUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${configStore.apiBaseUrl}/${path}`
}

const formatTanggal = (val) => {
  if (!val) return '-'
  try {
    return new Date(val).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return val
  }
}

const fetchData = async () => {
  const noreg = noregisterOperasi.value || props.noreg
  if (!noreg) return

  loading.value = true
  error.value = null
  header.value = {}
  signers.value = []

  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/inform_consent/get_inform_consent_anestesi`,
      { noregister: noreg, id_client: id_client.value },
    )
    const meta = res.data?.metadata
    if (meta?.code === 200) {
      header.value = res.data.response?.header || {}
      signers.value = res.data.response?.signers || []
    }
  } catch (e) {
    error.value = 'Gagal memuat data informed consent: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('inform-consent-anestesi', hasData.value)
  }
}

watch(
  kodebookingOperasi,
  (val) => {
    if (val) fetchData()
    else reportSectionData('inform-consent-anestesi', false)
  },
  { immediate: true },
)
</script>

<style scoped>
/* ── Section title ─────────────────────────────────────────── */
.ica-title {
  background: linear-gradient(90deg, #f0fdf4, #dcfce7);
  border-left-color: #2d6a4f;
}
.ica-title i {
  color: #2d6a4f;
}

/* ── Block container ───────────────────────────────────────── */
.ica-block {
  border: 1px solid #d1d5db;
  border-radius: 5px;
  margin-bottom: 0.6rem;
  overflow: hidden;
}
.ica-block-hdr {
  background: linear-gradient(90deg, #f8fafc, #fff);
  border-bottom: 1px solid #d1d5db;
  border-left: 3px solid #2d6a4f;
  padding: 0.28rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ── Data rows ─────────────────────────────────────────────── */
.ica-row {
  display: flex;
  align-items: baseline;
  padding: 0.22rem 0.65rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.79rem;
}
.ica-row:last-child {
  border-bottom: none;
}
.ica-lbl {
  width: 160px;
  min-width: 160px;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.77rem;
}
.ica-sep {
  width: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}
.ica-val {
  flex: 1;
  color: #111827;
}
.ica-val-strong {
  font-weight: 600;
}

/* ── Consent body ──────────────────────────────────────────── */
.ica-consent-body {
  padding: 0.6rem 0.8rem;
  font-size: 0.79rem;
  color: #1f2937;
  line-height: 1.7;
}
.ica-consent-p {
  margin: 0 0 0.4rem;
}
.ica-consent-list {
  padding-left: 1.2rem;
  margin: 0.3rem 0;
}
.ica-consent-list > li {
  margin-bottom: 0.25rem;
}
.ica-risk-list {
  padding-left: 1rem;
  margin-top: 0.2rem;
  list-style: disc;
}
.ica-risk-list li {
  font-size: 0.75rem;
  color: #dc2626;
  margin-bottom: 0.1rem;
}

/* ── Konfirmasi ────────────────────────────────────────────── */
.ica-conf-list {
  padding: 0.4rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.ica-conf-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  font-size: 0.78rem;
  color: #374151;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.ica-conf-item.ica-conf-checked {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #14532d;
}
.ica-conf-chk {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 800;
  background: #fecaca;
  color: #dc2626;
}
.ica-conf-item.ica-conf-checked .ica-conf-chk {
  background: #86efac;
  color: #14532d;
}

/* ── Signers grid ──────────────────────────────────────────── */
.ica-signers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  padding: 0.65rem;
}
.ica-signer-card {
  border: 1px solid #d1d5db;
  border-radius: 5px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* Photo */
.ica-photo-wrap {
  height: 90px;
  background: #1e293b;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ica-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ica-photo-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #64748b;
  font-size: 1.8rem;
  opacity: 0.4;
}

/* Signature */
.ica-sig-wrap {
  flex: 1;
  min-height: 90px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  overflow: hidden;
}
.ica-sig-img {
  width: 100%;
  height: 90px;
  object-fit: contain;
  padding: 6px;
}
.ica-sig-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #9ca3af;
  font-size: 0.68rem;
  text-align: center;
  padding: 0.5rem;
}
.ica-sig-empty i {
  font-size: 1.3rem;
}

/* Label & Nama */
.ica-signer-label {
  text-align: center;
  font-size: 0.71rem;
  font-weight: 700;
  color: #374151;
  padding: 0.3rem 0.4rem 0.1rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.ica-signer-nama {
  text-align: center;
  font-size: 0.72rem;
  color: #6b7280;
  padding: 0 0.4rem 0.3rem;
  font-style: italic;
}

/* ── Metadata ──────────────────────────────────────────────── */
.ica-meta {
  font-size: 0.7rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.25rem;
}
.ica-meta-sep {
  margin: 0 0.35rem;
}
</style>
