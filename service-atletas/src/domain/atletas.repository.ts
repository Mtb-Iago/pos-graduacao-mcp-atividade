
export abstract class AtletasRepository {
    abstract findAll(): Promise<any[]>;
    abstract findCategorias(): Promise<any[]>;
}
