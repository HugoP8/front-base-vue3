<template>
  <q-page>
    <Titulo :titulo="instrumento.nombreDocumento" icono="checklist"></Titulo>
    <div class="row" :class="{'q-px-xl':$q.screen.gt.lg,'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
      <div class="col-xs-12">
          <CrudTable
            :filters="filters"
            :columns="columns"
            :url="url"
            :order="'createdAt'"
            ref="crudTable"
          >
            <template v-slot:row="{ row }">
              <q-tr>
                <q-td>{{ row?.recomendacion?.recomendacion }}</q-td>
                <q-td>{{ tematicaEspecifica(row?.recomendacion?.idTematicaEspecifica)  }}</q-td>
                <q-td>{{ row?.recomendacion?.sugerenciaRecomendacion }}</q-td>
                <q-td class="text-center">{{ row?.recomendacion?.fechaPlazo }}</q-td>
              </q-tr>
            </template>
          </CrudTable>
      </div>
    </div>
  </q-page>
</template>
<script>
import { ref, inject, onMounted } from 'vue'
import CrudTable from '@components/common/CrudTable'
import { useRoute } from 'vue-router'

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
    name: 'nombreDocumento',
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
  }
]

export default {
  components: { CrudTable },
  name: 'Instrumentos',
  setup () {
    const _http = inject('http')
    const activeTab = ref('pendiente')
    const Route = useRoute()
    const idInstrumento = Route.params.id
    const url = ref(`internacional/bandejas/recomendacion-instrumento?idInstrumento=${idInstrumento}`)
    const instrumento = ref({})
    const recomendacionSeleccionada = ref(null)

    onMounted(async () => {
      const response = await _http.get(`internacional/instrumentos/${idInstrumento}`)
      instrumento.value = response
    })

    const tematicaEspecifica = (idTematicaEspecifica) => {
      if (!idTematicaEspecifica || !Array.isArray(idTematicaEspecifica)) {
        return ''
      }
      return idTematicaEspecifica.map(item => item.nombre).join(', ')
    }

    return {
      instrumento,
      filters,
      columns,
      url,
      activeTab,
      recomendacionSeleccionada,
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
