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
import './HomePage.css';

const CAPABILITIES = [
  {
    icon: <Box size={22} />,
    title: 'AR Device Placement',
    description:
      'Place virtual PCs, switches, routers, and servers on real-world surfaces using augmented reality.',
    status: 'Planned for Phase 2',
  },
  {
    icon: <Network size={22} />,
    title: 'Network Topology Builder',
    description:
      'Create connections between devices to build network topologies visually in 3D space.',
    status: 'Planned for Phase 2',
  },
  {
    icon: <Route size={22} />,
    title: 'Shortest Path Routing',
    description:
      'Select source and destination nodes, then compute the shortest route through your network.',
    status: 'Planned for Phase 3',
  },
  {
    icon: <Eye size={22} />,
    title: 'Packet Visualization',
    description:
      'Watch a virtual packet travel along the computed route, animating through each hop in real time.',
    status: 'Planned for Phase 3',
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
    <div className="home">
      {/* =================== HERO =================== */}
      <section className="hero">
        <div className="hero__inner container">
          <div className="hero__content animate-fade-in-up">
            <Badge variant="info">Educational AR Platform</Badge>
            <h1 className="hero__title">
              Build. Connect.{' '}
              <span className="hero__title--accent">Route.</span> Visualize.
            </h1>
            <p className="hero__subtitle">
              ARNetLab is an interactive augmented reality platform for
              constructing, exploring, and understanding computer network
              topologies — right on your desk.
            </p>
            <div className="hero__actions">
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
          <div className="hero__visual animate-fade-in-up delay-2">
            <div className="hero__device-grid">
              {DEVICES.map(({ icon, label, color }) => (
                <div
                  key={label}
                  className="hero__device"
                  style={{ '--device-color': color }}
                >
                  <div className="hero__device-icon">{icon}</div>
                  <span className="hero__device-label">{label}</span>
                </div>
              ))}
            </div>
            <div className="hero__visual-label">
              Network devices you will place in AR
            </div>
          </div>
        </div>
      </section>

      {/* =================== WHAT IS =================== */}
      <section className="section" id="what-is">
        <div className="container">
          <div className="section__header animate-fade-in-up">
            <Badge variant="info">About the Project</Badge>
            <h2 className="section__title">What is ARNetLab?</h2>
            <p className="section__description">
              ARNetLab is an educational platform that combines augmented reality
              with computer network concepts. It allows students and learners to
              build network topologies by placing virtual devices on real-world
              surfaces, connect them, and visualize how data packets route
              through a network.
            </p>
          </div>
          <div className="what-is__highlights animate-fade-in-up delay-2">
            <div className="what-is__highlight">
              <h4>Interactive</h4>
              <p>
                Construct networks by physically interacting with an AR
                environment — not just reading about them.
              </p>
            </div>
            <div className="what-is__highlight">
              <h4>Visual</h4>
              <p>
                See topology, routing paths, and packet movement rendered in 3D
                on your real-world surface.
              </p>
            </div>
            <div className="what-is__highlight">
              <h4>Educational</h4>
              <p>
                Understand network layers, switching, routing, and shortest-path
                algorithms through hands-on exploration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================== CAPABILITIES =================== */}
      <section className="section section--alt" id="capabilities">
        <div className="container">
          <div className="section__header animate-fade-in-up">
            <Badge variant="upcoming">Under Development</Badge>
            <h2 className="section__title">Core Capabilities</h2>
            <p className="section__description">
              These features are planned for upcoming phases of development.
              The current version provides the application foundation and UI
              structure.
            </p>
          </div>
          <div className="capabilities__grid">
            {CAPABILITIES.map(({ icon, title, description, status }, i) => (
              <Card
                key={title}
                icon={icon}
                title={title}
                hoverable
                className={`animate-fade-in-up delay-${i + 1}`}
              >
                <p>{description}</p>
                <Badge variant="upcoming" className="capabilities__badge">
                  {status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section__header animate-fade-in-up">
            <Badge variant="info">Planned Workflow</Badge>
            <h2 className="section__title">How It Will Work</h2>
            <p className="section__description">
              The intended AR experience follows these steps. These are planned
              features, not yet implemented.
            </p>
          </div>
          <div className="steps__grid">
            {STEPS.map(({ number, title, description, icon }, i) => (
              <div
                key={number}
                className={`step animate-fade-in-up delay-${i + 1}`}
              >
                <div className="step__number">{number}</div>
                <div className="step__icon">{icon}</div>
                <h3 className="step__title">{title}</h3>
                <p className="step__description">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================== CTA =================== */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta animate-fade-in-up">
            <h2 className="cta__title">Ready to Explore?</h2>
            <p className="cta__description">
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
