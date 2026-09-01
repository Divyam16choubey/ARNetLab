# ARNetLab

> **Build. Connect. Route. Visualize.**

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing** is an educational project idea for exploring computer-network topologies in a physical space. The intended experience is to place virtual devices such as PCs, switches, routers, and servers on a real surface, connect them, and observe a route between selected devices.

## Repository status

This repository is at an initial documentation stage. It does **not** currently include application source code, a `package.json`, a runnable web application, or an AR implementation. The sections below clearly separate the project goal from features that still need to be built.

## Features

### Currently implemented

- Initial project README
- Project report and presentation files in `Documentation/`

### Planned / future improvements

- A React-based user interface with Tailwind CSS
- Three.js / React Three Fiber 3D scene rendering
- WebXR-based AR sessions for supported mobile devices
- Plane detection, hit testing, and 3D device placement
- Network devices, connections, and topology editing
- A graph model in which devices are nodes and connections are edges
- Source and destination selection
- Shortest-path routing, including evaluation of Dijkstra's algorithm
- Packet movement or animation along a calculated route
- Additional device types, richer simulations, and packet inspection
- Improved mobile compatibility, AR tracking, and multi-user support
- Educational analytics and, if appropriate, real-traffic integrations

## Intended application flow

The planned AR experience would follow this flow:

```text
Mobile camera
    ↓
AR plane detection
    ↓
Hit testing
    ↓
3D device placement
    ↓
Network graph
    ↓
Routing
    ↓
Packet visualization
```

1. **Surface detection** — An AR-capable browser would use the camera to find a suitable horizontal surface.
2. **Node placement** — A tap on that surface would place a virtual network device at the detected position.
3. **Network construction** — Placed devices would become graph nodes; user-created links would become edges.
4. **Routing** — The application would find a path between a selected source and destination.
5. **Packet visualization** — A visual packet would move through the selected path so that the route is easier to understand.

These steps describe the intended application; none of them are implemented in the current source tree.

## Network and routing

The planned model represents each network device as a node and each connection as an edge. A future routing module could use the 3D positions of connected devices to calculate an edge weight using Euclidean distance:

```text
d = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²)
```

That distance could then be used for shortest-path routing. No graph implementation, distance calculation, or routing algorithm is currently present in this repository. Dijkstra's algorithm is a planned option for the routing module, not a current feature.

## Project structure

```text
ARNetLab/
├── Documentation/
│   ├── ARNetLab_Report.pdf      # Project report
│   └── ARNetLab_Slides.pdf      # Project presentation
└── README.md                    # Project overview and status
```

## Getting started

There is no installable or runnable application yet, so `npm install` and `npm run dev` are not available. To obtain the current project materials:

```bash
git clone https://github.com/Divyam16choubey/ARNetLab.git
cd ARNetLab
```

### Prerequisites

- Git, to clone the repository
- A PDF reader, to view the project report and slides

When the application is added, its source code and package configuration should define the required Node.js version, dependencies, and development commands.

## Running the AR version

An AR version cannot be run from the current repository because no web or mobile implementation has been committed. Once an AR client is added, its setup documentation should state the supported devices and browsers, whether WebXR is required, and any secure-context or HTTPS requirements.

## Usage

There is no user interface to operate at this stage. The intended future workflow is to start an AR session, scan a surface, place devices, connect them, choose source and destination devices, and visualize the calculated route.

## Documentation

- [Project report](Documentation/ARNetLab_Report.pdf)
- [Project slides](Documentation/ARNetLab_Slides.pdf)

## Next steps

1. Add the application source and package configuration.
2. Implement and test device placement and topology editing.
3. Add the graph and routing module.
4. Add packet visualization and document supported AR devices.
