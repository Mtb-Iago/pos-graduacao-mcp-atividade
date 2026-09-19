import { Module } from '@nestjs/common';
import { ResultadosController } from './interface/resultados.controller.js';
import { ResultadosService } from './application/resultados.service.js';
import { ResultadosRepository } from './domain/resultados.repository.js';
import { PgResultadosDatabase } from './infrastructure/pg-resultados.database.js';

@Module({
  controllers: [ResultadosController],
  providers: [
    ResultadosService,
    { provide: ResultadosRepository, useClass: PgResultadosDatabase }
  ],
})
export class AppModule {}
