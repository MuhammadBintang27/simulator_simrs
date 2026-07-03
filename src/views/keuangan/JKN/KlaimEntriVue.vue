<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :style="{ width: '900px' }"
    :breakpoints="{ '960px': '96vw', '768px': '99vw' }"
    :closable="true"
    :draggable="false"
    header="Entri Klaim JKN"
    @hide="onHide"
  >
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0"><i class="fas fa-file-medical mr-2"></i>Entri Klaim</Tab>
        <Tab value="1" @click="showResume = true"
          ><i class="fas fa-clipboard-list mr-2"></i>Resume Klaim</Tab
        >
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <!-- Loading skeleton -->
          <div v-if="loading" class="ke-body">
            <div v-for="i in 4" :key="i" class="mb-3">
              <Skeleton width="30%" height="0.8rem" class="mb-2" />
              <Skeleton width="80%" height="1.2rem" />
            </div>
          </div>

          <!-- Content -->
          <div v-else-if="klaimData" class="ke-body">
            <!-- Info strip -->
            <div class="ke-info-strip">
              <div class="ke-strip-item">
                <span class="ke-strip-lbl">No SEP</span>
                <div class="ke-copy-row">
                  <span class="ke-strip-val">{{ klaimData.NOSEP }}</span>
                  <button
                    class="ke-copy-btn"
                    @click="copyText(klaimData.NOSEP)"
                    :title="'Salin: ' + klaimData.NOSEP"
                  >
                    <i :class="copiedKey === klaimData.NOSEP ? 'pi pi-check' : 'pi pi-copy'"></i>
                  </button>
                </div>
              </div>
              <div class="ke-strip-item">
                <span class="ke-strip-lbl">Jenis Rawat</span>
                <span class="ke-strip-val">{{ klaimData.JENIS_RAWAT }}</span>
              </div>
              <div class="ke-strip-item">
                <span class="ke-strip-lbl">Tgl Grouper</span>
                <span class="ke-strip-val">{{ klaimData.TGLGROUPER }}</span>
              </div>
              <div class="ke-strip-item">
                <span class="ke-strip-lbl">User</span>
                <span class="ke-strip-val">{{ klaimData.USER }}</span>
              </div>
            </div>

            <!-- CBG Info -->
            <div class="ke-cbg-row">
              <div class="ke-cbg-card ke-cbg-code">
                <span class="ke-cbg-lbl">Kode CBG</span>
                <span class="ke-cbg-val">{{ klaimData.CODE }}</span>
              </div>
              <div class="ke-cbg-card ke-cbg-desc">
                <span class="ke-cbg-lbl">Deskripsi</span>
                <span class="ke-cbg-val">{{ klaimData.DESKRIPSI }}</span>
              </div>
              <div class="ke-cbg-card ke-cbg-tarif">
                <span class="ke-cbg-lbl">Tarif RS</span>
                <span class="ke-cbg-val">{{
                  formatCurrency(lpkRincian.reduce((s, r) => s + (r.TOTAL || 0), 0))
                }}</span>
              </div>
              <div class="ke-cbg-card ke-cbg-tarif2">
                <span class="ke-cbg-lbl">Tarif CBG</span>
                <span class="ke-cbg-val font-bold">{{ formatCurrency(klaimData.TARIFCBG) }}</span>
              </div>
              <div class="ke-cbg-card ke-cbg-total">
                <span class="ke-cbg-lbl">Total Tarif</span>
                <span class="ke-cbg-val font-bold text-green-700">{{
                  formatCurrency(klaimData.TOTAL_TARIF)
                }}</span>
              </div>
            </div>

            <!-- Status Klaim -->
            <div class="ke-status-row">
              <div class="ke-status-item">
                <span class="ke-strip-lbl">Status Final Claim</span>
                <Tag :value="klaimData.SUDAHFINALCLAIM || '-'" severity="info" />
              </div>
              <div class="ke-status-item">
                <span class="ke-strip-lbl">Versi INACBG</span>
                <span class="ke-strip-val text-xs text-muted">{{ klaimData.VERSI_INACBG }}</span>
              </div>
              <div class="ke-status-item">
                <span class="ke-strip-lbl">Sistole / Diastole</span>
                <span class="ke-strip-val">{{ klaimData.SISTOLE }} / {{ klaimData.DIASTOLE }}</span>
              </div>
            </div>

            <!-- Info Pasien LPK -->
            <div v-if="lpkData" class="ke-section">
              <div class="ke-section-header">
                <i class="fas fa-user-injured mr-2"></i> Info Pasien
              </div>
              <div class="ke-lpk-grid">
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">Dokter</span>
                  <span class="ke-strip-val">{{ lpkData.NAMADOKTER }}</span>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">No Jaminan</span>
                  <span class="ke-strip-val">{{ lpkData.NOJAMINAN }}</span>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">Tgl Masuk</span>
                  <span class="ke-strip-val">{{ lpkData.MASUK }}</span>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">Tgl Keluar</span>
                  <span class="ke-strip-val">{{ lpkData.KELUAR }}</span>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">LOS (Hari)</span>
                  <span class="ke-strip-val">{{ lpkData.LOS }}</span>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">Kelas</span>
                  <span class="ke-strip-val">{{ lpkData.KELAS }}</span>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">Status Pulang</span>
                  <span class="ke-strip-val">{{ lpkData.PULANG }}</span>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">NO SITB</span>
                  <div class="ke-copy-row">
                    <span class="ke-strip-val">{{ no_sitb || '-' }}</span>
                    <button
                      v-if="no_sitb"
                      class="ke-copy-btn"
                      @click="copyText(no_sitb)"
                      :title="'Salin: ' + no_sitb"
                    >
                      <i :class="copiedKey === no_sitb ? 'pi pi-check' : 'pi pi-copy'"></i>
                    </button>
                  </div>
                </div>
                <div class="ke-lpk-item">
                  <span class="ke-strip-lbl">Tarif RS</span>
                  <span class="ke-strip-val">{{
                    formatCurrency(lpkRincian.reduce((s, r) => s + (r.TOTAL || 0), 0))
                  }}</span>
                </div>
              </div>
            </div>
            <!-- Diagnosa -->
            <div class="ke-section">
              <div class="ke-section-header"><i class="fas fa-stethoscope mr-2"></i> Diagnosa</div>
              <DataTable
                :value="klaimData.dx"
                class="p-datatable-sm"
                showGridlines
                stripedRows
                :paginator="false"
                emptyMessage="Tidak ada data diagnosa"
              >
                <Column field="JENIS_DIAGNOSA" header="Jenis" style="min-width: 130px" />
                <Column field="KODE_DIAGNOSA" header="Kode" style="min-width: 100px">
                  <template #body="{ data }">
                    <div class="ke-copy-row">
                      <span>{{ data.KODE_DIAGNOSA }}</span>
                      <button
                        class="ke-copy-btn"
                        @click="copyText(data.KODE_DIAGNOSA)"
                        :title="'Salin: ' + data.KODE_DIAGNOSA"
                      >
                        <i
                          :class="copiedKey === data.KODE_DIAGNOSA ? 'pi pi-check' : 'pi pi-copy'"
                        ></i>
                      </button>
                    </div>
                  </template>
                </Column>
                <Column field="NAMA_DIAGNOSA" header="Nama Diagnosa" style="min-width: 200px" />
              </DataTable>
            </div>

            <!-- Prosedur -->
            <div class="ke-section">
              <div class="ke-section-header"><i class="fas fa-procedures mr-2"></i> Prosedur</div>
              <DataTable
                :value="klaimData.proc"
                class="p-datatable-sm"
                showGridlines
                stripedRows
                :paginator="false"
                emptyMessage="Tidak ada data prosedur"
              >
                <Column field="KODE_TINDAKAN" header="Kode" style="min-width: 80px" />
                <Column field="NAMA_TINDAKAN" header="Nama Prosedur" style="min-width: 200px" />
              </DataTable>
            </div>

            <!-- Rincian Biaya -->
            <div v-if="lpkRincian && lpkRincian.length" class="ke-section">
              <div class="ke-section-header"><i class="fas fa-receipt mr-2"></i> Rincian Biaya</div>
              <DataTable
                :value="lpkRincian"
                class="p-datatable-sm"
                showGridlines
                stripedRows
                :paginator="false"
              >
                <Column field="GROUPCBG" header="Kelompok" style="min-width: 150px" />
                <Column field="TOTAL" header="Total" style="min-width: 120px; text-align: right">
                  <template #body="{ data }">
                    <strong>{{ formatCurrency(data.TOTAL) }}</strong>
                  </template>
                </Column>
              </DataTable>
              <div class="ke-rincian-total">
                <span>Total Keseluruhan</span>
                <strong>{{
                  formatCurrency(lpkRincian.reduce((s, r) => s + (r.TOTAL || 0), 0))
                }}</strong>
              </div>
            </div>

            <!-- Lampiran File -->
            <div class="ke-section">
              <div class="ke-section-header">
                <i class="fas fa-paperclip mr-2"></i> Lampiran File
              </div>
              <div v-if="loadingLampiran" class="ke-lampiran-grid">
                <Skeleton v-for="i in 3" :key="i" width="120px" height="90px" border-radius="8px" />
              </div>
              <div v-else-if="lampiranList.length" class="ke-lampiran-grid">
                <div v-for="item in lampiranList" :key="item.id" class="ke-lampiran-item">
                  <Image
                    :src="item.file_lampiran"
                    :alt="item.caption_file"
                    width="120"
                    preview
                    imageStyle="width:120px;height:90px;object-fit:cover;border-radius:6px;cursor:pointer;"
                  />
                  <span class="ke-lampiran-caption">{{ item.caption_file }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-gray-400 mt-2">Tidak ada lampiran</p>
            </div>
          </div>

          <!-- Error state -->
          <div v-else class="ke-empty">
            <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #dc2626"></i>
            <p>Gagal memuat data klaim</p>
          </div>
        </TabPanel>
        <TabPanel value="1" />
      </TabPanels>
    </Tabs>

    <KlaimResumeComponent
      v-model:showKlaim="showResume"
      :datapasien="props.datapasien"
      @update:showKlaim="
        (v) => {
          if (!v) activeTab = '0'
        }
      "
    />

    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        severity="secondary"
        outlined
        @click="visible = false"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import Image from 'primevue/image'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import KlaimResumeComponent from '@/components/Keuangan/KlaimResumeComponent.vue'

const props = defineProps({
  showDialog: { type: Boolean, default: false },
  datapasien: { type: Object, default: null },
})

const emit = defineEmits(['update:showDialog'])

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const visible = ref(false)
const loading = ref(false)
const klaimData = ref(null)
const lpkData = ref(null)
const lpkRincian = ref([])
const lampiranList = ref([])
const loadingLampiran = ref(false)
const activeTab = ref('0')
const showResume = ref(false)

watch(
  () => props.showDialog,
  (val) => {
    visible.value = val
    if (val && props.datapasien?.NOSEP) {
      fetchAll(props.datapasien.NOSEP, props.datapasien.NOMR, props.datapasien.NOPENDAFTARAN)
    }
  },
)

watch(visible, (val) => {
  if (!val) emit('update:showDialog', false)
})

const no_sitb = ref(null)

const fetchAll = async (nosep, nomr, noreg) => {
  loading.value = true
  klaimData.value = null
  lpkData.value = null
  lpkRincian.value = []
  lampiranList.value = []
  const url = configStore.apiBaseUrl
  try {
    const [resKlaim, resLpk] = await Promise.all([
      axios.get(`${url}/index.php/api/transaksi_pasien/get_data_klaim/${nosep}/${id_client.value}`),
      axios.get(
        `${url}/index.php/api/laporan/get_data_lpk_pasien/${nosep}/${nomr}/${id_client.value}`,
      ),
    ])

    klaimData.value = resKlaim.data?.data ?? null
    lpkData.value = resLpk.data?.response ?? null

    no_sitb.value = resLpk.data?.sitb ?? null

    console.log('sitb', no_sitb.value)

    lpkRincian.value = resLpk.data?.rincian ?? []
  } catch (e) {
    klaimData.value = null
  } finally {
    loading.value = false
  }

  if (noreg) {
    loadingLampiran.value = true
    try {
      const resLampiran = await axios.post(
        `${url}/index.php/api/data_referensi/getlampiran_upload`,
        { id_client: id_client.value, noregister: noreg },
      )
      lampiranList.value = resLampiran.data?.response ?? []
    } catch {
      lampiranList.value = []
    } finally {
      loadingLampiran.value = false
    }
  }
}

const onHide = () => {
  emit('update:showDialog', false)
  klaimData.value = null
  lpkData.value = null
  lpkRincian.value = []
  lampiranList.value = []
  activeTab.value = '0'
  showResume.value = false
}

const copiedKey = ref(null)
const copyText = (text) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  copiedKey.value = text
  setTimeout(() => (copiedKey.value = null), 1500)
}

const formatCurrency = (value) => {
  if (value == null || value === '') return '-'
  return new Intl.NumberFormat('id-ID', { style: 'decimal', minimumFractionDigits: 0 }).format(
    value,
  )
}
</script>

<style scoped>
.ke-body {
  padding: 4px 0;
}

.ke-info-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border: 1px solid #b2c8dd;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}
.ke-strip-item {
  flex: 1;
  min-width: 140px;
  padding: 8px 14px;
  border-right: 1px solid #dde8f4;
  background: #f0f6ff;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ke-strip-item:last-child {
  border-right: none;
}
.ke-strip-lbl {
  font-size: 10px;
  font-weight: 700;
  color: #4a7ab5;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ke-strip-val {
  font-size: 12px;
  font-weight: 600;
  color: #162d4e;
}

.ke-copy-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.ke-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #b2c8dd;
  border-radius: 4px;
  color: #6c757d;
  cursor: pointer;
  padding: 1px 5px;
  font-size: 11px;
  line-height: 1;
  transition:
    color 0.15s,
    border-color 0.15s,
    background 0.15s;
  flex-shrink: 0;
}
.ke-copy-btn:hover {
  color: #1a6b4a;
  border-color: #1a6b4a;
  background: #f0fdf4;
}
.ke-copy-btn .pi-check {
  color: #1a6b4a;
}

.ke-cbg-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.ke-cbg-card {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: 1px solid transparent;
}
.ke-cbg-lbl {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.7;
}
.ke-cbg-val {
  font-size: 13px;
  font-weight: 600;
}
.ke-cbg-code {
  background: #e8f0fe;
  border-color: #9bbce8;
  color: #1a3a5f;
}
.ke-cbg-desc {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #111827;
  flex: 2;
}
.ke-cbg-tarif {
  background: #fff8e1;
  border-color: #fdd835;
  color: #6a4a08;
}
.ke-cbg-tarif2 {
  background: #e8f5e9;
  border-color: #81c784;
  color: #1e5c38;
}
.ke-cbg-total {
  background: #daf0e6;
  border-color: #4caf50;
  color: #1b5e20;
}

.ke-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 8px 12px;
  background: #fafbfc;
  border: 1px solid #dde8f4;
  border-radius: 6px;
  margin-bottom: 12px;
}
.ke-status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ke-section {
  margin-bottom: 12px;
}
.ke-section-header {
  font-size: 12px;
  font-weight: 700;
  color: #162d4e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 6px 10px;
  background: #e6edf7;
  border-radius: 4px 4px 0 0;
  border: 1px solid #b2c8dd;
  border-bottom: none;
}

.ke-lpk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #b2c8dd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}
.ke-lpk-item {
  padding: 7px 12px;
  border-right: 1px solid #dde8f4;
  border-bottom: 1px solid #dde8f4;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #fafbfc;
}
.ke-lpk-item:nth-child(3n) {
  border-right: none;
}

.ke-rincian-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: #e6edf7;
  border: 1px solid #b2c8dd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  font-size: 12px;
  color: #162d4e;
}
.ke-rincian-total strong {
  font-size: 13px;
}

.ke-empty {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.ke-lampiran-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 8px 0;
}
.ke-lampiran-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.ke-lampiran-caption {
  font-size: 10px;
  color: #4a7ab5;
  max-width: 120px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #edf3fa;
  color: #162d4e;
  font-size: 11px;
  padding: 6px 10px;
}
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  font-size: 12px;
  padding: 5px 10px;
}
</style>
