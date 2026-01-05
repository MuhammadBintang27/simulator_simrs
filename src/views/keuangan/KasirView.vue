<template>
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="fas fa-money-bill-wave mr-1"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Kasir</h1>
          <p class="hero-description">
            Kelola transaksi pembayaran pasien dengan cepat, tepat, dan transparan. Catat, proses,
            dan cetak struk pembayaran secara otomatis. Pantau riwayat transaksi dan laporan kas
            harian dengan mudah. Satu sistem terpadu untuk mendukung efisiensi layanan keuangan
            rumah sakit.
          </p>
        </div>
      </div>
    </div>
    <div class="card elevation-0">
      <div class="card-body">
        <div class="row">
          <!-- Tanggal Mulai -->
          <div class="col-md-2">
            <label class="filter-label"> <i class="fas fa-calendar-plus"></i> TANGGAL MULAI </label>
            <DatePicker
              v-model="startDate"
              dateFormat="dd M yy"
              placeholder="Pilih tanggal mulai"
              showIcon
              class="w-100"
              iconDisplay="input"
            />
          </div>

          <!-- Tanggal Akhir -->
          <div class="col-md-2">
            <label class="filter-label">
              <i class="fas fa-calendar-check"></i> TANGGAL AKHIR
            </label>
            <DatePicker
              v-model="endDate"
              dateFormat="dd M yy"
              placeholder="Pilih tanggal akhir"
              showIcon
              class="w-100"
              iconDisplay="input"
            />
          </div>

          <!-- Jenis Rawat -->
          <div class="col-md-1">
            <label class="filter-label"> <i class="fas fa-hospital-user"></i> RAWAT </label>
            <Select
              v-model="jenisRawatSelected"
              :options="jenis_rawat"
              placeholder="Pilih Jenis"
              class="p-column-filter mt-0"
              optionLabel="caption"
            />
          </div>

          <!-- Cara Bayar -->
          <div class="col-md-1">
            <label class="filter-label"> <i class="fas fa-credit-card"></i> CARA BAYAR </label>
            <Select
              v-model="caraBayarSelected"
              :options="caraBayarOptions"
              placeholder="Pilih Cara"
              class="p-column-filter mt-0 w-100"
            />
          </div>

          <!-- Tombol Cari -->
          <div class="col-md-1">
            <br />
            <Button
              class="w-100 mt-2 round-button2"
              @click="fetchData(11)"
              label="Cari"
              icon="fas fa-search"
              :loading="loading"
              :disabled="loading"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"></div>
      <div class="card-body">
        <DataTable
          v-model:filters="filters"
          :value="medicalData"
          striped-rows
          showGridlines
          paginator
          rowHover
          responsiveLayout="scroll"
          scrollable
          scrollHeight="70vh"
          :rows="25"
          :rowsPerPageOptions="[5, 10, 20, 25, 50, 100]"
          @filter="onFilter"
          tableStyle="min-width: 50rem"
          filterDisplay="row"
          :globalFilterFields="[
            'NAMAPASIEN',
            'POLI',
            'CARABAYAR',
            'NAMADOKTER',
            'DIAGNOSA_AWAL',
            'KETERANGAN',
            'STTS_PULANG',
          ]"
        >
          <!-- Header Tombol -->
          <template #header>
            <div class="flex justify-content-between align-items-center">
              <div class="flex gap-2">
                <label class="mr-2">No RM : </label>
                <InputText
                  v-model="rmPasien"
                  placeholder="Cari NORM pasien..."
                  class="p-column-filter w-full mr-2"
                  @keyup.enter="cariPasien"
                />
                <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear Filters"
                  outlined
                  @click="clearFilters"
                />
                <Button
                  type="button"
                  icon="pi pi-file-excel"
                  label="Export ke Excel"
                  severity="success"
                  @click="exportToExcel"
                />
              </div>
            </div>
          </template>
          <Column field="NOMR" header="NOMR" sortable> </Column>
          <Column field="NOPENDAFTARAN" header="NOREG" sortable />
          <Column
            field="NAMAPASIEN"
            header="Nama Pasien"
            style="min-width: 14rem"
            sortable
            filter
            :showFilterMenu="false"
            filterPlaceholder="Cari nama pasien"
          >
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-if="filterModel"
                v-model="filterModel.value"
                @input="filterCallback()"
                placeholder="Cari nama pasien..."
                class="p-column-filter w-full"
              />
            </template>
          </Column>

          <!-- Kolom waktu -->
          <Column field="MASUKPOLY" header="TGL MASUK" sortable style="min-width: 7rem">
            <template #body="{ data }">
              {{ formatDateOnlyForAPI(data.MASUKPOLY) }}
            </template>
          </Column>
          <Column field="MASUKPOLY" header="TGL PULANG" sortable style="min-width: 7rem">
            <template #body="{ data }">
              {{ formatDateOnlyForAPI(data.KELUARPOLY_NULL) }}
            </template>
          </Column>
          <Column field="" header="Aksi" sortable>
            <template #body="{ data }">
              <button
                type="button"
                class="btn btn-block btn-success btn-sm"
                @click="proses_data(data)"
              >
                Proses
              </button>
            </template>
          </Column>
          <Column field="USIA" header="Usia" sortable />
          <Column field="JENISKELAMIN" header="JK" style="min-width: 4rem" sortable />

          <Column field="CARABAYAR" header="Cara Bayar" sortable>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="caraBayarFilterOptions"
                placeholder="Pilih Cara Bayar"
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>
          <Column field="LUNAS" header="LUNAS" sortable>
            <template #body="{ data }">
              <Tag :value="statusLabel(data.LUNAS)" :severity="statusColor(data.LUNAS)" />
            </template>
          </Column>
          <Column field="POLI" header="Poli" style="min-width: 10rem" sortable>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="2"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="poliOptions"
                placeholder="Pilih Poli"
                filter
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>
          <Column field="NAMADOKTER" header="Dokter" style="min-width: 15rem" sortable>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="2"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="dokterOptions"
                placeholder="Pilih Dokter"
                filter
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>
          <Column field="DIAGNOSA_AWAL" header="DX" sortable />

          <Column field="KETERANGAN" header="KETERANGAN" style="min-width: 15rem" sortable>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="KetaranganOpt"
                placeholder="STTS PULANG"
                class="p-column-filter"
                filter
                showClear
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <Dialog
      v-model:visible="showBillDetails"
      modal
      :header="false"
      :style="{ width: '80rem', maxWidth: '95vw' }"
      :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
      class="rounded-2xl overflow-hidden shadow-2xl"
    >
      <!-- Header Section -->

      <ProgressBar mode="indeterminate" v-if="loadingLoadBill" style="height: 2px" />

      <div class="row">
        <div class="col-12">
          <!-- Main content -->
          <div class="invoice p-3 mb-3">
            <!-- title row -->

            <div class="row">
              <div class="col-12">
                <h4>
                  <img :src="LINK_LOGO" height="50" width="50" alt="Link Rental Logo" />
                  {{ company }}
                  <small class="float-right">Billing/Invoice Pasien</small>
                </h4>
              </div>
              <!-- /.col -->
            </div>
            <!-- info row -->
            <div class="row invoice-info">
              <div class="col-sm-4 invoice-col">
                Pasien
                <address>
                  <strong>
                    <h6>
                      {{ datarincianMedis?.PASIEN?.NAMAPASIEN }} -
                      {{ datarincianMedis?.PASIEN?.NOMR }}
                    </h6></strong
                  >
                  Usia : {{ datarincianMedis?.PASIEN?.USIA_LENGKAP }}<br />
                  Alamat : {{ datarincianMedis?.PASIEN?.namakecamatan }} -
                  {{ datarincianMedis?.PASIEN?.namakota }} -
                  {{ datarincianMedis?.PASIEN?.nama_provinsi }}<br />
                  {{ datarincianMedis?.PASIEN.ALAMAT }}<br />
                  Tlp: {{ datarincianMedis?.PASIEN.NOTELP }}<br />
                </address>
              </div>
              <!-- /.col -->

              <div class="col-sm-4 invoice-col">
                Transaksi
                <address>
                  Dokter : <strong> {{ datarincianMedis?.NAMADOKTER }}</strong
                  ><br />
                  Ruang/Poli : <strong> {{ datarincianMedis?.RUANGPOLI }}</strong
                  ><br />
                  Jenis Rawat : <strong> {{ datarincianMedis?.JENISRAWAT }}</strong>
                  <br />
                  Cara Bayar : <strong> {{ datarincianMedis?.CARABAYAR }}</strong>
                </address>
              </div>
              <!-- /.col -->
              <div class="col-sm-4 invoice-col">
                <b>No Register {{ datarincianMedis?.NOREGISTER }}</b
                ><br />
                <br />
                <b>Masuk :</b> {{ formatDateTimeForAPI(datarincianMedis?.MASUKPOLY) }}<br />
                <b>Selesai:</b> {{ formatDateTimeForAPI(datarincianMedis?.KELUARPOLY) }}<br />
              </div>
              <!-- /.col -->
            </div>
            <!-- /.row -->

            <!-- Table row -->
            <div class="row">
              <div class="col-12 table-responsive">
                <table class="table table-striped table-orange table-compact">
                  <thead>
                    <tr>
                      <th>ITEM</th>
                      <th style="text-align: right">HARGA</th>
                      <th style="text-align: center">QTY</th>
                      <th style="text-align: center">SATUAN</th>
                      <th style="text-align: right">SUBTOTAL</th>
                      <th style="text-align: left">KATEGORI</th>
                      <th style="text-align: left">TANGGAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(items, kategori) in groupedByCategory" :key="kategori">
                      <!-- Header kategori -->
                      <tr class="bg-light font-weight-bold">
                        <td colspan="6" style="font-weight: bold">{{ items.kategori }}</td>
                      </tr>

                      <!-- Item per kategori -->
                      <tr v-for="(data, index) in items" :key="index">
                        <td>{{ data?.ITEM }}</td>

                        <td style="text-align: right">{{ formatCurrency(data?.HARGA) }}</td>
                        <td style="text-align: center">{{ data?.QTY }}</td>
                        <td style="text-align: center">{{ data?.SATUAN }}</td>
                        <td style="text-align: right">{{ formatCurrency(data?.TOTALAMOUNT) }}</td>
                        <td style="text-align: left">{{ data?.KATEGORI }}</td>
                        <td style="text-align: left">{{ data?.TANGGAL }}</td>
                      </tr>

                      <!-- Subtotal kategori -->
                      <tr class="bg-secondary text-white">
                        <td colspan="4" style="text-align: right">
                          <strong> {{ kategori }}</strong>
                        </td>
                        <td style="text-align: right">
                          <strong>
                            Rp.
                            {{
                              formatCurrency(
                                items.reduce((sum, i) => sum + Number(i?.TOTALAMOUNT || 0), 0),
                              )
                            }}
                          </strong>
                        </td>
                        <td></td>
                        <td></td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
              <!-- /.col -->
            </div>
            <!-- /.row -->

            <div class="row">
              <!-- accepted payments column -->
              <div class="col-6">
                <p class="lead">Catatan</p>

                <p class="text-muted well well-sm shadow-none" style="margin-top: 10px">
                  Pastikan Anda telah melakukan pemeriksaan ulang terhadap seluruh item dan total
                  billing sebelum menutup transaksi. Kesalahan dalam penagihan tidak dapat
                  diperbaiki setelah proses penutupan dilakukan.
                </p>
              </div>
              <!-- /.col -->
              <div class="col-6">
                <p class="lead"></p>

                <div class="table-responsive">
                  <table class="table">
                    <tbody>
                      <tr>
                        <th style="width: 50%">Grand Total :</th>
                        <td>
                          <strong>
                            <h4 class="text-orange">
                              Rp.{{ formatCurrency(totalAmount) }}
                            </h4></strong
                          >
                        </td>
                      </tr>
                      <tr>
                        <th style="width: 50%">Di Bayar</th>
                        <td>
                          <strong>
                            <h6>Rp.{{ formatCurrency(0) }}</h6></strong
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <!-- /.col -->
            </div>
            <!-- /.row -->

            <!-- this row will not appear when printing -->
            <div class="row no-print">
              <div class="col-12">
                <Button
                  @click="printBill(datarincianMedis)"
                  icon="pi pi-print"
                  label="Print"
                  severity="info"
                  style="width: 150px"
                  class="round-button2"
                />

                <Button
                  icon="pi pi-list"
                  @click="showPaymentConfirm = true"
                  label="Telah melakukan pelunasan"
                  severity="info"
                  class="round-button2 float-right"
                />
              </div>
            </div>
          </div>
          <!-- /.invoice -->
        </div>
        <!-- /.col -->
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showPaymentConfirm"
      modal
      header="Konfirmasi Pelunasan"
      :style="{ width: '40rem' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      class="rounded-lg"
    >
      <div class="flex flex-column gap-4">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 2rem"></i>
          <div>
            <br />
            <p class="m-0 font-semibold text-lg">
              Apakah Anda yakin pasien telah melakukan pelunasan?
            </p>
          </div>
        </div>
        <br />
        <div
          style="
            background-color: #f0f9ff;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #0284c7;
          "
        >
          <div style="margin-bottom: 0.75rem">
            <span style="font-weight: 600">Nama Pasien:</span>
            <br />
            {{ datarincianMedis?.PASIEN?.NAMAPASIEN || '-' }}
          </div>
          <div style="margin-bottom: 0.75rem">
            <span style="font-weight: 600">No. RM:</span>
            <br />
            {{ datarincianMedis?.PASIEN?.NOMR || '-' }}
          </div>
          <div style="margin-bottom: 0.75rem">
            <span style="font-weight: 600">No. Register:</span>
            <br />
            {{ datarincianMedis?.NOREGISTER || '-' }}
          </div>
          <div>
            <span style="font-weight: 600">Total Pembayaran:</span>
            <br />
            <span style="color: #e65100; font-weight: bold; font-size: 1.2rem">
              Rp {{ formatCurrency(totalAmount) }}
            </span>
          </div>
        </div>
        <br />
        <br />
        <Button
          label="Batal"
          icon="pi pi-times"
          class="round-button2"
          @click="showPaymentConfirm = false"
          severity="secondary"
          style="width: 120px"
        />
        <Button
          label="Yakin, Lanjutkan"
          icon="pi pi-check"
          class="round-button2"
          @click="processPaymentConfirmation"
          severity="success"
          :loading="processingPayment"
          style="width: 180px"
        />
      </div>
    </Dialog>

    <ConfirmDialog />
    <Toast />

    <ttdUser
      v-model:showFormOtorisasi="showTTD"
      :noregister="datarincianMedis?.NOREGISTER"
      :mode="12"
      @otpVerified="handleOtpSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly
import DatePicker from 'primevue/datepicker'
import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id, company, LINK_LOGO } = storeToRefs(authStore)
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
const toast = useToast()

const showTTD = ref(false)

import { useRouter } from 'vue-router'

const router = useRouter()
const showPaymentConfirm = ref(false)
const processingPayment = ref(false)
// Toast
// States
const loading = ref(false)
const startDate = ref(new Date())
const endDate = ref(new Date())
const medicalData = ref([])

import ttdUser from '@/components/TtdDigitalComponent.vue'

const showBillDetails = ref(false)

const handleOtpSuccess = async (data) => {
  if (data?.verified == true) {
    await fetchData(11)
  }
}

// --- Data ---
const groupedByCategory = computed(() => {
  if (!datarincianMedis.value?.DETAIL) return {}

  return datarincianMedis.value.DETAIL.reduce((groups, item) => {
    const kategori = item.KATEGORI || 'Tanpa Kategori'
    if (!groups[kategori]) groups[kategori] = []
    groups[kategori].push(item)
    return groups
  }, {})
})

const proses_data = async (data) => {
  console.log(data)
  showBillDetails.value = true

  detailsBill(data)
}

const processPaymentConfirmation = async () => {
  try {
    processingPayment.value = true

    // Add your API call here to mark payment as complete
    // Example:
    showTTD.value = true

    showPaymentConfirm.value = false
    showBillDetails.value = false

    // await fetchData(11)

    processingPayment.value = false
  } catch (error) {
    console.error('Error processing payment:', error)
    showError('Gagal memproses pelunasan: ' + error.message)
    processingPayment.value = false
  }
}

const confirmPayment = () => {
  confirm.require({
    message: `Apakah Anda yakin ingin menandai pasien <strong>${datarincianMedis.value?.PASIEN?.NAMAPASIEN}</strong> telah melakukan pelunasan?<br><br>
              <strong>Total Pembayaran: Rp ${formatCurrency(totalAmount.value)}</strong>`,
    header: 'Konfirmasi Pelunasan',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonStyleClass: 'p-button-success',
    acceptLabel: 'Yakin, Lanjutkan',
    rejectLabel: 'Batal',
    accept: () => {
      processPayment()
    },
    reject: () => {
      showWarning('Proses pelunasan dibatalkan')
    },
  })
}

// Function to process the payment after confirmation
const processPayment = async () => {
  try {
    // Add your payment processing logic here
    // Example: Send payment data to server

    showSuccess(
      `Pelunasan untuk pasien ${datarincianMedis.value.PASIEN.NAMAPASIEN} berhasil diproses`,
    )
    showBillDetails.value = false

    // Refresh data if needed
    await fetchData(11)
  } catch (error) {
    showError('Gagal memproses pelunasan: ' + error.message)
  }
}

const statusLabel = (code) => {
  switch (code) {
    case '0':
      return 'BL'
    case '1':
      return 'LUNAS'
    default:
      return 'Unknown'
  }
}

const statusColor = (code) => {
  switch (code) {
    case '0':
      return 'warn'
    case '1':
      return 'success'
    case '2':
      return 'info'
    default:
      return 'secondary'
  }
}

const rmPasien = ref(null)
const cariPasien = async () => {
  fetchData(7)
}

const caraBayarSelected = ref('BPJS')

const caraBayarOptions = ref(['BPJS', 'UMUM', 'SEMUA'])
// Fixed: Make these reactive refs with empty arrays
const caraBayarFilterOptions = ref([])

const poliOptions = ref([])
const dokterOptions = ref([])
const deskripsi = ref([])
const sudahFilanClaim = ref([])
const KetaranganOpt = ref([])

const totalAmount = computed(() => {
  return datarincianMedis.value?.DETAIL.reduce((sum, item) => sum + parseFloat(item.TOTALAMOUNT), 0)
})
const prosesPembayaran = () => {
  alert(
    `Proses pembayaran untuk pasien ${datarincianMedis.value.PASIEN.NAMAPASIEN} dimulai.\nTotal: Rp ${totalAmount.value.toLocaleString('id-ID')}`,
  )
  showBillDetails.value = false
}

const printBill = async () => {
  if (!datarincianMedis.value?.PASIEN?.NOMR || !datarincianMedis.value?.NOREGISTER) {
    console.error('❌ Data pasien tidak lengkap:', datarincianMedis)
    return
  }

  const routeData = router.resolve({
    name: 'KasilPrintBill',
    params: {
      norm: datarincianMedis.value.PASIEN.NOMR,
      noreg: datarincianMedis.value.NOREGISTER,
    },
  })

  // 🔹 Buka di tab baru
  window.open(routeData.href, '_blank')
}

// Fixed: Update the function to properly set the reactive values
const updateFilterOptions = () => {
  caraBayarFilterOptions.value = getUniqueValues('CARABAYAR')
  poliOptions.value = getUniqueValues('POLI')
  dokterOptions.value = getUniqueValues('NAMADOKTER')
  deskripsi.value = getUniqueValues('DESKRIPSI')
  sudahFilanClaim.value = getUniqueValues('SUDAHFINALCLAIM')
  KetaranganOpt.value = getUniqueValues('KETERANGAN')
}

const getUniqueValues = (field) => {
  return [...new Set(medicalData.value.map((item) => item[field]))]
    .filter((val) => val != null && val !== '') // Filter out null/empty values
    .sort((a, b) => {
      if (!isNaN(a) && !isNaN(b)) {
        return Number(a) - Number(b)
      }
      return a.toString().localeCompare(b.toString())
    })
}

// --- Filters ---
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
  POLI: { value: null, matchMode: FilterMatchMode.IN },
  NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
  KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
  SUDAHFINALCLAIM: { value: null, matchMode: FilterMatchMode.IN },
})

// --- Fungsi Tombol ---
const clearFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
    POLI: { value: null, matchMode: FilterMatchMode.IN },
    NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
    KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
    SUDAHFINALCLAIM: { value: null, matchMode: FilterMatchMode.IN },
  }
}

const exportToExcel = () => {
  import('xlsx').then((xlsx) => {
    const worksheet = xlsx.utils.json_to_sheet(TempfilteredData.value)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Klaim')
    xlsx.writeFile(workbook, 'Data_Klaim.xlsx')
  })
}

const formatCurrency = (value) => {
  if (value == null || value === '') return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    // currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

// Toast helpers
const showSuccess = (msg = 'Berhasil mengambil data') =>
  toast.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 })

const showError = (msg = 'Terjadi kesalahan') =>
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 })

const showWarning = (msg) =>
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: msg, life: 4000 })

const jenisRawatSelected = ref({
  code: '2',
  caption: 'JALAN',
})

const jenis_rawat = ref([
  {
    code: '1',
    caption: 'INAP',
  },
  {
    code: '2',
    caption: 'JALAN',
  },
])

// Formatters
const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch (error) {
    return null
  }
}
// Fetch data
const fact = ref([])
const datarincianMedis = ref(null)

const loadingLoadBill = ref(false)

const detailsBill = async (data) => {
  loadingLoadBill.value = true
  datarincianMedis.value = null
  const url = configStore.apiBaseUrl
  let paramURL = `${data.NOMR}/${id_client.value}/${data.NOPENDAFTARAN}`
  const response = await axios.post(
    `${url}/index.php/api/laporan/history_berobat_pasien/${paramURL}`,
  )

  if (response.data.length > 0) {
    datarincianMedis.value = response.data[0]
    datarincianMedis.value.PASIEN = response.data[0].PASIEN[0]

    console.log(datarincianMedis.value)
  }
  loadingLoadBill.value = false
}

const fetchData = async (mode) => {
  try {
    const payload = {
      id_client: id_client.value,
      tglawal: formatDateOnlyForAPI(startDate.value),
      tglakhir: formatDateOnlyForAPI(endDate.value),
      kodeunit: '',
      jenisrawat: jenisRawatSelected.value.caption,
      mod: mode,
      bulan_tahun: '',
      norm: rmPasien.value,
      cara_bayar: caraBayarSelected.value,
    }

    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/history_versi4`,
      payload,
    )

    if (response.data.metadata.code == 200) {
      medicalData.value = []
      medicalData.value = response.data.response
      // Fixed: Call updateFilterOptions after data is loaded
      updateFilterOptions()
      showSuccess(`Data berhasil dimuat: ${medicalData.value.length} records`)
    } else {
      medicalData.value = []
      showWarning('Tidak ada data ditemukan')
    }

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal mengambil data: ' + error.message)
    loading.value = false
  }
}

const TempfilteredData = ref([])
const onFilter = (event) => {
  // ✅ handle kemungkinan null
  TempfilteredData.value = event.filteredValue || []
  //updateSummary()
}

onMounted(() => {
  // Optionally load dropdown data here
})
</script>

<style scoped>
.filter-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #555;
}

.round-button2 {
  border-radius: 8px;
}
.hero-section {
  background: linear-gradient(135deg, #134e5e 0%, #059669 100%);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  color: white;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.2);
}

.hover-grow {
  cursor: pointer; /* hand cursor */
  transition: transform 0.1s ease-in-out;
}

.hover-grow:hover {
  transform: scale(1.1); /* grow 10% on hover */
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.91rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1rem;
  min-width: 140px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem; /* Adjust these values as needed */
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.5rem; /* Optional: adjust header height too */
}

.stat-box {
  color: #333;
  border: none;
  position: relative;
  overflow: hidden;
  transition: transform 0.1s ease;
}

.stat-box:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
/* Warna total */
.text-orange {
  color: #e65100;
  font-weight: bold;
}

/* Pattern transparan */
.stat-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

/* Soft gradients */
.gradient-primary {
  background: linear-gradient(135deg, #cde5ff, #e7f0ff);
}

.gradient-success {
  background: linear-gradient(135deg, #d4f8e8, #e9fff5);
}

.gradient-warning {
  background: linear-gradient(135deg, #fff2cc, #fff8e1);
}

/* Warna baris selang-seling oranye dan putih */
.table-orange.table-striped tbody tr:nth-of-type(odd) {
  background-color: #fffaf5; /* putih-oranye lembut */
}

.table-orange.table-striped tbody tr:nth-of-type(even) {
  background-color: #faf3eb; /* oranye muda */
}

/* Efek hover */
.table-orange tbody tr:hover {
  background-color: #faf3eb !important; /* oranye sedikit lebih gelap */
  transition: background-color 0.2s ease;
}

/* Header */
.table-orange thead th {
  background-color: #fff4e0;
  color: #663c00;
  font-weight: 600;
  border-bottom: 2px solid #faf3eb;
}

/* Tambahan opsional: garis tabel lembut */
.table-orange td,
.table-orange th {
  border-color: #faf3eb;
}

/* === Baris lebih rapat (compact mode) === */
.table-compact td,
.table-compact th {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  vertical-align: middle !important;
  font-size: 0.8rem; /* opsional: sedikit kecil agar rapi */
  line-height: 1.2;
}

/* (Opsional) Sudut lembut */
.table-orange {
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
