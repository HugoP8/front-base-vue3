<template>
  <q-page>
    <Titulo
      icono="auto_stories"
      titulo="Informes"
    ></Titulo>
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
              :url="urlCrudTable"
              :order="'createdAt'"
            >
              <template v-slot:buttons="{ open }">
                <q-btn
                v-if="usuario.rol?.id === roles.OPERADOR_MJTI"
                  icon="add"
                  color="secondary"
                  @click="openModal(open)"
                  label="Nuevo informe"
                />
              </template>
              <template v-slot:form="{ close}">
                <q-card style="width: 700px; max-width: 90vw;">
                  <q-toolbar class="q-pa-md">
                    <q-icon
                      name="auto_stories"
                      size="md"
                    />
                    <q-toolbar-title>
                      Nuevo informe
                    </q-toolbar-title>
                    <q-space />
                    <q-btn
                      flat
                      round
                      icon="close"
                      @click="closeModal(close)"
                    />
                  </q-toolbar>
                  <q-card-section>
                    <Informe v-model:valores="informe" />
                  </q-card-section>
                </q-card>
              </template>
              <template v-slot:row="{ row, eliminar }">
                <q-tr>
                  <q-td class="text-center">
                    <q-btn
                      v-if="['CREADO', 'OBSERVADO'].includes(row.estado) && usuario.rol?.id === roles.OPERADOR_MJTI"
                      class="q-pa-xs"
                      flat
                      round
                      icon="edit"
                      :to="`informes/${row.id}`"
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="['DERIVADO'].includes(row.estado) && usuario.rol?.id === roles.SUPERVISOR_MJTI"
                      class="q-pa-xs"
                      flat
                      round
                      icon="edit"
                      :to="`informes/${row.id}`"
                    >
                      <q-tooltip>Revisar informe</q-tooltip>
                    </q-btn>
                    <q-btn
                    v-if="['CREADO'].includes(row.estado)"
                      class="q-pa-xs"
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="eliminar({ url: `${url}/${row.id}` })"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="(['DERIVADO', 'FIRMADO'].includes(row.estado) && usuario.rol?.id === roles.OPERADOR_MJTI) || (['OBSERVADO', 'FIRMADO'].includes(row.estado) && usuario.rol?.id === roles.SUPERVISOR_MJTI)"
                      class="q-pa-xs"
                      flat
                      round
                      icon="visibility"
                      @click="verPDF(row.id)"
                    >
                      <q-tooltip>Ver</q-tooltip>
                    </q-btn>
                  </q-td>
                  <q-td>{{ row.nombre }}</q-td>
                  <q-td>{{ row.createdAt }}</q-td>
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
import { ref, inject, onMounted, computed } from 'vue'
import CrudTable from '@components/common/CrudTable'
import Informe from '@components/Formularios/Informe'
import { useStore } from 'vuex'
import { constants } from '../constants/app'

const filters = [
  {
    label: 'Nombre',
    field: 'nombre',
    type: 'input'
  },
  {
    label: 'estado',
    field: 'select',
    options: ['CREADO']
  }
]

const columns = [
  {
    name: 'acciones',
    label: 'Acciones',
    sortable: false
  },
  {
    name: 'numero',
    label: 'Nombre informe',
    sortable: false
  },
  {
    name: 'fecha',
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
  components: { CrudTable, Informe },
  name: 'Informes',
  setup () {
    const _http = inject('http')
    const url = ref('internacional/informes')
    const activeTab = ref('pendiente')
    const urlCrudTable = ref(`internacional/bandejas/informes?tipo=${activeTab.value}`)
    const crudTableInformes = ref()
    const informe = ref({})
    const store = useStore()
    const tabs = ref([
      { name: 'pendiente', label: 'PENDIENTE', tipo: 'pendiente', icon: 'timer' },
      { name: 'pendienteFirma', label: 'PENDIENTE DE FIRMA', tipo: 'pendienteFirma', icon: 'draw' },
      { name: 'procesado', label: 'PROCESADO', tipo: 'procesado', icon: 'verified' }
    ])
    const usuario = computed(() => store.state.global.usuario)
    const resetForm = () => {
      informe.value = {}
    }

    onMounted(async () => { })

    const getBandeja = async (tipo) => {
      urlCrudTable.value = `internacional/bandejas/informes?tipo=${tipo}`
      // if (crudTableInformes.value) {
      //   await crudTableInformes.value.changeUrl(urlCrudTable.value)
      // }
    }

    const openModal = async (open, id) => {
      resetForm()
      open()
    }

    const closeModal = (close) => {
      resetForm()
      close()
    }

    const guardar = async (update, close) => {
      await _http.post(`${url.value}`, informe.value)
      await update()
      closeModal(close)
    }
    const verPDF = async (id) => {
      store.commit('global/setPreviewPdfDocumento', [true, {
        url: `internacional/informes/${id}/mostrarPdf`,
        nombre: 'Informe PDF'
      }])
    }
    return {
      informe,
      filters,
      columns,
      crudTableInformes,
      url,
      closeModal,
      openModal,
      guardar,
      urlCrudTable,
      tabs,
      getBandeja,
      activeTab,
      verPDF,
      roles: constants.roles,
      usuario
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
