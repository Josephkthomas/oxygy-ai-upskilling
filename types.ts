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

// Prompt Engineering Playground types
export interface PromptBlock {
  key: string;
  label: string;
  description: string;
  color: string;
  content: string;
}

export interface PromptResult {
  role: string;
  context: string;
  task: string;
  format: string;
  steps: string;
  quality: string;
}

export interface WizardAnswers {
  role: string;
  context: string;
  task: string;
  formatChips: string[];
  formatCustom: string;
  steps: string;
  qualityChips: string[];
  qualityCustom: string;
}

// Agent Builder Toolkit types (Level 2)
export interface AgentReadinessCriteria {
  score: number;
  assessment: string;
}

export interface AgentReadiness {
  overall_score: number;
  verdict: string;
  rationale: string;
  criteria: {
    frequency: AgentReadinessCriteria;
    consistency: AgentReadinessCriteria;
    shareability: AgentReadinessCriteria;
    complexity: AgentReadinessCriteria;
    standardization_risk: AgentReadinessCriteria;
  };
  level1_points: string[];
  level2_points: string[];
}

export interface AccountabilityCheck {
  name: string;
  severity: 'critical' | 'important' | 'recommended';
  what_to_verify: string;
  why_it_matters: string;
  prompt_instruction: string;
}

export interface AgentDesignResult {
  readiness: AgentReadiness;
  output_format: {
    human_readable: string;
    json_template: Record<string, unknown>;
  };
  system_prompt: string;
  accountability: AccountabilityCheck[];
}