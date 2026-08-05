<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">{{ pageTitle }}</h1>
          <p class="hero-description">
            Pendaftaran pasien merupakan langkah awal dalam proses pelayanan kesehatan.
          </p>
        </div>
      </div>

      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien }}</div>
          <div class="stat-label">Total Pasien</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienHariIni }}</div>
          <div class="stat-label">Pasien Hari Ini</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienAktif }}</div>
          <div class="stat-label">Pasien Aktif</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rataKunjungan }}</div>
          <div class="stat-label">Batal</div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-3">
        <!-- Patient Information Panel -->
        <div class="pi-card">
          <!-- Header -->
          <div class="pi-card-header">
            <i class="pi pi-user-circle" style="font-size: 13px"></i>
            <span>Informasi Pasien</span>
          </div>

          <!-- Avatar + Nama + Status -->
          <div
            class="pi-identity"
            :class="peserta.nama ? 'pi-identity-active' : 'pi-identity-empty'"
          >
            <div class="pi-avatar">
              <span v-if="peserta.nama">{{ peserta.nama?.charAt(0)?.toUpperCase() }}</span>
              <i v-else class="pi pi-user" style="font-size: 1.4rem"></i>
            </div>
            <div class="pi-identity-info">
              <div class="pi-name">{{ peserta.nama || 'Belum ada data' }}</div>
              <div class="pi-nokartu" v-if="peserta.noKartu">{{ peserta.noKartu }}</div>
              <span
                v-if="peserta.noKartu"
                class="pi-status-badge"
                :class="
                  peserta.statusPeserta?.keterangan === 'AKTIF'
                    ? 'pi-status-aktif'
                    : 'pi-status-nonaktif'
                "
              >
                <i
                  :class="
                    peserta.statusPeserta?.keterangan === 'AKTIF'
                      ? 'pi pi-check-circle'
                      : 'pi pi-times-circle'
                  "
                ></i>
                {{ peserta.statusPeserta?.keterangan || 'TIDAK AKTIF' }}
              </span>
            </div>
          </div>

          <Divider style="margin: 0" />

          <!-- Info Rows -->
          <div class="pi-info-list" v-if="peserta.nama">
            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #eff6ff; color: #1d4ed8">
                <i class="pi pi-id-card"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">NIK</div>
                <div class="pi-info-val">{{ peserta.nik || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #f0fdf4; color: #15803d">
                <i class="pi pi-mars" v-if="peserta.sex == 'L'"></i>
                <i class="pi pi-venus" v-else-if="peserta.sex == 'P'"></i>
                <i class="pi pi-user" v-else></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Jenis Kelamin</div>
                <div class="pi-info-val">{{ getGenderText(peserta.sex) || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #fef9c3; color: #b45309">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Tanggal Lahir</div>
                <div class="pi-info-val">{{ peserta.tglLahir || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #f5f3ff; color: #6d28d9">
                <i class="pi pi-building"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Faskes Tingkat I</div>
                <div class="pi-info-val">{{ peserta.provUmum?.nmProvider || '—' }}</div>
              </div>
            </div>

            <div class="pi-info-row">
              <div class="pi-info-icon" style="background: #fff1f2; color: #be123c">
                <i class="pi pi-star"></i>
              </div>
              <div class="pi-info-body">
                <div class="pi-info-lbl">Hak Kelas</div>
                <div class="pi-info-val">{{ peserta.hakKelas?.keterangan || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div class="pi-empty" v-else>
            <img
              src="https://ws-simrs.net/ilustration/ilustrasi1.png"
              alt="Ilustrasi"
              style="width: 100%; max-width: 200px; opacity: 0.6"
            />
            <p>Cari pasien untuk menampilkan informasi</p>
          </div>
        </div>
      </div>

      <div class="col-md-9">
        <Transition name="status-banner">
          <div
            v-if="
              !bannerDismissed &&
              peserta.nama &&
              peserta.statusPeserta?.keterangan &&
              peserta.statusPeserta.keterangan !== 'AKTIF'
            "
            class="status-nonaktif-banner"
          >
            <div class="status-banner-icon">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
            <div class="status-banner-body">
              <strong>Peserta Tidak Aktif</strong>
              <span>
                Status BPJS <strong>{{ peserta.nama }}</strong> adalah
                <strong>{{ peserta.statusPeserta?.keterangan }}</strong
                >. Pastikan cara bayar sudah sesuai sebelum melanjutkan pendaftaran.
              </span>
            </div>
            <button class="status-banner-dismiss" @click="bannerDismissed = true" title="Tutup">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </Transition>

        <FormPendaftaranComponent
          @fungsiInduk="CallDialogPendaftarn"
          @restorePatient="restorePatientFromDraft"
          @clearPatient="clearPatientData"
          :os="peserta"
          ref="GetCaraBayarChild"
        />
      </div>
    </div>

    <Dialog
      v-model:visible="showDialogPendaftaran"
      modal
      :closable="true"
      :style="{ width: '45rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <!-- Icon Header with Gradient -->
      <div class="row">
        <div class="col-md-4">
          <div class="d-flex align-items-center">
            <div class="bg-light p-3 rounded-circle mr-3">
              <i class="fas fa-handshake text-primary fa-lg"></i>
            </div>
          </div>
        </div>

        <div class="col-md-6 d-flex align-items-center">
          <!-- <label class="mb-0 me-2">No. RM</label> -->
          <div class="d-flex align-items-center w-100">
            <div class="d-flex align-items-center mr-2">
              <InputText
                v-model="norm"
                class="flex-grow-1 me-2"
                @keydown.enter="cariByRM"
                placeholder="Cari... RM"
              />
              <Button
                label=""
                icon="pi pi-search"
                @click="cariByRM"
                class="p-button-success p-button-sm"
              />
            </div>
            <Button
              label="Tambah"
              icon="pi pi-user-plus"
              @click="InputPasienBaru"
              class="p-button-success p-button-sm me-2"
            />
            <Button
              label="Edit"
              @click="EditPasien"
              icon="pi pi-user-edit"
              class="p-button-warning p-button-sm"
            />
            <Button
              label="Pasien"
              @click="openPatientDialog()"
              icon="pi pi-database"
              class="p-button-info p-button-sm"
            />
          </div>
        </div>
      </div>
      <div class="card border-0 p-4 elevation-0">
        <!-- Form -->
        <div class="card-body p-0">
          <div class="form-group row align-items-center mb-3">
            <label class="col-md-2 font-weight-semibold" style="color: #4a5568">
              <i class="far fa-calendar-alt mr-2 text-primary"></i>
              Tanggal SEP
            </label>
            <div class="col-md-10">
              <DatePicker v-model="tanggalSEP" dateFormat="dd/mm/yy" showIcon class="w-30" />
            </div>
          </div>

          <div class="form-group row align-items-center mb-3">
            <label class="col-md-2 font-weight-semibold" style="color: #4a5568">
              <i class="fas fa-hashtag mr-2 text-info"></i>
              Nomor BPJS/NIK
            </label>
            <div class="col-md-10">
              <InputText
                v-model="nomorSepOrNik"
                class="w-100"
                placeholder="Masukkan Nomor Rujukan atau SEP"
              />
            </div>
          </div>
          <div class="form-group row align-items-center mb-3">
            <label class="col-md-2 font-weight-semibold" style="color: #4a5568">
              <i class="fas fa-hospital mr-2 text-success"></i>
              Asal Rujukan
            </label>
            <div class="col-md-10">
              <Select
                v-model="asalRujukan"
                :options="asalOptions"
                optionLabel="label"
                optionValue="value"
                class="w-100"
                style="min-width: 150px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)"
              />
            </div>
          </div>

          <div class="form-group row mb-3">
            <div class="col-md-8 offset-md-2">
              <div class="d-flex justify-content-start gap-2">
                <Button
                  label="Cari"
                  @click="callDataOnlinOfline"
                  severity="warn"
                  :loading="isLoading"
                  icon="pi pi-search"
                  class="p-button-sm flex-fill"
                />
                <Button
                  label="Lanjutkan"
                  severity="success"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  @click="showDialogPendaftaran = false"
                  class="p-button-sm flex-fill"
                />
                <Button
                  label="Riwayat BPJS"
                  text
                  icon="pi pi-history"
                  iconPos="right"
                  @click="riwayatBPJSRef.open()"
                  class="p-button-sm flex-fill"
                />
                <Button
                  v-if="isPoliklinikMode"
                  label="Surat Kontrol Ulang"
                  text
                  icon="pi pi-file-export"
                  iconPos="right"
                  severity="warn"
                  @click="riwayatSKURef.open()"
                  class="p-button-sm flex-fill"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Data Pasien & Riwayat -->
        <div
          class="card mt-4 elevation-0"
          style="border-radius: 4px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden"
        >
          <div
            class="position-relative overflow-hidden"
            style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%)"
          >
            <!-- Empty state -->
            <div v-if="!peserta.nama" class="pd-empty-state">
              <i class="pi pi-id-card" style="font-size: 1.8rem; opacity: 0.3"></i>
              <span>Belum ada data peserta</span>
            </div>

            <!-- Loaded state -->
            <template v-else>
              <!-- Key metrics bar -->
              <div class="pd-metrics-bar">
                <div class="pd-metric">
                  <span class="pd-metric-lbl">No. Kartu BPJS</span>
                  <span class="pd-metric-val pd-mono">{{ peserta.noKartu || '-' }}</span>
                </div>
                <div class="pd-metric-divider"></div>
                <div class="pd-metric">
                  <span class="pd-metric-lbl">Status Peserta</span>
                  <span
                    class="pd-status-badge"
                    :class="
                      peserta.statusPeserta?.keterangan === 'AKTIF'
                        ? 'pd-badge-aktif'
                        : 'pd-badge-nonaktif'
                    "
                  >
                    <i
                      class="pi"
                      :class="
                        peserta.statusPeserta?.keterangan === 'AKTIF'
                          ? 'pi-check-circle'
                          : 'pi-times-circle'
                      "
                    ></i>
                    {{ peserta.statusPeserta?.keterangan || '-' }}
                  </span>
                </div>
                <div class="pd-metric-divider"></div>
                <div class="pd-metric">
                  <span class="pd-metric-lbl">Hak Kelas</span>
                  <span class="pd-metric-val">{{ peserta.hakKelas?.keterangan || '-' }}</span>
                </div>
                <div class="pd-metric-divider"></div>
                <div class="pd-metric">
                  <span class="pd-metric-lbl">Jenis Peserta</span>
                  <span class="pd-metric-val">{{ peserta.jenisPeserta?.keterangan || '-' }}</span>
                </div>
              </div>

              <!-- Rujukan bar (POLIKLINIK mode only) -->
              <div v-if="isPoliklinikMode" class="pd-rujukan-bar">
                <div class="pd-rujukan-title">
                  <i class="pi pi-send"></i> Data Rujukan
                  <i v-if="loadingRujukan" class="pi pi-spin pi-spinner pd-rujukan-spinner"></i>
                </div>
                <template v-if="!loadingRujukan">
                  <div v-if="listRujukan.length === 0" class="pd-rujukan-none">
                    Belum ada data rujukan
                  </div>
                  <div
                    v-for="item in listRujukan"
                    :key="item.jenis_rujukan"
                    class="pd-rujukan-group"
                  >
                    <div class="pd-rujukan-group-header">
                      <span
                        class="pd-rujukan-type"
                        :class="item.jenis_rujukan === 'RS' ? 'pd-rtype-rs' : 'pd-rtype-pkm'"
                      >
                        {{ item.jenis_rujukan === 'RS' ? 'Faskes II (RS)' : 'Faskes I (PKM)' }}
                      </span>
                    </div>

                    <div class="pd-rujukan-content">
                      <template v-if="Array.isArray(item.data?.response?.rujukan)">
                        <div
                          v-for="rj in rujukanExpanded[item.jenis_rujukan]
                            ? item.data.response.rujukan
                            : item.data.response.rujukan.slice(0, 5)"
                          :key="rj.noKunjungan"
                          class="pd-rujukan-row"
                          :class="{ 'pd-rujukan-row--expired': isRujukanExpired(rj.tglKunjungan) }"
                        >
                          <span
                            v-if="isRujukanExpired(rj.tglKunjungan)"
                            class="pd-rj-expired-badge"
                          >
                            <i class="pi pi-clock"></i> EXPIRED
                          </span>
                          <span class="pd-rj-val pd-mono">{{ rj.noKunjungan }}</span>
                          <span class="pd-rj-sep">·</span>
                          <span class="pd-rj-val">{{ rj.tglKunjungan }}</span>
                          <span class="pd-rj-sep">·</span>
                          <span class="pd-rj-val">{{ rj.provPerujuk?.nama }}</span>
                          <span class="pd-rj-sep">·</span>
                          <span class="pd-rj-poli">{{ rj.poliRujukan?.nama }}</span>
                          <span class="pd-rj-sep">·</span>
                          <span class="pd-rj-diag">Dx: {{ rj.diagnosa?.kode }}</span>
                        </div>
                        <button
                          v-if="item.data.response.rujukan.length > 5"
                          class="pd-rujukan-seemore"
                          @click="toggleRujukanExpand(item.jenis_rujukan)"
                        >
                          <i
                            class="pi"
                            :class="
                              rujukanExpanded[item.jenis_rujukan]
                                ? 'pi-chevron-up'
                                : 'pi-chevron-down'
                            "
                          ></i>
                          {{
                            rujukanExpanded[item.jenis_rujukan]
                              ? 'Sembunyikan'
                              : `${item.data.response.rujukan.length - 5} rujukan lainnya`
                          }}
                        </button>
                      </template>
                      <div v-else class="pd-rujukan-none">
                        {{ item.data?.metaData?.message || 'Tidak ada rujukan' }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Info sections grid -->
              <div class="pd-sections">
                <!-- Pribadi & Rekam Medis -->
                <div class="pd-section">
                  <div class="pd-section-title">
                    <i class="pi pi-user"></i> Pribadi & Rekam Medis
                  </div>
                  <div class="pd-grid">
                    <div class="pd-item pd-item--full">
                      <span class="pd-lbl">Nama</span>
                      <span
                        class="pd-val"
                        style="font-weight: 700; color: rgba(255, 255, 255, 0.95)"
                        >{{ peserta.nama || '-' }}</span
                      >
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">NIK</span>
                      <span class="pd-val pd-mono">{{ peserta.nik || '-' }}</span>
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">Jenis Kelamin</span>
                      <span class="pd-val">{{ peserta.sex || '-' }}</span>
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">Tanggal Lahir</span>
                      <span class="pd-val">{{ peserta.tglLahir || '-' }}</span>
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">Umur</span>
                      <span class="pd-val">{{ peserta.umur?.umurSekarang || '-' }}</span>
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">No. MR</span>
                      <span class="pd-val pd-mono">{{ peserta.mr?.noMR || '-' }}</span>
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">No. Telepon</span>
                      <span class="pd-val">{{ peserta.mr?.noTelepon || '-' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Kepesertaan & Provider -->
                <div class="pd-section">
                  <div class="pd-section-title">
                    <i class="pi pi-id-card"></i> Kepesertaan & Provider
                  </div>
                  <div class="pd-grid">
                    <div class="pd-item">
                      <span class="pd-lbl">TMT</span>
                      <span class="pd-val">{{ peserta.tglTMT || '-' }}</span>
                    </div>
                    <div class="pd-item">
                      <span class="pd-lbl">TAT</span>
                      <span class="pd-val">{{ peserta.tglTAT || '-' }}</span>
                    </div>
                    <div class="pd-item pd-item--full">
                      <span class="pd-lbl">Kode Provider</span>
                      <span class="pd-val pd-mono">{{ peserta.provUmum?.kdProvider || '-' }}</span>
                    </div>
                    <div class="pd-item pd-item--full">
                      <span class="pd-lbl">Nama Provider</span>
                      <span class="pd-val">{{ peserta.provUmum?.nmProvider || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional chips -->
              <div
                v-if="
                  peserta.informasi?.noSKTM ||
                  peserta.informasi?.prolanisPRB ||
                  peserta.cob?.nmAsuransi
                "
                class="pd-chips"
              >
                <span v-if="peserta.informasi?.noSKTM" class="pd-chip pd-chip--yellow">
                  <i class="pi pi-file-text"></i> SKTM: {{ peserta.informasi.noSKTM }}
                </span>
                <span v-if="peserta.informasi?.prolanisPRB" class="pd-chip pd-chip--blue">
                  <i class="pi pi-heart"></i> {{ peserta.informasi.prolanisPRB }}
                </span>
                <span v-if="peserta.cob?.nmAsuransi" class="pd-chip pd-chip--purple">
                  <i class="pi pi-building"></i> COB: {{ peserta.cob.nmAsuransi }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <!-- Bottom gradient card -->
        <div
          v-show="isPoliklinikMode"
          class="mt-4 p-3 rounded"
          style="
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #bfdbfe;
          "
        >
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <small class="d-block font-weight-bold" style="color: #1e40af">
                <i class="fas fa-ticket-alt mr-2"></i> NOMOR ANTRIAN
              </small>
              <small style="color: #3b82f6"
                >LOKET <span class="font-weight-bold" style="color: #1e40af">1</span></small
              >
            </div>

            <div class="d-flex align-items-center">
              <a href="#" class="mr-3 font-weight-bold text-decoration-none" style="color: #2563eb">
                <i class="fas fa-users mr-1"></i> Antrian Pasien Online
              </a>
              <!-- <span class="mr-3 px-3 py-1 rounded font-weight-bold"> 0 </span> -->
              <Button label="Panggil Ulang" icon="pi pi-refresh" class="p-button-sm mr-2" />
              <Button label="Panggil" icon="pi pi-volume-up" class="p-button-sm" />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
    <FormInputPasienComponent :os="peserta" :mode="mode_proses_data" :norm="norm" ref="childRef" />

    <ListPasienComponent ref="showPatientDialog" />

    <RiwayatBPJSComponent :noKartu="peserta.noKartu" :view-only="true" ref="riwayatBPJSRef" />
    <RiwayatSuratKontrolComponent
      :noKartu="peserta.noKartu"
      :nomr="peserta.mr?.noMR"
      ref="riwayatSKURef"
    />
  </div>
  <Toast />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { useRoute } from 'vue-router'

import FormPendaftaranComponent from '@/views/Pendaftaran/FormPendaftaranComponent.vue'
import FormInputPasienComponent from '@/views/Pendaftaran/FormInputPasienComponent.vue'
import ListPasienComponent from '@/views/Pendaftaran/ListPasienComponent.vue'
import RiwayatBPJSComponent from '@/views/Pendaftaran/RiwayatBPJSComponent.vue'
import RiwayatSuratKontrolComponent from '@/views/Pendaftaran/RiwayatSuratKontrolComponent.vue'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const pageTitle = computed(() =>
  route.query.mode === 'IGDRANAP'
    ? 'Pendaftaran Pasien IGD/Rawat Inap'
    : 'Pendaftaran Pasien Poliklinik',
)

const isPoliklinikMode = computed(() => route.query.mode !== 'IGDRANAP')

const toast = useToast()

// reactive state
const loading = ref(false)
const showDialogPendaftaran = ref(false)
const totalPasien = ref(0)
const pasienHariIni = ref(0)
const rataKunjungan = ref(0)
const pasienAktif = ref(0)
const fact = ref([])
const listDataRiwayat = ref([])

const tanggalSEP = ref(new Date())
const norm = ref('')
const nomorSepOrNik = ref(null)

const mode_proses_data = ref(1) //1 = input, 2 edit

const GetCaraBayarChild = ref(0)
const function_GetCaraBayarChild = async () => {
  // Access exposed property from child
  return GetCaraBayarChild.value.carabayarSelected.KODE
}
const showPatientDialog = ref(null)
const riwayatBPJSRef = ref(null)
const riwayatSKURef = ref(null)
const openPatientDialog = () => {
  showPatientDialog.value.showDialogInputPasien()
}

const childRef = ref(null)
function callChildFunction() {
  if (childRef.value && childRef.value.showDialogInputPasien) {
    childRef.value.showDialogInputPasien()
  }
}

const peserta = ref({
  noKartu: '',
  nik: '',
  nama: '',
  pisa: '',
  sex: '',
  mr: { noMR: '', noTelepon: null },
  tglLahir: '',
  tglCetakKartu: '',
  tglTAT: '',
  tglTMT: '',
  statusPeserta: { kode: '', keterangan: '' },
  provUmum: { kdProvider: '', nmProvider: '' },
  jenisPeserta: { kode: '', keterangan: '' },
  hakKelas: { kode: '', keterangan: '' },
  umur: { umurSekarang: '', umurSaatPelayanan: '' },
  informasi: { dinsos: null, prolanisPRB: null, noSKTM: null, eSEP: null },
  cob: { noAsuransi: null, nmAsuransi: null, tglTMT: null, tglTAT: null },
})

const bannerDismissed = ref(false)
watch(
  () => peserta.value.nama,
  () => {
    bannerDismissed.value = false
  },
)

const getGenderText = (sex) => (sex === 'P' ? 'Perempuan' : sex === 'L' ? 'Laki-laki' : '-')

function resetPeserta() {
  peserta.value = {
    noKartu: '',
    nik: '',
    nama: '',
    pisa: '',
    sex: '',
    mr: { noMR: '', noTelepon: null },
    tglLahir: '',
    tglCetakKartu: '',
    tglTAT: '',
    tglTMT: '',
    statusPeserta: { kode: '', keterangan: '' },
    provUmum: { kdProvider: '', nmProvider: '' },
    jenisPeserta: { kode: '', keterangan: '' },
    hakKelas: { kode: '', keterangan: '' },
    umur: { umurSekarang: '', umurSaatPelayanan: '' },
    informasi: { dinsos: null, prolanisPRB: null, noSKTM: null, eSEP: null },
    cob: { noAsuransi: null, nmAsuransi: null, tglTMT: null, tglTAT: null },
  }
  listRujukan.value = []
}

// search helpers
const cariByRM = async () => {
  // If user typed an RM in norm -> try local lookup first
  if (!norm.value) {
    showWarning('Masukkan No. RM terlebih dahulu')
    return
  }

  await GetDataPasienLocal(3, norm.value)

  // simpan norm yang sudah di-set oleh GetDataPasienLocal sebelum BPJS call menimpanya
  const savedNorm = norm.value

  // try to load online details if nomorSepOrNik is filled after local fetch
  if (nomorSepOrNik.value) {
    await get_data_pesertaOnline(nomorSepOrNik.value)

    // get_data_pesertaOnline menimpa peserta.value dengan data BPJS sehingga mr.noMR hilang,
    // patch kembali agar FormPendaftaranComponent bisa membaca norm dengan benar
    if (savedNorm && peserta.value) {
      peserta.value = {
        ...peserta.value,
        mr: { ...(peserta.value.mr || {}), noMR: savedNorm },
      }
    }
  }
}

const setPasienNonBPJS = async () => {
  peserta.value = {
    noKartu: listDataRiwayat.value.NO_KARTU,
    nik: listDataRiwayat.value.NOKTP,
    nama: listDataRiwayat.value.NAMAPASIEN,
    pisa: '',
    sex: listDataRiwayat.value.JENISKELAMIN,
    mr: { noMR: listDataRiwayat.value.NOMR, noTelepon: listDataRiwayat.value.NOTELP },
    tglLahir: listDataRiwayat.value.TGLLAHIR,
    tglCetakKartu: '',
    tglTAT: '',
    tglTMT: '',
    statusPeserta: { kode: '', keterangan: '' },
    provUmum: { kdProvider: '', nmProvider: '' },
    jenisPeserta: { kode: '', keterangan: '' },
    hakKelas: { kode: '', keterangan: '' },
    umur: { umurSekarang: '', umurSaatPelayanan: '' },
    informasi: { dinsos: null, prolanisPRB: null, noSKTM: null, eSEP: null },
    cob: { noAsuransi: null, nmAsuransi: null, tglTMT: null, tglTAT: null },
  }
}

const callDataOnlinOfline = async () => {
  // prefer nomorSepOrNik for online call, otherwise try norm
  const param = nomorSepOrNik.value
  if (!param) {
    showWarning('Masukkan Nomor BPJS / NIK atau No. RM untuk mencari')
    return
  }
  await get_data_pesertaOnline(param)

  if (peserta.value?.noKartu) {
    await GetDataPasienLocal(1, peserta.value?.noKartu)
    await getRujukan(peserta.value?.noKartu)
  }
}
// API calls
const get_data_pesertaOnline = async (nomor) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    resetPeserta()
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/get_data_peserta_v2/${nomor}/${id_client.value}`,
    )

    if (response.data.metaData.code !== '200') {
      showWarning(response.data.metaData.message)
      return
    }

    if (response?.data?.response) {
      peserta.value = response.data.response.peserta
      showSuccess('Data ditemukan')
    } else {
      showWarning('Peserta tidak ditemukan di layanan BPJS')
    }
  } catch (error) {
    console.error('Error get_data_pesertaOnline:', error)
    showError('Gagal mengambil data peserta online')
  } finally {
    loading.value = false
  }
}

const EditPasien = async () => {
  mode_proses_data.value = 2
  callChildFunction()
}

const InputPasienBaru = async () => {
  mode_proses_data.value = 1
  resetPeserta()
  callChildFunction()
}

const GetDataPasienLocal = async (mode, parameter) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = { mode: mode, noka: parameter, nomr: parameter, id_client: id_client.value }

    const response = await axios.post(
      `${url}/index.php/api/data_referensi/GetDataPasien_v3`,
      payload,
    )

    if (response?.data?.metadata?.code === 200 && response.data.response?.length) {
      const first = response.data.response[0]

      listDataRiwayat.value = first
      norm.value = first.NOMR
      nomorSepOrNik.value = first.NO_KARTU

      peserta.value = {
        ...peserta.value,
        mr: { noMR: listDataRiwayat.value.NOMR, noTelepon: listDataRiwayat.value.NOTELP },
      }
      if (!peserta.value?.noKartu) {
        setPasienNonBPJS()
      }
      // let cara_bayar = await function_GetCaraBayarChild()
      // if (cara_bayar != '5') {

      //}
    } else {
      showError('Data pasien tidak ditemukan (lokal)')
      mode_proses_data.value = 1
      callChildFunction()
    }
  } catch (error) {
    console.error('Error fetching pasien lokal:', error)
    showError('Terjadi kesalahan saat memuat data pasien lokal')
  } finally {
    loading.value = false
  }
}

const isLoading = ref(false)
const carabayarSelected = ref(null)

// Rujukan
const listRujukan = ref([])
const loadingRujukan = ref(false)

const rujukanExpanded = ref({})
const toggleRujukanExpand = (jenisRujukan) => {
  rujukanExpanded.value[jenisRujukan] = !rujukanExpanded.value[jenisRujukan]
}

const isRujukanExpired = (tglKunjungan) => {
  if (!tglKunjungan) return false
  const expiry = new Date(tglKunjungan)
  expiry.setMonth(expiry.getMonth() + 3)
  return new Date() > expiry
}

const getRujukan = async (noKartu) => {
  if (!isPoliklinikMode.value || !noKartu) return
  loadingRujukan.value = true
  listRujukan.value = []
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/get_rujukan_rs_pkm`, {
      no_kartu: noKartu,
      id_client: String(id_client.value),
    })

    if (Array.isArray(response.data)) {
      listRujukan.value = response.data
    }
  } catch (error) {
    console.error('Error getRujukan:', error)
  } finally {
    loadingRujukan.value = false
  }
}

watch(carabayarSelected, (newVal) => {
  if (newVal) {
    try {
      localStorage.setItem('carabayarSelected', JSON.stringify(newVal))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  } else {
    localStorage.removeItem('carabayarSelected')
  }
})

const nomor = ref('')
const jenis = ref('BPJS')
const asalRujukan = ref('FK1')

const asalOptions = [
  { label: 'FK 1', value: 'FK1' },
  { label: 'FK 2', value: 'FK2' },
  { label: 'RS', value: 'RS' },
]

// Toast helpers
const showSuccess = (message = 'Operation successful') => {
  toast.add({ severity: 'success', summary: 'Success Message', detail: message, life: 3000 })
}
const showError = (message = 'An error occurred') => {
  toast.add({ severity: 'error', summary: 'Error', detail: String(message), life: 5000 })
}
const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Warning', detail: message, life: 4000 })
}

const CallDialogPendaftarn = async () => {
  showDialogPendaftaran.value = true
}

const restorePatientFromDraft = (patientData) => {
  peserta.value = patientData
}

const clearPatientData = () => {
  peserta.value = {
    noKartu: '',
    nik: '',
    nama: '',
    pisa: '',
    sex: '',
    mr: { noMR: '', noTelepon: null },
    tglLahir: '',
    tglCetakKartu: '',
    tglTAT: '',
    tglTMT: '',
    statusPeserta: { kode: '', keterangan: '' },
    provUmum: { kdProvider: '', nmProvider: '' },
    jenisPeserta: { kode: '', keterangan: '' },
    hakKelas: { kode: '', keterangan: '' },
    umur: { umurSekarang: '', umurSaatPelayanan: '' },
    informasi: { dinsos: null, prolanisPRB: null, noSKTM: null, eSEP: null },
    cob: { noAsuransi: null, nmAsuransi: null, tglTMT: null, tglTAT: null },
  }
  bannerDismissed.value = false
}

onMounted(() => {
  window.addEventListener('patient-selected', (event) => {
    const selectedPatient = event.detail
    console.log('Selected patient:', selectedPatient)

    // Use the patient data
    // For example:
    // form.NAMAPASIEN = selectedPatient.NAMAPASIEN
    // form.NOMR = selectedPatient.NOMR
    // form.NO_KARTU = selectedPatient.NO_KARTU
  })
  showDialogPendaftaran.value = true
  //GetCaraBayar()
})
</script>

<style scoped>
/* ── Informasi Pasien Card ── */
.pi-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.pi-card-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}

.pi-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}
.pi-identity-empty {
  opacity: 0.5;
}

.pi-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--p-primary-500, #3b82f6), var(--p-primary-700, #1d4ed8));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}
.pi-identity-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.pi-name {
  font-size: 13px;
  font-weight: 700;
  color: #212529;
  line-height: 1.2;
}
.pi-nokartu {
  font-size: 11px;
  color: #6c757d;
  font-family: monospace;
}

.pi-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  width: fit-content;
}
.pi-status-aktif {
  background: #dcfce7;
  color: #15803d;
}
.pi-status-nonaktif {
  background: #fee2e2;
  color: #b91c1c;
}

/* Info list */
.pi-info-list {
  padding: 8px 0;
}
.pi-info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid #f8f9fa;
  transition: background 0.1s;
}
.pi-info-row:last-child {
  border-bottom: none;
}
.pi-info-row:hover {
  background: #f8f9fa;
}

.pi-info-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}
.pi-info-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.pi-info-lbl {
  font-size: 10px;
  color: #adb5bd;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pi-info-val {
  font-size: 12px;
  font-weight: 500;
  color: #343a40;
  word-break: break-word;
}

/* Empty state */
.pi-empty {
  text-align: center;
  padding: 20px 14px;
  color: #adb5bd;
}
.pi-empty p {
  font-size: 12px;
  margin-top: 10px;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.hover-grow {
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
}
.hover-grow:hover {
  transform: scale(1.1);
}

.custom-textarea {
  font-size: 14px !important;
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  padding: 12px !important;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 2rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.table-secondary th {
  background-color: #f3f4f6 !important;
  color: #374151;
}

.status-nonaktif-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #fff1f2;
  border: 1.5px solid #fca5a5;
  border-left: 5px solid #dc2626;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
}
.status-banner-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  animation: banner-pulse 2s ease-in-out infinite;
}
@keyframes banner-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(220, 38, 38, 0);
  }
}
.status-banner-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.82rem;
  color: #991b1b;
}
.status-banner-body strong:first-child {
  font-size: 0.88rem;
  color: #7f1d1d;
}
.status-banner-dismiss {
  flex-shrink: 0;
  align-self: flex-start;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.8rem;
  line-height: 1;
  transition: background 0.15s;
}
.status-banner-dismiss:hover {
  background: #fee2e2;
}
.status-banner-enter-active,
.status-banner-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.status-banner-enter-from,
.status-banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Peserta Detail Panel ── */
.pd-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
}

.pd-metrics-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.pd-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 12px;
  flex: 1;
  min-width: 0;
}

.pd-metric-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.pd-metric-lbl {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  white-space: nowrap;
}

.pd-metric-val {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pd-mono {
  font-family: 'Courier New', monospace;
  font-size: 11px !important;
  letter-spacing: 0.02em;
}

.pd-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  width: fit-content;
}

.pd-badge-aktif {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.pd-badge-nonaktif {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.pd-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.pd-section {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 0;
}

.pd-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 8px 12px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.pd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 6px;
  gap: 2px;
}

.pd-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 5px 8px;
  border-radius: 5px;
  transition: background 0.12s;
}

.pd-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.pd-item--full {
  grid-column: 1 / -1;
}

.pd-lbl {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.38);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.pd-val {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 500;
  word-break: break-word;
}

.pd-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 14px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.pd-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
}

.pd-chip--yellow {
  background: rgba(234, 179, 8, 0.18);
  color: #fde68a;
  border: 1px solid rgba(234, 179, 8, 0.28);
}

.pd-chip--blue {
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.28);
}

.pd-chip--purple {
  background: rgba(168, 85, 247, 0.18);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.28);
}

/* ── Rujukan Bar ── */
.pd-rujukan-bar {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px 14px 10px;
}

.pd-rujukan-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 6px;
}

.pd-rujukan-spinner {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.pd-rujukan-group {
  margin-bottom: 6px;
}

.pd-rujukan-group-header {
  margin-bottom: 3px;
}

.pd-rujukan-content {
  padding-left: 2px;
}

.pd-rujukan-type {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 1px;
}

.pd-rtype-rs {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.pd-rtype-pkm {
  background: rgba(34, 197, 94, 0.18);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.28);
}

.pd-rujukan-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.78);
}

.pd-rj-sep {
  color: rgba(255, 255, 255, 0.25);
  font-size: 10px;
}

.pd-rj-val {
  color: rgba(255, 255, 255, 0.78);
}

.pd-rj-poli {
  color: #93c5fd;
  font-weight: 600;
}

.pd-rj-diag {
  color: #fde68a;
  font-weight: 600;
}

.pd-rujukan-none {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  padding: 1px 0;
}

.pd-rujukan-seemore {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 9px;
  font-weight: 600;
  padding: 2px 10px;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: all 0.15s;
}
.pd-rujukan-seemore:hover {
  border-color: rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.85);
}

.pd-rujukan-row--expired {
  opacity: 0.6;
}

.pd-rj-expired-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
  letter-spacing: 0.04em;
}
</style>
