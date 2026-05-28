<template>
  <InformedConsentBase
    title="Informed Consent Tindakan Pembedahan / Operasi"
    desc="Formulir persetujuan tindakan pembedahan yang wajib ditandatangani oleh pasien atau keluarga/wali sebelum tindakan operasi dilaksanakan."
    :bannerColor="['#14532d', '#16a34a']"
    bannerIcon="pi pi-plus-circle"
    apiEndpoint="/index.php/api/triaseigd/simpan_consent_tindakan"
    :extraForm="extraForm"
    :defaultSigners="defaultSigners"
    @patient-loaded="handlePatientLoaded"
  >
    <!-- ===== Field Tambahan ===== -->
    <template #extra-fields>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="field-group">
            <label class="field-label">Dokter Operator / Bedah</label>
            <InputText v-model="extraForm.dokterOperator" class="w-100" placeholder="Nama dokter operator..." />
          </div>
        </div>
        <div class="col-md-4">
          <div class="field-group">
            <label class="field-label">Nama Tindakan / Operasi</label>
            <InputText v-model="extraForm.namaTindakan" class="w-100" placeholder="Contoh: Appendektomi..." />
          </div>
        </div>
        <div class="col-md-4">
          <div class="field-group">
            <label class="field-label">Diagnosis Pra-Operasi</label>
            <InputText v-model="extraForm.diagnosa" class="w-100" placeholder="Diagnosa..." />
          </div>
        </div>
        <div class="col-md-6">
          <div class="field-group mb-0">
            <label class="field-label">Lokasi / Organ yang Ditindak</label>
            <InputText v-model="extraForm.lokasiTindakan" class="w-100" placeholder="Contoh: Abdomen kanan bawah..." />
          </div>
        </div>
        <div class="col-md-6">
          <div class="field-group mb-0">
            <label class="field-label">Tanggal Rencana Operasi</label>
            <DatePicker v-model="extraForm.tanggalOperasi" dateFormat="dd MM yy" showTime hourFormat="24" showIcon class="w-100" />
          </div>
        </div>
      </div>
    </template>

    <!-- ===== Teks Persetujuan ===== -->
    <template #consent-text>
      <p>
        Menyatakan dengan sesungguhnya bahwa saya telah mendapatkan penjelasan yang jelas dan
        lengkap dari <strong>{{ extraForm.dokterOperator || 'Dokter Operator' }}</strong>
        mengenai rencana tindakan pembedahan
        <strong v-if="extraForm.namaTindakan"> "{{ extraForm.namaTindakan }}"</strong>
        pada <strong>{{ extraForm.lokasiTindakan || '...' }}</strong>
        dalam rangka penanganan: <strong>{{ extraForm.diagnosa || '...' }}</strong>.
      </p>

      <p class="mt-2">Penjelasan yang telah saya terima meliputi:</p>
      <ol class="consent-list">
        <li>Diagnosis penyakit yang memerlukan tindakan pembedahan</li>
        <li>Tujuan dan manfaat tindakan pembedahan yang direncanakan</li>
        <li>Tata cara dan tahapan pelaksanaan tindakan pembedahan</li>
        <li>
          Risiko dan komplikasi yang mungkin terjadi, antara lain:
          <ul class="risk-list">
            <li>Perdarahan selama atau setelah operasi</li>
            <li>Infeksi pada luka operasi (Surgical Site Infection)</li>
            <li>Cedera pada organ atau jaringan sekitar area operasi</li>
            <li>Reaksi terhadap transfusi darah (bila diperlukan)</li>
            <li>Kegagalan tindakan sehingga perlu operasi ulang</li>
            <li>Komplikasi pembiusan (bekerjasama dengan tim anestesi)</li>
            <li>Dalam kondisi tertentu, risiko kematian atau kecacatan permanen</li>
          </ul>
        </li>
        <li>Kemungkinan perluasan atau perubahan tindakan selama operasi bila diperlukan</li>
        <li>Alternatif tindakan lain yang tersedia</li>
        <li>Perkiraan lama perawatan dan pemulihan pasca operasi</li>
      </ol>
    </template>
  </InformedConsentBase>
</template>

<script setup>
import { reactive } from 'vue'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import InformedConsentBase from '@/components/InformedConsentBase.vue'

const extraForm = reactive({
  dokterOperator: '',
  namaTindakan:   '',
  diagnosa:       '',
  lokasiTindakan: '',
  tanggalOperasi: null,
})

const defaultSigners = [
  { hubungan: 'Keluarga / Wali', nama: '' },
  { hubungan: 'Dokter',          nama: '' },
  { hubungan: 'Saksi',           nama: '' },
]

// ─── Handle Patient Loaded ─────────────────────────────────────────────────────

const handlePatientLoaded = (d) => {
  extraForm.dokterOperator = d.NAMADOKTER || ''
  extraForm.diagnosa = d.DX_CAPTION
    ? `${d.DIAGNOSA_AWAL || ''} - ${d.DX_CAPTION}`
    : (d.DIAGNOSA_AWAL || '')
}
</script>
