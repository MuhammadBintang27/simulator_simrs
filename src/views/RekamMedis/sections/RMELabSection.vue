<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-database no-print" style="color:#6A1B9A"></i>
      HASIL PEMERIKSAAN LABORATORIUM
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data laboratorium...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!permintaan || permintaan.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data pemeriksaan laboratorium.
    </div>

    <div v-else>
      <!-- Loop setiap permintaan lab -->
      <div v-for="perm in permintaan" :key="perm.TRANS" class="rme-lab-card">
        <div class="rme-lab-card-header">
          <div>
            <strong>{{ perm.NAMA_PEMERIKSAAN || 'Pemeriksaan Lab' }}</strong>
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

        <table class="rme-tbl-data" v-if="perm._detail && perm._detail.length > 0">
          <thead>
            <tr>
              <th style="width:35%">Pemeriksaan</th>
              <th style="width:15%">Hasil</th>
              <th style="width:20%">Nilai Normal</th>
              <th style="width:10%">Satuan</th>
              <th style="width:20%">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, nama) in groupBy(perm._detail, 'GROUPING')" :key="nama">
              <tr v-if="nama && nama !== 'undefined'" class="rme-tbl-group-hdr">
                <td colspan="5">{{ nama }}</td>
              </tr>
              <tr v-for="item in group" :key="item.ID">
                <td class="pl-3">{{ item.PEMERIKSAAN }}</td>
                <td :style="item.HASIL_TIDAK_NORMAL == '1' ? 'color:#c62828;font-weight:bold' : ''">
                  {{ item.HASIL }}
                </td>
                <td>{{ item.NORMAL || '-' }}</td>
                <td>{{ item.SATUAN || '-' }}</td>
                <td>{{ item.KETERANGAN || item.KETERANGAN_REMARK || '-' }}</td>
              </tr>
            </template>
          </tbody>
        </table>

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

const groupBy = (arr, key) => {
  if (!arr) return {}
  return arr.reduce((acc, item) => {
    const k = item[key] || 'Umum'
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
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
        kategori: 'LABORATORIUM',
        receipt_no: props.noreg,
        mode: 3,
        status: '',
        nomr: props.dataPasien?.NOMR || '',
        tanggal: '',
      },
    )

    const list = response.data?.response || []
    // Ambil detail untuk masing-masing permintaan (mode: 1 dengan receipt_no spesifik)
    const withDetail = await Promise.all(
      list.map(async (perm) => {
        try {
          const det = await axios.post(
            `${url}/index.php/api/sales/get_list_labor_dan_radiologiv2`,
            {
              id_client: id_client.value,
              kategori: 'LABORATORIUM',
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
    error.value = 'Gagal memuat data laboratorium: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
