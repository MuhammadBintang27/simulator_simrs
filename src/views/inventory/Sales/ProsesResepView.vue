<template>
  <div class="content">
    <Toast />

    <!-- ══ TOOLBAR ══ -->
    <Toolbar class="mb-1">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button
            icon="pi pi-arrow-left"
            severity="secondary"
            text
            rounded
            v-tooltip.right="'Tutup tab ini'"
            @click="closeTab"
          />
          <div>
            <div style="display: flex; align-items: center; gap: 8px; line-height: 1.2">
              <span style="font-size: 1rem; font-weight: 700">Proses Resep</span>
              <Tag
                v-if="isPreview"
                value="PREVIEW"
                severity="warn"
                style="font-size: 10px; padding: 2px 7px; font-weight: 800; letter-spacing: 0.04em"
              />
            </div>
            <div style="font-size: 0.82rem; color: var(--p-text-muted-color)">
              <template v-if="isPreview"
                >Hanya tampilan — semua fungsi editing dinonaktifkan</template
              >
              <template v-else>Farmasi — Detail &amp; Pemrosesan Resep</template>
            </div>
          </div>
        </div>
      </template>
      <template #end>
        <div
          class="toolbar-end"
          style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap"
        >
          <Tag v-if="header" :value="statusProgressLabel" :severity="statusProgressSeverity" />
          <template v-if="!isPreview">
            <Button icon="pi pi-pdf" label="Rekam Medis" size="small" @click="PrintRekamMedisEl" />
          </template>
        </div>
      </template>
    </Toolbar>

    <!-- ══ PATIENT INFO ══ -->
    <div class="patient-card mb-1">
      <div class="patient-avatar">
        <i class="pi pi-user" style="font-size: 1.5rem; color: var(--p-primary-color)" />
      </div>
      <div class="patient-info">
        <div class="patient-name">{{ route.query.nama || header?.NOTE || '—' }}</div>
        <div class="patient-meta">
          <span
            ><i class="pi pi-id-card" style="font-size: 10px; margin-right: 4px" />NOMR:
            <b>{{ route.query.nomr || header?.MEMBERSHIP_ID || '—' }}</b></span
          >
          <span
            ><i class="pi pi-receipt" style="font-size: 10px; margin-right: 4px" />No. Reg:
            <b>{{ header?.NOREGISTER || route.query.noregister || '—' }}</b></span
          >
          <span
            ><i class="pi pi-building" style="font-size: 10px; margin-right: 4px" /> Poli/Ruang :
            <b>{{ route.query.poli || '—' }}</b></span
          >
          <span
            ><i class="pi pi-calendar" style="font-size: 10px; margin-right: 4px" />Tanggal:
            <b>{{ header?.TANGGAL_TRANS || route.query.tanggal || '—' }}</b></span
          >
        </div>
      </div>
      <div class="patient-trans">
        <div class="trans-lbl">No. Resep</div>
        <div class="trans-val">{{ header?.RECEIPT_NO || route.params.trans }}</div>
      </div>
    </div>

    <!-- ══ SKELETON LOADING ══ -->
    <template v-if="loading">
      <!-- patient card skeleton -->
      <div class="patient-card mb-1">
        <Skeleton shape="circle" size="46px" />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px">
          <Skeleton width="40%" height="14px" />
          <div style="display: flex; gap: 12px">
            <Skeleton width="80px" height="11px" />
            <Skeleton width="100px" height="11px" />
            <Skeleton width="70px" height="11px" />
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-end">
          <Skeleton width="80px" height="11px" />
          <Skeleton width="60px" height="13px" />
        </div>
      </div>

      <!-- header bar skeleton -->
      <div class="receipt-header-bar mb-1">
        <div v-for="i in 6" :key="i" class="rh-item">
          <Skeleton width="50px" height="9px" class="mb-1" />
          <Skeleton width="90px" height="12px" />
        </div>
      </div>

      <!-- table skeleton -->
      <div class="skel-table">
        <!-- header -->
        <div class="skel-thead">
          <Skeleton
            v-for="i in 10"
            :key="i"
            :width="i === 5 || i === 6 ? '160px' : '60px'"
            height="11px"
          />
        </div>
        <!-- rows -->
        <div v-for="row in 12" :key="row" class="skel-row" :style="{ opacity: 1 - row * 0.06 }">
          <Skeleton
            v-for="i in 10"
            :key="i"
            :width="i === 5 || i === 6 ? '160px' : '60px'"
            height="11px"
          />
        </div>
      </div>
    </template>

    <!-- ══ ERROR ══ -->
    <div v-else-if="errorMsg" class="state-box">
      <i class="pi pi-times-circle" style="font-size: 2rem; color: var(--p-red-500)" />
      <div style="margin-top: 8px; font-size: 14px; font-weight: 600; color: var(--p-red-600)">
        Gagal memuat data
      </div>
      <div style="font-size: 13px; color: var(--p-text-muted-color); margin-top: 4px">
        {{ errorMsg }}
      </div>
      <Button label="Coba Lagi" icon="pi pi-refresh" class="mt-3" @click="fetchBill" />
    </div>

    <!-- ══ CONTENT ══ -->
    <template v-else-if="items.length > 0">
      <!-- ── Ringkasan Resep ── -->
      <div class="receipt-header-bar mb-1">
        <div class="rh-item">
          <span class="rh-lbl">No. Resep</span>
          <span class="rh-val mono">{{ header.RECEIPT_NO }}</span>
        </div>
        <div class="rh-item">
          <span class="rh-lbl">No. Register</span>
          <span class="rh-val mono">{{ header.NOREGISTER }}</span>
        </div>
        <div class="rh-item">
          <span class="rh-lbl">Tanggal Masuk</span>
          <span class="rh-val">{{ header.TANGGAL }}</span>
        </div>
        <div class="rh-item">
          <span class="rh-lbl">Jenis Resep</span>
          <span class="rh-val"
            ><Tag :value="header.JENIS_RESEP || '—'" severity="info" style="font-size: 11px"
          /></span>
        </div>
        <div class="rh-item">
          <span class="rh-lbl">Input Oleh</span>
          <span class="rh-val">{{ header.IDUSER }}</span>
        </div>
        <div class="rh-item" style="flex: 2">
          <span class="rh-lbl">Catatan</span>
          <span class="rh-val">{{ header.NOTE || '—' }}</span>
        </div>
      </div>

      <!-- ── Riwayat Resep (rawat inap: banyak resep per kunjungan) ── -->
      <div v-if="listResep.length > 1" class="riwayat-bar mb-1">
        <div class="rrb-label">
          <i class="pi pi-history" style="font-size: 12px" />
          Riwayat
          <span class="rrb-count">{{ listResep.length }}</span>
        </div>
        <div class="rrb-scroll">
          <button
            v-for="(r, i) in listResep"
            :key="r.RECEIPT_NO"
            class="rrb-chip"
            :class="{
              'rrb-active': r.RECEIPT_NO === route.params.trans,
              'rrb-selesai': r.STATUS_PROGRESS === 'C',
              'rrb-proses': r.STATUS_PROGRESS === 'P',
              'rrb-pending': !r.STATUS_PROGRESS || r.STATUS_PROGRESS === '',
            }"
            :title="`${r.RECEIPT_NO}\n${r.LOKASI}\n${r.TANGGAL}`"
            @click="navigateToResep(r)"
          >
            <span class="rrb-idx">R{{ i + 1 }}</span>
            <span class="rrb-tgl">{{ formatTglShort(r.TANGGAL) }}</span>
            <i
              v-if="r.STATUS_PROGRESS === 'C'"
              class="pi pi-check-circle"
              style="font-size: 9px; flex-shrink: 0"
            />
            <i
              v-else-if="r.STATUS_PROGRESS === 'P'"
              class="pi pi-spin pi-spinner"
              style="font-size: 9px; flex-shrink: 0"
            />
            <i v-else class="pi pi-clock" style="font-size: 9px; flex-shrink: 0; opacity: 0.5" />
          </button>
        </div>
        <i
          v-if="loadingListResep"
          class="pi pi-spin pi-spinner"
          style="font-size: 12px; color: var(--p-text-muted-color); flex-shrink: 0"
        />
      </div>

      <!-- ── Daftar Obat ── -->
      <Panel class="mb-3">
        <template #header>
          <div style="display: flex; align-items: center; gap: 10px; width: 100%">
            <span style="font-weight: 700">
              <i class="pi pi-list-check" style="margin-right: 6px" />Daftar Obat / Item
            </span>
            <Tag
              :value="`${displayRows.length} item`"
              severity="secondary"
              style="font-size: 11px"
            />
            <Tag
              v-if="itemBelumDiberikan > 0"
              :value="`${itemBelumDiberikan} belum diberikan`"
              severity="danger"
              style="font-size: 11px"
            />
          </div>
        </template>

        <!-- ══ DataTable Utama (parent + normal saja) ══ -->
        <DataTable
          :value="displayRows"
          v-model:expandedRows="expandedRows"
          dataKey="ITEMSEQNO"
          size="small"
          showGridlines
          scrollable
          :scrollHeight="tableScrollHeight"
          :rowClass="itemRowClass"
          tableStyle="min-width: 1200px; table-layout: fixed"
        >
          <!-- ── Expansion: bahan-bahan racikan ── -->
          <template #expansion="{ data }">
            <div
              v-if="data._rowType === 'parent' && data._children?.length"
              class="racikan-expansion"
            >
              <!-- Header expansion -->
              <div class="racikan-exp-header">
                <i class="pi pi-list" style="color: var(--p-primary-color); font-size: 12px" />
                <span style="font-weight: 700; font-size: 12px">Bahan Racikan</span>
                <Tag
                  :value="`${data._children.length} bahan`"
                  severity="info"
                  style="font-size: 10px"
                />
                <span style="font-size: 11px; color: var(--p-text-muted-color)">
                  — cocokkan setiap bahan ke stok apotik menggunakan tombol
                  <i class="pi pi-search" style="font-size: 10px" /> ADD
                </span>
              </div>

              <!-- Mini tabel bahan -->
              <DataTable
                :value="data._children"
                size="small"
                showGridlines
                class="racikan-child-table"
                :rowClass="childRowClass"
              >
                <!-- ITEM REQ: tulisan dokter -->
                <Column header="ITEM REQ (Dokter)" style="min-width: 160px">
                  <template #body="{ data: child }">
                    <div class="racikan-req-name">
                      <i
                        class="pi pi-pencil"
                        style="font-size: 9px; flex-shrink: 0; color: var(--p-text-muted-color)"
                      />
                      <span class="cell-truncate" :title="child.NAMABARANG_REQ">
                        {{ child.NAMABARANG_REQ || child.NAMABARANG }}
                      </span>
                    </div>
                  </template>
                </Column>

                <!-- ITEM APP: hasil pencocokan apotik -->
                <Column header="ITEM APP (Apotik)" style="min-width: 180px">
                  <template #body="{ data: child }">
                    <div class="racikan-app-name">
                      <span
                        class="cell-truncate"
                        :class="child.JSON_FILE ? 'racikan-matched' : 'racikan-unmatched'"
                        :title="child.NAMABARANG"
                        >{{ child.NAMABARANG || '— belum dicocokkan —' }}</span
                      >
                      <i
                        v-if="child.JSON_FILE"
                        class="pi pi-check-circle"
                        style="font-size: 10px; color: var(--p-primary-color); flex-shrink: 0"
                        v-tooltip.left="'Sudah dicocokkan ke stok'"
                      />
                      <i
                        v-else
                        class="pi pi-exclamation-triangle"
                        style="font-size: 10px; color: var(--p-amber-600); flex-shrink: 0"
                        v-tooltip.left="'Belum dicocokkan ke stok apotik'"
                      />
                    </div>
                  </template>
                </Column>

                <!-- ADD: cocokkan ke stok -->
                <Column v-if="!isPreview" header="ADD" style="width: 48px; text-align: center">
                  <template #body="{ data: child }">
                    <Button
                      icon="pi pi-search"
                      size="small"
                      :severity="child.JSON_FILE ? 'success' : 'warn'"
                      text
                      rounded
                      v-tooltip.left="
                        child.JSON_FILE ? 'Edit pencocokan stok' : 'Cocokkan ke stok apotik'
                      "
                      @click="openVariasiDialog(child)"
                    />
                  </template>
                </Column>

                <!-- CHG: substitusi bahan -->
                <Column v-if="!isPreview" header="CHG" style="width: 48px; text-align: center">
                  <template #body="{ data: child }">
                    <Button
                      :icon="isSubstituted(child) ? 'pi pi-check' : 'pi pi-sync'"
                      size="small"
                      :severity="isSubstituted(child) ? 'success' : 'info'"
                      text
                      rounded
                      v-tooltip.left="
                        isSubstituted(child)
                          ? 'Sudah diganti — klik untuk ubah'
                          : 'Ganti bahan dengan substitusi'
                      "
                      @click="openChgDialog(child)"
                    />
                  </template>
                </Column>

                <!-- QTY REQ -->
                <Column header="QTY REQ" style="width: 76px; text-align: center">
                  <template #body="{ data: child }">
                    <span style="font-weight: 600; font-size: 11px">{{
                      parseFloat(child.QTY_REQ)
                    }}</span>
                  </template>
                </Column>

                <!-- QTY APP -->
                <Column header="QTY APP" style="width: 76px; text-align: center">
                  <template #body="{ data: child }">
                    <span class="qty-app-cell" :class="qtyAppClass(child)" style="font-size: 11px">
                      {{ parseFloat(child.QTY).toFixed(2) }}
                    </span>
                  </template>
                </Column>

                <!-- QTY COPY -->
                <Column header="QTY COPY" style="width: 110px">
                  <template #body="{ data: child }">
                    <div class="cell-input-sm">
                      <InputNumber
                        v-model="child.QTY_COPY"
                        :minFractionDigits="0"
                        :maxFractionDigits="2"
                        locale="id-ID"
                        :disabled="isPreview"
                        @update:modelValue="child.CHANGING_ITEM = 1"
                      />
                    </div>
                  </template>
                </Column>

                <!-- HARGA per unit -->
                <Column header="HARGA" style="width: 100px; text-align: right">
                  <template #body="{ data: child }">
                    <span style="font-size: 11px">{{ formatNumber(child.HARGA) }}</span>
                  </template>
                </Column>

                <!-- SUBTOTAL -->
                <Column header="SUBTOTAL" style="width: 110px; text-align: right">
                  <template #body="{ data: child }">
                    <span style="font-size: 11px; font-weight: 600">{{
                      formatNumber(child.TOTALAMOUNT)
                    }}</span>
                  </template>
                </Column>

                <!-- SATUAN -->
                <Column header="SAT" style="width: 60px; text-align: center">
                  <template #body="{ data: child }">
                    <span style="font-size: 11px">{{ child.SATUAN }}</span>
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>

          <!-- ── Kolom utama (parent + normal) ── -->

          <!-- Expand toggle: hanya untuk parent racikan -->
          <Column style="width: 2.5%; text-align: center">
            <template #body="{ data }">
              <Button
                v-if="data._rowType === 'parent'"
                :icon="expandedRows[data.ITEMSEQNO] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                size="small"
                text
                rounded
                style="width: 22px; height: 22px; color: var(--p-primary-color)"
                v-tooltip.right="
                  expandedRows[data.ITEMSEQNO] ? 'Tutup bahan' : 'Lihat bahan racikan'
                "
                @click="toggleExpand(data)"
              />
            </template>
          </Column>

          <!-- # -->
          <Column header="#" style="width: 3%; text-align: center">
            <template #body="{ data }">
              <span style="font-weight: 700; color: var(--p-text-muted-color); font-size: 11px">
                {{ data.ITEMSEQNO }}
              </span>
            </template>
          </Column>

          <!-- BARCODE: hanya untuk normal -->
          <Column header="BARCODE" style="width: 7%">
            <template #body="{ data }">
              <span
                v-if="data._rowType === 'normal'"
                style="font-family: monospace; font-weight: 600; font-size: 11px"
              >
                {{ data.BARCODE_REQ || data.BARCODE }}
              </span>
              <span v-else style="color: var(--p-text-muted-color); font-size: 10px">—</span>
            </template>
          </Column>

          <!-- R/ marker -->
          <Column header="R/" style="width: 2.5%; text-align: center">
            <template #body="{ data }">
              <Tag
                v-if="data._rowType === 'parent'"
                value="R/"
                severity="primary"
                style="font-size: 9px; font-style: italic; padding: 1px 4px"
              />
              <span v-else style="color: var(--p-text-muted-color); font-size: 11px">R/</span>
            </template>
          </Column>

          <!-- ITEM REQ -->
          <Column header="ITEM REQ" style="width: 13%">
            <template #body="{ data }">
              <!-- Parent: nama sediaan + badge jumlah bahan -->
              <div v-if="data._rowType === 'parent'" class="racikan-parent-name">
                <span class="cell-truncate" style="font-weight: 700; color: var(--p-primary-800)">
                  {{ data.NAMABARANG }}
                </span>
                <Tag
                  :value="`${data._children?.length ?? 0} bahan`"
                  severity="success"
                  style="font-size: 9px; flex-shrink: 0"
                />
              </div>
              <!-- Normal: tulisan dokter -->
              <div v-else class="cell-truncate" style="font-weight: 600">
                {{ data.NAMABARANG_REQ || data.NAMABARANG }}
              </div>
            </template>
          </Column>

          <!-- ITEM APP -->
          <Column header="ITEM APP" style="width: 13%">
            <template #body="{ data }">
              <!-- Parent: status kelengkapan bahan -->
              <div v-if="data._rowType === 'parent'" class="racikan-parent-status">
                <span
                  v-if="data._children?.every((c) => c.JSON_FILE)"
                  style="color: var(--p-green-600); font-size: 11px; font-weight: 600"
                >
                  <i class="pi pi-check-circle" /> Sudah diproses
                </span>
                <span v-else style="color: var(--p-amber-600); font-size: 11px">
                  <i class="pi pi-exclamation-triangle" />
                  {{ data._children?.filter((c) => !c.JSON_FILE).length }} bahan belum dicocokkan
                </span>
              </div>
              <!-- Normal: nama item yang diapprove + badge SUB jika substitusi -->
              <div v-else class="item-app-normal">
                <span class="cell-truncate" style="font-weight: 600">{{ data.NAMABARANG }}</span>
                <Tag
                  v-if="isSubstituted(data)"
                  value="SUB"
                  severity="warn"
                  style="font-size: 9px; flex-shrink: 0; padding: 1px 4px"
                />
              </div>
            </template>
          </Column>

          <!-- DOSIS -->
          <Column header="DOSIS" style="width: 5%; text-align: center">
            <template #body="{ data }">
              <span style="font-size: 11px">{{ data.REMARK_ITEM || '' }}</span>
            </template>
          </Column>

          <!-- HARGA: hanya normal -->
          <Column header="HARGA" style="width: 7%; text-align: right">
            <template #body="{ data }">
              <span v-if="data._rowType === 'normal'" style="font-size: 11px">
                {{ formatNumber(data.HARGA) }}
              </span>
              <span v-else style="color: var(--p-text-muted-color); font-size: 10px">—</span>
            </template>
          </Column>

          <!-- ADD: hanya normal (child punya ADD di expansion) -->
          <Column v-if="!isPreview" header="ADD" style="width: 3%; text-align: center">
            <template #body="{ data }">
              <Button
                v-if="data._rowType === 'normal'"
                icon="pi pi-search"
                size="small"
                :severity="data.JSON_FILE ? 'success' : 'warn'"
                text
                rounded
                v-tooltip.left="data.JSON_FILE ? 'Edit pencocokan stok' : 'Cocokkan ke stok apotik'"
                @click="openVariasiDialog(data)"
              />
            </template>
          </Column>

          <!-- CHG: hanya normal -->
          <Column v-if="!isPreview" header="CHG" style="width: 3%; text-align: center">
            <template #body="{ data }">
              <Button
                v-if="data._rowType === 'normal'"
                :icon="isSubstituted(data) ? 'pi pi-check' : 'pi pi-sync'"
                size="small"
                :severity="isSubstituted(data) ? 'success' : 'info'"
                text
                rounded
                v-tooltip.left="
                  isSubstituted(data)
                    ? 'Sudah diganti — klik untuk ubah'
                    : 'Ganti item dengan substitusi'
                "
                @click="openChgDialog(data)"
              />
            </template>
          </Column>

          <!-- QTY REQ -->
          <Column header="QTY REQ" style="width: 5%; text-align: center">
            <template #body="{ data }">
              <span style="font-weight: 600; font-size: 11px">
                {{ data._rowType === 'parent' ? parseFloat(data.QTY) : parseFloat(data.QTY_REQ) }}
              </span>
            </template>
          </Column>

          <!-- QTY APP: hanya normal -->
          <Column header="QTY APP" style="width: 5.5%; text-align: center">
            <template #body="{ data }">
              <span
                v-if="data._rowType === 'normal'"
                class="qty-app-cell"
                :class="qtyAppClass(data)"
                style="font-size: 11px"
              >
                {{ parseFloat(data.QTY).toFixed(2) }}
              </span>
              <span v-else style="color: var(--p-text-muted-color); font-size: 10px">—</span>
            </template>
          </Column>

          <!-- QTY COPY: hanya normal -->
          <Column header="QTY COPY" style="width: 7%">
            <template #body="{ data }">
              <div v-if="data._rowType === 'normal'" class="cell-input-sm">
                <InputNumber
                  v-model="data.QTY_COPY"
                  :minFractionDigits="0"
                  :maxFractionDigits="2"
                  locale="id-ID"
                  :disabled="isPreview"
                  @update:modelValue="data.CHANGING_ITEM = 1"
                />
              </div>
              <span v-else style="font-size: 11px; color: var(--p-text-muted-color)">—</span>
            </template>
          </Column>

          <!-- EST HARGA: hanya normal -->
          <Column header="EST HARGA" style="width: 8%">
            <template #body="{ data }">
              <div v-if="data._rowType === 'normal'" class="cell-input-sm">
                <InputNumber
                  v-model="data.EST_HARGA_COPY"
                  :minFractionDigits="0"
                  :maxFractionDigits="2"
                  locale="id-ID"
                  :disabled="isPreview"
                  @update:modelValue="data.CHANGING_ITEM = 1"
                />
              </div>
              <span v-else style="font-size: 11px; color: var(--p-text-muted-color)">—</span>
            </template>
          </Column>

          <!-- SAT: hanya normal -->
          <Column header="SAT" style="width: 4%; text-align: center">
            <template #body="{ data }">
              <span v-if="data._rowType === 'normal'" style="font-size: 11px">{{
                data.SATUAN
              }}</span>
            </template>
          </Column>

          <!-- SUBTOTAL: normal = TOTALAMOUNT, parent = Σ bahan -->
          <Column header="SUBTOTAL" style="width: 8%; text-align: right">
            <template #body="{ data }">
              <span
                v-if="data._rowType === 'parent'"
                style="font-size: 11px; font-weight: 700; color: var(--p-primary-700)"
              >
                {{ formatNumber(parentSubtotal(data)) }}
              </span>
              <span v-else style="font-size: 11px">{{ formatNumber(data.TOTALAMOUNT) }}</span>
            </template>
          </Column>

          <!-- DEL: hanya normal, disembunyikan saat preview -->
          <Column v-if="!isPreview" header="DEL" style="width: 3%; text-align: center">
            <template #body="{ data }">
              <Button
                v-if="data._rowType === 'normal'"
                icon="pi pi-times"
                size="small"
                severity="danger"
                text
                rounded
              />
            </template>
          </Column>

          <!-- ETK: semua baris, disembunyikan saat preview -->
          <Column v-if="!isPreview" header="ETK" style="width: 3.5%; text-align: center">
            <template #body="{ data }">
              <Button
                icon="pi pi-print"
                size="small"
                severity="secondary"
                text
                rounded
                v-tooltip.left="'Cetak Etiket'"
                @click="bukaCetakEtiketItem(data)"
              />
            </template>
          </Column>

          <!-- KET -->
          <Column header="KET" style="width: 8%">
            <template #body="{ data }">
              <div style="position: relative; width: 100%">
                <InputText
                  v-model="data.KETERANGAN"
                  placeholder="Catatan..."
                  style="font-size: 11px; width: 100%; padding: 2px 22px 2px 6px; height: 26px"
                  @blur="updateKeterangan(data)"
                  @keyup.enter="updateKeterangan(data)"
                />
                <i
                  v-if="savedItems[data.ITEMSEQNO]"
                  class="pi pi-check"
                  style="
                    position: absolute;
                    right: 5px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #22c55e;
                    font-size: 11px;
                    pointer-events: none;
                  "
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- ── Totals ── -->
        <div class="bill-totals">
          <div class="bt-row">
            <span>Subtotal</span>
            <span>{{ formatRupiah(liveSubtotal) }}</span>
          </div>
          <div v-if="parseFloat(header.POTONGAN) > 0" class="bt-row">
            <span>Potongan</span>
            <span style="color: var(--p-green-700)">- {{ formatRupiah(header.POTONGAN) }}</span>
          </div>
          <div v-if="parseFloat(header.TAXAMOUNT) > 0" class="bt-row">
            <span>Pajak ({{ header.TAXPERCENT }}%)</span>
            <span>{{ formatRupiah(header.TAXAMOUNT) }}</span>
          </div>
          <div class="bt-row bt-grand">
            <span>Grand Total</span>
            <span>{{ formatRupiah(liveGrandTotal) }}</span>
          </div>
          <div v-if="parseFloat(header.TOTALBAYAR) > 0" class="bt-row">
            <span>Total Bayar</span>
            <span>{{ formatRupiah(header.TOTALBAYAR) }}</span>
          </div>
          <div v-if="parseFloat(header.KEMBALIAN) > 0" class="bt-row">
            <span>Kembalian</span>
            <span style="color: var(--p-green-700)">{{ formatRupiah(header.KEMBALIAN) }}</span>
          </div>
        </div>
      </Panel>

      <!-- ── Catatan Kesan ── -->
      <Panel v-if="catatanKesan?.CATATAN" header="Catatan Kesan" toggleable class="mb-2">
        <div style="line-height: 1.7; white-space: pre-wrap">{{ catatanKesan.CATATAN }}</div>
      </Panel>

      <!-- ══ ACTION BAR ══ -->
      <div v-if="!isPreview" class="action-bar">
        <div class="action-bar-left">
          <Button
            icon="pi pi-refresh"
            label="Muat Ulang"
            size="small"
            severity="secondary"
            :loading="loading"
            @click="fetchBill"
          />
          <Button
            v-if="items.length > 0"
            icon="pi pi-print"
            label="Cetak Resep"
            size="small"
            severity="info"
            @click="bukaCetakResep"
          />
          <Button
            v-if="items.length > 0"
            icon="pi pi-copy"
            label="Cetak Copy Resep"
            size="small"
            severity="warn"
            @click="bukaCetakResepCopy"
          />
          <Button
            v-if="items.length > 0"
            icon="pi pi-tag"
            label="Cetak Etiket"
            size="small"
            severity="secondary"
            @click="bukaCetakEtiket"
          />
          <Button
            icon="pi pi-tablets"
            label="KCO"
            size="small"
            severity="secondary"
            v-tooltip.bottom="'Kartu Catatan Obat'"
            @click="bukaKCO"
          />
          <Button
            v-if="items.length > 0"
            icon="pi pi-save"
            label="Simpan"
            size="small"
            severity="success"
            :loading="loadingSimpan"
            @click="simpanResep"
          />
        </div>
        <div class="action-bar-right">
          <span class="grand-total-lbl">Grand Total</span>
          <span class="grand-total-val">{{ formatRupiah(liveGrandTotal) }}</span>
        </div>
      </div>
    </template>

    <!-- ══ EMPTY ══ -->
    <div v-else-if="!loading" class="state-box">
      <i class="pi pi-file" style="font-size: 2rem; color: var(--p-text-muted-color)" />
      <div style="margin-top: 8px; font-size: 14px; color: var(--p-text-muted-color)">
        Tidak ada data resep ditemukan.
      </div>
      <Button
        label="Muat Ulang"
        icon="pi pi-refresh"
        class="mt-3"
        severity="secondary"
        @click="fetchBill"
      />
    </div>

    <!-- ══ DIALOG VARIASI BARANG ══ -->
    <Dialog
      v-model:visible="showVariasiDialog"
      modal
      :draggable="false"
      :style="{ width: '95vw', maxWidth: '1100px' }"
      :pt="{ header: { style: 'padding: 12px 16px' }, content: { style: 'padding: 0 0 12px' } }"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <i class="pi pi-list" style="color: var(--p-primary-color)" />
          <div>
            <div style="font-weight: 700; font-size: 14px">Variasi Barang</div>
            <div style="font-size: 12px">
              {{ selectedBarang?.BARCODE }} — {{ selectedBarang?.NAMABARANG }}
            </div>
          </div>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loadingVariasi" class="variasi-loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 1.6rem; color: var(--p-primary-color)" />
        <span style="margin-top: 8px; color: var(--p-text-muted-color); font-size: 13px">
          Memuat data variasi...
        </span>
      </div>

      <!-- Tabel variasi -->
      <DataTable
        v-else
        :value="variasi"
        size="small"
        showGridlines
        scrollable
        scrollHeight="380px"
        class="variasi-table"
        selectionMode="single"
        v-model:selection="selectedVariasi"
        :rowClass="variasiRowClass"
        @row-select="onVariasiRowSelect"
      >
        <template #empty>
          <div style="text-align: center; padding: 28px; color: var(--p-text-muted-color)">
            <i
              class="pi pi-inbox"
              style="font-size: 1.5rem; display: block; margin-bottom: 6px; opacity: 0.4"
            />
            Tidak ada variasi ditemukan
          </div>
        </template>

        <Column header="#" style="width: 38px; text-align: center">
          <template #body="{ index }">
            <span style="font-size: 11px; color: var(--p-text-muted-color)">{{ index + 1 }}</span>
          </template>
        </Column>

        <Column header="SUB BARCODE" style="width: 100px">
          <template #body="{ data }">
            <span style="font-family: monospace; font-size: 11px; font-weight: 600">
              {{ data.SUB_BARCODE }}
            </span>
          </template>
        </Column>

        <Column header="NAMA BARANG" style="min-width: 200px">
          <template #body="{ data }">
            <span style="font-weight: 600; font-size: 12px">{{ data.NAMA }}</span>
          </template>
        </Column>

        <Column header="BATCH" style="width: 130px">
          <template #body="{ data }">
            <span style="font-family: monospace; font-size: 11px; color: var(--p-text-muted-color)">
              {{ data.BATCH_NUMBER || '—' }}
            </span>
          </template>
        </Column>

        <Column header="TGL EXP" style="width: 100px; text-align: center">
          <template #body="{ data }">
            <span :class="expClass(data.TGL_EXPIRED_DT)" style="font-size: 11px">
              {{ data.TGL_EXPIRED_DT || '—' }}
            </span>
          </template>
        </Column>

        <Column header="HARGA JUAL" style="width: 110px; text-align: right">
          <template #body="{ data }">
            <span style="font-size: 12px; font-weight: 600">
              {{ formatNumber(data.HARGAJUAL) }}
            </span>
          </template>
        </Column>

        <Column header="QTY" field="QUNATITY" sortable style="width: 72px; text-align: right">
          <template #body="{ data }">
            <span
              :style="{
                fontWeight: 700,
                fontSize: '12px',
                color: data.QUNATITY > 0 ? 'var(--p-green-600)' : 'var(--p-red-600)',
              }"
            >
              {{ data.QUNATITY }}
            </span>
          </template>
        </Column>

        <Column header="PERSEDIAAN" style="width: 110px; text-align: right">
          <template #body="{ data }">
            <span style="font-size: 11px; color: var(--p-text-muted-color)">
              {{ formatNumber(data.PERSEDIAAN) }}
            </span>
          </template>
        </Column>

        <Column header="SATUAN" style="width: 72px; text-align: center">
          <template #body="{ data }">
            <Tag :value="data.SATUAN" severity="secondary" style="font-size: 10px" />
          </template>
        </Column>
      </DataTable>

      <!-- ── Footer konfirmasi (muncul setelah baris dipilih) ── -->
      <div v-if="selectedVariasi" class="variasi-footer">
        <div class="variasi-sel-info">
          <span class="variasi-sel-name">{{ selectedVariasi.NAMA }}</span>
          <span
            >Batch: <b>{{ selectedVariasi.BATCH_NUMBER || '—' }}</b></span
          >
          <span
            >Exp:
            <span :class="expClass(selectedVariasi.TGL_EXPIRED_DT)">
              {{ selectedVariasi.TGL_EXPIRED_DT || '—' }}
            </span>
          </span>
          <span
            >Stok:
            <b
              :style="{
                color: selectedVariasi.QUNATITY > 0 ? 'var(--p-green-600)' : 'var(--p-red-600)',
              }"
            >
              {{ selectedVariasi.QUNATITY }}
            </b>
          </span>
          <span
            >Harga: <b>{{ formatNumber(selectedVariasi.HARGAJUAL) }}</b></span
          >
        </div>
        <div class="variasi-qty-confirm">
          <label style="font-size: 12px; font-weight: 600; white-space: nowrap">Input QTY:</label>
          <InputNumber
            ref="variasiQtyRef"
            v-model="variasiQty"
            :min="0"
            :max="selectedVariasi.QUNATITY"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            locale="id-ID"
            class="variasi-qty-input"
            @keydown.enter="pilihVariasi"
          />
          <Button
            icon="pi pi-check"
            label="Konfirmasi"
            severity="success"
            size="small"
            :disabled="!variasiQty || variasiQty <= 0"
            @click="pilihVariasi"
          />
        </div>
      </div>
    </Dialog>

    <!-- ══ DIALOG GANTI ITEM (CHG) ══ -->
    <Dialog
      v-model:visible="showChgDialog"
      modal
      :draggable="false"
      :style="{ width: '95vw', maxWidth: '1100px' }"
      :pt="{ header: { style: 'padding: 12px 16px' }, content: { style: 'padding: 0' } }"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <i class="pi pi-sync" style="color: var(--p-primary-color)" />
          <div>
            <div style="font-weight: 700; font-size: 14px">Ganti Item (Substitusi)</div>
            <div style="font-size: 12px; color: var(--p-text-muted-color)">
              Item asal: <b>{{ selectedChgRow?.BARCODE }}</b> — {{ selectedChgRow?.NAMABARANG }}
            </div>
          </div>
        </div>
      </template>

      <!-- Search bar -->
      <div class="chg-searchbar">
        <InputText
          v-model="chgSearchNama"
          placeholder="Ketik nama obat / kandungan..."
          style="flex: 1; font-size: 13px"
          @keydown.enter="searchChgItems"
        />
        <Button
          icon="pi pi-search"
          label="Cari"
          severity="info"
          size="small"
          :loading="loadingChg"
          @click="searchChgItems"
        />
      </div>

      <!-- Loading -->
      <div v-if="loadingChg" class="variasi-loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 1.6rem; color: var(--p-primary-color)" />
        <span style="margin-top: 8px; color: var(--p-text-muted-color); font-size: 13px">
          Mencari item...
        </span>
      </div>

      <!-- Tabel hasil pencarian -->
      <DataTable
        v-else
        :value="chgResults"
        size="small"
        showGridlines
        scrollable
        scrollHeight="340px"
        class="variasi-table"
        selectionMode="single"
        v-model:selection="selectedChgItem"
        :rowClass="chgRowClass"
        @row-select="onChgRowSelect"
      >
        <template #empty>
          <div style="text-align: center; padding: 28px; color: var(--p-text-muted-color)">
            <i
              class="pi pi-inbox"
              style="font-size: 1.5rem; display: block; margin-bottom: 6px; opacity: 0.4"
            />
            Ketik nama obat lalu klik Cari
          </div>
        </template>

        <Column header="#" style="width: 38px; text-align: center">
          <template #body="{ index }">
            <span style="font-size: 11px; color: var(--p-text-muted-color)">{{ index + 1 }}</span>
          </template>
        </Column>
        <Column header="BARCODE" style="width: 80px">
          <template #body="{ data }">
            <span style="font-family: monospace; font-size: 11px; font-weight: 600">{{
              data.BARCODE
            }}</span>
          </template>
        </Column>
        <Column header="SUB BARCODE" style="width: 100px">
          <template #body="{ data }">
            <span
              style="font-family: monospace; font-size: 11px; color: var(--p-text-muted-color)"
              >{{ data.SUB_BARCODE }}</span
            >
          </template>
        </Column>
        <Column header="NAMA BARANG" style="min-width: 200px">
          <template #body="{ data }">
            <span style="font-weight: 600; font-size: 12px">{{ data.NAMA }}</span>
          </template>
        </Column>
        <Column header="BATCH" style="width: 130px">
          <template #body="{ data }">
            <span
              style="font-family: monospace; font-size: 11px; color: var(--p-text-muted-color)"
              >{{ data.BATCH_NUMBER || '—' }}</span
            >
          </template>
        </Column>
        <Column header="TGL EXP" style="width: 100px; text-align: center">
          <template #body="{ data }">
            <span :class="expClass(data.TGL_EXPIRED_DT)" style="font-size: 11px">{{
              data.TGL_EXPIRED_DT || '—'
            }}</span>
          </template>
        </Column>
        <Column header="HARGA JUAL" style="width: 110px; text-align: right">
          <template #body="{ data }">
            <span style="font-size: 12px; font-weight: 600">{{
              formatNumber(data.HARGAJUAL)
            }}</span>
          </template>
        </Column>
        <Column header="QTY" field="QUNATITY" sortable style="width: 72px; text-align: right">
          <template #body="{ data }">
            <span
              :style="{
                fontWeight: 700,
                fontSize: '12px',
                color: data.QUNATITY > 0 ? 'var(--p-green-600)' : 'var(--p-red-600)',
              }"
            >
              {{ data.QUNATITY }}
            </span>
          </template>
        </Column>
        <Column header="SATUAN" style="width: 72px; text-align: center">
          <template #body="{ data }">
            <Tag :value="data.SATUAN" severity="secondary" style="font-size: 10px" />
          </template>
        </Column>
      </DataTable>

      <!-- Footer konfirmasi CHG -->
      <div v-if="selectedChgItem" class="variasi-footer">
        <div class="variasi-sel-info">
          <span class="variasi-sel-name">{{ selectedChgItem.NAMA }}</span>
          <span
            >Batch: <b>{{ selectedChgItem.BATCH_NUMBER || '—' }}</b></span
          >
          <span
            >Exp:
            <span :class="expClass(selectedChgItem.TGL_EXPIRED_DT)">{{
              selectedChgItem.TGL_EXPIRED_DT || '—'
            }}</span></span
          >
          <span
            >Stok:
            <b
              :style="{
                color: selectedChgItem.QUNATITY > 0 ? 'var(--p-green-600)' : 'var(--p-red-600)',
              }"
              >{{ selectedChgItem.QUNATITY }}</b
            ></span
          >
          <span
            >Harga: <b>{{ formatNumber(selectedChgItem.HARGAJUAL) }}</b></span
          >
        </div>
        <div class="variasi-qty-confirm">
          <div class="chg-qty-ref">
            <span class="chg-qty-ref-lbl">QTY REQ</span>
            <span class="chg-qty-ref-val">{{ parseFloat(selectedChgRow?.QTY_REQ) || 0 }}</span>
          </div>
          <i class="pi pi-arrow-right" style="color: var(--p-text-muted-color); font-size: 12px" />
          <label style="font-size: 12px; font-weight: 600; white-space: nowrap">QTY APP:</label>
          <InputNumber
            ref="chgQtyRef"
            v-model="chgQty"
            :min="0"
            :max="selectedChgItem.QUNATITY > 0 ? selectedChgItem.QUNATITY : undefined"
            :disabled="selectedChgItem.QUNATITY <= 0"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            locale="id-ID"
            class="variasi-qty-input"
            @keydown.enter="konfirmasiChg"
          />
          <Button
            icon="pi pi-check"
            label="Ganti Item"
            severity="success"
            size="small"
            :disabled="
              chgQty === null ||
              chgQty === undefined ||
              chgQty < 0 ||
              (chgQty <= 0 && selectedChgItem.QUNATITY > 0)
            "
            @click="konfirmasiChg"
          />
        </div>
      </div>
    </Dialog>

    <!-- ══ LEAVE DIALOG ══ -->
    <ResepActionDialog
      v-model:visible="showLeaveDialog"
      :resep="resepDataForDialog"
      :actions="['selesai', 'tutup']"
      @action="handleLeaveAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResepActionDialog from './ResepActionDialog.vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'
import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Skeleton from 'primevue/skeleton'
import Dialog from 'primevue/dialog'

const route = useRoute()
const router = useRouter()
const isPreview = computed(() => route.query.preview === '1')
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const loadingSimpan = ref(false)
const errorMsg = ref('')
const items = ref([])
const catatanKesan = ref(null)

// ── Responsive ──
const windowWidth = ref(window.innerWidth)
const onResize = () => {
  windowWidth.value = window.innerWidth
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const tableScrollHeight = computed(() =>
  windowWidth.value < 768 ? 'calc(100vh - 440px)' : 'calc(100vh - 340px)',
)

// ── Variasi Barang ──
const showVariasiDialog = ref(false)
const loadingVariasi = ref(false)
const variasi = ref([])
const selectedBarang = ref(null)
const selectedVariasi = ref(null)
const variasiQty = ref(null)
const variasiQtyRef = ref(null)

// ── CHG (Ganti Item) ──
const showChgDialog = ref(false)
const loadingChg = ref(false)
const chgResults = ref([])
const selectedChgRow = ref(null)
const selectedChgItem = ref(null)
const chgQty = ref(null)
const chgQtyRef = ref(null)
const chgSearchNama = ref('')

// Header diambil dari baris pertama (field header sama di semua baris)
const header = computed(() => items.value[0] ?? null)

/* ── Format helpers ── */
const formatRupiah = (val) => {
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)
}

const formatNumber = (val) => {
  const n = parseFloat(val)
  if (isNaN(n) || n === 0) return '0'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(n)
}

// ── Expandable rows untuk racikan groups ──
const expandedRows = ref({})

// Hanya parent + normal yang masuk ke DataTable utama; child ada di expansion slot
const displayRows = computed(() => items.value.filter((i) => i._rowType !== 'child'))

// Total harga dari seluruh bahan racikan (child rows) milik satu parent
const parentSubtotal = (parent) =>
  (parent._children || []).reduce((s, c) => s + (parseFloat(c.TOTALAMOUNT) || 0), 0)

const toggleExpand = (data) => {
  const key = data.ITEMSEQNO
  const next = { ...expandedRows.value }
  if (next[key]) delete next[key]
  else next[key] = true
  expandedRows.value = next
}

const itemRowClass = (data) => {
  const classes = []
  if (data._rowType === 'parent') classes.push('row-racikan-parent')
  if (isSubstituted(data)) classes.push('item-row-substituted')
  if (data._rowType !== 'parent') {
    const given = parseFloat(data.QTY)
    const req = parseFloat(data.QTY_REQ)
    if (given <= 0) classes.push('item-row-zero')
    else if (given < req) classes.push('item-row-partial')
    else classes.push('item-row-full')
  }
  return classes.join(' ')
}

const childRowClass = (data) => {
  const given = parseFloat(data.QTY)
  const req = parseFloat(data.QTY_REQ)
  if (given <= 0) return 'item-row-zero'
  if (given < req) return 'item-row-partial'
  return 'item-row-full'
}

const qtyAppClass = (data) => {
  const given = parseFloat(data.QTY)
  const req = parseFloat(data.QTY_REQ)
  if (given <= 0) return 'qty-zero'
  if (given < req) return 'qty-partial'
  return 'qty-full'
}

/* ── Status label ── */
const statusProgressLabel = computed(() => {
  const s = header.value?.STATUS_PROGRESS
  if (s === 'C') return 'Selesai'
  if (s === 'P') return 'Diproses'
  if (!s || s === '') return 'Belum Diproses'
  return s
})
const statusProgressSeverity = computed(() => {
  const s = header.value?.STATUS_PROGRESS
  if (s === 'C') return 'success'
  if (s === 'P') return 'warn'
  return 'danger'
})

// Parent row tidak punya QTY sendiri yang berarti; hitung dari child + normal saja
const itemBelumDiberikan = computed(
  () => items.value.filter((r) => r._rowType !== 'parent' && parseFloat(r.QTY) <= 0).length,
)

// Subtotal hanya dari child + normal (parent tidak double-count)
const liveSubtotal = computed(() =>
  items.value
    .filter((r) => r._rowType !== 'parent')
    .reduce((sum, r) => sum + (parseFloat(r.TOTALAMOUNT) || 0), 0),
)
const liveGrandTotal = computed(() => {
  const potongan = parseFloat(header.value?.POTONGAN || 0)
  const tax = parseFloat(header.value?.TAXAMOUNT || 0)
  return liveSubtotal.value - potongan + tax
})

/* ── Variasi Barang ── */
const expClass = (dateStr) => {
  if (!dateStr) return ''
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  if (days < 0) return 'exp-kadaluarsa'
  if (days < 90) return 'exp-soon'
  return 'exp-ok'
}

const variasiRowClass = (data) => {
  const classes = []
  if (data.QUNATITY <= 0) classes.push('variasi-row-habis')
  if (selectedVariasi.value === data) classes.push('variasi-row-selected')
  return classes.join(' ')
}
const chgRowClass = (data) => {
  const classes = []
  if (data.QUNATITY <= 0) classes.push('variasi-row-habis-dim')
  if (selectedChgItem.value === data) classes.push('variasi-row-selected')
  return classes.join(' ')
}

const isSubstituted = (row) => !!(row.NAMABARANG_REQ && row.NAMABARANG_REQ !== row.NAMABARANG)

const onVariasiRowSelect = (event) => {
  variasiQty.value = null
  nextTick(() => {
    variasiQtyRef.value?.$el?.querySelector('input')?.focus()
  })
}

const openVariasiDialog = async (rowData) => {
  selectedBarang.value = rowData
  variasi.value = []
  selectedVariasi.value = null
  variasiQty.value = null
  showVariasiDialog.value = true
  loadingVariasi.value = true
  try {
    const url = `${configStore.apiApotikUrl}/index.php/api/barang/getdatabarang_v31`
    const res = await axios.post(url, {
      mode: 3,
      id_client: id_client.value,
      tahun: null,
      barcode: rowData.BARCODE,
      lokasi: id_lokasi.value,
      breakdown: 1,
      nama: '',
      kategori: null,
      param1: null,
      param2: null,
      filter_qty: 0,
      kode_poli_ruang: null,
    })
    variasi.value = (res.data?.response || []).map(({ DETAILS, ...rest }) => rest)
    // Jika baris sudah pernah diisi, auto-select variasi yang cocok & isi ulang qty
    if (rowData.NAMABARANG && parseFloat(rowData.QTY) > 0) {
      const match = variasi.value.find((v) => v.NAMA === rowData.NAMABARANG)
      if (match) {
        selectedVariasi.value = match
        variasiQty.value = parseFloat(rowData.QTY)
        nextTick(() => {
          variasiQtyRef.value?.$el?.querySelector('input')?.focus()
        })
      }
    }
  } catch (err) {
    console.error('fetchVariasi:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat variasi barang',
      life: 4000,
    })
  } finally {
    loadingVariasi.value = false
  }
}

const pilihVariasi = () => {
  const variasiRow = selectedVariasi.value
  const qty = variasiQty.value ?? 0
  if (!variasiRow) return
  if (qty <= 0) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: 'QTY harus lebih dari 0',
      life: 3000,
    })
    return
  }
  if (qty > variasiRow.QUNATITY) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: `QTY melebihi stok tersedia (${variasiRow.QUNATITY})`,
      life: 3000,
    })
    return
  }

  const row = selectedBarang.value

  // Bangun chosenList (saat ini single-selection; siap dikembangkan multi)
  const chosenList = [{ ...variasiRow, QTY_APROVED: qty, ITEM_SEQ: row.ITEMSEQNO }]

  // Akumulasi QTY dan tentukan HARGA
  let tempQty = 0
  for (const item of chosenList) {
    tempQty += item.QTY_APROVED

    // Fallback: jika HARGAJUAL = 0 pakai HARGA
    if (!item.HARGAJUAL || item.HARGAJUAL === 0) {
      item.HARGAJUAL = item.HARGA
    }

    // Update HARGABELI di daftar item utama untuk BARCODE yang sama
    for (const mainItem of items.value) {
      if (mainItem.BARCODE === item.BARCODE) {
        mainItem.HARGA = item.HARGA
      }
    }

    // Set HARGA di baris yang dipilih (loop terakhir yang berlaku, = satu item)
    row.HARGA = item.HARGAJUAL
  }

  // Set QTY dan SUBTOTAL
  row.QTY = tempQty
  row.TOTALAMOUNT = tempQty * (row.HARGA || 0)

  // Nama item yang diapprove
  row.NAMABARANG = variasiRow.NAMA

  // SUB_BARCODE_APP hanya di-set jika single item
  if (chosenList.length === 1) {
    row.SUB_BARCODE_APP = chosenList[0].SUB_BARCODE
  }

  // Simpan JSON variasi ke baris dengan format yang dibutuhkan server
  row.JSON_FILE = JSON.stringify(
    chosenList.map((item) => ({
      SUB_BARCODE: item.SUB_BARCODE ?? '',
      BARCODE: item.BARCODE ?? '',
      QTY_APROVED: item.QTY_APROVED,
      BATCH_NUMBER: item.BATCH_NUMBER ?? '',
      TGL_EXPIRED: item.TGL_EXPIRED_DT ?? '',
      HARGA: item.HARGA ?? 0,
      HARGAJUAL: item.HARGAJUAL ?? 0,
      NAMA_ITEM_APPROVEVAL: item.NAMA ?? '',
      SATUAN: item.SATUAN ?? '',
      COPY_R: 0,
      ITEM_SEQ: item.ITEM_SEQ,
      RECEIPT_NO: header.value?.RECEIPT_NO ?? '',
    })),
  )

  // Tandai baris telah berubah
  row.CHANGING_ITEM = 1

  showVariasiDialog.value = false
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: `${variasiRow.NAMA} — Qty: ${tempQty}`,
    life: 3000,
  })
}

/* ── CHG: Ganti Item ── */
const openChgDialog = (rowData) => {
  selectedChgRow.value = rowData
  chgResults.value = []
  selectedChgItem.value = null
  chgQty.value = parseFloat(rowData.QTY_REQ) || null
  chgSearchNama.value = rowData.NAMABARANG || ''
  showChgDialog.value = true
  if (chgSearchNama.value) searchChgItems()
}

const searchChgItems = async () => {
  if (!chgSearchNama.value?.trim()) return
  loadingChg.value = true
  chgResults.value = []
  selectedChgItem.value = null
  try {
    const url = `${configStore.apiApotikUrl}/index.php/api/barang/getdatabarang_v31`
    const res = await axios.post(url, {
      mode: 111,
      id_client: id_client.value,
      tahun: null,
      barcode: '00000',
      lokasi: id_lokasi.value,
      breakdown: 1,
      nama: chgSearchNama.value.trim(),
      kategori: null,
      param1: null,
      param2: null,
      filter_qty: 0,
      kode_poli_ruang: null,
    })
    chgResults.value = (res.data?.response || []).map(({ DETAILS, ...rest }) => rest)
  } catch (err) {
    console.error('searchChgItems:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data item', life: 4000 })
  } finally {
    loadingChg.value = false
  }
}

const onChgRowSelect = (event) => {
  if (event.data.QUNATITY <= 0) {
    chgQty.value = 0
    toast.add({
      severity: 'warn',
      summary: 'Stok Habis',
      detail:
        'Stok barang ini kosong — item tetap bisa dipilih untuk copy resep, QTY tidak dapat diubah',
      life: 3500,
    })
    return
  }
  nextTick(() => chgQtyRef.value?.$el?.querySelector('input')?.focus())
}

const konfirmasiChg = () => {
  const newItem = selectedChgItem.value
  const qty = chgQty.value ?? 0
  if (!newItem) return
  if (qty < 0) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: 'QTY tidak boleh negatif',
      life: 3000,
    })
    return
  }
  if (newItem.QUNATITY > 0 && qty <= 0) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: 'QTY harus lebih dari 0',
      life: 3000,
    })
    return
  }
  if (newItem.QUNATITY > 0 && qty > newItem.QUNATITY) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: `QTY melebihi stok (${newItem.QUNATITY})`,
      life: 3000,
    })
    return
  }

  const row = selectedChgRow.value
  const harga = newItem.HARGAJUAL || newItem.HARGA || 0

  // Simpan nilai asli (REQ) sebelum diganti, agar ITEM REQ tidak berubah
  row.BARCODE_REQ = row.BARCODE_REQ || row.BARCODE
  row.NAMABARANG_REQ = row.NAMABARANG_REQ || row.NAMABARANG

  // Update ITEM APP — BARCODE_REQ & NAMABARANG_REQ tidak disentuh
  row.BARCODE = newItem.BARCODE
  row.NAMABARANG = newItem.NAMA
  row.HARGA = harga
  row.SUB_BARCODE_APP = newItem.SUB_BARCODE
  row.QTY = qty
  row.TOTALAMOUNT = qty * harga
  row.SATUAN = newItem.SATUAN
  row.CHANGING_ITEM = 1
  row.JSON_FILE = JSON.stringify([
    {
      SUB_BARCODE: newItem.SUB_BARCODE ?? '',
      BARCODE: newItem.BARCODE ?? '',
      QTY_APROVED: qty,
      BATCH_NUMBER: newItem.BATCH_NUMBER ?? '',
      TGL_EXPIRED: newItem.TGL_EXPIRED_DT ?? '',
      HARGA: newItem.HARGA ?? 0,
      HARGAJUAL: harga,
      NAMA_ITEM_APPROVEVAL: newItem.NAMA ?? '',
      SATUAN: newItem.SATUAN ?? '',
      COPY_R: 0,
      ITEM_SEQ: row.ITEMSEQNO,
      RECEIPT_NO: header.value?.RECEIPT_NO ?? '',
    },
  ])

  showChgDialog.value = false 
}

/* ── Cetak Resep ── */
const bukaCetakResep = () => {
  const resolved = router.resolve({
    name: 'CetakResepView',
    params: { trans: route.params.trans },
    query: {
      nomr: route.query.nomr,
      noregister: route.query.noregister,
      nama: route.query.nama,
      poli: route.query.poli,
      tanggal: route.query.tanggal,
    },
  })
  window.open(resolved.href, '_blank')
}

const bukaCetakResepCopy = () => {
  const resolved = router.resolve({
    name: 'CetakResepView',
    params: { trans: route.params.trans },
    query: {
      nomr: route.query.nomr,
      noregister: route.query.noregister,
      nama: route.query.nama,
      poli: route.query.poli,
      tanggal: route.query.tanggal,
      mode: 'copy',
    },
  })
  window.open(resolved.href, '_blank')
}

const bukaCetakEtiket = () => {
  const resolved = router.resolve({
    name: 'CetakEtiketView',
    params: { trans: route.params.trans },
    query: {
      nomr: route.query.nomr,
      noregister: route.query.noregister,
      nama: route.query.nama,
      poli: route.query.poli,
      tanggal: route.query.tanggal,
    },
  })
  window.open(resolved.href, '_blank')
}

const bukaCetakEtiketItem = (rowData) => {
  const resolved = router.resolve({
    name: 'CetakEtiketView',
    params: { trans: route.params.trans },
    query: {
      nomr: route.query.nomr,
      noregister: route.query.noregister,
      nama: route.query.nama,
      poli: route.query.poli,
      tanggal: route.query.tanggal,
      itemseq: rowData.ITEMSEQNO,
    },
  })
  window.open(resolved.href, '_blank')
}

/* ── Kartu Catatan Obat ── */
const bukaKCO = () => {
  const resolved = router.resolve({
    name: 'KartuCatatanObatView',
    query: {
      noreg: route.query.noregister,
      nama: route.query.nama,
      ruangan: route.query.poli,
    },
  })
  window.open(resolved.href, '_blank')
}

const PrintRekamMedisEl = () => {
  const routeData = router.resolve({
    name: 'RMEViewer',
    query: { noreg: route.query.noregister },
  })
  window.open(routeData.href, '_blank')
}
/* ── Simpan Resep ── */
const simpanResep = async () => {
  const h = header.value
  if (!h) return

  const adaPerubahan = items.value.some((item) => Number(item.CHANGING_ITEM) === 1)
  if (!adaPerubahan) {
    toast.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Tidak ada perubahan apapun',
      life: 3000,
    })
    return
  }

  const payload = {
    metadata: { Message: 'request' },
    header: {
      RECEIPT_NO: h.RECEIPT_NO,
      MEMBERSHIP_ID: h.MEMBERSHIP_ID,
      SALESNO: h.SALESNO ?? 0,
      IDUSER: h.IDUSER,
      TANGGAL: h.TANGGAL,
      IDPAYEMENT: h.IDPAYEMENT ?? 5,
      NOTE: h.NOTE,
      SUBTOTAL: liveSubtotal.value,
      TAXPERCENT: parseFloat(h.TAXPERCENT) || 0,
      TAXAMOUNT: parseFloat(h.TAXAMOUNT) || 0,
      TOTALBAYAR: parseFloat(h.TOTALBAYAR) || 0,
      POTONGAN: parseFloat(h.POTONGAN) || 0,
      MODE: h.MODE ?? 'REG',
      IDCLIENT: id_client.value,
      GRANDTOTAL: liveGrandTotal.value,
      KEMBALIAN: parseFloat(h.KEMBALIAN) || 0,
      ID_LOKASI: id_lokasi.value,
      ROOM_TABLE_NUMBER: h.ROOM_TABLE_NUMBER ?? 0,
      RESV_ID: h.RESV_ID ?? 0,
      NO_REGISTER: h.NOREGISTER,
      SERVER_ID: h.SERVER_ID ?? 0,
      POLI_RUANG: h.POLI_RUANG ?? route.query.poli ?? null,
      DPJP: h.DPJP ?? null,
      SERVER_NAME: h.SERVER_NAME ?? null,
      STATUS_PROGRESS: h.STATUS_PROGRESS,
      OBAT_OBATAN: h.OBAT_OBATAN ?? 1,
      TGL_SELESAI: h.TGL_SELESAI ?? '',
      JENIS_RESEP: h.JENIS_RESEP ?? null,
      CARAPAKAI_RACIK: h.CARAPAKAI_RACIK ?? null,
      JML_RACIK: h.JML_RACIK ?? 0,
      BENTUK_RACIK: h.BENTUK_RACIK ?? null,
      details: items.value.map((item) => ({
        ID_BARANG: item.BARCODE,
        BARCODE: item.BARCODE,
        BARCODE_REQ: item.BARCODE_REQ || item.BARCODE,
        SUB_BARCODE_APP: item.SUB_BARCODE_APP ?? '',
        RECEIPT_NO: h.RECEIPT_NO,
        NAMA: item.NAMABARANG,
        NAMABARANG_REQ: item.NAMABARANG_REQ || item.NAMABARANG,
        JENIS: item.JENIS ?? null,
        QTY: parseFloat(item.QTY) || 0,
        QTY_REQ: parseFloat(item.QTY_REQ) || 0,
        QTY_COPY: parseFloat(item.QTY_COPY) || 0,
        DISCOUNT: parseFloat(item.DISCOUNT) || 0,
        HARGABELI: parseFloat(item.HARGABELI) || 0,
        HARGA: parseFloat(item.HARGA) || 0,
        EST_HARGA_COPY: parseFloat(item.EST_HARGA_COPY) || 0,
        POTONGSTOCK: item.POTONGSTOCK ?? 0,
        TOTAL_ITEM: parseFloat(item.TOTAL_ITEM) || 0,
        MEREK: item.MEREK ?? item.SATUAN ?? '',
        TOTALAMOUNT: 0.0,
        FLAG: item.FLAG ?? 'EXISTING LINE',
        CHANGING_ITEM: item.CHANGING_ITEM ?? 0,
        TANGGAL_TRANS: item.TANGGAL_TRANS ?? h.TANGGAL,
        ITEMSEQNO: item.ITEMSEQNO,
        SUBITEMSEQNO: item.SUBITEMSEQNO ?? 0,
        STATUS: item.STATUS ?? '',
        REMARK_ITEM: item.REMARK_ITEM ?? '',
        AS_PARENT: item.AS_PARENT ?? 0,
        STATUS_PROGRESS: item.STATUS_PROGRESS ?? '',
        ID_LOKASI: id_lokasi.value,
        JSON_FILE: item.JSON_FILE ?? '',
        SAVED_ITEM: item.SAVED_ITEM ?? 1,
        KETERANGAN: item.KETERANGAN ?? '',
        SUB_DETAILS_RACIKAN: item.SUB_DETAILS_RACIKAN ?? null,
      })),
    },
  }

  loadingSimpan.value = true
  try {
    const url = `${configStore.apiApotikUrl}/index.php/api/sales/update_sales_v4`
    const res = await axios.post(url, payload)

    const d = res.data
    const code = d?.metadata?.code?.toString() || ''
    const status = (d?.status || d?.Status || d?.MESSAGE || d?.message || '')
      .toString()
      .toLowerCase()
    const isSuccess =
      code === '200' ||
      status === 'success' ||
      status === '1' ||
      status === 'ok' ||
      d?.response === 'success'

    if (isSuccess) {
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: 'Data resep berhasil disimpan',
        life: 3000,
      })
      await fetchBill()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Server: ' + (status || '?'),
        detail: d?.message || d?.Message || d?.keterangan || JSON.stringify(d).slice(0, 120),
        life: 8000,
      })
    }
  } catch (err) {
    console.error('simpanResep:', err)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: err?.response?.data?.message || err?.message || 'Terjadi kesalahan saat menyimpan',
      life: 4000,
    })
  } finally {
    loadingSimpan.value = false
  }
}

/* ── Fetch ── */
const fetchBill = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    items.value = []
    catatanKesan.value = null

    const tgl = route.query.tanggal || new Date().toISOString().split('T')[0]
    const payload = {
      IDCLIENT: id_client.value,
      RECEIPT_NO: route.params.trans,
      MODE: 'RCPT',
      TGLMAX: tgl,
      TGLMIN: tgl,
      MEMBERSHIP: route.query.nomr || null,
      NOREGIRTER_KLINIK: route.query.noregister || null,
    }

    const url = `${configStore.apiApotikUrl}/index.php/api/sales/billv3`
    const res = await axios.post(url, payload)
    const data = res.data

    if (Array.isArray(data.response) && data.response.length > 0) {
      const allItems = data.response.map((item) => {
        const _barcode = String(item.BARCODE ?? '').trim()
        const _asParent = String(item.AS_PARENT ?? '0')
        const _jenisR = item.JENIS_R ?? ''

        let _rowType = 'normal'
        if (_jenisR === 'R/' && _barcode === '00000' && _asParent === '1') _rowType = 'parent'
        else if (_jenisR === '' && _asParent === '0') _rowType = 'child'

        return {
          ...item,
          QTY_COPY: parseFloat(item.QTY_COPY) || 0,
          EST_HARGA_COPY: parseFloat(item.EST_HARGA_COPY) || 0,
          _rowType,
          _isRacikan: _rowType === 'parent' || _rowType === 'child',
          _children: [], // diisi di bawah untuk parent rows
        }
      })

      // Bangun map parent berdasarkan ITEMSEQNO
      const parentMap = {}
      allItems.forEach((item) => {
        if (item._rowType === 'parent') parentMap[String(item.ITEMSEQNO)] = item
      })

      // Tautkan child ke parent via SUBITEMSEQNO (DB FK eksplisit)
      // Fallback: jika SUBITEMSEQNO=0 (data lama), gunakan kedekatan urutan
      let lastParent = null
      allItems.forEach((item) => {
        if (item._rowType === 'parent') {
          lastParent = item
        } else if (item._rowType === 'child') {
          const byFK = parentMap[String(item.SUBITEMSEQNO || 0)]
          if (byFK) byFK._children.push(item)
          else if (lastParent) lastParent._children.push(item)
        }
      })

      items.value = allItems
      catatanKesan.value = data.catatan_kesan ?? null

      // Auto-expand semua racikan group
      const autoExpand = {}
      allItems.forEach((item) => {
        if (item._rowType === 'parent') autoExpand[item.ITEMSEQNO] = true
      })
      expandedRows.value = autoExpand
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: data?.metadata?.message ?? 'Data kosong',
        life: 4000,
      })
    }
  } catch (err) {
    console.error('fetchBill:', err)
    errorMsg.value = err?.response?.data?.metadata?.message ?? err.message ?? 'Terjadi kesalahan'
    toast.add({ severity: 'error', summary: 'Error', detail: errorMsg.value, life: 5000 })
  } finally {
    loading.value = false
  }
}

/* ── Leave Dialog ── */
const showLeaveDialog = ref(false)

const resepDataForDialog = computed(() => ({
  TRANS: route.params.trans,
  NOMR: route.query.nomr || header.value?.MEMBERSHIP_ID || '',
  NAMA: route.query.nama || header.value?.NOTE || '',
  NOREGISTER: route.query.noregister || header.value?.NOREGISTER || '',
  POLI_RUANG: route.query.poli || header.value?.POLI_RUANG || '',
  STATUS_PROGRESS: header.value?.STATUS_PROGRESS || '',
  JAM_KIRIM_RESEP: header.value?.JAM_KIRIM_RESEP || null,
  SELESAI: header.value?.SELESAI || null,
  DPJP: header.value?.DPJP || null,
  JENISRAWAT: header.value?.JENISRAWAT || null,
}))

const closeTab = () => {
  if (isPreview.value || header.value?.STATUS_PROGRESS === 'C' || !header.value) {
    window.close()
    return
  }
  showLeaveDialog.value = true
}

const handleLeaveAction = async ({ action, timestamp }) => {
  if (action === 'tutup') {
    window.close()
    return
  }
  if (action === 'selesai') {
    try {
      loading.value = true
      const url = configStore.apiApotikUrl
      const res = await axios.post(`${url}/index.php/api/sales/update_status_penunjang`, {
        trans: route.params.trans,
        status: 'C',
        jam: timestamp,
        id_client: id_client.value,
      })
      const code = res.data?.metadata?.code
      if (String(code) === '200') {
        window.close()
      } else {
        toast.add({
          severity: 'warn',
          summary: 'Gagal Update',
          detail: res.data?.metadata?.message || 'Gagal menandai resep selesai',
          life: 4000,
        })
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal update status resep',
        life: 3000,
      })
    } finally {
      loading.value = false
    }
  }
}

/* ── Update Keterangan Item ── */
const savedItems = reactive({})

const updateKeterangan = async (data) => {
  try {
    const url = `${configStore.apiApotikUrl}/index.php/api/sales/updateKeterangan`
    const res = await axios.post(url, {
      KETERANGAN: data.KETERANGAN ?? '',
      ITEMSEQNO: data.ITEMSEQNO,
      RECEIPT_NO: header.value?.RECEIPT_NO ?? route.params.trans,
    })
    if (String(res.data?.metadata?.code) === '200') {
      savedItems[data.ITEMSEQNO] = true
      setTimeout(() => {
        savedItems[data.ITEMSEQNO] = false
      }, 2000)
    }
  } catch (err) {
    console.error('updateKeterangan:', err)
  }
}

/* ── Riwayat Resep ── */
const listResep = ref([])
const loadingListResep = ref(false)

const fetchListResep = async () => {
  if (!route.query.noregister || !id_client.value) return
  loadingListResep.value = true
  try {
    const url = `${configStore.apiApotikUrl}/index.php/api/sales/get_listresep_perpasien/${id_client.value}/${route.query.noregister}`
    const res = await axios.get(url)

    listResep.value = res.data?.response || []
  } catch (err) {
    console.error('fetchListResep:', err)
  } finally {
    loadingListResep.value = false
  }
}

const navigateToResep = (r) => {
  if (r.RECEIPT_NO === route.params.trans) return
  router.push({ name: route.name, params: { trans: r.RECEIPT_NO }, query: route.query })
}

const formatTglShort = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr.replace(' ', 'T'))
  if (isNaN(d)) return dateStr
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm} ${hh}:${min}`
}

// Reload data resep ketika navigasi antar resep (params berubah, komponen tidak re-mount)
watch(
  () => route.params.trans,
  (val) => {
    if (val) fetchBill()
  },
)

onMounted(() => {
  fetchBill()
  fetchListResep()
})
</script>

<style scoped>
/* ── Patient card ── */
.patient-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 2px;
  padding: 14px 8px;
  box-shadow: var(--p-shadow-1, 0 1px 3px rgba(0, 0, 0, 0.06));
}
.patient-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--p-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.patient-info {
  flex: 1;
  min-width: 0;
}
.patient-name {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 4px;
}
.patient-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}
.patient-trans {
  text-align: right;
  flex-shrink: 0;
}
.trans-lbl {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.trans-val {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--p-primary-color);
}

/* ── Receipt header bar ── */
.receipt-header-bar {
  display: flex;
  gap: 0;
  flex-wrap: wrap;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  overflow: hidden;
}
.rh-item {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 14px;
  border-right: 1px solid var(--p-surface-200);
}
.rh-item:last-child {
  border-right: none;
}
.rh-lbl {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rh-val {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-text-color);
}
.mono {
  font-family: monospace;
}

/* ── Totals ── */
.bill-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  padding: 10px 14px 4px;
  border-top: 1px solid var(--p-surface-200);
  margin-top: 4px;
}
.bt-row {
  display: flex;
  gap: 48px;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  min-width: 280px;
  justify-content: space-between;
}
.bt-grand {
  font-weight: 800;
  font-size: 1rem;
  color: var(--p-text-color);
  padding-top: 6px;
  border-top: 2px solid var(--p-surface-300);
  margin-top: 2px;
}

/* ── Skeleton table ── */
.skel-table {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  overflow: hidden;
}
.skel-thead {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  background: var(--p-surface-100);
  border-bottom: 1px solid var(--p-surface-200);
}
.skel-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 5px 12px;
  border-bottom: 1px solid var(--p-surface-100);
}

/* ── Action bar ── */
.action-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  margin: 0 -12px -12px -12px;
}
.action-bar-left {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.action-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.grand-total-lbl {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.grand-total-val {
  font-size: 1.1rem;
  font-weight: 800;
  font-family: monospace;
  color: var(--p-text-color);
}
:deep(.btn-simpan.p-button),
:deep(.btn-cetak.p-button),
:deep(.btn-selesai.p-button) {
  width: 140px;
  height: 34px;
  font-size: 0.82rem;
  font-weight: 700;
  justify-content: flex-start;
  padding: 0 12px;
  border-radius: 5px;
}
:deep(.btn-simpan.p-button) {
  background: var(--p-green-600);
  border-color: var(--p-green-600);
  color: #fff;
}
:deep(.btn-simpan.p-button:hover) {
  background: var(--p-green-700);
  border-color: var(--p-green-700);
}
:deep(.btn-cetak.p-button) {
  background: var(--p-sky-500);
  border-color: var(--p-sky-500);
  color: #fff;
}
:deep(.btn-cetak.p-button:hover) {
  background: var(--p-sky-600);
  border-color: var(--p-sky-600);
}
:deep(.btn-selesai.p-button) {
  background: var(--p-orange-500);
  border-color: var(--p-orange-500);
  color: #fff;
}
:deep(.btn-selesai.p-button:hover) {
  background: var(--p-orange-600);
  border-color: var(--p-orange-600);
}

/* ── Riwayat Resep Bar ── */
.riwayat-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  padding: 6px 10px;
  overflow: hidden;
}
.rrb-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}
.rrb-count {
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
}
.rrb-scroll {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
}
.rrb-scroll::-webkit-scrollbar {
  display: none;
}

.rrb-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid var(--p-surface-300);
  border-radius: 20px;
  background: var(--p-surface-50);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
  font-size: 11px;
  color: var(--p-text-muted-color);
}
.rrb-chip:hover {
  border-color: var(--p-primary-300);
  background: var(--p-primary-50);
}

.rrb-chip.rrb-active {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
}
.rrb-chip.rrb-selesai:not(.rrb-active) {
  border-color: var(--p-green-300);
  color: var(--p-green-700);
}
.rrb-chip.rrb-proses:not(.rrb-active) {
  border-color: var(--p-amber-300);
  color: var(--p-amber-700);
}

.rrb-idx {
  font-weight: 700;
  font-size: 10px;
}
.rrb-tgl {
  font-size: 10px;
  font-family: monospace;
}

/* ── State box ── */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
  text-align: center;
}

/* ── DataTable ── */
:deep(.p-datatable-thead > tr > th) {
  padding: 5px 8px;
  white-space: nowrap;
  background: var(--p-surface-100);

  text-transform: uppercase;
  letter-spacing: 0.03em;
}
:deep(.p-datatable-tbody > tr > td) {
  padding: 0 6px;
  vertical-align: middle;
  font-size: 0.75rem;
  white-space: nowrap;
  line-height: 1;
  background: var(--p-surface-0);
  height: 16px !important;
  max-height: 16px !important;
  overflow: hidden;
}
:deep(.p-datatable-tbody > tr) {
  height: 16px !important;
}

/* ── Kolom ITEM REQ (ke-5) pink, ITEM APP (ke-6) hijau ── */
:deep(.p-datatable-thead > tr > th:nth-child(5)),
:deep(.p-datatable-tbody > tr > td:nth-child(5)) {
  background: var(--p-red-100) !important;
}
:deep(.p-datatable-thead > tr > th:nth-child(6)),
:deep(.p-datatable-tbody > tr > td:nth-child(6)) {
  background: var(--p-green-100) !important;
}

/* ── Truncate teks dalam cell ── */
/* ── Racikan row styles ── */
:deep(tr.row-racikan-parent td) {
  background: var(--p-primary-50) !important;
  border-top: 1px solid var(--p-primary-200) !important;
  border-bottom: 1px solid var(--p-primary-100) !important;
}
:deep(tr.row-racikan-child td) {
  background: var(--p-surface-50) !important;
  border-left: 2px solid var(--p-primary-300);
}
:deep(tr.row-racikan-child:last-of-type td) {
  border-bottom: 1px solid var(--p-primary-200) !important;
}

/* ── Baris yang sudah disubstitusi (CHG) ── */
:deep(tr.item-row-substituted td) {
  background: var(--p-amber-50) !important;
}
:deep(tr.item-row-substituted > td:first-child) {
  box-shadow: inset 3px 0 0 var(--p-amber-400);
}

/* ── Expansion racikan ── */
.racikan-expansion {
  padding: 8px 12px 12px 24px;
  background: var(--p-primary-50);
  border-left: 3px solid var(--p-primary-300);
}
.racikan-exp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 8px;
  flex-wrap: wrap;
}
:deep(.racikan-child-table .p-datatable-thead > tr > th) {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--p-primary-100);
  white-space: nowrap;
}
:deep(.racikan-child-table .p-datatable-tbody > tr > td) {
  padding: 3px 8px;
  font-size: 11px;
  vertical-align: middle;
  background: var(--p-surface-0);
}
:deep(.racikan-child-table .p-datatable-tbody > tr.item-row-zero > td) {
  background: var(--p-red-50) !important;
}
:deep(.racikan-child-table .p-datatable-tbody > tr.item-row-partial > td) {
  background: var(--p-yellow-50) !important;
}
:deep(.racikan-child-table .p-datatable-tbody > tr.item-row-full > td) {
  background: var(--p-green-50) !important;
}

/* parent status kelengkapan bahan */
.racikan-parent-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.racikan-parent-name {
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
}

/* ITEM APP normal: wrapper dengan badge SUB */
.item-app-normal {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

/* ITEM REQ child: tulisan dokter */
.racikan-req-name {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  font-size: 11px;
  color: var(--p-text-muted-color);
  font-style: italic;
}

/* ITEM APP child: hasil pencocokan apotik */
.racikan-app-name {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  font-size: 11px;
}
.racikan-matched {
  color: var(--p-primary-color);
  font-weight: 600;
}
.racikan-unmatched {
  color: var(--p-amber-600);
  font-style: italic;
}

.cell-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-size: 11px;
}

/* ── Input kecil dalam cell ── */
.cell-input-sm {
  width: 100%;
}
:deep(.cell-input-sm .p-inputnumber) {
  width: 100%;
}
:deep(.cell-input-sm .p-inputnumber-input) {
  width: 100% !important;
  height: 16px !important;
  padding: 0 3px !important;
  font-size: 0.72rem !important;
  text-align: right !important;
  border-radius: 2px !important;
}

/* ── Dialog Variasi ── */
.variasi-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
}
:deep(.variasi-table .p-datatable-thead > tr > th) {
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--p-surface-100);
  white-space: nowrap;
}
:deep(.variasi-table .p-datatable-tbody > tr > td) {
  padding: 5px 10px;
  font-size: 12px;
  vertical-align: middle;
}
.exp-ok {
  color: var(--p-green-600);
  font-weight: 600;
}
.exp-soon {
  color: var(--p-amber-600);
  font-weight: 700;
}
.exp-kadaluarsa {
  color: var(--p-red-600);
  font-weight: 700;
  text-decoration: line-through;
}
:deep(.variasi-row-habis) {
  opacity: 0.45;
  pointer-events: none;
}
:deep(.variasi-row-habis-dim) {
  opacity: 0.55;
}
:deep(.variasi-table .p-datatable-tbody > tr.variasi-row-selected),
:deep(.variasi-table .p-datatable-tbody > tr.variasi-row-selected > td) {
  background: var(--p-blue-100, #dbeafe) !important;
}
:deep(.variasi-table .p-datatable-tbody > tr.variasi-row-selected) {
  outline: 2px solid var(--p-blue-500, #3b82f6);
  outline-offset: -2px;
  box-shadow: inset 4px 0 0 var(--p-blue-500, #3b82f6);
  position: relative;
  z-index: 1;
}
:deep(.variasi-table .p-datatable-tbody > tr.variasi-row-selected > td) {
  font-weight: 700 !important;
  color: var(--p-blue-800, #1e40af) !important;
}
.variasi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 14px;
  border-top: 1px solid var(--p-surface-200);
  background: var(--p-primary-50);
}
.variasi-sel-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--p-text-color);
}
.variasi-sel-name {
  font-weight: 700;
  font-size: 13px;
  color: var(--p-primary-900);
}
.variasi-qty-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
:deep(.variasi-qty-input .p-inputnumber-input) {
  width: 90px;
  text-align: right;
  font-weight: 700;
}

/* ── QTY APP badge ── */
.qty-app-cell {
  padding: 10px 10px;
  border-radius: 1px;
}
.qty-full {
  background: var(--p-green-600);
  color: #fff;
}
.qty-partial {
  background: var(--p-yellow-600);
  color: #fff;
}
.qty-zero {
  background: var(--p-red-600);
  color: #fff;
}

/* ── CHG Dialog ── */
.chg-searchbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--p-surface-200);
  background: var(--p-surface-50);
}
.chg-qty-ref {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  background: var(--p-amber-100);
  border: 1px solid var(--p-amber-300);
  border-radius: 4px;
  padding: 2px 8px;
  flex-shrink: 0;
}
.chg-qty-ref-lbl {
  font-size: 9px;
  font-weight: 700;
  color: var(--p-amber-800);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.chg-qty-ref-val {
  font-size: 13px;
  font-weight: 800;
  color: var(--p-amber-900);
  font-family: monospace;
}

/* ═══════════════════════ RESPONSIVE MOBILE ═══════════════════════ */

/* ── Tablet (≤ 768px) ── */
@media (max-width: 768px) {
  /* Toolbar: sembunyikan label, tampilkan ikon saja */
  .toolbar-end :deep(.p-button-label) {
    display: none;
  }
  .toolbar-end :deep(.p-button.p-button-sm) {
    padding: 0.45rem 0.6rem;
  }

  /* Patient card: susun vertikal */
  .patient-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 10px;
  }
  .patient-trans {
    text-align: left;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    border-top: 1px solid var(--p-surface-200);
    padding-top: 8px;
  }

  /* Receipt header bar: 2 kolom */
  .rh-item {
    min-width: calc(50% - 1px);
    flex: none;
  }

  /* Action bar: tombol mengalir horizontal */
  .action-bar {
    flex-direction: column;
    margin: 0 -8px -8px;
    padding: 8px;
    gap: 8px;
  }
  .action-bar-left {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }
  :deep(.btn-simpan.p-button),
  :deep(.btn-cetak.p-button),
  :deep(.btn-selesai.p-button) {
    flex: 1 1 120px;
    width: auto;
    justify-content: center;
  }
  .action-bar-right {
    width: 100%;
    justify-content: space-between;
    border-top: 1px solid var(--p-surface-200);
    padding-top: 8px;
  }

  /* Dialog footer variasi/CHG: susun vertikal */
  .variasi-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .variasi-sel-info {
    gap: 8px;
  }
  .variasi-qty-confirm {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
  }

  /* CHG search bar: input full-width */
  .chg-searchbar {
    flex-wrap: wrap;
  }
  .chg-searchbar :deep(.p-inputtext) {
    width: 100%;
    min-width: 0;
  }
}

/* ── Mobile kecil (≤ 480px) ── */
@media (max-width: 480px) {
  /* Patient meta: susun vertikal */
  .patient-meta {
    flex-direction: column;
    gap: 3px;
  }

  /* Receipt header bar: 1 kolom */
  .rh-item {
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--p-surface-200);
  }
  .rh-item:last-child {
    border-bottom: none;
  }

  /* Action bar: tombol full-width */
  :deep(.btn-simpan.p-button),
  :deep(.btn-cetak.p-button),
  :deep(.btn-selesai.p-button) {
    flex: 1 1 100%;
    justify-content: center;
  }

  /* Bill total: lebih kompak */
  .bt-row {
    font-size: 0.8rem;
    min-width: 0;
    width: 100%;
  }
}
</style>
