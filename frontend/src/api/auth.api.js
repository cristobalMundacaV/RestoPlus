import api from './axios'

export const authAPI = {
  login: (username, password) =>
    api.post('/core/auth/login/', { username, password }),
  
  refresh: (refresh_token) =>
    api.post('/core/auth/refresh/', { refresh: refresh_token }),
  
  verify: (token) =>
    api.post('/core/auth/verify/', { token }),
}
