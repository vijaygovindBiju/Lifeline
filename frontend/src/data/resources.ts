import { Resource } from '../types';

export const supportResources: Resource[] = [
  {
    id: 'res-1',
    name: 'Downtown Community Kitchen',
    type: 'food',
    distance: '1.2 km away',
    address: '123 Main Street',
    openNow: true,
    statusText: 'Open Now',
    description: 'Free hot meals available today.',
    priority: 'high',
  },
  {
    id: 'res-2',
    name: 'City Food Bank',
    type: 'food',
    distance: '2.4 km away',
    address: '45 Hope Avenue',
    openNow: true,
    statusText: 'Open Until 6 PM',
    description: 'Food packages and emergency assistance.',
    priority: 'medium',
  },
  {
    id: 'res-3',
    name: 'Local Outreach Center',
    type: 'food',
    distance: '3.1 km away',
    address: '89 Unity Road',
    openNow: true,
    statusText: 'Open Now',
    description: 'Emergency support and referrals.',
    priority: 'medium',
  },
];
