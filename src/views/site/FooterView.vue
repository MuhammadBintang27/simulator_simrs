<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Logo dan Deskripsi -->
      <div class="footer-section">
        <img :src="logo" alt="Visdio Logo" class="logo" />
        <p class="desc">
          PT.PARIPURNA SENTOSA DIGITAL <br />
          Corporate, Business, and Brand
        </p>
      </div>

      <!-- Site Maps -->
      <div class="footer-section">
        <h3 class="footer-title">Site Maps</h3>
        <ul class="footer-list">
          <li>About Us</li>
          <li>Company Profiles</li>
          <li>Portfolio</li>
          <li>Contact Us</li>
        </ul>
      </div>

      <!-- Information -->
      <div class="footer-section">
        <h3 class="footer-title">Information</h3>
        <p>WhatsApp: <a href="https://wa.me/+6282181991899" target="_blank">082181991899</a></p>
        <p>Email: <a href="mailto:info@visdio.id">admin@link-rental.id</a></p>
      </div>

      <!-- Office -->
      <div class="footer-section">
        <h3 class="footer-title">Office</h3>
        <p><strong>Head Office:</strong> Meulaboh , Aceh Barat, 16616</p>
        <br />
      </div>
    </div>
  </footer>
</template>

<script setup>
import logo from '@/assets/logo3.jpg'
</script>

<style scoped>
.footer {
  background-color: #545454;
  color: #e0e0e0;
  padding: 3rem 2rem;
  font-family: 'Segoe UI', sans-serif;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
}

.footer-section {
  flex: 1 1 200px;
  max-width: 300px;
}

.logo {
  width: 130px;
  margin-bottom: 1rem;
}

.desc {
  font-size: 14px;
  line-height: 1.6;
  color: #c5c5c5;
}

.footer-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list li {
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.footer-list li:hover {
  color: #f4a825;
}

a {
  color: #e0e0e0;
  text-decoration: none;
}

a:hover {
  color: #f4a825;
}
</style>
