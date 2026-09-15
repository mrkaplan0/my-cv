<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '@/stores/apiStore'

const apiStore = useApiStore()
const { technicalExpertise, certifications, isLoading, error } = storeToRefs(apiStore)
const pageRef = ref(null)
let observer = null

const categoryLabels = {
  programming_languages: ['Programmiersprachen', '</>'],
  frontend_and_mobile: ['Frontend & Mobile', '◇'],
  backend_and_frameworks: ['Backend & Frameworks', '{ }'],
  databases_and_services: ['Datenbanken & Services', '≋'],
  tools_and_platforms: ['Tools & Plattformen', '⌘'],
  development_methodologies: ['Methoden & Zusammenarbeit', '↗'],
}
const categories = computed(() =>
  Object.entries(technicalExpertise.value ?? {}).map(([key, skills]) => ({
    key,
    title: categoryLabels[key]?.[0] ?? key.replaceAll('_', ' '),
    icon: categoryLabels[key]?.[1] ?? '+',
    skills,
  })),
)
const skillCount = computed(() =>
  categories.value.reduce((total, category) => total + category.skills.length, 0),
)
const sortedCertifications = computed(() =>
  [...certifications.value].sort((a, b) => b.year - a.year),
)

function observeSections() {
  observer?.disconnect()
  if (!pageRef.value) return
  const elements = pageRef.value.querySelectorAll('[data-reveal]')
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  )
    return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.remove('reveal-pending')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.08 },
  )
  elements.forEach((element) => {
    element.classList.add('reveal-pending')
    observer.observe(element)
  })
}
watch([categories, certifications], observeSections, { flush: 'post' })
onMounted(() => {
  observeSections()
  apiStore.fetchInfo()
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <Teleport to="#header-title" defer>
    <h1 class="page-title">Immer weiter lernen.</h1>
  </Teleport>

  <div ref="pageRef" class="technics-page" :aria-busy="isLoading">
    <header class="expertise-intro">
      <dl v-if="categories.length" class="stats">
        <div>
          <dt>Kompetenzen</dt>
          <dd>{{ skillCount }}</dd>
        </div>
        <div>
          <dt>Bereiche</dt>
          <dd>{{ categories.length }}</dd>
        </div>
        <div>
          <dt>Zertifikate</dt>
          <dd>{{ certifications.length }}</dd>
        </div>
      </dl>
      <div class="intro-decoration" aria-hidden="true"><span></span><span></span><span></span></div>
    </header>

    <p v-if="isLoading && !categories.length" class="state-message" role="status">
      Kompetenzen werden geladen…
    </p>
    <div v-if="error" class="state-message" role="alert">
      <p>Die Informationen konnten nicht geladen werden.</p>
      <button type="button" :disabled="isLoading" @click="apiStore.fetchInfo({ force: true })">
        Erneut versuchen
      </button>
    </div>

    <section v-if="categories.length" aria-labelledby="skills-heading" class="skills-section">
      <div class="section-heading">
        <h2 id="skills-heading">Technische Expertise</h2>
        <span>01 / KOMPETENZEN</span>
      </div>
      <div class="skill-grid">
        <article
          v-for="(category, index) in categories"
          :key="category.key"
          class="skill-card"
          data-reveal
          :style="{ '--delay': `${(index % 2) * 90}ms` }"
        >
          <div class="card-top">
            <span class="category-icon" aria-hidden="true">{{ category.icon }}</span
            ><span class="category-number">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <h3>{{ category.title }}</h3>
          <ul class="skill-tags">
            <li v-for="skill in category.skills" :key="skill">{{ skill }}</li>
          </ul>
          <div class="card-footer">
            {{ category.skills.length }} Kompetenzen<span aria-hidden="true">↗</span>
          </div>
        </article>
      </div>
    </section>

    <section
      v-if="sortedCertifications.length"
      aria-labelledby="certifications-heading"
      class="certifications-section"
    >
      <div class="section-heading">
        <h2 id="certifications-heading">Immer weiter lernen.</h2>
        <span>02 / ZERTIFIKATE</span>
      </div>
      <ol class="certification-list">
        <li
          v-for="certificate in sortedCertifications"
          :key="`${certificate.name}-${certificate.year}`"
          class="certificate"
          data-reveal
        >
          <span class="certificate-year">{{ certificate.year }}</span>
          <div>
            <h3>{{ certificate.name }}</h3>
            <p>{{ certificate.issuer }}</p>
          </div>
          <span class="certificate-symbol" aria-hidden="true">✧</span>
        </li>
      </ol>
    </section>
    <p
      v-if="!isLoading && !error && !categories.length && !certifications.length"
      class="state-message"
    >
      Noch keine Kompetenzen hinterlegt.
    </p>

    <div class="spacer" aria-hidden="true"></div>
    <RouterLink to="/projects" class="btn project-btn"> Projekte &nbsp; → </RouterLink>
    <div class="spacer" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.technics-page {
  width: 100%;
  min-width: 0;
  color: var(--color-text-on-dark);
}
.page-title {
  font-size: clamp(1rem, 2.3vw, 1.75rem);
}
.expertise-intro {
  position: relative;
  isolation: isolate;
  padding-block: 1rem 3rem;
  overflow: hidden;
}

.expertise-intro h2 {
  margin-block: 1.5rem;
  font-size: clamp(2.25rem, 4.5vw, 5rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.055em;
}
.expertise-intro h2 span {
  color: var(--color-accent);
}
.intro-description {
  max-width: 32rem;
  color: var(--color-text-muted);
  line-height: 1.8;
  font-size: 0.95rem;
}
.stats {
  display: flex;
  gap: clamp(1rem, 4vw, 3rem);
}
.stats > div {
  display: flex;
  flex-direction: column-reverse;
}
.stats dt {
  color: var(--color-text-muted);
  font-size: 0.7rem;
}
.stats dd {
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.06em;
}
.intro-decoration {
  position: absolute;
  z-index: -1;
  right: -7rem;
  top: 1rem;
  width: 22rem;
  height: 22rem;
  opacity: 0.22;
  pointer-events: none;
}
.intro-decoration span {
  position: absolute;
  inset: 0;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
  transform: rotate(-25deg) scaleX(0.55);
}
.intro-decoration span:nth-child(2) {
  transform: rotate(35deg) scaleX(0.55);
}
.intro-decoration span:nth-child(3) {
  transform: rotate(95deg) scaleX(0.55);
}
.section-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.section-heading h2 {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  font-weight: 500;
  letter-spacing: -0.03em;
}
.section-heading > span {
  color: var(--color-text-muted);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
}
.skill-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.skill-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(1rem, 2vw, 1.75rem);
  background: linear-gradient(140deg, rgb(15 40 51 / 94%), rgb(4 21 31 / 86%));
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  box-shadow: 0 8px 28px rgb(0 0 0 / 8%);
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.category-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgb(var(--color-accent-rgb) / 20%);
  border-radius: 10px;
  color: var(--color-accent);
  background: rgb(var(--color-accent-rgb) / 5%);
  font-family: monospace;
  font-size: 1.15rem;
}
.category-number {
  color: #809ca9;
  font-family: monospace;
  font-size: 0.75rem;
}
.skill-card h3 {
  margin-bottom: 1rem;
  font-size: 1.05rem;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  align-content: start;
  gap: 0.5rem;
  margin: 0 0 1.75rem;
  padding: 0;
  list-style: none;
}
.skill-tags li {
  padding: 0.3rem 0.65rem;
  background: rgb(201 230 238 / 5%);
  border: 1px solid rgb(201 230 238 / 10%);
  border-radius: 6px;
  color: #d0e0e7;
  font-size: 0.75rem;
  overflow-wrap: anywhere;
  max-width: 100%;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.9rem;
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted);
  font-size: 0.65rem;
}
.card-footer span {
  color: var(--color-accent);
  font-size: 1rem;
}
.certifications-section {
  margin-top: 3.5rem;
}
.certification-list {
  padding: 0;
  list-style: none;
}
.certificate {
  display: grid;
  grid-template-columns: 3rem 1fr auto;
  align-items: center;
  gap: 1rem;
  padding-block: 1.25rem;
  border-bottom: 1px solid var(--color-border-subtle);
}
.certificate-year {
  align-self: start;
  padding-top: 0.15rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--color-accent);
}
.certificate h3 {
  font-weight: 500;
  font-size: 0.95rem;
  overflow-wrap: anywhere;
}
.certificate p {
  margin-top: 0.25rem;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}
.certificate-symbol {
  color: var(--color-accent);
  font-size: 1.5rem;
}

.state-message {
  margin-block: 2rem;
  color: var(--color-text-muted);
}
.state-message button {
  margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--color-accent);
  border-radius: 6px;
  background: transparent;
  color: var(--color-accent);
  cursor: pointer;
}
.state-message button:focus-visible {
  outline: 2px solid white;
  outline-offset: 4px;
}
[data-reveal] {
  transition:
    opacity 0.65s ease var(--delay, 0ms),
    transform 0.65s cubic-bezier(0.2, 0.7, 0.2, 1) var(--delay, 0ms),
    border-color 0.25s;
}
.reveal-pending {
  opacity: 0;
  transform: translateY(24px);
}
.spacer {
  height: 7vh;
}

.project-btn {
  position: absolute;
  right: 5%;
}

@media (hover: hover) {
  .skill-card:hover {
    border-color: rgb(var(--color-accent-rgb) / 55%);
    transform: translateY(-4px);
  }
}
@media (max-width: 640px) {
  .skill-grid {
    grid-template-columns: 1fr;
  }
  .expertise-intro h2 {
    font-size: clamp(2rem, 9vw, 3rem);
  }
  .intro-decoration {
    right: -13rem;
  }
  .certificate {
    grid-template-columns: 2.5rem 1fr;
    gap: 0.65rem;
  }
  .certificate-symbol {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    transition: none;
  }
  .reveal-pending {
    opacity: 1;
    transform: none;
  }
  .skill-card:hover {
    transform: none;
  }
}
</style>
