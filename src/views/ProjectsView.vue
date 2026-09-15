<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '@/stores/apiStore'
import { getPublicProjects, getProjectTechnologies, normalizeTechnology } from '@/services/github'

const apiStore = useApiStore()
const { technicalExpertise } = storeToRefs(apiStore)
const projects = ref([])
const loading = ref(true)
const error = ref('')
const selectedId = ref(null)
const hoveredId = ref(null)
const focusedId = ref(null)
const details = ref({})
const sliderRef = ref(null)
const canPrevious = ref(false)
const canNext = ref(false)
const controller = new AbortController()
const pending = new Set()
let resizeObserver
let drag = null
let suppressClick = false

function startDrag(event) {
  const slider = sliderRef.value
  if (event.pointerType !== 'mouse' || event.button !== 0 || !slider) return
  // Leave the native scrollbar and touch scrolling to the browser.
  if (event.clientY >= slider.getBoundingClientRect().top + slider.clientHeight) return
  suppressClick = false
  drag = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: slider.scrollLeft }
  window.addEventListener('pointermove', moveDrag)
  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)
  window.addEventListener('blur', endDrag)
}

function moveDrag(event) {
  const slider = sliderRef.value
  if (!drag || event.pointerId !== drag.pointerId || !slider) return
  if (event.buttons !== 1) return endDrag()
  const distance = event.clientX - drag.startX
  if (!suppressClick && Math.abs(distance) < 6) return
  if (!suppressClick) {
    suppressClick = true
    // Disable snapping synchronously before changing scrollLeft.
    slider.classList.add('is-dragging')
    slider.setPointerCapture(event.pointerId)
  }
  event.preventDefault()
  slider.scrollLeft = drag.scrollLeft - distance
}

function endDrag(event) {
  if (event?.pointerId !== undefined && event.pointerId !== drag?.pointerId) return
  const slider = sliderRef.value
  if (drag && slider?.hasPointerCapture(drag.pointerId)) {
    slider.releasePointerCapture(drag.pointerId)
  }
  drag = null
  slider?.classList.remove('is-dragging')
  window.removeEventListener('pointermove', moveDrag)
  window.removeEventListener('pointerup', endDrag)
  window.removeEventListener('pointercancel', endDrag)
  window.removeEventListener('blur', endDrag)
  updateNavigation()
}

function preventDragClick(event) {
  // Keyboard activation has detail === 0 and must remain available.
  if (!suppressClick || event.detail === 0) return
  event.preventDefault()
  event.stopPropagation()
  suppressClick = false
}

const skills = computed(() => [...new Set(Object.values(technicalExpertise.value ?? {}).flat())])
const activeId = computed(() => hoveredId.value ?? focusedId.value ?? selectedId.value)
const activeProject = computed(() =>
  projects.value.find((project) => project.id === activeId.value),
)
const activeTechnologies = computed(() => {
  const project = activeProject.value
  if (!project) return new Set()
  return new Set(
    (details.value[project.id]?.technologies ?? [project.language, ...(project.topics ?? [])])
      .filter(Boolean)
      .map(normalizeTechnology),
  )
})
const activeIndex = computed(() =>
  projects.value.findIndex((project) => project.id === activeId.value),
)

async function loadProjects() {
  loading.value = true
  error.value = ''
  try {
    projects.value = await getPublicProjects(controller.signal)
    await nextTick()
    updateNavigation()
  } catch (cause) {
    if (cause.name !== 'AbortError') error.value = cause.message
  } finally {
    loading.value = false
  }
}
async function loadDetails(project) {
  if (details.value[project.id] || pending.has(project.id)) return
  pending.add(project.id)
  details.value[project.id] = {
    loading: true,
    technologies: [project.language, ...(project.topics ?? [])].filter(Boolean),
  }
  try {
    details.value[project.id] = await getProjectTechnologies(project, controller.signal)
  } catch (cause) {
    if (cause.name !== 'AbortError')
      details.value[project.id] = {
        technologies: [project.language].filter(Boolean),
        partial: true,
      }
  } finally {
    pending.delete(project.id)
  }
}
function selectProject(project) {
  selectedId.value = selectedId.value === project.id ? null : project.id
  loadDetails(project)
}
function focusProject(event, project) {
  if (drag && suppressClick) return
  if (event.type === 'mouseenter') hoveredId.value = project.id
  else focusedId.value = project.id
  loadDetails(project)
}
function blurProject(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) focusedId.value = null
}
function updateNavigation() {
  const element = sliderRef.value
  if (!element) return
  canPrevious.value = element.scrollLeft > 2
  canNext.value = element.scrollLeft + element.clientWidth < element.scrollWidth - 2
}
function slide(direction) {
  const slider = sliderRef.value
  if (!slider) return
  const card = slider.querySelector('.project-card')
  const distance = (card?.getBoundingClientRect().width ?? slider.clientWidth) + 20
  slider.scrollBy({
    left: direction * distance,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
function description(project) {
  return project.description || `${project.fork ? 'Öffentlicher Fork' : 'Öffentliches Repository'}`
}
onMounted(() => {
  apiStore.fetchInfo()
  loadProjects()
  resizeObserver = new ResizeObserver(updateNavigation)
  if (sliderRef.value) resizeObserver.observe(sliderRef.value)
})
onBeforeUnmount(() => {
  endDrag()
  controller.abort()
  resizeObserver?.disconnect()
})
</script>

<template>
  <Teleport to="#header-title" defer>
    <h2>Ideen werden <span>Projekte.</span></h2>
  </Teleport>
  <div class="projects-page">
    <header class="projects-intro">
      <a href="https://github.com/mrkaplan0" target="_blank" rel="noopener noreferrer"
        >github.com/mrkaplan0 <span aria-hidden="true">↗</span></a
      >
    </header>

    <section class="technology-panel" aria-labelledby="technology-heading">
      <div class="section-top">
        <h2 id="technology-heading">Mein Stack</h2>
        <span>{{ activeProject ? activeProject.name : 'Projekt entdecken' }}</span>
      </div>
      <p class="hint">
        Karte berühren oder auswählen, um die verwendeten Technologien hervorzuheben.
      </p>
      <div class="technology-tags">
        <span
          v-for="skill in skills"
          :key="skill"
          class="technology-tag"
          :class="{ 'is-active': activeTechnologies.has(normalizeTechnology(skill)) }"
        >
          <span class="tag-dot" aria-hidden="true"></span>{{ skill
          }}<span v-if="activeTechnologies.has(normalizeTechnology(skill))" class="sr-only">
            — im ausgewählten Projekt verwendet</span
          >
        </span>
      </div>
      <p v-if="apiStore.error" class="hint" role="status">
        Der persönliche Stack konnte nicht geladen werden.
      </p>
      <p class="technology-status" aria-live="polite">
        <template v-if="activeProject && details[activeProject.id]?.loading"
          >Technologien werden ermittelt…</template
        >
        <template v-else-if="activeProject && details[activeProject.id]?.partial"
          >Ein Teil der Technologiedaten ist momentan nicht verfügbar.</template
        >
        <template v-else-if="activeProject"
          >Hervorgehoben: erkannte Technologien aus meinem Stack.</template
        >
        <template v-else>Hover · Tastaturfokus · Antippen</template>
      </p>
    </section>

    <div class="section-top carousel-heading">
      <h2>
        Public Repositories <span class="count">{{ projects.length }}</span>
      </h2>
      <div class="slider-controls">
        <button
          type="button"
          aria-label="Vorheriges Projekt"
          :disabled="!canPrevious"
          @click="slide(-1)"
        >
          ←</button
        ><button type="button" aria-label="Nächstes Projekt" :disabled="!canNext" @click="slide(1)">
          →
        </button>
      </div>
    </div>
    <p v-if="loading" role="status" class="state">Projekte werden geladen…</p>
    <div v-else-if="error" role="alert" class="state">
      <p>{{ error }}</p>
      <button type="button" @click="loadProjects">Erneut versuchen</button>
    </div>
    <p v-else-if="!projects.length" class="state">Noch keine öffentlichen Repositories.</p>
    <div
      ref="sliderRef"
      class="project-slider"
      role="region"
      aria-roledescription="Karussell"
      aria-label="GitHub-Projekte"
      @pointerdown="startDrag"
      @lostpointercapture="endDrag"
      @click.capture="preventDragClick"
      @dragstart.prevent
      @scroll.passive="updateNavigation"
      @keydown.left.prevent="slide(-1)"
      @keydown.right.prevent="slide(1)"
    >
      <article
        v-for="(project, index) in projects"
        :key="project.id"
        class="project-card"
        :class="{ 'is-active': activeId === project.id }"
        @mouseenter="focusProject($event, project)"
        @mouseleave="hoveredId = null"
        @focusin="focusProject($event, project)"
        @focusout="blurProject"
      >
        <button
          type="button"
          class="project-select"
          :aria-expanded="activeId === project.id"
          :aria-controls="`project-description-${project.id}`"
          @click="selectProject(project)"
        >
          <span class="project-top"
            ><span>{{ project.fork ? 'FORK' : 'PUBLIC REPOSITORY' }}</span
            ><span>{{ String(index + 1).padStart(2, '0') }}</span></span
          >
          <span class="project-art" aria-hidden="true"
            ><span class="art-ring"></span
            ><span class="code-symbol">{{ ['{ }', '&lt;/&gt;', '[ ]'][index % 3] }}</span></span
          >
          <span class="project-name">{{ project.name }}</span>
          <span class="project-meta"
            ><span class="language">{{ project.language || 'Repository' }}</span
            ><span>☆ {{ project.stargazers_count }}</span></span
          >
        </button>
        <div
          :id="`project-description-${project.id}`"
          class="project-description"
          :aria-hidden="activeId !== project.id"
        >
          <div>
            <p>{{ description(project) }}</p>
          </div>
        </div>
        <a
          class="github-link"
          :href="project.html_url"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${project.name} auf GitHub öffnen`"
          >Quellcode ansehen <span aria-hidden="true">↗</span></a
        >
      </article>
    </div>
    <footer class="slider-footer">
      <span
        >{{ activeIndex >= 0 ? `${String(activeIndex + 1).padStart(2, '0')} / ` : ''
        }}{{ projects.length }} Projekte</span
      >
    </footer>
    <div class="spacer" aria-hidden="true"></div>
    <RouterLink to="/contact" class="btn project-btn"> Kontakt &nbsp; → </RouterLink>
    <div class="spacer" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.projects-page {
  min-width: 0;
  width: 100%;
  color: var(--color-text-on-dark);
}
.page-title {
  font-size: clamp(1rem, 2.3vw, 1.75rem);
}
.eyebrow {
  color: var(--color-accent);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
}

.projects-intro > p:not(.eyebrow) {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.projects-intro > a {
  display: inline-block;
  margin-top: 1rem;
  color: var(--color-accent);
  font-size: 0.75rem;
  text-decoration: none;
}
.technology-panel {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  background: rgb(5 24 34 / 60%);
}
.section-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.section-top h2 {
  font-size: 1.1rem;
  font-weight: 500;
}
.section-top > span {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--color-accent);
  overflow-wrap: anywhere;
}
.hint {
  margin-top: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.7rem;
}
.technology-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.25rem;
}
.technology-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--color-border-subtle);
  background: rgb(201 230 238 / 3%);
  border-radius: 6px;
  color: #9aaeb8;
  font-size: 0.7rem;
  transition:
    background 0.25s,
    color 0.25s,
    border-color 0.25s,
    box-shadow 0.25s;
}
.tag-dot {
  width: 4px;
  height: 4px;
  flex-shrink: 0;
  background: currentColor;
  border-radius: 50%;
}
.technology-tag.is-active {
  color: var(--color-accent);
  background: rgb(var(--color-accent-rgb) / 12%);
  border-color: rgb(var(--color-accent-rgb) / 65%);
  box-shadow: 0 0 16px rgb(var(--color-accent-rgb) / 8%);
}
.technology-status {
  min-height: 2.5em;
  margin-top: 1rem;
  font-size: 0.65rem;
  color: var(--color-text-muted);
}
.carousel-heading {
  margin: 2.5rem 0 1rem;
}
.count {
  margin-left: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}
.slider-controls {
  display: flex;
  gap: 0.5rem;
}
.slider-controls button,
.state button {
  border: 1px solid var(--color-border-subtle);
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  background: #0c2330;
  color: var(--color-accent);
  cursor: pointer;
}
.slider-controls button:disabled {
  opacity: 0.3;
  cursor: default;
}
.project-slider {
  cursor: grab;
  user-select: none;
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: #315864 transparent;
  padding: 6px 2px 16px;
  align-items: flex-start;
}
.project-slider.is-dragging {
  scroll-snap-type: none;
  scroll-behavior: auto;
}
.project-slider.is-dragging,
.project-slider.is-dragging * {
  cursor: grabbing;
}
.project-card {
  flex: 0 0 76%;
  min-width: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: 18px;
  background: linear-gradient(145deg, #102d3a, #06151f);
  overflow: hidden;
  scroll-snap-align: start;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}
.project-card.is-active {
  border-color: rgb(var(--color-accent-rgb) / 60%);
  box-shadow: 0 8px 30px rgb(0 0 0 / 18%);
}
.project-select {
  display: block;
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  border: 0;
  color: inherit;
  background: none;
  cursor: grab;
  font: inherit;
}
.project-top,
.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.65rem;
}
.project-top {
  letter-spacing: 0.1em;
}
.project-art {
  position: relative;
  display: grid;
  place-items: center;
  height: 155px;
  overflow: hidden;
}
.art-ring {
  position: absolute;
  width: 130px;
  height: 130px;
  border: 1px solid rgb(var(--color-accent-rgb) / 20%);
  border-radius: 50%;
  transform: rotate(-30deg) scaleX(1.6);
  transition: transform 0.8s;
}
.art-ring::after {
  content: '';
  position: absolute;
  inset: 15px;
  border: 1px dashed rgb(var(--color-accent-rgb) / 15%);
  border-radius: inherit;
}
.code-symbol {
  font: 2.8rem monospace;
  color: var(--color-accent);
  text-shadow: 0 0 30px rgb(var(--color-accent-rgb) / 30%);
}
.is-active .art-ring {
  transform: rotate(30deg) scaleX(1.6);
}
.project-name {
  display: block;
  margin: 0.5rem 0 1rem;
  font-size: clamp(1.1rem, 2vw, 1.65rem);
  font-weight: 500;
  overflow-wrap: anywhere;
  letter-spacing: -0.035em;
}
.language {
  color: var(--color-accent);
}
.project-description {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.35s,
    opacity 0.35s;
}
.project-description > div {
  overflow: hidden;
  min-height: 0;
}
.project-description p {
  padding: 0 1.5rem 1.25rem;
  color: #bed0d8;
  font-size: 0.8rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.is-active .project-description {
  grid-template-rows: 1fr;
  opacity: 1;
}
.github-link {
  display: flex;
  justify-content: space-between;
  margin-inline: 1.5rem;
  padding-block: 1rem;
  border-top: 1px solid var(--color-border-subtle);
  text-decoration: none;
  color: var(--color-accent);
  font-size: 0.75rem;
}
.slider-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.65rem;
}
.state {
  padding-block: 1rem;
  color: var(--color-text-muted);
}
.state button {
  margin-top: 0.75rem;
}
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -3px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.spacer {
  height: 7vh;
}

.project-btn {
  position: absolute;
  right: 5%;
}
@media (min-width: 1500px) {
  .project-card {
    flex-basis: 46%;
  }
}
@media (max-width: 600px) {
  .technology-panel {
    padding: 1rem;
  }
  .project-card {
    flex-basis: 94%;
  }
  .project-select {
    padding: 1rem;
  }
  .project-art {
    height: 120px;
  }
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::after {
    transition: none !important;
  }
}
</style>
