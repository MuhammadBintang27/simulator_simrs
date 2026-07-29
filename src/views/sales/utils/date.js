// Format tanggal/waktu dipakai bersama di seluruh views/sales.

export const formatDateTime = (val) => {
  if (!val) return '-'
  const d = new Date(String(val).replace(' ', 'T'))
  if (isNaN(d.getTime())) return val
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// "28 Jul 2026"
export const formatTglFull = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// "28 Jul" — dipakai di tabel yang tahunnya sudah jelas dari konteks/filter periode.
export const formatTglShort = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

// "Jul 26" — dipakai khusus untuk tanggal expired batch obat.
export const formatTglExpiry = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
}

export const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Shift OPEN belum punya WAKTU_TUTUP — durasinya dihitung s.d. sekarang (berjalan), bukan '-'.
export const formatDurasiShift = (row) => {
  const start = row?.WAKTU_BUKA ? new Date(String(row.WAKTU_BUKA).replace(' ', 'T')) : null
  if (!start || isNaN(start.getTime())) return '-'
  const end = row?.WAKTU_TUTUP ? new Date(String(row.WAKTU_TUTUP).replace(' ', 'T')) : new Date()
  if (isNaN(end.getTime())) return '-'

  const totalMinutes = Math.max(0, Math.floor((end - start) / 60000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  const parts = []
  if (days > 0) parts.push(`${days}h`)
  if (days > 0 || hours > 0) parts.push(`${hours}j`)
  parts.push(`${minutes}m`)

  const label = parts.join(' ')
  return row?.STATUS === 'OPEN' ? `${label} (berjalan)` : label
}
