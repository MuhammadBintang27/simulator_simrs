// Format helpers dipakai bersama di seluruh views/sales — jaga formatRupiah/formatAngka
// tetap satu implementasi biar keranjang, struk cetak, dan laporan selalu tampilkan angka yang sama.

// Dibulatin + normalisasi -0 → 0, biar sisa floating-point kecil (mis. -0.0000001 dari
// pengurangan SELISIH) tidak nongol jadi "-Rp 0" di layar.
export const roundMoney = (val) => {
  const n = Math.round(Number(val) || 0)
  return n === 0 ? 0 : n
}

export const formatRupiah = (val) => {
  if (val == null || isNaN(Number(val))) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(roundMoney(val))
}

// Sama seperti formatRupiah tapi tanpa prefix "Rp" — dipakai di kolom yang headernya
// sudah jelas menunjukkan satuan uang (mis. tabel Buku Kas / Laba Rugi).
export const formatAngka = (val) => {
  if (val == null || isNaN(Number(val))) return '0'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(roundMoney(val))
}

// Pengeluaran/pengurang ditampilkan dengan tanda minus di depan angkanya, bukan cuma di label "(-)".
export const formatAngkaNeg = (val) => {
  const n = Number(val) || 0
  return n === 0 ? formatAngka(0) : `-${formatAngka(Math.abs(n))}`
}

export const formatCompact = (val) => {
  const n = Number(val)
  if (isNaN(n)) return '0'
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}jt`
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(0)}rb`
  return `${n}`
}

export const formatCompactNeg = (val) => {
  const n = Number(val) || 0
  return n === 0 ? formatCompact(0) : `-${formatCompact(Math.abs(n))}`
}

// QTY dari BE berupa string desimal mentah dari DB ("1000.00") — buang nol di belakang koma.
export const formatQty = (val) => {
  const n = Number(val)
  if (isNaN(n)) return val ?? '-'
  return n.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

// history_versi4 (pendaftaran klinik) balikin usia sebagai objek { tahun, bulan, hari }.
export const formatUsiaRegister = (usia) => {
  if (!usia) return '-'
  return `${usia.tahun ?? 0} th ${usia.bulan ?? 0} bl`
}
