<template>
  <div class="content">
    <Panel class="hero-section">
      <div class="row">
        <div class="col-md-3">
          <div class="patient-card">
            <dl class="patient-details">
              <dt><span class="stat-label">Pasien</span></dt>
              <dd>
                {{ fact.NAMAPASIEN }} (

                {{ fact.USIA_PASIEN?.tahun }} Thn, {{ fact.USIA_PASIEN?.bulan }} Bln,
                {{ fact.USIA_PASIEN?.hari }} Hr)
              </dd>

              <dt><span class="stat-label">DPJP</span></dt>
              <dd>{{ fact.NAMADOKTER }}</dd>
            </dl>
          </div>
        </div>
        <div class="col-md-4">
          <div class="patient-card">
            <dl class="patient-details">
              <dt><span class="stat-label">Ruang Rawat</span></dt>
              <dd>
                <strong> {{ fact.POLI }}</strong>
              </dd>
            </dl>
            <dl class="patient-details">
              <dt><span class="stat-label">Dirawat Sejak</span></dt>
              <dd>
                <strong>{{ formatDateTime(fact.MASUKPOLY) }}</strong>
              </dd>
            </dl>
          </div>
        </div>
        <div class="col-md-4">
          <div class="patient-card">
            <dl class="patient-details">
              <dt><span class="stat-label">Dx Sementara</span></dt>
              <dd>
                {{ fact.DIAGNOSA_AWAL }} - <strong> {{ fact.DX_CAPTION }}</strong>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px"></ProgressBar>
    </Panel>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

import { useRoute } from 'vue-router'
const route = useRoute()

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'

  try {
    const date = new Date(dateTimeString)

    if (isNaN(date.getTime())) {
      return dateTimeString
    }

    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    console.error('DateTime formatting error:', error)
    return dateTimeString
  }
}

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: 'Message Content',
    life: 3000,
  })
}
const fact = ref([])

const param = {
  mod: 1,
  noregister: route.query.noreg,
  id_client: id_client.value,
}

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, param)

    fact.value = [...response.data.response]
    fact.value = fact.value[0]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  padding: 0rem;
  color: white;
}
.stat-label {
  letter-spacing: 0.5px;
  color: white;
}
.patient-card {
  padding: 0rem;
}

.status-prb {
  color: red;
}

.patient-name {
  margin: 0 0 0rem 0;
  color: brown;
}

.patient-details {
  margin: 0;
}

.patient-details dt {
  color: #6b7280;
  font-size: 12px;
  font-weight: normal;
}

.patient-details dd {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
}

.custom-textarea {
  font-size: 13px !important;
  line-height: 1.3;
  width: 100%;
  padding: 12px !important;
  margin-bottom: 1em;
}
</style>
