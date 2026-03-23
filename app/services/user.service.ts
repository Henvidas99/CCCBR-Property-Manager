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
  }
}
