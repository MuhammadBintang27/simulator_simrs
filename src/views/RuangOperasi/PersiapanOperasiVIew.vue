<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <section class="content">
    <CardPasienTransComponent />

    <Tabs value="0" scrollable>
      <TabList>
        <Tab value="0">CHECK LIST PERSIAPAN</Tab>
        <Tab value="2">ASSESMEN PRA ANESTESI</Tab>
        <Tab value="1">CHECK LIST KESELAMATAN</Tab>
        <Tab value="5">PENANDAAN LOKASI OPERASI</Tab>
        <Tab value="3">PETUGAS PELAKSANA OPERASI</Tab>
        <Tab value="4">LAPORAN OPERASI</Tab>
        <Tab value="6">
          <i class="fa-solid fa-clipboard-list" style="margin-right: 6px"></i>FORMULIR ANESTESI
        </Tab>
        <Tab value="7">
          <i class="fa-solid fa-pills" style="margin-right: 6px"></i>OBAT BMHP OPERASI
        </Tab>
        <Tab value="8">
          <i class="fa-solid fa-file-contract" style="margin-right: 6px"></i>INFORM CONSENT
        </Tab>
      </TabList>

      <TabPanels>
        <!-- ===== TAB 0: CHECK LIST PERSIAPAN ===== -->
        <TabPanel value="0">
          <!-- Banner -->
          <div class="ops-banner mb-3">
            <div class="ops-banner-icon">
              <i class="pi pi-list-check"></i>
            </div>
            <div class="ops-banner-content">
              <h4 class="ops-banner-title">Check List Persiapan Operasi</h4>
              <p class="ops-banner-desc">
                Formulir ini digunakan untuk memastikan seluruh persyaratan medis, administrasi, dan
                kebutuhan pasien telah dipenuhi sebelum tindakan pembedahan dilaksanakan.
              </p>
            </div>
          </div>

          <div class="row g-3">
            <!-- ===== KONDISI PASIEN ===== -->
            <div class="col-md-6">
              <div class="ops-card h-100">
                <div class="ops-card-header kondisi-header">
                  <i class="pi pi-heart me-2"></i>
                  <span>KONDISI PASIEN</span>
                  <small class="ms-auto">Tanda Vital &amp; Diagnosa</small>
                </div>
                <div class="ops-card-body">
                  <div class="field-group">
                    <label class="field-label">Diagnosa Pasien</label>
                    <InputText
                      v-model="form.diagnosa"
                      class="w-100"
                      placeholder="Diagnosa pasien..."
                    />
                  </div>

                  <div class="section-divider"><span>Tanda Vital</span></div>

                  <div class="row g-2">
                    <div class="col-6">
                      <div class="field-group">
                        <label class="field-label">Nadi</label>
                        <div class="input-group input-group-sm">
                          <InputText v-model="form.nadi" class="form-control" placeholder="0" />
                          <span class="input-group-text">bpm</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="field-group">
                        <label class="field-label">Nafas</label>
                        <div class="input-group input-group-sm">
                          <InputText v-model="form.nafas" class="form-control" placeholder="0" />
                          <span class="input-group-text">x/mnt</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="field-group">
                        <label class="field-label">Tekanan Darah</label>
                        <div class="input-group input-group-sm">
                          <InputText
                            v-model="form.tekananDarahSistol"
                            class="form-control"
                            placeholder="Sistolik"
                          />
                          <span class="input-group-text">/</span>
                          <InputText
                            v-model="form.tekananDarahDiastol"
                            class="form-control"
                            placeholder="Diastolik"
                          />
                          <span class="input-group-text">mmHg</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="field-group">
                        <label class="field-label">Suhu</label>
                        <div class="input-group input-group-sm">
                          <InputText v-model="form.suhu" class="form-control" placeholder="0" />
                          <span class="input-group-text">°C</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="field-group">
                        <label class="field-label">Tinggi</label>
                        <div class="input-group input-group-sm">
                          <InputText v-model="form.tinggi" class="form-control" placeholder="0" />
                          <span class="input-group-text">cm</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="field-group">
                        <label class="field-label">Berat</label>
                        <div class="input-group input-group-sm">
                          <InputText v-model="form.berat" class="form-control" placeholder="0" />
                          <span class="input-group-text">kg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== PERSIAPAN PASIEN ===== -->
            <div class="col-md-6">
              <div class="ops-card h-100">
                <div class="ops-card-header persiapan-header">
                  <i class="pi pi-user me-2"></i>
                  <span>PERSIAPAN PASIEN</span>
                  <small class="ms-auto">Kondisi Pra-Operasi</small>
                </div>
                <div class="ops-card-body">
                  <div class="section-divider"><span>Kebutuhan Klinis</span></div>

                  <div class="field-group">
                    <label class="field-label">Persiapan Darah</label>
                    <div class="input-group input-group-sm">
                      <InputText
                        v-model="form.persiapanDarah"
                        type="number"
                        class="form-control"
                        placeholder="Volume"
                      />
                      <span class="input-group-text">CC</span>
                    </div>
                  </div>

                  <div class="field-group">
                    <label class="field-label">Puasa Mulai Jam</label>
                    <InputText
                      v-model="form.puasaMulai"
                      class="w-100"
                      placeholder="Contoh: 22:00"
                    />
                  </div>

                  <div class="section-divider"><span>Checklist Kondisi</span></div>

                  <div class="checklist-grid">
                    <div class="checklist-row">
                      <span class="checklist-label">Lakukan Clysma/Glycerin</span>
                      <div class="radio-group">
                        <RadioButton inputId="clysmaYa" value="Ya" v-model="form.clysma" />
                        <label for="clysmaYa" class="radio-label">Ya</label>
                        <RadioButton inputId="clysmaTidak" value="Tidak" v-model="form.clysma" />
                        <label for="clysmaTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Lepas Gigi Palsu/Lensa/Hearing Aid</span>
                      <div class="radio-group">
                        <RadioButton inputId="gigiYa" value="Ya" v-model="form.gigi" />
                        <label for="gigiYa" class="radio-label">Ya</label>
                        <RadioButton inputId="gigiTidak" value="Tidak" v-model="form.gigi" />
                        <label for="gigiTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Amankan Barang Berharga</span>
                      <div class="radio-group">
                        <RadioButton inputId="barangYa" value="Ya" v-model="form.barang" />
                        <label for="barangYa" class="radio-label">Ya</label>
                        <RadioButton inputId="barangTidak" value="Tidak" v-model="form.barang" />
                        <label for="barangTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Hapus Makeup/Cutex</span>
                      <div class="radio-group">
                        <RadioButton inputId="makeupYa" value="Ya" v-model="form.makeup" />
                        <label for="makeupYa" class="radio-label">Ya</label>
                        <RadioButton inputId="makeupTidak" value="Tidak" v-model="form.makeup" />
                        <label for="makeupTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Pengosongan Kandung Kemih</span>
                      <div class="radio-group">
                        <RadioButton inputId="kemihYa" value="Ya" v-model="form.kemih" />
                        <label for="kemihYa" class="radio-label">Ya</label>
                        <RadioButton inputId="kemihTidak" value="Tidak" v-model="form.kemih" />
                        <label for="kemihTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Pasien Sedang Haid</span>
                      <div class="radio-group">
                        <RadioButton inputId="haidYa" value="Ya" v-model="form.haid" />
                        <label for="haidYa" class="radio-label">Ya</label>
                        <RadioButton inputId="haidTidak" value="Tidak" v-model="form.haid" />
                        <label for="haidTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== PERSIAPAN ADMINISTRASI ===== -->
            <div class="col-12">
              <div class="ops-card">
                <div class="ops-card-header admin-header">
                  <i class="pi pi-file me-2"></i>
                  <span>PERSIAPAN ADMINISTRASI</span>
                  <small class="ms-auto">Kelengkapan Dokumen</small>
                </div>
                <div class="ops-card-body">
                  <div class="admin-grid">
                    <div class="checklist-row">
                      <span class="checklist-label">Status Sudah Dilengkapi</span>
                      <div class="radio-group">
                        <RadioButton inputId="statusYa" value="Ya" v-model="form.status" />
                        <label for="statusYa" class="radio-label">Ya</label>
                        <RadioButton inputId="statusTidak" value="Tidak" v-model="form.status" />
                        <label for="statusTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">TTD Persetujuan Tindakan Operasi</span>
                      <div class="radio-group">
                        <RadioButton inputId="operasiYa" value="Ya" v-model="form.operasi" />
                        <label for="operasiYa" class="radio-label">Ya</label>
                        <RadioButton inputId="operasiTidak" value="Tidak" v-model="form.operasi" />
                        <label for="operasiTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">TTD Persetujuan Tindakan Anestesi</span>
                      <div class="radio-group">
                        <RadioButton inputId="anestesiYa" value="Ya" v-model="form.anestesi" />
                        <label for="anestesiYa" class="radio-label">Ya</label>
                        <RadioButton
                          inputId="anestesiTidak"
                          value="Tidak"
                          v-model="form.anestesi"
                        />
                        <label for="anestesiTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Hasil Pemeriksaan Laboratorium</span>
                      <div class="radio-group">
                        <RadioButton inputId="labYa" value="Ya" v-model="form.laboratorium" />
                        <label for="labYa" class="radio-label">Ya</label>
                        <RadioButton inputId="labTidak" value="Tidak" v-model="form.laboratorium" />
                        <label for="labTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Hasil Pemeriksaan Radiologi</span>
                      <div class="radio-group">
                        <RadioButton inputId="radiologiYa" value="Ya" v-model="form.radiologi" />
                        <label for="radiologiYa" class="radio-label">Ya</label>
                        <RadioButton
                          inputId="radiologiTidak"
                          value="Tidak"
                          v-model="form.radiologi"
                        />
                        <label for="radiologiTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                    <div class="checklist-row">
                      <span class="checklist-label">Hasil Pemeriksaan EKG</span>
                      <div class="radio-group">
                        <RadioButton inputId="ekgYa" value="Ya" v-model="form.ekg" />
                        <label for="ekgYa" class="radio-label">Ya</label>
                        <RadioButton inputId="ekgTidak" value="Tidak" v-model="form.ekg" />
                        <label for="ekgTidak" class="radio-label">Tidak</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== OTORISASI / TTE ===== -->
            <div class="col-12">
              <div class="ops-card">
                <div class="ops-card-header otorisasi-header">
                  <i class="pi pi-shield me-2"></i>
                  <span>OTORISASI</span>
                  <small class="ms-auto">Tanda Tangan Digital Perawat</small>
                </div>
                <div class="ops-card-body">
                  <!-- Belum ditandatangani -->
                  <div v-if="!tte.signed" class="tte-unsigned-area">
                    <div class="tte-unsigned-icon">
                      <i class="pi pi-pen-to-square"></i>
                    </div>
                    <div class="tte-unsigned-info">
                      <p class="tte-unsigned-title">Dokumen Belum Diotorisasi</p>
                      <p class="tte-unsigned-desc">
                        Simpan data checklist terlebih dahulu, kemudian klik tombol otorisasi untuk
                        menandatangani dokumen secara digital. Nama akan terisi otomatis setelah
                        verifikasi berhasil.
                      </p>
                      <Button
                        label="Lakukan Otorisasi"
                        icon="pi pi-lock"
                        class="btn-otorisasi"
                        @click="showDialog = true"
                      />
                    </div>
                  </div>

                  <!-- Sudah ditandatangani + QR -->
                  <Transition name="qr-fade">
                    <div v-if="tte.signed" class="tte-signed-area">
                      <div class="tte-signed-info">
                        <div class="tte-verified-badge">
                          <i class="pi pi-verified"></i>
                          <div class="tte-info">
                            <span class="tte-field-label">Nama Petugas</span>
                            <span class="tte-name">{{ tte.nama }}</span>
                            <span class="tte-field-label mt-1">ID Penandatangan</span>
                            <span class="tte-id">{{ tte.username }}</span>
                            <span class="tte-field-label mt-1">Waktu Otorisasi</span>
                            <span class="tte-time">{{ tte.timestamp }}</span>
                          </div>
                        </div>
                        <div class="tte-signed-meta mt-3">
                          <div class="tte-meta-item">
                            <i class="pi pi-file-check"></i>
                            <span>Check List Persiapan Operasi</span>
                          </div>
                          <div class="tte-meta-item">
                            <i class="pi pi-hashtag"></i>
                            <span>{{ form.kodeboking }}</span>
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
          </div>

          <!-- Action Bar -->
          <div class="ops-action-bar mt-3">
            <div class="ops-action-inner">
              <div class="ops-action-info">
                <i class="pi pi-info-circle me-2" style="color: #6c757d"></i>
                <span>Pastikan semua data sudah diisi sebelum menyimpan.</span>
              </div>
              <div class="ops-action-buttons">
                <Button
                  label="Simpan Data"
                  icon="pi pi-save"
                  class="btn-simpan"
                  :loading="loading"
                  @click="simpan_data"
                />
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- ===== TAB LAIN (tidak berubah) ===== -->
        <TabPanel value="1">
          <ChecklistKeselamatanView />
        </TabPanel>
        <TabPanel value="2">
          <AssPraAnastesiview />
        </TabPanel>
        <TabPanel value="3">
          <PetugasPelaksanaOperasiView />
        </TabPanel>
        <TabPanel value="4">
          <LaporanOperasiView />
        </TabPanel>
        <TabPanel value="5">
          <PenandaanLokasiOperasiView />
        </TabPanel>
        <TabPanel value="6">
          <FormulirAnastesi />
        </TabPanel>
        <TabPanel value="7">
          <PaketObatOperasiComponent />
        </TabPanel>
        <TabPanel value="8">
          <InformConserntOperasi />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </section>

  <Toast />
  <ttdUser
    v-model:showFormOtorisasi="showDialog"
    :noregister="route.query.kodebooking"
    :mode="8"
    @otpVerified="handleOtpSuccess"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import CardPasienTransComponent from '@/components/umum/CardPasienTransComponent.vue'
import ChecklistKeselamatanView from '@/views/RuangOperasi/ChecklistKeselamatanView.vue'
import PenandaanLokasiOperasiView from '@/views/RuangOperasi/PenandaanLokasiOperasiView.vue'
import PetugasPelaksanaOperasiView from '@/views/RuangOperasi/PetugasPelaksanaOperasiView.vue'
import LaporanOperasiView from '@/views/RuangOperasi/LaporanOperasiView.vue'
import FormulirAnastesi from '@/views/RuangOperasi/Anestesi/FormulisAnastesiView.vue'
import AssPraAnastesiview from '@/views/RuangOperasi/Anestesi/AssPraAnastesiview.vue'
import PaketObatOperasiComponent from '@/views/RuangOperasi/PaketObatOperasiComponent.vue'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import QrcodeVue from 'qrcode.vue'

import InformConserntOperasi from '@/views/RuangOperasi/InformConserntOperasi.vue'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const showDialog = ref(false)
const configStore = useConfigStore()

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'

import { useRoute } from 'vue-router'
const route = useRoute()

// ===== TTE State =====
const tte = ref({ signed: false, username: '', nama: '', timestamp: '' })

const qrCodeData = computed(() =>
  JSON.stringify({
    dokumen: 'Check List Persiapan Operasi',
    kodebooking: form.value.kodeboking,
    noregister: form.value.noregister,
    petugas: {
      nama: tte.value.nama,
      username: tte.value.username,
      waktu: tte.value.timestamp,
    },
  }),
)

const handleOtpSuccess = ({ username, verified }) => {
  if (verified) {
    tte.value.signed = true
    tte.value.username = username
    tte.value.nama = username
    tte.value.timestamp = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    fetchData()
  }
}

const form = ref({
  noregister: route.query.noreg,
  kodeboking: route.query.kodebooking,
  diagnosa: '',
  nadi: '',
  nafas: '',
  tekananDarahSistol: '',
  tekananDarahDiastol: '',
  suhu: '',
  tinggi: '',
  berat: '',
  persiapanDarah: '',
  puasaMulai: '',
  clysma: 'Tidak',
  gigi: 'Tidak',
  barang: 'Tidak',
  makeup: 'Tidak',
  kemih: 'Tidak',
  haid: 'Tidak',
  status: 'Tidak',
  operasi: 'Tidak',
  anestesi: 'Tidak',
  laboratorium: 'Tidak',
  radiologi: 'Tidak',
  ekg: 'Tidak',
  id_client: id_client.value,
})

const fetchData = async () => {
  try {
    loading.value = true
    const param = { kodeboking: route.query.kodebooking, id_client: id_client.value }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/triaseigd/get_persiapan_operasi`, param)
    if (response.data.metadata.code == 200) {
      const data = response.data.response
      form.value = { ...form.value, ...data }

      // Restore TTE state jika sudah ada
      if (data.tte_petugas) {
        tte.value.signed = true
        tte.value.username = data.tte_petugas
        tte.value.nama = data.nama_petugas || data.tte_petugas
        tte.value.timestamp = data.tte_waktu_petugas || ''
      }
    }
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

const simpan_data = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/persiapan_operasi`,
      form.value,
    )
    if (response.data.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: response.data.message,
        life: 3000,
      })
      fetchData()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: response.data.message,
        life: 3000,
      })
    }
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ====== Banner ====== */
.ops-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%);
  border-radius: 4px;
  padding: 1rem 1.5rem;
  color: #fff;
}
.ops-banner-icon {
  flex-shrink: 0;
  font-size: 2rem;
  opacity: 0.9;
}
.ops-banner-title {
  margin: 0 0 0.2rem;
  font-size: 1.05rem;
  font-weight: 700;
}
.ops-banner-desc {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.85;
  line-height: 1.5;
}

/* ====== Cards ====== */
.ops-card {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
  border: 1px solid #e9ecef;
}
.ops-card-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.1rem;
  font-weight: 700;
  font-size: 0.92rem;
  color: #fff;
  letter-spacing: 0.04em;
}
.ops-card-header small {
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.88;
}
.kondisi-header,
.persiapan-header,
.admin-header,
.otorisasi-header {
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
}
.ops-card-body {
  padding: 1rem 1.1rem;
}

/* ====== Fields ====== */
.field-group {
  margin-bottom: 0.85rem;
}
.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.3rem;
}
.radio-group {
  display: flex;
  align-items: center;
  gap: 0.3rem 0.6rem;
  flex-wrap: wrap;
}
.radio-label {
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
}

/* ====== Section Divider ====== */
.section-divider {
  display: flex;
  align-items: center;
  margin: 0.6rem 0;
  gap: 0.5rem;
  font-size: 0.7rem;
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

/* ====== Checklist Grid ====== */
.checklist-grid {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.5rem;
}
.checklist-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  gap: 0.75rem;
}
.checklist-label {
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
  flex: 1;
}

/* ====== TTE Unsigned ====== */
.tte-unsigned-area {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem;
}
.tte-unsigned-icon {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.3rem;
}
.tte-unsigned-title {
  font-weight: 700;
  font-size: 0.88rem;
  color: #1e293b;
  margin: 0 0 0.2rem;
}
.tte-unsigned-desc {
  font-size: 0.77rem;
  color: #6b7280;
  margin: 0 0 0.65rem;
  line-height: 1.5;
}
.btn-otorisasi {
  background: linear-gradient(135deg, #1a3a5c, #2563a8) !important;
  border: none !important;
  font-weight: 600;
}

/* ====== TTE Signed + QR ====== */
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
.tte-verified-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.85rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  border-radius: 8px;
  font-size: 0.8rem;
}
.tte-verified-badge .pi-verified {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.tte-info {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  min-width: 0;
}
.tte-field-label {
  font-size: 0.63rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.5;
  font-family: monospace;
  display: block;
}
.tte-name {
  font-weight: 700;
  font-size: 0.88rem;
}
.tte-id {
  font-size: 0.7rem;
  opacity: 0.65;
  font-family: monospace;
}
.tte-time {
  font-size: 0.7rem;
  opacity: 0.75;
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
  font-size: 0.78rem;
  color: #6b7280;
}
.tte-meta-item .pi {
  font-size: 0.72rem;
  color: #1d4ed8;
}

/* ====== QR Code ====== */
.tte-qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}
.qr-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.qr-box {
  padding: 0.6rem;
  background: #fff;
  border: 2px solid #1d4ed8;
  border-radius: 10px;
  display: flex;
}
.qr-hint {
  font-size: 0.65rem;
  color: #9ca3af;
  text-align: center;
}

/* ====== Transition ====== */
.qr-fade-enter-active,
.qr-fade-leave-active {
  transition: all 0.35s ease;
}
.qr-fade-enter-from,
.qr-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ====== Action Bar ====== */
.ops-action-bar {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 0.8rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.ops-action-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.ops-action-info {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
}
.ops-action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-simpan {
  background: linear-gradient(135deg, #1a3a5c, #2563a8) !important;
  border: none !important;
  font-weight: 600;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .tte-unsigned-area {
    flex-direction: column;
  }
  .tte-signed-area {
    flex-direction: column;
    align-items: center;
  }
  .admin-grid {
    grid-template-columns: 1fr;
  }
  .ops-action-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ====== Input overrides ====== */
:deep(.p-inputtext) {
  font-size: 0.83rem;
}
</style>
