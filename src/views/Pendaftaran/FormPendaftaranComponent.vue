<template>
  <div class="reg-form-wrap">
    <!-- ── SECTION 1: Identitas & Waktu ── -->
    <Panel class="reg-section">
      <template #header>
        <div class="reg-section-head">
          <i class="pi pi-id-card"></i>
          <span>Identitas & Waktu Masuk</span>
        </div>
      </template>

      <div class="reg-grid-2">
        <div class="reg-field">
          <label class="reg-label">Nomor Rekam Medis</label>
          <InputText v-model="norm" class="w-100" readonly />
        </div>

        <div class="reg-field">
          <label class="reg-label">Tanggal & Jam Masuk RS <span class="req">*</span></label>
          <DatePicker
            v-model="TanggalRawat"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal"
            showIcon
            showTime
            hourFormat="24"
            iconDisplay="input"
            class="w-100"
            :class="{ 'p-invalid': formErrors.TanggalRawat }"
          />
        </div>
        <div class="reg-field" v-if="carabayarSelected?.KODE == 5">
          <label class="reg-label">Tanggal SEP <span class="req">*</span></label>
          <DatePicker
            v-model="TanggalSEP"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal SEP"
            showIcon
            iconDisplay="input"
            class="w-100"
            :class="{ 'p-invalid': formErrors.TanggalSEP }"
          />
        </div>
      </div>
    </Panel>

    <!-- ── SECTION 2: Pelayanan ── -->
    <Panel class="reg-section">
      <template #header>
        <div class="reg-section-head">
          <i class="pi pi-sitemap"></i>
          <span>Jenis Pelayanan</span>
        </div>
      </template>
      <div class="reg-grid-2">
        <div class="reg-field">
          <label class="reg-label">Jenis Rawat <span class="req">*</span></label>
          <Select
            v-model="jenisrawatSelected"
            :options="JenisRawatList"
            optionLabel="caption"
            placeholder="Pilih Jenis Rawat"
            class="w-100"
            :class="{ 'p-invalid': formErrors.jenisrawatSelected }"
          />
        </div>
        <div class="reg-field">
          <label class="reg-label">Cara Bayar <span class="req">*</span></label>
          <Select
            v-model="carabayarSelected"
            :options="listcaraBayar"
            optionLabel="NAMA"
            placeholder="Pilih Cara Bayar"
            class="w-100"
            filter
            showClear
            :class="{ 'p-invalid': formErrors.carabayarSelected }"
          />
        </div>
        <div class="reg-field">
          <label class="reg-label">DPJP <span class="req">*</span></label>
          <Select
            v-model="dokterSelected"
            :options="list_dokter"
            optionLabel="NAMADOKTER"
            placeholder="Pilih DPJP"
            class="w-100"
            filter
            showClear
            :class="{ 'p-invalid': formErrors.dokterSelected }"
          />
        </div>
        <div class="reg-field">
          <label class="reg-label">Diagnosa Pasien</label>
          <Select
            v-model="diagnoseSelected"
            :options="listDiagnose"
            optionLabel="dx"
            :filter="true"
            :showClear="false"
            @filter="searchDiagnose"
            placeholder="Cari diagnosa ICD..."
            appendTo="body"
            class="w-100"
          />
        </div>
      </div>
    </Panel>

    <!-- ── SECTION 3: Penempatan ── -->
    <Panel class="reg-section">
      <template #header>
        <div class="reg-section-head">
          <i class="pi pi-building"></i>
          <span>Penempatan Pasien</span>
        </div>
      </template>

      <!-- Poli Klinik (Jalan) -->
      <div v-if="jenisrawatSelected.code == 2" class="reg-field">
        <label class="reg-label">Poli Klinik <span class="req">*</span></label>
        <Select
          v-model="poliSelected"
          :options="listPolyKlinik"
          optionLabel="nama"
          :showClear="true"
          :loading="load_ruangan"
          placeholder="Pilih Poli Klinik"
          appendTo="body"
          class="w-100"
          :class="{ 'p-invalid': formErrors.poliSelected }"
        />
      </div>

      <!-- Ruang Rawat Inap -->
      <div v-if="jenisrawatSelected.code == 1" class="reg-field">
        <label class="reg-label">
          Ruang Rawat Inap <span class="req">*</span>
          <span class="reg-label-meta">
            <i class="pi pi-clock"></i>
            Diperbarui: {{ formatDateTimeForAPI(last_update_ruangan) }}
          </span>
        </label>
        <div class="d-flex gap-2">
          <Select
            v-model="ruanganSelected"
            :options="listRuangan"
            optionLabel="NAMA"
            :filter="true"
            :showClear="true"
            :loading="load_ruangan"
            placeholder="Pilih Ruang Rawat Inap"
            appendTo="body"
            class="flex-grow-1"
            :class="{ 'p-invalid': formErrors.ruanganSelected }"
          >
            <template #option="slotProps">
              <div class="ruang-option">
                <span class="ruang-name">{{ slotProps.option?.NAMA }}</span>
                <div class="ruang-meta">
                  <Tag
                    :severity="slotProps.option?.TERSEDIA > 0 ? 'success' : 'danger'"
                    :value="`${slotProps.option?.TERSEDIA} tersedia`"
                    style="font-size: 10px"
                  />
                  <span class="ruang-total">dari {{ slotProps.option?.JUMLAH_TT }} TT</span>
                </div>
              </div>
            </template>
          </Select>
          <Button
            icon="pi pi-refresh"
            text
            severity="secondary"
            :loading="load_ruangan"
            @click="getRuangan"
            v-tooltip.top="'Perbarui daftar ruangan'"
          />
        </div>
      </div>

      <!-- SPRI -->
      <div
        class="reg-field mt-3"
        v-if="carabayarSelected?.KODE == 5 && jenisrawatSelected.code == 1"
      >
        <label class="reg-label">No. SPRI (Surat Perintah Rawat Inap)</label>
        <div class="d-flex gap-2">
          <InputText v-model="NoSPRI" class="flex-grow-1" placeholder="Nomor SPRI..." />
          <Button
            label="Riwayat SPRI"
            severity="success"
            outlined
            icon="pi pi-history"
            @click="callFOrmListSPRI()"
          />
        </div>
      </div>
    </Panel>

    <!-- ── SECTION 4: Informasi Tambahan ── -->
    <Panel class="reg-section">
      <template #header>
        <div class="reg-section-head">
          <i class="pi pi-list"></i>
          <span>Informasi Tambahan</span>
        </div>
      </template>
      <div class="reg-grid-2">
        <div class="reg-field">
          <label class="reg-label">Naik Kelas Rawat</label>
          <Select
            v-model="selectedKelas"
            :options="klsRawatNaik"
            optionLabel="caption"
            placeholder="Pilih Kelas (opsional)"
            class="w-100"
            showClear
          />
        </div>
        <div class="reg-field" v-if="carabayarSelected?.KODE == 5">
          <label class="reg-label">Status KLL <span class="req">*</span></label>
          <Select
            v-model="lakaLantasSelected"
            :options="lakaLantasOptions"
            optionLabel="caption"
            placeholder="Pilih status KLL"
            class="w-100"
          />
        </div>
        <div class="reg-field reg-field-full">
          <label class="reg-label">Catatan</label>
          <Textarea v-model="Catatan" class="w-100" rows="3" placeholder="Catatan tambahan..." />
        </div>
        <div class="reg-field reg-field-full">
          <div class="reg-checkbox-row">
            <Checkbox v-model="pasienkatarak" :binary="true" inputId="pasienkatarak" />
            <label for="pasienkatarak" class="reg-checkbox-label">Pasien Katarak</label>
          </div>
        </div>
        <div class="reg-field reg-field-full">
          <div class="bpjs-adv-wrap">
            <span class="bpjs-adv-toggle" @click="showAdvBPJS = !showAdvBPJS">
              <i
                :class="showAdvBPJS ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                style="font-size: 0.6rem"
              ></i>
              Opsi lanjutan
            </span>
            <Transition name="adv-fade">
              <div v-if="showAdvBPJS" class="bpjs-adv-content">
                <div
                  class="reg-checkbox-row bpjs-only-row"
                  :class="{ 'bpjs-only-active': hanyaSimpanKeBPJS }"
                >
                  <Checkbox
                    v-model="hanyaSimpanKeBPJS"
                    :binary="true"
                    inputId="hanyaSimpanKeBPJS"
                  />
                  <label for="hanyaSimpanKeBPJS" class="reg-checkbox-label">
                    Hanya simpan ke server BPJS
                    <span class="reg-checkbox-hint">(data tidak disimpan ke SIMRS)</span>
                  </label>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Panel>

    <!-- ── SECTION 5: Detail KLL (conditional) ── -->
    <Panel class="reg-section reg-section-kll" v-if="lakaLantasSelected.code > 0">
      <template #header>
        <div class="reg-section-head reg-section-head-warn">
          <i class="pi pi-exclamation-triangle"></i>
          <span>Detail Kecelakaan Lalu Lintas (KLL)</span>
        </div>
      </template>
      <div class="reg-grid-2">
        <div class="reg-field">
          <label class="reg-label">Tanggal KLL <span class="req">*</span></label>
          <DatePicker
            v-model="tanggalKLL"
            showIcon
            dateFormat="dd/mm/yy"
            placeholder="Pilih Tanggal KLL"
            class="w-100"
            :class="{ 'p-invalid': formErrors.tanggalKLL }"
          />
        </div>
        <div class="reg-field">
          <label class="reg-label">Provinsi Lokasi KLL <span class="req">*</span></label>
          <Select
            v-model="provinsiKLL"
            :options="provinsiOptions"
            optionLabel="nama"
            filter
            showClear
            @change="GeKabupaten_bpjs"
            placeholder="Pilih Provinsi"
            class="w-100"
            :class="{ 'p-invalid': formErrors.provinsiKLL }"
          />
        </div>
        <div class="reg-field">
          <label class="reg-label">Kabupaten / Kota <span class="req">*</span></label>
          <Select
            v-model="kabupatenKLL"
            :options="kabupatenOptions"
            optionLabel="nama"
            filter
            showClear
            :disabled="!provinsiKLL"
            @change="GetKecamatan_bpjs"
            placeholder="Pilih Kabupaten/Kota"
            :loading="loading_load_kab"
            class="w-100"
            :class="{ 'p-invalid': formErrors.kabupatenKLL }"
          />
        </div>
        <div class="reg-field">
          <label class="reg-label">Kecamatan <span class="req">*</span></label>
          <Select
            v-model="kecamatanKLL"
            :options="kecamatanOptions"
            optionLabel="nama"
            filter
            showClear
            :disabled="!kabupatenKLL"
            :loading="loading_load_kec"
            placeholder="Pilih Kecamatan"
            class="w-100"
            :class="{ 'p-invalid': formErrors.kecamatanKLL }"
          />
        </div>
      </div>
    </Panel>

    <!-- ── Banner peringatan hanya-BPJS ── -->
    <Transition name="bpjs-banner">
      <div v-if="hanyaSimpanKeBPJS" class="bpjs-only-banner">
        <div class="bpjs-banner-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="bpjs-banner-body">
          <strong>Mode "Hanya BPJS" aktif</strong>
          <span>
            Data pendaftaran ini <u>hanya akan dikirim ke server BPJS</u> dan
            <u>tidak tersimpan ke SIMRS</u>. Pastikan pilihan ini sudah benar sebelum menyimpan.
          </span>
        </div>
        <button class="bpjs-banner-dismiss" @click="hanyaSimpanKeBPJS = false" title="Nonaktifkan">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </Transition>

    <!-- ── ACTION BAR ── -->
    <div class="reg-action-bar">
      <div class="reg-action-left">
        <Button
          label="Cari Pasien"
          icon="pi pi-search"
          severity="secondary"
          outlined
          @click="ShowFormPendaftaran"
        />
        <Button
          label="Riwayat Pendaftaran"
          icon="pi pi-history"
          severity="warn"
          outlined
          @click="callChildFetch"
        />
        <Button
          label="Tindak Lanjut Pasien IGD"
          icon="pi pi-send"
          severity="info"
          outlined
          @click="PrintSEP"
        />
        <!-- <Button
          label="Cetak SEP"
          icon="pi pi-print"
          severity="info"
          outlined
          :loading="loadingCetakSEP"
          @click="cetakSEPButton"
        /> -->
      </div>
      <div class="reg-action-right">
        <Button
          label="Simpan Pendaftaran"
          icon="pi pi-save"
          severity="success"
          :loading="loading"
          @click="submitForm"
        />
      </div>
    </div>
  </div>

  <RecentPendaftaranView ref="childRef" />

  <!-- <Dialog
    v-model:visible="showListSPRI"
    modal
    :style="{ width: '900px' }"
    :closable="true"
    header="Riwayat Perintah Rawat Inap"
  >
    <div class="table-responsive" style="max-height: 500px; overflow-y: auto">
      <table class="table table-bordered table-striped table-hover">
        <thead class="thead-light sticky-top">
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 15%">No. SPRI</th>
            <th style="width: 10%">Tanggal</th>
            <th style="width: 20%">Dokter</th>
            <th style="width: 10%">Jenis Rawat</th>
            <th style="width: 15%">Poli/Ruang</th>
            <th style="width: 10%">No. Register</th>
            <th style="width: 10%">Cetak</th>
            <th style="width: 10%">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoadingSPRI">
            <td colspan="9" class="text-center py-4">
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Memuat data SPRI...
            </td>
          </tr>
          <tr v-else-if="spriHistoryData.length === 0">
            <td colspan="9" class="text-center py-4 text-muted">
              <i class="pi pi-info-circle mr-2"></i>
              Tidak ada data SPRI ditemukan
            </td>
          </tr>
          <tr v-else v-for="(spri, index) in spriHistoryData" :key="spri.SPRI || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <div style="display: flex; align-items: center; justify-content: space-between">
                <div>
                  <strong>{{ spri?.SPRI }}</strong>
                  <br />
                  <small class="text-muted">{{ spri?.NO_KARTU }}</small>
                </div>
                <Button
                  icon="pi pi-copy"
                  @click="copySPRI(spri.SPRI, index)"
                  class="p-button-text p-button-sm copy-btn"
                  :title="copiedSPRIIndex === index ? 'Tersalin!' : 'Salin SPRI'"
                  style="padding: 0.25rem; margin-left: 8px"
                />
              </div>
            </td>
            <td>{{ spri.TANGGAL }}</td>
            <td>
              <strong>{{ spri.NAMADOKTER }}</strong>
              <br />
              <small class="text-muted">Kode: {{ spri.KODE_DOKTER_BPJS }}</small>
            </td>
            <td>{{ spri.JENISRAWAT }}</td>
            <td>{{ spri.POLI_KONTROL || '-' }}</td>
            <td>
              <code>{{ spri.NOREGISTER }}</code>
            </td>
            <td>
              <Button
                label="Cetak"
                @click="cetakSPRI(spri)"
                icon="pi pi-print"
                style="padding: 0.25rem"
              />
            </td>
            <td>
              <div class="flex items-center space-x-2">
                <Button
                  severity="warn"
                  class="round-button2"
                  icon="pi pi-times"
                  @click="hapus_SPRI(spri?.SPRI)"
                  style="padding: 0.25rem"
                  title="Hapus SPRI"
                />
                <Button
                  severity="info"
                  class="round-button2"
                  icon="pi pi-pencil"
                  style="padding: 0.25rem"
                  title="Edit SPRI"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-group mt-2">
      <Button
        label="Terbitkan SPRI Baru"
        @click="doterbitkanSPRI()"
        :loading="loading"
        severity="success"
        icon="pi pi-save"
        class="p-button p-button-warning flex-button"
      />
      <Button
        label="Batal"
        icon="pi pi-times"
        @click="showListSPRI = false"
        class="p-button p-button-warning flex-button p-button p-button-secondary"
      />
    </div>
  </Dialog> -->

  <Dialog
    v-model:visible="showListSPRI"
    modal
    :style="getDialogStyle()"
    :closable="true"
    header="Riwayat Perintah Rawat Inap"
    :class="{ 'mobile-dialog': isMobile }"
  >
    <!-- Mobile Card View -->
    <div v-if="isMobile" class="mobile-view">
      <div v-if="isLoadingSPRI" class="text-center py-4">
        <i class="pi pi-spin pi-spinner mr-2"></i>
        Memuat data SPRI...
      </div>

      <div v-else-if="spriHistoryData.length === 0" class="text-center py-4 text-muted">
        <i class="pi pi-info-circle mr-2"></i>
        Tidak ada data SPRI ditemukan
      </div>

      <div v-else class="space-y-3">
        <div v-for="(spri, index) in spriHistoryData" :key="spri.SPRI || index" class="spri-card">
          <div class="card-header">
            <div class="card-title-section">
              <strong>{{ spri?.SPRI }}</strong>
              <Button
                icon="pi pi-copy"
                @click="copySPRI(spri.SPRI, index)"
                class="p-button-text p-button-sm copy-btn"
                :title="copiedSPRIIndex === index ? 'Tersalin!' : 'Salin SPRI'"
              />
            </div>
            <small class="text-muted">{{ spri?.NO_KARTU }}</small>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Tanggal:</span>
              <span class="value">{{ spri.TANGGAL }}</span>
            </div>
            <div class="info-row">
              <span class="label">Dokter:</span>
              <div class="value">
                <strong>{{ spri.NAMADOKTER }}</strong>
                <br />
                <small class="text-muted">Kode: {{ spri.KODE_DOKTER_BPJS }}</small>
              </div>
            </div>
            <div class="info-row">
              <span class="label">Jenis Rawat:</span>
              <span class="value">{{ spri.JENISRAWAT }}</span>
            </div>
            <div class="info-row">
              <span class="label">Poli/Ruang:</span>
              <span class="value">{{ spri.POLI_KONTROL || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">No. Register:</span>
              <code class="value">{{ spri.NOREGISTER }}</code>
            </div>
          </div>

          <div class="card-actions">
            <Button
              label="Cetak"
              @click="cetakSPRI(spri)"
              icon="pi pi-print"
              class="p-button-sm flex-button"
            />
            <Button
              severity="warn"
              icon="pi pi-times"
              @click="hapus_SPRI(spri?.SPRI)"
              class="p-button-sm flex-button"
              title="Hapus"
            />
            <Button
              severity="info"
              icon="pi pi-pencil"
              class="p-button-sm flex-button"
              title="Edit"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div v-else class="table-responsive" style="max-height: 500px; overflow-y: auto">
      <table class="table table-bordered table-striped table-hover">
        <thead class="thead-light sticky-top">
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 15%">No. SPRI</th>
            <th style="width: 10%">Tanggal</th>
            <th style="width: 20%">Dokter</th>
            <th style="width: 10%">Jenis Rawat</th>
            <th style="width: 15%">Poli/Ruang</th>
            <th style="width: 10%">No. Register</th>
            <th style="width: 10%">Cetak</th>
            <th style="width: 10%">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoadingSPRI">
            <td colspan="9" class="text-center py-4">
              <i class="pi pi-spin pi-spinner mr-2"></i>
              Memuat data SPRI...
            </td>
          </tr>
          <tr v-else-if="spriHistoryData.length === 0">
            <td colspan="9" class="text-center py-4 text-muted">
              <i class="pi pi-info-circle mr-2"></i>
              Tidak ada data SPRI ditemukan
            </td>
          </tr>
          <tr v-else v-for="(spri, index) in spriHistoryData" :key="spri.SPRI || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td>
              <div style="display: flex; align-items: center; justify-content: space-between">
                <div>
                  <strong>{{ spri?.SPRI }}</strong>
                  <br />
                  <small class="text-muted">{{ spri?.NO_KARTU }}</small>
                </div>
                <Button
                  icon="pi pi-copy"
                  @click="copySPRI(spri.SPRI, index)"
                  class="p-button-text p-button-sm copy-btn"
                  :title="copiedSPRIIndex === index ? 'Tersalin!' : 'Salin SPRI'"
                  style="padding: 0.25rem; margin-left: 8px"
                />
              </div>
            </td>
            <td>{{ spri.TANGGAL }}</td>
            <td>
              <strong>{{ spri.NAMADOKTER }}</strong>
              <br />
              <small class="text-muted">Kode: {{ spri.KODE_DOKTER_BPJS }}</small>
            </td>
            <td>{{ spri.JENISRAWAT }}</td>
            <td>{{ spri.POLI_KONTROL || '-' }}</td>
            <td>
              <code>{{ spri.NOREGISTER }}</code>
            </td>
            <td>
              <Button
                label="Cetak"
                @click="cetakSPRI(spri)"
                icon="pi pi-print"
                style="padding: 0.25rem"
              />
            </td>
            <td>
              <div class="flex items-center space-x-2">
                <Button
                  severity="warn"
                  class="round-button2"
                  icon="pi pi-times"
                  @click="hapus_SPRI(spri?.SPRI)"
                  style="padding: 0.25rem"
                  title="Hapus SPRI"
                />
                <Button
                  severity="info"
                  class="round-button2"
                  icon="pi pi-pencil"
                  style="padding: 0.25rem"
                  title="Edit SPRI"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="button-group mt-2" :class="{ 'mobile-button-group': isMobile }">
      <Button
        label="Terbitkan SPRI Baru"
        @click="doterbitkanSPRI()"
        :loading="loading"
        severity="success"
        icon="pi pi-save"
        class="p-button flex-button"
        :class="{ 'w-full': isMobile }"
      />
      <Button
        label="Batal"
        icon="pi pi-times"
        @click="showListSPRI = false"
        class="p-button p-button-secondary flex-button"
        :class="{ 'w-full': isMobile }"
      />

      <Button
        label="Riwayat SPRI BPJS (Server BPJS)"
        icon="pi pi-history"
        severity="info"
        @click="spriDialogRef.open()"
      />
    </div>
  </Dialog>

  <SPRIDialog ref="spriDialogRef" :noKartu="props.os.noKartu" />

  <Toast />
</template>

<script setup>
import { ref, onMounted, watch, defineEmits, onBeforeUnmount } from 'vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import axios from 'axios'

// Stores
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, company } = storeToRefs(authStore)
const toast = useToast()
const route = useRoute()
const router = useRouter()

const goToTindakLanjut = () => {
  // 1. Resolve route untuk mendapatkan URL lengkap berdasarkan nama dan query
  const routeData = router.resolve({
    name: 'TindakLanjutPasienView',
    query: { noreg: route.query.noreg },
  })

  // 2. Buka URL tersebut di tab baru
  window.open(routeData.href, '_blank')
}

const props = defineProps({
  os: {
    type: Object,
    required: true,
  },
  norm: {
    type: String,
  },
})

import RecentPendaftaranView from '@/views/Pendaftaran/RecentPendaftaranView.vue'

import SPRIDialog from '@/views/Pendaftaran/SpriDataBPJSComponent.vue'

const spriDialogRef = ref(null)

const lakaLantasSelected = ref({
  caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]',
  code: 0,
})

const jenisrawatSelected = ref({
  code: 1,
  caption: 'INAP',
})

const emit = defineEmits(['fungsiInduk'])

const ShowFormPendaftaran = async () => {
  emit('fungsiInduk')
}

const nomor_sep = ref(null)
// Reactive data
const TanggalRawat = ref(new Date())

const TanggalSEP = ref(new Date())
const loading = ref(false)
const showListSPRI = ref(false)
const NoBPJS = ref(route.query.noka)
const norm = ref(props.os?.mr.noMR)
const NoSPRI = ref(null)
const ruanganSelected = ref(null)
const isLoadingSPRI = ref(false)
const copiedSPRIIndex = ref(null)
const pasienkatarak = ref(false)
const hanyaSimpanKeBPJS = ref(false)
const showAdvBPJS = ref(false)
const Catatan = ref(null)

// KLL related data
const tanggalKLL = ref(null)
const provinsiKLL = ref(null)
const kabupatenKLL = ref(null)
const kecamatanKLL = ref(null)
const provinsiOptions = ref([])
const kabupatenOptions = ref([])
const kecamatanOptions = ref([])

// Doctor and other data
const list_dokter = ref([])
const dokterSelected = ref(null)
const diagnoseSelected = ref(null)
const listDiagnose = ref([])
const isLoading = ref(false)
const carabayarSelected = ref(null)
const listcaraBayar = ref([])

const JenisRawatList = ref([
  {
    code: 1,
    caption: 'INAP',
  },
  {
    code: 2,
    caption: 'JALAN',
  },
])

// Room data
const listRuangan = ref([])
const load_ruangan = ref(false)
const last_update_ruangan = ref(new Date())

// SPRI data
const spriHistoryData = ref([])

const tempNoregister = ref(null)
const tempNosep = ref(null)

// Options
const lakaLantasOptions = ref([
  { caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]', code: 0 },
  { caption: '1 - KLL dan bukan kecelakaan Kerja [BKK]', code: 1 },
  { caption: '2 - KLL dan KK', code: 2 },
  { caption: '3 - Kecelakaan Kerja [KK]', code: 3 },
])

const selectedKelas = ref(null)

const klsRawatHak = ref({
  kode: '',
})

const isMobile = ref(false)

const getDialogStyle = () => {
  return {
    width: isMobile.value ? '95vw' : '900px',
    maxHeight: isMobile.value ? '90vh' : 'auto',
  }
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const childRef = ref(null)
const callChildFetch = async () => {
  if (childRef.value) {
    childRef.value.ShowRiwayatPendaftaran = true
    childRef.value.fetchData(10) // misalnya mode = 10
  }
}

const klsRawatNaik = ref([
  { caption: 'VVIP', kode: 1 },
  { caption: 'VIP', kode: 2 },
  { caption: 'Kelas 1', kode: 3 },
  { caption: 'Kelas 2', kode: 4 },
  { caption: 'Kelas 3', kode: 5 },
  { caption: 'ICCU', kode: 6 },
  { caption: 'ICU', kode: 7 },
  { caption: 'Diatas Kelas 1', kode: 8 },
])

const poliSelected = ref(null)

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

const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return null
  }
}

// Toast methods
const showSuccess = (message = 'Data berhasil disimpan') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

const showInfo = (message = 'Informasi') => {
  toast.add({
    severity: 'info',
    summary: 'Informasi',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'Terjadi kesalahan') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

// API methods
const getda_tadokter = async () => {
  try {
    loading.value = true
    const param = {
      id_client: id_client.value,
      mode: 2,
    }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/datadokterv3`, param)

    if (response.data && response.data.response) {
      list_dokter.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching doctors:', error)
    showError('Error fetching doctors: ' + error.message)
  } finally {
    loading.value = false
  }
}

const searchDiagnose = async (event) => {
  const query = event.value
  if (!query || query.length < 2) {
    listDiagnose.value = []
    return
  }

  const payload = {
    mode: 1,
    param: query,
  }

  try {
    isLoading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/get_icd_v2`, payload)

    listDiagnose.value = response.data
  } catch (error) {
    console.error('Error searching diagnose:', error)
    showError('Error searching diagnose')
  } finally {
    isLoading.value = false
  }
}

const GetCaraBayar = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/datacarabayar2/${id_client.value}`,
    )

    if (response.data) {
      listcaraBayar.value = response.data
    }
  } catch (error) {
    console.error('Error fetching cara bayar:', error)
    showError('Error fetching cara bayar')
  }
}

const listPoliKlinik = ref([])

const GetNamaPOliklinik = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/0/${id_client.value}`,
    )

    if (response.data) {
      listPoliKlinik.value = response.data
    }
  } catch (error) {
    console.error('Error fetching cara bayar:', error)
    showError('Error fetching cara bayar')
  }
}

const getRuangan = async () => {
  try {
    load_ruangan.value = true
    last_update_ruangan.value = new Date()

    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/laporan/pasien_sedang_rawat_inap/${id_client.value}`,
    )

    if (response.data.response) {
      listRuangan.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching rooms:', error)
    showError('Error fetching rooms')
  } finally {
    load_ruangan.value = false
  }
}

const doterbitkanSPRI = async () => {
  if (dokterSelected.value == null) {
    showInfo('Silahkan pilih DPJP')
    return
  }
  if (diagnoseSelected.value == null) {
    showInfo('Diagnosa belum diisi')
    return
  }

  try {
    loading.value = true

    const param = {
      data: {
        nokartu: props.os.noKartu,
        KDDOKTER: dokterSelected.value.KDDOKTER,
        KODE_DOKTER_BPJS: dokterSelected.value.KODE_DOKTER_BPJS,
        KodePoliBPJS: dokterSelected.value.SUB_SP,
        tglRencanaKontrol: formatDateOnlyForAPI(TanggalRawat.value),
        nomr: norm.value,
      },
      user_id: user_id.value,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/terbitkan_SPRI`, param)

    if (response.data.metadata.code == 200) {
      showSuccess(response.data.metadata.message)
      GetListSPRI()
    } else {
      showError(response.data.metadata.message)
    }
  } catch (error) {
    console.error('Error creating SPRI:', error)
    showError('Error creating SPRI: ' + error.message)
  } finally {
    loading.value = false
  }
}

const hapus_SPRI = async (noSPRI) => {
  try {
    loading.value = true

    const param = {
      id_client: id_client.value,
      noSuratKontrol: noSPRI,
      user_id: user_id.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/deleted_spri_v2`,
      param,
    )

    if (response.data.code == 200) {
      showSuccess(response.data.message)
      GetListSPRI()
    } else {
      showError(response.data.message)
    }
  } catch (error) {
    console.error('Error deleting SPRI:', error)
    showError('Error deleting SPRI: ' + error.message)
  } finally {
    loading.value = false
  }
}

const copySPRI = async (spriNumber, index) => {
  try {
    await navigator.clipboard.writeText(spriNumber)
    copiedSPRIIndex.value = index
    showSuccess(`SPRI ${spriNumber} berhasil disalin`)
    showListSPRI.value = false
    setTimeout(() => {
      copiedSPRIIndex.value = null
    }, 2000)
  } catch (error) {
    console.error('Error copying SPRI:', error)
    showError('Error copying SPRI')
  }
}

const callFOrmListSPRI = () => {
  showListSPRI.value = true
  GetListSPRI()
}

const GetListSPRI = async () => {
  try {
    isLoadingSPRI.value = true

    const payload = {
      mode: 'history3',
      SPRI: norm.value,
      id_client: id_client.value,
      tgl: null,
      norm: norm.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/sprigetdata/`, payload)

    spriHistoryData.value = response.data.response || []
  } catch (error) {
    console.error('Error fetching SPRI history:', error)
    showError('Error fetching SPRI history')
  } finally {
    isLoadingSPRI.value = false
  }
}

defineExpose({ carabayarSelected })
// Reactive data

// Method converted to function
const get_provinsi_bpjs = async () => {
  isLoading.value = true

  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/getdata_propinsi_BPJS_V2/${id_client.value}`,
    )

    if (response.data.metaData.code == 200) {
      provinsiOptions.value = response.data?.response?.list
    }
  } catch (error) {
    console.log(error)
    // Optional: Add error handling/toast notification here
  } finally {
    isLoading.value = false
  }
}
// Method converted to function

const loading_load_kab = ref(false)

const GeKabupaten_bpjs = async (e) => {
  loading_load_kab.value = true

  if (e.value == null) {
    kabupatenOptions.value = []
  }
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/getdata_kabupaten_v2/${id_client.value}/${e.value.kode}`,
    )

    if (response.data.metaData.code == 200) {
      kabupatenOptions.value = response.data?.response?.list
    }

    loading_load_kab.value = false
  } catch (error) {
    console.log(error)
    // Optional: Add error handling/toast notification here
  } finally {
    loading_load_kab.value = false
  }
}

// Method converted to function
const loading_load_kec = ref(false)
const GetKecamatan_bpjs = async (e) => {
  loading_load_kec.value = true
  if (e.value == null) {
    kecamatanOptions.value = []
  }
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/getdata_kecamatan_v2/${id_client.value}/${e.value.kode}`,
    )

    if (response.data.metaData.code == 200) {
      kecamatanOptions.value = response.data?.response?.list
    }
    loading_load_kec.value = false
  } catch (error) {
    console.log(error)
    // Optional: Add error handling/toast notification here
  } finally {
    loading_load_kec.value = false
  }
}

const hapusSEP = async () => {
  const url = configStore.apiBaseUrl
  const response = await axios.post(
    `${url}/index.php/api/Bpjs_api/hapus_sep/${nomor_sep.value}/${id_client.value}/${user_id.value}`,
  )

  showInfo(response.data.metaData.message)
}

const noSEP = ref(null)

const submitForm = async () => {
  if (!validateForm()) return

  try {
    loading.value = true

    const url = configStore.apiBaseUrl

    const payload = {
      param: {
        tglsep: formatDateOnlyForAPI(TanggalSEP.value),
        tanggalMasukRS: formatDateTimeForAPI(TanggalRawat.value),
        tanggalKLL: formatDateOnlyForAPI(tanggalKLL.value),
        noka: props.os?.noKartu,
        norm: norm.value,
        id_client: id_client.value,
        diagnoseSelected: diagnoseSelected.value,
        jenisrawatSelected: {
          code: jenisrawatSelected.value.code,
        },
        poliSelected: {
          kode:
            jenisrawatSelected.value.code === 2
              ? poliSelected.value.KodePoliBPJS
              : dokterSelected.value.KDPOLY_BPJS,
          kode_poli_rs:
            jenisrawatSelected.value.code === 1
              ? ruanganSelected.value?.KD_RUANGAN
              : poliSelected.value?.kode,
          nomor_antrian: 0,
        },
        jenisTrans: {
          code: 2,
        },
        jenis_kunj: 1,
        kd_cara_bayar: carabayarSelected.value.KODE,
        pasienkatarak: pasienkatarak.value ? 1 : 0,
        hanya_simpan_bpjs: hanyaSimpanKeBPJS.value ? 1 : 0,
        lakaLantas: lakaLantasSelected.value,
        nospri: NoSPRI.value,
        dokterSelected: dokterSelected.value,
        provSelected: provinsiKLL.value,
        kabSelected: kabupatenKLL.value,
        kecSelected: kecamatanKLL.value,
        catatan: Catatan.value,
        noreggister_origin: route.query.noreg,
        ruanganSelected: {
          kode:
            jenisrawatSelected.value.code === 1
              ? ruanganSelected.value?.KD_RUANGAN
              : poliSelected.value?.kode,
        },
      },
      id_client: id_client.value,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/index.php/api/Bpjs_api/createSEP`, payload)

    if (response.data.metadata.code == '200') {
      showSuccess(response.data.metadata.message)

      if (hanyaSimpanKeBPJS.value == 1) {
        resetForm()
        return
      }

      const noReg = response.data.data_trans.metadata.no_reg
      const noSepResp = response.data.data_trans.metadata.sep || ''

      if (carabayarSelected.value.KODE == 5) {
        PrintSEP(noSepResp, noReg, norm.value)
      } else {
        PrintSEP('', noReg, norm.value)
      }

      resetForm()
    } else {
      showInfo(response.data.metadata.message)
    }
    // Implementation depends on your submit API
  } catch (error) {
    console.error('Error submitting form:', error)
    showError('Error submitting form')
  } finally {
    loading.value = false
  }
}

const PrintSEP = async (nosep, noregister, norm) => {
  const data = {
    data: {
      NOPENDAFTARAN: noregister,
      NOSEP: nosep,
      id_client: id_client.value,
      NORM: norm,
    },
  }
  // const response = await axios.post(`${url}/get_data_sep_api`, payLoad)
  const response = await axios.post(`${configStore.laravel}/get_data_sep_api`, data)

  window.open(response.data, '_blank')
}

// KLL related methods
const onProvinsiChange = () => {
  kabupatenKLL.value = null
  kecamatanKLL.value = null
  kabupatenOptions.value = []
  kecamatanOptions.value = []
  // Load kabupaten based on selected provinsi
  // Implementation depends on your API
}

const onKabupatenChange = () => {
  kecamatanKLL.value = null
  kecamatanOptions.value = []
  // Load kecamatan based on selected kabupaten
  // Implementation depends on your API
}

// ===== FORM ERRORS STATE =====
const formErrors = ref({
  TanggalRawat: false,
  TanggalSEP: false,
  jenisrawatSelected: false,
  carabayarSelected: false,
  dokterSelected: false,
  diagnoseSelected: false,
  ruanganSelected: false,
  poliSelected: false,
  selectedKelas: false,
  tanggalKLL: false,
  provinsiKLL: false,
  kabupatenKLL: false,
  kecamatanKLL: false,
})
// ===== VALIDATION =====
const validateForm = () => {
  // Reset all errors
  Object.keys(formErrors.value).forEach((key) => {
    formErrors.value[key] = false
  })

  let isValid = true

  if (!norm.value) {
    // Validate Tanggal Masuk RS
    isValid = false
  }

  // Validate Tanggal Masuk RS
  if (!TanggalRawat.value) {
    formErrors.value.TanggalRawat = true
    isValid = false
  }

  // Validate Jenis Rawat
  if (!jenisrawatSelected.value) {
    formErrors.value.jenisrawatSelected = true
    isValid = false
  }

  // Validate Cara Bayar
  if (!carabayarSelected.value) {
    formErrors.value.carabayarSelected = true
    isValid = false
  }

  // Validate DPJP
  if (!dokterSelected.value) {
    formErrors.value.dokterSelected = true
    isValid = false
  }

  // Validate Diagnosis
  // if (!diagnoseSelected.value) {
  //   formErrors.value.diagnoseSelected = true
  //   isValid = false
  // }

  // Validate SEP date if cara bayar is BPJS (code 5)
  if (carabayarSelected.value?.KODE === 5) {
    if (!TanggalSEP.value) {
      formErrors.value.TanggalSEP = true
      isValid = false
    }
  }
  // Validate room selection for Inap
  if (jenisrawatSelected.value.code === 1) {
    if (!ruanganSelected.value) {
      formErrors.value.ruanganSelected = true
      isValid = false
    } else if (ruanganSelected.value.TERSEDIA <= 0) {
      showInfo('Ruang rawat inap yang dipilih tidak tersedia')
      formErrors.value.ruanganSelected = true
      isValid = false
    }
  }

  // Validate poli selection for Jalan
  if (jenisrawatSelected.value.code === 2) {
    if (!poliSelected.value) {
      formErrors.value.poliSelected = true
      isValid = false
    }
  }

  // Validate KLL fields if applicable
  if (lakaLantasSelected.value?.code > 0) {
    if (!tanggalKLL.value) {
      formErrors.value.tanggalKLL = true
      isValid = false
    }
    if (!provinsiKLL.value) {
      formErrors.value.provinsiKLL = true
      isValid = false
    }
    if (!kabupatenKLL.value) {
      formErrors.value.kabupatenKLL = true
      isValid = false
    }
    if (!kecamatanKLL.value) {
      formErrors.value.kecamatanKLL = true
      isValid = false
    }
  }

  if (!isValid) {
    showError('Mohon lengkapi semua field yang diperlukan (ditandai dengan *)')
  }

  return isValid
}

const resetForm = () => {
  // ── Tanggal ──
  TanggalRawat.value = new Date()
  TanggalSEP.value = new Date()

  // ── Pelayanan ──
  jenisrawatSelected.value = { code: 1, caption: 'INAP' }
  dokterSelected.value = null
  diagnoseSelected.value = null
  carabayarSelected.value = null

  // ── Penempatan ──
  ruanganSelected.value = null
  poliSelected.value = null
  NoSPRI.value = null

  // ── KLL ──
  lakaLantasSelected.value = {
    caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]',
    code: 0,
  }
  tanggalKLL.value = null
  provinsiKLL.value = null
  kabupatenKLL.value = null
  kecamatanKLL.value = null
  kabupatenOptions.value = []
  kecamatanOptions.value = []

  // ── Informasi tambahan ──
  selectedKelas.value = null
  pasienkatarak.value = false
  Catatan.value = null

  // ── Opsi lanjutan BPJS ──
  hanyaSimpanKeBPJS.value = false
  showAdvBPJS.value = false

  // ── Temp & SEP ──
  nomor_sep.value = null
  noSEP.value = null
  tempNoregister.value = null
  tempNosep.value = null
  copiedSPRIIndex.value = null

  // ── Validasi ──
  Object.keys(formErrors.value).forEach((key) => {
    formErrors.value[key] = false
  })
}

const loadingCetakSEP = ref(false)
const cetakSEPButton = async () => {
  // const noreg = tempNoregister.value || ''
  // if (!noreg) {
  //   showError('Nomor register tidak ditemukan. Pastikan pasien sudah terdaftar.')
  //   return
  // }
  try {
    loadingCetakSEP.value = true
    //await PrintSEP(null, noreg, norm.value)
    PrintSEP('', '112605424604', '654308')
  } catch (error) {
    showError('Gagal mencetak SEP: ' + error.message)
  } finally {
    loadingCetakSEP.value = false
  }
}

const loadingPrint = ref(false)
const cetakSPRI = async (data) => {
  // Implementation for printing SPRI

  try {
    loadingPrint.value = true
    const formData = {
      NO_KARTU: data.NO_KARTU,
      NAMA: data.NAMA,
      TGLLAHIR: data.TGLLAHIR,
      USIA: data.USIA,
      JENISKELAMIN: data.JENISKELAMIN,
      diagnosa: '-',
      TANGGAL: data.TANGGAL,
      NORM: data.NORM,
      SPRI: data.SPRI,
      NAMADOKTER: data.NAMADOKTER,
      NAMA_RS: company.value,
      id_client: id_client.value,
    }

    const url = configStore.laravel
    const response = await axios.post(`${url}/generateSPRI`, formData)
    loadingPrint.value = false
    window.open(response.data, '_blank')
  } catch (error) {
    console.error('Error submitting form:', error)
    showError(error.response?.data?.message || 'An error occurred while submitting the rujukan')
  } finally {
    loadingPrint.value = false
  }
}

watch(
  () => props.os,
  (newVal) => {
    if (newVal && newVal.mr) {
      norm.value = newVal.mr.noMR || ''
    }
  },
  { deep: true, immediate: true }, // biar trigger langsung & deteksi perubahan dalam objek
)
// Watch for localStorage
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

watch(jenisrawatSelected, (newVal) => {
  if (newVal) {
    try {
      localStorage.setItem('jenisrawatSelected', JSON.stringify(newVal))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  } else {
    localStorage.removeItem('jenisrawatSelected')
  }
})

watch(poliSelected, (newVal) => {
  if (newVal) {
    try {
      localStorage.setItem('poliSelected', JSON.stringify(newVal))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  } else {
    localStorage.removeItem('poliSelected')
  }
})

const listPolyKlinik = ref([])
const LoadDataPoly = async () => {
  try {
    const url = configStore.apiBaseUrl

    const response = await axios.get(
      `${url}/index.php/api/data_referensi/datapoly/${id_client.value}`,
    )

    if (response.data.length) {
      listPolyKlinik.value = response.data
    } else {
      showError('Data pasien tidak ditemukan (lokal)')
    }
  } catch (error) {
    console.error('Error fetching pasien lokal:', error)
    showError('Terjadi kesalahan saat memuat data pasien lokal')
  } finally {
    loading.value = false
  }
}
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
// Lifecycle
onMounted(() => {
  getda_tadokter()
  GetCaraBayar()
  getRuangan()
  get_provinsi_bpjs()
  LoadDataPoly()

  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Load from localStorage
  try {
    const saved = localStorage.getItem('carabayarSelected')
    if (saved) {
      carabayarSelected.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }

  try {
    const saved = localStorage.getItem('jenisrawatSelected')
    if (saved) {
      jenisrawatSelected.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  try {
    const saved = localStorage.getItem('poliSelected')
    if (saved) {
      poliSelected.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
})
</script>

<style scoped>
/* ── Form wrapper ── */
.reg-form-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reg-section {
  border-radius: 8px;
}
.reg-section-kll {
  border-color: #fde68a;
}

.reg-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
}
.reg-section-head-warn {
  color: #b45309;
}
.reg-section-head-warn .pi {
  color: #d97706;
}

.reg-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 768px) {
  .reg-grid-2 {
    grid-template-columns: 1fr;
  }
}

.reg-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.reg-field-full {
  grid-column: 1 / -1;
}

.reg-label {
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 6px;
}
.req {
  color: #dc3545;
}

.reg-label-meta {
  font-size: 10px;
  color: #adb5bd;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 3px;
}

.reg-checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  width: fit-content;
}
.reg-checkbox-label {
  font-size: 13px;
  cursor: pointer;
  margin: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.reg-checkbox-hint {
  font-size: 11px;
  font-weight: 400;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 4px;
  padding: 1px 6px;
}

/* ── Banner peringatan hanya-BPJS ── */
.bpjs-only-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #fff7ed;
  border: 1.5px solid #f59e0b;
  border-left: 5px solid #f59e0b;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}
.bpjs-banner-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #f59e0b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}
.bpjs-banner-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.82rem;
  color: #92400e;
}
.bpjs-banner-body strong {
  font-size: 0.88rem;
  color: #78350f;
}
.bpjs-banner-dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #d97706;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.8rem;
  line-height: 1;
  transition: background 0.15s;
}
.bpjs-banner-dismiss:hover {
  background: #fde68a;
}
.bpjs-banner-enter-active,
.bpjs-banner-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.bpjs-banner-enter-from,
.bpjs-banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Opsi Lanjutan BPJS ── */
.bpjs-adv-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.bpjs-adv-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
  width: fit-content;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s;
}
.bpjs-adv-toggle:hover {
  color: #64748b;
}
.bpjs-adv-content {
  padding-left: 4px;
}
.bpjs-only-row {
  border-color: #fde68a;
  background: #fffbeb;
}
.bpjs-only-active {
  border-color: #f59e0b !important;
  background: #fef3c7 !important;
}
.adv-fade-enter-active,
.adv-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.adv-fade-enter-from,
.adv-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.ruang-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}
.ruang-name {
  font-size: 13px;
  font-weight: 500;
}
.ruang-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ruang-total {
  font-size: 11px;
  color: #6c757d;
}

.reg-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  gap: 10px;
  flex-wrap: wrap;
}
.reg-action-left {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.reg-action-right {
  display: flex;
  gap: 8px;
}

.kll-details {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.mobile-view {
  padding: 0;
}

.spri-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: #f5f5f5;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.card-title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.card-body {
  padding: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
  flex-shrink: 0;
}

.info-row .value {
  text-align: right;
  flex-grow: 1;
  margin-left: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

.flex-button {
  flex: 1;
  min-width: 0;
}

.mobile-button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.mobile-button-group .p-button {
  width: 100%;
}

.copy-btn {
  margin-left: 8px !important;
}

.text-muted {
  color: #999;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .mobile-dialog {
    width: 100vw !important;
    max-width: 100% !important;
  }

  .spri-card {
    margin-bottom: 8px;
  }

  .info-row {
    flex-direction: column;
  }

  .info-row .label {
    margin-bottom: 4px;
    min-width: auto;
  }

  .info-row .value {
    text-align: left;
    margin-left: 0;
  }

  .card-actions {
    gap: 6px;
  }

  .card-actions .p-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .mobile-dialog {
    border-radius: 12px 12px 0 0;
  }

  .spri-card {
    border-radius: 6px;
  }

  .card-header,
  .card-body,
  .card-actions {
    padding: 10px;
  }

  .info-row {
    font-size: 0.85rem;
  }

  .info-row .label {
    margin-bottom: 2px;
  }
}
</style>
