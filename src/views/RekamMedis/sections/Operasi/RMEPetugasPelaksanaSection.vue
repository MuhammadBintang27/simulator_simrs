<template>
  <div class="rme-section">
    <div class="rme-section-title" style="background:linear-gradient(90deg,#f8f0ff,#fbf5ff);border-left-color:#6a1b9a">
      <i class="pi pi-users" style="color:#6a1b9a"></i> PETUGAS PELAKSANA OPERASI
    </div>

    <div v-if="!kodebookingOperasi" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Pasien ini tidak memiliki tindakan operasi.</div>
    <div v-else-if="loading" class="rme-loading-row"><span class="rme-loading-dot"></span> Memuat data tim operasi...</div>
    <div v-else-if="error" class="rme-empty-note"><i class="pi pi-info-circle"></i> {{ error }}</div>
    <div v-else-if="!hasData" class="rme-empty-note"><i class="pi pi-minus-circle"></i> Belum ada data petugas pelaksana operasi.</div>

    <div v-else>
      <div class="rme-subsection-title"><span>👨‍⚕️</span> Tim Dokter</div>
      <div class="ppo-grid">
        <div v-for="item in dokterItems" :key="item.key" class="ppo-card" :class="item.namaValue?'ppo-filled':'ppo-empty'">
          <div class="ppo-role">{{ item.label }}</div>
          <div class="ppo-nama">{{ item.namaValue||'-' }}</div>
        </div>
      </div>

      <div class="rme-subsection-title" style="margin-top:.75rem"><span>👩‍⚕️</span> Tim Perawat</div>
      <div class="ppo-grid">
        <div v-for="item in perawatItems" :key="item.key" class="ppo-card" :class="item.namaValue?'ppo-filled':'ppo-empty'">
          <div class="ppo-role">{{ item.label }}</div>
          <div class="ppo-nama">{{ item.namaValue||'-' }}</div>
        </div>
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
const raw = ref({})

const hasData = computed(() => !!(raw.value?.nama_dokter_bedah || raw.value?.dr_bedah || raw.value?.nama_prw_bdh_1))

const dokterItems = computed(() => [
  { key: 'dr_bedah', label: 'Dr. Bedah / Obgyn', namaValue: raw.value?.nama_dokter_bedah || raw.value?.dr_bedah },
  { key: 'dr_anestesi', label: 'Dr. Anestesi', namaValue: raw.value?.nama_dokter_anestesi || raw.value?.dr_anestesi },
  { key: 'ast_dr_bedah_1', label: 'Ast. Dr. Bedah 1', namaValue: raw.value?.nama_ast_dr_bedah_1 || raw.value?.ast_dr_bedah_1 },
  { key: 'ast_dr_bedah_2', label: 'Ast. Dr. Bedah 2', namaValue: raw.value?.nama_ast_dr_bedah_2 || raw.value?.ast_dr_bedah_2 },
  { key: 'ast_dr_bedah_3', label: 'Ast. Dr. Bedah 3', namaValue: raw.value?.nama_ast_dr_bedah_3 || raw.value?.ast_dr_bedah_3 },
  { key: 'ast_dr_anestesi', label: 'Ast. Dr. Anestesi', namaValue: raw.value?.nama_ast_dr_anestesi || raw.value?.ast_dr_anestesi },
  { key: 'dr_anak', label: 'Dr. Anak', namaValue: raw.value?.nama_dr_anak || raw.value?.dr_anak },
])

const perawatItems = computed(() => [
  { key: 'prw_bedah_1', label: 'Prw. Bedah 1', namaValue: raw.value?.nama_prw_bdh_1 || raw.value?.prw_bedah_1 },
  { key: 'prw_bedah_2', label: 'Prw. Bedah 2', namaValue: raw.value?.nama_prw_bdh_2 || raw.value?.prw_bedah_2 },
  { key: 'prw_sirkuler', label: 'Prw. Sirkuler', namaValue: raw.value?.nama_prw_sirkuler || raw.value?.prw_sirkuler },
  { key: 'prw_anak', label: 'Prw. Anak', namaValue: raw.value?.nama_prw_anak || raw.value?.prw_anak },
  { key: 'prw_instrumen', label: 'Prw. Instrumen', namaValue: raw.value?.nama_prw_instrumen || raw.value?.prw_instrumen },
])

const fetchData = async (kodebok) => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/triaseigd/get_data_tim_operasi`, {
      noregister: noregisterOperasi.value || props.noreg,
      kodeboking: kodebok,
      id_client: id_client.value,
      mode: 1,
    })
    if (res.data?.response?.length > 0) {
      raw.value = res.data.response[0]
    }
  } catch (e) {
    error.value = 'Gagal memuat data tim operasi: ' + (e.message || '')
  } finally {
    loading.value = false
    reportSectionData('petugas-pelaksana', hasData.value)
  }
}

watch(kodebookingOperasi, (val) => {
  if (val) fetchData(val)
  else reportSectionData('petugas-pelaksana', false)
}, { immediate: true })
</script>

<style scoped>
.ppo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:.5rem }
.ppo-card { border-radius:8px; padding:.5rem .75rem; border:1px solid }
.ppo-filled { background:#f3e8ff; border-color:#d8b4fe }
.ppo-empty { background:#f9f9f9; border-color:#e5e7eb }
.ppo-role { font-size:.7rem; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; margin-bottom:.2rem }
.ppo-nama { font-size:.82rem; color:#1f2937; font-weight:600 }
.ppo-empty .ppo-nama { color:#9ca3af; font-weight:400 }
</style>
