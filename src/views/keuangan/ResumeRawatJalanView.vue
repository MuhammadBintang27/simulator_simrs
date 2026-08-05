<template>
  <Toast />
  <div class="resume-wrap">
    <div class="resume-toolbar no-print">
      <Button
        icon="pi pi-arrow-left"
        label="Kembali"
        text
        severity="secondary"
        @click="window.close()"
      />
      <Button
        icon="pi pi-print"
        label="Cetak"
        severity="success"
        @click="window.print()"
        :loading="loading"
      />
    </div>

    <div v-if="loading" class="resume-loading">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #1a6b4a"></i>
      <p>Memuat data resume...</p>
    </div>

    <div v-else class="resume-doc" id="resume-print">
      <!-- KOP RS -->
      <div class="kop-rs">
        <img :src="LINK_LOGO" height="70" width="70" alt="Logo RS" class="kop-logo" />
        <div class="kop-text">
          <div class="kop-nama">{{ company }}</div>
          <div class="kop-alamat">{{ ALAMAT }}</div>
        </div>
      </div>
      <div class="kop-divider">
        <hr class="kop-line" />
        <div class="kop-judul">RESUME MEDIS RAWAT JALAN</div>
        <hr class="kop-line" />
      </div>

      <!-- IDENTITAS PASIEN -->
      <div class="r-section">
        <div class="r-section-header">IDENTITAS PASIEN</div>
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
              <span class="r-lbl">Jenis Kelamin</span><span class="r-sep">:</span
              ><span class="r-val">{{
                pasien.JENISKELAMIN === 'P'
                  ? 'Perempuan'
                  : pasien.JENISKELAMIN === 'L'
                    ? 'Laki-laki'
                    : '—'
              }}</span>
            </div>
          </div>
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">No. RM</span><span class="r-sep">:</span
              ><span class="r-val r-accent">{{ pasien.NOMR || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">NIK</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.NOKTP || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Alamat</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.ALAMAT || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">No. Telepon</span><span class="r-sep">:</span
              ><span class="r-val">{{ pasien.NOTELP || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DATA KUNJUNGAN -->
      <div class="r-section">
        <div class="r-section-header">DATA KUNJUNGAN</div>
        <div class="r-grid-2">
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">No. Register</span><span class="r-sep">:</span
              ><span class="r-val r-accent">{{ dataRanap.NOPENDAFTARAN || noreg }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Poliklinik</span><span class="r-sep">:</span
              ><span class="r-val">{{ dataRanap.POLI || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Dokter</span><span class="r-sep">:</span
              ><span class="r-val">{{ dataRanap.NAMADOKTER || '—' }}</span>
            </div>
          </div>
          <div class="r-col">
            <div class="r-row">
              <span class="r-lbl">Tanggal Kunjungan</span><span class="r-sep">:</span
              ><span class="r-val">{{
                dataRanap.MASUKPOLY_DISPLAY || dataRanap.MASUKPOLY || '—'
              }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">Jenis Pembayaran</span><span class="r-sep">:</span
              ><span class="r-val">{{ dataRanap.CARABAYAR || '—' }}</span>
            </div>
            <div class="r-row">
              <span class="r-lbl">No. Kartu</span><span class="r-sep">:</span
              ><span class="r-val">{{ dataRanap.NOJAMINAN || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ANAMNESIS -->
      <div class="r-section">
        <div class="r-section-header">ANAMNESIS</div>
        <div class="r-content-pad">
          <span v-if="anamnesis" style="white-space: pre-wrap">{{ anamnesis }}</span>
          <span v-else class="r-empty">—</span>
        </div>
      </div>

      <!-- PEMERIKSAAN FISIK -->
      <div class="r-section">
        <div class="r-section-header">PEMERIKSAAN FISIK</div>
        <div class="ttv-grid">
          <div class="ttv-item">
            <div class="ttv-lbl">TENSI</div>
            <div class="ttv-val">{{ klinis.tensi || '—' }} <small>mmHg</small></div>
          </div>
          <div class="ttv-item">
            <div class="ttv-lbl">SPO2</div>
            <div class="ttv-val">{{ klinis.sp2o || '—' }} <small>%</small></div>
          </div>
          <div class="ttv-item">
            <div class="ttv-lbl">SUHU</div>
            <div class="ttv-val">{{ klinis.suhu || '—' }} <small>°C</small></div>
          </div>
          <div class="ttv-item">
            <div class="ttv-lbl">NADI</div>
            <div class="ttv-val">{{ klinis.nadi_permenit || '—' }} <small>x/Mnt</small></div>
          </div>
          <div class="ttv-item">
            <div class="ttv-lbl">RESPIRASI</div>
            <div class="ttv-val">{{ klinis.respirasi_perm || '—' }} <small>x/Mnt</small></div>
          </div>
          <div class="ttv-item">
            <div class="ttv-lbl">GCS</div>
            <div class="ttv-val">{{ klinis.cgs || '—' }}</div>
          </div>
          <div class="ttv-item">
            <div class="ttv-lbl">BERAT BADAN</div>
            <div class="ttv-val">{{ klinis.berat_badan || '—' }} <small>Kg</small></div>
          </div>
          <div class="ttv-item">
            <div class="ttv-lbl">TINGGI BADAN</div>
            <div class="ttv-val">{{ klinis.tinggi_badan || '—' }} <small>Cm</small></div>
          </div>
        </div>
      </div>

      <!-- PEMERIKSAAN PENUNJANG -->
      <div class="r-section">
        <div class="r-section-header">PEMERIKSAAN PENUNJANG</div>
        <div class="r-content-pad">
          <span v-if="klinis.penunjang || klinis.objek">{{
            klinis.penunjang || klinis.objek
          }}</span>
          <span v-else class="r-empty">—</span>
        </div>
      </div>

      <!-- DIAGNOSA + ICD (split) -->
      <div class="r-section r-split-row">
        <div class="r-split-col">
          <div class="r-section-header">DIAGNOSA</div>
          <div class="r-content-pad">
            <span v-if="klinis.asesmen" style="white-space: pre-wrap">{{ klinis.asesmen }}</span>
            <span v-else class="r-empty">—</span>
          </div>
        </div>
        <div class="r-split-col r-split-border">
          <div class="r-section-header">ICD 9/10</div>
          <div class="r-content-pad">
            <div class="r-icd-group">
              <span class="r-icd-lbl">Diagnosa</span>
              <div class="r-icd-val">
                <div v-for="(dx, i) in listDiagnosa" :key="i">
                  {{ dx.kode }}-{{ dx.nama }} ({{ dx.prioritas }})
                </div>
                <span v-if="listDiagnosa.length === 0" class="r-empty">—</span>
              </div>
            </div>
            <hr class="r-thin-line" />
            <div class="r-icd-group">
              <span class="r-icd-lbl">Procedure</span>
              <div class="r-icd-val">
                <span v-if="klinis.procedure" style="white-space: pre-wrap">{{
                  klinis.procedure
                }}</span>
                <span v-else class="r-empty">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TERAPI + TINDAKAN (split) -->
      <div class="r-section r-split-row" style="border-top: none">
        <div class="r-split-col">
          <div class="r-section-header">TERAPI / OBAT YANG DIBERIKAN</div>
          <div class="r-content-pad">
            <div v-if="listObat.length > 0">
              <div v-for="(obat, i) in listObat" :key="i" style="margin-bottom: 3px">
                {{ obat.nama
                }}<span v-if="obat.aturan" style="color: #6c757d"> — {{ obat.aturan }}</span>
              </div>
            </div>
            <span v-else class="r-empty">—</span>
          </div>
        </div>
        <div class="r-split-col r-split-border">
          <div class="r-section-header">TINDAKAN</div>
          <div class="r-content-pad">
            <div v-if="listTindakan.length > 0">
              <div
                v-for="(t, i) in listTindakan"
                :key="i"
                style="margin-bottom: 3px; font-weight: 600"
              >
                {{ t }}
              </div>
            </div>
            <span v-else class="r-empty">—</span>
          </div>
        </div>
      </div>

      <!-- RENCANA TINDAK LANJUT -->
      <div class="r-section">
        <div class="r-section-header">RENCANA TINDAK LANJUT (PLAN)</div>
        <div class="r-content-pad">
          <span v-if="klinis.plan" style="white-space: pre-wrap">{{ klinis.plan }}</span>
          <span v-else class="r-empty">—</span>
        </div>
      </div>

      <!-- CATATAN DOKTER (kondisional) -->
      <div v-if="klinis.catatan_dokter" class="r-section">
        <div class="r-section-header">CATATAN DOKTER</div>
        <div class="r-content-pad" style="white-space: pre-wrap">{{ klinis.catatan_dokter }}</div>
      </div>

      <!-- FOOTER -->
      <div class="r-footer">
        <div class="r-footer-right">
          <div class="r-footer-city">{{ ALAMAT }}, {{ tanggalKunjungan }}</div>
          <div class="r-footer-title">DOKTER PENANGGUNG JAWAB PASIEN</div>
          <div v-if="dataRanap.NAMADOKTER" class="r-qr-wrap">
            <QrcodeVue :value="dataRanap.NAMADOKTER" :size="40" level="M" render-as="svg" />
          </div>
          <div class="r-footer-line"></div>
          <div class="r-footer-dokter">{{ dataRanap.NAMADOKTER || '—' }}</div>
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
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)
const toast = useToast()
const route = useRoute()

const noreg = route.query.noreg || ''
const loading = ref(false)
const pasien = ref({})
const dataRanap = ref({})
const klinis = ref({})

const anamnesis = computed(() => {
  const parts = [klinis.value?.keluhan_utama, klinis.value?.subjek].filter(Boolean)
  return parts.join('\n') || ''
})

const listDiagnosa = computed(() => {
  const raw = klinis.value?.diagnosa || ''
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const m = s.match(/^([A-Z][0-9A-Z.]+)-(.+?)\((\d)\)\s*$/)
      if (m) return { kode: m[1], nama: m[2].trim(), prioritas: m[3] }
      return { kode: '', nama: s, prioritas: '0' }
    })
})

const listObat = computed(() => {
  const raw = klinis.value?.obat || ''
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => {
      const atIdx = s.indexOf('@')
      if (atIdx !== -1) {
        const nama = s.substring(0, atIdx).trim()
        const parts = s
          .substring(atIdx + 1)
          .trim()
          .split(/\s{2,}/)
        return { nama, aturan: (parts[1] || '').trim() }
      }
      return { nama: s, aturan: '' }
    })
})

const listTindakan = computed(() => {
  const raw = klinis.value?.tindakan_non_icd || ''
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
})

const tanggalCetak = computed(() =>
  new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
)

const tanggalKunjungan = computed(() => {
  const raw = dataRanap.value?.MASUKPOLY_DISPLAY || dataRanap.value?.MASUKPOLY || ''
  return raw ? raw.split(' ')[0] : tanggalCetak.value
})

async function fetchData() {
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
    const [resumeRes, klinesRes] = await Promise.all([
      axios.post(`${configStore.apiBaseUrl}index.php/api/Resumepulang/getdata_resume_v2`, {
        noregister: noreg,
        id_client: id_client.value,
      }),
      axios.get(
        `${configStore.apiBaseUrl}index.php/api/transaksi_pasien/getdata_asesmen/${noreg}/${id_client.value}`,
      ),
    ])
    pasien.value = resumeRes.data?.pasien ?? {}
    dataRanap.value = resumeRes.data?.data_ranap ?? {}
    klinis.value = klinesRes.data?.response ?? {}
  } catch {
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

onMounted(fetchData)
</script>

<style scoped>
.resume-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 16px;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
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
.resume-doc {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

/* ── KOP RS ── */
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
  font-size: 13px;
  color: #6c757d;
  margin-top: 3px;
}
.kop-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px 12px;
}
.kop-line {
  flex: 1;
  border: none;
  border-top: 2px solid #1a6b4a;
  margin: 0;
}
.kop-judul {
  font-size: 14px;
  font-weight: 700;
  color: #1a6b4a;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

/* ── Section ── */
.r-section {
  border-bottom: 1px solid #e9ecef;
}
.r-section:last-of-type {
  border-bottom: none;
}
.r-section-header {
  background: #1a6b4a;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 7px 16px;
  display: flex;
  align-items: center;
}
.r-section-header::before {
  content: '■';
  margin-right: 8px;
  font-size: 11px;
}

/* ── Grid identitas / kunjungan ── */
.r-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 10px 16px;
  gap: 0;
}
.r-col {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.r-row {
  display: flex;
  align-items: baseline;
  font-size: 13px;
}
.r-lbl {
  width: 130px;
  flex-shrink: 0;
  color: #495057;
}
.r-sep {
  width: 14px;
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
.r-empty {
  color: #adb5bd;
  font-style: italic;
}

/* ── Content pad ── */
.r-content-pad {
  padding: 10px 16px;
  font-size: 13px;
  line-height: 1.6;
}

/* ── TTV Grid ── */
.ttv-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  text-align: center;
  border-top: none;
}
.ttv-item {
  padding: 10px 6px;
  border-right: 1px solid #e9ecef;
}
.ttv-item:last-child {
  border-right: none;
}
.ttv-lbl {
  font-size: 10px;
  font-weight: 700;
  color: #6c757d;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
  text-transform: uppercase;
}
.ttv-val {
  font-size: 16px;
  font-weight: 700;
  color: #1a6b4a;
  line-height: 1.2;
}
.ttv-val small {
  font-size: 10px;
  font-weight: 400;
  color: #6c757d;
}

/* ── Split (diagnosa / tindakan) ── */
.r-split-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.r-split-col {
  display: flex;
  flex-direction: column;
}
.r-split-border {
  border-left: 1px solid #e9ecef;
}

/* ── ICD ── */
.r-icd-group {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
}
.r-icd-lbl {
  width: 70px;
  flex-shrink: 0;
  color: #495057;
  font-weight: 600;
}
.r-icd-val {
  flex: 1;
  line-height: 1.6;
}
.r-thin-line {
  border: none;
  border-top: 1px dashed #dee2e6;
  margin: 2px 0;
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
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}
.r-footer-title {
  font-size: 13px;
  font-weight: 700;
  color: #1a6b4a;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}
.r-qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
}
.r-footer-line {
  width: 180px;
  border-top: 1px solid #343a40;
  margin: 4px auto 4px;
}
.r-footer-dokter {
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}
.r-disclaimer {
  text-align: center;
  font-size: 11px;
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
