<template>
  <Toast />
  <div class="resume-wrap">
    <!-- Toolbar -->
    <div class="resume-toolbar no-print">
      <Button
        icon="pi pi-arrow-left"
        label="Kembali"
        text
        severity="secondary"
        @click="$router.back()"
      />
      <Button
        icon="pi pi-print"
        label="Cetak"
        severity="success"
        @click="print"
        :loading="loading"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="resume-loading">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #1a6b4a"></i>
      <p>Memuat data resume...</p>
    </div>

    <!-- Document -->
    <div v-else class="resume-doc" id="resume-print">
      <!-- ── KOP RS ── -->
      <div class="kop-rs">
        <img :src="LINK_LOGO" height="70" width="70" alt="Logo RS" class="kop-logo" />
        <div class="kop-text">
          <div class="kop-nama">{{ company }}</div>
          <div class="kop-alamat">{{ ALAMAT }}</div>
        </div>
      </div>
      <div class="kop-divider">
        <hr class="kop-line" />
        <div class="kop-judul">RESUME PULANG RAWAT INAP</div>
        <hr class="kop-line" />
      </div>

      <!-- ── PASIEN ── -->
      <div class="r-section">
        <div class="r-section-header">PASIEN</div>
        <div class="r-grid-2">
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">Nama Pasien</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.NAMAPASIEN || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Tanggal Lahir</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.TGLLAHIR || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Usia</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.USIA_LENGKAP || pasien.USIA || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Alamat</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.ALAMAT }} – {{ pasien.namakecamatan }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">No. Telepon</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.NOTELP || '—' }}</span>
            </div>
          </div>
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">No. RM</span><span class="r-sep">:</span
              ><span class="r-val r-accent">{{ pasien.NOMR || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Jenis Kelamin</span><span class="r-sep">:</span
              ><span class="r-val">{{
                pasien.JENISKELAMIN === 'P'
                  ? 'Perempuan'
                  : pasien.JENISKELAMIN === 'L'
                    ? 'Laki-laki'
                    : '—'
              }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">NIK</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.NOKTP || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RINGKASAN MASUK ── -->
      <div class="r-section">
        <div class="r-section-header">RINGKASAN MASUK</div>
        <div class="r-grid-2">
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">No. Register</span><span class="r-sep">:</span
              ><span class="r-val r-accent">{{ data_ranap.NOPENDAFTARAN || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Ruang Rawat</span><span class="r-sep">:</span
              ><span class="r-val">{{ data_ranap.POLI || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Dokter Penerima</span><span class="r-sep">:</span
              ><span class="r-val">{{ masuk_dari.NAMADOKTER || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Tanggal Masuk</span><span class="r-sep">:</span
              ><span class="r-val">{{ data_ranap.MASUKPOLY_DISPLAY || '—' }}</span>
            </div>
          </div>
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">Diantar Oleh</span><span class="r-sep">:</span
              ><span class="r-val">{{ triase_igd.diantar_oleh || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Transportasi</span><span class="r-sep">:</span
              ><span class="r-val">{{ triase_igd.transportasi || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Dokter Rawat</span><span class="r-sep">:</span
              ><span class="r-val">{{ data_ranap.NAMADOKTER || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RINGKASAN MEDIS ── -->
      <div class="r-section">
        <div class="r-section-header">RINGKASAN MEDIS</div>

        <!-- TTV -->
        <div class="ttv-box">
          <div class="ttv-title">TANDA-TANDA VITAL (TTV)</div>
          <div class="ttv-grid">
            <div class="ttv-item">
              <div class="ttv-lbl">TEKANAN DARAH</div>
              <div class="ttv-val">
                {{ triase_igd.tensi_sistol }}/{{ triase_igd.tensi_distol }} <small>mmHg</small>
              </div>
            </div>
            <div class="ttv-item">
              <div class="ttv-lbl">SUHU</div>
              <div class="ttv-val">{{ triase_igd.suhu }} <small>°C</small></div>
            </div>
            <div class="ttv-item">
              <div class="ttv-lbl">NADI</div>
              <div class="ttv-val">{{ triase_igd.nadipermenit }} <small>x/Menit</small></div>
            </div>
            <div class="ttv-item">
              <div class="ttv-lbl">GCS</div>
              <div class="ttv-val">{{ triase_igd.gcs || '—' }}</div>
            </div>
            <div class="ttv-item">
              <div class="ttv-lbl">SPO2</div>
              <div class="ttv-val">{{ triase_igd.saturasi }} <small>%</small></div>
            </div>
            <div class="ttv-item">
              <div class="ttv-lbl">PERNAFASAN</div>
              <div class="ttv-val">{{ triase_igd.respirasi }} <small>x/Menit</small></div>
            </div>
          </div>
        </div>

        <!-- Medis detail -->
        <div class="r-grid-2 mt-3">
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">Diagnosis Masuk</span><span class="r-sep">:</span
              ><span class="r-val">{{
                (resume.dx_masuk?.dx_utama || data_ranap?.DIAGNOSA_AWAL || '—').toUpperCase()
              }}</span>
            </div>

            <div class="r-row">
              <span class="r-lbl">Diagnosis Keluar</span><span class="r-sep">:</span
              ><span class="r-val">{{
                (data_ranap?.DX_CAPTION || resume?.dx_sekunder || '—').toUpperCase()
              }}</span>
            </div>
          </div>
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">Pemeriksaan Radiologi</span><span class="r-sep">:</span
              ><span class="r-val">{{ resume.penunjang_radiologi || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Hasil lab abnormal -->
        <div v-if="obat_penunjang.hasil_lab_positiv?.length > 0" class="lab-section mt-3">
          <div class="lab-title">Hasil Lab Abnormal</div>
          <table class="r-table">
            <thead>
              <tr>
                <th>Pemeriksaan</th>
                <th>Kategori</th>
                <th>Hasil</th>
                <th>Nilai Normal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lab in obat_penunjang.hasil_lab_positiv" :key="lab.ID">
                <td>{{ lab.PEMERIKSAAN }}</td>
                <td>{{ lab.KATEGORI }}</td>
                <td class="r-accent fw-bold hasil_lab">{{ lab.HASIL }}</td>
                <td>{{ lab.NORMAL }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── RINGKASAN KELUAR ── -->
      <div class="r-section">
        <div class="r-section-header">RINGKASAN KELUAR</div>
        <div class="r-grid-2">
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">Tanggal Pulang</span><span class="r-sep">:</span
              ><span class="r-val">{{ data_ranap.KELUARPOLY || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Cara Keluar</span><span class="r-sep">:</span
              ><span class="r-val">{{ caraKeluarText }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Lama Dirawat</span><span class="r-sep">:</span
              ><span class="r-val">{{ data_masuk.display || '—' }}</span>
            </div>
          </div>
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">Keluhan Utama</span><span class="r-sep">:</span
              ><span class="r-val">{{
                triase_igd.keluhan_utama || resume.keluhan_utama || '—'
              }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Keadaan Saat Keluar</span><span class="r-sep">:</span
              ><span class="r-val">{{ data_ranap.KEADAAN_SAAT_PULANG || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── OBAT SELAMA RAWAT ── -->
      <div class="r-section" v-if="listObatRawat.length > 0">
        <div class="r-section-header">OBAT-OBATAN SELAMA RAWAT INAP</div>
        <div class="obat-rawat-wrap">
          <span v-for="(obat, i) in listObatRawat" :key="i" class="obat-chip">
            {{ obat }}
          </span>
        </div>
      </div>

      <!-- ── TERAPI PULANG ── -->
      <div class="r-section">
        <div class="r-section-header">TERAPI PULANG</div>
        <table class="r-table">
          <thead>
            <tr>
              <th>NAMA OBAT</th>
              <th>DOSIS</th>
              <th>JUMLAH</th>
              <th>SATUAN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="obat_pulang.length === 0">
              <td colspan="4" style="text-align: center; color: #adb5bd; padding: 16px">
                Tidak ada obat pulang
              </td>
            </tr>
            <tr v-for="(obat, i) in obat_pulang" :key="i">
              <td>{{ obat.NAMABARANG }}</td>
              <td>{{ obat.REMARK_ITEM || '—' }}</td>
              <td>{{ parseFloat(obat.QTY) }}</td>
              <td>{{ obat.SATUAN }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── FOOTER ── -->
      <div class="r-footer">
        <div class="r-footer-right">
          <div class="r-footer-city">
            {{ configStore.company || 'Meulaboh' }}, {{ tanggalCetak }}
          </div>
          <div class="r-footer-title">DOKTER PENANGGUNG JAWAB</div>
          <div v-if="resume.auth" class="r-qr-wrap">
            <img :src="qrUrl" alt="QR" class="r-qr" />
          </div>
          <div class="r-footer-line"></div>
          <div class="r-footer-dokter">{{ data_ranap.NAMADOKTER || '—' }}</div>
        </div>
      </div>

      <div class="r-disclaimer">
        — Dokumen ini dicetak secara elektronik dan sah tanpa tanda tangan basah
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)
const toast = useToast()
const route = useRoute()

const loading = ref(false)

// ── Data refs ─────────────────────────────────────────
const pasien = ref({})
const data_ranap = ref({})
const masuk_dari = ref({})
const triase_igd = ref({})
const resume = ref({})
const obat_pulang = ref([])
const obat_penunjang = ref({ hasil_lab_positiv: [] })
const data_masuk = ref({})

// ── Computed ──────────────────────────────────────────
const caraKeluarMap = {
  1: 'Sembuh',
  2: 'Rujuk',
  3: 'Pulang Paksa',
  4: 'Meninggal',
  7: 'Rujuk ke Rawat Inap',
  0: '—',
}
const caraKeluarText = computed(
  () => caraKeluarMap[data_ranap.value.CARA_KELUAR] || data_ranap.value.CARA_KELUAR || '—',
)

const listObatRawat = computed(() => {
  const raw = obat_penunjang.value?.obatan || ''
  return [
    ...new Set(
      raw
        .split('|')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    ),
  ]
})

const tanggalCetak = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
})

const qrUrl = computed(() => {
  if (!resume.value.auth) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(resume.value.auth)}`
})

// ── API ───────────────────────────────────────────────
async function fetchData() {
  const noreg = route.query.noreg
  if (!noreg) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'No. Register tidak ditemukan',
      life: 4000,
    })
    return
  }

  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}index.php/api/Resumepulang/getdata_resume_v2`,
      { noregister: noreg, id_client: id_client.value },
    )

    console.log(res.data)

    const d = res.data

    pasien.value = d.pasien ?? {}
    data_ranap.value = d.data_ranap ?? {}
    masuk_dari.value = d.masuk_dari ?? {}
    triase_igd.value = d.triase_igd ?? {}
    resume.value = d.resume ?? {}
    obat_pulang.value = d.obat_pulang ?? []
    obat_penunjang.value = d.obat_penunjang ?? { hasil_lab_positiv: [] }
    data_masuk.value = d.data_masuk ?? {}
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Tidak dapat memuat data resume',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

function print() {
  window.print()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ── Kop RS ── */
.kop-rs {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px 10px;
}
.kop-logo {
  border-radius: 4px;
  object-fit: contain;
  flex-shrink: 0;
}
.kop-text {
  flex: 1;
}
.kop-nama {
  font-size: 20px;
  font-weight: 700;
  color: #1a6b4a;
  text-transform: uppercase;
  line-height: 1.2;
}
.kop-alamat {
  font-size: 14px;
  color: #6c757d;
  margin-top: 3px;
}
.kop-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px 10px;
}
.kop-line {
  flex: 1;
  border: none;
  border-top: 2px solid #1a6b4a;
  margin: 0;
}
.kop-judul {
  font-size: 15px;
  font-weight: 700;
  color: #1a6b4a;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ── Wrapper ── */
.resume-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 16px;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 15px;
  color: #212529;
}
.resume-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.resume-loading {
  text-align: center;
  padding: 60px;
  color: #6c757d;
}

/* ── Document ── */
.resume-doc {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

/* ── Section ── */
.r-section {
  margin-bottom: 0;
  border-bottom: 1px solid #e9ecef;
}
.r-section:last-child {
  border-bottom: none;
}

.r-section-header {
  background: #1a6b4a;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 7px 16px;
  display: flex;
  align-items: center;
}
.r-section-header::before {
  content: '■';
  margin-right: 8px;
  font-size: 12px;
}

/* ── Grid ── */
.r-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 12px 16px;
}
.r-col {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* ── Row ── */
.r-row {
  display: flex;
  align-items: baseline;
  gap: 0;
  font-size: 14px;
}
.r-lbl {
  width: 130px;
  flex-shrink: 0;
  color: #495057;
}
.r-sep {
  width: 16px;
  flex-shrink: 0;
  text-align: center;
  color: #6c757d;
}
.r-val {
  flex: 1;
  font-weight: 500;
}
.r-accent {
  color: #1a6b4a;
  font-weight: 700;
}

.hasil_lab {
  color: #b10606;
  font-weight: 700;
}

/* ── TTV ── */
.ttv-box {
  margin: 12px 16px 0;
  border: 1px solid #b2dfce;
  border-radius: 6px;
  overflow: hidden;
}
.ttv-title {
  background: #e8f5f0;
  color: #1a6b4a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 5px 12px;
  border-bottom: 1px solid #b2dfce;
}
.ttv-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  text-align: center;
}
.ttv-item {
  padding: 10px 6px;
  border-right: 1px solid #e8f5f0;
}
.ttv-item:last-child {
  border-right: none;
}
.ttv-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
  text-transform: uppercase;
}
.ttv-val {
  font-size: 18px;
  font-weight: 700;
  color: #1a6b4a;
  line-height: 1.2;
}
.ttv-val small {
  font-size: 12px;
  font-weight: 400;
  color: #6c757d;
}
.mt-3 {
  margin-top: 10px;
}

/* ── Lab section ── */
.lab-section {
  margin: 0 16px 12px;
}
.lab-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a6b4a;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Table ── */
.r-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin: 0;
}
.r-table th {
  background: #e8f5f0;
  color: #1a6b4a;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  padding: 8px 12px;
  text-align: left;
  border-bottom: 2px solid #b2dfce;
}
.r-table td {
  padding: 7px 12px;
  border-bottom: 1px solid #f1f3f5;
  vertical-align: top;
}
.r-table tbody tr:last-child td {
  border-bottom: none;
}
.r-table tbody tr:hover td {
  background: #f8fdf9;
}

/* ── Footer ── */
.r-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px 10px;
}
.r-footer-right {
  text-align: center;
}
.r-footer-city {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 4px;
}
.r-footer-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a6b4a;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}
.r-qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}
.r-qr {
  width: 90px;
  height: 90px;
  border: 1px dashed #adb5bd;
  padding: 3px;
}
.r-footer-line {
  width: 180px;
  border-top: 1px solid #343a40;
  margin: 8px auto 4px;
}
.r-footer-dokter {
  font-size: 15px;
  font-weight: 600;
  color: #212529;
}

/* ── Obat selama rawat ── */
.obat-rawat-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 16px;
}
.obat-chip {
  display: inline-block;
  background: #f0fdf4;
  border: 1px solid #b2dfce;
  color: #1a6b4a;
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.r-disclaimer {
  text-align: center;
  font-size: 12px;
  color: #adb5bd;
  font-style: italic;
  padding: 8px 16px 14px;
  border-top: 1px dashed #dee2e6;
}

/* ── Print ── */
@media print {
  .no-print {
    display: none !important;
  }
  .resume-wrap {
    max-width: 100%;
    padding: 0;
  }
  .resume-doc {
    border: none;
    border-radius: 0;
  }
}
</style>
