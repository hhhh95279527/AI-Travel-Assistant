import { Module } from '@nestjs/common'
import { MemoryModule } from './memory/memory.module'
import { AgentModule } from './agent/agent.module'
import { ToolsModule } from './tools/tools.module'
@Module({ imports: [MemoryModule, AgentModule, ToolsModule] })
export class AppModule {}
