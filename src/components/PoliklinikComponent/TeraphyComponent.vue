<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Toast />

  <!-- Dialog List Obat -->

  <Dialog
    v-model:visible="listObat"
    modal
    header="List obat-obatan"
    :style="{ width: '1200px' }"
    class="patient-detail-dialog"
    :closable="false"
  >
    <div>
      <DataTable
        :value="availableObat"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :scrollable="true"
        scrollHeight="400px"
        class="p-datatable-sm"
        :rowHover="true"
        :showGridlines="true"
      >
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <div class="flex align-items-center gap-2 mr-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search mr-2" />
                <InputText
                  placeholder="Cari obat..."
                  v-model="searchQuery"
                  @input="findObatan(19, '')"
                  style="font-size: 12px"
                />
              </span>
              <span>obat ditemukan ({{ availableObat.length }})</span>
            </div>
          </div>
        </template>

        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
            <p class="text-gray-600 m-0">Tidak ada data obat yang tersedia</p>
          </div>
        </template>

        <template #loading>
          <div class="text-center p-4">
            <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
            <p class="mt-2 text-gray-600">Memuat data...</p>
          </div>
        </template>

        <!-- <Column field="GROUPING" header="Grouping" :sortable="true" style="min-width: 200px">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <Tag :value="slotProps.data.GROUPING" class="text-xs" />
            </div>
          </template>
        </Column> -->

        <Column field="CAPTION" header="NAMA ITEM" :sortable="true" style="min-width: 200px">
          <template #body="slotProps">
            <div class="flex align-items-right gap-2">
              <span class="font-semibold">
                {{ slotProps.data.CAPTION }}
              </span>
            </div>

            <span v-if="slotProps.data.BATCH_NUMBER" class="badge bg-primary">
              BTCH{{ slotProps.data.BATCH_NUMBER }}</span
            >
          </template>
        </Column>

        <Column field="KATEGORI" header="KATEGORI" :sortable="true" style="min-width: 150px">
          <template #body="slotProps">
            <span class="badge badge-success">{{ slotProps.data.KATEGORI }}</span>
          </template>
        </Column>

        <Column
          field="HARGAJUAL"
          header="HARGA JUAL"
          :sortable="true"
          dataType="numeric"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <div class="text-right font-semibold text-green-600">
              {{ formatCurrency(slotProps.data.HARGAJUAL) }}
            </div>
          </template>
        </Column>
        <Column
          field="QUNATITY"
          header="SEDIAAN"
          :sortable="true"
          dataType="numeric"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <div class="text-right font-semibold text-green-600">
              {{ slotProps.data.QUNATITY }}
            </div>
          </template>
        </Column>

        <Column header="AKSI" :exportable="false" style="min-width: 120px">
          <template #body="slotProps">
            <div class="flex gap-1">
              <Button
                icon="pi pi-plus"
                :disabled="disable_jika_sediaan_nol == 1 && slotProps.data.QUNATITY <= 0"
                class="p-button-rounded p-button-success round-button2 p-button-sm"
                @click="addItem(slotProps.data, 1)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button label="Close" icon="pi pi-times" @click="listObat = false" class="p-button-text" />
      </div>
    </template>
  </Dialog>

  <!-- Main Panel -->
  <Panel style="padding: 0; margin: 0">
    <template #header>
      <div class="flex justify-content-between align-items-center">
        <div class="flex align-items-center gap-2">
          <span class="font-bold text-sm">Terapi Obat</span>
        </div>
      </div>
    </template>
    <div class="row">
      <!-- Left Panel - History -->
      <ScrollPanel class="col-md-2" style="height: 500px; padding-right: 4px">
        <Panel v-for="(data, index) in riwayat_obat" :key="index" class="mb-1">
          <template #header>
            <div>
              <Tag severity="info" class="ml-0 text-xs mb-1">
                <i class="pi pi-calendar text-blue-500"></i>{{ data.SHORTDATE }} -
                {{ data.JAM }}
              </Tag>
            </div>
          </template>

          <Tag v-if="data.TELAH_DIKIRIM == 1" severity="success" style="font-size: 10px">
            Dikirim
            {{ data.TANGGAL_KIRIM }} - {{ data.JAM_KIRIM }}
          </Tag>
          <Tag v-else severity="danger" value="Blm Terkirim" class="text-xs" />

          <template #footer>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <Button
                  icon="pi pi-times"
                  severity="warn"
                  @click="ConfirmVoidResep(data.RECEIPT_NO, index)"
                  class="round-button2"
                  text
                ></Button>
                <Button
                  icon="pi pi-eye"
                  label="lihat"
                  class="round-button2"
                  @click="getdetail_sales(data.RECEIPT_NO)"
                  rounded
                  text
                ></Button>
                <button
                  v-if="data.TELAH_DIKIRIM == 0"
                  type="button"
                  @click="kirim_resep(data.RECEIPT_NO)"
                  class="btn btn-block btn-danger btn-xs"
                >
                  Kirim
                  <i class="pi pi-send" style="font-size: 10px; margin-right: 4px"></i>
                </button>
              </div>
            </div>
          </template>
        </Panel>
      </ScrollPanel>

      <!-- Main Content -->
      <div class="col-md-10">
        <Panel>
          <template #header>
            <div class="header-container" v-if="biayaPelayanan.PLAFON_OBAT > 0">
              <!-- Left Side - Total -->
              <div class="total-section">
                <span class="label">TOTAL TERAPI</span>
                <span
                  class="amount"
                  :class="{ exceeded: totalAmount > biayaPelayanan.PLAFON_OBAT }"
                >
                  {{ formatCurrency(totalAmount) }}
                </span>
              </div>

              <!-- Right Side - Status -->
              <div class="status-section" v-if="totalAmount > biayaPelayanan.PLAFON_OBAT">
                <Tag severity="danger" class="status-tag danger-tag">
                  <i class="pi pi-exclamation-circle mr-2"></i>
                  Plafon Terlampaui
                  <br />
                  <small>Max: {{ formatCurrency(biayaPelayanan.PLAFON_OBAT) }}</small>
                </Tag>
              </div>
            </div>
          </template>
          <div class="mb-2 flex justify-end">
            <Button
              class="p-button-success round-button2"
              icon="pi pi-plus"
              label="Tambah Item"
              size="small"
              @click="listObat = true"
            />
            <Button
              class="p-button-success ml-1 round-button2"
              icon="pi pi-plus"
              label="Obat Racikan"
              size="small"
              style="background-color: deeppink; border: none"
              @click="showResepRacikan = true"
            />
            <Button
              label="Obat Kronis (Apol)"
              icon="fas fa-file-medical"
              severity="warn"
              class="p-button-outlined round-button2 ml-1"
              @click="obat_kronisBPJS"
            />
          </div>
          <DataTable
            :value="selectedObatObatan"
            :paginator="false"
            :scrollable="true"
            scrollHeight="400px"
            :breakpoints="{ '1100px': '75vw', '575px': '90vw' }"
            class="p-datatable-sm"
            :rowHover="true"
            :showGridlines="true"
            striped-rows
          >
            <!-- <template #header>
              <div class="flex justify-content-between align-items-center"></div>
            </template> -->

            <template #empty>
              <div class="text-center p-4">
                <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
                <p class="text-gray-600 m-0">Tidak ada data obat yang tersedia</p>
              </div>
            </template>

            <template #loading>
              <div class="text-center p-4">
                <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
                <p class="mt-2 text-gray-600">Memuat data...</p>
              </div>
            </template>

            <Column field="PILIH" header="OBT RUTIN" style="width: 1px">
              <template #body="slotProps">
                <Checkbox
                  v-if="slotProps.data.JENIS_R == 'R/'"
                  v-model="slotProps.data.obat_rutin"
                  :value="slotProps.data.obat_rutin"
                  @change="onCheckObat(slotProps.data)"
                  :binary="true"
                />
              </template>
            </Column>
            <Column field="BARCODE" header="BARCODE" style="min-width: 10px"></Column>
            <Column field="NAMA" header="NAMA"></Column>

            <Column field="JENIS_R" header="JENIS_R">
              <template #body="slotProps">
                {{ slotProps.data.JENIS_R }}
              </template>
            </Column>
            <Column field="QTY" header="QTY">
              <template #body="slotProps">
                <InputText
                  type="number"
                  v-model="slotProps.data.QTY"
                  v-if="slotProps.data.JENIS_R == 'R/'"
                  style="width: 5em"
                  min="0"
                  @update:modelValue="(val) => (slotProps.data.QTY = Math.max(0, Number(val || 0)))"
                  @keydown="(e) => e.key === '-' && e.preventDefault()"
                />
              </template>
            </Column>
            <Column field="SATUAN" header="SATUAN">
              <template #body="slotProps">
                <span v-if="slotProps.data.JENIS_R != ''">{{ slotProps.data.SATUAN }}</span>
              </template>
            </Column>
            <Column field="REMARK" header="CARA PAKAI">
              <template #body="slotProps">
                <Button
                  severity="warn"
                  icon="fa-solid fa-book-medical"
                  class="p-button-outlined"
                  text
                  style="width: 10%"
                  @click="openCaraPakaiDialog(slotProps.index)"
                />
                <InputText v-model="slotProps.data.REMARK_ITEM" style="width: 60%" />
              </template>
            </Column>

            <Column field="AKSI" header="AKSI">
              <template #body="slotProps">
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  class="p-button-text round-button2"
                  @click.stop.prevent="confirmRemoveItemObat(slotProps.index)"
                />
              </template>
            </Column>

            <Column field="HARGA" header="AMOUNT" style="text-align: right">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.HARGA * slotProps.data.QTY) }}
              </template>
            </Column>
          </DataTable>

          <template #footer>
            <div class="panel-footer">
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-2">
                  <small>Total Items: {{ selectedObatObatan.length }}</small>
                </div>
                <div class="flex gap-2">
                  <Button
                    label="Clear All"
                    icon="pi pi-trash"
                    severity="danger"
                    class="p-button-outlined round-button2"
                    @click="clearAllItems"
                    :disabled="selectedObatObatan.length === 0"
                  />
                  <Button
                    label="Save"
                    icon="pi pi-save"
                    class="p-button-success round-button2 ml-1"
                    @click="saveItems"
                    :disabled="selectedObatObatan.length === 0"
                  />
                  <Button
                    label="Histori"
                    icon="pi pi-history"
                    @click="showHistoryTeraphy = true"
                    class="p-button-info round-button2 ml-1"
                  />
                </div>
              </div>
            </div>
          </template>
        </Panel>
      </div>
    </div>
  </Panel>

  <!-- Detail Resep Dialog -->
  <Dialog
    v-model:visible="detailsResep"
    modal
    :header="`RESEP : ${RECEIPT_NO}`"
    :breakpoints="{ '1100px': '75vw', '575px': '90vw' }"
    :closable="true"
  >
    <div>
      <Tag :severity="progress == 'C' ? 'success' : 'warn'">
        {{ progress === 'C' ? 'Selesai Pada Pukul' : 'Menunggu' }} {{ jamSelesai }}
      </Tag>
    </div>
    <div>
      <DataTable
        :value="detils_obat"
        :paginator="false"
        :scrollable="true"
        scrollHeight="400px"
        :breakpoints="{ '1100px': '75vw', '575px': '90vw' }"
        class="p-datatable-sm"
        :rowHover="true"
        :showGridlines="true"
        striped-rows
      >
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
            <p class="text-gray-600 m-0">Tidak ada data obat yang tersedia</p>
          </div>
        </template>

        <template #loading>
          <div class="text-center p-4">
            <i class="pi pi-spin pi-spinner text-2xl text-blue-500"></i>
            <p class="mt-2 text-gray-600">Memuat data...</p>
          </div>
        </template>

        <Column field="BARCODE" header="BARCODE" :sortable="true">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <Tag :value="slotProps.data.BARCODE" class="text-xs" />
            </div>
          </template>
        </Column>
        <Column field="NAMABARANG_REQ" header="ITEM REQ" :sortable="true">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              {{ slotProps.data.NAMABARANG_REQ }}
            </div>
          </template>
        </Column>
        <Column field="NAMABARANG" header="ITEM APPROVED" :sortable="true">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              {{ slotProps.data.NAMABARANG }}
            </div>
          </template>
        </Column>
        <Column field="QTY_REQ" header="PERMINTAAN" :sortable="true">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              {{ slotProps.data.QTY_REQ }}
            </div>
          </template>
        </Column>

        <Column field="REMARK_ITEM" header="DOSIS" :sortable="true"></Column>
        <Column field="QTY" header="DIBERIKAN" :sortable="true">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2" v-if="slotProps.data.QTY > 0">
              <Tag :value="slotProps.data.QTY" class="text-sx" style="width: 5em" />
            </div>
            <div class="flex align-items-center gap-2" v-else>
              <Tag :value="slotProps.data.QTY" severity="warn" class="text-sx" style="width: 5em" />
            </div>
          </template>
        </Column>
        <Column field="QTY_COPY" header="COPY RESEP" :sortable="true">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2" v-if="slotProps.data.QTY_COPY > 0">
              <Tag :value="slotProps.data.QTY_COPY" class="text-sx" style="width: 5em" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>

  <!-- Dialog Cara Pakai Obat - FIXED -->
  <Dialog
    v-model:visible="showCaraPakaiObat"
    :style="{ width: '40vw' }"
    modal
    header="Cara pakai obat"
    :closable="true"
  >
    <InputText
      v-model="searchValue"
      @input="listCaraMinumObat(searchValue)"
      placeholder="Cari cara pakai..."
      class="w-full mb-3"
    />

    <div style="height: 500px">
      <DataTable
        :value="listCaraPakaiObat"
        :paginator="false"
        :scrollable="true"
        scrollHeight="400px"
        class="p-datatable-sm"
        :rowHover="true"
        :showGridlines="true"
        striped-rows
      >
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-info-circle text-4xl text-blue-400 mb-3"></i>
            <p class="text-gray-600 m-0">Ketik untuk mencari cara pakai obat</p>
          </div>
        </template>

        <Column field="" header="#" style="width: 60px">
          <template #body="slotProps">
            {{ slotProps.index + 1 }}
          </template>
        </Column>

        <Column field="REMARK" header="CARA PAKAI">
          <template #body="slotProps">
            {{ slotProps.data.REMARK }}
          </template>
        </Column>

        <Column field="" header="AKSI" style="width: 120px">
          <template #body="slotProps">
            <Button
              severity="success"
              style="width: 100%"
              class="round-button2"
              label="Pilih"
              @click="pilihCaraPakai(slotProps.data.REMARK)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>
  <!-- History Therapy Component -->
  <HIstoryTeraphy v-model:showHistoryTeraphy="showHistoryTeraphy" @sendData="getDataHistori" />

  <!-- Resep Racikan Dialog -->
  <Dialog v-model:visible="showResepRacikan" modal header="Resep Racikan" :closable="true">
    <Card class="m-10">
      <template #content>
        <div class="row">
          <div class="col-md-4">
            <label for="">Nama Racikan</label><br />
            <InputText v-model="TitleRacikan" class="form-control" style="width: 100%" />
          </div>
          <div class="col-md-2">
            <label for="">Jumlah</label><br />
            <InputText
              type="number"
              v-model="jumlQtyResepRacikan"
              @input="handleQuantityInput"
              style="width: 80%"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label for="">Satuan</label><br />
            <InputText
              v-model="SatuanRacikan"
              class="form-control"
              placeholder="Bungkus/"
              style="width: 90%"
            />
          </div>
          <div class="col-md-2">
            <Button
              label=""
              @click="addItemRacik"
              class="w-full round-button2 mt-4"
              icon="pi pi-plus"
            />
          </div>
        </div>
        <hr />
        <div class="row" v-for="(data, index) in itemResepRacikan" :key="index">
          <div class="col-md-9 mb-1">
            <label for="" class="mr-2">Item Racikan</label>
            <InputText v-model="data.NAMABARANG" style="width: 80%" />
          </div>
          <div class="col-md-3">
            <Button
              label=""
              @click="removeItemRacikan(index)"
              severity="danger"
              class="round-button2 p-button-text"
              icon="pi pi-times"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-4 mt-1 justify-center">
          <Button
            label="Cancel"
            severity="secondary"
            variant="outlined"
            class="w-32"
            @click="showResepRacikan = false"
          />
          <Button label="Save" @click="ResepRacikan()" class="w-32" />
        </div>
      </template>
    </Card>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HIstoryTeraphy from '@/components/PoliklinikComponent/HIstoryTeraphy.vue'

import ScrollPanel from 'primevue/scrollpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Panel from 'primevue/panel'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Card from 'primevue/card'
import Chip from 'primevue/chip'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const showResepRacikan = ref(false)
const configStore = useConfigStore()
const TitleRacikan = ref('')

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id, id_lokasi, disable_jika_sediaan_nol } = storeToRefs(authStore)

const selectedObatObatan = ref([])
const itemResepRacikan = ref([])

import { useRoute } from 'vue-router'
const route = useRoute()

import { useRouter } from 'vue-router'
const router = useRouter()

const listObat = ref(false)

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const showHistoryTeraphy = ref(false)
const jumlQtyResepRacikan = ref(0)
const detailsResep = ref(false)
const SatuanRacikan = ref('')

const searchValue = ref('')
const showCaraPakaiObat = ref(false)
const currentObatIndex = ref(null)

// Methods

// Handle quantity input properly
const handleQuantityInput = () => {
  jumlQtyResepRacikan.value = parseInt(jumlQtyResepRacikan.value || 0)
}

const biayaPelayanan = ref({
  POLIRUANG: '',
  KDPOLY: '',
  OBATAN: 0,
  BMHP: 0,
  LABORATORIUM: 0,
  TENAGA_AHLI: 0,
  KEPERAWATAN: 0,
  RADIOLOGI: 0,
  PLAFON_OBAT: 0,
})

// Fixed computed property
const totalAmount = computed(() => {
  // total dari item obat
  const totalObat = Array.isArray(selectedObatObatan.value)
    ? selectedObatObatan.value.reduce((total, item) => {
        const qty = parseFloat(item.QTY) || 0
        const harga = parseFloat(item.HARGA) || 0
        return total + qty * harga
      }, 0)
    : 0

  // total dari billing
  const biayaObatan = parseFloat(biayaPelayanan.value.OBATAN) || 0

  return totalObat + biayaObatan
})

const onCheckObat = async (item) => {
  try {
    const param = {
      mode: 1,
      no_transaksi: route.query.noreg,
      id_client: id_client.value,
      nomr: props.datapasien?.NOMR,
      ...item,
    }

    const url = configStore.apiBaseUrl
    await axios.post(`${url}/index.php/api/penunjang/update_obat_rutin`, param)
  } catch (error) {
    console.error(error)
  }
}

const calculatePercentage = () => {
  if (!biayaPelayanan.value.PLAFON_OBAT || biayaPelayanan.value.PLAFON_OBAT === 0) {
    return 0
  }
  const percentage = (totalAmount.value / biayaPelayanan.value.PLAFON_OBAT) * 100
  return Math.round(percentage)
}

const total_amount_obat = async () => {
  try {
    const param = {
      mode: 1,
      no_transaksi: route.query.noreg,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_data_billing_perpasien`,
      param,
    )

    // Update biayaPelayanan instead of totalAmount
    if (response.data) {
      biayaPelayanan.value = {
        ...biayaPelayanan.value,
        OBATAN: parseFloat(response.data.OBATAN) || 0,
        PLAFON_OBAT: parseFloat(response.data.PLAFON_OBAT) || 0,
      }
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat data billing')
  }
}

const obat_kronisBPJS = async () => {
  const routeData = router.resolve({
    name: 'TransaksiResepView',
    params: {
      nosep: props.datapasien.NOSEP,
    },
  })
  // 🔹 Buka di tab baru
  window.open(routeData.href, '_blank')
}

const addItemRacik = () => {
  itemResepRacikan.value.push({
    NAMABARANG: '',
    JENIS_RESEP: 'RR',
  })
}

// FIXED: Open dialog and store current index
const openCaraPakaiDialog = (index) => {
  currentObatIndex.value = index
  searchValue.value = ''
  listCaraPakaiObat.value = []
  showCaraPakaiObat.value = true
}

// FIXED: Apply selected cara pakai to the correct item
const pilihCaraPakai = (remark) => {
  if (currentObatIndex.value !== null && selectedObatObatan.value[currentObatIndex.value]) {
    selectedObatObatan.value[currentObatIndex.value].REMARK_ITEM = remark
    showCaraPakaiObat.value = false
    showSuccess('Cara pakai berhasil dipilih')
  }
}

const removeItemRacikan = (index) => {
  itemResepRacikan.value.splice(index, 1)
}

const props = defineProps({
  datapasien: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object',
  },
})

const listCaraPakaiObat = ref([])

const listCaraMinumObat = async (keyword) => {
  try {
    if (keyword == '' || keyword.length < 2) {
      listCaraPakaiObat.value = []
      return
    }

    const param = {
      mode: 2,
      keyword: keyword,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/get_remarkv3`, param)

    if (response.data?.response) {
      listCaraPakaiObat.value = response.data?.response
    } else {
      listCaraPakaiObat.value = []
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat cara pakai obat')
  }
}

const currentDateTime = ref('')

const formatDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const loading = ref(false)

const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: message,
    life: 3000,
  })
}

const confirmRemoveItemObat = (index) => {
  const obat = selectedObatObatan.value[index]
  const namaObat = obat?.NAMA

  confirm.require({
    message: `Anda ingin menghapus item "${namaObat}"?`,
    header: 'Konfirm hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => removeItem(index),
  })
}

const ConfirmVoidResep = (RECEIPT_NO, index) => {
  confirm.require({
    message: `Anda ingin menghapus resep "${RECEIPT_NO}"?`,
    header: 'Konfirm hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => RemoveResep(RECEIPT_NO, index),
  })
}

const RemoveResep = async (RECEIPT_NO, index) => {
  try {
    const url = configStore.apiApotikUrl
    const paramUrl = `${RECEIPT_NO}/${id_client.value}/${0}`
    const response = await axios.post(`${url}/index.php/api/sales/void_sales/${paramUrl}`)

    if (response.data.metadata.code == '200') {
      riwayat_obat.value.splice(index, 1)
      showSuccess('Resep berhasil dibatalkan')
    } else {
      showError(response.data.metadata.message)
    }
  } catch (error) {
    console.error(error)
    showError('Gagal menghapus resep')
  }
}

const detils_obat = ref([])
const progress = ref(null)
const jamSelesai = ref(null)
const RECEIPT_NO = ref(null)

const getdetail_sales = async (no_receipt) => {
  loading.value = true
  try {
    RECEIPT_NO.value = no_receipt
    const param = {
      NOREGIRTER_KLINIK: no_receipt,
      RECEIPT_NO: no_receipt,
      MODE: 'RCPT',
      IDCLIENT: id_client.value,
      TGLMIN: '',
      TGLMAX: '',
      MEMBERSHIP: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/billv2`, param)

    detils_obat.value = response.data.response || []
    if (response.data.response && response.data.response.length > 0) {
      jamSelesai.value = response.data.response[0].SELESAI
      progress.value = response.data.response[0].STATUS_PROGRESS

      detils_obat.value = {
        ...detils_obat.value,
        obat_rutin: false, // default tercentang
      }
    }

    detailsResep.value = true
  } catch (error) {
    console.error(error)
    showError('Gagal memuat detail resep')
  } finally {
    loading.value = false
  }
}

const clearAllItems = () => {
  selectedObatObatan.value = []
}

const removeItem = (index) => {
  selectedObatObatan.value.splice(index, 1)
}

const riwayat_obat = ref([])

const get_riwayat = async () => {
  loading.value = true
  try {
    const param = {
      NOREGIRTER_KLINIK: route.query.noreg,
      RECEIPT_NO: route.query.noreg,
      MODE: 'RESEP_HISTORY',
      IDCLIENT: id_client.value,
      TGLMIN: '',
      TGLMAX: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/get_header_sales`, param, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.data?.response) {
      riwayat_obat.value = response.data.response.filter((x) => x.OBAT_OBATAN == 1)
      total_amount_obat()
    } else {
      riwayat_obat.value = []
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat riwayat obat')
  } finally {
    loading.value = false
  }
}

const kirim_resep = async (rcpt_no) => {
  loading.value = true
  const param = {
    RECEIPT_NO: rcpt_no,
  }
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/kirim_resep/${id_client.value}`,
      param,
    )

    await get_riwayat()
    showSuccess('Resep berhasil dikirim')
  } catch (error) {
    console.error(error)
    showError('Gagal mengirim resep')
  } finally {
    loading.value = false
  }
}

const availableObat = ref([])
const searchQuery = ref('')

const saveItems = async () => {
  if (selectedObatObatan.value.length === 0) {
    showWarning('Tidak ada item yang akan disimpan')
    return
  }

  currentDateTime.value = formatDateTime()
  const headerObat = {
    header: {
      RECEIPT_NO: '',
      MEMBERSHIP_ID: props.datapasien?.NOMR,
      SALESNO: 0,
      IDUSER: user_id.value,
      TANGGAL: currentDateTime.value,
      IDPAYEMENT: props.datapasien?.KODECARABAYAR,
      NOTE: `${props.datapasien?.NOMR},${props.datapasien?.DATA_SINGKAT}`,
      SUBTOTAL: 0,
      TAXPERCENT: 0,
      TAXAMOUNT: 0,
      TOTALBAYAR: 0,
      POTONGAN: 0,
      MODE: 'REG',
      IDCLIENT: id_client.value,
      GRANDTOTAL: 0,
      KEMBALIAN: 0,
      ID_LOKASI: id_lokasi.value,
      ROOM_TABLE_NUMBER: 0,
      RESV_ID: 0,
      NO_REGISTER: props.datapasien?.NOPENDAFTARAN,
      SERVER_ID: 0,
      POLI_RUANG: props.datapasien?.POLI,
      DPJP: props.datapasien?.NAMADOKTER,
      SERVER_NAME: '',
      STATUS_PROGRESS: '',
      OBAT_OBATAN: 1,
      AS_PARENT: 0,
      TGL_SELESAI: '',
      KLINIS: '',
      JENIS_RESEP: 'RT',
      CARAPAKAI_RACIK: '',
      JML_RACIK: '',
      BENTUK_RACIK: '',
      OBAT_PULANG: 0,
      details: selectedObatObatan.value,
    },
  }

  loading.value = true
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/insert_sales_v2`, headerObat)

    if (response.data?.metadata?.code == 200) {
      showSuccess('Data berhasil disimpan')
      selectedObatObatan.value = []
      await get_riwayat()
    } else {
      showError(response.data?.metadata?.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error(error)
    showError('Terjadi kesalahan saat menyimpan data')
  } finally {
    loading.value = false
  }
}

const datafromCopyResep = ref(null)

const ResepRacikan = async () => {
  try {
    if (!TitleRacikan.value) {
      showWarning('Nama racikan harus diisi')
      return
    }

    if (itemResepRacikan.value.length === 0) {
      showWarning('Item racikan harus diisi')
      return
    }

    // Add main racikan item first
    const mainRacikanItem = {
      BARCODE: '00000',
      ID_BARANG: '00000',
      NAMA: TitleRacikan.value,
      AS_PARENT: 1,
      JENIS_R: 'R/',
      SATUAN: SatuanRacikan.value,
      HARGA: 0,
      POTONGSTOCK: 0,
      QTY_RACIK: 0,
      PERSEDIAAN: 0,
      MEREK: '',
      QTY: 0, //jumlQtyResepRacikan.value,
      QTY_REQ: jumlQtyResepRacikan.value,
      JENIS: '',
      SATUAN_RACIK: SatuanRacikan.value,
    }

    addItem(mainRacikanItem)

    // Add individual racikan items
    itemResepRacikan.value.forEach((item) => {
      if (item.NAMABARANG) {
        const setItem = {
          BARCODE: '00000',
          ID_BARANG: '00000',
          NAMA: item.NAMABARANG,
          JENIS_RESEP: item.JENIS_RESEP,
          AS_PARENT: 0,
          SATUAN: '',
          JENIS_R: '',
          HARGA: 0,
          POTONGSTOCK: 0,
          QTY_RACIK: 0,
          PERSEDIAAN: 0,
          MEREK: '', // SatuanRacikan.value,
          QTY: 0,
          JENIS: '',
          SATUAN_RACIK: '',
        }
        addItem(setItem, 2)
      }
    })

    // Reset form
    TitleRacikan.value = ''
    SatuanRacikan.value = ''
    jumlQtyResepRacikan.value = 0
    itemResepRacikan.value = []
    showResepRacikan.value = false

    showSuccess('Resep racikan berhasil ditambahkan')
  } catch (error) {
    console.error(error)
    showError('Gagal menambahkan resep racikan')
  }
}

const getDataHistori = async (data) => {
  try {
    const plain = data._rawValue || data.value || data
    datafromCopyResep.value = plain

    console.log('datafromCopyResep', plain)

    if (Array.isArray(datafromCopyResep.value)) {
      datafromCopyResep.value.forEach((item) => {
        const setItem = {
          BARCODE: item.BARCODE,
          NAMA: item.NAMABARANG,
          SATUAN: item.SATUAN,
          MEREK: item.SATUAN,
          HARGA: parseFloat(item.HARGA),
          POTONGSTOCK: item.POTONGSTOCK || 0,
          QTY_RACIK: 0,
          JENIS_R: 'R/',
          PERSEDIAAN: 0,
          REMARK_ITEM: item.REMARK_ITEM,
          QTY: parseFloat(item.QTY) == 0 ? parseFloat(item.QTY_COPY) : parseFloat(item.QTY),
          JENIS: item.JENIS,
          SATUAN_RACIK: '',
        }

        addItem(setItem, 2)
      })
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat data histori')
  }
}

const addItem = (item, mode) => {
  try {
    currentDateTime.value = formatDateTime()

    if (!item.NAMA && !item.CAPTION) {
      showWarning('Nama obat tidak boleh kosong')
      return
    }

    console.log('mode', mode)

    if (mode == 1) {
      item.JENIS_R = 'R/'
    }

    selectedObatObatan.value.push({
      BARCODE: item.BARCODE || '00000',
      ID_BARANG: item.BARCODE || '00000',
      JENIS_R: item.JENIS_R || '',
      NAMA: item.NAMA || item.CAPTION || '',
      SATUAN: item.SATUAN || '',
      RECEIPT_NO: '',
      HARGA: item.HARGAJUAL || item.HARGA || 0,
      POTONGSTOCK: item.POTONGSTOCK || 0,
      TOTAL_ITEM: 0,
      KATEGORI: item.KATEGORI,
      QTY_RACIK: item.QTY_RACIK || 0,
      PERSEDIAAN: item.QUANTITY || item.QUNATITY || item.PERSEDIAAN || 0,
      SATUAN_RACIK: item.SATUAN_RACIK || '',
      MEREK: item.MEREK,
      TOTALAMOUNT: 0,
      DISCOUNT: 0,
      ITEMSEQNO: '',
      SUBITEMSEQNO: 1,
      QTY: item.QTY || 0,
      STATUS: '',
      DOSIS: '',
      STATUS_PROGRESS: 'M',
      SUB_BARCODE: item.SUB_BARCODE || '',
      OBAT_OBATAN: 1,
      AS_PARENT: mode == 1 ? 0 : 1,
      SAT_RACIK: '',
      FLAG: 'NEW LINE',
      JENIS: item.JENIS || '',
      JENIS_RESEP: mode == 1 ? 'RT' : 'RR',
      ID_LOKASI: id_lokasi.value,
      REMARK: item.REMARK || '',
      REMARK_ITEM: item.REMARK_ITEM || '',
      TANGGAL_TRANS: currentDateTime.value,
      JML_RACIK: 0,
    })
  } catch (error) {
    console.error(error)
    showError('Gagal menambahkan item')
  }
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

const findObatan = async (mode, barcode) => {
  try {
    if (searchQuery.value.length <= 2) {
      return
    }

    const param = {
      barcode: barcode || '',
      mode: mode || 19,
      id_client: id_client.value,
      breakdown: 0,
      nama: searchQuery.value || '',
      lokasi: id_lokasi.value,
    }

    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    if (response.data?.metadata?.code == 200) {
      availableObat.value = response.data.response || []
    } else {
      availableObat.value = []
      showWarning('Tidak ada data obat ditemukan')
    }
  } catch (error) {
    console.error('Error searching medicines:', error)
    availableObat.value = []
    showError('Gagal mencari data obat')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

onMounted(() => {
  get_riwayat()
})
</script>

<style scoped>
.panel-total-therapy {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 20px;
  padding: 8px 0;
  flex-wrap: nowrap;
}

.total-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.amount {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
  transition: color 0.3s ease;
}

.amount.exceeded {
  color: #dc2626;
}

.status-section {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.status-tag {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.status-tag small {
  font-size: 11px;
  opacity: 0.9;
  display: block;
  margin-top: 2px;
}

.danger-tag {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.success-tag {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.mr-2 {
  margin-right: 6px;
}

.ml-1 {
  margin-left: 6px;
}

.mb-2 {
  margin-bottom: 12px;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.round-button2 {
  border-radius: 6px;
}
/* Obat Picker */
.obat-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  min-height: 400px;
}
.picker-panel {
  border: 1px solid var(--p-content-border-color);
  border-radius: 8px;
  display: flex;

  background-color: #10b981;
  flex-direction: column;
  overflow: hidden;
}
.picker-search {
  padding: 10px;
  border-bottom: 1px solid var(--p-content-border-color);

  background-color: #10b981;
}
.picker-filter-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;

  padding: 8px 10px;
  border-bottom: 1px solid var(--p-content-border-color);
}
.filter-tag {
  font-size: 11px;
  padding: 3px 10px;
  background-color: #10b981;
  border-radius: 20px;
  border: 1px solid var(--p-content-border-color);
  background: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.15s;

  background-color: #10b981;
  font-family: inherit;
}
.filter-tag:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}
.filter-tag.active {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: #fff;
}
.picker-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.picker-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  min-height: 100px;
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .status-section {
    width: 100%;
    margin-left: 0;
  }

  .status-tag {
    width: 100%;
    justify-content: space-between;
  }

  .amount {
    font-size: 20px;
  }
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 1rem;
}

.patient-detail-dialog {
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.panel-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  margin-top: 16px;
}

.round-button2 {
  border-radius: 6px;
}

.badge-success {
  background-color: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.row {
  display: flex;
  flex-wrap: wrap;
}

.col-md-2 {
  flex: 0 0 16.666667%;
  max-width: 16.666667%;
}

.col-md-4 {
  flex: 0 0 33.333333%;
  max-width: 33.333333%;
}

.col-md-10 {
  flex: 0 0 83.333333%;
  max-width: 83.333333%;
}

.col-md-12 {
  flex: 0 0 100%;
  max-width: 100%;
}

@media (max-width: 768px) {
  .col-md-2,
  .col-md-4,
  .col-md-10,
  .col-md-12 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #212529;
  background-color: #fff;
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  color: #fff;
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.2rem;
}

.btn-block {
  display: block;
  width: 100%;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.ml-1 {
  margin-left: 0.25rem;
}

.w-full {
  width: 100%;
}

.w-32 {
  width: 8rem;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.justify-end {
  justify-content: flex-end;
}

.gap-4 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
