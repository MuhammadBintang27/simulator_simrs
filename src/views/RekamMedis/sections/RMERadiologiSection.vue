<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-eye no-print" style="color: #00695c"></i>
      HASIL PEMERIKSAAN RADIOLOGI
    </div>

    <!-- Loading awal -->
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data radiologi...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="permintaan.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data pemeriksaan radiologi.
    </div>

    <div v-else>
      <!-- Ringkasan jumlah transaksi -->
      <div class="rad-summary-bar">
        <span class="rad-summary-count">{{ permintaan.length }} permintaan radiologi</span>
        <span class="rad-summary-item-count"> {{ totalItems }} item pemeriksaan </span>
      </div>

      <!-- Loop setiap permintaan radiologi -->
      <div v-for="perm in permintaan" :key="perm.TRANS" class="rme-lab-card">
        <!-- Card header -->
        <div class="rme-lab-card-header">
          <div class="rad-hdr-left">
            <strong>Pemeriksaan Radiologi</strong>
            <span class="rme-lab-no mono">{{ perm.TRANS }}</span>
            <span
              :class="['rme-badge', perm.WAKTU_SELESAI ? 'rme-badge-success' : 'rme-badge-warning']"
            >
              {{ perm.WAKTU_SELESAI ? 'Selesai' : 'Proses' }}
            </span>
          </div>
          <div class="rme-lab-meta">
            <span v-if="perm._pasien?.DPJP" class="rad-meta-dokter">
              {{ perm._pasien.DPJP }}
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
              class="rad-verif-by"
            >
              {{ perm._pasien.PETUGAS_OTENTIKASI }}
            </span>
          </div>
        </div>

        <!-- Info baris: tanggal, jenis rawat, poli/ruang -->
        <div class="rad-info-bar">
          <span v-if="perm._pasien?.TANGGAL || perm.WAKTU_SELESAI" class="rad-info-item">
            <span class="rad-info-icon">📅</span>
            {{ fmtDate(perm._pasien?.TANGGAL || perm.WAKTU_SELESAI) }}
          </span>
          <span v-if="perm._pasien?.JENISRAWAT" class="rad-info-item">
            <span class="rad-info-icon">🏥</span>
            {{ perm._pasien.JENISRAWAT }}
          </span>
          <span v-if="perm._pasien?.POLI_RUANG" class="rad-info-item">
            <span class="rad-info-icon">🚪</span>
            {{ perm._pasien.POLI_RUANG }}
          </span>
          <span v-if="perm._pasien?.CARABAYAR" class="rad-info-item">
            <span class="rad-info-icon">💳</span>
            {{ perm._pasien.CARABAYAR }}
          </span>
        </div>

        <!-- Klinis -->
        <div v-if="perm.KLINIS || perm._pasien?.KLINIS" class="rme-rad-klinis">
          <strong>Klinis:</strong> {{ perm.KLINIS || perm._pasien?.KLINIS }}
        </div>

        <!-- Loading detail per card -->
        <div v-if="perm._loading" class="rme-loading-row" style="padding: 8px 12px">
          <span class="rme-loading-dot"></span> Memuat hasil...
        </div>

        <!-- Detail items -->
        <template v-else-if="perm._detail && perm._detail.length > 0">
          <div
            v-for="item in perm._detail"
            :key="item.BARCODE || item.RECEIPT_NO"
            class="rad-detail-item"
          >
            <!-- Nama pemeriksaan -->
            <div class="rad-detail-header">
              <span class="rad-detail-nama">{{ item.NAMA }}</span>
              <span v-if="item.TANGGAL_REQ" class="rad-detail-tgl">
                {{ fmtDate(item.TANGGAL_REQ) }}
              </span>
            </div>

            <!-- Hasil baca (HTML) -->
            <div v-if="item.HASIL_BACA" class="rad-hasil-baca" v-html="item.HASIL_BACA"></div>
            <div v-else class="rme-empty-note" style="padding: 6px 10px">
              <i class="pi pi-minus-circle"></i> Hasil baca belum tersedia.
            </div>

            <!-- Attachment gambar -->
            <div v-if="item.attachment && item.attachment.length > 0" class="rad-attachment-wrap">
              <div class="rad-attachment-title"><i class="pi pi-image"></i> Lampiran Gambar</div>
              <div class="rad-attachment-grid">
                <div v-for="att in item.attachment" :key="att.id" class="rad-attachment-item">
                  <Image
                    :src="proxyUrl(att.link_img)"
                    :alt="att.caption_file"
                    :pt="{ image: { 'data-original-src': att.link_img } }"
                    preview
                    class="rad-attachment-img"
                  />
                  <div class="rad-attachment-caption">{{ att.caption_file }}</div>
                </div>
              </div>
            </div>
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
import Image from 'primevue/image'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const proxyUrl = (url) => {
  if (!url) return ''
  return `${configStore.laravel}/proxy-image?url=${encodeURIComponent(url)}`
}

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(true)
const error = ref(null)
const permintaan = ref([])

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

const fetchDetail = async (noReceipt) => {
  const url = configStore.apiApotikUrl
  const res = await axios.post(`${url}/index.php/api/sales/get_detail_radiologi_v2/`, {
    id_client: id_client.value,
    no_receipt: noReceipt,
    mode: 1,
  })

  const data = res.data
  const pasien = data?.pasien || null
  const items = Array.isArray(data?.response) ? data.response : []
  return { pasien, items }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_list_labor_dan_radiologi_v3`,
      {
        id_client: id_client.value,
        kategori: 'RADIOLOGI',
        noregister: props.noreg,
        mode: 1,
      },
    )

    const list = response.data?.response || []

    // Set list dulu dengan loading flag per-card agar UI langsung tampil
    permintaan.value = list.map((p) => ({ ...p, _detail: [], _loading: true }))
  } catch (e) {
    error.value = 'Gagal memuat daftar radiologi: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    reportSectionData('radiologi', permintaan.value.length > 0)
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
.rad-summary-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 10px;
  margin-bottom: 8px;
  background: #e8f5e9;
  border-left: 3px solid #00695c;
  border-radius: 2px;
  font-size: 11px;
}
.rad-summary-count {
  font-weight: 700;
  color: #004d40;
}
.rad-summary-item-count {
  color: #00695c;
}

/* Card header */
.rad-hdr-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.rad-meta-dokter {
  font-size: 11px;
  color: #555;
}
.rad-verif-by {
  font-size: 10px;
  color: #2e7d32;
  font-style: italic;
}

/* Info bar */
.rad-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 5px 10px;
  background: #f1f8f6;
  border-bottom: 1px solid #b2dfdb;
  font-size: 11px;
  color: #004d40;
}
.rad-info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.rad-info-icon {
  font-size: 11px;
  opacity: 0.75;
}

/* Klinis */
.rme-rad-klinis {
  padding: 5px 10px;
  font-size: 11px;
  background: #f9fbe7;
  border-bottom: 1px solid #dce775;
  color: #33691e;
}

/* Detail item wrapper */
.rad-detail-item {
  border-bottom: 1px dashed #b2dfdb;
  padding: 8px 0;
}
.rad-detail-item:last-child {
  border-bottom: none;
}

/* Nama pemeriksaan */
.rad-detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 6px;
  flex-wrap: wrap;
}
.rad-detail-nama {
  font-weight: 700;
  font-size: 12px;
  color: #004d40;
}
.rad-detail-tgl {
  font-size: 10px;
  color: #78909c;
}

/* Hasil baca HTML */
.rad-hasil-baca {
  padding: 6px 14px 6px 20px;
  font-size: 11.5px;
  line-height: 1.6;
  color: #212121;
}
.rad-hasil-baca :deep(p) {
  margin: 2px 0;
}
.rad-hasil-baca :deep(span) {
  background-color: transparent !important;
}

/* Attachment */
.rad-attachment-wrap {
  padding: 6px 10px 8px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  margin-top: 4px;
}
.rad-attachment-title {
  font-size: 11px;
  font-weight: 600;
  color: #546e7a;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.rad-attachment-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.rad-attachment-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.rad-attachment-img :deep(img) {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #cfd8dc;
  cursor: pointer;
  transition: opacity 0.15s;
}
.rad-attachment-img :deep(img):hover {
  opacity: 0.85;
}
.rad-attachment-caption {
  font-size: 10px;
  color: #607d8b;
  text-align: center;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Print: sembunyikan gambar agar tidak berat */
@media print {
  .rad-attachment-wrap {
    display: none;
  }
}
</style>
