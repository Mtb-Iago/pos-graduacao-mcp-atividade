import { Controller, Get, Param } from '@nestjs/common';
import { ResultadosService } from '../application/resultados.service.js';

@Controller('resultados')
export class ResultadosController {
    constructor(private readonly service: ResultadosService) {}

    @Get()
    async getResultados() { return this.service.getResultados(); }

    @Get(':id')
    async getResultadoAtleta(@Param('id') id: string) { return this.service.getResultadoAtleta(Number(id)); }
}
