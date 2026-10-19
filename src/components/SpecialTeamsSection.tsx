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
  Layers,
  Activity,
  Sliders,
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

export type STBallHash = 'left_hash' | 'middle' | 'right_hash';

export function SpecialTeamsSection({ onOpenPrintModal }: SpecialTeamsSectionProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<SpecialTeamsUnitId>('kick_return');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('wheel_left');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('RTR1');
  const [ballHash, setBallHash] = useState<STBallHash>('middle');
  const [showPaths, setShowPaths] = useState<boolean>(true);
  const [showAssignmentsOnField, setShowAssignmentsOnField] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const activeUnit: SpecialTeamsUnit = SPECIAL_TEAMS_PLAYBOOK[selectedUnitId];

  // Ensure active scheme exists for current unit
  const activeScheme =
    activeUnit.schemeOptions.find((s) => s.id === selectedSchemeId) || activeUnit.schemeOptions[0];

  const activePlayers: STPlayer[] = activeUnit.players.map((p) =>
    getActiveSTPlayer(p, activeScheme.id)
  );

  const rawPlayer =
    activeUnit.players.find((p) => p.id === selectedPlayerId) || activeUnit.players[0];
  const selectedPlayer: STPlayer = getActiveSTPlayer(rawPlayer, activeScheme.id);

  const handleUnitChange = (unitId: SpecialTeamsUnitId) => {
    setSelectedUnitId(unitId);
    const unit = SPECIAL_TEAMS_PLAYBOOK[unitId];
    const defaultScheme = unit.schemeOptions[0].id;
    setSelectedSchemeId(defaultScheme);
    setSelectedPlayerId(unit.players[0].id);
  };

  const isKickReturn = selectedUnitId === 'kick_return';
  const isWheelLeft = isKickReturn && activeScheme.id === 'wheel_left';
  const isWheelRight = isKickReturn && activeScheme.id === 'wheel_right';
  const isHandsTeam = isKickReturn && activeScheme.id === 'hands_team';

  const isKickoff = selectedUnitId === 'kickoff';
  const isPuntCoverage = selectedUnitId === 'punt_coverage';
  const isPuntReturn = selectedUnitId === 'punt_return';
  const isFgPat = selectedUnitId === 'fg_pat';
  const isFgBlock = selectedUnitId === 'fg_block';

  // Live spoken call display (matching Offense/Defense tabs)
  const getLiveCallDisplay = () => {
    return `${activeScheme.label.toUpperCase()} · ${activeUnit.name.toUpperCase()}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* =========================================================================
          MASTER CONSOLE HEADER & CONTROLS (Matches Offense & Defense Tabs)
         ========================================================================= */}
      <section
        id="st-setup-console"
        aria-label="Special Teams Setup & Matchup Console"
        className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-6"
      >
        {/* Top Master Status & Spoken Call Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#162A33]/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold uppercase tracking-wider text-[11px]">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                Special Teams Tactical Call System & Matchup Lab
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Unit:</span>
              <span className="text-teal-300 font-bold font-mono">{activeUnit.shortName}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Tempo:</span>
              <span className="text-slate-300 font-mono">{activeUnit.targetTempo}</span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Live Special Teams Call:
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight bg-teal-950/40 px-3 py-1 rounded-lg border border-teal-500/50 shadow-inner">
                {getLiveCallDisplay()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Matchup Summary Pill */}
            <div className="hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-[#0B151C] border border-[#162A33] text-xs font-mono shrink-0">
              <span className="text-teal-400 font-bold">{activeUnit.shortName}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">{activeScheme.label}</span>
              <span className="text-slate-500">·</span>
              <span className="px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60 font-semibold text-[11px]">
                {activeUnit.personnelType}
              </span>
            </div>

            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Print ST Sheet
            </button>
          </div>
        </div>

        {/* 4 Modular Adjustment Cards (Matches Defense Tab's 4-Input Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* 1. SPECIAL TEAMS UNIT (6 Units) */}
          <div className="lg:col-span-5 p-3 rounded-xl border border-teal-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                1. Special Teams Unit
              </span>
              <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/40">
                {activeUnit.shortName}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(SPECIAL_TEAMS_PLAYBOOK) as SpecialTeamsUnitId[]).map((uid) => {
                const unit = SPECIAL_TEAMS_PLAYBOOK[uid];
                const isSelected = selectedUnitId === uid;
                return (
                  <button
                    key={uid}
                    onClick={() => handleUnitChange(uid)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-400 bg-teal-950 text-white shadow ring-1 ring-teal-400/50'
                        : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono text-teal-300 truncate">
                      {unit.shortName.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-300 truncate mt-0.5">
                      {unit.shortName.split(' ').slice(1).join(' ') || unit.shortName}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Personnel: <span className="text-slate-200">{activeUnit.personnelType}</span>
            </div>
          </div>

          {/* 2. SCHEME / CALL SELECTOR (Simple Buttons) */}
          <div className="lg:col-span-4 p-3 rounded-xl border border-amber-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                2. Call / Scheme
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/40 truncate max-w-[130px]">
                {activeScheme.label}
              </span>
            </div>

            {/* Simple clean buttons with NO messy text inside the button */}
            <div className="flex flex-wrap gap-1.5">
              {activeUnit.schemeOptions.map((sch) => {
                const isSel = activeScheme.id === sch.id;
                return (
                  <button
                    key={sch.id}
                    onClick={() => setSelectedSchemeId(sch.id)}
                    className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSel
                        ? 'border-amber-400 bg-amber-950 text-white shadow ring-1 ring-amber-400/50 font-bold'
                        : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-slate-200 hover:border-slate-700 font-medium'
                    }`}
                  >
                    <div className="text-xs font-mono text-amber-300 truncate">{sch.label}</div>
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Active Call: <span className="text-amber-300 font-semibold">{activeScheme.label}</span>
            </div>
          </div>

          {/* 3. FIELD HASH / DIRECTION CALIBRATION */}
          <div className="lg:col-span-3 p-3 rounded-xl border border-sky-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                3. Field Ball Hash
              </span>
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/40">
                {ballHash === 'middle' ? 'MIDDLE' : ballHash === 'left_hash' ? 'LEFT' : 'RIGHT'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'left_hash' as const, label: 'Left Hash' },
                { id: 'middle' as const, label: 'Middle' },
                { id: 'right_hash' as const, label: 'Right Hash' },
              ].map((h) => {
                const isSel = ballHash === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => setBallHash(h.id)}
                    className={`py-2 px-1 rounded-lg border text-center text-xs font-mono transition-all cursor-pointer ${
                      isSel
                        ? 'border-sky-400 bg-sky-950 text-sky-200 font-bold shadow'
                        : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-white'
                    }`}
                  >
                    {h.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Hash: <span className="text-slate-200">{ballHash.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Display Toggles Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#162A33]/80 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              Canvas Display Overlays:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-mono text-[11px]">
              <input
                type="checkbox"
                checked={showPaths}
                onChange={(e) => setShowPaths(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span>Movement Vectors / Lanes</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-mono text-[11px]">
              <input
                type="checkbox"
                checked={showAssignmentsOnField}
                onChange={(e) => setShowAssignmentsOnField(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span>Player Assignment Pills</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-mono text-[11px]">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span>Field Yard Grid</span>
            </label>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN GRID: SCHEME DOCTRINE & ROSTER (LEFT) + TACTICAL CANVAS (RIGHT)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scheme Doctrine Breakdown & 11-Player Personnel */}
        <div className="lg:col-span-5 space-y-6">
          {/* DYNAMIC SCHEME TACTICAL DESCRIPTION CARD
              (Clean Simple Buttons are at the top, then this whole card goes into full description
               without repetitive generic boilerplate!) */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                <Flag className="w-4 h-4 text-teal-400" />
                <span>{activeScheme.label} Tactical Doctrine</span>
              </div>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                {activeUnit.shortName}
              </span>
            </div>

            {/* Scheme Full Detailed Description (Changes dynamically when button is clicked!) */}
            <div className="p-3.5 rounded-xl bg-[#09151D] border border-teal-500/20 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
                Execution Directive:
              </span>
              <p className="text-slate-200 text-xs leading-relaxed font-sans">
                {activeScheme.description}
              </p>
            </div>

            {/* KOR Specific Deep Doctrine (When on Kickoff Return Unit) */}
            {isKickReturn && (
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Wheel KOR Mechanics Breakdown:
                </div>

                <div className="space-y-2.5 text-xs">
                  {isWheelLeft && (
                    <>
                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-teal-300 font-mono text-[11px] block">
                          1. Front 5 Stepped Drops & Horizontal Scrape
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Front 5 never cross the line of scrimmage. They drop to stepped depths (FL1: 25 yds, FL2: 20 yds, FL3: 15 yds, FL4: 10 yds, FL5: 5 yds) reaching 10 yards from the left sideline, then turn left and scrape horizontally back across toward the inside looking for blocks.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-amber-300 font-mono text-[11px] block">
                          2. 4-Man Side-by-Side Wedge Wall (W1 · FB · W2 · W3)
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          W1 anchors the boundary edge, with Lead Fullback, W2, and W3 locking shoulder-to-shoulder to assemble an unbroken moving barrier running up the left sideline ahead of the returner.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-sky-300 font-mono text-[11px] block">
                          3. Returner Primary Slipstream Track (10 Yards Back)
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Returner Primary fields the kick, presses 2 freeze steps right to suck coverage inward, then plants the outside foot and wheels into the wedge wall slipstream, following exactly 10 yards behind.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-purple-300 font-mono text-[11px] block">
                          4. Returner Secondary Assignment (Inside Seal)
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Returner Secondary without the ball operates on the inside flank of the wedge wall, isolating and sealing the lead pursuit disrupter or any stray defenders penetrating inside.
                        </p>
                      </div>
                    </>
                  )}

                  {isWheelRight && (
                    <>
                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-teal-300 font-mono text-[11px] block">
                          1. Front 5 Stepped Drops & Horizontal Scrape
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Front 5 never cross the line of scrimmage. They drop to stepped depths (FL5: 25 yds, FL4: 20 yds, FL3: 15 yds, FL2: 10 yds, FL1: 5 yds) reaching 10 yards from the right sideline, then turn right and scrape horizontally back across toward the inside looking for blocks.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-amber-300 font-mono text-[11px] block">
                          2. 4-Man Side-by-Side Wedge Wall (W3 · FB · W2 · W1)
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          W3 anchors the boundary edge, with Lead Fullback, W2, and W1 locking shoulder-to-shoulder to assemble an unbroken moving barrier running up the right sideline ahead of the returner.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-sky-300 font-mono text-[11px] block">
                          3. Returner Primary Slipstream Track (10 Yards Back)
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Returner Primary fields the kick, presses 2 freeze steps left to suck coverage inward, then plants the outside foot and wheels into the wedge wall slipstream, following exactly 10 yards behind.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                        <span className="font-bold text-purple-300 font-mono text-[11px] block">
                          4. Returner Secondary Assignment (Inside Seal)
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Returner Secondary without the ball operates on the inside flank of the wedge wall, isolating and sealing the lead pursuit disrupter or any stray defenders penetrating inside.
                        </p>
                      </div>
                    </>
                  )}

                  {isHandsTeam && (
                    <div className="p-3 rounded-lg bg-[#060D11] border border-amber-500/30 space-y-2">
                      <span className="font-bold text-amber-300 font-mono text-[11px] block">
                        ★ Hands Team Onside Recovery Doctrine
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        All 11 players advance to the onside recovery restraint zone. Front line of 8 sure-handed players aligns across the 45-yard line spaced 5 yards apart. 3 safety valves position 5–8 yards behind to recover deflections.
                      </p>
                      <div className="text-[11px] font-mono text-amber-200 bg-amber-950/40 p-2 rounded border border-amber-800/40">
                        Rule: See ball, secure with two hands, immediately fall to the turf. Zero return attempt.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Non-KOR Coaching Motto */}
            {!isKickReturn && (
              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-teal-200 text-xs italic font-serif">
                {activeUnit.coachingMotto}
              </div>
            )}
          </div>

          {/* 11-PLAYER PERSONNEL ROSTER (Compact, Interactive) */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="font-bold text-white text-sm font-display flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-400" />
                11-Player Personnel Roster
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Click Player Node to Inspect
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
                      <div className="text-xs font-bold truncate text-slate-200">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.role.split('(')[0].trim()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Tactical ST Canvas & Deep Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-4 lg:p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                  Tactical Special Teams Canvas
                </span>
                <span className="text-xs text-slate-400">· Click any player to inspect assignment</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="px-2.5 py-1 rounded bg-teal-950/70 border border-teal-500/40 text-teal-300 font-mono text-[11px] font-bold">
                  {activeScheme.label.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Canvas Diagram (Dynamic SVG reflecting each scheme & button!) */}
            <div className="relative w-full aspect-[16/10] bg-[#050C10] rounded-xl border border-[#162A33] overflow-hidden select-none">
              <svg
                viewBox="0 0 1000 620"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {showGrid && (
                    <pattern id="stFieldGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="100" y2="0" stroke="#0E232E" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="0" x2="0" y2="100" stroke="#0E232E" strokeWidth="1" strokeDasharray="4 4" />
                    </pattern>
                  )}

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
                    id="stPurpleArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#C084FC" />
                  </marker>
                  <marker
                    id="stRedArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#F87171" />
                  </marker>
                </defs>

                {/* Field Background */}
                <rect width="1000" height="620" fill="#04090D" />
                {showGrid && <rect width="1000" height="620" fill="url(#stFieldGrid)" opacity="0.6" />}

                {/* Yard Lines & Field Markings based on Unit POV */}
                {selectedUnitId === 'kick_return' || selectedUnitId === 'punt_return' || selectedUnitId === 'fg_block' ? (
                  /* RETURN & BLOCK POV: OUR TEAM RETURNING AT BOTTOM, OPPONENT AT TOP */
                  <g>
                    {/* Opponent Kicking / Snapping Line */}
                    <line
                      x1="50"
                      y1={selectedUnitId === 'kick_return' ? 140 : 230}
                      x2="950"
                      y2={selectedUnitId === 'kick_return' ? 140 : 230}
                      stroke="#2DD4BF"
                      strokeWidth="2.5"
                      opacity="0.85"
                    />
                    <text
                      x="70"
                      y={selectedUnitId === 'kick_return' ? 134 : 224}
                      fill="#2DD4BF"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {selectedUnitId === 'kick_return'
                        ? 'OPPONENT KICKOFF RESTRAINT LINE (35 YD)'
                        : selectedUnitId === 'punt_return'
                        ? 'OPPONENT LINE OF SCRIMMAGE (PUNT PROTECTION)'
                        : 'OPPONENT LINE OF SCRIMMAGE (FG PROTECTION)'}
                    </text>
                    <text
                      x="730"
                      y={selectedUnitId === 'kick_return' ? 134 : 224}
                      fill="#2DD4BF"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      RETURN TARGET (OPPONENT GOAL) ➔
                    </text>

                    {/* Midfield 50 Yard Line */}
                    <line x1="50" y1="350" x2="950" y2="350" stroke="#162E3B" strokeWidth="1.5" />
                    <text x="70" y="344" fill="#64748B" fontSize="10" fontFamily="monospace">
                      50 YD LINE (MIDFIELD)
                    </text>

                    {/* Own 20 Yard Line */}
                    <line x1="50" y1="520" x2="950" y2="520" stroke="#162E3B" strokeWidth="1.5" />
                    <text x="70" y="514" fill="#64748B" fontSize="10" fontFamily="monospace">
                      OWN 20 YD LINE
                    </text>

                    {/* Own Goal Line */}
                    <line x1="50" y1="600" x2="950" y2="600" stroke="#0E232E" strokeWidth="2" />
                  </g>
                ) : (
                  /* COVERAGE & KICKING POV: OUR TEAM KICKING AT BOTTOM, ADVANCING UPFIELD */
                  <g>
                    <line x1="50" y1="520" x2="950" y2="520" stroke="#2DD4BF" strokeWidth="2.5" opacity="0.85" />
                    <text x="70" y="514" fill="#2DD4BF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      {selectedUnitId === 'kickoff'
                        ? 'OUR KICKOFF LINE (35 YARD LINE)'
                        : 'OUR LINE OF SCRIMMAGE'}
                    </text>
                    <text x="740" y="514" fill="#2DD4BF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                      COVERAGE TARGET (OPPONENT END ZONE) ➔
                    </text>

                    <line x1="50" y1="350" x2="950" y2="350" stroke="#162E3B" strokeWidth="1.5" />
                    <text x="70" y="344" fill="#64748B" fontSize="10" fontFamily="monospace">
                      50 YD LINE (MIDFIELD)
                    </text>

                    <line x1="50" y1="180" x2="950" y2="180" stroke="#162E3B" strokeWidth="1.5" />
                    <text x="70" y="174" fill="#64748B" fontSize="10" fontFamily="monospace">
                      OPPONENT 20 YD LINE (CONTAIN PIN ZONE)
                    </text>
                  </g>
                )}

                {/* Hash Mark Calibrations */}
                <line x1="333" y1="80" x2="333" y2="600" stroke="#0D1F28" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="666" y1="80" x2="666" y2="600" stroke="#0D1F28" strokeWidth="1" strokeDasharray="3 3" />

                {/* =============================================================
                    SCHEME SPECIFIC DYNAMIC PLAYART OVERLAYS
                   ============================================================= */}
                {isKickReturn && (
                  <g>
                    {isWheelLeft && (
                      <>
                        {/* Stepped Drop Markers for Front 5 along left sideline */}
                        {[
                          { y: 370, label: 'FL1: 25 YDS' },
                          { y: 330, label: 'FL2: 20 YDS' },
                          { y: 290, label: 'FL3: 15 YDS' },
                          { y: 250, label: 'FL4: 10 YDS' },
                          { y: 210, label: 'FL5: 5 YDS' },
                        ].map((drop, idx) => (
                          <g key={`drop-l-${idx}`}>
                            <line x1="90" y1={drop.y} x2="160" y2={drop.y} stroke="#14B8A6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                            <text x="95" y={drop.y - 4} fill="#5EEAD4" fontSize="8" fontFamily="monospace">
                              {drop.label}
                            </text>
                          </g>
                        ))}

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

                        {/* Returner Secondary R2 assignment indicator */}
                        <rect x="250" y="244" width="165" height="16" rx="3" fill="#1C102C" stroke="#C084FC" strokeWidth="0.8" />
                        <text
                          x="332"
                          y="255"
                          fill="#E9D5FF"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          R2: SEALS LEAD DISRUPTER
                        </text>

                        {/* Upfield Returner Curve Arc */}
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
                        {/* Stepped Drop Markers for Front 5 along right sideline */}
                        {[
                          { y: 370, label: 'FL5: 25 YDS' },
                          { y: 330, label: 'FL4: 20 YDS' },
                          { y: 290, label: 'FL3: 15 YDS' },
                          { y: 250, label: 'FL2: 10 YDS' },
                          { y: 210, label: 'FL1: 5 YDS' },
                        ].map((drop, idx) => (
                          <g key={`drop-r-${idx}`}>
                            <line x1="840" y1={drop.y} x2="910" y2={drop.y} stroke="#14B8A6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                            <text x="845" y={drop.y - 4} fill="#5EEAD4" fontSize="8" fontFamily="monospace">
                              {drop.label}
                            </text>
                          </g>
                        ))}

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

                        {/* Returner Secondary R2 assignment indicator */}
                        <rect x="580" y="244" width="165" height="16" rx="3" fill="#1C102C" stroke="#C084FC" strokeWidth="0.8" />
                        <text
                          x="662"
                          y="255"
                          fill="#E9D5FF"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          R2: SEALS LEAD DISRUPTER
                        </text>

                        {/* Upfield Returner Curve Arc */}
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

                {/* Punt Coverage Overlays */}
                {isPuntCoverage && (
                  <g>
                    {activeScheme.id === 'p3_power_35' && (
                      <>
                        {/* 5-hole crease running lane highlight */}
                        <rect
                          x="350"
                          y="240"
                          width="90"
                          height="140"
                          rx="4"
                          fill="#F59E0B"
                          fillOpacity="0.12"
                          stroke="#F59E0B"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                        <text
                          x="395"
                          y="235"
                          fill="#FCD34D"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ⚡ 5-HOLE POWER CREASE
                        </text>
                        {/* Direct snap line from LS to P3 */}
                        <line
                          x1="500"
                          y1="390"
                          x2="535"
                          y2="460"
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                        />
                        <text x="530" y="425" fill="#FCD34D" fontSize="8" fontFamily="monospace">
                          DIRECT SNAP
                        </text>
                      </>
                    )}
                    {activeScheme.id === 'directional_left' && (
                      <>
                        <polygon
                          points="500,480 80,100 240,100"
                          fill="#14B8A6"
                          fillOpacity="0.1"
                          stroke="#14B8A6"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                        <text
                          x="160"
                          y="90"
                          fill="#5EEAD4"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          📌 LEFT BOUNDARY COFFIN CORNER
                        </text>
                      </>
                    )}
                  </g>
                )}

                {/* Punt Return Overlays */}
                {isPuntReturn && (
                  <g>
                    {activeScheme.id === 'wall_right' && (
                      <rect
                        x="620"
                        y="330"
                        width="180"
                        height="140"
                        rx="6"
                        fill="#14B8A6"
                        fillOpacity="0.15"
                        stroke="#2DD4BF"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                    )}
                    {activeScheme.id === 'wall_left' && (
                      <rect
                        x="200"
                        y="330"
                        width="180"
                        height="140"
                        rx="6"
                        fill="#14B8A6"
                        fillOpacity="0.15"
                        stroke="#2DD4BF"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
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

                      {/* Label (Position ID Only - Centered) */}
                      <text
                        x={p.x}
                        y={p.y + 4}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>

                      {/* On-field assignment pill */}
                      {showAssignmentsOnField && (
                        <g>
                          <rect
                            x={p.x - 36}
                            y={p.y + 19}
                            width="72"
                            height="13"
                            rx="3"
                            fill="#061219"
                            stroke={isSelected ? '#38BDF8' : '#162A33'}
                            strokeWidth="0.8"
                          />
                          <text
                            x={p.x}
                            y={p.y + 28}
                            fill={isSelected ? '#38BDF8' : '#94A3B8'}
                            fontSize="7.5"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {p.role.split('(')[0].trim().slice(0, 12)}
                          </text>
                        </g>
                      )}

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
                Unit: <strong className="text-white">{activeUnit.name}</strong> · Call:{' '}
                <strong className="text-teal-300">{activeScheme.label}</strong>
              </div>
            </div>

            {/* Selected Player Inspector Details */}
            <div className="p-4 rounded-xl border border-teal-500/30 bg-[#09151D] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18323F] pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono font-bold text-teal-300 text-sm">
                    {selectedPlayer.label}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {selectedPlayer.name} ({selectedPlayer.label})
                    </h3>
                    <p className="text-[11px] text-teal-400 font-mono">{selectedPlayer.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-teal-950 text-teal-300 text-xs font-mono font-bold border border-teal-700/50">
                    Call: {activeScheme.label}
                  </span>
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
                    Core Assignment ({activeScheme.label})
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    {selectedPlayer.responsibility}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#060E13] border border-[#162A33]">
                  <span className="text-[10px] uppercase font-mono text-teal-400 block font-semibold">
                    Coaching Cue
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
