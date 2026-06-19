import { Controller, Post, Body } from '@nestjs/common'
import { weatherTool } from './weather.tool'
import { budgetTool } from './budget.tool'
import { visaTool } from './visa.tool'
import { currencyTool } from './currency.tool'

@Controller('tools')
export class ToolsController {
  @Post('weather')
  getWeather(@Body() body: { city: string }) {
    return weatherTool.invoke({ city: body.city })
  }

  @Post('budget')
  calculateBudget(@Body() body: any) {
    return budgetTool.invoke(body)
  }

  @Post('visa')
  checkVisa(@Body() body: { destination: string }) {
    return visaTool.invoke({ destination: body.destination })
  }

  @Post('currency')
  convertCurrency(@Body() body: any) {
    return currencyTool.invoke(body)
  }
}
