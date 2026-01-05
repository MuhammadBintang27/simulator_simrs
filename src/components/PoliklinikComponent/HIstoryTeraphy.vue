<template>
  <Dialog
    v-model:visible="showHistoryTeraphy"
    modal
    :header="`Riwayat`"
    :style="{ width: '1200px' }"
    class="patient-detail-dialog"
    :closable="true"
    striped-rows
  >
    <div>
      <div class="row">
        <div class="col-md-3">
          <div class="card-list">
            <div v-for="(item, index) in headerRiwayat" :key="item.id" class="doctor-card">
              <div class="card-header">
                <i class="pi pi-check-circle text-green-500"></i>
                <strong>{{ item.DPJP }}</strong>
              </div>

              <div class="card-body">
                <div>
                  Jenis R : <span class="font-medium">{{ item.JENISRAWAT }}</span>
                </div>
                <div>
                  Waktu : <span class="font-medium">{{ formatDateTime(item.TANGGAL) }}</span>
                </div>
                <div>
                  Rawat : <span class="font-medium">{{ item.JENISRAWAT }}</span>
                </div>
                <div class="mt-2">
                  <Tag :value="timeAgo(item.TANGGAL)" severity="danger" class="text-xs" />
                </div>
                <div class="mt-2" v-if="item.OBAT_OBATAN == 1">
                  <div class="text-xs">Obat-obatan</div>
                </div>
              </div>

              <div class="card-footer">
                <i
                  :class="
                    loadingRow === item.RECEIPT_NO
                      ? 'pi pi-spin pi-spinner text-blue-500'
                      : 'pi pi-search cursor-pointer'
                  "
                  @click="getdetail_sales(item.RECEIPT_NO)"
                >
                </i>
                <i class="pi pi-copy cursor-pointer" @click="sendHistori()"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-9">
          <h6>No Resep : {{ NO_RECEIPT }}</h6>
          <DataTable
            :value="detils_obat"
            :paginator="false"
            :scrollable="true"
            scrollHeight="400px"
            tableStyle="min-width: 50rem"
            class="p-datatable-sm"
            :rowHover="true"
            :showGridlines="true"
            striped-rows
          >
            <!-- Header with search -->

            <!-- Empty state -->
            <template #empty>
              <div class="text-center p-4">
                <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
                <p class="text-gray-600 m-0">Tidak ada data obat yang tersedia</p>
              </div>
            </template>

            <!-- Loading template -->
            <template #loading>
              <div class="text-center p-4">
                <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
                <p class="mt-2 text-gray-600">Memuat data...</p>
              </div>
            </template>

            <!-- Columns -->
            <Column
              field="BARCODE"
              header="BARCODE"
              :sortable="true"
              :showFilterMenuOptions="false"
              :showFilterOperator="false"
              :showClearButton="false"
              style="min-width: 200px"
            >
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  <Tag :value="slotProps.data.BARCODE" class="text-xs" />
                </div>
              </template>
            </Column>
            <Column
              field="NAMABARANG_REQ"
              header="ITEM REQ"
              :sortable="true"
              :showFilterMenuOptions="false"
              :showFilterOperator="false"
            >
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  {{ slotProps.data.NAMABARANG_REQ }}
                </div>
              </template>
            </Column>
            <Column
              field="NAMABARANG"
              header="ITEM APPROVED"
              :sortable="true"
              :showFilterMenuOptions="false"
              :showFilterOperator="false"
              :showClearButton="false"
            >
              <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                  {{ slotProps.data.NAMABARANG }}
                </div>
              </template>
            </Column>
            <Column field="REMARK_ITEM" header="DOSIS" :sortable="true"></Column>
            <Column
              field="NAMABARANG"
              header="QTY REQ"
              :sortable="true"
              :showFilterMenuOptions="false"
              :showFilterOperator="false"
              :showClearButton="false"
            >
              <template #body="slotProps">
                <div class="flex align-items-center">
                  {{ slotProps.data.QTY_REQ }}
                </div>
              </template>
            </Column>
            <Column
              field="QTY"
              header="QTY APPROVED"
              :showFilterMenuOptions="false"
              :showFilterOperator="false"
              :showClearButton="false"
            >
              <template #body="slotProps">
                <div class="flex align-items-center gap-2" v-if="slotProps.data.QTY > 0">
                  <Tag :value="slotProps.data.QTY" class="text-sx" style="width: 5em" />
                </div>
                <div class="flex align-items-center gap-2" v-else>
                  <Tag
                    :value="slotProps.data.QTY"
                    severity="warn"
                    class="text-sx"
                    style="width: 5em"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="QTY_COPY"
              header="QTY COPY"
              :sortable="true"
              :showFilterMenuOptions="false"
              :showFilterOperator="false"
              :showClearButton="false"
              style="min-width: 200px"
            >
              <template #body="slotProps">
                <div class="flex align-items-center gap-2" v-if="slotProps.data.QTY_COPY > 0">
                  <Tag :value="slotProps.data.QTY_COPY" class="text-sx" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useRoute } from 'vue-router'
const route = useRoute()

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const loadingRow = ref(null)

const props = defineProps({
  showHistoryTeraphy: {
    type: Boolean,
    default: false,
  },
})

const timeAgo = (datetime) => {
  const now = new Date()
  const past = new Date(datetime)
  const diffMs = now - past
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return 'Hari ini'
  } else if (diffDays === 1) {
    return '1 hari yang lalu'
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} minggu yang lalu`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} bulan yang lalu`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} tahun yang lalu`
  }
}

const headerRiwayat = ref([])

const emit = defineEmits(['update:showHistoryTeraphy', 'sendData'])
const showHistoryTeraphy = computed({
  get: () => props.showHistoryTeraphy,
  set: (value) => emit('update:showHistoryTeraphy', value),
})

const sendHistori = async () => {
  emit('sendData', detils_obat)
  showHistoryTeraphy.value = false
}

watch(showHistoryTeraphy, async (newValue) => {
  if (newValue == true) {
    await getRiwayat()
  }
})

// API functions
const getRiwayat = async () => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/sales/riwayat_pemberian_obat/${id_client.value}/${route.query.nomr}`,
    )

    console.log('load riwayat terapi')

    if (response.data?.metadata?.code == 200) {
      headerRiwayat.value = response.data.response || []
    } else {
      headerRiwayat.value = []
      //showWarning('Tidak ada data obat ditemukan')
    }
  } catch (error) {
    console.error('Error searching riwayat:', error)
    headerRiwayat.value = []
    showError('Gagal mencari data obat')
  } finally {
    loading.value = false
  }
}

const detils_obat = ref([])

const NO_RECEIPT = ref(null)

const getdetail_sales = async (no_receipt) => {
  loading.value = true
  loadingRow.value = no_receipt // aktifkan spinner untuk row ini
  NO_RECEIPT.value = no_receipt // aktifkan spinner untuk row ini
  try {
    const param = {
      RECEIPT_NO: no_receipt,
      MODE: 'RCPT',
      IDCLIENT: id_client.value,
      TGLMIN: '',
      TGLMAX: '',
      MEMBERSHIP: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/billv2`, param)
    console.log(response.data)
    detils_obat.value = response.data.response
    if (response.data.response) {
      detils_obat.value = response.data.response || []
    }

    loading.value = false
    loadingRow.value = null // matikan spinner setelah selesai
  } catch (error) {
    loadingRow.value = null // matikan spinner setelah selesai
    console.error(error)
  } finally {
    loading.value = false
    loadingRow.value = null // matikan spinner setelah selesai
  }
}

// Format datetime for better display
const formatDateTime = (datetime) => {
  const date = new Date(datetime)
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
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

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

// Handle search action

onMounted(() => {
  // getRiwayat()
})
</script>

<style scoped>
.card-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 60vh; /* Limit height to 70% of viewport */
  overflow-y: auto;
  padding-right: 0rem; /* Add space for scrollbar */
}

/* Custom scrollbar styling */
.card-list::-webkit-scrollbar {
  width: 6px;
}

.card-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.card-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.card-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.doctor-card {
  border: 1px solid #dce7f3;
  border-left: 4px solid #3b82f6; /* blue accent */
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.8rem;
  background: #f9fdfb;
  position: relative;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.doctor-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.card-body {
  color: #374151;
  line-height: 1;
  margin-bottom: 0rem; /* Add space for footer */
}

.card-body > div {
  margin-bottom: 0.15rem;
}

.card-footer {
  position: absolute;
  right: 0.5rem;
  bottom: 0.3rem;
  display: flex;
  gap: 0.5rem;
  color: #4b5563;
}

.card-footer i {
  transition:
    color 0.2s ease,
    transform 0.2s ease;
  padding: 0.15rem;
  font-size: 0.8rem;
}

.card-footer i:hover {
  color: #2563eb;
  transform: scale(1.1);
}

.font-medium {
  font-weight: 500;
}

.text-green-500 {
  color: #10b981;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
