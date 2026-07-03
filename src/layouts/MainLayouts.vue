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
    </div>
    <!-- /.content-wrapper -->

    <footer class="main-footer" style="font-size: 11px">
      <div class="float-right">
        <span v-if="config.getMode == 'development'"
          >{{ config.apiBaseUrl }} || {{ config.apiApotikUrl }}</span
        >
        <strong style="color: red" class="mr-1">{{ config.getMode }} </strong>
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
import { useConfigStore } from '@/stores/config'
import { useIdleSession } from '@/composables/useIdleSession'

const config = useConfigStore()

useIdleSession()
</script>
