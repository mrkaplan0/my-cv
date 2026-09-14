const baseUrl = 'https://api.github.com'
const owner = 'mrkaplan0'

async function request(path, signal) {
  const response = await fetch(`${baseUrl}${path}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub-Anfragelimit erreicht. Bitte später erneut versuchen.')
    }
    throw new Error('GitHub ist momentan nicht erreichbar. Bitte erneut versuchen.')
  }
  return response.json()
}

export async function getPublicProjects(signal) {
  const projects = []
  for (let page = 1; ; page++) {
    const batch = await request(
      `/users/${owner}/repos?type=owner&sort=updated&per_page=100&page=${page}`,
      signal,
    )
    projects.push(...batch.filter((repo) => !repo.private))
    if (batch.length < 100) return projects
  }
}

export function normalizeTechnology(value) {
  const key = value.toLowerCase().replace(/[ ._-]/g, '')
  return (
    { vue: 'vuejs', html: 'html5', css: 'css3', sql: 'sqldatenbanken', 'c++': 'cpp' }[key] ?? key
  )
}

// Languages and explicit dependencies only: a language alone does not imply a framework.
export async function getProjectTechnologies(repo, signal) {
  const path = `/repos/${owner}/${encodeURIComponent(repo.name)}`
  const [languagesResult, filesResult] = await Promise.allSettled([
    request(`${path}/languages`, signal),
    request(`${path}/contents`, signal),
  ])
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const technologies = new Set([repo.language, ...(repo.topics ?? [])].filter(Boolean))
  let partial = false
  if (languagesResult.status === 'fulfilled')
    Object.keys(languagesResult.value).forEach((name) => technologies.add(name))
  else partial = true
  if (filesResult.status === 'fulfilled' && Array.isArray(filesResult.value)) {
    const files = filesResult.value
    if (files.some((file) => /^dockerfile|^docker-compose\./i.test(file.name)))
      technologies.add('Docker')
    const manifests = files.filter((file) =>
      ['package.json', 'composer.json', 'pubspec.yaml', 'requirements.txt'].includes(file.name),
    )
    const results = await Promise.allSettled(
      manifests.map(async (file) => {
        const data = await request(`${path}/contents/${encodeURIComponent(file.name)}`, signal)
        const text = atob(data.content.replace(/\s/g, ''))
        if (file.name.endsWith('.json')) {
          const manifest = JSON.parse(text)
          const dependencies = {
            ...manifest.dependencies,
            ...manifest.devDependencies,
            ...manifest.require,
            ...manifest['require-dev'],
          }
          const names = Object.keys(dependencies)
          if (names.includes('vue')) technologies.add('Vue.js')
          if (names.includes('laravel/framework')) technologies.add('Laravel')
          if (names.some((name) => name === 'firebase' || name.startsWith('@firebase/')))
            technologies.add('Firebase')
        } else {
          if (/^\s*flutter\s*:/m.test(text)) technologies.add('Flutter')
          if (/^\s*(?:firebase_core|cloud_firestore|firebase_auth)\s*:/m.test(text))
            technologies.add('Firebase')
          if (/^\s*django(?:\s|[<>=!~\[]|$)/im.test(text)) technologies.add('Django')
        }
      }),
    )
    partial ||= results.some((result) => result.status === 'rejected')
  } else partial = true
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  return { technologies: [...technologies], partial }
}
