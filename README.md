# ARNetLab

> **Build. Connect. Route. Visualize.**

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing** is an educational project for exploring computer-network topologies in a physical space. The intended experience is to place virtual devices such as PCs, switches, routers, and servers on a real surface, connect them, and observe a route between selected devices.

## Current Status — Phase 1 (Foundation)

Phase 1 provides the **complete UI foundation** and application structure. It does not include AR functionality, 3D rendering, network logic, or routing algorithms — those belong to later phases.

### Implemented in Phase 1

- ✅ **Responsive landing page** with project overview, capabilities, and workflow sections
- ✅ **AR Lab workspace** UI shell with viewport placeholder, toolbar, device selector, and network controls
- ✅ **How It Works page** with step-by-step planned workflow timeline
- ✅ **About page** with tech stack, implemented vs. planned feature lists
- ✅ **Mobile-first responsive design** (mobile, tablet, desktop)
- ✅ **Dark and light theme** with localStorage persistence and system preference detection
- ✅ **Reusable UI component library** (Button, Card, Badge, Modal, StatusIndicator, EmptyState, LoadingState)
- ✅ **Network UI component foundations** (NetworkToolbar, NodeTypeSelector, NetworkControls, RouteStatus, NetworkLegend)
- ✅ **Responsive navbar** with mobile slide-in menu
- ✅ **Footer** with navigation and project links
- ✅ **CSS design token system** (custom properties for colors, spacing, typography, shadows)
- ✅ **Animation system** with reduced-motion support
- ✅ **Accessible controls** (focus states, ARIA labels, keyboard navigation, semantic HTML)
- ✅ **Client-side routing** (React Router v6)
- ✅ **Type definitions** (JSDoc) for future network data models
- ✅ **Clean, modular architecture** ready for Phase 2+ extensions

### Not Implemented (Planned for Future Phases)

| Feature | Target Phase |
|---------|-------------|
| WebXR AR session management | Phase 2 |
| Camera-based plane detection | Phase 2 |
| Hit testing and surface anchoring | Phase 2 |
| 3D device placement (Three.js / R3F) | Phase 2 |
| Network graph state management | Phase 2 |
| Device connections and edge creation | Phase 2 |
| Shortest-path routing algorithm | Phase 3 |
| Packet visualization and animation | Phase 3 |

> **Important:** No AR, 3D rendering, routing, or packet simulation is functional in Phase 1. All such features are clearly labeled as "planned" or "coming soon" in the UI.

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| [React 18+](https://react.dev/) | Component-based UI framework |
| [Vite](https://vite.dev/) | Build tool and dev server |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Lucide React](https://lucide.dev/) | Lightweight icon library |
| Vanilla CSS | Custom properties, design tokens, responsive layouts |

## Project Structure

```
ARNetLab/
├── Documentation/              # Project report and slides (PDF)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/             # Button, Card, Badge, Modal, StatusIndicator
│   │   ├── layout/             # Navbar, Footer, MobileMenu, PageHeader
│   │   ├── ui/                 # ThemeToggle, EmptyState, LoadingState
│   │   └── network/            # NetworkToolbar, NodeTypeSelector, NetworkControls,
│   │                             RouteStatus, NetworkLegend
│   ├── pages/
│   │   ├── HomePage.jsx        # Landing page with hero, capabilities, workflow
│   │   ├── ARLabPage.jsx       # AR workspace shell (viewport + controls)
│   │   ├── HowItWorksPage.jsx  # Step-by-step planned workflow
│   │   └── AboutPage.jsx       # Project info, tech stack, status
│   ├── hooks/
│   │   └── useTheme.js
│   ├── context/
│   │   └── ThemeContext.jsx
│   ├── constants/
│   │   └── networkTypes.js     # Node types, app identity
│   ├── types/
│   │   └── network.js          # JSDoc type definitions
│   ├── styles/
│   │   ├── variables.css       # Design tokens (colors, spacing, typography)
│   │   ├── animations.css      # Keyframe animations
│   │   └── globals.css         # Reset, base styles, utilities
│   ├── App.jsx                 # Root component with routing
│   ├── App.css
│   └── main.jsx                # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (included with Node.js)

### Installation

```bash
git clone https://github.com/Divyam16choubey/ARNetLab.git
cd ARNetLab
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

The built files will be in `dist/`.

### Preview Production Build

```bash
npm run preview
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, capabilities, and workflow overview |
| `/ar-lab` | AR Lab | Workspace shell with viewport placeholder and network controls |
| `/how-it-works` | How It Works | Step-by-step walkthrough of the planned AR experience |
| `/about` | About | Project overview, tech stack, and development status |

## Documentation

- [Project report](Documentation/ARNetLab_Report.pdf)
- [Project slides](Documentation/ARNetLab_Slides.pdf)

## Next Steps (Phase 2)

1. Integrate WebXR for immersive AR sessions
2. Implement camera access and plane detection
3. Add Three.js / React Three Fiber for 3D rendering
4. Enable device placement on detected surfaces
5. Implement network graph state management
