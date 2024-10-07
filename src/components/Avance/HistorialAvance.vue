<template>
<q-dialog v-model="dialog" persistent>
    <q-card class="timeLine">
    <q-card-section>
        <div class="text-h6">Historial de avance</div>
    </q-card-section>
    <q-card-section>
        <q-timeline :layout="layout" color="secondary">
        <q-timeline-entry v-for="(avance, index) in avances.slice().reverse()" :key="avance.id" title="Registro de avance"
            :subtitle="avance.createdAt" :side="index % 2 === 0 ? 'left' : 'right'" :icon="avance.icono">
            <div>
            <div>
              <span class="titulo-descripcion">Actividad realizada:</span>
              <br /> {{ avance.actividadRealizada }}
            </div>
            <div>
              <span class="titulo-descripcion">Estado avance:</span>
              <br /> {{ avance.estado }}
            </div>
            <div v-if="avance.fechaRealizacion">
              <span class="titulo-descripcion">Fecha a realizarse:</span>
              <br /> {{ avance.fechaRealizacion }}
            </div>
            <div>
              <span class="titulo-descripcion">Medio de verificación:</span>
              <br /> {{ avance.medioVerificacion }}
            </div>
            <div v-if="avance.urlAdjunto">
              <span class="titulo-descripcion">URL adjunto:</span><br />
                <a class="link" :href="avance.urlAdjunto" target="_blank">{{ shortenedUrl(avance.urlAdjunto) }}</a>
            </div>
            <div v-if="avance.rutaArchivo">
              <span class="titulo-descripcion">Archivo adjunto:</span>
              <br /> <q-btn flat color="primary" label="Descargar" icon="cloud_download"
                    @click="descargarAdjunto(avance.rutaArchivo)" />
                  </div>
            </div>
        </q-timeline-entry>
        </q-timeline>
    </q-card-section>
    <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="primary" @click="cerrar" />
    </q-card-actions>
    </q-card>
</q-dialog>
</template>
<script>
import { onMounted, ref, computed, inject } from 'vue'
import { useQuasar } from 'quasar'
export default {
  props: {
    historialData: {
      type: Object,
      required: true
    }
  },
  setup (props, { emit }) {
    const $q = useQuasar()
    const _http = inject('http')
    const dialog = ref(true)
    const avances = ref([])

    onMounted(async () => {
      await getAvances()
      console.log('props.historialData.idRecomendacion::', props.historialData.idRecomendacion)
    })

    const getAvances = async () => {
      try {
        const urlAvance = 'internacional/recomendacion-avance'
        const response = await _http.get(`${urlAvance}`)
        console.log('resùesta::', response)
        avances.value = response.rows.filter(
          avance => avance.idRecomendacion === props.historialData.idRecomendacion &&
                    avance.idRecomendacionEntidad === props.historialData.id)
      } catch (error) {
        console.error('Error al obtener los avances:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al obtener los avances'
        })
      }
    }

    const shortenedUrl = (url) => {
      if (!url) {
        return ''
      }
      const maxLength = 30
      if (url.length > maxLength) {
        return url.substring(0, maxLength) + '...'
      }
      return url
    }

    const layout = computed(() => {
      return $q.screen.lt.sm ? 'dense' : ($q.screen.lt.md ? 'comfortable' : 'loose')
    })
    const cerrar = () => {
      emit('cerrar')
    }
    const descargarAdjunto = async (urlAdjunto) => {
      try {
        const nombreAdjunto = urlAdjunto.split('/').pop()
        const response = await _http.getFile(
          `internacional/recomendacion-avance/adjunto/${nombreAdjunto}`
        )
        const link = document.createElement('a')
        link.href = response
        link.download = nombreAdjunto
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(response)
      } catch (error) {
        console.error('Error al descargar el archivo adjunto:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al descargar el archivo adjunto'
        })
      }
    }
    return {
      dialog,
      avances,
      shortenedUrl,
      cerrar,
      layout,
      descargarAdjunto
    }
  }
}
</script>
<style scoped>

.timeLine {
  max-width: 70%;
  width: 50%;
}
.titulo-descripcion{
  font-weight: 600
}
</style>
