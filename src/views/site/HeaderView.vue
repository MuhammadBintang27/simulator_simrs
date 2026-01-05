<template>
  <div class="broccoli-app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-top">
          <div class="contact-info">
            <div class="location">
              <i class="pi pi-map-marker text-green"></i>
              <span>15/A, Nest Tower, NYC</span>
            </div>
            <div class="email">
              <i class="pi pi-envelope text-green"></i>
              <span>info@webmail.com</span>
            </div>
          </div>
          <div class="right-section">
            <div class="language-selector">
              <span>English</span>
              <i class="pi pi-chevron-down"></i>
            </div>
            <div class="social-icons">
              <i class="pi pi-facebook"></i>
              <i class="pi pi-twitter"></i>
              <i class="pi pi-instagram"></i>
              <i class="pi pi-globe"></i>
            </div>
          </div>
        </div>

        <div class="main-nav">
          <div class="logo">
            <img
              src="https://cdn.vectorstock.com/i/1000v/34/43/broccoli-logo-and-text-for-designs-vector-26603443.jpg"
              alt="Broccoli Logo"
            />
          </div>
          <nav class="menu">
            <ul>
              <li>
                <a href="#">Home <i class="pi pi-chevron-down"></i></a>
              </li>
              <li>
                <a href="#">About <i class="pi pi-chevron-down"></i></a>
              </li>
              <li>
                <a href="#">Shop <i class="pi pi-chevron-down"></i></a>
              </li>
              <li>
                <a href="#">News <i class="pi pi-chevron-down"></i></a>
              </li>
              <li>
                <a href="#">Pages <i class="pi pi-chevron-down"></i></a>
              </li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
          <div class="nav-actions">
            <Button class="p-button-success get-quote">GET A QUOTE</Button>
            <i class="pi pi-search"></i>
            <i class="pi pi-user"></i>
            <div class="cart">
              <i class="pi pi-shopping-cart"></i>
              <span class="cart-count">4</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="product-badge">
            <i class="pi pi-check-circle text-green"></i>
            <span>100% genuine Products</span>
          </div>
          <h1 class="hero-title">Our Garden's Most<br />Favorite Food</h1>
          <p class="hero-description">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit,<br />
            sed do eiusmod tempor incididunt ut labore.
          </p>
          <Button class="p-button-success explore-btn">EXPLORE PRODUCTS</Button>
        </div>
        <div class="hero-image">
          <img
            src="https://cdn.vectorstock.com/i/1000v/34/43/broccoli-logo-and-text-for-designs-vector-26603443.jpg"
            alt="Fresh Vegetables"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup></script>

<style>
/* Reset and Base Styles */

.text-green {
  color: #8bc34a;
}

.contact-info {
  display: flex;
  gap: 20px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icons i {
  cursor: pointer;
}

/* Main Navigation */
.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.logo img {
  height: 50px;
}

.menu ul {
  display: flex;
  list-style: none;
  gap: 30px;
}

.menu a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.get-quote {
  background-color: #8bc34a !important;
  border: none !important;
  font-weight: bold !important;
  padding: 10px 20px !important;
}

.cart {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #8bc34a;
  color: white;
  font-size: 12px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Hero Section */
.hero-section {
  background-color: #f9f8f4;
  padding: 80px 0;
}

.hero-section .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-content {
  flex: 1;
}

.product-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.hero-title {
  font-size: 48px;
  color: #102041;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-description {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.explore-btn {
  background-color: #8bc34a !important;
  border: none !important;
  font-weight: bold !important;
  padding: 12px 25px !important;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}
</style>
