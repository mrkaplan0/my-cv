<template>
  <header>
    <h1 class="name">Ömer Kaplan</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
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
  align-items: center;
  margin-bottom: 1rem;
  padding-right: 1rem;
  z-index: 1000;
}

.name {
  font-size: 4rem;
  font-weight: bold;
  align-items: center;
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
</style>
