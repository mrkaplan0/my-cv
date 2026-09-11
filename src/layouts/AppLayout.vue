<script setup>
import ProfilePhoto from '@/components/ProfilePhoto.vue'
</script>

<template>
  <div class="app-layout">
    <ProfilePhoto class="photo" />
    <div class="info-container">
      <div class="info-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 90vh;
}

.info-container {
  display: flex;
  width: 100%;
  min-height: 80vh;
  margin-block: 6rem;
  padding: 2rem;
  background-color: #f5f5f525;
}

.info-container::before {
  content: '';
  flex: 0 1 50rem;
}

.info-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 60%;
  min-height: 50vh;
  padding: 2rem;
}

@media (max-width: 1120px) {
  .info-container {
    padding: 1rem;
  }

  .info-container::before,
  .photo {
    display: none;
  }
}
</style>
