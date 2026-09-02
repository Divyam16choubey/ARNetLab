# ARNetLab

> **Build. Connect. Route. Visualize.**

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing** is an educational project for exploring computer-network topologies in a physical space. The intended experience is to place virtual devices such as PCs, switches, routers, and servers on a real surface, connect them, and observe a route between selected devices.

### Current Status — Phase 6 (Real-Device Hardening, Reliability & Stabilization)

Phase 6 hardens ARNetLab for physical handheld WebXR devices (verified on Samsung Galaxy Tab S9 FE). It resolves real-device reference-space negotiation failures, eliminates stale hit-test pose retention, hardens Three.js resource cleanup, optimizes render loops and memory consumption, improves orientation responsiveness, and introduces automated manager lifecycle regression tests.

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

#### Phase 5 — Virtual Packet Simulation & Route Traversal
- **Packet Simulation Engine (`PacketSimulator.js`)** — Discrete simulation state machine (`IDLE`, `READY`, `RUNNING`, `PAUSED`, `COMPLETED`, `STOPPED`, `ERROR`).
- **Constant World-Space Speed** — Frame-rate independent movement ($0.35\text{ m/s}$ by default): $\text{progress} += \frac{\text{speed} \cdot \Delta t}{\text{edgeLength}}$.
- **Edge-by-Edge Traversal** — Seamless sequential progression across every segment in the computed Dijkstra shortest path without node teleportation.
- **Lightweight 3D Packet Mesh (`PacketMesh.js`)** — Distinct faceted glowing icosahedron with pulsating halo beacon ring in luminous amber (`0xf59e0b`).
- **Active Edge Visual Feedback** — Distinct bright amber/gold highlight on the link currently traversed by the packet without altering base route highlights.
- **Dynamic Topology Safety** — Instantly terminates transit, cleans up 3D meshes, and alerts the user if any node or link on the active route is deleted during simulation.
- **Zero Frame React Overhead** — High-frequency packet transform updates remain strictly inside Three.js in vanilla JavaScript; React state updates only on discrete milestones (start, node arrival, segment change, completion, stop, error).
- **Simulation UI Controls** — "Send Packet", "Stop Packet", and "Send Again" controls in `RouteStatus`, `AROverlay`, `NetworkControls`, and `NetworkToolbar`.
- **Accurate Simulation Metrics** — Displays actual elapsed simulation time (e.g. `Simulation Time: 3.4s`) and hop progress without fabricating network latency.
- **Automated Test Suite (`packetSimulator.test.js`)** — 10 unit tests covering direct transmission, multi-hop, Dijkstra adherence, dynamic edge/node deletion, network reset, and re-dispatch (100% pass rate).

#### Phase 6 — Real-Device Hardening & Stabilization
- **Reference Space Fallback & ARCore Compatibility** — Configures Three.js `renderer.xr.setReferenceSpaceType('local')` before `setSession` to prevent Three.js from defaulting to unsupported `'local-floor'` on handheld AR devices (resolved real-device crash on Galaxy Tab S9 FE).
- **Graceful Reference Space Negotiation** — Negotiates `'local'` → `'local-floor'` → `'viewer'` with coordinate system synchronization between Three.js camera rendering and `HitTestManager.update(frame, localRefSpace)`.
- **Stale Pose Elimination** — Nullifies `_lastPoseMatrix` in `HitTestManager` whenever a frame has 0 hit results, ensuring `getHitPoseMatrixCopy()` never returns outdated spatial matrices.
- **Defensive Hit-Test Cancellation** — Checks and safely cancels active hit-test sources on teardown.
- **Connection Visuals Hardening** — Corrected undeclared variable references in `ConnectionManager` for route highlights and packet edge styling.
- **Unobstructed Interaction in AR** — Placement reticle automatically hides during `connect`, `select`, `source`, and `dest` modes, preventing the surface tracking ring from interfering with device touch targeting.
- **Parent-Detached Disposal** — Enhanced `PlacementManager`, `ReticleManager`, `DeviceManager`, and `PacketMesh` cleanup routines to safely remove meshes from their parents regardless of whether `scene` is passed.
- **Texture & Canvas Memory Reclamation** — Disposes canvas backing store memory in `LabelManager` (`width = 0; height = 0`) to prevent texture memory leaks in mobile Chrome.
- **Zero-Allocation Raycasting** — Reuses a pre-allocated NDC Vector2 in `DeviceManager` across screen tap interactions.
- **WebXR Orientation & Viewport Sync** — Added `resize` and `orientationchange` handlers in `ARManager` to adjust camera projection and renderer viewport on tablet orientation flips.
- **Session Interruption Safety** — Added guard flags in `ARManager` against duplicate `_handleSessionEnd` invocations from system interruptions or app switching.
- **Landscape Tablet UI Optimization** — Added scrolling constraints (`max-h-[75vh] overflow-y-auto`) to the AR contextual inspector card to prevent viewport clipping on landscape displays.
- **Automated Lifecycle Regression Tests (`lifecycleAndManagers.test.js`)** — Validates stale pose elimination, link styling, parent-detached disposal, and canvas memory reclamation (100% pass rate).

### Strictly Excluded (Visual Simulation Boundary)

This project is a **visual educational simulation**. The following are intentionally NOT implemented:
- No real network traffic or backend packet transmission
- No TCP/UDP socket connections
- No real IP packet sniffing or Wi-Fi packet capture
- No simulated bandwidth, packet loss, or latency claims
- No multiplayer AR networking over the internet

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

## Testing & Verification Procedures

### Distinction: Code-Level Verification vs. Real-Device Verification

- **Code-Level Verification:**
  - Automated unit test suite: `node src/network/__tests__/dijkstra.test.js` (7/7 passed).
  - Automated packet simulation suite: `node src/network/__tests__/packetSimulator.test.js` (10/10 passed).
  - Automated AR lifecycle suite: `node src/ar/__tests__/lifecycleAndManagers.test.js` (4/4 passed).
  - Linting: `npm run lint` (0 warnings, 0 errors).
  - Production compilation: `npm run build` (successful bundle).

- **Real-Device Verification (Galaxy Tab S9 FE, Chrome for Android):**
  - WebXR AR session begins successfully via `navigator.xr.requestSession('immersive-ar')`.
  - Passthrough camera feed active.
  - Surface detection via `XRHitTestSource` operates in real-time.
  - Placement reticle tracks detected horizontal planes.
  - Tap-to-place instantiates workspace anchor platform on detected plane.
  - Workspace anchor platform remains world-locked at physical surface location.

### Recommended Chrome for Android Verification Procedure
1. Serve ARNetLab over HTTPS (required by WebXR) or via `localhost` port-forwarding in Chrome DevTools (`chrome://inspect`).
2. Open Chrome on an ARCore-certified device (e.g., Galaxy Tab S9 FE).
3. Navigate to `/ar-lab`.
4. Tap **Enter AR** and accept the camera permission prompt.
5. Move the device slowly across a textured horizontal surface (desk or table).
6. Verify the teal reticle appears flat upon the detected surface.
7. Tap the surface to anchor the workspace.
8. Switch to **Place** mode and place multiple devices (PC, Switch, Router, Server).
9. Switch to **Connect** mode and link devices.
10. Set **Source** and **Destination** devices to view Dijkstra route highlight (emerald green).
11. Tap **Send Packet** and observe the virtual packet traversing edge-by-edge in 3D world space.
12. Tap **Exit AR** to return to standard UI.

### Recommended Samsung Internet Verification Procedure
1. Launch Samsung Internet on the device.
2. Ensure WebXR is enabled in `internet://flags` if required on older versions.
3. Follow steps 3–12 above.
4. Verify WebXR session teardown cleanly releases camera resources upon tab exit.

## AR Architecture

```
React (UI layer)                Vanilla JS (XR frame loop)
─────────────────               ───────────────────────────
ARContext.jsx ────────────────► ARManager.js
  ├─ session state                ├─ Three.js renderer
  ├─ hitTest state                ├─ XR session lifecycle ('local' ref space)
  ├─ placement state              ├─ render loop (vanilla JS, 0 React setState)
  ├─ nodes state (PC, Switch...) HitTestManager.js
  ├─ selectedNodeId               ├─ XRHitTestSource ('viewer' ray)
  ├─ simulationStatus             └─ per-frame pose extraction (no stale leaks)
  └─ packetInfo                  ReticleManager.js
                                  └─ ring mesh on surfaces (hides in non-place modes)
                                 PlacementManager.js
                                  └─ workspace anchor platform
                                 DeviceFactory.js
                                  └─ procedural 3D meshes (PC, Switch, Router, Server)
                                 DeviceManager.js
                                  ├─ scene node registry
                                  ├─ pre-allocated NDC raycasting
                                  └─ selection highlight
                                 ConnectionManager.js
                                  ├─ 3D cylinder links
                                  ├─ route emerald highlights
                                  └─ packet active gold highlights
                                 PacketMesh.js
                                  └─ icosahedron mesh with pulsating beacon ring
                                 LabelManager.js
                                  └─ floating sprite labels with memory disposal
```

React state is **only updated on discrete milestone events** (session start/end, placement, selection, deletion, reset, packet milestones). The XR frame loop runs in vanilla JavaScript with zero React re-renders per frame.

## Documentation

- [Project report](Documentation/ARNetLab_Report.pdf)
- [Project slides](Documentation/ARNetLab_Slides.pdf)

