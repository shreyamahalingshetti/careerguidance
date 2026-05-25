// Seed script for Career Guidance System
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Career Guidance System database...')

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'John Student',
      password: hashedPassword,
      role: 'STUDENT',
    },
  })

  const counselor = await prisma.user.upsert({
    where: { email: 'counselor@example.com' },
    update: {},
    create: {
      email: 'counselor@example.com',
      name: 'Jane Counselor',
      password: hashedPassword,
      role: 'COUNSELOR',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create sample careers
  const careers = [
    {
      title: 'Software Engineer',
      description: 'Design, develop, and maintain software applications. Work with programming languages like JavaScript, Python, Java, and more to create innovative solutions.',
      category: 'Technology',
      salaryRange: '$70,000 - $150,000',
      education: "Bachelor's Degree in Computer Science",
      skills: 'JavaScript, Python, Java, Problem Solving, Teamwork',
      growth: '22% growth expected (2020-2030)',
    },
    {
      title: 'Data Scientist',
      description: 'Analyze complex data to help organizations make informed decisions. Use statistical methods, machine learning, and data visualization techniques.',
      category: 'Technology',
      salaryRange: '$85,000 - $180,000',
      education: "Master's Degree in Data Science or related field",
      skills: 'Python, R, SQL, Machine Learning, Statistics, Data Visualization',
      growth: '36% growth expected (2020-2030)',
    },
    {
      title: 'Registered Nurse',
      description: 'Provide patient care, educate patients and the public about health conditions, and provide advice and emotional support to patients and their families.',
      category: 'Healthcare',
      salaryRange: '$60,000 - $120,000',
      education: "Bachelor's Degree in Nursing (BSN)",
      skills: 'Patient Care, Communication, Critical Thinking, Empathy',
      growth: '9% growth expected (2020-2030)',
    },
    {
      title: 'Financial Analyst',
      description: 'Guide businesses and individuals in decisions about expending money to attain profit. Assess the performance of stocks, bonds, and other types of investments.',
      category: 'Finance',
      salaryRange: '$55,000 - $130,000',
      education: "Bachelor's Degree in Finance or Economics",
      skills: 'Financial Analysis, Excel, Communication, Attention to Detail',
      growth: '6% growth expected (2020-2030)',
    },
    {
      title: 'Marketing Manager',
      description: 'Plan, direct, and coordinate marketing policies and programs. Determine the demand for products and services and identify potential customers.',
      category: 'Business',
      salaryRange: '$65,000 - $140,000',
      education: "Bachelor's Degree in Marketing or Business",
      skills: 'Marketing Strategy, Communication, Creativity, Analytics',
      growth: '10% growth expected (2020-2030)',
    },
    {
      title: 'Mechanical Engineer',
      description: 'Design, develop, build, and test mechanical and thermal sensors and devices, including tools, engines, and machines.',
      category: 'Engineering',
      salaryRange: '$70,000 - $125,000',
      education: "Bachelor's Degree in Mechanical Engineering",
      skills: 'CAD Software, Problem Solving, Mathematics, Physics',
      growth: '7% growth expected (2020-2030)',
    },
    {
      title: 'Teacher',
      description: 'Educate students in various subjects. Plan lessons, grade assignments, and help students develop critical thinking skills.',
      category: 'Education',
      salaryRange: '$40,000 - $85,000',
      education: "Bachelor's Degree in Education",
      skills: 'Communication, Patience, Creativity, Organization',
      growth: '8% growth expected (2020-2030)',
    },
    {
      title: 'Graphic Designer',
      description: 'Create visual concepts to communicate ideas that inspire, inform, and captivate consumers. Develop layouts and production designs.',
      category: 'Creative',
      salaryRange: '$45,000 - $95,000',
      education: "Bachelor's Degree in Graphic Design or related field",
      skills: 'Adobe Creative Suite, Creativity, Communication, Typography',
      growth: '3% growth expected (2020-2030)',
    },
  ]

  // Delete existing careers
  await prisma.career.deleteMany({})

  // Create careers
  for (const career of careers) {
    await prisma.career.create({
      data: career,
    })
  }

  // Create sample recommendations
  const recommendations = [
    {
      userId: student.id,
      title: 'Explore Technology Careers',
      description: 'Based on your interests, we recommend exploring careers in technology. Consider software engineering or data science.',
      type: 'CAREER' as const,
      priority: 1,
    },
    {
      userId: student.id,
      title: 'Develop Programming Skills',
      description: 'Start learning programming languages like Python or JavaScript to prepare for tech careers.',
      type: 'SKILL' as const,
      priority: 2,
    },
  ]

  await prisma.recommendation.deleteMany({})
  for (const rec of recommendations) {
    await prisma.recommendation.create({
      data: rec,
    })
  }

  console.log('✅ Seeding completed!')
  console.log('📧 Student credentials: student@example.com / password123')
  console.log('📧 Counselor credentials: counselor@example.com / password123')
  console.log('📧 Admin credentials: admin@example.com / password123')
  console.log(`📝 Created ${careers.length} sample careers`)
  console.log(`💡 Created ${recommendations.length} sample recommendations`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
