<template>
  <q-form
    class="row q-col-gutter-md"
    @submit="$emit('guardar')"
  >
    <q-input
      filled
      class="col-xs-12 col-md-6"
      label="Nombre"
      v-model="valoresModel.nombre"
      :rules="valoresRules.nombre"
    />
    <q-input
      filled
      class="col-xs-12 col-md-6"
      label="Ruta"
      v-model="valoresModel.ruta"
      :rules="valoresRules.ruta"
    />
    <q-select
      filled
      use-input
      class="col-xs-12 col-md-6"
      label="Icono"
      :options="IconList"
      v-model="valoresModel.icono"
      :rules="valoresRules.icono"
      @filter="filtrarOpciones"
    >
      <template v-slot:append>
        <q-icon
          size="md"
          color="secondary"
          :name="valoresModel.icono"
          class="q-ml-md"
        />
      </template>

      <template v-slot:option="props">
        <q-item
          v-bind="props.itemProps"
          v-on="props.itemEvents"
        >
          <q-item-section avatar>
            <q-icon :name="props.opt" />
          </q-item-section>
          <q-item-section>
            <q-item-label v-html="props.opt" />
            <q-item-label caption>{{ props.opt }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <q-input
      filled
      class="col-xs-12 col-md-6"
      label="orden"
      v-model="valoresModel.orden"
      :rules="valoresRules.orden"
    />

    <q-select
      filled
      v-model="valoresModel.idMenu"
      :options="menus"
      option-value="id"
      option-label="nombre"
      label="Menu superior"
      map-options
      emit-value
      class="col-xs-12 col-md-6"
      :rules="valoresRules.idMenu"
      clearable
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
import IconListOriginal from '../../common/IconList'

const valoresRules = {
  nombre: [
    validaciones.requerido
  ],
  ruta: [
    validaciones.requerido
  ],
  icono: [
    validaciones.requerido
  ],
  orden: [
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
    const menus = ref([])
    const IconList = ref(IconListOriginal)

    onMounted(async () => {
      menus.value = await getMenus()
    })

    const filtrarOpciones = (val, update) => {
      if (val === '') {
        update(() => {
          IconList.value = IconListOriginal
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        IconList.value = IconListOriginal.filter(v => v.toLowerCase().includes(needle))
      })
    }

    async function getMenus () {
      const { rows } = await _http.get('/system/menus')
      return rows
    }

    return {
      IconList,
      IconListOriginal,
      valoresModel,
      valoresRules,
      menus,
      filtrarOpciones
    }
  }
}
</script>
