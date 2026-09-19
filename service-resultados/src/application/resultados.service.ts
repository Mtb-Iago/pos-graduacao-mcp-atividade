import { Injectable } from '@nestjs/common';
import { ResultadosRepository } from '../domain/resultados.repository.js';

@Injectable()
export class ResultadosService {
    constructor(private readonly repo: ResultadosRepository) {}

    async getResultados() {
        return this.repo.findAll();
    }

    async getResultadoAtleta(id: number) {
        return this.repo.findByAtleta(id);
    }
}
