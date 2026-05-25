/**
 * Resource Recommender Module
 * ============================
 * Generates learning resource links for detected weak topics.
 *
 * Strategy:
 * - For each weak skill/topic, generate targeted Google search URLs
 *   scoped to trusted educational websites.
 * - This is more reliable than scraping (sites change their HTML frequently)
 *   and works without any API keys or paid services.
 * - Each topic gets up to 5 resource links across different sites.
 *
 * Supported educational sites:
 * - GeeksForGeeks (geeksforgeeks.org)
 * - Programiz (programiz.com)
 * - TutorialsPoint (tutorialspoint.com)
 * - W3Schools (w3schools.com)
 * - Google general search as fallback
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ResourceLink = {
  title: string
  url: string
  site: string
}

export type TopicResources = {
  topic: string
  resources: ResourceLink[]
}

// ---------------------------------------------------------------------------
// Trusted educational sites configuration
// Each entry generates a Google search scoped to that specific website.
// ---------------------------------------------------------------------------

const EDUCATIONAL_SITES = [
  {
    name: 'GeeksForGeeks',
    domain: 'geeksforgeeks.org',
    icon: '📗',
  },
  {
    name: 'Programiz',
    domain: 'programiz.com',
    icon: '📘',
  },
  {
    name: 'TutorialsPoint',
    domain: 'tutorialspoint.com',
    icon: '📙',
  },
  {
    name: 'W3Schools',
    domain: 'w3schools.com',
    icon: '📕',
  },
]

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Generate a Google search URL scoped to a specific educational site.
 * Example: "Binary Trees" on geeksforgeeks.org →
 *   https://www.google.com/search?q=Binary+Trees+site%3Ageeksforgeeks.org
 */
function buildGoogleSearchUrl(topic: string, siteDomain: string): string {
  const query = encodeURIComponent(`${topic} tutorial site:${siteDomain}`)
  return `https://www.google.com/search?q=${query}`
}

/**
 * Generate a general Google search URL for a topic (no site restriction).
 * Used as a 5th fallback resource.
 */
function buildGeneralSearchUrl(topic: string): string {
  const query = encodeURIComponent(`${topic} tutorial learn`)
  return `https://www.google.com/search?q=${query}`
}

/**
 * Get learning resource links for a single weak topic.
 * Returns up to 5 resource links (4 site-specific + 1 general).
 *
 * @param topic - The weak skill/topic name (e.g. "Binary Trees", "Recursion")
 * @returns Array of ResourceLink objects with title, url, and site name
 */
export function getResourcesForTopic(topic: string): ResourceLink[] {
  const resources: ResourceLink[] = []

  // Generate one link per trusted educational site
  for (const site of EDUCATIONAL_SITES) {
    resources.push({
      title: `${site.icon} ${topic} — ${site.name}`,
      url: buildGoogleSearchUrl(topic, site.domain),
      site: site.name,
    })
  }

  // Add a general Google search as the 5th resource
  resources.push({
    title: `🔍 More "${topic}" tutorials on Google`,
    url: buildGeneralSearchUrl(topic),
    site: 'Google',
  })

  return resources.slice(0, 5) // Maximum 5 resources per topic
}

/**
 * Get learning resource links for multiple weak topics at once.
 *
 * @param weakTopics - Array of topic names the student struggled with
 * @returns Array of TopicResources, one per topic
 */
export function getResourcesForTopics(weakTopics: string[]): TopicResources[] {
  if (!weakTopics || weakTopics.length === 0) return []

  return weakTopics.map(topic => ({
    topic,
    resources: getResourcesForTopic(topic),
  }))
}

/**
 * Generate HTML for resource links (used in email templates).
 * Creates a nicely formatted HTML block for each topic and its resources.
 *
 * @param topicResources - Array from getResourcesForTopics()
 * @returns HTML string ready to embed in email
 */
export function generateResourcesHtml(topicResources: TopicResources[]): string {
  if (topicResources.length === 0) return ''

  let html = `
    <div style="margin-top: 20px;">
      <h3 style="color: #1e40af; margin-bottom: 10px;">📚 Recommended Learning Resources</h3>
      <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">
        Based on your quiz results, here are curated resources to help you improve:
      </p>
  `

  for (const { topic, resources } of topicResources) {
    html += `
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
        <h4 style="color: #0c4a6e; margin: 0 0 8px 0; font-size: 16px;">
          ⚠️ You need to improve: <strong>${topic}</strong>
        </h4>
        <ul style="margin: 0; padding-left: 20px; list-style: none;">
    `

    for (const resource of resources) {
      html += `
          <li style="margin-bottom: 6px;">
            <a href="${resource.url}" 
               target="_blank" 
               rel="noopener noreferrer"
               style="color: #2563eb; text-decoration: none; font-size: 14px;">
              ${resource.title} →
            </a>
          </li>
      `
    }

    html += `
        </ul>
      </div>
    `
  }

  html += `</div>`
  return html
}
