<template>
  <Dialog
    v-model:visible="internalVisible"
    modal
    maximizable
    :style="{ width: '92vw', maxWidth: '1300px' }"
    :breakpoints="{ '768px': '98vw' }"
    :draggable="false"
    class="hd-history-dialog"
    @hide="onHide"
  >
    <!-- ── Custom Header ── -->
    <template #header>
      <div class="dlg-header">
        <div class="dlg-header-top">
          <div class="dlg-header-left">
            <div class="dlg-header-icon"><i class="pi pi-history" /></div>
            <div>
              <div class="dlg-header-title">Riwayat Hemodialisa</div>
              <div class="dlg-header-sub">Rekam medis sesi HD pasien</div>
            </div>
          </div>
          <div class="dlg-header-stats">
            <div class="stat-chip">
              <span class="stat-val">{{ totalSesi }}</span>
              <span class="stat-lbl">Total Sesi</span>
            </div>
            <div class="stat-chip warn" v-if="rataIDWG !== null">
              <span class="stat-val">{{ rataIDWG }} kg</span>
              <span class="stat-lbl">Rata-rata IDWG</span>
            </div>
            <div class="stat-chip" :class="adekuasiClass" v-if="rataKTV !== null">
              <span class="stat-val">{{ rataKTV }}</span>
              <span class="stat-lbl">Rata-rata Kt/V</span>
            </div>
            <div class="stat-chip" :class="rataBalanceClass" v-if="rataBalance !== null">
              <span class="stat-val">{{ rataBalance }} ml</span>
              <span class="stat-lbl">Rata-rata Balance</span>
            </div>
          </div>
        </div>

        <div class="dlg-patient-bar">
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-user" /> Nama</span>
            <span class="patient-info-val">{{ datapasien?.NAMAPASIEN || '—' }}</span>
          </div>
          <div class="patient-divider" />
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-id-card" /> No. RM</span>
            <span class="patient-info-val">{{ datapasien?.NOMR || '—' }}</span>
          </div>
          <div class="patient-divider" />
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-file" /> No. Pendaftaran</span>
            <span class="patient-info-val">{{ datapasien?.NOPENDAFTARAN || '—' }}</span>
          </div>
          <div class="patient-divider" />
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-user-edit" /> Dokter</span>
            <span class="patient-info-val">{{
              datapasien?.NAMADOKTER || datapasien?.KDDOKTER || '—'
            }}</span>
          </div>
          <div class="patient-divider" />
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-building" /> Ruangan</span>
            <span class="patient-info-val">{{
              datapasien?.NAMARUANGAN || datapasien?.KDRUANGAN || '—'
            }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Body ── -->
    <div class="dlg-body">
      <DataTable
        :value="filteredData"
        :loading="loading"
        paginator
        :rows="8"
        :rowsPerPageOptions="[5, 8, 15, 20]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        dataKey="id"
        stripedRows
        class="history-table"
        v-model:expandedRows="expandedRows"
        responsiveLayout="scroll"
      >
        <Column expander style="width: 3rem" />

        <!-- Tanggal -->
        <Column field="tanggal" header="Tanggal" sortable style="min-width: 110px">
          <template #body="{ data }">
            <div class="cell-date">
              <i class="pi pi-calendar" style="font-size: 11px; color: #6c757d" />
              {{ formatDisplayDate(data.tanggal) }}
            </div>
          </template>
        </Column>

        <!-- BB / UF -->
        <Column header="BB / UF Goal" style="min-width: 140px">
          <template #body="{ data }">
            <div class="cell-stack">
              <span class="cell-main"
                >{{ data.bb_pre ?? '—' }} kg → {{ data.bb_post ?? '—' }} kg</span
              >
              <span class="cell-sub">
                UF Goal:
                <b>{{
                  data.bb_pre && data.bb_kering
                    ? (data.bb_pre - data.bb_kering).toFixed(1) + ' L'
                    : '—'
                }}</b>
              </span>
            </div>
          </template>
        </Column>

        <!-- IDWG -->
        <Column header="IDWG" field="idwg" sortable style="min-width: 90px">
          <template #body="{ data }">
            <Tag
              :value="data.idwg != null ? data.idwg + ' kg' : '—'"
              :severity="idwgSeverity(data.idwg)"
            />
          </template>
        </Column>

        <!-- TD -->
        <Column header="TD Pre → Post" style="min-width: 130px">
          <template #body="{ data }">
            <div class="cell-stack">
              <span class="cell-main">{{ data.td_pre || '—' }}</span>
              <span class="cell-sub">→ post: {{ data.td_post || '—' }}</span>
            </div>
          </template>
        </Column>

        <!-- Durasi & Kt/V -->
        <Column header="Durasi / Kt/V" style="min-width: 110px">
          <template #body="{ data }">
            <div class="cell-stack">
              <span class="cell-main">{{ data.durasi ? data.durasi + ' jam' : '—' }}</span>
              <span class="cell-sub" :class="ktvClass(data.ktv)">Kt/V: {{ data.ktv ?? '—' }}</span>
            </div>
          </template>
        </Column>

        <!-- Balance Cairan -->
        <Column header="Balance Cairan" style="min-width: 120px">
          <template #body="{ data }">
            <div class="cell-stack">
              <span class="cell-main" :class="balanceClass(data.balance_cairan)">
                {{ formatBalance(data.balance_cairan) }}
              </span>
              <span class="cell-sub">
                UF: {{ data.uf_aktual ? data.uf_aktual + ' ml' : '—' }}
              </span>
            </div>
          </template>
        </Column>

        <!-- Akses -->
        <Column field="akses_vaskuler" header="Akses" style="min-width: 95px">
          <template #body="{ data }">
            <Tag :value="data.akses_vaskuler || '—'" severity="info" />
          </template>
        </Column>

        <!-- Komplikasi -->
        <Column header="Komplikasi" style="min-width: 150px">
          <template #body="{ data }">
            <div class="komplikasi-tags" v-if="parseArr(data.komplikasi).length">
              <Tag
                v-for="k in parseArr(data.komplikasi)"
                :key="k"
                :value="k"
                :severity="k === 'Tidak Ada' ? 'success' : 'warn'"
                class="tag-sm"
              />
            </div>
            <span v-else class="cell-sub">—</span>
          </template>
        </Column>

        <!-- Kondisi Post -->
        <Column field="kondisi_post" header="Kondisi Post" style="min-width: 145px">
          <template #body="{ data }">
            <span class="cell-kondisi" :class="kondisiClass(data.kondisi_post)">
              {{ data.kondisi_post || '—' }}
            </span>
          </template>
        </Column>

        <!-- Action -->
        <Column header="" style="min-width: 75px; text-align: center">
          <template #body="{ data }">
            <div class="action-btns">
              <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                size="small"
                v-tooltip.top="'Detail'"
                @click="openDetail(data)"
              />
              <Button
                icon="pi pi-print"
                rounded
                text
                severity="secondary"
                size="small"
                v-tooltip.top="'Cetak'"
                @click="printData(data)"
              />
            </div>
          </template>
        </Column>

        <!-- ── Expand Row ── -->
        <template #expansion="{ data }">
          <div class="expand-panel">
            <div class="expand-grid">
              <!-- Vital Pre -->
              <div class="expand-card">
                <div class="expand-card-title"><i class="pi pi-heart-fill" /> Vital Pra-HD</div>
                <table class="mini-table">
                  <tbody>
                    <tr>
                      <td>BB Pre</td>
                      <td>
                        <b>{{ data.bb_pre ?? '—' }} kg</b>
                      </td>
                    </tr>
                    <tr>
                      <td>BB Kering</td>
                      <td>
                        <b>{{ data.bb_kering ?? '—' }} kg</b>
                      </td>
                    </tr>
                    <tr>
                      <td>BB Post Lalu</td>
                      <td>
                        <b>{{ data.bb_post_lalu ?? '—' }} kg</b>
                      </td>
                    </tr>
                    <tr>
                      <td>TD Pre</td>
                      <td>
                        <b>{{ data.td_pre || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Nadi Pre</td>
                      <td>
                        <b>{{ data.nadi_pre ?? '—' }} x/mnt</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Suhu Pre</td>
                      <td>
                        <b>{{ data.suhu_pre ?? '—' }} °C</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Keluhan Pre</td>
                      <td>
                        <b>{{ data.keluhan_pre || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Akses</td>
                      <td>
                        <b>{{ data.akses_vaskuler || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Kondisi Akses</td>
                      <td>
                        <b>{{ data.kondisi_akses || '—' }}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Program -->
              <div class="expand-card">
                <div class="expand-card-title"><i class="pi pi-cog" /> Program Dialisis</div>
                <table class="mini-table">
                  <tbody>
                    <tr>
                      <td>Durasi</td>
                      <td>
                        <b>{{ data.durasi ?? '—' }} jam</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Dialisat</td>
                      <td>
                        <b>{{ data.dialisat || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Qb</td>
                      <td>
                        <b>{{ data.qb_instruksi ?? '—' }} ml/mnt</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Qd</td>
                      <td>
                        <b>{{ data.qd_instruksi ?? '—' }} ml/mnt</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Antikoagulan</td>
                      <td>
                        <b>{{ data.antikoagulan || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Heparin</td>
                      <td>
                        <b>{{ data.dosis_heparin ?? '—' }} UI</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Dialyzer</td>
                      <td>
                        <b>{{ data.tipe_dialyzer || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Konduktivitas</td>
                      <td>
                        <b>{{ data.konduktivitas ?? '—' }} mS/cm</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Temp Dialisat</td>
                      <td>
                        <b>{{ data.temp_dialisat ?? '—' }} °C</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Keseimbangan Cairan -->
              <div class="expand-card">
                <div class="expand-card-title">
                  <i class="pi pi-chart-bar" /> Keseimbangan Cairan
                </div>

                <!-- Masuk -->
                <div class="fluid-sub-label fluid-in">
                  <i class="pi pi-arrow-down" /> Cairan Masuk
                </div>
                <table class="mini-table">
                  <tbody>
                    <tr>
                      <td>Infus / Priming</td>
                      <td>
                        <b>{{ data.cairan_infus ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Obat IV / Flush</td>
                      <td>
                        <b>{{ data.cairan_obat_iv ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Minum</td>
                      <td>
                        <b>{{ data.cairan_minum ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Lain-lain</td>
                      <td>
                        <b>{{ data.cairan_masuk_lain ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr class="fluid-total-row-mini">
                      <td><b>Total Masuk</b></td>
                      <td>
                        <b class="clr-in">{{ data.total_cairan_masuk ?? 0 }} ml</b>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Keluar -->
                <div class="fluid-sub-label fluid-out" style="margin-top: 8px">
                  <i class="pi pi-arrow-up" /> Cairan Keluar
                </div>
                <table class="mini-table">
                  <tbody>
                    <tr>
                      <td>UF Aktual</td>
                      <td>
                        <b>{{ data.uf_aktual ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Urine</td>
                      <td>
                        <b>{{ data.cairan_urine ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Perdarahan</td>
                      <td>
                        <b>{{ data.cairan_perdarahan ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Lain-lain</td>
                      <td>
                        <b>{{ data.cairan_keluar_lain ?? 0 }} ml</b>
                      </td>
                    </tr>
                    <tr class="fluid-total-row-mini">
                      <td><b>Total Keluar</b></td>
                      <td>
                        <b class="clr-out">{{ data.total_cairan_keluar ?? 0 }} ml</b>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Balance -->
                <div class="fluid-balance-badge" :class="balanceBadgeClass(data.balance_cairan)">
                  Balance: <b>{{ formatBalance(data.balance_cairan) }}</b>
                </div>
              </div>

              <!-- Evaluasi Post + Komplikasi + TTD -->
              <div class="expand-card">
                <div class="expand-card-title">
                  <i class="pi pi-check-circle" /> Evaluasi Pasca-HD
                </div>
                <table class="mini-table">
                  <tbody>
                    <tr>
                      <td>BB Post</td>
                      <td>
                        <b>{{ data.bb_post ?? '—' }} kg</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Cairan Terbuang</td>
                      <td>
                        <b>{{
                          data.bb_pre && data.bb_post
                            ? (data.bb_pre - data.bb_post).toFixed(2) + ' L'
                            : '—'
                        }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>UF Goal Tercapai</td>
                      <td>
                        <b :class="ufPctClass(data)">{{ calcUFPct(data) }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Kt/V Estimasi</td>
                      <td>
                        <b :class="ktvClass(data.ktv)">{{ data.ktv ?? '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>TD Post</td>
                      <td>
                        <b>{{ data.td_post || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Nadi Post</td>
                      <td>
                        <b>{{ data.nadi_post ?? '—' }} x/mnt</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Suhu Post</td>
                      <td>
                        <b>{{ data.suhu_post ?? '—' }} °C</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Kondisi Post</td>
                      <td>
                        <b>{{ data.kondisi_post || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Masalah HD</td>
                      <td>
                        <b>{{ data.masalah_hd || '—' }}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div class="expand-card-title" style="margin-top: 10px">
                  <i class="pi pi-exclamation-triangle" /> Komplikasi
                </div>
                <div
                  class="komplikasi-tags"
                  style="margin-bottom: 6px"
                  v-if="parseArr(data.komplikasi).length"
                >
                  <Tag
                    v-for="k in parseArr(data.komplikasi)"
                    :key="k"
                    :value="k"
                    :severity="k === 'Tidak Ada' ? 'success' : 'warn'"
                    class="tag-sm"
                  />
                </div>
                <span v-else style="font-size: 12px; color: #6c757d">Tidak ada komplikasi</span>
                <div v-if="data.tindakan_komplikasi" class="tindakan-box">
                  <div style="font-size: 11px; color: #6c757d; margin-bottom: 2px">Tindakan:</div>
                  {{ data.tindakan_komplikasi }}
                </div>

                <div class="expand-card-title" style="margin-top: 10px">
                  <i class="pi pi-id-card" /> Verifikasi
                </div>
                <table class="mini-table">
                  <tbody>
                    <tr>
                      <td>Perawat</td>
                      <td>
                        <b>{{ data.ttd_perawat || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Karu</td>
                      <td>
                        <b>{{ data.ttd_karu || '—' }}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Dokter</td>
                      <td>
                        <b>{{ data.ttd_dokter || '—' }}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Observasi Intra-HD -->
            <div v-if="parseArr(data.observasi).length" style="margin-top: 12px">
              <div class="expand-card-title" style="margin-bottom: 6px">
                <i class="pi pi-table" /> Observasi Intra-HD
              </div>
              <div style="overflow-x: auto">
                <table class="obs-table">
                  <thead>
                    <tr>
                      <th>Waktu</th>
                      <th>TD (mmHg)</th>
                      <th>Nadi</th>
                      <th>QB</th>
                      <th>UF Rate</th>
                      <th>TMP/VP/AP</th>
                      <th>SpO₂</th>
                      <th>Suhu °C</th>
                      <th>Keluhan / Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="obs in parseArr(data.observasi)"
                      :key="obs.label"
                      :class="{ 'obs-pre': obs.label === 'Pre', 'obs-post': obs.label === 'Post' }"
                    >
                      <td>
                        <b>{{ obs.label }}</b>
                      </td>
                      <td>{{ obs.td || '—' }}</td>
                      <td>{{ obs.nadi || '—' }}</td>
                      <td>{{ obs.qb || '—' }}</td>
                      <td>{{ obs.uf_rate || '—' }}</td>
                      <td>{{ obs.tmp_vp_ap || '—' }}</td>
                      <td>{{ obs.spo2 || '—' }}</td>
                      <td>{{ obs.suhu || '—' }}</td>
                      <td style="text-align: left">{{ obs.keluhan || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>

        <template #loading>
          <div class="empty-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 22px; color: #378add" />
            <span>Memuat riwayat HD...</span>
          </div>
        </template>
        <template #empty>
          <div class="empty-state">
            <i class="pi pi-inbox" style="font-size: 32px; color: #b0c4d8" />
            <div style="margin-top: 8px; color: #6c757d; font-size: 13px">
              Belum ada data riwayat HD untuk pasien ini.
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <template #footer>
      <Button label="Tutup" icon="pi pi-times" outlined @click="internalVisible = false" />
    </template>
  </Dialog>

  <!-- ══ SUB-DIALOG: Detail satu sesi ══ -->
  <Dialog
    v-model:visible="showDetail"
    :header="`Detail HD — ${selectedRow?.tanggal ? formatDisplayDate(selectedRow.tanggal) : ''}`"
    modal
    :style="{ width: '780px' }"
    :breakpoints="{ '768px': '95vw' }"
  >
    <div v-if="selectedRow">
      <!-- Summary chips -->
      <div class="dlg-summary-row">
        <div class="summary-chip">
          <div class="summary-val">{{ selectedRow.bb_pre ?? '—' }} kg</div>
          <div class="summary-lbl">BB Pre</div>
        </div>
        <div class="summary-chip">
          <div class="summary-val">{{ selectedRow.bb_post ?? '—' }} kg</div>
          <div class="summary-lbl">BB Post</div>
        </div>
        <div class="summary-chip" :class="ktvChipClass(selectedRow.ktv)">
          <div class="summary-val">{{ selectedRow.ktv ?? '—' }}</div>
          <div class="summary-lbl">Kt/V</div>
        </div>
        <div class="summary-chip">
          <div class="summary-val" :class="ufPctClass(selectedRow)">
            {{ calcUFPct(selectedRow) }}
          </div>
          <div class="summary-lbl">UF Tercapai</div>
        </div>
        <div class="summary-chip" :class="balanceChipClass(selectedRow.balance_cairan)">
          <div class="summary-val">{{ formatBalance(selectedRow.balance_cairan) }}</div>
          <div class="summary-lbl">Balance Cairan</div>
        </div>
      </div>

      <Divider />

      <div class="detail-grid">
        <div>
          <div class="dlg-sec">Pra-HD</div>
          <table class="mini-table">
            <tbody>
              <tr>
                <td>BB Kering</td>
                <td>
                  <b>{{ selectedRow.bb_kering ?? '—' }} kg</b>
                </td>
              </tr>
              <tr>
                <td>IDWG</td>
                <td>
                  <b>{{ selectedRow.idwg ?? '—' }} kg</b>
                </td>
              </tr>
              <tr>
                <td>TD Pre</td>
                <td>
                  <b>{{ selectedRow.td_pre || '—' }}</b>
                </td>
              </tr>
              <tr>
                <td>Nadi Pre</td>
                <td>
                  <b>{{ selectedRow.nadi_pre ?? '—' }} x/mnt</b>
                </td>
              </tr>
              <tr>
                <td>Keluhan Pre</td>
                <td>
                  <b>{{ selectedRow.keluhan_pre || '—' }}</b>
                </td>
              </tr>
              <tr>
                <td>Akses</td>
                <td>
                  <b>{{ selectedRow.akses_vaskuler || '—' }}</b>
                </td>
              </tr>
              <tr>
                <td>Kondisi Akses</td>
                <td>
                  <b>{{ selectedRow.kondisi_akses || '—' }}</b>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="dlg-sec" style="margin-top: 10px">Program Dialisis</div>
          <table class="mini-table">
            <tbody>
              <tr>
                <td>Durasi</td>
                <td>
                  <b>{{ selectedRow.durasi ?? '—' }} jam</b>
                </td>
              </tr>
              <tr>
                <td>Qb / Qd</td>
                <td>
                  <b
                    >{{ selectedRow.qb_instruksi ?? '—' }} /
                    {{ selectedRow.qd_instruksi ?? '—' }} ml/mnt</b
                  >
                </td>
              </tr>
              <tr>
                <td>Antikoagulan</td>
                <td>
                  <b>{{ selectedRow.antikoagulan || '—' }}</b>
                </td>
              </tr>
              <tr>
                <td>Heparin</td>
                <td>
                  <b>{{ selectedRow.dosis_heparin ?? '—' }} UI</b>
                </td>
              </tr>
              <tr>
                <td>Dialyzer</td>
                <td>
                  <b>{{ selectedRow.tipe_dialyzer || '—' }}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <!-- Keseimbangan Cairan Detail -->
          <div class="dlg-sec">Keseimbangan Cairan</div>
          <div class="fluid-detail-box">
            <div class="fluid-sub-label fluid-in"><i class="pi pi-arrow-down" /> Cairan Masuk</div>
            <table class="mini-table">
              <tbody>
                <tr>
                  <td>Infus / Priming</td>
                  <td>
                    <b>{{ selectedRow.cairan_infus ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr>
                  <td>Obat IV / Flush</td>
                  <td>
                    <b>{{ selectedRow.cairan_obat_iv ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr>
                  <td>Minum</td>
                  <td>
                    <b>{{ selectedRow.cairan_minum ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr>
                  <td>Lain-lain</td>
                  <td>
                    <b>{{ selectedRow.cairan_masuk_lain ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr class="fluid-total-row-mini">
                  <td><b>Total Masuk</b></td>
                  <td>
                    <b class="clr-in">{{ selectedRow.total_cairan_masuk ?? 0 }} ml</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="fluid-sub-label fluid-out" style="margin-top: 8px">
              <i class="pi pi-arrow-up" /> Cairan Keluar
            </div>
            <table class="mini-table">
              <tbody>
                <tr>
                  <td>UF Aktual</td>
                  <td>
                    <b>{{ selectedRow.uf_aktual ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr>
                  <td>Urine</td>
                  <td>
                    <b>{{ selectedRow.cairan_urine ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr>
                  <td>Perdarahan</td>
                  <td>
                    <b>{{ selectedRow.cairan_perdarahan ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr>
                  <td>Lain-lain</td>
                  <td>
                    <b>{{ selectedRow.cairan_keluar_lain ?? 0 }} ml</b>
                  </td>
                </tr>
                <tr class="fluid-total-row-mini">
                  <td><b>Total Keluar</b></td>
                  <td>
                    <b class="clr-out">{{ selectedRow.total_cairan_keluar ?? 0 }} ml</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              class="fluid-balance-badge"
              :class="balanceBadgeClass(selectedRow.balance_cairan)"
              style="margin-top: 8px"
            >
              Balance: <b>{{ formatBalance(selectedRow.balance_cairan) }}</b>
            </div>
          </div>

          <div class="dlg-sec" style="margin-top: 10px">Pasca-HD</div>
          <table class="mini-table">
            <tbody>
              <tr>
                <td>TD Post</td>
                <td>
                  <b>{{ selectedRow.td_post || '—' }}</b>
                </td>
              </tr>
              <tr>
                <td>Nadi Post</td>
                <td>
                  <b>{{ selectedRow.nadi_post ?? '—' }} x/mnt</b>
                </td>
              </tr>
              <tr>
                <td>Kondisi</td>
                <td>
                  <b>{{ selectedRow.kondisi_post || '—' }}</b>
                </td>
              </tr>
              <tr>
                <td>Masalah HD</td>
                <td>
                  <b>{{ selectedRow.masalah_hd || '—' }}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="parseArr(selectedRow.komplikasi).length" style="margin-top: 12px">
        <div class="dlg-sec">Komplikasi</div>
        <div class="komplikasi-tags">
          <Tag
            v-for="k in parseArr(selectedRow.komplikasi)"
            :key="k"
            :value="k"
            :severity="k === 'Tidak Ada' ? 'success' : 'warn'"
            class="tag-sm"
          />
        </div>
        <div v-if="selectedRow.tindakan_komplikasi" class="tindakan-box" style="margin-top: 8px">
          {{ selectedRow.tindakan_komplikasi }}
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Tutup" icon="pi pi-times" outlined @click="showDetail = false" />
      <Button label="Cetak" icon="pi pi-print" @click="printData(selectedRow)" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const props = defineProps({
  visible: { type: Boolean, default: false },
  datapasien: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:visible'])

const internalVisible = ref(props.visible)
watch(
  () => props.visible,
  (val) => {
    internalVisible.value = val
    if (val) fetchHistory()
  },
)
watch(internalVisible, (val) => emit('update:visible', val))

const onHide = () => {
  expandedRows.value = []
  showDetail.value = false
  selectedRow.value = null
}

defineExpose({
  open: () => {
    internalVisible.value = true
  },
  close: () => {
    internalVisible.value = false
  },
})

// ── State ─────────────────────────────────────────────────────────────────
const loading = ref(false)
const historyData = ref([])
const expandedRows = ref([])
const showDetail = ref(false)
const selectedRow = ref(null)
const globalFilter = ref('')

// ── Computed filter ───────────────────────────────────────────────────────
const filteredData = computed(() => {
  if (!globalFilter.value) return historyData.value
  const q = globalFilter.value.toLowerCase()
  return historyData.value.filter((row) =>
    [
      row.tanggal,
      row.ttd_perawat,
      row.akses_vaskuler,
      row.kondisi_post,
      JSON.stringify(row.komplikasi),
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  )
})

// ── Statistik header ──────────────────────────────────────────────────────
const totalSesi = computed(() => historyData.value.length)

const rataIDWG = computed(() => {
  const v = historyData.value.filter((d) => d.idwg != null)
  if (!v.length) return null
  return (v.reduce((s, d) => s + parseFloat(d.idwg), 0) / v.length).toFixed(1)
})

const rataKTV = computed(() => {
  const v = historyData.value.filter((d) => d.ktv != null)
  if (!v.length) return null
  return (v.reduce((s, d) => s + parseFloat(d.ktv), 0) / v.length).toFixed(2)
})

const adekuasiClass = computed(() => {
  if (!rataKTV.value) return ''
  const n = parseFloat(rataKTV.value)
  return n < 1.2 ? 'danger' : n < 1.4 ? 'warn' : 'ok'
})

// ── Rata-rata balance cairan ──────────────────────────────────────────────
const rataBalance = computed(() => {
  const v = historyData.value.filter((d) => d.balance_cairan != null && d.balance_cairan !== 0)
  if (!v.length) return null
  const avg = v.reduce((s, d) => s + parseFloat(d.balance_cairan), 0) / v.length
  return avg > 0 ? '+' + avg.toFixed(0) : avg.toFixed(0)
})

const rataBalanceClass = computed(() => {
  if (!rataBalance.value) return ''
  const n = parseFloat(rataBalance.value)
  return n > 500 ? 'danger' : n > 200 ? 'warn' : n < -200 ? 'warn' : 'ok'
})

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchHistory = async () => {
  const nomr = props.datapasien?.NOMR
  if (!nomr) return

  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_riwayat_hd`,
      { mode: 3, identifier: nomr, id_client: id_client.value, limit: 100 },
    )
    if (res.data.code === 200) {
      historyData.value = (res.data.data.list || []).map((row) => ({
        ...row,
        idwg:
          row.idwg ??
          (row.bb_pre && row.bb_post_lalu
            ? parseFloat((row.bb_pre - row.bb_post_lalu).toFixed(1))
            : null),
        ktv: row.ktv ?? estimasiKTV(row),
        komplikasi: parseArr(row.komplikasi),
        observasi: parseArr(row.observasi),
      }))
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: res.data.message || 'Tidak ada data',
        life: 4000,
      })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal mengambil riwayat HD',
      life: 5000,
    })
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
const estimasiKTV = (r) => {
  if (!r.qb_instruksi || !r.durasi || !r.bb_kering) return null
  return parseFloat(
    ((0.162 * r.qb_instruksi * parseFloat(r.durasi) * 60) / (r.bb_kering * 1000)).toFixed(2),
  )
}

const calcUFPct = (d) => {
  if (!d.bb_pre || !d.bb_post || !d.bb_kering) return '—'
  const g = d.bb_pre - d.bb_kering
  if (g <= 0) return '—'
  return Math.round(((d.bb_pre - d.bb_post) / g) * 100) + '%'
}

const parseArr = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    return JSON.parse(val)
  } catch {
    return []
  }
}

// Balance helpers
const formatBalance = (val) => {
  if (val == null) return '—'
  const n = parseFloat(val)
  return (n > 0 ? '+' : '') + n.toFixed(0) + ' ml'
}

const balanceClass = (val) => {
  if (val == null) return ''
  const n = parseFloat(val)
  return n > 500 ? 'clr-danger' : n > 200 ? 'clr-warn' : n < -200 ? 'clr-warn' : 'clr-ok'
}

const balanceBadgeClass = (val) => {
  if (val == null) return 'balance-neutral'
  const n = parseFloat(val)
  return n > 500
    ? 'balance-danger'
    : n > 200
      ? 'balance-warn'
      : n < -200
        ? 'balance-warn'
        : 'balance-ok'
}

const balanceChipClass = (val) => {
  if (val == null) return ''
  const n = parseFloat(val)
  return n > 500 ? 'chip-danger' : n > 200 ? 'chip-warn' : 'chip-ok'
}

const idwgSeverity = (v) =>
  v == null ? 'secondary' : v > 4 ? 'danger' : v > 2.5 ? 'warn' : 'success'

const ktvClass = (v) => {
  if (v == null) return ''
  return parseFloat(v) < 1.2 ? 'clr-danger fw-bold' : parseFloat(v) < 1.4 ? 'clr-warn' : 'clr-ok'
}

const ktvChipClass = (v) => {
  if (v == null) return ''
  return parseFloat(v) < 1.2 ? 'chip-danger' : parseFloat(v) < 1.4 ? 'chip-warn' : 'chip-ok'
}

const ufPctClass = (d) => {
  const p = parseInt(calcUFPct(d))
  return isNaN(p) ? '' : p < 60 ? 'clr-danger' : p < 80 ? 'clr-warn' : 'clr-ok'
}

const kondisiClass = (s) => {
  if (!s) return ''
  if (s.includes('IGD') || s.includes('HCU')) return 'kondisi-kritis'
  if (s.includes('Pusing') || s.includes('hipotensi')) return 'kondisi-warn'
  return 'kondisi-baik'
}

const formatDisplayDate = (d) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return d
  }
}

const openDetail = (data) => {
  selectedRow.value = data
  showDetail.value = true
}
const printData = (_data) => {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Fitur cetak akan segera tersedia',
    life: 3000,
  })
}
</script>

<style scoped>
/* ── Dialog override ── */
:deep(.hd-history-dialog .p-dialog-header) {
  padding: 0 !important;
  background: linear-gradient(135deg, #051f35 0%, #0a2f47 100%);
  border-radius: 10px 10px 0 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
:deep(.hd-history-dialog .p-dialog-header-actions .p-button) {
  color: #b5d4f4 !important;
  transition: all 0.2s ease;
}
:deep(.hd-history-dialog .p-dialog-header-actions .p-button:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}
:deep(.hd-history-dialog .p-dialog-content) {
  padding: 0 !important;
  background: #f8fafd;
}
:deep(.hd-history-dialog .p-dialog-footer) {
  padding: 12px 16px;
  border-top: 1px solid #dfe6ef;
  background: #ffffff;
}

/* ── Custom Header ── */
.dlg-header {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.dlg-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px 12px;
}
.dlg-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dlg-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #404040;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(5, 31, 53, 0.4);
}
.dlg-header-title {
  font-size: 15px;
  font-weight: 700;
  color: #575757;
  letter-spacing: 0.01em;
}
.dlg-header-sub {
  color: #a8c9e0;
  font-size: 12px;
  margin-top: 2px;
  font-weight: 400;
}
.dlg-header-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.stat-chip {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 6px 14px;
  text-align: center;
  min-width: 90px;

  transition: all 0.2s ease;
}
.stat-chip:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.3);
}
.stat-chip.warn {
  background: #d97706;
  border-color: #f59e0b;
}
.stat-chip.warn:hover {
  background: #b45309;
}
.stat-chip.ok {
  background: #059669;
  border-color: #10b981;
}
.stat-chip.ok:hover {
  background: #047857;
}
.stat-chip.danger {
  background: #dc2626;
  border-color: #ef4444;
}
.stat-chip.danger:hover {
  background: #b91c1c;
}
.stat-val {
  font-size: 16px;
  font-weight: 700;
  display: block;
  color: #ffffff;
}
.stat-lbl {
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
  display: block;
  font-weight: 500;
  margin-top: 2px;
}

/* Patient bar */
.dlg-patient-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  padding: 10px 18px 12px;
  background: linear-gradient(to right, rgba(10, 74, 125, 0.05), rgba(10, 74, 125, 0.02));
  border-top: 1px solid rgba(10, 74, 125, 0.1);
}
.patient-info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 18px 0 0;
}
.patient-info-lbl {
  font-size: 10px;
  color: #0a7fc0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.patient-info-val {
  font-size: 13px;
  font-weight: 700;
  color: #0a4a7d;
  white-space: nowrap;
}
.patient-divider {
  width: 1px;
  height: 36px;
  background: rgba(10, 74, 125, 0.15);
  margin: 0 18px 0 0;
  flex-shrink: 0;
}

/* ── DataTable ── */
.dlg-body {
  display: flex;
  flex-direction: column;
}
:deep(.history-table .p-datatable-thead > tr > th) {
  background: linear-gradient(to bottom, #f5f9fd, #eff6fc);
  color: #0a4a7d;
  font-size: 12px;
  font-weight: 700;
  padding: 11px 12px;
  white-space: nowrap;
  border-bottom: 2px solid #d0e1f0;
}
:deep(.history-table .p-datatable-tbody > tr > td) {
  font-size: 12px;
  padding: 10px 12px;
  vertical-align: middle;
  border-color: #e8f0f8;
}
:deep(.history-table .p-datatable-tbody > tr:hover > td) {
  background: #f0f7fd !important;
}
:deep(.history-table .p-datatable-row-expansion > td) {
  padding: 0 !important;
  background: #fafcfd;
}
:deep(.history-table .p-paginator) {
  border-top: 1px solid #dfe6ef;
  padding: 8px 14px;
  font-size: 12px;
  background: #f8fafd;
}

/* ── Cells ── */
.cell-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0a3d66;
  font-weight: 500;
}
.cell-stack {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.cell-main {
  font-size: 12px;
  color: #0a3d66;
  font-weight: 600;
}
.cell-sub {
  font-size: 11px;
  color: #6c8cb3;
  font-weight: 500;
}
.cell-kondisi {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  font-weight: 600;
  display: inline-block;
}
.kondisi-baik {
  background: #e8f4dd;
  color: #1e5a0a;
  border: 1px solid #b8db87;
}
.kondisi-warn {
  background: #fef0de;
  color: #6d4605;
  border: 1px solid #f5d996;
}
.kondisi-kritis {
  background: #fde8e8;
  color: #8a1414;
  border: 1px solid #f5b8b8;
  font-weight: 700;
}

.komplikasi-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-sm {
  font-size: 11px !important;
  padding: 3px 8px !important;
  font-weight: 600 !important;
}
.action-btns {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.clr-ok {
  color: #1e5a0a !important;
  font-weight: 700;
}
.clr-warn {
  color: #6d4605 !important;
  font-weight: 700;
}
.clr-danger {
  color: #8a1414 !important;
  font-weight: 700;
}
.fw-bold {
  font-weight: 700;
}

/* ── Fluid balance inline ── */
.clr-in {
  color: #0d5fb8 !important;
  font-weight: 700;
}
.clr-out {
  color: #c00a0a !important;
  font-weight: 700;
}

.fluid-sub-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.fluid-in {
  background: #e7f2fd;
  color: #0d5fb8;
}
.fluid-out {
  background: #ffe7e7;
  color: #c00a0a;
}

.fluid-total-row-mini td {
  border-top: 2px solid #dfe6ef;
  padding-top: 6px !important;
  font-weight: 600;
  background: #f5f9fd;
}

.fluid-balance-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  margin-top: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.balance-ok {
  background: #e8f4dd;
  color: #1e5a0a;
  border: 1px solid #b8db87;
}
.balance-warn {
  background: #fef0de;
  color: #6d4605;
  border: 1px solid #f5d996;
}
.balance-danger {
  background: #fde8e8;
  color: #8a1414;
  border: 1px solid #f5b8b8;
}
.balance-neutral {
  background: #f5f7fb;
  color: #4a5f7f;
  border: 1px solid #dfe6ef;
}

.fluid-detail-box {
  background: #f5f9fd;
  border: 1px solid #dfe6ef;
  border-radius: 10px;
  padding: 12px;
  box-shadow: inset 0 1px 2px rgba(10, 74, 125, 0.05);
}

/* ── Expand ── */
.expand-panel {
  padding: 16px 18px;
  background: #fafcfd;
}
.expand-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 860px) {
  .expand-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .expand-grid {
    grid-template-columns: 1fr;
  }
}

.expand-card {
  background: #ffffff;
  border: 1px solid #dfe6ef;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(10, 74, 125, 0.08);
  transition: all 0.2s ease;
}
.expand-card:hover {
  border-color: #c9d9ef;
  box-shadow: 0 2px 6px rgba(10, 74, 125, 0.12);
}
.expand-card-title {
  font-size: 12px;
  font-weight: 700;
  color: #0a4a7d;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
}
.mini-table td {
  font-size: 12px;
  padding: 5px 0;
  vertical-align: top;
  border-bottom: 1px solid #f0f5fb;
}
.mini-table td:first-child {
  color: #6c8cb3;
  width: 48%;
  padding-right: 8px;
  font-weight: 500;
}
.mini-table td b {
  color: #0a3d66;
  font-weight: 700;
}

.tindakan-box {
  background: #fef0de;
  border: 1px solid #f5d996;
  border-radius: 8px;
  padding: 9px 11px;
  font-size: 12px;
  color: #6d4605;
  margin-top: 6px;
  font-weight: 500;
}

/* Observasi table */
.obs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: #ffffff;
}
.obs-table th {
  background: linear-gradient(to bottom, #e8f0fc, #dfe6f5);
  color: #0a4a7d;
  font-weight: 700;
  padding: 6px 8px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #d0dce8;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  font-size: 11px;
}
.obs-table td {
  padding: 5px 8px;
  text-align: center;
  border: 1px solid #e8f0f8;
}
.obs-pre td {
  background: #f0f7fd;
}
.obs-post td {
  background: #e8f4dd;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 50px 20px;
  color: #6c8cb3;
  font-size: 13px;
  background: linear-gradient(135deg, #f5f9fd 0%, #fafcfd 100%);
}

/* ── Sub-dialog Detail ── */
.dlg-summary-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.summary-chip {
  flex: 1;
  min-width: 100px;
  background: #e8f4dd;
  border: 1px solid #b8db87;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(10, 74, 125, 0.08);
  transition: all 0.2s ease;
}
.summary-chip:hover {
  box-shadow: 0 2px 6px rgba(10, 74, 125, 0.12);
  border-color: #a3d462;
}
.summary-chip.chip-warn {
  background: #fef0de;
  border-color: #f5d996;
}
.summary-chip.chip-warn:hover {
  border-color: #f1c969;
}
.summary-chip.chip-danger {
  background: #fde8e8;
  border-color: #f5b8b8;
}
.summary-chip.chip-danger:hover {
  border-color: #f08b8b;
}
.summary-chip.chip-ok {
  background: #e8f4dd;
  border-color: #b8db87;
}
.summary-chip.chip-ok:hover {
  border-color: #a3d462;
}
.summary-val {
  font-size: 18px;
  font-weight: 700;
  color: #1e5a0a;
  letter-spacing: -0.3px;
}
.summary-chip.chip-warn .summary-val {
  color: #6d4605;
}
.summary-chip.chip-danger .summary-val {
  color: #8a1414;
}
.summary-lbl {
  font-size: 11px;
  color: #6c8cb3;
  margin-top: 3px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}
@media (max-width: 520px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.dlg-sec {
  font-size: 12px;
  font-weight: 700;
  color: #0a4a7d;
  margin-bottom: 7px;
  border-left: 4px solid #0a7fc0;
  padding-left: 9px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
</style>
