<template>
  <q-form class="row q-col-gutter-md" @submit="$emit('guardar')">
    <q-input
      outlined
      class="required col-xs-12 col-md-12"
      label="Nombre del documento"
      v-model="valoresModel.nombreDocumento"
      :rules="valoresRules.nombreDocumento"
    ></q-input>
    <q-input
      outlined
      class="required col-xs-12 col-md-6"
      label="Número de recomendaciones"
      type="number"
      v-model="valoresModel.numeroRecomendacion"
      :rules="valoresRules.numeroRecomendacion"
    ></q-input>
    <q-select
      outlined
      v-model="valoresModel.idSistema"
      :options="sistemas"
      option-value="id"
      option-label="nombre"
      label="Sistema"
      map-options
      emit-value
      class="required col-xs-12 col-md-6"
      :rules="valoresRules.idSistema"
      @update:model-value="onSistemaChange"
    />
    <q-select
      outlined
      v-model="valoresModel.idOrganismo"
      :options="filteredOrganismos"
      option-value="id"
      option-label="nombre"
      label="Organismo"
      map-options
      emit-value
      class="required col-xs-12 col-md-6"
      :rules="valoresRules.idOrganismo"
      @update:model-value="onOrganismoChange"
    />
    <q-select
      v-if="valoresModel.idOrganismo !== 'a3dcca03-d0ce-4167-9694-a241e1bf0c6e'"
      outlined
      v-model="valoresModel.idMecanismo"
      :options="filteredMecanismos"
      option-value="id"
      option-label="nombre"
      label="Mecanismo"
      map-options
      emit-value
      class="required col-xs-12 col-md-6"
      :rules="valoresRules.idMecanismo"
      />
      <q-input
      v-if="valoresModel.idOrganismo !== 'a3dcca03-d0ce-4167-9694-a241e1bf0c6e'"
      outlined
      class="col-xs-12 col-md-12"
      label="Mandato / Función / Atribución"
      v-model="valoresModel.mandatoFuncion"
    ></q-input>
    <q-select
      outlined
      v-model="valoresModel.periodicidad"
      :options="periodos"
      option-value="nombre"
      option-label="nombre"
      label="Periodicidad de seguimiento"
      map-options
      emit-value
      class="required col-xs-12 col-md-6"
      :rules="valoresRules.periodicidad"
    />
    <q-input
      outlined
      class="required col-xs-12 col-md-6"
      label="Plazo"
      v-model="valoresModel.fechaPlazo"
      :rules="valoresRules.fechaPlazo"
      readonly
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer"/>
      </template>
      <q-popup-proxy>
        <q-date
          color="grey-10"
          v-model="valoresModel.fechaPlazo"
          mask="YYYY-MM-DD"
          :options="getDateOptions"
          />
      </q-popup-proxy>
    </q-input>
    <div class="col-xs-12 text-right">
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
    </div>
  </q-form>
</template>

<script>
import { useVModel } from '../../composables/useVModel.js'
import { ref, onMounted, inject, watch } from 'vue'
import { date } from 'quasar'
import validaciones from '../../common/validations'

const valoresRules = {
  nombreDocumento: [validaciones.requeridoBlanco],
  numeroRecomendacion: [validaciones.requerido, validaciones.numerosMayorACero],
  idSistema: [validaciones.requerido],
  idOrganismo: [validaciones.requerido],
  idMecanismo: [validaciones.requerido],
  periodicidad: [validaciones.requerido],
  fechaPlazo: [validaciones.requerido]
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
    const organismos = ref([])
    const filteredOrganismos = ref([])
    const mecanismos = ref([])
    const filteredMecanismos = ref([])
    const periodos = ref([])
    const fechaActual = date.formatDate(new Date(), 'YYYY/MM/DD')
    const sistemas = ref([])

    onMounted(async () => {
      try {
        const { rows: sistemasRows } = await _http.get('/system/parametros?grupo=sistema')
        sistemas.value = sistemasRows
        const { rows: periodosRows } = await _http.get('/system/parametros?grupo=periodicidad')
        periodos.value = periodosRows
        if (valoresModel.value.idSistema) {
          await fetchOrganismos(valoresModel.value.idSistema)
          if (valoresModel.value.idOrganismo) {
            await fetchMecanismos(valoresModel.value.idOrganismo)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    })
    const fetchOrganismos = async (idSistema) => {
      try {
        const { rows: organismosRows } = await _http.get(`/system/parametros?grupo=organismo&idParametro=${idSistema}`)
        organismos.value = organismosRows
        filteredOrganismos.value = organismos.value
      } catch (error) {
        console.error('Error fetching organismos:', error)
      }
    }
    const fetchMecanismos = async (idOrganismo) => {
      try {
        const { rows: mecanismosRows } = await _http.get(`/system/parametros?grupo=mecanismo&idParametro=${idOrganismo}`)
        mecanismos.value = mecanismosRows
        filteredMecanismos.value = mecanismos.value
      } catch (error) {
        console.error('Error fetching mecanismos:', error)
      }
    }

    const filterOrganismos = (idSistema) => {
      fetchOrganismos(idSistema)
    }
    const filterMecanismos = (idOrganismo) => {
      fetchMecanismos(idOrganismo)
    }

    const onSistemaChange = (newValue) => {
      valoresModel.value.idOrganismo = null
      valoresModel.value.idMecanismo = null
      filterOrganismos(newValue)
    }

    const onOrganismoChange = (newValue) => {
      valoresModel.value.idMecanismo = null
      filterMecanismos(newValue)
    }

    watch(
      () => valoresModel.value.idSistema,
      (newValue) => {
        if (newValue) {
          filterOrganismos(newValue)
        }
      }
    )
    watch(
      () => valoresModel.value.idOrganismo,
      (newValue) => {
        if (newValue) {
          filterMecanismos(newValue)
        }
      }
    )
    watch(
      () => valoresModel.value.idOrganismo,
      (newValue) => {
        if (newValue === 'a3dcca03-d0ce-4167-9694-a241e1bf0c6e') {
          valoresModel.value.mandatoFuncion = null
        }
      }
    )
    const getDateOptions = (date) => {
      const periodicidad = valoresModel.value.periodicidad
      const fechaLimite = new Date()
      switch (periodicidad) {
        case 'MENSUAL':
          fechaLimite.setMonth(fechaLimite.getMonth() + 1)
          break
        case 'BIMESTRAL':
          fechaLimite.setMonth(fechaLimite.getMonth() + 2)
          break
        case 'TRIMESTRAL':
          fechaLimite.setMonth(fechaLimite.getMonth() + 3)
          break
        case 'SEMESTRAL':
          fechaLimite.setMonth(fechaLimite.getMonth() + 6)
          break
        case 'ANUAL':
          fechaLimite.setFullYear(fechaLimite.getFullYear() + 1)
          break
        default:
          return false
      }

      const formattedDate = `${fechaLimite.getFullYear()}/${
    (fechaLimite.getMonth() + 1).toString().padStart(2, '0')}/${
    fechaLimite.getDate().toString().padStart(2, '0')}`
      return date >= formattedDate
    }
    watch(
      () => valoresModel.value.periodicidad,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          valoresModel.value.fechaPlazo = null
        }
      }
    )
    return {
      valoresModel,
      valoresRules,
      filteredOrganismos,
      filteredMecanismos,
      periodos,
      fechaActual,
      sistemas,
      onSistemaChange,
      onOrganismoChange,
      getDateOptions
    }
  }
}
</script>
