<template>
  <!-- ── Loading ──────────────────────────────────────────────────── -->
  <div v-if="checking" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Reg: {{ noreg }}</span>
    </div>
    <div class="rme-section">
      <div
        class="rme-section-title"
        style="background: linear-gradient(90deg, #fff5f0, #fff8f5); border-left-color: #e64a19"
      >
        <i class="pi pi-file-edit" style="color: #e64a19"></i> LAPORAN OPERASI
      </div>
      <div class="rme-loading-row">
        <span class="rme-loading-dot"></span> Memeriksa data operasi pasien...
      </div>
    </div>
  </div>

  <!-- ── Pasien tidak memiliki operasi ───────────────────────────── -->
  <div v-else-if="!daftarOperasi.length" class="rme-a4-page" data-section="operasi-group">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Reg: {{ noreg }}</span>
    </div>
    <div class="rme-section">
      <div
        class="rme-section-title"
        style="background: linear-gradient(90deg, #fff5f0, #fff8f5); border-left-color: #e64a19"
      >
        <i class="pi pi-file-edit" style="color: #e64a19"></i> LAPORAN OPERASI
      </div>
      <div class="rme-empty-note">
        <i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.
      </div>
    </div>
  </div>

  <!-- ── Satu group halaman per kode booking ────────────────────── -->
  <template v-else>
    <RMEOperasiBookingGroup
      v-for="item in daftarOperasi"
      :key="item.kodebooking"
      :noreg="noreg"
      :dataPasien="dataPasien"
      :kodebooking="item.kodebooking"
      :noregister="item.noregister"
    />
  </template>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'

import RMEOperasiBookingGroup from './RMEOperasiBookingGroup.vue'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const reportToViewer = inject('reportSectionData', () => {})

const daftarOperasi = ref([])
const checking = ref(true)

const checkOperasi = async () => {
  checking.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/Data_referensi/check_apakah_pasienop_v2/`, {
      noregister: props.noreg,
    })

    if (res.data?.code === 200 && Array.isArray(res.data?.data)) {
      daftarOperasi.value = res.data.data.filter((item) => item.kodebooking)
    }
  } catch (e) {
    console.error('[OperasiGroup] checkOperasi gagal', e)
  } finally {
    checking.value = false
    reportToViewer('operasi-group', daftarOperasi.value.length > 0)
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
