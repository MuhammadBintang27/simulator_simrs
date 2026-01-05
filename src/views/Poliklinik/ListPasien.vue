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
          <!-- <h3 style="color: cadetblue">Poli : {{ namadokterSelected?.POLI }}</h3> -->
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

    <!-- DataTable Section -->
    <div class="tabs-section">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">
            <i class="pi pi-list"></i>
            Daftar Pasien ({{ filteredPasien.length }})
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
              @click="funcListPasienJJKN()"
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
              @click="fetchData('history10')"
              :loading="loading"
              class="round-button"
              size="small"
            />
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
                      <!-- {{ slotProps.data.NAMADOKTER }} -->
                      {{ slotProps.data.USIA_PASIEN.tahun }} Thn,{{
                        slotProps.data.USIA_PASIEN.bulan
                      }}
                      Bln,
                      {{ slotProps.data.USIA_PASIEN.hari }} Hari
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
                  @click="panggil_pasien(slotProps.data)"
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

    <Dialog
      v-model:visible="showPanggilanAntrian"
      modal
      header="PANGGILAN ANTRIAN"
      :style="{ width: '700px' }"
      class="patient-detail-dialog"
    >
      <div class="row">
        <div class="col-md-4">
          <Button
            class="w-100"
            icon="pi pi-send"
            label="Pasien sudah datang kepoli, siap untuk dilayani"
          />
        </div>
        <div class="col-md-4">
          <Button
            class="w-100"
            severity="warn"
            label="Pasien belum datang kepoli, hanya keperluaan melihat rekam medis"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Panggil Antrian" @click="keformpoli(slotProps.data)" />
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

    <Dialog
      v-model:visible="showPasienJKN"
      modal
      header="Pasien Mobile JKN"
      :style="{ width: isMobile ? '95vw' : '1400px' }"
      :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
      class="patient-detail-dialog"
    >
      <div class="tabs-section">
        <div class="table-container">
          <div class="table-header">
            <h3 class="table-title">
              <i class="pi pi-list"></i>
              Daftar Pasien ({{ listPasienJKN.length }})
            </h3>
            <div class="table-actions">
              <Button
                icon="pi pi-refresh"
                label="Refresh"
                @click="funcListPasienJJKN"
                :loading="loading"
                class="round-button"
                size="small"
              />
            </div>
          </div>
          <Message
            ><small
              >Perhatian Data ini adalah data pasien Mobil JKN yang belum terbit SEP</small
            ></Message
          >
        </div>
      </div>
      <ProgressBar mode="indeterminate" style="height: 3px" v-if="loaddataMjkn"></ProgressBar>

      <DataTable
        v-model:filters="filtersJKN"
        :value="listPasienJKN"
        paginator
        :rows="isMobile ? 5 : 10"
        :rowsPerPageOptions="isMobile ? [5, 10, 25] : [10, 25, 50, 100]"
        filterDisplay="menu"
        stripedRows
        scrollable
        :scrollHeight="isMobile ? '400px' : '600px'"
        :globalFilterFields="[
          'kodebooking',
          'nomorkartu',
          'nohp',
          'kodepoli',
          'pasien',
          'namadokter',
          'jeniskunjungan',
          'waktu_checkin',
          'stts',
          'nomorreferensi',
        ]"
        :sortField="'nomorkartu'"
        :sortOrder="1"
        responsiveLayout="scroll"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} pasien"
        class="elegant-datatable"
      >
        <!-- Mobile Card View -->
        <template #empty>
          <div class="text-center p-3">Tidak ada data</div>
        </template>

        <!-- For Mobile: Use custom body to show card layout -->

        <Column v-if="!isMobile" field="nomorkartu" header="NOKA" sortable filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('nomorkartu')"
              placeholder="Pilih NOKA"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" field="nohp" header="NO HP" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('nohp')"
              placeholder="Pilih No HP"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" field="kodepoli" header="POLI" sortable filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('kodepoli')"
              placeholder="Pilih Poli"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" field="pasien" header="PASIEN" filter>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Cari Pasien"
              @input="filterCallback()"
              class="p-column-filter w-full"
            />
          </template>
          <template #body="slotProps">
            {{ slotProps.data.pasien }} <br />
            Antrian :<strong> {{ slotProps.data.nomorantrianloket }}</strong>
          </template>
        </Column>

        <Column v-if="!isMobile" field="namadokter" header="DOKTER" sortable filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('namadokter')"
              placeholder="Pilih Dokter"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            {{ slotProps.data.kodedokter }} {{ slotProps.data.namadokter }}
          </template>
        </Column>

        <Column v-if="!isMobile" field="jeniskunjungan" header="JENIS KUNJUNGAN" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('jeniskunjungan')"
              placeholder="Pilih Jenis"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            <Tag severity="info" value="Info" v-if="slotProps.data.jeniskunjunganid == 1">
              <small
                ><i class="fas fa-user text-sky-200 mr-2"></i
                >{{ slotProps.data.jeniskunjungan }}</small
              >
            </Tag>
            <Tag severity="warn" value="warn" v-if="slotProps.data.jeniskunjunganid == 3">
              <small
                ><i class="fas fa-user text-sky-200 mr-2"></i
                >{{ slotProps.data.jeniskunjungan }}</small
              >
            </Tag>
            <Tag severity="success" value="warn" v-if="slotProps.data.jeniskunjunganid == 4">
              <small
                ><i class="fas fa-user text-sky-200 mr-2"></i
                >{{ slotProps.data.jeniskunjungan }}</small
              >
            </Tag>
          </template>
        </Column>

        <Column v-if="!isMobile" field="waktu_checkin" header="STTS CHECKIN" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('waktu_checkin')"
              placeholder="Pilih Waktu"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            <i class="fas fa-clock text-blue-500 mr-2"></i>{{ slotProps.data.waktu_checkin }}
          </template>
        </Column>

        <Column v-if="!isMobile" field="stts" header="STTS AKTIF" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('stts')"
              placeholder="Pilih Status"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            <Tag severity="warn" v-if="slotProps.data.deleted == 1">
              <span class="text-red-500 font-semibold">
                <i class="fas fa-times-circle"></i> {{ slotProps.data.stts }}
              </span>
            </Tag>
          </template>
        </Column>

        <Column v-if="!isMobile" field="nomorreferensi" header="NO REF" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('nomorreferensi')"
              placeholder="Pilih No Ref"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" header="AKSI" style="width: 300px">
          <template #body="slotProps">
            <Button
              icon="pi pi-check"
              label="Terbitkan SEP"
              @click="TerbitkanSEP(slotProps.data)"
              :loading="slotProps.data.loading"
              :disabled="slotProps.data.deleted == 1"
              class="round-button2 w-full"
              size="small"
              style="width: 100%"
            />
          </template>
        </Column>

        <!-- Mobile View: Single column with card layout -->
        <Column v-if="isMobile" header="Data Pasien" style="width: 100%">
          <template #body="slotProps">
            <div class="mobile-card">
              <div class="mobile-card-header">
                <div>
                  <i class="fas fa-user text-sky-500 mr-2"></i>
                  <strong>{{ slotProps.data.pasien }}</strong>
                </div>
                <Tag severity="warn" v-if="slotProps.data.deleted == 1" class="ml-2">
                  <small>Nonaktif</small>
                </Tag>
              </div>

              <div class="mobile-card-body">
                <div class="mobile-info-row">
                  <span class="label">Kode Book:</span>
                  <span class="value">{{ slotProps.data.kodebooking }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">NOKA:</span>
                  <span class="value">{{ slotProps.data.nomorkartu }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">No HP:</span>
                  <span class="value">{{ slotProps.data.nohp }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">Poli:</span>
                  <span class="value">{{ slotProps.data.kodepoli }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">Dokter:</span>
                  <span class="value"
                    >{{ slotProps.data.kodedokter }} - {{ slotProps.data.namadokter }}</span
                  >
                </div>
                <div class="mobile-info-row">
                  <span class="label">Jenis:</span>
                  <Tag severity="info" v-if="slotProps.data.jeniskunjunganid == 1">
                    <small>{{ slotProps.data.jeniskunjungan }}</small>
                  </Tag>
                  <Tag severity="warn" v-if="slotProps.data.jeniskunjunganid == 3">
                    <small>{{ slotProps.data.jeniskunjungan }}</small>
                  </Tag>
                  <Tag severity="success" v-if="slotProps.data.jeniskunjunganid == 4">
                    <small>{{ slotProps.data.jeniskunjungan }}</small>
                  </Tag>
                </div>
                <div class="mobile-info-row">
                  <span class="label">Check-in:</span>
                  <span class="value">
                    <i class="fas fa-clock text-blue-500 mr-1"></i
                    >{{ slotProps.data.waktu_checkin }}
                  </span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">No Ref:</span>
                  <span class="value">{{ slotProps.data.nomorreferensi }}</span>
                </div>
              </div>

              <div class="mobile-card-footer">
                <Button
                  icon="pi pi-check"
                  label="Terbitkan SEP"
                  @click="TerbitkanSEP(slotProps.data)"
                  :loading="slotProps.data.loading"
                  :disabled="slotProps.data.deleted == 1"
                  class="round-button2"
                  size="small"
                  style="width: 100%"
                />
              </div>
            </div>
          </template>
        </Column>
      </DataTable>
    </Dialog>

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

import { useRouter } from 'vue-router'
import Pusher from 'pusher-js'

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

const namadokterSelected = ref(null)

const showPanggilanAntrian = ref(false)

const messages = ref([])
const connected = ref(false)
let pusher = null
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
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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

// ✅ Filters untuk semua kolom (gunakan FilterMatchMode.IN untuk MultiSelect)
const filtersJKN = ref({
  nomorkartu: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nohp: { value: null, matchMode: FilterMatchMode.IN },
  kodepoli: { value: null, matchMode: FilterMatchMode.IN },
  pasien: { value: null, matchMode: FilterMatchMode.CONTAINS },
  namadokter: { value: null, matchMode: FilterMatchMode.IN },
  jeniskunjungan: { value: null, matchMode: FilterMatchMode.IN },
  waktu_checkin: { value: null, matchMode: FilterMatchMode.IN },
  stts: { value: null, matchMode: FilterMatchMode.IN },
  nomorreferensi: { value: null, matchMode: FilterMatchMode.IN },
  kodebooking: { value: null, matchMode: FilterMatchMode.IN },
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// ✅ Fungsi untuk ambil opsi unik berdasarkan field
const uniqueOptions = (field) => {
  const values = [...new Set(listPasienJKN.value.map((item) => item[field]))]
  return values.map((v) => ({ label: v, value: v }))
}

const listPasienJKN = ref([])

const loaddataMjkn = ref(false)
const funcListPasienJJKN = async () => {
  try {
    loaddataMjkn.value = true

    const url = configStore.apiBaseUrl

    showPasienJKN.value = true

    const response = await axios.get(
      `${url}/index.php/api/mobil_jkn/getdataantrian_mbjkn/${id_client.value}/${formatDate(startDate.value)}`,
    )

    listPasienJKN.value = response.data.belum_terbit_sep || []

    loaddataMjkn.value = false
  } catch (error) {
    console.error('Error fetching Pasien JKN:', error)
  } finally {
    loaddataMjkn.value = false
  }
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
    console.log(response.data.response)
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
      /* any query params */
    },
  })

  window.open(routeData.href, '_blank')

  await SetTaskID_4(status)
}

const TerbitkanSEP = async (data) => {
  try {
    data.loading = true
    const url = configStore.apiBaseUrl

    const param = {
      id_client: id_client.value,
      nomorreferensi: data.nomorreferensi,
      jenis_kunjungan: data.jeniskunjunganid,
      user_id: user_id.value,
      tglsep: formatDate(startDate.value),
      kd_dokter: data.kodedokter,
      dokterSelected: {
        KDDOKTER: data.kodedokter,
      },
      kd_poli: data.kodepoli == 'PAR' ? '097' : data.kodepoli,
      kode_booking: data.kodebooking,
    }
    let wich_url = ''

    if (data.jeniskunjunganid == 3) {
      wich_url = `${url}/index.php/api/bpjs_api/TerbitsepDariSuratKontrol`
    } else {
      wich_url = `${url}/index.php/api/bpjs_api/terbitsepDariRujukan`
    }

   

    const response = await axios.post(wich_url, param)
    console.log(response.data)
    if (response.data.metadata.code == 200) {
      showSuccess(response.data.metadata.message)
      funcListPasienJJKN()
    } else {
      showInfo(response.data.metadata.message)
    }

    data.loading = false
  } catch (error) {
    console.log(error)
    data.loading = false
  } finally {
    data.loading = false
  }

  data.loading = false
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

const panggil_pasien = async (data) => {
  const url = configStore.apiBaseUrl

  data.loading = true

  const response = await axios.get(
    `${url}/index.php/api/antrian/panggil_pasien_poli/${data.NOPENDAFTARAN}/${id_client.value}`,
  )

  const payload_pusher = {
    channel: `channel1${id_client.value}`, // matches: "channel1" + ID_CLIENT
    event: 'panggil_antrian_poli', // event name
    JENIS_ANTRIAN: response.data.JENIS_ANTRIAN,
    NOMOR_ANTRIAN: response.data.NOMOR_ANTRIAN,
    PANGGILAN_POLI: 1,
    LOKET: 1,
    POLI: response.data.POLI,
    NAMA_PASIEN: data.DATA_SINGKAT,
    NAMA_DOKTER: data.NAMADOKTER, // your data object
    KODE_DOKTER: data.KDDOKTER, // your data object
  }
  await axios.post(`${url}/index.php/api/data_referensi/push_to_pusher_v2/`, payload_pusher)

  data.loading = false
}

const SetTaskID_4 = async (data) => {
  const url = configStore.apiBaseUrl

  const response = await axios.get(
    `${url}/index.php/api/antrian/panggil_pasien_poli/${data.NOPENDAFTARAN}/${id_client.value}`,
  )
  console.log(response.data)
}

onUnmounted(() => {
  // Buat koneksi ke Pusher
  pusher = new Pusher('2dfe2aa2404cb8b93954', {
    cluster: 'ap1',
    encrypted: true,
  })
})

onMounted(() => {
  // Subscribe ke channel
})

// Computed properties
const filteredPasien = computed(() => {
  let filtered = [...listpasienStore.value]

  // Global filter
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
    // Filter by selected status

    // Filter by Status Layan Selesai
    if (statusLayanSelesai.value) {
      if (statusLayanSelesai.value.kode === 0) {
        filtered = filtered.filter((patient) => patient.STATUS == 0)
      }
      if (statusLayanSelesai.value.kode != 0) {
        filtered = filtered.filter((patient) => patient.STATUS != 0)
      }
      // If kode is 2, show all, so no filtering needed
    }
  }
  return filtered
})

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

const listRuangPoli = ref([])
const getdataPoliRuang = async (mode) => {
  try {
    loading.value = true
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

const resetFilters = () => {
  globalFilter.value = ''
  selectedStatus.value = null
  startDate.value = new Date()
  endDate.value = new Date()

  toast.add({
    severity: 'info',
    summary: 'Filter Reset',
    detail: 'Semua filter telah direset',
    life: 2000,
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

    loading.value = false
    // toast.add({
    //   severity: 'success',
    //   // summary: 'Berhasil',
    //   detail: `Berhasil memuat ${listpasienStore.value.length} data pasien`,
    //   life: 3000,
    // })
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
  fetchData('history10')
  JenisRawatSelected.value = {
    kode: 0,
    caption: 'JALAN',
  }

  await getdataPoliRuang(0)
})

watch([startDate, endDate, JenisRawatSelected], () => {
  if (startDate.value && endDate.value) {
    //fetchData()

    getdataPoliRuang(JenisRawatSelected.value.kode)
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
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.5rem;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.hover-grow {
  cursor: pointer; /* hand cursor */
  transition: transform 0.1s ease-in-out;
}

.hover-grow:hover {
  transform: scale(1.1); /* grow 10% on hover */
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
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  font-size: 2rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(15px);
  border-radius: 4px;
  padding: 1.5rem;
  min-width: 180px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
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
