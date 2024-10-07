<template>
  <q-page>
    <Titulo titulo="Instrumentos" icono="business"></Titulo>
    <div class="row" :class="{'q-px-xl':$q.screen.gt.lg,'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
      <div class="col-xs-12">
      <CrudTable
        :filters="filters"
        :columns="columns"
        :url="url"
        :order="'createdAt'"
        ref="crudTable"
      >
        <template v-slot:row="{row}">
          <q-tr v-if="row.estado === 'PROCESADO'">
            <q-td class="text-center">
              <q-btn
                class="q-pa-xs"
                flat
                round
                icon="visibility"
                @click="irRecomendaciones(row.id)"
              >
                <q-tooltip>Ver recomendaciones</q-tooltip>
              </q-btn>
            </q-td>
            <q-td>{{ row.nombreDocumento }}</q-td>
            <q-td>{{ row?.usuarioRemitente?.nombreCompleto }}</q-td>
            <q-td class="text-center">{{ row.createdAt }}</q-td>
            <q-td class="text-center">
              <Estado :estado="row.estado" />
            </q-td>
          </q-tr>
        </template>
      </CrudTable>
      </div>
    </div>
  </q-page>
</template>
<script>
import { ref, onMounted, computed } from 'vue'
import CrudTable from '@components/common/CrudTable'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const filters = [
  {
    label: 'Documento',
    field: 'nombreDocumento',
    type: 'input'
  },
  {
    label: 'Fecha',
    field: 'fechaPlazo',
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
    name: 'nombreDocumento',
    label: 'Documento',
    sortable: false
  },
  {
    name: 'sigla',
    label: 'Remitente',
    sortable: false
  },
  {
    name: 'email',
    label: 'Fecha',
    sortable: false
  },
  {
    name: 'estado',
    label: 'Estado',
    sortable: false
  }
]

export default {
  components: { CrudTable },
  name: 'Instrumentos',
  setup () {
    const store = useStore()
    const url = ref('internacional/recomendacion-entidad/instrumentos')
    const Router = useRouter()

    onMounted(async () => {
      // _auth.initStore()
    })

    const irRecomendaciones = async (id) => {
      await Router.push(`bandejaVisor/${id}`)
    }

    const getNombreCompleto = (usuario) => {
      return `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`
    }

    return {
      filters,
      columns,
      url,
      getNombreCompleto,
      irRecomendaciones,
      usuario: computed(() => store.state.global.usuario)
    }
  }
}
</script>
<style scoped>
.bandeja{
  color: white;
}
</style>
