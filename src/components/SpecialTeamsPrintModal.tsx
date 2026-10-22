import React, { useEffect } from 'react';
import { X, Printer, Compass } from 'lucide-react';
import { SPECIAL_TEAMS_PLAYBOOK, SpecialTeamsUnitId } from '../data/specialTeamsData';

interface SpecialTeamsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpecialTeamsPrintModal({ isOpen, onClose }: SpecialTeamsPrintModalProps) {
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

  const units = Object.values(SPECIAL_TEAMS_PLAYBOOK);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Special Teams Master Coordinator Call Sheet"
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
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Special Teams Sheet
                </span>
                <span className="text-xs text-slate-400 font-mono hidden md:inline">Press Esc or click outside to exit</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display mt-0.5">
                Special Teams Master Coordinator Call Sheet
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Printable sideline game-day card with Wheel KOR and all 6 special teams units
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-teal-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Print Special Teams Sheet"
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

        {/* Scrollable Printable Grid of All 6 Units */}
        <div className="overflow-y-auto flex-1 pr-1 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200 text-xs">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="p-4 rounded-xl border border-[#18323F] bg-[#09151D] space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-[#162A33] pb-2">
                <span className="font-bold text-teal-300 font-mono text-sm uppercase">
                  {unit.shortName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{unit.targetTempo}</span>
              </div>

              <div className="text-[11px] text-slate-300 italic font-serif">
                {unit.coachingMotto}
              </div>

              {/* Calls / Scheme Variations */}
              <div className="p-2 rounded bg-[#060D11] border border-[#162A33] space-y-1">
                <span className="text-[10px] uppercase font-mono text-teal-400 font-semibold block">
                  Sideline Scheme Calls:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {unit.schemeOptions.map((sch) => (
                    <span
                      key={sch.id}
                      className="px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/40 text-[10px] font-mono text-teal-200"
                    >
                      {sch.label.split('(')[0].trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Personnel */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold block">
                  Key Players & Roles:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {unit.players.slice(0, 6).map((p) => (
                    <div key={p.id} className="truncate text-slate-300">
                      <strong className="text-teal-400 font-mono">{p.label}:</strong> {p.name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Execution Rule */}
              <div className="p-2 rounded bg-[#060D11] border border-[#162A33] text-[10px] text-slate-300">
                <strong className="text-teal-300 font-mono block">Rule: {unit.rulesAndDrills[0]?.title}</strong>
                {unit.rulesAndDrills[0]?.rule}
              </div>
            </div>
          ))}
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
              <span>Exit / Return to Special Teams</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
