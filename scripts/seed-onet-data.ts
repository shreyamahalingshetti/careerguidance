import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ParsedOnet {
  title: string
  description: string
  riasec: {
    R: number
    I: number
    A: number
    S: number
    E: number
    C: number
  }
}

// 24 APPROVED CAREER FAMILIES (8 SCIENCE, 8 COMMERCE, 8 ARTS_HUMANITIES)
const FAMILIES_TAXONOMY = [
  // --- SCIENCE (8) ---
  {
    slug: 'computing-software-engineering',
    name: 'Computing & Software Engineering',
    stream: 'SCIENCE',
    description: 'Software development, systems engineering, cybersecurity, & networks',
    occupations: [
      { soc: '15-1252.00', requiresMath: true, requiresBiology: false, requiresCs: true, isPathwayDependent: false, modernRoles: ['AI/ML Engineer', 'Full-Stack Developer'] },
      { soc: '15-1253.00', requiresMath: true, requiresBiology: false, requiresCs: true, isPathwayDependent: false, modernRoles: ['QA Automation Engineer'] },
      { soc: '15-1211.00', requiresMath: true, requiresBiology: false, requiresCs: true, isPathwayDependent: false, modernRoles: ['Systems Architect'] },
      { soc: '15-1241.00', requiresMath: true, requiresBiology: false, requiresCs: true, isPathwayDependent: false, modernRoles: ['Cloud Architect', 'DevOps Engineer'] },
      { soc: '15-1299.08', requiresMath: true, requiresBiology: false, requiresCs: true, isPathwayDependent: false, modernRoles: ['Solutions Architect'] },
    ]
  },
  {
    slug: 'data-science-analytics',
    name: 'Data Science & Analytics',
    stream: 'SCIENCE',
    description: 'Machine learning, data analytics, statistics, & operations research',
    occupations: [
      { soc: '15-2051.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Data Scientist', 'ML Research Engineer'] },
      { soc: '15-2041.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Quantitative Analyst'] },
      { soc: '15-2031.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Operations Researcher'] },
      { soc: '15-2021.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Applied Mathematician'] },
    ]
  },
  {
    slug: 'engineering-technology',
    name: 'Engineering & Technology',
    stream: 'SCIENCE',
    description: 'Mechanical, electrical, civil, chemical, & robotics engineering',
    occupations: [
      { soc: '17-2141.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: true, modernRoles: ['Automotive Engineer', 'Thermal Systems Engineer'] },
      { soc: '17-2071.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: true, modernRoles: ['Embedded Hardware Engineer'] },
      { soc: '17-2051.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: true, modernRoles: ['Structural Engineer'] },
      { soc: '17-2041.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: true, modernRoles: ['Process Engineer'] },
      { soc: '17-2199.08', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: true, modernRoles: ['Robotics System Developer'] },
    ]
  },
  {
    slug: 'medicine-clinical-healthcare',
    name: 'Medicine & Clinical Healthcare',
    stream: 'SCIENCE',
    description: 'Physicians, dentists, pharmacists, nursing, & clinical diagnostics',
    occupations: [
      { soc: '29-1051.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: true, modernRoles: ['Clinical Pharmacist'] },
      { soc: '29-1215.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: true, modernRoles: ['General Physician (MBBS)'] },
      { soc: '29-1216.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: true, modernRoles: ['Internal Medicine Specialist'] },
      { soc: '29-1021.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: true, modernRoles: ['Dental Surgeon (BDS)'] },
      { soc: '29-1141.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: true, modernRoles: ['Critical Care Nurse'] },
    ]
  },
  {
    slug: 'biological-life-sciences',
    name: 'Biological & Life Sciences',
    stream: 'SCIENCE',
    description: 'Biochemistry, microbiology, genetics, & biotechnology',
    occupations: [
      { soc: '19-1021.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: false, modernRoles: ['Biotech Researcher'] },
      { soc: '19-1022.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: false, modernRoles: ['Industrial Microbiologist'] },
      { soc: '19-1042.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: false, modernRoles: ['Clinical Research Scientist'] },
      { soc: '19-1023.00', requiresMath: false, requiresBiology: true, requiresCs: false, isPathwayDependent: false, modernRoles: ['Ecological Analyst'] },
    ]
  },
  {
    slug: 'physical-sciences-chemistry',
    name: 'Physical Sciences & Chemistry',
    stream: 'SCIENCE',
    description: 'Chemistry, physics, astronomy, & materials science',
    occupations: [
      { soc: '19-2031.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Analytical Chemist'] },
      { soc: '19-2012.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Quantum Physics Researcher'] },
      { soc: '19-2032.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Nanomaterials Specialist'] },
      { soc: '19-2042.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Geophysicist'] },
    ]
  },
  {
    slug: 'environmental-earth-sciences',
    name: 'Environmental & Earth Sciences',
    stream: 'SCIENCE',
    description: 'Environmental science, geology, hydrology, & meteorology',
    occupations: [
      { soc: '19-2041.00', requiresMath: false, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Climate Risk Analyst'] },
      { soc: '19-2043.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Water Resource Specialist'] },
      { soc: '19-1031.00', requiresMath: false, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Conservation Manager'] },
    ]
  },
  {
    slug: 'architecture-spatial-design',
    name: 'Architecture & Spatial Design',
    stream: 'SCIENCE',
    description: 'Architectural design, landscape architecture, & structural planning',
    occupations: [
      { soc: '17-1011.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: true, modernRoles: ['B.Arch Designer'] },
      { soc: '17-1012.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['Landscape Urbanist'] },
      { soc: '17-1022.00', requiresMath: true, requiresBiology: false, requiresCs: false, isPathwayDependent: false, modernRoles: ['GIS Surveyor'] },
    ]
  },

  // --- COMMERCE (8) ---
  {
    slug: 'accounting-financial-control',
    name: 'Accounting & Financial Control',
    stream: 'COMMERCE',
    description: 'Chartered accounting, auditing, cost estimation, & bookkeeping',
    occupations: [
      { soc: '13-2011.00', requiresMath: false, requiresBiology: false, requiresCs: false, isPathwayDependent: true, modernRoles: ['Chartered Accountant (CA)'] },
      { soc: '13-2023.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Real Estate Valuer'] },
      { soc: '13-1051.00', requiresMath: true, isPathwayDependent: false, modernRoles: ['Project Cost Controller'] },
      { soc: '43-3031.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Accounts Specialist'] },
    ]
  },
  {
    slug: 'corporate-finance-investment',
    name: 'Corporate Finance & Investment',
    stream: 'COMMERCE',
    description: 'Financial analysis, investment management, equity research, & advisory',
    occupations: [
      { soc: '13-2051.00', requiresMath: true, isPathwayDependent: false, modernRoles: ['Equity Research Analyst', 'CFA Charterholder'] },
      { soc: '11-3031.00', requiresMath: true, isPathwayDependent: true, modernRoles: ['Chief Financial Officer (CFO)'] },
      { soc: '13-2052.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Wealth Manager'] },
    ]
  },
  {
    slug: 'banking-financial-services',
    name: 'Banking & Financial Services',
    stream: 'COMMERCE',
    description: 'Commercial banking, credit analysis, loan underwriting, & securities',
    occupations: [
      { soc: '13-2072.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Credit Risk Officer'] },
      { soc: '41-3031.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Investment Banker / Broker'] },
      { soc: '13-2082.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Tax Consultant'] },
    ]
  },
  {
    slug: 'business-management-strategy',
    name: 'Business Management & Strategy',
    stream: 'COMMERCE',
    description: 'General management, management consulting, & operations strategy',
    occupations: [
      { soc: '11-1021.00', requiresMath: false, isPathwayDependent: true, modernRoles: ['Business Operations Director'] },
      { soc: '13-1111.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Management Consultant'] },
      { soc: '13-1082.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Agile Project Lead'] },
    ]
  },
  {
    slug: 'marketing-market-analytics',
    name: 'Marketing & Market Analytics',
    stream: 'COMMERCE',
    description: 'Marketing management, market research, brand strategy, & advertising',
    occupations: [
      { soc: '11-2021.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Chief Marketing Officer'] },
      { soc: '13-1161.00', requiresMath: true, isPathwayDependent: false, modernRoles: ['Growth Analyst', 'SEO Specialist'] },
      { soc: '11-2011.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Brand Campaign Lead'] },
    ]
  },
  {
    slug: 'human-resources-talent-management',
    name: 'Human Resources & Talent Management',
    stream: 'COMMERCE',
    description: 'HR management, talent acquisition, corporate training, & organizational dev',
    occupations: [
      { soc: '11-3121.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Head of HR'] },
      { soc: '13-1071.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Talent Acquisition Partner'] },
      { soc: '13-1151.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['L&D Manager'] },
    ]
  },
  {
    slug: 'supply-chain-logistics-operations',
    name: 'Supply Chain & Logistics Operations',
    stream: 'COMMERCE',
    description: 'Logistics management, procurement, inventory control, & distribution',
    occupations: [
      { soc: '13-1081.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Supply Chain Manager'] },
      { soc: '11-3071.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['E-Commerce Fulfillment Director'] },
      { soc: '13-1022.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Global Sourcing Lead'] },
    ]
  },
  {
    slug: 'commercial-sales-international-trade',
    name: 'Commercial Sales & International Trade',
    stream: 'COMMERCE',
    description: 'B2B sales management, wholesale trading, & technical sales',
    occupations: [
      { soc: '11-2022.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['VP of Sales'] },
      { soc: '41-4011.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Enterprise B2B Sales Manager'] },
      { soc: '41-4012.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Account Executive'] },
    ]
  },

  // --- ARTS & HUMANITIES (8) ---
  {
    slug: 'psychology-counseling',
    name: 'Psychology & Counseling',
    stream: 'ARTS_HUMANITIES',
    description: 'Clinical psychology, counseling, school psychology, & guidance',
    occupations: [
      { soc: '19-3033.00', requiresMath: false, isPathwayDependent: true, modernRoles: ['Clinical Psychologist (M.Phil/Ph.D)'] },
      { soc: '19-3034.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Child Guidance Specialist'] },
      { soc: '21-1014.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Psychotherapist'] },
      { soc: '21-1012.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Career & Academic Counselor'] },
    ]
  },
  {
    slug: 'law-legal-services',
    name: 'Law & Legal Services',
    stream: 'ARTS_HUMANITIES',
    description: 'Corporate law, litigation, legal advocacy, & judiciary services',
    occupations: [
      { soc: '23-1011.00', requiresMath: false, isPathwayDependent: true, modernRoles: ['Advocate (BA LLB)', 'Corporate Legal Counsel'] },
      { soc: '23-2011.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Legal Researcher / Analyst'] },
      { soc: '23-1023.00', requiresMath: false, isPathwayDependent: true, modernRoles: ['Judicial Officer'] },
    ]
  },
  {
    slug: 'journalism-media-mass-communication',
    name: 'Journalism, Media & Mass Communication',
    stream: 'ARTS_HUMANITIES',
    description: 'Journalism, news editing, broadcasting, & public relations',
    occupations: [
      { soc: '27-3023.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Digital Journalist', 'Investigative Reporter'] },
      { soc: '27-3041.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Senior Content Editor'] },
      { soc: '27-3031.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['PR Lead', 'Communications Strategist'] },
    ]
  },
  {
    slug: 'education-pedagogy',
    name: 'Education & Pedagogy',
    stream: 'ARTS_HUMANITIES',
    description: 'School teaching, pedagogy development, & educational administration',
    occupations: [
      { soc: '25-2021.00', requiresMath: false, isPathwayDependent: true, modernRoles: ['Primary School Educator (B.Ed)'] },
      { soc: '25-2031.00', requiresMath: false, isPathwayDependent: true, modernRoles: ['High School Subject Educator (B.Ed)'] },
      { soc: '25-9031.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['EdTech Curriculum Designer'] },
    ]
  },
  {
    slug: 'design-visual-applied-arts',
    name: 'Design, Visual & Applied Arts',
    stream: 'ARTS_HUMANITIES',
    description: 'Graphic design, interior design, UI/UX, animation, & visual arts',
    occupations: [
      { soc: '27-1024.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['UI/UX Designer', 'Brand Visual Designer'] },
      { soc: '27-1025.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Interior & Spatial Designer'] },
      { soc: '27-1014.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['3D Animator / VFX Artist'] },
    ]
  },
  {
    slug: 'fine-performing-arts',
    name: 'Fine & Performing Arts',
    stream: 'ARTS_HUMANITIES',
    description: 'Fine arts, music, theatre, film production, & acting',
    occupations: [
      { soc: '27-1011.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Creative Art Director'] },
      { soc: '27-2012.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Film Producer & Director'] },
      { soc: '27-2042.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Music Composer / Vocalist'] },
      { soc: '27-2011.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Theatre & Screen Actor'] },
    ]
  },
  {
    slug: 'social-work-community-development',
    name: 'Social Work & Community Development',
    stream: 'ARTS_HUMANITIES',
    description: 'Child & family social work, community development, & human services',
    occupations: [
      { soc: '21-1021.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['NGO Program Manager (MSW)'] },
      { soc: '21-1093.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Community Outreach Lead'] },
    ]
  },
  {
    slug: 'public-policy-civil-services',
    name: 'Public Policy & Civil Services',
    stream: 'ARTS_HUMANITIES',
    description: 'Political science, urban planning, public administration, & policy analysis',
    occupations: [
      { soc: '19-3051.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Urban Policy Analyst'] },
      { soc: '19-3094.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Political Analyst / Consultant'] },
      { soc: '13-1041.00', requiresMath: false, isPathwayDependent: false, modernRoles: ['Regulatory Compliance Specialist'] },
    ]
  }
]

export async function seedOnetData() {
  console.log('🌱 Starting official O*NET 31.0 data seed...')

  const jsonFile = path.join(process.cwd(), 'scripts', 'onet_parsed.json')
  if (!fs.existsSync(jsonFile)) {
    throw new Error(`Parsed O*NET JSON missing at ${jsonFile}. Run prepare_onet_json.py first.`)
  }

  const parsedOnetData: Record<string, ParsedOnet> = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'))
  console.log(`✓ Loaded ${Object.keys(parsedOnetData).length} parsed O*NET occupations.`)

  let seededFamiliesCount = 0
  let seededOccupationsCount = 0

  for (const fam of FAMILIES_TAXONOMY) {
    const familyRecord = await prisma.careerFamily.upsert({
      where: { slug: fam.slug },
      update: {
        name: fam.name,
        stream: fam.stream,
        description: fam.description
      },
      create: {
        slug: fam.slug,
        name: fam.name,
        stream: fam.stream,
        description: fam.description
      }
    })
    seededFamiliesCount++

    for (const occConfig of fam.occupations) {
      const soc = occConfig.soc
      const occData = parsedOnetData[soc]

      if (!occData) {
        console.warn(`⚠️ Warning: Missing O*NET data for configured SOC ${soc} (${fam.name})`)
        continue
      }

      await prisma.onetOccupation.upsert({
        where: { socCode: soc },
        update: {
          title: occData.title,
          description: occData.description,
          riasecR: occData.riasec.R,
          riasecI: occData.riasec.I,
          riasecA: occData.riasec.A,
          riasecS: occData.riasec.S,
          riasecE: occData.riasec.E,
          riasecC: occData.riasec.C,
          requiresMath: occConfig.requiresMath ?? false,
          requiresBiology: occConfig.requiresBiology ?? false,
          requiresCs: occConfig.requiresCs ?? false,
          isPathwayDependent: occConfig.isPathwayDependent,
          relatedModernRoles: JSON.stringify(occConfig.modernRoles)
        },
        create: {
          socCode: soc,
          title: occData.title,
          description: occData.description,
          riasecR: occData.riasec.R,
          riasecI: occData.riasec.I,
          riasecA: occData.riasec.A,
          riasecS: occData.riasec.S,
          riasecE: occData.riasec.E,
          riasecC: occData.riasec.C,
          familyId: familyRecord.id,
          requiresMath: occConfig.requiresMath ?? false,
          requiresBiology: occConfig.requiresBiology ?? false,
          requiresCs: occConfig.requiresCs ?? false,
          isPathwayDependent: occConfig.isPathwayDependent,
          relatedModernRoles: JSON.stringify(occConfig.modernRoles)
        }
      })
      seededOccupationsCount++
    }
  }

  console.log(`✅ O*NET 31.0 Seed Completed Successfully!`)
  console.log(`   • Seeded Families   : ${seededFamiliesCount} (8 Science, 8 Commerce, 8 Arts)`)
  console.log(`   • Seeded Occupations: ${seededOccupationsCount} (Genuine O*NET occupations with continuous 1-7 RIASEC ratings)`)
}

if (require.main === module) {
  seedOnetData()
    .catch((e) => {
      console.error('❌ O*NET Seed Failed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
