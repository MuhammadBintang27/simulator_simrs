-- Tambah kolom hasil donor ke tabel utd_sesi_donor
-- Jalankan sekali pada database produksi

ALTER TABLE `utd_sesi_donor`
ADD COLUMN `jumlah_kantong` INT NULL DEFAULT NULL
    COMMENT 'Jumlah kantong darah yang diambil dari donor'
    AFTER `alasan_tolak`,
ADD COLUMN `no_kantong` TEXT NULL DEFAULT NULL
    COMMENT 'Nomor-nomor kantong darah (JSON array string)'
    AFTER `jumlah_kantong`;
