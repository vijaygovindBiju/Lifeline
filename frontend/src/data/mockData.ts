import { Resource, Program, RecoveryStep, DocumentInsight } from '../types';

export const mockResources: Resource[] = [
  {
    id: '1',
    name: 'City Harvest Food Pantry',
    type: 'food',
    distance: '0.8 miles',
    address: '123 Hope Street, Downtown',
    openNow: true,
    phone: '(555) 123-4567',
    description: 'Providing emergency food assistance to families and individuals in need.',
    priority: 'high',
  },
  {
    id: '2',
    name: 'Grace Community Kitchen',
    type: 'food',
    distance: '1.5 miles',
    address: '456 Mercy Lane, Westside',
    openNow: true,
    phone: '(555) 987-6543',
    description: 'Hot meals served daily from 11 AM to 2 PM.',
    priority: 'medium',
  },
  {
    id: '3',
    name: 'Downtown Shelter & Housing',
    type: 'housing',
    distance: '2.1 miles',
    address: '789 Stability Ave, Central',
    openNow: true,
    description: 'Temporary housing and overnight shelter for those in immediate crisis.',
    priority: 'high',
  },
];

export const mockPrograms: Program[] = [
  {
    id: 'snap-1',
    name: 'SNAP (Supplemental Nutrition Assistance Program)',
    description: 'Provides nutrition benefits to supplement the food budget of needy families.',
    recommendationReason: "You shared that you've recently lost your job and are experiencing food insecurity, which may make this program relevant to your situation.",
    requirements: ['Government ID', 'Proof of residence', 'Employment records', 'Income statement'],
    confidence: 'high',
    link: '#',
  },
  {
    id: 'ui-1',
    name: 'Unemployment Insurance Benefits',
    description: 'Temporary financial assistance for workers who are unemployed through no fault of their own.',
    recommendationReason: "Based on your recent job loss and employment history, this option may help provide temporary financial stability while you search for new opportunities.",
    requirements: ['Employment history (18 months)', 'Social Security Number', 'Termination letter'],
    confidence: 'high',
    link: '#',
  },
  {
    id: 'rental-1',
    name: 'Emergency Rental Assistance',
    description: 'Helps households that are unable to pay rent or utilities.',
    recommendationReason: "If your financial situation begins affecting your housing stability, this support may be worth exploring early.",
    requirements: ['Valid lease agreement', 'Proof of financial hardship', 'Utility bills'],
    confidence: 'medium',
    link: '#',
  },
];

export const mockRecoveryPlan: RecoveryStep[] = [
  {
    id: 'step-1',
    title: 'Locate nearby food assistance services',
    description: 'Search for and visit local emergency food distribution options to secure immediate meals.',
    completed: false,
    timeframe: 'today',
  },
  {
    id: 'step-2',
    title: 'Gather essential documentation',
    description: 'Collect identification, proof of residence, and recent employment records to prepare for assistance applications.',
    completed: false,
    timeframe: 'today',
  },
  {
    id: 'step-3',
    title: 'Identify local assistance programs',
    description: 'Research available government or non-profit support programs in your area and prepare applications.',
    completed: false,
    timeframe: 'week',
  },
  {
    id: 'step-4',
    title: 'Update work search materials',
    description: 'Update your resume or work history to prepare for local job opportunities.',
    completed: false,
    timeframe: 'week',
  },
  {
    id: 'step-5',
    title: 'Explore temporary work options',
    description: 'Check local employment listings or temporary work portals for immediate income opportunities.',
    completed: false,
    timeframe: 'week',
  },
  {
    id: 'step-6',
    title: 'Establish a basic emergency budget',
    description: 'Review fixed monthly expenses and prioritize necessary payments to stabilize your finances.',
    completed: false,
    timeframe: 'month',
  },
  {
    id: 'step-7',
    title: 'Review career and reskilling pathways',
    description: 'Look into local training or professional programs to improve long-term employment prospects.',
    completed: false,
    timeframe: 'month',
  },
];

export const mockDocumentInsight: DocumentInsight = {
  id: 'doc-1',
  fileName: 'Resume_2024.pdf',
  skills: ['Customer Service', 'Sales', 'Inventory Management', 'Team Leadership'],
  experience: '4 years in retail operations and floor management.',
  opportunities: {
    temporary: ['Customer Support Representative', 'Retail Associate', 'Warehouse Specialist'],
    growth: ['Workforce Training Program', 'Retail Supervisor Track', 'Operations Management'],
  },
};
