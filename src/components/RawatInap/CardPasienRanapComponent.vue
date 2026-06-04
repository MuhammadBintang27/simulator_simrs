<template>
  <div>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

    <!-- Hero Strip -->
    <Panel class="ranap-hero mb-2">
      <template #header>
        <div class="ranap-hero-title">
          <i class="fas fa-bed mr-2"></i>
          <span v-if="datapasien">
            <h4 class="patient-name">
              <strong class="mr-2">{{ datapasien?.NAMAPASIEN }}</strong>
              <i
                v-if="datapasien"
                :class="datapasien?.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                :style="{
                  fontSize: '20px',
                  color: datapasien?.JENISKELAMIN === 'P' ? 'violet' : 'steelblue',
                }"
              >
              </i>
            </h4>
            <span class="ranap-hero-age ml-2">
              ({{ datapasien.USIA_PASIEN?.tahun }} Thn, {{ datapasien.USIA_PASIEN?.bulan }} Bln,
              {{ datapasien.USIA_PASIEN?.hari }} Hr)
            </span>
            <span class="ranap-gender-icon ml-2">
              <i
                :class="datapasien.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                :style="{ color: datapasien.JENISKELAMIN === 'P' ? '#f9a8d4' : '#93c5fd' }"
              />
            </span>
          </span>
          <span v-else class="ranap-hero-placeholder">Memuat data pasien...</span>
        </div>
      </template>

      <div class="row" v-if="datapasien">
        <!-- Kolom 1: Identitas -->
        <div class="col-md-3">
          <dl class="ranap-dl">
            <dt>No. MR</dt>
            <dd>{{ datapasien.NOMR }}</dd>
            <dt>No. Register</dt>
            <dd>{{ datapasien.NOPENDAFTARAN }}</dd>
            <dt>Cara Bayar</dt>
            <dd>
              {{ datapasien.CARABAYAR }}
              <span v-if="datapasien.NOSEP" class="sep-chip ml-1">{{ datapasien.NOSEP }}</span>
            </dd>
          </dl>
        </div>

        <!-- Kolom 2: Rawat -->
        <div class="col-md-3">
          <dl class="ranap-dl">
            <dt>DPJP</dt>
            <dd>{{ datapasien.NAMADOKTER || '-' }}</dd>
            <dt>Ruang Rawat</dt>
            <dd>
              <strong>{{ datapasien.POLI || '-' }}</strong>
            </dd>
            <dt>Dirawat Sejak</dt>
            <dd>{{ formatDateTime(datapasien.MASUKPOLY) }}</dd>
          </dl>
        </div>

        <!-- Kolom 3: Klinis -->
        <div class="col-md-3">
          <dl class="ranap-dl">
            <dt>Diagnosa Sementara</dt>
            <dd>
              {{ datapasien.DIAGNOSA_AWAL }}
              <strong v-if="datapasien.DX_CAPTION"> — {{ datapasien.DX_CAPTION }}</strong>
            </dd>
            <dt>Jenis Rawat</dt>
            <dd>{{ datapasien.JENISRAWAT || '-' }}</dd>
          </dl>
        </div>

        <!-- Kolom 4: Demografis -->
        <div class="col-md-3">
          <dl class="ranap-dl">
            <dt>Tanggal Lahir</dt>
            <dd>{{ datapasien.TGLLAHIR || '-' }}</dd>
            <dt>No. HP</dt>
            <dd>{{ datapasien.NOTELP || '-' }}</dd>
            <dt>Alamat</dt>
            <dd class="ranap-alamat">{{ datapasien.ALAMAT || '-' }}</dd>
          </dl>
        </div>
      </div>

      <div v-else-if="!loading" class="ranap-empty">
        <i class="fas fa-user-slash mr-2"></i>Data pasien tidak ditemukan
      </div>
    </Panel>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import ProgressBar from 'primevue/progressbar'

const props = defineProps({
  noregister: { type: String, required: true },
  datapasien: { type: Object, default: null },
})

const emit = defineEmits(['update:datapasien'])

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const loading = ref(false)
const datapasien = ref(props.datapasien)

const formatDateTime = (val) => {
  if (!val) return '-'
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return val
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return val
  }
}

const fetchData = async () => {
  if (!props.noregister) return
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, {
      mod: 1,
      noregister: props.noregister,
      id_client: id_client.value,
    })
    if (res.data.response?.length > 0) {
      datapasien.value = res.data.response[0]
      emit('update:datapasien', datapasien.value)
    }
  } catch (e) {
    console.error('CardPasienRanap fetchData:', e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.noregister,
  (val) => {
    if (val) fetchData()
  },
)

defineExpose({ datapasien, refresh: fetchData })

onMounted(() => {
  if (!props.datapasien) fetchData()
  else emit('update:datapasien', props.datapasien)
})
</script>

<style scoped>
.ranap-hero {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
}
.ranap-hero :deep(.p-panel-content) {
  background: transparent;
  color: white;
  padding: 0.6rem 1rem;
}
.ranap-hero :deep(.p-panel-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
}

.ranap-hero-title {
  display: flex;
  align-items: center;
  color: white;
  font-size: 0.9rem;
}
.ranap-hero-age {
  font-size: 0.8rem;
  opacity: 0.85;
  font-weight: normal;
}
.ranap-hero-placeholder {
  font-size: 0.85rem;
  opacity: 0.7;
  font-style: italic;
}
.patient-name {
  margin: 0 0 1rem 0;
  color: brown;
}

.ranap-dl {
  margin: 0;
}
.ranap-dl dt {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 6px;
}
.ranap-dl dd {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.4;
}
.ranap-dl strong {
  color: #fff;
}

.sep-chip {
  display: inline-block;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  padding: 0 5px;
  line-height: 1.6;
}

.ranap-alamat {
  font-size: 11px !important;
  opacity: 0.9;
  line-height: 1.3;
}

.ranap-empty {
  padding: 12px 0;
  font-size: 13px;
  opacity: 0.75;
  text-align: center;
}
</style>
