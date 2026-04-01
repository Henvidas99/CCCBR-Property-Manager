import type { PropertyListingSummaryDto } from '~/types/property'
import { useApi } from '../composables/useApi'

export interface UserProfile {
  id: number
  fullName: string
  idNumber: string
  position: string
  email: string
  emailConfirmed: boolean
  phoneNumber: string
  phoneNumberConfirmed: boolean
  twoFactorEnabled: boolean
  gender: string
  dateOfBirth: string
  createdDate: string
  photo: string
  lastSeenAt?: string | null
}

export interface BrokerDto {
  id: number;
  fullName: string;
  idNumber: string;
  position: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: Date;
  createdDate: Date;
  photo: string;
  lastSeenAt?: string | null;
  roleCodeName: string;
}

export interface BrokerDetailDto {
  id: number;
  fullName: string;
  idNumber: string;
  position: string;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: Date;
  createdDate: Date;
  photo: string;
  lastSeenAt?: string | null;
  roleCodeName: string;
  properties: PropertyListingSummaryDto[];
}

interface GetUserResponse {
  user: UserProfile
  message: string
}

export const userService = {
  async getUser(): Promise<UserProfile> {
    const { request } = useApi()
    const response = await request<GetUserResponse>('/User/get-user')
    return response.user
  },
  async getAllUsers(): Promise<UserProfile[]> {
    const { request } = useApi()
    const response = await request<{ users: UserProfile[], message: string }>('/User')
    return response.users
  },

  async getAllBrokers(page: number, limit: number, search: string): Promise<{ users: BrokerDto[], message: string, total: number, totalPages: number }> {
    const { request } = useApi()
    const response = await request<{ users: BrokerDto[], message: string, total: number, totalPages: number }>('/User/brokers?page=' + page + '&limit=' + limit + '&search=' + search)
    return response;
  },

  async getBrokerById(id: number): Promise<BrokerDetailDto> {
    const { request } = useApi()
    const response = await request<{ user: BrokerDetailDto, message: string }>(`/User/broker/${id}`)
    return response.user;
  }
}
