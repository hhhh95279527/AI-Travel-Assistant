import { Controller, Post, Get, Delete, Body, Param, Res, HttpCode } from '@nestjs/common'
import type { Response } from 'express'
import { AgentService } from './agent.service'
import { MemoryService } from '../memory/memory.service'
import { config } from '../config'

@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly memoryService: MemoryService,
  ) {}

  @Post('chat/stream')
  async streamChat(@Body() body: { userId: string; message: string }, @Res() res: Response) {
    const { userId = 'default', message } = body
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('X-Accel-Buffering', 'no')

    try {
      for await (const chunk of this.agentService.streamChat(userId, message)) {
        res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
      }
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
    } catch (error) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error instanceof Error ? error.message : '未知错误' })}\n\n`)
    } finally {
      res.end()
    }
  }

  @Post('chat')
  @HttpCode(200)
  async chat(@Body() body: { userId: string; message: string }) {
    const { userId = 'default', message } = body
    const answer = await this.agentService.chat(userId, message)
    return { userId, message, answer }
  }

  @Get('history/:userId')
  getHistory(@Param('userId') userId: string) {
    const history = this.memoryService.getHistory(userId)
    return {
      userId, count: history.length,
      messages: history.map((m, i) => ({
        index: i,
        role: m.constructor.name === 'HumanMessage' ? 'user' : 'assistant',
        content: m.content,
      })),
    }
  }

  @Delete('history/:userId')
  clearHistory(@Param('userId') userId: string) {
    this.memoryService.clearHistory(userId)
    return { success: true, message: `用户 ${userId} 的对话历史已清除` }
  }

  @Get('sessions')
  listSessions() { return this.memoryService.listSessions() }

  @Get('tools')
  getTools() {
    return {
      tools: [
        { name: 'get_weather', desc: '查询目的地天气和穿衣建议' },
        { name: 'get_attractions', desc: '推荐景点和目的地信息' },
        { name: 'generate_itinerary', desc: '生成逐日详细行程' },
        { name: 'calculate_budget', desc: '估算旅行总费用' },
        { name: 'check_visa', desc: '查询签证要求' },
        { name: 'convert_currency', desc: '货币换算和消费参考' },
        { name: 'generate_packing_list', desc: '生成打包清单' },
        { name: 'translate_phrases', desc: '旅行常用短语翻译' },
      ],
    }
  }

  @Get('health')
  health() {
    return { status: 'ok', service: '旅途 AI 旅行规划助手', llmProvider: config.llm.provider, model: config.llm.model, time: new Date().toISOString() }
  }
}
