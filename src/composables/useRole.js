/**
 * Role Management Composable
 *
 * PENTING: JANGAN HARDCODE!
 * - Semua role mapping berdasarkan database (m_jabatan)
 * - Nama jabatan dan lokasi diambil dari authStore yang sudah fetch dari API saat login
 * - Kode jabatan dinamis, bisa berubah kapan saja
 *
 * Usage:
 * import { useRole } from '@/composables/useRole'
 * const { currentJobCode, isRole, canAssignToDepartment } = useRole()
 *
 * // Check role by code
 * const isDirektur = isRole(1)
 * const isKabid = isRole(3)
 * const isStaff = isRole(5)
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/config'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'

export function useRole() {
  const authStore = useAuthStore()
  const penugasanStore = usePenugasanLayananStore()

  // Get current user job_code from authStore (populated during login)
  const currentJobCode = computed(() => {
    const jobCode = authStore.user?.job_code || authStore.job_code || localStorage.getItem('job_code')
    return jobCode ? parseInt(jobCode) : null
  })

  // Get current user job title (nama jabatan dari database)
  const currentJobTitle = computed(() => {
    return authStore.user?.job_title || 'Unknown'
  })

  // Get current user bidang/lokasi name (nama lokasi dari database)
  const currentBidangName = computed(() => {
    return authStore.user?.bidang_name || 'Unknown'
  })

  // Get current user bidang_id
  const currentBidangId = computed(() => {
    return authStore.user?.bidang_id || authStore.bidang_id || localStorage.getItem('bidang_id')
  })

  // Generic role checker function - check by role code
  const isRole = (roleCode) => {
    return computed(() => {
      return currentJobCode.value === roleCode
    })
  }

  // Legacy role checks for backward compatibility (will be deprecated)
  const isDirektur = isRole(penugasanStore.ROLE_CODES.DIREKTUR)
  const isWadir = isRole(penugasanStore.ROLE_CODES.WAKIL_DIREKTUR)
  const isKabid = isRole(penugasanStore.ROLE_CODES.KEPALA_BIDANG)
  const isKasie = isRole(penugasanStore.ROLE_CODES.KEPALA_SEKSI)
  const isStaff = isRole(penugasanStore.ROLE_CODES.STAFF)
  
  // Permission checks using ROLE_PERMISSIONS mapping
  const canAssignToDepartment = computed(() => {
    return penugasanStore.canUserAssignToBidang(currentJobCode.value)
  })
  
  const canAssignToStaff = computed(() => {
    return penugasanStore.canUserAssignToStaff(currentJobCode.value)
  })
  
  const canUpdateProgress = computed(() => {
    return isStaff.value
  })
  
  const canCompleteTask = computed(() => {
    return isStaff.value
  })
  
  const canViewAllReports = computed(() => {
    return penugasanStore.canUserViewAllReports(currentJobCode.value)
  })
  
  const canApprove = computed(() => {
    return penugasanStore.canUserApprove(currentJobCode.value)
  })
  
  // Helper to get role name dynamically (don't hardcode!)
  const getRoleName = (jobCode) => {
    return penugasanStore.getRoleName(jobCode)
  }
  
  // Check if user has permission for specific report/task
  const canAssignReport = (report) => {
    // Users with canAssignToBidang permission can assign submitted reports
    if (canAssignToDepartment.value && report.status === 'submitted') {
      return true
    }
    return false
  }
  
  const canAssignTask = (task) => {
    // Users with canAssignToStaff permission can assign tasks in their bidang
    if (canAssignToStaff.value && task.bidang_id === currentBidangId.value) {
      return true
    }
    return false
  }
  
  /**
   * Validasi apakah user bisa assign ke bidang tertentu
   * @param {number|string} targetBidangId - ID bidang tujuan
   * @returns {boolean}
   */
  const canAssignToBidang = (targetBidangId) => {
    // Users with canAssignToBidang permission can assign to any bidang
    if (canAssignToDepartment.value) {
      return true
    }
    
    // Users with canAssignToStaff permission can only assign to their own bidang
    if (canAssignToStaff.value) {
      return parseInt(targetBidangId) === parseInt(currentBidangId.value)
    }
    
    // Other roles cannot assign to bidang
    return false
  }
  
  const canUpdateTask = (task) => {
    // Staff can update tasks assigned to them
    if (isStaff.value && task.assigned_to === authStore.user_id) {
      return true
    }
    return false
  }
  
  return {
    // Current user info (from database)
    currentJobCode,
    currentJobTitle,
    currentBidangName,
    currentBidangId,

    // Generic role checker
    isRole,

    // Legacy role checks (backward compatibility - will be deprecated)
    isDirektur,
    isWadir,
    isKabid,
    isKasie,
    isStaff,

    // Permission checks
    canAssignToDepartment,
    canAssignToStaff,
    canUpdateProgress,
    canCompleteTask,
    canViewAllReports,
    canApprove,

    // Contextual permissions
    canAssignReport,
    canAssignTask,
    canUpdateTask,
    canAssignToBidang,

    // Helpers
    getRoleName,
  }
}
