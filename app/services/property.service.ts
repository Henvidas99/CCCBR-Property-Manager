import { useApi } from '../composables/useApi'
import type { Property } from '../types/property'


export const propertyService = {
    async getAll(): Promise<Property[]> {
        const { request } = useApi()
        return request<Property[]>('/properties')
    }
}