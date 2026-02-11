import React from 'react';
import { LevelData } from '../types';
import { CheckCircle2, ArrowRight, Video, Users, MousePointerClick } from 'lucide-react';
import { cn } from '../utils/cn';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface Props {
  level: LevelData;
  isLast: boolean;
}

export const LevelDetail: React.FC<Props> = ({ level, isLast }) => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  // Alternate background colors for sections
  const bgClass = level.id % 2 === 0 ? 'bg-slate-50' : 'bg-white';

  return (
    <section 
      id={`level-${level.id}`} 
      ref={ref}
      className={cn("py-24 relative overflow-hidden", bgClass)}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className={cn(
          "mb-16 transition-all duration-700 transform",
          isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <div className="flex items-center gap-4 mb-4">
            <span className={cn(
              "text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider text-navy-900",
              level.accentBg
            )}>
              Level 0{level.id}
            </span>
            <div className="h-[1px] bg-navy-200 flex-grow max-w-[100px]"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
                {level.name}
              </h2>
              <p className="text-xl text-teal font-medium mb-4">
                {level.tagline}
              </p>
              <p className="text-navy-700 text-lg leading-relaxed">
                {level.description}
              </p>
            </div>
            
            {/* Quick Stats Card */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative">
              <div className={cn("absolute top-0 left-0 w-2 h-full rounded-l-2xl", level.accentBg)}></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs uppercase text-gray-400 font-bold mb-2 tracking-wider">Target Audience</h4>
                  <ul className="space-y-1">
                    {level.targetAudience.map((aud, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-navy-900 font-medium">
                        <CheckCircle2 size={14} className="text-teal" /> {aud}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs uppercase text-gray-400 font-bold mb-2 tracking-wider">Key Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {level.keyTools.map((tool, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-navy-800 px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid - Left Bordered Cards Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {level.topics.map((topic, idx) => (
            <div 
              key={topic.id}
              className={cn(
                "bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-500 delay-[100ms] group flex flex-col",
                isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center text-white shrink-0">
                  {topic.icon ? <topic.icon size={20} strokeWidth={1.5} /> : <div className="w-5 h-5" />}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-navy-900 mb-2">{topic.name}</h3>
              <p className="text-sm text-navy-700 mb-6 flex-grow leading-relaxed">
                {topic.description}
              </p>
              
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {topic.toolsAndActivities.slice(0, 2).map((act, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-teal tracking-wide bg-teal-bg/50 px-2 py-1 rounded">
                       {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transition Bridge */}
        {!isLast && (
          <div className="relative max-w-3xl mx-auto text-center py-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gray-200"></div>
            <div className="bg-white border border-gray-200 px-8 py-6 rounded-2xl relative z-10 shadow-sm inline-block">
              <p className="text-navy-700 italic font-medium">
                "{level.transitionBridge}"
              </p>
              <div className="mt-4 flex justify-center">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center animate-bounce", level.accentBg)}>
                  <ArrowRight className="text-navy-900 rotate-90" size={16} />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-gray-200"></div>
          </div>
        )}

      </div>
    </section>
  );
};
