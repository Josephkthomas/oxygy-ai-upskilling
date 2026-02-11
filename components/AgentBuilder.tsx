import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Bot, MessageSquare, Eye, Code, Copy, Check,
  ChevronDown, ChevronUp, Info, Square, CheckSquare,
} from 'lucide-react';
import { useAgentDesignApi } from '../hooks/useAgentDesignApi';
import {
  EXAMPLE_AGENTS, CRITERIA_LABELS, STEPPER_LABELS,
  WHY_JSON_CONTENT, PROMPT_SECTION_COLORS,
} from '../data/agent-builder-content';
import type { AgentDesignResult, AgentReadinessCriteria } from '../types';

/* ─── HELPERS ─── */

function getScoreColor(score: number) {
  if (score >= 80) return '#38B2AC';
  if (score >= 50) return '#C4A934';
  return '#E57A5A';
}

function getVerdictText(score: number) {
  if (score >= 80) return 'Strong candidate for a custom agent';
  if (score >= 50) return 'Could benefit from an agent \u2014 with some caveats';
  return 'Better suited to ad-hoc prompting for now';
}

function getSeverityStyle(severity: string) {
  switch (severity) {
    case 'critical': return { bg: '#FFF5F5', color: '#C53030', border: '#FC8181' };
    case 'important': return { bg: '#FFFFF0', color: '#B7791F', border: '#F6E05E' };
    default: return { bg: '#E6FFFA', color: '#2C7A7B', border: '#81E6D9' };
  }
}

/** Parse the system prompt's [SECTION] markers into color-coded spans */
function renderColorCodedPrompt(prompt: string) {
  const parts: React.ReactNode[] = [];
  let key = 0;

  const markerRegex = /\[(ROLE|CONTEXT|TASK|OUTPUT FORMAT|STEPS|QUALITY CHECKS)\]/g;
  const matches = [...prompt.matchAll(markerRegex)];

  if (matches.length === 0) {
    return <span>{prompt}</span>;
  }

  if (matches[0].index! > 0) {
    parts.push(<span key={key++}>{prompt.slice(0, matches[0].index!)}</span>);
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionName = match[1];
    const startIdx = match.index! + match[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index! : prompt.length;
    const sectionText = prompt.slice(startIdx, endIdx);
    const colors = PROMPT_SECTION_COLORS[sectionName];

    if (colors) {
      parts.push(
        <span key={key++} style={{ backgroundColor: colors.bg, borderRadius: '4px', padding: '2px 0' }}>
          <span style={{
            display: 'inline-block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em',
            padding: '1px 6px', borderRadius: '4px', marginRight: '4px',
            backgroundColor: colors.bg, color: '#4A5568',
          }}>
            {colors.emoji} {colors.label}
          </span>
          {sectionText}
        </span>
      );
    } else {
      parts.push(<span key={key++}>{sectionText}</span>);
    }
  }

  return <>{parts}</>;
}

function renderJSONLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;
  const regex = /("(?:[^"\\]|\\.)*")(\s*:\s*)?|(\btrue\b|\bfalse\b|\bnull\b|\b\d+\.?\d*\b)|([{}\[\],:])/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{line.slice(lastIndex, match.index)}</span>);
    }
    if (match[1]) {
      if (match[2]) {
        parts.push(<span key={key++} style={{ color: '#38B2AC' }}>{match[1]}</span>);
        parts.push(<span key={key++} style={{ color: '#718096' }}>{match[2]}</span>);
      } else {
        parts.push(<span key={key++} style={{ color: '#A8F0E0' }}>{match[1]}</span>);
      }
    } else if (match[3]) {
      parts.push(<span key={key++} style={{ color: '#FBE8A6' }}>{match[3]}</span>);
    } else if (match[4]) {
      parts.push(<span key={key++} style={{ color: '#718096' }}>{match[4]}</span>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    parts.push(<span key={key++}>{line.slice(lastIndex)}</span>);
  }
  return <>{parts}</>;
}

/* ─── SCORE CIRCLE ─── */

function ScoreCircle({ score, animated }: { score: number; animated: boolean }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const color = getScoreColor(score);

  useEffect(() => {
    if (!animated) return;
    let start: number | null = null;
    const duration = 1000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score, animated]);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Agent readiness score: ${score} percent`}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: '36px', fontWeight: 700, fill: '#1A202C', fontFamily: '"DM Sans", sans-serif' }}>
          {displayScore}%
        </text>
      </svg>
      <p className="text-[16px] font-semibold" style={{ color }}>{getVerdictText(score)}</p>
    </div>
  );
}

/* ─── SKELETONS ─── */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-[#F7FAFC] rounded-lg animate-skeleton ${className}`} />;
}

function StepOneSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center"><SkeletonBlock className="w-[120px] h-[120px] rounded-full" /></div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonBlock className="w-24 h-4" />
          <SkeletonBlock className="flex-1 h-4" />
          <SkeletonBlock className="w-[120px] h-[6px]" />
        </div>
      ))}
    </div>
  );
}

function StepTwoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonBlock className="h-[300px]" />
      <SkeletonBlock className="h-[300px]" />
    </div>
  );
}

function StepThreeSkeleton() {
  return <SkeletonBlock className="h-[200px]" />;
}

function StepFourSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i}><SkeletonBlock className="h-[160px]" /></div>
      ))}
    </div>
  );
}

/* ─── 4-STEP PROCESS ICONS ─── */

const STEP_PREVIEWS = [
  { num: 1, icon: '\u{1F50D}', title: 'Assess', desc: 'Should you build a custom agent for this task?' },
  { num: 2, icon: '\u{1F4D0}', title: 'Design Output', desc: 'Define the structured format your agent produces' },
  { num: 3, icon: '\u{1F4DD}', title: 'Get Prompt', desc: 'Receive a ready-to-use system prompt' },
  { num: 4, icon: '\u{2705}', title: 'Accountability', desc: 'Add human-in-the-loop verification checks' },
];

/* ─── MAIN COMPONENT ─── */

export const AgentBuilder: React.FC = () => {
  // Input state
  const [taskDescription, setTaskDescription] = useState('');
  const [inputDataDescription, setInputDataDescription] = useState('');
  const [flashTask, setFlashTask] = useState(false);
  const [flashData, setFlashData] = useState(false);

  // Result state
  const [result, setResult] = useState<AgentDesignResult | null>(null);
  const [stepsRevealed, setStepsRevealed] = useState(0);
  const [scoreAnimated, setScoreAnimated] = useState(false);

  // UI state
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [showJsonTooltip, setShowJsonTooltip] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Accountability checkbox state
  const [selectedChecks, setSelectedChecks] = useState<Record<number, boolean>>({});

  // Refs
  const outputRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stepperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const [isStepperStuck, setIsStepperStuck] = useState(false);

  // API
  const { designAgent, isLoading, error, clearError } = useAgentDesignApi();

  // ─── Sticky stepper detection ───
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStepperStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [result]);

  // ─── Track active step on scroll ───
  useEffect(() => {
    if (!result) return;
    const handleScroll = () => {
      for (let i = stepRefs.current.length - 1; i >= 0; i--) {
        const el = stepRefs.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) { setActiveStep(i); return; }
        }
      }
      setActiveStep(0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [result]);

  // ─── Staggered step reveal ───
  useEffect(() => {
    if (!result || stepsRevealed >= 4) return;
    const timer = setTimeout(() => {
      setStepsRevealed(prev => prev + 1);
      if (stepsRevealed === 0) setScoreAnimated(true);
    }, stepsRevealed === 0 ? 200 : 300);
    return () => clearTimeout(timer);
  }, [result, stepsRevealed]);

  // ─── Init all checks as selected when result arrives ───
  useEffect(() => {
    if (result && result.accountability) {
      const initial: Record<number, boolean> = {};
      result.accountability.forEach((_, idx) => { initial[idx] = true; });
      setSelectedChecks(initial);
    }
  }, [result]);

  // ─── Handlers ───
  const handleExampleClick = (example: typeof EXAMPLE_AGENTS[number]) => {
    setTaskDescription(example.task);
    setInputDataDescription(example.inputData);
    setFlashTask(true);
    setFlashData(true);
    setTimeout(() => { setFlashTask(false); setFlashData(false); }, 300);
  };

  const handleDesign = async () => {
    if (!taskDescription.trim()) return;
    clearError();
    setResult(null);
    setStepsRevealed(0);
    setScoreAnimated(false);
    setPromptExpanded(false);
    setActiveStep(0);
    setSelectedChecks({});

    const data = await designAgent({
      task_description: taskDescription.trim(),
      input_data_description: inputDataDescription.trim() || 'Not specified',
    });

    if (data) {
      setResult(data);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleStartOver = () => {
    setTaskDescription('');
    setInputDataDescription('');
    setResult(null);
    setStepsRevealed(0);
    setScoreAnimated(false);
    setPromptExpanded(false);
    setCopiedItems({});
    setActiveStep(0);
    setSelectedChecks({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCheck = (idx: number) => {
    setSelectedChecks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const copyToClipboard = useCallback((text: string, label: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItems(prev => ({ ...prev, [id]: true }));
      setToastMessage(label);
      setShowToast(true);
      setTimeout(() => setCopiedItems(prev => ({ ...prev, [id]: false })), 2000);
      setTimeout(() => setShowToast(false), 2500);
    });
  }, []);

  const scrollToStep = (idx: number) => {
    if (idx <= stepsRevealed - 1) {
      stepRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const buildSelectedChecksText = (): string => {
    if (!result) return '';
    return result.accountability
      .filter((_, idx) => selectedChecks[idx])
      .map(c => `## ${c.name} [${c.severity.toUpperCase()}]\n${c.prompt_instruction}`)
      .join('\n\n');
  };

  const buildFullPromptWithChecks = (): string => {
    if (!result) return '';
    const selectedInstructions = result.accountability
      .filter((_, idx) => selectedChecks[idx])
      .map(c => c.prompt_instruction)
      .join('\n\n');
    return result.system_prompt + '\n\n--- HUMAN-IN-THE-LOOP CHECKS ---\n\n' + selectedInstructions;
  };

  const selectedCount = Object.values(selectedChecks).filter(Boolean).length;

  // Close JSON tooltip on outside click
  useEffect(() => {
    if (!showJsonTooltip) return;
    const handleClick = () => setShowJsonTooltip(false);
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowJsonTooltip(false); };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => { document.removeEventListener('click', handleClick); document.removeEventListener('keydown', handleEsc); };
  }, [showJsonTooltip]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* ─── BREADCRUMB ─── */}
        <a href="#home" className="inline-flex items-center gap-1.5 text-[14px] text-[#718096] hover:text-[#38B2AC] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Level 2
        </a>

        {/* ─── HERO: Title (centered, matching L1 style) ─── */}
        <div className="mb-8 text-center">
          <h1 className="text-[36px] md:text-[48px] font-bold text-[#1A202C] leading-[1.15] mb-6">
            Design Your Own
            <br />
            <span className="relative inline-block">
              Level 2 AI Agent
              <span className="absolute left-0 -bottom-1 w-full h-[4px] bg-[#38B2AC] opacity-80 rounded-full" />
            </span>
          </h1>

          {/* ─── FUN FACT CARD (matching L1 gradient card pattern) ─── */}
          <div className="max-w-2xl mx-auto mb-4">
            <div
              className="relative rounded-2xl px-8 py-6 text-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 50%, rgba(195, 208, 245, 0.2) 100%)',
                border: '1px solid #E2E8F0',
              }}
            >
              {/* Decorative accent dots */}
              <div className="absolute top-3 left-4 flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5B6DC2] opacity-40" />
                <span className="w-2 h-2 rounded-full bg-[#C3D0F5] opacity-60" />
                <span className="w-2 h-2 rounded-full bg-[#38B2AC] opacity-40" />
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B6DC2] mb-2">
                Did you know?
              </p>
              <p className="text-[16px] md:text-[17px] text-[#2D3748] leading-[1.6] font-medium mb-1">
                Teams that use standardized AI agents see up to <span className="text-[#5B6DC2] font-bold">3x faster adoption</span> across departments
                than those relying on ad-hoc prompts alone.
              </p>
              <p className="text-[14px] text-[#718096] leading-[1.6] mb-5">
                The difference between a one-off prompt and a custom agent is the difference between a single answer and a reusable tool your entire team can rely on — with consistent outputs, built-in accountability, and a structure that scales.
              </p>

              <button
                onClick={scrollToInput}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A202C] text-white text-[14px] font-semibold rounded-full hover:bg-[#2D3748] transition-colors"
              >
                Describe your task below <ChevronDown size={15} className="animate-bounce-down" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── 4-STEP PROCESS PREVIEW ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-3xl mx-auto">
          {STEP_PREVIEWS.map((step) => (
            <div key={step.num} className="text-center px-3 py-4 rounded-xl border border-[#E2E8F0] bg-[#F7FAFC]">
              <div className="text-2xl mb-1.5">{step.icon}</div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0] mb-0.5">Step {step.num}</p>
              <p className="text-[14px] font-semibold text-[#1A202C] mb-1">{step.title}</p>
              <p className="text-[12px] text-[#718096] leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── INPUT SECTION (lavender-tinted container) ─── */}
        <div
          ref={inputSectionRef}
          className="rounded-2xl p-6 sm:p-8 mb-10 scroll-mt-24"
          style={{
            background: 'linear-gradient(135deg, rgba(195, 208, 245, 0.12) 0%, rgba(195, 208, 245, 0.06) 100%)',
            border: '1.5px solid #C3D0F5',
          }}
        >
          <h2 className="text-[16px] font-bold text-[#1A202C] mb-4">
            Describe the task your agent should handle
          </h2>

          {/* Example pills */}
          <div className="mb-5">
            <span className="text-[13px] text-[#718096] italic block mb-2">Try an example:</span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_AGENTS.map((ex) => (
                <button key={ex.name} onClick={() => handleExampleClick(ex)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] border border-[#C3D0F5] bg-white text-[#4A5568] hover:border-[#5B6DC2] hover:text-[#5B6DC2] hover:bg-[rgba(195,208,245,0.15)] transition-colors"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {/* Input 1: Task Description */}
          <label className="block text-[13px] font-semibold text-[#1A202C] mb-1.5">
            What should this agent do?
          </label>
          <textarea
            value={taskDescription} onChange={e => setTaskDescription(e.target.value)}
            placeholder="e.g., Analyze customer feedback surveys and identify the top themes, sentiment patterns, and actionable recommendations..."
            className="w-full rounded-xl border-2 border-[#C3D0F5] bg-white px-4 py-3.5 text-[15px] text-[#1A202C] placeholder:text-[#A0AEC0] resize-none focus:outline-none focus:border-[#5B6DC2] focus:ring-[3px] focus:ring-[rgba(91,109,194,0.12)] transition-all"
            style={{
              minHeight: '100px', maxHeight: '160px',
              backgroundColor: flashTask ? 'rgba(195,208,245,0.2)' : '#FFFFFF',
              transition: 'background-color 0.3s, border-color 0.2s, box-shadow 0.2s',
            }}
          />

          {/* Input 2: Input Data */}
          <div className="mt-4">
            <label className="text-[13px] font-semibold text-[#1A202C] mb-1.5 flex items-center gap-2">
              What data will this agent work with?
              <span className="text-[11px] font-semibold text-[#5B6DC2] bg-[rgba(195,208,245,0.3)] rounded-[10px] px-2 py-0.5">
                Recommended
              </span>
            </label>
            <textarea
              value={inputDataDescription} onChange={e => setInputDataDescription(e.target.value)}
              placeholder="e.g., Excel files containing survey responses with columns for respondent role, department, rating (1-5), and open-text feedback..."
              className="w-full rounded-xl border-2 border-[#C3D0F5] bg-white px-4 py-3.5 text-[15px] text-[#1A202C] placeholder:text-[#A0AEC0] resize-none focus:outline-none focus:border-[#5B6DC2] focus:ring-[3px] focus:ring-[rgba(91,109,194,0.12)] transition-all mt-1.5"
              style={{
                minHeight: '72px', maxHeight: '120px',
                backgroundColor: flashData ? 'rgba(195,208,245,0.2)' : '#FFFFFF',
                transition: 'background-color 0.3s, border-color 0.2s, box-shadow 0.2s',
              }}
            />
          </div>

          {/* Educational callout */}
          <div className="mt-3 bg-white border border-[#E2E8F0] border-l-[3px] border-l-[#5B6DC2] rounded-lg px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#1A202C] mb-1 flex items-center gap-1.5">
              <Info size={14} className="text-[#5B6DC2]" />
              Why does input data matter?
            </p>
            <p className="text-[13px] text-[#4A5568] leading-[1.6]">
              The type of data your agent processes determines everything:
              how its output should be structured, what evidence it should cite,
              and what human checks are needed. Defining your input data helps us design
              the right accountability checks.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-5 flex justify-end">
            <button
              onClick={handleDesign}
              disabled={!taskDescription.trim() || isLoading}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-[15px] font-semibold text-white transition-all"
              style={{
                backgroundColor: '#38B2AC',
                opacity: (!taskDescription.trim() || isLoading) ? 0.5 : 1,
                cursor: (!taskDescription.trim() || isLoading) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (taskDescription.trim() && !isLoading) (e.target as HTMLElement).style.backgroundColor = '#319795'; }}
              onMouseLeave={e => (e.target as HTMLElement).style.backgroundColor = '#38B2AC'}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Designing...
                </>
              ) : (
                <>Design My Agent <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-[#FFF5F5] border border-[#FC8181] text-[#C53030] rounded-lg px-4 py-3 text-[14px]">
              {error}
            </div>
          )}
        </div>

        {/* ─── OUTPUT SECTION ─── */}
        {(result || isLoading) && (
          <div ref={outputRef} className="mt-4">
            <div ref={sentinelRef} />

            {/* ─── PROGRESS STEPPER ─── */}
            <div
              ref={stepperRef}
              className="sticky top-0 z-30 py-4 mb-6 transition-all duration-200"
              style={{
                backgroundColor: isStepperStuck ? 'rgba(255,255,255,0.9)' : 'transparent',
                backdropFilter: isStepperStuck ? 'blur(8px)' : 'none',
                boxShadow: isStepperStuck ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              }}
              role="navigation" aria-label="Agent design steps"
            >
              <div className="flex items-center justify-between max-w-[600px] mx-auto">
                {STEPPER_LABELS.map((step, idx) => {
                  const isCompleted = idx < stepsRevealed - 1 || (stepsRevealed === 4 && idx < 4);
                  const isActive = idx === activeStep && stepsRevealed > idx;
                  const isUpcoming = idx >= stepsRevealed;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <div className="flex-1 h-[2px] mx-1" style={{
                          backgroundColor: idx < stepsRevealed ? '#38B2AC' : '#E2E8F0',
                          transition: 'background-color 0.3s',
                        }} />
                      )}
                      <button onClick={() => scrollToStep(idx)} className="flex flex-col items-center gap-1.5 shrink-0"
                        style={{ cursor: isCompleted || isActive ? 'pointer' : 'default' }} disabled={isUpcoming}
                      >
                        <div className="flex items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300"
                          style={{
                            width: '32px', height: '32px',
                            backgroundColor: (isCompleted || isActive) ? '#38B2AC' : '#F7FAFC',
                            color: (isCompleted || isActive) ? '#FFFFFF' : '#A0AEC0',
                            border: isUpcoming ? '1px solid #E2E8F0' : 'none',
                          }}
                        >
                          {isCompleted && !isActive ? <Check size={16} /> : idx + 1}
                        </div>
                        <span className="text-center leading-tight max-w-[100px]" style={{
                          fontSize: '12px', fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#1A202C' : isCompleted ? '#38B2AC' : '#A0AEC0',
                        }}>
                          <span className="hidden sm:inline">{step.full}</span>
                          <span className="sm:hidden">{step.short}</span>
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ─── STEP 1: Should You Build This? ─── */}
            {(stepsRevealed >= 1 || isLoading) && (
              <div ref={el => stepRefs.current[0] = el} className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 animate-fade-in-up mb-8 scroll-mt-24">
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 1</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Should You Build This?</h3>
                <p className="text-[15px] text-[#4A5568] mb-6">Not every task needs a custom agent. Here's our assessment of whether your task is a strong candidate.</p>

                {isLoading && !result ? <StepOneSkeleton /> : result && (
                  <>
                    <div className="mb-8">
                      <ScoreCircle score={result.readiness.overall_score} animated={scoreAnimated} />
                    </div>

                    <div className="mb-8">
                      {(Object.entries(result.readiness.criteria) as [string, AgentReadinessCriteria][]).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-4 py-3 border-b border-[#F7FAFC] last:border-b-0">
                          <div className="w-[140px] shrink-0">
                            <p className="text-[14px] font-bold text-[#1A202C]">{CRITERIA_LABELS[key]?.label || key}</p>
                          </div>
                          <p className="flex-1 text-[14px] text-[#4A5568]">{val.assessment}</p>
                          <div className="w-[120px] shrink-0">
                            <div className="h-[6px] rounded-full bg-[#E2E8F0] overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val.score}%`, backgroundColor: '#38B2AC' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* L1 vs L2 Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#F7FAFC] rounded-lg p-4 border border-[#E2E8F0]">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare size={18} className="text-[#A0AEC0]" />
                          <h4 className="text-[14px] font-semibold text-[#1A202C]">Level 1: Ad-Hoc Prompting</h4>
                        </div>
                        <ul className="space-y-2">
                          {result.readiness.level1_points.map((point, i) => (
                            <li key={i} className="text-[13px] text-[#4A5568] leading-[1.6] flex gap-2">
                              <span className="text-[#A0AEC0] shrink-0">&bull;</span>{point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#F7FAFC] rounded-lg p-4"
                        style={{ border: result.readiness.overall_score >= 50 ? '2px solid #38B2AC' : '1px solid #E2E8F0' }}
                      >
                        {result.readiness.overall_score >= 50 && (
                          <span className="inline-block text-[11px] font-semibold text-white bg-[#38B2AC] rounded-[10px] px-2 py-0.5 mb-2">Recommended</span>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <Bot size={18} className="text-[#38B2AC]" />
                          <h4 className="text-[14px] font-semibold text-[#1A202C]">Level 2: Custom Agent</h4>
                        </div>
                        <ul className="space-y-2">
                          {result.readiness.level2_points.map((point, i) => (
                            <li key={i} className="text-[13px] text-[#4A5568] leading-[1.6] flex gap-2">
                              <span className="text-[#38B2AC] shrink-0">&bull;</span>{point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── STEP 2: Design Your Output Format ─── */}
            {(stepsRevealed >= 2 || (isLoading && stepsRevealed >= 1)) && (
              <div ref={el => stepRefs.current[1] = el} className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 animate-fade-in-up mb-8 scroll-mt-24">
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 2</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Design Your Output Format</h3>
                <p className="text-[15px] text-[#4A5568] mb-4">A great agent doesn't just give good answers — it gives them in the same structure every time. This is what makes it shareable.</p>

                {/* Shareability callout */}
                <div className="rounded-lg p-4 sm:p-5 mb-6" style={{ background: 'rgba(195, 208, 245, 0.2)', border: '1px solid #C3D0F5', borderLeft: '4px solid #5B6DC2' }}>
                  <p className="text-[14px] font-semibold text-[#1A202C] mb-1">{'\uD83D\uDD17'} Build once, share across the team</p>
                  <p className="text-[13px] text-[#4A5568] leading-[1.6]">The power of a Level 2 agent isn't just that it works for you — it's that it works the same way for everyone on your team. Standardized output formats mean no one has to guess what the agent will produce.</p>
                </div>

                {isLoading && !result ? <StepTwoSkeleton /> : result && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Human View */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Eye size={16} className="text-[#718096]" />
                        <span className="text-[13px] font-semibold text-[#1A202C]">What your team sees</span>
                      </div>
                      <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 overflow-y-auto" style={{ maxHeight: '400px' }}>
                        {result.output_format.human_readable.split('\n').map((line, i) => {
                          if (!line.trim()) return <div key={i} className="h-3" />;
                          if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ') || /^[A-Z][A-Z\s&:]+$/.test(line.trim())) {
                            return <p key={i} className="text-[14px] font-semibold text-[#1A202C] mt-3 first:mt-0 mb-1">{line.replace(/^#+\s*/, '')}</p>;
                          }
                          if (line.trim().startsWith('- ') || line.trim().startsWith('\u2022 ')) {
                            return <p key={i} className="text-[13px] text-[#4A5568] leading-[1.6] pl-4">&bull; {line.replace(/^\s*[-\u2022]\s*/, '')}</p>;
                          }
                          return <p key={i} className="text-[13px] text-[#4A5568] leading-[1.6]">{line}</p>;
                        })}
                      </div>
                    </div>

                    {/* Code View */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 relative">
                        <Code size={16} className="text-[#718096]" />
                        <span className="text-[13px] font-semibold text-[#1A202C]">The JSON template</span>
                        <button onClick={e => { e.stopPropagation(); setShowJsonTooltip(!showJsonTooltip); }}
                          className="text-[11px] font-semibold text-[#718096] hover:text-[#38B2AC] bg-[#F7FAFC] border border-[#E2E8F0] rounded px-1.5 py-0.5 transition-colors"
                        >Why JSON?</button>

                        {showJsonTooltip && (
                          <div className="absolute top-full left-0 mt-1 z-40 bg-[#1A202C] text-white rounded-lg p-4 sm:p-5 max-w-[320px] animate-fade-in"
                            onClick={e => e.stopPropagation()}>
                            <p className="text-[13px] leading-[1.6] whitespace-pre-line">{WHY_JSON_CONTENT}</p>
                          </div>
                        )}
                      </div>

                      <div className="relative bg-[#1A202C] rounded-[10px] p-5 overflow-y-auto" style={{ maxHeight: '400px', fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace' }}>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(result.output_format.json_template, null, 2), 'JSON template copied to clipboard', 'json')}
                          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] text-white transition-colors"
                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          {copiedItems['json'] ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                        <pre className="text-[13px] leading-[1.6] overflow-x-auto">
                          {JSON.stringify(result.output_format.json_template, null, 2).split('\n').map((line, i) => (
                            <div key={i}>{renderJSONLine(line)}</div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 3: Your Agent Prompt ─── */}
            {(stepsRevealed >= 3 || (isLoading && stepsRevealed >= 2)) && (
              <div ref={el => stepRefs.current[2] = el} className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 animate-fade-in-up mb-8 scroll-mt-24">
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 3</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Your Agent Prompt</h3>
                <p className="text-[15px] text-[#4A5568] mb-3">This system prompt incorporates everything: the role, context, task definition, output format, and quality guidelines. Copy it directly into your Custom GPT, Claude Project, or Copilot Agent.</p>

                <p className="text-[13px] text-[#718096] mb-5">
                  {'\uD83D\uDD17'} This prompt follows the Prompt Blueprint framework from Level 1.{' '}
                  <a href="#playground" className="text-[#38B2AC] hover:underline inline-flex items-center gap-1">
                    Visit the Prompt Engineering Playground <ArrowRight size={12} />
                  </a>
                </p>

                {isLoading && !result ? <StepThreeSkeleton /> : result && (
                  <div className="bg-[#F7FAFC] border border-[#E2E8F0] rounded-[10px] p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[14px] text-[#1A202C] font-medium">
                        <span>{'\uD83D\uDCCB'}</span> Your system prompt is ready
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => copyToClipboard(result.system_prompt, 'System prompt copied to clipboard', 'system-prompt')}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold text-white bg-[#38B2AC] hover:bg-[#319795] transition-colors"
                        >
                          {copiedItems['system-prompt'] ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy System Prompt</>}
                        </button>
                        <button onClick={() => setPromptExpanded(!promptExpanded)}
                          className="flex items-center gap-1 text-[14px] text-[#718096] hover:text-[#38B2AC] transition-colors"
                          aria-expanded={promptExpanded}
                        >
                          {promptExpanded ? <><ChevronUp size={16} /> Hide Full Prompt</> : <><ChevronDown size={16} /> View Full Prompt</>}
                        </button>
                      </div>
                    </div>

                    <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: promptExpanded ? '500px' : '0' }}>
                      <div className="mt-4 bg-white border border-[#E2E8F0] rounded-lg p-4 sm:p-5 overflow-y-auto" style={{ maxHeight: '460px' }}>
                        <div className="text-[14px] text-[#2D3748] leading-[1.7] whitespace-pre-wrap">
                          {renderColorCodedPrompt(result.system_prompt)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 4: Accountability (with checkboxes) ─── */}
            {(stepsRevealed >= 4 || (isLoading && stepsRevealed >= 3)) && (
              <div ref={el => stepRefs.current[3] = el} className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 animate-fade-in-up mb-8 scroll-mt-24">
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 4</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Human-in-the-Loop Checks</h3>
                <p className="text-[15px] text-[#4A5568] mb-2">
                  AI agents are powerful, but they need guardrails. Select the checks you want to include, then copy them individually or as part of your full prompt.
                </p>
                <p className="text-[13px] text-[#718096] mb-6">
                  {'\u2611'} All checks are selected by default. Uncheck any you don't need.
                </p>

                {isLoading && !result ? <StepFourSkeleton /> : result && (
                  <>
                    <div className="space-y-3">
                      {result.accountability.map((check, idx) => {
                        const severity = getSeverityStyle(check.severity);
                        const isSelected = !!selectedChecks[idx];
                        return (
                          <div
                            key={idx}
                            className="bg-white border rounded-lg p-4 sm:p-5 relative transition-all duration-200"
                            style={{
                              borderLeft: `4px solid ${isSelected ? '#38B2AC' : '#E2E8F0'}`,
                              borderColor: isSelected ? '#E2E8F0' : '#E2E8F0',
                              borderLeftColor: isSelected ? '#38B2AC' : '#A0AEC0',
                              opacity: isSelected ? 1 : 0.6,
                            }}
                          >
                            {/* Header row with checkbox */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-start gap-3">
                                <button onClick={() => toggleCheck(idx)} className="mt-0.5 shrink-0 transition-colors" aria-label={`${isSelected ? 'Deselect' : 'Select'} ${check.name}`}>
                                  {isSelected ? (
                                    <CheckSquare size={20} className="text-[#38B2AC]" />
                                  ) : (
                                    <Square size={20} className="text-[#A0AEC0] hover:text-[#718096]" />
                                  )}
                                </button>
                                <h4 className="text-[16px] font-bold text-[#1A202C]">{check.name}</h4>
                              </div>
                              <span className="text-[11px] font-semibold rounded-[10px] px-2 py-0.5 shrink-0 capitalize"
                                style={{ backgroundColor: severity.bg, color: severity.color, border: `1px solid ${severity.border}` }}>
                                {check.severity}
                              </span>
                            </div>

                            <div className="pl-8">
                              <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wide mt-3 mb-1">What to verify</p>
                              <p className="text-[14px] text-[#4A5568] leading-[1.6]">{check.what_to_verify}</p>

                              <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wide mt-3 mb-1">Why this matters</p>
                              <p className="text-[14px] text-[#4A5568] leading-[1.6]">{check.why_it_matters}</p>

                              <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wide mt-3 mb-1">Add this to your prompt</p>
                              <div className="relative bg-[#F7FAFC] border border-[#E2E8F0] rounded-md px-3.5 py-2.5">
                                <p className="text-[13px] text-[#2D3748] leading-[1.6] pr-12"
                                  style={{ fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace' }}>
                                  {check.prompt_instruction}
                                </p>
                                <button onClick={() => copyToClipboard(check.prompt_instruction, `"${check.name}" instruction copied`, `check-${idx}`)}
                                  className="absolute top-2 right-2 text-[12px] text-[#38B2AC] hover:underline">
                                  {copiedItems[`check-${idx}`] ? 'Copied \u2713' : 'Copy'}
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5 mt-3">
                                <Check size={14} className="text-[#38B2AC]" />
                                <span className="text-[12px] text-[#38B2AC]">Included in your agent prompt (Step 3)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* ─── COPY OPTIONS BAR ─── */}
                    <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl">
                      <p className="text-[13px] text-[#718096] shrink-0">
                        {selectedCount} of {result.accountability.length} checks selected
                      </p>
                      <div className="flex-1" />
                      <button
                        onClick={() => copyToClipboard(buildSelectedChecksText(), 'Selected checks copied to clipboard', 'selected-checks')}
                        disabled={selectedCount === 0}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold border border-[#1A202C] text-[#1A202C] hover:bg-[#EDF2F7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {copiedItems['selected-checks'] ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Selected Checks</>}
                      </button>
                      <button
                        onClick={() => copyToClipboard(buildFullPromptWithChecks(), 'Full prompt with checks copied to clipboard', 'full-with-checks')}
                        disabled={selectedCount === 0}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-white bg-[#38B2AC] hover:bg-[#319795] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {copiedItems['full-with-checks'] ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Full Prompt + Checks</>}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── FINAL ACTION BAR ─── */}
            {stepsRevealed >= 4 && result && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 animate-fade-in-up">
                <button onClick={handleStartOver}
                  className="px-6 py-2.5 rounded-full text-[14px] font-semibold border border-[#1A202C] text-[#1A202C] hover:bg-[#F7FAFC] transition-colors">
                  Start Over
                </button>
                <a href="#home" className="text-[14px] text-[#38B2AC] hover:underline flex items-center gap-1">
                  Explore Level 3: Systemic Integration <ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A202C] text-white text-[14px] px-5 py-2.5 rounded-lg shadow-lg z-50 animate-toast-enter whitespace-nowrap">
          {toastMessage} {'\u2713'}
        </div>
      )}
    </div>
  );
};
