<template>
  <div class="rme-section">
    <!-- ══════════════════════════════════════════════════════════
         JUDUL SECTION
    ══════════════════════════════════════════════════════════ -->
    <div
      class="rme-section-title kad-title-bar"
      style="
        background: linear-gradient(90deg, #f0f6fc 0%, #f7fbff 100%);
        border-left-color: #5c8fcc;
      "
    >
      <div class="kad-title-left">
        <i class="pi pi-clipboard" style="color: #5c8fcc"></i>
        KAJIAN AWAL MEDIS DOKTER (DPJP)
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         TAMPILAN READ-ONLY
    ══════════════════════════════════════════════════════════ -->

    <!-- ── Loading ── -->
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data kajian awal dokter...
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <!-- ── Tidak ada data ── -->
    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data kajian awal dokter untuk kunjungan ini.
    </div>

    <!-- ══════════ KONTEN READ-ONLY ══════════ -->
    <div v-else>
      <!-- ── Badge Verifikasi & Last Update ── -->
      <div class="kad-meta-row">
        <span v-if="data.telah_verif" class="rme-badge rme-badge-success kad-verif-badge">
          ✓ {{ data.telah_verif }}
        </span>
        <span v-else class="rme-badge rme-badge-warning">⏳ Belum Diotorisasi</span>
        <span v-if="data.last_update" class="kad-last-update">
          <!-- <i class="pi pi-clock"></i> Diperbarui: {{ data.last_update }} -->
        </span>
      </div>

      <!-- ══════ 1. KELUHAN UTAMA ══════ -->
      <div class="rme-subsection-title"><span class="kad-sub-icon">💬</span> Keluhan Utama</div>
      <div class="rme-textarea-box kad-block" v-if="data.keluhan_utama">
        {{ data.keluhan_utama }}
      </div>
      <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak dicatat.</div>

      <!-- ══════ 2. RIWAYAT PENYAKIT SEKARANG ══════ -->
      <div class="rme-subsection-title">
        <span class="kad-sub-icon">📋</span> Riwayat Penyakit Sekarang
      </div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <div class="kad-field-lbl">Kondisi yang Diderita</div>
          <div class="kad-checklist-grid">
            <div
              v-for="item in KONDISI_LIST"
              :key="item"
              class="kad-check-item"
              :class="{ 'kad-checked': isChecked(data.riwayat_peny_skrg_arr, item) }"
            >
              <span class="kad-check-icon">{{
                isChecked(data.riwayat_peny_skrg_arr, item) ? '✓' : '○'
              }}</span>
              {{ item }}
            </div>
          </div>
          <div v-if="data.riwayat_peny_skrg_lainnya" class="kad-lainnya-note">
            <strong>Lainnya:</strong> {{ data.riwayat_peny_skrg_lainnya }}
          </div>
        </div>
        <div class="rme-info-col">
          <div class="kad-field-lbl">Deskripsi Riwayat Penyakit</div>
          <div class="rme-textarea-box kad-block" v-if="data.riwayat_peny_skrg">
            {{ data.riwayat_peny_skrg }}
          </div>
          <div v-else class="rme-empty-note" style="margin-top: 4px">
            <i class="pi pi-minus-circle"></i> Tidak dicatat.
          </div>
        </div>
      </div>

      <!-- ══════ 3. RIWAYAT ALERGI ══════ -->
      <div class="rme-subsection-title"><span class="kad-sub-icon">⚠️</span> Riwayat Alergi</div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <div class="kad-field-lbl">Jenis Alergi</div>
          <div class="kad-alergi-row">
            <span
              v-for="jenis in ['Obat', 'Makanan', 'Lainnya']"
              :key="jenis"
              :class="[
                'rme-badge',
                isChecked(data.elergi_arr, jenis) ? 'rme-badge-danger' : 'rme-badge-default',
              ]"
              class="kad-alergi-badge"
            >
              {{ jenis }}
            </span>
          </div>
          <div
            v-if="!data.elergi_arr || data.elergi_arr.length === 0"
            class="rme-empty-note"
            style="margin-top: 4px"
          >
            <i class="pi pi-check-circle"></i> Tidak ada alergi tercatat.
          </div>
        </div>
        <div class="rme-info-col">
          <div class="kad-field-lbl">Deskripsi Alergi</div>
          <div class="rme-textarea-box kad-block" v-if="data.elergi_deskripsi">
            {{ data.elergi_deskripsi }}
          </div>
          <div v-else class="rme-empty-note" style="margin-top: 4px">
            <i class="pi pi-minus-circle"></i> Tidak dicatat.
          </div>
        </div>
      </div>

      <!-- ══════ 4. RIWAYAT PENYAKIT KELUARGA ══════ -->
      <div class="rme-subsection-title">
        <span class="kad-sub-icon">👨‍👩‍👧</span> Riwayat Penyakit Keluarga
      </div>
      <div class="kad-checklist-grid kad-checklist-wide">
        <div
          v-for="item in KONDISI_LIST"
          :key="'kel-' + item"
          class="kad-check-item"
          :class="{ 'kad-checked': isChecked(data.riwayat_panyakit_kel, item) }"
        >
          <span class="kad-check-icon">{{
            isChecked(data.riwayat_panyakit_kel, item) ? '✓' : '○'
          }}</span>
          {{ item }}
        </div>
      </div>
      <div
        v-if="data.riwayat_panyakit_kel_lainnya"
        class="kad-lainnya-note"
        style="margin-top: 6px"
      >
        <strong>Lainnya:</strong> {{ data.riwayat_panyakit_kel_lainnya }}
      </div>
      <div
        v-if="!data.riwayat_panyakit_kel || data.riwayat_panyakit_kel.length === 0"
        class="rme-empty-note"
        style="margin-top: 6px"
      >
        <i class="pi pi-minus-circle"></i> Tidak ada riwayat penyakit keluarga.
      </div>

      <!-- ══════ 5. PEMERIKSAAN SISTEMIK ══════ -->
      <div class="rme-subsection-title">
        <span class="kad-sub-icon">🩺</span> Pemeriksaan Sistemik
      </div>
      <div v-if="!surveyFisikList || surveyFisikList.length === 0" class="rme-empty-note">
        <i class="pi pi-minus-circle"></i> Tidak ada data pemeriksaan sistemik.
      </div>
      <table v-else class="rme-tbl-data kad-survey-tbl">
        <thead>
          <tr>
            <th style="width: 30%">ORGAN / SISTEM</th>
            <th>TEMUAN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in surveyFisikList" :key="item.organ">
            <td class="kad-organ-cell">{{ item.label }}</td>
            <td>
              <span v-if="item.isNormal" class="kad-temuan-normal">Dalam batas normal</span>
              <span v-else class="kad-temuan-text">{{ item.temuanText }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ══════ 6. PEMERIKSAAN PENUNJANG ══════ -->
      <div class="rme-subsection-title">
        <span class="kad-sub-icon">🔬</span> Pemeriksaan Penunjang
      </div>
      <div class="rme-info-grid kad-penunjang-grid">
        <div class="rme-info-col">
          <div class="kad-field-lbl">Laboratorium</div>
          <div class="rme-textarea-box kad-block" v-if="data.penunjang_lab">
            {{ data.penunjang_lab }}
          </div>
          <div v-else class="rme-empty-note" style="margin-top: 4px">-</div>
        </div>
        <div class="rme-info-col">
          <div class="kad-field-lbl">Radiologi</div>
          <div class="rme-textarea-box kad-block" v-if="data.penunjang_radiologi">
            {{ data.penunjang_radiologi }}
          </div>
          <div v-else class="rme-empty-note" style="margin-top: 4px">-</div>
        </div>
        <div class="rme-info-col">
          <div class="kad-field-lbl">Lainnya</div>
          <div class="rme-textarea-box kad-block" v-if="data.penunjang_lainnya">
            {{ data.penunjang_lainnya }}
          </div>
          <div v-else class="rme-empty-note" style="margin-top: 4px">-</div>
        </div>
      </div>

      <!-- Hasil Lab Abnormal -->
      <div v-if="hasilLabAbnormal && hasilLabAbnormal.length > 0" class="kad-lab-abnormal">
        <div class="kad-lab-abnormal-title">
          <span>⚠️</span> Hasil Lab Abnormal ({{ hasilLabAbnormal.length }} item)
        </div>
        <div class="kad-lab-abnormal-list">
          <span v-for="(lab, i) in hasilLabAbnormal" :key="i" class="kad-lab-item">
            <span class="kad-lab-kat">{{ lab.KATEGORI }}</span>
            —
            <strong class="kad-lab-nama">{{ lab.PEMERIKSAAN }}</strong>
            <span class="kad-lab-nilai">{{ lab.HASIL }}</span>
            <span v-if="i < hasilLabAbnormal.length - 1" class="kad-lab-sep">•</span>
          </span>
        </div>
      </div>

      <!-- ══════ 7. DIAGNOSA / PROSEDUR ══════ -->
      <div class="rme-subsection-title">
        <span class="kad-sub-icon">🏷️</span> Diagnosa / Prosedur
      </div>
      <div class="kad-dx-grid">
        <div class="kad-dx-card kad-dx-utama">
          <div class="kad-dx-card-hdr">
            <span class="rme-badge rme-badge-danger">DX UTAMA</span>
          </div>
          <div class="kad-dx-card-body">
            <div v-if="data.dx_awal" class="rme-textarea-box kad-dx-text">{{ data.dx_awal }}</div>
            <div v-else class="rme-empty-note">
              <i class="pi pi-minus-circle"></i> Belum ditentukan.
            </div>
          </div>
        </div>
        <div class="kad-dx-card kad-dx-sekunder">
          <div class="kad-dx-card-hdr">
            <span class="rme-badge rme-badge-warning">DX SEKUNDER</span>
          </div>
          <div class="kad-dx-card-body">
            <div v-if="data.dx_sekunder" class="rme-textarea-box kad-dx-text">
              {{ data.dx_sekunder }}
            </div>
            <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak ada.</div>
          </div>
        </div>
        <div class="kad-dx-card kad-dx-prosedur">
          <div class="kad-dx-card-hdr"><span class="rme-badge rme-badge-info">PROSEDUR</span></div>
          <div class="kad-dx-card-body">
            <div v-if="data.prosedur" class="rme-textarea-box kad-dx-text">{{ data.prosedur }}</div>
            <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak ada.</div>
          </div>
        </div>
      </div>
    </div>
    <!-- /v-else hasData -->
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'
import { buildOrganLabels, buildFieldSchemaMap } from '@/composables/useSecondarySurveyList'

// ── Props ──────────────────────────────────────────────────────────────────────
const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

// ── Stores ─────────────────────────────────────────────────────────────────────
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})
const addTimelineEvent = inject('addTimelineEvent', () => {})

// ── Data State ─────────────────────────────────────────────────────────────────
const loading = ref(true)
const error = ref(null)
const data = ref({})
const hasilLabAbnormal = ref([])

// ── Computed ───────────────────────────────────────────────────────────────────
const hasData = computed(
  () => !!data.value?.keluhan_utama || !!data.value?.dx_awal || !!data.value?.riwayat_peny_skrg,
)

const ORGAN_LABELS = buildOrganLabels()
const FIELD_SCHEMA_MAP = buildFieldSchemaMap()

const fmtKey = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const surveyFisikList = computed(() => {
  const list = data.value?.data_survey_fisik
  if (!Array.isArray(list) || list.length === 0) return []
  return list.map((item) => {
    const fieldSchema = FIELD_SCHEMA_MAP[item.organ] || {}
    const parts = []
    if (item.fields && typeof item.fields === 'object') {
      for (const [k, v] of Object.entries(item.fields)) {
        const sf = fieldSchema[k]
        const label = sf?.label || fmtKey(k)
        if (Array.isArray(v)) {
          if (v.length === 0) continue
          const disp = v.map((val) => sf?.options?.find((o) => o.value === val)?.label || val).join(', ')
          parts.push(`${label}: ${disp}`)
        } else if (typeof v === 'string' && v.trim()) {
          const disp = sf?.options ? sf.options.find((o) => o.value === v)?.label || v : v
          parts.push(`${label}: ${disp}`)
        }
      }
    }
    const isNormal = parts.length === 0
    return {
      organ: item.organ,
      label: ORGAN_LABELS[item.organ] || item.organ,
      isNormal,
      temuanText: parts.join(' | '),
    }
  })
})

// ── Helper ─────────────────────────────────────────────────────────────────────
const isChecked = (arr, item) => Array.isArray(arr) && arr.includes(item)
const KONDISI_LIST = [
  'Diabetes malitus',
  'Hipertensi',
  'Jantung',
  'Tumor/Kanker',
  'Osteoporosis',
  'TBC',
  'Asma',
  'Skizofrenia',
  'Hypertiroid',
  'Hiperkolestrol',
]

// ── Fetch: kajian awal (read-only) ────────────────────────────────────────────
const fetchKajianAwal = async () => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/Triaseigd/get_kajian_awal_dokter_v2`, {
      noregister: props.dataPasien?.NOPENDAFTARAN || props.noreg,
      nomr: props.dataPasien?.NOMR || '',
      id_client: id_client.value,
    })
    const resp = res.data?.response || {}
    data.value = resp
    hasilLabAbnormal.value = res.data?.hasil_lab_positif || []
  } catch (e) {
    error.value = 'Gagal memuat kajian awal dokter: ' + (e.message || '')
    console.error('[KajianAwalSection]', e)
  } finally {
    loading.value = false
    const hasKajian = !!(
      data.value?.keluhan_utama ||
      data.value?.dx_awal ||
      data.value?.riwayat_peny_skrg
    )
    reportSectionData('kajian-awal', hasKajian)
    if (hasKajian) {
      addTimelineEvent('kajian-awal', {
        key: 'kajian-awal',
        label: 'Kajian Awal Dokter',
        icon: '🩻',
        color: '#1565c0',
        datetime: data.value?.last_update || '',
        meta: data.value?.dx_awal || '',
      })
    }
  }
}

// ── Watch ─────────────────────────────────────────────────────────────────────
watch(
  () => props.dataPasien?.NOPENDAFTARAN,
  (val) => {
    if (val) fetchKajianAwal()
  },
  { immediate: true },
)
</script>

<style scoped>
/* ── Title bar ────────────────────────────────────────────────────── */
.kad-title-bar {
  display: flex !important;
  align-items: center;
}
.kad-title-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Meta row ────────────────────────────────────────────────────── */
.kad-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.kad-verif-badge {
  font-size: 11px !important;
}
.kad-last-update {
  font-size: 11px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Sub-icon ────────────────────────────────────────────────────── */
.kad-sub-icon {
  margin-right: 4px;
  font-size: 13px;
}

/* ── Field label ─────────────────────────────────────────────────── */
.kad-field-lbl {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  margin-bottom: 4px;
}

/* ── Textarea block ──────────────────────────────────────────────── */
.kad-block {
  min-height: 36px;
}

/* ── Checklist grid ──────────────────────────────────────────────── */
.kad-checklist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 10px;
  margin-bottom: 4px;
}
.kad-checklist-wide {
  grid-template-columns: repeat(3, 1fr);
}
.kad-check-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #bbb;
  padding: 2px 4px;
  border-radius: 3px;
}
.kad-check-item.kad-checked {
  color: #3d5a80;
  font-weight: 700;
  background: #eef4f9;
}
.kad-check-icon {
  font-size: 12px;
  flex-shrink: 0;
  color: #4a8c4e;
}
.kad-check-item:not(.kad-checked) .kad-check-icon {
  color: #ccc;
}

/* ── Lainnya note ────────────────────────────────────────────────── */
.kad-lainnya-note {
  font-size: 11px;
  color: #666;
  padding: 4px 6px;
  background: #f5f5f5;
  border-radius: 3px;
  margin-top: 4px;
}

/* ── Alergi badges ───────────────────────────────────────────────── */
.kad-alergi-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.kad-alergi-badge {
  font-size: 11px !important;
  padding: 3px 10px !important;
}

/* ── Penunjang grid 3-kolom ──────────────────────────────────────── */
.kad-penunjang-grid {
  grid-template-columns: 1fr 1fr 1fr !important;
}

/* ── Survey fisik table ──────────────────────────────────────────── */
.kad-survey-tbl thead th {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #eef4f9;
  color: #4a7ab5;
}
.kad-organ-cell {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.4px;
  color: #3d5a80;
}
.kad-temuan-normal {
  color: #4a8c4e;
  font-size: 12px;
}
.kad-temuan-text {
  font-size: 12px;
  color: #333;
  line-height: 1.6;
}

/* ── Hasil lab abnormal ──────────────────────────────────────────── */
.kad-lab-abnormal {
  background: #fffbf0;
  border: 1px solid #ffd54f;
  border-left: 4px solid #e6953a;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 10px;
  line-height: 1.8;
}
.kad-lab-abnormal-title {
  font-size: 11px;
  font-weight: 700;
  color: #cc7722;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.kad-lab-abnormal-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 11px;
  color: #666;
}
.kad-lab-kat {
  color: #888;
}
.kad-lab-nama {
  color: #a04040;
}
.kad-lab-nilai {
  margin-left: 2px;
  font-weight: 600;
}
.kad-lab-sep {
  color: #ccc;
  margin: 0 3px;
}

/* ── Diagnosa / Prosedur grid ────────────────────────────────────── */
.kad-dx-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 4px;
}
.kad-dx-card {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}
.kad-dx-utama {
  border-top: 2px solid #b05050;
}
.kad-dx-sekunder {
  border-top: 2px solid #e6953a;
}
.kad-dx-prosedur {
  border-top: 2px solid #3a7fb5;
}
.kad-dx-card-hdr {
  padding: 5px 8px;
  background: #f7f7f7;
  border-bottom: 1px solid #e8e8e8;
}
.kad-dx-card-body {
  padding: 6px 8px;
}
.kad-dx-text {
  font-size: 12px;
  min-height: 48px;
  white-space: pre-wrap;
}

/* ── Print adjustments ───────────────────────────────────────────── */
@media print {
  .kad-check-item.kad-checked {
    background: #eef4f9 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .kad-lab-abnormal {
    background: #fffbf0 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .kad-dx-card-hdr {
    background: #f7f7f7 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
