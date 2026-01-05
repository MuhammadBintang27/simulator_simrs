<template>
  <div class="content">
    <Panel>
      <!-- Header -->
      <div class="text-center mb-12 py-8">
        <div class=" ">
          <h1
            class="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            💬 Tanya Kami
          </h1>

          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-2"></div>
          <p class="text-xl text-gray-600">Pertanyaan yang Sering Diajukan</p>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <div class="max-w-5xl mx-auto">
        <Accordion :activeIndex="0" class="w-full space-y-4">
          <AccordionTab
            v-for="(faq, index) in faqData"
            :key="index"
            :header="faq.question"
            class="shadow-lg rounded-2xl overflow-hidden"
          >
            <div class="py-6 px-6 bg-white">
              <div v-if="faq.answer.type === 'text'" class="text-gray-800 leading-relaxed text-lg">
                {{ faq.answer.content }}
              </div>

              <div v-else-if="faq.answer.type === 'list'" class="text-gray-800 text-lg">
                <p class="mb-4 font-medium">{{ faq.answer.intro }}</p>
                <ul class="list-none space-y-3 ml-0">
                  <li
                    v-for="(item, itemIndex) in faq.answer.items"
                    :key="itemIndex"
                    class="flex items-start"
                  >
                    <span
                      class="inline-block w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"
                    ></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div v-else-if="faq.answer.type === 'highlight'" class="text-gray-800 text-lg">
                <span v-html="faq.answer.content"></span>
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </div>
    </Panel>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'

// FAQ Data
const faqData = ref([
  {
    question: '1. Apa itu Link Rental?',
    answer: {
      type: 'text',
      content:
        'Link Rental adalah aplikasi manajemen rental kendaraan yang membantu Anda mengelola seluruh proses bisnis rental Mobil,motor, alat berat dll secara digital — mulai dari pemesanan, jadwal sewa,  hingga laporan keuangan.',
    },
  },
  {
    question: '2. Apakah Link Rental bisa digunakan untuk semua jenis usaha rental?',
    answer: {
      type: 'text',
      content:
        'Ya, Link Rental dapat digunakan oleh usaha rental mobil harian, mingguan, hingga kontrak jangka panjang, baik skala kecil, menengah, maupun besar.',
    },
  },
  {
    question: '3. Apakah aplikasi ini berbasis web atau mobile?',
    answer: {
      type: 'text',
      content:
        'Link Rental berbasis web, sehingga bisa diakses dari laptop maupun smartphone melalui browser. Kami juga sedang mengembangkan versi mobile untuk Android dan iOS.',
    },
  },
  {
    question: '4. Apa saja fitur utama Link Rental?',
    answer: {
      type: 'list',
      intro: 'Link Rental memiliki berbagai fitur lengkap untuk mendukung bisnis rental Anda:',
      items: [
        'Manajemen pemesanan dan penyewaan',
        'Jadwal kendaraan dan pengingat',
        'Laporan keuangan otomatis',
        'Manajemen pelanggan',
        'Integrasi sistem pembayaran',
        'Rating Kustomer',
        'Kalender Rantal',
      ],
    },
  },
  {
    question: '5. Apakah data saya aman?',
    answer: {
      type: 'text',
      content:
        'Ya, data Anda disimpan di server yang aman dan kami menggunakan enkripsi untuk menjaga kerahasiaan informasi pelanggan.',
    },
  },
  {
    question: '6. Bisakah saya mencoba dulu sebelum berlangganan?',
    answer: {
      type: 'highlight',
      content:
        "Tentu! Kami menyediakan <strong class='text-green-600 text-xl font-bold'>demo gratis selama 7 hari</strong> agar Anda bisa mencoba semua fitur Link Rental.",
    },
  },
  {
    question: '7. Bagaimana sistem pembayarannya?',
    answer: {
      type: 'text',
      content:
        'Kami menggunakan sistem langganan bulanan atau tahunan. Pembayaran dapat dilakukan melalui transfer bank, e-wallet, atau kartu kredit.',
    },
  },
  {
    question: '8. Apakah Link Rental bisa digunakan oleh lebih dari satu staf?',
    answer: {
      type: 'text',
      content:
        'Bisa. Anda dapat menambahkan beberapa pengguna (multi-user) dengan hak akses yang berbeda, seperti admin, kasir, atau operator.',
    },
  },
  {
    question: '9. Apakah Link Rental bisa di-custom sesuai kebutuhan saya?',
    answer: {
      type: 'highlight',
      content:
        "Ya, kami menyediakan layanan <strong class='text-blue-600 text-xl font-bold'>kustomisasi fitur</strong> sesuai kebutuhan bisnis Anda.",
    },
  },
  {
    question: '10. Bagaimana cara saya mulai menggunakan Link Rental?',
    answer: {
      type: 'text',
      content:
        'Cukup hubungi tim kami atau daftar langsung melalui website. Kami akan bantu proses onboarding dan pelatihan pengguna.',
    },
  },
])
</script>

<style scoped>
/* Custom styles untuk accordion */
:deep(.p-accordion .p-accordion-tab) {
  margin-bottom: 1rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.p-accordion .p-accordion-tab:hover) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

:deep(.p-accordion .p-accordion-header .p-accordion-header-link) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 1.5rem 2rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: white;
  transition: all 0.3s ease;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

:deep(.p-accordion .p-accordion-header .p-accordion-header-link:hover) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: scale(1.02);
}

:deep(.p-accordion .p-accordion-header.p-highlight .p-accordion-header-link) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

:deep(.p-accordion .p-accordion-content) {
  background: white;
  border: none;
  border-top: 3px solid #4facfe;
}

/* Button styling */
:deep(.p-button) {
  padding: 1rem 3rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

:deep(.p-button:hover) {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

:deep(.p-button.p-button-success) {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 8px 25px rgba(17, 153, 142, 0.3);
}

:deep(.p-button.p-button-success:hover) {
  background: linear-gradient(135deg, #0e8478 0%, #2dd866 100%);
  box-shadow: 0 15px 35px rgba(17, 153, 142, 0.4);
}

/* Animation for gradient backgrounds */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

/* Icon styles */
.pi {
  font-size: 1.2rem;
}
</style>
