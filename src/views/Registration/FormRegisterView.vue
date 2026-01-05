<template>
  <MenubarView></MenubarView>
  <div class="quote-page">
    <!-- Header Section -->
    <div class="quote-header">
      <h1 class="title">Request Penawaran</h1>
      <p class="subtitle">
        Punya kebutuhan khusus atau pengin tahu lebih lanjut tentang layanan kami? Isi form ini, ya!
        Tim kami bakal cek dan kabari kamu secepatnya—biasanya sih nggak lebih dari 1–2 hari kerja.
        Makin lengkap infonya, makin pas juga penawarannya. Jadi, jangan ragu buat ceritain
        kebutuhan kamu di sini. Kami siap bantu!
      </p>
    </div>

    <!-- Form Section -->
    <div class="form-container">
      <form @submit.prevent="submitForm">
        <div class="">
          <!-- Company Name -->
          <div class="p-col-12 p-md-6 form-field">
            <label for="name"
              >Nama Perusahaan
              <span class="tanda-wajib">*</span>
            </label>
            <InputText
              id="name"
              v-model="form.name"
              placeholder="Nama Perusahaan"
              class="p-inputtext w-full"
              required
            />
          </div>

          <!-- Phone Number -->
          <div class="p-col-12 p-md-6 form-field">
            <label for="phone">Phone Number <span class="tanda-wajib">*</span></label>
            <InputText
              id="phone"
              v-model="form.phone"
              placeholder="Phone Number"
              class="p-inputtext w-full"
              required
            />
          </div>

          <!-- Province -->
          <div class="p-col-12 p-md-6 form-field">
            <label for="country">Provinsi <span class="tanda-wajib">*</span></label>
            <Select
              id="country"
              v-model="form.country"
              :options="data_prov"
              filter
              optionLabel="name"
              placeholder="Pilih Provinsi"
              class="w-full"
              @change="data_kab"
              required
            />
          </div>

          <!-- Kabupaten -->
          <div class="p-col-12 p-md-6 form-field">
            <label for="projectType">Kabupaten <span class="tanda-wajib">*</span></label>
            <Select
              id="projectType"
              v-model="form.kab_selected"
              filter
              :options="data_kabupaten"
              optionLabel="label"
              placeholder="Kabupaten..."
              class="w-full"
              @change="data_kec"
              required
            />
          </div>

          <!-- Kecamatan -->
          <div class="p-col-12 p-md-6 form-field">
            <label for="kecamatan">Kecamatan <span class="tanda-wajib">*</span></label>
            <Select
              id="kecamatan"
              v-model="form.kec_selected"
              filter
              :options="data_kecamatan"
              optionLabel="label"
              placeholder="Kecamatan"
              class="w-full"
              required
            />
          </div>

          <!-- Email -->
          <div class="p-col-12 p-md-6 form-field">
            <label for="email">Email <span class="tanda-wajib">*</span></label>
            <InputText
              id="email"
              v-model="form.email"
              placeholder="Email aktif"
              class="p-inputtext w-full"
              type="email"
              required
            />
          </div>

          <!-- reCAPTCHA Notice -->
          <div class="p-col-12 form-field">
            <div class="recaptcha-notice">
              <div class="recaptcha-icon">
                <i class="pi pi-shield"></i>
              </div>
              <div class="recaptcha-text">
                <span class="recaptcha-title">🔒 Keamanan Terjamin</span>
                <p class="recaptcha-description">
                  Form ini dilindungi oleh Google reCAPTCHA untuk memastikan keamanan data Anda.
                  Dengan mengirim form ini, Anda menyetujui
                  <a href="https://policies.google.com/terms" target="_blank" class="recaptcha-link"
                    >Syarat Layanan</a
                  >
                  dan
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    class="recaptcha-link"
                    >Kebijakan Privasi</a
                  >
                  Google.
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="p-col-12 text-center">
            <Button
              type="submit"
              label="Registrasi"
              class="submit-button"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            />
          </div>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div v-if="message" :class="messageClass" class="form-message">
        <i :class="messageIcon" style="margin-right: 8px"></i>
        {{ message }}
      </div>
    </div>
  </div>
  <Footer></Footer>
</template>

<script setup>
import Select from 'primevue/select'
import { ref, reactive, onMounted } from 'vue'
import { useReCaptcha } from 'vue-recaptcha-v3'

// import HeaderView from '@/views/site/HeaderView.vue'
import MenubarView from '@/views/site/MenubarView.vue'
import Footer from '@/views/site/FooterView.vue'
// import HeaderView from '../../views/site/HeaderView.vue'

import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const configStore = useConfigStore()
import axios from 'axios'

// reCAPTCHA setup
const { executeRecaptcha, recaptchaLoaded } = useReCaptcha()

// Form submission states
const isSubmitting = ref(false)
const message = ref('')
const messageClass = ref('')
const messageIcon = ref('')

const data_prov = ref([])
const data_kabupaten = ref([])
const data_kecamatan = ref([])

// Form data
const form = reactive({
  kab_selected: null,
  name: '',
  email: '',
  phone: '',
  country: null,
  kec_selected: null,
  budget: '',
  timeframe: '',
  company: '',
  skills: '',
  file: null,
  message: '',
})

const getdata_provinsi = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/v1/getdata_provinsi`)
    data_prov.value = response.data.response
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const data_kab = async (e) => {
  try {
    let selectedProvId

    if (e && e.value && e.value.id) {
      selectedProvId = e.value.id
    } else if (e && e.id) {
      selectedProvId = e.id
    } else {
      console.error('Invalid province selection')
      return
    }

    const param = {
      id_prov: selectedProvId,
      mode: 1,
      nama: '',
    }

    const url = configStore.apiBaseUrl
    data_kabupaten.value = []
    form.kab_selected = []
    data_kecamatan.value = []

    const response = await axios.post(`${url}/v1/data_kab`, param)
    data_kabupaten.value = response.data.response
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const data_kec = async (e) => {
  try {
    console.log(e)

    const param = {
      id_kab: e.value.value,
      mode: 1,
      nama: '',
    }

    console.log(param)

    const url = configStore.apiBaseUrl
    data_kecamatan.value = []
    form.kec_selected = []

    const response = await axios.post(`${url}/v1/data_kec`, param)
    data_kecamatan.value = response.data.response
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Form submission with reCAPTCHA
const submitForm = async () => {
  try {
    isSubmitting.value = true
    message.value = ''

    // Wait for reCAPTCHA to load
    await recaptchaLoaded()

    // Execute reCAPTCHA with a specific action
    const recaptchaToken = await executeRecaptcha('registration_form')

    // Prepare form data
    const formData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      prov_selected: form.country,
      kab_selected: form.kab_selected,
      kec_selected: form.kec_selected,
      recaptchaToken: recaptchaToken,
    }

    // Submit to your backend
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/v1/insertDataCompany`, formData)

    console.log(response)

    if (response.data.code == 200) {
      message.value = 'Registrasi berhasil! Tim kami akan menghubungi Anda dalam 1-2 hari kerja.'
      messageClass.value = 'success-message'
      messageIcon.value = 'pi pi-check-circle'
      // Reset form
      Object.keys(form).forEach((key) => {
        if (typeof form[key] === 'string') {
          form[key] = ''
        } else {
          form[key] = null
        }
      })

      // Reset dropdowns
      data_kabupaten.value = []
      data_kecamatan.value = []
    } else {
      throw new Error(response.data.message || 'Registration failed')
    }
  } catch (error) {
    console.error('Error:', error)

    if (error.response && error.response.status === 400) {
      message.value = 'Verifikasi reCAPTCHA gagal. Silakan coba lagi.'
    } else {
      message.value = 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.'
    }
    messageClass.value = 'error-message'
    messageIcon.value = 'pi pi-exclamation-circle'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  getdata_provinsi()
})
</script>

<style scoped>
/* Global Styles */
.quote-page {
  color: #333;
  background-color: #f5f5f5;
}

.tanda-wajib {
  color: red;
}

/* Header Section */
.quote-header {
  background: linear-gradient(135deg, #f9fbe7, #e3f2fd); /* gradasi full screen */
  color: #333;
  padding: 3rem 1rem;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #333;
}

.subtitle {
  font-size: 1rem;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Form Container */
.form-container {
  max-width: 700px;
  margin: -2rem auto 4rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-field {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.p-inputtext,
.p-dropdown {
  width: 100%;
}

/* reCAPTCHA Notice */

/* reCAPTCHA Notice */
.recaptcha-notice {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.recaptcha-notice:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recaptcha-icon {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.recaptcha-icon i {
  font-size: 1.2rem;
}

.recaptcha-text {
  flex: 1;
}

.recaptcha-title {
  display: block;
  font-weight: 600;
  font-size: 1rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

.recaptcha-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.5;
}

.recaptcha-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.recaptcha-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

/* Form Messages */
.form-message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.success-message {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.error-message {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

/* Submit Button */
.submit-button {
  background-color: #7e57c2;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover:not(:disabled) {
  background-color: #673ab7;
}

.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* Upload Area */
.upload-area {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
}

.upload-button {
  margin-top: 1rem;
}

/* Clients Section */
.clients-section {
  padding: 4rem 1rem;
  text-align: center;
  background-color: #f5f5f5;
}

.section-title {
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #333;
}

.client-logos {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.client-logo {
  height: 40px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.client-logo:hover {
  opacity: 1;
}

.offices-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.office h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.office p {
  margin: 0.5rem 0;
  color: #666;
}

.inquiry-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.send-button {
  background-color: #7e57c2;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover {
  background-color: #673ab7;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 3rem;
}

.links-column h4 {
  margin-bottom: 1rem;
  color: #333;
}

.links-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.links-column li {
  margin-bottom: 0.5rem;
}

.links-column a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.links-column a:hover {
  color: #7e57c2;
}

/* Responsive Grid */
.p-grid {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.5rem;
  margin-left: -0.5rem;
}

.p-col-12 {
  flex: 0 0 100%;
  padding: 0 0.5rem;
}

@media screen and (min-width: 768px) {
  .p-md-6 {
    flex: 0 0 50%;
  }
}

.w-full {
  width: 100%;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-center {
  text-align: center;
}
</style>
