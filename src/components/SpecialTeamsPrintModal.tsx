import React from 'react';
import { X, Printer, Compass } from 'lucide-react';
import { SPECIAL_TEAMS_PLAYBOOK, SpecialTeamsUnitId } from '../data/specialTeamsData';

interface SpecialTeamsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpecialTeamsPrintModal({ isOpen, onClose }: SpecialTeamsPrintModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const units = Object.values(SPECIAL_TEAMS_PLAYBOOK);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#071015] border border-teal-500/40 rounded-2xl w-full max-w-4xl p-6 text-white space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#162A33] pb-4 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">
                Special Teams Master Coordinator Call Sheet
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Printable sideline game-day card with Wheel KOR and all 6 special teams units
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

        {/* Printable Grid of All 6 Units */}
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
                      <strong className="text-teal-400 font-mono">{p.label}:</strong> #{p.number} {p.name.split(' ')[0]}
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
    </div>
  );
}
