import { Injectable, OnModuleInit } from '@nestjs/common'
import { ChatOpenAI } from '@langchain/openai'
import {ChatOllama} from '@langchain/ollama';
import { StateGraph, END, START, MessagesAnnotation } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { config } from '../config'
import { MemoryService } from '../memory/memory.service'
import { weatherTool } from '../tools/weather.tool'
import { attractionsTool } from '../tools/attractions.tool'
import { itineraryTool } from '../tools/itinerary.tool'
import { budgetTool } from '../tools/budget.tool'
import { visaTool } from '../tools/visa.tool'
import { currencyTool } from '../tools/currency.tool'
import { packingTool } from '../tools/packing.tool'
import { translatorTool } from '../tools/translator.tool'

const SYSTEM_PROMPT = `你是「旅途」AI旅行规划师，专业、热情的旅行助手。
不要输出思考过程，不要输出推理步骤，不要解释过程，直接给出最终答案。

可用工具：
- get_weather：查询目的地天气和穿衣建议
- get_attractions：推荐景点和目的地信息
- generate_itinerary：生成逐日详细行程
- calculate_budget：估算旅行总费用
- check_visa：查询签证要求
- convert_currency：货币换算和消费参考
- generate_packing_list：生成打包清单
- translate_phrases：旅行常用短语翻译

工作原则：
1. 根据用户需求主动使用合适工具，不要等用户指定
2. 复杂问题串联多个工具（如：查景点→生成行程→估算预算）
3. 回答热情友好，不使用 emoji
4. 使用中文回答
5. 输出的内容不要ai化，要像旅行达人一样分享经验和建议`

@Injectable()
export class AgentService implements OnModuleInit {
  private graph: any
  private tools: any[]

  constructor(private readonly memoryService: MemoryService) {}

  onModuleInit() {
    this.tools = [
      weatherTool, attractionsTool, itineraryTool,
      budgetTool, visaTool, currencyTool,
      packingTool, translatorTool,
    ]

    // 根据配置选择 LLM
    const llm = config.llm.provider === 'deepseek'
      ? new ChatOpenAI({
          model: config.llm.model,
          apiKey: config.llm.apiKey,
          configuration: { baseURL: config.llm.baseURL },
          temperature: config.agent.temperature,
          streaming: true,
          maxTokens: 512,
        })
      : new ChatOllama({
          streaming: true,
          model: config.llm.model,
          temperature: config.llm.temperature,
          baseUrl: config.llm.baseURL,
          think: false,
          numPredict: 512,
        }) 


    const llmWithTools = llm.bindTools(this.tools)
    const toolNode = new ToolNode(this.tools)

    const shouldContinue = (state: typeof MessagesAnnotation.State) => {
      const last = state.messages[state.messages.length - 1] as AIMessage
      return (last.tool_calls && last.tool_calls.length > 0) ? 'tools' : END
    }

    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const messages = [new SystemMessage(SYSTEM_PROMPT), ...state.messages]
      const response = await llmWithTools.invoke(messages)
      return { messages: [response] }
    }

    this.graph = new StateGraph(MessagesAnnotation)
      .addNode('agent', callModel)
      .addNode('tools', toolNode)
      .addEdge(START, 'agent')
      .addConditionalEdges('agent', shouldContinue, { tools: 'tools', [END]: END })
      .addEdge('tools', 'agent')
      .compile()

    console.log(`✅ LangGraph Agent 已初始化，工具数：${this.tools.length}`)
  }

  async *streamChat(userId: string, message: string): AsyncGenerator<string> {
    const history = this.memoryService.getHistory(userId)
    const messages = [...history, new HumanMessage(message)]
    let fullContent = ''

    try {
      const stream = await this.graph.stream(
        { messages },
        { streamMode: 'messages', recursionLimit: config.agent.maxIterations * 2 }
      )

      for await (const [msg, meta] of stream) {
        if (msg.content && meta.langgraph_node === 'agent') {
          const chunk = typeof msg.content === 'string' ? msg.content : ''
          if (chunk) { fullContent += chunk; yield chunk }
        }
      }

      this.memoryService.addMessage(userId, new HumanMessage(message))
      this.memoryService.addMessage(userId, new AIMessage(fullContent))
    } catch (error) {
      yield `\n\n抱歉，处理请求时出错：${(error as Error).message || '未知错误'}`
    }
  }

  async chat(userId: string, message: string): Promise<string> {
    const history = this.memoryService.getHistory(userId)
    const result = await this.graph.invoke(
      { messages: [...history, new HumanMessage(message)] },
      { recursionLimit: config.agent.maxIterations * 2 }
    )
    const lastAI = [...result.messages].reverse().find((m: any) => m instanceof AIMessage)
    const content = lastAI?.content?.toString() || '抱歉，无法处理您的请求'
    this.memoryService.addMessage(userId, new HumanMessage(message))
    this.memoryService.addMessage(userId, new AIMessage(content))
    return content
  }
}
