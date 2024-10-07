<template>
    <div class="row items-center">
        <div class="col-xs-12 col-md-9 text-subtitle1 text-weight-bold q-py-lg text-white">
          <q-icon name="receipt_long" size="md" class="q-mr-sm" /> Últimas Publicaciones
        </div>
        <div class="col-xs-12 col-md-3 text-right" v-if="usuario.rol?.id === roles.OPERADOR_MJTI">
            <q-btn
                color="amber-8"
                icon="add"
                label="nueva publicacion"
                @click="open"
            />
            <q-dialog
                v-model="dialog"
                persistent
            >
                <q-card style="width: 700px;max-width: 90vw;">
                    <q-toolbar class="q-pa-md">
                    <q-icon name="feed" size="md" color="primary" class="q-mr-sm"/>
                    <div class="text-subtitle1 text-bold text-primary">
                        {{ publicacion.id ? 'Editar' : 'Crear' }} publicación
                    </div>
                    <q-space />
                    <q-btn
                        flat
                        round
                        color="negative"
                        icon="close"
                        @click="close(close)"
                    >
                        <q-tooltip>Cancelar</q-tooltip>
                    </q-btn>
                    </q-toolbar>
                    <q-card-section>
                    <q-form
                        class="row q-col-gutter-md"
                        @submit="guardarPublicacion"
                    >
                        <q-field
                        class="col-xs-12"
                        :rules="publicacionRules.contenido"
                        v-model="publicacion.contenido"
                        >
                        <q-editor
                            style="width:100%;"
                            v-model="publicacion.contenido"
                        />
                        </q-field>
                        <div class="col-xs-12">
                        <q-file
                            label="Agregar un archivo a tu publicación"
                            outlined
                            v-model="publicacion.archivo"
                            accept=".pdf, .png, .jpg, .jpeg"
                            @update:model-value="transformFile"
                        >
                            <template v-slot:prepend>
                            <q-icon name="attach_file" />
                            </template>
                        </q-file>
                        </div>
                        <div
                        class="col-xs-12"
                        v-if="publicacion.urlArchivo"
                        >
                        <PreviewFile
                            :extension="publicacion.archivo?.name.split('.')?.pop()"
                            :urlArchivo="publicacion?.urlArchivo"
                        />
                        </div>
                        <q-select
                            label="Quienes Podrán ver la Publicación"
                            class="col-xs-12"
                            v-model="publicacion.entidades"
                            :options="entidades"
                            use-chips
                            multiple
                            outlined
                            option-label="nombre"
                            option-value="id"
                        />
                        <div class="col-xs-12 q-gutter-sm text-right">
                        <q-btn
                            label="Cancelar"
                            icon="close"
                            flat
                            color="negative"
                            @click="close(close)"
                        />
                        <q-btn
                            type="submit"
                            color="primary"
                            icon="save"
                            label="Guardar"
                        />
                        </div>
                    </q-form>
                    </q-card-section>
                </q-card>
            </q-dialog>
        </div>
    </div>
    <div v-if="publicaciones.length > 0">
        <q-card class="q-mb-md" v-for="(publicacion, index) of publicaciones" :key="index">
            <q-card-section>
                <q-item class="no-padding">
                    <q-item-section avatar class="text-center">
                        <q-avatar
                            v-if="publicacion.usuarioPublicacion?.nombres"
                            size="md"
                            font-size="30px"
                            color="primary"
                            text-color="white"
                        >
                            {{ publicacion.usuarioPublicacion?.nombres?.charAt(0).toUpperCase() }}
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label class="text-bold">{{ nombreCompleto(publicacion.usuarioPublicacion)
                            }}</q-item-label>
                        <q-item-label caption>{{ publicacion.createdAt }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn v-if="$store.state.global.usuario.idUser === publicacion.usuarioPublicacion.id" icon="delete"
                            color="negative" flat round @click="eliminarPublicacion(publicacion.id)">
                            <q-tooltip class="bg-negative text-white text-body2">
                                Eliminar publicacion
                            </q-tooltip>
                        </q-btn>
                    </q-item-section>
                </q-item>
                <p style="overflow-wrap: break-word;" v-html="publicacion.contenido"></p>
                <PreviewFile
                    v-if="publicacion.nombreArchivo"
                    :extension="publicacion.nombreArchivo?.split('.')?.pop()"
                    :urlArchivo="publicacion.nombreArchivo"
                />
            </q-card-section>
        </q-card>
    </div>
    <!-- <div v-else>
        <q-card style="height: 300px; align-content: center;">
            <q-card-section align="center">
                <q-icon name="receipt_long" size="xl" color="primary" />
                <br>
                <span class="text-primary text-subtitle1">No existen publicaciones</span>
            </q-card-section>
        </q-card>
    </div> -->
</template>
<script>
import { computed, inject, onMounted, ref } from 'vue'
import { constants } from '../../constants/app'
import PreviewFile from 'components/Dashboard/PreviewFile'
import validations from 'src/common/validations'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'

const publicacionRules = {
  contenido: [validations.requerido]
}

export default {
  name: 'Noticias',
  components: { PreviewFile },
  setup () {
    const _http = inject('http')
    const _message = inject('message')
    const $q = useQuasar()
    const publicaciones = ref([])
    const publicacion = ref({})
    const entidades = ref([])
    const dialog = ref(false)
    const query = ref({ limit: 10, page: 1, order: '-createdAt' })
    const total = ref(0)
    const store = useStore()
    const usuario = computed(() => store.state.global.usuario)

    onMounted(async () => {
      await getPublicaciones()
    })

    const getPublicaciones = async () => {
      const { rows, count } = await _http.get(_http.convertQuery('system/publicacion?filtroEntidad=true', query.value), false)
      publicaciones.value = rows
      total.value = count
    }

    const getEntidades = async () => {
      const { rows } = await _http.get('system/entidades?order=nombre')
      entidades.value = rows
    }

    const resetForm = () => {
      dialog.value = false
      publicacion.value = {
        contenido: '',
        archivo: null,
        urlArchivo: null,
        entidades: []
      }
    }

    const open = async () => {
      resetForm()
      await getEntidades()
      dialog.value = true
    }

    const close = () => {
      resetForm()
    }

    const convertFormData = (value) => {
      const formData = new FormData()
      for (const key in value) {
        if (value[key] !== null) {
          formData.append(key, value[key])
        }
      }
      return formData
    }

    const guardarPublicacion = async () => {
      try {
        if (publicacion.value.id) {
          await _http.put(`system/publicacion/${publicacion.value.id}`, publicacion.value)
        } else {
          let entidadesSeleccionada = null
          if (publicacion.value.entidades.length > 0) {
            entidadesSeleccionada = publicacion.value.entidades.map(e => e.id).toString()
          }
          publicacion.value.entidades = entidadesSeleccionada
          await _http.post('system/publicacion', convertFormData(publicacion.value), {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        }
        await getPublicaciones()
        _message.success('Publicacion realizada correctamente.')
        close()
      } catch (error) {
        _message.error('Ocurrio un error al realizar su publicación.')
      }
    }

    const eliminarPublicacion = (id) => {
      const configuracion = { ...constants.PROP_DIALOG }
      configuracion.message = '¿Esta seguro de derivar el instrumento?'
      $q.dialog(configuracion).onOk(async () => {
        await _http.delete(`system/publicacion/${id}`)
        query.value.page = 1
        await getPublicaciones()
        _message.success('Eliminado correctamente.')
      })
    }

    const transformFile = (file) => {
      publicacion.value.extension = file.name.split('.').pop()
      publicacion.value.urlArchivo = URL.createObjectURL(file)
    }

    const nombreCompleto = (usuario) => {
      if (usuario) return `${usuario.nombres} ${usuario.primerApellido} ${usuario.segundoApellido}`
      return ''
    }

    return {
      publicaciones,
      dialog,
      entidades,
      publicacion,
      publicacionRules,
      open,
      close,
      guardarPublicacion,
      transformFile,
      total,
      nombreCompleto,
      eliminarPublicacion,
      roles: constants.roles,
      usuario
    }
  }
}
</script>
