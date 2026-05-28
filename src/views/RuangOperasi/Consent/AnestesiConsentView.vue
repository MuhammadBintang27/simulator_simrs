<template>
  <InformedConsentBase
    title="Informed Consent Tindakan Anestesi / Pembiusan"
    desc="Formulir persetujuan tindakan pembiusan yang wajib ditandatangani oleh pasien atau keluarga/wali sebelum tindakan anestesi dilakukan."
    :bannerColor="['#1a3a5c', '#2563a8']"
    bannerIcon="pi pi-heart"
    apiEndpoint="/index.php/api/triaseigd/simpan_consent_anestesi"
    :extraForm="extraForm"
    :defaultSigners="defaultSigners"
    @patient-loaded="handlePatientLoaded"
  >
    <!-- ===== Field Tambahan ===== -->
    <template #extra-fields>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="field-group">
            <label class="field-label">Dokter Anestesi</label>
            <InputText v-model="extraForm.dokterAnestesi" class="w-100" placeholder="Nama dokter anestesi..." />
          </div>
        </div>
        <div class="col-md-4">
          <div class="field-group">
            <label class="field-label">Jenis Anestesi yang Direncanakan</label>
            <Select v-model="extraForm.jenisAnestesi" :options="jenisAnestesiOpts" optionLabel="label" optionValue="value"
              placeholder="Pilih jenis anestesi..." class="w-100" style="width:100%" />
          </div>
        </div>
        <div class="col-md-4">
          <div class="field-group">
            <label class="field-label">Diagnosis / Tindakan Pembedahan</label>
            <InputText v-model="extraForm.diagnosa" class="w-100" placeholder="Diagnosa operasi..." />
          </div>
        </div>
      </div>
    </template>

    <!-- ===== Teks Persetujuan ===== -->
    <template #consent-text>
      <p>
        Menyatakan dengan sesungguhnya bahwa saya telah mendapatkan penjelasan yang jelas dan
        lengkap dari <strong>{{ extraForm.dokterAnestesi || 'Dokter Anestesi' }}</strong>
        mengenai rencana tindakan anestesi
        <strong v-if="extraForm.jenisAnestesi"> ({{ extraForm.jenisAnestesi }})</strong>
        yang akan dilakukan dalam rangka:
        <strong> {{ extraForm.diagnosa || '...' }}</strong>.
      </p>

      <p class="mt-2">Penjelasan yang telah saya terima meliputi:</p>
      <ol class="consent-list">
        <li>Diagnosis penyakit yang memerlukan tindakan pembedahan dan pembiusan</li>
        <li>Jenis dan teknik tindakan anestesi yang direncanakan beserta tujuannya</li>
        <li>Tata cara pelaksanaan, persiapan, dan pemulihan pasca anestesi</li>
        <li>
          Risiko dan komplikasi yang mungkin terjadi, antara lain:
          <ul class="risk-list">
            <li>Reaksi alergi terhadap obat anestesi (anafilaksis)</li>
            <li>Gangguan jalan napas / kesulitan intubasi</li>
            <li>Penurunan tekanan darah atau gangguan irama jantung</li>
            <li>Mual, muntah, sakit kepala, dan nyeri otot pasca anestesi</li>
            <li>Kesadaran tidak penuh saat operasi (anesthesia awareness)</li>
            <li>Dalam kondisi tertentu, risiko kematian atau kecacatan permanen</li>
          </ul>
        </li>
        <li>Alternatif teknik anestesi yang tersedia</li>
        <li>Prognosis dan perkiraan pemulihan pasca anestesi</li>
      </ol>
    </template>
  </InformedConsentBase>
</template>

<script setup>
import { reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import InformedConsentBase from '@/components/InformedConsentBase.vue'

const extraForm = reactive({
  dokterAnestesi: '',
  jenisAnestesi:  '',
  diagnosa:       '',
})

const defaultSigners = [
  { hubungan: 'Keluarga / Wali', nama: '' },
  { hubungan: 'Dokter Anestesi', nama: '' },
  { hubungan: 'Saksi',           nama: '' },
]

const jenisAnestesiOpts = [
  { label: 'Anestesi Umum (General Anesthesia)', value: 'Anestesi Umum' },
  { label: 'Anestesi Regional (Spinal/Epidural)', value: 'Anestesi Regional' },
  { label: 'Anestesi Lokal',                      value: 'Anestesi Lokal' },
  { label: 'Sedasi / MAC',                        value: 'Sedasi' },
]

// ─── Handle Patient Loaded ─────────────────────────────────────────────────────

const handlePatientLoaded = (d) => {
  extraForm.dokterAnestesi = d.NAMADOKTER || ''
  extraForm.diagnosa = d.DX_CAPTION
    ? `${d.DIAGNOSA_AWAL || ''} - ${d.DX_CAPTION}`
    : (d.DIAGNOSA_AWAL || '')
}
</script>
