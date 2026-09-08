<script setup>
import { RouterView } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import WAVES from 'vanta/src/vanta.waves.js'
import AppHeader from './components/AppHeader.vue'

const vantaRef = ref(null)
let vantaInstance = null
let resizeObserver = null

onMounted(() => {
  if (vantaRef.value) {
    vantaInstance = WAVES({
      el: vantaRef.value,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      color: 0x10913,
      waveSpeed: 0.3,
    })
    resizeObserver = new ResizeObserver(() => vantaInstance?.resize())
    resizeObserver.observe(vantaRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  vantaInstance?.destroy()
})
</script>

<template>
  <div ref="vantaRef" class="vanta-container">
    <div class="page-content">
      <AppHeader />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.vanta-container {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #03121b;
  color: #fff;
}

.page-content {
  position: relative;
  z-index: 1;
}
</style>
