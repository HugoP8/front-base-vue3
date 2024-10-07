export function setUsuario (state, value) {
  state.usuario = value
}

export function setLeftDrawerOpen (state, value) {
  state.leftDrawerOpen = value
}

export function setForm (state, value) {
  state.form = value
}

export function setMenu (state, value) {
  state.menu = value
}

export function setRoles (state, value) {
  state.roles = value
}

export function setPermisos (state, value) {
  state.permisos = value
}

export function changeViewLayout (state, value) {
  state.viewLayout = value
}

export function setPreviewPdfDocumento (state, value) {
  [state.dialogPdf, state.verDocumento] = value
}
