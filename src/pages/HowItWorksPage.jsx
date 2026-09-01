import {
  Smartphone,
  ScanLine,
  MousePointerClick,
  Network,
  Route,
  Play,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import PageHeader from '../components/layout/PageHeader';
import './HowItWorksPage.css';

const WORKFLOW_STEPS = [
  {
    number: 1,
    icon: <Smartphone size={24} />,
    title: 'Open on a Mobile Device',
    description:
      'Launch ARNetLab in a WebXR-compatible mobile browser. The application will request camera access to begin the AR experience.',
    phase: 2,
  },
  {
    number: 2,
    icon: <ScanLine size={24} />,
    title: 'Detect a Flat Surface',
    description:
      'Point your camera at a horizontal surface such as a desk or table. The AR system will detect the surface and show a placement indicator.',
    phase: 2,
  },
  {
    number: 3,
    icon: <MousePointerClick size={24} />,
    title: 'Place Network Devices',
    description:
      'Tap on the detected surface to place virtual network devices — PCs, switches, routers, and servers — into your real-world environment.',
    phase: 2,
  },
  {
    number: 4,
    icon: <Network size={24} />,
    title: 'Create Connections',
    description:
      'Select two devices and create a link between them. Each link becomes a weighted edge in the network graph, with weight based on 3D distance.',
    phase: 2,
  },
  {
    number: 5,
    icon: <Route size={24} />,
    title: 'Select Source & Destination',
    description:
      'Choose a source and destination node in your network. The application will calculate the shortest path between them using a routing algorithm.',
    phase: 3,
  },
  {
    number: 6,
    icon: <Play size={24} />,
    title: 'Visualize the Route',
    description:
      'Watch as the computed route is highlighted and a virtual packet animates through each hop, helping you understand how data travels through a network.',
    phase: 3,
  },
  {
    number: 7,
    icon: <Settings size={24} />,
    title: 'Modify & Recalculate',
    description:
      'Add or remove devices and connections dynamically. Recalculate the route to see how topology changes affect the shortest path.',
    phase: 3,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="how-it-works container">
      <PageHeader
        title="How It Works"
        subtitle="A step-by-step overview of the planned AR network visualization experience."
        badge={<Badge variant="info">Planned Workflow</Badge>}
      />

      <div className="hiw__notice animate-fade-in-up">
        <p>
          <strong>Note:</strong> The steps below describe the intended
          application workflow. These features are planned for future phases
          and are not yet implemented. The current version (Phase 1) provides
          the UI foundation.
        </p>
      </div>

      <div className="hiw__timeline">
        {WORKFLOW_STEPS.map(({ number, icon, title, description, phase }) => (
          <div
            key={number}
            className="hiw__step animate-fade-in-up"
          >
            <div className="hiw__step-marker">
              <div className="hiw__step-number">{number}</div>
              {number < WORKFLOW_STEPS.length && (
                <div className="hiw__step-line" />
              )}
            </div>
            <div className="hiw__step-content">
              <div className="hiw__step-icon">{icon}</div>
              <div className="hiw__step-text">
                <h3 className="hiw__step-title">{title}</h3>
                <p className="hiw__step-description">{description}</p>
                <Badge variant="upcoming">Phase {phase}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hiw__cta animate-fade-in-up">
        <Link to="/ar-lab">
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} />}
          >
            View AR Lab Workspace
          </Button>
        </Link>
      </div>
    </div>
  );
}
