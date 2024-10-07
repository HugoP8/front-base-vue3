<template>
  <q-page>
    <Titulo :titulo="instrumento.nombreDocumento" icono="checklist"></Titulo>
    <div class="row" :class="{'q-px-xl':$q.screen.gt.lg,'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
      <div class="col-xs-12">
        <q-tabs
          @update:model-value="getBandeja"
          v-model="activeTab"
          align="justify"
          class="q-mb-md"
          active-color="white"
          indicator-color="primary"
          active-bg-color="grey-10"
          active-class="bandeja-activo"
          inline-label
        >
          <q-tab
            class="bandeja"
            v-for="tab in tabs"
            :key="tab.name"
            :name="tab.name"
            :label="tab.label"
            :icon="tab.icon"
          >
          </q-tab>
        </q-tabs>
        <q-tab-panels v-model="activeTab">
          <q-tab-panel v-for="tab in tabs" :key="tab.name" :name="tab.name" class="q-pa-none">
            <CrudTable
              :filters="filters"
              :columns="columns"
              :url="url"
              :order="'createdAt'"
              ref="crudTable"
            >
              <template v-slot:form="{ close, update }">
                <q-card style="width: 700px; max-width: 90vw;">
                  <q-toolbar class="q-pa-md">
                    <q-icon name="home_work" size="md" />
                    <q-toolbar-title>
                       {{ avances.id ? 'Editar' : 'Agregar' }} avance
                    </q-toolbar-title>
                    <q-space />
                    <q-btn flat round icon="close" @click="closeModal(close)" />
                  </q-toolbar>
                  <q-card-section>
                    <Avance
                      v-model:valores="avances"
                      @guardar="derivar(update, close)"
                      @cancelar="closeModal(close)"
                      @aprobarSupervisor="aprobar(update, close)"
                      @aceptarMJTI="aceptarMJTI(update, close)"
                      @observarSupervisor="aprobar(update, close)"
                      @observarMJTI="observarMJTI(update, close)"
                      :revisar="revisar"
                    />
                  </q-card-section>
                </q-card>
              </template>
              <template v-slot:row="{ row, open }">
                <q-tr v-if="row.instrumento.estado === 'PROCESADO'">
                  <q-td class="text-center">
                    <q-btn
                      class="q-pa-xs"
                      flat
                      round
                      :icon="obtenerIcono(row)"
                      @click="openModal(open, row)"
                      v-if="puedeVerBotonModal(row)"
                    >
                      <q-tooltip>{{ obtenerTooltip(row) }}</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="row.recomendacion.avances.some(avance => avance.idRecomendacionEntidad === row.id)"
                      flat
                      round
                      color="primary"
                      @click="verAvancesTimeline(row)"
                      icon="timeline">
                      <q-tooltip>
                        Historial Avances
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                  <q-td>{{ row.instrumento.nombreDocumento }}</q-td>
                  <q-td>{{ row?.recomendacion?.recomendacion }}</q-td>
                  <q-td>{{ tematicaEspecifica(row?.recomendacion?.idTematicaEspecifica)}}</q-td>
                  <q-td>{{ row?.recomendacion?.sugerenciaRecomendacion }}</q-td>
                  <q-td style="white-space: nowrap; text-align: center;" class="text-center">{{ row?.recomendacion?.fechaPlazo }}</q-td>
                  <q-td class="text-center">
                    <Estado :estado="esOperadorEntidad && ['CREADO', 'PROCESADO'].includes(row.estado)?'EN_PROCESO':row.estado" />
                  </q-td>
                </q-tr>
              </template>
            </CrudTable>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
    <HistorialAvanceActividad
      v-if="dialog.historial"
      :historialData="selectedData"
      @cerrar="dialog.historial=false"
    />
  </q-page>
</template>
<script>
import { ref, inject, onMounted, computed } from 'vue'
import CrudTable from '@components/common/CrudTable'
import Avance from 'components/Formularios/Avance'
import { constants } from '../constants/app'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import HistorialAvanceActividad from 'src/components/Avance/HistorialAvance.vue'

const filters = [
  {
    label: 'Instrumento',
    field: 'nombreDocumento',
    type: 'input'
  },
  {
    label: 'Recomendacion',
    field: 'recomendacion',
    type: 'input'
  }
]

const columns = [
  {
    name: 'acciones',
    label: 'Acciones',
    sortable: false
  },
  {
    name: 'instrumento',
    label: 'Instrumento',
    sortable: false
  },
  {
    name: 'recomendacion',
    label: 'Recomendacion',
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
    name: 'plazo',
    label: 'Plazo',
    sortable: false
  },
  {
    name: 'estado',
    label: 'Estado',
    sortable: false
  }
]

export default {
  components: { CrudTable, Avance, HistorialAvanceActividad },
  name: 'BanderaRecomendaciones',
  setup () {
    const _http = inject('http')
    const store = useStore()
    const activeTab = ref('pendiente')
    const router = useRouter()
    const Route = useRoute()
    const $q = useQuasar()
    const idInstrumento = Route.params.id
    const url = ref(
      _http.convertQuery(`internacional/bandejas/recomendacion-entidad?tipo=${activeTab.value}`, { idInstrumento })
    )
    const crudTable = ref(null)
    const instrumento = ref({})
    const avances = ref({})
    const recomendacionSeleccionada = ref(null)
    const esSupervisorEntidad = ref(false)
    const esSupervisorMjti = ref(false)
    const esOperadorMjti = ref(false)
    const dialog = ref({
      historial: false
    })
    const selectedData = ref(null)
    const esOperadorEntidad = ref(false)

    const usuario = computed(() => store.state.global.usuario)
    const roles = constants.roles
    const revisar = computed(() => (!!recomendacionSeleccionada.value.id && recomendacionSeleccionada.value.estado === 'DERIVADO'))

    const tabs = ref([
      { name: 'pendiente', label: 'PENDIENTE', tipo: 'pendiente', icon: 'timer' },
      { name: 'pendienteFirma', label: 'PENDIENTE DE FIRMA', tipo: 'pendienteFirma', icon: 'draw' },
      { name: 'procesado', label: 'PROCESADO', tipo: 'procesado', icon: 'verified' }
    ])
    onMounted(async () => {
      const response = await _http.get(`internacional/instrumentos/${idInstrumento}`)
      instrumento.value = response
      if (usuario.value.idRol === roles.OPERADOR_ENTIDAD) {
        esOperadorEntidad.value = true
      }
      if (usuario.value.idRol === roles.SUPERVISOR_ENTIDAD) {
        esSupervisorEntidad.value = true
      }
      if (usuario.value.idRol === roles.OPERADOR_MJTI) {
        esOperadorMjti.value = true
      }
      if (usuario.value.idRol === roles.SUPERVISOR_MJTI) {
        esSupervisorMjti.value = true
      }
    })

    const resetForm = () => {
      instrumento.value = {}
      avances.value = {}
      recomendacionSeleccionada.value = null
    }

    const getBandeja = async (tipo) => {
      url.value = _http.convertQuery(`internacional/bandejas/recomendacion-entidad?tipo=${tipo}`, { idInstrumento })
      await crudTable.value.changeUrl(url.value)
    }

    const openModal = async (open, row) => {
      resetForm()
      recomendacionSeleccionada.value = JSON.parse(JSON.stringify(row))
      if (recomendacionSeleccionada.value.idAvance && recomendacionSeleccionada.value.estado !== 'CREADO') {
        avances.value = await _http.get(`/internacional/recomendacion-avance/${recomendacionSeleccionada.value.idAvance}`)
      }
      open()
    }

    const closeModal = (close) => {
      resetForm()
      close()
    }

    const derivar = async (update, close) => {
      const configuracion = { ...constants.PROP_DIALOG }
      configuracion.message =
          'Si continua, el registro de avance de la recomendacion debera ser APROBADO con ciudadania digital'
      $q.dialog(configuracion).onOk(async () => {
        try {
          let data
          if (avances.value.archivoAdjunto) {
            const archivo = await subirArchivo(avances.value.archivoAdjunto)
            data = {
              ...avances.value,
              nombreArchivo: archivo.nombreArchivo,
              rutaArchivo: archivo.rutaArchivo
            }
          } else {
            data = {
              ...avances.value,
              nombreArchivo: avances.value.nombreArchivo,
              rutaArchivo: avances.value.rutaArchivo
            }
          }
          data.idRecomendacion = recomendacionSeleccionada.value.idRecomendacion
          data.idRecomendacionEntidad = recomendacionSeleccionada.value.id
          const avance = await _http.post('internacional/recomendacion-avance', data)
          const respuesta = await _http.put(`internacional/recomendacion-entidad/${recomendacionSeleccionada.value.id}/derivar`, { idAvance: avance.id })

          if (respuesta) {
            if (respuesta?.firmar?.link) {
              window.location = respuesta.firmar.link
              return
            }
            router.push({ name: 'bandejaRecomendaciones' })
          }
        } catch (error) {
          console.log({ error })
        }
        await update()
        closeModal(close)
      })
    }

    const subirArchivo = async (archivo) => {
      const formData = new FormData()
      formData.append('file', archivo)
      const subirAdjunto = await _http.post('internacional/recomendacion-avance/subir-adjunto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return subirAdjunto
    }

    const aprobar = async (update, close) => {
      const respuesta = await _http.put(`internacional/recomendacion-entidad/${recomendacionSeleccionada.value.id}/derivar`, { idAvance: recomendacionSeleccionada.value.idAvance, observacion: avances.value.observacion })
      if (respuesta) {
        if (respuesta?.firmar?.link) {
          window.location = respuesta.firmar.link
          return
        }
        router.push({ name: 'bandejaRecomendaciones' })
      }
      await update()
      closeModal(close)
    }

    const aceptarMJTI = async (update, close) => {
      const observacion = avances.value.observacion
      const datos = { estado: 'PROCESADO', observacion }
      const avance = await _http.patch(`internacional/recomendacion-avance/mjti/${avances.value.id}/estado`, datos)
      const respuesta = await _http.put(`internacional/recomendaciones/${recomendacionSeleccionada.value.idRecomendacion}/derivar`, { idAvance: avance.id })
      if (respuesta) {
        if (respuesta?.firmar?.link) {
          window.location = respuesta.firmar.link
          return
        }
        router.push({ name: 'bandejaRecomendaciones' })
      }

      closeModal(close)
      await update()
    }

    const observarMJTI = async (update, close) => {
      const observacion = avances.value.observacion
      const datos = { estado: observacion ? 'OBSERVADO' : 'PROCESADO', observacion }
      await _http.patch(`internacional/recomendacion-avance/mjti/${avances.value.id}/estado`, datos)
      closeModal(close)
      await update()
    }

    const getNombreCompleto = (usuario) => {
      return `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`
    }
    const obtenerIcono = (row) => {
      const esSupervisorEntidadVal = esSupervisorEntidad.value
      const esSupervisorMjtiVal = esSupervisorMjti.value
      const esOperadorMjti = usuario.value.idRol === roles.OPERADOR_MJTI
      const esOperadorEntidadVal = esOperadorEntidad.value
      if (esSupervisorMjtiVal || esOperadorMjti) {
        if (['PROCESADO', 'OBSERVADO', 'EN_PROCESO', 'PENDIENTE', 'DERIVADO', 'CREADO'].includes(row.estado)) {
          return 'visibility'
        } else {
          return 'edit'
        }
      } else if (esSupervisorEntidadVal) {
        if (['PROCESADO', 'EN_PROCESO', 'OBSERVADO', 'DERIVADO', 'PENDIENTE', 'CREADO'].includes(row.estado)) {
          return 'visibility'
        } else {
          return 'edit'
        }
      } else if (esOperadorEntidadVal) {
        if (['EN_PROCESO', 'PENDIENTE', 'DERIVADO'].includes(row.estado)) {
          return 'visibility'
        } else {
          return 'edit'
        }
      } else {
        return ['OBSERVADO', 'CREADO', 'PROCESADO'].includes(row.estado) ? 'edit' : 'visibility'
      }
    }

    const obtenerTooltip = (row) => {
      const esSupervisorEntidadVal = esSupervisorEntidad.value
      const esSupervisorMjtiVal = esSupervisorMjti.value
      const esOperadorMjti = usuario.value.idRol === roles.OPERADOR_MJTI
      const esOperadorEntidadVal = esOperadorEntidad.value

      if (esSupervisorMjtiVal || esOperadorMjti) {
        if (['PROCESADO', 'OBSERVADO', 'EN_PROCESO', 'PENDIENTE', 'DERIVADO', 'CREADO'].includes(row.estado)) {
          return 'Ver'
        } else {
          return 'Revisar'
        }
      } else if (esSupervisorEntidadVal) {
        if (['PROCESADO', 'EN_PROCESO', 'OBSERVADO', 'DERIVADO', 'PENDIENTE', 'CREADO'].includes(row.estado)) {
          return 'Ver'
        } else {
          return 'Revisar'
        }
      } else if (esOperadorEntidadVal) {
        if (['EN_PROCESO', 'PENDIENTE', 'DERIVADO'].includes(row.estado)) {
          return 'Ver'
        } else {
          return 'Agregar avance'
        }
      } else {
        return ['OBSERVADO', 'CREADO', 'PROCESADO'].includes(row.estado) ? 'Agregar avance' : 'Ver'
      }
    }

    const puedeVerBotonModal = (row) => {
      const esOperadorEntidadVal = esOperadorEntidad.value
      const esSupervisorEntidadVal = esSupervisorEntidad.value
      const esSupervisorMjtiVal = esSupervisorMjti.value
      const esOperadorMjtiVal = esOperadorMjti.value

      if (row.estado === 'PROCESADO' && (esSupervisorEntidadVal || esSupervisorMjtiVal || esOperadorMjtiVal)) {
        return false
      }
      if (esOperadorEntidadVal && ['CREADO', 'PROCESADO', 'EN_PROCESO', 'OBSERVADO', 'PENDIENTE', 'DERIVADO'].includes(row.estado)) {
        return true
      }
      if (esSupervisorEntidadVal && ['EN_PROCESO', 'OBSERVADO', 'DERIVADO', 'PENDIENTE'].includes(row.estado)) {
        return true
      }
      if (esSupervisorMjtiVal && ['EN_PROCESO', 'OBSERVADO', 'DERIVADO', 'PENDIENTE'].includes(row.estado)) {
        return true
      }
      if (esOperadorMjtiVal && ['EN_PROCESO', 'OBSERVADO', 'DERIVADO', 'PENDIENTE'].includes(row.estado)) {
        return true
      }
      return false
    }
    const tematicaEspecifica = (idTematicaEspecifica) => {
      if (!idTematicaEspecifica || !Array.isArray(idTematicaEspecifica)) {
        return ''
      }
      return idTematicaEspecifica.map(item => item.nombre).join(', ')
    }

    const verAvancesTimeline = async (data) => {
      selectedData.value = data
      dialog.value.historial = true
    }
    return {
      instrumento,
      avances,
      filters,
      columns,
      url,
      closeModal,
      openModal,
      getNombreCompleto,
      derivar,
      aprobar,
      aceptarMJTI,
      observarMJTI,
      activeTab,
      tabs,
      getBandeja,
      recomendacionSeleccionada,
      revisar,
      esSupervisorEntidad,
      esSupervisorMjti,
      esOperadorEntidad,
      esOperadorMjti,
      obtenerIcono,
      obtenerTooltip,
      verAvancesTimeline,
      puedeVerBotonModal,
      dialog,
      selectedData,
      tematicaEspecifica
    }
  }
}
</script>
<style scoped>
.bandeja{
  color: white;
  border-radius: 15px;
}
</style>
