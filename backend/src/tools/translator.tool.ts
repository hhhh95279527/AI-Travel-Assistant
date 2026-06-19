import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import {ChatOllama} from '@langchain/ollama';
import { config } from '../config'

// 翻译常用短语

const PHRASES: Record<string, Record<string, string>> = {
  '日语': {
    '你好': 'こんにちは（Konnichiwa）',
    '谢谢': 'ありがとうございます（Arigatou gozaimasu）',
    '对不起': 'すみません（Sumimasen）',
    '多少钱': 'いくらですか（Ikura desu ka）',
    '在哪里': 'どこですか（Doko desu ka）',
    '帮帮我': 'たすけてください（Tasukete kudasai）',
    '结账': 'おかいけいをおねがいします（Okaikei wo onegaishimasu）',
    '好吃': 'おいしい（Oishii）',
  },
  '泰语': {
    '你好': 'สวัสดี（Sawasdee krab/ka）',
    '谢谢': 'ขอบคุณ（Khob khun）',
    '多少钱': 'ราคาเท่าไร（Raka thao rai）',
    '不要辣': 'ไม่เผ็ด（Mai phet）',
    '好的': 'ตกลง（Tok long）',
  },
  '韩语': {
    '你好': '안녕하세요（Annyeonghaseyo）',
    '谢谢': '감사합니다（Gamsahamnida）',
    '多少钱': '얼마예요（Eolmayeyo）',
    '好吃': '맛있어요（Massisseoyo）',
    '在哪里': '어디예요（Eodiyeyo）',
  },
}

const LANG_MAP: Record<string, string> = {
  '日本': '日语', '东京': '日语', '大阪': '日语', '京都': '日语',
  '泰国': '泰语', '曼谷': '泰语', '清迈': '泰语',
  '韩国': '韩语', '首尔': '韩语',
  '法国': '法语', '巴黎': '法语',
}

export const translatorTool = tool(
  async ({ text, target_language, destination }: {
    text?: string; target_language?: string; destination?: string
  }) => {
    const language = target_language ||
      (destination ? Object.entries(LANG_MAP).find(([k]) => destination.includes(k))?.[1] : null) || '英语'

    // 返回内置常用短语
    const phrases = PHRASES[language]
    if ((!text || text.includes('常用') || text.includes('短语')) && phrases) {
      const list = Object.entries(phrases)
        .map(([zh, trans]) => `**${zh}** → ${trans}`)
        .join('\n')
      return `🗣️ **旅行${language}常用短语**\n\n${list}\n\n💡 在当地多说几句当地语，会让当地人更热情！`
    }

    // 调用 AI 翻译
    // const llm = new ChatOpenAI({
    //   model: config.llm.model,
    //   apiKey: config.llm.apiKey,
    //   configuration: { baseURL: config.llm.baseURL },
    //   temperature: 0.3,
    // })
    const llm = new ChatOllama({
      model: config.llm.model,
      baseUrl: config.llm.baseURL, // ✅ 注意是 baseUrl
      temperature: 0.5,
      think: false,
    });

    const resp = await llm.invoke(
      `请将"${text}"翻译成${language}，提供：翻译、发音（罗马字/拼音）、适用场合。格式简洁。`
    )
    return `🗣️ **旅行翻译**\n\n原文：${text}\n目标语言：${language}\n\n${resp.content}`
  },
  {
    name: 'translate_phrases',
    description: '提供旅行常用短语翻译和发音指导。用户询问怎么说某句话、当地语言时调用。',
    schema: z.object({
      text: z.string().optional().describe('要翻译的中文'),
      target_language: z.string().optional().describe('目标语言：日语/泰语/韩语/法语/英语'),
      destination: z.string().optional().describe('目的地（可从目的地推断语言）'),
    }),
  },
)
