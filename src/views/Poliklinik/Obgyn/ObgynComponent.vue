<template>
  <Toast />

  <RiwayatKunjunganObgynModal v-model:visible="showRiwayat" :datapasien="datapasien" />

  <div class="obgyn-wrapper">
    <!-- ══ Banner kunjungan sebelumnya ══ -->
    <div v-if="isFromPrevVisit" class="prev-banner">
      <div class="prev-banner__icon"><i class="pi pi-history"></i></div>
      <div class="prev-banner__body">
        <span class="prev-banner__title">Data Kunjungan Sebelumnya</span>
        <span class="prev-banner__sub">
          Ditampilkan dari kunjungan
          <strong v-if="prevVisitDate">{{ formatTanggal(prevVisitDate) }}</strong
          >. Simpan untuk mencatat perubahan pada kunjungan ini.
        </span>
      </div>
    </div>

    <!-- ══ Banner draft belum disimpan ══ -->
    <div v-if="hasDraft" class="draft-banner">
      <div class="draft-banner__icon"><i class="pi pi-pencil"></i></div>
      <div class="draft-banner__body">
        <span class="draft-banner__title">Data belum disimpan</span>
        <span class="draft-banner__sub"
          >Perubahan tersimpan otomatis di perangkat ini. Klik
          <strong>Simpan Data OBGYN</strong> untuk menyimpan ke server.</span
        >
      </div>
    </div>

    <!-- ══ Banner data telah disimpan ══ -->
    <div v-if="lastSaved && !hasDraft" class="saved-banner">
      <div class="saved-banner__icon"><i class="pi pi-check-circle"></i></div>
      <div class="saved-banner__body">
        <span class="saved-banner__title">Data telah disimpan</span>
        <span class="saved-banner__sub">
          Tersimpan pada <strong>{{ formatWaktu(lastSaved.time) }}</strong> — {{ lastSaved.detail }}
        </span>
      </div>
    </div>

    <!-- ══ Header — Pilih Kategori ══ -->
    <Panel>
      <template #header>
        <div class="sec-hdr">
          <div class="sec-hdr__icon teal"><i class="pi pi-heart-fill"></i></div>
          <div>
            <div class="sec-hdr__title">OBSTETRI &amp; GINEKOLOGI</div>
            <div class="sec-hdr__sub">Pilih kategori pemeriksaan</div>
          </div>
        </div>
      </template>
      <template #icons>
        <div class="header-actions">
          <div class="status-tags">
            <Tag
              v-if="kategori"
              :value="kategori"
              :severity="kategori === 'OBSTETRI' ? 'info' : 'help'"
            />
            <Tag
              v-if="kategori === 'OBSTETRI' && usiaKehamilan"
              severity="contrast"
              :value="`UK: ${usiaKehamilan} mgg`"
            />
            <Tag
              v-if="kategori === 'OBSTETRI' && form.djj"
              :severity="form.djj >= 110 && form.djj <= 160 ? 'success' : 'danger'"
              :value="`DJJ: ${form.djj} bpm`"
            />
          </div>
          <Button
            icon="pi pi-history"
            label="Riwayat Kunjungan"
            severity="secondary"
            outlined
            size="small"
            class="btn-history"
            @click="showRiwayat = true"
          />
        </div>
      </template>

      <div class="cat-grid">
        <label class="cat-card" :class="{ 'cat-card--obs': kategori === 'OBSTETRI' }">
          <RadioButton
            v-model="kategori"
            inputId="cat_obstetri"
            value="OBSTETRI"
            name="kategori"
            class="cat-radio"
          />
          <div class="cat-card__icon obs"><i class="pi pi-heart-fill"></i></div>
          <div class="cat-card__body">
            <div class="cat-card__title">OBSTETRI</div>
            <div class="cat-card__sub">GPA · Leopold · DJJ · ANC · Skrining Risiko</div>
          </div>
          <i v-if="kategori === 'OBSTETRI'" class="pi pi-check-circle cat-card__check"></i>
        </label>
        <label class="cat-card" :class="{ 'cat-card--gine': kategori === 'GINEKOLOGI' }">
          <RadioButton
            v-model="kategori"
            inputId="cat_ginekologi"
            value="GINEKOLOGI"
            name="kategori"
            class="cat-radio"
          />
          <div class="cat-card__icon gine"><i class="pi pi-star-fill"></i></div>
          <div class="cat-card__body">
            <div class="cat-card__title">GINEKOLOGI</div>
            <div class="cat-card__sub">KB · Spekulum · Bimanual · Riwayat Penyakit</div>
          </div>
          <i v-if="kategori === 'GINEKOLOGI'" class="pi pi-check-circle cat-card__check gine"></i>
        </label>
      </div>
    </Panel>

    <!-- ══════════════ OBSTETRI ══════════════ -->
    <div v-if="kategori === 'OBSTETRI'" class="section-group">
      <!-- ── Data Kehamilan ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon teal"><i class="pi pi-calendar"></i></div>
            <div>
              <div class="sec-hdr__title">DATA KEHAMILAN</div>
              <div class="sec-hdr__sub">Status GPA · HPHT · HPL · Usia Kehamilan</div>
            </div>
          </div>
        </template>

        <div class="fl-label">
          Status Obstetri (GPA)
          <span class="fl-hint">G = Gravida &nbsp;·&nbsp; P = Para &nbsp;·&nbsp; A = Abortus</span>
        </div>
        <div class="gpa-row">
          <div class="gpa-col">
            <div class="gpa-col__lbl">G — Gravida</div>
            <InputNumber
              v-model="form.gravida"
              :min="0"
              :max="20"
              showButtons
              buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              class="gpa-counter"
            />
          </div>
          <div class="gpa-col">
            <div class="gpa-col__lbl">P — Para</div>
            <InputNumber
              v-model="form.para"
              :min="0"
              :max="20"
              showButtons
              buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              class="gpa-counter"
            />
          </div>
          <div class="gpa-col">
            <div class="gpa-col__lbl">A — Abortus</div>
            <InputNumber
              v-model="form.abortus"
              :min="0"
              :max="20"
              showButtons
              buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              class="gpa-counter"
            />
          </div>
          <div class="gpa-col gpa-col--result">
            <div class="gpa-col__lbl">Status GPA</div>
            <div class="gpa-result">
              G{{ form.gravida ?? 0 }}P{{ form.para ?? 0 }}A{{ form.abortus ?? 0 }}
            </div>
          </div>
        </div>

        <div class="field-divider" />

        <div class="row align-items-end g-3 mt-0">
          <div class="col-md-4">
            <div class="fl-label">HPHT <span class="fl-hint">Hari Pertama Haid Terakhir</span></div>
            <DatePicker
              v-model="form.hpht"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Pilih tanggal HPHT"
              style="width: 100%"
              @date-select="hitungHPL"
            />
          </div>
          <div class="col-md-4">
            <div class="fl-label">HPL <span class="fl-hint">Otomatis dari HPHT</span></div>
            <div class="info-card teal">
              <i class="pi pi-calendar-clock info-card__icon"></i>
              <div>
                <div class="info-card__val">{{ form.hpl ? formatTanggal(form.hpl) : '—' }}</div>
                <div class="info-card__sub">Hari Perkiraan Lahir</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="fl-label">Usia Kehamilan</div>
            <div class="info-card blue">
              <i class="pi pi-clock info-card__icon"></i>
              <div>
                <div class="info-card__val">
                  {{ usiaKehamilan ?? '—' }} <span class="info-card__unit">minggu</span>
                </div>
                <div class="info-card__sub">
                  <span
                    v-if="trimester"
                    class="trim-pill"
                    :class="trimester === 1 ? 'trim-1' : trimester === 2 ? 'trim-2' : 'trim-3'"
                  >
                    Trimester {{ trimester }}
                  </span>
                  <span v-else>Belum diisi HPHT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ── Riwayat Kehamilan & Persalinan ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon indigo"><i class="pi pi-list"></i></div>
            <div>
              <div class="sec-hdr__title">RIWAYAT KEHAMILAN &amp; PERSALINAN</div>
              <div class="sec-hdr__sub">Daftar kehamilan dan persalinan sebelumnya</div>
            </div>
          </div>
        </template>
        <template #icons>
          <Button
            icon="pi pi-plus"
            label="Tambah Baris"
            size="small"
            class="btn-add"
            @click="tambahBaris"
          />
        </template>

        <div v-if="riwayatPersalinan.length === 0" class="empty-state">
          <i class="pi pi-inbox empty-state__icon"></i>
          <div class="empty-state__text">Belum ada riwayat persalinan</div>
          <div class="empty-state__sub">
            Klik <strong>Tambah Baris</strong> untuk menambahkan data
          </div>
        </div>
        <div v-else class="table-responsive">
          <table class="pro-table">
            <thead>
              <tr>
                <th style="width: 36px">#</th>
                <th style="width: 78px">Tahun</th>
                <th style="width: 105px">Usia Kehamilan</th>
                <th style="width: 145px">Jenis Persalinan</th>
                <th style="width: 120px">Penolong</th>
                <th style="width: 115px">BB Lahir (g)</th>
                <th style="width: 130px">Kondisi Bayi</th>
                <th>Komplikasi / Keterangan</th>
                <th style="width: 44px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in riwayatPersalinan" :key="idx">
                <td class="text-center fw-bold text-muted">{{ idx + 1 }}</td>
                <td>
                  <InputNumber
                    v-model="row.tahun"
                    placeholder="2022"
                    :min="1950"
                    :max="2030"
                    :useGrouping="false"
                    class="riwayat-input"
                  />
                </td>
                <td>
                  <InputGroup>
                    <InputNumber
                      v-model="row.usiaKehamilan"
                      placeholder="38"
                      :min="20"
                      :max="45"
                      class="riwayat-input"
                    />
                    <InputGroupAddon style="font-size: 11px; padding: 0 6px">mgg</InputGroupAddon>
                  </InputGroup>
                </td>
                <td>
                  <Select
                    v-model="row.jenisPersalinan"
                    :options="optJenisPersalinan"
                    placeholder="Pilih"
                    style="width: 100%"
                    class="riwayat-select"
                  />
                </td>
                <td>
                  <Select
                    v-model="row.penolong"
                    :options="optPenolong"
                    placeholder="Pilih"
                    style="width: 100%"
                    class="riwayat-select"
                  />
                </td>
                <td>
                  <InputNumber
                    v-model="row.bbLahir"
                    placeholder="3000"
                    :min="0"
                    :max="6000"
                    class="riwayat-input"
                  />
                </td>
                <td>
                  <Select
                    v-model="row.kondisiBayi"
                    :options="['Hidup', 'Meninggal', 'Lahir Mati']"
                    placeholder="Pilih"
                    style="width: 100%"
                    class="riwayat-select"
                  />
                </td>
                <td>
                  <InputText
                    v-model="row.komplikasi"
                    placeholder="Preeklamsia, perdarahan…"
                    style="width: 100%"
                    class="riwayat-input"
                  />
                </td>
                <td class="text-center">
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    @click="hapusBaris(idx)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <!-- ── Leopold & DJJ ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon emerald"><i class="pi pi-search"></i></div>
            <div>
              <div class="sec-hdr__title">PEMERIKSAAN LEOPOLD &amp; DJJ</div>
              <div class="sec-hdr__sub">Palpasi abdomen · Denyut Jantung Janin · TBJ</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-3">
            <div class="fl-label">
              Leopold I — TFU <span class="fl-hint">Simfisis → Fundus</span>
            </div>
            <InputGroup>
              <InputNumber
                v-model="form.tfu"
                placeholder="Tinggi fundus"
                :min="0"
                :max="45"
                :minFractionDigits="1"
              />
              <InputGroupAddon>cm</InputGroupAddon>
            </InputGroup>
          </div>
          <div class="col-md-3">
            <div class="fl-label">Leopold II — Presentasi</div>
            <Select
              v-model="form.leopold2"
              :options="optLeopold2"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih presentasi"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Leopold III — Terbawah</div>
            <Select
              v-model="form.leopold3"
              :options="optLeopold3"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih bagian"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Leopold IV — Penurunan</div>
            <Select
              v-model="form.leopold4"
              :options="optLeopold4"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih penurunan"
              style="width: 100%"
            />
          </div>
        </div>

        <div class="field-divider" />

        <div class="row g-3">
          <div class="col-md-3">
            <div class="fl-label">DJJ <span class="fl-hint">Normal: 110–160 bpm</span></div>
            <InputGroup>
              <InputNumber v-model="form.djj" placeholder="120–160" :min="60" :max="200" />
              <InputGroupAddon>bpm</InputGroupAddon>
            </InputGroup>
            <div v-if="form.djj" class="mt-2">
              <Tag
                :severity="form.djj >= 110 && form.djj <= 160 ? 'success' : 'danger'"
                :value="form.djj >= 110 && form.djj <= 160 ? '✓ Normal' : '⚠ Abnormal'"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="fl-label">
              TBJ — Taksiran Berat Janin <span class="fl-hint">(TFU – 11) × 155</span>
            </div>
            <div class="info-card green">
              <i class="pi pi-weight info-card__icon"></i>
              <div>
                <div class="info-card__val">
                  {{ tbjDisplay || '—' }}
                  <span v-if="tbjDisplay" class="info-card__unit">gram</span>
                </div>
                <div class="info-card__sub">Rumus Johnson</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="fl-label">Kontraksi</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Tidak ada', 'Braxton Hicks', 'His Reguler']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.kontraksi === opt }"
              >
                <RadioButton
                  v-model="form.kontraksi"
                  :value="opt"
                  name="kontraksi"
                  class="sr-only"
                />
                {{ opt }}
              </label>
            </div>
          </div>
          <div class="col-md-3">
            <div class="fl-label">Gerakan Janin</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Aktif', 'Kurang Aktif', 'Tidak Terasa']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.gerakanJanin === opt }"
              >
                <RadioButton
                  v-model="form.gerakanJanin"
                  :value="opt"
                  name="gerakanJanin"
                  class="sr-only"
                />
                {{ opt }}
              </label>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ── ANC, Imunisasi TT & Suplemen ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon sky"><i class="pi pi-shield"></i></div>
            <div>
              <div class="sec-hdr__title">ANC, IMUNISASI TT &amp; SUPLEMEN</div>
              <div class="sec-hdr__sub">Antenatal Care · Status imunisasi · Suplemen harian</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-3">
            <div class="fl-label">Kunjungan ANC Ke-</div>
            <InputGroup>
              <InputNumber v-model="form.kunjunganAnc" placeholder="1" :min="1" :max="20" />
              <InputGroupAddon>kunjungan</InputGroupAddon>
            </InputGroup>
          </div>
          <div class="col-md-4">
            <div class="fl-label">Tempat ANC</div>
            <InputText
              v-model="form.tempatAnc"
              placeholder="Puskesmas, RS, Bidan…"
              style="width: 100%"
            />
          </div>
          <div class="col-md-5">
            <div class="fl-label">Status Imunisasi TT</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Belum', 'TT1', 'TT2', 'TT3', 'TT4', 'TT5']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.statusTT === opt }"
              >
                <RadioButton v-model="form.statusTT" :value="opt" name="statusTT" class="sr-only" />
                {{ opt }}
              </label>
            </div>
          </div>
        </div>
        <div class="field-divider" />
        <div class="fl-label">Suplemen yang Dikonsumsi</div>
        <div class="check-pill-group mt-1">
          <label
            v-for="sup in optSuplemen"
            :key="sup"
            class="check-pill"
            :class="{ 'check-pill--active': form.suplemen.includes(sup) }"
          >
            <input type="checkbox" :value="sup" v-model="form.suplemen" class="sr-only" />
            <i class="pi pi-check check-pill__icon"></i>
            {{ sup }}
          </label>
        </div>
      </Panel>

      <!-- ── Skrining Risiko & Penunjang ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon amber"><i class="pi pi-exclamation-triangle"></i></div>
            <div>
              <div class="sec-hdr__title">SKRINING RISIKO &amp; PEMERIKSAAN PENUNJANG</div>
              <div class="sec-hdr__sub">Edema · Protein Urin · Air Ketuban · USG</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-4">
            <div class="fl-label">Edema</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Tidak ada', 'Pretibial', 'Tungkai', 'Wajah', 'Anasarka']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.edema === opt }"
              >
                <RadioButton v-model="form.edema" :value="opt" name="edema" class="sr-only" />
                {{ opt }}
              </label>
            </div>
          </div>
          <div class="col-md-4">
            <div class="fl-label">Protein Urin <span class="fl-hint">Dipstick</span></div>
            <Select
              v-model="form.proteinUrin"
              :options="['Negatif', 'Trace', '+1', '+2', '+3', '+4']"
              placeholder="Pilih hasil"
              style="width: 100%"
            />
          </div>
          <div class="col-md-4">
            <div class="fl-label">
              Trend Tekanan Darah <span class="fl-hint">Kunjungan sebelumnya</span>
            </div>
            <InputText
              v-model="form.trendTD"
              placeholder="cth: 120/80 → 140/90"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="row g-3 mt-0">
          <div class="col-md-4">
            <div class="fl-label">Air Ketuban</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Oligohidramnion', 'Normal', 'Polihidramnion']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.airKetuban === opt }"
              >
                <RadioButton
                  v-model="form.airKetuban"
                  :value="opt"
                  name="airKetuban"
                  class="sr-only"
                />
                {{ opt }}
              </label>
            </div>
          </div>
          <div class="col-md-3">
            <div class="fl-label">Tanggal USG Terakhir</div>
            <DatePicker
              v-model="form.tglUsg"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Pilih tanggal"
              style="width: 100%"
            />
          </div>
          <div class="col-md-5">
            <div class="fl-label">Temuan USG</div>
            <Textarea
              v-model="form.temuanUsg"
              rows="2"
              placeholder="Posisi plasenta, biometri janin, indeks cairan ketuban…"
              class="custom-textarea"
              autoResize
            />
          </div>
        </div>
      </Panel>

      <!-- ── Catatan Kehamilan + Simpan ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon rose"><i class="pi pi-file-edit"></i></div>
            <div>
              <div class="sec-hdr__title">CATATAN KEHAMILAN</div>
              <div class="sec-hdr__sub">Keluhan utama · Riwayat kehamilan sebelumnya</div>
            </div>
          </div>
        </template>
        <template #footer>
          <Button
            label="Simpan Data OBGYN"
            icon="pi pi-save"
            class="btn-save"
            :loading="loadingSave"
            @click="simpan"
          />
          <Button
            label="Reset"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            class="btn-reset"
            @click="resetForm"
          />
        </template>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="fl-label">Keluhan Utama Kehamilan</div>
            <Textarea
              v-model="form.keluhanKehamilan"
              rows="3"
              placeholder="Mual, muntah, nyeri pinggang…"
              class="custom-textarea"
              autoResize
            />
          </div>
          <div class="col-md-6">
            <div class="fl-label">Riwayat Kehamilan Sebelumnya</div>
            <Textarea
              v-model="form.riwayatKehamilan"
              rows="3"
              placeholder="Komplikasi, SC, IUFD…"
              class="custom-textarea"
              autoResize
            />
          </div>
        </div>
      </Panel>
    </div>
    <!-- ── end OBSTETRI ── -->

    <!-- ══════════════ GINEKOLOGI ══════════════ -->
    <div v-if="kategori === 'GINEKOLOGI'" class="section-group">
      <!-- ── Siklus Menstruasi ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon rose"><i class="pi pi-calendar"></i></div>
            <div>
              <div class="sec-hdr__title">SIKLUS MENSTRUASI</div>
              <div class="sec-hdr__sub">HPHT · Siklus · Lama · Volume · Status Haid</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-3">
            <div class="fl-label">HPHT</div>
            <DatePicker
              v-model="form.hphtGine"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Pilih tanggal HPHT"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Siklus Haid</div>
            <InputGroup>
              <InputNumber v-model="form.siklusHaid" placeholder="28" :min="14" :max="60" />
              <InputGroupAddon>hari</InputGroupAddon>
            </InputGroup>
          </div>
          <div class="col-md-3">
            <div class="fl-label">Lama Haid</div>
            <InputGroup>
              <InputNumber v-model="form.lamaHaid" placeholder="5–7" :min="1" :max="14" />
              <InputGroupAddon>hari</InputGroupAddon>
            </InputGroup>
          </div>
          <div class="col-md-3">
            <div class="fl-label">Volume Darah</div>
            <Select
              v-model="form.volumeDarah"
              :options="['Sedikit', 'Normal', 'Banyak', 'Sangat Banyak']"
              placeholder="Pilih volume"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="row g-3 mt-0">
          <div class="col-md-3">
            <div class="fl-label">Dismenore (Nyeri Haid)</div>
            <Select
              v-model="form.dismenore"
              :options="['Tidak ada', 'Ringan', 'Sedang', 'Berat']"
              placeholder="Derajat nyeri"
              style="width: 100%"
            />
          </div>
          <div class="col-md-9">
            <div class="fl-label">Status Haid Saat Ini</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Reguler', 'Tidak Reguler', 'Amenorea', 'Menopause']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.statusHaid === opt }"
              >
                <RadioButton
                  v-model="form.statusHaid"
                  :value="opt"
                  name="statusHaid"
                  class="sr-only"
                />
                {{ opt }}
              </label>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ── KB / Kontrasepsi ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon sky"><i class="pi pi-shield"></i></div>
            <div>
              <div class="sec-hdr__title">KONTRASEPSI / KB</div>
              <div class="sec-hdr__sub">Jenis KB · Lama penggunaan · Keluhan</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-4">
            <div class="fl-label">Menggunakan KB?</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Ya', 'Tidak', 'Pernah']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.pakaiKB === opt }"
              >
                <RadioButton v-model="form.pakaiKB" :value="opt" name="pakaiKB" class="sr-only" />
                {{ opt }}
              </label>
            </div>
          </div>
          <div v-if="form.pakaiKB === 'Ya' || form.pakaiKB === 'Pernah'" class="col-md-4">
            <div class="fl-label">Jenis KB</div>
            <Select
              v-model="form.jenisKB"
              :options="optJenisKB"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih jenis KB"
              style="width: 100%"
            />
          </div>
          <div v-if="form.pakaiKB === 'Ya'" class="col-md-4">
            <div class="fl-label">Lama Penggunaan</div>
            <InputGroup>
              <InputNumber v-model="form.lamaKB" placeholder="Lama" :min="0" />
              <InputGroupAddon>bulan</InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        <div class="row g-3 mt-0">
          <div class="col-md-12">
            <div class="fl-label">Keluhan terkait KB</div>
            <InputText
              v-model="form.keluhanKB"
              placeholder="Bercak, nyeri, mual…"
              style="width: 100%"
            />
          </div>
        </div>
      </Panel>

      <!-- ── Pemeriksaan Spekulum & Serviks ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon indigo"><i class="pi pi-search"></i></div>
            <div>
              <div class="sec-hdr__title">PEMERIKSAAN SPEKULUM &amp; SERVIKS</div>
              <div class="sec-hdr__sub">Kondisi serviks · Sekret · Pap Smear · Perdarahan</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-3">
            <div class="fl-label">Kondisi Serviks</div>
            <Select
              v-model="form.kondisiServiks"
              :options="['Normal', 'Erosi', 'Polip', 'Infeksi', 'Massa/Tumor']"
              placeholder="Pilih kondisi"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Cairan / Sekret Vagina</div>
            <Select
              v-model="form.sekretVagina"
              :options="['Tidak ada', 'Normal/Jernih', 'Putih Susu', 'Kuning/Hijau', 'Berbau']"
              placeholder="Pilih jenis"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Pap Smear Terakhir</div>
            <DatePicker
              v-model="form.papSmear"
              dateFormat="dd/mm/yy"
              showIcon
              placeholder="Tanggal pap smear"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Hasil Pap Smear</div>
            <Select
              v-model="form.hasilPapSmear"
              :options="[
                'Belum pernah',
                'Normal/Negatif',
                'ASC-US',
                'LSIL',
                'HSIL',
                'Positif Keganasan',
              ]"
              placeholder="Pilih hasil"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="row g-3 mt-0">
          <div class="col-md-5">
            <div class="fl-label">Perdarahan Per Vaginam</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Tidak ada', 'Bercak', 'Ringan', 'Sedang', 'Berat']"
                :key="opt"
                class="pill-opt"
                :class="{
                  'pill-opt--active': form.perdarahan === opt,
                  'pill-opt--danger': form.perdarahan === opt && ['Sedang', 'Berat'].includes(opt),
                }"
              >
                <RadioButton
                  v-model="form.perdarahan"
                  :value="opt"
                  name="perdarahan"
                  class="sr-only"
                />
                {{ opt }}
              </label>
            </div>
          </div>
          <div class="col-md-7">
            <div class="fl-label">Catatan Pemeriksaan Spekulum</div>
            <Textarea
              v-model="form.catatanSpekulum"
              rows="3"
              placeholder="Temuan klinis pemeriksaan spekulum…"
              class="custom-textarea"
              autoResize
            />
          </div>
        </div>
      </Panel>

      <!-- ── Pemeriksaan Bimanual ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon emerald"><i class="pi pi-eye"></i></div>
            <div>
              <div class="sec-hdr__title">PEMERIKSAAN BIMANUAL</div>
              <div class="sec-hdr__sub">Uterus · Adneksa · NGS · Parametrium</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-4">
            <div class="fl-label">Ukuran Uterus</div>
            <Select
              v-model="form.ukuranUterus"
              :options="[
                'Normal',
                'Membesar sesuai UK',
                'Membesar tidak sesuai UK',
                'Mengecil',
                'Tidak teraba',
              ]"
              placeholder="Pilih ukuran"
              style="width: 100%"
            />
          </div>
          <div class="col-md-4">
            <div class="fl-label">Konsistensi Uterus</div>
            <Select
              v-model="form.konsistensiUterus"
              :options="['Lunak', 'Kenyal', 'Keras']"
              placeholder="Pilih konsistensi"
              style="width: 100%"
            />
          </div>
          <div class="col-md-4">
            <div class="fl-label">Mobilitas Uterus</div>
            <Select
              v-model="form.mobilitasUterus"
              :options="['Bebas', 'Terbatas', 'Terfiksir']"
              placeholder="Pilih mobilitas"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="row g-3 mt-0">
          <div class="col-md-3">
            <div class="fl-label">Adneksa Kanan</div>
            <Select
              v-model="form.adneksaKanan"
              :options="['Normal', 'Massa', 'Nyeri tekan', 'Massa + Nyeri']"
              placeholder="Pilih temuan"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Adneksa Kiri</div>
            <Select
              v-model="form.adneksaKiri"
              :options="['Normal', 'Massa', 'Nyeri tekan', 'Massa + Nyeri']"
              placeholder="Pilih temuan"
              style="width: 100%"
            />
          </div>
          <div class="col-md-3">
            <div class="fl-label">Nyeri Goyang Serviks (NGS)</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Negatif', 'Positif']"
                :key="opt"
                class="pill-opt"
                :class="{
                  'pill-opt--active': form.ngs === opt,
                  'pill-opt--danger': form.ngs === opt && opt === 'Positif',
                }"
              >
                <RadioButton v-model="form.ngs" :value="opt" name="ngs" class="sr-only" />
                {{ opt }}
              </label>
            </div>
          </div>
          <div class="col-md-3">
            <div class="fl-label">Nyeri Tekan Parametrium</div>
            <Select
              v-model="form.nyeriParametrium"
              :options="['Tidak ada', 'Kanan', 'Kiri', 'Bilateral']"
              placeholder="Pilih"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="row g-3 mt-0">
          <div class="col-md-12">
            <div class="fl-label">Catatan Pemeriksaan Bimanual</div>
            <Textarea
              v-model="form.catatanBimanual"
              rows="2"
              placeholder="Temuan klinis pemeriksaan bimanual…"
              class="custom-textarea"
              autoResize
            />
          </div>
        </div>
      </Panel>

      <!-- ── Riwayat Penyakit & Rencana ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon amber"><i class="pi pi-book"></i></div>
            <div>
              <div class="sec-hdr__title">RIWAYAT PENYAKIT GINEKOLOGI &amp; RENCANA</div>
              <div class="sec-hdr__sub">Diagnosis sebelumnya · Vaksin HPV · Rencana kehamilan</div>
            </div>
          </div>
        </template>

        <div class="row g-3">
          <div class="col-md-7">
            <div class="fl-label">Riwayat Penyakit Ginekologi</div>
            <div class="check-pill-group mt-1">
              <label
                v-for="penyakit in optRiwayatGine"
                :key="penyakit"
                class="check-pill"
                :class="{ 'check-pill--active': form.riwayatPenyakitGine.includes(penyakit) }"
              >
                <input
                  type="checkbox"
                  :value="penyakit"
                  v-model="form.riwayatPenyakitGine"
                  class="sr-only"
                />
                <i class="pi pi-check check-pill__icon"></i>
                {{ penyakit }}
              </label>
            </div>
          </div>
          <div class="col-md-5">
            <div class="fl-label">Rencana Kehamilan</div>
            <div class="pill-group mt-1">
              <label
                v-for="opt in ['Ya', 'Tidak', 'Belum diputuskan']"
                :key="opt"
                class="pill-opt"
                :class="{ 'pill-opt--active': form.rencanaHamil === opt }"
              >
                <RadioButton
                  v-model="form.rencanaHamil"
                  :value="opt"
                  name="rencanaHamil"
                  class="sr-only"
                />
                {{ opt }}
              </label>
            </div>
            <div class="fl-label mt-3">Status Vaksin HPV</div>
            <Select
              v-model="form.vaksinHPV"
              :options="[
                'Belum pernah',
                'HPV 1 (dosis 1)',
                'HPV 2 (dosis 2)',
                'HPV 3 (dosis 3)',
                'Lengkap',
              ]"
              placeholder="Pilih status"
              style="width: 100%"
            />
            <div v-if="form.vaksinHPV && form.vaksinHPV !== 'Belum pernah'" class="mt-3">
              <div class="fl-label">Tahun Vaksin HPV Terakhir</div>
              <InputNumber
                v-model="form.tahunVaksinHPV"
                placeholder="2023"
                :min="2000"
                :max="2030"
                :useGrouping="false"
                style="width: 100%"
              />
            </div>
          </div>
        </div>
        <div class="row g-3 mt-0">
          <div class="col-md-12">
            <div class="fl-label">Catatan Riwayat Penyakit Ginekologi</div>
            <Textarea
              v-model="form.catatanRiwayatGine"
              rows="2"
              placeholder="Detail riwayat penyakit, pengobatan, atau tindakan yang pernah dilakukan…"
              class="custom-textarea"
              autoResize
            />
          </div>
        </div>
      </Panel>

      <!-- ── Keluhan & Riwayat + Simpan ── -->
      <Panel>
        <template #header>
          <div class="sec-hdr">
            <div class="sec-hdr__icon rose"><i class="pi pi-file-edit"></i></div>
            <div>
              <div class="sec-hdr__title">KELUHAN &amp; RIWAYAT GINEKOLOGI</div>
              <div class="sec-hdr__sub">Keluhan utama · Riwayat operasi</div>
            </div>
          </div>
        </template>
        <template #footer>
          <Button
            label="Simpan Data OBGYN"
            icon="pi pi-save"
            class="btn-save"
            :loading="loadingSave"
            @click="simpan"
          />
          <Button
            label="Reset"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            class="btn-reset"
            @click="resetForm"
          />
        </template>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="fl-label">Keluhan Utama</div>
            <Textarea
              v-model="form.keluhanGine"
              rows="3"
              placeholder="Nyeri panggul, keputihan, benjolan…"
              class="custom-textarea"
              autoResize
            />
          </div>
          <div class="col-md-6">
            <div class="fl-label">Riwayat Operasi Ginekologi</div>
            <Textarea
              v-model="form.riwayatOperasi"
              rows="3"
              placeholder="Miomektomi, histerektomi, laparoskopi…"
              class="custom-textarea"
              autoResize
            />
          </div>
        </div>
      </Panel>
    </div>
    <!-- ── end GINEKOLOGI ── -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import RiwayatKunjunganObgynModal from './RiwayatKunjunganObgynModal.vue'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const props = defineProps({
  datapasien: { type: Object, required: true },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_name } = storeToRefs(authStore)
const toast = useToast()

const loadingSave = ref(false)
const fetchLoading = ref(false)
const kategori = ref(null)
const isFromPrevVisit = ref(false)
const prevVisitDate = ref(null)
const showRiwayat = ref(false)

// ── Autosave ──
const hasDraft = ref(false)
const lastSaved = ref(null)
const isInitialized = ref(false)

const DATE_FIELDS = ['hpht', 'hpl', 'tglUsg', 'hphtGine', 'papSmear']

const localStorageKey = computed(() => `obgyn_draft_${props.datapasien?.NOPENDAFTARAN}`)

const saveDraft = () => {
  try {
    const draft = {
      kategori: kategori.value,
      form: { ...form.value },
      riwayatPersalinan: [...riwayatPersalinan.value],
    }
    localStorage.setItem(localStorageKey.value, JSON.stringify(draft))
    hasDraft.value = true
  } catch {
    /* quota exceeded etc. */
  }
}

const clearDraft = () => {
  localStorage.removeItem(localStorageKey.value)
  hasDraft.value = false
}

const loadDraft = () => {
  const raw = localStorage.getItem(localStorageKey.value)
  if (!raw) return false
  try {
    const draft = JSON.parse(raw)
    kategori.value = draft.kategori ?? null
    const f = draft.form ?? {}
    DATE_FIELDS.forEach((field) => {
      if (f[field]) f[field] = new Date(f[field])
    })
    Object.keys(form.value).forEach((key) => {
      if (key in f) form.value[key] = f[key]
    })
    riwayatPersalinan.value = draft.riwayatPersalinan ?? []
    hasDraft.value = true
    return true
  } catch {
    clearDraft()
    return false
  }
}

const formatWaktu = (d) => {
  const dt = new Date(d)
  const jam = dt.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const tgl = dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  return `${jam}, ${tgl}`
}

const riwayatPersalinan = ref([])

const tambahBaris = () => {
  riwayatPersalinan.value.push({
    tahun: null,
    usiaKehamilan: null,
    jenisPersalinan: null,
    penolong: null,
    bbLahir: null,
    kondisiBayi: null,
    komplikasi: '',
  })
}

const hapusBaris = (idx) => {
  riwayatPersalinan.value.splice(idx, 1)
}

const form = ref({
  gravida: null,
  para: null,
  abortus: null,
  hpht: null,
  hpl: null,
  tfu: null,
  djj: null,
  leopold2: null,
  leopold3: null,
  leopold4: null,
  kontraksi: null,
  gerakanJanin: null,
  keluhanKehamilan: '',
  riwayatKehamilan: '',
  hphtGine: null,
  siklusHaid: null,
  lamaHaid: null,
  volumeDarah: null,
  dismenore: null,
  statusHaid: null,
  pakaiKB: null,
  jenisKB: null,
  lamaKB: null,
  keluhanKB: '',
  kondisiServiks: null,
  sekretVagina: null,
  perdarahan: null,
  papSmear: null,
  hasilPapSmear: null,
  catatanSpekulum: '',
  keluhanGine: '',
  riwayatOperasi: '',
  // ANC & Suplemen
  kunjunganAnc: null,
  tempatAnc: '',
  statusTT: null,
  suplemen: [],
  // Skrining risiko
  edema: null,
  proteinUrin: null,
  trendTD: '',
  airKetuban: null,
  tglUsg: null,
  temuanUsg: '',
  // Bimanual
  ukuranUterus: null,
  konsistensiUterus: null,
  mobilitasUterus: null,
  adneksaKanan: null,
  adneksaKiri: null,
  ngs: null,
  nyeriParametrium: null,
  catatanBimanual: '',
  // Riwayat penyakit & rencana
  riwayatPenyakitGine: [],
  rencanaHamil: null,
  vaksinHPV: null,
  tahunVaksinHPV: null,
  catatanRiwayatGine: '',
})

let autosaveTimer = null
const debouncedSave = () => {
  clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(saveDraft, 1000)
}

watch(
  [form, kategori, riwayatPersalinan],
  () => {
    if (!isInitialized.value) return
    debouncedSave()
  },
  { deep: true },
)

const optLeopold2 = [
  { label: 'Punggung Kiri (PUKI)', value: 'PUKI' },
  { label: 'Punggung Kanan (PUKA)', value: 'PUKA' },
  { label: 'Tidak dapat dinilai', value: 'TDN' },
]
const optLeopold3 = [
  { label: 'Kepala', value: 'KEPALA' },
  { label: 'Bokong', value: 'BOKONG' },
  { label: 'Bahu', value: 'BAHU' },
  { label: 'Tidak dapat dinilai', value: 'TDN' },
]
const optLeopold4 = [
  { label: 'Konvergen (Belum masuk PAP)', value: 'KONVERGEN' },
  { label: 'Sejajar (Sebagian masuk PAP)', value: 'SEJAJAR' },
  { label: 'Divergen (Sudah masuk PAP)', value: 'DIVERGEN' },
]
const optSuplemen = [
  'Tablet Fe (Zat Besi)',
  'Asam Folat',
  'Kalsium',
  'Vitamin D',
  'Vitamin C',
  'Omega 3',
]

const optRiwayatGine = [
  'PCOS',
  'Mioma Uteri',
  'Kista Ovarium',
  'Endometriosis',
  'Polip Serviks / Endometrium',
  'Infeksi PMS / IMS',
  'Kanker Serviks',
  'Kanker Ovarium',
  'Kanker Endometrium',
  'Tidak ada riwayat',
]

const optJenisPersalinan = [
  'Normal / Spontan',
  'Sectio Caesarea (SC)',
  'Vakum',
  'Forceps',
  'Tidak diketahui',
]
const optPenolong = ['Dokter SpOG', 'Dokter Umum', 'Bidan', 'Dukun', 'Sendiri']

const optJenisKB = [
  { label: 'PIL', value: 'PIL' },
  { label: 'Suntik 1 Bulan', value: 'SUNTIK_1BLN' },
  { label: 'Suntik 3 Bulan', value: 'SUNTIK_3BLN' },
  { label: 'IUD / Spiral', value: 'IUD' },
  { label: 'Implan / Susuk', value: 'IMPLAN' },
  { label: 'Kondom', value: 'KONDOM' },
  { label: 'MOW / Tubektomi', value: 'MOW' },
  { label: 'MOP / Vasektomi', value: 'MOP' },
]

const hitungHPL = () => {
  if (!form.value.hpht) return
  const d = new Date(form.value.hpht)
  d.setDate(d.getDate() + 7)
  d.setMonth(d.getMonth() + 9)
  form.value.hpl = d
}

const usiaKehamilan = computed(() => {
  if (!form.value.hpht) return null
  const diff = Date.now() - new Date(form.value.hpht).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
})

const trimester = computed(() => {
  const uk = usiaKehamilan.value
  if (!uk) return null
  if (uk <= 12) return 1
  if (uk <= 27) return 2
  return 3
})

const tbjDisplay = computed(() => {
  if (!form.value.tfu) return ''
  const tbj = (form.value.tfu - 11) * 155
  return tbj > 0 ? tbj.toLocaleString('id-ID') : ''
})

const formatTanggal = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

watch(() => form.value.hpht, hitungHPL)

const resetForm = () => {
  clearDraft()
  lastSaved.value = null
  kategori.value = null
  riwayatPersalinan.value = []
  Object.keys(form.value).forEach((key) => {
    if (Array.isArray(form.value[key])) {
      form.value[key] = []
    } else {
      form.value[key] = typeof form.value[key] === 'string' ? '' : null
    }
  })
}

const populateForm = (r) => {
  kategori.value = r.header?.kategori ?? null

  if (r.header?.kategori === 'OBSTETRI' && r.obstetri) {
    const o = r.obstetri
    form.value.gravida = o.gravida !== null ? Number(o.gravida) : null
    form.value.para = o.para !== null ? Number(o.para) : null
    form.value.abortus = o.abortus !== null ? Number(o.abortus) : null
    form.value.hpht = o.hpht ? new Date(o.hpht) : null
    form.value.hpl = o.hpl ? new Date(o.hpl) : null
    form.value.kunjunganAnc = o.kunjungan_anc !== null ? Number(o.kunjungan_anc) : null
    form.value.tempatAnc = o.tempat_anc ?? ''
    form.value.statusTT = o.status_tt ?? null
    form.value.edema = o.edema ?? null
    form.value.proteinUrin = o.protein_urin ?? null
    form.value.trendTD = o.trend_td ?? ''
    form.value.airKetuban = o.air_ketuban ?? null
    form.value.tglUsg = o.tgl_usg ? new Date(o.tgl_usg) : null
    form.value.temuanUsg = o.temuan_usg ?? ''
    form.value.tfu = o.tfu !== null ? parseFloat(o.tfu) : null
    form.value.leopold2 = o.leopold2 ?? null
    form.value.leopold3 = o.leopold3 ?? null
    form.value.leopold4 = o.leopold4 ?? null
    form.value.djj = o.djj !== null ? Number(o.djj) : null
    form.value.kontraksi = o.kontraksi ?? null
    form.value.gerakanJanin = o.gerakan_janin ?? null
    form.value.keluhanKehamilan = o.keluhan_kehamilan ?? ''
    form.value.riwayatKehamilan = o.riwayat_kehamilan ?? ''
    form.value.suplemen = Array.isArray(r.suplemen) ? r.suplemen : []
    riwayatPersalinan.value = (r.riwayat_persalinan ?? []).map((rp) => ({
      tahun: rp.tahun !== null ? Number(rp.tahun) : null,
      usiaKehamilan: rp.usia_kehamilan !== null ? Number(rp.usia_kehamilan) : null,
      jenisPersalinan: rp.jenis_persalinan ?? null,
      penolong: rp.penolong ?? null,
      bbLahir: rp.bb_lahir !== null ? Number(rp.bb_lahir) : null,
      kondisiBayi: rp.kondisi_bayi ?? null,
      komplikasi: rp.komplikasi ?? '',
    }))
  }

  if (r.header?.kategori === 'GINEKOLOGI' && r.ginekologi) {
    const g = r.ginekologi
    form.value.hphtGine = g.hpht ? new Date(g.hpht) : null
    form.value.siklusHaid = g.siklus_haid !== null ? Number(g.siklus_haid) : null
    form.value.lamaHaid = g.lama_haid !== null ? Number(g.lama_haid) : null
    form.value.volumeDarah = g.volume_darah ?? null
    form.value.dismenore = g.dismenore ?? null
    form.value.statusHaid = g.status_haid ?? null
    form.value.pakaiKB = g.pakai_kb ?? null
    form.value.jenisKB = g.jenis_kb ?? null
    form.value.lamaKB = g.lama_kb !== null ? Number(g.lama_kb) : null
    form.value.keluhanKB = g.keluhan_kb ?? ''
    form.value.kondisiServiks = g.kondisi_serviks ?? null
    form.value.sekretVagina = g.sekret_vagina ?? null
    form.value.perdarahan = g.perdarahan ?? null
    form.value.papSmear = g.pap_smear ? new Date(g.pap_smear) : null
    form.value.hasilPapSmear = g.hasil_pap_smear ?? null
    form.value.catatanSpekulum = g.catatan_spekulum ?? ''
    form.value.ukuranUterus = g.ukuran_uterus ?? null
    form.value.konsistensiUterus = g.konsistensi_uterus ?? null
    form.value.mobilitasUterus = g.mobilitas_uterus ?? null
    form.value.adneksaKanan = g.adneksa_kanan ?? null
    form.value.adneksaKiri = g.adneksa_kiri ?? null
    form.value.ngs = g.ngs ?? null
    form.value.nyeriParametrium = g.nyeri_parametrium ?? null
    form.value.catatanBimanual = g.catatan_bimanual ?? ''
    form.value.rencanaHamil = g.rencana_hamil ?? null
    form.value.vaksinHPV = g.vaksin_hpv ?? null
    form.value.tahunVaksinHPV = g.tahun_vaksin_hpv ? Number(g.tahun_vaksin_hpv) : null
    form.value.catatanRiwayatGine = g.catatan_riwayat_gine ?? ''
    form.value.keluhanGine = g.keluhan_gine ?? ''
    form.value.riwayatOperasi = g.riwayat_operasi ?? ''
    form.value.riwayatPenyakitGine = Array.isArray(r.riwayat_penyakit_gine)
      ? r.riwayat_penyakit_gine
      : []
  }
}

const loadData = async () => {
  const no_register = props.datapasien?.NOPENDAFTARAN
  const nomr = props.datapasien?.NOMR
  if (!no_register) return
  fetchLoading.value = true
  try {
    const url = configStore.apiBaseUrl

    // 1. Coba load data kunjungan saat ini
    const res = await axios.post(`${url}/index.php/api/obgyn/get_pemeriksaan`, {
      no_register,
      id_client: id_client.value,
    })

    if (res.data?.code === 200 && res.data?.response) {
      isFromPrevVisit.value = false
      prevVisitDate.value = null
      populateForm(res.data.response)
      return
    }

    // 2. Tidak ada data kunjungan ini — ambil data kunjungan terakhir pasien
    if (!nomr) return
    const resPrev = await axios.post(`${url}/index.php/api/obgyn/get_pemeriksaan_terakhir`, {
      nomr,
      no_register, // exclude kunjungan saat ini agar tidak muncul data sendiri
      id_client: id_client.value,
    })

    if (resPrev.data?.code === 200 && resPrev.data?.response) {
      isFromPrevVisit.value = true
      prevVisitDate.value = resPrev.data.response.header?.tgl_kunjungan ?? null
      populateForm(resPrev.data.response)
    }
  } catch (e) {
    console.error('loadData error:', e)
  } finally {
    fetchLoading.value = false
  }
}

onMounted(async () => {
  const restored = loadDraft()
  if (!restored) await loadData()
  nextTick(() => {
    isInitialized.value = true
  })
})

const simpan = async () => {
  loadingSave.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      id_client: id_client.value,
      no_register: props.datapasien?.NOPENDAFTARAN,
      nomr: props.datapasien?.NOMR,
      kategori: kategori.value,
      created_by: user_name.value,
      data: { ...form.value },
      riwayat_persalinan: riwayatPersalinan.value,
    }

    const response = await axios.post(`${url}/index.php/api/obgyn/simpan_pemeriksaan`, payload)
    if (response.data?.code === 200) {
      clearDraft()
      lastSaved.value = {
        time: new Date(),
        detail: `Data OBGYN ${kategori.value} berhasil disimpan`,
      }
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data OBGYN berhasil disimpan',
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Gagal',
        detail: response.data?.message || 'Gagal menyimpan data',
        life: 4000,
      })
    }
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan sistem',
      life: 5000,
    })
  } finally {
    loadingSave.value = false
  }
}
</script>

<style scoped>
/* ══ Base ══ */
.obgyn-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.section-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ══ Panel overrides ══ */
:deep(.p-panel-header) {
  padding: 10px 16px;
  background: #f8fafc;
}
:deep(.p-panel-content) {
  padding: 16px;
}
:deep(.p-panel-footer) {
  padding: 12px 16px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ══ Section header ══ */
.sec-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sec-hdr__icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.sec-hdr__icon.teal {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0d9488;
}
.sec-hdr__icon.indigo {
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #4f46e5;
}
.sec-hdr__icon.emerald {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #059669;
}
.sec-hdr__icon.sky {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
}
.sec-hdr__icon.amber {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #d97706;
}
.sec-hdr__icon.rose {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
}
.sec-hdr__title {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.sec-hdr__sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}

/* ══ Header actions ══ */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.status-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.btn-history {
  border-radius: 7px;
  font-size: 12px;
  white-space: nowrap;
}

/* ══ Prev-visit banner ══ */
.prev-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fffbeb, #fef9c3);
  border: 1px solid #fde68a;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
}
.prev-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  font-size: 15px;
  flex-shrink: 0;
}
.prev-banner__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prev-banner__title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
}
.prev-banner__sub {
  font-size: 12px;
  color: #78350f;
  line-height: 1.4;
}

/* ══ Draft banner ══ */
.draft-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid #fed7aa;
  border-left: 4px solid #f97316;
  border-radius: 8px;
}
.draft-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #ffedd5;
  border: 1px solid #fed7aa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ea580c;
  font-size: 14px;
  flex-shrink: 0;
}
.draft-banner__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.draft-banner__title {
  font-size: 13px;
  font-weight: 700;
  color: #9a3412;
}
.draft-banner__sub {
  font-size: 12px;
  color: #7c2d12;
  line-height: 1.4;
}

/* ══ Saved banner ══ */
.saved-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1px solid #86efac;
  border-left: 4px solid #16a34a;
  border-radius: 8px;
}
.saved-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dcfce7;
  border: 1px solid #86efac;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  font-size: 14px;
  flex-shrink: 0;
}
.saved-banner__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.saved-banner__title {
  font-size: 13px;
  font-weight: 700;
  color: #14532d;
}
.saved-banner__sub {
  font-size: 12px;
  color: #166534;
  line-height: 1.4;
}

/* ══ Category selector ══ */
.cat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 576px) {
  .cat-grid {
    grid-template-columns: 1fr;
  }
}

.cat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  background: #fafafa;
  position: relative;
  transition:
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
  user-select: none;
}
.cat-card:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}
.cat-card--obs {
  border-color: #38bdf8;
  background: #f0f9ff;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
}
.cat-card--gine {
  border-color: #c084fc;
  background: #faf5ff;
  box-shadow: 0 0 0 3px rgba(192, 132, 252, 0.12);
}
.cat-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.cat-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.cat-card__icon.obs {
  background: #e0f2fe;
  color: #0284c7;
}
.cat-card__icon.gine {
  background: #f3e8ff;
  color: #9333ea;
}
.cat-card__body {
  flex: 1;
  min-width: 0;
}
.cat-card__title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.3px;
}
.cat-card__sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
.cat-card__check {
  font-size: 18px;
  color: #38bdf8;
  flex-shrink: 0;
}
.cat-card__check.gine {
  color: #c084fc;
}

/* ══ Field labels ══ */
.fl-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.fl-hint {
  font-size: 10px;
  font-weight: 400;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
}
.field-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 14px 0;
}

/* ══ Info cards ══ */
.info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  min-height: 52px;
}
.info-card.teal {
  background: #f0fdfa;
  border: 1px solid #5eead4;
}
.info-card.blue {
  background: #eff6ff;
  border: 1px solid #93c5fd;
}
.info-card.green {
  background: #f0fdf4;
  border: 1px solid #86efac;
}
.info-card__icon {
  font-size: 18px;
  flex-shrink: 0;
}
.info-card.teal .info-card__icon {
  color: #0d9488;
}
.info-card.blue .info-card__icon {
  color: #2563eb;
}
.info-card.green .info-card__icon {
  color: #16a34a;
}
.info-card__val {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}
.info-card__unit {
  font-size: 11px;
  font-weight: 400;
  color: #64748b;
}
.info-card__sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

/* ══ Trimester pills ══ */
.trim-pill {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}
.trim-1 {
  background: #dcfce7;
  color: #15803d;
}
.trim-2 {
  background: #fef9c3;
  color: #a16207;
}
.trim-3 {
  background: #fee2e2;
  color: #dc2626;
}

/* ══ GPA ══ */
.gpa-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 14px;
  align-items: end;
}
@media (max-width: 768px) {
  .gpa-row {
    grid-template-columns: 1fr 1fr;
  }
}
.gpa-col__lbl {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 5px;
}
.gpa-col--result {
  display: flex;
  flex-direction: column;
}
.gpa-result {
  padding: 8px 16px;
  background: linear-gradient(135deg, #eff6ff, #e0f2fe);
  border: 2px solid #93c5fd;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 800;
  color: #1d4ed8;
  letter-spacing: 2px;
  white-space: nowrap;
  text-align: center;
}
:deep(.gpa-counter) {
  width: 100%;
  display: flex;
}
:deep(.gpa-counter .p-inputnumber-input) {
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  flex: 1;
  min-width: 0;
}
:deep(.gpa-counter .p-button) {
  flex-shrink: 0;
  width: 2.2rem;
}

/* ══ Pill options ══ */
.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pill-opt {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  font-size: 12px;
  color: #475569;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  font-weight: 500;
}
.pill-opt:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}
.pill-opt--active {
  border-color: #0d9488;
  background: #f0fdfa;
  color: #0d9488;
  font-weight: 700;
}
.pill-opt--danger.pill-opt--active {
  border-color: #dc2626;
  background: #fef2f2;
  color: #dc2626;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* ══ Checkbox pills ══ */
.check-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.check-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  font-size: 12px;
  color: #475569;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  font-weight: 500;
}
.check-pill:hover {
  border-color: #94a3b8;
  background: #f1f5f9;
}
.check-pill--active {
  border-color: #0d9488;
  background: #f0fdfa;
  color: #0d9488;
  font-weight: 700;
}
.check-pill__icon {
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.15s;
}
.check-pill--active .check-pill__icon {
  opacity: 1;
}

/* ══ Riwayat Persalinan table ══ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 32px 16px;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 8px;
  text-align: center;
}
.empty-state__icon {
  font-size: 28px;
  color: #cbd5e1;
}
.empty-state__text {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.empty-state__sub {
  font-size: 12px;
  color: #94a3b8;
}

.pro-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.pro-table th {
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 7px 8px;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
  vertical-align: middle;
}
.pro-table td {
  padding: 4px 6px;
  border: 1px solid #e2e8f0;
  vertical-align: middle;
  background: #fff;
}
.pro-table tr:nth-child(even) td {
  background: #f8fafc;
}

:deep(.riwayat-input) {
  width: 100%;
}
:deep(.riwayat-input .p-inputnumber-input),
:deep(.riwayat-input.p-inputtext) {
  font-size: 12px;
  padding: 4px 8px;
  height: 30px;
}
:deep(.riwayat-select .p-select-label) {
  font-size: 12px;
  padding: 4px 8px;
}
:deep(.riwayat-select) {
  height: 30px;
}

/* ══ Buttons ══ */
.btn-add {
  border-radius: 7px;
  font-size: 12px;
  white-space: nowrap;
}
.btn-save {
  border-radius: 8px;
  flex: 1;
  font-weight: 600;
}
.btn-reset {
  border-radius: 8px;
  font-weight: 500;
}

/* ══ Textarea ══ */
.custom-textarea {
  font-size: 13px !important;
  line-height: 1.4;
  width: 100%;
  padding: 10px 12px !important;
  margin-bottom: 0;
}
</style>
