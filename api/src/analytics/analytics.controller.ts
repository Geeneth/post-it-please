import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsDto } from './dto/get-analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getAnalytics(@Query() query: GetAnalyticsDto) {
    return this.analyticsService.getAnalytics(query);
  }
}
