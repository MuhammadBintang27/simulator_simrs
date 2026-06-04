<template>
  <div class="rj-wrap">
    <!-- ── JUDUL ──────────────────────────────────────────────────────────── -->
    <div class="rj-title-row">
      <div class="rj-title-text">
        <span class="rj-title">Resume Medis</span>
        <span class="rj-subtitle">Rawat Jalan</span>
      </div>
      <img v-if="LINK_LOGO" :src="LINK_LOGO" class="rj-logo" alt="logo" />
    </div>
    <div class="rj-title-divider"></div>

    <!-- ── LOADING / ERROR ───────────────────────────────────────────────── -->
    <div v-if="loading" class="rme-loading-row" style="margin-top: 12px">
      <span class="rme-loading-dot"></span> Memuat data resume rawat jalan...
    </div>
    <div v-else-if="error" class="rme-empty-note" style="margin-top: 12px">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>
    <div v-else-if="!hasData" class="rme-empty-note" style="margin-top: 12px">
      <i class="pi pi-minus-circle"></i> Belum ada data asesmen rawat jalan untuk kunjungan ini.
    </div>

    <div v-else class="rj-body">
      <!-- ══ ANAMNESIS ════════════════════════════════════════════════════ -->
      <div class="rj-section-hdr">ANAMNESIS</div>
      <div class="rj-content-pad">
        <span v-if="anamnesis">{{ anamnesis }}</span>
        <span v-else class="rj-empty">—</span>
      </div>

      <!-- ══ PEMERIKSAAN FISIK ═════════════════════════════════════════════ -->
      <div class="rj-section-hdr" style="margin-top: 10px">PEMERIKSAAN FISIK</div>
      <div class="rj-content-pad rj-fisik-grid">
        <div class="rj-fisik-row">
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">Tensi</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.tensi || '—' }}</span>
            <span class="rj-fisik-unit">mmHg</span>
          </span>
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">SpO2</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.sp2o || '—' }}</span>
          </span>
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">Respirasi/Menit</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.respirasi_perm || '—' }}</span>
          </span>
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">BB</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.berat_badan || '—' }}</span>
            <span class="rj-fisik-unit">Kg</span>
          </span>
        </div>
        <div class="rj-fisik-row">
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">Suhu</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.suhu || '—' }}</span>
            <span class="rj-fisik-unit">°C</span>
          </span>
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">GCS(E,V,M)</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.cgs || '—' }}</span>
          </span>
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">Nadi/Menit</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.nadi_permenit || '—' }}</span>
          </span>
          <span class="rj-fisik-item">
            <span class="rj-fisik-lbl">TB</span>
            <span class="rj-fisik-sep">:</span>
            <span class="rj-fisik-val">{{ data.tinggi_badan || '—' }}</span>
            <span class="rj-fisik-unit">Cm</span>
          </span>
        </div>

        <!-- BMI -->
        <div v-if="bmi" class="rj-bmi-row">
          <span class="rj-fisik-lbl">BMI</span>
          <span class="rj-fisik-sep">:</span>
          <span class="rj-bmi-val" :style="{ color: bmiInfo.color }">{{ bmi }} kg/m²</span>
          <span class="rj-bmi-tag" :style="{ background: bmiInfo.color }">{{ bmiInfo.label }}</span>
        </div>
      </div>

      <!-- ══ PEMERIKSAAN PENUNJANG ═════════════════════════════════════════ -->
      <div class="rj-section-hdr" style="margin-top: 10px">PEMERIKSAAN PENUNJANG</div>
      <div class="rj-content-pad">
        <span v-if="data.penunjang || data.objek">{{ data.penunjang || data.objek }}</span>
        <span v-else class="rj-empty">—</span>
      </div>

      <!-- ══ DIAGNOSA | ICD ════════════════════════════════════════════════ -->
      <div class="rj-split-table" style="margin-top: 10px">
        <!-- kiri: diagnosa asesmen -->
        <div class="rj-split-col rj-split-left">
          <div class="rj-section-hdr rj-hdr-no-radius-right">DIAGNOSA</div>
          <div class="rj-content-pad rj-split-content">
            <span v-if="data.asesmen" style="white-space: pre-wrap">{{ data.asesmen }}</span>
            <span v-else class="rj-empty">—</span>
          </div>
        </div>
        <!-- kanan: ICD -->
        <div class="rj-split-col rj-split-right">
          <div class="rj-section-hdr rj-hdr-no-radius-left">ICD 9/10</div>
          <div class="rj-content-pad rj-split-content">
            <div class="rj-icd-row">
              <span class="rj-icd-lbl">Diagnosa</span>
              <div class="rj-icd-val">
                <div v-for="(dx, i) in listDiagnosa" :key="i" class="rj-icd-item">
                  {{ dx.kode }}-{{ dx.nama }} ({{ dx.prioritas }})
                </div>
                <span v-if="listDiagnosa.length === 0" class="rj-empty">—</span>
              </div>
            </div>
            <div class="rj-icd-divider"></div>
            <div class="rj-icd-row">
              <span class="rj-icd-lbl">Procedure</span>
              <div class="rj-icd-val">
                <span v-if="data.procedure" style="white-space: pre-wrap">{{
                  data.procedure
                }}</span>
                <span v-else class="rj-empty">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TERAPHY | TINDAKAN ════════════════════════════════════════════ -->
      <div class="rj-split-table" style="margin-top: 0; border-top: none">
        <!-- kiri: obat -->
        <div class="rj-split-col rj-split-left">
          <div class="rj-section-hdr rj-hdr-no-radius-right">TERAPHY / OBAT YANG DIBERIKAN</div>
          <div class="rj-content-pad rj-split-content">
            <div v-if="listObat.length > 0">
              <div v-for="(obat, i) in listObat" :key="i" class="rj-obat-item">
                {{ obat.nama }}
                <span v-if="obat.aturan" class="rj-obat-aturan"> — {{ obat.aturan }}</span>
              </div>
            </div>
            <span v-else class="rj-empty">—</span>
          </div>
        </div>
        <!-- kanan: tindakan -->
        <div class="rj-split-col rj-split-right">
          <div class="rj-section-hdr rj-hdr-no-radius-left">TINDAKAN</div>
          <div class="rj-content-pad rj-split-content">
            <div v-if="listTindakan.length > 0">
              <div v-for="(t, i) in listTindakan" :key="i" class="rj-tindakan-item">{{ t }}</div>
            </div>
            <span v-else class="rj-empty">—</span>
          </div>
        </div>
      </div>

      <!-- ══ RENCANA TINDAK LANJUT ═════════════════════════════════════════ -->
      <div class="rj-section-hdr" style="margin-top: 10px">RENCANA TINDAK LANJUT (PLAN)</div>
      <div class="rj-content-pad">
        <span v-if="data.plan" style="white-space: pre-wrap">{{ data.plan }}</span>
        <span v-else class="rj-empty">—</span>
      </div>

      <!-- ══ CATATAN DOKTER ════════════════════════════════════════════════ -->
      <div v-if="data.catatan_dokter">
        <div class="rj-section-hdr" style="margin-top: 10px">CATATAN DOKTER</div>
        <div class="rj-content-pad" style="white-space: pre-wrap">{{ data.catatan_dokter }}</div>
      </div>

      <!-- ══ FOOTER — TTD DOKTER ═══════════════════════════════════════════ -->
      <div class="rj-footer-divider"></div>
      <div class="rj-footer">
        <div class="rj-footer-inner">
          <div class="rj-footer-ttl">Dokter Penanggung Jawab Pasien</div>
          <div class="rj-qr-wrap">
            <QrcodeVue :value="noreg" :size="90" level="M" render-as="svg" />
          </div>
          <div class="rj-footer-line"></div>
          <div class="rj-footer-dokter">{{ dataPasien?.NAMADOKTER || '—' }}</div>
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
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, LINK_LOGO } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(true)
const error = ref(null)
const data = ref({})

const hasData = computed(() => !!data.value?.id)

const anamnesis = computed(() => {
  const parts = [data.value?.keluhan_utama, data.value?.subjek].filter(Boolean)
  return parts.join('\n') || ''
})

const bmiScale = [
  { range: '< 18.5',    label: 'Kurus',    color: '#64b5f6' },
  { range: '18.5–24.9', label: 'Normal',   color: '#66bb6a' },
  { range: '25.0–29.9', label: 'Gemuk',    color: '#ffa726' },
  { range: '≥ 30',      label: 'Obesitas', color: '#ef5350' },
]

const bmi = computed(() => {
  const bb = parseFloat(data.value?.berat_badan)
  const tb = parseFloat(data.value?.tinggi_badan)
  if (!bb || !tb || bb <= 0 || tb <= 0) return null
  return (bb / Math.pow(tb / 100, 2)).toFixed(1)
})

const bmiInfo = computed(() => {
  const v = parseFloat(bmi.value)
  if (isNaN(v)) return bmiScale[1]
  if (v < 18.5) return bmiScale[0]
  if (v < 25)   return bmiScale[1]
  if (v < 30)   return bmiScale[2]
  return bmiScale[3]
})

// Parse "Z09.8-Follow-up examination... (1) \r\n"
const listDiagnosa = computed(() => {
  const raw = data.value?.diagnosa || ''
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const match = s.match(/^([A-Z][0-9A-Z.]+)-(.+?)\((\d)\)\s*$/)
      if (match) return { kode: match[1], nama: match[2].trim(), prioritas: match[3] }
      return { kode: '', nama: s, prioritas: '0' }
    })
})

// Parse " Clopidogrel 75 mg @ 10.00 TABLET  1X1 SESUDAH MAKAN"
const listObat = computed(() => {
  const raw = data.value?.obat || ''
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const atIdx = s.indexOf('@')
      if (atIdx !== -1) {
        const nama = s.substring(0, atIdx).trim()
        const rest = s.substring(atIdx + 1).trim()
        const parts = rest.split(/\s{2,}/)
        return { nama, aturan: (parts[1] || '').trim() }
      }
      return { nama: s, aturan: '' }
    })
})

// Gabung tindakan_non_icd
const listTindakan = computed(() => {
  const raw = data.value?.tindakan_non_icd || ''
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
})


const fetchData = async () => {
  if (!props.noreg) return
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.get(
      `${url}index.php/api/transaksi_pasien/getdata_asesmen/${props.noreg}/${id_client.value}`,
    )
    data.value = res.data?.response ?? {}
  } catch (e) {
    error.value = 'Gagal memuat data asesmen rawat jalan: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    reportSectionData('resume-rajal', hasData.value)
  }
}

watch(
  () => props.noreg,
  (val) => {
    if (val) fetchData()
  },
  { immediate: true },
)
</script>

<style scoped>
/* ── Wrapper ────────────────────────────────────────────────────────── */
.rj-wrap {
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: #1a1a1a;
}

/* ── Judul ──────────────────────────────────────────────────────────── */
.rj-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 4px 0 6px;
}
.rj-title-text {
  display: flex;
  flex-direction: column;
}
.rj-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  font-variant: small-caps;
  letter-spacing: 1px;
  line-height: 1.1;
}
.rj-subtitle {
  font-size: 11px;
  color: #555;
  letter-spacing: 0.5px;
  margin-top: 1px;
}
.rj-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
}
.rj-title-divider {
  border: none;
  border-top: 2px solid #1a1a1a;
  margin-bottom: 10px;
}

/* ── Body ───────────────────────────────────────────────────────────── */
.rj-body {
  font-size: 12px;
}

/* ── Section header (teal) ──────────────────────────────────────────── */
.rj-section-hdr {
  background: #009688;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2px 5px;
  text-transform: uppercase;
}

/* ── Content padding ────────────────────────────────────────────────── */
.rj-content-pad {
  padding: 6px 10px 8px;
  font-size: 12px;
  color: #1a1a1a;
}

/* ── Pemeriksaan Fisik ──────────────────────────────────────────────── */
.rj-fisik-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 8px;
  padding-bottom: 8px;
}
.rj-fisik-row {
  display: flex;
  gap: 0;
}
.rj-fisik-item {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  flex: 1;
  font-size: 12px;
}
.rj-fisik-lbl {
  color: #1a1a1a;
  white-space: nowrap;
}
.rj-fisik-sep {
  color: #555;
  margin: 0 2px;
}
.rj-fisik-val {
  font-weight: 600;
  color: #1a1a1a;
  min-width: 28px;
}
.rj-fisik-unit {
  font-size: 11px;
  color: #555;
}

/* ── Split table (Diagnosa|ICD dan Terapi|Tindakan) ─────────────────── */
.rj-split-table {
  display: flex;
  border: 1px solid #b0bec5;
  border-top: none;
}
.rj-split-col {
  flex: 1;
  min-width: 0;
}
.rj-split-left {
  border-right: 1px solid #b0bec5;
}
.rj-split-content {
  min-height: 48px;
}

/* Hilangkan radius pada split header */
.rj-hdr-no-radius-right {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

/* ── ICD detail ─────────────────────────────────────────────────────── */
.rj-icd-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 12px;
  padding: 2px 0;
}
.rj-icd-lbl {
  width: 62px;
  flex-shrink: 0;
  color: #555;
}
.rj-icd-val {
  flex: 1;
}
.rj-icd-item {
  margin-bottom: 2px;
  line-height: 1.4;
}
.rj-icd-divider {
  border-top: 1px solid #e0e0e0;
  margin: 6px 0;
}

/* ── BMI ────────────────────────────────────────────────────────────── */
.rj-bmi-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 12px;
}
.rj-bmi-val {
  font-weight: 700;
}
.rj-bmi-tag {
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
}

/* ── Obat ───────────────────────────────────────────────────────────── */
.rj-obat-item {
  font-size: 12px;
  line-height: 1.5;
}
.rj-obat-aturan {
  color: #555;
  font-size: 11px;
}

/* ── Tindakan ───────────────────────────────────────────────────────── */
.rj-tindakan-item {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  text-transform: uppercase;
}

/* ── Footer TTD ─────────────────────────────────────────────────────── */
.rj-footer-divider {
  border: none;
  border-top: 1px solid #b0bec5;
  margin-top: 14px;
}
.rj-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 16px 4px;
}
.rj-footer-inner {
  text-align: center;
}
.rj-footer-ttl {
  font-size: 11px;
  color: #555;
  margin-bottom: 4px;
}
.rj-qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}
.rj-qr {
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  padding: 2px;
}
.rj-footer-line {
  width: 180px;
  border-top: 1px solid #333;
  margin: 4px auto 3px;
}
.rj-footer-dokter {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

/* ── Empty ──────────────────────────────────────────────────────────── */
.rj-empty {
  color: #adb5bd;
  font-style: italic;
  font-size: 11px;
}

/* ── Print ──────────────────────────────────────────────────────────── */
@media print {
  .rj-section-hdr {
    background: #009688 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
