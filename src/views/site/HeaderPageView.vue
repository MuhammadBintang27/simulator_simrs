<template>
  <div class="bg-screen">
    <!-- Hero Section -->
    <div class="hero-container">
      <div class="content-section">
        <div class="text-content">
          <div class="badge">
            <span class="badge-text">🚀 Aplikasi Bisnis Online</span>
          </div>

          <h1 class="main-heading">
            <span class="dark-text">LINK</span>
            <span class="orange-text">RENTAL</span>
          </h1>

          <h2 class="sub-heading">
            Solusi Digital untuk Usaha Rental yang Lebih <span class="highlight">Cuan</span>
          </h2>

          <p class="description">
            Cutomer Rating, Jadwal Skedule Sewa Unit, Laporan Keuangan, Pengeluaran dll
          </p>

          <div class="cta-section">
            <button class="demo-button primary" @click="goToContact">
              <i class="pi pi-play-circle"></i>
              Get Demo + Free Trial
            </button>
            <button class="demo-button secondary" @click="goToContact">
              <i class="pi pi-phone"></i>
              Hubungi Kami
            </button>
          </div>

          <div class="trust-indicators">
            <div class="trust-item">
              <span class="trust-number">99.9%</span>
              <span class="trust-label">Uptime</span>
            </div>
            <div class="trust-item">
              <span class="trust-number">24/7</span>
              <span class="trust-label">Support</span>
            </div>
          </div>
        </div>

        <div class="image-container">
          <div class="image-wrapper">
            <img :src="pic" alt="LinkRental Dashboard Preview" class="main-illustration" />
            <div class="floating-card card-1">
              <div class="card-icon">📊</div>
              <div class="card-content">
                <div class="card-title">Real-time Analytics</div>
                <div class="card-subtitle">Monitor bisnis Anda</div>
              </div>
            </div>
            <div class="floating-card card-2">
              <div class="card-icon">🔒</div>
              <div class="card-content">
                <div class="card-title">Keamanan Terjamin</div>
                <div class="card-subtitle">Data terenkripsi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <div class="section-header">
        <h2 class="section-title">Mengapa Memilih LinkRental?</h2>
        <p class="section-subtitle">
          Platform terdepan untuk mengelola bisnis rental dengan teknologi modern dan fitur lengkap
        </p>
      </div>

      <div class="features-container">
        <div class="feature-card">
          <div class="feature-header">
            <div class="icon-circle indigo">
              <i class="pi pi-cog icon"></i>
            </div>
            <div class="feature-badge">Easy Setup</div>
          </div>
          <h3>Simple & Intuitif</h3>
          <p>
            Antarmuka yang intuitif dan navigasi yang jelas memungkinkan siapa pun dapat menggunakan
            sistem tanpa pelatihan khusus. Setup dalam hitungan menit.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-header">
            <div class="icon-circle green">
              <i class="pi pi-shield icon"></i>
            </div>
            <div class="feature-badge">Most Popular</div>
          </div>
          <h3>Keamanan Tingkat Enterprise</h3>
          <p>
            Aplikasi dilengkapi dengan sistem keamanan data tingkat lanjut dengan enkripsi
            end-to-end, backup otomatis, dan compliance terhadap standar keamanan internasional.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-header">
            <div class="icon-circle yellow">
              <i class="pi pi-clock icon"></i>
            </div>
            <div class="feature-badge">Time Saver</div>
          </div>
          <h3>Otomatisasi Cerdas</h3>
          <p>
            Otomatisasi proses seperti konfirmasi pemesanan, pengingat jadwal, perhitungan tarif,
            dan laporan keuangan untuk menghemat waktu dan mengurangi human error.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-header">
            <div class="icon-circle blue">
              <i class="pi pi-users icon"></i>
            </div>
            <div class="feature-badge">All-in-One</div>
          </div>
          <h3>User Experience Terbaik</h3>
          <p>
            Dirancang untuk dapat diakses oleh semua kalangan dengan responsive design, support
            multi-device, dan interface yang konsisten di semua platform.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import pic from '@/assets/img1.png'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToContact = () => {
  router.push('/site/registration')
}
</script>

<style scoped>
/* Global Styles */
* {
  box-sizing: border-box;
}

.bg-screen {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  min-height: 100vh;
}

/* Hero Section */
.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 60px;
  position: relative;
}

.content-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.text-content {
  max-width: 600px;
}

.badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
}

.badge-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.main-heading {
  font-size: 64px;
  line-height: 1.1;
  margin-bottom: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.dark-text {
  color: white;
}

.orange-text {
  color: #ffd700;
  background: linear-gradient(45deg, #ff6b6b, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sub-heading {
  color: rgba(255, 255, 255, 0.95);
  font-size: 32px;
  line-height: 1.3;
  margin-bottom: 24px;
  font-weight: 600;
}

.highlight {
  color: #ffd700;
  font-weight: 700;
}

.description {
  color: rgba(255, 255, 255, 0.85);
  font-size: 18px;
  line-height: 1.7;
  margin-bottom: 40px;
  font-weight: 400;
}

.cta-section {
  display: flex;
  gap: 16px;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.demo-button {
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.demo-button.primary {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.demo-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(255, 107, 107, 0.5);
}

.demo-button.secondary {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.demo-button.secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.trust-indicators {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.trust-number {
  font-size: 28px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 4px;
}

.trust-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* Image Section */
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  position: relative;
  max-width: 600px;
}

.main-illustration {
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.floating-card {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 10s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  left: -10%;
  animation-delay: 0s;
}

.card-2 {
  bottom: 20%;
  right: -10%;
  animation-delay: 3s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.card-icon {
  font-size: 24px;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
  color: #2d3748;
}

.card-subtitle {
  font-size: 12px;
  color: #718096;
}

/* Features Section */
.features-section {
  background: white;
  padding: 100px 40px;
}

.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px;
}

.section-title {
  font-size: 48px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 20px;
  color: #718096;
  line-height: 1.6;
  font-weight: 400;
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f7fafc;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-card.featured {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
}

.feature-card.featured h3,
.feature-card.featured p {
  color: white;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.icon-circle {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-1), var(--color-2));
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.indigo {
  --color-1: #667eea;
  --color-2: #764ba2;
}

.green {
  --color-1: #56d364;
  --color-2: #22c55e;
}

.yellow {
  --color-1: #ffd700;
  --color-2: #ffed4a;
}

.blue {
  --color-1: #3b82f6;
  --color-2: #1d4ed8;
}

.icon {
  font-size: 24px;
  color: white;
}

.feature-badge {
  background: #e2e8f0;
  color: #4a5568;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.feature-badge.popular {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
}

.feature-card h3 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #2d3748;
  font-weight: 700;
  line-height: 1.3;
}

.feature-card p {
  font-size: 16px;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 24px;
}

.feature-footer {
  margin-top: auto;
}

.learn-more {
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.learn-more:hover {
  color: #764ba2;
}

.feature-card.featured .learn-more {
  color: rgba(255, 255, 255, 0.9);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-section {
    grid-template-columns: 1fr;
    gap: 60px;
    text-align: center;
  }

  .main-heading {
    font-size: 48px;
  }

  .sub-heading {
    font-size: 28px;
  }

  .floating-card {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-container {
    padding: 40px 20px;
  }

  .features-section {
    padding: 60px 20px;
  }

  .main-heading {
    font-size: 36px;
  }

  .sub-heading {
    font-size: 24px;
  }

  .section-title {
    font-size: 36px;
  }

  .cta-section {
    flex-direction: column;
  }

  .demo-button {
    justify-content: center;
  }

  .trust-indicators {
    justify-content: center;
    gap: 30px;
  }

  .features-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feature-card.featured {
    transform: none;
  }
}

@media (max-width: 480px) {
  .main-heading {
    font-size: 28px;
  }

  .sub-heading {
    font-size: 20px;
  }

  .section-title {
    font-size: 28px;
  }

  .feature-card {
    padding: 24px 20px;
  }
}
</style>
