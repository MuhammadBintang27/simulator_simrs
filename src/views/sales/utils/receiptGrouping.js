import { isSubItemRow, isVoidedRow } from './salesCalc'

// Grouping "riwayat transaksi" per RECEIPT_NO — card custom (bukan grouping bawaan
// PrimeVue, karena groupheader-nya nggak span penuh lebar tabel / berantakan).
// Dipakai oleh KasirView (riwayat kasir aktif), RingkasanKasirView (aktivitas shift),
// dan LaporanPenjualanView (laporan lintas-kasir) — ketiganya render data recent_sales yang sama.
export function groupReceiptsByReceiptNo(rows) {
  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.RECEIPT_NO)) {
      map.set(row.RECEIPT_NO, {
        RECEIPT_NO: row.RECEIPT_NO,
        TANGGAL: row.TANGGAL,
        IDUSER: row.IDUSER,
        rawRows: [],
        // GRANDTOTAL = nilai struk asli saat checkout, tidak pernah berubah (buat cetak ulang/audit).
        total: Number(row.GRANDTOTAL) || 0,
        // SISA_GRANDTOTAL = nilai berjalan setelah dikurangi item yang sudah di-void (BE, sudah net POTONGAN).
        sisaGrandTotal: Number(row.SISA_GRANDTOTAL) || 0,
        potongan: Number(row.POTONGAN) || 0,
        totalBayar: Number(row.TOTALBAYAR) || 0,
        kembalian: Number(row.KEMBALIAN) || 0,
        idPayement: Number(row.IDPAYEMENT) || 1,
      })
    }
    map.get(row.RECEIPT_NO).rawRows.push({ ...row, voided: isVoidedRow(row) })
  }

  const receipts = []
  for (const g of map.values()) {
    const bahanByParent = new Map()
    for (const row of g.rawRows) {
      if (!isSubItemRow(row)) continue
      if (!bahanByParent.has(row.AS_PARENT)) bahanByParent.set(row.AS_PARENT, [])
      bahanByParent.get(row.AS_PARENT).push(row)
    }
    const items = g.rawRows
      .filter((row) => !isSubItemRow(row))
      .map((row) => {
        const isRacikanParent = Number(row.AS_PARENT) > 0
        return { ...row, isRacikanParent, bahan: isRacikanParent ? bahanByParent.get(row.AS_PARENT) || [] : [] }
      })
    const voided = items.length > 0 && items.every((i) => i.voided)
    receipts.push({
      RECEIPT_NO: g.RECEIPT_NO,
      TANGGAL: g.TANGGAL,
      IDUSER: g.IDUSER,
      items,
      total: g.total,
      sisaGrandTotal: g.sisaGrandTotal,
      // Struk voided: tampilkan nilai asli (informatif, dicoret), bukan sisa 0.
      // Masih aktif/partial-void: tampilkan sisa berjalan dari BE, bukan hitung manual FE.
      displayTotal: voided ? g.total : g.sisaGrandTotal,
      partialVoid: !voided && g.sisaGrandTotal !== g.total,
      potongan: g.potongan,
      totalBayar: g.totalBayar,
      kembalian: g.kembalian,
      idPayement: g.idPayement,
      voided,
    })
  }
  return receipts
}
