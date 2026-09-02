# ARNetLab

> **Build. Connect. Route. Visualize.**

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing** is an educational project for exploring computer-network topologies in a physical space. The intended experience is to place virtual devices such as PCs, switches, routers, and servers on a real surface, connect them, and observe a route between selected devices.

## Current Status — Phase 4 (Network Topology & Shortest-Path Routing)

Phase 4 transforms the 3D device workspace into an interactive **network topology and routing system**. Users can create undirected network links between devices in 3D AR space, calculate dynamic edge weights using real 3D Euclidean distances, designate Source and Destination endpoints, execute Dijkstra's algorithm to compute the shortest route, visualize the route in AR with glowing green highlights, manage/delete connections, and observe automatic route recalculation/invalidation upon topology changes.

### Implemented

#### Phase 1 — Foundation & UI
- Responsive landing page with project overview, capabilities, and workflow sections
- Mobile-first responsive design (mobile, tablet, desktop)
- Dark and light theme with localStorage persistence
- Reusable UI component library (Button, Card, Badge, Modal, StatusIndicator, EmptyState, LoadingState)
- Network UI component foundations (NetworkToolbar, NodeTypeSelector, NetworkControls, RouteStatus, NetworkLegend)
- Responsive navbar with mobile slide-in menu
- Client-side routing (React Router v6)
- Tailwind CSS design token system, animation system, accessible controls

#### Phase 2 — WebXR & Real AR
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

#### Phase 3 — 3D Devices & Object Management
- **Procedural 3D device models** — lightweight geometry with `MeshStandardMaterial` for 4 distinct device types (PC, Switch, Router, Server).
- **AR Device Placement** — select a device type and tap detected surfaces to place 3D models at the exact hit-test transform.
- **Three.js Raycasting Object Selection** — NDC raycasting against device meshes.
- **Visual Selection Feedback** — selected devices display an active cyan base highlight ring and emissive glow.
- **Floating Text Labels** — dynamic canvas-generated billboard sprite labels (e.g. `PC-01`, `SWITCH-01`) floating above devices.
- **Contextual Device Info Card** — inspector card displaying device name, type, 3D coordinates, and deletion action.
- **Dual Reset System**:
  - `Reset Network`: Clears all placed 3D devices and connections while preserving the AR anchor and active session.
  - `Reset Workspace`: Clears the workspace platform and devices, returning to surface scanning.

#### Phase 4 — Network Topology & Dijkstra Routing
- **Network Graph Model (`NetworkGraph.js`)** — Adjacency-list based undirected graph model with duplicate and self-loop prevention.
- **3D Visual Connections (`ConnectionManager.js`)** — Real-time Three.js 3D link meshes connecting devices in AR space.
- **3D Euclidean Distance Weights** — Edge weights computed directly from Euclidean distance: $\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$.
- **Source & Destination Selection** — Dedicated modes and quick-assignment actions on devices with glowing role indicator rings (Emerald for Source, Rose for Destination).
- **Dijkstra Shortest-Path Algorithm (`dijkstra.js`)** — Standalone routing engine evaluating non-negative Euclidean weights, multi-hop routes, and disjoint/unreachable graphs.
- **3D Route Visualization** — Active shortest-path route highlighted with glowing emerald cylinder lines and endpoint pulse indicators.
- **Dynamic Topology Reactivity** — Removing a device or connection automatically recalculates or invalidates active routes in real time.
- **Interactive UI Controls** — Mode Switcher HUD in AR (`Place`, `Connect`, `Source`, `Dest`), `RouteStatus` analytics card with hop sequences and total distance metrics, and updated `NetworkLegend`.

### Not Implemented (Planned for Future Phases)

| Feature | Target Phase |
|---------|-------------|
| Virtual packet 3D mesh & visual representation | Phase 5 |
| Real-time animated packet traversal along route | Phase 5 |
| Packet transmission simulation (Play, Pause, Speed) | Phase 5 |
| Hop-by-hop packet processing visualization | Phase 5 |

> **Important Boundary:** Phase 4 strictly implements the graph model, 3D links, Euclidean weighting, Dijkstra routing, source/dest selection, and route visualization. Animated packet movement and transmission simulation belong strictly to Phase 5.

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
│   │   ├── PlacementManager.js #   Workspace anchor platform mesh
│   │   ├── DeviceFactory.js    #   Procedural 3D device geometry (PC, Switch, Router, Server)
│   │   ├── DeviceManager.js    #   Scene device registry, raycasting, selection
│   │   └── LabelManager.js     #   Canvas-backed billboard sprite text labels
│   ├── components/
│   │   ├── ar/                 # AR-specific UI (AROverlay.jsx with device palette & inspector)
│   │   ├── common/             # Button, Card, Badge, Modal, StatusIndicator
│   │   ├── layout/             # Navbar, Footer, MobileMenu, PageHeader
│   │   ├── ui/                 # ThemeToggle, EmptyState, LoadingState
│   │   └── network/            # NetworkToolbar, NodeTypeSelector, NetworkControls, etc.
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ARLabPage.jsx       # AR viewport & desktop fallback mode
│   │   ├── HowItWorksPage.jsx
│   │   └── AboutPage.jsx
│   ├── hooks/
│   │   ├── useTheme.js
│   │   └── useAR.js            # Unified AR and network device hook
│   ├── context/
│   │   ├── ThemeContext.jsx
│   │   └── ARContext.jsx       # AR session & network node state management
│   ├── constants/
│   │   └── networkTypes.js     # Device types, colors, icons, config
│   ├── types/
│   │   └── network.js          # JSDoc type contracts
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

### Option 1: Chrome DevTools Port Forwarding (Recommended)
1. Connect your Android device via USB
2. Enable USB debugging on the device
3. Open `chrome://inspect` in desktop Chrome
4. Set up port forwarding: `5173` → `localhost:5173`
5. On the device, open Chrome and navigate to `http://localhost:5173/ar-lab`

### Option 2: Local Network Access
```bash
npm run dev -- --host
```

### Device Requirements
- **Android** device with ARCore support
- **Chrome** browser (v79+ with WebXR support)
- Camera permission must be granted

### Desktop Fallback
On desktop browsers (which lack WebXR AR support), the AR Lab page shows a clear "AR is not supported" status with an interactive device type selector, network toolbar, and roadmap information.

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with hero, capabilities, and workflow overview |
| `/ar-lab` | AR Lab | AR workspace — Enter AR on mobile, interactive preview on desktop |
| `/how-it-works` | How It Works | Step-by-step walkthrough of the planned AR experience |
| `/about` | About | Project overview, tech stack, and development status |

## AR Architecture

```
React (UI layer)                Vanilla JS (XR frame loop)
─────────────────               ───────────────────────────
ARContext.jsx ────────────────► ARManager.js
  ├─ session state                ├─ Three.js renderer
  ├─ hitTest state                ├─ XR session lifecycle
  ├─ placement state              ├─ render loop
  ├─ nodes state (PC, Switch...) HitTestManager.js
  ├─ selectedNodeId               ├─ XRHitTestSource
  └─ selectedDeviceType           └─ per-frame pose extraction
                                 ReticleManager.js
                                  └─ ring mesh on surfaces
                                 PlacementManager.js
                                  └─ workspace anchor platform
                                 DeviceFactory.js
                                  └─ procedural 3D meshes
                                 DeviceManager.js
                                  ├─ scene node registry
                                  ├─ Three.js raycasting
                                  └─ selection highlight
                                 LabelManager.js
                                  └─ floating sprite labels
```

React state is **only updated on discrete events** (session start/end, placement, selection, deletion, reset). The XR frame loop runs in vanilla JavaScript with zero React re-renders per frame.

## Documentation

- [Project report](Documentation/ARNetLab_Report.pdf)
- [Project slides](Documentation/ARNetLab_Slides.pdf)

## Next Steps (Phase 5)

1. Create 3D virtual packet mesh and material (pulsing data packet object)
2. Implement packet path traversal engine along the computed Dijkstra shortest path
3. Add transmission controls (Play, Pause, Reset, Transmission Speed)
4. Add hop-by-hop device processing indicators during packet transit
5. Real-time packet telemetry and status reporting

