import { boot } from 'quasar/wrappers'
import axios from 'axios'

const AUTH_URL = process.env.AUTH_URL

export default boot(({ app, router, store }) => {
  const _storage = app.config.globalProperties.$storage
  const _store = store
  const _message = app.config.globalProperties.$message

  const login = async (params) => {
    try {
      const { data } = await axios.post(`${AUTH_URL}/login`, params)
      const respuesta = data.datos
      const rolActual = respuesta.roles.find(x => x.id === respuesta.idRol)
      const usuario = {
        idUser: respuesta.id,
        usuario: respuesta.usuario,
        nombres: respuesta.nombres,
        primerApellido: respuesta.primerApellido,
        segundoApellido: respuesta.segundoApellido,
        correoElectronico: respuesta.correoElectronico,
        rol: rolActual,
        idRol: rolActual?.id,
        entidad: respuesta.entidad.nombre
      }
      _storage.setUsuario(usuario)
      _storage.set('roles', respuesta.roles)
      _storage.set('menu', respuesta.menu)
      _storage.set('permisos', respuesta.permisos)
      _storage.set('token', respuesta.token)
      _storage.set('login_local', true)

      initStore()
      let rutaInicial = '/app/'
      if (respuesta.menu.length > 0) {
        rutaInicial += respuesta.menu[0].ruta
      }
      router.push(rutaInicial)
    } catch (error) {
      let mensaje = 'Ocurrio un error desconocido.'
      if (error.response) {
        const { data } = error.response
        mensaje = data.mensaje
      }
      _message.error(mensaje)
      _storage.clearAll()
    }
  }

  const loginCiudadania = async () => {
    const { data } = await axios.get(`${process.env.BACKEND_URL}/codigo`)
    if (data.codigo) {
      _storage.set('oauth2_state', data.codigo || null)
      window.location.href = data.url
    }
  }

  const logout = async () => {
    try {
      if (!_storage.get('login_local')) {
        await logoutCiudadania()
      }
      cleanStore()
    } catch (error) {
      _message.error('Ocurrio un error al intentar cerrar su sesión')
    }
  }

  const logoutCiudadania = async () => {
    const codigo = _storage.get('oauth2_state')
    const usuario = _storage.get('usuario')
    if (codigo && usuario) {
      const { data } = await axios.post(`${process.env.BACKEND_URL}/logout`, { usuario, codigo })
      window.location.href = data.url
    }
  }

  const refreshToken = async (datos) => {
    try {
      const { data } = await axios({
        method: 'PUT',
        url: `${process.env.API_URL}/public/refresh-token`,
        data: { ...datos, token: _storage.get('token') },
        headers: { Authorization: `Bearer ${_storage.get('token')}` }
      })

      const respuesta = data.datos
      const rolActual = respuesta.roles.find(x => x.id === respuesta.idRol)
      const usuario = {
        usuario: respuesta.usuario,
        nombres: respuesta.nombres,
        primerApellido: respuesta.primerApellido,
        segundoApellido: respuesta.segundoApellido,
        correoElectronico: respuesta.correoElectronico,
        rol: rolActual,
        idRol: rolActual?.id,
        entidad: respuesta.entidad.nombre
      }
      _storage.setUsuario(usuario)
      _storage.set('roles', respuesta.roles)
      _storage.set('menu', respuesta.menu)
      _storage.set('permisos', respuesta.permisos)
      _storage.set('token', respuesta.token)
      _storage.set('login_local', true)
      initStore()
      router.push(respuesta.menu[0].ruta)
    } catch (error) {
      console.log(error)
      let mensaje = 'Ocurrio un error desconocido.'
      if (error.response) {
        const { data } = error.response
        mensaje = data.mensaje
      }
      _message.error(mensaje)
    }
  }

  const cleanStore = () => {
    _storage.removeUsuario()
    _storage.remove('roles')
    _storage.remove('menu')
    _storage.remove('permisos')
    _storage.remove('token')
    _store.commit('global/setUsuario', {})
    _store.commit('global/setRoles', [])
    _store.commit('global/setMenu', [])
    _store.commit('global/setPermisos', [])
    _storage.remove('login_local')
    router.push('/')
  }

  const initStore = () => {
    _store.commit('global/setUsuario', _storage.getUsuario())
    _store.commit('global/setRoles', _storage.get('roles'))
    _store.commit('global/setMenu', _storage.get('menu'))
    _store.commit('global/setPermisos', _storage.get('permisos'))
  }

  app.config.globalProperties.$auth = {
    cleanStore,
    initStore,
    login,
    loginCiudadania,
    logout,
    logoutCiudadania
  }

  app.provide('auth', {
    cleanStore,
    initStore,
    login,
    loginCiudadania,
    logout,
    logoutCiudadania,
    refreshToken
  })
})

//
