<template>
  <loading_overlay :is-loading="loadingSpinner" message="Silahkan menunggu...." />
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

  <div :class="isEmbedded ? '' : 'content'">
    <!-- ===== BANNER TRANSAKSI ===== -->
    <BannerTransaksiRanap v-if="!isEmbedded" :datapasien="datapasien" :stts-verif="sttsVerif" />

    <div class="row align-items-start">
      <!-- ===== PANEL KIRI — INFO PASIEN ===== -->
      <div v-if="!isEmbedded" class="col-md-2 side-sticky">
        <Panel>
          <template #header>
            <Button
              label="Kembali"
              icon="pi pi-arrow-left"
              @click="go_to_list_pasien()"
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

      <!-- ===== PANEL KANAN — FORM KAJIAN ===== -->
      <div :class="isEmbedded ? 'col-md-12' : 'col-md-10'">
        <!-- Tabs Kajian -->
        <div class="row">
          <div class="col-md-12 mt-1">
            <Tabs v-model:value="activeTab" scrollable>
              <TabList>
                <Tab value="0"> <i class="fas fa-stethoscope mr-1"></i> KAJIAN DPJP </Tab>
              </TabList>

              <TabPanels>
                <!-- ===== TAB 0: KAJIAN DPJP ===== -->
                <TabPanel value="0">
                  <!-- Keluhan Utama -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-comment-medical mr-2"></i>KELUHAN UTAMA</strong>
                      </h6>
                    </template>
                    <Textarea
                      v-model="form.keluhan_utama"
                      class="custom-textarea"
                      :rows="4"
                      placeholder="Tuliskan keluhan utama pasien..."
                    />
                  </Panel>

                  <!-- Riwayat Penyakit Sekarang -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong
                          ><i class="fas fa-history mr-2"></i>RIWAYAT PENYAKIT SEKARANG</strong
                        >
                      </h6>
                    </template>
                    <div class="row">
                      <div class="col-md-5">
                        <label style="color: darkblue">Kondisi yang diderita</label>
                        <div class="checkbox-grid mt-2">
                          <div v-for="item in kondisiList" :key="item" class="field-checkbox">
                            <Checkbox
                              :inputId="'rpsk-' + item"
                              :value="item"
                              v-model="form.riwayat_peny_skrg_arr"
                            />
                            <label :for="'rpsk-' + item" class="ml-2">{{ item }}</label>
                          </div>
                        </div>
                        <div class="mt-3">
                          <label style="color: darkblue">Lainnya</label>
                          <InputText
                            v-model="form.riwayat_peny_skrg_lainnya"
                            class="w-100 mt-1"
                            placeholder="Lainnya..."
                          />
                        </div>
                      </div>
                      <div class="col-md-7">
                        <label style="color: darkblue">Deskripsi Riwayat Penyakit</label>
                        <Textarea
                          v-model="form.riwayat_peny_skrg"
                          class="custom-textarea mt-1"
                          :rows="8"
                          placeholder="Tuliskan riwayat penyakit sekarang..."
                        />
                      </div>
                    </div>
                  </Panel>

                  <!-- Riwayat Alergi -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-allergies mr-2"></i>RIWAYAT ALERGI</strong>
                      </h6>
                    </template>
                    <div class="row">
                      <div class="col-md-3">
                        <label style="color: darkblue">Jenis Alergi</label>
                        <div
                          v-for="item in ['Obat', 'Makanan', 'Lainnya']"
                          :key="item"
                          class="field-checkbox mt-2"
                        >
                          <Checkbox
                            :inputId="'al-' + item"
                            :value="item"
                            v-model="form.elergi_arr"
                          />
                          <label :for="'al-' + item" class="ml-2">Alergi {{ item }}</label>
                        </div>
                      </div>
                      <div class="col-md-9">
                        <label style="color: darkblue">Deskripsi Alergi</label>
                        <Textarea
                          v-model="form.elergi_deskripsi"
                          class="custom-textarea mt-1"
                          :rows="5"
                          placeholder="Penjelasan riwayat alergi pasien..."
                        />
                      </div>
                    </div>
                  </Panel>

                  <!-- Riwayat Penyakit Keluarga -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-users mr-2"></i>RIWAYAT PENYAKIT KELUARGA</strong>
                      </h6>
                    </template>
                    <div class="row">
                      <div class="col-md-6">
                        <label style="color: darkblue">Penyakit dalam keluarga</label>
                        <div class="checkbox-grid mt-2">
                          <div v-for="item in kondisiList" :key="item" class="field-checkbox">
                            <Checkbox
                              :inputId="'kel-' + item"
                              :value="item"
                              v-model="form.riwayat_panyakit_kel"
                            />
                            <label :for="'kel-' + item" class="ml-2">{{ item }}</label>
                          </div>
                        </div>
                        <div class="mt-3">
                          <label style="color: darkblue">Lainnya</label>
                          <InputText
                            v-model="form.riwayat_panyakit_kel_lainnya"
                            class="w-100 mt-1"
                            placeholder="Lainnya..."
                          />
                        </div>
                      </div>
                    </div>
                  </Panel>

                  <!-- ===== PEMERIKSAAN FISIK — SECONDARY SURVEY ===== -->
                  <div class="card card-outline card-primary shadow-sm mb-3">
                    <div
                      class="card-header d-flex align-items-center justify-content-between"
                      style="cursor: pointer; user-select: none"
                      @click="secondarySurveyExpanded = !secondarySurveyExpanded"
                    >
                      <h6 class="card-title font-weight-bold mb-0" style="color: darkcyan">
                        <i class="fas fa-stethoscope mr-2"></i>PEMERIKSAAN FISIK
                      </h6>
                      <i
                        :class="secondarySurveyExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                        class="text-muted"
                      ></i>
                    </div>
                    <div class="card-body" v-show="secondarySurveyExpanded">
                      <Accordion class="ss-accordion">
                        <AccordionPanel
                          v-for="item in secondary_surver_list"
                          :key="item.id"
                          :value="String(item.id)"
                        >
                          <AccordionHeader>
                            <template #toggleicon="{ active }">
                              <i
                                :class="active ? 'pi pi-minus' : 'pi pi-plus'"
                                class="ss-acc-icon"
                              ></i>
                            </template>
                            <span class="ss-acc-label">{{ item.label || item.organ }}</span>
                            <span v-if="getBadgeText(item)" class="ss-acc-badge">{{
                              getBadgeText(item)
                            }}</span>
                          </AccordionHeader>
                          <AccordionContent>
                            <div class="ss-organ-body">
                              <div v-for="sf in item.schemaFields" :key="sf.key" class="ss-field">
                                <span class="ss-field-label">{{ sf.label }}</span>
                                <!-- CHECKBOX -->
                                <div v-if="sf.type === 'checkbox'" class="ss-field-opts">
                                  <label
                                    v-for="opt in sf.options"
                                    :key="opt.value"
                                    class="ss-opt-label"
                                  >
                                    <Checkbox
                                      v-model="item.fields[sf.key]"
                                      :value="opt.value"
                                      :inputId="'cb-' + item.id + '-' + sf.key + '-' + opt.value"
                                    />
                                    <span>{{ opt.label }}</span>
                                  </label>
                                </div>
                                <!-- RADIO → toggle buttons -->
                                <div v-else-if="sf.type === 'radio'" class="ss-btn-group">
                                  <button
                                    v-for="opt in sf.options"
                                    :key="opt.value"
                                    type="button"
                                    :class="[
                                      'ss-btn-opt',
                                      { 'ss-btn-active': item.fields[sf.key] === opt.value },
                                    ]"
                                    @click="item.fields[sf.key] = opt.value"
                                  >
                                    {{ opt.label }}
                                  </button>
                                </div>
                                <!-- TEXT -->
                                <InputText
                                  v-else-if="sf.type === 'text'"
                                  v-model="item.fields[sf.key]"
                                  class="ss-text-input"
                                  :placeholder="sf.label"
                                  size="small"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionPanel>
                      </Accordion>
                      <Divider />

                      <!-- Ringkasan -->
                      <div class="ss-ringkasan-header">
                        <span class="ss-ringkasan-title">
                          <i class="pi pi-clipboard"></i> Ringkasan Pemeriksaan Fisik
                        </span>
                        <Button
                          :label="ringkasanCopied ? 'Tersalin!' : 'Salin'"
                          :icon="ringkasanCopied ? 'pi pi-check' : 'pi pi-copy'"
                          :severity="ringkasanCopied ? 'success' : 'secondary'"
                          size="small"
                          outlined
                          @click="copyRingkasan"
                        />
                      </div>
                      <Textarea
                        :value="ringkasanFisik"
                        :rows="10"
                        readonly
                        style="
                          width: 100%;
                          resize: vertical;
                          font-family: monospace;
                          font-size: 0.82rem;
                        "
                      />
                    </div>
                  </div>

                  <!-- Pemeriksaan Penunjang -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-vials mr-2"></i>PEMERIKSAAN PENUNJANG</strong>
                      </h6>
                    </template>
                    <div class="row">
                      <div class="col-md-4">
                        <label style="color: darkblue">Laboratorium</label>
                        <InputText
                          v-model="form.lab"
                          class="w-100 mt-1"
                          placeholder="Hasil laboratorium..."
                        />
                      </div>
                      <div class="col-md-4">
                        <label style="color: darkblue">Radiologi</label>
                        <InputText
                          v-model="form.radiologi"
                          class="w-100 mt-1"
                          placeholder="Hasil radiologi..."
                        />
                      </div>
                      <div class="col-md-4">
                        <label style="color: darkblue">Lainnya</label>
                        <InputText
                          v-model="form.penunjang_lainnya"
                          class="w-100 mt-1"
                          placeholder="Penunjang lainnya..."
                        />
                      </div>
                    </div>

                    <div v-if="hasilLabAbnormal.length > 0" class="lab-compact-wrap mt-3">
                      <span class="lab-compact-title">
                        <i class="fas fa-flask"></i> Hasil Lab Abnormal:
                      </span>
                      <span
                        v-for="(lab, i) in hasilLabAbnormal"
                        :key="i"
                        class="lab-compact-chip"
                        :title="lab.KATEGORI"
                      >
                        {{ lab.PEMERIKSAAN }} <strong>{{ lab.HASIL }}</strong>
                      </span>
                    </div>
                  </Panel>

                  <!-- Diagnosa & Prosedur -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong
                          ><i class="fas fa-diagnoses mr-2"></i>DIAGNOSA &amp; PROSEDUR</strong
                        >
                      </h6>
                    </template>
                    <div class="row">
                      <div class="col-md-4">
                        <label style="color: darkblue">
                          Diagnosa Utama <span class="text-danger">*</span>
                        </label>
                        <Textarea
                          v-model="form.diagnosautama"
                          class="custom-textarea mt-1"
                          :rows="6"
                          placeholder="Contoh: Stroke Hemoragik, Hipertensi Emergency..."
                        />
                        <small class="help-text">
                          <i class="fas fa-info-circle mr-1"></i>
                          Diagnosis utama alasan pasien dirawat.
                        </small>
                      </div>
                      <div class="col-md-4">
                        <label style="color: darkblue">Diagnosa Sekunder</label>
                        <Textarea
                          v-model="form.diagnosasekunder"
                          class="custom-textarea mt-1"
                          :rows="6"
                          placeholder="Contoh: Diabetes Mellitus Tipe 2, Anemia..."
                        />
                        <small class="help-text">
                          <i class="fas fa-info-circle mr-1"></i>
                          Penyakit penyerta. Pisahkan dengan koma.
                        </small>
                      </div>
                      <div class="col-md-4">
                        <label style="color: darkblue">Prosedur</label>
                        <Textarea
                          v-model="form.prosedur"
                          class="custom-textarea mt-1"
                          :rows="6"
                          placeholder="Contoh: Operasi Sesar, Intubasi..."
                        />
                        <small class="help-text">
                          <i class="fas fa-info-circle mr-1"></i>
                          Tindakan/prosedur yang telah atau akan dilakukan.
                        </small>
                      </div>
                    </div>
                  </Panel>
                </TabPanel>

                <!-- ===== TAB 1: KAJIAN PERAWAT ===== -->
                <TabPanel value="1">
                  <Panel>
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-user-nurse mr-2"></i>KAJIAN PERAWAT</strong>
                      </h6>
                    </template>
                    <div class="empty-info">
                      <i class="fas fa-tools mr-2"></i>
                      Modul Kajian Perawat belum tersedia.
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

  <!-- Sticky Action Bar -->
  <div v-if="activeTab === '0'" class="sticky-action-bar">
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
        label="Otorisasi"
        size="small"
        icon="pi pi-verified"
        class="btn-theme-outline"
        @click="showOtorisasi = true"
      />
      <Button
        label="Simpan Kajian"
        size="small"
        icon="pi pi-save"
        class="btn-theme-solid"
        :loading="saving"
        :disabled="saving"
        @click="simpanKajianAwal"
      />
    </div>
  </div>

  <!-- Form Otorisasi TTD Digital -->
  <ttdUser
    v-model:showFormOtorisasi="showOtorisasi"
    :noregister="noregister"
    :mode="3"
    @otpVerified="handleOtpVerified"
  />

  <Toast />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import ProgressBar from 'primevue/progressbar'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Divider from 'primevue/divider'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import { createSecondarySurveyList } from '@/composables/useSecondarySurveyList'

const props = defineProps({
  datapasienProp: { type: Object, default: null },
  noregisterProp: { type: String, default: '' },
  isEmbedded: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const loadingSpinner = ref(false)
const saving = ref(false)
const showOtorisasi = ref(false)
const sttsVerif = ref('')
const hasilLabAbnormal = ref([])
const datapasien = ref(props.datapasienProp || null)
const activeTab = ref('0')
const secondarySurveyExpanded = ref(true)
const ringkasanCopied = ref(false)

const noregister = props.noregisterProp || route.params?.noregister || ''

const kondisiList = [
  'Diabetes malitus',
  'Hipertensi',
  'Jantung',
  'Tumor/Kanker',
  'Osteoporosis',
  'TBC',
  'Asma',
  'Skizofrenia',
  'Hypertiroid',
  'Hiperkolestrol',
]

const go_to_list_pasien = () => {
  window.close()
}

const form = ref({
  keluhan_utama: '',
  riwayat_peny_skrg: '',
  riwayat_peny_skrg_arr: [],
  riwayat_peny_skrg_lainnya: '',
  elergi_deskripsi: '',
  elergi_arr: [],
  riwayat_panyakit_kel: [],
  riwayat_panyakit_kel_lainnya: '',
  lab: '',
  radiologi: '',
  penunjang_lainnya: '',
  diagnosautama: '',
  diagnosasekunder: '',
  prosedur: '',
  last_update: '',
})

// ── Secondary Survey List (Pemeriksaan Fisik) ─────────────────────────────────
const secondary_surver_list = ref(createSecondarySurveyList())

// ── Computed ──────────────────────────────────────────────────────────────────
const ringkasanFisik = computed(() => {
  const lines = secondary_surver_list.value.map((item) => {
    const organ = (item.label || item.organ).padEnd(12, ' ')
    let parts = []
    if (item.fields && item.schemaFields) {
      item.schemaFields.forEach((sf) => {
        const val = item.fields[sf.key]
        if (!val || (Array.isArray(val) && val.length === 0) || val === '') return
        const disp = Array.isArray(val)
          ? val.map((v) => sf.options?.find((x) => x.value === v)?.label || v).join(', ')
          : sf.options
            ? sf.options.find((x) => x.value === val)?.label || val
            : val
        parts.push(`${sf.label}: ${disp}`)
      })
    }
    const kondisi = parts.length > 0 ? parts.join(' | ') : item.kondisi || 'NORMAL'
    return `- ${organ}: ${kondisi}`
  })
  return 'Pemeriksaan Fisik:\n' + lines.join('\n')
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function getBadgeText(item) {
  if (!item.fields || !item.schemaFields) return item.kondisi || ''
  const parts = []
  for (const sf of item.schemaFields) {
    const val = item.fields[sf.key]
    if (val === null || val === undefined || val === '') continue
    if (Array.isArray(val) && val.length === 0) continue
    let display
    if (Array.isArray(val)) {
      display = val.map((v) => sf.options?.find((o) => o.value === v)?.label || v).join(', ')
    } else if (sf.options) {
      display = sf.options.find((o) => o.value === val)?.label || val
    } else {
      display = val
    }
    parts.push(`${sf.label}: ${display}`)
  }
  return parts.join(' | ')
}

const copyRingkasan = () => {
  navigator.clipboard.writeText(ringkasanFisik.value).then(() => {
    ringkasanCopied.value = true
    setTimeout(() => {
      ringkasanCopied.value = false
    }, 2000)
  })
}

const baseUrl = () => configStore.apiBaseUrl

const fetchDataPasien = async () => {
  if (!noregister) return
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

const fetchKajianAwal = async () => {
  if (!noregister) return
  loading.value = true
  loadingSpinner.value = true
  try {
    const res = await axios.post(`${baseUrl()}/index.php/api/Triaseigd/get_kajian_awal_dokter_v2`, {
      id_client: id_client.value,
      noregister,
    })
    const r = res.data.response
    if (r) {
      form.value.keluhan_utama = r.keluhan_utama || ''
      form.value.riwayat_peny_skrg = r.riwayat_peny_skrg || ''
      form.value.lab = r.penunjang_lab || ''
      form.value.radiologi = r.penunjang_radiologi || ''
      form.value.penunjang_lainnya = r.penunjang_lainnya || ''
      form.value.diagnosautama = r.dx_awal || ''
      form.value.diagnosasekunder = r.dx_sekunder || ''
      form.value.prosedur = r.prosedur || ''
      form.value.elergi_arr = r.elergi_arr || []
      form.value.elergi_deskripsi = r.elergi_deskripsi || ''
      form.value.riwayat_peny_skrg_arr = r.riwayat_peny_skrg_arr || []
      form.value.riwayat_panyakit_kel = r.riwayat_panyakit_kel || []
      form.value.riwayat_panyakit_kel_lainnya = r.riwayat_panyakit_kel_lainnya || ''
      form.value.last_update = r.last_update || ''
      sttsVerif.value = r.telah_verif || ''
      hasilLabAbnormal.value = res.data.hasil_lab_positif || []

      // Merge survey fisik dari kajian_awal_sistemik
      if (Array.isArray(r.data_survey_fisik) && r.data_survey_fisik.length) {
        secondary_surver_list.value = secondary_surver_list.value.map((defaultItem) => {
          const found = r.data_survey_fisik.find((s) => s.organ === defaultItem.organ)
          if (!found) return defaultItem
          return {
            ...defaultItem,
            kondisi: found.kondisi ?? defaultItem.kondisi,
            fields: found.fields ?? defaultItem.fields,
          }
        })
      }
    }
  } catch (e) {
    console.error('get_kajian_awal_dokter:', e)
  } finally {
    loading.value = false
    loadingSpinner.value = false
  }
}

const simpanKajianAwal = async () => {
  if (!form.value.diagnosautama.trim()) {
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
      id_client: id_client.value,
      noregister: noregister,
      nomr: datapasien.value?.NOMR || '',
      keluhan_utama: form.value.keluhan_utama,
      riwayat_peny_skrg: form.value.riwayat_peny_skrg,
      riwayat_peny_skrg_arr: form.value.riwayat_peny_skrg_arr,
      riwayat_peny_skrg_lainnya: form.value.riwayat_peny_skrg_lainnya,
      elergi_arr: form.value.elergi_arr,
      elergi_deskripsi: form.value.elergi_deskripsi,
      riwayat_panyakit_kel: form.value.riwayat_panyakit_kel,
      riwayat_panyakit_kel_lainnya: form.value.riwayat_panyakit_kel_lainnya,
      penunjang_lab: form.value.lab,
      penunjang_radiologi: form.value.radiologi,
      penunjang_lainnya: form.value.penunjang_lainnya,
      dx_awal: form.value.diagnosautama,
      dx_sekunder: form.value.diagnosasekunder,
      prosedur: form.value.prosedur,
      survey: secondary_surver_list.value,
    }

    const res = await axios.post(
      `${baseUrl()}/index.php/api/Triaseigd/kajian_awal_dokter_v2`,
      payload,
    )

    console.log(res.data)

    if (res.data.metadata?.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: res.data.metadata.message || 'Kajian awal berhasil disimpan.',
        life: 3000,
      })
      fetchKajianAwal()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res.data.metadata?.message || 'Terjadi kesalahan.',
        life: 4000,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyimpan: ' + e.message,
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

const handleOtpVerified = () => {
  fetchKajianAwal()
}

onMounted(() => {
  fetchDataPasien()
  fetchKajianAwal()
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

.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}
.field-checkbox {
  display: flex;
  align-items: center;
  font-size: 13px;
}
.field-checkbox label {
  cursor: pointer;
  font-size: 13px;
}

.empty-info {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.help-text {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #6c757d;
  font-style: italic;
  line-height: 1.5;
}

/* ===== LAB ABNORMAL ===== */
.lab-compact-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-left: 3px solid #e53e3e;
  border-radius: 5px;
}
.lab-compact-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #c53030;
  white-space: nowrap;
  margin-right: 0.25rem;
}
.lab-compact-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.55rem;
  background: #fff;
  border: 1px solid #fc8181;
  border-radius: 99px;
  font-size: 0.7rem;
  color: #4a5568;
  white-space: nowrap;
}
.lab-compact-chip strong {
  color: #c53030;
  font-size: 0.72rem;
  font-weight: 700;
}

/* ===== SECONDARY SURVEY ===== */
:deep(.ss-accordion .p-accordionpanel) {
  margin-bottom: 6px;
}
:deep(.ss-accordion .p-accordionheader) {
  gap: 8px;
}
:deep(.ss-accordion .p-accordioncontent-content) {
  padding: 10px 14px;
}
.ss-acc-icon {
  font-size: 0.78rem;
  flex-shrink: 0;
}
.ss-acc-label {
  flex: 1;
}
.ss-acc-badge {
  font-size: 0.68rem;
  font-weight: 600;
  background: #e8f5e9;
  color: #00897b;
  border: 1px solid #a5d6a7;
  border-radius: 4px;
  padding: 1px 7px;
}
.ss-organ-body {
  padding: 10px 14px;
}
.ss-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  flex-wrap: wrap;
}
.ss-field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  min-width: 100px;
  flex-shrink: 0;
}
.ss-field-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}
.ss-opt-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.88rem;
  cursor: pointer;
  margin: 0;
}
.ss-text-input {
  flex: 1;
  min-width: 60px;
  font-size: 0.88rem;
  height: 32px;
}
.ss-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}
.ss-btn-opt {
  padding: 3px 12px;
  border-radius: 20px;
  border: 1.5px solid darkcyan;
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  line-height: 1.7;
  font-size: 0.85rem;
}
.ss-btn-opt:hover {
  background: #e0f7f7;
}
.ss-btn-active {
  background: darkcyan !important;
  color: #fff !important;
}
.ss-ringkasan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.ss-ringkasan-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
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
