import {
  ExternalLink,
  BookOpen,
  Code2,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/layout/PageHeader';

const TECH_STACK = [
  { name: 'React 18+', description: 'Component-based UI framework' },
  { name: 'Vite', description: 'Fast build tool and dev server' },
  { name: 'Three.js', description: '3D rendering and WebXR integration' },
  { name: 'React Router', description: 'Client-side routing' },
  { name: 'Lucide React', description: 'Lightweight icon library' },
  { name: 'Tailwind CSS', description: 'Utility-first styling system and design tokens' },
];

const IMPLEMENTED = [
  'Responsive landing page with project overview',
  'AR Lab workspace with real WebXR AR mode',
  'WebXR immersive-ar session lifecycle',
  'AR support detection and compatibility UI',
  'WebXR hit testing for real-time surface detection',
  'Placement reticle tracking detected surfaces',
  'Tap-to-place AR workspace anchor',
  'Procedural 3D network device models (PC, Switch, Router, Server)',
  'Interactive device placement on detected horizontal surfaces',
  'Three.js raycasting object selection with glow highlight',
  'Auto-generated floating text labels (e.g. PC-01, ROUTER-01)',
  'Contextual device inspector card with live deletion',
  'NetworkGraph adjacency list undirected graph model',
  'Interactive 3D visual line connections between devices',
  'Automatic 3D Euclidean distance edge weight calculation',
  'Source and Destination device role selection with glowing indicators',
  'Dijkstra shortest-path routing algorithm with dynamic edge weight evaluation',
  'Real-time 3D AR route highlighting with emerald glowing aura',
  'Dynamic topology updates (route invalidation/recalculation on node/edge deletion)',
  'Dual reset system: Reset Network vs Reset Workspace',
  'Virtual 3D packet simulation engine (PacketSimulator.js)',
  'Faceted glowing 3D packet mesh with halo pulsation',
  'Constant-speed time-based interpolation along shortest route',
  'Active packet edge highlighting during link traversal',
  'Hop-by-hop milestone events and destination delivery feedback',
  'Topology-aware simulation safety (instant halt on node/edge deletion)',
  'Mobile-first touch controls with safe-area padding',
  'Dark and light theme with persistence',
  'Reusable UI component library with Tailwind CSS styling',
  'Page routing (Home, AR Lab, How It Works, About)',
];

const PLANNED = [
  { feature: 'Real Android device hardware field testing', phase: 6 },
  { feature: 'WebXR camera tracking stability & drift compensation', phase: 6 },
  { feature: 'Mobile performance profiling and memory optimization', phase: 6 },
  { feature: 'Cross-browser compatibility validation (Chrome, Samsung Internet)', phase: 6 },
];

export default function AboutPage() {
  return (
    <div className="pb-20 container">
      <PageHeader
        title="About ARNetLab"
        subtitle="An educational augmented reality platform for network topology visualization and routing."
      />

      {/* Description */}
      <section className="mb-10 animate-fade-in-up">
        <Card icon={<BookOpen size={22} />} title="Project Overview">
          <p>
            ARNetLab (Augmented Reality Network Lab) is an interactive
            learning platform that enables users to construct computer network
            topologies in augmented reality. By placing virtual devices on
            real-world surfaces, students can explore how networks are built,
            how devices connect, and how data is routed through a topology.
          </p>
          <p className="mt-3">
            The project is being developed in phases, starting with the UI
            foundation and progressively adding AR integration, 3D
            rendering, network logic, and packet simulation.
          </p>
        </Card>
      </section>

      {/* Tech Stack */}
      <section className="mb-10 animate-fade-in-up delay-1">
        <h2 className="flex items-center gap-3 text-xl font-bold mb-5 text-neutral-900 dark:text-neutral-50 [&_svg]:text-primary-500 [&_svg]:shrink-0">
          <Code2 size={22} />
          Technology Stack
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {TECH_STACK.map(({ name, description }) => (
            <div
              key={name}
              className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <h4 className="text-sm font-semibold mb-1 text-neutral-900 dark:text-neutral-50">
                {name}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Status */}
      <section className="mb-10 animate-fade-in-up delay-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Implemented */}
          <div>
            <h2 className="flex items-center gap-3 text-xl font-bold mb-5 text-neutral-900 dark:text-neutral-50 [&_svg]:text-primary-500 [&_svg]:shrink-0">
              <CheckCircle2 size={22} />
              Implemented (Phases 1–5)
            </h2>
            <ul className="flex flex-col gap-3">
              {IMPLEMENTED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-neutral-900 dark:text-neutral-50 leading-relaxed"
                >
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Planned */}
          <div>
            <h2 className="flex items-center gap-3 text-xl font-bold mb-5 text-neutral-900 dark:text-neutral-50 [&_svg]:text-primary-500 [&_svg]:shrink-0">
              <Clock size={22} />
              Planned (Future Phases)
            </h2>
            <ul className="flex flex-col gap-3">
              {PLANNED.map(({ feature, phase }) => (
                <li
                  key={feature}
                  className="flex items-start flex-wrap gap-2 text-sm text-neutral-900 dark:text-neutral-50 leading-relaxed"
                >
                  <Clock size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                  <Badge variant="upcoming">Phase {phase}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="mb-10 animate-fade-in-up delay-3">
        <h2 className="flex items-center gap-3 text-xl font-bold mb-5 text-neutral-900 dark:text-neutral-50 [&_svg]:text-primary-500 [&_svg]:shrink-0">
          <Layers size={22} />
          Resources
        </h2>
        <div className="flex gap-3 flex-wrap">
          <a
            href="https://github.com/Divyam16choubey/ARNetLab"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" icon={<ExternalLink size={18} />}>
              View on GitHub
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
