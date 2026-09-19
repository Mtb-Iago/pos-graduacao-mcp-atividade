import { Controller, Get } from '@nestjs/common';
import { AtletasService } from '../application/atletas.service.js';

@Controller()
export class AtletasController {
    constructor(private readonly service: AtletasService) {}

    @Get('atletas')
    async getAtletas() { return this.service.getAtletas(); }

    @Get('categorias')
    async getCategorias() { return this.service.getCategorias(); }
}
