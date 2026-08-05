<template>
  <Toast />
  <section class="content">
    <div class="container-fluid px-0">
      <!-- ===== HEADER: SKOR TRIASE ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title" style="justify-content: space-between">
            <span><i class="fas fa-ambulance"></i> Form Triase IGD</span>
            <ProgressBar
              mode="indeterminate"
              v-show="isLoading"
              style="height: 0.2em; width: 120px; border-radius: 4px"
            />
          </div>
        </template>
        <template #content>
          <div class="row">
            <div class="col-md-3">
              <div class="triase-stat triase-emergensi">
                <div class="triase-stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="triase-stat-info">
                  <div class="triase-stat-value">{{ nilai_triase.EMERGENSI || 0 }}</div>
                  <div class="triase-stat-label">Emergensi</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="triase-stat triase-urgent">
                <div class="triase-stat-icon"><i class="fas fa-clock"></i></div>
                <div class="triase-stat-info">
                  <div class="triase-stat-value">{{ nilai_triase.URGENT || 0 }}</div>
                  <div class="triase-stat-label">Urgent</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="triase-stat triase-nonurgent">
                <div class="triase-stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="triase-stat-info">
                  <div class="triase-stat-value">{{ nilai_triase.NON_URGENT || 0 }}</div>
                  <div class="triase-stat-label">Non Urgent</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="triase-stat triase-doa">
                <div class="triase-stat-icon"><i class="fas fa-times-circle"></i></div>
                <div class="triase-stat-info">
                  <div class="triase-stat-value">{{ nilai_triase.DEATH_ON_ARRIVAL || 0 }}</div>
                  <div class="triase-stat-label">Death on Arrival</div>
                </div>
              </div>
            </div>
          </div>
          <!-- Hasil Skor Real-time -->
          <div class="mt-3" v-if="skorTriase.total > 0">
            <div :class="skorTriase.warna" class="triase-hasil-bar">
              <div class="triase-hasil-left">
                <i class="fas fa-poll mr-2"></i>
                <span class="triase-hasil-label">Hasil Penilaian Triase:</span>
                <strong class="triase-hasil-kategori ml-2">{{ skorTriase.kategori }}</strong>
              </div>
              <div class="triase-hasil-rincian">
                <span v-if="skorTriase.emergensi > 0" class="rincian-chip chip-e"
                  >E: {{ skorTriase.emergensi }}</span
                >
                <span v-if="skorTriase.urgent > 0" class="rincian-chip chip-u"
                  >U: {{ skorTriase.urgent }}</span
                >
                <span v-if="skorTriase.nonUrgent > 0" class="rincian-chip chip-n"
                  >N: {{ skorTriase.nonUrgent }}</span
                >
                <span v-if="skorTriase.doa > 0" class="rincian-chip chip-d"
                  >D: {{ skorTriase.doa }}</span
                >
                <span class="rincian-chip chip-total">Total: {{ skorTriase.total }}</span>
              </div>
            </div>
          </div>
          <div class="mt-3" v-else>
            <div class="triase-hasil-bar triase-hasil-kosong">
              <i class="fas fa-clipboard mr-2"></i>
              Belum ada pilihan — silakan isi penilaian triase di bawah
            </div>
          </div>
        </template>
      </Card>

      <!-- ===== CARA MASUK PASIEN ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title"><i class="fas fa-door-open"></i> Cara Masuk Pasien</div>
        </template>
        <template #content>
          <div class="row align-items-end">
            <div class="col-md-3">
              <label class="form-label-custom">Diantar Oleh</label>
              <Select
                v-model="form.diantar_oleh"
                :options="caradatang"
                optionLabel="diantar_oleh"
                placeholder="Pilih cara datang"
                style="width: 100%"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label-custom">Transportasi</label>
              <Select
                :options="transportasi"
                v-model="form.transportasi"
                optionLabel="transportasi"
                placeholder="Pilih transportasi"
                style="width: 100%"
              />
            </div>
            <div class="col-md-3">
              <label class="form-label-custom">Waktu Masuk</label>
              <div class="d-flex" style="gap: 6px">
                <DatePicker
                  v-model="form.waktu_masuk"
                  :showTime="true"
                  :showSeconds="true"
                  style="flex: 1"
                />
                <Button
                  icon="pi pi-stopwatch"
                  @click="set_datetime_now"
                  class="p-button-outlined p-button-secondary"
                  title="Jam Sekarang"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- ===== ANAMNESE SINGKAT ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title">
            <i class="fas fa-notes-medical"></i> Anamnese Singkat
          </div>
        </template>
        <template #content>
          <div class="anamnese-body">
            <div class="row">
              <div class="col-md-6">
                <label class="form-label-custom">Keluhan Utama</label>
                <Textarea
                  v-model="form.keluhan_utama"
                  style="width: 100%"
                  :rows="4"
                  placeholder="Tuliskan keluhan utama pasien..."
                />
              </div>
              <div class="col-md-6">
                <label class="form-label-custom">Riwayat Penyakit Dahulu (RPD)</label>
                <Textarea
                  v-model="form.riwayat_penyakit_dahulu"
                  style="width: 100%"
                  :rows="4"
                  placeholder="Tuliskan riwayat penyakit sebelumnya..."
                />
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6">
                <label class="form-label-custom">Riwayat Penyakit Sekarang (RPS)</label>
                <Textarea
                  v-model="form.riwayat_penyakit_sekarang"
                  style="width: 100%"
                  :rows="4"
                  placeholder="Riwayat penyakit sekarang..."
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- ===== STATUS PSIKOLOGI & RISIKO JATUH ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title">
            <i class="fas fa-brain"></i> Status Psikologi &amp; Risiko Jatuh
          </div>
        </template>
        <template #content>
          <div class="row">
            <div class="col-md-7">
              <label class="form-label-custom mb-2">Status Psikologi</label>
              <div class="radio-grid">
                <div
                  class="field-radiobutton"
                  v-for="opt in [
                    'Marah',
                    'Takut',
                    'Cemas',
                    'Depresi',
                    'Kecendrungan Bunuh Diri',
                    'Gelisah',
                    'Lain-lain',
                    'Tidak-masalah',
                  ]"
                  :key="opt"
                >
                  <RadioButton
                    :id="'psi-' + opt"
                    name="status_psikologi"
                    :value="opt"
                    v-model="form.status_psikologi"
                  />
                  <label :for="'psi-' + opt" class="ml-2">{{ opt }}</label>
                </div>
              </div>
            </div>
            <div class="col-md-3 border-left">
              <label class="form-label-custom mb-2">Risiko Jatuh</label>
              <div class="d-flex" style="gap: 16px">
                <div class="field-radiobutton">
                  <RadioButton
                    id="rj-ya"
                    name="resiko_jatuh"
                    value="YA"
                    v-model="form.resiko_jatuh"
                  />
                  <label for="rj-ya" class="ml-2">
                    <span class="badge badge-danger">YA</span>
                  </label>
                </div>
                <div class="field-radiobutton">
                  <RadioButton
                    id="rj-tidak"
                    name="resiko_jatuh"
                    value="TIDAK"
                    v-model="form.resiko_jatuh"
                  />
                  <label for="rj-tidak" class="ml-2">
                    <span class="badge badge-success">TIDAK</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- ===== TANDA VITAL ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title">
            <i class="fas fa-heartbeat"></i> Keadaan Umum / Tanda Vital
          </div>
        </template>
        <template #content>
          <div class="vital-grid">
            <div class="vital-card">
              <div class="vital-card-label">Suhu Tubuh</div>
              <InputGroup>
                <InputNumber
                  :minFractionDigits="1"
                  v-model="form.suhu"
                  :min="0"
                  :max="50"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>℃</InputGroupAddon>
              </InputGroup>
              <small class="vital-hint">36 – 37.5 ℃</small>
            </div>
            <div class="vital-card vital-card--td">
              <div class="vital-card-label">Tekanan Darah</div>
              <InputGroup>
                <InputGroupAddon>SIS</InputGroupAddon>
                <InputNumber
                  v-model="form.tensi_sistol"
                  :min="0"
                  :max="300"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>/</InputGroupAddon>
                <InputNumber
                  v-model="form.tensi_distol"
                  :min="0"
                  :max="300"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>mmHg</InputGroupAddon>
              </InputGroup>
              <small class="vital-hint">Normal: 120 / 80 mmHg</small>
            </div>
            <div class="vital-card">
              <div class="vital-card-label">Nadi</div>
              <InputGroup>
                <InputNumber
                  v-model="form.nadipermenit"
                  :min="0"
                  :max="300"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>x/mnt</InputGroupAddon>
              </InputGroup>
              <small class="vital-hint">60 – 100 x/mnt</small>
            </div>
            <div class="vital-card">
              <div class="vital-card-label">Saturasi O₂</div>
              <InputGroup>
                <InputNumber
                  v-model="form.saturasi"
                  :min="0"
                  :max="100"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>%</InputGroupAddon>
              </InputGroup>
              <small class="vital-hint">≥ 95 %</small>
            </div>
            <div class="vital-card">
              <div class="vital-card-label">Respirasi</div>
              <InputGroup>
                <InputNumber
                  v-model="form.respirasi"
                  :min="0"
                  :max="300"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>/mnt</InputGroupAddon>
              </InputGroup>
              <small class="vital-hint">12 – 20 /mnt</small>
            </div>
            <div class="vital-card">
              <div class="vital-card-label">Tinggi Badan</div>
              <InputGroup>
                <InputNumber
                  v-model="form.tb"
                  :min="0"
                  :max="300"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>cm</InputGroupAddon>
              </InputGroup>
              <small class="vital-hint">cm</small>
            </div>
            <div class="vital-card">
              <div class="vital-card-label">Berat Badan</div>
              <InputGroup>
                <InputNumber
                  v-model="form.bb"
                  :min="0"
                  :max="300"
                  :inputStyle="{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }"
                />
                <InputGroupAddon>kg</InputGroupAddon>
              </InputGroup>
              <small class="vital-hint">kg</small>
            </div>
          </div>
        </template>
      </Card>

      <!-- ===== KEHAMILAN (hanya perempuan ≥ 15 tahun) ===== -->
      <Card class="mb-3" v-if="showKehamilanSection">
        <template #header>
          <div class="hamil-card-header">
            <div class="hamil-card-title">
              <span class="hamil-card-icon"><i class="fas fa-baby"></i></span>
              <span>Keterangan Kehamilan</span>
            </div>
            <span v-if="form.status_hamil" class="hamil-status-badge">
              <i class="pi pi-check-circle mr-1"></i>Hamil
            </span>
          </div>
        </template>
        <template #content>
          <!-- Toggle status hamil -->
          <label
            for="cb_hamil"
            class="hamil-toggle-row"
            :class="{ 'hamil-toggle-row--on': form.status_hamil }"
          >
            <div class="hamil-toggle-left">
              <span class="hamil-toggle-icon">
                <i class="fas" :class="form.status_hamil ? 'fa-baby' : 'fa-user'"></i>
              </span>
              <div>
                <div class="hamil-toggle-text">Pasien sedang hamil</div>
                <div class="hamil-toggle-hint">
                  {{
                    form.status_hamil
                      ? 'Isi data kehamilan di bawah ini'
                      : 'Centang untuk mengisi data kehamilan'
                  }}
                </div>
              </div>
            </div>
            <Checkbox v-model="form.status_hamil" :binary="true" inputId="cb_hamil" />
          </label>

          <!-- Detail panel -->
          <Transition name="hamil-expand">
            <div v-if="form.status_hamil" class="hamil-detail-panel">
              <div class="hamil-sub-header">
                <i class="pi pi-info-circle"></i><span>Data Kehamilan</span>
              </div>
              <div class="hamil-fields-grid">
                <!-- G/P/A -->
                <div class="hamil-field">
                  <label class="hamil-field-label">Gravida / Para / Abortus</label>
                  <InputGroup>
                    <InputGroupAddon>G</InputGroupAddon>
                    <InputNumber
                      v-model="form.gravida"
                      :min="0"
                      :max="20"
                      :inputStyle="{ textAlign: 'center' }"
                    />
                    <InputGroupAddon>P</InputGroupAddon>
                    <InputNumber
                      v-model="form.para"
                      :min="0"
                      :max="20"
                      :inputStyle="{ textAlign: 'center' }"
                    />
                    <InputGroupAddon>A</InputGroupAddon>
                    <InputNumber
                      v-model="form.abortus"
                      :min="0"
                      :max="20"
                      :inputStyle="{ textAlign: 'center' }"
                    />
                  </InputGroup>
                </div>
                <!-- HPHT (input utama) -->
                <div class="hamil-field">
                  <label class="hamil-field-label"
                    >HPHT <span class="hamil-field-required">*</span></label
                  >
                  <InputGroup>
                    <InputGroupAddon><i class="pi pi-calendar-minus"></i></InputGroupAddon>
                    <input
                      type="date"
                      class="hamil-date-input"
                      v-model="form.hpht_input"
                      :max="todayStr"
                      placeholder="Pilih HPHT..."
                    />
                  </InputGroup>
                  <small class="hamil-field-hint">Hari Pertama Haid Terakhir</small>
                </div>
                <!-- Usia Kehamilan (otomatis) -->
                <div class="hamil-field">
                  <label class="hamil-field-label"
                    >Usia Kehamilan <span class="hamil-field-auto">otomatis</span></label
                  >
                  <InputGroup>
                    <input
                      type="text"
                      class="hamil-hpht-input"
                      :value="usiaKehamilanText"
                      readonly
                      placeholder="—"
                    />
                    <InputGroupAddon>mgg</InputGroupAddon>
                  </InputGroup>
                  <small class="hamil-field-hint">{{ usiaKehamilanHari }}</small>
                </div>
                <!-- HPL (otomatis) -->
                <div class="hamil-field">
                  <label class="hamil-field-label"
                    >Taksiran Persalinan (HPL) <span class="hamil-field-auto">otomatis</span></label
                  >
                  <InputGroup>
                    <InputGroupAddon><i class="pi pi-calendar"></i></InputGroupAddon>
                    <input
                      type="text"
                      class="hamil-hpht-input"
                      :value="hplText"
                      readonly
                      placeholder="—"
                    />
                  </InputGroup>
                  <small class="hamil-field-hint">HPHT + 280 hari</small>
                </div>
              </div>

              <!-- Leopold (usia ≥ 20 minggu) -->
              <div class="leopold-section mt-3">
                <div class="leopold-header">
                  <i class="fas fa-hand-paper mr-2"></i>Pemeriksaan Leopold
                </div>
                <Message v-if="!leopoldVisible" severity="info" :closable="false" class="mt-2">
                  Pemeriksaan Leopold belum relevan untuk usia kehamilan &lt; 20 minggu.
                </Message>
                <template v-else>
                  <Message
                    v-for="(w, i) in leopoldWarnings"
                    :key="i"
                    severity="warn"
                    :closable="false"
                    class="mt-2 mb-0"
                    >{{ w }}</Message
                  >
                  <!-- TFU & DJJ -->
                  <div class="leopold-row mt-2">
                    <div class="leopold-item">
                      <label class="form-label-custom">Tinggi Fundus Uteri</label>
                      <InputGroup>
                        <InputNumber
                          v-model="form.leopold_tfu"
                          :min="0"
                          :max="50"
                          :minFractionDigits="0"
                          :maxFractionDigits="1"
                          :inputStyle="{ textAlign: 'center' }"
                          placeholder="0"
                        />
                        <InputGroupAddon>cm</InputGroupAddon>
                      </InputGroup>
                    </div>
                    <div class="leopold-item">
                      <label class="form-label-custom">Detak Jantung Janin</label>
                      <InputGroup :class="{ 'djj-warning': djjWarning }">
                        <InputNumber
                          v-model="form.djj"
                          :min="0"
                          :max="250"
                          :inputStyle="{ textAlign: 'center', color: djjWarning ? '#dc3545' : '' }"
                          placeholder="0"
                        />
                        <InputGroupAddon>x/mnt</InputGroupAddon>
                      </InputGroup>
                      <small :class="djjWarning ? 'text-danger font-weight-bold' : 'vital-hint'">
                        {{
                          djjWarning
                            ? 'Di luar batas normal (120–160 x/mnt)'
                            : 'Normal: 120–160 x/mnt'
                        }}
                      </small>
                    </div>
                    <div class="leopold-item">
                      <label class="form-label-custom">Irama DJJ</label>
                      <SelectButton
                        v-model="form.djj_reguler"
                        :options="djjRegulerOpts"
                        optionLabel="label"
                        optionValue="value"
                      />
                    </div>
                  </div>
                  <!-- Leopold I–IV -->
                  <div class="leopold-grid mt-3">
                    <div class="leopold-card">
                      <div class="leopold-roman">I</div>
                      <div class="leopold-card-body">
                        <label class="form-label-custom mb-1">Bagian Fundus</label>
                        <SelectButton
                          v-model="form.leopold_i"
                          :options="leopoldIFundusOpts"
                          optionLabel="label"
                          optionValue="value"
                        />
                      </div>
                    </div>
                    <div class="leopold-card">
                      <div class="leopold-roman">II</div>
                      <div class="leopold-card-body">
                        <label class="form-label-custom mb-1">Letak Punggung</label>
                        <SelectButton
                          v-model="form.leopold_ii_punggung"
                          :options="leopoldIIPunggungOpts"
                          optionLabel="label"
                          optionValue="value"
                        />
                        <label class="form-label-custom mt-2 mb-1"
                          >Posisi
                          <span style="font-weight: 400; text-transform: none"
                            >(opsional)</span
                          ></label
                        >
                        <SelectButton
                          v-model="form.leopold_ii_posisi"
                          :options="leopoldIIPosisiOpts"
                          optionLabel="label"
                          optionValue="value"
                        />
                      </div>
                    </div>
                    <div class="leopold-card">
                      <div class="leopold-roman">III</div>
                      <div class="leopold-card-body">
                        <label class="form-label-custom mb-1">Bagian Terbawah</label>
                        <SelectButton
                          v-model="form.leopold_iii"
                          :options="leopoldIIIBawahOpts"
                          optionLabel="label"
                          optionValue="value"
                        />
                        <template v-if="leopoldMasukPAPVisible">
                          <label class="form-label-custom mt-2 mb-1">Masuk PAP</label>
                          <SelectButton
                            v-model="form.leopold_iii_masuk"
                            :options="leopoldMasukPAPOpts"
                            optionLabel="label"
                            optionValue="value"
                          />
                        </template>
                      </div>
                    </div>
                    <div
                      class="leopold-card"
                      :class="{ 'leopold-card--disabled': !leopoldIVVisible }"
                    >
                      <div class="leopold-roman">IV</div>
                      <div class="leopold-card-body">
                        <label class="form-label-custom mb-1"
                          >Penurunan Kepala
                          <span style="font-weight: 400; text-transform: none"
                            >(hanya jika kepala)</span
                          ></label
                        >
                        <SelectButton
                          v-model="form.leopold_iv_metode"
                          :options="leopoldIVMetodeOpts"
                          optionLabel="label"
                          optionValue="value"
                          :disabled="!leopoldIVVisible"
                          class="mb-2"
                        />
                        <template v-if="form.leopold_iv_metode === 'konvergensi'">
                          <SelectButton
                            v-model="form.leopold_iv_konvergensi"
                            :options="leopoldIVKonvergensiOpts"
                            optionLabel="label"
                            optionValue="value"
                            :disabled="!leopoldIVVisible"
                          />
                        </template>
                        <template v-else-if="form.leopold_iv_metode === 'perlimaan'">
                          <SelectButton
                            v-model="form.leopold_iv_perlimaan"
                            :options="leopoldIVPerlimaanOpts"
                            optionLabel="label"
                            optionValue="value"
                            :disabled="!leopoldIVVisible"
                          />
                        </template>
                      </div>
                    </div>
                  </div>
                  <!-- Ringkasan Obstetri -->
                  <div v-if="obstetriText" class="leopold-summary mt-3">
                    <div class="leopold-summary-header">
                      <span><i class="fas fa-file-alt mr-1"></i> Ringkasan Obstetri</span>
                      <Button
                        icon="pi pi-copy"
                        label="Salin"
                        size="small"
                        severity="secondary"
                        outlined
                        v-tooltip.top="'Salin semua ke clipboard'"
                        @click="copyObstetriText"
                      />
                    </div>
                    <pre class="leopold-summary-text">{{ obstetriText }}</pre>
                  </div>
                </template>
              </div>
            </div>
          </Transition>
        </template>
      </Card>

      <!-- ===== SKALA NYERI ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title"><i class="fas fa-thermometer-half"></i> Skala Nyeri</div>
        </template>
        <template #content>
          <div class="row align-items-center mb-3">
            <div class="col-md-1 text-center">
              <img :src="nyeriPic" height="60" width="60" style="object-fit: contain" />
              <div class="nyeri-score-box mt-1">{{ form.nyeri }}</div>
            </div>
            <div class="col-md-8">
              <div class="nyeri-radio-group">
                <div
                  v-for="btn in nyeriButtons"
                  :key="btn.nilai"
                  class="nyeri-radio-label"
                  :class="[btn.color, form.nyeri === btn.nilai ? 'nyeri-active' : '']"
                  @click="pilihNyeri(btn.nilai)"
                >
                  <span class="nyeri-radio-number">{{ btn.nilai }}</span>
                  <span class="nyeri-radio-desc">{{ btn.label }}</span>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label-custom">Lokasi Nyeri</label>
              <InputText v-model="form.lokasinyeri" style="width: 100%" placeholder="Lokasi..." />
            </div>
          </div>
          <div class="nyeri-legend-row">
            <span><span class="nyeri-dot nyeri-0"></span> 0: Tidak nyeri</span>
            <span><span class="nyeri-dot nyeri-ringan"></span> 1–3: Ringan</span>
            <span><span class="nyeri-dot nyeri-sedang"></span> 4–6: Sedang</span>
            <span><span class="nyeri-dot nyeri-berat"></span> 7–9: Berat</span>
            <span><span class="nyeri-dot nyeri-parah"></span> 10: Tak tertahankan</span>
          </div>
        </template>
      </Card>

      <!-- ===== SCREENING GIZI ===== -->
      <ScreeningGiziComponent ref="gizi_form" :dataset="datapasien" :noregister="form.noregister" />

      <!-- ===== KESADARAN ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title"><i class="fas fa-eye"></i> Kesadaran</div>
        </template>
        <template #content>
          <div class="radio-grid">
            <div
              class="field-radiobutton"
              v-for="opt in [
                'Composmetis',
                'Apatis',
                'Delerium',
                'Somnolen',
                'Sopor',
                'Semi koma',
                'Koma',
              ]"
              :key="opt"
            >
              <RadioButton
                :id="'ks-' + opt"
                name="kesadaran"
                :value="opt"
                v-model="form.kesadaran"
              />
              <label :for="'ks-' + opt" class="ml-2">{{ opt }}</label>
            </div>
          </div>
        </template>
      </Card>

      <!-- ===== TABEL TRIASE ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title">
            <i class="fas fa-clipboard-list"></i> Penilaian Triase
          </div>
        </template>
        <template #content>
          <div class="table-responsive">
            <table class="table table-bordered mb-0 triase-table">
              <thead>
                <tr>
                  <th style="width: 20%">Pemeriksaan</th>
                  <th class="th-emergensi">EMERGENSI</th>
                  <th class="th-urgent">URGENT</th>
                  <th class="th-nonurgent">NON URGENT</th>
                  <th class="th-doa">DEATH ON ARRIVAL</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="data in fact" :key="data.grouping">
                  <td class="td-grouping">
                    <strong>{{ data.grouping }}</strong>
                  </td>
                  <td>
                    <template v-for="(det, k) in data.details" :key="'e' + k">
                      <div class="field-checkbox" v-if="det.sk_1 != ''">
                        <Checkbox
                          v-model="form.check_triase"
                          :value="det.val_1"
                          :binary="false"
                          :inputId="det.val_1"
                        />
                        <label :for="det.val_1" class="ml-1">{{ det.sk_1 }}</label>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template v-for="(det, k) in data.details" :key="'u' + k">
                      <div class="field-checkbox" v-if="det.sk_2 != ''">
                        <Checkbox
                          v-model="form.check_triase"
                          :value="det.val_2"
                          :binary="false"
                          :inputId="det.val_2"
                        />
                        <label :for="det.val_2" class="ml-1">{{ det.sk_2 }}</label>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template v-for="(det, k) in data.details" :key="'n' + k">
                      <div class="field-checkbox" v-if="det.sk_4 != ''">
                        <Checkbox
                          v-model="form.check_triase"
                          :value="det.val_4"
                          :binary="false"
                          :inputId="det.val_4"
                        />
                        <label :for="det.val_4" class="ml-1">{{ det.sk_4 }}</label>
                      </div>
                    </template>
                  </td>
                  <td>
                    <template v-for="(det, k) in data.details" :key="'d' + k">
                      <div class="field-checkbox" v-if="det.sk_5 != ''">
                        <Checkbox
                          v-model="form.check_triase"
                          :value="det.val_5"
                          :binary="false"
                          :inputId="det.val_5"
                        />
                        <label :for="det.val_5" class="ml-1">{{ det.sk_5 }}</label>
                      </div>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </Card>

      <!-- ===== SOAP / CPPT ===== -->
      <Card class="mb-3">
        <template #header>
          <div class="card-section-title"><i class="fas fa-file-medical-alt"></i> SOAP / CPPT</div>
        </template>
        <template #content>
          <SoapComponent
            :datapasien="datapasien"
            :noregister="noregister"
            :isCppt="true"
            :data_igd="form"
          />
        </template>
      </Card>

      <!-- ===== SECONDARY SURVEY ===== -->
      <div class="card card-outline card-primary shadow-sm mb-3">
        <div
          class="card-header d-flex align-items-center justify-content-between"
          style="cursor: pointer; user-select: none"
          @click="secondarySurveyExpanded = !secondarySurveyExpanded"
        >
          <h3 class="card-title font-weight-bold mb-0">
            <i class="fas fa-stethoscope mr-2 text-primary"></i>
            Secondary Survey (Pemeriksaan Fisik)
          </h3>
          <i
            :class="secondarySurveyExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            class="text-muted"
          ></i>
        </div>
        <div class="card-body" v-show="secondarySurveyExpanded">
          <Accordion class="ss-accordion">
            <AccordionPanel
              v-for="item in secondary_surver_list"
              :key="item.id"
              :value="String(item.id)"
            >
              <AccordionHeader>
                <template #toggleicon="{ active }">
                  <i :class="active ? 'pi pi-minus' : 'pi pi-plus'" class="ss-acc-icon"></i>
                </template>
                <span class="ss-acc-label">{{ item.label || item.organ }}</span>
                <span v-if="getBadgeText(item)" class="ss-acc-badge">{{ getBadgeText(item) }}</span>
              </AccordionHeader>
              <AccordionContent>
                <div class="ss-organ-body">
                  <div v-for="sf in item.schemaFields" :key="sf.key" class="ss-field">
                    <span class="ss-field-label">{{ sf.label }}</span>
                    <!-- CHECKBOX -->
                    <div v-if="sf.type === 'checkbox'" class="ss-field-opts">
                      <label v-for="opt in sf.options" :key="opt.value" class="ss-opt-label">
                        <Checkbox
                          v-model="item.fields[sf.key]"
                          :value="opt.value"
                          :inputId="'cb-' + item.id + '-' + sf.key + '-' + opt.value"
                        />
                        <span>{{ opt.label }}</span>
                      </label>
                    </div>
                    <!-- RADIO → toggle buttons -->
                    <div v-else-if="sf.type === 'radio'" class="ss-btn-group">
                      <button
                        v-for="opt in sf.options"
                        :key="opt.value"
                        type="button"
                        :class="[
                          'ss-btn-opt',
                          { 'ss-btn-active': item.fields[sf.key] === opt.value },
                        ]"
                        @click="item.fields[sf.key] = opt.value"
                      >
                        {{ opt.label }}
                      </button>
                    </div>
                    <!-- TEXT -->
                    <InputText
                      v-else-if="sf.type === 'text'"
                      v-model="item.fields[sf.key]"
                      class="ss-text-input"
                      :placeholder="sf.label"
                      size="small"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
          <Divider />

          <!-- Ringkasan -->
          <div class="ss-ringkasan-header">
            <span class="ss-ringkasan-title">
              <i class="pi pi-clipboard"></i> Ringkasan Pemeriksaan Fisik
            </span>
            <Button
              :label="ringkasanCopied ? 'Tersalin!' : 'Salin'"
              :icon="ringkasanCopied ? 'pi pi-check' : 'pi pi-copy'"
              :severity="ringkasanCopied ? 'success' : 'secondary'"
              size="small"
              outlined
              @click="copyRingkasan"
            />
          </div>
          <Textarea
            :value="ringkasanFisik"
            :rows="10"
            readonly
            style="width: 100%; resize: vertical; font-family: monospace; font-size: 0.82rem"
          />

          <div v-if="stts_verif" class="qr-verif-wrap mt-3">
            <div class="qr-verif-card">
              <small class="text-muted">
                <i class="fas fa-shield-alt mr-1 text-success"></i>{{ stts_verif }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Otorisasi -->
    <ttdUser
      v-model:showFormOtorisasi="showOtorisasi"
      :noregister="form.noregister"
      :mode="1"
      @otpVerified="handleOtpVerified"
    />
  </section>

  <!-- ===== STICKY FOOTER ===== -->
  <div class="igd-sticky-footer">
    <div class="igd-sticky-left">
      <span class="igd-sticky-label">
        <i class="fas fa-ambulance mr-1"></i>
        Form Triase IGD
      </span>
      <span v-if="isLoading" class="igd-sticky-loading">
        <i class="pi pi-spin pi-spinner mr-1"></i> Menyimpan...
      </span>
    </div>
    <div class="igd-sticky-right">
      <Button
        label="Otorisasi"
        icon="pi pi-lock"
        severity="warning"
        outlined
        class="igd-sticky-btn"
        :disabled="isLoading"
        @click="call_oto()"
      />
      <Button
        label="Simpan Triase"
        icon="pi pi-save"
        severity="success"
        class="igd-sticky-btn"
        :loading="isLoading"
        @click="simpan()"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DatePicker from 'primevue/datepicker'
import ProgressBar from 'primevue/progressbar'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

import ScreeningGiziComponent from '@/components/GiziComp/ScreeningGiziComponent.vue'
import SoapComponent from '@/components/Soap/SoapComponent.vue'
import ttdUser from '@/components/TtdDigitalComponent.vue'

const route = useRoute()
const noregister = route.params.noregister

// ── Refs ──────────────────────────────────────────────────────────────────────
const gizi_form = ref(null)
const datapasien = ref({})
const isLoading = ref(false)
const showOtorisasi = ref(false)
const message = ref('')
const stts_verif = ref('')
const nilai_triase = ref({ EMERGENSI: 0, URGENT: 0, NON_URGENT: 0, DEATH_ON_ARRIVAL: 0 })
const fact = ref([])
const caradatang = ref([])
const transportasi = ref([])

const secondarySurveyExpanded = ref(true)
const ringkasanCopied = ref(false)

const secondary_surver_list = ref([
  {
    id: 1,
    organ: 'kepala',
    label: 'Kepala',
    kondisi: 'NORMAL',
    fields: { kondisi: [], lainnya: '' },
    schemaFields: [
      {
        key: 'kondisi',
        label: 'Kondisi',
        type: 'checkbox',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'mikrosefali', label: 'Mikrosefali' },
          { value: 'makrosefali', label: 'Makrosefali' },
        ],
      },
      { key: 'lainnya', label: 'Lainnya', type: 'text' },
    ],
  },
  {
    id: 2,
    organ: 'mata',
    label: 'Mata',
    kondisi: 'NORMAL',
    fields: {
      anemis_ka: '',
      anemis_ki: '',
      kondisi: [],
      bentuk_pupil: '',
      diameter_pupil_ka: '',
      diameter_pupil_ki: '',
      refleks_cahaya_ka: '',
      refleks_cahaya_ki: '',
      oedem: '',
      infeksi: '',
    },
    schemaFields: [
      {
        key: 'anemis_ka',
        label: 'Anemis kanan',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'anemis_ki',
        label: 'Anemis kiri',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'oedem',
        label: 'Oedem',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'infeksi',
        label: 'Infeksi',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'kondisi',
        label: 'Kondisi',
        type: 'checkbox',
        options: [{ value: 'sklera_ikterik', label: 'Sklera ikterik' }],
      },
      {
        key: 'bentuk_pupil',
        label: 'Pupil',
        type: 'radio',
        options: [
          { value: 'isokor', label: 'Isokor' },
          { value: 'anisokor', label: 'Anisokor' },
        ],
      },
      { key: 'diameter_pupil_ka', label: 'Ø pupil kanan (mm)', type: 'text' },
      { key: 'diameter_pupil_ki', label: 'Ø pupil kiri (mm)', type: 'text' },
    ],
  },
  {
    id: 3,
    organ: 'tht',
    label: 'THT',
    kondisi: 'NORMAL',
    fields: { telinga: '', hidung: '', tonsil: '', faring: '', lidah: '', bibir: '', beslag: '' },
    schemaFields: [
      { key: 'telinga', label: 'Telinga', type: 'text' },
      { key: 'hidung', label: 'Hidung', type: 'text' },
      { key: 'tonsil', label: 'Tonsil', type: 'text' },
      { key: 'faring', label: 'Faring', type: 'text' },
      { key: 'lidah', label: 'Lidah', type: 'text' },
      { key: 'bibir', label: 'Bibir', type: 'text' },
      { key: 'beslag', label: 'Beslag', type: 'text' },
    ],
  },
  {
    id: 4,
    organ: 'leher',
    label: 'Leher',
    kondisi: 'NORMAL',
    fields: { jvp: '', pembesaran_kelenjar: '', kaku_kuduk: '' },
    schemaFields: [
      { key: 'jvp', label: 'JVP', type: 'text' },
      { key: 'pembesaran_kelenjar', label: 'Pembesaran kelenjar', type: 'text' },
      {
        key: 'kaku_kuduk',
        label: 'Kaku kuduk',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
    ],
  },
  {
    id: 5,
    organ: 'thorax',
    label: 'Thorax',
    kondisi: 'NORMAL',
    fields: { bentuk: '', stem_fremitus: '', perkusi_thorax: '' },
    schemaFields: [
      {
        key: 'bentuk',
        label: 'Inspeksi',
        type: 'radio',
        options: [
          { value: 'simetris', label: 'Simetris' },
          { value: 'asimetris', label: 'Asimetris' },
        ],
      },
      { key: 'stem_fremitus', label: 'Stem fremitus', type: 'text' },
      { key: 'perkusi_thorax', label: 'Perkusi', type: 'text' },
    ],
  },
  {
    id: 6,
    organ: 'cor',
    label: 'Cor',
    kondisi: 'NORMAL',
    fields: { bunyi_jantung: '', irama: '', murmur: '' },
    schemaFields: [
      { key: 'bunyi_jantung', label: 'S1, S2', type: 'text' },
      {
        key: 'irama',
        label: 'Irama',
        type: 'radio',
        options: [
          { value: 'reguler', label: 'Reguler' },
          { value: 'ireguler', label: 'Ireguler' },
        ],
      },
      {
        key: 'murmur',
        label: 'Murmur',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
    ],
  },
  {
    id: 7,
    organ: 'pulmo',
    label: 'Pulmo',
    kondisi: 'NORMAL',
    fields: { suara_napas: '', ronkhi_ka: '', ronkhi_ki: '', wheezing_ka: '', wheezing_ki: '' },
    schemaFields: [
      {
        key: 'suara_napas',
        label: 'Suara napas',
        type: 'radio',
        options: [
          { value: 'vesikuler', label: 'Vesikuler' },
          { value: 'bronkial', label: 'Bronkial' },
          { value: 'melemah', label: 'Melemah' },
        ],
      },
      {
        key: 'ronkhi_ka',
        label: 'Ronkhi kanan',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'ronkhi_ki',
        label: 'Ronkhi kiri',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'wheezing_ka',
        label: 'Wheezing kanan',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'wheezing_ki',
        label: 'Wheezing kiri',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
    ],
  },
  {
    id: 8,
    organ: 'abdomen',
    label: 'Abdomen',
    kondisi: 'NORMAL',
    fields: {
      soepel: '',
      distensi: '',
      perkusi_abdomen: '',
      peristaltik: '',
      nyeri_tekan: '',
      lokasi_nyeri_tekan: [],
      defans_muscular: '',
      asites: '',
      meteorismus: '',
      hepar: '',
      hepar_keterangan: '',
      lien: '',
      lien_keterangan: '',
    },
    schemaFields: [
      {
        key: 'soepel',
        label: 'Inspeksi',
        type: 'radio',
        options: [
          { value: 'soepel', label: 'Soepel' },
          { value: 'distensi', label: 'Distensi' },
          { value: 'cembung', label: 'Cembung' },
        ],
      },
      {
        key: 'nyeri_tekan',
        label: 'Nyeri tekan',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'defans_muscular',
        label: 'Defans muscular',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'lokasi_nyeri_tekan',
        label: 'Lokasi NT',
        type: 'checkbox',
        options: [
          { value: 'epigastrium', label: 'Epigastrium' },
          { value: 'hipokondrium_ka', label: 'Hipokondrium Ka' },
          { value: 'hipokondrium_ki', label: 'Hipokondrium Ki' },
          { value: 'umbilikal', label: 'Umbilikal' },
          { value: 'lumbal_ka', label: 'Lumbal Ka' },
          { value: 'lumbal_ki', label: 'Lumbal Ki' },
          { value: 'hipogastrium', label: 'Hipogastrium' },
          { value: 'iliaka_ka', label: 'Iliaka Ka' },
          { value: 'iliaka_ki', label: 'Iliaka Ki' },
        ],
      },
      {
        key: 'perkusi_abdomen',
        label: 'Perkusi',
        type: 'radio',
        options: [
          { value: 'tympani', label: 'Tympani' },
          { value: 'hipertympani', label: 'Hipertympani' },
          { value: 'redup', label: 'Redup' },
          { value: 'pekak', label: 'Pekak' },
        ],
      },
      {
        key: 'peristaltik',
        label: 'Peristaltik',
        type: 'radio',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'meningkat', label: 'Meningkat' },
          { value: 'menurun', label: 'Menurun' },
        ],
      },
      {
        key: 'asites',
        label: 'Asites',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'meteorismus',
        label: 'Meteorismus',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      {
        key: 'hepar',
        label: 'Hepar',
        type: 'radio',
        options: [
          { value: 'tidak_teraba', label: 'Tidak teraba' },
          { value: 'teraba', label: 'Teraba membesar' },
        ],
      },
      { key: 'hepar_keterangan', label: 'Hepar (ket.)', type: 'text' },
      {
        key: 'lien',
        label: 'Lien',
        type: 'radio',
        options: [
          { value: 'tidak_teraba', label: 'Tidak teraba' },
          { value: 'teraba', label: 'Teraba membesar' },
        ],
      },
      { key: 'lien_keterangan', label: 'Lien (ket.)', type: 'text' },
    ],
  },
  {
    id: 9,
    organ: 'genitalia',
    label: 'Genitalia',
    kondisi: 'NORMAL',
    fields: { keterangan: '' },
    schemaFields: [{ key: 'keterangan', label: 'Keterangan', type: 'text' }],
  },
  {
    id: 10,
    organ: 'extremitas',
    label: 'Extremitas',
    kondisi: 'NORMAL',
    fields: {
      akral: '',
      edema: '',
      crt: '',
      kekuatan_ka_atas: '',
      kekuatan_ki_atas: '',
      kekuatan_ka_bawah: '',
      kekuatan_ki_bawah: '',
      lain_lain: '',
    },
    schemaFields: [
      {
        key: 'akral',
        label: 'Akral',
        type: 'radio',
        options: [
          { value: 'hangat', label: 'Hangat' },
          { value: 'dingin', label: 'Dingin' },
        ],
      },
      {
        key: 'edema',
        label: 'Edema',
        type: 'radio',
        options: [
          { value: 'positif', label: '+' },
          { value: 'negatif', label: '-' },
        ],
      },
      { key: 'crt', label: 'CRT', type: 'text' },
      {
        key: 'kekuatan_ka_atas',
        label: 'Motorik Ka atas',
        type: 'radio',
        options: [
          { value: '0', label: '0' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
        ],
      },
      {
        key: 'kekuatan_ki_atas',
        label: 'Motorik Ki atas',
        type: 'radio',
        options: [
          { value: '0', label: '0' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
        ],
      },
      {
        key: 'kekuatan_ka_bawah',
        label: 'Motorik Ka bawah',
        type: 'radio',
        options: [
          { value: '0', label: '0' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
        ],
      },
      {
        key: 'kekuatan_ki_bawah',
        label: 'Motorik Ki bawah',
        type: 'radio',
        options: [
          { value: '0', label: '0' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
        ],
      },
      { key: 'lain_lain', label: 'Lain-lain', type: 'text' },
    ],
  },
  {
    id: 11,
    organ: 'status_lokalis',
    label: 'Status Lokalis',
    kondisi: 'NORMAL',
    fields: { regio: '', inspeksi: '', palpasi: '', perkusi: '', auskultasi: '' },
    schemaFields: [
      { key: 'regio', label: 'Regio', type: 'text' },
      { key: 'inspeksi', label: 'Inspeksi (I)', type: 'text' },
      { key: 'palpasi', label: 'Palpasi (P)', type: 'text' },
      { key: 'perkusi', label: 'Perkusi (P)', type: 'text' },
      { key: 'auskultasi', label: 'Auskultasi (A)', type: 'text' },
    ],
  },
])

const ringkasanFisik = computed(() => {
  const lines = secondary_surver_list.value.map((item) => {
    const organ = (item.label || item.organ).padEnd(12, ' ')
    let parts = []
    if (item.fields && item.schemaFields) {
      item.schemaFields.forEach((sf) => {
        const val = item.fields[sf.key]
        if (!val || (Array.isArray(val) && val.length === 0) || val === '') return
        const disp = Array.isArray(val)
          ? val.map((v) => sf.options?.find((x) => x.value === v)?.label || v).join(', ')
          : sf.options
            ? sf.options.find((x) => x.value === val)?.label || val
            : val
        parts.push(`${sf.label}: ${disp}`)
      })
    }
    const kondisi = parts.length > 0 ? parts.join(' | ') : item.kondisi || 'NORMAL'
    return `- ${organ}: ${kondisi}`
  })
  return 'Pemeriksaan Fisik Sekunder:\n' + lines.join('\n')
})

const copyRingkasan = () => {
  navigator.clipboard.writeText(ringkasanFisik.value).then(() => {
    ringkasanCopied.value = true
    setTimeout(() => {
      ringkasanCopied.value = false
    }, 2000)
  })
}

function getBadgeText(item) {
  if (!item.fields || !item.schemaFields) return item.kondisi || ''
  const parts = []
  for (const sf of item.schemaFields) {
    const val = item.fields[sf.key]
    if (val === null || val === undefined || val === '') continue
    if (Array.isArray(val) && val.length === 0) continue
    let display
    if (Array.isArray(val)) {
      display = val.map((v) => sf.options?.find((o) => o.value === v)?.label || v).join(', ')
    } else if (sf.options) {
      display = sf.options.find((o) => o.value === val)?.label || val
    } else {
      display = val
    }
    parts.push(`${sf.label}: ${display}`)
  }
  return parts.join(' | ')
}

const form = reactive({
  check_triase: [],
  nomr: '',
  noregister: '',
  waktu_masuk: '',
  diantar_oleh: '',
  transportasi: '',
  keluhan_utama: '',
  riwayat_penyakit_dahulu: '',
  riwayat_penyakit_sekarang: '',
  suhu: 0,
  tensi_sistol: 0,
  tensi_distol: 0,
  bb: 0,
  tb: 0,
  nadipermenit: 0,
  saturasi: 0,
  respirasi: 0,
  resiko_jatuh: 'TIDAK',
  status_psikologi: 'Tidak-masalah',
  dpjpSelected: { NAMADOKTER: '', KDDOKTER: '' },
  kesadaran: 'Composmetis',
  rencana_tindak_lanjut: '',
  survey: [],
  data_gizi: '',
  lokasinyeri: '',
  nyeri: 0,
  dpjp: '',
  id_client: id_client.value,
  status_hamil: false,
  gravida: null,
  para: null,
  abortus: null,
  usia_kehamilan_minggu: null,
  hpht_input: '',
  hpl: '',
  leopold_tfu: null,
  leopold_i: null,
  leopold_ii_punggung: null,
  leopold_ii_posisi: null,
  leopold_iii: null,
  leopold_iii_masuk: null,
  leopold_iv_metode: 'konvergensi',
  leopold_iv_konvergensi: null,
  leopold_iv_perlimaan: null,
  djj: null,
  djj_reguler: null,
})

const djjRegulerOpts = [
  { label: 'Reguler', value: 1 },
  { label: 'Ireguler', value: 0 },
]
const leopoldIFundusOpts = [
  { label: 'Kepala', value: 'kepala' },
  { label: 'Bokong', value: 'bokong' },
  { label: 'Tdk Teraba', value: 'tidak_teraba' },
]
const leopoldIIPunggungOpts = [
  { label: 'Ki', value: 'kiri' },
  { label: 'Ka', value: 'kanan' },
]
const leopoldIIPosisiOpts = [
  { label: 'Anterior', value: 'anterior' },
  { label: 'Posterior', value: 'posterior' },
]
const leopoldIIIBawahOpts = [
  { label: 'Kepala', value: 'kepala' },
  { label: 'Bokong', value: 'bokong' },
  { label: 'Lintang', value: 'lintang' },
]
const leopoldMasukPAPOpts = [
  { label: 'Sudah', value: 1 },
  { label: 'Belum', value: 0 },
]
const leopoldIVMetodeOpts = [
  { label: 'Konvergensi', value: 'konvergensi' },
  { label: 'Perlimaan', value: 'perlimaan' },
]
const leopoldIVKonvergensiOpts = [
  { label: 'Konvergen', value: 'konvergen' },
  { label: 'Sejajar', value: 'sejajar' },
  { label: 'Divergen', value: 'divergen' },
]
const leopoldIVPerlimaanOpts = [0, 1, 2, 3, 4, 5].map((v) => ({ label: `${v}/5`, value: v }))

// ── Computed ──────────────────────────────────────────────────────────────────
const nyeriPic = computed(() => {
  const n = form.nyeri
  if (n === 0) return 'https://ws-simrs.net/skala_nyeri/a.png'
  if (n >= 1 && n <= 3) return 'https://ws-simrs.net/skala_nyeri/b.png'
  if (n >= 4 && n <= 6) return 'https://ws-simrs.net/skala_nyeri/c.png'
  if (n >= 7 && n <= 9) return 'https://ws-simrs.net/skala_nyeri/d.png'
  return 'https://ws-simrs.net/skala_nyeri/e.png'
})

const nyeriButtons = computed(() => {
  const colorMap = [
    'nyeri-btn-0',
    'nyeri-btn-ringan',
    'nyeri-btn-ringan',
    'nyeri-btn-ringan',
    'nyeri-btn-sedang',
    'nyeri-btn-sedang',
    'nyeri-btn-sedang',
    'nyeri-btn-berat',
    'nyeri-btn-berat',
    'nyeri-btn-berat',
    'nyeri-btn-parah',
  ]
  const labelMap = [
    'Tidak',
    'Ringan',
    'Ringan',
    'Ringan',
    'Sedang',
    'Sedang',
    'Sedang',
    'Berat',
    'Berat',
    'Berat',
    'Parah',
  ]
  return Array.from({ length: 11 }, (_, i) => ({
    nilai: i,
    color: colorMap[i],
    label: labelMap[i],
  }))
})

const skorTriase = computed(() => {
  const checked = new Set(form.check_triase)
  let emergensi = 0,
    urgent = 0,
    nonUrgent = 0,
    doa = 0
  ;(fact.value || []).forEach((group) => {
    ;(group.details || []).forEach((det) => {
      if (det.val_1 && checked.has(det.val_1)) emergensi++
      if (det.val_2 && checked.has(det.val_2)) urgent++
      if (det.val_4 && checked.has(det.val_4)) nonUrgent++
      if (det.val_5 && checked.has(det.val_5)) doa++
    })
  })
  const total = emergensi + urgent + nonUrgent + doa
  let kategori = null,
    warna = ''
  if (emergensi > 0) {
    kategori = 'EMERGENSI'
    warna = 'triase-hasil-emergensi'
  } else if (doa > 0) {
    kategori = 'DEATH ON ARRIVAL'
    warna = 'triase-hasil-doa'
  } else if (urgent > 0) {
    kategori = 'URGENT'
    warna = 'triase-hasil-urgent'
  } else if (nonUrgent > 0) {
    kategori = 'NON URGENT'
    warna = 'triase-hasil-nonurgent'
  }
  return { emergensi, urgent, nonUrgent, doa, total, kategori, warna }
})

const showKehamilanSection = computed(() => {
  const jk = datapasien.value?.JENISKELAMIN
  const tahun = datapasien.value?.USIA_PASIEN?.tahun ?? 0
  return jk === 'P' && tahun >= 15
})

const todayStr = new Date().toISOString().split('T')[0]

const hplText = computed(() => {
  if (!form.hpht_input) return ''
  const d = new Date(form.hpht_input)
  if (isNaN(d.getTime())) return ''
  d.setDate(d.getDate() + 280)
  form.hpl = d.toISOString().split('T')[0]
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
})

const usiaKehamilanMinggu = computed(() => {
  if (!form.hpht_input) return null
  const hphtDate = new Date(form.hpht_input)
  if (isNaN(hphtDate.getTime())) return null
  const diff = Math.floor((Date.now() - hphtDate.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  const minggu = Math.floor(diff / 7)
  form.usia_kehamilan_minggu = minggu
  return minggu
})

const usiaKehamilanText = computed(() => {
  const m = usiaKehamilanMinggu.value
  return m !== null ? String(m) : ''
})

const usiaKehamilanHari = computed(() => {
  if (!form.hpht_input) return ''
  const hphtDate = new Date(form.hpht_input)
  if (isNaN(hphtDate.getTime())) return ''
  const diff = Math.floor((Date.now() - hphtDate.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Tanggal tidak valid'
  const sisa = diff % 7
  return sisa > 0 ? `+${sisa} hari` : ''
})

const leopoldVisible = computed(
  () => form.usia_kehamilan_minggu !== null && form.usia_kehamilan_minggu >= 20,
)
const leopoldMasukPAPVisible = computed(
  () => form.leopold_iii === 'kepala' || form.leopold_iii === 'bokong',
)
const leopoldIVVisible = computed(() => form.leopold_iii === 'kepala')
const djjWarning = computed(() => {
  const v = form.djj
  return v !== null && v > 0 && (v < 120 || v > 160)
})

const kehamilanText = computed(() => {
  if (!form.status_hamil) return ''
  const lines = []
  const g = form.gravida ?? '?',
    p = form.para ?? '?',
    a = form.abortus ?? '?'
  lines.push(`G${g}P${p}A${a}`)
  if (usiaKehamilanMinggu.value !== null)
    lines.push(`Usia Kehamilan  : ${usiaKehamilanMinggu.value} minggu`)
  if (hplText.value) lines.push(`HPL             : ${hplText.value}`)
  if (form.hpht_input) {
    const hd = new Date(form.hpht_input)
    if (!isNaN(hd.getTime()))
      lines.push(
        `HPHT            : ${hd.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      )
  }
  return 'Keterangan Kehamilan:\n' + lines.map((l) => '- ' + l).join('\n')
})

const leopoldText = computed(() => {
  if (!leopoldVisible.value) return ''
  const f = form
  const labelFundus = { kepala: 'Kepala', bokong: 'Bokong', tidak_teraba: 'Tidak teraba' }
  const labelPunggung = { kiri: 'Kiri', kanan: 'Kanan' }
  const labelPosisi = { anterior: 'Anterior', posterior: 'Posterior' }
  const labelBawah = { kepala: 'Kepala', bokong: 'Bokong', lintang: 'Lintang' }
  const labelKonv = { konvergen: 'Konvergen', sejajar: 'Sejajar', divergen: 'Divergen' }
  const lines = []
  if (f.leopold_tfu) lines.push(`TFU           : ${f.leopold_tfu} cm`)
  if (f.leopold_i)
    lines.push(
      `Leopold I     : Fundus teraba ${(labelFundus[f.leopold_i] || f.leopold_i).toLowerCase()}`,
    )
  const punggung = f.leopold_ii_punggung
    ? `Punggung ${labelPunggung[f.leopold_ii_punggung] || f.leopold_ii_punggung}`
    : null
  const posisi = f.leopold_ii_posisi
    ? `, posisi ${(labelPosisi[f.leopold_ii_posisi] || f.leopold_ii_posisi).toLowerCase()}`
    : ''
  if (punggung) lines.push(`Leopold II    : ${punggung}${posisi}`)
  else if (f.leopold_ii_posisi)
    lines.push(
      `Leopold II    : Posisi ${(labelPosisi[f.leopold_ii_posisi] || f.leopold_ii_posisi).toLowerCase()}`,
    )
  if (f.leopold_iii) {
    let l3 = `Presentasi ${(labelBawah[f.leopold_iii] || f.leopold_iii).toLowerCase()}`
    if (leopoldMasukPAPVisible.value && f.leopold_iii_masuk !== null)
      l3 += f.leopold_iii_masuk ? ', sudah masuk PAP' : ', belum masuk PAP'
    lines.push(`Leopold III   : ${l3}`)
  }
  if (leopoldIVVisible.value) {
    if (f.leopold_iv_metode === 'konvergensi' && f.leopold_iv_konvergensi)
      lines.push(
        `Leopold IV    : ${labelKonv[f.leopold_iv_konvergensi] || f.leopold_iv_konvergensi}`,
      )
    else if (f.leopold_iv_metode === 'perlimaan' && f.leopold_iv_perlimaan !== null)
      lines.push(`Leopold IV    : ${f.leopold_iv_perlimaan}/5`)
  }
  if (f.djj) {
    const irama = f.djj_reguler === 1 ? 'reguler' : f.djj_reguler === 0 ? 'ireguler' : ''
    lines.push(`DJJ           : ${f.djj} x/mnt${irama ? ', ' + irama : ''}`)
  }
  return lines.length ? 'Pemeriksaan Leopold:\n' + lines.map((l) => '- ' + l).join('\n') : ''
})

const obstetriText = computed(() =>
  [kehamilanText.value, leopoldText.value].filter(Boolean).join('\n\n'),
)

async function copyObstetriText() {
  if (!obstetriText.value) return
  try {
    await navigator.clipboard.writeText(obstetriText.value)
    toast.add({ severity: 'success', summary: 'Teks disalin ke clipboard', life: 2000 })
  } catch {
    toast.add({ severity: 'warn', summary: 'Gagal menyalin', life: 2000 })
  }
}

const leopoldWarnings = computed(() => {
  const warns = [],
    i = form.leopold_i,
    iii = form.leopold_iii,
    pap = form.leopold_iii_masuk
  if (i === 'tidak_teraba' && iii === 'kepala' && pap === 1)
    warns.push(
      'Kombinasi tidak lazim: fundus tidak teraba (I) namun presentasi kepala sudah masuk PAP (III).',
    )
  if (i === 'kepala' && iii === 'kepala')
    warns.push('Kombinasi tidak lazim: fundus dan presentasi terbawah sama-sama kepala.')
  if (i === 'bokong' && iii === 'bokong')
    warns.push('Kombinasi tidak lazim: fundus dan presentasi terbawah sama-sama bokong.')
  return warns
})

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  form.waktu_masuk = new Date()
  form.noregister = noregister
  fetchDataPasien()
  await getdatareferensi()
  fetchData()
})

// ── Methods ────────────────────────────────────────────────────────────────────
async function fetchDataPasien() {
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`,
      {
        mod: 1,
        noregister,
        id_client: id_client.value,
      },
    )
    if (res.data.response?.length > 0) {
      datapasien.value = res.data.response[0]
      form.dpjp = datapasien.value.NAMADOKTER || ''
    }
  } catch (e) {
    console.error('fetchDataPasien:', e)
  }
}

function pilihNyeri(nilai) {
  form.nyeri = nilai
}

function set_datetime_now() {
  form.waktu_masuk = new Date()
}

function call_oto() {
  showOtorisasi.value = true
}

function handleOtpVerified() {
  showOtorisasi.value = false
}

function open(type, msg) {
  const severity = type === 'warning' ? 'warn' : type
  const summary = severity === 'success' ? 'Berhasil' : severity === 'warn' ? 'Perhatian' : 'Error'
  toast.add({ severity, summary, detail: msg, life: 4000 })
}

function validasi() {
  if (!form.diantar_oleh?.code) {
    open('warning', 'Cara Masuk pasien belum dipilih')
    return false
  }
  if (!form.transportasi?.id) {
    open('warning', 'Transportasi pasien belum dipilih')
    return false
  }
  if (form.nyeri > 0 && !form.lokasinyeri?.trim()) {
    open('warning', 'Lokasi nyeri wajib diisi jika skor nyeri > 0')
    return false
  }
  return true
}

function filled_load_header(data) {
  form.waktu_masuk = data.waktu
  form.diantar_oleh =
    caradatang.value.find((x) => x.code == data.id_diantar_oleh) ||
    caradatang.value.find((x) => x.diantar_oleh == data.diantar_oleh) ||
    null
  form.transportasi =
    transportasi.value.find((x) => x.id == data.id_transportasi) ||
    transportasi.value.find((x) => x.transportasi == data.transportasi) ||
    null
  form.rencana_tindak_lanjut = { STATUS: data.STATUS, KETERANGAN: data.KETERANGAN }
  form.dpjpSelected = { KDDOKTER: data.dokter_sp, NAMADOKTER: data.namadokter_sp }
  if (data.code === 200) {
    form.keluhan_utama = data.keluhan_utama
    form.suhu = data.suhu
    form.tensi_sistol = data.tensi_sistol
    form.tensi_distol = data.tensi_distol
    form.nadipermenit = data.nadipermenit
    form.saturasi = data.saturasi
    form.respirasi = data.respirasi
    form.bb = data.bb
    form.tb = data.tb
    form.riwayat_penyakit_dahulu = data.riwayat_penyakit_dahulu
    form.riwayat_penyakit_sekarang = data.riwayat_penyakit_sekarang ?? ''
    form.resiko_jatuh = data.resiko_jatuh
    form.status_psikologi = data.status_psikologi
    form.kesadaran = data.kesadaran
    stts_verif.value = `${data.telah_verif} ${data.jam_verif}`
    form.nyeri = parseInt(data.nyeri) || 0
    form.lokasinyeri = data.lokasinyeri
    form.status_hamil = !!data.status_hamil
    form.gravida = data.gravida ?? null
    form.para = data.para ?? null
    form.abortus = data.abortus ?? null
    form.usia_kehamilan_minggu = data.usia_kehamilan_minggu ?? null
    form.hpl = data.hpl && data.hpl !== '0000-00-00' ? data.hpl : ''
    form.leopold_tfu = data.leopold_tfu ?? null
    form.leopold_i = data.leopold_i ?? null
    form.leopold_ii_punggung = data.leopold_ii_punggung ?? null
    form.leopold_ii_posisi = data.leopold_ii_posisi ?? null
    form.leopold_iii = data.leopold_iii ?? null
    form.leopold_iii_masuk = data.leopold_iii_masuk ?? null
    form.leopold_iv_metode = data.leopold_iv_metode ?? 'konvergensi'
    form.leopold_iv_konvergensi = data.leopold_iv_konvergensi ?? null
    form.leopold_iv_perlimaan = data.leopold_iv_perlimaan ?? null
    form.djj = data.djj ?? null
    form.djj_reguler = data.djj_reguler ?? null
  }
}

function initdata() {
  try {
    for (const group of fact.value) {
      for (const det of group.details) {
        if (det.checked_val_1) form.check_triase.push(det.val_1)
        if (det.checked_val_2) form.check_triase.push(det.val_2)
        if (det.checked_val_3) form.check_triase.push(det.val_3)
        if (det.checked_val_4) form.check_triase.push(det.val_4)
        if (det.checked_val_5) form.check_triase.push(det.val_5)
      }
    }
  } catch (e) {
    console.error(e.message)
  }
}

async function getdatareferensi() {
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/getref_triase`,
      { id_client: id_client.value },
    )
    caradatang.value = res.data.response.diantar
    transportasi.value = res.data.response.transport
  } catch (e) {
    console.log(e)
  }
}

async function fetchData() {
  isLoading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/getitem_triase`,
      form,
    )
    fact.value = res.data.response
    nilai_triase.value = res.data.nilatriase
    if (res.data.survey?.length > 0) {
      const saved = res.data.survey
      secondary_surver_list.value = secondary_surver_list.value.map((defaultItem) => {
        const found = saved.find((s) => s.id === defaultItem.id || s.organ === defaultItem.organ)
        if (!found) return defaultItem
        return {
          ...defaultItem,
          kondisi: found.kondisi ?? defaultItem.kondisi,
          fields: found.fields ?? defaultItem.fields,
        }
      })
    }
    filled_load_header(res.data.header)
    initdata()
  } catch (e) {
    console.log(e)
  } finally {
    isLoading.value = false
  }
}

function toDatetimeStr(d) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const z = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${z(dt.getMonth() + 1)}-${z(dt.getDate())} ${z(dt.getHours())}:${z(dt.getMinutes())}:${z(dt.getSeconds())}`
}

async function input_header_triase() {
  const skor = skorTriase.value
  const payload = {
    ...form,
    survey: secondary_surver_list.value,
    nomr: datapasien.value?.NOMR || '',
    waktu: toDatetimeStr(form.waktu_masuk),
    diantar_oleh: form.diantar_oleh?.code ?? '',
    transportasi: form.transportasi?.id ?? '',
    rencana_tindak_lanjut: form.rencana_tindak_lanjut?.KETERANGAN || '',
    rencana_tindak_lanjut_code: form.rencana_tindak_lanjut?.STATUS || '',
    dokter_sp: form.dpjpSelected?.KDDOKTER || '',
    namadokter_sp: form.dpjpSelected?.NAMADOKTER || '',
    user_id: configStore.user_id || localStorage.getItem('user_id') || '',
    data_gizi: gizi_form.value?.getValue(),
    hasil_triase_kategori: skor.kategori || '',
    hasil_triase_emergensi: skor.emergensi || 0,
    hasil_triase_urgent: skor.urgent || 0,
    hasil_triase_nonurgent: skor.nonUrgent || 0,
    hasil_triase_doa: skor.doa || 0,
    hasil_triase_total: skor.total || 0,
  }
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/input_header_triase`,
      payload,
    )
    console.log('input_header_triase response:', res.data)
  } catch (e) {
    console.log(e)
  }
}

async function simpan() {
  if (!validasi()) return
  isLoading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/simpan_triase`,
      form,
    )

    if (res.data.metadata.code === 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data triase IGD berhasil disimpan',
        life: 3000,
      })
      await input_header_triase()
    } else {
      open('warning', res.data.metadata.message || 'Gagal menyimpan data triase')
    }
  } catch (e) {
    console.log(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ===== PRIMEVUE CARD COMPACT ===== */
:deep(.p-card) {
  border-radius: 6px;
}
:deep(.p-card-header) {
  padding: 0;
  border-bottom: 1px solid #dee2e6;
}
:deep(.p-card-body) {
  padding: 0;
}
:deep(.p-card-content) {
  padding: 0.6rem 0.85rem;
}

/* ===== CARD HEADER TITLE ===== */
.card-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #344767;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.card-section-title i {
  font-size: 0.85rem;
  color: #4f8f7a;
}

/* ===== VITAL SIGN CARDS ===== */
.vital-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.6rem;
  align-items: start;
}
.vital-card {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #fff;
  padding: 0.55rem 0.65rem 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.vital-card--td {
  grid-column: span 2;
}
.vital-card-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.3rem;
}
.vital-hint {
  font-size: 0.65rem;
  color: #adb5bd;
  text-align: center;
}
@media (max-width: 768px) {
  .vital-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .vital-card--td {
    grid-column: span 2;
  }
}

/* ===== ANAMNESE SECTION ===== */
.anamnese-body .form-label-custom {
  font-size: 0.95rem;
}
.anamnese-body :deep(textarea) {
  font-size: 0.95rem;
  line-height: 1.6;
}

/* ===== FORM LABEL ===== */
.form-label-custom {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ===== TRIASE STAT CARDS ===== */
.triase-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 10px;
  padding: 14px 18px;
  color: #fff;
  margin-bottom: 8px;
}
.triase-stat-icon {
  font-size: 1.8rem;
  opacity: 0.85;
}
.triase-stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}
.triase-stat-label {
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 2px;
}
.triase-emergensi {
  background: linear-gradient(135deg, #b71c1c, #ef5350);
}
.triase-urgent {
  background: linear-gradient(135deg, #e65100, #ffa726);
}
.triase-nonurgent {
  background: linear-gradient(135deg, #1b5e20, #43a047);
}
.triase-doa {
  background: linear-gradient(135deg, #212121, #616161);
}

/* ===== HASIL SKOR TRIASE BAR ===== */
.triase-hasil-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
}
.triase-hasil-left {
  display: flex;
  align-items: center;
}
.triase-hasil-label {
  opacity: 0.85;
}
.triase-hasil-kategori {
  font-size: 1.1rem;
  letter-spacing: 0.04em;
}
.triase-hasil-rincian {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.triase-hasil-emergensi {
  background: #ffebee;
  color: #b71c1c;
  border: 2px solid #ef5350;
}
.triase-hasil-urgent {
  background: #fff3e0;
  color: #e65100;
  border: 2px solid #ffa726;
}
.triase-hasil-nonurgent {
  background: #e8f5e9;
  color: #1b5e20;
  border: 2px solid #43a047;
}
.triase-hasil-doa {
  background: #f5f5f5;
  color: #212121;
  border: 2px solid #616161;
}
.triase-hasil-kosong {
  background: #f8f9fa;
  color: #888;
  border: 2px dashed #dee2e6;
}
.rincian-chip {
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.78rem;
}
.chip-e {
  background: #c62828;
  color: #fff;
}
.chip-u {
  background: #f57c00;
  color: #fff;
}
.chip-n {
  background: #2e7d32;
  color: #fff;
}
.chip-d {
  background: #424242;
  color: #fff;
}
.chip-total {
  background: #1565c0;
  color: #fff;
}

/* ===== RADIO GRID ===== */
.radio-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
}
.radio-grid .field-radiobutton {
  display: flex;
  align-items: center;
}

/* ===== SKALA NYERI ===== */
.nyeri-score-box {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #1565c0;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 4px;
}
.nyeri-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
.nyeri-0 {
  background: #4caf50;
}
.nyeri-ringan {
  background: #8bc34a;
}
.nyeri-sedang {
  background: #ffc107;
}
.nyeri-berat {
  background: #ff5722;
}
.nyeri-parah {
  background: #b71c1c;
}
.nyeri-radio-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.nyeri-radio-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  border: 2px solid transparent;
  min-width: 52px;
  transition: all 0.15s;
  user-select: none;
}
.nyeri-radio-label:hover {
  filter: brightness(0.92);
}
.nyeri-radio-number {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
}
.nyeri-radio-desc {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 2px;
  text-transform: uppercase;
}
.nyeri-btn-0 {
  background: #43a047;
  border-color: #2e7d32;
}
.nyeri-btn-ringan {
  background: #8bc34a;
  border-color: #558b2f;
}
.nyeri-btn-sedang {
  background: #ffa726;
  border-color: #e65100;
}
.nyeri-btn-berat {
  background: #ef5350;
  border-color: #b71c1c;
}
.nyeri-btn-parah {
  background: #b71c1c;
  border-color: #7f0000;
}
.nyeri-active {
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 5px rgba(0, 0, 0, 0.5);
  transform: scale(1.12);
}
.nyeri-radio-label:not(.nyeri-active) {
  opacity: 0.65;
}
.nyeri-legend-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #dee2e6;
  font-size: 0.8rem;
  color: #555;
}

/* ===== TABEL TRIASE ===== */
.triase-table thead th {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: middle;
}
.th-emergensi {
  background: #c62828;
  color: #fff;
}
.th-urgent {
  background: #f57c00;
  color: #fff;
}
.th-nonurgent {
  background: #2e7d32;
  color: #fff;
}
.th-doa {
  background: #212121;
  color: #fff;
}
.triase-table td {
  vertical-align: top;
  padding: 10px;
}
.td-grouping {
  background: #f8f9fa;
  font-weight: 700;
  vertical-align: middle !important;
}
.triase-table .field-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

/* ===== SURVEY TABLE ===== */
.survey-table thead th {
  background: #f8f9fa;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: middle;
}
.survey-table tbody tr:hover {
  background: #e3f2fd !important;
}

/* ===== KARTU KEHAMILAN ===== */
:deep(.p-card).hamil-card-primevue {
  border-top: 3px solid #1976d2;
}
.hamil-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
}
.hamil-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.hamil-card-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1976d2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.hamil-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 20px;
  background: #1976d2;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
}
.hamil-card-body {
  padding: 10px 14px 12px;
}
.hamil-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1.5px solid #dee2e6;
  background: #f8f9fa;
  transition:
    background 0.18s,
    border-color 0.18s;
  user-select: none;
  margin: 0;
}
.hamil-toggle-row:hover {
  background: #e3f2fd;
  border-color: #90caf9;
}
.hamil-toggle-row--on {
  background: linear-gradient(90deg, #e3f2fd, #f0f7ff);
  border-color: #90caf9;
}
.hamil-toggle-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hamil-toggle-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e3f2fd;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition:
    background 0.2s,
    color 0.2s;
  flex-shrink: 0;
}
.hamil-toggle-row--on .hamil-toggle-icon {
  background: #1976d2;
  color: #fff;
}
.hamil-toggle-text {
  font-weight: 700;
  font-size: 0.82rem;
  color: #333;
}
.hamil-toggle-hint {
  font-size: 0.7rem;
  color: #888;
  margin-top: 2px;
}
.hamil-expand-enter-active,
.hamil-expand-leave-active {
  transition:
    opacity 0.25s ease,
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.hamil-expand-enter-from,
.hamil-expand-leave-to {
  opacity: 0;
  max-height: 0 !important;
}
.hamil-expand-enter-to,
.hamil-expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}
.hamil-detail-panel {
  margin-top: 10px;
  padding: 12px 14px 10px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}
.hamil-sub-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #1565c0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
  padding-bottom: 7px;
  border-bottom: 1px solid #dee2e6;
}
.hamil-fields-grid {
  display: grid;
  grid-template-columns: 3fr 1.5fr 2.5fr 2.5fr;
  gap: 10px;
  align-items: start;
}
.hamil-field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.hamil-field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1565c0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.hamil-date-input {
  flex: 1;
  min-width: 0;
  border: none;
  border-left: 1px solid #ced4da;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  outline: none;
  background: #fff;
}
.hamil-hpht-input {
  flex: 1;
  min-width: 0;
  border: none;
  border-left: 1px solid #ced4da;
  padding: 0.4rem 0.6rem;
  font-size: 0.82rem;
  background: #f8f9fa;
  color: #555;
}

/* ===== LEOPOLD ===== */
.leopold-section {
}
.leopold-header {
  font-size: 0.78rem;
  font-weight: 700;
  color: #344767;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-bottom: 6px;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 8px;
}
.leopold-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.leopold-item {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.leopold-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.leopold-card {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}
.leopold-card--disabled {
  opacity: 0.5;
  pointer-events: none;
}
.leopold-roman {
  background: #1976d2;
  color: #fff;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 4px;
}
.leopold-card-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.djj-warning :deep(.p-inputgroup) {
  border-color: #dc3545 !important;
}
.leopold-summary {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}
.leopold-summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 0.75rem;
  font-weight: 700;
  color: #344767;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.leopold-summary-text {
  margin: 0;
  padding: 10px 12px;
  font-size: 0.78rem;
  line-height: 1.6;
  color: #333;
  background: #fff;
  white-space: pre-wrap;
  font-family: monospace;
}
@media (max-width: 768px) {
  .hamil-fields-grid {
    grid-template-columns: 1fr 1fr;
  }
  .leopold-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ===== QR VERIF ===== */
.qr-verif-wrap {
  display: flex;
}
.qr-verif-card {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

/* ===== STICKY FOOTER ===== */
.igd-sticky-footer {
  position: fixed;
  bottom: 0;
  left: 250px;
  right: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  padding: 0.55rem 1.5rem;
  box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  transition: left 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.igd-sticky-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}
.igd-sticky-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #344767;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.igd-sticky-loading {
  font-size: 0.75rem;
  color: #16a34a;
  font-weight: 500;
}
.igd-sticky-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.igd-sticky-btn {
  font-size: 0.8rem !important;
  padding: 0.35rem 1rem !important;
  border-radius: 20px !important;
}

/* padding agar konten tidak tertutup sticky footer */
:deep(.content) {
  padding-bottom: 70px;
}

/* ===== SECONDARY SURVEY ===== */
:deep(.ss-accordion .p-accordionpanel) {
  margin-bottom: 6px;
}
:deep(.ss-accordion .p-accordionheader) {
  gap: 8px;
}
:deep(.ss-accordion .p-accordioncontent-content) {
  padding: 10px 14px;
}
.ss-acc-icon {
  font-size: 0.78rem;
  flex-shrink: 0;
}
.ss-acc-label {
  flex: 1;
}
.ss-acc-badge {
  font-size: 0.68rem;
  font-weight: 600;
  background: var(--p-primary-50, #e8f5e9);
  color: var(--p-primary-color, #00897b);
  border: 1px solid var(--p-primary-200, #a5d6a7);
  border-radius: 4px;
  padding: 1px 7px;
}
.ss-organ-body {
  padding: 10px 14px;
}
.ss-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  flex-wrap: wrap;
}
.ss-field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  min-width: 100px;
  flex-shrink: 0;
}
.ss-field-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}
.ss-opt-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.88rem;
  cursor: pointer;
  margin: 0;
}
.ss-text-input {
  flex: 1;
  min-width: 60px;
  font-size: 0.88rem;
  height: 32px;
}
.ss-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}
.ss-btn-opt {
  padding: 3px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--p-primary-color);
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  line-height: 1.7;
}
.ss-btn-opt:hover {
  background: var(--p-primary-50, #e8f5e9);
}
.ss-btn-active {
  background: var(--p-primary-color) !important;
  color: var(--p-primary-contrast-color, #fff) !important;
}
.ss-ringkasan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.ss-ringkasan-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>

<style>
body.sb-collapsed .igd-sticky-footer {
  left: 64px;
}
@media (max-width: 768px) {
  .igd-sticky-footer {
    left: 0 !important;
    padding: 0.5rem 1rem;
  }
}
</style>
