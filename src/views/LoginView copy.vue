<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="text-center" style="margin-bottom: 30px">
        Masuk ke Link Rental <i class="pi pi-shield"></i>
      </h2>
      <form @submit.prevent="login">
        <div class="p-field">
          <label for="email">Email atau No. Handphone</label>
          <InputText id="email" type="text" v-model="email" class="p-inputtext-sm w-100" required />
        </div>
        <div class="p-field">
          <label for="password">Password</label>
          <InputText
            id="password"
            type="password"
            v-model="password"
            class="p-inputtext-sm w-100"
            required
          />
        </div>
        <Button
          label="Selanjutnya"
          class="p-button-success p-button-rounded w-100 mt-3 round-button"
          :loading="loading"
          @click="handleLogin"
        />
        <div class="login-options">
          <div class="p-field-checkbox">
            <Checkbox id="remember" v-model="rememberMe" :binary="true" />
            <label for="remember" style="margin-top: 10px">Remember Me</label>
          </div>
          <a href="#" class="forgot-password">Lupa kata sandi?</a>
        </div>
        <p class="register-text">Belum memiliki akun? <a href="#">Daftar Sekarang</a></p>
      </form>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useRouter } from 'vue-router'
const router = useRouter()

import axios from 'axios'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

import { useToast } from 'primevue/usetoast'
const toast = useToast()
import { useConfigStore } from '@/stores/config' // Import the Pinia store

const configStore = useConfigStore() // ✅ Define configStore properly

const handleLogin = async () => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/login`, {
      user_id: email.value,
      password: password.value,
    })

    if (response.data.metadata.code == 200) {
      toast.add({ severity: 'success', summary: 'Login Successfullys', life: 3000 })

      localStorage.setItem('token', response.data.response.token)
      localStorage.setItem('token_expires_at', response.data.response.token_expires_at)
      localStorage.setItem('loggedIn', true)
      localStorage.setItem('id_client', response.data.response.id_client)
      localStorage.setItem('user_name', response.data.response.user_name)
      localStorage.setItem('user_id', response.data.response.user_id)
      localStorage.setItem('company', response.data.response.company.perusahaan)

      setTimeout(() => {
        router.push('/dashboard/dashboardUnitView')
      }, 1000)
    } else {
      toast.add({ severity: 'warn', summary: 'Invalid Credentials', life: 3000 })
    }

    // if (email.value == '@gmail.com' && password.value == 12345) {
    //   localStorage.setItem('token', '12345')
    //   router.push('/') // Redirect ke dashboard setelah login

    //   const secretKey = 'your-secret-key' // Jangan gunakan ini di frontend untuk produksi!

    //   const generateToken = (user) => {
    //     return jwtDecode.sign(user, secretKey, { expiresIn: '1h' }) // Token berlaku selama 1 jam
    //   }

    //   const userData = { id: 1, name: 'Zafira', role: 'admin' }
    //   const token = generateToken(userData)

    //   console.log('User Info:', token)
    // } else {
    //   toast.add({ severity: 'info', summary: 'Invalid Credentials', life: 3000 })
    // }
  } catch (error) {
    console.error('Login gagal:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Background */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('https://img.freepik.com/free-vector/vector-blue-curve-background_361591-3475.jpg?semt=ais_hybrid')
    no-repeat center center;

  background-size: cover;
  position: relative;
}

/* Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Form */
.p-field {
  margin-bottom: 1rem;
  text-align: left;
}

/* Options */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

/* Forgot Password */
.forgot-password {
  font-size: 0.9rem;
  color: #007bff;
  text-decoration: none;
}

/* Register */
.register-text {
  margin-top: 15px;
  font-size: 0.9rem;
}
</style>
