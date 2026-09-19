
import { Injectable } from '@nestjs/common';
import { AtletasRepository } from '../domain/atletas.repository.js';
import { Pool } from 'pg';

@Injectable()
export class PgAtletasDatabase implements AtletasRepository {
    private pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    async findAll(): Promise<any[]> {
        const res = await this.pool.query('SELECT a.id, a.nome, c.nome as categoria FROM atletas a JOIN categorias c ON a.categoria_id = c.id');
        return res.rows;
    }
    
    async findCategorias(): Promise<any[]> {
        const res = await this.pool.query('SELECT * FROM categorias');
        return res.rows;
    }
}
