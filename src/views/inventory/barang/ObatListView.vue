<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />
    <ConfirmDialog />

    <!-- HERO -->
    <div class="barang-hero mb-2">
      <div class="barang-hero-left">
        <div class="barang-hero-icon"><i class="pi pi-heart"></i></div>
        <div>
          <h4 class="barang-hero-title">Master Obat &amp; BMHP</h4>
          <p class="barang-hero-sub">Kelola data obat dan bahan medis habis pakai</p>
        </div>
      </div>
      <Button
        v-if="isGudang"
        icon="pi pi-plus"
        label="Tambah Obat/BMHP"
        class="round-button2 btn-primary-barang"
        @click="openForm()"
      />
    </div>

    <!-- STAT STRIP -->
    <div class="barang-stat-strip">
      <div class="strip-stat">
        <i class="pi pi-heart strip-ico" style="color: #0369a1"></i>
        <span class="strip-num" style="color: #0369a1">{{ totalBarangs }}</span>
        <span class="strip-lbl">Total Obat/BMHP</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat">
        <i class="pi pi-eye strip-ico" style="color: #475569"></i>
        <span class="strip-num" style="color: #475569">{{ filteredBarangs.length }}</span>
        <span class="strip-lbl">Ditampilkan</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat">
        <i class="pi pi-wallet strip-ico" style="color: #0f4c81"></i>
        <span class="strip-num" style="color: #0f4c81">{{
          formatCurrency(totalPersediaanDitampilkan)
        }}</span>
        <span class="strip-lbl">Total Persediaan</span>
      </div>
      <template v-if="filters.search">
        <div class="strip-div"></div>
        <div class="strip-stat">
          <i class="pi pi-filter strip-ico" style="color: #b45309"></i>
          <span class="strip-lbl" style="color: #b45309; font-weight: 600">Filter aktif</span>
        </div>
      </template>
    </div>

    <!-- FILTER BAR -->
    <div class="barang-filter-bar">
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-search"></i>Cari</span>
        <InputText
          v-model="localSearch"
          placeholder="Nama, merek, ID barang..."
          style="min-width: 200px"
          @keydown.enter="onEnterSearch"
          :disabled="loading"
        />
      </div>
      <div class="filter-vdiv"></div>
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-circle"></i>Status</span>
        <Select
          v-model="filters.ARSIPKAN"
          :options="arsipOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Semua"
          style="min-width: 130px"
          @change="onFilterChange"
          :disabled="loading"
        />
      </div>
      <div class="filter-vdiv"></div>
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-tag"></i>Jenis</span>
        <Select
          v-model="filters.JENIS"
          :options="jenisOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Semua"
          style="min-width: 140px"
          @change="onFilterChange"
          :disabled="loading"
        />
      </div>
      <div class="filter-vdiv"></div>
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-sliders-h"></i>Tampilan</span>
        <div class="filter-chip-row">
          <button
            type="button"
            class="filter-chip"
            :class="{ active: expandAll }"
            @click="onToggleExpand()"
            :disabled="loading || showExpired"
          >
            <i class="pi pi-list"></i>Expand Semua
          </button>
          <button
            type="button"
            class="filter-chip"
            :class="{ active: isGrouped }"
            @click="onToggleGrouped()"
            :disabled="loading || showExpired"
          >
            <i class="pi pi-sitemap"></i>Kelompokkan
          </button>
          <button
            type="button"
            class="filter-chip"
            :class="{ 'active-warn': showBelowMin }"
            @click="onToggleBelowMin()"
            :disabled="loading"
          >
            <i class="pi pi-exclamation-triangle"></i>Stok Min
          </button>
        </div>
      </div>
      <div class="filter-vdiv"></div>
      <div class="barang-filter-group">
        <span class="barang-filter-label"><i class="pi pi-clock"></i>Akan Expired</span>
        <div class="filter-chip-row">
          <button
            type="button"
            class="filter-chip"
            :class="{ 'active-expired': showExpired }"
            @click="onToggleExpired()"
            :disabled="loading"
          >
            <i class="pi pi-clock"></i>{{ showExpired ? 'Aktif' : 'Nonaktif' }}
          </button>
          <template v-if="showExpired">
            <div class="filter-vdiv" style="height: 28px"></div>
            <button
              type="button"
              class="filter-chip"
              :class="{ active: expiredMonths === 1 }"
              @click="onSetExpiredMonths(1)"
              :disabled="loading"
            >
              1 Bln
            </button>
            <button
              type="button"
              class="filter-chip"
              :class="{ active: expiredMonths === 3 }"
              @click="onSetExpiredMonths(3)"
              :disabled="loading"
            >
              3 Bln
            </button>
          </template>
        </div>
      </div>
      <div class="barang-filter-actions ms-auto">
        <Button
          icon="pi pi-search"
          label="Cari"
          class="round-button2 btn-primary-barang"
          :loading="loading"
          @click="onEnterSearch"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          class="round-button2"
          v-tooltip.top="'Reset'"
          @click="resetFilter"
          :disabled="loading"
        />
        <Button
          icon="pi pi-file-excel"
          severity="success"
          outlined
          class="round-button2"
          v-tooltip.top="'Export Excel'"
          @click="exportExcel"
          :disabled="loading"
        />
      </div>
    </div>

    <!-- TABLE -->
    <div class="barang-table-wrap">
      <!-- ── EXPIRED MODE ──────────────────────────────────────────────── -->
      <DataTable
        v-if="showExpired"
        :value="barangs"
        :loading="loading"
        :lazy="true"
        :paginator="true"
        :rows="filters.pageSize"
        :totalRecords="totalBarangs"
        @page="onPageChange"
        showGridlines
        rowHover
        scrollable
        scrollHeight="65vh"
        size="small"
        :rowsPerPageOptions="[20, 50, 100, 500, 1000]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="barang-datatable"
      >
        <template #empty>
          <div class="barang-empty">
            <div class="barang-empty-icon"><i class="pi pi-clock"></i></div>
            <p class="barang-empty-title">Tidak ada batch yang akan expired</p>
          </div>
        </template>
        <Column header="#" style="width: 45px; text-align: center">
          <template #body="{ index }"
            ><span style="font-size: 11px; color: #94a3b8">{{
              (filters.currentPage - 1) * filters.pageSize + index + 1
            }}</span></template
          >
        </Column>
        <Column header="NAMA BARANG" style="min-width: 200px">
          <template #body="{ data }">
            <div style="font-size: 12px; font-weight: 600; color: #1e293b">{{ data.NAMA }}</div>
            <div class="mono" style="font-size: 10px">{{ data.IDBARANG }}</div>
          </template>
        </Column>
        <Column field="KATEGORI" header="KATEGORI" style="min-width: 110px">
          <template #body="{ data }"
            ><span>{{ data.KATEGORI || '-' }}</span></template
          >
        </Column>
        <Column header="SUB BARCODE" style="min-width: 110px">
          <template #body="{ data }"
            ><span class="mono">{{ data.SUB_BARCODE || '-' }}</span></template
          >
        </Column>
        <Column header="QTY" style="min-width: 70px; text-align: right">
          <template #body="{ data }">
            <span class="mono fw-semibold">{{ data.QTY }}</span>
          </template>
        </Column>
        <Column header="PERSEDIAAN" style="min-width: 120px; text-align: right">
          <template #body="{ data }">
            <span class="mono">{{
              data.PERSEDIAAN != null ? formatCurrency(data.PERSEDIAAN) : '-'
            }}</span>
          </template>
        </Column>
        <Column header="BATCH / NO.LOT" style="min-width: 120px">
          <template #body="{ data }"
            ><span class="mono">{{ data.BATCH_NUMBER || '-' }}</span></template
          >
        </Column>
        <Column header="EXPIRED" style="min-width: 130px">
          <template #body="{ data }">
            <div v-if="data.TGL_EXPIRED" style="display: flex; flex-direction: column; gap: 1px">
              <span
                class="mono fw-semibold"
                :style="{ color: expiredUrgencyColor(data.TGL_EXPIRED) }"
                >{{ formatDate(data.TGL_EXPIRED) }}</span
              >
              <span
                style="font-size: 10px; font-weight: 600"
                :style="{ color: expiredUrgencyColor(data.TGL_EXPIRED) }"
                >{{ daysUntil(data.TGL_EXPIRED) }} hari lagi</span
              >
            </div>
            <span v-else style="color: #94a3b8">-</span>
          </template>
        </Column>
      </DataTable>

      <!-- ── FLAT MODE ─────────────────────────────────────────────────── -->
      <DataTable
        v-else-if="!isGrouped"
        :value="filteredBarangs"
        :lazy="true"
        :paginator="true"
        :rows="filters.pageSize"
        :totalRecords="totalBarangs"
        @page="onPageChange"
        @sort="onSortChange"
        @row-expand="onRowExpand"
        v-model:expandedRows="expandedRows"
        showGridlines
        rowHover
        scrollable
        scrollHeight="65vh"
        size="small"
        :rowsPerPageOptions="[20, 50, 100, 500, 1000]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="barang-datatable"
        :sortField="filters.sortField"
        :sortOrder="filters.sortOrder === 'ASC' ? 1 : -1"
      >
        <template #empty>
          <div class="barang-empty">
            <div class="barang-empty-icon"><i class="pi pi-heart"></i></div>
            <p class="barang-empty-title">Belum ada data obat/BMHP</p>
            <small>Klik "Tambah Obat/BMHP" untuk menambahkan data baru.</small>
          </div>
        </template>
        <Column expander style="width: 40px" />
        <Column header="#" style="width: 45px; text-align: center">
          <template #body="{ index }"
            ><span style="font-size: 11px; color: #94a3b8">{{
              (filters.currentPage - 1) * filters.pageSize + index + 1
            }}</span></template
          >
        </Column>
        <Column field="IDBARANG" header="ID BARANG" style="min-width: 110px">
          <template #body="{ data }"
            ><span class="mono fw-semibold">{{ data.IDBARANG }}</span></template
          >
        </Column>
        <Column field="NAMA" header="NAMA" style="min-width: 200px" sortable>
          <template #body="{ data }">
            <div>
              <div style="display: flex; align-items: center; gap: 6px">
                <span style="font-size: 12px; font-weight: 600; color: #1e293b">{{
                  data.NAMA || '(Belum ada nama)'
                }}</span>
                <Tag
                  v-if="data.ARSIPKAN === '1'"
                  value="Diarsipkan"
                  severity="secondary"
                  style="font-size: 9px; padding: 1px 5px"
                />
              </div>
              <div v-if="data.MEREK" style="font-size: 10px; color: #94a3b8">{{ data.MEREK }}</div>
            </div>
          </template>
        </Column>
        <Column field="KATEGORI" header="KATEGORI" style="min-width: 120px" sortable>
          <template #body="{ data }"
            ><span>{{ data.KATEGORI || '-' }}</span></template
          >
        </Column>
        <Column
          field="TOTAL_STOCK"
          header="STOK"
          style="min-width: 80px; text-align: right"
          sortable
        >
          <template #body="{ data }">
            <div
              style="display: inline-flex; align-items: center; gap: 3px; justify-content: flex-end"
            >
              <span class="mono fw-semibold">{{ data.TOTAL_STOCK ?? '-' }}</span>
              <i
                v-if="data.is_below_minimum"
                class="pi pi-exclamation-triangle"
                style="color: #dc2626; font-size: 10px"
                v-tooltip.top="'Stok di bawah minimum'"
              ></i>
            </div>
          </template>
        </Column>
        <Column
          field="TOTAL_PERSEDIAAN"
          header="PERSEDIAAN"
          style="min-width: 130px; text-align: right"
          sortable
        >
          <template #body="{ data }">
            <span class="mono">{{
              data.TOTAL_PERSEDIAAN != null ? formatCurrency(data.TOTAL_PERSEDIAAN) : '-'
            }}</span>
          </template>
        </Column>
        <Column header="SATUAN" style="min-width: 150px">
          <template #body="{ data }">
            <span>
              {{ data.SATUAN_KECIL || '-' }}
              <span v-if="data.SATUAN_SEDANG" style="color: #6b7280">
                / {{ data.SATUAN_SEDANG }}</span
              >
              <span v-if="data.SATUAN_BESAR" style="color: #6b7280">
                / {{ data.SATUAN_BESAR }}</span
              >
            </span>
          </template>
        </Column>
        <Column field="GROUPING" header="GROUPING" style="min-width: 140px">
          <template #body="{ data }"
            ><span>{{ data.GROUPING || '-' }}</span></template
          >
        </Column>
        <template #expansion="{ data }">
          <div class="batch-expansion">
            <div class="batch-expansion-header">
              <i class="pi pi-list me-1"></i>Detail Batch — <strong>{{ data.NAMA }}</strong>
              <span style="color: #94a3b8; font-weight: 400"> ({{ data.IDBARANG }})</span>
            </div>
            <div v-if="batchLoading[data.ID]" class="batch-loading">
              <i class="pi pi-spin pi-spinner me-2"></i>Memuat batch...
            </div>
            <div
              v-else-if="!batchData[data.ID] || batchData[data.ID].length === 0"
              class="batch-empty"
            >
              <i class="pi pi-inbox me-1"></i>Tidak ada data batch di lokasi ini.
            </div>
            <table v-else class="batch-table">
              <thead>
                <tr>
                  <th>SUB BARCODE</th>
                  <th style="text-align: right">QTY</th>
                  <th style="text-align: right">HARGA BELI</th>
                  <th style="text-align: right">PERSEDIAAN</th>
                  <th style="text-align: right">HARGA JUAL</th>
                  <th>BATCH / NO.LOT</th>
                  <th>EXPIRED</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="batch in batchData[data.ID]"
                  :key="batch.ID"
                  :class="{ 'batch-row-arsip': batch.ARSIPKAN == 1 }"
                >
                  <td class="mono">{{ batch.SUB_BARCODE }}</td>
                  <td style="text-align: right" class="mono fw-semibold">{{ batch.QTY }}</td>
                  <td style="text-align: right" class="mono">{{ formatCurrency(batch.HARGA) }}</td>
                  <td style="text-align: right" class="mono">
                    {{ batch.PERSEDIAAN != null ? formatCurrency(batch.PERSEDIAAN) : '-' }}
                  </td>
                  <td style="text-align: right" class="mono">
                    {{ formatCurrency(batch.HARGAJUAL) }}
                  </td>
                  <td class="mono">{{ batch.BATCH_NUMBER || '-' }}</td>
                  <td>
                    <span v-if="batch.TGL_EXPIRED" class="mono">{{
                      formatDate(batch.TGL_EXPIRED)
                    }}</span
                    ><span v-else style="color: #94a3b8">-</span>
                  </td>
                  <td>
                    <Tag
                      v-if="batch.ARSIPKAN == 1"
                      value="Diarsipkan"
                      severity="secondary"
                      style="font-size: 9px; padding: 1px 5px"
                    />
                    <Tag
                      v-else
                      value="Aktif"
                      severity="success"
                      style="font-size: 9px; padding: 1px 5px"
                    />
                  </td>
                  <td>
                    <Button
                      v-if="batch.ARSIPKAN != 1"
                      icon="pi pi-inbox"
                      size="small"
                      text
                      rounded
                      severity="warning"
                      v-tooltip.top="'Arsipkan Batch'"
                      @click="
                        arsipkanBatch(batch.ID, batch.BATCH_NUMBER || batch.SUB_BARCODE, data.ID)
                      "
                    />
                    <Button
                      v-else
                      icon="pi pi-check-circle"
                      size="small"
                      text
                      rounded
                      severity="success"
                      v-tooltip.top="'Aktifkan Batch'"
                      @click="
                        aktifkanBatch(batch.ID, batch.BATCH_NUMBER || batch.SUB_BARCODE, data.ID)
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <Column header="AKSI" frozen alignFrozen="right" style="min-width: 100px">
          <template #body="{ data }">
            <div class="action-btns">
              <Button
                icon="pi pi-eye"
                size="small"
                text
                rounded
                severity="info"
                v-tooltip.top="'Detail'"
                @click="viewBarang(data)"
              />
              <Button
                icon="pi pi-book"
                size="small"
                text
                rounded
                severity="help"
                v-tooltip.top="'Kartu Stok'"
                @click="openStockCard(data.ID)"
              />
              <Button
                icon="pi pi-pencil"
                size="small"
                text
                rounded
                severity="warn"
                v-tooltip.top="'Edit'"
                @click="openForm(data.ID)"
              />
              <Button
                v-if="data.ARSIPKAN !== '1'"
                icon="pi pi-inbox"
                size="small"
                text
                rounded
                severity="warning"
                v-tooltip.top="'Arsipkan'"
                @click="arsipkanBarang(data.ID, data.NAMA)"
              />
              <Button
                v-else
                icon="pi pi-check-circle"
                size="small"
                text
                rounded
                severity="success"
                v-tooltip.top="'Aktifkan'"
                @click="aktifkanBarang(data.ID, data.NAMA)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                text
                rounded
                severity="danger"
                v-tooltip.top="'Hapus'"
                @click="deleteBarang(data.ID, data.NAMA)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- ── GROUPED MODE — Level 1: Groups ────────────────────────────── -->
      <DataTable
        v-else
        :value="filteredGroups"
        :paginator="true"
        :rows="filters.pageSize"
        :totalRecords="totalBarangs"
        @page="onPageChange"
        @row-expand="onGroupExpand"
        v-model:expandedRows="expandedGroups"
        showGridlines
        rowHover
        scrollable
        scrollHeight="65vh"
        size="small"
        :rowsPerPageOptions="[20, 50, 100, 500, 1000]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        class="barang-datatable"
      >
        <template #empty>
          <div class="barang-empty">
            <div class="barang-empty-icon"><i class="pi pi-folder"></i></div>
            <p class="barang-empty-title">Tidak ada data grouping</p>
          </div>
        </template>
        <Column expander style="width: 40px" />
        <Column header="GROUPING" style="min-width: 220px">
          <template #body="{ data }">
            <span style="font-size: 12px; font-weight: 700">{{ data.grouping }}</span>
          </template>
        </Column>
        <Column header="JUMLAH ITEM" style="min-width: 110px; text-align: center">
          <template #body="{ data }"
            ><span class="mono" style="color: #475569">{{ data.total_items }}</span></template
          >
        </Column>
        <Column header="TOTAL STOK" style="min-width: 110px; text-align: right">
          <template #body="{ data }">
            <div
              style="display: inline-flex; align-items: center; gap: 3px; justify-content: flex-end"
            >
              <span class="mono fw-semibold">{{ data.total_stock }}</span>
              <i
                v-if="data.is_below_minimum"
                class="pi pi-exclamation-triangle"
                style="color: #dc2626; font-size: 10px"
                v-tooltip.top="'Stok di bawah minimum'"
              ></i>
            </div>
          </template>
        </Column>
        <Column header="TOTAL PERSEDIAAN" style="min-width: 150px; text-align: right">
          <template #body="{ data }">
            <span class="mono">{{
              data.total_persediaan != null ? formatCurrency(data.total_persediaan) : '-'
            }}</span>
          </template>
        </Column>

        <!-- Level 2: Items in group -->
        <template #expansion="{ data }">
          <div class="group-items-expansion">
            <div v-if="groupItemsLoading[data.grouping_key ?? '']" class="batch-loading">
              <i class="pi pi-spin pi-spinner me-2"></i>Memuat item...
            </div>
            <div v-else-if="!groupItems[data.grouping_key ?? '']?.length" class="batch-empty">
              <i class="pi pi-inbox me-1"></i>Tidak ada item dalam group ini.
            </div>
            <table v-else class="items-table">
              <thead>
                <tr>
                  <th style="width: 32px"></th>
                  <th>NAMA</th>
                  <th>KATEGORI</th>
                  <th style="text-align: right">STOK</th>
                  <th style="text-align: right">PERSEDIAAN</th>
                  <th>SATUAN</th>
                  <th style="width: 90px">AKSI</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="item in groupItems[data.grouping_key ?? '']" :key="item.ID">
                  <!-- Item row -->
                  <tr :class="{ 'item-row-arsip': item.ARSIPKAN === '1' }">
                    <td>
                      <button class="item-expander" @click="toggleItemExpand(item.ID)">
                        <i
                          :class="
                            expandedItems[item.ID] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
                          "
                        ></i>
                      </button>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 6px">
                        <span style="font-size: 12px; font-weight: 600; color: #1e293b">{{
                          item.NAMA || '(Belum ada nama)'
                        }}</span>
                        <Tag
                          v-if="item.ARSIPKAN === '1'"
                          value="Diarsipkan"
                          severity="secondary"
                          style="font-size: 9px; padding: 1px 5px"
                        />
                      </div>
                      <div v-if="item.IDBARANG" class="mono" style="font-size: 10px">
                        {{ item.IDBARANG }}
                      </div>
                    </td>
                    <td>
                      <span>{{ item.KATEGORI || '-' }}</span>
                    </td>
                    <td style="text-align: right">
                      <div
                        style="
                          display: inline-flex;
                          align-items: center;
                          gap: 3px;
                          justify-content: flex-end;
                        "
                      >
                        <span class="mono fw-semibold">{{ item.TOTAL_STOCK ?? '-' }}</span>
                        <i
                          v-if="item.is_below_minimum"
                          class="pi pi-exclamation-triangle"
                          style="color: #dc2626; font-size: 10px"
                          v-tooltip.top="'Stok di bawah minimum'"
                        ></i>
                      </div>
                    </td>
                    <td style="text-align: right">
                      <span class="mono">{{
                        item.TOTAL_PERSEDIAAN != null ? formatCurrency(item.TOTAL_PERSEDIAAN) : '-'
                      }}</span>
                    </td>
                    <td>
                      <span
                        >{{ item.SATUAN_KECIL || '-'
                        }}<span v-if="item.SATUAN_SEDANG" style="color: #6b7280">
                          / {{ item.SATUAN_SEDANG }}</span
                        ></span
                      >
                    </td>
                    <td>
                      <div class="action-btns">
                        <Button
                          icon="pi pi-eye"
                          size="small"
                          text
                          rounded
                          severity="info"
                          v-tooltip.top="'Detail'"
                          @click="viewBarang(item)"
                        />
                        <Button
                          icon="pi pi-book"
                          size="small"
                          text
                          rounded
                          severity="help"
                          v-tooltip.top="'Kartu Stok'"
                          @click="openStockCard(item.ID)"
                        />
                        <Button
                          icon="pi pi-pencil"
                          size="small"
                          text
                          rounded
                          severity="warn"
                          v-tooltip.top="'Edit'"
                          @click="openForm(item.ID)"
                        />
                        <Button
                          v-if="item.ARSIPKAN !== '1'"
                          icon="pi pi-inbox"
                          size="small"
                          text
                          rounded
                          severity="warning"
                          v-tooltip.top="'Arsipkan'"
                          @click="arsipkanBarang(item.ID, item.NAMA)"
                        />
                        <Button
                          v-else
                          icon="pi pi-check-circle"
                          size="small"
                          text
                          rounded
                          severity="success"
                          v-tooltip.top="'Aktifkan'"
                          @click="aktifkanBarang(item.ID, item.NAMA)"
                        />
                      </div>
                    </td>
                  </tr>
                  <!-- Level 3: Batches per item -->
                  <tr v-if="expandedItems[item.ID]" class="batch-sub-row">
                    <td colspan="7" style="padding: 0">
                      <div class="batch-expansion" style="margin: 0; border-top: none">
                        <div class="batch-expansion-header">
                          <i class="pi pi-list me-1"></i>Detail Batch —
                          <strong>{{ item.NAMA }}</strong>
                        </div>
                        <div v-if="batchLoading[item.ID]" class="batch-loading">
                          <i class="pi pi-spin pi-spinner me-2"></i>Memuat batch...
                        </div>
                        <div v-else-if="!batchData[item.ID]?.length" class="batch-empty">
                          <i class="pi pi-inbox me-1"></i>Tidak ada data batch di lokasi ini.
                        </div>
                        <table v-else class="batch-table">
                          <thead>
                            <tr>
                              <th>SUB BARCODE</th>
                              <th style="text-align: right">QTY</th>
                              <th style="text-align: right">HARGA BELI</th>
                              <th style="text-align: right">PERSEDIAAN</th>
                              <th style="text-align: right">HARGA JUAL</th>
                              <th>BATCH / NO.LOT</th>
                              <th>EXPIRED</th>
                              <th>STATUS</th>
                              <th>AKSI</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="batch in batchData[item.ID]"
                              :key="batch.ID"
                              :class="{ 'batch-row-arsip': batch.ARSIPKAN == 1 }"
                            >
                              <td class="mono">{{ batch.SUB_BARCODE }}</td>
                              <td style="text-align: right" class="mono fw-semibold">
                                {{ batch.QTY }}
                              </td>
                              <td style="text-align: right" class="mono">
                                {{ formatCurrency(batch.HARGA) }}
                              </td>
                              <td style="text-align: right" class="mono">
                                {{
                                  batch.PERSEDIAAN != null ? formatCurrency(batch.PERSEDIAAN) : '-'
                                }}
                              </td>
                              <td style="text-align: right" class="mono">
                                {{ formatCurrency(batch.HARGAJUAL) }}
                              </td>
                              <td class="mono">{{ batch.BATCH_NUMBER || '-' }}</td>
                              <td>
                                <span
                                  v-if="batch.USE_EXP === '1' && batch.TGL_EXPIRED"
                                  class="mono"
                                  >{{ formatDate(batch.TGL_EXPIRED) }}</span
                                ><span v-else style="color: #94a3b8">-</span>
                              </td>
                              <td>
                                <Tag
                                  v-if="batch.ARSIPKAN == 1"
                                  value="Diarsipkan"
                                  severity="secondary"
                                  style="font-size: 9px; padding: 1px 5px"
                                />
                                <Tag
                                  v-else
                                  value="Aktif"
                                  severity="success"
                                  style="font-size: 9px; padding: 1px 5px"
                                />
                              </td>
                              <td>
                                <Button
                                  v-if="batch.ARSIPKAN != 1"
                                  icon="pi pi-inbox"
                                  size="small"
                                  text
                                  rounded
                                  severity="warning"
                                  v-tooltip.top="'Arsipkan Batch'"
                                  @click="
                                    arsipkanBatch(
                                      batch.ID,
                                      batch.BATCH_NUMBER || batch.SUB_BARCODE,
                                      item.ID,
                                    )
                                  "
                                />
                                <Button
                                  v-else
                                  icon="pi pi-check-circle"
                                  size="small"
                                  text
                                  rounded
                                  severity="success"
                                  v-tooltip.top="'Aktifkan Batch'"
                                  @click="
                                    aktifkanBatch(
                                      batch.ID,
                                      batch.BATCH_NUMBER || batch.SUB_BARCODE,
                                      item.ID,
                                    )
                                  "
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- FORM MODAL -->
    <BarangFormModal
      v-model:visible="formModal.visible"
      bucket="OBAT_BMHP"
      :itemId="formModal.itemId"
      @saved="fetchBarang"
    />

    <!-- KARTU STOK MODAL -->
    <BarangStockCardModal v-model:visible="stockCardModal.visible" :itemId="stockCardModal.itemId" />

    <!-- DETAIL DIALOG -->
    <Dialog
      v-model:visible="detailDialog"
      :header="selectedBarang?.NAMA || 'Detail Obat/BMHP'"
      modal
      :style="{ width: '580px', maxWidth: '95vw' }"
    >
      <div v-if="selectedBarang" class="detail-body">
        <div class="detail-section-title"><i class="pi pi-info-circle me-1"></i>Informasi Umum</div>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">ID Barang</span
            ><span class="detail-value mono text-teal">{{ selectedBarang.IDBARANG || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nama</span
            ><span class="detail-value fw-semibold">{{ selectedBarang.NAMA || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Merek</span
            ><span class="detail-value">{{ selectedBarang.MEREK || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Kategori</span
            ><span class="detail-value">{{ selectedBarang.KATEGORI || '-' }}</span>
          </div>
        </div>
        <div class="detail-section-title mt-3">
          <i class="pi pi-box me-1"></i>Satuan &amp; Konversi
        </div>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Satuan Kecil</span
            ><span class="detail-value">{{ selectedBarang.SATUAN_KECIL || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Satuan Sedang</span
            ><span class="detail-value"
              >{{ selectedBarang.SATUAN_SEDANG || '-'
              }}<span v-if="selectedBarang.KONVERSI_SEDANG" style="color: #6b7280">
                (1={{ selectedBarang.KONVERSI_SEDANG }} {{ selectedBarang.SATUAN_KECIL }})</span
              ></span
            >
          </div>
          <div class="detail-row">
            <span class="detail-label">Satuan Besar</span
            ><span class="detail-value"
              >{{ selectedBarang.SATUAN_BESAR || '-'
              }}<span v-if="selectedBarang.KONVERSI_BESAR" style="color: #6b7280">
                (1={{ selectedBarang.KONVERSI_BESAR }} {{ selectedBarang.SATUAN_KECIL }})</span
              ></span
            >
          </div>
        </div>
        <div class="detail-section-title mt-3">
          <i class="pi pi-heart me-1"></i>Informasi Farmasi
        </div>
        <div class="detail-grid">
          <div class="detail-row">
            <span class="detail-label">Sediaan</span
            ><span class="detail-value">{{ selectedBarang.SEDIAAN || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Rute Pemberian</span
            ><span class="detail-value">{{ selectedBarang.RUTE || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Zat Aktif</span
            ><span class="detail-value" style="color: #0369a1">{{
              selectedBarang.GROUPING || '-'
            }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="Edit"
          icon="pi pi-pencil"
          class="btn-primary-barang round-button2"
          @click="editFromDetail()"
        />
        <Button
          label="Tutup"
          icon="pi pi-times"
          severity="secondary"
          outlined
          class="round-button2"
          @click="detailDialog = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import BarangFormModal from './BarangFormModal.vue'
import BarangStockCardModal from './BarangStockCardModal.vue'
import { useLokasiGudang } from '@/composables/useLokasiGudang'

const configStore = useConfigStore()
const authStore = useAuthStore()
const confirm = useConfirm()
const toast = useToast()
const { isGudang, fetchIsGudang } = useLokasiGudang()

const loading = ref(false)
const barangs = ref([])
const totalBarangs = ref(0)
const detailDialog = ref(false)
const selectedBarang = ref(null)
const expandedRows = ref([])
const batchData = ref({})
const batchLoading = ref({})
const formModal = ref({ visible: false, itemId: null })
const stockCardModal = ref({ visible: false, itemId: null })
const expandAll = ref(false)
const expandMode = ref(1)
const isGrouped = ref(false)
const showBelowMin = ref(false)
const showExpired = ref(false)
const expiredMonths = ref(1)

// Grouped mode state
const groups = ref([])
const groupItems = ref({})
const groupItemsLoading = ref({})
const expandedGroups = ref([])
const expandedItems = ref({})

const filters = ref({
  search: '',
  ARSIPKAN: '0',
  JENIS: '',
  currentPage: 1,
  pageSize: 20,
  sortField: 'NAMA',
  sortOrder: 'ASC',
})
const arsipOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Aktif', value: '0' },
  { label: 'Diarsipkan', value: '1' },
]
const jenisOptions = [
  { label: 'Semua Jenis', value: '' },
  { label: 'Obat-obatan', value: 'OBAT' },
  { label: 'BMHP', value: 'BMHP' },
]
const localSearch = ref('')

const filteredBarangs = computed(() => {
  const q = localSearch.value.trim().toLowerCase()
  if (!q) return barangs.value
  return barangs.value.filter(
    (b) =>
      b.NAMA?.toLowerCase().includes(q) ||
      b.IDBARANG?.toLowerCase().includes(q) ||
      b.KATEGORI?.toLowerCase().includes(q),
  )
})

const filteredGroups = computed(() => {
  const q = localSearch.value.trim().toLowerCase()
  if (!q) return groups.value
  return groups.value.filter((g) => g.grouping?.toLowerCase().includes(q))
})

const totalPersediaanDitampilkan = computed(() => {
  if (isGrouped.value)
    return groups.value.reduce((s, g) => s + (Number(g.total_persediaan) || 0), 0)
  return filteredBarangs.value.reduce((s, b) => s + (Number(b.TOTAL_PERSEDIAAN) || 0), 0)
})

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d)
    ? val
    : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}
function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000)
}
function expiredUrgencyColor(dateStr) {
  const d = daysUntil(dateStr)
  if (d === null) return '#94a3b8'
  if (d <= 30) return '#dc2626'
  if (d <= 90) return '#ea580c'
  return '#ca8a04'
}

async function fetchBarang() {
  loading.value = true
  try {
    let url, params
    if (showExpired.value) {
      url = `${configStore.apiApotikUrl}/index.php/api/inventory/barang_akan_expired`
      params = {
        clientId: authStore.id_client,
        lokasiId: authStore.id_lokasi,
        bucket: 'OBAT_BMHP',
        search: filters.value.search,
        page: filters.value.currentPage,
        limit: filters.value.pageSize,
      }
      params.months = expiredMonths.value
      if (filters.value.JENIS !== '') params.jenis = filters.value.JENIS
    } else if (showBelowMin.value) {
      url = `${configStore.apiApotikUrl}/index.php/api/inventory/barang_stok_minimum`
      params = {
        clientId: authStore.id_client,
        lokasiId: authStore.id_lokasi,
        bucket: 'OBAT_BMHP',
        search: filters.value.search,
        page: filters.value.currentPage,
        limit: filters.value.pageSize,
      }
      if (filters.value.JENIS !== '') params.jenis = filters.value.JENIS
    } else {
      url = `${configStore.apiApotikUrl}/index.php/api/inventory/barang_list`
      params = {
        clientId: authStore.id_client,
        lokasiId: authStore.id_lokasi,
        bucket: 'OBAT_BMHP',
        grouped: isGrouped.value ? 1 : 0,
        search: filters.value.search,
        page: filters.value.currentPage,
        limit: filters.value.pageSize,
        sortField: filters.value.sortField,
        sortOrder: filters.value.sortOrder,
      }

      if (!isGrouped.value) params.mode = expandMode.value
      if (filters.value.ARSIPKAN !== '') params.ARSIPKAN = filters.value.ARSIPKAN
      if (filters.value.JENIS !== '') params.jenis = filters.value.JENIS
    }
    const res = await axios.get(url, { params })

    const raw = res.data?.response || res.data?.data || []
    const p = res.data?.metadata?.pagination
    totalBarangs.value = p?.total ?? res.data?.total ?? 0

    if (isGrouped.value) {
      groups.value = raw
      barangs.value = []
    } else {
      barangs.value = raw
      groups.value = []
      if (expandMode.value === 2) {
        barangs.value.forEach((b) => {
          if (b.batches) batchData.value[b.ID] = b.batches
        })
        expandedRows.value = [...barangs.value]
      } else {
        expandedRows.value = []
      }
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function onGroupExpand(event) {
  const key = event.data.grouping_key ?? ''
  if (groupItems.value[key] !== undefined) return
  groupItemsLoading.value[key] = true
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/inventory/barang_group_items`,
      {
        params: {
          clientId: authStore.id_client,
          lokasiId: authStore.id_lokasi,
          bucket: 'OBAT_BMHP',
          grouping: key,
          mode: 1,
        },
      },
    )
    groupItems.value[key] = res.data?.response || []
  } catch {
    groupItems.value[key] = []
  } finally {
    groupItemsLoading.value[key] = false
  }
}

function toggleItemExpand(itemId) {
  if (expandedItems.value[itemId]) {
    expandedItems.value[itemId] = false
  } else {
    expandedItems.value[itemId] = true
    fetchBatchDetail(itemId)
  }
}

async function fetchBatchDetail(id) {
  if (batchData.value[id]) return
  batchLoading.value[id] = true
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/inventory/barang_stock_detail/${id}`,
      {
        params: {
          clientId: authStore.id_client,
          lokasiId: authStore.id_lokasi,
          ...(filters.value.ARSIPKAN !== '' ? { ARSIPKAN: filters.value.ARSIPKAN } : {}),
        },
      },
    )
    batchData.value[id] = res.data?.response || []
  } catch {
    batchData.value[id] = []
  } finally {
    batchLoading.value[id] = false
  }
}

function onRowExpand(event) {
  fetchBatchDetail(event.data.ID)
}

function arsipkanBarang(id, nama) {
  confirm.require({
    message: `Arsipkan "${nama}"? Item tidak akan muncul di list default.`,
    header: 'Konfirmasi Arsipkan',
    icon: 'pi pi-inbox',
    rejectLabel: 'Batal',
    acceptLabel: 'Arsipkan',
    acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await axios.put(
          `${configStore.apiApotikUrl}/index.php/api/inventory/barang_arsip/${id}`,
          null,
          { params: { clientId: authStore.id_client, lokasiId: authStore.id_lokasi } },
        )
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Barang diarsipkan',
          life: 3000,
        })
        fetchBarang()
      } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengarsipkan', life: 3000 })
      }
    },
  })
}

function arsipkanBatch(batchId, label, itemId) {
  confirm.require({
    message: `Arsipkan batch "${label || batchId}"?`,
    header: 'Konfirmasi Arsipkan Batch',
    icon: 'pi pi-inbox',
    rejectLabel: 'Batal',
    acceptLabel: 'Arsipkan',
    acceptClass: 'p-button-warning',
    accept: async () => {
      try {
        await axios.put(
          `${configStore.apiApotikUrl}/index.php/api/inventory/batch_arsip/${batchId}`,
          null,
          { params: { clientId: authStore.id_client } },
        )
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Batch diarsipkan',
          life: 3000,
        })
        delete batchData.value[itemId]
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal mengarsipkan batch',
          life: 3000,
        })
      }
    },
  })
}

function aktifkanBarang(id, nama) {
  confirm.require({
    message: `Aktifkan kembali "${nama}"? Master barang akan diaktifkan (batch tidak ikut otomatis).`,
    header: 'Konfirmasi Aktifkan',
    icon: 'pi pi-check-circle',
    rejectLabel: 'Batal',
    acceptLabel: 'Aktifkan',
    acceptClass: 'p-button-success',
    accept: async () => {
      try {
        await axios.put(
          `${configStore.apiApotikUrl}/index.php/api/inventory/barang_aktif/${id}`,
          null,
          { params: { clientId: authStore.id_client } },
        )
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Barang diaktifkan',
          life: 3000,
        })
        fetchBarang()
      } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal mengaktifkan', life: 3000 })
      }
    },
  })
}

function aktifkanBatch(batchId, label, itemId) {
  confirm.require({
    message: `Aktifkan batch "${label || batchId}"?`,
    header: 'Konfirmasi Aktifkan Batch',
    icon: 'pi pi-check-circle',
    rejectLabel: 'Batal',
    acceptLabel: 'Aktifkan',
    acceptClass: 'p-button-success',
    accept: async () => {
      try {
        await axios.put(
          `${configStore.apiApotikUrl}/index.php/api/inventory/batch_aktif/${batchId}`,
          null,
          { params: { clientId: authStore.id_client } },
        )
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Batch diaktifkan',
          life: 3000,
        })
        delete batchData.value[itemId]
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal mengaktifkan batch',
          life: 3000,
        })
      }
    },
  })
}

function deleteBarang(id, nama) {
  confirm.require({
    message: `Hapus "${nama}"? Data akan ditandai sebagai dihapus.`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await axios.delete(
          `${configStore.apiApotikUrl}/index.php/api/inventory/barang_delete/${id}`,
          { params: { clientId: authStore.id_client } },
        )
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Barang dihapus',
          life: 3000,
        })
        fetchBarang()
      } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus', life: 3000 })
      }
    },
  })
}

function onToggleExpand() {
  expandAll.value = !expandAll.value
  expandMode.value = expandAll.value ? 2 : 1
  filters.value.currentPage = 1
  if (!expandAll.value) {
    expandedRows.value = []
    batchData.value = {}
  }
  fetchBarang()
}
function onToggleGrouped() {
  isGrouped.value = !isGrouped.value
  filters.value.currentPage = 1
  expandedRows.value = []
  expandedGroups.value = []
  groups.value = []
  groupItems.value = {}
  groupItemsLoading.value = {}
  expandedItems.value = {}
  batchData.value = {}
  fetchBarang()
}
function onToggleBelowMin() {
  showBelowMin.value = !showBelowMin.value
  if (showBelowMin.value) showExpired.value = false
  filters.value.currentPage = 1
  fetchBarang()
}
function onToggleExpired() {
  showExpired.value = !showExpired.value
  if (showExpired.value) showBelowMin.value = false
  filters.value.currentPage = 1
  fetchBarang()
}
function onSetExpiredMonths(months) {
  expiredMonths.value = months
  filters.value.currentPage = 1
  fetchBarang()
}
function onEnterSearch() {
  filters.value.search = localSearch.value
  filters.value.currentPage = 1
  fetchBarang()
}
function onFilterChange() {
  filters.value.currentPage = 1
  fetchBarang()
}
function onPageChange(e) {
  filters.value.currentPage = e.page + 1
  filters.value.pageSize = e.rows
  fetchBarang()
}
function onSortChange(e) {
  filters.value.sortField = e.sortField
  filters.value.sortOrder = e.sortOrder === 1 ? 'ASC' : 'DESC'
  filters.value.currentPage = 1
  fetchBarang()
}
function resetFilter() {
  localSearch.value = ''
  expandAll.value = false
  expandMode.value = 1
  isGrouped.value = false
  showBelowMin.value = false
  showExpired.value = false
  expiredMonths.value = 1
  expandedRows.value = []
  expandedGroups.value = []
  groups.value = []
  groupItems.value = {}
  groupItemsLoading.value = {}
  expandedItems.value = {}
  batchData.value = {}
  filters.value = {
    search: '',
    ARSIPKAN: '0',
    JENIS: '',
    currentPage: 1,
    pageSize: 20,
    sortField: 'NAMA',
    sortOrder: 'ASC',
  }
  fetchBarang()
}
function openForm(id = null) {
  formModal.value = { visible: true, itemId: id || null }
}
function openStockCard(id) {
  stockCardModal.value = { visible: true, itemId: id }
}
function editFromDetail() {
  openForm(selectedBarang.value?.ID)
  detailDialog.value = false
}
function viewBarang(data) {
  selectedBarang.value = data
  detailDialog.value = true
}

function exportExcel() {
  import('xlsx').then((xlsx) => {
    let rows = []
    let sheetName = 'Obat_BMHP'
    let filename = 'Obat_BMHP.xlsx'
    if (showExpired.value) {
      sheetName = 'Akan_Expired'
      filename = 'Obat_Akan_Expired.xlsx'
      rows = barangs.value.map((d) => ({
        'NAMA BARANG': d.NAMA,
        'ID BARANG': d.IDBARANG,
        KATEGORI: d.KATEGORI,
        'SUB BARCODE': d.SUB_BARCODE,
        QTY: d.QTY,
        PERSEDIAAN: d.PERSEDIAAN,
        'BATCH/NO.LOT': d.BATCH_NUMBER,
        EXPIRED: d.TGL_EXPIRED,
      }))
    } else if (isGrouped.value) {
      sheetName = 'Kelompok'
      filename = 'Obat_Kelompok.xlsx'
      rows = groups.value.map((d) => ({
        GROUPING: d.grouping,
        'JUMLAH ITEM': d.item_count,
        'TOTAL STOK': d.total_stock,
        'TOTAL PERSEDIAAN': d.total_persediaan,
      }))
    } else {
      const withBatch = expandMode.value === 2 && Object.keys(batchData.value).length > 0
      if (withBatch) {
        barangs.value.forEach((d) => {
          rows.push({
            'ID BARANG': d.IDBARANG,
            NAMA: d.NAMA,
            KATEGORI: d.KATEGORI,
            STOK: d.TOTAL_STOCK,
            PERSEDIAAN: d.TOTAL_PERSEDIAAN,
            SATUAN: d.SATUAN,
            GROUPING: d.GROUPING,
            'SUB BARCODE': '',
            QTY: '',
            'HARGA BELI': '',
            'PERSEDIAAN BATCH': '',
            'HARGA JUAL': '',
            'BATCH/NO.LOT': '',
            EXPIRED: '',
            'STATUS BATCH': '',
          })
          const batches = batchData.value[d.ID] || []
          batches.forEach((b) => {
            rows.push({
              'ID BARANG': '',
              NAMA: '',
              KATEGORI: '',
              STOK: '',
              PERSEDIAAN: '',
              SATUAN: '',
              GROUPING: '',
              'SUB BARCODE': b.SUB_BARCODE,
              QTY: b.QTY,
              'HARGA BELI': b.HARGABELI,
              'PERSEDIAAN BATCH': b.PERSEDIAAN,
              'HARGA JUAL': b.HARGAJUAL,
              'BATCH/NO.LOT': b.BATCH_NUMBER,
              EXPIRED: b.TGL_EXPIRED,
              'STATUS BATCH': b.ARSIPKAN === '1' ? 'Diarsipkan' : 'Aktif',
            })
          })
        })
      } else {
        rows = barangs.value.map((d) => ({
          'ID BARANG': d.IDBARANG,
          NAMA: d.NAMA,
          KATEGORI: d.KATEGORI,
          STOK: d.TOTAL_STOCK,
          PERSEDIAAN: d.TOTAL_PERSEDIAAN,
          SATUAN: d.SATUAN,
          GROUPING: d.GROUPING,
        }))
      }
    }
    const ws = xlsx.utils.json_to_sheet(rows)
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, sheetName)
    xlsx.writeFile(wb, filename)
  })
}

onMounted(() => {
  fetchBarang()
  fetchIsGudang()
})
</script>

<style scoped>
.barang-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  border-radius: 10px;
  color: #fff;
}
.barang-hero-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.barang-hero-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}
.barang-hero-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: 0.5px;
}
.barang-hero-sub {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
}
.barang-stat-strip {
  display: flex;
  align-items: center;
  height: 40px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #0369a1;
  border-radius: 0 0 6px 6px;
  padding: 0 6px;
  overflow: hidden;
  margin-bottom: 6px;
}
.strip-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 14px;
}
.strip-ico {
  font-size: 13px;
}
.strip-num {
  font-size: 15px;
  font-weight: 700;
}
.strip-lbl {
  font-size: 10.5px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.strip-div {
  width: 1px;
  height: 22px;
  background: #e2e8f0;
  flex-shrink: 0;
}
.barang-filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #0369a1;
  border-radius: 8px;
  margin-bottom: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.barang-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px;
}
.barang-filter-group:first-child {
  padding-left: 0;
}
.barang-filter-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 1px;
}
.barang-filter-label i {
  color: #0369a1;
  font-size: 9px;
}
.filter-vdiv {
  width: 1px;
  height: 46px;
  background: #f1f5f9;
  flex-shrink: 0;
  align-self: center;
}
.filter-chip-row {
  display: flex;
  gap: 5px;
  align-items: center;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: 11px;
  color: #64748b;
  cursor: pointer;
  font-weight: 500;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
  user-select: none;
  line-height: 1.5;
  white-space: nowrap;
  outline: none;
}
.filter-chip i {
  font-size: 10px;
}
.filter-chip:hover:not(:disabled) {
  border-color: #bae6fd;
  background: #eff6ff;
  color: #0369a1;
}
.filter-chip.active {
  border-color: #0369a1 !important;
  background: #e0f2fe !important;
  color: #0369a1 !important;
  font-weight: 600 !important;
}
.filter-chip.active-warn {
  border-color: #dc2626 !important;
  background: #fef2f2 !important;
  color: #dc2626 !important;
  font-weight: 600 !important;
}
.filter-chip.active-expired {
  border-color: #d97706 !important;
  background: #fffbeb !important;
  color: #d97706 !important;
  font-weight: 600 !important;
}
.filter-chip:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.barang-filter-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 16px;
  border-left: 1px solid #f1f5f9;
}
.barang-table-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid #0369a1;
  border-radius: 6px;
  overflow: hidden;
}
:deep(.barang-datatable .p-datatable-thead > tr > th) {
  background: #eff6ff !important;
  color: #1d4ed8 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 0.25rem 0.6rem !important;
  white-space: nowrap;
}
:deep(.barang-datatable .p-datatable-tbody > tr > td) {
  font-size: 12px !important;
  padding: 0.03rem 0.5rem !important;
  vertical-align: middle;
}
:deep(.barang-datatable .p-datatable-tbody > tr:hover > td) {
  background: #eff6ff !important;
}
:deep(.barang-datatable .p-paginator) {
  padding: 6px 10px;
  font-size: 12px;
  background: #fafafa;
  border-top: 1px solid #e2e8f0;
}
.barang-empty {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}
.barang-empty-icon {
  font-size: 36px;
  margin-bottom: 10px;
  color: #cbd5e1;
}
.barang-empty-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 4px;
}
.detail-body {
  padding: 0 2px;
}
.detail-section-title {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #1d4ed8;
  padding: 4px 0;
  border-bottom: 1px solid #dbeafe;
  margin-bottom: 8px;
}
.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 8px;
  align-items: baseline;
}
.detail-label {
  font-size: 11px;
  color: #64748b;
}
.detail-value {
  font-size: 12px;
  color: #1e293b;
  font-weight: 500;
}
.action-btns {
  display: flex;
  gap: 2px;
  align-items: center;
}
:deep(.action-btns .p-button.p-button-text),
:deep(.batch-table .p-button.p-button-text) {
  padding: 0 0.2rem !important;
  font-size: 10px !important;
  height: 1.4rem !important;
  min-height: unset !important;
  width: 1.4rem !important;
}
.mono {
  font-family: monospace;
  font-size: 12px;
}
.text-teal {
  color: #00838f;
}
.btn-primary-barang {
  background: #0369a1 !important;
  border-color: #0369a1 !important;
  color: #fff !important;
}
.btn-primary-barang:hover {
  background: #0284c7 !important;
  border-color: #0284c7 !important;
}
.round-button2 {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}
.group-items-expansion {
  padding: 0;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.items-table thead tr {
  background: #eff6ff;
}
.items-table thead th {
  padding: 5px 8px;
  text-align: left;
  font-size: 10.5px;
  font-weight: 700;
  color: #1d4ed8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
  border-bottom: 2px solid #bfdbfe;
}
.items-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
}
.items-table tbody tr:not(.batch-sub-row):hover {
  background: #f8fafc;
}
.items-table tbody td {
  padding: 1px 6px;
  vertical-align: middle;
}
.item-row-arsip {
  opacity: 0.55;
}
.item-expander {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 5px;
  color: #64748b;
  font-size: 11px;
  border-radius: 3px;
  line-height: 1;
}
.item-expander:hover {
  background: #dbeafe;
  color: #1d4ed8;
}
.batch-sub-row > td {
  background: #f1f5f9 !important;
  padding: 0 !important;
}
.batch-expansion {
  padding: 10px 16px;
  background: #f8fafc;
  border-top: 2px dashed #e2e8f0;
}
.batch-expansion-header {
  font-size: 11.5px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}
.batch-loading,
.batch-empty {
  font-size: 12px;
  color: #94a3b8;
  padding: 10px 0;
}
.batch-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.batch-table thead tr {
  background: #dbeafe;
}
.batch-table thead th {
  padding: 4px 8px;
  text-align: left;
  font-size: 10.5px;
  font-weight: 700;
  color: #1d4ed8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
  border-bottom: 1px solid #bfdbfe;
}
.batch-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
}
.batch-table tbody tr:hover {
  background: #eff6ff;
}
.batch-table tbody td {
  padding: 1px 6px;
  vertical-align: middle;
}
.batch-row-arsip {
  opacity: 0.55;
}
</style>
