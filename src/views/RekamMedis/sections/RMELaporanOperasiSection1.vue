<template>
  <div class="rme-section">
    <!-- ══════════════════════════════════════════════════════════
         JUDUL SECTION
    ══════════════════════════════════════════════════════════ -->
    <div
      class="rme-section-title lop-title-bar"
      style="
        background: linear-gradient(90deg, #fff5f0 0%, #fff8f5 100%);
        border-left-color: #e64a19;
      "
    >
      <div class="lop-title-left">
        <i class="pi pi-file-edit" style="color: #e64a19"></i>
        LAPORAN OPERASI
      </div>
    </div>

    <!-- ── Loading pengecekan tindakan operasi ── -->
    <div v-if="loadingCheck" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memeriksa data tindakan operasi...
    </div>

    <!-- ── Pasien tidak memiliki tindakan operasi ── -->
    <div v-else-if="!hasOperasi" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.
    </div>

    <!-- ── Loading laporan setelah kodebooking diketahui ── -->
    <div v-else-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data laporan operasi...
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <!-- ── Tidak ada data laporan ── -->
    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data laporan operasi untuk kunjungan ini.
    </div>

    <!-- ══════════ KONTEN READ-ONLY ══════════ -->
    <div v-else>
      <!-- ── Meta info booking ── -->
      <div class="lop-meta-row">
        <span class="rme-badge rme-badge-info">
          <i class="pi pi-bookmark"></i> Booking: {{ kodebooking }}
        </span>
        <span v-if="data.created_at" class="lop-last-update">
          Diperbarui: {{ formatDate(data.created_at) }}
        </span>
      </div>

      <!-- ══════ 1. INFORMASI OPERASI ══════ -->
      <div class="rme-subsection-title"><span class="lop-sub-icon">🏥</span> Informasi Operasi</div>

      <div class="rme-info-grid">
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr>
                <td class="rme-td-lbl">Pemeriksaan PA</td>
                <td class="rme-td-val">
                  <span
                    :class="
                      data.pa === 'Ya'
                        ? 'rme-badge rme-badge-warning'
                        : 'rme-badge rme-badge-secondary'
                    "
                  >
                    {{ data.pa || 'Tidak' }}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Diagnosa Pra Operasi</td>
                <td class="rme-td-val">{{ data.diagnosaPra || '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Diagnosa Pasca Operasi</td>
                <td class="rme-td-val">{{ data.diagnosaPasca || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr>
                <td class="rme-td-lbl">Jenis Anestesi</td>
                <td class="rme-td-val">{{ data.anestesi || '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Komplikasi Penyulit</td>
                <td class="rme-td-val">{{ data.komplikasi || '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Jaringan Dieksisi/Insisi</td>
                <td class="rme-td-val">{{ data.jaringan || '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Jumlah Perdarahan</td>
                <td class="rme-td-val">
                  <span v-if="data.perdarahan">{{ data.perdarahan }} CC</span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══════ 2. WAKTU OPERASI ══════ -->
      <div class="rme-subsection-title"><span class="lop-sub-icon">⏱️</span> Waktu Operasi</div>

      <div class="rme-info-grid">
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr>
                <td class="rme-td-lbl">Tanggal &amp; Jam Mulai</td>
                <td class="rme-td-val">{{ formatDateTime(data.tanggal_jam_mulai) || '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Tanggal &amp; Jam Selesai</td>
                <td class="rme-td-val">{{ formatDateTime(data.tanggal_jam_selesai) || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr>
                <td class="rme-td-lbl">Durasi Operasi</td>
                <td class="rme-td-val">
                  <span v-if="data.durasi" class="lop-durasi-badge">
                    ⏱ {{ data.durasi }} menit
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══════ 3. URAIAN PEMBEDAHAN ══════ -->
      <div class="rme-subsection-title"><span class="lop-sub-icon">📋</span> Uraian Pembedahan</div>
      <div v-if="data.uraian" class="rme-textarea-box lop-block">{{ data.uraian }}</div>
      <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak dicatat.</div>

      <!-- ══════ 4. INSTRUKSI PASCA OPERASI ══════ -->
      <div class="rme-subsection-title">
        <span class="lop-sub-icon">📝</span> Instruksi Pasca Operasi
      </div>
      <div v-if="data.instruksi" class="rme-textarea-box lop-block">{{ data.instruksi }}</div>
      <div v-else class="rme-empty-note"><i class="pi pi-minus-circle"></i> Tidak dicatat.</div>

      <!-- ══════ 5. DOKUMENTASI GAMBAR ══════ -->
      <template v-if="lampiran.length > 0">
        <div class="rme-subsection-title">
          <span class="lop-sub-icon">🖼️</span> Dokumentasi Gambar Medis
          <span class="lop-img-count">({{ lampiran.length }} gambar)</span>
        </div>
        <div v-if="data.keterangan_gambar" class="lop-gambar-ket">
          <strong>Keterangan:</strong> {{ data.keterangan_gambar }}
        </div>
        <div class="lop-gallery">
          <div v-for="(img, idx) in lampiran" :key="idx" class="lop-gallery-item">
            <img :src="img.filename" :alt="`Gambar ${idx + 1}`" class="lop-gallery-img" />
            <div class="lop-gallery-label">Gambar {{ idx + 1 }}</div>
          </div>
        </div>
      </template>
    </div>
    <!-- /v-else hasData -->
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

const loadingCheck = ref(true)
const loading = ref(false)
const error = ref(null)
const hasOperasi = ref(false)
const kodebooking = ref('')
const data = ref({})
const lampiran = ref([])

const hasData = computed(
  () => !!(data.value?.diagnosaPra || data.value?.uraian || data.value?.instruksi),
)

const formatDate = (dateString) => {
  if (!dateString) return null
  const d = new Date(dateString)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

const formatDateTime = (dateString) => {
  if (!dateString) return null
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

const checkOperasi = async () => {
  loadingCheck.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/Data_referensi/check_apakah_pasienop/`, {
      noregister: props.noreg,
    })
    const d = res.data?.data
    console.log('checkOperasi result:', d)
    if (d?.noregister && d?.kodebooking) {
      hasOperasi.value = true
      kodebooking.value = d.kodebooking
      await fetchLaporanOperasi(d.kodebooking)
    } else {
      hasOperasi.value = false
      reportSectionData('laporan-operasi', false)
    }
  } catch (e) {
    hasOperasi.value = false
    error.value = 'Gagal memeriksa data tindakan operasi: ' + (e.message || '')
    reportSectionData('laporan-operasi', false)
  } finally {
    loadingCheck.value = false
  }
}

const fetchLaporanOperasi = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/triaseigd/get_laporan_operasi`, {
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

watch(
  () => props.noreg,
  (val) => {
    if (val) checkOperasi()
  },
  { immediate: true },
)
</script>

<style scoped>
.lop-title-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.lop-title-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.92rem;
}

.lop-meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
}
.lop-last-update {
  font-size: 0.72rem;
  color: #888;
}

.lop-sub-icon {
  margin-right: 0.25rem;
}

.lop-block {
  white-space: pre-wrap;
  line-height: 1.55;
}

.lop-durasi-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 700;
  color: #795548;
  font-size: 0.82rem;
}

.lop-gambar-ket {
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 0.5rem;
  background: #f8f8f8;
  border-left: 3px solid #e64a19;
  padding: 0.4rem 0.75rem;
  border-radius: 0 4px 4px 0;
}

.lop-img-count {
  font-size: 0.72rem;
  font-weight: 400;
  color: #888;
  margin-left: 0.4rem;
}

.lop-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.lop-gallery-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  background: #fafafa;
}

.lop-gallery-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  display: block;
}

.lop-gallery-label {
  font-size: 0.65rem;
  color: #888;
  text-align: center;
  padding: 3px 0;
  background: #f5f5f5;
}
</style>
