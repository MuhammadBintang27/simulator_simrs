-- ==========================================================================
-- SKEMA DATABASE FISIOTERAPI
-- MySQL 5.1 Compatible
-- Modul: Permintaan & Pelayanan Fisioterapi SIMRS
-- ==========================================================================

SET SQL_MODE   = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES      utf8;
SET time_zone  = '+07:00';


-- --------------------------------------------------------------------------
-- 1. ft_permintaan
--    Permintaan rujukan fisioterapi dari poliklinik
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ft_permintaan` (
  `id`                  INT(11)       NOT NULL AUTO_INCREMENT,
  `no_permintaan`       VARCHAR(30)   NOT NULL                 COMMENT 'Nomor unik permintaan (auto-generate)',
  `id_client`           VARCHAR(10)   NOT NULL                 COMMENT 'Kode RS / klient',
  `noregister`          VARCHAR(30)   NOT NULL                 COMMENT 'No. registrasi kunjungan',
  `norm`                VARCHAR(20)   NOT NULL                 COMMENT 'No. rekam medis pasien',
  `poli_asal`           VARCHAR(100)  DEFAULT NULL             COMMENT 'Poli / unit pengirim',
  `nama_dokter`         VARCHAR(100)  DEFAULT NULL             COMMENT 'DPJP / dokter pengirim',
  `klinis`              VARCHAR(500)  DEFAULT NULL             COMMENT 'Diagnosa / klinis pengirim',
  `keluhan`             TEXT                                   COMMENT 'Keluhan utama pasien',
  `lokasi_keluhan`      VARCHAR(100)  DEFAULT NULL             COMMENT 'Area / regio tubuh bermasalah',
  `onset`               VARCHAR(50)   DEFAULT NULL             COMMENT 'Durasi keluhan (akut / sub-akut / kronik)',
  `skala_nyeri`         TINYINT(2)    DEFAULT 0                COMMENT 'Skala nyeri VAS 0–10',
  `prioritas`           VARCHAR(50)   DEFAULT NULL             COMMENT 'Prioritas: Segera / Tinggi / Elektif',
  `kondisi_mobilitas`   VARCHAR(100)  DEFAULT NULL             COMMENT 'Mandiri / butuh alat / bed rest dll',
  `riwayat_terapi`      VARCHAR(100)  DEFAULT NULL             COMMENT 'Belum pernah / pernah / lanjutan',
  `catatan`             TEXT                                   COMMENT 'Catatan tambahan dari poli',
  `status_kirim`        TINYINT(1)    DEFAULT 0                COMMENT '0=Belum Dikirim  1=Sudah Dikirim',
  `tgl_permintaan`      DATETIME      DEFAULT NULL             COMMENT 'Waktu permintaan dibuat',
  `tgl_kirim`           DATETIME      DEFAULT NULL             COMMENT 'Waktu dikirim ke unit fisioterapi',
  `user_input`          VARCHAR(50)   DEFAULT NULL             COMMENT 'User ID yang membuat permintaan',
  `status_layanan`      TINYINT(1)    DEFAULT 0                COMMENT '0=Menunggu 1=Proses 2=Selesai 3=Batal',
  `tgl_selesai`         DATETIME      DEFAULT NULL             COMMENT 'Waktu layanan selesai',
  `created_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE  KEY `uk_no_permintaan`    (`no_permintaan`),
  KEY     `idx_id_client`           (`id_client`),
  KEY     `idx_noregister`          (`noregister`),
  KEY     `idx_norm`                (`norm`),
  KEY     `idx_tgl_permintaan`      (`tgl_permintaan`),
  KEY     `idx_status_kirim`        (`status_kirim`),
  KEY     `idx_status_layanan`      (`status_layanan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  COMMENT='Permintaan rujukan fisioterapi dari poliklinik';


-- --------------------------------------------------------------------------
-- 2. ft_asesmen
--    Asesmen awal oleh fisioterapis (dilakukan di unit fisioterapi)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ft_asesmen` (
  `id`                        INT(11)      NOT NULL AUTO_INCREMENT,
  `id_permintaan`             INT(11)      NOT NULL             COMMENT 'FK → ft_permintaan.id',
  `id_client`                 VARCHAR(10)  NOT NULL,
  `noregister`                VARCHAR(30)  NOT NULL,
  `norm`                      VARCHAR(20)  NOT NULL,

  -- Anamnesis
  `keluhan_utama`             TEXT                              COMMENT 'Keluhan utama saat asesmen',
  `riwayat_penyakit_skrg`     TEXT                              COMMENT 'Riwayat penyakit sekarang',
  `riwayat_penyakit_dahulu`   TEXT                              COMMENT 'Riwayat penyakit dahulu & operasi',
  `riwayat_sosial`            VARCHAR(300) DEFAULT NULL         COMMENT 'Pekerjaan, aktivitas, olahraga',

  -- Pemeriksaan Objektif
  `postur`                    VARCHAR(200) DEFAULT NULL         COMMENT 'Temuan postur tubuh',
  `lingkup_gerak_sendi`       TEXT                              COMMENT 'LGS aktif & pasif (derajat)',
  `kekuatan_otot`             VARCHAR(200) DEFAULT NULL         COMMENT 'MMT (skala 0–5)',
  `nyeri_gerak`               VARCHAR(200) DEFAULT NULL         COMMENT 'Nyeri saat gerak aktif/pasif',
  `spasme_otot`               VARCHAR(200) DEFAULT NULL,
  `edema`                     VARCHAR(100) DEFAULT NULL,
  `sensasi`                   VARCHAR(200) DEFAULT NULL         COMMENT 'Sensasi / refleks',
  `tes_khusus`                TEXT                              COMMENT 'Tes ortopedi / neurologis khusus',

  -- Diagnosa & Tujuan
  `diagnosa_ft`               TEXT                              COMMENT 'Diagnosa fisioterapi',
  `tujuan_jangka_pendek`      TEXT                              COMMENT 'Target 1–2 minggu pertama',
  `tujuan_jangka_panjang`     TEXT                              COMMENT 'Target akhir terapi',
  `program_terapi`            TEXT                              COMMENT 'Rencana program terapi',
  `frekuensi_terapi`          VARCHAR(50)  DEFAULT NULL         COMMENT 'Contoh: 3x / minggu',
  `estimasi_total_sesi`       TINYINT(3)   DEFAULT NULL         COMMENT 'Perkiraan jumlah sesi',

  -- Fisioterapis
  `kode_fisioterapis`         VARCHAR(20)  DEFAULT NULL,
  `nama_fisioterapis`         VARCHAR(100) DEFAULT NULL,
  `tgl_asesmen`               DATETIME     DEFAULT NULL,
  `created_at`                TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_permintaan`  (`id_permintaan`),
  KEY `idx_noregister`  (`noregister`),
  KEY `idx_norm`        (`norm`),
  KEY `idx_tgl`         (`tgl_asesmen`),
  CONSTRAINT `fk_asesmen_permintaan`
    FOREIGN KEY (`id_permintaan`) REFERENCES `ft_permintaan` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  COMMENT='Asesmen awal fisioterapi oleh fisioterapis';


-- --------------------------------------------------------------------------
-- 3. ft_master_tindakan
--    Master modalitas / tindakan fisioterapi
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ft_master_tindakan` (
  `id`              INT(11)       NOT NULL AUTO_INCREMENT,
  `id_client`       VARCHAR(10)   NOT NULL,
  `kode_tindakan`   VARCHAR(20)   NOT NULL,
  `nama_tindakan`   VARCHAR(200)  NOT NULL,
  `kategori`        VARCHAR(80)   DEFAULT NULL   COMMENT 'Elektroterapi / Manual / Latihan / Hidroterapi',
  `satuan`          VARCHAR(20)   DEFAULT 'SESI',
  `harga`           DECIMAL(15,2) DEFAULT 0.00,
  `durasi_menit`    TINYINT(3)    DEFAULT NULL   COMMENT 'Durasi default per sesi (menit)',
  `deskripsi`       TEXT                         COMMENT 'Penjelasan singkat tindakan',
  `is_active`       TINYINT(1)    DEFAULT 1      COMMENT '1=Aktif  0=Nonaktif',
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kode`       (`id_client`, `kode_tindakan`),
  KEY        `idx_kategori`  (`kategori`),
  KEY        `idx_active`    (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  COMMENT='Master modalitas / tindakan fisioterapi';


-- --------------------------------------------------------------------------
-- 4. ft_jadwal
--    Jadwal sesi fisioterapi
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ft_jadwal` (
  `id`                  INT(11)      NOT NULL AUTO_INCREMENT,
  `id_permintaan`       INT(11)      NOT NULL            COMMENT 'FK → ft_permintaan.id',
  `id_asesmen`          INT(11)      DEFAULT NULL        COMMENT 'FK → ft_asesmen.id',
  `id_client`           VARCHAR(10)  NOT NULL,
  `noregister`          VARCHAR(30)  NOT NULL,
  `norm`                VARCHAR(20)  NOT NULL,
  `no_sesi`             TINYINT(3)   DEFAULT 1           COMMENT 'Urutan sesi ke-berapa',
  `tgl_jadwal`          DATE         DEFAULT NULL,
  `jam_mulai`           TIME         DEFAULT NULL,
  `jam_selesai`         TIME         DEFAULT NULL,
  `durasi_aktual_menit` TINYINT(3)   DEFAULT NULL        COMMENT 'Durasi aktual sesi (menit)',
  `ruangan`             VARCHAR(50)  DEFAULT NULL,
  `kode_fisioterapis`   VARCHAR(20)  DEFAULT NULL,
  `nama_fisioterapis`   VARCHAR(100) DEFAULT NULL,
  `status`              TINYINT(1)   DEFAULT 0           COMMENT '0=Terjadwal 1=Hadir 2=Tidak Hadir 3=Dibatal',
  `alasan_batal`        VARCHAR(200) DEFAULT NULL,
  `catatan_sesi`        VARCHAR(300) DEFAULT NULL,
  `created_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_permintaan`  (`id_permintaan`),
  KEY `idx_norm`        (`norm`),
  KEY `idx_tgl`         (`tgl_jadwal`),
  KEY `idx_status`      (`status`),
  KEY `idx_fisioterapis`(`kode_fisioterapis`),
  CONSTRAINT `fk_jadwal_permintaan`
    FOREIGN KEY (`id_permintaan`) REFERENCES `ft_permintaan` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  COMMENT='Jadwal sesi fisioterapi';


-- --------------------------------------------------------------------------
-- 5. ft_detail_tindakan
--    Tindakan / modalitas yang diberikan per sesi
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ft_detail_tindakan` (
  `id`              INT(11)       NOT NULL AUTO_INCREMENT,
  `id_jadwal`       INT(11)       NOT NULL            COMMENT 'FK → ft_jadwal.id',
  `id_permintaan`   INT(11)       NOT NULL,
  `id_client`       VARCHAR(10)   NOT NULL,
  `noregister`      VARCHAR(30)   NOT NULL,
  `norm`            VARCHAR(20)   NOT NULL,
  `kode_tindakan`   VARCHAR(20)   NOT NULL,
  `nama_tindakan`   VARCHAR(200)  NOT NULL,
  `kategori`        VARCHAR(80)   DEFAULT NULL,
  `area_tubuh`      VARCHAR(100)  DEFAULT NULL        COMMENT 'Area spesifik yang ditangani',
  `qty`             TINYINT(3)    DEFAULT 1,
  `satuan`          VARCHAR(20)   DEFAULT 'SESI',
  `durasi_menit`    TINYINT(3)    DEFAULT NULL,
  `parameter`       TEXT                              COMMENT 'Pengaturan alat: intensitas, frekuensi, dll',
  `hasil_respon`    VARCHAR(300)  DEFAULT NULL        COMMENT 'Respon/hasil tindakan saat sesi',
  `harga`           DECIMAL(15,2) DEFAULT 0.00,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_jadwal`      (`id_jadwal`),
  KEY `idx_permintaan`  (`id_permintaan`),
  KEY `idx_noregister`  (`noregister`),
  KEY `idx_kode`        (`kode_tindakan`),
  CONSTRAINT `fk_detail_jadwal`
    FOREIGN KEY (`id_jadwal`) REFERENCES `ft_jadwal` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  COMMENT='Detail tindakan fisioterapi per sesi';


-- --------------------------------------------------------------------------
-- 6. ft_progress_notes
--    Catatan perkembangan pasien (SOAP) per sesi
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ft_progress_notes` (
  `id`                  INT(11)      NOT NULL AUTO_INCREMENT,
  `id_jadwal`           INT(11)      NOT NULL            COMMENT 'FK → ft_jadwal.id',
  `id_permintaan`       INT(11)      NOT NULL,
  `id_client`           VARCHAR(10)  NOT NULL,
  `noregister`          VARCHAR(30)  NOT NULL,
  `norm`                VARCHAR(20)  NOT NULL,
  `no_sesi`             TINYINT(3)   DEFAULT NULL,

  -- SOAP
  `subjektif`           TEXT                              COMMENT 'Keluhan & laporan pasien saat sesi',
  `objektif`            TEXT                              COMMENT 'Temuan pemeriksaan fisioterapis',
  `asesmen`             TEXT                              COMMENT 'Analisis perkembangan',
  `plan`                TEXT                              COMMENT 'Rencana sesi berikutnya',

  -- Evaluasi Nyeri
  `skala_nyeri_pre`     TINYINT(2)   DEFAULT NULL        COMMENT 'VAS sebelum terapi',
  `skala_nyeri_post`    TINYINT(2)   DEFAULT NULL        COMMENT 'VAS sesudah terapi',

  -- Evaluasi ROM
  `rom_pre`             VARCHAR(300) DEFAULT NULL        COMMENT 'LGS sebelum sesi',
  `rom_post`            VARCHAR(300) DEFAULT NULL        COMMENT 'LGS sesudah sesi',

  -- Evaluasi Umum
  `respon_pasien`       TINYINT(1)   DEFAULT NULL        COMMENT '1=Baik 2=Cukup 3=Kurang',
  `kepatuhan`           TINYINT(1)   DEFAULT NULL        COMMENT '1=Patuh 2=Sebagian 3=Tidak Patuh',
  `edukasi_diberikan`   VARCHAR(300) DEFAULT NULL        COMMENT 'Edukasi HEP yang diberikan',

  -- Fisioterapis
  `kode_fisioterapis`   VARCHAR(20)  DEFAULT NULL,
  `nama_fisioterapis`   VARCHAR(100) DEFAULT NULL,
  `tgl_notes`           DATETIME     DEFAULT NULL,
  `created_at`          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_jadwal`      (`id_jadwal`),
  KEY `idx_permintaan`  (`id_permintaan`),
  KEY `idx_norm`        (`norm`),
  KEY `idx_tgl`         (`tgl_notes`),
  CONSTRAINT `fk_notes_jadwal`
    FOREIGN KEY (`id_jadwal`) REFERENCES `ft_jadwal` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  COMMENT='Progress notes SOAP per sesi fisioterapi';


-- --------------------------------------------------------------------------
-- 7. ft_evaluasi_akhir
--    Evaluasi akhir / discharge summary
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ft_evaluasi_akhir` (
  `id`                        INT(11)      NOT NULL AUTO_INCREMENT,
  `id_permintaan`             INT(11)      NOT NULL            COMMENT 'FK → ft_permintaan.id',
  `id_client`                 VARCHAR(10)  NOT NULL,
  `noregister`                VARCHAR(30)  NOT NULL,
  `norm`                      VARCHAR(20)  NOT NULL,
  `total_sesi`                TINYINT(3)   DEFAULT 0           COMMENT 'Total sesi yang dijalani',
  `skala_nyeri_awal`          TINYINT(2)   DEFAULT NULL        COMMENT 'VAS saat permintaan masuk',
  `skala_nyeri_akhir`         TINYINT(2)   DEFAULT NULL        COMMENT 'VAS saat discharge',
  `pencapaian_tujuan`         TINYINT(1)   DEFAULT NULL        COMMENT '1=Tercapai 2=Sebagian 3=Belum',
  `kondisi_discharge`         VARCHAR(200) DEFAULT NULL        COMMENT 'Kondisi pasien saat keluar',
  `rekomendasi`               TEXT                             COMMENT 'Rekomendasi home program / lanjutan',
  `alasan_selesai`            TINYINT(1)   DEFAULT 1           COMMENT '1=Tujuan Tercapai 2=Pasien Menolak 3=Dirujuk 4=Lainnya',
  `catatan_akhir`             TEXT,
  `kode_fisioterapis`         VARCHAR(20)  DEFAULT NULL,
  `nama_fisioterapis`         VARCHAR(100) DEFAULT NULL,
  `tgl_evaluasi`              DATETIME     DEFAULT NULL,
  `created_at`                TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permintaan`  (`id_permintaan`),
  KEY `idx_norm`              (`norm`),
  KEY `idx_tgl`               (`tgl_evaluasi`),
  CONSTRAINT `fk_evaluasi_permintaan`
    FOREIGN KEY (`id_permintaan`) REFERENCES `ft_permintaan` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8
  COMMENT='Evaluasi akhir / discharge summary fisioterapi';


-- ==========================================================================
-- DATA AWAL: Master Tindakan Fisioterapi
-- ==========================================================================
INSERT INTO `ft_master_tindakan`
  (`id_client`, `kode_tindakan`, `nama_tindakan`, `kategori`, `satuan`, `durasi_menit`, `is_active`)
VALUES
  -- Elektroterapi
  ('0', 'FT-TENS',   'TENS (Transcutaneous Electrical Nerve Stimulation)', 'Elektroterapi', 'SESI', 20, 1),
  ('0', 'FT-US',     'Ultrasound Therapy',                                  'Elektroterapi', 'SESI', 15, 1),
  ('0', 'FT-IFT',    'Interferential Therapy (IFT)',                        'Elektroterapi', 'SESI', 20, 1),
  ('0', 'FT-SWD',    'Short Wave Diathermy (SWD)',                          'Elektroterapi', 'SESI', 20, 1),
  ('0', 'FT-MWD',    'Microwave Diathermy (MWD)',                           'Elektroterapi', 'SESI', 15, 1),
  ('0', 'FT-IR',     'Infra Red (IR)',                                       'Elektroterapi', 'SESI', 15, 1),
  ('0', 'FT-ES',     'Electrical Stimulation (ES)',                          'Elektroterapi', 'SESI', 20, 1),
  ('0', 'FT-LASER',  'Low Level Laser Therapy (LLLT)',                       'Elektroterapi', 'SESI', 15, 1),
  ('0', 'FT-TENS-A', 'Akupunktur Kering (Dry Needling)',                     'Elektroterapi', 'SESI', 30, 1),

  -- Terapi Manual
  ('0', 'FT-MAS',   'Massage / Terapi Pijat',                               'Terapi Manual', 'SESI', 30, 1),
  ('0', 'FT-MAN',   'Manipulasi Sendi',                                      'Terapi Manual', 'SESI', 30, 1),
  ('0', 'FT-MOB',   'Mobilisasi Sendi & Jaringan Lunak',                     'Terapi Manual', 'SESI', 30, 1),
  ('0', 'FT-STR',   'Stretching / Peregangan',                               'Terapi Manual', 'SESI', 20, 1),
  ('0', 'FT-MYO',   'Myofascial Release',                                    'Terapi Manual', 'SESI', 30, 1),
  ('0', 'FT-TRAKT', 'Traksi Servikal / Lumbal',                              'Terapi Manual', 'SESI', 20, 1),

  -- Terapi Latihan
  ('0', 'FT-LAT',   'Terapi Latihan (Therapeutic Exercise)',                 'Terapi Latihan', 'SESI', 40, 1),
  ('0', 'FT-HEP',   'Home Exercise Program (HEP)',                           'Terapi Latihan', 'SESI', 20, 1),
  ('0', 'FT-BAL',   'Latihan Keseimbangan & Koordinasi',                     'Terapi Latihan', 'SESI', 30, 1),
  ('0', 'FT-STR2',  'Latihan Penguatan Otot (Strengthening)',                'Terapi Latihan', 'SESI', 30, 1),
  ('0', 'FT-ROM',   'Latihan Lingkup Gerak Sendi (ROM Exercise)',            'Terapi Latihan', 'SESI', 20, 1),
  ('0', 'FT-CARD',  'Latihan Kardiorespirasi',                               'Terapi Latihan', 'SESI', 40, 1),
  ('0', 'FT-ADL',   'Latihan Aktivitas Sehari-hari (ADL)',                   'Terapi Latihan', 'SESI', 30, 1),
  ('0', 'FT-WALK',  'Latihan Berjalan / Ambulasi',                           'Terapi Latihan', 'SESI', 30, 1),
  ('0', 'FT-NEURO', 'Latihan Neuromuskular (PNF)',                           'Terapi Latihan', 'SESI', 40, 1),

  -- Hidroterapi
  ('0', 'FT-POOL',  'Hidroterapi / Aquatic Therapy',                         'Hidroterapi', 'SESI', 45, 1),
  ('0', 'FT-WPOOL', 'Whirlpool Bath',                                         'Hidroterapi', 'SESI', 20, 1),
  ('0', 'FT-HOT',   'Hot Pack / Kompres Hangat',                              'Termal',      'SESI', 15, 1),
  ('0', 'FT-COLD',  'Cold Pack / Kompres Dingin (Cryotherapy)',               'Termal',      'SESI', 15, 1),
  ('0', 'FT-WAX',   'Paraffin Bath (Parafin)',                                'Termal',      'SESI', 20, 1),

  -- Alat Bantu & Ortosis
  ('0', 'FT-ORTH',  'Pemasangan / Edukasi Ortosis / Alat Bantu Jalan',       'Ortosis', 'KALI', 30, 1),
  ('0', 'FT-TAPE',  'Taping / Kinesio Taping',                               'Taping',  'KALI', 20, 1),

  -- Edukasi
  ('0', 'FT-EDU',   'Edukasi Pasien & Keluarga',                             'Edukasi', 'KALI', 15, 1),
  ('0', 'FT-ERGON', 'Ergonomi & Postur',                                      'Edukasi', 'KALI', 20, 1);


-- ==========================================================================
-- VIEW: Ringkasan Permintaan Fisioterapi
-- ==========================================================================
CREATE OR REPLACE VIEW `v_ft_ringkasan` AS
  SELECT
    p.id,
    p.no_permintaan,
    p.id_client,
    p.noregister,
    p.norm,
    p.poli_asal,
    p.nama_dokter,
    p.klinis,
    p.lokasi_keluhan,
    p.skala_nyeri,
    p.prioritas,
    p.status_kirim,
    p.status_layanan,
    CASE p.status_layanan
      WHEN 0 THEN 'Menunggu'
      WHEN 1 THEN 'Proses'
      WHEN 2 THEN 'Selesai'
      WHEN 3 THEN 'Batal'
    END                              AS status_layanan_label,
    p.tgl_permintaan,
    p.tgl_kirim,
    COUNT(DISTINCT j.id)             AS total_jadwal,
    SUM(CASE WHEN j.status = 1 THEN 1 ELSE 0 END) AS total_sesi_hadir,
    a.diagnosa_ft,
    a.nama_fisioterapis
  FROM  `ft_permintaan` p
  LEFT  JOIN `ft_jadwal`  j ON j.id_permintaan = p.id
  LEFT  JOIN `ft_asesmen` a ON a.id_permintaan = p.id
  GROUP BY p.id;


-- ==========================================================================
-- END
-- ==========================================================================
