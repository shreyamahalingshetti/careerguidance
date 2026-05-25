# Task Management System

A modern, full-stack task management application built with Next.js 14, featuring authentication, CRUD operations, search, filtering, pagination, and dark mode support.

## 🚀 Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React Server + Client Components**
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Zustand** - Client state management
- **NextAuth.js** - Authentication
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** (Route Handlers)
- **NextAuth.js** - Authentication & session management
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

### Database
- **Prisma ORM** - Database toolkit
- **PostgreSQL** (primary) or **SQLite** (fallback)

## 📁 Project Structure

```
project-1/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts          # NextAuth handler
│   │   │   └── register/
│   │   │       └── route.ts          # User registration
│   │   └── tasks/
│   │       ├── [id]/
│   │       │   └── route.ts          # GET, PATCH, DELETE task
│   │       └── route.ts              # GET, POST tasks
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard with CRUD
│   ├── login/
│   │   └── page.tsx                  # Login/Register page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page (redirects)
│   ├── providers.tsx                 # Providers wrapper
│   └── globals.css                   # Global styles
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── Navbar.tsx                    # Navigation bar
│   ├── Footer.tsx                    # Footer
│   ├── theme-provider.tsx            # Dark mode provider
│   └── theme-toggle.tsx              # Theme switcher
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth configuration
│   ├── api-helpers.ts                # API utility functions
│   ├── store.ts                      # Zustand store
│   └── utils.ts                      # Utility functions
├── prisma/
│   └── schema.prisma                 # Database schema
└── README.md
```

## 🎯 Features

### ✅ Core Features
- **User Authentication**
  - Registration with email/password
  - Login with NextAuth.js
  - Protected routes
  - Session management

- **Task Management (CRUD)**
  - Create new tasks
  - Read/list all tasks
  - Update existing tasks
  - Delete tasks
  - Task ownership (users can only manage their own tasks)

- **Task Properties**
  - Title (required)
  - Description (optional)
  - Status: TODO, IN_PROGRESS, COMPLETED, CANCELLED
  - Priority: LOW, MEDIUM, HIGH, URGENT
  - Due date (optional)

### 🎨 UI/UX Features
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Dark Mode** - Toggle between light and dark themes
- **Search** - Real-time search across task titles and descriptions
- **Filtering** - Filter by status and priority
- **Pagination** - Navigate through large task lists
- **Loading States** - Skeleton loaders for better UX
- **Toast Notifications** - Success and error messages
- **Modern UI** - Clean, professional design with shadcn/ui

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL (or use SQLite for development)

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
# For SQLite: DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

**For PostgreSQL:**
1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run migrations:

```bash
npm run db:push
# or
npm run db:migrate
```

**For SQLite (Development):**
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```
3. Run:
   ```bash
   npm run db:push
   ```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login, logout, session)

### Tasks
- `GET /api/tasks` - List tasks (with query params: page, limit, search, status, priority)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get single task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Query Parameters (GET /api/tasks)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in title/description
- `status` - Filter by status (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}
```

### Task Model
```prisma
model Task {
  id          String      @id @default(cuid())
  title       String
  description String?
  status      TaskStatus  @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  userId      String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  user        User        @relation(fields: [userId], references: [id])
}
```

## 🎨 Customization

### Adding New Task Fields
1. Update `prisma/schema.prisma`
2. Run `npm run db:push`
3. Update API routes validation in `app/api/tasks/route.ts`
4. Update dashboard form in `app/dashboard/page.tsx`

### Styling
- Tailwind CSS configuration: `tailwind.config.ts`
- Global styles: `app/globals.css`
- Theme colors: Defined in `globals.css` CSS variables

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
- Ensure Node.js 18+ is available
- Set environment variables
- Run `npm run build` and `npm start`

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema changes to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based session management
- Protected API routes (authentication required)
- User ownership validation (users can only access their own tasks)
- Input validation with Zod
- SQL injection protection (Prisma)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database server is running
- Check network/firewall settings

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies

### Build Errors
- Run `npx prisma generate` before building
- Ensure all environment variables are set
- Check Node.js version (18+)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

For support, please open an issue in the repository.

---

**Built with ❤️ using Next.js, Prisma, and NextAuth.js**

