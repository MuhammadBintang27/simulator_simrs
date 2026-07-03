<template>
  <div class="content">
    <div class="card">
      <div class="card-header">
        <h4><i class="fas fa-bed mr-2"></i> Monitoring pasien DPJP</h4>
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

          <!-- Status Pulang -->
          <div class="col-md-2">
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
          <div class="col-md-2">
            <label class="filter-label">
              <i class="fas fa-credit-card"></i>
              CARA BAYAR
            </label>
            <br />
            <Select
              v-model="caraBayarSelected"
              :options="caraBayarOptions"
              placeholder="Pilih Cara Bayar"
              class="p-column-filter mt-0 w-100"
            />
          </div>

          <!-- DPJP -->
          <div class="col-md-2">
            <label class="filter-label">
              <i class="fas fa-user-md"></i>
              DPJP
            </label>
            <br />
            <Select
              v-model="dpjpSelected"
              :options="dpjpOptions"
              placeholder="Semua Dokter"
              class="p-column-filter mt-0 w-100"
              filter
              showClear
            />
          </div>

          <!-- Tombol Cari -->
          <div class="col-md-1">
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
        </div>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="summary-strip">
      <div class="summary-chip gradient-primary">
        <i class="fas fa-list summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Total Pasien</span>
          <span class="summary-chip-val">{{ filteredCount }}</span>
        </div>
      </div>
      <div class="summary-chip gradient-success">
        <i class="fas fa-check-double summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">RM Final (DPJP)</span>
          <span class="summary-chip-val">{{ sttsCoderCount['1'] }}</span>
        </div>
      </div>
      <div class="summary-chip gradient-warning">
        <i class="fas fa-exclamation-circle summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Perlu Perbaikan</span>
          <span class="summary-chip-val">{{ sttsCoderCount['2'] }}</span>
        </div>
      </div>
      <div class="summary-chip gradient-danger">
        <i class="fas fa-times-circle summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Belum Lengkap</span>
          <span class="summary-chip-val">{{ sttsCoderCount['0'] }}</span>
        </div>
      </div>
      <div class="summary-chip gradient-info">
        <i class="fas fa-exclamation-triangle summary-chip-icon"></i>
        <div class="summary-chip-body">
          <span class="summary-chip-lbl">Belum Diajukan</span>
          <span class="summary-chip-val">{{ jumlahTidakDiajukan }}</span>
        </div>
      </div>
    </div>

    <!-- KONSULTASI NOTIFICATION BANNER -->

    <div v-if="konsulNotifStore.total > 0" class="konsul-banner">
      <div
        v-if="konsulNotifStore.unreadMasuk > 0"
        class="konsul-banner-item konsul-banner-masuk"
        @click="openJawabKonsul"
      >
        <div class="konsul-banner-icon">
          <i class="pi pi-bell" />
          <span class="konsul-banner-count">{{ konsulNotifStore.unreadMasuk }}</span>
        </div>
        <div class="konsul-banner-text">
          <span class="konsul-banner-title">Permintaan Konsultasi Masuk</span>
          <span class="konsul-banner-sub">
            {{ konsulNotifStore.unreadMasuk }} konsultasi belum dijawab — klik untuk membuka
          </span>
        </div>
        <i class="pi pi-arrow-right konsul-banner-arrow" />
      </div>

      <div
        v-if="konsulNotifStore.unreadTerkirim > 0"
        class="konsul-banner-item konsul-banner-terkirim"
        @click="openJawabKonsul"
      >
        <div class="konsul-banner-icon">
          <i class="pi pi-reply" />
          <span class="konsul-banner-count">{{ konsulNotifStore.unreadTerkirim }}</span>
        </div>
        <div class="konsul-banner-text">
          <span class="konsul-banner-title">Balasan Konsultasi Baru</span>
          <span class="konsul-banner-sub">
            {{ konsulNotifStore.unreadTerkirim }} konsultasi yang Anda kirim sudah dibalas — klik
            untuk melihat
          </span>
        </div>
        <i class="pi pi-arrow-right konsul-banner-arrow" />
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="card">
      <div class="card-body">
        <!-- Toolbar -->
        <div class="tbl-toolbar">
          <div class="tbl-filter-group">
            <span class="tbl-filter-lbl">Status RM DPJP</span>
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
            <div class="konsul-notif-wrap">
              <Button
                icon="pi pi-comments"
                label="Jawab Konsultasi"
                size="small"
                severity="warn"
                v-tooltip.top="konsulTooltip"
                @click="openJawabKonsul"
              />
              <span
                v-if="konsulNotifStore.total > 0"
                class="konsul-notif-badge"
                :class="konsulBadgeClass"
              >
                {{ konsulNotifStore.total > 99 ? '99+' : konsulNotifStore.total }}
              </span>
            </div>
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
          v-model:filters="filters"
          v-model:expandedRows="expandedRows"
          :value="filteredByStts"
          dataKey="NOPENDAFTARAN"
          striped-rows
          showGridlines
          paginator
          rowHover
          responsiveLayout="scroll"
          :rows="25"
          :rowsPerPageOptions="[5, 10, 20, 25, 50, 100]"
          @filter="onFilter"
          @rowExpand="onRowExpand"
          @rowCollapse="onRowCollapse"
          tableStyle="min-width: 50rem"
          filterDisplay="row"
          class="p-datatable-sm"
          scrollable
          scrollHeight="1000px"
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
          <!-- Expansion slot -->
          <template #expansion="{ data }">
            <div class="exp-wrap">
              <!-- Kolom kiri: tombol rekam medis tersusun vertikal -->
              <div class="exp-action-col">
                <span class="exp-action-title">
                  <i class="fas fa-folder-open mr-1"></i> Rekam Medis
                </span>
                <Button
                  label="Kajian Awal DPJP"
                  icon="fas fa-stethoscope"
                  size="small"
                  severity="info"
                  class="exp-btn"
                  @click="openKajianAwal(data.NOPENDAFTARAN)"
                />
                <Button
                  label="CPPT / SOAP"
                  icon="fas fa-file-medical-alt"
                  size="small"
                  severity="success"
                  class="exp-btn"
                  @click="openCPPT(data.NOPENDAFTARAN)"
                />
                <Button
                  label="Diagnosa Akhir"
                  icon="fas fa-file-medical-alt"
                  size="small"
                  severity="warn"
                  class="exp-btn"
                  @click="openDiagnosaAkhir(data.NOPENDAFTARAN)"
                />
                <Button
                  label="Siriraj Score"
                  icon="fas fa-brain"
                  size="small"
                  severity="secondary"
                  class="exp-btn"
                  @click="openSiriraj(data.NOPENDAFTARAN)"
                />
                <Button
                  label="Rekam Medis EL"
                  icon="pi pi-file-pdf"
                  size="small"
                  severity="info"
                  class="exp-btn"
                  outlined
                  @click="PrintRekamMedisEl(data.NOPENDAFTARAN)"
                />
                <Button
                  label="Konsultasi"
                  icon="pi pi-comments"
                  size="small"
                  severity="warn"
                  class="exp-btn"
                  @click="openKonsultasi(data)"
                />
              </div>

              <!-- Divider vertikal -->
              <div class="exp-divider" />

              <!-- Kolom kanan: info pasien -->
              <div class="exp-info-col">
                <div class="exp-info-name">
                  <i
                    :class="data.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                    :style="{
                      color: data.JENISKELAMIN === 'P' ? '#f472b6' : '#60a5fa',
                      marginRight: '4px',
                    }"
                  />
                  <strong>{{ data.NAMAPASIEN }}</strong>
                </div>
                <div class="exp-info-grid">
                  <span class="exp-info-lbl">No. Register</span>
                  <span class="exp-info-val">{{ data.NOPENDAFTARAN }}</span>
                  <span class="exp-info-lbl">Ruangan</span>
                  <span class="exp-info-val">{{ data.POLI }}</span>
                  <span class="exp-info-lbl">DPJP</span>
                  <span class="exp-info-val">{{ data.NAMADOKTER }}</span>
                  <span class="exp-info-lbl">Cara Bayar</span>
                  <span class="exp-info-val">{{ data.CARABAYAR }}</span>
                  <span class="exp-info-lbl">Tgl Masuk</span>
                  <span class="exp-info-val">{{ data.MASUKPOLY }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Expander column -->
          <Column expander style="width: 3rem" frozen />

          <!-- No. Baris -->
          <Column header="No" style="width: 2.5rem; text-align: center" frozen>
            <template #body="{ index }">
              <span style="font-size: 0.68rem; color: #64748b; font-weight: 600">{{
                index + 1
              }}</span>
            </template>
          </Column>

          <Column v-if="isColumnVisible('NOMR')" field="NOMR" header="NOMR" sortable />

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
          >
            <template #filter="{ filterModel, filterCallback }">
              <InputText
                v-model="filterModel.value"
                @input="filterCallback()"
                placeholder="Cari No SEP..."
                class="p-column-filter"
              />
            </template>
          </Column>

          <Column field="STTS_RM_DPJP" header="RM DPJP" sortable>
            <template #body="{ data }">
              <span
                class="status-cell status-cell-clickable"
                :class="{
                  'status-cell-success': data.STTS_RM_DPJP == 1,
                  'status-cell-warning': data.STTS_RM_DPJP == 2,
                  'status-cell-danger': data.STTS_RM_DPJP == 0 || data.STTS_RM_DPJP == null,
                }"
                v-tooltip.top="'Klik untuk ubah status RM DPJP'"
                @click="openSttsDialog(data)"
              >
                <small v-if="data.STTS_RM_DPJP == 1" class="badge badge-success">
                  <i class="pi pi-check" />
                </small>
                <small v-else-if="data.STTS_RM_DPJP == 2" class="badge badge-warning">
                  <i class="pi pi-exclamation-circle" />
                </small>
                <small v-else class="badge badge-danger">
                  <i class="pi pi-times" />
                </small>
                <i class="pi pi-pencil status-edit-icon" />
              </span>
            </template>
          </Column>

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
            header="Ruangan"
            style="min-width: 10rem"
            sortable
          >
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                :maxSelectedLabels="2"
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="poliOptions"
                placeholder="Pilih Ruangan"
                filter
                class="p-column-filter"
                showClear
              />
            </template>
          </Column>

          <Column field="NAMADOKTER" header="Dokter" style="min-width: 15rem" sortable> </Column>

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
                placeholder="Stts SEP"
                class="p-column-filter"
                filter
                showClear
              />
            </template>
          </Column>

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

  <!-- Dialog Cek SEP -->
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

  <!-- ===== DIALOG UBAH STATUS RM DPJP ===== -->
  <Dialog
    v-model:visible="showSttsDialog"
    header="Ubah Status Rekam Medis DPJP"
    :style="{ width: '420px' }"
    :modal="true"
  >
    <div v-if="sttsDialogRow" class="p-3">
      <div class="mb-3">
        <strong>{{ sttsDialogRow.NAMAPASIEN }}</strong>
        <div class="text-muted" style="font-size: 0.78rem">
          {{ sttsDialogRow.NOPENDAFTARAN }} · {{ sttsDialogRow.POLI }}
        </div>
      </div>

      <div v-if="sttsDialogRow.STTS_RM_DPJP == 2" class="stts-perbaikan-info mb-3">
        <i class="pi pi-info-circle mr-1"></i>
        Status <strong>Perbaikan</strong> ditetapkan oleh Coder. DPJP hanya dapat mengubah ke
        <strong>Belum Lengkap</strong> atau <strong>Lengkap / Final</strong>.
      </div>

      <div class="stts-option-list">
        <button
          v-for="opt in sttsRmOpts"
          :key="opt.value"
          class="stts-option-btn"
          :class="[`stts-opt-${opt.cls}`, { 'stts-opt-active': sttsDialogSelected === opt.value }]"
          :disabled="savingStts"
          @click="selectAndSave(opt.value)"
        >
          <i
            v-if="savingStts && sttsDialogSelected === opt.value"
            class="pi pi-spin pi-spinner mr-2"
          />
          <i v-else :class="opt.icon" class="mr-2" />
          <span class="stts-opt-label">{{ opt.label }}</span>
          <span class="stts-opt-desc">{{ opt.desc }}</span>
          <i
            v-if="sttsDialogSelected === opt.value && !savingStts"
            class="pi pi-check stts-opt-check"
          />
        </button>
      </div>
    </div>
    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        severity="secondary"
        text
        :disabled="savingStts"
        @click="showSttsDialog = false"
      />
    </template>
  </Dialog>

  <Toast />
  <KlaimResumeComponent
    v-model:showKlaim="showKlaim"
    :noregister="selectedNoreg"
    @saved="onKlaimSaved"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import ProgressBar from 'primevue/progressbar'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import KlaimResumeComponent from '@/components/Keuangan/KlaimResumeComponent.vue'
import { useKonsulNotifStore } from '@/stores/konsulNotif'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id, user_name, group_user, kd_dokter } = storeToRefs(authStore)
const toast = useToast()
const konsulNotifStore = useKonsulNotifStore()

const konsulBadgeClass = computed(() => {
  if (konsulNotifStore.unreadMasuk > 0 && konsulNotifStore.unreadTerkirim > 0) return 'badge-both'
  if (konsulNotifStore.unreadMasuk > 0) return 'badge-masuk'
  return 'badge-terkirim'
})

const konsulTooltip = computed(() => {
  const parts = []
  if (konsulNotifStore.unreadMasuk > 0)
    parts.push(`${konsulNotifStore.unreadMasuk} permintaan masuk`)
  if (konsulNotifStore.unreadTerkirim > 0)
    parts.push(`${konsulNotifStore.unreadTerkirim} balasan baru`)
  return parts.join(' · ') || null
})

const ShowProgressCheckSEP = ref(false)
const loading = ref(false)
const expandedRows = ref({})

const onRowExpand = (event) => {
  const key = event.data.NOPENDAFTARAN
  expandedRows.value = { [key]: true }
}

const onRowCollapse = () => {
  expandedRows.value = {}
}

const openKajianAwal = (noregister) => {
  const url = router.resolve({ name: 'KajianAwalDPJPView', params: { noregister } }).href
  window.open(url, '_blank')
}

const openCPPT = (noregister) => {
  const url = router.resolve({ name: 'CPPTView', params: { noregister } }).href
  window.open(url, '_blank')
}

const openDiagnosaAkhir = (noregister) => {
  const url = router.resolve({ name: 'DiagnosaAkhirDPJP', params: { noregister } }).href
  window.open(url, '_blank')
}

const openSiriraj = (noreg) => {
  const url = router.resolve({ name: 'SirirajView', params: { noreg } }).href
  window.open(url, '_blank')
}
const startDate = ref(new Date())
const endDate = ref(new Date())

const medicalData = ref([])
const selectedNoreg = ref('')
const showKlaim = ref(false)

const sttsCoderFilter = ref(null)

const showColumnMenu = ref(false)
const visibleColumns = ref([
  'STTS_RM_DPJP',
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
  'SUDAHFINALCLAIM',
  'MASUKPOLY',
  'KELUARPOLY_NULL',
  'IS_AKTIF_SEP',
  'NOTELP',
])

const PrintRekamMedisEl = (noregister) => {
  const routeData = router.resolve({
    name: 'RMEViewer',
    query: { noreg: noregister },
  })
  window.open(routeData.href, '_blank')
}

const allColumns = ref([
  { field: 'STTS_RM_DPJP', header: 'Status' },
  { field: 'NOMR', header: 'No MR' },
  { field: 'NAMAPASIEN', header: 'Nama Pasien' },
  { field: 'USIA', header: 'Usia' },
  { field: 'JENISKELAMIN', header: 'Jenis Kelamin' },
  { field: 'NOSEP', header: 'No SEP' },
  { field: 'CARABAYAR', header: 'Cara Bayar' },
  { field: 'POLI', header: 'Ruangan' },
  { field: 'NAMADOKTER', header: 'Dokter' },
  { field: 'DIAGNOSA_AWAL', header: 'Diagnosa Awal' },
  { field: 'CODE', header: 'Code' },
  { field: 'KETERANGAN', header: 'Keterangan' },
  { field: 'SUDAHFINALCLAIM', header: 'Final Claim' },
  { field: 'MASUKPOLY', header: 'Tgl Masuk' },
  { field: 'NOTELP', header: 'No Telp' },
  { field: 'KELUARPOLY_NULL', header: 'Tgl Pulang' },
  { field: 'IS_AKTIF_SEP', header: 'SEP Aktif' },
])

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  STTS_RM_DPJP: { value: null, matchMode: FilterMatchMode.IN },
  NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
  POLI: { value: null, matchMode: FilterMatchMode.IN },
  NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
  KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
  SUDAHFINALCLAIM: { value: null, matchMode: FilterMatchMode.IN },
  NOSEP: { value: null, matchMode: FilterMatchMode.CONTAINS },
  IS_AKTIF_SEP: { value: null, matchMode: FilterMatchMode.IN },
})

const TempfilteredData = ref([])
const DataSelected = ref(null)

const sttsCoderOpts = [
  { label: 'Semua', value: null, icon: 'pi pi-list', cls: 'secondary' },
  { label: 'Belum', value: 0, icon: 'pi pi-times-circle', cls: 'danger' },
  { label: 'Lengkap', value: 1, icon: 'pi pi-check-circle', cls: 'success' },
  { label: 'Perbaikan', value: 2, icon: 'pi pi-exclamation-circle', cls: 'warning' },
]

// ── Dialog Ubah Status RM DPJP ──────────────────────────────────────────────
const showSttsDialog = ref(false)
const sttsDialogRow = ref(null)
const sttsDialogSelected = ref(null)
const savingStts = ref(false)

const sttsRmOpts = [
  {
    value: 0,
    label: 'Belum Lengkap',
    desc: 'Rekam medis belum selesai dikerjakan',
    icon: 'pi pi-times-circle',
    cls: 'danger',
  },
  {
    value: 1,
    label: 'Lengkap / Final',
    desc: 'Rekam medis telah selesai dan difinalisasi oleh DPJP',
    icon: 'pi pi-check-circle',
    cls: 'success',
  },
]

const openSttsDialog = (row) => {
  sttsDialogRow.value = row
  sttsDialogSelected.value = row.STTS_RM_DPJP ?? 0
  showSttsDialog.value = true
}

const selectAndSave = (value) => {
  sttsDialogSelected.value = value
  simpanStts()
}

const simpanStts = async () => {
  if (sttsDialogSelected.value === null || !sttsDialogRow.value) return
  savingStts.value = true
  try {
    const payload = {
      id_client: id_client.value,
      noregister: sttsDialogRow.value.NOPENDAFTARAN,
      stts_rm_dpjp: sttsDialogSelected.value,
    }
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/kajian_awal/update_stts_rm_dpjp`,
      payload,
    )

    console.log('Update STTS RM DPJP response:', res.data)
    if (res.data?.metadata?.code == 200 || res.data?.code == 200) {
      sttsDialogRow.value.STTS_RM_DPJP = sttsDialogSelected.value
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: 'Status RM DPJP berhasil diperbarui',
        life: 3000,
      })
      showSttsDialog.value = false
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Gagal',
        detail: res.data?.metadata?.message || 'Gagal menyimpan',
        life: 4000,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menghubungi server',
      life: 4000,
    })
  } finally {
    savingStts.value = false
  }
}

const filteredByStts = computed(() => {
  let data = medicalData.value
  if (sttsCoderFilter.value !== null) {
    data = data.filter((r) => r.STTS_RM_DPJP == sttsCoderFilter.value)
  }
  if (dpjpSelected.value) {
    data = data.filter((r) => r.NAMADOKTER === dpjpSelected.value)
  }
  return data
})

// filteredCount live dari array — update otomatis saat filter berubah
const filteredCount = computed(() => filteredByStts.value.length)

// sttsCoderCount live dari array, mempertimbangkan filter DPJP aktif
const sttsCoderCount = computed(() => {
  const base = dpjpSelected.value
    ? medicalData.value.filter((r) => r.NAMADOKTER === dpjpSelected.value)
    : medicalData.value
  return {
    null: base.length,
    0: base.filter((r) => r.STTS_RM_DPJP == 0 || r.STTS_RM_DPJP == null).length,
    1: base.filter((r) => r.STTS_RM_DPJP == 1).length,
    2: base.filter((r) => r.STTS_RM_DPJP == 2).length,
  }
})

const jumlahTidakDiajukan = computed(() => {
  const data =
    TempfilteredData.value && TempfilteredData.value.length
      ? TempfilteredData.value
      : medicalData.value
  return data.filter((item) => parseFloat(item.TARIFCBG) === 0).length
})

const isColumnVisible = (fieldName) => visibleColumns.value.includes(fieldName)
const toggleColumnMenu = () => {
  showColumnMenu.value = !showColumnMenu.value
}
const selectAllColumns = () => {
  visibleColumns.value = allColumns.value.map((col) => col.field)
}
const deselectAllColumns = () => {
  visibleColumns.value = []
}

const toggleColumn = (fieldName) => {
  const index = visibleColumns.value.indexOf(fieldName)
  if (index > -1) visibleColumns.value.splice(index, 1)
  else visibleColumns.value.push(fieldName)
  saveColumnPreference()
}

const saveColumnPreference = () => {
  try {
    localStorage.setItem('visibleColumns_ranap', JSON.stringify(visibleColumns.value))
  } catch (e) {}
}

const loadColumnPreference = () => {
  try {
    const saved = localStorage.getItem('visibleColumns_ranap')
    if (saved) visibleColumns.value = JSON.parse(saved)
  } catch (e) {}
}

const SEARCH_KEY = 'monitoring_ranap_search'

const saveSearchParams = () => {
  try {
    localStorage.setItem(
      SEARCH_KEY,
      JSON.stringify({
        startDate: startDate.value ? startDate.value.toISOString() : null,
        endDate: endDate.value ? endDate.value.toISOString() : null,
        sttsPulang: sttsPulangSelected.value,
        caraBayar: caraBayarSelected.value,
        dpjp: dpjpSelected.value,
      }),
    )
  } catch (e) {}
}

const loadSearchParams = () => {
  try {
    const raw = localStorage.getItem(SEARCH_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved.startDate) startDate.value = new Date(saved.startDate)
    if (saved.endDate) endDate.value = new Date(saved.endDate)
    if (saved.sttsPulang) sttsPulangSelected.value = saved.sttsPulang
    if (saved.caraBayar) caraBayarSelected.value = saved.caraBayar
    if (saved.dpjp !== undefined) dpjpSelected.value = saved.dpjp
  } catch (e) {}
}

// --- Options ---
const caraBayarSelected = ref('BPJS')
const caraBayarOptions = ['BPJS', 'SEMUA']
const caraBayarFilterOptions = ref([])
const dpjpSelected = ref(null)
const dpjpOptions = ref([])
const noSEP = ref([])
const poliOptions = ref([])
const dokterOptions = ref([])
const sudahFilanClaim = ref([])
const KetaranganOpt = ref([])
const isAktifSEP = ref([])
const sttsCoderFilterOptions = ref([
  { label: 'Belum Lengkap', value: 0 },
  { label: 'Lengkap / Final', value: 1 },
  { label: 'Perbaikan (Coder)', value: 2 },
])

const sttsPulangSelected = ref({ caption: 'SUDAH PULANG', code: 1 })
const sttsPulangOpts = ref([
  { caption: 'SUDAH PULANG', code: 1 },
  { caption: 'SEDANG RAWAT', code: 2 },
  { caption: 'ALL', code: 3 },
])

const getUniqueValues = (field) => {
  return [...new Set(medicalData.value.map((item) => item[field]))].sort((a, b) => {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    if (!isNaN(a) && !isNaN(b)) return Number(a) - Number(b)
    return String(a).localeCompare(String(b))
  })
}

const updateFilterOptions = () => {
  caraBayarFilterOptions.value = getUniqueValues('CARABAYAR')
  poliOptions.value = getUniqueValues('POLI')
  dokterOptions.value = getUniqueValues('NAMADOKTER')
  // Jika login sebagai DOKTER, dropdown hanya tampilkan dokter yang login
  if (group_user.value === 'DOKTER' && dpjpSelected.value) {
    dpjpOptions.value = [dpjpSelected.value]
  } else {
    dpjpOptions.value = getUniqueValues('NAMADOKTER').filter(Boolean)
  }
  sudahFilanClaim.value = getUniqueValues('SUDAHFINALCLAIM')
  KetaranganOpt.value = getUniqueValues('KETERANGAN')
  noSEP.value = getUniqueValues('NOSEP')
  isAktifSEP.value = getUniqueValues('IS_AKTIF_SEP')
}

const loadingDokter = ref(false)
const listDokter = ref([])

const fetchDokterLogin = async () => {
  try {
    loadingDokter.value = true
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/datadokterv3`,
      { id_client: id_client.value, kd_dokter: kd_dokter.value, mode: 4 },
    )

    console.log('fetchDokterLogin response:', JSON.stringify(response.data))
    if (response.data?.response) {
      listDokter.value = response.data.response

      // Cari dokter yang login berdasarkan KDDOKTER
      const matched = listDokter.value.find((d) => String(d.KDDOKTER) === String(kd_dokter.value))
      if (matched) {
        dpjpSelected.value = matched.NAMADOKTER
        // Untuk user DOKTER, dropdown hanya tampilkan dokter yang login
        dpjpOptions.value = [matched.NAMADOKTER]
      }
    }
  } catch (error) {
    console.error('fetchDokterLogin:', error)
    showError('Gagal memuat data dokter')
  } finally {
    loadingDokter.value = false
  }
}

const onFilter = (event) => {
  TempfilteredData.value = event.filteredValue || []
}

const clearFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    STTS_RM_DPJP: { value: null, matchMode: FilterMatchMode.IN },
    NAMAPASIEN: { value: null, matchMode: FilterMatchMode.CONTAINS },
    CARABAYAR: { value: null, matchMode: FilterMatchMode.IN },
    POLI: { value: null, matchMode: FilterMatchMode.IN },
    NAMADOKTER: { value: null, matchMode: FilterMatchMode.IN },
    KETERANGAN: { value: null, matchMode: FilterMatchMode.IN },
    SUDAHFINALCLAIM: { value: null, matchMode: FilterMatchMode.IN },
    NOSEP: { value: null, matchMode: FilterMatchMode.CONTAINS },
    IS_AKTIF_SEP: { value: null, matchMode: FilterMatchMode.IN },
  }
}

const exportToExcel = () => {
  import('xlsx').then((xlsx) => {
    const exportData = TempfilteredData.value.length ? TempfilteredData.value : medicalData.value
    const worksheet = xlsx.utils.json_to_sheet(exportData)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Monitoring Ranap')
    xlsx.writeFile(workbook, 'Data_Monitoring_Rawat_Inap.xlsx')
  })
}

const onKlaimSaved = (data) => {
  if (!data?.noregister) return
  const row = medicalData.value.find((r) => r.NOPENDAFTARAN === data.noregister)
  if (row && data.stts_rm_dpjp !== undefined) row.STTS_RM_DPJP = data.stts_rm_dpjp
  toast.add({
    severity: 'success',
    summary: 'Tersimpan',
    detail: `Status diperbarui`,
    life: 4000,
  })
}

const ShowDetailsdata = (row) => {
  selectedNoreg.value = row.NOPENDAFTARAN
  showKlaim.value = true
}

const openJawabKonsul = () => {
  const url = router.resolve({ name: 'JawabKonsulView' }).href
  window.open(url, '_blank')
}

const openKonsultasi = (data) => {
  const url = router.resolve({
    name: 'KonsultasiFormView',
    query: {
      noregister: data.NOPENDAFTARAN,
      no_rm: data.NOMR,
      nama_pasien: data.NAMAPASIEN,
    },
  }).href
  window.open(url, '_blank')
}

const showSuccess = (message = 'Operation successful') => {
  toast.add({ severity: 'success', summary: 'Sukses', detail: message, life: 3000 })
}

const showError = (message = 'An error occurred') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}

const showWarning = (message) => {
  toast.add({ severity: 'warn', summary: 'Perhatian', detail: message, life: 4000 })
}

const loadingCheckSEP = ref(false)
const progress = ref(0)
const nosepSedanSign = ref(0)
const listRespons = ref([])

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
}

const checkSEPAktif = async (nosep) => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/check_stts_sep_aktif`,
      { id_client: id_client.value, nosep },
    )
    listRespons.value.push(response.data)
  } catch (error) {
    console.error('Error check SEP:', error)
  }
}

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_rincian_klaimv2/`,
      {
        id_client: id_client.value,
        tglawal: formatDateOnlyForAPI(startDate.value),
        tglakhir: formatDateOnlyForAPI(endDate.value),
        kodeunit: '',
        jenisrawat: 'INAP',
        mod: 'history2',
        bulan_tahun: '',
        kd_dokter: kd_dokter.value || '',
        status_pulang: sttsPulangSelected.value.caption,
        cara_bayar: caraBayarSelected.value,
      },
    )

    if (response.data.metadata.code == 200) {
      medicalData.value = response.data.response.map((item) => ({
        ...item,
        STTS_RM_DPJP:
          item.STTS_RM_DPJP === null || item.STTS_RM_DPJP === undefined || item.STTS_RM_DPJP === ''
            ? null
            : Number(item.STTS_RM_DPJP),
      }))
      updateFilterOptions()
      showSuccess(`Data berhasil dimuat: ${medicalData.value.length} records`)
    } else {
      medicalData.value = []
      showWarning('Tidak ada data ditemukan')
    }
    loading.value = false
  } catch (error) {
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
  } catch {
    return null
  }
}

watch([startDate, endDate, sttsPulangSelected, caraBayarSelected, dpjpSelected], saveSearchParams)

onMounted(() => {
  loadColumnPreference()
  loadSearchParams()
  if (group_user.value === 'DOKTER') {
    fetchDokterLogin()
  }
  konsulNotifStore.startPolling(configStore.apiBaseUrl, id_client.value, kd_dokter.value)
})

onUnmounted(() => {
  konsulNotifStore.stopPolling()
})
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #1a3a5f 0%, #2e86ab 100%);
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

.filter-label {
  font-size: 10px;
  font-weight: 700;
  color: #007a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  padding: 2px 6px 2px 4px;
  border-left: 3px solid darkcyan;
  background: linear-gradient(90deg, rgba(0, 139, 139, 0.08) 0%, transparent 100%);
  border-radius: 0 3px 3px 0;
}
.filter-label i {
  color: darkcyan;
  font-size: 10px;
}

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
.tbl-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

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

.round-button2 {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.02rem 0.35rem;
  font-size: 0.7rem;
  line-height: 1;
}
:deep(.p-datatable .p-datatable-tbody > tr) {
  height: 22px;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  background: #e6edf7;
  color: #162d4e;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 48px;
  width: 100%;
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  text-transform: uppercase;
  font-weight: 700;
}
.status-cell-clickable {
  cursor: pointer;
  transition:
    filter 0.15s,
    box-shadow 0.15s;
}
.status-cell-clickable:hover {
  filter: brightness(0.93);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12);
}
.status-edit-icon {
  font-size: 0.65rem;
  opacity: 0.55;
  margin-left: 2px;
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

/* ── Dialog Status RM DPJP ── */
.stts-option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stts-option-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s,
    background 0.15s;
  position: relative;
}
.stts-option-btn:hover {
  background: #eef2f7;
}
.stts-opt-label {
  font-weight: 700;
  font-size: 0.85rem;
  display: block;
}
.stts-opt-desc {
  font-size: 0.72rem;
  color: #64748b;
  display: block;
}
.stts-opt-check {
  position: absolute;
  right: 12px;
  font-size: 1rem;
  color: #15803d;
}
.stts-opt-danger.stts-opt-active {
  border-color: #f87171;
  background: #fef2f2;
}
.stts-opt-success.stts-opt-active {
  border-color: #4ade80;
  background: #f0fdf4;
}
.stts-opt-danger .stts-opt-label {
  color: #b91c1c;
}
.stts-opt-success .stts-opt-label {
  color: #15803d;
}

.stts-perbaikan-info {
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.78rem;
  color: #78350f;
}

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

/* ── Expansion Row ── */
.exp-wrap {
  display: flex;
  align-items: stretch;
  gap: 0;
  background: #eef4fb;
  border-top: 2px solid #2e86ab;
  min-height: 90px;
}

.exp-action-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #1a3a5f;
  min-width: 170px;
}
.exp-action-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: #a8c4e0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}
.exp-btn {
  width: 100% !important;
  justify-content: flex-start !important;
  font-size: 0.72rem !important;
}

.exp-divider {
  width: 1px;
  background: #c5d8ef;
  flex-shrink: 0;
}

.exp-info-col {
  flex: 1;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.exp-info-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1a3a5f;
  margin-bottom: 4px;
}
.exp-info-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  row-gap: 2px;
}
.exp-info-lbl {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
}
.exp-info-val {
  font-size: 0.72rem;
  color: #1e293b;
  font-weight: 500;
}

@media (max-width: 768px) {
  .exp-wrap {
    flex-direction: column;
  }
  .exp-info-col {
    order: -1;
    border-bottom: 1px solid #c5d8ef;
  }
  .exp-action-col {
    order: 1;
    flex-direction: column;
    min-width: unset;
    width: 100%;
    align-items: flex-start;
    padding: 8px 10px;
    gap: 6px;
  }
  .exp-action-title {
    width: 100%;
    margin-bottom: 0;
  }
  .exp-btn {
    width: auto !important;
    flex-shrink: 0;
  }
  .exp-divider {
    display: none;
  }

  .tbl-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .tbl-filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .tbl-stts-pills {
    flex-wrap: wrap;
    border-radius: 6px;
    overflow: visible;
    border: none;
    gap: 6px;
  }
  .tbl-stts-pill {
    border: 1px solid #b2c8dd;
    border-radius: 6px !important;
    padding: 5px 10px;
    font-size: 11px;
  }
  .tbl-stts-pill:last-child {
    border-right: 1px solid #b2c8dd;
  }
  .tbl-actions {
    justify-content: flex-start;
  }
}

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

/* ── Konsultasi Notification Banner ── */
.konsul-banner {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}
.konsul-banner-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
  transition:
    filter 0.15s,
    transform 0.12s;
  animation: bannerSlideIn 0.3s ease;
}
.konsul-banner-item:hover {
  filter: brightness(0.95);
  transform: translateX(2px);
}
.konsul-banner-masuk {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fca5a5;
  border-left: 5px solid #ef4444;
}
.konsul-banner-terkirim {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-left: 5px solid #10b981;
}
.konsul-banner-icon {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.konsul-banner-masuk .konsul-banner-icon {
  background: #fee2e2;
  color: #ef4444;
}
.konsul-banner-terkirim .konsul-banner-icon {
  background: #dcfce7;
  color: #10b981;
}
.konsul-banner-count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
}
.konsul-banner-masuk .konsul-banner-count {
  background: #ef4444;
}
.konsul-banner-terkirim .konsul-banner-count {
  background: #10b981;
}
.konsul-banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.konsul-banner-title {
  font-size: 13px;
  font-weight: 700;
}
.konsul-banner-masuk .konsul-banner-title {
  color: #b91c1c;
}
.konsul-banner-terkirim .konsul-banner-title {
  color: #065f46;
}
.konsul-banner-sub {
  font-size: 11.5px;
}
.konsul-banner-masuk .konsul-banner-sub {
  color: #dc2626;
}
.konsul-banner-terkirim .konsul-banner-sub {
  color: #059669;
}
.konsul-banner-arrow {
  font-size: 13px;
  flex-shrink: 0;
}
.konsul-banner-masuk .konsul-banner-arrow {
  color: #ef4444;
}
.konsul-banner-terkirim .konsul-banner-arrow {
  color: #10b981;
}

@keyframes bannerSlideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Konsultasi Notif Badge ── */
.konsul-notif-wrap {
  position: relative;
  display: inline-flex;
}
.konsul-notif-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 19px;
  height: 19px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
  pointer-events: none;
  z-index: 2;
  animation: badgePulse 2s ease-in-out infinite;
}
.konsul-notif-badge.badge-masuk {
  background: #ef4444;
}
.konsul-notif-badge.badge-terkirim {
  background: #10b981;
}
.konsul-notif-badge.badge-both {
  background: #f97316;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.18);
  }
}
</style>
