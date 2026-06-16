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
    recommendationReason: 'Because you recently lost employment and reported reduced income.',
    requirements: ['Government ID', 'Proof of residence', 'Employment records', 'Income statement'],
    confidence: 'high',
    link: '#',
  },
  {
    id: 'ui-1',
    name: 'Unemployment Insurance Benefits',
    description: 'Temporary financial assistance for workers who are unemployed through no fault of their own.',
    recommendationReason: 'Due to your recent job loss from a long-term position.',
    requirements: ['Employment history (18 months)', 'Social Security Number', 'Termination letter'],
    confidence: 'high',
    link: '#',
  },
  {
    id: 'rental-1',
    name: 'Emergency Rental Assistance',
    description: 'Helps households that are unable to pay rent or utilities.',
    recommendationReason: 'To prevent housing instability while you search for new employment.',
    requirements: ['Valid lease agreement', 'Proof of financial hardship', 'Utility bills'],
    confidence: 'medium',
    link: '#',
  },
];

export const mockRecoveryPlan: RecoveryStep[] = [
  {
    id: 'step-1',
    title: 'Visit nearby food support',
    description: 'Go to City Harvest Food Pantry to secure groceries for the next few days.',
    completed: false,
    timeframe: 'today',
  },
  {
    id: 'step-2',
    title: 'Gather employment documents',
    description: 'Collect your termination letter, last paystubs, and ID for program applications.',
    completed: false,
    timeframe: 'today',
  },
  {
    id: 'step-3',
    title: 'Apply for SNAP benefits',
    description: 'Complete the online application for nutritional assistance.',
    completed: false,
    timeframe: 'week',
  },
  {
    id: 'step-4',
    title: 'Update resume for retail roles',
    description: 'Focus on your customer service and inventory management skills.',
    completed: false,
    timeframe: 'week',
  },
  {
    id: 'step-5',
    title: 'Explore temporary work opportunities',
    description: 'Check local retail and warehouse openings for immediate income.',
    completed: false,
    timeframe: 'week',
  },
  {
    id: 'step-6',
    title: 'Stabilize monthly budget',
    description: 'Review all expenses and prioritize essential payments.',
    completed: false,
    timeframe: 'month',
  },
  {
    id: 'step-7',
    title: 'Consider reskilling opportunities',
    description: 'Look into Workforce Training Programs for Retail Supervision.',
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
