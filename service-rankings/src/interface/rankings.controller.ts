import { Controller, Get, Param } from '@nestjs/common';
import { RankingsService } from '../application/rankings.service.js';

@Controller('rankings')
export class RankingsController {
    constructor(private readonly service: RankingsService) {}

    @Get('geral')
    async getGeral() { return this.service.getGeral(); }

    @Get('categoria/:id')
    async getPorCategoria(@Param('id') id: string) { return this.service.getPorCategoria(Number(id)); }
}
