import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useKonsulNotifStore = defineStore('konsulNotif', () => {
  const unreadMasuk = ref(0)      // konsultasi masuk yang belum dibaca
  const unreadTerkirim = ref(0)   // konsultasi terkirim yang ada balasan baru
  const isLoading = ref(false)
  let _timer = null

  const total = computed(() => unreadMasuk.value + unreadTerkirim.value)

  async function fetchCounts(apiBaseUrl, id_client, kd_dokter) {
    if (!id_client || !kd_dokter) return
    isLoading.value = true
    try {
      const [r1, r2] = await Promise.all([
        axios.post(`${apiBaseUrl}/index.php/api/Konsultasi_dokter/get_data_konsul`, {
          id_client,
          kd_dokter,
          mode: 2,
        }),
        axios.post(`${apiBaseUrl}/index.php/api/Konsultasi_dokter/get_konsul_terkirim`, {
          id_client,
          kd_dokter,
        }),
      ])
      unreadMasuk.value = (r1.data?.response || []).filter(
        (k) => String(k.is_read) === '0' && String(k.selesai) === '0',
      ).length
      unreadTerkirim.value = (r2.data?.response || []).filter(
        (k) => parseInt(k.balasan_baru ?? 0) > 0,
      ).length
    } catch {
      // silent — notif polling tidak boleh error break halaman
    } finally {
      isLoading.value = false
    }
  }

  function startPolling(apiBaseUrl, id_client, kd_dokter, intervalMs = 60000) {
    stopPolling()
    fetchCounts(apiBaseUrl, id_client, kd_dokter)
    _timer = setInterval(() => fetchCounts(apiBaseUrl, id_client, kd_dokter), intervalMs)
  }

  function stopPolling() {
    if (_timer) {
      clearInterval(_timer)
      _timer = null
    }
  }

  return {
    unreadMasuk,
    unreadTerkirim,
    total,
    isLoading,
    fetchCounts,
    startPolling,
    stopPolling,
  }
})
