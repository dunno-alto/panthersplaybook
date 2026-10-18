import React from 'react';
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
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#071015] border border-teal-500/40 rounded-2xl w-full max-w-4xl p-6 text-white space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#162A33] pb-4 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">
                3-4 Defense Primer & Sideline Call Sheet
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Base · Shield (5-2) · Vanguard · Shell · Line Slants & Individual Pressures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Sheet
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="space-y-6 text-slate-200">
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
                { num: '01', call: 'Base 3-4 Green', desc: '✊ Fist up palm out · Cover 3 Sky · SS roll to strong curl' },
                { num: '02', call: 'Shield 5-2 Green', desc: '👊 Fist in front palm in · Sam & Rover 2x0 on LOS' },
                { num: '03', call: 'Base 3-4 Blue', desc: 'Cover 2 Zone · Corners squat flat · 2 deep halves' },
                { num: '04', call: 'Shield Slant Rip', desc: 'Sam & Rover 2x0 · DL slants toward TE strong side' },
                { num: '05', call: 'Vanguard Goal Line', desc: 'MLBs @ 2 yds, Safeties @ 5 yds · MLB pick open gap' },
                { num: '06', call: 'Base Black Blue', desc: 'Cover 2 Man · 2 Safeties deep · Underneath trail' },
                { num: '07', call: 'Shield + Sam Edge', desc: '5-2 Front · Individual call: Sam crashes strong edge' },
                { num: '08', call: 'Shield + Rover Fire', desc: '5-2 Front · Individual call: Rover fires blindside' },
                { num: '09', call: 'Base + Mike Dog', desc: '3-4 Base · Individual call: Mike shoots strong A-gap' },
                { num: '10', call: 'Base Pinch Front', desc: 'DL pinch inside · Spills ball to Sam and Rover' },
                { num: '11', call: 'Shell Prevent Sack', desc: 'OLBs @ 4, MLBs @ 6, Safeties @ 12 · DL: Go get a sack!' },
                { num: '12', call: 'Check Smoke (Empty)', desc: 'Auto check vs Empty: Shield 5-2 rush with man-free' },
              ].map((c) => (
                <div key={c.num} className="p-2.5 rounded-lg border border-[#18323F] bg-[#09151D] space-y-1">
                  <div className="flex items-center justify-between text-teal-300 font-bold">
                    <span>#{c.num}</span>
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
      </div>
    </div>
  );
}
