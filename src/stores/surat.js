import { defineStore } from 'pinia'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'

// Field form dinamis per KATEGORI_SURAT — disimpan sebagai DATA_ISIAN (JSON) di trx_surat
export const KATEGORI_SURAT_FIELDS = {
  SEHAT: [
    { key: 'tb', label: 'Tinggi Badan (cm)', type: 'number' },
    { key: 'bb', label: 'Berat Badan (kg)', type: 'number' },
    { key: 'tensi', label: 'Tensi (mmHg)', type: 'text' },
    { key: 'buta_warna', label: 'Buta Warna', type: 'select', options: ['Normal', 'Tidak Normal'] },
    { key: 'kesimpulan', label: 'Kesimpulan', type: 'textarea' },
  ],
  SAKIT: [
    { key: 'diagnosa', label: 'Diagnosa', type: 'text' },
    { key: 'lama_istirahat', label: 'Lama Istirahat (hari)', type: 'number' },
    { key: 'tgl_mulai_istirahat', label: 'Tanggal Mulai Istirahat', type: 'date' },
    { key: 'tgl_selesai_istirahat', label: 'Tanggal Selesai Istirahat', type: 'date' },
  ],
  KEJIWAAN: [
    { key: 'kesimpulan', label: 'Kesimpulan', type: 'textarea' },
  ],
}

// Dipakai sebagai dropdown KATEGORI_SURAT di master (bukan input teks bebas) —
// supaya nilainya selalu persis cocok dengan key KATEGORI_SURAT_FIELDS di atas
// dan form isian dinamis di sisi pasien tidak pernah gagal muncul karena typo/kapitalisasi.
export const KATEGORI_SURAT_OPTIONS = [
  { label: 'Sehat', value: 'SEHAT' },
  { label: 'Sakit', value: 'SAKIT' },
  { label: 'Kejiwaan', value: 'KEJIWAAN' },
]

// Placeholder yang selalu tersedia di semua kategori surat (diisi otomatis oleh backend
// saat cetak, lihat M_surat.php::cetak_surat). Template sekarang berupa file Word (.docx)
// yang diupload admin — daftar ini ditampilkan sebagai referensi nama variabel ${...} yang
// harus ditulis di dalam dokumen Word-nya (PHPWord TemplateProcessor), bukan untuk disisipkan
// otomatis lewat editor di web.
export const PLACEHOLDER_UMUM = [
  { token: 'no_surat', label: 'No. Surat' },
  { token: 'nama_surat', label: 'Nama Jenis Surat' },
  { token: 'tanggal_surat', label: 'Tanggal Surat' },
  { token: 'dokter_pemeriksa', label: 'Dokter Pemeriksa' },
  { token: 'nama_dokter', label: 'Nama Dokter (alias)' },
  { token: 'sip_dokter', label: 'SIP Dokter' },
  { token: 'hasil_pemeriksaan', label: 'Hasil Pemeriksaan' },
  { token: 'tujuan_surat', label: 'Tujuan Surat' },
  { token: 'nama_pasien', label: 'Nama Pasien' },
  { token: 'no_rm', label: 'No. Rekam Medis' },
  { token: 'tgl_lahir', label: 'Tanggal Lahir' },
  { token: 'tempat_lahir', label: 'Tempat Lahir' },
  { token: 'jenis_kelamin', label: 'Jenis Kelamin' },
  { token: 'pekerjaan', label: 'Pekerjaan' },
  { token: 'alamat_pasien', label: 'Alamat Pasien' },
  { token: 'noregister', label: 'No. Register' },
  { token: 'nama_rumah_sakit', label: 'Nama Rumah Sakit' },
  { token: 'kota', label: 'Kota' },
  { token: 'jumlah_cetak', label: 'Jumlah Cetak Ke-' },
  { token: 'qrcode', label: 'QR Code (gambar, isi = No. Surat) — taruh di dekat tanda tangan' },
]

export const useSuratStore = defineStore('surat', {
  state: () => ({
    jenisSuratList: [],
    trxSuratList: [],
    loadingJenisSurat: false,
    loadingTrxSurat: false,
  }),

  getters: {
    jenisSuratAktif: (state) => state.jenisSuratList.filter((j) => Number(j.AKTIF) === 1),
  },

  actions: {
    _apiUrl() {
      return useConfigStore().apiBaseUrl
    },
    _idClient() {
      return useAuthStore().id_client
    },
    _userId() {
      return useAuthStore().user_id
    },

    async fetchJenisSurat({ kategoriSurat = null, hanyaAktif = 1 } = {}) {
      this.loadingJenisSurat = true
      try {
        const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/list_jenis_surat`, {
          id_client: this._idClient(),
          kategori_surat: kategoriSurat,
          hanya_aktif: hanyaAktif,
        })
        this.jenisSuratList = res.data?.response ?? []
        return this.jenisSuratList
      } finally {
        this.loadingJenisSurat = false
      }
    },

    async getJenisSurat(id) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/get_jenis_surat`, {
        id,
        id_client: this._idClient(),
      })
      return res.data
    },

    async searchBarang(keyword) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/search_barang`, {
        id_client: this._idClient(),
        keyword,
      })
      return res.data?.response ?? []
    },

    async uploadTemplateFile(file) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/upload_template`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },

    async saveJenisSurat(payload) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/simpan_jenis_surat`, {
        ...payload,
        id_client: this._idClient(),
        created_by: this._userId(),
      })
      return res.data
    },

    async deleteJenisSurat(id) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/hapus_jenis_surat`, {
        id,
        id_client: this._idClient(),
      })
      return res.data
    },

    async fetchTrxByNoregister(noregister) {
      this.loadingTrxSurat = true
      try {
        const res = await axios.post(
          `${this._apiUrl()}/index.php/api/surat/get_trx_by_noregister`,
          { noregister, id_client: this._idClient() },
        )
        this.trxSuratList = res.data?.response ?? []
        return this.trxSuratList
      } finally {
        this.loadingTrxSurat = false
      }
    },

    async buatTrxSurat(payload) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/buat_trx_surat`, {
        ...payload,
        id_client: this._idClient(),
        created_by: this._userId(),
      })
      return res.data
    },

    async updateTrxSurat(payload) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/update_trx_surat`, {
        ...payload,
        id_client: this._idClient(),
      })
      return res.data
    },

    async hapusTrxSurat(id) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/hapus_trx_surat`, {
        id,
        id_client: this._idClient(),
      })
      return res.data
    },

    async konfirmasiBayar(ids) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/konfirmasi_bayar`, {
        ids,
        id_client: this._idClient(),
      })
      return res.data
    },

    async cetakSurat(id) {
      const res = await axios.post(`${this._apiUrl()}/index.php/api/surat/cetak_surat`, {
        id,
        id_client: this._idClient(),
      })
      return res.data
    },
  },
})
