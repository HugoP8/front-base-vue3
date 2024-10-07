<template>
  <q-form ref="formRol" class="row q-col-gutter-md" @submit.prevent>
    <div
      class="col-xs-12"
      v-if="
        valoresModel.estado === 'OBSERVADO' &&
        !esSupervisorEntidad &&
        !esSupervisorMjti &&
        !esOperadorMjti &&
        esOperador
      "
    >
      <div class="alert alert--error">
        {{ valoresModel.observacion }}
      </div>
    </div>
    <q-input
      outlined
      class="required col-xs-12 col-md-12"
      label="Actividad Realizada"
      v-model="valoresModel.actividadRealizada"
      :rules="valoresRules.actividadRealizada"
      :readonly="!puedeEditarCampos"
    >
    </q-input>
    <div v-if="!['EN_PROCESO', 'PROCESADO', 'PENDIENTE'].includes(valoresModel.estado)" class="word-count">
      Palabras: {{ wordCount }}
    </div>
    <q-input
      outlined
      class="required col-xs-12 col-md-12"
      label="Detalle de la Actividad Realizada"
      v-model="valoresModel.detalleActividadRealizada"
      :rules="[validateWordCount]"
      :readonly="!puedeEditarCampos"
      type="textarea"
      @input="onInput"
      :error="wordCountError"
      error-message="El detalle de la actividad debe tener entre 400 y 600 palabras"
      :style="{ height: '180px' }"
    />
    <q-select
      outlined
      :options="estadoAvance"
      option-value="id"
      option-label="nombre"
      label="Avance"
      map-options
      emit-value
      v-model="valoresModel.estadoAvance"
      :rules="valoresRules.estadoAvance"
      :readonly="revisar || !puedeEditarCampos"
      class="col-xs-12 col-md-6 required"
    />
    <q-input
      outlined
      class="required col-xs-12 col-md-6"
      label="Fecha a Realizar"
      :dense="dense"
      v-model="valoresModel.fechaRealizacion"
      :rules="[...valoresRules.fechaRealizacion, validaFechaPasada]"
      :readonly="revisar || !puedeEditarCampos"
      :disable="fechaEnCurso || esSupervisorEntidad"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer" />
      </template>
      <q-popup-proxy v-if="!esReadonly" ref="popupProxy">
        <q-date
          v-model="valoresModel.fechaRealizacion"
          mask="YYYY-MM-DD"
          :options="(date) => fechaActual < date"
        />
      </q-popup-proxy>
    </q-input>
    <q-input
      outlined
      class="required col-xs-12 col-md-12"
      label="Medio de Verificación"
      v-model="valoresModel.medioVerificacion"
      :rules="valoresRules.medioVerificacion"
      :readonly="revisar || !puedeEditarCampos"
    ></q-input>
    <q-file
      class="col-xs-12 col-md-12"
      color="primary"
      max-file-size="10627576"
      outlined
      v-model="valoresModel.archivoAdjunto"
      label="Archivo Adjunto (10MB)"
      accept=".pdf, .png, .jpg, .jpeg"
      :readonly="revisar || !puedeEditarCampos"
      @rejected="onRejected"
      >
      <template v-slot:prepend>
        <q-icon name="attach_file" />
      </template>
      <template v-if="valoresModel.archivoAdjunto && !revisar" v-slot:append>
        <q-icon
          name="cancel"
          v-if="!esSupervisorEntidad"
          @click.stop.prevent="valoresModel.archivoAdjunto = null"
          class="cursor-pointer"
        />
      </template>
    </q-file>
    <div
      class="col-xs-12 col-md-12 text-right"
      v-if="
        valoresModel.nombreArchivo &&
        !['OBSERVADO', 'PROCESADO'].includes(valoresModel.estado)
      "
    >
      <q-btn
        flat
        color="secondary"
        label="Descargar"
        icon="cloud_download"
        @click="descargarAdjunto(valoresModel.nombreArchivo)"
      />
    </div>
    <q-input
      outlined
      class="col-xs-12 col-md-12"
      label="URL adjunto"
      :readonly="revisar || !puedeEditarCampos"
      v-model="valoresModel.urlAdjunto"
      />
    <div
      class="col-xs-12 col-md-12"
      v-if="
        mostrarCampoObservacion ||
        puedeVerObservacionesPeroNoEditar ||
        puedeEditarObservacionMJTI
      "
    >
      <q-input
        outlined
        class="required col-xs-12 col-md-12"
        label="Observacion"
        type="textarea"
        autogrow
        :maxlength="500"
        :readonly="!puedeEscribirObservaciones || puedeVerObservacionesPeroNoEditar"
        v-model="valoresModel.observacion"
      />
    </div>
    <div v-if="puedeVerBotonesOperador" class="col-xs-12 text-right">
      <q-btn label="Cancelar" @click="$emit('cancelar')" />
      <q-btn
        label="Aceptar"
        type="submit"
        @click="verificaGuardar"
        color="primary"
        class="q-ml-sm"
      />
    </div>
    <div v-if="puedeVerBotonesObservarYAprobar" class="col-xs-12 text-right">
      <q-btn
        label="Observar"
        :disabled="botonObservarDeshabilitado"
        @click="$emit('observarSupervisor')"
        type="submit"
        class="q-ml-sm"
      />
      <q-btn
        label="Aprobar"
        :disabled="botonAprobarDeshabilitado"
        @click="$emit('aprobarSupervisor')"
        type="submit"
        color="primary"
        class="q-ml-sm"
      />
    </div>
    <div
      v-if="puedeVerBotonesSupervisorMjti && !puedeVerBotonesSupervisorMjtiObservado"
      class="col-xs-12 text-right"
    >
      <q-btn
        label="Observar"
        :disabled="botonObservarDeshabilitado"
        @click="$emit('observarMJTI')"
        type="submit"
        class="q-ml-sm"
      />
      <q-btn
        label="Aceptar"
        :disabled="botonAprobarDeshabilitado"
        @click="$emit('aceptarMJTI')"
        type="submit"
        color="primary"
        class="q-ml-sm"
      />
    </div>
  </q-form>
</template>
<script>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { date, useQuasar } from 'quasar'
import { useVModel } from '../../composables/useVModel.js'
import validaciones from '../../common/validations'
import { useStore } from 'vuex'
import { constants } from '../../constants/app.js'
const valoresRules = {
  actividadRealizada: [validaciones.requeridoBlanco],
  estadoAvance: [validaciones.requerido],
  medioVerificacion: [validaciones.requeridoBlanco],
  fechaRealizacion: [validaciones.requerido],
  detalleActividadRealizada: [validaciones.requeridoBlanco]
}

export default {
  props: {
    valores: {
      type: Object,
      default: () => ({})
    },
    revisar: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const store = useStore()
    const valoresModel = useVModel(props, 'valores')
    const archivoAdjunto = ref(null)
    const esSupervisorEntidad = ref(false)
    const esSupervisorMjti = ref(false)
    const esOperadorMjti = ref(false)
    const esOperador = ref(false)
    const formRol = ref(null)
    const $q = useQuasar()
    const _http = inject('http')
    const roles = constants.roles
    const usuario = computed(() => store.state.global.usuario)
    const wordCount = ref(0)
    const wordCountError = ref(false)
    const tieneObservacion = computed(() => valoresModel.value.observacion)
    const botonObservarDeshabilitado = ref(true)
    const botonAprobarDeshabilitado = ref(false)

    const estadoAvance = ref([
      { nombre: 'REALIZADA', id: 'REALIZADA' },
      { nombre: 'EN CURSO', id: 'EN_CURSO' }
    ])
    const validateWordCount = (val) => {
      if (!val || val.trim() === '') {
        wordCountError.value = true
        return 'Este campo es obligatorio'
      }

      const words = val.trim().split(/\s+/)
      wordCount.value = words.length
      if (wordCount.value < 400 || wordCount.value > 600) {
        wordCountError.value = true
        return false
      } else {
        wordCountError.value = false
        return true
      }
    }

    const onInput = (val) => {
      validateWordCount(val)
    }

    onMounted(async () => {
      if (
        valoresModel.value.observacion &&
        valoresModel.value.observacion.trim().length > 0
      ) {
        botonObservarDeshabilitado.value = false
        botonAprobarDeshabilitado.value = true
      }
      if (usuario.value.idRol === roles.OPERADOR_ENTIDAD) {
        esOperador.value = true
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
      if (props.valores.rutaArchivo) {
        try {
          const fileBlob = await _http.getFile(
            `internacional/recomendacion-avance/adjunto/${props.valores.nombreArchivo}`,
            {
              blob: true
            }
          )
          const file = new File([fileBlob], props.valores.nombreArchivo, {
            type: fileBlob.type
          })
          valoresModel.value.archivoAdjunto = file
        } catch (error) {}
      }
    })
    const fechaEnCurso = computed(() => {
      return valoresModel.value.estadoAvance !== 'EN_CURSO'
    })
    async function validaFechaPasada (val) {
      if (!val) return true
      const today = new Date().setHours(0, 0, 0, 0)
      const selectedDate = new Date(val).setHours(0, 0, 0, 0)
      return selectedDate >= today || 'La fecha no puede ser menor a la fecha actual'
    }
    const fechaActual = date.formatDate(new Date(), 'YYYY/MM/DD')
    watch(
      () => valoresModel.value.estadoAvance,
      (estado) => {
        if (estado === 'EN_CURSO') {
          valoresModel.value.fechaRealizacion = ''
        }
      }
    )

    const validaUrlArchivo = (val) => {
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' +
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
          '((\\d{1,3}\\.){3}\\d{1,3}))' +
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
          '(\\?[;&a-z\\d%_.~+=-]*)?' +
          '(\\#[-a-z\\d_]*)?$',
        'i'
      )
      if (valoresModel.value.archivoAdjunto && !val) {
        return true
      }
      return !!pattern.test(val) || 'URL no válida'
    }

    watch(
      () => ({
        observacion: valoresModel.value.observacion,
        estadoAvance: valoresModel.value.estadoAvance
      }),
      ({ observacion, estadoAvance }) => {
        if (observacion && observacion.trim().length > 0) {
          botonObservarDeshabilitado.value = false
          botonAprobarDeshabilitado.value = true
        } else {
          botonObservarDeshabilitado.value = true
          botonAprobarDeshabilitado.value = false
        }
        if (estadoAvance !== 'EN_CURSO') {
          valoresModel.value.fechaRealizacion = null
        }
      }
    )
    const descargarAdjunto = async (nombreAdjunto) => {
      try {
        const response = await _http.getFile(
          `internacional/recomendacion-avance/adjunto/${nombreAdjunto}`
        )
        const link = document.createElement('a')
        link.href = response
        link.download = nombreAdjunto
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(response)
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Error al descargar el archivo adjunto'
        })
      }
    }

    const puedeEscribirObservaciones = computed(() => {
      return (
        (esSupervisorEntidad.value && valoresModel.value.estado === 'EN_PROCESO') ||
        (esOperadorMjti.value && valoresModel.value.estado === 'PENDIENTE') ||
        (esSupervisorMjti.value && valoresModel.value.estado === 'DERIVADO')
      )
    })

    const puedeVerObservacionesYBotones = computed(() => {
      if (esOperador.value) {
        return false
      }
      if (esSupervisorEntidad.value) {
        return ['EN_PROCESO', 'DERIVADO'].includes(valoresModel.value.estado)
      }
      if (esSupervisorMjti.value) {
        return ['PENDIENTE', 'DERIVADO'].includes(valoresModel.value.estado)
      }
      return false
    })

    const puedeVerBotonesObservarYAprobar = computed(() => {
      return (
        (esSupervisorEntidad.value && valoresModel.value.estado === 'EN_PROCESO') ||
        (esOperadorMjti.value && valoresModel.value.estado === 'PENDIENTE') ||
        (esSupervisorMjti.value && valoresModel.value.estado === 'DERIVADO')
      )
    })

    const puedeVerObservacionesPeroNoEditar = computed(() => {
      return (
        (esSupervisorEntidad.value && valoresModel.value.estado === 'OBSERVADO') ||
        (esSupervisorMjti.value && valoresModel.value.estado === 'OBSERVADO')
      )
    })

    const puedeEditarObservacionMJTI = computed(() => {
      return esSupervisorMjti.value || esOperadorMjti.value
    })

    const puedeVerBotonesOperador = computed(() => {
      return (
        esOperador.value &&
        (valoresModel.value.estado === undefined ||
          ['OBSERVADO', 'CREADO'].includes(valoresModel.value.estado))
      )
    })

    const puedeVerBotonesSupervisorEntidad = computed(() => {
      return esSupervisorEntidad.value && valoresModel.value.estado === 'EN_PROCESO'
    })

    const puedeVerBotonesSupervisorEntidadObservado = computed(() => {
      return esSupervisorEntidad.value && valoresModel.value.estado === 'OBSERVADO'
    })

    const puedeVerBotonesSupervisorMjti = computed(() => {
      return esSupervisorMjti.value && valoresModel.value.estado === 'PENDIENTE'
    })

    const puedeVerBotonesSupervisorMjtiObservado = computed(() => {
      return esSupervisorMjti.value && valoresModel.value.estado === 'OBSERVADO'
    })

    const mostrarCampoObservacion = computed(() => {
      return (
        (esSupervisorEntidad.value && valoresModel.value.estado !== 'PENDIENTE') ||
        esSupervisorMjti.value ||
        esOperadorMjti.value
      )
    })

    const esEstadoEditablePorOperador = (estado) => {
      return ['CREADO', 'OBSERVADO'].includes(estado) || estado === undefined
    }

    const esEstadoEditablePorSupervisorEntidad = (estado) => {
      return !['EN_PROCESO', 'OBSERVADO', 'PENDIENTE', 'DERIVADO', 'CREADO', undefined].includes(estado)
    }

    const esEstadoEditablePorSupervisorMjti = (estado) => {
      return estado !== 'DERIVADO'
    }

    const puedeEditarCampos = computed(() => {
      return (
        (esOperador.value && esEstadoEditablePorOperador(valoresModel.value.estado)) ||
        (esSupervisorEntidad.value && esEstadoEditablePorSupervisorEntidad(valoresModel.value.estado)) ||
        (esSupervisorMjti.value && esEstadoEditablePorSupervisorMjti(valoresModel.value.estado))
      )
    })

    function validaFormulario () {
      return formRol.value.validate()
    }

    async function verificaGuardar () {
      const valid = await validaFormulario()
      if (!valid) {
        $q.notify({
          type: 'negative',
          message: 'Por favor complete el formulario correctamente.'
        })
        return
      }
      emit('guardar')
    }
    const onRejected = (fileList) => {
      if (fileList.length > 0) {
        fileList.forEach(file => {
          if (file.failedPropValidation === 'max-file-size') {
            $q.notify({
              type: 'negative',
              message: `El archivo "${file.name}" excede el tamaño máximo permitido de 10MB.`
            })
          }
        })
      }
    }
    return {
      estadoAvance,
      valoresModel,
      valoresRules,
      fechaEnCurso,
      validaFechaPasada,
      fechaActual,
      archivoAdjunto,
      validaUrlArchivo,
      // validaAdjunto,
      esSupervisorEntidad,
      esSupervisorMjti,
      esOperador,
      tieneObservacion,
      descargarAdjunto,
      botonObservarDeshabilitado,
      botonAprobarDeshabilitado,
      puedeVerObservacionesYBotones,
      puedeEscribirObservaciones,
      puedeVerObservacionesPeroNoEditar,
      puedeEditarObservacionMJTI,
      puedeVerBotonesObservarYAprobar,
      puedeVerBotonesOperador,
      puedeVerBotonesSupervisorEntidad,
      puedeVerBotonesSupervisorEntidadObservado,
      puedeVerBotonesSupervisorMjti,
      puedeVerBotonesSupervisorMjtiObservado,
      formRol,
      verificaGuardar,
      mostrarCampoObservacion,
      puedeEditarCampos,
      validateWordCount,
      onInput,
      wordCount,
      wordCountError,
      usuario,
      roles,
      onRejected
    }
  }
}
</script>
<style scoped>
.word-count {
  font-size: 12px;
  margin-top: -1rem;
  margin-bottom: -1rem;
  color: rgb(75, 74, 74);
}
</style>
