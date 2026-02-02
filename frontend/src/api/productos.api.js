import api from './axios'

export const productosAPI = {
  list: (params) => api.get('/productos/productos/', { params }),
  get: (id) => api.get(`/productos/productos/${id}/`),
  create: (data) => api.post('/productos/productos/', data),
  update: (id, data) => api.patch(`/productos/productos/${id}/`, data),
  remove: (id) => api.delete(`/productos/productos/${id}/`),
  activar: (id) => api.post(`/productos/productos/${id}/activar/`),
  desactivar: (id) => api.post(`/productos/productos/${id}/desactivar/`),
  marcarFavorito: (id) => api.post(`/productos/productos/${id}/marcar_favorito/`),
}

export const categoriasAPI = {
  list: (params) => api.get('/productos/categorias/', { params }),
  get: (id) => api.get(`/productos/categorias/${id}/`),
  create: (data) => api.post('/productos/categorias/', data),
  update: (id, data) => api.patch(`/productos/categorias/${id}/`, data),
  activar: (id) => api.post(`/productos/categorias/${id}/activar/`),
  desactivar: (id) => api.post(`/productos/categorias/${id}/desactivar/`),
}
