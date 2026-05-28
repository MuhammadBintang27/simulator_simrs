<template>
  <!-- ═══ HALAMAN COVER: IDENTITAS PASIEN ═══ -->
  <div class="rme-section">
    <!-- Header RS -->
    <div class="rme-rs-header">
      <img :src="LINK_LOGO || '/img/logo.png'" class="rme-rs-logo" alt="Logo RS" />
      <div class="rme-rs-info">
        <h2 class="rme-rs-name">{{ company || 'RUMAH SAKIT' }}</h2>
        <p class="rme-rs-addr">{{ ALAMAT || '' }}</p>
        <p class="rme-rs-tagline">REKAM MEDIS ELEKTRONIK</p>
      </div>
      <div class="rme-rs-barcode">
        <div class="rme-noreg-box">
          <span class="rme-noreg-label">No. Registrasi</span>
          <span class="rme-noreg-val mono">{{ noreg }}</span>
        </div>
        <div class="rme-noreg-box">
          <span class="rme-noreg-label">No. Rekam Medis</span>
          <span class="rme-noreg-val mono">{{ dataPasien?.NOMR || '-' }}</span>
        </div>
      </div>
    </div>

    <div class="rme-divider-thick"></div>

    <!-- Skeleton saat loading -->
    <div v-if="loading" class="rme-skeleton-wrap">
      <div v-for="i in 6" :key="i" class="rme-skeleton-row"></div>
    </div>

    <!-- Identitas Pasien -->
    <div v-else>
      <div class="rme-section-title">IDENTITAS PASIEN</div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tr>
              <td class="rme-td-lbl">Nama Lengkap</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val"><strong>{{ dataPasien?.NAMAPASIEN || '-' }}</strong></td>
            </tr>
            <tr>
              <td class="rme-td-lbl">No. Rekam Medis</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val mono">{{ dataPasien?.NOMR || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Jenis Kelamin</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">
                {{ dataPasien?.JENISKELAMIN === 'P' ? 'Perempuan' : dataPasien?.JENISKELAMIN === 'L' ? 'Laki-laki' : (dataPasien?.JENISKELAMIN || '-') }}
              </td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Tanggal Lahir</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.TGLLAHIR || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Usia</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">
                {{ dataPasien?.USIA_PASIEN?.tahun ?? '-' }} Thn,
                {{ dataPasien?.USIA_PASIEN?.bulan ?? '' }} Bln,
                {{ dataPasien?.USIA_PASIEN?.hari ?? '' }} Hr
              </td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Alamat</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.ALAMAT || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Kecamatan</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.NAMAKECAMATAN || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">No. Telepon</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.NOTELP || '-' }}</td>
            </tr>
          </table>
        </div>
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tr>
              <td class="rme-td-lbl">No. Registrasi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val mono">{{ noreg }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Poli / Ruang</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.NAMAPOLI || dataPasien?.KODEPOLI || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">DPJP / Dokter</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.NAMADOKTER || dataPasien?.DPJP || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Cara Bayar</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.CARABAYAR || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">No. SEP / Kartu</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val mono">{{ dataPasien?.NOSEP || dataPasien?.NOKARTU || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Tanggal Masuk</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.TGLMASUK || dataPasien?.TANGGAL || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Jenis Rawat</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ dataPasien?.JENISRAWAT || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Tanggal Cetak</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ printDate }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/config'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const authStore = useAuthStore()
const { company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

const printDate = computed(() => {
  const d = new Date()
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
})
</script>
