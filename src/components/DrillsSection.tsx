import React, { useState } from 'react';
import { Check, Clock, RotateCcw, Users } from 'lucide-react';
import { PRACTICE_DRILLS } from '../data/veerPlaybookData';

export const DrillsSection: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});
  const [checkedSplitRules, setCheckedSplitRules] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const toggleDrillDone = (id: string) => {
    setCompletedDrills((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRuleCheck = (idx: number) => {
    setCheckedSplitRules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const totalMinutes = PRACTICE_DRILLS.reduce((acc, d) => acc + d.durationMin, 0);
  const completedMinutes = PRACTICE_DRILLS.reduce(
    (acc, d) => acc + (completedDrills[d.id] ? d.durationMin : 0),
    0
  );

  const goldenRules = [
    {
      title: '01. 3-Foot Offensive Line Splits (Non-Negotiable)',
      detail:
        'Linemen naturally crowd down to 1-foot splits. Maintain strict 3-foot spacing in practice so Guards and Tackles create wide B-gap running lanes that separate #1 from the Dive mesh.',
    },
    {
      title: '02. Split Backs Aligned at 4.0 Yards Depth on Guard Outside Heel',
      detail:
        'Both Halfbacks (3 on left & 2 on right) align in an identical 2-point stance at 4 yards depth. 3 aligns behind LG outside heel; 2 aligns behind RG outside heel. Never tip the play pre-snap.',
    },
    {
      title: '03. Never Touch the Read Keys (#1 Dive Key & #2 Pitch Key)',
      detail:
        'Playside Tackle (RT) and Y must veer-release and arc-release past #1 and #2 untouched directly onto second-level Linebackers and Safeties.',
    },
    {
      title: '04. Default 1 Rule: "Give Unless #1 Forces You to Pull"',
      detail:
        'The B-Gap Dive to 3 is automatic unless #1 crashes inside to tackle 3. If #1 sits square, widens, or Bull Rushes, 1 gives cleanly to 3.',
    },
  ];

  return (
    <section id="drills" className="py-10 border-t border-teal-950/80 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-teal-400 font-medium">
            Practice Progression · 32-Minute Daily Indy & Pod Script
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1 font-display">
            Practice Drills & Execution Checkpoints
          </h2>
        </div>

        {/* Level Progression Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-[#091217] border border-[#162A33] rounded-lg self-start">
          <button
            onClick={() => setSelectedLevel('beginner')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedLevel === 'beginner'
                ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => setSelectedLevel('intermediate')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedLevel === 'intermediate'
                ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setSelectedLevel('advanced')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedLevel === 'advanced'
                ? 'bg-teal-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Practice Script Progress Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#162A33] bg-[#0A1318]">
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <span className="font-mono-tabular text-white font-semibold">
            Practice Script Completed: {completedMinutes} / {totalMinutes} mins
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Level: {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}</span>
        </div>
        <button
          onClick={() => setCompletedDrills({})}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#101F26] hover:bg-[#162B35] border border-[#1D3643] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Practice Checklist
        </button>
      </div>

      {/* 3 Core Practice Drills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PRACTICE_DRILLS.map((drill) => {
          const isDone = !!completedDrills[drill.id];
          return (
            <div
              key={drill.id}
              className={`p-5 rounded-xl border transition-colors flex flex-col justify-between ${
                isDone
                  ? 'border-teal-500/50 bg-[#061C19]'
                  : 'border-[#162A33] bg-[#0A1318]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 font-mono-tabular text-teal-400">
                    <Clock className="w-3.5 h-3.5" />
                    {drill.durationMin} Mins
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 truncate">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{drill.playersInvolved.split(',')[0]}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-2 font-display">
                  {drill.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {drill.objective}
                </p>

                <div className="mt-4 pt-3 border-t border-[#162A33]">
                  <p className="text-xs font-semibold text-slate-200 mb-1.5">Setup & Execution:</p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {drill.setupSteps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {idx + 1}. {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#162A33]">
                  <p className="text-xs font-semibold text-teal-300 mb-1.5">Coaching Points:</p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {drill.coachingPoints.map((pt, idx) => (
                      <li key={idx} className="leading-relaxed">
                        • {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#162A33] space-y-3">
                <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33]">
                  <p className="text-[11px] font-semibold text-teal-300">
                    {selectedLevel.toUpperCase()} Progression Focus:
                  </p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {drill.levelProgression[selectedLevel]}
                  </p>
                </div>

                <button
                  onClick={() => toggleDrillDone(drill.id)}
                  className={`w-full py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isDone
                      ? 'bg-teal-400 text-slate-950 font-bold'
                      : 'bg-[#101F26] text-slate-200 hover:bg-[#162B35] border border-[#1D3643]'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isDone ? 'Completed in Practice Plan' : 'Mark Drill Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Golden Alignment & Execution Checkpoints */}
      <div className="p-6 rounded-xl border border-[#162A33] bg-[#0A1318]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#162A33]">
          <div>
            <h3 className="text-xl font-bold text-white font-display">
              Pre-Game Sideline Checklist: 4 Invariant Split Back Veer Rules
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify these four alignment invariants during pre-game warmups
            </p>
          </div>
          <span className="text-xs font-mono-tabular text-teal-400 font-semibold">
            {Object.values(checkedSplitRules).filter(Boolean).length} / {goldenRules.length} Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {goldenRules.map((rule, idx) => {
            const isChecked = !!checkedSplitRules[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleRuleCheck(idx)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  isChecked
                    ? 'border-teal-500/40 bg-[#061216]'
                    : 'border-[#162A33] bg-[#060D11]/50 hover:border-[#22414F]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">{rule.title}</h4>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 h-4 w-4 accent-teal-400 rounded cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rule.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
