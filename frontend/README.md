# Vasundhara 2.0 - Agentic Civic OS for Sustainable Communities

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

An AI-powered sustainability intelligence platform that unifies waste management, carbon tracking, and citizen engagement through explainable AI, social credit systems, and real-time civic data orchestration.

## 🌱 Features

### Core Capabilities
- **Carbon Tracking Dashboard** - Explainable AI visualizations with SHAP/LIME-style insights
- **Waste & Resource Management** - Real-time monitoring with quantum-optimized routing
- **Social Credit System** - Unified Eco+Civic score with gamification and rewards
- **Multimodal Citizen Gateway** - Text, voice, and image-based issue reporting
- **Agentic AI** - Autonomous civic intelligence for automated sustainability actions
- **Multilingual Support** - English, Hindi, and regional language support via i18n

### Technical Features
- Progressive Web App (PWA) with offline capabilities
- Responsive design for mobile, tablet, and desktop
- Dark mode support
- Real-time notifications
- Interactive data visualizations (Recharts)
- Map-based features (Leaflet.js ready)
- Role-based access control (Citizen, Admin, NGO)
- JWT-based authentication

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-git-url>
cd vasundhara-2.0
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx  # Main navigation bar
│   ├── ScoreCard.tsx   # Score display component
│   └── ui/             # Shadcn UI components
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── pages/              # Main application pages
│   ├── Index.tsx       # Landing page
│   ├── Auth.tsx        # Login/Signup
│   ├── Dashboard.tsx   # User dashboard
│   ├── CarbonTracking.tsx # Carbon footprint
│   ├── WasteManagement.tsx # Waste reporting
│   ├── SocialCredit.tsx # Credit system
│   └── Profile.tsx     # User profile
├── lib/                # Utility functions
└── App.tsx             # Main app component
```

## 🎨 Design System

The app uses a comprehensive design system with eco-friendly colors:

### Color Palette
- **Primary**: Forest green (#2d7a4e) - Main brand color
- **Secondary**: Teal (#3b9db0) - Water theme
- **Accent**: Warm amber (#f59e0b) - Sun/earth
- **Success**: Bright green (#16a34a)
- **Background**: Light cream / Dark charcoal

### Custom Gradients
- `gradient-eco` - Primary to secondary
- `gradient-hero` - Multi-color hero gradient
- `gradient-card` - Subtle card background

### Animations
- `animate-float` - Floating animation for icons
- `animate-pulse-slow` - Slow pulse effect

## 🔧 Technologies Used

- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn UI
- **Charts**: Recharts
- **Maps**: Leaflet.js (ready for integration)
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Routing**: React Router v6
- **Notifications**: Sonner
- **Internationalization**: react-i18next (configured)

## 🌐 Extending the App

### Adding Backend Integration

The app currently uses mock data. To connect to a real backend:

1. **Replace API mocks** in `src/contexts/AuthContext.tsx`
2. **Add API service layer** in `src/services/`
3. **Configure environment variables** for API endpoints

Example API service:
```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  // Add more API calls...
};
```

### Adding Leaflet Maps

Leaflet CSS is already included. To add interactive maps:

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '400px' }}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  <Marker position={[28.6139, 77.2090]}>
    <Popup>Issue Location</Popup>
  </Marker>
</MapContainer>
```

### Adding Voice Recognition

Web Speech API integration example:

```typescript
const recognition = new (window as any).webkitSpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

recognition.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript;
  setIssueText(transcript);
};

recognition.start();
```

### Multilingual Support

The app is configured with react-i18next. To add translations:

1. Create translation files in `src/locales/`
2. Configure i18n in `src/i18n.ts`
3. Use translations with `useTranslation()` hook

## 📦 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Optional - for backend integration
VITE_API_URL=https://api.vasundhara.in
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_ENABLE_ANALYTICS=true
```

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [Shadcn UI](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Design inspired by sustainability and civic engagement principles

## 📞 Support

For support, email support@vasundhara.in or join our community Discord.

---

**Made with 💚 for a sustainable future**
