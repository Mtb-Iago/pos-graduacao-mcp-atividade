
import { Injectable } from '@nestjs/common';
import { ResultadosRepository } from '../domain/resultados.repository.js';
import { Pool } from 'pg';

@Injectable()
export class PgResultadosDatabase implements ResultadosRepository {
    private pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    async findAll(): Promise<any[]> {
        const res = await this.pool.query('SELECT * FROM resultados');
        return res.rows;
    }
    
    async findByAtleta(id: number): Promise<any> {
        const res = await this.pool.query('SELECT * FROM resultados WHERE atleta_id = $1', [id]);
        return res.rows[0];
    }
}
