<template>
  <div class="sublab-wrap">
    <!-- Toolbar -->
    <div class="sublab-toolbar">
      <div class="sublab-toolbar-left">
        <i class="pi pi-microchip sublab-icon"></i>
        <span class="sublab-title">RIWAYAT LABORATORIUM PASIEN</span>
        <Tag
          v-if="groupedRecords.length"
          :value="`${groupedRecords.length} kunjungan · ${totalItems} pemeriksaan`"
          severity="secondary"
          class="sublab-count"
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
    <ProgressBar
      v-if="loading && groupedRecords.length === 0"
      mode="indeterminate"
      style="height: 3px"
    />

    <!-- Search bar -->
    <div v-if="groupedRecords.length" class="sublab-searchbar">
      <div class="sublab-search-wrap">
        <i class="pi pi-search sublab-search-icon"></i>
        <InputText
          v-model="searchQuery"
          placeholder="Cari no. registrasi, pemeriksaan, dokter, poli…"
          class="sublab-search-input"
        />
        <button v-if="searchQuery" class="sublab-search-clear" @click="searchQuery = ''">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <button class="sublab-expand-btn" @click="toggleExpandAll">
        <i :class="isAllExpanded ? 'pi pi-angle-double-up' : 'pi pi-angle-double-down'"></i>
        {{ isAllExpanded ? 'Tutup Semua' : 'Buka Semua' }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && groupedRecords.length === 0" class="sublab-empty">
      <i class="pi pi-folder-open sublab-empty-icon"></i>
      <p class="sublab-empty-text">Belum ada riwayat laboratorium</p>
      <small class="sublab-empty-sub">Data akan muncul setelah ada pemeriksaan laboratorium</small>
    </div>

    <!-- No search result -->
    <div v-if="!loading && groupedRecords.length && !filteredRecords.length" class="sublab-empty">
      <i class="pi pi-search sublab-empty-icon"></i>
      <p class="sublab-empty-text">Tidak ada hasil yang cocok</p>
      <small class="sublab-empty-sub">Coba kata kunci lain</small>
    </div>

    <!-- Folder list -->
    <div class="sublab-list">
      <div
        v-for="(group, idx) in filteredRecords"
        :key="group.NOREGISTER"
        class="sublab-folder"
        :class="{ 'sublab-folder--open': expandedSet.has(idx) }"
      >
        <!-- Folder header -->
        <div class="sublab-folder-hdr" @click="toggleFolder(idx)">
          <div class="sublab-folder-icon-wrap">
            <i
              :class="expandedSet.has(idx) ? 'pi pi-folder-open' : 'pi pi-folder'"
              class="sublab-folder-ico"
            ></i>
          </div>

          <div class="sublab-folder-info">
            <div class="sublab-folder-name">
              <span class="sublab-noreg">{{ group.NOREGISTER }}</span>
              <button
                class="sublab-print-btn"
                type="button"
                v-tooltip.top="'Buka printout di tab baru'"
                @click.stop="goToPrint(group.TRANS)"
              >
                <i class="pi pi-external-link"></i>
                Cetak
              </button>
              <span class="sublab-items-count">{{ group.items.length }} item</span>
            </div>
            <div class="sublab-folder-meta">
              <span class="sublab-meta-date">
                <i class="pi pi-calendar"></i>
                {{ formatDate(group.TANGGAL) }}
              </span>
              <span class="sublab-meta-sep">·</span>
              <span class="sublab-meta-dpjp">{{ group.DPJP || '—' }}</span>
              <span class="sublab-meta-sep">·</span>
              <span class="sublab-meta-poli">{{ group.POLI_RUANG || '—' }}</span>
            </div>
          </div>

          <div class="sublab-folder-right">
            <span :class="['sublab-status', getStatusClass(group.STATUS_PROGRESS)]">
              <span class="sublab-status-dot"></span>
              {{ getStatusLabel(group.STATUS_PROGRESS) }}
            </span>
            <i
              :class="expandedSet.has(idx) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
              class="sublab-chevron"
            ></i>
          </div>
        </div>

        <!-- Folder body -->
        <Transition name="sublab-slide">
          <div v-if="expandedSet.has(idx)" class="sublab-folder-body">
            <div v-for="(item, i) in group.items" :key="i" class="sublab-result">
              <div class="sublab-result-header">
                <span class="sublab-result-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="sublab-result-title">
                  <div class="sublab-result-name">{{ item.NAMA }}</div>
                  <div class="sublab-result-date">Tanggal: {{ formatDate(item.TANGGAL) }}</div>
                </div>
                <Tag
                  :value="getStatusLabel(item.STATUS_PROGRESS)"
                  :severity="item.STATUS_PROGRESS?.toUpperCase() === 'C' ? 'success' : 'warn'"
                  style="font-size: 10px; margin-left: auto"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import axios from 'axios'

import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'

const props = defineProps({
  datapasien: { type: Object, required: true, validator: (v) => v && typeof v === 'object' },
})

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const rawRecords = ref([])
const expandedSet = ref(new Set())
const searchQuery = ref('')

const groupedRecords = computed(() => {
  const map = new Map()
  rawRecords.value.forEach((item) => {
    const key = item.NOREGISTER
    if (!map.has(key)) {
      map.set(key, {
        NOREGISTER: item.NOREGISTER,
        TRANS: item.TRANS,
        TANGGAL: item.TANGGAL,
        DPJP: item.DPJP,
        POLI_RUANG: item.POLI_RUANG,
        STATUS_PROGRESS: item.STATUS_PROGRESS,
        items: [],
      })
    }
    map.get(key).items.push(item)
  })
  return Array.from(map.values()).sort((a, b) => new Date(b.TANGGAL) - new Date(a.TANGGAL))
})

const filteredRecords = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return groupedRecords.value
  return groupedRecords.value.filter(
    (g) =>
      g.NOREGISTER?.toLowerCase().includes(q) ||
      g.DPJP?.toLowerCase().includes(q) ||
      g.POLI_RUANG?.toLowerCase().includes(q) ||
      g.items.some((item) => item.NAMA?.toLowerCase().includes(q)),
  )
})

const isAllExpanded = computed(
  () => filteredRecords.value.length > 0 && expandedSet.value.size === filteredRecords.value.length,
)

const totalItems = computed(() => rawRecords.value.length)

const fetchData = async () => {
  try {
    loading.value = true
    expandedSet.value = new Set()
    searchQuery.value = ''
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/get_data_penunjang_pasien_v2/`,
      {
        id_client: id_client.value,
        user_id: user_id.value,
        nomr: props.datapasien?.NOMR,
        kategori: 'LABORATORIUM',
        mode: 2,
      },
    )
    rawRecords.value = res.data?.code === 200 ? res.data.response : []
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat riwayat laboratorium.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const toggleFolder = (idx) => {
  const next = new Set(expandedSet.value)
  next.has(idx) ? next.delete(idx) : next.add(idx)
  expandedSet.value = next
}

const toggleExpandAll = () => {
  if (isAllExpanded.value) {
    expandedSet.value = new Set()
  } else {
    expandedSet.value = new Set(filteredRecords.value.map((_, i) => i))
  }
}

const goToPrint = (trans) => {
  const resolved = router.resolve({ name: 'PrintOutlabView', params: { noreceipt: trans } })
  window.open(resolved.href, '_blank')
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
  if (!status) return 'sublab-status--default'
  const s = status.toLowerCase()
  if (s.includes('c')) return 'sublab-status--success'
  if (s.includes('p')) return 'sublab-status--process'
  if (s.includes('m')) return 'sublab-status--warning'
  return 'sublab-status--default'
}

const getStatusLabel = (status) => {
  if (!status) return '—'
  const s = status.toUpperCase()
  if (s === 'C') return 'Selesai'
  if (s === 'P') return 'Proses'
  if (s === 'M') return 'Menunggu'
  return status
}

onMounted(() => {
  if (props.datapasien?.NOMR) fetchData()
})
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────────── */
.sublab-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Toolbar ─────────────────────────────────────── */
.sublab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
}
.sublab-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sublab-icon {
  font-size: 15px;
  color: #3b6fa0;
}
.sublab-title {
  font-size: 13px;
  font-weight: 700;
  color: #3b6fa0;
}
.sublab-count {
  font-size: 10px !important;
}

/* ── Search bar ──────────────────────────────────── */
.sublab-searchbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
}
.sublab-search-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.sublab-search-icon {
  position: absolute;
  left: 9px;
  font-size: 11px;
  color: #94a3b8;
  pointer-events: none;
  z-index: 1;
}
.sublab-search-input {
  width: 100%;
  padding-left: 28px !important;
  padding-right: 28px !important;
  height: 30px;
  font-size: 12px !important;
  border-radius: 6px;
}
.sublab-search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 10px;
  display: flex;
  align-items: center;
  padding: 0;
  line-height: 1;
}
.sublab-search-clear:hover {
  color: #475569;
}
.sublab-expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  color: #3b6fa0;
  background: #eef6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    border-color 0.15s;
  line-height: 1.6;
  flex-shrink: 0;
}
.sublab-expand-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}
.sublab-expand-btn .pi {
  font-size: 11px;
}

/* ── Empty ───────────────────────────────────────── */
.sublab-empty {
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
.sublab-empty-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: #cbd5e1;
}
.sublab-empty-text {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 4px;
}
.sublab-empty-sub {
  font-size: 11px;
  color: #94a3b8;
}

/* ── Folder list ─────────────────────────────────── */
.sublab-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sublab-folder {
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.15s;
}
.sublab-folder:hover {
  box-shadow: 0 2px 8px rgba(59, 111, 160, 0.08);
}
.sublab-folder--open {
  border-left: 3px solid #3b6fa0;
  box-shadow: 0 2px 10px rgba(59, 111, 160, 0.1);
}

/* ── Folder header ───────────────────────────────── */
.sublab-folder-hdr {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  background: #f8fafc;
  transition: background 0.15s;
}
.sublab-folder-hdr:hover {
  background: #eef6ff;
}
.sublab-folder--open .sublab-folder-hdr {
  background: #eef6ff;
  border-bottom: 1px solid #bfdbfe;
}

.sublab-folder-ico {
  font-size: 16px;
  color: #64748b;
}
.sublab-folder--open .sublab-folder-ico {
  color: #3b6fa0;
}

.sublab-folder-info {
  flex: 1;
  min-width: 0;
}

/* ── Folder name row ─────────────────────────────── */
.sublab-folder-name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}
.sublab-noreg {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.01em;
}
.sublab-print-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  color: #3b6fa0;
  background: #eef6ff;
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
  line-height: 1.6;
}
.sublab-print-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1d4ed8;
}
.sublab-print-btn .pi {
  font-size: 9px;
}
.sublab-items-count {
  font-size: 10px;
  font-weight: 600;
  color: #3b6fa0;
  background: #eef6ff;
  border: 1px solid #bfdbfe;
  padding: 1px 7px;
  border-radius: 20px;
}

.sublab-folder-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.sublab-meta-date,
.sublab-meta-dpjp,
.sublab-meta-poli {
  font-size: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3px;
}
.sublab-meta-date .pi {
  font-size: 9px;
}
.sublab-meta-sep {
  color: #cbd5e1;
  font-size: 10px;
}

.sublab-folder-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* ── Status badge ────────────────────────────────── */
.sublab-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px 3px 7px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.sublab-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sublab-status--success {
  background: #d1fae5;
  color: #065f46;
}
.sublab-status--success .sublab-status-dot {
  background: #10b981;
}
.sublab-status--process {
  background: #dbeafe;
  color: #1e40af;
}
.sublab-status--process .sublab-status-dot {
  background: #3b82f6;
}
.sublab-status--warning {
  background: #fef3c7;
  color: #92400e;
}
.sublab-status--warning .sublab-status-dot {
  background: #f59e0b;
}
.sublab-status--default {
  background: #f1f5f9;
  color: #64748b;
}
.sublab-status--default .sublab-status-dot {
  background: #94a3b8;
}

.sublab-chevron {
  font-size: 11px;
  color: #94a3b8;
}

/* ── Folder body ─────────────────────────────────── */
.sublab-folder-body {
  background: #f8fafc;
}

/* ── Result item ─────────────────────────────────── */
.sublab-result {
  padding: 12px 14px;
  border-bottom: 1px solid #eef2fb;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sublab-result:last-child {
  border-bottom: none;
}

.sublab-result-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sublab-result-num {
  font-size: 20px;
  font-weight: 800;
  color: #dce6f8;
  min-width: 28px;
  line-height: 1;
}
.sublab-result-title {
  flex: 1;
}
.sublab-result-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.sublab-result-date {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ── Slide transition ────────────────────────────── */
.sublab-slide-enter-active,
.sublab-slide-leave-active {
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
  max-height: 2000px;
}
.sublab-slide-enter-from,
.sublab-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
