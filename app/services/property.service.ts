import { useApi } from '../composables/useApi'
import { Property } from '../types/property'


export const propertyService = {
    async getAll(): Promise<Property[]> {
        const { request } = useApi()
        return request<Property[]>('/properties')
    }
}