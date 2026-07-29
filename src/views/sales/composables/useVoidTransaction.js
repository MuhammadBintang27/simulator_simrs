import { ref } from 'vue'
import axios from 'axios'
import { formatRupiah } from '../utils/format'

// Void transaksi/item struk — dipakai KasirView (kasir aktif) & RingkasanKasirView (ringkasan shift).
// canVoid pakai proxy: recent_sales tidak membawa ID_SHIFT, jadi transaksi yang terjadi sejak
// WAKTU_BUKA shift aktif saat ini dianggap masih bisa di-void. Backend tetap memvalidasi ulang,
// jadi proxy ini aman kalau meleset.
export function useVoidTransaction(apiUrl, { id_client, pakaiShift, isShiftOpen, shift, toast, confirm, onVoided }) {
  const canVoid = (receipt) => {
    if (!pakaiShift.value) return true
    if (!isShiftOpen.value || !shift.value?.WAKTU_BUKA) return false
    const t = new Date(String(receipt.TANGGAL).replace(' ', 'T'))
    const buka = new Date(String(shift.value.WAKTU_BUKA).replace(' ', 'T'))
    if (isNaN(t.getTime()) || isNaN(buka.getTime())) return false
    return t >= buka
  }

  const voidingReceipt = ref(null)
  const confirmVoid = (receipt) => {
    confirm.require({
      message: `Batalkan transaksi <b>${receipt.RECEIPT_NO}</b>? Stok akan dikembalikan otomatis.`,
      header: 'Konfirmasi Void',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Batalkan',
      rejectLabel: 'Tutup',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => doVoid(receipt),
    })
  }
  const doVoid = async (receipt) => {
    voidingReceipt.value = receipt.RECEIPT_NO
    try {
      const { data } = await axios.post(`${apiUrl.value}/void`, {
        RECEIPT_NO: receipt.RECEIPT_NO,
        IDCLIENT: Number(id_client.value),
      })
      if (data?.metadata?.code === 200) {
        const voidAmount = Number(data?.response?.VOID_AMOUNT) || 0
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: `Total transaksi dibatalkan: ${formatRupiah(voidAmount)}`,
          life: 3000,
        })
        await onVoided?.()
      } else {
        toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal membatalkan transaksi', life: 4000 })
      }
    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.metadata?.message || 'Gagal membatalkan transaksi',
        life: 4000,
      })
    } finally {
      voidingReceipt.value = null
    }
  }

  const voidingItemKey = ref(null)
  const confirmVoidItem = (receipt, item) => {
    confirm.require({
      message: `Batalkan item <b>${item.NAMA}</b> dari transaksi <b>${receipt.RECEIPT_NO}</b>? Stok akan dikembalikan otomatis.`,
      header: 'Konfirmasi Batalkan Item',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Batalkan',
      rejectLabel: 'Tutup',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => doVoidItem(receipt, item),
    })
  }
  const doVoidItem = async (receipt, item) => {
    const key = `${receipt.RECEIPT_NO}-${item.ID_DETAIL}`
    voidingItemKey.value = key
    try {
      const { data } = await axios.post(`${apiUrl.value}/void_item`, {
        RECEIPT_NO: receipt.RECEIPT_NO,
        ID_DETAIL: item.ID_DETAIL,
        IDCLIENT: Number(id_client.value),
      })
      if (data?.metadata?.code === 200) {
        // VOID_AMOUNT murni nilai item (+ bahan racikan jika ada) yang baru dibatalkan,
        // belum dikurangi diskon bill — bukan "sisa" atau "total refund".
        const voidAmount = Number(data?.response?.VOID_AMOUNT) || 0
        const headerVoid = data?.response?.HEADER_VOID === true
        toast.add({
          severity: 'success',
          summary: 'Berhasil',
          detail: headerVoid
            ? `Item terakhir dibatalkan (${formatRupiah(voidAmount)}) — struk otomatis dibatalkan seluruhnya`
            : `Item dibatalkan (${formatRupiah(voidAmount)})`,
          life: 3000,
        })
        await onVoided?.()
      } else {
        toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal membatalkan item', life: 4000 })
      }
    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.response?.data?.metadata?.message || 'Gagal membatalkan item',
        life: 4000,
      })
    } finally {
      voidingItemKey.value = null
    }
  }

  return { canVoid, voidingReceipt, confirmVoid, confirmVoidItem, voidingItemKey }
}
