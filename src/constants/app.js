export const constants = {
  AMBIENTES: {
    development: 'PRUEBAS',
    local: 'LOCAL',
    production: 'PRODUCCION'
  },
  PROP_DIALOG: {
    title: 'Confirmación',
    message: '¿Esta seguro?',
    html: true,
    ok: {
      color: 'primary',
      label: 'Aceptar',
      rounded: true
    },
    cancel: {
      color: 'negative',
      'text-color': 'negative',
      label: 'Cancelar',
      flat: true,
      rounded: true
    },
    persistent: true
  },
  roles: {
    SUPERVISOR_MJTI: 'b5e4c7b1-3e1b-4b5b-8e1b-8b5e1b3e1b4c',
    OPERADOR_MJTI: 'b5e4c7b1-3e1b-4b5b-8e1b-8b5e1b3e1b4b',
    OPERADOR_ENTIDAD: '3df3ffa0-b978-4be9-bc3f-4ccc11cefc7c',
    SUPERVISOR_ENTIDAD: 'b0f89eb7-6661-4931-9dc0-518cd0cdbc64'
  }
}
