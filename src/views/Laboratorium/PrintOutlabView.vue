<template>
  <div class="content billing-page">
    <loading_overlay :is-loading="loadingLoadBill" message="Memuat data...." />

    <div v-if="loadingLoadBill" class="report-skeleton">
      <div class="report-header mb-4 skeleton-header">
        <div class="header-brand">
          <Skeleton shape="circle" size="70" />
          <div class="skeleton-text-block">
            <Skeleton width="220px" height="1.2rem" class="mb-2" />
            <Skeleton width="180px" height="0.95rem" class="mb-2" />
            <Skeleton width="140px" height="0.95rem" />
          </div>
        </div>
        <div class="report-meta text-end skeleton-meta">
          <Skeleton width="140px" height="1.3rem" class="mb-2" />
          <Skeleton width="120px" height="0.95rem" class="mb-2" />
          <Skeleton width="100px" height="0.95rem" />
        </div>
      </div>

      <div class="section-box info-row skeleton-info-box mb-4">
        <div class="info-card skeleton-card">
          <Skeleton width="40%" height="1rem" class="mb-4" />
          <Skeleton width="100%" height="0.85rem" class="mb-3" />
          <Skeleton width="100%" height="0.85rem" class="mb-3" />
          <Skeleton width="90%" height="0.85rem" class="mb-3" />
          <Skeleton width="80%" height="0.85rem" />
        </div>
        <div class="info-card skeleton-card">
          <Skeleton width="40%" height="1rem" class="mb-4" />
          <Skeleton width="100%" height="0.85rem" class="mb-3" />
          <Skeleton width="100%" height="0.85rem" class="mb-3" />
          <Skeleton width="90%" height="0.85rem" class="mb-3" />
          <Skeleton width="80%" height="0.85rem" />
        </div>
      </div>

      <div class="section-box skeleton-clinic mb-4">
        <Skeleton width="30%" height="1rem" class="mb-3" />
        <Skeleton width="100%" height="3.5rem" />
      </div>

      <div class="mb-3 skeleton-table-section">
        <Skeleton width="30%" height="1rem" class="mb-3" />
        <Skeleton width="100%" height="2.8rem" class="mb-3" />
        <Skeleton width="100%" height="2.8rem" class="mb-3" />
        <Skeleton width="100%" height="2.8rem" />
      </div>
    </div>

    <div v-else>
      <div class="report-header mb-4">
        <div class="header-brand">
          <img :src="LINK_LOGO" height="70" width="70" alt="Logo RS" />
          <div>
            <h4 class="mb-1">{{ company }}</h4>
            <p class="mb-0 text-muted">{{ ALAMAT }}</p>
            <p class="mb-0 text-muted">HASIL PEMERIKSAAN LABORATORIUM</p>
          </div>
        </div>
        <div class="report-meta text-end">
          <span class="report-badge">Laporan Laboratorium</span>
          <p class="mb-0 text-muted">Tanggal Cetak</p>
          <p class="mb-0">{{ formatDateTimeForAPI(new Date()) }}</p>
        </div>
      </div>

      <div class="row report-section mb-4">
        <div class="col-12">
          <div class="section-box info-row">
            <div class="info-card">
              <h6 class="section-heading">Informasi Pasien</h6>
              <table class="table table-borderless table-sm info-table">
                <tbody>
                  <tr>
                    <th>Nama Pasien</th>
                    <td>{{ fact?.NAMA || '-' }}</td>
                  </tr>
                  <tr>
                    <th>No. RM</th>
                    <td>{{ fact?.NOMR || '-' }}</td>
                  </tr>
                  <tr>
                    <th>Tgl Lahir / Usia</th>
                    <td>{{ fact?.TGLLAHIR || '-' }} / ({{ fact?.USIA || '-' }})</td>
                  </tr>
                  <tr>
                    <th>Alamat</th>
                    <td>{{ fact?.ALAMAT || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="info-card">
              <h6 class="section-heading">Informasi Transaksi</h6>
              <table class="table table-borderless table-sm info-table">
                <tbody>
                  <tr>
                    <th>No Register</th>
                    <td>{{ fact?.NOREGISTER || '-' }}</td>
                  </tr>
                  <tr>
                    <th>Poli / Ruang</th>
                    <td>{{ fact?.POLI_RUANG || '-' }}</td>
                  </tr>
                  <tr>
                    <th>Dokter</th>
                    <td>{{ fact?.DPJP || '-' }}</td>
                  </tr>
                  <tr>
                    <th>Tgl. Permintaan</th>
                    <td>{{ formatDateTimeForAPI(fact?.TANGGAL) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- HASIL PEMERIKSAAN LABORATORIUM -->
      <!-- HASIL PEMERIKSAAN LABORATORIUM -->

      <div class="row mb-4">
        <div class="col-12">
          <h6 class="section-heading">Klinis</h6>
          <p class="clinical-note">{{ fact?.KLINIS || '-' }}</p>
        </div>
      </div>

      <div class="mb-3">
        <h6 class="section-heading">Hasil Pemeriksaan</h6>

        <table class="table table-bordered table-sm table-orange table-striped table-compact">
          <thead>
            <tr>
              <th style="width: 30%">Pemeriksaan</th>
              <th style="width: 15%">Hasil</th>
              <th style="width: 20%">Nilai Normal</th>
              <th style="width: 10%">Satuan</th>
              <th style="width: 25%">Keterangan</th>
            </tr>
          </thead>

          <tbody>
            <!-- GROUP HEADER -->
            <template v-for="(group, namaGroup) in groupedHasil" :key="namaGroup">
              <tr class="bg-light">
                <td colspan="5" class="fw-bold text-uppercase" style="background: #fff4e0">
                  <strong> {{ namaGroup }}</strong>
                </td>
              </tr>
              <!-- DETAIL ITEM -->
              <tr v-for="item in group" :key="item.ID">
                <td>
                  <span class="ml-3"> {{ item.PEMERIKSAAN }}</span>
                </td>

                <td :style="item.HASIL_TIDAK_NORMAL == '1' ? 'color:red;font-weight:bold;' : ''">
                  {{ item.HASIL }}
                </td>

                <td>{{ item.NORMAL }}</td>
                <td>{{ item.SATUAN }}</td>
                <td>{{ item.KETERANGAN || item.KETERANGAN_REMARK || '-' }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="mt-5 signature-wrapper" v-if="hasOtorisasi?.status == 1">
        <div class="signature-card-container">
          <!-- Verifikator (Kiri) -->
          <div class="signature-slot">
            <div class="signature-badge sig-badge-blue">Petugas Verifikasi</div>
            <div class="signature-body">
              <QrcodeVue
                v-if="hasOtorisasi.nama_user"
                :value="hasOtorisasi.nama_user"
                :size="50"
                level="H"
                class="signature-qr"
              />
              <div class="signature-info">
                <p class="signature-name">{{ hasOtorisasi.nama_user || '-' }}</p>
                <p class="signature-title">Verifikator</p>
                <hr class="signature-divider" />
                <p class="signature-date">{{ formatDateTimeForAPI(hasOtorisasi.tgl_verified) }}</p>
              </div>
            </div>
          </div>

          <div class="sig-divider-vertical"></div>

          <!-- Dokter / Petugas Lab (Kanan) -->
          <div class="signature-slot">
            <div class="signature-badge sig-badge-green">&#10003; Ditandatangani Digital</div>
            <div class="signature-body">
              <QrcodeVue
                v-if="hasOtorisasi.nama_petugas"
                :value="hasOtorisasi.nama_petugas"
                :size="50"
                level="H"
                class="signature-qr"
              />
              <div class="signature-info">
                <p class="signature-name">{{ hasOtorisasi.nama_petugas }}</p>
                <p class="signature-title">Dokter Laboratorium</p>
                <hr class="signature-divider" />
                <p class="signature-date">{{ formatDateTimeForAPI(hasOtorisasi.tgl_verified) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'
import Skeleton from 'primevue/skeleton'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

import { useRoute } from 'vue-router'
const route = useRoute()

const datarincianMedis = ref(null)
const loadingLoadBill = ref(true)
// Grup berdasarkan kategori

const formatDateTimeForAPI = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0',
  )}`
}

const fact = ref([])
const fetchData = async () => {
  try {
    const payload = {
      id_client: id_client.value,
      kategori: 'LABORATORIUM',
      receipt_no: route.params.noreceipt,
      mode: 3,
      status: '',
      nomr: '',
      tanggal: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_list_labor_dan_radiologiv2`,
      payload,
    )

    fact.value = response.data.response[0] || null
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const hasOtorisasi = ref({
  status: '',
  nama_petugas: '',
  tgl_verified: '',
})
const CheckStatusOtorisasi = async () => {
  const url = configStore.apiApotikUrl
  const response = await axios.get(
    `${url}/index.php/api/sales/get_data_ferify/${route.params.noreceipt}/${id_client.value}`,
  )

  hasOtorisasi.value = response.data.response
}

// Group hasil lab berdasarkan BARCODE
const groupedHasil = computed(() => {
  const groups = {}
  LoadHasilPemeriksaanlist.value.forEach((item) => {
    if (!groups[item.KATEGORI]) groups[item.KATEGORI] = []
    groups[item.KATEGORI].push(item)
  })
  return groups
})
const LoadHasilPemeriksaanlist = ref([])
const LoadHasilPemeriksaan = async () => {
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/sales/get_detail_lab/${route.params.noreceipt}/${id_client.value}`,
    )

    if (response.data.response && response.data.response.length > 0) {
      LoadHasilPemeriksaanlist.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    //showError(error.message)
  }
}

onMounted(async () => {
  try {
    await Promise.all([fetchData(), LoadHasilPemeriksaan(), CheckStatusOtorisasi()])
  } finally {
    loadingLoadBill.value = false
  }
})
</script>

<style scoped>
.billing-page {
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  padding: 2rem;
  font-family: 'Inter', 'Arial', sans-serif;
  font-size: 14px;
  color: #1f2937;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.report-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.header-brand img {
  border-radius: 12px;
  object-fit: contain;
  background: #fff;
  padding: 0.2rem;
}

.header-brand h4 {
  font-size: 1.45rem;
  margin-bottom: 0.15rem;
}

.report-meta {
  min-width: 180px;
}

.report-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.85rem;
  background: #fff1df;
  color: #7f4d1d;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.report-section {
  gap: 1.5rem;
}

.section-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.85rem 1rem;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.info-card {
  flex: 1 1 48%;
  min-width: 300px;
}

.section-heading {
  margin-bottom: 0rem;
  color: #111827;
  font-size: 0.95rem;
  letter-spacing: 0em;
  font-weight: 700;
  text-transform: uppercase;
}

.report-skeleton .skeleton-header {
  align-items: flex-start;
}

.skeleton-text-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.skeleton-info-box {
  padding: 1rem;
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-clinic {
  padding: 1rem;
}

.skeleton-table-section {
  padding: 0.75rem;
}

.info-table th {
  width: 38%;
  background: transparent;
  border: none;
  color: #374151;
  font-weight: 600;
  padding: 0.45rem 0rem;
}

.info-table td {
  border: none;
  padding: 0.45rem 0.75rem;
  color: #1f2937;
}

.clinical-note {
  min-height: 4em;
  border: 1px solid #e5e7eb;
  background: #fffbf3;
  padding: 0.85rem;
  border-radius: 12px;
  color: #334155;
  line-height: 0.5;
}

.table-orange.table-striped tbody tr:nth-of-type(odd) {
  background-color: #fffaf5;
}
.table-orange.table-striped tbody tr:nth-of-type(even) {
  background-color: #faf3eb;
}

.table-orange thead th {
  background-color: #fff4e0;
  color: #663c00;
  font-weight: 600;
  border-bottom: 2px solid #f7e1c7;
}

.table-compact td,
.table-compact th {
  padding: 0.65rem 0.85rem !important;
  font-size: 0.84rem;
  line-height: 0.2;
}

.signature-wrapper {
  display: flex;
  justify-content: flex-end;
}

.signature-card-container {
  display: flex;
  align-items: stretch;
  border: 1px solid #f7c97a;
  border-radius: 10px;
  background: #fffdf7;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(180, 120, 0, 0.06);
}

.signature-slot {
  padding: 0.55rem 0.8rem;
  min-width: 210px;
  display: flex;
  flex-direction: column;
}

.signature-slot-text {
  justify-content: center;
  padding: 0.45rem 0.65rem;
  min-width: 140px;
}

.sig-divider-vertical {
  width: 1px;
  background: #f0e4c8;
  flex-shrink: 0;
}

.signature-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  margin-bottom: 0.55rem;
  width: fit-content;
}

.sig-badge-blue {
  background: #e3f2fd;
  color: #0d47a1;
  border: 1px solid #90caf9;
}

.sig-badge-green {
  background: #e6f4ea;
  color: #1a6b2e;
  border: 1px solid #a8d5b5;
}

.signature-body {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.signature-qr {
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 3px;
  background: #fff;
}

.signature-info {
  flex: 1;
}

.signature-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.1rem;
}

.signature-title {
  font-size: 0.68rem;
  color: #6b7280;
  margin-bottom: 0;
}

.signature-divider {
  border-color: #f0e4c8;
  margin: 0.35rem 0;
}

.signature-divider-text {
  border-color: #f0e4c8;
  margin: 0.2rem 0;
}

.signature-date {
  font-size: 0.63rem;
  color: #9ca3af;
  margin-bottom: 0;
  font-style: italic;
}

.signature-date-text {
  font-size: 0.6rem;
  color: #9ca3af;
  margin-bottom: 0;
  font-style: italic;
}

/* Sembunyikan tombol saat print + warna tetap muncul */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    size: A4;
    margin: 15mm;
  }

  .no-print {
    display: none !important;
  }

  body {
    background: #fff !important;
  }

  .billing-page {
    box-shadow: none;
    border-radius: 0;
    padding: 0;
  }

  .table-orange thead th {
    background-color: #fff4e0 !important;
    color: #663c00 !important;
  }

  .table-orange.table-striped tbody tr:nth-of-type(odd) {
    background-color: #fffaf5 !important;
  }

  .table-orange.table-striped tbody tr:nth-of-type(even) {
    background-color: #faf3eb !important;
  }
}
</style>
