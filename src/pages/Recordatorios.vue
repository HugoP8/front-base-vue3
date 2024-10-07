<template>
  <q-page>
    <Titulo
      titulo="Recordatorios"
      icono="campaign"
    ></Titulo>
    <div class="row" :class="{'q-px-xl':$q.screen.gt.lg,'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
      <div class="col-xs-12">
        <CrudTable
          :filters="filters"
          :columns="columns"
          :url="url"
          :order="'createdAt'"
        >
          <template v-slot:row="{ row, update}">
            <q-tr>
              <q-td class="text-center">
                <q-btn
                  v-if="row.estado === 'CREADO'"
                  class="q-pa-xs"
                  flat
                  round
                  color="orange-7"
                  icon="notifications_active"
                  @click="enviarRecordatorio(row.id, update)"
                >
                  <q-tooltip>Enviar recordatorio</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="row.estado === 'ENVIADO'"
                  class="q-pa-xs"
                  flat
                  round
                  icon="remove_red_eye"
                  @click="ver(row)"
                >
                  <q-tooltip>Ver recomendacion</q-tooltip>
                </q-btn>
              </q-td>
              <q-td>{{ row.tipo || ''  }}</q-td>
              <q-td>{{ row.mensaje || ''  }}</q-td>
              <q-td>{{ formatFecha(row.fecha) }}</q-td>
              <q-td>
                <Estado :estado="row.estado || '' " />
              </q-td>
            </q-tr>
          </template>
        </CrudTable>
      </div>
    </div>
    <Notificaciones
      v-if="recordatorio"
      :recordatorio="recordatorio"
      @cerrar="recordatorio=null"
    />
  </q-page>
</template>

<script>
import { ref, inject } from 'vue'
import { constants } from '../constants/app'
import CrudTable from '@components/common/CrudTable'
import Notificaciones from 'components/Seguridad/Notificaciones.vue'
import { useQuasar } from 'quasar'

const filters = [
  {
    label: 'Mensaje',
    field: 'mensaje',
    type: 'input'
  },
  {
    label: 'Tipo',
    field: 'tipo',
    type: 'select',
    options: ['INSTRUMENTO', 'RECOMENDACION']
  },
  {
    label: 'Estado',
    field: 'estado',
    type: 'select',
    options: ['CREADO', 'ENVIADO', 'CANCELADO']
  }
]

const columns = [
  {
    name: 'acciones',
    label: 'Acciones',
    sortable: false
  },
  {
    name: 'tipo',
    label: 'Tipo',
    sortable: false
  },
  {
    name: 'mensaje',
    label: 'Mensaje',
    sortable: false
  },
  {
    name: 'fecha',
    label: 'Fecha',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    sortable: false
  }
]

export default {
  components: { CrudTable, Notificaciones },
  name: 'Recordatorios',
  setup () {
    const _http = inject('http')
    const $q = useQuasar()
    const url = ref('system/recordatorios')
    const recordatorio = ref(null)

    const enviarRecordatorio = (id, update) => {
      const configuracion = { ...constants.PROP_DIALOG }
      configuracion.message = '¿Esta seguro de enviar las notificaciones del recordatorio?'
      $q.dialog(configuracion).onOk(async () => {
        try {
          const respuesta = await _http.put(`system/recordatorios/${id}/enviar`)
          if (respuesta) {
            await update()
          }
        } catch (error) {
          console.log('error')
        }
      })
    }

    const ver = (data) => {
      recordatorio.value = JSON.parse(JSON.stringify(data))
    }
    const formatFecha = (fecha) => {
      if (!fecha || typeof fecha !== 'string') {
        return ''
      }
      const partes = fecha.split('-')
      if (partes.length !== 3) {
        return ''
      }
      const [year, month, day] = partes
      if (!day || !month || !year) {
        return ''
      }
      return `${day}-${month}-${year}`
    }
    return {
      recordatorio,
      filters,
      columns,
      url,
      enviarRecordatorio,
      ver,
      formatFecha
    }
  }
}
</script>
