<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Menyimpan..." />
    <Toast />
    <ConfirmDialog />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <Button icon="pi pi-arrow-left" text rounded class="me-2" @click="goBack" :disabled="loading" />
        <div class="pm-hero-icon"><i class="pi pi-inbox"></i></div>
        <div>
          <h4 class="pm-hero-title">Form Penerimaan Barang</h4>
          <p class="pm-hero-sub">
            <span class="mono" style="color:#0d9488">{{ spInfo?.no_sp ?? '...' }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- BANNER FULLY RECEIVED -->
    <!-- BANNER SP SELESAI -->
    <div v-if="isSpSelesai && !fetchLoading" class="sp-selesai-banner mb-2">
      <i class="pi pi-lock" style="font-size:18px;flex-shrink:0"></i>
      <div>
        <strong>SP sudah diselesaikan.</strong>
        <span style="margin-left:6px;font-size:12px;opacity:.85">Form tidak dapat diedit. Lihat riwayat penerimaan di bawah.</span>
      </div>
    </div>

    <div v-if="isFullyReceived && !isSpSelesai && !fetchLoading" class="fully-received-banner mb-2">
      <i class="pi pi-check-circle me-2" style="font-size:16px"></i>
      <div>
        <strong>Semua item sudah diterima penuh.</strong>
        <span v-if="!isSpSelesai" style="margin-left:6px;font-size:12px;opacity:.85">Klik "Selesaikan SP" untuk mengubah status SP menjadi Selesai.</span>
        <span v-else style="margin-left:6px;font-size:12px;opacity:.85">SP ini sudah diselesaikan.</span>
      </div>
    </div>

    <div v-if="fetchLoading" style="text-align:center;padding:60px;color:#94a3b8">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
      <p style="margin-top:10px;font-size:13px">Memuat data SP...</p>
    </div>

    <template v-else>
      <div class="row g-3">

        <!-- ── TABEL ITEM ── -->
        <div class="col-12">
          <div class="pm-fm-section">
            <div class="pm-fm-section-title"><i class="pi pi-list me-1"></i>DAFTAR ITEM SP</div>

            <div v-if="itemError" class="pm-warn-box mb-2">
              <i class="pi pi-exclamation-triangle me-1"></i>{{ itemError }}
            </div>

            <div style="overflow-x:auto">
              <table class="pm-items-table">
                <thead>
                  <tr>
                    <th style="width:30px">#</th>
                    <th style="min-width:180px">Nama Barang</th>
                    <th style="width:95px;text-align:center">Qty Pesan</th>
                    <th style="width:95px;text-align:center">Sdh Diterima</th>
                    <th style="width:95px;text-align:center">Sisa</th>
                    <th style="width:115px">Satuan</th>
                    <th style="width:95px">Qty Diterima</th>
                    <th style="width:125px">Harga Satuan</th>
                    <th style="width:75px">Diskon %</th>
                    <th style="width:200px">Harga Jual / Margin</th>
                    <th style="width:115px">No Batch</th>
                    <th style="width:120px">Tgl Expired</th>
                    <th style="width:120px;text-align:right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, i) in items"
                    :key="item.id_barang"
                    :class="{ 'item-disabled': item.is_full, 'item-row-warn': item._error }"
                  >
                    <td class="mono" style="color:#94a3b8;text-align:center">{{ i + 1 }}</td>

                    <td>
                      <div style="font-size:12px;font-weight:600;color:#1e293b">{{ item.nama_barang }}</div>
                      <div style="font-size:10px;color:#94a3b8">{{ item.id_barang }}</div>
                      <span v-if="item.is_full" class="full-badge">Sudah Penuh</span>
                    </td>

                    <td style="text-align:center">
                      <span class="mono">{{ displayQty(item, item.qty_pesan_kecil) }}<br><small style="color:#94a3b8">{{ item._satuan }}</small></span>
                    </td>

                    <td style="text-align:center">
                      <span class="mono">{{ displayQty(item, item.qty_sudah_diterima) }}<br><small style="color:#94a3b8">{{ item._satuan }}</small></span>
                    </td>

                    <td style="text-align:center">
                      <span class="mono" :style="item.qty_sisa === 0 ? 'color:#dc2626;font-weight:700' : 'color:#0d9488;font-weight:600'">
                        {{ displayQty(item, item.qty_sisa) }}<br><small style="color:inherit;opacity:.7">{{ item._satuan }}</small>
                      </span>
                    </td>

                    <td>
                      <Select
                        v-model="item._satuan"
                        :options="satuanOptions(item)"
                        placeholder="Pilih..."
                        class="w-100"
                        :disabled="item.is_full || loading || isSpSelesai"
                        @change="() => onSatuanChange(item)"
                      />
                    </td>

                    <td>
                      <input
                        v-model.number="item._qty_diterima"
                        type="number" min="0" :max="maxQtyDiterima(item)"
                        class="pm-num-input"
                        :disabled="item.is_full || loading || isSpSelesai"
                        :class="{ 'input-warn': item._error }"
                        @input="() => onQtyChange(item)"
                      />
                    </td>

                    <td>
                      <div class="pm-num-input" style="background:#f8fafc;color:#1e293b;display:flex;align-items:center;cursor:default">
                        {{ item._harga_satuan ? formatCurrency(item._harga_satuan) : '-' }}
                      </div>
                      <div v-if="hargaEfektif(item)" style="font-size:10px;color:#64748b;margin-top:2px;line-height:1.4">
                        <template v-if="item._diskon">
                          <span>- diskon: {{ formatCurrency(hargaSetelahDiskon(item)) }}</span><br>
                        </template>
                        <template v-if="form.pajak_include === 0 && form.pajak > 0">
                          <span style="color:#0d9488;font-weight:600">+ PPN: {{ formatCurrency(hargaEfektif(item)) }}</span>
                        </template>
                        <template v-else-if="item._diskon">
                          <span style="color:#0d9488;font-weight:600">netto: {{ formatCurrency(hargaSetelahDiskon(item)) }}</span>
                        </template>
                      </div>
                    </td>

                    <td>
                      <input
                        v-model.number="item._diskon"
                        type="number" min="0" max="100"
                        class="pm-num-input"
                        placeholder="0"
                        :disabled="item.is_full || loading || isSpSelesai"
                      />
                    </td>

                    <!-- HARGA JUAL / MARGIN — mutual exclusive -->
                    <td>
                      <div class="hj-wrap">
                        <!-- Input harga jual (mode manual) -->
                        <div v-if="item._harga_mode !== 'margin'" class="hj-input-wrap">
                          <input
                            v-model.number="item._harga_jual"
                            type="number" min="0"
                            class="pm-num-input"
                            placeholder="0"
                            :disabled="item.is_full || loading || isSpSelesai"
                          />
                        </div>

                        <!-- Input margin (mode margin) -->
                        <div v-else class="hj-input-wrap">
                          <div style="display:flex;align-items:center;gap:4px">
                            <input
                              v-model.number="item._margin"
                              type="number" min="0"
                              class="pm-num-input"
                              placeholder="0"
                              :disabled="item.is_full || loading || isSpSelesai || !item._harga_satuan"
                              @input="() => computeHargaJualFromMargin(item)"
                            />
                            <span style="font-size:11px;color:#64748b;white-space:nowrap">%</span>
                          </div>
                          <div v-if="item._harga_jual" style="font-size:10px;color:#0d9488;margin-top:2px;font-family:inherit">
                            = {{ formatCurrency(item._harga_jual) }}
                          </div>
                          <div v-else-if="!item._harga_satuan" style="font-size:10px;color:#94a3b8;margin-top:2px">
                            isi harga satuan dulu
                          </div>
                        </div>

                        <!-- Mode selector (di bawah input) -->
                        <div class="hj-mode-toggle">
                          <button
                            class="hj-mode-btn"
                            :class="{ active: item._harga_mode !== 'margin' }"
                            @click="setHargaMode(item, 'manual')"
                            type="button"
                            :disabled="item.is_full || loading || isSpSelesai"
                          >Harga Jual</button>
                          <button
                            class="hj-mode-btn"
                            :class="{ active: item._harga_mode === 'margin' }"
                            @click="setHargaMode(item, 'margin')"
                            type="button"
                            :disabled="item.is_full || loading || isSpSelesai"
                          >Margin %</button>
                        </div>
                      </div>
                    </td>

                    <td>
                      <InputText
                        v-model="item._no_batch"
                        class="w-100"
                        placeholder="BATCH-01"
                        :disabled="item.is_full || loading || isSpSelesai"
                        style="font-size:12px"
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        v-model="item._tgl_expired"
                        class="pm-date-input w-100"
                        :disabled="item.is_full || loading || isSpSelesai"
                      />
                    </td>

                    <td style="text-align:right;padding-right:10px">
                      <span v-if="subtotalItem(item)" class="mono" style="font-weight:600;color:#0f766e;font-size:12px">
                        {{ formatCurrency(subtotalItem(item)) }}
                      </span>
                      <span v-else style="color:#cbd5e1">—</span>
                    </td>
                  </tr>

                  <tr v-if="items.length === 0">
                    <td colspan="13" style="text-align:center;color:#94a3b8;padding:30px;font-size:12px">
                      Tidak ada item ditemukan untuk SP ini.
                    </td>
                  </tr>
                </tbody>

                <tfoot v-if="grandTotal > 0">
                  <tr class="grand-total-row">
                    <td colspan="12" style="text-align:right;font-weight:700;font-size:12px;color:#374151;padding:8px 10px">
                      Grand Total
                      <span v-if="form.pajak_include === 0 && form.pajak > 0" style="font-size:10px;font-weight:400;color:#64748b;margin-left:4px">
                        (termasuk PPN {{ form.pajak }}%)
                      </span>
                    </td>
                    <td style="text-align:right;padding:8px 10px">
                      <span class="mono" style="font-weight:700;font-size:13px;color:#0d9488">{{ formatCurrency(grandTotal) }}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div v-if="activeItems.length > 0" class="pm-items-summary">
              <span><strong>{{ activeItems.length }}</strong> item tersedia</span>
              <span v-if="filledItems.length > 0" style="color:#0d9488">
                · <strong>{{ filledItems.length }}</strong> item sudah diisi
              </span>
            </div>
          </div>
        </div>

        <!-- ── RIWAYAT PENERIMAAN ── -->
        <!-- ── PAJAK ── -->
        <div class="col-12">
          <div class="pajak-section">
            <div class="pajak-section-left">
              <i class="pi pi-percentage" style="font-size:13px;color:#0d9488"></i>
              <span class="pajak-section-label">Pajak</span>
              <div class="toggle-group-sm">
                <button class="toggle-btn-sm" :class="{ active: form.pajak_include === 1 }" @click="form.pajak_include = 1" type="button" :disabled="loading || isSpSelesai">Include</button>
                <button class="toggle-btn-sm" :class="{ active: form.pajak_include === 0 }" @click="form.pajak_include = 0" type="button" :disabled="loading || isSpSelesai">Exclude</button>
              </div>
            </div>
            <transition name="fade-slide">
              <div v-if="form.pajak_include === 0" class="pajak-section-right">
                <span style="font-size:12px;color:#64748b">Persentase:</span>
                <input
                  v-model.number="form.pajak"
                  type="number" min="0" max="100"
                  class="pajak-pct-input"
                  placeholder="0"
                  :disabled="loading || isSpSelesai"
                />
                <span style="font-size:13px;color:#64748b;font-weight:600">%</span>
                <span v-if="grandTotal > 0" class="pajak-info-chip">
                  PPN: {{ formatCurrency(grandTotal - grandTotalPreTax) }}
                </span>
              </div>
              <div v-else class="pajak-section-right">
                <span class="pajak-include-note"><i class="pi pi-check me-1"></i>Harga sudah termasuk pajak</span>
              </div>
            </transition>
          </div>
        </div>

        <div class="col-12">
          <div class="pm-fm-section">
            <div class="pm-fm-section-title d-flex align-items-center justify-content-between" style="cursor:pointer" @click="riwayatOpen = !riwayatOpen">
              <span><i class="pi pi-history me-1"></i>RIWAYAT PENERIMAAN SP INI</span>
              <i :class="riwayatOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" style="font-size:11px"></i>
            </div>

            <template v-if="riwayatOpen">
              <div v-if="riwayatLoading" style="text-align:center;padding:20px;color:#94a3b8;font-size:12px">
                <i class="pi pi-spin pi-spinner"></i> Memuat riwayat...
              </div>
              <div v-else-if="!riwayatList.length" style="text-align:center;padding:20px;font-size:12px;color:#94a3b8">
                Belum ada penerimaan sebelumnya untuk SP ini.
              </div>
              <div v-else>
                <div class="riwayat-list">
                  <div
                    v-for="r in riwayatList"
                    :key="r.no_penerimaan"
                    class="riwayat-item"
                    :class="{ 'riwayat-item-batal': r.is_batal }"
                    @click="lihatDetailPenerimaan(r)"
                  >
                    <div class="riwayat-left">
                      <span class="riwayat-no">{{ r.no_penerimaan }}</span>
                      <span class="riwayat-date">{{ formatDate(r.tanggal_penerimaan) }}</span>
                      <span v-if="r.is_batal" class="riwayat-batal-info">
                        Dibatalkan oleh {{ r.nama_batalkan_oleh || '-' }}
                        <template v-if="r.tanggal_batal"> · {{ r.tanggal_batal }}</template>
                      </span>
                    </div>
                    <div class="riwayat-right">
                      <span v-if="r.is_batal" class="riwayat-badge-batal">DIBATALKAN</span>
                      <span style="font-size:11px;color:#374151;font-family:inherit">{{ r.jumlah_item ?? '-' }} item</span>
                      <Button
                        v-if="!r.is_batal"
                        icon="pi pi-times-circle"
                        size="small" text rounded severity="danger"
                        v-tooltip.top="'Batalkan Penerimaan'"
                        :loading="batalLoading && batalKonfirmasi.item?.no_penerimaan === r.no_penerimaan"
                        @click.stop="confirmBatal(r)"
                      />
                      <i v-if="!r.is_batal" class="pi pi-chevron-right" style="font-size:10px;color:#94a3b8"></i>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- FOOTER ACTIONS -->
      <div class="pm-page-footer">
        <Button label="Kembali" severity="secondary" outlined class="round-button2" @click="goBack" :disabled="loading" />
        <Button
          v-if="hasUnsavedItems && !isSpSelesai"
          label="Simpan Penerimaan"
          icon="pi pi-check"
          class="round-button2 btn-primary-pm"
          @click="bukaKonfirmasi"
          :disabled="filledItems.length === 0 || loading"
        />
        <Button
          v-if="!hasUnsavedItems && (isFullyReceived || isSpDiterima) && !isSpSelesai"
          label="Tandai Selesai"
          icon="pi pi-check-circle"
          severity="success"
          class="round-button2"
          @click="konfirmasiSelesaikanSP"
          :loading="loading"
        />
      </div>
    </template>

    <!-- DIALOG KONFIRMASI SIMPAN -->
    <Dialog
      v-model:visible="konfirmasiVisible"
      header="Konfirmasi Penerimaan"
      modal
      :style="{ width: '520px', maxWidth: '96vw' }"
      :closable="!loading"
    >
      <!-- Supplier / SP info -->
      <div class="konf-sp-card">
        <div class="konf-sp-row">
          <span class="konf-lbl">No SP</span>
          <span class="konf-val mono" style="color:#0d9488;font-weight:700">{{ spInfo?.no_sp }}</span>
        </div>
        <div class="konf-sp-row" v-if="spInfo?.nama_supplier">
          <span class="konf-lbl">Supplier</span>
          <span class="konf-val fw-semibold">{{ spInfo.nama_supplier }}</span>
        </div>
      
        <div class="konf-sp-row" v-if="grandTotal > 0">
          <span class="konf-lbl">Grand Total</span>
          <span class="konf-val mono fw-bold" style="color:#0d9488">{{ formatCurrency(grandTotal) }}</span>
        </div>
      </div>

      <div class="konf-divider"></div>

      <!-- Form field -->
      <div class="konf-form">
        <div class="konf-field">
          <label class="pm-fm-label">Tanggal Penerimaan <span class="text-danger">*</span></label>
          <input type="date" v-model="form.tanggal_penerimaan" class="pm-date-input w-100" :disabled="loading" />
        </div>

        <div class="konf-field">
          <label class="pm-fm-label">No. Faktur Supplier <span class="text-danger">*</span></label>
          <InputText v-model="form.no_faktur" class="w-100" placeholder="INV-2026-001" :disabled="loading" :class="{ 'p-invalid': konfErrors.no_faktur }" />
          <small v-if="konfErrors.no_faktur" class="text-danger d-block mt-1">{{ konfErrors.no_faktur }}</small>
        </div>

        <div class="konf-field">
          <label class="pm-fm-label">Cara Bayar</label>
          <div class="cara-bayar-group">
            <button
              class="cara-bayar-btn"
              :class="{ active: form.payment_id === 1 }"
              @click="form.payment_id = 1"
              type="button"
              :disabled="loading"
            >
              <span class="cb-icon"><i class="pi pi-wallet"></i></span>
              <span class="cb-text">
                <span class="cb-label">Tunai</span>
                <span class="cb-sub">Bayar langsung</span>
              </span>
            </button>
            <button
              class="cara-bayar-btn"
              :class="{ active: form.payment_id === 3 }"
              @click="form.payment_id = 3"
              type="button"
              :disabled="loading"
            >
              <span class="cb-icon"><i class="pi pi-credit-card"></i></span>
              <span class="cb-text">
                <span class="cb-label">Kredit / Hutang</span>
                <span class="cb-sub">Bayar nanti</span>
              </span>
            </button>
          </div>
        </div>

        <transition name="fade-slide">
          <div v-if="form.payment_id === 3" class="konf-field">
            <label class="pm-fm-label">Tanggal Jatuh Tempo <span class="text-danger">*</span></label>
            <input type="date" v-model="form.jatuh_tempo" class="pm-date-input w-100" :disabled="loading" :class="{ 'input-date-warn': konfErrors.jatuh_tempo }" />
            <small v-if="konfErrors.jatuh_tempo" class="text-danger d-block mt-1">{{ konfErrors.jatuh_tempo }}</small>
          </div>
        </transition>

        <!-- LAMPIRAN -->
        <div class="konf-field">
          <label class="pm-fm-label">Foto / Lampiran Faktur <span class="pm-fm-opt">(opsional)</span></label>

          <!-- Upload area (belum ada file) -->
          <div v-if="!lampiran.file"
            class="upload-area"
            :class="{ 'upload-area-drag': lampiran.isDrag }"
            @dragover.prevent="lampiran.isDrag = true"
            @dragleave="lampiran.isDrag = false"
            @drop.prevent="onFileDrop"
            @click="$refs.fileInput.click()"
          >
            <i class="pi pi-upload" style="font-size:20px;color:#94a3b8"></i>
            <div style="font-size:12px;color:#64748b;margin-top:6px">Klik atau drag file ke sini</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:2px">JPG, JPEG, PNG, PDF</div>
          </div>

          <!-- File dipilih -->
          <div v-else class="upload-status upload-success">
            <i class="pi pi-paperclip" style="color:#16a34a;font-size:18px"></i>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;font-weight:600;color:#15803d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ lampiran.file.name }}</div>
              <div style="font-size:10px;color:#94a3b8">{{ (lampiran.file.size / 1024).toFixed(0) }} KB · akan diupload saat simpan</div>
            </div>
            <Button icon="pi pi-times" text rounded size="small" severity="danger" v-tooltip.top="'Hapus lampiran'" @click="hapusLampiran" :disabled="loading" />
          </div>

          <!-- Error -->
          <small v-if="lampiran.error" class="text-danger d-block mt-1">{{ lampiran.error }}</small>

          <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.pdf" style="display:none" @change="onFileSelect" />
        </div>
      </div>

      <template #footer>
        <Button label="Batal" severity="secondary" outlined class="round-button2" @click="konfirmasiVisible = false" :disabled="loading" />
        <Button
          label="Simpan Penerimaan"
          icon="pi pi-check"
          class="round-button2 btn-primary-pm"
          @click="submitPenerimaan"
          :loading="loading"
        />
      </template>
    </Dialog>

    <!-- DIALOG KONFIRMASI BATAL PENERIMAAN -->
    <Dialog
      v-model:visible="batalKonfirmasi.visible"
      header="Konfirmasi Pembatalan"
      modal
      :style="{ width: '420px', maxWidth: '96vw' }"
      :closable="!batalLoading"
    >
      <p style="font-size:13px;color:#374151;margin:0 0 10px">
        Yakin ingin membatalkan penerimaan
        <strong class="mono" style="color:#dc2626">{{ batalKonfirmasi.item?.no_penerimaan }}</strong>?
      </p>
      <div class="pm-warn-box">
        <i class="pi pi-exclamation-triangle me-1"></i>
        Stok barang akan berkurang kembali sesuai qty yang diterima pada penerimaan ini.
      </div>
      <Textarea
        v-model="batalKonfirmasi.keterangan"
        placeholder="Keterangan pembatalan (opsional)"
        rows="2"
        style="width:100%;margin-top:10px;font-size:12px"
        :disabled="batalLoading"
      />
      <template #footer>
        <Button label="Tidak" severity="secondary" outlined class="round-button2" @click="batalKonfirmasi.visible = false" :disabled="batalLoading" />
        <Button label="Ya, Batalkan" icon="pi pi-times-circle" severity="danger" class="round-button2" @click="batalPenerimaan" :loading="batalLoading" />
      </template>
    </Dialog>

    <!-- DETAIL PENERIMAAN DIALOG -->
    <Dialog
      v-model:visible="detailVisible"
      modal
      :closable="false"
      :style="{ width: '860px', maxWidth: '96vw' }"
    >
      <template #header>
        <div class="det-dialog-header">
          <div class="det-dialog-header-left">
            <div class="det-dialog-icon" :class="detailRiwayat?.is_batal ? 'det-icon-batal' : 'det-icon-normal'">
              <i :class="detailRiwayat?.is_batal ? 'pi pi-times-circle' : 'pi pi-inbox'"></i>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="det-dialog-no mono">{{ detailData?.header?.no_penerimaan ?? '...' }}</span>
              </div>
              <div style="font-size:11px;color:#64748b;margin-top:2px">
                SP: <span class="mono">{{ detailData?.header?.no_sp }}</span>
                · {{ detailData?.header?.nama_supplier || '-' }}
              </div>
            </div>
          </div>
          <Button icon="pi pi-times" text rounded severity="secondary" @click="detailVisible = false" />
        </div>
      </template>

      <div v-if="detailLoading" style="text-align:center;padding:50px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
        <p style="margin-top:10px;font-size:13px">Memuat detail penerimaan...</p>
      </div>
      <template v-else-if="detailData">

        <!-- ── BANNER BATAL ── -->
        <div v-if="detailRiwayat?.is_batal" class="det-batal-banner">
          <i class="pi pi-exclamation-triangle" style="font-size:15px;flex-shrink:0"></i>
          <div>
            <div style="font-weight:700;font-size:12px">Penerimaan ini telah dibatalkan</div>
            <div style="font-size:11px;margin-top:2px;opacity:.9">
              Dibatalkan oleh <strong>{{ detailRiwayat.nama_batalkan_oleh || '-' }}</strong>
              <template v-if="detailRiwayat.tanggal_batal"> · {{ detailRiwayat.tanggal_batal }}</template>
            </div>
            <div v-if="detailRiwayat.keterangan_batal || detailData?.header?.keterangan_batal" style="font-size:11px;margin-top:4px;opacity:.9">
              Keterangan: <em>{{ detailRiwayat.keterangan_batal || detailData?.header?.keterangan_batal }}</em>
            </div>
          </div>
        </div>

        <!-- ── STAT CARDS ── -->
        <div class="det-stat-row">
          <div class="det-stat-card">
            <div class="det-stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-calendar"></i></div>
            <div>
              <div class="det-stat-lbl">Tanggal</div>
              <div class="det-stat-val mono">{{ detailData.header?.tanggal_penerimaan || '-' }}</div>
            </div>
          </div>
          <div class="det-stat-card">
            <div class="det-stat-ico" style="background:#eff6ff;color:#2563eb"><i class="pi pi-file-edit"></i></div>
            <div>
              <div class="det-stat-lbl">No Faktur</div>
              <div class="det-stat-val mono">{{ detailData.header?.no_faktur || '-' }}</div>
            </div>
          </div>
          <div class="det-stat-card">
            <div class="det-stat-ico" :style="Number(detailData.header?.payment_id) === 1 ? 'background:#f0fdf4;color:#16a34a' : 'background:#fefce8;color:#ca8a04'">
              <i :class="Number(detailData.header?.payment_id) === 1 ? 'pi pi-wallet' : 'pi pi-credit-card'"></i>
            </div>
            <div>
              <div class="det-stat-lbl">Cara Bayar</div>
              <div class="det-stat-val" :style="Number(detailData.header?.payment_id) === 1 ? 'color:#16a34a' : 'color:#ca8a04'">
                {{ Number(detailData.header?.payment_id) === 1 ? 'Tunai' : 'Kredit' }}
              </div>
            </div>
          </div>
          <div class="det-stat-card">
            <div class="det-stat-ico" :style="Number(detailData.header?.status_lunas) === 1 ? 'background:#f0fdf4;color:#16a34a' : 'background:#fff7ed;color:#ea580c'">
              <i :class="Number(detailData.header?.status_lunas) === 1 ? 'pi pi-check-circle' : 'pi pi-clock'"></i>
            </div>
            <div>
              <div class="det-stat-lbl">Status Lunas</div>
              <div class="det-stat-val" :style="Number(detailData.header?.status_lunas) === 1 ? 'color:#16a34a' : 'color:#ea580c'">
                {{ Number(detailData.header?.status_lunas) === 1 ? 'Lunas' : 'Belum Lunas' }}
              </div>
            </div>
          </div>
        </div>

        <!-- ── INFO + TOTAL ── -->
        <div class="det-info-grid">
          <div class="det-info-box">
            <div class="det-box-title"><i class="pi pi-building me-1"></i>SUPPLIER</div>
            <div class="det-kv"><span class="det-k">Nama</span><span class="det-v fw-semibold">{{ detailData.header?.nama_supplier || '-' }}</span></div>
            <div class="det-kv"><span class="det-k">No. Telp</span><span class="det-v mono">{{ detailData.header?.no_telp || '-' }}</span></div>
            <div v-if="Number(detailData.header?.payment_id) !== 1" class="det-kv">
              <span class="det-k">Jatuh Tempo</span><span class="det-v mono">{{ detailData.header?.jatuh_tempo || '-' }}</span>
            </div>
            <div v-if="detailData.header?.lampiran_url" class="det-kv">
              <span class="det-k">Lampiran</span>
              <a :href="detailData.header.lampiran_url" target="_blank" class="det-lampiran-link">
                <i class="pi pi-paperclip me-1"></i>Lihat
              </a>
            </div>
          </div>
          <div class="det-info-box det-total-box">
            <div class="det-box-title"><i class="pi pi-calculator me-1"></i>RINGKASAN TOTAL</div>
            <div class="det-kv"><span class="det-k">Pajak</span><span class="det-v">{{ detailData.header?.PAJAK ?? '-' }}%</span></div>
            <div class="det-kv"><span class="det-k">Sub Total</span><span class="det-v mono">{{ detailData.header?.SUB_TOTAL ? formatCurrency(detailData.header.SUB_TOTAL) : '-' }}</span></div>
            <div class="det-kv det-kv-grand">
              <span class="det-k">Grand Total</span>
              <span class="det-v mono" style="font-size:15px;font-weight:700;color:#0d9488">{{ detailData.header?.GRAND_TOTAL ? formatCurrency(detailData.header.GRAND_TOTAL) : '-' }}</span>
            </div>
          </div>
        </div>

        <!-- ── ITEMS TABLE ── -->
        <div class="det-box-title mt-3 mb-2"><i class="pi pi-list me-1"></i>ITEM DITERIMA ({{ detailData.details?.length ?? 0 }} item)</div>
        <div style="overflow-x:auto">
          <table class="det-table">
            <thead>
              <tr>
                <th style="width:30px;text-align:center">#</th>
                <th>Nama Barang</th>
                <th style="width:70px;text-align:center">Qty</th>
                <th style="width:80px">Satuan</th>
                <th style="width:130px;text-align:right">Harga Satuan</th>
                <th style="width:130px;text-align:right">Total</th>
                <th style="width:100px">No Batch</th>
                <th style="width:110px">Tgl Expired</th>
                <th v-if="!detailRiwayat?.is_batal" style="width:80px;text-align:center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in detailData.details" :key="i" :style="d.is_batal ? 'opacity:.45;text-decoration:line-through' : ''">
                <td class="mono" style="color:#94a3b8;text-align:center">{{ i + 1 }}</td>
                <td>
                  <div style="font-size:12px;font-weight:600;color:#1e293b">{{ d.nama_barang }}</div>
                  <div v-if="d.id_barang" style="font-size:10px;color:#94a3b8">{{ d.id_barang }}</div>
                </td>
                <td class="mono" style="text-align:center;font-weight:600">{{ d.qty_diterima }}</td>
                <td style="font-size:11px;color:#64748b">{{ d.satuan }}</td>
                <td class="mono" style="text-align:right;color:#475569">{{ d.harga_satuan ? formatCurrency(d.harga_satuan) : '-' }}</td>
                <td class="mono" style="text-align:right;font-weight:700;color:#0f766e">{{ d.HARGA_TOTAL ? formatCurrency(d.HARGA_TOTAL) : '-' }}</td>
                <td class="mono" style="font-size:11px;color:#64748b">{{ d.no_batch || '-' }}</td>
                <td class="mono" style="font-size:11px;color:#64748b">{{ d.tgl_expired || '-' }}</td>
                <td v-if="!detailRiwayat?.is_batal" style="text-align:center;text-decoration:none">
                  <span v-if="d.is_batal" style="font-size:10px;font-weight:700;color:#dc2626;opacity:1">Dibatalkan</span>
                  <Button
                    v-else
                    icon="pi pi-times"
                    v-tooltip.top="'Batal Item'"
                    size="small" text rounded
                    style="color:#dc2626;width:1.6rem;height:1.6rem;padding:0"
                    :loading="batalItemLoading === d.id_barang"
                    @click="openBatalItem(d)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </template>
    </Dialog>

    <!-- DIALOG BATAL ITEM -->
    <Dialog
      v-model:visible="batalItemDialog.visible"
      header="Batalkan Item Penerimaan?"
      modal
      :closable="!batalItemLoading"
      :style="{ width: '420px', maxWidth: '96vw' }"
    >
      <p style="font-size:13px;color:#374151;margin:0 0 8px">
        Item <strong>{{ batalItemDialog.item?.nama_barang }}</strong> akan dibatalkan dan stok dikembalikan.
      </p>
      <div class="pm-warn-box">
        <i class="pi pi-exclamation-triangle me-1"></i>
        Tindakan ini tidak dapat diurungkan.
      </div>
      <Textarea
        v-model="batalItemDialog.keterangan"
        placeholder="Keterangan pembatalan (opsional)"
        rows="2"
        style="width:100%;margin-top:10px;font-size:12px"
        :disabled="batalItemLoading"
      />
      <template #footer>
        <Button label="Tidak" severity="secondary" outlined class="round-button2" @click="batalItemDialog.visible = false" :disabled="batalItemLoading" />
        <Button label="Ya, Batalkan Item" icon="pi pi-times" severity="danger" class="round-button2" @click="batalItem" :loading="batalItemLoading" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const id_pemesanan = route.params.id_pemesanan

const fetchLoading = ref(false)
const loading = ref(false)
const spInfo = ref(null)
const items = ref([])
const itemError = ref('')
const isFullyReceived = ref(false)
const isSpSelesai = computed(() => {
  const label = (spInfo.value?.status_label ?? '').toLowerCase()
  return label === 'selesai' || spInfo.value?.status_sp === 4
})
const isSpDiterima = computed(() => {
  return (spInfo.value?.status_label ?? '').toLowerCase() === 'diterima'
})
const hasUnsavedItems = computed(() => items.value.some(i =>
  Number(i._qty_diterima) > 0 ||
  Number(i._diskon) > 0 ||
  Number(i._harga_jual) > 0 ||
  Number(i._margin) > 0 ||
  (i._no_batch || '') !== '' ||
  (i._tgl_expired || '') !== ''
))

const today = new Date().toISOString().slice(0, 10)
const form = ref({
  tanggal_penerimaan: today,
  no_faktur: '',
  pajak: 0,
  pajak_include: 1,
  payment_id: 1,
  jatuh_tempo: '',
})

const konfirmasiVisible = ref(false)
const konfErrors = ref({ jatuh_tempo: '', no_faktur: '' })

const lampiran = ref({ file: null, error: '', isDrag: false })

function hapusLampiran() {
  lampiran.value = { file: null, error: '', isDrag: false }
}

function onFileDrop(e) {
  lampiran.value.isDrag = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setLampiran(file)
}

function onFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) setLampiran(file)
  e.target.value = ''
}

function setLampiran(file) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowed.includes(file.type)) {
    lampiran.value = { file: null, error: 'Format tidak didukung. Gunakan JPG, PNG, atau PDF.', isDrag: false }
    return
  }
  lampiran.value = { file, error: '', isDrag: false }
}

// ── HELPERS ──
function satuanOptions(item) {
  return [item.satuan_kecil, item.satuan_sedang, item.satuan_besar].filter(Boolean)
}

function hargaSetelahDiskon(item) {
  if (!item._harga_satuan) return null
  const diskon = Number(item._diskon) || 0
  return Math.round(item._harga_satuan * (1 - diskon / 100))
}

function hargaEfektif(item) {
  if (!item._harga_satuan) return null
  const netto = hargaSetelahDiskon(item)
  const pajak = Number(form.value.pajak) || 0
  if (form.value.pajak_include === 0 && pajak > 0) {
    return Math.round(netto * (1 + pajak / 100))
  }
  if (item._diskon) return netto
  return null
}

function subtotalItem(item) {
  const qty = Number(item._qty_diterima) || 0
  if (!qty || !item._harga_satuan) return 0
  const hargaNetto = hargaSetelahDiskon(item)
  const pajak = Number(form.value.pajak) || 0
  if (form.value.pajak_include === 0 && pajak > 0) {
    return Math.round(hargaNetto * (1 + pajak / 100)) * qty
  }
  return hargaNetto * qty
}

const grandTotal = computed(() =>
  items.value.reduce((sum, i) => sum + subtotalItem(i), 0)
)

const grandTotalPreTax = computed(() =>
  items.value.reduce((sum, i) => {
    const qty = Number(i._qty_diterima) || 0
    if (!qty || !i._harga_satuan) return sum
    return sum + hargaSetelahDiskon(i) * qty
  }, 0)
)

function displayQty(item, qtyKecil) {
  if (qtyKecil == null) return '-'
  return Math.floor(qtyKecil / faktorSatuan(item, item._satuan))
}

function maxQtyDiterima(item) {
  if (!item._satuan || item.is_full) return 0
  const sisa = item.qty_sisa
  if (item._satuan === item.satuan_kecil) return sisa
  if (item._satuan === item.satuan_sedang) return Math.floor(sisa / (item.isi_sedang_ke_kecil || 1))
  if (item._satuan === item.satuan_besar) return Math.floor(sisa / ((item.isi_sedang_ke_kecil || 1) * (item.isi_besar_ke_sedang || 1)))
  return sisa
}

function faktorSatuan(item, satuan) {
  if (!satuan) return 1
  if (satuan === item.satuan_kecil) return 1
  if (satuan === item.satuan_sedang) return item.isi_sedang_ke_kecil || 1
  if (satuan === item.satuan_besar) return (item.isi_sedang_ke_kecil || 1) * (item.isi_besar_ke_sedang || 1)
  return 1
}

function hargaPerSatuan(item, satuan) {
  // harga_satuan_kecil sudah dinormalisasi ke per satuan kecil saat mapping
  const base = item._harga_satuan_kecil
  if (!base || !satuan) return base
  return Math.round(base * faktorSatuan(item, satuan))
}

function onSatuanChange(item) {
  item._qty_diterima = null
  item._error = false
  item._harga_satuan = hargaPerSatuan(item, item._satuan)
  // Recompute harga jual kalau pakai margin
  if (item._harga_mode === 'margin' && item._margin != null) {
    computeHargaJualFromMargin(item)
  } else {
    item._harga_jual = null
    item._margin = null
  }
}

function onQtyChange(item) {
  const max = maxQtyDiterima(item)
  if (item._qty_diterima > max) item._qty_diterima = max
  item._error = false
}

// ── HARGA JUAL / MARGIN (mutual exclusive) ──
function setHargaMode(item, mode) {
  item._harga_mode = mode
  if (mode === 'manual') {
    item._margin = null
  } else {
    item._harga_jual = null
    if (item._harga_satuan && item._margin) {
      computeHargaJualFromMargin(item)
    }
  }
}


function computeHargaJualFromMargin(item) {
  if (!item._harga_satuan || item._margin == null) return
  item._harga_jual = Math.round(item._harga_satuan * (1 + item._margin / 100))
}

// ── COMPUTED ──
const activeItems = computed(() => items.value.filter(i => !i.is_full))
const filledItems = computed(() => activeItems.value.filter(i => i._qty_diterima > 0))

// ── FETCH DATA SP ──
async function fetchItemsSP() {
  fetchLoading.value = true
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_items_sp/${id_pemesanan}/${authStore.id_client}/${authStore.id_lokasi}`
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code !== 200) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Gagal memuat data SP', life: 3000 })
      return
    }
    spInfo.value = res.data?.sp ?? null
    isFullyReceived.value = res.data?.sp?.is_fully_received === true
    const rawItems = res.data?.response || []
    items.value = rawItems.map(i => {
      // Normalisasi harga ke per satuan kecil berdasarkan satuan_pesan dari SP
      let hargaPerKecil = i.harga_satuan ?? null
      if (hargaPerKecil && i.satuan_pesan) {
        if (i.satuan_pesan === i.satuan_sedang) {
          hargaPerKecil = hargaPerKecil / (i.isi_sedang_ke_kecil || 1)
        } else if (i.satuan_pesan === i.satuan_besar) {
          hargaPerKecil = hargaPerKecil / ((i.isi_sedang_ke_kecil || 1) * (i.isi_besar_ke_sedang || 1))
        }
      }
      return {
      ...i,
      _satuan: i.satuan_kecil,
      _harga_satuan_kecil: hargaPerKecil, // harga per satuan kecil, tidak berubah
      _harga_satuan: hargaPerKecil,       // default tampil harga per satuan kecil
      _qty_diterima: null,
      _diskon: null,
      _harga_jual: null,
      _margin: null,
      _harga_mode: 'manual',
      _no_batch: '',
      _tgl_expired: '',
      _error: false,
      }
    })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data SP', life: 3000 })
  } finally {
    fetchLoading.value = false
    fetchRiwayat()
  }
}

// ── RIWAYAT ──
const riwayatOpen = ref(false)
const riwayatLoading = ref(false)
const riwayatList = ref([])

async function fetchRiwayat() {
  riwayatLoading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_list_penerimaan_sp`,
      { id_pemesanan: Number(id_pemesanan), idclient: authStore.id_client, id_lokasi: authStore.id_lokasi }
    )
    riwayatList.value = res.data?.response || []
  } catch {
    // riwayat bersifat informatif, gagal silent
  } finally {
    riwayatLoading.value = false
  }
}

// ── BATAL PENERIMAAN ──
const batalKonfirmasi = ref({ visible: false, item: null })
const batalLoading = ref(false)
const cancelledNos = ref([])

function confirmBatal(r) {
  batalKonfirmasi.value = { visible: true, item: r, keterangan: '' }
}

async function batalPenerimaan() {
  const r = batalKonfirmasi.value.item
  if (!r) return
  batalLoading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/batal_penerimaan`,
      {
        no_penerimaan: r.no_penerimaan,
        user_id: authStore.user_id,
        idclient: authStore.id_client,
        id_lokasi: authStore.id_lokasi,
        ...(batalKonfirmasi.value.keterangan?.trim() ? { keterangan_batal: batalKonfirmasi.value.keterangan.trim() } : {}),
      }
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code === 200) {
      batalKonfirmasi.value.visible = false
      toast.add({ severity: 'success', summary: 'Berhasil', detail: res.data?.metadata?.message || 'Penerimaan berhasil dibatalkan', life: 4000 })
      await fetchItemsSP()
    } else {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Gagal membatalkan penerimaan', life: 5000 })
    }
  } catch (err) {
    const msg = err.response?.data?.metadata?.message || err.response?.data?.message || 'Gagal membatalkan penerimaan'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
  } finally {
    batalLoading.value = false
  }
}

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)
const detailRiwayat = ref(null)

async function lihatDetailPenerimaan(item) {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  detailRiwayat.value = item
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_detail_penerimaan_sp/${item.no_penerimaan}/${authStore.id_client}`
    )
    detailData.value = res.data?.response ?? null
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail penerimaan', life: 3000 })
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

async function refreshDetail() {
  const item = detailRiwayat.value
  if (!item) return
  detailLoading.value = true
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_detail_penerimaan_sp/${item.no_penerimaan}/${authStore.id_client}`
    )
    detailData.value = res.data?.response ?? null
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail', life: 3000 })
  } finally {
    detailLoading.value = false
  }
}

// ── BATAL ITEM ──
const batalItemDialog = ref({ visible: false, item: null, keterangan: '' })
const batalItemLoading = ref(false)

function openBatalItem(d) {
  batalItemDialog.value = { visible: true, item: d, keterangan: '' }
}

async function batalItem() {
  const d = batalItemDialog.value.item
  if (!d) return
  batalItemLoading.value = true
  try {
    const body = {
      no_penerimaan: detailRiwayat.value.no_penerimaan,
      id_barang: d.id_barang,
      user_id: authStore.user_id,
      idclient: authStore.id_client,
      id_lokasi: authStore.id_lokasi,
    }
    if (batalItemDialog.value.keterangan?.trim()) body.keterangan_batal = batalItemDialog.value.keterangan.trim()
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/batal_item_penerimaan`,
      body
    )
    const meta = res.data?.metadata
    const code = meta?.code ?? res.data?.code
    if (code === 200) {
      batalItemDialog.value.visible = false
      toast.add({ severity: 'success', summary: 'Berhasil', detail: meta?.message || 'Item berhasil dibatalkan', life: 4000 })
      if (meta?.semua_item_batal) {
        detailRiwayat.value = { ...detailRiwayat.value, is_batal: 1 }
        await fetchItemsSP()
      }
      await refreshDetail()
    } else {
      toast.add({ severity: 'error', summary: 'Gagal', detail: meta?.message || 'Gagal membatalkan item', life: 5000 })
    }
  } catch (err) {
    const msg = err.response?.data?.metadata?.message || err.response?.data?.message || 'Gagal membatalkan item'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
  } finally {
    batalItemLoading.value = false
  }
}

// ── VALIDASI & SUBMIT ──
function validate() {
  itemError.value = ''
  const toSubmit = activeItems.value.filter(i => i._qty_diterima > 0)
  if (toSubmit.length === 0) {
    itemError.value = 'Minimal 1 item harus diisi qty diterima'
    return false
  }
  for (const item of toSubmit) {
    const max = maxQtyDiterima(item)
    if (item._qty_diterima > max) {
      item._error = true
      itemError.value = `Qty diterima ${item.nama_barang} melebihi sisa (maks ${max} ${item._satuan})`
      return false
    }
    if (!item._satuan) {
      item._error = true
      itemError.value = `Satuan wajib dipilih untuk ${item.nama_barang}`
      return false
    }
  }
  if (!form.value.tanggal_penerimaan) {
    itemError.value = 'Tanggal penerimaan wajib diisi'
    return false
  }
  return true
}

function bukaKonfirmasi() {
  if (!validate()) return
  konfErrors.value = { jatuh_tempo: '', no_faktur: '' }
  konfirmasiVisible.value = true
}

async function submitPenerimaan() {
  konfErrors.value = { jatuh_tempo: '', no_faktur: '' }
  if (!form.value.no_faktur?.trim()) {
    konfErrors.value.no_faktur = 'No. Faktur wajib diisi'
    return
  }
  if (form.value.payment_id === 3 && !form.value.jatuh_tempo) {
    konfErrors.value.jatuh_tempo = 'Tanggal jatuh tempo wajib diisi untuk pembayaran kredit'
    return
  }
  if (!form.value.tanggal_penerimaan) {
    konfErrors.value.jatuh_tempo = 'Tanggal penerimaan wajib diisi'
    return
  }
  loading.value = true
  try {
    const details = activeItems.value
      .filter(i => i._qty_diterima > 0)
      .map(i => {
        const d = {
          id_barang: i.id_barang,
          satuan: i._satuan,
          qty_diterima: i._qty_diterima,
        }
        if (i._harga_satuan) d.harga_satuan = i._harga_satuan
        if (i._diskon != null && i._diskon !== '') d.diskon = i._diskon
        if (i._harga_jual) d.harga_jual = i._harga_jual
        if (i._no_batch) d.no_batch = i._no_batch
        if (i._tgl_expired) d.tgl_expired = i._tgl_expired
        return d
      })

    const payload = {
      id_pemesanan: Number(id_pemesanan),
      tanggal_penerimaan: form.value.tanggal_penerimaan,
      user_id: authStore.user_id,
      idclient: authStore.id_client,
      id_lokasi: authStore.id_lokasi,
      pajak: Number(form.value.pajak) || 0,
      pajak_include: form.value.pajak_include,
      payment_id: form.value.payment_id,
      details,
    }
    payload.no_faktur = form.value.no_faktur.trim()
    if (form.value.payment_id === 3 && form.value.jatuh_tempo) payload.jatuh_tempo = form.value.jatuh_tempo

    let requestBody
    if (lampiran.value.file) {
      const fd = new FormData()
      fd.append('data', JSON.stringify(payload))
      fd.append('lampiran', lampiran.value.file)
      requestBody = fd
    } else {
      requestBody = payload
    }

    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/save_penerimaan_sp`,
      requestBody
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code !== 200) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || res.data?.message || 'Gagal menyimpan penerimaan', life: 4000 })
      return
    }
    const noPenerimaan = res.data?.metadata?.no_penerimaan ?? res.data?.no_penerimaan
    isFullyReceived.value = res.data?.metadata?.is_fully_received === true
    konfirmasiVisible.value = false
    toast.add({
      severity: 'success',
      summary: 'Penerimaan Berhasil',
      detail: noPenerimaan ? `No Penerimaan: ${noPenerimaan}` : 'Penerimaan berhasil disimpan',
      life: 5000,
    })
    await fetchItemsSP()
    if (!isFullyReceived.value) {
      router.push({ name: 'PenerimaanList' })
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Gagal menyimpan penerimaan', life: 4000 })
  } finally {
    loading.value = false
  }
}

function konfirmasiSelesaikanSP() {
  const totalPesan = items.value.reduce((sum, i) => sum + (Number(i.qty_pesan_kecil) || 0), 0)
  const totalSisa = items.value.reduce((sum, i) => sum + (Number(i.qty_sisa) || 0), 0)
  const totalDiterima = totalPesan - totalSisa
  const persen = totalPesan > 0 ? Math.round((totalDiterima / totalPesan) * 100) : 0
  const belumPenuh = persen < 100

  confirm.require({
    message: belumPenuh
      ? `SP baru diterima ${persen}% dari total pesanan. Selesaikan SP sekarang? Sisa ${100 - persen}% tidak akan diterima.`
      : 'Semua item sudah diterima penuh. Selesaikan SP ini?',
    header: 'Konfirmasi Selesaikan SP',
    icon: belumPenuh ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle',
    acceptLabel: 'Ya, Selesaikan',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-success',
    accept: () => selesaikanSP(),
  })
}

async function selesaikanSP() {
  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/selesaikan_sp`,
      { id_pemesanan: Number(id_pemesanan), idclient: authStore.id_client, id_lokasi: authStore.id_lokasi }
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code !== 200) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || res.data?.message || 'Gagal menyelesaikan SP', life: 4000 })
      return
    }
    const persen = res.data?.metadata?.persentase
    const detailMsg = persen != null ? `SP diselesaikan. Diterima ${Math.round(persen)}%` : 'Surat Pesanan telah diselesaikan'
    toast.add({ severity: 'success', summary: 'SP Selesai', detail: detailMsg, life: 4000 })
    router.push({ name: 'PenerimaanList' })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message || 'Gagal menyelesaikan SP', life: 4000 })
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'PenerimaanList' })
}

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchItemsSP)
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0;white-space:nowrap; }

.pm-fm-section { background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:0; }
.pm-fm-section-title { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;padding-bottom:8px;border-bottom:1px solid #ccfbf1;margin-bottom:12px; }
.pm-fm-label { font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;display:block; }
.pm-fm-opt { font-weight:400;color:#94a3b8;font-size:11px; }

.pm-date-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;font-family:inherit;color:#1e293b;background:#fff;height:34px; }
.pm-date-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.pm-date-input:disabled { background:#f8fafc;color:#94a3b8; }

.pm-items-table { width:100%;border-collapse:collapse;font-size:12px; }
.pm-items-table thead tr { background:#f0fdfa; }
.pm-items-table thead th { padding:5px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.pm-items-table tbody tr { border-bottom:1px solid #e2e8f0; }
.pm-items-table tbody tr:hover:not(.item-disabled) { background:#f8fafc; }
.pm-items-table tbody td { padding:4px 6px;vertical-align:top; }
.item-disabled td { background:#f8fafc !important;opacity:.65; }
.item-row-warn { background:#fff7ed !important; }
.item-row-warn td { background:#fff7ed !important; }

.pm-num-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;width:100%;font-family:inherit;color:#1e293b;height:34px; }
.pm-num-input:focus { outline:none;border-color:#0d9488; }
.pm-num-input.input-warn { border-color:#f97316; }
.pm-num-input:disabled { background:#f8fafc;color:#94a3b8; }
.pm-items-table, .pm-items-table *:not(i):not([class*="pi"]) { font-family:inherit !important; }
:deep(.pm-items-table .p-inputtext) { border-radius:5px !important;height:34px !important;font-size:12px !important;padding:5px 8px !important; }
:deep(.pm-items-table .p-select) { border-radius:5px !important;height:34px !important;font-size:12px !important; }
:deep(.pm-items-table .p-select-label) { font-size:12px !important;padding:5px 8px !important;line-height:1.5 !important; }

.pm-items-summary { margin-top:8px;font-size:12px;color:#64748b;display:flex;align-items:center;gap:6px; }
.pm-warn-box { background:#fff7ed;border:1px solid #fed7aa;border-radius:5px;padding:7px 12px;font-size:12px;color:#c2410c; }
.full-badge { display:inline-block;padding:1px 6px;border-radius:8px;font-size:10px;font-weight:700;background:#f1f5f9;color:#475569;margin-top:2px; }

/* ── PAJAK TOGGLE ── */
.pajak-toggle { display:flex;flex-direction:column;gap:4px; }
.toggle-group { display:flex;border:1px solid #d1d5db;border-radius:6px;overflow:hidden;height:34px; }
.toggle-btn { flex:1;border:none;background:#fff;font-size:12px;font-weight:600;color:#64748b;cursor:pointer;padding:0 12px;transition:all .15s;white-space:nowrap; }
.toggle-btn:hover:not(:disabled) { background:#f0fdfa; }
.toggle-btn.active { background:#0d9488;color:#fff; }
.toggle-btn:disabled { cursor:not-allowed;opacity:.6; }

/* ── CARA BAYAR CARD TOGGLE ── */
.cara-bayar-group { display:flex;gap:10px; }
.cara-bayar-btn {
  display:flex;align-items:center;gap:10px;
  border:2px solid #e2e8f0;border-radius:10px;
  background:#fff;padding:10px 16px;cursor:pointer;
  transition:all .15s;flex:1;text-align:left;
  min-width:0;
}
.cara-bayar-btn:hover:not(:disabled) { border-color:#0d9488;background:#f0fdfa; }
.cara-bayar-btn.active { border-color:#0d9488;background:#f0fdfa;box-shadow:0 0 0 3px rgba(13,148,136,.1); }
.cara-bayar-btn:disabled { cursor:not-allowed;opacity:.55; }
.cb-icon {
  width:36px;height:36px;border-radius:8px;
  background:#e2e8f0;color:#64748b;
  display:flex;align-items:center;justify-content:center;
  font-size:16px;flex-shrink:0;transition:all .15s;
}
.cara-bayar-btn.active .cb-icon { background:#0d9488;color:#fff; }
.cb-text { display:flex;flex-direction:column;gap:1px;min-width:0; }
.cb-label { font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap; }
.cb-sub { font-size:10px;color:#94a3b8;white-space:nowrap; }
.cara-bayar-btn.active .cb-label { color:#0d9488; }

/* ── HARGA JUAL / MARGIN TOGGLE ── */
.hj-wrap { display:flex;flex-direction:column;gap:3px; }
.hj-mode-toggle { display:flex;border:1px solid #e2e8f0;border-radius:5px;overflow:hidden;height:24px;margin-top:3px; }
.hj-mode-btn { flex:1;border:none;background:#f8fafc;font-size:10px;font-weight:600;color:#94a3b8;cursor:pointer;padding:0 6px;transition:all .12s;white-space:nowrap; }
.hj-mode-btn:hover:not(:disabled) { background:#f0fdfa;color:#0d9488; }
.hj-mode-btn.active { background:#0d9488;color:#fff; }
.hj-mode-btn:disabled { cursor:not-allowed;opacity:.6; }
.hj-input-wrap { margin-top:0; }

/* ── RIWAYAT ── */
.riwayat-list { display:flex;flex-direction:column;gap:5px; }
.riwayat-item { display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:6px;cursor:pointer;border:1px solid #e2e8f0;background:#fff; }
.riwayat-item:hover { background:#f0fdfa;border-color:#99f6e4; }
.riwayat-item-batal { opacity:.7;background:#fafafa !important; }
.riwayat-item-batal:hover { background:#fff1f2 !important;border-color:#fca5a5 !important; }
.riwayat-left { display:flex;flex-direction:column;gap:1px; }
.riwayat-no { font-size:12px;font-weight:600;color:#0d9488;font-family:inherit; }
.riwayat-date { font-size:10px;color:#94a3b8; }
.riwayat-right { display:flex;align-items:center;gap:8px; }
.riwayat-badge-batal { display:inline-block;padding:1px 7px;border-radius:8px;font-size:10px;font-weight:700;background:#fee2e2;color:#dc2626; }
.riwayat-batal-info { font-size:10px;color:#ef4444;font-style:italic; }

/* ── DETAIL DIALOG ── */
.det-dialog-header { display:flex;align-items:center;justify-content:space-between;width:100%; }
.det-dialog-header-left { display:flex;align-items:center;gap:12px; }
.det-dialog-icon { width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
.det-icon-normal { background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff; }
.det-icon-batal { background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff; }
.det-dialog-no { font-size:15px;font-weight:700;color:#0d9488; }
.det-status-aktif { display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:#dcfce7;color:#15803d; }
.det-status-batal { display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:#fee2e2;color:#dc2626; }

.det-batal-banner { display:flex;align-items:flex-start;gap:10px;background:#fff1f2;border:1px solid #fca5a5;border-radius:8px;padding:10px 14px;margin-bottom:14px;color:#b91c1c;font-size:12px; }

.det-stat-row { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px; }
.det-stat-card { display:flex;align-items:center;gap:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px; }
.det-stat-ico { width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0; }
.det-stat-lbl { font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.det-stat-val { font-size:12px;font-weight:700;color:#1e293b;margin-top:1px; }

.det-info-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px; }
.det-info-box { background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px; }
.det-total-box { background:#f0fdfa;border-color:#99f6e4; }
.det-box-title { font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;margin-bottom:8px;display:flex;align-items:center; }
.det-kv { display:grid;grid-template-columns:110px 1fr;gap:6px;padding:3px 0;font-size:12px; }
.det-kv-grand { border-top:1px solid #99f6e4;padding-top:8px;margin-top:4px; }
.det-k { color:#64748b; }
.det-v { color:#1e293b;font-weight:500; }
.det-lampiran-link { color:#0d9488;text-decoration:none;display:inline-flex;align-items:center;font-size:12px; }
.det-lampiran-link:hover { text-decoration:underline; }

.det-table { width:100%;border-collapse:collapse;font-size:12px; }
.det-table thead tr { background:#f0fdfa; }
.det-table thead th { padding:6px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.det-table tbody tr { border-bottom:1px solid #f1f5f9; }
.det-table tbody tr:hover { background:#f0fdfa; }
.det-table tbody td { padding:6px 8px;vertical-align:middle; }

.fully-received-banner { display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);border:1px solid #86efac;border-radius:8px;padding:12px 16px;color:#15803d;font-size:13px; }
.sp-selesai-banner { display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #7dd3fc;border-radius:8px;padding:12px 16px;color:#0369a1;font-size:13px; }
.btn-selesai { background:#16a34a !important;border-color:#16a34a !important;color:#fff !important; }
.btn-selesai:hover { background:#15803d !important;border-color:#15803d !important; }
/* ── DIALOG KONFIRMASI ── */
.konf-sp-card { background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:12px 14px;margin-bottom:4px; }
.konf-sp-row { display:grid;grid-template-columns:120px 1fr;gap:6px;padding:3px 0;font-size:12px; }
.konf-lbl { color:#64748b; }
.konf-val { color:#1e293b;font-weight:500; }
.konf-divider { height:1px;background:#e2e8f0;margin:14px 0; }
.konf-form { display:flex;flex-direction:column;gap:12px; }
.konf-field { display:flex;flex-direction:column;gap:4px; }
.input-date-warn { border-color:#f97316 !important; }

/* ── GRAND TOTAL ROW ── */
.grand-total-row { background:#f0fdfa;border-top:2px solid #99f6e4; }

/* ── PAJAK SECTION ── */
.pajak-section { display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:10px 16px;gap:16px;flex-wrap:wrap; }
.pajak-section-left { display:flex;align-items:center;gap:10px; }
.pajak-section-label { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488; }
.pajak-section-right { display:flex;align-items:center;gap:8px; }
.toggle-group-sm { display:flex;border:1px solid #d1d5db;border-radius:5px;overflow:hidden;height:30px; }
.toggle-btn-sm { flex:1;border:none;background:#fff;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;padding:0 12px;transition:all .12s;white-space:nowrap; }
.toggle-btn-sm:hover:not(:disabled) { background:#f0fdfa; }
.toggle-btn-sm.active { background:#0d9488;color:#fff; }
.toggle-btn-sm:disabled { cursor:not-allowed;opacity:.6; }
.pajak-pct-input { border:1px solid #d1d5db;border-radius:5px;padding:4px 8px;font-size:13px;width:70px;font-family:inherit;color:#1e293b;height:30px; }
.pajak-pct-input:focus { outline:none;border-color:#0d9488; }
.pajak-info-chip { background:#fef9c3;border:1px solid #fde047;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:600;color:#854d0e;font-family:inherit; }
.pajak-include-note { font-size:12px;color:#15803d;font-weight:600; }
.fade-slide-enter-active,.fade-slide-leave-active { transition:opacity .15s,transform .15s; }
.fade-slide-enter-from,.fade-slide-leave-to { opacity:0;transform:translateX(-6px); }

.pm-page-footer { display:flex;justify-content:flex-end;gap:8px;padding:16px 0 8px;margin-top:8px;border-top:1px solid #e2e8f0; }
.mono { font-family:inherit;font-size:12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }

/* ── UPLOAD LAMPIRAN ── */
.upload-area {
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  border:2px dashed #cbd5e1;border-radius:8px;padding:20px 12px;cursor:pointer;
  background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;
  transition:border-color .15s,background .15s;user-select:none;
}
.upload-area:hover { border-color:#0d9488;background:#f0fdfa;color:#0d9488; }
.upload-area-drag { border-color:#0d9488 !important;background:#f0fdfa !important;color:#0d9488 !important; }
.upload-area .pi { font-size:22px; }
.upload-status {
  display:flex;align-items:center;gap:10px;border-radius:8px;padding:10px 12px;font-size:12px;
}
.upload-success { background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d; }
.upload-success .upload-name { font-weight:600;font-family:inherit;word-break:break-all; }
.upload-preview { width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #bbf7d0; }
.pm-fm-opt { font-weight:400;color:#94a3b8;font-size:11px; }
</style>
