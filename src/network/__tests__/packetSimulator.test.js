import { NetworkGraph } from '../NetworkGraph.js';
import { findShortestPath } from '../dijkstra.js';
import { PacketSimulator, SIMULATION_STATUS } from '../PacketSimulator.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runPacketSimulatorTests() {
  const results = [];

  // TEST 1: Direct transmission A -> B. Packet reaches B.
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addEdge('A', 'B', 1.0);

    const route = findShortestPath(g, 'A', 'B');
    let reached = false;
    let completed = false;

    const sim = new PacketSimulator({
      speed: 10.0, // fast for testing
      onNodeReached: (ev) => {
        if (ev.nodeId === 'B') reached = true;
      },
      onComplete: () => {
        completed = true;
      },
    });

    const started = sim.start(route, g);
    assert(started, 'Test 1: start failed');
    assert(sim.isRunning(), 'Test 1: should be running');

    // Simulate 0.2s at 10 m/s (distance is 1.0m, will advance to B in 0.1s)
    sim.update(0.2, g);

    assert(reached, 'Test 1: Node B was reached');
    assert(completed, 'Test 1: Simulation completed');
    assert(sim.status === SIMULATION_STATUS.COMPLETED, 'Test 1: status is COMPLETED');
    assert(sim.currentPosition.x === 1, 'Test 1: final position at B');
    results.push('Test 1: Direct A -> B reached destination passed.');
  }

  // TEST 2: Multi-hop A -> B -> C. Packet visits B then C.
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addNode({ id: 'C', label: 'C', position: { x: 2, y: 0, z: 0 } });
    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);

    const route = findShortestPath(g, 'A', 'C');
    const visitedNodes = [];

    const sim = new PacketSimulator({
      speed: 10.0,
      onNodeReached: (ev) => visitedNodes.push(ev.nodeId),
    });

    sim.start(route, g);

    // Step 1: Advance 0.15s (should reach B and start moving towards C)
    sim.update(0.15, g);
    assert(visitedNodes.includes('B'), 'Test 2: Visited B');
    assert(sim.currentNodeId === 'B', 'Test 2: Current node is B');
    assert(sim.nextNodeId === 'C', 'Test 2: Next node is C');

    // Step 2: Advance another 0.15s (should reach C and complete)
    sim.update(0.15, g);
    assert(visitedNodes.includes('C'), 'Test 2: Visited C');
    assert(sim.status === SIMULATION_STATUS.COMPLETED, 'Test 2: Completed at C');
    assert(JSON.stringify(visitedNodes) === JSON.stringify(['B', 'C']), 'Test 2: Visited order B, then C');
    results.push('Test 2: Multi-hop A -> B -> C order passed.');
  }

  // TEST 3: Alternate routes: A -> B -> C (cost 2) vs A -> C (cost 10)
  // Packet must follow the Dijkstra-selected route A -> B -> C
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addNode({ id: 'C', label: 'C', position: { x: 2, y: 0, z: 0 } });
    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);
    g.addEdge('A', 'C', 10.0);

    const route = findShortestPath(g, 'A', 'C');
    assert(JSON.stringify(route.path) === JSON.stringify(['A', 'B', 'C']), 'Test 3: Dijkstra picked A-B-C');

    const edgeTraversal = [];
    const sim = new PacketSimulator({
      speed: 10.0,
      onEdgeChanged: (ev) => edgeTraversal.push(ev.edgeId),
    });

    sim.start(route, g);
    sim.update(0.15, g); // hop 1
    sim.update(0.15, g); // hop 2

    assert(edgeTraversal.length === 2, 'Test 3: 2 edges traversed');
    assert(edgeTraversal[0].includes('A') && edgeTraversal[0].includes('B'), 'Test 3: First edge A-B');
    assert(edgeTraversal[1].includes('B') && edgeTraversal[1].includes('C'), 'Test 3: Second edge B-C');
    results.push('Test 3: Follows Dijkstra-selected route passed.');
  }

  // TEST 4: No route exists -> Packet cannot start.
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    // No edge

    const route = findShortestPath(g, 'A', 'B');
    assert(!route.reachable, 'Test 4: Route unreachable');

    let errorFired = false;
    const sim = new PacketSimulator({
      onError: () => {
        errorFired = true;
      },
    });

    const started = sim.start(route, g);
    assert(!started, 'Test 4: Cannot start with empty/unreachable route');
    assert(errorFired, 'Test 4: onError fired');
    assert(sim.status === SIMULATION_STATUS.ERROR, 'Test 4: Status is ERROR');
    results.push('Test 4: Unreachable route prevention passed.');
  }

  // TEST 5: Source == Destination -> Handled safely
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });

    const route = findShortestPath(g, 'A', 'A');
    assert(route.path.length === 1, 'Test 5: Path has 1 node');

    const sim = new PacketSimulator();
    const started = sim.start(route, g);
    assert(!started, 'Test 5: Start rejected because path length < 2');
    results.push('Test 5: Source == Destination handled safely passed.');
  }

  // TEST 6: Edge deleted before simulation -> Packet uses newly calculated route
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addNode({ id: 'C', label: 'C', position: { x: 2, y: 0, z: 0 } });
    g.addNode({ id: 'D', label: 'D', position: { x: 1, y: 1, z: 0 } });

    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);
    g.addEdge('A', 'D', 1.2);
    g.addEdge('D', 'C', 1.2);

    // Initial shortest path: A -> B -> C
    let route = findShortestPath(g, 'A', 'C');
    assert(JSON.stringify(route.path) === JSON.stringify(['A', 'B', 'C']), 'Test 6: Initial path A-B-C');

    // Remove B-C edge before starting simulation
    g.removeEdge('B', 'C');

    // Recalculate route
    route = findShortestPath(g, 'A', 'C');
    assert(JSON.stringify(route.path) === JSON.stringify(['A', 'D', 'C']), 'Test 6: Recalculated path A-D-C');

    const visitedNodes = [];
    const sim = new PacketSimulator({
      speed: 10.0,
      onNodeReached: (ev) => visitedNodes.push(ev.nodeId),
    });

    sim.start(route, g);
    for (let i = 0; i < 5; i++) {
      sim.update(0.1, g); // advance frames
    }

    assert(visitedNodes.includes('D') && visitedNodes.includes('C'), 'Test 6: Traversed through D and C');
    assert(!visitedNodes.includes('B'), 'Test 6: B was not traversed');
    results.push('Test 6: Pre-simulation edge deletion uses updated route passed.');
  }

  // TEST 7: Route invalidated while packet is running -> Simulation stops safely
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addNode({ id: 'C', label: 'C', position: { x: 2, y: 0, z: 0 } });
    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);

    const route = findShortestPath(g, 'A', 'C');
    let errorFired = false;

    const sim = new PacketSimulator({
      speed: 1.0,
      onError: () => {
        errorFired = true;
      },
    });

    sim.start(route, g);
    sim.update(0.5, g); // Packet is halfway between A and B
    assert(sim.isRunning(), 'Test 7: Simulation running halfway');

    // Delete edge B-C mid-flight!
    g.removeEdge('B', 'C');

    // Inform simulator or next update checks topology
    const stopped = sim.handleTopologyChange(g);
    assert(stopped, 'Test 7: Topology check caught broken path');
    assert(!sim.isRunning(), 'Test 7: Simulation no longer running');
    assert(sim.status === SIMULATION_STATUS.ERROR, 'Test 7: Status set to ERROR');
    assert(errorFired, 'Test 7: Error callback fired');
    results.push('Test 7: Mid-simulation edge deletion halts safely passed.');
  }

  // TEST 8: Network reset during simulation -> Packet removed, state reset
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addEdge('A', 'B', 1.0);

    const route = findShortestPath(g, 'A', 'B');
    const sim = new PacketSimulator({ speed: 1.0 });

    sim.start(route, g);
    sim.update(0.2, g);
    assert(sim.isRunning(), 'Test 8: Running');

    // Simulate resetNetwork
    sim.stop();
    sim.reset(false);

    assert(sim.status === SIMULATION_STATUS.IDLE, 'Test 8: Status is IDLE');
    assert(sim.packetId === null, 'Test 8: Packet cleared');
    assert(sim.routeNodeIds.length === 0, 'Test 8: Route cleared');
    results.push('Test 8: Network reset during simulation cleans up passed.');
  }

  // TEST 9: Send packet after completion -> A new packet starts cleanly
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addEdge('A', 'B', 1.0);

    const route = findShortestPath(g, 'A', 'B');
    const sim = new PacketSimulator({ speed: 10.0 });

    // Run 1
    sim.start(route, g);
    const firstPktId = sim.packetId;
    sim.update(0.2, g);
    assert(sim.status === SIMULATION_STATUS.COMPLETED, 'Test 9: Run 1 completed');

    // Run 2 (Send Again)
    const startedAgain = sim.start(route, g);
    assert(startedAgain, 'Test 9: Can start again after completion');
    const secondPktId = sim.packetId;
    assert(firstPktId !== secondPktId, 'Test 9: New distinct packet ID created');
    assert(sim.progress === 0, 'Test 9: Progress reset to 0');
    assert(sim.currentNodeId === 'A', 'Test 9: Starts at A again');
    results.push('Test 9: Send packet after completion cleanly restarts passed.');
  }

  // TEST 10: Delete destination during simulation -> Simulation stops safely and stale references removed
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addNode({ id: 'C', label: 'C', position: { x: 2, y: 0, z: 0 } });
    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);

    const route = findShortestPath(g, 'A', 'C');
    let errorMsg = null;
    const sim = new PacketSimulator({
      speed: 1.0,
      onError: (ev) => {
        errorMsg = ev.message;
      },
    });

    sim.start(route, g);
    sim.update(0.2, g); // Running between A and B

    // Delete destination node C
    g.removeNode('C');

    // Update triggers topology verification
    sim.update(0.2, g);
    assert(!sim.isRunning(), 'Test 10: Stopped when destination deleted');
    assert(sim.status === SIMULATION_STATUS.ERROR, 'Test 10: Status is ERROR');
    assert(errorMsg !== null, 'Test 10: Error message recorded');
    results.push('Test 10: Destination deletion mid-transit stops safely passed.');
  }

  return results;
}

// Run when executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('packetSimulator.test.js')) {
  try {
    const res = runPacketSimulatorTests();
    console.log('ALL PACKET SIMULATOR TESTS PASSED:\n' + res.join('\n'));
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}
