// Agent Builder Toolkit — Static Content & Configuration

// Good examples — strong candidates for a Level 2 agent
export const GOOD_EXAMPLES = [
  {
    name: 'Survey Analyzer',
    task: 'Analyze employee engagement survey results to identify the top themes, sentiment trends by department, and prioritized recommendations for the leadership team',
    inputData: 'Excel spreadsheet with columns: Employee ID, Department, Tenure Band, Question Category, Rating (1-5), Open-Text Response. Approximately 200-500 rows per survey cycle.',
  },
  {
    name: 'Meeting Summarizer',
    task: "Summarize meeting recordings into structured notes with key decisions, action items, owners, and deadlines — so the team doesn't need to re-watch the recording",
    inputData: 'Auto-generated meeting transcripts from Teams or Zoom, typically 30-60 minutes in length, with speaker labels and timestamps. May include multiple speakers across different roles.',
  },
  {
    name: 'Proposal Drafter',
    task: 'Draft a first-pass client proposal based on project brief inputs, incorporating relevant case studies, methodology descriptions, and team structure recommendations',
    inputData: 'Project brief documents (Word or PDF) containing client background, objectives, scope, timeline, and budget. Plus an internal case study library with past project descriptions and outcomes.',
  },
] as const;

// Not-recommended examples — better suited to ad-hoc prompting
export const NOT_RECOMMENDED_EXAMPLES = [
  {
    name: 'Quick Email Reply',
    task: 'Write a quick reply to a colleague asking about meeting availability next week',
    inputData: 'A single email thread with 2-3 messages.',
  },
  {
    name: 'One-Time Research',
    task: 'Research the top 5 competitors in the sustainable packaging space for a one-off board presentation',
    inputData: 'No specific input data — general web research needed.',
  },
  {
    name: 'Creative Brainstorm',
    task: 'Help me brainstorm creative names and taglines for a new internal innovation program',
    inputData: 'A brief description of the program goals and target audience.',
  },
] as const;

export const CRITERIA_LABELS: Record<string, { label: string; description: string }> = {
  frequency: { label: 'Frequency', description: 'How often is this task performed?' },
  consistency: { label: 'Consistency', description: 'Does the output need the same structure each time?' },
  shareability: { label: 'Shareability', description: 'Would others on the team use this same tool?' },
  complexity: { label: 'Complexity', description: 'Does it require domain expertise or multi-step reasoning?' },
  standardization_risk: { label: 'Standardization Risk', description: 'Would variable outputs cause downstream problems?' },
};

export const WHY_JSON_CONTENT = `JSON (JavaScript Object Notation) is a structured data format that both humans and machines can read. When you define your agent's output as a JSON template:

\u2022 The agent produces the exact same structure every time \u2014 no variation
\u2022 Other tools and workflows can automatically read and process the output
\u2022 Your team can build dashboards, reports, or automations on top of it
\u2022 It eliminates the "I got a different format this time" problem entirely

Think of it as the blueprint that turns a creative AI response into a reliable, repeatable business tool.`;

// Color mapping for prompt section highlighting (matches Level 1 Prompt Blueprint)
export const PROMPT_SECTION_COLORS: Record<string, { bg: string; label: string; emoji: string }> = {
  ROLE: { bg: 'rgba(195, 208, 245, 0.3)', label: 'ROLE', emoji: '\u{1F3AD}' },
  CONTEXT: { bg: 'rgba(251, 232, 166, 0.3)', label: 'CONTEXT', emoji: '\u{1F4CD}' },
  TASK: { bg: 'rgba(56, 178, 172, 0.15)', label: 'TASK', emoji: '\u{1F3AF}' },
  'OUTPUT FORMAT': { bg: 'rgba(168, 240, 224, 0.3)', label: 'OUTPUT FORMAT', emoji: '\u{1F4D0}' },
  STEPS: { bg: 'rgba(251, 206, 177, 0.3)', label: 'STEPS', emoji: '\u{1F9E9}' },
  'QUALITY CHECKS': { bg: 'rgba(230, 255, 250, 0.5)', label: 'QUALITY', emoji: '\u{2705}' },
};

export const AGENT_DESIGN_SYSTEM_PROMPT = `You are the Oxygy Agent Design Advisor — an expert in helping people design effective, reusable, and accountable AI agents for professional use.

You will receive a description of a task that a user wants to build an AI agent for, and optionally a description of the input data that agent will process.

You must respond with a JSON object containing exactly 4 sections that correspond to the 4 steps of the Agent Builder Toolkit:

SECTION 1: AGENT READINESS ASSESSMENT
Evaluate the task against 5 criteria to determine if it warrants a custom agent:
- Frequency: How often is this task likely performed? (Score 0-100)
- Consistency: Does the output need the same structure each time? (Score 0-100)
- Shareability: Would others on the team benefit from this same tool? (Score 0-100)
- Complexity: Does it require domain expertise or multi-step reasoning? (Score 0-100)
- Standardization Risk: Would variable outputs cause downstream problems? (Score 0-100)

Calculate an overall score (weighted average — Frequency 20%, Consistency 25%, Shareability 20%, Complexity 15%, Standardization Risk 20%).

Provide a verdict, a rationale paragraph, and specific bullet points for why Level 1 ad-hoc prompting might suffice vs. why a Level 2 custom agent is recommended.

SECTION 2: OUTPUT FORMAT DESIGN
Based on the task, design a structured output format in two representations:
a) A human-readable version — formatted as clean, professional output that a team member would want to read. Use clear headings, sections, and structure.
b) A JSON template — the exact JSON schema that the agent should produce. Include all fields, nested objects, arrays where appropriate, and use descriptive key names. Add brief comments (as string values) explaining what each field should contain.

The JSON template should be comprehensive and production-ready. Think about what fields someone would need to: track the output over time, compare outputs across different runs, feed the output into a dashboard or report, and share with colleagues.

SECTION 3: SYSTEM PROMPT
Generate a complete, ready-to-use system prompt for this agent that incorporates:
- A clear role definition
- Context about the task and domain
- Explicit task instructions
- The JSON output format from Section 2 (embedded in the prompt)
- Step-by-step processing instructions
- Quality checks and constraints
- Human-in-the-loop requirements from Section 4

The prompt should be professional, detailed, and immediately usable in ChatGPT Custom GPT Builder, Claude Projects, or Microsoft Copilot Agents.

Mark each section of the prompt with labels: [ROLE], [CONTEXT], [TASK], [OUTPUT FORMAT], [STEPS], [QUALITY CHECKS] — so the frontend can apply color-coding to match the Prompt Blueprint framework from Level 1.

SECTION 4: HUMAN-IN-THE-LOOP CHECKS
Based on the task AND the input data type, generate 3-5 specific accountability checks. Each check must include:
- name: A short, clear name for the check
- severity: "critical", "important", or "recommended"
- what_to_verify: 1-2 sentences on what the human should review
- why_it_matters: 1-2 sentences on the risk if this isn't checked
- prompt_instruction: The exact text to add to the agent's prompt to enforce this check

Tailor the checks to the specific data type:
- For survey data: Include row-level references, response counts, confidence indicators
- For transcripts: Include timestamps, speaker attribution, context preservation
- For documents: Include page/section references, source citations, cross-referencing
- For financial data: Include calculation verification, source cell references, assumption flagging
- For general tasks: Include reasoning trails, alternative perspectives, confidence levels

RESPONSE FORMAT:
You must respond with the following JSON structure ONLY — no markdown, no extra text:

{
  "readiness": {
    "overall_score": 85,
    "verdict": "Strong candidate for a custom agent",
    "rationale": "This task is performed frequently...",
    "criteria": {
      "frequency": { "score": 90, "assessment": "Weekly or more frequent task" },
      "consistency": { "score": 85, "assessment": "Output structure must be consistent for team use" },
      "shareability": { "score": 80, "assessment": "Multiple team members would benefit" },
      "complexity": { "score": 75, "assessment": "Requires domain knowledge in..." },
      "standardization_risk": { "score": 90, "assessment": "Variable outputs would cause..." }
    },
    "level1_points": [
      "Point about when ad-hoc prompting would suffice"
    ],
    "level2_points": [
      "Point about why a custom agent is recommended"
    ]
  },
  "output_format": {
    "human_readable": "The formatted, human-readable output example as a string with newlines",
    "json_template": {
      "example": "The actual JSON template object goes here as a nested object"
    }
  },
  "system_prompt": "The full system prompt text with [ROLE], [CONTEXT], [TASK], [OUTPUT FORMAT], [STEPS], [QUALITY CHECKS] section markers",
  "accountability": [
    {
      "name": "Source Row References",
      "severity": "critical",
      "what_to_verify": "Description of what to check...",
      "why_it_matters": "Description of the risk...",
      "prompt_instruction": "The exact prompt text to add..."
    }
  ]
}`;
