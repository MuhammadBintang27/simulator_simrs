<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data..." />
    <Toast />
    <ConfirmDialog />

    <!-- ══ HERO HEADER ══ -->
    <div class="utd-header">
      <div class="utd-header-left">
        <div class="utd-header-icon">
          <i class="fas fa-tint"></i>
        </div>
        <div>
          <div class="utd-header-title">Penerimaan Darah dari PMI</div>
          <div class="utd-header-sub">
            Unit Transfusi Darah — Manajemen Penerimaan Kantong Darah
          </div>
        </div>
      </div>
      <div class="utd-header-right">
        <Tag
          v-if="dataList.length > 0"
          :value="`${dataList.length} data`"
          severity="info"
          style="font-size: 11px"
        />
        <Button
          v-if="viewMode === 'penerimaan'"
          label="Tambah Penerimaan"
          icon="pi pi-plus"
          class="round-button2 btn-primary-utd"
          @click="openForm()"
        />
      </div>
    </div>

    <!-- ══ STAT STRIP ══ -->
    <div class="utd-stat-strip">
      <div class="strip-stat" style="--c: darkcyan">
        <i class="pi pi-inbox strip-ico"></i>
        <span class="strip-num">{{ dataList.length }}</span>
        <span class="strip-lbl">Penerimaan</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat" style="--c: #c62828">
        <i class="fas fa-tint strip-ico"></i>
        <span class="strip-num">{{ totalKantong }}</span>
        <span class="strip-lbl">Kantong</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat" style="--c: #2e7d32">
        <i class="pi pi-check-circle strip-ico"></i>
        <span class="strip-num">{{ stokTersedia }}</span>
        <span class="strip-lbl">Tersedia</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat" style="--c: #ef6c00">
        <i class="pi pi-exclamation-triangle strip-ico"></i>
        <span class="strip-num">{{ stokBermasalah }}</span>
        <span class="strip-lbl">Bermasalah</span>
      </div>
      <template v-if="allStokList.length > 0">
        <div class="strip-div-thick"></div>
        <div class="strip-gol-section">
          <span class="strip-gol-lbl"
            ><i class="fas fa-tint me-1" style="color: #c62828"></i>Gol.</span
          >
          <div class="strip-gol-chips">
            <span v-for="gol in golonganSummary" :key="gol.label" class="strip-gol-chip">
              <b>{{ gol.label }}</b
              ><em>{{ gol.count }}</em>
            </span>
            <span v-if="golonganSummary.length === 0" style="font-size: 10px; color: #94a3b8"
              >—</span
            >
          </div>
        </div>
      </template>
    </div>
    <!-- ══ VIEW MODE ══ -->
    <div class="view-mode-bar">
      <span class="view-mode-label"><i class="pi pi-eye me-1"></i>Tampilan</span>
      <div class="view-mode-tabs">
        <button
          :class="['mode-tab', { active: viewMode === 'penerimaan' }]"
          @click="setMode('penerimaan')"
        >
          <i class="pi pi-list-check me-1"></i>Per Penerimaan
        </button>
        <button :class="['mode-tab', { active: viewMode === 'stok' }]" @click="setMode('stok')">
          <i class="fas fa-tint me-1"></i>Stok Darah
        </button>
      </div>
    </div>

    <!-- ══ FILTER BAR ══ -->
    <div class="utd-filter-bar">
      <div class="utd-filter-group">
        <label class="utd-filter-label"><i class="pi pi-calendar me-1"></i>Dari Tanggal</label>
        <DatePicker
          v-model="filterTglAwal"
          dateFormat="dd/mm/yy"
          placeholder="Dari..."
          class="filter-datepicker"
        />
      </div>
      <div class="utd-filter-group">
        <label class="utd-filter-label"><i class="pi pi-calendar me-1"></i>Sampai</label>
        <DatePicker
          v-model="filterTglAkhir"
          dateFormat="dd/mm/yy"
          placeholder="Sampai..."
          class="filter-datepicker"
        />
      </div>
      <div class="utd-filter-group utd-filter-search">
        <label class="utd-filter-label"><i class="pi pi-search me-1"></i>Cari</label>
        <InputText v-model="filterKeyword" placeholder="No. surat, asal PMI..." class="w-100" />
      </div>
      <div class="utd-filter-actions">
        <Button
          icon="pi pi-search"
          label="Cari"
          class="round-button2 btn-primary-utd"
          :loading="loading"
          @click="fetchData"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          class="round-button2"
          v-tooltip.top="'Reset filter'"
          @click="resetFilter"
        />
      </div>
    </div>

    <!-- ══ DATA TABLE ══ -->
    <div v-if="viewMode === 'penerimaan'" class="utd-table-wrap">
      <DataTable
        :value="filteredList"
        :loading="loading"
        v-model:expandedRows="expandedRows"
        @row-expand="onRowExpand"
        showGridlines
        rowHover
        scrollable
        scrollHeight="65vh"
        size="small"
        responsiveLayout="scroll"
        :paginator="true"
        :rows="20"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 20, 50]"
        class="utd-datatable"
      >
        <template #empty>
          <div class="utd-empty">
            <div class="utd-empty-icon"><i class="fas fa-tint-slash"></i></div>
            <p class="utd-empty-title">Belum ada data penerimaan</p>
            <small>Klik "Tambah Penerimaan" untuk menambahkan data baru</small>
          </div>
        </template>

        <Column expander style="width: 3rem" />

        <Column field="no_penerimaan" header="NO. PENERIMAAN" style="min-width: 150px">
          <template #body="{ data }">
            <span class="mono fw-semibold text-teal">{{ data.no_penerimaan || '-' }}</span>
          </template>
        </Column>

        <Column field="tgl_penerimaan" header="TGL. PENERIMAAN" style="min-width: 130px">
          <template #body="{ data }">
            <span>{{ formatTgl(data.tgl_penerimaan) }}</span>
          </template>
        </Column>

        <Column field="no_surat_jalan" header="NO. SURAT JALAN" style="min-width: 150px">
          <template #body="{ data }">
            <span class="mono">{{ data.no_surat_jalan || '-' }}</span>
          </template>
        </Column>

        <Column field="asal_pmi" header="ASAL PMI" style="min-width: 160px">
          <template #body="{ data }">
            <div class="pmi-cell">
              <i class="pi pi-building me-1" style="color: #00838f; font-size: 10px"></i>
              {{ data.asal_pmi || '-' }}
            </div>
          </template>
        </Column>

        <Column
          field="jumlah_kantong"
          header="JML KANTONG"
          style="min-width: 110px; text-align: center"
        >
          <template #body="{ data }">
            <div class="kantong-badge">
              <i class="fas fa-tint me-1"></i>{{ data.jumlah_kantong ?? 0 }}
            </div>
          </template>
        </Column>

        <Column field="id_petugas_penerima" header="PETUGAS PENERIMA" style="min-width: 140px">
          <template #body="{ data }">
            <span>{{ data.nama_petugas || data.id_petugas_penerima || '-' }}</span>
          </template>
        </Column>

        <Column field="STATUS" header="STATUS" style="min-width: 110px">
          <template #body="{ data }">
            <Tag
              :value="getStatusLabel(data.STATUS)"
              :severity="getStatusSeverity(data.STATUS)"
              style="font-size: 10px"
            />
          </template>
        </Column>

        <Column field="keterangan" header="KETERANGAN" style="min-width: 180px">
          <template #body="{ data }">
            <span class="ket-text">{{ data.keterangan || '-' }}</span>
          </template>
        </Column>

        <Column header="AKSI" frozen alignFrozen="right" style="min-width: 80px">
          <template #body="{ data }">
            <div class="action-btns">
              <Button
                icon="pi pi-pencil"
                size="small"
                text
                rounded
                severity="info"
                v-tooltip.top="'Edit'"
                @click="openForm(data)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                text
                rounded
                severity="danger"
                v-tooltip.top="'Hapus'"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>

        <!-- ══ ROW EXPANSION ══ -->
        <template #expansion="{ data: penerimaan }">
          <div class="expansion-wrap">
            <!-- Info bar penerimaan -->
            <div class="detail-info-bar">
              <div class="detail-info-item">
                <span class="detail-info-lbl"
                  ><i class="pi pi-hashtag me-1"></i>No. Penerimaan</span
                >
                <span class="detail-info-val mono">{{ penerimaan.no_penerimaan || '-' }}</span>
              </div>
              <div class="detail-info-item">
                <span class="detail-info-lbl"><i class="pi pi-building me-1"></i>Asal PMI</span>
                <span class="detail-info-val">{{ penerimaan.asal_pmi || '-' }}</span>
              </div>
              <div class="detail-info-item">
                <span class="detail-info-lbl"
                  ><i class="pi pi-calendar me-1"></i>Tgl. Penerimaan</span
                >
                <span class="detail-info-val">{{ formatTgl(penerimaan.tgl_penerimaan) }}</span>
              </div>
              <div class="detail-info-item">
                <span class="detail-info-lbl"><i class="pi pi-file me-1"></i>No. Surat Jalan</span>
                <span class="detail-info-val mono">{{ penerimaan.no_surat_jalan || '-' }}</span>
              </div>
              <div class="detail-info-item">
                <span class="detail-info-lbl"
                  ><i class="fas fa-tint me-1"></i>Kantong Tercatat</span
                >
                <span class="detail-info-val">
                  <Tag
                    :value="`${(stokByPenerimaan[penerimaan.no_penerimaan] || []).length} / ${penerimaan.jumlah_kantong} kantong`"
                    severity="info"
                    style="font-size: 10px"
                  />
                </span>
              </div>
              <Button
                icon="pi pi-plus"
                label="Tambah Kantong"
                size="small"
                class="round-button2 btn-primary-utd ms-auto"
                @click="openStokForm(penerimaan)"
              />
            </div>

            <!-- Sub-tabel stok darah -->
            <DataTable
              :value="stokByPenerimaan[penerimaan.no_penerimaan] || []"
              :loading="loadingStokMap[penerimaan.no_penerimaan]"
              showGridlines
              rowHover
              size="small"
              class="utd-datatable stok-subtable"
            >
              <template #empty>
                <div class="utd-empty" style="padding: 20px">
                  <div class="utd-empty-icon" style="width: 42px; height: 42px; font-size: 16px">
                    <i class="fas fa-tint-slash"></i>
                  </div>
                  <p class="utd-empty-title" style="font-size: 13px">Belum ada kantong darah</p>
                  <small>Klik "Tambah Kantong" untuk menambahkan</small>
                </div>
              </template>

              <Column header="#" style="width: 40px; text-align: center">
                <template #body="{ index }"
                  ><span style="font-size: 11px">{{ index + 1 }}</span></template
                >
              </Column>
              <Column field="no_kantong" header="NO. KANTONG" style="min-width: 130px">
                <template #body="{ data }">
                  <span class="mono fw-semibold text-teal">{{ data.no_kantong || '-' }}</span>
                </template>
              </Column>
              <Column field="golongan" header="GOL. DARAH" style="min-width: 95px">
                <template #body="{ data }">
                  <Tag
                    :value="data.golongan || '-'"
                    severity="danger"
                    style="font-size: 11px; font-weight: 700"
                  />
                </template>
              </Column>
              <Column field="jenis_komponen" header="KOMPONEN" style="min-width: 110px">
                <template #body="{ data }">
                  <Tag
                    :value="data.jenis_komponen || '-'"
                    severity="info"
                    style="font-size: 10px"
                  />
                </template>
              </Column>
              <Column field="volume_ml" header="VOLUME (mL)" style="min-width: 110px">
                <template #body="{ data }">
                  <span>{{ data.volume_ml ?? '-' }} mL</span>
                </template>
              </Column>
              <Column field="tgl_masuk" header="TGL MASUK" style="min-width: 110px">
                <template #body="{ data }"
                  ><span>{{ formatTgl(data.tgl_masuk) }}</span></template
                >
              </Column>
              <Column field="tgl_expired" header="TGL EXPIRED" style="min-width: 110px">
                <template #body="{ data }">
                  <span :class="isExpired(data.tgl_expired) ? 'text-expired' : ''">
                    {{ formatTgl(data.tgl_expired) }}
                    <i
                      v-if="isExpired(data.tgl_expired)"
                      class="pi pi-exclamation-triangle ms-1"
                      style="font-size: 9px"
                    ></i>
                  </span>
                </template>
              </Column>
              <Column field="suhu_terima" header="SUHU (°C)" style="min-width: 90px">
                <template #body="{ data }"
                  ><span>{{ data.suhu_terima ?? '-' }}</span></template
                >
              </Column>
              <Column field="kondisi_fisik" header="KONDISI" style="min-width: 90px">
                <template #body="{ data }">
                  <Tag
                    :value="data.kondisi_fisik || '-'"
                    :severity="data.kondisi_fisik === 'Baik' ? 'success' : 'warn'"
                    style="font-size: 10px"
                  />
                </template>
              </Column>
              <Column field="status" header="STATUS" style="min-width: 100px">
                <template #body="{ data }">
                  <Tag
                    :value="getStokStatusLabel(data.status)"
                    :severity="getStokStatusSeverity(data.status)"
                    style="font-size: 10px"
                  />
                </template>
              </Column>
              <Column field="keterangan" header="KET." style="min-width: 120px">
                <template #body="{ data }">
                  <span class="ket-text">{{ data.keterangan || '-' }}</span>
                </template>
              </Column>
              <Column header="AKSI" frozen alignFrozen="right" style="min-width: 80px">
                <template #body="{ data }">
                  <div class="action-btns">
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      text
                      rounded
                      severity="info"
                      v-tooltip.top="'Edit'"
                      @click="openStokForm(penerimaan, data)"
                    />
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      text
                      rounded
                      severity="danger"
                      v-tooltip.top="'Hapus'"
                      @click="confirmDeleteStok(penerimaan, data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- ══ MODE 2: STOK DARAH FLAT TABLE ══ -->
    <div v-if="viewMode === 'stok'" class="utd-table-wrap">
      <DataTable
        :value="filteredAllStok"
        :loading="loadingAllStok"
        showGridlines
        rowHover
        scrollable
        scrollHeight="65vh"
        size="small"
        responsiveLayout="scroll"
        :paginator="true"
        :rows="20"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 20, 50]"
        class="utd-datatable"
      >
        <template #empty>
          <div class="utd-empty">
            <div class="utd-empty-icon"><i class="fas fa-tint-slash"></i></div>
            <p class="utd-empty-title">Belum ada data stok darah</p>
            <small>Pilih tanggal dan klik Cari untuk memuat data</small>
          </div>
        </template>

        <Column header="#" style="width: 40px; text-align: center">
          <template #body="{ index }"
            ><span style="font-size: 11px">{{ index + 1 }}</span></template
          >
        </Column>
        <Column field="no_kantong" header="NO. KANTONG" style="min-width: 140px">
          <template #body="{ data }">
            <span class="mono fw-semibold text-teal">{{ data.no_kantong || '-' }}</span>
          </template>
        </Column>
        <Column field="id_penerimaan" header="NO. PENERIMAAN" style="min-width: 155px">
          <template #body="{ data }">
            <span class="mono" style="font-size: 11px; color: #475569">{{
              data.id_penerimaan || '-'
            }}</span>
          </template>
        </Column>
        <Column field="golongan" header="GOL. DARAH" style="min-width: 95px">
          <template #body="{ data }">
            <Tag
              :value="data.golongan || '-'"
              severity="danger"
              style="font-size: 11px; font-weight: 700"
            />
          </template>
        </Column>
        <Column field="jenis_komponen" header="KOMPONEN" style="min-width: 105px">
          <template #body="{ data }">
            <Tag :value="data.jenis_komponen || '-'" severity="info" style="font-size: 10px" />
          </template>
        </Column>
        <Column field="volume_ml" header="VOL (mL)" style="min-width: 90px">
          <template #body="{ data }"
            ><span>{{ data.volume_ml ?? '-' }} mL</span></template
          >
        </Column>
        <Column field="tgl_masuk" header="TGL MASUK" style="min-width: 110px">
          <template #body="{ data }"
            ><span>{{ formatTgl(data.tgl_masuk) }}</span></template
          >
        </Column>
        <Column field="tgl_expired" header="TGL EXPIRED" style="min-width: 110px">
          <template #body="{ data }">
            <span :class="isExpired(data.tgl_expired) ? 'text-expired' : ''">
              {{ formatTgl(data.tgl_expired) }}
              <i
                v-if="isExpired(data.tgl_expired)"
                class="pi pi-exclamation-triangle ms-1"
                style="font-size: 9px"
              ></i>
            </span>
          </template>
        </Column>
        <Column field="suhu_terima" header="SUHU (°C)" style="min-width: 90px">
          <template #body="{ data }"
            ><span>{{ data.suhu_terima ?? '-' }}</span></template
          >
        </Column>
        <Column field="kondisi_fisik" header="KONDISI" style="min-width: 90px">
          <template #body="{ data }">
            <Tag
              :value="data.kondisi_fisik || '-'"
              :severity="data.kondisi_fisik === 'Baik' ? 'success' : 'warn'"
              style="font-size: 10px"
            />
          </template>
        </Column>
        <Column field="status" header="STATUS" style="min-width: 100px">
          <template #body="{ data }">
            <Tag
              :value="getStokStatusLabel(data.status)"
              :severity="getStokStatusSeverity(data.status)"
              style="font-size: 10px"
            />
          </template>
        </Column>
        <Column field="keterangan" header="KET." style="min-width: 120px">
          <template #body="{ data }">
            <span class="ket-text">{{ data.keterangan || '-' }}</span>
          </template>
        </Column>
        <Column header="AKSI" frozen alignFrozen="right" style="min-width: 80px">
          <template #body="{ data }">
            <div class="action-btns">
              <Button
                icon="pi pi-pencil"
                size="small"
                text
                rounded
                severity="info"
                v-tooltip.top="'Edit'"
                @click="openStokForm(null, data)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                text
                rounded
                severity="danger"
                v-tooltip.top="'Hapus'"
                @click="confirmDeleteStok(null, data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- ══ DIALOG FORM PENERIMAAN ══ -->
    <Dialog
      v-model:visible="showForm"
      :header="isEdit ? 'Edit Penerimaan Darah' : 'Tambah Penerimaan Darah dari PMI'"
      :style="{ width: '580px', maxWidth: '96vw' }"
      modal
      :closable="!loadingForm"
    >
      <div class="utd-form">
        <!-- No. Penerimaan -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="utd-label"><i class="pi pi-hashtag me-1"></i>No. Penerimaan</label>
            <InputText
              v-model="form.no_penerimaan"
              placeholder="Otomatis / isi manual..."
              class="w-100"
            />
          </div>
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-calendar me-1"></i>Tanggal Penerimaan
              <span class="req">*</span></label
            >
            <DatePicker
              v-model="form.tgl_penerimaan"
              dateFormat="yy-mm-dd"
              :showTime="false"
              placeholder="Pilih tanggal..."
              class="w-100"
            />
          </div>
        </div>

        <!-- No. Surat Jalan -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-file me-1"></i>No. Surat Jalan <span class="req">*</span></label
            >
            <InputText
              v-model="form.no_surat_jalan"
              placeholder="Masukkan no. surat jalan..."
              class="w-100"
              :class="{ 'p-invalid': errors.no_surat_jalan }"
            />
            <small v-if="errors.no_surat_jalan" class="p-error">{{ errors.no_surat_jalan }}</small>
          </div>
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-building me-1"></i>Asal PMI <span class="req">*</span></label
            >
            <InputText
              v-model="form.asal_pmi"
              placeholder="Nama / kota PMI asal..."
              class="w-100"
              :class="{ 'p-invalid': errors.asal_pmi }"
            />
            <small v-if="errors.asal_pmi" class="p-error">{{ errors.asal_pmi }}</small>
          </div>
        </div>

        <!-- Jumlah Kantong -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="utd-label"
              ><i class="fas fa-tint me-1"></i>Jumlah Kantong <span class="req">*</span></label
            >
            <InputNumber
              v-model="form.jumlah_kantong"
              showButtons
              :min="1"
              :max="9999"
              placeholder="0"
              class="w-100"
              :class="{ 'p-invalid': errors.jumlah_kantong }"
            />
            <small v-if="errors.jumlah_kantong" class="p-error">{{ errors.jumlah_kantong }}</small>
          </div>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label class="utd-label"><i class="pi pi-info-circle me-1"></i>Status</label>
          <Select
            v-model="form.STATUS"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih status..."
            class="w-100"
          />
        </div>

        <!-- Keterangan -->
        <div class="form-group">
          <label class="utd-label"><i class="pi pi-align-left me-1"></i>Keterangan</label>
          <Textarea
            v-model="form.keterangan"
            placeholder="Catatan tambahan (opsional)..."
            rows="3"
            :autoResize="true"
            class="w-100"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          class="round-button2"
          @click="showForm = false"
          :disabled="loadingForm"
        />
        <Button
          :label="isEdit ? 'Simpan Perubahan' : 'Simpan Data'"
          icon="pi pi-save"
          class="round-button2 btn-primary-utd"
          :loading="loadingForm"
          @click="submitForm"
        />
      </template>
    </Dialog>

    <!-- ══ DIALOG FORM KANTONG DARAH ══ -->
    <Dialog
      v-model:visible="showStokForm"
      :header="isEditStok ? 'Edit Data Kantong Darah' : 'Tambah Kantong Darah'"
      :style="{ width: '600px', maxWidth: '96vw' }"
      modal
      :closable="!loadingStokForm"
    >
      <div class="utd-form">
        <!-- No. Kantong & Golongan -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-hashtag me-1"></i>No. Kantong <span class="req">*</span></label
            >
            <InputText
              v-model="stokForm.no_kantong"
              placeholder="Nomor kantong darah..."
              class="w-100"
              :class="{ 'p-invalid': stokErrors.no_kantong }"
            />
            <small v-if="stokErrors.no_kantong" class="p-error">{{ stokErrors.no_kantong }}</small>
          </div>
          <div class="form-group">
            <label class="utd-label"
              ><i class="fas fa-tint me-1"></i>Golongan Darah <span class="req">*</span></label
            >

            <Select
              v-model="stokForm.golongan"
              :options="golonganOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih golongan..."
              class="w-100"
              :class="{ 'p-invalid': stokErrors.golongan }"
            />
            <small v-if="stokErrors.golongan" class="p-error">{{ stokErrors.golongan }}</small>
          </div>
        </div>

        <!-- Jenis Komponen & Volume -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-tag me-1"></i>Jenis Komponen <span class="req">*</span></label
            >
            <Select
              v-model="stokForm.jenis_komponen"
              :options="komponenOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih komponen..."
              class="w-100"
              :class="{ 'p-invalid': stokErrors.jenis_komponen }"
            />
            <small v-if="stokErrors.jenis_komponen" class="p-error">{{
              stokErrors.jenis_komponen
            }}</small>
          </div>
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-chart-bar me-1"></i>Volume (mL) <span class="req">*</span></label
            >
            <InputNumber
              v-model="stokForm.volume_ml"
              :min="1"
              :max="9999"
              placeholder="mL..."
              class="w-100"
              :class="{ 'p-invalid': stokErrors.volume_ml }"
            />
            <small v-if="stokErrors.volume_ml" class="p-error">{{ stokErrors.volume_ml }}</small>
          </div>
        </div>

        <!-- Tgl Masuk & Tgl Expired -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-calendar me-1"></i>Tgl. Masuk <span class="req">*</span></label
            >
            <DatePicker
              v-model="stokForm.tgl_masuk"
              dateFormat="yy-mm-dd"
              placeholder="Tgl masuk..."
              class="w-100"
            />
          </div>
          <div class="form-group">
            <label class="utd-label"
              ><i class="pi pi-calendar-times me-1"></i>Tgl. Expired
              <span class="req">*</span></label
            >
            <DatePicker
              v-model="stokForm.tgl_expired"
              dateFormat="yy-mm-dd"
              placeholder="Tgl expired..."
              class="w-100"
              :class="{ 'p-invalid': stokErrors.tgl_expired }"
            />
            <small v-if="stokErrors.tgl_expired" class="p-error">{{
              stokErrors.tgl_expired
            }}</small>
          </div>
        </div>

        <!-- Suhu & Kondisi -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="utd-label"><i class="pi pi-sun me-1"></i>Suhu Terima (°C)</label>
            <InputNumber
              v-model="stokForm.suhu_terima"
              :minFractionDigits="1"
              :maxFractionDigits="1"
              placeholder="Contoh: 4.0"
              class="w-100"
            />
          </div>
          <div class="form-group">
            <label class="utd-label"><i class="pi pi-eye me-1"></i>Kondisi Fisik</label>
            <Select
              v-model="stokForm.kondisi_fisik"
              :options="kondisiOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih kondisi..."
              class="w-100"
            />
          </div>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label class="utd-label"><i class="pi pi-info-circle me-1"></i>Status Kantong</label>
          <Select
            v-model="stokForm.status"
            :options="stokStatusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih status..."
            class="w-100"
          />
        </div>

        <!-- Keterangan -->
        <div class="form-group">
          <label class="utd-label"><i class="pi pi-align-left me-1"></i>Keterangan</label>
          <Textarea
            v-model="stokForm.keterangan"
            rows="2"
            :autoResize="true"
            placeholder="Catatan tambahan..."
            class="w-100"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          class="round-button2"
          @click="showStokForm = false"
          :disabled="loadingStokForm"
        />
        <Button
          :label="isEditStok ? 'Simpan Perubahan' : 'Simpan Kantong'"
          icon="pi pi-save"
          class="round-button2 btn-primary-utd"
          :loading="loadingStokForm"
          @click="submitStokForm"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

// ── State ────────────────────────────────────────────────
const loading = ref(false)
const loadingForm = ref(false)
const showForm = ref(false)
const isEdit = ref(false)
const dataList = ref([])
const filterTglAwal = ref(new Date())
const filterTglAkhir = ref(new Date())
const filterKeyword = ref('')

// ── View mode: 'penerimaan' | 'stok' ─────────────────────
const viewMode = ref('penerimaan')

// ── Mode 2 state ──────────────────────────────────────────
const allStokList = ref([])
const loadingAllStok = ref(false)

const formDefault = {
  id: null,
  no_penerimaan: '',
  tgl_penerimaan: new Date(),
  no_surat_jalan: '',
  asal_pmi: '',
  jumlah_kantong: 1,
  STATUS: 0,
  keterangan: '',
}

const form = ref({ ...formDefault })
const errors = ref({})

const statusOptions = [
  { label: 'Diterima', value: 0 },
  { label: 'Diproses', value: 1 },
  { label: 'Selesai', value: 2 },
  { label: 'Ditolak', value: 3 },
]

// ── Computed ─────────────────────────────────────────────
const filteredList = computed(() => {
  const kw = filterKeyword.value.toLowerCase().trim()
  if (!kw) return dataList.value
  return dataList.value.filter(
    (d) =>
      d.no_penerimaan?.toLowerCase().includes(kw) ||
      d.no_surat_jalan?.toLowerCase().includes(kw) ||
      d.asal_pmi?.toLowerCase().includes(kw) ||
      d.keterangan?.toLowerCase().includes(kw),
  )
})

// ── filteredAllStok (Mode 2) ─────────────────────────────
const filteredAllStok = computed(() => {
  const kw = filterKeyword.value.toLowerCase().trim()
  if (!kw) return allStokList.value
  return allStokList.value.filter(
    (d) =>
      d.no_kantong?.toLowerCase().includes(kw) ||
      d.id_penerimaan?.toLowerCase().includes(kw) ||
      d.jenis_komponen?.toLowerCase().includes(kw) ||
      d.kondisi_fisik?.toLowerCase().includes(kw) ||
      d.keterangan?.toLowerCase().includes(kw),
  )
})

// ── Helpers ──────────────────────────────────────────────
const formatTgl = (val) => {
  if (!val) return '-'
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return val
  }
}

const formatDateForApi = (date) => {
  if (!date) return null
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getStatusLabel = (status) => {
  const found = statusOptions.find((s) => s.value == status)
  return found?.label ?? 'Unknown'
}

const getStatusSeverity = (status) => {
  const map = { 0: 'info', 1: 'warn', 2: 'success', 3: 'danger' }
  return map[status] ?? 'secondary'
}

const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })

// ── Validasi ─────────────────────────────────────────────
const validate = () => {
  errors.value = {}
  if (!form.value.no_surat_jalan?.trim())
    errors.value.no_surat_jalan = 'No. Surat Jalan wajib diisi'
  if (!form.value.asal_pmi?.trim()) errors.value.asal_pmi = 'Asal PMI wajib diisi'
  if (!form.value.jumlah_kantong || form.value.jumlah_kantong < 1)
    errors.value.jumlah_kantong = 'Jumlah kantong minimal 1'
  return Object.keys(errors.value).length === 0
}

// ── API ──────────────────────────────────────────────────
const fetchData = async () => {
  try {
    loading.value = true
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/utd/get_penerimaan_darah`,
      {
        mode: 'list',
        id_client: id_client.value,
        tgl_dari: formatDateForApi(filterTglAwal.value),
        tgl_sampai: formatDateForApi(filterTglAkhir.value),
      },
    )
    dataList.value = res.data.data ?? []
  } catch {
    showError('Gagal memuat data penerimaan')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!validate()) return
  try {
    loadingForm.value = true
    const payload = {
      mode: isEdit.value ? 'update' : 'insert',
      id_client: id_client.value,
      user_id: user_id.value,
      data: {
        ...form.value,
        tgl_penerimaan: formatDateForApi(form.value.tgl_penerimaan),
        id_petugas_penerima: user_id.value,
      },
    }

    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/utd/simpan_penerimaan_darah`,
      payload,
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code == 200 || code === '200') {
      showSuccess(isEdit.value ? 'Data berhasil diperbarui' : 'Data berhasil disimpan')
      showForm.value = false
      await fetchData()
    } else {
      showError(res.data?.metadata?.message ?? res.data?.message ?? 'Gagal menyimpan data')
    }
  } catch {
    showError('Terjadi kesalahan saat menyimpan')
  } finally {
    loadingForm.value = false
  }
}

const deleteData = async (id) => {
  try {
    loading.value = true
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/utd/simpan_penerimaan_darah`,
      {
        mode: 'delete',
        id,
        id_client: id_client.value,
        user_id: user_id.value,
      },
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code == 200 || code === '200') {
      showSuccess('Data berhasil dihapus')
      await fetchData()
    } else {
      showError(res.data?.metadata?.message ?? 'Gagal menghapus data')
    }
  } catch {
    showError('Terjadi kesalahan saat menghapus')
  } finally {
    loading.value = false
  }
}

// ── Actions ───────────────────────────────────────────────
const openForm = (data = null) => {
  errors.value = {}
  if (data) {
    isEdit.value = true
    form.value = {
      ...data,
      tgl_penerimaan: data.tgl_penerimaan ? new Date(data.tgl_penerimaan) : new Date(),
      STATUS: Number(data.STATUS ?? 0),
    }
  } else {
    isEdit.value = false
    form.value = { ...formDefault, tgl_penerimaan: new Date() }
  }
  showForm.value = true
}

const confirmDelete = (data) => {
  confirm.require({
    message: `Hapus penerimaan "${data.no_penerimaan || data.no_surat_jalan}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => deleteData(data.id),
  })
}

// ── Summary Stats ─────────────────────────────────────────
const totalKantong = computed(() =>
  dataList.value.reduce((s, d) => s + (Number(d.jumlah_kantong) || 0), 0),
)
const stokTersedia = computed(
  () => allStokList.value.filter((s) => s.status === 0 && !isExpired(s.tgl_expired)).length,
)
const stokBermasalah = computed(
  () =>
    allStokList.value.filter((s) => s.status === 2 || s.status === 3 || isExpired(s.tgl_expired))
      .length,
)
const golonganSummary = computed(() => {
  const counts = {}
  allStokList.value.forEach((s) => {
    const gol = s.id_golongan || '?'
    counts[gol] = (counts[gol] || 0) + 1
  })
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
})

const fetchAllStok = async () => {
  try {
    loadingAllStok.value = true
    const res = await axios.post(`${configStore.apiBaseUrl}/index.php/api/utd/get_stok_darah`, {
      mode: 2,
      id_client: id_client.value,
      tgl_dari: formatDateForApi(filterTglAwal.value),
      tgl_sampai: formatDateForApi(filterTglAkhir.value),
    })

    console.log(res.data)
    const raw = res.data?.data ?? []
    allStokList.value = raw.map((item) => ({
      ...item,
      status: item.status ?? item.STATUS ?? 0,
    }))
  } catch {
    showError('Gagal memuat data stok darah')
  } finally {
    loadingAllStok.value = false
  }
}

const setMode = (mode) => {
  viewMode.value = mode
  if (mode === 'stok' && allStokList.value.length === 0) {
    fetchAllStok()
  }
}

const resetFilter = () => {
  filterTglAwal.value = new Date()
  filterTglAkhir.value = new Date()
  filterKeyword.value = ''
  fetchData()
  if (viewMode.value === 'stok') fetchAllStok()
}

// ══ STOK DARAH (Detail Ekspansi) ══════════════════════════

// ── State ─────────────────────────────────────────────────
// expandedRows: array of expanded row data — PrimeVue v4 pakai array, bukan object
const expandedRows = ref([])
// stokByPenerimaan: { [id_penerimaan]: stokItem[] }
const stokByPenerimaan = ref({})
// loadingStokMap: { [id_penerimaan]: boolean }
const loadingStokMap = ref({})

const showStokForm = ref(false)
const isEditStok = ref(false)
const loadingStokForm = ref(false)
const stokErrors = ref({})
// selectedPenerimaan — baris yang sedang aktif di stok form
const selectedPenerimaan = ref(null)

const stokFormDefault = {
  id: null,
  no_kantong: '',
  id_penerimaan: null,
  golongan: null,
  jenis_komponen: null,
  volume_ml: null,
  tgl_masuk: new Date(),
  tgl_expired: null,
  suhu_terima: null,
  kondisi_fisik: 'Baik',
  status: 0,
  keterangan: '',
}
const stokForm = ref({ ...stokFormDefault })

// ── Referensi options ─────────────────────────────────────
const golonganOptions = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
]

const komponenOptions = [
  { label: 'WB — Whole Blood', value: 'WB' },
  { label: 'PRC — Packed Red Cells', value: 'PRC' },
  { label: 'FFP — Fresh Frozen Plasma', value: 'FFP' },
  { label: 'TC — Thrombocyte Concentrate', value: 'TC' },
  { label: 'LP — Leukopoor Red Cells', value: 'LP' },
  { label: 'WBC — Washed Blood Cells', value: 'WBC' },
]

const kondisiOptions = [
  { label: 'Baik', value: 'Baik' },
  { label: 'Bocor', value: 'Bocor' },
  { label: 'Lisis', value: 'Lisis' },
  { label: 'Beku', value: 'Beku' },
]

const stokStatusOptions = [
  { label: 'Tersedia', value: 0 },
  { label: 'Digunakan', value: 1 },
  { label: 'Kadaluarsa', value: 2 },
  { label: 'Rusak / Ditolak', value: 3 },
]

const getStokStatusLabel = (status) =>
  stokStatusOptions.find((s) => s.value == status)?.label ?? '-'

const getStokStatusSeverity = (status) => {
  const map = { 0: 'success', 1: 'info', 2: 'danger', 3: 'warn' }
  return map[status] ?? 'secondary'
}

const isExpired = (tgl) => {
  if (!tgl) return false
  return new Date(tgl) < new Date()
}

// ── API stok ──────────────────────────────────────────────
const fetchStok = async (id_penerimaan, mode_data) => {
  try {
    loadingStokMap.value[id_penerimaan] = true
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_stok_darah`,
      {
        mode: mode_data,
        id_client: id_client.value,
        id_penerimaan: id_penerimaan,
      },
    )

    // Normalisasi STATUS (uppercase) → status (lowercase) agar template konsisten
    const raw = res.data?.data ?? []
    stokByPenerimaan.value[id_penerimaan] = raw.map((item) => ({
      ...item,
      status: item.status ?? item.STATUS ?? 0,
    }))
  } catch {
    showError('Gagal memuat data stok darah')
  } finally {
    loadingStokMap.value[id_penerimaan] = false
  }
}

// ── Row Expand Handler ─────────────────────────────────────
const onRowExpand = (event) => {
  const id = event.data?.no_penerimaan
  if (!id) return
  // Fetch hanya jika belum ada atau belum pernah dimuat
  if (!stokByPenerimaan.value[id]) {
    fetchStok(id, 1)
  }
}

const validateStok = () => {
  stokErrors.value = {}
  if (!stokForm.value.no_kantong?.trim()) stokErrors.value.no_kantong = 'No. Kantong wajib diisi'
  if (!stokForm.value.golongan) stokErrors.value.golongan = 'Golongan darah wajib dipilih'
  if (!stokForm.value.jenis_komponen)
    stokErrors.value.jenis_komponen = 'Jenis komponen wajib dipilih'
  if (!stokForm.value.volume_ml || stokForm.value.volume_ml < 1)
    stokErrors.value.volume_ml = 'Volume wajib diisi'
  if (!stokForm.value.tgl_expired) stokErrors.value.tgl_expired = 'Tgl. expired wajib diisi'
  return Object.keys(stokErrors.value).length === 0
}

const submitStokForm = async () => {
  if (!validateStok()) return
  try {
    loadingStokForm.value = true
    const idPenerimaan = stokForm.value.id_penerimaan
    const payload = {
      mode: isEditStok.value ? 'update' : 'insert',
      id_client: id_client.value,
      user_id: user_id.value,
      data: {
        ...stokForm.value,
        tgl_masuk: formatDateForApi(stokForm.value.tgl_masuk),
        tgl_expired: formatDateForApi(stokForm.value.tgl_expired),
      },
    }

    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/simpan_detail_darah`,
      payload,
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code == 200 || code === '200') {
      showSuccess(isEditStok.value ? 'Kantong berhasil diperbarui' : 'Kantong berhasil ditambahkan')
      showStokForm.value = false
      // Refresh stok sesuai mode aktif
      if (viewMode.value === 'stok') {
        await fetchAllStok()
      } else {
        await fetchStok(idPenerimaan, 1)
      }
    } else {
      showError(res.data?.metadata?.message ?? res.data?.message ?? 'Gagal menyimpan kantong')
    }
  } catch {
    showError('Terjadi kesalahan saat menyimpan')
  } finally {
    loadingStokForm.value = false
  }
}

const deleteStok = async (id_penerimaan, id) => {
  try {
    loadingStokMap.value[id_penerimaan] = true
    const res = await axios.post(`${configStore.apiBaseUrl}/index.php/api/penunjang/stok_darah`, {
      mode: 'delete',
      id,
      id_client: id_client.value,
      user_id: user_id.value,
    })
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code == 200 || code === '200') {
      showSuccess('Kantong berhasil dihapus')
      if (viewMode.value === 'stok') {
        await fetchAllStok()
      } else {
        await fetchStok(id_penerimaan, 1)
      }
    } else {
      showError(res.data?.metadata?.message ?? 'Gagal menghapus kantong')
    }
  } catch {
    showError('Terjadi kesalahan saat menghapus')
  } finally {
    loadingStokMap.value[id_penerimaan] = false
  }
}

// ── Actions stok ──────────────────────────────────────────
// penerimaan: baris induk; data: stok yang di-edit (null = tambah baru)
const openStokForm = (penerimaan, data = null) => {
  selectedPenerimaan.value = penerimaan
  stokErrors.value = {}
  if (data) {
    isEditStok.value = true
    stokForm.value = {
      ...data,
      tgl_masuk: data.tgl_masuk ? new Date(data.tgl_masuk) : new Date(),
      tgl_expired: data.tgl_expired ? new Date(data.tgl_expired) : null,
      status: Number(data.status ?? 0),
    }
  } else {
    isEditStok.value = false
    stokForm.value = {
      ...stokFormDefault,
      id_penerimaan: penerimaan?.no_penerimaan,
      tgl_masuk: new Date(),
    }
  }
  showStokForm.value = true
}

const confirmDeleteStok = (penerimaan, data) => {
  confirm.require({
    message: `Hapus kantong "${data.no_kantong}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    acceptClass: 'p-button-danger round-button2',
    accept: () => deleteStok(penerimaan?.no_penerimaan ?? data.id_penerimaan, data.id),
  })
}

// ── Lifecycle ─────────────────────────────────────────────
onMounted(() => {
  fetchData()
  fetchAllStok()
})
</script>

<style scoped>
.utd-container {
  padding: 1rem 1.25rem;
}

/* ── Header ── */
.utd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
  border-radius: 4px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.utd-header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.utd-header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.utd-header-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.utd-header-sub {
  font-size: 0.72rem;
  opacity: 0.85;
  margin-top: 2px;
}
.utd-header-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.btn-primary-utd {
  background: darkcyan !important;
  border-color: darkcyan !important;
}
.btn-primary-utd:hover {
  background: #00838f !important;
  border-color: #00838f !important;
}

/* ── Compact Stat Strip ── */
.utd-stat-strip {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 2px solid darkcyan;
  border-radius: 4px;
  padding: 0 6px;
  margin-bottom: 0.6rem;
  height: 38px;
  overflow-x: auto;
  gap: 0;
  flex-wrap: nowrap;
}
.strip-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  white-space: nowrap;
}
.strip-ico {
  font-size: 10px;
  color: var(--c, darkcyan);
  flex-shrink: 0;
}
.strip-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--c, #1e293b);
  line-height: 1;
}
.strip-lbl {
  font-size: 9.5px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.strip-div {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  flex-shrink: 0;
}
.strip-div-thick {
  width: 2px;
  height: 24px;
  background: #b2dfdb;
  flex-shrink: 0;
  margin: 0 4px;
}
.strip-gol-section {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  flex-shrink: 0;
}
.strip-gol-lbl {
  font-size: 9.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.strip-gol-chips {
  display: flex;
  gap: 3px;
  align-items: center;
}
.strip-gol-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: #fce4ec;
  border: 1px solid #f48fb1;
  border-radius: 8px;
  padding: 1px 5px 1px 5px;
  white-space: nowrap;
}
.strip-gol-chip b {
  font-size: 10px;
  font-weight: 800;
  color: #c62828;
  font-style: normal;
}
.strip-gol-chip em {
  font-size: 9.5px;
  font-weight: 700;
  font-style: normal;
  color: #fff;
  background: #c62828;
  border-radius: 6px;
  padding: 0 4px;
  min-width: 14px;
  text-align: center;
  line-height: 13px;
}

/* ── View Mode Toggle ── */
.view-mode-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.65rem;
}
.view-mode-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.view-mode-tabs {
  display: flex;
  border: 1.5px solid #b2dfdb;
  border-radius: 6px;
  overflow: hidden;
}
.mode-tab {
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  background: #fff;
  color: #475569;
  border: none;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.mode-tab + .mode-tab {
  border-left: 1.5px solid #b2dfdb;
}
.mode-tab:hover {
  background: #e0f7fa;
  color: #00838f;
}
.mode-tab.active {
  background: darkcyan;
  color: #fff;
}

/* ── Filter Bar ── */
.utd-filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid darkcyan;
  border-radius: 4px;
  padding: 0.85rem 1.1rem;
  margin-bottom: 0.85rem;
}
.utd-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}
.utd-filter-search {
  flex: 1;
  min-width: 200px;
}
.utd-filter-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.filter-datepicker {
  width: 100%;
}
.utd-filter-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

/* ── Table ── */
.utd-table-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid darkcyan;
  border-radius: 4px;
  overflow: hidden;
}
:deep(.utd-datatable .p-datatable-tbody > tr > td) {
  padding: 0.25rem 0.6rem;
  font-size: 12px;
}
:deep(.utd-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.6rem;
  font-size: 11px;
  background: #f0fdfa;
  color: #006064;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.mono {
  font-family: monospace;
  font-size: 11.5px;
}
.text-teal {
  color: #00838f;
}
.kantong-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e0f2f1;
  color: #00695c;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 700;
}
.pmi-cell {
  display: flex;
  align-items: center;
  font-size: 12px;
}
.ket-text {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  display: block;
}
.action-btns {
  display: flex;
  gap: 2px;
}

/* ── Empty State ── */
.utd-empty {
  text-align: center;
  padding: 40px 20px;
}
.utd-empty-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #e0f2f1, #b2dfdb);
  border-radius: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 22px;
  color: #00838f;
}
.utd-empty-title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  margin: 0 0 4px;
}
.utd-empty small {
  font-size: 12px;
  color: #9ca3af;
}

/* ── Form Dialog ── */
.utd-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 4px 0;
}
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}
@media (max-width: 480px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.utd-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.req {
  color: #dc2626;
}
.p-error {
  color: #e24c4c;
  font-size: 0.72rem;
}

/* ── Row Expansion ── */
.expansion-wrap {
  padding: 0.75rem 1rem 1rem;
  background: #f8fffe;
  border-top: 2px solid #b2dfdb;
}

/* ── Sub-tabel stok (di dalam expansion) ── */
:deep(.stok-subtable .p-datatable-thead > tr > th) {
  background: #e0f2f1 !important;
  color: #004d40 !important;
  font-size: 10.5px;
}
:deep(.stok-subtable .p-datatable-tbody > tr > td) {
  font-size: 11.5px;
}

/* ── Info bar di expansion (reuse kelas detail-info-bar) ── */
.detail-info-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem 1.2rem;
  background: #f0fdfa;
  border: 1px solid #b2dfdb;
  border-left: 4px solid darkcyan;
  border-radius: 1px;
  padding: 0.65rem 1rem;
  margin-bottom: 0.65rem;
}
.detail-info-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.detail-info-lbl {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #00838f;
}
.detail-info-val {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

/* ── Expired warning ── */
.text-expired {
  color: #dc2626;
  font-weight: 600;
}
</style>
