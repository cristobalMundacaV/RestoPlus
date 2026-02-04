import api from './axios'

export const inventarioAPI = {
  // Ingredientes
  ingredientes: (params) => api.get('/inventario/ingredientes/', { params }),
  getIngrediente: (id) => api.get(`/inventario/ingredientes/${id}/`),
  crearIngrediente: (data) => api.post('/inventario/ingredientes/', data),
  actualizarIngrediente: (id, data) => api.patch(`/inventario/ingredientes/${id}/`, data),
  eliminarIngrediente: (id) => api.delete(`/inventario/ingredientes/${id}/`),
  bajosStock: () => api.get('/inventario/ingredientes/bajo_stock/'),
  ajustarStock: (id, data) => api.post(`/inventario/ingredientes/${id}/ajustar_stock/`, data),
  
  // Movimientos
  movimientos: (params) => api.get('/inventario/movimientos-inventario/', { params }),
  
  // Recetas
  recetas: (params) => api.get('/inventario/recetas/', { params }),
  crearReceta: (data) => api.post('/inventario/recetas/', data),
  actualizarReceta: (id, data) => api.patch(`/inventario/recetas/${id}/`, data),
  eliminarReceta: (id) => api.delete(`/inventario/recetas/${id}/`),
}

export const mesasAPI = {
  salas: (params) => api.get('/mesas/salas/', { params }),
  mesas: (params) => api.get('/mesas/mesas/', { params }),
  mesaPorSala: (salaId) => api.get(`/mesas/mesas/?sala=${salaId}`),
  cambiarEstado: (id, data) => api.post(`/mesas/mesas/${id}/cambiar_estado/`, data),
}

export const biAPI = {
  ventasPorDia: (params) => api.get('/bi/ventas/por-dia/', { params }),
  ventasPorRango: (params) => api.get('/bi/ventas/por-rango/', { params }),
  productosMasVendidos: (params) => api.get('/bi/productos/mas-vendidos/', { params }),
  productosMenosVendidos: (params) => api.get('/bi/productos/menos-vendidos/', { params }),
  ingredientesStockCritico: (params) => api.get('/bi/ingredientes/stock-critico/', { params }),
  ventasPorMetodoPago: (params) => api.get('/bi/ventas/por-metodo-pago/', { params }),
  resumenCaja: (params) => api.get('/bi/caja/resumen/', { params }),
  rentabilidadPorProducto: (params) => api.get('/bi/rentabilidad-por-producto/', { params }),
  perdidasInventario: (params) => api.get('/bi/perdidas-inventario/', { params }),
  tendenciasVenta: (params) => api.get('/bi/tendencias-venta/', { params }),
}
