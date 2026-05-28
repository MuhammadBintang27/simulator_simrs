<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-eye no-print" style="color:#00695C"></i>
      HASIL PEMERIKSAAN RADIOLOGI
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data radiologi...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!permintaan || permintaan.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data pemeriksaan radiologi.
    </div>

    <div v-else>
      <div v-for="perm in permintaan" :key="perm.TRANS" class="rme-lab-card">
        <div class="rme-lab-card-header">
          <div>
            <strong>{{ perm.NAMA_PEMERIKSAAN || 'Pemeriksaan Radiologi' }}</strong>
            <span class="rme-lab-no mono">{{ perm.TRANS }}</span>
          </div>
          <div class="rme-lab-meta">
            <span>Tgl: {{ fmtDate(perm.TANGGAL) }}</span>
            <span>Dokter: {{ perm.DPJP || '-' }}</span>
            <span :class="['rme-badge', perm.STATUS_PROSES ? 'rme-badge-success' : 'rme-badge-warning']">
              {{ perm.STATUS_PROSES ? 'Selesai' : 'Proses' }}
            </span>
          </div>
        </div>

        <!-- Klinis -->
        <div v-if="perm.KLINIS" class="rme-rad-klinis">
          <strong>Klinis:</strong> {{ perm.KLINIS }}
        </div>

        <!-- Detail / Expertise -->
        <div v-if="perm._detail && perm._detail.length > 0">
          <table class="rme-tbl-data">
            <thead>
              <tr>
                <th>Pemeriksaan</th>
                <th>Hasil / Kesan</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in perm._detail" :key="item.ID">
                <td>{{ item.PEMERIKSAAN || item.NAMA_PEMERIKSAAN || '-' }}</td>
                <td>{{ item.HASIL || item.KESAN || '-' }}</td>
                <td>{{ item.KETERANGAN || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="rme-empty-note" style="margin-top:6px">
          Detail hasil belum tersedia.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const loading = ref(true)
const error = ref(null)
const permintaan = ref([])

const fmtDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  } catch { return d }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_list_labor_dan_radiologiv2`,
      {
        id_client: id_client.value,
        kategori: 'RADIOLOGI',
        receipt_no: props.noreg,
        mode: 3,
        status: '',
        nomr: props.dataPasien?.NOMR || '',
        tanggal: '',
      },
    )

    const list = response.data?.response || []
    const withDetail = await Promise.all(
      list.map(async (perm) => {
        try {
          const det = await axios.post(
            `${url}/index.php/api/sales/get_list_labor_dan_radiologiv2`,
            {
              id_client: id_client.value,
              kategori: 'RADIOLOGI',
              receipt_no: perm.TRANS,
              mode: 1,
              status: '',
              nomr: props.dataPasien?.NOMR || '',
              tanggal: '',
            },
          )
          return { ...perm, _detail: det.data?.response || [] }
        } catch {
          return { ...perm, _detail: [] }
        }
      }),
    )
    permintaan.value = withDetail
  } catch (e) {
    error.value = 'Gagal memuat data radiologi: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
