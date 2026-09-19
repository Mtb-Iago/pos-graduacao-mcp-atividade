import { Injectable } from '@nestjs/common';
import { AtletasRepository } from '../domain/atletas.repository.js';

@Injectable()
export class AtletasService {
    constructor(private readonly repo: AtletasRepository) {}

    async getAtletas() {
        return this.repo.findAll();
    }

    async getCategorias() {
        return this.repo.findCategorias();
    }
}
