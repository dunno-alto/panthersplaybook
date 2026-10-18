import React, { useState } from 'react';
import {
  Compass,
  Flag,
  Target,
  Shield,
  Zap,
  Printer,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  SPECIAL_TEAMS_PLAYBOOK,
  SpecialTeamsUnit,
  SpecialTeamsUnitId,
  STPlayer,
} from '../data/specialTeamsData';

interface SpecialTeamsSectionProps {
  onOpenPrintModal: () => void;
}

export function SpecialTeamsSection({ onOpenPrintModal }: SpecialTeamsSectionProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<SpecialTeamsUnitId>('kickoff');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('middle_deep');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('L3');
  const [showPaths, setShowPaths] = useState<boolean>(true);

  const activeUnit: SpecialTeamsUnit = SPECIAL_TEAMS_PLAYBOOK[selectedUnitId];
  const selectedPlayer: STPlayer =
    activeUnit.players.find((p) => p.id === selectedPlayerId) || activeUnit.players[0];

  const handleUnitChange = (unitId: SpecialTeamsUnitId) => {
    setSelectedUnitId(unitId);
    const unit = SPECIAL_TEAMS_PLAYBOOK[unitId];
    setSelectedSchemeId(unit.schemeOptions[0].id);
    setSelectedPlayerId(unit.players[0].id);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-[#07131B] via-[#091822] to-[#0B1F2C] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              Special Teams Tactical Coordinator
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Special Teams <span className="text-teal-400">Playbook & Execution</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Master the hidden third of the game. Comprehensive tactical diagrams and lane
              disciplines for Kickoff, Kickoff Return, Punt (Shield & Spread), Punt Return & Block,
              Field Goal / PAT Protection, and Field Goal Block / Kick-Six.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Special Teams Sheet
            </button>
          </div>
        </div>

        {/* Units Navigation Row */}
        <div className="mt-6 pt-5 border-t border-[#18323F] flex flex-wrap items-center gap-2">
          {(Object.keys(SPECIAL_TEAMS_PLAYBOOK) as SpecialTeamsUnitId[]).map((uid) => {
            const unit = SPECIAL_TEAMS_PLAYBOOK[uid];
            const isSelected = selectedUnitId === uid;
            return (
              <button
                key={uid}
                onClick={() => handleUnitChange(uid)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 font-mono'
                    : 'bg-[#091318] text-slate-400 hover:text-white border border-[#162A33]'
                }`}
              >
                {unit.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Controls + Chalkboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Unit Schemes & Player Roster */}
        <div className="lg:col-span-4 space-y-6">
          {/* Unit Overview Card */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                <Flag className="w-4 h-4 text-teal-400" />
                {activeUnit.name}
              </div>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                {activeUnit.targetTempo}
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">{activeUnit.overview}</p>

            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-teal-200 text-xs italic font-serif">
              {activeUnit.coachingMotto}
            </div>

            {/* Scheme Variant Options */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold block">
                Call / Scheme Variation:
              </span>
              <div className="space-y-2">
                {activeUnit.schemeOptions.map((sch) => {
                  const isSel = selectedSchemeId === sch.id;
                  return (
                    <button
                      key={sch.id}
                      onClick={() => setSelectedSchemeId(sch.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'border-teal-400 bg-teal-950/40 text-white'
                          : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{sch.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{sch.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unit Personnel Roster */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-400" />
                11-Player Personnel Roster
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {activeUnit.players.length} Players
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activeUnit.players.map((p) => {
                const isSelected = selectedPlayerId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'border-teal-400 bg-teal-950/50 text-white'
                        : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        p.isKickerOrKey ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
                      }`}
                    >
                      {p.label}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-200">#{p.number} {p.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Tactical ST Canvas & Deep Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-4 lg:p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                  Tactical Special Teams Canvas
                </span>
                <span className="text-xs text-slate-400">· Click any player node to inspect</span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showPaths}
                    onChange={(e) => setShowPaths(e.target.checked)}
                    className="rounded border-slate-700 text-teal-400 focus:ring-0"
                  />
                  <span>Lane / Movement Vectors</span>
                </label>
              </div>
            </div>

            {/* Canvas Diagram */}
            <div className="relative w-full aspect-[16/10] bg-[#050C10] rounded-xl border border-[#162A33] overflow-hidden select-none">
              <svg
                viewBox="0 0 1000 620"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <pattern id="stFieldGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="100" y2="0" stroke="#0E232E" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#0E232E" strokeWidth="1" strokeDasharray="4 4" />
                  </pattern>

                  <marker
                    id="stPathArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#2DD4BF" />
                  </marker>
                  <marker
                    id="stKeyArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#F59E0B" />
                  </marker>
                </defs>

                {/* Field Background */}
                <rect width="1000" height="620" fill="#04090D" />
                <rect width="1000" height="620" fill="url(#stFieldGrid)" opacity="0.6" />

                {/* Yard Lines */}
                <line x1="50" y1="120" x2="950" y2="120" stroke="#162E3B" strokeWidth="1.5" />
                <line x1="50" y1="240" x2="950" y2="240" stroke="#162E3B" strokeWidth="1.5" />
                <line x1="50" y1="360" x2="950" y2="360" stroke="#162E3B" strokeWidth="1.5" />
                <line x1="50" y1="390" x2="950" y2="390" stroke="#2DD4BF" strokeWidth="2.5" opacity="0.8" />
                <line x1="50" y1="480" x2="950" y2="480" stroke="#162E3B" strokeWidth="1.5" />

                {/* Field Markings */}
                <text x="70" y="384" fill="#2DD4BF" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  LINE OF SCRIMMAGE / RESTRAINT LINE
                </text>
                <text x="820" y="384" fill="#2DD4BF" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  {activeUnit.name.toUpperCase()}
                </text>

                {/* Goal Line & End Zone */}
                <rect x="50" y="40" width="900" height="40" fill="#091E27" opacity="0.5" />
                <text x="500" y="65" fill="#14B8A6" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  GOAL LINE & END ZONE
                </text>

                {/* Movement / Lane Path Vectors */}
                {showPaths &&
                  activeUnit.players.map((p) => {
                    if (p.targetX === undefined || p.targetY === undefined) return null;
                    const isKey = p.isKickerOrKey;
                    return (
                      <g key={`path-${p.id}`}>
                        <line
                          x1={p.x}
                          y1={p.y}
                          x2={p.targetX}
                          y2={p.targetY}
                          stroke={isKey ? '#F59E0B' : '#14B8A6'}
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                          markerEnd={isKey ? 'url(#stKeyArrow)' : 'url(#stPathArrow)'}
                          opacity="0.85"
                        />
                      </g>
                    );
                  })}

                {/* Player Circles */}
                {activeUnit.players.map((p) => {
                  const isSelected = selectedPlayerId === p.id;
                  const isKey = p.isKickerOrKey;

                  return (
                    <g
                      key={p.id}
                      onClick={() => setSelectedPlayerId(p.id)}
                      className="cursor-pointer group"
                    >
                      {/* Selected Ring */}
                      {isSelected && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="22"
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="3"
                        />
                      )}

                      {/* Main Node */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="16"
                        fill={isKey ? '#78350F' : '#042F2E'}
                        stroke={isKey ? '#F59E0B' : '#14B8A6'}
                        strokeWidth="2"
                      />

                      {/* Label */}
                      <text
                        x={p.x}
                        y={p.y - 1}
                        fill="#FFFFFF"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>

                      {/* Jersey number */}
                      <text
                        x={p.x}
                        y={p.y + 9}
                        fill={isKey ? '#FDE68A' : '#5EEAD4'}
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {p.number}
                      </text>

                      {/* Name tooltip on selected */}
                      {isSelected && (
                        <g>
                          <rect
                            x={p.x - 60}
                            y={p.y - 34}
                            width="120"
                            height="18"
                            rx="4"
                            fill="#0A1C24"
                            stroke="#38BDF8"
                            strokeWidth="1"
                          />
                          <text
                            x={p.x}
                            y={p.y - 21}
                            fill="#E0F2FE"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {p.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-3 left-3 bg-[#061219]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#162A33] text-[11px] font-mono text-slate-300">
                Unit: <strong className="text-white">{activeUnit.name}</strong> · Personnel:{' '}
                <strong className="text-teal-300">{activeUnit.personnelType}</strong>
              </div>
            </div>

            {/* Player Inspector Details */}
            <div className="p-4 rounded-xl border border-teal-500/30 bg-[#09151D] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18323F] pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono font-bold text-teal-300 text-sm">
                    {selectedPlayer.label}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      #{selectedPlayer.number} {selectedPlayer.name}
                    </h3>
                    <p className="text-[11px] text-teal-400 font-mono">{selectedPlayer.role}</p>
                  </div>
                </div>

                {selectedPlayer.isKickerOrKey && (
                  <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 text-xs font-mono font-bold border border-amber-700/50">
                    ★ Key Specialist
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#060E13] border border-[#162A33]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                    Core Responsibility & Alignment
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    {selectedPlayer.responsibility}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#060E13] border border-[#162A33]">
                  <span className="text-[10px] uppercase font-mono text-teal-400 block font-semibold">
                    Golden Coaching Cue
                  </span>
                  <p className="text-teal-200 mt-1 font-mono leading-relaxed">
                    &ldquo;{selectedPlayer.coachingCue}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Rules & Drills Section */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Execution Rules & Non-Negotiables ({activeUnit.shortName})
              </div>
            </div>

            <div className="space-y-3">
              {activeUnit.rulesAndDrills.map((rd, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#091318] border border-[#162A33] text-xs space-y-1"
                >
                  <div className="font-bold text-teal-300 font-mono">{rd.title}</div>
                  <p className="text-slate-300 leading-relaxed">{rd.rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
