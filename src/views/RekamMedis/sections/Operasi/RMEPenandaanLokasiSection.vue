<template>
  <div class="rme-section">
    <div class="rme-section-title" style="background:linear-gradient(90deg,#f0f4ff,#f5f8ff);border-left-color:#1565c0">
      <i class="pi pi-map-marker" style="color:#1565c0"></i> PENANDAAN LOKASI OPERASI
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.</div>
    <div v-else-if="loading" class="rme-loading-row"><span class="rme-loading-dot"></span> Memuat gambar penandaan lokasi...</div>
    <div v-else-if="error" class="rme-empty-note"><i class="pi pi-info-circle"></i> {{ error }}</div>
    <div v-else-if="!imageUrl" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Belum ada penandaan lokasi operasi untuk kunjungan ini.</div>

    <div v-else class="plo-wrap">
      <div class="plo-info">
        <i class="pi pi-check-circle" style="color:#2e7d32"></i>
        <span>Penandaan lokasi operasi telah didokumentasikan</span>
      </div>
      <div class="plo-img-frame">
        <img :src="imageUrl" alt="Penandaan Lokasi Operasi" class="plo-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, inject } from 'vue'
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
const imageUrl = ref(null)

const fetchData = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/penunjang/get_site_marking`, {
      noregister: noregisterOperasi.value || props.noreg,
      kodeboking: kodebok,
      id_client: id_client.value,
    })
    if (res.data?.metadata?.code === 200) {
      imageUrl.value = res.data.data?.filename || null
    }
  } catch (e) {
    error.value = 'Gagal memuat gambar penandaan lokasi: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('penandaan-lokasi', !!imageUrl.value)
  }
}

watch(kodebookingOperasi, (val) => {
  if (val) fetchData(val)
  else reportSectionData('penandaan-lokasi', false)
}, { immediate: true })
</script>

<style scoped>
.plo-wrap { display:flex; flex-direction:column; align-items:center; gap:.75rem; padding:.5rem 0 }
.plo-info { display:flex; align-items:center; gap:.4rem; font-size:.8rem; color:#2e7d32; background:#f0fdf4; border:1px solid #a7f3d0; border-radius:6px; padding:.35rem .75rem }
.plo-img-frame { border:2px solid #e0e0e0; border-radius:10px; overflow:hidden; width:100%; box-shadow:0 2px 8px rgba(0,0,0,.08) }
.plo-img { width:100%; display:block; object-fit:contain; background:#f9f9f9 }
</style>
