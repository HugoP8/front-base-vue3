const _storage = window.localStorage
const prefix = 'app'

const codificar = (value) => {
  if (process.env.NODE_ENV === 'development') return value

  return window.btoa(value)
}

const decodificar = (value) => {
  if (process.env.NODE_ENV === 'development') return value

  return window.atob(value)
}

const guardLogin = (to, from, next) => {
  const menu = _storage.getItem(codificar(`${prefix}_menu`))
  if (_storage.getItem(codificar(`${prefix}_token`)) && menu && _storage.getItem(codificar(`${prefix}_usuario`))) {
    if (from.path.includes('/app/')) {
      next({ path: `${JSON.parse(decodificar(menu))[0].ruta}`, replace: true })
    } else {
      next({ path: `/app/${JSON.parse(decodificar(menu))[0].ruta}`, replace: true })
    }
  } else {
    next()
  }
}

const guardApp = (to, from, next) => {
  if (_storage.getItem(codificar(`${prefix}_token`))) {
    next()
  } else {
    _storage.clear()
    next('/')
  }
}

const routes = [
  {
    path: '/',
    component: () => import('layouts/OutLoginLayout.vue'),
    beforeEnter: guardLogin,
    children: [
      { path: '', component: () => import('pages/Login.vue') },
      { path: 'ciudadania/login', name: 'login-ciudadania', component: () => import('src/pages/CiudadaniaDigital/Login') }
    ]
  },
  {
    path: '/app/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: guardApp,
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('pages/Dashboard.vue') },
      { path: 'entidades', name: 'entidades', component: () => import('pages/Entidades.vue') },
      { path: 'menus', name: 'menus', component: () => import('pages/Menus.vue') },
      { path: 'roles', name: 'roles', component: () => import('pages/Roles.vue') },
      { path: 'usuarios', name: 'usuarios', component: () => import('pages/Usuarios.vue') },
      { path: 'parametros', name: 'parametros', component: () => import('pages/Parametros.vue') },
      { path: 'interoperabilidad', name: 'interoperabilidad', component: () => import('pages/Interoperabilidad.vue') },
      { path: 'bandeja-instrumentos', name: 'bandejaInstrumentos', component: () => import('pages/BandejaInstrumentos.vue') },
      { path: 'instrumentos', name: 'instrumentos', component: () => import('pages/Instrumentos.vue') },
      { path: 'instrumentos/:id', name: 'recomendaciones', component: () => import('pages/Recomendaciones.vue'), props: true },
      { path: 'bandeja-recomendaciones/:id?', name: 'bandejaRecomendaciones', component: () => import('pages/BandejaRecomendaciones.vue') },
      { path: 'informes', name: 'informes', component: () => import('pages/Informes.vue') },
      { path: 'informes/:id', name: 'informe', component: () => import('pages/Informe.vue') },
      { path: 'avance', name: 'avance', component: () => import('src/components/Formularios/Avance.vue') },
      { path: 'recordatorios', name: 'recordatorios', component: () => import('pages/Recordatorios.vue') },
      { path: 'bandejaVisor/:id?', name: 'bandejaVisor', component: () => import('pages/BandejaRecomendacionesVisor.vue') },
      { path: 'reportes', name: 'reportes', component: () => import('pages/Reportes.vue') },
      { path: 'reasignacion', name: 'reasignacion', component: () => import('pages/Reasignacion.vue') },
      { path: 'diagramas', name: 'diagramas', component: () => import('pages/DiagramaAvances.vue') }
    ]
  },
  {
    path: '/ciudadania/',
    component: () => import('layouts/CiudadaniaLayout.vue'),
    beforeEnter: guardApp,
    children: [
      { path: 'aprobar-documento', name: 'aprobar', component: () => import('pages/CiudadaniaDigital/Firmar.vue') },
      { path: 'documento-aprobado', name: 'aprobado', component: () => import('pages/CiudadaniaDigital/AprobacionDocumento.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
