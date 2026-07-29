import { ref } from 'vue'
import axios from 'axios'

// Pengaturan POS (izin diskon, pakai shift) — dipakai KasirView, LaporanPenjualanView, RingkasanKasirView.
// Tiap pemanggil dapat instance state sendiri, karena tiap view fetch independen.
export function usePosSetting(apiUrl, { id_client }) {
  const izinkanDiskonItem = ref(true)
  const izinkanDiskonBill = ref(true)
  const pakaiShift = ref(true)
  const loadingPosSetting = ref(true)

  const fetchPosSetting = async () => {
    loadingPosSetting.value = true
    try {
      const { data } = await axios.get(`${apiUrl.value}/pos_setting`, { params: { clientId: id_client.value } })
      const res = data?.response || {}
      izinkanDiskonItem.value = String(res.IZINKAN_DISKON_ITEM ?? 1) === '1'
      izinkanDiskonBill.value = String(res.IZINKAN_DISKON_BILL ?? 1) === '1'
      pakaiShift.value = String(res.PAKAI_SHIFT ?? 1) === '1'
    } catch {
      // silent — default izinkan semua & pakai shift kalau gagal fetch, biar kasir nggak keblokir gara-gara jaringan
    } finally {
      loadingPosSetting.value = false
    }
  }

  return { izinkanDiskonItem, izinkanDiskonBill, pakaiShift, loadingPosSetting, fetchPosSetting }
}
