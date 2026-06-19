import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([{
    id: Date.now(),
    role: 'assistant',
    content: `你好！我是**旅途**，你的 AI 旅行规划师！

我可以帮你：
规划详细逐日行程
查询目的地天气
估算旅行预算
确认签证要求
生成打包清单
货币换算
旅行短语翻译

告诉我你想去哪里，玩几天，我来帮你搞定！`,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }])

  const isLoading = ref(false)
  const userId = ref(`user_${Date.now()}`)
  const messageCount = computed(() => messages.value.length)
  const sidebarCollapsed = ref(false)

  function addMessage(role, content) {
    const msg = {
      id: Date.now() + Math.random(),
      role, content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    messages.value.push(msg)
    return msg
  }

  function updateLastAssistant(content) {
    const last = messages.value[messages.value.length - 1]
    if (last?.role === 'assistant') last.content = content
  }

  function appendToLastAssistant(chunk) {
    const last = messages.value[messages.value.length - 1]
    if (last?.role === 'assistant') last.content += chunk
  }

  function clearMessages() {
    messages.value = []
    addMessage('assistant', '对话已清除，随时开始新的旅行规划！')
  }

  function setLoading(val) { isLoading.value = val }

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }

  return { messages, isLoading, userId, messageCount, sidebarCollapsed, addMessage, updateLastAssistant, appendToLastAssistant, clearMessages, setLoading, toggleSidebar }
})
