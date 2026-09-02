# ARNetLab

> **Build. Connect. Route. Visualize.**

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing** is an educational project for exploring computer-network topologies in a physical space. The intended experience is to place virtual devices such as PCs, switches, routers, and servers on a real surface, connect them, and observe a route between selected devices.

## Current Status — Phase 3 (3D Network Devices & AR Placement)

Phase 3 transforms the placed AR workspace into an interactive **3D network device visualization environment**. Users on supported mobile devices can enter WebXR AR mode, detect horizontal surfaces, anchor the workspace, select network device types, place distinct 3D devices into the physical world, select placed devices with raycasting, inspect device properties, delete individual devices, and reset the network workspace.

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
- **Procedural 3D device models** — lightweight geometry (~50–200 vertices per device) with `MeshStandardMaterial` for 4 distinct device types:
  - **PC:** Monitor screen, stand, base plate (`#3b82f6`)
  - **Switch:** Low-profile rack chassis, RJ45 port representations, status LED (`#22c55e`)
  - **Router:** Compact router body, dual angled antennas, status LEDs (`#f59e0b`)
  - **Server:** Server rack unit with horizontal slot divider lines and status indicators (`#a855f7`)
- **AR Device Placement** — user selects a device type from the mobile AR palette and taps detected surfaces to instantiate anchored 3D models at the exact hit-test transform.
- **Three.js Raycasting Object Selection** — taps on existing placed devices perform NDC camera raycasting against device meshes.
- **Visual Selection Feedback** — selected devices display an active cyan base highlight ring and emissive material glow.
- **Floating Text Labels** — dynamic canvas-generated billboard sprite labels (e.g. `PC-01`, `SWITCH-01`, `ROUTER-01`, `SERVER-01`) floating directly above each device with stable sequential numbering.
- **Contextual Device Info Card** — selecting a device presents an overlay card displaying device name, device type badge, 3D world coordinates, a `Delete Device` action, and a `Deselect` button.
- **Device Deletion** — removes device mesh, label sprite, and React state, properly disposing of geometries and materials.
- **Dual Reset System**:
  - `Reset Network`: Clears all placed 3D devices and node state while preserving the AR workspace platform and active WebXR session.
  - `Reset Workspace`: Clears the workspace platform and devices, returning to surface scanning mode.
- **Interactive UI Palette & Toolbar** — mobile AR floating bottom palette and desktop sidebar selector bound to active device selection.

### Not Implemented (Planned for Future Phases)

| Feature | Target Phase |
|---------|-------------|
| Network graph topology & device connections | Phase 4 |
| Edge weight calculation (Euclidean 3D distance) | Phase 4 |
| Source and destination device selection | Phase 4 |
| Dijkstra shortest-path routing algorithm | Phase 4 |
| Route path visualization and highlighting | Phase 4 |
| Virtual packet simulation & hop animation | Phase 5 |
| Dynamic topology updates & route recalculation | Phase 5 |

> **Important Boundary:** Phase 3 strictly implements 3D device geometry, placement, selection, labels, deletion, and workspace management. Network connections, graph algorithms, Dijkstra routing, and packet animation are not part of Phase 3 and will be introduced in Phase 4 and Phase 5.

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

## Next Steps (Phase 4)

1. Implement network graph data structure (nodes, adjacencies, edge weights)
2. Add device connection creation tool (connect 2 placed devices with 3D lines)
3. Calculate Euclidean distance weights between placed devices in AR space
4. Implement Dijkstra's shortest-path algorithm
5. Add Source and Destination selection controls
6. Visualize calculated shortest paths in AR with glowing route highlights

