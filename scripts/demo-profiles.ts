import { calculate10thStreamRecommendation, getFamilyCentroids } from '../lib/recommendation-10th'
import { prisma } from '../lib/prisma'

async function runDemo() {
  const centroids = await getFamilyCentroids(prisma)

  console.log('=== SYNTHETIC PROFILE 1: Technical / Science (High R & I) ===')
  const r1 = calculate10thStreamRecommendation([5.0, 5.0, 1.0, 1.5, 2.0, 4.0], centroids)
  console.log(`Recommended Stream: ${r1.recommendedStream}`)
  console.log(`Top Alternative:    ${r1.alternativeStream}`)
  console.log(`Science Fit:        ${r1.scienceFit}% (${r1.scienceStreamResult.alignmentBand})`)
  console.log(`Commerce Fit:       ${r1.commerceFit}% (${r1.commerceStreamResult.alignmentBand})`)
  console.log(`Arts Fit:           ${r1.artsFit}% (${r1.artsStreamResult.alignmentBand})`)
  console.log(`Top 3 Science Families: ${r1.scienceStreamResult.topFamilies.map(f => `${f.familyName} (${f.fitPercentage}%)`).join(', ')}`)
  console.log(`Close Match Flag:   ${r1.isCloseMatch}`)

  console.log('\n=== SYNTHETIC PROFILE 2: Business / Commerce (High E & C) ===')
  const r2 = calculate10thStreamRecommendation([1.5, 2.0, 1.5, 2.5, 5.0, 4.8], centroids)
  console.log(`Recommended Stream: ${r2.recommendedStream}`)
  console.log(`Top Alternative:    ${r2.alternativeStream}`)
  console.log(`Science Fit:        ${r2.scienceFit}% (${r2.scienceStreamResult.alignmentBand})`)
  console.log(`Commerce Fit:       ${r2.commerceFit}% (${r2.commerceStreamResult.alignmentBand})`)
  console.log(`Arts Fit:           ${r2.artsFit}% (${r2.artsStreamResult.alignmentBand})`)
  console.log(`Top 3 Commerce Families: ${r2.commerceStreamResult.topFamilies.map(f => `${f.familyName} (${f.fitPercentage}%)`).join(', ')}`)
  console.log(`Close Match Flag:   ${r2.isCloseMatch}`)

  console.log('\n=== SYNTHETIC PROFILE 3: Creative / Arts (High A & S) ===')
  const r3 = calculate10thStreamRecommendation([1.5, 2.0, 5.0, 4.8, 2.5, 1.5], centroids)
  console.log(`Recommended Stream: ${r3.recommendedStream}`)
  console.log(`Top Alternative:    ${r3.alternativeStream}`)
  console.log(`Science Fit:        ${r3.scienceFit}% (${r3.scienceStreamResult.alignmentBand})`)
  console.log(`Commerce Fit:       ${r3.commerceFit}% (${r3.commerceStreamResult.alignmentBand})`)
  console.log(`Arts Fit:           ${r3.artsFit}% (${r3.artsStreamResult.alignmentBand})`)
  console.log(`Top 3 Arts Families: ${r3.artsStreamResult.topFamilies.map(f => `${f.familyName} (${f.fitPercentage}%)`).join(', ')}`)
  console.log(`Close Match Flag:   ${r3.isCloseMatch}`)

  await prisma.$disconnect()
}

runDemo()
