<template>
  <loading_overlay :is-loading="loadingSpinner" message="Silahkan menunggu...." />
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

  <div class="content">
    <!-- ===== BANNER TRANSAKSI ===== -->
    <BannerTransaksiRanap :datapasien="datapasien" :stts-verif="sttsVerif" />

    <div class="row align-items-start">
      <!-- ===== PANEL KIRI — INFO PASIEN ===== -->
      <div class="col-md-2 side-sticky">
        <Panel>
          <template #header>
            <Button
              label="Kembali"
              icon="pi pi-arrow-left"
              @click="go_to_list_pasien"
              class="btn-theme-outline"
              style="height: 30px"
            />
          </template>

          <img
            src="https://ws-simrs.net/ilustration/ilustrasi1.png"
            height="130"
            width="195"
            alt=""
          />
          <hr class="my-2" />

          <div class="patient-card">
            <div class="patient-name">
              <strong>{{ datapasien?.NAMAPASIEN || 'Memuat...' }}</strong>
              <i
                v-if="datapasien"
                :class="datapasien?.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                :style="{
                  fontSize: '13px',
                  color: datapasien?.JENISKELAMIN === 'P' ? '#f472b6' : '#60a5fa',
                  marginLeft: '4px',
                }"
              />
            </div>

            <dl class="patient-details">
              <dt>Usia</dt>
              <dd>
                {{ datapasien?.USIA_PASIEN?.tahun ?? '-' }} Thn,
                {{ datapasien?.USIA_PASIEN?.bulan ?? '-' }} Bln
              </dd>
              <dt>No. MR</dt>
              <dd>{{ datapasien?.NOMR || '-' }}</dd>
              <dt>No. Register</dt>
              <dd>{{ datapasien?.NOPENDAFTARAN || '-' }}</dd>
              <dt>Ruangan</dt>
              <dd>
                <strong>{{ datapasien?.POLI || '-' }}</strong>
              </dd>
              <dt>DPJP</dt>
              <dd>{{ datapasien?.NAMADOKTER || '-' }}</dd>
              <dt>Tgl Masuk</dt>
              <dd>{{ datapasien?.MASUKPOLY || '-' }}</dd>
              <dt>Cara Bayar</dt>
              <dd>
                {{ datapasien?.CARABAYAR || '-' }}
                <span v-if="datapasien?.NOSEP" class="sep-chip-sm d-block mt-1">
                  {{ datapasien.NOSEP }}
                </span>
              </dd>
            </dl>

            <div v-if="sttsVerif" class="verif-badge mt-2">
              <i class="pi pi-verified mr-1"></i>{{ sttsVerif }}
            </div>
            <small v-if="form.last_update" class="last-update-text mt-1 d-block">
              <i class="far fa-clock mr-1"></i>{{ form.last_update }}
            </small>
          </div>
        </Panel>
      </div>

      <!-- ===== PANEL KANAN — FORM DIAGNOSA ===== -->
      <div class="col-md-10">
        <div class="row">
          <div class="col-md-12 mt-1">
            <Tabs v-model:value="activeTab" scrollable>
              <TabList>
                <Tab value="0"> <i class="fas fa-diagnoses mr-1"></i> DIAGNOSA AKHIR DPJP </Tab>
              </TabList>

              <TabPanels>
                <!-- ===== TAB 0: DIAGNOSA AKHIR ===== -->
                <TabPanel value="0">
                  <!-- Diagnosa Utama & Penyerta -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-stethoscope mr-2"></i>DIAGNOSA</strong>
                      </h6>
                    </template>
                    <div class="row">
                      <div class="col-md-6">
                        <label style="color: darkblue">
                          Diagnosa Utama <span class="text-danger">*</span>
                        </label>
                        <Textarea
                          v-model="form.dx_utama"
                          class="custom-textarea mt-1"
                          :rows="8"
                          placeholder="Contoh: Stroke Hemoragik (I61), Hipertensi Emergency (I10)..."
                          :class="{ 'p-invalid': submitted && !form.dx_utama.trim() }"
                        />
                        <small
                          v-if="submitted && !form.dx_utama.trim()"
                          class="p-error d-block mt-1"
                        >
                          Diagnosa utama wajib diisi.
                        </small>
                        <small class="help-text">
                          <i class="fas fa-info-circle mr-1"></i>
                          Diagnosis utama alasan pasien dirawat. Dapat disertai kode ICD-10.
                        </small>
                      </div>
                      <div class="col-md-6">
                        <label style="color: darkblue">Diagnosa Penyerta &amp; Komplikasi</label>
                        <Textarea
                          v-model="form.dx_sekunder"
                          class="custom-textarea mt-1"
                          :rows="8"
                          placeholder="Contoh: Diabetes Mellitus Tipe 2 (E11), Gagal Ginjal Kronik (N18.3)..."
                        />
                        <small class="help-text">
                          <i class="fas fa-info-circle mr-1"></i>
                          Penyakit penyerta atau komplikasi. Pisahkan dengan koma atau baris baru.
                        </small>
                      </div>
                    </div>
                  </Panel>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== STICKY ACTION BAR ===== -->
  <div class="sticky-action-bar">
    <div class="sticky-bar-left">
      <span v-if="sttsVerif" class="draft-status-chip draft-saved">
        <i class="pi pi-verified"></i> {{ sttsVerif }}
      </span>
      <span v-else class="draft-status-chip draft-clean">
        <i class="pi pi-file"></i> Belum diotorisasi
      </span>
    </div>
    <div class="sticky-bar-right">
      <Button
        label="Simpan Diagnosa"
        size="small"
        icon="pi pi-save"
        class="btn-theme-solid"
        :loading="saving"
        :disabled="saving"
        @click="simpanDiagnosa"
      />
    </div>
  </div>

  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import ProgressBar from 'primevue/progressbar'
import Toast from 'primevue/toast'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

const props = defineProps({
  datapasienProp: { type: Object, default: null },
  noregisterProp: { type: String, default: '' },
  isEmbedded: { type: Boolean, default: false },
})

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const loadingSpinner = ref(false)
const saving = ref(false)
const submitted = ref(false)
const sttsVerif = ref('')
const datapasien = ref(props.datapasienProp || null)
const activeTab = ref('0')

const noregister = props.noregisterProp || route.params?.noregister || ''

const form = ref({
  dx_utama: '',
  dx_sekunder: '',
  last_update: '',
})

const baseUrl = () => configStore.apiBaseUrl

const go_to_list_pasien = () => {
  window.close()
}

const fetchDataPasien = async () => {
  if (!noregister || datapasien.value) return
  try {
    const res = await axios.post(`${baseUrl()}/index.php/api/transaksi_pasien/history_versi4`, {
      mod: 1,
      noregister,
      id_client: id_client.value,
    })
    if (res.data.response?.length > 0) {
      datapasien.value = res.data.response[0]
    }
  } catch (e) {
    console.error('fetchDataPasien:', e)
  }
}

const fetchDiagnosa = async () => {
  if (!noregister) return
  loading.value = true
  loadingSpinner.value = true
  try {
    const res = await axios.post(`${baseUrl()}/index.php/api/Triaseigd/get_diagnosa_dokter`, {
      noregister,
      id_client: id_client.value,
    })
    const r = res.data?.response
    if (r) {
      form.value.dx_utama = r.dx_utama || ''
      form.value.dx_sekunder = r.dx_sekunder || ''
      form.value.last_update = r.last_update || ''
      sttsVerif.value = r.telah_verif || ''
    }
  } catch (e) {
    console.error('fetchDiagnosa:', e)
  } finally {
    loading.value = false
    loadingSpinner.value = false
  }
}

const simpanDiagnosa = async () => {
  submitted.value = true
  if (!form.value.dx_utama.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Diagnosa utama wajib diisi.',
      life: 4000,
    })
    return
  }
  saving.value = true
  try {
    const payload = {
      noregister,
      nomr: datapasien.value?.NOMR || '',
      dx_utama: form.value.dx_utama,
      dx_sekunder: form.value.dx_sekunder,
      id_client: id_client.value,
    }
    const res = await axios.post(
      `${baseUrl()}/index.php/api/Triaseigd/simpan_diagnosan_dokter`,
      payload,
    )
    const meta = res.data?.metadata || res.data
    if (meta?.code == 200 || meta?.status == 'success' || res.data?.status == 1) {
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: meta?.message || 'Diagnosa berhasil disimpan.',
        life: 3000,
      })
      submitted.value = false
      fetchDiagnosa()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: meta?.message || 'Terjadi kesalahan saat menyimpan.',
        life: 4000,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyimpan: ' + (e.message || ''),
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchDataPasien()
  fetchDiagnosa()
})
</script>

<style scoped>
/* ===== SIDEBAR PASIEN ===== */
.side-sticky {
  position: static;
  align-self: flex-start;
}

.patient-card {
  padding: 0;
}
.patient-name {
  font-size: 13px;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.4;
}
.patient-details {
  margin: 0;
}
.patient-details dt {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #94a3b8;
  margin-top: 6px;
}
.patient-details dd {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
}
.sep-chip-sm {
  display: inline-block;
  font-size: 10px;
  background: #e0f2fe;
  border: 1px solid #7dd3fc;
  border-radius: 4px;
  padding: 0 5px;
  color: #0369a1;
  line-height: 1.6;
}

.verif-badge {
  display: inline-flex;
  align-items: center;
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
}

.last-update-text {
  font-size: 11px;
  color: #94a3b8;
}

/* ===== FORM ===== */
.custom-textarea {
  font-size: 13px !important;
  line-height: 1.3;
  width: 100%;
  padding: 10px !important;
}

label {
  font-size: 13px;
}

:deep(.p-inputtext) {
  font-size: 14px;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #6c757d;
  font-style: italic;
  line-height: 1.5;
}

/* ===== STICKY ACTION BAR ===== */
.content {
  padding-bottom: 70px;
}

.sticky-action-bar {
  position: fixed;
  bottom: 0;
  left: 250px;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  padding: 0.6rem 1.5rem;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  transition: left 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.sticky-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.sticky-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.draft-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 11px;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-weight: 500;
  white-space: nowrap;
}
.draft-saved {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}
.draft-clean {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

/* ===== TOMBOL TEMA DARKCYAN ===== */
.btn-theme-solid {
  background: darkcyan !important;
  border-color: darkcyan !important;
  color: #fff !important;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 20px;
  padding: 0.28rem 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.btn-theme-solid:hover:not(:disabled) {
  background: #006666 !important;
  border-color: #006666 !important;
}
.btn-theme-solid:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-theme-outline {
  background: transparent !important;
  border: 1px solid darkcyan !important;
  color: darkcyan !important;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 20px;
  padding: 0.28rem 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition:
    background 0.15s,
    color 0.15s;
}
.btn-theme-outline:hover {
  background: rgba(0, 139, 139, 0.08) !important;
}
</style>

<style>
body.sb-collapsed .sticky-action-bar {
  left: 64px;
}
@media (max-width: 768px) {
  .sticky-action-bar {
    left: 0 !important;
  }
}
</style>
