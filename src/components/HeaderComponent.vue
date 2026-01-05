<template>
  <div class="header-menu">
    <div class="header-left">
      <Button icon="pi pi-bars" @click="toggleSidebar" text rounded class="toggle-button" />
      <div class="app-title">LINK RENTAL</div>
    </div>

    <div class="header-right">
      <div class="notifications">
        <Button icon="pi pi-bell" text rounded badge="3" class="notification-button" />
      </div>

      <div class="user-menu">
        <Button @click="menu.toggle($event)" text rounded class="user-menu-button">
          <span class="user-info">
            <span class="username">{{ username }}</span>
            <i class="pi pi-angle-down"></i>
          </span>
          <Avatar icon="pi pi-user" size="normal" shape="circle" class="mr-2" />
        </Button>

        <Menu ref="menu" :model="items" :popup="true" class="user-dropdown" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'

const menu = ref()
const username = ref('John Doe')
const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  emit('toggle-sidebar')
}

const items = [
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => {
      // Handle profile click
    },
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => {
      // Handle settings click
    },
  },
  {
    separator: true,
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
      // Handle logout click
    },
  },
]
</script>

<style scoped>
.header-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  height: 60px;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-button {
  margin-right: 15px;
}

.app-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #103954;
}

.header-right {
  display: flex;
  align-items: center;
}

.notifications {
  margin-right: 15px;
}

.user-menu {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.username {
  margin-right: 5px;
  font-weight: 500;
}

:deep(.p-button.p-button-text) {
  color: #495057;
}

:deep(.p-button.p-button-text:hover) {
  background-color: #f8f9fa;
  color: #103954;
}

:deep(.p-menu) {
  min-width: 200px;
}
</style>
