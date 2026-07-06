<template>
  <!-- ── Loading / No-op: satu halaman sementara ──────────────────── -->
  <div v-if="checking" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Reg: {{ noreg }}</span>
    </div>
    <div class="rme-section">
      <div class="rme-section-title" style="background:linear-gradient(90deg,#fff5f0,#fff8f5);border-left-color:#e64a19">
        <i class="pi pi-file-edit" style="color:#e64a19"></i> LAPORAN OPERASI
      </div>
      <div class="rme-loading-row"><span class="rme-loading-dot"></span> Memeriksa data operasi pasien...</div>
    </div>
  </div>

  <!-- ── Pasien tidak memiliki operasi ───────────────────────────── -->
  <div v-else-if="!kodebookingOperasi" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Reg: {{ noreg }}</span>
    </div>
    <div class="rme-section">
      <div class="rme-section-title" style="background:linear-gradient(90deg,#fff5f0,#fff8f5);border-left-color:#e64a19">
        <i class="pi pi-file-edit" style="color:#e64a19"></i> LAPORAN OPERASI
      </div>
      <div class="rme-empty-note"><i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.</div>
    </div>
  </div>

  <!-- ── Halaman-halaman laporan operasi ────────────────────────── -->
  <template v-else>

    <!-- Halaman 1: Checklist Persiapan Operasi -->
    <div v-if="show('checklist-persiapan')" class="rme-a4-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMEChecklistPersiapanSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 2: Asesmen Pra-Anestesi -->
    <div v-if="show('ass-pra-anestesi')" class="rme-a4-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMEAssPraAnestesiSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 3: Checklist Keselamatan Operasi (WHO) — Landscape -->
    <div v-if="show('checklist-keselamatan')" class="rme-a4-page rme-landscape-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMEChecklistKeselamatanSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 4: Penandaan Lokasi Operasi -->
    <div v-if="show('penandaan-lokasi')" class="rme-a4-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMEPenandaanLokasiSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 5: Petugas Pelaksana Operasi -->
    <div v-if="show('petugas-pelaksana')" class="rme-a4-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMEPetugasPelaksanaSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 6: Laporan Operasi -->
    <div v-if="show('laporan-operasi')" class="rme-a4-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMELaporanOperasiSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 7: Formulir Monitoring Anestesi -->
    <div v-if="show('formulir-anestesi')" class="rme-a4-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMEFormulirAnestesiSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 8: Informed Consent Tindakan Anestesi -->
    <div v-if="show('inform-consent-anestesi')" class="rme-a4-page" data-section="operasi-group">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Operasi — Booking: {{ kodebookingOperasi }}</span>
      </div>
      <RMEInformConsentAnastesi :noreg="noreg" :dataPasien="dataPasien" />
    </div>

  </template>
</template>

<script setup>
import { ref, reactive, inject, provide, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'

import RMEChecklistPersiapanSection from './RMEChecklistPersiapanSection.vue'
import RMEAssPraAnestesiSection from './RMEAssPraAnestesiSection.vue'
import RMEChecklistKeselamatanSection from './RMEChecklistKeselamatanSection.vue'
import RMEPenandaanLokasiSection from './RMEPenandaanLokasiSection.vue'
import RMEPetugasPelaksanaSection from './RMEPetugasPelaksanaSection.vue'
import RMELaporanOperasiSection from './RMELaporanOperasiSection.vue'
import RMEFormulirAnestesiSection from './RMEFormulirAnestesiSection.vue'
import RMEInformConsentAnastesi from './RMEInformConsentAnastesi.vue'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportToViewer = inject('reportSectionData', () => {})

const kodebookingOperasi = ref(null)
const noregisterOperasi = ref('')
const checking = ref(true)

// Setiap section melaporkan apakah punya data via reportSectionData(key, bool)
// undefined = belum dilaporkan (masih loading) → tetap tampil
// true  = ada data → tampil
// false = tidak ada data → sembunyikan halaman
const sectionHasData = reactive({})
const show = (key) => sectionHasData[key] !== false

provide('kodebookingOperasi', kodebookingOperasi)
provide('noregisterOperasi', noregisterOperasi)
provide('reportSectionData', (key, hasData) => { sectionHasData[key] = hasData })

const checkOperasi = async () => {
  checking.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/Data_referensi/check_apakah_pasienop/`, {
      noregister: props.noreg,
    })
    if (res.data?.code === 200 && res.data?.data?.kodebooking) {
      kodebookingOperasi.value = res.data.data.kodebooking
      noregisterOperasi.value = res.data.data.noregister || props.noreg
    }
  } catch (e) {
    console.error('[OperasiGroup] checkOperasi gagal', e)
  } finally {
    checking.value = false
    reportToViewer('operasi-group', !!kodebookingOperasi.value)
  }
}

onMounted(() => {
  if (props.noreg) checkOperasi()
  else {
    checking.value = false
    reportToViewer('operasi-group', false)
  }
})
</script>
