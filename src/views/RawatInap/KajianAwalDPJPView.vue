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

                  <!-- Pemeriksaan Fisik Ranap -->
                  <Panel class="mb-3">
                    <template #header>
                      <h6 style="color: darkcyan">
                        <strong><i class="fas fa-stethoscope mr-2"></i>PEMERIKSAAN FISIK</strong>
                      </h6>
                    </template>
                    <table class="survey-table w-100">
                      <thead>
                        <tr>
                          <th style="width: 28%">Sistem / Organ</th>
                          <th style="width: 100px; text-align: center">Normal</th>
                          <th>Jika Tidak Normal — Deskripsikan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="item in dataSurveyFisik"
                          :key="item.survey"
                          :class="{ 'survey-row-abnormal': item.hasil !== 'NORMAL' }"
                        >
                          <td class="survey-label">
                            <i
                              class="fas fa-circle survey-dot mr-2"
                              :class="item.hasil === 'NORMAL' ? 'dot-normal' : 'dot-abnormal'"
                            ></i>
                            {{ item.survey }}
                          </td>
                          <td class="text-center">
                            <RadioButton
                              :inputId="'sv-' + item.survey"
                              :name="'sv-' + item.survey"
                              value="NORMAL"
                              v-model="item.hasil"
                            />
                          </td>
                          <td>
                            <InputText
                              v-model="item.hasil"
                              :class="[
                                'w-100',
                                item.hasil === 'NORMAL' ? 'input-normal' : 'input-abnormal',
                              ]"
                              placeholder="Deskripsikan temuan..."
                              autocomplete="off"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="survey-legend mt-2">
                      <span class="legend-item"
                        ><i class="fas fa-circle dot-normal mr-1"></i>Normal</span
                      >
                      <span class="legend-item ml-3"
                        ><i class="fas fa-circle dot-abnormal mr-1"></i>Tidak Normal /
                        Kelainan</span
                      >
                    </div>
                  </Panel>

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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import ProgressBar from 'primevue/progressbar'
import ttdUser from '@/components/TtdDigitalComponent.vue'

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
const dataSurveyFisik = ref([])
const datapasien = ref(props.datapasienProp || null)
const activeTab = ref('0')

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

const mergeSurveyHasil = (baseList, savedList) => {
  if (!savedList?.length) return baseList
  return baseList.map((item) => {
    const saved = savedList.find(
      (s) => String(s.id) === String(item.id) || s.survey === item.survey,
    )
    return saved ? { ...item, hasil: saved.hasil || 'NORMAL' } : { ...item }
  })
}

const fetchSurveyFisik = async (savedData = []) => {
  try {
    const res = await axios.post(`${baseUrl()}/index.php/api/data_referensi/survey_fisik_ranap`, {
      id_client: id_client.value,
      noregister,
    })
    const apiData = res.data.response || []
    dataSurveyFisik.value = mergeSurveyHasil(apiData, savedData)
  } catch (e) {
    console.error('survey_fisik_ranap:', e)
  }
}

const fetchKajianAwal = async () => {
  if (!noregister) return
  loading.value = true
  loadingSpinner.value = true
  try {
    const payload = {
      id_client: id_client.value,
      noregister: noregister,
    }
    const res = await axios.post(
      `${baseUrl()}/index.php/api/Triaseigd/get_kajian_awal_dokter_v2`,
      payload,
    )
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

      if (Array.isArray(r.data_survey_fisik) && r.data_survey_fisik.length) {
        await fetchSurveyFisik(r.data_survey_fisik)
      } else {
        await fetchSurveyFisik()
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
      data_survey_fisik: dataSurveyFisik.value,
    }

    const res = await axios.post(
      `${baseUrl()}/index.php/api/Triaseigd/kajian_awal_dokter_v2`,
      payload,
    )

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

/* ===== SURVEY TABLE ===== */
.survey-table {
  border-collapse: collapse;
}
.survey-table thead th {
  background: #f0fafa;
  color: darkcyan;
  border: 1px solid #b2e0e0;
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.survey-table tbody tr:hover {
  background: #f0fafa;
}
.survey-table tbody td {
  padding: 3px 8px;
  border: 1px solid #e9ecef;
  font-size: 12px;
}
.survey-label {
  font-weight: 600;
  color: #334155;
  vertical-align: middle;
  font-size: 12px;
}
.survey-table :deep(.p-inputtext) {
  font-size: 12px !important;
  padding: 3px 6px !important;
  height: 28px;
}
.survey-legend {
  font-size: 11px;
}
.survey-row-abnormal {
  background: #fff8f0 !important;
}
.survey-row-abnormal .survey-label {
  color: #c2410c;
}
.survey-dot {
  font-size: 7px;
  vertical-align: middle;
}
.dot-normal {
  color: #22c55e;
}
.dot-abnormal {
  color: #ef4444;
}
.input-normal {
  background: #f0fdf4 !important;
  color: #15803d !important;
}
.input-abnormal {
  background: #fff7ed !important;
  border-color: #f97316 !important;
  color: #9a3412 !important;
  font-weight: 600 !important;
}
.survey-legend {
  font-size: 11px;
  color: #64748b;
  padding: 4px 8px;
  border-top: 1px solid #e9ecef;
}
.legend-item {
  display: inline-flex;
  align-items: center;
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
