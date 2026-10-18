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
  ArrowRight,
} from 'lucide-react';
import {
  SPECIAL_TEAMS_PLAYBOOK,
  SpecialTeamsUnit,
  SpecialTeamsUnitId,
  STPlayer,
  getActiveSTPlayer,
} from '../data/specialTeamsData';

interface SpecialTeamsSectionProps {
  onOpenPrintModal: () => void;
}

export function SpecialTeamsSection({ onOpenPrintModal }: SpecialTeamsSectionProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<SpecialTeamsUnitId>('kick_return');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('wheel_left');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('RTR1');
  const [showPaths, setShowPaths] = useState<boolean>(true);

  const activeUnit: SpecialTeamsUnit = SPECIAL_TEAMS_PLAYBOOK[selectedUnitId];
  const activePlayers: STPlayer[] = activeUnit.players.map((p) =>
    getActiveSTPlayer(p, selectedSchemeId)
  );
  const rawPlayer =
    activeUnit.players.find((p) => p.id === selectedPlayerId) || activeUnit.players[0];
  const selectedPlayer: STPlayer = getActiveSTPlayer(rawPlayer, selectedSchemeId);

  const handleUnitChange = (unitId: SpecialTeamsUnitId) => {
    setSelectedUnitId(unitId);
    const unit = SPECIAL_TEAMS_PLAYBOOK[unitId];
    setSelectedSchemeId(unit.schemeOptions[0].id);
    setSelectedPlayerId(unit.players[0].id);
  };

  const isKickReturn = selectedUnitId === 'kick_return';
  const isWheelLeft = isKickReturn && selectedSchemeId === 'wheel_left';
  const isWheelRight = isKickReturn && selectedSchemeId === 'wheel_right';
  const isHandsTeam = isKickReturn && selectedSchemeId === 'hands_team';

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
              Master the hidden third of the game. Featuring the high-efficiency{' '}
              <strong className="text-teal-300 font-semibold">Wheel Left & Wheel Right Kickoff Return</strong> system,
              lane integrity for Kickoff Coverage, Punt (Shield & Spread), Punt Return & Block,
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
                          ? 'border-teal-400 bg-teal-950/40 text-white ring-1 ring-teal-400/50'
                          : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          {isKickReturn && (
                            <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                          )}
                          <span>{sch.label}</span>
                        </div>
                        {isSel && (
                          <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950 px-1.5 py-0.5 rounded border border-teal-700/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-normal">{sch.description}</div>
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
                {activePlayers.length} Players
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {activePlayers.map((p) => {
                const isSelected = selectedPlayerId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'border-teal-400 bg-teal-950/50 text-white ring-1 ring-teal-400/40'
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
                      <div className="text-[10px] text-slate-400 truncate">{p.role.split('(')[0].trim()}</div>
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
                {isKickReturn && (
                  <div className="px-2.5 py-1 rounded bg-teal-950/70 border border-teal-500/40 text-teal-300 font-mono text-[11px] font-bold">
                    {isWheelLeft
                      ? '⚡ WHEEL LEFT (KOR POV)'
                      : isWheelRight
                      ? '⚡ WHEEL RIGHT (KOR POV)'
                      : '🛡️ HANDS TEAM (ONSIDE RECOVERY)'}
                  </div>
                )}
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
                  <marker
                    id="stWheelArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#38BDF8" />
                  </marker>
                </defs>

                {/* Field Background */}
                <rect width="1000" height="620" fill="#04090D" />
                <rect width="1000" height="620" fill="url(#stFieldGrid)" opacity="0.6" />

                {/* Yard Lines & Field Markings based on Unit POV */}
                {selectedUnitId === 'kick_return' || selectedUnitId === 'punt_return' || selectedUnitId === 'fg_block' ? (
                  /* RETURN & BLOCK POV: OUR TEAM DEFENDING / RETURNING AT BOTTOM, OPPONENT AT TOP */
                  <g>
                    {/* Opponent Kicking / Snapping Line at y=140 or y=230 */}
                    <line x1="50" y1={selectedUnitId === 'kick_return' ? 140 : 230} x2="950" y2={selectedUnitId === 'kick_return' ? 140 : 230} stroke="#2DD4BF" strokeWidth="2.5" opacity="0.85" />
                    <text x="70" y={selectedUnitId === 'kick_return' ? 134 : 224} fill="#2DD4BF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      {selectedUnitId === 'kick_return'
                        ? 'OPPONENT KICKOFF LINE (35 YD LINE)'
                        : selectedUnitId === 'punt_return'
                        ? 'OPPONENT LINE OF SCRIMMAGE (PUNT PROTECTION)'
                        : 'OPPONENT LINE OF SCRIMMAGE (FG PROTECTION)'}
                    </text>
                    <text x="740" y={selectedUnitId === 'kick_return' ? 134 : 224} fill="#2DD4BF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      RETURN TARGET (OPPONENT GOAL) ➔
                    </text>

                    {/* Midfield 50 Yard Line */}
                    <line x1="50" y1="350" x2="950" y2="350" stroke="#162E3B" strokeWidth="1.5" />
                    <text x="70" y="344" fill="#64748B" fontSize="10" fontFamily="monospace">
                      50 YD LINE (MIDFIELD)
                    </text>

                    {/* Return Territory 20 Yard Line */}
                    <line x1="50" y1="470" x2="950" y2="470" stroke="#162E3B" strokeWidth="1.5" />
                    <text x="70" y="464" fill="#64748B" fontSize="10" fontFamily="monospace">
                      OWN 20 YD LINE
                    </text>

                    {/* Own Goal Line & End Zone at bottom (y=575 to 615) */}
                    <rect x="50" y="575" width="900" height="40" fill="#091E27" opacity="0.5" />
                    <text x="500" y="600" fill="#14B8A6" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      OWN GOAL LINE & END ZONE (OUR TEAM POV · LOOKING UPFIELD)
                    </text>

                    {/* Opponent Scout Visuals for Punt Return */}
                    {selectedUnitId === 'punt_return' && (
                      <g opacity="0.6">
                        <circle cx="500" cy="115" r="14" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
                        <text x="500" y="119" fill="#E2E8F0" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">P</text>
                        <text x="500" y="95" fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="middle">OPPONENT PUNTER</text>
                      </g>
                    )}

                    {/* Opponent Scout Visuals for FG Block */}
                    {selectedUnitId === 'fg_block' && (
                      <g opacity="0.6">
                        <circle cx="500" cy="165" r="13" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
                        <text x="500" y="169" fill="#E2E8F0" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">H</text>
                        <circle cx="460" cy="135" r="13" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
                        <text x="460" y="139" fill="#E2E8F0" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">K</text>
                        <text x="480" y="105" fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="middle">OPPONENT FG LAUNCH ZONE</text>
                      </g>
                    )}
                  </g>
                ) : (
                  /* COVERAGE & KICKING POV: OUR TEAM KICKING FROM BOTTOM TOWARD OPPONENT GOAL AT TOP */
                  <g>
                    <line x1="50" y1="120" x2="950" y2="120" stroke="#162E3B" strokeWidth="1.5" />
                    <line x1="50" y1="240" x2="950" y2="240" stroke="#162E3B" strokeWidth="1.5" />
                    <line x1="50" y1="360" x2="950" y2="360" stroke="#162E3B" strokeWidth="1.5" />
                    <line x1="50" y1="390" x2="950" y2="390" stroke="#2DD4BF" strokeWidth="2.5" opacity="0.8" />
                    <line x1="50" y1="480" x2="950" y2="480" stroke="#162E3B" strokeWidth="1.5" />

                    <text x="70" y="384" fill="#2DD4BF" fontSize="12" fontFamily="monospace" fontWeight="bold">
                      {selectedUnitId === 'kickoff' ? 'OUR KICKOFF LINE (35 YARD LINE)' : 'LINE OF SCRIMMAGE (LOS)'}
                    </text>
                    <text x="820" y="384" fill="#2DD4BF" fontSize="12" fontFamily="monospace" fontWeight="bold">
                      {activeUnit.name.toUpperCase()}
                    </text>

                    <rect x="50" y="40" width="900" height="40" fill="#091E27" opacity="0.5" />
                    <text x="500" y="65" fill="#14B8A6" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      OPPONENT GOAL LINE & END ZONE (OUR TEAM PERSPECTIVE)
                    </text>
                  </g>
                )}

                {/* Wheel Return Sideline Alley Corridor Highlight (KOR POV) */}
                {isKickReturn && (
                  <g>
                    {isWheelLeft && (
                      <>
                        {/* Shaded Left Sideline Alley Corridor */}
                        <polygon
                          points="60,140 250,140 260,575 60,575"
                          fill="#14B8A6"
                          fillOpacity="0.08"
                          stroke="#14B8A6"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                        />
                        <text
                          x="155"
                          y="555"
                          fill="#5EEAD4"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ★ DESIGNATED WHEEL LEFT ALLEY
                        </text>

                        {/* 4-Man Side-by-Side Wedge Wall Bracket (W1 · FB · W2 · W3) */}
                        <rect
                          x="100"
                          y="222"
                          width="128"
                          height="36"
                          rx="6"
                          fill="#14B8A6"
                          fillOpacity="0.18"
                          stroke="#2DD4BF"
                          strokeWidth="1.8"
                          strokeDasharray="4 2"
                        />
                        <text
                          x="164"
                          y="214"
                          fill="#5EEAD4"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          🛡️ 4-MAN WEDGE WALL (W1 · FB · W2 · W3)
                        </text>

                        {/* Returner following 10 yards back caliper */}
                        <line
                          x1="165"
                          y1="262"
                          x2="165"
                          y2="304"
                          stroke="#F59E0B"
                          strokeWidth="1.6"
                          strokeDasharray="3 3"
                        />
                        <rect x="180" y="275" width="76" height="16" rx="3" fill="#0B1A22" stroke="#F59E0B" strokeWidth="0.8" />
                        <text
                          x="218"
                          y="286"
                          fill="#FCD34D"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          10 YDS BACK
                        </text>

                        {/* Off-Returner R2 assignment indicator */}
                        <rect x="250" y="244" width="160" height="16" rx="3" fill="#1C102C" stroke="#C084FC" strokeWidth="0.8" />
                        <text
                          x="330"
                          y="255"
                          fill="#E9D5FF"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          R2: HUNTS WEDGE BUSTER
                        </text>

                        {/* Upfield Returner Curve Arc (Bottom to Top) */}
                        <path
                          d="M 430 560 Q 490 535, 200 460 L 165 320"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="3.5"
                          strokeDasharray="6 3"
                          markerEnd="url(#stKeyArrow)"
                          opacity="0.9"
                        />
                      </>
                    )}

                    {isWheelRight && (
                      <>
                        {/* Shaded Right Sideline Alley Corridor */}
                        <polygon
                          points="750,140 940,140 940,575 740,575"
                          fill="#14B8A6"
                          fillOpacity="0.08"
                          stroke="#14B8A6"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                        />
                        <text
                          x="845"
                          y="555"
                          fill="#5EEAD4"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ★ DESIGNATED WHEEL RIGHT ALLEY
                        </text>

                        {/* 4-Man Side-by-Side Wedge Wall Bracket (W3 · FB · W2 · W1) */}
                        <rect
                          x="772"
                          y="222"
                          width="128"
                          height="36"
                          rx="6"
                          fill="#14B8A6"
                          fillOpacity="0.18"
                          stroke="#2DD4BF"
                          strokeWidth="1.8"
                          strokeDasharray="4 2"
                        />
                        <text
                          x="836"
                          y="214"
                          fill="#5EEAD4"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          🛡️ 4-MAN WEDGE WALL (W3 · FB · W2 · W1)
                        </text>

                        {/* Returner following 10 yards back caliper */}
                        <line
                          x1="835"
                          y1="262"
                          x2="835"
                          y2="304"
                          stroke="#F59E0B"
                          strokeWidth="1.6"
                          strokeDasharray="3 3"
                        />
                        <rect x="744" y="275" width="76" height="16" rx="3" fill="#0B1A22" stroke="#F59E0B" strokeWidth="0.8" />
                        <text
                          x="782"
                          y="286"
                          fill="#FCD34D"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          10 YDS BACK
                        </text>

                        {/* Off-Returner R2 assignment indicator */}
                        <rect x="585" y="244" width="160" height="16" rx="3" fill="#1C102C" stroke="#C084FC" strokeWidth="0.8" />
                        <text
                          x="665"
                          y="255"
                          fill="#E9D5FF"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          R2: HUNTS WEDGE BUSTER
                        </text>

                        {/* Upfield Returner Curve Arc (Bottom to Top) */}
                        <path
                          d="M 430 560 Q 370 535, 800 460 L 835 320"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="3.5"
                          strokeDasharray="6 3"
                          markerEnd="url(#stKeyArrow)"
                          opacity="0.9"
                        />
                      </>
                    )}

                    {isHandsTeam && (
                      <>
                        {/* Shaded Hands Recovery Zone across the line */}
                        <rect
                          x="60"
                          y="140"
                          width="880"
                          height="130"
                          fill="#F59E0B"
                          fillOpacity="0.07"
                          stroke="#F59E0B"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                        />
                        <text
                          x="500"
                          y="155"
                          fill="#FCD34D"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ★ HANDS TEAM ONSIDE RECOVERY WALL (ALL 11 ADVANCED)
                        </text>
                      </>
                    )}
                  </g>
                )}

                {/* Movement / Lane Path Vectors (supports waypoints for turns & scraping) */}
                {showPaths &&
                  activePlayers.map((p) => {
                    if (p.targetX === undefined || p.targetY === undefined) return null;
                    const isKey = p.isKickerOrKey;
                    const points = [
                      { x: p.x, y: p.y },
                      ...(p.waypoints || []),
                      { x: p.targetX, y: p.targetY },
                    ];
                    const d = points
                      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
                      .join(' ');
                    return (
                      <g key={`path-${p.id}`}>
                        <path
                          d={d}
                          fill="none"
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
                {activePlayers.map((p) => {
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
                            x={p.x - 70}
                            y={p.y - 34}
                            width="140"
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

                <div className="flex items-center gap-2">
                  {isKickReturn && (
                    <span className="px-2.5 py-1 rounded bg-teal-950 text-teal-300 text-xs font-mono font-bold border border-teal-700/50">
                      {isWheelLeft ? 'Wheel Left' : 'Wheel Right'}
                    </span>
                  )}
                  {selectedPlayer.isKickerOrKey && (
                    <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 text-xs font-mono font-bold border border-amber-700/50">
                      ★ Key Specialist
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#060E13] border border-[#162A33]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                    Core Responsibility & Assignment ({isKickReturn ? (isWheelLeft ? 'Wheel Left' : 'Wheel Right') : 'Base'})
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
