<script setup></script>
<template>
  <div class="round">
    <img class="profile-image" src="@/assets/images/Bild.jpg" alt="Kaplan" />
  </div>
</template>

<style scoped>
.round {
  width: 60rem;
  height: 100vh;
  border-radius: 50%;
  background-color: #010a0f;
  margin-right: 2rem;
  left: 0;
  top: 0;
  position: absolute;
  transform: translateX(-50%);
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: right;
  transition: transform 1s ease-in-out;
}

.round:hover {
  transform: translateX(-30%);
}

.profile-image {
  width: 50rem;
  height: 50rem;
  object-fit: cover;
  border-radius: 50%;
  z-index: 1;
  transform: translateX(-8%);
}

@media (max-width: 1120px) {
  .round {
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    margin: 7rem auto;
    transform: translateX(0);
    background-color: #126b97;
  }
  .profile-image {
    width: 6rem;
    height: 6rem;
    margin: auto;
    transform: translateX(0);
  }

  .round:hover {
    transform: translateX(0);
    transition: none;
  }
}
</style>
