import api from './axios'

export const usuariosAPI = {
  list: (params) => api.get('/core/usuarios/', { params }),
  get: (id) => api.get(`/core/usuarios/${id}/`),
  create: (data) => api.post('/core/usuarios/', data),
  update: (id, data) => api.patch(`/core/usuarios/${id}/`, data),
  delete: (id) => api.delete(`/core/usuarios/${id}/`),
}
