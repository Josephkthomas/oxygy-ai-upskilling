import { LucideIcon } from 'lucide-react';

export interface SessionType {
  title: string;
  emoji: string;
}

export interface LevelData {
  id: number;
  name: string;
  tagline: string;
  descriptionCollapsed: string; // Short description for the summary view
  descriptionExpanded: string;  // Full description for the expanded view (Note: Not used in new layout but kept for data integrity if needed later)
  topics: string[];             // Full list for expanded state
  previewTags: string[];        // Subset for collapsed state
  accentColor: string;          // The main pastel/light color
  darkAccentColor: string;      // The darker version for text/buttons
  icon: LucideIcon;
  targetAudience: string[];
  keyTools: string[];
  sessionTypes: SessionType[];
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export interface DepartmentData {
  id: string;
  name: string;
  valueProp: string;
  useCases: string[];
  accentColor: string; // Hex for band/dots
  iconName: string; // key for lucide map
  link: string;
}