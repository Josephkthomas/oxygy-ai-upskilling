// Prompt Engineering Playground — Static Content & Configuration

export const PROMPT_BLUEPRINT = [
  {
    key: 'role',
    label: 'Role',
    icon: '\u{1F3AD}', // 🎭
    description: 'Who the AI should act as — the expertise, perspective, or persona it should adopt',
    color: '#C3D0F5',
  },
  {
    key: 'context',
    label: 'Context',
    icon: '\u{1F4CD}', // 📍
    description: 'The background, situation, constraints, and relevant details the AI needs to understand',
    color: '#FBE8A6',
  },
  {
    key: 'task',
    label: 'Task',
    icon: '\u{1F3AF}', // 🎯
    description: 'The specific instruction — what exactly the AI should produce or do',
    color: '#38B2AC',
  },
  {
    key: 'format',
    label: 'Format & Structure',
    icon: '\u{1F4D0}', // 📐
    description: 'How the output should be organized — length, layout, tone, structure',
    color: '#A8F0E0',
  },
  {
    key: 'steps',
    label: 'Steps & Process',
    icon: '\u{1F9E9}', // 🧩
    description: 'Explicit reasoning steps, sequence, or methodology the AI should follow',
    color: '#FBCEB1',
  },
  {
    key: 'quality',
    label: 'Quality Checks',
    icon: '\u{2705}', // ✅
    description: 'Validation rules, constraints, things to avoid, accuracy requirements',
    color: '#E6FFFA',
  },
] as const;

// Educational content for default state (before any prompt is generated)
export const BLUEPRINT_EDUCATION = [
  {
    key: 'role',
    title: 'Define the Role',
    why: "Giving the AI a specific persona anchors its entire response. A 'senior data analyst' writes differently than a 'marketing intern.' The more specific the role, the more targeted and expert the output becomes.",
    example: '"Act as a senior change management consultant with 15 years of experience in digital transformation for large enterprises."',
  },
  {
    key: 'context',
    title: 'Set the Context',
    why: "Without context, the AI guesses — and guesses wrong. Sharing the situation, stakeholders, constraints, and timeline lets the AI tailor its response to your actual reality instead of generating generic advice.",
    example: '"We\'re halfway through a 6-month initiative. The discovery phase is complete and the team is moving into design. Two key stakeholders have concerns about timeline."',
  },
  {
    key: 'task',
    title: 'Specify the Task',
    why: "Vague instructions produce vague outputs. Telling the AI exactly what deliverable you need — the format, scope, and purpose — is the single biggest lever for getting useful results on the first try.",
    example: '"Write a 400-word project status update email that summarizes progress, highlights risks with proposed mitigations, and outlines the plan for the next quarter."',
  },
  {
    key: 'format',
    title: 'Define Format & Structure',
    why: "The same information presented as bullet points vs. a narrative paragraph vs. a table serves completely different purposes. Specifying structure ensures the output fits directly into your workflow.",
    example: '"Use an email format with clear sections. Keep it under 400 words. Use a confident but transparent tone. Include a subject line."',
  },
  {
    key: 'steps',
    title: 'Outline the Process',
    why: "Giving the AI a step-by-step sequence prevents it from jumping to conclusions. It forces structured thinking — analyze first, then synthesize, then recommend — which dramatically improves reasoning quality.",
    example: '"First, summarize key achievements. Then, identify the top 3 risks. For each risk, propose a mitigation. Close with next milestones and any asks."',
  },
  {
    key: 'quality',
    title: 'Set Quality Checks',
    why: "Quality constraints act as guardrails. They prevent the AI from using jargon when you need plain language, making up data when you need accuracy, or being vague when you need specifics.",
    example: '"Don\'t sugarcoat the risks. Avoid generic phrases like \'things are going well.\' Keep language accessible to non-technical readers. Do not reference confidential project names."',
  },
] as const;

// Mode A: Example prompts that populate the textarea
export const EXAMPLE_PROMPTS = [
  'Help me prepare talking points for a stakeholder meeting next week',
  'Create a 90-day onboarding plan for a new team member',
  'Write an update email about project progress to share with leadership',
  'Draft a business case for investing in a new AI tool for our team',
  'Summarize the key takeaways from a quarterly business review',
  'Create a workshop agenda for a team brainstorming session',
];

// Mode B: Wizard step definitions
export const WIZARD_STEPS = [
  {
    id: 1,
    field: 'role' as const,
    question: 'Who should the AI act as?',
    helper: 'Describe the expertise or perspective you need — e.g., a senior consultant, a data analyst, a project manager, a communications lead',
    placeholder: 'e.g., Act as an experienced change management consultant who specializes in digital transformation...',
    type: 'textarea' as const,
    minLines: 2,
  },
  {
    id: 2,
    field: 'context' as const,
    question: "What's the situation?",
    helper: "Give the AI the background it needs — what's happening, who's involved, what constraints exist",
    placeholder: "e.g., We're halfway through a 6-month transformation project. The team has completed the discovery phase and is moving into design...",
    type: 'textarea' as const,
    minLines: 3,
  },
  {
    id: 3,
    field: 'task' as const,
    question: 'What exactly should the AI produce?',
    helper: 'Be specific about the deliverable — what format, what content, what purpose',
    placeholder: 'e.g., Write a concise project status update email that summarizes progress, highlights risks, and outlines next steps...',
    type: 'textarea' as const,
    minLines: 2,
  },
  {
    id: 4,
    field: 'format' as const,
    question: 'How should the output be structured?',
    helper: 'Select any that apply, or describe your preferred format',
    placeholder: 'Any other formatting preferences? e.g., Keep it under 300 words, use professional tone...',
    type: 'chips' as const,
    chips: [
      'Bullet points',
      'Numbered list',
      'Table',
      'Short paragraph',
      'Detailed report',
      'Email format',
      'Slide content',
      'Executive summary',
    ],
  },
  {
    id: 5,
    field: 'steps' as const,
    question: 'Should the AI follow specific steps?',
    helper: 'Describe a sequence or process the AI should work through — or leave blank if the AI should decide',
    placeholder: 'e.g., First, review the key milestones achieved. Then, identify the top 3 risks. Finally, propose mitigation actions for each risk...',
    type: 'textarea' as const,
    minLines: 3,
  },
  {
    id: 6,
    field: 'quality' as const,
    question: 'What should the AI watch out for?',
    helper: 'Add any constraints, things to avoid, or quality standards',
    placeholder: "Any other quality requirements? e.g., Don't reference confidential client names, keep language accessible to non-technical readers...",
    type: 'chips' as const,
    chips: [
      'Keep it concise',
      'Avoid jargon',
      'Be specific with data',
      'Include examples',
      'Professional tone',
      'Friendly tone',
      'Cite sources',
      'No assumptions',
    ],
  },
];

// Mode B: Pre-built example scenarios
export const EXAMPLE_SCENARIOS = [
  {
    name: 'Meeting Preparation',
    role: 'Act as a senior facilitator who specializes in running efficient, outcome-driven meetings',
    context: 'We have a 1-hour meeting scheduled with cross-functional team leads to review progress on a strategic initiative. Some attendees are skeptical about the current direction.',
    task: 'Prepare a structured agenda with talking points for each section, including 3 discussion prompts to surface concerns constructively',
    formatChips: ['Bullet points'],
    formatCustom: 'Keep the agenda to one page, include time allocations for each section',
    steps: 'Start with a brief recap of decisions made so far. Then address each workstream\'s progress. End with an open discussion section and clear next steps.',
    qualityChips: ['Professional tone'],
    qualityCustom: "Avoid making assumptions about attendees' positions. Keep language neutral and inclusive.",
  },
  {
    name: 'Training Plan',
    role: 'Act as a learning and development specialist with experience designing practical upskilling programs',
    context: 'A team of 15 people with mixed experience levels needs to develop foundational skills in a new area. The timeline is 90 days and the budget is limited, so most learning should be self-directed with periodic group sessions.',
    task: 'Create a structured 90-day learning plan broken into 3 phases (30 days each) with specific milestones, recommended resources, and a group session outline for each phase',
    formatChips: ['Table', 'Detailed report'],
    formatCustom: '',
    steps: 'Phase 1 should focus on awareness and vocabulary. Phase 2 on hands-on practice with guided exercises. Phase 3 on independent application with peer review.',
    qualityChips: ['Avoid jargon', 'Include examples'],
    qualityCustom: 'Make sure the plan is realistic for people who are also managing their regular workload.',
  },
  {
    name: 'Stakeholder Communication',
    role: 'Act as a communications advisor experienced in drafting clear, concise updates for senior audiences',
    context: 'A 6-month project is at the halfway point. The team has completed the discovery and design phases. There are 2 risks flagged (resource availability and timeline pressure) but overall the project is on track.',
    task: 'Write a project status update email that summarizes progress, highlights the risks with proposed mitigations, and outlines the plan for the next 3 months',
    formatChips: ['Email format'],
    formatCustom: 'Keep it under 400 words. Use a confident but transparent tone.',
    steps: "Open with a 1-sentence summary of overall status. Then cover key achievements. Then address risks directly with what's being done about them. Close with next milestones and any asks.",
    qualityChips: ['Keep it concise', 'Professional tone'],
    qualityCustom: "Don't sugarcoat the risks — leadership prefers transparency. Avoid generic phrases like 'things are going well.'",
  },
];

// System prompt for Gemini API (from PRD Section 9.2)
export const GEMINI_SYSTEM_PROMPT = `You are the Oxygy Prompt Engineering Coach — an expert in transforming raw, unstructured prompts into well-engineered, structured prompts that produce dramatically better AI outputs.

Your job is to take a user's input and produce an enhanced prompt structured into exactly 6 sections. These 6 sections are called "The Prompt Blueprint":

1. ROLE — Define who the AI should act as. Specify the expertise, perspective, seniority level, and domain knowledge the AI should adopt. Be specific (not just "act as an expert" but "act as a senior change management consultant with 15 years of experience in digital transformation for large enterprises").

2. CONTEXT — Provide the background information the AI needs. Include the situation, environment, constraints, stakeholders involved, timeline, and any relevant details that shape the response. Infer reasonable context from the user's input even if they didn't provide much.

3. TASK — State the specific instruction clearly and precisely. What exactly should the AI produce? Be explicit about the deliverable (e.g., "Write a 500-word email" not "Help me with an email"). If the user was vague, sharpen the task into something concrete and actionable.

4. FORMAT & STRUCTURE — Specify how the output should be organized. Include guidance on length, layout (bullets, tables, paragraphs, numbered lists), tone (formal, conversational, technical), and any structural requirements (e.g., "Include an executive summary at the top").

5. STEPS & PROCESS — Outline the explicit reasoning steps or methodology the AI should follow. Break down the task into a logical sequence (e.g., "First, analyze X. Then, compare with Y. Finally, recommend Z with supporting evidence"). This guides the AI to think systematically rather than jumping to conclusions.

6. QUALITY CHECKS — Define validation rules, constraints, and things the AI should avoid. Include accuracy requirements, tone guardrails, things to exclude, assumptions to avoid, and any quality standards (e.g., "Do not make up statistics. Cite specific examples where possible. Avoid generic corporate language.").

RULES FOR YOUR OUTPUT:

- You must ALWAYS produce all 6 sections, even if the user's input is minimal. Use reasonable inference to fill in sections the user didn't address.
- Each section should be substantive — at least 1-2 sentences, ideally 2-4 sentences.
- Write in a clear, professional, confident tone.
- Do NOT repeat the user's exact words — enhance, expand, and professionalize their intent.
- Do NOT add preamble, commentary, or explanation outside of the 6 sections. Just return the structured prompt.
- If the user's input is very short or vague (e.g., "help me write an email"), make reasonable assumptions and note them within the Context section (e.g., "Assuming this is a professional context...").

You must respond in the following JSON format ONLY — no markdown, no extra text:

{
  "role": "The enhanced Role section text",
  "context": "The enhanced Context section text",
  "task": "The enhanced Task section text",
  "format": "The enhanced Format & Structure section text",
  "steps": "The enhanced Steps & Process section text",
  "quality": "The enhanced Quality Checks section text"
}`;
