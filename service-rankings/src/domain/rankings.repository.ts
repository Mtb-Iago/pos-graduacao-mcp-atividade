
export abstract class RankingsRepository {
    abstract findGeral(): Promise<any[]>;
    abstract findByCategoria(id: number): Promise<any[]>;
}
