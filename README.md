# ARNetLab

**ARNetLab: An Interactive Augmented Reality Platform for Network Topology Visualization and Routing**

> Build. Connect. Route. Visualize.

## Overview

ARNetLab lets users build and visualize a computer network directly on a real-world surface using augmented reality. Users can place virtual network devices, connect them, inspect distances, choose source and destination nodes, calculate a route, and visualize packets moving through the network.

The project is designed to make learning about network topologies and routing algorithms more interactive and spatial, bridging the gap between theoretical network diagrams and physical space.

## Features

- **Markerless AR surface detection**: Detects real-world horizontal surfaces (like a desk) to place your network.
- **Placement of virtual network devices**: Support for placing PC, Router, Switch, and Server nodes in 3D space.
- **Connecting network nodes**: Link devices together to form a network topology.
- **Distance visualization**: Automatically calculates the physical Euclidean distance between connected nodes.
- **Source and destination selection**: Pick where a packet starts and where it needs to go.
- **Shortest-path/routing calculation**: Computes the optimal path through the network using Dijkstra's algorithm.
- **Packet transmission visualization**: Watch an animated 3D packet travel along the calculated route.
- **Interactive AR network topology**: Manage devices and connections through a responsive AR overlay.
- **Mobile AR support**: Fully interactive on WebXR-compatible mobile browsers.

## How It Works

Using ARNetLab involves a straightforward, interactive flow:

1. Open AR Lab on a compatible mobile device.
2. Start the AR session and allow camera permissions.
3. Slowly pan your camera to detect a physical surface and place your workspace anchor.
4. Place network devices (PCs, Switches, Routers, Servers) around your physical space.
5. Connect the devices together using the link tool.
6. Select a source node and a destination node.
7. Calculate the shortest route between them.
8. Send a packet and observe it moving through the network along the optimal path.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Three.js
- WebXR
- JavaScript

## Project Structure

```text
ARNetLab/
├── public/                 # Static assets and favicon
├── src/
│   ├── ar/                 # WebXR, Three.js managers, and 3D device factory
│   ├── components/         # React UI components (AR overlay, network controls, common UI)
│   ├── context/            # React context for global state (ARContext, ThemeContext)
│   ├── hooks/              # Custom React hooks
│   ├── network/            # Routing logic (Dijkstra) and packet simulation engine
│   ├── pages/              # Application views (Home, AR Lab, About, How It Works)
│   ├── styles/             # Global CSS and Tailwind directives
│   ├── types/              # JSDoc type definitions
│   ├── App.jsx             # Main application routing
│   └── main.jsx            # React mounting entry point
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite configuration
```

## Routing / Network Logic

ARNetLab uses **Dijkstra's algorithm** to compute the shortest path between the selected source and destination nodes. 

Instead of arbitrary link weights, the edge weights are based entirely on the **3D Euclidean distance** between the devices in your physical space. Moving devices further apart increases the cost of that path, dynamically altering the calculated route.

*Note: This is a visual simulation designed for educational purposes. It does not transmit real network traffic or interface with actual internet packets.*

## Getting Started

To run the project locally on your machine:

```bash
git clone https://github.com/Divyam16choubey/ARNetLab.git
cd ARNetLab
npm install
npm run dev
```

Then, open the local development URL provided by Vite (usually `http://localhost:5173`) in your browser.

## Build

To create a production-ready build:

```bash
npm run build
```

This will generate a `dist/` folder with the compiled application.

## Deployment

The project is currently deployed and hosted on Netlify.

**Production URL:** [https://arnetlab.netlify.app](https://arnetlab.netlify.app)

## Mobile / AR Requirements

AR functionality requires a compatible mobile browser (like Google Chrome for Android) with WebXR support, and the application must be served over a secure context (HTTPS). 

The AR features have been manually tested and verified working on a **Samsung Galaxy Tab S9 FE**.

## Current Status

- Core AR interaction: working
- Device placement: working
- Network connections: working
- Distance visualization: working
- Routing: working
- Packet visualization: working
- Local development: verified
- Netlify deployment: verified
- Real-device AR test: verified on Samsung Galaxy Tab S9 FE

## Limitations

- This is a visualization and simulation tool, not a real network traffic simulator.
- Device and browser WebXR support can vary heavily across different mobile platforms (iOS support requires a WebXR viewer app or experimental Safari flags).
- Multi-user synchronized AR (seeing the same network across multiple devices) is not implemented.
- Advanced packet inspection and protocol-specific simulations (like TCP handshakes) are not part of the current engine.

## Future Improvements

- Add more network device types (e.g., firewalls, access points).
- Support alternative routing algorithms for comparison.
- Implement persistent network projects so layouts can be saved and loaded later.
