import { LevelData, DepartmentData } from '../types';
import { 
  Compass,
  Wrench,
  Workflow,
  Monitor,
  Rocket,
  Briefcase, 
  FileText, 
  ClipboardCheck, 
  BarChart3,
  Users,
  Target,
  Megaphone,
  Settings
} from 'lucide-react';

export const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "Fundamentals & Awareness",
    tagline: "Build comfort, curiosity, and confidence",
    accentColor: "#A8F0E0", // Mint
    darkAccentColor: "#2BA89C", // Dark Mint
    icon: Compass,
    descriptionCollapsed: "The starting point for any AI journey. Your teams learn what AI is, how it works, and where it fits into their daily work — building the foundations of confident, responsible AI use.",
    descriptionExpanded: "The starting point for any AI journey. Your teams learn what AI is, how it works, and where it fits into their daily work. Through hands-on practice with prompting, creative AI tools, and responsible use principles, people shift from uncertainty to curiosity — building the foundations they need to use AI confidently, consistently, and responsibly.",
    previewTags: ["Prompting", "Creative AI", "Responsible Use", "LLM Basics"],
    topics: [
      "What is an LLM?",
      "Prompting Basics",
      "Everyday Use Cases",
      "Intro to Creative AI",
      "Responsible Use",
      "Prompt Library Creation"
    ],
    targetAudience: ["New joiners", "Junior professionals", "Non-technical team members", "Anyone beginning their AI journey"],
    keyTools: ["ChatGPT", "Claude", "DALL·E", "Opus Clip", "Snipd", "Descript"],
    sessionTypes: [
      {
        emoji: "🎯",
        title: "Prompt Engineering Fundamentals"
      },
      {
        emoji: "🎨",
        title: "Creative AI Playground"
      },
      {
        emoji: "🛡️",
        title: "Responsible AI & Governance"
      }
    ]
  },
  {
    id: 2,
    name: "Applied Capability",
    tagline: "From users to builders",
    accentColor: "#C3D0F5", // Lavender
    darkAccentColor: "#5B6DC2", // Dark Lavender
    icon: Wrench,
    descriptionCollapsed: "Once comfortable with AI, teams learn to build with it — creating custom AI agents and reusable tools tailored to their specific workflows, roles, and challenges.",
    descriptionExpanded: "Once people are comfortable with AI, they learn to build with it. This level empowers individuals to create custom AI agents and tools tailored to their specific workflows — reusable solutions that standardise quality, save time, and can be shared across teams. The principle: build once, share across the organisation.",
    previewTags: ["Custom GPTs", "Agent Design", "Human-in-the-Loop", "Templates"],
    topics: [
      "What Are AI Agents?",
      "Custom GPTs",
      "Instruction Design",
      "Human-in-the-Loop",
      "Ethical Framing",
      "Agent Templates"
    ],
    targetAudience: ["Team leads", "Functional specialists", "Process owners", "Operations managers", "Subject matter experts"],
    keyTools: ["ChatGPT Custom GPT Builder", "Claude Projects & Skills", "Microsoft Copilot Agents", "Google Gems", "Prompt template libraries"],
    sessionTypes: [
      {
        emoji: "🤖",
        title: "Build Your First AI Agent"
      },
      {
        emoji: "📚",
        title: "Agent Template Library Sprint"
      },
      {
        emoji: "🔄",
        title: "Human-in-the-Loop Design"
      }
    ]
  },
  {
    id: 3,
    name: "Systemic Integration",
    tagline: "Connecting AI into real workflows",
    accentColor: "#F7E8A4", // Pale Yellow
    darkAccentColor: "#C4A934", // Dark Yellow/Gold
    icon: Workflow,
    descriptionCollapsed: "Individual AI tools become organisational infrastructure. Teams learn to connect AI agents into end-to-end automated workflows with built-in human oversight and continuous feedback loops.",
    descriptionExpanded: "Individual AI tools become organisational infrastructure. Teams learn to connect AI agents into end-to-end automated workflows — with built-in human oversight, role-based logic, and feedback loops that drive continuous improvement. This is where AI stops being a side tool and becomes embedded in how work actually gets done.",
    previewTags: ["Workflow Automation", "Agent Chaining", "Role-Based Logic", "Feedback Loops"],
    topics: [
      "AI Workflow Mapping",
      "Agent Chaining",
      "Input Logic & Role Mapping",
      "Automated Output Generation",
      "Process Use Cases",
      "Performance & Feedback Loops"
    ],
    targetAudience: ["Digital transformation leads", "Process excellence teams", "Operations directors", "Automation specialists", "Centre of Excellence members"],
    keyTools: ["Make", "Zapier", "n8n", "API integrations", "Airtable", "Google Apps Script"],
    sessionTypes: [
      {
        emoji: "🗺️",
        title: "Workflow Mapping & Design"
      },
      {
        emoji: "🔗",
        title: "Agent Chaining Lab"
      },
      {
        emoji: "📊",
        title: "Performance & Feedback Loops"
      }
    ]
  },
  {
    id: 4,
    name: "Interactive Dashboards & Tailored Front-Ends",
    tagline: "From raw data to designed intelligence",
    accentColor: "#F5B8A0", // Soft Peach
    darkAccentColor: "#D47B5A", // Dark Peach/Terracotta
    icon: Monitor,
    descriptionCollapsed: "AI outputs deserve better than spreadsheets. Teams learn to design interactive, role-specific dashboards that present AI-generated insights in formats tailored to the people who need them.",
    descriptionExpanded: "AI outputs deserve better than spreadsheets. This level focuses on designing interactive, role-specific dashboards and front-end interfaces that present AI-generated insights in formats tailored to the people who need them. The design principle: work backwards from the end user — what do they need to see, how should it look, and what decisions does it need to support?",
    previewTags: ["Dashboard Design", "Data Visualization", "UX for AI", "User Testing"],
    topics: [
      "Design Thinking for AI Outputs",
      "Dashboard Architecture",
      "Data Visualization",
      "Human-in-the-Loop Interfaces",
      "Real-World Dashboard Examples",
      "User Testing & Iteration"
    ],
    targetAudience: ["Decision makers", "Product owners", "Analytics & data teams", "Data managers", "Reporting leads", "UX designers"],
    keyTools: ["Lovable", "Google AI Studio", "Bolt.new", "V0 by Vercel", "Streamlit", "Retool"],
    sessionTypes: [
      {
        emoji: "💡",
        title: "Dashboard Design Thinking"
      },
      {
        emoji: "⚡",
        title: "Rapid Prototyping with AI"
      },
      {
        emoji: "🧪",
        title: "User Testing & Iteration"
      }
    ]
  },
  {
    id: 5,
    name: "Full AI-Powered Applications",
    tagline: "Personalized experiences for every user",
    accentColor: "#38B2AC", // Teal
    darkAccentColor: "#38B2AC", // Teal (same)
    icon: Rocket,
    descriptionCollapsed: "The complete picture: full applications where every user gets a tailored experience — combining workflow automation, designed interfaces, and individual user accounts into production-ready AI products.",
    descriptionExpanded: "The complete picture: full applications where every user gets a tailored experience. Combining workflow automation, designed interfaces, and individual user accounts, Level 5 delivers AI products where different roles see different things — personalised, scalable, and production-ready. This is where AI becomes a product, not just a feature.",
    previewTags: ["Personalisation", "Full-Stack AI", "Knowledge Bases", "App Architecture"],
    topics: [
      "Application Architecture",
      "Personalisation Engines",
      "Knowledge Base Applications",
      "Custom Learning Platforms",
      "Full-Stack AI Integration",
      "User Testing & Scaling"
    ],
    targetAudience: ["Product teams", "Innovation leads", "Business development managers", "Market specialists", "Developers", "Technical architects"],
    keyTools: ["Cursor", "Claude Code", "Google Firebase", "Supabase", "Replit Agent", "Vercel"],
    sessionTypes: [
      {
        emoji: "🏗️",
        title: "Product Architecture Sprint"
      },
      {
        emoji: "💻",
        title: "Full-Stack Build Workshop"
      },
      {
        emoji: "🚀",
        title: "User Testing & Go-to-Market"
      }
    ]
  }
];

export const DEPARTMENTS: DepartmentData[] = [
  {
    id: "hr",
    name: "Human Resources & People",
    valueProp: "Transform how your people function attracts, develops, and retains talent.",
    useCases: [
      "AI Resume Screening",
      "Personalized Onboarding",
      "Skill Gap Matching",
      "Employee Comms"
    ],
    accentColor: "#C3D0F5", // lavender
    iconName: "Users",
    link: "/departments/hr"
  },
  {
    id: "sales",
    name: "Sales & Business Development",
    valueProp: "Accelerate your pipeline with AI that researches prospects and drafts proposals.",
    useCases: [
      "Account Research",
      "Proposal Drafting",
      "Personalized Outreach",
      "Win/Loss Analysis"
    ],
    accentColor: "#A8F0E0", // mint
    iconName: "Target",
    link: "/departments/sales"
  },
  {
    id: "marketing",
    name: "Marketing & Communications",
    valueProp: "Create more content and reach the right audiences with AI.",
    useCases: [
      "Campaign Copy Gen",
      "Sentiment Analysis",
      "Content Repurposing",
      "Brand Guardrails"
    ],
    accentColor: "#F7E8A4", // pale yellow
    iconName: "Megaphone",
    link: "/departments/marketing"
  },
  {
    id: "ops",
    name: "Operations & Process Excellence",
    valueProp: "Streamline how work gets done and automate repetitive processes.",
    useCases: [
      "Visual SOPs",
      "Automated Reporting",
      "Process Monitoring",
      "Compliance Checks"
    ],
    accentColor: "#F5B8A0", // soft peach
    iconName: "Settings",
    link: "/departments/operations"
  }
];