import api from './axios'

export const inventarioAPI = {
  ingredientes: (params) => api.get('/inventario/ingredientes/', { params }),
  movimientos: (params) => api.get('/inventario/movimientos-inventario/', { params }),
  recetas: (params) => api.get('/inventario/recetas/', { params }),
}

export const mesasAPI = {
  salas: (params) => api.get('/mesas/salas/', { params }),
  mesas: (params) => api.get('/mesas/mesas/', { params }),
  mesaPorSala: (salaId) => api.get(`/mesas/mesas/?sala=${salaId}`),
}

export const biAPI = {
  ventasPorDia: (params) => api.get('/bi/ventas/por-dia/', { params }),
  ventasPorRango: (params) => api.get('/bi/ventas/por-rango/', { params }),
  productosMasVendidos: (params) => api.get('/bi/productos/mas-vendidos/', { params }),
  productosMenosVendidos: (params) => api.get('/bi/productos/menos-vendidos/', { params }),
  ingredientesStockCritico: (params) => api.get('/bi/ingredientes/stock-critico/', { params }),
  ventasPorMetodoPago: (params) => api.get('/bi/ventas/por-metodo-pago/', { params }),
  resumenCaja: (params) => api.get('/bi/caja/resumen/', { params }),
}
