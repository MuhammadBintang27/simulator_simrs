<template>
  <div class="rme-section">
    <div
      class="rme-section-title"
      style="background: linear-gradient(90deg, #faf5ff, #fdf8ff); border-left-color: #7b1fa2"
    >
      <i class="pi pi-id-card" style="color: #7b1fa2"></i> ASESMEN PRA-ANESTESI
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.
    </div>
    <div v-else-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data asesmen pra-anestesi...
    </div>
    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>
    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada data asesmen pra-anestesi.
    </div>

    <div v-else>
      <!-- ANAMNESA -->
      <div class="apa-block">
        <div class="apa-block-hdr">ANAMNESA</div>
        <div class="apa-row">
          <span class="apa-lbl">Anamnesa Dari</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.anamnesa?.dari || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Riwayat Anestesi</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.anamnesa?.riwayatAnestesi || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Komplikasi</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.anamnesa?.komplikasi || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Riwayat Alergi</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.anamnesa?.riwayatAlergi || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Obat-obatan</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.anamnesa?.obatObatan || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Riwayat Penyakit</span><span class="apa-sep">:</span>
          <span class="apa-val">
            <span v-if="data.anamnesa?.riwayatPenyakit?.length" class="apa-tag-list">
              <span v-for="p in data.anamnesa.riwayatPenyakit" :key="p" class="apa-tag">{{
                p
              }}</span>
            </span>
            <span v-else>-</span>
          </span>
        </div>
      </div>

      <!-- PEMERIKSAAN FISIK -->
      <div class="apa-block">
        <div class="apa-block-hdr">PEMERIKSAAN FISIK</div>
        <div class="apa-row">
          <span class="apa-lbl">Berat Badan</span><span class="apa-sep">:</span
          ><span class="apa-val">{{
            data.fisik?.beratBadan != null ? data.fisik.beratBadan + ' kg' : '-'
          }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Tinggi Badan</span><span class="apa-sep">:</span
          ><span class="apa-val">{{
            data.fisik?.tinggiBadan != null ? data.fisik.tinggiBadan + ' cm' : '-'
          }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">IMT</span><span class="apa-sep">:</span
          ><span class="apa-val">{{
            data.fisik?.imt != null ? Number(data.fisik.imt).toFixed(1) : '-'
          }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Mallampati</span><span class="apa-sep">:</span>
          <span class="apa-val">{{
            data.fisik?.mallampati_label ||
            (data.fisik?.mallampati != null ? 'Kelas ' + data.fisik.mallampati : '-')
          }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Status ASA</span><span class="apa-sep">:</span>
          <span class="apa-val">{{
            data.fisik?.status_asa_label ||
            (data.fisik?.statusAsa != null ? 'ASA ' + data.fisik.statusAsa : '-')
          }}</span>
        </div>
      </div>

      <!-- ADIKSI -->
      <div class="apa-block">
        <div class="apa-block-hdr">RIWAYAT ADIKSI</div>
        <div class="apa-row">
          <span class="apa-lbl">Alkohol</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ adiksiLabel(data.adiksi?.alkohol) }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Obat Terlarang</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ adiksiLabel(data.adiksi?.obatTerlarang) }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Merokok</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ adiksiLabel(data.adiksi?.merokok) }}</span>
        </div>
      </div>

      <!-- TANDA VITAL -->
      <div class="apa-block">
        <div class="apa-block-hdr">TANDA VITAL</div>
        <div class="apa-ttv-grid">
          <div class="apa-ttv-item">
            <div class="apa-ttv-lbl">Nadi</div>
            <div class="apa-ttv-val">
              {{ data.tandaVital?.nadi != null ? data.tandaVital.nadi + ' bpm' : '-' }}
            </div>
          </div>
          <div class="apa-ttv-item">
            <div class="apa-ttv-lbl">Nafas</div>
            <div class="apa-ttv-val">
              {{ data.tandaVital?.nafas != null ? data.tandaVital.nafas + ' x/mnt' : '-' }}
            </div>
          </div>
          <div class="apa-ttv-item">
            <div class="apa-ttv-lbl">Tek. Darah</div>
            <div class="apa-ttv-val">
              {{
                data.tandaVital?.tekananDarahSistolik != null &&
                data.tandaVital?.tekananDarahDiastolik != null
                  ? data.tandaVital.tekananDarahSistolik +
                    '/' +
                    data.tandaVital.tekananDarahDiastolik +
                    ' mmHg'
                  : '-'
              }}
            </div>
          </div>
          <div class="apa-ttv-item">
            <div class="apa-ttv-lbl">Suhu</div>
            <div class="apa-ttv-val">
              {{ data.tandaVital?.suhuBadan != null ? data.tandaVital.suhuBadan + ' °C' : '-' }}
            </div>
          </div>
          <div class="apa-ttv-item">
            <div class="apa-ttv-lbl">SpO₂</div>
            <div class="apa-ttv-val">
              {{ data.tandaVital?.spo2 != null ? data.tandaVital.spo2 + ' %' : '-' }}
            </div>
          </div>
          <div class="apa-ttv-item">
            <div class="apa-ttv-lbl">Skor Nyeri</div>
            <div class="apa-ttv-val">
              {{ data.tandaVital?.skorNyeri != null ? data.tandaVital.skorNyeri + '/10' : '-' }}
            </div>
          </div>
        </div>
      </div>

      <!-- RENCANA ANESTESI -->
      <div class="apa-block">
        <div class="apa-block-hdr">RENCANA ANESTESI</div>
        <div class="apa-row">
          <span class="apa-lbl">Jenis Anestesi</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ labelAnestesi(data.rencana?.jenisAnestesi) || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Teknik Anestesi</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ labelTeknik(data.rencana?.teknikAnestesi) || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Posisi Operasi</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ labelPosisi(data.rencana?.posisiOperasi) || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Tanggal Operasi</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.rencana?.tanggalOperasi || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">Diagnosa</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.rencana?.diagnosa || '-' }}</span>
        </div>
        <div v-if="data.rencana?.catatan" class="apa-row apa-row-wrap">
          <span class="apa-lbl">Catatan</span><span class="apa-sep">:</span>
          <span class="apa-val">{{ data.rencana.catatan }}</span>
        </div>
      </div>

      <!-- TANDA TANGAN -->
      <div class="apa-block">
        <div class="apa-block-hdr">TANDA TANGAN DOKTER ANESTESI</div>
        <div class="apa-row">
          <span class="apa-lbl">Nama Dokter</span><span class="apa-sep">:</span
          ><span class="apa-val">{{ data.tanda_tangan?.nama_dokter_anestesi || '-' }}</span>
        </div>
        <div class="apa-row">
          <span class="apa-lbl">TTE</span><span class="apa-sep">:</span>
          <span class="apa-val">
            <span v-if="data.tanda_tangan?.tte_dokter_anestesi" class="apa-tte-ok"
              >&#10003; Sudah ditandatangani</span
            >
            <span v-else class="apa-tte-empty">Belum ditandatangani</span>
          </span>
        </div>
        <div v-if="data.tanda_tangan?.tte_waktu_dokter_anestesi" class="apa-row">
          <span class="apa-lbl">Waktu TTE</span><span class="apa-sep">:</span>
          <span class="apa-val">{{ data.tanda_tangan.tte_waktu_dokter_anestesi }}</span>
        </div>
      </div>

      <!-- METADATA -->
      <div class="apa-meta">
        <span v-if="data.created_at">Dibuat: {{ data.created_at }}</span>
        <span v-if="data.last_update" class="apa-meta-sep">|</span>
        <span v-if="data.last_update">Diperbarui: {{ data.last_update }}</span>
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

const hasData = computed(
  () =>
    !!(
      data.value?.anamnesa?.dari ||
      data.value?.fisik?.beratBadan != null ||
      data.value?.rencana?.jenisAnestesi
    ),
)

const jenisMap = {
  ga: 'Anestesi Umum (GA)',
  regional: 'Anestesi Regional',
  lokal: 'Anestesi Lokal',
  kombinasi: 'Anestesi Kombinasi',
}
const teknikMap = {
  ett: 'Intubasi ETT',
  lma: 'LMA',
  spinal: 'Spinal',
  epidural: 'Epidural',
  blok: 'Blok Saraf Perifer',
  tiva: 'TIVA',
}
const posisiMap = {
  supine: 'Supine (Telentang)',
  prone: 'Prone (Tengkurap)',
  'lateral-kanan': 'Lateral Dekubitus Kanan',
  'lateral-kiri': 'Lateral Dekubitus Kiri',
  litotomi: 'Litotomi',
  trendelenburg: 'Trendelenburg',
  fowler: 'Fowler',
}

const labelAnestesi = (v) => jenisMap[v] || v
const labelTeknik = (v) => teknikMap[v] || v
const labelPosisi = (v) => posisiMap[v] || v
const adiksiLabel = (v) => (v === 'ya' ? 'Ya' : v === 'tidak' ? 'Tidak' : v || '-')

const fetchData = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/triaseigd/get_pra_anestesi`, {
      kode_booking: kodebok,
      no_register: noregisterOperasi.value || props.noreg,
      id_client: id_client.value,
    })
    if (res.data?.status && res.data?.code === 200 && res.data?.data) {
      data.value = res.data.data
    }
  } catch (e) {
    error.value = 'Gagal memuat asesmen pra-anestesi: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('ass-pra-anestesi', hasData.value)
  }
}

watch(
  kodebookingOperasi,
  (val) => {
    if (val) fetchData(val)
    else reportSectionData('ass-pra-anestesi', false)
  },
  { immediate: true },
)
</script>

<style scoped>
.apa-block {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  margin-bottom: 0.65rem;
  overflow: hidden;
}
.apa-block-hdr {
  background: linear-gradient(90deg, #f8f9fa, #fff);
  border-bottom: 1px solid #dee2e6;
  border-left: 3px solid #7b1fa2;
  padding: 0.3rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #212529;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.apa-row {
  display: flex;
  align-items: baseline;
  padding: 0.22rem 0.6rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.8rem;
}
.apa-row:last-child {
  border-bottom: none;
}
.apa-row-wrap .apa-val {
  white-space: pre-wrap;
  word-break: break-word;
}
.apa-lbl {
  width: 140px;
  min-width: 140px;
  color: #495057;
  font-weight: 600;
  font-size: 0.78rem;
}
.apa-sep {
  width: 12px;
  color: #adb5bd;
  flex-shrink: 0;
}
.apa-val {
  flex: 1;
  color: #212529;
}
.apa-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
.apa-tag {
  background: #f3e8ff;
  border: 1px solid #d8b4fe;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 0.72rem;
  color: #212529;
  font-weight: 600;
}
.apa-ttv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding: 0.35rem 0.5rem;
}
.apa-ttv-item {
  text-align: center;
  padding: 0.3rem 0.4rem;
  border-right: 1px solid #e9ecef;
}
.apa-ttv-item:nth-child(3n) {
  border-right: none;
}
.apa-ttv-lbl {
  font-size: 0.68rem;
  color: #495057;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.15rem;
}
.apa-ttv-val {
  font-size: 0.88rem;
  font-weight: 700;
  color: #212529;
}
.apa-tte-ok {
  color: #212529;
  font-weight: 600;
}
.apa-tte-empty {
  color: #6c757d;
  font-style: italic;
}
.apa-meta {
  font-size: 0.72rem;
  color: #6c757d;
  text-align: right;
  margin-top: 0.3rem;
}
.apa-meta-sep {
  margin: 0 0.4rem;
}
</style>
