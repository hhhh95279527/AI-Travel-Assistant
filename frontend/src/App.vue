<script setup>
import { onMounted } from 'vue'
import { ElNotification } from 'element-plus'

onMounted(async () => {
  try {
    await fetch('/api/agent/health')
  } catch {
    ElNotification({
      title: '连接提示',
      message: '后端服务连接失败，请确认 NestJS 服务已在 3000 端口启动',
      type: 'warning',
      duration: 6000,
    })
  }
})
</script>

<template>
  <router-view />
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif; }
body { background: #f0f2f5; color: #1f2d3d; line-height: 1.6; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
</style>
