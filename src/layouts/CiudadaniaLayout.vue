<template>
  <q-layout view="lHh lpR lff">

    <q-header :class="{ 'bg-primary': ! $q.dark.isActive, 'q-dark': $q.dark.isActive }">
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
        <q-toggle
          v-model="darkMode"
          icon="dark_mode"
          @click="darkModeChange"
        />
        <q-item
          clickable
          v-ripple
        >
          <q-item-section v-if="usuario">
            <q-avatar
              color="secondary text-white"
              v-if="usuario.usuario"
            >
              {{
                  usuario?.foto_perfil
                    ? ""
                    : usuario.usuario.toUpperCase().charAt(0)
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
                              : usuario.usuario.toUpperCase().charAt(0)
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
    </q-header>

    <q-page-container>
      <router-view
        class="layout-view"
        style="padding-top:15px;"
      />
    </q-page-container>

    <q-footer class="q-footer-main">
      <q-toolbar>
        <q-toolbar-title>
          <div class="footer">
            V1.0 © Justicia {{ new Date().getFullYear() }}
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, inject } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',
  setup (props, context) {
    const _auth = inject('auth')

    onMounted(() => {
      _auth.initStore()
    })

    const $q = useQuasar()
    const darkMode = ref($q.dark.isActive)
    const leftDrawerOpen = ref(false)
    const store = useStore()
    const route = useRoute()

    const logout = async () => {
      await _auth.logout()
    }

    return {
      logout,
      darkMode,
      darkModeChange () {
        $q.dark.set(!$q.dark.isActive)
      },
      menu: computed(() => store.state.global.menu),
      usuario: computed(() => store.state.global.usuario),
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      esSeleccionado (item) {
        return (route.path.includes(item.ruta) && item.ruta !== '') || (item.ruta === '' && route.path === '/')
      }
    }
  }
})
</script>

<style lang="scss">
$aside: #1e1e2d;
$aside-dark: #1b1b28;
$height: 190px;

.q-drawer-container {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
}

.aside-dark {
  background-color: $aside;
  color: #9899ac;

  .aside-scroll {
    height: calc(100% - 190px);
    margin-top: $height;
  }

  .aside-header {
    height: $height;
    background-color: $aside-dark;
  }

  .aside-title {
    color: white;
    margin: 0;
    font-size: 1.4rem;
    font-weight: bold;
    // text-align: center;
    line-height: 3.2rem;
    background: #1b1b28;
    padding: 0 28px;
  }

  .aside-email {
    font-size: 0.75rem;
  }

  .q-item {
    padding: 6px 25px;
    min-height: 46px;

    &.q-router-link--active,
    &:hover {
      transition: color 0.2s ease, background-color 0.2s ease;
      background-color: $aside-dark;

      .q-item__section--main {
        color: white;
      }

      .q-icon {
        color: $primary;
      }
    }

    .q-item__section--avatar {
      padding-right: 10px;
      min-width: 40px;
    }

    &.q-hoverable:hover {
      & > .q-focus-helper {
        opacity: 0;
      }
    }

    .q-icon {
      color: #494b74;
    }
  }
}
</style>
