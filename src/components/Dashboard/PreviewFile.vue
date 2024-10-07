<template>
    <div class="row">
      <div class="col-xs-12 text-center">
        <iframe
          v-if="['pdf'].includes(extension)"
          style="width:100%; height:500px;"
          frameborder="0"
          :src="urlArchivo"
          :width="resizeWidth"
        ></iframe>

        <q-img
          v-if="['jpg','png','jpeg','gif'].includes(extension)"
          frameborder="0"
          :width="$q.platform.is.mobile ? '100%' : '70%'"
          :src="urlArchivo"
        ></q-img>

        <q-btn
          v-if="!['pdf', 'jpg','png','jpeg','gif'].includes(extension)"
          flat
          color="primary"
          @click="downloadFile"
          class="full-width"
        >
          <q-avatar
            size="lg"
            class="q-mr-md"
          >
            <img :src="`${avatar[extension]}`" />
          </q-avatar>
          PRESIONA PARA DESCARGAR
        </q-btn>
      </div>
    </div>
  </template>
<script>
const avatar = {
  pdf: 'pdf.svg',
  doc: 'doc.svg',
  docx: 'doc.svg',
  xls: 'excel.svg',
  xlsx: 'excel.svg',
  png: 'png.svg',
  jpeg: 'jpg.svg',
  jpg: 'jpg.svg'
}

export default {
  props: {
    extension: { type: String, default: '' },
    urlArchivo: { type: String, default: '' }
  },
  setup (props) {
    function downloadFile () {
      const a = document.createElement('a')
      a.href = props.urlArchivo
      a.setAttribute('download', props.nombreArchivo)
      a.click()
    }

    return {
      avatar,
      downloadFile
    }
  }
}
</script>
