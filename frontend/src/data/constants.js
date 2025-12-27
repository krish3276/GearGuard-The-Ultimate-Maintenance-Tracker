// Static configuration data - used for UI styling and dropdown options

export const departments = [
  'Production',
  'Facilities',
  'IT',
  'Logistics',
  'Quality Control',
  'Research & Development',
];

export const locations = [
  'Building A - Floor 1',
  'Building A - Floor 2',
  'Building A - Rooftop',
  'Building B - Basement',
  'Building B - Floor 1',
  'Building C - Data Center',
  'Warehouse',
  'Outdoor Area',
];

export const statusColors = {
  new: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  repaired: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  scrap: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

export const priorityColors = {
  low: { bg: 'bg-gray-100', text: 'text-gray-800' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-800' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const equipmentStatusColors = {
  operational: { bg: 'bg-green-100', text: 'text-green-800' },
  maintenance: { bg: 'bg-amber-100', text: 'text-amber-800' },
  offline: { bg: 'bg-red-100', text: 'text-red-800' },
};
