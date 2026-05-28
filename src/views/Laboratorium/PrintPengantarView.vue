<template>
  <div class="content billing-page">
    <!-- <ProgressBar mode="indeterminate" v-if="loadingLoadBill" style="height: 4px" /> -->
    <loading_overlay :is-loading="loadingLoadBill" message="Memuat data...." />
    <!-- Header / Kop Rumah Sakit -->

    <div class="text-center mb-3">
      <img :src="LINK_LOGO" height="70" width="70" alt="Logo RS" class="mb-2" />
      <h4 class="mb-0">{{ company }}</h4>
      <p class="mb-0">{{ ALAMAT }}</p>
      <!-- <p class="text-muted small">Telp: (021) 555-5555 | Email: info@rumahsakit.com</p> -->
      <hr />
      <h5 class="mt-3 text-uppercase">PENGANTAR PEMERIKSAAN LABORATORIUM</h5>
    </div>

    <!-- Informasi Pasien & Transaksi -->
    <div class="row mb-3">
      <div class="col-sm-6">
        <table class="table table-bordered table-sm info-table">
          <tbody>
            <tr>
              <th>Nama Pasien</th>
              <td>{{ fact?.NAMA }}</td>
            </tr>
            <tr>
              <th>No. RM</th>
              <td>{{ fact?.NOMR }}</td>
            </tr>
            <tr>
              <th>Tgl Lahir / Usia</th>
              <td>{{ fact?.TGLLAHIR }} / ({{ fact?.USIA }})</td>
            </tr>
            <tr>
              <th>Alamat</th>
              <td>{{ fact?.ALAMAT }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-sm-6">
        <table class="table table-bordered table-sm info-table">
          <tbody>
            <tr>
              <th>No Register</th>
              <td>{{ fact?.NOREGISTER }}</td>
            </tr>
            <tr>
              <th>Poli / Ruang</th>
              <td>{{ fact?.POLI_RUANG }}</td>
            </tr>
            <tr>
              <th>Dokter</th>
              <td>{{ fact?.DPJP }}</td>
            </tr>
            <tr>
              <th>Tgl. Permintaan</th>
              <td>{{ formatDateTimeForAPI(fact?.TANGGAL) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- HASIL PEMERIKSAAN LABORATORIUM -->
    <!-- HASIL PEMERIKSAAN LABORATORIUM -->
    <div class="mt-4">
      <div class="row">
        <div class="col-md-4">
          <h6 class="fw-bold">KLINIS</h6>
          <p style="min-height: 4em; border: 1px solid #ddd; padding: 0.5rem; border-radius: 4px">
            {{ fact?.KLINIS }}
          </p>
        </div>
        <div class="col-md-4"></div>
      </div>
      <h6 class="fw-bold">Daftar Permintaan Pemeriksaan</h6>

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

            <td style="height: 5em"></td>
          </template>
        </tbody>
      </table>
    </div>

    <div class="mt-5 text-end" v-if="hasOtorisasi?.status == 1">
      <div style="display: inline-block; min-width: 250px">
        <hr />
        <p class="mb-0 fw-bold">{{ hasOtorisasi.nama_petugas }}</p>
        <p class="mb-0">Dokter / Petugas Laboratorium</p>
        <p class="mb-0 text-muted" style="font-size: 12px">
          {{ formatDateTimeForAPI(hasOtorisasi.tgl_verified) }}
        </p>
        <p class="fst-italic text-muted mt-1" style="font-size: 11px">
          Ditandatangani secara digital
        </p>
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

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

import { useRoute } from 'vue-router'
const route = useRoute()

const datarincianMedis = ref(null)
const loadingLoadBill = ref(false)
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
const loading = ref(false)
const fetchData = async () => {
  try {
    loading.value = true

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
  } finally {
    loading.value = false
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

onMounted(() => {
  fetchData()
  LoadHasilPemeriksaan()
  CheckStatusOtorisasi()
})
</script>

<style scoped>
.billing-page {
  background: #fff;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: #000;
}

/* Warna selang-seling oranye dan putih */
.table-orange.table-striped tbody tr:nth-of-type(odd) {
  background-color: #ffffff;
}
.table-orange.table-striped tbody tr:nth-of-type(even) {
  background-color: #fffbf6;
}

/* Header tabel */
.table-orange thead th {
  background-color: #fff4e0;
  color: #663c00;
  font-weight: 600;
  border-bottom: 2px solid #faf3eb;
}

/* Compact baris */
.table-compact td,
.table-compact th {
  padding: 4px 6px !important;
  font-size: 0.8rem;
  line-height: 1.2;
}

/* Warna total */
.text-orange {
  color: #e65100;
  font-weight: bold;
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

  @media print {
    .digital-sign {
      font-size: 12px;
      color: #000 !important;
    }
  }

  .no-print {
    display: none !important;
  }

  body {
    background: #fff !important;
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

  .bg-secondary.text-white {
    background-color: #6c757d !important;
    color: #ffffff !important;
  }
}
</style>
