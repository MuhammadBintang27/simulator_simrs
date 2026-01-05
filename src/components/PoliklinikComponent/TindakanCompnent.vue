<template>
  <Toast />
  <Panel style="padding: 0; margin: 0">
    <template #header>
      <div class="flex justify-end">
        <Button
          class="p-button-success"
          icon="pi pi-plus"
          label="Tambah Prsedur"
          size="small"
          @click="handleAddProcedure"
          :disabled="!canAddProcedure"
          :loading="loadingAddTindakan"
        />
      </div>
    </template>
    <!-- Add Procedure Button -->

    <!-- Procedure Selection -->
    <div class="row">
      <div class="col-md-5">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pilih Procedure <span>({{ availableProcedures.length }} ditemukan)</span>
        </label>

        <Select
          v-model="selectedProcedure"
          :options="availableProcedures"
          filter
          optionLabel="CAPTION"
          placeholder="Choose a procedure..."
          class="mt-0"
          :loading="loadingProcedures"
          style="width: 100%"
          chi
          @filter="searchProcedures"
          :filterFields="['CAPTION', 'KATEGORI']"
        >
          <template #option="slotProps">
            <div class="flex flex-col gap-1 py-2">
              <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {{ slotProps.option.CAPTION }}
              </div>
              <div class="flex items-center justify-between">
                <Tag
                  severity="success"
                  :value="slotProps.option.KATEGORI"
                  class="text-xs px-2 py-1 rounded-full"
                  style="font-size: 10px; font-weight: 500"
                />
                <span class="text-xs text-gray-500" v-if="slotProps.option.HARGA_JUAL_JASA">
                  {{ formatCurrency(slotProps.option.HARGA_JUAL_JASA) }}
                </span>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="text-center py-4 text-gray-500">
              {{
                searchQuery.length < 2
                  ? 'Ketik minimal 2 karakter untuk pencarian'
                  : 'No procedures found'
              }}
            </div>
          </template>
        </Select>
      </div>

      <div class="col-md-6">
        <!-- Description Textarea -->
        <div class="mt-0">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <Textarea
            v-model="procedureDescription"
            placeholder="Enter procedure description..."
            rows="3"
            style="width: 100%; font-size: 14px"
            :disabled="!selectedProcedure"
            :class="{ 'p-invalid': showValidationErrors && !procedureDescription.trim() }"
          />
          <small v-if="showValidationErrors && !procedureDescription.trim()" class="p-error">
            Description is required
          </small>
        </div>
      </div>
      <div class="col-md-1">
        <div class="mt-0">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jumlah *
          </label>
          <InputNumber
            v-model="QuantityTIndakan"
            inputId="minmax-buttons"
            mode="decimal"
            showButtons
            :min="1"
            :max="100"
            fluid
          />
        </div>
      </div>
    </div>

    <!-- Added Procedures List -->
    <div v-if="procedureList.length > 0" class="mt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Procedur Dilakukan ({{ procedureList.length }})
        </h4>
        <Button
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="refreshProcedureList"
          :loading="loadingRefresh"
          v-tooltip.top="'Refresh list'"
        />
      </div>

      <div class="space-y-2">
        <div
          v-for="(procedure, index) in procedureList"
          :key="`procedure-${index}`"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 transition-all duration-200"
        >
          <div class="flex justify-between items-start gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <div class="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {{ procedure.tindakan.CAPTION || procedure.tindakan }}
                </div>
                <Tag
                  v-if="procedure.tindakan.KATEGORI"
                  severity="success"
                  :value="procedure.tindakan.KATEGORI"
                  class="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style="font-size: 8px; font-weight: 500"
                />
              </div>

              <div class="space-y-2">
                <Textarea
                  v-model="procedure.description"
                  placeholder="Enter procedure description..."
                  rows="2"
                  :autoResize="true"
                  style="font-size: 14px; width: 100%"
                  :disabled="procedure.isUpdating"
                />

                <div class="flex gap-2 flex-wrap">
                  <Button
                    class="p-button-success p-button-sm"
                    icon="pi pi-pencil"
                    label="Update"
                    size="small"
                    text
                    @click="updateProcedureDescription(index)"
                    :disabled="!procedure.description?.trim() || procedure.isUpdating"
                    :loading="procedure.isUpdating"
                  />
                  <Button
                    class="p-button-info p-button-sm"
                    icon="pi pi-lock"
                    label="Tandatangan"
                    size="small"
                    text
                    @click="signProcedure(index)"
                    :disabled="procedure.isSigned || procedure.isUpdating"
                  />
                  <Tag
                    v-if="procedure.isSigned"
                    severity="info"
                    :value="`Signed by ${procedure.AUTH_BY}`"
                    class="text-xs"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <Button
                icon="pi pi-trash"
                class="p-button-danger p-button-text p-button-sm"
                @click="confirmRemoveProcedure(index)"
                v-tooltip.left="'Remove procedure'"
                :disabled="procedure.isRemoving"
              />
              <small v-if="procedure.timestamp" class="text-xs text-gray-500">
                {{ formatTimestamp(procedure.timestamp) }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="mt-8 text-center py-8 text-gray-500">
      <i class="pi pi-medical text-4xl mb-3 opacity-50"></i>
      <p>No procedures added yet</p>
      <small>Select a procedure and add a description to get started</small>
    </div>
  </Panel>

  <ttdUser
    v-model:showFormOtorisasi="showDialog"
    :noregister="receipt_no"
    :mode="8"
    @otpVerified="handleOtpSuccess"
  />

  <!-- Confirmation Dialog -->
  <ConfirmDialog />
</template>

<script setup>
import { ref, computed, onMounted, unref, toRaw, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'

import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import axios from 'axios'

import ttdUser from '@/components/TtdDigitalComponent.vue'

// Stores and composables
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()
const route = useRoute()
const { id_client, user_id, id_lokasi } = storeToRefs(authStore)

const showDialog = ref(false)

// Props
const props = defineProps({
  datapasien: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object',
  },
})

const loadingPertindakan = ref(false)

// Reactive state
const selectedProcedure = ref(null)
const procedureDescription = ref('-')
const procedureList = ref([])
const availableProcedures = ref([])
const searchQuery = ref('')

const receipt_no = ref('')

const QuantityTIndakan = ref(1)

// Loading states
const loadingAddTindakan = ref(false)
const loadingProcedures = ref(false)
const loadingRefresh = ref(false)
const showValidationErrors = ref(false)

// Computed properties
const canAddProcedure = computed(() => {
  return selectedProcedure.value && procedureDescription.value.trim() && !loadingAddTindakan.value
})

// Utility functions
const formatDate = (date = new Date()) => {
  const pad = (num) => String(num).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Toast notifications
const showSuccess = (message = 'Operation completed successfully!') => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: message,
    life: 3000,
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

// API functions
const searchProcedures = async (event) => {
  try {
    const query = event.value
    searchQuery.value = query

    if (!query || query.length < 2) {
      availableProcedures.value = []
      return
    }

    const param = {
      barcode: '',
      mode: 17,
      id_client: id_client.value,
      breakdown: 0,
      nama: query,
      lokasi: id_lokasi.value,
    }

    console.log(param)

    loadingProcedures.value = true
    const url = configStore.apiApotikUrl

    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    if (response.data?.response) {
      availableProcedures.value = response.data.response
    } else {
      availableProcedures.value = []
    }
  } catch (error) {
    console.error('Error searching procedures:', error)
    showError('Failed to search procedures')
    availableProcedures.value = []
  } finally {
    loadingProcedures.value = false
  }
}

const handleAddProcedure = async () => {
  showValidationErrors.value = true

  if (!canAddProcedure.value) {
    showWarning('Please select a procedure and enter a description')
    return
  }

  // Check for duplicate procedures
  const exists = procedureList.value.some((item) => {
    const existingCaption = item.tindakan?.CAPTION || item.tindakan
    const newCaption = selectedProcedure.value.CAPTION
    return existingCaption === newCaption
  })

  if (exists) {
    showError('This procedure has already been added')
    return
  }

  await addProcedure()
}

const addProcedure = async () => {
  try {
    const tindakan = unref(selectedProcedure)
    const pasien = toRaw(unref(props.datapasien))
    const desc = unref(procedureDescription)
    const quantityTindakan = unref(QuantityTIndakan)

    const param = {
      metadata: 'request',
      header: {
        MODE: 'REG',
        RECEIPT_NO: '',
        SALESNO: '0',
        JML_RACIK: 0,
        BENTUK_RACIK: '',
        NOTE: '-',
        TAXAMOUNT: 0,
        TOTALBAYAR: 0,
        POTONGAN: 0,
        TAXPERCENT: 0,
        SUBTOTAL: 0,
        KEMBALIAN: 0,
        RESV_ID: 0,
        SERVER_NAME: '-',
        NO_REGISTER: pasien.NOPENDAFTARAN,
        MEMBERSHIP_ID: pasien.NOMR,
        IDPAYEMENT: 0,
        IDCLIENT: id_client.value,
        ID_LOKASI: tindakan.ID_LOKASI,
        POLI_RUANG: pasien.POLI,
        DPJP: pasien.NAMADOKTER,
        TANGGAL: formatDate(),
        IDUSER: user_id.value,
        STATUS_PROGRESS: 'C',
        TGL_SELESAI: formatDate(),
        OBAT_OBATAN: 4,
        SERVER_ID: '',
        details: [
          {
            BARCODE: tindakan.BARCODE,
            ID_BARANG: tindakan.IDBARANG,
            NAMA: tindakan.NAMA,
            MEREK: '',
            AS_PARENT: 1,
            ITEMSEQNO: 0,
            HARGA: tindakan.HARGA_JUAL_JASA,
            SATUAN: tindakan.SATUAN,
            DISCOUNT: 0,
            REMARK_ITEM: desc,
            POTONGSTOCK: 0,
            TANGGAL_TRANS: formatDate(),
            FLAG: 'NEW LINE',
            TOTALAMOUNT: 0,
            STATUS_PROGRESS: 'C',
            SUBITEMSEQNO: 0,
            ID_LOKASI: tindakan.ID_LOKASI,
            JENIS: 'TINDAKAN',
            NOTE: '',
            QTY: quantityTindakan,
          },
        ],
      },
    }

    loadingAddTindakan.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/insert_sales_v2`, param, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.data?.metadata?.code == 200) {
      showSuccess('Procedure added successfully!')

      // Reset form
      selectedProcedure.value = null
      procedureDescription.value = '-'
      QuantityTIndakan.value = 1
      showValidationErrors.value = false

      // Refresh the procedure list
      await loadProcedureHistory()
    } else {
      throw new Error(response.data?.metadata?.message || 'Failed to add procedure')
    }
  } catch (error) {
    console.error('Error adding procedure:', error)
    showError(error.message || 'Failed to add procedure')
  } finally {
    loadingAddTindakan.value = false
  }
}

const loadProcedureHistory = async () => {
  try {
    const param = {
      id_client: id_client.value,
      mode: 1,
      noregister: route.query.noreg,
    }
    loadingRefresh.value = true

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/get_laporan_tindakan`, param, {
      headers: { 'Content-Type': 'application/json' },
    })
    loadingRefresh.value = false

    if (response.data?.metadata?.code == '200') {
      procedureList.value = response.data.response.map((item, index) => ({
        id: `proc-${Date.now()}-${index}`,
        tindakan: {
          CAPTION: item.TINDAKAN,
          KATEGORI: item.KATEGORI || 'Medical',
        },
        no_receipt: item.RECEIPT_NO,
        description: item.REMARK_ITEM || '',
        timestamp: item.TANGGAL_TRANS || formatDate(),
        isSigned: item.AUTH == 1 ? true : false,
        AUTH_BY: item.AUTH_BY,
        isUpdating: false,
        isRemoving: false,
      }))
    } else {
      procedureList.value = []
    }
  } catch (error) {
    console.error('Error loading procedure history:', error)
    showError('Failed to load procedure history')
  }
}

const updateProcedureDescription = async (index) => {
  const procedure = procedureList.value[index]
  if (!procedure.description?.trim()) {
    showWarning('Please enter a description before updating')
    return
  }

  try {
    procedure.isUpdating = true
    // Simulate API call - replace with actual update API

    const param = {
      id_client: id_client.value,
      no_receipt: procedure.no_receipt,
      noregister: route.query.noreg,
      remark_item: procedure.description,
    }

    loadingRefresh.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/updateItemTindakan`, param, {
      headers: { 'Content-Type': 'application/json' },
    })

    console.log(response.data?.metadata)

    if (response.data?.metadata?.code == '200') {
      showSuccess(`successfully`)
    } else {
      showError(response.data?.metadata.message)
    }
  } catch (error) {
    console.error('Error updating procedure:', error)
    showError('Failed to update procedure description')
  } finally {
    procedure.isUpdating = false
  }
}

const handleOtpSuccess = (data) => {
  if (data?.verified == true) {
    loadProcedureHistory()
  }
}

const signProcedure = async (index) => {
  const procedure = procedureList.value[index]

  try {
    // Simulate API call for removal

    // Simulate signing process

    receipt_no.value = procedure.no_receipt
    showDialog.value = true
  } catch (error) {
    console.error('Error signing procedure:', error)
    showError('Failed to sign procedure')
  }
}

const confirmRemoveProcedure = (index) => {
  const procedure = procedureList.value[index]
  const procedureName = procedure.tindakan?.CAPTION || procedure.tindakan || 'this procedure'

  confirm.require({
    message: `Anda ingin menghapus procedur "${procedureName}"?`,
    header: 'Konfirm hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => removeProcedure(index),
  })
}

const removeProcedure = async (index) => {
  const procedure = procedureList.value[index]
  const procedureName = procedure.tindakan?.CAPTION || procedure.tindakan || 'procedure'

  try {
    procedure.isRemoving = true
    // Simulate API call for removal

    const param = {
      id_client: id_client.value,
      no_receipt: procedure.no_receipt,
    }

    loadingRefresh.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/voidtindakan`, param, {
      headers: { 'Content-Type': 'application/json' },
    })

    loadingRefresh.value = false

    if (response.data?.metadata?.code == '200') {
      procedureList.value.splice(index, 1)
      showSuccess(`"${procedureName}" removed successfully`)
    } else {
      showError(response.data?.metadata.message)
    }
  } catch (error) {
    console.error('Error removing procedure:', error)
    showError('Failed to remove procedure')
    procedure.isRemoving = false
  }
}

const refreshProcedureList = async () => {
  loadingRefresh.value = true
  try {
    await loadProcedureHistory()
    showSuccess('Procedure list refreshed')
  } catch (error) {
    showError('Failed to refresh procedure list')
  } finally {
    loadingRefresh.value = false
  }
}

// Watch for prop changes
watch(
  () => props.datapasien,
  (newValue) => {
    if (newValue?.NOPENDAFTARAN) {
      loadProcedureHistory()
    }
  },
  { deep: true },
)

// Expose methods for parent component
defineExpose({
  procedureList,
  refreshProcedureList,
  clearProcedures: () => {
    procedureList.value = []
    selectedProcedure.value = null
    procedureDescription.value = ''
    showValidationErrors.value = false
  },
})

// Lifecycle
onMounted(async () => {
  if (props.datapasien?.NOPENDAFTARAN) {
    await loadProcedureHistory()
  }
})
</script>

<style scoped>
.p-invalid {
  border-color: #e24c4c !important;
}

.p-error {
  color: #e24c4c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.min-w-0 {
  min-width: 0;
}
</style>
