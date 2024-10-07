<template>
    <div class="row q-col-guuter-md">
     <div class="col-xs-12 text-right text-white">
       <p class="text-subtitle1 text-amber-6 q-mr-md text-bold q-mb-none">{{ $store.state.global.usuario?.entidad }}</p>
       <p class="text-body2 q-mr-md text-bold ">{{ $store.state.global.usuario?.rol?.nombre }}
         <q-btn
           v-if="$store.state.global.roles?.length >1"
           class="q-ml-sm"
           round
           icon="keyboard_arrow_down"
           flat
           size="sm"
         >
           <q-menu>
             <q-list style="min-width: 350px">
               <q-item
                 v-ripple
                 clickable
                 v-for="(rol, index) of $store.state.global.roles"
                 :key="index"
                 @click="refreshToken(rol.id, $store.state.global.usuario?.rol?.id)"
               >
                 <q-item-section avatar>
                   <q-icon name="people" />
                 </q-item-section>

                 <q-item-section>
                   <q-item-label>{{ rol.nombre }}</q-item-label>
                   <q-item-label class="text-caption text-grey">{{ rol.descripcion }}</q-item-label>
                 </q-item-section>

                 <q-item-section
                   side
                   v-if="rol.id ===  $store.state.global.usuario?.rol?.id"
                 >
                   <q-chip
                     color="positive"
                     round
                     text-color="white"
                     size="sm"
                   >ACTIVO</q-chip>
                 </q-item-section>
               </q-item>
             </q-list>
           </q-menu>
         </q-btn>
       </p>
     </div>
   </div>
</template>
<script>
import { inject } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
export default {
  setup () {
    const Auth = inject('auth')
    const Message = inject('message')
    const Quasar = useQuasar()
    const store = useStore()

    async function refreshToken (idRol, idRolActual) {
      if (idRol === idRolActual) Message.info('Ya tiene este cargo actualmente.')

      if (idRol !== idRolActual) {
        await Auth.refreshToken({ idRol })
        Quasar.loading.show({ message: 'Estamos cambiando su rol, espere por favor...' })

        store.commit('global/changeViewLayout', false)
        setTimeout(() => {
          store.commit('global/changeViewLayout', true)
          Message.success('Rol cambiado correctamente.')
          Quasar.loading.hide()
        }, 50)
      }
    }

    return {
      refreshToken
    }
  }
}
</script>
