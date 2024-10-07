<template>
  <q-page>
    <Titulo
      titulo="Dashboard"
      icono="dashboard"
    >
    </Titulo>
    <div class="row" :class="{'q-px-lg':$q.screen.gt.sm, 'q-px-xs':$q.screen.lt.sm}">
      <div class="col-xs-12">
        <div class="text-subtitle1 text-bold text-white q-px-lg">
          Bienvenido {{ usuario.nombres }}
        </div>
      </div>
      <div class="col-xs-12 col-md-12">
        <Noticias />
      </div>
    </div>
  </q-page>
</template>

<script>
import Noticias from 'components/Dashboard/Noticias.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'
export default {
  name: 'Dashboard',
  components: { Noticias },
  setup () {
    const store = useStore()
    return {
      usuario: computed(() => store.state.global.usuario)
    }
  }
}
</script>
