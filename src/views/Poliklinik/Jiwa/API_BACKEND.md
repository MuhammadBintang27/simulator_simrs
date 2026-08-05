# API Endpoint yang Dibutuhkan — Poli Jiwa Genogram

## 1. GET Genogram

**URL:** `POST /index.php/api/poli_jiwa/get_genogram`

**Request:**
```json
{
  "no_register": "string",
  "nomr": "string",
  "id_client": "string"
}
```

**Response (sukses):**
```json
{
  "success": true,
  "updated_at": "2026-07-17 10:00:00",
  "genogram": {
    "g1": {
      "kakek_pat": { "ada": true, "nama": "...", "gender": "L", "usia": 80, "meninggal": true, "diagnosa": ["F20"] },
      "nenek_pat": { ... },
      "kakek_mat": { ... },
      "nenek_mat": { ... }
    },
    "g2": {
      "ayah":         { "ada": true, "nama": "...", "gender": "L", "usia": 60, "meninggal": false, "diagnosa": [] },
      "ibu":          { ... },
      "saudara_ayah": [ { ... }, ... ],
      "saudara_ibu":  [ { ... }, ... ]
    },
    "g3": {
      "pasien":  { "ada": true, "nama": "...", "gender": "L", "usia": 30, "meninggal": false, "diagnosa": ["F20"] },
      "saudara": [ { ... }, ... ]
    },
    "g4": {
      "anak": [ { ... }, ... ]
    }
  }
}
```

**Response (tidak ada data):**
```json
{ "success": false, "message": "Data tidak ditemukan" }
```

---

## 2. SAVE Genogram

**URL:** `POST /index.php/api/poli_jiwa/save_genogram`

**Request:**
```json
{
  "no_register": "string",
  "nomr": "string",
  "id_client": "string",
  "genogram": "{... JSON string dari data genogram ...}"
}
```

**Response:**
```json
{
  "success": true,
  "updated_at": "2026-07-17 10:05:00",
  "message": "Genogram berhasil disimpan"
}
```

---

## Struktur Tabel Database (Rekomendasi)

```sql
CREATE TABLE poli_jiwa_genogram (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  no_register VARCHAR(50) NOT NULL,
  nomr        VARCHAR(20) NOT NULL,
  id_client   VARCHAR(10) NOT NULL,
  genogram    JSON NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_noreg_client (no_register, id_client)
);
```

Kolom `genogram` menyimpan JSON string dari seluruh struktur (g1, g2, g3, g4).
