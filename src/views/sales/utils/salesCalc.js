// Rumus kalkulasi baris transaksi dipakai bersama antara keranjang kasir, struk cetak,
// dan laporan riwayat transaksi — harus tetap satu implementasi supaya angka yang
// ditampilkan di ketiga tempat itu selalu konsisten satu sama lain.

// BATAL dihitung BE dari kolom STATUS ('REFUND' -> BATAL='1'); recent_sales tidak
// memfilter baris yang sudah di-void, jadi perlu ditandai beda di tampilan.
export const isVoidedRow = (row) => String(row?.BATAL) === '1'

// Racikan balik sebagai beberapa baris: induk (AS_PARENT>0, IS_SUBITEM=0) + bahan
// (AS_PARENT sama, IS_SUBITEM=1). Bahan disarangkan di bawah induknya, bukan baris terpisah.
export const isSubItemRow = (row) => String(row?.IS_SUBITEM) === '1'

// Diskon per-item: PERSEN = persen dari (QTY x HARGA), RUPIAH = potongan per satuan x QTY.
// Rumus ini harus persis sama dengan yang dipakai backend saat checkout supaya preview di FE akurat.
// BE membulatkan TOTALAMOUNT per baris ke rupiah utuh (round half up) sebelum disimpan — bukan
// di level GRANDTOTAL akhir — jadi lineTotal ikut bulatkan di sini juga per baris/per grup racikan,
// bukan cuma di grandTotal, biar hasilnya identik sampai ke rupiah (beda pembulatan per-baris vs
// di-akhir bisa selisih beberapa rupiah kalau item banyak). HARGA satuan sendiri tidak dibulatkan.
export const lineTotal = (item) => {
  if (item.IS_RACIKAN) {
    // Racikan: bulatkan Σ(bahan) + jasa racik per grup, bukan per bahan.
    const bahanTotal = (item.bahan || []).reduce((s, b) => s + (Number(b.QTY) || 0) * (Number(b.HARGA) || 0), 0)
    return Math.round(bahanTotal + (Number(item.JASA_RACIK) || 0))
  }
  const gross = item.QTY * item.HARGA
  const disc = Number(item.DISCOUNT) || 0
  if (disc <= 0) return Math.round(gross)
  const cut = item.DISCOUNT_TYPE === 'RUPIAH' ? disc * item.QTY : gross * (disc / 100)
  return Math.round(Math.max(gross - cut, 0))
}

// recent_sales ngasih DISCOUNT/DISKON_TYPE mentah per item (bukan diturunkan lagi).
export const itemDiscount = (row) => {
  const disc = Number(row?.DISCOUNT) || 0
  if (disc <= 0) return null
  const qty = Number(row?.QTY) || 0
  const gross = qty * (Number(row?.HARGA) || 0)
  const cut = row?.DISKON_TYPE === 'RUPIAH' ? disc * qty : gross * (disc / 100)
  return { cut, pct: gross > 0 ? (cut / gross) * 100 : 0 }
}

// recent_sales tidak membawa kolom jasa racik — dihitung dari selisih total induk
// dengan total bahan (TOTALAMOUNT bahan selalu 0, tapi QTY & HARGA-nya ada).
export const racikanJasa = (item) => {
  const bahanTotal = (item.bahan || []).reduce((s, b) => s + (Number(b.QTY) || 0) * (Number(b.HARGA) || 0), 0)
  return (Number(item.TOTALAMOUNT) || 0) - bahanTotal
}
