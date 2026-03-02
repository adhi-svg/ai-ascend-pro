# FIXORA Development Setup

## Project Overview
**FIXORA** is a production-ready React application for connecting customers with local technicians. A smooth way to get things fixed - it's a comprehensive service platform with customer and technician workflows.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Language**: JavaScript (no TypeScript)
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (currently using mock endpoints)
- **State Management**: React Context API
- **Build Tool**: Vite
- **Linting**: ESLint with React plugins
- **Formatting**: Prettier
- **Testing**: Playwright (E2E)

## Key Features
- **Customer Flow**: Service booking, technician selection, real-time tracking
- **Authentication**: Phone/Email login with OTP verification
- **Payment Integration**: Mock payment system (ready for real integration)
- **Location Services**: GPS-based technician discovery
- **Responsive Design**: Mobile-first with desktop support
- **Dark Theme**: Custom dark theme with glassmorphism effects

## Development Environment

### Required VSCode Extensions
The following extensions are automatically recommended:
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Auto Rename Tag** - HTML/JSX tag renaming
- **Path Intellisense** - File path autocomplete

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Development Server
- **Local**: http://localhost:5173/
- **Network**: http://192.168.1.6:5173/ (accessible on local network)

## Project Structure
```
src/
├── components/
│   ├── cards/          # Reusable card components
│   ├── layout/         # Header, Footer, Navigation
│   └── ui/             # Base UI components
├── context/            # React Context providers
├── data/               # Mock data and constants
├── pages/              # Route components
├── services/           # API services
└── assets/             # Images and static files
```

## Key Components

### Pages
- **Splash** - Landing page
- **Login/Register** - Authentication
- **CustomerHome** - Main dashboard with services
- **TechnicianList** - Browse available technicians
- **BookingDetails** - Service booking flow
- **BookingStatus** - Track active bookings
- **JobCompletion** - OTP verification and completion

### Core Features
- **Service Categories**: Electrical, Plumbing, AC, Appliances, etc.
- **Technician Discovery**: Location-based with ratings and availability
- **Booking System**: Multi-step booking with payment integration
- **Real-time Tracking**: GPS-based technician tracking
- **OTP Verification**: Secure job completion verification
- **Complaint System**: Customer feedback and issue reporting

## API Integration
Currently using mock data in `src/data/mockData.js`. Ready for backend integration:
- Authentication endpoints
- Technician discovery API
- Booking management
- Payment processing
- Real-time location tracking

## Styling System
Custom Tailwind configuration with:
- **Brand Colors**: Primary (#7C5CFF), Accent (#FF6B6B), Dark theme
- **Glassmorphism**: Backdrop blur effects
- **Responsive Design**: Mobile-first approach
- **Custom Components**: Consistent design system

## Mobile Optimization
- Touch-friendly interface
- Bottom navigation for mobile
- Responsive grid layouts
- Safe area support for notched devices
- Optimized for iOS and Android

## Production Ready Features
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton screens and spinners
- **Offline Support**: Service worker ready
- **SEO Optimized**: Meta tags and structured data
- **Performance**: Code splitting and lazy loading
- **Security**: Input validation and sanitization

## Next Steps for Production
1. **Backend Integration**: Replace mock APIs with real endpoints
2. **Payment Gateway**: Integrate Stripe/Razorpay
3. **Push Notifications**: Real-time updates
4. **Admin Panel**: Technician and booking management
5. **Analytics**: User behavior tracking
6. **Testing**: Unit and integration tests