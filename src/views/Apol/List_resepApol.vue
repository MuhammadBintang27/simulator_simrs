<template>
  <Panel>
    <template #header>
      <div class="row">
        <div class="col-md-2">
          <div class="form-group">
            <label><i class="fas fa-calendar-alt"></i> Jenis Obat</label><br />
            <Select
              v-model="JenisObatSelected"
              :options="JenisObat"
              optionLabel="caption"
              placeholder="Pilih Jenis Obat"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group">
            <label><i class="fas fa-calendar-alt"></i> Jenis Tanggal</label><br />
            <Select
              id="jenis_tanggal"
              v-model="jenisTanggalSelected"
              :options="jenisTanggal"
              optionLabel="caption"
              placeholder="Pilih Jenis Tanggal"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group">
            <label><i class="fas fa-clock"></i> Tanggal Jam Mulai</label><br />
            <!-- :minDate="minDate"
              :maxDate="maxDate" -->
            <DatePicker
              id="tanggal_mulai"
              v-model="TanggalMulai"
              dateFormat="dd M yy"
              placeholder="Pilih tanggal"
              showIcon
              iconDisplay="input"
              style="width: 100%"
            />
          </div>
        </div>
        <!-- :minDate="minDate"
              :maxDate="maxDate" -->
        <div class="col-md-2">
          <div class="form-group">
            <label><i class="fas fa-clock"></i> Tanggal Jam Akhir</label><br />
            <DatePicker
              id="tanggal_akhir"
              v-model="TanggalAkhir"
              dateFormat="dd M yy"
              placeholder="Pilih tanggal"
              showIcon
              iconDisplay="input"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group">
            <label>&nbsp;</label><br />
            <Button
              label="Cari"
              icon="pi pi-search"
              @click="GetResep"
              :loading="loading"
              class="round-button2"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group">
            <label>&nbsp;</label><br />
            <Button
              label="Riwayat"
              severity="warn"
              icon="pi pi-user"
              @click="funcRiwayatPelObat()"
              :loading="loadingRiwayatPel"
              class="round-button2"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
    </template>
    <DataTable :value="listResep" paginator :rows="10" stripedRows>
      <Column field="NAMA" header="Nama" sortable>
        <template #body="slotProps">
          <i class="fas fa-user-injured" style="color: #3b82f6; margin-right: 8px"></i>
          {{ slotProps.data.NAMA }}
        </template>
      </Column>
      <Column field="NOAPOTIK" header="No Sep Apt" sortable>
        <template #body="slotProps">
          <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
          {{ slotProps.data.NOAPOTIK }}
        </template>
      </Column>
      <Column field="NORESEP" header="No Resep" sortable>
        <template #body="slotProps">
          <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
          {{ slotProps.data.NORESEP }}
        </template>
      </Column>
      <Column field="NOSEP_KUNJUNGAN" header="NO Sep" sortable></Column>
      <Column field="NOKARTU" header="No Peserta" sortable>
        <template #body="slotProps">
          <i class="fas fa-id-card" style="color: #8b5cf6; margin-right: 8px"></i>
          {{ slotProps.data.NOKARTU }}
        </template>
      </Column>
      <Column field="TGLENTRY" header="Tgl Entri" sortable>
        <template #body="slotProps">
          <i class="fas fa-calendar-check" style="color: #f59e0b; margin-right: 8px"></i>
          {{ slotProps.data.TGLENTRY }}
        </template>
      </Column>
      <Column field="Iter" header="Iter" sortable>
        <template #body="slotProps">
          {{ slotProps.data.FLAGITER }}
          <span v-if="slotProps.data.FLAGITER == 'True'">
            <i class="fas fa-check-square fa-lg" style="color: green"></i>
          </span>
          <span v-else>
            <i class="fas fa-times" style="color: #ccc"></i>
          </span>
        </template>
      </Column>
      <Column field="Jenis" header="Jenis" sortable>
        <template #body="slotProps">
          <span v-if="slotProps.data.KDJNSOBAT == '1'">
            <p>PRB</p>
          </span>
          <span v-else-if="slotProps.data.KDJNSOBAT == '2'">
            <p>Kronis</p>
          </span>
          <span v-else>
            <p>Kemo</p>
          </span>
        </template>
      </Column>
      <Column header="Aksi">
        <template #body="slotProps">
          <Button
            icon="pi pi-eye"
            class="p-button-sm p-button-info round-button2"
            @click="addResep(slotProps.data)"
          />
        </template>
      </Column>
      <Column header="Hapus">
        <template #body="slotProps">
          <Button
            icon="pi pi-times"
            severity="danger"
            class="round-button2"
            @click="confirmDelete(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>
  </Panel>

  <Dialog
    v-model:visible="RiwayatPelObat"
    :style="{ width: '1200px' }"
    header="Riwayat Pelayanan Obat"
    :modal="true"
  >
    <DataTable :value="listRiwayatPelayanan" paginator :rows="10" stripedRows>
      <Column field="nosjp" header="nosjp" sortable>
        <template #body="slotProps">
          <i class="fas fa-user-injured" style="color: #3b82f6; margin-right: 8px"></i>
          {{ slotProps.data.nosjp }}
        </template>
      </Column>
      <Column field="tglpelayanan" header="Tanggal Pelayanan" sortable>
        <template #body="slotProps">
          <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
          {{ slotProps.data.tglpelayanan }}
        </template>
      </Column>
      <Column field="kodeobat" header="Kode obat" sortable>
        <template #body="slotProps">
          <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
          {{ slotProps.data.kodeobat }}
        </template>
      </Column>
      <Column field="namaobat" header="Nama obat" sortable>
        <template #body="slotProps">
          <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
          {{ slotProps.data.namaobat }}
        </template>
      </Column>
      <Column field="jmlobat" header="Jml obat" sortable>
        <template #body="slotProps">
          <i class="fas fa-file-prescription" style="color: #10b981; margin-right: 8px"></i>
          {{ slotProps.data.jmlobat }}
        </template>
      </Column>
    </DataTable>
  </Dialog>
  <!-- Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="deleteDialog"
    :style="{ width: '450px' }"
    header="Konfirmasi Hapus"
    :modal="true"
  >
    <div class="confirmation-content">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #f59e0b"></i>
      <span style="margin-left: 1rem">
        Apakah Anda yakin ingin menghapus resep <strong>{{ selectedResep?.NORESEP }}</strong> untuk
        pasien <strong>{{ selectedResep?.NAMA }}</strong
        >?
      </span>
    </div>
    <template #footer>
      <Button
        label="Batal"
        icon="pi pi-times"
        @click="deleteDialog = false"
        severity="secondary"
        :disabled="deleting"
      />
      <Button
        label="Hapus"
        icon="pi pi-trash"
        @click="deleteResep"
        severity="danger"
        :loading="deleting"
      />
    </template>
  </Dialog>

  <!-- Add/View Resep Dialog -->
  <Dialog v-model:visible="showAddResep" :style="{ width: '1300px' }" :modal="true">
    <template #header>
      <div style="display: flex; align-items: center; gap: 8px">
        <i class="fas fa-pills" style="color: #3b82f6; font-size: 1.2rem"></i>
        <span>Detail Resep</span>
      </div>
    </template>
    <hr />
    <div v-if="selectedResep">
      <div class="detail-section">
        <div class="detail-grid">
          <div class="detail-item">
            <label><i class="fas fa-user"></i> Nama:</label>
            <span>{{ selectedResep.NAMA }}</span>
          </div>
          <div class="detail-item">
            <label><i class="fas fa-id-card"></i> No Kartu:</label>
            <span>{{ selectedResep.NOKARTU }}</span>
          </div>
          <div class="detail-item">
            <label><i class="fas fa-file-medical"></i> No Resep:</label>
            <span>{{ selectedResep.NORESEP }}</span>
          </div>
          <div class="detail-item">
            <label><i class="fas fa-clipboard-list"></i> No SEP:</label>
            <span>{{ selectedResep.NOSEP_KUNJUNGAN }}</span>
          </div>
          <div class="detail-item">
            <label><i class="fas fa-calendar"></i> Tanggal Entry:</label>
            <span>{{ selectedResep.TGLENTRY }}</span>
          </div>
          <div class="detail-item">
            <label><i class="fas fa-capsules"></i> Jenis Obat:</label>
            <span>
              <template v-if="selectedResep.KDJNSOBAT == '1'">PRB</template>
              <template v-else-if="selectedResep.KDJNSOBAT == '2'">Kronis</template>
              <template v-else>Kemo</template>
            </span>
          </div>
        </div>
      </div>
    </div>
    <hr />
    <Tabs value="0" @update:value="handleTabChange">
      <TabList>
        <Tab value="0">Non Racikan</Tab>
        <Tab value="1">Racikan</Tab>
      </TabList>
      <TabPanels>
        <div class="row mt-2">
          <div class="col-md-5">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span v-if="activeTab == '0'">Pilih Obat (NON RACIK)</span>
              <span v-if="activeTab == '1'">Pilih Obat (RACIK)</span>
              <span v-if="availableObat.length > 0">({{ availableObat.length }} ditemukan)</span>
            </label>

            <Select
              v-model="selectedItemObat"
              :options="availableObat"
              filter
              optionLabel="nama"
              placeholder="Cari dan pilih obat..."
              class="mt-0"
              :loading="loadingObatonly"
              style="width: 100%"
              @filter="searchItemObat"
              :filterFields="['nama', 'kode']"
            >
              <template #option="slotProps">
                <div class="flex flex-col gap-1 py-0">
                  <div class="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    <Tag
                      severity="info"
                      :value="slotProps.option.kode"
                      class="text-xs px-2 py-1 flex-shrink-0 round-button2"
                    />
                    {{ slotProps.option.nama }}

                    <Tag
                      severity="warn"
                      :value="formatCurrency(slotProps.option.harga)"
                      class="text-xs px-2 ml-2 py-1 flex-shrink-0 round-button2"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500"> </span>
                  </div>
                </div>
              </template>

              <template #empty>
                <div class="text-center py-4 text-gray-500">
                  {{
                    !searchQuery || searchQuery.length < 2
                      ? 'Ketik minimal 2 karakter untuk pencarian'
                      : 'Obat tidak ditemukan'
                  }}
                </div>
              </template>
            </Select>
          </div>

          <div class="col-md-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signa 1 </label
            ><br />
            <InputText v-model="signa1" class="w-100" />
          </div>
          <div class="col-md-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signa 2 </label
            ><br />
            <InputText v-model="signa2" class="w-100" />
          </div>

          <div class="col-md-1" v-if="activeTab === '1'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permintaan </label
            ><br />
            <InputText v-model="permintaan" class="w-100" type="number" />
          </div>
          <div class="col-md-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jumlah Obat </label
            ><br />
            <InputText v-model="jumlahObat" class="w-100" type="number" />
          </div>
          <div class="col-md-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hari </label
            ><br />
            <InputText v-model="hari" class="w-100" type="number" />
          </div>
          <div class="col-md-2">
            <br />
            <Button
              label="Tambah"
              @click="SimpanItemObat"
              style="margin-top: 10px"
              class="w-50"
              icon="pi pi-plus"
              :loading="loadingSimpanObat"
              :disabled="!selectedItemObat"
            />
            <Button
              label="Refresh"
              @click="riwayatobat_apol(TempResepLagiAdd)"
              :loading="loadingRefresh"
              style="margin-top: 10px"
              class="w-50"
              severity="warn"
              icon="pi pi-refresh"
            />
          </div>
        </div>
        <TabPanel value="0">
          <br />

          <DataTable
            :value="arrObat"
            :paginator="true"
            :rows="20"
            responsiveLayout="scroll"
            showGridlines
            :sortField="'nama'"
            :sortOrder="1"
            striped-rows
          >
            <template #header>
              <div style="display: flex; align-items: center; gap: 12px">
                <span style="margin-left: auto; font-weight: 500">
                  Total: {{ arrObat.length }}
                </span>
              </div>
            </template>
            <Column field="#" header="#" filter>
              <template #body="slotProps">
                {{ slotProps.index + 1 }}
              </template>
            </Column>
            <Column field="kode" header="Kode Obat" sortable style="min-width: 120px" />
            <Column field="nama" header="Nama Obat" sortable filter style="min-width: 200px" />
            <Column field="harga" header="Harga" sortable filter style="min-width: 120px">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.harga) }}
              </template>
            </Column>
            <Column field="signa1" header="Signa 1" filter style="min-width: 100px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.signa1" />
              </template>
            </Column>
            <Column field="signa2" header="Signa 2" filter style="min-width: 100px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.signa2" />
              </template>
            </Column>
            <Column field="Hari" header="Hari" filter style="min-width: 80px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.hari" type="number" />
              </template>
            </Column>
            <Column field="jumlah" header="jumlah" filter style="min-width: 80px">
              <template #body="slotProps">
                {{ slotProps.data.jumlah }}
              </template>
            </Column>
            <Column field="Cttn" header="Catatan" filter style="min-width: 150px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.catatan" />
              </template>
            </Column>
            <Column field="hapus" header="Hapus" style="min-width: 80px">
              <template #body="slotProps">
                <Button
                  class="round-button2"
                  @click="hapusItemObat(slotProps.index)"
                  icon="pi pi-times"
                  :disabled="slotProps.data.isDisabled"
                  text
                  severity="warn"
                />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel value="1">
          <br />

          <DataTable
            :value="arrObatRacikan"
            :paginator="true"
            :rows="20"
            responsiveLayout="scroll"
            showGridlines
            :sortField="'nama'"
            :sortOrder="1"
            :loading="loadingTable"
            striped-rows
          >
            <template #header>
              <div style="display: flex; align-items: center; gap: 12px">
                <span style="margin-left: auto; font-weight: 500">
                  Total: {{ arrObatRacikan.length }}
                </span>
              </div>
            </template>
            <Column field="#" header="#" filter>
              <template #body="slotProps">
                {{ slotProps.index + 1 }}
              </template>
            </Column>
            <Column field="kode" header="Kode Obat" sortable style="min-width: 120px" />
            <Column field="nama" header="Nama Obat" sortable filter style="min-width: 200px" />
            <Column field="harga" header="Harga" sortable filter style="min-width: 120px">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.harga) }}
              </template>
            </Column>
            <Column field="signa1" header="Signa 1" filter style="min-width: 100px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.signa1" />
              </template>
            </Column>
            <Column field="signa2" header="Signa 2" filter style="min-width: 100px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.signa2" />
              </template>
            </Column>
            <Column field="Hari" header="Hari" filter style="min-width: 80px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.hari" type="number" />
              </template>
            </Column>
            <Column field="jumlah" header="jumlah" filter style="min-width: 80px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.jumlah" type="number" />
              </template>
            </Column>
            <Column field="Permintaan" header="permintaan" filter style="min-width: 80px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.permintaan" type="number" />
              </template>
            </Column>

            <Column field="Cttn" header="Catatan" filter style="min-width: 150px">
              <template #body="slotProps">
                <InputText v-model="slotProps.data.catatan" />
              </template>
            </Column>
            <Column field="hapus" header="Hapus" style="min-width: 80px">
              <template #body="slotProps">
                <Button
                  class="round-button2"
                  @click="hapusItemObat(slotProps.index)"
                  icon="pi pi-times"
                  :disabled="slotProps.data.isDisabled"
                  text
                  severity="warn"
                />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <template #footer>
      <Button label="Tutup" icon="pi pi-times" @click="showAddResep = false" severity="secondary" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Panel from 'primevue/panel'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const deleting = ref(false)
const deleteDialog = ref(false)
const selectedResep = ref(null)
const TanggalMulai = ref(new Date())
const TanggalAkhir = ref(new Date())

const signa1 = ref('')
const signa2 = ref('')
const hari = ref(0)
const jumlahObat = ref(0)
const permintaan = ref(0)

const showAddResep = ref(false)
const availableObat = ref([])
const selectedItemObat = ref(null)
const arrObat = ref([])

const arrObatRacikan = ref([])
const searchQuery = ref('')
const loadingObatonly = ref(false)

const RiwayatPelObat = ref(false)

// Menghitung tanggal minimal (15 hari ke belakang)
const minDate = computed(() => {
  const today = new Date()
  today.setDate(today.getDate() - 15)
  return today
})

// Props
const props = defineProps({
  noka: {
    type: String,
    required: true,
  },
})

const JenisObatSelected = ref({
  code: 2,
  caption: 'Obat Kronis Belum Stabil',
})

const JenisObat = ref([
  {
    code: 1,
    caption: 'Obat PRB',
  },
  {
    code: 2,
    caption: 'Obat Kronis Belum Stabil',
  },
  {
    code: 3,
    caption: 'Obat Kemoterapi',
  },
])

// Menghitung tanggal maksimal (hari ini)
const maxDate = computed(() => {
  return new Date()
})

const jenisTanggalSelected = ref({
  kode: 'TGLRSP',
  caption: 'Tanggal Resep',
})

const jenisTanggal = ref([
  {
    kode: 'TGLPELSJP',
    caption: 'Tanggal Pelayanan Sesuai SEP',
  },
  {
    kode: 'TGLRSP',
    caption: 'Tanggal Resep',
  },
])

const activeTab = ref('0')

const handleTabChange = (value) => {
  activeTab.value = value

  // Add your custom logic here
  if (value === '0') {
    // Handle Non Racikan tab
  } else if (value === '1') {
    // Handle Racikan tab
  }
}
const loadingRiwayatPel = ref(false)

const listRiwayatPelayanan = ref([])
const funcRiwayatPelObat = async () => {
  try {
    const payload = {
      TglMulai: formatDateForAPI(TanggalMulai.value),
      TglAkhir: formatDateForAPI(TanggalAkhir.value),
      nokartu: props.noka,
      id_client: id_client.value,
    }

    listRiwayatPelayanan.value = []

    console.log(JSON.stringify(payload))

    loadingRiwayatPel.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/riwayatobat_apol`, payload)
    console.log(response.data)

    loadingRiwayatPel.value = false //loading

    RiwayatPelObat.value = true //panggil form

    if (response.data.metaData.code == '200') {
      {
        listRiwayatPelayanan.value = response.data.response.list.history || []
      }
    } else {
      showWarning(response.data.metaData.message)
    }
  } catch (error) {
    console.error('Error searching medicines:', error)
    showError(error)
  } finally {
    loadingRiwayatPel.value = false
  }
}

const dataSetting = ref({
  kode: '',
  namaapoteker: '',
  namakepala: '',
  jabatankepala: '',
  nipkepala: '',
  siup: '',
  alamat: '',
  kota: '',
  namaverifikator: '',
  nppverifikator: '',
  namapetugasapotek: '',
  nippetugasapotek: '',
  checkstock: false,
})

const listResep = ref([])

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

const onObatSelected = () => {
  if (activeTab.value == '0') {
    arrObat.value.push({
      nosjp: selectedResep.value.NOAPOTIK,
      kode: selectedItemObat.value.kode,
      nama: selectedItemObat.value.nama,
      harga: selectedItemObat.value.harga,
      signa1: signa1.value,
      signa2: signa2.value,
      hari: hari.value,
      jumlah: jumlahObat.value,
      catatan: '',
      isDisabled: false,
      isLoading: false,
    })
  } else {
    arrObatRacikan.value.push({
      nosjp: selectedResep.value.NOAPOTIK,
      kode: selectedItemObat.value.kode,
      nama: selectedItemObat.value.nama,
      harga: selectedItemObat.value.harga,
      signa1: signa1.value,
      signa2: signa2.value,
      hari: hari.value,
      permintaan: permintaan.value,
      jumlah: jumlahObat.value,
      catatan: '',
      isDisabled: false,
      isLoading: false,
    })
  }
  // Reset form
  selectedItemObat.value = null
  signa1.value = ''
  signa2.value = ''
  hari.value = 0
  jumlahObat.value = 0
}

const loadingSimpanObat = ref(false)

const SimpanItemObat = async () => {
  try {
    if (!selectedResep.value) {
      showWarning('Pilih resep terlebih dahulu')
      return
    }

    if (!selectedItemObat.value) {
      showWarning('Pilih obat terlebih dahulu')
      return
    }
    if (!signa1.value || !signa2.value) {
      showWarning('Lengkapi semua field sebelum menambahkan obat')
      return
    }

    loadingSimpanObat.value = true

    const payLoad = {
      NOSJP: selectedResep.value.NOAPOTIK,
      KDOBT: selectedItemObat.value.kode,
      NMOBAT: selectedItemObat.value.nama,
      JNSROBT: 'R.01',
      NORESEP: selectedResep.value.NORESEP,
      SIGNA1OBT: parseInt(signa1.value) || 0,
      SIGNA2OBT: parseInt(signa2.value) || 0,
      HARI: parseInt(hari.value) || 0,
      JMLOBT: parseInt(jumlahObat.value) || 0,
      PERMINTAAN: parseInt(permintaan.value) || 0,
      JHO: parseInt(hari.value) || 0,
      CatKhsObt: '',
      id_client: id_client.value,
      JENISRESEP: activeTab.value == '0' ? 'NONRACIK' : 'RACIK',
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/simpan_obat_apol`, payLoad)

    if (response.data.metaData.code == '200') {
      //onObatSelected()
      riwayatobat_apol(TempResepLagiAdd)
      showSuccess()
    } else {
      showWarning(response.data.metaData.message)
    }

    loadingSimpanObat.value = false
  } catch (error) {
    console.error('Error searching medicines:', error)
    showError(error)
    availableObat.value = []
  } finally {
    loadingSimpanObat.value = false
  }
}

const hapusItemObat = async (index) => {
  try {
    if (!selectedResep.value?.NOAPOTIK || !selectedResep.value?.NORESEP) {
      showWarning('Data resep tidak lengkap')
      return
    }

    if (activeTab.value === '0') {
      if (!arrObat.value[index]?.kode) {
        showWarning('Kode obat tidak ditemukan')
        return
      }
    } else {
      if (!arrObatRacikan.value[index]?.kode) {
        showWarning('Kode obat tidak ditemukan')
        return
      }
    }

    const payload = {
      nosepapotek: selectedResep.value.NOAPOTIK,
      noresep: selectedResep.value.NORESEP,
      kodeobat:
        activeTab.value === '0' ? arrObat.value[index].kode : arrObatRacikan.value[index].kode,
      tipeobat: 'N',
      id_client: id_client.value,
    }

    console.log('payload hapus racik', payload)

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/hapus_item_obat`, payload)
    console.log(response.data)
    if (response.data?.metaData?.code === '200') {
      if (activeTab.value === '0') {
        arrObat.value.splice(index, 1)
      } else {
        arrObatRacikan.value.splice(index, 1)
      }
      showSuccess('Data berhasil dihapus')
    } else {
      showWarning(response.data?.metaData?.message || 'Gagal menghapus data')
    }
  } catch (error) {
    console.error('Error hapus item obat:', error)
    showWarning('Terjadi kesalahan saat menghapus data')
  }
}

const TempResepLagiAdd = ref(null)

const addResep = async (data) => {
  TempResepLagiAdd.value = data
  selectedResep.value = data
  showAddResep.value = true
  arrObat.value = []
  arrObatRacikan.value = []
  await riwayatobat_apol(data)
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
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
    console.error('Error formatting datetime:', error)
    return null
  }
}

const getSettingApol = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/bpjs_api/get_settingppk/${id_client.value}`,
    )
    dataSetting.value = response.data.response
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal mengambil setting apotek')
  } finally {
    loading.value = false
  }
}

const GetResep = async () => {
  try {
    loading.value = true

    const payLoad = {
      kdppk: dataSetting.value.kode,
      KdJnsObat: JenisObatSelected.value.code,
      JnsTgl: jenisTanggalSelected.value.kode,
      TglMulai: formatDateForAPI(TanggalMulai.value),
      TglAkhir: formatDateForAPI(TanggalAkhir.value),
      id_client: id_client.value,
    }

    console.log('Payload:', payLoad)

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/list_resep_apol`, payLoad)

    console.log('Response:', response.data)

    if (response.data.metaData.code === '200') {
      listResep.value = response.data.response || []
      //showSuccess('Data berhasil dimuat')
      //riwayatobat_apol(TempResepLagiAdd)
    } else {
      showWarning(response.data.metaData.message)
      listResep.value = []
    }
  } catch (error) {
    console.error('Error fetching resep:', error)
    showError(error)
    listResep.value = []
  } finally {
    loading.value = false
  }
}

const listRiwayatObat = ref([])

const formatDateForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error('Date formatting error:', error)
    return null
  }
}

const loadingTable = ref(false)

const loadingRefresh = ref(false)
const riwayatobat_apol = async (data) => {
  try {
    loadingRefresh.value = true

    const payLoad = {
      kdppk: dataSetting.value.kode,
      TglMulai: formatDateForAPI(TanggalMulai.value),
      TglAkhir: formatDateForAPI(TanggalAkhir.value),
      nokartu: data.NOKARTU,
      nosep: data.NOAPOTIK,
      id_client: id_client.value,
    }

    console.log('jam', payLoad)

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/riwayatobat_details`, payLoad)

    console.log('response riwayat:', response.data)
    if (response.data.response?.listobat.length > 0) {
      arrObat.value = []
      arrObatRacikan.value = []
      listRiwayatObat.value = response.data.response.listobat || []
      console.log('list obat', listRiwayatObat.value)
      listRiwayatObat.value.forEach((element) => {
        if (element.permintaan == null) {
          arrObat.value.push({
            nosjp: '',
            kode: element.kodeobat,
            nama: element.namaobat,
            tipeobat: element.tipeobat,
            harga: element.harga,
            signa1: element.signa1,
            signa2: element.signa2,
            hari: element.hari,
            jumlah: element.jumlah,
            catatan: element.CatKhsObt || '',
          })
        } else {
          arrObatRacikan.value.push({
            nosjp: '',
            kode: element.kodeobat,
            nama: element.namaobat,
            tipeobat: element.tipeobat,
            harga: element.harga,
            signa1: element.signa1,
            signa2: element.signa2,
            hari: element.hari,
            permintaan: element.permintaan,
            jumlah: element.jumlah,
            catatan: element.CatKhsObt || '',
          })
        }
      })
      //showSuccess('Data berhasil dimuat')
      listRiwayatObat.value = false
    } else {
      showWarning(response.data.metaData.message)
      listRiwayatObat.value = []
      listRiwayatObat.value = false
    }

    loadingRefresh.value = false
  } catch (error) {
    console.error('Error fetching resep:', error)
    showError(error)
    listRiwayatObat.value = []
  } finally {
    loadingTable.value = false
  }
}

const searchItemObat = async (event) => {
  try {
    const query = event.value
    searchQuery.value = query

    if (!query || query.length < 2) {
      availableObat.value = []
      return
    }

    const payload = {
      kd_jenis_resep: 2,
      key_word: query,
      tanggal_resep: selectedResep.value?.TGLRESEP,
      id_client: id_client.value,
    }

    loadingObatonly.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/obat`, payload)

    console.log(response.data)

    if (response.data?.response && Array.isArray(response.data.response.list)) {
      availableObat.value = response.data.response.list
    } else {
      availableObat.value = []
    }
  } catch (error) {
    console.error('Error searching medicines:', error)
    showError(error)
    availableObat.value = []
  } finally {
    loadingObatonly.value = false
  }
}

const confirmDelete = (data) => {
  selectedResep.value = data
  deleteDialog.value = true
}

const deleteResep = async () => {
  try {
    deleting.value = true

    const payLoad = {
      nosjp: selectedResep.value.NOAPOTIK,
      refasalsjp: selectedResep.value.NOSEP_KUNJUNGAN,
      noresep: selectedResep.value.NORESEP,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/hapusResep`, payLoad)
    console.log(response.data)

    if (response.data.metaData.code === '200') {
      showSuccess('Resep berhasil dihapus')
      deleteDialog.value = false
      selectedResep.value = null
      await GetResep()
    } else {
      showError(response.data.metaData.message || 'Gagal menghapus resep')
    }
  } catch (error) {
    console.error('Error deleting resep:', error)
    showError('Gagal menghapus resep')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await getSettingApol()
  await GetResep()
})
</script>

<style scoped>
.confirmation-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

.detail-section {
  padding: 1rem 0;
}

.detail-section h3 {
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.detail-item span {
  color: #333;
}
</style>
