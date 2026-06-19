<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { streamChat } from '@/api/travel'
import MessageBubble from './MessageBubble.vue'
import QuickActions from './QuickActions.vue'

const chatStore = useChatStore()
const { messages, isLoading, userId } = storeToRefs(chatStore)

const inputText = ref('')
const messagesRef = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
}

watch(messages, scrollToBottom, { deep: true })
onMounted(scrollToBottom)

const sendMessage = async (text) => {
  const message = text || inputText.value.trim()
  if (!message || isLoading.value) return
  inputText.value = ''
  chatStore.setLoading(true)
  chatStore.addMessage('user', message)
  chatStore.addMessage('assistant', '')

  try {
    await streamChat({
      userId: userId.value,
      message,
      onChunk: (chunk) => chatStore.appendToLastAssistant(chunk),
      onDone: () => chatStore.setLoading(false),
      onError: (err) => {
        chatStore.updateLastAssistant(`❌ 请求失败：${err}`)
        chatStore.setLoading(false)
        ElMessage.error('连接失败，请检查后端是否启动（端口3000）')
      },
    })
  } catch (err) {
    chatStore.setLoading(false)
    ElMessage.error(err.message)
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
}
</script>

<template>
  <div class="chat-window">
    <div class="chat-header">
      <div class="header-left">
          <span class="logo">旅途 · AI 旅行规划助手</span>
        <el-tag type="success" size="small" effect="plain">AI 旅行规划师</el-tag>
      </div>
        <el-button type="text" size="small" @click="chatStore.clearMessages()">清空</el-button>
    </div>

    <QuickActions @select="sendMessage" />

    <div ref="messagesRef" class="messages">
      <TransitionGroup name="msg">
        <MessageBubble v-for="msg in messages" :key="msg.id" :message="msg" />
      </TransitionGroup>
      <div v-if="isLoading" class="typing">
        <span /><span /><span />
      </div>
    </div>

    <div class="input-area">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="输入你的旅行问题，Enter 发送（Shift+Enter 换行）"
        :disabled="isLoading"
        resize="none"
        @keydown="handleKeydown"
      />
      <el-button
        type="primary"
        :disabled="!inputText.trim() || isLoading"
        :loading="isLoading"
        @click="sendMessage()"
      >
        {{ isLoading ? '规划中...' : '发送' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; background: #ffffff; border-radius: 20px; box-shadow: 0 12px 32px rgba(15,23,42,.08); overflow: hidden; }
 .chat-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: #ffffff; border-bottom: 1px solid #f0f2f5; }
.header-left { display: flex; align-items: center; gap: 10px; }
.logo { font-size: 18px; font-weight: 700; color: #2c3e50; }
.messages { flex: 1; overflow-y: auto; padding: 16px; scroll-behavior: smooth; }
.messages::-webkit-scrollbar { width: 6px; }
.messages::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }
.typing { display: flex; gap: 6px; padding: 14px; }
.typing span { width: 8px; height: 8px; background: #1890ff; border-radius: 50%; animation: bounce 1.1s infinite; }
.typing span:nth-child(2) { animation-delay: .2s; }
.typing span:nth-child(3) { animation-delay: .4s; }
@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
.input-area { display: flex; gap: 10px; padding: 18px 24px; background: #ffffff; border-top: 1px solid #f0f2f5; align-items: flex-end; }
.input-area .el-input { flex: 1; }
.input-area .el-button { height: 56px; min-width: 96px; }
.msg-enter-active { transition: all .3s ease; }
.msg-enter-from { opacity: 0; transform: translateY(10px); }
</style>
