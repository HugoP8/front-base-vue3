<template>
    <q-page>
      <Titulo titulo="Reportes" icono="assessment"></Titulo>
      <div class="row" :class="{'q-px-xl':$q.screen.gt.lg,'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
        <div class="col-xs-12">
        <CrudTable
          :filters="filters"
          :columns="columns"
          :url="url"
          :order="'createdAt'"
          ref="crudTable"
        >
        <template v-slot:buttons="{ }">
          <q-btn
            class="download"
            label="Descargar CSV"
            icon="download"
            color="primary"
            @click="downloadCSV"
          />
            </template>
          <template v-slot:row="{row}">
            <template v-for="avance in row.avances" :key="avance.id">
              <q-tr>
                <q-td>
                  {{ avance?.recomendacion?.idTematicaEspecifica
                    ? avance.recomendacion.idTematicaEspecifica.map(tematica => tematica.nombre).join(', ')
                    : '' }}
                </q-td>
                <q-td>{{ row?.entidad?.nombre }}</q-td>
                <q-td>{{ avance?.recomendacion?.recomendacion }}</q-td>
                <q-td>
                  {{ avance?.recomendacion?.idPoblacion
                    ? avance.recomendacion.idPoblacion.map(tematica => tematica.nombre).join(', ')
                    : '' }}
                </q-td>
                <q-td>{{ avance?.actividadRealizada }}</q-td>
                <q-td>{{ avance?.detalleActividadRealizada }}</q-td>
                <q-td>{{ avance?.estado }}</q-td>
              </q-tr>
            </template>
          </template>
        </CrudTable>
        </div>
      </div>
    </q-page>
  </template>
<script>
import { ref, computed, inject } from 'vue'
import CrudTable from '@components/common/CrudTable'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

const filters = [
  {
    label: 'Tema específico',
    field: 'temaEspecifico',
    type: 'input'
  },
  {
    label: 'Entidad responsable',
    field: 'entidadResponsable',
    type: 'input'
  },
  {
    label: 'Recomendacion',
    field: 'recomendacion',
    type: 'input'
  },
  {
    label: 'Poblacion',
    field: 'poblacion',
    type: 'input'
  }
]

const columns = [
  {
    name: 'temaEspecifico',
    label: 'Tema Especifico',
    sortable: false
  },
  {
    name: 'entidadResponsable',
    label: 'Entidad Responsable',
    sortable: false
  },
  {
    name: 'recomendacion',
    label: 'Recomendacion',
    sortable: false
  },
  {
    name: 'poblacion',
    label: 'poblacion',
    sortable: false
  },
  {
    name: 'actividadRealizada',
    label: 'Actividad realizada',
    sortable: false
  },
  {
    name: 'detalleActividadRealizada',
    label: 'Detalle actvidad Realizada',
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
  name: 'Reportes',
  setup () {
    const store = useStore()
    const url = ref('internacional/reportes')
    const crudTable = ref(null)
    const _http = inject('http')
    const $q = useQuasar()

    const escapeCSVValue = (value) => {
      if (value === null || value === undefined) return ''
      let str = value.toString()
      str = str.replace(/"/g, '""')
      if (str.search(/("|,|\n)/g) >= 0) {
        str = `"${str}"`
      }
      return str
    }

    const downloadCSV = async () => {
      try {
        const response = await _http.get('internacional/reportes')
        const datos = response
        const rows = datos.rows
        if (rows.length === 0) {
          $q.notify({
            type: 'teal',
            message: 'No hay datos disponibles para descargar.',
            position: 'center'
          })
          return
        }
        const csvRows = []
        csvRows.push([
          'Tema específico',
          'Entidad responsable',
          'Recomendación',
          'Población',
          'Actividad Realizada',
          'Detalle Actividad',
          'Estado'
        ].join(','))

        rows.forEach(row => {
          row.avances.forEach(avance => {
            const csvRow = [
              escapeCSVValue(avance.recomendacion.tematicaEspecificas.nombre),
              escapeCSVValue(row.entidad.nombre),
              escapeCSVValue(avance.recomendacion.recomendacion),
              escapeCSVValue(avance.recomendacion.poblacion.nombre),
              escapeCSVValue(avance.actividadRealizada),
              escapeCSVValue(avance.detalleActividadRealizada),
              escapeCSVValue(avance.estado)
            ].join(',')
            csvRows.push(csvRow)
          })
        })
        const csvString = csvRows.join('\n')
        const blob = new Blob([csvString], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'reportes.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error al descargar el CSV:', error)
      }
    }

    return {
      filters,
      columns,
      url,
      downloadCSV,
      crudTable,
      usuario: computed(() => store.state.global.usuario)
    }
  }
}
</script>
  <style scoped>
  .download{
    float: inline-end;
    background-color: #262626 !important;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .download:hover {
  background-color: #2a2a2c !important;
  color: rgb(0, 0, 0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

  </style>
