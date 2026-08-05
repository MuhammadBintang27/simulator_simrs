<template>
  <div class="content" @click.once="initAudioCtx">
    <Toast />

    <!-- ══ TOOLBAR ══ -->
    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <i
            class="fas fa-prescription-bottle-alt"
            style="font-size: 1.25rem; color: var(--p-primary-color)"
          />
          <div>
            <div style="font-size: 1rem; font-weight: 700; line-height: 1.2">
              Daftar Resep Permintaan Ruangan
            </div>
            <div style="font-size: 0.82rem; color: var(--p-text-muted-color)">
              Farmasi / Depo — Monitoring permintaan obat dari ruangan
            </div>
          </div>
        </div>
      </template>
      <template #end>
        <div style="display: flex; align-items: center; gap: 8px">
          <Tag v-if="resepByLokasi.length > 0" :value="`${resepByLokasi.length} resep`" />
          <span
            class="countdown-badge"
            :class="countdown <= 10 ? 'cd-danger' : countdown <= 30 ? 'cd-warn' : 'cd-ok'"
            v-tooltip.top="'Auto-refresh berikutnya'"
          >
            <i class="pi pi-clock" style="font-size: 9px" />{{ countdown }}d
          </span>
          <Button
            icon="pi pi-refresh"
            label="Refresh"
            size="small"
            severity="secondary"
            :loading="loading"
            @click="fetchResep"
          />
        </div>
      </template>
    </Toolbar>

    <!-- ══ STAT ROW ══ -->
    <div class="stat-row mb-2">
      <div class="stat-card">
        <i class="fas fa-file-prescription stat-ico" />
        <div>
          <div class="stat-val">{{ resepByLokasi.length }}</div>
          <div class="stat-lbl">Total Resep</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer" @click="setFilter('M')">
        <i class="pi pi-clock stat-ico" style="color: var(--p-red-500)" />
        <div>
          <div class="stat-val" style="color: var(--p-red-500)">{{ countByStatus('M') }}</div>
          <div class="stat-lbl">Menunggu</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer" @click="setFilter('P')">
        <i class="pi pi-spin pi-spinner stat-ico" style="color: var(--p-orange-500)" />
        <div>
          <div class="stat-val" style="color: var(--p-orange-500)">{{ countByStatus('P') }}</div>
          <div class="stat-lbl">Proses</div>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer" @click="setFilter('C')">
        <i class="pi pi-check-circle stat-ico" style="color: var(--p-green-500)" />
        <div>
          <div class="stat-val" style="color: var(--p-green-500)">{{ countByStatus('C') }}</div>
          <div class="stat-lbl">Selesai</div>
        </div>
      </div>
    </div>

    <!-- ══ FILTER ══ -->
    <Panel header="Filter &amp; Pencarian" toggleable class="mb-2">
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-lbl">Tanggal Awal</label>
          <DatePicker
            v-model="tanggalAwal"
            dateFormat="dd/mm/yy"
            placeholder="Tanggal awal..."
            showIcon
            iconDisplay="input"
            showButtonBar
            class="w-full"
          />
        </div>
        <div class="filter-group">
          <label class="filter-lbl">Tanggal Akhir</label>
          <DatePicker
            v-model="tanggalAkhir"
            dateFormat="dd/mm/yy"
            placeholder="Tanggal akhir..."
            showIcon
            iconDisplay="input"
            showButtonBar
            class="w-full"
          />
        </div>
        <div class="filter-group filter-group-grow">
          <label class="filter-lbl">Cari</label>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Nama / NOMR / DPJP / Poli..."
              class="w-full"
            />
          </IconField>
        </div>
        <div class="filter-group">
          <label class="filter-lbl">Status</label>
          <Select
            v-model="activeFilter"
            :options="filterOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          >
            <template #value="{ value }">
              <div v-if="value" style="display: flex; align-items: center; gap: 7px">
                <span class="status-select-dot" :class="statusSelectDot(value)"></span>
                <span>{{ filterOptions.find((o) => o.value === value)?.label }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div style="display: flex; align-items: center; gap: 8px">
                <span class="status-select-dot" :class="statusSelectDot(option.value)"></span>
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Select>
        </div>
        <div class="filter-group">
          <label class="filter-lbl">Jenis Rawat</label>
          <Select
            v-model="filterJenisRawat"
            :options="jenisRawatOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
        <div class="filter-actions">
          <Button icon="pi pi-search" label="Cari" :loading="loading" @click="fetchResep" />
          <Button
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            v-tooltip.top="'Reset pencarian &amp; tanggal (status tetap)'"
            @click="resetFilter"
          />
        </div>
      </div>
    </Panel>

    <!-- ══ FILTER RUANGAN & DOKTER ══ -->
    <Panel toggleable class="mb-2">
      <template #header="{ class: cls }">
        <div :class="cls" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap">
          <span>Filter Ruangan &amp; Dokter</span>
          <template v-if="filterRuangan.length > 0 || filterDokter.length > 0">
            <Tag
              v-for="r in filterRuangan"
              :key="'r-' + r"
              :value="r"
              severity="info"
              style="font-size: 11px; font-weight: 500"
            />
            <Tag
              v-for="d in filterDokter"
              :key="'d-' + d"
              :value="d"
              severity="success"
              style="font-size: 11px; font-weight: 500"
            />
          </template>
        </div>
      </template>
      <div class="filter-grid">
        <div class="filter-group filter-group-grow">
          <label class="filter-lbl">Ruangan</label>
          <MultiSelect
            v-model="filterRuangan"
            :options="ruanganOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua ruangan..."
            display="chip"
            filter
            showClear
            class="w-full"
          />
        </div>
        <div class="filter-group filter-group-grow">
          <label class="filter-lbl">Dokter</label>
          <MultiSelect
            v-model="filterDokter"
            :options="dokterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua dokter..."
            display="chip"
            filter
            showClear
            class="w-full"
          />
        </div>
      </div>
    </Panel>

    <!-- ══ BANNER RESEP BARU ══ -->
    <Transition name="banner-slide">
      <div v-if="showNewBanner && newResepCount > 0" class="new-resep-banner">
        <i class="pi pi-bell" style="font-size: 1.1rem; flex-shrink: 0" />
        <span style="flex: 1; min-width: 0">
          <b>{{ newResepCount }} resep baru</b> masuk sejak terakhir cek
        </span>
        <button class="banner-dismiss-btn" @click="showNewBanner = false">
          <i class="pi pi-eye" style="font-size: 11px" /> Tampilkan
        </button>
        <button class="banner-close-btn" @click="dismissBanner" title="Tutup &amp; hapus highlight">
          <i class="pi pi-times" />
        </button>
      </div>
    </Transition>

    <!-- ══ TABLE ══ -->
    <DataTable
      :value="filteredResep"
      size="small"
      stripedRows
      scrollable
      scrollHeight="62vh"
      :paginator="true"
      :rows="50"
      :rowsPerPageOptions="[25, 50, 100]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      currentPageReportTemplate="{first}–{last} dari {totalRecords} resep"
      :rowClass="rowClass"
      rowHover
      showGridlines
    >
      <template #header>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <!-- Baris 1: judul + kolom toggle -->
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 6px;
            "
          >
            <span style="font-weight: 700; font-size: 13px">
              <i class="pi pi-list me-1" />Daftar Resep
              <Tag
                :value="
                  formatTanggalDisplay(tanggalAwal) +
                  (tanggalAkhir ? ' – ' + formatTanggalDisplay(tanggalAkhir) : '')
                "
                severity="secondary"
                style="font-size: 12px; margin-left: 6px"
              />
            </span>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
              <Tag
                :value="`${filteredResep.length}${filteredResep.length !== resepByLokasi.length ? ' / ' + resepByLokasi.length : ''} resep`"
                severity="info"
                style="font-size: 12px"
              />
              <MultiSelect
                v-model="visibleCols"
                :options="allColumns"
                optionLabel="label"
                optionValue="key"
                placeholder="Kolom"
                display="chip"
                size="small"
                style="max-width: 240px; font-size: 11px"
                v-tooltip.top="'Atur kolom yang tampil'"
              >
                <template #header>
                  <div
                    style="
                      padding: 6px 12px;
                      font-size: 11px;
                      font-weight: 700;
                      color: var(--p-text-muted-color);
                    "
                  >
                    Pilih Kolom
                  </div>
                </template>
              </MultiSelect>
            </div>
          </div>

          <!-- Baris 2: badge kelompok usia (klikable) -->
          <div v-if="baseFilteredResep.length > 0" class="usia-bar">
            <span class="usia-label">Usia:</span>

            <span v-for="(cfg, key) in usiaConfig" :key="key" class="usia-chip-wrapper">
              <span
                class="usia-chip"
                :class="[
                  cfg.cls,
                  {
                    'usia-chip-active': filterUsia === key,
                    'usia-chip-zero': kelompokUsia[key] === 0,
                  },
                ]"
                @click="toggleFilterUsia(key)"
              >
                <i :class="['pi', cfg.icon]" style="font-size: 9px" />
                {{ cfg.label }} <b>({{ kelompokUsia[key] }})</b>
              </span>
              <div class="usia-tooltip">
                <div class="usia-tt-title" :style="{ color: cfg.color }">{{ cfg.label }}</div>
                <div class="usia-tt-row">
                  <span class="usia-tt-lbl">Rentang</span>
                  <span>{{ cfg.rentang }}</span>
                </div>
                <div class="usia-tt-row">
                  <span class="usia-tt-lbl">Jumlah</span>
                  <b>{{ kelompokUsia[key] }} pasien</b>
                </div>
                <div class="usia-tt-row">
                  <span class="usia-tt-lbl">Proporsi</span>
                  <b>{{ tooltipPersen(key) }}%</b>
                </div>
                <div class="usia-tt-bar">
                  <div
                    class="usia-tt-bar-fill"
                    :style="{ width: tooltipPersen(key) + '%', background: cfg.color }"
                  ></div>
                </div>
              </div>
            </span>

            <span
              v-if="kelompokUsia.tidakDiketahui > 0"
              class="usia-chip usia-unknown"
              style="cursor: default"
            >
              — <b>({{ kelompokUsia.tidakDiketahui }})</b>
            </span>

            <span v-if="filterUsia" class="usia-clear" @click="filterUsia = null">
              <i class="pi pi-times" style="font-size: 9px" /> Reset
            </span>
          </div>
        </div>
      </template>

      <template #empty>
        <div style="text-align: center; padding: 40px 0; color: var(--p-text-muted-color)">
          <i
            class="fas fa-prescription-bottle-alt"
            style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px"
          />
          <div style="font-weight: 600">Tidak ada data resep</div>
          <small>Pilih tanggal dan klik Cari untuk memuat data</small>
        </div>
      </template>

      <!-- # -->
      <Column header="#" style="width: 40px">
        <template #body="{ index }">
          <span style="font-size: 11px; font-weight: 600; color: var(--p-text-muted-color)">{{
            index + 1
          }}</span>
        </template>
      </Column>

      <!-- Flag: Obat Pulang -->
      <Column
        v-if="isCol('pbj')"
        header="PBJ"
        style="width: 42px; text-align: center"
        field="OBAT_PULANG"
        sortable
      >
        <template #body="{ data }">
          <span v-if="data.OBAT_PULANG === 'YA'" class="pbj-ya" v-tooltip.top="'Obat Pulang'"
            >YA</span
          >
        </template>
      </Column>

      <!-- NOMR -->
      <Column v-if="isCol('nomr')" field="NOMR" header="NOMR" style="width: 90px" sortable>
        <template #body="{ data }">
          <Tag
            :value="data.NOMR || '–'"
            severity="secondary"
            style="font-family: monospace; font-size: 11px; font-weight: 700"
          />
        </template>
      </Column>

      <!-- Nama -->
      <Column
        v-if="isCol('nama')"
        field="NAMA"
        header="NAMA PASIEN"
        style="min-width: 190px"
        sortable
      >
        <template #body="{ data }">
          <div class="nama-cell">
            <span style="font-weight: 600; font-size: 12px">{{ data.NAMA }}</span>
            <div class="nama-sub">
              <span style="font-size: 12px; color: var(--p-text-muted-color)">{{ data.USIA }}</span>
              <span :class="['gender-icon', data.JENISKELAMIN === 'L' ? 'male' : 'female']">
                {{ data.JENISKELAMIN === 'L' ? '♂' : '♀' }}
              </span>
              <Tag
                v-if="data.STTS_PRB"
                :value="data.STTS_PRB"
                severity="warn"
                style="font-size: 11px; padding: 1px 4px"
              />
            </div>
          </div>
        </template>
      </Column>

      <!-- No Register -->
      <Column
        v-if="isCol('noreg')"
        field="NOREGISTER"
        header="NO REG"
        style="min-width: 115px"
        sortable
      >
        <template #body="{ data }">
          <span style="font-size: 11px; font-family: monospace; color: var(--p-text-muted-color)">{{
            data.NOREGISTER
          }}</span>
        </template>
      </Column>

      <!-- Alamat -->
      <Column
        v-if="isCol('alamat')"
        field="ALAMAT"
        header="ALAMAT"
        style="min-width: 140px"
        sortable
      >
        <template #body="{ data }">
          <span style="font-size: 11px" :title="data.ALAMAT">{{ data.ALAMAT || '–' }}</span>
        </template>
      </Column>

      <!-- DPJP -->
      <Column v-if="isCol('dpjp')" field="DPJP" header="DPJP" style="min-width: 160px" sortable>
        <template #body="{ data }">
          <div style="display: flex; align-items: center; gap: 6px">
            <Avatar
              :label="dpjpInitial(data.DPJP)"
              shape="circle"
              size="small"
              style="
                background: var(--p-primary-100);
                color: var(--p-primary-700);
                font-size: 12px;
                font-weight: 700;
                flex-shrink: 0;
              "
            />
            <span style="font-size: 11px; font-weight: 600" :title="data.DPJP">{{
              data.DPJP || '—'
            }}</span>
          </div>
        </template>
      </Column>

      <!-- Jenis Rawat -->
      <Column
        v-if="isCol('jenisrawat')"
        field="JENISRAWAT"
        header="JNS RAWAT"
        style="width: 95px"
        sortable
      >
        <template #body="{ data }">
          <Tag
            :value="data.JENISRAWAT"
            :severity="data.JENISRAWAT === 'JALAN' ? 'info' : 'warn'"
            style="font-size: 12px"
          />
        </template>
      </Column>

      <!-- Cara Bayar -->
      <Column
        v-if="isCol('carabayar')"
        field="CARABAYAR"
        header="CARA BAYAR"
        style="min-width: 155px"
        sortable
      >
        <template #body="{ data }">
          <span style="font-size: 11px">{{ data.CARABAYAR }}</span>
        </template>
      </Column>

      <!-- Poli/Ruang -->
      <Column
        v-if="isCol('poli')"
        field="POLI_RUANG"
        header="POLI/RUANG"
        style="width: 90px"
        sortable
      >
        <template #body="{ data }">
          <Tag :value="data.POLI_RUANG" severity="secondary" style="font-size: 12px" />
        </template>
      </Column>

      <!-- Masuk -->
      <Column
        v-if="isCol('masuk')"
        field="MASUK"
        header="MASUK"
        style="width: 60px; text-align: center"
        sortable
      >
        <template #body="{ data }">
          <span style="font-family: monospace; font-size: 11px">{{
            extractTime(data.JAM_KIRIM_RESEP)
          }}</span>
        </template>
      </Column>

      <!-- Selesai -->
      <Column
        v-if="isCol('selesai')"
        field="WAKTU_SELESAI"
        header="SELESAI"
        style="width: 60px; text-align: center"
        sortable
      >
        <template #body="{ data }">
          <span
            style="
              font-family: monospace;
              font-size: 11px;
              font-weight: 700;
              color: var(--p-green-600);
            "
            >{{ extractTime(data.WAKTU_SELESAI) }}</span
          >
        </template>
      </Column>

      <!-- Waktu Tunggu -->
      <Column
        v-if="isCol('waktu_tunggu')"
        field="_tunggu_menit"
        header="TUNGGU"
        style="width: 72px; text-align: center"
        sortable
      >
        <template #body="{ data }">
          <span
            :class="['tunggu-badge', waktuTungguClass(data)]"
            :title="data.STATUS_PROGRESS !== 'C' ? 'Masih berjalan' : ''"
          >
            {{ calcWaktuTunggu(data) }}
          </span>
        </template>
      </Column>

      <!-- Tanggal -->
      <Column v-if="isCol('tanggal')" field="TANGGAL" header="TANGGAL" style="width: 95px" sortable>
        <template #body="{ data }">
          <span style="font-size: 11px; color: var(--p-text-muted-color)">{{
            formatTanggal(data.TANGGAL)
          }}</span>
        </template>
      </Column>
      <!-- Status -->
      <Column header="STS" style="width: 44px; text-align: center">
        <template #body="{ data }">
          <span
            class="status-dot"
            :class="statusDotClass(data.STATUS_PROGRESS)"
            :title="statusLabel(data.STATUS_PROGRESS)"
          />
        </template>
      </Column>

      <!-- Panggil -->
      <Column header="PANGGIL" style="width: 56px; min-width: 56px; text-align: center">
        <template #header>
          <div style="text-align: center; width: 100%">
            <i
              class="fa-solid fa-bullhorn"
              style="font-size: 11px; color: var(--p-text-muted-color)"
            />
          </div>
        </template>
        <template #body="{ data }">
          <div style="display: flex; justify-content: center">
            <Button
              v-if="!['INAP', 'IGD'].includes((data.JENISRAWAT || '').toUpperCase())"
              icon="fa-solid fa-bullhorn"
              size="small"
              severity="warn"
              text
              rounded
              :loading="data._panggilLoading"
              v-tooltip.left="'Panggil Pasien'"
              @click="konfirmasiPanggil(data)"
            />
          </div>
        </template>
      </Column>

      <!-- Aksi -->
      <Column header="AKSI" style="width: 56px; min-width: 56px" class="col-aksi">
        <template #header>
          <div style="text-align: center; width: 100%">
            <i class="pi pi-cog" style="font-size: 11px; color: var(--p-text-muted-color)" />
          </div>
        </template>
        <template #body="{ data }">
          <div style="display: flex; justify-content: center">
            <Button
              icon="pi pi-ellipsis-v"
              size="small"
              severity="info"
              text
              rounded
              v-tooltip.left="'Tindakan Resep'"
              @click="openActionDialog(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- ══ ANALYTICS ══ -->
    <Panel toggleable :collapsed="analyticsCollapsed" class="mt-2" @toggle="onAnalyticsToggle">
      <template #header>
        <span style="font-weight: 700; font-size: 13px">
          <i class="pi pi-chart-bar" style="margin-right: 6px" />Analitik Waktu Tunggu
          <span
            v-if="analyticsSummary.totalWait > 0"
            style="
              font-size: 11px;
              font-weight: 400;
              color: var(--p-text-muted-color);
              margin-left: 8px;
            "
          >
            {{ analyticsSummary.totalWait }} resep selesai
            <template v-if="analyticsSummary.singleAvg !== null">
              · rata-rata {{ formatMenit(analyticsSummary.singleAvg) }}
            </template>
          </span>
        </span>
      </template>

      <!-- ── Threshold Strip ── -->
      <div class="thresh-strip mb-2">
        <span class="thresh-title">Standar SPM</span>
        <div class="thresh-item">
          <span class="thresh-label">Non-Racikan</span>
          <span class="thresh-badge thresh-warn">⚠ &gt;20 mnt</span>
          <span class="thresh-badge thresh-limit">✕ &gt;30 mnt</span>
        </div>
        <div class="thresh-div" />
        <div class="thresh-item">
          <span class="thresh-label">Racikan</span>
          <span class="thresh-badge thresh-warn">⚠ &gt;45 mnt</span>
          <span class="thresh-badge thresh-limit">✕ &gt;60 mnt</span>
        </div>
      </div>

      <!-- ── Per Jenis Rawat ── -->
      <template v-for="group in analyticsGroups" :key="group.label">
        <div v-if="analyticsGroups.length > 1" class="an-group-header">
          <i class="pi pi-tag" style="margin-right: 5px; font-size: 11px" />{{ group.label }}
          <span class="an-group-sub"
            >{{ group.stats.waitCount }} resep selesai · rata-rata
            {{ formatMenit(group.stats.avg) }}</span
          >
        </div>

        <!-- Stat cards -->
        <div class="an-stat-row">
          <div class="an-stat-card">
            <i class="pi pi-clock an-stat-ico" style="color: #3b82f6" />
            <div>
              <div class="an-stat-val an-stat-val-time">{{ formatMenit(group.stats.avg) }}</div>
              <div class="an-stat-lbl">Rata-rata Tunggu</div>
            </div>
          </div>
          <div class="an-stat-card">
            <i class="pi pi-bolt an-stat-ico" style="color: #22c55e" />
            <div>
              <div class="an-stat-val an-stat-val-time" style="color: #15803d">
                {{ formatMenit(group.stats.min) }}
              </div>
              <div class="an-stat-lbl">Tercepat</div>
            </div>
          </div>
          <div class="an-stat-card">
            <i class="pi pi-hourglass an-stat-ico" style="color: #ef4444" />
            <div>
              <div class="an-stat-val an-stat-val-time" style="color: #dc2626">
                {{ formatMenit(group.stats.max) }}
              </div>
              <div class="an-stat-lbl">Terlama</div>
            </div>
          </div>
          <div class="an-stat-card">
            <i class="pi pi-check-circle an-stat-ico" style="color: #22c55e" />
            <div>
              <div class="an-stat-val" style="color: #15803d">
                {{ group.stats.pctOnTime30 }}<span class="an-stat-unit">%</span>
              </div>
              <div class="an-stat-lbl">Selesai ≤30 mnt</div>
            </div>
          </div>
          <div class="an-stat-card">
            <i class="pi pi-chart-pie an-stat-ico" style="color: #f97316" />
            <div>
              <div class="an-stat-val">
                {{ group.stats.pctOnTime60 }}<span class="an-stat-unit">%</span>
              </div>
              <div class="an-stat-lbl">Selesai ≤60 mnt</div>
            </div>
          </div>
          <div class="an-stat-card">
            <i class="pi pi-exclamation-triangle an-stat-ico" style="color: #ef4444" />
            <div>
              <div class="an-stat-val" style="color: #dc2626">
                {{ group.stats.pctLewat }}<span class="an-stat-unit">%</span>
              </div>
              <div class="an-stat-lbl">
                Lewat Target
                <span
                  v-if="group.stats.lewatTarget > 0"
                  style="display: block; font-size: 10px; color: #dc2626; font-weight: 700"
                >
                  {{ group.stats.lewatTarget }} resep &gt;60 mnt
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts row 1 -->
        <div v-if="chartsReady" class="an-chart-row">
          <div class="an-chart-box" style="flex: 0 0 230px">
            <div class="an-chart-title">Distribusi Status</div>
            <VChart :option="group.statusOption" autoresize style="height: 220px" />
          </div>
          <div class="an-chart-box" style="flex: 1; min-width: 260px">
            <div class="an-chart-title">
              Distribusi Waktu Tunggu <span class="an-chart-sub">(resep selesai)</span>
            </div>
            <VChart :option="group.bracketOption" autoresize style="height: 220px" />
          </div>
        </div>

        <!-- Chart row 2: per poli -->
        <div v-if="chartsReady && group.stats.waitCount > 0" class="an-chart-box mt-2">
          <div class="an-chart-title">
            Rata-rata Waktu Tunggu per Poli / Ruang
            <span class="an-chart-sub">(hanya resep selesai, maks 12 teratas)</span>
          </div>
          <VChart
            :option="group.poliOption"
            autoresize
            :style="{ height: group.poliHeight + 'px' }"
          />
        </div>
        <div
          v-else
          style="
            text-align: center;
            padding: 16px 0;
            color: var(--p-text-muted-color);
            font-size: 13px;
          "
        >
          <i class="pi pi-info-circle" style="margin-right: 5px" />Belum ada resep selesai untuk
          dianalisis
        </div>

        <div
          v-if="analyticsGroups.length > 1 && group !== analyticsGroups[analyticsGroups.length - 1]"
          style="border-top: 1px solid var(--p-surface-200); margin: 16px 0"
        />
      </template>
    </Panel>

    <!-- ══ ACTION DIALOG ══ -->
    <ResepActionDialog
      v-model:visible="actionDialogVisible"
      :resep="actionDialogResep"
      :actions="
        actionDialogResep?.STATUS_PROGRESS === 'C' ? ['preview', 'update'] : ['preview', 'proses']
      "
      @action="handleResepAction"
    />

    <!-- ══ PANGGIL DIALOG ══ -->
    <Dialog
      v-model:visible="showPanggilanDialog"
      modal
      header="Konfirmasi Panggilan"
      :style="{ width: '400px' }"
    >
      <div v-if="resepToCall" style="display: flex; flex-direction: column; gap: 12px">
        <div
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--p-surface-100);
            border-radius: 8px;
          "
        >
          <i
            class="fa-solid fa-bullhorn"
            style="font-size: 1.6rem; color: var(--p-orange-500); flex-shrink: 0"
          />
          <div>
            <div style="font-weight: 700; font-size: 14px">{{ resepToCall.NAMA }}</div>
            <div style="font-size: 12px; color: var(--p-text-muted-color)">
              No. Antrian: <strong>{{ resepToCall.NOMORANTRIAN || '–' }}</strong> &nbsp;|&nbsp;
              Poli: {{ resepToCall.POLI_RUANG || '–' }}
            </div>
          </div>
        </div>
        <p style="font-size: 13px; color: var(--p-text-muted-color); margin: 0">
          Sistem akan memanggil pasien ini melalui display antrian farmasi.
        </p>
      </div>
      <template #footer>
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showPanggilanDialog = false"
        />
        <Button
          label="Panggil Sekarang"
          icon="fa-solid fa-bullhorn"
          severity="warn"
          :loading="panggilLoading"
          @click="eksekusiPanggil"
        />
      </template>
    </Dialog>

    <!-- ══ FOOTER LEGEND ══ -->
    <div class="footer-legend mt-2">
      <div class="legend">
        <span class="legend-item"><span class="legend-dot dot-danger" /> Menunggu</span>
        <span class="legend-item"><span class="legend-dot dot-warn" /> Proses</span>
        <span class="legend-item"><span class="legend-dot dot-success" /> Selesai</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px">
        <span style="font-size: 0.72rem; color: var(--p-text-muted-color)">
          {{ authStore.id_client }} — Production
        </span>
        <Button label="Antrian Pasien" icon="pi pi-list" size="small" severity="info" outlined />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import ResepActionDialog from './ResepActionDialog.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import DatePicker from 'primevue/datepicker'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'
import Panel from 'primevue/panel'
import Dialog from 'primevue/dialog'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
use([CanvasRenderer, PieChart, BarChart, TooltipComponent, LegendComponent, GridComponent])

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi } = storeToRefs(authStore)
const toast = useToast()
const router = useRouter()

/* ── Panggil Pasien ── */
const showPanggilanDialog = ref(false)
const resepToCall = ref(null)
const panggilLoading = ref(false)

const konfirmasiPanggil = (data) => {
  resepToCall.value = data
  showPanggilanDialog.value = true
}

const eksekusiPanggil = async () => {
  if (!resepToCall.value) return
  showPanggilanDialog.value = false
  await panggilPasienFarmasi(resepToCall.value)
  resepToCall.value = null
}

const panggilPasienFarmasi = async (data) => {
  panggilLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      channel: `channel2${id_client.value}`,
      event: 'antrian_farmasi',
      NOMOR_ANTRIAN: data.NOMORANTRIAN,
      ANGKA_ANTRIAN: parseInt(data.AN_POLI) || 0,
      JENIS_ANTRIAN: data.NOMORANTRIAN?.charAt(0) ?? '',
      ANGKA_ANTRIAN_POLI: parseInt(data.AN_POLI) || 0,
      NAMA_PASIEN: data.NAMA,
      POLI: data.POLI_RUANG,
    }

    await axios.post(`${url}/index.php/api/data_referensi/push_to_pusher_v2/`, payload)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: `${data.NAMA} berhasil dipanggil`,
      life: 3000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memanggil pasien, coba lagi',
      life: 3000,
    })
  } finally {
    panggilLoading.value = false
  }
}

/* ── Action Dialog ── */
const actionDialogVisible = ref(false)
const actionDialogResep = ref(null)

const openActionDialog = (data) => {
  if (data.STATUS_PROGRESS === 'P') {
    handleProsesResep(data)
    return
  }
  actionDialogResep.value = data
  actionDialogVisible.value = true
}

const handleResepAction = async ({ action, resep, timestamp, elapsedMenit }) => {
  if (action === 'preview') {
    handleProsesResep(resep, { preview: true })
    return
  }

  if (action === 'update') {
    handleProsesResep(resep)
    return
  }

  const statusMap = { proses: 'P', selesai: 'C' }
  const newStatus = statusMap[action]
  if (!newStatus) return

  try {
    loading.value = true
    const url = configStore.apiApotikUrl

    const payload = {
      trans: resep.TRANS,
      status: newStatus,
      jam: timestamp,
      id_client: id_client.value,
    }

    const res = await axios.post(`${url}/index.php/api/sales/update_status_penunjang`, payload)
    const code = res.data?.metadata?.code

    if (String(code) === '200') {
      if (newStatus === 'P') {
        handleProsesResep(resep)
      } else {
        toast.add({
          severity: 'success',
          summary: 'Resep Selesai',
          detail: `${resep.NAMA} — ${elapsedMenit} mnt`,
          life: 3000,
        })
        await fetchResep()
      }
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Gagal Update',
        detail: res.data?.metadata?.message || 'Server tidak memberikan konfirmasi',
        life: 4000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal update status resep',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const loading = ref(false)
const allResep = ref([])
const newResepIds = ref(new Set())
const newResepCount = ref(0)
const showNewBanner = ref(false)
const countdown = ref(60)
const searchQuery = ref('')
const activeFilter = ref('ALL')

const today = new Date()
const tanggalAwal = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
const tanggalAkhir = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))

let autoRefreshTimer = null
let countdownTimer = null

const startAutoRefresh = () => {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  countdown.value = 20
  autoRefreshTimer = setInterval(fetchResep, 20000)
  countdownTimer = setInterval(() => {
    countdown.value = Math.max(0, countdown.value - 1)
  }, 1000)
}

const filterOptions = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Memunggu', value: 'M' },
  { label: 'Proses', value: 'P' },
  { label: 'Selesai', value: 'C' },
]

/* ── Column toggle ── */
const allColumns = [
  { key: 'pbj', label: 'PBJ' },
  { key: 'nomr', label: 'NOMR' },
  { key: 'nama', label: 'Nama Pasien' },
  { key: 'noreg', label: 'No Register' },
  { key: 'alamat', label: 'Alamat' },
  { key: 'dpjp', label: 'DPJP' },
  { key: 'jenisrawat', label: 'Jns Rawat' },
  { key: 'carabayar', label: 'Cara Bayar' },
  { key: 'poli', label: 'Poli/Ruang' },
  { key: 'masuk', label: 'Masuk' },
  { key: 'proses', label: 'Proses' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'waktu_tunggu', label: 'Waktu Tunggu' },
  { key: 'tanggal', label: 'Tanggal' },
]

const STORAGE_KEY = 'resep_visible_cols'

const loadVisibleCols = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      const validKeys = allColumns.map((c) => c.key)
      const filtered = parsed.filter((k) => validKeys.includes(k))
      if (filtered.length > 0) return filtered
    }
  } catch (e) {
    /* ignore */
  }
  return allColumns.map((c) => c.key)
}

const visibleCols = ref(loadVisibleCols())

watch(
  visibleCols,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true },
)

const isCol = (key) => visibleCols.value.includes(key)

const filterJenisRawat = ref(null)

const jenisRawatOptions = [
  { label: 'Semua', value: null },
  { label: 'Rawat Jalan', value: 'JALAN' },
  { label: 'Rawat Inap', value: 'INAP' },
]

/* ── Filter Ruangan & Dokter ── */
const filterRuangan = ref([])
const filterDokter = ref([])

const formatDateParam = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatTanggal = (val) => {
  if (!val) return '–'
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const extractTime = (val) => {
  if (!val) return '–'
  const match = String(val).match(/(\d{2}:\d{2})/)
  return match ? match[1] : '–'
}

const waktuTungguClass = (data) => {
  if (!data.JAM_KIRIM_RESEP) return ''
  const start = new Date(data.JAM_KIRIM_RESEP)
  if (isNaN(start)) return ''
  const end =
    data.STATUS_PROGRESS === 'C' && data.WAKTU_SELESAI ? new Date(data.WAKTU_SELESAI) : new Date()
  const menit = Math.floor((end - start) / 60000)
  if (menit <= 30) return 'tunggu-ok'
  if (menit <= 60) return 'tunggu-warn'
  return 'tunggu-danger'
}

const MAX_TUNGGU_MENIT = 23 * 60 + 59 // 1439 — cap display/sort at 23j 59m

const calcWaktuTunggu = (data) => {
  if (!data.JAM_KIRIM_RESEP) return '–'
  const start = new Date(data.JAM_KIRIM_RESEP)
  if (isNaN(start)) return '–'

  const end =
    data.WAKTU_SELESAI && data.STATUS_PROGRESS === 'C' ? new Date(data.WAKTU_SELESAI) : new Date()

  const diffMs = end - start
  if (diffMs < 0) return '–'
  const totalMenit = Math.min(Math.floor(diffMs / 60000), MAX_TUNGGU_MENIT)
  if (totalMenit < 60) return `${totalMenit} mnt`
  const jam = Math.floor(totalMenit / 60)
  const menit = totalMenit % 60
  return `${jam}j ${String(menit).padStart(2, '0')}m`
}

const calcWaktuTungguMenit = (data) => {
  if (!data.JAM_KIRIM_RESEP) return Infinity
  const start = new Date(data.JAM_KIRIM_RESEP)
  if (isNaN(start)) return Infinity
  const end =
    data.WAKTU_SELESAI && data.STATUS_PROGRESS === 'C' ? new Date(data.WAKTU_SELESAI) : new Date()
  const diffMs = end - start
  if (diffMs < 0) return Infinity
  return Math.min(Math.floor(diffMs / 60000), MAX_TUNGGU_MENIT)
}

const formatMenit = (m) => {
  if (m === null || m === undefined || isNaN(m)) return '–'
  if (m < 60) return `${m} mnt`
  const jam = Math.floor(m / 60)
  const sisa = m % 60
  return sisa > 0 ? `${jam}j ${sisa}mnt` : `${jam} jam`
}

const formatTanggalDisplay = (val) => {
  if (!val) return '–'
  return new Date(val).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const statusSelectDot = (val) => {
  if (val === 'C') return 'ssd-success'
  if (val === 'P') return 'ssd-warn'
  if (val === 'M') return 'ssd-danger'
  return 'ssd-all'
}

const statusDotClass = (s) => {
  if (s === 'C') return 'dot-success'
  if (s === 'P') return 'dot-warn'
  return 'dot-danger'
}

const statusLabel = (s) => {
  if (s === 'C') return 'Selesai'
  if (s === 'P') return 'Proses'
  return 'Menunggu'
}

const resepByLokasi = computed(() => {
  if (!id_lokasi.value) return allResep.value
  return allResep.value.filter((r) => String(r.ID_LOKASI) === String(id_lokasi.value))
})

const ruanganOptions = computed(() => {
  let data = resepByLokasi.value
  if (filterDokter.value.length > 0) {
    data = data.filter((r) => filterDokter.value.includes(r.DPJP))
  }
  const set = new Set(data.map((r) => r.POLI_RUANG).filter(Boolean))
  return [...set].sort().map((v) => ({ label: v, value: v }))
})

const dokterOptions = computed(() => {
  let data = resepByLokasi.value
  if (filterRuangan.value.length > 0) {
    data = data.filter((r) => filterRuangan.value.includes(r.POLI_RUANG))
  }
  const set = new Set(data.map((r) => r.DPJP).filter(Boolean))
  return [...set].sort().map((v) => ({ label: v, value: v }))
})

// Buang pilihan yang sudah tidak ada di daftar opsi setelah filter silang berubah.
// Hanya assign ulang saat benar-benar ada yang terbuang, supaya tidak memicu
// loop reaktif tak berujung antara ruanganOptions <-> dokterOptions.
watch(ruanganOptions, (opts) => {
  const valid = new Set(opts.map((o) => o.value))
  const next = filterRuangan.value.filter((v) => valid.has(v))
  if (next.length !== filterRuangan.value.length) {
    filterRuangan.value = next
  }
})

watch(dokterOptions, (opts) => {
  const valid = new Set(opts.map((o) => o.value))
  const next = filterDokter.value.filter((v) => valid.has(v))
  if (next.length !== filterDokter.value.length) {
    filterDokter.value = next
  }
})

const countByStatus = (status) => {
  if (status === 'M')
    return resepByLokasi.value.filter((r) => r.STATUS_PROGRESS !== 'C' && r.STATUS_PROGRESS !== 'P')
      .length
  return resepByLokasi.value.filter((r) => r.STATUS_PROGRESS === status).length
}

const setFilter = (f) => {
  activeFilter.value = f
}

const rowClass = (data) => ({
  'row-selesai': data.STATUS_PROGRESS === 'C',
  'row-proses': data.STATUS_PROGRESS === 'P',
  'row-menunggu': data.STATUS_PROGRESS !== 'C' && data.STATUS_PROGRESS !== 'P',
  'row-new': newResepIds.value.has(`${data.NOREGISTER}|${data.JAM_KIRIM_RESEP}`),
})

const dismissBanner = () => {
  showNewBanner.value = false
  newResepIds.value = new Set()
}

const handleProsesResep = (data, { preview = false } = {}) => {
  const tgl = data.TANGGAL ? String(data.TANGGAL).split(' ')[0] : ''
  const resolved = router.resolve({
    name: 'ProsesResepView',
    params: { trans: data.TRANS },
    query: {
      nomr: data.NOMR ?? '',
      noregister: data.NOREGISTER ?? '',
      tanggal: tgl,
      nama: data.NAMA ?? '',
      poli: data.POLI_RUANG ?? '',
      ...(preview ? { preview: '1' } : {}),
    },
  })

  window.open(resolved.href, '_blank')
}

// AudioContext dibuat sekali saat user pertama klik, lalu disimpan agar
// bisa dipakai dari setInterval (non-user-gesture context)
let _audioCtx = null

const initAudioCtx = () => {
  try {
    if (!_audioCtx) {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (_audioCtx.state === 'suspended') _audioCtx.resume()
  } catch {
    // browser tidak support
  }
}

const playNotifSound = () => {
  try {
    if (!_audioCtx) return
    if (_audioCtx.state === 'suspended') _audioCtx.resume()
    if (_audioCtx.state !== 'running') return

    const ctx = _audioCtx
    const master = ctx.createGain()
    master.gain.value = 0.45
    master.connect(ctx.destination)

    const tone = (freq, start, dur) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      osc.connect(env)
      env.connect(master)
      osc.type = 'sine'
      osc.frequency.value = freq
      env.gain.setValueAtTime(0, start)
      env.gain.linearRampToValueAtTime(1, start + 0.01)
      env.gain.exponentialRampToValueAtTime(0.001, start + dur)
      osc.start(start)
      osc.stop(start + dur)
    }

    tone(880, ctx.currentTime, 0.35)
    tone(1100, ctx.currentTime + 0.22, 0.45)
  } catch {
    // ignore
  }
}

const dpjpInitial = (name) => {
  if (!name) return '?'
  const clean = name.replace(/^dr\.?\s*/i, '').trim()
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

/* ── Kelompok Usia ── */
const filterUsia = ref(null)

const parseUsiaToMonths = (usiaStr) => {
  if (!usiaStr) return null
  const s = String(usiaStr).toLowerCase()
  const tahun = s.match(/(\d+)\s*(thn|tah|tahun|th\b)/)
  const bulan = s.match(/(\d+)\s*(bln|bul|bulan)/)
  const hari = s.match(/(\d+)\s*(hr|hari)/)
  if (!tahun && !bulan && !hari) {
    const n = parseInt(s)
    return isNaN(n) ? null : n * 12
  }
  return (
    (tahun ? parseInt(tahun[1]) * 12 : 0) +
    (bulan ? parseInt(bulan[1]) : 0) +
    (hari ? Math.floor(parseInt(hari[1]) / 30) : 0)
  )
}

const getKelompokUsia = (r) => {
  const bulan = parseUsiaToMonths(r.USIA)
  if (bulan === null) return null
  if (bulan < 12) return 'bayi'
  if (bulan < 60) return 'balita'
  if (bulan < 216) return 'remaja'
  if (bulan < 720) return 'dewasa'
  return 'lansia'
}

const toggleFilterUsia = (kelompok) => {
  filterUsia.value = filterUsia.value === kelompok ? null : kelompok
}

// baseFilteredResep: semua filter KECUALI usia — dipakai untuk hitung badge counts
const baseFilteredResep = computed(() => {
  let data = resepByLokasi.value

  if (activeFilter.value === 'M') {
    data = data.filter((r) => r.STATUS_PROGRESS !== 'C' && r.STATUS_PROGRESS !== 'P')
  } else if (activeFilter.value !== 'ALL') {
    data = data.filter((r) => r.STATUS_PROGRESS === activeFilter.value)
  }

  if (filterJenisRawat.value) {
    data = data.filter((r) => (r.JENISRAWAT || '').toUpperCase() === filterJenisRawat.value)
  }

  if (filterRuangan.value.length > 0) {
    data = data.filter((r) => filterRuangan.value.includes(r.POLI_RUANG))
  }

  if (filterDokter.value.length > 0) {
    data = data.filter((r) => filterDokter.value.includes(r.DPJP))
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    data = data.filter(
      (r) =>
        (r.NAMA || '').toLowerCase().includes(q) ||
        (r.NOMR || '').toLowerCase().includes(q) ||
        (r.NOREGISTER || '').toLowerCase().includes(q) ||
        (r.DPJP || '').toLowerCase().includes(q) ||
        (r.POLI_RUANG || '').toLowerCase().includes(q) ||
        (r.CARABAYAR || '').toLowerCase().includes(q),
    )
  }
  return data
})

// kelompokUsia dihitung dari baseFilteredResep agar badge lain tidak nol saat filter aktif
const kelompokUsia = computed(() => {
  const result = { bayi: 0, balita: 0, remaja: 0, dewasa: 0, lansia: 0, tidakDiketahui: 0 }
  baseFilteredResep.value.forEach((r) => {
    const grp = getKelompokUsia(r)
    if (!grp) result.tidakDiketahui++
    else result[grp]++
  })
  return result
})

const usiaConfig = {
  bayi: {
    label: 'Bayi',
    rentang: '0 – 11 bulan',
    icon: 'pi-heart-fill',
    cls: 'usia-bayi',
    color: '#9d174d',
  },
  balita: {
    label: 'Balita',
    rentang: '1 – 5 tahun',
    icon: 'pi-star-fill',
    cls: 'usia-balita',
    color: '#5b21b6',
  },
  remaja: {
    label: 'Remaja',
    rentang: '6 – 17 tahun',
    icon: 'pi-bolt',
    cls: 'usia-remaja',
    color: '#1d4ed8',
  },
  dewasa: {
    label: 'Dewasa',
    rentang: '18 – 59 tahun',
    icon: 'pi-user',
    cls: 'usia-dewasa',
    color: '#166534',
  },
  lansia: {
    label: 'Lansia',
    rentang: '60+ tahun',
    icon: 'pi-shield',
    cls: 'usia-lansia',
    color: '#9a3412',
  },
}

const tooltipPersen = (kelompok) => {
  const total = baseFilteredResep.value.length
  if (!total) return '0.0'
  return (((kelompokUsia.value[kelompok] ?? 0) / total) * 100).toFixed(1)
}

const filteredResep = computed(() => {
  const base = filterUsia.value
    ? baseFilteredResep.value.filter((r) => getKelompokUsia(r) === filterUsia.value)
    : baseFilteredResep.value
  return base.map((r) => ({ ...r, _tunggu_menit: calcWaktuTungguMenit(r) }))
})

/* ── Analytics ── */
const getWaitMinutes = (r) => {
  if (!r.JAM_KIRIM_RESEP || !r.WAKTU_SELESAI) return null
  const start = new Date(r.JAM_KIRIM_RESEP)
  if (isNaN(start)) return null
  const end = new Date(r.WAKTU_SELESAI)
  if (isNaN(end)) return null
  const m = Math.floor((end - start) / 60000)
  return m >= 0 ? m : null
}

const makeAnalyticsGroup = (data) => {
  const times = data.map(getWaitMinutes).filter((t) => t !== null)
  const selesai = data.filter((r) => r.STATUS_PROGRESS === 'C').length
  const proses = data.filter((r) => r.STATUS_PROGRESS === 'P').length
  const menunggu = data.filter((r) => r.STATUS_PROGRESS !== 'C' && r.STATUS_PROGRESS !== 'P').length
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0
  const min = times.length ? Math.min(...times) : 0
  const max = times.length ? Math.max(...times) : 0
  const pctOnTime30 = times.length
    ? Math.round((times.filter((t) => t <= 30).length / times.length) * 100)
    : 0
  const pctOnTime60 = times.length
    ? Math.round((times.filter((t) => t <= 60).length / times.length) * 100)
    : 0
  const lewatTarget = times.filter((t) => t > 60).length
  const pctLewat = times.length ? Math.round((lewatTarget / times.length) * 100) : 0

  const brackets = [
    { label: '≤15 mnt', min: 0, max: 15, color: '#22c55e' },
    { label: '16–30', min: 15, max: 30, color: '#84cc16' },
    { label: '31–60', min: 30, max: 60, color: '#f97316' },
    { label: '61–120', min: 60, max: 120, color: '#ef4444' },
    { label: '>120', min: 120, max: Infinity, color: '#7f1d1d' },
  ]
  const counts = brackets.map((b) => times.filter((t) => t > b.min && t <= b.max).length)

  const poliMap = {}
  data.forEach((r) => {
    const poli = r.POLI_RUANG || '—'
    const m = getWaitMinutes(r)
    if (m === null) return
    if (!poliMap[poli]) poliMap[poli] = []
    poliMap[poli].push(m)
  })
  const poliEntries = Object.entries(poliMap)
    .map(([poli, pt]) => ({
      poli,
      avg: Math.round(pt.reduce((a, b) => a + b, 0) / pt.length),
      count: pt.length,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 12)
    .reverse()

  return {
    stats: {
      avg,
      min,
      max,
      pctOnTime30,
      pctOnTime60,
      lewatTarget,
      pctLewat,
      selesai,
      proses,
      menunggu,
      total: data.length,
      waitCount: times.length,
    },
    statusOption: {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, textStyle: { fontSize: 11 }, itemWidth: 12, itemHeight: 12 },
      series: [
        {
          type: 'pie',
          radius: ['40%', '68%'],
          center: ['50%', '43%'],
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
          data: [
            { value: menunggu, name: 'Menunggu', itemStyle: { color: '#ef4444' } },
            { value: proses, name: 'Proses', itemStyle: { color: '#f97316' } },
            { value: selesai, name: 'Selesai', itemStyle: { color: '#22c55e' } },
          ],
        },
      ],
    },
    bracketOption: {
      tooltip: { trigger: 'axis', formatter: (p) => `${p[0].name}: <b>${p[0].value}</b> resep` },
      grid: { top: 24, bottom: 36, left: 32, right: 20 },
      xAxis: { type: 'category', data: brackets.map((b) => b.label), axisLabel: { fontSize: 10 } },
      yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 10 } },
      series: [
        {
          type: 'bar',
          barMaxWidth: 48,
          data: counts.map((v, i) => ({
            value: v,
            itemStyle: { color: brackets[i].color, borderRadius: [3, 3, 0, 0] },
          })),
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            fontWeight: 'bold',
            formatter: (p) => (p.value > 0 ? String(p.value) : ''),
          },
        },
      ],
    },
    poliOption: poliEntries.length
      ? {
          tooltip: {
            trigger: 'axis',
            formatter: (p) => {
              const e = poliEntries[p[0].dataIndex]
              return `${e.poli}<br/>Rata-rata: <b>${formatMenit(p[0].value)}</b><br/>Jumlah: ${e.count} resep`
            },
          },
          grid: { top: 10, bottom: 26, left: 130, right: 80 },
          xAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: (v) => formatMenit(v) } },
          yAxis: {
            type: 'category',
            data: poliEntries.map((e) => `${e.poli} (${e.count})`),
            axisLabel: { fontSize: 10, width: 120, overflow: 'truncate' },
          },
          series: [
            {
              type: 'bar',
              barMaxWidth: 20,
              data: poliEntries.map((e) => ({
                value: e.avg,
                itemStyle: {
                  color: e.avg <= 30 ? '#22c55e' : e.avg <= 60 ? '#f97316' : '#ef4444',
                  borderRadius: [0, 3, 3, 0],
                },
              })),
              label: {
                show: true,
                position: 'right',
                fontSize: 10,
                fontWeight: 'bold',
                formatter: (p) => formatMenit(p.value),
              },
            },
          ],
        }
      : {},
    poliHeight: Math.max(180, poliEntries.length * 26 + 40),
  }
}

const analyticsCollapsed = ref(true)
const chartsReady = ref(false)

const onAnalyticsToggle = async () => {
  analyticsCollapsed.value = !analyticsCollapsed.value
  if (!analyticsCollapsed.value) {
    await nextTick()
    chartsReady.value = true
  } else {
    chartsReady.value = false
  }
}

const analyticsGroups = computed(() => {
  const all = resepByLokasi.value
  if (filterJenisRawat.value) {
    const label = filterJenisRawat.value === 'JALAN' ? 'Rawat Jalan' : 'Rawat Inap'
    return [
      {
        label,
        ...makeAnalyticsGroup(
          all.filter((r) => (r.JENISRAWAT || '').toUpperCase() === filterJenisRawat.value),
        ),
      },
    ]
  }
  return [
    {
      label: 'Rawat Jalan',
      ...makeAnalyticsGroup(all.filter((r) => (r.JENISRAWAT || '').toUpperCase() === 'JALAN')),
    },
    {
      label: 'Rawat Inap',
      ...makeAnalyticsGroup(all.filter((r) => (r.JENISRAWAT || '').toUpperCase() === 'INAP')),
    },
  ]
})

const analyticsSummary = computed(() => {
  const groups = analyticsGroups.value
  const totalWait = groups.reduce((s, g) => s + g.stats.waitCount, 0)
  return { totalWait, singleAvg: groups.length === 1 ? groups[0].stats.avg : null }
})

const fetchResep = async () => {
  const savedFilter = activeFilter.value
  try {
    loading.value = true
    const url = configStore.apiApotikUrl

    const resepKey = (r) => `${r.NOREGISTER}|${r.JAM_KIRIM_RESEP}`

    const isRefresh = allResep.value.length > 0
    const prevIds = isRefresh ? new Set(allResep.value.map(resepKey).filter(Boolean)) : null

    const response = await axios.get(
      `${url}/index.php/api/sales/get_list_resep_v2/${id_client.value}/${id_lokasi.value}/${formatDateParam(tanggalAwal.value)}/${formatDateParam(tanggalAkhir.value)}/`,
    )
    const freshData = response.data?.response || []

    if (isRefresh && prevIds) {
      const newItems = freshData.filter((r) => !prevIds.has(resepKey(r)))

      if (newItems.length > 0) {
        newResepCount.value = newItems.length
        newResepIds.value = new Set(newItems.map(resepKey))
        showNewBanner.value = true
        playNotifSound()
      }
    }

    allResep.value = freshData

    if (!response.data?.response) {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: response.data?.metadata?.message || 'Data tidak ditemukan',
        life: 3000,
      })
    }
  } catch (error) {
    console.error('fetchResep:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal mengambil data resep',
      life: 4000,
    })
  } finally {
    loading.value = false
    activeFilter.value = savedFilter
    startAutoRefresh()
  }
}

const resetFilter = () => {
  searchQuery.value = ''
  filterJenisRawat.value = null
  filterRuangan.value = []
  filterDokter.value = []
  filterUsia.value = null
  tanggalAwal.value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  tanggalAkhir.value = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  fetchResep()
}

onMounted(async () => {
  await fetchResep()
})

onUnmounted(() => {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
/* ── Stat Row ── */
.stat-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius-md, 8px);
  padding: 12px 16px;
  box-shadow: var(--p-shadow-1, 0 1px 3px rgba(0, 0, 0, 0.06));
  transition: box-shadow 0.15s;
}
.stat-card:hover {
  box-shadow: var(--p-shadow-2, 0 2px 6px rgba(0, 0, 0, 0.1));
}
.stat-ico {
  font-size: 1.4rem;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}
.stat-val {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 2px;
}
.stat-lbl {
  font-size: 0.76rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

/* ── Filter Grid ── */
.filter-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 140px;
}
.filter-group-grow {
  flex: 1;
  min-width: 200px;
}
.filter-lbl {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.filter-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

/* ── Table: compact rows ── */
:deep(.p-datatable-thead > tr > th) {
  white-space: nowrap;
  font-size: 0.82rem;
  padding: 5px 8px;
}
:deep(.p-datatable-tbody > tr > td) {
  padding: 2px 8px;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 0;
  line-height: 1.3;
  font-size: 0.82rem;
}
:deep(.p-datatable-tbody > tr) {
  height: 28px;
}

/* ── Row accent (border-left pada kolom pertama) ── */
:deep(.p-datatable-tbody > tr.row-selesai > td:first-child) {
  border-left: 3px solid var(--p-green-500);
}
:deep(.p-datatable-tbody > tr.row-proses > td:first-child) {
  border-left: 3px solid var(--p-orange-500);
}
:deep(.p-datatable-tbody > tr.row-menunggu > td:first-child) {
  border-left: 3px solid var(--p-red-500);
}

/* ── Status select dot ── */
.status-select-dot {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ssd-success {
  background: var(--p-green-500);
}
.ssd-warn {
  background: var(--p-orange-400);
}
.ssd-danger {
  background: var(--p-red-500);
}
.ssd-all {
  background: var(--p-surface-400);
}

/* ── Status dot ── */
.status-dot {
  display: inline-block;
  width: 25px;
  height: 25px;
  border-radius: 30%;
  margin: auto;
}
.dot-danger {
  background: var(--p-red-500);
}
.dot-warn {
  background: var(--p-orange-400);
}
.dot-success {
  background: var(--p-green-500);
}

/* ── Nama cell ── */
.nama-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}
.nama-sub {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: nowrap;
  overflow: hidden;
  line-height: 1.2;
}
.gender-icon {
  font-size: 0.9rem;
  font-weight: 700;
}
.gender-icon.male {
  color: var(--p-blue-500);
}
.gender-icon.female {
  color: var(--p-pink-500);
}

/* ── Obat Pulang badge ── */
.pbj-ya {
  display: inline-block;
  background: #84cc16;
  color: #1a2e05;
  font-size: 12px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.03em;
}

:deep(.p-datatable-tbody > tr > td:has(.pbj-ya)) {
  background: #f7fee7 !important;
}

/* ── Footer legend ── */
/* ── Waktu Tunggu ── */
.tunggu-badge {
  display: inline-block;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}
.tunggu-ok {
  background: var(--p-green-100);
  color: var(--p-green-700);
}
.tunggu-warn {
  background: var(--p-orange-100);
  color: var(--p-orange-700);
}
.tunggu-danger {
  background: var(--p-red-100);
  color: var(--p-red-700);
}

.footer-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 12px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius-md, 6px);
  box-shadow: var(--p-shadow-1, 0 1px 3px rgba(0, 0, 0, 0.06));
}
.legend {
  display: flex;
  gap: 14px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}
.legend-dot {
  display: inline-block;
  width: 11px;
  height: 11px;
  border-radius: 3px;
}

/* ── Usia bar ── */
.usia-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.usia-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  align-self: center;
  flex-shrink: 0;
}
.usia-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    filter 0.15s,
    box-shadow 0.15s,
    opacity 0.15s;
}
.usia-chip:hover {
  filter: brightness(0.93);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}
.usia-chip b {
  font-weight: 800;
}

.usia-bayi {
  background: #fdf2f8;
  color: #9d174d;
  border-color: #fbcfe8;
}
.usia-balita {
  background: #f5f3ff;
  color: #5b21b6;
  border-color: #ddd6fe;
}
.usia-remaja {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.usia-dewasa {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}
.usia-lansia {
  background: #fff7ed;
  color: #9a3412;
  border-color: #fed7aa;
}
.usia-unknown {
  background: var(--p-surface-100);
  color: var(--p-text-muted-color);
  border-color: var(--p-surface-300);
  cursor: default;
}

/* state aktif: border tebal + shadow */
.usia-chip-active.usia-bayi {
  border-width: 2px;
  border-color: #9d174d;
  box-shadow: 0 0 0 2px #fbcfe8;
  font-weight: 700;
}
.usia-chip-active.usia-balita {
  border-width: 2px;
  border-color: #5b21b6;
  box-shadow: 0 0 0 2px #ddd6fe;
  font-weight: 700;
}
.usia-chip-active.usia-remaja {
  border-width: 2px;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px #bfdbfe;
  font-weight: 700;
}
.usia-chip-active.usia-dewasa {
  border-width: 2px;
  border-color: #166534;
  box-shadow: 0 0 0 2px #bbf7d0;
  font-weight: 700;
}
.usia-chip-active.usia-lansia {
  border-width: 2px;
  border-color: #9a3412;
  box-shadow: 0 0 0 2px #fed7aa;
  font-weight: 700;
}

/* state zero: redup, tidak bisa klik */
.usia-chip-zero {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

/* ── wrapper untuk posisi tooltip ── */
.usia-chip-wrapper {
  position: relative;
  display: inline-flex;
}

/* ── Custom tooltip popup ── */
.usia-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: #f1f5f9;
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 170px;
  white-space: nowrap;
  z-index: 9999;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  font-size: 11.5px;
}
/* panah bawah */
.usia-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1e293b;
}
/* tampilkan saat hover wrapper */
.usia-chip-wrapper:hover .usia-tooltip {
  display: block;
}

.usia-tt-title {
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 7px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.usia-tt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 3px 0;
  line-height: 1.6;
}
.usia-tt-lbl {
  color: #94a3b8;
  font-size: 10.5px;
}
.usia-tt-row b {
  font-weight: 700;
}

/* mini progress bar */
.usia-tt-bar {
  margin-top: 8px;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
}
.usia-tt-bar-fill {
  height: 100%;
  border-radius: 4px;
  min-width: 2px;
  transition: width 0.3s;
}

/* tombol reset filter usia */
.usia-clear {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  background: var(--p-surface-100);
  color: var(--p-text-muted-color);
  border: 1px solid var(--p-surface-300);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.usia-clear:hover {
  background: var(--p-surface-200);
}

/* ── Countdown badge ── */
.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 3px 9px;
  border-radius: 12px;
  white-space: nowrap;
  transition:
    background 0.3s,
    color 0.3s;
}
.cd-ok {
  background: var(--p-green-50);
  color: var(--p-green-700);
}
.cd-warn {
  background: var(--p-orange-50);
  color: var(--p-orange-700);
}
.cd-danger {
  background: var(--p-red-50);
  color: var(--p-red-700);
  animation: cd-pulse 1s ease-in-out infinite;
}
@keyframes cd-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

/* ── New Resep Banner ── */
.new-resep-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
}
.banner-dismiss-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.banner-dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
.banner-close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px 6px;
  font-size: 13px;
  line-height: 1;
  border-radius: 4px;
  transition: color 0.15s;
  flex-shrink: 0;
}
.banner-close-btn:hover {
  color: #fff;
}
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Kolom Aksi — sticky kanan ── */
:deep(.col-aksi) {
  position: sticky;
  right: 0;
  background: var(--p-surface-0);
  border-left: 1px solid var(--p-surface-200) !important;
  z-index: 1;
}
:deep(.p-datatable-tbody > tr:hover .col-aksi),
:deep(.p-datatable-tbody > tr.row-selesai .col-aksi),
:deep(.p-datatable-tbody > tr.row-proses .col-aksi),
:deep(.p-datatable-tbody > tr.row-menunggu .col-aksi) {
  background: inherit;
}
:deep(.p-datatable-tbody > tr.row-new .col-aksi) {
  background: #eff6ff;
}

/* ── Row new highlight ── */
:deep(.p-datatable-tbody > tr.row-new) {
  background: #eff6ff !important;
}
:deep(.p-datatable-tbody > tr.row-new > td:first-child) {
  border-left: 3px solid #3b82f6 !important;
}

/* ── Analytics ── */
.an-group-header {
  font-size: 12px;
  font-weight: 700;
  color: var(--p-text-color);
  background: var(--p-surface-100);
  border-left: 3px solid var(--p-primary-color);
  border-radius: 4px;
  padding: 5px 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.an-group-sub {
  font-size: 11px;
  font-weight: 400;
  color: var(--p-text-muted-color);
  margin-left: 6px;
}
.an-stat-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.an-stat-card {
  flex: 1;
  min-width: 110px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 10px 14px;
}
.an-stat-ico {
  font-size: 1.15rem;
  flex-shrink: 0;
}
.an-stat-val {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1;
  color: var(--p-text-color);
}
.an-stat-val-time {
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
}
.an-stat-unit {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
  margin-left: 2px;
}
.an-stat-lbl {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 3px;
  font-weight: 600;
}
.an-chart-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.an-chart-box {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 10px 12px;
}
.an-chart-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.an-chart-sub {
  font-weight: 400;
  text-transform: none;
  font-size: 10px;
  letter-spacing: 0;
}

/* ── Threshold Strip ── */
.thresh-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 7px 14px;
}
.thresh-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}
.thresh-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.thresh-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--p-text-color);
}
.thresh-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.thresh-warn {
  background: #fef9c3;
  color: #a16207;
}
.thresh-limit {
  background: #fee2e2;
  color: #dc2626;
}
.thresh-div {
  width: 1px;
  height: 20px;
  background: var(--p-surface-300);
  flex-shrink: 0;
}
</style>
