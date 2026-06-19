<script setup>
import SideBar from '@/components/SideBar.vue'
import ChatWindow from '@/components/ChatWindow.vue'
</script>

<template>
  <div class="layout">
    <SideBar />
    <main class="main"><ChatWindow /></main>
  </div>
</template>

<style scoped>
.layout { display: flex; height: 100vh; overflow: hidden; }
.main { flex: 1; overflow: hidden; background: #f0f2f5; padding: 24px; }
</style>
