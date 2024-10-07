<template>
  <q-page>
    <Titulo titulo="Diagrama de avances por recomendaciones vinculadas" icono="query_stats"></Titulo>
    <div class="row" :class="{'q-px-xl':$q.screen.gt.lg,'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
      <div class="q-pa-md col-xs-12 col-md-12">
        <q-card class="q-mb-md" flat bordered>
          <q-card-section class="custom-tittle text-center">
            Criterios de búsqueda
          </q-card-section>
          <q-card-section>
            <div class="form-container row q-col-gutter-md">
              <q-select
                outlined
                v-model="selectedTematica"
                :options="tematicas"
                option-value="id"
                option-label="nombre"
                label="Temática"
                map-options
                emit-value
                class="col-xs-12 col-md-3"
              />
              <q-select
                outlined
                v-model="selectedPoblacion"
                :options="poblaciones"
                option-value="id"
                option-label="nombre"
                label="Población"
                map-options
                emit-value
                class="col-xs-12 col-md-3"
              />
              <q-select
                outlined
                class="col-xs-12 col-md-5"
                label="Recomendación"
                use-input
                map-options
                input-debounce="0"
                v-model="selectedRecomendaciones"
                :options="recomendaciones"
                option-value="id"
                @filter="filtroRecomendacion"
                menu-shrink
                hide-dropdown-icon
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay datos
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="scope">
                  <q-item class="custom-item">
                    <q-item-section>
                      <q-item-label class="textoRecomendacion" v-html="scope.opt.recomendacion" lines="3"></q-item-label>
                      <q-item-label caption class="textoPersonalizado">
                        <b>Instrumento: {{ scope.opt.instrumento.nombreDocumento }} </b> , Número: {{ scope.opt.codigo }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section avatar>
                      <q-btn color="negative" flat round icon="delete" @click="scope.removeAtIndex(scope.index)" />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="custom-item-option" style="width: 670px; max-width: 90vw;">
                    <q-item-section>
                      <q-item-label class="textoRecomendacion" v-html="scope.opt.recomendacion"></q-item-label>
                      <q-item-label caption class="textoPersonalizado">
                        <b style="color: #1c1c1c;">Instrumento: {{ scope.opt.instrumento.nombreDocumento }} </b> , Número: {{ scope.opt.codigo }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <!-- <q-input
                outlined
                v-model="nivel"
                label="Nivel"
                type="number"
                class="col-xs-12 col-md-2"
              /> -->
              <div class="q-pa-md q-gutter-sm">
                <q-btn
                  v-if="hasSearched && usuario.rol?.id === roles.SUPERVISOR_MJTI"
                  round
                  color="negative"
                  icon="clear"
                  @click="clear"
                />
                <q-btn
                  v-else-if="usuario.rol?.id === roles.SUPERVISOR_MJTI"
                  round
                  color="primary"
                  icon="search"
                  @click="search"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
        <div class="btn-focus-wrapper" v-if="(respuestaVinculadas!==null)">
          <q-btn
            round
            glossy
            color="orange"
            icon="lightbulb"
            class="btn-focus"
            @click="abrirModalFoco"
          />
        </div>
        <div class="cardPrincipal row justify-center">
          <q-card
            class="card1 q-mt-md"
            v-if="selectedRecommendationData && selectedRecommendationData.rows.length > 0"
          >
            <q-card-section>
              <q-btn
                flat
                round
                icon="visibility"
                class="absolute-top-right q-pa-xs"
                @click="verDetallesRecomendacion(selectedRecommendationData.rows[0])"
              />
            </q-card-section>
            <q-card-section class="contenidoCardPrincipal">
              <div>
                <p>{{ selectedRecommendationData.rows[0].codigo }}.- {{ selectedRecommendationData.rows[0].recomendacion }}</p>
              </div>
            </q-card-section>
          </q-card>
        </div>

    <div class="primerNivel row justify-center q-gutter-md" v-if="(respuestaVinculadas!==null)">
      <q-card
        v-for="(recomendacion, index) in respuestaVinculadas"
        :key="index"
        flat
        bordered
        class="cardNivel1 contenidoNivelUno"
      >
        <q-card-section>
          <q-btn
            flat
            round
            icon="visibility"
            class="absolute-top-right q-pa-xs"
            @click="verDetallesRecomendacion(recomendacion)"
          />
        </q-card-section>
        <q-card-section >
          <p>{{ recomendacion.codigo }}.- {{ recomendacion.recomendacion }}</p>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="respuestaVinculadas === null">
      <q-card class="q-mt-md">
        <q-card-section>
          <p class="text-center">No hay datos</p>
        </q-card-section>
      </q-card>
    </div>
      </div>
    </div>
    <q-dialog v-model="dialog.foco" class="modal-foco">
      <q-card>
        <q-card-section class="text-h6">
          Descripción
        </q-card-section>
        <q-card-section>
          <div class="grid-container">
            <div class="grid-item-left">
              <div class="color-box tone1"></div>
              <div class="color-box tone2"></div>
            </div>
            <div class="grid-item-right">
              <p>Recomendación principal.</p>
              <p>Recomendaciones donde es parte de las vinculadas.</p>
            </div>
          </div>
        </q-card-section>
        <q-card-actions style="justify-content: right;">
          <q-btn color="primary" label="Cerrar" @click="cerrarModalFoco" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <RecomendacionModal
      v-if="dialog.recomendacion"
      :recomendacionData="selectedData"
      @cerrar="dialog.recomendacion=false"
    />
  </q-page>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useStore } from 'vuex'
import { constants } from '../constants/app'
import RecomendacionModal from 'src/components/Recomendacion/RecomendacionModal.vue'

export default {
  components: { RecomendacionModal },
  name: 'DiagramaAvances',
  setup () {
    const _http = inject('http')
    const store = useStore()
    const url = ref('internacional/reportes')
    const tematicas = ref([])
    const poblaciones = ref([])
    const selectedTematica = ref(null)
    const selectedPoblacion = ref(null)
    const selectedRecomendaciones = ref(null)
    const nivel = ref(null)
    const hasSearched = ref(false)
    const recomendaciones = ref([])
    const selectedRecommendationData = ref(null)
    const respuestaVinculadas = ref([])
    const dialog = ref({
      recomendacion: false,
      foco: false
    })
    const selectedData = ref(null)
    const usuario = computed(() => store.state.global.usuario)

    onMounted(async () => {
      try {
        const { rows: tematicasRows } = await _http.get('/system/parametros?grupo=tematica')
        tematicas.value = tematicasRows.sort((a, b) => a.nombre.localeCompare(b.nombre))
        const { rows: poblacionesRows } = await _http.get('/system/parametros?grupo=poblacion')
        poblaciones.value = poblacionesRows.sort((a, b) => a.nombre.localeCompare(b.nombre))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    })

    const filtroRecomendacion = async (val, update, abort) => {
      update(async () => {
        const query = {
          palabraClave: val,
          idTematica: selectedTematica.value,
          idPoblacion: selectedPoblacion.value,
          limit: (!val || val === '') ? 5 : 10
        }
        const { rows } = await _http.get(_http.convertQuery('internacional/diagramas/recomendaciones-buscar', query))
        let respuesta = rows
        if (val && val !== '') {
          const palabrasBuscadas = val.trim().split(/\s+/).join('|')
          respuesta = rows.map(item => ({
            ...item,
            recomendacion: item.recomendacion.replace(
              new RegExp(`(${palabrasBuscadas})`, 'gi'),
              '<b class="text-orange-7">$1</b>'
            )
          }))
        }
        recomendaciones.value = respuesta
      })
    }

    const search = async () => {
      if (selectedRecomendaciones.value) {
        try {
          const respuestaRecomendacion = await _http.get(`/internacional/diagramas/recomendaciones-diagrama/${selectedRecomendaciones.value.id}`)
          selectedRecommendationData.value = respuestaRecomendacion

          const respuestaVinculada = await _http.get(`/internacional/diagramas/recomendaciones-vinculadas/${selectedRecomendaciones.value.id}`)
          respuestaVinculadas.value = respuestaVinculada
          hasSearched.value = true
        } catch (error) {
          console.error('Error fetching recommendation details:', error)
        }
      }
    }

    const clear = () => {
      selectedTematica.value = null
      selectedPoblacion.value = null
      selectedRecomendaciones.value = null
      nivel.value = null
      hasSearched.value = false
      selectedRecommendationData.value = null
      respuestaVinculadas.value = []
    }
    const verDetallesRecomendacion = async (data) => {
      selectedData.value = data
      dialog.value.recomendacion = true
    }
    const abrirModalFoco = () => {
      dialog.value.foco = true
    }

    const cerrarModalFoco = () => {
      dialog.value.foco = false
    }

    return {
      url,
      tematicas,
      poblaciones,
      clear,
      search,
      selectedTematica,
      selectedPoblacion,
      selectedRecomendaciones,
      nivel,
      hasSearched,
      usuario,
      recomendaciones,
      filtroRecomendacion,
      roles: constants.roles,
      selectedRecommendationData,
      respuestaVinculadas,
      selectedData,
      dialog,
      verDetallesRecomendacion,
      abrirModalFoco,
      cerrarModalFoco
    }
  }
}
</script>

<style scoped lang="scss">
.form-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.custom-tittle {
  font-weight: bold;
  color: $secondary;
}
.cardPrincipal {
  width: 30%;
  margin: auto;
  position: relative;
}

.contenidoCardPrincipal{
  width: 15rem;
  height: 10rem;
  overflow-y: auto;
}
.primerNivel {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0rem !important;
  position: relative;
}
.contenidoNivelUno{
  width: 15rem;
  height: 10rem;
  overflow-y: auto;
}
.cardNivel1 {
  width: 15rem;
  position: relative;
  background-color: #858383;
  color: white;
}
.card1{
  background-color: #272727;
  color: white;
}
.cardPrincipal {
  width: 30%;
  margin: auto;
  position: relative;
}

.cardNivel1 {
  width: 15rem;
  position: relative;
  background-color: #858383;
  color: white;
}

.cardPrincipal::after {
  content: "";
  position: absolute;
  top: 101%;
  left: 50%;
  width: 2px;
  height: 30px;
  background-color: #6d6d6d;
  transform: translateX(-50%);
}

.cardNivel1::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 20px;
  background-color: black;
  transform: translateX(-50%);
}

.primerNivel {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem !important;
  position: relative;
}

.primerNivel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 5%;
  width: 90%;
  height: 2px;
  background-color: rgb(255, 255, 255);
}
.btn-focus-wrapper {
  display: flex;
  justify-content: right;
  position: relative;
  background-color: #797979;
}

.btn-focus {
  position: absolute;
  z-index: 10;
  background-color: #797979;
}
.modal-foco {
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;
  }

  .grid-item-left {
    display: flex;
    flex-direction: column;
  }

  .color-box {
    height: 40%;
    width: 100%;
  }

  .tone1 {
    background-color: #272727;
  }

  .tone2 {
    background-color: #858383;
  }

  .grid-item-right {
    p {
      margin: 0;
      padding: 8px 0;
    }
  }
}
@media (max-width: 768px) {
  .form-container {
    flex-direction: column;
  }
}
</style>
