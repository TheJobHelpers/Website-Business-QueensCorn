export interface FundraiserCampaign {
  id: string;
  organization: string;
  category: string;
  code: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  endDate: string;
  location: string;
}

export const ACTIVE_FUNDRAISERS: FundraiserCampaign[] = [
  {
    id: 'fund-1',
    organization: 'Marana High School Tiger Band',
    category: 'High School Music & Arts',
    code: 'TIGERS50',
    description: 'Supporting new marching band instruments and state competition travel across Arizona.',
    goalAmount: 2500,
    raisedAmount: 1850,
    endDate: 'Nov 15, 2026',
    location: 'Marana, AZ',
  },
  {
    id: 'fund-2',
    organization: 'Oro Valley Youth Soccer Club',
    category: 'Youth Athletics',
    code: 'OVSOCCER',
    description: 'Raising funds for tournament registration fees, team equipment, and player scholarships.',
    goalAmount: 2000,
    raisedAmount: 1120,
    endDate: 'Nov 30, 2026',
    location: 'Oro Valley, AZ',
  },
  {
    id: 'fund-3',
    organization: 'Estrella Foothills STEM Club',
    category: 'Education & Robotics',
    code: 'STEMCORN',
    description: 'Helping local students build and compete in the 2026 Arizona Regional Robotics Championship.',
    goalAmount: 1500,
    raisedAmount: 960,
    endDate: 'Dec 05, 2026',
    location: 'Avondale / Goodyear, AZ',
  },
];
