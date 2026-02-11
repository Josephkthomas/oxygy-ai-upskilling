import React, { useState, useEffect } from 'react';
import { Copy, Check, Info, ArrowDown, RotateCcw } from 'lucide-react';
import { PROMPT_BLUEPRINT } from '../../data/playground-content';
import type { PromptResult } from '../../types';

interface PromptOutputProps {
  result: PromptResult;
  originalPrompt?: string; // Only provided in Enhance mode
  mode: 'enhance' | 'build';
  onTryAnother: () => void;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ result, originalPrompt, mode, onTryAnother }) => {
  const [copied, setCopied] = useState(false);
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Staggered block appearance
  useEffect(() => {
    setVisibleBlocks(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 6; i++) {
      timers.push(setTimeout(() => setVisibleBlocks((v) => v + 1), 200 + i * 100));
    }
    return () => timers.forEach(clearTimeout);
  }, [result]);

  const handleCopy = async () => {
    const fullPrompt = PROMPT_BLUEPRINT.map((block) => {
      const key = block.key as keyof PromptResult;
      return result[key];
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(fullPrompt);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = fullPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setShowToast(true);
    setTimeout(() => setCopied(false), 2500);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Divider */}
      <div className="h-px bg-[#E2E8F0] my-12" />

      {/* Before/After — Enhance mode only */}
      {mode === 'enhance' && originalPrompt && (
        <div className="mb-8">
          <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-[0.05em] mb-3">
            Your original prompt
          </p>
          <div className="bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 max-h-20 overflow-hidden relative">
            <p className="text-[14px] text-[#718096] leading-relaxed">{originalPrompt}</p>
          </div>
          <div className="flex items-center justify-center my-4">
            <span className="text-[14px] text-[#A0AEC0] flex items-center gap-1.5">
              Enhanced to <ArrowDown size={14} />
            </span>
          </div>
        </div>
      )}

      {/* Section label */}
      <p className="text-[12px] font-semibold text-[#A0AEC0] uppercase tracking-[0.05em] mb-4">
        {mode === 'enhance' ? 'Your enhanced prompt' : 'Your generated prompt'}
      </p>

      {/* 6 Color-Coded Blocks */}
      <div className="space-y-3">
        {PROMPT_BLUEPRINT.map((block, index) => {
          const key = block.key as keyof PromptResult;
          const content = result[key];
          const isVisible = index < visibleBlocks;

          return (
            <div
              key={block.key}
              className="rounded-[10px] px-5 py-4 transition-all duration-300 hover:shadow-md group"
              style={{
                borderLeft: `4px solid ${block.color}`,
                backgroundColor: `${block.color}26`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Top row: pill badge + info icon */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#1A202C]"
                  style={{ backgroundColor: block.color }}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: block.color }}
                  />
                  {block.label}
                </span>

                {/* Info tooltip */}
                <div className="relative group/tip">
                  <Info
                    size={16}
                    className="text-[#A0AEC0] cursor-help hover:text-[#718096] transition-colors"
                  />
                  <div className="absolute right-0 top-full mt-1 bg-[#1A202C] text-white text-[13px] leading-relaxed px-3 py-2 rounded-md max-w-[240px] opacity-0 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:pointer-events-auto transition-opacity z-20 shadow-lg">
                    {block.description}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-[15px] text-[#2D3748] leading-[1.7]">{content}</p>
            </div>
          );
        })}
      </div>

      {/* Prompt Blueprint Legend */}
      <div className="mt-8 mb-6">
        <p className="text-[13px] font-semibold text-[#1A202C] mb-2">The Prompt Blueprint</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {PROMPT_BLUEPRINT.map((block) => (
            <span key={block.key} className="flex items-center gap-1.5 text-[12px] text-[#718096]">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: block.color }}
              />
              {block.label}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <button
          onClick={onTryAnother}
          className="px-5 py-2.5 text-[14px] border border-[#2D3748] text-[#2D3748] rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Try Another
        </button>
        <button
          onClick={handleCopy}
          className="px-5 py-2.5 text-[14px] font-semibold bg-[#38B2AC] text-white rounded-full hover:bg-[#319795] transition-colors flex items-center justify-center gap-2"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Full Prompt'}
        </button>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A202C] text-white text-[14px] px-5 py-2.5 rounded-lg shadow-lg z-50 animate-fade-in-up">
          Prompt copied to clipboard ✓
        </div>
      )}
    </div>
  );
};
