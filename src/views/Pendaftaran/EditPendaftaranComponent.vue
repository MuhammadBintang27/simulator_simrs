<template>
  <div class="container">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Page Header -->
    <div class="ep-header">
      <div class="ep-header-left">
        <div class="ep-header-icon"><i class="pi pi-file-edit"></i></div>
        <div>
          <div class="ep-header-title">Edit Pendaftaran Pasien</div>
          <div class="ep-header-sub" v-if="formData.NAMAPASIEN">
            <i class="pi pi-user me-1"></i>{{ formData.NAMAPASIEN }}
            <span class="ep-header-sep">·</span>
            <i class="pi pi-id-card me-1"></i>{{ formData.NOMR }}
            <span class="ep-header-sep">·</span>
            <i class="pi pi-tag me-1"></i>{{ formData.JENISRAWAT }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Form -->
    <div class="form-wrapper">
      <!-- Informasi Pasien -->
      <div class="ep-section">
        <div class="ep-section-head">
          <i class="pi pi-user"></i>
          <span>Informasi Pasien</span>
          <span class="ep-section-badge">Read Only</span>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="ep-label">Nomor Registrasi</label>
            <InputText v-model="formData.NOPENDAFTARAN" readonly class="ep-readonly" />
          </div>
          <div class="form-group">
            <label class="ep-label">No. Rekam Medis</label>
            <InputText v-model="formData.NOMR" readonly class="ep-readonly" />
          </div>
          <div class="form-group">
            <label class="ep-label">Nama Pasien</label>
            <InputText v-model="formData.NAMAPASIEN" readonly class="ep-readonly" />
          </div>
          <div class="form-group">
            <label class="ep-label">NIK</label>
            <InputText v-model="formData.NOKTP" readonly class="ep-readonly" />
          </div>
          <div class="form-group">
            <label class="ep-label">Cara Bayar <span class="required">*</span></label>
            <Select
              v-model="formData.CARABAYAR"
              :options="listcaraBayar"
              optionLabel="NAMA"
              placeholder="Pilih cara bayar..."
              class="w-100"
            />
          </div>
          <div class="form-group">
            <label class="ep-label">Jenis Rawat</label>
            <InputText v-model="formData.JENISRAWAT" readonly class="ep-readonly" />
          </div>
        </div>
      </div>

      <!-- Data Kunjungan -->
      <div class="ep-section">
        <div class="ep-section-head">
          <i class="pi pi-calendar"></i>
          <span>Data Kunjungan</span>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="ep-label">Tanggal & Jam Masuk <span class="required">*</span></label>
            <DatePicker
              v-model="formData.MASUKPOLY"
              @update:modelValue="formData.MASUKPOLY = $event"
              dateFormat="yy-mm-dd"
              :showTime="true"
              hourFormat="24"
              placeholder="Pilih tanggal & jam"
              class="w-100"
            />
          </div>
          <div class="form-group">
            <label class="ep-label">DPJP / Dokter <span class="required">*</span></label>
            <Select
              v-model="dokterSelected"
              :options="listDokter"
              optionLabel="NAMADOKTER"
              placeholder="Cari dokter..."
              filter
              :loading="loadingDokter"
              @change="onDokterChange"
              class="w-100"
            />
          </div>
        </div>
        <div class="form-group" style="margin-top: 0.85rem">
          <label class="ep-label">Diagnosa <span class="required">*</span></label>
          <Select
            v-model="diagnoseSelected"
            :options="listDiagnose"
            optionLabel="dx"
            placeholder="Cari diagnosa..."
            filter
            @filter="searchDiagnose"
            @change="onDiagnosaChange()"
            :loading="loadingDiagnosa"
            class="w-100"
          />
        </div>
        <div class="form-group" style="margin-top: 0.85rem">
          <label class="ep-label">Catatan Medis <span class="required">*</span></label>
          <Textarea
            v-model="formData.CATATAN"
            :autoResize="true"
            rows="3"
            placeholder="Masukkan catatan medis pasien..."
            class="w-100"
          />
        </div>
      </div>

      <!-- ══ NORM EDIT (tersembunyi) ══ -->
      <div class="norm-adv-wrap">
        <button class="norm-adv-toggle" @click="showNormEdit = !showNormEdit" type="button">
          <i class="pi pi-id-card" style="color: darkcyan"></i>
          <span>Edit No. Rekam Medis</span>
          <span class="norm-adv-hint">— opsi lanjutan</span>
          <i class="pi ms-auto" :class="showNormEdit ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
        </button>

        <Transition name="norm-slide">
          <div v-if="showNormEdit" class="norm-edit-panel">
            <div class="norm-warn-banner">
              <i class="pi pi-exclamation-triangle" style="font-size: 1.1rem; flex-shrink: 0"></i>
              <div>
                <strong>Perhatian!</strong> Perubahan No. Rekam Medis akan berdampak pada seluruh
                riwayat rekam medis pasien. Pastikan Anda memiliki wewenang sebelum mengubah data
                ini.
              </div>
            </div>
            <div class="grid-2" style="margin-top: 0.75rem">
              <div class="form-group">
                <label class="ep-label">No. Rekam Medis Saat Ini</label>
                <InputText v-model="formData.NOMR" readonly class="ep-readonly w-100" />
              </div>
              <div class="form-group">
                <label class="ep-label">
                  No. Rekam Medis Baru
                  <span style="font-size: 0.7rem; color: darkcyan; font-weight: 600"
                    >(No. RM Pengganti)</span
                  >
                </label>
                <InputText
                  v-model="editNormValue"
                  class="w-100 norm-input"
                  placeholder="Masukkan No. Rekam Medis baru..."
                />
              </div>
            </div>

            <!-- Tombol simpan NORM tersendiri -->
            <div class="norm-action-bar">
              <span class="norm-action-hint">
                <i class="pi pi-info-circle"></i>
                Perubahan ini hanya memperbarui No. Rekam Medis pada transaksi ini.
              </span>
              <Button
                label="Simpan No. Rekam Medis"
                icon="pi pi-save"
                class="round-button2"
                :loading="loadingNorm"
                :disabled="!editNormValue?.trim() || editNormValue === formData.NOMR"
                @click="updateNomrRM"
                style="background: darkcyan; border-color: darkcyan"
              />
            </div>
          </div>
        </Transition>
      </div>

      <!-- ══ SEP EDIT (tersembunyi) ══ -->
      <div class="sep-adv-wrap">
        <button class="sep-adv-toggle" @click="showSepEdit = !showSepEdit" type="button">
          <i class="pi pi-shield" style="color: #b45309"></i>
          <span>Edit No. SEP</span>
          <span class="sep-adv-hint">— opsi lanjutan</span>
          <i class="pi ms-auto" :class="showSepEdit ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
        </button>

        <Transition name="sep-slide">
          <div v-if="showSepEdit" class="sep-edit-panel">
            <div class="sep-warn-banner">
              <i class="pi pi-exclamation-triangle" style="font-size: 1.1rem; flex-shrink: 0"></i>
              <div>
                <strong>Perhatian!</strong> Perubahan No. SEP berdampak langsung pada klaim BPJS.
                Pastikan Anda memiliki wewenang sebelum mengubah data ini.
              </div>
            </div>
            <div class="grid-2" style="margin-top: 0.75rem">
              <div class="form-group">
                <label class="ep-label">
                  No. SEP
                  <span style="font-size: 0.7rem; color: #b45309; font-weight: 600"
                    >(Surat Eligibilitas Peserta)</span
                  >
                </label>
                <InputText
                  v-model="formData.NOSEP"
                  class="w-100 sep-input"
                  placeholder="Masukkan No. SEP..."
                />
              </div>
              <div class="form-group">
                <label class="ep-label">No. Kartu BPJS</label>
                <InputText v-model="formData.NOJAMINAN" readonly class="ep-readonly" />
              </div>
            </div>

            <!-- Tombol simpan SEP tersendiri -->
            <div class="sep-action-bar">
              <span class="sep-action-hint">
                <i class="pi pi-info-circle"></i>
                Perubahan ini hanya memperbarui No. SEP, tidak mengubah data pendaftaran lainnya.
              </span>
              <Button
                label="Simpan No. SEP"
                icon="pi pi-save"
                class="round-button2"
                :loading="loadingSep"
                :disabled="!formData.NOSEP?.trim()"
                @click="updateNomorSEP"
                style="background: #b45309; border-color: #b45309"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="ep-action-bar">
      <div class="ep-action-left">
        <Button
          label="Histori BPJS"
          icon="pi pi-clock"
          severity="warn"
          outlined
          class="round-button2"
          @click="riwayatBpjsRef.open()"
        />
        <Button
          severity="info"
          class="round-button2"
          :loading="loading"
          @click="showMergerForm = true"
        >
          <i class="fa-solid fa-arrows-turn-to-dots me-1"></i>Merge Transaksi
        </Button>
        <Button
          label="Rubah ke BPJS"
          icon="pi pi-sync"
          severity="warn"
          class="round-button2"
          :loading="loading"
          @click="conversiKEBPJS"
        />
      </div>
      <Button
        label="Simpan Perubahan"
        icon="pi pi-save"
        severity="success"
        class="round-button2"
        :loading="loading"
        @click="saveData"
      />
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
        <Button
          label="Riwayat SPRI BPJS (Server BPJS)"
          icon="pi pi-history"
          severity="info"
          @click="spriDialogRef.open()"
        />
      </div>
    </Dialog>

    <SPRIDialog ref="spriDialogRef" :noKartu="originalFormData.NOJAMINAN" />

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
    <!-- ══ DIALOG REVIEW SEP ══ -->
    <Dialog
      v-model:visible="showSepConfirmDialog"
      header="Review Data SEP — Konfirmasi Penyimpanan"
      :style="{ width: '640px', maxWidth: '95vw' }"
      modal
      :closable="!loadingSep"
    >
      <div v-if="sepCheckResult" class="sep-review">
        <!-- Status peserta -->
        <div
          class="sep-review-status"
          :class="
            sepCheckResult.peserta?.keterangan?.kode === '0' ? 'status-aktif' : 'status-nonaktif'
          "
        >
          <i
            class="pi"
            :class="
              sepCheckResult.peserta?.keterangan?.kode === '0'
                ? 'pi-check-circle'
                : 'pi-times-circle'
            "
          ></i>
          <span>
            Peserta
            <strong>{{ sepCheckResult.peserta?.keterangan?.keterangan ?? '-' }}</strong>
          </span>
        </div>

        <!-- Grid info -->
        <div class="sep-review-grid">
          <!-- Kolom kiri: Info SEP -->
          <div class="sep-review-col">
            <div class="sep-review-col-head"><i class="pi pi-file mr-1"></i>Informasi SEP</div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">No. SEP</span>
              <span class="sep-rv-val mono">{{ sepCheckResult.noSep ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Tanggal SEP</span>
              <span class="sep-rv-val">{{ sepCheckResult.tglSep ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Jenis Pelayanan</span>
              <span class="sep-rv-val">{{ sepCheckResult.jnsPelayanan ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Kelas Rawat</span>
              <span class="sep-rv-val">{{ sepCheckResult.kelasRawat ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Poli</span>
              <span class="sep-rv-val">{{ sepCheckResult.poli ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Diagnosa</span>
              <span class="sep-rv-val">{{ sepCheckResult.diagnosa ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Status Kecelakaan</span>
              <span class="sep-rv-val">{{ sepCheckResult.nmstatusKecelakaan ?? '-' }}</span>
            </div>
          </div>

          <!-- Kolom kanan: Info Peserta -->
          <div class="sep-review-col">
            <div class="sep-review-col-head"><i class="pi pi-user mr-1"></i>Data Peserta</div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Nama</span>
              <span class="sep-rv-val">{{ sepCheckResult.peserta?.nama ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">No. Kartu</span>
              <span class="sep-rv-val mono">{{ sepCheckResult.peserta?.noKartu ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">No. MR</span>
              <span class="sep-rv-val mono">{{ sepCheckResult.peserta?.noMr ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Tgl. Lahir</span>
              <span class="sep-rv-val">{{ sepCheckResult.peserta?.tglLahir ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Jenis Peserta</span>
              <span class="sep-rv-val">{{ sepCheckResult.peserta?.jnsPeserta ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">Hak Kelas</span>
              <span class="sep-rv-val">{{ sepCheckResult.peserta?.hakKelas ?? '-' }}</span>
            </div>
            <div class="sep-review-row">
              <span class="sep-rv-lbl">DPJP</span>
              <span class="sep-rv-val">{{ sepCheckResult.dpjp?.nmDPJP ?? '-' }}</span>
            </div>
          </div>
        </div>

        <!-- No. SEP yang akan disimpan -->
        <div class="sep-review-target">
          <i class="pi pi-arrow-right-arrow-left"></i>
          No. SEP akan diperbarui ke:
          <code>{{ formData.NOSEP }}</code>
        </div>
      </div>

      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showSepConfirmDialog = false"
          :disabled="loadingSep"
        />
        <Button
          label="Konfirmasi & Simpan SEP"
          icon="pi pi-save"
          :loading="loadingSep"
          @click="doSaveNomorSEP"
          style="background: #b45309; border-color: #b45309"
        />
      </template>
    </Dialog>

    <!-- ══ DIALOG KONFIRMASI NORM ══ -->
    <Dialog
      v-model:visible="showNormConfirmDialog"
      header="Konfirmasi Perubahan No. Rekam Medis"
      :style="{ width: '560px', maxWidth: '95vw' }"
      modal
      :closable="!loadingNorm"
    >
      <div class="norm-confirm">
        <!-- Warning -->
        <div class="norm-confirm-warn">
          <i class="pi pi-exclamation-triangle" style="flex-shrink: 0; font-size: 1.1rem"></i>
          <span
            >Anda akan mengubah No. Rekam Medis pada transaksi ini. Tindakan ini tidak dapat
            dibatalkan secara otomatis.</span
          >
        </div>

        <!-- Perbandingan NORM -->
        <div class="norm-confirm-compare">
          <div class="norm-compare-item norm-compare-old">
            <div class="norm-compare-label">No. RM Saat Ini</div>
            <div class="norm-compare-value">{{ formData.NOMR }}</div>
          </div>
          <div class="norm-compare-arrow"><i class="pi pi-arrow-right"></i></div>
          <div class="norm-compare-item norm-compare-new">
            <div class="norm-compare-label">No. RM Baru</div>
            <div class="norm-compare-value">{{ editNormValue }}</div>
          </div>
        </div>

        <!-- Data Pasien Pemilik NORM Baru -->
        <div v-if="normPatientData" class="norm-patient-card">
          <div class="norm-patient-card-head">
            <i class="pi pi-user-check me-1"></i>
            <span
              >Data Pasien — No. RM <code>{{ normPatientData.NOMR }}</code></span
            >
          </div>
          <div class="norm-patient-card-body">
            <div class="norm-pd-row">
              <span class="norm-pd-lbl">Nama</span>
              <span class="norm-pd-val fw-bold">{{ normPatientData.NAMAPASIEN }}</span>
            </div>
            <div class="norm-pd-row">
              <span class="norm-pd-lbl">NIK</span>
              <span class="norm-pd-val mono">{{
                normPatientData.NOKTP ?? normPatientData.NOKTP
              }}</span>
            </div>
            <div class="norm-pd-row">
              <span class="norm-pd-lbl">Tgl. Lahir</span>
              <span class="norm-pd-val"
                >{{ normPatientData.TGLLAHIR }} &nbsp;·&nbsp; {{ normPatientData.USIA }} tahun</span
              >
            </div>
            <div class="norm-pd-row">
              <span class="norm-pd-lbl">Jenis Kelamin</span>
              <span class="norm-pd-val">{{
                normPatientData.JENISKELAMIN === 'L' ? 'Laki-laki' : 'Perempuan'
              }}</span>
            </div>
            <div class="norm-pd-row">
              <span class="norm-pd-lbl">Alamat</span>
              <span class="norm-pd-val">{{ normPatientData.ALAMAT || '-' }}</span>
            </div>
            <div class="norm-pd-row">
              <span class="norm-pd-lbl">Kota / Kec.</span>
              <span class="norm-pd-val"
                >{{ normPatientData.namakecamatan }}, {{ normPatientData.namakota }}</span
              >
            </div>
            <div v-if="normPatientData.NO_KARTU" class="norm-pd-row">
              <span class="norm-pd-lbl">No. Kartu BPJS</span>
              <span class="norm-pd-val mono">{{ normPatientData.NO_KARTU }}</span>
            </div>
          </div>
        </div>

        <!-- Info registrasi aktif -->
        <div class="norm-patient-row">
          <i class="pi pi-file me-1" style="color: darkcyan"></i>
          <span>Transaksi:</span>
          <strong class="ms-1">{{ formData.NAMAPASIEN }}</strong>
          <span class="norm-patient-reg">{{ formData.NOPENDAFTARAN }}</span>
        </div>
      </div>

      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showNormConfirmDialog = false"
          :disabled="loadingNorm"
        />
        <Button
          label="Konfirmasi & Simpan"
          icon="pi pi-save"
          :loading="loadingNorm"
          @click="doSaveNomrRM"
          style="background: darkcyan; border-color: darkcyan"
        />
      </template>
    </Dialog>

    <Toast />
  </div>
  <RiwayatBPJSDialog ref="riwayatBpjsRef" :noKartu="formData.NOJAMINAN" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
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

import RiwayatBPJSDialog from '@/views/Pendaftaran/RiwayatBPJSComponent.vue'
const riwayatBpjsRef = ref(null)

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
const showSepEdit = ref(false)

import SPRIDialog from '@/views/Pendaftaran/SpriDataBPJSComponent.vue'

const spriDialogRef = ref(null)

const formData = ref({
  NOPENDAFTARAN: '',
  NOMR: '',
  NAMAPASIEN: '',
  NOKTP: '',
  NOJAMINAN: '',
  NOSEP: '',
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
    formData.value.IDDOKTER = dokterSelected.value
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
// ── Update No. Rekam Medis (fungsi tersendiri) ────────────
const showNormEdit = ref(false)
const loadingNorm = ref(false)
const showNormConfirmDialog = ref(false)
const editNormValue = ref('')
const normPatientData = ref(null)

const updateNomrRM = async () => {
  if (!editNormValue.value?.trim()) {
    showError('No. Rekam Medis tidak boleh kosong')
    return
  }
  if (editNormValue.value.trim() === formData.value.NOMR) {
    showError('No. Rekam Medis baru sama dengan yang lama')
    return
  }
  loadingNorm.value = true
  normPatientData.value = null
  try {
    const result = await get_data_pasien(editNormValue.value.trim())
    if (!result) {
      showError('No. Rekam Medis tidak ditemukan dalam database. Pastikan nomor sudah benar.')
      return
    }
    normPatientData.value = result[0]
    showNormConfirmDialog.value = true
  } finally {
    loadingNorm.value = false
  }
}

const doSaveNomrRM = async () => {
  loadingNorm.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      noregister: formData.value.NOPENDAFTARAN,
      norm_lama: formData.value.NOMR,
      norm_baru: editNormValue.value.trim(),
      id_client: id_client.value,
      user_id: user_id.value,
    }
    const response = await axios.post(
      `${url}/index.php/api/bpjs_api/update_no_rekam_medis_transaksi`,
      payload,
    )
    const code = response.data?.code ?? response.data?.metadata?.code ?? response.data?.status
    const message =
      response.data?.message ??
      response.data?.metadata?.message ??
      'No. Rekam Medis berhasil diperbarui'
    if (code == 200 || code === 'success' || code === '200') {
      showSuccess(message)
      formData.value.NOMR = editNormValue.value.trim()
      editNormValue.value = ''
      showNormConfirmDialog.value = false
      showNormEdit.value = false
    } else {
      showError(message || 'Gagal memperbarui No. Rekam Medis')
    }
  } catch (error) {
    console.error('Error updating NOMR:', error)
    showError('Terjadi kesalahan saat memperbarui No. Rekam Medis')
  } finally {
    loadingNorm.value = false
  }
}

const get_data_pasien = async (nomr = null) => {
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      nomr: nomr ?? formData.value.NOMR,
      id_client: id_client.value,
      mode: 3,
    }
    const response = await axios.post(
      `${url}/index.php/api/data_referensi/GetDataPasien_v3`,
      payload,
    )
    if (response.data?.response?.length > 0) {
      return response.data.response
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching patient data:', error)
    return null
  }
}

// ── Update No. SEP (fungsi tersendiri) ────────────────────
const loadingSep = ref(false)
const showSepConfirmDialog = ref(false)
const sepCheckResult = ref(null)

// Langkah 1: validasi input → cek SEP ke BPJS → tampilkan dialog review
const updateNomorSEP = async () => {
  if (!formData.value.NOSEP?.trim()) {
    showError('No. SEP tidak boleh kosong')
    return
  }

  loadingSep.value = true
  sepCheckResult.value = null
  try {
    const url = configStore.apiBaseUrl

    const response = await axios.get(
      `${url}/index.php/api/Bpjs_api/getdata_SEP_v2/${formData.value.NOSEP}/${id_client.value}`,
    )

    const metaCode = response.data?.metaData?.code
    if ((metaCode === '200' || metaCode === 200) && response.data?.response) {
      sepCheckResult.value = response.data.response
      showSepConfirmDialog.value = true
    } else {
      showError(
        response.data?.metaData?.message || 'SEP tidak ditemukan atau tidak valid di server BPJS',
      )
    }
  } catch (err) {
    console.error('checkSEPAktif:', err)
    showError('Gagal memeriksa status SEP ke server BPJS')
  } finally {
    loadingSep.value = false
  }
}

// Langkah 2: user konfirmasi di dialog → simpan ke database
const doSaveNomorSEP = async () => {
  loadingSep.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      noregister: formData.value.NOPENDAFTARAN,
      nosep: formData.value.NOSEP,
      nojaminan: formData.value.NOJAMINAN,
      norm: formData.value.NOMR,
      id_client: id_client.value,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/index.php/api/penunjang/update_nomor_sep`, payload)

    console.log('Response update SEP:', response.data)

    const code = response.data?.code ?? response.data?.metadata?.code ?? response.data?.status
    const message =
      response.data?.message ?? response.data?.metadata?.message ?? 'No. SEP berhasil diperbarui'

    if (code == 200 || code === 'success' || code === '200') {
      showSuccess(message)
      originalFormData.value.NOSEP = formData.value.NOSEP
      showSepConfirmDialog.value = false
      showSepEdit.value = false
    } else {
      showError(message || 'Gagal memperbarui No. SEP')
    }
  } catch (error) {
    console.error('Error updating NOSEP:', error)
    showError('Terjadi kesalahan saat memperbarui No. SEP')
  } finally {
    loadingSep.value = false
  }
}

const check_SEP_PESErTA = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/Bpjs_api/getdata_SEP_v2/${formData.value.NOSEP}/${id_client.value}`,
    )
  } catch (error) {
    console.error('Error fetching data:', error)
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
    NOJAMINAN: data.NOJAMINAN || '',
    NOSEP: data.NOSEP || '',
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
/* ── Page Header ── */
.ep-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, darkcyan 0%, #00838f 100%);
  color: white;
  border-radius: 4px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.ep-header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.ep-header-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.ep-header-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.ep-header-sub {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 2px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.ep-header-sep {
  opacity: 0.5;
}
/* ── Action Bar (bawah form) ── */
.ep-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-top: 3px solid darkcyan;
  border-radius: 8px;
  padding: 0.85rem 1.25rem;
  margin-top: 0.75rem;
}
.ep-action-left {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

/* ── Form wrapper ── */
.container {
  margin: 0 auto;
  padding: 1rem 1.25rem;
}

.form-wrapper {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  border-top: 3px solid darkcyan;
  overflow: hidden;
}

/* ── Section ── */
.ep-section {
  padding: 1.1rem 1.25rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}
.ep-section:last-child {
  border-bottom: none;
}

.ep-section-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: darkcyan;
  margin-bottom: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #e0f7f7;
}
.ep-section-badge {
  margin-left: auto;
  font-size: 0.6rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 4px;
  padding: 1px 7px;
  letter-spacing: 0.05em;
}

/* ── Labels ── */
.ep-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

/* ── Readonly fields ── */
:deep(.ep-readonly) {
  background: #f8fafc !important;
  color: #6b7280;
  cursor: default;
}

/* Legacy – kept for backward compat */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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

/* ── NORM Edit (tersembunyi) ── */
.norm-adv-wrap {
  border-top: 1px dashed #b2dfdb;
  padding: 0.6rem 1.25rem 0.75rem;
  background: #e0f2f1;
}
.norm-adv-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: #006064;
  text-align: left;
}
.norm-adv-toggle:hover {
  color: darkcyan;
}
.norm-adv-hint {
  font-weight: 400;
  color: darkcyan;
  opacity: 0.7;
  font-size: 0.72rem;
}
.norm-edit-panel {
  margin-top: 0.65rem;
  background: #fff;
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}
.norm-warn-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #e0f7fa;
  border: 1px solid #b2dfdb;
  border-left: 4px solid #00838f;
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  font-size: 0.8rem;
  color: #004d40;
}
:deep(.norm-input) {
  border-color: #b2dfdb !important;
}
:deep(.norm-input:focus) {
  border-color: #00838f !important;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15) !important;
}
.norm-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #b2dfdb;
}
.norm-action-hint {
  font-size: 0.72rem;
  color: #006064;
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}
/* Transition animasi NORM */
.norm-slide-enter-active,
.norm-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.norm-slide-enter-from,
.norm-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}
.norm-slide-enter-to,
.norm-slide-leave-from {
  opacity: 1;
  max-height: 320px;
}

/* ── Dialog Konfirmasi NORM ── */
.norm-confirm {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 0.83rem;
}
.norm-confirm-warn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #e0f7fa;
  border: 1px solid #b2dfdb;
  border-left: 4px solid #00838f;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
  color: #004d40;
}
.norm-confirm-compare {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
.norm-compare-item {
  flex: 1;
  min-width: 130px;
  border-radius: 8px;
  padding: 10px 14px;
  text-align: center;
}
.norm-compare-old {
  background: #fef2f2;
  border: 1px solid #fca5a5;
}
.norm-compare-new {
  background: #f0fdf4;
  border: 1px solid #86efac;
}
.norm-compare-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-bottom: 4px;
}
.norm-compare-old .norm-compare-value {
  font-family: monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: #dc2626;
}
.norm-compare-new .norm-compare-value {
  font-family: monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: #16a34a;
}
.norm-compare-arrow {
  color: darkcyan;
  font-size: 1rem;
  flex-shrink: 0;
}
.norm-patient-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e0f7fa;
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.82rem;
}
.norm-patient-reg {
  margin-left: auto;
  font-family: monospace;
  font-size: 0.78rem;
  color: darkcyan;
}

/* Card data pasien di dialog NORM */
.norm-patient-card {
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  overflow: hidden;
}
.norm-patient-card-head {
  background: linear-gradient(135deg, darkcyan, #00838f);
  color: #fff;
  padding: 8px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}
.norm-patient-card-head code {
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #fff;
}
.norm-patient-card-body {
  padding: 4px 0;
  background: #e0f2f1;
}
.norm-pd-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 5px 14px;
  border-bottom: 1px solid #e0f7fa;
  font-size: 0.8rem;
}
.norm-pd-row:last-child {
  border-bottom: none;
}
.norm-pd-lbl {
  flex: 0 0 120px;
  color: #00838f;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.norm-pd-val {
  color: #1e293b;
  flex: 1;
}
.norm-pd-val.mono {
  font-family: monospace;
  font-size: 0.78rem;
}

/* ── SEP Edit (tersembunyi) ── */
.sep-adv-wrap {
  border-top: 1px dashed #fde68a;
  padding: 0.6rem 1.25rem 0.75rem;
  background: #fffbeb;
}
.sep-adv-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  background: none;
  border: none;
  padding: 4px 0;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: #92400e;
  text-align: left;
}
.sep-adv-toggle:hover {
  color: #b45309;
}
.sep-adv-hint {
  font-weight: 400;
  color: #b45309;
  opacity: 0.7;
  font-size: 0.72rem;
}
.sep-edit-panel {
  margin-top: 0.65rem;
  background: #fff;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}
.sep-warn-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  font-size: 0.8rem;
  color: #78350f;
}
:deep(.sep-input) {
  border-color: #fcd34d !important;
}
:deep(.sep-input:focus) {
  border-color: #f59e0b !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
}

/* Action bar di dalam panel SEP */
.sep-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #fcd34d;
}
.sep-action-hint {
  font-size: 0.72rem;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

/* Transition animasi */
.sep-slide-enter-active,
.sep-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.sep-slide-enter-from,
.sep-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}
.sep-slide-enter-to,
.sep-slide-leave-from {
  opacity: 1;
  max-height: 300px;
}

/* ── Dialog Review SEP ── */
.sep-review {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 0.82rem;
}
.sep-review-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
}
.status-aktif {
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
}
.status-nonaktif {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}
.sep-review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 540px) {
  .sep-review-grid {
    grid-template-columns: 1fr;
  }
}
.sep-review-col {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.sep-review-col-head {
  background: #e2e8f0;
  padding: 6px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #475569;
}
.sep-review-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  padding: 5px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.sep-review-row:last-child {
  border-bottom: none;
}
.sep-rv-lbl {
  color: #94a3b8;
  font-size: 0.72rem;
  white-space: nowrap;
  flex-shrink: 0;
}
.sep-rv-val {
  color: #1e293b;
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}
.sep-rv-val.mono {
  font-family: monospace;
  font-size: 0.8rem;
}
.sep-review-target {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 0.82rem;
}
.sep-review-target code {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 700;
  background: #dbeafe;
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
