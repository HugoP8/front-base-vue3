<template>
<q-page>
  <q-header :class="{ 'bg-white': ! $q.dark.isActive, 'q-dark': $q.dark.isActive }">
    <q-toolbar class="q-py-md">
      <!-- <img src="https://firma.demo.gtic.gob.bo/img/logo_ciudadania2.png" width="110"/> -->
      <img class="h-12 lg:h-20 md:h-20 sm:h-20 w-auto xl:h-20" src="img/ciudadania-digital.png" width="180" alt="Ciudadania Digital">
      <q-space />
      <!-- <img src="https://firma.demo.gtic.gob.bo/img/logo_bolivia.png" width="40" /> -->
      <img class="h-12 lg:h-20 md:h-20 sm:h-20 w-auto xl:h-20" src="img/logo-estado-plurinacional-bolivia.png" width="70" alt="Ciudadania Digital">
    </q-toolbar>
  </q-header>
  <q-page-container style="padding-top:0px">
    <div class="row justify-center">
      <div class="column items-center col-12">
        <p class="text-bold">
          Confirmación de aprobación de documentos y envío a la cadena de bloques
        </p>
        <p class="text-bold text-center">
          Documento: Documento Local <br />
          Sistema: MJTI - VJDF - Compromisos Internacionales
        </p>
        <p>
          Para completar el proceso de aprobación de tu documento presiona el botón aprobar
        </p>
        <div class="row q-pb-md">
          <div class="col-6 column items-end">
            <q-btn
              rounded
              size="md"
              color="indigo-10"
              class="q-mr-md q-py-sm q-px-xl"
              label="Rechazar"
              no-caps
              @click="confirmar(false)"
            />
          </div>
          <div class="col-6 column items-start">
            <q-btn
              rounded
              size="md"
              class="q-ml-md q-py-sm q-px-xl"
              color="light-green-14"
              label="Aprobar"
              no-caps
              @click="confirmar(true)"
            />
          </div>
        </div>
      </div>
      <div class="col-lg-8 col-md-8 col-sm-11 col-xs-11 text-center">
        <p class="alert q-mr-lg">
          Descargue este documento, así podrá verificarlo cuando lo requiera.
        </p>
        <iframe
          style=" width:60vw; height:50vh"
          :src="`data:application/pdf;base64,${pdfFile}`"
        />
      </div>
    </div>
  </q-page-container>
</q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

export default {

  setup () {
    const $q = useQuasar()
    const _http = inject('http')
    const _message = inject('message')
    const Storage = inject('storage')
    const darkMode = ref($q.dark.isActive)
    const urlBase = process.env.BACKEND_URL
    const route = useRoute()
    const pdfFile = ref()
    const tokenNotificacion = process.env.TOKEN_NOTIFICACION_APROBACION
    const usuario = Storage.getUsuario()

    const uuidv4 = () => {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
    }

    onMounted(async _ => {
      pdfFile.value = await _http.get(`internacional/documentos/${route.query.documento}/pdf`)
    })

    const confirmar = (value) => {
      const tramite = route.query.tramite
      const headers = {
        Authorization: tokenNotificacion
      }
      const body = {
        aceptado: value,
        introducido: value,
        requestUuid: tramite,
        codigoOperacion: value ? uuidv4() : null,
        mensaje: 'COMPLETADO DE PRUEBAS',
        transaction_id: value ? uuidv4() : null,
        fechaHoraSolicitud: Date.now(),
        ci: usuario.usuario
      }

      axios.post(`${urlBase}/ciudadania/aprobacion`, body, { headers })
        .then(({ data }) => {
          if (data.finalizado) {
            if (value) {
              window.location.href = `/ciudadania/documento-aprobado?requestUuid=${tramite}&estado=${value}&finalizado=${value}&mensaje=Completado&linkVerificacion=http://gob.bo/&linkVerificacionVerificacionUnico=http://gob.bo&transactionCode=qweqweqwe-qweqwe-qwe`
            } else {
              window.location.href = `/ciudadania/documento-aprobado?requestUuid=&estado=${value}&finalizado=${value}&mensaje=La%20persona%20interesada%20ha%20rechazado%20la%20aprobaci%C3%B3n%20del%20tr%C3%A1mite%20o%20documento&linkVerificacion=http://gob.bo/&linkVerificacionVerificacionUnico=http://gob.bo&transactionCode=qweqweqwe-qweqwe-qwe`
            }
          }
        }).catch(error => {
          _message.error(`Error en aprobacion ciudadania digital ${error}`)
        })
    }

    return {
      darkMode,
      pdfFile,
      darkModeChange () {
        $q.dark.set(!$q.dark.isActive)
      },
      confirmar
    }
  }
}
</script>
<style scoped>
.alert {
  border-style: solid;
  border-color: #8fd300;
  background: #8fd30024;
  color: #2b2b2b;
  padding: 10px 5px;
  border-width: thin;
  border-radius: 8px;
  text-align: center;
}
</style>
