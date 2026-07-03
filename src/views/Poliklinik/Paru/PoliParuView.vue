<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import PemeriksaanFisikParu from './PemeriksaanFisikParu.vue'

// ─── Props ────────────────────────────────────────────────────
const props = defineProps({
  datapasien: { type: Object, default: null },
})

// ─── Store & Utils ────────────────────────────────────────────
const configStore       = useConfigStore()
const authStore         = useAuthStore()
const toast             = useToast()
const apiUrl            = computed(() => configStore.apiBaseUrl)
const { id_client }     = storeToRefs(authStore)

// ─── State utama ──────────────────────────────────────────────
const loading      = ref(false)
const saving       = ref(false)
const lastSaved    = ref(null)
const fromPrevious = ref(null)
const pemfisData   = ref(null)
const pemfisRef    = ref(null)

// ─── State riwayat ────────────────────────────────────────────
const showRiwayat    = ref(false)
const loadingRiwayat = ref(false)
const riwayatList    = ref([])
const selectedIdx    = ref(0)

// ─── Konstanta label ──────────────────────────────────────────
const INSPEKSI_LABELS = {
  bentuk_dada:      'Bentuk Dada',
  pola_napas:       'Pola Napas',
  frekuensi_napas:  'Frekuensi Napas',
  retraksi:         'Retraksi',
  sianosis:         'Sianosis',
  clubbing_fingers: 'Clubbing Fingers',
}

const ZONE_LABELS_RW = {
  KA:  'Kanan Atas',   KT:  'Kanan Tengah', KB:  'Kanan Bawah',
  KiA: 'Kiri Atas',   KiT: 'Kiri Tengah',  KiB: 'Kiri Bawah',
}

// ─── Computed riwayat ─────────────────────────────────────────
const selectedVisit = computed(() => riwayatList.value[selectedIdx.value] ?? null)

const diffPaths = computed(() => {
  const curr = selectedVisit.value?.pemfis
  const prev = riwayatList.value[selectedIdx.value + 1]?.pemfis
  if (!curr || !prev) return new Set()

  const paths = new Set()

  for (const key of Object.keys(curr.inspeksi || {})) {
    const cv = String(curr.inspeksi[key] ?? '')
    const pv = String(prev.inspeksi?.[key] ?? '')
    if (cv !== pv) paths.add(`inspeksi.${key}`)
  }

  for (const tab of ['palpasi', 'perkusi', 'auskultasi']) {
    for (const zone of Object.keys(ZONE_LABELS_RW)) {
      const cz = curr[tab]?.[zone] || {}
      const pz = prev[tab]?.[zone] || {}
      for (const field of Object.keys(cz)) {
        const cv = Array.isArray(cz[field]) ? cz[field].join(',') : (cz[field] ?? '')
        const pv = Array.isArray(pz[field]) ? pz[field].join(',') : (pz[field] ?? '')
        if (cv !== pv) paths.add(`${tab}.${zone}.${field}`)
      }
    }
  }

  return paths
})

// ─── Load pemfis kunjungan ini ────────────────────────────────
async function loadData() {
  if (!props.datapasien?.NOPENDAFTARAN) return
  loading.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/index.php/api/poli_paru/get_pemfis`, {
      no_register: props.datapasien.NOPENDAFTARAN,
      nomr:        props.datapasien.NOMR,
      id_client:   id_client.value,
    })
    if (data?.success && data.pemfis) {
      pemfisData.value = data.pemfis
      fromPrevious.value = data.is_from_previous
        ? { no_register: data.prev_no_register, updated_at: data.prev_updated_at }
        : null
    }
  } catch {
    // Data belum ada — form kosong
  } finally {
    loading.value = false
  }
}

// ─── Simpan ───────────────────────────────────────────────────
async function simpanPemfis() {
  if (!props.datapasien?.NOPENDAFTARAN) return
  saving.value = true
  try {
    const payload = {
      no_register: props.datapasien.NOPENDAFTARAN,
      nomr:        props.datapasien.NOMR,
      pemfis:      pemfisRef.value?.getFormData() ?? pemfisData.value,
      id_client:   id_client.value,
    }
    const { data } = await axios.post(`${apiUrl.value}/index.php/api/poli_paru/simpan_pemfis`, payload)
    if (data?.success) {
      lastSaved.value  = { time: new Date() }
      fromPrevious.value = null
      riwayatList.value  = []   // reset cache riwayat agar reload saat dibuka lagi
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data pemeriksaan fisik paru tersimpan', life: 3000 })
    } else {
      throw new Error(data?.message || 'Respons tidak valid')
    }
  } catch (err) {
    toast.add({
      severity: 'error', summary: 'Gagal Simpan',
      detail: err?.response?.data?.message || err.message || 'Terjadi kesalahan sistem',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

// ─── Buka dialog riwayat ──────────────────────────────────────
async function bukaRiwayat() {
  showRiwayat.value = true
  if (riwayatList.value.length > 0) {
    // set seleksi ke kunjungan ini jika ada
    const idx = riwayatList.value.findIndex(r => r.no_register === props.datapasien?.NOPENDAFTARAN)
    selectedIdx.value = idx >= 0 ? idx : 0
    return
  }
  loadingRiwayat.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/index.php/api/poli_paru/get_riwayat_pemfis`, {
      nomr:      props.datapasien?.NOMR,
      id_client: id_client.value,
    })
    if (data?.success) {
      riwayatList.value = data.riwayat ?? []
      const idx = riwayatList.value.findIndex(r => r.no_register === props.datapasien?.NOPENDAFTARAN)
      selectedIdx.value = idx >= 0 ? idx : 0
    }
  } catch {
    //
  } finally {
    loadingRiwayat.value = false
  }
}

// ─── Helpers format ───────────────────────────────────────────
function formatWaktu(d) {
  if (!d) return ''
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatTanggal(dt) {
  if (!dt) return ''
  return new Date(dt.replace(' ', 'T')).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function valOrDash(v) {
  if (v === null || v === undefined || v === '') return '—'
  return v
}

onMounted(loadData)
</script>

<template>
  <Toast />
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

  <div class="paru-wrapper">

    <!-- ══ Banner: prefill dari kunjungan sebelumnya ══ -->
    <div v-if="fromPrevious && !lastSaved" class="prev-banner">
      <div class="prev-banner__icon"><i class="pi pi-history"></i></div>
      <div class="prev-banner__body">
        <span class="prev-banner__title">Data dari kunjungan sebelumnya</span>
        <span class="prev-banner__sub">
          No. Reg <strong>{{ fromPrevious.no_register }}</strong>
          &nbsp;·&nbsp; {{ fromPrevious.updated_at }}
          &nbsp;—&nbsp; Periksa kembali sebelum menyimpan
        </span>
      </div>
    </div>

    <!-- ══ Banner: tersimpan ══ -->
    <div v-if="lastSaved" class="saved-banner">
      <div class="saved-banner__icon"><i class="pi pi-check-circle"></i></div>
      <div class="saved-banner__body">
        <span class="saved-banner__title">Data telah disimpan</span>
        <span class="saved-banner__sub">
          Tersimpan pada <strong>{{ formatWaktu(lastSaved.time) }}</strong>
        </span>
      </div>
    </div>

    <!-- ══ Panel Utama ══ -->
    <Panel>
      <template #header>
        <div class="sec-hdr">
          <div class="sec-hdr__icon sky"><i class="pi pi-heart-fill"></i></div>
          <div>
            <div class="sec-hdr__title">PEMERIKSAAN FISIK PARU</div>
            <div class="sec-hdr__sub">Inspeksi · Palpasi · Perkusi · Auskultasi</div>
          </div>
        </div>
      </template>
      <template #icons>
        <div class="header-actions">
          <Button
            label="Riwayat"
            icon="pi pi-clock-rotate-left"
            size="small"
            severity="secondary"
            outlined
            :disabled="loading || !props.datapasien?.NOMR"
            @click="bukaRiwayat"
          />
          <Button
            label="Simpan"
            icon="pi pi-save"
            size="small"
            :loading="saving"
            :disabled="loading"
            @click="simpanPemfis"
          />
        </div>
      </template>

      <PemeriksaanFisikParu ref="pemfisRef" v-model="pemfisData" />
    </Panel>

    <!-- ══ Dialog Riwayat ══ -->
    <Dialog
      v-model:visible="showRiwayat"
      header="Riwayat Pemeriksaan Fisik Paru"
      :style="{ width: '980px', maxWidth: '96vw' }"
      :modal="true"
      :draggable="false"
      :dismissable-mask="true"
    >
      <div class="rw-layout">

        <!-- ─── Sidebar: daftar kunjungan ─── -->
        <div class="rw-sidebar">
          <div class="rw-sidebar__title">KUNJUNGAN</div>

          <div v-if="loadingRiwayat" class="rw-loading">
            <i class="pi pi-spin pi-spinner"></i> Memuat...
          </div>

          <div v-else-if="riwayatList.length === 0" class="rw-empty">
            <i class="pi pi-inbox" style="font-size:1.5rem;opacity:.4"></i>
            <p>Belum ada riwayat</p>
          </div>

          <div v-else class="rw-visit-list">
            <div
              v-for="(item, idx) in riwayatList"
              :key="item.no_register"
              :class="['rw-visit', { 'rw-visit--active': selectedIdx === idx }]"
              @click="selectedIdx = idx"
            >
              <div class="rw-visit__timeline">
                <div class="rw-visit__dot"></div>
                <div v-if="idx < riwayatList.length - 1" class="rw-visit__line"></div>
              </div>
              <div class="rw-visit__body">
                <div class="rw-visit__date">{{ formatTanggal(item.updated_at) }}</div>
                <div class="rw-visit__reg">{{ item.no_register }}</div>
                <span
                  v-if="item.no_register === props.datapasien?.NOPENDAFTARAN"
                  class="rw-visit__badge"
                >Kunjungan ini</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Detail kunjungan ─── -->
        <div class="rw-detail" v-if="selectedVisit">

          <!-- Header detail -->
          <div class="rw-detail-header">
            <div>
              <div class="rw-detail-header__reg">{{ selectedVisit.no_register }}</div>
              <div class="rw-detail-header__date">{{ formatTanggal(selectedVisit.updated_at) }}</div>
            </div>
            <div v-if="diffPaths.size > 0" class="rw-diff-badge">
              <i class="pi pi-arrow-right-arrow-left"></i>
              {{ diffPaths.size }} perubahan dari kunjungan sebelumnya
            </div>
            <div v-else-if="selectedIdx < riwayatList.length - 1" class="rw-same-badge">
              <i class="pi pi-check"></i> Tidak ada perubahan
            </div>
          </div>

          <!-- Legend -->
          <div v-if="selectedIdx < riwayatList.length - 1" class="rw-legend">
            <span class="rw-leg rw-leg--changed"><span class="rw-leg__dot"></span>Berubah</span>
            <span class="rw-leg rw-leg--same"><span class="rw-leg__dot"></span>Tidak berubah</span>
          </div>

          <!-- Scrollable content -->
          <div class="rw-scroll">

            <!-- INSPEKSI -->
            <div class="rw-section">
              <div class="rw-section__title"><i class="pi pi-eye"></i> Inspeksi</div>
              <div class="rw-ins-grid">
                <template v-for="(label, key) in INSPEKSI_LABELS" :key="key">
                  <div :class="['rw-ins-label', { 'rw-cell--changed': diffPaths.has(`inspeksi.${key}`) }]">
                    {{ label }}
                  </div>
                  <div :class="['rw-ins-value', { 'rw-cell--changed': diffPaths.has(`inspeksi.${key}`) }]">
                    {{ valOrDash(selectedVisit.pemfis?.inspeksi?.[key]) }}
                    <span v-if="key === 'frekuensi_napas' && selectedVisit.pemfis?.inspeksi?.[key]" class="rw-unit">x/mnt</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- PALPASI -->
            <div class="rw-section">
              <div class="rw-section__title"><i class="pi pi-hand"></i> Palpasi</div>
              <table class="rw-table">
                <thead>
                  <tr><th>Zona</th><th>Fremitus</th><th>Nyeri Tekan</th><th>Catatan</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(label, zone) in ZONE_LABELS_RW" :key="zone">
                    <td class="rw-zone-lbl">{{ label }}</td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`palpasi.${zone}.fremitus`) }">
                      {{ valOrDash(selectedVisit.pemfis?.palpasi?.[zone]?.fremitus) }}
                    </td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`palpasi.${zone}.nyeri_tekan`) }">
                      {{ valOrDash(selectedVisit.pemfis?.palpasi?.[zone]?.nyeri_tekan) }}
                    </td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`palpasi.${zone}.catatan`) }">
                      {{ valOrDash(selectedVisit.pemfis?.palpasi?.[zone]?.catatan) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PERKUSI -->
            <div class="rw-section">
              <div class="rw-section__title"><i class="pi pi-bolt"></i> Perkusi</div>
              <table class="rw-table">
                <thead>
                  <tr><th>Zona</th><th>Hasil</th><th>Catatan</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(label, zone) in ZONE_LABELS_RW" :key="zone">
                    <td class="rw-zone-lbl">{{ label }}</td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`perkusi.${zone}.hasil`) }">
                      {{ valOrDash(selectedVisit.pemfis?.perkusi?.[zone]?.hasil) }}
                    </td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`perkusi.${zone}.catatan`) }">
                      {{ valOrDash(selectedVisit.pemfis?.perkusi?.[zone]?.catatan) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- AUSKULTASI -->
            <div class="rw-section">
              <div class="rw-section__title"><i class="pi pi-volume-up"></i> Auskultasi</div>
              <table class="rw-table">
                <thead>
                  <tr><th>Zona</th><th>Suara Dasar</th><th>Suara Tambahan</th><th>Catatan</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(label, zone) in ZONE_LABELS_RW" :key="zone">
                    <td class="rw-zone-lbl">{{ label }}</td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`auskultasi.${zone}.suara_dasar`) }">
                      {{ valOrDash(selectedVisit.pemfis?.auskultasi?.[zone]?.suara_dasar) }}
                    </td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`auskultasi.${zone}.suara_tambahan`) }">
                      {{ (selectedVisit.pemfis?.auskultasi?.[zone]?.suara_tambahan || []).join(', ') || '—' }}
                    </td>
                    <td :class="{ 'rw-cell--changed': diffPaths.has(`auskultasi.${zone}.catatan`) }">
                      {{ valOrDash(selectedVisit.pemfis?.auskultasi?.[zone]?.catatan) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div><!-- /rw-scroll -->
        </div><!-- /rw-detail -->

        <div v-else-if="!loadingRiwayat" class="rw-detail rw-detail--empty">
          <i class="pi pi-inbox" style="font-size:2rem;opacity:.3"></i>
          <p>Pilih kunjungan untuk melihat detail</p>
        </div>

      </div><!-- /rw-layout -->
    </Dialog>

  </div>
</template>

<style scoped>
/* ══ Base ══ */
.paru-wrapper { display: flex; flex-direction: column; gap: 10px; }

/* ══ Panel overrides ══ */
:deep(.p-panel-header) { padding: 10px 16px; background: #f8fafc; }
:deep(.p-panel-content) { padding: 16px; }

/* ══ Section header ══ */
.sec-hdr { display: flex; align-items: center; gap: 10px; }
.sec-hdr__icon {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.sec-hdr__icon.sky { background: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; }
.sec-hdr__title { font-size: 12px; font-weight: 700; color: #1e293b; letter-spacing: .4px; text-transform: uppercase; }
.sec-hdr__sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }

/* ══ Header actions ══ */
.header-actions { display: flex; align-items: center; gap: 8px; }

/* ══ Previous banner ══ */
.prev-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 8px;
}
.prev-banner__icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #fef3c7; border: 1px solid #fde68a;
  display: flex; align-items: center; justify-content: center;
  color: #d97706; font-size: 15px; flex-shrink: 0;
}
.prev-banner__body { display: flex; flex-direction: column; gap: 2px; }
.prev-banner__title { font-size: 13px; font-weight: 700; color: #92400e; }
.prev-banner__sub { font-size: 12px; color: #b45309; line-height: 1.4; }

/* ══ Saved banner ══ */
.saved-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0; border-left: 4px solid #22c55e; border-radius: 8px;
}
.saved-banner__icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #dcfce7; border: 1px solid #bbf7d0;
  display: flex; align-items: center; justify-content: center;
  color: #16a34a; font-size: 15px; flex-shrink: 0;
}
.saved-banner__body { display: flex; flex-direction: column; gap: 2px; }
.saved-banner__title { font-size: 13px; font-weight: 700; color: #166534; }
.saved-banner__sub { font-size: 12px; color: #15803d; line-height: 1.4; }

/* ══════════════════════════════════════════════
   DIALOG RIWAYAT
══════════════════════════════════════════════ */
.rw-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0;
  height: 560px;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* ── Sidebar ── */
.rw-sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rw-sidebar__title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .6px;
  color: #94a3b8;
  padding: 12px 14px 8px;
}
.rw-loading, .rw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  color: #94a3b8;
  font-size: 12px;
}
.rw-visit-list { overflow-y: auto; flex: 1; padding: 4px 0 8px; }

.rw-visit {
  display: flex;
  gap: 0;
  padding: 0 10px;
  cursor: pointer;
  border-radius: 0;
  transition: background .12s;
}
.rw-visit:hover { background: #f1f5f9; }
.rw-visit--active { background: #eff6ff; }
.rw-visit--active .rw-visit__reg { color: #1d4ed8; }
.rw-visit--active .rw-visit__dot { background: #1d4ed8; border-color: #1d4ed8; }

.rw-visit__timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
  padding-top: 12px;
}
.rw-visit__dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid #cbd5e1;
  flex-shrink: 0;
}
.rw-visit__line {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: #e2e8f0;
  margin-top: 3px;
}

.rw-visit__body {
  padding: 10px 6px 10px 6px;
  min-width: 0;
}
.rw-visit__date { font-size: 11px; color: #64748b; }
.rw-visit__reg  { font-size: 12px; font-weight: 600; color: #334155; margin-top: 1px; word-break: break-all; }
.rw-visit__badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 9999px;
  background: #dbeafe;
  color: #1d4ed8;
  margin-top: 3px;
}

/* ── Detail ── */
.rw-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 0.82rem;
}
.rw-detail--empty {
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
}

.rw-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  flex-shrink: 0;
}
.rw-detail-header__reg  { font-size: 14px; font-weight: 700; color: #1e293b; }
.rw-detail-header__date { font-size: 11px; color: #64748b; margin-top: 1px; }

.rw-diff-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 9999px;
  color: #92400e;
}
.rw-same-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 9999px;
  color: #166534;
}

/* Legend */
.rw-legend {
  display: flex;
  gap: 14px;
  padding: 6px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.rw-leg { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748b; }
.rw-leg__dot { width: 10px; height: 10px; border-radius: 3px; }
.rw-leg--changed .rw-leg__dot { background: #fef08a; border: 1px solid #ca8a04; }
.rw-leg--same    .rw-leg__dot { background: #f1f5f9; border: 1px solid #cbd5e1; }

/* Scroll area */
.rw-scroll {
  overflow-y: auto;
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── Section ── */
.rw-section {}
.rw-section__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: #475569;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Inspeksi grid */
.rw-ins-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.rw-ins-label, .rw-ins-value {
  padding: 6px 10px;
  font-size: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.rw-ins-label { background: #f8fafc; color: #64748b; font-weight: 500; }
.rw-ins-value { color: #1e293b; }
.rw-ins-label:last-of-type, .rw-ins-value:last-of-type { border-bottom: none; }

/* Table */
.rw-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}
.rw-table thead tr { background: #f8fafc; }
.rw-table th {
  text-align: left;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}
.rw-table td {
  padding: 6px 10px;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}
.rw-table tbody tr:last-child td { border-bottom: none; }
.rw-table tbody tr:hover { background: #f8fafc; }

.rw-zone-lbl { font-weight: 600; color: #475569; white-space: nowrap; }

/* Changed highlight */
.rw-cell--changed {
  background: #fef9c3 !important;
  color: #713f12 !important;
  font-weight: 600;
}

.rw-unit { color: #94a3b8; font-size: 10px; margin-left: 2px; }

/* ── Responsive ── */
@media (max-width: 680px) {
  .rw-layout { grid-template-columns: 1fr; height: auto; }
  .rw-sidebar { max-height: 180px; border-right: none; border-bottom: 1px solid #e2e8f0; }
}
</style>
