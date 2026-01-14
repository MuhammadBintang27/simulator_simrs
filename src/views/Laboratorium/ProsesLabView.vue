<template>
  <loading_overlay :is-loading="loading" message="Silahkan menunggu...." />
  <div class="content">
    <div class="card elevation-0">
      <div class="card-header">
        <h5>
          <Button
            icon="pi pi-arrow-left"
            class="p-button-rounded p-button-text p-button-lg back-button"
            @click="goBack"
            v-tooltip.bottom="'Kembali'"
          /><i class="fas fa-vial mr-2"></i> Proses permintaan laboratorium
        </h5>
      </div>
    </div>
    <Panel>
      <template #header>
        <div v-if="fact">
          <h6>
            <strong>
              <i class="far fa-user mr-1" style="color: orange"></i>{{ fact?.NOMR }} -
              {{ fact?.NAMA }} ({{ fact?.JENISKELAMIN }} {{ fact?.USIA }}) | {{ fact.JENISRAWAT }} |
              {{ fact.DPJP }}
            </strong>
          </h6>
          RUANG/POLI : <strong>{{ fact.POLI_RUANG }}</strong
          ><br />
          <i class="fas fa-map-marker-alt mr-1" style="color: orange"></i>{{ fact?.ALAMAT }}
        </div>
      </template>
      <template #icons>
        <Button
          class="round-button2"
          icon="pi pi-search"
          :loading="loadingTemplate"
          @click="panggilTemplate()"
          label="Template"
        />
      </template>

      <div class="row">
        <!-- Scrollable Item List -->
        <div class="col-md-2">
          <div class="items-container">
            <LabRequestCard
              v-for="(item, index) in itemPemeriksaan"
              :key="index"
              :barcode="item?.BARCODE"
              :waktu="item?.TANGGAL"
              :jenis="item?.NAMABARANG"
              :model-value="selectedBarcode"
              @update:model-value="handleSelectItem(item, $event)"
            />
          </div>
        </div>

        <!-- Details Section -->
        <div class="col-md-8">
          <ProgressBar
            v-if="LoadingHasil"
            mode="indeterminate"
            :loading="LoadingHasil"
            style="height: 3px"
          ></ProgressBar>
          <DataTable
            :value="LoadHasilPemeriksaanlist"
            rowGroupMode="subheader"
            groupRowsBy="KATEGORI"
            :sortField="'KATEGORI'"
            :sortOrder="1"
            striped-rows
            responsive-layout="scroll"
            class="p-datatable-sm"
            :paginator="false"
            scrollable
            scrollHeight="500px"
            current-page-report-template="Menampilkan {first} hingga {last} dari {totalRecords} hasil"
          >
            <!-- === GROUP HEADER === -->
            <template #groupheader="slotProps">
              <tr>
                <td colspan="8" class="bg-gray-100 text-sm">
                  {{ slotProps.data.KATEGORI }}
                </td>
                <Button
                  icon="pi pi-times"
                  label=""
                  text
                  class="round-button2"
                  severity="danger"
                  size="small"
                  @click="removeCategory(slotProps.data)"
                />
              </tr>
            </template>

            <!-- === OPTIONAL: GROUP FOOTER === -->
            <!--
  <template #groupfooter="slotProps">
    <tr>
      <td colspan="7" class="bg-gray-50 text-sm py-2">
        Total item: {{ slotProps.group.length }}
      </td>
    </tr>
  </template>
  -->

            <!-- === COLUMNS === -->
            <Column field="PEMERIKSAAN" header="Pemeriksaan" :sortable="true" style="width: 20%">
              <template #body="{ data }">
                <span class="font-semibold ml-5">{{ data.PEMERIKSAAN }}</span>
              </template>
            </Column>

            <Column field="HASIL" header="Hasil" :sortable="true" style="width: 12%">
              <template #body="{ data }">
                <InputText
                  v-model="data.HASIL"
                  @keydown.enter.prevent="moveToNextInput($event)"
                  class="w-full hasil-input hasil-focusable"
                  @update:model-value="updateHasilColor(data)"
                  :class="{
                    'hasil-abnormal': isAbnormal(data),
                    'hasil-normal': !isAbnormal(data),
                  }"
                />
              </template>
            </Column>

            <Column field="SATUAN" header="Satuan" style="width: 12%">
              <template #body="{ data }">
                <span class="text-gray-600">{{ data.SATUAN }}</span>
              </template>
            </Column>

            <Column field="NORMAL" header="Nilai Normal" style="width: 25%">
              <template #body="{ data }">
                <span class="text-gray-700">{{ data.NORMAL }}</span>
              </template>
            </Column>

            <Column field="METODE" header="Metode" style="width: 12%">
              <template #body="{ data }">
                <span v-if="data.METODE" class="text-gray-600">{{ data.METODE }}</span>
                <span v-else class="text-gray-400">-</span>
              </template>
            </Column>

            <Column header="Status Tidak Normal" style="width: 12%">
              <template #body="{ data }">
                <div class="status-column">
                  <Checkbox
                    v-model="data.HASIL_TIDAK_NORMAL"
                    :true-value="'1'"
                    :false-value="'0'"
                    :binary="true"
                    class="status-checkbox"
                  />
                  <span v-if="data.HASIL_TIDAK_NORMAL === '0'" class="ml-2 text-green-600"
                    >Normal</span
                  >
                  <span v-else class="ml-2 text-red-600">Abnormal</span>
                </div>
              </template>
            </Column>
            <Column field="" heade="Aksi">
              <template #body="{ data }">
                <Button
                  icon="pi pi-times"
                  label=""
                  text
                  class="round-button"
                  severity="danger"
                  size="small"
                  @click="removeItem(data)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
        <!-- Actions Section -->
        <div class="col-md-2">
          <div class="row">
            <!-- Jenis Spesimen -->
            <div class="col-md-12">
              <div class="card elevation-0">
                <div class="flex items-center gap-2">
                  <InputText
                    v-model="no_laboratorium"
                    placeholder="Sink dengan LIS"
                    class="w-50"
                    style="width: 5em"
                  />
                  <Button
                    class=""
                    icon="pi pi-sync"
                    :loading="loadingTemplate"
                    @click="sync_data_LIS"
                    style="height: 37px"
                    label=""
                  />
                </div>
              </div>
              <div class="card elevation-0" style="background-color: aliceblue">
                <div class="card-body">
                  <h6 class="mb-1">Jenis Spesimen</h6>
                  <div v-for="(specimen, index) in data.type" :key="index" class="mb-1">
                    <p class="mb-0">
                      <strong>{{ specimen.label }}</strong>
                    </p>
                    <small class="text-muted"
                      >{{ specimen.snomed_code }} |
                      {{ formatDate(specimen.waktu_terima_spesimen) }}</small
                    >
                  </div>
                </div>
              </div>
            </div>
            <!-- Metode Pengambilan -->

            <div class="col-md-12">
              <div class="card elevation-0" style="background-color: aliceblue">
                <div class="card-body">
                  <h6 class="mb-1">Metode Pengambilan</h6>
                  <div v-for="(method, index) in data.collectionMethod" :key="index" class="mb-1">
                    <p class="mb-0">{{ index + 1 }}. {{ method.label }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <template #footer>
        <div class="row">
          <div class="col-md-8">
            <Button
              label="Simpan"
              icon="pi pi-save"
              @click="simpanDataPemeriksaan"
              :disabled="hasOtorisasi?.status == 1"
            />

            <Button
              label="Otorisasi"
              severity="warn"
              icon="pi pi-check"
              @click="showDialog = true"
              :disabled="hasOtorisasi?.status == 1"
            />
            <Button label="Cetak" severity="default" icon="pi pi-print" @click="prinHasilLab" />
            <Button
              label="Cetak Pengantar"
              severity="info"
              icon="pi pi-print"
              @click="printPengantar"
            />
          </div>

          <div class="col-md-4">
            <div class="form-group">
              <label for="">Otoriasi Oleh</label>
              {{ hasOtorisasi.nama_petugas }}|
              <label for="">Stts Otorisasi</label>
              {{ hasOtorisasi.tgl_verified }}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <label>Catatan Kesan</label>
            <Textarea v-model="catatan" autoResize rows="5" style="width: 100%" />
          </div>
        </div>
      </template>
    </Panel>
  </div>

  <Dialog
    v-model:visible="showTemplate"
    :style="{ width: '1200px' }"
    :modal="true"
    :closable="false"
  >
    <template #header>
      <!-- Global Search -->
      <div class="flex mb-3">
        <InputText
          v-model="filters.global.value"
          placeholder="Search..."
          class="p-inputtext-sm"
          style="width: 250px"
        />
      </div>
    </template>

    <table class="table group-table">
      <thead>
        <tr>
          <th style="width: 40px">#</th>
          <th>Nama Pemeriksaan</th>
          <th>Satuan</th>
          <th>Rujukan</th>
        </tr>
      </thead>

      <tbody v-for="(items, kategori) in groupedTemplate" :key="kategori">
        <!-- HEADER GRUP -->
        <!-- Header Group -->
        <tr class="group-row">
          <td colspan="4">
            {{ kategori }}
            <button class="btn btn-success btn-xs" @click="addKategori(items)">Tambahkan</button>
          </td>
        </tr>

        <!-- List item -->
        <tr v-for="(item, index) in items" :key="item.ID">
          <td>{{ index + 1 }}</td>
          <td>{{ item.ITEM }}</td>
          <td>{{ item.SATUAN }}</td>
          <td>{{ item.RUJUKAN }}</td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <Button label="Close" icon="pi pi-times" @click="showTemplate = false" />
    </template>
  </Dialog>

  <TtdDigitalComponent_v2 v-model:showFormOtorisasi="showDialog" @otpVerified="handleTTD" />

  <Dialog
    v-model:visible="showPreviewLis"
    modal
    header="Hasil Pemeriksaan Laboratorium"
    style="width: 75vw"
    :breakpoints="{ '960px': '95vw' }"
  >
    <!-- INFORMASI PASIEN -->

    <div class="mb-4 grid">
      <div class="col-6"><b>Nama</b> : {{ pasien.nama_pasien }}</div>
      <div class="col-6"><b>No RM</b> : {{ pasien.no_rm }}</div>
      <div class="col-6"><b>JK</b> : {{ pasien.jenis_kelamin }}</div>
      <div class="col-6"><b>Tgl Lahir</b> : {{ pasien.tanggal_lahir }}</div>
      <div class="col-12"><b>No Lab</b> : {{ dataLab.no_laboratorium }}</div>
    </div>

    <Divider />

    <!-- SUB KATEGORI -->
    <div v-for="(items, sub) in groupedPemeriksaan" :key="sub" class="mb-4">
      <div class="row">
        <div class="col-md-6">
          <h5 class="mb-2">{{ sub }}</h5>
        </div>
        <div class="col-md-6" style="text-align: right">
          <Button
            label="Sinkronkan data"
            class="round-button2 mb-1"
            severity="warn"
            icon="pi pi-sync"
            @click="singkron_data(items)"
          />
        </div>
      </div>

      <DataTable :value="items" size="small" stripedRows responsiveLayout="scroll">
        <Column field="nama_pemeriksaan" header="Pemeriksaan" />

        <Column header="Hasil">
          <template #body="{ data }">
            {{ data.hasil.nilai_hasil }}
          </template>
        </Column>

        <Column header="Satuan">
          <template #body="{ data }">
            {{ data.hasil.satuan || '-' }}
          </template>
        </Column>

        <Column header="Nilai Normal">
          <template #body="{ data }">
            {{ data.hasil.nilai_normal }}
          </template>
        </Column>

        <Column header="Flag" style="width: 80px">
          <template #body="{ data }">
            <Tag
              :severity="flagSeverity(data.hasil.flag_kode)"
              :value="data.hasil.flag_kode"
              rounded
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Divider />

    <!-- FOOTER -->
    <div class="grid text-sm">
      <div class="col-6"><b>Analis</b> : {{ dataLab.analis }}</div>
      <div class="col-6"><b>Waktu Verifikasi</b> : {{ dataLab.waktu_verifikasi }}</div>
    </div>
  </Dialog>

  <Toast />
  <ConfirmDialog />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import LabRequestCard from '@/components/Laboratorium/cardpemeriksaanComponent.vue'
import { FilterMatchMode } from '@primevue/core/api'
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, url_lis } = storeToRefs(authStore)
const toast = useToast()
const route = useRoute()

const showPreviewLis = ref(false)

import TtdDigitalComponent_v2 from '@/components/TtdDigitalComponent_v2.vue'

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()

const catatan = ref(null)

const showDialog = ref(false)

const loading = ref(false)
const fact = ref(null)
const itemPemeriksaan = ref([])
const selectedBarcode = ref(null)
const selectedItems = ref(null)
const LoadHasilPemeriksaanlist = ref([])

const showTemplate = ref(false)

import { useRouter } from 'vue-router'

const router = useRouter()

// Toast functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: message,
    life: 3000,
  })
}
const groupedTemplate = computed(() => {
  const groups = {}

  filteredTemplate.value.forEach((item) => {
    const kategori = item.KATEGORI || 'TANPA KATEGORI'
    if (!groups[kategori]) groups[kategori] = []
    groups[kategori].push(item)
  })

  return groups
})

const singkron_data = async (items) => {
  const clean = (val) =>
    val
      ?.toString()
      .replace(/[\r\n]/g, '')
      .trim() ?? ''

  LoadHasilPemeriksaanlist.value.forEach((template) => {
    console.log(template)
    items.forEach((item) => {
      if (clean(item.kode_pemeriksaan) === clean(template.SUB_KATEGORI)) {
        template.HASIL = item.hasil?.nilai_hasil ?? null
        template.HASIL_TIDAK_NORMAL = item.hasil.flag_kode == 'N' ? '0' : '1'
      }
    })
  })

  items.forEach((item) => {
    console.log(item)
  })
}

// Tunggu DOM update (PrimeVue dynamic rows)
const moveToNextInput = (event) => {
  const inputs = document.querySelectorAll('.hasil-focusable')
  const index = Array.from(inputs).indexOf(event.target)

  if (index >= 0 && index < inputs.length - 1) {
    inputs[index + 1].focus()
  }
}

const removeItem = (item) => {
  // confirm.require({
  //   message: `Anda ingin menghapus item pemeriksaan ini "${item.PEMERIKSAAN}"?`,
  //   header: 'Konfirm hapus',
  //   icon: 'pi pi-exclamation-triangle',
  //   rejectLabel: 'Batal',
  //   acceptLabel: 'Hapus',
  //   rejectClass: 'p-button-secondary p-button-outlined round-button2',
  //   acceptClass: 'p-button-danger round-button2',
  //   accept: () => {
  const index = LoadHasilPemeriksaanlist.value.findIndex((row) => row.ID === item.ID)

  if (index !== -1) {
    LoadHasilPemeriksaanlist.value.splice(index, 1)
  }
  //   },
  // })
}

const removeCategory = (item) => {
  confirm.require({
    message: `Anda ingin menghapus pemeriksaan ini "${item.KATEGORI}"?`,
    header: 'Konfirm hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => {
      for (let i = LoadHasilPemeriksaanlist.value.length - 1; i >= 0; i--) {
        if (LoadHasilPemeriksaanlist.value[i].KATEGORI === item.KATEGORI) {
          LoadHasilPemeriksaanlist.value.splice(i, 1)
        }
      }
    },
  })
}
const showError = (message = 'An error occurred') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const showWarning = (message = 'Warning') => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

// Go back
const goBack = () => {
  window.close()
}

const data = ref({
  collectionMethod: [
    {
      kategori: '',
      label: '',
    },
  ],
  type: [
    {
      label: '',
      snomed_code: '',
      waktu_terima_spesimen: '',
    },
  ],
})

// DATA dari API LIS
const dataLab = ref({
  /* tempel JSON LIS kamu di sini */
})

const pasien = computed(() => dataLab.value.pasien || {})

const groupedPemeriksaan = computed(() => {
  const groups = {}
  if (!dataLab.value?.pemeriksaan) return groups

  dataLab.value.pemeriksaan.forEach((item) => {
    const key = item.sub_kategori_pemeriksaan.nama_sub_kategori
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
})

const flagSeverity = (flag) => {
  switch (flag) {
    case 'H':
      return 'danger'
    case 'L':
      return 'warning'
    default:
      return 'success'
  }
}

const no_laboratorium = ref('')

const sync_lis = async () => {
  try {
    loading.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/penunjang/list_get_hasil/${no_laboratorium.value}`,
    )

    console.log(response.data)

    if (response.data.status == 200) {
      showSuccess(response.data.message)
      dataLab.value = response.data.response
      showPreviewLis.value = true
    } else {
      showSuccess(response.data.message)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const addKategori = (items) => {
  console.log(items)
  items.forEach((item) => {
    LoadHasilPemeriksaanlist.value.push({
      ID: item.ID,
      BARCODE: selectedItems.value.BARCODE,
      RECEIPT_NO: selectedItems.value.RECEIPT_NO,
      KATEGORI: item.KATEGORI,
      SUB_KATEGORI: item.SUB_KATEGORI,
      HASIL: '',
      HASIL_TIDAK_NORMAL: '0',
      KET_HASIL: '',
      KETERANGAN: '',
      KETERANGAN_REMARK: '',
      PEMERIKSAAN: item.ITEM,
      SATUAN: item.SATUAN,
      NORMAL: item.RUJUKAN,
    })
  })
  showTemplate.value = false
}

const simpanDataPemeriksaan = async () => {
  try {
    loading.value = true

    const payload = {
      id_client: id_client.value,
      items: LoadHasilPemeriksaanlist.value,
      noreceipt: route.params.noreceipt,
      user_id: user_id.value,
      catatan: catatan.value,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/simpan_detail_lab_v2/${id_client.value}`,
      payload,
    )

    if (response.data.metadata == 200) {
      showSuccess(response.data.metadata.message)
    } else {
      showSuccess(response.data.metadata.message)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showError(error.message)
  } finally {
    loading.value = false
  }
}

const filteredTemplate = computed(() => {
  const search = filters.value.global.value?.toLowerCase() || ''

  if (!search) return templateList.value

  return templateList.value.filter((item) => {
    return (
      (item.ITEM || '').toLowerCase().includes(search) ||
      (item.KATEGORI || '').toLowerCase().includes(search) ||
      (item.SATUAN || '').toLowerCase().includes(search) ||
      (item.RUJUKAN || '').toLowerCase().includes(search) ||
      (item.KODE_LOINC || '').toLowerCase().includes(search)
    )
  })
})

// FILTER STATE
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ITEM: { value: null, matchMode: FilterMatchMode.CONTAINS },
  SATUAN: { value: null, matchMode: FilterMatchMode.CONTAINS },
  RUJUKAN: { value: null, matchMode: FilterMatchMode.CONTAINS },
  KODE_LOINC: { value: null, matchMode: FilterMatchMode.CONTAINS },
  HASIL_NORMAL: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('id-ID')
}
const prinHasilLab = async () => {
  const routeData = router.resolve({
    name: 'PrintOutlabView',
    params: {
      noreceipt: route.params.noreceipt, // <-- ini benar
    },
  })

  window.open(routeData.href, '_blank')
}

const printPengantar = async () => {
  const routeData = router.resolve({
    name: 'PrintPengantarView',
    params: {
      noreceipt: route.params.noreceipt, // <-- ini benar
    },
  })

  window.open(routeData.href, '_blank')
}

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
    showError(error.message)
  } finally {
    loading.value = false
  }
}

const templateList = ref([])

const loadingTemplate = ref(false)

const panggilTemplate = async () => {
  showTemplate.value = true
  await getTemplatePemeriksaan()
  loadingTemplate.value = false
}

const sync_data_LIS = async () => {
  try {
    loading.value = true
    const payload = {
      noregister: '',
      no_receipt: route.params.noreceipt,
      norm: fact.value?.NOMR,
      no_pemeriksaan: no_laboratorium.value,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/get_hasil_lis`, payload)

    console.log(response.data)
    //templateList.value = response.data.response || []
    // loadingTemplate.value = false
    loading.value = false 
    if (response.data.metadata.code == 200) {
      showSuccess(response.data.metadata.message)
    } else {
      showWarning(response.data.message)
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const getTemplatePemeriksaan = async () => {
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/get_template_lab/${id_client.value}`,
    )
    templateList.value = response.data.response || []
    // loadingTemplate.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loadingTemplate.value = false
  }
}

const getItemPemeriksaanLab = async () => {
  try {
    loading.value = true

    const payload = {
      RECEIPT_NO: route.params.noreceipt,
      IDCLIENT: id_client.value,
      MODE: 'RCPT',
      TGLMIN: '',
      TGLMAX: '',
      MEMBERSHIP: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/bill`, payload)

    //itemPemeriksaan.value = response.data.response || []
    itemPemeriksaan.value = (response.data.response || []).filter(
      (item) => item.KATEGORI?.toUpperCase() === 'LABORATORIUM',
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    showError(error.message)
  } finally {
    loading.value = false
  }
}

const getListSpesimen = async () => {
  try {
    loading.value = true

    const payload = {
      receipts: [route.params.noreceipt],
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/get_spesimen`, payload)

    if (response.data.length === 0) {
      showWarning('Data spesimen tidak ditemukan')
      setTimeout(() => {
        window.close()
      }, 1000)
      return
    }

    await fetchData()
  } catch (error) {
    console.error('Error fetching data:', error)
    showError(error.message)
  } finally {
    loading.value = false
  }
}

const handleTTD = async (payload) => {
  // console.log('Username:', payload.username)
  // console.log('Password:', payload.password)
  // console.log('Verified:', payload.verified)

  const param = {
    id_client: id_client.value,
    id_otorisasi: payload.username,
    pin: payload.password,
    noreff: route.params.noreceipt,
    jenis_dok: 'LAB',
  }

  const url = configStore.apiBaseUrl
  const response = await axios.post(`${url}/index.php/api/data_referensi/lakukan_otorisasi`, param)
  console.log(response.data)
  if (response.data.metadata.code == 200) {
    showSuccess(response.data.metadata.message)
    CheckStatusOtorisasi()
  } else {
    showError(response.data.metadata.message)
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

const handleSelectItem = (item) => {
  console.log(item)
  selectedBarcode.value = item.BARCODE
  selectedItems.value = item
  LoadHasilPemeriksaan(item)
}

const LoadingHasil = ref(false)
const LoadHasilPemeriksaan = async (item) => {
  try {
    LoadingHasil.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/sales/get_detail_lab/${route.params.noreceipt}/${id_client.value}`,
    )

    LoadHasilPemeriksaanlist.value = []
    if (response.data.metadata.code == '200') {
      const filteredData = response.data.response.filter((x) => x.BARCODE === item.BARCODE)
      LoadHasilPemeriksaanlist.value = filteredData
    }
    LoadingHasil.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    LoadingHasil.value = false
    showError(error.message)
  }
}

// Function to check if result is abnormal
const isAbnormal = (data) => {
  if (!data.HASIL) return data.HASIL_TIDAK_NORMAL === '1'

  const hasil = parseFloat(data.HASIL)
  if (isNaN(hasil)) return data.HASIL_TIDAK_NORMAL === '1'

  const normal = data.NORMAL || ''

  // Handle range format like "4.0 - 11.0"
  if (normal.includes('-') && !normal.includes(':')) {
    const [min, max] = normal.split('-').map((v) => parseFloat(v.trim()))
    if (!isNaN(min) && !isNaN(max)) {
      return hasil < min || hasil > max
    }
  }

  // Handle multiple ranges like "P: 4.50-6.50 W: 4.10-5.10"
  if (normal.includes('P:') || normal.includes('W:')) {
    const ranges = normal.split(' ')
    for (let i = 0; i < ranges.length; i++) {
      if (ranges[i].includes('-')) {
        const [min, max] = ranges[i].split('-').map((v) => parseFloat(v.trim()))
        if (!isNaN(min) && !isNaN(max)) {
          if (hasil >= min && hasil <= max) return false
        }
      }
    }
    return true
  }

  return data.HASIL_TIDAK_NORMAL === '1'
}

// const sepesimenSelected = ref(null)
const SelectedSpesimen = async () => {
  try {
    loading.value = true
    const payload = {
      id_client: id_client.value,
      receipt_no: route.params.noreceipt,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/spesimen_selected`, payload)
    data.value = response.data
    console.log(response)

    loading.value = false
  } catch (error) {
    loading.value = false
    showError(error)
  }
}

onMounted(async () => {
  CheckStatusOtorisasi()
  getListSpesimen()
  getItemPemeriksaanLab()
  SelectedSpesimen()
})
</script>

<style scoped>
.items-container {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
  border-right: 1px solid #e0e0e0;
}

.items-container::-webkit-scrollbar {
  width: 6px;
}

.items-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.items-container::-webkit-scrollbar-thumb {
  background: #0095c8;
  border-radius: 10px;
}

.items-container::-webkit-scrollbar-thumb:hover {
  background: #007aa4;
}
.group-table td,
.group-table th {
  padding: 4px 8px !important; /* lebih kecil dari default */
  line-height: 1.2 !important; /* rapat */
}

.group-table .group-row td {
  background: #f7f7f7;
  font-weight: 600;
  padding: 6px 8px !important; /* group row sedikit lebih tinggi */
}
:deep(.p-datatable-sm .p-datatable-thead > tr > th) {
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr > td) {
  padding: 8px 10px;
  font-size: 13px;
}

:deep(.p-datatable-sm .p-datatable-tbody > tr:hover) {
  background-color: #f9f9f9;
}

.hasil-abnormal {
  font-weight: 600;
  color: #d32f2f;
}

.text-gray-600 {
  color: #666;
}

.text-gray-700 {
  color: #333;
}

.text-gray-400 {
  color: #999;
}

.font-semibold {
  font-weight: 600;
}

.status-column {
  display: flex;
  align-items: center;
}

.status-checkbox {
  cursor: pointer;
}

.ml-2 {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
}

.text-green-600 {
  color: #16a34a;
}

.text-red-600 {
  color: #dc2626;
}

.actions-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.w-full {
  width: 100%;
}

.mb-2 {
  margin-bottom: 8px;
}

.hasil-input {
  padding: 6px 8px;
  font-size: 13px;
}

:deep(.hasil-input.p-inputtext) {
  border: 1px solid #d0d0d0;
  border-radius: 3px;
}

:deep(.hasil-input.p-inputtext:focus) {
  border-color: #0095c8;
  box-shadow: 0 0 0 0.2rem rgba(0, 149, 200, 0.25);
}

:deep(.hasil-input.hasil-abnormal.p-inputtext) {
  color: #d32f2f;
  font-weight: 600;
  border-color: #d32f2f;
}

:deep(.hasil-input.hasil-normal.p-inputtext) {
  color: #000000;
  font-weight: 500;
  border-color: #d0d0d0;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #ddd;
}

table {
  border-collapse: collapse;
  width: 100%;
}

thead th {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 5;
  padding: 8px;
  border-bottom: 2px solid #ccc;
}

.group-row td {
  background: #e9ecef;
  font-weight: bold;
  position: sticky;
  top: 40px; /* posisi setelah header */
  z-index: 4;
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
