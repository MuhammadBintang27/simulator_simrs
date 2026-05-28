<template>
  <section class="content">
    <div class="print-container">
      <!-- Header -->
      <div class="header">
        <div class="header-title">{{ data_rs.nama_rs }}</div>
        <div class="header-subtitle">DISCHARGE SUMMARY / RINGKASAN PULANG PASIEN</div>
      </div>

      <!-- Patient Section -->
      <div class="section-title">PASIEN</div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Nama</span>
          <span class="info-value">{{ patient.nama }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">NO RM</span>
          <span class="info-value">{{ patient.noRm }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Tanggal Lahir</span>
          <span class="info-value">{{ patient.tanggalLahir }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">JENIS KELAMIN</span>
          <span class="info-value">{{ patient.jenisKelamin }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Usia</span>
          <span class="info-value">{{ patient.usia }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">NIK</span>
          <span class="info-value">{{ patient.nik }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Alamat</span>
          <span class="info-value">{{ patient.alamat }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">NO TLP</span>
          <span class="info-value">{{ patient.noTlp }}</span>
        </div>
      </div>

      <!-- Admission Section -->
      <div class="section-title">RINGKASAN MASUK</div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Diantar Oleh</span>
          <span class="info-value">{{ admission.diantarOleh }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ruang Rawat</span>
          <span class="info-value">{{ admission.ruangRawat }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Transportasi</span>
          <span class="info-value">{{ admission.transportasi }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Dokter Penerima</span>
          <span class="info-value">{{ admission.dokterPenerima }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Tanggal Masuk</span>
          <span class="info-value">{{ admission.tanggalMasuk }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Dokter Rawat</span>
          <span class="info-value">{{ admission.dokterRawat }}</span>
        </div>
      </div>

      <!-- Medical Records Section -->
      <div class="section-title">RINGKASAN MEDIS</div>
      <div class="bordered-section">
        <div class="vital-label">Tanda Vital (TTV)</div>
        <div class="vitals-grid">
          <div class="vital-item">
            <div class="vital-label">TD</div>
            <div class="vital-value">{{ medicalRecords.td }}</div>
          </div>
          <div class="vital-item">
            <div class="vital-label">Suhu</div>
            <div class="vital-value">{{ medicalRecords.suhu }}</div>
          </div>
          <div class="vital-item">
            <div class="vital-label">Nadi</div>
            <div class="vital-value">{{ medicalRecords.nadi }}</div>
          </div>
          <div class="vital-item">
            <div class="vital-label">GCS</div>
            <div class="vital-value">{{ medicalRecords.gcs }}</div>
          </div>
          <div class="vital-item">
            <div class="vital-label">SPO2</div>
            <div class="vital-value">{{ medicalRecords.spo2 }}</div>
          </div>
          <div class="vital-item">
            <div class="vital-label">Pernafasan</div>
            <div class="vital-value">{{ medicalRecords.pernafasan }}</div>
          </div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Diagnosis Masuk</span>
          <span class="info-value">{{ medicalRecords.diagnosisMasuk }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Pemeriksaan Lab</span>
          <span class="info-value">{{ medicalRecords.pemerikaaanLab }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Diagnosis Keluar</span>
          <span class="info-value">{{ medicalRecords.diagnosisKeluar }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Pemeriksaan Radiologi</span>
          <span class="info-value">{{ medicalRecords.pemerikaaanRadiologi }}</span>
        </div>
      </div>

      <!-- Discharge Section -->
      <div class="section-title">RINGKASAN KELUAR</div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Tanggal Pulang</span>
          <span class="info-value">{{ discharge.tanggalPulang }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Keluhan Utama</span>
          <span class="info-value">{{ discharge.keluhanUtama }}</span>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">Cara Keluar</span>
          <span class="info-value">{{ discharge.caraKeluar }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Keadaan Saat Keluar</span>
          <span class="info-value">{{ discharge.keadaanSaatKeluar }}</span>
        </div>
      </div>
      <div class="info-row full">
        <div class="info-item">
          <span class="info-label">Lama Dirawat</span>
          <span class="info-value">{{ discharge.lamaDirawat }}</span>
        </div>
      </div>

      <!-- Therapy Section -->
      <div class="section-title">THERAPY PULANG</div>
      <div>
        <table class="table bordered">
          <thead>
            <tr>
              <th>Nama Obat</th>
              <th>Dosis</th>
              <th>Jumlah</th>
              <th>Satuan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(obat, index) in dataResume.obat_pulang" :key="index">
              <td>{{ obat.NAMABARANG }}</td>
              <td>{{ obat.REMARK_ITEM }}</td>
              <td>{{ obat.QTY }}</td>
              <td>{{ obat.SATUAN }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Discharge Instructions Section -->
      <div class="section-title"></div>
      <div class="bordered-section">
        <p style="margin: 0; color: #555; font-size: 12px"></p>
      </div>

      <!-- Signature Section -->
      <div class="signature-section">
        <div></div>
        <div>
          <div class="empty-box signature-line mb-10">Meulaboh, {{ discharge.tanggalPulang }}</div>
          <br />
          <br />
          <br />
          <div class="signature-line">{{ admission.dokterRawat }}</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #999">
        {{ clinicName }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const toast = useToast()

// Reactive state
const data_rs = reactive({ nama_rs: '' })
const isLoading = ref(false)
const clinicName = ref('')
const dataResume = reactive({ obat_pulang: [] })

const patient = reactive({
  nama: '',
  noRm: '',
  tanggalLahir: '',
  jenisKelamin: '',
  usia: '',
  nik: '',
  alamat: '',
  noTlp: '',
})

const admission = reactive({
  diantarOleh: '',
  ruangRawat: '',
  transportasi: '',
  dokterPenerima: '',
  tanggalMasuk: '',
  dokterRawat: '',
})

const medicalRecords = reactive({
  td: '',
  suhu: '',
  nadi: '',
  gcs: '',
  spo2: '',
  pernafasan: '',
  penggunaanAlat: '',
  diagnosisMasuk: '',
  diagnosisKeluar: '',
  pemerikaaanLab: '',
  pemerikaaanRadiologi: '',
})

const discharge = reactive({
  tanggalPulang: '-',
  keluhanUtama: '',
  caraKeluar: '',
  keadaanSaatKeluar: '',
  lamaDirawat: '',
  pengatarJawab: '',
  dokterRawat: '',
})

// Lifecycle hooks
onBeforeMount(() => {
  profileRs()
  getDataResume()
})

// Methods
const profileRs = () => {
  axios
    .get('/data_rumahsakit')
    .then((response) => {
      Object.assign(data_rs, response.data)
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      isLoading.value = false
    })
}

const getDataResume = async () => {
  const noregister = window.location.pathname.split('/').pop()

  try {
    const response = await axios.post('/get_resume_pulang', { noregister })
    const resume = response.data

    // Populate patient data
    patient.nama = resume.pasien.NAMAPASIEN
    patient.noRm = resume.pasien.NOMR
    patient.tanggalLahir = resume.pasien.TGLLAHIR
    patient.jenisKelamin = resume.pasien.JENISKELAMIN
    patient.usia = resume.pasien.USIA_LENGKAP
    patient.nik = ''
    patient.alamat = `${resume.pasien.ALAMAT}-${resume.pasien.namakecamatan}`
    patient.noTlp = resume.pasien.NOTELP

    // Populate admission data
    admission.diantarOleh = resume.triase_igd.diantar_oleh
    admission.transportasi = resume.triase_igd.transportasi
    admission.ruangRawat = resume.data_ranap.POLI
    admission.tanggalMasuk = resume.data_ranap.MASUKPOLY_DISPLAY
    admission.dokterPenerima = resume.masuk_dari.NAMADOKTER
    admission.dokterRawat = resume.data_ranap.NAMADOKTER

    // Populate discharge data
    discharge.keluhanUtama = resume.triase_igd.keluhan_utama
    discharge.caraKeluar = resume.data_ranap.STTS_PULANG
    discharge.tanggalPulang = resume.data_ranap.KELUARPOLY
    discharge.lamaDirawat = resume.data_masuk.display
    discharge.keadaanSaatKeluar = resume.data_ranap.KEADAAN_SAAT_PULANG

    // Populate medical records
    medicalRecords.diagnosisMasuk = resume.resume.dx_masuk?.dx_utama || ''
    medicalRecords.diagnosisKeluar = resume.resume.dx_awal
    medicalRecords.pemerikaaanLab = resume.resume.penunjang_lab
    medicalRecords.pemerikaaanRadiologi = resume.resume.penunjang_radiologi

    medicalRecords.td = `${resume.soap_akhir.sistole}/${resume.soap_akhir.diastole} mmHg`
    medicalRecords.suhu = `${resume.soap_akhir.suhu} C`
    medicalRecords.nadi = `${resume.soap_akhir.nadi} x/Menit`
    medicalRecords.gcs = resume.soap_akhir.gcs
    medicalRecords.spo2 = `${resume.soap_akhir.spo2} %`
    medicalRecords.pernafasan = `${resume.soap_akhir.pernafasan} x/Menit`

    // Populate table data
    Object.assign(dataResume, resume)
  } catch (error) {
    console.log(error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load discharge data',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 3px solid #003366;
  padding-bottom: 15px;
}

.header-logo {
  display: inline-block;
  margin-right: 15px;
  font-weight: bold;
  color: #04892c;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #04892c;
  margin: 10px 0;
}

.header-subtitle {
  font-size: 14px;
  color: #666;
}

.location {
  text-align: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
}

.section-title {
  background-color: #f4f4f4;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  padding: 8px 12px;
  margin-top: 20px;
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 12pt;
  text-transform: uppercase;
  color: #04892c;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 12px;
}

.info-row.full {
  grid-template-columns: 1fr;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-label {
  font-weight: bold;
  min-width: 120px;
  margin-right: 10px;
  color: #333;
  font-size: 12pt;
}

.info-value {
  color: #1f1f1f;
  font-size: 11pt;
  flex: 2;
}

.bordered-section {
  border: 1px solid #ddd;
  padding: 12px;
  margin-bottom: 15px;
  background-color: #fafafa;
}

.vitals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 12px;
}

.vital-item {
  border: 1px solid #ddd;
  padding: 8px;
  background-color: white;
}

.vital-label {
  font-weight: bold;
  font-size: 11pt;
  color: #333;
}

.vital-value {
  font-size: 12pt;
  color: #161616;
  margin-top: 4px;
}

.signature-section {
  margin-top: 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.signature-line {
  border-top: 2px solid #333;
  padding-top: 8px;
  text-align: center;
  font-size: 11pt;
  color: #000000;
}

.empty-box {
  border: 1px dashed #ccc;
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  font-size: 11pt;
}

table td {
  padding: 8px;
  border: 1px solid #ddd;
}

table th {
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  padding: 8px;
  font-weight: bold;
  font-size: 11px;
  text-align: left;
}

.print-button {
  margin-bottom: 20px;
  text-align: center;
}

@media print {
  body {
    background-color: white;
  }

  .print-button {
    display: none;
  }

  .print-container {
    box-shadow: none;
    margin: 0;
    padding: 0;
  }
}
</style>
