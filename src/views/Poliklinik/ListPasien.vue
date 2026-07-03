<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <div class="content">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Daftar Pasien Poliklinik</h1>
          <h3 style="color: tomato" v-if="namadokterSelected">
            [{{ namadokterSelected?.NAMADOKTER }}] - [{{ namadokterSelected?.POLI }}]
          </h3>
          <p class="hero-description">
            Dashboard ini menyajikan informasi lengkap dan terkini mengenai status seluruh pasien
            yang terdaftar di poliklinik. Anda dapat memantau daftar pasien, status kunjungan, dan
            informasi medis lainnya secara real-time.
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien }}</div>
          <div class="stat-label">Total Pasien</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalPasien - pasienAktif }}</div>
          <div class="stat-label">Selesai Dilayani</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pasienAktif }}</div>
          <div class="stat-label">Belum dilayani</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rataKunjungan }}</div>
          <div class="stat-label">Batal</div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <i class="pi pi-filter"></i>
          Filter & Pencarian
        </h3>
      </div>
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-home"></i>
            Jenis Layanan
          </label>

          <Select
            v-model="JenisRawatSelected"
            :options="JenisRawat"
            optionLabel="caption"
            placeholder="Pilih Rawat Inap/Jalan"
            showClear
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-info-circle"></i>
            STATUS LAYAN
          </label>
          <Select
            v-model="statusLayanSelesai"
            :options="ListStatusLayanSelesai"
            optionLabel="caption"
            placeholder="Status Layan"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-info-circle"></i>
            Pilih Ruangan/Poli
          </label>
          <Select
            v-model="selectedStatus"
            :options="listRuangPoli"
            optionLabel="NAMA"
            filter
            placeholder="Pilih Ruangan"
            showClear
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-plus"></i>
            Tanggal Mulai
          </label>
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            showIcon
            iconDisplay="input"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar-minus"></i>
            Tanggal Selesai
          </label>
          <DatePicker
            v-model="endDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            showIcon
            iconDisplay="input"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-search"></i>
            Pencarian Global
          </label>
          <InputText
            v-model="globalFilter"
            @keyup.enter="searchFromDB('history5')"
            placeholder="Cari nama, NO MR, alamat..."
          />
        </div>
      </div>
    </div>

    <!-- Kelompok Usia Filter -->
    <div class="usia-filter-bar" v-if="filteredPasienBase.length > 0">
      <span class="usia-filter-label"><i class="pi pi-users"></i> Usia :</span>
      <div class="usia-filter-chips">
        <div
          v-for="grup in kelompokUsia"
          :key="grup.label"
          class="usia-chip"
          :class="{
            'usia-chip-active': filterKelompokUsia?.label === grup.label,
            'usia-chip-empty': grup.jumlah === 0,
          }"
          :style="{
            borderColor: grup.warna,
            background: filterKelompokUsia?.label === grup.label ? grup.warna : 'transparent',
            color: filterKelompokUsia?.label === grup.label ? 'white' : grup.warna,
          }"
          @click="toggleFilterUsia(grup)"
        >
          <i :class="grup.icon" style="font-size: 0.6rem"></i>
          <span>{{ grup.label }}</span>
          <span class="usia-chip-badge">{{ grup.jumlah }}</span>

          <div class="usia-chip-tooltip" :style="{ borderColor: grup.warna }">
            <div class="usia-chip-tooltip-header" :style="{ background: grup.warna }">
              <i :class="grup.icon"></i> {{ grup.label }}
            </div>
            <div class="usia-chip-tooltip-body">
              <div class="usia-chip-tooltip-row">
                <span>Rentang</span>
                <strong>{{ grup.range }}</strong>
              </div>
              <div class="usia-chip-tooltip-row">
                <span>Jumlah</span>
                <strong>{{ grup.jumlah }} pasien</strong>
              </div>
              <div class="usia-chip-tooltip-row">
                <span>Proporsi</span>
                <strong>{{ grup.persen }}%</strong>
              </div>
            </div>
            <div class="usia-chip-tooltip-hint">
              {{
                filterKelompokUsia?.label === grup.label
                  ? 'Klik untuk hapus filter'
                  : 'Klik untuk filter tabel'
              }}
            </div>
          </div>
        </div>
      </div>
      <Button
        v-if="filterKelompokUsia"
        icon="pi pi-times"
        size="small"
        text
        severity="secondary"
        @click="filterKelompokUsia = null"
        v-tooltip.top="'Hapus filter usia'"
        style="width: 1.5rem; height: 1.5rem; padding: 0"
      />
    </div>

    <!-- DataTable Section -->
    <div class="tabs-section">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">
            <i class="pi pi-list"></i>
            Daftar Pasien ({{ filteredPasien.length }})

            <Button
              icon="pi pi-file-excel"
              @click="exportToExcel"
              severity="success"
              size="small"
              rounded
              text
              v-tooltip.top="'Export Excel'"
              style="width: 1.6rem; height: 1.6rem; padding: 0; font-size: 0.75rem"
            />
          </h3>

          <div class="table-actions">
            <Button
              severity="warn"
              icon="pi pi-list"
              class="p-button-outlined w-30"
              @click="notif_obat2an_penunjang_v2()"
              label="Obat2an/Penunjang"
            />
            <Button
              severity="warn"
              icon="pi pi-list"
              class="p-button-secondary w-30"
              @click="showPasienJKN = true"
              label="Pasien M Jkn"
            />
            <Button
              icon="pi pi-filter-slash"
              label="Reset Filter"
              @click="resetFilters"
              class="p-button-outlined p-button-secondary"
              size="small"
            />
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              class="p-button-outlined"
              @click="fetchData('history10')"
              :loading="loading"
              size="small"
            />
            <span
              v-if="lastUpdatedLabel"
              class="last-updated-label"
              :title="lastUpdated?.toLocaleString('id-ID')"
            >
              <i class="pi pi-clock" style="font-size: 0.75rem"></i> {{ lastUpdatedLabel }}
            </span>
            <!-- <Button
              icon="fa-solid fa-bell"
              label="Panggil Antrean"
              @click="showPanggilanAntrian = true"
              class="round-button buttong-secondary"
              size="small"
            /> -->
          </div>
        </div>
        <DataTable
          :value="filteredPasien"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50, 100]"
          :globalFilter="globalFilter"
          :globalFilterFields="['NAMAPASIEN', 'NOMR', 'ALAMAT']"
          :sortField="'NOMR'"
          :sortOrder="1"
          scrollHeight="600px"
          scrollable
          responsiveLayout="scroll"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} pasien"
          stripedRows
        >
          <Column header="#" style="width: 30px" sortable>
            <template #body="slotProps">
              <h6>{{ slotProps.data.NOMORANTRIAN }}</h6>
            </template>
          </Column>
          <Column
            field="DATA_SINGKAT"
            header="INFORMASI PASIEN"
            :sortable="true"
            style="min-width: 280px"
          >
            <template #body="slotProps">
              <div class="patient-info hover-grow" @click="keformpoli(slotProps.data)">
                <div class="patient-header">
                  <div class="patient-details">
                    <strong class="patient-name"
                      >{{ slotProps.data.NAMAPASIEN }} - {{ slotProps.data.NOMR }}
                      <i
                        :class="slotProps.data.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                        :style="{
                          fontSize: '20px',
                          color: slotProps.data.JENISKELAMIN === 'P' ? 'violet' : 'steelblue',
                        }"
                      >
                      </i>
                    </strong>
                    <!-- <div class="patient-mr">NO MR: {{ slotProps.data.NOMR }}</div> -->
                    <div class="patient-extra" style="color: darkcyan">
                      {{ slotProps.data.USIA_PASIEN.tahun }} Thn,{{
                        slotProps.data.USIA_PASIEN.bulan
                      }}
                      Bln,
                      {{ slotProps.data.USIA_PASIEN.hari }} Hari
                    </div>
                    <div
                      v-if="getWaitingTime(slotProps.data)"
                      class="waiting-badge"
                      :class="`waiting-${getWaitingTime(slotProps.data).severity}`"
                    >
                      <i class="pi pi-clock" style="font-size: 0.65rem"></i>
                      Tunggu {{ getWaitingTime(slotProps.data).label }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="NAMADOKTER" header="DOKTER" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="address-info">
                <i
                  class="pi pi-users"
                  style="margin-right: 8px; color: #6b7280; color: darkturquoise"
                ></i>
                <span style="color: steelblue"
                  >{{ slotProps.data.NAMADOKTER }}<br />{{ slotProps.data.POLI }}</span
                >
              </div>
            </template>
          </Column>

          <Column header="PANGGIL" style="min-width: 120px">
            <template #body="slotProps">
              <div class="action-buttons">
                <!-- <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-outlined p-button-info"
                  size="small"
                  @click="viewPatientDetail(slotProps.data)"
                  v-tooltip.top="'Lengkapi TTV'"
                /> -->
                <Button
                  icon="fa-solid fa-bullhorn"
                  label=""
                  @click="konfirmasiPanggil(slotProps.data)"
                  :loading="slotProps.data.loading"
                  class="round-button2"
                  size="small"
                />
              </div>
            </template>
          </Column>

          <Column field="ALAMAT" header="ALAMAT" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="address-info">
                <i class="pi pi-map-marker" style="margin-right: 8px; color: #6b7280"></i>
                <span>{{ slotProps.data.ALAMAT || 'Alamat tidak tersedia' }}</span>
              </div>
            </template>
          </Column>

          <Column field="MASUKPOLY" header="MASUKPOLY" :sortable="true" style="min-width: 200px">
            <template #body="slotProps">
              <div class="address-info">
                <span
                  >M: {{ slotProps.data.MASUKPOLY_DISPLAY }} <br />
                  K : {{ slotProps.data.KELUARPOLY }}</span
                >
              </div>
            </template>
          </Column>

          <Column field="NOMR" header="JENIS RAWAT" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <div class="mr-badge">
                <i class="pi pi-id-card" style="margin-right: 6px"></i>
                <strong> {{ slotProps.data.JENISRAWAT }}</strong>
              </div>
            </template>
          </Column>

          <Column field="STTS_PULANG" header="STATUS" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <span v-if="slotProps.data.STTS_PULANG === 'Sedang dirawat'" style="color: red">
                {{ slotProps.data.STTS_PULANG }}</span
              >
              <span v-else style="color: gray">{{ slotProps.data.STTS_PULANG }}</span>

              <p style="color: green" v-if="slotProps.data.KET_RUJUK_INT">
                {{ slotProps.data.KET_RUJUK_INT }}
              </p>
            </template>
          </Column>

          <Column field="CARABAYAR" header="CARA BAYAR" :sortable="true" style="min-width: 150px">
            <template #body="slotProps">
              <div class="mr-badge">
                <i class="pi pi-id-card" style="margin-right: 6px"></i>
                {{ slotProps.data.CARABAYAR }}
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Empty State -->
        <div v-if="!loading && filteredPasien.length === 0" class="empty-state">
          <i class="pi pi-users empty-icon"></i>
          <h3 class="empty-title">Tidak Ada Data Pasien</h3>
          <p class="empty-description">
            Belum ada data pasien yang sesuai dengan filter yang dipilih. Coba ubah kriteria
            pencarian atau reset filter.
          </p>
        </div>
      </div>
    </div>

    <!-- Dialog Detail Kelompok Usia -->
    <Dialog
      v-model:visible="showKelompokUsiaDialog"
      modal
      :header="`${selectedKelompokUsia?.icon ? '' : ''}Pasien ${selectedKelompokUsia?.label} (${pasienKelompokSelected.length})`"
      :style="{ width: '700px' }"
      class="patient-detail-dialog"
    >
      <DataTable
        :value="pasienKelompokSelected"
        :paginator="pasienKelompokSelected.length > 10"
        :rows="10"
        stripedRows
        size="small"
        scrollable
        scrollHeight="400px"
      >
        <Column header="#" style="width: 40px">
          <template #body="slotProps">
            <span>{{ slotProps.data.NOMORANTRIAN }}</span>
          </template>
        </Column>
        <Column header="Nama Pasien" style="min-width: 200px">
          <template #body="slotProps">
            <div>
              <strong style="color: #2563eb">{{ slotProps.data.NAMAPASIEN }}</strong>
              <div style="font-size: 0.75rem; color: #6b7280">{{ slotProps.data.NOMR }}</div>
            </div>
          </template>
        </Column>
        <Column header="Usia" style="width: 100px">
          <template #body="slotProps">
            <span style="font-size: 0.8rem">
              {{ slotProps.data.USIA_PASIEN?.tahun }} thn
              {{ slotProps.data.USIA_PASIEN?.bulan }} bln
            </span>
          </template>
        </Column>
        <Column header="Dokter / Poli" style="min-width: 160px">
          <template #body="slotProps">
            <div style="font-size: 0.8rem">
              <div>{{ slotProps.data.NAMADOKTER }}</div>
              <div style="color: #6b7280">{{ slotProps.data.POLI }}</div>
            </div>
          </template>
        </Column>
        <Column header="Cara Bayar" style="width: 110px">
          <template #body="slotProps">
            <span style="font-size: 0.8rem">{{ slotProps.data.CARABAYAR }}</span>
          </template>
        </Column>
        <Column header="Tunggu" style="width: 100px">
          <template #body="slotProps">
            <span
              v-if="getWaitingTime(slotProps.data)"
              class="waiting-badge"
              :class="`waiting-${getWaitingTime(slotProps.data).severity}`"
            >
              {{ getWaitingTime(slotProps.data).label }}
            </span>
            <span v-else style="font-size: 0.75rem; color: #94a3b8">—</span>
          </template>
        </Column>
        <Column header="" style="width: 60px">
          <template #body="slotProps">
            <Button
              icon="fa-solid fa-bullhorn"
              size="small"
              rounded
              text
              @click="konfirmasiPanggil(slotProps.data)"
              v-tooltip.top="'Panggil'"
            />
          </template>
        </Column>
      </DataTable>
      <template #footer>
        <Button
          label="Tutup"
          icon="pi pi-times"
          severity="secondary"
          class="p-button-outlined"
          @click="showKelompokUsiaDialog = false"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showPanggilanAntrian"
      modal
      header="Konfirmasi Panggilan Antrian"
      :style="{ width: '420px' }"
      class="patient-detail-dialog"
    >
      <div v-if="pasienToCall" class="konfirmasi-panggil">
        <div class="konfirmasi-info">
          <i class="fa-solid fa-bullhorn konfirmasi-icon"></i>
          <div>
            <div class="konfirmasi-nama">{{ pasienToCall.NAMAPASIEN }}</div>
            <div class="konfirmasi-sub">
              No. MR: {{ pasienToCall.NOMR }} &nbsp;|&nbsp; Antrian:
              <strong>{{ pasienToCall.NOMORANTRIAN }}</strong>
            </div>
            <div class="konfirmasi-sub">
              Dokter: {{ pasienToCall.NAMADOKTER }} — {{ pasienToCall.POLI }}
            </div>
          </div>
        </div>
        <p class="konfirmasi-desc">
          Sistem akan memanggil pasien ini melalui antrian poli. Pastikan data sudah benar sebelum
          melanjutkan.
        </p>
      </div>
      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          class="p-button-outlined"
          @click="showPanggilanAntrian = false"
        />
        <Button
          label="Ya, Panggil Sekarang"
          icon="fa-solid fa-bullhorn"
          :loading="pasienToCall?.loading"
          @click="eksekusiPanggil"
        />
      </template>
    </Dialog>
    <!-- Patient Detail Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      modal
      header="Detail Pasien"
      :style="{ width: '700px' }"
      class="patient-detail-dialog"
    >
      <div v-if="selectedPatient" class="patient-detail-content">
        <div class="detail-section">
          <h4 style="color: darkcyan">Soap</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Nama Pasien:</label>
              <span>{{ selectedPatient.NOMR }} - {{ selectedPatient.DATA_SINGKAT }}</span>
            </div>
            <Panel>
              <div class="row">
                <div class="col-md-3">
                  <label>Suhu (C)</label>
                  <InputGroup>
                    <InputNumber v-model="soap.suhu" placeholder="Suhu" style="font-size: 14px" />
                    <InputGroupAddon>C</InputGroupAddon>
                  </InputGroup>
                </div>
                <div class="col-md-3">
                  <label>Tensi</label>
                  <InputGroup>
                    <InputText v-model="soap.tensi" class="mr-3" style="font-size: 14px">
                    </InputText>
                    <InputGroupAddon>mmhg</InputGroupAddon>
                  </InputGroup>
                </div>
                <div class="col-md-3">
                  <label>SPO2</label>
                  <InputGroup>
                    <InputNumber v-model="soap.spo2" placeholder="Suhu" style="font-size: 14px" />
                    <InputGroupAddon>%</InputGroupAddon>
                  </InputGroup>
                </div>
                <div class="col-md-3">
                  <label>Tinggi Badan</label>
                  <InputGroup>
                    <InputNumber
                      v-model="soap.subject"
                      placeholder="Suhu"
                      style="font-size: 14px"
                    />
                    <InputGroupAddon>cm</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-md-3">
                  <label style="color: darkblue">Respirasi</label>
                  <InputGroup>
                    <InputNumber
                      v-model="soap.respirasi"
                      placeholder="respirasi"
                      style="font-size: 14px"
                    />
                    <InputGroupAddon>/Menit</InputGroupAddon>
                  </InputGroup>
                </div>
                <div class="col-md-3">
                  <label style="color: darkblue">GCS (E,V,M)</label>
                  <InputGroup>
                    <InputText v-model="soap.gcs" class="mr-3" style="font-size: 14px"> </InputText>
                    <InputGroupAddon>E,V,M</InputGroupAddon>
                  </InputGroup>
                </div>
                <div class="col-md-3">
                  <label style="color: darkblue">Berat Badan</label>
                  <InputGroup>
                    <InputNumber
                      v-model="soap.beratbadan"
                      placeholder="Suhu"
                      style="font-size: 14px"
                    />
                    <InputGroupAddon>%</InputGroupAddon>
                  </InputGroup>
                </div>
                <div class="col-md-3">
                  <label style="color: darkblue">Nadi</label>
                  <InputGroup>
                    <InputNumber v-model="soap.nadi" placeholder="nadi" style="font-size: 14px" />
                    <InputGroupAddon>/Permenit</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
              <div class="row mt-5">
                <div class="col-md-12">
                  <label style="color: darkblue">Tingkat kesadaran</label>
                  <div class="radio-group">
                    <div v-for="level in consciousnessLevels" :key="level.code">
                      <RadioButton
                        :inputId="level.code"
                        :value="level.code"
                        v-model="selectedLevel"
                        name="consciousnessLevel"
                        size="large"
                      />
                      <label :for="level.code">
                        {{ level.display }}
                      </label>
                    </div>
                  </div>
                </div>
                <!-- Display selected value -->
                <div v-if="selectedLevel" class="selected-info">
                  <p><strong>Display:</strong> {{ getSelectedLevel?.display }}</p>
                  <p><strong>Description:</strong> {{ getSelectedLevel?.description }}</p>
                </div>
              </div>
            </Panel>
            <Panel>
              <div class="detail-item">
                <label>Subjek</label>
                <Textarea v-model="soap.subject" class="custom-textarea"></Textarea>
              </div>
              <div class="detail-item">
                <label>Objek:</label>
                <Textarea v-model="soap.object" class="custom-textarea"></Textarea>
              </div>
              <div class="detail-item">
                <label>Assesment</label>
                <Textarea v-model="soap.assesment" class="custom-textarea"></Textarea>
              </div>
              <div class="detail-item">
                <label>Plan</label>
                <Textarea v-model="soap.plan" class="custom-textarea"></Textarea>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Simpan"
          icon="pi pi-check"
          @click="showDetailDialog = false"
          class="round-button2"
        />
        <Button
          label="Tutup"
          icon="pi pi-times"
          @click="showDetailDialog = false"
          class="p-button-outlined"
        />
      </template>
    </Dialog>

    <PasienMobileJKNDialog v-model:visible="showPasienJKN" />

    <Dialog
      v-model:visible="ShowNotifMobileJkn"
      modal
      header="Monitoring Obat-obatan Pasien"
      :style="{ width: isMobile ? '95vw' : '900px' }"
      :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
      class="patient-detail-dialog"
    >
      <!-- FILTER GLOBAL -->
      <div class="flex justify-between items-center mb-3">
        <span class="p-input-icon-left w-full md:w-1/2">
          <i class="pi pi-search" />
          <InputText
            v-model="globalFilterNotif"
            placeholder="Cari pasien berdasarkan nama, NOMR, atau alamat..."
            class="w-full"
          />
        </span>
      </div>

      <!-- TABEL DATA DENGAN FIXED HEADER -->
      <DataTable
        :value="listNotifObat2an"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        :globalFilter="globalFilterNotif"
        :globalFilterFields="['NAMAPASIEN', 'NOMR', 'ALAMAT']"
        :sortField="'NOMR'"
        :sortOrder="1"
        scrollable
        scrollHeight="400px"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} pasien"
        class="elegant-datatable"
        stripedRows
      >
        <Column field="NOMORANTRIAN" header="ANTRIAN" sortable></Column>
        <Column field="NOPENDAFTARAN" header="NO PENDAFTARAN"></Column>
        <Column field="NAMAPASIEN" header="NAMA PASIEN" sortable></Column>
        <Column field="NOMR" header="NOMR" sortable></Column>
        <Column field="ALAMAT" header="ALAMAT"></Column>
        <Column field="OBAT_OBATAN" header="OBAT OBATAN" sortable></Column>
        <Column field="PROGRESS" header="PROGRESS" sortable>
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.PROGRESS"
              :severity="getSeverity(slotProps.data.PROGRESS)"
            />
          </template>
        </Column>
      </DataTable>
    </Dialog>
    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import * as XLSX from 'xlsx'

import { useRouter } from 'vue-router'

const router = useRouter()

import { FilterMatchMode } from '@primevue/core/api'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Badge from 'primevue/badge'
import Toast from 'primevue/toast'
import Select from 'primevue/select'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import PasienMobileJKNDialog from './PasienMobileJKNDialog.vue'

const globalFilterNotif = ref('')

// Store and toast setup
const configStore = useConfigStore()
const toast = useToast()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)

const showPasienJKN = ref(false)
// Reactive data
const listpasienStore = ref([])
const loading = ref(false)
const globalFilter = ref('')
const JenisRawatSelected = ref(null)
const selectedStatus = ref(null)
const statusLayanSelesai = ref({
  kode: 0,
  caption: 'BELUM DILAYANI',
})

// Warna hijau untuk PROGRESS = "C"
// Fungsi: tentukan warna Tag berdasarkan status PROGRESS
const getSeverity = (progress) => {
  switch (progress) {
    case 'C':
      return 'success' // hijau
    case 'P':
      return 'warning' // kuning
    case 'S':
      return 'info' // biru
    default:
      return 'secondary' // abu-abu
  }
}

const ShowNotifMobileJkn = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const ListStatusLayanSelesai = ref([
  {
    kode: 0,
    caption: 'BELUM DILAYANI',
  },
  {
    kode: 1,
    caption: 'SUDAH DILAYANI',
  },
  {
    kode: 2,
    caption: 'SEMUA',
  },
])

const startDate = ref(new Date())
const endDate = ref(new Date())
const showDetailDialog = ref(false)
const selectedPatient = ref(null)
const pasienToCall = ref(null)
const showKelompokUsiaDialog = ref(false)
const selectedKelompokUsia = ref(null)

const namadokterSelected = ref(null)
const lastUpdated = ref(null)
const lastUpdatedLabel = ref(null)
let refreshLabelTimer = null

const now = ref(new Date())

const getWaitingTime = (patient) => {
  if (patient.STATUS != 0) return null
  const raw = patient.MASUKPOLY
  if (!raw) return null

  // Coba parse waktu dari string (format HH:MM atau HH:MM:SS)
  const match = String(raw).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (!match) return null

  const base = new Date(now.value)
  base.setHours(parseInt(match[1]), parseInt(match[2]), parseInt(match[3] ?? 0), 0)

  const diffMs = now.value - base
  if (diffMs < 0) return null

  const diffMin = Math.floor(diffMs / 60000)
  const jam = Math.floor(diffMin / 60)
  const menit = diffMin % 60

  return {
    menit: diffMin,
    label: jam > 0 ? `${jam} jam ${menit} mnt` : `${menit} mnt`,
    severity: diffMin < 30 ? 'success' : diffMin < 60 ? 'warn' : 'danger',
  }
}

const updateLastUpdatedLabel = () => {
  if (!lastUpdated.value) {
    lastUpdatedLabel.value = null
    return
  }
  const diffMs = Date.now() - lastUpdated.value.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)

  if (diffSec < 60) {
    lastUpdatedLabel.value = 'Baru saja diperbarui'
  } else if (diffMin < 60) {
    lastUpdatedLabel.value = `Diperbarui ${diffMin} menit yang lalu`
  } else {
    lastUpdatedLabel.value = `Diperbarui ${diffHour} jam yang lalu`
  }
}

const showPanggilanAntrian = ref(false)

const messages = ref([])
const connected = ref(false)
let channel = null

const JenisRawat = ref([
  {
    kode: 0,
    caption: 'JALAN',
  },
  {
    kode: 1,
    caption: 'INAP',
  },
])

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  refreshLabelTimer = setInterval(() => {
    updateLastUpdatedLabel()
    now.value = new Date()
  }, 30000)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  clearInterval(refreshLabelTimer)
})

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

const listNotifObat2an = ref([])

const notif_obat2an_penunjang_v2 = async () => {
  try {
    ShowNotifMobileJkn.value = true
    const parameter = {
      id_client: id_client.value, // bisa diganti dari state/global config
      mod: 'history10', // MODE
      noregister: '', // NOREGISTER
      jenisrawat: JenisRawatSelected.value.caption, // JENISRAWAT
      norm: '', // NOMR
      tglawal: formatDate(startDate.value), // TGLMIN
      tglakhir: formatDate(startDate.value), // TGLMAX
      kodeunit: selectedStatus.value?.KODE, // kdUnit
      noka: null,
      carabayar: null,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/notif_obat2an_penunjang_v2`,
      parameter,
    )
    if (response.data.response.length > 0) {
      listNotifObat2an.value = response.data.response
    }
  } catch (error) {
    console.error('Error fetching patient data:', error)
    loading.value = false
  }
}
// Selected level
const selectedLevel = ref('')

const funtionSendToPoli = async (status) => {
  const routeData = router.resolve({
    name: 'FormPoliKlinikView',

    query: {
      noreg: status.NOPENDAFTARAN,
      noka: status.NOJAMINAN,
      nomr: status.NOMR,
      kd_dokter: status.KDDOKTER,
      /* any query params */
    },
  })

  window.open(routeData.href, '_blank')

  await SetTaskID_4(status)
}

const keformpoli = async (status) => {
  if (status.TGLREG == formatDate(new Date())) {
    // console.log('tanggal hari ini')
    // showPanggilanAntrian.value = true
    funtionSendToPoli(status)
  } else {
    funtionSendToPoli(status)
  }
}

const konfirmasiPanggil = (data) => {
  pasienToCall.value = data
  showPanggilanAntrian.value = true
}

const eksekusiPanggil = async () => {
  if (!pasienToCall.value) return
  showPanggilanAntrian.value = false
  await panggil_pasien(pasienToCall.value)
  pasienToCall.value = null
}

const panggil_pasien = async (data) => {
  const url = configStore.apiBaseUrl

  data.loading = true

  try {
    const response = await axios.get(
      `${url}/index.php/api/antrian/panggil_pasien_poli/${data.NOPENDAFTARAN}/${id_client.value}`,
    )

    const payload_pusher = {
      channel: `channel1${id_client.value}`,
      event: 'panggil_antrian_poli',
      JENIS_ANTRIAN: response.data.JENIS_ANTRIAN,
      NOMOR_ANTRIAN: response.data.NOMOR_ANTRIAN,
      PANGGILAN_POLI: 1,
      LOKET: 1,
      POLI: response.data.POLI,
      NAMA_PASIEN: data.DATA_SINGKAT,
      NAMA_DOKTER: data.NAMADOKTER,
      KODE_DOKTER: data.KDDOKTER,
    }
    await axios.post(`${url}/index.php/api/data_referensi/push_to_pusher_v2/`, payload_pusher)

    showSuccess(`Pasien ${data.NAMAPASIEN} berhasil dipanggil`)
  } catch (error) {
    showError('Gagal memanggil pasien, coba lagi')
  } finally {
    data.loading = false
  }
}

const SetTaskID_4 = async (data) => {
  const url = configStore.apiBaseUrl

  const response = await axios.get(
    `${url}/index.php/api/antrian/panggil_pasien_poli/${data.NOPENDAFTARAN}/${id_client.value}`,
  )
  console.log(response.data)
}

onUnmounted(() => {
  if (channel) channel.unbind_all()
})

onMounted(() => {
  // Subscribe ke channel
})

// Computed properties
const filteredPasienBase = computed(() => {
  let filtered = [...listpasienStore.value]

  if (globalFilter.value) {
    const query = globalFilter.value.toLowerCase()
    filtered = filtered.filter(
      (patient) =>
        patient.NAMAPASIEN?.toLowerCase().includes(query) ||
        patient.NOMR?.toLowerCase().includes(query) ||
        patient.ALAMAT?.toLowerCase().includes(query) ||
        patient.DATA_SINGKAT?.toLowerCase().includes(query),
    )
  } else {
    if (statusLayanSelesai.value) {
      if (statusLayanSelesai.value.kode === 0) {
        filtered = filtered.filter((patient) => patient.STATUS == 0)
      } else if (statusLayanSelesai.value.kode === 1) {
        filtered = filtered.filter((patient) => patient.STATUS != 0)
      }
    }
  }
  return filtered
})

const filterKelompokUsia = ref(null)

const filteredPasien = computed(() => {
  if (!filterKelompokUsia.value) return filteredPasienBase.value
  const { min, max } = filterKelompokUsia.value
  return filteredPasienBase.value.filter((p) => {
    const thn = p.USIA_PASIEN?.tahun ?? 0
    return thn >= min && thn < max
  })
})

const toggleFilterUsia = (grup) => {
  filterKelompokUsia.value = filterKelompokUsia.value?.label === grup.label ? null : grup
}

const searchFromDB = async () => {
  fetchData('history5')
}

const totalPasien = computed(() => listpasienStore.value.length)

const pasienHariIni = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return filteredPasien.value.filter((p) => {
    // Assuming there's a date field, adjust as needed
    return p.TANGGAL_DAFTAR?.includes(today)
  }).length
})

const pasienAktif = computed(() => {
  return filteredPasien.value.filter((p) => p.STATUS == 0).length
})

const rataKunjungan = computed(() => {
  return 0
})

const kelompokUsia = computed(() => {
  const antri = filteredPasienBase.value
  const total = antri.length || 1

  const groups = [
    { label: 'Bayi', range: '0–1 thn', icon: 'pi pi-heart', warna: '#ec4899', min: 0, max: 1 },
    { label: 'Balita', range: '1–5 thn', icon: 'pi pi-star', warna: '#f97316', min: 1, max: 5 },
    { label: 'Anak', range: '5–12 thn', icon: 'pi pi-user', warna: '#3b82f6', min: 5, max: 12 },
    { label: 'Remaja', range: '12–18 thn', icon: 'pi pi-bolt', warna: '#8b5cf6', min: 12, max: 18 },
    {
      label: 'Dewasa',
      range: '18–60 thn',
      icon: 'pi pi-briefcase',
      warna: '#10b981',
      min: 18,
      max: 60,
    },
    {
      label: 'Lansia',
      range: '> 60 thn',
      icon: 'pi pi-clock',
      warna: '#64748b',
      min: 60,
      max: 999,
    },
  ]

  return groups.map((g) => {
    const jumlah = antri.filter((p) => {
      const thn = p.USIA_PASIEN?.tahun ?? 0
      return thn >= g.min && thn < g.max
    }).length
    return { ...g, jumlah, persen: Math.round((jumlah / total) * 100) }
  })
})

const pasienKelompokSelected = computed(() => {
  if (!selectedKelompokUsia.value) return []
  const { min, max } = selectedKelompokUsia.value
  return filteredPasien.value.filter((p) => {
    const thn = p.USIA_PASIEN?.tahun ?? 0
    return thn >= min && thn < max
  })
})

const bukaKelompokUsia = (grup) => {
  selectedKelompokUsia.value = grup
  showKelompokUsiaDialog.value = true
}

const listRuangPoli = ref([])
const getdataPoliRuang = async (mode) => {
  try {
    const url = configStore.apiBaseUrl

    loading.value = true

    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdataruangterpakai_v2/${mode}/${id_client.value}`,
    )

    // Process the response data to add computed fields
    listRuangPoli.value = response.data || []

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const getStatusIcon = (status) => {
  const iconMap = {
    terdaftar: 'pi pi-clock',
    periksa: 'pi pi-spin pi-spinner',
    selesai: 'pi pi-check-circle',
    batal: 'pi pi-times-circle',
  }
  return iconMap[status] || 'pi pi-clock'
}

const viewPatientDetail = (patient) => {
  selectedPatient.value = patient
  showDetailDialog.value = true
}

const getStatusStyle = (status) => {
  return {
    color: status === 'Sedang dirawat' ? '#dc3545' : '#6c757d',
    fontWeight: status === 'Sedang dirawat' ? '600' : '400',
  }
}

const editPatient = (patient) => {
  toast.add({
    severity: 'info',
    summary: 'Edit Pasien',
    detail: `Membuka form edit untuk ${patient.NAMAPASIEN}`,
    life: 3000,
  })
}

const FILTER_KEY = 'listpasien_poli_filter'

const saveFilters = () => {
  localStorage.setItem(
    FILTER_KEY,
    JSON.stringify({
      JenisRawatSelected: JenisRawatSelected.value,
      statusLayanSelesai: statusLayanSelesai.value,
      selectedStatus: selectedStatus.value,
      startDate: startDate.value ? startDate.value.toISOString() : null,
      endDate: endDate.value ? endDate.value.toISOString() : null,
      globalFilter: globalFilter.value,
    }),
  )
}

const loadFilters = () => {
  const raw = localStorage.getItem(FILTER_KEY)
  if (!raw) return
  try {
    const saved = JSON.parse(raw)
    if (saved.JenisRawatSelected) JenisRawatSelected.value = saved.JenisRawatSelected
    if (saved.statusLayanSelesai) statusLayanSelesai.value = saved.statusLayanSelesai
    if (saved.selectedStatus) selectedStatus.value = saved.selectedStatus
    if (saved.startDate) startDate.value = new Date(saved.startDate)
    if (saved.endDate) endDate.value = new Date(saved.endDate)
    if (saved.globalFilter) globalFilter.value = saved.globalFilter
  } catch {
    localStorage.removeItem(FILTER_KEY)
  }
}

const resetFilters = () => {
  globalFilter.value = ''
  selectedStatus.value = null
  startDate.value = new Date()
  endDate.value = new Date()
  JenisRawatSelected.value = { kode: 0, caption: 'JALAN' }
  statusLayanSelesai.value = { kode: 0, caption: 'BELUM DILAYANI' }
  filterKelompokUsia.value = null
  localStorage.removeItem(FILTER_KEY)

  toast.add({
    severity: 'info',
    summary: 'Filter Reset',
    detail: 'Semua filter telah direset',
    life: 2000,
  })
}

const exportToExcel = () => {
  if (!filteredPasien.value.length) {
    toast.add({
      severity: 'warn',
      summary: 'Export',
      detail: 'Tidak ada data untuk diekspor',
      life: 3000,
    })
    return
  }

  const rows = filteredPasien.value.map((p) => ({
    'No Antrian': p.NOMORANTRIAN,
    'No Pendaftaran': p.NOPENDAFTARAN,
    'Nama Pasien': p.NAMAPASIEN,
    'No MR': p.NOMR,
    'Jenis Kelamin': p.JENISKELAMIN === 'P' ? 'Perempuan' : 'Laki-laki',
    Usia: `${p.USIA_PASIEN?.tahun ?? 0} Thn ${p.USIA_PASIEN?.bulan ?? 0} Bln`,
    Dokter: p.NAMADOKTER,
    Poli: p.POLI,
    Alamat: p.ALAMAT,
    'Masuk Poli': p.MASUKPOLY_DISPLAY,
    'Keluar Poli': p.KELUARPOLY,
    'Jenis Rawat': p.JENISRAWAT,
    'Cara Bayar': p.CARABAYAR,
    Status: p.STTS_PULANG,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Pasien')

  const fileName = `daftar_pasien_${formatDate(startDate.value)}_${formatDate(endDate.value)}.xlsx`
  XLSX.writeFile(wb, fileName)

  toast.add({
    severity: 'success',
    summary: 'Export',
    detail: `${rows.length} data berhasil diekspor`,
    life: 3000,
  })
}

// API calls
const fetchData = async (mode) => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    const param = {
      tglawal: formatDate(startDate.value),
      tglakhir: formatDate(endDate.value),
      id_client: id_client.value,
      mod: mode, //'history10',
      kodeunit: selectedStatus.value?.KODE,
      norm: globalFilter.value,
      jenisrawat: JenisRawatSelected.value?.caption,
    }

    loading.value = true

    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history3`, param)

    // Process the response data to add computed fields
    const rawData = response.data.response || []
    namadokterSelected.value = rawData[0] || null
    listpasienStore.value = rawData.map((patient) => ({
      ...patient,
      NAMAPASIEN: patient.NAMAPASIEN || extractNameFromDataSingkat(patient.DATA_SINGKAT),
      STATUS_KUNJUNGAN: patient.STATUS_KUNJUNGAN || 'terdaftar',
      TANGGAL_DAFTAR: patient.TANGGAL_DAFTAR || new Date().toISOString().split('T')[0],
    }))
    lastUpdated.value = new Date()
    updateLastUpdatedLabel()

    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const extractNameFromDataSingkat = (dataSingkat) => {
  if (!dataSingkat) return 'Nama tidak tersedia'
  // Extract name from DATA_SINGKAT if NAMAPASIEN is not available
  const parts = dataSingkat.split(',')
  return parts[0] || 'Nama tidak tersedia'
}

const formatDate = (date) => {
  if (!date) return null

  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Initialize data
onMounted(async () => {
  loadFilters()
  if (!JenisRawatSelected.value) JenisRawatSelected.value = { kode: 0, caption: 'JALAN' }
  fetchData('history10')
  await getdataPoliRuang(JenisRawatSelected.value?.kode ?? 0)
})

// Simpan semua perubahan filter ke localStorage
watch(
  [startDate, endDate, JenisRawatSelected, selectedStatus, statusLayanSelesai, globalFilter],
  () => saveFilters(),
)

// Panggil ulang API hanya saat filter yang dikirim ke server berubah
watch([startDate, endDate, JenisRawatSelected, selectedStatus], () => {
  if (startDate.value && endDate.value) {
    getdataPoliRuang(JenisRawatSelected.value?.kode ?? 0)
    fetchData('history10')
  }
})
</script>

<style scoped>
/* Hero Section */

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 1rem 1rem;
}

.hero-section {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  margin-bottom: 0.75rem;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 139, 139, 0.25);
}

.hero-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hero-usia-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 0.4rem;
  flex-wrap: wrap;
}

.hero-usia-label {
  font-size: 0.62rem;
  font-weight: 600;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.hero-usia-grid {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.hero-usia-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: 1px solid;
  cursor: pointer;
  transition:
    transform 0.15s,
    opacity 0.15s;
}

.hero-usia-chip:hover:not(.hero-usia-chip-empty) {
  transform: scale(1.06);
}

.hero-usia-chip-empty {
  opacity: 0.35;
  cursor: default;
}

.hero-usia-chip-active {
  outline: 2px solid white;
  outline-offset: 1px;
}

.hero-usia-chip-label {
  font-size: 0.65rem;
  font-weight: 600;
}

.hero-usia-chip-count {
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 0 0.3rem;
  line-height: 1.3;
}

.hover-grow {
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
}

.hover-grow:hover {
  transform: scale(1.1);
}

.custom-textarea {
  font-size: 14px !important;
  font-family: 'Arial', sans-serif;
  line-height: 1.5;
  padding: 12px !important;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.6rem;
  font-size: 1.2rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.75rem;
  opacity: 0.85;
  line-height: 1.4;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(15px);
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  min-width: 90px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.1rem;
}

.stat-label {
  font-size: 0.65rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Filter Section */
.filter-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 5px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.elegant-input {
  height: 50px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.elegant-input:focus {
  border-color: #667eea;
  box-shadow:
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Table Section */
.tabs-section {
  background: white;
  border-radius: 1px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-container {
  padding: 0.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.01em;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.last-updated-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.3rem 0.65rem;
  background: transparent;
  white-space: nowrap;
  cursor: default;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.last-updated-label:hover {
  border-color: #9ca3af;
  color: #374151;
}

/* Waiting Time Badge */
.waiting-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  margin-top: 0.2rem;
  width: fit-content;
}
.waiting-success {
  background: #dcfce7;
  color: #15803d;
}
.waiting-warn {
  background: #fef9c3;
  color: #a16207;
}
.waiting-danger {
  background: #fee2e2;
  color: #b91c1c;
}

/* Konfirmasi Panggil Dialog */
.konfirmasi-panggil {
  padding: 0.5rem 0;
}

.konfirmasi-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.konfirmasi-icon {
  font-size: 1.75rem;
  color: #0284c7;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.konfirmasi-nama {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.konfirmasi-sub {
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.6;
}

.konfirmasi-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

/* Kelompok Usia Filter Bar */
.usia-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.usia-filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.usia-filter-chips {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.usia-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  border: 1.5px solid;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s,
    transform 0.1s;
  user-select: none;
}

.usia-chip:not(.usia-chip-empty):hover {
  transform: scale(1.05);
}

.usia-chip-empty {
  opacity: 0.35;
  cursor: default;
}

.usia-chip-badge {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  padding: 0 0.3rem;
  font-size: 0.65rem;
  line-height: 1.4;
}

.usia-chip-active .usia-chip-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* Custom Tooltip */
.usia-chip {
  position: relative;
}

.usia-chip-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  background: white;
  border: 1.5px solid;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 999;
  overflow: hidden;
  pointer-events: none;
}

.usia-chip:not(.usia-chip-empty):hover .usia-chip-tooltip {
  display: block;
}

.usia-chip-tooltip-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.4rem 0.6rem;
}

.usia-chip-tooltip-body {
  padding: 0.4rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.usia-chip-tooltip-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #374151;
}

.usia-chip-tooltip-row span {
  color: #9ca3af;
}

.usia-chip-tooltip-hint {
  font-size: 0.65rem;
  color: #6b7280;
  text-align: center;
  padding: 0.25rem 0.6rem 0.4rem;
  border-top: 1px solid #f1f5f9;
  font-style: italic;
}

/* Rangkuman Kelompok Usia */
.usia-summary-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin-top: 0.5rem;
}

.usia-summary-header {
  font-size: 0.68rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.usia-summary-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.4rem;
}

.usia-card {
  border: 1px solid;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #fafafa;
}

.usia-card-icon {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  flex-shrink: 0;
}

.usia-card-body {
  flex: 1;
  min-width: 0;
}

.usia-card-count {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
}

.usia-card-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #1e293b;
}

.usia-card-range {
  font-size: 0.6rem;
  color: #94a3b8;
}

.usia-card-bar {
  height: 3px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 0.2rem;
}

.usia-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.usia-card:not(.usia-card-empty) {
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.usia-card:not(.usia-card-empty):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.usia-card-active {
  box-shadow: 0 0 0 2px currentColor;
}

.usia-card-empty {
  opacity: 0.4;
  cursor: default;
}

@media (max-width: 768px) {
  .usia-summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Patient Info Styles */
.patient-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.patient-name {
  color: #2563eb;
  font-size: 1rem;
  display: block;
}

.patient-mr {
  color: #6b7280;
  font-size: 0.9rem;
}

.patient-extra {
  color: #9ca3af;
  font-size: 0.85rem;
}

.address-info {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.mr-badge {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-tag-elegant {
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

/* Patient Detail Dialog */
.patient-detail-content {
  padding: 1rem 0;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
}

.detail-item span {
  color: #1e293b;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-stats {
    justify-content: center;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* PrimeVue Component Overrides */
:deep(.modern-select .p-select) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.modern-select .p-select:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.modern-datepicker .p-datepicker-input) {
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.modern-datepicker .p-datepicker-input:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.elegant-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #1e293b;
  font-weight: 600;
  padding: 1rem;
}

:deep(.elegant-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

:deep(.elegant-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc;
  transform: translateY(-1px);
}

:deep(.elegant-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  border: none;
}

:deep(.p-button) {
  border-radius: 8px;
  font-weight: 600;
}

:deep(.p-inputtext) {
  border-radius: 8px;
}

:deep(.p-datepicker input) {
  border-radius: 8px;
}

:deep(.p-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.p-dialog-header) {
  padding: 1.5rem 2rem;
}

:deep(.p-dialog-header .p-dialog-header-icon) {
  color: white;
}

:deep(.p-dialog-header .p-dialog-title) {
  font-weight: 600;
  font-size: 1.125rem;
}

:deep(.p-toast .p-toast-message) {
  border-radius: 8px;
}

:deep(.patient-detail-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* Mobile specific styles */
.table-header-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  flex-wrap: wrap;
}

.mobile-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 10px;
}

.mobile-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.mobile-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.mobile-info-row .label {
  font-weight: 600;
  color: #6b7280;
  min-width: 80px;
}

.mobile-info-row .value {
  text-align: right;
  color: #111827;
  flex: 1;
  word-break: break-word;
}

.mobile-card-footer {
  margin-top: 10px;
}

/* Responsive DataTable adjustments */
@media screen and (max-width: 768px) {
  :deep(.p-datatable) {
    font-size: 12px;
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.5rem;
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.5rem;
  }

  :deep(.p-paginator) {
    padding: 0.5rem;
    flex-wrap: wrap;
  }

  :deep(.p-paginator .p-paginator-pages) {
    display: none;
  }
}

.elegant-datatable ::v-deep(.p-datatable) {
  font-size: 14px;
}

/* Fixed header */
.elegant-datatable ::v-deep(.p-datatable-scrollable-header) {
  position: sticky;
  top: 0;
  z-index: 2;
}

.elegant-datatable ::v-deep(.p-datatable-thead > tr > th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.elegant-datatable ::v-deep(.p-paginator) {
  border-top: 1px solid #e0e0e0;
  margin-top: 10px;
}
</style>
