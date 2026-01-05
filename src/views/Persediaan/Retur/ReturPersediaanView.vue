<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <div class="content">
    <div class="card elevation-0">
      <div class="card-header">
        <h4><i class="fas fa-file-invoice-dollar mr-2"></i> Retur Persediaan ke Supplier</h4>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <div class="group-form">
              <label for="jenisRetur">Jenis Retur</label>
              <Select
                v-model="JenisReturSelected"
                :options="jenisRetur"
                optionLabel="caption"
                optionValue="value"
                placeholder="Pilih Jenis Retur"
                style="width: 100%"
              >
                <!-- Dropdown option -->
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <i
                      class="fa-solid mr-2"
                      :class="[slotProps.option.icon, slotProps.option.color]"
                    ></i>
                    <span>{{ slotProps.option.caption }}</span>
                  </div>
                </template>

                <!-- Selected value -->
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex align-items-center gap-2">
                    <i
                      class="fa-solid mr-2"
                      :class="[
                        jenisRetur.find((j) => j.value === slotProps.value)?.icon,
                        jenisRetur.find((j) => j.value === slotProps.value)?.color,
                      ]"
                    ></i>
                    <span>
                      {{ jenisRetur.find((j) => j.value === slotProps.value)?.caption }}
                    </span>
                  </div>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
              </Select>
            </div>
          </div>
          <div class="col-md-4" v-if="JenisReturSelected === 'B'">
            <div class="group-form">
              <label for="exampleInputEmail1">Pilih Lokasi/DEPO</label>
              <Select
                v-model="supplierSelected"
                :options="jenisRetur"
                optionLabel="caption"
                optionValue="value"
                placeholder="Pilih Jenis Retur"
                style="width: 100%"
              >
                <!-- Dropdown option -->
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <i
                      class="fa-solid mr-2"
                      :class="[slotProps.option.icon, slotProps.option.color]"
                    ></i>
                    <span>{{ slotProps.option.caption }}</span>
                  </div>
                </template>

                <!-- Selected value -->
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex align-items-center gap-2">
                    <i
                      class="fa-solid mr-2"
                      :class="[
                        jenisRetur.find((j) => j.value === slotProps.value)?.icon,
                        jenisRetur.find((j) => j.value === slotProps.value)?.color,
                      ]"
                    ></i>
                    <span>
                      {{ jenisRetur.find((j) => j.value === slotProps.value)?.caption }}
                    </span>
                  </div>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
              </Select>
            </div>
          </div>
          <div class="col-md-4" v-if="JenisReturSelected === 'A'">
            <div class="group-form">
              <label for="exampleInputEmail1">Pilih Supplier Tujuan Retur</label>
              <Select
                v-model="supplierSelected"
                :options="list_supplier"
                filter
                clearable
                optionLabel="NAMASUPLIER"
                placeholder="Pilih Jenis Retur"
                style="width: 80%"
              />
              <!-- Dropdown option -->
              <Button
                label=""
                icon="pi pi-refresh"
                class="round-button2 ml-1"
                @click="get_item_by_supplier"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-7">
        <div class="card elevation-0">
          <div class="card-header">
            <h6><i class="fas fa-boxes mr-2"></i> Daftar Barang Retur</h6>
          </div>
          <div class="card-body">
            <DataTable
              :value="barangList"
              paginator
              :rows="10"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
              v-model:filters="filters"
              :globalFilterFields="['NAMA', 'BARCODE', 'SUB_BARCODE', 'BATCH_NUMBER']"
              class="datatable-fixed-height"
              scrollable
              scrollHeight="500px"
            >
              <!-- Global Filter -->
              <template #header>
                <div class="flex align-items-center justify-content-between">
                  <span class="p-input-icon-left w-full">
                    <InputText v-model="filters['global'].value" placeholder="Cari barang..." />
                    <i class="pi pi-search ml-3"></i>
                  </span>
                </div>
              </template>

              <!-- BARCODE -->
              <Column field="BARCODE" header="Barcode" sortable filterable>
                <template #body="{ data }">
                  <h6>
                    {{ data.NAMA }}
                  </h6>
                  {{ data.BARCODE }} - {{ data.SUB_BARCODE }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    @input="filterCallback()"
                    placeholder="Cari barcode..."
                  />
                </template>
              </Column>

              <!-- BATCH -->
              <Column field="BATCH_NUMBER" header="Batch" sortable filterable>
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    type="text"
                    @input="filterCallback()"
                    placeholder="Cari batch..."
                  />
                </template>
              </Column>

              <!-- EXPIRED -->
              <Column field="TGL_EXPIRED" header="Expired" sortable>
                <template #body="{ data }">
                  {{ formatDate(data.TGL_EXPIRED) }}
                </template>
              </Column>

              <!-- HARGA BELI -->
              <Column field="HARGABELI" header="Harga Beli" class="text-right" sortable>
                <template #body="{ data }">
                  {{ formatCurrency(data.HARGABELI) }}
                </template>
              </Column>

              <!-- QUANTITY -->
              <Column field="QUANTITY" header="Qty" class="text-right" sortable>
                <template #body="{ data }">
                  {{ data.QUANTITY.toLocaleString() }}
                </template>
              </Column>

              <!-- AKSI -->
              <Column header="Aksi" class="text-center" style="width: 80px">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-plus"
                    class="p-button-rounded p-button-success p-button-sm round-button"
                    @click="addItemToRetur(data)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>

      <div class="col-md-5">
        <div class="card elevation-0">
          <div class="card-header">
            <h6><i class="fas fa-boxes mr-2"></i> Daftar Telah Dipilih</h6>
          </div>

          <div class="card-body">
            <DataTable
              :value="barangReturList"
              paginator
              :rows="10"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
              class="datatable-fixed-height"
              scrollable
              scrollHeight="600px"
            >
              <!-- Global Filter -->

              <Column field="BARCODE" header="Barcode" sortable filterable>
                <template #body="{ data }">
                  <h6>
                    {{ data.NAMA }}
                  </h6>
                  {{ data.BARCODE }} - {{ data.SUB_BARCODE }} #BTCH-<strong>
                    {{ data.BATCH_NUMBER }}</strong
                  >
                </template>
              </Column>
              <!-- QUANTITY -->
              <Column field="HARGABELI" header="Harga Beli" class="text-right" sortable>
                <template #body="{ data }">
                  {{ formatCurrency(data.HARGABELI) }}
                </template>
              </Column>
              <Column field="QUANTITY" header="JLM RETUR" class="text-center" sortable>
                <template #body="{ data }">
                  {{ data.QTY_RETUR.toLocaleString() }}
                </template>
              </Column>

              <Column header="Aksi" class="text-center" style="width: 80px">
                <template #body="{ data, index }">
                  <Button
                    text
                    icon="pi pi-trash"
                    @click="removeBarangRetur(index)"
                    class="p-button-rounded p-button-danger p-button-sm round-button"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card elevation-0">
          <div class="card-body">
            <Button
              label="Simpan Retur Persediaan"
              icon="pi pi-save"
              class="p-button-success round-button2"
              @click="showFinishModal = true"
            />
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card elevation-0">
          <div class="card-body text-right">
            <h5>
              Total Retur :
              <span class="font-weight-bold">{{
                barangReturList
                  .reduce((total, item) => total + item.QTY_RETUR * item.HARGABELI, 0)
                  .toLocaleString()
              }}</span>
            </h5>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Drawer
    v-model:visible="showAddQtyDrawer"
    header="Tambah Jumlah Retur"
    position="bottom"
    style="height: auto"
  >
    <div class="drawer-content">
      <div class="item-container">
        <!-- Item Card -->
        <div class="item-card">
          <div class="item-header mb-4">
            <h5 class="item-name">{{ itemSelected?.NAMA }}</h5>
            <p class="item-barcode">
              {{ itemSelected?.BARCODE }} - {{ itemSelected?.SUB_BARCODE }}
            </p>
          </div>

          <!-- Item Details Grid -->
          <div class="details-grid mb-4">
            <div class="detail-item">
              <span class="detail-label">Batch Number</span>
              <span class="detail-value">{{ itemSelected?.BATCH_NUMBER || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tanggal Expired</span>
              <span class="detail-value">{{ formatDate(itemSelected?.TGL_EXPIRED) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Harga Beli</span>
              <span class="detail-value">{{ formatCurrency(itemSelected?.HARGABELI) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Stok Tersedia</span>
              <span class="detail-value text-success">{{
                itemSelected?.QUANTITY?.toLocaleString() || 0
              }}</span>
            </div>
          </div>

          <!-- Quantity Input Section -->
          <div class="quantity-section">
            <label for="qtyRetur" class="quantity-label">Jumlah Retur</label>
            <div class="quantity-input-group">
              <InputNumber
                v-model="qtyRetur"
                :min="1"
                :max="itemSelected?.QUANTITY || 1"
                class="quantity-input"
                @input="validateQty"
              />
            </div>
            <small class="text-muted"
              >Maksimal: {{ itemSelected?.QUANTITY?.toLocaleString() || 0 }}</small
            >
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons mt-5">
            <Button
              label="Tambahkan ke Retur"
              icon="pi pi-plus"
              class="p-button-success w-full"
              @click="addToReturList"
            />
          </div>
        </div>
      </div>
    </div>
  </Drawer>

  <Dialog
    v-model:visible="showFinishModal"
    modal
    :closable="false"
    :showHeader="false"
    class="dialog-retur-finish"
    :style="{ width: '100%', maxWidth: '500px' }"
  >
    <div class="dialog-content">
      <!-- Success Icon -->
      <div class="icon-container">
        <i class="pi pi-check-circle"></i>
      </div>

      <!-- Title -->
      <h5 class="dialog-title">Simpan Retur Persediaan?</h5>

      <!-- Description -->
      <p class="dialog-description">Apakah Anda yakin ingin menyimpan retur persediaan ini?</p>

      <!-- Summary Section -->
      <div class="summary-box">
        <div class="summary-item">
          <span class="summary-label">Total Item:</span>
          <span class="summary-value">{{ barangReturList.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Qty:</span>
          <span class="summary-value">{{ getTotalQty() }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Nilai:</span>
          <span class="summary-value">{{ getTotalAmount() }}</span>
        </div>
      </div>

      <!-- Alasan Retur Textarea -->
      <div class="form-group">
        <label for="alasan" class="form-label">Alasan Retur</label>
        <Textarea
          id="alasan"
          v-model="alasan_retur"
          placeholder="Masukkan alasan retur (opsional)"
          :rows="4"
          class="w-full"
          autoResize
        />
      </div>

      <!-- Action Buttons -->
      <div class="button-container">
        <Button
          label="Batal"
          icon="pi pi-times"
          class="p-button-outlined p-button-secondary w-full"
          @click="showFinishModal = false"
        />
        <Button
          label="Simpan Retur"
          icon="pi pi-check"
          class="p-button-success w-full"
          @click="tambahkan_Ke_retur()"
        />
      </div>
    </div>
  </Dialog>
  <Toast />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import Drawer from 'primevue/drawer'

const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id, id_lokasi } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const showAddQtyDrawer = ref(false)
const qtyRetur = ref(1)

const itemSelected = ref(null)

const showFinishModal = ref(false)

const barangReturList = ref([])
const addItemToRetur = (barang) => {
  itemSelected.value = barang
  showAddQtyDrawer.value = true
}

const alasan_retur = ref('')

const tambahkan_Ke_retur = async () => {
  try {
    loading.value = true

    if (barangReturList.value.length === 0) {
      showWarning('Daftar retur masih kosong')
      loading.value = false
      return
    }

    const payload = {
      id_client: id_client.value,
      user_id: user_id.value,
      id_lokasi: id_lokasi.value,
      jenis_retur: JenisReturSelected.value,
      alasan_retur: alasan_retur.value || '',
      id_supplier: supplierSelected.value?.IDSUPLIER || null,
      details: barangReturList.value.map((item) => ({
        barcode: item.IDBARANG,
        sub_barcode: item.SUB_BARCODE,
        batch_number: item.BATCH_NUMBER,
        qty_retur: item.QTY_RETUR,
        harga_beli: item.HARGABELI,
      })),
    }
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/retur/simpan_data_retur`, payload)

    if (response.data.code === 200) {
      showSuccess('Retur persediaan berhasil disimpan')
      // Clear the retur list
      barangReturList.value = []
      showFinishModal.value = false
    } else {
      showError(response.data.message)
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const removeBarangRetur = (index) => {
  const itemName = barangReturList.value[index]?.NAMA
  barangReturList.value.splice(index, 1)
  showSuccess(`${itemName} berhasil dihapus dari retur`)
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  BARCODE: { value: null, matchMode: FilterMatchMode.CONTAINS },
  BATCH_NUMBER: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const jenisRetur = ref([
  { caption: 'Retur Ke Supplier', value: 'A', icon: 'fa-truck-arrow-right', color: 'text-red-600' },
  { caption: 'Retru Ke Depo/Gudang', value: 'B', icon: 'fa-warehouse', color: 'text-green-600' },
])

const supplierSelected = ref(null)

const JenisReturSelected = ref(null)

const formatCurrency = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const validateQty = () => {
  const maxQty = itemSelected.value?.QUANTITY || 1
  if (qtyRetur.value > maxQty) {
    qtyRetur.value = maxQty
  }
  if (qtyRetur.value < 1) {
    qtyRetur.value = 1
  }
}

const addToReturList = () => {
  // Check if item already exists in the list
  const existingItem = barangReturList.value.find(
    (item) =>
      item.BARCODE === itemSelected.value.BARCODE &&
      item.SUB_BARCODE === itemSelected.value.SUB_BARCODE,
  )

  if (existingItem) {
    // Update quantity if item already exists
    existingItem.QTY_RETUR += qtyRetur.value
    showWarning(`Barang sudah ada, qty diperbarui menjadi ${existingItem.QTY_RETUR}`)
  } else {
    // Add new item if it doesn't exist
    barangReturList.value.push({
      ...itemSelected.value,
      QTY_RETUR: qtyRetur.value,
    })
    showSuccess(`${itemSelected.value.NAMA} berhasil ditambahkan ke retur`)
  }
  closeDrawer()
}
const closeDrawer = () => {
  showAddQtyDrawer.value = false
  qtyRetur.value = 1
  itemSelected.value = null
}

// Toast functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
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
const getTotalQty = () => {
  return barangReturList.value.reduce((total, item) => total + item.QTY_RETUR, 0).toLocaleString()
}

const getTotalAmount = () => {
  const total = barangReturList.value.reduce(
    (total, item) => total + item.QTY_RETUR * item.HARGABELI,
    0,
  )
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(total)
}

const list_supplier = ref([])

const get_data_supplier = async () => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/data_referensi/${id_client.value}`,
    )

    list_supplier.value = [...response.data.response]

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const get_list_depo = async () => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/data_referensi/${id_client.value}`,
    )

    list_supplier.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

watch(JenisReturSelected, (newVal) => {
  console.log('Jenis Retur selected:', newVal)
  if (newVal === 'A') {
    get_data_supplier()
  } else {
    //get_list_depo()
  }
})

const idSupplierSelected = ref(null)
watch(supplierSelected, (newVal) => {
  //console.log('Supplier selected:', newVal)
  idSupplierSelected.value = newVal?.IDSUPLIER
  get_item_by_supplier()
})

const barangList = ref([])

const get_item_by_supplier = async () => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl

    const payload = {
      mode: 1,
      id_client: id_client.value,
      id_supplier: idSupplierSelected.value,
      id_lokasi: id_lokasi.value,
    }

    const response = await axios.post(
      `${url}/index.php/api/barang/get_barang_berdasarakan_supplier`,
      payload,
    )

    console.log(response.data.response)
    barangList.value = [...response.data.response]

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID')
}

const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
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
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return null
  }
}

onMounted(() => {})
</script>
<style scoped>
.dialog-retur-finish {
  border-radius: 12px;
}

.dialog-retur-finish :deep(.p-dialog-content) {
  padding: 0;
}

.dialog-content {
  padding: 32px 24px;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.icon-container i {
  font-size: 3rem;
  color: #10b981;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 8px;
}

.dialog-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
}

.button-container {
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: space-between;
}

.summary-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #3ca582;
}

.form-group {
  margin-bottom: 24px;
}

.drawer-content {
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.item-container {
  width: 100%;
  max-width: 500px;
}

.item-card {
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.item-header {
  text-align: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 16px;
}

.item-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.item-barcode {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #666;
  font-family: 'Courier New', monospace;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

.detail-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.text-success {
  color: #10b981;
}

.quantity-section {
  background: #f0f7ff;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.quantity-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.quantity-input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}

.quantity-input {
  width: 100px;
  text-align: center;
}

.quantity-input :deep(.p-inputnumber) {
  width: 100%;
}

.quantity-input :deep(.p-inputnumber-input) {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.action-buttons {
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

.mb-4 {
  margin-bottom: 16px;
}

.mt-5 {
  margin-top: 20px;
}

.text-muted {
  color: #999;
}

@media (max-width: 768px) {
  .item-card {
    padding: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .drawer-content {
    padding: 16px;
  }
}
</style>
