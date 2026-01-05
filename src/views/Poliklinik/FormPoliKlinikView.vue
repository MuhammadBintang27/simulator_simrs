<template>
  <loading_overlay :is-loading="loaging_spinner" message="Silahkan menunggu...." />
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px"></ProgressBar>

  <div class="content">
    <div class="row">
      <div class="col-md-2">
        <Panel>
          <template #header>
            <Button
              label="Kembali"
              icon="pi pi-arrow-left"
              @click="go_to_list_pasien()"
              class="p-button-secondary"
              style="height: 30px"
            />
          </template>
          <img
            src="https://ws-simrs.link/ilustration/ilustrasi1.png"
            height="130"
            width="195"
            alt=""
          />

          <hr />
          <div class="patient-card">
            <h4 class="patient-name">
              <strong class="mr-2">{{ fact?.NAMAPASIEN }}</strong>
              <i
                v-if="fact"
                :class="fact?.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                :style="{
                  fontSize: '20px',
                  color: fact?.JENISKELAMIN === 'P' ? 'violet' : 'steelblue',
                }"
              >
              </i>
            </h4>
            <div class="patient-details">
              <dt>RM</dt>
              <dd>{{ fact?.NOMR }}</dd>
              <dt><i class="pi pi-map-marker"></i> Alamat</dt>
              <dd>{{ fact?.ALAMAT }}</dd>
              <dt><i class="pi pi-building"></i> Kec</dt>
              <dd>{{ fact?.NAMAKECAMATAN }}</dd>
              <dt><i class="pi pi-heart"></i> Status Menikah</dt>
              <dd>{{ getStatus(fact?.STATUS) }}</dd>
              <dt><i class="pi pi-calendar"></i> Tanggal Lahir</dt>
              <dd>{{ fact?.TGLLAHIR }}</dd>
              <dt><i class="pi pi-clock"></i> Usia</dt>
              <dd>
                {{ fact?.USIA_PASIEN?.tahun }} Thn, {{ fact?.USIA_PASIEN?.bulan }} Bln,
                {{ fact?.USIA_PASIEN?.hari }} Hr
              </dd>
              <dt><i class="pi pi-phone"></i> No HP</dt>
              <dd>{{ fact?.NOTELP }}</dd>
              <dt>Pengguna MJKN?</dt>
              <dd>
                <strong>{{ jknSTTS }}</strong>
              </dd>
              <dt><i class="pi pi-bookmark"></i> Status PRB</dt>
              <dd class="status-prb">{{ fact?.STTS_PRB }}</dd>
            </div>
          </div>
        </Panel>
      </div>

      <div class="col-md-10">
        <Panel class="hero-section">
          <div class="row">
            <div class="col-md-3">
              <div class="patient-card">
                <dl class="patient-details">
                  <dt><span class="stat-label">Cara Bayar</span></dt>
                  <dd>
                    {{ fact?.CARABAYAR }} <strong> {{ fact?.NOSEP }}</strong>
                  </dd>

                  <dt><span class="stat-label">DPJP</span></dt>
                  <dd>{{ fact?.NAMADOKTER }}</dd>
                </dl>
              </div>
            </div>
            <div class="col-md-4">
              <div class="patient-card">
                <dl class="patient-details">
                  <dt><span class="stat-label">Poli Klinik</span></dt>
                  <dd>
                    <strong> {{ fact?.POLI }}</strong>
                  </dd>
                </dl>
                <dl class="patient-details">
                  <dt><span class="stat-label">Masuk Poli</span></dt>
                  <dd>
                    <strong>{{ formatDateTime(fact?.MASUKPOLY) }}</strong>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="col-md-2">
              <div class="patient-card">
                <dl class="patient-details">
                  <dt><span class="stat-label">Dx Sementara</span></dt>
                  <dd>
                    {{ fact?.DIAGNOSA_AWAL }} - <strong> {{ fact?.DX_CAPTION }}</strong>
                  </dd>
                </dl>
              </div>
            </div>

            <div class="col-md-3">
              <div class="patient-card">
                <dl class="patient-details">
                  <dd>
                    <button
                      label="Rincian Layanan"
                      @click="printBill"
                      class="btn btn-success btn-xs"
                    >
                      Rincian Layanan
                    </button>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Panel>

        <div class="row">
          <div class="col-md-12 mt-1">
            <Tabs value="0" scrollable>
              <TabList>
                <Tab value="0">PEMERIKSAAN</Tab>
                <Tab value="1">TINDAKAN</Tab>
                <Tab value="2">TERAPHY</Tab>
                <Tab value="3">LAMPIRAN FILE</Tab>
                <Tab value="4">PENUNUNJANG</Tab>
                <Tab value="5">TINDAK LANJUT</Tab>
              </TabList>
              <TabPanels>
                <TabPanel value="0">
                  <p>
                    Tanda-tanda vital merupakan indikator utama untuk menilai kondisi umum kesehatan
                    pasien. Data ini menjadi dasar dalam pemantauan klinis, evaluasi perawatan,
                    serta deteksi dini adanya perubahan status kesehatan.
                  </p>
                  <div class="patient-detail-content">
                    <div class="detail-section">
                      <div class="detail-grid">
                        <div class="detail-item"></div>
                        <Panel>
                          <template #header>
                            <h6 style="color: darkcyan"><strong>TANDA VITAL</strong></h6>
                          </template>

                          <div class="row">
                            <div class="col-md-3">
                              <label>Suhu (C)</label>
                              <InputGroup>
                                <InputNumber
                                  v-model="soap.suhu"
                                  placeholder="Suhu"
                                  style="font-size: 14px"
                                />
                                <InputGroupAddon>°C</InputGroupAddon>
                              </InputGroup>
                            </div>
                            <div class="col-md-3">
                              <label>Tensi</label>
                              <InputGroup>
                                <InputText
                                  v-model="soap.tensi"
                                  class="mr-3"
                                  style="font-size: 14px"
                                  placeholder="120/80"
                                />
                                <InputGroupAddon>mmHg</InputGroupAddon>
                              </InputGroup>
                            </div>
                            <div class="col-md-3">
                              <label>SPO2</label>
                              <InputGroup>
                                <InputNumber
                                  v-model="soap.sp2o"
                                  placeholder="SPO2"
                                  style="font-size: 14px"
                                />
                                <InputGroupAddon>%</InputGroupAddon>
                              </InputGroup>
                            </div>
                            <div class="col-md-3">
                              <label>Tinggi Badan</label>
                              <InputGroup>
                                <InputNumber
                                  v-model="soap.tinggi_badan"
                                  placeholder="Tinggi Badan"
                                  style="font-size: 14px"
                                />
                                <InputGroupAddon>cm</InputGroupAddon>
                              </InputGroup>
                            </div>
                          </div>
                          <div class="row mt-4">
                            <div class="col-md-3">
                              <label style="color: darkblue">Respirasi</label>
                              <InputGroup>
                                <InputNumber
                                  v-model="soap.respirasi_perm"
                                  placeholder="Respirasi"
                                  style="font-size: 14px"
                                />
                                <InputGroupAddon>/Menit</InputGroupAddon>
                              </InputGroup>
                            </div>
                            <div class="col-md-3">
                              <label style="color: darkblue">GCS (E,V,M)</label>
                              <InputGroup>
                                <InputText
                                  v-model="soap.cgs"
                                  class="mr-3"
                                  style="font-size: 14px"
                                  placeholder="15,15,15"
                                />
                                <InputGroupAddon>E,V,M</InputGroupAddon>
                              </InputGroup>
                            </div>
                            <div class="col-md-3">
                              <label style="color: darkblue">Berat Badan</label>
                              <InputGroup>
                                <InputNumber
                                  v-model="soap.berat_badan"
                                  placeholder="Berat Badan"
                                  style="font-size: 14px"
                                />
                                <InputGroupAddon>kg</InputGroupAddon>
                              </InputGroup>
                            </div>
                            <div class="col-md-3">
                              <label style="color: darkblue">Nadi</label>
                              <InputGroup>
                                <InputNumber
                                  v-model="soap.nadi_permenit"
                                  placeholder="Nadi"
                                  style="font-size: 14px"
                                />
                                <InputGroupAddon>/Menit</InputGroupAddon>
                              </InputGroup>
                            </div>
                          </div>
                          <div class="row mt-5">
                            <div class="col-md-12">
                              <label style="color: darkblue">Tingkat kesadaran</label>
                              <div class="radio-group">
                                <div
                                  v-for="level in consciousnessLevels"
                                  :key="level.code"
                                  class="radio-item"
                                >
                                  <RadioButton
                                    :inputId="level.code"
                                    :value="level.code"
                                    v-model="selectedLevel"
                                    name="consciousnessLevel"
                                    size="large"
                                  />
                                  <label :for="level.code">
                                    {{ level.display }}
                                  </label>
                                </div>
                              </div>
                            </div>
                            <!-- Display selected value -->
                            <div v-if="selectedLevel" class="selected-info mt-3">
                              <p><strong>Display:</strong> {{ getSelectedLevel?.display }}</p>
                              <p>
                                <strong>Description:</strong> {{ getSelectedLevel?.description }}
                              </p>
                            </div>
                            <hr />
                            <div class="col-md-12 mt-3">
                              <label style="color: darkblue"
                                >Apakah pasien memiliki alergi (Obat,Makanan, Linkungan)?</label
                              >
                              <div class="d-flex align-items-center gap-3 mt-2">
                                <MultiSelect
                                  v-model="alergiSelected"
                                  optionLabel="bahasa"
                                  :options="alargiList"
                                  optionGroupLabel="bahasa"
                                  optionGroupChildren="kategori"
                                  filter
                                  display="chip"
                                  placeholder="Pilih alergi"
                                  style="width: 100%"
                                  class="w-full md:w-90"
                                >
                                  <template #dropdownicon>
                                    <i class="fa-solid fa-stethoscope"></i>
                                  </template>
                                  <template #filtericon>
                                    <i class="pi pi-check" />
                                  </template>
                                </MultiSelect>

                                <Button
                                  icon="pi pi-save"
                                  :loading="loading"
                                  @click="simpan_data_alergi"
                                />
                              </div>
                            </div>
                          </div>
                        </Panel>
                        <ProgressBar
                          v-if="soap_loading"
                          mode="indeterminate"
                          style="height: 3px"
                        ></ProgressBar>

                        <Panel class="mt-2">
                          <template #header>
                            <h6 style="color: darkcyan"><strong>SOAP</strong></h6>
                          </template>
                          <div class="detail-item">
                            <label>Subjek</label>

                            <MultiSelect
                              v-model="selectedKeluhan"
                              optionLabel="caption"
                              :options="keluhanOption"
                              filter
                              display="chip"
                              :loading="loadingKeluhan"
                              placeholder="Pilih keluhan Pasien"
                              style="width: 100%"
                              @filter="searchSnomad"
                              class="w-full md:w-80"
                            >
                              <template #dropdownicon>
                                <span class="pi pi-map" role="img" aria-label="dropdown"></span>
                              </template>
                              <template #filtericon>
                                <i class="pi pi-check" />
                              </template>
                              <template #header>
                                <div class="font-medium px-3 py-2">Keluhan yang tersedia</div>
                              </template>
                              <template #footer>
                                <div class="p-3 flex justify-between">
                                  <Button
                                    label="Hapus Semua"
                                    severity="danger"
                                    variant="text"
                                    size="small"
                                    icon="pi pi-times"
                                  />
                                </div>
                              </template>
                            </MultiSelect>
                            <Textarea
                              v-model="soap.subjek"
                              class="custom-textarea mt-1"
                              placeholder="Keluhan subjektif pasien"
                              :rows="3"
                            ></Textarea>
                          </div>
                          <div class="detail-item">
                            <label>Objek</label>
                            <Textarea
                              v-model="soap.objek"
                              class="custom-textarea"
                              placeholder="Hasil pemeriksaan objektif"
                              :rows="3"
                            ></Textarea>
                          </div>
                          <div class="detail-item">
                            <label>Assessment</label>
                            <Textarea
                              v-model="soap.asesmen"
                              class="custom-textarea"
                              placeholder="Penilaian/diagnosa"
                              :rows="3"
                            ></Textarea>
                          </div>
                          <div class="detail-item">
                            <label>Plan</label>
                            <Textarea
                              v-model="soap.plan"
                              class="custom-textarea"
                              placeholder="Rencana tindakan"
                              :rows="3"
                            ></Textarea>
                          </div>

                          <template #footer>
                            <Button
                              label="Simpan Soap"
                              @click="SimpaSoap()"
                              class="w-full round-button2 mt-4"
                              icon="pi pi-save"
                            />
                            <Button
                              label="Tampilkan Icare"
                              :loading="loadingICAre"
                              @click="Call_icare()"
                              severity="warn"
                              icon="pi pi-history"
                              class="w-full round-button2 mt-4 ml-1"
                            />
                            <Button
                              label="Riwayat Kunjungan"
                              severity="info"
                              @click="get_riwayat_lengkap_pasien()"
                              class="w-full round-button2 ml-1 mt-4"
                              icon="pi pi-history"
                            />
                          </template>
                        </Panel>
                      </div>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel value="1">
                  <h6 style="color: darkcyan"><strong>PEMBERIAN TINDAKAN</strong></h6>
                  <TindakanForm v-if="fact" :datapasien="fact"></TindakanForm>
                </TabPanel>
                <TabPanel value="2">
                  <h6 style="color: darkcyan"><strong>PEMBERIAN TERAPHY</strong></h6>
                  <p class="m-0">
                    Pemberian terapi adalah tindakan medis/keperawatan berupa pemberian obat-obatan,
                    cairan, atau tindakan lain sesuai dengan instruksi dokter. Catat secara lengkap
                    nama obat, dosis, cara pemberian, waktu, serta respon pasien terhadap terapi
                    yang diberikan. Pencatatan tindakan pemberian terapi kepada pasien, baik berupa
                    obat, injeksi, cairan infus, maupun tindakan medis lain sesuai instruksi dokter.
                  </p>

                  <TeraphyComponent v-if="fact" :datapasien="fact"></TeraphyComponent>
                </TabPanel>
                <TabPanel value="3">
                  <!-- LAMPIRAN FILE Content -->
                  <h6 style="color: darkcyan"><strong>LAMPIRAN FILE</strong></h6>
                  <p class="m-0">Dokumen dan file pendukung pasien.</p>
                  <LampiranFileComponent />
                </TabPanel>
                <TabPanel value="4">
                  <Tabs value="0" scrollable>
                    <TabList>
                      <Tab value="0">LABORATORIUM</Tab>
                      <Tab value="1">RADIOLOGI</Tab>
                      <Tab value="2">FISOTERAPHI</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel value="0">
                        <LaboratoriumComponent v-if="fact" :datapasien="fact">
                        </LaboratoriumComponent>
                      </TabPanel>
                      <TabPanel value="1">
                        <PermintaanRadiologiComponent
                          v-if="fact"
                          :datapasien="fact"
                        ></PermintaanRadiologiComponent>
                      </TabPanel>
                      <TabPanel value="2">
                        <PermintaanFisioteraphyComponent v-if="fact" :datapasien="fact">
                        </PermintaanFisioteraphyComponent>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel value="5">
                  <TindakLanjutPasienComponent v-if="fact" :datapasien="fact">
                  </TindakLanjutPasienComponent>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="showRiwayat"
    modal
    :breakpoints="{ '1100px': '75vw', '575px': '90vw' }"
    :closable="true"
  >
    <div>
      <div class="medical-records-container">
        <div class="records-grid">
          <Card v-for="(record, index) in riwayat" :key="index" class="record-card">
            <template #content>
              <div class="record-content">
                <!-- Visit Information -->
                <div class="section visit-section">
                  <div class="section-header">
                    <i class="fas fa-calendar-check text-blue-500" style="color: dodgerblue"></i>
                    <h3>Kunjungan</h3>
                  </div>
                  <div class="visit-details">
                    <Tag :value="record.TGLREG" class="mb-3"></Tag>

                    <div class="detail-row">
                      <i class="fas fa-user-md text-green-600"></i>
                      <span class="detail-label">Dokter:</span>
                      <span class="detail-value">{{ record.NAMADOKTER }}</span>
                    </div>

                    <div class="detail-row">
                      <i class="fas fa-clinic-medical text-purple-600"></i>
                      <span class="detail-label">Poli:</span>
                      <span class="detail-value">{{ record.POLI }}</span>
                    </div>

                    <div class="detail-row">
                      <i class="fas fa-hashtag text-gray-600"></i>
                      <span class="detail-label">No. Register:</span>
                      <span class="detail-value">{{ record.NOREGISTER }}</span>
                    </div>

                    <div v-if="record.KET_RUJUK_INT" class="referral-note">
                      <i class="fas fa-info-circle text-green-600"></i>
                      <span class="referral-text">{{ record.KET_RUJUK_INT }}</span>
                    </div>
                  </div>
                </div>

                <!-- Medical Examination -->
                <div class="section examination-section">
                  <div class="section-header">
                    <i class="fas fa-stethoscope text-red-500"></i>
                    <h3>Pemeriksaan</h3>
                  </div>

                  <!-- Vital Signs -->
                  <div class="vital-signs">
                    <div class="vital-item" v-if="record.SUHU">
                      <i class="fas fa-thermometer-half text-orange-500"></i>
                      <span class="vital-label">Suhu:</span>
                      <span class="vital-value">{{ record.SUHU }}°C</span>
                    </div>

                    <div class="vital-item" v-if="record.TENSI">
                      <i class="fas fa-heartbeat text-red-500" style="color: royalblue"></i>
                      <span class="vital-label">Tensi:</span>
                      <span class="vital-value">{{ record.TENSI }}</span>
                    </div>

                    <div class="vital-item" v-if="record.SP2O">
                      <i class="fas fa-lungs text-blue-500" style="color: blue"></i>
                      <span class="vital-label">SPO2:</span>
                      <span class="vital-value">{{ record.SP2O }}%</span>
                    </div>

                    <div class="vital-item" v-if="record.NADI">
                      <i class="fas fa-heart text-pink-500" style="color: brown"></i>
                      <span class="vital-label">Nadi:</span>
                      <span class="vital-value">{{ record.NADI }} bpm</span>
                    </div>
                  </div>

                  <!-- SOAP Notes -->
                  <div class="soap-notes">
                    <div class="soap-item" v-if="record.SUBJEK">
                      <Badge value="S" severity="info" class="soap-badge"></Badge>
                      <div class="soap-content">
                        <span class="soap-label">Subjektif:</span>
                        <p class="soap-text">{{ record.SUBJEK }}</p>
                      </div>
                    </div>

                    <div class="soap-item" v-if="record.OBJEK">
                      <Badge value="O" severity="success" class="soap-badge"></Badge>
                      <div class="soap-content">
                        <span class="soap-label">Objektif:</span>
                        <p class="soap-text">{{ record.OBJEK }}</p>
                      </div>
                    </div>

                    <div class="soap-item" v-if="record.ASSESMEN">
                      <Badge value="A" severity="warning" class="soap-badge"></Badge>
                      <div class="soap-content">
                        <span class="soap-label">Assessment:</span>
                        <p class="soap-text">{{ record.ASSESMEN }}</p>
                      </div>
                    </div>

                    <div class="soap-item" v-if="record.PLAN">
                      <Badge value="P" severity="danger" class="soap-badge"></Badge>
                      <div class="soap-content">
                        <span class="soap-label">Plan:</span>
                        <p class="soap-text">{{ record.PLAN }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Therapy/Medication -->
                <div class="section therapy-section" v-if="record.OBATAN_WEBVIEW">
                  <div class="section-header">
                    <i class="fas fa-pills text-teal-500"></i>
                    <h3>Terapi & Obat</h3>
                  </div>
                  <div class="therapy-content" v-html="record.OBATAN_WEBVIEW"></div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </Dialog>

  <Dialog v-model:visible="showIcare" modal :style="{ width: '1200px' }" :closable="true">
    <iframe
      width="100%"
      height="700px"
      frameborder="0"
      scrolling="yes"
      allowtransparency="true"
      :src="url_icare"
    ></iframe>
  </Dialog>

  <ttdUser
    v-model:showFormOtorisasi="showDialog"
    :noregister="route.query.noreg"
    :mode="10"
    @otpVerified="handleOtpSuccess"
  />
  <Toast />
</template>

<script setup>
import TindakanForm from '@/components/PoliklinikComponent/TindakanCompnent.vue'
import TeraphyComponent from '@/components/PoliklinikComponent/TeraphyComponent.vue'

import LaboratoriumComponent from '@/views/Poliklinik/Penunjang/LaboratoriumComponent.vue'

import PermintaanRadiologiComponent from '@/views/Poliklinik/Penunjang/PermintaanRadiologiComponent.vue'

import PermintaanFisioteraphyComponent from '@/views/Poliklinik/Penunjang/PermintaanFisioteraphyComponent.vue'

import TindakLanjutPasienComponent from '@/views/Poliklinik/TindakLanjutPasienComponent.vue'

import Pusher from 'pusher-js'

import Badge from 'primevue/badge'

import ProgressBar from 'primevue/progressbar'
import { ref, onMounted, reactive, computed, toRaw, watch } from 'vue'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import { useRoute } from 'vue-router'
const route = useRoute()
import { storeToRefs } from 'pinia'
import axios from 'axios'

import ttdUser from '@/components/TtdDigitalComponent.vue'

import LampiranFileComponent from '@/views/Poliklinik/LampiranFileComponent.vue'

import { useConfigStore, useAuthStore } from '@/stores/config'
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const loading = ref(false)
const jknSTTS = ref('')
const isLoadingJKN = ref(false)
const temp_data = ref(null)
const fact = ref(null)
const selectedLevel = ref('')

const showDialog = ref(false)

const showIcare = ref(false)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const showRiwayat = ref(false)
const loaging_spinner = ref(false)

import { useRouter } from 'vue-router'
import { each } from 'jquery'

const router = useRouter()

// Define missing refs for MultiSelect
const selectedCountries = ref([])
const countries = ref([
  { name: 'Demam', code: 'fever' },
  { name: 'Batuk', code: 'cough' },
  { name: 'Sesak nafas', code: 'dyspnea' },
  { name: 'Mual muntah', code: 'nausea' },
  { name: 'Nyeri dada', code: 'chest_pain' },
])

const getStatus = (idStatus) => {
  switch (idStatus) {
    case '1':
      return 'BELUM KAWIN'
    case '2':
      return 'KAWIN'
    case '3':
      return 'JANDA/DUDA'
    default:
      return ''
  }
}

const printBill = async () => {
  const routeData = router.resolve({
    name: 'KasilPrintBill',
    params: {
      norm: route.query.nomr,
      noreg: route.query.noreg,
    },
  })
  // 🔹 Buka di tab baru
  window.open(routeData.href, '_blank')
}

const handleOtpSuccess = (data) => {
  console.log(data)

  if (data?.verified == true) {
    //loadProcedureHistory()
  }
}

const alergiSelected = ref([])
const alargiList = ref([])

const getListAlergi = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/index.php/api/satusehat/get_list_alergi/`) // ✅ Cleaner syntax

    alargiList.value = [...response.data]
    console.log('load data alergi', alargiList.value)
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const getelegiSelected = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const payload = {
      id_client: id_client.value,
      nomr: route.query.nomr,
      mode: 1,
    }
    const response = await axios.post(`${url}/index.php/api/satusehat/allergi_selected`, payload) // ✅ Cleaner syntax

    const saved = response.data.response || []
    console.log('saved:', saved)

    const allAlergis = []
    for (const category of alargiList.value) {
      for (const allergi of category.kategori) {
        allAlergis.push({
          id: allergi.id,
          code: allergi.code,
          display: allergi.display,
          bahasa: allergi.bahasa,
          codesystem: allergi.codesystem,
        })
      }
    }
    // ✅ CORRECT SOLUTION 1: Gunakan find() bukan forEach()
    saved.forEach((element) => {
      const found = allAlergis.find((x) => x.code === element.code)
      if (found) {
        alergiSelected.value.push(found)
      }
    })

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const simpan_data_alergi = async () => {
  try {
    loading.value = true

    const payload = {
      norm: route.query.nomr,
      nik: fact.value.NOKTP,
      id_client: id_client.value,
      noregister: route.query.noreg,
      list: alergiSelected.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/satusehat/simpan_alergi_pasien`,
      payload,
    ) // ✅ Cleaner syntax

    console.log(response.data)
    if (response.data.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `Data telah berhasil tersimpan`,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Berhasil',
        detail: `Gagal mengupdate`,
        life: 3000,
      })
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'

  try {
    const date = new Date(dateTimeString)

    if (isNaN(date.getTime())) {
      return dateTimeString
    }
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch (error) {
    console.error('DateTime formatting error:', error)
    return dateTimeString
  }
}
// Computed property to get selected level details
const getSelectedLevel = computed(() => {
  return consciousnessLevels.value.find((level) => level.code === selectedLevel.value)
})

const consciousnessLevels = ref([
  {
    code: '248234009',
    display: 'Sadar',
    description: 'Pasien sadar penuh dan responsif',
  },
  {
    code: '248230005',
    display: 'Mengantuk',
    description: 'Pasien mengantuk, tapi dapat dibangunkan',
  },
  {
    code: '419099009',
    display: 'Bingung',
    description: 'Pasien bingung, orientasi terganggu',
  },
  {
    code: '110000191000000100',
    display: 'Tidak responsif',
    description: 'Pasien tidak responsif terhadap rangsangan',
  },
  {
    code: '371438000',
    display: 'Koma',
    description: 'Pasien dalam keadaan koma',
  },
])

// Fixed reactive object structure
const soap = reactive({
  no_register: route.query.noreg,
  suhu: null,
  tensi: '',
  sp2o: null,
  tinggi_badan: null,
  respirasi_perm: null,
  cgs: '',
  berat_badan: null,
  nadi_permenit: null,
  subjek: '',
  objek: '',
  asesmen: '',
  plan: '',
  kesadaran: '',
  kesadaran_code: '',
  catatan_dokter: '',
  jenis_dok: 1,
  id_client: id_client.value,
})

const go_to_list_pasien = () => {
  window.close()
}

const url_icare = ref(null)

const loadingICAre = ref(false)
const Call_icare = async () => {
  // Prepare data for API

  if (formatDateOnlyForAPI(new Date()) != fact.value?.TGLREG) {
    return
  }

  loadingICAre.value = true
  const param_form = {
    kodedokter: parseInt(fact.value?.KODE_DOKTER_BPJS, 10) || 0,
    param: fact.value?.NOJAMINAN,
  }

  const url = configStore.apiBaseUrl
  const response = await axios.post(
    `${url}/index.php/api/transaksi_pasien/geturl_icare3/${id_client.value}`,
    param_form,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  )

  loadingICAre.value = false

  if (response.data.metaData?.code == 200) {
    showIcare.value = true
    url_icare.value = response.data.response.url

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `Data telah berhasil tersimpan`,
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Gagal',
      detail: response.data.metaData.message,
      life: 3000,
    })
  }
}

// Methods
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

const SimpaSoap = async () => {
  try {
    // Prepare data for API

    loaging_spinner.value = true
    const soapData = {
      ...soap,
      kesadaran: getSelectedLevel.value?.display || '',
      kesadaran_code: selectedLevel.value || '',
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/save_asesmenkeperawatan`,
      soapData,
    )

    if (response.data == 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `Data telah berhasil tersimpan`,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Gagal',
        detail: `Gagal melakukan penyimpanan`,
        life: 3000,
      })
    }

    loaging_spinner.value = false
    showDialog.value = true
  } catch (error) {
    console.error('Error saving SOAP:', error)
    loaging_spinner.value = false
  }
}

const riwayat = ref(null)

const selectedKeluhan = ref([])
const keluhanOption = ref([])

const loadingKeluhan = ref(false)
const searchQuery = ref(null)
const searchSnomad = async (event) => {
  try {
    const query = event.value
    searchQuery.value = query

    if (!query || query.length <= 2) {
      // keluhanOption.value = []
      return
    }
    loadingKeluhan.value = true

    const payload = {
      raw_text: searchQuery.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Data_referensi/getKeluhanSnomatCT`,
      payload,
    )
    loadingKeluhan.value = false

    console.log(response.data.response)

    if (response.data?.response.length > 0) {
      // ✅ Pastikan hasil dari API tersimpan dengan aman
      const newResults = Array.isArray(response.data?.response) ? response.data.response : []

      // ✅ Gabungkan hasil baru dengan yang lama (hindari duplikat berdasarkan id)
      keluhanOption.value = [
        ...selectedKeluhan.value,
        ...newResults.filter(
          (newItem) => !keluhanOption.value.some((oldItem) => oldItem.code === newItem.code),
        ),
      ]
    }
  } catch (error) {
    console.error('Error :', error)
    loadingKeluhan.value = false
  }
}

// Watch perubahan pada selectedKeluhan
watch(selectedKeluhan, (newVal) => {
  if (Array.isArray(newVal) && newVal.length > 0) {
    // Ambil semua caption dari keluhan yang dipilih
    soap.subjek = newVal
      .map((item) => item?.caption || '')
      .filter((caption) => caption !== '') // hilangkan kosong
      .join(', ')
  } else {
    soap.subjek = ''
  }
})

const get_riwayat_lengkap_pasien = async () => {
  try {
    loaging_spinner.value = true

    // Prepare data for API

    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/get_riwayat_lengkap_pasien/${id_client.value}/${route.query.nomr}`,
    )

    console.log(response.data)

    if (response.data.metadata.code == 200) {
      riwayat.value = response.data.response
      showRiwayat.value = true

      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `Data telah berhasil tersimpan`,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Gagal',
        detail: `Gagal melakukan penyimpanan`,
        life: 3000,
      })
    }

    loaging_spinner.value = false
  } catch (error) {
    console.error('Error saving SOAP:', error)
    loaging_spinner.value = false
  }
}

const soap_loading = ref(false)
const GetSoap = async () => {
  try {
    soap_loading.value = true
    isLoadingJKN.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdata_asesmen/${route.query.noreg}/${id_client.value}`,
    )

    temp_data.value = response.data.response

    if (response.data.metadata.code == 200 && temp_data.value) {
      // Properly assign to reactive object properties (no .value needed)
      soap.asesmen = temp_data.value?.asesmen || ''
      soap.plan = temp_data.value?.plan || ''
      soap.subjek = temp_data.value?.subjek || ''
      soap.objek = temp_data.value?.objek || ''
      soap.suhu = parseInt(temp_data.value?.suhu) || 0
      soap.tensi = temp_data.value?.tensi || ''
      soap.sp2o = parseInt(temp_data.value?.sp2o) || 0
      soap.tinggi_badan = parseInt(temp_data.value?.tinggi_badan) || 0
      soap.respirasi_perm = parseInt(temp_data.value?.respirasi_perm) || 0
      soap.cgs = temp_data.value?.cgs || ''
      soap.berat_badan = parseInt(temp_data.value?.berat_badan) || 0
      soap.nadi_permenit = parseInt(temp_data.value?.nadi_permenit) || 0
      soap.catatan_dokter = temp_data.value?.catatan_dokter || ''
      // Set consciousness level
      selectedLevel.value = temp_data.value?.kesadaran_code || ''
    }

    soap_loading.value = false
  } catch (error) {
    console.error('Error fetching SOAP data:', error)
    soap_loading.value = false
  }
}

const getriwayatJKN = async () => {
  try {
    loading.value = true
    isLoadingJKN.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/Mobil_jkn/check_riwayat_mjkn/${route.query.noka}`,
    )

    jknSTTS.value = response.data ? 'Ya' : 'Belum Pernah'
    isLoadingJKN.value = false
  } catch (error) {
    console.error('Error fetching JKN data:', error)
    jknSTTS.value = 'Error'
    isLoadingJKN.value = false
  }
}

const fetchData = async () => {
  try {
    loading.value = true

    const param = {
      mod: 1,
      noregister: route.query.noreg,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, param)

    if (response.data.response && response.data.response.length > 0) {
      fact.value = response.data.response[0]
    }

    if (fact.value?.KODEPOLI != 'IGD') {
      if (fact.value?.JENISRAWAT == 'JALAN') {
        Call_icare()
      }
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching patient data:', error)
    loading.value = false
  }
}

const paggil_antrean = async () => {
  const pusher = new Pusher('2dfe2aa2404cb8b93954', {
    cluster: 'ap1',
    encrypted: true,
  })

  const dataAntrian = {
    param: '',
  }
  // Subscribe ke channel yang sama dengan backend
  const channel = pusher.subscribe('channel1' + id_client.value) // ganti dengan ID_CLIENT sebenarnya

  // Bind ke event panggil_antrian_poli
  channel.bind('panggil_antrian_poli', (data) => {
    console.log('Data antrian diterima:', data)
    dataAntrian.value = data
  })
}

onMounted(async () => {
  GetSoap()
  fetchData()
  getriwayatJKN()
  await getListAlergi()
  await getelegiSelected()

  // GetSoap()
})
</script>

<style scoped>
.p-multiselect-trigger svg,
.p-multiselect-filter-icon svg {
  pointer-events: none;
  outline: none;
}

[aria-hidden='true'] {
  pointer-events: none;
}
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  padding: 0rem;
  color: white;
}

.stat-label {
  letter-spacing: 0.5px;
  color: white;
}
.patient-card {
  padding: 0rem;
}

.status-prb {
  color: red;
}

.patient-name {
  margin: 0 0 1rem 0;
  color: brown;
}

.patient-details {
  margin: 0;
}

.patient-details dt {
  color: #6b7280;
  font-size: 12px;
  font-weight: normal;
}

.patient-details dd {
  margin: 0 0 1rem 0;
  font-size: 14px;
}

.custom-textarea {
  font-size: 13px !important;
  line-height: 1.3;
  width: 100%;
  padding: 12px !important;
  margin-bottom: 1em;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}
.medical-records-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.records-grid {
  display: grid;
  gap: 1.5rem;
}

.record-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.record-card:hover {
  transform: translateY(-2px);
}

.record-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  padding: 0.5rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-header i {
  font-size: 1.2rem;
}

/* Visit Section */
.visit-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.detail-label {
  font-weight: 500;
  color: #64748b;
  min-width: 80px;
}

.detail-value {
  color: #1e293b;
  font-weight: 500;
}

.referral-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: #f0fdf4;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #22c55e;
  margin-top: 0.5rem;
}

.referral-text {
  font-size: 0.85rem;
  color: #15803d;
  font-style: italic;
}

/* Examination Section */
.vital-signs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.vital-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.85rem;
}

.vital-label {
  font-weight: 500;
  color: #64748b;
}

.vital-value {
  font-weight: 600;
  color: #1e293b;
}

.soap-notes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.soap-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.soap-badge {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.soap-content {
  flex: 1;
}

.soap-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #475569;
  display: block;
  margin-bottom: 0.25rem;
}

.soap-text {
  color: #334155;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* Therapy Section */
.therapy-content {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.therapy-content :deep(p) {
  margin: 0 0 0.5rem 0;
}

.therapy-content :deep(ul) {
  margin: 0;
  padding-left: 1.25rem;
}

.therapy-content :deep(li) {
  margin-bottom: 0.25rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .record-content {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .therapy-section {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .record-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .therapy-section {
    grid-column: span 1;
  }

  .vital-signs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .medical-records-container {
    padding: 0.5rem;
  }

  .records-grid {
    gap: 1rem;
  }

  .record-content {
    gap: 1rem;
  }
}
</style>
