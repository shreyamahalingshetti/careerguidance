# Career Guidance App - Simple Setup

## 📁 Project Structure

```
project-1/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login/Register page
│   ├── dashboard/
│   │   └── page.tsx          # Dashboard with 3 cards
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home (redirects to login)
│   ├── providers.tsx          # Theme provider
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies (if not already installed)

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open Browser

Navigate to: **http://localhost:3000**

## 📱 Pages

### 1. Login Page (`/login`)
- **Email** and **Password** input fields
- **Login** and **Register** buttons
- Toggle between login/register modes
- Simple form validation
- Clicking Login/Register navigates to dashboard

### 2. Dashboard Page (`/dashboard`)
- Header: "Career Guidance Dashboard"
- Three clickable cards:
  - **10th Standard Students**
  - **12th Standard Students**
  - **Technical Group**
- Responsive grid layout
- Hover effects and animations

## 🎨 Features

- ✅ Clean, modern UI with Tailwind CSS
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support (via theme provider)
- ✅ Smooth transitions and hover effects
- ✅ No backend required - pure UI
- ✅ Simple state management with useState

## 🛠️ Technologies Used

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **shadcn/ui** components
- **Lucide React** icons
- **TypeScript**

## 📝 Notes

- No authentication logic - clicking Login/Register just navigates to dashboard
- No API calls - pure frontend UI
- Cards are clickable but navigation is commented out (ready for future implementation)
- All styling uses Tailwind CSS utility classes

## 🎯 Next Steps (Future Enhancements)

- Add navigation to individual group pages
- Add career listings for each group
- Add search and filter functionality
- Add user authentication
- Add database integration

---

**Ready to use!** Just run `npm run dev` and visit http://localhost:3000

