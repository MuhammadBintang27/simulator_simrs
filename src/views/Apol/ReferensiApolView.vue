<template>
  <div class="content">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="fas fa-capsules mr-1"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Apotek Online/Referensi</h1>
          <p class="hero-description">
            Layanan ini memudahkan peserta JKN-KIS dalam menebus resep obat secara praktis tanpa
            harus menunggu lama di apotek rumah sakit. Resep dari dokter akan langsung tersimpan
            secara digital dan terkoneksi dengan apotek mitra BPJS Kesehatan. Melalui menu ini, Anda
            dapat memilih apotek terdekat untuk menebus obat sesuai kebutuhan. Obat dapat diambil
            langsung di apotek mitra atau, jika tersedia, dikirim ke alamat Anda. Seluruh biaya obat
            ditanggung BPJS Kesehatan sesuai ketentuan Formularium Nasional (FORNAS) dan Daftar
            Plafon Harga Obat (DPHO).
          </p>
        </div>
      </div>
    </div>

    <Tabs value="0" scrollable>
      <TabList>
        <Tab value="0">DAFTAR & PLAFON HARGA OBAT (DPHO)</Tab>
        <Tab value="1">SETTING APOTEK</Tab>
        <Tab value="2">OBAT</Tab>
        <Tab value="3">FASILITAS KESEHATAN</Tab>
        <Tab value="4">SPESIALISTIK</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <p>
            Tanda-tanda vital merupakan indikator utama untuk menilai kondisi umum kesehatan pasien.
            Data ini menjadi dasar dalam pemantauan klinis, evaluasi perawatan, serta deteksi dini
            adanya perubahan status kesehatan.
          </p>
          <DphoView></DphoView>
        </TabPanel>

        <TabPanel value="1">
          <p>
            Tanda-tanda vital merupakan indikator utama untuk menilai kondisi umum kesehatan pasien.
            Data ini menjadi dasar dalam pemantauan klinis, evaluasi perawatan, serta deteksi dini
            adanya perubahan status kesehatan.
          </p>
          <SettingApolview></SettingApolview>
        </TabPanel>

        <TabPanel value="2">
          <DaftarObatView></DaftarObatView>
        </TabPanel>

        <TabPanel value="3"> <FaskesKesehatanView></FaskesKesehatanView></TabPanel>

        <TabPanel value="4">
          <SpesialistikView></SpesialistikView>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import DphoView from '@/views/Apol/DphoView.vue'

import SettingApolview from '@/views/Apol/SettingApolview.vue'

import FaskesKesehatanView from '@/views/Apol/FaskesKesehatanView.vue'

import SpesialistikView from '@/views/Apol/SpesialistikView.vue'

import DaftarObatView from '@/views/Apol/DaftarObatView.vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: 'Message Content',
    life: 3000,
  })
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #09657e 0%, #077d57 100%);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  color: white;
  box-shadow: 0 4px 20px rgba(6, 182, 212, 0.2);
}

.hover-grow {
  cursor: pointer; /* hand cursor */
  transition: transform 0.1s ease-in-out;
}

.hover-grow:hover {
  transform: scale(1.1); /* grow 10% on hover */
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hero-icon {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-description {
  font-size: 0.91rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

.hero-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1rem;
  min-width: 140px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}
</style>
