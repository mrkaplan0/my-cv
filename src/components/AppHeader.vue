<script setup>
import ProfilePhoto from '@/components/ProfilePhoto.vue'
</script>

<template>
  <header>
    <ProfilePhoto class="photo" />
  </header>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: end;
  margin-bottom: 1rem;
  padding-right: 1rem;
  z-index: 1000;
}

.name {
  font-size: 4rem;
  font-weight: bold;
  align-items: end;
  margin: auto;
}

nav {
  gap: 1rem;
  display: flex;
}
nav a {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem;
}
nav a:hover {
  text-decoration: none;
  background-color: #02619c;
  padding: 0.5rem;
}
nav a.router-link-exact-active {
  text-decoration: underline;
}

.photo {
  display: none;
}

@media (max-width: 1120px) {
  header {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .name {
    display: none;
  }
  nav {
    gap: 0.5rem;
  }
  .photo {
    width: 6rem;
    height: 6rem;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    margin: 1rem;
  }
}
</style>
