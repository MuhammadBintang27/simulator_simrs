<template>
  <Panel>
    <div class="content">
      <!-- Header -->
      <div class="header">
        <h2>Notifications</h2>
        <div class="header-actions">
          <span class="unread-count" v-if="unreadCount > 0">{{ unreadCount }} unread</span>
          <button class="mark-all-btn" @click="markAllAsRead" v-if="unreadCount > 0">
            Mark all read
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.key"
          :class="['filter-btn', { active: activeFilter === filter.key }]"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Notification List -->
      <div class="notification-list">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <p>No notifications</p>
        </div>

        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :class="['notification-item', { unread: !notification.read }]"
          @click="markAsRead(notification.id)"
        >
          <div :class="['notification-dot', notification.type]"></div>

          <div class="notification-content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
            <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
          </div>

          <div class="notification-actions" v-if="notification.actions">
            <button
              v-for="action in notification.actions"
              :key="action.label"
              :class="['action-btn', action.type]"
              @click.stop="handleAction(notification.id, action)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'info', label: 'Info' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' },
]

const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: 'New Feature Released',
    message: "We've just launched our new dashboard with enhanced analytics.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    actions: [
      { label: 'View', type: 'primary' },
      { label: 'Dismiss', type: 'secondary' },
    ],
  },
  {
    id: 2,
    type: 'success',
    title: 'Payment Successful',
    message: 'Your subscription has been renewed successfully.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    actions: [{ label: 'Receipt', type: 'primary' }],
  },
  {
    id: 3,
    type: 'warning',
    title: 'Storage Almost Full',
    message: "You're using 89% of your storage space.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true,
    actions: [{ label: 'Upgrade', type: 'primary' }],
  },
  {
    id: 4,
    type: 'error',
    title: 'Login Failed',
    message: 'Multiple failed login attempts detected.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    read: false,
    actions: [{ label: 'Secure', type: 'primary' }],
  },
  {
    id: 5,
    type: 'info',
    title: 'System Maintenance',
    message: 'Scheduled maintenance tonight from 2-4 AM EST.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    read: true,
  },
])

const filteredNotifications = computed(() => {
  return notifications.value.filter((notification) => {
    if (activeFilter.value === 'all') return true
    if (activeFilter.value === 'unread') return !notification.read
    return notification.type === activeFilter.value
  })
})

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.read).length
})

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const markAsRead = (id) => {
  const notification = notifications.value.find((n) => n.id === id)
  if (notification && !notification.read) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true
  })
}

const handleAction = (notificationId, action) => {
  console.log(`Action "${action.label}" clicked for notification ${notificationId}`)
  if (action.label === 'Dismiss') {
    const index = notifications.value.findIndex((n) => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.notification-center {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unread-count {
  font-size: 14px;
  color: #6b7280;
}

.mark-all-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mark-all-btn:hover {
  background: #2563eb;
}

.filters {
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #f3f4f6;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.notification-list {
  max-height: 500px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
}

.notification-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.notification-dot.info {
  background: #3b82f6;
}

.notification-dot.success {
  background: #10b981;
}

.notification-dot.warning {
  background: #f59e0b;
}

.notification-dot.error {
  background: #ef4444;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
}

.notification-content p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #9ca3af;
}

.notification-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .notification-item {
    padding: 12px 16px;
  }

  .notification-actions {
    flex-direction: column;
    width: 60px;
  }

  .action-btn {
    font-size: 11px;
    padding: 3px 6px;
  }
}
</style>
