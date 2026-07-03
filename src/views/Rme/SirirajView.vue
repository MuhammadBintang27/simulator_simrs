<template>
  <loading_overlay :is-loading="loadingSiriraj" message="Silahkan menunggu...." />
  <ProgressBar v-if="loadingPatient" mode="indeterminate" style="height: 3px" />

  <div class="content">
    <!-- ===== BANNER TRANSAKSI ===== -->
    <BannerTransaksiRanap :datapasien="datapasien" />

    <div class="row align-items-start">
      <!-- ===== PANEL KIRI — INFO PASIEN ===== -->
      <div class="col-md-2 side-sticky">
        <Panel>
          <template #header>
            <Button
              label="Kembali"
              icon="pi pi-arrow-left"
              @click="go_back"
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
                <strong>{{ datapasien?.POLI || datapasien?.NAMARUANG || '-' }}</strong>
              </dd>
              <dt>DPJP</dt>
              <dd>{{ datapasien?.NAMADOKTER || '-' }}</dd>
              <dt>Tgl Masuk</dt>
              <dd>{{ datapasien?.MASUKPOLY || datapasien?.TGLMASUK || '-' }}</dd>
              <dt>Cara Bayar</dt>
              <dd>
                {{ datapasien?.CARABAYAR || '-' }}
                <span v-if="datapasien?.NOSEP" class="sep-chip-sm d-block mt-1">
                  {{ datapasien.NOSEP }}
                </span>
              </dd>
            </dl>
          </div>
        </Panel>
      </div>

      <!-- ===== PANEL KANAN — FORM SIRIRAJ ===== -->
      <div class="col-md-10">
        <div class="row">
          <div class="col-md-12 mt-1">
            <Tabs v-model:value="activeTab" scrollable>
              <TabList>
                <Tab value="0"> <i class="fas fa-brain mr-1"></i> SIRIRAJ STROKE SCORE </Tab>
              </TabList>

              <TabPanels>
                <TabPanel value="0">
                  <!-- Tabel Parameter -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong>
                          <i class="fas fa-file-medical mr-2"></i>KALKULATOR SIRIRAJ STROKE SCORE
                        </strong>
                      </h6>
                    </template>

                    <table class="siriraj-table w-100">
                      <thead>
                        <tr>
                          <th style="width: 32%">Parameter</th>
                          <th>Pilihan Jawaban</th>
                          <th style="width: 10%" class="text-center">Nilai</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Derajat Kesadaran -->
                        <tr>
                          <td class="param-label"><b>Derajat Kesadaran</b></td>
                          <td>
                            <div class="radio-group">
                              <label class="radio-item">
                                <RadioButton
                                  inputId="c0"
                                  name="cons"
                                  value="0"
                                  v-model="siriraj.consciousness"
                                />
                                <span for="c0">Sadar Penuh</span>
                              </label>
                              <label class="radio-item">
                                <RadioButton
                                  inputId="c1"
                                  name="cons"
                                  value="1"
                                  v-model="siriraj.consciousness"
                                />
                                <span for="c1">Somnolen</span>
                              </label>
                              <label class="radio-item">
                                <RadioButton
                                  inputId="c2"
                                  name="cons"
                                  value="2"
                                  v-model="siriraj.consciousness"
                                />
                                <span for="c2">Semi-koma / Koma</span>
                              </label>
                            </div>
                          </td>
                          <td class="text-center score-val">{{ siriraj.consciousness }}</td>
                        </tr>

                        <!-- Muntah Proyektil -->
                        <tr>
                          <td class="param-label">
                            <b>Muntah Proyektil</b>
                            <small class="d-block param-hint">Dalam 2 jam setelah onset</small>
                          </td>
                          <td>
                            <div class="radio-group">
                              <label class="radio-item">
                                <RadioButton
                                  inputId="v0"
                                  name="vomit"
                                  value="0"
                                  v-model="siriraj.vomit"
                                />
                                <span>Tidak</span>
                              </label>
                              <label class="radio-item">
                                <RadioButton
                                  inputId="v1"
                                  name="vomit"
                                  value="1"
                                  v-model="siriraj.vomit"
                                />
                                <span>Ya</span>
                              </label>
                            </div>
                          </td>
                          <td class="text-center score-val">{{ siriraj.vomit }}</td>
                        </tr>

                        <!-- Sakit Kepala -->
                        <tr>
                          <td class="param-label">
                            <b>Sakit Kepala Hebat</b>
                            <small class="d-block param-hint">Dalam 2 jam setelah onset</small>
                          </td>
                          <td>
                            <div class="radio-group">
                              <label class="radio-item">
                                <RadioButton
                                  inputId="h0"
                                  name="headache"
                                  value="0"
                                  v-model="siriraj.headache"
                                />
                                <span>Tidak</span>
                              </label>
                              <label class="radio-item">
                                <RadioButton
                                  inputId="h1"
                                  name="headache"
                                  value="1"
                                  v-model="siriraj.headache"
                                />
                                <span>Ya</span>
                              </label>
                            </div>
                          </td>
                          <td class="text-center score-val">{{ siriraj.headache }}</td>
                        </tr>

                        <!-- Tekanan Darah Diastolik -->
                        <tr>
                          <td class="param-label"><b>Tekanan Darah Diastolik</b></td>
                          <td>
                            <InputGroup style="max-width: 220px">
                              <InputNumber
                                v-model="siriraj.diastolic"
                                :min="0"
                                :max="300"
                                placeholder="0"
                                inputClass="text-center"
                              />
                              <InputGroupAddon>mmHg</InputGroupAddon>
                            </InputGroup>
                          </td>
                          <td class="text-center score-val">{{ siriraj.diastolic ?? 0 }}</td>
                        </tr>

                        <!-- Penanda Ateroma -->
                        <tr>
                          <td class="param-label">
                            <b>Penanda Ateroma</b>
                            <small class="d-block param-hint">DM, Angina, atau Klaudikasio</small>
                          </td>
                          <td>
                            <div class="radio-group">
                              <label class="radio-item">
                                <RadioButton
                                  inputId="a0"
                                  name="ateroma"
                                  value="0"
                                  v-model="siriraj.ateroma"
                                />
                                <span>Tidak Ada</span>
                              </label>
                              <label class="radio-item">
                                <RadioButton
                                  inputId="a1"
                                  name="ateroma"
                                  value="1"
                                  v-model="siriraj.ateroma"
                                />
                                <span>Satu atau Lebih</span>
                              </label>
                            </div>
                          </td>
                          <td class="text-center score-val">{{ siriraj.ateroma }}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr class="siriraj-total-row">
                          <td colspan="2" class="text-right align-middle py-2 pr-3">
                            <strong>TOTAL SKOR SIRIRAJ</strong>
                          </td>
                          <td class="text-center align-middle">
                            <span class="total-score-badge">{{ computedSSS }}</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </Panel>

                  <!-- Interpretasi -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-poll-h mr-2"></i>INTERPRETASI HASIL</strong>
                      </h6>
                    </template>

                    <div :class="['interpretation-box', interpretationKey]">
                      <i :class="['interpretation-icon', interpretationIcon]"></i>
                      <div>
                        <div class="interpretation-label">Hasil Penilaian Siriraj:</div>
                        <div class="interpretation-text">{{ interpretationText }}</div>
                      </div>
                    </div>

                    <div class="formula-box mt-3">
                      <i class="fas fa-function mr-2"></i>
                      <small>
                        <b>Formula:</b>
                        (2.5 × Kesadaran) + (2 × Muntah) + (2 × Sakit Kepala) + (0.1 × Diastolik) −
                        (3 × Ateroma) − 12
                      </small>
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
      <span
        class="draft-status-chip"
        :class="
          interpretationKey === 'hemoragik'
            ? 'chip-danger'
            : interpretationKey === 'iskemik'
              ? 'chip-info'
              : 'chip-warn'
        "
      >
        <i class="fas fa-brain"></i> {{ interpretationText }}
      </span>
    </div>
    <div class="sticky-bar-right">
      <Button
        label="Hapus Data"
        size="small"
        icon="pi pi-trash"
        class="btn-theme-outline btn-danger-outline"
        :loading="deleting"
        :disabled="deleting || saving"
        @click="confirmHapus"
      />
      <Button
        label="Simpan"
        size="small"
        icon="pi pi-save"
        class="btn-theme-solid"
        :loading="saving"
        :disabled="saving || deleting"
        @click="saveSiriraj"
      />
    </div>
  </div>

  <!-- ===== DIALOG KONFIRMASI HAPUS ===== -->
  <Dialog
    v-model:visible="showConfirmHapus"
    header="Konfirmasi Hapus"
    modal
    :style="{ width: '380px' }"
  >
    <div class="d-flex align-items-center gap-3">
      <i class="pi pi-exclamation-triangle text-warning" style="font-size: 2rem"></i>
      <span>Apakah Anda yakin ingin <b>menghapus</b> data Siriraj Score ini?</span>
    </div>
    <template #footer>
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        text
        @click="showConfirmHapus = false"
      />
      <Button
        label="Ya, Hapus"
        icon="pi pi-trash"
        severity="danger"
        :loading="deleting"
        @click="hapusSiriraj"
      />
    </template>
  </Dialog>

  <Toast />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import ProgressBar from 'primevue/progressbar'
import Toast from 'primevue/toast'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import RadioButton from 'primevue/radiobutton'
import InputNumber from 'primevue/inputnumber'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Dialog from 'primevue/dialog'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_name } = storeToRefs(authStore)
const toast = useToast()

const noreg = computed(() => route.params?.noreg || route.query?.noreg || '')

const loadingPatient = ref(false)
const loadingSiriraj = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showConfirmHapus = ref(false)
const activeTab = ref('0')
const datapasien = ref(null)

const siriraj = ref({
  consciousness: '0',
  vomit: '0',
  headache: '0',
  diastolic: 0,
  ateroma: '0',
})

const computedSSS = computed(() => {
  const score =
    2.5 * parseInt(siriraj.value.consciousness || 0) +
    2 * parseInt(siriraj.value.vomit || 0) +
    2 * parseInt(siriraj.value.headache || 0) +
    0.1 * (siriraj.value.diastolic || 0) -
    3 * parseInt(siriraj.value.ateroma || 0) -
    12
  return score.toFixed(1)
})

const interpretationKey = computed(() => {
  const s = parseFloat(computedSSS.value)
  if (s > 1) return 'hemoragik'
  if (s < -1) return 'iskemik'
  return 'meragukan'
})

const interpretationText = computed(() => {
  const k = interpretationKey.value
  if (k === 'hemoragik') return 'STROKE HEMORAGIK (Pendarahan)'
  if (k === 'iskemik') return 'STROKE ISKEMIK (Penyumbatan)'
  return 'HASIL MERAGUKAN — Segera CT-Scan'
})

const interpretationIcon = computed(() => {
  const k = interpretationKey.value
  if (k === 'hemoragik') return 'fas fa-tint fa-2x'
  if (k === 'iskemik') return 'fas fa-ban fa-2x'
  return 'fas fa-question-circle fa-2x'
})

const go_back = () => {
  window.close()
}

const showToast = (severity, summary, detail) => {
  toast.add({ severity, summary, detail, life: 3000 })
}

const fetchPatientData = async () => {
  if (!noreg.value || !id_client.value) return
  loadingPatient.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`,
      { mod: 1, id_client: id_client.value, noregister: noreg.value },
    )
    const list = res.data?.response ?? []
    datapasien.value = Array.isArray(list) && list.length > 0 ? list[0] : null
  } catch (e) {
    console.error('fetchPatientData:', e)
    showToast('error', 'Error', 'Gagal memuat data pasien')
  } finally {
    loadingPatient.value = false
  }
}

const getSiriraj = async () => {
  if (!noreg.value || !id_client.value) return
  loadingSiriraj.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_siriraj/${noreg.value}/${id_client.value}`,
    )
    const list = res.data?.response ?? []
    if (Array.isArray(list) && list.length > 0) {
      const d = list[0]
      siriraj.value = {
        consciousness: String(d.kesadaran ?? '0'),
        vomit: String(d.muntah ?? '0'),
        headache: String(d.sakit_kepala ?? '0'),
        diastolic: Number(d.tekanan_darah_diastolik ?? 0),
        ateroma: String(d.ateroma ?? '0'),
      }
    }
  } catch (e) {
    console.error('getSiriraj:', e)
  } finally {
    loadingSiriraj.value = false
  }
}

const saveSiriraj = async () => {
  if (!noreg.value) {
    showToast('warn', 'Peringatan', 'Nomor register tidak ditemukan')
    return
  }
  const consciousnessCaption = { 0: 'Sadar Penuh', 1: 'Somnolen', 2: 'Semi-koma/Koma' }
  const yaTidakCaption = { 0: 'Tidak', 1: 'Ya' }
  const ateromaCaption = { 0: 'Tidak Ada', 1: 'Satu atau Lebih' }
  saving.value = true
  try {
    const payload = {
      id_client: id_client.value,
      username: user_name.value,
      noregister: noreg.value,
      kesadaran: parseInt(siriraj.value.consciousness),
      kesadaran_caption: consciousnessCaption[siriraj.value.consciousness] ?? '-',
      muntah: parseInt(siriraj.value.vomit),
      muntah_caption: yaTidakCaption[siriraj.value.vomit] ?? '-',
      sakit_kepala: parseInt(siriraj.value.headache),
      sakit_kepala_caption: yaTidakCaption[siriraj.value.headache] ?? '-',
      tekanan_darah_diastolik: siriraj.value.diastolic ?? 0,
      ateroma: parseInt(siriraj.value.ateroma),
      ateroma_caption: ateromaCaption[siriraj.value.ateroma] ?? '-',
      skor_akhir: computedSSS.value,
      interpretasi: interpretationText.value,
    }

    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/save_siriraj`,
      payload,
    )

    if (res.data?.code == 200) {
      showToast('success', 'Berhasil', res.data.message || 'Data Siriraj berhasil disimpan')
    } else {
      showToast('warn', 'Peringatan', res.data?.message || 'Gagal menyimpan data')
    }
  } catch (e) {
    console.error('saveSiriraj:', e)
    showToast('error', 'Error', 'Gagal menyimpan data Siriraj')
  } finally {
    saving.value = false
  }
}

const confirmHapus = () => {
  showConfirmHapus.value = true
}

const hapusSiriraj = async () => {
  if (!noreg.value) return
  deleting.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/deleted_siriraj/${noreg.value}/${id_client.value}`,
    )
    showConfirmHapus.value = false
    if (res.data?.code == 200) {
      showToast('success', 'Berhasil', res.data.message || 'Data Siriraj berhasil dihapus')
      siriraj.value = { consciousness: '0', vomit: '0', headache: '0', diastolic: 0, ateroma: '0' }
    } else {
      showToast('warn', 'Peringatan', res.data?.message || 'Gagal menghapus data')
    }
  } catch (e) {
    console.error('hapusSiriraj:', e)
    showToast('error', 'Error', 'Gagal menghapus data Siriraj')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchPatientData()
  getSiriraj()
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

/* ===== SIRIRAJ TABLE ===== */
.siriraj-table {
  border-collapse: collapse;
  font-size: 13px;
}
.siriraj-table thead th {
  background: #f0fafa;
  color: darkcyan;
  border: 1px solid #b2e0e0;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.siriraj-table tbody td {
  border: 1px solid #e9ecef;
  padding: 8px 10px;
  vertical-align: middle;
}
.siriraj-table tbody tr:hover {
  background: #f0fafa;
}
.param-label {
  font-size: 13px;
  color: #334155;
}
.param-hint {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}
.score-val {
  font-size: 15px;
  font-weight: 700;
  color: darkcyan;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  align-items: center;
}
.radio-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  margin: 0;
}

/* Total row */
.siriraj-total-row {
  background: #37474f;
  color: #fff;
}
.siriraj-total-row td {
  border-color: #546e7a !important;
  padding: 10px !important;
}
.total-score-badge {
  display: inline-block;
  background: #fff;
  color: #37474f;
  font-size: 1.4rem;
  font-weight: 800;
  border-radius: 8px;
  padding: 2px 14px;
  min-width: 56px;
  text-align: center;
}

/* ===== INTERPRETASI ===== */
.interpretation-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 6px;
  border-left: 4px solid;
}
.interpretation-box.hemoragik {
  background: #fff5f5;
  border-color: #e53e3e;
  color: #c53030;
}
.interpretation-box.iskemik {
  background: #ebf8ff;
  border-color: #3182ce;
  color: #2b6cb0;
}
.interpretation-box.meragukan {
  background: #fffbeb;
  border-color: #d97706;
  color: #92400e;
}
.interpretation-icon {
  flex-shrink: 0;
}
.interpretation-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.75;
  margin-bottom: 2px;
}
.interpretation-text {
  font-size: 15px;
  font-weight: 800;
}

.formula-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #94a3b8;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  color: #64748b;
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
  gap: 0.4rem;
  font-size: 11px;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  white-space: nowrap;
}
.chip-danger {
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #fc8181;
}
.chip-info {
  background: #ebf8ff;
  color: #2b6cb0;
  border: 1px solid #90cdf4;
}
.chip-warn {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fcd34d;
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

.btn-danger-outline {
  border-color: #e53e3e !important;
  color: #e53e3e !important;
}
.btn-danger-outline:hover {
  background: rgba(229, 62, 62, 0.08) !important;
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
