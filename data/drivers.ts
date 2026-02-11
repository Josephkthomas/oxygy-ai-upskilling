import {
  Brain,
  ArrowUpRight,
  Users,
  Share2,
  BookOpen,
  Compass,
  Route,
  Trophy,
  Calendar,
  LifeBuoy,
  Radio,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DriverNode {
  label: string;
  icon: LucideIcon;
  description: string;
  ring: 'internal' | 'external';
}

export const innerDrivers: DriverNode[] = [
  {
    label: 'Growth Mindset',
    icon: Brain,
    description:
      'Embrace AI as an opportunity to grow, not a threat to your role. See change as a catalyst for personal development.',
    ring: 'internal',
  },
  {
    label: 'Thinking Beyond',
    icon: ArrowUpRight,
    description:
      'Look past your current scope to see how AI connects across functions and creates value beyond your immediate tasks.',
    ring: 'internal',
  },
  {
    label: 'Collaboration',
    icon: Users,
    description:
      'Work with others to co-create AI solutions. The best AI tools are built by teams, not individuals working in isolation.',
    ring: 'internal',
  },
  {
    label: 'Sharing Learnings',
    icon: Share2,
    description:
      'Pass on what you discover — your insights accelerate the whole team. What you learn becomes organizational knowledge.',
    ring: 'internal',
  },
  {
    label: 'Learning to Learn',
    icon: BookOpen,
    description:
      'Build the meta-skill of teaching yourself with AI as a learning companion. This skill outlasts any single tool.',
    ring: 'internal',
  },
  {
    label: 'Curiosity',
    icon: Compass,
    description:
      'Try things, break things, iterate. Comfort with experimentation is the foundation of all AI capability.',
    ring: 'internal',
  },
];

export const outerDrivers: DriverNode[] = [
  {
    label: 'Personalized Pathways',
    icon: Route,
    description:
      'Tailored upskilling journeys matched to your role, level, and learning style — not one-size-fits-all training.',
    ring: 'external',
  },
  {
    label: 'Incentive Structures',
    icon: Trophy,
    description:
      'Recognition and reward mechanisms that motivate sustained AI adoption and celebrate progress at every level.',
    ring: 'external',
  },
  {
    label: 'Training Programs',
    icon: Calendar,
    description:
      'Structured workshops, hands-on build sessions, microlearning modules, and collaborative learning formats.',
    ring: 'external',
  },
  {
    label: 'Change Management',
    icon: LifeBuoy,
    description:
      'Dedicated support systems that make the transition smooth — addressing resistance, fear, and uncertainty head-on.',
    ring: 'external',
  },
  {
    label: 'Communication',
    icon: Radio,
    description:
      'Clear, consistent messaging about why AI matters, what\'s expected, and how progress will be supported and measured.',
    ring: 'external',
  },
  {
    label: 'Tools & Resources',
    icon: Wrench,
    description:
      'Access to the right AI tools, prompt libraries, templates, and sandboxed environments for safe experimentation.',
    ring: 'external',
  },
];
