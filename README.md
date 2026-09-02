# ARNetLab

> **Build. Connect. Route. Visualize.**

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing** is an educational WebXR platform for constructing, exploring, and understanding computer network topologies in physical 3D space. Users can place procedural 3D network devices (PCs, switches, routers, and servers) directly onto real-world surfaces (such as a desk or tabletop), establish 3D connection links with Euclidean distance weighting, designate Source and Destination endpoints to calculate the shortest path via Dijkstra's algorithm, and dispatch a 3D virtual packet along the optimal route.

---

## Feature Inventory

The final implementation supports the following verified features:

1. **WebXR AR Session:** Initializes full-screen immersive AR (`immersive-ar`) using modern WebXR Device APIs.
2. **Surface Detection:** Continuously detects real-world horizontal surfaces using `XRHitTestSource` with raycasting from the viewer reference space.
3. **AR Workspace Placement:** Anchors an indigo circular workspace platform to physical surfaces with persistent world coordinates.
4. **Procedural PC Placement:** Renders lightweight 3D procedural workstation meshes (monitor, stand, chassis).
5. **Procedural Switch Placement:** Renders rackmount network switches with status port arrays.
6. **Procedural Router Placement:** Renders cylindrical networking routers with dual antenna masts.
7. **Procedural Server Placement:** Renders high-density server blades with illuminated drive bays.
8. **3D Raycasting Device Selection:** Uses camera-based NDC raycasting with zero-allocation vectors to select devices via touch/tap.
9. **Contextual Device Management:** Inspects device name, type, 3D position coordinates, role assignment, and offers one-tap device deletion.
10. **Network Connection Creation:** Dynamically connects any two devices with oriented 3D cylinder meshes.
11. **Connection Deletion:** Removes links and updates the adjacency graph in real-time.
12. **3D Euclidean Distance Weights:** Computes edge weights directly from spatial coordinates: $w = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$.
13. **Source Node Selection:** Designates routing origin with an emerald green glowing base aura.
14. **Destination Node Selection:** Designates routing destination with a rose/crimson glowing base aura.
15. **Dijkstra Shortest-Path Algorithm:** Standalone routing engine evaluating non-negative Euclidean weights across multi-hop and disjoint graphs.
16. **3D Route Visualization:** Highlights the optimal path with an illuminated emerald beam and endpoint pulse rings.
17. **3D Virtual Packet Creation:** Visualizes data packets as a faceted amber icosahedron with an animated breathing halo ring.
18. **Constant-Speed Traversal:** Frame-rate independent movement ($0.35\text{ m/s}$ by default): $\Delta\text{progress} = \frac{\text{speed} \cdot \Delta t}{\text{edgeLength}}$.
19. **Packet Delivery & Telemetry:** Emits discrete milestone events upon arrival with real-time transit duration metrics.
20. **Simulation Controls:** Offers intuitive "Send Packet", "Stop Packet", and "Send Again" controls in both the AR HUD and 2D panels.
21. **Dynamic Topology Safety:** Halts packet simulation immediately if any participating node or link is deleted mid-transit.
22. **Responsive Mobile & Tablet AR UI:** Floating glassmorphic HUD, mode switcher (`Place`, `Connect`, `Source`, `Dest`), device palette, and touch targets conforming to $\ge 48\text{px}$ accessibility standards.

---

## Strictly Excluded (Educational Simulation Boundary)

ARNetLab is an **educational visual simulation** designed to demonstrate networking and graph concepts intuitively in augmented reality. The following are **intentionally NOT implemented**:
- No real network traffic or backend packet sniffing
- No TCP/UDP raw socket connections
- No real-world packet capture (PCAP) or Wi-Fi inspection
- No fabricated bandwidth, packet loss, or simulated network latency claims
- No multi-user synchronized AR over the internet

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | `^19.2.8` | Component-based UI framework & application state management |
| [Vite](https://vite.dev/) | `^8.2.2` | High-performance build tool and dev server |
| [Three.js](https://threejs.org/) | `^0.185.1` | 3D WebGL rendering, WebXR session management, geometry, and raycasting |
| [React Router](https://reactrouter.com/) | `^7.18.3` | Client-side routing across Home, AR Lab, How It Works, and About pages |
| [Tailwind CSS](https://tailwindcss.com/) | `^3.4.19` | Design token system, responsive styling, and animations |
| [Lucide React](https://lucide.dev/) | `^1.39.0` | UI icon set |
| [Oxlint](https://oxc.rs/) | `^1.79.0` | High-speed static analysis and linting |

---

## Project Structure

```
ARNetLab/
├── Documentation/              # Project report and slides (PDF)
├── public/
│   └── favicon.svg             # Application favicon
├── src/
│   ├── ar/                     # Vanilla JS AR core modules (zero React overhead in XR frame loop)
│   │   ├── ARManager.js        #   WebXR session lifecycle, reference space negotiation, Three.js renderer
│   │   ├── HitTestManager.js   #   Surface detection via hit-test & stale pose elimination
│   │   ├── ReticleManager.js   #   Surface placement reticle ring
│   │   ├── PlacementManager.js #   Workspace anchor platform mesh & parent-detached disposal
│   │   ├── DeviceFactory.js    #   Procedural 3D device geometry (PC, Switch, Router, Server)
│   │   ├── DeviceManager.js    #   Scene device registry, pre-allocated NDC raycasting, selection
│   │   ├── ConnectionManager.js#   3D cylinder links, route highlighting, active packet edge styling
│   │   ├── PacketMesh.js       #   Faceted icosahedron mesh with pulsating beacon ring
│   │   ├── LabelManager.js     #   Canvas-backed billboard sprite labels with memory deallocation
│   │   └── __tests__/          #   Automated AR lifecycle & manager regression tests
│   ├── components/
│   │   ├── ar/                 # Floating AR overlay UI (AROverlay.jsx)
│   │   ├── common/             # Reusable UI primitives (Button, Card, Badge, Modal, StatusIndicator)
│   │   ├── layout/             # Layout components (Navbar, Footer, MobileMenu, PageHeader)
│   │   ├── network/            # Network panels (NetworkControls, NetworkToolbar, RouteStatus, NetworkLegend)
│   │   └── ui/                 # UI utilities (ThemeToggle, EmptyState, LoadingState)
│   ├── constants/
│   │   └── networkTypes.js     # Device specifications, theme colors, icons, configuration tokens
│   ├── context/
│   │   ├── ThemeContext.jsx    # Dark/light theme provider with localStorage persistence
│   │   └── ARContext.jsx       # Central AR session state, graph synchronization, and event dispatcher
│   ├── hooks/
│   │   ├── useTheme.js         # Theme consumption hook
│   │   └── useAR.js            # Unified AR and network topology hook
│   ├── network/                # Graph theory & routing engines
│   │   ├── NetworkGraph.js     #   Adjacency-list undirected network graph
│   │   ├── dijkstra.js         #   Dijkstra shortest-path algorithm
│   │   ├── PacketSimulator.js  #   Virtual packet state machine & traversal engine
│   │   └── __tests__/          #   Dijkstra & PacketSimulator unit test suites
│   ├── pages/                  # Top-level application views (HomePage, ARLabPage, HowItWorksPage, AboutPage)
│   ├── styles/                 # Global CSS and Tailwind directives (globals.css)
│   ├── types/                  # JSDoc type contracts (network.js)
│   ├── App.jsx                 # Route definitions & layout wrapper
│   └── main.jsx                # Application root mounting script
├── index.html                  # HTML entry point with metadata and fonts
├── package.json                # Project manifest, dependencies, and npm scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind design tokens and responsive breakpoints
├── vite.config.js              # Vite bundler configuration
└── README.md                   # Project documentation
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (bundled with Node.js)

### Installation
```bash
git clone https://github.com/Divyam16choubey/ARNetLab.git
cd ARNetLab
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

### Automated Unit & Regression Tests
```bash
npm test
```

---

## Testing & Verification Matrix

### Verification Level Breakdown

| Verification Dimension | Status | Notes |
|---|---|---|
| **Dijkstra Shortest Path** | **CODE-LEVEL VERIFIED** ✅ | 7/7 automated unit tests passed (linear, bypass, disconnected, cyclic). |
| **Packet Simulation Engine** | **CODE-LEVEL VERIFIED** ✅ | 10/10 automated tests passed (milestones, edge deletion, reset). |
| **AR Lifecycle & Resource Disposal** | **CODE-LEVEL VERIFIED** ✅ | 4/4 automated tests passed (stale pose, link styles, canvas memory). |
| **Static Code Quality** | **CODE-LEVEL VERIFIED** ✅ | `oxlint` found 0 warnings and 0 errors across 48 files. |
| **Production Compilation** | **CODE-LEVEL VERIFIED** ✅ | `vite build` completed successfully with minified bundle. |
| **WebXR Immersive Session Launch** | **VERIFIED ON DEVICE** ✅ | Tested on Samsung Galaxy Tab S9 FE with Chrome for Android. |
| **Camera Feed Passthrough** | **VERIFIED ON DEVICE** ✅ | Video passthrough renders fluidly behind 3D scene. |
| **Reference Space Negotiation** | **VERIFIED ON DEVICE** ✅ | Successfully negotiates `'local'` space on handheld ARCore. |
| **Surface Detection & Reticle** | **VERIFIED ON DEVICE** ✅ | Flat surface tracking detects desk planes and updates reticle transform. |
| **Workspace Anchor Placement** | **VERIFIED ON DEVICE** ✅ | Workspace platform anchors to physical desk and stays world-locked. |
| **Other Browsers (Samsung Internet / iOS)** | **NOT TESTED** ⚠️ | Requires future manual evaluation on specific hardware. |

---

## Recommended Demonstration Scenario

### 19-Step Interactive Demonstration Sequence

1. **Launch ARNetLab:** Navigate to the ARNetLab homepage on a WebXR-compatible mobile device (e.g. Chrome on Android).
2. **Open AR Lab:** Tap **Open AR Lab** from the landing page.
3. **Start AR Session:** Tap **Enter AR** and grant camera permissions.
4. **Surface Scanning:** Move the device slowly across a textured desk or table until the teal reticle appears flat on the surface.
5. **Place Workspace Anchor:** Tap the screen to place the circular workspace anchor.
6. **Place PC:** Select `PC` from the device palette and tap to place `PC-01`.
7. **Place Switch:** Select `Switch` and place `SWITCH-01` adjacent to the PC.
8. **Place Router:** Select `Router` and place `ROUTER-01` near the center.
9. **Place Server:** Select `Server` and place `SERVER-01`.
10. **Establish Links:** Switch to **Connect** mode and link:
    - `PC-01` ↔ `SWITCH-01`
    - `SWITCH-01` ↔ `ROUTER-01`
    - `ROUTER-01` ↔ `SERVER-01`
11. **Select Source:** Tap `PC-01` and tap **Set as Source** (displays emerald indicator ring).
12. **Select Destination:** Tap `SERVER-01` and tap **Set as Dest** (displays rose indicator ring).
13. **Observe Dijkstra Route:** Observe the computed shortest path highlighted with an illuminated emerald glowing beam.
14. **Dispatch Virtual Packet:** Tap **Send Packet** in the floating AR HUD.
15. **Observe Packet Traversal:** Watch the faceted amber 3D packet traverse edge-by-edge along the path at a constant world-space speed ($0.35\text{ m/s}$) with active gold link highlighting.
16. **Confirm Delivery:** Observe delivery feedback upon arrival at `SERVER-01` with actual elapsed simulation time displayed.
17. **Demonstrate Reset Network:** Tap **Reset Network** to clear all devices and links while maintaining the physical AR anchor.
18. **Demonstrate Exit AR:** Tap **Exit AR** to safely terminate the WebXR session and return to standard UI.
19. **Desktop Preview:** Open the application on a desktop browser to verify the interactive 2D topology tools and desktop fallback layout.

### Recommended Demonstration Topology

```
[ PC-01 ] ───────── (0.45m) ───────── [ SWITCH-01 ]
                                            │
                                         (0.35m)
                                            │
[ SERVER-01 ] ────── (0.50m) ───────── [ ROUTER-01 ]
```

*Alternate Shortest-Path Demonstration:* Add a direct high-cost bypass or secondary switch path (`SWITCH-02`) to demonstrate how Dijkstra automatically selects the path with minimal total Euclidean distance.

---

## Recommended Manual Screenshot Checklist

1. **Home Page:** Clean hero section with project tagline and device badges.
2. **AR Lab Pre-Session:** Device compatibility status and "Enter AR" trigger.
3. **Surface Detection:** Camera feed showing detected horizontal surface with teal reticle.
4. **Workspace Placed:** Indigo circular anchor platform world-locked onto a physical desk.
5. **Placed 3D Devices:** PC, Switch, Router, and Server arranged in 3D space with floating text labels.
6. **Connected Topology:** 3D cylindrical links interconnecting devices with Euclidean distance metrics.
7. **Dijkstra Route Highlight:** Glowing emerald beam illuminating the shortest path between Source and Destination.
8. **Packet in Transit:** Luminous amber icosahedron packet actively traversing an illuminated gold connection link.
9. **Delivery & Route HUD:** Telemetry pill showing elapsed transit duration and completed milestone status.
10. **Desktop Fallback UI:** 2D network controls and topology status on standard non-AR displays.

---

## Final Project Summary

ARNetLab is an interactive mobile Augmented Reality platform that enables students and educators to construct virtual computer-network topologies on real-world surfaces, calculate shortest routes using Dijkstra's algorithm based on 3D Euclidean distances, and visualize data packet traversal through the resulting network.

---

## Documentation

- [Project Report (PDF)](Documentation/ARNetLab_Report.pdf)
- [Project Presentation Slides (PDF)](Documentation/ARNetLab_Slides.pdf)

