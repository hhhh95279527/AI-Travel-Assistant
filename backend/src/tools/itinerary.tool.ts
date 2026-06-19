import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import {ChatOllama} from '@langchain/ollama';
import { config } from '../config'

// 行程规划工具，根据用户需求生成旅行计划

export const itineraryTool = tool(
  async ({ destination, days, style = '平衡', budget_level = '中等', interests = [] }: {
    destination: string; days: number; style?: string; budget_level?: string; interests?: string[]
  }) => {
    // const llm = new ChatOpenAI({
    //   model: config.llm.model,
    //   apiKey: config.llm.apiKey,
    //   configuration: { baseURL: config.llm.baseURL },
    //   temperature: 0.7,
    // })
    const llm = new ChatOllama({
      model: config.llm.model,
      baseUrl: config.llm.baseURL, // ✅ 注意是 baseUrl
      temperature: 0.5,
      think: false,
    });

    const interestStr = interests.length > 0 ? `，偏好：${interests.join('、')}` : ''
    const resp = await llm.invoke(
      `你是专业旅行规划师，请为以下旅行生成详细行程：
目的地：${destination}，天数：${days}天，风格：${style}，预算：${budget_level}${interestStr}

每天包含：上午安排（9-12点）、午餐推荐、下午安排（13-17点）、晚餐、晚上活动、交通方式、当日预算。
格式清晰易读，用emoji增加可读性。`
    )
    return `📅 **${destination} ${days}天${style}行程规划**\n\n${resp.content}`
  },
  {
    name: 'generate_itinerary',
    description: '根据目的地、天数、旅行风格生成详细逐日行程，含景点、餐厅、交通和预算。用户要求规划行程时调用。',
    schema: z.object({
      destination: z.string().describe('目的地，如：东京、巴黎、巴厘岛'),
      days: z.number().describe('旅行天数'),
      style: z.string().optional().describe('旅行风格：慢节奏/深度/美食/文化/购物，默认平衡'),
      budget_level: z.string().optional().describe('预算档次：经济/中等/豪华，默认中等'),
      interests: z.array(z.string()).optional().describe('兴趣偏好列表'),
    }),
  },
)
