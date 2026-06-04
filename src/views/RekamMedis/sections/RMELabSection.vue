<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-database no-print" style="color: #6a1b9a"></i>
      HASIL PEMERIKSAAN LABORATORIUM
    </div>

    <!-- Loading awal -->
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data laboratorium...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="permintaan.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data pemeriksaan laboratorium.
    </div>

    <div v-else>
      <!-- Ringkasan jumlah transaksi -->
      <div class="lab-summary-bar">
        <span class="lab-summary-count">{{ permintaan.length }} permintaan lab</span>
        <span class="lab-summary-item-count"> {{ totalItems }} item pemeriksaan </span>
      </div>

      <!-- Loop setiap permintaan lab -->
      <div v-for="perm in permintaan" :key="perm.TRANS" class="rme-lab-card">
        <!-- Card header -->
        <div class="rme-lab-card-header">
          <div class="lab-hdr-left">
            <strong>{{ perm.NAMA_PEMERIKSAAN || perm.NAMABARANG || 'Pemeriksaan Lab' }}</strong>
            <span class="rme-lab-no mono">{{ perm.TRANS }}</span>
            <span
              :class="['rme-badge', perm.STATUS_PROSES ? 'rme-badge-success' : 'rme-badge-warning']"
            >
              {{ perm.STATUS_PROSES ? 'Selesai' : 'Proses' }}
            </span>
          </div>
          <div class="rme-lab-meta">
            <span v-if="perm._pasien?.DPJP || perm.DPJP || perm.NAMADOKTER" class="lab-meta-dokter">
              {{ perm._pasien?.DPJP || perm.DPJP || perm.NAMADOKTER }}
            </span>
            <span
              v-if="perm._pasien"
              :class="[
                'rme-badge',
                perm._pasien.IS_VERIFIED == 1 ? 'rme-badge-success' : 'rme-badge-warning',
              ]"
            >
              {{ perm._pasien.IS_VERIFIED == 1 ? '✓ Terverifikasi' : '⏳ Belum Diverifikasi' }}
            </span>
            <span
              v-if="perm._pasien?.IS_VERIFIED == 1 && perm._pasien?.PETUGAS_OTENTIKASI"
              class="lab-verif-by"
            >
              {{ perm._pasien.PETUGAS_OTENTIKASI }}
            </span>
          </div>
        </div>

        <!-- Info baris: tanggal, jenis rawat, poli/ruang -->
        <div class="lab-info-bar">
          <span class="lab-info-item">
            <span class="lab-info-icon">📅</span>
            {{ fmtDate(perm._pasien?.TANGGAL || perm.TANGGAL || perm.CREATED_AT) }}
          </span>
          <span v-if="perm._pasien?.JENISRAWAT || perm.JENISRAWAT" class="lab-info-item">
            <span class="lab-info-icon">🏥</span>
            {{ perm._pasien?.JENISRAWAT || perm.JENISRAWAT }}
          </span>
          <span
            v-if="perm._pasien?.POLI_RUANG || perm.POLI_RUANG || perm.POLI || perm.RUANG"
            class="lab-info-item"
          >
            <span class="lab-info-icon">🚪</span>
            {{ perm._pasien?.POLI_RUANG || perm.POLI_RUANG || perm.POLI || perm.RUANG }}
          </span>
        </div>

        <!-- Loading detail per card -->
        <div v-if="perm._loading" class="rme-loading-row" style="padding: 8px 12px">
          <span class="rme-loading-dot"></span> Memuat hasil...
        </div>

        <!-- Tabel hasil -->
        <template v-else-if="perm._detail && perm._detail.length > 0">
          <table class="rme-tbl-data lab-result-table">
            <thead>
              <tr>
                <th style="width: 35%">Pemeriksaan</th>
                <th style="width: 14%">Hasil</th>
                <th style="width: 22%">Nilai Normal</th>
                <th style="width: 10%">Satuan</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(group, groupName) in groupedDetail(perm._detail)" :key="groupName">
                <!-- Group header -->
                <tr v-if="groupName && groupName !== 'Umum'" class="rme-tbl-group-hdr">
                  <td colspan="5">{{ groupName }}</td>
                </tr>
                <!-- Items -->
                <tr v-for="item in group" :key="item.ID || item.KODE_PEMERIKSAAN">
                  <td class="pl-3">
                    {{ item.PEMERIKSAAN || item.NAMA_PEMERIKSAAN || item.CAPTION || '-' }}
                  </td>
                  <td :class="{ 'lab-abnormal': isAbnormal(item) }">
                    {{ item.HASIL ?? item.RESULT ?? '-' }}
                    <span v-if="isAbnormal(item)" class="lab-flag">↑↓</span>
                  </td>
                  <td class="lab-normal-range">{{ item.NORMAL || item.NILAI_NORMAL || '-' }}</td>
                  <td>{{ item.SATUAN || item.UNIT || '-' }}</td>
                  <td>{{ item.KETERANGAN || item.KETERANGAN_REMARK || item.REMARK || '-' }}</td>
                </tr>
              </template>
            </tbody>
          </table>

          <!-- Ringkasan abnormal -->
          <div v-if="countAbnormal(perm._detail) > 0" class="lab-abnormal-bar">
            <span class="lab-abn-icon">⚠</span>
            {{ countAbnormal(perm._detail) }} nilai di luar rentang normal
          </div>
        </template>

        <div v-else class="rme-empty-note" style="padding: 8px 12px">
          <i class="pi pi-minus-circle"></i> Detail hasil belum tersedia.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
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

const loading = ref(true)
const error = ref(null)
const permintaan = ref([])

// Total item pemeriksaan dari semua transaksi
const totalItems = computed(() =>
  permintaan.value.reduce((sum, p) => sum + (p._detail?.length || 0), 0),
)

const fmtDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return d
  }
}

const groupedDetail = (detail) => {
  if (!detail?.length) return {}
  return detail.reduce((acc, item) => {
    const key = item.NAMA || item.GROUPING || item.KATEGORI || item.GROUP_NAME || 'Umum'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

const isAbnormal = (item) =>
  item.HASIL_TIDAK_NORMAL === '1' ||
  item.HASIL_TIDAK_NORMAL === 1 ||
  item.IS_ABNORMAL === '1' ||
  item.IS_ABNORMAL === 1 ||
  item.FLAG_ABNORMAL === '1'

const countAbnormal = (detail) => detail?.filter(isAbnormal).length || 0

// Fetch detail per-transaksi, return { pasien, items }
const fetchDetail = async (noTransaksi) => {
  const url = configStore.apiApotikUrl
  const res = await axios.get(
    `${url}/index.php/api/sales/get_item_lab_master_detail/${noTransaksi}/${id_client.value}`,
  )

  const data = res.data
  const pasien = data?.pasien || null
  let items = []
  if (Array.isArray(data?.response)) items = data.response
  else if (Array.isArray(data?.detail)) items = data.detail
  else if (Array.isArray(data?.data)) items = data.data
  else if (Array.isArray(data)) items = data
  return { pasien, items }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const payload = {
      id_client: id_client.value,
      kategori: 'LABORATORIUM',
      noregister: props.noreg,
      mode: 1,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_list_labor_dan_radiologi_v3`,
      payload,
    )

    const list = response.data?.response || []

    // Set list dulu dengan loading flag per-card agar UI langsung tampil
    permintaan.value = list.map((p) => ({ ...p, _detail: [], _loading: true }))
  } catch (e) {
    error.value = 'Gagal memuat daftar laboratorium: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    reportSectionData('lab', permintaan.value.length > 0)
  }

  // Fetch detail setiap transaksi secara paralel, update reaktif per-card
  if (permintaan.value.length > 0) {
    await Promise.all(
      permintaan.value.map(async (perm, idx) => {
        try {
          const { pasien, items } = await fetchDetail(perm.TRANS)
          permintaan.value[idx] = {
            ...permintaan.value[idx],
            _pasien: pasien,
            _detail: items,
            _loading: false,
          }
        } catch {
          permintaan.value[idx] = {
            ...permintaan.value[idx],
            _pasien: null,
            _detail: [],
            _loading: false,
          }
        }
      }),
    )
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* Summary bar */
.lab-summary-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 10px;
  margin-bottom: 8px;
  background: #f7f0ff;
  border-left: 3px solid #6a1b9a;
  border-radius: 2px;
  font-size: 11px;
}
.lab-summary-count {
  font-weight: 700;
  color: #4a148c;
}
.lab-summary-item-count {
  color: #7b1fa2;
}

/* Nama petugas verifikasi */
.lab-verif-by {
  font-size: 10px;
  color: #2e7d32;
  font-style: italic;
}

/* Card header */
.lab-hdr-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.lab-meta-dokter {
  font-size: 11px;
  color: #555;
}

/* Info bar: tanggal, jenis rawat, poli/ruang */
.lab-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 5px 10px;
  background: #faf7ff;
  border-bottom: 1px solid #ede7f6;
  font-size: 11px;
  color: #4a148c;
}
.lab-info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.lab-info-icon {
  font-size: 11px;
  opacity: 0.75;
}

/* Result table */
.lab-result-table {
  margin-bottom: 0;
}

/* Nilai abnormal */
.lab-abnormal {
  color: #c62828;
  font-weight: 700;
}
.lab-flag {
  font-size: 9px;
  margin-left: 3px;
  vertical-align: super;
}
.lab-normal-range {
  color: #546e7a;
  font-size: 11px;
}

/* Bar abnormal di bawah tabel */
.lab-abnormal-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: #fff5f5;
  border-top: 1px solid #ffcdd2;
  font-size: 11px;
  color: #c62828;
  font-weight: 600;
}
.lab-abn-icon {
  font-size: 12px;
}
</style>
