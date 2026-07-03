<template>
  <div class="cetak-etiket-wrap">
    <!-- Toolbar -->
    <div class="etk-toolbar no-print">
      <button class="etk-btn etk-btn-back" @click="go_to_list_pasien">
        <i class="pi pi-arrow-left" /> Tutup
      </button>

      <!-- Template selector -->
      <div class="etk-template-group">
        <span class="etk-adj-label">Template:</span>
        <select class="etk-select" v-model="selectedTemplateId" @change="applyTemplate">
          <option value="">— Pilih Template —</option>
          <option v-for="t in templates" :key="t.id" :value="t.id">
            {{ t.nama }} ({{ Math.round(t.lebar * 10) }} mm){{ t.isDefault ? ' ★' : '' }}
          </option>
        </select>
        <button
          class="etk-icon-btn"
          title="Simpan ukuran saat ini sebagai template baru"
          @click="openSaveDialog"
        >
          <i class="pi pi-save" />
        </button>
        <button class="etk-icon-btn" title="Kelola template" @click="showManageDialog = true">
          <i class="pi pi-cog" />
        </button>
      </div>

      <!-- Lebar manual -->
      <div class="etk-size-adjuster">
        <span class="etk-adj-label">Lebar</span>
        <input
          v-model.number="labelW"
          class="etk-adj-input"
          type="number"
          min="4"
          max="12"
          step="0.1"
        />
        <span class="etk-adj-unit">cm</span>
        <span class="etk-adj-hint">≈ {{ Math.round(labelW * 10) }} mm</span>
      </div>

      <span class="etk-count-badge" v-if="drugItems.length"> {{ drugItems.length }} etiket </span>

      <button class="etk-btn etk-btn-print" @click="doCetak">
        <i class="pi pi-print" /> Cetak Etiket
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="etk-loading no-print">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <div style="margin-top: 10px">Memuat data etiket...</div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="etk-error no-print">
      <i class="pi pi-times-circle" style="font-size: 2rem; color: #dc3545" />
      <div>{{ errorMsg }}</div>
      <button class="etk-btn etk-btn-print" style="margin-top: 12px" @click="fetchData">
        Coba Lagi
      </button>
    </div>

    <!-- Etiket list -->
    <div v-else class="etiket-list">
      <template v-for="(item, idx) in drugItems" :key="idx">
        <div class="etiket-card" :style="{ width: `${labelW}cm` }">
          <!-- Header RS -->
          <div class="etk-header">
            <img v-if="LINK_LOGO" :src="LINK_LOGO" class="etk-logo" alt="logo" />
            <div v-else class="etk-logo-ph"><i class="pi pi-building" /></div>
            <div class="etk-rs-info">
              <div class="etk-rs-name">{{ company || 'RSUD' }}</div>
              <div class="etk-rs-sub">INSTALASI FARMASI</div>
            </div>
          </div>

          <div class="etk-line-solid" />

          <!-- No resep + tanggal -->
          <div class="etk-meta">
            <span class="etk-receipt">No: {{ resepInfo.RECEIPT_NO || '—' }}</span>
            <span class="etk-tgl">{{ formattedDate }}</span>
          </div>

          <div class="etk-line-dashed" />

          <!-- Pasien -->
          <div class="etk-pasien">{{ patientLine }}</div>
          <div v-if="dpjpName" class="etk-dokter">Dokter: {{ dpjpName }}</div>

          <div class="etk-line-dashed" />

          <!-- Jenis obat -->
          <div class="etk-jenis-obat">
            <span class="etk-jenis-badge">
              {{ etiketType(item) === 'luar' ? '[ OBAT LUAR ]' : '[ OBAT DALAM ]' }}
            </span>
          </div>

          <!-- Nama obat -->
          <div class="etk-obat">{{ item.NAMA || item.NAMABARANG || '—' }}</div>

          <!-- Jumlah + satuan -->
          <div class="etk-jumlah" v-if="parseFloat(item.QTY || 0) > 0">
            Jumlah: <b>{{ parseFloat(item.QTY || 0) }} {{ item.SATUAN || '' }}</b>
          </div>

          <div class="etk-line-solid" />

          <!-- Aturan pakai -->
          <div class="etk-aturan">{{ item.REMARK_ITEM || item.CARA_PAKAI || '—' }}</div>

          <!-- Keterangan tambahan -->
          <div class="etk-ket" v-if="item.KETERANGAN">⚠ {{ item.KETERANGAN }}</div>

          <!-- Expired date -->
          <div class="etk-expired" v-if="item.TGL_EXPIRED || item.TGL_EXPIRED_DT">
            Exp: {{ item.TGL_EXPIRED || item.TGL_EXPIRED_DT }}
          </div>

          <div class="etk-line-dashed" />
          <div class="etk-doa">"Semoga lekas sembuh"</div>
        </div>

        <!-- Pemisah antar etiket (hanya di layar) -->
        <div class="etk-separator no-print" v-if="idx < drugItems.length - 1">
          ✂ potong di sini
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="drugItems.length === 0" class="etk-empty no-print">
        <i class="pi pi-inbox" style="font-size: 2rem; color: #aaa" />
        <div>Tidak ada data etiket</div>
      </div>
    </div>

    <!-- ── Modal: Simpan Template ── -->
    <div class="etk-modal-overlay" v-if="showSaveDialog" @click.self="showSaveDialog = false">
      <div class="etk-modal">
        <div class="etk-modal-header">
          <i class="pi pi-save" style="margin-right: 6px" />Simpan Template Ukuran
        </div>
        <div class="etk-modal-body">
          <div class="etk-form-row">
            <label class="etk-form-label">Nama Template</label>
            <input
              ref="saveNameRef"
              v-model="saveName"
              class="etk-form-input"
              placeholder="mis: Label 58mm Standar"
              @keydown.enter="confirmSave"
            />
          </div>
          <div class="etk-form-row">
            <label class="etk-form-label">Lebar</label>
            <span class="etk-form-value">{{ labelW }} cm ({{ Math.round(labelW * 10) }} mm)</span>
          </div>
          <div class="etk-form-row">
            <label class="etk-form-check">
              <input type="checkbox" v-model="saveAsDefault" />
              Jadikan template default
            </label>
          </div>
        </div>
        <div class="etk-modal-footer">
          <button class="etk-btn etk-btn-secondary" @click="showSaveDialog = false">Batal</button>
          <button class="etk-btn etk-btn-primary" :disabled="!saveName.trim()" @click="confirmSave">
            <i class="pi pi-check" /> Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal: Kelola Template ── -->
    <div class="etk-modal-overlay" v-if="showManageDialog" @click.self="showManageDialog = false">
      <div class="etk-modal etk-modal-wide">
        <div class="etk-modal-header">
          <i class="pi pi-cog" style="margin-right: 6px" />Kelola Template Ukuran
        </div>
        <div class="etk-modal-body">
          <div v-if="templates.length === 0" class="etk-manage-empty">
            Belum ada template tersimpan.
          </div>
          <table v-else class="etk-manage-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Lebar</th>
                <th>Default</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in templates" :key="t.id" :class="{ 'row-default': t.isDefault }">
                <!-- Nama (inline edit) -->
                <td>
                  <input
                    v-if="editingId === t.id"
                    v-model="editingNama"
                    class="etk-inline-input"
                    @keydown.enter="confirmRename(t)"
                    @keydown.escape="editingId = null"
                    @blur="confirmRename(t)"
                  />
                  <span v-else class="etk-manage-nama" @click="startRename(t)">
                    {{ t.nama }}
                    <i class="pi pi-pencil etk-edit-icon" />
                  </span>
                </td>
                <!-- Lebar -->
                <td class="etk-manage-lebar">{{ Math.round(t.lebar * 10) }} mm</td>
                <!-- Default -->
                <td class="etk-manage-default">
                  <button
                    v-if="!t.isDefault"
                    class="etk-icon-btn etk-btn-star"
                    title="Jadikan default"
                    @click="setDefault(t.id)"
                  >
                    ☆
                  </button>
                  <span v-else class="etk-star-active" title="Template default">★</span>
                </td>
                <!-- Hapus -->
                <td>
                  <button
                    class="etk-icon-btn etk-btn-danger"
                    title="Hapus template"
                    @click="deleteTemplate(t.id)"
                  >
                    <i class="pi pi-trash" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="etk-modal-footer">
          <button class="etk-btn etk-btn-secondary" @click="showManageDialog = false">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO } = storeToRefs(authStore)

const loading = ref(true)
const errorMsg = ref('')
const allData = ref(null)

// ── Lebar label ──
const labelW = ref(5.8)

// ── Template management (localStorage) ──
const STORAGE_KEY = 'etk_templates'

const loadTemplatesFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveTemplatesToStorage = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const go_to_list_pasien = () => {
  window.close()
}

const templates = ref(loadTemplatesFromStorage())

const selectedTemplateId = ref('')
const showSaveDialog = ref(false)
const showManageDialog = ref(false)
const saveName = ref('')
const saveAsDefault = ref(false)
const saveNameRef = ref(null)
const editingId = ref(null)
const editingNama = ref('')

const applyTemplate = () => {
  const t = templates.value.find((x) => x.id === selectedTemplateId.value)
  if (t) labelW.value = t.lebar
}

const openSaveDialog = () => {
  saveName.value = ''
  saveAsDefault.value = false
  showSaveDialog.value = true
  nextTick(() => saveNameRef.value?.focus())
}

const confirmSave = () => {
  const nama = saveName.value.trim()
  if (!nama) return

  const list = loadTemplatesFromStorage()

  if (saveAsDefault.value) {
    list.forEach((t) => (t.isDefault = false))
  }

  const newTemplate = {
    id: Date.now().toString(),
    nama,
    lebar: labelW.value,
    isDefault: saveAsDefault.value,
  }
  list.push(newTemplate)

  saveTemplatesToStorage(list)
  templates.value = list
  selectedTemplateId.value = newTemplate.id
  showSaveDialog.value = false
}

const setDefault = (id) => {
  const list = loadTemplatesFromStorage()
  list.forEach((t) => (t.isDefault = t.id === id))
  saveTemplatesToStorage(list)
  templates.value = list
}

const deleteTemplate = (id) => {
  const list = loadTemplatesFromStorage().filter((t) => t.id !== id)
  saveTemplatesToStorage(list)
  templates.value = list
  if (selectedTemplateId.value === id) selectedTemplateId.value = ''
}

const startRename = (t) => {
  editingId.value = t.id
  editingNama.value = t.nama
}

const confirmRename = (t) => {
  if (!editingNama.value.trim()) {
    editingId.value = null
    return
  }
  const list = loadTemplatesFromStorage()
  const found = list.find((x) => x.id === t.id)
  if (found) found.nama = editingNama.value.trim()
  saveTemplatesToStorage(list)
  templates.value = list
  editingId.value = null
}

// Terapkan template default saat pertama buka
onMounted(() => {
  const list = loadTemplatesFromStorage()
  const def = list.find((t) => t.isDefault)
  if (def) {
    labelW.value = def.lebar
    selectedTemplateId.value = def.id
  } else {
    const saved = parseFloat(localStorage.getItem('etk_w') || '5.8')
    labelW.value = saved
  }
})

// Simpan lebar terakhir pakai
watchEffect(() => {
  localStorage.setItem('etk_w', labelW.value)
})

// ── Data etiket ──
const ps = computed(() => allData.value?.PS?.[0] || {})
const allResep = computed(() => allData.value?.RESEP || [])

const filterSeq = route.query.itemseq ? String(route.query.itemseq) : null
const drugItems = computed(() => {
  if (!filterSeq) return allResep.value
  return allResep.value.filter((r) => String(r.ITEMSEQNO) === filterSeq)
})

const resepInfo = computed(() => allResep.value[0] || {})
const dpjpName = computed(() => resepInfo.value?.DPJP || ps.value?.DPJP || '')

const patientLine = computed(() => {
  const p = ps.value
  if (!p.NOMR) return route.query.nama || '—'
  const jkUsia = [p.JENISKELAMIN, p.USIA ? `${p.USIA}T` : ''].filter(Boolean).join(' ')
  return `${p.NOMR} — ${p.NAMAPASIEN}${jkUsia ? ` (${jkUsia})` : ''}`
})

const formattedDate = computed(() => {
  const raw = resepInfo.value?.TANGGAL || ps.value?.MASUKPOLY
  if (!raw) return '—'
  const d = new Date(raw.replace(' ', 'T'))
  if (isNaN(d)) return raw
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(2)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yy} ${hh}.${min}`
})

const KEYWORDS_LUAR = [
  'tetes',
  'salep',
  'krim',
  'gel',
  'inhaler',
  'semprot',
  'suppositoria',
  'ovula',
  'patch',
  'topikal',
  'luar',
]
const etiketType = (item) => {
  const check = [item.REMARK_ITEM, item.CARA_PAKAI, item.KETERANGAN, item.NAMA, item.NAMABARANG]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return KEYWORDS_LUAR.some((k) => check.includes(k)) ? 'luar' : 'dalam'
}

// Inject @page size: lebar fixed, tinggi auto (roll paper)
const pageStyleEl = document.createElement('style')
pageStyleEl.id = 'etk-page-style'
document.head.appendChild(pageStyleEl)

watchEffect(() => {
  pageStyleEl.textContent = `@media print { @page { size: ${labelW.value}cm auto; margin: 0; } }`
})

onUnmounted(() => pageStyleEl.remove())

const fetchData = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const noregister = route.query.noregister || ''
    const notrans = route.params.trans || ''
    const nomr = route.query.nomr || ''
    const idclient = id_client.value || ''
    const url = `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/get_all_resepv2/${noregister}/${notrans}/${nomr}/${idclient}`
    const res = await axios.get(url)
    allData.value = res.data || null
  } catch (err) {
    console.error('CetakEtiket:', err)
    errorMsg.value = err?.response?.data?.message || err.message || 'Gagal memuat data'
  } finally {
    loading.value = false
  }
}

const doCetak = () => window.print()

onMounted(async () => {
  await fetchData()
  if (!errorMsg.value) {
    await nextTick()
    window.print()
  }
})
</script>

<style scoped>
/* ── Wrap ── */
.cetak-etiket-wrap {
  background: #e8e8e8;
  min-height: 100vh;
  padding: 16px;
}

/* ── Toolbar ── */
.etk-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 10px 14px;
}
.etk-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.etk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.etk-btn-back {
  background: #6c757d;
  color: #fff;
}
.etk-btn-print {
  background: #198754;
  color: #fff;
}
.etk-btn-primary {
  background: #0d6efd;
  color: #fff;
}
.etk-btn-secondary {
  background: #6c757d;
  color: #fff;
}

.etk-icon-btn {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  background: #fff;
  color: #333;
  display: inline-flex;
  align-items: center;
}
.etk-icon-btn:hover {
  background: #f0f0f0;
}
.etk-btn-danger {
  border-color: #dc3545;
  color: #dc3545;
}
.etk-btn-danger:hover {
  background: #fff5f5;
}
.etk-btn-star {
  font-size: 15px;
  color: #aaa;
  border: none;
}
.etk-btn-star:hover {
  color: #f59e0b;
  background: transparent;
}

/* Template group */
.etk-template-group {
  display: flex;
  align-items: center;
  gap: 5px;
}
.etk-select {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 13px;
  background: #fff;
  min-width: 170px;
}

/* Lebar adjuster */
.etk-size-adjuster {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 13px;
}
.etk-adj-label {
  color: #555;
  font-weight: 600;
  font-size: 12px;
}
.etk-adj-input {
  width: 54px;
  padding: 2px 5px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}
.etk-adj-unit {
  color: #777;
  font-size: 12px;
}
.etk-adj-hint {
  color: #198754;
  font-weight: 700;
  font-size: 12px;
  margin-left: 4px;
}

.etk-count-badge {
  background: #e9ecef;
  color: #495057;
  border-radius: 12px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
}

/* ── States ── */
.etk-loading,
.etk-error,
.etk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #666;
  gap: 10px;
}

/* ── Etiket list ── */
.etiket-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Kartu etiket ── */
.etiket-card {
  background: #fff;
  box-sizing: border-box;
  padding: 4mm 3mm 3mm;
  font-family: 'Courier New', Courier, monospace;
  color: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}
.etiket-card:first-child {
  border-top: 1px solid #ccc;
  border-radius: 4px 4px 0 0;
}
.etiket-card:last-child {
  border-bottom: 1px solid #ccc;
  border-radius: 0 0 4px 4px;
}

.etk-line-solid {
  border: none;
  border-top: 1px solid #000;
  margin: 2.5px 0;
}
.etk-line-dashed {
  border: none;
  border-top: 1px dashed #666;
  margin: 2px 0;
}

.etk-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
}
.etk-logo {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}
.etk-logo-ph {
  width: 18px;
  height: 18px;
  border: 1px solid #999;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #888;
  flex-shrink: 0;
}
.etk-rs-info {
  line-height: 1.25;
  flex: 1;
}
.etk-rs-name {
  font-size: 7pt;
  font-weight: 700;
  text-transform: uppercase;
}
.etk-rs-sub {
  font-size: 6pt;
}

.etk-meta {
  display: flex;
  justify-content: space-between;
  font-size: 6pt;
  margin: 2px 0;
}
.etk-receipt {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 58%;
}
.etk-tgl {
  white-space: nowrap;
  font-size: 6pt;
}

.etk-pasien {
  font-size: 7pt;
  font-weight: 700;
  margin: 2px 0 1px;
  word-break: break-word;
}
.etk-dokter {
  font-size: 6pt;
  margin-bottom: 1px;
}

.etk-jenis-obat {
  text-align: center;
  margin: 3px 0 1px;
}
.etk-jenis-badge {
  font-size: 6.5pt;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.etk-obat {
  font-size: 8.5pt;
  font-weight: 700;
  margin: 2px 0 1px;
  word-break: break-word;
}
.etk-jumlah {
  font-size: 7pt;
  margin-bottom: 1px;
}
.etk-aturan {
  font-size: 9pt;
  font-weight: 700;
  text-align: center;
  padding: 3px 0;
  word-break: break-word;
}
.etk-ket {
  font-size: 6.5pt;
  margin-top: 2px;
  word-break: break-word;
}
.etk-expired {
  font-size: 6.5pt;
  font-weight: 700;
  margin-top: 1px;
}
.etk-doa {
  font-size: 6pt;
  font-style: italic;
  text-align: center;
  margin-top: 3px;
}

.etk-separator {
  width: v-bind('`${labelW}cm`');
  text-align: center;
  font-size: 11px;
  color: #999;
  background: #e8e8e8;
  padding: 6px 0;
  letter-spacing: 0.05em;
  border-left: 1px dashed #bbb;
  border-right: 1px dashed #bbb;
}

/* ── Modal ── */
.etk-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.etk-modal {
  background: #fff;
  border-radius: 10px;
  min-width: 340px;
  max-width: 94vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}
.etk-modal-wide {
  min-width: 480px;
}

.etk-modal-header {
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.etk-modal-body {
  padding: 16px;
}
.etk-modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 10px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Form rows dalam modal */
.etk-form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.etk-form-label {
  font-size: 13px;
  font-weight: 600;
  min-width: 110px;
  color: #555;
}
.etk-form-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 13px;
}
.etk-form-input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
}
.etk-form-value {
  font-size: 13px;
  color: #333;
  font-weight: 600;
}
.etk-form-check {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* Manage table */
.etk-manage-empty {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
}
.etk-manage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.etk-manage-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #888;
  padding: 4px 8px;
  border-bottom: 1px solid #dee2e6;
}
.etk-manage-table td {
  padding: 7px 8px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.etk-manage-table tr.row-default td {
  background: #f0fdf4;
}

.etk-manage-nama {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
.etk-manage-nama:hover .etk-edit-icon {
  opacity: 1;
}
.etk-edit-icon {
  font-size: 11px;
  color: #999;
  opacity: 0;
  transition: opacity 0.15s;
}

.etk-inline-input {
  width: 100%;
  padding: 3px 6px;
  border: 1px solid #0d6efd;
  border-radius: 4px;
  font-size: 13px;
}
.etk-inline-input:focus {
  outline: none;
}

.etk-manage-lebar {
  color: #555;
  font-family: monospace;
}
.etk-manage-default {
  text-align: center;
}
.etk-star-active {
  color: #f59e0b;
  font-size: 16px;
}

/* ── Print ── */
@media print {
  .no-print {
    display: none !important;
  }

  .cetak-etiket-wrap {
    background: #fff !important;
    padding: 0 !important;
  }
  .etiket-list {
    display: block;
  }

  .etiket-card {
    width: 100% !important;
    height: auto !important;
    box-shadow: none !important;
    border: none !important;
    padding: 2mm 2mm 3mm !important;
    page-break-after: always;
    break-after: page;
  }
}
</style>
