<template>
  <q-page>
    <Titulo titulo="Instrumentos" icono="business"></Titulo>
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
            class="bandeja q-mx-lg"
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
              <template v-slot:buttons="{ open }">
                <q-btn
                  v-if="usuario?.rol?.id === roles.OPERADOR_MJTI"
                  icon="add"
                  color="secondary"
                  @click="openModal(open)"
                  label="Nuevo instrumento"
                />
              </template>
              <template v-slot:form="{ close, update }">
                <q-card style="width: 700px; max-width: 90vw;">
                  <q-toolbar class="q-pa-md">
                    <q-icon name="home_work" size="md" />
                    <q-toolbar-title>
                      {{ instrumento.id ? 'Editar' : 'Agregar' }} instrumento
                    </q-toolbar-title>
                    <q-space />
                    <q-btn flat round icon="close" @click="closeModal(close)" />
                  </q-toolbar>
                  <q-card-section>
                    <Instrumento
                      v-model:valores="instrumento"
                      @guardar="guardar(update, close)"
                      @cancelar="closeModal(close)"
                    />
                  </q-card-section>
                </q-card>
              </template>
              <template v-slot:row="{ row, open, eliminar }">
                <q-tr>
                  <q-td class="text-center">
                    <q-btn
                      v-if="(usuario.rol?.id === roles.OPERADOR_MJTI && usuario.idUser === row.userCreated ) &&  ['CREADO', 'OBSERVADO'].includes(row.estado)"
                      class="q-pa-xs"
                      flat
                      round
                      icon="edit"
                      @click="openModal(open, row.id)"
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="(usuario.rol?.id === roles.OPERADOR_MJTI && usuario.idUser === row.userCreated ) &&  ['CREADO'].includes(row.estado)"
                      class="q-pa-xs"
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="eliminar({ url: `${urlInstrumento}/${row.id}` })"
                    >
                      <q-tooltip>Eliminar nn</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="(usuario.idUser === row.userCreated  && row.estado==='CREADO') || row.estado !== 'CREADO'"
                      class="q-pa-xs"
                      flat
                      round
                      icon="visibility"
                      @click="irRecomendaciones(row.id)"
                    >
                      <q-tooltip>Ver recomendaciones</q-tooltip>
                    </q-btn>
                  </q-td>
                  <q-td>{{ row.sistema.nombre }}</q-td>
                  <q-td>{{ row.nombreDocumento }}</q-td>
                  <q-td>{{ usuario.rol.nombre }}</q-td>
                  <q-td style="white-space: nowrap; text-align: center;" class="text-center">{{ row.createdAt }}</q-td>
                  <q-td class="text-center">
                    <Estado :estado="row.estado" />
                  </q-td>
                </q-tr>
              </template>
            </CrudTable>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>
<script>
import { ref, inject, computed } from 'vue'
import CrudTable from '@components/common/CrudTable'
import Instrumento from 'components/Formularios/Instrumento'
import { constants } from '../constants/app'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const filters = [
  {
    label: 'Sistema',
    field: 'sistema',
    type: 'input'
  },
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
    name: 'idSistema',
    label: 'Sistema',
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
  components: { CrudTable, Instrumento },
  name: 'Instrumentos',
  setup () {
    const _http = inject('http')
    const store = useStore()
    const activeTab = ref('pendiente')
    const url = ref(`internacional/bandejas/instrumento?tipo=${activeTab.value}`)
    const urlInstrumento = ref('internacional/instrumentos')
    const Router = useRouter()
    const crudTable = ref(null)
    const instrumento = ref({})
    const tabs = ref([
      { name: 'pendiente', label: 'PENDIENTE', tipo: 'pendiente', icon: 'timer' },
      { name: 'pendienteFirma', label: 'PENDIENTE DE FIRMA', tipo: 'pendienteFirma', icon: 'draw' },
      { name: 'procesado', label: 'PROCESADO', tipo: 'procesado', icon: 'verified' }
    ])

    const resetForm = () => {
      instrumento.value = {}
    }

    const getBandeja = async (tipo) => {
      url.value = `internacional/bandejas/instrumento?tipo=${tipo}`
      await crudTable.value.changeUrl(url.value)
    }

    const openModal = async (open, id) => {
      resetForm()
      if (id) {
        instrumento.value = await _http.get(`/internacional/instrumentos/${id}`)
      }
      open()
    }

    const closeModal = (close) => {
      resetForm()
      close()
    }

    const guardar = async (update, close) => {
      if (instrumento.value.id) {
        await _http.put(`/internacional/instrumentos/${instrumento.value.id}`, instrumento.value)
      } else {
        const registroInstrumento = await _http.post('/internacional/instrumentos', instrumento.value)
        if (registroInstrumento) {
          await irRecomendaciones(registroInstrumento.id)
        }
      }
      await update()
      closeModal(close)
    }

    const irRecomendaciones = async (id) => {
      await Router.push(`instrumentos/${id}`)
    }

    const getNombreCompleto = (usuario) => {
      return `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`
    }

    return {
      instrumento,
      filters,
      columns,
      url,
      closeModal,
      openModal,
      getNombreCompleto,
      guardar,
      activeTab,
      tabs,
      irRecomendaciones,
      getBandeja,
      roles: constants.roles,
      usuario: computed(() => store.state.global.usuario),
      urlInstrumento
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
