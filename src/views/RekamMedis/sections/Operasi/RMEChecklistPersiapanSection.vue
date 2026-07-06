<template>
  <div class="rme-section">
    <div class="rme-section-title" style="background:linear-gradient(90deg,#f0fdf4,#f7fdf9);border-left-color:#2e7d32">
      <i class="pi pi-list-check" style="color:#2e7d32"></i> CHECKLIST PERSIAPAN OPERASI
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.</div>
    <div v-else-if="loading" class="rme-loading-row"><span class="rme-loading-dot"></span> Memuat checklist persiapan...</div>
    <div v-else-if="error" class="rme-empty-note"><i class="pi pi-info-circle"></i> {{ error }}</div>
    <div v-else-if="!hasData" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Belum ada data checklist persiapan operasi.</div>

    <div v-else class="cp-body">

      <!-- ── DATA PASIEN & DIAGNOSA ─────────────────────────────────────── -->
      <div class="cp-block">
        <div class="cp-block-hdr">DATA PASIEN &amp; DIAGNOSA</div>
        <div class="cp-grid-2 cp-pad">
          <div>
            <div class="cp-row">
              <span class="cp-lbl">No. Register</span>
              <span class="cp-sep">:</span>
              <span class="cp-val cp-accent cp-bold">{{ data.noregister || '—' }}</span>
            </div>
            <div class="cp-row">
              <span class="cp-lbl">Kode Booking</span>
              <span class="cp-sep">:</span>
              <span class="cp-val cp-bold">{{ data.kodeboking || '—' }}</span>
            </div>
            <div class="cp-row">
              <span class="cp-lbl">Diagnosa</span>
              <span class="cp-sep">:</span>
              <span class="cp-val cp-bold">{{ data.diagnosa || '—' }}</span>
            </div>
          </div>
          <div>
            <div class="cp-row">
              <span class="cp-lbl">Tanggal Dibuat</span>
              <span class="cp-sep">:</span>
              <span class="cp-val">{{ formatDate(data.created_at) || '—' }}</span>
            </div>
            <div class="cp-row">
              <span class="cp-lbl">Petugas</span>
              <span class="cp-sep">:</span>
              <span class="cp-val">{{ data.nama_auth || data.auth_by || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TANDA VITAL & ANTROPOMETRI ──────────────────────────────────── -->
      <div class="cp-block">
        <div class="cp-block-hdr">TANDA VITAL &amp; KONDISI PRA-OPERASI</div>
        <div class="cp-pad-x">
          <div class="cp-ttv-wrap">
            <div class="cp-ttv-title">TANDA-TANDA VITAL</div>
            <div class="cp-ttv-grid">
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">NADI</div>
                <div class="cp-ttv-val">{{ data.nadi || '—' }}<small v-if="data.nadi"> x/mnt</small></div>
              </div>
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">NAFAS</div>
                <div class="cp-ttv-val">{{ data.nafas || '—' }}<small v-if="data.nafas"> x/mnt</small></div>
              </div>
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">TEKANAN DARAH</div>
                <div class="cp-ttv-val">
                  <span v-if="data.tekananDarahSistol">{{ data.tekananDarahSistol }}/{{ data.tekananDarahDiastol }}<small> mmHg</small></span>
                  <span v-else>—</span>
                </div>
              </div>
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">SUHU</div>
                <div class="cp-ttv-val">{{ data.suhu || '—' }}<small v-if="data.suhu"> °C</small></div>
              </div>
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">TINGGI BADAN</div>
                <div class="cp-ttv-val">{{ data.tinggi || '—' }}<small v-if="data.tinggi"> cm</small></div>
              </div>
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">BERAT BADAN</div>
                <div class="cp-ttv-val">{{ data.berat || '—' }}<small v-if="data.berat"> kg</small></div>
              </div>
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">PERSIAPAN DARAH</div>
                <div class="cp-ttv-val">{{ data.persiapanDarah || '—' }}<small v-if="data.persiapanDarah"> cc</small></div>
              </div>
              <div class="cp-ttv-item">
                <div class="cp-ttv-lbl">PUASA MULAI</div>
                <div class="cp-ttv-val cp-ttv-sm">{{ data.puasaMulai || '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── CHECKLIST PERSIAPAN ──────────────────────────────────────────── -->
      <div class="cp-block">
        <div class="cp-block-hdr">DAFTAR CHECKLIST PERSIAPAN</div>

        <!-- Persiapan Fisik -->
        <div class="cp-sub-title cp-pad-x">A. Persiapan Fisik Pasien</div>
        <table class="cp-table">
          <thead>
            <tr>
              <th style="width:32px">No.</th>
              <th>Item Persiapan</th>
              <th style="width:90px;text-align:center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in checklistFisik" :key="item.key">
              <td class="cp-td-no">{{ i + 1 }}</td>
              <td>{{ item.label }}</td>
              <td class="cp-td-status">
                <span :class="statusClass(data[item.key])">{{ data[item.key] || '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Dokumen Consent -->
        <div class="cp-sub-title cp-pad-x" style="margin-top:.25rem">B. Kelengkapan Dokumen &amp; Persetujuan</div>
        <table class="cp-table">
          <thead>
            <tr>
              <th style="width:32px">No.</th>
              <th>Item Persiapan</th>
              <th style="width:90px;text-align:center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in checklistDokumen" :key="item.key">
              <td class="cp-td-no">{{ i + 1 }}</td>
              <td>{{ item.label }}</td>
              <td class="cp-td-status">
                <span :class="statusClass(data[item.key])">{{ data[item.key] || '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Penunjang Medis -->
        <div class="cp-sub-title cp-pad-x" style="margin-top:.25rem">C. Hasil Pemeriksaan Penunjang</div>
        <table class="cp-table" style="margin-bottom:0">
          <thead>
            <tr>
              <th style="width:32px">No.</th>
              <th>Item Persiapan</th>
              <th style="width:90px;text-align:center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in checklistPenunjang" :key="item.key">
              <td class="cp-td-no">{{ i + 1 }}</td>
              <td>{{ item.label }}</td>
              <td class="cp-td-status">
                <span :class="statusClass(data[item.key])">{{ data[item.key] || '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Ringkasan -->
        <div class="cp-summary-row cp-pad">
          <span class="cp-sum-chip cp-sum-ya">✓ Sudah/Ya: {{ countStatus('Ya') }}</span>
          <span class="cp-sum-chip cp-sum-tidak">✗ Tidak: {{ countStatus('Tidak') }}</span>
          <span class="cp-sum-chip cp-sum-kosong">— Belum diisi: {{ countStatus(null) }}</span>
          <span class="cp-sum-chip cp-sum-total">Total: {{ allChecklistItems.length }} item</span>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="cp-disclaimer">— Dokumen ini dicetak secara elektronik dan sah tanpa tanda tangan basah</div>
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
const data = ref({})

const hasData = computed(() => !!(data.value?.diagnosa || data.value?.nadi || data.value?.status))

const checklistFisik = [
  { key: 'clysma',  label: 'Clysma / Huknah' },
  { key: 'gigi',   label: 'Gigi Palsu / Aksesoris Dilepas' },
  { key: 'barang', label: 'Barang Berharga Disimpan' },
  { key: 'makeup', label: 'Make Up / Cat Kuku Dibersihkan' },
  { key: 'kemih',  label: 'Kateter Kemih Terpasang' },
  { key: 'haid',   label: 'Status Haid' },
]

const checklistDokumen = [
  { key: 'status',   label: 'Informed Consent / Persetujuan Tindakan Medis' },
  { key: 'operasi',  label: 'Surat Persetujuan Operasi' },
  { key: 'anestesi', label: 'Surat Persetujuan Anestesi' },
]

const checklistPenunjang = [
  { key: 'laboratorium', label: 'Hasil Pemeriksaan Laboratorium' },
  { key: 'radiologi',    label: 'Hasil Pemeriksaan Radiologi' },
  { key: 'ekg',          label: 'Hasil Pemeriksaan EKG / Rekam Jantung' },
]

const allChecklistItems = computed(() => [...checklistFisik, ...checklistDokumen, ...checklistPenunjang])

const statusClass = (val) => {
  if (!val)          return 'cp-status-empty'
  if (val === 'Ya')  return 'cp-status-ya'
  if (val === 'Tidak') return 'cp-status-tidak'
  return 'cp-status-other'
}

const countStatus = (target) =>
  allChecklistItems.value.filter((item) => {
    const v = data.value[item.key]
    return target === null ? !v : v === target
  }).length

const formatDate = (s) => {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d)) return s
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const fetchData = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/triaseigd/get_persiapan_operasi/`, {
      noregister: noregisterOperasi.value || props.noreg,
      kodeboking: kodebok,
      id_client: id_client.value,
    })
    if (res.data?.metadata?.code == 200) {
      data.value = res.data?.response || {}
    }
  } catch (e) {
    error.value = 'Gagal memuat checklist persiapan: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('checklist-persiapan', hasData.value)
  }
}

watch(kodebookingOperasi, (val) => {
  if (val) fetchData(val)
  else reportSectionData('checklist-persiapan', false)
}, { immediate: true })
</script>

<style scoped>
/* ── Body ─────────────────────────────────────────────────────────── */
.cp-body { font-size:13px; color:#212529 }

/* ── Block ────────────────────────────────────────────────────────── */
.cp-block { border-bottom:1px solid #dde5ee }
.cp-block:last-child { border-bottom:none }

.cp-block-hdr {
  background:linear-gradient(90deg,#ddf4e4 0%,#edf9f0 100%);
  color:#212529;
  font-size:12px;
  font-weight:700;
  letter-spacing:.07em;
  padding:5px 12px;
  display:flex;
  align-items:center;
  gap:6px;
  border-left:3px solid #2e7d32;
}
.cp-block-hdr::before { content:'■'; font-size:10px; opacity:.5 }

/* ── Grid & Row ───────────────────────────────────────────────────── */
.cp-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:0 16px }
.cp-pad    { padding:8px 12px }
.cp-pad-x  { padding:0 12px }
.cp-row { display:flex; align-items:baseline; gap:0; font-size:12px; padding:2px 0 }
.cp-lbl { width:130px; flex-shrink:0; color:#495057; font-size:12px }
.cp-sep { width:14px; flex-shrink:0; text-align:center; color:#adb5bd }
.cp-val { flex:1; font-weight:500; font-size:12px; color:#212529 }
.cp-accent { color:#212529 }
.cp-bold   { font-weight:700 }

/* ── TTV Grid ─────────────────────────────────────────────────────── */
.cp-ttv-wrap {
  margin:8px 0;
  border:1px solid #a5d6a7;
  border-radius:4px;
  overflow:hidden;
}
.cp-ttv-title {
  background:#c8e6c9;
  color:#212529;
  font-size:11px;
  font-weight:700;
  letter-spacing:.05em;
  padding:4px 10px;
  border-bottom:1px solid #a5d6a7;
}
.cp-ttv-grid {
  display:grid;
  grid-template-columns:repeat(4,1fr);
  text-align:center;
}
@media (max-width:480px) { .cp-ttv-grid { grid-template-columns:repeat(2,1fr) } }
.cp-ttv-item {
  padding:8px 4px;
  border-right:1px solid #e8f5e9;
}
.cp-ttv-item:last-child, .cp-ttv-item:nth-child(4n) { border-right:none }
.cp-ttv-lbl {
  font-size:10px; font-weight:600; color:#495057;
  letter-spacing:.03em; margin-bottom:3px; text-transform:uppercase
}
.cp-ttv-val {
  font-size:15px; font-weight:700; color:#212529; line-height:1.2
}
.cp-ttv-val small { font-size:11px; font-weight:400; color:#495057 }
.cp-ttv-sm { font-size:13px }

/* ── Sub title ────────────────────────────────────────────────────── */
.cp-sub-title {
  font-size:11px; font-weight:700; color:#212529;
  letter-spacing:.04em; text-transform:uppercase;
  padding-top:8px; padding-bottom:4px
}

/* ── Table ────────────────────────────────────────────────────────── */
.cp-table {
  width:100%; border-collapse:collapse; font-size:12px; margin-bottom:4px
}
.cp-table th {
  background:#e8f5e9; color:#212529;
  font-weight:700; font-size:11px; letter-spacing:.04em;
  padding:5px 10px; text-align:left;
  border-bottom:2px solid #a5d6a7
}
.cp-table td {
  padding:4px 10px;
  border-bottom:1px solid #f1f3f5;
  vertical-align:middle;
  color:#212529
}
.cp-table tbody tr:last-child td { border-bottom:none }
.cp-table tbody tr:nth-child(even) td { background:#f9fef9 }
.cp-td-no { text-align:center; color:#adb5bd; font-size:11px; width:32px }
.cp-td-status { text-align:center }

/* Status badges */
.cp-status-ya {
  display:inline-block; background:#e8f5e9; color:#2e7d32;
  border:1px solid #a5d6a7; border-radius:4px;
  padding:1px 10px; font-weight:700; font-size:11px
}
.cp-status-tidak {
  display:inline-block; background:#fce4ec; color:#b71c1c;
  border:1px solid #ef9a9a; border-radius:4px;
  padding:1px 10px; font-weight:700; font-size:11px
}
.cp-status-empty {
  display:inline-block; color:#adb5bd;
  font-size:11px; font-style:italic
}
.cp-status-other {
  display:inline-block; background:#fff8e1; color:#f57f17;
  border:1px solid #ffe082; border-radius:4px;
  padding:1px 10px; font-weight:700; font-size:11px
}

/* ── Summary row ──────────────────────────────────────────────────── */
.cp-summary-row {
  display:flex; flex-wrap:wrap; gap:6px;
  border-top:1px dashed #c8e6c9; padding-top:8px; margin-top:4px
}
.cp-sum-chip {
  display:inline-block; border-radius:999px;
  padding:2px 10px; font-size:11px; font-weight:600; white-space:nowrap
}
.cp-sum-ya    { background:#e8f5e9; border:1px solid #a5d6a7; color:#1b5e20 }
.cp-sum-tidak { background:#fce4ec; border:1px solid #ef9a9a; color:#b71c1c }
.cp-sum-kosong{ background:#f5f5f5; border:1px solid #bdbdbd; color:#6c757d }
.cp-sum-total { background:#e8eaf6; border:1px solid #9fa8da; color:#1a237e }

/* ── Disclaimer ───────────────────────────────────────────────────── */
.cp-disclaimer {
  text-align:center; font-size:11px; color:#adb5bd;
  font-style:italic; padding:6px 12px 10px;
  border-top:1px dashed #dee2e6
}

/* ── Print ────────────────────────────────────────────────────────── */
@media print {
  .cp-block-hdr { background:#ddf4e4 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact }
  .cp-table th  { background:#e8f5e9 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact }
  .cp-ttv-title { background:#c8e6c9 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact }
  .cp-table tbody tr:nth-child(even) td { background:#f9fef9 !important; print-color-adjust:exact }
  .cp-status-ya    { background:#e8f5e9 !important; print-color-adjust:exact }
  .cp-status-tidak { background:#fce4ec !important; print-color-adjust:exact }
}
</style>
