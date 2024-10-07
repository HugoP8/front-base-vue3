<template>
  <div class="row q-col-gutter-xs">
    <div class="col-xs-12">
      <div class="row bg-primary text-white titulo-global">
        <div class="col-xs-12 q-px-md q-mb-lg">
          <q-toolbar>
            <q-btn
              dense
              flat
              round
              class="text-white"
              icon="menu"
              color="white"
              @click="toggleLeftDrawer"
            />
            <q-space />
            <q-space />
            <Notificacion v-if="usuario" />
            <q-item
              clickable
              v-ripple
              style="padding-right: 5rem;"
            >
              <q-item-section v-if="usuario">
                <q-avatar
                  color="secondary text-white"
                  v-if="usuario.usuario"
                >
                {{ usuario?.foto_perfil ? "" :
                usuario.nombres.charAt(0).toUpperCase() +
                usuario.primerApellido.charAt(0).toUpperCase()
                }}

                  <img
                    v-if="usuario.foto_perfil"
                    :src="`${rutaImagen}/Src/Uploads/${usuario.foto_perfil}`"
                    style="max-width: 80px"
                  />
                </q-avatar>
              </q-item-section>
              <q-menu
                anchor="bottom right"
                self="top right"
              >
                <q-list style="min-width: 300px">
                  <q-item class="text-secondary">
                    <q-item-section>
                      <div class="row">
                        <div class="col-xs-2 column justify-center">
                          <q-avatar
                            color="primary text-white"
                            style="vertical-align: middle"
                            v-if="usuario.usuario"
                          >
                            {{
                                usuario.foto_perfil
                                  ? ""
                                  : usuario.nombres.toUpperCase().charAt(0)
                              }}
                            <img
                              v-if="usuario.foto_perfil"
                              :src="`${rutaImagen}/Src/Uploads/${usuario.foto_perfil}`"
                              style="max-width: 80px"
                            />
                          </q-avatar>
                        </div>
                        <div class="col-xs-10 q-pl-md">
                          <p class="text-h6">

                          </p>
                          <p class="text-weight-regular">
                            <q-icon name="people" /> {{ usuario.usuario }}
                          </p>
                          <p class="text-weight-regular">
                            <q-icon name="email" />
                            {{ usuario.correoElectronico }}
                          </p>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="$router.replace('/app/perfil')"
                  >
                    <q-item-section avatar>
                      <q-icon
                        color="primary"
                        name="person_outline"
                      />
                    </q-item-section>
                    <q-item-section>Mi cuenta</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    v-close-popup
                    @click="logout"
                  >
                    <q-item-section avatar>
                      <q-icon
                        color="primary"
                        name="exit_to_app"
                      />
                    </q-item-section>
                    <q-item-section>Cerrar sesión</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-toolbar>
        </div>
        <div class="col-xs-12 col-sm-6 q-px-md">
          <p class="q-pl-lg text-h6 text-weight-medium">
            <q-icon
              v-if="icono"
              :name="icono"
              size="md"
              style="margin-top:-5px;"
              class="q-mr-sm"
            />
            {{ titulo }}
            <slot name="subtitle" v-if="$slots.subtitle">
              <Estado :estado="estadoPredeterminado" />
            </slot>
          </p>
        </div>
        <div class="col-xs-12 col-sm-6 text-right q-px-xl">
          <slot name="otro">
            <RolesUsuario />
          </slot>
        </div>
        <div class="col-xs-12 bg-primary auxiliar">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import RolesUsuario from 'components/Seguridad/RolesUsuario'
import Estado from 'components/common/Estado.vue'
import Notificacion from 'components/common/Notificacion.vue'
import { computed, inject } from 'vue'
import { useStore } from 'vuex'
export default {
  props: {
    titulo: {
      type: String,
      default: () => ''
    },
    icono: {
      type: String,
      default: () => ''
    }
  },
  components: {
    RolesUsuario, Estado, Notificacion
  },
  setup (props) {
    const _auth = inject('auth')
    const store = useStore()
    const leftDrawerOpen = computed(() => store.state.global.leftDrawerOpen)

    const logout = async () => {
      await _auth.logout()
    }

    const toggleLeftDrawer = () => {
      store.commit('global/setLeftDrawerOpen', !leftDrawerOpen.value)
    }

    return {
      usuario: computed(() => store.state.global.usuario),
      toggleLeftDrawer,
      logout
    }
  }
}
</script>
<style lang="scss">
.auxiliar {
  height: 135px !important;
  margin-bottom: -130px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}

.titulo-global {
  padding-top: 15px;
  margin: 10px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
}
</style>
