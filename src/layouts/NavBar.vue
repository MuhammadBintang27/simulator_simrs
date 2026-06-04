<template>
  <nav class="main-header navbar navbar-expand navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" href="#" role="button" @click.prevent="toggleSidebar">
          <i class="fas fa-bars"></i>
        </a>
      </li>
      <li class="nav-item d-none d-sm-inline-block">
        <a href="#" class="nav-link"
          ><p style="font-weight: bold; color: black">
            <Tag severity="warning">{{ company }}</Tag>
          </p></a
        >
      </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
      <li class="nav-item dropdown">
        <a class="nav-link" data-toggle="dropdown" href="#">
          <i class="far fa-comments"></i>
          <!-- <span class="badge badge-danger navbar-badge">3</span> -->
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="media">
              <img
                src="/adminlte/dist/img/user1-128x128.jpg"
                alt="User Avatar"
                class="img-size-50 mr-3 img-circle"
              />
              <div class="media-body">
                <h3 class="dropdown-item-title">
                  Brad Diesel
                  <span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>
                </h3>
                <p class="text-sm">Call me whenever you can...</p>
                <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>

          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <!-- Message Start -->
            <div class="media">
              <img
                src="/adminlte/dist/img/user3-128x128.jpg"
                alt="User Avatar"
                class="img-size-50 img-circle mr-3"
              />
              <div class="media-body">
                <h3 class="dropdown-item-title">
                  Nora Silvester
                  <span class="float-right text-sm text-warning"><i class="fas fa-star"></i></span>
                </h3>
                <p class="text-sm">The subject goes here</p>
                <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
              </div>
            </div>
            <!-- Message End -->
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item dropdown-footer">See All Messages</a>
        </div>
      </li>

      <li class="nav-item dropdown">
        <a class="nav-link" data-toggle="dropdown" href="#">
          <p style="color: black">
            <Tag> {{ user_name }}</Tag>
          </p>
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
          <div class="dropdown-divider"></div>
          <a @click="logout" class="dropdown-item"> <i class="fas fa-user mr-2"></i> Logout</a>
          <div class="dropdown-divider"></div>
        </div>
      </li>

      <!-- Notifications Dropdown Menu -->
    </ul>
  </nav>
</template>
<script setup>
import { onMounted } from 'vue'
import { useAuthStore, useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const configStore = useConfigStore()
const { user_name, company } = storeToRefs(authStore)

const toggleSidebar = () => {
  if (window.innerWidth <= 768) {
    configStore.toggleMobileSidebar()
  } else {
    configStore.toggleSidebar()
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('token_expires_at')
  authStore.clearAuthData()
  window.location.href = '/login'
}
</script>
