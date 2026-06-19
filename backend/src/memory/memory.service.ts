import { Injectable } from '@nestjs/common'
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages'

@Injectable()
export class MemoryService {
  private sessions = new Map<string, BaseMessage[]>()
  private readonly MAX_HISTORY = 20

  getHistory(userId: string): BaseMessage[] {
    return this.sessions.get(userId) || []
  }

  addMessage(userId: string, message: BaseMessage) {
    const history = this.sessions.get(userId) || []
    history.push(message)
    if (history.length > this.MAX_HISTORY) history.splice(0, history.length - this.MAX_HISTORY)
    this.sessions.set(userId, history)
  }

  clearHistory(userId: string) { this.sessions.delete(userId) }

  listSessions() {
    return Array.from(this.sessions.entries()).map(([id, msgs]) => ({ userId: id, messageCount: msgs.length }))
  }
}
