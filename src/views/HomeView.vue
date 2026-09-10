<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const showIntroduction = ref(false)
let timeoutId = null

onMounted(() => {
  timeoutId = setTimeout(() => {
    showIntroduction.value = true
  }, 4000)
})

onUnmounted(() => {
  clearTimeout(timeoutId)
})
</script>

<template>
  <div class="intro">
    <Transition name="fade-slide" mode="out-in">
      <div v-if="showIntroduction" key="introduction" class="text-content">
        <p class="name">Ömer Kaplan</p>
        <p class="author">Full-Stack Developer</p>
      </div>
      <div v-else key="quote" class="text-content">
        <p>Es ist nicht genug zu wissen, man muss auch anwenden.</p>
        <p class="author">Johann Wolfgang von Goethe</p>
        <span class="quotation-mark">"</span>
      </div>
    </Transition>
  </div>
  <Transition name="fade-slide">
    <RouterLink v-if="showIntroduction" to="/about" class="btn about-btn">
      Über mich &nbsp; →
    </RouterLink>
  </Transition>
</template>

<style scoped>
.intro {
  display: flex;
  align-items: flex-end;
}

.text-content {
  width: 100%;
  margin-top: 7rem;
  margin-right: 2rem;
  font-size: 4rem;
  text-align: left;
}

.quotation-mark,
.name {
  font-weight: bold;
}

.quotation-mark {
  font-size: 16rem;
}

.name {
  font-size: 6rem;
}

.author {
  margin-top: 1rem;
  margin-left: 0.5rem;
  font-size: 1.5rem;
  font-style: italic;
}

.about-btn {
  width: 12rem;
  height: 4rem;
  margin-top: 2rem;
  border-color: #f5f5f525;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 1120px) {
  .text-content {
    margin-top: 2rem;
    font-size: 2rem;
    text-align: center;
  }

  .quotation-mark {
    font-size: 9.5rem;
  }

  .name {
    font-size: 4rem;
    text-align: center;
  }

  .author {
    font-size: 1.25rem;
    text-align: center;
  }

  .about-btn {
    align-self: center;
  }
}
</style>
