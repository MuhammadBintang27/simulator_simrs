<template>
  <div class="rme-section">
    <div class="rme-section-title" style="background:linear-gradient(90deg,#fff8f0,#fffbf5);border-left-color:#e65100">
      <i class="pi pi-shield" style="color:#e65100"></i> CHECKLIST KESELAMATAN OPERASI (WHO)
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.</div>
    <div v-else-if="loading" class="rme-loading-row"><span class="rme-loading-dot"></span> Memuat data checklist keselamatan...</div>
    <div v-else-if="error" class="rme-empty-note"><i class="pi pi-info-circle"></i> {{ error }}</div>
    <div v-else-if="!hasData" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Belum ada data checklist keselamatan operasi.</div>

    <div v-else>
      <div class="cko-grid">

        <!-- ① SIGN IN -->
        <div class="cko-block">
          <div class="cko-block-hdr cko-hdr-blue">
            ① SIGN IN
            <small>Sebelum Induksi Anestesi</small>
          </div>

          <div class="cko-row"><span class="cko-q">Tanggal &amp; Jam</span><span class="cko-a">{{ fdt(data.signInDate) }}</span></div>

          <div class="cko-divider">Verifikasi Pasien</div>
          <div class="cko-row">
            <span class="cko-q">Sudahkah identitas, prosedur, lokasi operasi &amp; informed consent dikonfirmasi ulang?</span>
            <span class="cko-a" :class="cls(data.confirmPatient,'Sudah')">{{ data.confirmPatient || '-' }}</span>
          </div>
          <div class="cko-row">
            <span class="cko-q">Apakah lokasi operasi sudah ditandai?</span>
            <span class="cko-a" :class="cls(data.lokasiOperasi,'Sudah')">{{ data.lokasiOperasi || '-' }}</span>
          </div>

          <div class="cko-divider">Kesiapan Anestesi</div>
          <div class="cko-row">
            <span class="cko-q">Mesin anestesi &amp; obat-obatan sudah lengkap?</span>
            <span class="cko-a" :class="cls(data.anastesi,'Sudah')">{{ data.anastesi || '-' }}</span>
          </div>
          <div class="cko-row">
            <span class="cko-q">Pulse oksimetri sudah dipasang &amp; berfungsi baik?</span>
            <span class="cko-a" :class="cls(data.oksimetri,'Sudah')">{{ data.oksimetri || '-' }}</span>
          </div>

          <div class="cko-divider">Risiko Klinis</div>
          <div class="cko-row">
            <span class="cko-q">Apakah terdapat risiko jalan nafas sulit / aspirasi?</span>
            <span class="cko-a" :class="clsRisk(data.jalan_nafas)">{{ data.jalan_nafas || '-' }}</span>
          </div>
          <div v-if="data.jalan_nafas === 'Ya' && data.antisipasi_jalan_nafas" class="cko-note">{{ data.antisipasi_jalan_nafas }}</div>

          <div class="cko-row">
            <span class="cko-q">Pasien memiliki alergi?</span>
            <span class="cko-a" :class="clsRisk(data.alergi)">{{ data.alergi || '-' }}</span>
          </div>
          <div v-if="data.alergi === 'Ya' && data.detail_alergi" class="cko-note">{{ data.detail_alergi }}</div>

          <div class="cko-row">
            <span class="cko-q">Adakah risiko aspirasi?</span>
            <span class="cko-a" :class="clsRisk(data.aspirasi)">{{ data.aspirasi || '-' }}</span>
          </div>
          <div class="cko-row">
            <span class="cko-q">Adakah risiko pendarahan &gt; 500ml?</span>
            <span class="cko-a" :class="clsRisk(data.pendarahan)">{{ data.pendarahan || '-' }}</span>
          </div>
          <div v-if="data.pendarahan === 'Ya'" class="cko-row">
            <span class="cko-q cko-q-sub">↳ Akses IV / cairan resusitasi tersedia?</span>
            <span class="cko-a" :class="cls(data.akses_iv,'Ya')">{{ data.akses_iv || '-' }}</span>
          </div>

          <div class="cko-divider">Penanggung Jawab</div>
          <div class="cko-tte-row">
            <span class="cko-q">Petugas Sign In</span>
            <span v-if="data.tte_petugas_sign_in" class="cko-tte-ok">&#10003; {{ data.nama_petugas_sign_in || data.tte_petugas_sign_in }}</span>
            <span v-else class="cko-tte-empty">Belum TTE</span>
          </div>
          <div v-if="data.tte_waktu_petugas_sign_in" class="cko-tte-time">{{ fdt(data.tte_waktu_petugas_sign_in) }}</div>
        </div>

        <!-- ② TIME OUT -->
        <div class="cko-block">
          <div class="cko-block-hdr cko-hdr-yellow">
            ② TIME OUT
            <small>Sebelum Insisi Kulit</small>
          </div>

          <div class="cko-row"><span class="cko-q">Tanggal &amp; Jam</span><span class="cko-a">{{ fdt(data.timeOutDate) }}</span></div>

          <div class="cko-divider">Konfirmasi Tim</div>
          <div class="cko-row">
            <span class="cko-q">Semua anggota tim sudah memperkenalkan nama dan tugasnya?</span>
            <span class="cko-a" :class="cls(data.konfirmasiTim,'Sudah')">{{ data.konfirmasiTim || '-' }}</span>
          </div>
          <div class="cko-row">
            <span class="cko-q">Dokter Bedah, Anestesi &amp; Perawat telah konfirmasi verbal: nama pasien, prosedur &amp; lokasi insisi?</span>
            <span class="cko-a" :class="cls(data.konfirmasiVerbal,'Sudah')">{{ data.konfirmasiVerbal || '-' }}</span>
          </div>

          <div class="cko-divider">Antisipasi Keadaan Kritis</div>
          <div class="cko-check-item" :class="data.kritis?.includes('dokter') ? 'cko-done' : 'cko-todo'">
            <span class="cko-mark">{{ data.kritis?.includes('dokter') ? '✓' : '○' }}</span>
            <span><strong>Dr. Bedah:</strong> Keadaan kritis, langkah tidak terduga, estimasi lama operasi &amp; antisipasi kehilangan darah</span>
          </div>
          <div class="cko-check-item" :class="data.kritis?.includes('anestesi') ? 'cko-done' : 'cko-todo'">
            <span class="cko-mark">{{ data.kritis?.includes('anestesi') ? '✓' : '○' }}</span>
            <span><strong>Dr. Anestesi:</strong> Apakah pasien membutuhkan perhatian khusus?</span>
          </div>
          <div class="cko-check-item" :class="data.kritis?.includes('perawat') ? 'cko-done' : 'cko-todo'">
            <span class="cko-mark">{{ data.kritis?.includes('perawat') ? '✓' : '○' }}</span>
            <span><strong>Tim Perawat:</strong> Peralatan steril sudah siap &amp; tidak ada masalah?</span>
          </div>

          <div class="cko-divider">Kesiapan Operasi</div>
          <div class="cko-row">
            <span class="cko-q">Antibiotik profilaksis sudah diberikan 60 menit sebelumnya?</span>
            <span class="cko-a" :class="cls(data.profilaksis,'Sudah')">{{ data.profilaksis || '-' }}</span>
          </div>
          <div class="cko-row">
            <span class="cko-q">Ada hasil imaging (rontgen/CT/MRI) yang perlu ditampilkan?</span>
            <span class="cko-a">{{ data.rontgen || '-' }}</span>
          </div>
          <div class="cko-row">
            <span class="cko-q">Diperlukan implant atau peralatan khusus?</span>
            <span class="cko-a">{{ data.implant || '-' }}</span>
          </div>
          <div v-if="data.implant === 'Ya' && data.keterangan_implant" class="cko-note">{{ data.keterangan_implant }}</div>

          <div class="cko-divider">Penanggung Jawab</div>
          <div class="cko-tte-row">
            <span class="cko-q">Dr. Operator</span>
            <span v-if="data.tte_dokter_operator" class="cko-tte-ok">&#10003; {{ data.nama_dokter_operator || data.tte_dokter_operator }}</span>
            <span v-else class="cko-tte-empty">Belum TTE</span>
          </div>
          <div v-if="data.tte_waktu_dokter_operator" class="cko-tte-time">{{ fdt(data.tte_waktu_dokter_operator) }}</div>
          <div class="cko-tte-row" style="margin-top:.2rem">
            <span class="cko-q">Dr. Anestesi</span>
            <span v-if="data.tte_dokter_anestesi" class="cko-tte-ok">&#10003; {{ data.nama_dokter_anestesi || data.tte_dokter_anestesi }}</span>
            <span v-else class="cko-tte-empty">Belum TTE</span>
          </div>
          <div v-if="data.tte_waktu_dokter_anestesi" class="cko-tte-time">{{ fdt(data.tte_waktu_dokter_anestesi) }}</div>
        </div>

        <!-- ③ SIGN OUT -->
        <div class="cko-block">
          <div class="cko-block-hdr cko-hdr-green">
            ③ SIGN OUT
            <small>Sebelum Pasien Meninggalkan OK</small>
          </div>

          <div class="cko-row"><span class="cko-q">Tanggal &amp; Jam</span><span class="cko-a">{{ fdt(data.timeSignOut) }}</span></div>

          <div class="cko-divider">Konfirmasi Verbal Perawat</div>
          <div class="cko-check-item" :class="data.konfirmasi?.includes('prosedur') ? 'cko-done' : 'cko-todo'">
            <span class="cko-mark">{{ data.konfirmasi?.includes('prosedur') ? '✓' : '○' }}</span>
            <span>Nama prosedur tindakan dikonfirmasi</span>
          </div>
          <div class="cko-check-item" :class="data.konfirmasi?.includes('instrumen') ? 'cko-done' : 'cko-todo'">
            <span class="cko-mark">{{ data.konfirmasi?.includes('instrumen') ? '✓' : '○' }}</span>
            <span>Instrumen, kasa &amp; jarum sudah dihitung dengan benar / lengkap</span>
          </div>
          <div class="cko-check-item" :class="data.konfirmasi?.includes('spesimen') ? 'cko-done' : 'cko-todo'">
            <span class="cko-mark">{{ data.konfirmasi?.includes('spesimen') ? '✓' : '○' }}</span>
            <span>Spesimen sudah diberi label (nama pasien &amp; asal jaringan)</span>
          </div>

          <div class="cko-divider">Masalah Peralatan</div>
          <div class="cko-row">
            <span class="cko-q">Apakah ada masalah dengan peralatan selama operasi?</span>
            <span class="cko-a" :class="clsRisk(data.masalahPeralatan)">{{ data.masalahPeralatan || '-' }}</span>
          </div>
          <div v-if="data.masalahPeralatan === 'Ya' && data.keterangan_masalah" class="cko-note">{{ data.keterangan_masalah }}</div>

          <div class="cko-divider">Review Tim &amp; Instruksi Pemulihan</div>
          <div class="cko-check-item" :class="data.review?.includes('done') ? 'cko-done' : 'cko-todo'">
            <span class="cko-mark">{{ data.review?.includes('done') ? '✓' : '○' }}</span>
            <span>Dokter Bedah, Anestesi &amp; Perawat telah mereview masalah utama untuk pemulihan pasien</span>
          </div>
          <div v-if="data.instruksi_pemulihan" class="cko-note" style="margin-top:.25rem">
            <strong>Instruksi pemulihan:</strong> {{ data.instruksi_pemulihan }}
          </div>

          <div class="cko-divider">Penanggung Jawab</div>
          <div class="cko-tte-row">
            <span class="cko-q">Prw. Scrub</span>
            <span v-if="data.tte_perawat_scrub" class="cko-tte-ok">&#10003; {{ data.nama_perawat_scrub || data.tte_perawat_scrub }}</span>
            <span v-else class="cko-tte-empty">Belum TTE</span>
          </div>
          <div v-if="data.tte_waktu_perawat_scrub" class="cko-tte-time">{{ fdt(data.tte_waktu_perawat_scrub) }}</div>
          <div class="cko-tte-row" style="margin-top:.2rem">
            <span class="cko-q">Prw. Sirkuler</span>
            <span v-if="data.tte_perawat_sirkuler" class="cko-tte-ok">&#10003; {{ data.nama_perawat_sirkuler || data.tte_perawat_sirkuler }}</span>
            <span v-else class="cko-tte-empty">Belum TTE</span>
          </div>
          <div v-if="data.tte_waktu_perawat_sirkuler" class="cko-tte-time">{{ fdt(data.tte_waktu_perawat_sirkuler) }}</div>
        </div>

      </div>

      <div class="cko-meta">
        <span v-if="data.created_at">Dibuat: {{ fdt(data.created_at) }}</span>
        <span v-if="data.lasupdate"> | Diperbarui: {{ fdt(data.lasupdate) }}</span>
      </div>
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

const hasData = computed(() => !!(data.value?.signInDate || data.value?.confirmPatient || data.value?.konfirmasiTim))

const cls = (val, okVal) => val === okVal ? 'cko-a-ok' : val ? 'cko-a-warn' : ''
const clsRisk = (val) => val === 'Tidak' ? 'cko-a-ok' : val === 'Ya' ? 'cko-a-warn' : ''

const fdt = (s) => {
  if (!s) return '-'
  const d = new Date(s.replace(' ', 'T'))
  if (isNaN(d.getTime())) return s
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
}

const parseSafe = (v) => {
  if (Array.isArray(v)) return v
  try { return v ? JSON.parse(v) : [] } catch { return [] }
}

const fetchData = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/triaseigd/get_check_list_keselamatan`, {
      noregister: noregisterOperasi.value || props.noreg,
      kodeboking: kodebok,
      id_client: id_client.value,
    })
    if (res.data?.metadata?.code == 200 && res.data?.response) {
      const d = { ...res.data.response }
      d.kritis = parseSafe(d.kritis)
      d.konfirmasi = parseSafe(d.konfirmasi)
      d.review = parseSafe(d.review)
      data.value = d
    }
  } catch (e) {
    error.value = 'Gagal memuat checklist keselamatan: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('checklist-keselamatan', hasData.value)
  }
}

watch(kodebookingOperasi, (val) => {
  if (val) fetchData(val)
  else reportSectionData('checklist-keselamatan', false)
}, { immediate: true })
</script>

<style scoped>
/* ── 3-kolom landscape ── */
.cko-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .65rem }
.cko-block { border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden }
.cko-block-hdr { padding: .45rem .75rem; font-size: .82rem; font-weight: 700; letter-spacing: .03em; color: #212529; border-bottom: 1px solid #dee2e6 }
.cko-block-hdr small { display: block; font-weight: 400; font-size: .72rem; color: #495057; margin-top: .1rem }
.cko-hdr-blue   { background: linear-gradient(90deg, #dbeafe, #eff6ff); border-left: 4px solid #2563eb }
.cko-hdr-yellow { background: linear-gradient(90deg, #fef9c3, #fefce8); border-left: 4px solid #ca8a04 }
.cko-hdr-green  { background: linear-gradient(90deg, #dcfce7, #f0fdf4); border-left: 4px solid #16a34a }
.cko-divider { font-size: .68rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; padding: .22rem .75rem; background: #f9fafb; border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6 }
.cko-row { display: flex; align-items: flex-start; justify-content: space-between; padding: .22rem .75rem; border-bottom: 1px solid #f3f4f6; gap: .4rem }
.cko-q { font-size: .76rem; color: #495057; flex: 1; line-height: 1.4 }
.cko-q-sub { color: #6b7280; font-style: italic }
.cko-a { font-size: .76rem; font-weight: 700; color: #212529; white-space: nowrap; text-align: right; min-width: 44px }
.cko-a-ok   { color: #166534 }
.cko-a-warn { color: #b91c1c }
.cko-check-item { display: flex; align-items: flex-start; gap: .35rem; padding: .22rem .75rem; font-size: .76rem; border-bottom: 1px solid #f3f4f6; line-height: 1.4 }
.cko-mark { font-size: .85rem; font-weight: 700; width: 16px; flex-shrink: 0; margin-top: .05rem }
.cko-done { color: #212529 }
.cko-done .cko-mark { color: #166534 }
.cko-todo { color: #9ca3af }
.cko-todo .cko-mark { color: #9ca3af }
.cko-note { font-size: .72rem; color: #374151; background: #f9fafb; border-left: 2px solid #d1d5db; padding: .2rem .6rem; margin: .12rem .6rem .2rem; border-radius: 0 4px 4px 0; font-style: italic; line-height: 1.4 }
.cko-tte-row { display: flex; align-items: center; justify-content: space-between; padding: .22rem .75rem; border-bottom: 1px solid #f3f4f6; gap: .4rem }
.cko-tte-ok    { font-size: .76rem; font-weight: 700; color: #166534 }
.cko-tte-empty { font-size: .72rem; color: #9ca3af; font-style: italic }
.cko-tte-time  { font-size: .68rem; color: #6b7280; padding: 0 .75rem .18rem; text-align: right }
.cko-meta { font-size: .7rem; color: #6b7280; text-align: right; margin-top: .5rem }
</style>
