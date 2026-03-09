import { Database, Layers } from 'lucide-react';

export const TOOLS = [
  {
    id: 'csv-parser',
    title: 'CSV Parser',
    subtitle: 'Upload CSV/XLSX, filter records, view in cards or table, copy values, and export grouped card text.',
    icon: Database,
    status: 'Working',
  },
  {
    id: 'services-content-parser',
    title: 'Services Content Parser',
    subtitle: 'Paste raw services text and convert it into structured, collapsible page cards with click-to-copy content.',
    icon: Layers,
    status: 'Working',
  },
];
