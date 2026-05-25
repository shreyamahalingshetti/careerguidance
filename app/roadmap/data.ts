export type Video = {
  title: string;
  url: string;
};

export type RoadmapNode = {
  id: string;
  title: string;
  description: string;
  videos: Video[];
};

export const fullStackRoadmapData: RoadmapNode[] = [
  {
    id: "html",
    title: "HTML",
    description: "Learn how to structure web pages using HTML.",
    videos: [
      {
        title: "HTML Tutorial for Beginners",
        url: "https://www.youtube.com/embed/FQdaUv95mR8",
      },
      {
        title: "Forms & Semantic HTML",
        url: "https://www.youtube.com/embed/PlxWf493en4",
      },
    ],
  },
  {
    id: "css",
    title: "CSS",
    description: "Style web pages and create beautiful layouts.",
    videos: [
      {
        title: "CSS Full Course",
        url: "https://www.youtube.com/embed/yfoY53QXEnI",
      },
    ],
  },
  {
    id: "javascript",
    title: "JavaScript",
    description: "Add logic and interactivity to websites.",
    videos: [
      {
        title: "JavaScript Basics",
        url: "https://www.youtube.com/embed/W6NZfCO5SIk",
      },
    ],
  },
  {
    id: "react",
    title: "React",
    description: "Build scalable, component-based user interfaces.",
    videos: [
      {
        title: "React Full Course",
        url: "https://www.youtube.com/embed/bMknfKXIFA8",
      },
      {
        title: "React Crash Course",
        url: "https://www.youtube.com/embed/w7ejDZ8SWv8",
      },
    ],
  },
  {
    id: "npm",
    title: "NPM",
    description: "Learn package management for JavaScript projects.",
    videos: [
      {
        title: "NPM Tutorial 1",
        url: "https://www.youtube.com/embed/jHDhaSSKmB0",
      },
      {
        title: "NPM Tutorial 2",
        url: "https://www.youtube.com/embed/P3aKRdUyr0s",
      },
    ],
  },
  {
    id: "tailwind",
    title: "Tailwind CSS",
    description: "Style modern interfaces quickly using utility classes.",
    videos: [
      {
        title: "Tailwind CSS Tutorial 1",
        url: "https://www.youtube.com/embed/dFgzHOX84xQ",
      },
      {
        title: "Tailwind CSS Tutorial 2",
        url: "https://www.youtube.com/embed/lCxcTsOHrjo",
      },
    ],
  },
  {
    id: "git",
    title: "Git",
    description: "Master version control basics and team workflows.",
    videos: [
      {
        title: "Git Tutorial 1",
        url: "https://www.youtube.com/embed/apGV9Kg7ics",
      },
      {
        title: "Git Tutorial 2",
        url: "https://www.youtube.com/embed/RGOj5yH7evk",
      },
    ],
  },
  {
    id: "github",
    title: "GitHub",
    description: "Collaborate, host repositories, and manage projects.",
    videos: [
      {
        title: "GitHub Tutorial 1",
        url: "https://www.youtube.com/embed/w3jLJU7DT5E",
      },
      {
        title: "GitHub Tutorial 2",
        url: "https://www.youtube.com/embed/iv8rSLsi1xo",
      },
    ],
  },
  {
    id: "nodejs",
    title: "Node.js",
    description: "Build backend applications using JavaScript runtime.",
    videos: [
      {
        title: "Node.js Tutorial 1",
        url: "https://www.youtube.com/embed/TlB_eWDSMt4",
      },
      {
        title: "Node.js Tutorial 2",
        url: "https://www.youtube.com/embed/Oe421EPjeBE",
      },
    ],
  },
  {
    id: "cli",
    title: "CLI Apps",
    description: "Create command-line tools and developer utilities.",
    videos: [
      {
        title: "CLI Apps Tutorial 1",
        url: "https://www.youtube.com/embed/9IJ5nX5z5qM",
      },
      {
        title: "CLI Apps Tutorial 2",
        url: "https://www.youtube.com/embed/2d7s3spWAzo",
      },
    ],
  },
  {
    id: "postgres",
    title: "PostgreSQL",
    description: "Learn relational databases and SQL fundamentals.",
    videos: [
      {
        title: "PostgreSQL Tutorial 1",
        url: "https://www.youtube.com/embed/qw--VYLpxG4",
      },
      {
        title: "PostgreSQL Tutorial 2",
        url: "https://www.youtube.com/embed/SpfIwlAYaKk",
      },
    ],
  },
  {
    id: "crud",
    title: "CRUD Apps",
    description: "Build create, read, update, and delete applications.",
    videos: [
      {
        title: "CRUD Apps Tutorial 1",
        url: "https://www.youtube.com/embed/2eqyQy0vZ2Y",
      },
      {
        title: "CRUD Apps Tutorial 2",
        url: "https://www.youtube.com/embed/1NrHkjlWVhM",
      },
    ],
  },
  {
    id: "redis",
    title: "Redis",
    description: "Use in-memory data stores for caching and speed.",
    videos: [
      {
        title: "Redis Tutorial 1",
        url: "https://www.youtube.com/embed/Hbt56gFj998",
      },
      {
        title: "Redis Tutorial 2",
        url: "https://www.youtube.com/embed/jgpVdJB2sKQ",
      },
    ],
  },
  {
    id: "jwt",
    title: "JWT Authentication",
    description: "Secure APIs and sessions using token-based auth.",
    videos: [
      {
        title: "JWT Authentication Tutorial 1",
        url: "https://www.youtube.com/embed/7Q17ubqLfaM",
      },
      {
        title: "JWT Authentication Tutorial 2",
        url: "https://www.youtube.com/embed/mbsmsi7l3r4",
      },
    ],
  },
  {
    id: "rest",
    title: "REST APIs",
    description: "Design and build API endpoints for web apps.",
    videos: [
      {
        title: "REST APIs Tutorial 1",
        url: "https://www.youtube.com/embed/lsMQRaeKNDk",
      },
      {
        title: "REST APIs Tutorial 2",
        url: "https://www.youtube.com/embed/rtWH70_MMHM",
      },
    ],
  },
  {
    id: "linux",
    title: "Linux Basics",
    description: "Understand terminal, files, permissions, and processes.",
    videos: [
      {
        title: "Linux Basics Tutorial 1",
        url: "https://www.youtube.com/embed/IVquJh3DXUA",
      },
      {
        title: "Linux Basics Tutorial 2",
        url: "https://www.youtube.com/embed/sWbUDq4S6Y8",
      },
    ],
  },
  {
    id: "aws",
    title: "Basic AWS Services",
    description: "Get started with core cloud services on AWS.",
    videos: [
      {
        title: "Basic AWS Services Tutorial 1",
        url: "https://www.youtube.com/embed/ulprqHHWlng",
      },
      {
        title: "Basic AWS Services Tutorial 2",
        url: "https://www.youtube.com/embed/k1RI5locZE4",
      },
    ],
  },
  {
    id: "ansible",
    title: "Ansible",
    description: "Automate provisioning and configuration tasks.",
    videos: [
      {
        title: "Ansible Tutorial 1",
        url: "https://www.youtube.com/embed/1id6ERvfozo",
      },
      {
        title: "Ansible Tutorial 2",
        url: "https://www.youtube.com/embed/goclfp6a2IQ",
      },
    ],
  },
  {
    id: "github-actions",
    title: "GitHub Actions",
    description: "Set up CI/CD workflows for automated delivery.",
    videos: [
      {
        title: "GitHub Actions Tutorial 1",
        url: "https://www.youtube.com/embed/R8_veQiYBjI",
      },
      {
        title: "GitHub Actions Tutorial 2",
        url: "https://www.youtube.com/embed/mFFXuXjVgkU",
      },
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring",
    description: "Track application health, logs, and metrics.",
    videos: [
      {
        title: "Monitoring Tutorial 1",
        url: "https://www.youtube.com/embed/nm2uG2b7Q3A",
      },
      {
        title: "Monitoring Tutorial 2",
        url: "https://www.youtube.com/embed/2lP1o9t1Uj4",
      },
    ],
  },
  {
    id: "terraform",
    title: "Terraform",
    description: "Manage cloud infrastructure as code.",
    videos: [
      {
        title: "Terraform Tutorial 1",
        url: "https://www.youtube.com/embed/l5k1ai_GBDE",
      },
      {
        title: "Terraform Tutorial 2",
        url: "https://www.youtube.com/embed/SLB_c_ayRMo",
      },
    ],
  },
];

export const frontendRoadmapData: RoadmapNode[] = [
  {
    id: "internet",
    title: "Internet Basics",
    description: "Understand how the internet, HTTP, DNS, and browsers work.",
    videos: [
      { title: "How the Internet Works in 5 Minutes", url: "https://www.youtube.com/embed/7_LPdttKXPc" },
      { title: "HTTP Crash Course", url: "https://www.youtube.com/embed/iYM2zFP3Zn0" }
    ]
  },
  {
    id: "html",
    title: "HTML",
    description: "Learn how to structure web pages using HTML.",
    videos: [
      { title: "HTML Tutorial for Beginners", url: "https://www.youtube.com/embed/FQdaUv95mR8" },
      { title: "Forms & Semantic HTML", url: "https://www.youtube.com/embed/PlxWf493en4" },
    ],
  },
  {
    id: "css",
    title: "CSS",
    description: "Style web pages and create beautiful layouts.",
    videos: [
      { title: "CSS Full Course", url: "https://www.youtube.com/embed/yfoY53QXEnI" },
    ],
  },
  {
    id: "javascript",
    title: "JavaScript",
    description: "Add logic and interactivity to websites.",
    videos: [
      { title: "JavaScript Basics", url: "https://www.youtube.com/embed/W6NZfCO5SIk" },
      { title: "DOM Manipulation", url: "https://www.youtube.com/embed/y17RuWUpcgk" }
    ],
  },
  {
    id: "vcs",
    title: "Version Control Systems",
    description: "Master Git and collaborate using GitHub.",
    videos: [
      { title: "Git Tutorial 1", url: "https://www.youtube.com/embed/apGV9Kg7ics" },
      { title: "GitHub Crash Course", url: "https://www.youtube.com/embed/RGOj5yH7evk" },
    ],
  },
  {
    id: "package-managers",
    title: "Package Managers",
    description: "Learn package management using npm or yarn.",
    videos: [
      { title: "NPM Tutorial", url: "https://www.youtube.com/embed/jHDhaSSKmB0" },
    ],
  },
  {
    id: "css-architecture",
    title: "CSS Architecture & Preprocessors",
    description: "Learn Sass, BEM, and CSS methodologies.",
    videos: [
      { title: "Sass Crash Course", url: "https://www.youtube.com/embed/nu5mdN2JIwM" }
    ]
  },
  {
    id: "frameworks",
    title: "Frontend Frameworks",
    description: "Pick a framework like React, Vue, or Angular.",
    videos: [
      { title: "React Full Course", url: "https://www.youtube.com/embed/bMknfKXIFA8" },
      { title: "Vue.js Crash Course", url: "https://www.youtube.com/embed/FXpIoQ_rT_c" }
    ]
  },
  {
    id: "modern-css",
    title: "Modern CSS",
    description: "Use modern CSS frameworks like Tailwind CSS or Styled Components.",
    videos: [
      { title: "Tailwind CSS Tutorial", url: "https://www.youtube.com/embed/dFgzHOX84xQ" },
    ]
  },
  {
    id: "build-tools",
    title: "Build Tools",
    description: "Learn module bundlers and task runners like Vite or Webpack.",
    videos: [
      { title: "Vite Crash Course", url: "https://www.youtube.com/embed/KCrXgy8qtjM" },
      { title: "Webpack Crash Course", url: "https://www.youtube.com/embed/X1nxTjVDYQk" }
    ]
  },
  {
    id: "testing",
    title: "Testing",
    description: "Learn how to write unit and integration tests (Jest, Cypress).",
    videos: [
      { title: "Jest Crash Course", url: "https://www.youtube.com/embed/7r4xVDI2vho" },
      { title: "Cypress Crash Course", url: "https://www.youtube.com/embed/7N63cMKosIE" }
    ]
  },
  {
    id: "type-checkers",
    title: "Type Checkers",
    description: "Add static typing to JavaScript with TypeScript.",
    videos: [
      { title: "TypeScript Crash Course", url: "https://www.youtube.com/embed/BCg4U1FzODs" },
      { title: "TypeScript Full Course", url: "https://www.youtube.com/embed/30LWjhZzg50" }
    ]
  },
  {
    id: "ssr",
    title: "Server Side Rendering",
    description: "Learn SSR and SSG using frameworks like Next.js.",
    videos: [
      { title: "Next.js Crash Course", url: "https://www.youtube.com/embed/tjvbgXk3rLw" }
    ]
  }
];

export const backendRoadmapData: RoadmapNode[] = [
  {
    id: "internet",
    title: "Internet Basics",
    description: "Understand how the internet, HTTP, DNS, and browsers work.",
    videos: [
      { title: "How the Internet Works in 5 Minutes", url: "https://www.youtube.com/embed/7_LPdttKXPc" },
      { title: "HTTP Crash Course", url: "https://www.youtube.com/embed/iYM2zFP3Zn0" }
    ]
  },
  {
    id: "backend-languages",
    title: "Backend Languages",
    description: "Pick a language like Node.js (JavaScript), Python, Java, or Go.",
    videos: [
      { title: "Node.js Crash Course", url: "https://www.youtube.com/embed/fBNz5xF-Kx4" },
      { title: "Python Crash Course", url: "https://www.youtube.com/embed/JJmcL1N2KQs" }
    ]
  },
  {
    id: "vcs",
    title: "Version Control Systems",
    description: "Master Git and collaborate using GitHub.",
    videos: [
      { title: "Git Tutorial 1", url: "https://www.youtube.com/embed/apGV9Kg7ics" },
      { title: "GitHub Crash Course", url: "https://www.youtube.com/embed/RGOj5yH7evk" },
    ],
  },
  {
    id: "relational-databases",
    title: "Relational Databases",
    description: "Learn SQL and relational databases like PostgreSQL or MySQL.",
    videos: [
      { title: "PostgreSQL Tutorial", url: "https://www.youtube.com/embed/qw--VYLpxG4" },
      { title: "MySQL Crash Course", url: "https://www.youtube.com/embed/7S_tz1z_5bA" }
    ]
  },
  {
    id: "nosql-databases",
    title: "NoSQL Databases",
    description: "Learn document databases like MongoDB and key-value stores like Redis.",
    videos: [
      { title: "MongoDB Crash Course", url: "https://www.youtube.com/embed/ExcRbA7fy_A" },
      { title: "Redis Crash Course", url: "https://www.youtube.com/embed/jgpVdJB2sKQ" }
    ]
  },
  {
    id: "apis",
    title: "APIs (REST & GraphQL)",
    description: "Design and build RESTful APIs and learn GraphQL.",
    videos: [
      { title: "REST APIs Crash Course", url: "https://www.youtube.com/embed/lsMQRaeKNDk" },
      { title: "GraphQL Crash Course", url: "https://www.youtube.com/embed/ed8SzALpx1Q" }
    ]
  },
  {
    id: "auth-security",
    title: "Authentication & Security",
    description: "Learn JWT, OAuth, session management, and basic web security.",
    videos: [
      { title: "JWT Authentication Tutorial", url: "https://www.youtube.com/embed/7Q17ubqLfaM" },
      { title: "Web Security Crash Course", url: "https://www.youtube.com/embed/lk-u1qI48_E" }
    ]
  },
  {
    id: "caching",
    title: "Caching",
    description: "Implement caching strategies using Redis or Memcached to improve performance.",
    videos: [
      { title: "Caching Crash Course", url: "https://www.youtube.com/embed/dGAgxozNWFE" },
      { title: "Redis as a Cache", url: "https://www.youtube.com/embed/jgpVdJB2sKQ" }
    ]
  },
  {
    id: "testing",
    title: "Testing",
    description: "Write unit, integration, and E2E tests for your backend.",
    videos: [
      { title: "Jest Crash Course", url: "https://www.youtube.com/embed/7r4xVDI2vho" },
      { title: "API Testing with Postman", url: "https://www.youtube.com/embed/VywxIQ2ZXw4" }
    ]
  },
  {
    id: "cicd",
    title: "CI/CD & Deployment",
    description: "Set up Continuous Integration and Deployment pipelines.",
    videos: [
      { title: "GitHub Actions Tutorial", url: "https://www.youtube.com/embed/R8_veQiYBjI" },
      { title: "Docker Crash Course", url: "https://www.youtube.com/embed/pTFZFxd4hOI" }
    ]
  },
  {
    id: "message-brokers",
    title: "Message Brokers",
    description: "Learn asynchronous communication using RabbitMQ or Kafka.",
    videos: [
      { title: "RabbitMQ Crash Course", url: "https://www.youtube.com/embed/O1DdJCWN1ag" },
      { title: "Apache Kafka Crash Course", url: "https://www.youtube.com/embed/U4y2R3kJnjQ" }
    ]
  },
  {
    id: "system-design",
    title: "System Design & Architecture",
    description: "Learn how to design scalable and distributed systems.",
    videos: [
      { title: "System Design Basics", url: "https://www.youtube.com/embed/bBTPZ9NdSk8" },
      { title: "Microservices Architecture", url: "https://www.youtube.com/embed/1xo-0gCVhCU" }
    ]
  }
];

export const devopsRoadmapData: RoadmapNode[] = [
  {
    id: "programming-language",
    title: "Programming Language",
    description: "Learn a scripting or programming language like Python, Go, or Ruby.",
    videos: [
      { title: "Python Crash Course", url: "https://www.youtube.com/embed/JJmcL1N2KQs" },
      { title: "Go Crash Course", url: "https://www.youtube.com/embed/YS4e4q9oBaU" }
    ]
  },
  {
    id: "os-linux",
    title: "Operating Systems & Linux",
    description: "Understand OS concepts and master Linux terminal commands.",
    videos: [
      { title: "Linux Crash Course", url: "https://www.youtube.com/embed/sWbUDq4S6Y8" },
      { title: "Operating Systems Basics", url: "https://www.youtube.com/embed/vBURTt97EkA" }
    ]
  },
  {
    id: "networking",
    title: "Networking & Security",
    description: "Learn OSI model, DNS, HTTP, SSL/TLS, and basic security concepts.",
    videos: [
      { title: "Networking Crash Course", url: "https://www.youtube.com/embed/qiQR5rYFCxQ" },
      { title: "Computer Networking Course", url: "https://www.youtube.com/embed/IPvYjXCsTg8" }
    ]
  },
  {
    id: "web-servers",
    title: "Server Management",
    description: "Learn how to configure web servers like Nginx or Apache.",
    videos: [
      { title: "Nginx Crash Course", url: "https://www.youtube.com/embed/9t9Mp0BGnyI" },
      { title: "Apache Web Server Tutorial", url: "https://www.youtube.com/embed/lRkIOtTtsH8" }
    ]
  },
  {
    id: "containers",
    title: "Containers",
    description: "Master containerization using Docker.",
    videos: [
      { title: "Docker Crash Course", url: "https://www.youtube.com/embed/pTFZFxd4hOI" },
      { title: "Docker Tutorial for Beginners", url: "https://www.youtube.com/embed/fqMOX6JJhGo" }
    ]
  },
  {
    id: "container-orchestration",
    title: "Container Orchestration",
    description: "Learn how to manage containers at scale with Kubernetes.",
    videos: [
      { title: "Kubernetes Crash Course", url: "https://www.youtube.com/embed/X48VuDVv0do" },
      { title: "Kubernetes Tutorial for Beginners", url: "https://www.youtube.com/embed/d6WC5n9G_sM" }
    ]
  },
  {
    id: "iac",
    title: "Infrastructure as Code",
    description: "Provision infrastructure using Terraform and Ansible.",
    videos: [
      { title: "Terraform Crash Course", url: "https://www.youtube.com/embed/l5k1ai_GBDE" },
      { title: "Ansible Crash Course", url: "https://www.youtube.com/embed/1id6ERvfozo" }
    ]
  },
  {
    id: "cicd",
    title: "CI/CD Platforms",
    description: "Automate testing and deployment pipelines using Jenkins, GitHub Actions, or GitLab CI.",
    videos: [
      { title: "Jenkins Crash Course", url: "https://www.youtube.com/embed/nCKxl7QFV20" },
      { title: "GitHub Actions Crash Course", url: "https://www.youtube.com/embed/R8_veQiYBjI" }
    ]
  },
  {
    id: "monitoring",
    title: "Infrastructure & App Monitoring",
    description: "Monitor resources and logs using Prometheus, Grafana, and ELK stack.",
    videos: [
      { title: "Prometheus Crash Course", url: "https://www.youtube.com/embed/h4Sl21AKiDg" },
      { title: "Grafana Tutorial", url: "https://www.youtube.com/embed/mENJp89bEaM" }
    ]
  },
  {
    id: "cloud-providers",
    title: "Cloud Providers",
    description: "Learn cloud services on AWS, Google Cloud, or Azure.",
    videos: [
      { title: "AWS Crash Course", url: "https://www.youtube.com/embed/k1RI5locZE4" },
      { title: "Azure Crash Course", url: "https://www.youtube.com/embed/NKEFWy4hH0w" }
    ]
  }
];

export const dataEngineerRoadmapData: RoadmapNode[] = [
  {
    id: "programming-language",
    title: "Programming Language",
    description: "Learn Python or Java/Scala for data engineering.",
    videos: [
      { title: "Python for Data Science", url: "https://www.youtube.com/embed/edxgKNgFzKQ" },
      { title: "Scala Crash Course", url: "https://www.youtube.com/embed/DzFt0YkZo8M" }
    ]
  },
  {
    id: "relational-databases",
    title: "SQL & Relational Databases",
    description: "Master advanced SQL, indexing, and database performance.",
    videos: [
      { title: "Advanced SQL Course", url: "https://www.youtube.com/embed/HXV3zeQKqGY" },
      { title: "PostgreSQL Tutorial", url: "https://www.youtube.com/embed/qw--VYLpxG4" }
    ]
  },
  {
    id: "data-warehouses",
    title: "Data Warehousing",
    description: "Learn about OLAP, Snowflake, BigQuery, or Redshift.",
    videos: [
      { title: "Data Warehouse Concepts", url: "https://www.youtube.com/embed/J3BjsNg0q7w" },
      { title: "Snowflake Crash Course", url: "https://www.youtube.com/embed/xN72L3P4q7o" }
    ]
  },
  {
    id: "nosql-databases",
    title: "NoSQL Databases",
    description: "Understand document, column-oriented, and graph databases.",
    videos: [
      { title: "NoSQL Databases Explained", url: "https://www.youtube.com/embed/0buKQHokLK8" },
      { title: "MongoDB Crash Course", url: "https://www.youtube.com/embed/ExcRbA7fy_A" }
    ]
  },
  {
    id: "data-lakes",
    title: "Data Lakes",
    description: "Learn about Hadoop, S3, Data Lakehouse, and Delta Lake.",
    videos: [
      { title: "Data Lake vs Data Warehouse", url: "https://www.youtube.com/embed/t0k8r2yIuXk" },
      { title: "Delta Lake Tutorial", url: "https://www.youtube.com/embed/C13Xy6sP8s0" }
    ]
  },
  {
    id: "batch-processing",
    title: "Batch Data Processing",
    description: "Learn distributed data processing with Apache Spark.",
    videos: [
      { title: "Apache Spark Crash Course", url: "https://www.youtube.com/embed/_1KAAGgsNq0" },
      { title: "PySpark Tutorial", url: "https://www.youtube.com/embed/O-A9KIn3o1w" }
    ]
  },
  {
    id: "stream-processing",
    title: "Stream Processing",
    description: "Learn real-time processing with Apache Kafka and Flink.",
    videos: [
      { title: "Apache Kafka Tutorial", url: "https://www.youtube.com/embed/U4y2R3kJnjQ" },
      { title: "Apache Flink Crash Course", url: "https://www.youtube.com/embed/2u3sHqB9Eio" }
    ]
  },
  {
    id: "etl-tools",
    title: "ETL & Orchestration",
    description: "Build data pipelines with Apache Airflow and dbt.",
    videos: [
      { title: "Apache Airflow Tutorial", url: "https://www.youtube.com/embed/K9AnJ9_ZAXE" },
      { title: "dbt (Data Build Tool) Crash Course", url: "https://www.youtube.com/embed/5A0Y_M0eJ0w" }
    ]
  },
  {
    id: "cloud-platforms",
    title: "Cloud Platforms for Data",
    description: "Learn AWS, GCP, or Azure data services.",
    videos: [
      { title: "AWS Data Engineering", url: "https://www.youtube.com/embed/k1RI5locZE4" },
      { title: "GCP Data Engineering", url: "https://www.youtube.com/embed/o0DqVlP8QcM" }
    ]
  },
  {
    id: "data-governance",
    title: "Data Governance & Security",
    description: "Understand data catalogs, compliance, and security.",
    videos: [
      { title: "Data Governance Basics", url: "https://www.youtube.com/embed/z44B_3W1_1w" },
      { title: "Data Security Strategies", url: "https://www.youtube.com/embed/uHw4yqK2uMw" }
    ]
  }
];

export const machineLearningRoadmapData: RoadmapNode[] = [
  {
    id: "mathematics",
    title: "Mathematics & Statistics",
    description: "Learn Linear Algebra, Calculus, and Probability & Statistics.",
    videos: [
      { title: "Linear Algebra for ML", url: "https://www.youtube.com/embed/JnTa9XtvmfI" },
      { title: "Statistics for Data Science", url: "https://www.youtube.com/embed/xxpc-HPKN28" }
    ]
  },
  {
    id: "programming",
    title: "Programming Fundamentals",
    description: "Master Python programming for data science and machine learning.",
    videos: [
      { title: "Python for Data Science", url: "https://www.youtube.com/embed/edxgKNgFzKQ" },
      { title: "Python OOP Crash Course", url: "https://www.youtube.com/embed/JeznW_7DlB0" }
    ]
  },
  {
    id: "data-libraries",
    title: "Data Handling Libraries",
    description: "Learn NumPy, Pandas, Matplotlib, and Seaborn for data manipulation and visualization.",
    videos: [
      { title: "Pandas Data Analysis", url: "https://www.youtube.com/embed/vmEHCJofslg" },
      { title: "NumPy Crash Course", url: "https://www.youtube.com/embed/QUT1VHiLmmI" }
    ]
  },
  {
    id: "ml-concepts",
    title: "Machine Learning Concepts",
    description: "Understand core ML concepts: Supervised, Unsupervised, and Reinforcement Learning.",
    videos: [
      { title: "Machine Learning Basics", url: "https://www.youtube.com/embed/ukzFI9rgwfU" },
      { title: "Types of Machine Learning", url: "https://www.youtube.com/embed/HcqpanDadyQ" }
    ]
  },
  {
    id: "supervised-learning",
    title: "Supervised Learning",
    description: "Learn Regression (Linear, Logistic) and Classification (Trees, SVM, KNN).",
    videos: [
      { title: "Linear Regression Explained", url: "https://www.youtube.com/embed/7ArmgS8NsLw" },
      { title: "Decision Trees & Random Forests", url: "https://www.youtube.com/embed/J4Wdy0Wc_xQ" }
    ]
  },
  {
    id: "unsupervised-learning",
    title: "Unsupervised Learning",
    description: "Learn Clustering (K-Means) and Dimensionality Reduction (PCA).",
    videos: [
      { title: "K-Means Clustering Explained", url: "https://www.youtube.com/embed/4b5d3muPQmA" },
      { title: "Principal Component Analysis (PCA)", url: "https://www.youtube.com/embed/FgakZw6K1QQ" }
    ]
  },
  {
    id: "deep-learning",
    title: "Deep Learning & Neural Networks",
    description: "Understand Artificial Neural Networks, Backpropagation, and Activation Functions.",
    videos: [
      { title: "Neural Networks Explained", url: "https://www.youtube.com/embed/aircAruvnKk" },
      { title: "Deep Learning Crash Course", url: "https://www.youtube.com/embed/VyWAvY2CF9c" }
    ]
  },
  {
    id: "dl-frameworks",
    title: "Deep Learning Frameworks",
    description: "Build models using TensorFlow, Keras, or PyTorch.",
    videos: [
      { title: "TensorFlow 2.0 Crash Course", url: "https://www.youtube.com/embed/tPYj3fFJGjk" },
      { title: "PyTorch Tutorial", url: "https://www.youtube.com/embed/GIsg-ZUy0MY" }
    ]
  },
  {
    id: "computer-vision",
    title: "Computer Vision (CNNs)",
    description: "Learn Convolutional Neural Networks for image recognition and object detection.",
    videos: [
      { title: "Convolutional Neural Networks Explained", url: "https://www.youtube.com/embed/YRhxdVk_sIs" },
      { title: "Computer Vision with OpenCV", url: "https://www.youtube.com/embed/oXlwWbU8l2o" }
    ]
  },
  {
    id: "nlp",
    title: "Natural Language Processing (RNNs & Transformers)",
    description: "Learn Recurrent Neural Networks, LSTMs, and Transformers for text data.",
    videos: [
      { title: "NLP Crash Course", url: "https://www.youtube.com/embed/xvqsFTUsOmc" },
      { title: "Transformers & Attention Mechanism", url: "https://www.youtube.com/embed/TQQlZhbC5ps" }
    ]
  },
  {
    id: "mlops",
    title: "MLOps & Deployment",
    description: "Learn how to deploy, monitor, and scale machine learning models.",
    videos: [
      { title: "MLOps Basics", url: "https://www.youtube.com/embed/s2AIEioJ_i0" },
      { title: "Model Deployment with Flask & Docker", url: "https://www.youtube.com/embed/bA7-PQruNd4" }
    ]
  }
];

export const aiEngineerRoadmapData: RoadmapNode[] = [
  {
    id: "programming-python",
    title: "Python & Fundamentals",
    description: "Master Python, the primary language for AI engineering.",
    videos: [
      { title: "Python for Data Science & AI", url: "https://www.youtube.com/embed/edxgKNgFzKQ" },
      { title: "Advanced Python Crash Course", url: "https://www.youtube.com/embed/JeznW_7DlB0" }
    ]
  },
  {
    id: "ml-dl-core",
    title: "Machine Learning & Deep Learning Core",
    description: "Understand core ML/DL concepts and frameworks like PyTorch or TensorFlow.",
    videos: [
      { title: "Machine Learning Crash Course", url: "https://www.youtube.com/embed/ukzFI9rgwfU" },
      { title: "PyTorch Crash Course", url: "https://www.youtube.com/embed/GIsg-ZUy0MY" }
    ]
  },
  {
    id: "llms-prompt-engineering",
    title: "LLMs & Prompt Engineering",
    description: "Learn how Large Language Models work and master Prompt Engineering.",
    videos: [
      { title: "Large Language Models Explained", url: "https://www.youtube.com/embed/zjkBMFhNj_g" },
      { title: "Prompt Engineering Course", url: "https://www.youtube.com/embed/jC4v5AS4RIM" }
    ]
  },
  {
    id: "fine-tuning",
    title: "Model Fine-Tuning",
    description: "Learn how to fine-tune open-source models using PEFT, LoRA, and QLoRA.",
    videos: [
      { title: "Fine-tuning LLMs Explained", url: "https://www.youtube.com/embed/eC6Hd1hFvos" },
      { title: "LoRA & QLoRA Tutorial", url: "https://www.youtube.com/embed/Us5ZFp16PaU" }
    ]
  },
  {
    id: "rag",
    title: "Retrieval Augmented Generation (RAG)",
    description: "Understand RAG architecture to build apps that chat with your data.",
    videos: [
      { title: "RAG Explained", url: "https://www.youtube.com/embed/T-D1OfcDW1M" },
      { title: "Build a RAG System", url: "https://www.youtube.com/embed/tcqEUSNCn8I" }
    ]
  },
  {
    id: "vector-databases",
    title: "Vector Databases",
    description: "Store and query embeddings using Pinecone, ChromaDB, or Weaviate.",
    videos: [
      { title: "Vector Databases Explained", url: "https://www.youtube.com/embed/klTvEwg3oJ4" },
      { title: "ChromaDB Crash Course", url: "https://www.youtube.com/embed/3yPBVii7Ct0" }
    ]
  },
  {
    id: "llm-frameworks",
    title: "LangChain & LlamaIndex",
    description: "Use AI frameworks to build complex LLM applications.",
    videos: [
      { title: "LangChain Crash Course", url: "https://www.youtube.com/embed/lG7Uxts9QXs" },
      { title: "LlamaIndex Tutorial", url: "https://www.youtube.com/embed/6mJpwF0_wXg" }
    ]
  },
  {
    id: "ai-agents",
    title: "AI Agents & Tool Use",
    description: "Build autonomous agents using AutoGPT, LangGraph, or CrewAI.",
    videos: [
      { title: "AI Agents Explained", url: "https://www.youtube.com/embed/F8NKVhkZZWI" },
      { title: "CrewAI Crash Course", url: "https://www.youtube.com/embed/sPzc6hMg7So" }
    ]
  },
  {
    id: "deployment",
    title: "Model Deployment & APIs",
    description: "Deploy AI models using FastAPI, Docker, and Hugging Face Spaces.",
    videos: [
      { title: "FastAPI Crash Course", url: "https://www.youtube.com/embed/VQO8Tg4gP8E" },
      { title: "Deploying Models to Hugging Face", url: "https://www.youtube.com/embed/1pedJ1_G2P4" }
    ]
  },
  {
    id: "ai-ethics",
    title: "AI Ethics & Safety",
    description: "Understand AI bias, safety guardrails, and responsible AI practices.",
    videos: [
      { title: "AI Ethics & Bias", url: "https://www.youtube.com/embed/8bph1iEwzK8" },
      { title: "AI Safety and Alignment", url: "https://www.youtube.com/embed/p1oYtL3J3p8" }
    ]
  }
];


export const cybersecurityRoadmapData: RoadmapNode[] = [
  {
    id: "it-fundamentals",
    title: "IT Fundamentals & Hardware",
    description: "Learn the basics of computer hardware, operating systems, and IT infrastructure.",
    videos: [
      { title: "CompTIA IT Fundamentals", url: "https://www.youtube.com/embed/bNymE5t2vEA" },
      { title: "Computer Hardware Basics", url: "https://www.youtube.com/embed/ZtqBQ6hwIHA" }
    ]
  },
  {
    id: "networking",
    title: "Networking Concepts",
    description: "Understand the OSI Model, TCP/IP suite, and network protocols.",
    videos: [
      { title: "Computer Networking Complete Course", url: "https://www.youtube.com/embed/IPvYjXCsTg8" },
      { title: "Subnetting Explained", url: "https://www.youtube.com/embed/s_Ntt6eTN94" }
    ]
  },
  {
    id: "linux-skills",
    title: "Linux & Command Line",
    description: "Master Linux terminal commands, file permissions, and system administration.",
    videos: [
      { title: "Linux for Ethical Hackers", url: "https://www.youtube.com/embed/lZAoFs75_cs" },
      { title: "Bash Scripting Basics", url: "https://www.youtube.com/embed/tK9Oc6AEnxc" }
    ]
  },
  {
    id: "programming",
    title: "Scripting & Programming",
    description: "Learn Python or PowerShell to automate tasks and write custom scripts.",
    videos: [
      { title: "Python for Cybersecurity", url: "https://www.youtube.com/embed/D3h0o-a4k8M" },
      { title: "PowerShell for Beginners", url: "https://www.youtube.com/embed/UVNdZXQzJnA" }
    ]
  },
  {
    id: "security-foundations",
    title: "Security Foundations",
    description: "Learn about the CIA Triad, risk management, and basic cryptography.",
    videos: [
      { title: "Cybersecurity Basics & CIA Triad", url: "https://www.youtube.com/embed/inWWhr5tnEA" },
      { title: "Cryptography Basics", url: "https://www.youtube.com/embed/jhXCTbFnK8o" }
    ]
  },
  {
    id: "network-security",
    title: "Network Security",
    description: "Understand firewalls, IDS/IPS, VPNs, and wireless security.",
    videos: [
      { title: "Firewalls Explained", url: "https://www.youtube.com/embed/kDEX1HXybrU" },
      { title: "Network Security Concepts", url: "https://www.youtube.com/embed/_tW8rI0tYxY" }
    ]
  },
  {
    id: "iam",
    title: "Identity & Access Management",
    description: "Learn about authentication, authorization, Active Directory, and OAuth.",
    videos: [
      { title: "IAM Explained", url: "https://www.youtube.com/embed/c8jE279Rofg" },
      { title: "Active Directory Basics", url: "https://www.youtube.com/embed/p1A1d_v6MFI" }
    ]
  },
  {
    id: "web-security",
    title: "Web Application Security",
    description: "Explore the OWASP Top 10 vulnerabilities (SQLi, XSS) and use tools like Burp Suite.",
    videos: [
      { title: "OWASP Top 10 Explained", url: "https://www.youtube.com/embed/y5gR1h_wUxE" },
      { title: "Burp Suite Tutorial", url: "https://www.youtube.com/embed/2_YIe9_0z8A" }
    ]
  },
  {
    id: "penetration-testing",
    title: "Penetration Testing",
    description: "Learn ethical hacking methodologies, Metasploit, and Kali Linux.",
    videos: [
      { title: "Ethical Hacking Full Course", url: "https://www.youtube.com/embed/3Kq1MIfTWCE" },
      { title: "Metasploit Crash Course", url: "https://www.youtube.com/embed/8l1FQJmO3Sg" }
    ]
  },
  {
    id: "incident-response",
    title: "Incident Response & Forensics",
    description: "Respond to security incidents, analyze malware, and use SIEM tools like Splunk.",
    videos: [
      { title: "Incident Response Process", url: "https://www.youtube.com/embed/9G0R0kH2Vww" },
      { title: "Splunk Tutorial", url: "https://www.youtube.com/embed/Kj_0E1O-b0k" }
    ]
  },
  {
    id: "cloud-security",
    title: "Cloud Security",
    description: "Understand how to secure environments in AWS, Azure, and Google Cloud.",
    videos: [
      { title: "Cloud Security Basics", url: "https://www.youtube.com/embed/T6_y4U-rYqg" },
      { title: "AWS Security Concepts", url: "https://www.youtube.com/embed/XqE-3j_gAuk" }
    ]
  }
];

export type Certification = {
  title: string;
  provider: string;
  description: string;
  duration: string;
  url: string;
  image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: 'Free' | 'Paid';
  type: 'Certificate' | 'Bootcamp' | 'Course' | 'Specialization';
};

export const pathwayCertifications: Record<string, Certification[]> = {
  'frontend': [
    { title: 'Meta Front-End Developer Professional Certificate', provider: 'Meta', description: 'Launch your career as a front-end developer. Build job-ready skills for an in-demand career and earn a credential from Meta.', duration: '7 months', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Responsive Web Design', provider: 'freeCodeCamp', description: 'Learn the languages that developers use to build webpages: HTML for content, and CSS for design. Build 5 interactive projects.', duration: '300 hours', url: 'https://www.freecodecamp.org/learn/responsive-web-design/', image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.png', difficulty: 'Beginner', price: 'Free', type: 'Certificate' },
    { title: 'CS50\'s Web Programming with Python and JavaScript', provider: 'Harvard University', description: 'Dive more deeply into the design and implementation of web apps with Python, JavaScript, and SQL using frameworks like Django and React.', duration: '12 weeks', url: 'https://www.edx.org/course/cs50s-web-programming-with-python-and-javascript', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/2560px-Harvard_University_logo.svg.png', difficulty: 'Intermediate', price: 'Free', type: 'Course' },
    { title: 'Front-End Web Development with React', provider: 'HKUST', description: 'Explore Javascript based front-end application development, and in particular the React library.', duration: '4 weeks', url: 'https://www.coursera.org/learn/front-end-react', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/HKUST_logo.svg/1200px-HKUST_logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Course' },
    { title: 'JavaScript Algorithms and Data Structures', provider: 'freeCodeCamp', description: 'Learn fundamentals of JavaScript including variables, arrays, objects, loops, and functions.', duration: '300 hours', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.png', difficulty: 'Beginner', price: 'Free', type: 'Certificate' },
    { title: 'Advanced React', provider: 'Meta', description: 'Dive deep into React concepts including hooks, context API, custom hooks, and performance optimization.', duration: '26 hours', url: 'https://www.coursera.org/learn/advanced-react', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png', difficulty: 'Advanced', price: 'Paid', type: 'Course' }
  ],
  'backend': [
    { title: 'Meta Back-End Developer Professional Certificate', provider: 'Meta', description: 'Launch your career as a back-end developer. Build job-ready skills and earn a credential from Meta.', duration: '8 months', url: 'https://www.coursera.org/professional-certificates/meta-back-end-developer', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'IBM Backend Development Professional Certificate', provider: 'IBM', description: 'Master backend web development using Node.js, Express, and databases.', duration: '6 months', url: 'https://www.coursera.org/professional-certificates/ibm-backend-development', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1024px-IBM_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Back End Development and APIs', provider: 'freeCodeCamp', description: 'Learn how to write back end apps with Node.js and npm. Build web applications with the Express framework.', duration: '300 hours', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.png', difficulty: 'Intermediate', price: 'Free', type: 'Certificate' },
    { title: 'Server-side Development with NodeJS, Express and MongoDB', provider: 'HKUST', description: 'Learn backend concepts, Express framework, and MongoDB integration for robust web applications.', duration: '4 weeks', url: 'https://www.coursera.org/learn/server-side-nodejs', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/HKUST_logo.svg/1200px-HKUST_logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Course' },
    { title: 'Designing RESTful APIs', provider: 'Udacity', description: 'Learn how to design, develop, and document REST APIs.', duration: '3 weeks', url: 'https://www.udacity.com/course/designing-restful-apis--ud388', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Udacity_logo.png/1200px-Udacity_logo.png', difficulty: 'Intermediate', price: 'Free', type: 'Course' },
    { title: 'Microservices with Node JS and React', provider: 'Udemy', description: 'Build, deploy, and scale an E-Commerce app using Microservices built with Node, React, Docker and Kubernetes.', duration: '54 hours', url: 'https://www.udemy.com/course/microservices-with-node-js-and-react/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/2560px-Udemy_logo.svg.png', difficulty: 'Advanced', price: 'Paid', type: 'Course' }
  ],
  'full-stack': [
    { title: 'IBM Full Stack Software Developer Professional Certificate', provider: 'IBM', description: 'Master Cloud Native and Full Stack Development using hands-on projects.', duration: '14 months', url: 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1024px-IBM_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Full-Stack Web Development with React Specialization', provider: 'HKUST', description: 'Learn front-end and back-end development to build complete web applications.', duration: '4 months', url: 'https://www.coursera.org/specializations/full-stack-react', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/HKUST_logo.svg/1200px-HKUST_logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Specialization' },
    { title: 'The Complete 2024 Web Development Bootcamp', provider: 'Udemy', description: 'Become a Full-Stack Web Developer with just one course. HTML, CSS, Javascript, Node, React, PostgreSQL.', duration: '65 hours', url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/2560px-Udemy_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Bootcamp' },
    { title: 'CS50\'s Introduction to Computer Science', provider: 'Harvard University', description: 'An introduction to the intellectual enterprises of computer science and the art of programming.', duration: '12 weeks', url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/2560px-Harvard_University_logo.svg.png', difficulty: 'Beginner', price: 'Free', type: 'Course' },
    { title: 'Legacy Full Stack', provider: 'freeCodeCamp', description: 'A massive comprehensive curriculum taking you from zero to full stack developer.', duration: '1800 hours', url: 'https://www.freecodecamp.org/learn', image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/FreeCodeCamp_logo.png', difficulty: 'Intermediate', price: 'Free', type: 'Certificate' }
  ],
  'devops': [
    { title: 'AWS Certified DevOps Engineer – Professional', provider: 'AWS', description: 'Validates technical expertise in provisioning, operating, and managing distributed application systems on the AWS platform.', duration: 'Self-paced', url: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png', difficulty: 'Advanced', price: 'Paid', type: 'Certificate' },
    { title: 'IBM DevOps and Software Engineering Professional Certificate', provider: 'IBM', description: 'Start your career in DevOps and Software Engineering. Master Agile, CI/CD, Cloud Native and more.', duration: '10 months', url: 'https://www.coursera.org/professional-certificates/devops-and-software-engineering', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1024px-IBM_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Docker for the Absolute Beginner', provider: 'Udemy', description: 'Learn Docker with Hands On Coding Exercises. For beginners in DevOps.', duration: '5 hours', url: 'https://www.udemy.com/course/learn-docker/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/2560px-Udemy_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Course' },
    { title: 'Kubernetes for the Absolute Beginners', provider: 'Udemy', description: 'Learn Kubernetes in simple, easy and fun way with hands-on coding exercises.', duration: '6 hours', url: 'https://www.udemy.com/course/learn-kubernetes/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/2560px-Udemy_logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Course' },
    { title: 'Google Cloud Professional Cloud DevOps Engineer', provider: 'Google Cloud', description: 'A Cloud DevOps Engineer is responsible for efficient development operations that can balance service reliability and delivery speed.', duration: 'Self-paced', url: 'https://cloud.google.com/learn/certification/cloud-devops-engineer', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Google_Cloud_logo.svg/2560px-Google_Cloud_logo.svg.png', difficulty: 'Advanced', price: 'Paid', type: 'Certificate' }
  ],
  'machine-learning': [
    { title: 'Machine Learning Specialization', provider: 'DeepLearning.AI', description: 'A foundational online program created by Andrew Ng to master ML concepts.', duration: '2 months', url: 'https://www.coursera.org/specializations/machine-learning-introduction', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/DeepLearning.AI_Logo.png/1200px-DeepLearning.AI_Logo.png', difficulty: 'Beginner', price: 'Paid', type: 'Specialization' },
    { title: 'Google Data Analytics Professional Certificate', provider: 'Google', description: 'Get professional training designed by Google and learn data analytics.', duration: '6 months', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Machine Learning Engineering for Production (MLOps)', provider: 'DeepLearning.AI', description: 'Learn how to conceptualize, build, and maintain integrated systems that continuously operate in production.', duration: '4 months', url: 'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/DeepLearning.AI_Logo.png/1200px-DeepLearning.AI_Logo.png', difficulty: 'Advanced', price: 'Paid', type: 'Specialization' },
    { title: 'Machine Learning Crash Course', provider: 'Google', description: 'Google\'s fast-paced, practical introduction to machine learning, featuring a series of lessons with video lectures, real-world case studies, and hands-on practice exercises.', duration: '15 hours', url: 'https://developers.google.com/machine-learning/crash-course', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png', difficulty: 'Intermediate', price: 'Free', type: 'Course' },
    { title: 'Mathematics for Machine Learning and Data Science', provider: 'DeepLearning.AI', description: 'An intuitive, foundational math program covering linear algebra, calculus, and statistics.', duration: '3 months', url: 'https://www.coursera.org/specializations/mathematics-for-machine-learning-and-data-science', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/DeepLearning.AI_Logo.png/1200px-DeepLearning.AI_Logo.png', difficulty: 'Beginner', price: 'Paid', type: 'Specialization' }
  ],
  'ai-engineer': [
    { title: 'IBM AI Engineering Professional Certificate', provider: 'IBM', description: 'Learn AI and build deep learning models. Prepare for a career as an AI Engineer.', duration: '6 months', url: 'https://www.coursera.org/professional-certificates/ai-engineer', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1024px-IBM_logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Certificate' },
    { title: 'Deep Learning Specialization', provider: 'DeepLearning.AI', description: 'Master deep learning, and break into AI. Taught by Andrew Ng.', duration: '5 months', url: 'https://www.coursera.org/specializations/deep-learning', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/DeepLearning.AI_Logo.png/1200px-DeepLearning.AI_Logo.png', difficulty: 'Intermediate', price: 'Paid', type: 'Specialization' },
    { title: 'Generative AI with Large Language Models', provider: 'AWS', description: 'Gain foundational knowledge, practical skills, and a functional understanding of how LLMs work.', duration: '3 weeks', url: 'https://www.coursera.org/learn/generative-ai-with-llms', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Course' },
    { title: 'Natural Language Processing Specialization', provider: 'DeepLearning.AI', description: 'Break into the NLP space. Master foundational NLP tasks using deep learning.', duration: '4 months', url: 'https://www.coursera.org/specializations/natural-language-processing', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/DeepLearning.AI_Logo.png/1200px-DeepLearning.AI_Logo.png', difficulty: 'Intermediate', price: 'Paid', type: 'Specialization' },
    { title: 'Artificial Intelligence A-Z 2024: Build 7 AI', provider: 'Udemy', description: 'Combine the power of Data Science, Machine Learning and Deep Learning to create powerful AI for Real-World applications!', duration: '17 hours', url: 'https://www.udemy.com/course/artificial-intelligence-az/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/2560px-Udemy_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Bootcamp' }
  ],
  'data-engineer': [
    { title: 'IBM Data Engineering Professional Certificate', provider: 'IBM', description: 'Build a career in data engineering. Master big data, SQL, Python, and relational databases.', duration: '5 months', url: 'https://www.coursera.org/professional-certificates/ibm-data-engineer', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1024px-IBM_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Google Cloud Professional Data Engineer', provider: 'Google Cloud', description: 'Validates your ability to design, build, operationalize, secure, and monitor data processing systems.', duration: 'Self-paced', url: 'https://cloud.google.com/learn/certification/data-engineer', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Google_Cloud_logo.svg/2560px-Google_Cloud_logo.svg.png', difficulty: 'Advanced', price: 'Paid', type: 'Certificate' },
    { title: 'Data Engineering with AWS', provider: 'Udacity', description: 'Learn to design data models, build data warehouses and data lakes, automate data pipelines, and work with massive datasets.', duration: '4 months', url: 'https://www.udacity.com/course/data-engineer-nanodegree--nd027', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Udacity_logo.png/1200px-Udacity_logo.png', difficulty: 'Intermediate', price: 'Paid', type: 'Bootcamp' },
    { title: 'Big Data Specialization', provider: 'UC San Diego', description: 'Drive better business decisions with an overview of how big data is organized, analyzed, and interpreted.', duration: '6 months', url: 'https://www.coursera.org/specializations/big-data', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/University_of_California%._San_Diego_seal.svg/1200px-University_of_California%._San_Diego_seal.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Specialization' },
    { title: 'Apache Spark 3 - Databricks Certified Associate Developer', provider: 'Udemy', description: 'Prepare for the Databricks Certified Associate Developer for Apache Spark 3.0 exam.', duration: '11 hours', url: 'https://www.udemy.com/course/databricks-certified-developer-for-apache-spark/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/2560px-Udemy_logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Course' }
  ],
  'cybersecurity': [
    { title: 'Google Cybersecurity Professional Certificate', provider: 'Google', description: 'Launch your career in cybersecurity. Build job-ready skills and earn a credential from Google.', duration: '6 months', url: 'https://www.coursera.org/professional-certificates/google-cybersecurity', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'CompTIA Security+', provider: 'CompTIA', description: 'A global certification that validates the baseline skills necessary to perform core security functions.', duration: 'Self-paced', url: 'https://www.comptia.org/certifications/security', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/CompTIA_logo.svg/2560px-CompTIA_logo.svg.png', difficulty: 'Intermediate', price: 'Paid', type: 'Certificate' },
    { title: 'IBM Cybersecurity Analyst Professional Certificate', provider: 'IBM', description: 'Launch your career in cybersecurity. Get job-ready with an immersive program.', duration: '8 months', url: 'https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/1024px-IBM_logo.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Cisco CyberOps Associate', provider: 'Cisco', description: 'Start your career as a Cybersecurity Operations Analyst. Master the skills to monitor, detect, and respond to threats.', duration: 'Self-paced', url: 'https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/cyberops-associate.html', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/2560px-Cisco_logo_blue_2016.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Certificate' },
    { title: 'Certified Ethical Hacker (CEH)', provider: 'EC-Council', description: 'Learn how to look for weaknesses and vulnerabilities in target systems and use the same knowledge and tools as a malicious hacker.', duration: 'Self-paced', url: 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/EC-Council_logo.svg/1200px-EC-Council_logo.svg.png', difficulty: 'Advanced', price: 'Paid', type: 'Certificate' },
    { title: 'Information Security: Context and Introduction', provider: 'University of London', description: 'Explore the basic concepts of information security and cryptography.', duration: '5 weeks', url: 'https://www.coursera.org/learn/information-security-data', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/University_of_London_shield.svg/1200px-University_of_London_shield.svg.png', difficulty: 'Beginner', price: 'Paid', type: 'Course' }
  ]
};
