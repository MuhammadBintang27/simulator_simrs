import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/config'

const IDLE_MS = 3 * 60 * 60 * 1000 // 3 jam tidak aktif
const STORAGE_KEY = 'idle_last_activity'
const EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

export function useIdleSession() {
  const router = useRouter()
  const authStore = useAuthStore()

  let idleTimer = null

  function recordActivity() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  function doLogout() {
    clearTimeout(idleTimer)
    localStorage.removeItem(STORAGE_KEY)
    authStore.clearAuthData()
    router.push('/login')
  }

  function resetTimer() {
    clearTimeout(idleTimer)
    recordActivity()
    idleTimer = setTimeout(doLogout, IDLE_MS)
  }

  function onActivity() {
    resetTimer()
  }

  function checkOnMount() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const elapsed = Date.now() - parseInt(stored)
      if (elapsed >= IDLE_MS) {
        // Session sudah habis saat app tidak terbuka — langsung logout
        doLogout()
        return
      }
      // Lanjutkan timer dari sisa waktu yang tersisa
      clearTimeout(idleTimer)
      idleTimer = setTimeout(doLogout, IDLE_MS - elapsed)
    } else {
      // Sesi baru setelah login
      resetTimer()
    }
  }

  onMounted(() => {
    checkOnMount()
    EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
  })

  onUnmounted(() => {
    clearTimeout(idleTimer)
    EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
  })
}
