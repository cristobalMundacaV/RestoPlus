export const PERMISOS = {
  ADMIN: 'admin',
  GERENTE: 'gerente',
  MESERO: 'mesero',
  CHEF: 'chef',
  CONTADOR: 'contador',
}

export const tienePermiso = (userRol, rolRequerido) => {
  const roles = {
    admin: [PERMISOS.ADMIN, PERMISOS.GERENTE, PERMISOS.MESERO, PERMISOS.CHEF, PERMISOS.CONTADOR],
    gerente: [PERMISOS.GERENTE, PERMISOS.MESERO, PERMISOS.CHEF, PERMISOS.CONTADOR],
    mesero: [PERMISOS.MESERO],
    chef: [PERMISOS.CHEF],
    contador: [PERMISOS.CONTADOR],
  }
  return roles[userRol]?.includes(rolRequerido) ?? false
}

export const esAdmin = (rol) => rol === PERMISOS.ADMIN
export const esGerente = (rol) => [PERMISOS.ADMIN, PERMISOS.GERENTE].includes(rol)
export const esMesero = (rol) => [PERMISOS.ADMIN, PERMISOS.GERENTE, PERMISOS.MESERO].includes(rol)
export const esChef = (rol) => [PERMISOS.ADMIN, PERMISOS.CHEF].includes(rol)
export const esContador = (rol) => [PERMISOS.ADMIN, PERMISOS.CONTADOR].includes(rol)
