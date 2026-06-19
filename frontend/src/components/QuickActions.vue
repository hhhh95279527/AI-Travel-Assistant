<script setup>
const emit = defineEmits(['select'])
const actions = [
  { label: '东京5天行程', text: '帮我规划一次东京5天旅行，喜欢文化和美食，预算中等' },
  { label: '巴厘岛攻略', text: '巴厘岛7天怎么玩？帮我查一下天气和签证要求' },
  { label: '巴黎旅行预算', text: '2个人去巴黎10天需要多少预算？包含机票' },
  { label: '日本签证', text: '我要去日本旅游，签证怎么办？需要哪些材料？' },
  { label: '泰国打包清单', text: '帮我生成一份去泰国7天的夏季打包清单' },
  { label: '日元换算', text: '1000人民币能换多少日元？在东京够花几天？' },
]
</script>

<template>
  <div class="quick-actions">
    <span class="label">快速提问：</span>
    <el-button v-for="a in actions" :key="a.label" size="small" plain @click="emit('select', a.text)">
      {{ a.label }}
    </el-button>
  </div>
</template>

<style scoped>
.quick-actions { display: flex; flex-wrap: wrap; gap: 10px; padding: 18px 22px; background: #ffffff; border-bottom: 1px solid #f0f2f5; align-items: center; }
.label { font-size: 13px; color: #4c5f76; }
.el-button { font-size: 13px; border-color: #d9e4ef; color: #1f2d3d; background: #f8fafc; }
.el-button:hover { background: #e8f0fb; color: #1f2d3d; border-color: #d9e4ef; }
</style>
