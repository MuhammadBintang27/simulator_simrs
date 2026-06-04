-- Tambah kolom kategori_donor ke tabel utd_sesi_donor
-- Jalankan sekali pada database produksi

ALTER TABLE `utd_sesi_donor`
ADD COLUMN `kategori_donor` VARCHAR(20) NULL DEFAULT NULL
    COMMENT 'SUKARELA | KELUARGA'
    AFTER `jenis_donor`;
