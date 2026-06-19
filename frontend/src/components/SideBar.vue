<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound,
  Clock,
  Fold,
  Expand // ✅ 替代 FoldRight
} from '@element-plus/icons-vue'
import { clearHistory } from '@/api/travel'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()

const { userId, messageCount, sidebarCollapsed } = storeToRefs(chatStore)

const menus = [
  { key: '/', label: '旅行规划', icon: ChatDotRound },
  { key: '/history', label: '历史记录', icon: Clock }
]

// ✅ 图标计算（优化点）
const toggleIcon = computed(() =>
  sidebarCollapsed.value ? Expand : Fold
)

const onClearAll = async () => {
  try {
    await ElMessageBox.confirm('确定清除所有对话历史吗？', '提示', {
      type: 'warning',
      confirmButtonText: '清除',
      cancelButtonText: '取消'
    })

    chatStore.clearMessages()
    await clearHistory(userId.value)

    ElMessage.success('已清除所有对话历史')
  } catch {
    // 用户取消
  }
}

const toggleSidebar = () => {
  chatStore.toggleSidebar()
}
</script>

<template>
  <div :class="['sidebar', { collapsed: sidebarCollapsed }]">
    <!-- LOGO -->
    <div class="logo">
      <span class="logo-text">旅途Agent</span>

      <el-button
        class="toggle-button"
        type="text"
        size="small"
        @click="toggleSidebar"
      >
        <el-icon>
          <component :is="toggleIcon" />
        </el-icon>
        <span>{{ sidebarCollapsed ? '菜单' : '菜单' }}</span>
      </el-button>
    </div>

    <!-- 统计 -->
    <div class="stat-card" v-show="!sidebarCollapsed">
      <div class="stat-num">{{ messageCount }}</div>
      <div class="stat-label">本次消息数</div>
    </div>

    <!-- 菜单 -->
    <nav class="nav">
      <div
        v-for="m in menus"
        :key="m.key"
        :class="['nav-item', { active: route.path === m.key }]"
        @click="router.push(m.key)"
      >
        <el-icon class="nav-icon">
          <component :is="m.icon" />
        </el-icon>
        <span class="nav-label">{{ m.label }}</span>
      </div>
    </nav>

    <!-- 底部 -->
    <div class="footer">
      <el-button type="primary" @click="onClearAll" style="width: 100%">
        清除历史
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
  transition: width 0.28s ease, padding 0.28s ease;
}

.sidebar.collapsed {
  width: 72px;
  padding: 24px 0;
}

.logo {
  display: flex;
  align-items: center;
  padding: 0 24px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar.collapsed .logo {
  justify-content: center;
  padding: 0 0 24px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
  visibility: hidden;
}

.toggle-button {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.75);
}

.sidebar.collapsed .toggle-button {
  width: 100%;
  justify-content: center;
}

.stat-card {
  margin: 16px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  text-align: center;
}

.sidebar.collapsed .stat-card {
  display: none;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #40a9ff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.nav {
  flex: 1;
  padding: 8px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  border-left: 3px solid transparent;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
}

.sidebar.collapsed .nav-item span {
  display: none;
}

.nav-item.active {
  background: rgba(24, 144, 255, 0.18);
  border-left-color: #1890ff;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.footer {
  padding: 18px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar.collapsed .footer {
  display: none;
}
</style>