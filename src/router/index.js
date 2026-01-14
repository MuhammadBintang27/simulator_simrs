import { createRouter, createWebHistory } from 'vue-router'

const MainLayouts = () => import('@/layouts/MainLayouts.vue')
const LoginView = () => import('@/views/LoginView.vue')

// Lazy load all other components
const HomePage = () => import('@/layouts/HomePage.vue')
const Registration = () => import('@/views/Registration/FormRegisterView.vue')
const PricingMenuView = () => import('@/views/site/PricingMenuView.vue')

// Poliklinik
const ListPasien = () => import('@/views/Poliklinik/ListPasien.vue')
const FormPoliKlinikView = () => import('@/views/Poliklinik/FormPoliKlinikView.vue')

// Dashboard
const WelcomeHomeView = () => import('@/views/WelcomeHomeView.vue')

const ShareDataKendaraanView = () => import('@/views/dashboard/ShareDataKendaraanView.vue')
const DetailsShareView = () => import('@/views/dashboard/DetailsShareView.vue')

// Gizi
const Gizi = () => import('@/views/gizi/AssesmenGiziView.vue')
const listAssesmentGizi = () => import('@/views/gizi/ListpermintaanAssessmenView.vue')
const PendataanGiziPasienView = () => import('@/views/gizi/PendataanGiziPasienView.vue')
const RekapDietView = () => import('@/views/gizi/RekapDietView.vue')

// Ruang Operasi
const ListPasienOperasiView = () => import('@/views/RuangOperasi/ListPasienOperasiView.vue')
const PersiapanOperasiVIew = () => import('@/views/RuangOperasi/PersiapanOperasiVIew.vue')

// Apotik Online
const ReferensiApolView = () => import('@/views/Apol/ReferensiApolView.vue')
const TransaksiResepView = () => import('@/views/Apol/TransaksiResepView.vue')
const MonitoringApolView = () => import('@/views/Apol/MonitoringView.vue')

// Pendaftaran & Laporan
const PendaftaranPasienView = () => import('@/views/pendaftaran/PendaftaranPasienView.vue')
const RevenueReportView = () => import('@/views/laporan/RevenueReportView.vue')
const DatakunjunganView = () => import('@/views/Statistik/DatakunjunganView.vue')

const KlaimManajemenView = () => import('@/views/keuangan/KlaimManajemenView.vue')

const KasirView = () => import('@/views/keuangan/KasirView.vue')

const KasilPrintBill = () => import('@/views/keuangan/KasilPrintBill.vue')

const FormInputPasienComponent = () => import('@/views/Pendaftaran/FormInputPasienComponent.vue')

const OdontogramComponent = () => import('@/views/Poliklinik/Gigi/OdontogramComponent.vue')

const EditPendaftaranComponent = () => import('@/views/Pendaftaran/EditPendaftaranComponent.vue')

const FormStockOpnameView = () => import('@/views/Persediaan/StockOpname/FormStockOpnameView.vue')
//setting
const JadwalDokterView = () => import('@/views/setting/JadwalDokterView.vue')

//Laboratorium
const PermintaanLabView = () => import('@/views/Laboratorium/PermintaanLabView.vue')

const ProsesLabView = () => import('@/views/Laboratorium/ProsesLabView.vue')

const PrintOutlabView = () => import('@/views/Laboratorium/PrintOutlabView.vue')

const PrintPengantarView = () => import('@/views/Laboratorium/PrintPengantarView.vue')

const ReturPersediaanView = () => import('@/views/Persediaan/Retur/ReturPersediaanView.vue')

const ReturListReturView = () => import('@/views/Persediaan/Retur/ReturListReturView.vue')

const ReturKedepoView = () => import('@/views/Persediaan/Retur/ReturKedepoView.vue')

const DashboardCostControl = () => import('@/views/Monitoring/DashboardCostControl.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/site/registration',
      component: Registration,
    },
    {
      path: '',
      component: LoginView,
    },
    {
      path: '/site/PricingMenuView',
      component: PricingMenuView,
    },
    {
      path: '/unitid/:id_client/:tanggalawal/:tanggalakhir',
      name: 'UnitDetail',
      component: ShareDataKendaraanView,
    },
    {
      path: '/DetailsShareView',
      name: DetailsShareView,
      component: DetailsShareView,
    },
    {
      path: '/laboratorium/print-lab/:noreceipt',
      name: 'PrintOutlabView',
      component: PrintOutlabView,
    },
    {
      path: '/laboratorium/print-pengantar/:noreceipt',
      name: 'PrintPengantarView',
      component: PrintPengantarView,
    },
    {
      path: '/keuangan/print-bill/:norm/:noreg',
      name: 'KasilPrintBill',
      component: KasilPrintBill,
    },

    {
      path: '/',
      component: MainLayouts,
      children: [
        {
          path: 'dashboard/home', // Empty path for the default route
          name: 'WelcomeHomeView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: WelcomeHomeView, // Or any component you want as default
        },
        {
          path: 'home', // Empty path for the default route
          name: 'home',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: HomePage, // Or any component you want as default
        },
        {
          path: 'ListPasien/revenuereportview',
          name: 'RevenueReportView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: RevenueReportView,
        },
        {
          path: 'keuangan/klaim-manajemen',
          name: 'KlaimManajemenView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: KlaimManajemenView,
        },
        {
          path: 'keuangan/kasir',
          name: 'KasirView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: KasirView,
        },

        {
          path: 'ListPasien',
          name: 'ListPasien',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: ListPasien,
        },

        {
          path: 'poli/pemeriksaanpoli',
          name: 'FormPoliKlinikView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: FormPoliKlinikView,
        },
        {
          path: 'poli/odontogram-pasien',
          name: 'OdontogramComponent',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: OdontogramComponent,
        },

        {
          path: 'gizi/assesment-gizi', // No leading slash for child routes
          name: 'Gizi',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: Gizi,
        },
        {
          path: 'gizi/list-assesment-gizi', // No leading slash for child routes
          name: 'listAssesmentGizi',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: listAssesmentGizi,
        },
        {
          path: 'gizi/pendataan-diet-pasien', // No leading slash for child routes
          name: 'PendataanGiziPasienView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: PendataanGiziPasienView,
        },
        {
          path: 'gizi/diet-pasien', // No leading slash for child routes
          name: 'RekapDietView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: RekapDietView,
        },

        {
          path: 'operasi/data-pasien-op', // No leading slash for child routes
          name: 'ListPasienOperasiView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: ListPasienOperasiView,
        },
        {
          path: 'operasi/persiapan-operasi', // No leading slash for child routes
          name: 'PersiapanOperasiVIew',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: PersiapanOperasiVIew,
        },

        {
          path: 'apotik-online/referensi', // No leading slash for child routes
          name: 'ReferensiApolView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: ReferensiApolView,
        },

        {
          path: 'apotik-online/peresepan/:nosep?', // No leading slash for child routes
          name: 'TransaksiResepView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: TransaksiResepView,
        },

        {
          path: 'apotik-online/monitoring-klaim', // No leading slash for child routes
          name: 'MonitoringApolView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: MonitoringApolView,
        },
        {
          path: 'statistik/data-kunjungan', // No leading slash for child routes
          name: 'DatakunjunganView',
          meta: { DatakunjunganView: true }, // ✅ Protect this route
          component: DatakunjunganView,
        },
        {
          path: 'pendaftaran', // No leading slash for child routes
          name: 'PendaftaranPasienView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: PendaftaranPasienView,
        },
        {
          path: '/pendaftaran/edit-pendaftaran/:noreg',
          name: 'EditPendaftaranComponent',
          component: EditPendaftaranComponent,
        },
        {
          path: 'pendaftaran/input-pasien', // No leading slash for child routes
          name: 'FormInputPasienComponent',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: FormInputPasienComponent,
        },
        {
          path: 'setting/jadwal-dokter',
          name: 'JadwalDokterView',
          meta: { redirectPath: true },
          component: JadwalDokterView,
        },
        {
          path: 'persediaan/stock-opname',
          name: 'FormStockOpnameView',
          meta: { redirectPath: true },
          component: FormStockOpnameView,
        },

        {
          path: 'laboratorium/permintaan-lab',
          name: 'PermintaanLabView',
          meta: { redirectPath: true },
          component: PermintaanLabView,
        },
        {
          path: 'laboratorium/proses-lab/:noreceipt',
          name: 'ProsesLabView',
          meta: { redirectPath: true },
          component: ProsesLabView,
        },
        {
          path: 'persediaan/retur-persediaan',
          name: 'ReturPersediaanView',
          meta: { redirectPath: true },
          component: ReturPersediaanView,
        },
        {
          path: 'persediaan/list-retur-persediaan',
          name: 'ReturListReturView',
          meta: { redirectPath: true },
          component: ReturListReturView,
        },
        {
          path: 'persediaan/retur-kedepo-gudang',
          name: 'ReturKedepoView',
          meta: { redirectPath: true },
          component: ReturKedepoView,
        },
        {
          path: 'monitoring/cost-monitoring',
          name: 'DashboardCostControl',
          meta: { redirectPath: true },
          component: DashboardCostControl,
        },
        {
          path: 'login',
          name: 'login',
          component: LoginView,
        },
      ],
    },
  ],
})

let idleTimeout

const resetIdleTimer = () => {
  clearTimeout(idleTimeout) // Clear previous timer

  idleTimeout = setTimeout(
    () => {
      console.log('User idle, logging out...')
      localStorage.removeItem('loggedIn')
      localStorage.removeItem('token')
      localStorage.removeItem('token_expires_at')
      window.location.href = '/login' // Redirect to login
    },
    5 * 60 * 60 * 1000,
  ) // 🔥 Set to 5 minutes (adjust as needed)
}

// Attach event listeners for user activity
const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

events.forEach((event) => window.addEventListener(event, resetIdleTimer))

// Start idle timer on page load
resetIdleTimer()

router.beforeEach((to, from, next) => {
  // Ambil status login dari localStorage
  const loggedIn = localStorage.getItem('loggedIn') === 'true'

  // Cek route apakah butuh login
  const isAuthRoute = to.meta.requiresAuth
  const isLoginPage = to.path === '/login'

  // Kalau route butuh login
  if (isAuthRoute) {
    if (!loggedIn) {
      // Simpan tujuan supaya bisa diarahkan lagi setelah login
      sessionStorage.setItem('redirectAfterLogin', to.fullPath)
      return next('/login')
    }

    resetIdleTimer()
    return next()
  }

  // Kalau user sudah login, cegah akses halaman login
  if (isLoginPage && loggedIn) {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
    sessionStorage.removeItem('redirectAfterLogin')
    return next(redirectPath)
  }

  // Route publik
  next()
})

export default router
