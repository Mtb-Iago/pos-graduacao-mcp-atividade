import { Injectable } from '@nestjs/common';
import { RankingsRepository } from '../domain/rankings.repository.js';

@Injectable()
export class RankingsService {
    constructor(private readonly repo: RankingsRepository) {}

    async getGeral() {
        return this.repo.findGeral();
    }

    async getPorCategoria(id: number) {
        return this.repo.findByCategoria(id);
    }
}
