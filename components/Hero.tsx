import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { innerDrivers, outerDrivers } from '../data/drivers';
import type { DriverNode } from '../data/drivers';

// ── Layout & Diagram Constants ───────────────────────────────────────
const CX = 300;
const CY = 300;
const INNER_RADIUS = 140;
const OUTER_RADIUS = 230;
const NODE_SIZE = 36;
const INNER_CIRC = 2 * Math.PI * INNER_RADIUS;
const OUTER_CIRC = 2 * Math.PI * OUTER_RADIUS;

const toRad = (deg: number) => (deg * Math.PI) / 180;

function ringPositions(count: number, radius: number, offsetDeg = 0) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 360) / count - 90 + offsetDeg;
    return {
      x: CX + radius * Math.cos(toRad(angle)),
      y: CY + radius * Math.sin(toRad(angle)),
      angleDeg: angle + 90, // normalized so 0 = top
    };
  });
}

const innerPositions = ringPositions(6, INNER_RADIUS, 0);
const outerPositions = ringPositions(6, OUTER_RADIUS, 30);

// ── Scroll-progress ranges from the PRD ──────────────────────────────
const RANGES = {
  badge: [0, 0.05],
  headline: [0.05, 0.15],
  center: [0.15, 0.25],
  subCta: [0.20, 0.30],
  innerRing: [0.25, 0.45],
  innerNodes: [0.30, 0.50],
  innerLabel: [0.45, 0.50],
  outerRing: [0.50, 0.70],
  outerNodes: [0.55, 0.75],
  outerLabel: [0.70, 0.75],
  lines: [0.75, 0.85],
} as const;

function lerp(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

// ── Tooltip Component ────────────────────────────────────────────────
interface TooltipProps {
  node: DriverNode;
  x: number;
  y: number;
  containerRect: DOMRect | null;
}

const Tooltip: React.FC<TooltipProps> = ({ node, x, y, containerRect }) => {
  if (!containerRect) return null;

  const isRight = x > CX;
  const isBottom = y > CY;

  // Position tooltip adjacent to node, flipping if needed
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 50,
    maxWidth: '260px',
    width: '260px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    pointerEvents: 'none',
    opacity: 1,
    transition: 'opacity 200ms ease, transform 200ms ease',
  };

  // Convert SVG coordinates to percentage-based positioning
  const svgWidth = 600;
  const svgHeight = 600;
  const pctX = (x / svgWidth) * 100;
  const pctY = (y / svgHeight) * 100;

  if (isRight) {
    tooltipStyle.left = `${pctX + 5}%`;
  } else {
    tooltipStyle.right = `${100 - pctX + 5}%`;
  }

  if (isBottom) {
    tooltipStyle.bottom = `${100 - pctY + 3}%`;
  } else {
    tooltipStyle.top = `${pctY + 3}%`;
  }

  const IconComp = node.icon;
  const isInternal = node.ring === 'internal';

  return (
    <div style={tooltipStyle} role="tooltip">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconComp
          size={18}
          color={isInternal ? '#FFFFFF' : '#D4A843'}
          style={
            isInternal
              ? {
                  background: '#38B2AC',
                  borderRadius: '50%',
                  padding: '3px',
                  width: '24px',
                  height: '24px',
                }
              : undefined
          }
        />
        <span
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#1A202C',
          }}
        >
          {node.label}
        </span>
      </div>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 400,
          color: '#4A5568',
          lineHeight: 1.6,
          marginTop: '8px',
          marginBottom: 0,
        }}
      >
        {node.description}
      </p>
      <div style={{ marginTop: '12px' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '10px',
            padding: '3px 10px',
            ...(isInternal
              ? { background: '#E6FFFA', color: '#2C9A94' }
              : {
                  background: '#FFFDF0',
                  color: '#B8962E',
                  border: '1px solid #E8C547',
                }),
          }}
        >
          {isInternal ? 'Internal Driver' : 'External Driver'}
        </span>
      </div>
    </div>
  );
};

// ── Concentric Circles Diagram ───────────────────────────────────────
interface DiagramProps {
  progress: number;
  isMobile: boolean;
  reducedMotion: boolean;
}

const ConcentricCircles: React.FC<DiagramProps> = ({
  progress,
  isMobile,
  reducedMotion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    node: DriverNode;
    x: number;
    y: number;
  } | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [tappedNode, setTappedNode] = useState<string | null>(null);

  // On mobile, use tap instead of hover
  const handleNodeInteraction = useCallback(
    (node: DriverNode, x: number, y: number) => {
      if (isMobile) {
        if (tappedNode === node.label) {
          setTappedNode(null);
          setHoveredNode(null);
        } else {
          setTappedNode(node.label);
          setHoveredNode({ node, x, y });
        }
      }
    },
    [isMobile, tappedNode],
  );

  // Dismiss tooltip on outside tap (mobile)
  useEffect(() => {
    if (!isMobile || !tappedNode) return;
    const handleTap = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-driver-node]')) {
        setTappedNode(null);
        setHoveredNode(null);
      }
    };
    document.addEventListener('click', handleTap);
    return () => document.removeEventListener('click', handleTap);
  }, [isMobile, tappedNode]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateRect = () =>
      setContainerRect(containerRef.current!.getBoundingClientRect());
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  // For mobile/reduced-motion, show everything at final state
  const p = isMobile || reducedMotion ? 1 : progress;

  const centerOpacity = lerp(p, RANGES.center[0], RANGES.center[1]);
  const centerScale = 0.8 + 0.2 * centerOpacity;
  const innerRingProgress = lerp(p, RANGES.innerRing[0], RANGES.innerRing[1]);
  const outerRingProgress = lerp(p, RANGES.outerRing[0], RANGES.outerRing[1]);
  const innerLabelOpacity = lerp(p, RANGES.innerLabel[0], RANGES.innerLabel[1]);
  const outerLabelOpacity = lerp(p, RANGES.outerLabel[0], RANGES.outerLabel[1]);
  const linesOpacity = lerp(p, RANGES.lines[0], RANGES.lines[1]) * 0.5;

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', maxWidth: '500px' }}
    >
      <svg
        viewBox="0 0 600 600"
        role="img"
        aria-label="Interactive diagram showing AI transformation drivers. Inner ring: 6 internal drivers including Growth Mindset, Thinking Beyond, Collaboration, Sharing Learnings, Learning to Learn, and Curiosity. Outer ring: 6 external drivers including Personalized Pathways, Incentive Structures, Training Programs, Change Management, Communication, and Tools & Resources."
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E6FFFA" stopOpacity="1" />
            <stop offset="70%" stopColor="#E6FFFA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E6FFFA" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connecting lines — center to inner nodes */}
        {innerPositions.map((pos, i) => (
          <line
            key={`conn-inner-${i}`}
            x1={CX}
            y1={CY}
            x2={pos.x}
            y2={pos.y}
            stroke="#E2E8F0"
            strokeWidth="1"
            opacity={linesOpacity}
          />
        ))}

        {/* Short outward lines from outer nodes */}
        {outerPositions.map((pos, i) => {
          const angle = toRad(
            (i * 360) / 6 - 90 + 30,
          );
          const endX = pos.x + 15 * Math.cos(angle);
          const endY = pos.y + 15 * Math.sin(angle);
          return (
            <line
              key={`conn-outer-${i}`}
              x1={pos.x}
              y1={pos.y}
              x2={endX}
              y2={endY}
              stroke="#E2E8F0"
              strokeWidth="1"
              opacity={linesOpacity * 0.6}
            />
          );
        })}

        {/* Inner ring fill tint */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_RADIUS}
          fill="rgba(56, 178, 172, 0.04)"
          opacity={innerRingProgress}
        />

        {/* Inner ring stroke (draw-in animation) */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_RADIUS}
          fill="none"
          stroke="#38B2AC"
          strokeWidth="2"
          style={{
            strokeDasharray: INNER_CIRC,
            strokeDashoffset: INNER_CIRC * (1 - innerRingProgress),
            transform: 'rotate(-90deg)',
            transformOrigin: `${CX}px ${CY}px`,
          }}
        />

        {/* Outer ring stroke (draw-in animation) — Oxygy yellow */}
        <circle
          cx={CX}
          cy={CY}
          r={OUTER_RADIUS}
          fill="none"
          stroke="#E8C547"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          style={{
            strokeDasharray: `8 6`,
            strokeDashoffset:
              OUTER_CIRC * (1 - outerRingProgress),
            transform: 'rotate(-90deg)',
            transformOrigin: `${CX}px ${CY}px`,
          }}
        />

        {/* Center glow */}
        <circle
          cx={CX}
          cy={CY}
          r={60}
          fill="url(#center-glow)"
          opacity={centerOpacity}
        />

        {/* Center visual — nested department clusters */}
        <g
          style={{
            opacity: centerOpacity,
            transform: `scale(${centerScale})`,
            transformOrigin: `${CX}px ${CY}px`,
          }}
        >
          {/* Top cluster — 3 people (teal) */}
          {[-12, 0, 12].map((dx, i) => {
            const px = CX + dx;
            const py = CY - 26;
            return (
              <g key={`top-${i}`}>
                <circle cx={px} cy={py - 5} r={4.5} fill="#38B2AC" />
                <path
                  d={`M${px - 6},${py + 7} C${px - 6},${py + 2} ${px - 3},${py} ${px},${py} C${px + 3},${py} ${px + 6},${py + 2} ${px + 6},${py + 7} Z`}
                  fill="#38B2AC"
                  opacity="0.85"
                />
              </g>
            );
          })}

          {/* Bottom-left cluster — 2 people (darker teal) */}
          {[-6, 6].map((dx, i) => {
            const px = CX - 24 + dx;
            const py = CY + 16;
            return (
              <g key={`bl-${i}`}>
                <circle cx={px} cy={py - 5} r={4.5} fill="#2C9A94" />
                <path
                  d={`M${px - 6},${py + 7} C${px - 6},${py + 2} ${px - 3},${py} ${px},${py} C${px + 3},${py} ${px + 6},${py + 2} ${px + 6},${py + 7} Z`}
                  fill="#2C9A94"
                  opacity="0.85"
                />
              </g>
            );
          })}

          {/* Bottom-right cluster — 2 people (lighter teal) */}
          {[-6, 6].map((dx, i) => {
            const px = CX + 24 + dx;
            const py = CY + 16;
            return (
              <g key={`br-${i}`}>
                <circle cx={px} cy={py - 5} r={4.5} fill="#4FD1C5" />
                <path
                  d={`M${px - 6},${py + 7} C${px - 6},${py + 2} ${px - 3},${py} ${px},${py} C${px + 3},${py} ${px + 6},${py + 2} ${px + 6},${py + 7} Z`}
                  fill="#4FD1C5"
                  opacity="0.85"
                />
              </g>
            );
          })}
        </g>

        {/* "Your Organization" label */}
        <text
          x={CX}
          y={CY + 42}
          textAnchor="middle"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            fill: '#2C9A94',
            opacity: centerOpacity,
          }}
        >
          Your Organization
        </text>

        {/* Inner ring nodes */}
        {innerPositions.map((pos, i) => {
          const nodeProgress = lerp(
            p,
            RANGES.innerNodes[0] + (i * 0.033),
            RANGES.innerNodes[0] + (i * 0.033) + 0.04,
          );
          const scale = nodeProgress;
          const driver = innerDrivers[i];
          const IconComp = driver.icon;
          const isHovered = hoveredNode?.node.label === driver.label;

          return (
            <g
              key={`inner-${i}`}
              data-driver-node
              tabIndex={0}
              role="button"
              aria-label={`${driver.label}: ${driver.description}`}
              style={{
                cursor: 'pointer',
                transform: `scale(${scale})`,
                transformOrigin: `${pos.x}px ${pos.y}px`,
                outline: 'none',
              }}
              onMouseEnter={() => {
                if (!isMobile)
                  setHoveredNode({ node: driver, x: pos.x, y: pos.y });
              }}
              onMouseLeave={() => {
                if (!isMobile) setHoveredNode(null);
              }}
              onFocus={() =>
                setHoveredNode({ node: driver, x: pos.x, y: pos.y })
              }
              onBlur={() => setHoveredNode(null)}
              onClick={() => handleNodeInteraction(driver, pos.x, pos.y)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setHoveredNode(null);
              }}
            >
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_SIZE / 2}
                fill={isHovered ? '#4FD1C5' : '#38B2AC'}
                style={{
                  transition: 'fill 200ms ease, r 200ms ease',
                  filter: isHovered
                    ? 'drop-shadow(0 0 4px rgba(56,178,172,0.3))'
                    : 'none',
                }}
              />
              {/* Icon — rendered as foreignObject for Lucide compatibility */}
              <foreignObject
                x={pos.x - 9}
                y={pos.y - 9}
                width="18"
                height="18"
                style={{ pointerEvents: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                  }}
                >
                  <IconComp size={14} color="#FFFFFF" strokeWidth={2.5} />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Outer ring nodes */}
        {outerPositions.map((pos, i) => {
          const nodeProgress = lerp(
            p,
            RANGES.outerNodes[0] + (i * 0.033),
            RANGES.outerNodes[0] + (i * 0.033) + 0.04,
          );
          const scale = nodeProgress;
          const driver = outerDrivers[i];
          const IconComp = driver.icon;
          const isHovered = hoveredNode?.node.label === driver.label;

          return (
            <g
              key={`outer-${i}`}
              data-driver-node
              tabIndex={0}
              role="button"
              aria-label={`${driver.label}: ${driver.description}`}
              style={{
                cursor: 'pointer',
                transform: `scale(${scale})`,
                transformOrigin: `${pos.x}px ${pos.y}px`,
                outline: 'none',
              }}
              onMouseEnter={() => {
                if (!isMobile)
                  setHoveredNode({ node: driver, x: pos.x, y: pos.y });
              }}
              onMouseLeave={() => {
                if (!isMobile) setHoveredNode(null);
              }}
              onFocus={() =>
                setHoveredNode({ node: driver, x: pos.x, y: pos.y })
              }
              onBlur={() => setHoveredNode(null)}
              onClick={() => handleNodeInteraction(driver, pos.x, pos.y)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setHoveredNode(null);
              }}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_SIZE / 2}
                fill={isHovered ? '#FFF8E1' : '#FFFFFF'}
                stroke="#D4A843"
                strokeWidth={isHovered ? 3 : 2}
                style={{
                  transition:
                    'fill 200ms ease, stroke-width 200ms ease',
                  filter: isHovered
                    ? 'drop-shadow(0 0 4px rgba(212,168,67,0.25))'
                    : 'none',
                }}
              />
              <foreignObject
                x={pos.x - 9}
                y={pos.y - 9}
                width="18"
                height="18"
                style={{ pointerEvents: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                  }}
                >
                  <IconComp size={14} color="#D4A843" strokeWidth={2.5} />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Ring labels (HTML overlays) */}
      {/* "What You Bring" — inner ring label, top-left area */}
      <div
        style={{
          position: 'absolute',
          top: '4%',
          left: '12%',
          opacity: innerLabelOpacity,
          transition: reducedMotion ? 'none' : undefined,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#38B2AC',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: '#E6FFFA',
            border: '1px solid #38B2AC',
            borderRadius: '12px',
            padding: '4px 10px',
            whiteSpace: 'nowrap',
          }}
        >
          What Your People Bring
        </span>
      </div>

      {/* "What We Provide" — outer ring label, bottom-right area */}
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '2%',
          opacity: outerLabelOpacity,
          transition: reducedMotion ? 'none' : undefined,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 600,
            color: '#B8962E',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: '#FFFDF0',
            border: '1px solid #E8C547',
            borderRadius: '12px',
            padding: '4px 10px',
            whiteSpace: 'nowrap',
          }}
        >
          What We Provide
        </span>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <Tooltip
          node={hoveredNode.node}
          x={hoveredNode.x}
          y={hoveredNode.y}
          containerRect={containerRect}
        />
      )}
    </div>
  );
};

// ── Hero Component ───────────────────────────────────────────────────
export const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  // Detect reduced motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Track mobile breakpoint
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll handler
  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    const handleScroll = () => {
      rafRef.current = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const scrollableHeight = section.offsetHeight - window.innerHeight;
        if (scrollableHeight <= 0) return;
        const raw = -rect.top / scrollableHeight;
        setScrollProgress(Math.max(0, Math.min(1, raw)));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, prefersReducedMotion]);

  const noAnim = isMobile || prefersReducedMotion;
  const p = noAnim ? 1 : scrollProgress;

  // Text element visibility based on scroll
  const badgeOpacity = lerp(p, RANGES.badge[0], RANGES.badge[1]);
  const headlineOpacity = lerp(p, RANGES.headline[0], RANGES.headline[1]);
  const headlineY = 20 * (1 - headlineOpacity);
  const subCtaOpacity = lerp(p, RANGES.subCta[0], RANGES.subCta[1]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        background: '#F7FAFC',
        height: noAnim ? 'auto' : undefined,
      }}
    >
      {/* Scroll runway height (desktop only) */}
      {!noAnim && (
        <style>{`
          #hero { height: 200vh; }
          @media (min-width: 768px) and (max-width: 1199px) {
            #hero { height: 180vh; }
          }
        `}</style>
      )}

      {/* Sticky / static viewport */}
      <div
        className={noAnim ? '' : 'sticky top-0'}
        style={{
          height: noAnim ? 'auto' : '100vh',
          minHeight: noAnim ? '100vh' : undefined,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="flex flex-col md:flex-row items-center"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            padding: isMobile ? '100px 24px 48px' : '0 48px',
          }}
        >
          {/* Left column — Text (~42%) */}
          <div
            style={{
              width: isMobile ? '100%' : '42%',
              flexShrink: 0,
              paddingRight: isMobile ? 0 : '32px',
            }}
          >
            {/* Badge */}
            <div style={{ opacity: badgeOpacity }}>
              <span
                className="inline-block uppercase tracking-widest"
                style={{
                  border: '1px solid #38B2AC',
                  color: '#38B2AC',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                }}
              >
                AI CENTER OF EXCELLENCE
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: isMobile ? '36px' : 'clamp(42px, 4vw, 52px)',
                fontWeight: 800,
                color: '#1A202C',
                lineHeight: 1.15,
                marginTop: '20px',
                maxWidth: '520px',
                opacity: headlineOpacity,
                transform: noAnim
                  ? undefined
                  : `translateY(${headlineY}px)`,
              }}
            >
              Your AI Transformation
              <br />
              Starts With
              <br />
              <span className="relative inline-block">
                Your People
                <span
                  className="absolute left-0 w-full"
                  style={{
                    bottom: '-4px',
                    height: '3px',
                    background: '#38B2AC',
                    borderRadius: '2px',
                  }}
                />
              </span>
              .
            </h1>

            {/* Subheading */}
            <p
              style={{
                fontSize: isMobile ? '15px' : '17px',
                fontWeight: 400,
                color: '#4A5568',
                lineHeight: 1.7,
                marginTop: '24px',
                maxWidth: '480px',
                opacity: subCtaOpacity,
              }}
            >
              There is no one-size-fits-all model for AI adoption. It starts
              with your people discovering what works best for them — then
              aggregating those learnings into the processes, frameworks,
              and operating models that transform your entire organization.
            </p>

            {/* CTAs */}
            <div
              className={
                isMobile
                  ? 'flex flex-col gap-3 w-full'
                  : 'flex flex-row gap-4'
              }
              style={{ marginTop: '32px', opacity: subCtaOpacity }}
            >
              <a
                href="#journey"
                className="inline-flex items-center justify-center gap-2 transition-colors"
                style={{
                  background: '#38B2AC',
                  color: '#FFFFFF',
                  borderRadius: '28px',
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#2C9A94')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = '#38B2AC')
                }
              >
                Start the Journey <ChevronRight size={16} />
              </a>
              <a
                href="#framework"
                className="inline-flex items-center justify-center transition-colors"
                style={{
                  background: 'transparent',
                  border: '1px solid #1A202C',
                  color: '#1A202C',
                  borderRadius: '28px',
                  padding: '14px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1A202C';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#1A202C';
                }}
              >
                Explore the Framework
              </a>
            </div>
          </div>

          {/* Right column — Diagram (~58%) */}
          <div
            style={{
              width: isMobile ? '100%' : '58%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: isMobile ? '40px' : 0,
              maxWidth: isMobile ? '360px' : undefined,
              marginLeft: isMobile ? 'auto' : undefined,
              marginRight: isMobile ? 'auto' : undefined,
            }}
          >
            <ConcentricCircles
              progress={scrollProgress}
              isMobile={isMobile}
              reducedMotion={prefersReducedMotion}
            />
          </div>
        </div>

        {/* Scroll-down indicator — centered at bottom of viewport */}
        {!noAnim && (
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              opacity: scrollProgress < 0.1 ? 1 - scrollProgress * 10 : 0,
              transition: 'opacity 300ms ease',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#A0AEC0',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Scroll to explore
            </span>
            <div className="animate-bounce" style={{ color: '#A0AEC0' }}>
              <ChevronDown size={22} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
