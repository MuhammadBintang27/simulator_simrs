<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import EchoKardiografiComponent from './EchoKardiografiComponent.vue'

const props = defineProps({ datapasien: { type: Object, default: null } })

const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const apiUrl = computed(() => configStore.apiBaseUrl)
const { id_client } = storeToRefs(authStore)

const loading = ref(false)
const saving = ref(false)
const lastSaved = ref(null)
const fromPrevious = ref(null)
const echoData = ref(null)
const echoRef = ref(null)

const showRiwayat = ref(false)
const loadingRiwayat = ref(false)
const riwayatList = ref([])
const selectedIdx = ref(0)

const selectedVisit = computed(() => riwayatList.value[selectedIdx.value] ?? null)

// ─── Ringkasan untuk riwayat ──────────────────────────────────────
const KATUP_LABEL = {
  'Tidak Ada': null,
  Trace: 'trace',
  Ringan: 'mild',
  Sedang: 'moderate',
  Berat: 'severe',
}

function ringkasanEcho(echo) {
  if (!echo) return []
  const parts = []
  if (echo.ef_simpson != null) parts.push(`EF ${echo.ef_simpson}%`)
  if (echo.grading_dias) parts.push(echo.grading_dias.split(' — ')[0] || echo.grading_dias)
  if (echo.mr_grade && echo.mr_grade !== 'Tidak Ada') parts.push(`MR ${echo.mr_grade}`)
  if (echo.ar_grade && echo.ar_grade !== 'Tidak Ada') parts.push(`AR ${echo.ar_grade}`)
  if (echo.efusi && echo.efusi !== 'Tidak Ada') parts.push(`Efusi ${echo.efusi}`)
  if (echo.tapse != null) parts.push(`TAPSE ${echo.tapse} mm`)
  return parts
}

async function loadData() {
  if (!props.datapasien?.NOPENDAFTARAN) return
  loading.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/index.php/api/poli_jantung/get_echo`, {
      no_register: props.datapasien.NOPENDAFTARAN,
      nomr: props.datapasien.NOMR,
      id_client: id_client.value,
    })
    if (data?.success && data.echo) {
      echoData.value = data.echo
      fromPrevious.value = data.is_from_previous
        ? { no_register: data.prev_no_register, updated_at: data.prev_updated_at }
        : null
    }
  } catch {
    //
  } finally {
    loading.value = false
  }
}

async function simpanEcho() {
  if (!props.datapasien?.NOPENDAFTARAN) return
  saving.value = true
  try {
    const payload = {
      no_register: props.datapasien.NOPENDAFTARAN,
      nomr: props.datapasien.NOMR,
      echo: echoRef.value?.getFormData() ?? echoData.value,
      id_client: id_client.value,
    }
    const { data } = await axios.post(
      `${apiUrl.value}/index.php/api/poli_jantung/simpan_echo`,
      payload,
    )
    console.log('RESP SIMPAN ECHO', data)
    if (data?.success) {
      lastSaved.value = { time: new Date() }
      fromPrevious.value = null
      riwayatList.value = []
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data echo kardiografi tersimpan',
        life: 3000,
      })
    } else {
      throw new Error(data?.message || 'Respons tidak valid')
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Gagal Simpan',
      detail: err?.response?.data?.message || err.message || 'Terjadi kesalahan',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

async function bukaRiwayat() {
  showRiwayat.value = true
  if (riwayatList.value.length > 0) {
    const idx = riwayatList.value.findIndex(
      (r) => r.no_register === props.datapasien?.NOPENDAFTARAN,
    )
    selectedIdx.value = idx >= 0 ? idx : 0
    return
  }
  loadingRiwayat.value = true
  try {
    const { data } = await axios.post(
      `${apiUrl.value}/index.php/api/poli_jantung/get_riwayat_echo`,
      {
        nomr: props.datapasien?.NOMR,
        id_client: id_client.value,
      },
    )
    if (data?.success) {
      riwayatList.value = data.riwayat ?? []
      const idx = riwayatList.value.findIndex(
        (r) => r.no_register === props.datapasien?.NOPENDAFTARAN,
      )
      selectedIdx.value = idx >= 0 ? idx : 0
    }
  } catch {
    //
  } finally {
    loadingRiwayat.value = false
  }
}

function formatWaktu(d) {
  return d ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
}
function formatTanggal(s) {
  return s
    ? new Date(s.replace(' ', 'T')).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''
}

onMounted(loadData)
</script>

<template>
  <Toast />
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

  <div class="jtg-wrapper">
    <!-- ══ Banner: data dari kunjungan sebelumnya ══ -->
    <div v-if="fromPrevious && !lastSaved" class="prev-banner">
      <div class="prev-banner__icon"><i class="pi pi-history"></i></div>
      <div class="prev-banner__body">
        <span class="prev-banner__title">Data dari kunjungan sebelumnya</span>
        <span class="prev-banner__sub">
          No. Reg <strong>{{ fromPrevious.no_register }}</strong> &nbsp;·&nbsp;
          {{ fromPrevious.updated_at }}
          &nbsp;— Periksa kembali sebelum menyimpan
        </span>
      </div>
    </div>

    <!-- ══ Banner: tersimpan ══ -->
    <div v-if="lastSaved" class="saved-banner">
      <div class="saved-banner__icon"><i class="pi pi-check-circle"></i></div>
      <div class="saved-banner__body">
        <span class="saved-banner__title">Data echo kardiografi telah disimpan</span>
        <span class="saved-banner__sub"
          >Tersimpan pukul <strong>{{ formatWaktu(lastSaved.time) }}</strong></span
        >
      </div>
    </div>

    <!-- ══ Panel utama ══ -->
    <Panel>
      <template #header>
        <div class="sec-hdr">
          <div class="sec-hdr__icon"><i class="pi pi-wave-pulse"></i></div>
          <div>
            <div class="sec-hdr__title">EKOKARDIOGRAFI — POLI JANTUNG</div>
            <div class="sec-hdr__sub">Pemeriksaan Echo · Bullseye 17 Segmen · Wall Motion</div>
          </div>
        </div>
      </template>
      <template #icons>
        <div class="hdr-actions">
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
            label="Simpan Echo"
            icon="pi pi-save"
            size="small"
            :loading="saving"
            :disabled="loading"
            @click="simpanEcho"
          />
        </div>
      </template>

      <EchoKardiografiComponent ref="echoRef" v-model="echoData" />
    </Panel>

    <!-- ══ Dialog Riwayat ══ -->
    <Dialog
      v-model:visible="showRiwayat"
      header="Riwayat Pemeriksaan Echo Kardiografi"
      :style="{ width: '1000px', maxWidth: '96vw' }"
      :modal="true"
      :draggable="false"
      :dismissable-mask="true"
    >
      <div class="rw-layout">
        <!-- Sidebar kunjungan -->
        <div class="rw-sidebar">
          <div class="rw-sidebar__title">KUNJUNGAN</div>
          <div v-if="loadingRiwayat" class="rw-loading">
            <i class="pi pi-spin pi-spinner"></i> Memuat...
          </div>
          <div v-else-if="!riwayatList.length" class="rw-empty">
            <i class="pi pi-inbox" style="font-size: 1.5rem; opacity: 0.4"></i>
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
                  >Kunjungan ini</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Detail kunjungan -->
        <div class="rw-detail" v-if="selectedVisit">
          <div class="rw-detail-header">
            <div>
              <div class="rw-detail-header__reg">{{ selectedVisit.no_register }}</div>
              <div class="rw-detail-header__date">
                {{ formatTanggal(selectedVisit.updated_at) }}
              </div>
            </div>
            <div class="rw-ef-tag" v-if="selectedVisit.echo?.ef_simpson != null">
              EF: <strong>{{ selectedVisit.echo.ef_simpson }}%</strong>
              <span
                :class="
                  selectedVisit.echo.ef_simpson >= 55
                    ? 'ef-ok'
                    : selectedVisit.echo.ef_simpson >= 40
                      ? 'ef-border'
                      : 'ef-low'
                "
              >
                {{
                  selectedVisit.echo.ef_simpson >= 55
                    ? 'Normal'
                    : selectedVisit.echo.ef_simpson >= 40
                      ? 'Borderline'
                      : 'Disfungsi'
                }}
              </span>
            </div>
          </div>
          <div class="rw-scroll">
            <!-- Tags ringkasan -->
            <div class="rw-summary-tags">
              <span v-for="t in ringkasanEcho(selectedVisit.echo)" :key="t" class="rw-tag">{{
                t
              }}</span>
            </div>

            <!-- Dimensi LV -->
            <div class="rw-section">
              <div class="rw-section__title">
                <i class="pi pi-chart-bar"></i> Dimensi & Fungsi LV
              </div>
              <table class="rw-table">
                <tbody>
                  <tr>
                    <td class="rw-lbl">LVEDD / LVESD</td>
                    <td>
                      {{ selectedVisit.echo?.lvedd ?? '—' }} /
                      {{ selectedVisit.echo?.lvesd ?? '—' }} mm
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">IVSd / LVPWd</td>
                    <td>
                      {{ selectedVisit.echo?.ivsd ?? '—' }} /
                      {{ selectedVisit.echo?.lvpwd ?? '—' }} mm
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">LVEDV / LVESV</td>
                    <td>
                      {{ selectedVisit.echo?.lvedv ?? '—' }} /
                      {{ selectedVisit.echo?.lvesv ?? '—' }} mL
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">EF Simpson</td>
                    <td>
                      <strong>{{ selectedVisit.echo?.ef_simpson ?? '—' }} %</strong>
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">FS</td>
                    <td>{{ selectedVisit.echo?.fs ?? '—' }} %</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Diastolik -->
            <div class="rw-section">
              <div class="rw-section__title"><i class="pi pi-wave-pulse"></i> Fungsi Diastolik</div>
              <table class="rw-table">
                <tbody>
                  <tr>
                    <td class="rw-lbl">E / A</td>
                    <td>
                      {{ selectedVisit.echo?.e_vel ?? '—' }} /
                      {{ selectedVisit.echo?.a_vel ?? '—' }} cm/s (E/A:
                      {{ selectedVisit.echo?.e_a_ratio ?? '—' }})
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">DT / IVRT</td>
                    <td>
                      {{ selectedVisit.echo?.dt ?? '—' }} / {{ selectedVisit.echo?.ivrt ?? '—' }} ms
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">E/E'</td>
                    <td>{{ selectedVisit.echo?.e_e_prime ?? '—' }}</td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">Grading</td>
                    <td>{{ selectedVisit.echo?.grading_dias ?? '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Katup -->
            <div class="rw-section">
              <div class="rw-section__title"><i class="pi pi-circle-fill"></i> Katup</div>
              <table class="rw-table">
                <tbody>
                  <tr>
                    <td class="rw-lbl">MR / AR</td>
                    <td>
                      {{ selectedVisit.echo?.mr_grade ?? '—' }} /
                      {{ selectedVisit.echo?.ar_grade ?? '—' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">TR / PR</td>
                    <td>
                      {{ selectedVisit.echo?.tr_grade ?? '—' }} /
                      {{ selectedVisit.echo?.pr_grade ?? '—' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="rw-lbl">PASP</td>
                    <td>{{ selectedVisit.echo?.pasp ?? '—' }} mmHg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Kesan -->
            <div class="rw-section" v-if="selectedVisit.echo?.kesan">
              <div class="rw-section__title"><i class="pi pi-file-edit"></i> Kesan</div>
              <div class="rw-kesan">{{ selectedVisit.echo.kesan }}</div>
            </div>
          </div>
        </div>

        <div v-else-if="!loadingRiwayat" class="rw-detail rw-detail--empty">
          <i class="pi pi-inbox" style="font-size: 2rem; opacity: 0.3"></i>
          <p>Pilih kunjungan untuk melihat detail</p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.jtg-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.p-panel-header) {
  padding: 10px 16px;
  background: #f8fafc;
}
:deep(.p-panel-content) {
  padding: 14px;
}

.sec-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sec-hdr__icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}
.sec-hdr__title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.sec-hdr__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.hdr-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Banners */
.prev-banner,
.saved-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
}
.prev-banner {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
}
.saved-banner {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #bbf7d0;
  border-left: 4px solid #22c55e;
}
.prev-banner__icon,
.saved-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.prev-banner__icon {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #d97706;
}
.saved-banner__icon {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}
.prev-banner__body,
.saved-banner__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prev-banner__title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
}
.prev-banner__sub {
  font-size: 12px;
  color: #b45309;
  line-height: 1.4;
}
.saved-banner__title {
  font-size: 13px;
  font-weight: 700;
  color: #166534;
}
.saved-banner__sub {
  font-size: 12px;
  color: #15803d;
}

/* Dialog Riwayat */
.rw-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0;
  height: 520px;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
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
  letter-spacing: 0.6px;
  color: #94a3b8;
  padding: 12px 14px 8px;
}
.rw-loading,
.rw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  color: #94a3b8;
  font-size: 12px;
}
.rw-visit-list {
  overflow-y: auto;
  flex: 1;
  padding: 4px 0 8px;
}
.rw-visit {
  display: flex;
  padding: 0 10px;
  cursor: pointer;
  transition: background 0.12s;
}
.rw-visit:hover {
  background: #f1f5f9;
}
.rw-visit--active {
  background: #eff6ff;
}
.rw-visit--active .rw-visit__reg {
  color: #1d4ed8;
}
.rw-visit--active .rw-visit__dot {
  background: #1d4ed8;
  border-color: #1d4ed8;
}
.rw-visit__timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  padding-top: 12px;
  flex-shrink: 0;
}
.rw-visit__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid #cbd5e1;
}
.rw-visit__line {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: #e2e8f0;
  margin-top: 3px;
}
.rw-visit__body {
  padding: 10px 6px;
  min-width: 0;
}
.rw-visit__date {
  font-size: 11px;
  color: #64748b;
}
.rw-visit__reg {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  word-break: break-all;
}
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
.rw-detail-header__reg {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.rw-detail-header__date {
  font-size: 11px;
  color: #64748b;
}
.rw-ef-tag {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 9999px;
  color: #0369a1;
}
.ef-ok {
  color: #16a34a;
}
.ef-border {
  color: #b45309;
}
.ef-low {
  color: #b91c1c;
}

.rw-scroll {
  overflow-y: auto;
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.rw-summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rw-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
}

.rw-section {
}
.rw-section__title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #475569;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.rw-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}
.rw-table td {
  padding: 5px 10px;
  border-bottom: 1px solid #f1f5f9;
}
.rw-table tr:last-child td {
  border-bottom: none;
}
.rw-lbl {
  font-weight: 600;
  color: #64748b;
  width: 140px;
  background: #f8fafc;
}
.rw-kesan {
  font-size: 12px;
  color: #334155;
  line-height: 1.6;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px 12px;
}

@media (max-width: 640px) {
  .rw-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
  .rw-sidebar {
    max-height: 160px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
