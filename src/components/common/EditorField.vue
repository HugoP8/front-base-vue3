<template>
  <div
    class="form-group"
    role="group"
  >
    <q-field
      v-model="localLabel"
      class="q-pb-md"
      :rules="valoresRules.titulo">
        <q-input
          :readonly="!edicion"
          class="custom-input bold-text"
          v-model="localLabel"
          label="Título"
        />
      <q-icon name="edit" class="q-ml-sm cursor-pointer text-primary"/>
    </q-field>
    <q-field
      :identificador="element?.uid"
      v-model="model"
      :rules="rules"
      class="q-pb-md"
      @focus.stop="toogleToolbarEditor"
      @blur.stop="toogleToolbarEditor"
    >
      <q-editor
        style="width:100%;"
        flat
        v-model="model"
        ref="editorRef"
        min-height="4rem"
        content-class="bg-grey-3 text-black"
        :readonly="!edicion || element.readonly"
        :toolbar="toolbar"
        :definitions="definitions"
        @paste="onPaste"
      >
      </q-editor>
    </q-field>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useVModel } from 'src/composables/useVModel'
import { useQuasar } from 'quasar'
import DOMPurify from 'dompurify'
import Sanitize from 'src/common/Sanitize/sanitize'
import CONFIG_RELAXED from 'src/common/Sanitize/relaxed'
import validaciones from '../../common/validations.js'

const valoresRules = {
  titulo: [validaciones.requerido]
}
export default {
  props: {
    element: { required: true, type: Object, default: () => {} },
    value: { default: '' },
    cantidad: { default: 0 },
    edicion: { default: true },
    borrador: { default: false }
  },
  setup (props, { emit }) {
    const model = useVModel(props, 'value')
    const cantidad = useVModel(props, 'cantidad')
    const rules = ref(null)
    const toolbar = ref([])
    const Quasar = useQuasar()
    const localLabel = ref(props.element.label)
    const definitions = {
      p: { label: 'Parrafo', icon: 'format_size', tip: 'parrafo' },
      h6: { label: 'Subtitulo', icon: 'format_size', tip: 'Subtitulo' },
      'size-1': { label: 'v.b', icon: Quasar.iconSet.editor.fontSize }
    }
    const sanitize = new Sanitize(CONFIG_RELAXED)
    const cantidadPalabras = computed(() => {
      const text = model.value.replace(/<\/?[^>]+(>|$)/g, '')
      const cleanedText = text.replace(/\s+/g, ' ').trim()
      const words = cleanedText.split(' ')
      const wordCount = words.filter(word => word.length > 0).length
      setCantidad(wordCount)
      return wordCount
    })

    const setCantidad = (palabras) => {
      cantidad.value = palabras
    }
    watch(cantidadPalabras, (newCount, oldCount) => {
      emit('updateWordCount', newCount - oldCount)
    })

    onMounted(() => {
      const validaciones = []
      if (props.element.required) {
        validaciones.push(v => !!v || 'El campo es requerido.')
      }
      if (props.element.minlength) {
        const { minlength } = props.element
        validaciones.push(v => (!!v && v.length > parseInt(minlength)) || `El campo debe tene al menos ${minlength} caracteres`)
      }
      if (props.element.maxlength) {
        const { maxlength } = props.element
        validaciones.push(v => (!!v && v.length < parseInt(maxlength)) || `El campo debe tener como maximo ${maxlength} caracteres`)
      }
      rules.value = validaciones
    })

    const col = ref()
    const rows = ref()
    const editorRef = ref(null)
    const pasteCount = ref(0)

    const toogleToolbarEditor = () => {
      if (toolbar.value.length === 0) {
        toolbar.value = [
          ['bold', 'italic', 'underline', 'subscript', 'superscript'],
          ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
          ['left', 'center', 'right', 'justify'],
          ['h6', 'p', 'size-1', {
            label: Quasar.lang.editor.fontSize,
            icon: Quasar.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          }],
          ['removeFormat', 'undo', 'redo']
        ]
      }
      const value = model.value
      model.value = value.replaceAll('<div><br></div><div><br></div>', '')
    }

    const removerElement = () => {
      Quasar.dialog({
        title: 'Confirmacion',
        message: '¿Esta seguro de eliminar el elemento editor del documento?. si acepta no se podran revertir los cambios',
        persistent: true,
        ok: { color: 'primary', label: 'Aceptar' },
        cancel: { color: 'white', 'text-color': 'black', label: 'Cancelar' }
      }).onOk(async () => {
        emit('remover', props.element.uid)
        // pasoModel.value.configuracion.splice(index, 1)
      })
    }

    const addElement = () => {
      Quasar.dialog({
        title: 'Confirmacion',
        message: '¿Esta seguro de adicionar un nuevo párrafo al documento?. si acepta no se podran revertir los cambios',
        persistent: true,
        ok: { color: 'primary', label: 'Aceptar' },
        cancel: { color: 'white', 'text-color': 'black', label: 'Cancelar' }
      }).onOk(async () => {
        emit('adicionar', {
          tipo: 'parrafo',
          uid: props.element.uid
        })
      })
    }

    function obtenerHtml (cadenaHtml) {
      const div = document.createElement('div')
      div.innerHTML = cadenaHtml.trim()
      return div
    }

    function htmlToString (element) {
      const wrapper = document.createElement('div')
      wrapper.appendChild(element.cloneNode(true))
      return wrapper.innerHTML
    }

    function getBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64String = reader.result
          resolve(base64String)
        }
        reader.onerror = () => {
          reject(new Error('Error al leer el archivo.'))
        }
        reader.readAsDataURL(file)
      })
    }

    async function getTipo (clipboardData) {
      if (clipboardData.items?.length) {
        for (const item of clipboardData.items) {
          if (item.type.startsWith('image/')) {
            const base64 = await getBase64(item.getAsFile())

            return {
              tipo: 'IMG',
              valor: `<img src="${base64}" width="600px" style="text-align:center; display:block;margin:0 auto;" align="center"/>`
            }
          }
        }
      }

      if (clipboardData.getData('text/html')) {
        return { tipo: 'HTML', valor: clipboardData.getData('text/html') }
      }

      if (clipboardData.getData('text/plain')) {
        return { tipo: 'PLAIN', valor: clipboardData.getData('text/plain') }
      }
    }
    emit('update:modelValue', localLabel)

    return {
      definitions,
      model,
      editorRef,
      col,
      rows,
      toolbar,
      rules,
      toogleToolbarEditor,
      add: () => {
        editorRef.value.caret.restore()
        editorRef.value.focus()
      },
      onPaste: async (evt) => {
        evt.preventDefault()

        if (pasteCount.value > 0) return

        pasteCount.value++
        const clipboardData = evt.clipboardData || window.clipboardData
        let pastedData = ''

        const { tipo, valor } = await getTipo(clipboardData)

        if (tipo === 'PLAIN') pastedData = clipboardData.getData('text/plain')

        if (tipo === 'IMG') pastedData = valor

        if (tipo === 'HTML') {
          const stringLimpio = DOMPurify.sanitize(valor, {
            USE_PROFILES: { html: true },
            ALLOW_ARIA_ATTR: false,
            FORBID_ATTR: ['dir', 'height', 'aria-level', 'aria-checked', 'role', 'align', 'style', 'class', 'br', 'width'],
            ALLOWED_ATTR: ['src'],
            FORBID_TAGS: ['div', 'span', 'pre', 'colgroup', 'col', 'iframe']
          })

          pastedData = sanitize.clean_node(obtenerHtml(stringLimpio))
          pastedData = htmlToString(pastedData)
        }

        editorRef.value.runCmd('insertHtml', pastedData)
        setTimeout(() => {
          pasteCount.value = 0
        }, 100)
      },
      removerElement,
      addElement,
      verificar: (value) => {
        model.value = value.replace('<div><br></div><div><br></div>', '')
      },
      cantidadPalabras,
      localLabel,
      valoresRules
    }
  }
}
</script>
<style scoped>
hr.salto {
  border: none;
  height: 2px;
}
hr.salto::before {
  content: "-.-.-.-.-.-.-.-. Salto de Página -.-.-.-.-.-.-.-.-.";
  display: block;
  color: #023859;
  text-align: center;
}
.custom-input {
  width: 100%;
  font-style: italic !important;
  font-weight: bolder !important;
}
.bold-text .q-field__native {
  font-weight: 800 !important;
}
</style>
