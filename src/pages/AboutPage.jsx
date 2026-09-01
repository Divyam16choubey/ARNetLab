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
import './AboutPage.css';

const TECH_STACK = [
  { name: 'React 18+', description: 'Component-based UI framework' },
  { name: 'Vite', description: 'Fast build tool and dev server' },
  { name: 'React Router', description: 'Client-side routing' },
  { name: 'Lucide React', description: 'Lightweight icon library' },
  { name: 'Vanilla CSS', description: 'Custom properties and design tokens' },
];

const IMPLEMENTED = [
  'Responsive landing page with project overview',
  'AR Lab workspace layout (UI shell)',
  'Mobile-first responsive design',
  'Dark and light theme with persistence',
  'Reusable UI component library',
  'Network device type constants and UI foundations',
  'Page routing (Home, AR Lab, How It Works, About)',
  'Accessible navigation with mobile menu',
];

const PLANNED = [
  { feature: 'WebXR AR session management', phase: 2 },
  { feature: 'Camera-based plane detection', phase: 2 },
  { feature: 'Hit testing and surface anchoring', phase: 2 },
  { feature: '3D device placement (Three.js / R3F)', phase: 2 },
  { feature: 'Network graph state management', phase: 2 },
  { feature: 'Device connections and edge creation', phase: 2 },
  { feature: 'Shortest-path routing algorithm', phase: 3 },
  { feature: 'Packet visualization and animation', phase: 3 },
];

export default function AboutPage() {
  return (
    <div className="about container">
      <PageHeader
        title="About ARNetLab"
        subtitle="An educational augmented reality platform for network topology visualization and routing."
      />

      {/* Description */}
      <section className="about__section animate-fade-in-up">
        <Card icon={<BookOpen size={22} />} title="Project Overview">
          <p>
            ARNetLab (Augmented Reality Network Lab) is an interactive
            learning platform that enables users to construct computer network
            topologies in augmented reality. By placing virtual devices on
            real-world surfaces, students can explore how networks are built,
            how devices connect, and how data is routed through a topology.
          </p>
          <p style={{ marginTop: 'var(--space-3)' }}>
            The project is being developed in phases, starting with the UI
            foundation and progressively adding AR integration, 3D
            rendering, network logic, and packet simulation.
          </p>
        </Card>
      </section>

      {/* Tech Stack */}
      <section className="about__section animate-fade-in-up delay-1">
        <h2 className="about__section-title">
          <Code2 size={22} />
          Technology Stack
        </h2>
        <div className="about__tech-grid">
          {TECH_STACK.map(({ name, description }) => (
            <div key={name} className="about__tech-item">
              <h4>{name}</h4>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Status */}
      <section className="about__section animate-fade-in-up delay-2">
        <div className="about__status-grid">
          {/* Implemented */}
          <div>
            <h2 className="about__section-title">
              <CheckCircle2 size={22} />
              Implemented (Phase 1)
            </h2>
            <ul className="about__checklist">
              {IMPLEMENTED.map((item) => (
                <li key={item} className="about__checklist-item">
                  <CheckCircle2 size={16} className="about__check-icon" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Planned */}
          <div>
            <h2 className="about__section-title">
              <Clock size={22} />
              Planned (Future Phases)
            </h2>
            <ul className="about__checklist">
              {PLANNED.map(({ feature, phase }) => (
                <li key={feature} className="about__checklist-item about__checklist-item--planned">
                  <Clock size={16} className="about__clock-icon" />
                  <span>{feature}</span>
                  <Badge variant="upcoming">Phase {phase}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="about__section animate-fade-in-up delay-3">
        <h2 className="about__section-title">
          <Layers size={22} />
          Resources
        </h2>
        <div className="about__links">
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
