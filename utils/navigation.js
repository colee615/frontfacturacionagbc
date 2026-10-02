export const navigation = [
  { label: 'Espacio de trabajo', items: [
    { title: 'Inicio', to: '/', icon: 'home', description: 'Tu espacio de trabajo y accesos frecuentes.' },
    { title: 'Notificaciones', to: '/panel/notificaciones/', icon: 'bell', permission: 'dashboard.view', view: 'dashboard', description: 'Revisa los avisos y el seguimiento de facturación.' }
  ] },
  { label: 'Reportes y control', items: [
    { title: 'Control de cierre', to: '/cajero/ventas/lista', icon: 'chart', permission: 'ventas.read', view: 'ventas', description: 'Consulta cierres, conciliaciones y resultados por sucursal.' },
    { title: 'Ventas por servicio', to: '/cajero/ventas/servicios', icon: 'layers', permission: 'ventas.read', view: 'ventas', description: 'Explora el consolidado de ventas de cada servicio.' },
    { title: 'Servicios contrato', to: '/cajero/ventas/servicios-contrato', icon: 'file', permission: 'ventas.read', view: 'ventas', description: 'Consulta los servicios contratados por cliente.' }
  ] },
  { label: 'Administración', items: [
    { title: 'Usuarios', to: '/panel/usuarios/', icon: 'users', permission: 'usuarios.manage', view: 'usuarios', description: 'Gestiona las cuentas y los accesos de tu equipo.' },
    { title: 'Roles y permisos', to: '/panel/seguridad/', icon: 'shield', permission: 'rbac.manage', view: 'seguridad', description: 'Organiza los roles y permisos de cada módulo.' },
    { title: 'Integraciones', to: '/panel/integration-tokens/', icon: 'key', permission: 'rbac.manage', view: 'seguridad', description: 'Administra los tokens de conexión con otros sistemas.' }
  ] }
];

export function visibleNavigation(auth) {
  return navigation.map(group => ({ ...group, items: group.items.filter(item =>
    !item.permission || ((auth.permissions || []).includes(item.permission) && (auth.views || []).includes(item.view))
  ) })).filter(group => group.items.length);
}
