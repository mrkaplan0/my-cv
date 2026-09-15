<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ProfilePhoto from '@/components/ProfilePhoto.vue'

const router = useRouter()
const menuOpen = ref(false)
const menuRef = ref(null)
const toggleRef = ref(null)
const previousPage = ref(null)
const pages = [
  { name: 'home', label: 'Startseite' },
  { name: 'about', label: 'Über mich' },
  { name: 'technicalexpertise', label: 'Technische Expertise' },
  { name: 'projects', label: 'Projekte' },
  { name: 'contact', label: 'Kontakt' },
]
const previousLabel = computed(
  () => pages.find((page) => page.name === previousPage.value?.name)?.label ?? 'Zurück',
)

async function closeMenu(restoreFocus = false) {
  menuOpen.value = false
  if (restoreFocus) {
    await nextTick()
    toggleRef.value?.focus()
  }
}
async function toggleMenu() {
  if (menuOpen.value) return closeMenu(true)
  menuOpen.value = true
  await nextTick()
  menuRef.value?.querySelector('a')?.focus()
}
function onFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) closeMenu()
}
const removeNavigationHook = router.afterEach((to, from, failure) => {
  if (failure) return
  if (from.matched.length && to.path !== from.path) {
    previousPage.value = { name: from.name, path: from.fullPath }
  }
  closeMenu()
})
onBeforeUnmount(removeNavigationHook)
</script>

<template>
  <header class="app-header">
    <ProfilePhoto class="photo" />
    <div id="header-title"></div>
    <div class="header-actions" @keydown.esc.stop.prevent="closeMenu(true)" @focusout="onFocusOut">
      <RouterLink
        v-if="previousPage"
        :to="previousPage.path"
        class="back-link"
        :aria-label="`Zurück zu ${previousLabel}`"
      >
        <span aria-hidden="true">←</span><span class="back-label">{{ previousLabel }}</span>
      </RouterLink>
      <button
        ref="toggleRef"
        type="button"
        class="menu-toggle"
        :class="{ 'is-open': menuOpen }"
        :aria-expanded="menuOpen"
        aria-controls="header-navigation"
        :aria-label="menuOpen ? 'Menü schließen' : 'Menü öffnen'"
        @click="toggleMenu"
      >
        <span></span><span></span><span></span>
      </button>
      <Transition name="menu">
        <nav v-if="menuOpen" id="header-navigation" ref="menuRef" aria-label="Hauptnavigation">
          <p class="menu-heading">ENTDECKEN</p>
          <RouterLink
            v-for="(page, index) in pages"
            :key="page.name"
            :to="{ name: page.name }"
            @click="closeMenu(true)"
          >
            <span class="menu-number">0{{ index + 1 }}</span
            >{{ page.label }}<span class="menu-arrow" aria-hidden="true">↗</span>
          </RouterLink>
        </nav>
      </Transition>
    </div>
  </header>
  <div v-if="menuOpen" class="menu-backdrop" aria-hidden="true" @click="closeMenu(true)"></div>
</template>

<style scoped>
.app-header {
  position: absolute;
  inset: 0 0 auto;
  /* Keep navigation above the backdrop so links receive pointer events. */
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 5rem;
  padding: 0.75rem 1.25rem;
}
#header-title {
  width: 100%;
  padding-inline: 16rem;
  text-align: center;
  line-height: 1.2;
  letter-spacing: -0.035em;
}
.header-actions {
  position: absolute;
  right: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.back-link,
.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border: 1px solid rgb(var(--color-border-rgb) / 20%);
  border-radius: 10px;
  background: #0c2330;
  color: #d5e6eb;
}
.back-link {
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  font-size: 0.75rem;
}
.back-label {
  max-width: 9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.menu-toggle {
  width: 44px;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}
.menu-toggle span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--color-accent);
  transition:
    transform 0.25s,
    opacity 0.25s;
}
.menu-toggle.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.menu-toggle.is-open span:nth-child(2) {
  opacity: 0;
}
.menu-toggle.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}
nav {
  position: absolute;
  top: calc(100% + 1.25rem);
  right: 0;
  width: min(20rem, calc(100vw - 2.5rem));
  padding: 1rem;
  border: 1px solid rgb(var(--color-accent-rgb) / 25%);
  border-radius: 16px;
  background: #071c28;
  box-shadow: 0 20px 60px rgb(0 0 0 / 35%);
}
.menu-heading {
  padding: 0.5rem 0.75rem 0.75rem;
  color: #92aab6;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
}
nav a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 48px;
  padding: 0.75rem;
  border-radius: 8px;
  color: #d5e6eb;
  text-decoration: none;
  font-size: 0.85rem;
}
nav a:hover,
nav a.router-link-exact-active {
  color: var(--color-accent);
  background: rgb(var(--color-accent-rgb) / 10%);
}
.menu-number {
  font-family: monospace;
  opacity: 0.5;
  font-size: 0.65rem;
}
.menu-arrow {
  margin-left: auto;
}
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgb(0 8 14 / 35%);
}
.photo {
  display: none;
}
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (max-width: 1120px) {
  .photo {
    display: flex;
    position: absolute;
    inset: 0.75rem auto auto 1rem;
    width: 3.5rem;
    height: 3.5rem;
    margin: 0;
    transform: none;
  }
  .photo :deep(.profile-image) {
    width: 100%;
    height: 100%;
    transform: none;
  }
  #header-title {
    padding-left: 4rem;
    padding-right: 15rem;
  }
}
@media (max-width: 700px) {
  .back-label {
    display: none;
  }
  .back-link {
    width: 44px;
  }
  .header-actions {
    right: 0.75rem;
    gap: 0.4rem;
  }
  #header-title {
    padding-right: 6.5rem;
    overflow-wrap: anywhere;
  }
  #header-title :deep(.page-title) {
    font-size: clamp(0.8rem, 3.5vw, 1.2rem);
  }
  #header-title :deep(p) {
    font-size: 0.6rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .menu-toggle span,
  .menu-enter-active,
  .menu-leave-active {
    transition: none;
  }
}
</style>
