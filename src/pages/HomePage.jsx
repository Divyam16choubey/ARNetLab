import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Monitor,
  Router,
  Server,
  ToggleLeft,
  Network,
  Eye,
  Route,
  Box,
  Smartphone,
  Layers,
  Zap,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const CAPABILITIES = [
  {
    icon: <Box size={22} />,
    title: 'AR Device Placement',
    description:
      'Place virtual PCs, switches, routers, and servers on real-world surfaces using augmented reality.',
    status: 'Implemented in Phase 3',
  },
  {
    icon: <Network size={22} />,
    title: 'Network Topology Builder',
    description:
      'Create connections between devices to build network topologies visually in 3D space.',
    status: 'Planned for Phase 4',
  },
  {
    icon: <Route size={22} />,
    title: 'Shortest Path Routing',
    description:
      'Select source and destination nodes, then compute the shortest route through your network.',
    status: 'Planned for Phase 4',
  },
  {
    icon: <Eye size={22} />,
    title: 'Packet Visualization',
    description:
      'Watch a virtual packet travel along the computed route, animating through each hop in real time.',
    status: 'Planned for Phase 5',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Scan Surface',
    description: 'Point your device camera at a flat surface like a desk or table.',
    icon: <Smartphone size={20} />,
  },
  {
    number: '02',
    title: 'Place Devices',
    description: 'Tap to place virtual network devices — PCs, switches, routers, and servers.',
    icon: <Layers size={20} />,
  },
  {
    number: '03',
    title: 'Build Topology',
    description: 'Connect devices to form a network graph with weighted edges.',
    icon: <Network size={20} />,
  },
  {
    number: '04',
    title: 'Route & Visualize',
    description: 'Select endpoints, calculate the shortest path, and watch the packet move.',
    icon: <Zap size={20} />,
  },
];

const DEVICES = [
  { icon: <Monitor size={28} />, label: 'PC', color: '#3b82f6' },
  { icon: <ToggleLeft size={28} />, label: 'Switch', color: '#22c55e' },
  { icon: <Router size={28} />, label: 'Router', color: '#f59e0b' },
  { icon: <Server size={28} />, label: 'Server', color: '#a855f7' },
];

export default function HomePage() {
  return (
    <div>
      {/* =================== HERO =================== */}
      <section className="bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-[#0c0a20] dark:via-[#0a1628] dark:to-[#0c1220] py-16 pb-20 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center container">
          <div className="flex-1 flex flex-col gap-5 max-w-[580px] animate-fade-in-up">
            <div>
              <Badge variant="info">Educational AR Platform</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.1] text-neutral-900 dark:text-neutral-50">
              Build. Connect.{' '}
              <span className="bg-gradient-to-br from-primary-500 to-accent-500 bg-clip-text text-transparent">
                Route.
              </span>{' '}
              Visualize.
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-[500px]">
              ARNetLab is an interactive augmented reality platform for
              constructing, exploring, and understanding computer network
              topologies — right on your desk.
            </p>
            <div className="flex gap-3 flex-wrap mt-2">
              <Link to="/ar-lab">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                >
                  Open AR Lab
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Concept Visual */}
          <div className="shrink-0 flex flex-col items-center gap-4 animate-fade-in-up delay-2">
            <div className="grid grid-cols-2 gap-4">
              {DEVICES.map(({ icon, label, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 min-w-[110px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ '--hover-color': color }}
                >
                  <div style={{ color }}>{icon}</div>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
              Network devices you will place in AR
            </div>
          </div>
        </div>
      </section>

      {/* =================== WHAT IS =================== */}
      <section className="py-20" id="what-is">
        <div className="container">
          <div className="text-center mb-12 flex flex-col items-center gap-4 animate-fade-in-up">
            <Badge variant="info">About the Project</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              What is ARNetLab?
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-[600px] leading-relaxed">
              ARNetLab is an educational platform that combines augmented reality
              with computer network concepts. It allows students and learners to
              build network topologies by placing virtual devices on real-world
              surfaces, connect them, and visualize how data packets route
              through a network.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-2">
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                Interactive
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Construct networks by physically interacting with an AR
                environment — not just reading about them.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                Visual
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                See topology, routing paths, and packet movement rendered in 3D
                on your real-world surface.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                Educational
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Understand network layers, switching, routing, and shortest-path
                algorithms through hands-on exploration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================== CAPABILITIES =================== */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900" id="capabilities">
        <div className="container">
          <div className="text-center mb-12 flex flex-col items-center gap-4 animate-fade-in-up">
            <Badge variant="upcoming">Under Development</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Core Capabilities
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-[600px] leading-relaxed">
              These features are planned for upcoming phases of development.
              The current version provides the application foundation and UI
              structure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CAPABILITIES.map(({ icon, title, description, status }, i) => (
              <Card
                key={title}
                icon={icon}
                title={title}
                hoverable
                className={`animate-fade-in-up delay-${i + 1}`}
              >
                <p>{description}</p>
                <div className="mt-3">
                  <Badge variant="upcoming">
                    {status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section className="py-20" id="how-it-works">
        <div className="container">
          <div className="text-center mb-12 flex flex-col items-center gap-4 animate-fade-in-up">
            <Badge variant="info">Planned Workflow</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              How It Will Work
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-[600px] leading-relaxed">
              The intended AR experience follows these steps. These are planned
              features, not yet implemented.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ number, title, description, icon }, i) => (
              <div
                key={number}
                className={`text-center p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col items-center gap-3 animate-fade-in-up delay-${i + 1}`}
              >
                <div className="text-sm font-bold text-primary-500 tracking-wider">
                  {number}
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/12 dark:text-primary-400">
                  {icon}
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                  {title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CTA =================== */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
        <div className="container">
          <div className="text-center flex flex-col items-center gap-4 py-12 px-6 rounded-3xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              Ready to Explore?
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-[440px]">
              Visit the AR Lab to see the workspace foundation. Full AR
              functionality will be available in upcoming phases.
            </p>
            <Link to="/ar-lab">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
              >
                Enter AR Lab
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
