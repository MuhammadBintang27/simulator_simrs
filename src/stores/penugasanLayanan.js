import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useConfigStore } from './config'
import { useAuthStore } from './config'
import { storeToRefs } from 'pinia'

export const usePenugasanLayananStore = defineStore('penugasanLayanan', () => {
  const configStore = useConfigStore()
  const authStore = useAuthStore()
  const { id_client, user_id } = storeToRefs(authStore)

  // Base URL - sesuai requirement
  const baseUrl = `${configStore.apiApotikUrl}/index.php/api/penugasan_layanan`

  // Role Constants (sesuai m_jabatan)
  const ROLE_CODES = {
    DIREKTUR: 1,
    WAKIL_DIREKTUR: 2,
    KEPALA_BIDANG: 3,
    KEPALA_SEKSI: 4,
    STAFF: 5,
  }

  // Mapping kode ke nama jabatan (untuk display)
  const ROLE_NAMES = {
    1: 'DIREKTUR',
    2: 'WAKIL DIREKTUR',
    3: 'KEPALA BIDANG',
    4: 'KEPALA SEKSI',
    5: 'STAFF',
  }

  // Mapping kode ke permissions/akses
  const ROLE_PERMISSIONS = {
    1: {
      // DIREKTUR
      canAssignToBidang: true,
      canAssignToStaff: true,
      canViewAllReports: true,
      canApprove: true,
    },
    2: {
      // WAKIL DIREKTUR (sama dengan Direktur)
      canAssignToBidang: true,
      canAssignToStaff: true,
      canViewAllReports: true,
      canApprove: true,
    },
    3: {
      // KEPALA BIDANG
      canAssignToBidang: true,
      canAssignToStaff: true,
      canViewAllReports: false,
      canApprove: false,
    },
    4: {
      // KEPALA SEKSI (sama dengan Staff)
      canAssignToBidang: false,
      canAssignToStaff: false,
      canViewAllReports: false,
      canApprove: false,
    },
    5: {
      // STAFF (sama dengan Kepala Seksi)
      canAssignToBidang: false,
      canAssignToStaff: false,
      canViewAllReports: false,
      canApprove: false,
    },
  }

  // State
  const reports = ref([])
  const myTasks = ref([])
  const myReports = ref([])
  const currentReport = ref(null)
  const departments = ref([])
  const staffByBidang = ref({})
  const enums = ref({
    categories: [],
    priorities: [],
    statuses: [],
  })
  const loading = ref(false)
  const error = ref(null)
  const statusHistory = ref([])

  // Pagination State
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  })

  // Stats State (untuk header/dashboard)
  const reportsStats = ref({
    total_reports: 0,
    tickets_today: 0,
    tickets_this_week: 0,
    tickets_this_month: 0,
    tickets_unreviewed: 0,
    categories: [],
    statuses: [],
  })

  // Getters
  const reportsByStatus = computed(() => {
    const grouped = {}
    reports.value.forEach((report) => {
      if (!grouped[report.status]) {
        grouped[report.status] = []
      }
      grouped[report.status].push(report)
    })
    return grouped
  })

  const tasksByPriority = computed(() => {
    return [...myTasks.value].sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  })

  // Permission getters
  const getRolePermissions = (jobCode) => {
    return ROLE_PERMISSIONS[jobCode] || {}
  }

  const canUserAssignToBidang = (jobCode) => {
    const permissions = getRolePermissions(jobCode)
    return permissions.canAssignToBidang || false
  }

  const canUserAssignToStaff = (jobCode) => {
    const permissions = getRolePermissions(jobCode)
    return permissions.canAssignToStaff || false
  }

  const canUserViewAllReports = (jobCode) => {
    const permissions = getRolePermissions(jobCode)
    return permissions.canViewAllReports || false
  }

  const canUserApprove = (jobCode) => {
    const permissions = getRolePermissions(jobCode)
    return permissions.canApprove || false
  }

  const urgentReportsCount = computed(() => {
    return reports.value.filter((r) => r.priority === 'urgent' && r.status !== 'completed').length
  })

  const inProgressTasksCount = computed(() => {
    return myTasks.value.filter((t) => t.status === 'in_progress').length
  })

  const completedTasksCount = computed(() => {
    return myTasks.value.filter((t) => t.status === 'completed').length
  })

  // Role Helper Functions
  /**
   * Generic role checker by code
   * @param {number|string} jobCode - Kode jabatan user
   * @param {number} targetRoleCode - Kode jabatan target
   * @returns {boolean}
   */
  const isRole = (jobCode, targetRoleCode) => {
    return parseInt(jobCode) === targetRoleCode
  }

  /**
   * Get role name by code
   * @param {number|string} jobCode - Kode jabatan (1-5)
   * @returns {string} Nama jabatan
   */
  const getRoleName = (jobCode) => {
    const code = parseInt(jobCode)
    return ROLE_NAMES[code] || 'UNKNOWN'
  }

  // Legacy role check functions (backward compatibility)
  /**
   * Check if user is Direktur
   * @param {number|string} jobCode - Kode jabatan
   * @returns {boolean}
   */
  const isDirektur = (jobCode) => {
    return isRole(jobCode, ROLE_CODES.DIREKTUR)
  }

  /**
   * Check if user is Wakil Direktur
   * @param {number|string} jobCode - Kode jabatan
   * @returns {boolean}
   */
  const isWakilDirektur = (jobCode) => {
    return isRole(jobCode, ROLE_CODES.WAKIL_DIREKTUR)
  }

  /**
   * Check if user is Kepala Bidang
   * @param {number|string} jobCode - Kode jabatan
   * @returns {boolean}
   */
  const isKepalaBidang = (jobCode) => {
    return isRole(jobCode, ROLE_CODES.KEPALA_BIDANG)
  }

  /**
   * Check if user is Kepala Seksi
   * @param {number|string} jobCode - Kode jabatan
   * @returns {boolean}
   */
  const isKepalaSeksi = (jobCode) => {
    return isRole(jobCode, ROLE_CODES.KEPALA_SEKSI)
  }

  /**
   * Check if user is Staff
   * @param {number|string} jobCode - Kode jabatan
   * @returns {boolean}
   */
  const isStaff = (jobCode) => {
    return isRole(jobCode, ROLE_CODES.STAFF)
  }

  // Helper function untuk axios config
  const getAxiosConfig = () => {
    const token = localStorage.getItem('token')
    const apiKey = localStorage.getItem('apiKey')

    // Return simple object without any circular references
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'X-API-KEY': apiKey || '',
        'Content-Type': 'application/json',
      },
    }
  }

  // Actions - Health & Enums
  async function checkHealth() {
    try {
      const config = getAxiosConfig()
      const response = await axios.get(`${baseUrl}/`, config)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function fetchEnums() {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const [categories, priorities, statuses] = await Promise.all([
        axios.get(`${baseUrl}/enums/categories`, config),
        axios.get(`${baseUrl}/enums/priorities`, config),
        axios.get(`${baseUrl}/enums/statuses`, config),
      ])
      enums.value = {
        categories: categories.data.response || [],
        priorities: priorities.data.response || [],
        statuses: statuses.data.response || [],
      }
      return enums.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Reports
  async function fetchReports(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()

      // Build payload dengan filter params
      const payload = {
        id_client: id_client.value || localStorage.getItem('id_client') || 1,
        page: filters.page || 1,
        limit: filters.limit || 10,
      }

      // Add filter params jika ada
      if (filters.priority) payload.priority = filters.priority
      if (filters.date_from) payload.date_from = filters.date_from
      if (filters.date_to) payload.date_to = filters.date_to
      if (filters.problem_category) payload.problem_category = filters.problem_category
      if (filters.status) payload.status = filters.status
      if (filters.search) payload.search = filters.search

      const response = await axios.post(`${baseUrl}/get_reports`, payload, config)
      reports.value = response.data.response || []

      // Simpan pagination info
      if (response.data.pagination) {
        pagination.value = response.data.pagination
      }

      return reports.value
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch reports statistics (untuk header/dashboard tanpa pagination)
   * @param {Object} params - Query parameters
   * @param {number} params.reporter_user_id - Filter untuk MyReports
   * @param {string} params.assigned_staff_id - Filter untuk MyTasks Staff
   * @param {number} params.bidang_id - Filter untuk MyTasks Kabid
   */
  async function fetchReportsStats(params = {}) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      // Build query string
      const queryParams = new URLSearchParams({
        id_client: clientId,
        ...params,
      })

      const url = `${baseUrl}/get_reports_stats?${queryParams.toString()}`
      const response = await axios.get(url, config)

      reportsStats.value = response.data.response || {
        total_reports: 0,
        tickets_today: 0,
        tickets_this_week: 0,
        tickets_this_month: 0,
        tickets_unreviewed: 0,
        categories: [],
        statuses: [],
      }

      return reportsStats.value
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchReportDetail(id) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1
      const response = await axios.get(`${baseUrl}/report_detail/${id}/${clientId}`, config)
      currentReport.value = response.data.response || null
      return currentReport.value
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createReport(formData) {
    loading.value = true
    error.value = null
    try {
      // ✅ Safety check
      if (!formData) {
        throw new Error('FormData is required')
      }

      // ✅ Jika formData sudah FormData object, gunakan langsung
      let payload
      if (formData instanceof FormData) {
        payload = formData

        // Add required fields yang mungkin belum ada
        const userId = user_id.value || localStorage.getItem('user_id')
        const clientId = id_client.value || localStorage.getItem('id_client') || 1

        if (!payload.has('reporter_user_id')) {
          payload.append('reporter_user_id', userId)
        }
        if (!payload.has('id_client')) {
          payload.append('id_client', clientId)
        }
        if (!payload.has('priority')) {
          payload.append('priority', 'medium') // Default priority
        }
      } else {
        // Fallback untuk format lama (jika masih digunakan di tempat lain)
        payload = new FormData()

        const data = formData.formData || formData
        const userId = user_id.value || localStorage.getItem('user_id')
        const clientId = id_client.value || localStorage.getItem('id_client') || 1

        payload.append('reporter_user_id', userId)
        payload.append('reporter_name', data.reporter_name || '')
        payload.append('problem_category', data.problem_category || '')
        payload.append('problem_title', data.problem_title || '')
        payload.append('problem_description', data.problem_description || '')
        payload.append('priority', data.priority || 'medium')
        payload.append('id_client', clientId)

        if (data.reporter_phone) {
          payload.append('reporter_phone', data.reporter_phone)
        }
        if (data.location) {
          payload.append('location', data.location)
        }

        // Old format - photos as JSON string (deprecated)
        // Hanya jika formData adalah plain object dengan property photos
        if (
          typeof formData === 'object' &&
          (!formData) instanceof FormData &&
          formData.photos &&
          formData.photos.length > 0
        ) {
          payload.append('photos', JSON.stringify(formData.photos))
        }
      }

      // ✅ Multipart/form-data config
      const config = getAxiosConfig()
      const requestConfig = { ...config }
      requestConfig.headers['Content-Type'] = 'multipart/form-data'

      const response = await axios.post(`${baseUrl}/create_report`, payload, requestConfig)

      // Check if backend returned an error in metadata even with 200 status
      if (response.data?.metadata?.code && response.data.metadata.code !== '200') {
        throw new Error(response.data.metadata.message || 'Backend error')
      }

      await fetchReports() // Refresh list
      return response.data.response
    } catch (err) {
      // Error handling
      const errorData = err.response?.data
      let errorMessage = err.message

      if (errorData?.metadata?.message) {
        errorMessage = errorData.metadata.message
      }

      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function updateReport(id, reportData) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const response = await axios.put(`${baseUrl}/report/${id}`, reportData, config)
      await fetchReports() // Refresh list
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteReport(id) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const response = await axios.delete(`${baseUrl}/report/${id}`, config)
      await fetchReports() // Refresh list
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Assignments (Direktur, Wadir, Kabid)
  async function assignToDepartment(reportId, bidangId, notes = '', priority = null) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const assignedBy = user_id.value || localStorage.getItem('user_id')
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      // Updated payload to match API docs - now includes priority
      // assigned_by: Required - user_id yang melakukan assign (DIREKTUR/WADIR/KABID)
      // Backend akan validasi:
      // - DIREKTUR/WADIR bisa assign ke bidang mana saja
      // - KABID hanya bisa assign ke bidangnya sendiri
      const payload = {
        report_id: reportId,
        bidang_id: bidangId,
        assigned_by: assignedBy, // Required
        assignment_notes: notes,
        priority: priority, // NEW: Priority set by Direktur/Wadir/Kabid
        id_client: clientId, // Required
      }

      const response = await axios.post(`${baseUrl}/assign_to_department`, payload, config)

      // Validasi: Cek apakah response adalah HTML error (bukan JSON)
      if (
        typeof response.data === 'string' &&
        (response.data.includes('<!DOCTYPE') || response.data.includes('<html'))
      ) {
        throw new Error(
          'Backend error: Server mengembalikan halaman error HTML. Cek console untuk detail.',
        )
      }

      // Validasi: Cek apakah response berisi error dari backend
      if (typeof response.data === 'string' && response.data.includes('Exception')) {
        const match = response.data.match(/Message: ([^<]+)/)
        const errorMsg = match ? match[1] : 'Unknown backend error'
        throw new Error(`Backend SQL Error: ${errorMsg}`)
      }

      // Validasi: Cek apakah response format JSON yang benar
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Response tidak valid dari server')
      }

      await fetchReports() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function batchAssign(assignments) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const response = await axios.post(`${baseUrl}/batch_assign`, { assignments }, config)
      await fetchReports() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Assignments (Kabid)
  async function acceptAssignment(assignmentId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const response = await axios.post(`${baseUrl}/accept_assignment/${assignmentId}`, {}, config)
      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignToStaff(reportId, staffList) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const assignedByKabid = user_id.value || localStorage.getItem('user_id')
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      // Updated payload to match API docs
      const payload = {
        report_id: reportId, // Changed from department_assignment_id
        assigned_by_kabid: assignedByKabid, // Required
        staff_list: staffList, // Renamed from staff_assignments
        id_client: clientId, // Required
      }

      const response = await axios.post(`${baseUrl}/assign_to_staff`, payload, config)

      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reassignStaff(staffAssignmentId, newStaffUserId, reason) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const response = await axios.post(
        `${baseUrl}/reassign_staff`,
        {
          staff_assignment_id: staffAssignmentId,
          new_staff_user_id: newStaffUserId,
          reason: reason,
        },
        config,
      )
      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Work Progress (Staff)
  async function updateProgress(staffAssignmentId, reportId, progressData) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const updatedBy = user_id.value || localStorage.getItem('user_id')
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      // Support both JSON and FormData (with file upload)
      let payload,
        requestConfig = { ...config }

      if (progressData.photo && progressData.photo instanceof File) {
        // Use FormData for file upload
        payload = new FormData()
        payload.append('staff_assignment_id', staffAssignmentId)
        payload.append('report_id', reportId)
        payload.append('progress_notes', progressData.notes || '')
        payload.append('work_percentage', progressData.percentage || 0)
        payload.append('hours_spent', progressData.hoursSpent || 0)
        if (progressData.materialsNeeded) {
          payload.append('materials_needed', progressData.materialsNeeded)
        }
        payload.append('updated_by', updatedBy)
        payload.append('id_client', clientId)
        payload.append('progress_photo', progressData.photo)
        requestConfig.headers['Content-Type'] = 'multipart/form-data'
      } else {
        // Use JSON request
        payload = {
          staff_assignment_id: staffAssignmentId,
          report_id: reportId,
          progress_notes: progressData.notes || '',
          work_percentage: progressData.percentage || 0,
          hours_spent: progressData.hoursSpent || 0,
          updated_by: updatedBy,
          id_client: clientId,
        }
        if (progressData.materialsNeeded) {
          payload.materials_needed = progressData.materialsNeeded
        }
      }

      const response = await axios.post(`${baseUrl}/update_progress`, payload, requestConfig)
      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // NEW: Fetch work progress history
  async function fetchWorkProgress(reportId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1
      const url = `${baseUrl}/work_progress/${reportId}/${clientId}`
      const response = await axios.get(url, config)
      return response.data.response || []
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // NEW: Update task status (in_progress, completed, deferred, etc)
  async function updateTaskStatus(reportId, newStatus, notes = '', photoFile = null) {
    loading.value = true
    error.value = null
    try {
      const updatedBy = user_id.value || localStorage.getItem('user_id')
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      // Always use FormData for consistency
      const formData = new FormData()
      formData.append('report_id', reportId)
      formData.append('new_status', newStatus)
      formData.append('notes', notes || '')
      formData.append('updated_by', updatedBy)
      formData.append('id_client', clientId)

      // Add file if provided - MUST be actual File object
      if (photoFile) {
        if (Array.isArray(photoFile)) {
          // Multiple files
          photoFile.forEach((file) => {
            if (file instanceof File) {
              formData.append('completion_photos[]', file)
            }
          })
        } else if (photoFile instanceof File) {
          // Single file
          formData.append('completion_photos[]', photoFile)
        }
      }

      const response = await axios.post(`${baseUrl}/update_task_status`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function completeTask(reportId, completionNotes = '') {
    loading.value = true
    error.value = null
    try {
      // Use updateTaskStatus to mark as completed
      return await updateTaskStatus(reportId, 'completed', completionNotes)
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deferTask(reportId, notes, updatedBy, clientId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()

      const payload = {
        report_id: reportId,
        new_status: 'deferred',
        action_type: 'deferral',
        notes: notes,
        updated_by: updatedBy,
        id_client: clientId,
      }

      const response = await axios.post(`${baseUrl}/update_task_status`, payload, config)

      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resumeTask(reportId, notes, resumedBy, clientId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()

      const payload = {
        report_id: reportId,
        resumed_by: resumedBy,
        action_type: 'status_change',
        notes: notes,
        id_client: clientId,
      }

      const response = await axios.post(`${baseUrl}/resume_deferred_task`, payload, config)

      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Task Management
  async function fetchMyTasks(params = {}) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()

      const userId = user_id.value || localStorage.getItem('user_id') || ''
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      if (!userId) {
        myTasks.value = []
        pagination.value = { page: 1, limit: 10, total: 0, total_pages: 0 }
        return []
      }

      // Build URL with pagination and filter query params
      const page = params.page || 1
      const limit = params.limit || 10
      const status = params.status || ''

      let url = `${baseUrl}/my_tasks/${userId}/${clientId}`
      if (status) {
        url += `/${status}`
      }

      // Build query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Add filter params jika ada
      if (params.priority) queryParams.append('priority', params.priority)
      if (params.date_from) queryParams.append('date_from', params.date_from)
      if (params.date_to) queryParams.append('date_to', params.date_to)
      if (params.problem_category) queryParams.append('problem_category', params.problem_category)

      url += `?${queryParams.toString()}`

      const response = await axios.get(url, config)

      myTasks.value = response.data.response || []

      // Simpan pagination info
      if (response.data.pagination) {
        pagination.value = response.data.pagination
      }

      return myTasks.value
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyReports(params = {}) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()

      const userId = user_id.value || localStorage.getItem('user_id') || ''
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      if (!userId) {
        myReports.value = []
        pagination.value = { page: 1, limit: 10, total: 0, total_pages: 0 }
        return []
      }

      // Build URL with pagination and filter query params
      const page = params.page || 1
      const limit = params.limit || 10
      const status = params.status || ''

      let url = `${baseUrl}/my_reports/${userId}/${clientId}`
      if (status) {
        url += `/${status}`
      }

      // Build query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Add filter params jika ada
      if (params.priority) queryParams.append('priority', params.priority)
      if (params.date_from) queryParams.append('date_from', params.date_from)
      if (params.date_to) queryParams.append('date_to', params.date_to)
      if (params.problem_category) queryParams.append('problem_category', params.problem_category)

      url += `?${queryParams.toString()}`

      const response = await axios.get(url, config)

      // Check if response is HTML (error) instead of JSON
      if (typeof response.data === 'string') {
        myReports.value = []
        pagination.value = { page: 1, limit: 10, total: 0, total_pages: 0 }
        return []
      }

      myReports.value = response.data.response || []

      // Simpan pagination info
      if (response.data.pagination) {
        pagination.value = response.data.pagination
      }

      return myReports.value
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Master Data
  async function fetchDepartments() {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1
      // Changed: query string → path parameter
      const url = `${baseUrl}/departments/${clientId}`
      const response = await axios.get(url, config)
      departments.value = response.data.response || []
      return departments.value
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStaffByDepartment(bidangId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1
      // Changed: endpoint & path parameters
      const url = `${baseUrl}/staff_by_department/${bidangId}/${clientId}`
      const response = await axios.get(url, config)
      staffByBidang.value[bidangId] = response.data.response || []
      return staffByBidang.value[bidangId]
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // NEW: Get all users in department (includes kabid, staff, etc)
  async function fetchUsersByBidang(bidangId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1
      const url = `${baseUrl}/users_by_bidang/${bidangId}/${clientId}`
      const response = await axios.get(url, config)
      return response.data.response || []
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchStatusHistory(reportId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1
      const url = `${baseUrl}/status_history/${reportId}/${clientId}`
      const response = await axios.get(url, config)

      // Backend sudah mengembalikan data dengan action_type dan changed_by_name yang benar
      // Hanya perlu menambahkan field alias untuk comment
      const transformedHistory = (response.data.response || []).map((item) => {
        if (item.action_type === 'comment') {
          return {
            ...item,
            comment_text: item.notes || '',
            commented_by_name: item.changed_by_name,
            commented_at: item.changed_at,
          }
        }
        return item
      })

      statusHistory.value = transformedHistory
      return statusHistory.value
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addComment(reportId, commentText) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const commentedBy = user_id.value || localStorage.getItem('user_id')
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      const payload = {
        report_id: reportId,
        comment_text: commentText,
        commented_by: commentedBy,
        id_client: clientId,
      }

      const response = await axios.post(`${baseUrl}/add_comment`, payload, config)

      // Validasi response
      if (
        typeof response.data === 'string' &&
        (response.data.includes('<!DOCTYPE') || response.data.includes('<html'))
      ) {
        throw new Error('Backend error: Server mengembalikan halaman error HTML.')
      }

      if (typeof response.data === 'string' && response.data.includes('Exception')) {
        const match = response.data.match(/Message: ([^<]+)/)
        const errorMsg = match ? match[1] : 'Unknown backend error'
        throw new Error(`Backend Error: ${errorMsg}`)
      }

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Response tidak valid dari server')
      }

      // Refresh status history after adding comment
      await fetchStatusHistory(reportId)

      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // NEW: Get dashboard statistics
  async function fetchDashboardStats(userId = null, role = null) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()
      const clientId = id_client.value || localStorage.getItem('id_client') || 1

      let url = `${baseUrl}/dashboard_stats/${clientId}`

      // Add query parameters if provided
      const params = []
      if (userId) params.push(`user_id=${userId}`)
      if (role) params.push(`role=${role}`)
      if (params.length > 0) url += `?${params.join('&')}`

      const response = await axios.get(url, config)
      return response.data.response || {}
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reference Data Functions
  /**
   * Fetch job title by job code
   * @param {string|number} jobCode - ID jabatan dari KDJABATAN
   * @returns {Promise<Object>} Job data with KDJABATAN, NAMA_JABATAN
   */
  const fetchJabatanById = async (jobCode) => {
    if (!jobCode) return null

    try {
      const response = await axios.get(`${baseUrl}/jabatan/${jobCode}`)

      if (response.data?.metadata?.code === '200') {
        return response.data.response // Returns { KDJABATAN, NAMA_JABATAN }
      }
      return null
    } catch (err) {
      return null
    }
  }

  /**
   * Fetch location/department name by location ID
   * @param {string|number} lokasiId - ID lokasi dari ID_LOKASI_INV
   * @returns {Promise<Object>} Lokasi data with ID, LOKASI, JENIS_LOKASI, etc
   */
  const fetchLokasiById = async (lokasiId) => {
    if (!lokasiId) return null

    try {
      const response = await axios.get(`${baseUrl}/lokasi/${lokasiId}/${id_client.value}`)

      if (response.data?.metadata?.code === '200') {
        return response.data.response // Returns { ID, LOKASI, JENIS_LOKASI, IS_DEPO, IS_HQ, IDCLIENT }
      }
      return null
    } catch (err) {
      return null
    }
  }

  // Defer task (menunda pekerjaan)
  async function deferTask(reportId, notes, updatedBy, clientId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()

      const payload = {
        report_id: reportId,
        new_status: 'deferred',
        notes: notes,
        updated_by: updatedBy,
        id_client: clientId,
      }

      const response = await axios.post(`${baseUrl}/update_task_status`, payload, config)

      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Resume deferred task (melanjutkan pekerjaan yang ditunda)
  async function resumeTask(reportId, notes, resumedBy, clientId) {
    loading.value = true
    error.value = null
    try {
      const config = getAxiosConfig()

      const payload = {
        report_id: reportId,
        resumed_by: resumedBy,
        notes: notes,
        id_client: clientId,
      }

      const response = await axios.post(`${baseUrl}/resume_deferred_task`, payload, config)

      await fetchMyTasks() // Refresh
      return response.data.response
    } catch (err) {
      error.value = err.response?.data?.metadata?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset function
  function $reset() {
    reports.value = []
    myTasks.value = []
    myReports.value = []
    currentReport.value = null
    departments.value = []
    staffByBidang.value = {}
    error.value = null
    loading.value = false
  }

  return {
    // Constants
    ROLE_CODES,
    ROLE_NAMES,
    // State
    reports,
    myTasks,
    myReports,
    currentReport,
    departments,
    staffByBidang,
    enums,
    loading,
    error,
    statusHistory,
    pagination,
    reportsStats,
    // Getters
    reportsByStatus,
    tasksByPriority,
    urgentReportsCount,
    inProgressTasksCount,
    completedTasksCount,
    // Role Helpers
    isRole,
    getRoleName,
    isDirektur,
    isWakilDirektur,
    isKepalaBidang,
    isKepalaSeksi,
    isStaff,
    // Permission Helpers
    getRolePermissions,
    canUserAssignToBidang,
    canUserAssignToStaff,
    canUserViewAllReports,
    canUserApprove,
    // Actions
    checkHealth,
    fetchEnums,
    fetchReports,
    fetchReportsStats,
    fetchReportDetail,
    createReport,
    updateReport,
    deleteReport,
    assignToDepartment,
    batchAssign,
    acceptAssignment,
    assignToStaff,
    reassignStaff,
    updateProgress,
    updateTaskStatus,
    completeTask,
    deferTask,
    resumeTask,
    fetchWorkProgress,
    fetchMyTasks,
    fetchMyReports,
    fetchDepartments,
    fetchStaffByDepartment,
    fetchUsersByBidang,
    fetchStatusHistory,
    addComment,
    fetchDashboardStats,
    fetchJabatanById,
    fetchLokasiById,
    $reset,
  }
})
