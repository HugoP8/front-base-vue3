<template>
  <q-page>
      <Titulo titulo="Reasignacion" icono="manage_accounts" />
      <q-card class="q-mb-md" flat bordered>
        <q-card-section>
          <q-select
            class="full-width"
            outlined
            use-input
            map-options
            input-debounce="0"
            v-model="selectedUser"
            label="Usuarios"
            :options="usuariosFiltrados"
            option-value="id"
            option-label="fullName"
            @filter="filterFn"
            @update:model-value="onUserSelected"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No se encontraron resultados
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
      </q-card>
  <div class="cardGralStyle">
    <q-card v-if="userDetails" class="q-mb-md" style="width: 80%;" flat bordered>
      <q-card-section>
        <div>
          <strong>Instrumentos:</strong>
          <template v-if="userDetails.instrumentos && userDetails.instrumentos.length">
            <ul class="q-pa-md instrumentos-list">
              <li v-for="(inst, index) in userDetails.instrumentos" :key="index" class="q-mb-md">
                <div><strong>Nombre:</strong> {{ inst.nombreDocumento }}</div>
                <div><strong>Número de Recomendación:</strong> {{ inst.numeroRecomendacion }}</div>
                <div><strong>Fecha de Plazo:</strong> {{ inst.fechaPlazo }}</div>
                <div><strong>Periodicidad:</strong> {{ inst.periodicidad }}</div>
                <div><strong>Estado:</strong> {{ inst.estado }}</div>
              </li>
            </ul>
          </template>
          <template v-else-if="userDetails.message">
            {{ userDetails.message }}
          </template>
          <template v-else>
            No asignado
          </template>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-if="userDetails && userDetails.instrumentos && userDetails.instrumentos.length" class="q-mb-md" flat bordered>
      <q-card-section>
        <q-card-title>
          Lista de Usuarios para Reasignar
        </q-card-title>
      </q-card-section>
      <div class="q-pa-md">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div v-for="user in NewUserDetails" :key="user.id" class="q-mb-md">
            <q-item>
              <q-item-section>
                <q-item-label><strong>Nombre Completo:</strong> {{ user.fullName }}</q-item-label>
                <q-item-label><strong>Cargo:</strong> {{ user.cargo }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-radio
                  v-model="selectedNewUserId"
                  :val="user.id"
                  label="Seleccionar"
                />
              </q-item-section>
            </q-item>
            <q-separator spaced />
          </div>
          <div class="q-mt-md">
            <q-btn label="Reasignar" type="submit" color="primary" class="full-width" />
          </div>
        </q-form>
        <q-card
          v-if="submitResult"
          flat
          bordered
          class="q-mt-md"
          :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
        >
          <q-card-section>
            Usuario seleccionado: {{ submitResult.fullName }} (ID: {{ submitResult.id }})
          </q-card-section>
        </q-card>
      </div>
    </q-card>
  </div>
  </q-page>
  </template>

<script>
import { useQuasar } from 'quasar'
import { ref, inject, onMounted } from 'vue'

export default {
  components: {},
  name: 'Dashboard',
  setup () {
    const $q = useQuasar()
    const _http = inject('http')
    const usuarios = ref([])
    const usuariosFiltrados = ref([])
    const selectedUser = ref(null)
    const userDetails = ref(null)
    const NewUserDetails = ref([])
    const selectedNewUserId = ref(null)
    const submitResult = ref(null)

    onMounted(async () => {
      try {
        const { rows: usuariosRows } = await _http.get('/internacional/reasignacion-usuarios')
        usuarios.value = usuariosRows.map(user => ({
          id: user.id,
          idEntidad: user.idEntidad,
          idRol: user.idRol,
          nombres: user.nombres,
          primerApellido: user.primerApellido,
          segundoApellido: user.segundoApellido,
          fullName: `${user.nombres} ${user.primerApellido} ${user.segundoApellido}`
        })).sort((a, b) => a.fullName.localeCompare(b.fullName))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    })
    const filterFn = (val, update) => {
      if (val === '') {
        update(() => {
          usuariosFiltrados.value = usuarios.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        usuariosFiltrados.value = usuarios.value.filter(user => {
          return (
            user.nombres.toLowerCase().includes(needle) ||
            user.primerApellido.toLowerCase().includes(needle) ||
            user.segundoApellido.toLowerCase().includes(needle)
          )
        })
      })
    }
    const onUserSelected = async (user) => {
      selectedUser.value = user
      if (user) {
        await usuarioDetalle(user.id)
        await listaUsuarios(user.idEntidad, user.idRol, user.id)
      } else {
        userDetails.value = null
      }
    }
    const usuarioDetalle = async (userId) => {
      if (!userId) {
        userDetails.value = null
        return
      }
      try {
        const data = await _http.get(`/internacional/reasignacion-datos/${userId}`)
        if (data.message) {
          userDetails.value = { message: data.message }
        } else {
          userDetails.value = {
            instrumentos: data.rows.map(inst => ({
              id: inst.id,
              nombreDocumento: inst.nombreDocumento,
              numeroRecomendacion: inst.numeroRecomendacion,
              fechaPlazo: inst.fechaPlazo,
              periodicidad: inst.periodicidad,
              estado: inst.estado
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error)
        userDetails.value = { message: 'Error al obtener detalles del usuario' }
      }
    }
    const listaUsuarios = async (idEntidad, idRol, idUser) => {
      try {
        const response = await _http.get(`/internacional/reasignacion-usuarios-lista?idEntidad=${idEntidad}&idRol=${idRol}&idUser=${idUser}`)
        NewUserDetails.value = response.rows.map(userNew => ({
          id: userNew.id,
          nombres: userNew.nombres,
          primerApellido: userNew.primerApellido,
          segundoApellido: userNew.segundoApellido,
          cargo: userNew.cargo,
          fullName: `${userNew.nombres} ${userNew.primerApellido} ${userNew.segundoApellido}`
        }))
      } catch (error) {
        console.error('Error al obtener la lista de usuarios:', error)
      }
    }
    const onSubmit = async () => {
      const selectedUser = NewUserDetails.value.find(user => user.id === selectedNewUserId.value)
      if (selectedUser && userDetails.value && userDetails.value.instrumentos) {
        try {
          const instrumentoIds = userDetails.value.instrumentos.map(inst => inst.id)
          const payload = {
            instrumentoIds,
            nuevoUsuarioId: selectedUser.id
          }
          const response = await _http.put('internacional/reasignar-instrumentos', payload)
          submitResult.value = selectedUser
          $q.notify({
            type: 'positive',
            message: response.message || 'Reasignación completada con éxito'
          })
        } catch (error) {
          console.error('Error en la reasignación:', error)
          $q.notify({
            type: 'negative',
            message: 'Error en la reasignación de instrumentos'
          })
        }
      }
      selectedUser.value = null
      userDetails.value = null
      NewUserDetails.value = []
      selectedNewUserId.value = null
      submitResult.value = null
    }
    return {
      usuarios,
      usuariosFiltrados,
      selectedUser,
      filterFn,
      onUserSelected,
      userDetails,
      usuarioDetalle,
      NewUserDetails,
      selectedNewUserId,
      submitResult,
      onSubmit
    }
  }
}
</script>

  <style scoped>
  .q-border-dark {
    border: 1px solid #000;
  }
  .cardGralStyle{
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 80%;
    align-items: center;
    justify-content: center;
  }
  .instrumentos-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.instrumentos-list::-webkit-scrollbar {
  width: 8px;
}

.instrumentos-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
  </style>
