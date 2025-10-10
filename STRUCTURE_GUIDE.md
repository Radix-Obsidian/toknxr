# TokNxr Project Structure Guide

## 🏗️ Colocation Principles Applied

This project follows **colocation principles** to improve code organization and maintainability. Code is placed closer to where it's used, making the codebase more intuitive and easier to navigate.

## 📁 Current Structure

```
src/
├── app/                           # Next.js App Router
│   ├── dashboard/                 # Dashboard route
│   │   ├── _components/           # Dashboard-specific components
│   │   │   ├── DashboardNav.tsx   # Navigation for dashboard
│   │   │   ├── StatsCards.tsx     # Statistics display cards
│   │   │   ├── InteractionTracker.tsx # Interaction tracking UI
│   │   │   ├── InteractionHistory.tsx # History table
│   │   │   └── index.ts           # Barrel exports
│   │   ├── _hooks/                # Dashboard-specific hooks
│   │   │   ├── useDashboardData.ts # Data fetching logic
│   │   │   └── index.ts           # Barrel exports
│   │   ├── _types/                # Dashboard-specific types
│   │   │   ├── dashboard.ts       # TypeScript interfaces
│   │   │   └── index.ts           # Barrel exports
│   │   └── page.tsx               # Dashboard page component
│   ├── profile/                   # Profile route
│   │   ├── _components/           # Profile-specific components
│   │   │   └── ProfileNav.tsx     # Navigation for profile
│   │   └── page.tsx               # Profile page component
│   ├── cli-login/                 # CLI login route
│   │   └── page.tsx
│   ├── tracker/                   # Tracker route
│   │   └── page.tsx
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles
├── components/                    # Shared components
│   ├── auth/                      # Authentication components
│   │   ├── AuthGuard.tsx
│   │   ├── AuthModal.tsx
│   │   ├── LoginForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── SignupForm.tsx
│   │   ├── UserMenu.tsx
│   │   └── UserProfile.tsx
│   └── layout/                    # Layout components
│       └── AppNav.tsx             # Shared navigation component
├── contexts/                      # React contexts
│   └── AuthContext.tsx
├── hooks/                         # Shared hooks
│   └── useAuth.ts
├── lib/                          # Utilities and configurations

├── dataconnect-generated/        # Generated GraphQL client
├── supabase.ts                   # Supabase configuration
└── middleware.ts                 # Next.js middleware
```

## 🎯 Colocation Benefits

### 1. **Route-Specific Organization**
- Components used only in `/dashboard` are in `src/app/dashboard/_components/`
- Dashboard-specific logic is in `src/app/dashboard/_hooks/`
- Dashboard types are in `src/app/dashboard/_types/`

### 2. **Private Folders (Underscore Prefix)**
- `_components/`, `_hooks/`, `_types/` are private folders
- They don't create routes in Next.js App Router
- Clear indication that these are internal to the route

### 3. **Shared vs Route-Specific**
- **Shared**: `src/components/auth/` - used across multiple routes
- **Route-specific**: `src/app/dashboard/_components/` - only used in dashboard

### 4. **Barrel Exports**
- `index.ts` files provide clean imports
- `import { DashboardNav, StatsCards } from './_components'`
- Easier refactoring and better developer experience

## 📋 Guidelines for Adding New Features

### Adding Dashboard Features
```bash
# New component
src/app/dashboard/_components/NewFeature.tsx

# New hook
src/app/dashboard/_hooks/useNewFeature.ts

# New types
src/app/dashboard/_types/newFeature.ts

# Update barrel exports
src/app/dashboard/_components/index.ts
src/app/dashboard/_hooks/index.ts
src/app/dashboard/_types/index.ts
```

### Adding New Routes
```bash
# Create route directory
src/app/new-route/

# Add route-specific structure
src/app/new-route/_components/
src/app/new-route/_hooks/
src/app/new-route/_types/
src/app/new-route/page.tsx
```

### Shared Components
```bash
# If component is used by multiple routes
src/components/category/ComponentName.tsx

# If it's layout-related
src/components/layout/ComponentName.tsx
```

## 🔄 Migration Benefits

### Before (Global Structure)
```
src/
├── components/
│   ├── DashboardChart.tsx        # Used only in dashboard
│   ├── StatsCards.tsx           # Used only in dashboard
│   ├── InteractionTracker.tsx   # Used only in dashboard
│   └── auth/
└── hooks/
    ├── useDashboardData.ts      # Used only in dashboard
    └── useAuth.ts               # Shared
```

### After (Colocated Structure)
```
src/
├── app/dashboard/
│   ├── _components/             # Clear scope
│   ├── _hooks/                  # Clear scope
│   └── _types/                  # Clear scope
├── components/
│   ├── auth/                    # Shared
│   └── layout/                  # Shared
└── hooks/
    └── useAuth.ts               # Shared
```

## 🚀 Developer Experience Improvements

### 1. **Faster Navigation**
- Related files are grouped together
- No need to search across global directories

### 2. **Clearer Dependencies**
- Easy to see what components a route uses
- Obvious which code is shared vs route-specific

### 3. **Better Refactoring**
- Moving route-specific code is straightforward
- Less risk of breaking unrelated features

### 4. **Improved Testing**
- Test files can be colocated with components
- Route-specific test utilities can be organized together

## 📝 Best Practices

### 1. **Use Private Folders**
- Prefix with underscore: `_components`, `_hooks`, `_types`
- Prevents accidental route creation

### 2. **Barrel Exports**
- Always create `index.ts` files for clean imports
- Export types and components from the same barrel when appropriate

### 3. **Shared vs Route-Specific Decision**
- If used by 2+ routes → `src/components/`
- If used by 1 route → `src/app/route/_components/`

### 4. **Consistent Naming**
- Route-specific: `DashboardNav`, `ProfileSettings`
- Shared: `AppNav`, `Button`, `Modal`

## 🔧 Tools and Utilities

### TypeScript Path Mapping
The project uses `@/*` path mapping for clean imports:
```typescript
// Instead of
import { useAuth } from '../../../hooks/useAuth';

// Use
import { useAuth } from '@/hooks/useAuth';
```

### ESLint Configuration
Consider adding rules for import organization:
```json
{
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "pathGroups": [
        {
          "pattern": "@/**",
          "group": "internal"
        }
      ]
    }]
  }
}
```

## ✅ Completed Improvements

### 1. **Applied to All Routes** ✅
   - ✅ Refactored `cli-login` route with colocation
   - ✅ Refactored `tracker` route with colocation
   - ✅ Added route-specific components, hooks, and types

### 2. **Testing Structure Added** ✅
   - ✅ Colocated test files with components (`__tests__` folders)
   - ✅ Jest configuration with Next.js integration
   - ✅ Test setup with mocks for Supabase and Next.js
   - ✅ Example tests for components and hooks
   - ✅ Coverage reporting configured

### 3. **Performance Optimizations** ✅
   - ✅ Route-level loading states (`loading.tsx`)
   - ✅ Error boundaries for each route (`error.tsx`)
   - ✅ Performance monitoring component
   - ✅ Bundle analysis script
   - ✅ Core Web Vitals tracking

### 4. **Enhanced Developer Experience** ✅
   - ✅ Barrel exports for clean imports
   - ✅ TypeScript types for all components
   - ✅ Consistent naming conventions
   - ✅ Comprehensive documentation

## 🚀 Additional Features Added

### Testing Infrastructure
```bash
# Run tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Performance Monitoring
- Core Web Vitals tracking (FCP, LCP, CLS, FID, TTI)
- Route-specific performance metrics
- Production-only monitoring
- Ready for analytics integration

### Error Handling
- Route-specific error boundaries
- Development error details
- User-friendly error messages
- Recovery actions

### Loading States
- Skeleton screens for each route
- Consistent loading patterns
- Improved perceived performance

This structure makes the codebase more maintainable, easier to navigate, and follows modern React/Next.js best practices while applying colocation principles effectively.