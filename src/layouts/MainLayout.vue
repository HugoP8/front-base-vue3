<template>
  <q-layout view="lHh lpR lff">
    <q-header :class="{ 'bg-primary': ! $q.dark.isActive, 'q-dark': $q.dark.isActive }">
      <q-drawer
        show-if-above
        v-model="leftDrawerOpen"
        side="left"
        :breakpoint="700"
        class="aside"
        :width="280"
        style="display: flex;
        flex-direction: column;
        height: 100%;"
      >
      <div style="flex-grow: 1;">
        <div class="text-center">
          <div class="logo">
            <q-img src="img/logoMinisterio.jpg" width="180px"/>
          </div>
          <div class="text-center q-pa-md">
            <q-avatar
              v-if="usuario?.nombres"
              size="90px"
              color="secondary text-white"
            >
              <!-- <img src="https://cdn.quasar.dev/img/boy-avatar.png"> -->
              {{ usuario?.foto_perfil ? "" :
                usuario.nombres.charAt(0).toUpperCase() +
                usuario.primerApellido.charAt(0).toUpperCase()
                }}
            </q-avatar>
            <div class="text-weight-bold text-white q-mt-sm">{{ usuario?.nombres }}</div>
            <div>{{ usuario?.correoElectronico }}</div>
          </div>
        </div>
        <q-list v-if="menu.length" padding>
          <q-item-label header class="text-white">Menu</q-item-label>
          <q-item
            v-for="item in menu"
            :key="item.ruta"
            :active="esSeleccionado(item)"
            clickable
            v-ripple
            active-class="bg-primary text-white"
            @click="$router.push(`/app/${item.ruta}`)"
          >
            <q-item-section avatar>
              <q-icon
                :name="item.icono"
                :color="esSeleccionado(item) ? 'white' : 'grey'"
              />
            </q-item-section>
            <q-item-section>
              {{ item.nombre }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
        <div class="drawer-footer">
          <q-toggle
            v-model="darkMode"
            :icon="darkMode ? 'dark_mode' : 'light_mode'"
            @click="darkModeChange"
            class="icon-toogle"
          />
        </div>
      </q-drawer>
    </q-header>
    <q-page-container v-if="$store.state.global.viewLayout">
      <router-view class="layout-view"/>
    </q-page-container>
    <PreviewPdf v-if="openPreviewPdf"/>

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
import PreviewPdf from 'components/common/PreviewPdf'

export default defineComponent({
  name: 'MainLayout',
  components: { PreviewPdf },
  setup (props, context) {
    const _auth = inject('auth')

    onMounted(() => {
      _auth.initStore()
    })
    const $q = useQuasar()
    const darkMode = ref($q.dark.isActive)
    const store = useStore()
    const route = useRoute()
    const leftDrawerOpen = computed(() => store.state.global.leftDrawerOpen)
    const openPreviewPdf = computed(() => store.state.global.dialogPdf)

    return {
      darkMode,
      darkModeChange () {
        $q.dark.set(!$q.dark.isActive)
      },
      menu: computed(() => store.state.global.menu),
      usuario: computed(() => store.state.global.usuario),
      leftDrawerOpen,
      openPreviewPdf,
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
.drawer-footer {
    padding: 16px;
  }
.icon-toogle{
    width: 10rem;
    font-size: 10rem;
  }
.logo{
  height: 230px;
  background-color: white;
  align-content: center;
  justify-content: center;
}
// scrollbar
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #555;
  // border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
