<template>
  <MenubarView></MenubarView>
  <div class="bg-screen">
    <div class="container">
      <div class="pricing-header">
        <h1>Pilih paket anda</h1>
        <p class="subtitle">Pilih harga yang sesuai dengan usaha anda</p>
      </div>

      <div class="pricing-cards">
        <div
          v-for="(plan, index) in pricingPlans"
          :key="index"
          class="price-card"
          :class="{ popular: plan.popular }"
        >
          <div v-if="plan.popular" class="popular-badge">Most Popular</div>

          <h3>{{ plan.title }}</h3>

          <div class="price">
            <span class="currency" v-if="plan.contactSales === false">Rp</span>
            <span class="amount">{{ plan.price }}</span>
            <span class="period" v-if="plan.contactSales === false">/Bulan</span>
          </div>

          <ul class="features">
            <li v-for="(feature, fIndex) in plan.features" :key="fIndex">
              {{ feature }}
            </li>
          </ul>

          <button class="cta-button" :class="{ primary: plan.popular }" @click="openWhatsApp(plan)">
            Get Started
          </button>
        </div>
      </div>
    </div>
  </div>
  <FooterView></FooterView>
</template>

<script setup>
import { ref } from 'vue'
import MenubarView from '@/views/site/MenubarView.vue'
import FooterView from '@/views/site/FooterView.vue'

const pricingPlans = ref([
  {
    title: 'Starter',
    price: '265.000',
    contactSales: false,
    popular: false,
    features: ['Jumlah armada <= 30 unit', '3 User Access', 'Basic Support'],
  },
  {
    title: 'Business',
    price: '310.000',
    contactSales: false,
    popular: true,
    features: [
      'Jumlah armada > 31 - 50 unit',
      '8 Business Data',
      '5 User Access',
      'Priority Support',
      'Advanced Analytics',
      'Custom Reports',
    ],
  },
  {
    title: 'Enterprise',
    price: 'Sales',
    contactSales: true,
    popular: false,
    features: [
      'Unlimited Armada',
      'Unlimited Users',
      '24/7 Support',
      'Advanced Analytics',
      'Custom Integration',
      'Dedicated Manager',
    ],
  },
])

// WhatsApp function
const openWhatsApp = (plan) => {
  const phoneNumber = '6282181991899' // Replace with your WhatsApp number (with country code, no + sign)
  const message = `Halo! Saya tertarik untuk ${plan.title} pake (Rp ${plan.price}/month). Bisa Bantu saya?`
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

  window.open(whatsappUrl, '_blank')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.bg-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  width: 100%;
  max-width: 850px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pricing-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.375rem 0;
}

.subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.price-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  position: relative;
  transition: all 0.2s ease;
}

.price-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.popular {
  border-color: #3b82f6;
  transform: scale(1.03);
}

.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #3b82f6;
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 18px;
  font-size: 0.8rem;
  font-weight: 600;
}

.price-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.875rem 0;
  text-align: center;
}

.price {
  text-align: center;
  margin-bottom: 1.5rem;
}

.currency {
  font-size: 1rem;
  color: #64748b;
  vertical-align: top;
}

.amount {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1a202c;
}

.period {
  font-size: 0.9rem;
  color: #64748b;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.features li {
  padding: 0.6rem 0;
  color: #475569;
  position: relative;
  padding-left: 1.375rem;
  font-size: 0.9rem;
}

.features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
  font-size: 0.9rem;
}

.cta-button {
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cta-button:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.cta-button.primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.cta-button.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .bg-screen {
    padding: 1rem;
  }

  .pricing-header h1 {
    font-size: 1.75rem;
  }

  .pricing-cards {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .popular {
    transform: none;
  }

  .price-card {
    padding: 1.25rem;
  }

  .amount {
    font-size: 2rem;
  }
}
</style>
