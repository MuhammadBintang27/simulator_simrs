-- ==========================================================================
-- SKEMA DATABASE SURAT KETERANGAN
-- MySQL 5.1 Compatible
-- Modul: Surat Keterangan (Sehat / Sakit / Kesehatan Jiwa / dll)
-- ==========================================================================

SET SQL_MODE   = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES      utf8;
SET time_zone  = '+07:00';


-- --------------------------------------------------------------------------
-- 1. mst_jenis_surat
--    Master jenis surat keterangan, terhubung ke item harga di `barang`
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mst_jenis_surat` (
  `ID` INT(11) NOT NULL AUTO_INCREMENT,
  `IDCLIENT` VARCHAR(10) NOT NULL,
  `KODE_SURAT` VARCHAR(20) DEFAULT NULL,
  `NAMA_SURAT` VARCHAR(100) NOT NULL,
  `IDBARANG` INT(11) NOT NULL,
  `TEMPLATE_HTML` MEDIUMTEXT,
  `TEMPLATE_FILE` VARCHAR(255) DEFAULT NULL,
  `KATEGORI_SURAT` VARCHAR(30) DEFAULT NULL,
  `MASA_BERLAKU_HARI` INT(11) DEFAULT NULL,
  `AKTIF` TINYINT(1) DEFAULT '1',
  `DELETED` TINYINT(1) DEFAULT '0',
  `CREATED_AT` DATETIME DEFAULT NULL,
  `CREATED_BY` VARCHAR(15) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `IDBARANG` (`IDBARANG`),
  KEY `IDCLIENT` (`IDCLIENT`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


-- --------------------------------------------------------------------------
-- 2. trx_surat
--    Transaksi surat keterangan per kunjungan pasien (NOREGISTER)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `trx_surat` (
  `ID` INT(11) NOT NULL AUTO_INCREMENT,
  `IDCLIENT` VARCHAR(10) NOT NULL,
  `NOREGISTER` VARCHAR(30) NOT NULL,
  `ID_JENIS_SURAT` INT(11) NOT NULL,
  `NO_SURAT` VARCHAR(50) DEFAULT NULL,
  `DATA_ISIAN` TEXT,
  `STATUS_BAYAR` TINYINT(1) DEFAULT '0',
  `ID_TRX_BAYAR` INT(11) DEFAULT NULL,
  `STATUS_SURAT` TINYINT(1) DEFAULT '0',
  `DOKTER_PEMERIKSA` VARCHAR(50) DEFAULT NULL,
  `TANGGAL_SURAT` DATE DEFAULT NULL,
  `JUMLAH_CETAK` INT(11) DEFAULT '0',
  `CREATED_AT` DATETIME DEFAULT NULL,
  `CREATED_BY` VARCHAR(15) DEFAULT NULL,
  `DELETED` TINYINT(1) DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `NOREGISTER` (`NOREGISTER`),
  KEY `ID_JENIS_SURAT` (`ID_JENIS_SURAT`),
  KEY `IDCLIENT` (`IDCLIENT`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


-- --------------------------------------------------------------------------
-- Migrasi untuk database yang tabelnya sudah dibuat lebih dulu tanpa IDCLIENT
-- Jalankan blok ini SEKALI SAJA jika mst_jenis_surat / trx_surat sudah ada
-- dan belum punya kolom IDCLIENT. Ganti '1' pada UPDATE sesuai id_client RS Anda.
-- --------------------------------------------------------------------------
-- ALTER TABLE `mst_jenis_surat` ADD COLUMN `IDCLIENT` VARCHAR(10) NOT NULL DEFAULT '' AFTER `ID`;
-- ALTER TABLE `mst_jenis_surat` ADD KEY `IDCLIENT` (`IDCLIENT`);
-- UPDATE `mst_jenis_surat` SET `IDCLIENT` = '1' WHERE `IDCLIENT` = '';
--
-- ALTER TABLE `trx_surat` ADD COLUMN `IDCLIENT` VARCHAR(10) NOT NULL DEFAULT '' AFTER `ID`;
-- ALTER TABLE `trx_surat` ADD KEY `IDCLIENT` (`IDCLIENT`);
-- UPDATE `trx_surat` SET `IDCLIENT` = '1' WHERE `IDCLIENT` = '';

-- --------------------------------------------------------------------------
-- Migrasi: template surat sekarang berupa file Word (.docx) yang diupload,
-- bukan HTML yang ditulis di editor. TEMPLATE_HTML dibiarkan apa adanya
-- (tidak dipakai lagi) supaya tidak menghapus data yang sudah ada.
-- --------------------------------------------------------------------------
-- ALTER TABLE `mst_jenis_surat` ADD COLUMN `TEMPLATE_FILE` VARCHAR(255) DEFAULT NULL AFTER `TEMPLATE_HTML`;
