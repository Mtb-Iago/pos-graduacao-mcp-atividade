import { Module } from '@nestjs/common';
import { RankingsController } from './interface/rankings.controller.js';
import { RankingsService } from './application/rankings.service.js';
import { RankingsRepository } from './domain/rankings.repository.js';
import { PgRankingsDatabase } from './infrastructure/pg-rankings.database.js';

@Module({
  controllers: [RankingsController],
  providers: [
    RankingsService,
    { provide: RankingsRepository, useClass: PgRankingsDatabase }
  ],
})
export class AppModule {}
