# CampusConnect Frontend

A modern, production-ready frontend for CampusConnect built with Next.js 14, TypeScript, and Tailwind CSS.

## 🎨 Design Features

- **Distinctive Aesthetics**: Custom color scheme with yellow (#FDB022) and blue (#3B82F6) accents
- **Unique Typography**: Bricolage Grotesque (display) + Outfit (body) fonts
- **Smooth Animations**: Fade-in, float, hover effects with Framer Motion support
- **Dark Theme**: Professional dark mode with glass morphism effects
- **Responsive**: Mobile-first design with seamless tablet and desktop experiences

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env.local file
# Add: NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Features Implemented

### Landing Page (Complete)
- ✅ Hero section with animated background
- ✅ Features grid with icon cards
- ✅ How It Works timeline
- ✅ Testimonials section
- ✅ Call-to-action section
- ✅ Responsive navigation
- ✅ Footer with social links

### Components
- ✅ Navigation with auth state
- ✅ Footer component
- ✅ Animation utilities
- ✅ Glass morphism effects

### Core Setup
- ✅ API client with JWT interceptors
- ✅ Zustand auth store
- ✅ TanStack Query provider
- ✅ TypeScript types for all backend models
- ✅ Custom CSS animations and themes

## 📁 Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── providers.tsx       # Query provider
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Navigation.tsx      # Header navigation
│   │   └── Footer.tsx          # Footer component
│   ├── lib/
│   │   └── api-client.ts       # Axios instance
│   ├── store/
│   │   └── auth-store.ts       # Zustand auth store
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── hooks/                  # Custom React hooks (future)
├── public/                     # Static assets
└── package.json
```

## 🎨 Theme Colors

```css
--primary-yellow: #FDB022
--primary-blue: #3B82F6
--dark-bg: #0A0E27
--dark-card: #12172E
--dark-border: #1E2542
--text-primary: #FFFFFF
--text-secondary: #A0AEC0
```

## 🚀 Next Steps

Pages to be implemented:
- [ ] Login/Register pages
- [ ] Dashboard
- [ ] Events listing and details
- [ ] Teams finder and management
- [ ] Marketplace
- [ ] User profile
- [ ] Admin panel

## 📝 Development Notes

- All API calls should use the `apiClient` from `lib/api-client.ts`
- JWT tokens are automatically added to requests
- Auth state is managed by Zustand and persisted to localStorage
- Use TanStack Query for server state management
- Follow the SKILL.md guidelines for distinctive design

## 🎯 Running with Backend

Make sure the backend server is running on `http://localhost:5000`:

```bash
# In the server directory
npm run dev
```

Then start the frontend:

```bash
# In the client directory
npm run dev
```

Visit `http://localhost:3000` to see the landing page!
