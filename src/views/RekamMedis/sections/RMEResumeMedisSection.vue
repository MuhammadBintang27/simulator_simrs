<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-file-word" style="color: #1a3a5f"></i>
      RESUME MEDIS / DISCHARGE SUMMARY
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data resume medis...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data Resume Medis untuk kunjungan ini.
    </div>

    <div v-else class="rs-body">
      <!-- ── PASIEN ──────────────────────────────────────────────────────────── -->
      <div class="rs-block">
        <div class="rs-block-hdr">IDENTITAS PASIEN</div>
        <div class="rs-grid-2 rs-pad">
          <div>
            <div class="rs-row">
              <span class="rs-lbl">Nama Pasien</span><span class="rs-sep">:</span
              ><span class="rs-val rs-accent">{{ pasien.NAMAPASIEN || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Tanggal Lahir</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ pasien.TGLLAHIR || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Usia</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ pasien.USIA_LENGKAP || pasien.USIA || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Alamat</span><span class="rs-sep">:</span
              ><span class="rs-val"
                >{{ pasien.ALAMAT
                }}{{ pasien.namakecamatan ? ' – ' + pasien.namakecamatan : '' }}</span
              >
            </div>
            <div class="rs-row">
              <span class="rs-lbl">No. Telepon</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ pasien.NOTELP || '—' }}</span>
            </div>
          </div>
          <div>
            <div class="rs-row">
              <span class="rs-lbl">No. RM</span><span class="rs-sep">:</span
              ><span class="rs-val rs-accent rs-bold">{{ pasien.NOMR || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Jenis Kelamin</span><span class="rs-sep">:</span
              ><span class="rs-val">{{
                pasien.JENISKELAMIN === 'P'
                  ? 'Perempuan'
                  : pasien.JENISKELAMIN === 'L'
                    ? 'Laki-laki'
                    : '—'
              }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">NIK</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ pasien.NOKTP || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RINGKASAN MASUK ─────────────────────────────────────────────────── -->
      <div class="rs-block">
        <div class="rs-block-hdr">RINGKASAN MASUK</div>
        <div class="rs-grid-2 rs-pad">
          <div>
            <div class="rs-row">
              <span class="rs-lbl">No. Register</span><span class="rs-sep">:</span
              ><span class="rs-val rs-accent rs-bold">{{ data_ranap.NOPENDAFTARAN || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Ruang Rawat</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ data_ranap.POLI || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Dokter Penerima</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ masuk_dari.NAMADOKTER || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Tanggal Masuk</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ masuk_dari.MASUKPOLY_DISPLAY || '-' }} </span>
              <!-- <p> {{data_ranap.MASUKPOLY_DISPLAY }}</p> -->
            </div>
          </div>
          <div>
            <div class="rs-row">
              <span class="rs-lbl">Diantar Oleh</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ triase_igd.diantar_oleh || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Transportasi</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ triase_igd.transportasi || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Dokter Rawat</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ data_ranap.NAMADOKTER || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RINGKASAN MEDIS ─────────────────────────────────────────────────── -->
      <div class="rs-block">
        <div class="rs-block-hdr">RINGKASAN MEDIS</div>

        <!-- TTV -->
        <div class="rs-ttv-wrap rs-pad-x">
          <div class="rs-ttv-title">TANDA-TANDA VITAL (TTV)</div>
          <div class="rs-ttv-grid">
            <div class="rs-ttv-item">
              <div class="rs-ttv-lbl">TEKANAN DARAH</div>
              <div class="rs-ttv-val">
                {{ triase_igd.tensi_sistol || '—' }}/{{ triase_igd.tensi_distol || '—' }}
                <small>mmHg</small>
              </div>
            </div>
            <div class="rs-ttv-item">
              <div class="rs-ttv-lbl">SUHU</div>
              <div class="rs-ttv-val">{{ triase_igd.suhu || '—' }} <small>°C</small></div>
            </div>
            <div class="rs-ttv-item">
              <div class="rs-ttv-lbl">NADI</div>
              <div class="rs-ttv-val">
                {{ triase_igd.nadipermenit || '—' }} <small>x/mnt</small>
              </div>
            </div>
            <div class="rs-ttv-item">
              <div class="rs-ttv-lbl">GCS</div>
              <div class="rs-ttv-val">{{ triase_igd.gcs || '—' }}</div>
            </div>
            <div class="rs-ttv-item">
              <div class="rs-ttv-lbl">SPO₂</div>
              <div class="rs-ttv-val">{{ triase_igd.saturasi || '—' }} <small>%</small></div>
            </div>
            <div class="rs-ttv-item">
              <div class="rs-ttv-lbl">PERNAPASAN</div>
              <div class="rs-ttv-val">{{ triase_igd.respirasi || '—' }} <small>x/mnt</small></div>
            </div>
          </div>
        </div>

        <!-- Diagnosis -->
        <div class="rs-grid-2 rs-pad rs-pt-0">
          <div>
            <div class="rs-row">
              <span class="rs-lbl">Keluhan Utama</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ resume.keluhan_utama || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Diagnosis Utama</span><span class="rs-sep">:</span
              ><span class="rs-val">{{
                (resume?.dx_akhir?.response?.dx_utama || '—').toUpperCase()
              }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Diagnosis Sekunder</span><span class="rs-sep">:</span
              ><span class="rs-val rs-bold">{{
                (resume.dx_akhir?.response.dx_sekunder || '—').toUpperCase()
              }}</span>
            </div>
          </div>
          <div>
            <div class="rs-row rs-row-penunjang">
              <span class="rs-lbl">Pemeriksaan Radiologi</span><span class="rs-sep">:</span>
              <span class="rs-val">
                <template v-if="obat_penunjang.radiologi">
                  <span
                    v-for="(item, i) in obat_penunjang.radiologi
                      .split('|')
                      .map((s) => s.trim())
                      .filter(Boolean)"
                    :key="i"
                    class="rs-badge rs-badge-radio"
                    >{{ item }}</span
                  >
                </template>
                <span v-else>—</span>
              </span>
            </div>
            <div class="rs-row rs-row-penunjang">
              <span class="rs-lbl">Pemeriksaan Lab</span><span class="rs-sep">:</span>
              <span class="rs-val">
                <template v-if="obat_penunjang.lab">
                  <span
                    v-for="(item, i) in obat_penunjang.lab
                      .split('|')
                      .map((s) => s.trim())
                      .filter(Boolean)"
                    :key="i"
                    class="rs-badge rs-badge-lab"
                    >{{ item }}</span
                  >
                </template>
                <span v-else>—</span>
              </span>
            </div>
            <div class="rs-row rs-row-penunjang">
              <span class="rs-lbl">Procedure</span><span class="rs-sep">:</span>
              <span class="rs-val">
                {{ resume.prosedur || '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Hasil Lab Abnormal -->
        <div v-if="obat_penunjang.hasil_lab_positiv?.length > 0" class="rs-lab-section rs-pad-x">
          <div class="rs-lab-title">Hasil Lab Abnormal</div>
          <table class="rs-table">
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
                <td class="rs-lab-abnormal">{{ lab.HASIL }}</td>
                <td>{{ lab.NORMAL }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── RINGKASAN KELUAR ────────────────────────────────────────────────── -->
      <div class="rs-block">
        <div class="rs-block-hdr">RINGKASAN KELUAR</div>
        <div class="rs-grid-2 rs-pad">
          <div>
            <div class="rs-row">
              <span class="rs-lbl">Tanggal Pulang</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ data_ranap.KELUARPOLY || '—' }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Cara Keluar</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ data_ranap.STTS_PULANG }}</span>
            </div>
            <div class="rs-row">
              <span class="rs-lbl">Lama Dirawat</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ data_masuk.display || '—' }}</span>
            </div>
          </div>
          <div>
            <div class="rs-row">
              <span class="rs-lbl">Keadaan Saat Keluar</span><span class="rs-sep">:</span
              ><span class="rs-val">{{ data_ranap.KEADAAN_SAAT_PULANG || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- ── OBAT SELAMA RAWAT ───────────────────────────────────────────────── -->
      <div v-if="listObatRawat.length > 0" class="rs-block">
        <div class="rs-block-hdr">OBAT-OBATAN SELAMA RAWAT INAP</div>
        <div class="rs-obat-chips rs-pad">
          <span v-for="(obat, i) in listObatRawat" :key="i" class="rs-obat-chip">{{ obat }}</span>
        </div>
      </div>

      <!-- ── TERAPI PULANG ───────────────────────────────────────────────────── -->
      <div class="rs-block">
        <div class="rs-block-hdr">TERAPI PULANG</div>
        <table class="rs-table rs-table-full">
          <thead>
            <tr>
              <th>NAMA OBAT</th>
              <th>DOSIS</th>
              <th style="width: 70px; text-align: center">JUMLAH</th>
              <th style="width: 80px">SATUAN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="obat_pulang.length === 0">
              <td colspan="4" class="rs-empty-cell">Tidak ada obat pulang</td>
            </tr>
            <tr v-for="(obat, i) in obat_pulang" :key="i">
              <td>{{ obat.NAMABARANG }}</td>
              <td>{{ obat.REMARK_ITEM || '—' }}</td>
              <td style="text-align: center">{{ parseFloat(obat.QTY) }}</td>
              <td>{{ obat.SATUAN }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── TANDA TANGAN / OTORISASI ───────────────────────────────────────── -->
      <div class="rs-footer">
        <div class="rs-footer-inner">
          <div class="rs-footer-city">
            <span v-if="data_ranap.KELUARPOLY_NULL"> {{ ALAMAT || '' }},</span>
            {{
              data_ranap.KELUARPOLY_NULL
                ? new Date(data_ranap.KELUARPOLY_NULL).toLocaleDateString('id-ID', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Belum di pulangkan'
            }}
          </div>
          <div class="rs-footer-title">DOKTER PENANGGUNG JAWAB</div>
          <!-- <div v-if="resume.auth" class="rs-qr-wrap"> -->
          <QrcodeVue :value="resume.auth" :size="40" level="M" render-as="svg" />
          <!-- </div> -->
          <div class="rs-footer-line"></div>
          <div class="rs-footer-dokter">{{ data_ranap.NAMADOKTER || '—' }}</div>
        </div>
      </div>

      <div class="rs-disclaimer">
        — Dokumen ini dicetak secara elektronik dan sah tanpa tanda tangan basah
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, ALAMAT } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})
const addTimelineEvent = inject('addTimelineEvent', () => {})

// ── State ──────────────────────────────────────────────────────────────────────
const loading = ref(true)
const error = ref(null)

const pasien = ref({})
const data_ranap = ref({})
const masuk_dari = ref({})
const triase_igd = ref({})
const resume = ref({})
const obat_pulang = ref([])
const obat_penunjang = ref({ hasil_lab_positiv: [] })
const data_masuk = ref({})

// ── Computed ───────────────────────────────────────────────────────────────────
const hasData = computed(() => !!data_ranap.value?.NOPENDAFTARAN)

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

// ── Fetch ──────────────────────────────────────────────────────────────────────
const fetchData = async () => {
  if (!props.noreg) return
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}index.php/api/Resumepulang/getdata_resume_v2`, {
      noregister: props.noreg,
      id_client: id_client.value,
    })
    console.log('data resume', JSON.stringify(res.data.masuk_dari.MASUKPOLY))
    const d = res.data
    pasien.value = d.pasien ?? {}
    data_ranap.value = d.data_ranap ?? {}
    masuk_dari.value = d.masuk_dari ?? {}
    triase_igd.value = d.triase_igd ?? {}
    resume.value = d.resume ?? {}
    obat_pulang.value = d.obat_pulang ?? []
    obat_penunjang.value = d.obat_penunjang ?? { hasil_lab_positiv: [] }
    data_masuk.value = d.data_masuk ?? {}
  } catch (e) {
    error.value = 'Gagal memuat data resume medis: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    const hasResume = !!data_ranap.value?.NOPENDAFTARAN
    reportSectionData('resume', hasResume)
    if (hasResume && data_ranap.value?.KELUARPOLY) {
      addTimelineEvent('keluar', {
        key: 'keluar',
        label: 'Keluar / Pulang',
        icon: '🏠',
        color: '#1a6b4a',
        datetime: data_ranap.value.KELUARPOLY,
        meta: caraKeluarText.value || '',
        duration: data_masuk.value?.display || '',
      })
    }
  }
}

watch(
  () => props.noreg,
  (val) => {
    if (val) fetchData()
  },
  { immediate: true },
)
</script>

<style scoped>
/* ── Body wrapper ────────────────────────────────────────────────── */
.rs-body {
  font-size: 13px;
  color: #212529;
}

/* ── Block / Section ─────────────────────────────────────────────── */
.rs-block {
  border-bottom: 1px solid #dde5ee;
}
.rs-block:last-child {
  border-bottom: none;
}

.rs-block-hdr {
  background: linear-gradient(90deg, #dde8f4 0%, #edf3fa 100%);
  color: #162d4e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  padding: 5px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-left: 3px solid #4a7ab5;
}
.rs-block-hdr::before {
  content: '■';
  font-size: 10px;
  opacity: 0.5;
}

/* ── Grid & Row ──────────────────────────────────────────────────── */
.rs-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}
.rs-pad {
  padding: 8px 12px;
}
.rs-pad-x {
  padding: 0 12px;
}
.rs-pt-0 {
  padding-top: 4px;
}

.rs-row {
  display: flex;
  align-items: baseline;
  gap: 0;
  font-size: 12px;
  padding: 2px 0;
}
.rs-lbl {
  width: 140px;
  flex-shrink: 0;
  color: #6c757d;
  font-size: 12px;
}
.rs-sep {
  width: 14px;
  flex-shrink: 0;
  text-align: center;
  color: #adb5bd;
}
.rs-val {
  flex: 1;
  font-weight: 500;
  font-size: 12px;
}
.rs-accent {
  color: #1a3a5f;
}
.rs-bold {
  font-weight: 700;
}

/* ── Penunjang Badges ─────────────────────────────────────────────── */
.rs-row-penunjang {
  align-items: flex-start;
}
.rs-badge {
  display: inline-block;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  margin: 1px 2px 1px 0;
  line-height: 1.6;
}
.rs-badge-lab {
  background: #e8f4fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}
.rs-badge-radio {
  background: #fdf3e8;
  color: #e65100;
  border: 1px solid #ffcc80;
}

/* ── TTV ─────────────────────────────────────────────────────────── */
.rs-ttv-wrap {
  margin: 8px 0;
  border: 1px solid #b2c8dd;
  border-radius: 4px;
  overflow: hidden;
}
.rs-ttv-title {
  background: #e6edf7;
  color: #1a3a5f;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-bottom: 1px solid #b2c8dd;
}
.rs-ttv-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  text-align: center;
}
.rs-ttv-item {
  padding: 8px 4px;
  border-right: 1px solid #dde8f4;
}
.rs-ttv-item:last-child {
  border-right: none;
}
.rs-ttv-lbl {
  font-size: 10px;
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 0.03em;
  margin-bottom: 3px;
  text-transform: uppercase;
}
.rs-ttv-val {
  font-size: 15px;
  font-weight: 700;
  color: #162d4e;
  line-height: 1.2;
}
.rs-ttv-val small {
  font-size: 11px;
  font-weight: 400;
  color: #6c757d;
}

/* ── Lab abnormal ────────────────────────────────────────────────── */
.rs-lab-section {
  margin-bottom: 8px;
}
.rs-lab-title {
  font-size: 12px;
  font-weight: 600;
  color: #1a3a5f;
  margin: 6px 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rs-lab-abnormal {
  color: #a04040;
  font-weight: 700;
}

/* ── Table ───────────────────────────────────────────────────────── */
.rs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.rs-table th {
  background: #e6edf7;
  color: #162d4e;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 6px 10px;
  text-align: left;
  border-bottom: 2px solid #b2c8dd;
}
.rs-table td {
  padding: 5px 10px;
  border-bottom: 1px solid #f1f3f5;
  vertical-align: top;
}
.rs-table tbody tr:last-child td {
  border-bottom: none;
}
.rs-empty-cell {
  text-align: center;
  color: #adb5bd;
  padding: 12px !important;
}

/* ── Obat chips ──────────────────────────────────────────────────── */
.rs-obat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.rs-obat-chip {
  display: inline-block;
  background: #f0f5fc;
  border: 1px solid #b2c8dd;
  color: #1a3a5f;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

/* ── Footer ──────────────────────────────────────────────────────── */
.rs-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px 8px;
}
.rs-footer-inner {
  text-align: center;
}
.rs-footer-city {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 3px;
}
.rs-footer-title {
  font-size: 12px;
  font-weight: 700;
  color: #1a3a5f;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.rs-qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
}
.rs-footer-line {
  width: 160px;
  border-top: 1px solid #343a40;
  margin: 6px auto 3px;
}
.rs-footer-dokter {
  font-size: 13px;
  font-weight: 600;
  color: #212529;
}

/* ── Disclaimer ──────────────────────────────────────────────────── */
.rs-disclaimer {
  text-align: center;
  font-size: 11px;
  color: #adb5bd;
  font-style: italic;
  padding: 6px 12px 10px;
  border-top: 1px dashed #dee2e6;
}

/* ── Print ───────────────────────────────────────────────────────── */
@media print {
  .rs-ttv-wrap {
    border-color: #b2c8dd;
  }
  .rs-block-hdr {
    background: #dde8f4 !important;
    color: #162d4e !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .rs-table th {
    background: #e6edf7 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .rs-ttv-title {
    background: #e6edf7 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
