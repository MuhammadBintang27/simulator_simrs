<template>
  <div class="container">
    <!-- Loading State -->
    <loading_overlay :is-loading="loading" message="Memuat data...." />
    <!-- Main Form -->
    <div class="form-wrapper">
      <!-- Header -->
      <div class="form-header">
        <h1>Edit Pendaftaran Pasien</h1>
      </div>
      <!-- Patient Info Section (Read Only) -->
      <div class="section">
        <h2><i class="pi pi-user"></i> Informasi Pasien</h2>
        <div class="grid-2">
          <div class="form-group">
            <label>Nomor Registrasi</label>
            <InputText v-model="formData.NOPENDAFTARAN" readonly />
          </div>
          <div class="form-group">
            <label>No RM</label>
            <InputText v-model="formData.NOMR" readonly />
          </div>
          <div class="form-group">
            <label>Nama Pasien</label>
            <InputText v-model="formData.NAMAPASIEN" readonly />
          </div>
          <div class="form-group">
            <label>NIK</label>
            <InputText v-model="formData.NOKTP" readonly />
          </div>
          <div class="form-group">
            <label>Cara Bayar <span class="required">*</span></label>

            <Select
              v-model="formData.CARABAYAR"
              :options="listcaraBayar"
              optionDisabled="disabled"
              optionLabel="NAMA"
              placeholder="Pilih cara bayar..."
            />
          </div>
          <div class="form-group">
            <label>JENIS RAWAT</label>
            <InputText v-model="formData.JENISRAWAT" readonly />
          </div>
        </div>
      </div>

      <!-- Edit Section -->
      <div class="section">
        <h2><i class="pi pi-calendar"></i> Data Kunjungan</h2>

        <div class="grid-2">
          <!-- Tanggal Masuk -->
          <div class="form-group">
            <label>Tanggal & Jam Masuk <span class="required">*</span></label>
            <DatePicker
              v-model="formData.MASUKPOLY"
              @update:modelValue="formData.MASUKPOLY = $event"
              dateFormat="yy-mm-dd"
              :showTime="true"
              hourFormat="24"
              placeholder="Pilih tanggal & jam"
            />
          </div>

          <!-- Dokter -->
          <div class="form-group">
            <label>Pilih Dokter <span class="required">*</span></label>
            <Select
              v-model="dokterSelected"
              :options="listDokter"
              optionLabel="NAMADOKTER"
              placeholder="Cari dokter..."
              filter
              :loading="loadingDokter"
              @change="onDokterChange"
            />
          </div>
        </div>
        <br />
        <!-- Diagnosa -->
        <div class="form-group">
          <label>Diagnosa <span class="required">*</span></label>

          <Select
            v-model="diagnoseSelected"
            :options="listDiagnose"
            optionLabel="dx"
            placeholder="Cari diagnosa..."
            filter
            @filter="searchDiagnose"
            @change="onDiagnosaChange()"
            :loading="loadingDiagnosa"
          />
        </div>
        <br />
        <!-- Catatan -->
        <div class="form-group">
          <label>Catatan Medis <span class="required">*</span></label>
          <Textarea
            v-model="formData.CATATAN"
            :autoResize="true"
            rows="4"
            placeholder="Masukkan catatan medis pasien..."
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <Button
          severity="info"
          class="round-button2"
          :loading="loading"
          @click="showMergerForm = true"
        >
          <i class="fa-solid fa-arrows-turn-to-dots"></i>
          <span>Merge Transaksi</span>
        </Button>
        <Button
          label="Rubah ke BPJS"
          icon="pi pi-sync"
          severity="warn"
          class="round-button2"
          :loading="loading"
          @click="conversiKEBPJS"
        />
        <Button
          label="Simpan"
          icon="pi pi-save"
          severity="success"
          class="round-button2"
          :loading="loading"
          @click="saveData"
        />
      </div>
    </div>

    <Dialog v-model:visible="showDialogConversi" modal :style="{ width: '800px' }" :closable="true">
      <div class="row p-10">
        <div class="col-md-11">
          <div class="section">
            <h2><i class="pi pi-user"></i> DATA SEP (Surat Eligibitas Peserta)</h2>

            <div class="grid-1">
              <div class="form-group mt-3">
                <label>Tanggal SEP</label>
                <DatePicker
                  id="tanggal_pulang"
                  v-model="TanggalSEP"
                  dateFormat="dd M yy"
                  placeholder="Pilih tanggal"
                  showIcon
                  iconDisplay="input"
                  style="width: 100%"
                />
              </div>

              <div class="form-group mt-3">
                <label>Pilih DPJP</label>
                <Select
                  v-model="dokterSelected"
                  :options="listDokter"
                  optionLabel="NAMADOKTER"
                  placeholder="Pilih DPJP"
                  class="w-100"
                  filter
                  showClear
                />
              </div>

              <div class="input-group mt-3">
                <label>SPRI (Surat Perintah Rawat Inap)</label><br />
                <InputText v-model="NoSPRI" style="width: 82%" />
                <Button
                  label="SPRI"
                  icon="pi pi-history"
                  @click="callFOrmListSPRI"
                  style="height: 35px"
                />
              </div>

              <div class="form-group mt-3">
                <div style="display: flex; align-items: center">
                  <Checkbox v-model="pasienkatarak" :binary="true" id="pasienkatarak" />
                  <label
                    for="pasienkatarak"
                    style="margin-left: 8px; margin-bottom: 0em; cursor: pointer"
                  >
                    Pasien Katarak
                  </label>
                </div>
              </div>
              <div class="form-group mt-3">
                <label>Pilih Diagnosa Pasien</label>
                <Select
                  v-model="diagnoseSelected"
                  :options="listDiagnose"
                  optionLabel="dx"
                  :filter="true"
                  :showClear="false"
                  @filter="searchDiagnose"
                  placeholder="Search diagnose..."
                  appendTo="body"
                  style="width: 100%; height: 35px"
                />
              </div>

              <!-- Traffic Accident -->
              <div class="form-group">
                <label class="font-bold">Pasien KLL? <span class="text-danger">*</span></label>
                <Select
                  v-model="lakaLantasSelected"
                  :options="lakaLantasOptions"
                  optionLabel="caption"
                  placeholder="Pilih status KLL"
                  class="w-100"
                />
              </div>
              <!-- Traffic Accident Details (conditional) -->
              <div v-if="lakaLantasSelected.code > 0" class="kll-details">
                <div class="form-group">
                  <label class="font-bold">Tanggal KLL <span class="text-danger">*</span></label>
                  <DatePicker
                    v-model="tanggalKLL"
                    :showIcon="true"
                    view="date"
                    dateFormat="dd/mm/yy"
                    :yearNavigator="true"
                    yearRange="2000:2030"
                    placeholder="Pilih Tanggal KLL"
                    class="w-100"
                  />
                </div>

                <div class="form-group">
                  <label class="font-bold"
                    >Provinsi Lokasi KLL <span class="text-danger">*</span></label
                  >
                  <Select
                    v-model="provinsiKLL"
                    :options="provinsiOptions"
                    optionLabel="nama"
                    :filter="true"
                    :showClear="true"
                    @change="GeKabupaten_bpjs"
                    placeholder="Pilih Provinsi"
                    class="w-100"
                  />
                </div>

                <div class="form-group">
                  <label class="font-bold">Kabupaten/Kota <span class="text-danger">*</span></label>

                  <Select
                    v-model="kabupatenKLL"
                    :options="kabupatenOptions"
                    optionLabel="nama"
                    :filter="true"
                    :showClear="true"
                    :disabled="!provinsiKLL"
                    @change="GetKecamatan_bpjs"
                    placeholder="Pilih Kabupaten/Kota"
                    :loading="loading_load_kab"
                    class="w-100"
                  />
                </div>

                <div class="form-group">
                  <label class="font-bold">Kecamatan <span class="text-danger">*</span></label>

                  <Select
                    v-model="kecamatanKLL"
                    :options="kecamatanOptions"
                    optionLabel="nama"
                    :filter="true"
                    :showClear="true"
                    :disabled="!kabupatenKLL"
                    :loading="loading_load_kec"
                    placeholder="Pilih Kecamatan"
                    class="w-100"
                  />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <Button
                label="Simpan"
                icon="pi pi-save"
                severity="success"
                class="w-100"
                :loading="loading"
                @click="submitForm"
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>

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
                :loading="loadingPrint"
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
                  class="round-button2"
                  @click="cetakSPRI(spri)"
                  :loading="loadingPrint"
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
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showMergerForm"
      modal
      header="Merger Transaksi Pasien"
      :style="{ width: '90vw', maxWidth: '1000px' }"
      :breakpoints="{ '960px': '95vw', '641px': '100vw' }"
    >
      <div class="p-2">
        <Stepper value="1">
          <StepList>
            <Step value="1">Cari Transaksi</Step>
            <Step value="2">Review & Konfirmasi</Step>
          </StepList>

          <StepPanels>
            <StepPanel v-slot="{ activateCallback }" value="1">
              <div class="flex flex-column">
                <div class="mb-4 border-bottom pb-2">
                  <h5 class="fw-bold">
                    <i class="pi pi-search me-2 mr-3"></i>Pencarian Data Transaksi Pasien
                  </h5>

                  <div class="row g-3 mb-4">
                    <div class="col-12 col-md-5">
                      <label class="form-label fw-semibold">Cari Pasien (Data Salah)</label>
                      <div class="p-input-icon-left w-100">
                        <InputText
                          v-model="searchKeyword"
                          placeholder="No RM / Nama / NIK..."
                          class="w-100 p-inputtext-sm"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-md-4">
                      <label class="form-label fw-semibold">Periode Kunjungan</label>
                      <div class="d-flex gap-2">
                        <DatePicker
                          v-model="tanggalAwal"
                          dateFormat="dd/mm/yy"
                          class="flex-grow-1"
                        />
                        <DatePicker
                          v-model="tanggalAkhir"
                          dateFormat="dd/mm/yy"
                          class="flex-grow-1"
                        />
                      </div>
                    </div>
                    <div class="col-12 col-md-3 d-flex align-items-end">
                      <Button
                        label="Cari Transaksi"
                        icon="pi pi-search"
                        class="w-100"
                        @click="cariTransaksi(13)"
                        :loading="loading"
                      />
                    </div>
                  </div>

                  <DataTable
                    :value="listPasienPencarian"
                    stripedRows
                    paginator
                    :rows="5"
                    responsiveLayout="stack"
                    class="p-datatable-sm border rounded shadow-sm"
                  >
                    <Column field="NOPENDAFTARAN" header="NO REG"></Column>
                    <Column field="NOMR" header="NORM"></Column>
                    <Column field="DATA_SINGKAT" header="NAMA PASIEN"></Column>
                    <Column field="NOSEP" header="NOSEP"></Column>
                    <Column field="TGLREG" header="TGL REG"></Column>
                    <Column field="JENIS RAWAT" header="JENIS RAWAT"></Column>
                    <Column header="AKSI" class="text-center">
                      <template #body="slotProps">
                        <Button
                          label="Pilih"
                          icon="pi pi-check-circle"
                          severity="info"
                          size="small"
                          @click="selectTransaksi(slotProps.data, activateCallback)"
                        />
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </div>
            </StepPanel>

            <StepPanel v-slot="{ activateCallback }" value="2">
              <div class="flex flex-column">
                <h6 class="fw-bold mb-3 text-primary border-bottom pb-2">
                  Langkah 2: Konfirmasi Review Perubahan
                </h6>

                <div class="row g-3 mb-4" v-if="transaksiTerpilih">
                  <div class="col-12 col-md-6">
                    <div class="card h-100 border-danger shadow-sm">
                      <div class="card-header bg-danger-subtle text-danger fw-bold py-2">
                        <i class="pi pi-history me-2 mr-2"></i>DATA TRANSAKSI SAAT INI
                      </div>
                      <div class="card-body py-3">
                        <div class="mb-2">
                          <label class="d-block">No. Registrasi</label>
                          <span class="fw-bold" style="font-size: 1.1rem">{{
                            originalFormData?.NOPENDAFTARAN
                          }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">Pasien Aktif (Salah RM)</label>
                          <span class="text-danger fw-semibold" style="font-size: 1.1rem">
                            {{ originalFormData.NOMR }}
                          </span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">Nama Pasien Tujuan</label>
                          <span class="fw-bold">{{ originalFormData.DATA_SINGKAT }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">NOSEP</label>
                          <span class="fw-bold">{{ originalFormData?.NOSEP || '---' }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">JENIS RAWAT</label>
                          <span class="fw-bold">{{ originalFormData?.JENISRAWAT }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">DPJP</label>
                          <span class="fw-bold">{{ originalFormData?.NAMADOKTER }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">CARA BAYAR</label>
                          <span class="fw-bold">{{ originalFormData.CARABAYAR }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">TANGGAL REG</label>
                          <span class="fw-bold">{{
                            formatDateOnly(originalFormData?.MASUKPOLY)
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="d-none d-md-flex col-md-1 align-items-center justify-content-center">
                    <i class="pi pi-arrow-left text-muted" style="font-size: 1.5rem"></i>
                  </div>

                  <div class="col-12 col-md-5">
                    <div class="card h-100 border-success shadow-sm">
                      <div class="card-header bg-success-subtle text-success fw-bold py-2">
                        <i class="pi pi-user-check me-2"></i>PINDAHKAN KE PASIEN UTAMA
                      </div>
                      <div class="card-body py-3">
                        <div class="mb-2">
                          <label class="d-block">NOGISTRASI</label>
                          <span class="fw-bold" style="font-size: 1.1rem">
                            {{ transaksiTerpilih?.NOPENDAFTARAN }}
                          </span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">Target RM Utama</label>
                          <span class="fw-bold text-success" style="font-size: 1.1rem">
                            {{ transaksiTerpilih.NOMR }}
                          </span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">Nama Pasien Tujuan</label>
                          <span class="fw-bold">{{ transaksiTerpilih?.DATA_SINGKAT }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">NOSEP</label>
                          <span class="fw-bold">{{ transaksiTerpilih?.NOSEP }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">JENIS RAWAT</label>
                          <span class="fw-bold">{{ transaksiTerpilih?.JENISRAWAT }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">DPJP</label>
                          <span class="fw-bold">{{ transaksiTerpilih?.NAMADOKTER }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">CARABAYAR</label>
                          <span class="fw-bold">{{ transaksiTerpilih?.CARABAYAR }}</span>
                        </div>
                        <div class="mb-2">
                          <label class="d-block">TANGGAL REG</label>
                          <span class="fw-bold">{{
                            formatDateOnly(transaksiTerpilih?.MASUKPOLY)
                          }}</span>
                        </div>
                        <!-- <div class="mt-3 p-2 bg-success-subtle rounded border border-success">
                          <small class="fw-bold text-success"
                            ><i class="pi pi-info-circle"></i> Hasil:</small
                          >
                          <p class="mb-0 text-dark">
                            Transaksi
                            <strong>{{ transaksiTerpilih.NOPENDAFTARAN }}</strong> dipindahkan ke RM
                            <strong>{{ transaksiTerpilih.NOMR }}</strong
                            >.
                          </p>
                        </div> -->
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-between pt-4 border-top">
                  <Button
                    label="Kembali"
                    icon="pi pi-arrow-left"
                    text
                    severity="secondary"
                    @click="activateCallback('1')"
                  />
                  <Button
                    label="Proses Merger Transaksi"
                    icon="pi pi-sync"
                    severity="success"
                    @click="prosesMerger"
                    :loading="isProcessing"
                  />
                </div>
              </div>
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>
    </Dialog>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import { useRoute } from 'vue-router'

import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import StepPanels from 'primevue/steppanels'
import Step from 'primevue/step'
import StepPanel from 'primevue/steppanel'

// Setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, company } = storeToRefs(authStore)
const route = useRoute()
const toast = useToast()

const tanggalAwal = ref(new Date())
const tanggalAkhir = ref(new Date())

// State
const loading = ref(false)
const loadingDokter = ref(false)
const loadingDiagnosa = ref(false)

// State
const isProcessing = ref(false)

const transaksiTerpilih = ref(null)

const showMergerForm = ref(false)

const showDialogConversi = ref(false)

const formData = ref({
  NOPENDAFTARAN: '',
  NOMR: '',
  NAMAPASIEN: '',
  NOKTP: '',
  MASUKPOLY: null,
  IDDOKTER: null,
  IDDIAGNOSA: null,
  CATATAN: '',
})

// Data Dummy Pasien Utama (Contoh data yang sudah dipilih sebelumnya di modul induk)
const pasienUtama = ref({
  NOMR: formData.value.NOMR,
  NAMA_PASIEN: formData.value.NAMAPASIEN,
  NIK: formData.value.NOKTP,
})

// Fungsi Pilih Transaksi & Lanjut ke Step 2
const selectTransaksi = (data, activateCallback) => {
  transaksiTerpilih.value = data
  activateCallback('2') // Pindah ke Step Review
}

// Eksekusi Merger
const prosesMerger = async () => {
  isProcessing.value = true
  // Simulasi Proses API

  const payload = {
    trans_dipilih: transaksiTerpilih.value,
    trans_asal: { ...originalFormData.value, SUB_SP: pasienUtama.value },
    user_id: user_id.value,
    id_client: id_client.value,
  }

  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/merger_rekam_medis`, payload)

    if (response.data.code == 200) {
      showSuccess(response.data.message)
    } else {
      showError(response.data.message)
    }
    isProcessing.value = false
  } catch (error) {
    isProcessing.value = false
    showError(error)
  }
}
// Computed property untuk format display
const formattedTglMasuk = computed({
  get() {
    return formData.value.MASUKPOLY
  },
  set(value) {
    formData.value.MASUKPOLY = value
  },
})

const NoSPRI = ref()

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

const showListSPRI = ref(false)

const lakaLantasSelected = ref({
  caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]',
  code: 0,
})

const carabayarSelected = ref(null)

const originalFormData = ref({})
const dokterSelected = ref(null)
const listDokter = ref([])
const diagnoseSelected = ref(null)
const listDiagnose = ref([])

// KLL related data
const tanggalKLL = ref(null)
const provinsiKLL = ref(null)
const kabupatenKLL = ref(null)
const kecamatanKLL = ref(null)
const kecamatanOptions = ref([])

const pasienkatarak = ref(false)

const showSuccess = (msg) => {
  toast.add({ severity: 'success', summary: 'Sukses', detail: msg, life: 3000 })
}

const showError = (msg) => {
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
}

const showWarning = (msg) => {
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: msg, life: 4000 })
}
// Options
const lakaLantasOptions = ref([
  { caption: '0 - Bukan Kecelakaan lalu lintas [BKLL]', code: 0 },
  { caption: '1 - KLL dan bukan kecelakaan Kerja [BKK]', code: 1 },
  { caption: '2 - KLL dan KK', code: 2 },
  { caption: '3 - Kecelakaan Kerja [KK]', code: 3 },
])

const TanggalSEP = ref(new Date())

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

// Date formatting
const formatDateTimeForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return null
  }
}

const listcaraBayar = ref([])

const GetCaraBayar = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/data_referensi/datacarabayar2/${id_client.value}`,
    )

    if (response.data) {
      // pastikan response.data array
      listcaraBayar.value = response.data
      //   if (formData.value.CARABAYAR_KODE == '5') {
      //     listcaraBayar.value = response.data.map((item) => {
      //       return {
      //         ...item,
      //       }
      //     })
      //   } else {
      //     listcaraBayar.value = response.data.map((item) => {
      //       return {
      //         ...item,
      //         disabled: item.KODE == '5' ? true : false, // Atau item.KDCARABAYAR === '5'
      //       }
      //     })
      //   }
    }
  } catch (error) {
    console.error('Error fetching cara bayar:', error)
    showError('Error fetching cara bayar')
  }
}

const searchKeyword = ref(null)
const listPasienPencarian = ref([])
const cariTransaksi = async (mode) => {
  try {
    const payLoads = {
      mod: mode,
      tglawal: formatDateOnlyForAPI(tanggalAwal.value),
      tglakhir: formatDateOnlyForAPI(tanggalAkhir.value),
      id_client: id_client.value,
      norm: searchKeyword.value,
    }

    loading.value = true
    listPasienPencarian.value = []
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/history_versi4`,
      payLoads,
    )

    if (response.data.response.length > 0) {
      listPasienPencarian.value = [...response.data.response]
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    loading.value = false
  }
}

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

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
// Lifecy

const formatDateOnly = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return null
  }
}

const callFOrmListSPRI = () => {
  showListSPRI.value = true
  GetListSPRI()
}

const spriHistoryData = ref([])
const isLoadingSPRI = ref(false)
const GetListSPRI = async () => {
  try {
    isLoadingSPRI.value = true

    const payload = {
      mode: 'history3',
      SPRI: formData.value?.NOMR,
      id_client: id_client.value,
      tgl: null,
      norm: formData.value?.NOMR,
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

// Fetch patient data
const fetchData = async () => {
  try {
    loading.value = true
    const payload = {
      mod: 1,
      tglawal: formatDateOnly(new Date()),
      id_client: id_client.value,
      noregister: route.params?.noreg,
    }

    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`,
      payload,
    )

    if (response.data.response.length > 0) {
      setFormData(response.data.response[0])
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal memuat data')
  } finally {
    loading.value = false
  }
}

// Fetch doctors
const fetchDokter = async () => {
  try {
    loadingDokter.value = true
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/datadokterv3`,
      { id_client: id_client.value, mode: 2 },
    )
    if (response.data?.response) {
      listDokter.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching doctors:', error)
    showError('Gagal memuat data dokter')
  } finally {
    loadingDokter.value = false
  }
}

// Search diagnose
const searchDiagnose = async (event) => {
  const query = event.value
  if (!query || query.length < 2) {
    listDiagnose.value = []
    return
  }

  try {
    loadingDiagnosa.value = true
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/get_icd_v2`,
      { mode: 1, param: query },
    )
    listDiagnose.value = response.data
  } catch (error) {
    console.error('Error searching diagnose:', error)
    showError('Gagal mencari diagnosa')
  } finally {
    loadingDiagnosa.value = false
  }
}

// Handle dokter change
const onDokterChange = () => {
  if (dokterSelected.value) {
    formData.value.DOKTER = dokterSelected.value
  }
}

const showInfo = (message = 'Informasi') => {
  toast.add({
    severity: 'info',
    summary: 'Informasi',
    detail: message,
    life: 3000,
  })
}

const onDiagnosaChange = () => {
  if (dokterSelected.value) {
    formData.value.IDDIAGNOSA = diagnoseSelected.value
  }
}

// Validate form
const validateForm = () => {
  if (!formData.value.MASUKPOLY) {
    showWarning('Tanggal masuk harus diisi')
    return false
  }
  if (!formData.value.IDDOKTER) {
    showWarning('Dokter harus dipilih')
    return false
  }
  if (!formData.value.IDDIAGNOSA) {
    showWarning('Diagnosa harus dipilih')
    return false
  }
  if (!formData.value.CATATAN?.trim()) {
    showWarning('Catatan harus diisi')
    return false
  }
  return true
}

const conversiKEBPJS = async () => {
  loading.value = true
  try {
    showDialogConversi.value = true

    // formData.value = {
    //   MASUKPOLY: formatDateTimeForAPI(formData.value),
    //   ...formData.value,
    // }
    // const response = await axios.post(
    //   `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/update_sep_pasien_v2`,
    //   formData.value,
    // )

    // if (response.data?.metadata?.code === 200) {
    //   showSuccess(response.data?.metadata?.message)
    //   originalFormData.value = { ...formData.value }
    // } else {
    //   showError(response.data?.metadata?.message || 'Gagal menyimpan data')
    // }
  } catch (error) {
    console.error('Error saving data:', error)
    showError('Terjadi kesalahan saat menyimpan')
  } finally {
    loading.value = false
  }
}
// Save data
const saveData = async () => {
  loading.value = true
  try {
    formData.value = {
      MASUKPOLY: formatDateTimeForAPI(formData.value),
      ...formData.value,
    }
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/update_sep_pasien_v2`,
      formData.value,
    )

    if (response.data?.metadata?.code === 200) {
      showSuccess(response.data?.metadata?.message)
      originalFormData.value = { ...formData.value }
    } else {
      showError(response.data?.metadata?.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error('Error saving data:', error)
    showError('Terjadi kesalahan saat menyimpan')
  } finally {
    loading.value = false
  }
}

const copiedSPRIIndex = ref(null)
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
        nokartu: formData.value.NOJAMINAN,
        KDDOKTER: dokterSelected.value.KDDOKTER,
        KODE_DOKTER_BPJS: dokterSelected.value.KODE_DOKTER_BPJS,
        KodePoliBPJS: dokterSelected.value.SUB_SP,
        tglRencanaKontrol: formatDateOnlyForAPI(TanggalSEP.value),
        nomr: formData.value.NOMR,
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

// Method converted to function
const isLoading = ref(false)
const provinsiOptions = ref([])
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

const loading_load_kab = ref(false)
const kabupatenOptions = ref([])
const GeKabupaten_bpjs = async (e) => {
  console.log(e.value)
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

const loading_load_kec = ref(false)
const GetKecamatan_bpjs = async (e) => {
  console.log(e.value)
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

// Reset form
const resetForm = () => {
  formData.value = { ...originalFormData.value }
  showWarning('Form direset')
}

// Set form data
const setFormData = (data) => {
  console.log(data)
  diagnoseSelected.value = {
    icd_code: data.DIAGNOSA_AWAL,
    caption: data.DX_CAPTION,
    dx: `${data.DIAGNOSA_AWAL} - ${data.DX_CAPTION}`,
  }

  dokterSelected.value = listDokter.value.filter((x) => x.KDDOKTER === data.KDDOKTER)[0] || null

  formData.value = {
    NOPENDAFTARAN: data.NOPENDAFTARAN || '',
    NOJAMINAN: data.NOJAMINAN,
    NOMR: data.NOMR || '',
    NAMAPASIEN: data.NAMAPASIEN || '',
    NOKTP: data.NOKTP || '',
    MASUKPOLY: data.MASUKPOLY ? new Date(data.MASUKPOLY) : null,
    IDDIAGNOSA: diagnoseSelected.value,
    CATATAN: data.CATATAN || '',
    DOKTER: dokterSelected.value,
    CARABAYAR_KODE: data.KODECARABAYAR,
    JENISRAWAT: data.JENISRAWAT,
    CARABAYAR: listcaraBayar.value.filter((x) => x.KODE == data.KODECARABAYAR)[0] || null,
  }

  listDiagnose.value = [diagnoseSelected.value]
  originalFormData.value = data //{ ...formData.value }
}

const submitForm = async () => {
  // if (!validateForm()) return

  try {
    loading.value = true

    const url = configStore.apiBaseUrl

    const payload = {
      param: {
        tglsep: formatDateOnlyForAPI(TanggalSEP.value),
        tanggalKLL: formatDateOnlyForAPI(tanggalKLL.value),
        noka: formData.value.NOJAMINAN,
        norm: formData.value.NOMR,
        id_client: id_client.value,
        diagnoseSelected: diagnoseSelected.value,
        jenisrawatSelected: {
          code: formData.value.JENISRAWAT == 'INAP' ? 1 : 2,
        },
        poliSelected: {
          kode: formData.value.JENISRAWAT == 'INAP' ? dokterSelected.value.KDPOLY_BPJS : 'IGD',
        },
        jenisTrans: {
          code: 3,
        },
        jenis_kunj: 3, //update menjadi BPJS
        kd_cara_bayar: 5, //BPJS
        pasienkatarak: pasienkatarak.value ? 1 : 0,
        lakaLantas: lakaLantasSelected.value,
        nospri: NoSPRI.value,
        dokterSelected: dokterSelected.value,
        provSelected: provinsiKLL.value,
        kabSelected: kabupatenKLL.value,
        kecSelected: kecamatanKLL.value,
        noregister: formData.value.NOPENDAFTARAN,
        ruanganSelected: {
          kode: (formData.value.JENISRAWAT == 'INAP') === 1 ? 0 : '',
        },
      },

      id_client: id_client.value,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/index.php/api/Bpjs_api/createSEP`, payload)

    console.log(response.data)
    if (response.data.metadata.code == '200') {
      showSuccess(response.data.metadata.message)

      showDialogConversi.value = false
      fetchData()

      // if (carabayarSelected.value.KODE == 5) {
      //   PrintSEP(response.data.sep, response.data.metadata.noregiter)
      // }
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

// Lifecycle
onMounted(async () => {
  await GetCaraBayar()
  await fetchDokter()
  await fetchData()
  await get_provinsi_bpjs()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.form-wrapper {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 15px;
}

.form-header h1 {
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.section {
  margin-bottom: 25px;
}

.section h2 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.required {
  color: #dc3545;
}

:deep(.p-inputtext:focus),
:deep(.p-inputtextarea:focus) {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  outline: none;
}

:deep(.p-inputtext[readonly]),
:deep(.p-inputtext[disabled]) {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

:deep(.p-button-secondary:hover) {
  background-color: #5a6268;
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
