<template>
  <div class="content">
    <!-- Hero -->
    <div class="hero-section">
      <div class="hero-left">
        <div class="hero-icon-wrap"><i class="fas fa-bars"></i></div>
        <div>
          <h1 class="hero-title">Manajemen Menu</h1>
          <p class="hero-desc">Kelola struktur navigasi aplikasi secara dinamis</p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <span class="stat-num">{{ listData.length }}</span>
          <span class="stat-lbl">Total Item</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ menuTree.length }}</span>
          <span class="stat-lbl">Menu Utama</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">{{ listData.length - menuTree.length }}</span>
          <span class="stat-lbl">Sub Menu</span>
        </div>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- ─── LEFT: Tree Panel ─── -->
      <div class="tree-panel">
        <div class="tree-panel-header">
          <span class="tree-panel-title"><i class="fas fa-sitemap"></i> Struktur Menu</span>
          <Button
            icon="pi pi-plus"
            label="Menu Utama"
            size="small"
            class="btn-add-root"
            @click="openCreateParent"
          />
        </div>

        <div v-if="loading" class="tree-loading">
          <i class="pi pi-spin pi-spinner"></i> Memuat data...
        </div>

        <div v-else-if="menuTree.length === 0" class="tree-empty">
          <i class="pi pi-inbox"></i>
          <p>Belum ada menu. Klik "+ Menu Utama" untuk mulai.</p>
        </div>

        <div v-else class="tree-list">
          <div v-for="parent in menuTree" :key="parent.menu_id" class="tree-node">
            <!-- Parent Row -->
            <div
              class="tree-parent"
              :class="{ 'tree-parent--active': activeId === parent.id }"
              @click="handleParentClick(parent)"
            >
              <button class="expand-btn" @click.stop="toggleExpand(parent.menu_id)">
                <i
                  :class="
                    expandedSet.has(parent.menu_id) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'
                  "
                ></i>
              </button>
              <span class="node-icon">
                <i v-if="parent.icon" :class="parent.icon"></i>
                <i v-else class="fas fa-circle" style="font-size: 6px; color: #ccc"></i>
              </span>
              <span class="node-title">{{ parent.title }}</span>
              <span v-if="parent.children.length" class="child-count">{{
                parent.children.length
              }}</span>
              <div class="node-actions" @click.stop>
                <button class="action-btn action-btn--edit" @click="openEdit(parent)" title="Edit">
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  class="action-btn action-btn--delete"
                  @click="confirmDelete(parent)"
                  title="Hapus"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>

            <!-- Children -->
            <Transition name="slide-down">
              <div v-if="expandedSet.has(parent.menu_id)" class="tree-children">
                <div
                  v-for="child in parent.children"
                  :key="child.menu_id"
                  class="tree-child"
                  :class="{ 'tree-child--active': activeId === child.id }"
                  @click="openEdit(child)"
                >
                  <span class="child-line"></span>
                  <span class="node-icon node-icon--sm">
                    <i v-if="child.icon" :class="child.icon"></i>
                    <i v-else class="fas fa-minus" style="font-size: 8px; color: #ccc"></i>
                  </span>
                  <div class="child-info">
                    <span class="node-title node-title--child">{{ child.title }}</span>
                    <code v-if="child.path" class="child-path">{{ child.path }}</code>
                  </div>
                  <div class="node-actions" @click.stop>
                    <button
                      class="action-btn action-btn--edit"
                      @click="openEdit(child)"
                      title="Edit"
                    >
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button
                      class="action-btn action-btn--delete"
                      @click="confirmDelete(child)"
                      title="Hapus"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Add Sub Menu button -->
                <button class="add-child-btn" @click="openCreateChild(parent)">
                  <i class="pi pi-plus"></i> Tambah Sub Menu
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- ─── RIGHT: Form Panel ─── -->
      <Transition name="slide-right">
        <div v-if="showForm" class="form-panel">
          <div class="form-panel-header">
            <div class="form-panel-title-wrap">
              <span class="form-panel-badge" :class="formBadgeClass">
                {{
                  formMode === 'edit'
                    ? 'EDIT'
                    : formMode === 'create-child'
                      ? 'SUB MENU'
                      : 'MENU UTAMA'
                }}
              </span>
              <h2 class="form-panel-title">{{ formTitle }}</h2>
            </div>
            <button class="form-close-btn" @click="closeForm">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Parent context (when adding child) -->
          <div v-if="formMode === 'create-child' && selectedParentForChild" class="parent-context">
            <i class="fas fa-level-up-alt"></i>
            Sub menu dari:
            <span class="parent-context-name">
              <i v-if="selectedParentForChild.icon" :class="selectedParentForChild.icon"></i>
              {{ selectedParentForChild.title }}
            </span>
          </div>
          <div class="form-body">
            <!-- Menu ID -->
            <div class="field">
              <label class="field-label">Menu ID <span class="req">*</span></label>
              <InputText
                v-model="form.menu_id"
                placeholder="Contoh: pendaftaran, poliklinik"
                class="w-full"
                :class="{ 'p-invalid': errors.menu_id }"
                :disabled="formMode === 'edit'"
              />
              <small v-if="errors.menu_id" class="p-error">{{ errors.menu_id }}</small>
              <small v-if="formMode === 'edit'" class="field-hint"
                >Menu ID tidak dapat diubah setelah disimpan</small
              >
            </div>
            <!-- Parent ID (show jika bukan create-parent) -->
            <div class="field" v-if="formMode !== 'create-parent'">
              <label class="field-label">Parent Menu <span class="req">*</span></label>
              <Select
                v-model="form.parent_id"
                :options="parentOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih menu utama"
                class="w-full"
                :class="{ 'p-invalid': errors.parent_id }"
                :disabled="formMode === 'create-child'"
              />
              <small v-if="errors.parent_id" class="p-error">{{ errors.parent_id }}</small>
            </div>

            <!-- Title -->
            <div class="field">
              <label class="field-label">Nama / Title <span class="req">*</span></label>
              <InputText
                v-model="form.title"
                placeholder="Nama tampilan menu"
                class="w-full"
                :class="{ 'p-invalid': errors.title }"
              />
              <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
            </div>

            <!-- Path -->
            <div class="field">
              <label class="field-label">Path / URL</label>
              <InputText
                v-model="form.path"
                placeholder="Contoh: /pendaftaran atau /poli/pemeriksaan"
                class="w-full"
              />
              <small class="field-hint"
                >Kosongkan jika menu ini hanya sebagai grup (tidak punya halaman)</small
              >
            </div>

            <!-- Icon Picker -->
            <div class="field">
              <label class="field-label">Icon</label>
              <div class="icon-picker-wrap" ref="iconPickerRef">
                <div class="icon-trigger" @click="toggleIconPicker">
                  <span class="icon-trigger-preview">
                    <i v-if="form.icon" :class="form.icon"></i>
                    <i v-else class="pi pi-image" style="color: #ccc"></i>
                  </span>
                  <span class="icon-trigger-text">{{ form.icon || 'Pilih ikon...' }}</span>
                  <i
                    class="pi pi-chevron-down icon-trigger-arrow"
                    :class="{ rotate: showIconPicker }"
                  ></i>
                </div>

                <Transition name="fade-down">
                  <div v-if="showIconPicker" class="icon-dropdown">
                    <div class="icon-search-wrap">
                      <i class="pi pi-search"></i>
                      <input
                        v-model="iconSearch"
                        ref="iconSearchInput"
                        placeholder="Cari ikon..."
                        class="icon-search-input"
                        @click.stop
                      />
                      <button
                        v-if="iconSearch"
                        class="icon-search-clear"
                        @click.stop="iconSearch = ''"
                      >
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                    <div class="icon-categories">
                      <button
                        v-for="cat in iconCategories"
                        :key="cat.key"
                        class="cat-btn"
                        :class="{ 'cat-btn--active': activeCategory === cat.key }"
                        @click.stop="activeCategory = cat.key"
                      >
                        {{ cat.label }}
                      </button>
                    </div>
                    <div class="icon-grid">
                      <button
                        v-for="ico in filteredIcons"
                        :key="ico.class"
                        class="icon-item"
                        :class="{ 'icon-item--active': form.icon === ico.class }"
                        :title="ico.name"
                        @click.stop="selectIcon(ico.class)"
                      >
                        <i :class="ico.class"></i>
                        <span>{{ ico.name }}</span>
                      </button>
                    </div>
                    <div v-if="filteredIcons.length === 0" class="icon-empty">
                      Ikon tidak ditemukan
                    </div>
                    <div class="icon-dropdown-footer">
                      <button class="icon-clear-btn" @click.stop="selectIcon('')">
                        <i class="pi pi-times"></i> Hapus Ikon
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Sort Order -->
            <div class="field field--half">
              <label class="field-label">Sort Order <span class="req">*</span></label>
              <InputNumber
                v-model="form.sort_order"
                :min="0"
                :max="9999"
                showButtons
                class="w-full"
                :class="{ 'p-invalid': errors.sort_order }"
              />
              <small v-if="errors.sort_order" class="p-error">{{ errors.sort_order }}</small>
            </div>
          </div>

          <div class="form-footer">
            <Button
              label="Batal"
              icon="pi pi-times"
              class="p-button-text"
              @click="closeForm"
              :disabled="saving"
            />
            <Button
              :label="saving ? 'Menyimpan...' : 'Simpan'"
              :icon="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
              class="p-button-success"
              @click="submitForm"
              :loading="saving"
            />
          </div>
        </div>
      </Transition>

      <!-- Placeholder when form not shown -->
      <div v-if="!showForm" class="form-placeholder">
        <i class="fas fa-hand-pointer"></i>
        <p>
          Pilih menu untuk diedit, atau klik tombol<br /><strong>"+ Menu Utama"</strong> /
          <strong>"Tambah Sub Menu"</strong>
        </p>
      </div>
    </div>

    <!-- Overlay untuk tutup icon picker -->
    <div v-if="showIconPicker" class="icon-overlay" @click="showIconPicker = false"></div>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'

import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import { id } from 'date-fns/locale'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

// ── State ──────────────────────────────────────────
const loading = ref(false)
const saving = ref(false)
const listData = ref([])

const expandedSet = ref(new Set())
const activeId = ref(null)
const showForm = ref(false)
const formMode = ref('') // 'create-parent' | 'create-child' | 'edit'
const editId = ref(null)
const selectedParentForChild = ref(null)

const showIconPicker = ref(false)
const iconSearch = ref('')
const activeCategory = ref('semua')
const iconSearchInput = ref(null)
const iconPickerRef = ref(null)

const defaultForm = () => ({
  menu_id: '',
  parent_id: '',
  title: '',
  path: '',
  icon: '',
  sort_order: 0,
})
const form = ref(defaultForm())
const errors = ref({})

// ── Icon List ──────────────────────────────────────
const iconCategories = [
  { key: 'semua', label: 'Semua' },
  { key: 'nav', label: 'Navigasi' },
  { key: 'medis', label: 'Medis' },
  { key: 'orang', label: 'Orang' },
  { key: 'keuangan', label: 'Keuangan' },
  { key: 'dokumen', label: 'Dokumen' },
  { key: 'setting', label: 'Setting' },
  { key: 'prime', label: 'PrimeIcon' },
]

const ALL_ICONS = [
  // Navigasi
  { name: 'home', class: 'fas fa-home', cat: 'nav' },
  { name: 'bars', class: 'fas fa-bars', cat: 'nav' },
  { name: 'th-large', class: 'fas fa-th-large', cat: 'nav' },
  { name: 'th-list', class: 'fas fa-th-list', cat: 'nav' },
  { name: 'list', class: 'fas fa-list', cat: 'nav' },
  { name: 'sitemap', class: 'fas fa-sitemap', cat: 'nav' },
  { name: 'project-diagram', class: 'fas fa-project-diagram', cat: 'nav' },
  { name: 'layer-group', class: 'fas fa-layer-group', cat: 'nav' },
  { name: 'grip-h', class: 'fas fa-grip-horizontal', cat: 'nav' },
  { name: 'grip-v', class: 'fas fa-grip-vertical', cat: 'nav' },
  { name: 'indent', class: 'fas fa-indent', cat: 'nav' },
  { name: 'arrow-right', class: 'fas fa-arrow-right', cat: 'nav' },
  { name: 'arrow-left', class: 'fas fa-arrow-left', cat: 'nav' },
  { name: 'angle-right', class: 'fas fa-angle-right', cat: 'nav' },
  { name: 'angle-double-right', class: 'fas fa-angle-double-right', cat: 'nav' },
  { name: 'dashboard', class: 'fas fa-tachometer-alt', cat: 'nav' },
  { name: 'compass', class: 'fas fa-compass', cat: 'nav' },
  { name: 'map', class: 'fas fa-map', cat: 'nav' },
  { name: 'map-marker', class: 'fas fa-map-marker-alt', cat: 'nav' },
  { name: 'link', class: 'fas fa-link', cat: 'nav' },
  { name: 'globe', class: 'fas fa-globe', cat: 'nav' },
  { name: 'stream', class: 'fas fa-stream', cat: 'nav' },
  { name: 'network', class: 'fas fa-network-wired', cat: 'nav' },

  // Medis
  { name: 'hospital', class: 'fas fa-hospital', cat: 'medis' },
  { name: 'hospital-alt', class: 'fas fa-hospital-alt', cat: 'medis' },
  { name: 'stethoscope', class: 'fas fa-stethoscope', cat: 'medis' },
  { name: 'heartbeat', class: 'fas fa-heartbeat', cat: 'medis' },
  { name: 'heart', class: 'fas fa-heart', cat: 'medis' },
  { name: 'pills', class: 'fas fa-pills', cat: 'medis' },
  { name: 'syringe', class: 'fas fa-syringe', cat: 'medis' },
  { name: 'procedures', class: 'fas fa-procedures', cat: 'medis' },
  { name: 'user-md', class: 'fas fa-user-md', cat: 'medis' },
  { name: 'user-nurse', class: 'fas fa-user-nurse', cat: 'medis' },
  { name: 'ambulance', class: 'fas fa-ambulance', cat: 'medis' },
  { name: 'wheelchair', class: 'fas fa-wheelchair', cat: 'medis' },
  { name: 'file-medical', class: 'fas fa-file-medical', cat: 'medis' },
  { name: 'notes-medical', class: 'fas fa-notes-medical', cat: 'medis' },
  { name: 'prescription', class: 'fas fa-prescription-bottle-alt', cat: 'medis' },
  { name: 'thermometer', class: 'fas fa-thermometer-half', cat: 'medis' },
  { name: 'tooth', class: 'fas fa-tooth', cat: 'medis' },
  { name: 'brain', class: 'fas fa-brain', cat: 'medis' },
  { name: 'lungs', class: 'fas fa-lungs', cat: 'medis' },
  { name: 'band-aid', class: 'fas fa-band-aid', cat: 'medis' },
  { name: 'cross', class: 'fas fa-cross', cat: 'medis' },
  { name: 'first-aid', class: 'fas fa-first-aid', cat: 'medis' },
  { name: 'dna', class: 'fas fa-dna', cat: 'medis' },
  { name: 'microscope', class: 'fas fa-microscope', cat: 'medis' },
  { name: 'vials', class: 'fas fa-vials', cat: 'medis' },
  { name: 'flask', class: 'fas fa-flask', cat: 'medis' },
  { name: 'virus', class: 'fas fa-virus', cat: 'medis' },
  { name: 'radiation', class: 'fas fa-radiation-alt', cat: 'medis' },
  { name: 'eye-dropper', class: 'fas fa-eye-dropper', cat: 'medis' },
  { name: 'medkit', class: 'fas fa-medkit', cat: 'medis' },
  { name: 'bed', class: 'fas fa-bed', cat: 'medis' },
  { name: 'baby', class: 'fas fa-baby', cat: 'medis' },

  // Orang
  { name: 'user', class: 'fas fa-user', cat: 'orang' },
  { name: 'users', class: 'fas fa-users', cat: 'orang' },
  { name: 'user-circle', class: 'fas fa-user-circle', cat: 'orang' },
  { name: 'user-plus', class: 'fas fa-user-plus', cat: 'orang' },
  { name: 'user-minus', class: 'fas fa-user-minus', cat: 'orang' },
  { name: 'user-cog', class: 'fas fa-user-cog', cat: 'orang' },
  { name: 'user-check', class: 'fas fa-user-check', cat: 'orang' },
  { name: 'user-lock', class: 'fas fa-user-lock', cat: 'orang' },
  { name: 'users-cog', class: 'fas fa-users-cog', cat: 'orang' },
  { name: 'id-card', class: 'fas fa-id-card', cat: 'orang' },
  { name: 'id-badge', class: 'fas fa-id-badge', cat: 'orang' },
  { name: 'address-card', class: 'fas fa-address-card', cat: 'orang' },
  { name: 'child', class: 'fas fa-child', cat: 'orang' },
  { name: 'male', class: 'fas fa-male', cat: 'orang' },
  { name: 'female', class: 'fas fa-female', cat: 'orang' },
  { name: 'person-booth', class: 'fas fa-person-booth', cat: 'orang' },

  // Keuangan
  { name: 'money-bill', class: 'fas fa-money-bill-wave', cat: 'keuangan' },
  { name: 'coins', class: 'fas fa-coins', cat: 'keuangan' },
  { name: 'credit-card', class: 'fas fa-credit-card', cat: 'keuangan' },
  { name: 'invoice', class: 'fas fa-file-invoice-dollar', cat: 'keuangan' },
  { name: 'cash-register', class: 'fas fa-cash-register', cat: 'keuangan' },
  { name: 'wallet', class: 'fas fa-wallet', cat: 'keuangan' },
  { name: 'receipt', class: 'fas fa-receipt', cat: 'keuangan' },
  { name: 'chart-line', class: 'fas fa-chart-line', cat: 'keuangan' },
  { name: 'chart-bar', class: 'fas fa-chart-bar', cat: 'keuangan' },
  { name: 'chart-pie', class: 'fas fa-chart-pie', cat: 'keuangan' },
  { name: 'chart-area', class: 'fas fa-chart-area', cat: 'keuangan' },
  { name: 'dollar', class: 'fas fa-dollar-sign', cat: 'keuangan' },
  { name: 'percent', class: 'fas fa-percentage', cat: 'keuangan' },
  { name: 'hand-holding-usd', class: 'fas fa-hand-holding-usd', cat: 'keuangan' },
  { name: 'piggy-bank', class: 'fas fa-piggy-bank', cat: 'keuangan' },

  // Dokumen
  { name: 'file', class: 'fas fa-file', cat: 'dokumen' },
  { name: 'file-alt', class: 'fas fa-file-alt', cat: 'dokumen' },
  { name: 'file-pdf', class: 'fas fa-file-pdf', cat: 'dokumen' },
  { name: 'file-excel', class: 'fas fa-file-excel', cat: 'dokumen' },
  { name: 'file-csv', class: 'fas fa-file-csv', cat: 'dokumen' },
  { name: 'file-word', class: 'fas fa-file-word', cat: 'dokumen' },
  { name: 'folder', class: 'fas fa-folder', cat: 'dokumen' },
  { name: 'folder-open', class: 'fas fa-folder-open', cat: 'dokumen' },
  { name: 'clipboard-list', class: 'fas fa-clipboard-list', cat: 'dokumen' },
  { name: 'clipboard-check', class: 'fas fa-clipboard-check', cat: 'dokumen' },
  { name: 'copy', class: 'fas fa-copy', cat: 'dokumen' },
  { name: 'print', class: 'fas fa-print', cat: 'dokumen' },
  { name: 'archive', class: 'fas fa-archive', cat: 'dokumen' },
  { name: 'table', class: 'fas fa-table', cat: 'dokumen' },
  { name: 'database', class: 'fas fa-database', cat: 'dokumen' },
  { name: 'calendar', class: 'fas fa-calendar-alt', cat: 'dokumen' },
  { name: 'calendar-check', class: 'fas fa-calendar-check', cat: 'dokumen' },
  { name: 'clock', class: 'fas fa-clock', cat: 'dokumen' },
  { name: 'history', class: 'fas fa-history', cat: 'dokumen' },
  { name: 'book', class: 'fas fa-book', cat: 'dokumen' },
  { name: 'book-medical', class: 'fas fa-book-medical', cat: 'dokumen' },

  // Setting
  { name: 'cog', class: 'fas fa-cog', cat: 'setting' },
  { name: 'cogs', class: 'fas fa-cogs', cat: 'setting' },
  { name: 'wrench', class: 'fas fa-wrench', cat: 'setting' },
  { name: 'tools', class: 'fas fa-tools', cat: 'setting' },
  { name: 'sliders-h', class: 'fas fa-sliders-h', cat: 'setting' },
  { name: 'toggle-on', class: 'fas fa-toggle-on', cat: 'setting' },
  { name: 'server', class: 'fas fa-server', cat: 'setting' },
  { name: 'hdd', class: 'fas fa-hdd', cat: 'setting' },
  { name: 'power-off', class: 'fas fa-power-off', cat: 'setting' },
  { name: 'shield-alt', class: 'fas fa-shield-alt', cat: 'setting' },
  { name: 'lock', class: 'fas fa-lock', cat: 'setting' },
  { name: 'unlock', class: 'fas fa-unlock', cat: 'setting' },
  { name: 'key', class: 'fas fa-key', cat: 'setting' },
  { name: 'eye', class: 'fas fa-eye', cat: 'setting' },
  { name: 'bell', class: 'fas fa-bell', cat: 'setting' },
  { name: 'search', class: 'fas fa-search', cat: 'setting' },
  { name: 'filter', class: 'fas fa-filter', cat: 'setting' },
  { name: 'download', class: 'fas fa-download', cat: 'setting' },
  { name: 'upload', class: 'fas fa-upload', cat: 'setting' },
  { name: 'sync-alt', class: 'fas fa-sync-alt', cat: 'setting' },
  { name: 'trash-alt', class: 'fas fa-trash-alt', cat: 'setting' },
  { name: 'sign-out', class: 'fas fa-sign-out-alt', cat: 'setting' },
  { name: 'sign-in', class: 'fas fa-sign-in-alt', cat: 'setting' },
  { name: 'info-circle', class: 'fas fa-info-circle', cat: 'setting' },
  { name: 'exclamation', class: 'fas fa-exclamation-triangle', cat: 'setting' },
  { name: 'check-circle', class: 'fas fa-check-circle', cat: 'setting' },
  { name: 'times-circle', class: 'fas fa-times-circle', cat: 'setting' },
  { name: 'question-circle', class: 'fas fa-question-circle', cat: 'setting' },
  { name: 'star', class: 'fas fa-star', cat: 'setting' },
  { name: 'tag', class: 'fas fa-tag', cat: 'setting' },
  { name: 'tags', class: 'fas fa-tags', cat: 'setting' },
  { name: 'bookmark', class: 'fas fa-bookmark', cat: 'setting' },
  { name: 'pen', class: 'fas fa-pen-alt', cat: 'setting' },
  { name: 'send', class: 'fas fa-paper-plane', cat: 'setting' },

  // PrimeIcons
  { name: 'pi-home', class: 'pi pi-home', cat: 'prime' },
  { name: 'pi-chart-bar', class: 'pi pi-chart-bar', cat: 'prime' },
  { name: 'pi-chart-line', class: 'pi pi-chart-line', cat: 'prime' },
  { name: 'pi-chart-pie', class: 'pi pi-chart-pie', cat: 'prime' },
  { name: 'pi-users', class: 'pi pi-users', cat: 'prime' },
  { name: 'pi-user', class: 'pi pi-user', cat: 'prime' },
  { name: 'pi-cog', class: 'pi pi-cog', cat: 'prime' },
  { name: 'pi-calendar', class: 'pi pi-calendar', cat: 'prime' },
  { name: 'pi-bell', class: 'pi pi-bell', cat: 'prime' },
  { name: 'pi-file', class: 'pi pi-file', cat: 'prime' },
  { name: 'pi-folder', class: 'pi pi-folder', cat: 'prime' },
  { name: 'pi-search', class: 'pi pi-search', cat: 'prime' },
  { name: 'pi-filter', class: 'pi pi-filter', cat: 'prime' },
  { name: 'pi-plus', class: 'pi pi-plus', cat: 'prime' },
  { name: 'pi-pencil', class: 'pi pi-pencil', cat: 'prime' },
  { name: 'pi-trash', class: 'pi pi-trash', cat: 'prime' },
  { name: 'pi-check', class: 'pi pi-check', cat: 'prime' },
  { name: 'pi-times', class: 'pi pi-times', cat: 'prime' },
  { name: 'pi-eye', class: 'pi pi-eye', cat: 'prime' },
  { name: 'pi-lock', class: 'pi pi-lock', cat: 'prime' },
  { name: 'pi-download', class: 'pi pi-download', cat: 'prime' },
  { name: 'pi-upload', class: 'pi pi-upload', cat: 'prime' },
  { name: 'pi-refresh', class: 'pi pi-refresh', cat: 'prime' },
  { name: 'pi-tag', class: 'pi pi-tag', cat: 'prime' },
  { name: 'pi-inbox', class: 'pi pi-inbox', cat: 'prime' },
  { name: 'pi-send', class: 'pi pi-send', cat: 'prime' },
  { name: 'pi-print', class: 'pi pi-print', cat: 'prime' },
  { name: 'pi-database', class: 'pi pi-database', cat: 'prime' },
  { name: 'pi-server', class: 'pi pi-server', cat: 'prime' },
  { name: 'pi-shield', class: 'pi pi-shield', cat: 'prime' },
  { name: 'pi-star', class: 'pi pi-star', cat: 'prime' },
  { name: 'pi-heart', class: 'pi pi-heart', cat: 'prime' },
  { name: 'pi-bookmark', class: 'pi pi-bookmark', cat: 'prime' },
  { name: 'pi-list', class: 'pi pi-list', cat: 'prime' },
  { name: 'pi-table', class: 'pi pi-table', cat: 'prime' },
  { name: 'pi-sitemap', class: 'pi pi-sitemap', cat: 'prime' },
  { name: 'pi-wallet', class: 'pi pi-wallet', cat: 'prime' },
  { name: 'pi-credit-card', class: 'pi pi-credit-card', cat: 'prime' },
  { name: 'pi-dollar', class: 'pi pi-dollar', cat: 'prime' },
  { name: 'pi-money-bill', class: 'pi pi-money-bill', cat: 'prime' },
  { name: 'pi-id-card', class: 'pi pi-id-card', cat: 'prime' },
  { name: 'pi-building', class: 'pi pi-building', cat: 'prime' },
  { name: 'pi-directions', class: 'pi pi-directions', cat: 'prime' },
  { name: 'pi-map-marker', class: 'pi pi-map-marker', cat: 'prime' },
  { name: 'pi-globe', class: 'pi pi-globe', cat: 'prime' },
  { name: 'pi-link', class: 'pi pi-link', cat: 'prime' },
]

// ── Computed ──────────────────────────────────────
const apiBase = computed(() => configStore.apiBaseUrl)

const menuTree = computed(() => {
  const parents = listData.value.filter((i) => !i.parent_id)
  return parents
    .map((p) => ({
      ...p,
      children: listData.value
        .filter((c) => c.parent_id === p.menu_id)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order)),
    }))
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
})

const parentOptions = computed(() =>
  menuTree.value.map((p) => ({ label: p.title, value: p.menu_id })),
)

const formTitle = computed(() => {
  if (formMode.value === 'create-parent') return 'Tambah Menu Utama'
  if (formMode.value === 'create-child') return 'Tambah Sub Menu'
  return `Edit: ${form.value.title || ''}`
})

const formBadgeClass = computed(() => ({
  'badge--parent': formMode.value === 'create-parent',
  'badge--child': formMode.value === 'create-child',
  'badge--edit': formMode.value === 'edit',
}))

const filteredIcons = computed(() => {
  let list = ALL_ICONS
  if (activeCategory.value !== 'semua') {
    list = list.filter((i) => i.cat === activeCategory.value)
  }
  if (iconSearch.value.trim()) {
    const q = iconSearch.value.toLowerCase()
    list = list.filter((i) => i.name.includes(q) || i.class.includes(q))
  }
  return list
})

// ── Methods ────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/get_all_menu_items`)
    listData.value = res.data?.response || []
  } catch {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal memuat data menu', life: 4000 })
  } finally {
    loading.value = false
  }
}

const toggleExpand = (menuId) => {
  const s = new Set(expandedSet.value)
  s.has(menuId) ? s.delete(menuId) : s.add(menuId)
  expandedSet.value = s
}

const handleParentClick = (parent) => {
  toggleExpand(parent.menu_id)
  activeId.value = parent.id
}

const openCreateParent = () => {
  formMode.value = 'create-parent'
  editId.value = null
  selectedParentForChild.value = null
  form.value = defaultForm()
  errors.value = {}
  showForm.value = true
  showIconPicker.value = false
}

const openCreateChild = (parent) => {
  formMode.value = 'create-child'
  editId.value = null

  selectedParentForChild.value = parent
  form.value = { ...defaultForm(), parent_id: parent.menu_id }
  errors.value = {}
  showForm.value = true
  showIconPicker.value = false
}

const openEdit = (item) => {
  formMode.value = 'edit'
  editId.value = item.id
  activeId.value = item.id
  selectedParentForChild.value = null
  form.value = {
    menu_id: item.menu_id || '',
    parent_id: item.parent_id || '',
    title: item.title || '',
    path: item.path || '',
    icon: item.icon || '',
    sort_order: Number(item.sort_order) || 0,
  }
  errors.value = {}
  showForm.value = true
  showIconPicker.value = false
}

const closeForm = () => {
  showForm.value = false
  activeId.value = null
  showIconPicker.value = false
}

const validate = () => {
  const e = {}
  if (!form.value.menu_id?.trim()) e.menu_id = 'Menu ID wajib diisi'
  if (!form.value.title?.trim()) e.title = 'Title wajib diisi'
  if (formMode.value !== 'create-parent' && !form.value.parent_id)
    e.parent_id = 'Parent menu wajib dipilih'
  if (form.value.sort_order === null || form.value.sort_order === undefined)
    e.sort_order = 'Sort order wajib diisi'
  errors.value = e
  return Object.keys(e).length === 0
}

const submitForm = async () => {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      id: 33,
      menu_id: form.value.menu_id.trim(),
      parent_id: form.value.parent_id?.trim() || '',
      title: form.value.title.trim(),
      path: form.value.path?.trim() || '',
      icon: form.value.icon?.trim() || '',
      sort_order: form.value.sort_order,
    }

    let endpoint = `${apiBase.value}index.php/api/setting/save_menu_item`
    if (formMode.value === 'edit') {
      payload.id = editId.value
      endpoint = `${apiBase.value}index.php/api/setting/update_menu_item`
    }

    console.log('Response:', JSON.stringify(payload)) // Debug response dari server

    const res = await axios.post(endpoint, payload)

    const code = res.data?.metadata?.code

    if (code === 200) {
      toast.add({ severity: 'success', detail: res.data.metadata.message, life: 3000 })
      closeForm()
      await fetchData()
      // Auto-expand parent setelah tambah child
      if (formMode.value === 'create-child' && selectedParentForChild.value) {
        const s = new Set(expandedSet.value)
        s.add(selectedParentForChild.value.menu_id)
        expandedSet.value = s
      }
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: res.data?.metadata?.message || 'Terjadi kesalahan',
        life: 5000,
      })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: err.response?.data?.metadata?.message || 'Terjadi kesalahan',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item) => {
  confirm.require({
    message: `Hapus "${item.title}"? ${item.parent_id ? '' : 'Jika memiliki sub menu, tidak dapat dihapus.'}`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    accept: () => deleteItem(item),
  })
}

const deleteItem = async (item) => {
  try {
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/delete_menu_item`, {
      id: item.id,
    })
    const code = res.data?.metadata?.code
    if (code === 200) {
      toast.add({ severity: 'success', detail: res.data.metadata.message, life: 3000 })
      if (showForm.value && editId.value === item.id) closeForm()
      await fetchData()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Peringatan',
        detail: res.data?.metadata?.message || 'Gagal',
        life: 5000,
      })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: err.response?.data?.metadata?.message || 'Gagal menghapus',
      life: 5000,
    })
  }
}

const toggleIconPicker = () => {
  showIconPicker.value = !showIconPicker.value
  if (showIconPicker.value) {
    nextTick(() => iconSearchInput.value?.focus())
  }
}

const selectIcon = (cls) => {
  form.value.icon = cls
  showIconPicker.value = false
  iconSearch.value = ''
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ── Hero ─────────────────────────────────────────── */
.hero-section {
  background: linear-gradient(135deg, #1a237e 0%, #283593 60%, #3949ab 100%);
  border-radius: 6px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 8px 24px rgba(26, 35, 126, 0.3);
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hero-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.hero-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}
.hero-desc {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
}
.hero-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  text-align: center;
  min-width: 90px;
}
.stat-num {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
}
.stat-lbl {
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Main Layout ──────────────────────────────────── */
.main-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

/* ── Tree Panel ───────────────────────────────────── */
.tree-panel {
  width: 380px;
  min-width: 320px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.tree-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.tree-panel-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.tree-panel-title i {
  color: #6366f1;
}
.btn-add-root {
  background: #6366f1 !important;
  border-color: #6366f1 !important;
}

.tree-loading,
.tree-empty {
  padding: 2.5rem 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
}
.tree-empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

.tree-list {
  padding: 0.5rem;
}
.tree-node {
  margin-bottom: 2px;
}

/* Parent Row */
.tree-parent {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  user-select: none;
}
.tree-parent:hover {
  background: #f1f5f9;
}
.tree-parent--active {
  background: #eff6ff;
}
.tree-parent--active .node-title {
  color: #1d4ed8;
  font-weight: 600;
}

.expand-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.65rem;
  flex-shrink: 0;
  transition: color 0.12s;
  border-radius: 4px;
}
.expand-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.node-icon {
  width: 20px;
  text-align: center;
  font-size: 0.85rem;
  color: #6366f1;
  flex-shrink: 0;
}
.node-icon--sm {
  font-size: 0.75rem;
  color: #94a3b8;
}

.node-title {
  flex: 1;
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.node-title--child {
  font-size: 0.82rem;
  font-weight: 400;
  color: #475569;
}

.child-count {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

.node-actions {
  display: flex;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.12s;
  flex-shrink: 0;
}
.tree-parent:hover .node-actions,
.tree-child:hover .node-actions,
.tree-parent--active .node-actions {
  opacity: 1;
}

.action-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition:
    background 0.12s,
    color 0.12s;
}
.action-btn--edit {
  background: #fef3c7;
  color: #92400e;
}
.action-btn--edit:hover {
  background: #fbbf24;
  color: #fff;
}
.action-btn--delete {
  background: #fee2e2;
  color: #991b1b;
}
.action-btn--delete:hover {
  background: #ef4444;
  color: #fff;
}

/* Children */
.tree-children {
  margin: 0 0 4px 1.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid #e2e8f0;
}

.tree-child {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.12s;
  margin-bottom: 2px;
}
.tree-child:hover {
  background: #f8fafc;
}
.tree-child--active {
  background: #eff6ff;
}

.child-line {
  width: 8px;
  height: 1px;
  background: #cbd5e1;
  flex-shrink: 0;
}

.child-info {
  flex: 1;
  min-width: 0;
}
.child-path {
  display: block;
  font-size: 0.68rem;
  color: #94a3b8;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-child-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  margin: 4px 0;
  border: 1px dashed #c7d2fe;
  border-radius: 5px;
  background: transparent;
  color: #6366f1;
  font-size: 0.78rem;
  cursor: pointer;
  width: 100%;
  transition: background 0.12s;
}
.add-child-btn:hover {
  background: #eef2ff;
}

/* ── Form Panel ───────────────────────────────────── */
.form-panel {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.form-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.form-panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.form-panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.form-panel-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.badge--parent {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge--child {
  background: #dcfce7;
  color: #15803d;
}
.badge--edit {
  background: #fef3c7;
  color: #92400e;
}

.form-close-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: background 0.12s;
}
.form-close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.parent-context {
  margin: 0.75rem 1.25rem 0;
  padding: 0.6rem 0.9rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.parent-context-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.form-body {
  padding: 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  overflow-y: auto;
  flex: 1;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  grid-column: 1 / -1;
}
.field--half {
  grid-column: span 1;
}
.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
}
.req {
  color: #ef4444;
}
.field-hint {
  font-size: 0.7rem;
  color: #94a3b8;
}

.form-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  background: #f8fafc;
}

/* ── Placeholder ──────────────────────────────────── */
.form-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  text-align: center;
  padding: 3rem;
  min-height: 300px;
}
.form-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.form-placeholder p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #94a3b8;
}
.form-placeholder strong {
  color: #6366f1;
}

/* ── Icon Picker ──────────────────────────────────── */
.icon-picker-wrap {
  position: relative;
}

.icon-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.15s;
  user-select: none;
}
.icon-trigger:hover {
  border-color: #6366f1;
}

.icon-trigger-preview {
  width: 26px;
  height: 26px;
  background: #f1f5f9;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #6366f1;
  flex-shrink: 0;
}
.icon-trigger-text {
  flex: 1;
  font-size: 0.82rem;
  color: #374151;
  font-family: monospace;
}
.icon-trigger-arrow {
  font-size: 0.65rem;
  color: #94a3b8;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.icon-trigger-arrow.rotate {
  transform: rotate(180deg);
}

.icon-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
}
.icon-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: 320px;
}
.icon-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.icon-search-wrap i {
  color: #94a3b8;
  font-size: 0.8rem;
  flex-shrink: 0;
}
.icon-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.82rem;
  color: #1e293b;
  background: transparent;
}
.icon-search-clear {
  border: none;
  background: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.7rem;
  padding: 0;
}
.icon-categories {
  display: flex;
  gap: 4px;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.cat-btn {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 0.68rem;
  cursor: pointer;
  background: #fff;
  color: #64748b;
  transition:
    background 0.12s,
    color 0.12s;
  white-space: nowrap;
}
.cat-btn:hover {
  background: #f1f5f9;
}
.cat-btn--active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
  gap: 4px;
  padding: 0.5rem;
  overflow-y: auto;
  flex: 1;
}
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.25rem;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  background: #fff;
  transition:
    background 0.1s,
    border-color 0.1s;
  font-size: 0.58rem;
  color: #64748b;
  text-align: center;
  overflow: hidden;
}
.icon-item i {
  font-size: 1.1rem;
  color: #475569;
}
.icon-item span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.icon-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.icon-item--active {
  background: #eff6ff;
  border-color: #6366f1;
}
.icon-item--active i {
  color: #6366f1;
}

.icon-empty {
  padding: 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.82rem;
}

.icon-dropdown-footer {
  padding: 0.4rem 0.6rem;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.icon-clear-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: #ef4444;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  transition: background 0.12s;
}
.icon-clear-btn:hover {
  background: #fee2e2;
}

/* ── Transitions ──────────────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 820px) {
  .main-layout {
    flex-direction: column;
  }
  .tree-panel {
    width: 100%;
    min-width: unset;
  }
  .form-panel {
    width: 100%;
  }
  .form-body {
    grid-template-columns: 1fr;
  }
  .field--half {
    grid-column: 1;
  }
  .hero-section {
    flex-direction: column;
  }
}
</style>
