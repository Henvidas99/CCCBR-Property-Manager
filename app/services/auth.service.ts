import { useApi } from '../composables/useApi'

interface BrokerLoginResponse {
  token: string
}

export const authService = {
  async brokerLogin(code: string, password: string): Promise<BrokerLoginResponse> {
    const { request } = useApi()
    return request<BrokerLoginResponse>('/Auth/broker-login', {
      method: 'POST',
      body: { code, password }
    })
  }
}
