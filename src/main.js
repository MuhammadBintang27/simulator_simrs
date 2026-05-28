import ContentHeader from '@/components/ContentHeader.vue'

import loading_overlay from '@/components/LoadingFormCompnent.vue'

import '@fortawesome/fontawesome-free/css/all.min.css'

import PrimeVue from 'primevue/config'

import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import { useConfigStore } from '@/stores/config'

import { VueReCaptcha } from 'vue-recaptcha-v3'

import { createPinia } from 'pinia'

const pinia = createPinia()

const app = createApp(App)

app.use(pinia)

import ConfirmationService from 'primevue/confirmationservice'
app.use(ConfirmationService)

import Tooltip from 'primevue/tooltip'

app.directive('tooltip', Tooltip)

import { definePreset } from '@primeuix/themes'

import Aura from '@primeuix/themes/nora'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      // 50: '{emerald.50}',
      // 100: '{emerald.100}',
      // 200: '{emerald.200}',
      // 300: '{emerald.300}',
      // 400: '{zinc.400}',
      // 500: '{emerald.500}',
      // 600: '{emerald.600}',
      // 700: '{zinc.700}',
      // 800: '{emerald.800}',
      // 900: '{emerald.900}',
      // 950: '{emerald.950}',

      50: '#f2f8f6', // putih kehijauan sangat lembut
      100: '#ddeee9',
      200: '#bddcd1',
      300: '#96c3b4',
      400: '#6ea896',
      500: '#4f8f7a', // warna utama ala minimalis (#059669 tapi muted)
      600: '#3f7663',
      700: '#345f50',
      800: '#2b4d41',
      900: '#233f36',
      950: '#112320',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        surface: {
          // 0: '#ffffff',
          50: '{amber.50}',
          100: '{amber.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
    },
  },
})

app.use(PrimeVue, {
  Ripple: true,
  theme: {
    preset: MyPreset,
    options: {
      prefix: 'p',
      darkModeSelector: 'false',
      cssLayer: true,
    },
  },
})

// const MyPreset = definePreset(Aura, {
//   semantic: {
//     colorScheme: {
//       light: {
//         surface: {
//           0: '#ffffff',
//           50: '{amber.50}',
//           // 100: '{amber.100}',
//           // 200: '{zinc.200}',
//           // 300: '{zinc.300}',
//           // 400: '{zinc.400}',
//           // 500: '{zinc.500}',
//           // 600: '{amber.600}',
//           // 700: '{zinc.700}',
//           // 800: '{zinc.800}',
//           // 900: '{zinc.900}',
//           // 950: '{amber.950}',
//         },
//       },
//     },
//   },
// })

// app.use(PrimeVue, {
//   Ripple: true,
//   // Default theme configuration
//   theme: {
//     preset: MyPreset,
//     options: {
//       prefix: 'p',
//       darkModeSelector: 'false',
//       cssLayer: true,
//     },
//   },
// })

import ConfirmDialog from 'primevue/confirmdialog'
app.component('ConfirmDialog', ConfirmDialog)

import Button from 'primevue/button'

import Toast from 'primevue/toast'
app.component('Toast', Toast)

import ToastService from 'primevue/toastservice'
app.use(ToastService)

import Menu from 'primevue/menu'
app.component('Menu', Menu)

import Divider from 'primevue/divider'
app.component('Divider', Divider)

// import DatePicker from 'primevue/datepicker'
// app.component('DatePicker', DatePicker)

import Dialog from 'primevue/dialog'
app.component('Dialog', Dialog)

import Avatar from 'primevue/avatar'
app.component('Avatar', Avatar)

import RadioButton from 'primevue/radiobutton'
app.component('RadioButton', RadioButton)

import ColumnGroup from 'primevue/columngroup' // optional
app.component('ColumnGroup', ColumnGroup)
import Row from 'primevue/row'
app.component('Row', Row) // optional

import NavBar from '@/layouts/NavBar.vue'
import Sidebar from '@/layouts/SideBar.vue'

import DataView from 'primevue/dataview'
app.component('DataView', DataView)

import ButtonGroup from 'primevue/buttongroup'
app.component('ButtonGroup', ButtonGroup)

import SelectButton from 'primevue/selectbutton'
app.component('SelectButton', SelectButton)

import Accordion from 'primevue/accordion'
app.component('Accordion', Accordion)
import AccordionPanel from 'primevue/accordionpanel'
app.component('AccordionPanel', AccordionPanel)
import AccordionHeader from 'primevue/accordionheader'
app.component('AccordionHeader', AccordionHeader)
import AccordionContent from 'primevue/accordioncontent'
app.component('AccordionContent', AccordionContent)

import FileUpload from 'primevue/fileupload'
app.component('FileUpload', FileUpload)

import ProgressBar from 'primevue/progressbar'
app.component('ProgressBar', ProgressBar)

import Popover from 'primevue/popover'
app.component('Popover', Popover)

import datepicker from 'vue-datepicker-next'
app.component('date-picker', datepicker)

import 'vue-datepicker-next/index.css'

// import Accordion from 'primevue/accordion'
// app.component('Accordion', Accordion)

// import AccordionPanel from 'primevue/accordionpanel'
// app.component('AccordionPanel', AccordionPanel)

// import AccordionHeader from 'primevue/accordionheader'
// app.component('AccordionHeader', AccordionHeader)

// import AccordionContent from 'primevue/accordioncontent'
// app.component('AccordionContent', AccordionContent)

import Image from 'primevue/image'
app.component('Image', Image)
// import IftaLabel from 'primevue/iftalabel';

import Select from 'primevue/select'
// import Select from 'primevue/dropdown'
app.component('Select', Select)

import InputNumber from 'primevue/inputnumber'
app.component('InputNumber', InputNumber)

import MultiSelect from 'primevue/multiselect'
app.component('MultiSelect', MultiSelect)

import InputGroup from 'primevue/inputgroup'
app.component('InputGroup', InputGroup)

import Message from 'primevue/message'
app.component('Message', Message)

import InputGroupAddon from 'primevue/inputgroupaddon'
app.component('InputGroupAddon', InputGroupAddon)

import DataTable from 'primevue/datatable'
app.component('DataTable', DataTable)

import FloatLabel from 'primevue/floatlabel'
app.component('FloatLabel', FloatLabel)

import Column from 'primevue/column'
app.component('Column', Column)

import InputOtp from 'primevue/inputotp'
app.component('InputOtp', InputOtp)

import InputText from 'primevue/inputtext'
app.component('InputText', InputText)

import Textarea from 'primevue/textarea'
app.component('Textarea', Textarea)

import Checkbox from 'primevue/checkbox'
app.component('Checkbox', Checkbox)

import IconField from 'primevue/iconfield'
app.component('IconField', IconField)

import InputIcon from 'primevue/inputicon'
app.component('InputIcon', InputIcon)

import Password from 'primevue/password'
app.component('Password', Password)

import Card from 'primevue/card'
app.component('Card', Card)

app.component('NavBar', NavBar)
app.component('Sidebar', Sidebar)

app.component('Button', Button)

import Tabs from 'primevue/tabs'
app.component('Tabs', Tabs)

import TabList from 'primevue/tablist'
app.component('TabList', TabList)

import Tab from 'primevue/tab'
app.component('Tab', Tab)

import Ripple from 'primevue/ripple'

app.directive('ripple', Ripple)

import TabPanels from 'primevue/tabpanels'
app.component('TabPanels', TabPanels)

import TabPanel from 'primevue/tabpanel'
app.component('TabPanel', TabPanel)

import Panel from 'primevue/panel'
app.component('Panel', Panel)

import Menubar from 'primevue/menubar'
app.component('Menubar', Menubar)

import Tag from 'primevue/tag'
app.component('Tag', Tag)

import Stepper from 'primevue/stepper'
app.component('Stepper', Stepper)

import StepList from 'primevue/steplist'
app.component('StepList', StepList)

import StepPanels from 'primevue/steppanels'
app.component('StepPanels', StepPanels)

import StepItem from 'primevue/stepitem'
app.component('StepItem', StepItem)

import Step from 'primevue/step'
app.component('Step', Step)

import StepPanel from 'primevue/steppanel'
app.component('StepPanel', StepPanel)

app.component('loading_overlay', loading_overlay)

app.use(router)

app.config.globalProperties.$configStore = useConfigStore()

app.use(axios)

app.mount('#app')
