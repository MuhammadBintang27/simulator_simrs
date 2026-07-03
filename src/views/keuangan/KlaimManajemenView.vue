<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <h4><i class="fas fa-file-invoice-dollar mr-2"></i> Klaim Manajemen</h4>
      </div>
      <div class="card-body">
        <div class="row">
          <!-- Tanggal Mulai -->
          <div class="col-md-2">
            <div class="control-group">
              <label class="filter-label">
                <i class="fas fa-calendar-plus"></i>
                TANGGAL MULAI
              </label>
              <br />
              <DatePicker
                v-model="startDate"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal mulai"
                showIcon
                class="w-100"
                iconDisplay="input"
              />
            </div>
          </div>

          <!-- Tanggal Akhir -->
          <div class="col-md-2">
            <div class="control-group">
              <label class="filter-label">
                <i class="fas fa-calendar-check"></i>
                TANGGAL AKHIR
              </label>
              <br />
              <DatePicker
                v-model="endDate"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal akhir"
                showIcon
                class="w-100"
                iconDisplay="input"
              />
            </div>
          </div>

          <!-- Jenis Rawat -->
          <div class="col-md-1">
            <label class="filter-label">
              <i class="fas fa-hospital-user"></i>
              JENIS RAWAT
            </label>
            <br />
            <Select
              v-model="jenisRawatSelected"
              :options="jenis_rawat"
              placeholder="Pilih Jenis"
              class="p-column-filter mt-0"
              optionLabel="caption"
            />
          </div>

          <!-- Status Pulang -->
          <div class="col-md-1">
            <label class="filter-label">
              <i class="fas fa-door-open"></i>
              STTS PULANG
            </label>
            <br />
            <Select
              v-model="sttsPulangSelected"
              :options="sttsPulangOpts"
              placeholder="Pilih Status"
              class="p-column-filter mt-0 w-100"
              optionLabel="caption"
            />
          </div>

          <!-- Cara Bayar -->
          <div class="col-md-1 ml-0">
            <label class="filter-label">
              <i class="fas fa-door-open"></i>
              CARA BAYAR
            </label>
            <br />
            <Select
              v-model="caraBayarSelected"
              :options="caraBayarOptions"
              placeholder="Pilih Status"
              class="p-column-filter mt-0"
            />
          </div>

          <!-- Tombol Cari -->
          <div class="col-md-1 ml-0">
            <br />
            <Button
              class="w-100 mt-2 round-button2"
              @click="fetchData"
              label="Cari"
              icon="fas fa-search"
              :loading="loading"
              :disabled="loading"
            />
          </div>
          <div class="col-md-2 ml-0">
            <br />
            <Button
              class="w-100 mt-2 round-button2"
              @click="get_cost_monitoring"
              label="Cost Monitoring"
              icon="fas fa-search"
              :loading="loading"
              :disabled="loading"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="summary-strip">
      <div class="summary-chip gradient-primary">
        <i class="fas fa-list summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Total Data</span>
          <span class="summary-chip-val">{{ filteredCount }}</span>
        </div>
      </div>
      <div class="summary-chip gradient-info">
        <i class="fas fa-file-upload summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Klaim Diajukan</span>
          <span class="summary-chip-val">{{ formatCurrency(totalTarifCBG) }}</span>
        </div>
      </div>
      <div class="summary-chip gradient-success">
        <i class="fas fa-check-circle summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Klaim Disetujui</span>
          <span class="summary-chip-val">{{ formatCurrency(disetujuiBPJS) }}</span>
        </div>
      </div>
      <div class="summary-chip" :class="selisihKlaim >= 0 ? 'gradient-warning' : 'gradient-danger'">
        <i class="fas fa-minus-circle summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Selisih</span>
          <span class="summary-chip-val"
            >{{ formatCurrency(selisihKlaim) }}
            <small v-if="totalTarifCBG > 0">({{ persentaseSelisih }}%)</small></span
          >
        </div>
      </div>
      <div class="summary-chip gradient-secondary">
        <i class="fas fa-percent summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">% Persetujuan</span>
          <span class="summary-chip-val">{{ persentasePersetujuan }}%</span>
        </div>
      </div>
      <div class="summary-chip gradient-light">
        <i class="fas fa-chart-line summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Rata-rata Selisih</span>
          <span class="summary-chip-val">{{ formatCurrency(rataRataSelisih) }}</span>
        </div>
      </div>
      <div class="summary-chip gradient-danger">
        <i class="fas fa-exclamation-triangle summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Tidak Diajukan</span>
          <span class="summary-chip-val"
            >{{ jumlahTidakDiajukan }} <small>({{ persentaseTidakDiajukan }}%)</small></span
          >
        </div>
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="card">
      <div class="card-body">
        <!-- Toolbar -->
        <div class="tbl-toolbar">
          <div class="tbl-filter-group">
            <span class="tbl-filter-lbl">Status Coder</span>
            <div class="tbl-stts-pills">
              <button
                v-for="opt in sttsCoderOpts"
                :key="String(opt.value)"
                class="tbl-stts-pill"
                :class="[`tbl-stts-pill-${opt.cls}`, { active: sttsCoderFilter === opt.value }]"
                @click="sttsCoderFilter = opt.value"
              >
                <i :class="opt.icon"></i>
                {{ opt.label }}
                <span class="tbl-stts-count">{{ sttsCoderCount[String(opt.value)] }}</span>
              </button>
            </div>
          </div>
          <div class="tbl-actions">
            <Button
              icon="pi pi-filter-slash"
              label="Reset"
              size="small"
              severity="secondary"
              outlined
              @click="clearFilters()"
            />
            <Button
              icon="pi pi-file-excel"
              label="Excel"
              size="small"
              severity="success"
              outlined
              @click="exportToExcel"
            />
            <Button
              icon="pi pi-sync"
              label="Sync BPJS"
              size="small"
              severity="warn"
              outlined
              :loading="loadingSync"
              @click="syncDataBPJS"
            />
            <Button
              icon="pi pi-sync"
              label="Cek SEP"
              size="small"
              severity="info"
              outlined
              :loading="loadingCheckSEP"
              @click="loopPengecheckanSEP"
            />
            <Button
              icon="pi pi-file-pdf"
              label="Export PDF Batch"
              size="small"
              severity="danger"
              outlined
              :loading="isBatchExporting"
              @click="showBatchDialog = true"
            />
            <Button
              icon="pi pi-cog"
              label="Atur Kolom"
              size="small"
              :severity="showColumnMenu ? 'primary' : 'secondary'"
              :outlined="!showColumnMenu"
              @click="toggleColumnMenu"
            />
          </div>
        </div>

        <!-- Column Selection Panel -->
        <div v-if="showColumnMenu" class="column-menu mb-3">
          <div class="column-menu-header">
            <h6>Pilih Kolom yang Ditampilkan</h6>
            <Button
              type="button"
              icon="pi pi-times"
              severity="secondary"
              @click="toggleColumnMenu"
              :text="true"
            />
          </div>
          <div class="column-list">
            <div v-for="col in allColumns" :key="col.field" class="column-item">
              <Checkbox
                :modelValue="visibleColumns.includes(col.field)"
                @update:modelValue="toggleColumn(col.field)"
                :binary="true"
              />
              <label @click="toggleColumn(col.field)" style="margin-left: 5px">{{
                col.header
              }}</label>
            </div>
          </div>
          <div class="column-menu-footer">
            <Button type="button" label="Tampilkan Semua" size="small" @click="selectAllColumns" />
            <Button
              type="button"
              label="Sembunyikan Semua"
              size="small"
              severity="secondary"
              @click="deselectAllColumns"
            />
          </div>
        </div>
        <DataTable
          ref="dtRef"
          v-model:filters="filters"
          :value="filteredByStts"
          striped-rows
          showGridlines
          paginator
          rowHover
          responsiveLayout="scroll"
          :rows="25"
          :rowsPerPageOptions="[5, 10, 20, 25, 50, 100]"
          @filter="onFilter"
          tableStyle="min-width: 50rem"
          filterDisplay="row"
          responsive-layout="scroll"
          class="p-datatable-sm"
          scrollable
          scrollHeight="700px"
          resizableColumns
          columnResizeMode="expand"
          @columnResizeEnd="saveColumnWidths"
          :globalFilterFields="[
            'NAMAPASIEN',
            'POLI',
            'CARABAYAR',
            'NAMADOKTER',
            'DIAGNOSA_AWAL',
            'KETERANGAN',
            'STTS_PULANG',
          ]"
        >
          <!-- "printResumePasien(data)" -->
          <Column
            v-if="isColumnVisible('NOMR')"
            field="NOMR"
            header="NOMR"
            sortable
            :showFilterMenu="false"
          >
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                @input="filterCallback()"
                placeholder="Cari NOMR..."
                class="p-column-filter"
              />
            </template>
          </Column>
          <Column
            v-if="isColumnVisible('NAMAPASIEN')"
            field="NAMAPASIEN"
            header="Nama Pasien"
            style="min-width: 14rem"
            sortable
          >
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                @input="filterCallback()"
                placeholder="Cari nama..."
                class="p-column-filter"
                style="min-width: 10rem"
              />
            </template>
          </Column>
          <Column v-if="isColumnVisible('USIA')" field="USIA" header="Usia" sortable />
          <Column
            v-if="isColumnVisible('JENISKELAMIN')"
            field="JENISKELAMIN"
            header="JK"
            style="min-width: 4rem"
            sortable
          />
          <!-- Kolom Data Dasar -->
          <Column v-if="isColumnVisible('NOPENDAFTARAN')" field="NOPENDAFTARAN" header="NOREG">
            <template #body="{ data }">
              <Button
                icon="pi pi-file-pdf"
                label="..."
                size="small"
                severity="info"
                outlined
                class="round-button2"
                @click="ShowDetailsdata(data)"
              /> </template
          ></Column>
          <Column
            v-if="isColumnVisible('NOTELP')"
            field="NOTELP"
            header="NOTELP"
            style="min-width: 4rem"
            sortable
          />
          <Column
            v-if="isColumnVisible('NOSEP')"
            field="NOSEP"
            header="NOSEP"
            style="min-width: 4rem"
            sortable
            :filterMatchModeOptions="[{ label: 'Contains', value: 'contains' }]"
          >
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                @input="filterCallback()"
                placeholder="Cari No. SEP..."
                class="p-column-filter"
              />
            </template>
          </Column>
          <!-- Kolom Status -->
          <Column v-if="isColumnVisible('STTS_CODER')" field="STTS_CODER" header="STTS" sortable>
            <template #body="{ data }">
              <span
                class="status-cell"
                :class="{
                  'status-cell-success': data.STTS_CODER == 1,
                  'status-cell-warning': data.STTS_CODER == 2,
                  'status-cell-danger': data.STTS_CODER == 0,
                  'status-cell-info': data.STTS_CODER == 3,
                }"
              >
                <small v-if="data.STTS_CODER == 1" class="badge badge-success">C</small>
                <small v-if="data.STTS_CODER == 2" class="badge badge-warning">P</small>
                <small v-if="data.STTS_CODER == 0" class="badge badge-danger">M</small>
                <small v-if="data.STTS_CODER == 3" class="badge badge-info">S</small>
              </span>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="sttsCoderFilterOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih Status"
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>

          <!-- Kolom Klaim -->
          <Column
            v-if="isColumnVisible('CARABAYAR')"
            field="CARABAYAR"
            header="Cara Bayar"
            sortable
          >
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="caraBayarFilterOptions"
                placeholder="Pilih Cara Bayar"
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('POLI')"
            field="POLI"
            header="Poli"
            style="min-width: 10rem"
            sortable
          >
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="2"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="poliOptions"
                placeholder="Pilih Poli"
                filter
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('NAMADOKTER')"
            field="NAMADOKTER"
            header="Dokter"
            style="min-width: 15rem"
            sortable
          >
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="2"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="dokterOptions"
                placeholder="Pilih Dokter"
                filter
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('DIAGNOSA_AWAL')"
            field="DIAGNOSA_AWAL"
            header="DX"
            sortable
          />
          <Column
            v-if="isColumnVisible('CODE')"
            field="CODE"
            header="CODE"
            style="min-width: 5rem"
          />
          <Column
            v-if="isColumnVisible('KETERANGAN')"
            field="KETERANGAN"
            header="KETERANGAN"
            style="min-width: 15rem"
            sortable
          >
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="KetaranganOpt"
                placeholder="STTS PULANG"
                class="p-column-filter"
                filter
                showClear
              />
            </template>
          </Column>

          <!-- Kolom Analisis Klaim -->
          <Column
            v-if="isColumnVisible('TARIFCBG')"
            field="TARIFCBG"
            header="KLAIM DIAJUKAN"
            style="min-width: 4rem"
            sortable
          >
            <template #body="{ data }">
              <strong>{{ formatCurrency(data.TARIFCBG) }}</strong>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="tarifCbgOptions"
                placeholder="Stts Final"
                class="p-column-filter"
                filter
                showClear
              />
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('OBATAN')"
            field="OBATAN"
            header="OBAT-OBATAN"
            style="min-width: 7rem"
            sortable
          >
            <template #body="{ data }">
              <strong>{{ formatCurrency(data.OBATAN) }}</strong>
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('DISETUJUI')"
            field="DISETUJUI"
            header="KLAIM DISETUJUI"
            style="min-width: 7rem"
            sortable
          >
            <template #body="{ data }">
              <strong>{{ formatCurrency(data.DISETUJUI) }}</strong>
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('SELISIH')"
            field="SELISIH"
            header="SELISIH"
            style="min-width: 7rem"
            sortable
          >
            <template #body="{ data }">
              <strong>
                {{ formatCurrency(calculateSelisih(data)) }}
              </strong>
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('PERSENTASE_SELISIH')"
            field="PERSENTASE_SELISIH"
            header="% SELISIH"
            style="min-width: 7rem"
          >
            <template #body="{ data }">
              <Badge
                :value="`${calculatePersentaseSelisih(data)}%`"
                :severity="calculatePersentaseSelisih(data) >= 0 ? 'warning' : 'danger'"
              />
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('SUDAHFINALCLAIM')"
            field="SUDAHFINALCLAIM"
            header="FINAL CLAIM"
            style="min-width: 8rem"
          >
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="sudahFilanClaim"
                placeholder="Stts Final"
                class="p-column-filter"
                filter
                showClear
              />
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('IS_AKTIF_SEP')"
            field="IS_AKTIF_SEP"
            header="SEP AKTIF"
            sortable
            style="min-width: 7rem"
          >
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="3"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="isAktifSEP"
                placeholder="Stts Final"
                class="p-column-filter"
                filter
                showClear
              />
            </template>
          </Column>

          <!-- Kolom Waktu -->
          <Column
            v-if="isColumnVisible('MASUKPOLY')"
            field="MASUKPOLY"
            header="TGL MASUK"
            sortable
            style="min-width: 7rem"
          >
            <template #body="{ data }">
              {{ formatDateOnlyForAPI(data.MASUKPOLY) }}
            </template>
          </Column>

          <Column
            v-if="isColumnVisible('KELUARPOLY_NULL')"
            field="KELUARPOLY_NULL"
            header="TGL PULANG"
            sortable
            style="min-width: 7rem"
          >
            <template #body="{ data }">
              {{ formatDateOnlyForAPI(data.KELUARPOLY_NULL) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
  <Dialog
    v-model:visible="ShowProgressCheckSEP"
    :style="{ width: '700px' }"
    :modal="true"
    :closable="false"
    header="Pengecekan Status SEP"
  >
    <div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: #64748b">
      <span v-if="loadingCheckSEP">
        Sedang memproses: <strong>{{ nosepSedanSign }}</strong>
      </span>
      <span v-else>
        Selesai —
        <strong :style="{ color: listRespons.length > 0 ? '#dc2626' : '#16a34a' }">
          {{ listRespons.length }} bermasalah
        </strong>
        dari {{ TempfilteredData.length }} SEP
      </span>
    </div>

    <ProgressBar :value="progress" style="margin-bottom: 0.75rem" />

    <div
      v-if="!loadingCheckSEP && listRespons.length === 0"
      style="
        text-align: center;
        padding: 1.5rem;
        color: #16a34a;
        font-weight: 600;
        font-size: 0.9rem;
      "
    >
      <i
        class="pi pi-check-circle"
        style="font-size: 1.5rem; display: block; margin-bottom: 0.4rem"
      ></i>
      Semua SEP aktif — tidak ada yang bermasalah
    </div>

    <table v-else-if="listRespons.length > 0" class="table-progress">
      <thead>
        <tr>
          <th style="width: 50px; text-align: center">No</th>
          <th style="width: 200px; text-align: left">SEP</th>
          <th style="text-align: left">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in listRespons" :key="item.sep">
          <td style="text-align: center">{{ index + 1 }}</td>
          <td>{{ item.sep }}</td>
          <td style="color: #dc2626">{{ item.metadata || '-' }}</td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        severity="secondary"
        outlined
        :disabled="loadingCheckSEP"
        @click="ShowProgressCheckSEP = false"
      />
    </template>
  </Dialog>
  <!-- ── Dialog: Export PDF Batch ────────────────────────────────────── -->
  <Dialog
    v-model:visible="showBatchDialog"
    :style="{ width: '600px' }"
    modal
    :closable="!isBatchExporting"
    header="Export PDF Batch — Rekam Medis"
  >
    <div v-if="!isBatchExporting && batchLog.length === 0">
      <!-- Folder Picker -->
      <div class="batch-folder-row" v-if="supportsFilePicker">
        <template v-if="!dirHandleName">
          <i class="pi pi-folder" style="color: #888; font-size: 18px; flex-shrink: 0"></i>
          <div style="flex: 1">
            <div style="font-size: 13px; font-weight: 600; color: #333">Pilih folder tujuan</div>
            <div style="font-size: 11px; color: #888">
              Semua PDF akan disimpan langsung ke folder pilihan Anda
            </div>
          </div>
          <Button
            label="Pilih Folder"
            icon="pi pi-folder-open"
            size="small"
            severity="secondary"
            outlined
            @click="selectDownloadFolder"
          />
        </template>
        <template v-else>
          <i class="pi pi-folder-open" style="color: #16a34a; font-size: 18px; flex-shrink: 0"></i>
          <div style="flex: 1">
            <div style="font-size: 13px; font-weight: 700; color: #111">{{ dirHandleName }}</div>
            <div style="font-size: 11px; margin-top: 2px">
              <span v-if="isScanning" style="color: #888">
                <i class="pi pi-spin pi-spinner"></i> Membaca isi folder...
              </span>
              <template v-else>
                <span style="color: #16a34a">{{ existingFilesCount }} file PDF ditemukan</span>
                <span v-if="batchSkipCount > 0" style="color: #d97706; margin-left: 8px">
                  <i class="pi pi-forward"></i> {{ batchSkipCount }} akan di-skip
                </span>
                <span v-else-if="existingFilesCount > 0" style="color: #6b7280; margin-left: 8px">
                  Tidak ada yang cocok
                </span>
              </template>
            </div>
          </div>
          <Button
            label="Scan Ulang"
            icon="pi pi-refresh"
            size="small"
            severity="secondary"
            outlined
            :loading="isScanning"
            @click="scanFolderForExisting"
          />
          <Button
            label="Ganti"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            text
            @click="selectDownloadFolder"
          />
        </template>
      </div>
      <div class="batch-folder-row batch-folder-info" v-else>
        <i class="pi pi-download" style="color: #888; font-size: 15px; flex-shrink: 0"></i>
        <div style="font-size: 11px; color: #666">
          Browser tidak mendukung pemilihan folder — file akan diunduh satu per satu ke folder
          unduhan default.
        </div>
      </div>

      <!-- Kualitas PDF -->
      <div class="batch-quality-row">
        <span class="batch-quality-label"><i class="pi pi-sliders-h"></i> Kualitas PDF</span>
        <div class="batch-quality-seg">
          <button
            v-for="p in BATCH_PDF_PRESETS"
            :key="p.key"
            class="batch-qbtn"
            :class="{ active: batchPdfQuality === p.key }"
            @click="setBatchPdfQuality(p.key)"
            :title="p.desc"
          >
            <span class="bqbtn-label">{{ p.label }}</span>
            <span class="bqbtn-size">{{ p.size }}</span>
          </button>
        </div>
      </div>

      <!-- Info jumlah data -->
      <div class="batch-info">
        <i class="pi pi-info-circle" style="color: #4a7ab5; font-size: 20px; flex-shrink: 0"></i>
        <div style="flex: 1">
          <div style="font-weight: 600; margin-bottom: 4px">
            Total <strong>{{ batchDataToExport.length }}</strong> berkas RME
            <template v-if="batchSkipCount > 0">
              —
              <span style="color: #16a34a"
                >{{ batchDataToExport.length - batchSkipCount }} akan diproses</span
              >,
              <span style="color: #d97706">{{ batchSkipCount }} di-skip</span>
            </template>
          </div>
          <div style="font-size: 12px; color: #666">
            File yang sudah ada di folder akan dilewati secara otomatis.
          </div>
          <div
            v-if="batchDataToExport.length - batchSkipCount > 30"
            style="margin-top: 8px; color: #c0392b; font-size: 12px"
          >
            <i class="pi pi-exclamation-triangle"></i>
            Lebih dari 30 berkas akan diproses — membutuhkan waktu cukup lama.
          </div>
        </div>
      </div>
    </div>

    <div v-if="isBatchExporting || batchLog.length > 0">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        "
      >
        <span style="font-size: 13px; color: #555">
          <span v-if="isBatchExporting">
            Memproses
            <strong>{{ batchCurrentIdx + 1 }}</strong> /
            <strong>{{ batchLog.length }}</strong>
          </span>
          <span v-else style="color: #16a34a; font-weight: 600">
            <i class="pi pi-check-circle"></i>
            Selesai —
            {{ batchLog.filter((x) => x.status === 'done').length }} berhasil,
            {{ batchLog.filter((x) => x.status === 'skipped').length }} di-skip,
            {{ batchLog.filter((x) => x.status === 'error').length }} gagal
          </span>
        </span>
        <span style="font-size: 12px; font-weight: 700; color: #162d4e">{{ batchProgress }}%</span>
      </div>
      <ProgressBar :value="batchProgress" style="margin-bottom: 10px; height: 8px" />

      <div class="batch-log-scroll">
        <div
          v-for="(item, idx) in batchLog"
          :key="item.noreg"
          class="batch-log-item"
          :class="`batch-log-${item.status}`"
        >
          <span class="batch-log-idx">{{ idx + 1 }}</span>
          <span class="batch-log-icon">
            <i v-if="item.status === 'waiting'" class="pi pi-clock"></i>
            <i v-else-if="item.status === 'processing'" class="pi pi-spin pi-spinner"></i>
            <i v-else-if="item.status === 'done'" class="pi pi-check-circle"></i>
            <i v-else-if="item.status === 'skipped'" class="pi pi-forward"></i>
            <i v-else class="pi pi-times-circle"></i>
          </span>
          <span class="batch-log-name">{{ item.nama }}</span>
          <span class="batch-log-noreg">{{ item.nosep }}</span>
          <span v-if="item.status === 'error'" class="batch-log-err">{{ item.error }}</span>
          <button
            v-if="item.status === 'error' && !isBatchExporting"
            class="batch-resume-btn"
            @click="resumeItem(item)"
            title="Ulangi item ini"
          >
            <i class="pi pi-refresh"></i> Ulangi
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        v-if="!isBatchExporting && batchLog.length === 0"
        label="Mulai Export"
        icon="pi pi-file-pdf"
        severity="danger"
        @click="startBatchExport"
        :disabled="batchDataToExport.length === 0"
      />
      <Button
        v-if="isBatchExporting"
        label="Batalkan"
        icon="pi pi-times"
        severity="secondary"
        outlined
        @click="cancelBatchExport = true"
      />
      <Button
        v-if="!isBatchExporting && errorCount > 0"
        :label="`Resume Gagal (${errorCount})`"
        icon="pi pi-refresh"
        severity="warning"
        @click="resumeAllFailed"
      />
      <Button
        v-if="!isBatchExporting && batchLog.length > 0"
        label="Tutup"
        icon="pi pi-times"
        severity="secondary"
        outlined
        @click="closeBatchDialog"
      />
    </template>
  </Dialog>

  <Toast />
  <KlaimResumeComponent
    v-model:showKlaim="showKlaim"
    :datapasien="selectedNoreg"
    @saved="onKlaimSaved"
  />
  <KlaimEntriVue v-model:showDialog="showKlaimEntri" :datapasien="selectedNoreg" />
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import ProgressBar from 'primevue/progressbar'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import Badge from 'primevue/badge'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, group_user } = storeToRefs(authStore)
const toast = useToast()
import { useRouter } from 'vue-router'
const router = useRouter()

const ShowProgressCheckSEP = ref(false)

import KlaimResumeComponent from '@/components/Keuangan/KlaimResumeComponent.vue'
import KlaimEntriVue from '@/views/keuangan/JKN/KlaimEntriVue.vue'

const loading = ref(false)
const startDate = ref(new Date())
const endDate = ref(new Date())

// ── Batch Export PDF ────────────────────────────────────────────────────────
const showBatchDialog = ref(false)
const isBatchExporting = ref(false)
const batchProgress = ref(0)
const batchCurrentIdx = ref(0)
const batchLog = ref([])
const cancelBatchExport = ref(false)

// ── Kualitas PDF batch (disinkron dengan localStorage yg dibaca RMEViewer) ──
const BATCH_PDF_PRESETS = [
  { key: 'tinggi', label: 'Tinggi', size: '~3–8 MB', desc: 'Kualitas terbaik, file besar' },
  { key: 'sedang', label: 'Sedang', size: '~1–3 MB', desc: 'Seimbang antara kualitas & ukuran' },
  { key: 'rendah', label: 'Rendah', size: '< 1 MB', desc: 'File kecil, kualitas lebih rendah' },
]
const batchPdfQuality = ref(localStorage.getItem('rme_pdf_quality') || 'sedang')
const setBatchPdfQuality = (key) => {
  batchPdfQuality.value = key
  localStorage.setItem('rme_pdf_quality', key)
}

// ── Folder tujuan (File System Access API) ──────────────────────────────────
const dirHandle = ref(null)
const dirHandleName = ref('')
const supportsFilePicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window
const existingFiles = ref(new Set()) // Set<string> lowercase filename
const existingFilesCount = ref(0)
const isScanning = ref(false)

const scanFolderForExisting = async () => {
  if (!dirHandle.value) return
  isScanning.value = true
  try {
    const names = new Set()
    for await (const [name, handle] of dirHandle.value.entries()) {
      if (handle.kind === 'file') names.add(name.toLowerCase())
    }
    existingFiles.value = names
    existingFilesCount.value = names.size
  } catch (e) {
    showError('Gagal membaca isi folder: ' + e.message)
  } finally {
    isScanning.value = false
  }
}

const fileExistsForPatient = (nosep) => {
  // Filename format: {nosep}.pdf (sesuai RMEVIewer)
  const fname = String(nosep).toLowerCase() + '.pdf'
  return existingFiles.value.has(fname)
}

const selectDownloadFolder = async () => {
  try {
    const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
    dirHandle.value = handle
    dirHandleName.value = handle.name
    existingFiles.value = new Set()
    existingFilesCount.value = 0
    await scanFolderForExisting()
  } catch (e) {
    if (e.name !== 'AbortError') showError('Gagal memilih folder: ' + e.message)
  }
}

const batchDataToExport = computed(() =>
  TempfilteredData.value.length > 0 ? TempfilteredData.value : filteredByStts.value,
)

const batchSkipCount = computed(
  () =>
    batchDataToExport.value.filter((row) => fileExistsForPatient(row.NOSEP || row.NOPENDAFTARAN))
      .length,
)

const closeBatchDialog = () => {
  showBatchDialog.value = false
  batchLog.value = []
  batchProgress.value = 0
  batchCurrentIdx.value = 0
  cancelBatchExport.value = false
}

const exportPatientViaIframe = (noreg) =>
  new Promise((resolve, reject) => {
    // Create iframe programmatically so jQuery IFrame.js plugin never hooks into it
    const iframe = document.createElement('iframe')
    iframe.style.cssText =
      'position:fixed;left:-9999px;top:-9999px;width:1300px;height:900px;opacity:0;border:none;pointer-events:none'

    const cleanup = () => {
      iframe.src = 'about:blank'
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }

    const url = router.resolve({ name: 'RMEViewer', query: { noreg, autoexport: '1' } }).href

    const onMsg = async (e) => {
      if (e.data?.noreg !== String(noreg)) return
      window.removeEventListener('message', onMsg)
      clearTimeout(timeoutId)
      cleanup()

      if (e.data?.type === 'rme_export_done') {
        const buf = e.data.pdfBuffer
        const fname = e.data.filename || `RME_${noreg}.pdf`
        if (buf) {
          if (dirHandle.value) {
            // Tulis langsung ke folder yang dipilih user
            try {
              const fh = await dirHandle.value.getFileHandle(fname, { create: true })
              const writable = await fh.createWritable()
              await writable.write(buf)
              await writable.close()
            } catch (writeErr) {
              reject(new Error('Gagal menyimpan ke folder: ' + writeErr.message))
              return
            }
          } else {
            // Fallback: trigger download biasa
            const blob = new Blob([buf], { type: 'application/pdf' })
            const objectUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = objectUrl
            a.download = fname
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(objectUrl)
          }
        }
        resolve()
      } else {
        reject(new Error(e.data?.message || 'Export gagal'))
      }
    }
    window.addEventListener('message', onMsg)

    const timeoutId = setTimeout(() => {
      window.removeEventListener('message', onMsg)
      cleanup()
      reject(new Error('Timeout (90s)'))
    }, 90000)

    document.body.appendChild(iframe)
    iframe.src = url
  })

const errorCount = computed(() => batchLog.value.filter((x) => x.status === 'error').length)

const runBatchLoop = async () => {
  isBatchExporting.value = true
  cancelBatchExport.value = false

  const items = batchLog.value
  for (let i = 0; i < items.length; i++) {
    if (cancelBatchExport.value) break
    batchCurrentIdx.value = i
    const item = items[i]

    if (item.status !== 'waiting') continue

    item.status = 'processing'
    try {
      await exportPatientViaIframe(item.noreg)
      item.status = 'done'
    } catch (e) {
      item.status = 'error'
      item.error = e.message
    }

    const settled = items.filter((x) => x.status !== 'waiting' && x.status !== 'processing').length
    batchProgress.value = Math.round((settled / items.length) * 100)

    if (i < items.length - 1 && !cancelBatchExport.value) {
      await new Promise((r) => setTimeout(r, 800))
    }
  }

  isBatchExporting.value = false
}

const startBatchExport = async () => {
  const data = batchDataToExport.value
  if (!data.length) return

  batchProgress.value = 0
  batchCurrentIdx.value = 0

  batchLog.value = data.map((row) => ({
    noreg: row.NOPENDAFTARAN,
    nosep: row.NOSEP || row.NOPENDAFTARAN,
    nama: row.NAMAPASIEN,
    nomr: row.NOMR,
    status: fileExistsForPatient(row.NOSEP || row.NOPENDAFTARAN) ? 'skipped' : 'waiting',
    error: '',
  }))

  await runBatchLoop()
}

const resumeAllFailed = async () => {
  const errItems = batchLog.value.filter((x) => x.status === 'error')
  if (!errItems.length) return
  errItems.forEach((item) => {
    item.status = 'waiting'
    item.error = ''
  })
  await runBatchLoop()
}

const resumeItem = async (item) => {
  item.status = 'waiting'
  item.error = ''
  isBatchExporting.value = true
  cancelBatchExport.value = false
  item.status = 'processing'
  try {
    await exportPatientViaIframe(item.noreg)
    item.status = 'done'
  } catch (e) {
    item.status = 'error'
    item.error = e.message
  } finally {
    const settled = batchLog.value.filter(
      (x) => x.status !== 'waiting' && x.status !== 'processing',
    ).length
    batchProgress.value = Math.round((settled / batchLog.value.length) * 100)
    isBatchExporting.value = false
  }
}

// --- Data ---
const medicalData = ref([])
const selectedNoreg = ref(null)
// --- Column Visibility ---
const showColumnMenu = ref(false)
const visibleColumns = ref([
  'STTS_CODER',
  'NOPENDAFTARAN',
  'NOMR',
  'NAMAPASIEN',
  'USIA',
  'JENISKELAMIN',
  'NOSEP',
  'CARABAYAR',
  'POLI',
  'NAMADOKTER',
  'DIAGNOSA_AWAL',
  'CODE',
  'KETERANGAN',
  'TARIFCBG',
  'DISETUJUI',
  'SELISIH',
  'PERSENTASE_SELISIH',
  'SUDAHFINALCLAIM',
  'MASUKPOLY',
  'KELUARPOLY_NULL',
  'IS_AKTIF_SEP',
  'NOTELP',
  'OBATAN',
])

const allColumns = ref([
  { field: 'STTS_CODER', header: 'Status' },
  { field: 'NOPENDAFTARAN', header: 'No Registrasi' },
  { field: 'NOMR', header: 'No MR' },
  { field: 'NAMAPASIEN', header: 'Nama Pasien' },
  { field: 'USIA', header: 'Usia' },
  { field: 'JENISKELAMIN', header: 'Jenis Kelamin' },
  { field: 'NOSEP', header: 'No SEP' },
  { field: 'CARABAYAR', header: 'Cara Bayar' },
  { field: 'POLI', header: 'Poli' },
  { field: 'NAMADOKTER', header: 'Dokter' },
  { field: 'DIAGNOSA_AWAL', header: 'Diagnosa Awal' },
  { field: 'CODE', header: 'Code' },
  { field: 'KETERANGAN', header: 'Keterangan' },
  { field: 'TARIFCBG', header: 'Klaim Diajukan' },
  { field: 'OBATAN', header: 'Obatan' },
  { field: 'DISETUJUI', header: 'Klaim Disetujui' },
  { field: 'SELISIH', header: 'Selisih' },
  { field: 'PERSENTASE_SELISIH', header: '% Selisih' },
  { field: 'SUDAHFINALCLAIM', header: 'Final Claim' },
  { field: 'MASUKPOLY', header: 'Tgl Masuk' },
  { field: 'NOTELP', header: 'No Telp' },
  { field: 'KELUARPOLY_NULL', header: 'Tgl Pulang' },
  { field: 'IS_AKTIF_SEP', header: 'SEP Aktif' },
])
// --- Filters ---
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  NOMR: { value: null, matchMode: FilterMatchMode.CONTAINS },
  STTS_CODER: { value: null, matchMode: FilterMatchMode.IN },
  NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
  POLI: { value: null, matchMode: FilterMatchMode.IN },
  NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
  KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
  SUDAHFINALCLAIM: { value: null, matchMode: FilterMatchMode.IN },
  NOSEP: { value: null, matchMode: FilterMatchMode.CONTAINS },
  TARIFCBG: { value: null, matchMode: FilterMatchMode.IN },
  IS_AKTIF_SEP: { value: null, matchMode: FilterMatchMode.IN },
})

// Summary reactive
const filteredCount = ref(0)
const totalTarifCBG = ref(0)
const disetujuiBPJS = ref(0)
const TempfilteredData = ref([])

const showKlaim = ref(false)
const showKlaimEntri = ref(false)
const DataSelected = ref(null)
const sttsCoderFilter = ref(null) // null=Semua, 0=M, 1=C, 2=P

const sttsCoderOpts = [
  { label: 'Semua', value: null, icon: 'pi pi-list', cls: 'secondary' },
  { label: 'M', value: 0, icon: 'pi pi-times-circle', cls: 'danger' },
  { label: 'C', value: 1, icon: 'pi pi-check-circle', cls: 'success' },
  { label: 'P', value: 2, icon: 'pi pi-exclamation-circle', cls: 'warning' },
  { label: 'S', value: 3, icon: 'pi pi-comment', cls: 'info' },
]

// --- Helper Functions ---

const onKlaimSaved = (data) => {
  if (!data?.noregister) return
  const row = medicalData.value.find((r) => r.NOPENDAFTARAN === data.noregister)
  if (row && data.stts_coder !== undefined) {
    row.STTS_CODER = data.stts_coder
  }
  const label =
    data.stts_coder === 1
      ? 'Lengkap (C)'
      : data.stts_coder === 2
        ? 'Perbaikan (P)'
        : String(data.stts_coder)
  toast.add({
    severity: 'success',
    summary: 'Klaim Tersimpan',
    detail: `Status diperbarui → ${label}`,
    life: 4000,
  })
}
const ShowDetailsdata = (row) => {
  selectedNoreg.value = row
  if (group_user.value === 'ENTRI_KLAIM') {
    showKlaimEntri.value = true
  } else {
    showKlaim.value = true
  }
}

// --- Computed Properties untuk Analisis ---
const filteredByStts = computed(() => {
  if (sttsCoderFilter.value === null) return medicalData.value
  return medicalData.value.filter((r) => r.STTS_CODER == sttsCoderFilter.value)
})

const sttsCoderCount = computed(() => ({
  null: medicalData.value.length,
  0: medicalData.value.filter((r) => r.STTS_CODER == 0).length,
  1: medicalData.value.filter((r) => r.STTS_CODER == 1).length,
  2: medicalData.value.filter((r) => r.STTS_CODER == 2).length,
  3: medicalData.value.filter((r) => r.STTS_CODER == 3).length,
}))

const selisihKlaim = computed(() => {
  return totalTarifCBG.value - disetujuiBPJS.value
})

const persentaseSelisih = computed(() => {
  if (totalTarifCBG.value === 0) return 0
  return ((selisihKlaim.value / totalTarifCBG.value) * 100).toFixed(2)
})

const persentasePersetujuan = computed(() => {
  if (totalTarifCBG.value === 0) return 0
  return ((disetujuiBPJS.value / totalTarifCBG.value) * 100).toFixed(2)
})

const rataRataSelisih = computed(() => {
  if (filteredCount.value === 0) return 0
  return selisihKlaim.value / filteredCount.value
})

const jumlahTidakDiajukan = computed(() => {
  const data =
    TempfilteredData.value && TempfilteredData.value.length
      ? TempfilteredData.value
      : medicalData.value
  return data.filter((item) => parseFloat(item.TARIFCBG) === 0).length
})

const persentaseTidakDiajukan = computed(() => {
  if (filteredCount.value === 0) return 0
  return ((jumlahTidakDiajukan.value / filteredCount.value) * 100).toFixed(2)
})

// --- Helper Functions ---
const isColumnVisible = (fieldName) => {
  return visibleColumns.value.includes(fieldName)
}

const toggleColumnMenu = () => {
  showColumnMenu.value = !showColumnMenu.value
}

const selectAllColumns = () => {
  visibleColumns.value = allColumns.value.map((col) => col.field)
}

const deselectAllColumns = () => {
  visibleColumns.value = []
}

const calculateSelisih = (data) => {
  return (parseFloat(data.TARIFCBG) || 0) - (parseFloat(data.DISETUJUI) || 0)
}
// --- Options ---
const caraBayarSelected = ref('BPJS')
const caraBayarOptions = ['BPJS', 'SEMUA']
const caraBayarFilterOptions = ref([])
const noSEP = ref([])
const poliOptions = ref([])
const dokterOptions = ref([])
const deskripsi = ref([])
const sudahFilanClaim = ref([])
const KetaranganOpt = ref([])
const tarifCbgOptions = ref([])
const isAktifSEP = ref([])
const sttsCoderFilterOptions = ref([
  { label: 'M', value: 0 },
  { label: 'C', value: 1 },
  { label: 'P', value: 2 },
])

const calculatePersentaseSelisih = (data) => {
  const tarifCBG = parseFloat(data.TARIFCBG) || 0
  if (tarifCBG === 0) return 0
  const selisih = calculateSelisih(data)
  return ((selisih / tarifCBG) * 100).toFixed(2)
}

const printResumePasien = (data) => {
  const routeData = router.resolve({
    name: 'ResumeRanapView',
    query: { noreg: data.NOPENDAFTARAN },
  })
  window.open(routeData.href, '_blank')
}

const statusLabel = (code) => {
  switch (code) {
    case '0':
      return 'M'
    case '1':
      return 'C'
    case '2':
      return 'R'
    default:
      return 'Unknown'
  }
}

const statusColor = (code) => {
  switch (code) {
    case '0':
      return 'warn'
    case '1':
      return 'success'
    case '2':
      return 'info'
    default:
      return 'secondary'
  }
}

const updateFilterOptions = () => {
  caraBayarFilterOptions.value = getUniqueValues('CARABAYAR')
  poliOptions.value = getUniqueValues('POLI')
  dokterOptions.value = getUniqueValues('NAMADOKTER')
  deskripsi.value = getUniqueValues('DESKRIPSI')
  sudahFilanClaim.value = getUniqueValues('SUDAHFINALCLAIM')
  KetaranganOpt.value = getUniqueValues('KETERANGAN')
  noSEP.value = getUniqueValues('NOSEP')
  tarifCbgOptions.value = getUniqueValues('TARIFCBG')
  isAktifSEP.value = getUniqueValues('IS_AKTIF_SEP')
}

const toggleColumn = (fieldName) => {
  const index = visibleColumns.value.indexOf(fieldName)
  if (index > -1) {
    visibleColumns.value.splice(index, 1)
  } else {
    visibleColumns.value.push(fieldName)
  }
  saveColumnPreference()
}

const saveColumnPreference = () => {
  try {
    localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns.value))
  } catch (error) {
    console.error('Error saving column preference:', error)
  }
}

const loadColumnPreference = () => {
  try {
    const saved = localStorage.getItem('visibleColumns')
    if (saved) {
      visibleColumns.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading column preference:', error)
  }
}

const FILTER_STORAGE_KEY = 'klaimManajemen_filterParams'
const COLUMN_FILTER_STORAGE_KEY = 'klaimManajemen_columnFilters'
const COLUMN_WIDTH_KEY = 'klaimManajemen_colWidths'
const dtRef = ref(null)

const saveColumnWidths = (event) => {
  try {
    const thead = event.element.closest('thead')
    if (!thead) return
    const widths = Array.from(thead.querySelectorAll('th')).map((th) => th.style.width || '')
    localStorage.setItem(COLUMN_WIDTH_KEY, JSON.stringify(widths))
  } catch (e) {
    console.error('Error saving column widths:', e)
  }
}

const restoreColumnWidths = async () => {
  try {
    const saved = localStorage.getItem(COLUMN_WIDTH_KEY)
    if (!saved) return
    const widths = JSON.parse(saved)
    if (!Array.isArray(widths) || widths.length === 0) return
    await nextTick()
    const el = dtRef.value?.$el
    if (!el) return
    const ths = el.querySelectorAll('thead th')
    ths.forEach((th, i) => {
      if (widths[i]) th.style.width = widths[i]
    })
  } catch (e) {
    console.error('Error restoring column widths:', e)
  }
}

const saveColumnFilters = () => {
  try {
    localStorage.setItem(
      COLUMN_FILTER_STORAGE_KEY,
      JSON.stringify({
        filters: filters.value,
        sttsCoderFilter: sttsCoderFilter.value,
      }),
    )
  } catch (e) {
    console.error('Error saving column filters:', e)
  }
}

const loadColumnFilters = () => {
  try {
    const saved = localStorage.getItem(COLUMN_FILTER_STORAGE_KEY)
    if (!saved) return
    const parsed = JSON.parse(saved)
    if (parsed.filters) {
      Object.keys(parsed.filters).forEach((key) => {
        if (filters.value[key] !== undefined) {
          filters.value[key].value = parsed.filters[key].value
        }
      })
    }
    if (parsed.sttsCoderFilter !== undefined) {
      sttsCoderFilter.value = parsed.sttsCoderFilter
    }
  } catch (e) {
    console.error('Error loading column filters:', e)
  }
}

const saveFilterParams = () => {
  try {
    const params = {
      startDate: startDate.value ? startDate.value.toISOString() : null,
      endDate: endDate.value ? endDate.value.toISOString() : null,
      jenisRawatSelected: jenisRawatSelected.value,
      sttsPulangSelected: sttsPulangSelected.value,
      caraBayarSelected: caraBayarSelected.value,
    }
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(params))
  } catch (error) {
    console.error('Error saving filter params:', error)
  }
}

const loadFilterParams = () => {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY)
    if (!saved) return
    const params = JSON.parse(saved)
    if (params.startDate) startDate.value = new Date(params.startDate)
    if (params.endDate) endDate.value = new Date(params.endDate)
    if (params.jenisRawatSelected) jenisRawatSelected.value = params.jenisRawatSelected
    if (params.sttsPulangSelected) sttsPulangSelected.value = params.sttsPulangSelected
    if (params.caraBayarSelected) caraBayarSelected.value = params.caraBayarSelected
  } catch (error) {
    console.error('Error loading filter params:', error)
  }
}

// const getUniqueValues = (field) => {
//   return [...new Set(medicalData.value.map((item) => item[field]))]
//     .filter((val) => val != null)
//     .sort((a, b) => {
//       if (!isNaN(a) && !isNaN(b)) {
//         return Number(a) - Number(b)
//       }
//       return a.toString().localeCompare(b.toString())
//     })
// }

const getUniqueValues = (field) => {
  return [...new Set(medicalData.value.map((item) => item[field]))].sort((a, b) => {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1

    if (!isNaN(a) && !isNaN(b)) {
      return Number(a) - Number(b)
    }
    return String(a).localeCompare(String(b))
  })
}

const formatCurrency = (value) => {
  if (value == null || value === '') return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(value)
}

const updateSummary = () => {
  const data =
    TempfilteredData.value && TempfilteredData.value.length
      ? TempfilteredData.value
      : medicalData.value

  filteredCount.value = data.length
  totalTarifCBG.value = data.reduce((acc, item) => acc + (parseFloat(item.TARIFCBG) || 0), 0)
  disetujuiBPJS.value = data.reduce((acc, item) => acc + (parseFloat(item.DISETUJUI) || 0), 0)
}

const onFilter = (event) => {
  TempfilteredData.value = event.filteredValue || []
  updateSummary()
  saveColumnFilters()
}

const clearFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    NOMR: { value: null, matchMode: FilterMatchMode.CONTAINS },
    STTS_CODER: { value: null, matchMode: FilterMatchMode.IN },
    NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
    POLI: { value: null, matchMode: FilterMatchMode.IN },
    NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
    KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
    SUDAHFINALCLAIM: { value: null, matchMode: FilterMatchMode.IN },
    NOSEP: { value: null, matchMode: FilterMatchMode.CONTAINS },
    TARIFCBG: { value: null, matchMode: FilterMatchMode.IN },
    IS_AKTIF_SEP: { value: null, matchMode: FilterMatchMode.IN },
  }
  sttsCoderFilter.value = null
  localStorage.removeItem(COLUMN_FILTER_STORAGE_KEY)
}

const exportToExcel = () => {
  import('xlsx').then((xlsx) => {
    const exportData = TempfilteredData.value.map((item) => ({
      ...item,
      SELISIH: calculateSelisih(item),
      PERSENTASE_SELISIH: calculatePersentaseSelisih(item),
    }))
    const worksheet = xlsx.utils.json_to_sheet(exportData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Klaim')
    xlsx.writeFile(workbook, 'Data_Klaim_Analisis.xlsx')
  })
}

onMounted(() => {
  loadColumnPreference()
  loadFilterParams()
  loadColumnFilters()
  restoreColumnWidths()
})

const sttsPulangSelected = ref({
  caption: 'SUDAH PULANG',
  code: 1,
})

const sttsPulangOpts = ref([
  {
    caption: 'SUDAH PULANG',
    code: 1,
  },
  {
    caption: 'SEDANG RAWAT',
    code: 2,
  },
  {
    caption: 'ALL',
    code: 3,
  },
])

const jenisRawatSelected = ref({
  code: '2',
  caption: 'JALAN',
})

const jenis_rawat = ref([
  {
    code: '1',
    caption: 'INAP',
  },
  {
    code: '2',
    caption: 'JALAN',
  },
])

watch(
  [startDate, endDate, jenisRawatSelected, sttsPulangSelected, caraBayarSelected],
  saveFilterParams,
  { deep: true },
)

watch(sttsCoderFilter, saveColumnFilters)

// Toast functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'An error occurred') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Warning',
    detail: message,
    life: 4000,
  })
}

const fact = ref([])
const loadingSync = ref(false)

const syncDataBPJS = async () => {
  try {
    const payload = {
      id_client: id_client.value,
      startDate: formatDateOnlyForAPI(startDate.value),
      endDate: formatDateOnlyForAPI(endDate.value),
      stts_klaim: 3,
      jenis_rawat: jenisRawatSelected.value.code,
    }

    loadingSync.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/klaim_monitoring`, payload)

    loadingSync.value = false
    fetchData()
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal mengambil data: ' + error.message)
    loadingSync.value = false
  }
}

const loadingCheckSEP = ref(false)
const progress = ref(0)

const nosepSedanSign = ref(0)
const loopPengecheckanSEP = async () => {
  loadingCheckSEP.value = true
  ShowProgressCheckSEP.value = true
  listRespons.value = []
  progress.value = 0

  await nextTick()

  const total = TempfilteredData.value.length
  let done = 0

  for (const element of TempfilteredData.value) {
    nosepSedanSign.value = element.NOSEP
    await checkSEPAktif(element.NOSEP)

    done++
    progress.value = Math.round((done / total) * 100)
  }

  loadingCheckSEP.value = false
  nosepSedanSign.value = null
  // Dialog dibiarkan terbuka agar user bisa melihat hasil
}

const listRespons = ref([])
const checkSEPAktif = async (nosep) => {
  try {
    const payload = {
      id_client: id_client.value,
      nosep: nosep,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/check_stts_sep_aktif`,
      payload,
    )

    listRespons.value.push(response.data)
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

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

const fetchData = async () => {
  try {
    const payload = {
      id_client: id_client.value,
      tglawal: formatDateOnlyForAPI(startDate.value),
      tglakhir: formatDateOnlyForAPI(endDate.value),
      kodeunit: '',
      jenisrawat: jenisRawatSelected.value.caption,
      mod: 'history2',
      bulan_tahun: '',
      status_pulang: sttsPulangSelected.value.caption,
      cara_bayar: caraBayarSelected.value,
    }

    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_rincian_klaimv2/`,
      payload,
    )

    if (response.data.metadata.code == 200) {
      medicalData.value = response.data.response.map((item) => ({
        ...item,
        STTS_CODER:
          item.STTS_CODER === null || item.STTS_CODER === undefined || item.STTS_CODER === ''
            ? null
            : Number(item.STTS_CODER),
      }))
      updateFilterOptions()
      showSuccess(`Data berhasil dimuat: ${medicalData.value.length} records`)
    } else {
      medicalData.value = []
      showWarning('Tidak ada data ditemukan')
    }

    fact.value = [...response.data.response]
    loading.value = false
    restoreColumnWidths()
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal mengambil data: ' + error.message)
    loading.value = false
  }
}

const list_const_monitoring = ref([])

const get_cost_monitoring = async () => {
  try {
    const payload = {
      id_client: id_client.value,
      startdate: formatDateOnlyForAPI(startDate.value),
      enddate: formatDateOnlyForAPI(endDate.value),
      mode: 1,
      jenisrawat: jenisRawatSelected.value.caption,
    }

    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/cost_pasien_monitoring/`,
      payload,
    )

    console.log(response.data)
    if (response.data.metadata.code == 200) {
      //medicalData.value = []
      list_const_monitoring.value = response.data.response
      // Assign ke medicalData

      const costMap = new Map()

      list_const_monitoring.value.forEach((cost) => {
        costMap.set(cost.NOREGISTER, cost.OBATAN)
      })

      // Assign ke medicalData
      medicalData.value.forEach((element) => {
        if (costMap.has(element.NOPENDAFTARAN)) {
          element.OBATAN = costMap.get(element.NOPENDAFTARAN)
        }
      })
      //updateFilterOptions()
      showSuccess(`Data berhasil dimuat: ${list_const_monitoring.value.length} records`)
    } else {
      medicalData.value = []
      showWarning('Tidak ada data ditemukan')
    }

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
    showError('Gagal mengambil data: ' + error.message)
    loading.value = false
  }
}

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
</script>

<style scoped>
/* ── Card Header ──────────────────────────────────────────────────── */
.card-header {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-bottom: none;
  padding: 8px 14px;
}
.card-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
}

/* ── Filter label ─────────────────────────────────────────────────── */
.filter-label {
  font-size: 10px;
  font-weight: 700;
  color: #4a7ab5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 2px;
}
.filter-label i {
  margin-right: 3px;
}

/* ── Toolbar ──────────────────────────────────────────────────────── */
.tbl-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 0 12px;
  border-bottom: 1px solid #dde5ee;
  margin-bottom: 12px;
}
.tbl-filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tbl-filter-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #4a7ab5;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.tbl-stts-pills {
  display: flex;
  border: 1px solid #b2c8dd;
  border-radius: 6px;
  overflow: hidden;
}
.tbl-stts-pill {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: #fff;
  color: #5a7a9a;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;
  border-right: 1px solid #b2c8dd;
}
.tbl-stts-pill:last-child {
  border-right: none;
}
.tbl-stts-pill:hover {
  background: #f0f5fc;
}
.tbl-stts-count {
  background: rgba(26, 58, 95, 0.1);
  border-radius: 999px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
  line-height: 16px;
}
.tbl-stts-pill-secondary.active {
  background: #dde8f4;
  color: #162d4e;
}
.tbl-stts-pill-danger.active {
  background: #fde8e8;
  color: #a03030;
}
.tbl-stts-pill-success.active {
  background: #e0f2e9;
  color: #2a6a40;
}
.tbl-stts-pill-warning.active {
  background: #fef5dc;
  color: #7a5a10;
}
.tbl-stts-pill-info.active {
  background: #dbeafe;
  color: #1d4ed8;
}
.tbl-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* ── Summary strip ────────────────────────────────────────────────── */
.summary-strip {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 6px 0 8px;
  margin-bottom: 8px;
}
.summary-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  flex: 1;
  min-width: 120px;
  white-space: nowrap;
  border: 1px solid transparent;
}
.summary-chip-icon {
  font-size: 14px;
  opacity: 0.7;
  flex-shrink: 0;
}
.summary-chip-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.summary-chip-lbl {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.2;
}
.summary-chip-val {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}
.summary-chip-val small {
  font-size: 10px;
  font-weight: 500;
  opacity: 0.75;
  margin-left: 3px;
}

/* Gradient chips — mengikuti tema navy/slate */
.gradient-primary {
  background: linear-gradient(135deg, #dde8f4, #edf3fa);
  border-color: #b2c8dd;
  color: #162d4e;
}
.gradient-info {
  background: linear-gradient(135deg, #d6e8f8, #e8f2fd);
  border-color: #9fbfdf;
  color: #1a3a5f;
}
.gradient-success {
  background: linear-gradient(135deg, #daf0e6, #edf8f2);
  border-color: #9ecfb8;
  color: #1e5c38;
}
.gradient-warning {
  background: linear-gradient(135deg, #fef0c8, #fef8e4);
  border-color: #e8c96a;
  color: #6a4a08;
}
.gradient-danger {
  background: linear-gradient(135deg, #fde0e0, #fdeeed);
  border-color: #e8a0a0;
  color: #8a2020;
}
.gradient-secondary {
  background: linear-gradient(135deg, #e8edf5, #f2f5fa);
  border-color: #b8c8dc;
  color: #2d4a6a;
}
.gradient-light {
  background: linear-gradient(135deg, #f5f8fc, #fafcff);
  border-color: #ccdaeb;
  color: #3a5070;
}

/* ── Round button ─────────────────────────────────────────────────── */
.round-button2 {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* ── DataTable ────────────────────────────────────────────────────── */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 1rem;
  background: #e6edf7;
  color: #162d4e;
}

/* ── Status cell ──────────────────────────────────────────────────── */
.status-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  width: 100%;
  padding: 0.35rem 0.5rem;
  border-radius: 0.1rem;
  text-transform: uppercase;
  font-weight: 700;
}
.status-cell-success {
  background: #dff0e8;
  color: #1e5c38;
}
.status-cell-warning {
  background: #fef5dc;
  color: #7a5a10;
}
.status-cell-danger {
  background: #fde8e8;
  color: #8a2020;
}
.status-cell-info {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-info {
  background-color: #1d4ed8 !important;
  color: #fff !important;
}

/* ── Column menu ──────────────────────────────────────────────────── */
.column-menu {
  border: 1px solid #b2c8dd;
  border-radius: 6px;
  background: #f7fafd;
  padding: 10px 12px;
}
.column-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dde8f4;
}
.column-menu-header h6 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: #1a3a5f;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.column-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-bottom: 8px;
}
.column-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #3a5070;
}
.column-item :deep(.p-checkbox) {
  margin-top: 0.25rem;
}
.column-menu-footer {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #dde8f4;
  justify-content: flex-end;
}
.column-menu-footer :deep(.p-button) {
  font-size: 0.875rem;
}

/* ── Batch Export Dialog ──────────────────────────────────────────── */
.batch-folder-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  margin-bottom: 10px;
}
.batch-folder-info {
  background: #fefce8;
  border-color: #fde68a;
}

/* ── Quality selector ── */
.batch-quality-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  margin-bottom: 10px;
}
.batch-quality-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
}
.batch-quality-seg {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}
.batch-qbtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 16px;
  background: #fff;
  border: none;
  border-right: 1px solid #d1d5db;
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1.2;
}
.batch-qbtn:last-child {
  border-right: none;
}
.batch-qbtn:hover {
  background: #f3f4f6;
}
.batch-qbtn.active {
  background: #dbeafe;
}
.bqbtn-label {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
}
.batch-qbtn.active .bqbtn-label {
  color: #1d4ed8;
}
.bqbtn-size {
  font-size: 10px;
  color: #6b7280;
  font-weight: 400;
}
.batch-qbtn.active .bqbtn-size {
  color: #3b82f6;
}
.batch-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  background: #f0f6ff;
  border: 1px solid #b2c8f0;
  border-radius: 8px;
  margin-bottom: 4px;
}
.batch-log-scroll {
  max-height: 340px;
  overflow-y: auto;
  border: 1px solid #e0e6ed;
  border-radius: 6px;
}
.batch-log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid #f0f4f8;
  font-size: 12px;
}
.batch-log-item:last-child {
  border-bottom: none;
}
.batch-log-waiting {
  color: #888;
  background: #fafafa;
}
.batch-log-processing {
  color: #1565c0;
  background: #e8f0fe;
}
.batch-log-done {
  color: #2e7d32;
  background: #f0fdf4;
}
.batch-log-skipped {
  color: #92400e;
  background: #fffbeb;
  opacity: 0.8;
}
.batch-log-error {
  color: #c62828;
  background: #fff0f0;
}
.batch-log-idx {
  min-width: 24px;
  font-weight: 700;
  opacity: 0.6;
}
.batch-log-icon {
  font-size: 13px;
  flex-shrink: 0;
}
.batch-log-name {
  flex: 1;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.batch-log-noreg {
  font-size: 10px;
  color: #888;
  white-space: nowrap;
}
.batch-log-err {
  font-size: 10px;
  color: #c62828;
  margin-left: 4px;
  flex: 1;
}
.batch-resume-btn {
  flex-shrink: 0;
  margin-left: 6px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.batch-resume-btn:hover {
  background: #fde68a;
}

/* ── Progress table ───────────────────────────────────────────────── */
.table-progress {
  width: 100%;
  border-collapse: collapse;
}
.table-progress th {
  background: #e6edf7;
  color: #162d4e;
  border: 1px solid #b2c8dd;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
}
.table-progress td {
  border: 1px solid #dde5ee;
  padding: 5px 10px;
  font-size: 12px;
}
</style>
