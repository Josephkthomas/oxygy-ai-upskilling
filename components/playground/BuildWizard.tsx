import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Mic, MicOff, Zap } from 'lucide-react';
import { WIZARD_STEPS, EXAMPLE_SCENARIOS, PROMPT_BLUEPRINT } from '../../data/playground-content';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import type { WizardAnswers } from '../../types';

interface BuildWizardProps {
  onGenerate: (answers: WizardAnswers) => void;
  isLoading: boolean;
}

const INITIAL_ANSWERS: WizardAnswers = {
  role: '',
  context: '',
  task: '',
  formatChips: [],
  formatCustom: '',
  steps: '',
  qualityChips: [],
  qualityCustom: '',
};

// Fixed height for all question content areas to ensure consistency
const QUESTION_CONTENT_HEIGHT = '180px';

export const BuildWizard: React.FC<BuildWizardProps> = ({ onGenerate, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0=intro, 1-6=questions, 7=confirmation
  const [answers, setAnswers] = useState<WizardAnswers>({ ...INITIAL_ANSWERS });
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition();

  // Focus textarea when step changes
  useEffect(() => {
    if (currentStep >= 1 && currentStep <= 6) {
      setTimeout(() => textareaRef.current?.focus(), 350);
    }
  }, [currentStep]);

  // Show celebration when reaching confirmation step
  useEffect(() => {
    if (currentStep === 7) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Progress: 0 for intro, then 1-6 mapped to percentage, 7 = 100%
  const progressPercent = currentStep === 0 ? 0 : currentStep === 7 ? 100 : Math.round((currentStep / 6) * 100);

  const animateTransition = (newStep: number, dir: 'forward' | 'back') => {
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsAnimating(false);
    }, 250);
  };

  const goNext = () => {
    if (currentStep < 7) animateTransition(currentStep + 1, 'forward');
  };

  const goBack = () => {
    if (currentStep > 0) animateTransition(currentStep - 1, 'back');
  };

  const goSkip = () => {
    goNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      goNext();
    }
    if (e.key === 'Escape') {
      goSkip();
    }
  };

  const updateTextAnswer = (field: 'role' | 'context' | 'task' | 'steps', value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const toggleChip = (field: 'formatChips' | 'qualityChips', chip: string) => {
    setAnswers((prev) => {
      const current = prev[field];
      const next = current.includes(chip) ? current.filter((c) => c !== chip) : [...current, chip];
      return { ...prev, [field]: next };
    });
  };

  const updateCustomText = (field: 'formatCustom' | 'qualityCustom', value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleMicToggle = useCallback((field: string) => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text: string) => {
        setAnswers((prev) => {
          const current = (prev as any)[field] || '';
          return { ...prev, [field]: current + (current ? ' ' : '') + text };
        });
      });
    }
  }, [isListening, startListening, stopListening]);

  const handleExampleSelect = (example: typeof EXAMPLE_SCENARIOS[0]) => {
    const filled: WizardAnswers = {
      role: example.role,
      context: example.context,
      task: example.task,
      formatChips: example.formatChips,
      formatCustom: example.formatCustom,
      steps: example.steps,
      qualityChips: example.qualityChips,
      qualityCustom: example.qualityCustom,
    };
    setAnswers(filled);
    setShowExamples(false);
    onGenerate(filled);
  };

  const getTextValue = (step: number): string => {
    if (step < 1 || step > 6) return '';
    const def = WIZARD_STEPS[step - 1];
    if (def.type === 'textarea') {
      return (answers as any)[def.field] || '';
    }
    return '';
  };

  const getAnsweredSteps = () => {
    return WIZARD_STEPS.map((step) => {
      if (step.type === 'chips') {
        const chipsField = step.field === 'format' ? 'formatChips' : 'qualityChips';
        const customField = step.field === 'format' ? 'formatCustom' : 'qualityCustom';
        return (answers[chipsField] as string[]).length > 0 || (answers[customField] as string).length > 0;
      }
      return ((answers as any)[step.field] || '').trim().length > 0;
    });
  };

  const slideClass = isAnimating
    ? direction === 'forward'
      ? 'translate-x-[-30px] opacity-0'
      : 'translate-x-[30px] opacity-0'
    : 'translate-x-0 opacity-100';

  return (
    <div className="max-w-[720px] mx-auto bg-[#FFFBEB] rounded-2xl px-6 md:px-10 py-8 border border-[#FBE8A6]">
      {/* ─── PROGRESS BAR ─── */}
      <div className="mb-8">
        {/* Label row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-[#1A202C] flex items-center gap-1.5">
            <Zap size={14} className="text-[#D4A017]" />
            {currentStep === 0
              ? 'Ready to start'
              : currentStep === 7
                ? 'All questions complete!'
                : `Question ${currentStep} of 6`
            }
          </span>
          <span className="text-[13px] font-bold text-[#92700C]">{progressPercent}%</span>
        </div>
        {/* Bar + Dots aligned container */}
        <div className="relative">
          {/* Bar */}
          <div
            className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden relative"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Background grid lines for "tank" effect */}
            <div className="absolute inset-0 flex">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-full border-r border-white/30"
                  style={{ width: `${100 / 12}%` }}
                />
              ))}
            </div>
            {/* Fill */}
            <div
              className="h-full rounded-full transition-all duration-500 ease-out progress-bar-fill-yellow relative"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Bubble/cap at the leading edge */}
              {progressPercent > 0 && progressPercent < 100 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/40 border-2 border-white" />
              )}
            </div>
          </div>
          {/* Step dots — positioned to align exactly with bar edges */}
          <div className="flex justify-between mt-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: i <= currentStep ? '#D4A017' : '#E2E8F0',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── STEP CONTENT ─── */}
      <div className={`transition-all duration-300 ease-in-out ${slideClass}`}>
        {/* Step 0 — Intro */}
        {currentStep === 0 && (
          <div className="text-center py-8">
            <h2 className="text-[28px] font-bold text-[#1A202C] mb-4">
              Let's build your prompt, step by step
            </h2>
            <p className="text-[16px] text-[#4A5568] mb-6 max-w-lg mx-auto leading-relaxed">
              Answer a few quick questions and we'll assemble a structured, optimized prompt for you. Skip any question that doesn't apply.
            </p>

            <div className="relative inline-block mb-8">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="text-[14px] text-[#92700C] hover:underline flex items-center gap-1"
              >
                Or try a pre-built example <ArrowRight size={14} />
              </button>

              {showExamples && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-3 w-72 z-10">
                  {EXAMPLE_SCENARIOS.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleSelect(example)}
                      className="w-full text-left px-4 py-3 rounded-lg text-[14px] text-[#2D3748] hover:bg-[#FFFBEB] transition-colors"
                    >
                      {example.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={goNext}
                className="px-7 py-3 bg-[#D4A017] text-white text-[15px] font-semibold rounded-full hover:bg-[#B8900F] transition-colors inline-flex items-center gap-2"
              >
                Let's Go <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Steps 1-6 — Questions */}
        {currentStep >= 1 && currentStep <= 6 && (() => {
          const stepDef = WIZARD_STEPS[currentStep - 1];
          const blueprintBlock = PROMPT_BLUEPRINT[currentStep - 1];

          return (
            <div className="py-4" onKeyDown={handleKeyDown}>
              {/* Step indicator with emoji */}
              <div className="flex items-center gap-2.5 mb-6">
                <span className="text-lg">{blueprintBlock.icon}</span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1A202C]"
                  style={{ backgroundColor: blueprintBlock.color }}
                >
                  {blueprintBlock.label}
                </span>
                <span className="text-[12px] text-[#A0AEC0]">
                  — Question {currentStep} of 6
                </span>
              </div>

              <h3 className="text-[22px] md:text-[24px] font-bold text-[#1A202C] mb-2">
                {stepDef.question}
              </h3>
              <p className="text-[14px] text-[#718096] mb-6">{stepDef.helper}</p>

              {/* Consistent-height content area */}
              <div style={{ minHeight: QUESTION_CONTENT_HEIGHT }}>
                {stepDef.type === 'textarea' && (
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={getTextValue(currentStep)}
                      onChange={(e) => updateTextAnswer(stepDef.field as any, e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={stepDef.placeholder}
                      className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-[15px] text-[#1A202C] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#D4A017] focus:ring-[3px] focus:ring-[#D4A0171a] transition-colors resize-none bg-white"
                      style={{ height: QUESTION_CONTENT_HEIGHT }}
                    />
                    {isSupported && (
                      <button
                        onClick={() => handleMicToggle(stepDef.field)}
                        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border transition-all"
                        style={
                          isListening
                            ? { backgroundColor: '#D4A017', borderColor: '#D4A017', animation: 'pulse-mic 1s infinite' }
                            : { backgroundColor: '#F7FAFC', borderColor: '#E2E8F0' }
                        }
                      >
                        {isListening ? (
                          <MicOff size={16} className="text-white" />
                        ) : (
                          <Mic size={16} className="text-[#718096]" />
                        )}
                      </button>
                    )}
                    {isListening && (
                      <span className="text-[12px] text-[#92700C] mt-1 block">Listening...</span>
                    )}
                  </div>
                )}

                {stepDef.type === 'chips' && (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {stepDef.chips!.map((chip) => {
                        const chipsField = stepDef.field === 'format' ? 'formatChips' : 'qualityChips';
                        const isSelected = (answers[chipsField] as string[]).includes(chip);

                        return (
                          <button
                            key={chip}
                            onClick={() => toggleChip(chipsField, chip)}
                            className="px-3.5 py-1.5 rounded-full text-[13px] border transition-all"
                            style={
                              isSelected
                                ? { backgroundColor: '#FBE8A6', borderColor: '#D4A017', color: '#1A202C', fontWeight: 600 }
                                : { backgroundColor: 'white', borderColor: '#E2E8F0', color: '#4A5568' }
                            }
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={stepDef.field === 'format' ? answers.formatCustom : answers.qualityCustom}
                        onChange={(e) =>
                          updateCustomText(
                            stepDef.field === 'format' ? 'formatCustom' : 'qualityCustom',
                            e.target.value
                          )
                        }
                        onKeyDown={handleKeyDown}
                        placeholder={stepDef.placeholder}
                        className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-[15px] text-[#1A202C] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#D4A017] focus:ring-[3px] focus:ring-[#D4A0171a] transition-colors resize-none bg-white"
                        style={{ height: '80px' }}
                      />
                      {isSupported && (
                        <button
                          onClick={() => handleMicToggle(stepDef.field === 'format' ? 'formatCustom' : 'qualityCustom')}
                          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border transition-all"
                          style={
                            isListening
                              ? { backgroundColor: '#D4A017', borderColor: '#D4A017' }
                              : { backgroundColor: '#F7FAFC', borderColor: '#E2E8F0' }
                          }
                        >
                          {isListening ? (
                            <MicOff size={16} className="text-white" />
                          ) : (
                            <Mic size={16} className="text-[#718096]" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button onClick={goBack} className="text-[#718096] text-[14px] hover:text-[#4A5568] transition-colors flex items-center gap-1">
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={goSkip} className="text-[#A0AEC0] text-[14px] hover:text-[#718096] transition-colors">
                  Skip <ArrowRight size={14} className="inline" />
                </button>
                <button
                  onClick={goNext}
                  className="px-5 py-2 bg-[#D4A017] text-white text-[14px] font-semibold rounded-full hover:bg-[#B8900F] transition-colors flex items-center gap-1.5"
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Step 7 — Confirmation */}
        {currentStep === 7 && (
          <div className="text-center py-8">
            {/* Celebration */}
            {showCelebration && (
              <div className="mb-4 animate-confetti-pop">
                <span className="text-4xl">🎉</span>
              </div>
            )}

            <h2 className="text-[28px] font-bold text-[#1A202C] mb-2">
              {showCelebration ? 'All done!' : 'Ready to generate your prompt'}
            </h2>
            <p className="text-[14px] text-[#718096] mb-6">
              {showCelebration
                ? "Great job! Here's a summary of what you answered."
                : 'Review your answers and generate your structured prompt.'
              }
            </p>

            {/* Answered/skipped summary with emojis */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {getAnsweredSteps().map((answered, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className="w-8 h-8 rounded-full inline-flex items-center justify-center border-2 transition-all duration-300 text-sm"
                    style={
                      answered
                        ? { backgroundColor: PROMPT_BLUEPRINT[i].color, borderColor: PROMPT_BLUEPRINT[i].color }
                        : { backgroundColor: 'transparent', borderColor: '#E2E8F0' }
                    }
                  >
                    {answered ? PROMPT_BLUEPRINT[i].icon : ''}
                  </span>
                  <span className="text-[10px] text-[#A0AEC0]">{PROMPT_BLUEPRINT[i].label.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button onClick={goBack} className="text-[#718096] text-[14px] hover:text-[#4A5568] transition-colors flex items-center gap-1">
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={() => onGenerate(answers)}
                disabled={isLoading}
                className="px-7 py-3 bg-[#D4A017] text-white text-[15px] font-semibold rounded-full hover:bg-[#B8900F] transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate My Prompt <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
