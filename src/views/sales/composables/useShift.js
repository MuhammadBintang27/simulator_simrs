import { ref, computed } from 'vue'
import axios from 'axios'

// State shift kasir aktif — dipakai KasirView (transaksi) & RingkasanKasirView (ringkasan aktivitas).
// Tiap pemanggil dapat instance state sendiri (bukan singleton), karena tiap view fetch independen.
export function useShift(apiUrl, { id_client, id_lokasi, user_id }, { onError } = {}) {
  const shift = ref(null)
  const loadingShift = ref(true)
  const isShiftOpen = computed(() => shift.value?.STATUS === 'OPEN')

  const fetchShiftAktif = async () => {
    loadingShift.value = true
    try {
      const { data } = await axios.get(`${apiUrl.value}/shift_aktif`, {
        params: { clientId: id_client.value, lokasiId: id_lokasi.value, idUser: user_id.value },
      })
      shift.value = data?.response ?? null
    } catch (err) {
      shift.value = null
      onError?.(err)
    } finally {
      loadingShift.value = false
    }
  }

  return { shift, loadingShift, isShiftOpen, fetchShiftAktif }
}
