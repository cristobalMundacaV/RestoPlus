import api from './axios'

export const restaurantesAPI = {
  list: (params) => api.get('/restaurantes/restaurantes/', { params }),
  get: (id) => api.get(`/restaurantes/restaurantes/${id}/`),
  create: (data) => api.post('/restaurantes/restaurantes/', data),
  update: (id, data) => api.patch(`/restaurantes/restaurantes/${id}/`, data),
  activar: (id) => api.post(`/restaurantes/restaurantes/${id}/activar/`),
  desactivar: (id) => api.post(`/restaurantes/restaurantes/${id}/desactivar/`),
}

export const planesAPI = {
  list: (params) => api.get('/restaurantes/planes/', { params }),
  get: (id) => api.get(`/restaurantes/planes/${id}/`),
}

export const modulosAPI = {
  list: (params) => api.get('/core/modulos/', { params }),
}
