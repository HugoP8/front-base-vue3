<template>
  <q-card class="my-car q-ma-md bg-yellow-1">
    <q-item>
      <q-item-section avatar>
        <q-btn
          round
          color="orange-7"
          icon="workspace_premium"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-h5 text-bold">Documento aprobado con ciudadania digital satisfactoriamente</q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-card-section>
      <table>
        <tr>
          <td class="titulo">Estado</td>
          <td class="descripcion">{{ $route.query.estado }}</td>
        </tr>
        <tr>
          <td class="titulo">Finalizado</td>
          <td class="descripcion">{{ $route.query.finalizado }}</td>
        </tr>
        <tr>
          <td class="titulo">Mensaje</td>
          <td class="descripcion">{{ $route.query.mensaje }}</td>
        </tr>
        <tr>
          <td class="titulo">uuidBlockchain</td>
          <td class="descripcion">{{ $route.query.uuidBlockchain }}</td>
        </tr>
        <tr>
          <td class="titulo">linkVerificacion</td>
          <td class="descripcion">{{ $route.query.linkVerificacion }}</td>
        </tr>
        <tr>
          <td
            class="titulo"
            style="padding-right: 20px;"
          >linkVerificacionUnico</td>
          <td class="descripcion">{{ $route.query.linkVerificacionUnico }}</td>
        </tr>
      </table>
    </q-card-section>
    <q-card-actions
      align="center"
    >
      <q-btn
        flat
        color="primary"
        icon="home"
        label="ir al inicio"
        @click="goRoute('/app/dashboard')"
      />
      <q-btn
        v-if="aprobacion!=null"
        color="primary"
        icon="check"
        label="Continuar"
        @click="goRoute(aprobacion.urlRedireccionCliente || '/app/dashboard')"
      />
    </q-card-actions>
  </q-card>
</template>
<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup () {
    const router = useRouter()
    // const route = useRoute()
    // const _http = inject('http')
    const aprobacion = ref(null)

    onMounted(() => {
      // getDataAprobacion()
    })

    onBeforeUnmount(() => {
      // clearInterval(interval)
      // clearInterval(bufferInterval)
    })

    // async function getDataAprobacion () {
    //   if (route.query.requestUuid) {
    //     aprobacion.value = await _http.get(`system/aprobacion-documento/${route.query.requestUuid}`)
    //   } else {
    //     router.push({ path: '/app/dashboard' })
    //   }
    // }

    return {
      aprobacion,
      goRoute (path) {
        router.push({ path })
      }
    }
  }
}
</script>
<style scoped>
td.descripcion {
  border: 3px solid transparent;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}
td.titulo {
  font-weight: bold;
}
</style>
