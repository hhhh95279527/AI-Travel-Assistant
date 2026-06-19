import 'dotenv/config'

export type LLMProvider = 'ollama' | 'deepseek'
const provider = (process.env.LLM_PROVIDER || 'ollama') as LLMProvider

const ollamaConfig = {
  provider: 'ollama' as LLMProvider,
  apiKey: 'ollama',
  // baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
  // model: process.env.OLLAMA_MODEL || 'qwen3.5:0.8b',
  baseURL: 'http://localhost:11434',
  model: 'qwen3.5:0.8b',
  temperature: 0.7,
  label: 'Ollama 本地',
}

const deepseekConfig = {
  temperature: 0.7,
  provider: 'deepseek' as LLMProvider,
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  label: 'DeepSeek 云端',
}

export const llmConfig = provider === 'deepseek' ? deepseekConfig : ollamaConfig

console.log(`\n大模型：${llmConfig.label} → ${llmConfig.model}`)
console.log(`   Provider: ${provider}`)
console.log(`   API Key: ${llmConfig.apiKey ? llmConfig.apiKey.substring(0, 10) + '...' : '未设置'}`)
if (provider === 'deepseek' && !llmConfig.apiKey) {
  console.warn(' DEEPSEEK_API_KEY 未配置！请在 .env 中填入 API Key')
} else if (provider === 'ollama') {
  console.log(`   Ollama 地址：${llmConfig.baseURL}`)
  console.log(`   请确认已执行：ollama pull ${llmConfig.model}`)
}

export const config = {
  llm: llmConfig,
  server: {
    port: parseInt(process.env.PORT || '3000'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  agent: {
    temperature: parseFloat(process.env.CHAT_TEMPERATURE || '0.7'),
    maxIterations: parseInt(process.env.MAX_ITERATIONS || '6'),
  },
  weather: { apiKey: process.env.WEATHER_API_KEY || '' },
}
