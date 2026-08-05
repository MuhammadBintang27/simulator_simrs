<template>
  <!-- ══ Loading / Error / Kosong ══════════════════════════════════════════ -->
  <div v-if="loading || error || !hasData" class="rme-a4-page triase-a4-page" data-section="triase">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Reg: {{ dataPasien?.NOPENDAFTARAN }}</span>
    </div>
    <div class="rme-section-title">TRIASE IGD</div>
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data triase...
    </div>
    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>
    <div v-else class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data triase untuk kunjungan ini.
    </div>
  </div>

  <!-- ══ Halaman 1 : Info dasar triase ══════════════════════════════════════ -->
  <div v-else class="rme-a4-page triase-a4-page" data-section="triase">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Triase IGD — Hal. 1/{{ totalPages }}</span>
    </div>
    <div class="rme-section-title">
      <i class="pi pi-heart-fill no-print" style="color: #e53935"></i> TRIASE IGD
    </div>

    <!-- ── Ringkasan Nilai Triase ─────────────────────────────────────────── -->
    <div v-if="nilaiTriase" class="triase-score-row">
      <div class="triase-score-box ts-emergensi">
        <div class="ts-count">{{ nilaiTriase.EMERGENSI || 0 }}</div>
        <div class="ts-lbl">EMERGENSI</div>
      </div>
      <div class="triase-score-box ts-urgent">
        <div class="ts-count">{{ nilaiTriase.URGENT || 0 }}</div>
        <div class="ts-lbl">URGENT</div>
      </div>
      <div class="triase-score-box ts-nonurgent">
        <div class="ts-count">{{ nilaiTriase.NON_URGENT || 0 }}</div>
        <div class="ts-lbl">NON URGENT</div>
      </div>
      <div class="triase-score-box ts-death">
        <div class="ts-count">{{ nilaiTriase.DEATH_ON_ARRIVAL || 0 }}</div>
        <div class="ts-lbl">DEATH ON ARRIVAL</div>
      </div>
      <div class="triase-score-kesimpulan" :class="'ts-kes-' + kesimpulanKey">
        Kategori: <strong>{{ kesimpulanTriase }}</strong>
      </div>
    </div>

    <!-- ── Cara Masuk Pasien ──────────────────────────────────────────────── -->
    <div class="rme-subsection-title">Cara Masuk Pasien</div>
    <div class="rme-info-grid">
      <div class="rme-info-col">
        <table class="rme-tbl-info">
          <tbody>
            <tr>
              <td class="rme-td-lbl">Waktu Masuk</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.waktu || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Diantar Oleh</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.diantar_oleh || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Transportasi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.transportasi || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">DPJP</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.namadokter_sp || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="rme-info-col">
        <table class="rme-tbl-info">
          <tbody>
            <tr>
              <td class="rme-td-lbl">Kesadaran</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.kesadaran || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Status Psikologi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.status_psikologi || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Resiko Jatuh</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">
                <span
                  :class="[
                    'rme-badge',
                    header.resiko_jatuh === 'YA' ? 'rme-badge-danger' : 'rme-badge-success',
                  ]"
                >
                  {{ header.resiko_jatuh || '-' }}
                </span>
              </td>
            </tr>
            <tr v-if="header.telah_verif">
              <td class="rme-td-lbl">Verifikasi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val" style="color: #2e7d32">
                {{ header.telah_verif }}
                <span v-if="header.jam_verif"> — {{ header.jam_verif }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Anamnese Singkat ───────────────────────────────────────────────── -->
    <div class="rme-subsection-title">Anamnese Singkat</div>
    <div class="rme-info-grid">
      <div class="rme-info-col">
        <div class="triase-field-lbl">Keluhan Utama</div>
        <div class="rme-textarea-box">{{ header.keluhan_utama || '-' }}</div>
      </div>
      <div v-if="header.riwayat_penyakit_sekarang" class="rme-info-col">
        <div class="triase-field-lbl">Riwayat Penyakit Sekarang</div>
        <div class="rme-textarea-box">{{ header.riwayat_penyakit_sekarang }}</div>
      </div>
    </div>
    <div v-if="header.riwayat_penyakit_dahulu" class="rme-info-grid" style="margin-top: 6px">
      <div class="rme-info-col" style="flex: 1">
        <div class="triase-field-lbl">Riwayat Penyakit Dahulu</div>
        <div class="rme-textarea-box">{{ header.riwayat_penyakit_dahulu }}</div>
      </div>
    </div>

    <!-- ── Tanda-Tanda Vital ──────────────────────────────────────────────── -->
    <div class="rme-subsection-title">Keadaan Umum / Tanda-Tanda Vital</div>
    <div class="rme-vital-grid">
      <div class="rme-vital-card">
        <div class="rme-vital-label">Suhu</div>
        <div class="rme-vital-value">{{ header.suhu ?? '-' }}</div>
        <div class="rme-vital-unit">°C</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">TD</div>
        <div class="rme-vital-value">
          {{ header.tensi_sistol ?? '-' }}/{{ header.tensi_distol ?? '-' }}
        </div>
        <div class="rme-vital-unit">mmHg</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">Nadi</div>
        <div class="rme-vital-value">{{ header.nadipermenit ?? '-' }}</div>
        <div class="rme-vital-unit">x/mnt</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">Saturasi O₂</div>
        <div class="rme-vital-value">{{ header.saturasi ?? '-' }}</div>
        <div class="rme-vital-unit">%</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">Pernapasan</div>
        <div class="rme-vital-value">{{ header.respirasi ?? '-' }}</div>
        <div class="rme-vital-unit">x/mnt</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">Berat Badan</div>
        <div class="rme-vital-value">{{ header.bb ?? '-' }}</div>
        <div class="rme-vital-unit">kg</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">Tinggi Badan</div>
        <div class="rme-vital-value">{{ header.tb ?? '-' }}</div>
        <div class="rme-vital-unit">cm</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">Skala Nyeri</div>
        <div class="rme-vital-value">{{ header.nyeri ?? '-' }}</div>
        <div class="rme-vital-unit">/10</div>
      </div>
      <div class="rme-vital-card">
        <div class="rme-vital-label">Kesadaran</div>
        <div class="rme-vital-value" style="font-size: 12px; line-height: 1.3">
          {{ header.kesadaran ?? '-' }}
        </div>
        <div class="rme-vital-unit">&nbsp;</div>
      </div>
    </div>
    <!-- ── Visual Skala Nyeri ─────────────────────────────────────────────── -->
    <div class="nyeri-visual-wrap">
      <div class="nyeri-visual-face">
        <img :src="nyeriPic" class="nyeri-face-img" />
        <div class="nyeri-face-score">{{ header.nyeri ?? 0 }}</div>
      </div>
      <div class="nyeri-visual-body">
        <div class="nyeri-btn-row">
          <div
            v-for="btn in nyeriButtons"
            :key="btn.nilai"
            :class="[
              'nyeri-btn-item',
              btn.color,
              Number(header.nyeri) === btn.nilai ? 'nyeri-btn-active' : 'nyeri-btn-inactive',
            ]"
          >
            <span class="nyeri-btn-num">{{ btn.nilai }}</span>
            <span class="nyeri-btn-lbl">{{ btn.label }}</span>
          </div>
        </div>
        <div class="nyeri-info-row">
          <span class="nyeri-desc-text">{{ nyeriKeterangan }}</span>
          <span v-if="header.lokasinyeri" class="nyeri-lokasi">
            📍 Lokasi: <strong>{{ header.lokasinyeri }}</strong>
          </span>
        </div>
        <div class="nyeri-legend-row-print">
          <span><span class="nyeri-dot nyeri-0-dot"></span> 0: Tidak nyeri</span>
          <span><span class="nyeri-dot nyeri-ringan-dot"></span> 1–3: Ringan</span>
          <span><span class="nyeri-dot nyeri-sedang-dot"></span> 4–6: Sedang</span>
          <span><span class="nyeri-dot nyeri-berat-dot"></span> 7–9: Berat</span>
          <span><span class="nyeri-dot nyeri-parah-dot"></span> 10: Tak tertahankan</span>
        </div>
      </div>
    </div>

    <!-- ── Status Obstetri (tampil jika status_hamil = 1) ───────────────── -->
    <div v-if="header.status_hamil == 1">
      <div class="rme-subsection-title">Status Obstetri</div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr>
                <td class="rme-td-lbl">G / P / A</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">
                  G{{ header.gravida ?? '-' }} P{{ header.para ?? '-' }} A{{
                    header.abortus ?? '-'
                  }}
                </td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Usia Kehamilan</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">
                  {{ header.usia_kehamilan_minggu ?? '-' }}
                  <span v-if="header.usia_kehamilan_minggu != null"> minggu</span>
                </td>
              </tr>
              <tr>
                <td class="rme-td-lbl">HPL</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.hpl ?? '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">TFU</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">
                  {{ header.leopold_tfu ?? '-' }}
                  <span v-if="header.leopold_tfu != null"> cm</span>
                </td>
              </tr>
              <tr>
                <td class="rme-td-lbl">DJJ</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">
                  {{ header.djj ?? '-' }}
                  <span v-if="header.djj != null"> x/mnt</span>
                </td>
              </tr>
              <tr>
                <td class="rme-td-lbl">DJJ Reguler</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">
                  {{
                    header.djj_reguler == null
                      ? '-'
                      : header.djj_reguler
                        ? 'Reguler'
                        : 'Tidak Reguler'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tbody>
              <tr>
                <td class="rme-td-lbl">Leopold I</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.leopold_i ?? '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Leopold II Punggung</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.leopold_ii_punggung ?? '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Leopold II Posisi</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.leopold_ii_posisi ?? '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Leopold III</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.leopold_iii ?? '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Leopold III Masuk PAP</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">
                  {{
                    header.leopold_iii_masuk == 1
                      ? 'Ya'
                      : header.leopold_iii_masuk == 0
                        ? 'Tidak'
                        : '-'
                  }}
                </td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Leopold IV Metode</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.leopold_iv_metode ?? '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Leopold IV Konvergensi</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.leopold_iv_konvergensi ?? '-' }}</td>
              </tr>
              <tr>
                <td class="rme-td-lbl">Leopold IV Perlimaan</td>
                <td class="rme-td-sep">:</td>
                <td class="rme-td-val">{{ header.leopold_iv_perlimaan ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ Halaman 2 : Tabel Triase + Secondary Survey + Catatan + RTL ════════ -->
  <div v-if="hasData" class="rme-a4-page triase-a4-page" data-section="triase">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Triase IGD — Hal. 2/{{ totalPages }}</span>
    </div>

    <!-- ── Tabel Pemeriksaan Triase ───────────────────────────────────────── -->
    <div v-if="triaseFact && triaseFact.length > 0">
      <div class="rme-subsection-title" style="color: #000">Hasil Pemeriksaan Triase</div>
      <table class="rme-tbl-data triase-tbl">
        <thead>
          <tr>
            <th style="width: 18%">PEMERIKSAAN</th>
            <th class="tc-head tc-head-emergensi" style="width: 20.5%">EMERGENSI</th>
            <th class="tc-head tc-head-urgent" style="width: 20.5%">URGENT</th>
            <th class="tc-head tc-head-nonurgent" style="width: 20.5%">NON URGENT</th>
            <th class="tc-head tc-head-death" style="width: 20.5%">DEATH ON ARRIVAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="group in triaseFact" :key="group.grouping">
            <td>
              <strong>{{ group.grouping }}</strong>
            </td>

            <!-- EMERGENSI col -->
            <td>
              <template v-for="(det, idx) in group.details" :key="'e' + idx">
                <div
                  v-if="det.sk_1"
                  :class="[
                    'triase-item',
                    det.checked_val_1 ? 'triase-checked tc-txt-emergensi' : 'triase-unchecked',
                  ]"
                >
                  <span v-if="det.checked_val_1" class="triase-check-icon">✓</span>
                  {{ det.sk_1 }}
                </div>
              </template>
            </td>

            <!-- URGENT col -->
            <td>
              <template v-for="(det, idx) in group.details" :key="'u' + idx">
                <div
                  v-if="det.sk_2"
                  :class="[
                    'triase-item',
                    det.checked_val_2 ? 'triase-checked tc-txt-urgent' : 'triase-unchecked',
                  ]"
                >
                  <span v-if="det.checked_val_2" class="triase-check-icon">✓</span>
                  {{ det.sk_2 }}
                </div>
              </template>
            </td>

            <!-- NON URGENT col -->
            <td>
              <template v-for="(det, idx) in group.details" :key="'n' + idx">
                <div
                  v-if="det.sk_4"
                  :class="[
                    'triase-item',
                    det.checked_val_4 ? 'triase-checked tc-txt-nonurgent' : 'triase-unchecked',
                  ]"
                >
                  <span v-if="det.checked_val_4" class="triase-check-icon">✓</span>
                  {{ det.sk_4 }}
                </div>
              </template>
            </td>

            <!-- DEATH ON ARRIVAL col -->
            <td>
              <template v-for="(det, idx) in group.details" :key="'d' + idx">
                <div
                  v-if="det.sk_5"
                  :class="[
                    'triase-item',
                    det.checked_val_5 ? 'triase-checked tc-txt-death' : 'triase-unchecked',
                  ]"
                >
                  <span v-if="det.checked_val_5" class="triase-check-icon">✓</span>
                  {{ det.sk_5 }}
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Secondary Survey ──────────────────────────────────────────────── -->
    <div v-if="secondarySurvey && secondarySurvey.length > 0">
      <div class="rme-subsection-title">Secondary Survey</div>
      <table class="rme-tbl-data">
        <thead>
          <tr>
            <th style="width: 30%">OBJEK</th>
            <th>KONDISI</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in secondarySurvey" :key="item.id">
            <td>
              <strong>{{ item.organ }}</strong>
            </td>
            <td>
              <span v-if="item.kondisi === 'NORMAL'" class="rme-badge rme-badge-success">
                NORMAL
              </span>
              <span v-else>{{ item.kondisi || 'NORMAL' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Diagnosa ─────────────────────────────────────────────────────── -->
    <div v-if="diagnosa">
      <div class="rme-subsection-title">
        Diagnosa
        <span
          v-if="diagnosa.id"
          style="font-size: 12px; font-weight: 400; color: #6c757d; margin-left: 6px"
        >
          #{{ diagnosa.id }}
        </span>
      </div>
      <table class="rme-tbl-data">
        <thead>
          <tr>
            <th style="width: 28%">JENIS</th>
            <th>DIAGNOSA</th>
            <th style="width: 18%">JENIS KASUS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Diagnosa Utama</strong></td>
            <td>{{ diagnosa.dx_utama || '-' }}</td>
            <td>
              <span
                :class="[
                  'rme-badge',
                  diagnosa.jenis_kasus === 'Baru' ? 'rme-badge-success' : 'rme-badge-secondary',
                ]"
                >{{ diagnosa.jenis_kasus || '-' }}</span
              >
            </td>
          </tr>
          <tr v-if="diagnosa.dx_sekunder">
            <td><strong>Diagnosa Sekunder</strong></td>
            <td>{{ diagnosa.dx_sekunder }}</td>
            <td></td>
          </tr>
          <tr v-else>
            <td><strong>Diagnosa Sekunder</strong></td>
            <td colspan="2" style="color: #9e9e9e; font-style: italic">
              Tidak ada diagnosa sekunder
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Data Penunjang (Lab & Radiologi) ────────────────────────────── -->
    <div v-if="penunjang.length > 0">
      <div class="rme-subsection-title">Data Penunjang</div>
      <table class="rme-tbl-data">
        <thead>
          <tr>
            <th style="width: 28%">KATEGORI</th>
            <th>NAMA LAYANAN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in penunjang" :key="i">
            <td>
              <strong>{{ item.KATEGORI }}</strong>
            </td>
            <td>{{ item.NAMA_LAYANAN }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Catatan Penting ────────────────────────────────────────────────── -->
    <div v-if="header.catatanpenting || header.CATATANPENTING">
      <div class="rme-subsection-title">Catatan Penting</div>
      <div class="rme-textarea-box">
        {{ header.catatanpenting || header.CATATANPENTING }}
      </div>
    </div>

    <!-- ── Rencana Tindak Lanjut ─────────────────────────────────────────── -->
    <div v-if="rtl">
      <div class="rme-subsection-title">Rencana Tindak Lanjut</div>
      <div class="triase-rtl-row">
        <span :class="['rme-badge', getRtlBadge(rtl.STATUS)]">{{ rtlLabel }}</span>
        <span v-if="rtl.KETERANGAN" class="triase-rtl-keterangan">{{ rtl.KETERANGAN }}</span>
        <span v-if="rtl.STATUS == '7' && rtl.NAMADOKTER" class="triase-rtl-dokter-inline">
          <span class="triase-rtl-doctor-label">DPJP:</span>
          <span class="triase-rtl-doctor-name">{{ rtl.NAMADOKTER }}</span>
          <span v-if="rtl.KDDOKTER" class="triase-rtl-doctor-code">({{ rtl.KDDOKTER }})</span>
        </span>
      </div>
    </div>
  </div>

  <!-- ══ Halaman 3 : Formulir Pemberian Obat ══════════════════════════════════ -->
  <div
    v-if="hasData && formulirObat.length > 0"
    class="rme-a4-page triase-a4-page"
    data-section="triase"
  >
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Triase IGD — Hal. 3/{{ totalPages }}</span>
    </div>
    <div class="rme-subsection-title fo-section-title">Formulir Pemberian Obat</div>
    <table class="rme-tbl-data">
      <thead>
        <tr>
          <th class="fo-th-no">No</th>
          <th class="fo-th-obat">Nama Obat</th>
          <th>Dosis</th>
          <th>Frekuensi</th>
          <th>Rute</th>
          <th>Waktu Pemberian</th>
          <th>Ruangan</th>
          <th>High Alert</th>
          <th>Verifikasi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(obat, idx) in formulirObat" :key="obat.id">
          <td class="fo-td-center">{{ idx + 1 }}</td>
          <td>
            <strong>{{ obat.nama_obat || '-' }}</strong>
          </td>
          <td>{{ obat.dosis || '-' }}</td>
          <td>{{ obat.frekwensi || '-' }}</td>
          <td>{{ obat.rute || '-' }}</td>
          <td>{{ formatDateTime(obat.waktu) }}</td>
          <td>{{ obat.ruangan || '-' }}</td>
          <td>
            <span
              :class="[
                'rme-badge',
                obat.obat_dc === 'YA' ? 'rme-badge-danger' : 'rme-badge-success',
              ]"
              >{{ obat.obat_dc || '-' }}</span
            >
          </td>
          <td>
            <template v-if="obat.auth == '1'">
              <div class="fo-verif-name">✓ {{ obat.auth_by }}</div>
              <div class="fo-verif-time">{{ formatDateTime(obat.time_verif) }}</div>
            </template>
            <span v-else class="rme-badge rme-badge-warning">Belum</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ══ Halaman 3+ : SOAP / CPPT IGD ═══════════════════════════════════════ -->
  <!-- Loading SOAP -->
  <div v-if="hasData && loadingSOAP" class="rme-a4-page triase-a4-page" data-section="triase">
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Triase IGD — Hal. {{ soapStartPage }}/{{ totalPages }}</span>
    </div>
    <div class="rme-subsection-title igd-soap-section-title">
      <i class="pi pi-file-edit" style="color: #00897b; margin-right: 4px"></i>
      Catatan SOAP / CPPT IGD
    </div>
    <div class="rme-loading-row" style="margin: 6px 0">
      <span class="rme-loading-dot"></span> Memuat catatan SOAP...
    </div>
  </div>
  <!-- Empty SOAP -->
  <div
    v-else-if="hasData && fact.length === 0"
    class="rme-a4-page triase-a4-page"
    data-section="triase"
  >
    <div class="rme-page-header-repeat">
      <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
      <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
      <span class="rme-phr-reg">Triase IGD — Hal. {{ soapStartPage }}/{{ totalPages }}</span>
    </div>
    <div class="rme-subsection-title igd-soap-section-title">
      <i class="pi pi-file-edit" style="color: #00897b; margin-right: 4px"></i>
      Catatan SOAP / CPPT IGD
    </div>
    <div class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada catatan SOAP untuk kunjungan ini.
    </div>
  </div>
  <!-- SOAP chunks: satu halaman A4 per chunk -->
  <template v-else-if="hasData">
    <div
      v-for="(chunk, pageIdx) in soapChunks"
      :key="'soap-page-' + pageIdx"
      class="rme-a4-page triase-a4-page"
      data-section="triase"
    >
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg"
          >Triase — SOAP Hal. {{ pageIdx + soapStartPage }}/{{ totalPages }}</span
        >
      </div>
      <div v-if="pageIdx === 0" class="rme-subsection-title igd-soap-section-title">
        <i class="pi pi-file-edit" style="color: #00897b; margin-right: 4px"></i>
        Catatan SOAP / CPPT IGD
      </div>
      <div class="igd-soap-list">
        <div
          v-for="item in chunk"
          :key="item.id"
          class="igd-soap-card"
          :class="{ 'igd-soap-auth': item.hasbeen_auth == 1 }"
        >
          <!-- header -->
          <div class="igd-soap-hdr">
            <div class="igd-soap-hdr-left">
              <span class="igd-soap-counter">#{{ item.counter }}</span>
              <span
                :class="[
                  'rme-badge',
                  item.jenis_dok === 'SBAR' ? 'rme-badge-warning' : 'igd-badge-teal',
                ]"
              >
                {{ item.jenis_dok || 'SOAP' }}
              </span>
              <span class="igd-soap-time">{{ item.waktu_display || '-' }}</span>
            </div>
            <div class="igd-soap-hdr-right">
              <span class="igd-soap-ppa">
                <strong>{{ item.profesi || '' }}</strong>
                <span v-if="item.verif_user_display"> — {{ item.verif_user_display }}</span>
              </span>
              <span v-if="item.hasbeen_auth == 1" class="rme-badge rme-badge-success">
                {{ '✓' }} Terotorisasi
              </span>
            </div>
          </div>

          <!-- TTV -->
          <div v-if="hasTTV(item)" class="igd-soap-ttv">
            <span v-if="Number(item.suhu) > 0">🌡 {{ item.suhu }}°C</span>
            <span v-if="Number(item.sistole) > 0"
              >🩺 {{ item.sistole }}/{{ item.diastole }} mmHg</span
            >
            <span v-if="Number(item.nadi) > 0">❤️ {{ item.nadi }}x/mnt</span>
            <span v-if="Number(item.spo2) > 0">🫁 SpO₂ {{ item.spo2 }}%</span>
            <span v-if="Number(item.pernafasan) > 0 || Number(item.respirasi) > 0">
              🌬 {{ item.pernafasan || item.respirasi }}x/mnt
            </span>
            <span v-if="Number(item.gcs) > 0">🧠 GCS {{ item.gcs }}</span>
          </div>

          <!-- SOAP grid -->
          <div class="igd-soap-grid">
            <div v-if="item.subject" class="igd-soap-field igd-soap-s">
              <div class="igd-soap-lbl">{{ item.caption1 || 'S' }}</div>
              <div class="igd-soap-val" v-html="formatText(item.subject)"></div>
            </div>
            <div v-if="item.object_display || item.object" class="igd-soap-field igd-soap-o">
              <div class="igd-soap-lbl">{{ item.caption2 || 'O' }}</div>
              <div
                class="igd-soap-val igd-soap-obj-html"
                v-html="item.object_display || formatText(item.object)"
              ></div>

              {{ item.object || '' }}
            </div>
            <div v-if="item.asessment" class="igd-soap-field igd-soap-a">
              <div class="igd-soap-lbl">{{ item.caption3 || 'A' }}</div>
              <div class="igd-soap-val" v-html="formatText(item.asessment)"></div>
            </div>
            <div v-if="item.plan" class="igd-soap-field igd-soap-p">
              <div class="igd-soap-lbl">{{ item.caption4 || 'P' }}</div>
              <div class="igd-soap-val" v-html="formatText(item.plan)"></div>
            </div>
          </div>

          <!-- Catatan penting -->
          <div v-if="item.catatan_penting" class="igd-soap-catatan">
            <span class="igd-soap-catatan-lbl">📌 Catatan Penting:</span>
            {{ item.catatan_penting }}
          </div>

          <!-- SBAR -->
          <div v-if="item.jenis_dok === 'SBAR'" class="igd-soap-verif">
            <template v-if="item.verif == 1">
              <span class="rme-badge rme-badge-success">{{ '✓' }} Terverifikasi DPJP</span>
              <span v-if="item.profesi_verif" class="igd-soap-ppa-sm">
                {{ item.profesi_verif }} — {{ item.verif_by_name }}
              </span>
            </template>
            <span v-else class="rme-badge rme-badge-warning">⏳ Menunggu Verifikasi DPJP</span>
          </div>

          <!-- QR otorisasi -->
          <div v-if="item.hasbeen_auth == 1" class="igd-soap-qr">
            <QrcodeVue
              :value="qrValueSOAP(item)"
              :size="64"
              level="H"
              render-as="svg"
              class="igd-soap-qr-code"
            />
            <div class="igd-soap-qr-info">
              <div class="igd-soap-qr-title">✓ Dokumen Terotorisasi</div>
              <!-- <div v-if="item.time_auth" class="igd-soap-qr-time">{{ item.time_auth }}</div> -->
              <div v-if="item.verif_user_display" class="igd-soap-qr-by">
                {{ item.verif_user_display }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})
const addTimelineEvent = inject('addTimelineEvent', () => {})

const loading = ref(true)
const error = ref(null)
const header = ref({})
const triaseFact = ref([])
const nilaiTriase = ref(null)
const secondarySurvey = ref([])
const rtl = ref(null)
const diagnosa = ref(null)
const formulirObat = ref([])
const penunjang = ref([])

const penunjangLab = computed(() => penunjang.value.filter((x) => x.KATEGORI === 'LABORATORIUM'))
const penunjangRadiologi = computed(() => penunjang.value.filter((x) => x.KATEGORI === 'RADIOLOGI'))

// SOAP / CPPT IGD — state terpisah agar tidak memblokir tampilan triase
const fact = ref([])
const loadingSOAP = ref(false)

// Data dianggap ada jika API mengembalikan code 200
const hasData = computed(() => header.value?.code === 200)

// Chunking SOAP: 2 kartu per halaman A4
const SOAP_PER_PAGE = 2
const soapChunks = computed(() => {
  const result = []
  for (let i = 0; i < fact.value.length; i += SOAP_PER_PAGE) {
    result.push(fact.value.slice(i, i + SOAP_PER_PAGE))
  }
  return result
})
const soapStartPage = computed(() => (formulirObat.value.length > 0 ? 4 : 3))
// Total halaman = 2 (info + tabel) + halaman formulir obat (opsional) + halaman SOAP (min 1)
const totalPages = computed(
  () => 2 + (formulirObat.value.length > 0 ? 1 : 0) + Math.max(soapChunks.value.length, 1),
)

// Visual skala nyeri
const nyeriPic = computed(() => {
  const n = Number(header.value?.nyeri ?? 0)
  if (n === 0) return 'https://ws-simrs.net/skala_nyeri/a.png'
  if (n >= 1 && n <= 3) return 'https://ws-simrs.net/skala_nyeri/b.png'
  if (n >= 4 && n <= 6) return 'https://ws-simrs.net/skala_nyeri/c.png'
  if (n >= 7 && n <= 9) return 'https://ws-simrs.net/skala_nyeri/d.png'
  return 'https://ws-simrs.net/skala_nyeri/e.png'
})

const nyeriButtons = [
  { nilai: 0, color: 'nyeri-btn-0', label: 'Tidak' },
  { nilai: 1, color: 'nyeri-btn-ringan', label: 'Ringan' },
  { nilai: 2, color: 'nyeri-btn-ringan', label: 'Ringan' },
  { nilai: 3, color: 'nyeri-btn-ringan', label: 'Ringan' },
  { nilai: 4, color: 'nyeri-btn-sedang', label: 'Sedang' },
  { nilai: 5, color: 'nyeri-btn-sedang', label: 'Sedang' },
  { nilai: 6, color: 'nyeri-btn-sedang', label: 'Sedang' },
  { nilai: 7, color: 'nyeri-btn-berat', label: 'Berat' },
  { nilai: 8, color: 'nyeri-btn-berat', label: 'Berat' },
  { nilai: 9, color: 'nyeri-btn-berat', label: 'Berat' },
  { nilai: 10, color: 'nyeri-btn-parah', label: 'Parah' },
]

const nyeriKeterangan = computed(() => {
  const map = {
    0: 'Tidak ada nyeri',
    1: 'Nyeri sangat ringan',
    2: 'Nyeri ringan',
    3: 'Nyeri ringan terasa',
    4: 'Nyeri sedang',
    5: 'Nyeri sedang lebih kuat',
    6: 'Nyeri sedang-berat',
    7: 'Nyeri berat',
    8: 'Nyeri berat sekali',
    9: 'Nyeri sangat berat',
    10: 'Nyeri tak tertahankan',
  }
  return map[Number(header.value?.nyeri ?? 0)] || '-'
})

// Tentukan kategori triase tertinggi
const kesimpulanKey = computed(() => {
  if (!nilaiTriase.value) return ''
  if ((nilaiTriase.value.EMERGENSI || 0) > 0) return 'emergensi'
  if ((nilaiTriase.value.URGENT || 0) > 0) return 'urgent'
  if ((nilaiTriase.value.NON_URGENT || 0) > 0) return 'nonurgent'
  if ((nilaiTriase.value.DEATH_ON_ARRIVAL || 0) > 0) return 'death'
  return ''
})

const kesimpulanTriase = computed(() => {
  const k = kesimpulanKey.value
  if (k === 'emergensi') return 'EMERGENSI'
  if (k === 'urgent') return 'URGENT'
  if (k === 'nonurgent') return 'NON URGENT'
  if (k === 'death') return 'DEATH ON ARRIVAL'
  return 'BELUM DITENTUKAN'
})

// Label rencana tindak lanjut berdasar kode STATUS
const rtlLabel = computed(() => {
  if (!rtl.value) return '-'
  const map = {
    1: 'Pulang',
    2: 'Observasi',
    3: 'Rawat Jalan',
    4: 'Rujuk Keluar',
    5: 'APS (Atas Permintaan Sendiri)',
    6: 'Meninggal',
    7: 'Rawat Inap',
  }
  return map[rtl.value.STATUS] || `Status ${rtl.value.STATUS}`
})

const getRtlBadge = (status) => {
  const map = {
    1: 'rme-badge-success',
    2: 'rme-badge-info',
    3: 'rme-badge-info',
    4: 'rme-badge-warning',
    5: 'rme-badge-warning',
    6: 'rme-badge-danger',
    7: 'rme-badge-dark',
  }
  return map[status] || 'rme-badge-default'
}

/**
 * Tentukan noregister yang dipakai untuk query triase IGD:
 *  - Rawat Jalan → NOPENDAFTARAN
 *  - Rawat Inap / IGD / lainnya → NOREFF_IGD (nomor reff dari IGD)
 * Fallback ke props.noreg (URL) bila field dataPasien belum tersedia.
 */
const getNoregTriase = () => {
  const jenis = props.dataPasien?.JENISRAWAT
  if (jenis === 'JALAN') return props.dataPasien.NOPENDAFTARAN || props.noreg
  if (jenis) return props.dataPasien.NOREFF_IGD || props.noreg
  return props.noreg // dataPasien belum ada — fallback
}

/** Escape plain-text field agar aman di v-html */
const formatText = (text) => {
  if (!text) return '-'
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

/** Cek apakah ada TTV yang terisi */
const hasTTV = (item) =>
  Number(item.suhu) > 0 ||
  Number(item.sistole) > 0 ||
  Number(item.nadi) > 0 ||
  Number(item.spo2) > 0 ||
  Number(item.pernafasan) > 0 ||
  Number(item.respirasi) > 0 ||
  Number(item.gcs) > 0

/** Format datetime YYYY-MM-DD HH:MM:SS → HH:MM DD/MM/YYYY */
const formatDateTime = (dt) => {
  if (!dt) return '-'
  const [date, time] = String(dt).split(' ')
  if (!date) return dt
  const [y, m, d] = date.split('-')
  const hm = time ? time.slice(0, 5) : ''
  return hm ? `${hm} ${d}/${m}/${y}` : `${d}/${m}/${y}`
}

/** Nilai QR untuk SOAP yang sudah otorisasi */
const qrValueSOAP = (item) =>
  ['SOAP-IGD', item.id, props.noreg, item.profesi, item.verif_user_display]
    .map((v) => v ?? '')
    .join('|')

const fetchPenunjang = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_notif_penunjang_json`,
      { mode: 1, noregister: [getNoregTriase()] },
      { headers: { 'Content-Type': 'application/json' } },
    )
    penunjang.value = response.data?.results || []
  } catch (e) {
    console.error('Gagal memuat data penunjang:', e)
  }
}

const fetchDatasOAP_igd = async () => {
  loadingSOAP.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Triaseigd/get_soap`,
      { mode: 4, noregister: getNoregTriase(), id_client: id_client.value },
      { headers: { 'Content-Type': 'application/json' } },
    )
    fact.value = (response.data?.response || []).filter((x) => x.deleted !== '1')
  } catch (e) {
    console.error('Gagal memuat SOAP IGD:', e)
  } finally {
    loadingSOAP.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const payload = {
      noregister: getNoregTriase(),
      id_client: id_client.value,
      norm: props.dataPasien?.NOMR || '',
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Triaseigd/getitem_triase`, payload)

    const data = response.data
    header.value = data.header || {}
    triaseFact.value = data.response || []
    nilaiTriase.value = data.nilatriase || null

    if (data.survey && data.survey.length > 0) {
      secondarySurvey.value = data.survey
    }

    // Rencana tindak lanjut — ambil dari rencana_tindak_lanjut, fallback ke header
    const rtlSrc = data.rencana_tindak_lanjut
    if (rtlSrc?.STATUS !== undefined && rtlSrc?.STATUS !== null) {
      rtl.value = {
        STATUS: rtlSrc.STATUS,
        KETERANGAN: rtlSrc.KETERANGAN || '',
        KDDOKTER: rtlSrc.KDDOKTER || '',
        NAMADOKTER: rtlSrc.NAMADOKTER || '',
      }
    } else if (data.header?.STATUS !== undefined && data.header?.STATUS !== null) {
      rtl.value = {
        STATUS: data.header.STATUS,
        KETERANGAN: data.header.KETERANGAN || '',
        KDDOKTER: '',
        NAMADOKTER: '',
      }
    }

    if (data.diagnosa?.metadata?.code === 200 && data.diagnosa?.response) {
      diagnosa.value = data.diagnosa.response
    }

    if (data.formulir_obat?.metadata?.code === 200 && data.formulir_obat?.response) {
      formulirObat.value = data.formulir_obat.response
    }
  } catch (e) {
    error.value = 'Gagal memuat data triase: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    const hasTriase = header.value?.code === 200
    reportSectionData('triase', hasTriase)
    if (hasTriase) {
      addTimelineEvent('triase', {
        key: 'triase',
        label: 'Triase IGD',
        icon: '🚨',
        color: '#b71c1c',
        datetime: header.value?.waktu || '',
        meta: kesimpulanTriase.value !== 'BELUM DITENTUKAN' ? kesimpulanTriase.value : '',
      })
    }
  }
}

/**
 * Tunggu hingga dataPasien.JENISRAWAT tersedia (async di parent),
 * lalu fetch. `immediate: true` menangani kasus dataPasien sudah ada
 * saat komponen mount; watch menangani kasus dataPasien belum ada.
 */
watch(
  () => props.dataPasien?.JENISRAWAT,
  (jenisrawat) => {
    if (jenisrawat) {
      fetchData()
      fetchDatasOAP_igd()
      fetchPenunjang()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* ── Ukuran A4 untuk setiap halaman ───────────────────────────────── */
/* min-height: 297mm diwarisi dari .rme-a4-page — JANGAN override di sini */
.triase-a4-page {
  box-sizing: border-box;
}

/* ── Ringkasan skor triase ─────────────────────────────────────────── */
.triase-score-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.triase-score-box {
  text-align: center;
  border-radius: 6px;
  padding: 8px 14px;
  min-width: 72px;
  color: #fff;
}
.ts-count {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}
.ts-lbl {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  margin-top: 3px;
  white-space: nowrap;
}
.ts-emergensi {
  background: #c62828;
}
.ts-urgent {
  background: #f9a825;
  color: #333;
}
.ts-nonurgent {
  background: #2e7d32;
}
.ts-death {
  background: #212121;
}

.triase-score-kesimpulan {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  background: #f5f5f5;
  color: #444;
  min-width: 120px;
  border: 1.5px solid #e0e0e0;
}
.ts-kes-emergensi {
  background: #ffebee;
  color: #c62828;
  border-color: #ef9a9a;
}
.ts-kes-urgent {
  background: #fffde7;
  color: #e65100;
  border-color: #ffe082;
}
.ts-kes-nonurgent {
  background: #e8f5e9;
  color: #1b5e20;
  border-color: #a5d6a7;
}
.ts-kes-death {
  background: #212121;
  color: #fff;
  border-color: #000;
}

/* ── Tabel triase ─────────────────────────────────────────────────── */
.triase-tbl thead th {
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  padding: 5px 4px;
}
.tc-head {
  color: #fff;
}
.tc-head-emergensi {
  background: #c62828 !important;
}
.tc-head-urgent {
  background: #f9a825 !important;
  color: #333 !important;
}
.tc-head-nonurgent {
  background: #2e7d32 !important;
}
.tc-head-death {
  background: #212121 !important;
}

.triase-item {
  font-size: 12px;
  padding: 1px 0;
  line-height: 1.4;
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.triase-checked {
  font-weight: 700;
}
.triase-unchecked {
  color: #3f3f3f;
  font-size: 11px;
}
.triase-check-icon {
  font-size: 13px;
  flex-shrink: 0;
}
.tc-txt-emergensi {
  color: #b71c1c;
}
.tc-txt-urgent {
  color: #bf360c;
}
.tc-txt-nonurgent {
  color: #1b5e20;
}
.tc-txt-death {
  color: #212121;
}

/* ── Helper classes ───────────────────────────────────────────────── */
.triase-field-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #555;
  margin-bottom: 3px;
}
.triase-field-note {
  font-size: 11px;
  padding: 4px 8px;
  color: #555;
  margin-top: 4px;
}
.triase-rtl-row {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  font-size: 12px;
  gap: 6px;
}
.triase-rtl-keterangan {
  flex: 1;
}
.triase-rtl-dokter-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  white-space: nowrap;
}
.triase-rtl-doctor-label {
  font-weight: 600;
  color: #555;
}
.triase-rtl-doctor-name {
  font-style: italic;
}
.triase-rtl-doctor-code {
  color: #888;
  font-size: 11px;
}

/* ══════════════════════════════════════════════
   IGD SOAP — desain teal, berbeda dari CPPT
   ══════════════════════════════════════════════ */
.igd-soap-section-title {
  margin-top: 14px;
}
.igd-soap-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

/* Card: left-border teal */
.igd-soap-card {
  border: 1px solid #b2dfdb;
  border-left: 4px solid #00897b;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}
.igd-soap-auth {
  border-left-color: #2e7d32;
  background: #fafffe;
}

/* Header ringan — tidak ada gradient gelap seperti CPPT */
.igd-soap-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 5px 10px;
  background: #e0f2f1;
  border-bottom: 1px solid #b2dfdb;
}
.igd-soap-hdr-left,
.igd-soap-hdr-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.igd-soap-counter {
  font-size: 12px;
  font-weight: 700;
  color: #00695c;
  background: rgba(0, 105, 92, 0.12);
  border-radius: 10px;
  padding: 1px 7px;
  flex-shrink: 0;
}
.igd-badge-teal {
  background: #00897b !important;
  color: #fff !important;
  border-color: #00897b !important;
}
.igd-soap-time {
  font-size: 12px;
  color: #555;
}
.igd-soap-ppa {
  font-size: 12px;
  color: #444;
}
.igd-soap-ppa-sm {
  font-size: 12px;
  color: #555;
  margin-left: 6px;
}

/* TTV — pill teal */
.igd-soap-ttv {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px 10px;
  background: #f0faf9;
  border-bottom: 1px dashed #b2dfdb;
  font-size: 12px;
}
.igd-soap-ttv span {
  background: #e0f2f1;
  color: #004d40;
  border-radius: 12px;
  padding: 1px 8px;
  white-space: nowrap;
}

/* SOAP grid — 2 kolom x 2 baris */
.igd-soap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1px;
  background: #b2dfdb;
  padding: 1px;
}
.igd-soap-field {
  background: #fff;
  padding: 5px 8px;
  min-height: 32px;
}
.igd-soap-s {
  grid-column: 1;
  grid-row: 1;
}
.igd-soap-o {
  grid-column: 2;
  grid-row: 1;
}
.igd-soap-a {
  grid-column: 1;
  grid-row: 2;
}
.igd-soap-p {
  grid-column: 2;
  grid-row: 2;
}

.igd-soap-lbl {
  font-size: 11px;
  font-weight: 700;
  color: #00897b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
  border-bottom: 1px solid #e0f2f1;
  padding-bottom: 2px;
}
.igd-soap-val {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}
.igd-soap-obj-html :deep(*) {
  font-size: 13px !important;
  font-family: 'Segoe UI', Arial, sans-serif !important;
  line-height: 1.5 !important;
  color: #333 !important;
}

/* Catatan penting */
.igd-soap-catatan {
  margin: 6px 10px 0;
  padding: 4px 8px;
  background: #fff8e1;
  border-left: 3px solid #f9a825;
  border-radius: 2px;
  font-size: 13px;
  color: #5d4037;
}
.igd-soap-catatan-lbl {
  font-weight: 700;
  margin-right: 4px;
}

/* SBAR & QR */
.igd-soap-verif {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-top: 1px dashed #b2dfdb;
  font-size: 13px;
}
.igd-soap-qr {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 10px 8px;
  padding: 5px 8px;
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 4px;
}
.igd-soap-qr-code {
  flex-shrink: 0;
  background: #fff;
  padding: 3px;
  border-radius: 3px;
}
.igd-soap-qr-info {
  flex: 1;
}
.igd-soap-qr-title {
  font-size: 12px;
  font-weight: 700;
  color: #2e7d32;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.igd-soap-qr-time,
.igd-soap-qr-by {
  font-size: 12px;
  color: #555;
  margin-top: 1px;
}
.igd-soap-qr-by {
  font-style: italic;
}

/* ── Visual Skala Nyeri ──────────────────────────────────────────── */
.nyeri-visual-wrap {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 6px 0 4px;
  padding: 7px 10px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}
.nyeri-visual-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}
.nyeri-face-img {
  width: 46px;
  height: 46px;
  object-fit: contain;
}
.nyeri-face-score {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1565c0;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nyeri-visual-body {
  flex: 1;
  min-width: 0;
}
.nyeri-btn-row {
  display: flex;
  gap: 2px;
}
.nyeri-btn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 4px;
  padding: 3px 0;
  flex: 1;
  min-width: 0;
}
.nyeri-btn-num {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.nyeri-btn-lbl {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-top: 1px;
  white-space: nowrap;
}
.nyeri-btn-active {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3.5px rgba(0, 0, 0, 0.45);
  transform: scale(1.1);
  position: relative;
  z-index: 1;
}
.nyeri-btn-inactive {
  opacity: 0.4;
}
.nyeri-btn-0 {
  background: #43a047;
}
.nyeri-btn-ringan {
  background: #8bc34a;
}
.nyeri-btn-sedang {
  background: #ffa726;
}
.nyeri-btn-berat {
  background: #ef5350;
}
.nyeri-btn-parah {
  background: #b71c1c;
}

.nyeri-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  flex-wrap: wrap;
}
.nyeri-desc-text {
  font-style: italic;
  color: #555;
}
.nyeri-lokasi {
  color: #444;
}
.nyeri-legend-row-print {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #e0e0e0;
  font-size: 11px;
  color: #777;
}
.nyeri-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 2px;
  vertical-align: middle;
}
.nyeri-0-dot {
  background: #43a047;
}
.nyeri-ringan-dot {
  background: #8bc34a;
}
.nyeri-sedang-dot {
  background: #ffa726;
}
.nyeri-berat-dot {
  background: #ef5350;
}
.nyeri-parah-dot {
  background: #b71c1c;
}

/* ── Formulir Pemberian Obat ─────────────────────────────────────── */
.fo-section-title {
  color: #1565c0;
}
.fo-th-no {
  width: 4%;
  text-align: center;
}
.fo-th-obat {
  width: 20%;
}
.fo-td-center {
  text-align: center;
}
.fo-verif-name {
  font-size: 12px;
  font-weight: 700;
  color: #2e7d32;
}
.fo-verif-time {
  font-size: 11px;
  color: #666;
  margin-top: 1px;
}

@media print {
  .igd-soap-qr {
    border-color: #888;
    background: #f8fdf8;
  }
}
</style>
