<template>
  <div class="kf-wrapper">
    <!-- ── Topbar / Breadcrumb ── -->
    <div class="kf-topbar">
      <Button
        icon="pi pi-arrow-left"
        text
        size="small"
        class="kf-back-btn"
        @click="$emit('close')"
      />
      <nav class="kf-breadcrumb">
        <span class="kf-bc-link" @click="$emit('close')">Daftar Pasien</span>
        <i class="pi pi-chevron-right kf-bc-sep" />
        <span class="kf-bc-current">Buat Konsultasi Dokter</span>
      </nav>
      <div v-if="isDraft && draftId" class="kf-draft-tag"><i class="pi pi-file-edit" /> Draft</div>
    </div>

    <!-- ── Layout 2 Kolom ── -->
    <div class="kf-body">
      <!-- ═══════════════════════════════════════
           KOLOM KIRI — Form Utama
      ═══════════════════════════════════════ -->
      <div class="kf-col-left">
        <!-- 1. Pasien Card (readonly, dikunci) -->
        <div class="kf-pasien-banner">
          <div class="kf-pasien-avatar">{{ pasienInitials }}</div>
          <div class="kf-pasien-info">
            <div class="kf-pasien-nama">{{ nama_pasien }}</div>
            <div class="kf-pasien-meta">
              <div class="kf-pasien-meta-item">
                <i class="pi pi-id-card" />
                <span class="kf-pasien-meta-lbl">No. RM</span>
                <span class="kf-pasien-meta-val">{{ no_rm }}</span>
              </div>
              <div class="kf-pasien-meta-divider" />
              <div class="kf-pasien-meta-item">
                <i class="pi pi-hashtag" />
                <span class="kf-pasien-meta-lbl">No. Daftar</span>
                <span class="kf-pasien-meta-val">{{ noregister }}</span>
              </div>
            </div>
          </div>
          <div class="kf-lock-badge"><i class="pi pi-lock" /> Data terkunci</div>
        </div>

        <!-- Draft Banner -->
        <div v-if="isDraft && draftId" class="kf-draft-banner">
          <div class="kf-draft-banner-left">
            <i class="pi pi-file-edit kf-draft-banner-icon" />
            <div>
              <span class="kf-draft-banner-title">Form ini masih berstatus Draft</span>
              <span v-if="draftSavedAt" class="kf-draft-banner-time">
                &nbsp;·&nbsp;Terakhir disimpan {{ draftSavedAt }}
              </span>
            </div>
          </div>
          <button
            class="kf-btn-hapus-draft"
            type="button"
            :disabled="isDeletingDraft"
            @click="handleHapusDraft"
          >
            <i :class="isDeletingDraft ? 'pi pi-spinner pi-spin' : 'pi pi-trash'" />
            {{ isDeletingDraft ? 'Menghapus...' : 'Hapus Draft' }}
          </button>
        </div>

        <!-- 2. Dokter & Urgensi -->
        <section class="kf-section">
          <div class="kf-section-hd">
            <i class="pi pi-user-md" />
            Dokter &amp; Urgensi
          </div>
          <div class="kf-section-body">
            <div class="kf-row-2">
              <!-- Dokter pengirim: auto-fill dari sesi login, readonly -->
              <div class="kf-field">
                <label class="kf-label">Dokter Pengirim</label>
                <InputText :value="user_name" readonly class="w-full kf-readonly" />
              </div>
              <!-- Dokter konsultan: dropdown dengan filter -->
              <div class="kf-field">
                <label class="kf-label">Dokter Konsultan <span class="kf-req">*</span></label>
                <Select
                  v-model="form.dokter_tujuan"
                  :options="dokterList"
                  option-label="NAMADOKTER"
                  placeholder="Pilih dokter konsultan..."
                  :loading="isLoadingDokter"
                  filter
                  filter-placeholder="Cari nama dokter..."
                  class="w-full"
                  :class="{ 'p-invalid': errors.dokter_tujuan }"
                  @change="clearError('dokter_tujuan')"
                />
                <small v-if="errors.dokter_tujuan" class="kf-err">{{ errors.dokter_tujuan }}</small>
              </div>
            </div>

            <!-- Urgensi: toggle CITO / Elektif -->
            <div class="kf-field">
              <label class="kf-label">Urgensi <span class="kf-req">*</span></label>
              <div class="kf-urgency-group">
                <button
                  class="kf-urg-btn"
                  :class="form.is_urgent === 1 ? 'urg-cito' : 'urg-off'"
                  type="button"
                  @click="setUrgency(1)"
                >
                  <i class="pi pi-bolt" /> CITO
                </button>
                <button
                  class="kf-urg-btn"
                  :class="form.is_urgent === 0 ? 'urg-elektif' : 'urg-off'"
                  type="button"
                  @click="setUrgency(0)"
                >
                  <i class="pi pi-calendar" /> Elektif
                </button>
              </div>
              <small v-if="errors.is_urgent" class="kf-err">{{ errors.is_urgent }}</small>
            </div>
          </div>
        </section>

        <!-- 3. [S] Subjective -->
        <section class="kf-section">
          <div class="kf-section-hd">
            <span class="kf-soap-badge">S</span>
            Subjective
            <button
              class="kf-btn-fetch-vital"
              style="margin-left: auto; text-transform: none; letter-spacing: 0"
              type="button"
              :disabled="isLoadingKajian"
              @click="fetchKajianAwal"
            >
              <i :class="isLoadingKajian ? 'pi pi-spinner pi-spin' : 'pi pi-download'" />
              {{ isLoadingKajian ? 'Mengambil...' : 'Ambil dari Kajian Awal DPJP' }}
            </button>
          </div>
          <div v-if="lastKajianTime" class="kf-kajian-source">
            <i class="pi pi-check-circle" />
            Diambil dari Kajian Awal DPJP — diotorisasi {{ lastKajianTime }}
          </div>
          <div class="kf-section-body">
            <div class="kf-field">
              <label class="kf-label">Keluhan Utama <span class="kf-req">*</span></label>
              <Textarea
                v-model="form.keluhan"
                rows="3"
                class="w-full"
                :class="{ 'p-invalid': errors.keluhan }"
                placeholder="Onset, lokasi, kualitas, kuantitas, dan faktor yang memperberat/memperingan..."
                auto-resize
                @input="clearError('keluhan')"
              />
              <small v-if="errors.keluhan" class="kf-err">{{ errors.keluhan }}</small>
            </div>
            <div class="kf-field">
              <label class="kf-label">Riwayat Penyakit</label>
              <Textarea
                v-model="form.riwayat_penyakit"
                rows="2"
                class="w-full"
                placeholder="Riwayat penyakit sebelumnya, alergi obat, operasi sebelumnya, dll..."
                auto-resize
              />
            </div>
          </div>
        </section>

        <!-- 4. [O] Objective -->
        <section class="kf-section">
          <div class="kf-section-hd">
            <span class="kf-soap-badge">O</span>
            Objective
          </div>
          <div class="kf-section-body">
            <!-- Tanda Vital 3×2 grid -->
            <div class="kf-vital-header">
              <label class="kf-label">Tanda Vital</label>
              <button
                class="kf-btn-fetch-vital"
                type="button"
                :disabled="isLoadingVital"
                @click="fetchVitalSigns"
              >
                <i :class="isLoadingVital ? 'pi pi-spinner pi-spin' : 'pi pi-refresh'" />
                {{ isLoadingVital ? 'Mengambil...' : 'Ambil dari CPPT Terakhir' }}
              </button>
            </div>
            <div v-if="lastVitalTime" class="kf-vital-source">
              <i class="pi pi-clock" /> Diambil dari CPPT: {{ lastVitalTime }}
            </div>
            <div class="kf-vital-grid">
              <div class="kf-vital-cell">
                <label class="kf-vital-label">TD (mmHg)</label>
                <InputText
                  v-model="vitalSigns.td"
                  placeholder="120/80"
                  class="w-full"
                  size="small"
                />
              </div>
              <div class="kf-vital-cell">
                <label class="kf-vital-label">Nadi (x/mnt)</label>
                <InputText v-model="vitalSigns.nadi" placeholder="80" class="w-full" size="small" />
              </div>
              <div class="kf-vital-cell">
                <label class="kf-vital-label">Respirasi (x/mnt)</label>
                <InputText v-model="vitalSigns.rr" placeholder="20" class="w-full" size="small" />
              </div>
              <div class="kf-vital-cell">
                <label class="kf-vital-label">Suhu (°C)</label>
                <InputText
                  v-model="vitalSigns.suhu"
                  placeholder="36.5"
                  class="w-full"
                  size="small"
                />
              </div>
              <div class="kf-vital-cell">
                <label class="kf-vital-label">SpO2 (%)</label>
                <InputText v-model="vitalSigns.spo2" placeholder="98" class="w-full" size="small" />
              </div>
              <div class="kf-vital-cell">
                <label class="kf-vital-label">Kesadaran</label>
                <Select
                  v-model="vitalSigns.kesadaran"
                  :options="kesadaranOptions"
                  placeholder="Pilih..."
                  class="w-full"
                  size="small"
                />
              </div>
            </div>

            <!-- Penunjang chip toggle -->
            <div class="kf-field kf-field-mt">
              <label class="kf-label">Penunjang Terlampir</label>
              <div class="kf-chip-group">
                <button
                  v-for="p in penunjangOptions"
                  :key="p"
                  class="kf-chip"
                  :class="{ active: isPenunjangActive(p) }"
                  type="button"
                  @click="togglePenunjang(p)"
                >
                  <i v-if="isPenunjangActive(p)" class="pi pi-check" style="font-size: 11px" />
                  {{ p }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. [A] Assessment -->
        <section class="kf-section">
          <div class="kf-section-hd">
            <span class="kf-soap-badge">A</span>
            Assessment
          </div>
          <div class="kf-section-body">
            <div class="kf-field">
              <label class="kf-label">Diagnosis Kerja <span class="kf-req">*</span></label>
              <InputText
                v-model="form.diagnosa"
                class="w-full"
                :class="{ 'p-invalid': errors.diagnosa }"
                placeholder="Contoh: Sindrom Koroner Akut (NSTEMI)"
                @input="clearError('diagnosa')"
              />
              <small v-if="errors.diagnosa" class="kf-err">{{ errors.diagnosa }}</small>
            </div>
          </div>
        </section>

        <!-- 6. [P] Plan -->
        <section class="kf-section">
          <div class="kf-section-hd">
            <span class="kf-soap-badge">P</span>
            Plan
          </div>
          <div class="kf-section-body">
            <div class="kf-field">
              <label class="kf-label">Pertanyaan ke Konsultan <span class="kf-req">*</span></label>
              <Textarea
                v-model="form.pertanyaan"
                rows="4"
                class="w-full"
                :class="{ 'p-invalid': errors.pertanyaan }"
                placeholder="Tuliskan hal yang ingin dikonsultasikan secara spesifik kepada dokter spesialis..."
                auto-resize
                @input="clearError('pertanyaan')"
              />
              <small v-if="errors.pertanyaan" class="kf-err">{{ errors.pertanyaan }}</small>
            </div>
            <div class="kf-field">
              <label class="kf-label">Terapi yang Sudah Diberikan</label>
              <Textarea
                v-model="form.terapi_diberikan"
                rows="2"
                class="w-full"
                placeholder="Obat dan tindakan yang telah diberikan sebelum konsultasi ini..."
                auto-resize
              />
            </div>
            <div class="kf-field">
              <label class="kf-label">Target Waktu Jawab</label>
              <Select
                v-model="form.waktu_jawab_target"
                :options="waktuJawabOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
          </div>
        </section>

        <!-- ── Footer Buttons ── -->
        <div class="kf-footer">
          <Button
            label="Simpan Draft"
            icon="pi pi-save"
            class="kf-btn-draft"
            :loading="isSavingDraft"
            loading-icon="pi pi-spinner pi-spin"
            @click="handleSimpanDraft"
          />
          <Button
            :label="selectedDokterName ? `Kirim ke ${selectedDokterName}` : 'Kirim Konsultasi'"
            icon="pi pi-send"
            class="kf-btn-kirim"
            :loading="isSending"
            loading-icon="pi pi-spinner pi-spin"
            @click="handleKirim"
          />
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           KOLOM KANAN — Status & Info
      ═══════════════════════════════════════ -->
      <aside class="kf-col-right">
        <!-- Status Tracker — PrimeVue Timeline -->
        <div class="kf-rcard">
          <div class="kf-rcard-hd">
            <i class="pi pi-list-check" />
            Status Konsultasi
          </div>
          <div class="kf-tl-wrap">
            <Timeline :value="statusStages" class="kf-tl">
              <template #marker="{ item, index }">
                <div
                  class="kf-tl-dot"
                  :class="{
                    'tl-dot-done': stageIndex > index,
                    'tl-dot-current': stageIndex === index,
                    'tl-dot-pending': stageIndex < index,
                  }"
                >
                  <i :class="stageIndex > index ? 'pi pi-check' : item.icon" />
                </div>
              </template>
              <template #content="{ item, index }">
                <div class="kf-tl-content">
                  <span
                    class="kf-tl-label"
                    :class="{
                      'tl-lbl-done': stageIndex > index,
                      'tl-lbl-current': stageIndex === index,
                      'tl-lbl-pending': stageIndex < index,
                    }"
                    >{{ item.label }}</span
                  >
                  <span v-if="stageIndex === index" class="kf-tl-badge kf-tl-badge-active">
                    <i class="pi pi-circle-fill" style="font-size: 0.6rem" /> Aktif
                  </span>
                  <span v-else-if="stageIndex > index" class="kf-tl-badge kf-tl-badge-done">
                    <i class="pi pi-check" style="font-size: 0.7rem" /> Selesai
                  </span>
                </div>
              </template>
            </Timeline>
          </div>
        </div>

        <!-- Alur Dokter -->
        <div class="kf-rcard">
          <div class="kf-rcard-hd">
            <i class="pi pi-arrow-right-arrow-left" />
            Alur Dokter
          </div>
          <div class="kf-flow">
            <div class="kf-flow-item">
              <div class="kf-flow-av kf-av-pengirim">
                {{ user_name ? user_name.substring(0, 2).toUpperCase() : 'DR' }}
              </div>
              <div class="kf-flow-info">
                <span class="kf-flow-role">Pengirim</span>
                <span class="kf-flow-name">{{ user_name || '—' }}</span>
              </div>
            </div>
            <div class="kf-flow-connector">
              <div class="kf-connector-line" />
              <i class="pi pi-arrow-down kf-connector-icon" />
              <div class="kf-connector-line" />
            </div>
            <div class="kf-flow-item">
              <div
                class="kf-flow-av"
                :class="selectedDokterName ? 'kf-av-konsultan-aktif' : 'kf-av-konsultan-empty'"
              >
                {{ selectedDokterName ? selectedDokterName.substring(0, 2).toUpperCase() : '?' }}
              </div>
              <div class="kf-flow-info">
                <span class="kf-flow-role">Konsultan</span>
                <span class="kf-flow-name" :class="{ 'kf-muted': !selectedDokterName }">
                  {{ selectedDokterName || 'Belum dipilih' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info tip -->
        <div class="kf-info-tip">
          <i class="pi pi-info-circle kf-tip-icon" />
          <p>
            Konsultasi akan masuk ke inbox dokter konsultan dan dapat dijawab melalui menu
            <strong>Jawab Konsultasi</strong>.
          </p>
        </div>
      </aside>
    </div>

    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useAuthStore, useConfigStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useKonsultasi } from './useKonsultasi'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import Timeline from 'primevue/timeline'

// ── Props (data pasien dari parent, READONLY) ──
const props = defineProps({
  noregister: { type: String, required: true },
  no_rm: { type: String, required: true },
  nama_pasien: { type: String, required: true },
})
const emit = defineEmits(['submitted', 'close'])

// ── Auth store — dokter pengirim auto-fill ──
const authStore = useAuthStore()
const configStore = useConfigStore()
const { user_name, kd_dokter, id_client } = storeToRefs(authStore)
const toast = useToast()

// ── Composable ──
const {
  dokterList,
  isLoadingDokter,
  errors,
  validate,
  clearError,
  fetchDokterList,
  simpanDraft,
  kirimKonsultasi,
  getDraft,
  hapusDraft,
} = useKonsultasi()

// ── UI State ──
const isSavingDraft = ref(false)
const isSending = ref(false)
const isDraft = ref(false)
const isDeletingDraft = ref(false)
const draftId = ref(null) // id_konsul dari draft yang sudah tersimpan
const draftSavedAt = ref('')
const currentStatus = ref('draft') // draft | dikirim | diterima | dijawab
const isLoadingVital = ref(false)
const lastVitalTime = ref('')
const isLoadingKajian = ref(false)
const lastKajianTime = ref('')

// ── Form Data ──
const form = ref({
  dokter_tujuan: null,
  is_urgent: null, // 1 = CITO, 0 = Elektif
  keluhan: '',
  riwayat_penyakit: '',
  diagnosa: '',
  pertanyaan: '',
  terapi_diberikan: '',
  waktu_jawab_target: 'Sesuai jadwal',
})

// Vital signs dipisah, di-serialize ke JSON sebelum kirim
const vitalSigns = ref({
  td: '',
  nadi: '',
  rr: '',
  suhu: '',
  spo2: '',
  kesadaran: '',
})

// Penunjang: array, di-join ke comma-string sebelum kirim
const selectedPenunjang = ref([])

// ── Options ──
const kesadaranOptions = ['CM', 'Apatis', 'Somnolen', 'Sopor', 'Koma']
const penunjangOptions = ['EKG', 'Foto Thorax', 'Lab Troponin', 'Echo', 'CT-Angio']
const waktuJawabOptions = [
  { label: 'Segera (< 30 menit)', value: 'Segera (< 30 menit)' },
  { label: '< 2 jam', value: '< 2 jam' },
  { label: 'Sesuai jadwal', value: 'Sesuai jadwal' },
]

const statusStages = [
  { key: 'draft', label: 'Dibuat', icon: 'pi pi-pencil' },
  { key: 'dikirim', label: 'Dikirim', icon: 'pi pi-send' },
  { key: 'diterima', label: 'Diterima', icon: 'pi pi-eye' },
  { key: 'dijawab', label: 'Dijawab', icon: 'pi pi-check-circle' },
]
const stageMap = { draft: 0, dikirim: 1, diterima: 2, dijawab: 3 }
const stageIndex = computed(() => stageMap[currentStatus.value] ?? 0)

// ── Computed ──
const pasienInitials = computed(() => (props.nama_pasien || 'XX').substring(0, 2).toUpperCase())
const selectedDokterName = computed(() => form.value.dokter_tujuan?.NAMADOKTER || '')

// ── Helpers ──
const setUrgency = (val) => {
  form.value.is_urgent = val
  clearError('is_urgent')
}
const isPenunjangActive = (p) => selectedPenunjang.value.includes(p)
const togglePenunjang = (p) => {
  const i = selectedPenunjang.value.indexOf(p)
  i === -1 ? selectedPenunjang.value.push(p) : selectedPenunjang.value.splice(i, 1)
}

const gcsToKesadaran = (gcs) => {
  if (gcs >= 14) return 'CM'
  if (gcs >= 11) return 'Apatis'
  if (gcs >= 8) return 'Somnolen'
  if (gcs >= 5) return 'Sopor'
  return 'Koma'
}

const fetchVitalSigns = async () => {
  isLoadingVital.value = true
  try {
    const res = await axios.post(`${configStore.apiBaseUrl}/index.php/api/Triaseigd/get_soap`, {
      id_client: id_client.value,
      noregister: props.noregister,
      mode: 3,
    })
    const data = res.data?.response?.[0]
    if (!data) {
      toast.add({
        severity: 'warn',
        summary: 'Tidak ditemukan',
        detail: 'Belum ada data CPPT untuk pasien ini.',
        life: 3000,
      })
      return
    }
    vitalSigns.value = {
      td: data.sistole && data.diastole ? `${data.sistole}/${data.diastole}` : '',
      nadi: data.nadi ?? '',
      rr: data.pernafasan ?? '',
      suhu: data.suhu ?? '',
      spo2: data.spo2 ?? '',
      kesadaran: data.gcs ? gcsToKesadaran(data.gcs) : '',
    }
    lastVitalTime.value = data.waktu_display || data.waktu || ''
    toast.add({
      severity: 'success',
      summary: 'Tanda vital diambil',
      detail: `Data dari CPPT ${lastVitalTime.value}`,
      life: 2500,
    })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal mengambil data', detail: e.message, life: 4000 })
  } finally {
    isLoadingVital.value = false
  }
}

const fetchKajianAwal = async () => {
  isLoadingKajian.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/get_kajian_awal_dokter_v2`,
      { id_client: id_client.value, noregister: props.noregister },
    )
    const data = res.data?.response
    if (!data) {
      toast.add({
        severity: 'warn',
        summary: 'Tidak ditemukan',
        detail: 'Kajian Awal DPJP belum tersedia untuk pasien ini.',
        life: 3000,
      })
      return
    }
    form.value.keluhan = data.keluhan_utama || form.value.keluhan
    form.value.riwayat_penyakit = data.riwayat_peny_skrg || form.value.riwayat_penyakit
    form.value.diagnosa = data.dx_awal || form.value.diagnosa
    if (form.value.keluhan) clearError('keluhan')
    if (form.value.diagnosa) clearError('diagnosa')
    lastKajianTime.value = data.jam_auth || data.last_update || ''
    toast.add({
      severity: 'success',
      summary: 'Data kajian awal diambil',
      detail: data.telah_verif || 'Keluhan, riwayat, dan diagnosis terisi.',
      life: 3000,
    })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal mengambil data', detail: e.message, life: 4000 })
  } finally {
    isLoadingKajian.value = false
  }
}

const buildPayload = () => ({
  id_client: id_client.value,
  ...(draftId.value ? { id_konsul: draftId.value } : {}),
  noregister: props.noregister,
  no_rm: props.no_rm,
  nama_pasien: props.nama_pasien,
  dokter_pengirim: kd_dokter.value,
  nama_dokter_pengirim: user_name.value,
  dokter_tujuan: form.value.dokter_tujuan?.KDDOKTER || '',
  nama_dokter_tujuan: form.value.dokter_tujuan?.NAMADOKTER || '',
  kode_dokter_bpjs: form.value.dokter_tujuan?.KODE_DOKTER_BPJS || '',
  is_urgent: form.value.is_urgent,
  keluhan: form.value.keluhan,
  riwayat_penyakit: form.value.riwayat_penyakit,
  vital_signs: JSON.stringify(vitalSigns.value),
  penunjang: selectedPenunjang.value.join(','),
  diagnosa: form.value.diagnosa,
  pertanyaan: form.value.pertanyaan,
  terapi_diberikan: form.value.terapi_diberikan,
  waktu_jawab_target: form.value.waktu_jawab_target,
})

// ── Aksi ──
const handleSimpanDraft = async () => {
  isSavingDraft.value = true
  try {
    const result = await simpanDraft(buildPayload())
    isDraft.value = true
    if (result.id_konsul) draftId.value = result.id_konsul
    toast.add({
      severity: 'success',
      summary: 'Draft tersimpan',
      detail: 'Form konsultasi berhasil disimpan sebagai draft.',
      life: 3000,
    })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: e.message, life: 4000 })
  } finally {
    isSavingDraft.value = false
  }
}

const handleKirim = async () => {
  if (!validate(form.value)) {
    toast.add({
      severity: 'warn',
      summary: 'Lengkapi form',
      detail: 'Harap isi semua field yang wajib (*) sebelum mengirim.',
      life: 3500,
    })
    return
  }
  isSending.value = true
  try {
    const result = await kirimKonsultasi(buildPayload())
    currentStatus.value = 'dikirim'
    toast.add({
      severity: 'success',
      summary: 'Konsultasi terkirim',
      detail: `Berhasil dikirim ke ${selectedDokterName.value}.`,
      life: 3000,
    })
    setTimeout(() => emit('submitted', { id_konsul: result.data?.id_konsul }), 1500)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal kirim', detail: e.message, life: 4000 })
  } finally {
    isSending.value = false
  }
}

const loadDraft = async () => {
  try {
    const res = await getDraft({ id_client: id_client.value, noregister: props.noregister })
    const draft = res.response
    if (!draft) return

    draftId.value = draft.id_konsul
    isDraft.value = true
    draftSavedAt.value = draft.updated_at || draft.created_at || ''

    form.value.keluhan = draft.keluhan || ''
    form.value.riwayat_penyakit = draft.riwayat_penyakit || ''
    form.value.diagnosa = draft.diagnosa || ''
    form.value.pertanyaan = draft.pertanyaan || ''
    form.value.terapi_diberikan = draft.terapi_diberikan || ''
    form.value.waktu_jawab_target = draft.waktu_jawab_target || 'Sesuai jadwal'
    form.value.is_urgent =
      draft.is_urgent !== '' && draft.is_urgent !== null ? Number(draft.is_urgent) : null

    if (draft.vital_signs) {
      try {
        Object.assign(vitalSigns.value, JSON.parse(draft.vital_signs))
      } catch {}
    }

    if (draft.penunjang) {
      selectedPenunjang.value = draft.penunjang.split(',').filter(Boolean)
    }

    if (draft.dokter_tujuan) {
      const found = dokterList.value.find((d) => d.KDDOKTER === draft.dokter_tujuan)
      form.value.dokter_tujuan = found ?? {
        KDDOKTER: draft.dokter_tujuan,
        NAMADOKTER: draft.nama_dokter_tujuan || draft.dokter_tujuan,
        KODE_DOKTER_BPJS: draft.kode_dokter_bpjs || '',
      }
    }

    toast.add({
      severity: 'info',
      summary: 'Draft dimuat',
      detail: 'Form diisi dengan data draft terakhir yang tersimpan.',
      life: 3000,
    })
  } catch (e) {
    console.error('Gagal memuat draft:', e)
  }
}

const handleHapusDraft = async () => {
  if (!draftId.value) return
  isDeletingDraft.value = true
  try {
    await hapusDraft({ id_client: id_client.value, id_konsul: draftId.value })
    draftId.value = null
    isDraft.value = false
    draftSavedAt.value = ''
    form.value = {
      dokter_tujuan: null,
      is_urgent: null,
      keluhan: '',
      riwayat_penyakit: '',
      diagnosa: '',
      pertanyaan: '',
      terapi_diberikan: '',
      waktu_jawab_target: 'Sesuai jadwal',
    }
    vitalSigns.value = { td: '', nadi: '', rr: '', suhu: '', spo2: '', kesadaran: '' }
    selectedPenunjang.value = []
    lastVitalTime.value = ''
    lastKajianTime.value = ''
    toast.add({
      severity: 'success',
      summary: 'Draft dihapus',
      detail: 'Draft konsultasi berhasil dihapus. Form dikosongkan.',
      life: 3000,
    })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Gagal hapus draft', detail: e.message, life: 4000 })
  } finally {
    isDeletingDraft.value = false
  }
}

onMounted(async () => {
  await fetchDokterList()
  await loadDraft()
})
</script>

<style scoped>
/* ═══ Palette — sesuai PendaftaranPasienView + PrimeVue 4 ═══
   Hero:    linear-gradient(135deg, #2d1b69 0%, #11998e 100%)
   Primary: var(--p-primary-500, #3b82f6) / var(--p-primary-700, #1d4ed8)
   Card:    #fff / border #e9ecef / shadow rgba(0,0,0,0.06)
   Header:  #f8f9fa / color #495057
   Label:   #adb5bd / uppercase
   Value:   #343a40
   Dark:    #1e293b → #334155 (slate)
   Border:  #e9ecef / #dee2e6
   Text:    #212529 / #495057 / #6c757d
   Green:   #dcfce7 / #15803d
   Red:     #fee2e2 / #b91c1c
   ══════════════════════════════════════════════ */

/* ── Layout ── */
.kf-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  background: #f8f9fa;
  overflow: hidden;
}

/* ── Topbar (gradient purple → teal, sesuai hero PendaftaranPasienView) ── */
.kf-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.kf-back-btn {
  color: #fff !important;
  opacity: 0.85;
}
.kf-back-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15) !important;
}

.kf-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}
.kf-bc-link {
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-weight: 500;
}
.kf-bc-link:hover {
  color: #fff;
  text-decoration: underline;
}
.kf-bc-sep {
  font-size: 0.7rem;
  opacity: 0.5;
}
.kf-bc-current {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.kf-draft-tag {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 999px;
  padding: 3px 10px;
}

/* ── Draft Banner ── */
.kf-draft-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 12px;
}
.kf-draft-banner-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.kf-draft-banner-icon {
  font-size: 1.1rem;
  color: #d97706;
  flex-shrink: 0;
}
.kf-draft-banner-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #92400e;
}
.kf-draft-banner-time {
  font-size: 0.78rem;
  color: #b45309;
}
.kf-btn-hapus-draft {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}
.kf-btn-hapus-draft:hover:not(:disabled) {
  background: #fca5a5;
  border-color: #f87171;
}
.kf-btn-hapus-draft:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Body ── */
.kf-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Left Column ── */
.kf-col-left {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 14px 16px;
}

/* ── Pasien Banner — white card (sesuai pi-card + pi-identity) ── */
.kf-pasien-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.kf-pasien-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--p-primary-500, #3b82f6), var(--p-primary-700, #1d4ed8));
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kf-pasien-info {
  flex: 1;
  min-width: 0;
}
.kf-pasien-nama {
  font-size: 0.95rem;
  font-weight: 700;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}
.kf-pasien-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.kf-pasien-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #adb5bd;
  font-size: 0.75rem;
}
.kf-pasien-meta-lbl {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #adb5bd;
  font-weight: 600;
}
.kf-pasien-meta-val {
  font-size: 0.82rem;
  font-weight: 600;
  color: #495057;
}
.kf-pasien-meta-divider {
  width: 1px;
  height: 16px;
  background: #dee2e6;
}
.kf-lock-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 999px;
  padding: 3px 10px;
  flex-shrink: 0;
}

/* ── Section Card (sesuai pi-card) ── */
.kf-section {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.kf-section-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.82rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kf-section-body {
  padding: 14px 16px;
}

/* SOAP badge — sesuai primary PrimeVue */
.kf-soap-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--p-primary-500, #3b82f6), var(--p-primary-700, #1d4ed8));
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
}

/* ── Field & Label (sesuai pi-info-lbl) ── */
.kf-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 10px;
}
.kf-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
.kf-field:last-child {
  margin-bottom: 0;
}
.kf-field-mt {
  margin-top: 12px;
}
.kf-label-block {
  display: block;
  margin-bottom: 6px;
}

/* Sesuai pi-info-lbl PendaftaranPasienView */
.kf-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.kf-req {
  color: #b91c1c;
}
.kf-err {
  color: #b91c1c;
  font-size: 0.8rem;
}

.kf-readonly {
  background: #f8f9fa !important;
  cursor: not-allowed !important;
  color: #6c757d !important;
  border-color: #dee2e6 !important;
}

/* ── Urgensi toggle ── */
.kf-urgency-group {
  display: flex;
  gap: 8px;
}
.kf-urg-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 18px;
  border-radius: 999px;
  border: 1.5px solid #dee2e6;
  background: #fff;
  color: #495057;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.kf-urg-btn:hover.urg-off {
  border-color: var(--p-primary-400, #60a5fa);
  background: #eff6ff;
}
.urg-cito {
  border-color: #fca5a5 !important;
  background: #fee2e2 !important;
  color: #b91c1c !important;
}
.urg-elektif {
  border-color: #86efac !important;
  background: #dcfce7 !important;
  color: #15803d !important;
}

/* ── Vital Header (label + fetch button) ── */
.kf-vital-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.kf-btn-fetch-vital {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--p-primary-300, #93c5fd);
  background: #eff6ff;
  color: var(--p-primary-700, #1d4ed8);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.kf-btn-fetch-vital:hover:not(:disabled) {
  background: var(--p-primary-500, #3b82f6);
  border-color: var(--p-primary-500, #3b82f6);
  color: #fff;
}
.kf-btn-fetch-vital:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.kf-vital-source {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--p-primary-700, #1d4ed8);
  font-weight: 600;
  margin-bottom: 6px;
  padding: 3px 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  width: fit-content;
}

.kf-kajian-source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #15803d;
  font-weight: 600;
  padding: 5px 16px;
  background: #dcfce7;
  border-bottom: 1px solid #e9ecef;
}

/* ── Vital Signs Grid ── */
.kf-vital-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 10px;
}
.kf-vital-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.kf-vital-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #adb5bd;
}

/* ── Penunjang Chips (sesuai pd-chip) ── */
.kf-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.kf-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #dee2e6;
  background: #fff;
  color: #6c757d;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.kf-chip:hover {
  border-color: var(--p-primary-300, #93c5fd);
  background: #eff6ff;
  color: var(--p-primary-700, #1d4ed8);
}
.kf-chip.active {
  background: var(--p-primary-500, #3b82f6);
  border-color: var(--p-primary-500, #3b82f6);
  color: #fff;
}

/* ── Footer ── */
.kf-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 4px;
}

.kf-btn-kirim:hover {
  filter: brightness(1.08);
}

/* ── Right Column — light (sesuai tema PendaftaranPasienView) ── */
.kf-col-right {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 14px 12px;
  border-left: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Right Panel Card — white card (sesuai pi-card) */
.kf-rcard {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.kf-rcard-hd {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  background: #f8f9fa;
  color: #495057;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #e9ecef;
}

/* ── Status Tracker — PrimeVue Timeline (light) ── */
.kf-tl-wrap {
  padding: 14px 14px 10px;
}

/* Override PrimeVue Timeline connector */
.kf-tl :deep(.p-timeline-event-connector) {
  background: #e9ecef;
  width: 2px;
}

/* Dot marker */
.kf-tl-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
  transition: all 0.25s;
  border: 2px solid transparent;
}
.tl-dot-pending {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #adb5bd;
}
.tl-dot-current {
  background: #eff6ff;
  border-color: var(--p-primary-400, #60a5fa);
  color: var(--p-primary-600, #2563eb);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.tl-dot-done {
  background: var(--p-primary-500, #3b82f6);
  border-color: var(--p-primary-500, #3b82f6);
  color: #fff;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

/* Content beside dot */
.kf-tl-content {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 0;
  min-height: 30px;
}
.kf-tl-label {
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1;
}
.tl-lbl-pending {
  color: #adb5bd;
}
.tl-lbl-current {
  color: #212529;
  font-weight: 700;
}
.tl-lbl-done {
  color: var(--p-primary-600, #2563eb);
  font-weight: 600;
}

/* Status badges */
.kf-tl-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.kf-tl-badge-active {
  background: #eff6ff;
  color: var(--p-primary-700, #1d4ed8);
  border: 1px solid #bfdbfe;
  animation: badge-pulse 2s ease-in-out infinite;
}
.kf-tl-badge-done {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

@keyframes badge-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* ── Alur Dokter (light) ── */
.kf-flow {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.kf-flow-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.kf-flow-av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.88rem;
  font-weight: 700;
  flex-shrink: 0;
  color: #fff;
}
.kf-av-pengirim {
  background: linear-gradient(135deg, #2d1b69, #11998e);
}
.kf-av-konsultan-aktif {
  background: linear-gradient(135deg, var(--p-primary-500, #3b82f6), var(--p-primary-700, #1d4ed8));
  color: #fff !important;
}
.kf-av-konsultan-empty {
  background: #f1f5f9;
  border: 2px dashed #cbd5e1;
  color: #94a3b8 !important;
}
.kf-flow-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.kf-flow-role {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #adb5bd;
}
.kf-flow-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kf-muted {
  color: #adb5bd !important;
  font-weight: 400 !important;
  font-style: italic;
}

.kf-flow-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 18px;
  gap: 0;
}
.kf-connector-line {
  width: 1px;
  height: 8px;
  background: #dee2e6;
}
.kf-connector-icon {
  font-size: 0.75rem;
  color: #dee2e6;
}

/* ── Info Tip ── */
.kf-info-tip {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-left: 3px solid var(--p-primary-500, #3b82f6);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.82rem;
  color: #374151;
  line-height: 1.6;
}
.kf-info-tip p {
  margin: 0;
}
.kf-info-tip strong {
  color: var(--p-primary-700, #1d4ed8);
}
.kf-tip-icon {
  color: var(--p-primary-500, #3b82f6);
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .kf-row-2 {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .kf-body {
    flex-direction: column;
    overflow: auto;
  }
  .kf-col-right {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
  }
  .kf-vital-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .kf-col-left {
    overflow-y: unset;
  }
}
</style>
