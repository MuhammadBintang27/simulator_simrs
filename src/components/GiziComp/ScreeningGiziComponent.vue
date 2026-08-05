<template>
  <div class="card card-info card-outline elevation-0">
    <div class="card-header">
      <b>SCREENING GIZI</b>
    </div>

    <span v-if="isLoading">
      <b>Memuat data.......</b>
    </span>

    <div class="card-body">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>Apakah penurunan BB dalam 6 bulan?</label>
          </div>
          <div class="form-group">
            <div class="p-inputgroup">
              <Select
                id="penurunanBB"
                v-model="form.penurunanBB"
                :options="penurunanBBOptions"
                option-label="caption"
                placeholder=""
              />
              <span class="p-inputgroup-addon">Nilai {{ form.penurunanBB?.value }}</span>
            </div>
          </div>

          <div class="form-group">
            <label
              >Apakah Anda mengalami asupan makan Kurang dari 3/4 porsi karena penurunan nafsu
              makan?</label
            >
          </div>
          <div class="form-group">
            <div class="p-inputgroup">
              <Select
                id="turunnafsuMakan"
                v-model="form.turunnafsuMakan"
                :options="turunnafsuMakanOptions"
                option-label="caption"
                placeholder=""
              />
              <span class="p-inputgroup-addon">Nilai {{ form.turunnafsuMakan?.value }}</span>
            </div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="row justify-content-center" style="height: 90%">
            <div class="col-md-6">
              <div class="title">SKOR MST</div>
              <div
                :class="statusMst"
                style="text-align: center; border-radius: 5px; color: white; padding: 5px"
              >
                <h1>{{ skorMst }}</h1>
                <h4>{{ captionMst }}</h4>
                <br />
                <p>{{ rekomendasi }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue 3 Composition API with <script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import DatePicker from 'primevue/datepicker'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, id_lokasi } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

// Props
const props = defineProps({
  dataset: {
    type: Object,
    default: () => ({}),
  },
  noregister: {
    type: String,
    default: '',
  },
})

// Options
const penurunanBBOptions = [
  { caption: 'Tidak', value: 0 },
  { caption: 'Tidak Yakin', value: 2 },
  { caption: 'Penurunan 1-5 Kg', value: 1 },
  { caption: 'Penurunan 6-10 Kg', value: 2 },
  { caption: 'Penurunan 11-15 Kg', value: 3 },
  { caption: 'Penurunan Lebih 15 Kg', value: 4 },
]

const turunnafsuMakanOptions = [
  { caption: 'Ya', value: 1 },
  { caption: 'Tidak', value: 0 },
]

// State
const isLoading = ref(false)

const form = ref({
  nilai_mst: 0,
  penurunanBB: { caption: 'Tidak', value: 0 },
  turunnafsuMakan: { caption: 'Tidak', value: 0 },
})

// Computed: MST score
const skorMst = computed(() => {
  return (form.value.penurunanBB?.value ?? 0) + (form.value.turunnafsuMakan?.value ?? 0)
})

const statusMst = computed(() => {
  const total = skorMst.value
  if (total <= 1) return 'bg-success'
  if (total === 2) return 'bg-warning'
  return 'bg-danger'
})

const captionMst = computed(() => {
  const total = skorMst.value
  if (total <= 1) return 'RISIKO RENDAH'
  if (total === 2) return 'RISIKO SEDANG'
  return 'RISIKO TINGGI'
})

const rekomendasi = computed(() => {
  const total = skorMst.value
  if (total <= 1) return ''
  if (total === 2)
    return 'Konsul DPJP dan NPJP untuk diagnosis lengkap, Pertimbangan intervensi gizi oleh NPJP'
  return 'Konsul DPJP dan NPJP untuk diagnosis lengkap serta untuk rekomendasi gizi individual dan Rencana pelayanan (Care Plan) segera lakukan intervensi gizi'
})

// Methods
async function getDataAssesmentGizi() {
  isLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Triaseigd/get_data_assesment_gizi`, {
      noregister: props.noregister,
      norm: props.dataset?.NOMR,
    })

    const gizi = response.data.data_gizi
    if (!gizi) return
    if (gizi.penurunanBB) {
      form.value.penurunanBB = {
        caption: gizi.penurunanBB.caption,
        value: gizi.penurunanBB.value,
      }
    }
    if (gizi.turunnafsu_makan) {
      form.value.turunnafsuMakan = {
        caption: gizi.turunnafsu_makan.caption,
        value: gizi.turunnafsu_makan.value,
      }
    }
    if (gizi.nilai_mst !== undefined) form.value.nilai_mst = gizi.nilai_mst
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function getValue() {
  form.value.nilai_mst = skorMst.value
  return {
    penurunanBB: form.value.penurunanBB,
    turunnafsu_makan: form.value.turunnafsuMakan,
    nilai_mst: form.value.nilai_mst,
  }
}

function setValue() {
  form.value.penurunanBB = {
    caption: props.dataset.penurunanBB.caption,
    value: props.dataset.penurunanBB.value,
  }
  form.value.turunnafsuMakan = {
    caption: props.dataset.turunnafsu_makan.caption,
    value: props.dataset.turunnafsu_makan.value,
  }
  form.value.nilai_mst = props.dataset.nilai_mst
}

// Expose for parent component access
defineExpose({ getValue, setValue })

// Lifecycle
onMounted(() => {
  getDataAssesmentGizi()
})
</script>

<style scoped>
.score-box {
  background-color: #f28b82;
  color: white;
  text-align: center;
  padding: 40px 0;
  border-radius: 5px;
}
.score-box h1 {
  font-size: 3rem;
  margin: 0;
}
.score-box p {
  font-size: 1.2rem;
  margin: 0;
  font-weight: bold;
}
.title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 1.5rem;
}
</style>
