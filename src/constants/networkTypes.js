/**
 * ARNetLab — Network Device Types and Constants
 */

export const NODE_TYPES = {
  PC: 'PC',
  SWITCH: 'SWITCH',
  ROUTER: 'ROUTER',
  SERVER: 'SERVER',
};

export const NODE_TYPE_CONFIG = {
  [NODE_TYPES.PC]: {
    label: 'PC',
    description: 'Personal Computer / Workstation',
    color: '#3b82f6',
    icon: 'Monitor',
  },
  [NODE_TYPES.SWITCH]: {
    label: 'Switch',
    description: 'Network Switch (Layer 2)',
    color: '#22c55e',
    icon: 'ToggleLeft',
  },
  [NODE_TYPES.ROUTER]: {
    label: 'Router',
    description: 'Network Router (Layer 3)',
    color: '#f59e0b',
    icon: 'Router',
  },
  [NODE_TYPES.SERVER]: {
    label: 'Server',
    description: 'Network Server',
    color: '#a855f7',
    icon: 'Server',
  },
};

export const NODE_TYPE_LIST = Object.entries(NODE_TYPE_CONFIG).map(
  ([type, config]) => ({
    type,
    ...config,
  })
);

export const APP_NAME = 'ARNetLab';
export const APP_TAGLINE = 'Build. Connect. Route. Visualize.';
export const APP_DESCRIPTION =
  'An Interactive Augmented Reality Platform for Network Topology Visualization and Routing';
