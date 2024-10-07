<template>
    <q-dialog v-model="dialog" persistent>
        <q-card style="width: 80%; max-width: 85%;">
            <q-toolbar>
                <q-toolbar-title>
                </q-toolbar-title>
                <q-btn flat round icon="close" color="negative" @click="$emit('cerrar')" />
            </q-toolbar>
            <q-card-section class="row">
                <div class="col-xs-12">
                    <q-table
                        :rows="notificaciones"
                        :columns="columns"
                        flat
                        wrap-cells
                        hide-pagination
                        :pagination="{rowsPerPage:0}"
                    >
                        <template v-slot:body="{row}">
                            <q-tr>
                                <q-td>
                                    <q-btn
                                        v-if="row.tipo==='CORREO'"
                                        color="primary"
                                        icon="outgoing_mail"
                                        @click="enviar(row)"
                                    />
                                </q-td>
                                <q-td>{{ row.tipo }}</q-td>
                                <q-td>
                                    <div>
                                        {{ row.usuario?.nombres }}
                                    </div>
                                    <div>
                                        {{ row.usuario?.correoElectronico }}
                                    </div>
                                </q-td>
                                <q-td>{{ row.contenido }}</q-td>
                                <q-td>{{ formatFecha(row.fechaNotificacion) }}</q-td>
                                <q-td>{{ row.estado }}</q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script>
import { inject, onMounted, ref } from 'vue'

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
    name: 'usuario',
    label: 'Usuario',
    sortable: false
  },
  {
    name: 'contenido',
    label: 'Mensaje',
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
  props: {
    recordatorio: {
      type: Object,
      default: () => ({})
    }
  },
  setup (props, { emit }) {
    const _http = inject('http')
    const dialog = ref(true)
    const notificaciones = ref([])

    onMounted(async () => {
      await getNotificaciones()
    })

    const getNotificaciones = async () => {
      const respuesta = await _http.get(`system/recordatorios/${props.recordatorio.id}/notificaciones`)
      notificaciones.value = respuesta.rows
    }

    const enviar = async (data) => {
      const respuesta = await _http.put(`system/notificaciones/${data.id}/enviar`)
      if (respuesta) {
        await getNotificaciones()
      }
    }
    const formatFecha = (fecha) => {
      if (!fecha || isNaN(Date.parse(fecha))) {
        return ''
      }
      const date = new Date(fecha)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }

    return {
      dialog,
      columns,
      notificaciones,
      enviar,
      formatFecha
    }
  }
}
</script>
