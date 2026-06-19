import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import {ChatOllama} from '@langchain/ollama';
import { config } from '../config'

// 景点信息

const ATTRACTIONS_DB: Record<string, any[]> = {
  '东京': [
    { name: '浅草寺', type: '文化', duration: '1-2小时', ticket: '免费', tips: '早上8点前人少，可体验抽签占卜' },
    { name: '新宿御苑', type: '自然', duration: '2-3小时', ticket: '￥500', tips: '春季赏樱最佳，秋季红叶也很美' },
    { name: '筑地场外市场', type: '美食', duration: '2小时', ticket: '免费', tips: '早上6点开始，海鲜最新鲜' },
    { name: '秋叶原', type: '购物', duration: '2-4小时', ticket: '免费', tips: '电子产品和动漫周边的天堂' },
    { name: '明治神宫', type: '文化', duration: '1小时', ticket: '免费', tips: '森林环境清幽，适合晨练' },
    { name: '涉谷十字路口', type: '体验', duration: '30分钟', ticket: '免费', tips: '全球最忙碌路口，适合拍照' },
  ],
  '巴黎': [
    { name: '埃菲尔铁塔', type: '地标', duration: '2-3小时', ticket: '€26-29', tips: '提前网上预订，避免排队1-2小时' },
    { name: '卢浮宫', type: '文化', duration: '3-4小时', ticket: '€17', tips: '蒙娜丽莎在713室，建议租语音导览' },
    { name: '凡尔赛宫', type: '历史', duration: '半天', ticket: '€20', tips: '需要提前半天，花园免费' },
    { name: '蒙马特高地', type: '文化', duration: '2-3小时', ticket: '免费', tips: '艺术家聚集地，可定制肖像画' },
    { name: '奥赛博物馆', type: '文化', duration: '2-3小时', ticket: '€16', tips: '印象派画作最全，莫奈梵高作品众多' },
  ],
  '曼谷': [
    { name: '大皇宫&玉佛寺', type: '文化', duration: '2-3小时', ticket: '500铢', tips: '需着装保守，禁止穿短裤背心' },
    { name: '考山路', type: '娱乐', duration: '晚上', ticket: '免费', tips: '背包客天堂，酒吧美食按摩集中' },
    { name: '恰图恰市场', type: '购物', duration: '半天', ticket: '免费', tips: '仅周六日开放，上午最凉快' },
    { name: '卧佛寺', type: '文化', duration: '1小时', ticket: '200铢', tips: '46米长卧佛震撼，泰式按摩发源地' },
  ],
  '巴厘岛': [
    { name: '乌布皇宫', type: '文化', duration: '1小时', ticket: '免费', tips: '每天晚上有克差舞表演' },
    { name: '德格拉朗梯田', type: '自然', duration: '2小时', ticket: '小费制', tips: '日出时分最美，带防晒霜' },
    { name: '库塔海滩', type: '自然', duration: '半天', ticket: '免费', tips: '冲浪胜地，日落景色绝美' },
    { name: '乌鲁瓦图寺', type: '文化', duration: '2小时', ticket: '约10万卢比', tips: '悬崖神庙，注意猴子抢东西' },
  ],
}

export const attractionsTool = tool(
  async ({ city, interests, limit = 5 }: { city: string; interests?: string[]; limit?: number }) => {
    const cityKey = Object.keys(ATTRACTIONS_DB).find(k => city.includes(k) || k.includes(city))
    let attractions = cityKey ? ATTRACTIONS_DB[cityKey] : null

    if (!attractions) {
      // const llm = new ChatOpenAI({
      //   model: config.llm.model,
      //   apiKey: config.llm.apiKey,
      //   configuration: { baseURL: config.llm.baseURL },
      //   temperature: 0.5,
      // })
      const llm = new ChatOllama({
        model: config.llm.model,
        baseUrl: config.llm.baseURL, // ✅ 注意是 baseUrl
        temperature: 0.5,
        think: false,
      });
      const resp = await llm.invoke(
        `请列出${city}最值得去的${limit}个景点，每个包含名称、类型、建议游览时长、门票、实用小贴士。只输出JSON数组：[{"name":"","type":"","duration":"","ticket":"","tips":""}]`
      )
      try {
        const json = resp.content.toString().replace(/```json\n?|\n?```/g, '').trim()
        attractions = JSON.parse(json)
      } catch {
        return `${city}景点信息生成失败，建议搜索"${city}必去景点"获取最新信息`
      }
    }

    if (interests && interests.length > 0) {
      const filtered = attractions.filter((a: any) =>
        interests.some(i => a.type.includes(i) || a.name.includes(i))
      )
      if (filtered.length > 0) attractions = filtered
    }

    attractions = attractions.slice(0, limit)

    const list = attractions.map((a: any, i: number) =>
      `**${i + 1}. ${a.name}** [${a.type}]\n   ⏱ ${a.duration} | 🎫 ${a.ticket}\n   💡 ${a.tips}`
    ).join('\n\n')

    return `🏛️ **${city}精选景点**（${attractions.length}个）\n\n${list}\n\n> 门票价格可能变化，出行前请确认`
  },
  {
    name: 'get_attractions',
    description: '查询目的地热门景点，返回景点名称、类型、游览时长、门票、实用贴士。用户询问景点时调用。',
    schema: z.object({
      city: z.string().describe('目的地城市'),
      interests: z.array(z.string()).optional().describe('兴趣偏好，如：["文化","美食","购物"]'),
      limit: z.number().optional().describe('返回数量，默认5个'),
    }),
  },
)
