import { tool } from '@langchain/core/tools'
import { z } from 'zod'

// 打包工具，用于旅行打包建议

export const packingTool = tool(
  async ({ destination, days, season, activities = [] }: {
    destination: string; days: number; season: string; activities?: string[]
  }) => {
    const isWarm = ['夏', '热带', '海滩', '东南亚'].some(k =>
      season.includes(k) || destination.includes(k) || activities.some(a => a.includes(k))
    )
    const hasBeach = activities.some(a => ['海滩', '潜水', '冲浪', '游泳'].includes(a))
    const hasHike = activities.some(a => ['徒步', '爬山', '登山'].includes(a))

    const list: Record<string, string[]> = {
      '📄 证件与财务': [
        '✅ 护照（确认有效期6个月以上）',
        '✅ 签证（如需要）',
        '✅ 机票/酒店订单打印版',
        '✅ 信用卡（建议带VISA或万事达）',
        '✅ 少量当地现金',
        '✅ 旅行保险单',
      ],
      '📱 电子设备': [
        '✅ 手机 + 充电线',
        '✅ 充电宝（不超过20000mAh，飞机可带）',
        '✅ 转换插头（各国插座不同，非常重要！）',
        '✅ 相机（如需要）',
        '✅ 耳机',
      ],
      '👕 衣物': isWarm ? [
        `✅ 短袖T恤 × ${Math.ceil(days * 0.7)} 件`,
        '✅ 短裤 × 2-3 条',
        '✅ 轻薄长裤 × 1（参观寺庙必备）',
        '✅ 舒适运动鞋',
        '✅ 凉鞋/拖鞋',
        '✅ 薄外套（商场/飞机冷气足）',
        ...(hasBeach ? ['✅ 泳衣 × 2套', '✅ 防晒衣'] : []),
      ] : [
        `✅ 上衣 × ${Math.ceil(days * 0.6)} 件`,
        `✅ 裤子 × ${Math.ceil(days * 0.4)} 条`,
        '✅ 厚外套/羽绒服',
        '✅ 保暖内衣',
        '✅ 围巾、手套、帽子',
        '✅ 防水靴子',
      ],
      '🧴 洗漱护肤': [
        '✅ 洗漱套装（100ml以内）',
        '✅ 防晒霜 SPF50+（热带必备）',
        '✅ 保湿乳液',
        '✅ 湿纸巾 & 纸巾',
      ],
      '💊 药品': [
        '✅ 创可贴、消炎药',
        '✅ 肠胃药（诺氟沙星）',
        '✅ 退烧感冒药',
        ...(isWarm ? ['✅ 防蚊液（热带必备！）'] : []),
      ],
      '🎒 旅行小物': [
        '✅ 充电宝',
        '✅ 颈枕（长途飞行）',
        '✅ 密封袋（分装液体）',
        '✅ 可折叠购物袋',
        ...(hasHike ? ['✅ 登山杖', '✅ 防水背包'] : []),
      ],
    }

    const result = Object.entries(list)
      .map(([cat, items]) => `**${cat}**\n${items.join('\n')}`)
      .join('\n\n')

    return `🎒 **${destination} ${days}天打包清单**（${season}季）\n\n${result}

**💡 打包建议：**
- 衣物按天数×0.7原则，避免过多
- 液体单瓶不超过100ml，放透明密封袋
- 贵重物品随身携带，不托运
- 留20%行李空间用于购物`
  },
  {
    name: 'generate_packing_list',
    description: '根据目的地、天数、季节和活动生成个性化打包清单。用户询问带什么行李时调用。',
    schema: z.object({
      destination: z.string().describe('目的地'),
      days: z.number().describe('旅行天数'),
      season: z.string().describe('季节：夏/冬/春/秋，或描述气候'),
      activities: z.array(z.string()).optional().describe('活动类型：海滩/徒步/购物/文化参观等'),
    }),
  },
)
