<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const showIntroduction = ref(false)
let timeoutId = null

onMounted(() => {
  timeoutId = setTimeout(() => {
    showIntroduction.value = true
  }, 3000)
})

onUnmounted(() => {
  clearTimeout(timeoutId)
})
</script>

<template>
  <div class="intro">
    <Transition name="fade-slide" mode="out-in">
      <div v-if="showIntroduction" key="introduction" class="text-content">
        <header class="contact-intro text-content">
          <h2>
            Ömer Kaplan <br />
            <span>Full-Stack Developer</span>
          </h2>
          <RouterLink v-if="showIntroduction" to="/about" class="btn about-btn">
            Über mich &nbsp; →
          </RouterLink>
        </header>
      </div>
      <div v-else key="quote">
        <header class="contact-intro text-content">
          <h2>Es ist nicht genug zu wissen, man muss auch<span> anwenden.</span></h2>
          <p class="author">Johann Wolfgang von Goethe</p>
          <span class="quotation-mark">"</span>
        </header>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.intro {
  display: flex;
}

.text-content {
  width: 100%;
  margin-top: 4rem;
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
.contact-intro h2 {
  margin-block: 1rem 1.5rem;
  font-size: clamp(2rem, 3.8vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1.13;
}
.contact-intro h2 span {
  color: var(--color-accent);
}
.contact-intro > p:last-child {
  max-width: 34rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.8;
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
