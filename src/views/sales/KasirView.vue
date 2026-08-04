<template>
  <div class="pos-page">
    <Toast />
    <ConfirmDialog />

    <!-- ══ SCREEN ══ -->
    <div>
      <Toolbar class="pos-toolbar mb-2">
        <template #start>
          <div class="pos-title">
            <div class="pos-title-icon"><i class="pi pi-shopping-cart"></i></div>
            <div>
              <div class="pos-title-main">Kasir Penjualan</div>
              <div class="pos-title-sub">Sales Langsung — Apotik</div>
            </div>
          </div>
        </template>
        <template #end>
          <div class="pos-toolbar-end">
            <Tag
              v-if="pakaiShift && isShiftOpen"
              severity="success"
              :value="`Shift Aktif — ${shift.IDUSER}`"
              icon="pi pi-check-circle"
            />
            <Tag v-else-if="pakaiShift && !loadingShift" severity="danger" value="Shift Belum Dibuka" icon="pi pi-times-circle" />
            <Button
              icon="pi pi-history"
              label="Riwayat"
              severity="secondary"
              text
              size="small"
              @click="openRecentDialog"
            />
            <Button
              icon="pi pi-user"
              label="Ringkasan Saya"
              severity="secondary"
              text
              size="small"
              @click="router.push('/sales/ringkasan')"
            />
            <Button
              icon="pi pi-wallet"
              label="Kas Lain"
              severity="secondary"
              text
              size="small"
              @click="router.push('/sales/transaksi-lain')"
            />
            <Button
              v-if="izinkanPiutang"
              icon="pi pi-clock"
              label="Piutang"
              severity="secondary"
              text
              size="small"
              @click="router.push('/sales/rekap-piutang')"
            />
            <Button
              icon="pi pi-cog"
              severity="secondary"
              text
              size="small"
              v-tooltip.bottom="'Pengaturan Kasir'"
              @click="router.push('/sales/pengaturan')"
            />
            <template v-if="pakaiShift">
              <Button
                v-if="!isShiftOpen"
                icon="pi pi-lock-open"
                label="Buka Shift"
                size="small"
                :loading="loadingShift"
                @click="openBukaShiftDialog"
              />
              <Button v-else icon="pi pi-lock" label="Tutup Shift" severity="warn" size="small" @click="openTutupShiftDialog" />
            </template>
          </div>
        </template>
      </Toolbar>

      <!-- ── Belum ada shift ── -->
      <div v-if="!loadingShift && !loadingPosSetting && !siapTransaksi" class="state-box">
        <i class="pi pi-lock" style="font-size: 2.4rem; color: var(--p-text-muted-color)"></i>
        <div class="state-title">Shift kasir belum dibuka</div>
        <div class="state-sub">Buka shift dengan modal kas awal untuk mulai bertransaksi.</div>
        <Button label="Buka Shift Sekarang" icon="pi pi-lock-open" class="mt-3" @click="openBukaShiftDialog" />
      </div>

      <!-- ── Skeleton awal ── -->
      <div v-else-if="loadingShift || loadingPosSetting" class="state-box">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--p-primary-color)"></i>
        <div class="state-sub mt-2">Memeriksa status shift...</div>
      </div>

      <!-- ── POS Grid ── -->
      <template v-else>
        <!-- Kaitkan Pendaftaran Klinik (opsional, sebelum belanja) -->
        <div class="register-bar">
          <button v-if="!selectedRegister" type="button" class="register-bar-btn" @click="openRegisterDialog">
            <i class="pi pi-id-card"></i>
            <span>Kaitkan Pendaftaran Klinik <small>(opsional)</small></span>
          </button>
          <div v-else class="register-bar-chip">
            <i class="pi pi-id-card"></i>
            <div class="register-bar-info">
              <span class="register-bar-name">{{ selectedRegister.NAMAPASIEN }}</span>
              <span class="register-bar-meta mono"
                >{{ selectedRegister.NOPENDAFTARAN }} · No RM {{ selectedRegister.NOMR }}<span v-if="selectedRegister.POLI">
                  · {{ selectedRegister.POLI }}</span
                ></span
              >
            </div>
            <button type="button" class="register-bar-clear" v-tooltip.left="'Lepas kaitan'" @click="clearRegister">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <div class="pos-grid" :class="{ 'pos-grid-mobile': !isDesktop }">
          <!-- LEFT: search + produk -->
          <div class="pos-panel pos-panel-produk">
          <div class="produk-search">
            <IconField class="flex-1">
              <InputIcon class="pi pi-search" />
              <InputText
                ref="searchInputRef"
                v-model="searchQuery"
                placeholder="Cari nama barang atau scan barcode..."
                class="w-100"
                inputmode="search"
                @keyup.enter="onSearchEnter"
              />
            </IconField>
            <div class="view-mode-toggle">
              <button
                type="button"
                class="view-mode-btn"
                :class="{ active: viewMode === 'card' }"
                v-tooltip.bottom="'Tampilan kartu'"
                @click="viewMode = 'card'"
              >
                <i class="pi pi-th-large"></i>
              </button>
              <button
                type="button"
                class="view-mode-btn"
                :class="{ active: viewMode === 'table' }"
                v-tooltip.bottom="'Tampilan tabel'"
                @click="viewMode = 'table'"
              >
                <i class="pi pi-table"></i>
              </button>
            </div>
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              text
              v-tooltip.bottom="'Muat ulang daftar'"
              @click="fetchBarang({ reset: true })"
            />
            <Button
              icon="pi pi-sliders-h"
              label="Racikan"
              severity="help"
              size="small"
              v-tooltip.bottom="'Tambah Obat Racikan'"
              @click="openRacikanDialog"
            />
          </div>

          <div class="produk-grid-wrap">
            <div v-if="loadingSearch" class="state-box-sm">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Memuat barang...</span>
            </div>
            <div v-else-if="searchResults.length === 0" class="state-box-sm">
              <i class="pi pi-inbox"></i>
              <span>{{ searchQuery ? 'Barang tidak ditemukan' : 'Ketik nama barang atau scan barcode untuk mulai' }}</span>
            </div>
            <div v-else-if="viewMode === 'card'" class="produk-grid">
              <!-- Satu kartu per batch: barang multi-batch langsung terpampang semua,
                   tidak perlu dialog pilih batch lagi -->
              <button
                v-for="row in flatResults"
                :key="row.key"
                type="button"
                class="produk-card"
                :disabled="!row.batch || row.batch.QTY <= 0"
                @click="addToCart(row.barang, row.batch)"
              >
                <div class="produk-nama" :title="row.barang.NAMA">{{ row.barang.NAMA }}</div>
                <div class="produk-meta">
                  <span v-if="row.barang.KATEGORI">{{ row.barang.KATEGORI }}</span>
                  <span v-if="row.multiBatch" class="produk-batch mono">#{{ row.batch.SUB_BARCODE }}</span>
                  <span v-if="row.batch?.TGL_EXPIRED" :class="expClass(row.batch.TGL_EXPIRED)">
                    Exp {{ formatTglExpiry(row.batch.TGL_EXPIRED) }}
                  </span>
                </div>
                <div class="produk-bottom">
                  <span class="produk-harga">{{ formatRupiah(row.batch?.HARGAJUAL ?? row.batch?.HARGA ?? 0) }}</span>
                  <span class="produk-stok" :class="{ 'produk-stok-habis': !row.batch || row.batch.QTY <= 0 }">
                    {{ row.batch && row.batch.QTY > 0 ? `${row.batch.QTY} ${row.barang.SATUAN_KECIL || ''}` : 'Habis' }}
                  </span>
                </div>
              </button>
            </div>
            <div v-else class="produk-table-wrap">
              <table class="produk-table">
                <colgroup>
                  <col style="width: auto" />
                  <col style="width: 110px" />
                  <col style="width: 90px" />
                  <col style="width: 90px" />
                  <col style="width: 70px" />
                  <col style="width: 36px" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Exp</th>
                    <th style="text-align: right">Harga</th>
                    <th style="text-align: right">Stok</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in flatResults"
                    :key="row.key"
                    :class="{ 'produk-table-row-habis': !row.batch || row.batch.QTY <= 0 }"
                    @click="addToCart(row.barang, row.batch)"
                  >
                    <td>
                      <div class="produk-table-nama" :title="row.barang.NAMA">{{ row.barang.NAMA }}</div>
                      <span v-if="row.multiBatch" class="produk-batch mono">#{{ row.batch.SUB_BARCODE }}</span>
                    </td>
                    <td>{{ row.barang.KATEGORI || '-' }}</td>
                    <td>
                      <span v-if="row.batch?.TGL_EXPIRED" :class="expClass(row.batch.TGL_EXPIRED)">{{ formatTglExpiry(row.batch.TGL_EXPIRED) }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="produk-table-harga">{{ formatRupiah(row.batch?.HARGAJUAL ?? row.batch?.HARGA ?? 0) }}</td>
                    <td class="produk-stok" :class="{ 'produk-stok-habis': !row.batch || row.batch.QTY <= 0 }" style="text-align: right">
                      {{ row.batch && row.batch.QTY > 0 ? `${row.batch.QTY} ${row.barang.SATUAN_KECIL || ''}` : 'Habis' }}
                    </td>
                    <td style="overflow: visible">
                      <Button
                        icon="pi pi-plus"
                        size="small"
                        rounded
                        text
                        class="produk-table-add-btn"
                        :disabled="!row.batch || row.batch.QTY <= 0"
                        @click.stop="addToCart(row.barang, row.batch)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="searchTotalPages > 1" class="produk-pagination">
              <Button icon="pi pi-chevron-left" text size="small" :disabled="searchPage <= 1" @click="goPrevPage" />
              <span>Hal {{ searchPage }} / {{ searchTotalPages }}</span>
              <Button icon="pi pi-chevron-right" text size="small" :disabled="searchPage >= searchTotalPages" @click="goNextPage" />
            </div>
          </div>
        </div>

        <!-- RIGHT: cart & pembayaran (desktop only) -->
        <div class="pos-panel pos-panel-cart" v-if="isDesktop">
          <CartPanel
            :cart="cart"
            :cart-subtotal="cartSubtotal"
            :grand-total="grandTotal"
            :potongan="potongan"
            :total-bayar="totalBayar"
            :id-payment="idPayment"
            :note="note"
            :kembalian="kembalian"
            :can-checkout="canCheckout"
            :checking-out="checkingOut"
            :selected-pasien="selectedPasien"
            :pasien-results="pasienResults"
            :loading-pasien-search="loadingPasienSearch"
            :selected-register="selectedRegister"
            :pulse-key="cartPulseKey"
            :last-added-key="lastAddedKey"
            :izinkan-diskon-item="izinkanDiskonItem"
            :izinkan-diskon-bill="izinkanDiskonBill"
            :izinkan-piutang="izinkanPiutang"
            @inc-qty="incQty"
            @dec-qty="decQty"
            @set-qty="setQty"
            @remove-item="removeItem"
            @edit-racikan="openRacikanEdit"
            @clear-cart="clearCart"
            @change-satuan="changeSatuan"
            @set-discount="setDiscount"
            @checkout="doCheckout"
            @search-pasien="searchPasien"
            @select-pasien="selectPasien"
            @clear-pasien="clearPasien"
            @update:potongan="potongan = $event"
            @update:totalBayar="totalBayar = $event"
            @update:idPayment="idPayment = $event"
            @update:note="note = $event"
          />
        </div>
        </div>
      </template>

      <!-- ── Mobile floating cart bar ── -->
      <button
        v-if="!isDesktop && siapTransaksi && cart.length > 0"
        type="button"
        class="mobile-cart-bar"
        :class="{ 'mobile-cart-bar-pulse': mobileCartPulse }"
        @click="showMobileCart = true"
      >
        <i class="pi pi-shopping-cart"></i>
        <span>{{ cart.length }} item</span>
        <span class="mobile-cart-total">{{ formatRupiah(grandTotal) }}</span>
        <i class="pi pi-chevron-up"></i>
      </button>
    </div>

    <!-- ══ Dialog: keranjang mobile (bottom sheet) ══ -->
    <Dialog
      v-model:visible="showMobileCart"
      position="bottom"
      modal
      :draggable="false"
      header="Keranjang & Pembayaran"
      class="mobile-cart-dialog"
      :style="{ width: '100vw', maxWidth: '100vw', height: '85vh', margin: 0 }"
      :pt="{ content: { style: 'padding: 0; height: 100%; display: flex; flex-direction: column;' } }"
    >
      <CartPanel
        :cart="cart"
        :cart-subtotal="cartSubtotal"
        :grand-total="grandTotal"
        :potongan="potongan"
        :total-bayar="totalBayar"
        :id-payment="idPayment"
        :note="note"
        :kembalian="kembalian"
        :can-checkout="canCheckout"
        :checking-out="checkingOut"
        :selected-pasien="selectedPasien"
        :pasien-results="pasienResults"
        :loading-pasien-search="loadingPasienSearch"
        :selected-register="selectedRegister"
        :pulse-key="cartPulseKey"
        :last-added-key="lastAddedKey"
        :izinkan-diskon-item="izinkanDiskonItem"
        :izinkan-diskon-bill="izinkanDiskonBill"
        @inc-qty="incQty"
        @dec-qty="decQty"
        @set-qty="setQty"
        @remove-item="removeItem"
        @edit-racikan="openRacikanEdit"
        @clear-cart="clearCart"
        @change-satuan="changeSatuan"
        @set-discount="setDiscount"
        @checkout="doCheckout"
        @search-pasien="searchPasien"
        @select-pasien="selectPasien"
        @clear-pasien="clearPasien"
        @update:potongan="potongan = $event"
        @update:totalBayar="totalBayar = $event"
        @update:idPayment="idPayment = $event"
        @update:note="note = $event"
      />
    </Dialog>

    <!-- ══ Dialog: Buka Shift ══ -->
    <Dialog v-model:visible="showBukaShiftDialog" modal :draggable="false" :style="{ width: '95vw', maxWidth: '420px' }">
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <i class="pi pi-lock-open" style="color: var(--p-primary-color)"></i>
          <span style="font-weight: 700">Buka Shift Kasir</span>
        </div>
      </template>
      <div class="dialog-form">
        <label class="dialog-label">Modal Kas Awal <span class="text-danger">*</span></label>
        <InputNumber
          v-model="modalAwal"
          mode="decimal"
          :min="0"
          inputmode="decimal"
          class="w-100"
          placeholder="0"
          autofocus
          @keydown.enter="submitBukaShift"
        />
        <small class="dialog-hint">Masukkan jumlah kas fisik di laci kasir saat memulai shift.</small>
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" text @click="showBukaShiftDialog = false" />
        <Button label="Buka Shift" icon="pi pi-check" :loading="savingBukaShift" @click="submitBukaShift" />
      </template>
    </Dialog>

    <!-- ══ Dialog: Tutup Shift ══ -->
    <Dialog v-model:visible="showTutupShiftDialog" modal :draggable="false" :style="{ width: '95vw', maxWidth: '460px' }">
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <i class="pi pi-lock" style="color: var(--p-orange-500, #f97316)"></i>
          <span style="font-weight: 700">Tutup Shift Kasir</span>
        </div>
      </template>

      <div v-if="!tutupShiftResult" class="dialog-form">
        <div class="tutup-info-row">
          <span>Kasir</span><b>{{ shift?.IDUSER }}</b>
        </div>
        <div class="tutup-info-row">
          <span>Modal Awal</span><b>{{ formatRupiah(shift?.MODAL_AWAL) }}</b>
        </div>
        <div class="tutup-info-row">
          <span>Waktu Buka</span><b>{{ formatDateTime(shift?.WAKTU_BUKA) }}</b>
        </div>
        <Divider />
        <label class="dialog-label">Kas Fisik Akhir (hasil hitung manual) <span class="text-danger">*</span></label>
        <InputNumber v-model="modalAkhir" mode="decimal" locale="id-ID" :min="0" inputmode="decimal" class="w-100" placeholder="0" autofocus />
        <label class="dialog-label mt-2">Catatan (opsional)</label>
        <Textarea v-model="catatanTutup" rows="2" class="w-100" placeholder="Mis. alasan selisih..." autoResize />
      </div>

      <div v-else class="tutup-result">
        <i class="pi pi-check-circle" style="font-size: 2.2rem; color: var(--p-green-500, #22c55e)"></i>
        <div class="tutup-result-title">Shift Berhasil Ditutup</div>
        <div class="tutup-result-grid">
          <div><span>Total Transaksi</span><b>{{ tutupShiftResult.JUMLAH_TRANSAKSI }}</b></div>
          <div><span>Total Transaksi Refund</span><b>{{ tutupShiftResult.JUMLAH_TRANSAKSI_REFUND }}</b></div>
          <div><span>Total Penjualan</span><b>{{ formatRupiah(tutupShiftResult.TOTAL_PENJUALAN_KOTOR) }}</b></div>
          <div><span>Total Refund</span><b>{{ formatRupiah(tutupShiftResult.TOTAL_REFUND) }}</b></div>
          <div><span>Total Omzet</span><b>{{ formatRupiah(tutupShiftResult.TOTAL_OMZET) }}</b></div>
          <div><span>Total Tunai</span><b>{{ formatRupiah(tutupShiftResult.TOTAL_TUNAI) }}</b></div>
          <div><span>Total Non-Tunai</span><b>{{ formatRupiah(tutupShiftResult.TOTAL_NONTUNAI) }}</b></div>
          <div v-if="tutupShiftResult.TOTAL_PIUTANG"><span>Total Piutang</span><b>{{ formatRupiah(tutupShiftResult.TOTAL_PIUTANG) }}</b></div>
          <div><span>Pemasukan Lain (Tunai)</span><b>{{ formatRupiah(tutupShiftResult.PEMASUKAN_LAIN_TUNAI) }}</b></div>
          <div><span>Pengeluaran Lain (Tunai)</span><b>{{ formatRupiah(tutupShiftResult.PENGELUARAN_LAIN_TUNAI) }}</b></div>
          <div><span>Modal Akhir</span><b>{{ formatRupiah(tutupShiftResult.MODAL_AKHIR) }}</b></div>
          <div class="tutup-selisih" :class="{ 'is-zero': roundMoney(tutupShiftResult.SELISIH) === 0, 'is-neg': roundMoney(tutupShiftResult.SELISIH) < 0 }">
            <span>Selisih</span><b>{{ formatRupiah(tutupShiftResult.SELISIH) }}</b>
          </div>
        </div>
      </div>

      <template #footer>
        <template v-if="!tutupShiftResult">
          <Button label="Batal" severity="secondary" text @click="showTutupShiftDialog = false" />
          <Button label="Tutup Shift" icon="pi pi-check" severity="warn" :loading="savingTutupShift" @click="submitTutupShift" />
        </template>
        <template v-else>
          <Button label="Selesai" icon="pi pi-check" @click="closeTutupShiftDialog" />
        </template>
      </template>
    </Dialog>

    <!-- ══ Dialog: Transaksi Terakhir / Void ══ -->
    <Dialog v-model:visible="showRecentDialog" modal :draggable="false" :style="{ width: '95vw', maxWidth: '760px' }" header="Transaksi Terakhir">
      <div class="recent-toolbar">
        <Button icon="pi pi-refresh" label="Muat Ulang" size="small" severity="secondary" :loading="loadingRecent" @click="fetchRecentSales" />
      </div>
      <div v-if="loadingRecent" class="state-box-sm">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Memuat transaksi...</span>
      </div>
      <div v-else-if="recentReceipts.length === 0" class="state-box-sm">
        <i class="pi pi-inbox"></i>
        <span>Belum ada transaksi</span>
      </div>
      <div v-else class="recent-list">
        <button
          v-for="receipt in recentReceipts"
          :key="receipt.RECEIPT_NO"
          type="button"
          class="recent-row"
          :class="{ 'recent-row-voided': receipt.voided }"
          @click="openDetail(receipt)"
        >
          <div class="recent-row-main">
            <div class="recent-row-no mono">{{ receipt.RECEIPT_NO }}</div>
            <div class="recent-row-meta">{{ formatDateTime(receipt.TANGGAL) }} — {{ receipt.IDUSER }}</div>
            <div class="recent-row-items">{{ receipt.items.map((i) => i.NAMA).join(', ') }}</div>
          </div>
          <div class="recent-row-side">
            <Tag v-if="receipt.voided" icon="pi pi-ban" value="Dibatalkan" severity="danger" style="font-size: 10px" />
            <Tag
              v-else-if="receipt.partialVoid"
              icon="pi pi-info-circle"
              value="Sebagian Dibatalkan"
              severity="warn"
              style="font-size: 10px"
            />
            <span class="recent-row-total" :class="{ 'recent-row-total-voided': receipt.voided }">{{ formatRupiah(receipt.displayTotal) }}</span>
            <Button
              v-if="!receipt.voided && canVoid(receipt)"
              icon="pi pi-times-circle"
              severity="danger"
              size="small"
              text
              rounded
              v-tooltip.left="'Batalkan transaksi'"
              :loading="voidingReceipt === receipt.RECEIPT_NO"
              @click.stop="confirmVoid(receipt)"
            />
            <Tag
              v-else-if="!receipt.voided && receipt.idPayement === 3 && receipt.totalBayar > 0"
              icon="pi pi-lock"
              value="Sudah Dicicil"
              severity="secondary"
              style="font-size: 10px"
              v-tooltip.left="'Piutang ini sudah pernah dicicil, tidak bisa dibatalkan'"
            />
            <Tag
              v-else-if="!receipt.voided"
              icon="pi pi-lock"
              value="Terkunci"
              severity="secondary"
              style="font-size: 10px"
              v-tooltip.left="'Transaksi di luar shift yang sedang terbuka — sudah masuk rekap closing dan tidak bisa dibatalkan'"
            />
          </div>
        </button>
      </div>
    </Dialog>

    <!-- ══ Dialog: Detail Transaksi ══ -->
    <Dialog
      v-model:visible="showDetailDialog"
      modal
      :draggable="false"
      :style="{ width: '95vw', maxWidth: '520px' }"
      header="Detail Transaksi"
    >
      <template v-if="detailReceipt">
        <div class="detail-header">
          <div class="detail-header-icon"><i class="pi pi-receipt"></i></div>
          <div class="detail-header-info">
            <div class="detail-header-top">
              <span class="mono detail-header-no">{{ detailReceipt.RECEIPT_NO }}</span>
              <Tag v-if="detailReceipt.voided" value="Dibatalkan" severity="danger" style="font-size: 10px" />
              <Tag v-else-if="detailReceipt.partialVoid" value="Sebagian Dibatalkan" severity="warn" style="font-size: 10px" />
            </div>
            <span class="detail-header-meta">{{ formatDateTime(detailReceipt.TANGGAL) }} — Kasir {{ detailReceipt.IDUSER }}</span>
          </div>
        </div>

        <div class="detail-items">
          <div
            v-for="item in detailReceipt.items"
            :key="item.ID_DETAIL ?? item.BARCODE + '-' + item.SUB_BARCODE"
            class="detail-item-row"
            :class="{ 'detail-item-voided': item.voided }"
          >
            <div class="detail-item-main">
              <template v-if="item.isRacikanParent">
                <div class="detail-item-name">{{ item.NAMA }} <Tag value="Racikan" severity="help" style="font-size: 9px" /></div>
                <div class="detail-item-sub"
                  >{{ formatQty(item.QTY) }} bungkus x {{ formatRupiah(item.HARGA) }}<template v-if="item.SAT_RACIK">
                    ({{ item.SAT_RACIK }})</template
                  ><template v-if="item.REMARK_ITEM"> — {{ item.REMARK_ITEM }}</template> = {{ formatRupiah(item.TOTALAMOUNT) }}</div
                >
                <div v-for="bahan in item.bahan" :key="bahan.ID_DETAIL" class="detail-item-bahan">
                  - {{ bahan.NAMA }} ({{ formatQty(bahan.QTY) }})
                </div>
                <div v-if="racikanJasa(item) > 0" class="detail-item-bahan">
                  + Jasa racik {{ formatRupiah(racikanJasa(item)) }}
                </div>
              </template>
              <template v-else>
                <div class="detail-item-name">{{ item.NAMA }}</div>
                <div class="detail-item-sub"
                  >{{ formatQty(item.QTY) }} x {{ formatRupiah(item.HARGA) }}<span v-if="itemDiscount(item)" class="detail-item-disc">
                    (diskon {{ formatRupiah(itemDiscount(item).cut) }} / {{ itemDiscount(item).pct.toFixed(0) }}%)</span
                  >
                  = {{ formatRupiah(item.TOTALAMOUNT) }}</div
                >
              </template>
            </div>
            <div class="detail-item-side">
              <Tag v-if="item.voided" value="Batal" severity="danger" style="font-size: 10px" />
              <Button
                v-else-if="canVoid(detailReceipt)"
                icon="pi pi-times"
                severity="danger"
                text
                rounded
                size="small"
                v-tooltip.left="item.isRacikanParent ? 'Batalkan racikan ini (bahan ikut dibatalkan)' : 'Batalkan item ini'"
                :loading="voidingItemKey === detailReceipt.RECEIPT_NO + '-' + item.ID_DETAIL"
                @click="confirmVoidItem(detailReceipt, item)"
              />
            </div>
          </div>
        </div>

        <div class="detail-summary">
          <div class="detail-summary-row">
            <span>Total Awal</span>
            <span>{{ formatRupiah(detailReceipt.total) }}</span>
          </div>
          <div v-if="detailReceipt.potongan > 0" class="detail-summary-row">
            <span>Potongan Struk</span>
            <span>-{{ formatRupiah(detailReceipt.potongan) }}</span>
          </div>
          <div v-if="detailReceipt.total !== detailReceipt.sisaGrandTotal" class="detail-summary-row detail-summary-void">
            <span>Dibatalkan</span>
            <span>-{{ formatRupiah(detailReceipt.total - detailReceipt.sisaGrandTotal) }}</span>
          </div>
          <div class="detail-total">
            <span>{{ detailReceipt.voided ? 'Total (Dibatalkan)' : 'Sisa Tagihan' }}</span>
            <span>{{ formatRupiah(detailReceipt.displayTotal) }}</span>
          </div>
          <div class="detail-summary-row">
            <span>Bayar</span>
            <span>{{ formatRupiah(detailReceipt.totalBayar) }}</span>
          </div>
          <div class="detail-summary-row">
            <span>Kembalian</span>
            <span>{{ formatRupiah(detailReceipt.kembalian) }}</span>
          </div>
        </div>
      </template>

      <template #footer>
        <Button
          v-if="detailReceipt && !detailReceipt.voided && canVoid(detailReceipt)"
          label="Batalkan Semua"
          icon="pi pi-times-circle"
          severity="danger"
          text
          :loading="voidingReceipt === detailReceipt?.RECEIPT_NO"
          @click="confirmVoid(detailReceipt)"
        />
        <Button
          v-if="detailReceipt"
          label="Cetak Ulang Struk"
          icon="pi pi-print"
          severity="secondary"
          outlined
          @click="reprintStruk(detailReceipt)"
        />
        <Button label="Tutup" severity="secondary" text @click="showDetailDialog = false" />
      </template>
    </Dialog>

    <!-- ══ Dialog: Pilih Pendaftaran Klinik ══ -->
    <Dialog
      v-model:visible="showRegisterDialog"
      modal
      :draggable="false"
      :style="{ width: '95vw', maxWidth: '720px' }"
      header="Pilih Pendaftaran Klinik"
    >
      <div class="register-dialog-filter">
        <DatePicker
          v-model="registerDate"
          dateFormat="dd M yy"
          showIcon
          iconDisplay="input"
          class="register-date"
          @update:modelValue="fetchRegisterList"
        />
        <IconField class="flex-1">
          <InputIcon class="pi pi-search" />
          <InputText v-model="registerFilter" placeholder="Cari nama pasien / No RM / No Pendaftaran..." class="w-100" />
        </IconField>
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          text
          v-tooltip.bottom="'Muat ulang'"
          @click="fetchRegisterList"
        />
      </div>

      <div v-if="loadingRegister" class="state-box-sm">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Memuat pendaftaran...</span>
      </div>
      <div v-else-if="filteredRegisterList.length === 0" class="state-box-sm">
        <i class="pi pi-inbox"></i>
        <span>Tidak ada pendaftaran ditemukan untuk tanggal ini</span>
      </div>
      <div v-else class="register-list">
        <button
          v-for="row in filteredRegisterList"
          :key="row.NOPENDAFTARAN"
          type="button"
          class="register-row"
          @click="pickRegister(row)"
        >
          <div class="register-row-main">
            <span class="register-row-name"
              >{{ row.NAMAPASIEN }}<span v-if="row.JENISKELAMIN || row.USIA_PASIEN">
                ({{ row.JENISKELAMIN
                }}<span v-if="row.USIA_PASIEN">{{ row.JENISKELAMIN ? ', ' : '' }}{{ formatUsiaRegister(row.USIA_PASIEN) }}</span
                >)</span
              ></span
            >
            <span class="register-row-meta">No RM {{ row.NOMR }} · {{ row.POLI || '-' }} · {{ row.NAMADOKTER || '-' }}</span>
          </div>
          <div class="register-row-side">
            <Tag v-if="row.JENISRAWAT" :value="row.JENISRAWAT" severity="info" style="font-size: 10px" />
            <span class="register-row-no mono">{{ row.NOPENDAFTARAN }}</span>
          </div>
        </button>
      </div>
    </Dialog>

    <!-- ══ Dialog: Tambah Obat Racikan ══ -->
    <Dialog
      v-model:visible="showRacikanDialog"
      modal
      :draggable="false"
      :style="{ width: '95vw', maxWidth: '820px' }"
      :header="editingRacikanKey ? 'Edit Obat Racikan' : 'Tambah Obat Racikan'"
    >
      <div class="racikan-field racikan-field-full">
        <label class="dialog-label">Nama Racikan <span class="text-danger">*</span></label>
        <InputText v-model="racikanForm.NAMA" placeholder="mis. Puyer Batuk Anak" class="w-100" />
      </div>

      <div class="racikan-field-row">
        <div class="racikan-field">
          <label class="dialog-label">Jumlah Bungkus <span class="text-danger">*</span></label>
          <InputNumber v-model="racikanForm.JML_BUNGKUS" :min="1" class="w-100" placeholder="0" />
        </div>
        <div class="racikan-field racikan-bentuk-wrap">
          <label class="dialog-label">Bentuk <span class="text-danger">*</span></label>
          <InputText
            v-model="racikanForm.BENTUK"
            class="w-100"
            placeholder="Masukkan bentuk racikan"
            @focus="showBentukPicks = true"
            @blur="onBentukInputBlur"
          />
          <div v-if="showBentukPicks" class="racikan-bentuk-picks">
            <button
              v-for="opt in racikanBentukOptions"
              :key="opt"
              type="button"
              class="racikan-bentuk-pick"
              :class="{ active: racikanForm.BENTUK === opt }"
              @mousedown.prevent="selectBentukPick(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
        <div class="racikan-field racikan-field-grow">
          <label class="dialog-label">Cara Pakai</label>
          <InputText v-model="racikanForm.CARA_PAKAI" placeholder="mis. 3x sehari 1 bungkus" class="w-100" />
        </div>
        <div class="racikan-field">
          <label class="dialog-label">Jasa Racik</label>
          <InputNumber
            v-model="racikanForm.JASA_RACIK"
            mode="currency"
            currency="IDR"
            locale="id-ID"
            :maxFractionDigits="0"
            :min="0"
            class="w-100"
            placeholder="Rp 0"
          />
        </div>
      </div>

      <div class="racikan-bahan-section">
        <label class="dialog-label">Bahan Racikan <span class="text-danger">*</span></label>
        <small class="racikan-bahan-hint"
          >Isi "Dosis / Bungkus" = dosis per bungkus dari resep dokter (dtd). Qty otomatis = (dosis x jumlah bungkus) / kandungan
          barang — boleh pecahan (mis. 1,5 tablet), silakan disesuaikan manual kalau perlu.</small
        >
        <div class="racikan-bahan-search">
          <InputText
            v-model="racikanBahanQuery"
            placeholder="Cari nama bahan/obat..."
            class="flex-1"
            @keyup.enter="searchRacikanBahan"
          />
          <Button icon="pi pi-search" size="small" severity="secondary" :loading="loadingRacikanBahan" @click="searchRacikanBahan" />
        </div>

        <div v-if="racikanBahanResults.length" class="racikan-bahan-results">
          <button
            v-for="b in racikanBahanResults"
            :key="b.BARCODE"
            type="button"
            class="racikan-bahan-result-row"
            :disabled="!(b.batches || []).some((bt) => bt.QTY > 0)"
            @click="addBahan(b)"
          >
            <span>{{ b.NAMA }}</span>
            <span>{{ formatRupiah(b.batches?.[0]?.HARGAJUAL ?? b.batches?.[0]?.HARGA ?? 0) }}</span>
          </button>
        </div>

        <div v-if="racikanForm.bahan.length" class="racikan-bahan-table-wrap">
          <table class="racikan-bahan-table">
            <thead>
              <tr>
                <th>Nama Bahan</th>
                <th>Kandungan Barang</th>
                <th>Dosis / Bungkus (dtd)</th>
                <th style="text-align: center">Qty</th>
                <th style="text-align: right">Harga</th>
                <th style="text-align: right">Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, idx) in racikanForm.bahan" :key="idx">
                <td :title="b.NAMA">{{ b.NAMA }}</td>
                <td class="racikan-bahan-kandungan">
                  <div class="racikan-bahan-kandungan-inputs">
                    <InputNumber
                      v-model="b.KANDUNGAN"
                      :min="0"
                      :maxFractionDigits="2"
                      class="racikan-bahan-kandungan-num"
                      inputmode="decimal"
                      placeholder="mis. 500"
                      v-tooltip.top="!b.hasKandunganFromMaster ? 'Data BE belum ada, isi manual' : ''"
                      @update:modelValue="recalcBahanQty(b)"
                    />
                    <InputText v-model="b.SATUAN_KANDUNGAN" class="racikan-bahan-kandungan-sat" placeholder="mg" />
                  </div>
                </td>
                <td>
                  <InputNumber
                    v-model="b.DOSIS_RESEP"
                    :min="0"
                    :maxFractionDigits="2"
                    class="racikan-bahan-dosis"
                    inputmode="decimal"
                    :placeholder="`mis. 120 ${b.SATUAN_KANDUNGAN || 'mg'}`"
                    @update:modelValue="recalcBahanQty(b)"
                  />
                </td>
                <td style="text-align: center">
                  <InputNumber
                    v-model="b.QTY"
                    :min="0.01"
                    :maxFractionDigits="2"
                    class="racikan-bahan-qty"
                    :class="{ 'racikan-bahan-qty-over': bahanOverStock(b) }"
                    inputmode="decimal"
                  />
                  <div class="racikan-bahan-stok" :class="{ 'racikan-bahan-stok-over': bahanOverStock(b) }">
                    stok {{ availableStockForBahan(b) ?? '-' }} {{ b.SATUAN }}
                  </div>
                </td>
                <td class="racikan-bahan-harga">{{ formatRupiah(b.HARGA) }}</td>
                <td class="racikan-bahan-subtotal">{{ formatRupiah((b.QTY || 0) * b.HARGA) }}</td>
                <td>
                  <button type="button" class="racikan-bahan-remove" @click="racikanForm.bahan.splice(idx, 1)">
                    <i class="pi pi-times"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="racikan-bahan-empty">Belum ada bahan ditambahkan</div>
      </div>

      <div class="racikan-preview-total">
        <span>Preview Total <small>(estimasi, angka final dari server)</small></span>
        <span>{{ formatRupiah(racikanPreviewTotal) }}</span>
      </div>

      <template #footer>
        <Button label="Batal" severity="secondary" text @click="closeRacikanDialog" />
        <Button
          :label="editingRacikanKey ? 'Simpan Perubahan' : 'Tambahkan ke Keranjang'"
          icon="pi pi-check"
          :disabled="!canSubmitRacikan"
          @click="submitRacikan"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toolbar from 'primevue/toolbar'
import DatePicker from 'primevue/datepicker'
import CartPanel from './components/CartPanel.vue'
import { roundMoney, formatRupiah, formatQty, formatUsiaRegister } from './utils/format'
import { formatDateTime, formatTglExpiry, formatDateOnlyForAPI } from './utils/date'
import { lineTotal, itemDiscount, racikanJasa } from './utils/salesCalc'
import { groupReceiptsByReceiptNo } from './utils/receiptGrouping'
import { useShift } from './composables/useShift'
import { usePosSetting } from './composables/usePosSetting'
import { useVoidTransaction } from './composables/useVoidTransaction'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi, user_id, user_name } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const apiUrl = computed(() => `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`)

const expClass = (dateStr) => {
  if (!dateStr) return 'exp-none'
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  if (days < 0) return 'exp-kadaluarsa'
  if (days < 90) return 'exp-soon'
  return 'exp-ok'
}

/* ══════════ Responsive ══════════ */
const windowWidth = ref(window.innerWidth)
const onResize = () => {
  windowWidth.value = window.innerWidth
}
// Sidebar jadi drawer off-canvas di ≤991px (lihat SideBar.vue), jadi di rentang
// itu content-wrapper sudah dapat lebar penuh — iPad (portrait ±768-834px atau
// landscape) tetap cukup lega untuk tampilan kasir + keranjang berdampingan.
const isDesktop = computed(() => windowWidth.value >= 680)
const showMobileCart = ref(false)
watch(isDesktop, (val) => {
  if (val) showMobileCart.value = false
})

/* ══════════ Shift ══════════ */
const { shift, loadingShift, isShiftOpen, fetchShiftAktif } = useShift(
  apiUrl,
  { id_client, id_lokasi, user_id },
  { onError: () => toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat status shift', life: 4000 }) },
)
// Client non-shift (PAKAI_SHIFT=0) tidak pernah butuh shift terbuka untuk mulai transaksi.
const siapTransaksi = computed(() => !pakaiShift.value || isShiftOpen.value)

const showBukaShiftDialog = ref(false)
const modalAwal = ref(null)
const savingBukaShift = ref(false)
const openBukaShiftDialog = () => {
  modalAwal.value = null
  showBukaShiftDialog.value = true
}
const submitBukaShift = async () => {
  if (modalAwal.value == null || modalAwal.value < 0) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Modal awal wajib diisi', life: 3000 })
    return
  }
  savingBukaShift.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/buka_shift`, {
      IDCLIENT: Number(id_client.value),
      ID_LOKASI: Number(id_lokasi.value),
      IDUSER: user_id.value,
      MODAL_AWAL: modalAwal.value,
    })
    if (data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: data.metadata.message, life: 3000 })
      showBukaShiftDialog.value = false
      await fetchShiftAktif()
      focusSearch()
    } else {
      toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal membuka shift', life: 5000 })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.response?.data?.metadata?.message || 'Gagal membuka shift',
      life: 5000,
    })
  } finally {
    savingBukaShift.value = false
  }
}

const showTutupShiftDialog = ref(false)
const modalAkhir = ref(null)
const catatanTutup = ref('')
const savingTutupShift = ref(false)
const tutupShiftResult = ref(null)
const openTutupShiftDialog = () => {
  if (cart.value.length > 0) {
    toast.add({
      severity: 'warn',
      summary: 'Keranjang belum kosong',
      detail: 'Selesaikan atau kosongkan transaksi berjalan sebelum tutup shift',
      life: 4000,
    })
    return
  }
  modalAkhir.value = null
  catatanTutup.value = ''
  tutupShiftResult.value = null
  showTutupShiftDialog.value = true
}
const submitTutupShift = async () => {
  if (modalAkhir.value == null || modalAkhir.value < 0) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Kas fisik akhir wajib diisi', life: 3000 })
    return
  }
  savingTutupShift.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/tutup_shift`, {
      IDCLIENT: Number(id_client.value),
      ID_SHIFT: shift.value.ID,
      MODAL_AKHIR: modalAkhir.value,
      CATATAN: catatanTutup.value,
    })
    if (data?.metadata?.code === 200) {
      tutupShiftResult.value = data.response
      toast.add({ severity: 'success', summary: 'Shift Ditutup', detail: data.metadata.message, life: 3000 })
      openPrintStrukTab('tutup_shift', data.response)
    } else {
      toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal menutup shift', life: 5000 })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.response?.data?.metadata?.message || 'Gagal menutup shift',
      life: 5000,
    })
  } finally {
    savingTutupShift.value = false
  }
}
const closeTutupShiftDialog = () => {
  showTutupShiftDialog.value = false
  shift.value = null
  tutupShiftResult.value = null
}

/* ══════════ Pendaftaran klinik (opsional, dipilih sebelum belanja) ══════════ */
// Endpoint beda backend (simrs_v2_backend, bukan ws_posindo) — dipakai cuma
// untuk cari NOPENDAFTARAN yang nanti dikirim sebagai NO_REGISTER saat checkout.
const showRegisterDialog = ref(false)
const registerDate = ref(new Date())
const registerFilter = ref('')
const registerList = ref([])
const loadingRegister = ref(false)
const selectedRegister = ref(null)

const fetchRegisterList = async () => {
  loadingRegister.value = true
  try {
    const { data } = await axios.post(`${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`, {
      mod: 10,
      tglawal: formatDateOnlyForAPI(registerDate.value),
      id_client: Number(id_client.value),
    })
    registerList.value = data?.metadata?.code === 200 ? data.response || [] : []
  } catch {
    registerList.value = []
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat daftar pendaftaran', life: 4000 })
  } finally {
    loadingRegister.value = false
  }
}

const openRegisterDialog = () => {
  registerFilter.value = ''
  showRegisterDialog.value = true
  fetchRegisterList()
}

const filteredRegisterList = computed(() => {
  const q = registerFilter.value.trim().toLowerCase()
  if (!q) return registerList.value
  return registerList.value.filter((r) =>
    [r.NAMAPASIEN, r.NOMR, r.NOPENDAFTARAN, r.POLI, r.NAMADOKTER].some((v) => String(v || '').toLowerCase().includes(q)),
  )
})

const pickRegister = (row) => {
  selectedRegister.value = row
  showRegisterDialog.value = false
}
const clearRegister = () => {
  selectedRegister.value = null
}

/* ══════════ Pasien lama tanpa kunjungan aktif (opsional, cari nama di modal pembayaran) ══════════ */
// Dipakai saat pasien cuma beli di konter tanpa ada pendaftaran/kunjungan hari ini —
// kasir cari by nama atau no HP, ambil NOMR-nya, dikirim langsung sebagai field NOMR saat checkout.
const loadingPasienSearch = ref(false)
const pasienResults = ref([])
const selectedPasien = ref(null)

const searchPasien = async ({ searchby, param } = {}) => {
  const q = (param || '').trim()
  if (!q) return
  loadingPasienSearch.value = true
  pasienResults.value = []
  try {
    const { data } = await axios.get(`${configStore.apiBaseUrl}/index.php/api/data_referensi/pasien/${id_client.value}`, {
      params: { searchby: searchby || 'namapasien', param: q },
    })
    const results = Array.isArray(data) ? data : []
    if (results.length) {
      pasienResults.value = results
      if (results.length === 1) selectedPasien.value = results[0]
    } else {
      toast.add({ severity: 'warn', summary: 'Tidak Ditemukan', detail: 'Pasien tidak ditemukan', life: 3000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mencari pasien', life: 4000 })
  } finally {
    loadingPasienSearch.value = false
  }
}
const selectPasien = (p) => {
  selectedPasien.value = p
  pasienResults.value = []
}
const clearPasien = () => {
  selectedPasien.value = null
  pasienResults.value = []
}

/* ══════════ Pencarian barang ══════════ */
const viewMode = ref(localStorage.getItem('kasir_view_mode') || 'card')
watch(viewMode, (v) => localStorage.setItem('kasir_view_mode', v))

const searchInputRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const loadingSearch = ref(false)
const searchPage = ref(1)
const searchTotalPages = ref(1)
let searchDebounceTimer = null

const focusSearch = () => {
  nextTick(() => searchInputRef.value?.$el?.focus?.())
}

const fetchBarang = async ({ reset = true, autoAddSingle = false } = {}) => {
  if (reset) searchPage.value = 1
  loadingSearch.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/barang_list`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        search: searchQuery.value || undefined,
        page: searchPage.value,
        limit: 40,
      },
    })
    searchResults.value = data?.response ?? []
    searchTotalPages.value = data?.metadata?.pagination?.totalPages ?? 1
    // Hasil scan barcode: satu barang match → langsung masuk keranjang pakai batch pertama (FIFO)
    if (autoAddSingle && searchResults.value.length === 1 && searchResults.value[0].batches?.length) {
      addToCart(searchResults.value[0], searchResults.value[0].batches[0])
      searchQuery.value = ''
      searchResults.value = []
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat daftar barang', life: 4000 })
  } finally {
    loadingSearch.value = false
  }
}

const goPrevPage = () => {
  if (searchPage.value <= 1) return
  searchPage.value -= 1
  fetchBarang({ reset: false })
}
const goNextPage = () => {
  if (searchPage.value >= searchTotalPages.value) return
  searchPage.value += 1
  fetchBarang({ reset: false })
}

watch(searchQuery, (val) => {
  clearTimeout(searchDebounceTimer)
  if (!val) {
    searchResults.value = []
    return
  }
  searchDebounceTimer = setTimeout(() => fetchBarang({ reset: true }), 350)
})

const onSearchEnter = () => {
  clearTimeout(searchDebounceTimer)
  if (searchQuery.value?.trim()) fetchBarang({ reset: true, autoAddSingle: true })
}

/* ══════════ Hasil pencarian per-batch ══════════ */
// Satu kartu per batch — barang multi-batch tampil semua batchnya sekaligus
const flatResults = computed(() =>
  searchResults.value.flatMap((barang) => {
    const batches = barang.batches?.length ? barang.batches : [null]
    return batches.map((batch, idx) => ({
      barang,
      batch,
      key: `${barang.BARCODE}-${batch?.SUB_BARCODE ?? idx}`,
      multiBatch: (barang.batches?.length ?? 0) > 1,
    }))
  }),
)

/* ══════════ Satuan (konversi kecil/sedang/besar) ══════════ */
// Mengikuti konvensi master barang: SATUAN_KECIL/SEDANG/BESAR +
// ISI_SEDANG_KE_KECIL / ISI_BESAR_KE_SEDANG (lihat BarangFormView.vue, PenerimaanFormView.vue)
const satuanList = (barang) => [barang.SATUAN_KECIL, barang.SATUAN_SEDANG, barang.SATUAN_BESAR].filter(Boolean)

const faktorSatuan = (barang, satuan) => {
  if (!satuan) return 1
  if (satuan === barang.SATUAN_KECIL) return 1
  if (satuan === barang.SATUAN_SEDANG) return Number(barang.ISI_SEDANG_KE_KECIL) || 1
  if (satuan === barang.SATUAN_BESAR) {
    return (Number(barang.ISI_SEDANG_KE_KECIL) || 1) * (Number(barang.ISI_BESAR_KE_SEDANG) || 1)
  }
  return 1
}

/* ══════════ Pengaturan POS (izin diskon, pakai shift) ══════════ */
const { izinkanDiskonItem, izinkanDiskonBill, pakaiShift, izinkanPiutang, loadingPosSetting, fetchPosSetting } = usePosSetting(apiUrl, { id_client })

/* ══════════ Keranjang ══════════ */
const cart = ref([])
// Trigger efek visual di CartPanel & mobile-cart-bar tiap ada barang masuk keranjang
const cartPulseKey = ref(0)
const lastAddedKey = ref(null)
const mobileCartPulse = ref(false)
watch(cartPulseKey, () => {
  mobileCartPulse.value = false
  nextTick(() => {
    mobileCartPulse.value = true
    setTimeout(() => (mobileCartPulse.value = false), 400)
  })
})

// Stok yang sudah "dipakai" di keranjang buat barcode+sub_barcode ini — gabungan barang biasa
// DAN bahan racikan (yang sudah masuk cart maupun draft racikan yang lagi diisi di modal).
// Dipakai biar validasi stok belanja biasa & racikan sinkron, nggak dicek terpisah-pisah.
const reservedQtyForBarcode = (barcode, subBarcode, { excludeCartItem, excludeDraftBahan } = {}) => {
  let total = 0
  for (const item of cart.value) {
    if (item === excludeCartItem) continue
    // Racikan yang lagi diedit di modal jangan dihitung — bahannya sudah kehitung
    // lewat draft racikanForm di bawah, kalau ikut kehitung jadi dobel.
    if (item.IS_RACIKAN && item.RACIKAN_KEY === editingRacikanKey.value) continue
    if (item.IS_RACIKAN) {
      for (const b of item.bahan || []) {
        if (b.BARCODE === barcode && b.SUB_BARCODE === subBarcode) total += Number(b.QTY) || 0
      }
    } else if (item.BARCODE === barcode && item.SUB_BARCODE === subBarcode) {
      total += Number(item.QTY) || 0
    }
  }
  for (const b of racikanForm.value.bahan) {
    if (b === excludeDraftBahan) continue
    if (b.BARCODE === barcode && b.SUB_BARCODE === subBarcode) total += Number(b.QTY) || 0
  }
  return total
}

// Sisa stok (satuan kecil/base) barang di keranjang setelah dikurangi pemakaian racikan & baris lain.
const availableForItem = (item) => {
  const reserved = reservedQtyForBarcode(item.BARCODE, item.SUB_BARCODE, { excludeCartItem: item })
  const availableKecil = Math.max(item.STOK_KECIL_MAX - reserved, 0)
  return Math.floor(availableKecil / item.FAKTOR)
}

const addToCart = (barang, batch) => {
  if (!batch || batch.QTY <= 0) return
  const hargaKecil = Number(batch.HARGAJUAL ?? batch.HARGA ?? 0)
  if (hargaKecil <= 0) {
    toast.add({
      severity: 'warn',
      summary: 'Harga Jual Belum Diatur',
      detail: `Harga jual ${barang.NAMA} masih Rp 0, tidak bisa dimasukkan ke keranjang`,
      life: 3500,
    })
    return
  }
  const satuanAwal = barang.SATUAN_KECIL || ''
  const existing = cart.value.find((i) => !i.IS_RACIKAN && i.BARCODE === batch.BARCODE && i.SUB_BARCODE === batch.SUB_BARCODE)
  const reserved = reservedQtyForBarcode(batch.BARCODE, batch.SUB_BARCODE, { excludeCartItem: existing })
  const availableKecil = Number(batch.QTY) - reserved
  if (existing) {
    if ((existing.QTY + 1) * existing.FAKTOR > availableKecil) {
      const maxInSatuan = Math.floor(availableKecil / existing.FAKTOR)
      toast.add({
        severity: 'warn',
        summary: 'Stok Tidak Cukup',
        detail: `Stok tersedia hanya ${maxInSatuan} ${existing.SATUAN} (sebagian sudah dipakai racikan)`,
        life: 3500,
      })
      return
    }
    existing.QTY += 1
  } else {
    if (availableKecil < 1) {
      toast.add({
        severity: 'warn',
        summary: 'Stok Tidak Cukup',
        detail: `Stok ${barang.NAMA} sudah habis dipakai (termasuk racikan)`,
        life: 3500,
      })
      return
    }
    const satuanOptions = satuanList(barang).map((label) => ({
      label,
      value: label,
      faktor: faktorSatuan(barang, label),
    }))
    cart.value.push({
      BARCODE: batch.BARCODE,
      SUB_BARCODE: batch.SUB_BARCODE,
      NAMA: barang.NAMA,
      MEREK: barang.MEREK || '',
      JENIS: barang.KATEGORI || '',
      QTY: 1,
      HARGA: hargaKecil,
      HARGA_KECIL: hargaKecil,
      HARGABELI: Number(batch.HARGA ?? 0),
      DISCOUNT: 0,
      DISCOUNT_TYPE: 'PERSEN',
      SATUAN: satuanAwal,
      FAKTOR: 1,
      SATUAN_OPTIONS: satuanOptions,
      STOK_KECIL_MAX: batch.QTY,
      TGL_EXPIRED: batch.TGL_EXPIRED,
    })
  }
  // Feedback nambah ke keranjang pakai efek visual di panel keranjang (bukan toast)
  lastAddedKey.value = `${batch.BARCODE}-${batch.SUB_BARCODE}`
  cartPulseKey.value += 1
  focusSearch()
}

/* ══════════ Obat Racikan ══════════ */
// Racikan masuk keranjang sebagai 1 item (bukan per-bahan) — bahan-nya cuma dikirim
// utuh ke backend saat checkout lewat field `racikan`, bukan digabung ke `details`.
const showRacikanDialog = ref(false)
const racikanBentukOptions = ['PUYER', 'KAPSUL', 'SALEP', 'SIRUP', 'KRIM', 'PASTA', 'SUPPOSITORIA']
const showBentukPicks = ref(false)
const selectBentukPick = (opt) => {
  racikanForm.value.BENTUK = opt
  showBentukPicks.value = false
}
const onBentukInputBlur = () => {
  showBentukPicks.value = false
}
const emptyRacikanForm = () => ({ NAMA: '', JML_BUNGKUS: null, BENTUK: 'PUYER', CARA_PAKAI: '', JASA_RACIK: 0, bahan: [] })
const racikanForm = ref(emptyRacikanForm())
const racikanBahanQuery = ref('')
const racikanBahanResults = ref([])
const loadingRacikanBahan = ref(false)
// RACIKAN_KEY racikan di keranjang yang sedang diedit di modal; null = mode tambah baru
const editingRacikanKey = ref(null)

const openRacikanDialog = () => {
  racikanForm.value = emptyRacikanForm()
  racikanBahanQuery.value = ''
  racikanBahanResults.value = []
  editingRacikanKey.value = null
  showRacikanDialog.value = true
}
// Edit racikan yang sudah masuk keranjang: form diisi salinan datanya (deep copy bahan
// biar batal edit nggak ngubah item keranjang), disimpan lagi lewat submitRacikan.
const openRacikanEdit = (item) => {
  racikanForm.value = {
    NAMA: item.NAMA,
    JML_BUNGKUS: item.JML_BUNGKUS,
    BENTUK: item.BENTUK,
    CARA_PAKAI: item.CARA_PAKAI || '',
    JASA_RACIK: item.JASA_RACIK || 0,
    bahan: (item.bahan || []).map((b) => ({ ...b })),
  }
  racikanBahanQuery.value = ''
  racikanBahanResults.value = []
  editingRacikanKey.value = item.RACIKAN_KEY
  showRacikanDialog.value = true
}
const closeRacikanDialog = () => {
  showRacikanDialog.value = false
}
// Reset saat dialog tertutup lewat jalur mana pun (batal, X, maupun sesudah submit) —
// draft bahan ikut kehitung di reservedQtyForBarcode, jadi form nggak boleh nyisa.
watch(showRacikanDialog, (open) => {
  if (!open) {
    racikanForm.value = emptyRacikanForm()
    racikanBahanQuery.value = ''
    racikanBahanResults.value = []
    editingRacikanKey.value = null
  }
})

const searchRacikanBahan = async () => {
  const q = racikanBahanQuery.value.trim()
  if (!q) return
  loadingRacikanBahan.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/barang_list`, {
      params: { clientId: id_client.value, lokasiId: id_lokasi.value, search: q, page: 1, limit: 20 },
    })
    racikanBahanResults.value = data?.response ?? []
    if (!racikanBahanResults.value.length) {
      toast.add({ severity: 'warn', summary: 'Tidak Ditemukan', detail: 'Bahan tidak ditemukan', life: 2500 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mencari bahan', life: 3000 })
  } finally {
    loadingRacikanBahan.value = false
  }
}

const addBahan = (barang) => {
  const batch = (barang.batches || []).find((b) => b.QTY > 0)
  if (!batch) {
    toast.add({ severity: 'warn', summary: 'Stok Habis', detail: `${barang.NAMA} sedang tidak tersedia`, life: 3000 })
    return
  }
  const reserved = reservedQtyForBarcode(batch.BARCODE, batch.SUB_BARCODE)
  if (Number(batch.QTY) - reserved < 1) {
    toast.add({
      severity: 'warn',
      summary: 'Stok Tidak Cukup',
      detail: `Stok ${barang.NAMA} sudah habis dipakai di keranjang/racikan lain`,
      life: 3500,
    })
    return
  }
  racikanForm.value.bahan.push({
    BARCODE: batch.BARCODE,
    SUB_BARCODE: batch.SUB_BARCODE,
    NAMA: barang.NAMA,
    HARGA: Number(batch.HARGAJUAL ?? batch.HARGA ?? 0),
    HARGABELI: Number(batch.HARGA ?? 0),
    QTY: 1,
    SATUAN: barang.SATUAN_KECIL || 'unit',
    STOK_MAX: Number(batch.QTY) || 0,
    KANDUNGAN: barang.KANDUNGAN != null ? Number(barang.KANDUNGAN) : null,
    SATUAN_KANDUNGAN: barang.SATUAN_KANDUNGAN || '',
    hasKandunganFromMaster: barang.KANDUNGAN != null,
    DOSIS_RESEP: null,
  })
  racikanBahanQuery.value = ''
  racikanBahanResults.value = []
}

// Bantu apoteker hitung QTY dari dosis per-bungkus yang diresepkan dokter ("dtd" — da tales
// doses): total kandungan dibutuhkan = dosis per bungkus x jumlah bungkus, dibagi kandungan
// per unit barang. Nggak dibulatkan ke atas — tablet boleh kepakai pecahan (mis. 1,5 tablet).
const recalcBahanQty = (bahan) => {
  const kandungan = Number(bahan.KANDUNGAN) || 0
  const dosis = Number(bahan.DOSIS_RESEP) || 0
  const jmlBungkus = Number(racikanForm.value.JML_BUNGKUS) || 0
  if (kandungan > 0 && dosis > 0 && jmlBungkus > 0) {
    bahan.QTY = Math.round(((dosis * jmlBungkus) / kandungan) * 100) / 100
  }
}

const recalcAllBahanQty = () => {
  for (const b of racikanForm.value.bahan) {
    if (b.KANDUNGAN && b.DOSIS_RESEP) recalcBahanQty(b)
  }
}
watch(() => racikanForm.value.JML_BUNGKUS, recalcAllBahanQty)

const racikanPreviewTotal = computed(() => {
  const bahanTotal = racikanForm.value.bahan.reduce((s, b) => s + (Number(b.QTY) || 0) * (Number(b.HARGA) || 0), 0)
  return bahanTotal + (Number(racikanForm.value.JASA_RACIK) || 0)
})

// Sisa stok bahan setelah dikurangi pemakaian barang biasa + bahan racikan lain di keranjang
// (dan bahan lain di draft yang sama) — biar validasi stok sinkron sama belanja biasa.
const availableStockForBahan = (bahan) => {
  if (bahan.STOK_MAX == null) return null
  const reserved = reservedQtyForBarcode(bahan.BARCODE, bahan.SUB_BARCODE, { excludeDraftBahan: bahan })
  return Math.max(Number(bahan.STOK_MAX) - reserved, 0)
}
const bahanOverStock = (bahan) => {
  const available = availableStockForBahan(bahan)
  return available != null && Number(bahan.QTY) > available
}

const canSubmitRacikan = computed(
  () =>
    racikanForm.value.NAMA.trim().length > 0 &&
    Number(racikanForm.value.JML_BUNGKUS) > 0 &&
    !!racikanForm.value.BENTUK &&
    racikanForm.value.bahan.length > 0 &&
    !racikanForm.value.bahan.some(bahanOverStock),
)

const submitRacikan = () => {
  if (!canSubmitRacikan.value) return
  const racikanKey = editingRacikanKey.value || `racikan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const item = {
    IS_RACIKAN: true,
    RACIKAN_KEY: racikanKey,
    NAMA: racikanForm.value.NAMA.trim(),
    JML_BUNGKUS: Number(racikanForm.value.JML_BUNGKUS),
    BENTUK: racikanForm.value.BENTUK,
    CARA_PAKAI: racikanForm.value.CARA_PAKAI.trim(),
    JASA_RACIK: Number(racikanForm.value.JASA_RACIK) || 0,
    bahan: racikanForm.value.bahan.map((b) => ({ ...b })),
  }
  const existingIdx = cart.value.findIndex((i) => i.IS_RACIKAN && i.RACIKAN_KEY === racikanKey)
  if (existingIdx !== -1) cart.value.splice(existingIdx, 1, item)
  else cart.value.push(item)
  lastAddedKey.value = racikanKey
  cartPulseKey.value += 1
  closeRacikanDialog()
  focusSearch()
}

const changeSatuan = (item, newSatuan) => {
  const opt = item.SATUAN_OPTIONS?.find((o) => o.value === newSatuan)
  if (!opt || opt.value === item.SATUAN) return
  const reserved = reservedQtyForBarcode(item.BARCODE, item.SUB_BARCODE, { excludeCartItem: item })
  const newMax = Math.floor((item.STOK_KECIL_MAX - reserved) / opt.faktor)
  if (newMax <= 0) {
    toast.add({
      severity: 'warn',
      summary: 'Stok Tidak Cukup',
      detail: `Stok tidak cukup untuk satuan ${newSatuan} (sebagian sudah dipakai racikan)`,
      life: 3500,
    })
    return
  }
  item.SATUAN = opt.value
  item.FAKTOR = opt.faktor
  item.HARGA = Math.round(item.HARGA_KECIL * opt.faktor)
  if (item.QTY > newMax) item.QTY = newMax
}

const incQty = (item) => {
  const max = availableForItem(item)
  if (item.QTY + 1 > max) {
    toast.add({
      severity: 'warn',
      summary: 'Stok Tidak Cukup',
      detail: `Maks ${max} ${item.SATUAN} (sisa stok setelah dipakai racikan)`,
      life: 3000,
    })
    return
  }
  item.QTY += 1
}
const decQty = (item) => {
  if (item.QTY <= 1) return
  // Qty pecahan: 1.5 - 1 = 0.5 kebablasan di bawah minimum, jadi mentok di 1
  item.QTY = Math.max(Math.round((item.QTY - 1) * 100) / 100, 1)
}
const setQty = (item, val) => {
  // Qty pecahan diperbolehkan (mis. 1.5 BOX), dibulatkan ke 2 desimal
  let q = Math.round((Number(val) || 1) * 100) / 100
  if (q <= 0) q = 1
  const max = availableForItem(item)
  if (q > max) {
    q = max
    toast.add({
      severity: 'warn',
      summary: 'Stok Tidak Cukup',
      detail: `Maks ${max} ${item.SATUAN} (sisa stok setelah dipakai racikan)`,
      life: 3000,
    })
  }
  item.QTY = q
}
// Kunci unik per baris keranjang — racikan nggak punya BARCODE, jadi pakai RACIKAN_KEY-nya sendiri.
const cartItemKey = (item) => (item.IS_RACIKAN ? item.RACIKAN_KEY : `${item.BARCODE}-${item.SUB_BARCODE}`)

const removeItem = (item) => {
  const key = cartItemKey(item)
  cart.value = cart.value.filter((i) => cartItemKey(i) !== key)
}

const setDiscount = (item, { value, type }) => {
  item.DISCOUNT = Number(value) || 0
  item.DISCOUNT_TYPE = type || 'PERSEN'
}

const potongan = ref(0)
const totalBayar = ref(null)
const idPayment = ref(1)
const note = ref('')

const clearCart = () => {
  cart.value = []
  potongan.value = 0
  note.value = ''
  totalBayar.value = null
  idPayment.value = 1
  clearRegister()
  clearPasien()
}

// lineTotal per baris sudah dibulatkan BE-style (round half up), jadi cartSubtotal & grandTotal
// otomatis bulat juga — sama persis dengan GRANDTOTAL yang nanti dibalas BE saat checkout.
const cartSubtotal = computed(() => cart.value.reduce((s, i) => s + lineTotal(i), 0))
const grandTotal = computed(() => Math.max(cartSubtotal.value - (potongan.value || 0), 0))
const kembalian = computed(() => (totalBayar.value || 0) - grandTotal.value)

watch([idPayment, grandTotal], ([mode, gt]) => {
  if (mode === 2) totalBayar.value = gt
  else if (mode === 3) totalBayar.value = 0
})

/* ══════════ Checkout ══════════ */
const checkingOut = ref(false)

// Struk (penjualan maupun tutup shift) dibuat di tab baru lewat PrintStrukView, bukan print-preview
// di halaman ini — data dikirim lewat sessionStorage karena sudah lengkap di tangan FE begitu
// transaksi/tutup-shift sukses, jadi tab baru tidak perlu fetch API lagi untuk menampilkannya.
const openPrintStrukTab = (type, data) => {
  sessionStorage.setItem('strukPrintPayload', JSON.stringify({ type, data }))
  window.open(router.resolve({ name: 'PrintStruk' }).href, '_blank')
}

const canCheckout = computed(() => {
  if (!siapTransaksi.value || cart.value.length === 0) return false
  // Piutang: belum ada uang diterima, syaratnya pasien wajib terhubung (bukan total bayar cukup)
  if (idPayment.value === 3) return !!(selectedRegister.value || selectedPasien.value)
  return (totalBayar.value || 0) >= grandTotal.value
})

const doCheckout = async () => {
  if (!canCheckout.value) {
    const detail =
      idPayment.value === 3
        ? 'Piutang wajib terhubung ke pasien — pilih kunjungan aktif atau cari pasien dulu'
        : 'Periksa kembali keranjang dan total bayar'
    toast.add({ severity: 'warn', summary: 'Belum Bisa Checkout', detail, life: 3000 })
    return
  }
  checkingOut.value = true
  try {
    const payload = {
      IDCLIENT: Number(id_client.value),
      ID_LOKASI: Number(id_lokasi.value),
      IDUSER: user_id.value,
      ID_SHIFT: pakaiShift.value ? shift.value.ID : null,
      IDPAYEMENT: idPayment.value,
      TOTALBAYAR: totalBayar.value,
      POTONGAN: potongan.value || 0,
      NOTE: note.value || '',
      NO_REGISTER: selectedRegister.value?.NOPENDAFTARAN || null,
      NOMR: selectedRegister.value?.NOMR || selectedPasien.value?.NOMR || null,
      details: cart.value
        .filter((i) => !i.IS_RACIKAN)
        .map((i) => ({
          BARCODE: i.BARCODE,
          SUB_BARCODE: i.SUB_BARCODE,
          NAMA: i.NAMA,
          MEREK: i.MEREK,
          JENIS: i.JENIS,
          SATUAN: i.SATUAN,
          QTY: i.QTY,
          HARGA: i.HARGA,
          HARGABELI: i.HARGABELI || 0,
          DISCOUNT: i.DISCOUNT || 0,
          DISCOUNT_TYPE: i.DISCOUNT_TYPE || 'PERSEN',
        })),
      racikan: cart.value
        .filter((i) => i.IS_RACIKAN)
        .map((r) => ({
          NAMA: (r.NAMA || '').toUpperCase(),
          JML_BUNGKUS: r.JML_BUNGKUS,
          BENTUK: (r.BENTUK || '').toUpperCase(),
          CARA_PAKAI: (r.CARA_PAKAI || '').toUpperCase(),
          JASA_RACIK: r.JASA_RACIK || 0,
          bahan: r.bahan.map((b) => ({
            BARCODE: b.BARCODE,
            SUB_BARCODE: b.SUB_BARCODE,
            NAMA: (b.NAMA || '').toUpperCase(),
            QTY: b.QTY,
            HARGA: b.HARGA,
            HARGABELI: b.HARGABELI || 0,
          })),
        })),
    }
    const { data } = await axios.post(`${apiUrl.value}/checkout`, payload)
    if (data?.metadata?.code === 200) {
      openPrintStrukTab('penjualan', {
        ...data.response,
        items: cart.value.map((i) => ({ ...i })),
        POTONGAN: potongan.value || 0,
        IDPAYEMENT: idPayment.value,
        WAKTU: new Date(),
        KASIR: user_name.value,
        // Prioritaskan pasien dari pendaftaran aktif; kalau tidak ada, pakai hasil cari-nama
        PASIEN: selectedRegister.value
          ? { NAMA: selectedRegister.value.NAMAPASIEN, INFO: selectedRegister.value.NOPENDAFTARAN }
          : selectedPasien.value
            ? { NAMA: selectedPasien.value.NAMAPASIEN, INFO: `No RM ${selectedPasien.value.NOMR}` }
            : null,
      })
      toast.add({ severity: 'success', summary: 'Transaksi Berhasil', detail: `No. Struk ${data.response.RECEIPT_NO}`, life: 3000 })
      clearCart()
      showMobileCart.value = false
      fetchRecentSales()
      nextTick(() => focusSearch())
    } else {
      toast.add({ severity: 'error', summary: 'Ditolak', detail: data?.metadata?.message || 'Checkout gagal', life: 5000 })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.response?.data?.metadata?.message || 'Checkout gagal',
      life: 5000,
    })
  } finally {
    checkingOut.value = false
  }
}

/* ══════════ Recent sales & Void ══════════ */
const showRecentDialog = ref(false)
const recentSales = ref([])
const loadingRecent = ref(false)

const fetchRecentSales = async () => {
  loadingRecent.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/recent_sales`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        limit: 50,
        idShift: pakaiShift.value && isShiftOpen.value ? shift.value?.ID : undefined,
      },
    })
    recentSales.value = data?.response ?? []
  } catch {
    // silent — panel riwayat bukan alur kritikal
  } finally {
    loadingRecent.value = false
  }
}

const recentReceipts = computed(() => groupReceiptsByReceiptNo(recentSales.value))

const openRecentDialog = () => {
  showRecentDialog.value = true
  fetchRecentSales()
}

const showDetailDialog = ref(false)
const detailReceipt = ref(null)
const openDetail = (receipt) => {
  detailReceipt.value = receipt
  showDetailDialog.value = true
}

// Cetak ulang dari riwayat: susun ulang shape item racikan/biasa ke format yang dipakai
// PrintStrukView (sama seperti struk asli), dari data recent_sales yang sudah di-grup di FE.
// PASIEN tidak ikut disimpan di t_trans_penjualan, jadi struk cetak ulang tidak menampilkan baris pasien.
const reprintStruk = (receipt) => {
  const items = receipt.items.map((item) =>
    item.isRacikanParent
      ? {
          IS_RACIKAN: true,
          RACIKAN_KEY: `racikan-${item.ID_DETAIL}`,
          NAMA: item.NAMA,
          BENTUK: item.SAT_RACIK || '',
          JML_BUNGKUS: Number(item.QTY) || 0,
          CARA_PAKAI: item.REMARK_ITEM || '',
          JASA_RACIK: racikanJasa(item),
          bahan: (item.bahan || []).map((b) => ({ NAMA: b.NAMA, QTY: Number(b.QTY) || 0, HARGA: Number(b.HARGA) || 0 })),
        }
      : {
          IS_RACIKAN: false,
          BARCODE: item.BARCODE,
          SUB_BARCODE: item.SUB_BARCODE,
          NAMA: item.NAMA,
          QTY: Number(item.QTY) || 0,
          SATUAN: item.SATUAN || '',
          HARGA: Number(item.HARGA) || 0,
          DISCOUNT: Number(item.DISCOUNT) || 0,
          DISCOUNT_TYPE: item.DISKON_TYPE || 'PERSEN',
        },
  )
  openPrintStrukTab('penjualan', {
    RECEIPT_NO: receipt.RECEIPT_NO,
    WAKTU: receipt.TANGGAL,
    KASIR: receipt.IDUSER,
    PASIEN: null,
    items,
    GRANDTOTAL: receipt.displayTotal,
    POTONGAN: receipt.potongan,
    TOTALBAYAR: receipt.totalBayar,
    KEMBALIAN: receipt.kembalian,
    IDPAYEMENT: receipt.idPayement,
  })
}
// Setelah refetch, detailReceipt masih nunjuk objek lama (recentReceipts bikin objek baru
// tiap komputasi) -> sinkronkan biar dialog detail yang lagi kebuka ikut update statusnya.
const resyncDetailReceipt = () => {
  if (!detailReceipt.value) return
  detailReceipt.value = recentReceipts.value.find((r) => r.RECEIPT_NO === detailReceipt.value.RECEIPT_NO) || null
}

const { canVoid, voidingReceipt, confirmVoid, confirmVoidItem, voidingItemKey } = useVoidTransaction(apiUrl, {
  id_client,
  pakaiShift,
  isShiftOpen,
  shift,
  toast,
  confirm,
  onVoided: async () => {
    await fetchRecentSales()
    resyncDetailReceipt()
  },
})

/* ══════════ Lifecycle ══════════ */
onMounted(() => {
  window.addEventListener('resize', onResize)
  fetchShiftAktif()
  fetchRecentSales()
  fetchPosSetting()
  focusSearch()
})
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.pos-page {
  display: flex;
  flex-direction: column;
}

.pos-toolbar {
  border-radius: 10px;
}

.pos-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pos-title-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--p-primary-50, #f2f8f6);
  color: var(--p-primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.pos-title-main {
  font-weight: 800;
  font-size: 15px;
  line-height: 1.2;
}

.pos-title-sub {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
}

.pos-toolbar-end {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  background: var(--p-surface-0, #fff);
  border-radius: 12px;
  border: 1px solid var(--p-content-border-color, #eee);
}

.state-title {
  font-size: 16px;
  font-weight: 700;
  margin-top: 10px;
}

.state-sub {
  font-size: 13px;
  color: var(--p-text-muted-color);
  margin-top: 4px;
}

.state-box-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 10px;
  color: var(--p-text-muted-color);
  font-size: 13px;
  text-align: center;
}

.state-box-sm i {
  font-size: 1.8rem;
  opacity: 0.4;
}

/* ── Workspace ala aplikasi kasir: tinggi terkunci ke viewport,
   daftar barang & keranjang scroll di dalam panelnya masing-masing,
   tombol bayar selalu terlihat ── */
.pos-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(330px, 34vw, 430px);
  gap: 12px;
  align-items: stretch;
  /* 100dvh - navbar - toolbar kasir - margin/footer strip */
  height: calc(100dvh - 158px);
  min-height: 420px;
}

.pos-grid-mobile {
  grid-template-columns: 1fr;
  height: auto;
  min-height: 0;
}

.pos-panel {
  background: var(--p-surface-0, #fff);
  border-radius: 12px;
  border: 1px solid var(--p-content-border-color, #eee);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pos-panel-produk {
  padding: 12px;
  gap: 10px;
}

.pos-panel-cart :deep(.cart-panel) {
  height: 100%;
  min-height: 0;
}

.produk-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.produk-search :deep(input) {
  height: 42px;
  font-size: 14px;
}

.flex-1 {
  flex: 1;
}

.view-mode-toggle {
  display: flex;
  border: 1px solid var(--p-content-border-color, #d1d5db);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.view-mode-btn {
  width: 40px;
  height: 42px;
  border: none;
  background: var(--p-surface-0, #fff);
  color: var(--p-text-muted-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.view-mode-btn:not(:last-child) {
  border-right: 1px solid var(--p-content-border-color, #d1d5db);
}

.view-mode-btn.active {
  background: var(--p-primary-50, #f2f8f6);
  color: var(--p-primary-color);
}

.produk-grid-wrap {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* Mobile: kembali ke alur scroll halaman biasa */
.pos-grid-mobile .produk-grid-wrap {
  max-height: 62dvh;
}

.produk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 8px;
  padding: 2px 2px 10px;
}

.produk-card {
  text-align: left;
  border: 1px solid var(--p-content-border-color, #e8e8e4);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--p-surface-0, #fff);
  cursor: pointer;
  min-height: 88px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.1s;
}

.produk-card:hover:not(:disabled) {
  border-color: var(--p-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transform: translateY(-1px);
}

.produk-card:active:not(:disabled) {
  transform: translateY(0);
}

.produk-card:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.produk-nama {
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.produk-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  font-size: 10.5px;
  color: var(--p-text-muted-color);
  min-height: 15px;
}

.produk-batch {
  background: var(--p-primary-50, #f2f8f6);
  color: var(--p-primary-700, #345f50);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.produk-bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  margin-top: auto;
}

.produk-harga {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--p-primary-color);
}

.produk-stok {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.produk-stok-habis {
  color: var(--p-red-500, #ef4444);
  font-weight: 700;
}

.produk-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  padding: 6px 0 2px;
}

/* ══════════ Produk: mode tabel ══════════ */
.produk-table-wrap {
  overflow-x: auto;
}

.produk-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 12px;
}

.produk-table td,
.produk-table th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.produk-table thead th {
  position: sticky;
  top: 0;
  text-align: left;
  font-size: 10.5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  background: var(--p-surface-50, #f8fafc);
  padding: 5px 6px;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
  white-space: nowrap;
}

.produk-table tbody tr {
  cursor: pointer;
}

.produk-table tbody tr:hover {
  background: var(--p-primary-50, #f2f8f6);
}

.produk-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid var(--p-content-border-color, #f1f1ee);
}

.produk-table-row-habis {
  opacity: 0.5;
  cursor: not-allowed !important;
}

.produk-table-row-habis:hover {
  background: transparent !important;
}

.produk-table td {
  padding: 4px 6px;
  vertical-align: middle;
}

.produk-table-nama {
  font-weight: 600;
}

.produk-table-harga {
  text-align: right;
  font-weight: 700;
  color: var(--p-primary-color);
  white-space: nowrap;
}

.produk-table-add-btn {
  width: 26px;
  height: 26px;
}

.mobile-cart-bar {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  min-height: 54px;
  background: var(--p-primary-color);
  color: #fff;
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.mobile-cart-bar-pulse {
  animation: mobile-cart-bounce 0.4s ease;
}

@keyframes mobile-cart-bounce {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.mobile-cart-total {
  margin-left: auto;
}

.dialog-form {
  display: flex;
  flex-direction: column;
}

.dialog-label {
  font-size: 12.5px;
  font-weight: 700;
  margin-bottom: 6px;
  display: block;
}

.dialog-hint {
  color: var(--p-text-muted-color);
  margin-top: 6px;
  display: block;
}

.text-danger {
  color: var(--p-red-500, #ef4444);
}

/* ══════════ Obat Racikan ══════════ */
.racikan-field-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.racikan-field {
  min-width: 120px;
  flex: 1;
}

.racikan-field-full {
  margin-bottom: 14px;
}

.racikan-field-grow {
  flex: 1.6;
  min-width: 170px;
}

.racikan-bentuk-wrap {
  position: relative;
}

.racikan-bentuk-picks {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #d1d5db);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.racikan-bentuk-pick {
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 5px;
  border: 1px solid var(--p-content-border-color, #d1d5db);
  background: var(--p-content-background, #fff);
  color: var(--p-text-color, #374151);
  cursor: pointer;
  transition: all 0.15s ease;
}

.racikan-bentuk-pick:hover {
  border-color: var(--p-primary-color, #3b82f6);
}

.racikan-bentuk-pick.active {
  background: var(--p-primary-color, #3b82f6);
  border-color: var(--p-primary-color, #3b82f6);
  color: var(--p-primary-contrast-color, #fff);
}

.racikan-bahan-section {
  margin-bottom: 14px;
}

.racikan-bahan-hint {
  display: block;
  font-size: 11px;
  color: var(--p-text-muted-color);
  margin: 2px 0 8px;
  line-height: 1.5;
}

.racikan-bahan-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.racikan-bahan-results {
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 8px;
  max-height: 160px;
  overflow-y: auto;
  margin-bottom: 8px;
}

.racikan-bahan-result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-bottom: 1px solid var(--p-content-border-color, #f1f1ee);
  background: var(--p-surface-0, #fff);
  cursor: pointer;
  font-size: 12.5px;
  text-align: left;
}

.racikan-bahan-result-row:last-child {
  border-bottom: none;
}

.racikan-bahan-result-row:hover:not(:disabled) {
  background: var(--p-primary-50, #f2f8f6);
}

.racikan-bahan-result-row:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.racikan-bahan-table-wrap {
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 8px;
  overflow-x: auto;
}

.racikan-bahan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.racikan-bahan-table th {
  text-align: left;
  font-size: 10.5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  background: var(--p-surface-50, #f8fafc);
  padding: 6px 8px;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
  white-space: nowrap;
}

.racikan-bahan-table td {
  padding: 5px 8px;
  border-bottom: 1px solid var(--p-content-border-color, #f1f1ee);
  vertical-align: middle;
}

.racikan-bahan-table tbody tr:last-child td {
  border-bottom: none;
}

.racikan-bahan-kandungan-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.racikan-bahan-kandungan-num {
  width: 70px;
  flex-shrink: 0;
}

.racikan-bahan-kandungan-num :deep(input) {
  width: 100%;
  padding: 4px 6px;
  height: 28px;
  font-size: 11.5px;
}

.racikan-bahan-kandungan-sat {
  width: 50px;
  flex-shrink: 0;
  padding: 4px 6px;
  height: 28px;
  font-size: 11.5px;
}

.racikan-bahan-dosis {
  width: 110px;
}

.racikan-bahan-dosis :deep(input) {
  width: 100%;
  padding: 4px 6px;
  height: 28px;
  font-size: 11.5px;
}

.racikan-bahan-qty {
  width: 72px;
}

.racikan-bahan-qty :deep(input) {
  width: 100%;
  text-align: center;
  padding: 4px 6px;
  height: 28px;
}

.racikan-bahan-qty-over :deep(input) {
  border-color: var(--p-red-500, #ef4444);
  color: var(--p-red-600, #dc2626);
}

.racikan-bahan-stok {
  font-size: 10px;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  margin-top: 2px;
  text-align: center;
}

.racikan-bahan-stok-over {
  color: var(--p-red-500, #ef4444);
  font-weight: 700;
}

.racikan-bahan-harga {
  font-size: 11px;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  text-align: right;
}

.racikan-bahan-subtotal {
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  text-align: right;
}

.racikan-bahan-remove {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: none;
  background: transparent;
  color: var(--p-red-500, #ef4444);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.racikan-bahan-remove:hover {
  background: var(--p-red-50, #fef2f2);
}

.racikan-bahan-empty {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: var(--p-text-muted-color);
  border: 1px dashed var(--p-content-border-color, #ddd);
  border-radius: 8px;
}

.racikan-preview-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 8px;
  font-weight: 800;
  font-size: 14px;
  color: var(--p-primary-color);
}

.racikan-preview-total small {
  font-weight: 400;
  font-size: 10px;
  color: var(--p-text-muted-color);
  text-transform: none;
}

.tutup-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
}

.tutup-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 10px 0 4px;
}

.tutup-result-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 6px;
}

.tutup-result-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  text-align: left;
  margin-top: 8px;
}

.tutup-result-grid > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 8px;
  font-size: 12px;
}

.tutup-result-grid span {
  color: var(--p-text-muted-color);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tutup-selisih {
  grid-column: 1 / -1;
}

.tutup-selisih.is-zero b {
  color: var(--p-green-600, #16a34a);
}

.tutup-selisih.is-neg b,
.tutup-selisih:not(.is-zero) b {
  color: var(--p-red-500, #ef4444);
}

.mono {
  font-family: ui-monospace, "Cascadia Code", "SF Mono", Menlo, Consolas, monospace;
}

.exp-none {
  color: var(--p-text-muted-color);
  font-size: 11px;
}
.exp-ok {
  color: var(--p-green-600, #16a34a);
  font-size: 11px;
}
.exp-soon {
  color: var(--p-orange-500, #f97316);
  font-size: 11px;
  font-weight: 700;
}
.exp-kadaluarsa {
  color: var(--p-red-500, #ef4444);
  font-size: 11px;
  font-weight: 700;
}

.recent-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
}

.recent-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 10px;
  width: 100%;
  background: var(--p-surface-0, #fff);
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.recent-row:hover {
  border-color: var(--p-primary-color);
}

.recent-row-voided {
  opacity: 0.6;
}

.recent-row-main {
  min-width: 0;
}

.recent-row-no {
  font-weight: 700;
  font-size: 12.5px;
}

.recent-row-meta {
  font-size: 11px;
  color: var(--p-text-muted-color);
}

.recent-row-items {
  font-size: 11px;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 380px;
}

.recent-row-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.recent-row-total {
  font-weight: 800;
  font-size: 13px;
}

.recent-row-total-voided {
  text-decoration: line-through;
  color: var(--p-text-muted-color);
}

/* ══════════ Dialog Detail Transaksi ══════════ */
.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
}

.detail-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--p-primary-50, #eff6ff);
  color: var(--p-primary-color, #3b82f6);
  font-size: 16px;
}

.detail-header-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.detail-header-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-header-no {
  font-weight: 700;
  font-size: 13.5px;
}

.detail-header-meta {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 44vh;
  overflow-y: auto;
  padding-right: 2px;
}

.detail-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--p-content-background, #fff);
  border: 1px solid var(--p-content-border-color, #f0f0f0);
}

.detail-item-voided {
  opacity: 0.55;
  background: transparent;
}

.detail-item-main {
  min-width: 0;
}

.detail-item-name {
  font-size: 12.5px;
  font-weight: 600;
}

.detail-item-voided .detail-item-name {
  text-decoration: line-through;
}

.detail-item-sub {
  font-size: 11px;
  color: var(--p-text-muted-color);
  margin-top: 2px;
}

.detail-item-disc {
  color: var(--p-orange-600, #ea580c);
  font-weight: 600;
}

.detail-item-bahan {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
  padding-left: 8px;
  margin-top: 2px;
}

.detail-item-side {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.detail-summary {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--p-surface-50, #f8fafc);
  border: 1px solid var(--p-content-border-color, #eee);
}

.detail-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--p-text-muted-color);
  padding: 3px 0;
}

.detail-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0;
  padding: 8px 0;
  border-top: 1px dashed var(--p-content-border-color, #d8d8d8);
  border-bottom: 1px dashed var(--p-content-border-color, #d8d8d8);
  font-weight: 800;
  font-size: 14.5px;
  color: var(--p-primary-color, #3b82f6);
}

.detail-summary-void {
  color: var(--p-red-600, #dc2626);
  font-weight: 600;
}

/* ══════════ Kaitkan Pendaftaran Klinik ══════════ */
.register-bar {
  margin-bottom: 10px;
}

.register-bar-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 9px 14px;
  border: 1px dashed var(--p-content-border-color, #d1d5db);
  border-radius: 10px;
  background: transparent;
  color: var(--p-text-muted-color);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.register-bar-btn:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
  background: var(--p-primary-50, #f2f8f6);
}

.register-bar-btn small {
  font-weight: 400;
  opacity: 0.8;
}

.register-bar-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--p-primary-50, #f2f8f6);
  border: 1px solid var(--p-primary-100, #ddeee9);
  color: var(--p-primary-700, #345f50);
}

.register-bar-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.register-bar-name {
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.register-bar-meta {
  font-size: 10.5px;
  opacity: 0.85;
}

.register-bar-clear {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.register-bar-clear:hover {
  background: rgba(0, 0, 0, 0.06);
}

.register-dialog-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.register-date {
  width: 160px;
  flex-shrink: 0;
}

.register-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 55vh;
  overflow-y: auto;
}

.register-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  min-height: 44px;
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 10px;
  background: var(--p-surface-0, #fff);
  cursor: pointer;
  text-align: left;
}

.register-row:hover {
  border-color: var(--p-primary-color);
}

.register-row-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.register-row-name {
  font-size: 13px;
  font-weight: 700;
}

.register-row-meta {
  font-size: 11px;
  color: var(--p-text-muted-color);
}

.register-row-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.register-row-no {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
}

</style>
