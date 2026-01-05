<template>
  <div class="broccoli-app" style="margin-bottom: 30px">
    <!-- Header with scroll animation class binding -->
    <header class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="container">
        <div class="main-nav">
          <div class="logo">
            <router-link to="/">
              <img :src="logo" alt="" />
            </router-link>
          </div>

          <!-- Mobile Menu Toggle Button -->
          <button class="mobile-menu-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <i class="pi pi-bars"></i>
          </button>

          <!-- Navigation -->
          <nav class="menu" :class="{ open: isMobileMenuOpen }">
            <ul>
              <li class="menu-item has-submenu">
                <router-link to="/">
                  <a href="#">Home </a>
                </router-link>
                <!-- <ul class="submenu">
                  <li><a href="#">Homepage 1</a></li>
                  <li><a href="#">Homepage 2</a></li>
                  <li><a href="#">Homepage 3</a></li>
                </ul> -->
              </li>
              <li class="menu-item has-submenu">
                <a href="#"> <router-link to="/site/PricingMenuView">Harga</router-link></a>
              </li>
              <!-- <li class="menu-item has-submenu">
                <a href="#"> <router-link to="/site/PricingMenuView">Tentan Kami</router-link></a>
              </li> -->
            </ul>
          </nav>

          <!-- Actions -->
          <div class="nav-actions">
            <!-- <i class="pi pi-search"></i> -->
            <router-link to="/home" class="nav-link">
              <i class="pi pi-user nav-item"
                ><span style="font-family: 'Lato', sans-serif; font-size: 15px"> Login</span></i
              >
            </router-link>

            <Button class="p-button-success get-quote round-button2" @click="goToContact"
              >Kontak</Button
            >
          </div>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import logo from '@/assets/logo3.jpg'

import { useRouter } from 'vue-router'

const router = useRouter()

const goToContact = () => {
  router.push('/site/registration')
}

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* Header and scroll animation styles */
.header {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 10;
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
  transition: all 0.3s ease-in-out;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-scrolled {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Main Navigation */
.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  transition: all 0.3s ease-in-out;
  flex-wrap: nowrap;
}

.logo {
  margin-right: 30px;
}

.logo img {
  height: 40px;
  transition: height 0.3s ease;
}

.menu {
  flex-grow: 1;
}

.menu ul {
  display: flex;
  list-style: none;
  gap: 30px;
  margin: 0;
  padding: 0;
}

.menu-item {
  position: relative;
}

.menu a {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 0;
}

.menu a:hover {
  color: #8bc34a;
}

/* Submenu Styles */
.has-submenu {
  position: relative;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition:
    opacity 0.3s,
    transform 0.3s,
    visibility 0.3s;
  z-index: 1001;
  padding: 5px 0;
}

.has-submenu:hover .submenu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.submenu li {
  list-style: none;
}

.submenu a {
  padding: 10px 20px;
  display: block;
  font-weight: 400;
  transition:
    background 0.2s,
    color 0.2s;
}

.submenu a:hover {
  color: #8bc34a;
}

/* Chevron animation */
.has-submenu:hover .pi-chevron-down {
  transform: rotate(0deg);
}

.pi-chevron-down {
  transition: transform 0.3s ease;
  font-size: 12px;
}

/* Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-actions i {
  font-size: 18px;
  color: #333;
  cursor: pointer;
}

.nav-actions i:hover {
  color: #8bc34a;
}

.get-quote {
  background-color: #8bc34a !important;
  border: none !important;
  font-weight: bold !important;
  padding: 10px 20px !important;
  box-shadow: 0 4px 8px rgba(139, 195, 74, 0.2);
}

/* Mobile Menu Toggle Button */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #333;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .main-nav {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .menu {
    width: 100%;
    display: none;
    flex-direction: column;
    background: white;
    padding: 15px 0;
    position: absolute;
    top: 100%;
    left: 0;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    z-index: 1001;
  }

  .menu.open {
    display: flex;
  }

  .menu ul {
    flex-direction: column;
    gap: 10px;
  }

  .mobile-menu-toggle {
    display: block;
    margin-left: auto;
  }
}
</style>
