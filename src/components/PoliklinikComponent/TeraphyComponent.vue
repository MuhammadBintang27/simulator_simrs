<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Toast />

  <!-- ══════════════════════ Dialog: Cari Obat ══════════════════════ -->
  <Dialog
    v-model:visible="listObat"
    modal
    header="Cari & Tambah Obat"
    :style="{ width: '1100px', maxWidth: '96vw' }"
    :closable="false"
  >
    <div class="obat-dialog-search">
      <span class="p-input-icon-left obat-search-wrap">
        <i class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          placeholder="Ketik minimal 3 huruf nama obat…"
          @input="findObatan(19, '')"
          class="obat-search-input"
          autofocus
        />
      </span>
      <Tag
        :value="`${availableObat.length} obat ditemukan`"
        severity="info"
        class="obat-found-tag"
      />
    </div>

    <!-- ── Sering Diresepkan (tampil saat belum ada pencarian) ── -->
    <div v-if="searchQuery.length <= 2" class="recent-obat-section">
      <div class="recent-obat-hdr">
        <span class="recent-obat-hdr-left">
          <i class="pi pi-star-fill"></i>
          Sering Diresepkan di Poli Ini
        </span>
        <span v-if="loadingRecent" class="recent-loading">
          <i class="pi pi-spin pi-spinner"></i> Memuat…
        </span>
      </div>

      <div v-if="!loadingRecent && recentObat.length === 0" class="recent-obat-empty">
        <i class="pi pi-inbox"></i> Belum ada data
      </div>

      <div class="recent-obat-grid">
        <div
          v-for="item in recentObat"
          :key="item.BARCODE"
          class="recent-chip"
          @click="addRecentObat(item)"
          v-tooltip.bottom="'Klik untuk tambah ke resep'"
        >
          <div class="recent-chip-name">{{ item.NAMABARANG }}</div>
          <div class="recent-chip-price" v-if="item.HARGA > 0">
            {{ formatCurrency(item.HARGA) }}
            <span class="recent-chip-per">/ {{ item.SATUAN }}</span>
          </div>
          <div class="recent-chip-footer">
            <span class="recent-chip-satuan">{{ item.SATUAN }}</span>
            <span class="recent-chip-count"><i class="pi pi-chart-bar"></i>{{ item.JML }}x</span>
          </div>
        </div>
      </div>
    </div>

    <DataTable
      :value="availableObat"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :scrollable="true"
      scrollHeight="360px"
      class="p-datatable-sm obat-list-table"
      :rowHover="true"
      :showGridlines="false"
      stripedRows
    >
      <template #empty>
        <div class="tbl-empty">
          <i class="pi pi-pills"></i>
          <p>Ketik nama obat untuk mencari</p>
        </div>
      </template>
      <template #loading>
        <div class="tbl-empty">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Memuat data…</p>
        </div>
      </template>

      <Column field="CAPTION" header="Nama Obat" :sortable="true" style="min-width: 220px">
        <template #body="slotProps">
          <div class="obat-name">{{ slotProps.data.CAPTION }}</div>
          <span v-if="slotProps.data.BATCH_NUMBER" class="batch-badge">
            Batch: {{ slotProps.data.BATCH_NUMBER }}
          </span>
        </template>
      </Column>

      <Column field="KATEGORI" header="Kategori" :sortable="true" style="min-width: 130px">
        <template #body="slotProps">
          <Tag :value="slotProps.data.KATEGORI" severity="success" class="text-xs" />
        </template>
      </Column>

      <Column
        field="HARGAJUAL"
        header="Harga Jual"
        :sortable="true"
        dataType="numeric"
        style="min-width: 130px"
      >
        <template #body="slotProps">
          <span class="price-text">{{ formatCurrency(slotProps.data.HARGAJUAL) }}</span>
        </template>
      </Column>

      <Column
        field="QUNATITY"
        header="Stok"
        :sortable="true"
        dataType="numeric"
        style="width: 90px; text-align: center"
      >
        <template #body="slotProps">
          <Tag
            :value="String(slotProps.data.QUNATITY < 0 ? '0' : slotProps.data.QUNATITY)"
            :severity="slotProps.data.QUNATITY > 0 ? 'success' : 'danger'"
          />
        </template>
      </Column>

      <Column style="width: 70px; text-align: center">
        <template #body="slotProps">
          <Button
            icon="pi pi-plus"
            rounded
            size="small"
            severity="success"
            @click="addItem(slotProps.data, 1)"
            v-tooltip.left="'Tambah ke resep'"
          />
        </template>
      </Column>
    </DataTable>

    <template #footer>
      <Button
        label="Tutup"
        icon="pi pi-times"
        @click="listObat = false"
        severity="secondary"
        outlined
      />
    </template>
  </Dialog>

  <!-- ══════════════════════ Main Layout ══════════════════════════════ -->
  <div class="therapy-wrapper">
    <!-- ── Sidebar: Riwayat Resep ── -->
    <div class="therapy-sidebar">
      <div class="sidebar-hdr">
        <i class="pi pi-history sidebar-hdr-icon"></i>
        <span class="sidebar-hdr-title">Riwayat Resep</span>
        <Tag :value="String(riwayat_obat.length)" severity="secondary" class="sidebar-count" />
      </div>

      <div class="sidebar-list">
        <div v-if="riwayat_obat.length === 0" class="sidebar-empty">
          <i class="pi pi-inbox"></i>
          <p>Belum ada resep</p>
        </div>

        <div
          v-for="(data, index) in riwayat_obat"
          :key="index"
          class="resep-card"
          :class="data.TELAH_DIKIRIM == 1 ? 'resep-sent' : 'resep-pending'"
        >
          <div class="resep-card-top">
            <span class="resep-date">
              <i class="pi pi-calendar"></i>
              {{ data.SHORTDATE }}
            </span>
            <span class="resep-time">{{ data.JAM }}</span>
          </div>

          <div class="resep-status-row">
            <Tag v-if="data.TELAH_DIKIRIM == 1" severity="success" class="resep-tag">
              <i class="pi pi-check-circle"></i>&nbsp;Terkirim
            </Tag>
            <Tag v-else severity="danger" class="resep-tag">
              <i class="pi pi-hourglass"></i>&nbsp;Pending
            </Tag>
          </div>

          <div v-if="data.TELAH_DIKIRIM == 1" class="resep-sent-time">
            {{ data.TANGGAL_KIRIM }} {{ data.JAM_KIRIM }}
          </div>

          <div class="resep-actions">
            <Button
              icon="pi pi-eye"
              label="Detail"
              size="small"
              text
              severity="info"
              class="resep-btn"
              @click="getdetail_sales(data.RECEIPT_NO)"
            />
            <Button
              v-if="data.TELAH_DIKIRIM == 0"
              icon="pi pi-send"
              label="Kirim"
              size="small"
              severity="success"
              class="resep-btn"
              @click="kirim_resep(data.RECEIPT_NO)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              class="resep-btn-del"
              @click="ConfirmVoidResep(data.RECEIPT_NO, index)"
              v-tooltip.right="'Batalkan resep'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Main Content ── -->
    <div class="therapy-main">
      <!-- Plafon bar -->
      <div
        v-if="biayaPelayanan.PLAFON_OBAT > 0"
        class="plafon-bar"
        :class="totalAmount > biayaPelayanan.PLAFON_OBAT ? 'plafon-exceeded' : 'plafon-ok'"
      >
        <div class="plafon-left">
          <span class="plafon-lbl">Total Terapi</span>
          <span
            class="plafon-amount"
            :class="{ 'plafon-amount-over': totalAmount > biayaPelayanan.PLAFON_OBAT }"
          >
            {{ formatCurrency(totalAmount) }}
          </span>
        </div>
        <div class="plafon-right">
          <span class="plafon-max-lbl"
            >Plafon: {{ formatCurrency(biayaPelayanan.PLAFON_OBAT) }}</span
          >
          <Tag v-if="totalAmount > biayaPelayanan.PLAFON_OBAT" severity="danger">
            <i class="pi pi-exclamation-triangle"></i>&nbsp;Melebihi Plafon
          </Tag>
          <Tag v-else severity="success"> {{ calculatePercentage() }}% terpakai </Tag>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="therapy-toolbar">
        <div class="toolbar-left">
          <i class="pi pi-list-check toolbar-icon"></i>
          <span class="toolbar-title">Daftar Item Terapi</span>
          <Tag
            :value="`${selectedObatObatan.length} item`"
            severity="secondary"
            class="toolbar-count"
          />
        </div>
        <div class="toolbar-right">
          <Button
            icon="pi pi-search"
            label="Tambah Obat"
            size="small"
            severity="success"
            @click="listObat = true"
          />
          <Button
            icon="pi pi-plus-circle"
            label="Obat Racikan"
            size="small"
            class="btn-racikan"
            @click="showResepRacikan = true"
          />
          <Button
            icon="fas fa-file-medical"
            label="Obat Kronis (Apol)"
            size="small"
            severity="warn"
            outlined
            @click="obat_kronisBPJS"
          />
        </div>
      </div>

      <!-- Table -->
      <DataTable
        :value="selectedObatObatan"
        :scrollable="true"
        scrollHeight="360px"
        class="p-datatable-sm therapy-table"
        :rowHover="true"
        :showGridlines="false"
        stripedRows
        :rowClass="getRowClass"
      >
        <template #empty>
          <div class="tbl-empty">
            <i class="pi pi-pills"></i>
            <p>Belum ada obat ditambahkan</p>
            <Button
              label="Cari Obat"
              icon="pi pi-search"
              size="small"
              severity="success"
              @click="listObat = true"
            />
          </div>
        </template>
        <template #loading>
          <div class="tbl-empty">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Memuat data…</p>
          </div>
        </template>

        <Column style="width: 56px; text-align: center" header="Rutin">
          <template #body="slotProps">
            <Checkbox
              v-if="slotProps.data.JENIS_R === 'R/' && !_isRacikanParent(slotProps.data)"
              v-model="slotProps.data.obat_rutin"
              :value="slotProps.data.obat_rutin"
              @change="onCheckObat(slotProps.data)"
              :binary="true"
            />
          </template>
        </Column>

        <Column field="NAMA" header="Nama Obat" style="min-width: 180px">
          <template #body="slotProps">
            <div
              class="obat-cell-name"
              :class="{ 'racikan-child-name': _isRacikanChild(slotProps.data) }"
            >
              <i v-if="_isRacikanParent(slotProps.data)" class="pi pi-list racikan-parent-icon" />
              <i
                v-else-if="_isRacikanChild(slotProps.data)"
                class="pi pi-arrow-right racikan-child-icon"
              />
              {{ slotProps.data.NAMA }}
            </div>
            <span v-if="!_isRacikan(slotProps.data)" class="obat-cell-barcode">{{
              slotProps.data.BARCODE
            }}</span>
            <span v-else-if="_isRacikanParent(slotProps.data)" class="racikan-label">Racikan</span>
          </template>
        </Column>

        <Column field="JENIS_R" header="Jenis" style="width: 68px; text-align: center">
          <template #body="slotProps">
            <Tag
              v-if="slotProps.data.JENIS_R"
              :value="slotProps.data.JENIS_R"
              :severity="slotProps.data.JENIS_R === 'R/' ? 'info' : 'secondary'"
              style="font-size: 10px"
            />
          </template>
        </Column>

        <Column field="QTY" header="Qty" style="width: 96px">
          <template #body="slotProps">
            <InputText
              v-if="slotProps.data.JENIS_R == 'R/'"
              type="number"
              v-model="slotProps.data.QTY"
              class="qty-input"
              min="0"
              @update:modelValue="(val) => (slotProps.data.QTY = Math.max(0, Number(val || 0)))"
              @keydown="(e) => e.key === '-' && e.preventDefault()"
            />
            <span v-else class="text-muted-sm">—</span>
          </template>
        </Column>

        <Column field="SATUAN" header="Satuan" style="width: 76px">
          <template #body="slotProps">
            <span v-if="slotProps.data.JENIS_R" class="satuan-text">
              {{ slotProps.data.SATUAN }}
            </span>
          </template>
        </Column>

        <Column field="REMARK_ITEM" header="Cara Pakai" style="min-width: 200px">
          <template #body="slotProps">
            <div class="cara-pakai-cell">
              <Button
                icon="pi pi-book"
                severity="warn"
                text
                rounded
                size="small"
                @click="openCaraPakaiDialog(slotProps.index)"
                v-tooltip.top="'Pilih cara pakai'"
              />
              <InputText
                v-model="slotProps.data.REMARK_ITEM"
                placeholder="Cara pakai…"
                class="cara-pakai-input"
              />
            </div>
          </template>
        </Column>

        <Column field="HARGA" header="Subtotal" style="width: 120px; text-align: right">
          <template #body="slotProps">
            <span class="price-text">
              {{ formatCurrency(slotProps.data.HARGA * slotProps.data.QTY) }}
            </span>
          </template>
        </Column>

        <Column style="width: 48px; text-align: center">
          <template #body="slotProps">
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              size="small"
              @click.stop.prevent="confirmRemoveItemObat(slotProps.index)"
              v-tooltip.left="'Hapus item'"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Footer -->
      <div class="therapy-footer">
        <div class="footer-info">
          <span class="footer-total-lbl">Total Resep</span>
          <span class="footer-total-amt">{{ formatCurrency(totalAmount) }}</span>
          <span class="footer-items-lbl">· {{ selectedObatObatan.length }} item</span>
        </div>
        <div class="footer-actions">
          <Button
            label="Histori"
            icon="pi pi-history"
            size="small"
            severity="info"
            outlined
            @click="showHistoryTeraphy = true"
          />
          <Button
            label="Hapus Semua"
            icon="pi pi-trash"
            size="small"
            severity="danger"
            outlined
            @click="clearAllItems"
            :disabled="selectedObatObatan.length === 0"
          />
          <Button
            label="Simpan Resep"
            icon="pi pi-save"
            size="small"
            severity="success"
            @click="saveItems"
            :disabled="selectedObatObatan.length === 0"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════ Dialog: Detail Resep ══════════════════════ -->
  <Dialog
    v-model:visible="detailsResep"
    modal
    :header="`Detail Resep — ${RECEIPT_NO}`"
    :style="{ width: '900px', maxWidth: '96vw' }"
    :closable="true"
  >
    <div class="mb-3">
      <Tag :severity="progress == 'C' ? 'success' : 'warn'" class="detail-status-tag">
        <i
          :class="progress == 'C' ? 'pi pi-check-circle' : 'pi pi-clock'"
          style="margin-right: 4px"
        ></i>
        {{ progress === 'C' ? 'Selesai' : 'Menunggu' }}
        <span v-if="jamSelesai">&nbsp;· {{ jamSelesai }}</span>
      </Tag>
    </div>

    <DataTable
      :value="detils_obat"
      :scrollable="true"
      scrollHeight="380px"
      class="p-datatable-sm"
      :rowHover="true"
      stripedRows
    >
      <template #empty>
        <div class="tbl-empty">
          <i class="pi pi-info-circle"></i>
          <p>Tidak ada data obat</p>
        </div>
      </template>

      <Column field="BARCODE" header="Barcode" style="width: 110px">
        <template #body="slotProps">
          <Tag :value="slotProps.data.BARCODE" severity="secondary" class="text-xs" />
        </template>
      </Column>
      <Column field="NAMABARANG_REQ" header="Item Diminta" :sortable="true" />
      <Column field="NAMABARANG" header="Item Diberikan" :sortable="true" />
      <Column
        field="QTY_REQ"
        header="Permintaan"
        style="width: 100px; text-align: center"
        :sortable="true"
      />
      <Column field="REMARK_ITEM" header="Dosis" :sortable="true" />
      <Column
        field="QTY"
        header="Diberikan"
        style="width: 100px; text-align: center"
        :sortable="true"
      >
        <template #body="slotProps">
          <Tag
            :value="String(slotProps.data.QTY)"
            :severity="slotProps.data.QTY > 0 ? 'success' : 'warn'"
            style="min-width: 48px; justify-content: center"
          />
        </template>
      </Column>
      <Column
        field="QTY_COPY"
        header="Copy Resep"
        style="width: 100px; text-align: center"
        :sortable="true"
      >
        <template #body="slotProps">
          <Tag
            v-if="slotProps.data.QTY_COPY > 0"
            :value="String(slotProps.data.QTY_COPY)"
            severity="info"
            style="min-width: 48px; justify-content: center"
          />
        </template>
      </Column>
    </DataTable>
  </Dialog>

  <!-- ══════════════════════ Dialog: Cara Pakai ═══════════════════════ -->
  <Dialog
    v-model:visible="showCaraPakaiObat"
    :style="{ width: '440px' }"
    modal
    header="Pilih Cara Pakai Obat"
    :closable="true"
  >
    <span class="p-input-icon-left w-full">
      <i class="pi pi-search" />
      <InputText
        v-model="searchValue"
        @input="listCaraMinumObat(searchValue)"
        placeholder="Ketik cara pakai…"
        class="w-full"
        autofocus
      />
    </span>

    <DataTable
      :value="listCaraPakaiObat"
      :scrollable="true"
      scrollHeight="360px"
      class="p-datatable-sm mt-2"
      :rowHover="true"
      stripedRows
    >
      <template #empty>
        <div class="tbl-empty">
          <i class="pi pi-search"></i>
          <p>Ketik untuk mencari cara pakai</p>
        </div>
      </template>

      <Column field="REMARK" header="Cara Pakai" />
      <Column style="width: 90px">
        <template #body="slotProps">
          <Button
            label="Pilih"
            size="small"
            severity="success"
            @click="pilihCaraPakai(slotProps.data.REMARK)"
          />
        </template>
      </Column>
    </DataTable>
  </Dialog>

  <!-- History Therapy Component -->
  <HIstoryTeraphy v-model:showHistoryTeraphy="showHistoryTeraphy" @sendData="getDataHistori" />

  <!-- ══════════════════════ Dialog: Resep Racikan ══════════════════════ -->
  <Dialog
    v-model:visible="showResepRacikan"
    modal
    header="Tambah Resep Racikan"
    :style="{ width: '560px' }"
    :closable="true"
  >
    <div class="racikan-form">
      <div class="racikan-header-fields">
        <div class="racikan-field" style="flex: 2">
          <label class="field-label">Nama Racikan <span class="required">*</span></label>
          <InputText v-model="TitleRacikan" placeholder="Cth: Puyer Batuk" class="w-full" />
        </div>
        <div class="racikan-field">
          <label class="field-label">Jumlah</label>
          <InputText
            type="number"
            v-model="jumlQtyResepRacikan"
            @input="handleQuantityInput"
            class="w-full"
          />
        </div>
        <div class="racikan-field">
          <label class="field-label">Satuan</label>
          <InputText v-model="SatuanRacikan" placeholder="Bungkus" class="w-full" />
        </div>
      </div>

      <div class="racikan-items-hdr">
        <span class="racikan-items-title">
          <i class="pi pi-list"></i>
          Komposisi Racikan
        </span>
        <Button
          icon="pi pi-plus"
          label="Tambah Item"
          size="small"
          severity="success"
          outlined
          @click="addItemRacik"
        />
      </div>

      <div class="racikan-item-list">
        <div v-if="itemResepRacikan.length === 0" class="racikan-empty">
          <i class="pi pi-info-circle"></i>
          Belum ada item — klik Tambah Item
        </div>
        <div v-for="(data, index) in itemResepRacikan" :key="index" class="racikan-item-row">
          <span class="racikan-item-no">{{ index + 1 }}</span>
          <InputText
            v-model="data.NAMABARANG"
            placeholder="Nama bahan/obat…"
            class="racikan-item-input"
          />
          <Button
            icon="pi pi-times"
            severity="danger"
            text
            rounded
            size="small"
            @click="removeItemRacikan(index)"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        outlined
        @click="showResepRacikan = false"
      />
      <Button label="Simpan Racikan" icon="pi pi-save" @click="ResepRacikan()" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import HIstoryTeraphy from '@/components/PoliklinikComponent/HIstoryTeraphy.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'

import { useConfigStore } from '@/stores/config'
import axios from 'axios'

const showResepRacikan = ref(false)
const configStore = useConfigStore()
const TitleRacikan = ref('')

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client, user_id, id_lokasi, disable_jika_sediaan_nol } = storeToRefs(authStore)

const selectedObatObatan = ref([])
const itemResepRacikan = ref([])

import { useRoute } from 'vue-router'
const route = useRoute()

import { useRouter } from 'vue-router'
const router = useRouter()

const listObat = ref(false)

import { useConfirm } from 'primevue/useconfirm'
const confirm = useConfirm()

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const showHistoryTeraphy = ref(false)
const jumlQtyResepRacikan = ref(0)
const detailsResep = ref(false)
const SatuanRacikan = ref('')

const searchValue = ref('')
const showCaraPakaiObat = ref(false)
const currentObatIndex = ref(null)

const handleQuantityInput = () => {
  jumlQtyResepRacikan.value = parseInt(jumlQtyResepRacikan.value || 0)
}

const biayaPelayanan = ref({
  POLIRUANG: '',
  KDPOLY: '',
  OBATAN: 0,
  BMHP: 0,
  LABORATORIUM: 0,
  TENAGA_AHLI: 0,
  KEPERAWATAN: 0,
  RADIOLOGI: 0,
  PLAFON_OBAT: 0,
})

const totalAmount = computed(() => {
  const totalObat = Array.isArray(selectedObatObatan.value)
    ? selectedObatObatan.value.reduce((total, item) => {
        const qty = parseFloat(item.QTY) || 0
        const harga = parseFloat(item.HARGA) || 0
        return total + qty * harga
      }, 0)
    : 0

  const biayaObatan = parseFloat(biayaPelayanan.value.OBATAN) || 0
  return totalObat + biayaObatan
})

const onCheckObat = async (item) => {
  try {
    const param = {
      mode: 1,
      no_transaksi: route.query.noreg,
      id_client: id_client.value,
      nomr: props.datapasien?.NOMR,
      ...item,
    }

    const url = configStore.apiBaseUrl
    await axios.post(`${url}/index.php/api/penunjang/update_obat_rutin`, param)
  } catch (error) {
    console.error(error)
  }
}

const calculatePercentage = () => {
  if (!biayaPelayanan.value.PLAFON_OBAT || biayaPelayanan.value.PLAFON_OBAT === 0) {
    return 0
  }
  const percentage = (totalAmount.value / biayaPelayanan.value.PLAFON_OBAT) * 100
  return Math.round(percentage)
}

const total_amount_obat = async () => {
  try {
    const param = {
      mode: 1,
      no_transaksi: route.query.noreg,
      id_client: id_client.value,
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_data_billing_perpasien`,
      param,
    )

    if (response.data) {
      biayaPelayanan.value = {
        ...biayaPelayanan.value,
        OBATAN: parseFloat(response.data.OBATAN) || 0,
        PLAFON_OBAT: parseFloat(response.data.PLAFON_OBAT) || 0,
      }
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat data billing')
  }
}

const obat_kronisBPJS = async () => {
  const routeData = router.resolve({
    name: 'TransaksiResepView',
    params: {
      nosep: props.datapasien.NOSEP,
    },
  })
  window.open(routeData.href, '_blank')
}

const addItemRacik = () => {
  itemResepRacikan.value.push({
    NAMABARANG: '',
    JENIS_RESEP: 'RR',
  })
}

const openCaraPakaiDialog = (index) => {
  currentObatIndex.value = index
  searchValue.value = ''
  listCaraPakaiObat.value = []
  showCaraPakaiObat.value = true
}

const pilihCaraPakai = (remark) => {
  if (currentObatIndex.value !== null && selectedObatObatan.value[currentObatIndex.value]) {
    selectedObatObatan.value[currentObatIndex.value].REMARK_ITEM = remark
    showCaraPakaiObat.value = false
    showSuccess('Cara pakai berhasil dipilih')
  }
}

const removeItemRacikan = (index) => {
  itemResepRacikan.value.splice(index, 1)
}

const props = defineProps({
  datapasien: {
    type: Object,
    required: true,
    validator: (value) => value && typeof value === 'object',
  },
})

const listCaraPakaiObat = ref([])

const listCaraMinumObat = async (keyword) => {
  try {
    if (keyword == '' || keyword.length < 2) {
      listCaraPakaiObat.value = []
      return
    }

    const param = {
      mode: 2,
      keyword: keyword,
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/get_remarkv3`, param)

    if (response.data?.response) {
      listCaraPakaiObat.value = response.data?.response
    } else {
      listCaraPakaiObat.value = []
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat cara pakai obat')
  }
}

const currentDateTime = ref('')

const formatDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const loading = ref(false)

const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Berhasil',
    detail: message,
    life: 3000,
  })
}

const confirmRemoveItemObat = (index) => {
  const obat = selectedObatObatan.value[index]
  const namaObat = obat?.NAMA
  const isParent = _isRacikanParent(obat)

  const childCount = isParent
    ? selectedObatObatan.value.filter(
        (item) => item.RACIKAN_GROUP_ID === obat.RACIKAN_GROUP_ID && !_isRacikanParent(item),
      ).length
    : 0

  const message = isParent
    ? `Hapus racikan "${namaObat}" beserta ${childCount} item komposisinya?`
    : `Anda ingin menghapus item "${namaObat}"?`

  confirm.require({
    message,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => removeItem(index, obat),
  })
}

const ConfirmVoidResep = (RECEIPT_NO, index) => {
  confirm.require({
    message: `Anda ingin membatalkan resep "${RECEIPT_NO}"?`,
    header: 'Konfirmasi Batal Resep',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Tidak',
    acceptLabel: 'Batalkan',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => RemoveResep(RECEIPT_NO, index),
  })
}

const RemoveResep = async (RECEIPT_NO, index) => {
  try {
    const url = configStore.apiApotikUrl
    const paramUrl = `${RECEIPT_NO}/${id_client.value}/${0}`
    const response = await axios.post(`${url}/index.php/api/sales/void_sales/${paramUrl}`)

    if (response.data.metadata.code == '200') {
      riwayat_obat.value.splice(index, 1)
      showSuccess('Resep berhasil dibatalkan')
    } else {
      showError(response.data.metadata.message)
    }
  } catch (error) {
    console.error(error)
    showError('Gagal menghapus resep')
  }
}

const detils_obat = ref([])
const progress = ref(null)
const jamSelesai = ref(null)
const RECEIPT_NO = ref(null)

const getdetail_sales = async (no_receipt) => {
  loading.value = true
  try {
    RECEIPT_NO.value = no_receipt
    const param = {
      NOREGIRTER_KLINIK: no_receipt,
      RECEIPT_NO: no_receipt,
      MODE: 'RCPT',
      IDCLIENT: id_client.value,
      TGLMIN: '',
      TGLMAX: '',
      MEMBERSHIP: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/billv2`, param)

    detils_obat.value = response.data.response || []
    if (response.data.response && response.data.response.length > 0) {
      jamSelesai.value = response.data.response[0].SELESAI
      progress.value = response.data.response[0].STATUS_PROGRESS
    }

    detailsResep.value = true
  } catch (error) {
    console.error(error)
    showError('Gagal memuat detail resep')
  } finally {
    loading.value = false
  }
}

const clearAllItems = () => {
  selectedObatObatan.value = []
}

const _isRacikanParent = (item) =>
  item.JENIS_R === 'R/' &&
  String(item.BARCODE ?? '').trim() === '00000' &&
  String(item.AS_PARENT ?? '') === '1'

const _isRacikanChild = (item) =>
  item.JENIS_R === '' &&
  String(item.BARCODE ?? '').trim() === '00000' &&
  String(item.AS_PARENT ?? '') === '0'

const _isRacikan = (item) => _isRacikanParent(item) || _isRacikanChild(item)

const removeItem = (index, item) => {
  if (_isRacikanParent(item) && item?.RACIKAN_GROUP_ID) {
    selectedObatObatan.value = selectedObatObatan.value.filter(
      (o) => o.RACIKAN_GROUP_ID !== item.RACIKAN_GROUP_ID,
    )
  } else {
    selectedObatObatan.value.splice(index, 1)
  }
}

const getRowClass = (data) => {
  if (_isRacikanParent(data)) return 'row-racikan-parent'
  if (_isRacikanChild(data)) return 'row-racikan-child'
  return ''
}

const riwayat_obat = ref([])

const get_riwayat = async () => {
  loading.value = true
  try {
    const param = {
      NOREGIRTER_KLINIK: route.query.noreg,
      RECEIPT_NO: route.query.noreg,
      MODE: 'RESEP_HISTORY',
      IDCLIENT: id_client.value,
      TGLMIN: '',
      TGLMAX: '',
    }

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/get_header_sales`, param, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.data?.response) {
      riwayat_obat.value = response.data.response.filter((x) => x.OBAT_OBATAN == 1)
      total_amount_obat()
    } else {
      riwayat_obat.value = []
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat riwayat obat')
  } finally {
    loading.value = false
  }
}

const kirim_resep = async (rcpt_no) => {
  loading.value = true
  const param = {
    RECEIPT_NO: rcpt_no,
  }
  try {
    const url = configStore.apiApotikUrl
    await axios.post(`${url}/index.php/api/sales/kirim_resep/${id_client.value}`, param)

    await get_riwayat()
    showSuccess('Resep berhasil dikirim')
  } catch (error) {
    console.error(error)
    showError('Gagal mengirim resep')
  } finally {
    loading.value = false
  }
}

const availableObat = ref([])
const searchQuery = ref('')

const saveItems = async () => {
  if (selectedObatObatan.value.length === 0) {
    showWarning('Tidak ada item yang akan disimpan')
    return
  }

  currentDateTime.value = formatDateTime()
  const headerObat = {
    header: {
      RECEIPT_NO: '',
      MEMBERSHIP_ID: props.datapasien?.NOMR,
      SALESNO: 0,
      IDUSER: user_id.value,
      TANGGAL: currentDateTime.value,
      IDPAYEMENT: props.datapasien?.KODECARABAYAR,
      NOTE: `${props.datapasien?.NOMR},${props.datapasien?.DATA_SINGKAT}`,
      SUBTOTAL: 0,
      TAXPERCENT: 0,
      TAXAMOUNT: 0,
      TOTALBAYAR: 0,
      POTONGAN: 0,
      MODE: 'REG',
      IDCLIENT: id_client.value,
      GRANDTOTAL: 0,
      KEMBALIAN: 0,
      ID_LOKASI: id_lokasi.value,
      ROOM_TABLE_NUMBER: 0,
      RESV_ID: 0,
      NO_REGISTER: props.datapasien?.NOPENDAFTARAN,
      SERVER_ID: 0,
      POLI_RUANG: props.datapasien?.POLI,
      DPJP: props.datapasien?.NAMADOKTER,
      SERVER_NAME: '',
      STATUS_PROGRESS: '',
      OBAT_OBATAN: 1,
      AS_PARENT: 0,
      TGL_SELESAI: '',
      KLINIS: '',
      JENIS_RESEP: 'RT',
      CARAPAKAI_RACIK: '',
      JML_RACIK: '',
      BENTUK_RACIK: '',
      OBAT_PULANG: 0,
      details: selectedObatObatan.value,
    },
  }

  loading.value = true
  try {
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/insert_sales_v3`, headerObat)

    console.log(response.data)
    if (response.data?.metadata?.code == 200) {
      showSuccess('Data berhasil disimpan')
      selectedObatObatan.value = []
      await get_riwayat()
    } else {
      showError(response.data?.metadata?.message || 'Gagal menyimpan data')
    }
  } catch (error) {
    console.error(error)
    showError('Terjadi kesalahan saat menyimpan data')
  } finally {
    loading.value = false
  }
}

const datafromCopyResep = ref(null)

const ResepRacikan = async () => {
  try {
    if (!TitleRacikan.value) {
      showWarning('Nama racikan harus diisi')
      return
    }

    if (itemResepRacikan.value.length === 0) {
      showWarning('Item racikan harus diisi')
      return
    }

    const groupId = `RR_${Date.now()}`

    const mainRacikanItem = {
      BARCODE: '00000',
      ID_BARANG: '00000',
      NAMA: TitleRacikan.value,
      AS_PARENT: 1,
      JENIS_R: 'R/',
      SATUAN: SatuanRacikan.value,
      HARGA: 0,
      POTONGSTOCK: 0,
      QTY_RACIK: 0,
      PERSEDIAAN: 0,
      MEREK: '',
      QTY: jumlQtyResepRacikan.value,
      QTY_REQ: jumlQtyResepRacikan.value,
      JENIS: '',
      SATUAN_RACIK: SatuanRacikan.value,
      RACIKAN_GROUP_ID: groupId,
    }

    addItem(mainRacikanItem)

    itemResepRacikan.value.forEach((item) => {
      if (item.NAMABARANG) {
        const setItem = {
          BARCODE: '00000',
          ID_BARANG: '00000',
          NAMA: item.NAMABARANG,
          JENIS_RESEP: item.JENIS_RESEP,
          AS_PARENT: 0,
          SATUAN: '',
          JENIS_R: '',
          HARGA: 0,
          POTONGSTOCK: 0,
          QTY_RACIK: 0,
          PERSEDIAAN: 0,
          MEREK: '',
          QTY: 0,
          JENIS: '',
          SATUAN_RACIK: '',
          RACIKAN_GROUP_ID: groupId,
        }
        addItem(setItem, 2)
      }
    })

    TitleRacikan.value = ''
    SatuanRacikan.value = ''
    jumlQtyResepRacikan.value = 0
    itemResepRacikan.value = []
    showResepRacikan.value = false

    showSuccess('Resep racikan berhasil ditambahkan')
  } catch (error) {
    console.error(error)
    showError('Gagal menambahkan resep racikan')
  }
}

const getDataHistori = async (data) => {
  try {
    const plain = data._rawValue || data.value || data
    datafromCopyResep.value = plain

    console.log('datafromCopyResep', plain)

    if (Array.isArray(datafromCopyResep.value)) {
      datafromCopyResep.value.forEach((item) => {
        const setItem = {
          BARCODE: item.BARCODE,
          NAMA: item.NAMABARANG,
          SATUAN: item.SATUAN,
          MEREK: item.SATUAN,
          HARGA: parseFloat(item.HARGA),
          POTONGSTOCK: item.POTONGSTOCK || 0,
          QTY_RACIK: 0,
          JENIS_R: 'R/',
          PERSEDIAAN: 0,
          REMARK_ITEM: item.REMARK_ITEM,
          QTY: parseFloat(item.QTY) == 0 ? parseFloat(item.QTY_COPY) : parseFloat(item.QTY),
          JENIS: item.JENIS,
          SATUAN_RACIK: '',
        }

        addItem(setItem, 2)
      })
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat data histori')
  }
}

const addItem = (item, mode) => {
  try {
    currentDateTime.value = formatDateTime()

    if (!item.NAMA && !item.CAPTION) {
      showWarning('Nama obat tidak boleh kosong')
      return
    }

    console.log('mode', mode)

    if (mode == 1) {
      item.JENIS_R = 'R/'
    }

    selectedObatObatan.value.push({
      BARCODE: item.BARCODE || '00000',
      ID_BARANG: item.BARCODE || '00000',
      JENIS_R: item.JENIS_R || '',
      NAMA: item.NAMA || item.CAPTION || '',
      SATUAN: item.SATUAN || '',
      RECEIPT_NO: '',
      HARGA: item.HARGAJUAL || item.HARGA || 0,
      POTONGSTOCK: item.POTONGSTOCK || 0,
      TOTAL_ITEM: 0,
      KATEGORI: item.KATEGORI,
      QTY_RACIK: item.QTY_RACIK || 0,
      PERSEDIAAN: item.QUANTITY || item.QUNATITY || item.PERSEDIAAN || 0,
      SATUAN_RACIK: item.SATUAN_RACIK || '',
      MEREK: item.MEREK,
      TOTALAMOUNT: 0,
      DISCOUNT: 0,
      ITEMSEQNO: '',
      SUBITEMSEQNO: 1,
      QTY: item.QTY || 0,
      STATUS: '',
      DOSIS: '',
      STATUS_PROGRESS: 'M',
      SUB_BARCODE: item.SUB_BARCODE || '',
      OBAT_OBATAN: 1,
      AS_PARENT: item.AS_PARENT ?? 0,
      SAT_RACIK: '',
      FLAG: 'NEW LINE',
      JENIS: item.JENIS || '',
      JENIS_RESEP: mode == 1 ? 'RT' : 'RR',
      ID_LOKASI: id_lokasi.value,
      REMARK: item.REMARK || '',
      REMARK_ITEM: item.REMARK_ITEM || '',
      TANGGAL_TRANS: currentDateTime.value,
      JML_RACIK: 0,
      RACIKAN_GROUP_ID: item.RACIKAN_GROUP_ID || '',
    })
  } catch (error) {
    console.error(error)
    showError('Gagal menambahkan item')
  }
}

const showError = (message = 'An error occurred') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

const showWarning = (message) => {
  toast.add({
    severity: 'warn',
    summary: 'Perhatian',
    detail: message,
    life: 4000,
  })
}

const findObatan = async (mode, barcode) => {
  try {
    if (searchQuery.value.length <= 2) {
      availableObat.value = []
      return
    }

    const param = {
      barcode: barcode || '',
      mode: mode || 19,
      id_client: id_client.value,
      breakdown: 0,
      nama: searchQuery.value || '',
      lokasi: id_lokasi.value,
    }

    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/barang/getdatabarang_v31`, param)

    if (response.data?.metadata?.code == 200) {
      availableObat.value = response.data.response || []
    } else {
      availableObat.value = []
      showWarning('Tidak ada data obat ditemukan')
    }
  } catch (error) {
    console.error('Error searching medicines:', error)
    availableObat.value = []
    showError('Gagal mencari data obat')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/* ── Recent Obat Poli ─────────────────────────────────── */
const recentObat = ref([])
const loadingRecent = ref(false)

const getTodayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const getRecentObat = async () => {
  const kodePoli = props.datapasien?.KODERUANGAN || 'UNKNOWN'
  const RECENT_OBAT_KEY = `recent_obat_poly_${kodePoli}`
  const RECENT_OBAT_DATE_KEY = `recent_obat_poly_date_${kodePoli}`

  try {
    loadingRecent.value = true
    const today = getTodayStr()
    const savedDate = localStorage.getItem(RECENT_OBAT_DATE_KEY)

    if (savedDate === today) {
      const cached = localStorage.getItem(RECENT_OBAT_KEY)
      if (cached) {
        recentObat.value = JSON.parse(cached)
        return
      }
    }

    localStorage.removeItem(RECENT_OBAT_KEY)
    localStorage.removeItem(RECENT_OBAT_DATE_KEY)

    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/data_referensi/get_recent_obat_poly`, {
      id_client: id_client.value,
      kode_poli: kodePoli,
      limit: '20',
    })
    if (response.data?.code === 200) {
      recentObat.value = response.data.result || []
      localStorage.setItem(RECENT_OBAT_KEY, JSON.stringify(recentObat.value))
      localStorage.setItem(RECENT_OBAT_DATE_KEY, today)
    }
  } catch (error) {
    console.error('Gagal memuat recent obat:', error)
  } finally {
    loadingRecent.value = false
  }
}

const addRecentObat = (item) => {
  addItem(
    {
      BARCODE: item.BARCODE,
      CAPTION: item.NAMABARANG,
      SATUAN: item.SATUAN,
      HARGAJUAL: item.HARGA || 0,
      HARGA: item.HARGA || 0,
      QTY: 0,
      QUNATITY: 0,
      MEREK: item.SATUAN,
    },
    1,
  )
}

watch(listObat, (val) => {
  if (val && recentObat.value.length === 0) {
    getRecentObat()
  }
})

onMounted(() => {
  get_riwayat()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   Layout utama: sidebar + main
═══════════════════════════════════════════════════ */
.therapy-wrapper {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  min-height: 560px;
}

/* ── Sidebar ─────────────────────────────────────── */
.therapy-sidebar {
  width: 188px;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.sidebar-hdr {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;
}
.sidebar-hdr-icon {
  color: #64748b;
  font-size: 13px;
}
.sidebar-hdr-title {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  flex: 1;
}
.sidebar-count {
  font-size: 10px !important;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 8px;
  color: #94a3b8;
  font-size: 11px;
  text-align: center;
}
.sidebar-empty i {
  font-size: 22px;
}
.sidebar-empty p {
  margin: 0;
}

/* Resep Card */
.resep-card {
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  padding: 8px 9px;
  background: #fff;
  transition: box-shadow 0.15s;
}
.resep-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.resep-sent {
  border-left: 3px solid #22c55e;
}
.resep-pending {
  border-left: 3px solid #f97316;
}

.resep-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.resep-date {
  font-size: 10px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3px;
}
.resep-time {
  font-size: 10px;
  color: #94a3b8;
}

.resep-status-row {
  margin-bottom: 3px;
}
.resep-tag {
  font-size: 10px !important;
  padding: 2px 6px !important;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.resep-sent-time {
  font-size: 9px;
  color: #64748b;
  margin-bottom: 4px;
}

.resep-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.resep-btn {
  font-size: 10px !important;
  padding: 2px 6px !important;
  height: 24px !important;
}
.resep-btn-del {
  margin-left: auto;
}

/* ── Main content ────────────────────────────────── */
.therapy-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

/* Plafon bar */
.plafon-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 8px;
}
.plafon-ok {
  background: #f0fdf4;
}
.plafon-exceeded {
  background: #fff1f2;
}

.plafon-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.plafon-lbl {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.plafon-amount {
  font-size: 18px;
  font-weight: 700;
  color: #16a34a;
}
.plafon-amount-over {
  color: #dc2626;
}

.plafon-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.plafon-max-lbl {
  font-size: 11px;
  color: #64748b;
}

/* Toolbar */
.therapy-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.toolbar-icon {
  color: #64748b;
  font-size: 14px;
}
.toolbar-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}
.toolbar-count {
  font-size: 10px !important;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-racikan {
  background-color: #db2777 !important;
  border-color: #db2777 !important;
  color: #fff !important;
}
.btn-racikan:hover {
  background-color: #be185d !important;
}

/* Table tweaks */
.therapy-table {
  flex: 1;
}

.obat-cell-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}
.obat-cell-barcode {
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
}

.qty-input {
  width: 72px;
  font-size: 12px !important;
  padding: 4px 6px !important;
  text-align: right;
}

.satuan-text {
  font-size: 11px;
  color: #475569;
}

.text-muted-sm {
  color: #cbd5e1;
  font-size: 13px;
}

.cara-pakai-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cara-pakai-input {
  flex: 1;
  font-size: 11px !important;
  padding: 4px 6px !important;
  min-width: 0;
}

.price-text {
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
}

/* Empty state */
.tbl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: #94a3b8;
  font-size: 13px;
}
.tbl-empty i {
  font-size: 28px;
}
.tbl-empty p {
  margin: 0;
}

/* Footer */
.therapy-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  gap: 8px;
}

.footer-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.footer-total-lbl {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
.footer-total-amt {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.footer-items-lbl {
  font-size: 11px;
  color: #94a3b8;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Recent Obat Poli ─────────────────────────────── */
.recent-obat-section {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 8px;
}

.recent-obat-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.recent-obat-hdr-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.recent-obat-hdr-left .pi-star-fill {
  color: #f59e0b;
  font-size: 13px;
}
.recent-loading {
  font-size: 11px;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 4px;
}
.recent-obat-empty {
  font-size: 12px;
  color: #a16207;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
}

.recent-obat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.recent-chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  cursor: pointer;
  min-width: 130px;
  max-width: 200px;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.recent-chip:hover {
  background: #fef9c3;
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
  transform: translateY(-1px);
}
.recent-chip:active {
  transform: translateY(0);
}

.recent-chip-name {
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
}
.recent-chip-price {
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
  margin-top: 2px;
}
.recent-chip-per {
  font-size: 10px;
  font-weight: 400;
  color: #64748b;
}
.recent-chip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.recent-chip-satuan {
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 3px;
}
.recent-chip-count {
  font-size: 10px;
  font-weight: 700;
  color: #d97706;
  display: flex;
  align-items: center;
  gap: 3px;
}
.recent-chip-count .pi {
  font-size: 9px;
}

/* ── Dialog: Cari Obat ─────────────────────────── */
.obat-dialog-search {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.obat-search-wrap {
  display: inline-flex;
  align-items: center;
  position: relative;
}
.obat-search-wrap i {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
  z-index: 1;
}
.obat-search-input {
  padding-left: 32px !important;
  width: 380px;
  font-size: 13px;
  height: 36px;
}
.obat-found-tag {
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1;
}

/* ── Table: List Obat — soft palette ─────────────── */
:deep(.obat-list-table .p-datatable-thead > tr > th) {
  background: #eef6ff;
  color: #3b6fa0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-bottom: 2px solid #bfdbfe;
  padding: 0.5rem 0.75rem;
}

:deep(.obat-list-table .p-datatable-tbody > tr) {
  background: #ffffff;
}
:deep(.obat-list-table .p-datatable-tbody > tr:nth-child(even)) {
  background: #f5f9ff;
}
:deep(.obat-list-table .p-datatable-tbody > tr > td) {
  border-bottom: 1px solid #e8f0fa;
  padding: 0.35rem 0.75rem;
  color: #334155;
}
:deep(.obat-list-table .p-datatable-tbody > tr:hover > td) {
  background: #dbeafe !important;
  color: #1e40af;
  transition: background 0.15s;
}

:deep(.obat-list-table .p-paginator) {
  background: #f0f7ff;
  border-top: 1px solid #bfdbfe;
  padding: 6px 10px;
}
:deep(.obat-list-table .p-paginator .p-paginator-page.p-highlight) {
  background: #3b82f6;
  color: #fff;
  border-radius: 5px;
}

.obat-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
}
.batch-badge {
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 5px;
  border-radius: 4px;
}

/* ── Dialog: Detail Resep ─────────────────────── */
.detail-status-tag {
  font-size: 12px !important;
  padding: 5px 12px !important;
}

/* ── Dialog: Resep Racikan ────────────────────── */
.racikan-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.racikan-header-fields {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.racikan-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.field-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}
.required {
  color: #dc2626;
}

.racikan-items-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}
.racikan-items-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.racikan-item-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}
.racikan-empty {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
}

.racikan-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.racikan-item-no {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  min-width: 18px;
  text-align: right;
}
.racikan-item-input {
  flex: 1;
  font-size: 12px !important;
}

/* ── Racikan row styles ──────────────────────── */
:deep(.row-racikan-parent > td) {
  background: #fdf2f8 !important;
  border-left: 3px solid #db2777;
}
:deep(.row-racikan-parent:hover > td) {
  background: #fce7f3 !important;
}
:deep(.row-racikan-child > td) {
  background: #fdf4ff !important;
  border-left: 3px solid #e9d5ff;
  padding-left: 1.4rem !important;
  color: #6b21a8;
}
:deep(.row-racikan-child:hover > td) {
  background: #f3e8ff !important;
}

.racikan-parent-icon {
  color: #db2777;
  font-size: 11px;
  margin-right: 5px;
}
.racikan-child-icon {
  color: #a855f7;
  font-size: 10px;
  margin-right: 5px;
}
.racikan-child-name {
  color: #7e22ce;
}
.racikan-label {
  font-size: 9px;
  font-weight: 700;
  color: #db2777;
  background: #fce7f3;
  border: 1px solid #fbcfe8;
  padding: 1px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* ── DataTable global tweaks ─────────────────── */
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.25rem 0.6rem;
  font-size: 12px;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.45rem 0.6rem;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: #f8fafc;
  color: #475569;
}

/* ── Misc utilities ────────────────────────────── */
.w-full {
  width: 100%;
}
.mt-2 {
  margin-top: 8px;
}
.mb-3 {
  margin-bottom: 12px;
}
.text-xs {
  font-size: 10px;
}

/* ── Responsive ────────────────────────────────── */
@media (max-width: 768px) {
  .therapy-wrapper {
    flex-direction: column;
  }
  .therapy-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 200px;
  }
  .sidebar-list {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .resep-card {
    min-width: 160px;
  }
  .racikan-header-fields {
    flex-direction: column;
  }
}
</style>
