import { IsOptional, Matches } from 'class-validator';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export class GetAnalyticsDto {
  @IsOptional()
  @Matches(datePattern, { message: 'fromDate must use YYYY-MM-DD format.' })
  fromDate?: string;

  @IsOptional()
  @Matches(datePattern, { message: 'toDate must use YYYY-MM-DD format.' })
  toDate?: string;
}
