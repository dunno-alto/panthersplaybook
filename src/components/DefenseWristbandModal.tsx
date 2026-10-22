import React, { useEffect } from 'react';
import { X, Printer, Shield, CheckCircle2 } from 'lucide-react';
import {
  COVERAGE_SCHEMES,
  DEFENSE_PLAYERS,
  FORMATION_INFO,
  LINE_SLANTS,
} from '../data/defensePrimerData';

interface DefenseWristbandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DefenseWristbandModal({ isOpen, onClose }: DefenseWristbandModalProps) {
  // Listen for Escape key and lock background scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="3-4 Defense Primer & Sideline Call Sheet"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative bg-[#071015] border border-teal-500/40 rounded-2xl w-full max-w-4xl p-5 sm:p-6 text-white shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
        {/* Sticky Header with Prominent Exit Buttons */}
        <div className="sticky top-0 z-20 bg-[#071015]/95 backdrop-blur-md pb-4 pt-1 border-b border-[#162A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Defensive Call Sheet
                </span>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">Press Esc or click outside to exit</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display mt-0.5">
                3-4 Defense Primer & Sideline Call Sheet
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Base · Shield (5-2) · Vanguard · Shell · Line Slants & Individual Pressures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-teal-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Print Defensive Call Sheet"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-[#14262F] hover:bg-[#1D3643] border border-[#234252] hover:border-slate-500 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              aria-label="Close modal"
              title="Exit / Close (Esc)"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>Close / Exit</span>
              <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[9px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
                ESC
              </kbd>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Area */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-6 pt-4 text-slate-200">
          {/* Section 1: 4 Core Formations & Hand Signals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                1. Four Core Formations & Hand Signals
              </span>
              <span className="text-[11px] font-mono text-slate-400">Official Primer Architecture</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              {Object.values(FORMATION_INFO).map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-lg border border-[#18323F] bg-[#09151D] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-teal-300 font-bold">
                    <span>{f.name}</span>
                    <span className="text-amber-300 font-sans text-[11px]">{f.handSignal}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {f.summary}
                  </p>
                  <div className="text-[10px] text-slate-400 font-sans border-t border-[#162A33] pt-1">
                    <strong className="text-teal-400">Key Rule:</strong> {f.doctrine}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Wristband Quick-Call Grid (3 x 4) */}
          <div className="pt-2 border-t border-[#162A33]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                2. Defensive Wristband Grid (3 x 4 Dial Matrix)
              </span>
              <span className="text-[11px] font-mono text-slate-400">Fits Standard 3-Window Play Wristband</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {[
                { num: '01', call: 'Base 3-4 Green', desc: '✊ Fist up · 👇 Point ground · Cover 3 Sky · CBs outside lev (7 yds) · SS roll to strong curl' },
                { num: '02', call: 'Shield 5-2 Green', desc: '👊 Fist in front · 👇 Point ground · Sam & Rover 2x0 on LOS' },
                { num: '03', call: 'Base 3-4 Blue', desc: '✊ Fist up · 👆 Point sky · Cover 2 Zone · CBs outside lev (5 yds) & squat flat' },
                { num: '04', call: 'Base 3-4 Black', desc: '✊ Fist up · 👕 Jersey tug · 7 yds off inside lev (🙌 "JAM" = press @ LOS) · Will/Mike share RB' },
                { num: '05', call: 'Vanguard Goal Line', desc: '⚔️ Vanguard · MLBs @ 2 yds, Safeties @ 5 yds · MLB pick open gap' },
                { num: '06', call: 'Base + Slant Call', desc: 'DL slants weak side (no slant strong; default is strong)' },
                { num: '07', call: 'Shield + Sam Blitz', desc: '5-2 Front · Blitz: Sam shoots assigned strong edge gap' },
                { num: '08', call: 'Shield + Rover Blitz', desc: '5-2 Front · Blitz: Rover shoots assigned weak edge gap' },
                { num: '09', call: 'Base + Mike Blitz', desc: '3-4 Base · Blitz: Mike shoots assigned gap based on DL' },
                { num: '10', call: 'Base + Will Blitz', desc: '3-4 Base · Blitz: Will shoots assigned gap based on DL' },
                { num: '11', call: 'Shell Prevent Sack', desc: '🛡️ Shell · OLBs @ 4, MLBs @ 6, Safeties @ 12 · Linemen get a sack!' },
                { num: '12', call: 'Check Reload', desc: 'Auto check vs hurry-up: “RELOAD!” all 11 sprint to alignment' },
              ].map((c) => (
                <div key={c.num} className="p-2.5 rounded-lg border border-[#18323F] bg-[#09151D] space-y-1">
                  <div className="flex items-center justify-between text-teal-300 font-bold">
                    <span>Call {c.num}</span>
                    <span className="text-white font-sans truncate ml-1">{c.call}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans leading-tight">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Defensive Line Techniques & Line Slants */}
          <div className="pt-2 border-t border-[#162A33]">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block mb-2">
              3. Defensive Line: Techniques 1-9 & Slants
            </span>
            <div className="p-3 rounded-lg border border-[#162A33] bg-[#091318] space-y-2 text-xs">
              <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong className="text-amber-300">Technique Counting (Center Out):</strong> 0 = Head up Center · 1 = Shade Center (A) · 2 = Head up Guard · 3 = Outside Guard (B) · 4i = Inside Tackle · 4 = Head up Tackle · 5 = Outside Tackle (C) · 6 = Head up TE · 7 = Inside TE · 9 = Outside TE / 2x0 Edge.
              </div>
              <div className="text-[11px] text-teal-300 font-sans border-t border-[#18323F] pt-1.5">
                <strong className="text-teal-400">Base Gap Rule from Primer:</strong> &ldquo;If you don’t hear a slant call, either pick the gap in front of you or if you’re heads up you will default pick the strong direction gap.&rdquo;
              </div>
            </div>
          </div>

          {/* Section 4: Coverage Shell Codes */}
          <div className="pt-2 border-t border-[#162A33]">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block mb-2">
              4. Coverage Signals & Secondary Calls
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.values(COVERAGE_SCHEMES).map((cov) => (
                <div key={cov.id} className="p-2.5 rounded-lg border border-[#162A33] bg-[#091318] space-y-1">
                  <div className="font-bold flex items-center justify-between" style={{ color: cov.color }}>
                    <span>{cov.codeName}</span>
                    <span className="text-[10px] text-slate-400">{cov.deepCoverage.split('(')[0]}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{cov.philosophy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Position Non-Negotiables */}
          <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-950/20 text-xs space-y-1.5">
            <span className="font-bold text-teal-300 font-mono uppercase tracking-wider block">
              ★ Primer Defensive Non-Negotiables:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li>
                <strong>Sam & Rover (Outside Backers):</strong> In Shield (5-2) and Vanguard, walk up aligned 2x0 at the outside O-lineman at the end of the line of scrimmage. Set a hard edge: nothing gets outside your outside shoulder. In Shell, drop to 4 yards off.
              </li>
              <li>
                <strong>Mike & Will (Middle Backers):</strong> Stacked 4.5 yds in Base and Shield. In Vanguard (Goal Line), walk up to 2 yard depth. Rule: if stacked over one of the linemen, pick the open gap assignment and align over it. In Shell, drop to 6 yards depth.
              </li>
              <li>
                <strong>Safeties (FS & SS):</strong> In Base and Shield, play 10-14 yds. In Vanguard, walk up to 5 yards depth. In Shell, drop to 12 yards deep prevent.
              </li>
              <li>
                <strong>Linemen in Shell:</strong> You should be expecting a pass, which means go get us a sack!
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Exit & Action Bar */}
        <div className="pt-4 mt-3 border-t border-[#162A33] flex flex-wrap items-center justify-between gap-3 no-print">
          <span className="text-xs text-slate-400 font-mono">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Esc</kbd> or click outside to exit
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 rounded-xl hover:bg-teal-300 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-200 bg-[#14262F] hover:bg-[#1D3643] border border-[#234252] hover:border-slate-500 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Exit / Return to Defense</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
