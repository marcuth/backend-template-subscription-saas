export interface ResourceService<T> {
    findOne(id: string): Promise<T | null>
}
