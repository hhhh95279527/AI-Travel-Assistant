<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/chat';
import { ElMessage } from 'element-plus';
import { getHistory, clearHistory } from '@/api/travel';
import SideBar from '@/components/SideBar.vue';

const router = useRouter();
const chatStore = useChatStore();
const { userId } = storeToRefs(chatStore);
const historyData = ref(null);
const loading = ref(false);

const loadHistory = async () => {
    loading.value = true;
    try {
        historyData.value = await getHistory(userId.value);
    } catch {
        ElMessage.error('获取历史失败');
    } finally {
        loading.value = false;
    }
};

const onClear = async () => {
    await clearHistory(userId.value);
    chatStore.clearMessages();
    ElMessage.success('历史已清除');
    historyData.value = { count: 0, messages: [] };
};

onMounted(loadHistory);
</script>

<template>
    <div class="layout">
        <SideBar />
        <main class="history-main">
            <div class="header">
                <div class="header-left">
                    <el-button @click="router.push('/')">返回对话</el-button>
                    <h2>对话历史</h2>
                </div>
                <el-button type="danger" plain @click="onClear">清除历史</el-button>
            </div>

            <div v-loading="loading" class="content">
                <template v-if="historyData">
                    <el-empty v-if="!historyData.messages?.length" description="暂无对话历史" />
                    <div v-else class="list">
                        <div v-for="(msg, i) in historyData.messages" :key="i" :class="['item', msg.role]">
                            <div class="item-header">
                                <span :class="['role-badge', msg.role]">{{
                                    msg.role === 'user' ? '我' : 'AI 旅行师'
                                }}</span>
                                <span style="font-size: 12px; color: #c0c4cc">#{{ i + 1 }}</span>
                            </div>
                            <div class="item-content">{{ msg.content }}</div>
                        </div>
                    </div>
                </template>
            </div>
        </main>
    </div>
</template>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    background: #f0f2f5;
}
.history-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 24px;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 24px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 18px rgba(15, 23, 42, 0.06);
}
.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}
.header-left h2 {
    margin: 0;
    font-size: 20px;
    color: #1f2d3d;
}
.content {
    flex: 1;
    overflow-y: auto;
    margin-top: 20px;
}
.list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 840px;
    margin: 0 auto;
}
.item {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid #e4e7ed;
}
.item.user {
    border-left: 3px solid #409eff;
}
.item.assistant {
    border-left: 3px solid #67c23a;
}
.item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.item-content {
    font-size: 14px;
    line-height: 1.7;
    color: #303133;
    white-space: pre-wrap;
}
.role-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    color: #4a5568;
    background: #eef2f7;
}
.role-badge.assistant {
    background: #e8f4ea;
    color: #2f5232;
}
</style>
