# ARNetLab

> **Build. Connect. Route. Visualize.**

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing** is an educational project for exploring computer-network topologies in a physical space. The intended experience is to place virtual devices such as PCs, switches, routers, and servers on a real surface, connect them, and observe a route between selected devices.

## Current Status — Phase 2 (WebXR AR)

Phase 2 adds **real Augmented Reality** to the application using the WebXR Device API and Three.js. Users on supported mobile devices can enter an immersive AR session, detect horizontal surfaces, and place a workspace anchor on their desk or table.

### Implemented

#### Phase 1 — Foundation
- Responsive landing page with project overview, capabilities, and workflow sections
- Mobile-first responsive design (mobile, tablet, desktop)
- Dark and light theme with localStorage persistence
- Reusable UI component library (Button, Card, Badge, Modal, StatusIndicator, EmptyState, LoadingState)
- Network UI component foundations (NetworkToolbar, NodeTypeSelector, NetworkControls, RouteStatus, NetworkLegend)
- Responsive navbar with mobile slide-in menu
- Client-side routing (React Router v6)
- Tailwind CSS design token system, animation system, accessible controls

#### Phase 2 — WebXR AR
- **WebXR availability detection** — checks `navigator.xr` and `immersive-ar` support
- **AR support UI** — clear status messages for supported, unsupported, and error states
- **Immersive-ar session** — full WebXR session lifecycle (start, render loop, end)
- **Three.js integration** — WebGLRenderer with XR enabled, scene, camera, lighting
- **Hit testing** — WebXR hit-test source detects horizontal surfaces in real-time
- **Placement reticle** — teal ring follows detected surfaces, hides when no surface found
- **Tap-to-place** — places a workspace anchor (indigo platform) at the reticle position
- **Reset placement** — removes anchor, resumes surface detection
- **Exit AR** — ends session, disposes resources, returns to normal UI
- **AR overlay** — floating status messages and controls during AR (glass-blur design)
- **Performance-optimized** — XR frame loop runs in vanilla JS, no React re-renders per frame
- **Error handling** — graceful messages for permission denied, unsupported devices, session failures
- **Mobile UX** — touch-friendly controls, safe-area padding, 48px touch targets

### Not Implemented (Planned for Future Phases)

| Feature | Target Phase |
|---------|-------------|
| 3D network device models (PC, Switch, Router, Server) | Phase 3 |
| Device placement on AR surfaces | Phase 3 |
| Network graph state management | Phase 3 |
| Device connections and edge creation | Phase 3 |
| Shortest-path routing algorithm | Phase 4 |
| Packet visualization and animation | Phase 5 |

> **Important:** No network devices, routing algorithms, or packet simulation exist yet. The AR placement currently creates a neutral workspace anchor, not network devices.

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| [React 18+](https://react.dev/) | Component-based UI framework |
| [Vite](https://vite.dev/) | Build tool and dev server |
| [Three.js](https://threejs.org/) | 3D rendering and WebXR integration |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Lucide React](https://lucide.dev/) | Lightweight icon library |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling system and design tokens |

## Project Structure

```
ARNetLab/
├── Documentation/              # Project report and slides (PDF)
├── public/
│   └── favicon.svg
├── src/
│   ├── ar/                     # AR core modules (vanilla JS, no React)
│   │   ├── ARManager.js        #   WebXR session lifecycle, Three.js renderer
│   │   ├── HitTestManager.js   #   Surface detection via hit-test
│   │   ├── ReticleManager.js   #   Placement reticle mesh
│   │   └── PlacementManager.js #   Workspace anchor placement
│   ├── components/
│   │   ├── ar/                 # AR-specific UI (AROverlay.jsx)
│   │   ├── common/             # Button, Card, Badge, Modal, StatusIndicator
│   │   ├── layout/             # Navbar, Footer, MobileMenu, PageHeader
│   │   ├── ui/                 # ThemeToggle, EmptyState, LoadingState
│   │   └── network/            # NetworkToolbar, NodeTypeSelector, etc.
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ARLabPage.jsx       # Two modes: default placeholder / AR active
│   │   ├── HowItWorksPage.jsx
│   │   └── AboutPage.jsx
│   ├── hooks/
│   │   ├── useTheme.js
│   │   └── useAR.js
│   ├── context/
│   │   ├── ThemeContext.jsx
│   │   └── ARContext.jsx       # React ↔ AR bridge (state only on events)
│   ├── constants/
│   │   └── networkTypes.js
│   ├── types/
│   │   └── network.js
│   ├── styles/
│   │   └── globals.css         # Tailwind base, utilities, and scrollbar styles
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
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

## Testing AR on a Real Mobile Device

WebXR requires a **secure context** (HTTPS or localhost). To test on a mobile device:

### Option 1: Vite Network Access
```bash
npm run dev -- --host
```
This exposes the dev server on your local network. However, WebXR requires HTTPS on non-localhost origins, so you will need to either:
- Use Chrome DevTools port forwarding (recommended), or
- Configure Vite with a self-signed SSL certificate

### Option 2: Chrome DevTools Port Forwarding (Recommended)
1. Connect your Android device via USB
2. Enable USB debugging on the device
3. Open `chrome://inspect` in desktop Chrome
4. Set up port forwarding: `5173` → `localhost:5173`
5. On the device, open Chrome and navigate to `http://localhost:5173/ar-lab`

### Device Requirements
- **Android** device with ARCore support
- **Chrome** browser (v79+ with WebXR support)
- Camera permission must be granted

### Desktop Fallback
On desktop browsers (which lack WebXR AR support), the AR Lab page shows a clear "AR is not supported" message with the standard Phase 1 placeholder UI.

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, capabilities, and workflow overview |
| `/ar-lab` | AR Lab | AR workspace — Enter AR on mobile, placeholder on desktop |
| `/how-it-works` | How It Works | Step-by-step walkthrough of the planned AR experience |
| `/about` | About | Project overview, tech stack, and development status |

## AR Architecture

```
React (UI layer)          Vanilla JS (XR frame loop)
─────────────────         ───────────────────────────
ARContext.jsx ──────────► ARManager.js
  ├─ support state          ├─ Three.js renderer
  ├─ session state          ├─ XR session lifecycle
  ├─ hitTest state          ├─ render loop
  └─ placement state      HitTestManager.js
                             ├─ XRHitTestSource
                             └─ per-frame pose extraction
                           ReticleManager.js
                             └─ ring mesh on surfaces
                           PlacementManager.js
                             └─ workspace anchor mesh
```

React state is **only updated on discrete events** (session start/end, placement, errors). The XR frame loop runs in vanilla JavaScript with zero React re-renders per frame.

## Documentation

- [Project report](Documentation/ARNetLab_Report.pdf)
- [Project slides](Documentation/ARNetLab_Slides.pdf)

## Next Steps (Phase 3)

1. Create 3D models for network devices (PC, Switch, Router, Server)
2. Enable device type selection and placement on AR surfaces
3. Implement network graph state management
4. Add device connections and edge visualization
