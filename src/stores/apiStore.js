import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../services/api.js'

export const useApiStore = defineStore('api', () => {
  const info = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  let pendingRequest = null

  const isLoaded = computed(() => info.value !== null)
  const personalInformation = computed(() => info.value?.personal_information ?? null)
  const profile = computed(() => info.value?.profile ?? null)
  const technicalExpertise = computed(() => info.value?.technical_expertise ?? null)
  const workExperience = computed(() => info.value?.work_experience ?? [])
  const education = computed(() => info.value?.education ?? [])
  const certifications = computed(() => info.value?.certifications ?? [])
  const languages = computed(() => info.value?.languages ?? [])

  // Reuse loaded data unless explicitly refreshed; share concurrent requests.
  // Failures are exposed through error and return null, allowing a later retry.
  async function fetchInfo({ force = false } = {}) {
    if (pendingRequest) return pendingRequest
    if (isLoaded.value && !force) return info.value

    isLoading.value = true
    error.value = null

    pendingRequest = (async () => {
      try {
        info.value = await api.getInfo()
        return info.value
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : 'Failed to load CV information.'
        return null
      } finally {
        isLoading.value = false
        pendingRequest = null
      }
    })()

    return pendingRequest
  }

  return {
    info,
    isLoading,
    error,
    isLoaded,
    personalInformation,
    profile,
    technicalExpertise,
    workExperience,
    education,
    certifications,
    languages,
    fetchInfo,
  }
})
