import React, { useEffect } from 'react';
import { Printer, X, ArrowLeft } from 'lucide-react';
import { DEFENSIVE_FRONTS, VEER_PLAYBOOK } from '../data/veerPlaybookData';

interface WristbandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WristbandModal: React.FC<WristbandModalProps> = ({ isOpen, onClose }) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wristband & Sideline Play Call Sheet"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl rounded-2xl border border-teal-500/40 bg-[#0A1318] text-slate-100 p-5 sm:p-6 shadow-2xl my-4 sm:my-8 max-h-[92vh] flex flex-col">
        {/* Sticky Header with Prominent Exit Buttons */}
        <div className="sticky top-0 z-20 bg-[#0A1318]/95 backdrop-blur-md pb-4 pt-1 border-b border-[#162A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Offensive Wristband
              </span>
              <span className="text-xs text-slate-400 font-mono hidden md:inline">Press Esc or click outside to exit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-white mt-1">
              Wristband & Sideline Play Call Sheet — Split Back Veer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              5 Core Plays: 22/31 Veer · 24/33 Veer · 20/30 Trap · 34/23 Power · 36/35 Flood
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-teal-400 rounded-xl hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              title="Print Wristband and Call Sheet"
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

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-6 pt-4">
          <div>
            <h3 className="text-sm font-semibold text-teal-400 mb-2">
              01. Quarterback Wristband Insert (Cut Along Border — Standard 4.5" x 2.75" Window)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-2 border-dashed border-[#1E3A47] p-4 rounded-lg bg-[#060D11]">
              {VEER_PLAYBOOK.map((play, index) => (
                <div
                  key={play.id}
                  className="p-3 rounded border border-[#162A33] bg-[#0B171E] flex flex-col justify-between"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono-tabular text-sm font-bold text-teal-400">
                      #{index + 1}0 — {play.code}
                    </span>
                    <span className="text-[11px] text-slate-400">{play.targetGap.split('/')[0]}</span>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1.5 line-clamp-1">{play.name}</p>
                  <div className="mt-2 pt-2 border-t border-[#162A33]/80 text-[11px] text-slate-300 space-y-0.5">
                    <p>
                      <span className="text-slate-400 font-medium">Key:</span> {play.primaryReadLabel.split('(')[0]}
                    </p>
                    <p className="line-clamp-2">
                      <span className="text-slate-400 font-medium">Rule:</span> {play.qbDecisionMatrix.crashPull}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* O-Line Front Identification & Call Table */}
          <div>
            <h3 className="text-sm font-semibold text-teal-400 mb-2">
              02. Offensive Line 3-Foot Split & Defensive Front Call Chart
            </h3>
            <div className="overflow-x-auto rounded-lg border border-[#162A33]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#060D11] text-slate-300 border-b border-[#162A33]">
                    <th className="py-2.5 px-3 font-semibold">Defensive Front</th>
                    <th className="py-2.5 px-3 font-semibold">Center Call</th>
                    <th className="py-2.5 px-3 font-semibold">Inside Veer Rule</th>
                    <th className="py-2.5 px-3 font-semibold">Outside Veer Rule</th>
                    <th className="py-2.5 px-3 font-semibold">Power Rule (LG Pull)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162A33]/70 font-mono-tabular">
                  {Object.values(DEFENSIVE_FRONTS).map((front) => {
                    return (
                      <tr key={front.id} className="bg-[#0A1318]/70">
                        <td className="py-2.5 px-3 font-semibold text-white">{front.name}</td>
                        <td className="py-2.5 px-3 text-teal-300">{front.lineCallRule.split('—')[0].replace(/"/g, '')}</td>
                        <td className="py-2.5 px-3 text-slate-300">RT inside release to Mike; leave 4/5-tech</td>
                        <td className="py-2.5 px-3 text-slate-300">RT & RG down block; Y release to LB</td>
                        <td className="py-2.5 px-3 text-teal-300">RT/Y down block; LG pull & kickout edge</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
              onClick={() => window.print()}
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
              <span>Exit / Return to Playbook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
