<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '@/stores/apiStore'
import profilePhoto from '@/assets/images/Bild.jpg'

const apiStore = useApiStore()
const { personalInformation: person, isLoading, error } = storeToRefs(apiStore)
const fullName = computed(() =>
  [person.value?.first_name, person.value?.last_name].filter(Boolean).join(' '),
)
const location = computed(() =>
  [person.value?.address?.postal_code, person.value?.address?.city].filter(Boolean).join(' '),
)
const phoneHref = computed(() => {
  const phone = person.value?.phone?.replace(/[^\d+]/g, '') ?? ''
  return `tel:${person.value?.address?.country === 'Deutschland' && /^0[1-9]/.test(phone) ? `+49${phone.slice(1)}` : phone}`
})
onMounted(() => apiStore.fetchInfo())
</script>

<template>
  <Teleport to="#header-title" defer><h1 class="page-title">Kontakt</h1></Teleport>
  <section class="contact-page" :aria-busy="isLoading">
    <header class="contact-intro">
      <h2>Lassen Sie uns<br /><span>ins Gespräch kommen.</span></h2>
    </header>
    <p v-if="isLoading && !person" role="status">Kontaktdaten werden geladen…</p>
    <div v-if="error" class="state" role="alert">
      <p>Die Kontaktdaten konnten nicht geladen werden.</p>
      <button type="button" :disabled="isLoading" @click="apiStore.fetchInfo({ force: true })">
        Erneut versuchen
      </button>
    </div>
    <div v-if="person" class="contact-card">
      <div class="identity">
        <div class="portrait-frame">
          <img :src="profilePhoto" :alt="fullName" class="portrait" width="160" height="160" />
        </div>
        <div>
          <h3>{{ fullName }}</h3>
          <p class="job-title">{{ person.job_title }}</p>
        </div>
      </div>
      <div class="contact-details">
        <a v-if="person.email" class="contact-row" :href="`mailto:${person.email}`">
          <span class="contact-icon" aria-hidden="true">@</span
          ><span class="contact-value"
            ><span class="label">E-MAIL</span><span>{{ person.email }}</span></span
          ><span class="arrow" aria-hidden="true">↗</span>
        </a>
        <a v-if="person.phone" class="contact-row" :href="phoneHref">
          <span class="contact-icon" aria-hidden="true">↗</span
          ><span class="contact-value"
            ><span class="label">TELEFON</span><span>{{ person.phone }}</span></span
          ><span class="arrow" aria-hidden="true">↗</span>
        </a>
        <div v-if="location || person.address?.country" class="contact-row location-row">
          <span class="contact-icon" aria-hidden="true">⌖</span
          ><span class="contact-value"
            ><span class="label">STANDORT</span><span>{{ location }}</span
            ><span class="country">{{ person.address?.country }}</span></span
          >
        </div>
      </div>
      <a v-if="person.email" class="contact-cta" :href="`mailto:${person.email}`"
        >Nachricht schreiben <span aria-hidden="true">↗</span></a
      >
    </div>
    <p v-else-if="!isLoading && !error" class="state">Noch keine Kontaktdaten hinterlegt.</p>

    <div class="spacer" aria-hidden="true"></div>
    <RouterLink to="/" class="btn contact-btn"> Zur Startseite &nbsp; → </RouterLink>
    <div class="spacer" aria-hidden="true"></div>
  </section>
</template>

<style scoped>
.contact-page {
  width: 100%;
  min-width: 0;
  color: var(--color-text-on-dark);
}
.page-title {
  font-size: clamp(1rem, 2.3vw, 1.75rem);
}

.contact-intro {
  margin-bottom: 2.5rem;
}
.contact-intro h2 {
  margin-block: 1rem 1.5rem;
  font-size: clamp(2rem, 3.8vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1.13;
}
.contact-intro h2 span {
  color: var(--color-accent);
}
.contact-intro > p:last-child {
  max-width: 34rem;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.8;
}
.contact-card {
  padding: clamp(1.2rem, 3vw, 2.5rem);
  border: 1px solid var(--color-border-subtle);
  border-radius: 22px;
  background:
    radial-gradient(ellipse at top right, rgb(var(--color-accent-rgb) / 9%), transparent 60%),
    linear-gradient(140deg, #102b38, #06151f);
  box-shadow: 0 20px 60px rgb(0 0 0 / 14%);
  animation: appear 0.65s ease both;
}
.identity {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
}
.portrait-frame {
  flex: 0 0 auto;
  padding: 5px;
  border: 1px solid rgb(var(--color-accent-rgb) / 40%);
  border-radius: 50%;
}
.portrait {
  display: block;
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
}
.identity h3 {
  margin-top: 0.5rem;
  font-size: clamp(1.4rem, 2.8vw, 2.3rem);
  font-weight: 500;
  letter-spacing: -0.04em;
}
.job-title {
  max-width: 25rem;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-top: 0.35rem;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-block: 1.3rem;
  border-top: 1px solid var(--color-border-subtle);
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}
.contact-icon {
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  height: 40px;
  border-radius: 12px;
  background: rgb(var(--color-accent-rgb) / 7%);
  color: var(--color-accent);
  font: 1.3rem monospace;
}
.contact-value {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
  font-size: clamp(0.85rem, 1.5vw, 1rem);
  overflow-wrap: anywhere;
}
.label {
  color: var(--color-text-muted);
  font-size: 0.55rem;
  letter-spacing: 0.14em;
}
.country {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}
.arrow {
  margin-left: auto;
  color: var(--color-accent);
  transition: transform 0.2s;
}
a.contact-row:hover {
  color: var(--color-accent);
}
a.contact-row:hover .arrow {
  transform: translate(3px, -3px);
}
.contact-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  background: var(--color-accent);
  color: #08252a;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition:
    background 0.2s,
    transform 0.2s;
}
.contact-cta:hover {
  background: #a6f1e1;
  transform: translateY(-2px);
}
a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 5px;
}
.contact-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-block: 1.5rem 2rem;
  color: var(--color-text-muted);
  font-size: 0.6rem;
}
.state {
  margin-block: 1.5rem;
}
.state button {
  margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}
.spacer {
  height: 7vh;
}

.contact-btn {
  position: absolute;
  right: 5%;
}
@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 600px) {
  .identity {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .portrait {
    width: 88px;
    height: 88px;
  }
  .contact-row {
    gap: 0.65rem;
  }
  .contact-icon {
    flex-basis: 32px;
    height: 32px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .contact-card {
    animation: none;
  }
  .contact-row,
  .arrow,
  .contact-cta {
    transition: none;
  }
  .contact-cta:hover,
  a.contact-row:hover .arrow {
    transform: none;
  }
}
</style>
