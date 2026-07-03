<template>
  <div class="content">
    <Toast />

    <!-- ===== DIALOG: LAPORAN DOKTER IGD ===== -->
    <Dialog
      header="Laporan Inputan Dokter IGD"
      v-model:visible="showLaporanDokter"
      :modal="true"
      :style="{ width: '92vw', maxWidth: '1280px' }"
    >
      <!-- Stat strip compact -->
      <div class="d-flex flex-wrap mb-3" style="gap: 8px">
        <div class="lp-stat lp-stat-primary">
          <i class="fas fa-users lp-stat-icon"></i>
          <span class="lp-stat-num">{{ laporan.list.length }}</span>
          <span class="lp-stat-lbl">Total Pasien</span>
        </div>
        <div class="lp-stat lp-stat-success">
          <i class="pi pi-check-circle lp-stat-icon"></i>
          <span class="lp-stat-num">{{ laporanJumlahVerif }}</span>
          <span class="lp-stat-lbl">Sudah Verifikasi</span>
        </div>
        <div class="lp-stat lp-stat-warning">
          <i class="pi pi-clock lp-stat-icon"></i>
          <span class="lp-stat-num">{{ laporanJumlahBelumVerif }}</span>
          <span class="lp-stat-lbl">Belum Verifikasi</span>
        </div>
        <div class="lp-stat lp-stat-info">
          <i class="pi pi-chart-pie lp-stat-icon"></i>
          <span class="lp-stat-num">{{ laporanPersenVerif }}%</span>
          <span class="lp-stat-lbl">Terverifikasi</span>
        </div>
      </div>

      <!-- Filter card -->
      <div class="card card-outline card-primary shadow-sm mb-3">
        <div class="card-header py-2">
          <h3 class="card-title font-weight-bold mb-0">
            <i class="pi pi-filter mr-2" style="color: #1976d2"></i>Filter Data
          </h3>
        </div>
        <div class="card-body pb-2">
          <div class="row align-items-end">
            <div class="col-md-3">
              <label class="filter-label">Tanggal</label>
              <DatePicker
                v-model="laporan.tanggalObj"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                style="width: 100%"
                @date-select="onLaporanDateSelect"
              />
            </div>
            <div class="col-md-4">
              <label class="filter-label">Cari</label>
              <InputText
                v-model="laporan.keyword"
                placeholder="No. MR / Nama / DPJP / Keterangan..."
                style="width: 100%"
              />
            </div>
            <div class="col-md-3">
              <label class="filter-label">Status Verifikasi</label>
              <Select
                v-model="laporan.filterVerif"
                :options="laporanVerifOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Semua"
                style="width: 100%"
                showClear
              />
            </div>
            <div class="col-md-2 d-flex" style="gap: 6px">
              <Button
                label="Cari"
                icon="pi pi-search"
                class="p-button-primary p-button-sm"
                :disabled="laporan.loading"
                @click="fetchLaporanDokter()"
              />
              <Button
                icon="pi pi-refresh"
                class="p-button-secondary p-button-outlined p-button-sm"
                v-tooltip.top="'Reset filter'"
                @click="resetLaporanFilter()"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab card -->
      <div class="card card-outline card-primary shadow-sm">
        <div class="card-header p-0 border-bottom-0">
          <ul class="nav nav-tabs" style="border-bottom: none">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: laporan.activeTab === 'detail' }"
                href="#"
                @click.prevent="laporan.activeTab = 'detail'"
              >
                <i class="pi pi-list mr-1"></i> Detail Pasien
                <span class="badge badge-primary ml-1">{{ laporanFiltered.length }}</span>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: laporan.activeTab === 'summary' }"
                href="#"
                @click.prevent="laporan.activeTab = 'summary'"
              >
                <i class="pi pi-chart-bar mr-1"></i> Summary per Dokter
                <span class="badge badge-info ml-1">{{ laporanSummary.length }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Tab: Detail Pasien -->
        <div v-if="laporan.activeTab === 'detail'" class="card-body p-0">
          <DataTable
            :value="laporanFiltered"
            :rowHover="true"
            :paginator="true"
            :rows="15"
            class="p-datatable-sm p-datatable-striped"
            responsiveLayout="scroll"
            :rowsPerPageOptions="[10, 15, 20, 50]"
            :rowClass="laporanRowClass"
            :loading="laporan.loading"
          >
            <template #empty>
              <div class="text-center py-5 text-muted">
                <i class="fas fa-ambulance fa-2x mb-2 d-block opacity-50"></i>
                <strong>Tidak ada data triase</strong><br />
                <small>Pilih tanggal dan klik Cari untuk memuat data</small>
              </div>
            </template>
            <template #loading>
              <div class="text-center py-3">
                <i class="pi pi-spin pi-spinner mr-2"></i>Memuat data...
              </div>
            </template>
            <Column header="No" :style="{ width: '52px', textAlign: 'center' }">
              <template #body="slotProps">
                <span class="badge badge-secondary">{{ slotProps.index + 1 }}</span>
              </template>
            </Column>
            <Column field="NOMR" header="No. Rekam Medis" :style="{ width: '150px' }">
              <template #body="slotProps">
                <code class="text-primary font-weight-bold">{{ slotProps.data.NOMR || '-' }}</code>
              </template>
            </Column>
            <Column field="NAMAPASIEN" header="Nama Pasien" :style="{ minWidth: '180px' }">
              <template #body="slotProps">
                <span class="font-weight-bold">{{ slotProps.data.NAMAPASIEN || '—' }}</span>
              </template>
            </Column>
            <Column field="dpjp" header="DPJP / Dokter" :style="{ minWidth: '200px' }">
              <template #body="slotProps">
                <span
                  ><i class="pi pi-user mr-1 text-primary"></i
                  >{{ slotProps.data.dpjp || '—' }}</span
                >
              </template>
            </Column>
            <Column
              field="keterangan"
              header="Keterangan / Disposisi"
              :style="{ minWidth: '180px' }"
            >
              <template #body="slotProps">
                <span
                  v-if="slotProps.data.keterangan"
                  class="badge badge-info"
                  style="white-space: normal; text-align: left"
                >
                  {{ slotProps.data.keterangan }}
                </span>
                <span v-else class="text-muted"><em>—</em></span>
              </template>
            </Column>
            <Column field="telah_verif" header="Status Verifikasi" :style="{ width: '170px' }">
              <template #body="slotProps">
                <span v-if="slotProps.data.telah_verif == '1'" class="badge badge-success">
                  <i class="pi pi-check mr-1"></i>Sudah Diverifikasi
                </span>
                <span v-else class="badge badge-warning text-dark">
                  <i class="pi pi-clock mr-1"></i>Belum Diverifikasi
                </span>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Tab: Summary per Dokter -->
        <div v-if="laporan.activeTab === 'summary'" class="card-body p-0">
          <DataTable
            :value="laporanSummary"
            :rowHover="true"
            showGridlines
            class="p-datatable-sm"
            responsiveLayout="scroll"
            sortField="total"
            :sortOrder="-1"
          >
            <template #empty>
              <div class="text-center py-5 text-muted">
                <i class="pi pi-chart-bar fa-2x mb-2 d-block"></i>
                Tidak ada data
              </div>
            </template>
            <Column header="No" :style="{ width: '52px', textAlign: 'center' }">
              <template #body="slotProps">
                <span class="badge badge-secondary">{{ slotProps.index + 1 }}</span>
              </template>
            </Column>
            <Column
              field="dpjp"
              header="Dokter / DPJP"
              :sortable="true"
              :style="{ minWidth: '220px' }"
            >
              <template #body="slotProps">
                <span
                  ><i class="pi pi-user mr-1 text-primary"></i
                  >{{ slotProps.data.dpjp || '—' }}</span
                >
              </template>
            </Column>
            <Column
              field="total"
              header="Total Pasien"
              :sortable="true"
              :style="{ width: '130px', textAlign: 'center' }"
            >
              <template #body="slotProps">
                <span class="badge badge-primary" style="font-size: 13px">{{
                  slotProps.data.total
                }}</span>
              </template>
            </Column>
            <Column
              field="verif"
              header="Sudah Verif"
              :sortable="true"
              :style="{ width: '130px', textAlign: 'center' }"
            >
              <template #body="slotProps">
                <span class="badge badge-success" style="font-size: 13px">{{
                  slotProps.data.verif
                }}</span>
              </template>
            </Column>
            <Column
              field="belum"
              header="Belum Verif"
              :sortable="true"
              :style="{ width: '130px', textAlign: 'center' }"
            >
              <template #body="slotProps">
                <span class="badge badge-warning text-dark" style="font-size: 13px">{{
                  slotProps.data.belum
                }}</span>
              </template>
            </Column>
            <Column
              field="persen"
              header="% Verifikasi"
              :sortable="true"
              :style="{ minWidth: '160px' }"
            >
              <template #body="slotProps">
                <div class="d-flex align-items-center" style="gap: 8px">
                  <div class="progress flex-grow-1 mb-0" style="height: 10px">
                    <div
                      class="progress-bar bg-success"
                      :style="{ width: slotProps.data.persen + '%' }"
                    ></div>
                  </div>
                  <small class="font-weight-bold text-success">{{ slotProps.data.persen }}%</small>
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <Button
          label="Tutup"
          icon="pi pi-times"
          class="p-button-secondary p-button-outlined"
          @click="showLaporanDokter = false"
        />
      </template>
    </Dialog>

    <div class="container-fluid px-0">
      <!-- ===== FILTER CARD ===== -->
      <div class="card card-outline card-primary shadow-sm mb-3">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h3 class="card-title font-weight-bold mb-0">
            <i class="pi pi-filter mr-2" style="color: #1976d2"></i>
            Parameter Pencarian — IGD
          </h3>
          <div class="d-flex align-items-center" style="gap: 8px">
            <Button
              label="Laporan Dokter"
              icon="pi pi-chart-bar"
              class="p-button-sm p-button-outlined"
              style="border-color: #2d1b69; color: #2d1b69"
              @click="bukaLaporanDokter()"
            />
            <ProgressBar
              mode="indeterminate"
              v-show="isLoading"
              style="height: 0.25em; width: 180px; border-radius: 4px"
            />
          </div>
        </div>
        <div class="card-body pb-3">
          <div class="row">
            <!-- KOLOM KIRI: FILTER & PENCARIAN -->
            <div class="col-md-12">
              <div class="row align-items-end">
                <div class="col-md-3">
                  <label class="filter-label">Tanggal Kunjungan</label>
                  <DatePicker
                    v-model="startdate"
                    @date-select="onTanggalSelect"
                    :showIcon="true"
                    dateFormat="dd/mm/yy"
                    style="width: 100%"
                  />
                </div>
                <div class="col-md-4">
                  <label class="filter-label">Cari Nama / No. RM</label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      v-model="searchNama"
                      placeholder="Nama / No. RM / Dokter..."
                    />
                    <div class="input-group-append">
                      <button class="btn btn-primary" @click="getDataPasien('search')">
                        <i class="pi pi-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="col-md-5 d-flex align-items-end" style="gap: 5px">
                  <Button
                    label="Refresh"
                    icon="pi pi-refresh"
                    class="p-button-success p-button-outlined"
                    @click="getDataPasien('refresh')"
                    :loading="isLoading"
                  />
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-12">
                  <label class="filter-label">Filter Triase:</label>
                  <div class="d-flex flex-wrap" style="gap: 8px">
                    <button
                      type="button"
                      class="btn btn-xs"
                      :class="filterTriase === 'SEMUA' ? 'btn-primary' : 'btn-outline-primary'"
                      @click="filterTriase = 'SEMUA'"
                    >
                      Semua
                      <strong class="badge badge-light ml-1">{{ triaseStats.TOTAL }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-xs"
                      :class="filterTriase === 'EMERGENSI' ? 'btn-danger' : 'btn-outline-danger'"
                      @click="filterTriase = 'EMERGENSI'"
                    >
                      Emergensi
                      <strong class="badge badge-light ml-1">{{ triaseStats.EMERGENSI }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-xs"
                      :class="filterTriase === 'URGENT' ? 'btn-warning' : 'btn-outline-warning'"
                      @click="filterTriase = 'URGENT'"
                    >
                      Urgent
                      <strong class="badge badge-light ml-1">{{ triaseStats.URGENT }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-xs"
                      :class="filterTriase === 'NON URGENT' ? 'btn-success' : 'btn-outline-success'"
                      @click="filterTriase = 'NON URGENT'"
                    >
                      Non-Urgent
                      <strong class="badge badge-light ml-1">{{
                        triaseStats['NON URGENT']
                      }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-xs"
                      :class="filterTriase === 'DEATH ON ARRIVAL' ? 'btn-dark' : 'btn-outline-dark'"
                      @click="filterTriase = 'DEATH ON ARRIVAL'"
                    >
                      DOA
                      <strong class="badge badge-light ml-1">{{
                        triaseStats['DEATH ON ARRIVAL']
                      }}</strong>
                    </button>
                  </div>
                </div>
              </div>

              <div class="row mt-2">
                <div class="col-md-12">
                  <label class="filter-label">Filter Kelompok Usia:</label>
                  <div class="d-flex flex-wrap" style="gap: 8px">
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="filterUsia === 'SEMUA' ? 'btn-secondary' : 'btn-outline-secondary'"
                      @click="filterUsia = 'SEMUA'"
                      title="Semua usia"
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="filterUsia === 'BAYI' ? 'btn-usia-bayi' : 'btn-outline-usia-bayi'"
                      @click="filterUsia = 'BAYI'"
                      title="< 1 tahun"
                    >
                      Bayi
                      <strong class="badge badge-light ml-1">{{ usiaStats.BAYI }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="
                        filterUsia === 'BALITA' ? 'btn-usia-balita' : 'btn-outline-usia-balita'
                      "
                      @click="filterUsia = 'BALITA'"
                      title="1 – 4 tahun"
                    >
                      Balita
                      <strong class="badge badge-light ml-1">{{ usiaStats.BALITA }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="
                        filterUsia === 'REMAJA' ? 'btn-usia-remaja' : 'btn-outline-usia-remaja'
                      "
                      @click="filterUsia = 'REMAJA'"
                      title="5 – 17 tahun"
                    >
                      Remaja
                      <strong class="badge badge-light ml-1">{{ usiaStats.REMAJA }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="
                        filterUsia === 'DEWASA' ? 'btn-usia-dewasa' : 'btn-outline-usia-dewasa'
                      "
                      @click="filterUsia = 'DEWASA'"
                      title="18 – 59 tahun"
                    >
                      Dewasa
                      <strong class="badge badge-light ml-1">{{ usiaStats.DEWASA }}</strong>
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="
                        filterUsia === 'LANSIA' ? 'btn-usia-lansia' : 'btn-outline-usia-lansia'
                      "
                      @click="filterUsia = 'LANSIA'"
                      title="≥ 60 tahun"
                    >
                      Lansia
                      <strong class="badge badge-light ml-1">{{ usiaStats.LANSIA }}</strong>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== TABLE CARD ===== -->
      <div class="card card-outline card-primary shadow-sm">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h3 class="card-title font-weight-bold mb-0">
            <i class="pi pi-list mr-2" style="color: #1976d2"></i>
            Daftar Pasien IGD
          </h3>
          <small class="text-muted">
            Menampilkan <strong>{{ factFiltered.length }}</strong> dari
            <strong>{{ fact.length }}</strong> pasien
            <span v-if="searchNama" class="badge badge-info ml-1">Nama: "{{ searchNama }}"</span>
            <span v-if="filterTriase !== 'SEMUA'" class="badge badge-secondary ml-1"
              >Triase: {{ filterTriase }}</span
            >
            <span
              v-if="filterUsia !== 'SEMUA'"
              class="badge ml-1"
              :class="usiaFilterBadgeClass(filterUsia)"
              >Usia: {{ filterUsia }}</span
            >
          </small>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered table-hover mb-0 igd-table">
              <thead>
                <tr>
                  <th class="text-center" style="width: 40px">No</th>
                  <th class="text-center" style="width: 36px"></th>
                  <th>Pasien</th>
                  <th>Alamat</th>
                  <th>Status Rawat</th>
                  <th>Tgl Masuk / Keluar</th>
                  <th class="text-center" style="width: 70px">PENUNJANG</th>
                  <th>Cara Bayar</th>
                  <th class="text-center">Aksi</th>
                  <th class="text-center">Status IGD</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="factFiltered.length === 0">
                  <td colspan="10" class="text-center text-muted py-5">
                    <i class="pi pi-inbox" style="font-size: 2rem; opacity: 0.35"></i>
                    <div class="mt-2">
                      Data tidak ditemukan berdasarkan kriteria pencarian dan filter triase.
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="(row, k) in factFiltered"
                  :key="row.NOPENDAFTARAN"
                  :class="{ 'row-waiting': row.KODECARABAYAR == 27 || row.KODECARABAYAR == 28 }"
                >
                  <td class="text-center align-middle">
                    <span class="row-number">{{ k + 1 }}</span>
                  </td>
                  <td class="text-center align-middle">
                    <ion-icon
                      v-if="row.JENISKELAMIN === 'P'"
                      size="large"
                      style="color: #e91e8c"
                      name="woman-sharp"
                    ></ion-icon>
                    <ion-icon
                      v-if="row.JENISKELAMIN === 'L'"
                      size="large"
                      style="color: #1565c0"
                      name="man-sharp"
                    ></ion-icon>
                  </td>
                  <td class="align-middle">
                    <div class="pasien-nama"># {{ row.NOMR }} — {{ row.DATA_SINGKAT }}</div>
                    <small
                      >{{ row.USIA_PASIEN?.tahun }} Thn, {{ row.USIA_PASIEN?.bulan }} Bln,
                      {{ row.USIA_PASIEN?.hari }} Hr</small
                    >
                    <span
                      class="usia-kelompok-pill ml-1"
                      :class="'usia-kelompok-' + getKelompokUsia(row).toLowerCase()"
                    >
                      {{ getKelompokUsia(row) }}
                    </span>
                    <div class="pasien-dokter">{{ row.NAMADOKTER }}</div>

                    <div v-if="row.HASIL_TRIASE" class="mt-1">
                      <span :class="'triase-pill triase-pill-' + triasePillKey(row.HASIL_TRIASE)">
                        <span class="triase-pill-dot"></span>
                        {{ triaseBadgeLabel(row.HASIL_TRIASE) }}
                      </span>
                    </div>

                    <div
                      v-if="row.SIRIRAJ && row.SIRIRAJ.SKOR_AKIR"
                      class="d-inline-block text-center border rounded p-1 bg-light mt-4 siriraj-clickable"
                      @click="sirirajScore(row.NOPENDAFTARAN)"
                      title="Klik untuk buka form Siriraj Score"
                    >
                      <div class="badge badge-danger d-block mb-1">
                        <i class="pi pi-external-link mr-1" style="font-size: 0.65rem"></i>
                        Siriraj: {{ row.SIRIRAJ.SKOR_AKIR }}
                      </div>
                      <small
                        class="text-uppercase font-weight-bold d-block text-truncate"
                        style="max-width: 150px"
                      >
                        {{ row.SIRIRAJ.INTERPRETASI }}
                      </small>
                    </div>

                    <div v-if="row.LAST_UPDATED" class="mt-2 text-muted">
                      <i class="far fa-clock mr-1"></i>
                      <span>Update terakhir: </span>
                      <span class="font-weight-bold">{{ row.LAST_UPDATED }}</span>
                    </div>
                  </td>
                  <td class="align-middle">
                    <small class="text-muted">{{ row.ALAMAT }}</small>
                  </td>
                  <td class="align-middle">
                    <span v-if="row.STATUS == 0" class="badge badge-danger">Sedang Rawat</span>
                    <span v-else class="badge badge-success">{{ row.KETERANGAN }}</span>
                    <div v-if="row.KELUHAN_IGD" class="keluhan-box mt-1">
                      <i class="fas fa-comment-medical mr-1"></i>
                      <span>{{ row.KELUHAN_IGD }}</span>
                    </div>
                  </td>
                  <td class="align-middle">
                    <div><strong>M:</strong> {{ row.MASUKPOLY_DISPLAY }}</div>
                    <div><strong>K:</strong> {{ row.KELUARPOLY || '—' }}</div>
                  </td>
                  <td class="text-center align-middle">
                    <div v-if="row.PENUNJANG && row.PENUNJANG.length" class="penunjang-list mt-1">
                      <div v-for="(notif, ni) in row.PENUNJANG" :key="ni">
                        <div
                          v-for="(layanan, li) in notif.NAMA_LAYANAN.split(',')"
                          :key="ni + '-' + li"
                          class="penunjang-item"
                          :class="
                            notif.STATUS_PROGRESS === 'P' || notif.STATUS_PROGRESS === 'C'
                              ? 'penunjang-selesai'
                              : 'penunjang-menunggu'
                          "
                        >
                          <span
                            class="penunjang-dot"
                            :class="
                              notif.STATUS_PROGRESS === 'P' || notif.STATUS_PROGRESS === 'C'
                                ? 'dot-selesai'
                                : 'dot-menunggu'
                            "
                          ></span>
                          <span class="penunjang-nama">{{ layanan.trim() }}</span>
                          <span class="penunjang-status">
                            —
                            {{
                              notif.STATUS_PROGRESS === 'P' || notif.STATUS_PROGRESS === 'C'
                                ? 'selesai'
                                : 'menunggu'
                            }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="align-middle">
                    <span
                      class="cara-bayar-badge"
                      :class="
                        row.KODECARABAYAR == 27 || row.KODECARABAYAR == 28
                          ? 'cara-bayar-warning'
                          : 'cara-bayar-normal'
                      "
                    >
                      <i class="pi pi-wallet mr-1"></i>{{ row.CARABAYAR }}
                    </span>
                  </td>
                  <td class="text-center align-middle">
                    <div class="aksi-group">
                      <button
                        class="btn-aksi btn-aksi-info btn-sm"
                        @click="bukaRekamMedis(row)"
                        title="Rekam Medis"
                      >
                        <i class="pi pi-folder-open"></i> Rekam Medis
                      </button>
                      <button
                        class="btn-aksi btn-aksi-warning btn-sm"
                        @click="bukaInformConsent(row)"
                        title="Persetujuan Pasien"
                      >
                        <i class="pi pi-file"></i> Consent
                      </button>
                      <button
                        class="btn-aksi btn-aksi-default btn-sm"
                        @click="sirirajScore(row.NOPENDAFTARAN)"
                        title="Siriraj Skor"
                      >
                        <i class="pi pi-file-pdf"></i> Siriraj Skor
                      </button>
                    </div>
                  </td>
                  <td class="text-center align-middle">
                    <span v-if="row.TELAH_VERIF == 0" class="verif-badge verif-belum">
                      <i class="pi pi-times-circle mr-1"></i>Belum Verif
                    </span>
                    <span v-if="row.TELAH_VERIF == 1" class="verif-badge verif-sudah">
                      <i class="pi pi-check-circle mr-1"></i>Telah Verif
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer text-muted">
          <small
            >Menampilkan <strong>{{ factFiltered.length }}</strong> pasien IGD</small
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { storeToRefs } from 'pinia'
import DatePicker from 'primevue/datepicker'
import ProgressBar from 'primevue/progressbar'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const { id_client } = storeToRefs(authStore)

// ===== STATE =====
const fact = ref([])
const isLoading = ref(false)
const startdate = ref(new Date())
const searchNama = ref('')
const filterTriase = ref('SEMUA')
const filterUsia = ref('SEMUA')
const ruangan = ref([])

const showLaporanDokter = ref(false)
const laporan = ref({
  list: [],
  loading: false,
  tanggal: new Date().toISOString().slice(0, 10),
  tanggalObj: new Date(),
  keyword: '',
  filterVerif: null,
  activeTab: 'detail',
})
const laporanVerifOptions = ref([
  { label: 'Sudah Diverifikasi', value: '1' },
  { label: 'Belum Diverifikasi', value: '0' },
])

// ===== HELPERS =====
const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ===== COMPUTED =====
const factFiltered = computed(() => {
  let data = fact.value || []

  if (searchNama.value?.trim()) {
    const kw = searchNama.value.trim().toLowerCase()
    data = data.filter((row) =>
      [row.NAMAPASIEN, row.DATA_SINGKAT, row.NOMR, row.NAMADOKTER].some((v) =>
        String(v || '')
          .toLowerCase()
          .includes(kw),
      ),
    )
  }

  if (filterTriase.value !== 'SEMUA') {
    data = data.filter((row) => row.HASIL_TRIASE === filterTriase.value)
  }

  if (filterUsia.value !== 'SEMUA') {
    data = data.filter((row) => getKelompokUsia(row) === filterUsia.value)
  }

  return data
})

const triaseStats = computed(() => {
  const stats = {
    EMERGENSI: 0,
    URGENT: 0,
    'NON URGENT': 0,
    'DEATH ON ARRIVAL': 0,
    TOTAL: 0,
  }
  stats.TOTAL = fact.value.length
  fact.value.forEach((row) => {
    if (row.HASIL_TRIASE === 'EMERGENSI') stats.EMERGENSI++
    else if (row.HASIL_TRIASE === 'URGENT') stats.URGENT++
    else if (row.HASIL_TRIASE === 'NON URGENT') stats['NON URGENT']++
    else if (row.HASIL_TRIASE === 'DEATH ON ARRIVAL') stats['DEATH ON ARRIVAL']++
  })
  return stats
})

const usiaStats = computed(() => {
  const stats = { BAYI: 0, BALITA: 0, REMAJA: 0, DEWASA: 0, LANSIA: 0 }
  fact.value.forEach((row) => {
    const grp = getKelompokUsia(row)
    if (stats[grp] !== undefined) stats[grp]++
  })
  return stats
})

const laporanFiltered = computed(() => {
  let data = laporan.value.list
  const kw = (laporan.value.keyword || '').toLowerCase().trim()
  if (kw) {
    data = data.filter(
      (d) =>
        (d.NOMR || '').toLowerCase().includes(kw) ||
        (d.NAMAPASIEN || '').toLowerCase().includes(kw) ||
        (d.dpjp || '').toLowerCase().includes(kw) ||
        (d.keterangan || '').toLowerCase().includes(kw),
    )
  }
  if (laporan.value.filterVerif !== null && laporan.value.filterVerif !== undefined) {
    data = data.filter((d) => d.telah_verif === laporan.value.filterVerif)
  }
  return data
})

const laporanSummary = computed(() => {
  const map = {}
  laporan.value.list.forEach((p) => {
    const key = p.dpjp || '(Tidak Diisi)'
    if (!map[key]) map[key] = { dpjp: key, total: 0, verif: 0, belum: 0 }
    map[key].total++
    if (p.telah_verif === '1') map[key].verif++
    else map[key].belum++
  })
  return Object.values(map)
    .map((d) => ({
      ...d,
      persen: d.total > 0 ? Math.round((d.verif / d.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
})

const laporanJumlahVerif = computed(
  () => laporan.value.list.filter((x) => x.telah_verif === '1').length,
)
const laporanJumlahBelumVerif = computed(
  () => laporan.value.list.filter((x) => x.telah_verif !== '1').length,
)
const laporanPersenVerif = computed(() => {
  if (!laporan.value.list.length) return 0
  return Math.round((laporanJumlahVerif.value / laporan.value.list.length) * 100)
})

// ===== METHODS =====
const getKelompokUsia = (row) => {
  const tahun = row.USIA_PASIEN?.tahun != null ? Number(row.USIA_PASIEN.tahun) : 0
  if (tahun < 1) return 'BAYI'
  if (tahun < 5) return 'BALITA'
  if (tahun < 18) return 'REMAJA'
  if (tahun < 60) return 'DEWASA'
  return 'LANSIA'
}

const usiaFilterBadgeClass = (grp) => {
  const map = {
    BAYI: 'badge-pink',
    BALITA: 'badge-info',
    REMAJA: 'badge-teal',
    DEWASA: 'badge-warning',
    LANSIA: 'badge-secondary',
  }
  return map[grp] || 'badge-secondary'
}

const triaseBadgeLabel = (nilai) => {
  const map = {
    EMERGENSI: 'Emergensi',
    URGENT: 'Urgent',
    'NON URGENT': 'Non Urgent',
    'DEATH ON ARRIVAL': 'Death on Arrival',
  }
  return map[nilai] || nilai
}

const triasePillKey = (nilai) => {
  const map = {
    EMERGENSI: 'emergensi',
    URGENT: 'urgent',
    'NON URGENT': 'nonurgent',
    'DEATH ON ARRIVAL': 'doa',
  }
  return map[nilai] || 'default'
}

const laporanRowClass = (data) =>
  data.telah_verif === '1' ? 'laporan-row-verified' : 'laporan-row-pending'

const onTanggalSelect = () => {
  getDataPasien('refresh')
}

const onLaporanDateSelect = (date) => {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  laporan.value.tanggal = `${y}-${m}-${day}`
}

const bukaRekamMedis = (row) => {
  const routeData = router.resolve({
    name: 'FormPoliKlinikView',
    query: {
      noreg: row.NOPENDAFTARAN,
      noka: row.NOJAMINAN,
      nomr: row.NOMR,
      kd_dokter: row.KDDOKTER,
    },
  })
  window.open(routeData.href, '_blank')
}

const bukaInformConsent = (row) => {
  const routeData = router.resolve({
    name: 'FormPoliKlinikView',
    query: {
      noreg: row.NOPENDAFTARAN,
      noka: row.NOJAMINAN,
      nomr: row.NOMR,
      kd_dokter: row.KDDOKTER,
    },
  })
  window.open(routeData.href, '_blank')
}

const sirirajScore = (noregister) => {
  window.open(`${configStore.simrs}/siriraj-score/${noregister}`, '_blank')
}

const bukaLaporanDokter = () => {
  showLaporanDokter.value = true
  fetchLaporanDokter()
}

const resetLaporanFilter = () => {
  laporan.value.tanggal = new Date().toISOString().slice(0, 10)
  laporan.value.tanggalObj = new Date()
  laporan.value.keyword = ''
  laporan.value.filterVerif = null
  fetchLaporanDokter()
}

// ===== API CALLS =====
const getDataPasien = async (mode) => {
  fact.value = []
  if (mode === 'refresh') {
    searchNama.value = ''
    filterTriase.value = 'SEMUA'
    filterUsia.value = 'SEMUA'
  }
  isLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const param = {
      id_client: id_client.value,
      mod: mode === 'refresh' ? 'history6' : 'history7',
      kodeunit: 'IGD',
      jenisrawat: 'JALAN',
      tglawal: formatDate(startdate.value),
      tglakhir: formatDate(startdate.value),
      norm: mode === 'search' ? searchNama.value : '',
    }
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history3`, param)
    fact.value = response.data.response || []
    await getNotifPenunjang()
  } catch (error) {
    console.error('getDataPasien error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien IGD',
      life: 4000,
    })
  } finally {
    isLoading.value = false
  }
}

const getNotifPenunjang = async () => {
  try {
    const url = configStore.apiBaseUrl
    const igdRoom = ruangan.value.find((n) => n.KODE_BPJS === 'IGD')
    const param = {
      id_client: id_client.value,
      mod: 'history6',
      noregister: '',
      jenisrawat: 'JALAN',
      norm: '',
      tglawal: formatDate(startdate.value),
      tglakhir: formatDate(startdate.value),
      kodeunit: igdRoom?.KODE || 'IGD',
      noka: null,
      carabayar: null,
    }
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/notif_obat2an_penunjang_v2`,
      param,
    )
    const results = response.data.results || []
    fact.value = fact.value.map((row) => {
      const noReg = String(row.NOPENDAFTARAN).trim()
      const matched = results.filter((n) => {
        const noPenunjang = String(n.NOREGISTER).trim()
        return noPenunjang === noReg || noPenunjang.includes(noReg) || noReg.includes(noPenunjang)
      })
      return { ...row, PENUNJANG: matched }
    })
  } catch (error) {
    console.error('getNotifPenunjang error:', error)
  }
}

const fetchLaporanDokter = async () => {
  laporan.value.loading = true
  laporan.value.list = []
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/triaseigd/get_triase_by_tanggal/${id_client.value}/${laporan.value.tanggal}`,
    )
    laporan.value.list = Array.isArray(response.data.response) ? response.data.response : []
  } catch (error) {
    console.error('fetchLaporanDokter error:', error)
  } finally {
    laporan.value.loading = false
  }
}

const getDataRuangan = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/0/${id_client.value}`,
    )
    ruangan.value = response.data || []
  } catch (error) {
    console.error('getDataRuangan error:', error)
  }
}

// ===== LIFECYCLE =====
onMounted(async () => {
  await getDataRuangan()
  getDataPasien('refresh')
})
</script>

<style>
.p-dialog-mask {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1100;
}
body.sidebar-collapse .p-dialog,
body.sidebar-mini.sidebar-collapse .p-dialog {
  margin-left: 60px !important;
}
</style>

<style scoped>
.filter-label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.85rem;
}

/* ===== SUMMARY SIDEBAR ===== */
.summary-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.88rem;
}
.summary-label {
  color: inherit;
}
.summary-count {
  font-size: 1rem;
}
.bg-danger-light {
  background: #fff0f0;
  color: #c62828;
  border: 1px solid #ef9a9a;
}
.bg-warning-light {
  background: #fff8f0;
  color: #e65100;
  border: 1px solid #ffcc80;
}
.bg-success-light {
  background: #f0fff4;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}
.bg-dark-light {
  background: #f5f5f5;
  color: #424242;
  border: 1px solid #bdbdbd;
}
.bg-secondary-light {
  background: #eceff1;
  color: #37474f;
  border: 1px solid #b0bec5;
}

/* ===== TABLE ===== */
.igd-table thead th {
  background: #f8f9fa;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  vertical-align: middle;
  border-color: #dee2e6 !important;
  font-size: 0.85rem;
}
.igd-table tbody tr:hover {
  background: #e3f2fd !important;
}
.igd-table td {
  vertical-align: middle;
  border-color: #dee2e6 !important;
}
.row-waiting {
  background: #fff8e1 !important;
}
.row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e3f2fd;
  color: #1565c0;
  font-weight: 700;
}

/* ===== PASIEN ===== */
.pasien-nama {
  font-weight: 700;
  color: #1a1a2e;
}
.pasien-dokter {
  color: #1976d2;
  font-weight: 500;
}

/* ===== KELUHAN BOX ===== */
.keluhan-box {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 6px;
  padding: 4px 8px;
  color: #795548;
  max-width: 220px;
}
.keluhan-box i {
  color: #f57c00;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ===== CARA BAYAR ===== */
.cara-bayar-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
}
.cara-bayar-warning {
  background: #ffebee;
  color: #b71c1c;
  border: 1px solid #ef9a9a;
}
.cara-bayar-normal {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

/* ===== AKSI ===== */
.aksi-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.btn-aksi {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}
.btn-aksi:hover {
  opacity: 0.82;
}
.btn-aksi-info {
  background: #1976d2;
  color: #fff;
}
.btn-aksi-warning {
  background: #f57c00;
  color: #fff;
}
.btn-aksi-default {
  background: #546e7a;
  color: #fff;
}

/* ===== VERIF BADGE ===== */
.verif-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
}
.verif-belum {
  background: #ffebee;
  color: #b71c1c;
  border: 1px solid #ef9a9a;
}
.verif-sudah {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

/* ===== SIRIRAJ ===== */
.siriraj-clickable {
  cursor: pointer;
  transition: transform 0.1s;
}
.siriraj-clickable:hover {
  transform: translateY(-1px);
  border-color: #c62828 !important;
}

/* ===== TRIASE PILL ===== */
.triase-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 6px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
  border: 1.5px solid transparent;
}
.triase-pill-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.triase-pill-emergensi {
  background: #fff0f0;
  color: #c62828;
  border-color: #ef9a9a;
}
.triase-pill-emergensi .triase-pill-dot {
  background: #e53935;
}
.triase-pill-urgent {
  background: #fff8f0;
  color: #e65100;
  border-color: #ffcc80;
}
.triase-pill-urgent .triase-pill-dot {
  background: #fb8c00;
}
.triase-pill-nonurgent {
  background: #f0fff4;
  color: #2e7d32;
  border-color: #a5d6a7;
}
.triase-pill-nonurgent .triase-pill-dot {
  background: #43a047;
}
.triase-pill-doa {
  background: #f5f5f5;
  color: #424242;
  border-color: #bdbdbd;
}
.triase-pill-doa .triase-pill-dot {
  background: #616161;
}

/* ===== PENUNJANG ===== */
.penunjang-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.penunjang-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background: #f8f9fa;
  color: #495057;
  max-width: 200px;
  overflow: hidden;
}
.penunjang-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-menunggu {
  background: #adb5bd;
}
.dot-selesai {
  background: #28a745;
  animation: blink-dot 2s ease-in-out infinite;
}
@keyframes blink-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
.penunjang-nama {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.penunjang-status {
  color: #adb5bd;
  flex-shrink: 0;
}
.penunjang-selesai {
  border-color: #c3e6cb;
  background: #f0fff4;
}
.penunjang-selesai .penunjang-status {
  color: #28a745;
}
.penunjang-menunggu {
  border-color: #dee2e6;
  background: #f8f9fa;
}
.penunjang-menunggu .penunjang-status {
  color: #adb5bd;
}

/* ===== USIA FILTER BUTTONS ===== */
.btn-usia-bayi {
  background: #c2185b;
  border-color: #c2185b;
  color: #fff;
}
.btn-usia-bayi:hover {
  background: #ad1457;
  border-color: #ad1457;
  color: #fff;
}
.btn-outline-usia-bayi {
  background: transparent;
  border-color: #c2185b;
  color: #c2185b;
}
.btn-outline-usia-bayi:hover {
  background: #fce4ec;
}
.btn-usia-balita {
  background: #1565c0;
  border-color: #1565c0;
  color: #fff;
}
.btn-usia-balita:hover {
  background: #0d47a1;
  border-color: #0d47a1;
  color: #fff;
}
.btn-outline-usia-balita {
  background: transparent;
  border-color: #1565c0;
  color: #1565c0;
}
.btn-outline-usia-balita:hover {
  background: #e3f2fd;
}
.btn-usia-remaja {
  background: #00695c;
  border-color: #00695c;
  color: #fff;
}
.btn-usia-remaja:hover {
  background: #004d40;
  border-color: #004d40;
  color: #fff;
}
.btn-outline-usia-remaja {
  background: transparent;
  border-color: #00695c;
  color: #00695c;
}
.btn-outline-usia-remaja:hover {
  background: #e0f2f1;
}
.btn-usia-dewasa {
  background: #e65100;
  border-color: #e65100;
  color: #fff;
}
.btn-usia-dewasa:hover {
  background: #bf360c;
  border-color: #bf360c;
  color: #fff;
}
.btn-outline-usia-dewasa {
  background: transparent;
  border-color: #e65100;
  color: #e65100;
}
.btn-outline-usia-dewasa:hover {
  background: #fff3e0;
}
.btn-usia-lansia {
  background: #4e342e;
  border-color: #4e342e;
  color: #fff;
}
.btn-usia-lansia:hover {
  background: #3e2723;
  border-color: #3e2723;
  color: #fff;
}
.btn-outline-usia-lansia {
  background: transparent;
  border-color: #4e342e;
  color: #4e342e;
}
.btn-outline-usia-lansia:hover {
  background: #efebe9;
}

/* ===== USIA KELOMPOK PILL (di baris pasien) ===== */
.usia-kelompok-pill {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: middle;
}
.usia-kelompok-bayi {
  background: #fce4ec;
  color: #c2185b;
  border: 1px solid #f48fb1;
}
.usia-kelompok-balita {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}
.usia-kelompok-remaja {
  background: #e0f2f1;
  color: #00695c;
  border: 1px solid #80cbc4;
}
.usia-kelompok-dewasa {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
}
.usia-kelompok-lansia {
  background: #efebe9;
  color: #4e342e;
  border: 1px solid #bcaaa4;
}

.badge-pink {
  background: #c2185b;
  color: #fff;
}
.badge-teal {
  background: #00695c;
  color: #fff;
}

/* ===== LAPORAN ROW ===== */
.laporan-row-pending td:first-child {
  border-left: 3px solid #f59e0b;
}
.laporan-row-verified td:first-child {
  border-left: 3px solid #28a745;
}

/* ===== LAPORAN STAT STRIP ===== */
.lp-stat {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.lp-stat-icon {
  font-size: 13px;
  flex-shrink: 0;
}
.lp-stat-num {
  font-weight: 700;
  font-size: 13px;
}
.lp-stat-lbl {
  font-size: 11px;
  opacity: 0.85;
}
.lp-stat-primary {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #93c5fd;
}
.lp-stat-success {
  background: #dcfce7;
  color: #166534;
  border-color: #86efac;
}
.lp-stat-warning {
  background: #fef9c3;
  color: #854d0e;
  border-color: #fde047;
}
.lp-stat-info {
  background: #e0f2fe;
  color: #075985;
  border-color: #7dd3fc;
}
</style>
