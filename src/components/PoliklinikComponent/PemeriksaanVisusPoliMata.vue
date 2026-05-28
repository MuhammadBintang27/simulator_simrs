<template>
  <!-- Loading -->
  <div v-if="isLoading" class="text-center p-4">
    <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
    <div class="mt-2 text-muted" style="font-size: 0.85rem">Memuat data pemeriksaan...</div>
  </div>

  <div v-else class="visus-wrap">
    <!-- ══ HERO PANEL ══ -->
    <Panel class="hero-panel">
      <div class="hero-body">
        <div class="hero-left">
          <div class="hero-icon-wrap">
            <i class="fas fa-eye"></i>
          </div>
          <div>
            <div class="hero-title">Pemeriksaan Visus & Refraksi</div>
            <div class="hero-sub">Poli Mata — Form Pemeriksaan Oftalmologi</div>
          </div>
        </div>
        <div class="hero-chips">
          <div class="hero-chip">
            <span class="chip-label">OD (Kanan)</span>
            <span class="chip-val" :class="form.visus_sc_od ? 'chip-active' : ''">
              {{ form.visus_sc_od || '—' }}
            </span>
          </div>
          <div class="hero-chip">
            <span class="chip-label">OS (Kiri)</span>
            <span class="chip-val" :class="form.visus_sc_os ? 'chip-active' : ''">
              {{ form.visus_sc_os || '—' }}
            </span>
          </div>
          <div class="hero-chip" v-if="form.tio_od || form.tio_os">
            <span class="chip-label">TIO</span>
            <span
              class="chip-val"
              :class="form.tio_od > 21 || form.tio_os > 21 ? 'chip-danger' : 'chip-active'"
            >
              {{ form.tio_od ?? '—' }} / {{ form.tio_os ?? '—' }} mmHg
            </span>
          </div>
        </div>
      </div>
    </Panel>

    <!-- ══ QUICK PRESET TOOLBAR ══ -->
    <div class="qp-toolbar">
      <span class="qp-label"><i class="pi pi-bolt mr-1"></i>Isi Cepat:</span>
      <button class="qp-btn qp-normal" @click="fillAllNormal">
        <i class="pi pi-check-circle"></i> Semua Normal
      </button>
      <button class="qp-btn qp-preset" @click="applyPreset('katarak')">
        <i class="pi pi-sun"></i> Katarak
      </button>
      <button class="qp-btn qp-preset" @click="applyPreset('glaukoma')">
        <i class="pi pi-circle-fill" style="font-size: 0.6rem"></i> Glaukoma
      </button>
      <div class="qp-divider"></div>
      <button class="qp-btn qp-reset" @click="resetForm">
        <i class="pi pi-refresh"></i> Reset
      </button>
    </div>

    <!-- ══ SECTION 1: VISUS ══ -->
    <Panel>
      <template #header>
        <div class="sec-header-wrap">
          <h6 style="color: darkcyan; margin: 0">
            <strong><i class="fas fa-eye mr-2"></i>VISUS</strong>
          </h6>
          <div class="mirror-group">
            <button class="mir-btn" @click="mirrorODtoOS('visus')" title="Salin OD → OS">
              <span class="mir-od">OD</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-os">OS</span>
            </button>
            <button class="mir-btn" @click="mirrorOStoOD('visus')" title="Salin OS → OD">
              <span class="mir-os">OS</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-od">OD</span>
            </button>
          </div>
        </div>
      </template>

      <table class="table table-bordered table-sm visus-table align-middle">
        <thead class="thead-mata text-center">
          <tr>
            <th style="width: 36%">Pemeriksaan</th>
            <th style="width: 32%">
              <span class="badge-od">OD <small>(Kanan)</small></span>
            </th>
            <th style="width: 32%">
              <span class="badge-os">OS <small>(Kiri)</small></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="param-col">Visus SC <small class="text-muted">(Tanpa Koreksi)</small></td>
            <td>
              <Select
                v-model="form.visus_sc_od"
                :options="visusList"
                placeholder="Pilih..."
                class="w-100"
                editable
              />
            </td>
            <td>
              <Select
                v-model="form.visus_sc_os"
                :options="visusList"
                placeholder="Pilih..."
                class="w-100"
                editable
              />
            </td>
          </tr>
          <tr>
            <td class="param-col">Visus CC <small class="text-muted">(Dengan Koreksi)</small></td>
            <td>
              <Select
                v-model="form.visus_cc_od"
                :options="visusList"
                placeholder="Pilih..."
                class="w-100"
                editable
              />
            </td>
            <td>
              <Select
                v-model="form.visus_cc_os"
                :options="visusList"
                placeholder="Pilih..."
                class="w-100"
                editable
              />
            </td>
          </tr>
          <tr>
            <td class="param-col">Visus Pinhole</td>
            <td>
              <Select
                v-model="form.visus_ph_od"
                :options="visusList"
                placeholder="Pilih..."
                class="w-100"
                editable
              />
            </td>
            <td>
              <Select
                v-model="form.visus_ph_os"
                :options="visusList"
                placeholder="Pilih..."
                class="w-100"
                editable
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Panel>

    <!-- ══ SECTION 2: AUTO REFRAKSI ══ -->
    <Panel>
      <template #header>
        <div class="sec-header-wrap">
          <h6 style="color: darkcyan; margin: 0">
            <strong><i class="fas fa-sliders-h mr-2"></i>AUTO REFRAKSI / REFRAKSI SUBYEKTIF</strong>
          </h6>
          <div class="mirror-group">
            <button class="mir-btn" @click="mirrorODtoOS('refraksi')" title="Salin OD → OS">
              <span class="mir-od">OD</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-os">OS</span>
            </button>
            <button class="mir-btn" @click="mirrorOStoOD('refraksi')" title="Salin OS → OD">
              <span class="mir-os">OS</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-od">OD</span>
            </button>
          </div>
        </div>
      </template>

      <table class="table table-bordered table-sm visus-table align-middle">
        <thead class="thead-mata text-center">
          <tr>
            <th style="width: 18%">Mata</th>
            <th>Spheris (S)</th>
            <th>Cylinder (C)</th>
            <th>Axis (°)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center"><span class="badge-od">OD</span></td>
            <td><InputText v-model="form.ref_od_s" class="w-100" placeholder="cth: -2.50" /></td>
            <td><InputText v-model="form.ref_od_c" class="w-100" placeholder="cth: -0.75" /></td>
            <td>
              <InputNumber
                v-model="form.ref_od_a"
                class="w-100"
                placeholder="0–180"
                :min="0"
                :max="180"
                :useGrouping="false"
              />
            </td>
          </tr>
          <tr>
            <td class="text-center"><span class="badge-os">OS</span></td>
            <td><InputText v-model="form.ref_os_s" class="w-100" placeholder="cth: -2.50" /></td>
            <td><InputText v-model="form.ref_os_c" class="w-100" placeholder="cth: -0.75" /></td>
            <td>
              <InputNumber
                v-model="form.ref_os_a"
                class="w-100"
                placeholder="0–180"
                :min="0"
                :max="180"
                :useGrouping="false"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Panel>

    <!-- ══ SECTION 3: RESEP KACAMATA ══ -->
    <Panel>
      <template #header>
        <div class="sec-header-wrap">
          <h6 style="color: darkcyan; margin: 0">
            <strong><i class="fas fa-glasses mr-2"></i>RESEP KACAMATA</strong>
          </h6>
          <div class="mirror-group">
            <button class="mir-btn" @click="mirrorODtoOS('resep')" title="Salin OD → OS">
              <span class="mir-od">OD</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-os">OS</span>
            </button>
            <button class="mir-btn" @click="mirrorOStoOD('resep')" title="Salin OS → OD">
              <span class="mir-os">OS</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-od">OD</span>
            </button>
          </div>
        </div>
      </template>

      <div class="row g-2">
        <div class="col-md-6">
          <p
            class="mb-1"
            style="
              font-size: 12px;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            "
          >
            Jauh (Far)
          </p>
          <table class="table table-bordered table-sm visus-table align-middle">
            <thead class="thead-mata text-center">
              <tr>
                <th style="width: 18%">Mata</th>
                <th>S</th>
                <th>C</th>
                <th>Axis (°)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center"><span class="badge-od">OD</span></td>
                <td><InputText v-model="form.jauh_od_s" class="w-100" placeholder="+/-" /></td>
                <td><InputText v-model="form.jauh_od_c" class="w-100" placeholder="+/-" /></td>
                <td>
                  <InputNumber
                    v-model="form.jauh_od_a"
                    class="w-100"
                    :min="0"
                    :max="180"
                    :useGrouping="false"
                  />
                </td>
              </tr>
              <tr>
                <td class="text-center"><span class="badge-os">OS</span></td>
                <td><InputText v-model="form.jauh_os_s" class="w-100" placeholder="+/-" /></td>
                <td><InputText v-model="form.jauh_os_c" class="w-100" placeholder="+/-" /></td>
                <td>
                  <InputNumber
                    v-model="form.jauh_os_a"
                    class="w-100"
                    :min="0"
                    :max="180"
                    :useGrouping="false"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-6">
          <p
            class="mb-1"
            style="
              font-size: 12px;
              color: #64748b;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            "
          >
            Dekat (Near) / Adisi
          </p>
          <table class="table table-bordered table-sm visus-table align-middle">
            <thead class="thead-mata text-center">
              <tr>
                <th style="width: 18%">Mata</th>
                <th>S</th>
                <th>C</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center"><span class="badge-od">OD</span></td>
                <td><InputText v-model="form.dekat_od_s" class="w-100" placeholder="+/-" /></td>
                <td><InputText v-model="form.dekat_od_c" class="w-100" placeholder="+/-" /></td>
                <td><InputText v-model="form.dekat_od_add" class="w-100" placeholder="Add" /></td>
              </tr>
              <tr>
                <td class="text-center"><span class="badge-os">OS</span></td>
                <td><InputText v-model="form.dekat_os_s" class="w-100" placeholder="+/-" /></td>
                <td><InputText v-model="form.dekat_os_c" class="w-100" placeholder="+/-" /></td>
                <td><InputText v-model="form.dekat_os_add" class="w-100" placeholder="Add" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Panel>

    <!-- ══ SECTION 4: TIO ══ -->
    <Panel>
      <template #header>
        <h6 style="color: darkcyan">
          <strong
            ><i class="fas fa-compress-arrows-alt mr-2"></i>TEKANAN INTRAOKULAR (TIO /
            TONOMETRI)</strong
          >
        </h6>
      </template>

      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label-sm">TIO OD (mmHg)</label>
          <InputNumber
            v-model="form.tio_od"
            class="w-100"
            placeholder="Normal 10–21"
            :min="0"
            :max="80"
            :useGrouping="false"
          />
          <small
            v-if="form.tio_od !== null"
            :class="form.tio_od > 21 ? 'text-danger fw-bold' : 'text-success'"
          >
            {{ form.tio_od > 21 ? '⚠ Tinggi' : '✓ Normal' }}
          </small>
        </div>
        <div class="col-md-3">
          <label class="form-label-sm">TIO OS (mmHg)</label>
          <InputNumber
            v-model="form.tio_os"
            class="w-100"
            placeholder="Normal 10–21"
            :min="0"
            :max="80"
            :useGrouping="false"
          />
          <small
            v-if="form.tio_os !== null"
            :class="form.tio_os > 21 ? 'text-danger fw-bold' : 'text-success'"
          >
            {{ form.tio_os > 21 ? '⚠ Tinggi' : '✓ Normal' }}
          </small>
        </div>
        <div class="col-md-4">
          <label class="form-label-sm">Metode Tonometri</label>
          <Select
            v-model="form.metode_tio"
            :options="metodeTioList"
            placeholder="Pilih metode..."
            class="w-100"
          />
        </div>
      </div>
    </Panel>

    <!-- ══ SECTION 5: SEGMEN ANTERIOR ══ -->
    <Panel>
      <template #header>
        <div class="sec-header-wrap">
          <h6 style="color: darkcyan; margin: 0">
            <strong><i class="fas fa-microscope mr-2"></i>SEGMEN ANTERIOR</strong>
          </h6>
          <div class="mirror-group">
            <button
              class="mir-btn mir-normal"
              @click="fillSectionNormal('anterior')"
              title="Isi semua nilai normal"
            >
              <i class="pi pi-check"></i> Normal
            </button>
            <button class="mir-btn" @click="mirrorODtoOS('anterior')" title="Salin OD → OS">
              <span class="mir-od">OD</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-os">OS</span>
            </button>
            <button class="mir-btn" @click="mirrorOStoOD('anterior')" title="Salin OS → OD">
              <span class="mir-os">OS</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-od">OD</span>
            </button>
          </div>
        </div>
      </template>

      <table class="table table-bordered table-sm visus-table align-middle">
        <thead class="thead-mata text-center">
          <tr>
            <th style="width: 22%">Komponen</th>
            <th style="width: 39%">
              <span class="badge-od">OD <small>(Kanan)</small></span>
            </th>
            <th style="width: 39%">
              <span class="badge-os">OS <small>(Kiri)</small></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in segmenAnteriorFields" :key="field.key">
            <td class="param-col">{{ field.label }}</td>
            <td>
              <InputText
                v-model="form[`sa_${field.key}_od`]"
                class="w-100"
                :placeholder="field.normal"
              />
            </td>
            <td>
              <InputText
                v-model="form[`sa_${field.key}_os`]"
                class="w-100"
                :placeholder="field.normal"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Panel>

    <!-- ══ SECTION 6: SEGMEN POSTERIOR ══ -->
    <Panel>
      <template #header>
        <div class="sec-header-wrap">
          <h6 style="color: darkcyan; margin: 0">
            <strong><i class="fas fa-search mr-2"></i>SEGMEN POSTERIOR</strong>
          </h6>
          <div class="mirror-group">
            <button
              class="mir-btn mir-normal"
              @click="fillSectionNormal('posterior')"
              title="Isi semua nilai normal"
            >
              <i class="pi pi-check"></i> Normal
            </button>
            <button class="mir-btn" @click="mirrorODtoOS('posterior')" title="Salin OD → OS">
              <span class="mir-od">OD</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-os">OS</span>
            </button>
            <button class="mir-btn" @click="mirrorOStoOD('posterior')" title="Salin OS → OD">
              <span class="mir-os">OS</span>
              <i class="pi pi-arrow-right"></i>
              <span class="mir-od">OD</span>
            </button>
          </div>
        </div>
      </template>

      <table class="table table-bordered table-sm visus-table align-middle">
        <thead class="thead-mata text-center">
          <tr>
            <th style="width: 22%">Komponen</th>
            <th style="width: 39%">
              <span class="badge-od">OD <small>(Kanan)</small></span>
            </th>
            <th style="width: 39%">
              <span class="badge-os">OS <small>(Kiri)</small></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in segmenPosteriorFields" :key="field.key">
            <td class="param-col">{{ field.label }}</td>
            <td>
              <InputText
                v-model="form[`sp_${field.key}_od`]"
                class="w-100"
                :placeholder="field.normal"
              />
            </td>
            <td>
              <InputText
                v-model="form[`sp_${field.key}_os`]"
                class="w-100"
                :placeholder="field.normal"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Panel>

    <!-- ══ SECTION 7: KESIMPULAN ══ -->
    <Panel>
      <template #header>
        <h6 style="color: darkcyan">
          <strong><i class="fas fa-file-medical mr-2"></i>KESIMPULAN & RENCANA TERAPI</strong>
        </h6>
      </template>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label-sm">Kesimpulan / Diagnosis Mata</label>
          <Textarea
            v-model="form.kesimpulan"
            rows="4"
            class="w-100 custom-textarea"
            placeholder="Tuliskan kesimpulan pemeriksaan visus dan mata..."
          />
        </div>
        <div class="col-md-6">
          <label class="form-label-sm">Rencana Terapi / Tindakan</label>
          <Textarea
            v-model="form.rencana_terapi"
            rows="4"
            class="w-100 custom-textarea"
            placeholder="Tuliskan rencana terapi, tindakan, atau rujukan..."
          />
        </div>
        <div class="col-md-12">
          <label class="form-label-sm">Catatan Tambahan</label>
          <Textarea
            v-model="form.catatan"
            rows="2"
            class="w-100 custom-textarea"
            placeholder="Catatan lain yang diperlukan..."
          />
        </div>
      </div>
    </Panel>

    <!-- ══ ACTION BAR ══ -->
    <div class="visus-action-bar">
      <span v-if="lastSaved" class="saved-info">
        <i class="pi pi-check-circle"></i> Disimpan pukul {{ lastSaved }}
      </span>
      <Button
        label="Riwayat"
        icon="pi pi-history"
        severity="secondary"
        outlined
        @click="openHistory"
      />
      <Button
        label="Simpan Pemeriksaan"
        icon="pi pi-save"
        severity="success"
        :loading="isSaving"
        @click="simpan"
      />
    </div>
  </div>

  <!-- ══ DIALOG RIWAYAT ══ -->
  <Dialog
    v-model:visible="showHistory"
    header="Riwayat Pemeriksaan Visus"
    :modal="true"
    :style="{ width: '92vw', maxWidth: '1100px', maxHeight: '90vh' }"
    :draggable="false"
  >
    <!-- Loading -->
    <div v-if="historyLoading" class="hist-loading">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Memuat riwayat...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="!historyList.length" class="hist-empty">
      <i class="pi pi-inbox" style="font-size: 2rem; color: #94a3b8"></i>
      <div>Belum ada riwayat pemeriksaan</div>
    </div>

    <!-- Content -->
    <div v-else class="hist-layout">
      <!-- ── Timeline kiri ── -->
      <div class="hist-timeline">
        <div
          v-for="(item, idx) in historyList"
          :key="item.id"
          class="hist-item"
          :class="{ 'hist-item-active': selectedHistIdx === idx }"
          @click="selectedHistIdx = idx"
        >
          <div class="hist-dot" :class="idx === 0 ? 'hist-dot-latest' : ''"></div>
          <div class="hist-line" v-if="idx < historyList.length - 1"></div>
          <div class="hist-item-body">
            <div class="hist-date">{{ formatHistDate(item.created_at) }}</div>
            <div class="hist-noreg">{{ item.noregister }}</div>
            <div class="hist-visus-row">
              <span class="hist-badge-od">{{ item.visus_sc_od || '—' }}</span>
              <span class="hist-sep">/</span>
              <span class="hist-badge-os">{{ item.visus_sc_os || '—' }}</span>
            </div>
            <div v-if="item.kesimpulan" class="hist-dx">
              {{
                item.kesimpulan.length > 35 ? item.kesimpulan.slice(0, 35) + '…' : item.kesimpulan
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- ── Detail kanan ── -->
      <div class="hist-detail" v-if="historyList[selectedHistIdx]">
        <div class="hist-detail-header">
          <span class="hist-detail-date">
            <i class="pi pi-calendar mr-1"></i>
            {{ formatHistDate(historyList[selectedHistIdx].created_at, true) }}
          </span>
          <span class="hist-noreg-chip">{{ historyList[selectedHistIdx].noregister }}</span>
        </div>

        <!-- VISUS -->
        <div class="hd-section">
          <div class="hd-section-title"><i class="fas fa-eye mr-1"></i>VISUS</div>
          <table class="hd-table">
            <thead>
              <tr>
                <th>Jenis</th>
                <th class="hd-od">OD (Kanan)</th>
                <th class="hd-os">OS (Kiri)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Visus SC</td>
                <td>{{ historyList[selectedHistIdx].visus_sc_od || '—' }}</td>
                <td>{{ historyList[selectedHistIdx].visus_sc_os || '—' }}</td>
              </tr>
              <tr>
                <td>Visus CC</td>
                <td>{{ historyList[selectedHistIdx].visus_cc_od || '—' }}</td>
                <td>{{ historyList[selectedHistIdx].visus_cc_os || '—' }}</td>
              </tr>
              <tr>
                <td>Visus Pinhole</td>
                <td>{{ historyList[selectedHistIdx].visus_ph_od || '—' }}</td>
                <td>{{ historyList[selectedHistIdx].visus_ph_os || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- AUTO REFRAKSI -->
        <div class="hd-section">
          <div class="hd-section-title"><i class="fas fa-sliders-h mr-1"></i>AUTO REFRAKSI</div>
          <table class="hd-table">
            <thead>
              <tr>
                <th>Mata</th>
                <th>S</th>
                <th>C</th>
                <th>Axis (°)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="hd-od-badge">OD</span></td>
                <td>{{ historyList[selectedHistIdx].ref_od_s ?? '—' }}</td>
                <td>{{ historyList[selectedHistIdx].ref_od_c ?? '—' }}</td>
                <td>{{ historyList[selectedHistIdx].ref_od_a ?? '—' }}</td>
              </tr>
              <tr>
                <td><span class="hd-os-badge">OS</span></td>
                <td>{{ historyList[selectedHistIdx].ref_os_s ?? '—' }}</td>
                <td>{{ historyList[selectedHistIdx].ref_os_c ?? '—' }}</td>
                <td>{{ historyList[selectedHistIdx].ref_os_a ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TIO -->
        <div class="hd-section">
          <div class="hd-section-title"><i class="fas fa-compress-arrows-alt mr-1"></i>TIO</div>
          <div class="hd-tio-row">
            <div
              class="hd-tio-chip"
              :class="historyList[selectedHistIdx].tio_od > 21 ? 'hd-tio-high' : ''"
            >
              <span class="hd-tio-label">OD</span>
              <span class="hd-tio-val">{{ historyList[selectedHistIdx].tio_od ?? '—' }} mmHg</span>
              <span v-if="historyList[selectedHistIdx].tio_od > 21" class="hd-tio-warn"
                >⚠ Tinggi</span
              >
            </div>
            <div
              class="hd-tio-chip"
              :class="historyList[selectedHistIdx].tio_os > 21 ? 'hd-tio-high' : ''"
            >
              <span class="hd-tio-label">OS</span>
              <span class="hd-tio-val">{{ historyList[selectedHistIdx].tio_os ?? '—' }} mmHg</span>
              <span v-if="historyList[selectedHistIdx].tio_os > 21" class="hd-tio-warn"
                >⚠ Tinggi</span
              >
            </div>
            <div class="hd-tio-method" v-if="historyList[selectedHistIdx].metode_tio">
              Metode: {{ historyList[selectedHistIdx].metode_tio }}
            </div>
          </div>
        </div>

        <!-- SEGMEN ANTERIOR -->
        <div class="hd-section">
          <div class="hd-section-title"><i class="fas fa-microscope mr-1"></i>SEGMEN ANTERIOR</div>
          <table class="hd-table">
            <thead>
              <tr>
                <th>Komponen</th>
                <th class="hd-od">OD</th>
                <th class="hd-os">OS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in segmenAnteriorFields" :key="f.key">
                <td>{{ f.label }}</td>
                <td>{{ historyList[selectedHistIdx][`sa_${f.key}_od`] || '—' }}</td>
                <td>{{ historyList[selectedHistIdx][`sa_${f.key}_os`] || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- SEGMEN POSTERIOR -->
        <div class="hd-section">
          <div class="hd-section-title"><i class="fas fa-search mr-1"></i>SEGMEN POSTERIOR</div>
          <table class="hd-table">
            <thead>
              <tr>
                <th>Komponen</th>
                <th class="hd-od">OD</th>
                <th class="hd-os">OS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="f in segmenPosteriorFields" :key="f.key">
                <td>{{ f.label }}</td>
                <td>{{ historyList[selectedHistIdx][`sp_${f.key}_od`] || '—' }}</td>
                <td>{{ historyList[selectedHistIdx][`sp_${f.key}_os`] || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- KESIMPULAN -->
        <div
          class="hd-section"
          v-if="
            historyList[selectedHistIdx].kesimpulan || historyList[selectedHistIdx].rencana_terapi
          "
        >
          <div class="hd-section-title"><i class="fas fa-file-medical mr-1"></i>KESIMPULAN</div>
          <div class="hd-conclusion-grid">
            <div v-if="historyList[selectedHistIdx].kesimpulan">
              <div class="hd-conc-label">Diagnosis / Kesimpulan</div>
              <div class="hd-conc-val">{{ historyList[selectedHistIdx].kesimpulan }}</div>
            </div>
            <div v-if="historyList[selectedHistIdx].rencana_terapi">
              <div class="hd-conc-label">Rencana Terapi</div>
              <div class="hd-conc-val">{{ historyList[selectedHistIdx].rencana_terapi }}</div>
            </div>
            <div v-if="historyList[selectedHistIdx].catatan" style="grid-column: 1/-1">
              <div class="hd-conc-label">Catatan</div>
              <div class="hd-conc-val">{{ historyList[selectedHistIdx].catatan }}</div>
            </div>
          </div>
        </div>

        <!-- Updated info -->
        <div class="hd-meta">
          <span v-if="historyList[selectedHistIdx].updated_at">
            <i class="pi pi-pencil"></i> Diubah:
            {{ formatHistDate(historyList[selectedHistIdx].updated_at, true) }}
          </span>
        </div>
      </div>
    </div>
  </Dialog>

  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

const props = defineProps({
  noregister: { type: String, default: null },
  dataset: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

// ── Options ────────────────────────────────────────────────
const visusList = [
  '6/6',
  '6/7.5',
  '6/9',
  '6/12',
  '6/18',
  '6/24',
  '6/36',
  '6/60',
  '3/60',
  '2/60',
  '1/60',
  '1/300',
  '1/~',
  'HM',
  'LP(+)',
  'LP(-)',
  'NLP',
]
const metodeTioList = ['NCT (Non-Contact)', 'Goldmann', 'Schiotz', 'Tonopen', 'iCare']

const segmenAnteriorFields = [
  { key: 'palpebra', label: 'Palpebra', normal: 'normal' },
  { key: 'konjungtiva', label: 'Konjungtiva', normal: 'jernih / tidak hiperemis' },
  { key: 'kornea', label: 'Kornea', normal: 'jernih' },
  { key: 'bmd', label: 'BMD', normal: 'dalam' },
  { key: 'iris', label: 'Iris', normal: 'bulat, reguler' },
  { key: 'pupil', label: 'Pupil', normal: 'bulat, ± 3mm, RCL (+)' },
  { key: 'lensa', label: 'Lensa', normal: 'jernih' },
]

const segmenPosteriorFields = [
  { key: 'vitreous', label: 'Vitreous', normal: 'jernih' },
  { key: 'papil', label: 'Papil N. II', normal: 'bulat, batas tegas, warna normal' },
  { key: 'cd_ratio', label: 'C/D Ratio', normal: '0.3' },
  { key: 'makula', label: 'Makula', normal: 'refleks fovea (+)' },
  { key: 'retina', label: 'Retina', normal: 'flat, tidak ada lesi' },
]

// ── State ──────────────────────────────────────────────────
const isLoading = ref(false)
const isSaving = ref(false)
const lastSaved = ref(null)

// History
const showHistory = ref(false)
const historyLoading = ref(false)
const historyList = ref([])
const selectedHistIdx = ref(0)

const form = ref({
  visus_sc_od: null,
  visus_sc_os: null,
  visus_cc_od: null,
  visus_cc_os: null,
  visus_ph_od: null,
  visus_ph_os: null,
  ref_od_s: null,
  ref_od_c: null,
  ref_od_a: null,
  ref_os_s: null,
  ref_os_c: null,
  ref_os_a: null,
  jauh_od_s: null,
  jauh_od_c: null,
  jauh_od_a: null,
  jauh_os_s: null,
  jauh_os_c: null,
  jauh_os_a: null,
  dekat_od_s: null,
  dekat_od_c: null,
  dekat_od_add: null,
  dekat_os_s: null,
  dekat_os_c: null,
  dekat_os_add: null,
  tio_od: null,
  tio_os: null,
  metode_tio: null,
  kesimpulan: '',
  rencana_terapi: '',
  catatan: '',
})

segmenAnteriorFields.forEach((f) => {
  form.value[`sa_${f.key}_od`] = ''
  form.value[`sa_${f.key}_os`] = ''
})
segmenPosteriorFields.forEach((f) => {
  form.value[`sp_${f.key}_od`] = ''
  form.value[`sp_${f.key}_os`] = ''
})

// Snapshot initial values untuk keperluan resetForm()
const formInitial = JSON.parse(JSON.stringify(form.value))

// ── API ────────────────────────────────────────────────────
async function getData(mode) {
  if (!props.noregister) return
  isLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}index.php/api/penunjang/get_visus`, {
      keyword: mode === 1 ? props.noregister : props.dataset?.NOMR,
      id_client: id_client.value,
    })

    console.log('get_visus response:', res.data)

    if (res.data?.data) {
      Object.keys(res.data.data).forEach((key) => {
        if (key in form.value) form.value[key] = res.data.data[key]
      })
    }
  } catch (err) {
    console.error('getData visus error:', err)
  } finally {
    isLoading.value = false
  }
}

async function simpan() {
  isSaving.value = true
  try {
    const url = configStore.apiBaseUrl

    const payload = {
      noregister: props.noregister,
      norm: props.dataset?.NOMR,
      id_client: id_client.value,
      user_id: user_id.value,
      ...form.value,
    }
    const res = await axios.post(`${url}/index.php/api/penunjang/simpan_visus_json`, payload)

    if (res.data?.code == 200 || res.data?.status === 'success') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data pemeriksaan visus tersimpan',
        life: 3000,
      })
      lastSaved.value = new Date().toLocaleTimeString('id-ID')
      emit('saved', form.value)
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res.data?.message ?? 'Gagal menyimpan',
        life: 4000,
      })
    }
  } catch (err) {
    console.error('simpan visus error:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan saat menyimpan',
      life: 5000,
    })
  } finally {
    isSaving.value = false
  }
}

// ── Quick Preset & Mirror ───────────────────────────────────
function getSectionFieldMap(section) {
  switch (section) {
    case 'visus':
      return [
        { od: 'visus_sc_od', os: 'visus_sc_os' },
        { od: 'visus_cc_od', os: 'visus_cc_os' },
        { od: 'visus_ph_od', os: 'visus_ph_os' },
      ]
    case 'refraksi':
      return [
        { od: 'ref_od_s', os: 'ref_os_s' },
        { od: 'ref_od_c', os: 'ref_os_c' },
        { od: 'ref_od_a', os: 'ref_os_a' },
      ]
    case 'resep':
      return [
        { od: 'jauh_od_s', os: 'jauh_os_s' },
        { od: 'jauh_od_c', os: 'jauh_os_c' },
        { od: 'jauh_od_a', os: 'jauh_os_a' },
        { od: 'dekat_od_s', os: 'dekat_os_s' },
        { od: 'dekat_od_c', os: 'dekat_os_c' },
        { od: 'dekat_od_add', os: 'dekat_os_add' },
      ]
    case 'anterior':
      return segmenAnteriorFields.map((f) => ({ od: `sa_${f.key}_od`, os: `sa_${f.key}_os` }))
    case 'posterior':
      return segmenPosteriorFields.map((f) => ({ od: `sp_${f.key}_od`, os: `sp_${f.key}_os` }))
    default:
      return []
  }
}

function mirrorODtoOS(section) {
  getSectionFieldMap(section).forEach(({ od, os }) => {
    form.value[os] = form.value[od]
  })
}

function mirrorOStoOD(section) {
  getSectionFieldMap(section).forEach(({ od, os }) => {
    form.value[od] = form.value[os]
  })
}

function fillSectionNormal(section) {
  if (section === 'anterior') {
    segmenAnteriorFields.forEach((f) => {
      form.value[`sa_${f.key}_od`] = f.normal
      form.value[`sa_${f.key}_os`] = f.normal
    })
    toast.add({
      severity: 'info',
      summary: 'Normal',
      detail: 'Segmen Anterior diisi nilai normal',
      life: 2000,
    })
  } else if (section === 'posterior') {
    segmenPosteriorFields.forEach((f) => {
      form.value[`sp_${f.key}_od`] = f.normal
      form.value[`sp_${f.key}_os`] = f.normal
    })
    toast.add({
      severity: 'info',
      summary: 'Normal',
      detail: 'Segmen Posterior diisi nilai normal',
      life: 2000,
    })
  }
}

function fillAllNormal() {
  form.value.visus_sc_od = '6/6'
  form.value.visus_sc_os = '6/6'
  form.value.visus_cc_od = '6/6'
  form.value.visus_cc_os = '6/6'
  form.value.visus_ph_od = '6/6'
  form.value.visus_ph_os = '6/6'
  form.value.ref_od_s = '0.00'
  form.value.ref_od_c = '0.00'
  form.value.ref_od_a = 0
  form.value.ref_os_s = '0.00'
  form.value.ref_os_c = '0.00'
  form.value.ref_os_a = 0
  form.value.tio_od = 16
  form.value.tio_os = 16
  segmenAnteriorFields.forEach((f) => {
    form.value[`sa_${f.key}_od`] = f.normal
    form.value[`sa_${f.key}_os`] = f.normal
  })
  segmenPosteriorFields.forEach((f) => {
    form.value[`sp_${f.key}_od`] = f.normal
    form.value[`sp_${f.key}_os`] = f.normal
  })
  toast.add({
    severity: 'success',
    summary: 'Isi Cepat',
    detail: 'Semua field diisi dengan nilai normal',
    life: 2500,
  })
}

function applyPreset(type) {
  if (type === 'katarak') {
    form.value.visus_sc_od = '1/60'
    form.value.visus_sc_os = '1/60'
    form.value.visus_cc_od = '1/60'
    form.value.visus_cc_os = '1/60'
    form.value.tio_od = 15
    form.value.tio_os = 15
    segmenAnteriorFields.forEach((f) => {
      form.value[`sa_${f.key}_od`] = f.key === 'lensa' ? 'keruh (katarak)' : f.normal
      form.value[`sa_${f.key}_os`] = f.key === 'lensa' ? 'keruh (katarak)' : f.normal
    })
    segmenPosteriorFields.forEach((f) => {
      form.value[`sp_${f.key}_od`] = f.normal
      form.value[`sp_${f.key}_os`] = f.normal
    })
    form.value.kesimpulan = 'Katarak senilis matur ODS'
    form.value.rencana_terapi = 'Rencana operasi katarak (PHACO + IOL)'
    toast.add({
      severity: 'info',
      summary: 'Preset Katarak',
      detail: 'Template katarak diterapkan',
      life: 2500,
    })
  } else if (type === 'glaukoma') {
    form.value.visus_sc_od = '6/60'
    form.value.visus_sc_os = '6/60'
    form.value.tio_od = 28
    form.value.tio_os = 26
    form.value.metode_tio = 'NCT (Non-Contact)'
    segmenAnteriorFields.forEach((f) => {
      form.value[`sa_${f.key}_od`] = f.key === 'pupil' ? 'midriasis, RCL (+) lambat' : f.normal
      form.value[`sa_${f.key}_os`] = f.key === 'pupil' ? 'midriasis, RCL (+) lambat' : f.normal
    })
    segmenPosteriorFields.forEach((f) => {
      if (f.key === 'cd_ratio') {
        form.value[`sp_${f.key}_od`] = '0.7'
        form.value[`sp_${f.key}_os`] = '0.6'
      } else {
        form.value[`sp_${f.key}_od`] = f.normal
        form.value[`sp_${f.key}_os`] = f.normal
      }
    })
    form.value.kesimpulan = 'Glaukoma kronik sudut terbuka ODS'
    form.value.rencana_terapi = 'Tetes mata penurun TIO, evaluasi lapang pandang'
    toast.add({
      severity: 'info',
      summary: 'Preset Glaukoma',
      detail: 'Template glaukoma diterapkan',
      life: 2500,
    })
  }
}

function resetForm() {
  Object.keys(formInitial).forEach((key) => {
    form.value[key] = formInitial[key]
  })
  toast.add({ severity: 'warn', summary: 'Reset', detail: 'Semua field dikosongkan', life: 2500 })
}

// ── History ────────────────────────────────────────────────
async function openHistory() {
  showHistory.value = true
  historyList.value = []
  selectedHistIdx.value = 0
  historyLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}index.php/api/penunjang/get_visus`, {
      keyword: props.dataset?.NOMR,
      mode: 2,
      id_client: id_client.value,
    })

    console.log('getData history response:', res.data)
    if (res.data?.code == 200 && Array.isArray(res.data?.data)) {
      historyList.value = res.data.data
    } else if (res.data?.code == 200 && res.data?.data) {
      historyList.value = [res.data.data]
    } else {
      historyList.value = []
    }
  } catch (err) {
    console.error('openHistory error:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat riwayat', life: 3000 })
  } finally {
    historyLoading.value = false
  }
}

function formatHistDate(dateStr, full = false) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const dmy = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  return full ? `${days[d.getDay()]}, ${dmy} — ${hhmm}` : `${dmy}\n${hhmm}`
}

onMounted(() => getData(1))
</script>

<style scoped>
/* ── Wrap ── */
.visus-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Hero Panel ── */
.hero-panel :deep(.p-panel-content) {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  padding: 1rem 1.25rem;
  border-radius: 6px;
}
.hero-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  color: white;
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.hero-icon-wrap {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}
.hero-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.hero-sub {
  font-size: 0.78rem;
  opacity: 0.8;
  margin-top: 2px;
}
.hero-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.hero-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 0.4rem 0.85rem;
  min-width: 80px;
}
.chip-label {
  font-size: 0.65rem;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.chip-val {
  font-size: 0.88rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.7;
}
.chip-active {
  opacity: 1;
  color: #a7f3d0;
}
.chip-danger {
  opacity: 1;
  color: #fca5a5;
}

/* ── Table ── */
.visus-table {
  font-size: 0.82rem;
  margin-bottom: 0;
}
.visus-table tbody td {
  padding: 0.3rem 0.45rem;
  vertical-align: middle;
}
.visus-table thead th {
  font-size: 0.73rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.45rem 0.6rem;
}
.thead-mata {
  background: #f1f5f9;
  color: #1e293b;
}
.param-col {
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
}

/* ── Eye Badges ── */
.badge-od {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 2px 10px;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
}
.badge-os {
  display: inline-block;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 2px 10px;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

/* ── Label ── */
.form-label-sm {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

/* ── Action Bar ── */
.visus-action-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 10px 14px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}
.saved-info {
  font-size: 0.8rem;
  color: #16a34a;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ── Textarea ── */
.custom-textarea {
  font-size: 13px !important;
  line-height: 1.4;
}

/* ── Input compact ── */
:deep(.p-inputtext),
:deep(.p-inputnumber-input) {
  font-size: 0.82rem;
  padding: 0.28rem 0.45rem;
}
:deep(.p-select) {
  font-size: 0.82rem;
}

/* ── Quick Preset Toolbar ── */
.qp-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: linear-gradient(90deg, #f0fdfa 0%, #ecfdf5 100%);
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  flex-wrap: wrap;
}
.qp-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #047857;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-right: 2px;
  white-space: nowrap;
}
.qp-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 13px;
  border: none;
  border-radius: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
  outline: none;
  white-space: nowrap;
}
.qp-btn:active {
  transform: scale(0.95);
}
.qp-normal {
  background: #059669;
  color: #fff;
  box-shadow: 0 1px 4px rgba(5, 150, 105, 0.3);
}
.qp-normal:hover {
  background: #047857;
}
.qp-preset {
  background: #0284c7;
  color: #fff;
  box-shadow: 0 1px 4px rgba(2, 132, 199, 0.3);
}
.qp-preset:hover {
  background: #0369a1;
}
.qp-reset {
  background: #e2e8f0;
  color: #475569;
}
.qp-reset:hover {
  background: #cbd5e1;
}
.qp-divider {
  width: 1px;
  height: 22px;
  background: #6ee7b7;
  margin: 0 2px;
}

/* ── Section Header with Mirror Buttons ── */
.sec-header-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}
.mirror-group {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.mir-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
  color: #334155;
  outline: none;
  white-space: nowrap;
}
.mir-btn:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}
.mir-btn:active {
  transform: scale(0.94);
}
.mir-btn.mir-normal {
  background: #dcfce7;
  border-color: #86efac;
  color: #15803d;
}
.mir-btn.mir-normal:hover {
  background: #bbf7d0;
  border-color: #4ade80;
}
.mir-od {
  color: #1d4ed8;
  font-weight: 700;
}
.mir-os {
  color: #b91c1c;
  font-weight: 700;
}

/* ══ HISTORY DIALOG ══════════════════════════════════════════ */

/* Paksa .p-dialog-content menjadi flex column agar children bisa shrink */
:deep(.p-dialog-content) {
  height: 72vh !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  padding: 0 !important;
}

.hist-loading,
.hist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  min-height: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}
.hist-layout {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0; /* wajib: izinkan flex child shrink agar overflow bekerja */
  overflow: hidden;
}
/* Left timeline */
.hist-timeline {
  width: 210px;
  min-width: 190px;
  min-height: 0; /* wajib untuk scroll */
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  padding: 8px 0;
  flex-shrink: 0;
}
.hist-item {
  position: relative;
  padding: 10px 10px 10px 30px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;
}
.hist-item:hover {
  background: #f8fafc;
}
.hist-item-active {
  background: #eff6ff !important;
  border-left-color: #2563eb;
}
.hist-dot {
  position: absolute;
  left: 10px;
  top: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  border: 2px solid #e2e8f0;
  z-index: 1;
}
.hist-dot-latest {
  background: #0891b2;
  border-color: #bae6fd;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.15);
}
.hist-line {
  position: absolute;
  left: 14px;
  top: 24px;
  width: 2px;
  bottom: 0;
  background: #e2e8f0;
}
.hist-item-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hist-date {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e293b;
  white-space: pre-line;
  line-height: 1.3;
}
.hist-noreg {
  font-size: 0.68rem;
  color: #64748b;
}
.hist-visus-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}
.hist-badge-od {
  font-size: 0.7rem;
  font-weight: 700;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 3px;
  padding: 1px 5px;
}
.hist-badge-os {
  font-size: 0.7rem;
  font-weight: 700;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 3px;
  padding: 1px 5px;
}
.hist-sep {
  font-size: 0.7rem;
  color: #94a3b8;
}
.hist-dx {
  font-size: 0.68rem;
  color: #6b7280;
  margin-top: 2px;
  font-style: italic;
  line-height: 1.3;
}

/* Right detail */
.hist-detail {
  flex: 1;
  min-height: 0; /* wajib untuk scroll */
  overflow-y: auto;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hist-detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
  flex-wrap: wrap;
}
.hist-detail-date {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
}
.hist-noreg-chip {
  font-size: 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 2px 8px;
}
.hd-section {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}
.hd-section-title {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.72rem;
  font-weight: 700;
  color: #0891b2;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 5px 10px;
}
.hd-table {
  width: 100%;
  font-size: 0.8rem;
  border-collapse: collapse;
}
.hd-table th {
  background: #f8fafc;
  font-weight: 700;
  font-size: 0.71rem;
  text-transform: uppercase;
  color: #64748b;
  padding: 5px 10px;
  border-bottom: 1px solid #e2e8f0;
}
.hd-table td {
  padding: 5px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: top;
}
.hd-table tr:last-child td {
  border-bottom: none;
}
.hd-od {
  color: #1d4ed8;
}
.hd-os {
  color: #b91c1c;
}
.hd-od-badge {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid #bfdbfe;
}
.hd-os-badge {
  display: inline-block;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid #fecaca;
}
.hd-tio-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  flex-wrap: wrap;
}
.hd-tio-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 5px 12px;
}
.hd-tio-chip.hd-tio-high {
  background: #fff1f2;
  border-color: #fecaca;
}
.hd-tio-label {
  font-weight: 700;
  font-size: 0.75rem;
  color: #374151;
}
.hd-tio-val {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1e293b;
}
.hd-tio-warn {
  font-size: 0.7rem;
  color: #dc2626;
  font-weight: 700;
}
.hd-tio-method {
  font-size: 0.75rem;
  color: #64748b;
  padding-left: 6px;
}
.hd-conclusion-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px 12px;
}
.hd-conc-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  margin-bottom: 3px;
}
.hd-conc-val {
  font-size: 0.83rem;
  color: #1e293b;
  line-height: 1.5;
}
.hd-meta {
  font-size: 0.72rem;
  color: #94a3b8;
  padding-top: 4px;
  display: flex;
  gap: 6px;
  align-items: center;
}
</style>
