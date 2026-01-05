<template>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <h1>DASHBOARD KONTROL BIAYA OPERASIONAL RS</h1>
    </div>

    <!-- Total Biaya & Estimasi -->
    <div class="row">
      <div class="box">
        <h3>Total Biaya Bulan Ini Oktober 2025</h3>
        <p class="value">Rp 1,2 M</p>
        <p class="small red">🔴 -Rp 150 Jt</p>
      </div>
      <div class="box">
        <h3>Estimasi Klaim</h3>
        <p class="value">Rp 1,05 M</p>
      </div>
    </div>

    <!-- Biaya Per Episode -->
    <div class="section">
      <h2>BIAYA PER EPISODE PASIEN</h2>
      <p class="item">• Rawat Jalan: <b>Rp 150.000</b></p>
      <p class="item">• Rawat Inap: <b>Rp 3.400.000</b></p>
    </div>

    <!-- Komponen Biaya -->
    <div class="section">
      <h2>KOMPONEN BIAYA TERBESAR</h2>
      <p class="item">■ Obat & BHP: <b>45%</b></p>
      <p class="item">■ Tindakan Medis: <b>30%</b></p>
      <p class="item">■ Penunjang: <b>15%</b></p>
      <p class="item">■ Administrasi: <b>10%</b></p>
    </div>

    <!-- Potensi Risiko -->
    <div class="section">
      <h2>POTENSI RISIKO KERUGIAN</h2>
      <p class="item warn">⚠ 12 Pasien > Tarif INA-CBGs</p>
      <p class="item warn">⚠ LOS Melebihi Standar: 5 Kasus</p>
    </div>

    <!-- Status Klaim -->
    <div class="section">
      <h2>STATUS KLAIM BPJS</h2>
      <div class="status-row">
        <div class="status">
          <span>✔ Siap Klaim: <b>78%</b></span>
          <ProgressBar :value="78"></ProgressBar>
        </div>
        <div class="status">
          <span>⏳ Verifikasi: <b>17%</b></span>
          <ProgressBar :value="17"></ProgressBar>
        </div>
      </div>
      <div class="status full">
        <span>❌ Berisiko: <b>5%</b></span>
        <ProgressBar :value="5"></ProgressBar>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProgressBar from 'primevue/progressbar'
</script>

<style scoped>
.dashboard-container {
  padding: 0.75rem;
  background-color: #f5f5f5;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  padding-top: 0.75rem;
  background-color: #fff;
  border: 1px solid #ddd;
  margin-bottom: 0.75rem;
  border-radius: 3px;
}

.header h1 {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.box {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 0.75rem;
  border-radius: 3px;
}

.box h3 {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.small {
  font-size: 0.8rem;
  margin: 0;
}

.red {
  color: #dc2626;
}

.section {
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 3px;
}

.section h2 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}

.item {
  font-size: 0.8rem;
  color: #555;
  margin: 0.25rem 0;
}

.warn {
  color: #b45309;
}

.status-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.status {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status span {
  font-size: 0.8rem;
  color: #555;
}

.status.full {
  grid-column: 1 / -1;
}

:deep(.p-progressbar) {
  height: 0.8rem;
  border-radius: 2px;
  background-color: #e5e7eb;
}

:deep(.p-progressbar-value) {
  border-radius: 2px;
}
</style>
