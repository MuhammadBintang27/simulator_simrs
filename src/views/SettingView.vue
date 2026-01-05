<template>
  <ContentHeader title="Setting" icon="pi pi-objects-column"></ContentHeader>
  <div class="reports-container">
    <div class="reports-grid">
      <!-- Invoice Report Card -->
      <Card class="report-card p-0" @click="gotoprofile">
        <template #content>
          <div class="report-card-content">
            <div class="report-icon">
              <i class="pi pi-file-pdf"></i>
            </div>
            <div class="report-details">
              <h3 class="report-title">Data Perusahaan</h3>
              <p class="report-description">
                Lihat rekapan invoice secara lebih terperinci. Sortir invoice berdasarkan produk,
                mitra, hingga salesperson
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Stock Report Card -->
      <Card class="report-card p-0" @click="roleuser">
        <template #content>
          <div class="report-card-content">
            <div class="report-icon">
              <i class="pi pi-user"></i>
            </div>
            <div class="report-details">
              <div class="report-title-container">
                <h3 class="report-title">Role User</h3>
                <Tag class="beta-badge" value="beta" severity="info" />
              </div>
              <p class="report-description">
                Dengan menggabungkan role dan permissions, kita bisa menciptakan sistem kontrol yang
                fleksibel.
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="reports-grid single-item">
      <!-- Accounts Receivable Aging Report Card -->
      <Card class="report-card p-0" @click="settingArea">
        <template #content>
          <div class="report-card-content">
            <div class="report-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="report-details">
              <div class="report-title-container">
                <h3 class="report-title">Setting wilayah/Area yang diperbolehkan</h3>
                <Tag class="beta-badge" value="beta" severity="info" />
              </div>
              <p class="report-description">Setting pasien areawilayah</p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import Card from 'primevue/card'
import Tag from 'primevue/tag'

import { useRouter } from 'vue-router'

const router = useRouter()

const gotoprofile = () => {
  router.push('/setting/profile')
}

const roleuser = () => {
  router.push('/setting/roleuser')
}

const settingArea = () => {
  router.push('/setting/AreaTujuan')
}
</script>

<style scoped>
.reports-container {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.reports-title {
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.reports-subtitle {
  color: #4b5563;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.single-item {
  grid-template-columns: 1fr;
  max-width: 50%;
}

.report-card {
  border-radius: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(75, 137, 220, 0.15);
}

.report-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(240, 249, 255, 0.15) 100%);
  pointer-events: none;
}

.report-card-content {
  padding: 1.5rem;
  display: flex;
  gap: 1.25rem;
}

.report-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: #e6f0ff;
  border: 1px solid #d1e5ff;
  border-radius: 0.25rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.report-card:hover .report-icon {
  background-color: #d1e5ff;
  transform: scale(1.05);
}

.report-icon i {
  font-size: 1.5rem;
  color: #4b89dc;
  transition: all 0.3s ease;
}

.report-card:hover .report-icon i {
  color: #3672cb;
}

.report-details {
  flex: 1;
}

.report-title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.report-title {
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  transition: color 0.3s ease;
}

.report-card:hover .report-title {
  color: #4b89dc;
}

.beta-badge {
  background-color: #dbeafe !important;
  color: #3b82f6 !important;
  font-size: 0.75rem !important;
  padding: 0.125rem 0.5rem !important;
  border-radius: 0.25rem !important;
  transition: all 0.3s ease;
}

.report-card:hover .beta-badge {
  background-color: #bfdbfe !important;
}

.report-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

/* Add a subtle highlight effect on hover */
.report-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4b89dc, #60a5fa);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.report-card:hover::after {
  transform: scaleX(1);
}

/* Override PrimeVue Card styling */
:deep(.p-card) {
  box-shadow: none;
}

:deep(.p-card .p-card-content) {
  padding: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .single-item {
    max-width: 100%;
  }
}
</style>
