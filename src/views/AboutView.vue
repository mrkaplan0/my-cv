<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useApiStore } from '@/stores/apiStore'
import TimelineItem from '@/components/TimelineItem.vue'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

const apiStore = useApiStore()
const { workExperience, education, isLoading, error } = storeToRefs(apiStore)
const aboutRef = ref(null)
const boxPosition = ref({ x: 0, y: 0 })
const activeSegment = ref(0)
let isMounted = false
/** @type {gsap.Context | null} */
let ctx = null

const dateFormatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' })
function formatDate(value) {
  if (!value) return 'Heute'
  const [year, month = 1] = String(value).split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, 1))
}

const timelineItems = computed(() => [
  ...workExperience.value.map((experience) => ({
    id: `work-${experience.start_date}-${experience.position}`,
    period: `${formatDate(experience.start_date)} – ${formatDate(experience.end_date)}`,
    title: experience.position,
    subtitle: [experience.company, experience.location].filter(Boolean).join(', '),
    description: experience.description,
  })),
  ...education.value.map((entry) => ({
    id: `education-${entry.start_year}-${entry.institution}`,
    period: `${entry.start_year} – ${entry.end_year ?? 'Heute'}`,
    title: [entry.degree, entry.field_of_study].filter(Boolean).join(' – '),
    subtitle: [entry.institution, entry.location].filter(Boolean).join(', '),
  })),
])

function createTimeline() {
  ctx?.revert()
  ctx = null
  boxPosition.value = { x: 0, y: 0 }
  activeSegment.value = 0
  if (!isMounted || !aboutRef.value) return

  ctx = gsap.context(() => {
    const box = aboutRef.value.querySelector('.box')
    const containers = gsap.utils.toArray('.container', aboutRef.value)
    if (!box || containers.length < 2) return

    const start = box.getBoundingClientRect()
    const points = containers.slice(1).map((container) => {
      const rect = container.getBoundingClientRect()
      return {
        x: rect.left + rect.width / 2 - (start.left + start.width / 2),
        y: rect.top + rect.height / 2 - (start.top + start.height / 2),
      }
    })
    const checkpoints = [{ x: 0, y: 0 }, ...points]

    gsap.to(box, {
      ease: 'none',
      motionPath: { path: points, curviness: 1 },
      scrollTrigger: {
        trigger: containers[0],
        start: 'clamp(center center)',
        endTrigger: containers.at(-1),
        end: 'clamp(center center)',
        scrub: 1,
      },
      onUpdate() {
        const x = Number(gsap.getProperty(box, 'x'))
        const y = Number(gsap.getProperty(box, 'y'))
        boxPosition.value = { x, y }
        const nextIndex = checkpoints.findIndex((point) => point.y > y)
        activeSegment.value = nextIndex === -1 ? checkpoints.length - 1 : Math.max(0, nextIndex - 1)
      },
    })
  }, aboutRef.value)
}

// Measure the new marker elements after Vue has rendered loaded or updated records.
watch(timelineItems, createTimeline, { flush: 'post' })

onMounted(() => {
  isMounted = true
  createTimeline()
  window.addEventListener('resize', createTimeline)
  apiStore.fetchInfo()
})

onBeforeUnmount(() => {
  isMounted = false
  window.removeEventListener('resize', createTimeline)
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <Teleport to="#header-title" defer>
    <h1 class="page-title">Über mich</h1>
  </Teleport>
  <div ref="aboutRef" class="about">
    <p v-if="isLoading" role="status">Wird geladen…</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <div class="timeline">
      <TimelineItem
        v-for="(item, index) in timelineItems"
        :key="item.id"
        :item="item"
        :index="index"
        :active="activeSegment === index"
      >
        <template v-if="index === 0" #marker>
          <div class="box"></div>
        </template>
      </TimelineItem>
    </div>
    <div class="spacer" aria-hidden="true"></div>
    <RouterLink to="/technicalexpertise" class="btn exp-btn">
      Technische Expertise &nbsp; →
    </RouterLink>
    <div class="spacer" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.about {
  width: 100%;
}

.timeline {
  position: relative;
}

.spacer {
  height: 10vh;
}

.box {
  position: absolute;
  width: 50px;
  height: 50px;
  z-index: 10;
  border: 1px solid rgba(187, 221, 232, 0.39);
  border-radius: 10px;
  background-color: var(--color-background-soft);

  pointer-events: none;
}

.exp-btn {
  position: absolute;
  right: 10%;
}

@media (max-width: 600px) {
  .box {
    width: 50px;
    height: 50px;
  }
}
</style>
