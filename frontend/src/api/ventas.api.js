import api from './axios'

export const ventasAPI = {
  list: (params) => api.get('/ventas/ventas/', { params }),
  create: (data) => api.post('/ventas/ventas/', data),
  anular: (id) => api.post(`/ventas/ventas/${id}/anular/`),
}

export const pedidosAPI = {
  list: (params) => api.get('/pedidos/pedidos/', { params }),
  create: (data) => api.post('/pedidos/pedidos/', data),
  get: (id) => api.get(`/pedidos/pedidos/${id}/`),
  update: (id, data) => api.patch(`/pedidos/pedidos/${id}/`, data),
  remove: (id) => api.delete(`/pedidos/pedidos/${id}/`),
  cancelar: (id) => api.post(`/pedidos/pedidos/${id}/cancelar/`),
  cambiarEstado: (id, estado) => api.post(`/pedidos/pedidos/${id}/cambiar_estado/`, { estado }),
}

export const detallesAPI = {
  list: (params) => api.get('/pedidos/detalles-pedido/', { params }),
  create: (data) => api.post('/pedidos/detalles-pedido/', data),
  update: (id, data) => api.patch(`/pedidos/detalles-pedido/${id}/`, data),
  delete: (id) => api.delete(`/pedidos/detalles-pedido/${id}/`),
}

export const cajasAPI = {
  list: (params) => api.get('/cajas/cajas/', { params }),
  create: (data) => api.post('/cajas/cajas/', data),
  cerrar: (id) => api.post(`/cajas/cajas/${id}/cerrar/`),
}
