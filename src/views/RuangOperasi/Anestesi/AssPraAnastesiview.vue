<template>
  <loading_overlay :is-loading="loading" message="Menyimpan data..." />

  <!-- Header Banner -->
  <div class="pra-banner mb-3">
    <div class="banner-icon">
      <!-- <i class="pi pi-heart-fill" style="font-size: 2rem; color: #fff"></i> -->
    </div>
    <div class="banner-content">
      <h4 class="banner-title">Asesmen Pra-Anestesi</h4>
      <p class="banner-desc">
        Formulir penilaian kondisi pasien sebelum tindakan anestesi, meliputi anamnesa, pemeriksaan
        fisik, tanda vital, dan rencana anestesi.
      </p>
    </div>
  </div>

  <form @submit.prevent="simpanData">
    <div class="row g-3">
      <!-- ===== ANAMNESA ===== -->
      <div class="col-12">
        <div class="pra-card">
          <div class="card-section-header anamnesa-header">
            <i class="pi pi-user me-2"></i>
            <span>ANAMNESA</span>
            <small class="ms-auto ml-1">Riwayat Pasien</small>
          </div>
          <div class="card-section-body">
            <div class="field-group">
              <label class="field-label">Anamnesa Dari</label>
              <div class="radio-group">
                <RadioButton
                  v-for="opt in ['Pasien', 'Keluarga']"
                  :key="opt"
                  v-model="form.anamnesa.dari"
                  :inputId="'anamnesa-' + opt"
                  :value="opt"
                />
                <template v-for="opt in ['Pasien', 'Keluarga']" :key="'lbl-' + opt">
                  <label :for="'anamnesa-' + opt" class="radio-label">{{ opt }}</label>
                </template>
              </div>
            </div>

            <div class="section-divider"><span>Riwayat Medis</span></div>

            <div class="row g-3">
              <div class="col-md-6">
                <div class="field-group">
                  <label class="field-label">Riwayat Anestesi</label>
                  <Textarea
                    v-model="form.anamnesa.riwayatAnestesi"
                    placeholder="Sebutkan jika ada..."
                    rows="3"
                    class="w-100"
                    autoResize
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="field-group">
                  <label class="field-label">Komplikasi</label>
                  <Textarea
                    v-model="form.anamnesa.komplikasi"
                    placeholder="Sebutkan jika ada..."
                    rows="3"
                    class="w-100"
                    autoResize
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="field-group">
                  <label class="field-label">Riwayat Alergi</label>
                  <Textarea
                    v-model="form.anamnesa.riwayatAlergi"
                    placeholder="Contoh: Telur, Kacang Kedelai/Tanah..."
                    rows="3"
                    class="w-100"
                    autoResize
                  />
                </div>
              </div>
              <div class="col-md-6">
                <div class="field-group">
                  <label class="field-label">Obat-obatan yang Sedang Dikonsumsi</label>
                  <Textarea
                    v-model="form.anamnesa.obatObatan"
                    placeholder="Sebutkan nama obat dan dosisnya..."
                    rows="3"
                    class="w-100"
                    autoResize
                  />
                </div>
              </div>
            </div>

            <div class="section-divider"><span>Riwayat Penyakit</span></div>

            <div class="penyakit-grid">
              <div
                v-for="penyakit in daftarPenyakit"
                :key="penyakit.value"
                class="penyakit-item"
                :class="{
                  'penyakit-active': form.anamnesa.riwayatPenyakit.includes(penyakit.value),
                }"
                @click="togglePenyakit(penyakit.value)"
              >
                <Checkbox
                  v-model="form.anamnesa.riwayatPenyakit"
                  :inputId="'penyakit-' + penyakit.value"
                  :value="penyakit.value"
                  @click.stop
                />
                <label :for="'penyakit-' + penyakit.value" class="penyakit-label">
                  {{ penyakit.label }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PEMERIKSAAN FISIK ===== -->
      <div class="col-md-6">
        <div class="pra-card h-100">
          <div class="card-section-header fisik-header">
            <i class="pi pi-chart-bar me-2"></i>
            <span>PEMERIKSAAN FISIK</span>
            <small class="ms-auto ml-1">Antropometri & Klasifikasi</small>
          </div>
          <div class="card-section-body">
            <div class="section-divider"><span>Antropometri</span></div>

            <div class="row g-3">
              <div class="col-6">
                <div class="field-group">
                  <label class="field-label">Berat Badan</label>
                  <InputGroup>
                    <InputNumber
                      v-model="form.fisik.beratBadan"
                      placeholder="0"
                      :min="0"
                      :max="300"
                      :minFractionDigits="0"
                      :maxFractionDigits="1"
                      class="w-full"
                      @update:modelValue="hitungImt"
                    />
                    <InputGroupAddon>kg</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
              <div class="col-6">
                <div class="field-group">
                  <label class="field-label">Tinggi Badan</label>
                  <InputGroup>
                    <InputNumber
                      v-model="form.fisik.tinggiBadan"
                      placeholder="0"
                      :min="0"
                      :max="300"
                      :minFractionDigits="0"
                      :maxFractionDigits="1"
                      class="w-full"
                      @update:modelValue="hitungImt"
                    />
                    <InputGroupAddon>cm</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </div>

            <!-- IMT -->
            <div class="field-group">
              <label class="field-label">
                IMT (Indeks Massa Tubuh)
                <Tag v-if="kategorImt" :severity="severityImt" :value="kategorImt" class="ms-2" />
              </label>
              <InputGroup>
                <InputNumber
                  v-model="form.fisik.imt"
                  placeholder="—"
                  :minFractionDigits="2"
                  :maxFractionDigits="2"
                  :disabled="true"
                  class="w-full"
                />
                <InputGroupAddon>kg/m²</InputGroupAddon>
              </InputGroup>
              <div v-if="form.fisik.imt" class="mt-2">
                <div class="progress" style="height: 6px; border-radius: 4px">
                  <div
                    class="progress-bar"
                    :class="imtProgressClass"
                    :style="{ width: imtProgressWidth }"
                  ></div>
                </div>
                <div class="imt-scale">
                  <span>&lt;18.5 Kurus</span>
                  <span>18.5–25 Normal</span>
                  <span>25–30 Gemuk</span>
                  <span>&gt;30 Obesitas</span>
                </div>
              </div>
            </div>

            <div class="section-divider"><span>Klasifikasi Klinis</span></div>

            <div class="field-group">
              <label class="field-label">Mallampati</label>
              <Select
                v-model="form.fisik.mallampati"
                :options="mallampatiOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Kelas Mallampati"
                class="w-100"
                style="width: 100%"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Status Fisik ASA</label>
              <Select
                v-model="form.fisik.statusAsa"
                :options="asaOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Status ASA"
                class="w-100"
                style="width: 100%"
              />
              <div v-if="form.fisik.statusAsa" class="sub-field mt-2">
                <small>{{ asaDesc[form.fisik.statusAsa] }}</small>
              </div>
            </div>

            <div class="section-divider"><span>Kebiasaan / Adiksi</span></div>

            <div class="adiksi-row">
              <div class="adiksi-item">
                <label class="field-label-sm">Merokok</label>
                <div class="radio-group">
                  <RadioButton v-model="form.adiksi.merokok" inputId="merokok-ya" value="ya" />
                  <label for="merokok-ya" class="radio-label">Ya</label>
                  <RadioButton
                    v-model="form.adiksi.merokok"
                    inputId="merokok-tidak"
                    value="tidak"
                  />
                  <label for="merokok-tidak" class="radio-label">Tidak</label>
                </div>
              </div>
              <div class="adiksi-item">
                <label class="field-label-sm">Alkohol</label>
                <div class="radio-group">
                  <RadioButton v-model="form.adiksi.alkohol" inputId="alkohol-ya" value="ya" />
                  <label for="alkohol-ya" class="radio-label">Ya</label>
                  <RadioButton
                    v-model="form.adiksi.alkohol"
                    inputId="alkohol-tidak"
                    value="tidak"
                  />
                  <label for="alkohol-tidak" class="radio-label">Tidak</label>
                </div>
              </div>
              <div class="adiksi-item">
                <label class="field-label-sm">Obat Terlarang</label>
                <div class="radio-group">
                  <RadioButton v-model="form.adiksi.obatTerlarang" inputId="obat-ya" value="ya" />
                  <label for="obat-ya" class="radio-label">Ya</label>
                  <RadioButton
                    v-model="form.adiksi.obatTerlarang"
                    inputId="obat-tidak"
                    value="tidak"
                  />
                  <label for="obat-tidak" class="radio-label">Tidak</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== TANDA VITAL ===== -->
      <div class="col-md-6">
        <div class="pra-card h-100">
          <div class="card-section-header vital-header">
            <i class="pi pi-heart me-2"></i>
            <span>TANDA VITAL</span>
            <small class="ms-auto ml-1">Pemeriksaan Saat Ini</small>
          </div>
          <div class="card-section-body">
            <div class="section-divider"><span>Parameter Vital</span></div>

            <div class="row g-3">
              <div class="col-6">
                <div class="field-group">
                  <label class="field-label">Nadi</label>
                  <InputGroup>
                    <InputNumber
                      v-model="form.tandaVital.nadi"
                      placeholder="0"
                      :min="0"
                      :max="300"
                      class="w-full"
                    />
                    <InputGroupAddon>bpm</InputGroupAddon>
                  </InputGroup>
                  <small v-if="form.tandaVital.nadi" class="status-text">{{ nadiStatus }}</small>
                </div>
              </div>
              <div class="col-6">
                <div class="field-group">
                  <label class="field-label">Nafas</label>
                  <InputGroup>
                    <InputNumber
                      v-model="form.tandaVital.nafas"
                      placeholder="0"
                      :min="0"
                      :max="100"
                      class="w-full"
                    />
                    <InputGroupAddon>x/menit</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
              <div class="col-6">
                <div class="field-group">
                  <label class="field-label">Suhu Badan</label>
                  <InputGroup>
                    <InputNumber
                      v-model="form.tandaVital.suhuBadan"
                      placeholder="0"
                      :min="0"
                      :max="50"
                      :minFractionDigits="1"
                      :maxFractionDigits="1"
                      class="w-full"
                    />
                    <InputGroupAddon>°C</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
              <div class="col-6">
                <div class="field-group">
                  <label class="field-label">SpO₂</label>
                  <InputGroup>
                    <InputNumber
                      v-model="form.tandaVital.spo2"
                      placeholder="0"
                      :min="0"
                      :max="100"
                      class="w-full"
                    />
                    <InputGroupAddon>%</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Tekanan Darah</label>
              <InputGroup>
                <InputNumber
                  v-model="form.tandaVital.tekananDarahSistolik"
                  placeholder="Sistolik"
                  :min="0"
                  :max="300"
                  class="w-full"
                />
                <InputGroupAddon>/</InputGroupAddon>
                <InputNumber
                  v-model="form.tandaVital.tekananDarahDiastolik"
                  placeholder="Diastolik"
                  :min="0"
                  :max="300"
                  class="w-full"
                />
                <InputGroupAddon>mmHg</InputGroupAddon>
              </InputGroup>
              <small v-if="form.tandaVital.tekananDarahSistolik" class="status-text">
                {{ tekananDarahStatus }}
              </small>
            </div>

            <div class="section-divider"><span>Skor Nyeri (NRS)</span></div>

            <div class="field-group mb-0">
              <label class="field-label">
                Numeric Rating Scale
                <Tag
                  v-if="form.tandaVital.skorNyeri !== null"
                  :severity="severitySkorNyeri"
                  :value="labelSkorNyeri"
                  class="ms-2"
                />
              </label>
              <div class="nrs-selector">
                <div class="d-flex gap-1">
                  <button
                    v-for="n in 11"
                    :key="n - 1"
                    type="button"
                    class="nrs-btn"
                    :class="[
                      nrsBtnColor(n - 1),
                      { 'nrs-active': form.tandaVital.skorNyeri === n - 1 },
                    ]"
                    @click="form.tandaVital.skorNyeri = n - 1"
                  >
                    {{ n - 1 }}
                  </button>
                </div>
                <div class="d-flex justify-content-between mt-1">
                  <small class="text-muted">0 = Tidak Nyeri</small>
                  <small class="text-muted">10 = Nyeri Berat</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== RENCANA ANESTESI ===== -->
      <div class="col-12">
        <div class="pra-card">
          <div class="card-section-header rencana-header">
            <i class="pi pi-cog me-2"></i>
            <span>RENCANA ANESTESI</span>
            <small class="ms-auto ml-1">Perencanaan Tindakan</small>
          </div>
          <div class="card-section-body">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="field-group">
                  <label class="field-label">Jenis Anestesi</label>
                  <Select
                    v-model="form.rencana.jenisAnestesi"
                    :options="jenisAnestesiOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Jenis Anestesi"
                    class="w-100"
                    style="width: 100%"
                  />
                </div>
              </div>
              <div class="col-md-4">
                <div class="field-group">
                  <label class="field-label">Teknik Anestesi</label>
                  <Select
                    v-model="form.rencana.teknikAnestesi"
                    :options="teknikAnestesiOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Teknik Anestesi"
                    class="w-100"
                    style="width: 100%"
                  />
                </div>
              </div>
              <div class="col-md-4">
                <div class="field-group">
                  <label class="field-label">Posisi Operasi</label>
                  <Select
                    v-model="form.rencana.posisiOperasi"
                    :options="posisiOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih Posisi"
                    class="w-100"
                    style="width: 100%"
                  />
                </div>
              </div>
              <div class="col-md-4">
                <div class="field-group">
                  <label class="field-label">Tanggal Operasi</label>
                  <DatePicker
                    v-model="form.rencana.tanggalOperasi"
                    dateFormat="yy-mm-dd"
                    placeholder="yyyy-mm-dd"
                    showIcon
                    class="w-100"
                  />
                </div>
              </div>
              <div class="col-md-8">
                <div class="field-group">
                  <label class="field-label">Diagnosa Pra Operasi</label>
                  <InputText
                    v-model="form.rencana.diagnosa"
                    placeholder="Masukkan diagnosa pra operasi"
                    class="w-100"
                  />
                </div>
              </div>
              <div class="col-12">
                <div class="field-group mb-0">
                  <label class="field-label">Catatan Tambahan</label>
                  <Textarea
                    v-model="form.rencana.catatan"
                    placeholder="Catatan tambahan untuk tim anestesi..."
                    rows="3"
                    class="w-100"
                    autoResize
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== OTORISASI / TANDA TANGAN DIGITAL ===== -->
    <div class="col-12 mt-3">
      <div class="pra-card">
        <div class="card-section-header otorisasi-header">
          <i class="pi pi-shield me-2"></i>
          <span>OTORISASI</span>
          <small class="ms-auto ml-1"> Tanda Tangan Digital Dokter Anestesi</small>
        </div>
        <div class="card-section-body">
          <!-- Belum ditandatangani -->
          <div v-if="!tte.dokter_anestesi.signed" class="tte-unsigned-area">
            <div class="tte-unsigned-icon">
              <i class="pi pi-pen-to-square"></i>
            </div>
            <div class="tte-unsigned-info">
              <p class="tte-unsigned-title">Dokumen Belum Ditandatangani</p>
              <p class="tte-unsigned-desc">
                Klik tombol di bawah untuk melakukan otorisasi tanda tangan digital dokter anestesi.
                Nama akan terisi otomatis setelah proses verifikasi berhasil.
              </p>
              <Button
                label="Tanda Tangan Digital"
                icon="pi pi-pen-to-square"
                class="btn-tte"
                @click="openTTE()"
              />
            </div>
          </div>

          <!-- Sudah ditandatangani + QR Code -->
          <Transition name="qr-fade">
            <div v-if="tte.dokter_anestesi.signed" class="tte-signed-area">
              <div class="tte-signed-info">
                <div class="tte-verified-badge otorisasi-verified">
                  <i class="pi pi-verified"></i>
                  <div class="tte-info">
                    <span class="tte-field-label">nama_dokter_anestesi</span>
                    <span class="tte-name">{{ tte.dokter_anestesi.nama }}</span>
                    <span class="tte-field-label mt-1">tte_dokter_anestesi</span>
                    <span class="tte-id">{{ tte.dokter_anestesi.username }}</span>
                    <span class="tte-field-label mt-1">tte_waktu_dokter_anestesi</span>
                    <span class="tte-time">{{ tte.dokter_anestesi.timestamp }}</span>
                  </div>
                </div>
                <div class="tte-signed-meta mt-3">
                  <div class="tte-meta-item">
                    <i class="pi pi-file-check"></i>
                    <span>Asesmen Pra-Anestesi</span>
                  </div>
                  <div class="tte-meta-item">
                    <i class="pi pi-hashtag"></i>
                    <span>{{ form.kode_booking }}</span>
                  </div>
                </div>
              </div>
              <div class="tte-qr-wrapper">
                <div class="qr-label">Verifikasi Dokumen</div>
                <div class="qr-box">
                  <QrcodeVue :value="qrCodeData" :size="160" level="H" render-as="svg" />
                </div>
                <small class="qr-hint">Scan untuk memverifikasi keaslian dokumen</small>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar mt-3">
      <div class="action-bar-inner">
        <div class="action-info">
          <i class="pi pi-info-circle me-2" style="color: #6c757d"></i>
          <span>Pastikan semua data sudah diisi dengan benar sebelum menyimpan.</span>
        </div>
        <div class="action-buttons">
          <Button
            label="Reset Form"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            type="button"
            class="me-2"
            @click="resetForm"
          />
          <Button
            label="Simpan Data"
            icon="pi pi-save"
            class="btn-save-pra"
            :loading="loading"
            @click="simpanData()"
          />
        </div>
      </div>
    </div>
  </form>

  <!-- TTE Dialog -->
  <ttdUser
    v-model:showFormOtorisasi="showTTEDialog"
    :noregister="form.no_register"
    :mode="0"
    :link_ttd="'ttd_assemen_pra_anastesi'"
    @otpVerified="handleTTEVerified"
  />

  <Toast />
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import DatePicker from 'primevue/datepicker'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import QrcodeVue from 'qrcode.vue'

const toast = useToast()

const loading = ref(false)

import axios from 'axios'

import { useConfigStore } from '@/stores/config' // Import the Pinia store

const showDialog = ref(false)

import { useRoute } from 'vue-router'
const route = useRoute()

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

const form = reactive({
  kode_booking: route.query.kodebooking,
  no_register: route.query.noreg,
  id_client: id_client.value,
  anamnesa: {
    dari: 'Pasien',
    riwayatAnestesi: '',
    komplikasi: '',
    riwayatAlergi: '',
    obatObatan: '',
    riwayatPenyakit: [],
  },
  fisik: {
    beratBadan: null,
    tinggiBadan: null,
    imt: null,
    mallampati: null,
    statusAsa: null,
  },
  adiksi: {
    alkohol: 'tidak',
    obatTerlarang: 'tidak',
    merokok: 'tidak',
  },
  tandaVital: {
    nadi: 94,
    nafas: 22,
    tekananDarahSistolik: 120,
    tekananDarahDiastolik: 80,
    suhuBadan: 36,
    skorNyeri: null,
    spo2: null,
  },
  rencana: {
    jenisAnestesi: null,
    teknikAnestesi: null,
    posisiOperasi: null,
    tanggalOperasi: null,
    diagnosa: '',
    catatan: '',
  },
})

// ===== TTE =====
const tte = ref({
  dokter_anestesi: { signed: false, username: '', nama: '', timestamp: '' },
})
const showTTEDialog = ref(false)

const openTTE = () => {
  showTTEDialog.value = true
}

const handleTTEVerified = ({ username }) => {
  tte.value.dokter_anestesi.signed = true
  tte.value.dokter_anestesi.username = username
  tte.value.dokter_anestesi.nama = username
  tte.value.dokter_anestesi.timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  getPraAnestesi()
}

const qrCodeData = computed(() =>
  JSON.stringify({
    dokumen: 'Asesmen Pra-Anestesi',
    noregister: form.no_register,
    kode_booking: form.kode_booking,
    tanda_tangan: {
      nama_dokter_anestesi: tte.value.dokter_anestesi.nama,
      tte_dokter_anestesi: tte.value.dokter_anestesi.username,
      tte_waktu_dokter_anestesi: tte.value.dokter_anestesi.timestamp,
    },
  }),
)

// ===== OPTIONS =====
const daftarPenyakit = [
  { label: 'Hipertensi', value: 'hipertensi' },
  { label: 'Diabetes Melitus', value: 'dm' },
  { label: 'Asma', value: 'asma' },
  { label: 'Jantung', value: 'jantung' },
  { label: 'Ginjal', value: 'ginjal' },
  { label: 'Hati / Liver', value: 'hati' },
  { label: 'TBC', value: 'tbc' },
  { label: 'Stroke', value: 'stroke' },
  { label: 'Epilepsi', value: 'epilepsi' },
  { label: 'Anemia', value: 'anemia' },
  { label: 'Tiroid', value: 'tiroid' },
  { label: 'Lainnya', value: 'lainnya' },
]

const mallampatiOptions = [
  { label: 'Kelas I — Uvula, faucial pillars, soft palate terlihat jelas', value: 1 },
  { label: 'Kelas II — Faucial pillars, soft palate terlihat', value: 2 },
  { label: 'Kelas III — Hanya soft palate terlihat', value: 3 },
  { label: 'Kelas IV — Soft palate tidak terlihat', value: 4 },
]

const asaOptions = [
  { label: 'ASA I — Pasien sehat normal', value: 'I' },
  { label: 'ASA II — Penyakit sistemik ringan', value: 'II' },
  { label: 'ASA III — Penyakit sistemik berat', value: 'III' },
  { label: 'ASA IV — Penyakit sistemik berat, ancaman jiwa', value: 'IV' },
  { label: 'ASA V — Pasien moribund', value: 'V' },
  { label: 'ASA VI — Brain-dead, donor organ', value: 'VI' },
]

const asaDesc = {
  I: 'Tidak ada gangguan organik, fisiologis, biokimia, atau psikiatri.',
  II: 'Penyakit sistemik ringan-sedang, tanpa keterbatasan fungsional.',
  III: 'Penyakit sistemik berat dengan keterbatasan fungsional.',
  IV: 'Penyakit sistemik berat yang mengancam jiwa secara konstan.',
  V: 'Pasien sekarat, diharapkan tidak bertahan >24 jam tanpa operasi.',
  VI: 'Pasien mati otak sebagai donor organ.',
}

const jenisAnestesiOptions = [
  { label: 'Anestesi Umum (GA)', value: 'ga' },
  { label: 'Anestesi Regional', value: 'regional' },
  { label: 'Anestesi Lokal', value: 'lokal' },
  { label: 'Anestesi Kombinasi', value: 'kombinasi' },
]

const teknikAnestesiOptions = [
  { label: 'Intubasi ETT', value: 'ett' },
  { label: 'LMA (Laryngeal Mask Airway)', value: 'lma' },
  { label: 'Spinal', value: 'spinal' },
  { label: 'Epidural', value: 'epidural' },
  { label: 'Blok Saraf Perifer', value: 'blok' },
  { label: 'TIVA (Total Intravenous Anesthesia)', value: 'tiva' },
]

const posisiOptions = [
  { label: 'Supine (Telentang)', value: 'supine' },
  { label: 'Prone (Tengkurap)', value: 'prone' },
  { label: 'Lateral Dekubitus Kanan', value: 'lateral-kanan' },
  { label: 'Lateral Dekubitus Kiri', value: 'lateral-kiri' },
  { label: 'Litotomi', value: 'litotomi' },
  { label: 'Trendelenburg', value: 'trendelenburg' },
  { label: 'Fowler', value: 'fowler' },
]

// ===== COMPUTED =====
const kategorImt = computed(() => {
  const v = form.fisik.imt
  if (!v) return null
  if (v < 18.5) return 'Kurus'
  if (v < 25) return 'Normal'
  if (v < 30) return 'Gemuk'
  return 'Obesitas'
})

const severityImt = computed(() => {
  const v = form.fisik.imt
  if (!v) return 'secondary'
  if (v < 18.5) return 'warn'
  if (v < 25) return 'success'
  if (v < 30) return 'warn'
  return 'danger'
})

const imtProgressClass = computed(() => {
  const v = form.fisik.imt
  if (!v) return 'bg-secondary'
  if (v < 18.5) return 'bg-info'
  if (v < 25) return 'bg-success'
  if (v < 30) return 'bg-warning'
  return 'bg-danger'
})

const imtProgressWidth = computed(() => {
  const v = form.fisik.imt
  if (!v) return '0%'
  return Math.min((v / 40) * 100, 100).toFixed(0) + '%'
})

const labelSkorNyeri = computed(() => {
  const s = form.tandaVital.skorNyeri
  if (s === null) return null
  if (s === 0) return 'Tidak Nyeri'
  if (s <= 3) return 'Ringan'
  if (s <= 6) return 'Sedang'
  return 'Berat'
})

const severitySkorNyeri = computed(() => {
  const s = form.tandaVital.skorNyeri
  if (s === null) return 'secondary'
  if (s === 0) return 'success'
  if (s <= 3) return 'info'
  if (s <= 6) return 'warn'
  return 'danger'
})

const nadiStatus = computed(() => {
  const n = form.tandaVital.nadi
  if (!n) return ''
  if (n < 60) return '⚠ Bradikardia'
  if (n <= 100) return '✓ Normal'
  return '⚠ Takikardia'
})

const tekananDarahStatus = computed(() => {
  const s = form.tandaVital.tekananDarahSistolik
  const d = form.tandaVital.tekananDarahDiastolik
  if (!s) return ''
  if (s < 90) return '⚠ Hipotensi'
  if (s <= 120 && d <= 80) return '✓ Normal'
  if (s <= 139 || d <= 89) return '⚠ Prahipertensi'
  return '⚠ Hipertensi'
})

// ===== NRS COLOR =====
function nrsBtnColor(n) {
  if (n === 0) return 'nrs-0'
  if (n <= 3) return 'nrs-mild'
  if (n <= 6) return 'nrs-moderate'
  return 'nrs-severe'
}

// ===== METHODS =====
function togglePenyakit(val) {
  const idx = form.anamnesa.riwayatPenyakit.indexOf(val)
  if (idx === -1) form.anamnesa.riwayatPenyakit.push(val)
  else form.anamnesa.riwayatPenyakit.splice(idx, 1)
}

function hitungImt() {
  const bb = form.fisik.beratBadan
  const tb = form.fisik.tinggiBadan
  if (bb && tb && tb > 0) {
    const tbM = tb / 100
    form.fisik.imt = bb / (tbM * tbM)
  } else {
    form.fisik.imt = null
  }
}

function resetForm() {
  Object.assign(form.anamnesa, {
    dari: 'Pasien',
    riwayatAnestesi: '',
    komplikasi: '',
    riwayatAlergi: '',
    obatObatan: '',
    riwayatPenyakit: [],
  })
  Object.assign(form.fisik, {
    beratBadan: null,
    tinggiBadan: null,
    imt: null,
    mallampati: null,
    statusAsa: null,
  })
  Object.assign(form.tandaVital, {
    nadi: null,
    nafas: null,
    tekananDarahSistolik: null,
    tekananDarahDiastolik: null,
    suhuBadan: null,
    skorNyeri: null,
    spo2: null,
  })
  Object.assign(form.rencana, {
    jenisAnestesi: null,
    teknikAnestesi: null,
    posisiOperasi: null,
    tanggalOperasi: null,
    diagnosa: '',
    catatan: '',
  })
  toast.add({ severity: 'info', summary: 'Reset', detail: 'Form berhasil direset', life: 3000 })
}

const simpanData = async () => {
  try {
    loading.value = true

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/insert_pra_anestesi`, form)

    if (response.data.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Data Tersimpan',
        detail: 'Data berhasil disimpan',
        life: 3000,
      })
    } else {
      toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menyimpan data', life: 3000 })
    }

    loading.value = false
  } catch (error) {
    loading.value = false
    toast.add({ severity: 'error', summary: 'Error', detail: 'Terjadi kesalahan.', life: 3000 })
    console.error('Error fetching data:', error)
  }
}

const getPraAnestesi = async () => {
  try {
    loading.value = true

    const params = {
      kode_booking: route.query.kodebooking,
      no_register: route.query.noreg,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/get_pra_anestesi`, params)

    const { status, code, data } = response.data

    if (status && code === 200 && data) {
      Object.assign(form.anamnesa, data.anamnesa)
      Object.assign(form.fisik, data.fisik)
      Object.assign(form.adiksi, data.adiksi)
      Object.assign(form.tandaVital, data.tandaVital)
      Object.assign(form.rencana, {
        ...data.rencana,
        tanggalOperasi: data.rencana.tanggalOperasi
          ? data.rencana.tanggalOperasi.split('T')[0]
          : null,
      })
      // Restore TTE state dari server (nested di data.tanda_tangan)
      const ttd = data.tanda_tangan
      if (ttd?.tte_dokter_anestesi) {
        tte.value.dokter_anestesi.signed = true
        tte.value.dokter_anestesi.username = ttd.tte_dokter_anestesi
        tte.value.dokter_anestesi.nama = ttd.nama_dokter_anestesi || ttd.tte_dokter_anestesi
        tte.value.dokter_anestesi.timestamp = ttd.tte_waktu_dokter_anestesi || ''
      }
    }

    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('Error fetching data:', error)
  }
}

onMounted(async () => {
  await getPraAnestesi()
})
</script>

<style scoped>
/* ====== Banner ====== */
.pra-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%);
  border-radius: 4px;
  padding: 1rem 1.5rem;
  color: #fff;
}
.banner-title {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 700;
}
.banner-desc {
  margin: 0;
  font-size: 0.82rem;
  opacity: 0.88;
  line-height: 1.5;
}

/* ====== Cards ====== */
.pra-card {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
  border: 1px solid #e9ecef;
}
.card-section-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.1rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  letter-spacing: 0.04em;
}
.card-section-header small {
  font-size: 0.72rem;
  font-weight: 400;
  opacity: 0.88;
}
.anamnesa-header,
.fisik-header,
.vital-header,
.rencana-header {
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
}
.card-section-body {
  padding: 1rem 1.1rem;
}

/* ====== Fields ====== */
.field-group {
  margin-bottom: 1rem;
}
.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.35rem;
  line-height: 1.4;
}
.field-label-sm {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
}
.radio-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
}
.radio-label {
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
}
.sub-field {
  background: #f8f9fa;
  border-left: 3px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  border-radius: 0 6px 6px 0;
  font-size: 0.8rem;
  color: #6b7280;
}

/* ====== Section Divider ====== */
.section-divider {
  display: flex;
  align-items: center;
  margin: 0.75rem 0;
  gap: 0.5rem;
  font-size: 0.73rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

/* ====== IMT Scale ====== */
.imt-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  color: #aaa;
}

/* ====== Status Text ====== */
.status-text {
  font-size: 0.75rem;
  color: #6b7280;
  display: block;
  margin-top: 0.2rem;
}

/* ====== Adiksi Row ====== */
.adiksi-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f9fafb;
  border-radius: 4px;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
}
.adiksi-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.adiksi-item .field-label-sm {
  min-width: 100px;
  margin-bottom: 0;
}
.adiksi-item .radio-group {
  flex: 1;
}

/* ====== Penyakit Grid ====== */
.penyakit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.5rem;
}
.penyakit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.penyakit-item:hover {
  border-color: #2563a8;
  background: #eff6ff;
}
.penyakit-active {
  border-color: #2563a8 !important;
  background: #eff6ff !important;
}
.penyakit-label {
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
  margin: 0;
}

/* ====== NRS Buttons ====== */
.nrs-selector {
  width: 100%;
}
.nrs-btn {
  flex: 1;
  min-width: 0;
  height: 36px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: #f8f9fa;
  color: #495057;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}
.nrs-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}
.nrs-0 {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}
.nrs-mild {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
}
.nrs-moderate {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}
.nrs-severe {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}
.nrs-active {
  border-width: 2px;
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
}

/* ====== Otorisasi / TTE ====== */
.otorisasi-header {
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
}
.tte-verified-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.82rem;
  width: 100%;
}
.tte-verified-badge .pi-verified {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.otorisasi-verified {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #2563a8;
}
.tte-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}
.tte-field-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  font-family: monospace;
  display: block;
}
.tte-name {
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tte-id {
  font-size: 0.7rem;
  opacity: 0.65;
  font-family: monospace;
}
.tte-time {
  font-size: 0.72rem;
  opacity: 0.75;
}

/* ====== Unsigned Area ====== */
.tte-unsigned-area {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem;
}
.tte-unsigned-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.4rem;
}
.tte-unsigned-info {
  flex: 1;
}
.tte-unsigned-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0 0 0.25rem;
}
.tte-unsigned-desc {
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0 0 0.75rem;
  line-height: 1.5;
}
.btn-tte {
  background: linear-gradient(135deg, #1a3a5c, #2563a8) !important;
  border: none !important;
  font-weight: 600;
}

/* ====== Signed Area + QR ====== */
.tte-signed-area {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.tte-signed-info {
  flex: 1;
  min-width: 200px;
}
.tte-signed-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.tte-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
}
.tte-meta-item .pi {
  font-size: 0.75rem;
  color: #2563a8;
}
.tte-qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}
.qr-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.qr-box {
  padding: 0.6rem;
  background: #fff;
  border: 2px solid #2563a8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-hint {
  font-size: 0.67rem;
  color: #9ca3af;
  text-align: center;
}

/* ====== QR Fade Transition ====== */
.qr-fade-enter-active,
.qr-fade-leave-active {
  transition: all 0.4s ease;
}
.qr-fade-enter-from,
.qr-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ====== Action Bar ====== */
.action-bar {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.action-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.action-info {
  display: flex;
  align-items: center;
  font-size: 0.82rem;
  color: #6c757d;
}
.action-buttons {
  display: flex;
  align-items: center;
}
.btn-save-pra {
  background: linear-gradient(135deg, #1a3a5c, #2563a8) !important;
  border: none !important;
  font-weight: 600;
}

/* ====== PrimeVue overrides ====== */
:deep(.p-datepicker),
:deep(.p-inputtext),
:deep(.p-textarea),
:deep(.p-select) {
  font-size: 0.85rem;
}
:deep(.p-datepicker) {
  width: 100%;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .penyakit-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .action-bar-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .adiksi-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
