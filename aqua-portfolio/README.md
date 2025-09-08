# AquaPortfolio — Modern QA Developer Portfolio

A beautiful, performant portfolio website for **Petr Kindlmann** featuring an aqua theme with glass morphism, smooth animations, and comprehensive test coverage.

## 🌊 Features

- **Aqua Theme Design**: Clean, modern design with water-inspired visuals
- **Interactive Animations**: Smooth Framer Motion animations with floating particles and memory leak prevention
- **Responsive Design**: Optimized for all devices and screen sizes with mobile-first approach
- **Performance First**: Built with Next.js 15, optimized for Core Web Vitals with proper image optimization
- **Comprehensive Testing**: Playwright test suite with smoke, blog, and case study tests
- **Accessible**: WCAG compliant with proper semantic HTML and reduced motion support
- **SEO Optimized**: Complete meta tags, Open Graph images (PNG), structured data, and dynamic sitemap
- **Error Boundaries**: Production-ready error handling with user-friendly fallbacks
- **Environment Configuration**: Type-safe environment variables with validation

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Animations**: Framer Motion, CSS animations
- **Testing**: Playwright (cross-browser automation)
- **Deployment**: Netlify with automatic builds
- **Performance**: Turbopack, image optimization, font optimization

## 🏗️ Project Structure

```
aqua-portfolio/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── sections/       # Page sections
│   │   └── ParticleCanvas.tsx
│   ├── data/               # JSON content files
│   └── lib/                # Utilities
├── tests/                   # Playwright tests
├── public/                  # Static assets
└── tailwind.config.ts       # Tailwind configuration
```

## 🎨 Design System

### Color Palette
- **Primary**: Aqua shades (hsl(206 83% 55%))
- **Secondary**: Light blues and whites
- **Accent**: Gradient from aqua-600 to aqua-400
- **Background**: Light aqua tints with transparency

### Typography
- **Display**: Inter Tight for headings
- **Body**: Inter for content
- **Monospace**: Used in code examples

## 🧪 Testing Strategy

### Playwright Test Suite
- **Smoke Tests**: Critical user journeys and core functionality
- **Blog Tests**: Blog page functionality and content validation
- **Case Studies Tests**: Case study pages and interactions
- **Responsive Tests**: Multiple viewport sizes and mobile optimization
- **Performance Tests**: Load time budgets and Core Web Vitals
- **Accessibility Tests**: Basic WCAG compliance
- **Cross-browser**: Chrome, Firefox, Safari, Mobile

```bash
# Run all tests
npm run test

# Smoke tests only
npm run test:smoke

# Debug mode
npm run test:debug

# UI mode
npm run test:ui
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aqua-portfolio

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Environment Setup

```bash
# Development
npm run dev     # Starts on http://localhost:3010

# Testing
npm run test    # Run Playwright tests

# Production Build
npm run build   # Build optimized bundle
npm run start   # Start production server
```

## 📊 Performance

### Core Web Vitals Target
- **LCP**: < 2.5s
- **FID**: < 100ms  
- **CLS**: < 0.1

### Optimization Features
- Next.js Image optimization
- Font optimization with Inter
- Turbopack for faster builds
- Code splitting and lazy loading
- Efficient CSS with Tailwind CSS v4

## 🔧 Customization

### Content Updates
Edit JSON files in `/src/data/`:
- `projects.json` - Project portfolio items
- `skills.json` - Technical skills and tools
- `faq.json` - Frequently asked questions

### Styling Changes
- Modify `tailwind.config.ts` for design tokens
- Update CSS variables in `globals.css`
- Customize components in `/src/components/`

## 🌐 Deployment

### Netlify (Recommended)
1. Connect repository to Netlify
2. Build settings are configured in `netlify.toml`
3. Automatic deploys on push to main branch

### Vercel
1. Import project to Vercel
2. Zero-config deployment with Next.js
3. Automatic preview deployments

## 👋 Contact

**Petr Kindlmann**
- Email: thepetr@gmail.com
- Location: České Budějovice, Czech Republic

---

Built with 💙 using Next.js, TypeScript, and Tailwind CSS.
