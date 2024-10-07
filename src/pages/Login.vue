<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md main-content" style="max-width: 1200px;">
      <div class="row justify-center q-mb-md">
        <q-img src="img/logoMinisterioQ.png" style="max-width: 150px" />
      </div>
      <div class="row justify-center text-center q-mb-md">
        <p class="text-h5 text-bold text-grey-9">
          Sistema de seguimiento y cumplimiento a &nbsp;
        </p>
        <p class="text-h5 text-bold text-grey-9">
          Compromisos Internacionales
        </p>
      </div>
      <div style="margin-bottom: 66px" class="row q-col-gutter-md q-mb-md">
        <div class="col-xs-12 col-md-6">
          <div class="text-h6 text-bold text-grey-7">
            INFORMACIÓN DE INTERÉS
          </div>
          <q-card style="height: 40vh;" flat class="custom-margin">
            <q-card-section>
              <q-card
                style="height: 60px;"
                class="card-clickable"
                v-for="(interes, index) in intereses"
                :key="index"
              >
                <a :href="interes.link" target="_blank" class="card-link">
                  <q-card-section>
                    <div class="text-subtitle2">{{ interes.nombre }}</div>
                  </q-card-section>
                </a>
              </q-card>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-xs-12 col-md-6">
          <q-card style="height: 40vh;" flat>
            <q-card-section class="q-pt-none" style="height: 100%">
              <div class="row justify-center items-center" style="height: 100%;">
                <div class="col-xs-12 col-md-8 text-center">
                  <div class="q-pb-xl">
                    <q-btn
                      rounded
                      class="full-width"
                      color="green"
                      outline
                      style="height: 55px;"
                      @click="loginCiudadania"
                      :loading="loading"
                    >
                      <q-img
                        src="img/btn_ciudadania_digital_v2.png"
                        style="height: 50px; max-width: 150px"
                      />
                    </q-btn>
                  </div>
                  <span class="text-grey-8">
                    ¿No tienes cuenta en ciudadania?
                  </span>
                  <span class="text-blue-5">Registrate aquí</span><br /><br />
                  <span class="text-grey-8">¿Olvidaste tu contraseña?</span>
                  <span class="text-blue-5"> Presiona aquí</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="row justify-center">
        <q-btn
          label="Tutorial"
          icon="school"
          color="primary"
          class="q-mr-md"
          @click="openTutorial"
        />
        <q-btn
          label="Manual"
          icon="menu_book"
          color="primary"
          @click="openManual"
        />
      </div>
    </div>
    <q-dialog v-model="showManualDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-bold text-center">Descargar Manuales</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-list>
            <q-item v-for="(manual, index) in manuals" :key="index">
              <q-item-section>
                <q-btn :label="manual.label" @click="downloadManual(manual.link)" color="primary" flat />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="negative" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <footer class="footer">
      <div class="text-center">
        <p class="text-grey-13">&copy; 2024 Ministerio de Justicia. Todos los derechos reservados.</p>
      </div>
    </footer>
  </q-page>
</template>

<script>
import { reactive, ref, inject } from 'vue'
import validaciones from '../common/validations'

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
    const isPwd = ref(true)
    const _auth = inject('auth')
    const loading = ref(false)
    const showManualDialog = ref(false)
    const formulario = reactive({
      usuario: '',
      contrasena: ''
    })

    const intereses = [
      {
        nombre: 'Comisión de verdad',
        link: 'https://comisiondelaverdad.justicia.gob.bo/#/#informe'
      },
      {
        nombre: 'Comisión Interamericana de Derechos Humanos (CIDH)',
        link: 'https://www.oas.org/es/CIDH/jsForm/?File=/es/cidh/mandato/que.asp'
      },
      {
        nombre: 'Corte Interamericana de Derechos Humanos (Corte IDH)',
        link: 'https://www.corteidh.or.cr/'
      },
      {
        nombre: 'Sistema Universal de Protección de Derechos Humanos (ONU)',
        link: 'https://tbinternet.ohchr.org/_layouts/15/TreatyBodyExternal/countries.aspx?CountryCode=BOL&Lang=SP'
      }
    ]

    const login = async () => {
      await _auth.login({ usuario: formulario.usuario, contrasena: formulario.contrasena })
    }
    const loginCiudadania = async () => {
      loading.value = true
      await _auth.loginCiudadania()
      loading.value = false
    }

    const manuals = [
      { label: 'Manual Operador', link: '/manuales/ManualOperador.pdf' },
      { label: 'Manual Supervisor', link: '/manuales/ManualSupervisor.pdf' }
    ]
    const openTutorial = () => {
      window.open('https://drive.google.com/drive/folders/1zYZ5lQ3YZ0lDVcbpGgFYZvV_lzkJix47', '_blank')
    }
    const openManual = () => {
      showManualDialog.value = true
    }

    const downloadManual = (link) => {
      window.open(link, '_blank')
    }
    return {
      intereses,
      loading,
      login,
      loginCiudadania,
      isPwd,
      formulario,
      rulesLogin,
      openTutorial,
      openManual,
      showManualDialog,
      manuals,
      downloadManual
    }
  }
}
</script>

<style>
.main-content {
  margin-bottom: 90px;
}
.card-clickable {
  margin-bottom: 20px;
  border-radius: 20px;
  text-align: center;
}
.card-clickable:hover {
  background-color: #EFF9F8;
  transition: 0.4s;
  cursor: pointer;
}
.custom-margin {
  margin: 16px;
}
.footer {
  width: 100%;
  padding: 10px 0;
  background-color: #333333;
  position: fixed;
  bottom: 0;
  left: 0;
}
.card-link {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
}
.card-link .q-card-section {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
