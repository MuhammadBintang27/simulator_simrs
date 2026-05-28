<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-wrench no-print" style="color:#E65100"></i>
      TINDAKAN / PROSEDUR MEDIS
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data tindakan...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!tindakanList || tindakanList.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data tindakan/prosedur.
    </div>

    <div v-else>
      <table class="rme-tbl-data">
        <thead>
          <tr>
            <th style="width:5%">No.</th>
            <th style="width:35%">Tindakan / Prosedur</th>
            <th style="width:15%">Kategori</th>
            <th style="width:20%">Keterangan</th>
            <th style="width:15%">Tanggal</th>
            <th style="width:10%">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in tindakanList" :key="item.id || i">
            <td class="text-center">{{ i + 1 }}</td>
            <td><strong>{{ item.TINDAKAN || item.tindakan?.CAPTION || '-' }}</strong></td>
            <td>{{ item.KATEGORI || item.tindakan?.KATEGORI || '-' }}</td>
            <td>{{ item.REMARK_ITEM || item.description || '-' }}</td>
            <td>{{ fmtDate(item.TANGGAL_TRANS || item.timestamp) }}</td>
            <td>
              <span :class="['rme-badge', item.AUTH == 1 || item.isSigned ? 'rme-badge-success' : 'rme-badge-warning']">
                {{ item.AUTH == 1 || item.isSigned ? '✓ Auth' : 'Pending' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
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
const tindakanList = ref([])

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
    const res = await axios.post(
      `${url}/index.php/api/sales/get_laporan_tindakan`,
      { id_client: id_client.value, mode: 1, noregister: props.noreg },
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (res.data?.metadata?.code == '200') {
      tindakanList.value = res.data.response || []
    } else {
      tindakanList.value = []
    }
  } catch (e) {
    error.value = 'Gagal memuat data tindakan: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
