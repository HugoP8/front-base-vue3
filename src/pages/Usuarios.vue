<template>
  <q-page>
    <Titulo
      titulo="Usuarios"
      icono="person"
    ></Titulo>
    <CrudTable
      :filters="filters"
      :columns="columns"
      :url="url"
      :order="'createdAt'"
    >
      <template v-slot:buttons="{ open }">
        <q-btn
          icon="add"
          color="secondary"
          @click="openModal(open)"
          label="Nuevo usuario"
        />
      </template>
      <template v-slot:form="{ close, update}">
        <q-card style="width: 800px; max-width: 90vw;">
          <q-toolbar class="q-pa-md">
            <q-icon
              name="person"
              size="md"
            />
            <q-toolbar-title>
              {{ usuario.id ? 'Editar' : 'Agregar' }} usuario
            </q-toolbar-title>
            <q-space />
            <q-btn
              flat
              round
              icon="close"
              @click="closeModal(close)"
            />
          </q-toolbar>
          <q-card-section>
            <Usuario
              v-model:valores="usuario"
              @guardar="guardar(update, close)"
              @cancelar="closeModal(close)"
            ></Usuario>
          </q-card-section>
        </q-card>
      </template>
      <template v-slot:row="{ row, open, eliminar }">
        <q-tr>
          <q-td>
            <q-btn
              class="q-pa-xs"
              flat
              round
              icon="edit"
              @click="openModal(open, row.id)"
            />
            <q-btn
              class="q-pa-xs"
              flat
              round
              color="negative"
              icon="delete"
              @click="eliminar({ url: `${url}/${row.id}` })"
            />
          </q-td>
          <q-td>
            <q-toggle
              v-model="row.estado"
              color="primary"
              false-value="INACTIVO"
              true-value="ACTIVO"
              @click="cambiarEstado(row)"
            />
          </q-td>
          <q-td>{{ row.usuario }}</q-td>
          <q-td>{{ row.numeroDocumento }}</q-td>
          <q-td>{{ row.nombres }} {{ row.primerApellido }} {{ row.segundoApellido }}</q-td>
          <q-td>{{ row.entidad?.nombre }}</q-td>
          <q-td>{{ row.cargo }}</q-td>
          <q-td>{{ row.celular }}</q-td>
          <q-td>
            <Estado :estado="row.estado" />
          </q-td>
        </q-tr>
      </template>
    </CrudTable>
  </q-page>
</template>

<script>
import { ref, inject } from 'vue'
import CrudTable from '@components/common/CrudTable'
import Usuario from 'components/Formularios/Usuario'
import { useQuasar } from 'quasar'

const filters = [
  {
    label: 'Usuario',
    field: 'usuario',
    type: 'input'
  },
  {
    label: 'Nombres',
    field: 'nombres',
    type: 'input'
  },
  {
    label: 'Primer Apellido',
    field: 'primerApellido',
    type: 'input'
  },
  {
    label: 'Descripcion',
    field: 'descripcion',
    type: 'input'
  },
  {
    label: 'Estado',
    field: 'estado',
    type: 'select',
    options: [
      {
        label: 'ACTIVO',
        value: 'ACTIVO'
      },
      {
        label: 'INACTIVO',
        value: 'INACTIVO'
      }
    ]
  }
]

const columns = [
  {
    name: 'acciones',
    label: 'Acciones',
    sortable: false
  },
  {
    name: 'activo',
    label: 'Activo',
    sortable: true
  },
  {
    name: 'usuario',
    label: 'Nombre Usuario',
    sortable: true
  },
  {
    name: 'numeroDocumento',
    label: 'Nombre Documento',
    sortable: true
  },
  {
    name: 'nombres',
    label: 'Nombre Persona',
    sortable: true
  },
  {
    name: 'entidad',
    label: 'Entidad',
    sortable: false
  },
  {
    name: 'cargo',
    label: 'Cargo',
    sortable: true
  },
  {
    name: 'celular',
    label: 'Celular',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    sortable: false
  }
]

export default {
  components: { CrudTable, Usuario },
  name: 'Dashboard',
  setup () {
    const _http = inject('http')
    const $q = useQuasar()
    const url = ref('system/usuarios')
    const usuario = ref({
      cargo: null,
      celular: null,
      correoElectronico: null,
      foto: null,
      idEntidad: null,
      nombres: null,
      numeroDocumento: null,
      primerApellido: null,
      roles: [],
      segundoApellido: null,
      telefono: null,
      usuario: null,
      tipoDocumento: null,
      fechaNacimiento: null,
      estado: 'ACTIVO'
    })

    const resetForm = () => {
      usuario.value = {
        cargo: null,
        celular: null,
        correoElectronico: null,
        foto: null,
        idEntidad: null,
        nombres: null,
        numeroDocumento: null,
        primerApellido: null,
        roles: [],
        segundoApellido: null,
        telefono: null,
        usuario: null,
        tipoDocumento: null,
        fechaNacimiento: null,
        estado: 'ACTIVO'
      }
    }

    const openModal = async (open, id) => {
      resetForm()
      if (id) {
        usuario.value = await _http.get(`/${url.value}/${id}`)
      }
      open()
    }

    const closeModal = (close) => {
      resetForm()
      close()
    }

    const guardar = async (update, close) => {
      if (usuario.value.id) {
        await _http.put(`/${url.value}/${usuario.value.id}`, usuario.value)
      } else {
        await _http.post(`/${url.value}`, usuario.value)
      }
      await update()
      closeModal(close)
    }

    const getNombreCompleto = (usuario) => {
      return `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`
    }

    const cambiarEstado = async (registro) => {
      const nuevoEstado = registro.estado
      try {
        const response = await _http.put(`system/usuarios/cambiar-estado/${registro.id}`, { estado: nuevoEstado })
        $q.notify({
          type: 'postive',
          message: response.mensaje || 'Se actualizó con exito'
        })
      } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error)
        $q.notify({
          type: 'negative',
          message: 'Error en el cambio de estado'
        })
      }
    }

    return {
      usuario,
      filters,
      columns,
      url,
      closeModal,
      openModal,
      getNombreCompleto,
      guardar,
      cambiarEstado
    }
  }
}
</script>
