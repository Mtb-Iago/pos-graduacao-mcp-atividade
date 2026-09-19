import { Module } from '@nestjs/common';
import { AtletasController } from './interface/atletas.controller.js';
import { AtletasService } from './application/atletas.service.js';
import { AtletasRepository } from './domain/atletas.repository.js';
import { PgAtletasDatabase } from './infrastructure/pg-atletas.database.js';

@Module({
  controllers: [AtletasController],
  providers: [
    AtletasService,
    { provide: AtletasRepository, useClass: PgAtletasDatabase }
  ],
})
export class AppModule {}
