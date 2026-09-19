
export abstract class ResultadosRepository {
    abstract findAll(): Promise<any[]>;
    abstract findByAtleta(id: number): Promise<any>;
}
