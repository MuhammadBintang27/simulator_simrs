<template>
  <!-- Site wrapper -->
  <div class="wrapper">
    <!-- Navbar -->
    <NavBar />
    <!-- /.navbar -->

    <!-- Main Sidebar Container -->
    <Sidebar />
    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
      <!-- Content Header (Page header) -->

      <!-- /.container-fluid -->
      <router-view></router-view>

      <!-- Main content -->
      <!-- <AboutView /> -->
      <!-- /.content -->
    </div>
    <!-- /.content-wrapper -->

    <footer class="main-footer" style="font-size: 11px">
      <div class="float-right">
        <strong style="color: red">{{ config.getMode }}</strong>
        <b>Version</b> 3.2.0
      </div>

      <strong>Copyright &copy; 2014-2021 <a href="https://adminlte.io">POINTMEDIC</a>.</strong>
      All rights reserved.
    </footer>

    <!-- Control Sidebar -->
    <aside class="control-sidebar control-sidebar-dark">
      <!-- Control sidebar content goes here -->
    </aside>
    <!-- /.control-sidebar -->
  </div>
  <!-- ./wrapper -->
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore, useConfigStore } from '@/stores/config' // Adjust path based on your project structure
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { id_client, user_name, company } = storeToRefs(authStore) // Makes it reactive

const config = useConfigStore()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('token_expires_at')
  authStore.clearAuthData()
  window.location.href = '/login' // Redirect to login
}
</script>
