<template>
  <!-- Halaman 1: Checklist Persiapan Operasi -->
  <div v-if="show('checklist-persiapan')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEChecklistPersiapanSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 2: Asesmen Pra-Anestesi -->
  <div v-if="show('ass-pra-anestesi')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEAssPraAnestesiSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 3: Checklist Keselamatan Operasi (WHO) — Landscape -->
  <div
    v-if="show('checklist-keselamatan')"
    class="rme-a4-page rme-landscape-page"
    data-section="operasi-group"
  >
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEChecklistKeselamatanSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 4: Penandaan Lokasi Operasi -->
  <div v-if="show('penandaan-lokasi')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEPenandaanLokasiSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 5: Petugas Pelaksana Operasi -->
  <div v-if="show('petugas-pelaksana')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEPetugasPelaksanaSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 6: Laporan Operasi -->
  <div v-if="show('laporan-operasi')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMELaporanOperasiSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 7: Formulir Monitoring Anestesi -->
  <div v-if="show('formulir-anestesi')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEFormulirAnestesiSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 8: Informed Consent Tindakan Anestesi -->
  <div v-if="show('inform-consent-anestesi')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEInformConsentAnastesi :noreg="noreg" :dataPasien="dataPasien" />
  </div>

  <!-- Halaman 9: Monitoring Intra Operasi -->
  <div v-if="show('intra-operasi')" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Operasi — Booking: {{ kodebooking }}</span>
    </div>
    <RMEIntraOperasiSection :noreg="noreg" :dataPasien="dataPasien" />
  </div>
</template>

<script setup>
import { ref, reactive, provide } from 'vue'

import RMEChecklistPersiapanSection from './RMEChecklistPersiapanSection.vue'
import RMEAssPraAnestesiSection from './RMEAssPraAnestesiSection.vue'
import RMEChecklistKeselamatanSection from './RMEChecklistKeselamatanSection.vue'
import RMEPenandaanLokasiSection from './RMEPenandaanLokasiSection.vue'
import RMEPetugasPelaksanaSection from './RMEPetugasPelaksanaSection.vue'
import RMELaporanOperasiSection from './RMELaporanOperasiSection.vue'
import RMEFormulirAnestesiSection from './RMEFormulirAnestesiSection.vue'
import RMEInformConsentAnastesi from './RMEInformConsentAnastesi.vue'
import RMEIntraOperasiSection from './RMEIntraOperasiSection.vue'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
  kodebooking: { type: String, required: true },
  noregister: { type: String, default: '' },
})

const sectionHasData = reactive({})
const show = (key) => sectionHasData[key] !== false

provide('kodebookingOperasi', ref(props.kodebooking))
provide('noregisterOperasi', ref(props.noregister || props.noreg))
provide('reportSectionData', (key, hasData) => {
  sectionHasData[key] = hasData
})
</script>
