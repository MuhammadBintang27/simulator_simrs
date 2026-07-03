import { ref } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

export function useKonsultasi() {
  const configStore = useConfigStore()
  const authStore = useAuthStore()
  const { id_client } = storeToRefs(authStore)

  const dokterList = ref([])
  const isLoadingDokter = ref(false)
  const errors = ref({})

  // ── Validasi field wajib ──
  const validate = (form) => {
    const e = {}
    if (!form.dokter_tujuan?.KDDOKTER)
      e.dokter_tujuan = 'Dokter konsultan wajib dipilih'
    if (form.is_urgent === null || form.is_urgent === undefined || form.is_urgent === '')
      e.is_urgent = 'Pilih urgensi konsultasi'
    if (!form.keluhan?.trim())
      e.keluhan = 'Keluhan utama wajib diisi'
    if (!form.diagnosa?.trim())
      e.diagnosa = 'Diagnosis kerja wajib diisi'
    if (!form.pertanyaan?.trim())
      e.pertanyaan = 'Pertanyaan ke konsultan wajib diisi'
    errors.value = e
    return Object.keys(e).length === 0
  }

  const clearError = (field) => {
    const e = { ...errors.value }
    delete e[field]
    errors.value = e
  }

  // ── Fetch daftar dokter (sesuai FormPendaftaranComponent.getda_tadokter) ──
  const fetchDokterList = async () => {
    isLoadingDokter.value = true
    try {
      const res = await axios.post(
        `${configStore.apiBaseUrl}/index.php/api/data_referensi/datadokterv3`,
        { id_client: id_client.value, mode: 2 },
      )
      dokterList.value = res.data?.response || []
    } catch (e) {
      console.error('Gagal load daftar dokter:', e)
    } finally {
      isLoadingDokter.value = false
    }
  }

  // ── Simpan sebagai draft (tidak wajib valid) ──
  const simpanDraft = async (payload) => {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/simpan_draft`,
      payload,
    )
    if (!res.data.status) throw new Error(res.data.message || 'Gagal menyimpan draft')
    return res.data
  }

  // ── Kirim konsultasi (validasi dilakukan di komponen sebelum memanggil ini) ──
  const kirimKonsultasi = async (payload) => {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/kirim`,
      payload,
    )
    if (!res.data.status) throw new Error(res.data.message || 'Gagal mengirim konsultasi')
    return res.data
  }

  // ── Ambil draft tersimpan untuk noregister tertentu ──
  const getDraft = async (payload) => {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/get_draft`,
      payload,
    )
    return res.data
  }

  // ── Hapus (soft-delete) draft ──
  const hapusDraft = async (payload) => {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/hapus_draft`,
      payload,
    )
    if (!res.data.status) throw new Error(res.data.message || 'Gagal menghapus draft')
    return res.data
  }

  return {
    dokterList,
    isLoadingDokter,
    errors,
    validate,
    clearError,
    fetchDokterList,
    simpanDraft,
    kirimKonsultasi,
    getDraft,
    hapusDraft,
  }
}
