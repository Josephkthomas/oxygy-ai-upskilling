import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin, Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const GEMINI_SYSTEM_PROMPT = `You are the Oxygy Prompt Engineering Coach — an expert in transforming raw, unstructured prompts into well-engineered, structured prompts that produce dramatically better AI outputs.

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

You must respond in the following JSON format ONLY — no markdown, no extra text, no code fences:

{
  "role": "The enhanced Role section text",
  "context": "The enhanced Context section text",
  "task": "The enhanced Task section text",
  "format": "The enhanced Format & Structure section text",
  "steps": "The enhanced Steps & Process section text",
  "quality": "The enhanced Quality Checks section text"
}`;

function geminiProxyPlugin(apiKey: string, model: string): Plugin {
  return {
    name: 'gemini-proxy',
    configureServer(server) {
      server.middlewares.use('/api/enhance-prompt', (req: Connect.IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'API key not configured' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { mode, prompt, wizardAnswers } = JSON.parse(body);

            let userMessage: string;
            if (mode === 'enhance') {
              userMessage = prompt;
            } else {
              // Build mode — assemble wizard answers into a structured message
              const wa = wizardAnswers;
              const formatText = [
                ...(wa.formatChips || []),
                wa.formatCustom || '',
              ].filter(Boolean).join(', ') || 'Not specified';
              const qualityText = [
                ...(wa.qualityChips || []),
                wa.qualityCustom || '',
              ].filter(Boolean).join(', ') || 'Not specified';

              userMessage = `The user wants to build a prompt with the following inputs:\n\nRole: ${wa.role || 'Not specified'}\nContext: ${wa.context || 'Not specified'}\nTask: ${wa.task || 'Not specified'}\nFormat preferences: ${formatText}\nSteps: ${wa.steps || 'Not specified'}\nQuality constraints: ${qualityText}\n\nPlease enhance and expand each section into a polished, comprehensive prompt following The Prompt Blueprint framework.`;
            }

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: GEMINI_SYSTEM_PROMPT }],
                },
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: userMessage }],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  responseMimeType: 'application/json',
                },
              }),
            });

            if (!geminiResponse.ok) {
              const errText = await geminiResponse.text();
              console.error('Gemini API error:', errText);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'AI service error' }));
              return;
            }

            const data = await geminiResponse.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Parse the JSON response — handle potential markdown fences
            let parsed;
            try {
              const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
              parsed = JSON.parse(cleaned);
            } catch {
              console.error('Failed to parse Gemini response:', text);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to parse AI response' }));
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(parsed));
          } catch (err) {
            console.error('Proxy error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });
    },
  };
}

function agentDesignProxyPlugin(apiKey: string, model: string): Plugin {
  const systemPrompt = `You are the Oxygy Agent Design Advisor — an expert in helping people design effective, reusable, and accountable AI agents for professional use.

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

The JSON template should be comprehensive and production-ready.

SECTION 3: SYSTEM PROMPT
Generate a complete, ready-to-use system prompt for this agent that incorporates:
- A clear role definition
- Context about the task and domain
- Explicit task instructions
- The JSON output format from Section 2 (embedded in the prompt)
- Step-by-step processing instructions
- Quality checks and constraints
- Human-in-the-loop requirements from Section 4

Mark each section of the prompt with labels: [ROLE], [CONTEXT], [TASK], [OUTPUT FORMAT], [STEPS], [QUALITY CHECKS] — so the frontend can apply color-coding.

SECTION 4: HUMAN-IN-THE-LOOP CHECKS
Based on the task AND the input data type, generate 3-5 specific accountability checks. Each check must include:
- name: A short, clear name for the check
- severity: "critical", "important", or "recommended"
- what_to_verify: 1-2 sentences on what the human should review
- why_it_matters: 1-2 sentences on the risk if this isn't checked
- prompt_instruction: The exact text to add to the agent's prompt to enforce this check

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
    "level1_points": ["Point about when ad-hoc prompting would suffice"],
    "level2_points": ["Point about why a custom agent is recommended"]
  },
  "output_format": {
    "human_readable": "The formatted output as a string with newlines",
    "json_template": { "example": "nested object" }
  },
  "system_prompt": "The full system prompt text with [ROLE], [CONTEXT], [TASK], [OUTPUT FORMAT], [STEPS], [QUALITY CHECKS] section markers",
  "accountability": [
    {
      "name": "Source Row References",
      "severity": "critical",
      "what_to_verify": "Description...",
      "why_it_matters": "Description...",
      "prompt_instruction": "The exact prompt text..."
    }
  ]
}`;

  return {
    name: 'agent-design-proxy',
    configureServer(server) {
      server.middlewares.use('/api/design-agent', (req: Connect.IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'API key not configured' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { task_description, input_data_description } = JSON.parse(body);

            const userMessage = `Task Description: ${task_description}\n\nInput Data Description: ${input_data_description || 'Not specified'}`;

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: systemPrompt }],
                },
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: userMessage }],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  responseMimeType: 'application/json',
                },
              }),
            });

            if (!geminiResponse.ok) {
              const errText = await geminiResponse.text();
              console.error('Gemini API error (agent design):', errText);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'AI service error' }));
              return;
            }

            const data = await geminiResponse.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            let parsed;
            try {
              const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
              parsed = JSON.parse(cleaned);
            } catch {
              console.error('Failed to parse Gemini response (agent design):', text);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to parse AI response' }));
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(parsed));
          } catch (err) {
            console.error('Proxy error (agent design):', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const geminiModel = env.GEMINI_MODEL || 'gemini-2.0-flash';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      geminiProxyPlugin(env.GEMINI_API_KEY, geminiModel),
      agentDesignProxyPlugin(env.GEMINI_API_KEY, geminiModel),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
