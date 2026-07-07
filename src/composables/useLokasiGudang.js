/**
 * Cek apakah lokasi aktif user adalah gudang (induk) atau ruangan biasa.
 * Gudang: bisa lihat semua barang master & satu-satunya yang boleh tambah barang baru.
 * Ruangan biasa: hanya lihat barang yang sudah ada stoknya, tidak bisa tambah barang baru.
 *
 * Usage:
 * import { useLokasiGudang } from '@/composables/useLokasiGudang'
 * const { isGudang, fetchIsGudang } = useLokasiGudang()
 * onMounted(() => fetchIsGudang())
 */

import { ref } from 'vue'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'

// Cache di level modul supaya tidak fetch ulang tiap kali view/komponen dibuka
const cache = {}
const inFlight = {}

export function useLokasiGudang() {
  const configStore = useConfigStore()
  const authStore = useAuthStore()

  const isGudang = ref(cache[cacheKey()] ?? null)

  function cacheKey(clientId = authStore.id_client, lokasiId = authStore.id_lokasi) {
    return `${clientId}_${lokasiId}`
  }

  async function fetchIsGudang() {
    const clientId = authStore.id_client
    const lokasiId = authStore.id_lokasi
    const key = cacheKey(clientId, lokasiId)

    if (cache[key] !== undefined) {
      isGudang.value = cache[key]
      return isGudang.value
    }

    if (!inFlight[key]) {
      inFlight[key] = axios
        .get(`${configStore.apiApotikUrl}/index.php/api/inventory/lokasi_info`, {
          params: { clientId, lokasiId },
        })
        .then((res) => !!res.data?.response?.IS_GUDANG)
        .catch(() => false)
        .finally(() => {
          delete inFlight[key]
        })
    }

    const result = await inFlight[key]
    cache[key] = result
    isGudang.value = result
    return result
  }

  return { isGudang, fetchIsGudang }
}
