<template>
  <div class="subrad-wrap">
    <!-- Toolbar -->
    <div class="subrad-toolbar">
      <div class="subrad-toolbar-left">
        <i class="pi pi-folder-open subrad-icon"></i>
        <span class="subrad-title">RIWAYAT RADIOLOGI PASIEN</span>
        <Tag
          v-if="records.length"
          :value="`${records.length} pemeriksaan`"
          severity="secondary"
          class="subrad-count"
        />
      </div>
      <Button
        icon="pi pi-refresh"
        text
        rounded
        size="small"
        severity="secondary"
        :loading="loading"
        v-tooltip.left="'Muat ulang'"
        @click="fetchData"
      />
    </div>

    <!-- Loading bar -->
    <ProgressBar v-if="loading && records.length === 0" mode="indeterminate" style="height: 3px" />

    <!-- Empty state -->
    <div v-if="!loading && records.length === 0" class="subrad-empty">
      <i class="pi pi-folder-open subrad-empty-icon"></i>
      <p class="subrad-empty-text">Belum ada riwayat radiologi</p>
      <small class="subrad-empty-sub">Data akan muncul setelah ada pemeriksaan radiologi</small>
    </div>

    <!-- Folder list -->
    <div class="subrad-list">
      <div
        v-for="(rec, idx) in records"
        :key="idx"
        class="subrad-folder"
        :class="{ 'subrad-folder--open': expandedIdx === idx }"
      >
        <!-- Folder header (klik untuk expand) -->
        <div class="subrad-folder-hdr" @click="toggleFolder(idx, rec.TRANS)">
          <div class="subrad-folder-icon-wrap">
            <i
              :class="expandedIdx === idx ? 'pi pi-folder-open' : 'pi pi-folder'"
              class="subrad-folder-ico"
            ></i>
          </div>

          <div class="subrad-folder-info">
            <div class="subrad-folder-name">{{ rec.NAMA }}</div>
            <div class="subrad-folder-meta">
              <span class="subrad-meta-date">
                <i class="pi pi-calendar"></i>
                {{ formatDate(rec.TANGGAL) }}
              </span>
              <span class="subrad-meta-sep">·</span>
              <span class="subrad-meta-dpjp">{{ rec.DPJP || '—' }}</span>
              <span class="subrad-meta-sep">·</span>
              <span class="subrad-meta-poli">{{ rec.POLI_RUANG || '—' }}</span>
            </div>
          </div>

          <div class="subrad-folder-right">
            <span :class="['subrad-status', getStatusClass(rec.STATUS_PROGRESS)]">
              <span class="subrad-status-dot"></span>
              {{ rec.STATUS_PROGRESS || '—' }}
            </span>
            <i
              :class="expandedIdx === idx ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
              class="subrad-chevron"
            ></i>
          </div>
        </div>

        <!-- Folder body (detail) -->
        <Transition name="subrad-slide">
          <div v-if="expandedIdx === idx" class="subrad-folder-body">
            <!-- loading detail -->
            <div v-if="loadingDetail" class="subrad-detail-loading">
              <ProgressBar mode="indeterminate" style="height: 2px; border-radius: 0; margin: 0" />
              <div class="subrad-detail-loading-text">
                <i class="pi pi-spin pi-spinner"></i> Memuat detail…
              </div>
            </div>

            <!-- detail content -->
            <div v-if="detail && !loadingDetail" class="subrad-detail-content">
              <!-- Patient banner -->
              <div v-if="detail.pasien" class="subrad-patient-banner">
                <div class="subrad-patient-avatar">
                  {{ detail.pasien.NAMA?.charAt(0) || 'P' }}
                </div>
                <div class="subrad-patient-info">
                  <div class="subrad-patient-name">{{ detail.pasien.NAMA }}</div>
                  <div class="subrad-patient-chips">
                    <span class="subrad-chip">{{ detail.pasien.NOMR }}</span>
                    <span class="subrad-chip">{{ detail.pasien.JENISKELAMIN }}</span>
                    <span class="subrad-chip">{{ detail.pasien.USIA }} Tahun</span>
                  </div>
                </div>
                <div class="subrad-patient-doctor">
                  <div class="subrad-patient-doctor-label">Dokter Pemeriksa</div>
                  <div class="subrad-patient-doctor-name">{{ detail.pasien.DPJP }}</div>
                  <div class="subrad-patient-doctor-unit">{{ detail.pasien.POLI_RUANG }}</div>
                </div>
              </div>

              <!-- Result items -->
              <div v-for="(item, i) in detail.response" :key="i" class="subrad-result">
                <div class="subrad-result-header">
                  <span class="subrad-result-num">{{ String(i + 1).padStart(2, '0') }}</span>
                  <div class="subrad-result-title">
                    <div class="subrad-result-name">{{ item.NAMA }}</div>
                    <div class="subrad-result-date">Permintaan: {{ item.TANGGAL_REQ }}</div>
                  </div>
                  <Tag
                    :value="item.STATUS_PROGRESS || 'Proses'"
                    :severity="
                      item.STATUS_PROGRESS?.toLowerCase().includes('c') ? 'success' : 'warn'
                    "
                    style="font-size: 10px; margin-left: auto"
                  />
                </div>

                <!-- Ekspertise -->
                <div class="subrad-expertise">
                  <div class="subrad-expertise-label">
                    <i class="pi pi-book"></i>
                    Ekspertise / Hasil Bacaan
                  </div>
                  <div
                    class="subrad-expertise-content"
                    v-html="
                      item.HASIL_BACA ||
                      '<em style=\'color:#9ca3af\'>Hasil bacaan belum tersedia.</em>'
                    "
                  ></div>
                </div>

                <!-- Attachments -->
                <div v-if="item.attachment?.length" class="subrad-attachments">
                  <div class="subrad-attachments-label">
                    <i class="pi pi-images"></i>
                    Lampiran Citra Medis ({{ item.attachment.length }})
                  </div>
                  <div class="subrad-attachments-grid">
                    <div v-for="img in item.attachment" :key="img.id" class="subrad-img-card">
                      <div class="subrad-img-frame">
                        <Image
                          :src="img.link_img"
                          alt="Radiology"
                          preview
                          imageStyle="width:100%;height:100%;object-fit:cover;cursor:pointer;"
                        />
                      </div>
                      <div class="subrad-img-caption">{{ img.caption_file }}</div>
                    </div>
                  </div>
                </div>

                <div v-else class="subrad-no-attachment">
                  <i class="pi pi-image"></i>
                  <span>Tidak ada lampiran gambar</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import axios from 'axios'

import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Image from 'primevue/image'

const props = defineProps({
  datapasien: { type: Object, required: true, validator: (v) => v && typeof v === 'object' },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const loadingDetail = ref(false)
const records = ref([])
const expandedIdx = ref(null)
const detail = ref(null)

const fetchData = async () => {
  try {
    loading.value = true
    expandedIdx.value = null
    detail.value = null
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/get_data_penunjang_pasien_v2/`,
      {
        id_client: id_client.value,
        user_id: user_id.value,
        nomr: props.datapasien?.NOMR,
        kategori: 'RADIOLOGI',
        mode: 3,
      },
    )
    records.value = res.data?.code === 200 ? res.data.response : []
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat riwayat radiologi.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const fetchDetail = async (trans) => {
  try {
    loadingDetail.value = true
    detail.value = null
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/get_detail_radiologi_v2`,
      { user_id: user_id.value, no_receipt: trans, mode: 1, id_client: id_client.value },
    )
    detail.value = res.data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat detail radiologi.',
      life: 5000,
    })
  } finally {
    loadingDetail.value = false
  }
}

const toggleFolder = (idx, trans) => {
  if (expandedIdx.value === idx) {
    expandedIdx.value = null
    detail.value = null
    return
  }
  expandedIdx.value = idx
  fetchDetail(trans)
}

const formatDate = (date) => {
  if (!date) return '—'
  try {
    const d = new Date(date)
    return isNaN(d)
      ? '—'
      : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

const getStatusClass = (status) => {
  if (!status) return 'subrad-status--default'
  const s = status.toLowerCase()
  if (s.includes('c')) return 'subrad-status--success'
  if (s.includes('m')) return 'subrad-status--warning'
  return 'subrad-status--default'
}

onMounted(() => {
  if (props.datapasien?.NOMR) fetchData()
})
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────── */
.subrad-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Toolbar ─────────────────────────────────────── */
.subrad-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
}
.subrad-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.subrad-icon {
  font-size: 15px;
  color: #3b6fa0;
}
.subrad-title {
  font-size: 13px;
  font-weight: 700;
  color: #3b6fa0;
}
.subrad-count {
  font-size: 10px !important;
}

/* ── Empty ───────────────────────────────────────── */
.subrad-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px;
  color: #94a3b8;
  text-align: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 7px;
}
.subrad-empty-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: #cbd5e1;
}
.subrad-empty-text {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 4px;
}
.subrad-empty-sub {
  font-size: 11px;
  color: #94a3b8;
}

/* ── Folder list ─────────────────────────────────── */
.subrad-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subrad-folder {
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.15s;
}
.subrad-folder:hover {
  box-shadow: 0 2px 8px rgba(59, 111, 160, 0.08);
}
.subrad-folder--open {
  border-left: 3px solid #3b6fa0;
  box-shadow: 0 2px 10px rgba(59, 111, 160, 0.1);
}

/* ── Folder header ───────────────────────────────── */
.subrad-folder-hdr {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  background: #f8fafc;
  transition: background 0.15s;
}
.subrad-folder-hdr:hover {
  background: #eef6ff;
}
.subrad-folder--open .subrad-folder-hdr {
  background: #eef6ff;
  border-bottom: 1px solid #bfdbfe;
}

.subrad-folder-ico {
  font-size: 16px;
  color: #64748b;
}
.subrad-folder--open .subrad-folder-ico {
  color: #3b6fa0;
}

.subrad-folder-info {
  flex: 1;
  min-width: 0;
}
.subrad-folder-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.subrad-folder-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 3px;
}
.subrad-meta-date,
.subrad-meta-dpjp,
.subrad-meta-poli {
  font-size: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3px;
}
.subrad-meta-date .pi {
  font-size: 9px;
}
.subrad-meta-sep {
  color: #cbd5e1;
  font-size: 10px;
}

.subrad-folder-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.subrad-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px 3px 7px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.subrad-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.subrad-status--success {
  background: #d1fae5;
  color: #065f46;
}
.subrad-status--success .subrad-status-dot {
  background: #10b981;
}
.subrad-status--warning {
  background: #fef3c7;
  color: #92400e;
}
.subrad-status--warning .subrad-status-dot {
  background: #f59e0b;
}
.subrad-status--default {
  background: #f1f5f9;
  color: #64748b;
}
.subrad-status--default .subrad-status-dot {
  background: #94a3b8;
}

.subrad-chevron {
  font-size: 11px;
  color: #94a3b8;
}

/* ── Folder body ─────────────────────────────────── */
.subrad-folder-body {
  background: #f8fafc;
}

.subrad-detail-loading {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.subrad-detail-loading-text {
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Detail content ──────────────────────────────── */
.subrad-detail-content {
  display: flex;
  flex-direction: column;
}

.subrad-patient-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.subrad-patient-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #eef6ff;
  color: #3b6fa0;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #bfdbfe;
}
.subrad-patient-info {
  flex: 1;
}
.subrad-patient-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}
.subrad-patient-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.subrad-chip {
  font-size: 10px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.subrad-patient-doctor {
  text-align: right;
  flex-shrink: 0;
}
.subrad-patient-doctor-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-bottom: 2px;
}
.subrad-patient-doctor-name {
  font-size: 12px;
  font-weight: 600;
  color: #3b6fa0;
}
.subrad-patient-doctor-unit {
  font-size: 10px;
  color: #64748b;
  margin-top: 1px;
}

/* Result item */
.subrad-result {
  padding: 12px 14px;
  border-bottom: 1px solid #eef2fb;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.subrad-result:last-child {
  border-bottom: none;
}

.subrad-result-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.subrad-result-num {
  font-size: 20px;
  font-weight: 800;
  color: #dce6f8;
  min-width: 28px;
  line-height: 1;
}
.subrad-result-title {
  flex: 1;
}
.subrad-result-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.subrad-result-date {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

/* Ekspertise */
.subrad-expertise-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 6px;
}
.subrad-expertise-content {
  font-size: 12.5px;
  line-height: 1.75;
  color: #334155;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #1a56db;
  border-radius: 0 7px 7px 0;
  padding: 10px 12px;
  white-space: pre-line;
  min-height: 48px;
}

/* Attachments */
.subrad-attachments-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 8px;
}
.subrad-attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.subrad-img-card {
  border: 1px solid #1f2937;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.subrad-img-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.18);
}
.subrad-img-frame {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.subrad-img-caption {
  padding: 5px 8px;
  font-size: 9px;
  color: #9ca3af;
  text-align: center;
  background: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid #1f2937;
}

.subrad-no-attachment {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
  padding: 4px 0;
}

/* ── Slide transition ────────────────────────────── */
.subrad-slide-enter-active,
.subrad-slide-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
  max-height: 2000px;
}
.subrad-slide-enter-from,
.subrad-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
