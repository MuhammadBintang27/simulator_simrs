 SELECT 
  id,
  id_client,
  no_register,
  nomr,
  hpht,
  siklus_haid,
  lama_haid,
  volume_darah,
  dismenore,
  status_haid,
  pakai_kb,
  jenis_kb,
  lama_kb,
  keluhan_kb,
  kondisi_serviks,
  sekret_vagina,
  perdarahan,
  pap_smear,
  hasil_pap_smear,
  catatan_spekulum,
  ukuran_uterus,
  konsistensi_uterus,
  mobilitas_uterus,
  adneksa_kanan,
  adneksa_kiri,
  ngs,
  nyeri_parametrium,
  catatan_bimanual,
  rencana_hamil,
  vaksin_hpv,
  tahun_vaksin_hpv,
  catatan_riwayat_gine,
  keluhan_gine,
  riwayat_operasi 
FROM obgyn_ginekologi  


SELECT 
  id,
  id_client,
  no_register,
  nomr,
  gravida,
  para,
  abortus,
  hpht,
  hpl,
  kunjungan_anc,
  tempat_anc,
  status_tt,
  edema,
  protein_urin,
  trend_td,
  air_ketuban,
  tgl_usg,
  temuan_usg,
  tfu,
  leopold2,
  leopold3,
  leopold4,
  djj,
  kontraksi,
  gerakan_janin,
  keluhan_kehamilan,
  riwayat_kehamilan 
FROM obgyn_obstetri  

SELECT 
  id,
  id_client,
  no_register,
  nomr,
  tanggal_periksa,
  kategori,
  created_by,
  created_at,
  updated_at 
FROM obgyn_pemeriksaan  

SELECT 
  id,
  no_register,
  nomr,
  nama_penyakit 
FROM obgyn_riwayat_penyakit_gine 
 
SELECT 
  id,
  no_register,
  nomr,
  urutan,
  tahun,
  usia_kehamilan,
  jenis_persalinan,
  penolong,
  bb_lahir,
  kondisi_bayi,
  komplikasi 
FROM obgyn_riwayat_persalinan 
 

SELECT 
  id,
  no_register,
  nama_suplemen 
FROM obgyn_suplemen_pasien 
 

