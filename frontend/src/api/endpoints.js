import api from './client'

export const authAPI = {
  login: (username, password) =>
    api.post('/core/auth/login/', { username, password }),
  
  refresh: (refresh_token) =>
    api.post('/core/auth/refresh/', { refresh: refresh_token }),
  
  verify: (token) =>
    api.post('/core/auth/verify/', { token }),
}

export const pedidosAPI = {
  list: (params) => api.get('/pedidos/', { params }),
  create: (data) => api.post('/pedidos/', data),
  get: (id) => api.get(`/pedidos/${id}/`),
  update: (id, data) => api.patch(`/pedidos/${id}/`, data),
  cancelar: (id) => api.post(`/pedidos/${id}/cancelar/`),
}

export const ventasAPI = {
  list: (params) => api.get('/ventas/', { params }),
  create: (data) => api.post('/ventas/', data),
  anular: (id) => api.post(`/ventas/${id}/anular/`),
}

export const inventarioAPI = {
  ingredientes: () => api.get('/inventario/ingredientes/'),
  movimientos: (params) => api.get('/inventario/movimientos/', { params }),
}

export const productosAPI = {
  list: (params) => api.get('/productos/', { params }),
  categorias: () => api.get('/productos/categorias/'),
}

export const cajasAPI = {
  abrir: (data) => api.post('/cajas/', data),
  cerrar: (id, data) => api.patch(`/cajas/${id}/`, data),
  lista: (params) => api.get('/cajas/', { params }),
}
