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
          <div class="reg-label-row">
            <label class="reg-label">Tanggal & Jam Masuk RS <span class="req">*</span></label>
            <label class="jam-realtime-toggle" title="Gunakan jam realtime">
              <input type="checkbox" v-model="jamRealtime" class="jam-realtime-check" />
              <span class="jam-realtime-label">
                <i class="pi" :class="jamRealtime ? 'pi-clock' : 'pi-lock'"></i>
                {{ jamRealtime ? 'Realtime' : 'Manual' }}
              </span>
            </label>
          </div>
          <DatePicker
            v-model="TanggalRawat"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal"
            showIcon
            showTime
            hourFormat="24"
            iconDisplay="input"
            class="w-100"
            style="margin-top: -4px"
            :class="{ 'p-invalid': formErrors.TanggalRawat }"
            :disabled="jamRealtime"
            @update:modelValue="formErrors.TanggalRawat = ''"
          />
          <small v-if="formErrors.TanggalRawat" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.TanggalRawat }}
          </small>
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
            @update:modelValue="formErrors.TanggalSEP = ''"
          />
          <small v-if="formErrors.TanggalSEP" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.TanggalSEP }}
          </small>
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
            @change="formErrors.jenisrawatSelected = ''"
          />
          <small v-if="formErrors.jenisrawatSelected" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.jenisrawatSelected }}
          </small>
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
            :class="{ 'p-invalid': formErrors.carabayarSelected }"
            @change="formErrors.carabayarSelected = ''"
          />
          <small v-if="formErrors.carabayarSelected" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.carabayarSelected }}
          </small>
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
            @change="formErrors.dokterSelected = ''"
          />
          <small v-if="formErrors.dokterSelected" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.dokterSelected }}
          </small>
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
        <div
          class="reg-field"
          v-if="jenisrawatSelected?.code == 2 && !isPoliIGD && route.query.mode !== 'IGDRANAP'"
        >
          <label class="reg-label">Asal Rujukan</label>
          <Select
            v-model="asalRujukanSelected"
            :options="asalRujukanOptions"
            optionLabel="caption"
            placeholder="Pilih Asal Rujukan"
            class="w-100"
          />
        </div>
        <div
          class="reg-field"
          v-if="jenisrawatSelected?.code == 2 && !isPoliIGD && route.query.mode !== 'IGDRANAP'"
        >
          <label class="reg-label">
            No. Rujukan
            <span v-if="loadingRujukanFaskes" class="reg-label-loading">
              <i class="pi pi-spin pi-spinner"></i> Mengambil data...
            </span>
          </label>
          <InputText
            v-model="noRujukan"
            class="w-100"
            placeholder="Nomor rujukan — tekan Enter untuk cari..."
            :disabled="loadingRujukanFaskes"
            @keydown.enter.prevent="getRujukanDariFaskes"
          />
        </div>
        <div
          class="reg-field"
          v-if="jenisrawatSelected?.code == 2 && !isPoliIGD && route.query.mode !== 'IGDRANAP'"
        >
          <label class="reg-label">No. Kontrol Ulang</label>
          <InputText
            v-model="noKontrolUlang"
            class="w-100"
            placeholder="Nomor kontrol ulang (opsional)..."
            @keydown.enter="get_data_surat_kontrol"
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
          :loading="load_ruangan"
          placeholder="Pilih Poli Klinik"
          appendTo="body"
          class="w-100"
          :class="{ 'p-invalid': formErrors.poliSelected }"
          @change="formErrors.poliSelected = ''"
        />
        <small v-if="formErrors.poliSelected" class="reg-field-error">
          <i class="pi pi-exclamation-circle"></i> {{ formErrors.poliSelected }}
        </small>
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
            @change="formErrors.ruanganSelected = ''"
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
        <small v-if="formErrors.ruanganSelected" class="reg-field-error">
          <i class="pi pi-exclamation-circle"></i> {{ formErrors.ruanganSelected }}
        </small>
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
          <Textarea
            v-model="Catatan"
            class="w-100"
            rows="3"
            placeholder="Catatan tambahan..."
            @keydown.ctrl.enter.prevent="openConfirmDialog"
          />
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
            @update:modelValue="formErrors.tanggalKLL = ''"
          />
          <small v-if="formErrors.tanggalKLL" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.tanggalKLL }}
          </small>
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
          <small v-if="formErrors.provinsiKLL" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.provinsiKLL }}
          </small>
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
          <small v-if="formErrors.kabupatenKLL" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.kabupatenKLL }}
          </small>
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
            @change="formErrors.kecamatanKLL = ''"
          />
          <small v-if="formErrors.kecamatanKLL" class="reg-field-error">
            <i class="pi pi-exclamation-circle"></i> {{ formErrors.kecamatanKLL }}
          </small>
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

    <!-- ── DRAFT RESTORED NOTICE ── -->
    <Transition name="draft-banner">
      <div v-if="draftRestoredNotice" class="draft-restored-notice">
        <div class="draft-notice-icon"><i class="pi pi-history"></i></div>
        <div class="draft-notice-body">
          <strong>Draft dipulihkan</strong>
          <span>Data inputan sebelumnya berhasil dimuat dari penyimpanan lokal.</span>
        </div>
        <button class="draft-notice-dismiss" @click="draftRestoredNotice = false" title="Tutup">
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
          @click="goToTindakLanjut"
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
        <Transition name="draft-indicator">
          <div v-if="hasDraft" class="draft-saved-indicator">
            <i class="pi pi-cloud-upload"></i>
            <span>Draft tersimpan</span>
            <button class="draft-clear-btn" @click="resetForm" title="Hapus draft & reset form">
              <i class="pi pi-trash"></i> Hapus
            </button>
          </div>
        </Transition>
        <span class="reg-kbd-hint"> <kbd>Ctrl</kbd><span>+</span><kbd>↵</kbd> untuk submit </span>
        <Button
          label="Simpan Pendaftaran"
          icon="pi pi-save"
          severity="success"
          :loading="loading"
          @click="openConfirmDialog"
        />
      </div>
    </div>
  </div>

  <!-- ── DIALOG KONFIRMASI PENDAFTARAN ── -->
  <Dialog
    v-model:visible="showConfirmDialog"
    header="Konfirmasi Pendaftaran Pasien"
    :style="{ width: '540px', maxWidth: '95vw' }"
    modal
    :closable="!loading"
  >
    <div class="confirm-body">
      <!-- Patient identity card -->
      <div class="confirm-patient-card" v-if="props.os?.nama">
        <div class="confirm-patient-avatar">{{ props.os.nama?.charAt(0)?.toUpperCase() }}</div>
        <div class="confirm-patient-info">
          <div class="confirm-patient-name">{{ props.os.nama }}</div>
          <div class="confirm-patient-meta">
            <span v-if="props.os.noKartu"
              ><i class="pi pi-id-card"></i> {{ props.os.noKartu }}</span
            >
            <span v-if="props.os.nik"
              ><i class="pi pi-credit-card"></i> NIK: {{ props.os.nik }}</span
            >
            <span v-if="props.os.tglLahir"
              ><i class="pi pi-calendar"></i> {{ props.os.tglLahir
              }}<template v-if="props.os.umur?.umurSekarang">
                · {{ props.os.umur.umurSekarang }}</template
              ></span
            >
          </div>
          <div class="confirm-patient-badges">
            <span class="confirm-patient-badge confirm-badge-mr">
              <i class="pi pi-folder-open"></i> RM: {{ norm || '-' }}
            </span>
            <span v-if="props.os.sex" class="confirm-patient-badge">
              <i :class="props.os.sex === 'L' ? 'pi pi-mars' : 'pi pi-venus'"></i>
              {{ props.os.sex === 'L' ? 'Laki-laki' : 'Perempuan' }}
            </span>
            <span
              class="confirm-patient-badge"
              :class="
                props.os.statusPeserta?.keterangan === 'AKTIF'
                  ? 'confirm-badge-aktif'
                  : 'confirm-badge-nonaktif'
              "
            >
              <i
                :class="
                  props.os.statusPeserta?.keterangan === 'AKTIF'
                    ? 'pi pi-check-circle'
                    : 'pi pi-times-circle'
                "
              ></i>
              {{ props.os.statusPeserta?.keterangan || '-' }}
            </span>
            <span v-if="props.os.hakKelas?.keterangan" class="confirm-patient-badge">
              <i class="pi pi-star"></i> {{ props.os.hakKelas.keterangan }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info reminder -->
      <div class="confirm-info-banner">
        <i class="pi pi-info-circle"></i>
        <span>Periksa kembali data berikut sebelum pendaftaran disimpan.</span>
      </div>

      <!-- Data pendaftaran -->
      <div class="confirm-grid">
        <!-- Waktu -->
        <div class="confirm-section-head"><i class="pi pi-clock"></i> Waktu</div>
        <div class="confirm-row">
          <span class="confirm-lbl">Tanggal Masuk</span>
          <span class="confirm-val">{{ formatDateTimeForAPI(TanggalRawat) }}</span>
        </div>
        <div class="confirm-row" v-if="carabayarSelected?.KODE == 5">
          <span class="confirm-lbl">Tanggal SEP</span>
          <span class="confirm-val">{{ formatDateOnlyForAPI(TanggalSEP) }}</span>
        </div>

        <!-- Pelayanan -->
        <div class="confirm-section-head"><i class="pi pi-sitemap"></i> Pelayanan</div>
        <div class="confirm-row">
          <span class="confirm-lbl">Jenis Rawat</span>
          <span class="confirm-val">{{ jenisrawatSelected?.caption }}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-lbl">Cara Bayar</span>
          <span class="confirm-val">{{ carabayarSelected?.NAMA }}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-lbl">DPJP</span>
          <span class="confirm-val">{{ dokterSelected?.NAMADOKTER }}</span>
        </div>
        <div class="confirm-row" v-if="jenisrawatSelected?.code == 1 && ruanganSelected">
          <span class="confirm-lbl">Ruang Rawat Inap</span>
          <span class="confirm-val">
            {{ ruanganSelected?.NAMA }}
            <small class="confirm-val-sub"
              >{{ ruanganSelected?.TERSEDIA }} TT tersedia dari
              {{ ruanganSelected?.JUMLAH_TT }}</small
            >
          </span>
        </div>
        <div class="confirm-row" v-if="jenisrawatSelected?.code == 2 && poliSelected">
          <span class="confirm-lbl">Poli Klinik</span>
          <span class="confirm-val">{{ poliSelected?.nama }}</span>
        </div>
        <div class="confirm-row" v-if="diagnoseSelected">
          <span class="confirm-lbl">Diagnosa</span>
          <span class="confirm-val">{{ diagnoseSelected?.dx }}</span>
        </div>
        <div class="confirm-row" v-if="selectedKelas">
          <span class="confirm-lbl">Naik Kelas</span>
          <span class="confirm-val">{{ selectedKelas?.caption }}</span>
        </div>
        <div class="confirm-row" v-if="NoSPRI">
          <span class="confirm-lbl">No. SPRI</span>
          <span class="confirm-val mono">{{ NoSPRI }}</span>
        </div>
        <div class="confirm-row" v-if="props.os?.provUmum?.nmProvider">
          <span class="confirm-lbl">Faskes Tk. I</span>
          <span class="confirm-val">{{ props.os.provUmum.nmProvider }}</span>
        </div>

        <!-- Tambahan -->
        <template
          v-if="Catatan || lakaLantasSelected?.code > 0 || hanyaSimpanKeBPJS || pasienkatarak"
        >
          <div class="confirm-section-head"><i class="pi pi-list"></i> Informasi Tambahan</div>
          <div class="confirm-row" v-if="Catatan">
            <span class="confirm-lbl">Catatan</span>
            <span class="confirm-val">{{ Catatan }}</span>
          </div>
          <div class="confirm-row" v-if="pasienkatarak">
            <span class="confirm-lbl">Pasien Katarak</span>
            <span class="confirm-val">Ya</span>
          </div>
          <div class="confirm-row" v-if="lakaLantasSelected?.code > 0">
            <span class="confirm-lbl">Status KLL</span>
            <span class="confirm-val">{{ lakaLantasSelected?.caption }}</span>
          </div>
          <div class="confirm-row" v-if="lakaLantasSelected?.code > 0 && provinsiKLL">
            <span class="confirm-lbl">Lokasi KLL</span>
            <span class="confirm-val"
              >{{ kecamatanKLL?.nama || '-' }}, {{ kabupatenKLL?.nama || '-' }},
              {{ provinsiKLL?.nama }}</span
            >
          </div>
          <div class="confirm-row confirm-row-warn" v-if="hanyaSimpanKeBPJS">
            <span class="confirm-lbl">Mode</span>
            <span class="confirm-val">Hanya simpan ke BPJS (tidak ke SIMRS)</span>
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <Button
        label="Batal, Periksa Kembali"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        @click="showConfirmDialog = false"
        :disabled="loading"
      />
      <Button
        label="Konfirmasi & Daftar"
        icon="pi pi-save"
        severity="success"
        :loading="loading"
        @click="submitForm"
      />
    </template>
  </Dialog>

  <RecentPendaftaranView ref="childRef" />

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
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
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

const emit = defineEmits(['fungsiInduk', 'restorePatient', 'clearPatient'])

const ShowFormPendaftaran = async () => {
  emit('fungsiInduk')
}

const nomor_sep = ref(null)
const noRujukan = ref(null)
const tglRujukan = ref(null)
const ppkRujukan = ref(null)
const noKontrolUlang = ref(null)
const asalRujukanSelected = ref(null)

const asalRujukanOptions = ref([
  { caption: 'Faskes I', code: 1 },
  { caption: 'Faskes II', code: 2 },
])
// Reactive data
const TanggalRawat = ref(new Date())

const jamRealtime = ref(true)
let clockInterval = null

const startClock = () => {
  TanggalRawat.value = new Date()
  clockInterval = setInterval(() => {
    TanggalRawat.value = new Date()
  }, 1000)
}

const stopClock = () => {
  if (clockInterval) {
    clearInterval(clockInterval)
    clockInterval = null
  }
}

watch(
  jamRealtime,
  (val) => {
    if (val) {
      startClock()
    } else {
      stopClock()
    }
  },
  { immediate: true },
)

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

const isPoliIGD = computed(() => poliSelected.value?.nama?.toUpperCase().includes('IGD') ?? false)

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

const get_data_surat_kontrol = async () => {
  if (!noKontrolUlang.value) {
    showError('Nomor kontrol belum diisi')
    return
  }

  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/get_data_surat_kontrol`, {
      nomorreferensi: noKontrolUlang.value,
      id_client: String(id_client.value),
    })

    if (response.data?.metaData?.code !== '200') {
      showError(response.data?.metaData?.message || 'Data surat kontrol tidak ditemukan')
      return
    }

    const dataSuratKontrol = response.data.response

    // Auto-select dokter berdasarkan kodeDokter dari surat kontrol
    if (dataSuratKontrol?.kodeDokter) {
      const foundDokter = list_dokter.value.find(
        (d) => d.KODE_DOKTER_BPJS === dataSuratKontrol.kodeDokter,
      )
      if (foundDokter) {
        dokterSelected.value = foundDokter
        formErrors.value.dokterSelected = ''
      } else {
        showInfo(
          `Dokter dengan kode ${dataSuratKontrol.kodeDokter} (${dataSuratKontrol.namaDokter}) tidak ditemukan dalam daftar DPJP`,
        )
      }
    }

    // Auto-select poli berdasarkan poliTujuan dari surat kontrol
    if (dataSuratKontrol?.poliTujuan) {
      const foundPoli = listPolyKlinik.value.find(
        (p) => p.KodePoliBPJS === dataSuratKontrol.poliTujuan,
      )
      if (foundPoli) {
        poliSelected.value = foundPoli
        formErrors.value.poliSelected = ''
      }
    }

    // Auto-fill asal rujukan dan nomor rujukan dari sep.provPerujuk
    const provPerujuk = dataSuratKontrol?.sep?.provPerujuk
    if (provPerujuk?.asalRujukan) {
      const foundAsal = asalRujukanOptions.value.find(
        (a) => String(a.code) === String(provPerujuk.asalRujukan),
      )
      if (foundAsal) asalRujukanSelected.value = foundAsal
    }
    if (provPerujuk?.noRujukan) {
      noRujukan.value = provPerujuk.noRujukan
    }

    // Auto-fill diagnosa dari sep.diagnosa surat kontrol ("H11.0 - Pterygium")
    const rawDiagnosa = dataSuratKontrol?.sep?.diagnosa
    if (rawDiagnosa) {
      const separatorIdx = rawDiagnosa.indexOf(' - ')
      const icd_code =
        separatorIdx !== -1 ? rawDiagnosa.substring(0, separatorIdx).trim() : rawDiagnosa.trim()
      const jenis_penyakit =
        separatorIdx !== -1 ? rawDiagnosa.substring(separatorIdx + 3).trim() : ''
      const diagnosaItem = {
        dx: rawDiagnosa,
        icd_code,
        jenis_penyakit,
      }
      listDiagnose.value = [diagnosaItem]
      diagnoseSelected.value = diagnosaItem
    }
  } catch (error) {
    console.error('Error fetching surat kontrol:', error)
    showError('Gagal mengambil data surat kontrol')
  } finally {
    loading.value = false
  }
}

const loadingRujukanFaskes = ref(false)

const namaPPKPerujuk = ref(null)

const dataRujukanPasien = ref(null)

const getRujukanDariFaskes = async () => {
  if (!noRujukan.value) return
  if (!asalRujukanSelected.value) {
    showError('Pilih Asal Rujukan terlebih dahulu')
    return
  }
  if (!props.os?.noKartu) {
    showError('Data peserta belum ditemukan, cari pasien terlebih dahulu')
    return
  }

  loadingRujukanFaskes.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/get_rujukan_dari_faskes`, {
      no_kartu: props.os.noKartu,
      id_client: String(id_client.value),
      asal_faskes: String(asalRujukanSelected.value.code),
      norujukan: noRujukan.value,
    })

    if (response.data?.metaData?.code !== '200') {
      showError(response.data?.metaData?.message || 'Rujukan tidak ditemukan')
      return
    }
    dataRujukanPasien.value = response.data?.response?.rujukan
    const rj = response.data?.response?.rujukan

    if (!rj) {
      showError('Data rujukan tidak ditemukan')
      return
    }

    // Auto-fill diagnosa
    if (rj.diagnosa?.kode) {
      const diagnosaItem = {
        dx: rj.diagnosa.nama ? `${rj.diagnosa.kode} - ${rj.diagnosa.nama}` : rj.diagnosa.kode,
        icd_code: rj.diagnosa.kode,
        jenis_penyakit: rj.diagnosa.nama,
      }
      listDiagnose.value = [diagnosaItem]
      diagnoseSelected.value = diagnosaItem
    }

    // Auto-fill poli — cari di listPolyKlinik berdasarkan KodePoliBPJS
    if (rj.poliRujukan?.kode) {
      const foundPoli = listPolyKlinik.value.find((p) => p.KodePoliBPJS === rj.poliRujukan.kode)
      if (foundPoli) {
        poliSelected.value = foundPoli
      } else {
        showInfo(
          `Poli "${rj.poliRujukan.nama}" (${rj.poliRujukan.kode}) tidak ditemukan di daftar poli RS`,
        )
      }
    }

    tglRujukan.value = rj.tglKunjungan || null
    ppkRujukan.value = rj.provPerujuk?.kode || null
    namaPPKPerujuk.value = rj.provPerujuk?.nama || null

    showSuccess(`Data rujukan dari ${rj.provPerujuk?.nama || 'faskes'} berhasil dimuat`)
  } catch (error) {
    console.error('Error getRujukanDariFaskes:', error)
    showError('Gagal mengambil data rujukan')
  } finally {
    loadingRujukanFaskes.value = false
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
        provPerujuk: {
          kode: ppkRujukan.value,
          tglRujukan: tglRujukan.value,
          noRujukan: noRujukan.value,
          nama: namaPPKPerujuk.value,
        },
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
        rujukan: noRujukan.value
          ? {
              asalRujukan: asalRujukanSelected.value?.code
                ? String(asalRujukanSelected.value.code)
                : null,
              tglRujukan: tglRujukan.value,
              noRujukan: noRujukan.value,
              ppkRujukan: ppkRujukan.value,
            }
          : null,
      },
      id_client: id_client.value,
      user_id: user_id.value,
    }

    const response = await axios.post(`${url}/index.php/api/Bpjs_api/createSEP`, payload)

    console.log('Response from createSEP:', response.data)

    if (response.data.metadata.code == '200') {
      showConfirmDialog.value = false
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
  TanggalRawat: '',
  TanggalSEP: '',
  jenisrawatSelected: '',
  carabayarSelected: '',
  dokterSelected: '',
  diagnoseSelected: '',
  ruanganSelected: '',
  poliSelected: '',
  selectedKelas: '',
  tanggalKLL: '',
  provinsiKLL: '',
  kabupatenKLL: '',
  kecamatanKLL: '',
})
// ===== VALIDATION =====
const validateForm = () => {
  Object.keys(formErrors.value).forEach((key) => {
    formErrors.value[key] = ''
  })

  let isValid = true

  if (!norm.value) isValid = false

  if (!TanggalRawat.value) {
    formErrors.value.TanggalRawat = 'Tanggal & jam masuk RS wajib diisi'
    isValid = false
  }

  if (!jenisrawatSelected.value) {
    formErrors.value.jenisrawatSelected = 'Jenis rawat wajib dipilih'
    isValid = false
  }

  if (!carabayarSelected.value) {
    formErrors.value.carabayarSelected = 'Cara bayar wajib dipilih'
    isValid = false
  }

  if (!dokterSelected.value) {
    formErrors.value.dokterSelected = 'DPJP wajib dipilih'
    isValid = false
  }

  if (carabayarSelected.value?.KODE === 5) {
    if (!TanggalSEP.value) {
      formErrors.value.TanggalSEP = 'Tanggal SEP wajib diisi untuk pasien BPJS'
      isValid = false
    }
  }

  if (jenisrawatSelected.value.code === 1) {
    if (!ruanganSelected.value) {
      formErrors.value.ruanganSelected = 'Ruang rawat inap wajib dipilih'
      isValid = false
    } else if (ruanganSelected.value.TERSEDIA <= 0) {
      formErrors.value.ruanganSelected = 'Ruangan ini sudah penuh, pilih ruangan lain'
      isValid = false
    }
  }

  if (jenisrawatSelected.value.code === 2) {
    if (!poliSelected.value) {
      formErrors.value.poliSelected = 'Poli klinik wajib dipilih'
      isValid = false
    }
  }

  if (lakaLantasSelected.value?.code > 0) {
    if (!tanggalKLL.value) {
      formErrors.value.tanggalKLL = 'Tanggal KLL wajib diisi'
      isValid = false
    }
    if (!provinsiKLL.value) {
      formErrors.value.provinsiKLL = 'Provinsi KLL wajib dipilih'
      isValid = false
    }
    if (!kabupatenKLL.value) {
      formErrors.value.kabupatenKLL = 'Kabupaten/Kota KLL wajib dipilih'
      isValid = false
    }
    if (!kecamatanKLL.value) {
      formErrors.value.kecamatanKLL = 'Kecamatan KLL wajib dipilih'
      isValid = false
    }
  }

  if (!isValid) {
    showError('Mohon lengkapi semua field yang diperlukan (ditandai dengan *)')
  }

  return isValid
}

// ===== CONFIRM DIALOG =====
const showConfirmDialog = ref(false)

const openConfirmDialog = () => {
  if (!validateForm()) return
  showConfirmDialog.value = true
}

const resetForm = () => {
  // ── Tanggal ──
  TanggalSEP.value = new Date()
  jamRealtime.value = true // watch(immediate) akan restart clock otomatis

  // ── Pelayanan ──
  // jenisrawatSelected.value = { code: 1, caption: 'INAP' }
  dokterSelected.value = null
  diagnoseSelected.value = null
  // carabayarSelected.value = null

  // ── Penempatan ──
  ruanganSelected.value = null
  poliSelected.value = null
  NoSPRI.value = null
  noRujukan.value = null
  tglRujukan.value = null
  ppkRujukan.value = null
  namaPPKPerujuk.value = null
  noKontrolUlang.value = null
  asalRujukanSelected.value = null

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

  isResetting.value = true
  clearDraft()
  emit('clearPatient')
  nextTick(() => {
    isResetting.value = false
  })
}

const loadingCetakSEP = ref(false)

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
// ===== DRAFT / LOCALSTORAGE =====
const DRAFT_KEY = 'pendaftaran_form_draft'
const hasDraft = ref(false)
const draftRestoredNotice = ref(false)
const isResetting = ref(false)

const saveDraft = () => {
  if (isResetting.value) return
  try {
    const draft = {
      TanggalRawat: TanggalRawat.value ? new Date(TanggalRawat.value).toISOString() : null,
      TanggalSEP: TanggalSEP.value ? new Date(TanggalSEP.value).toISOString() : null,
      jenisrawatSelected: jenisrawatSelected.value,
      carabayarSelected: carabayarSelected.value,
      dokterSelected: dokterSelected.value,
      diagnoseSelected: diagnoseSelected.value,
      ruanganSelected: ruanganSelected.value,
      poliSelected: poliSelected.value,
      selectedKelas: selectedKelas.value,
      lakaLantasSelected: lakaLantasSelected.value,
      tanggalKLL: tanggalKLL.value ? new Date(tanggalKLL.value).toISOString() : null,
      provinsiKLL: provinsiKLL.value,
      kabupatenKLL: kabupatenKLL.value,
      kecamatanKLL: kecamatanKLL.value,
      Catatan: Catatan.value,
      NoSPRI: NoSPRI.value,
      noRujukan: noRujukan.value,
      noKontrolUlang: noKontrolUlang.value,
      asalRujukanSelected: asalRujukanSelected.value,
      pasienkatarak: pasienkatarak.value,
      hanyaSimpanKeBPJS: hanyaSimpanKeBPJS.value,
      norm: norm.value,
      os: props.os ? JSON.parse(JSON.stringify(props.os)) : null,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    hasDraft.value = true
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const d = JSON.parse(raw)

    if (d.TanggalRawat) TanggalRawat.value = new Date(d.TanggalRawat)
    if (d.TanggalSEP) TanggalSEP.value = new Date(d.TanggalSEP)
    if (d.jenisrawatSelected) jenisrawatSelected.value = d.jenisrawatSelected
    if (d.carabayarSelected) carabayarSelected.value = d.carabayarSelected
    if (d.dokterSelected) dokterSelected.value = d.dokterSelected
    if (d.diagnoseSelected) {
      diagnoseSelected.value = d.diagnoseSelected
      listDiagnose.value = [d.diagnoseSelected]
    }
    if (d.ruanganSelected) ruanganSelected.value = d.ruanganSelected
    if (d.poliSelected) poliSelected.value = d.poliSelected
    if (d.selectedKelas) selectedKelas.value = d.selectedKelas
    if (d.lakaLantasSelected) lakaLantasSelected.value = d.lakaLantasSelected
    if (d.tanggalKLL) tanggalKLL.value = new Date(d.tanggalKLL)
    if (d.provinsiKLL) provinsiKLL.value = d.provinsiKLL
    if (d.kabupatenKLL) kabupatenKLL.value = d.kabupatenKLL
    if (d.kecamatanKLL) kecamatanKLL.value = d.kecamatanKLL
    if (d.Catatan !== undefined) Catatan.value = d.Catatan
    if (d.NoSPRI !== undefined) NoSPRI.value = d.NoSPRI
    if (d.noRujukan !== undefined) noRujukan.value = d.noRujukan
    if (d.noKontrolUlang !== undefined) noKontrolUlang.value = d.noKontrolUlang
    if (d.asalRujukanSelected !== undefined) asalRujukanSelected.value = d.asalRujukanSelected
    if (d.pasienkatarak !== undefined) pasienkatarak.value = d.pasienkatarak
    if (d.hanyaSimpanKeBPJS !== undefined) hanyaSimpanKeBPJS.value = d.hanyaSimpanKeBPJS
    if (d.norm) norm.value = d.norm
    if (d.os) nextTick(() => emit('restorePatient', d.os))

    hasDraft.value = true
    draftRestoredNotice.value = true
  } catch (error) {
    console.error('Error loading draft:', error)
  }
}

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY)
  // juga bersihkan key lama individual
  localStorage.removeItem('carabayarSelected')
  localStorage.removeItem('jenisrawatSelected')
  localStorage.removeItem('poliSelected')
  hasDraft.value = false
  draftRestoredNotice.value = false
}

watch(
  [
    TanggalRawat,
    TanggalSEP,
    jenisrawatSelected,
    carabayarSelected,
    dokterSelected,
    diagnoseSelected,
    ruanganSelected,
    poliSelected,
    selectedKelas,
    lakaLantasSelected,
    tanggalKLL,
    provinsiKLL,
    kabupatenKLL,
    kecamatanKLL,
    Catatan,
    NoSPRI,
    noRujukan,
    noKontrolUlang,
    asalRujukanSelected,
    pasienkatarak,
    hanyaSimpanKeBPJS,
    () => props.os,
    norm,
  ],
  saveDraft,
  { deep: true },
)

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
const handleGlobalKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    openConfirmDialog()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleGlobalKeydown)
  stopClock()
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
  document.addEventListener('keydown', handleGlobalKeydown)

  loadDraft()
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

.reg-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 18px;
}

.jam-realtime-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  flex-shrink: 0;
}
.jam-realtime-check {
  display: none;
}
.jam-realtime-label {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #6b7280;
  transition: all 0.15s;
  user-select: none;
}
.jam-realtime-check:checked + .jam-realtime-label {
  background: #dcfce7;
  border-color: #86efac;
  color: #15803d;
}

.reg-label-meta {
  font-size: 10px;
  color: #adb5bd;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 3px;
}

.reg-label-loading {
  font-size: 10px;
  color: #3b82f6;
  font-weight: 400;
  display: inline-flex;
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
  border-top: 2px solid #198754;
  border-radius: 0;
  gap: 10px;
  flex-wrap: wrap;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
}
.reg-action-left {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.reg-action-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.reg-kbd-hint {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #9ca3af;
  user-select: none;
}
.reg-kbd-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-bottom-width: 2px;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
  font-family: monospace;
  color: #6b7280;
  line-height: 1.4;
}
@media (max-width: 480px) {
  .reg-kbd-hint {
    display: none;
  }
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

/* ── Inline Field Error ── */
.reg-field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #dc3545;
  margin-top: 3px;
  line-height: 1.3;
}
.reg-field-error .pi {
  font-size: 10px;
  flex-shrink: 0;
}

/* ── Confirm Dialog ── */
.confirm-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.confirm-patient-card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
}
.confirm-patient-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}
.confirm-patient-info {
  flex: 1;
  min-width: 0;
}
.confirm-patient-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 3px;
}
.confirm-patient-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 6px;
}
.confirm-patient-meta i {
  margin-right: 2px;
}
.confirm-patient-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.confirm-patient-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}
.confirm-badge-mr {
  background: rgba(59, 130, 246, 0.25);
  color: #93c5fd;
}
.confirm-badge-aktif {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}
.confirm-badge-nonaktif {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.confirm-info-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 0.6rem 0.85rem;
  font-size: 0.82rem;
  color: #1e40af;
}
.confirm-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.confirm-section-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.35rem 0.85rem;
  background: #f3f4f6;
  font-size: 10px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #e5e7eb;
}
.confirm-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.45rem 0.85rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.82rem;
}
.confirm-row:last-child {
  border-bottom: none;
}
.confirm-row:nth-child(even) {
  background: #f9fafb;
}
.confirm-row-warn {
  background: #fff7ed !important;
  border-left: 3px solid #f59e0b;
}
.confirm-row-warn .confirm-val {
  color: #b45309;
}
.confirm-lbl {
  flex: 0 0 130px;
  color: #6b7280;
  font-weight: 500;
}
.confirm-val {
  flex: 1;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.confirm-val.mono {
  font-family: monospace;
  font-size: 0.85rem;
}
.confirm-val-sub {
  font-size: 10px;
  font-weight: 400;
  color: #6b7280;
}

/* ── Draft / localStorage UI ── */
.draft-restored-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: #eff6ff;
  border: 1.5px solid #93c5fd;
  border-left: 5px solid #3b82f6;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-size: 12px;
}
.draft-notice-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: #3b82f6;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}
.draft-notice-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  color: #1e40af;
}
.draft-notice-body strong {
  font-size: 12px;
}
.draft-notice-body span {
  font-size: 11px;
  opacity: 0.8;
}
.draft-notice-dismiss {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.draft-notice-dismiss:hover {
  background: #dbeafe;
}

.draft-saved-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 6px;
  padding: 4px 10px;
  white-space: nowrap;
}
.draft-clear-btn {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-left: 1px solid #a7f3d0;
  margin-left: 4px;
  padding-left: 8px;
}
.draft-clear-btn:hover {
  color: #b91c1c;
  text-decoration: underline;
}

.draft-banner-enter-active,
.draft-banner-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.draft-banner-enter-from,
.draft-banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.draft-indicator-enter-active,
.draft-indicator-leave-active {
  transition: opacity 0.25s ease;
}
.draft-indicator-enter-from,
.draft-indicator-leave-to {
  opacity: 0;
}
</style>
