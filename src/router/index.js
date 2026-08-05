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
const IntraOperasiView = () => import('@/views/RuangOperasi/Anestesi/IntraOperasiView.vue')

// Informed Consent
const AnestesiConsentView = () => import('@/views/RuangOperasi/Consent/AnestesiConsentView.vue')
const TindakanConsentView = () => import('@/views/RuangOperasi/Consent/TindakanConsentView.vue')
const RanapConsentView = () => import('@/views/RuangOperasi/Consent/RanapConsentView.vue')

// Apotik Online
const ReferensiApolView = () => import('@/views/Apol/ReferensiApolView.vue')
const TransaksiResepView = () => import('@/views/Apol/TransaksiResepView.vue')
const MonitoringApolView = () => import('@/views/Apol/MonitoringView.vue')

// Pendaftaran & Laporan
const PendaftaranPasienView = () => import('@/views/Pendaftaran/PendaftaranPasienView.vue')
const RevenueReportView = () => import('@/views/laporan/RevenueReportView.vue')
const DatakunjunganView = () => import('@/views/Statistik/DatakunjunganView.vue')

const KlaimManajemenView = () => import('@/views/keuangan/KlaimManajemenView.vue')
const SEPMonitoringView = () => import('@/views/keuangan/SEPMonitoringView.vue')

const KasirView = () => import('@/views/keuangan/KasirView.vue')

const KasilPrintBill = () => import('@/views/keuangan/KasilPrintBill.vue')

// Sales Langsung (Kasir Apotik)
const SalesKasirView = () => import('@/views/sales/KasirView.vue')
const SalesLaporanPenjualanView = () => import('@/views/sales/LaporanPenjualanView.vue')
const SalesPosSettingView = () => import('@/views/sales/PosSettingView.vue')
const SalesTransaksiLainView = () => import('@/views/sales/TransaksiLainView.vue')
const SalesLabaRugiView = () => import('@/views/sales/LabaRugiView.vue')
const SalesRingkasanKasirView = () => import('@/views/sales/RingkasanKasirView.vue')

const SalesRekapPiutangView = () => import('@/views/sales/RekapPiutangView.vue')
const SalesDetailPiutangView = () => import('@/views/sales/DetailPiutangView.vue')

const FormInputPasienComponent = () => import('@/views/Pendaftaran/FormInputPasienComponent.vue')

const OdontogramComponent = () => import('@/views/Poliklinik/Gigi/OdontogramComponent.vue')

const EditPendaftaranComponent = () => import('@/views/Pendaftaran/EditPendaftaranComponent.vue')

const FormStockOpnameView = () => import('@/views/Persediaan/StockOpname/FormStockOpnameView.vue')
//setting
const JadwalDokterView = () => import('@/views/setting/JadwalDokterView.vue')
const AksesButtonRanapView = () => import('@/views/setting/AksesButtonRanapView.vue')
const JadwalKontrolDokterView = () => import('@/views/Poliklinik/JadwalKontrolDokterView.vue')
const GantiPasswordView = () => import('@/views/setting/GantiPasswordView.vue')
const InformConsentTemplateView = () => import('@/views/setting/InformConsentTemplateView.vue')
const JenisSuratTemplateView = () => import('@/views/setting/JenisSuratTemplateView.vue')

//Laboratorium
const PermintaanLabView = () => import('@/views/Laboratorium/PermintaanLabView.vue')

const ProsesLabView = () => import('@/views/Laboratorium/ProsesLabView.vue')

const PrintOutlabView = () => import('@/views/Laboratorium/PrintOutlabView.vue')

const PrintPengantarView = () => import('@/views/Laboratorium/PrintPengantarView.vue')

const ReturPersediaanView = () => import('@/views/Persediaan/Retur/ReturPersediaanView.vue')

const ReturListReturView = () => import('@/views/Persediaan/Retur/ReturListReturView.vue')

const ReturKedepoView = () => import('@/views/Persediaan/Retur/ReturKedepoView.vue')

const DashboardCostControl = () => import('@/views/Monitoring/DashboardCostControl.vue')

// Penugasan Layanan
const PenugasanLayananDashboard = () => import('@/views/PenugasanLayanan/DashboardView.vue')
const LaporanListView = () => import('@/views/PenugasanLayanan/LaporanListView.vue')
const LaporanDetailView = () => import('@/views/PenugasanLayanan/LaporanDetailView.vue')
const MyTasksView = () => import('@/views/PenugasanLayanan/MyTasksView.vue')
const MyReportsView = () => import('@/views/PenugasanLayanan/MyReportsView.vue')
const StaffTaskDetailView = () => import('@/views/PenugasanLayanan/StaffTaskDetailView.vue')

const ImunisasiView = () => import('@/views/Imunisasi/ImunisasiView.vue')

const EntriImunisasiView = () => import('@/views/Imunisasi/EntriImunisasiView.vue')

const MonitoringRMEBPJS = () => import('@/views/Rme/MonitoringRMEBPJS.vue')
const SirirajView = () => import('@/views/Rme/SirirajView.vue')

const MasterAssetView = () => import('@/views/Asset/MasterAssetView.vue')

const FormIGDView = () => import('@/views/IGD/FormIGDView.vue')
const MonitoringTriaseView = () => import('@/views/IGD/MonitoringTriaseView.vue')
const ListPasienIGDView = () => import('@/views/IGD/ListPasienIGDView.vue')

const TindakLanjutPasienView = () => import('@/views/TindakLanjut/TindakLanjutPasienView.vue')
const ResumeRanapView = () => import('@/views/keuangan/ResumeRanapView.vue')
const ResumeRawatJalanView = () => import('@/views/keuangan/ResumeRawatJalanView.vue')

// Manajemen
const MenuItemsView = () => import('@/views/Manajemen/MenuItemsView.vue')
const AssignMenuView = () => import('@/views/Manajemen/AssignMenuView.vue')
const UserManajemenView = () => import('@/views/Manajemen/UserManajemenView.vue')

// Kajian Awal
const ResikoJatuhView = () => import('@/views/KajianAwal/ResikoJatuhView.vue')

// Rawat Inap
const MonitoringPasienRanapView = () => import('@/views/RawatInap/MonitoringPasienRanapView.vue')
const KajianAwalDPJPView = () => import('@/views/RawatInap/KajianAwalDPJPView.vue')
const CPPTView = () => import('@/views/RawatInap/CPPTView.vue')
const DiagnosaAkhirDPJP = () => import('@/views/RawatInap/DiagnosaAkhirDPJP.vue')
const JawabKonsulView = () => import('@/views/RawatInap/KonsultasiDokter/JawabKonsul.vue')
const KonsultasiFormView = () => import('@/views/RawatInap/KonsultasiDokter/KonsultasiFormView.vue')
const FormTindakanDpjpComponent = () => import('@/views/RawatInap/FormTindakanDpjpComponent.vue')

// Fisioterapi
const HomeFisioterapiView = () => import('@/views/Poliklinik/Fisioteraphi/HomeFisioterapiView.vue')
const ProsesFisioteraphiView = () =>
  import('@/views/Poliklinik/Fisioteraphi/ProsesFisioteraphiView.vue')

// UTD (Unit Transfusi Darah)
const PenerimaanDarahView = () => import('@/views/UTD/PenerimaanDarah.vue')
const SesiDonorView = () => import('@/views/UTD/SesiDonorView.vue')

const PrintOutsesiDonor = () => import('@/views/UTD/PrintOutsesiDonor.vue')

// Rekam Medis Elektronik - Viewer & KCO
const RMEViewer = () => import('@/views/RekamMedis/RMEVIewer.vue')
const KartuCatatanObatView = () => import('@/views/RekamMedis/KartuCatatanObatView.vue')

// Persalinan
const PartografView = () => import('@/views/Persalinan/PartografView.vue')

// Inventory - Supplier
const SupplierListView = () => import('@/views/inventory/Supplier/SupplierListView.vue')
const SupplierFormView = () => import('@/views/inventory/Supplier/SupplierFormView.vue')

// Inventory - Master Barang (form as modal, 3 separate list views)
const ObatListView = () => import('@/views/inventory/barang/ObatListView.vue')
const AtkListView = () => import('@/views/inventory/barang/AtkListView.vue')
const JasaListView = () => import('@/views/inventory/barang/JasaListView.vue')

// Pemesanan
const PemesananListView = () => import('@/views/pemesanan/PemesananListView.vue')
const PemesananFormPage = () => import('@/views/pemesanan/PemesananCreateView.vue')
const PemesananEditView = () => import('@/views/pemesanan/PemesananEditView.vue')
const PrintSuratPesananView = () => import('@/views/pemesanan/PrintSuratPesananView.vue')

// Sales Langsung — struk penjualan & tutup shift (standalone, tab baru, satu file untuk keduanya)
const PrintStrukView = () => import('@/views/sales/PrintStrukView.vue')

// Penerimaan
const PenerimaanListView = () => import('@/views/penerimaan/PenerimaanListView.vue')
const PenerimaanFormView = () => import('@/views/penerimaan/PenerimaanFormView.vue')
const PenerimaanTanpaSPView = () => import('@/views/penerimaan/PenerimaanTanpaSPView.vue')
const RekapSupplierView = () => import('@/views/penerimaan/RekapSupplierView.vue')
const RekapSupplierDetailView = () => import('@/views/penerimaan/RekapSupplierDetailView.vue')
const RekapBarangView = () => import('@/views/penerimaan/RekapBarangView.vue')
const RekapBarangDetailView = () => import('@/views/penerimaan/RekapBarangDetailView.vue')
const RekapHutangView = () => import('@/views/penerimaan/RekapHutangView.vue')
const BayarHutangView = () => import('@/views/penerimaan/BayarHutangView.vue')

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
      path: '/utd/print',
      name: 'PrintOutsesiDonor',
      component: PrintOutsesiDonor,
    },
    {
      // Rekam Medis Elektronik — Standalone viewer (tanpa MainLayouts)
      // Akses: /rekam-medis/viewer?noreg=xxxxx
      path: '/rekam-medis/viewer',
      name: 'RMEViewer',
      component: RMEViewer,
    },
    {
      // Kartu Catatan Obat — Landscape A4 print
      // Akses: /rekam-medis/kartu-obat?noreg=xxx&nama=xxx&ruangan=xxx
      path: '/rekam-medis/kartu-obat',
      name: 'KartuCatatanObatView',
      component: KartuCatatanObatView,
    },
    {
      path: '/keuangan/print-bill/:norm/:noreg',
      name: 'KasilPrintBill',
      component: KasilPrintBill,
    },
    {
      path: '/pemesanan/print-sp/:id_pemesanan',
      name: 'PrintSuratPesanan',
      component: PrintSuratPesananView,
    },
    {
      // Struk penjualan & tutup shift Kasir POS — satu view untuk keduanya (bedanya lewat payload.type).
      path: '/sales/print-struk',
      name: 'PrintStruk',
      component: PrintStrukView,
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
          path: 'keuangan/sep-monitoring',
          name: 'SEPMonitoringView',
          meta: { requiresAuth: true },
          component: SEPMonitoringView,
        },
        {
          path: 'keuangan/kasir',
          name: 'KasirView',
          meta: { requiresAuth: true }, // ✅ Protect this route
          component: KasirView,
        },
        // Sales Langsung (Kasir Apotik)
        {
          path: 'sales/pos',
          name: 'SalesKasirView',
          meta: { requiresAuth: true },
          component: SalesKasirView,
        },
        {
          path: 'sales/laporan',
          name: 'SalesLaporanPenjualanView',
          meta: { requiresAuth: true },
          component: SalesLaporanPenjualanView,
        },
        {
          path: 'sales/pengaturan',
          name: 'SalesPosSettingView',
          meta: { requiresAuth: true },
          component: SalesPosSettingView,
        },
        {
          path: 'sales/transaksi-lain',
          name: 'SalesTransaksiLainView',
          meta: { requiresAuth: true },
          component: SalesTransaksiLainView,
        },
        {
          path: 'sales/laba-rugi',
          name: 'SalesLabaRugiView',
          meta: { requiresAuth: true },
          component: SalesLabaRugiView,
        },
        {
          path: 'sales/ringkasan',
          name: 'SalesRingkasanKasirView',
          meta: { requiresAuth: true },
          component: SalesRingkasanKasirView,
        },
        {
          path: 'sales/rekap-piutang',
          name: 'RekapPiutang',
          meta: { requiresAuth: true },
          component: SalesRekapPiutangView,
        },
        {
          path: 'sales/rekap-piutang/detail',
          name: 'DetailPiutang',
          meta: { requiresAuth: true },
          component: SalesDetailPiutangView,
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
          path: 'operasi/persiapan-operasi',
          name: 'PersiapanOperasiVIew',
          meta: { requiresAuth: true },
          component: PersiapanOperasiVIew,
        },
        {
          path: 'operasi/intra-operasi',
          name: 'IntraOperasiView',
          meta: { requiresAuth: true },
          component: IntraOperasiView,
        },
        {
          path: 'operasi/consent/anestesi/:noreg/:kodebooking?',
          name: 'AnestesiConsentView',
          meta: { requiresAuth: true },
          component: AnestesiConsentView,
        },
        {
          path: 'operasi/consent/tindakan/:noreg/:kodebooking?',
          name: 'TindakanConsentView',
          meta: { requiresAuth: true },
          component: TindakanConsentView,
        },
        {
          path: 'operasi/consent/ranap/:noreg/:kodebooking?',
          name: 'RanapConsentView',
          meta: { requiresAuth: true },
          component: RanapConsentView,
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
          path: 'setting/akses-button-ranap',
          name: 'AksesButtonRanapView',
          meta: { requiresAuth: true },
          component: AksesButtonRanapView,
        },
        {
          path: 'poliklinik/jadwal-kontrol-dokter',
          name: 'JadwalKontrolDokterView',
          meta: { redirectPath: true },
          component: JadwalKontrolDokterView,
        },
        {
          path: 'setting/ganti-password',
          name: 'GantiPasswordView',
          meta: { requiresAuth: true },
          component: GantiPasswordView,
        },
        {
          path: 'setting/template-inform-consent',
          name: 'InformConsentTemplateView',
          meta: { redirectPath: true },
          component: InformConsentTemplateView,
        },
        {
          path: 'setting/jenis-surat',
          name: 'JenisSuratTemplateView',
          meta: { requiresAuth: true },
          component: JenisSuratTemplateView,
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
        // Penugasan Layanan Routes
        {
          path: 'penugasan-layanan',
          name: 'PenugasanLayananDashboard',
          meta: { requiresAuth: true },
          component: PenugasanLayananDashboard,
        },
        {
          path: 'penugasan-layanan/laporan',
          name: 'LaporanListView',
          meta: { requiresAuth: true },
          component: LaporanListView,
        },
        {
          path: 'penugasan-layanan/laporan/:id',
          name: 'LaporanDetailView',
          meta: { requiresAuth: true },
          component: LaporanDetailView,
        },
        {
          path: 'penugasan-layanan/tugas-saya',
          name: 'MyTasksView',
          meta: { requiresAuth: true },
          component: MyTasksView,
        },
        {
          path: 'penugasan-layanan/tugas-saya/:reportId/:staffAssignmentId',
          name: 'StaffTaskDetailView',
          meta: { requiresAuth: true },
          component: StaffTaskDetailView,
        },
        {
          path: 'penugasan-layanan/laporan-saya',
          name: 'MyReportsView',
          meta: { requiresAuth: true },
          component: MyReportsView,
        },
        {
          path: 'imunisasi/imunisasi-view',
          name: 'ImunisasiView',
          meta: { requiresAuth: true },
          component: ImunisasiView,
        },
        {
          path: 'imunisasi/entri-imunisasi/:id',
          name: 'EntriImunisasiView',
          meta: { requiresAuth: true },
          component: EntriImunisasiView,
        },
        {
          path: 'monitoring/rme-bpjs',
          name: 'MonitoringRMEBPJS',
          meta: { requiresAuth: true },
          component: MonitoringRMEBPJS,
        },
        {
          path: 'rme/siriraj-score/:noreg',
          name: 'SirirajView',
          meta: { requiresAuth: true },
          component: SirirajView,
        },
        {
          path: 'asset/master-asset',
          name: 'MasterAssetView',
          meta: { requiresAuth: true },
          component: MasterAssetView,
        },
        {
          path: 'igd/form-igd/:noregister',
          name: 'FormIGDView',
          meta: { requiresAuth: true },
          component: FormIGDView,
        },
        {
          path: 'igd/monitoring-triase',
          name: 'MonitoringTriaseView',
          meta: { requiresAuth: true },
          component: MonitoringTriaseView,
        },
        {
          path: 'igd/list-pasien',
          name: 'ListPasienIGDView',
          meta: { requiresAuth: true },
          component: ListPasienIGDView,
        },
        {
          path: 'tindak-lanjut/pemindahan-pasien',
          name: 'TindakLanjutPasienView',
          meta: { requiresAuth: true },
          component: TindakLanjutPasienView,
        },
        {
          path: 'tindak-lanjut/rujuk-rawat-inap',
          name: 'HomeProsesPasienView',
          meta: { requiresAuth: true },
          component: () => import('@/views/Poliklinik/TindakLanjutPasien/HomeProsesPasienView.vue'),
        },
        {
          path: 'keuangan/resume-ranap',
          name: 'ResumeRanapView',
          meta: { requiresAuth: true },
          component: ResumeRanapView,
        },
        {
          path: 'keuangan/resume-rajal',
          name: 'ResumeRawatJalanView',
          meta: { requiresAuth: true },
          component: ResumeRawatJalanView,
        },
        {
          path: 'kajian-awal/resiko-jatuh/:noregister',
          name: 'ResikoJatuhView',
          meta: { requiresAuth: true },
          component: ResikoJatuhView,
        },
        {
          path: 'rawat-inap/monitoring-pasien',
          name: 'MonitoringPasienRanapView',
          meta: { requiresAuth: true },
          component: MonitoringPasienRanapView,
        },
        {
          path: 'rawat-inap/kajian-awal-dpjp/:noregister',
          name: 'KajianAwalDPJPView',
          meta: { requiresAuth: true },
          component: KajianAwalDPJPView,
        },
        {
          path: 'rawat-inap/cppt/:noregister',
          name: 'CPPTView',
          meta: { requiresAuth: true },
          component: CPPTView,
        },
        {
          path: 'rawat-inap/jawab-konsul',
          name: 'JawabKonsulView',
          meta: { requiresAuth: true },
          component: JawabKonsulView,
        },
        {
          path: 'rawat-inap/form-konsultasi',
          name: 'KonsultasiFormView',
          meta: { requiresAuth: true },
          component: KonsultasiFormView,
        },
        {
          path: 'rawat-inap/diagnosa-akhir-dpjp/:noregister',
          name: 'DiagnosaAkhirDPJP',
          meta: { requiresAuth: true },
          component: DiagnosaAkhirDPJP,
        },
        {
          path: 'rawat-inap/form-tindakan-dpjp/:noregister',
          name: 'FormTindakanDpjpComponent',
          meta: { requiresAuth: true },
          component: FormTindakanDpjpComponent,
        },
        {
          path: 'fisioterapi/home',
          name: 'HomeFisioterapiView',
          meta: { requiresAuth: true },
          component: HomeFisioterapiView,
        },
        {
          path: 'fisioterapi/proses/:noreg',
          name: 'ProsesFisioterapiView',
          meta: { requiresAuth: true },
          component: ProsesFisioteraphiView,
        },

        // Persalinan
        {
          path: 'persalinan/partograf',
          name: 'PartografView',
          meta: { requiresAuth: true },
          component: PartografView,
        },

        // Manajemen
        {
          path: 'manajemen/menu-items',
          name: 'MenuItemsView',
          meta: { requiresAuth: true },
          component: MenuItemsView,
        },
        {
          path: 'manajemen/assign-menu',
          name: 'AssignMenuView',
          meta: { requiresAuth: true },
          component: AssignMenuView,
        },
        {
          path: 'manajemen/user-management',
          name: 'UserManajemenView',
          meta: { requiresAuth: true },
          component: UserManajemenView,
        },

        // Inventory / Sales
        {
          path: 'inventory/list-resep',
          name: 'ListResepSalesView',
          meta: { requiresAuth: true },
          component: () => import('@/views/inventory/Sales/LIstResepView.vue'),
        },
        {
          path: 'inventory/proses-resep/:trans',
          name: 'ProsesResepView',
          meta: { requiresAuth: true },
          component: () => import('@/views/inventory/Sales/ProsesResepView.vue'),
        },
        {
          path: 'inventory/cetak-resep/:trans',
          name: 'CetakResepView',
          meta: { requiresAuth: true },
          component: () => import('@/views/inventory/Sales/CetakResepView.vue'),
        },
        {
          path: 'inventory/cetak-etiket/:trans',
          name: 'CetakEtiketView',
          meta: { requiresAuth: true },
          component: () => import('@/views/inventory/Sales/CetakEtiketView.vue'),
        },

        // UTD
        {
          path: 'utd/penerimaan-darah',
          name: 'PenerimaanDarahView',
          meta: { requiresAuth: true },
          component: PenerimaanDarahView,
        },
        {
          path: 'utd/sesi-donor',
          name: 'SesiDonorView',
          meta: { requiresAuth: true },
          component: SesiDonorView,
        },
        {
          path: 'supplier/list',
          name: 'SupplierListView',
          meta: { requiresAuth: true },
          component: SupplierListView,
        },
        {
          path: 'supplier/form',
          name: 'SupplierFormView',
          meta: { requiresAuth: true },
          component: SupplierFormView,
        },
        {
          path: 'supplier/form/:id',
          name: 'SupplierFormViewEdit',
          meta: { requiresAuth: true },
          component: SupplierFormView,
        },
        // Inventory - Obat & BMHP
        {
          path: 'inventory/obat/list',
          name: 'BarangObatListView',
          meta: { requiresAuth: true },
          component: ObatListView,
        },

        // Inventory - ATK
        {
          path: 'inventory/atk/list',
          name: 'BarangAtkListView',
          meta: { requiresAuth: true },
          component: AtkListView,
        },

        // Inventory - Jasa & Tindakan
        {
          path: 'inventory/jasa/list',
          name: 'BarangJasaListView',
          meta: { requiresAuth: true },
          component: JasaListView,
        },

        // Pemesanan
        {
          path: 'pemesanan/surat-pesanan',
          name: 'PemesananListView',
          meta: { requiresAuth: true },
          component: PemesananListView,
        },
        {
          path: 'pemesanan/buat-sp',
          name: 'PemesananBuatSP',
          meta: { requiresAuth: true },
          component: PemesananFormPage,
        },
        {
          path: 'pemesanan/sp/:id_pemesanan',
          name: 'PemesananDetailSP',
          meta: { requiresAuth: true },
          component: PemesananEditView,
        },

        // Penerimaan
        {
          path: 'penerimaan/list',
          name: 'PenerimaanList',
          meta: { requiresAuth: true },
          component: PenerimaanListView,
        },
        {
          path: 'penerimaan/form/:id_pemesanan',
          name: 'PenerimaanForm',
          meta: { requiresAuth: true },
          component: PenerimaanFormView,
        },
        {
          path: 'penerimaan/tanpa-sp',
          name: 'PenerimaanTanpaSP',
          meta: { requiresAuth: true },
          component: PenerimaanTanpaSPView,
        },
        {
          path: 'penerimaan/rekap-supplier',
          name: 'RekapSupplier',
          meta: { requiresAuth: true },
          component: RekapSupplierView,
        },
        {
          path: 'penerimaan/rekap-supplier/detail',
          name: 'RekapSupplierDetail',
          meta: { requiresAuth: true },
          component: RekapSupplierDetailView,
        },
        {
          path: 'penerimaan/rekap-barang',
          name: 'RekapBarang',
          meta: { requiresAuth: true },
          component: RekapBarangView,
        },
        {
          path: 'penerimaan/rekap-barang/detail',
          name: 'RekapBarangDetail',
          meta: { requiresAuth: true },
          component: RekapBarangDetailView,
        },
        {
          path: 'penerimaan/rekap-hutang',
          name: 'RekapHutang',
          meta: { requiresAuth: true },
          component: RekapHutangView,
        },
        {
          path: 'penerimaan/rekap-hutang/bayar',
          name: 'BayarHutang',
          meta: { requiresAuth: true },
          component: BayarHutangView,
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true'
  const isAuthRoute = to.meta.requiresAuth
  const isLoginPage = to.path === '/login'

  if (isAuthRoute) {
    if (!loggedIn) {
      sessionStorage.setItem('redirectAfterLogin', to.fullPath)
      return next('/login')
    }
    return next()
  }

  if (isLoginPage && loggedIn) {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'
    sessionStorage.removeItem('redirectAfterLogin')
    return next(redirectPath)
  }

  next()
})

export default router
