<template>
    <q-dialog v-model="modal" persistent>
        <q-card style="width: 900px; max-width: 90vw;">
             <q-toolbar style="height: 70px;">
                <q-icon name="picture_as_pdf" size="md" color="negative" />
                <q-toolbar-title class="text-subtitle1 text-bold text-secondary">
                    {{verDocumento.nombre}}
                </q-toolbar-title>
                <q-btn round flat icon="close" color="negative" @click="close" />
            </q-toolbar>
            <q-card-section class="q-pa-none">
                <iframe
                    style="width:100%; height:70vh"
                    :src="documento.url"
                />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="cerrar" color="negative" @click="close" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script>
import { computed, inject, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'PreviewPdf',
  setup (props) {
    const store = useStore()
    const _http = inject('http')
    const verDocumento = computed(() => store.state.global.verDocumento)
    const modal = ref(false)
    const documento = ref({})

    onMounted(async () => {
      await getPdf()
    })

    const getPdf = async () => {
      // const respuesta = await Http.get(`red/documentos/${idDocumento.value}/ver-pdf`)
      try {
        if (verDocumento.value?.responseType === 'arraybuffer') {
          const result = await _http.getFile(verDocumento.value.url)
          setTimeout(async () => {
            documento.value.url = result
            modal.value = true
          }, 100)
        } else {
          const respuesta = await _http.get(verDocumento.value.url)
          setTimeout(async () => {
            documento.value.url = URL.createObjectURL(
              base64toBlob(respuesta, 'application/pdf'
              ))
            modal.value = true
          }, 200)
        }
      } catch (error) {
        close()
      }
    }

    const close = () => {
      modal.value = false
      setTimeout(() => {
        store.commit('global/setPreviewPdfDocumento', [false, {}])
      }, 200)
    }

    function base64toBlob (base64Data, contentType) {
      contentType = contentType || ''
      const sliceSize = 1024
      const byteCharacters = window.atob(base64Data)
      const bytesLength = byteCharacters.length
      const slicesCount = Math.ceil(bytesLength / sliceSize)
      const byteArrays = new Array(slicesCount)

      for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize
        const end = Math.min(begin + sliceSize, bytesLength)

        const bytes = new Array(end - begin)
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
          bytes[i] = byteCharacters[offset].charCodeAt(0)
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes)
      }
      return new Blob(byteArrays, { type: contentType })
    }

    return {
      modal,
      close,
      documento,
      verDocumento
    }
  }
}
</script>
