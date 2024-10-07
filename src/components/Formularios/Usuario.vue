<template>
  <q-form
    ref="usuario"
    @submit="$emit('guardar')"
    class="row q-col-gutter-md"
  >
    <div class="col-xs-12 text-subtitle1 text-secondary text-weight-bold">
      Datos personales
    </div>
    <q-select
      outlined
      class="required col-xs-12 col-md-4"
      label="Tipo de Documento"
      option-value="id"
      option-label="nombre"
      map-options
      emit-value
      v-model="valoresModel.tipoDocumento"
      :options="tipoDocumentoOptions"
      :rules="valoresRules.tipoDocumento"
    ></q-select>
    <q-input
      outlined
      class="required col-xs-12 col-md-4"
      label="Cedula de identidad"
      v-model="valoresModel.numeroDocumento"
      :rules="valoresRules.numeroDocumento"
    ></q-input>
    <q-input
      outlined
      class="required col-xs-12 col-md-4"
      label="Fecha de nacimiento"
      v-model="valoresModel.fechaNacimiento"
      :rules="valoresRules.fechaNacimiento"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer"/>
      </template>
      <q-popup-proxy>
        <q-date
          color="grey-10"
          mask="YYYY-MM-DD"
          v-model="valoresModel.fechaNacimiento"
          default-view="Years"
        />
      </q-popup-proxy>
    </q-input>
    <q-input
      outlined
      label="Nombres"
      class="required col-xs-12 col-md-4"
      v-model="valoresModel.nombres"
      :rules="valoresRules.nombre"
    ></q-input>
    <q-input
      outlined
      label="Primer apellido"
      class="required col-xs-12 col-md-4"
      v-model="valoresModel.primerApellido"
      :rules="valoresRules.primerApellido"
    ></q-input>
    <q-input
      class="required col-xs-12 col-md-4"
      outlined
      label="Segundo apellido"
      v-model="valoresModel.segundoApellido"
      :rules="valoresRules.segundoApellido"
    ></q-input>
    <q-input
      outlined
      class="required col-xs-12 col-md-4"
      label="Celular"
      v-model="valoresModel.celular"
      :rules="valoresRules.celular"
    ></q-input>
    <q-input
      outlined
      class="col-xs-12 col-md-4"
      label="Telefono"
      v-model="valoresModel.telefono"
    ></q-input>
    <div class="col-xs-12 text-subtitle1 text-secondary text-weight-bold">
      Datos de usuario
    </div>
    <q-select
      ref="entidad"
      outlined
      class="required col-xs-12 col-md-6"
      v-model="valoresModel.idEntidad"
      :options="entidades"
      label="Entidad"
      option-value="id"
      option-label="nombre"
      emit-value
      map-options
      :rules="valoresRules.id_rol"
      @input="getRoles($event,true)"
    />
    <q-input
      outlined
      class="required col-xs-12 col-md-6"
      label="Cargo"
      v-model="valoresModel.cargo"
      :rules="valoresRules.cargo"
    ></q-input>
    <q-select
      v-model="valoresModel.roles"
      outlined
      class="required col-xs-12 col-md-6"
      :options="roles"
      label="Rol"
      option-value="id"
      option-label="nombre"
      use-chips
      emit-value
      map-options
      multiple
      :rules="valoresRules.id_rol"
    />
    <q-input
      outlined
      class="required col-xs-12 col-md-6"
      label="Correo electronico"
      v-model="valoresModel.correoElectronico"
      :rules="valoresRules.correoElectronico"
    ></q-input>
    <q-input
      outlined
      label="Nombre Usuario"
      v-model="valoresModel.usuario"
      class="required col-xs-12 col-md-6"
      :rules="valoresRules.usuario"
    ></q-input>
    <q-input
      outlined
      v-if="!valoresModel.id"
      label="Contraseña"
      class="required col-xs-12 col-md-6"
      v-model="valoresModel.contrasena"
      :rules="valoresRules.contrasena"
    ></q-input>
    <q-input
      outlined
      v-if="!valoresModel.id"
      class="required col-xs-12 col-md-6"
      label="Confirmacion de contraseña"
      v-model="valoresModel.confirmarContrasena"
      :rules="valoresRules.contrasena"
    ></q-input>
    <div class="col-xs-12 text-right q-gutter-sm">
      <q-btn
        icon="close"
        label="Cancelar"
        @click="$emit('cancelar')"
      />
      <q-btn
        icon="check"
        color="primary"
        label="Guardar"
        type="submit"
      />
    </div>
  </q-form>
</template>
<script>

import { useVModel } from '../../composables/useVModel.js'
import { ref, onMounted, inject } from 'vue'
import validaciones from '../../common/validations'

const valoresRules = {
  tipoDocumento: [
    validaciones.requerido
  ],
  numeroDocumento: [
    validaciones.requerido
  ],
  fechaNacimiento: [
    validaciones.requerido
  ],
  nombre: [
    validaciones.requerido
  ],
  primerApellido: [
    validaciones.requerido
  ],
  segundoApellido: [
    validaciones.requerido
  ],
  celular: [
    validaciones.requerido
  ],
  id_rol: [
    validaciones.requerido
  ],
  idEntidad: [
    validaciones.requerido
  ],
  cargo: [
    validaciones.requerido
  ],
  correoElectronico: [
    validaciones.requerido
  ],
  usuario: [
    validaciones.requerido
  ],
  contrasena: [
    validaciones.requerido
  ]
}

export default {
  props: {
    valores: {
      type: Object,
      default: () => ({})
    }
  },
  setup (props) {
    const _http = inject('http')
    const valoresModel = useVModel(props, 'valores')
    const entidades = ref([])
    const roles = ref([])
    const tipoDocumentoOptions = ref([
      { nombre: 'CI', id: 'CI' },
      { nombre: 'PASAPORTE', id: 'PASAPORTE' }
    ])

    onMounted(async () => {
      entidades.value = await getEntidades()
      roles.value = await getRoles()
      valoresModel.value.roles = props.valores.roles.map(x => x.id)
    })

    async function getEntidades () {
      const { rows } = await _http.get('/system/entidades')
      return rows
    }

    async function getRoles () {
      const { rows } = await _http.get('/system/roles')
      return rows
    }

    return {
      valoresModel,
      valoresRules,
      entidades,
      roles,
      tipoDocumentoOptions
    }
  }
}
</script>
