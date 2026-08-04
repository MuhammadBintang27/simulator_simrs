<template>
  <div class="cart-panel">
    <div class="cart-header" :class="{ 'cart-header-pulse': headerPulse }">
      <span class="cart-header-title"><i class="pi pi-shopping-cart"></i> Keranjang</span>
      <Tag :value="`${cart.length} item`" severity="secondary" style="font-size: 11px" />
      <Button
        v-if="cart.length"
        icon="pi pi-trash"
        text
        severity="danger"
        size="small"
        class="ms-auto"
        v-tooltip.left="'Kosongkan keranjang'"
        @click="$emit('clear-cart')"
      />
    </div>

    <div class="cart-list">
      <div v-if="cart.length === 0" class="cart-empty">
        <i class="pi pi-shopping-cart"></i>
        <span>Keranjang masih kosong</span>
        <small>Cari barang di panel kiri untuk mulai transaksi</small>
      </div>
      <TransitionGroup v-else name="cart-row" tag="div" class="cart-row-group">
      <div
        v-for="item in cart"
        :key="cartItemKey(item)"
        class="cart-row"
        :class="{ 'cart-row-flash': flashKey === cartItemKey(item) }"
      >
        <div class="cart-row-top">
          <div class="cart-row-nama" :title="item.NAMA">
            {{ item.NAMA }}
            <Tag v-if="item.IS_RACIKAN" value="Racikan" severity="help" style="font-size: 9px; margin-left: 4px" />
          </div>
          <div class="cart-row-top-actions">
            <button
              v-if="item.IS_RACIKAN"
              type="button"
              class="cart-row-edit"
              v-tooltip.left="'Edit racikan'"
              @click="$emit('edit-racikan', item)"
            >
              <i class="pi pi-pencil"></i>
            </button>
            <button type="button" class="cart-row-remove" v-tooltip.left="'Hapus'" @click="$emit('remove-item', item)">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <template v-if="item.IS_RACIKAN">
          <button type="button" class="cart-row-bottom cart-row-racikan-toggle" @click="toggleRacikanDetail(item)">
            <i class="pi" :class="isRacikanExpanded(item) ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
            <span class="cart-row-racikan-meta"
              >{{ item.JML_BUNGKUS }} bungkus · {{ item.BENTUK }} · {{ item.bahan.length }} bahan</span
            >
            <div class="cart-row-total ms-auto">{{ formatRupiah(lineTotal(item)) }}</div>
          </button>
          <div v-if="isRacikanExpanded(item)" class="cart-row-racikan-detail">
            <div v-for="(bh, i) in item.bahan" :key="i" class="cart-row-racikan-bahan-row">
              <span class="cart-row-racikan-bahan-nama">{{ bh.NAMA }}</span>
              <span class="cart-row-racikan-bahan-qty">{{ bh.QTY }} {{ bh.SATUAN || '' }}</span>
              <span class="cart-row-racikan-bahan-sub">{{ formatRupiah((bh.QTY || 0) * bh.HARGA) }}</span>
            </div>
            <div v-if="item.JASA_RACIK > 0" class="cart-row-racikan-bahan-row">
              <span class="cart-row-racikan-bahan-nama">Jasa Racik</span>
              <span class="cart-row-racikan-bahan-sub">{{ formatRupiah(item.JASA_RACIK) }}</span>
            </div>
          </div>
        </template>

        <div v-else class="cart-row-bottom">
          <Select
            v-if="item.SATUAN_OPTIONS?.length > 1"
            :modelValue="item.SATUAN"
            @update:modelValue="(v) => $emit('change-satuan', item, v)"
            :options="item.SATUAN_OPTIONS"
            optionLabel="label"
            optionValue="value"
            class="cart-row-satuan"
          />
          <span v-else class="cart-row-satuan-label">{{ item.SATUAN || 'pcs' }}</span>

          <span class="cart-row-harga">{{ formatRupiah(item.HARGA) }}</span>

          <button
            v-if="izinkanDiskonItem"
            type="button"
            class="cart-row-disc-btn"
            :class="{ 'cart-row-disc-btn-active': hasDiscount(item) }"
            v-tooltip.top="'Diskon item ini'"
            @click="openDiscPopover($event, item)"
          >
            <i class="pi pi-percentage"></i>
            <span v-if="hasDiscount(item)">{{ discountLabel(item) }}</span>
          </button>

          <div class="cart-row-qty">
            <button type="button" class="qty-btn" @click="$emit('dec-qty', item)">
              <i class="pi pi-minus"></i>
            </button>
            <input
              type="number"
              inputmode="decimal"
              step="any"
              class="qty-input"
              :value="item.QTY"
              @change="onQtyChange(item, $event)"
            />
            <button type="button" class="qty-btn" @click="$emit('inc-qty', item)">
              <i class="pi pi-plus"></i>
            </button>
          </div>

          <div class="cart-row-total">
            <span v-if="hasDiscount(item)" class="cart-row-total-strike">{{ formatRupiah(item.QTY * item.HARGA) }}</span>
            {{ formatRupiah(lineTotal(item)) }}
          </div>
        </div>
      </div>
      </TransitionGroup>
    </div>

    <!-- ══ Popover: Diskon per item ══ -->
    <Popover ref="discPopoverRef">
      <div class="disc-popover" v-if="discItem">
        <div class="disc-popover-title">{{ discItem.NAMA }}</div>
        <SelectButton
          v-model="discType"
          :options="discTypeOptions"
          optionLabel="label"
          optionValue="value"
          class="disc-type-select"
        />
        <InputNumber
          v-model="discValue"
          mode="decimal"
          :min="0"
          :max="discType === 'PERSEN' ? 100 : discItem.HARGA"
          :maxFractionDigits="0"
          inputmode="decimal"
          class="w-100 disc-value-input"
          :placeholder="discType === 'PERSEN' ? '0%' : 'Rp 0 / satuan'"
          autofocus
        />
        <div class="disc-popover-actions">
          <Button v-if="hasDiscount(discItem)" label="Hapus" text severity="danger" size="small" @click="clearDiscount" />
          <Button label="Terapkan" size="small" class="ms-auto" @click="applyDiscount" />
        </div>
      </div>
    </Popover>

    <div class="cart-footer">
      <div class="summary-row">
        <span>Subtotal</span>
        <span class="summary-val">{{ formatRupiah(cartSubtotal) }}</span>
      </div>
      <div v-if="izinkanDiskonBill" class="summary-row">
        <span>Potongan</span>
        <InputNumber
          :modelValue="potongan"
          @update:modelValue="$emit('update:potongan', $event || 0)"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :maxFractionDigits="0"
          :min="0"
          :max="cartSubtotal"
          inputmode="decimal"
          class="potongan-input"
          placeholder="Rp 0"
          :disabled="!cart.length"
        />
      </div>
      <div class="summary-row summary-grand">
        <span>Grand Total</span>
        <span>{{ formatRupiah(grandTotal) }}</span>
      </div>
      <Button
        label="Lanjut ke Pembayaran"
        icon="pi pi-arrow-right"
        icon-pos="right"
        class="checkout-btn w-100 mt-2"
        size="large"
        :disabled="!cart.length"
        @click="showPayment = true"
      />
    </div>

    <!-- ══ Dialog Pembayaran ══ -->
    <Dialog
      v-model:visible="showPayment"
      modal
      :draggable="false"
      :style="{ width: '95vw', maxWidth: selectedRegister ? '760px' : '460px' }"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 10px">
          <i class="pi pi-wallet" style="color: var(--p-primary-color)"></i>
          <span style="font-weight: 700">Pembayaran</span>
        </div>
      </template>

      <div class="payment-body" :class="{ 'payment-body-split': selectedRegister }">
        <div class="payment-body-main">
          <div v-if="potongan > 0" class="payment-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatRupiah(cartSubtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Potongan</span>
              <span class="text-potongan">- {{ formatRupiah(potongan) }}</span>
            </div>
          </div>

          <div class="payment-grand">
            <span>Grand Total</span>
            <span>{{ formatRupiah(grandTotal) }}</span>
          </div>

          <SelectButton
            :modelValue="idPayment"
            @update:modelValue="(v) => v !== null && $emit('update:idPayment', v)"
            :options="paymentOptions"
            optionLabel="label"
            optionValue="value"
            class="payment-select"
          >
            <template #option="{ option }">
              <i :class="option.icon" style="margin-right: 6px"></i>{{ option.label }}
            </template>
          </SelectButton>

          <label class="payment-label">Total Bayar</label>
          <InputNumber
            :modelValue="totalBayar"
            @update:modelValue="$emit('update:totalBayar', $event)"
            mode="decimal"
            locale="id-ID"
            :minFractionDigits="0"
            :maxFractionDigits="0"
            :min="0"
            inputmode="decimal"
            class="w-100 payment-input"
            placeholder="0"
            autofocus
            :disabled="idPayment === 2 || idPayment === 3"
          />

          <div class="payment-quick" v-if="idPayment === 1">
            <button
              type="button"
              v-for="q in quickAmounts"
              :key="q"
              class="quick-btn"
              @click="$emit('update:totalBayar', q)"
            >
              {{ formatRupiah(q) }}
            </button>
            <button type="button" class="quick-btn quick-btn-exact" @click="$emit('update:totalBayar', grandTotal)">
              Uang Pas
            </button>
          </div>

          <div v-if="idPayment === 3" class="piutang-note">
            <i class="pi pi-info-circle"></i>
            <span>Piutang — belum ada uang diterima saat checkout, wajib terhubung ke pasien (kunjungan aktif atau No. RM).</span>
          </div>
          <div v-else class="payment-kembalian">
            <span>Kembalian</span>
            <span :class="{ 'text-danger': kembalian < 0 }">{{ formatRupiah(kembalian) }}</span>
          </div>

          <!-- ── Pasien lama tanpa kunjungan aktif (opsional, wajib untuk Piutang) ── -->
          <!-- Kalau sudah dikaitkan ke pendaftaran klinik, pasien sudah pasti -> tidak perlu cari lagi -->
          <template v-if="!selectedRegister">
            <label class="payment-label mt-2">
              Pasien
              <small>{{ idPayment === 3 ? '(wajib untuk Piutang)' : '(opsional, cari kalau tidak ada kunjungan aktif)' }}</small>
            </label>
            <div v-if="!selectedPasien" class="member-search-block">
              <SelectButton
                v-model="pasienSearchMode"
                :options="pasienSearchModeOptions"
                optionLabel="label"
                optionValue="value"
                class="member-mode-select"
              />
              <div class="member-search">
                <InputText
                  v-model="pasienQueryInput"
                  :placeholder="pasienSearchMode === 'nohp' ? 'No. HP pasien...' : 'Nama pasien...'"
                  :inputmode="pasienSearchMode === 'nohp' ? 'tel' : 'text'"
                  class="member-input"
                  @keydown.enter="emitSearchPasien"
                />
                <Button
                  icon="pi pi-search"
                  label="Cari"
                  size="small"
                  severity="secondary"
                  :loading="loadingPasienSearch"
                  @click="emitSearchPasien"
                />
              </div>
            </div>
            <div v-else class="member-chip">
              <i class="pi pi-user"></i>
              <div class="member-chip-info">
                <span class="member-chip-name">{{ selectedPasien.NAMAPASIEN }}</span>
                <span class="member-chip-meta">No RM {{ selectedPasien.NOMR }}</span>
              </div>
              <button type="button" class="member-chip-clear" v-tooltip.left="'Lepas pasien'" @click="$emit('clear-pasien')">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <div v-if="!selectedPasien && pasienResults.length > 1" class="member-table-wrap">
              <table class="member-table">
                <thead>
                  <tr>
                    <th>No RM</th>
                    <th>Nama</th>
                    <th>JK</th>
                    <th>Alamat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in pasienResults.slice(0, 20)" :key="p.NOMR" @click="$emit('select-pasien', p)">
                    <td class="mono">{{ p.NOMR }}</td>
                    <td>
                      <div class="member-table-nama">{{ p.NAMAPASIEN }}</div>
                      <div class="member-table-usia">{{ formatUsia(p.USIA_LENGKAP) }}</div>
                    </td>
                    <td>{{ p.JENISKELAMIN || '-' }}</td>
                    <td class="member-table-alamat" :title="p.ALAMAT">{{ p.ALAMAT || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <label class="payment-label mt-2">Catatan <small>(opsional)</small></label>
          <Textarea
            :modelValue="note"
            @update:modelValue="$emit('update:note', $event)"
            placeholder="Mis. minta dibungkus terpisah..."
            rows="2"
            class="w-100 note-input"
            autoResize
          />

          <Button
            label="Bayar & Cetak Struk"
            icon="pi pi-check-circle"
            class="checkout-btn w-100"
            size="large"
            :disabled="!canCheckout"
            :loading="checkingOut"
            @click="$emit('checkout')"
          />
        </div>

        <!-- ── Info pasien dari pendaftaran klinik yang dikaitkan ── -->
        <div v-if="selectedRegister" class="payment-body-side">
          <div class="pasien-info-card">
            <div class="pasien-info-header">
              <i class="pi pi-id-card"></i>
              <span>Pasien Terkait</span>
            </div>
            <div class="pasien-info-name">{{ selectedRegister.NAMAPASIEN }}</div>
            <div class="pasien-info-rows">
              <div class="pasien-info-row">
                <span>No RM</span>
                <b class="mono">{{ selectedRegister.NOMR || '-' }}</b>
              </div>
              <div class="pasien-info-row">
                <span>No Pendaftaran</span>
                <b class="mono">{{ selectedRegister.NOPENDAFTARAN || '-' }}</b>
              </div>
              <div v-if="selectedRegister.JENISKELAMIN || selectedRegister.USIA_PASIEN" class="pasien-info-row">
                <span>JK / Usia</span>
                <b>{{ selectedRegister.JENISKELAMIN || '-' }}<template v-if="selectedRegister.USIA_PASIEN">, {{ formatUsiaRegister(selectedRegister.USIA_PASIEN) }}</template></b>
              </div>
              <div v-if="selectedRegister.POLI" class="pasien-info-row">
                <span>Poli</span>
                <b>{{ selectedRegister.POLI }}</b>
              </div>
              <div v-if="selectedRegister.NAMADOKTER" class="pasien-info-row">
                <span>Dokter</span>
                <b>{{ selectedRegister.NAMADOKTER }}</b>
              </div>
              <div v-if="selectedRegister.JENISRAWAT" class="pasien-info-row">
                <span>Jenis Rawat</span>
                <b>{{ selectedRegister.JENISRAWAT }}</b>
              </div>
              <div v-if="selectedRegister.ALAMAT" class="pasien-info-row">
                <span>Alamat</span>
                <b>{{ selectedRegister.ALAMAT }}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { formatRupiah, formatUsiaRegister } from '../utils/format'
import { lineTotal } from '../utils/salesCalc'

const props = defineProps({
  cart: { type: Array, default: () => [] },
  cartSubtotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  potongan: { type: Number, default: 0 },
  totalBayar: { type: Number, default: null },
  idPayment: { type: Number, default: 1 },
  note: { type: String, default: '' },
  kembalian: { type: Number, default: 0 },
  canCheckout: { type: Boolean, default: false },
  checkingOut: { type: Boolean, default: false },
  selectedPasien: { type: Object, default: null },
  pasienResults: { type: Array, default: () => [] },
  loadingPasienSearch: { type: Boolean, default: false },
  selectedRegister: { type: Object, default: null },
  pulseKey: { type: Number, default: 0 },
  lastAddedKey: { type: String, default: null },
  izinkanDiskonItem: { type: Boolean, default: true },
  izinkanDiskonBill: { type: Boolean, default: true },
  izinkanPiutang: { type: Boolean, default: true },
})

const emit = defineEmits([
  'inc-qty',
  'dec-qty',
  'set-qty',
  'remove-item',
  'edit-racikan',
  'clear-cart',
  'change-satuan',
  'set-discount',
  'checkout',
  'search-pasien',
  'select-pasien',
  'clear-pasien',
  'update:potongan',
  'update:totalBayar',
  'update:idPayment',
  'update:note',
])

const showPayment = ref(false)
const pasienQueryInput = ref('')
const pasienSearchMode = ref('namapasien')
const pasienSearchModeOptions = [
  { label: 'Nama', value: 'namapasien' },
  { label: 'No. HP', value: 'nohp' },
]

// Parent menormalkan qty (2 desimal, min 1, mentok stok) — kalau hasilnya sama dengan nilai lama,
// Vue tidak re-render input, jadi nilai di DOM dipaksa sinkron manual.
const onQtyChange = (item, event) => {
  emit('set-qty', item, event.target.value)
  nextTick(() => {
    event.target.value = item.QTY
  })
}

const emitSearchPasien = () => {
  emit('search-pasien', { searchby: pasienSearchMode.value, param: pasienQueryInput.value })
}

// Checkout sukses -> parent mengosongkan cart -> tutup modal pembayaran otomatis
watch(
  () => props.cart.length,
  (len) => {
    if (len === 0) showPayment.value = false
  },
)

// Pasien dilepas dari luar (mis. saat cart dikosongkan) -> kosongkan input pencarian juga
watch(
  () => props.selectedPasien,
  (val) => {
    if (!val) pasienQueryInput.value = ''
  },
)

// Feedback nambah ke keranjang: bounce ikon header + flash baris item yang baru diupdate
const headerPulse = ref(false)
const flashKey = ref(null)
watch(
  () => props.pulseKey,
  () => {
    headerPulse.value = false
    nextTick(() => {
      headerPulse.value = true
      setTimeout(() => (headerPulse.value = false), 400)
    })
  },
)
watch(
  () => props.lastAddedKey,
  (key) => {
    if (!key) return
    flashKey.value = null
    nextTick(() => {
      flashKey.value = key
      setTimeout(() => {
        if (flashKey.value === key) flashKey.value = null
      }, 700)
    })
  },
)

const paymentOptions = computed(() => {
  const opts = [
    { label: 'Tunai', value: 1, icon: 'pi pi-wallet' },
    { label: 'Non-Tunai', value: 2, icon: 'pi pi-credit-card' },
  ]
  if (props.izinkanPiutang) opts.push({ label: 'Piutang', value: 3, icon: 'pi pi-clock' })
  return opts
})

// Kunci unik per baris keranjang — racikan nggak punya BARCODE, jadi pakai RACIKAN_KEY-nya sendiri.
const cartItemKey = (item) => (item.IS_RACIKAN ? item.RACIKAN_KEY : `${item.BARCODE}-${item.SUB_BARCODE}`)

// Expand/collapse detail bahan racikan langsung di keranjang
const expandedRacikan = ref(new Set())
const isRacikanExpanded = (item) => expandedRacikan.value.has(item.RACIKAN_KEY)
const toggleRacikanDetail = (item) => {
  const next = new Set(expandedRacikan.value)
  if (next.has(item.RACIKAN_KEY)) next.delete(item.RACIKAN_KEY)
  else next.add(item.RACIKAN_KEY)
  expandedRacikan.value = next
}

// Diskon per-item: PERSEN = persen dari (QTY x HARGA), RUPIAH = potongan per satuan x QTY.
// Rumus ini harus sama persis dengan yang dipakai KasirView & backend supaya preview konsisten.
// Racikan: Σ(qty bahan x harga bahan) + jasa racik — preview doang, angka final tetap dari backend.
const hasDiscount = (item) => (Number(item?.DISCOUNT) || 0) > 0
const discountLabel = (item) =>
  item.DISCOUNT_TYPE === 'RUPIAH' ? `-${formatRupiah(item.DISCOUNT)}/u` : `-${item.DISCOUNT}%`

const discPopoverRef = ref(null)
const discItem = ref(null)
const discValue = ref(0)
const discType = ref('PERSEN')
const discTypeOptions = [
  { label: '%', value: 'PERSEN' },
  { label: 'Rp/u', value: 'RUPIAH' },
]

const openDiscPopover = (event, item) => {
  discItem.value = item
  discValue.value = Number(item.DISCOUNT) || 0
  discType.value = item.DISCOUNT_TYPE || 'PERSEN'
  discPopoverRef.value?.toggle(event)
}
const applyDiscount = () => {
  if (!discItem.value) return
  emit('set-discount', discItem.value, { value: discValue.value, type: discType.value })
  discPopoverRef.value?.hide()
}
const clearDiscount = () => {
  if (!discItem.value) return
  emit('set-discount', discItem.value, { value: 0, type: discType.value })
  discPopoverRef.value?.hide()
}

// Backend balikin usia mentah format "34T,5B,9H" (tahun,bulan,hari) -> "34 th 5 bl"
const formatUsia = (val) => {
  if (!val) return '-'
  const m = String(val).match(/(\d+)T,(\d+)B/)
  if (!m) return val
  return `${m[1]} th ${m[2]} bl`
}

const quickAmounts = computed(() => {
  const g = props.grandTotal || 0
  if (g <= 0) return []
  const steps = [10000, 50000, 100000]
  const amounts = []
  for (const step of steps) {
    const val = Math.ceil(g / step) * step
    if (val > g && !amounts.includes(val)) amounts.push(val)
  }
  return amounts.slice(0, 3)
})
</script>

<style scoped>
.cart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.cart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--p-content-border-color, #e5e7eb);
  font-weight: 700;
  font-size: 14px;
}

.cart-header-title i {
  color: var(--p-primary-color);
  margin-right: 4px;
}

.cart-header-pulse .cart-header-title i {
  animation: cart-icon-bounce 0.4s ease;
}

@keyframes cart-icon-bounce {
  0% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

.cart-list {
  flex: 1;
  overflow-y: auto;
  min-height: 160px;
  padding: 6px 10px;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 30px 10px;
  color: var(--p-text-muted-color);
  text-align: center;
}

.cart-empty i {
  font-size: 2rem;
  opacity: 0.4;
}

.cart-empty small {
  font-size: 11px;
  opacity: 0.8;
}

.cart-row {
  padding: 9px 4px;
  border-bottom: 1px dashed var(--p-content-border-color, #eee);
  transition: background-color 0.3s ease;
}

.cart-row-flash {
  animation: cart-row-flash 0.7s ease;
}

@keyframes cart-row-flash {
  0% {
    background-color: var(--p-primary-100, #ddeee9);
  }
  100% {
    background-color: transparent;
  }
}

/* Efek hapus/tambah baris keranjang (TransitionGroup) */
.cart-row-group {
  position: relative;
}

.cart-row-move {
  transition: transform 0.25s ease;
}

.cart-row-enter-active,
.cart-row-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.cart-row-leave-active {
  position: absolute;
  width: 100%;
}

.cart-row-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.cart-row-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.cart-row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.cart-row-nama {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.cart-row-top-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.cart-row-remove,
.cart-row-edit {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-row-remove {
  color: var(--p-red-500, #ef4444);
}

.cart-row-remove:hover {
  background: var(--p-red-50, #fef2f2);
}

.cart-row-edit {
  color: var(--p-primary-color);
}

.cart-row-edit:hover {
  background: var(--p-primary-50, #f2f8f6);
}

.cart-row-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.cart-row-satuan {
  width: 96px;
  flex-shrink: 0;
}

.cart-row-satuan :deep(.p-select-label) {
  padding: 4px 8px;
  font-size: 11.5px;
}

.cart-row-satuan-label {
  font-size: 11px;
  color: var(--p-text-muted-color);
  background: var(--p-surface-100, #f1f5f9);
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.cart-row-harga {
  font-size: 11px;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.cart-row-racikan-meta {
  font-size: 11px;
  color: var(--p-text-muted-color);
}

.cart-row-racikan-toggle {
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  padding: 0;
}

.cart-row-racikan-toggle i {
  font-size: 10px;
  color: var(--p-text-muted-color);
}

.cart-row-racikan-detail {
  margin-top: 6px;
  padding: 8px 10px;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-row-racikan-bahan-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.cart-row-racikan-bahan-nama {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-row-racikan-bahan-qty {
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.cart-row-racikan-bahan-sub {
  font-weight: 600;
  white-space: nowrap;
  min-width: 70px;
  text-align: right;
}

.cart-row-qty {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.qty-btn {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border: 1px solid var(--p-content-border-color, #d1d5db);
  background: var(--p-surface-0, #fff);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
}

.qty-btn:hover {
  background: var(--p-primary-50, #f2f8f6);
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

.qty-input {
  width: 56px;
  text-align: center;
  border: 1px solid var(--p-content-border-color, #d1d5db);
  border-radius: 6px;
  height: 26px;
  font-size: 12px;
  font-weight: 600;
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Spinner bawaan browser disembunyikan — sudah ada tombol +/- sendiri */
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-row-total {
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  min-width: 76px;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.cart-row-total-strike {
  font-size: 10px;
  font-weight: 400;
  color: var(--p-text-muted-color);
  text-decoration: line-through;
}

.cart-row-disc-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--p-content-border-color, #d1d5db);
  background: var(--p-surface-0, #fff);
  border-radius: 6px;
  cursor: pointer;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--p-text-muted-color);
}

.cart-row-disc-btn:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

.cart-row-disc-btn-active {
  background: var(--p-orange-50, #fff7ed);
  border-color: var(--p-orange-400, #fb923c);
  color: var(--p-orange-600, #ea580c);
}

.disc-popover {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 220px;
  padding: 4px;
}

.disc-popover-title {
  font-size: 12.5px;
  font-weight: 700;
}

.disc-type-select :deep(.p-togglebutton) {
  flex: 1;
}

.disc-popover-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-footer {
  padding: 10px 14px 14px;
  border-top: 1px solid var(--p-content-border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.summary-val {
  font-weight: 600;
}

/* Input potongan: kompak, rata kanan, tidak boleh lebih lebar dari kolomnya */
.potongan-input {
  width: 120px;
  max-width: 120px;
}

.potongan-input :deep(input) {
  width: 100%;
  text-align: right;
  padding: 3px 8px;
  height: 28px;
  font-size: 12.5px;
  border-radius: 6px;
}

.summary-grand {
  font-size: 16px;
  font-weight: 800;
  color: var(--p-primary-color);
  padding-top: 4px;
  border-top: 1px solid var(--p-content-border-color, #eee);
}

.checkout-btn {
  min-height: 50px;
  font-size: 15px;
  font-weight: 700;
  margin-top: 14px;
}

.note-input {
  font-size: 12.5px;
}

.note-input :deep(textarea) {
  resize: none;
}

.text-potongan {
  color: var(--p-green-600, #16a34a);
  font-weight: 600;
}

/* ── Dialog pembayaran ── */
.payment-body {
  display: flex;
}

.payment-body-split {
  gap: 18px;
}

.payment-body-main {
  flex: 1;
  min-width: 0;
}

.payment-body-side {
  width: 240px;
  flex-shrink: 0;
}

.pasien-info-card {
  position: sticky;
  top: 0;
  background: var(--p-surface-50, #f8fafc);
  border: 1px solid var(--p-surface-200, #e2e8f0);
  border-radius: 10px;
  padding: 14px;
}

.pasien-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--p-primary-color);
  margin-bottom: 10px;
}

.pasien-info-name {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 12px;
  word-break: break-word;
}

.pasien-info-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pasien-info-row {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 12.5px;
}

.pasien-info-row span {
  color: var(--p-text-muted-color);
  font-size: 10.5px;
}

.pasien-info-row b {
  font-weight: 600;
}

.payment-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.payment-grand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  color: var(--p-primary-color);
  margin-bottom: 12px;
}

.payment-select {
  width: 100%;
  margin-bottom: 10px;
}

.payment-select :deep(.p-togglebutton) {
  flex: 1;
  min-height: 44px;
}

.payment-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  margin-bottom: 4px;
  display: block;
}

.payment-input :deep(input) {
  height: 46px;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
}

.payment-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.quick-btn {
  flex: 1;
  min-width: 80px;
  min-height: 36px;
  border: 1px solid var(--p-content-border-color, #d1d5db);
  background: var(--p-surface-0, #fff);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.quick-btn:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

.quick-btn-exact {
  background: var(--p-primary-50, #f2f8f6);
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

.payment-kembalian {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.payment-kembalian .text-danger {
  color: var(--p-red-500, #ef4444);
}

.piutang-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 10px;
  background: var(--p-amber-50, #fffbeb);
  border: 1px solid var(--p-amber-200, #fde68a);
  border-radius: 8px;
  font-size: 11.5px;
  color: var(--p-amber-700, #b45309);
  line-height: 1.5;
}

.piutang-note .pi {
  margin-top: 1px;
}

/* ── Member (opsional) ── */
.payment-label small {
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  opacity: 0.8;
}

.member-search-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.member-mode-select :deep(.p-togglebutton) {
  padding: 4px 10px;
  font-size: 11px;
}

.member-search {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-input {
  flex: 1;
}

.member-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--p-primary-50, #f2f8f6);
  border: 1px solid var(--p-primary-100, #ddeee9);
  color: var(--p-primary-700, #345f50);
}

.member-chip-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.member-chip-name {
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-chip-meta {
  font-size: 10.5px;
  opacity: 0.85;
}

.member-chip-clear {
  width: 24px;
  height: 24px;
  min-width: 24px;
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

.member-chip-clear:hover {
  background: rgba(0, 0, 0, 0.06);
}

.member-table-wrap {
  margin-top: 6px;
  max-height: 200px;
  overflow: auto;
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 8px;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}

.member-table thead th {
  position: sticky;
  top: 0;
  text-align: left;
  font-size: 10px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  background: var(--p-surface-50, #f8fafc);
  padding: 6px 8px;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
  white-space: nowrap;
}

.member-table tbody tr {
  cursor: pointer;
}

.member-table tbody tr:hover {
  background: var(--p-primary-50, #f2f8f6);
}

.member-table tbody tr:not(:last-child) td {
  border-bottom: 1px solid var(--p-content-border-color, #f1f1ee);
}

.member-table td {
  padding: 6px 8px;
  vertical-align: top;
}

.member-table-alamat {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--p-text-muted-color);
}

.member-table-nama {
  font-weight: 600;
}

.member-table-usia {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
}

.mono {
  font-family: ui-monospace, "Cascadia Code", "SF Mono", Menlo, Consolas, monospace;
}
</style>
