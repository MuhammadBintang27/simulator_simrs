<template>
  <section class="info-section content">
    <div class="info-block left-image">
      <div class="text-content">
        <h2>Kalender <span class="highlight">Booking Timeline</span></h2>
        <p>
          Dengan Booking Timeline, pengguna dapat melihat jadwal ketersediaan setiap mobil secara
          visual dan interaktif. Melalui tampilan kalender, manajemen dapat mengetahui ketersediaan
          kendaraan dengan mudah dan efisien.
        </p>
        <div class="feature-badge">
          <span>Real-time Updates</span>
        </div>
      </div>
      <div class="image-content">
        <div class="image-wrapper">
          <img :src="chatImage" alt="Booking Timeline Calendar" />
        </div>
      </div>
    </div>

    <div class="info-block right-image">
      <div class="text-content">
        <h2><span class="highlight">Halaman Transaksi</span> Memudahkan Proses Transaksi</h2>
        <p>
          Form ini dirancang untuk memudahkan pelanggan dalam melakukan proses pemesanan kendaraan
          dengan cepat, jelas, dan nyaman. Interface yang intuitif memastikan pengalaman pengguna
          yang optimal.
        </p>
        <div class="feature-badge">
          <span>User-Friendly Interface</span>
        </div>
      </div>
      <div class="image-content">
        <div class="image-wrapper">
          <img :src="leadsImage" alt="Transaction Page Interface" />
        </div>
      </div>
    </div>

    <div class="info-block left-image">
      <div class="text-content">
        <h2>Rating <span class="highlight">Customer</span></h2>
        <p>
          Halaman ini menampilkan profil dan riwayat penyewa secara ringkas dan informatif, sehingga
          memudahkan pengusaha rental dalam mengevaluasi latar belakang dan reputasi pelanggan
          sebelum menyetujui transaksi baru. Data ini akan saling bertukar informasi ke sesama
          pengusaha rental.
        </p>
        <div class="feature-badge">
          <span>Data Sharing Network</span>
        </div>
      </div>
      <div class="image-content">
        <div class="image-wrapper">
          <img :src="histori" alt="Customer Rating System" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import chatImage from '@/assets/kalender.jpg'
import leadsImage from '@/assets/transaksi.jpg'
import histori from '@/assets/histori.jpg'
</script>

<style scoped>
.info-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  margin-top: 0;
  padding: 6rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 8rem;
  position: relative;
}

.info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.info-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 3rem;
  background: #ffffff;
  padding: 3rem 2.5rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.info-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #0d47a1, #1976d2, #42a5f5);
}

.info-block.right-image {
  flex-direction: row-reverse;
}

.text-content {
  flex: 1;

  padding-right: 1rem;
}

.info-block.right-image .text-content {
  padding-right: 0;
  padding-left: 1rem;
}

.text-content h2 {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.text-content .highlight {
  color: #0d47a1;
  position: relative;
}

.text-content .highlight::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #0d47a1, #42a5f5);
  border-radius: 1px;
}

.text-content p {
  font-size: 17px;
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 2rem;
  font-weight: 400;
}

.feature-badge {
  display: inline-block;
}

.feature-badge span {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #0d47a1;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  letter-spacing: 0.025em;
}

.image-content {
  flex: 1;
  min-width: 280px;
  max-width: 460px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.image-wrapper::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  border-radius: 1.5rem;
  z-index: -1;
  opacity: 0.8;
}

.image-content img {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.4s ease;
  border: 1px solid #f1f5f9;
}

.image-content img:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Responsive Layout */
@media (max-width: 1024px) {
  .info-section {
    gap: 6rem;
    padding: 4rem 1.5rem;
  }

  .info-block {
    padding: 2.5rem 2rem;
    gap: 2.5rem;
  }
}

@media (max-width: 768px) {
  .info-section {
    gap: 4rem;
    padding: 3rem 1rem;
  }

  .info-block {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
    gap: 2rem;
  }

  .info-block.right-image {
    flex-direction: column;
  }

  .text-content,
  .image-content {
    max-width: 100%;
    padding: 0;
  }

  .info-block.right-image .text-content {
    padding: 0;
  }

  .text-content h2 {
    font-size: 26px;
    margin-bottom: 1rem;
  }

  .text-content p {
    font-size: 16px;
    margin-bottom: 1.5rem;
  }

  .feature-badge span {
    padding: 0.6rem 1.2rem;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .info-section {
    padding: 2rem 0.75rem;
  }

  .info-block {
    padding: 1.5rem 1rem;
  }

  .text-content h2 {
    font-size: 22px;
  }

  .text-content p {
    font-size: 15px;
  }
}
</style>
