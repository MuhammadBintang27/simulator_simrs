<template>
  <div class="rme-section">
    <div class="rme-section-title lop-title-bar" style="background:linear-gradient(90deg,#fff5f0,#fff8f5);border-left-color:#e64a19">
      <div class="lop-title-left"><i class="pi pi-file-edit" style="color:#e64a19"></i> LAPORAN OPERASI</div>
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.
    </div>
    <div v-else-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data laporan operasi...
    </div>
    <div v-else-if="error" class="rme-empty-note"><i class="pi pi-info-circle"></i> {{ error }}</div>
    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data laporan operasi untuk kunjungan ini.
    </div>

    <div v-else>
      <div class="lop-meta-row">
        <span class="rme-badge rme-badge-info"><i class="pi pi-bookmark"></i> Booking: {{ kodebookingOperasi }}</span>
        <span v-if="data.created_at" class="lop-last-update">Diperbarui: {{ formatDate(data.created_at) }}</span>
      </div>

      <div class="rme-subsection-title"><span>🏥</span> Informasi Operasi</div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr><td class="rme-td-lbl">Pemeriksaan PA</td><td class="rme-td-val"><span :class="data.pa==='Ya'?'rme-badge rme-badge-warning':'rme-badge rme-badge-secondary'">{{ data.pa||'Tidak' }}</span></td></tr>
              <tr><td class="rme-td-lbl">Diagnosa Pra Operasi</td><td class="rme-td-val">{{ data.diagnosaPra||'-' }}</td></tr>
              <tr><td class="rme-td-lbl">Diagnosa Pasca Operasi</td><td class="rme-td-val">{{ data.diagnosaPasca||'-' }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr><td class="rme-td-lbl">Jenis Anestesi</td><td class="rme-td-val">{{ data.anestesi||'-' }}</td></tr>
              <tr><td class="rme-td-lbl">Komplikasi Penyulit</td><td class="rme-td-val">{{ data.komplikasi||'-' }}</td></tr>
              <tr><td class="rme-td-lbl">Jaringan Dieksisi/Insisi</td><td class="rme-td-val">{{ data.jaringan||'-' }}</td></tr>
              <tr><td class="rme-td-lbl">Jumlah Perdarahan</td><td class="rme-td-val">{{ data.perdarahan ? data.perdarahan+' CC' : '-' }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rme-subsection-title"><span>⏱️</span> Waktu Operasi</div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr><td class="rme-td-lbl">Tanggal &amp; Jam Mulai</td><td class="rme-td-val">{{ formatDateTime(data.tanggal_jam_mulai)||'-' }}</td></tr>
              <tr><td class="rme-td-lbl">Tanggal &amp; Jam Selesai</td><td class="rme-td-val">{{ formatDateTime(data.tanggal_jam_selesai)||'-' }}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr>
                <td class="rme-td-lbl">Durasi Operasi</td>
                <td class="rme-td-val">
                  <span v-if="data.durasi" class="lop-durasi-badge">⏱ {{ data.durasi }} menit</span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rme-subsection-title"><span>📋</span> Uraian Pembedahan</div>
      <div v-if="data.uraian" class="rme-textarea-box lop-block">{{ data.uraian }}</div>
      <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak dicatat.</div>

      <div class="rme-subsection-title"><span>📝</span> Instruksi Pasca Operasi</div>
      <div v-if="data.instruksi" class="rme-textarea-box lop-block">{{ data.instruksi }}</div>
      <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak dicatat.</div>

      <template v-if="lampiran.length > 0">
        <div class="rme-subsection-title"><span>🖼️</span> Dokumentasi Gambar Medis <span class="lop-img-count">({{ lampiran.length }} gambar)</span></div>
        <div v-if="data.keterangan_gambar" class="lop-gambar-ket"><strong>Keterangan:</strong> {{ data.keterangan_gambar }}</div>
        <div class="lop-gallery">
          <div v-for="(img,idx) in lampiran" :key="idx" class="lop-gallery-item">
            <img :src="img.filename" :alt="`Gambar ${idx+1}`" class="lop-gallery-img" />
            <div class="lop-gallery-label">Gambar {{ idx+1 }}</div>
          </div>
        </div>
      </template>
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
const lampiran = ref([])

const hasData = computed(() => !!(data.value?.diagnosaPra || data.value?.uraian || data.value?.instruksi))

const formatDate = (s) => {
  if (!s) return null
  const d = new Date(s)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
const formatDateTime = (s) => {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const fetchData = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/triaseigd/get_laporan_operasi`, {
      noregister: noregisterOperasi.value || props.noreg,
      kodeboking: kodebok,
      id_client: id_client.value,
      mode: 1,
    })
    if (res.data?.metadata?.code == '200') {
      data.value = res.data?.response || {}
      lampiran.value = res.data?.lampiran || []
    }
  } catch (e) {
    error.value = 'Gagal memuat laporan operasi: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('laporan-operasi', hasData.value)
  }
}

watch(kodebookingOperasi, (val) => {
  if (val) fetchData(val)
  else reportSectionData('laporan-operasi', false)
}, { immediate: true })
</script>

<style scoped>
.lop-title-bar { display:flex; align-items:center; gap:.5rem }
.lop-title-left { display:flex; align-items:center; gap:.4rem; font-weight:700; font-size:.92rem }
.lop-meta-row { display:flex; align-items:center; gap:.75rem; margin-bottom:.6rem; flex-wrap:wrap }
.lop-last-update { font-size:.72rem; color:#888 }
.lop-block { white-space:pre-wrap; line-height:1.55 }
.lop-durasi-badge { display:inline-flex; align-items:center; gap:.25rem; background:#fff8e1; border:1px solid #ffe082; border-radius:6px; padding:2px 8px; font-weight:700; color:#795548; font-size:.82rem }
.lop-gambar-ket { font-size:.8rem; color:#555; margin-bottom:.5rem; background:#f8f8f8; border-left:3px solid #e64a19; padding:.4rem .75rem; border-radius:0 4px 4px 0 }
.lop-img-count { font-size:.72rem; font-weight:400; color:#888; margin-left:.4rem }
.lop-gallery { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:.5rem; margin-top:.5rem }
.lop-gallery-item { border:1px solid #ddd; border-radius:6px; overflow:hidden; background:#fafafa }
.lop-gallery-img { width:100%; height:100px; object-fit:cover; display:block }
.lop-gallery-label { font-size:.65rem; color:#888; text-align:center; padding:3px 0; background:#f5f5f5 }
</style>
