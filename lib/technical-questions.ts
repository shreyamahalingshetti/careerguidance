// 60 Technical-Contextualized RIASEC Questions for Technical Assessment (10 per trait)
// Foundation: Armstrong, Allison & Rounds (2008) / IPIP Public Domain Items
export interface ITechnicalQuestion {
  id: string
  type: 'Realistic' | 'Investigative' | 'Artistic' | 'Social' | 'Enterprising' | 'Conventional'
  trait: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
  text: string
}

export const TECHNICAL_QUESTIONS: ITechnicalQuestion[] = [
  // Realistic (10 Qs)
  { id: 'R1', type: 'Realistic', trait: 'R', text: 'Assembling physical computer components, microcontrollers, or circuit boards.' },
  { id: 'R2', type: 'Realistic', trait: 'R', text: 'Setting up network cables, routers, and physical server hardware.' },
  { id: 'R3', type: 'Realistic', trait: 'R', text: 'Troubleshooting physical hardware faults or faulty electronic connections.' },
  { id: 'R4', type: 'Realistic', trait: 'R', text: 'Working with robotics hardware, motor drivers, and physical sensors.' },
  { id: 'R5', type: 'Realistic', trait: 'R', text: 'Installing operating systems directly on physical computer drives.' },
  { id: 'R6', type: 'Realistic', trait: 'R', text: 'Testing physical computer hardware to ensure all parts function correctly.' },
  { id: 'R7', type: 'Realistic', trait: 'R', text: 'Wiring electronic components and breadboards for small tech projects.' },
  { id: 'R8', type: 'Realistic', trait: 'R', text: 'Connecting peripheral hardware devices, external monitors, and lab equipment.' },
  { id: 'R9', type: 'Realistic', trait: 'R', text: 'Repairing or upgrading physical computer memory, storage, and processors.' },
  { id: 'R10', type: 'Realistic', trait: 'R', text: 'Setting up physical smart home sensors and IoT hardware devices in a room.' },

  // Investigative (10 Qs)
  { id: 'I1', type: 'Investigative', trait: 'I', text: 'Analyzing complex algorithms to understand how they process data.' },
  { id: 'I2', type: 'Investigative', trait: 'I', text: 'Diagnosing deep software bugs to figure out why a program is failing.' },
  { id: 'I3', type: 'Investigative', trait: 'I', text: 'Analyzing data patterns to uncover hidden insights or trends.' },
  { id: 'I4', type: 'Investigative', trait: 'I', text: 'Researching how artificial intelligence models make predictions.' },
  { id: 'I5', type: 'Investigative', trait: 'I', text: 'Exploring theoretical computer science principles and mathematical logic.' },
  { id: 'I6', type: 'Investigative', trait: 'I', text: 'Conducting experiments to compare the processing speed of different methods.' },
  { id: 'I7', type: 'Investigative', trait: 'I', text: 'Investigating how encryption algorithms protect secure information.' },
  { id: 'I8', type: 'Investigative', trait: 'I', text: 'Analyzing system log files to trace the root cause of a security issue.' },
  { id: 'I9', type: 'Investigative', trait: 'I', text: 'Studying how database engines organize and index millions of data records.' },
  { id: 'I10', type: 'Investigative', trait: 'I', text: 'Reading technical research articles to learn about new computing concepts.' },

  // Artistic (10 Qs)
  { id: 'A1', type: 'Artistic', trait: 'A', text: 'Designing visual color schemes, typography, and visual themes for software.' },
  { id: 'A2', type: 'Artistic', trait: 'A', text: 'Creating wireframe visual layouts for new mobile application screens.' },
  { id: 'A3', type: 'Artistic', trait: 'A', text: 'Crafting smooth visual animations and interactive visual effects for websites.' },
  { id: 'A4', type: 'Artistic', trait: 'A', text: 'Exploring creative coding to generate digital graphics and visual patterns.' },
  { id: 'A5', type: 'Artistic', trait: 'A', text: 'Designing intuitive user interface icons, visual buttons, and graphics.' },
  { id: 'A6', type: 'Artistic', trait: 'A', text: 'Designing engaging user experience navigation flows for digital applications.' },
  { id: 'A7', type: 'Artistic', trait: 'A', text: 'Blending graphic design with web tools to create visually appealing web pages.' },
  { id: 'A8', type: 'Artistic', trait: 'A', text: 'Experimenting with novel visual layouts and creative interaction styles.' },
  { id: 'A9', type: 'Artistic', trait: 'A', text: 'Customizing visual dark/light themes and graphic assets for software products.' },
  { id: 'A10', type: 'Artistic', trait: 'A', text: 'Sketching digital storyboards to visually plan how users navigate an app.' },

  // Social (10 Qs)
  { id: 'S1', type: 'Social', trait: 'S', text: 'Explaining technical concepts in simple terms to help non-technical users.' },
  { id: 'S2', type: 'Social', trait: 'S', text: 'Helping team members troubleshoot code when they get stuck on a problem.' },
  { id: 'S3', type: 'Social', trait: 'S', text: 'Mentoring beginners to help them learn programming or software tools.' },
  { id: 'S4', type: 'Social', trait: 'S', text: 'Collaborating closely in a team to share project knowledge and ideas.' },
  { id: 'S5', type: 'Social', trait: 'S', text: 'Designing accessible software features that help people with disabilities.' },
  { id: 'S6', type: 'Social', trait: 'S', text: 'Interviewing users to understand how software can better help their daily lives.' },
  { id: 'S7', type: 'Social', trait: 'S', text: 'Helping classmates install and configure software tools for their projects.' },
  { id: 'S8', type: 'Social', trait: 'S', text: 'Moderating discussions and answering questions in online tech forums.' },
  { id: 'S9', type: 'Social', trait: 'S', text: 'Guiding users step-by-step to resolve their software usability problems.' },
  { id: 'S10', type: 'Social', trait: 'S', text: 'Organizing study groups or coding workshops to teach technical skills to others.' },

  // Enterprising (10 Qs)
  { id: 'E1', type: 'Enterprising', trait: 'E', text: 'Pitching new tech product ideas and convincing others of their potential value.' },
  { id: 'E2', type: 'Enterprising', trait: 'E', text: 'Leading a software project team and assigning technical roles to members.' },
  { id: 'E3', type: 'Enterprising', trait: 'E', text: 'Managing project deadlines and driving teams to achieve milestone goals.' },
  { id: 'E4', type: 'Enterprising', trait: 'E', text: 'Participating in competitive hackathons to build software under pressure.' },
  { id: 'E5', type: 'Enterprising', trait: 'E', text: 'Persuading teammates or stakeholders to adopt a specific technical strategy.' },
  { id: 'E6', type: 'Enterprising', trait: 'E', text: 'Identifying new tech market opportunities to build commercial app solutions.' },
  { id: 'E7', type: 'Enterprising', trait: 'E', text: 'Negotiating feature priorities and scope requirements for a tech project.' },
  { id: 'E8', type: 'Enterprising', trait: 'E', text: 'Presenting software demonstration demos to audiences or event judges.' },
  { id: 'E9', type: 'Enterprising', trait: 'E', text: 'Initiating new technology projects and organizing the team to execute them.' },
  { id: 'E10', type: 'Enterprising', trait: 'E', text: 'Promoting a finished tech project to attract new users and active supporters.' },

  // Conventional (10 Qs)
  { id: 'C1', type: 'Conventional', trait: 'C', text: 'Organizing structured database tables, schemas, and record fields.' },
  { id: 'C2', type: 'Conventional', trait: 'C', text: 'Writing clear, step-by-step user documentation and software operation manuals.' },
  { id: 'C3', type: 'Conventional', trait: 'C', text: 'Enforcing strict coding standards and repository organization rules.' },
  { id: 'C4', type: 'Conventional', trait: 'C', text: 'Setting up automated testing scripts to systematically check for software errors.' },
  { id: 'C5', type: 'Conventional', trait: 'C', text: 'Creating automated deployment pipelines to publish software updates reliably.' },
  { id: 'C6', type: 'Conventional', trait: 'C', text: 'Monitoring system logs and performance metrics to ensure infrastructure stability.' },
  { id: 'C7', type: 'Conventional', trait: 'C', text: 'Systematic testing of every button and input form against strict test cases.' },
  { id: 'C8', type: 'Conventional', trait: 'C', text: 'Managing version control branches and keeping code repositories clean and tidy.' },
  { id: 'C9', type: 'Conventional', trait: 'C', text: 'Auditing security access permissions and configuration settings for compliance.' },
  { id: 'C10', type: 'Conventional', trait: 'C', text: 'Tracking server hosting costs, resource usage, and asset inventories.' },
]

export const TECHNICAL_LIKERT_LABELS = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
]
