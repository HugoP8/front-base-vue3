<template>
    <q-page>
      <Titulo :titulo="instrumento?.nombreDocumento">
        <template v-slot:subtitle>
          <Estado :estado="instrumento?.estado" />
          <div class="text-body2 q-my-sm">Periodicidad: {{ instrumento.periodicidad }}</div>
          <div class="text-body2 q-my-sm">Fecha Plazo: {{ instrumento.fechaPlazo }}</div>
          <div class="text-body2 q-my-sm">Número de recomendaciones: {{ instrumento.numeroRecomendacion }}</div>
          <q-btn v-if="usuario.rol?.id === roles.OPERADOR_MJTI && instrumento.estado === 'PROCESADO'" color="grey-10" icon="campaign" label="generar recordatorios" @click="generarRecordatorios" />
        </template>
      </Titulo>
      <div class="row" :class="{'q-px-xl':$q.screen.gt.lg,'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
        <div class="col-xs-12">
          <CrudTable
            :filters="filters"
            :columns="columns"
            :url="urlGetRecomendaciones"
            :order="'createdAt'"
          >
            <template v-slot:buttons="{ open }">
              <q-btn
                v-if="permisos.crear"
                icon="add"
                color="secondary"
                @click="openModal(open)"
                label="Agregar Recomendación"
              />
            </template>
            <template v-slot:buttons-end>
              <q-btn
                v-if="(usuario.idUser === instrumento.userCreated && usuario.rol?.id === roles.OPERADOR_MJTI && !['PROCESADO', 'DERIVADO'].includes(instrumento.estado))"
                icon="send"
                @click="derivar()"
              >
              <q-tooltip>Derivar</q-tooltip>
              </q-btn>
            <q-btn
              v-if="(usuario.rol?.id === roles.SUPERVISOR_MJTI && instrumento.estado === 'DERIVADO') && hayObservacion"
              icon="send"
              @click="observar()"
            >
              <q-tooltip>Observar</q-tooltip>
            </q-btn>

            <q-btn
            v-else-if="(usuario.rol?.id === roles.SUPERVISOR_MJTI && instrumento.estado === 'DERIVADO')"
                icon="send"
                @click="aprobar()"
              >
              <q-tooltip>Aprobar</q-tooltip>
            </q-btn>
            </template>
            <template v-slot:form="{ close, update}">
              <q-card style="width: 700px; max-width: 90vw;">
                <q-toolbar class="q-pa-md">
                  <q-icon
                    name="home_work"
                    size="md"
                  />
                  <q-toolbar-title>
                    {{ recomendacionValue.id ? 'Editar' : 'Agregar' }} recomendación
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
                  <Recomendacion
                    v-model:valores="recomendacionValue"
                    @guardar="guardar(update, close)"
                    @cancelar="closeModal(close)"
                    :revisar="revisar"
                    :fechaPlazoInstrumento="instrumento.fechaPlazo"
                    :idSistema="instrumento.idSistema"
                    :instrumentoNombre="instrumento.nombreDocumento"
                  ></Recomendacion>
                </q-card-section>
              </q-card>
            </template>
            <template v-slot:row="{ row, open, eliminar }">
                <q-tr :class="{ 'row-with-observacion': row.estado === 'OBSERVADO' }">
                  <q-td class="text-center">
                  <q-btn
                    v-if="(usuario.rol?.id === roles.OPERADOR_MJTI && usuario.idUser === row.userCreated) && (instrumento.estado === 'CREADO'|| (instrumento.estado === 'OBSERVADO' && row.estado === 'OBSERVADO') )"
                    class="q-pa-xs"
                    flat
                    round
                    icon="edit"
                    @click="openModal(open, row.id)"
                  >
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="(usuario.rol?.id === roles.SUPERVISOR_MJTI && ['DERIVADO'].includes(instrumento.estado)) ||
                    (usuario.rol?.id === roles.SUPERVISOR_MJTI && instrumento.estado !== 'OBSERVADO' && row.estado === 'CREADO')"
                    class="q-pa-xs"
                    flat
                    round
                    icon="visibility"
                    @click="openModal(open, row.id)"
                  >
                    <q-tooltip>Revisar</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="(usuario.rol?.id === roles.OPERADOR_MJTI && usuario.idUser === row.userCreated) && (instrumento.estado === 'CREADO'|| (instrumento.estado === 'OBSERVADO' && row.estado === 'OBSERVADO') )"
                    class="q-pa-xs"
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="eliminar({ url: `${url}/${row.id}` })"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-td>
                <!-- <q-td>{{ row.estado }}</q-td> -->
                <q-td>{{ row.codigo }}</q-td>
                <q-td>{{ row.instrumento.sistema.nombre }}</q-td>
                <q-td>{{ row.idPoblacion && row.idPoblacion.length > 0 ? row.idPoblacion.map(poblacion => poblacion.nombre).join(', ') : '' }}</q-td>
                <q-td>{{ row.recomendacion }}</q-td>
                <q-td>
                  <q-item v-for="entidad in row.entidades" :key="entidad.id" style="width: 100%;">
                    <q-item-section>
                      <q-item-label>{{ entidad.nombre }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-td>
                <q-td>{{ row.idTematicaEspecifica && row.idTematicaEspecifica.length > 0 ? row.idTematicaEspecifica.map(temaEspecifico => temaEspecifico.nombre).join(', ') : '' }}</q-td>
                <q-td>{{ row.sugerenciaRecomendacion }}</q-td>
                <q-td>
                  <q-item v-for="recomendacion in row.recomendacionesVinculadas" :key="recomendacion.id" style="width: 100%;">
                    <q-item-section>
                      <q-item-label>{{ recomendacion.vinculada.instrumento.nombreDocumento }}</q-item-label>
                      <q-item-label caption> Numeral {{ recomendacion.vinculada.codigo }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-td>
                <q-td style="white-space: nowrap; text-align: center;">{{ formatFecha(row.fechaPlazo) }}</q-td>
                <q-td style="min-width: 10rem; width: auto;"  v-if="row.observacion">{{row.observacion}}</q-td>
              </q-tr>
            </template>
          </CrudTable>
        </div>
      </div>
    </q-page>
</template>

<script>
import { ref, inject, onMounted, computed, watch } from 'vue'
import { constants } from '../constants/app'
import CrudTable from '@components/common/CrudTable'
import Recomendacion from 'components/Formularios/Recomendacion.vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar, date } from 'quasar'
import { useStore } from 'vuex'

const { formatDate } = date
const filters = [
  {
    label: 'Recomendacion',
    field: 'recomendacion',
    type: 'input'
  },
  {
    label: 'Instrucciones para el llenado',
    field: 'sugerenciaRecomendacion',
    type: 'input'
  }
]

const columnsDefault = [
  {
    name: 'acciones',
    label: 'Acciones',
    sortable: false
  },
  {
    name: 'codigo',
    label: 'Código',
    sortable: false
  },
  {
    name: 'idSistema',
    label: 'Sistema',
    sortable: false
  },
  {
    name: 'idPoblacion',
    label: 'Población',
    sortable: false
  },
  {
    name: 'recomendacion',
    label: 'Recomendacion',
    sortable: false
  },
  {
    name: 'entidad',
    label: 'Entidad Responsable',
    sortable: false
  },
  {
    name: 'temaEspecifico',
    label: 'Temas Específicos',
    sortable: false
  },
  {
    name: 'sugerencia',
    label: 'Instrucciones para el llenado',
    sortable: false
  },
  {
    name: 'recomendacionVinculada',
    label: 'Recomendacion vinculada',
    sortable: false
  },
  {
    name: 'Plazo',
    label: 'Plazo',
    sortable: false
  }
]

export default {
  components: { CrudTable, Recomendacion },
  name: 'Recomendaciones',
  setup () {
    const _http = inject('http')
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const idInstrumento = route.params.id
    const numeroRecomendacion = ref(null)
    const url = ref('internacional/recomendaciones')
    const instrumento = ref({})
    const urlGetRecomendaciones = ref(`internacional/recomendaciones?idInstrumento=${idInstrumento}`)
    const recomendacionValue = ref({
      entidades: [],
      recomendacionesVinculadas: []
    })
    const columns = ref([...columnsDefault])
    const hayObservacion = ref(false)
    const estadoRecomendacion = ref(false)

    const usuario = computed(() => store.state.global.usuario)
    const revisar = computed(() => (!!recomendacionValue.value.id && (instrumento.value.estado === 'DERIVADO' || (usuario.value.rol?.id === constants.roles.SUPERVISOR_MJTI && instrumento.value.estado === 'OBSERVADO'))))
    const permisos = computed(() => {
      return {
        crear: ['CREADO'].includes(instrumento.value.estado)
      }
    })

    const resetForm = () => {
      recomendacionValue.value = {
        entidades: [],
        recomendacionesVinculadas: []
      }
    }

    onMounted(async () => {
      await getInformacionInstrumento()
      await obtenerRecomendacion()
      await obtenerEstadoRecomendacion()
      await updateColumns()
    })
    watch(instrumento, () => {
      obtenerRecomendacion()
      obtenerEstadoRecomendacion()
      updateColumns()
    })

    const getInformacionInstrumento = async () => {
      const response = await _http.get(`internacional/instrumentos/${idInstrumento}`)
      numeroRecomendacion.value = response.numeroRecomendacion
      instrumento.value = response
    }

    const openModal = async (open, id) => {
      resetForm()
      if (id) {
        const respuesta = await _http.get(`/${url.value}/${id}`)
        respuesta.recomendacionesVinculadas = respuesta.recomendacionesVinculadas.map(e => e.vinculada)
        recomendacionValue.value = respuesta
      }
      open()
    }

    const closeModal = (close) => {
      resetForm()
      close()
    }

    const guardar = async (update, close) => {
      recomendacionValue.value.recomendacionesVinculadas = recomendacionValue.value.recomendacionesVinculadas.map(e => e.id)
      if (recomendacionValue.value.id) {
        if (!revisar.value) {
          await _http.put(`${url.value}/${recomendacionValue.value.id}`, recomendacionValue.value)
        } else {
          const observacion = recomendacionValue.value.nuevaObservacion
          if (observacion && observacion.length > 0) {
            await _http.patch(`${url.value}/${recomendacionValue.value.id}/estado`, { estado: 'OBSERVADO', observacion })
          }
        }
      } else {
        recomendacionValue.value.idInstrumento = idInstrumento
        recomendacionValue.value.numeroRecomendacion = numeroRecomendacion.value
        await _http.post(`${url.value}`, recomendacionValue.value)
      }
      await getInformacionInstrumento()
      await update()
      closeModal(close)
    }
    const obtenerRecomendacion = async () => {
      const response = await _http.get(urlGetRecomendaciones.value)
      hayObservacion.value = response.rows.some(recomendacion => recomendacion.observacion && recomendacion.observacion.trim() !== '')
      return hayObservacion.value
    }
    const obtenerEstadoRecomendacion = async () => {
      const response = await _http.get(urlGetRecomendaciones.value)
      estadoRecomendacion.value = response.rows.some(recomendacion =>
        recomendacion.estado === 'OBSERVADO'
      )
      return estadoRecomendacion.value
    }
    const derivar = async () => {
      if (estadoRecomendacion.value === true) {
        $q.dialog({
          title: 'Observaciones pendientes',
          message: 'Existen observaciones pendientes. Debe corregirlas antes de derivar el instrumento.',
          ok: true
        })
        return
      }
      const configuracion = { ...constants.PROP_DIALOG }
      configuracion.message = '¿Esta seguro de derivar el instrumento?'
      $q.dialog(configuracion).onOk(async () => {
        try {
          const respuesta = await _http.put(`internacional/instrumentos/${idInstrumento}/derivar`)
          if (respuesta) {
            if (respuesta?.firmar?.link) {
              window.location = respuesta.firmar.link
              return
            }
            router.push({ name: 'bandejaInstrumentos' })
          }
        } catch (error) {
          console.log('error')
        }
      })
    }
    const aprobar = async () => {
      const configuracion = { ...constants.PROP_DIALOG }
      configuracion.message = '¿Esta seguro de aprobar el instrumento?'
      $q.dialog(configuracion).onOk(async () => {
        try {
          const respuesta = await _http.put(`internacional/instrumentos/${idInstrumento}/derivar`)
          if (respuesta) {
            if (respuesta?.firmar?.link) {
              window.location = respuesta.firmar.link
              return
            }
            router.push({ name: 'bandejaInstrumentos' })
          }
        } catch (error) {
          console.log('error')
        }
      })
    }
    const observar = async () => {
      const configuracion = { ...constants.PROP_DIALOG }
      configuracion.message = '¿Esta seguro de Observar el instrumento?'
      $q.dialog(configuracion).onOk(async () => {
        try {
          const respuesta = await _http.put(`internacional/instrumentos/${idInstrumento}/derivar`)
          if (respuesta) {
            if (respuesta?.firmar?.link) {
              window.location = respuesta.firmar.link
              return
            }
            router.push({ name: 'bandejaInstrumentos' })
          }
        } catch (error) {
          console.log('error')
        }
      })
    }

    const generarRecordatorios = () => {
      router.push({ name: 'recordatorios' })
    }
    const updateColumns = async () => {
      try {
        const response = await _http.get(urlGetRecomendaciones.value)
        const hayObservacion = response.rows.some(recomendacion =>
          recomendacion.observacion && recomendacion.observacion.trim() !== ''
        )

        if (hayObservacion === true) {
          const observacionColumn = { name: 'observacion', label: 'Observación', sortable: false }
          if (!columns.value.find(col => col.name === 'observacion')) {
            columns.value.push(observacionColumn)
          }
        } else {
          columns.value = columns.value.filter(col => col.name !== 'observacion')
        }
      } catch (error) {
        console.error('Error al obtener recomendaciones:', error)
      }
    }
    // const updateColumns = async () => {
    //   if (hayObservacion.value) {
    //     const observacionColumn = { name: 'observacion', label: 'Observación', sortable: false }
    //     if (!columns.value.find(col => col.name === 'observacion')) {
    //       columns.value.push(observacionColumn)
    //     }
    //   } else {
    //     columns.value = columns.value.filter(col => col.name !== 'observacion')
    //   }
    // }
    function formatFecha (fecha) {
      const [year, month, day] = fecha.split('-')
      return `${day}-${month}-${year}`
    }
    return {
      instrumento,
      recomendacionValue,
      filters,
      columns,
      url,
      urlGetRecomendaciones,
      closeModal,
      openModal,
      guardar,
      revisar,
      derivar,
      usuario,
      permisos,
      generarRecordatorios,
      roles: constants.roles,
      formatDate,
      aprobar,
      observar,
      obtenerRecomendacion,
      hayObservacion,
      formatFecha,
      obtenerEstadoRecomendacion,
      estadoRecomendacion
    }
  }
}
</script>
<style scoped>
.bandeja{
  color: white;
}
.row-with-observacion {
  background-color: #ffd2eb;
}
</style>
