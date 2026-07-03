<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />

  <!-- Header Banner -->
  <div class="checklist-banner mb-3">
    <div class="banner-icon">
      <i class="pi pi-shield" style="font-size: 2rem; color: var(--p-primary-contrast-color)"></i>
    </div>
    <div class="banner-content">
      <h4 class="banner-title">Checklist Keselamatan Pasien Operasi</h4>
      <p class="banner-desc">
        Instrumen standar WHO yang wajib diisi oleh tim medis (perawat, dokter anestesi, dokter
        operator) untuk mencegah kesalahan identitas, prosedur, dan lokasi operasi.
      </p>
    </div>
  </div>

  <!-- Progress Phases -->
  <div class="phase-steps mb-3">
    <div
      class="phase-step"
      :class="{ active: activePhase === 'signin' }"
      @click="activePhase = 'signin'"
    >
      <div class="step-badge signin-badge">1</div>
      <span class="step-label">SIGN IN</span>
      <small class="ml-1">Sebelum Induksi Anestesi</small>
    </div>
    <div class="phase-connector"></div>
    <div
      class="phase-step"
      :class="{ active: activePhase === 'timeout' }"
      @click="activePhase = 'timeout'"
    >
      <div class="step-badge timeout-badge">2</div>
      <span class="step-label">TIME OUT</span>
      <small class="ml-1">Sebelum Insisi Kulit</small>
    </div>
    <div class="phase-connector"></div>
    <div
      class="phase-step"
      :class="{ active: activePhase === 'signout' }"
      @click="activePhase = 'signout'"
    >
      <div class="step-badge signout-badge">3</div>
      <span class="step-label">SIGN OUT</span>
      <small class="ml-1">Sebelum Pasien Meninggalkan OK</small>
    </div>
  </div>

  <div class="row g-3">
    <!-- ===== SIGN IN ===== -->
    <div class="col-md-4">
      <div class="checklist-card signin-card">
        <div class="card-phase-header signin-header">
          <i class="pi pi-sign-in me-2"></i>
          <span>SIGN IN</span>
          <small class="ms-auto">Sebelum Induksi Anestesi</small>
        </div>

        <div class="card-phase-body">
          <!-- Tanggal -->
          <div class="field-group">
            <label class="field-label"><i class="pi pi-calendar me-1"></i>Tanggal &amp; Jam</label>
            <DatePicker
              v-model="form.signInDate"
              placeholder="Pilih tanggal dan waktu"
              dateFormat="dd MM yy"
              showTime
              hourFormat="24"
              showIcon
              class="w-100"
            />
          </div>

          <div class="section-divider">
            <span>Verifikasi Pasien</span>
          </div>

          <!-- Konfirmasi Identitas -->
          <div class="field-group">
            <label class="field-label">
              Sudahkah identitas, prosedur, lokasi operasi &amp; informed consent dikonfirmasi
              ulang?
            </label>
            <div class="radio-group">
              <RadioButton inputId="confirmYes" value="Sudah" v-model="form.confirmPatient" />
              <label for="confirmYes" class="radio-label">Sudah</label>
              <RadioButton inputId="confirmNo" value="Belum" v-model="form.confirmPatient" />
              <label for="confirmNo" class="radio-label">Belum</label>
            </div>
          </div>

          <!-- Lokasi Operasi -->
          <div class="field-group">
            <label class="field-label">Apakah lokasi operasi sudah ditandai?</label>
            <div class="radio-group">
              <RadioButton inputId="lokasiYes" value="Sudah" v-model="form.lokasiOperasi" />
              <label for="lokasiYes" class="radio-label">Sudah</label>
              <RadioButton inputId="lokasiNo" value="Belum" v-model="form.lokasiOperasi" />
              <label for="lokasiNo" class="radio-label">Belum</label>
              <RadioButton inputId="lokasiNA" value="Tidak Berlaku" v-model="form.lokasiOperasi" />
              <label for="lokasiNA" class="radio-label">Tidak Berlaku</label>
            </div>
          </div>

          <div class="section-divider">
            <span>Kesiapan Anestesi</span>
          </div>

          <!-- Mesin Anestesi -->
          <div class="field-group">
            <label class="field-label"
              >Mesin anestesi &amp; obat-obatan anestesi sudah lengkap?</label
            >
            <div class="radio-group">
              <RadioButton inputId="anastesiYes" value="Sudah" v-model="form.anastesi" />
              <label for="anastesiYes" class="radio-label">Sudah</label>
              <RadioButton inputId="anastesiNo" value="Belum" v-model="form.anastesi" />
              <label for="anastesiNo" class="radio-label">Belum</label>
            </div>
          </div>

          <!-- Pulse Oksimetri -->
          <div class="field-group">
            <label class="field-label">Pulse oksimetri sudah dipasang &amp; berfungsi baik?</label>
            <div class="radio-group">
              <RadioButton inputId="oksiYes" value="Sudah" v-model="form.oksimetri" />
              <label for="oksiYes" class="radio-label">Sudah</label>
              <RadioButton inputId="oksiNo" value="Belum" v-model="form.oksimetri" />
              <label for="oksiNo" class="radio-label">Belum</label>
            </div>
          </div>

          <!-- Jalan Nafas Sulit -->
          <div class="field-group">
            <label class="field-label">Apakah terdapat risiko jalan nafas sulit / aspirasi?</label>
            <div class="radio-group">
              <RadioButton inputId="jnYes" value="Ya" v-model="form.jalan_nafas" />
              <label for="jnYes" class="radio-label">Ya</label>
              <RadioButton inputId="jnNo" value="Tidak" v-model="form.jalan_nafas" />
              <label for="jnNo" class="radio-label">Tidak</label>
            </div>
            <div v-if="form.jalan_nafas === 'Ya'" class="sub-field mt-2">
              <label class="field-label-sm">Peralatan / antisipasi yang disiapkan:</label>
              <Textarea
                v-model="form.antisipasi_jalan_nafas"
                rows="2"
                class="w-100"
                placeholder="Jelaskan antisipasi yang disiapkan..."
                autoResize
              />
            </div>
          </div>

          <div class="section-divider">
            <span>Risiko Klinis</span>
          </div>

          <!-- Alergi -->
          <div class="field-group">
            <label class="field-label">Pasien memiliki alergi?</label>
            <div class="radio-group">
              <RadioButton inputId="alergiYes" value="Ya" v-model="form.alergi" />
              <label for="alergiYes" class="radio-label">Ya</label>
              <RadioButton inputId="alergiNo" value="Tidak" v-model="form.alergi" />
              <label for="alergiNo" class="radio-label">Tidak</label>
            </div>
            <div v-if="form.alergi === 'Ya'" class="sub-field mt-2">
              <label class="field-label-sm">Detail alergi:</label>
              <InputText
                v-model="form.detail_alergi"
                class="w-100"
                placeholder="Sebutkan jenis alergi..."
              />
            </div>
          </div>

          <!-- Risiko Aspirasi -->
          <div class="field-group">
            <label class="field-label">Adakah risiko aspirasi?</label>
            <div class="radio-group">
              <RadioButton inputId="aspirasiYes" value="Ya" v-model="form.aspirasi" />
              <label for="aspirasiYes" class="radio-label">Ya</label>
              <RadioButton inputId="aspirasiNo" value="Tidak" v-model="form.aspirasi" />
              <label for="aspirasiNo" class="radio-label">Tidak</label>
            </div>
          </div>

          <!-- Risiko Pendarahan -->
          <div class="field-group">
            <label class="field-label">Adakah risiko pendarahan &gt; 500ml?</label>
            <div class="radio-group">
              <RadioButton inputId="darahYes" value="Ya" v-model="form.pendarahan" />
              <label for="darahYes" class="radio-label">Ya</label>
              <RadioButton inputId="darahNo" value="Tidak" v-model="form.pendarahan" />
              <label for="darahNo" class="radio-label">Tidak</label>
            </div>
            <div v-if="form.pendarahan === 'Ya'" class="sub-field mt-2">
              <label class="field-label-sm">Akses IV / cairan resusitasi tersedia?</label>
              <div class="radio-group">
                <RadioButton inputId="ivYes" value="Ya" v-model="form.akses_iv" />
                <label for="ivYes" class="radio-label">Ya</label>
                <RadioButton inputId="ivNo" value="Tidak" v-model="form.akses_iv" />
                <label for="ivNo" class="radio-label">Tidak</label>
              </div>
            </div>
          </div>

          <div class="section-divider">
            <span>Penanggung Jawab</span>
          </div>

          <div class="field-group">
            <label class="field-label">Nama Perawat / Petugas Sign In</label>

            <div class="tte-actions mt-2">
              <Button
                v-if="!tte.petugas_sign_in.signed"
                label="Tanda Tangan Digital"
                icon="pi pi-pen-to-square"
                size="small"
                severity="info"
                @click="openTTE('petugas_sign_in')"
              />
              <div v-else class="tte-verified-badge signin-verified">
                <i class="pi pi-verified"></i>
                <div class="tte-info">
                  <span class="tte-name">{{ tte.petugas_sign_in.nama }}</span>
                  <span class="tte-id">ID: {{ tte.petugas_sign_in.username }}</span>
                  <span class="tte-time">{{ tte.petugas_sign_in.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== TIME OUT ===== -->
    <div class="col-md-4">
      <div class="checklist-card timeout-card">
        <div class="card-phase-header timeout-header">
          <i class="pi pi-clock me-2"></i>
          <span>TIME OUT</span>
          <small class="ms-auto">Sebelum Insisi Kulit</small>
        </div>

        <div class="card-phase-body">
          <!-- Tanggal -->
          <div class="field-group">
            <label class="field-label"><i class="pi pi-calendar me-1"></i>Tanggal &amp; Jam</label>
            <DatePicker
              v-model="form.timeOutDate"
              dateFormat="dd MM yy"
              placeholder="Pilih tanggal dan waktu"
              showTime
              hourFormat="24"
              showIcon
              class="w-100"
            />
          </div>

          <div class="section-divider">
            <span>Konfirmasi Tim</span>
          </div>

          <!-- Konfirmasi Tim -->
          <div class="field-group">
            <label class="field-label">
              Semua anggota tim sudah memperkenalkan nama dan tugasnya?
            </label>
            <div class="radio-group">
              <RadioButton inputId="timYes" value="Sudah" v-model="form.konfirmasiTim" />
              <label for="timYes" class="radio-label">Sudah</label>
              <RadioButton inputId="timNo" value="Belum" v-model="form.konfirmasiTim" />
              <label for="timNo" class="radio-label">Belum</label>
            </div>
          </div>

          <!-- Konfirmasi Verbal -->
          <div class="field-group">
            <label class="field-label">
              Dokter Bedah, Anestesi &amp; Perawat telah konfirmasi verbal: nama pasien, prosedur
              &amp; lokasi insisi?
            </label>
            <div class="radio-group">
              <RadioButton inputId="verbalYes" value="Sudah" v-model="form.konfirmasiVerbal" />
              <label for="verbalYes" class="radio-label">Sudah</label>
              <RadioButton inputId="verbalNo" value="Belum" v-model="form.konfirmasiVerbal" />
              <label for="verbalNo" class="radio-label">Belum</label>
            </div>
          </div>

          <div class="section-divider">
            <span>Antisipasi Keadaan Kritis</span>
          </div>

          <!-- Antisipasi Kritis -->
          <div class="field-group">
            <label class="field-label">Pilih yang sudah dikonfirmasi:</label>
            <div class="checkbox-list">
              <div class="checkbox-item">
                <Checkbox inputId="kritisdokter" v-model="form.kritis" value="dokter" />
                <label for="kritisdokter">
                  <strong>Dokter Bedah:</strong> Keadaan kritis, langkah tidak terduga, estimasi
                  lama operasi &amp; antisipasi kehilangan darah
                </label>
              </div>
              <div class="checkbox-item">
                <Checkbox inputId="kritisAnestesi" v-model="form.kritis" value="anestesi" />
                <label for="kritisAnestesi">
                  <strong>Dokter Anestesi:</strong> Apakah pasien membutuhkan perhatian khusus?
                </label>
              </div>
              <div class="checkbox-item">
                <Checkbox inputId="kritisPerawat" v-model="form.kritis" value="perawat" />
                <label for="kritisPerawat">
                  <strong>Tim Perawat:</strong> Peralatan steril sudah siap &amp; tidak ada masalah?
                </label>
              </div>
            </div>
          </div>

          <div class="section-divider">
            <span>Kesiapan Operasi</span>
          </div>

          <!-- Profilaksis -->
          <div class="field-group">
            <label class="field-label"
              >Obat profilaksis antibiotik sudah diberikan 60 menit sebelumnya?</label
            >
            <div class="radio-group">
              <RadioButton inputId="profilYes" value="Sudah" v-model="form.profilaksis" />
              <label for="profilYes" class="radio-label">Sudah</label>
              <RadioButton inputId="profilNo" value="Belum" v-model="form.profilaksis" />
              <label for="profilNo" class="radio-label">Belum</label>
              <RadioButton inputId="profilNA" value="Tidak Perlu" v-model="form.profilaksis" />
              <label for="profilNA" class="radio-label">Tidak Perlu</label>
            </div>
          </div>

          <!-- Hasil Rontgen / Imaging -->
          <div class="field-group">
            <label class="field-label"
              >Apakah ada hasil imaging (rontgen/CT/MRI) yang perlu ditampilkan?</label
            >
            <div class="radio-group">
              <RadioButton inputId="rontgenYes" value="Ya" v-model="form.rontgen" />
              <label for="rontgenYes" class="radio-label">Ya</label>
              <RadioButton inputId="rontgenNo" value="Tidak" v-model="form.rontgen" />
              <label for="rontgenNo" class="radio-label">Tidak</label>
            </div>
          </div>

          <!-- Implant / Peralatan Khusus -->
          <div class="field-group">
            <label class="field-label">Apakah diperlukan implant atau peralatan khusus?</label>
            <div class="radio-group">
              <RadioButton inputId="implantYes" value="Ya" v-model="form.implant" />
              <label for="implantYes" class="radio-label">Ya</label>
              <RadioButton inputId="implantNo" value="Tidak" v-model="form.implant" />
              <label for="implantNo" class="radio-label">Tidak</label>
            </div>
            <div v-if="form.implant === 'Ya'" class="sub-field mt-2">
              <label class="field-label-sm">Keterangan implant / peralatan:</label>
              <InputText
                v-model="form.keterangan_implant"
                class="w-100"
                placeholder="Sebutkan jenis implant / peralatan..."
              />
            </div>
          </div>

          <div class="section-divider">
            <span>Penanggung Jawab</span>
          </div>

          <div class="field-group">
            <label class="field-label">Nama Dokter Operator</label>

            <div class="tte-actions mt-2">
              <Button
                v-if="!tte.dokter_operator.signed"
                label="Tanda Tangan Digital"
                icon="pi pi-pen-to-square"
                size="small"
                severity="warning"
                @click="openTTE('dokter_operator')"
              />
              <div v-else class="tte-verified-badge timeout-verified">
                <i class="pi pi-verified"></i>
                <div class="tte-info">
                  <span class="tte-name">{{ tte.dokter_operator.nama }}</span>
                  <span class="tte-id">ID: {{ tte.dokter_operator.username }}</span>
                  <span class="tte-time">{{ tte.dokter_operator.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Nama Dokter Anestesi</label>

            <div class="tte-actions mt-2">
              <Button
                v-if="!tte.dokter_anestesi.signed"
                label="Tanda Tangan Digital"
                icon="pi pi-pen-to-square"
                size="small"
                severity="warning"
                @click="openTTE('dokter_anestesi')"
              />
              <div v-else class="tte-verified-badge timeout-verified">
                <i class="pi pi-verified"></i>
                <div class="tte-info">
                  <span class="tte-name">{{ tte.dokter_anestesi.nama }}</span>
                  <span class="tte-id">ID: {{ tte.dokter_anestesi.username }}</span>
                  <span class="tte-time">{{ tte.dokter_anestesi.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== SIGN OUT ===== -->
    <div class="col-md-4">
      <div class="checklist-card signout-card">
        <div class="card-phase-header signout-header">
          <i class="pi pi-sign-out me-2"></i>
          <span>SIGN OUT</span>
          <small class="ms-auto">Sebelum Pasien Meninggalkan OK</small>
        </div>

        <div class="card-phase-body">
          <!-- Tanggal -->
          <div class="field-group">
            <label class="field-label"><i class="pi pi-calendar me-1"></i>Tanggal &amp; Jam</label>
            <DatePicker
              v-model="form.timeSignOut"
              dateFormat="dd MM yy"
              showTime
              showIcon
              hourFormat="24"
              class="w-100"
            />
          </div>

          <div class="section-divider">
            <span>1. Konfirmasi Verbal Perawat</span>
          </div>

          <!-- Konfirmasi Verbal Perawat -->
          <div class="field-group">
            <div class="checkbox-list">
              <div class="checkbox-item">
                <Checkbox v-model="form.konfirmasi" inputId="prosedur" value="prosedur" />
                <label for="prosedur">Nama prosedur tindakan dikonfirmasi</label>
              </div>
              <div class="checkbox-item">
                <Checkbox v-model="form.konfirmasi" inputId="instrumen" value="instrumen" />
                <label for="instrumen"
                  >Instrumen, kasa &amp; jarum sudah dihitung dengan benar / lengkap</label
                >
              </div>
              <div class="checkbox-item">
                <Checkbox v-model="form.konfirmasi" inputId="spesimen" value="spesimen" />
                <label for="spesimen"
                  >Spesimen sudah diberi label (nama pasien &amp; asal jaringan)</label
                >
              </div>
            </div>
          </div>

          <div class="section-divider">
            <span>2. Masalah Peralatan</span>
          </div>

          <!-- Masalah Peralatan -->
          <div class="field-group">
            <label class="field-label">Apakah ada masalah dengan peralatan selama operasi?</label>
            <div class="radio-group">
              <RadioButton v-model="form.masalahPeralatan" inputId="ya" value="Ya" />
              <label for="ya" class="radio-label">Ya</label>
              <RadioButton v-model="form.masalahPeralatan" inputId="tidak" value="Tidak" />
              <label for="tidak" class="radio-label">Tidak</label>
            </div>
            <div v-if="form.masalahPeralatan === 'Ya'" class="sub-field mt-2">
              <label class="field-label-sm">Keterangan masalah peralatan:</label>
              <Textarea
                v-model="form.keterangan_masalah"
                rows="2"
                class="w-100"
                placeholder="Jelaskan masalah peralatan..."
                autoResize
              />
            </div>
          </div>

          <div class="section-divider">
            <span>3. Review Tim &amp; Instruksi Pemulihan</span>
          </div>

          <!-- Review Dokter -->
          <div class="field-group">
            <div class="checkbox-list">
              <div class="checkbox-item">
                <Checkbox v-model="form.review" inputId="review" value="done" />
                <label for="review"
                  >Dokter Bedah, Anestesi &amp; Perawat telah mereview masalah utama untuk pemulihan
                  pasien</label
                >
              </div>
            </div>
          </div>

          <!-- Instruksi Pemulihan -->
          <div class="field-group">
            <label class="field-label">Instruksi / catatan penting untuk pemulihan pasien:</label>
            <Textarea
              v-model="form.instruksi_pemulihan"
              rows="3"
              class="w-100"
              placeholder="Tulis instruksi pemulihan, obat post-op, monitoring khusus, dll..."
              autoResize
            />
          </div>

          <div class="section-divider">
            <span>Penanggung Jawab</span>
          </div>

          <div class="field-group">
            <label class="field-label">Nama Perawat Scrub / Instrumentator</label>

            <div class="tte-actions mt-2">
              <Button
                v-if="!tte.perawat_scrub.signed"
                label="Tanda Tangan Digital"
                icon="pi pi-pen-to-square"
                size="small"
                severity="success"
                @click="openTTE('perawat_scrub')"
              />
              <div v-else class="tte-verified-badge signout-verified">
                <i class="pi pi-verified"></i>
                <div class="tte-info">
                  <span class="tte-name">{{ tte.perawat_scrub.nama }}</span>
                  <span class="tte-id">ID: {{ tte.perawat_scrub.username }}</span>
                  <span class="tte-time">{{ tte.perawat_scrub.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Nama Perawat Sirkuler</label>

            <div class="tte-actions mt-2">
              <Button
                v-if="!tte.perawat_sirkuler.signed"
                label="Tanda Tangan Digital"
                icon="pi pi-pen-to-square"
                size="small"
                severity="success"
                @click="openTTE('perawat_sirkuler')"
              />
              <div v-else class="tte-verified-badge signout-verified">
                <i class="pi pi-verified"></i>
                <div class="tte-info">
                  <span class="tte-name">{{ tte.perawat_sirkuler.nama }}</span>
                  <span class="tte-id">ID: {{ tte.perawat_sirkuler.username }}</span>
                  <span class="tte-time">{{ tte.perawat_sirkuler.timestamp }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Bar -->
  <div class="action-bar mt-3">
    <div class="action-bar-inner">
      <div class="action-info">
        <i class="pi pi-info-circle me-2" style="color: var(--p-text-muted-color)"></i>
        <span>Pastikan semua field telah diisi sebelum menyimpan data checklist.</span>
      </div>
      <div class="action-buttons">
        <Button
          label="Reset Form"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          class="me-2"
          @click="resetForm"
        />
        <Button
          label="Simpan Checklist"
          icon="pi pi-save"
          severity="success"
          @click="simpan_data"
        />
      </div>
    </div>
  </div>

  <!-- QR Code Section - muncul setelah semua TTE selesai -->
  <Transition name="qr-fade">
    <div v-if="allSigned" class="qr-section mt-3">
      <div class="qr-card">
        <div class="qr-header">
          <i class="pi pi-check-circle me-2"></i>
          <span class="ml-1">Semua Tanda Tangan Digital Telah Diverifikasi</span>
        </div>
        <div class="qr-body">
          <div class="qr-code-wrapper">
            <QrcodeVue :value="qrCodeData" :size="180" level="H" render-as="svg" />
          </div>
          <div class="qr-details">
            <h6 class="qr-title">Checklist Keselamatan Pasien Operasi</h6>
            <p class="qr-subtitle">Scan QR Code untuk verifikasi keaslian dokumen</p>
            <div class="qr-signers">
              <div class="qr-signer-item">
                <span class="signer-role">Petugas Sign In</span>
                <span class="signer-name">{{ tte.petugas_sign_in.nama }}</span>
                <span class="signer-time">{{ tte.petugas_sign_in.timestamp }}</span>
              </div>
              <div class="qr-signer-item">
                <span class="signer-role">Dokter Operator</span>
                <span class="signer-name">{{ tte.dokter_operator.nama }}</span>
                <span class="signer-time">{{ tte.dokter_operator.timestamp }}</span>
              </div>
              <div class="qr-signer-item">
                <span class="signer-role">Dokter Anestesi</span>
                <span class="signer-name">{{ tte.dokter_anestesi.nama }}</span>
                <span class="signer-time">{{ tte.dokter_anestesi.timestamp }}</span>
              </div>
              <div class="qr-signer-item">
                <span class="signer-role">Perawat Scrub</span>
                <span class="signer-name">{{ tte.perawat_scrub.nama }}</span>
                <span class="signer-time">{{ tte.perawat_scrub.timestamp }}</span>
              </div>
              <div class="qr-signer-item">
                <span class="signer-role">Perawat Sirkuler</span>
                <span class="signer-name">{{ tte.perawat_sirkuler.nama }}</span>
                <span class="signer-time">{{ tte.perawat_sirkuler.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- TTE Dialog - satu instance untuk semua penandatangan -->
  <ttdUser
    v-model:showFormOtorisasi="showTTEDialog"
    :noregister="form.kodeboking"
    :mode="mode_ttd"
    :link_ttd="'ttd_check_list_keselamatan'"
    @otpVerified="handleTTEVerified"
  />

  <Toast />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import QrcodeVue from 'qrcode.vue'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/config'
import { useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const route = useRoute()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const loading = ref(false)
const activePhase = ref('signin')
const mode_ttd = ref(0) // Mode TTE untuk checklist operasi

// ===== TTE (Tanda Tangan Elektronik) =====
const defaultTTE = () => ({ signed: false, username: '', nama: '', timestamp: '' })

const tte = ref({
  petugas_sign_in: defaultTTE(),
  dokter_operator: defaultTTE(),
  dokter_anestesi: defaultTTE(),
  perawat_scrub: defaultTTE(),
  perawat_sirkuler: defaultTTE(),
})

const showTTEDialog = ref(false)
const currentTTEKey = ref('')

const openTTE = (key) => {
  if (key === 'petugas_sign_in') {
    mode_ttd.value = 4
  }
  if (key === 'dokter_operator') {
    mode_ttd.value = 5
  }
  if (key === 'dokter_anestesi') {
    mode_ttd.value = 6
  }
  if (key === 'perawat_scrub') {
    mode_ttd.value = 2
  }
  if (key === 'perawat_sirkuler') {
    mode_ttd.value = 3
  }
  currentTTEKey.value = key
  showTTEDialog.value = true
}

const handleTTEVerified = ({ username }) => {
  if (!currentTTEKey.value) return
  tte.value[currentTTEKey.value].signed = true
  tte.value[currentTTEKey.value].username = username
  tte.value[currentTTEKey.value].nama = username
  tte.value[currentTTEKey.value].timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  currentTTEKey.value = ''
  fetchData()
}

const allSigned = computed(() => Object.values(tte.value).every((t) => t.signed))

const qrCodeData = computed(() =>
  JSON.stringify({
    dokumen: 'Checklist Keselamatan Pasien Operasi',
    noregister: form.value.kodeboking,
    ttd: {
      petugas_sign_in: {
        nama: tte.value.petugas_sign_in.nama,
        waktu: tte.value.petugas_sign_in.timestamp,
      },
      dokter_operator: {
        nama: tte.value.dokter_operator.nama,
        waktu: tte.value.dokter_operator.timestamp,
      },
      dokter_anestesi: {
        nama: tte.value.dokter_anestesi.nama,
        waktu: tte.value.dokter_anestesi.timestamp,
      },
      perawat_scrub: {
        nama: tte.value.perawat_scrub.nama,
        waktu: tte.value.perawat_scrub.timestamp,
      },
      perawat_sirkuler: {
        nama: tte.value.perawat_sirkuler.nama,
        waktu: tte.value.perawat_sirkuler.timestamp,
      },
    },
  }),
)

const defaultForm = () => ({
  noregister: route.query.noreg,
  kodeboking: route.query.kodebooking,
  id_client: id_client.value,
  // Sign In
  signInDate: new Date(),
  confirmPatient: '',
  lokasiOperasi: '',
  anastesi: '',
  oksimetri: '',
  jalan_nafas: '',
  antisipasi_jalan_nafas: '',
  alergi: '',
  detail_alergi: '',
  aspirasi: '',
  pendarahan: '',
  akses_iv: '',
  petugas_sign_in: '',
  // Time Out
  timeOutDate: new Date(),
  konfirmasiTim: '',
  konfirmasiVerbal: '',
  kritis: [],
  profilaksis: '',
  rontgen: '',
  implant: '',
  keterangan_implant: '',
  dokter_operator: '',
  dokter_anestesi: '',
  // Sign Out
  timeSignOut: new Date(),
  konfirmasi: [],
  masalahPeralatan: null,
  keterangan_masalah: '',
  review: [],
  instruksi_pemulihan: '',
  perawat_scrub: '',
  perawat_sirkuler: '',
  // Nama lengkap dari server setelah TTE
  nama_petugas_sign_in: '',
  nama_dokter_operator: '',
  nama_dokter_anestesi: '',
  nama_perawat_scrub: '',
  nama_perawat_sirkuler: '',
})

const form = ref(defaultForm())

const resetForm = () => {
  form.value = defaultForm()
}

const formatForDatabase = (dateValue) => {
  try {
    if (!dateValue) return null
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    if (isNaN(date.getTime())) return null
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false,
    })
    return formatter.format(date).replace('T', ' ')
  } catch {
    return null
  }
}

const simpan_data = async () => {
  try {
    const payload = { ...form.value }
    payload.signInDate = formatForDatabase(payload.signInDate)
    payload.timeOutDate = formatForDatabase(payload.timeOutDate)
    payload.timeSignOut = formatForDatabase(payload.timeSignOut)

    loading.value = true

    console.log('Payload to save:', JSON.stringify(payload)) // Debug log untuk melihat data yang akan dikirim

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/insert_checklist_operasi`,
      payload,
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
    loading.value = false
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menyimpan data.', life: 3000 })
    console.error('Error saving data:', error)
  }
}

const fetchData = async () => {
  try {
    loading.value = true
    const param = { kodeboking: route.query.kodebooking, id_client: id_client.value }
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/get_check_list_keselamatan`,
      param,
    )
    if (response.data.metadata.code == 200) {
      const data = response.data.response
      data.kritis = data.kritis ? JSON.parse(data.kritis) : []
      data.konfirmasi = data.konfirmasi ? JSON.parse(data.konfirmasi) : []
      data.review = data.review ? JSON.parse(data.review) : []
      form.value = { ...defaultForm(), ...data }

      // Populate TTE state dari data server
      const tteMap = {
        petugas_sign_in: {
          tte: 'tte_petugas_sign_in',
          waktu: 'tte_waktu_petugas_sign_in',
          nama: 'nama_petugas_sign_in',
        },
        dokter_operator: {
          tte: 'tte_dokter_operator',
          waktu: 'tte_waktu_dokter_operator',
          nama: 'nama_dokter_operator',
        },
        dokter_anestesi: {
          tte: 'tte_dokter_anestesi',
          waktu: 'tte_waktu_dokter_anestesi',
          nama: 'nama_dokter_anestesi',
        },
        perawat_scrub: {
          tte: 'tte_perawat_scrub',
          waktu: 'tte_waktu_perawat_scrub',
          nama: 'nama_perawat_scrub',
        },
        perawat_sirkuler: {
          tte: 'tte_perawat_sirkuler',
          waktu: 'tte_waktu_perawat_sirkuler',
          nama: 'nama_perawat_sirkuler',
        },
      }
      for (const [key, fields] of Object.entries(tteMap)) {
        if (data[fields.tte]) {
          tte.value[key].signed = true
          tte.value[key].username = data[fields.tte]
          tte.value[key].nama = data[fields.nama] || data[fields.tte]
          tte.value[key].timestamp = data[fields.waktu] || ''
        }
      }
    }
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ====== Banner ====== */
.checklist-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--p-primary-color);
  border-radius: var(--p-border-radius);
  padding: 1rem 1.5rem;
  color: var(--p-primary-contrast-color);
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

/* ====== Phase Steps ====== */
.phase-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 0.75rem 1rem;
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  border: 1px solid var(--p-content-border-color);
}
.phase-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  padding: 0.4rem 1.5rem;
  border-radius: var(--p-border-radius);
  transition: background 0.2s;
}
.phase-step:hover {
  background: var(--p-content-border-color);
}
.phase-step.active {
  background: var(--p-primary-50);
}
.phase-step .step-label {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--p-text-color);
}
.phase-step small {
  font-size: 0.72rem;
  color: var(--p-text-muted-color);
  text-align: center;
}
.phase-connector {
  flex: 1;
  height: 2px;
  background: var(--p-content-border-color);
  max-width: 60px;
}
.step-badge {
  width: 32px;
  height: 32px;
  border-radius: var(--p-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: #fff;
}
.signin-badge  { background: var(--p-primary-color); }
.timeout-badge { background: var(--p-yellow-600); }
.signout-badge { background: var(--p-green-600); }

/* ====== Cards ====== */
.checklist-card {
  border-radius: var(--p-border-radius);
  overflow: hidden;
  box-shadow: var(--p-card-shadow);
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  height: 100%;
}
.card-phase-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.1rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  letter-spacing: 0.04em;
}
.card-phase-header small {
  font-size: 0.72rem;
  font-weight: 400;
  opacity: 0.88;
}
.signin-header  { background: var(--p-primary-color); }
.timeout-header { background: var(--p-yellow-600); }
.signout-header { background: var(--p-green-600); }

.card-phase-body {
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
  color: var(--p-text-color);
  margin-bottom: 0.35rem;
  line-height: 1.4;
}
.field-label-sm {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
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
  color: var(--p-text-color);
  cursor: pointer;
}
.sub-field {
  background: var(--p-surface-50);
  border-left: 3px solid var(--p-content-border-color);
  padding: 0.5rem 0.75rem;
  border-radius: 0 6px 6px 0;
}

/* ====== Checkbox List ====== */
.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.checkbox-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}
.checkbox-item label {
  font-size: 0.81rem;
  color: var(--p-text-color);
  line-height: 1.4;
  cursor: pointer;
}

/* ====== Section Divider ====== */
.section-divider {
  display: flex;
  align-items: center;
  margin: 0.75rem 0;
  gap: 0.5rem;
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--p-content-border-color);
}

/* ====== Action Bar ====== */
.action-bar {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius);
  padding: 0.85rem 1.25rem;
  box-shadow: var(--p-card-shadow);
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
  color: var(--p-text-muted-color);
}
.action-buttons {
  display: flex;
  align-items: center;
}

/* ====== TTE Actions ====== */
.tte-actions {
  display: flex;
  align-items: center;
}
.tte-verified-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--p-border-radius);
  font-size: 0.78rem;
  width: 100%;
}
.tte-verified-badge .pi-verified {
  font-size: 1.1rem;
  flex-shrink: 0;
}
.signin-verified {
  background: var(--p-primary-50);
  border: 1px solid var(--p-primary-200);
  color: var(--p-primary-color);
}
.timeout-verified {
  background: var(--p-yellow-50);
  border: 1px solid var(--p-yellow-200);
  color: var(--p-yellow-800);
}
.signout-verified {
  background: var(--p-green-50);
  border: 1px solid var(--p-green-200);
  color: var(--p-green-800);
}
.tte-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}
.tte-name {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tte-id {
  font-size: 0.68rem;
  opacity: 0.6;
  font-family: monospace;
}
.tte-time {
  font-size: 0.7rem;
  opacity: 0.75;
}

/* ====== QR Code Section ====== */
.qr-section {
  border-radius: var(--p-border-radius);
  overflow: hidden;
  box-shadow: var(--p-card-shadow);
}
.qr-card {
  background: var(--p-content-background);
  border: 2px solid var(--p-green-600);
}
.qr-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: var(--p-green-600);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}
.qr-header .pi {
  font-size: 1.1rem;
}
.qr-body {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.25rem;
  flex-wrap: wrap;
}
.qr-code-wrapper {
  flex-shrink: 0;
  padding: 0.75rem;
  background: var(--p-surface-0);
  border: 2px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-details {
  flex: 1;
  min-width: 200px;
}
.qr-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin: 0 0 0.25rem;
}
.qr-subtitle {
  font-size: 0.78rem;
  color: var(--p-text-muted-color);
  margin: 0 0 0.75rem;
}
.qr-signers {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.qr-signer-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.78rem;
  padding: 0.3rem 0.5rem;
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  border-left: 3px solid var(--p-green-600);
}
.signer-role {
  font-weight: 700;
  color: var(--p-text-color);
  min-width: 120px;
  flex-shrink: 0;
}
.signer-name {
  color: var(--p-text-color);
  font-weight: 600;
  flex: 1;
}
.signer-time {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

/* ====== QR Fade Transition ====== */
.qr-fade-enter-active,
.qr-fade-leave-active {
  transition: all 0.4s ease;
}
.qr-fade-enter-from,
.qr-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .phase-steps {
    flex-direction: column;
  }
  .phase-connector {
    width: 2px;
    height: 20px;
  }
  .action-bar-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .qr-body {
    flex-direction: column;
    align-items: center;
  }
  .signer-role {
    min-width: 90px;
  }
}

/* ====== PrimeVue overrides ====== */
:deep(.p-datepicker),
:deep(.p-inputtext),
:deep(.p-textarea) {
  font-size: 0.85rem;
}
:deep(.p-datepicker) {
  width: 100%;
}
</style>
