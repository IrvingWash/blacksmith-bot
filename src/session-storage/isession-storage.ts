// biome-ignore lint/style/useNamingConvention: Interface prefix
export interface ISessionStorage<D extends {}> {
    load(key: string, userId: string): Promise<D | undefined>;
    save(key: string, userId: string, data: D): Promise<void>;
    clear(key: string, userId: string): Promise<void>;
}
