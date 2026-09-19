
import { Injectable } from '@nestjs/common';
import { RankingsRepository } from '../domain/rankings.repository.js';
import { Pool } from 'pg';

@Injectable()
export class PgRankingsDatabase implements RankingsRepository {
    private pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    async findGeral(): Promise<any[]> {
        const res = await this.pool.query("SELECT * FROM resultados WHERE status = 'Finalizou' ORDER BY tempo_prova ASC");
        return res.rows;
    }
    
    async findByCategoria(id: number): Promise<any[]> {

        return this.findGeral(); 
    }
}
