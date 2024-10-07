<template>
  <section>
    <q-chip
      square
      :color="color"
      text-color="white"
      :label="estadoLabel"
    />
  </section>
</template>
<script>
import { computed } from 'vue'

const coloresEstado = {
  ACTIVO: 'positve',
  INACTIVO: 'negative',
  CREADO: 'grey-8',
  PENDIENTE_FIRMA: 'warning',
  DERIVADO: 'warning',
  PROCESADO: 'positive',
  ENVIADO: 'positive',
  OBSERVADO: 'negative',
  EN_PROCESO: 'warning',
  FIRMADO: 'positive',
  PENDIENTE: 'warning'
}

const etiquetasEstado = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  CREADO: 'EN PROCESO',
  PENDIENTE_FIRMA: 'PENDIENTE DE FIRMA',
  DERIVADO: 'EN PROCESO',
  PROCESADO: 'PROCESADO',
  ENVIADO: 'ENVIADO',
  OBSERVADO: 'OBSERVADO',
  EN_PROCESO: 'EN PROCESO',
  FIRMADO: 'PROCESADO',
  PENDIENTE: 'PENDIENTE'
}

export default {
  props: {
    estado: {
      type: String,
      default: () => 'ACTIVO'
    }
  },
  setup (props) {
    const color = computed(() => coloresEstado[props.estado] || 'grey')
    const estadoLabel = computed(() => etiquetasEstado[props.estado] || 'Desconocido')
    return {
      color,
      estadoLabel
    }
  }
}
</script>
