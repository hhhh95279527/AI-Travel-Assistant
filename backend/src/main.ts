import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { config } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: config.server.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
  app.setGlobalPrefix('api')
  await app.listen(config.server.port)
  console.log(`\n✅ 旅途 AI 服务已启动：http://localhost:${config.server.port}`)
  console.log(`   前端地址：${config.server.corsOrigin}\n`)
}
bootstrap()
