import type { Property } from '~/types/property'
import { propertyService } from '~/services/property.service'
import { defineStore } from 'pinia'

interface PropertyState {
    properties: Property[]
    loading: boolean
}

export const usePropertyStore = defineStore('property', {
    state: (): PropertyState => ({
        properties: [],
        loading: false
    }),

    actions: {
        async load() {
            this.loading = true
            this.properties = await propertyService.getAll()
            this.loading = false
        }
    }
})