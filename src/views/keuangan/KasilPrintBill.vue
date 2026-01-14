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
      <h5 class="mt-3 text-uppercase">Rincian Tagihan Pasien</h5>
    </div>

    <!-- Informasi Pasien & Transaksi -->
    <div class="row mb-3">
      <div class="col-sm-6">
        <table class="table table-bordered table-sm info-table">
          <tbody>
            <tr>
              <th>Nama Pasien</th>
              <td>{{ datarincianMedis?.PASIEN?.NAMAPASIEN }}</td>
            </tr>
            <tr>
              <th>No. RM</th>
              <td>{{ datarincianMedis?.PASIEN?.NOMR }}</td>
            </tr>
            <tr>
              <th>Usia</th>
              <td>{{ datarincianMedis?.PASIEN?.USIA_LENGKAP }}</td>
            </tr>
            <tr>
              <th>Alamat</th>
              <td>
                {{ datarincianMedis?.PASIEN?.ALAMAT }},
                {{ datarincianMedis?.PASIEN?.namakecamatan }},
                {{ datarincianMedis?.PASIEN?.namakota }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-sm-6">
        <table class="table table-bordered table-sm info-table">
          <tbody>
            <tr>
              <th>No Register</th>
              <td>{{ datarincianMedis?.NOREGISTER }}</td>
            </tr>
            <tr>
              <th>Poli / Ruang</th>
              <td>{{ datarincianMedis?.RUANGPOLI }}</td>
            </tr>
            <tr>
              <th>Dokter</th>
              <td>{{ datarincianMedis?.NAMADOKTER }}</td>
            </tr>
            <tr>
              <th>Tgl. Masuk</th>
              <td>{{ formatDateTimeForAPI(datarincianMedis?.MASUKPOLY) }}</td>
            </tr>
            <tr>
              <th>Tgl. Selesai</th>
              <td>{{ formatDateTimeForAPI(datarincianMedis?.KELUARPOLY) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Rincian Tagihan -->
    <div class="table-responsive">
      <table class="table table-striped table-orange table-compact">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: right">Harga</th>
            <th style="text-align: center">Qty</th>
            <th style="text-align: center">Satuan</th>
            <th style="text-align: right">Subtotal</th>
            <th style="text-align: left">Kategori</th>
            <th style="text-align: left">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(items, kategori) in groupedByCategory" :key="kategori">
            <tr class="bg-light font-weight-bold">
              <td colspan="7" style="font-weight: bold">{{ kategori }}</td>
            </tr>
            <tr v-for="(data, index) in items" :key="index">
              <td>{{ data.ITEM }}</td>
              <td style="text-align: right">{{ formatCurrency(data.HARGA) }}</td>
              <td style="text-align: center">{{ data.QTY }}</td>
              <td style="text-align: center">{{ data.SATUAN }}</td>
              <td style="text-align: right">{{ formatCurrency(data.TOTALAMOUNT) }}</td>
              <td>{{ data.KATEGORI }}</td>
              <td>{{ data.TANGGAL }}</td>
            </tr>
            <tr>
              <td colspan="4" style="text-align: right">
                <strong>{{ kategori }}</strong>
              </td>
              <td style="text-align: right">
                <strong>
                  Rp
                  {{
                    formatCurrency(items.reduce((sum, i) => sum + Number(i?.TOTALAMOUNT || 0), 0))
                  }}
                </strong>
              </td>
              <td colspan="2"></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Total -->
    <div class="text-end mt-4">
      <h5>Total Pembayaran:</h5>
      <h3 class="text-orange">Rp {{ formatCurrency(totalAmount) }}</h3>
    </div>

    <!-- Tanda Tangan -->
    <div class="row mt-5">
      <div class="col-6"></div>
      <div class="col-6 text-center">
        <p>{{ ALAMAT }}, {{ new Date().toLocaleDateString('id-ID') }}</p>
        <p>Petugas Kasir</p>
        <br /><br /><br />
        <p>(.....................................)</p>
      </div>
    </div>

    <!-- Tombol Aksi -->
    <div class="row no-print mt-4">
      <div class="col-12 text-end">
        <button class="btn btn-warning" @click="window.print()">
          <i class="fas fa-print"></i> Cetak
        </button>
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
const groupedByCategory = computed(() => {
  if (!datarincianMedis.value?.DETAIL) return {}
  return datarincianMedis.value.DETAIL.reduce((groups, item) => {
    const kategori = item.KATEGORI || 'Tanpa Kategori'
    if (!groups[kategori]) groups[kategori] = []
    groups[kategori].push(item)
    return groups
  }, {})
})

const totalAmount = computed(
  () => datarincianMedis.value?.DETAIL?.reduce((sum, i) => sum + parseFloat(i.TOTALAMOUNT), 0) || 0,
)

const formatCurrency = (val) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(val || 0)

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

// Contoh load data
const detailsBill = async () => {
  loadingLoadBill.value = true
  const url = configStore.apiBaseUrl
  let paramURL = `${route.params.norm}/${id_client.value}/${route.params.noreg}`

  try {
    const res = await axios.post(`${url}/index.php/api/laporan/history_berobat_pasien/${paramURL}`)

    if (res.data && res.data.length > 0) {
      datarincianMedis.value = res.data[0]
      datarincianMedis.value.PASIEN = res.data[0].PASIEN[0]
    } else {
      datarincianMedis.value = null
    }
  } catch (error) {
    console.error('❌ Gagal memuat data rincian medis:', error)
    datarincianMedis.value = null
  } finally {
    loadingLoadBill.value = false
  }
}

onMounted(async () => {
  await detailsBill()

  if (datarincianMedis.value) {
    // 🔹 Tunggu sedikit agar DOM selesai dirender sebelum print
    // setTimeout(() => {
    //   window.print()
    // }, 500)
  }
})
</script>

<style scoped>
.billing-page {
  background: #fff;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
  color: #000;
}

/* Warna selang-seling oranye dan putih */
.table-orange.table-striped tbody tr:nth-of-type(odd) {
  background-color: #fffaf5;
}
.table-orange.table-striped tbody tr:nth-of-type(even) {
  background-color: #faf3eb;
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
