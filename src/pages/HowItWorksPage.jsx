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
    <div className="pb-20 container">
      <PageHeader
        title="How It Works"
        subtitle="A step-by-step overview of the planned AR network visualization experience."
        badge={<Badge variant="info">Planned Workflow</Badge>}
      />

      <div className="p-4 px-5 bg-primary-50 border border-primary-200 rounded-lg mb-10 text-sm text-primary-800 leading-relaxed dark:bg-primary-500/10 dark:border-primary-500/20 dark:text-primary-200 animate-fade-in-up">
        <p>
          <strong>Note:</strong> The steps below describe the intended
          application workflow. These features are planned for future phases
          and are not yet implemented. The current version (Phase 1) provides
          the UI foundation.
        </p>
      </div>

      <div className="flex flex-col gap-0 max-w-[700px] mx-auto">
        {WORKFLOW_STEPS.map(({ number, icon, title, description, phase }) => (
          <div
            key={number}
            className="flex gap-4 animate-fade-in-up"
          >
            <div className="flex flex-col items-center shrink-0 w-10">
              <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {number}
              </div>
              {number < WORKFLOW_STEPS.length && (
                <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700 my-2 min-h-[24px]" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pb-8 flex-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-primary-500 shrink-0">
                {icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {description}
                </p>
                <div>
                  <Badge variant="upcoming">Phase {phase}</Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8 animate-fade-in-up">
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
