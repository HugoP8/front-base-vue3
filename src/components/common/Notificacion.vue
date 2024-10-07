<template>
    <q-item clickable v-ripple>
        <q-item-section>
            <q-btn
              dense
              round
              icon="notifications"
            >
                <q-badge  color="red" floating v-if="cantidad>0">{{ cantidad }}</q-badge>
            </q-btn>
        </q-item-section>
        <q-menu anchor="bottom right" self="top right" @show="getNotificaciones">
            <q-card style="width: 400px">
                <q-toolbar class="bg-grey-2">
                    <div class="text-subtitle1 text-bold text-grey-8">Notificaciones</div>
                </q-toolbar>
                <q-card-section v-if="loading">
                    <q-item style="max-width: 300px" v-for="(item,index) in 3" :key="index">
                        <q-item-section avatar>
                            <q-skeleton type="QAvatar" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>
                            <q-skeleton type="text" />
                            </q-item-label>
                            <q-item-label caption>
                            <q-skeleton type="text" width="65%" />
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-card-section>
                <q-card-section v-else class="q-pa-none">
                    <q-list v-if="notificaciones.length>0">
                        <q-item v-for="notificacion in notificaciones" :key="notificacion.id" :class="{'bg-grey-4':!notificacion.leido}">
                            <q-item-section>
                                <div class="text-bold q-pt-md flex" :class="{'text-negative':notificacion.observado}">
                                    <div>{{ notificacion?.titulo }}</div>
                                    <q-space />
                                    <div class="text-caption text-orange-6 text-bold">{{ formatDate(notificacion.fechaNotificacion,'DD/MM/YYYY H:m') }}</div>
                                </div>
                                <div :class="{'text-negative':notificacion.observado}" v-html="notificacion.contenido" />
                                <div class="text-right" v-if="notificacion?.rutaCliente && !notificacion.leido">
                                    <q-btn size="sm" flat color="orange" label="ver" @click="go(notificacion)" />
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <div class="mensaje--nodata" v-else>
                      No tienes notificaciones
                    </div>
                </q-card-section>
            </q-card>
        </q-menu>
    </q-item>
</template>
<script>
import { inject, onMounted, ref } from 'vue'
import { date } from 'quasar'
import { useRouter } from 'vue-router'

const { formatDate } = date

export default {
  setup () {
    const _http = inject('http')
    const Router = useRouter()
    const cantidad = ref(0)
    const loading = ref(false)
    const notificaciones = ref([])

    onMounted(async () => {
      await getCantidadNoLeida()
    })

    const getCantidadNoLeida = async () => {
      cantidad.value = await _http.get('system/notificaciones/cantidad', false)
    }

    const getNotificaciones = async () => {
      loading.value = true
      const respuesta = await _http.get('system/notificaciones', false)
      if (respuesta) {
        notificaciones.value = respuesta.rows
        loading.value = false
      }
    }

    const go = async (notificacion) => {
      Router.push(notificacion?.rutaCliente)
      const respuesta = await _http.patch(`system/notificaciones/${notificacion.id}/leido`, false)
      if (respuesta) {
        notificacion.leido = true
        cantidad.value = cantidad.value - 1
      }
    }

    return {
      cantidad,
      loading,
      notificaciones,
      getNotificaciones,
      formatDate,
      go
    }
  }
}
</script>
