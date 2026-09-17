<script setup></script>
<template>
  <div class="round">
    <img class="profile-image" src="@/assets/images/Bild.jpg" alt="Kaplan" />
  </div>
</template>

<style scoped>
.round {
  width: min(60rem, 100svh);
  aspect-ratio: 1;
  flex-shrink: 0;
  border: clamp(1rem, 3vw, 3rem) solid #000;
  border-radius: 50%;
  background-color: #000;
  overflow: hidden;
  left: 0;
  top: 0;
  position: absolute;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 1s ease-in-out;
}

.round:hover {
  transform: translateX(-30%);
}

.profile-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
}

@media (max-width: 1120px) {
  .round {
    width: 6rem;
    border-width: 6px;
    margin: 7rem auto;
    transform: translateX(0);
  }

  .round:hover {
    transform: translateX(0);
    transition: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .round {
    transition: none;
  }
}
</style>
