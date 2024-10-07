<template>
    <Titulo></Titulo>
    <div class="row justify-center">
        <div class="col-xs-12 col-md-11 col-lg-10">
            <q-card>
              <div class="col-xs-12" v-if="['OBSERVADO'].includes(informe.estado) && informe.observacion">
                <div class="alert alert--error">
                  {{ informe.observacion }}
                </div>
              </div>
                <q-card-section class="sticky-header">
                    <div class="row justify-center">
                        <div class="col-xs-6 col-md-5 col-lg-5 q-pt-lg" style="position: sticky !important;">
                            <q-btn
                                v-if="['CREADO', 'OBSERVADO'].includes(informe?.estado)"
                                color="negative"
                                icon="picture_as_pdf"
                                round
                                class="q-mr-sm"
                                @click="generarPdf"
                            >
                                <q-tooltip>Previsualizar</q-tooltip>
                            </q-btn>
                            <q-btn
                               v-if="['CREADO', 'OBSERVADO'].includes(informe?.estado)"
                                color="positive"
                                icon="save"
                                round
                                class="q-mr-sm"
                                @click="actualizar"
                            >
                                <q-tooltip>guardar</q-tooltip>
                            </q-btn>
                            <q-btn
                                v-if="['CREADO', 'OBSERVADO'].includes(informe?.estado)"
                                color="orange-7"
                                icon="send"
                                round
                                class="q-mr-sm"
                                @click="derivar"
                            >
                                <q-tooltip>Firmar documento</q-tooltip>
                            </q-btn>
                        </div>
                        <div class="col-xs-6 col-md-5 col-lg-5 q-pt-lg text-right" style="position: sticky !important;">
                            <Estado :estado="informe.estado"/>
                        </div>
                        <div class="col-xs-12 col-md-11 col-lg-10 text-bold text-h6 text-center">
                            {{ informe.nombre }}
                        </div>
                    </div>
                </q-card-section>
                <q-card-section>
                    <div class="row justify-center">
                        <div class="col-xs-12 col-md-10 col-lg-10">
                            <EditorField
                                v-for="(elemento,index) in informe.contenido"
                                :key="index"
                                :element="elemento"
                                v-model:value="elemento.value"
                                v-model:cantidad="elemento.cantidad"
                                :edicion="['CREADO', 'OBSERVADO'].includes(informe?.estado)"
                                @updateWordCount="updateTotalWordCount"
                                @update:modelValue="(newValue) => elemento.label = newValue"
                            />
                        </div>
                    </div>
                    <div class="row" v-if="usuario.rol?.id === roles.OPERADOR_MJTI">
                      <div class="col-xs-12 text-right text-caption text-grey-9 text-bold contador">
                      Total de palabras: {{ totalWordCount }}
                      </div>
                    </div>
                </q-card-section>
                <q-card-section class="sticky-header">
                    <div class="row justify-center">
                        <div class="col-xs-12 col-md-11 col-lg-10 text-bold text-h6 text-center">
                            ANEXOS
                        </div>
                        <div class="col-xs-12 q-pt-md" style="overflow-x: auto;">
                            <q-table
                                :rows="recomendaciones"
                                :columns="columns"
                                wrap-cells
                                flat
                                style="min-width: 100rem;"
                            >
                                <template v-slot:body="{row}">
                                    <q-tr style="text-align: justify;">
                                        <q-td>{{ row?.recomendacionEntidad?.instrumento?.nombreDocumento }}</q-td>
                                        <q-td>
                                          {{ row?.recomendacionEntidad?.recomendacion?.idTematicaEspecifica
                                            ? row.recomendacionEntidad.recomendacion.idTematicaEspecifica.map(tematicaEspecifica => tematicaEspecifica.nombre).join(', ')
                                            : '' }}
                                        </q-td>
                                        <q-td>
                                          {{ row?.recomendacionEntidad?.recomendacion?.idPoblacion
                                            ? row.recomendacionEntidad.recomendacion.idPoblacion.map(poblacion => poblacion.nombre).join(', ')
                                            : '' }}
                                        </q-td>
                                        <q-td>{{ row?.recomendacionEntidad?.entidad?.nombre }}</q-td>
                                        <q-td style="width: 100rem;">{{ row?.recomendacionEntidad?.recomendacion?.recomendacion }}</q-td>
                                        <q-td>{{ row?.recomendacionEntidad?.avances[0]?.actividadRealizada }}</q-td>
                                        <q-td style="width: 180rem;">{{ row?.recomendacionEntidad?.avances[0]?.detalleActividadRealizada }}</q-td>
                                        <q-td>{{ row?.recomendacionEntidad?.avances[0]?.estadoAvance }}</q-td>
                                    </q-tr>
                                </template>
                            </q-table>
                        </div>
                    </div>
                      <q-card-section v-if="['DERIVADO'].includes(informe.estado) && usuario.rol?.id === roles.SUPERVISOR_MJTI">
                        <q-field class="q-mb-md">
                          <q-input
                            v-model="informe.observacion"
                            outlined
                            class="col-xs-12 col-md-12"
                            type="textarea"
                            autogrow
                            :rows="1"
                            label="Observación:"
                            clearable
                          />
                        </q-field>
                        <div class="col-xs-6 col-md-5 col-lg-5 q-pt-lg text-right">
                          <q-btn
                            :label="buttonProps.label"
                            :color="buttonProps.color"
                            :type="buttonProps.type"
                            @click="handleButtonAction"
                          />
                        </div>
                      </q-card-section>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>
<script>
import { inject, onMounted, ref, computed } from 'vue'
import EditorField from 'components/common/EditorField.vue'
import { constants } from '../constants/app'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

const columns = [
  {
    name: 'instrumento',
    label: 'Informe',
    sortable: false,
    align: 'center'
  },
  {
    name: 'temaEspecifico',
    label: 'Tema especifico',
    sortable: false,
    align: 'center'
  },
  {
    name: 'poblacion',
    label: 'Población',
    sortable: false,
    align: 'center'
  },
  {
    name: 'entidad',
    label: 'E. responsable',
    sortable: false,
    align: 'center'
  },
  {
    name: 'recomendacion',
    label: 'Recomendacion',
    sortable: false,
    align: 'center'
  },
  {
    name: 'actividad',
    label: 'Actividad realizada',
    sortable: false,
    align: 'center'
  },
  {
    name: 'detalleActividadRealizada',
    label: 'Detalle de actividad realizada',
    sortable: false,
    align: 'center'
  },
  {
    name: 'estado',
    label: 'Estado',
    sortable: false,
    align: 'center'
  }
]

export default {
  name: 'Informe',
  components: { EditorField },
  setup () {
    const _http = inject('http')
    const _message = inject('message')
    const $q = useQuasar()

    const Route = useRoute()
    const Router = useRouter()
    const store = useStore()
    const idInforme = Route.params.id
    const informe = ref({})
    const recomendaciones = ref([])
    const totalWordCount = ref(0)

    const usuario = computed(() => store.state.global.usuario)

    onMounted(async () => {
      await getInformacion()
    })

    const getInformacion = async () => {
      const respuesta = await _http.get(`internacional/informes/${idInforme}`)
      informe.value = respuesta.informe
      recomendaciones.value = respuesta.recomendaciones
    }

    const actualizar = async () => {
      const respuesta = await _http.put(`internacional/informes/${idInforme}`, informe.value)
      if (respuesta) {
        _message.success('Operación realizada con éxito.')
      }
    }

    const derivar = async () => {
      const configuracion = { ...constants.PROP_DIALOG }
      configuracion.message = '¿Esta seguro de derivar el informe?'
      $q.dialog(configuracion).onOk(async () => {
        try {
          await actualizar()
          const respuesta = await _http.put(`internacional/informes/${idInforme}/derivar`)
          if (respuesta) {
            if (respuesta?.firmar?.link) {
              window.location = respuesta.firmar.link
              return
            }
            Router.push({ name: 'informes' })
          }
        } catch (error) {
          console.log('error')
        }
      })
    }

    const generarPdf = async () => {
      store.commit('global/setPreviewPdfDocumento', [true, {
        url: `internacional/informes/${idInforme}/pdf`,
        nombre: 'Borrador informe PDF'
      }])
    }
    const updateTotalWordCount = (diff) => {
      totalWordCount.value += diff
    }
    const isObservacionNotEmpty = computed(() => {
      return informe.value.observacion && informe.value.observacion.trim().length > 0
    })

    const buttonProps = computed(() => {
      return isObservacionNotEmpty.value
        ? { label: 'OBSERVAR', color: 'negative', type: 'submit' }
        : { label: 'APROBAR', color: 'positive', type: 'button' }
    })
    const handleButtonAction = async () => {
      if (buttonProps.value.label === 'OBSERVAR') {
        const configuracion = { ...constants.PROP_DIALOG }
        configuracion.message = '¿Esta seguro de observar el informe?'
        $q.dialog(configuracion).onOk(async () => {
          const observacion = informe.value.observacion
          if (observacion && observacion.length > 0) {
            await _http.patch(`internacional/informes/${idInforme}/estado`, { estado: 'OBSERVADO', observacion })
          }
          Router.push({ name: 'informes' })
        })
      } else {
        const configuracion = { ...constants.PROP_DIALOG }
        configuracion.message = '¿Esta seguro de aprobar el informe?'
        $q.dialog(configuracion).onOk(async () => {
          try {
            await actualizar()
            const respuesta = await _http.put(`internacional/informes/${idInforme}/derivar`)
            if (respuesta) {
              if (respuesta?.firmar?.link) {
                window.location = respuesta.firmar.link
                return
              }
              Router.push({ name: 'informes' })
            }
          } catch (error) {
            console.log('error')
          }
        })
      }
    }
    return {
      informe,
      recomendaciones,
      actualizar,
      columns,
      generarPdf,
      derivar,
      totalWordCount,
      updateTotalWordCount,
      buttonProps,
      isObservacionNotEmpty,
      handleButtonAction,
      roles: constants.roles,
      usuario
    }
  }
}
</script>
<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: white;
}
.contador{
  padding-right: 4rem;
}
</style>
