<template>
  <q-dialog v-model="dialog" persistent>
    <q-card>
      <q-card-section>
        <div class="titulo text-h6">Detalle de la recomendación
          <!-- <q-btn
            flat
            round
            color="primary"
            @click="handleTimelineClick(recomendacionData)"
            icon="timeline">
              <q-tooltip>
                Historial Avances
              </q-tooltip>
          </q-btn> -->
        </div>
        <q-separator />
      </q-card-section>
      <q-card-section>
        <div class="grid-container">
          <div class="titulo-descripcion">Recomendación:</div>
          <div>{{ recomendacionData.codigo }} - {{ recomendacionData.recomendacion }}</div>
          <div class="titulo-descripcion">Temáticas:</div>
          <div>{{ recomendacionData.tematica.nombre }}</div>
          <div class="titulo-descripcion">Poblaciones:</div>
          <div>
            <ul>
              <li v-for="poblacion in recomendacionData.idPoblacion" :key="poblacion.id">
                {{ poblacion.nombre }}
              </li>
            </ul>
          </div>
          <div class="titulo-descripcion">Fecha de Creación:</div>
          <div>{{ new Date(recomendacionData._created_at).toLocaleDateString() }}</div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" @click="cerrar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <HistorialAvanceActividad
      v-if="dialogs.historial"
      :historialData="selectedData"
      @cerrar="dialogs.historial=false"
    />
</template>

<script>
import { ref } from 'vue'
import HistorialAvanceActividad from 'src/components/Avance/HistorialAvance.vue'

export default {
  components: { HistorialAvanceActividad },
  props: {
    recomendacionData: {
      type: Object,
      required: true
    }
  },
  setup (props, { emit }) {
    const dialog = ref(true)
    const avances = ref([])
    const selectedData = ref(null)
    const dialogs = ref({
      historial: false
    })

    const cerrar = () => {
      emit('cerrar')
    }

    const handleTimelineClick = async (data) => {
      // selectedData.value = data
      selectedData.value = {
        idRecomendacion: data.id
      }
      dialogs.value.historial = true
    }

    return {
      dialog,
      avances,
      cerrar,
      handleTimelineClick,
      dialogs,
      selectedData
    }
  }
}
</script>

<style scoped>
.titulo{
  text-align: center;
}
.grid-container {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
}

.titulo-descripcion {
  font-weight: 600;
}

ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: disc;
}

li {
  margin-bottom: 4px;
}
</style>
