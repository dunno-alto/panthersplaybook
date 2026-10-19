import React from 'react';
import { Printer, X } from 'lucide-react';
import { DEFENSIVE_FRONTS, VEER_PLAYBOOK } from '../data/veerPlaybookData';

interface WristbandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WristbandModal: React.FC<WristbandModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl border border-[#162A33] bg-[#0A1318] text-slate-100 p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#162A33] no-print">
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-display text-white">
              Wristband & Sideline Play Call Sheet — Split Back Veer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              5 Core Plays: Inside Veer · Outside Veer · Counter · Power (Pulling Guard) · Double Tight Right 36 Flood
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              Print Sheet
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#101F26] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable QB Wristband Card Grid */}
        <div className="mt-5 space-y-6">
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
      </div>
    </div>
  );
};
