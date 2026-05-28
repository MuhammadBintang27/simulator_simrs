<template>
  <div class="kad-form-wrap">

    <!-- ══ Header form ══ -->
    <div class="kad-form-header">
      <div class="kad-form-header-left">
        <span class="kad-form-icon">📋</span>
        <div>
          <div class="kad-form-title">Kajian Awal Medis Dokter (DPJP)</div>
          <div class="kad-form-meta" v-if="form.last_update">
            Terakhir disimpan: {{ form.last_update }}
            <span v-if="sttsVerif" class="kad-badge-verif">✓ {{ sttsVerif }}</span>
          </div>
        </div>
      </div>
      <div class="kad-form-header-right">
        <span v-if="saving" class="kad-saving-indicator">
          <span class="kad-dot-spin"></span> Menyimpan...
        </span>
      </div>
    </div>

    <!-- ══ Loading skeleton ══ -->
    <div v-if="loading" class="kad-skeleton-wrap">
      <div v-for="i in 4" :key="i" class="kad-skeleton-row"></div>
    </div>

    <div v-else>

      <!-- ══════ 1. KELUHAN UTAMA ══════ -->
      <div class="kad-card">
        <div class="kad-card-title">
          <span class="kad-card-icon">💬</span> Keluhan Utama
        </div>
        <div class="kad-card-body">
          <Textarea
            v-model="form.keluhan_utama"
            :rows="4"
            class="kad-textarea"
            placeholder="Tuliskan keluhan utama pasien..."
            autoResize
          />
        </div>
      </div>

      <!-- ══════ 2. RIWAYAT PENYAKIT SEKARANG ══════ -->
      <div class="kad-card">
        <div class="kad-card-title">
          <span class="kad-card-icon">📋</span> Riwayat Penyakit Sekarang
        </div>
        <div class="kad-card-body">
          <div class="kad-two-col">
            <!-- Kiri: checkbox kondisi -->
            <div>
              <div class="kad-field-label">Kondisi yang Diderita</div>
              <div class="kad-checkbox-grid">
                <div v-for="item in KONDISI_LIST" :key="'rpsk-'+item" class="kad-check-row">
                  <Checkbox
                    :inputId="'rpsk-'+item"
                    :value="item"
                    v-model="form.riwayat_peny_skrg_arr"
                  />
                  <label :for="'rpsk-'+item" class="kad-check-label">{{ item }}</label>
                </div>
              </div>
              <div class="kad-field-label" style="margin-top:8px">Lainnya</div>
              <input
                v-model="form.riwayat_peny_skrg_lainnya"
                class="kad-input"
                placeholder="Penyakit lainnya..."
              />
            </div>
            <!-- Kanan: deskripsi -->
            <div>
              <div class="kad-field-label">Deskripsi Riwayat Penyakit</div>
              <Textarea
                v-model="form.riwayat_peny_skrg"
                :rows="6"
                class="kad-textarea"
                placeholder="Tuliskan riwayat penyakit sekarang..."
                autoResize
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ══════ 3. RIWAYAT ALERGI ══════ -->
      <div class="kad-card">
        <div class="kad-card-title">
          <span class="kad-card-icon">⚠️</span> Riwayat Alergi
        </div>
        <div class="kad-card-body">
          <div class="kad-two-col">
            <!-- Kiri: jenis alergi -->
            <div>
              <div class="kad-field-label">Jenis Alergi</div>
              <div class="kad-check-row" v-for="jenis in ['Obat','Makanan','Lainnya']" :key="'al-'+jenis">
                <Checkbox
                  :inputId="'al-'+jenis"
                  :value="jenis"
                  v-model="form.elergi_arr"
                />
                <label :for="'al-'+jenis" class="kad-check-label">Alergi {{ jenis }}</label>
              </div>
            </div>
            <!-- Kanan: deskripsi -->
            <div>
              <div class="kad-field-label">Deskripsi Alergi</div>
              <Textarea
                v-model="form.elergi_deskripsi"
                :rows="4"
                class="kad-textarea"
                placeholder="Penjelasan riwayat alergi..."
                autoResize
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ══════ 4. RIWAYAT PENYAKIT KELUARGA ══════ -->
      <div class="kad-card">
        <div class="kad-card-title">
          <span class="kad-card-icon">👨‍👩‍👧</span> Riwayat Penyakit Keluarga
        </div>
        <div class="kad-card-body">
          <div class="kad-checkbox-grid kad-checkbox-grid-3">
            <div v-for="item in KONDISI_LIST" :key="'kel-'+item" class="kad-check-row">
              <Checkbox
                :inputId="'kel-'+item"
                :value="item"
                v-model="form.riwayat_panyakit_kel"
              />
              <label :for="'kel-'+item" class="kad-check-label">{{ item }}</label>
            </div>
          </div>
          <div class="kad-field-label" style="margin-top:8px">Lainnya</div>
          <input
            v-model="form.riwayat_panyakit_kel_lainnya"
            class="kad-input"
            placeholder="Penyakit keluarga lainnya..."
          />
        </div>
      </div>

      <!-- ══════ 5. PEMERIKSAAN SISTEMIK ══════ -->
      <div class="kad-card">
        <div class="kad-card-title">
          <span class="kad-card-icon">🩺</span> Pemeriksaan Sistemik
        </div>
        <div class="kad-card-body p-0">
          <div v-if="loadingSurvey" class="kad-loading-row">
            <span class="kad-dot-spin"></span> Memuat data pemeriksaan...
          </div>
          <table v-else class="kad-survey-tbl">
            <thead>
              <tr>
                <th style="width:32%">Objek</th>
                <th style="width:100px" class="tc">Normal</th>
                <th>Jika Tidak Normal (deskripsikan)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in surveyFisik" :key="item.survey">
                <td class="fw">{{ item.survey }}</td>
                <td class="tc">
                  <RadioButton
                    :inputId="'sv-'+item.survey"
                    :name="'sv-'+item.survey"
                    value="NORMAL"
                    v-model="item.hasil"
                  />
                </td>
                <td>
                  <input
                    v-model="item.hasil"
                    class="kad-input-inline"
                    autocomplete="off"
                    placeholder="Deskripsikan kondisi..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══════ 6. PEMERIKSAAN PENUNJANG ══════ -->
      <div class="kad-card">
        <div class="kad-card-title">
          <span class="kad-card-icon">🔬</span> Pemeriksaan Penunjang
        </div>
        <div class="kad-card-body">
          <div class="kad-three-col">
            <div>
              <div class="kad-field-label">Laboratorium</div>
              <input v-model="form.lab" class="kad-input" placeholder="Hasil laboratorium..." />
            </div>
            <div>
              <div class="kad-field-label">Radiologi</div>
              <input v-model="form.radiologi" class="kad-input" placeholder="Hasil radiologi..." />
            </div>
            <div>
              <div class="kad-field-label">Lainnya</div>
              <input v-model="form.penunjang_lainnya" class="kad-input" placeholder="Penunjang lainnya..." />
            </div>
          </div>

          <!-- Hasil Lab Abnormal -->
          <div v-if="hasilLabAbnormal.length > 0" class="kad-lab-warning">
            <div class="kad-lab-warning-title">⚠️ Hasil Lab Abnormal:</div>
            <div class="kad-lab-warning-items">
              <span v-for="(lab, i) in hasilLabAbnormal" :key="i" class="kad-lab-chip">
                {{ lab.KATEGORI }} — <strong>{{ lab.PEMERIKSAAN }}</strong> {{ lab.HASIL }}
                <span v-if="i < hasilLabAbnormal.length - 1"> &bull; </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════ 7. DIAGNOSA / PROSEDUR ══════ -->
      <div class="kad-card">
        <div class="kad-card-title">
          <span class="kad-card-icon">🏷️</span> Diagnosa / Prosedur
        </div>
        <div class="kad-card-body">
          <div class="kad-three-col">
            <!-- DX Utama -->
            <div>
              <div class="kad-field-label">
                Diagnosa Utama <span class="kad-required">*</span>
              </div>
              <Textarea
                v-model="form.diagnosautama"
                :rows="6"
                class="kad-textarea"
                placeholder="Contoh: Stroke Hemoragik, Hipertensi Emergency..."
                autoResize
              />
              <div class="kad-help-text">Diagnosis utama alasan pasien dirawat.</div>
            </div>
            <!-- DX Sekunder -->
            <div>
              <div class="kad-field-label">Diagnosa Sekunder</div>
              <Textarea
                v-model="form.diagnosasekunder"
                :rows="6"
                class="kad-textarea"
                placeholder="Contoh: Diabetes Mellitus Tipe 2, Anemia..."
                autoResize
              />
              <div class="kad-help-text">Penyakit penyerta (komorbiditas). Pisahkan dengan koma.</div>
            </div>
            <!-- Prosedur -->
            <div>
              <div class="kad-field-label">Prosedur</div>
              <Textarea
                v-model="form.prosedur"
                :rows="6"
                class="kad-textarea"
                placeholder="Contoh: Operasi Sesar, Intubasi..."
                autoResize
              />
              <div class="kad-help-text">Tindakan medis yang dilakukan. Opsional.</div>
            </div>
          </div>
        </div>

        <!-- Footer: tombol aksi -->
        <div class="kad-card-footer">
          <button
            class="kad-btn kad-btn-save"
            @click="simpan"
            :disabled="saving"
          >
            <span v-if="saving" class="kad-dot-spin" style="border-color:#fff;border-top-color:transparent"></span>
            <span v-else>💾</span>
            {{ saving ? 'Menyimpan...' : 'Simpan Kajian Awal' }}
          </button>
        </div>
      </div>

    </div><!-- /v-else loading -->
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'

// ── Props & Emits ───────────────────────────────────────────────────────────────
const props = defineProps({
  noreg:      { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['saved'])

// ── Stores & Services ───────────────────────────────────────────────────────────
const configStore = useConfigStore()
const authStore   = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

// ── State ───────────────────────────────────────────────────────────────────────
const loading       = ref(true)
const loadingSurvey = ref(false)
const saving        = ref(false)
const sttsVerif     = ref('')
const hasilLabAbnormal = ref([])
const surveyFisik   = ref([])

const form = ref({
  keluhan_utama              : '',
  riwayat_peny_skrg          : '',
  riwayat_peny_skrg_arr      : [],
  riwayat_peny_skrg_lainnya  : '',
  elergi_arr                 : [],
  elergi_deskripsi           : '',
  riwayat_panyakit_kel       : [],
  riwayat_panyakit_kel_lainnya: '',
  lab                        : '',
  radiologi                  : '',
  penunjang_lainnya          : '',
  diagnosautama              : '',
  diagnosasekunder           : '',
  prosedur                   : '',
  last_update                : '',
})

// ── Daftar kondisi ──────────────────────────────────────────────────────────────
const KONDISI_LIST = [
  'Diabetes malitus','Hipertensi','Jantung','Tumor/Kanker',
  'Osteoporosis','TBC','Asma','Skizofrenia','Hypertiroid','Hiperkolestrol',
]

// ── Helper noregister ───────────────────────────────────────────────────────────
const getNoReg = () => props.dataPasien?.NOPENDAFTARAN || props.noreg

// ── Fetch: data kajian awal ──────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(
      `${url}/index.php/api/Triaseigd/get_kajian_awal_dokter_v2`,
      { noregister: getNoReg(), nomr: props.dataPasien?.NOMR || '', id_client: id_client.value },
    )
    const r = res.data?.response || {}
    form.value.keluhan_utama               = r.keluhan_utama               || ''
    form.value.riwayat_peny_skrg          = r.riwayat_peny_skrg          || ''
    form.value.riwayat_peny_skrg_arr      = r.riwayat_peny_skrg_arr      || []
    form.value.riwayat_peny_skrg_lainnya  = r.riwayat_peny_skrg_lainnya  || ''
    form.value.elergi_arr                 = r.elergi_arr                 || []
    form.value.elergi_deskripsi           = r.elergi_deskripsi           || ''
    form.value.riwayat_panyakit_kel       = r.riwayat_panyakit_kel       || []
    form.value.riwayat_panyakit_kel_lainnya = r.riwayat_panyakit_kel_lainnya || ''
    form.value.lab                        = r.penunjang_lab              || ''
    form.value.radiologi                  = r.penunjang_radiologi        || ''
    form.value.penunjang_lainnya          = r.penunjang_lainnya          || ''
    form.value.diagnosautama              = r.dx_awal                    || ''
    form.value.diagnosasekunder           = r.dx_sekunder                || ''
    form.value.prosedur                   = r.prosedur                   || ''
    form.value.last_update                = r.last_update                || ''
    sttsVerif.value                       = r.telah_verif                || ''
    hasilLabAbnormal.value                = res.data?.hasil_lab_positif  || []
  } catch (e) {
    console.error('[KajianAwalForm] fetchData error:', e)
  } finally {
    loading.value = false
  }
}

// ── Fetch: survey fisik (pemeriksaan sistemik) ────────────────────────────────
const fetchSurvey = async () => {
  loadingSurvey.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(
      `${url}/index.php/api/data_referensi/survey_fisik_ranap`,
      { noregister: getNoReg(), id_client: id_client.value },
    )
    surveyFisik.value = res.data?.response || []
  } catch (e) {
    console.error('[KajianAwalForm] fetchSurvey error:', e)
  } finally {
    loadingSurvey.value = false
  }
}

// ── Simpan kajian awal ──────────────────────────────────────────────────────────
const simpan = async () => {
  saving.value = true
  try {
    const url  = configStore.apiBaseUrl
    const payload = {
      noregister                 : getNoReg(),
      nomr                       : props.dataPasien?.NOMR || '',
      keluhan_utama              : form.value.keluhan_utama,
      riwayat_peny_skrg          : form.value.riwayat_peny_skrg,
      penunjang_lab              : form.value.lab,
      penunjang_radiologi        : form.value.radiologi,
      riwayat_peny_skrg_arr      : form.value.riwayat_peny_skrg_arr,
      riwayat_peny_skrg_lainnya  : form.value.riwayat_peny_skrg_lainnya,
      penunjang_lainnya          : form.value.penunjang_lainnya,
      dx_awal                    : form.value.diagnosautama,
      dx_sekunder                : form.value.diagnosasekunder,
      prosedur                   : form.value.prosedur,
      elergi_arr                 : form.value.elergi_arr,
      elergi_deskripsi           : form.value.elergi_deskripsi,
      riwayat_panyakit_kel       : form.value.riwayat_panyakit_kel,
      riwayat_panyakit_kel_lainnya: form.value.riwayat_panyakit_kel_lainnya,
      data_survey_fisik          : surveyFisik.value,
      id_client                  : id_client.value,
      user_id                    : user_id.value,
    }

    const res = await axios.post(
      `${url}/index.php/api/Triaseigd/kajian_awal_dokter_v2`,
      payload,
    )

    if (res.data?.metadata?.code == 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: res.data.metadata.message || 'Kajian awal berhasil disimpan.', life: 3000 })
      await fetchData()
      emit('saved')
    } else {
      toast.add({ severity: 'warn', summary: 'Perhatian', detail: res.data?.metadata?.message || 'Gagal menyimpan kajian awal.', life: 4000 })
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi kesalahan: ' + (e.message || ''), life: 5000 })
    console.error('[KajianAwalForm] simpan error:', e)
  } finally {
    saving.value = false
  }
}

// ── Watch dataPasien ────────────────────────────────────────────────────────────
watch(
  () => props.dataPasien?.NOPENDAFTARAN,
  (val) => {
    if (val) {
      fetchData()
      fetchSurvey()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* ══ Wrapper ════════════════════════════════════════════════════════════════ */
.kad-form-wrap {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  color: #1a1a2e;
}

/* ══ Header ═════════════════════════════════════════════════════════════════ */
.kad-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #1565c0 0%, #1976d2 100%);
  color: #fff;
  padding: 10px 14px;
  border-radius: 6px 6px 0 0;
  margin-bottom: 0;
}
.kad-form-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.kad-form-icon { font-size: 18px; }
.kad-form-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.kad-form-meta {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.kad-badge-verif {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 10px;
  font-weight: 700;
}
.kad-form-header-right { display: flex; align-items: center; }
.kad-saving-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

/* ══ Skeleton ═══════════════════════════════════════════════════════════════ */
.kad-skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e3e8f0;
}
.kad-skeleton-row {
  height: 16px;
  background: linear-gradient(90deg,#e0e0e0 25%,#eeeeee 50%,#e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
  border-radius: 4px;
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* ══ Card ═══════════════════════════════════════════════════════════════════ */
.kad-card {
  background: #fff;
  border: 1px solid #d6e4f0;
  border-top: 3px solid #1565c0;
  border-radius: 0 0 4px 4px;
  margin-bottom: 10px;
  overflow: hidden;
}
.kad-card:first-of-type {
  border-radius: 4px;
  border-top: 3px solid #1565c0;
}
.kad-card-title {
  background: linear-gradient(90deg, #e3f0fb 0%, #f0f7ff 100%);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #1565c0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #c5ddf4;
}
.kad-card-icon { font-size: 14px; }
.kad-card-body {
  padding: 12px 14px;
}
.kad-card-body.p-0 { padding: 0; }
.kad-card-footer {
  padding: 10px 14px;
  background: #f5f9ff;
  border-top: 1px solid #d6e4f0;
  display: flex;
  gap: 8px;
}

/* ══ Layout grid ════════════════════════════════════════════════════════════ */
.kad-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.kad-three-col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

/* ══ Field label ════════════════════════════════════════════════════════════ */
.kad-field-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #555;
  margin-bottom: 5px;
}
.kad-required { color: #e53935; margin-left: 2px; }
.kad-help-text {
  font-size: 10.5px;
  color: #888;
  font-style: italic;
  margin-top: 4px;
  line-height: 1.5;
}

/* ══ Checkbox grid ══════════════════════════════════════════════════════════ */
.kad-checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 10px;
}
.kad-checkbox-grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.kad-check-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.kad-check-label {
  font-size: 12px;
  cursor: pointer;
  color: #333;
  user-select: none;
}

/* ══ Input & Textarea ═══════════════════════════════════════════════════════ */
.kad-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #c5ddf4;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  color: #1a1a2e;
  background: #f9fbfd;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.kad-input:focus {
  border-color: #1565c0;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(21,101,192,0.12);
}
.kad-textarea {
  width: 100% !important;
  font-size: 12px !important;
  font-family: inherit !important;
  border-color: #c5ddf4 !important;
  background: #f9fbfd !important;
  border-radius: 4px !important;
  color: #1a1a2e !important;
  resize: vertical;
}
.kad-textarea:focus {
  border-color: #1565c0 !important;
  box-shadow: 0 0 0 2px rgba(21,101,192,0.12) !important;
}

/* ══ Survey fisik table ═════════════════════════════════════════════════════ */
.kad-survey-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.kad-survey-tbl thead th {
  background: #e3f0fb;
  color: #1565c0;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 6px 10px;
  border: 1px solid #c5ddf4;
}
.kad-survey-tbl tbody tr { transition: background 0.12s; }
.kad-survey-tbl tbody tr:hover { background: #edf4fd; }
.kad-survey-tbl tbody td {
  padding: 5px 10px;
  border: 1px solid #e0e0e0;
  vertical-align: middle;
}
.kad-survey-tbl tbody tr:nth-child(even) td { background: #f7fbff; }
.kad-survey-tbl tbody tr:nth-child(even):hover td { background: #edf4fd; }
.fw { font-weight: 600; }
.tc { text-align: center; }
.kad-input-inline {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #dde8f4;
  border-radius: 4px;
  font-size: 11.5px;
  font-family: inherit;
  color: #1a1a2e;
  background: transparent;
  outline: none;
  box-sizing: border-box;
}
.kad-input-inline:focus {
  border-color: #1565c0;
  background: #fff;
}

/* ══ Lab warning ════════════════════════════════════════════════════════════ */
.kad-lab-warning {
  margin-top: 12px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-left: 4px solid #f57f17;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
}
.kad-lab-warning-title {
  font-weight: 700;
  color: #e65100;
  margin-bottom: 4px;
}
.kad-lab-warning-items { color: #555; line-height: 1.7; }
.kad-lab-chip strong { color: #c62828; }

/* ══ Loading ════════════════════════════════════════════════════════════════ */
.kad-loading-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1565c0;
  font-size: 12px;
  padding: 12px 14px;
}
.kad-dot-spin {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #1565c0;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ Tombol Aksi ════════════════════════════════════════════════════════════ */
.kad-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;
}
.kad-btn:active:not(:disabled) { transform: scale(0.97); }
.kad-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.kad-btn-save {
  background: #2e7d32;
  color: #fff;
}
.kad-btn-save:hover:not(:disabled) { background: #1b5e20; }
</style>
