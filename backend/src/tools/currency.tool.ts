import { tool } from '@langchain/core/tools'
import { z } from 'zod'

// 货币工具，用于货币换算和消费参考

const RATES: Record<string, { rate: number; symbol: string; country: string }> = {
  'JPY': { rate: 0.048, symbol: '¥', country: '日本' },
  '日元': { rate: 0.048, symbol: '¥', country: '日本' },
  'USD': { rate: 7.25, symbol: '$', country: '美国' },
  '美元': { rate: 7.25, symbol: '$', country: '美国' },
  'EUR': { rate: 7.85, symbol: '€', country: '欧洲' },
  '欧元': { rate: 7.85, symbol: '€', country: '欧洲' },
  'GBP': { rate: 9.20, symbol: '£', country: '英国' },
  '英镑': { rate: 9.20, symbol: '£', country: '英国' },
  'THB': { rate: 0.21, symbol: '฿', country: '泰国' },
  '泰铢': { rate: 0.21, symbol: '฿', country: '泰国' },
  'IDR': { rate: 0.00046, symbol: 'Rp', country: '印尼' },
  '印尼卢比': { rate: 0.00046, symbol: 'Rp', country: '印尼' },
  'AUD': { rate: 4.72, symbol: 'A$', country: '澳大利亚' },
  '澳元': { rate: 4.72, symbol: 'A$', country: '澳大利亚' },
  'KRW': { rate: 0.0053, symbol: '₩', country: '韩国' },
  '韩元': { rate: 0.0053, symbol: '₩', country: '韩国' },
  'SGD': { rate: 5.38, symbol: 'S$', country: '新加坡' },
  '新加坡元': { rate: 5.38, symbol: 'S$', country: '新加坡' },
  'HKD': { rate: 0.93, symbol: 'HK$', country: '香港' },
  '港币': { rate: 0.93, symbol: 'HK$', country: '香港' },
}

const SPENDING_TIPS: Record<string, string> = {
  '日本': '每日约花费 5000-15000 日元（约240-720元）',
  '泰国': '每日约花费 500-2000 泰铢（约100-400元）',
  '印尼': '每日约花费 200000-600000 卢比（约90-280元）',
  '法国': '每日约花费 50-150 欧元（约390-1180元）',
  '美国': '每日约花费 80-200 美元（约580-1450元）',
  '澳大利亚': '每日约花费 100-250 澳元（约470-1180元）',
  '韩国': '每日约花费 50000-150000 韩元（约265-800元）',
}

export const currencyTool = tool(
  async ({ amount, from_currency, to_currency = 'CNY' }: {
    amount: number; from_currency: string; to_currency?: string
  }) => {
    const fromInfo = RATES[from_currency] || RATES[from_currency.toUpperCase()]
    if (!fromInfo) {
      return `暂不支持 ${from_currency} 的汇率换算。支持：日元、美元、欧元、英镑、泰铢、印尼卢比、澳元、韩元、港币、新加坡元`
    }

    const result = amount * fromInfo.rate
    const tip = Object.entries(SPENDING_TIPS).find(([k]) => fromInfo.country.includes(k))?.[1]

    return `💱 **汇率换算**

${fromInfo.symbol}${amount.toLocaleString()} ${from_currency}
≈ **¥${result.toFixed(2)} 人民币**

（参考汇率：1 ${from_currency} ≈ ¥${fromInfo.rate} 人民币）
${tip ? `\n**消费参考：** ${tip}` : ''}

> 汇率实时波动，以实际换汇为准，建议到目的地换小额现金，大额用信用卡`
  },
  {
    name: 'convert_currency',
    description: '货币换算，将外币换算为人民币，同时提供当地消费水平参考。用户询问汇率、换钱时调用。',
    schema: z.object({
      amount: z.number().describe('金额'),
      from_currency: z.string().describe('原始货币，如：日元、美元、欧元、泰铢'),
      to_currency: z.string().optional().describe('目标货币，默认人民币'),
    }),
  },
)
