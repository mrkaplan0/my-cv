<script setup>
defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
  active: { type: Boolean, default: false },
})
</script>

<template>
  <article class="timeline-item" :class="{ 'is-reversed': index % 2 === 1, 'is-active': active }">
    <div class="container" :class="{ initial: index === 0 }" aria-hidden="true">
      <slot name="marker">
        <div class="marker"></div>
      </slot>
    </div>
    <section class="timeline-text">
      <p class="period">{{ item.period }}</p>
      <h2>{{ item.title }}</h2>
      <p v-if="item.subtitle">{{ item.subtitle }}</p>
      <p v-if="item.description">{{ item.description }}</p>
    </section>
  </article>
</template>

<style scoped>
.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 55vh;
  padding-block: 3rem;
}

.container {
  position: absolute;
  top: 50%;
  left: 15%;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 2px dashed #f5f5f525;
  border-radius: 10px;
  transform: translate(-50%, -50%);
}

.marker {
  width: 40px;
  height: 40px;
}

.timeline-text {
  width: 65%;
  margin-left: auto;
  padding: 1rem;
  border-left: 2px solid transparent;
  overflow-wrap: anywhere;
  transition: border-color 0.3s;
}

.is-active .timeline-text {
  border-color: currentColor;
}

.timeline-text h2 {
  margin-block: 0.5rem 0.75rem;
  font-size: clamp(1.25rem, 2vw, 2rem);
}

.timeline-text p + p {
  margin-top: 0.75rem;
}

.period {
  opacity: 0.75;
}

.is-reversed .container {
  left: 85%;
}

.is-reversed .timeline-text {
  margin-left: 0;
  margin-right: auto;
}

@media (max-width: 600px) {
  .container,
  .is-reversed .container {
    left: 20px;
  }

  .timeline-text,
  .is-reversed .timeline-text {
    width: calc(100% - 60px);
    margin-left: auto;
    margin-right: 0;
    padding-inline: 0.5rem;
  }
}
</style>
