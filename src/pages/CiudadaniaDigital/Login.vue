<template>
  <q-layout view="lHh Lpr lFf">
    <q-header :class="{ 'bg-white': ! $q.dark.isActive, 'q-dark': $q.dark.isActive }">
      <q-toolbar class="q-py-md">
        <img src="https://firma.demo.gtic.gob.bo/img/logo_ciudadania2.png" width="110"/>
        <q-space />
        <img src="https://firma.demo.gtic.gob.bo/img/logo_bolivia.png" width="40" />
      </q-toolbar>
    </q-header>
    <q-page-container>
        <div class="row justify-center">
            <div class="col-xs-11 col-sm-8 col-md-5 col-lg-3">
                <q-card class="login q-pa-sm">
                    <q-card-section class="text-center">
                        <div class="text-h5 text-blue-10 text-weight-bold">Iniciar Sesión</div>
                        <div class="text-subtitle2">
                            Ingresar con tu Ciudadanía Digital en <span class="text-blue-10 text-bold">LOCAL<br>
                            MIN JUSTICIA MJYTI - COMPROMISOS INTERNACIONALES - TEST</span>
                        </div>
                    </q-card-section>
                    <q-card-section class="q-ma-sm">
                         <q-form class="row" @submit="login">
                            <div class="col-xs-12 text-weight-bold q-pb-sm">
                                Cédula de identidad
                            </div>
                            <q-input
                                outlined
                                v-model="formulario.usuario"
                                placeholder="Ingresa tu número de C.I."
                                lazy-rules
                                square
                                class="col-xs-12"
                                autofocus
                                :rules="rulesLogin.usuario"
                            />
                            <div class="col-xs-12 text-weight-bold q-pb-sm">
                                Contraseña
                            </div>
                            <q-input
                                outlined
                                v-model="formulario.contrasena"
                                placeholder="Ingresa tu contraseña"
                                lazy-rules
                                square
                                class="col-xs-12"
                                :type="isPwd ? 'password' : 'text'"
                                :rules="rulesLogin.contrasena"
                            >
                                <template v-slot:append>
                                <q-icon
                                    :name="isPwd ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="isPwd = !isPwd"
                                    color="primary"
                                />
                                </template>
                            </q-input>
                            <div class="col-xs-12 text-grey">
                                <p>
                                    <span class="text-blue-10">¿Olvidaste tu contraseña?</span><br>
                                    ¿Aún no eres Ciudadano Digital?<span class="text-blue-10"> Regístrate aquí</span>
                                </p>
                                <p>
                                    Al continuar, darás acceso a esta aplicación a tu(s) nombre(s), tus apellidos y tu número de carnet de identidad
                                </p>
                            </div>
                            <div class="col-xs-6 text-left">
                                 <q-btn
                                    color="default"
                                    flat
                                    no-caps
                                    class="q-ma-md"
                                    label="Volver"
                                    rounded
                                    to="/"
                                />
                            </div>
                            <div class="col-xs-6 text-right">
                                <q-btn
                                    type="submit"
                                    no-caps
                                    class="q-ma-md"
                                    label="Continuar"
                                    rounded
                                    size="md"
                                    color="light-green-14"
                                />
                            </div>
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref, inject, reactive } from 'vue'
import validaciones from '../../common/validations'

const rulesLogin = {
  usuario: [
    validaciones.requerido
  ],
  contrasena: [
    validaciones.requerido,
    validaciones.contrasena
  ]
}

export default {

  setup () {
    const $q = useQuasar()
    const isPwd = ref(true)
    const _auth = inject('auth')
    const formulario = reactive({
      usuario: '',
      contrasena: 'Agepic135'
    })

    const login = async () => {
      await _auth.login({ usuario: formulario.usuario, contrasena: formulario.contrasena })
    }
    // const _http = inject('http')
    const darkMode = ref($q.dark.isActive)

    return {
      darkMode,
      isPwd,
      formulario,
      login,
      rulesLogin,
      darkModeChange () {
        $q.dark.set(!$q.dark.isActive)
      }

    }
  }
}
</script>
<style scoped>
.alert{

  border-style: solid;
  border-color: #8FD300;
  background: #8FD30024;
  color: #2B2B2B;
  padding: 10px 5px;
  border-width: thin;
  border-radius: 8px;
  text-align: center;

}
.login{
    border: 1px #2B2B2B;
    border-style: solid;
}
</style>
