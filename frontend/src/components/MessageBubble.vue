<script setup>
import { computed } from 'vue'
const props = defineProps({ message: { type: Object, required: true } })
const isUser = computed(() => props.message.role === 'user')

const renderedContent = computed(() => {
  let t = props.message.content || ''
  t = t.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>')
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/^## (.+)$/gm, '<h3>$1</h3>')
  t = t.replace(/^# (.+)$/gm, '<h2>$1</h2>')
  t = t.replace(/\n/g, '<br>')
  return t
})
</script>

<template>
  <div :class="['msg-row', isUser && 'user-row']">
    <div :class="['bubble', isUser ? 'user-bubble' : 'ai-bubble']">
      <div class="content" v-html="renderedContent" />
      <div class="time">{{ message.time }}</div>
    </div>
  </div>
</template>

<style scoped>
.msg-row { display: flex; margin-bottom: 16px; }
.user-row { justify-content: flex-end; }
.bubble { max-width: 72%; padding: 16px 18px; border-radius: 16px; word-break: break-word; line-height: 1.7; }
.ai-bubble { background: #fff; border: 1px solid #e8edf2; }
.user-bubble { background: #e8f1ff; color: #172431; }
.content :deep(strong) { font-weight: 600; }
.content :deep(h2), .content :deep(h3) { margin: 8px 0 4px; font-size: 15px; }
.content :deep(code) { background: rgba(0,0,0,.08); padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 13px; }
.content :deep(pre) { background: #f8f9fa; padding: 10px; border-radius: 6px; overflow-x: auto; margin: 8px 0; }
.content :deep(pre code) { background: none; padding: 0; }
.user-bubble .content :deep(code) { background: rgba(255,255,255,.2); }
.time { font-size: 11px; color: #c0c4cc; margin-top: 6px; text-align: right; }
.user-bubble .time { color: rgba(255,255,255,.7); }
</style>
