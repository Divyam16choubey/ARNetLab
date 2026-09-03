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
    title: 'Open on a WebXR Device',
    description:
      'Launch ARNetLab in a WebXR-compatible mobile or tablet browser (such as Google Chrome on Android). Camera passthrough will initiate your immersive session.',
    category: 'AR Initialization',
  },
  {
    number: 2,
    icon: <ScanLine size={24} />,
    title: 'Detect a Flat Surface',
    description:
      'Point your camera at a horizontal surface such as a desk, table, or floor. The real-time hit-testing system detects the surface and displays a placement reticle.',
    category: 'Surface Tracking',
  },
  {
    number: 3,
    icon: <MousePointerClick size={24} />,
    title: 'Place Network Devices',
    description:
      'Tap on the detected surface to place procedural 3D network devices — PCs, switches, routers, and servers — directly into your physical environment.',
    category: 'Device Placement',
  },
  {
    number: 4,
    icon: <Network size={24} />,
    title: 'Create Connections',
    description:
      'Select two devices to establish a link between them. Links automatically compute 3D Euclidean distances in meters as real edge weights.',
    category: 'Topology & Links',
  },
  {
    number: 5,
    icon: <Route size={24} />,
    title: 'Select Source & Destination',
    description:
      'Assign source and destination roles to nodes. ARNetLab immediately runs Dijkstra algorithm to calculate and highlight the shortest path in glowing green.',
    category: 'Routing Analysis',
  },
  {
    number: 6,
    icon: <Play size={24} />,
    title: 'Simulate Virtual Packets',
    description:
      'Dispatch a 3D virtual packet along the computed route. Watch it animate through each network hop with real-time transit timing and link illumination.',
    category: 'Packet Simulation',
  },
  {
    number: 7,
    icon: <Settings size={24} />,
    title: 'Mutate Topology Live',
    description:
      'Delete links or devices on the fly to see how network topology changes instantly alter Dijkstra shortest path and packet routing in real time.',
    category: 'Dynamic Topology',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="pb-20 container">
      <PageHeader
        title="How It Works"
        subtitle="A step-by-step guide to constructing and simulating network topologies in tabletop AR."
        badge={<Badge variant="info">Interactive Pipeline</Badge>}
      />

      <div className="p-4 px-5 bg-primary-500/10 border border-primary-500/20 rounded-xl mb-10 text-sm text-primary-900 dark:text-primary-200 leading-relaxed animate-fade-in-up flex items-center gap-3">
        <Smartphone size={20} className="text-primary-500 shrink-0" />
        <p>
          Follow these seven steps in the AR Lab to build real network topologies on your desk,
          compute Dijkstra shortest paths, and watch virtual data packets navigate your network in real time.
        </p>
      </div>

      <div className="flex flex-col gap-0 max-w-[700px] mx-auto">
        {WORKFLOW_STEPS.map(({ number, icon, title, description, category }) => (
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
                  <Badge variant="info">{category}</Badge>
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
            Launch AR Lab
          </Button>
        </Link>
      </div>
    </div>
  );
}
