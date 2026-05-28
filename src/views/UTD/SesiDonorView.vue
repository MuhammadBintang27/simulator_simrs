<template>
  <div class="content">
    <loading_overlay :is-loading="loadingPasien || loadingSesi" message="Memuat..." />
    <Toast />
    <ConfirmDialog />

    <!-- ══ HERO HEADER ══ -->
    <div class="donor-header mb-2">
      <div class="donor-header-left">
        <div class="donor-header-icon">
          <i class="fas fa-hand-holding-heart"></i>
        </div>
        <div>
          <div class="donor-header-title">Sesi Donor Darah</div>
          <div class="donor-header-sub">
            Unit Transfusi Darah — Pencatatan Sesi Donor &amp; Identitas Pendonor
          </div>
        </div>
      </div>
      <div class="donor-header-right">
        <Button
          label="Daftar Sesi Donor"
          icon="pi pi-list"
          class="round-button2 btn-list-sesi"
          @click="showListSesi = true"
        />
      </div>
    </div>

    <!-- ══ DIALOG LIST SESI DONOR ══ -->
    <ListPasienSesiDonor v-model:visible="showListSesi" />

    <!-- ══ SEARCH PASIEN ══ -->
    <Panel class="mb-2">
      <template #header>
        <span style="font-size: 12px; color: #475569; font-weight: 600">
          <h6 style="color: darkcyan; margin: 0">
            <i class="pi pi-user me-1 mr-1"></i>
            <strong>PENCARIAN PENDONOR</strong>
          </h6>
        </span>
      </template>
      <div class="row align-items-end">
        <div class="col-md-4">
          <label>No. Rekam Medis Pendonor</label>
          <InputText
            v-model="searchNomr"
            placeholder="Masukkan No. RM..."
            class="w-100"
            style="font-size: 14px"
            @keyup.enter="cariPasien"
            :disabled="loadingPasien"
          />
        </div>
        <div class="col-md-4 mt-3 mt-md-0">
          <Button
            label="Cari Pasien"
            icon="pi pi-search"
            severity="info"
            :loading="loadingPasien"
            @click="cariPasien"
          />
          <Button
            v-if="pasien"
            icon="pi pi-times"
            severity="secondary"
            outlined
            class="round-button2"
            v-tooltip.top="'Reset pencarian'"
            @click="resetPasien"
          />
        </div>
      </div>
      <small v-if="searchError" class="search-error mt-2 d-block">
        <i class="pi pi-exclamation-circle me-1"></i>{{ searchError }}
      </small>
    </Panel>

    <!-- ══ EMPTY STATE ══ -->
    <div v-if="!pasien && !loadingPasien" class="donor-empty-state">
      <div class="empty-icon"><i class="fas fa-user-circle"></i></div>
      <p class="empty-title">Belum ada data pendonor</p>
      <small>Masukkan No. Rekam Medis untuk mencari data pasien pendonor</small>
    </div>

    <!-- ══ PASIEN + FORM (side by side) ══ -->
    <div v-if="pasien" class="row">
      <!-- Kolom kiri: identitas pasien -->
      <div class="col-md-2">
        <Panel>
          <template #header>
            <span style="font-size: 12px; color: #475569; font-weight: 600">
              <h6 style="color: darkcyan; margin: 0">
                <i class="pi pi-user me-1 mr-1"></i>
                <strong>SESI DONOR DARAH</strong>
              </h6>
            </span>
          </template>

          <img
            src="https://ws-simrs.net/ilustration/ilustrasi1.png"
            height="130"
            width="195"
            alt=""
          />

          <hr />

          <div class="patient-card">
            <h4 class="patient-name">
              <strong class="mr-2">{{ pasien.NAMAPASIEN }}</strong>
              <i
                :class="pasien.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                :style="{
                  fontSize: '20px',
                  color: pasien.JENISKELAMIN === 'P' ? 'violet' : 'steelblue',
                }"
              ></i>
            </h4>
            <dl class="patient-details">
              <dt>RM</dt>
              <dd>{{ pasien.NOMR }}</dd>

              <dt><i class="pi pi-calendar me-1"></i> Tgl. Lahir</dt>
              <dd>{{ formatTgl(pasien.TGLLAHIR) }}</dd>

              <dt><i class="pi pi-map-marker me-1"></i> Tempat Lahir</dt>
              <dd>{{ pasien.TEMPAT || '-' }}</dd>

              <dt><i class="pi pi-home me-1"></i> Alamat</dt>
              <dd>{{ pasien.ALAMAT || pasien.ALAMAT_KTP || '-' }}</dd>

              <dt><i class="pi pi-globe me-1"></i> Wilayah</dt>
              <dd>
                {{
                  [pasien.namakelurahan, pasien.namakecamatan, pasien.namakota]
                    .filter(Boolean)
                    .join(', ') || '-'
                }}
              </dd>

              <dt><i class="pi pi-phone me-1"></i> Telepon</dt>
              <dd>{{ pasien.NOTELP || '-' }}</dd>

              <dt><i class="pi pi-credit-card me-1"></i> No. BPJS</dt>
              <dd>
                <span class="id-mono">{{ pasien.NO_KARTU || '-' }}</span>
              </dd>

              <dt><i class="pi pi-lock me-1"></i> NIK (KTP)</dt>
              <dd>
                <span class="id-mono">{{ pasien.NOKTP_ENKRIP || '-' }}</span>
              </dd>

              <dt><i class="pi pi-heart me-1"></i> Agama</dt>
              <dd>{{ pasien.AGAMADISPLAY || '-' }}</dd>

              <dt><i class="pi pi-users me-1"></i> Penanggung Jawab</dt>
              <dd>
                <template v-if="pasien.PENANGGUNGJAWAB_NAMA">
                  {{ pasien.PENANGGUNGJAWAB_NAMA }}
                  <small v-if="pasien.PENANGGUNGJAWAB_HUBUNGAN" style="color: #64748b">
                    ({{ pasien.PENANGGUNGJAWAB_HUBUNGAN }})</small
                  >
                </template>
                <template v-else>-</template>
              </dd>
            </dl>
          </div>

          <template #footer>
            <Button
              v-if="!showSesiForm"
              label="Mulai Sesi Donor"
              icon="fas fa-tint"
              class="w-100 round-button2 btn-primary-donor"
              @click="showSesiForm = true"
            />
            <Button
              v-else
              label="Tutup Form Sesi"
              icon="pi pi-times"
              severity="secondary"
              outlined
              class="w-100 round-button2"
              @click="showSesiForm = false"
            />
          </template>
        </Panel>
      </div>

      <!-- Kolom kanan: form sesi donor -->
      <div class="col-md-10">
        <Transition name="sesi-slide">
          <Panel v-if="showSesiForm" class="donor-form-panel">
            <template #header>
              <h6 style="color: darkcyan; margin: 0">
                <strong>SESI DONOR DARAH</strong>
              </h6>
              <span v-if="sesiForm.no_sesi" class="sesi-no-badge ms-auto">
                {{ sesiForm.no_sesi }}
              </span>
            </template>

            <!-- Baris 1: Tanggal Donor + Jenis Donor + Kategori Pendonor -->
            <div class="row">
              <div class="col-md-3">
                <label>Tanggal Donor <span class="req">*</span></label>
                <DatePicker
                  v-model="sesiForm.tgl_donor"
                  dateFormat="yy-mm-dd"
                  :showTime="false"
                  placeholder="Pilih tanggal..."
                  class="w-100"
                  :class="{ 'p-invalid': sesiErrors.tgl_donor }"
                />
                <small v-if="sesiErrors.tgl_donor" class="p-error">{{
                  sesiErrors.tgl_donor
                }}</small>
              </div>
              <div class="col-md-5">
                <label>Jenis Donor <span class="req">*</span></label>
                <Select
                  v-model="sesiForm.jenis_donor"
                  :options="jenisDonorOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Pilih jenis donor..."
                  class="w-100"
                  :class="{ 'p-invalid': sesiErrors.jenis_donor }"
                />
                <small v-if="sesiErrors.jenis_donor" class="p-error">{{
                  sesiErrors.jenis_donor
                }}</small>
              </div>
              <div class="col-md-4">
                <label style="color: darkblue">Kategori Pendonor <span class="req">*</span></label>
                <div class="kelayakan-opts mt-2">
                  <button
                    v-for="opt in kategoriDonorOptions"
                    :key="opt.value"
                    :class="[
                      'kelayakan-btn',
                      { active: sesiForm.kategori_donor === opt.value },
                      'kd-' + opt.cls,
                    ]"
                    @click="sesiForm.kategori_donor = opt.value"
                    type="button"
                  >
                    <i :class="opt.icon + ' me-1'"></i>{{ opt.label }}
                  </button>
                </div>
                <small v-if="sesiErrors.kategori_donor" class="p-error">{{
                  sesiErrors.kategori_donor
                }}</small>
              </div>
            </div>

            <!-- Baris 2: Tanda Vital -->
            <div class="row mt-4">
              <div class="col-md-3">
                <label>Berat Badan <span class="req">*</span></label>
                <InputGroup>
                  <InputNumber
                    v-model="sesiForm.berat_badan"
                    :minFractionDigits="1"
                    :maxFractionDigits="1"
                    placeholder="BB"
                    style="font-size: 14px"
                    :class="{ 'p-invalid': sesiErrors.berat_badan }"
                  />
                  <InputGroupAddon>kg</InputGroupAddon>
                </InputGroup>
                <small v-if="sesiErrors.berat_badan" class="p-error">{{
                  sesiErrors.berat_badan
                }}</small>
              </div>
              <div class="col-md-3">
                <label>Tekanan Darah <span class="req">*</span></label>
                <InputGroup>
                  <InputText
                    v-model="sesiForm.tekanan_darah"
                    placeholder="120/80"
                    style="font-size: 14px"
                    :class="{ 'p-invalid': sesiErrors.tekanan_darah }"
                  />
                  <InputGroupAddon>mmHg</InputGroupAddon>
                </InputGroup>
                <small v-if="sesiErrors.tekanan_darah" class="p-error">{{
                  sesiErrors.tekanan_darah
                }}</small>
              </div>
              <div class="col-md-3">
                <label>Hemoglobin <span class="req">*</span></label>
                <InputGroup>
                  <InputNumber
                    v-model="sesiForm.hemoglobin"
                    :minFractionDigits="1"
                    :maxFractionDigits="1"
                    placeholder="Hb"
                    style="font-size: 14px"
                    :class="{ 'p-invalid': sesiErrors.hemoglobin }"
                  />
                  <InputGroupAddon>g/dL</InputGroupAddon>
                </InputGroup>
                <small v-if="sesiErrors.hemoglobin" class="p-error">{{
                  sesiErrors.hemoglobin
                }}</small>
              </div>
              <div class="col-md-3">
                <label>Suhu Tubuh <span class="req">*</span></label>
                <InputGroup>
                  <InputNumber
                    v-model="sesiForm.suhu_tubuh"
                    :minFractionDigits="1"
                    :maxFractionDigits="1"
                    placeholder="Suhu"
                    style="font-size: 14px"
                    :class="{ 'p-invalid': sesiErrors.suhu_tubuh }"
                  />
                  <InputGroupAddon>°C</InputGroupAddon>
                </InputGroup>
                <small v-if="sesiErrors.suhu_tubuh" class="p-error">{{
                  sesiErrors.suhu_tubuh
                }}</small>
              </div>
            </div>

            <!-- Baris 3: Nadi + Riwayat Penyakit -->
            <div class="row mt-4">
              <div class="col-md-3">
                <label>Denyut Nadi <span class="req">*</span></label>
                <InputGroup>
                  <InputNumber
                    v-model="sesiForm.nadi"
                    :min="40"
                    :max="200"
                    placeholder="Nadi"
                    style="font-size: 14px"
                    :class="{ 'p-invalid': sesiErrors.nadi }"
                  />
                  <InputGroupAddon>/Menit</InputGroupAddon>
                </InputGroup>
                <small v-if="sesiErrors.nadi" class="p-error">{{ sesiErrors.nadi }}</small>
              </div>
              <div class="col-md-9">
                <label>Riwayat Penyakit</label>
                <Textarea
                  v-model="sesiForm.riwayat_penyakit"
                  rows="3"
                  :autoResize="true"
                  placeholder="Isi jika ada riwayat penyakit relevan (opsional)..."
                  class="custom-textarea"
                />
              </div>
            </div>

            <!-- Hasil Screening -->
            <div class="row mt-5">
              <div class="col-md-12">
                <label>Hasil Screening <span class="req">*</span></label>
                <div class="kelayakan-opts mt-2">
                  <button
                    v-for="opt in hasilScreeningOptions"
                    :key="opt.value"
                    :class="[
                      'kelayakan-btn',
                      { active: sesiForm.hasil_screening === opt.value },
                      'kl-' + opt.cls,
                    ]"
                    @click="onHasilScreeningChange(opt.value)"
                    type="button"
                  >
                    <i :class="opt.icon + ' me-1'"></i>{{ opt.label }}
                  </button>
                </div>
                <small v-if="sesiErrors.hasil_screening" class="p-error">{{
                  sesiErrors.hasil_screening
                }}</small>
              </div>
            </div>

            <!-- Alasan Tolak (kondisional) -->
            <Transition name="sesi-slide">
              <div v-if="sesiForm.hasil_screening === 3" class="row mt-3">
                <div class="col-md-6">
                  <label>Alasan Penolakan <span class="req">*</span></label>
                  <Select
                    v-model="sesiForm.alasan_tolak"
                    :options="alasanOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih alasan penolakan..."
                    class="w-100"
                    :class="{ 'p-invalid': sesiErrors.alasan_tolak }"
                  />
                  <small v-if="sesiErrors.alasan_tolak" class="p-error">{{
                    sesiErrors.alasan_tolak
                  }}</small>
                </div>
              </div>
            </Transition>

            <template #footer>
              <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                outlined
                class="round-button2"
                @click="showSesiForm = false"
                :disabled="loadingSesi"
              />
              <Button
                label="Simpan Sesi Donor"
                icon="pi pi-save"
                class="round-button2 btn-primary-donor"
                :loading="loadingSesi"
                @click="simpanSesi"
              />
            </template>
          </Panel>
        </Transition>

        <!-- Placeholder saat form belum dibuka -->
        <div v-if="!showSesiForm" class="form-placeholder">
          <i class="fas fa-hand-holding-heart placeholder-icon"></i>
          <p>
            Klik <strong>"Mulai Sesi Donor"</strong> untuk membuka form pencatatan sesi donor darah
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import ListPasienSesiDonor from '@/views/UTD/ListPasienSesiDonor.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

// ── State ─────────────────────────────────────────────────
const searchNomr = ref('')
const searchError = ref('')
const loadingPasien = ref(false)
const pasien = ref(null)

const showSesiForm = ref(false)
const loadingSesi = ref(false)
const showListSesi = ref(false)

// ── Sesi Form ─────────────────────────────────────────────
const sesiFormDefault = {
  no_sesi: '',
  norm: '',
  id_petugas: null,
  tgl_donor: new Date(),
  jenis_donor: null,
  kategori_donor: null, // SUKARELA | KELUARGA
  berat_badan: null,
  tekanan_darah: '',
  hemoglobin: null,
  suhu_tubuh: null,
  nadi: null,
  riwayat_penyakit: '',
  hasil_screening: 1, // 1=Layak, 2=Ditunda, 3=Ditolak
  alasan_tolak: null,
  status: 0,
}
const sesiForm = ref({ ...sesiFormDefault })
const sesiErrors = ref({})

// ── Options ───────────────────────────────────────────────
const jenisDonorOptions = [
  { label: 'Darah Lengkap (Whole Blood)', value: 'WB' },
  { label: 'Apheresis Trombosit', value: 'APHERESIS_TC' },
  { label: 'Apheresis Plasma', value: 'APHERESIS_PLASMA' },
  { label: 'Apheresis Eritrosit', value: 'APHERESIS_RBC' },
  { label: 'Darah Tali Pusat', value: 'CORD_BLOOD' },
]

const kategoriDonorOptions = [
  { label: 'Sukarela', value: 'SUKARELA', icon: 'pi pi-heart', cls: 'sukarela' },
  { label: 'Keluarga Pasien', value: 'KELUARGA', icon: 'pi pi-users', cls: 'keluarga' },
]

const hasilScreeningOptions = [
  { label: 'Layak Donor', value: 1, icon: 'pi pi-check-circle', cls: 'layak' },
  { label: 'Ditunda', value: 2, icon: 'pi pi-clock', cls: 'ditunda' },
  { label: 'Ditolak', value: 3, icon: 'pi pi-times-circle', cls: 'ditolak' },
]

const alasanOptions = [
  { label: 'Tekanan darah tidak normal', value: 'Tekanan darah tidak normal' },
  { label: 'Berat badan kurang (< 45 kg)', value: 'Berat badan kurang' },
  { label: 'Hemoglobin rendah', value: 'Hemoglobin rendah' },
  { label: 'Suhu tubuh tidak normal', value: 'Suhu tubuh tidak normal' },
  { label: 'Denyut nadi tidak normal', value: 'Denyut nadi tidak normal' },
  { label: 'Sedang sakit / demam', value: 'Sedang sakit / demam' },
  { label: 'Riwayat penyakit tertentu', value: 'Riwayat penyakit tertentu' },
  { label: 'Baru menjalani operasi', value: 'Baru menjalani operasi' },
  { label: 'Mengonsumsi obat tertentu', value: 'Mengonsumsi obat tertentu' },
  { label: 'Usia tidak memenuhi syarat', value: 'Usia tidak memenuhi syarat' },
  { label: 'Lainnya', value: 'Lainnya' },
]

const onHasilScreeningChange = (val) => {
  sesiForm.value.hasil_screening = val
  if (val !== 3) sesiForm.value.alasan_tolak = null
}

// ── Helpers ───────────────────────────────────────────────
const formatTgl = (val) => {
  if (!val) return '-'
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return val
  }
}

const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })

// ── API: Cari Pasien ──────────────────────────────────────
const cariPasien = async () => {
  const nomr = searchNomr.value.trim()
  if (!nomr) {
    searchError.value = 'No. Rekam Medis tidak boleh kosong'
    return
  }
  searchError.value = ''
  pasien.value = null
  showSesiForm.value = false

  try {
    loadingPasien.value = true
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/GetDataPasien_v3`,
      {
        nomr,
        mode: 3,
        id_client: id_client.value,
      },
    )

    const data = res.data?.response?.[0] ?? null
    if (!data) {
      searchError.value = 'Pasien dengan No. RM tersebut tidak ditemukan'
      return
    }

    pasien.value = data
    // Pre-fill sesi form dengan data pasien
    sesiForm.value = {
      ...sesiFormDefault,
      norm: data.NOMR,
      id_petugas: null, // diisi dari user_id saat submit
      tgl_donor: new Date(),
    }
  } catch {
    showError('Gagal menghubungi server. Periksa koneksi.')
  } finally {
    loadingPasien.value = false
  }
}

const resetPasien = () => {
  pasien.value = null
  showSesiForm.value = false
  searchNomr.value = ''
  searchError.value = ''
  sesiErrors.value = {}
}

// ── Validasi Sesi ─────────────────────────────────────────
const validateSesi = () => {
  sesiErrors.value = {}
  if (!sesiForm.value.tgl_donor) sesiErrors.value.tgl_donor = 'Tanggal donor wajib diisi'
  if (!sesiForm.value.jenis_donor) sesiErrors.value.jenis_donor = 'Jenis donor wajib dipilih'
  if (!sesiForm.value.kategori_donor)
    sesiErrors.value.kategori_donor = 'Kategori pendonor wajib dipilih'
  if (!sesiForm.value.berat_badan || sesiForm.value.berat_badan < 45)
    sesiErrors.value.berat_badan = 'Berat badan wajib diisi (min. 45 kg)'
  if (!sesiForm.value.tekanan_darah?.trim())
    sesiErrors.value.tekanan_darah = 'Tekanan darah wajib diisi'
  if (!sesiForm.value.hemoglobin || sesiForm.value.hemoglobin < 8)
    sesiErrors.value.hemoglobin = 'Hemoglobin wajib diisi (min. 8 g/dL)'
  if (!sesiForm.value.suhu_tubuh) sesiErrors.value.suhu_tubuh = 'Suhu tubuh wajib diisi'
  if (!sesiForm.value.nadi) sesiErrors.value.nadi = 'Denyut nadi wajib diisi'
  if (!sesiForm.value.hasil_screening)
    sesiErrors.value.hasil_screening = 'Hasil screening wajib dipilih'
  if (sesiForm.value.hasil_screening === 3 && !sesiForm.value.alasan_tolak)
    sesiErrors.value.alasan_tolak = 'Alasan penolakan wajib dipilih'
  return Object.keys(sesiErrors.value).length === 0
}

// ── API: Simpan Sesi ──────────────────────────────────────
// Map nilai integer hasil_screening ke string uppercase sesuai ekspektasi backend
const hasilScreeningMap = { 1: 'LAYAK', 2: 'DITUNDA', 3: 'DITOLAK' }

const simpanSesi = async () => {
  if (!validateSesi()) return

  confirm.require({
    message: `Simpan sesi donor untuk ${pasien.value.NAMAPASIEN}?`,
    header: 'Konfirmasi Simpan',
    icon: 'pi pi-question-circle',
    rejectLabel: 'Batal',
    acceptLabel: 'Simpan',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'round-button2 btn-primary-donor',
    accept: async () => {
      try {
        loadingSesi.value = true

        const tglDonor = sesiForm.value.tgl_donor
          ? new Date(sesiForm.value.tgl_donor).toISOString().split('T')[0]
          : null

        const payload = {
          norm: sesiForm.value.norm,
          id_petugas: user_id.value,
          tgl_donor: tglDonor,
          jenis_donor: sesiForm.value.jenis_donor, // sudah uppercase (WB, APHERESIS_TC, dst)
          berat_badan: parseFloat(sesiForm.value.berat_badan),
          tekanan_darah: sesiForm.value.tekanan_darah, // format "120/80"
          hemoglobin: parseFloat(sesiForm.value.hemoglobin),
          suhu_tubuh: parseFloat(sesiForm.value.suhu_tubuh),
          nadi: parseInt(sesiForm.value.nadi),
          riwayat_penyakit: sesiForm.value.riwayat_penyakit || null,
          hasil_screening:
            hasilScreeningMap[sesiForm.value.hasil_screening] ?? sesiForm.value.hasil_screening,
          alasan_tolak: sesiForm.value.hasil_screening === 3 ? sesiForm.value.alasan_tolak : null,
          status: sesiForm.value.status ?? 0,
          user_id: user_id.value,
          id_client: id_client.value,
        }

        console.log(JSON.stringify(payload))
        const res = await axios.post(
          `${configStore.apiBaseUrl}/index.php/api/utd/simpan_sesi_donor`,
          payload,
        )

        const code = res.data?.metadata?.code ?? res.data?.code
        if (code == 200 || code === '200') {
          showSuccess('Sesi donor berhasil disimpan')
          showSesiForm.value = false
          sesiErrors.value = {}
        } else {
          showError(res.data?.metadata?.message ?? res.data?.message ?? 'Gagal menyimpan sesi')
        }
      } catch {
        showError('Terjadi kesalahan saat menyimpan')
      } finally {
        loadingSesi.value = false
      }
    },
  })
}
</script>

<style scoped>
/* ── Hero Header ── */
.donor-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
  border-radius: 4px;
  padding: 0.85rem 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.donor-header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.donor-header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.donor-header-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.donor-header-sub {
  font-size: 0.72rem;
  opacity: 0.85;
  margin-top: 2px;
}

/* ── Tombol donor ── */
.btn-primary-donor {
  background: #c62828 !important;
  border-color: #c62828 !important;
}
.btn-primary-donor:hover {
  background: #b71c1c !important;
  border-color: #b71c1c !important;
}

/* ── Panel search title ── */
.panel-title-sm {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
}

/* ── Search error ── */
.search-error {
  color: #dc2626;
  font-size: 11px;
}

/* ── Empty State ── */
.donor-empty-state {
  text-align: center;
  padding: 56px 20px;
  background: #fff;
  border: 1px dashed #b2dfdb;
  border-radius: 4px;
}
.empty-icon {
  font-size: 3.5rem;
  color: #b2dfdb;
  margin-bottom: 12px;
}
.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 6px;
}
.donor-empty-state small {
  font-size: 12px;
  color: #94a3b8;
}

/* ── Patient card (dl/dt/dd) — copy dari FormPoliKlinikView ── */
.patient-card {
  padding: 0rem;
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
.id-mono {
  font-family: monospace;
  font-size: 12px;
  letter-spacing: 0.03em;
}

/* ── Sesi slide transition ── */
.sesi-slide-enter-active,
.sesi-slide-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.sesi-slide-enter-from,
.sesi-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── No sesi badge ── */
.sesi-no-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  font-family: monospace;
  background: #f1f5f9;
  border-radius: 4px;
  padding: 2px 8px;
}

/* ── Custom textarea (sama dengan FormPoliKlinik) ── */
.custom-textarea {
  font-size: 13px !important;
  line-height: 1.3;
  width: 100%;
  padding: 8px !important;
}

/* ── Required mark ── */
.req {
  color: #dc2626;
}
.p-error {
  color: #e24c4c;
  font-size: 0.72rem;
  display: block;
  margin-top: 2px;
}

/* ── Kelayakan / Hasil Screening buttons ── */
.kelayakan-opts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.kelayakan-btn {
  display: inline-flex;
  align-items: center;
  padding: 7px 18px;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}
.kelayakan-btn:hover {
  border-color: #c62828;
  color: #c62828;
}
.kelayakan-btn.active.kl-layak {
  background: #e8f5e9;
  border-color: #43a047;
  color: #2e7d32;
}
.kelayakan-btn.active.kl-ditunda {
  background: #fff8e1;
  border-color: #fb8c00;
  color: #e65100;
}
.kelayakan-btn.active.kl-ditolak {
  background: #ffebee;
  border-color: #e53935;
  color: #c62828;
}
.kelayakan-btn.active.kd-sukarela {
  background: #e0f2fe;
  border-color: #0288d1;
  color: #01579b;
}
.kelayakan-btn.active.kd-keluarga {
  background: #fff3e0;
  border-color: #f57c00;
  color: #e65100;
}

/* ── Form placeholder ── */
.form-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border: 1px dashed #e2e8f0;
  border-radius: 4px;
  text-align: center;
  color: #94a3b8;
}
.placeholder-icon {
  font-size: 2.8rem;
  margin-bottom: 14px;
  opacity: 0.35;
}
.form-placeholder p {
  font-size: 13px;
  margin: 0;
  color: #64748b;
}
</style>
