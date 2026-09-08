<script lang="js"></script>
<template>
  <div class="home-view">
    <div class="round">
      <img class="profile-image" src="@/assets/images/Bild.jpg" alt="Kaplan" />
    </div>
    <div class="info-container">
      <div class="blank"></div>
      <div class="info-content">
        <h1>Welcome to the Home View</h1>
        <p>This is the content for the home page.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  min-height: 100vh;
}
.home-view .round {
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
}

.profile-image {
  width: 20rem;
  height: 20rem;
  object-fit: cover;
  border-radius: 50%;
  z-index: 1;
  transform: translateX(-25%);
}

.info-container {
  margin-top: 6rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 2rem;
  background-color: #f5f5f525;
  min-width: 60%;
  width: 100%;
  height: 100vh;
}
.info-container .blank {
  width: 50rem;
  height: 10rem;
}
.info-container .info-content {
  padding: 2rem;

  min-width: 60%;
  width: 100%;
  height: 100vh;
}
</style>
