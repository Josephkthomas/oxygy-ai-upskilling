import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, Bot, MessageSquare, Eye, Code, Copy, Check,
  ChevronDown, ChevronUp, Info,
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
  const sectionOrder = ['ROLE', 'CONTEXT', 'TASK', 'OUTPUT FORMAT', 'STEPS', 'QUALITY CHECKS'];
  const parts: React.ReactNode[] = [];

  let remaining = prompt;
  let key = 0;

  // Find all section markers and split the prompt
  const markerRegex = /\[(ROLE|CONTEXT|TASK|OUTPUT FORMAT|STEPS|QUALITY CHECKS)\]/g;
  const matches = [...remaining.matchAll(markerRegex)];

  if (matches.length === 0) {
    return <span>{prompt}</span>;
  }

  // Add text before first marker
  if (matches[0].index! > 0) {
    parts.push(<span key={key++}>{remaining.slice(0, matches[0].index!)}</span>);
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionName = match[1];
    const startIdx = match.index! + match[0].length;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index! : remaining.length;
    const sectionText = remaining.slice(startIdx, endIdx);
    const colors = PROMPT_SECTION_COLORS[sectionName];

    if (colors) {
      parts.push(
        <span key={key++} style={{ backgroundColor: colors.bg, borderRadius: '4px', padding: '2px 0' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              padding: '1px 6px',
              borderRadius: '4px',
              marginRight: '4px',
              backgroundColor: colors.bg,
              color: '#4A5568',
            }}
          >
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

/** Simple JSON syntax highlighter */
function highlightJSON(obj: unknown, indent = 0): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const json = JSON.stringify(obj, null, 2);
  const lines = json.split('\n');
  let key = 0;

  for (const line of lines) {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    // Match JSON keys
    remaining = remaining.replace(/"([^"]+)"(?=\s*:)/g, (match, k) => {
      return `__KEY__${k}__KEY__`;
    });

    // Match JSON string values
    remaining = remaining.replace(/"([^"]*)"/g, (match, v) => {
      return `__STR__${v}__STR__`;
    });

    // Match booleans and numbers
    remaining = remaining.replace(/\b(true|false|null|\d+\.?\d*)\b/g, (match) => {
      return `__NUM__${match}__NUM__`;
    });

    // Now build the parts
    const tokens = remaining.split(/__(?:KEY|STR|NUM)__/);
    const keyMatches = [...line.matchAll(/"([^"]+)"(?=\s*:)/g)].map(m => m[1]);
    const strMatches = [...line.matchAll(/"([^"]*)"(?!\s*:)/g)].map(m => m[1]);
    const numMatches = [...line.matchAll(/\b(true|false|null|\d+\.?\d*)\b/g)].map(m => m[1]);

    let ki = 0, si = 0, ni = 0;
    for (let ti = 0; ti < tokens.length; ti++) {
      const token = tokens[ti];
      if (token !== '') {
        // Check if this gap corresponds to a key, string, or number
        parts.push(<span key={partKey++} style={{ color: '#718096' }}>{token}</span>);
      }
      // Check what comes next in the original line between tokens
      if (ti < tokens.length - 1) {
        // Determine what placeholder was here
        const afterToken = remaining.indexOf(`__KEY__`, remaining.indexOf(token) + token.length);
        const afterStr = remaining.indexOf(`__STR__`, remaining.indexOf(token) + token.length);
        const afterNum = remaining.indexOf(`__NUM__`, remaining.indexOf(token) + token.length);
      }
    }

    // Simpler approach: just color the whole line
    nodes.push(
      <div key={key++} style={{ minHeight: '1.6em' }}>
        {renderJSONLine(line)}
      </div>
    );
  }

  return nodes;
}

function renderJSONLine(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Process the line character by character to colorize
  const regex = /("(?:[^"\\]|\\.)*")(\s*:\s*)?|(\btrue\b|\bfalse\b|\bnull\b|\b\d+\.?\d*\b)|([{}\[\],:])/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(remaining)) !== null) {
    // Add any text before the match (whitespace)
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      if (match[2]) {
        // It's a key (followed by colon)
        parts.push(<span key={key++} style={{ color: '#38B2AC' }}>{match[1]}</span>);
        parts.push(<span key={key++} style={{ color: '#718096' }}>{match[2]}</span>);
      } else {
        // It's a string value
        parts.push(<span key={key++} style={{ color: '#A8F0E0' }}>{match[1]}</span>);
      }
    } else if (match[3]) {
      // Boolean, null, or number
      parts.push(<span key={key++} style={{ color: '#FBE8A6' }}>{match[3]}</span>);
    } else if (match[4]) {
      // Brackets, braces, colons, commas
      parts.push(<span key={key++} style={{ color: '#718096' }}>{match[4]}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < remaining.length) {
    parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}

/* ─── SCORE CIRCLE COMPONENT ─── */

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
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score, animated]);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width="120" height="120" viewBox="0 0 120 120"
        role="img" aria-label={`Agent readiness score: ${score} percent`}
      >
        {/* Track */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        {/* Fill */}
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease-out' }}
        />
        {/* Score text */}
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: '36px', fontWeight: 700, fill: '#1A202C', fontFamily: '"DM Sans", sans-serif' }}
        >
          {displayScore}%
        </text>
      </svg>
      <p className="text-[16px] font-semibold" style={{ color }}>{getVerdictText(score)}</p>
    </div>
  );
}

/* ─── SKELETON LOADERS ─── */

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

  // Refs
  const outputRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stepperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
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
          if (rect.top <= 120) {
            setActiveStep(i);
            return;
          }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 md:px-12">

        {/* ─── BREADCRUMB ─── */}
        <a
          href="#home"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#718096] hover:text-[#38B2AC] transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Level 2
        </a>

        {/* ─── PAGE TITLE ─── */}
        <h1 className="text-[40px] sm:text-[48px] font-bold text-[#1A202C] leading-tight mb-4">
          Design Your{' '}
          <span className="relative inline-block">
            AI Agent
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none" height="8">
              <path d="M0,5 Q50,0 100,5 T200,5" fill="none" stroke="#38B2AC" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* ─── SUBTITLE ─── */}
        <p className="text-[16px] sm:text-[18px] text-[#4A5568] leading-[1.7] max-w-[620px] mb-8">
          A custom AI agent is more than a prompt — it's a reusable tool your whole team
          can rely on. Describe a task below, and we'll help you design every layer:
          from deciding if you need one, to defining its output, writing its instructions,
          and building in the checks that keep humans in control.
        </p>

        {/* ─── INPUT SECTION ─── */}
        <div className="max-w-[720px]">
          <h2 className="text-[14px] font-semibold text-[#1A202C] mb-4">
            Describe the task your agent should handle
          </h2>

          {/* Example pills */}
          <div className="mb-4">
            <span className="text-[13px] text-[#718096] italic block mb-2">Try an example:</span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_AGENTS.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => handleExampleClick(ex)}
                  className="px-3.5 py-1.5 rounded-full text-[13px] border border-[#E2E8F0] bg-[#F7FAFC] text-[#4A5568] hover:border-[#38B2AC] hover:text-[#38B2AC] hover:bg-[#E6FFFA] transition-colors"
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
            value={taskDescription}
            onChange={e => setTaskDescription(e.target.value)}
            placeholder="e.g., Analyze customer feedback surveys and identify the top themes, sentiment patterns, and actionable recommendations..."
            className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3.5 text-[15px] text-[#1A202C] placeholder:text-[#A0AEC0] resize-none focus:outline-none focus:border-[#38B2AC] focus:ring-[3px] focus:ring-[rgba(56,178,172,0.1)] transition-all"
            style={{
              minHeight: '100px',
              maxHeight: '160px',
              backgroundColor: flashTask ? '#E6FFFA' : '#FFFFFF',
              transition: 'background-color 0.3s, border-color 0.2s, box-shadow 0.2s',
            }}
          />

          {/* Input 2: Input Data */}
          <div className="mt-4">
            <label className="text-[13px] font-semibold text-[#1A202C] mb-1.5 flex items-center gap-2">
              What data will this agent work with?
              <span className="text-[11px] font-semibold text-[#38B2AC] bg-[#E6FFFA] rounded-[10px] px-2 py-0.5">
                Recommended
              </span>
            </label>
            <textarea
              value={inputDataDescription}
              onChange={e => setInputDataDescription(e.target.value)}
              placeholder="e.g., Excel files containing survey responses with columns for respondent role, department, rating (1-5), and open-text feedback..."
              className="w-full rounded-xl border border-[#E2E8F0] px-4 py-3.5 text-[15px] text-[#1A202C] placeholder:text-[#A0AEC0] resize-none focus:outline-none focus:border-[#38B2AC] focus:ring-[3px] focus:ring-[rgba(56,178,172,0.1)] transition-all mt-1.5"
              style={{
                minHeight: '72px',
                maxHeight: '120px',
                backgroundColor: flashData ? '#E6FFFA' : '#FFFFFF',
                transition: 'background-color 0.3s, border-color 0.2s, box-shadow 0.2s',
              }}
            />
          </div>

          {/* Educational callout */}
          <div className="mt-3 bg-[#F7FAFC] border border-[#E2E8F0] border-l-[3px] border-l-[#38B2AC] rounded-lg px-4 py-3.5">
            <p className="text-[13px] font-semibold text-[#1A202C] mb-1 flex items-center gap-1.5">
              <Info size={14} className="text-[#38B2AC]" />
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
          <div className="mt-4 flex justify-end">
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
          <div ref={outputRef} className="mt-12">

            {/* Sentinel for sticky detection */}
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
                      {/* Connecting line (before each node except first) */}
                      {idx > 0 && (
                        <div className="flex-1 h-[2px] mx-1" style={{
                          backgroundColor: idx < stepsRevealed ? '#38B2AC' : '#E2E8F0',
                          transition: 'background-color 0.3s',
                        }} />
                      )}

                      {/* Step node */}
                      <button
                        onClick={() => scrollToStep(idx)}
                        className="flex flex-col items-center gap-1.5 shrink-0"
                        style={{ cursor: isCompleted || isActive ? 'pointer' : 'default' }}
                        disabled={isUpcoming}
                      >
                        <div
                          className="flex items-center justify-center rounded-full text-[13px] font-bold transition-all duration-300"
                          style={{
                            width: '32px', height: '32px',
                            backgroundColor: (isCompleted || isActive) ? '#38B2AC' : '#F7FAFC',
                            color: (isCompleted || isActive) ? '#FFFFFF' : '#A0AEC0',
                            border: isUpcoming ? '1px solid #E2E8F0' : 'none',
                          }}
                        >
                          {isCompleted && !isActive ? <Check size={16} /> : idx + 1}
                        </div>
                        <span
                          className="text-center leading-tight max-w-[100px]"
                          style={{
                            fontSize: '12px',
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? '#1A202C' : isCompleted ? '#38B2AC' : '#A0AEC0',
                          }}
                        >
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
              <div
                ref={el => stepRefs.current[0] = el}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 max-w-[720px] animate-fade-in-up mb-8 scroll-mt-24"
              >
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 1</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Should You Build This?</h3>
                <p className="text-[15px] text-[#4A5568] mb-6">
                  Not every task needs a custom agent. Here's our assessment of whether your task is a strong candidate.
                </p>

                {isLoading && !result ? <StepOneSkeleton /> : result && (
                  <>
                    {/* Score Circle */}
                    <div className="mb-8">
                      <ScoreCircle score={result.readiness.overall_score} animated={scoreAnimated} />
                    </div>

                    {/* Criteria Breakdown */}
                    <div className="mb-8">
                      {(Object.entries(result.readiness.criteria) as [string, AgentReadinessCriteria][]).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-4 py-3 border-b border-[#F7FAFC] last:border-b-0">
                          <div className="w-[140px] shrink-0">
                            <p className="text-[14px] font-bold text-[#1A202C]">
                              {CRITERIA_LABELS[key]?.label || key}
                            </p>
                          </div>
                          <p className="flex-1 text-[14px] text-[#4A5568]">{val.assessment}</p>
                          <div className="w-[120px] shrink-0">
                            <div className="h-[6px] rounded-full bg-[#E2E8F0] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${val.score}%`, backgroundColor: '#38B2AC' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* L1 vs L2 Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Level 1 */}
                      <div className="bg-[#F7FAFC] rounded-lg p-4 border border-[#E2E8F0]">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare size={18} className="text-[#A0AEC0]" />
                          <h4 className="text-[14px] font-semibold text-[#1A202C]">Level 1: Ad-Hoc Prompting</h4>
                        </div>
                        <ul className="space-y-2">
                          {result.readiness.level1_points.map((point, i) => (
                            <li key={i} className="text-[13px] text-[#4A5568] leading-[1.6] flex gap-2">
                              <span className="text-[#A0AEC0] shrink-0">&bull;</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Level 2 */}
                      <div
                        className="bg-[#F7FAFC] rounded-lg p-4"
                        style={{
                          border: result.readiness.overall_score >= 50
                            ? '2px solid #38B2AC'
                            : '1px solid #E2E8F0',
                        }}
                      >
                        {result.readiness.overall_score >= 50 && (
                          <span className="inline-block text-[11px] font-semibold text-white bg-[#38B2AC] rounded-[10px] px-2 py-0.5 mb-2">
                            Recommended
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <Bot size={18} className="text-[#38B2AC]" />
                          <h4 className="text-[14px] font-semibold text-[#1A202C]">Level 2: Custom Agent</h4>
                        </div>
                        <ul className="space-y-2">
                          {result.readiness.level2_points.map((point, i) => (
                            <li key={i} className="text-[13px] text-[#4A5568] leading-[1.6] flex gap-2">
                              <span className="text-[#38B2AC] shrink-0">&bull;</span>
                              {point}
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
              <div
                ref={el => stepRefs.current[1] = el}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 max-w-[720px] animate-fade-in-up mb-8 scroll-mt-24"
              >
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 2</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Design Your Output Format</h3>
                <p className="text-[15px] text-[#4A5568] mb-4">
                  A great agent doesn't just give good answers — it gives them in the same structure
                  every time. This is what makes it shareable.
                </p>

                {/* Shareability callout */}
                <div
                  className="rounded-lg p-4 sm:p-5 mb-6"
                  style={{
                    background: 'rgba(195, 208, 245, 0.2)',
                    border: '1px solid #C3D0F5',
                    borderLeft: '4px solid #5B6DC2',
                  }}
                >
                  <p className="text-[14px] font-semibold text-[#1A202C] mb-1">
                    \uD83D\uDD17 Build once, share across the team
                  </p>
                  <p className="text-[13px] text-[#4A5568] leading-[1.6]">
                    The power of a Level 2 agent isn't just that it works for you —
                    it's that it works the same way for everyone on your team.
                    Standardized output formats mean no one has to guess what the
                    agent will produce.
                  </p>
                </div>

                {isLoading && !result ? <StepTwoSkeleton /> : result && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Human View */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Eye size={16} className="text-[#718096]" />
                        <span className="text-[13px] font-semibold text-[#1A202C]">What your team sees</span>
                      </div>
                      <div
                        className="bg-white border border-[#E2E8F0] rounded-[10px] p-5 overflow-y-auto"
                        style={{ maxHeight: '400px' }}
                      >
                        {result.output_format.human_readable.split('\n').map((line, i) => {
                          if (!line.trim()) return <div key={i} className="h-3" />;
                          // Simple heading detection
                          if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ') || /^[A-Z][A-Z\s&:]+$/.test(line.trim())) {
                            return (
                              <p key={i} className="text-[14px] font-semibold text-[#1A202C] mt-3 first:mt-0 mb-1">
                                {line.replace(/^#+\s*/, '')}
                              </p>
                            );
                          }
                          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                            return (
                              <p key={i} className="text-[13px] text-[#4A5568] leading-[1.6] pl-4">
                                &bull; {line.replace(/^\s*[-•]\s*/, '')}
                              </p>
                            );
                          }
                          return (
                            <p key={i} className="text-[13px] text-[#4A5568] leading-[1.6]">
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    </div>

                    {/* Code View */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Code size={16} className="text-[#718096]" />
                        <span className="text-[13px] font-semibold text-[#1A202C]">The JSON template</span>
                        <button
                          onClick={e => { e.stopPropagation(); setShowJsonTooltip(!showJsonTooltip); }}
                          className="text-[11px] font-semibold text-[#718096] hover:text-[#38B2AC] bg-[#F7FAFC] border border-[#E2E8F0] rounded px-1.5 py-0.5 transition-colors"
                        >
                          Why JSON?
                        </button>
                      </div>

                      {/* JSON tooltip */}
                      {showJsonTooltip && (
                        <div
                          className="absolute z-40 bg-[#1A202C] text-white rounded-lg p-4 sm:p-5 max-w-[320px] animate-fade-in"
                          style={{ marginTop: '-4px' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <p className="text-[13px] leading-[1.6] whitespace-pre-line">{WHY_JSON_CONTENT}</p>
                        </div>
                      )}

                      <div
                        className="relative bg-[#1A202C] rounded-[10px] p-5 overflow-y-auto"
                        style={{ maxHeight: '400px', fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace' }}
                      >
                        {/* Copy JSON button */}
                        <button
                          onClick={() => copyToClipboard(
                            JSON.stringify(result.output_format.json_template, null, 2),
                            'JSON template copied to clipboard',
                            'json'
                          )}
                          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] text-white transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                          }}
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
              <div
                ref={el => stepRefs.current[2] = el}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 max-w-[720px] animate-fade-in-up mb-8 scroll-mt-24"
              >
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 3</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Your Agent Prompt</h3>
                <p className="text-[15px] text-[#4A5568] mb-3">
                  This system prompt incorporates everything: the role, context, task definition,
                  output format, and quality guidelines. Copy it directly into your Custom GPT, Claude Project, or Copilot Agent.
                </p>

                {/* Level 1 cross-reference */}
                <p className="text-[13px] text-[#718096] mb-5">
                  \uD83D\uDD17 This prompt follows the Prompt Blueprint framework from Level 1.{' '}
                  <a href="#playground" className="text-[#38B2AC] hover:underline inline-flex items-center gap-1">
                    Visit the Prompt Engineering Playground <ArrowRight size={12} />
                  </a>
                </p>

                {isLoading && !result ? <StepThreeSkeleton /> : result && (
                  <div className="bg-[#F7FAFC] border border-[#E2E8F0] rounded-[10px] p-5">
                    {/* Collapsed / Action row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[14px] text-[#1A202C] font-medium">
                        <span>\uD83D\uDCCB</span> Your system prompt is ready
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyToClipboard(result.system_prompt, 'System prompt copied to clipboard', 'system-prompt')}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold text-white bg-[#38B2AC] hover:bg-[#319795] transition-colors"
                        >
                          {copiedItems['system-prompt'] ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy System Prompt</>}
                        </button>
                        <button
                          onClick={() => setPromptExpanded(!promptExpanded)}
                          className="flex items-center gap-1 text-[14px] text-[#718096] hover:text-[#38B2AC] transition-colors"
                          aria-expanded={promptExpanded}
                        >
                          {promptExpanded ? (
                            <><ChevronUp size={16} /> Hide Full Prompt</>
                          ) : (
                            <><ChevronDown size={16} /> View Full Prompt</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded prompt */}
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: promptExpanded ? '500px' : '0' }}
                    >
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

            {/* ─── STEP 4: Accountability ─── */}
            {(stepsRevealed >= 4 || (isLoading && stepsRevealed >= 3)) && (
              <div
                ref={el => stepRefs.current[3] = el}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 max-w-[720px] animate-fade-in-up mb-8 scroll-mt-24"
              >
                <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wider mb-1">Step 4</p>
                <h3 className="text-[24px] font-bold text-[#1A202C] mb-2">Human-in-the-Loop Checks</h3>
                <p className="text-[15px] text-[#4A5568] mb-6">
                  AI agents are powerful, but they need guardrails. These checks ensure that
                  every output can be verified, traced back to its source, and validated by
                  a human before it's acted on.
                </p>

                {isLoading && !result ? <StepFourSkeleton /> : result && (
                  <div className="space-y-3">
                    {result.accountability.map((check, idx) => {
                      const severity = getSeverityStyle(check.severity);
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-[#E2E8F0] rounded-lg p-4 sm:p-5 relative"
                          style={{ borderLeft: '4px solid #38B2AC' }}
                        >
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h4 className="text-[16px] font-bold text-[#1A202C]">{check.name}</h4>
                            <span
                              className="text-[11px] font-semibold rounded-[10px] px-2 py-0.5 shrink-0 capitalize"
                              style={{
                                backgroundColor: severity.bg,
                                color: severity.color,
                                border: `1px solid ${severity.border}`,
                              }}
                            >
                              {check.severity}
                            </span>
                          </div>

                          {/* What to verify */}
                          <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wide mt-3 mb-1">
                            What to verify
                          </p>
                          <p className="text-[14px] text-[#4A5568] leading-[1.6]">{check.what_to_verify}</p>

                          {/* Why it matters */}
                          <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wide mt-3 mb-1">
                            Why this matters
                          </p>
                          <p className="text-[14px] text-[#4A5568] leading-[1.6]">{check.why_it_matters}</p>

                          {/* Prompt instruction */}
                          <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-wide mt-3 mb-1">
                            Add this to your prompt
                          </p>
                          <div className="relative bg-[#F7FAFC] border border-[#E2E8F0] rounded-md px-3.5 py-2.5">
                            <p
                              className="text-[13px] text-[#2D3748] leading-[1.6] pr-12"
                              style={{ fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace' }}
                            >
                              {check.prompt_instruction}
                            </p>
                            <button
                              onClick={() => copyToClipboard(check.prompt_instruction, `"${check.name}" instruction copied`, `check-${idx}`)}
                              className="absolute top-2 right-2 text-[12px] text-[#38B2AC] hover:underline"
                            >
                              {copiedItems[`check-${idx}`] ? 'Copied \u2713' : 'Copy'}
                            </button>
                          </div>

                          {/* Already included indicator */}
                          <div className="flex items-center gap-1.5 mt-3">
                            <Check size={14} className="text-[#38B2AC]" />
                            <span className="text-[12px] text-[#38B2AC]">Included in your agent prompt (Step 3)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── FINAL ACTION BAR ─── */}
            {stepsRevealed >= 4 && result && (
              <div className="flex flex-col sm:flex-row items-center justify-between max-w-[720px] gap-3 mt-8 animate-fade-in-up">
                <button
                  onClick={handleStartOver}
                  className="px-6 py-2.5 rounded-full text-[14px] font-semibold border border-[#1A202C] text-[#1A202C] hover:bg-[#F7FAFC] transition-colors"
                >
                  Start Over
                </button>
                <a
                  href="#home"
                  className="text-[14px] text-[#38B2AC] hover:underline flex items-center gap-1"
                >
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
          {toastMessage} \u2713
        </div>
      )}
    </div>
  );
};
