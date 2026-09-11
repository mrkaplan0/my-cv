import info from '../../info.json' with { type: 'json' }

// Return independent copies so callers cannot mutate the shared source data.
async function getInfo() {
  return structuredClone(info)
}

/** @param {keyof typeof info} section */
async function getSection(section) {
  if (!Object.hasOwn(info, section)) {
    throw new Error(`Unknown info section: ${section}`)
  }

  return structuredClone(info[section])
}

const api = {
  getInfo,
  getPersonalInformation: () => getSection('personal_information'),
  getProfile: () => getSection('profile'),
  getTechnicalExpertise: () => getSection('technical_expertise'),
  getWorkExperience: () => getSection('work_experience'),
  getEducation: () => getSection('education'),
  getCertifications: () => getSection('certifications'),
  getLanguages: () => getSection('languages'),
}

export default api
