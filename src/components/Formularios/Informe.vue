<template>
    <q-form
      ref="informe"
      class="row q-col-gutter-sm"
      @submit="guardar"
    >
        <q-select
            class="col-xs-12 required"
            v-model="valoresModel.instrumentos"
            :options="instrumentos"
            label="Instrumentos"
            outlined
            multiple
            map-options
            emit-value
            option-value="id"
            option-label="nombreDocumento"
            use-chips
            :rules="valoresRules.requerido"
            @update:model-value="getEntidades"
        />
        <q-select
            v-if="valoresModel.instrumentos && valoresModel.instrumentos.length>0"
            class="col-xs-12 required"
            v-model="valoresModel.entidades"
            :options="entidades"
            label="Entidades"
            outlined
            multiple
            map-options
            emit-value
            option-value="id"
            option-label="nombre"
            use-chips
            :rules="valoresRules.requerido"
             @update:model-value="getTematicas"
        />
        <q-select
            v-if="valoresModel.instrumentos && valoresModel.instrumentos.length>0"
            class="col-xs-12 required"
            v-model="valoresModel.tematicas"
            :options="tematicas"
            label="Tematicas"
            outlined
            multiple
            map-options
            emit-value
            option-value="id"
            option-label="nombre"
            :rules="valoresRules.requerido"
            use-chips
        />
        <q-select
            v-if="valoresModel.instrumentos && valoresModel.instrumentos.length>0"
            class="col-xs-12 required"
            v-model="valoresModel.estado"
            :options="['REALIZADA','EN_CURSO','TODAS']"
            label="Estado"
            outlined
            :rules="valoresRules.requerido"
        />
      <div class="col-xs-12 text-right">
        <q-btn
          class="q-ml-sm"
          icon="close"
          label="Cancelar"
          @click="$emit('cancelar')"
        />
        <q-btn
          class="q-ml-sm"
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
import { useRouter } from 'vue-router'

const valoresRules = {
  requerido: [
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
    const Router = useRouter()
    const valoresModel = useVModel(props, 'valores')
    const instrumentos = ref([])
    const entidades = ref([])
    const tematicas = ref([])

    onMounted(async () => {
      instrumentos.value = await getDatos('internacional/instrumentos')
      // entidades.value = await getDatos('internacional/instrumentos/entidades')
      // tematicas.value = await getDatos('system/parametros?grupo=tematica')
    })

    const getDatos = async (url) => {
      const { rows } = await _http.get(`${url}`)
      return rows
    }

    const guardar = async () => {
      const respuesta = await _http.post('internacional/informes', valoresModel.value)
      if (respuesta) {
        Router.push({ name: 'informe', params: { id: respuesta.id } })
      }
    }

    const getEntidades = async () => {
      let query = ''
      if (valoresModel.value.instrumentos.length > 0) {
        query += `?${valoresModel.value.instrumentos.map(e => `idInstrumento=${e}`).join('&')}`
      }
      entidades.value = await _http.get(`internacional/instrumentos/entidades${query}`)
      await getTematicas()
    }

    const getTematicas = async () => {
      let query = ''
      if (valoresModel.value.instrumentos.length > 0) {
        query += `?${valoresModel.value.instrumentos.map(e => `idInstrumento=${e}`).join('&')}`
      }
      if (valoresModel.value.entidades && valoresModel.value.entidades.length > 0) {
        query += `&${valoresModel.value.entidades.map(e => `idEntidad=${e}`).join('&')}`
      }
      tematicas.value = await _http.get(`internacional/instrumentos/tematicas${query}`)
    }

    return {
      valoresModel,
      valoresRules,
      instrumentos,
      entidades,
      tematicas,
      guardar,
      getEntidades,
      getTematicas
    }
  }
}
</script>
