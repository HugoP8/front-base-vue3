<template>
    <q-form
      class="row q-col-gutter-md"
      @submit="$emit('guardar')"
    >
      <div class="col-xs-12" v-if="['OBSERVADO','CREADO'].includes(valoresModel.estado) && valoresModel.observacion">
        <div class="alert alert--error">
          {{ valoresModel.observacion }}
        </div>
      </div>
      <q-input
        outlined
        class="required col-xs-12 col-md-12"
        label="Recomendación"
        v-model="valoresModel.recomendacion"
        :readonly="revisar"
        :rules="valoresRules.recomendacion"
        type="textarea"
        autogrow
        :rows="1"
        clearable
      >
      </q-input>
      <q-select
        outlined
        class="col-xs-12 col-md-12"
        label="Recomendación vinculada"
        v-model="valoresModel.recomendacionesVinculadas"
        multiple
        use-chips
        use-input
        map-options
        fill-input
        input-debounce="0"
        :options="recomendacionVinculadas"
        option-value="id"
        @filter="filtroRecomendacion"
        menu-shrink
        :readonly="revisar"
        hide-dropdown-icon
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No hay datos
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:selected-item="scope">
          <q-item class="custom-item">
            <q-item-section>
              <q-item-label class="textoRecomendacion" v-html="scope.opt.recomendacion" lines="3"></q-item-label>
              <q-item-label caption class="textoPersonalizado">
                <b>Instrumento: {{ scope.opt.instrumento.nombreDocumento }} </b> , Número: {{ scope.opt.codigo }}
              </q-item-label>
            </q-item-section>
            <q-item-section avatar v-if="!revisar">
              <q-btn color="negative" flat round icon="delete" @click="scope.removeAtIndex(scope.index)" />
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:option="scope" >
          <q-item v-bind="scope.itemProps" class="custom-item-option" style="width: 670px; max-width: 90vw;">
            <q-item-section>
              <q-item-label class="textoRecomendacion" v-html="scope.opt.recomendacion"></q-item-label>
              <q-item-label caption class="textoPersonalizado">
                <b style="color: #1c1c1c;">Instrumento: {{ scope.opt.instrumento.nombreDocumento }} </b> , Número: {{ scope.opt.codigo }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-select
        outlined
        use-input
        input-debounce="0"
        v-model="valoresModel.entidades"
        :options="entidadesFiltradas"
        multiple
        map-options
        option-value="id"
        option-label="nombre"
        label="Entidad responsable"
        use-chips
        stack-label
        emit-value
        class="required col-xs-12 col-md-12"
        :readonly="revisar"
        :rules="valoresRules.entidades"
        @filter="filterEntidades"
      >
      <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No se encontraron resultados
        </q-item-section>
      </q-item>
    </template>
  </q-select>
      <q-select
        outlined
        v-model="valoresModel.idTematica"
        :options="tematicas"
        option-value="id"
        option-label="nombre"
        label="Temática"
        map-options
        emit-value
        class="required col-xs-12 col-md-12"
        :readonly="revisar"
        :rules="valoresRules.idTematica"
      />
    <q-select
      outlined
      v-model="valoresModel.idTematicaEspecifica"
      :options="tematicasEspecificas"
      option-value="id"
      option-label="nombre"
      label="Temas específicos"
      map-options
      multiple
      use-chips
      class="required col-xs-12 col-md-12"
      :readonly="revisar"
      :rules="valoresRules.idTematicaEspecifica"
      />
    <q-select
      outlined
      v-model="valoresModel.idPoblacion"
      :options="poblaciones"
      option-value="id"
      option-label="nombre"
      label="Población"
      map-options
      multiple
      use-chips
      class="required col-xs-12 col-md-12"
      :rules="valoresRules.idPoblacion"
      :readonly="revisar"
      />
    <q-input
      outlined
      autogrow
      v-model="valoresModel.sugerenciaRecomendacion"
      class="required col-xs-12 col-md-12"
      label="Instrucciones para el llenado"
      :readonly="revisar"
      :rules="valoresRules.sugerenciaRecomendacion"
    >
    </q-input>
    <q-input
      outlined
      class="required col-xs-12 col-md-12"
      label="Plazo"
      v-model="valoresModel.fechaPlazo"
      :readonly="revisar"
      :rules="valoresRules.fechaPlazo"
    >
     <template v-slot:append>
      <q-icon name="event" class="cursor-pointer"/>
     </template>
      <q-popup-proxy>
        <q-date
          v-model="valoresModel.fechaPlazo"
          mask="YYYY-MM-DD"
          :options="fechaPermitida"
        />
      </q-popup-proxy>
    </q-input>
    <q-input
      v-if="revisar"
      outlined
      v-model="valoresModel.nuevaObservacion"
      class="required col-xs-12 col-md-12"
      type="textarea"
      autogrow
      :rows="1"
      label="Observacion"
      :maxlength="700"
      clearable
    />
    <div class="col-xs-12 text-right">
      <template v-if="revisar">
        <q-btn
          v-if="valoresModel.nuevaObservacion && valoresModel.nuevaObservacion.length>0"
          label="Observar"
          color="negative"
          type="submit"
        />
        <q-btn
         v-else
          label="aceptar"
          @click="$emit('cancelar')"
          color="primary"
          class="q-ml-sm"
        />
      </template>
      <template v-else>
        <q-btn
          label="Cancelar"
          @click="$emit('cancelar')"
        />
        <q-btn
          label="Guardar"
          type="submit"
          color="primary"
          class="q-ml-sm"
        />
        </template>
      </div>
    </q-form>
</template>
<script>
import { useVModel } from '../../composables/useVModel.js'
import { ref, onMounted, inject, computed } from 'vue'
import validaciones from '../../common/validations'
import { date } from 'quasar'

const valoresRules = {
  recomendacion: [validaciones.requeridoBlanco],
  entidades: [validaciones.arrayRequerido],
  idTematica: [validaciones.requerido],
  idTematicaEspecifica: [validaciones.arrayRequerido],
  idPoblacion: [validaciones.arrayRequerido],
  sugerenciaRecomendacion: [validaciones.requeridoBlanco],
  fechaPlazo: [validaciones.requerido]
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
    },
    fechaPlazoInstrumento: {
      type: String,
      default: ''
    },
    idSistema: {
      type: String,
      default: ''
    },
    instrumentoNombre: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const _http = inject('http')
    const valoresModel = useVModel(props, 'valores')
    const tematicas = ref([])
    const tematicasEspecificas = ref([])
    const entidades = ref([])
    const entidadesFiltradas = ref([])
    const poblaciones = ref([])
    const recomendacionesVinculadas = ref([])
    const recomendacionVinculadas = ref([])
    const fechaActual = date.formatDate(new Date(), 'YYYY/MM/DD')
    const fechaFin = computed(() => date.formatDate(props.fechaPlazoInstrumento, 'YYYY/MM/DD'))

    onMounted(async () => {
      try {
        const { rows: tematicasRows } = await _http.get('/system/parametros?grupo=tematica')
        tematicas.value = tematicasRows.sort((a, b) => a.nombre.localeCompare(b.nombre))
        const { rows: tematicasEspecificasRows } = await _http.get('/system/parametros?grupo=especifica')
        tematicasEspecificas.value = tematicasEspecificasRows.sort((a, b) => a.nombre.localeCompare(b.nombre))
        const { rows: entidadesRows } = await _http.get('/system/entidades')
        entidades.value = entidadesRows.sort((a, b) => a.nombre.localeCompare(b.nombre))
        entidadesFiltradas.value = entidades.value
        const { rows: poblacionesRows } = await _http.get('/system/parametros?grupo=poblacion')
        poblaciones.value = poblacionesRows.sort((a, b) => a.nombre.localeCompare(b.nombre))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    })
    const filtroRecomendacion = async (val, update, abort) => {
      update(async () => {
        const query = {
          palabraClave: val,
          limit: (!val || val === '') ? 5 : 10
        }
        const { rows } = await _http.get(_http.convertQuery('internacional/recomendaciones-buscar', query))
        let respuesta = rows
        if (val && val !== '') {
          const palabrasBuscadas = val.trim().split(/\s+/).join('|')
          respuesta = rows.map(item => ({
            ...item,
            recomendacion: item.recomendacion.replace(
              new RegExp(`(${palabrasBuscadas})`, 'gi'),
              '<b class="text-orange-7">$1</b>'
            )
          }))
        }
        recomendacionVinculadas.value = respuesta
      })
    }
    const fechaPermitida = (date) => {
      return date >= fechaActual && date <= fechaFin.value
    }
    const filterEntidades = (val, update) => {
      if (val === '') {
        update(() => {
          entidadesFiltradas.value = entidades.value
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        entidadesFiltradas.value = entidades.value.filter(entidad =>
          entidad.nombre.toLowerCase().includes(needle)
        )
      })
    }
    return {
      valoresModel,
      valoresRules,
      tematicas,
      entidades,
      poblaciones,
      tematicasEspecificas,
      recomendacionesVinculadas,
      filtroRecomendacion,
      recomendacionVinculadas,
      fechaActual,
      fechaFin,
      fechaPermitida,
      filterEntidades,
      entidadesFiltradas
    }
  }
}
</script>
<style scoped>
.customOption {
  color: blue;
}
.textoPersonalizado{
  text-align: right;
  font-style: italic;
}
.textoRecomendacion{
  text-align: justify;
}
.custom-item {
  white-space: normal;
  width: 100%!important;
}
</style>
