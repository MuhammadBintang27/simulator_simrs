<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :style="{ width: '1200px' }"
    :breakpoints="{ '1300px': '96vw', '768px': '99vw' }"
    :closable="true"
    :draggable="false"
    class="klaim-dialog"
    @hide="onHide"
  >
    <!-- Loading -->
    <!-- Loading State dengan Skeleton -->
    <div v-if="loading" class="kd-body">
      <div class="kd-columns">
        <!-- Kolom Kiri Skeleton -->
        <div class="kd-col-left">
          <!-- Info Strip Skeleton -->
          <div class="kd-info-strip" style="background: none; border: 1px solid #e9ecef">
            <div
              v-for="i in 4"
              :key="i"
              class="kd-strip-item"
              style="border-right: 1px solid #e9ecef"
            >
              <div class="flex flex-column gap-2 w-full">
                <Skeleton width="40%" height="0.7rem"></Skeleton>
                <Skeleton width="80%" height="1.2rem"></Skeleton>
              </div>
            </div>
          </div>

          <!-- Form Card Skeleton -->
          <div class="kd-form-card">
            <div v-for="i in 3" :key="i" class="mb-5">
              <div class="flex align-items-center gap-2 mb-3">
                <Skeleton shape="circle" size="1.5rem"></Skeleton>
                <Skeleton width="30%" height="1rem"></Skeleton>
              </div>
              <div class="flex gap-2 align-items-center">
                <Skeleton height="2.8rem" class="flex-grow-1"></Skeleton>
                <Skeleton width="3rem" height="1.5rem"></Skeleton>
              </div>
              <!-- Baris tambahan untuk simulasi list sekunder -->
              <div v-if="i > 1" class="mt-3 flex gap-2">
                <Skeleton height="2.8rem" class="flex-grow-1"></Skeleton>
                <Skeleton width="3rem" height="1.5rem"></Skeleton>
                <Skeleton width="2rem" height="2rem"></Skeleton>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan Skeleton -->
        <div class="kd-col-right" style="background: #fff">
          <Skeleton width="100%" height="40px"></Skeleton>
          <div class="p-4">
            <div v-for="i in 4" :key="i" class="mb-4">
              <Skeleton width="40%" height="0.8rem" class="mb-3"></Skeleton>
              <div class="flex flex-column gap-2">
                <div v-for="j in 3" :key="j" class="flex justify-content-between">
                  <Skeleton width="30%" height="0.6rem"></Skeleton>
                  <Skeleton width="50%" height="0.6rem"></Skeleton>
                </div>
              </div>
            </div>
            <!-- Simulasi Tabel Lab/Obat -->
            <Skeleton width="100%" height="100px" class="mt-4"></Skeleton>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="kd-body">
      <div class="kd-columns">
        <!-- ══ KIRI: Form Input ══ -->
        <div class="kd-col-left">
          <!-- Info strip -->
          <div class="kd-info-strip">
            <div class="kd-strip-item">
              <i class="pi pi-hashtag"></i>
              <div>
                <div class="kd-strip-lbl">No. Register</div>
                <div class="kd-strip-val">{{ pasienInfo.NOPENDAFTARAN || '—' }}</div>
              </div>
            </div>
            <div class="kd-strip-item">
              <i class="pi pi-building"></i>
              <div>
                <div class="kd-strip-lbl">Ruang Rawat</div>
                <div class="kd-strip-val">{{ pasienInfo.POLI || '—' }}</div>
              </div>
            </div>
            <div class="kd-strip-item">
              <i class="pi pi-calendar"></i>
              <div>
                <div class="kd-strip-lbl">Lama Rawat</div>
                <div class="kd-strip-val">{{ ranapData.JLM_HARI_RAWAT || '—' }} hari</div>
              </div>
            </div>
            <div class="kd-strip-item">
              <i class="pi pi-credit-card"></i>
              <div>
                <div class="kd-strip-lbl">Cara Bayar</div>
                <Tag
                  :value="pasienInfo.CARABAYAR || '—'"
                  severity="success"
                  style="font-size: 11px; margin-top: 2px"
                />
              </div>
            </div>
          </div>

          <div class="kd-form-card">
            <!-- Diagnosa Utama -->
            <div class="kd-section">
              <div class="kd-section-title">
                <i class="pi pi-bookmark-fill" style="color: #1a3a5f"></i>
                Diagnosa Utama <span class="kd-req">*</span>
              </div>
              <div class="kd-dx-row">
                <Select
                  v-model="dxUtama"
                  :options="listDiagnose"
                  optionLabel="dx"
                  dataKey="icd_code"
                  filter
                  showClear
                  @filter="searchDiagnose"
                  placeholder="Ketik kode / nama diagnosa..."
                  appendTo="body"
                  class="flex-grow-1"
                  :disabled="isReadOnly"
                >
                  <template #option="{ option }">
                    <div class="dx-option">
                      <!-- {{ option }} -->
                      <!-- <span class="dx-code">{{ option.kode }}</span> -->
                      <span class="dx-name">{{ option.dx }}</span>
                    </div>
                  </template>
                </Select>
                <Tag v-if="dxUtama" :value="dxUtama.icd_code" severity="success" />
              </div>
            </div>

            <!-- Diagnosa Sekunder -->
            <div class="kd-section">
              <div class="kd-section-title">
                <i class="pi pi-bookmark" style="color: #6c757d"></i>
                Diagnosa Sekunder
                <Button
                  icon="pi pi-plus"
                  label="Tambah"
                  size="small"
                  text
                  severity="success"
                  @click="tambahDxSekunder"
                  :disabled="isReadOnly"
                />
              </div>
              <div v-if="listDxSekunder.length === 0" class="kd-empty-dx">
                Belum ada. Klik Tambah.
              </div>
              <div
                v-for="(_, idx) in listDxSekunder"
                :key="idx"
                class="kd-dx-row"
                style="margin-top: 6px"
              >
                <Select
                  v-model="listDxSekunder[idx]"
                  :options="listDiagnose"
                  optionLabel="dx"
                  filter
                  dataKey="icd_code"
                  showClear
                  @filter="searchDiagnose"
                  :placeholder="`Sekunder ${idx + 1}...`"
                  appendTo="body"
                  :disabled="isReadOnly"
                  class="flex-grow-1"
                >
                  <template #option="{ option }">
                    <div class="dx-option">
                      <span class="dx-name">{{ option.dx }}</span>
                    </div>
                  </template>
                </Select>
                <Tag
                  v-if="listDxSekunder[idx]"
                  :value="listDxSekunder[idx]?.icd_code"
                  severity="secondary"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="hapusDxSekunder(idx)"
                  :disabled="isReadOnly"
                />
              </div>
            </div>

            <!-- Prosedur -->
            <div class="kd-section">
              <div class="kd-section-title">
                <i class="pi pi-heart" style="color: #2a5ca8"></i>
                Prosedur / Tindakan
                <Button
                  icon="pi pi-plus"
                  label="Tambah"
                  size="small"
                  text
                  severity="info"
                  @click="tambahProsedur"
                  :disabled="isReadOnly"
                />
              </div>
              <div v-if="listProsedur.length === 0" class="kd-empty-dx">
                Belum ada. Klik Tambah.
              </div>
              <div
                v-for="(_, idx) in listProsedur"
                :key="idx"
                class="kd-dx-row"
                style="margin-top: 6px"
              >
                <Select
                  v-model="listProsedur[idx]"
                  :options="listProsedurOptions"
                  optionLabel="proc"
                  dataKey="kode"
                  :filterFields="['kode', 'proc', 'search_key']"
                  filter
                  showClear
                  @filter="get_procedure"
                  :placeholder="`Ketik nama / kode prosedur ${idx + 1}...`"
                  appendTo="body"
                  class="flex-grow-1"
                  :disabled="isReadOnly"
                >
                  <template #option="{ option }">
                    <div class="dx-option">
                      <!-- <span class="dx-code">{{ option.kode }}</span> -->
                      <span class="dx-name">{{ option.proc }}</span>
                    </div>
                  </template>
                </Select>
                <Tag v-if="listProsedur[idx]" :value="listProsedur[idx]?.kode" severity="info" />
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="hapusProsedur(idx)"
                  :disabled="isReadOnly"
                />
              </div>
            </div>
            <!-- Status Kelengkapan -->
            <!-- Dokter Rawat Bersama -->
            <div class="kd-section">
              <div class="kd-section-title">
                <i class="pi pi-users" style="color: #1a3a5f"></i>
                Dokter Rawat Bersama
                <Button
                  icon="pi pi-plus"
                  label="Tambah Dokter"
                  size="small"
                  text
                  severity="success"
                  @click="tambahDokter"
                  :disabled="isReadOnly"
                />
              </div>
              <div v-if="listDokterRawat.length === 0" class="kd-empty-dx">
                Belum ada dokter tambahan. Klik Tambah Dokter.
              </div>
              <div
                v-for="(_, idx) in listDokterRawat"
                :key="idx"
                class="kd-dx-row"
                style="margin-top: 6px"
              >
                <Select
                  v-model="listDokterRawat[idx]"
                  :options="listDokterOptions"
                  optionLabel="NAMADOKTER"
                  dataKey="KDDOKTER"
                  filter
                  showClear
                  :loading="loadingDokter"
                  @filter="searchDokter"
                  :placeholder="`Cari nama dokter ${idx + 1}...`"
                  appendTo="body"
                  class="flex-grow-1"
                  :disabled="isReadOnly"
                >
                  <template #option="{ option }">
                    <div class="dx-option">
                      <span class="dx-code" style="min-width: 80px">{{ option.KDDOKTER }}</span>
                      <div>
                        <div class="dx-name">{{ option.NAMADOKTER }}</div>
                        <div style="font-size: 10px; color: #6c757d">
                          {{ option.SPESIALISASI || option.JABATAN }}
                        </div>
                      </div>
                    </div>
                  </template>
                </Select>
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="hapusDokter(idx)"
                  :disabled="isReadOnly"
                />
              </div>
            </div>

            <!-- Status Kelengkapan -->
            <div class="kd-section">
              <div class="kd-section-title">
                <i class="pi pi-check-square" style="color: #2a5ca8"></i>
                Status Kelengkapan Rekam Medis
              </div>
              <div class="kd-status-group">
                <div
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  class="kd-status-opt"
                  :class="{
                    'kd-status-opt-active': statusKlaim === opt.value,
                    [`kd-status-opt-${opt.value}`]: true,
                  }"
                  @click="!isReadOnly && (statusKlaim = opt.value)"
                >
                  <i :class="opt.icon"></i>
                  <div>
                    <div class="kd-status-opt-lbl">{{ opt.label }}</div>
                    <div class="kd-status-opt-desc">{{ opt.desc }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Catatan Perbaikan -->
            <div class="kd-section" v-if="statusKlaim === 'perbaikan'">
              <div class="kd-section-title">
                <i class="pi pi-comment" style="color: #a03030"></i>
                Catatan Perbaikan <span class="kd-req">*</span>
              </div>
              <Textarea
                v-model="catatanPerbaikan"
                rows="4"
                class="w-100"
                placeholder="Tuliskan perbaikan yang diperlukan pada rekam medis..."
                :class="{ 'p-invalid': showValidasiCatatan && !catatanPerbaikan.trim() }"
                :disabled="isReadOnly"
              />
              <small v-if="showValidasiCatatan && !catatanPerbaikan.trim()" class="kd-err-msg">
                Catatan perbaikan wajib diisi
              </small>
            </div>
          </div>
          <!-- /kd-form-card -->
        </div>
        <!-- /kd-col-left -->

        <!-- ══ KANAN: Resume Rawat Jalan (non-IGD) ══ -->
        <div v-if="isRajalNonIGD" class="kd-col-right">
          <div class="kd-resume-panel">
            <Tag class="kd-resume-panel-title" style="background-color: darkorange">
              <i class="pi pi-file-check"></i> Resume Rawat Jalan
            </Tag>

            <!-- Skeleton Resume Rawat Jalan -->
            <div v-if="loadingRajal">
              <!-- Skeleton: Pasien -->
              <div class="kd-rs-group">
                <Skeleton width="30%" height="0.65rem" class="mb-3"></Skeleton>
                <div v-for="i in 5" :key="i" class="kd-rs-row" style="margin-bottom: 6px">
                  <Skeleton
                    width="32%"
                    height="0.6rem"
                    style="flex-shrink: 0; margin-right: 8px"
                  ></Skeleton>
                  <Skeleton width="60%" height="0.6rem"></Skeleton>
                </div>
              </div>

              <!-- Skeleton: TTV -->
              <div class="kd-rs-group">
                <Skeleton width="20%" height="0.65rem" class="mb-3"></Skeleton>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px">
                  <div
                    v-for="i in 8"
                    :key="i"
                    style="
                      border: 1px solid #e9ecef;
                      border-radius: 6px;
                      padding: 6px 4px;
                      text-align: center;
                    "
                  >
                    <Skeleton width="60%" height="0.5rem" style="margin: 0 auto 4px"></Skeleton>
                    <Skeleton width="75%" height="0.9rem" style="margin: 0 auto"></Skeleton>
                  </div>
                </div>
              </div>

              <!-- Skeleton: Keluhan -->
              <div class="kd-rs-group">
                <Skeleton width="28%" height="0.65rem" class="mb-3"></Skeleton>
                <div v-for="i in 3" :key="i" class="kd-rs-row" style="margin-bottom: 6px">
                  <Skeleton
                    width="36%"
                    height="0.6rem"
                    style="flex-shrink: 0; margin-right: 8px"
                  ></Skeleton>
                  <Skeleton :width="i === 1 ? '55%' : '70%'" height="0.6rem"></Skeleton>
                </div>
              </div>

              <!-- Skeleton: SOAP -->
              <div class="kd-rs-group">
                <Skeleton width="22%" height="0.65rem" class="mb-3"></Skeleton>
                <div v-for="i in 4" :key="i" style="margin-bottom: 8px">
                  <div class="kd-rs-row" style="margin-bottom: 3px">
                    <Skeleton
                      width="14%"
                      height="0.6rem"
                      style="flex-shrink: 0; margin-right: 8px"
                    ></Skeleton>
                    <Skeleton :width="i % 2 === 0 ? '75%' : '60%'" height="0.6rem"></Skeleton>
                  </div>
                  <div v-if="i <= 2" style="padding-left: calc(14% + 8px)">
                    <Skeleton width="50%" height="0.55rem"></Skeleton>
                  </div>
                </div>
              </div>

              <!-- Skeleton: Diagnosa & Prosedur -->
              <div v-for="sec in 3" :key="'sec' + sec" class="kd-rs-group">
                <Skeleton
                  :width="sec === 1 ? '28%' : sec === 2 ? '35%' : '20%'"
                  height="0.65rem"
                  class="mb-3"
                ></Skeleton>
                <Skeleton width="100%" height="48px" border-radius="4px"></Skeleton>
              </div>
            </div>

            <!-- Konten Resume Rawat Jalan -->
            <template v-if="!loadingRajal">
              <!-- Pasien -->
              <div class="kd-rs-group">
                <div class="kd-rs-group-lbl">Pasien</div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Nama</span
                  ><span class="kd-rs-val"
                    >{{ ranapData.NAMAPASIEN || '—' }}
                    <span
                      v-if="ranapData.JENISPASIEN"
                      class="kd-jenis-badge"
                      :class="
                        ranapData.JENISPASIEN?.toLowerCase() === 'baru'
                          ? 'kd-jenis-baru'
                          : 'kd-jenis-lama'
                      "
                      >{{ ranapData.JENISPASIEN }}</span
                    ></span
                  >
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">No. RM</span
                  ><span class="kd-rs-val kd-rs-accent">{{ ranapData.NOMR || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Dokter</span
                  ><span class="kd-rs-val">{{ ranapData.NAMADOKTER || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">NOSEP</span
                  ><span class="kd-rs-val">{{ ranapData.NOSEP || '—' }}</span>
                </div>
                <div class="kd-rs-row" v-if="rajalDataMasuk">
                  <span class="kd-rs-lbl">Kunjungan</span
                  ><span class="kd-rs-val">{{ rajalDataMasuk.display || '—' }}</span>
                </div>
              </div>

              <!-- TTV -->
              <div class="kd-rs-group" v-if="ResumeRawatJalan">
                <div class="kd-rs-group-lbl">TTV</div>
                <div class="kd-ttv-mini">
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">TD</div>
                    <div class="kd-ttv-val">{{ ResumeRawatJalan.tensi || '—' }}</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">Nadi</div>
                    <div class="kd-ttv-val">{{ ResumeRawatJalan.nadi_permenit || '—' }}</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">Suhu</div>
                    <div class="kd-ttv-val">{{ ResumeRawatJalan.suhu || '—' }}</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">SpO2</div>
                    <div class="kd-ttv-val">{{ ResumeRawatJalan.sp2o || '—' }}%</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">RR</div>
                    <div class="kd-ttv-val">{{ ResumeRawatJalan.respirasi_perm || '—' }}</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">GCS</div>

                    <div class="kd-ttv-val">{{ ResumeRawatJalan.cgs || '—' }}</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">BB/TB</div>
                    <div class="kd-ttv-val">
                      {{ ResumeRawatJalan.berat_badan || '—' }}/{{
                        ResumeRawatJalan.tinggi_badan || '—'
                      }}
                    </div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">Kesadaran</div>
                    <div class="kd-ttv-val">{{ ResumeRawatJalan.kesadaran || '—' }}</div>
                  </div>
                </div>
              </div>

              <!-- Keluhan -->
              <div class="kd-rs-group" v-if="ResumeRawatJalan?.keluhan_utama">
                <div class="kd-rs-group-lbl">Keluhan</div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Keluhan Utama</span
                  ><span class="kd-rs-val">{{ ResumeRawatJalan.keluhan_utama }}</span>
                </div>
                <div class="kd-rs-row" v-if="ResumeRawatJalan.riwayat_peny_kel">
                  <span class="kd-rs-lbl">Riwayat Penyakit</span
                  ><span class="kd-rs-val">{{ ResumeRawatJalan.riwayat_peny_kel }}</span>
                </div>
                <div class="kd-rs-row" v-if="ResumeRawatJalan.riwayat_elergi">
                  <span class="kd-rs-lbl">Alergi</span
                  ><span class="kd-rs-val">{{ ResumeRawatJalan.riwayat_elergi }}</span>
                </div>
              </div>

              <!-- SOAP -->
              <div class="kd-rs-group" v-if="ResumeRawatJalan">
                <div class="kd-rs-group-lbl">SOAP</div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">S</span
                  ><span class="kd-rs-val">{{ ResumeRawatJalan.subjek || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">O</span
                  ><span class="kd-rs-val">{{ ResumeRawatJalan.objek || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">A</span
                  ><span class="kd-rs-val">{{ ResumeRawatJalan.asesmen || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">P</span
                  ><span class="kd-rs-val">{{ ResumeRawatJalan.plan || '—' }}</span>
                </div>
              </div>

              <!-- SITB -->
              <!-- <div class="kd-rs-group" v-if="ResumeRawatJalan?.no_sitb"> -->
              <div class="kd-rs-group kd-rs-group-lbl">SITB</div>
              <pre class="kd-rs-pre">{{ ResumeRawatJalan?.no_sitb }}</pre>
              <!-- </div> -->

              <div class="kd-rs-group" v-if="ResumeRawatJalan?.diagnosa">
                <div class="kd-rs-group-lbl">Diagnosa</div>
                <pre class="kd-rs-pre">{{ ResumeRawatJalan.diagnosa }}</pre>
              </div>

              <!-- Prosedur -->
              <div class="kd-rs-group" v-if="ResumeRawatJalan?.procedure">
                <div class="kd-rs-group-lbl">Prosedur ICD</div>
                <pre class="kd-rs-pre">{{ ResumeRawatJalan.procedure }}</pre>
              </div>

              <!-- Tindakan Non-ICD -->
              <div class="kd-rs-group" v-if="ResumeRawatJalan?.tindakan_non_icd">
                <div class="kd-rs-group-lbl">Tindakan</div>
                <pre class="kd-rs-pre">{{ ResumeRawatJalan.tindakan_non_icd }}</pre>
              </div>

              <!-- Obat -->
              <div class="kd-rs-group" v-if="ResumeRawatJalan?.obat">
                <div class="kd-rs-group-lbl">Obat</div>
                <pre class="kd-rs-pre">{{ ResumeRawatJalan.obat }}</pre>
              </div>
            </template>
          </div>
        </div>

        <!-- ══ KANAN: Form Triase IGD (JALAN + KODEPOLI IGD) ══ -->
        <div v-else-if="isRajalIGD" class="kd-col-right">
          <div class="kd-resume-panel">
            <Tag class="kd-resume-panel-title" severity="danger" style="background: #b71c1c">
              INSTALASI GAWAT DARURAT (IGD)
            </Tag>

            <!-- Skeleton Triase Loading -->
            <div v-if="loadingTriase">
              <!-- Skeleton: Skor Triase -->
              <div class="kd-rs-group">
                <Skeleton width="35%" height="0.65rem" class="mb-3"></Skeleton>
                <div
                  style="
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 5px;
                    margin-bottom: 6px;
                  "
                >
                  <Skeleton v-for="i in 4" :key="i" height="52px" border-radius="6px"></Skeleton>
                </div>
                <Skeleton width="100%" height="30px" border-radius="5px"></Skeleton>
              </div>

              <!-- Skeleton: Cara Masuk -->
              <div class="kd-rs-group">
                <Skeleton width="40%" height="0.65rem" class="mb-3"></Skeleton>
                <div v-for="i in 5" :key="i" class="kd-rs-row" style="margin-bottom: 6px">
                  <Skeleton
                    width="38%"
                    height="0.6rem"
                    style="flex-shrink: 0; margin-right: 8px"
                  ></Skeleton>
                  <Skeleton width="55%" height="0.6rem"></Skeleton>
                </div>
              </div>

              <!-- Skeleton: TTV -->
              <div class="kd-rs-group">
                <Skeleton width="45%" height="0.65rem" class="mb-3"></Skeleton>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px">
                  <div
                    v-for="i in 8"
                    :key="i"
                    style="
                      border: 1px solid #e9ecef;
                      border-radius: 6px;
                      padding: 6px 4px;
                      text-align: center;
                    "
                  >
                    <Skeleton width="60%" height="0.5rem" style="margin: 0 auto 4px"></Skeleton>
                    <Skeleton width="80%" height="0.9rem" style="margin: 0 auto"></Skeleton>
                  </div>
                </div>
              </div>

              <!-- Skeleton: Tabel Triase -->
              <div class="kd-rs-group">
                <Skeleton width="50%" height="0.65rem" class="mb-3"></Skeleton>
                <div style="border: 1px solid #e9ecef; border-radius: 4px; overflow: hidden">
                  <div
                    style="
                      display: grid;
                      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                      gap: 0;
                      background: #f0fdf4;
                      padding: 5px 6px;
                    "
                  >
                    <Skeleton v-for="i in 5" :key="i" height="0.6rem"></Skeleton>
                  </div>
                  <div
                    v-for="row in 4"
                    :key="row"
                    style="
                      display: grid;
                      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
                      gap: 4px;
                      padding: 5px 6px;
                      border-top: 1px solid #f0f0f0;
                    "
                  >
                    <Skeleton
                      v-for="col in 5"
                      :key="col"
                      :height="col === 1 ? '0.7rem' : '0.55rem'"
                    ></Skeleton>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="!triaseHeader?.code || triaseHeader?.code !== 200" class="kd-rs-group">
              <div class="kd-empty-dx">
                <i class="pi pi-minus-circle"></i> Tidak ada data triase untuk kunjungan ini.
              </div>
            </div>

            <template v-else>
              <!-- Skor Triase -->
              <div class="kd-rs-group" v-if="triaseNilai">
                <div class="kd-rs-group-lbl">Kategori Triase</div>
                <div class="tks-scores">
                  <div class="tks-box tks-emergensi">
                    <div class="tks-num">{{ triaseNilai.EMERGENSI || 0 }}</div>
                    <div class="tks-lbl">EMERGENSI</div>
                  </div>
                  <div class="tks-box tks-urgent">
                    <div class="tks-num">{{ triaseNilai.URGENT || 0 }}</div>
                    <div class="tks-lbl">URGENT</div>
                  </div>
                  <div class="tks-box tks-nonurgent">
                    <div class="tks-num">{{ triaseNilai.NON_URGENT || 0 }}</div>
                    <div class="tks-lbl">NON URGENT</div>
                  </div>
                  <div class="tks-box tks-death">
                    <div class="tks-num">{{ triaseNilai.DEATH_ON_ARRIVAL || 0 }}</div>
                    <div class="tks-lbl">DOA</div>
                  </div>
                </div>
                <div :class="['tks-kesimpulan', 'tks-kes-' + triaseKesimpulanKey]">
                  Kategori: <strong>{{ triaseKesimpulan }}</strong>
                </div>
              </div>

              <!-- Data Pasien -->
              <div class="kd-rs-group">
                <div class="kd-rs-group-lbl">Data Pasien</div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Nama</span>
                  <span class="kd-rs-val">
                    {{ props.datapasien.NAMAPASIEN || '—' }}

                    <span
                      v-if="props.datapasien.JENISPASIEN"
                      class="kd-jenis-badge"
                      :class="
                        props.datapasien.JENISPASIEN?.toLowerCase() === 'baru'
                          ? 'kd-jenis-baru'
                          : 'kd-jenis-lama'
                      "
                      >{{ props.datapasien.JENISPASIEN }}</span
                    >
                  </span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Tgl. Lahir</span>
                  <span class="kd-rs-val">{{ formatTglLahir(props.datapasien.TGLLAHIR) }}</span>
                </div>
              </div>

              <!-- Cara Masuk Pasien -->
              <div class="kd-rs-group">
                <div class="kd-rs-group-lbl">Cara Masuk Pasien</div>

                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Waktu Masuk</span>
                  <span class="kd-rs-val">{{ triaseHeader.waktu || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Diantar Oleh</span>
                  <span class="kd-rs-val">{{ triaseHeader.diantar_oleh || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Transportasi</span>
                  <span class="kd-rs-val">{{ triaseHeader.transportasi || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">DPJP</span>
                  <span class="kd-rs-val">{{
                    triaseHeader.namadokter_sp || props.datapasien.NAMADOKTER || '—'
                  }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Kesadaran</span>
                  <span class="kd-rs-val">{{ triaseHeader.kesadaran || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Status Psikologi</span>
                  <span class="kd-rs-val">{{ triaseHeader.status_psikologi || '—' }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Resiko Jatuh</span>
                  <span class="kd-rs-val">
                    <span
                      :style="{
                        color: triaseHeader.resiko_jatuh === 'YA' ? '#dc2626' : '#1a6b4a',
                        fontWeight: 600,
                      }"
                      >{{ triaseHeader.resiko_jatuh || '—' }}</span
                    >
                  </span>
                </div>
              </div>

              <!-- Anamnese Singkat -->
              <div class="kd-rs-group" v-if="triaseHeader.keluhan_utama">
                <div class="kd-rs-group-lbl">Anamnese Singkat</div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Keluhan Utama</span>
                  <span class="kd-rs-val">{{ triaseHeader.keluhan_utama }}</span>
                </div>
                <div class="kd-rs-row" v-if="triaseHeader.riwayat_penyakit_dahulu">
                  <span class="kd-rs-lbl">Riwayat Penyakit</span>
                  <span class="kd-rs-val">{{ triaseHeader.riwayat_penyakit_dahulu }}</span>
                </div>
              </div>

              <!-- Tanda-Tanda Vital -->
              <div class="kd-rs-group">
                <div class="kd-rs-group-lbl">Tanda-Tanda Vital</div>
                <div class="kd-ttv-mini" style="grid-template-columns: repeat(4, 1fr)">
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">Suhu</div>
                    <div class="kd-ttv-val">
                      {{ triaseHeader.suhu ?? '—' }}<span style="font-size: 8px"> °C</span>
                    </div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">TD</div>
                    <div class="kd-ttv-val" style="font-size: 11px">
                      {{ triaseHeader.tensi_sistol ?? '—' }}/{{ triaseHeader.tensi_distol ?? '—' }}
                    </div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">Nadi</div>
                    <div class="kd-ttv-val">{{ triaseHeader.nadipermenit ?? '—' }}</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">SpO2</div>
                    <div class="kd-ttv-val">
                      {{ triaseHeader.saturasi ?? '—' }}<span style="font-size: 9px">%</span>
                    </div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">RR</div>
                    <div class="kd-ttv-val">{{ triaseHeader.respirasi ?? '—' }}</div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">BB</div>
                    <div class="kd-ttv-val">
                      {{ triaseHeader.bb ?? '—' }}<span style="font-size: 8px"> kg</span>
                    </div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">TB</div>
                    <div class="kd-ttv-val">
                      {{ triaseHeader.tb ?? '—' }}<span style="font-size: 8px"> cm</span>
                    </div>
                  </div>
                  <div class="kd-ttv-item">
                    <div class="kd-ttv-lbl">Nyeri</div>
                    <div class="kd-ttv-val">
                      {{ triaseHeader.nyeri ?? '—' }}<span style="font-size: 8px">/10</span>
                    </div>
                  </div>
                </div>
                <div
                  v-if="triaseHeader.lokasinyeri"
                  style="font-size: 11px; color: #555; padding: 4px 2px; margin-top: 4px"
                >
                  <strong>Lokasi Nyeri:</strong> {{ triaseHeader.lokasinyeri }}
                </div>
              </div>

              <!-- Tabel Pemeriksaan Triase -->
              <div class="kd-rs-group" v-if="triaseFacts && triaseFacts.length > 0">
                <div class="kd-rs-group-lbl">Hasil Pemeriksaan Triase</div>
                <table class="kd-triase-tbl">
                  <thead>
                    <tr>
                      <th>Pemeriksaan</th>
                      <th class="kdt-head kdt-head-emergensi">Emergensi</th>
                      <th class="kdt-head kdt-head-urgent">Urgent</th>
                      <th class="kdt-head kdt-head-nonurgent">Non Urgent</th>
                      <th class="kdt-head kdt-head-death">DOA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="group in triaseFacts" :key="group.grouping">
                      <td>
                        <strong>{{ group.grouping }}</strong>
                      </td>
                      <td>
                        <template v-for="(det, idx) in group.details" :key="'e' + idx">
                          <div
                            v-if="det.sk_1"
                            :class="[
                              'kdt-item',
                              det.checked_val_1 ? 'kdt-checked kdt-emergensi' : 'kdt-unchecked',
                            ]"
                          >
                            <span v-if="det.checked_val_1" class="kdt-ck">✓</span>{{ det.sk_1 }}
                          </div>
                        </template>
                      </td>
                      <td>
                        <template v-for="(det, idx) in group.details" :key="'u' + idx">
                          <div
                            v-if="det.sk_2"
                            :class="[
                              'kdt-item',
                              det.checked_val_2 ? 'kdt-checked kdt-urgent' : 'kdt-unchecked',
                            ]"
                          >
                            <span v-if="det.checked_val_2" class="kdt-ck">✓</span>{{ det.sk_2 }}
                          </div>
                        </template>
                      </td>
                      <td>
                        <template v-for="(det, idx) in group.details" :key="'n' + idx">
                          <div
                            v-if="det.sk_4"
                            :class="[
                              'kdt-item',
                              det.checked_val_4 ? 'kdt-checked kdt-nonurgent' : 'kdt-unchecked',
                            ]"
                          >
                            <span v-if="det.checked_val_4" class="kdt-ck">✓</span>{{ det.sk_4 }}
                          </div>
                        </template>
                      </td>
                      <td>
                        <template v-for="(det, idx) in group.details" :key="'d' + idx">
                          <div
                            v-if="det.sk_5"
                            :class="[
                              'kdt-item',
                              det.checked_val_5 ? 'kdt-checked kdt-death' : 'kdt-unchecked',
                            ]"
                          >
                            <span v-if="det.checked_val_5" class="kdt-ck">✓</span>{{ det.sk_5 }}
                          </div>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Secondary Survey -->
              <div class="kd-rs-group" v-if="triaseSurvey && triaseSurvey.length > 0">
                <div class="kd-rs-group-lbl">Secondary Survey</div>
                <table class="kd-obat-table">
                  <thead>
                    <tr>
                      <th>Objek</th>
                      <th>Kondisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in triaseSurvey" :key="item.id">
                      <td>
                        <strong>{{ item.organ }}</strong>
                      </td>
                      <td>
                        <span
                          v-if="item.kondisi === 'NORMAL'"
                          style="color: #1a6b4a; font-weight: 600"
                          >NORMAL</span
                        >
                        <span v-else>{{ item.kondisi || 'NORMAL' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Diagnosa -->
              <div class="kd-rs-group" v-if="triaseDiagnosa">
                <div class="kd-rs-group-lbl">Diagnosa</div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Diagnosa Utama</span>
                  <span class="kd-rs-val">{{ triaseDiagnosa.dx_utama || '—' }}</span>
                </div>
                <div class="kd-rs-row" v-if="triaseDiagnosa.dx_sekunder">
                  <span class="kd-rs-lbl">Diagnosa Sekunder</span>
                  <span class="kd-rs-val">{{ triaseDiagnosa.dx_sekunder }}</span>
                </div>
                <div class="kd-rs-row">
                  <span class="kd-rs-lbl">Jenis Kasus</span>
                  <span class="kd-rs-val">{{ triaseDiagnosa.jenis_kasus || '—' }}</span>
                </div>
              </div>

              <!-- Catatan Penting -->
              <div
                class="kd-rs-group"
                v-if="triaseHeader.catatanpenting || triaseHeader.CATATANPENTING"
              >
                <div class="kd-rs-group-lbl">Catatan Penting</div>
                <pre class="kd-rs-pre">{{
                  triaseHeader.catatanpenting || triaseHeader.CATATANPENTING
                }}</pre>
              </div>

              <!-- Rencana Tindak Lanjut -->
              <div class="kd-rs-group" v-if="triaseRTL">
                <div class="kd-rs-group-lbl">Rencana Tindak Lanjut</div>
                <div class="kd-rs-row" style="align-items: center; gap: 8px">
                  <span
                    :style="{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '12px',
                      background: triaseRTLBadgeBg,
                      color: triaseRTLBadgeColor,
                    }"
                  >
                  </span>

                  <span v-if="props.datapasien.KETERANGAN" style="font-size: 11px; color: #6c757d">
                    {{ props.datapasien.KETERANGAN }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- ══ KANAN: Resume Pulang (Rawat Inap) ══ -->
        <div v-else class="kd-col-right">
          <div class="kd-resume-panel">
            <Tag class="kd-resume-panel-title" severity="success">
              <i class="pi pi-file-check"></i> Resume Pulang
            </Tag>

            <!-- Pasien -->
            <div class="kd-rs-group">
              <div class="kd-rs-group-lbl">Pasien</div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">Nama</span
                ><span class="kd-rs-val">{{ ranapData.NAMAPASIEN || '—' }}</span>
              </div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">No. RM</span
                ><span class="kd-rs-val kd-rs-accent">{{ ranapData.NOMR || '—' }}</span>
              </div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">Dokter</span
                ><span class="kd-rs-val">{{ ranapData.NAMADOKTER || '—' }}</span>
              </div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">Masuk</span
                ><span class="kd-rs-val">{{ ranapData.MASUKPOLY_DISPLAY || '—' }}</span>
              </div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">Keluar</span
                ><span class="kd-rs-val">{{ ranapData.KELUARPOLY || '—' }}</span>
              </div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">NOSEP</span
                ><span class="kd-rs-val">{{ ranapData.NOSEP || '—' }}</span>
              </div>
            </div>

            <!-- TTV -->
            <div class="kd-rs-group" v-if="triaseData?.tensi_sistol">
              <div class="kd-rs-group-lbl">TTV saat masuk</div>
              <div class="kd-ttv-mini">
                <div class="kd-ttv-item">
                  <div class="kd-ttv-lbl">TD</div>
                  <div class="kd-ttv-val">
                    {{ triaseData?.tensi_sistol }}/{{ triaseData?.tensi_distol }}
                  </div>
                </div>
                <div class="kd-ttv-item">
                  <div class="kd-ttv-lbl">Nadi</div>
                  <div class="kd-ttv-val">{{ triaseData?.nadipermenit || '—' }}</div>
                </div>
                <div class="kd-ttv-item">
                  <div class="kd-ttv-lbl">Suhu</div>
                  <div class="kd-ttv-val">{{ triaseData?.suhu || '—' }}</div>
                </div>
                <div class="kd-ttv-item">
                  <div class="kd-ttv-lbl">SpO2</div>
                  <div class="kd-ttv-val">{{ triaseData?.saturasi ?? '—' }}%</div>
                </div>
                <div class="kd-ttv-item">
                  <div class="kd-ttv-lbl">RR</div>
                  <div class="kd-ttv-val">{{ triaseData?.respirasi || '—' }}</div>
                </div>
              </div>
            </div>

            <!-- Diagnosa -->
            <div class="kd-rs-group">
              <div class="kd-rs-group-lbl">Diagnosa</div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">Dx Masuk</span
                ><span class="kd-rs-val">{{
                  resumeData?.dx_masuk?.dx_utama || ranapData?.DIAGNOSA_AWAL || '—'
                }}</span>
              </div>
              <div class="kd-rs-row kd-rs-row-highlight">
                <span class="kd-rs-lbl kd-rs-lbl-accent">Dx Keluar</span>
                <span class="kd-rs-val kd-rs-val-bold">{{ ranapData.DX_CAPTION || '—' }}</span>
              </div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">Keluhan</span
                ><span class="kd-rs-val">{{
                  triaseData?.keluhan_utama || resumeData.keluhan_utama || '—'
                }}</span>
              </div>
              <div class="kd-rs-row">
                <span class="kd-rs-lbl">Keadaan</span
                ><span class="kd-rs-val">{{ ranapData.KEADAAN_SAAT_PULANG || '—' }}</span>
              </div>
            </div>

            <!-- Hasil Lab Abnormal -->
            <div class="kd-rs-group" v-if="labAbnormal.length > 0">
              <div class="kd-rs-group-lbl">
                <i class="pi pi-exclamation-triangle" style="color: #a03030; margin-right: 4px"></i>
                Hasil Lab Abnormal ({{ labAbnormal.length }})
              </div>
              <table class="kd-lab-table">
                <thead>
                  <tr>
                    <th>Pemeriksaan</th>
                    <th>Hasil</th>
                    <th>Normal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="lab in labAbnormal" :key="lab.ID">
                    <td>{{ lab.PEMERIKSAAN }}</td>
                    <td class="kd-lab-abnormal">{{ lab.HASIL }}</td>
                    <td class="kd-lab-normal">{{ lab.NORMAL }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Obat Pulang -->
            <div class="kd-rs-group" v-if="obatPulang.length > 0">
              <div class="kd-rs-group-lbl">Terapi Pulang ({{ obatPulang.length }})</div>
              <table class="kd-obat-table">
                <thead>
                  <tr>
                    <th>Nama Obat</th>
                    <th>Dosis</th>
                    <th style="text-align: center">Jml</th>
                    <th>Sat.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ob, i) in obatPulang" :key="i">
                    <td class="kd-obat-nama">{{ ob.NAMABARANG }}</td>
                    <td>{{ ob.REMARK_ITEM || '—' }}</td>
                    <td style="text-align: center">{{ parseFloat(ob?.QTY || 0) }}</td>
                    <td>{{ ob.SATUAN }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Obat Selama Rawat -->
            <div class="kd-rs-group" v-if="obatRawat.length > 0">
              <div class="kd-rs-group-lbl">Obat Selama Rawat ({{ obatRawat.length }})</div>
              <div class="kd-obat-chips">
                <span v-for="(ob, i) in obatRawat" :key="i" class="kd-obat-chip">{{ ob }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer aksi -->
    <template #footer>
      <div class="kd-footer">
        <Button
          @click="PrintRekamMedisEl()"
          severity="info"
          label="Rekam Medis EL"
          icon="pi pi-file-pdf"
          outlined
        ></Button>
        <Button
          @click="printResumePasien()"
          severity="info"
          label="Print Resume"
          icon="pi pi-file-pdf"
          outlined
        ></Button>
        <Button label="Batal" icon="pi pi-times" severity="secondary" outlined @click="onHide" />
        <Button
          label="Simpan Klaim"
          icon="pi pi-save"
          severity="success"
          :loading="saving"
          @click="simpanKlaim"
          :disabled="isReadOnly"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Skeleton from 'primevue/skeleton'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, group_user } = storeToRefs(authStore)
const isReadOnly = computed(() => group_user.value === 'ENTRI_KLAIM')
const toast = useToast()
import { useRouter } from 'vue-router'
const router = useRouter()

// ── Props & Emits ────────────────────────────────────────
const props = defineProps({
  showKlaim: { type: Boolean, default: false },
  datapasien: { type: Object, default: () => ({ NOPENDAFTARAN: '' }) },
})

const emit = defineEmits(['update:showKlaim', 'saved'])

const visible = computed({
  get: () => props.showKlaim,
  set: (v) => emit('update:showKlaim', v),
})

const formatTglLahir = (val) => {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Lifecycle guard ──────────────────────────────────────
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})
onUnmounted(() => {
  isMounted.value = false
})

// ── State ────────────────────────────────────────────────
const loading = ref(false)
const saving = ref(false)

const pasienInfo = ref({})
const resumeData = ref({})
const ranapData = ref({})
const triaseData = ref({})
const obatPulang = ref([])
const obatRawat = ref([])
const labAbnormal = ref([])

const dxUtama = ref(null)
const listDxSekunder = ref([])
const listProsedur = ref([])

const listDiagnose = ref([])
const listProsedurOptions = ref([])
const listDokterOptions = ref([])
const listDokterRawat = ref([])
const loadingDokter = ref(false)

const statusKlaim = ref('lengkap')
const catatanPerbaikan = ref('')
const catatanUmum = ref('')
const showValidasiCatatan = ref(false)

const statusOptions = [
  {
    value: 'lengkap',
    label: 'Lengkap',
    desc: 'Rekam medis sudah lengkap dan sesuai',
    icon: 'pi pi-check-circle',
  },
  {
    value: 'perbaikan',
    label: 'Perlu Perbaikan',
    desc: 'Ada data yang perlu dikoreksi/dilengkapi',
    icon: 'pi pi-exclamation-triangle',
  },
]

// ── Watch: load data saat dialog dibuka ──────────────────
watch(
  [() => props.datapasien?.NOPENDAFTARAN, () => props.showKlaim],
  async ([noreg, show]) => {
    if (show && noreg) {
      try {
        const calls = [loadResume(noreg), fetchKlaimJson(noreg)]
        if (props.datapasien?.JENISRAWAT === 'JALAN' && props.datapasien?.KODEPOLI !== 'IGD') {
          calls.push(pasien_rajal_pol(noreg))
        }
        if (props.datapasien?.JENISRAWAT === 'JALAN' && props.datapasien?.KODEPOLI === 'IGD') {
          calls.push(fetchTriaseDataIGD(noreg))
        }
        await Promise.all(calls)
      } catch (err) {
        console.error('KlaimResume watcher error:', err)
      }
    }
  },
  { immediate: true },
)

const printResumePasien = () => {
  const routeData = router.resolve({
    name: 'ResumeRanapView',
    query: { noreg: props.datapasien.NOPENDAFTARAN },
  })
  window.open(routeData.href, '_blank')
}

const PrintRekamMedisEl = () => {
  //onHide()
  const routeData = router.resolve({
    name: 'RMEViewer',
    query: { noreg: props.datapasien.NOPENDAFTARAN },
  })
  window.open(routeData.href, '_blank')
}

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Peringatan',
    detail: message,
    life: 4000,
  })
}

const showError = (message) => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

// ── API: load resume ─────────────────────────────────────
async function loadResume(noreg) {
  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Resumepulang/getdata_resume_v2`,
      { noregister: noreg, id_client: id_client.value },
    )

    if (!isMounted.value) return
    const d = res.data
    pasienInfo.value = d.data_ranap ?? {}
    resumeData.value = d.resume ?? {}
    ranapData.value = d.data_ranap ?? {}
    triaseData.value = d.triase_igd ?? {}
    obatPulang.value = Array.isArray(d.obat_pulang) ? d.obat_pulang : []
    obatRawat.value = String(d.obat_penunjang?.obatan ?? '')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter((v, i, a) => a.indexOf(v) === i)
    labAbnormal.value = Array.isArray(d.obat_penunjang?.hasil_lab_positiv)
      ? d.obat_penunjang.hasil_lab_positiv
      : []

    // Prefill dx utama dari resume jika ada

    if (d.resume?.dx_masuk && typeof d.resume.dx_masuk === 'object') {
      dxUtama.value = d.resume.dx_masuk
    }
  } catch (err) {
    console.error(err)
    if (isMounted.value) {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal memuat data resume',
        life: 4000,
      })
    }
  } finally {
    if (isMounted.value) loading.value = false
  }
}

// ── API: search diagnosa ICD ─────────────────────────────
// 1. Tambahkan fungsi pencarian yang lebih cerdas
async function searchDiagnose(event) {
  const query = event.value
  if (!query || query.length < 2) return

  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/get_icd_v2`,
      { mode: 1, param: query },
    )

    const results = res.data ?? []

    // Ambil semua yang sudah terpilih agar tetap ada di list
    const selectedItems = [dxUtama.value, ...listDxSekunder.value, ...listProsedur.value].filter(
      (item) => item !== null && typeof item === 'object',
    )

    // Gabungkan hasil pencarian baru dengan yang sudah terpilih
    const combined = [...results, ...selectedItems]

    // Gunakan icd_code sebagai key unik (sesuai JSON Anda)
    const uniqueMap = new Map()
    combined.forEach((item) => {
      if (item.icd_code) {
        // <--- Pakai icd_code
        uniqueMap.set(item.icd_code, item)
      }
    })

    listDiagnose.value = Array.from(uniqueMap.values())
  } catch (err) {
    console.error('Pencarian gagal:', err)
  }
}

const get_procedure = async (event) => {
  let query = event.value
  if (!query || query.length < 2) return

  // Format kode prosedur: tambah titik setelah 2 digit pertama jika belum ada
  if (/^\d{2,}$/.test(query)) {
    query = query.slice(0, 2) + '.' + query.slice(2)
  }

  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/get_tindakan_v2`,
      { mode: 1, param: query },
    )

    const results = res.data ?? []
    const uniqueMap = new Map()
    results.forEach((item) => {
      if (item.kode) {
        item.search_key = item.kode.replace('.', '')
        uniqueMap.set(item.kode, item)
      }
    })
    listProsedurOptions.value = Array.from(uniqueMap.values())
  } catch (err) {
    console.error('Pencarian prosedur gagal:', err)
    listProsedurOptions.value = []
  }
}
// ── Dx Sekunder & Prosedur helpers ───────────────────────
function tambahDxSekunder() {
  listDxSekunder.value.push(null)
}
function hapusDxSekunder(idx) {
  listDxSekunder.value.splice(idx, 1)
}
function tambahProsedur() {
  listProsedur.value.push(null)
}
function hapusProsedur(idx) {
  listProsedur.value.splice(idx, 1)
}

// ── Dokter rawat bersama ──────────────────────────────────
async function searchDokter(event) {
  const query = event.value
  if (!query || query.length < 2) return
  loadingDokter.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/datadokterv3`,
      { id_client: id_client.value, mode: 2, nama: query },
    )
    listDokterOptions.value = res.data?.response ?? []
  } catch {
    listDokterOptions.value = []
  } finally {
    loadingDokter.value = false
  }
}
function tambahDokter() {
  listDokterRawat.value.push(null)
}
function hapusDokter(idx) {
  listDokterRawat.value.splice(idx, 1)
}

const klaimJson = ref(null)

/**
 * Ambil data klaim JSON dari API.
 * Contoh respons JSON yang diharapkan:
 * {
 *   "noregister": "72604418143",
 *   "nosep": "0007R0050426V002066",
 *   "user_id": "7-it",
 *   "dx_utama": { ... },
 *   "dx_sekunder": [ ... ],
 *   "prosedur": [ ... ],
 *   "status_klaim": "perbaikan",
 *   "catatan_perbaikan": "----",
 *   "catatan_umum": "",
 *   "dokter_rawat_bersama": [ ... ]
 * }
 */
const applyKlaimJson = (data) => {
  if (!data) return
  klaimJson.value = data

  const dxUtamaValue = data.dx_utama || null
  const dxSekunderValues = Array.isArray(data.dx_sekunder) ? data.dx_sekunder.filter(Boolean) : []
  const prosedurValues = Array.isArray(data.prosedur) ? data.prosedur.filter(Boolean) : []
  const dokterValues = Array.isArray(data.dokter_rawat_bersama)
    ? data.dokter_rawat_bersama.map((doc) => ({
        KDDOKTER: doc.kddokter || doc.KDDOKTER || '',
        NAMADOKTER: doc.nama || doc.NAMADOKTER || '',
      }))
    : []

  dxUtama.value = dxUtamaValue
  listDxSekunder.value = dxSekunderValues
  listProsedur.value = prosedurValues
  listDokterRawat.value = dokterValues

  listDiagnose.value = [dxUtamaValue, ...dxSekunderValues].filter(Boolean).reduce((acc, item) => {
    if (!acc.find((i) => i.icd_code === item.icd_code)) acc.push(item)
    return acc
  }, [])

  listProsedurOptions.value = prosedurValues.reduce((acc, item) => {
    if (!acc.find((i) => i.kode === item.kode)) acc.push(item)
    return acc
  }, [])

  listDokterOptions.value = dokterValues.reduce((acc, item) => {
    if (!acc.find((i) => i.KDDOKTER === item.KDDOKTER)) acc.push(item)
    return acc
  }, [])

  statusKlaim.value = data.status_klaim || 'lengkap'
  catatanPerbaikan.value = data.catatan_perbaikan || ''
  catatanUmum.value = data.catatan_umum || ''
}

async function fetchKlaimJson(noregister) {
  if (!noregister || !String(noregister).trim()) {
    showWarning('No registrasi tidak boleh kosong')
    return null
  }

  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_claim_data/${noregister}/${id_client.value}`,
    )

    console.log('Respons klaim JSON:', response.data)

    if (response?.data) {
      applyKlaimJson(response.data)
      return response.data
    }

    showWarning('Respons API klaim kosong')
    return null
  } catch (error) {
    console.error('Error fetching klaim JSON:', error)
    showError('Gagal mengambil data klaim: ' + (error.message || 'Unknown error'))
    return null
  } finally {
    loading.value = false
  }
}

// ── Simpan klaim ─────────────────────────────────────────
async function simpanKlaim() {
  if (statusKlaim.value != 'perbaikan') {
    if (!dxUtama.value) {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: 'Diagnosa utama wajib diisi',
        life: 3000,
      })
      return
    }
  }
  if (statusKlaim.value === 'perbaikan' && !catatanPerbaikan.value.trim()) {
    showValidasiCatatan.value = true
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Catatan perbaikan wajib diisi',
      life: 3000,
    })
    return
  }
  showValidasiCatatan.value = false
  saving.value = true
  try {
    const payload = {
      noregister: props.datapasien.NOPENDAFTARAN,
      nosep: ranapData.value.NOSEP,
      id_client: id_client.value,
      user_id: user_id.value,
      dx_utama: dxUtama.value,
      dx_sekunder: listDxSekunder.value.filter(Boolean),
      prosedur: listProsedur.value.filter(Boolean),
      status_klaim: statusKlaim.value,
      stts_coder: statusKlaim.value === 'lengkap' ? 1 : 2,
      catatan_perbaikan: statusKlaim.value === 'lengkap' ? '' : catatanPerbaikan.value,
      catatan_umum: catatanUmum.value,
      dokter_rawat_bersama: listDokterRawat.value.filter(Boolean).map((d) => ({
        kddokter: d.KDDOKTER,
        nama: d.NAMADOKTER,
      })),
    }

    console.log('Payload klaim yang akan disimpan:', JSON.stringify(payload))

    await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/save_data_claim_v2`,
      payload,
    )
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data klaim tersimpan',
      life: 3000,
    })
    emit('saved', payload)
    onHide()
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal menyimpan klaim', life: 5000 })
  } finally {
    saving.value = false
  }
}

// ── Reset & tutup ─────────────────────────────────────────
function onHide() {
  visible.value = false
  dxUtama.value = null
  listDxSekunder.value = []
  listProsedur.value = []
  listDiagnose.value = []
  listProsedurOptions.value = []
  listDokterRawat.value = []
  listDokterOptions.value = []
  pasienInfo.value = {}
  resumeData.value = {}
  ranapData.value = {}
  triaseData.value = {}
  obatPulang.value = []
  obatRawat.value = []
  labAbnormal.value = []
  statusKlaim.value = 'lengkap'
  catatanPerbaikan.value = ''
  catatanUmum.value = ''
  showValidasiCatatan.value = false
  ResumeRawatJalan.value = null
  rajalDataMasuk.value = null
  loadingRajal.value = false
  triaseHeader.value = {}
  triaseFacts.value = []
  triaseNilai.value = null
  triaseSurvey.value = []
  triaseRTL.value = null
  triaseDiagnosa.value = null
}

const isRajalNonIGD = computed(
  () => props.datapasien?.JENISRAWAT === 'JALAN' && props.datapasien?.KODEPOLI !== 'IGD',
)

const isRajalIGD = computed(
  () => props.datapasien?.JENISRAWAT === 'JALAN' && props.datapasien?.KODEPOLI === 'IGD',
)

// ── State Triase IGD (untuk JALAN + KODEPOLI=IGD) ────────────────────────
const loadingTriase = ref(false)
const triaseHeader = ref({})
const triaseFacts = ref([])
const triaseNilai = ref(null)
const triaseSurvey = ref([])
const triaseRTL = ref(null)
const triaseDiagnosa = ref(null)

const triaseKesimpulanKey = computed(() => {
  if (!triaseNilai.value) return ''
  if ((triaseNilai.value.EMERGENSI || 0) > 0) return 'emergensi'
  if ((triaseNilai.value.URGENT || 0) > 0) return 'urgent'
  if ((triaseNilai.value.NON_URGENT || 0) > 0) return 'nonurgent'
  if ((triaseNilai.value.DEATH_ON_ARRIVAL || 0) > 0) return 'death'
  return ''
})

const triaseKesimpulan = computed(() => {
  const k = triaseKesimpulanKey.value
  if (k === 'emergensi') return 'EMERGENSI'
  if (k === 'urgent') return 'URGENT'
  if (k === 'nonurgent') return 'NON URGENT'
  if (k === 'death') return 'DEATH ON ARRIVAL'
  return 'BELUM DITENTUKAN'
})

const triaseRTLLabel = computed(() => {
  if (!triaseRTL.value) return '-'
  const map = {
    1: 'Pulang',
    2: 'Observasi',
    3: 'Rawat Jalan',
    4: 'Rujuk Keluar',
    5: 'APS',
    6: 'Meninggal',
    7: 'Rawat Inap',
  }
  return map[triaseRTL.value.STATUS] || `Status ${triaseRTL.value.STATUS}`
})

const triaseRTLBadgeBg = computed(() => {
  const map = {
    1: '#e8f5e9',
    2: '#e3f2fd',
    3: '#e3f2fd',
    4: '#fff8e1',
    5: '#fff8e1',
    6: '#ffebee',
    7: '#e8eaf6',
  }
  return map[triaseRTL.value?.STATUS] || '#f5f5f5'
})

const triaseRTLBadgeColor = computed(() => {
  const map = {
    1: '#1b5e20',
    2: '#0d47a1',
    3: '#0d47a1',
    4: '#e65100',
    5: '#e65100',
    6: '#b71c1c',
    7: '#1a237e',
  }
  return map[triaseRTL.value?.STATUS] || '#444'
})

async function fetchTriaseDataIGD(noreg) {
  if (!noreg) return
  loadingTriase.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Triaseigd/getitem_triase`, {
      noregister: noreg,
      id_client: id_client.value,
      norm: props.datapasien?.NOMR || '',
    })
    if (!isMounted.value) return
    const data = response.data
    triaseHeader.value = data.header || {}
    triaseFacts.value = data.response || []
    triaseNilai.value = data.nilatriase || null
    triaseSurvey.value = Array.isArray(data.survey) ? data.survey : []
    if (data.header?.STATUS !== undefined && data.header?.STATUS !== null) {
      triaseRTL.value = { STATUS: data.header.STATUS, KETERANGAN: data.header.KETERANGAN || '' }
    }
    if (data.diagnosa?.metadata?.code === 200 && data.diagnosa?.response) {
      triaseDiagnosa.value = data.diagnosa.response
    }
  } catch (e) {
    console.error('Gagal memuat data triase IGD:', e)
  } finally {
    if (isMounted.value) loadingTriase.value = false
  }
}

const ResumeRawatJalan = ref(null)
const rajalDataMasuk = ref(null)
const loadingRajal = ref(false)
async function pasien_rajal_pol(noreg) {
  if (!noreg) return
  loadingRajal.value = true

  try {
    const url = configStore.apiBaseUrl
    const res = await axios.get(
      `${url}index.php/api/transaksi_pasien/getdata_asesmen/${noreg}/${id_client.value}`,
    )

    if (!isMounted.value) return
    ResumeRawatJalan.value = res.data?.response ?? {}
    rajalDataMasuk.value = res.data?.datamasuk ?? null
  } catch (e) {
    console.error(e)
  } finally {
    if (isMounted.value) loadingRajal.value = false
  }
}

defineExpose({
  open: (noreg) => {
    loadResume(noreg)
  },
})
</script>

<style scoped>
/* ── Dialog header ── */
:deep(.klaim-dialog .p-dialog-header) {
  padding: 0 !important;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 8px 8px 0 0;
}
:deep(.klaim-dialog .p-dialog-header-actions .p-button) {
  color: #a8d5c0 !important;
}
:deep(.klaim-dialog .p-dialog-content) {
  padding: 0 !important;
}
:deep(.klaim-dialog .p-dialog-footer) {
  padding: 10px 16px;
  border-top: 1px solid #e9ecef;
}

.kd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
}
.kd-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.kd-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 17px;
}
.kd-header-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}
.kd-header-sub {
  font-size: 11px;
  color: #a8d5c0;
  margin-top: 2px;
}

/* ── Loading ── */
.kd-loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 14px;
}
.kd-loading .pi {
  font-size: 1.5rem;
  color: #1a6b4a;
  margin-right: 8px;
}

/* ── Body ── */
.kd-body {
  padding: 0;
  height: 72vh;
  overflow: hidden;
}

/* ── 2-column layout ── */
.kd-columns {
  display: grid;
  grid-template-columns: 3fr 3fr;
  height: 100%;
}
.kd-col-left {
  padding: 16px;
  overflow-y: auto;
  border-right: 1px solid #e9ecef;
}
.kd-col-right {
  background: #f4fbf7;
  height: auto;
  overflow-y: auto;
}

/* ── Info strip ── */
.kd-info-strip {
  display: flex;
  gap: 0;
  background: linear-gradient(135deg, #f0fdf4, #e8f5f0);
  border: 1px solid #b2dfce;
  border-radius: 8px;
  margin-bottom: 14px;
  overflow: hidden;
}
.kd-strip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  flex: 1;
  border-right: 1px solid #b2dfce;
}
.kd-strip-item:last-child {
  border-right: none;
}

.kd-strip-item > .pi {
  color: #1a6b4a;
  font-size: 14px;
  margin-top: 3px;
  flex-shrink: 0;
}
.kd-strip-lbl {
  font-size: 10px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kd-strip-val {
  font-size: 13px;
  font-weight: 700;
  color: #1a6b4a;
  margin-top: 1px;
}

/* ── Form card ── */
.kd-form-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 14px;
}

/* ── Info bar (legacy, keep for compat) ── */
.kd-info-bar {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  background: #f8fdf9;
  border: 1px solid #b2dfce;
  border-radius: 8px;
  padding: 10px 14px;
}
.kd-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kd-info-lbl {
  font-size: 10px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kd-info-val {
  font-size: 13px;
  font-weight: 600;
  color: #1a6b4a;
}

/* ── Section ── */
.kd-section {
  margin-bottom: 14px;
}
.kd-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 8px;
}

/* ── Dx row ── */
.kd-dx-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.kd-dx-badge {
  flex-shrink: 0;
}
.kd-empty-dx {
  font-size: 12px;
  color: #adb5bd;
  font-style: italic;
  padding: 6px 2px;
}

/* ── Dropdown option ── */
.dx-option {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.dx-code {
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: #1a6b4a;
  flex-shrink: 0;
  min-width: 60px;
}
.dx-name {
  font-size: 13px;
}

/* ── Resume ringkas ── */
.kd-resume-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kd-resume-row {
  display: flex;
  gap: 0;
  font-size: 13px;
}
.kd-resume-lbl {
  width: 130px;
  flex-shrink: 0;
  color: #6c757d;
  font-size: 12px;
}
.kd-resume-val {
  font-weight: 500;
  flex: 1;
}

/* ── Resume panel kanan ── */
.kd-resume-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.kd-resume-panel-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
  padding: 10px 14px;
  flex-shrink: 0;
}
.kd-rs-group {
  padding: 10px 14px;
  border-bottom: 1px solid #e8f5f0;
}
.kd-rs-group:last-child {
  border-bottom: none;
}
.kd-rs-group-lbl {
  font-size: 10px;
  font-weight: 700;
  color: #1a6b4a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}
.kd-rs-row {
  display: flex;
  font-size: 12.5px;
  margin-bottom: 3px;
  line-height: 1.4;
}
.kd-rs-lbl {
  width: 90px;
  flex-shrink: 0;
  color: #6c757d;
  font-size: 11px;
}
.kd-rs-val {
  font-weight: 500;
  flex: 1;
  word-break: break-word;
}
.kd-rs-accent {
  color: #1a6b4a;
  font-weight: 700;
}

.kd-jenis-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  vertical-align: middle;
  line-height: 1.6;
}
.kd-jenis-baru {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}
.kd-jenis-lama {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #7dd3fc;
}

.kd-gender-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  vertical-align: middle;
  line-height: 1.6;
}
.kd-gender-l {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}
.kd-gender-p {
  background: #fce7f3;
  color: #be185d;
  border: 1px solid #f9a8d4;
}

.kd-rs-row-highlight {
  background: #f0fdf4;
  border-left: 3px solid #1a6b4a;
  border-radius: 4px;
  padding: 5px 8px;
  margin: 4px 0;
}
.kd-rs-lbl-accent {
  color: #1a6b4a;
  font-weight: 700;
}
.kd-rs-val-bold {
  font-weight: 800;
  font-size: 13px;
  color: #1a6b4a;
}

.kd-ttv-mini {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin-top: 4px;
}
.kd-ttv-item {
  background: #fff;
  border: 1px solid #b2dfce;
  border-radius: 6px;
  padding: 5px 4px;
  text-align: center;
}
.kd-ttv-lbl {
  font-size: 9px;
  font-weight: 700;
  color: #6c757d;
  text-transform: uppercase;
}
.kd-ttv-val {
  font-size: 13px;
  font-weight: 700;
  color: #1a6b4a;
  margin-top: 2px;
}
.kd-obat-row {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  border-bottom: 1px dashed #e8f5f0;
}
.kd-obat-row:last-child {
  border-bottom: none;
}
.kd-obat-nama {
  font-size: 12px;
  font-weight: 600;
  color: #212529;
}
.kd-obat-info {
  font-size: 11px;
  color: #6c757d;
  margin-top: 1px;
}

/* ── Obat pulang table ── */
.kd-obat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-top: 4px;
}
.kd-obat-table th {
  background: #f0fdf4;
  color: #1a6b4a;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 4px 8px;
  text-align: left;
  border-bottom: 1px solid #b2dfce;
}
.kd-obat-table td {
  padding: 4px 8px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}
.kd-obat-table tbody tr:last-child td {
  border-bottom: none;
}
.kd-obat-table .kd-obat-nama {
  font-weight: 600;
  color: #212529;
}

/* ── Obat rawat chips ── */
.kd-obat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.kd-obat-chip {
  display: inline-block;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.kd-rs-pre {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  color: #212529;
  background: #f0fdf4;
  border-left: 3px solid #b2dfce;
  border-radius: 0 4px 4px 0;
  padding: 6px 10px;
}

/* ── Lab abnormal table ── */
.kd-lab-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-top: 4px;
}
.kd-lab-table th {
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 8px;
  text-align: left;
  border-bottom: 1px solid #fca5a5;
}
.kd-lab-table td {
  padding: 4px 8px;
  border-bottom: 1px solid #fef2f2;
  vertical-align: middle;
}
.kd-lab-table tbody tr:last-child td {
  border-bottom: none;
}
.kd-lab-abnormal {
  font-weight: 700;
  color: #dc2626;
}
.kd-lab-normal {
  color: #6c757d;
  font-size: 10px;
}

/* ── Status kelengkapan ── */
.kd-status-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.kd-status-opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
}
.kd-status-opt:hover {
  border-color: #adb5bd;
  background: #f8f9fa;
}

.kd-status-opt.kd-status-opt-active.kd-status-opt-lengkap {
  border-color: #1a6b4a;
  background: #f0fdf4;
}
.kd-status-opt.kd-status-opt-active.kd-status-opt-lengkap .pi {
  color: #1a6b4a;
}
.kd-status-opt.kd-status-opt-active.kd-status-opt-perbaikan {
  border-color: #dc2626;
  background: #fff5f5;
}
.kd-status-opt.kd-status-opt-active.kd-status-opt-perbaikan .pi {
  color: #dc2626;
}

.kd-status-opt > .pi {
  font-size: 18px;
  margin-top: 1px;
  color: #adb5bd;
  flex-shrink: 0;
}
.kd-status-opt-lbl {
  font-size: 13px;
  font-weight: 700;
  color: #212529;
}
.kd-status-opt-desc {
  font-size: 11px;
  color: #6c757d;
  margin-top: 2px;
}

.kd-err-msg {
  color: #dc2626;
  font-size: 11px;
  margin-top: 4px;
  display: block;
}

/* ── Footer ── */
.kd-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ── Triase IGD: Skor ── */
.tks-scores {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-bottom: 6px;
}
.tks-box {
  text-align: center;
  border-radius: 6px;
  padding: 6px 4px;
  color: #fff;
}
.tks-num {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}
.tks-lbl {
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-top: 2px;
  white-space: nowrap;
}
.tks-emergensi {
  background: #c62828;
}
.tks-urgent {
  background: #f9a825;
  color: #333;
}
.tks-nonurgent {
  background: #2e7d32;
}
.tks-death {
  background: #212121;
}

.tks-kesimpulan {
  text-align: center;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  background: #f5f5f5;
  border: 1.5px solid #e0e0e0;
  color: #444;
  margin-top: 2px;
}
.tks-kes-emergensi {
  background: #ffebee;
  color: #c62828;
  border-color: #ef9a9a;
}
.tks-kes-urgent {
  background: #fffde7;
  color: #e65100;
  border-color: #ffe082;
}
.tks-kes-nonurgent {
  background: #e8f5e9;
  color: #1b5e20;
  border-color: #a5d6a7;
}
.tks-kes-death {
  background: #212121;
  color: #fff;
  border-color: #000;
}

/* ── Triase IGD: Tabel ── */
.kd-triase-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  margin-top: 4px;
}
.kd-triase-tbl th {
  padding: 4px 5px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
.kd-triase-tbl td {
  padding: 4px 5px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}
.kdt-head {
  color: #fff;
}
.kdt-head-emergensi {
  background: #c62828;
}
.kdt-head-urgent {
  background: #f9a825;
  color: #333;
}
.kdt-head-nonurgent {
  background: #2e7d32;
}
.kdt-head-death {
  background: #212121;
}

.kdt-item {
  line-height: 1.4;
  padding: 1px 0;
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.kdt-ck {
  flex-shrink: 0;
}
.kdt-checked {
  font-weight: 700;
}
.kdt-unchecked {
  color: #bbb;
  font-size: 9px;
}
.kdt-emergensi {
  color: #b71c1c;
}
.kdt-urgent {
  color: #bf360c;
}
.kdt-nonurgent {
  color: #1b5e20;
}
.kdt-death {
  color: #212121;
}

/* ── Mobile Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  /* Body: dari fixed-height jadi scrollable */
  .kd-body {
    height: auto;
    overflow: visible;
  }

  /* Stack 2 kolom jadi 1 kolom */
  .kd-columns {
    grid-template-columns: 1fr;
    height: auto;
  }

  /* Kiri: hapus border kanan, beri padding lebih kecil */
  .kd-col-left {
    overflow-y: visible;
    border-right: none;
    border-bottom: 2px solid #e9ecef;
    padding: 12px;
  }

  /* Kanan: hapus background min-height */
  .kd-col-right {
    overflow-y: visible;
    height: auto;
  }

  /* Info strip: wrap ke 2x2 */
  .kd-info-strip {
    flex-wrap: wrap;
  }
  .kd-strip-item {
    flex: 1 1 calc(50% - 1px);
    min-width: 0;
    border-right: 1px solid #b2dfce;
    border-bottom: 1px solid #b2dfce;
  }
  .kd-strip-item:nth-child(2n) {
    border-right: none;
  }
  .kd-strip-item:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  /* TTV: 3 kolom di mobile */
  .kd-ttv-mini {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  /* Triase skor: 2 kolom */
  .tks-scores {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Status kelengkapan: 1 kolom */
  .kd-status-group {
    grid-template-columns: 1fr;
  }

  /* Footer buttons: wrap dan full width */
  .kd-footer {
    flex-wrap: wrap;
    gap: 6px;
  }
  .kd-footer :deep(.p-button) {
    flex: 1 1 calc(50% - 6px);
    justify-content: center;
  }

  /* Dx row: wrap agar tag tidak terpotong */
  .kd-dx-row {
    flex-wrap: wrap;
  }

  /* Triase table: horizontal scroll */
  .kd-triase-tbl {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
<style scoped>
/* Utility tambahan untuk skeleton jika belum ada di project */
.flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.flex-grow-1 {
  flex-grow: 1;
}
.align-items-center {
  align-items: center;
}
.justify-content-between {
  justify-content: space-between;
}
.gap-2 {
  gap: 0.5rem;
}
.w-full {
  width: 100%;
}
.mb-3 {
  margin-bottom: 0.75rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-3 {
  margin-top: 0.75rem;
}
.mt-4 {
  margin-top: 1rem;
}

/* Animasi halus untuk skeleton */
:deep(.p-skeleton) {
  background-color: #f1f3f5;
}
:deep(.p-skeleton::after) {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.4),
    rgba(255, 255, 255, 0)
  );
}
</style>
