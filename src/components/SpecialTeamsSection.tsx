import React, { useState, useEffect, useRef } from 'react';
import {
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
  Pause,
  RotateCcw,
  StepForward,
  Sparkles,
  ArrowRight,
  Layers,
  Activity,
  Sliders,
  Users,
  Compass,
} from 'lucide-react';
import {
  SPECIAL_TEAMS_PLAYBOOK,
  SpecialTeamsUnit,
  SpecialTeamsUnitId,
  STPlayer,
  getActiveSTPlayer,
} from '../data/specialTeamsData';
import {
  SPECIAL_TEAMS_OPPONENTS,
  STOpponentPlayer,
  getActiveSTOpponent,
  getSTBallTrajectory,
  interpolateBall,
  interpolatePlayerPath,
  getSTPlayerLivePosition,
  getLiveSTBallPosition,
} from '../data/specialTeamsOpponentData';

interface SpecialTeamsSectionProps {
  onOpenPrintModal: () => void;
}

export type STBallHash = 'left_hash' | 'middle' | 'right_hash';

export function SpecialTeamsSection({ onOpenPrintModal }: SpecialTeamsSectionProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<SpecialTeamsUnitId>('kick_return');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('wheel_left');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('RTR1');
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('OPP_L5');
  const [inspectorMode, setInspectorMode] = useState<'our_team' | 'opponent'>('our_team');
  const [ballHash, setBallHash] = useState<STBallHash>('middle');

  // Display toggles
  const [showPaths, setShowPaths] = useState<boolean>(true);
  const [showAssignmentsOnField, setShowAssignmentsOnField] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showOpponents, setShowOpponents] = useState<boolean>(true);

  // Animation playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const activeUnit: SpecialTeamsUnit = SPECIAL_TEAMS_PLAYBOOK[selectedUnitId];

  // Active scheme
  const activeScheme =
    activeUnit.schemeOptions.find((s) => s.id === selectedSchemeId) || activeUnit.schemeOptions[0];

  // Our 11 active players
  const rawActivePlayers: STPlayer[] = activeUnit.players.map((p) =>
    getActiveSTPlayer(p, activeScheme.id)
  );

  const rawSelectedPlayer =
    activeUnit.players.find((p) => p.id === selectedPlayerId) || activeUnit.players[0];
  const selectedPlayer: STPlayer = getActiveSTPlayer(rawSelectedPlayer, activeScheme.id);

  // Opponent 11 active players
  const rawOpponents: STOpponentPlayer[] = SPECIAL_TEAMS_OPPONENTS[selectedUnitId] || [];
  const activeOpponents: STOpponentPlayer[] = rawOpponents.map((opp) =>
    getActiveSTOpponent(
      opp,
      activeScheme.id,
      ballHash === 'left_hash' ? 'left' : ballHash === 'right_hash' ? 'right' : 'middle'
    )
  );

  const selectedOpponent =
    activeOpponents.find((o) => o.id === selectedOpponentId) || activeOpponents[0];

  // Ball trajectory synchronized with returner
  const currentBall = getLiveSTBallPosition(
    selectedUnitId,
    activeScheme.id,
    ballHash === 'left_hash' ? 'left' : ballHash === 'right_hash' ? 'right' : 'middle',
    rawActivePlayers,
    activeOpponents,
    progress
  );

  // Animation Loop (60fps requestAnimationFrame)
  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;
  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  useEffect(() => {
    if (!isPlaying) return;
    let animationFrameId: number;
    let lastTime = performance.now();
    let holdDuration = 0;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const deltaProgress = (dt * playbackSpeedRef.current) / 3.2; // ~3.2s per simulation
      let shouldStop = false;

      setProgress((prev) => {
        if (prev >= 1) {
          if (isLoopingRef.current) {
            holdDuration += dt;
            if (holdDuration >= 0.8) {
              holdDuration = 0;
              return 0; // Restart smoothly
            }
            return 1;
          } else {
            shouldStop = true;
            return 1;
          }
        }

        const next = prev + deltaProgress;
        if (next >= 1) {
          if (isLoopingRef.current) {
            holdDuration = 0;
            return 1;
          } else {
            shouldStop = true;
            return 1;
          }
        }
        return next;
      });

      if (shouldStop) {
        setIsPlaying(false);
        return;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (progress >= 0.98) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setProgress((p) => Math.min(1, Math.round((p + 0.15) * 100) / 100));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setProgress((p) => Math.max(0, Math.round((p - 0.15) * 100) / 100));
  };

  const handleResetPreSnap = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleUnitChange = (unitId: SpecialTeamsUnitId) => {
    setSelectedUnitId(unitId);
    const unit = SPECIAL_TEAMS_PLAYBOOK[unitId];
    const defaultScheme = unit.schemeOptions[0].id;
    setSelectedSchemeId(defaultScheme);
    setSelectedPlayerId(unit.players[0].id);
    const opps = SPECIAL_TEAMS_OPPONENTS[unitId];
    if (opps && opps.length > 0) {
      setSelectedOpponentId(opps[0].id);
    }
    setProgress(0);
    setIsPlaying(false);
  };

  const handleSchemeChange = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setProgress(0);
    setIsPlaying(false);
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

  const getLiveCallDisplay = () => {
    return `${activeScheme.label.toUpperCase()} · ${activeUnit.name.toUpperCase()}`;
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PART 1: OPTIONS ABOVE (Exact same format as Offense & Defense consoles)
         ========================================================================= */}
      <section
        aria-label="Special Teams Command Console Options"
        className="rounded-2xl border border-teal-500/30 bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-4"
      >
        {/* Header Row: Live Spoken Call + Unit Matchup Pill + Print Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#162A33]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span className="px-2 py-0.5 rounded bg-teal-400 text-slate-950 uppercase tracking-wider font-extrabold">
                Special Teams Coordinator
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-teal-400 uppercase tracking-wider">
                {activeUnit.name}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Tempo: {activeUnit.targetTempo}</span>
            </div>

            {/* High-Contrast Live Spoken Call Readout */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
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
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B151C] border border-[#162A33] text-xs font-mono shrink-0">
              <span className="text-teal-400 font-bold">{activeUnit.shortName}</span>
              <span className="text-slate-500">vs</span>
              <span className="text-red-400 font-bold">
                {isKickoff
                  ? 'Opponent KOR (11)'
                  : isKickReturn
                  ? 'Opponent Coverage (11)'
                  : isPuntCoverage
                  ? 'Opponent Return (11)'
                  : isPuntReturn
                  ? 'Opponent Punt (11)'
                  : isFgPat
                  ? 'Opponent FG Block (11)'
                  : 'Opponent FG Unit (11)'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60 font-semibold text-[11px]">
                {activeScheme.label}
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

        {/* 3 Modular Adjustment Cards (Matches Defense Tab's Input Grid) */}
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
                    type="button"
                    onClick={() => handleUnitChange(uid)}
                    className={`py-2 px-2 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer truncate ${
                      isSelected
                        ? 'bg-teal-400 text-slate-950 shadow-md ring-1 ring-teal-400/60 font-extrabold'
                        : 'bg-[#060D11] text-slate-300 hover:text-white hover:bg-[#0E1A22] border border-[#162A33]'
                    }`}
                  >
                    {unit.shortName}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Personnel: <span className="text-slate-200">{activeUnit.personnelType}</span>
            </div>
          </div>

          {/* 2. CALL / SCHEME (3 Clean Simple Buttons per user specification!) */}
          <div className="lg:col-span-4 p-3 rounded-xl border border-teal-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                2. Scheme Call
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activeUnit.schemeOptions.length} Directives
              </span>
            </div>

            {/* Simple clean buttons without cluttered long subtext */}
            <div className="grid grid-cols-3 gap-1.5">
              {activeUnit.schemeOptions.map((scheme) => {
                const isSelected = activeScheme.id === scheme.id;
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => handleSchemeChange(scheme.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer truncate ${
                      isSelected
                        ? 'bg-teal-400 text-slate-950 shadow-md ring-1 ring-teal-400/60 font-extrabold'
                        : 'bg-[#060D11] text-slate-300 hover:text-white hover:bg-[#0E1A22] border border-[#162A33]'
                    }`}
                    title={scheme.description}
                  >
                    {scheme.label}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Active Call: <span className="text-teal-300 font-bold">{activeScheme.label}</span>
            </div>
          </div>

          {/* 3. FIELD BALL HASH */}
          <div className="lg:col-span-3 p-3 rounded-xl border border-teal-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                3. Ball Hash Spot
              </span>
              <span className="text-[10px] font-mono text-teal-400 capitalize">
                {ballHash.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'left_hash', label: 'Left Hash' },
                  { id: 'middle', label: 'Middle' },
                  { id: 'right_hash', label: 'Right Hash' },
                ] as const
              ).map((h) => {
                const isSelected = ballHash === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setBallHash(h.id)}
                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer truncate ${
                      isSelected
                        ? 'bg-teal-400 text-slate-950 shadow-md ring-1 ring-teal-400/60 font-extrabold'
                        : 'bg-[#060D11] text-slate-300 hover:text-white hover:bg-[#0E1A22] border border-[#162A33]'
                    }`}
                  >
                    {h.label}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Alignment: <span className="text-slate-200">{ballHash.replace('_', ' ').toUpperCase()}</span>
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
                checked={showOpponents}
                onChange={(e) => setShowOpponents(e.target.checked)}
                className="rounded border-slate-700 text-red-500 focus:ring-0"
              />
              <span className="text-red-300 font-bold">Opponent Personnel (11)</span>
            </label>

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
              <span>Assignment Badges</span>
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
          PART 2: FULL WIDTH PLAY ART & ANIMATION CONSOLE (Matches Offense & Defense)
         ========================================================================= */}
      <section
        id="special-teams-field-canvas"
        aria-label="Full-Width Special Teams Tactical Canvas"
        className="rounded-2xl border border-[#162A33] bg-[#070E13] p-4 lg:p-6 shadow-2xl space-y-4"
      >
        {/* Playart Canvas Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#162A33]/80">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5 text-xs">
              <Compass className="w-4 h-4" />
              Tactical Playart & 11 vs 11 Simulation
            </span>
            <span className="text-slate-300 font-mono text-xs">
              Live Call: <strong className="text-teal-300 font-extrabold">{getLiveCallDisplay()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold animate-pulse">
                <Play className="w-3 h-3 fill-emerald-300" />
                LIVE SIMULATION RUNNING ({Math.round(progress * 100)}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0A1318] border border-[#162A33] text-slate-400 font-mono text-[11px]">
                <Pause className="w-3 h-3" />
                {progress === 0 ? 'PRE-SNAP (0%)' : `SIMULATION PAUSED (${Math.round(progress * 100)}%)`}
              </span>
            )}

            <button
              type="button"
              onClick={handleTogglePlay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all cursor-pointer shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  Play
                </>
              )}
            </button>
          </div>
        </div>

        {/* FULL WIDTH SVG CANVAS CONTAINER */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/10] bg-[#050C10] rounded-xl border border-[#162A33] overflow-hidden select-none shadow-inner">
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
                id="stOppArrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#EF4444" />
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

                {/* Own Goal Posts to protect on FG Block */}
                {isFgBlock && (
                  <g>
                    <line x1="450" y1="580" x2="550" y2="580" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="450" y1="580" x2="450" y2="610" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="550" y1="580" x2="550" y2="610" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="500" y1="560" x2="500" y2="580" stroke="#F59E0B" strokeWidth="3" />
                    <text
                      x="500"
                      y="552"
                      fill="#FCD34D"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      DEFEND GOAL POSTS (OWN END ZONE)
                    </text>
                  </g>
                )}
              </g>
            ) : (
              /* COVERAGE & KICKING POV: OUR TEAM KICKING AT BOTTOM, ADVANCING UPFIELD */
              <g>
                <line
                  x1="50"
                  y1={selectedUnitId === 'kickoff' ? 520 : 390}
                  x2="950"
                  y2={selectedUnitId === 'kickoff' ? 520 : 390}
                  stroke="#2DD4BF"
                  strokeWidth="2.5"
                  opacity="0.85"
                />
                <text
                  x="70"
                  y={selectedUnitId === 'kickoff' ? 514 : 384}
                  fill="#2DD4BF"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {selectedUnitId === 'kickoff'
                    ? 'OUR KICKOFF LINE (35 YARD LINE)'
                    : 'OUR LINE OF SCRIMMAGE'}
                </text>
                <text
                  x="740"
                  y={selectedUnitId === 'kickoff' ? 514 : 384}
                  fill="#2DD4BF"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
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

                {/* Goal Posts for FG */}
                {isFgPat && (
                  <g>
                    <line x1="450" y1="60" x2="550" y2="60" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="450" y1="30" x2="450" y2="60" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="550" y1="30" x2="550" y2="60" stroke="#F59E0B" strokeWidth="3" />
                    <line x1="500" y1="60" x2="500" y2="80" stroke="#F59E0B" strokeWidth="3" />
                    <text
                      x="500"
                      y="24"
                      fill="#FCD34D"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      GOAL POSTS (TARGET)
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* Hash Mark Calibrations */}
            <line x1="333" y1="80" x2="333" y2="600" stroke="#0D1F28" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="666" y1="80" x2="666" y2="600" stroke="#0D1F28" strokeWidth="1" strokeDasharray="3 3" />

            {/* Dynamic Scheme Overlays (Wedge wall brackets, stepped drop markers, return paths) */}
            {isKickReturn && (
              <g>
                {isWheelLeft && (
                  <>
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

                    <path
                      d="M 430 560 Q 490 535, 200 460 L 165 260"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3.5"
                      strokeDasharray="6 3"
                      markerEnd="url(#stKeyArrow)"
                      opacity="0.85"
                    />
                  </>
                )}

                {isWheelRight && (
                  <>
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

                    <path
                      d="M 430 560 Q 370 535, 835 460 L 835 260"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3.5"
                      strokeDasharray="6 3"
                      markerEnd="url(#stKeyArrow)"
                      opacity="0.85"
                    />
                  </>
                )}

                {isHandsTeam && (
                  <>
                    <rect
                      x="100"
                      y="160"
                      width="800"
                      height="90"
                      rx="8"
                      fill="#F59E0B"
                      fillOpacity="0.1"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      strokeDasharray="6 3"
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
                )}
              </g>
            )}

            {/* OPPONENT PATH VECTORS (Crimson / Red dashed lines) */}
            {showPaths &&
              showOpponents &&
              activeOpponents.map((opp) => {
                const points = [
                  { x: opp.x, y: opp.y },
                  ...(opp.waypoints || []),
                  { x: opp.targetX, y: opp.targetY },
                ];
                const d = points
                  .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
                  .join(' ');
                return (
                  <g key={`opp-path-${opp.id}`}>
                    <path
                      d={d}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="1.8"
                      strokeDasharray="4 3"
                      markerEnd="url(#stOppArrow)"
                      opacity="0.6"
                    />
                  </g>
                );
              })}

            {/* OUR TEAM MOVEMENT / LANE PATH VECTORS */}
            {showPaths &&
              rawActivePlayers.map((p) => {
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

            {/* OPPONENT PLAYER CIRCLES (Animated smoothly with progress) */}
            {showOpponents &&
              activeOpponents.map((opp) => {
                const isSelected = selectedOpponentId === opp.id;
                const curPos = getSTPlayerLivePosition(
                  opp,
                  selectedUnitId,
                  activeScheme.id,
                  true,
                  progress
                );

                return (
                  <g
                    key={`opp-${opp.id}`}
                    onClick={() => {
                      setSelectedOpponentId(opp.id);
                      setInspectorMode('opponent');
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Selected Ring */}
                    {isSelected && (
                      <circle
                        cx={curPos.x}
                        cy={curPos.y}
                        r="21"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeDasharray="3 2"
                      />
                    )}

                    {/* Main Opponent Node */}
                    <circle
                      cx={curPos.x}
                      cy={curPos.y}
                      r="15"
                      fill="#7F1D1D"
                      stroke="#DC2626"
                      strokeWidth="2"
                    />

                    {/* Label (Opponent Position) */}
                    <text
                      x={curPos.x}
                      y={curPos.y + 4}
                      fill="#FFFFFF"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {opp.label}
                    </text>

                    {/* On-field Assignment Badge */}
                    {showAssignmentsOnField && (
                      <g>
                        <rect
                          x={curPos.x - 34}
                          y={curPos.y + 17}
                          width="68"
                          height="12"
                          rx="3"
                          fill="#1C0A0A"
                          stroke={isSelected ? '#EF4444' : '#7F1D1D'}
                          strokeWidth="0.8"
                        />
                        <text
                          x={curPos.x}
                          y={curPos.y + 26}
                          fill={isSelected ? '#FCA5A5' : '#E2E8F0'}
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {opp.role.slice(0, 11)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

            {/* OUR TEAM PLAYER CIRCLES (Animated smoothly with progress) */}
            {rawActivePlayers.map((p) => {
              const isSelected = selectedPlayerId === p.id;
              const isKey = p.isKickerOrKey;
              const curPos = getSTPlayerLivePosition(
                p,
                selectedUnitId,
                activeScheme.id,
                false,
                progress
              );

              return (
                <g
                  key={`our-${p.id}`}
                  onClick={() => {
                    setSelectedPlayerId(p.id);
                    setInspectorMode('our_team');
                  }}
                  className="cursor-pointer group"
                >
                  {/* Selected Ring */}
                  {isSelected && (
                    <circle
                      cx={curPos.x}
                      cy={curPos.y}
                      r="22"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="3"
                    />
                  )}

                  {/* Main Node */}
                  <circle
                    cx={curPos.x}
                    cy={curPos.y}
                    r="16"
                    fill={isKey ? '#78350F' : '#042F2E'}
                    stroke={isKey ? '#F59E0B' : '#14B8A6'}
                    strokeWidth="2"
                  />

                  {/* Label (Position ID Only - Centered) */}
                  <text
                    x={curPos.x}
                    y={curPos.y + 4}
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
                        x={curPos.x - 36}
                        y={curPos.y + 19}
                        width="72"
                        height="13"
                        rx="3"
                        fill="#061219"
                        stroke={isSelected ? '#38BDF8' : '#162A33'}
                        strokeWidth="0.8"
                      />
                      <text
                        x={curPos.x}
                        y={curPos.y + 28}
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
                        x={curPos.x - 70}
                        y={curPos.y - 34}
                        width="140"
                        height="18"
                        rx="4"
                        fill="#0A1C24"
                        stroke="#38BDF8"
                        strokeWidth="1"
                      />
                      <text
                        x={curPos.x}
                        y={curPos.y - 21}
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

            {/* ANIMATED FOOTBALL TRAJECTORY (Shadow + Flying Leather Football) */}
            <g>
              {/* Ground Shadow */}
              <ellipse
                cx={currentBall.x}
                cy={currentBall.y}
                rx={Math.max(3, 7 + currentBall.height * 0.08)}
                ry={Math.max(2, 4 + currentBall.height * 0.04)}
                fill="#000000"
                opacity={Math.max(0.2, 0.65 - currentBall.height * 0.005)}
              />

              {/* Elevated Football */}
              <g
                transform={`translate(${currentBall.x}, ${
                  currentBall.y - currentBall.height
                }) rotate(-18)`}
              >
                {/* Glow when airborne */}
                {currentBall.height > 8 && (
                  <ellipse cx="0" cy="0" rx="13" ry="9" fill="#F59E0B" opacity="0.3" />
                )}

                {/* Leather Football */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="10"
                  ry="6.5"
                  fill="#78350F"
                  stroke="#B45309"
                  strokeWidth="1.2"
                />

                {/* White Stripe Rings */}
                <line x1="-5" y1="-5.5" x2="-5" y2="5.5" stroke="#FFFFFF" strokeWidth="0.9" opacity="0.9" />
                <line x1="5" y1="-5.5" x2="5" y2="5.5" stroke="#FFFFFF" strokeWidth="0.9" opacity="0.9" />

                {/* Laces */}
                <line x1="-3" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeWidth="1" />
                <line x1="-2" y1="-2" x2="-2" y2="2" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="0" y1="-2" x2="0" y2="2" stroke="#FFFFFF" strokeWidth="0.8" />
                <line x1="2" y1="-2" x2="2" y2="2" stroke="#FFFFFF" strokeWidth="0.8" />
              </g>
            </g>
          </svg>

          {/* Big Center Overlay Button when Stopped at Pre-Snap (Exact match to Offense Tab) */}
          {!isPlaying && progress === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="pointer-events-auto px-5 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 hover:bg-teal-300 transition-all transform hover:scale-105 cursor-pointer border border-teal-200"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Special Teams 11 vs 11 Play Simulation</span>
              </button>
            </div>
          )}

          {/* Live Action Pill Bottom Left */}
          <div className="absolute bottom-3 left-3 bg-[#061219]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#162A33] text-[11px] font-mono text-slate-300 flex items-center gap-2">
            <span>Unit: <strong className="text-white">{activeUnit.name}</strong></span>
            <span className="text-slate-500">·</span>
            <span>Call: <strong className="text-teal-300">{activeScheme.label}</strong></span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-300 font-bold">🏈 {currentBall.phaseLabel}</span>
          </div>
        </div>

        {/* INTERACTIVE PLAYBACK CONSOLE BAR (Full Width, directly below canvas) */}
        <div className="p-4 rounded-xl border border-[#162A33] bg-[#0A1318] space-y-3">
          {/* Upper Action Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#14262E]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shadow-md shadow-teal-500/20"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause Simulation
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    {progress > 0 && progress < 1 ? 'Resume Simulation' : 'Run Play Simulation'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStepBackward}
                title="Step backward 15%"
                className="inline-flex items-center px-2.5 py-2 text-xs font-medium text-slate-200 bg-[#101F26] hover:bg-[#162B35] border border-[#1D3643] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                -15%
              </button>

              <button
                type="button"
                onClick={handleStepForward}
                title="Step forward 15%"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#101F26] hover:bg-[#162B35] border border-[#1D3643] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <StepForward className="w-3.5 h-3.5" />
                +15%
              </button>

              <button
                type="button"
                onClick={handleResetPreSnap}
                title="Reset to pre-snap alignment (0%)"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-[#0E1A20] hover:bg-[#162832] border border-[#162A33] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Pre-Snap (0%)
              </button>

              <button
                type="button"
                onClick={() => setIsLooping((p) => !p)}
                title="Toggle continuous looping animation"
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                  isLooping
                    ? 'border-teal-400 bg-teal-950/60 text-teal-300'
                    : 'border-[#162A33] bg-[#0E1A20] text-slate-400 hover:text-white'
                }`}
              >
                🔁 Loop {isLooping ? 'ON' : 'OFF'}
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 p-1 bg-[#060D11] border border-[#162A33] rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(0.5)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                    playbackSpeed === 0.5
                      ? 'bg-[#162B35] text-teal-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  0.5x Teach
                </button>
                <button
                  type="button"
                  onClick={() => setPlaybackSpeed(1)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                    playbackSpeed === 1
                      ? 'bg-[#162B35] text-teal-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1.0x Game
                </button>
              </div>
            </div>

            {/* Key Phase Quick Jumpers */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1">
                Jump:
              </span>
              {[
                { label: '0% Pre-Snap', val: 0.0 },
                { label: '25% Kick/Snap', val: 0.25 },
                { label: '55% Flight/Arc', val: 0.55 },
                { label: '75% Catch/Wedge', val: 0.75 },
                { label: '100% Finish', val: 1.0 },
              ].map((phase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setProgress(phase.val);
                  }}
                  className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-[#070F14] text-slate-400 hover:text-teal-300 hover:border-teal-500/40 border border-[#162A33] transition-colors cursor-pointer whitespace-nowrap"
                >
                  {phase.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Progress Range Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span>Action:</span>
                <strong className="text-amber-300">{currentBall.phaseLabel}</strong>
              </span>
              <span className="text-teal-300 font-bold">
                Simulation Progress: {Math.round(progress * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={progress}
              onChange={(e) => {
                setIsPlaying(false);
                setProgress(parseFloat(e.target.value));
              }}
              className="w-full accent-teal-400 cursor-pointer h-2 bg-[#14262E] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono px-0.5">
              <span>0% Pre-Snap</span>
              <span>25% Strike/Kick</span>
              <span>50% Airborne Trajectory</span>
              <span>75% Wedge/Return</span>
              <span>100% Whistle</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PART 3: POSITIONAL AND TACTICAL EXPLANATIONS BELOW (Matches Offense & Defense)
         ========================================================================= */}
      {/* 3A. TWO-COLUMN GRID: SELECTED PLAYER INSPECTOR (LEFT) + SCHEME DOCTRINE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Player Inspector */}
        <div className="lg:col-span-6 rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#162A33] pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInspectorMode('our_team')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorMode === 'our_team'
                    ? 'bg-teal-400 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-[#09151D] text-slate-400 hover:text-white border border-[#162A33]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                Our Team Player
              </button>

              <button
                type="button"
                onClick={() => setInspectorMode('opponent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inspectorMode === 'opponent'
                    ? 'bg-red-500 text-white font-extrabold shadow-sm'
                    : 'bg-[#09151D] text-slate-400 hover:text-white border border-[#162A33]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Opponent Player
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {inspectorMode === 'our_team' ? activeUnit.shortName : 'Opponent Unit'}
            </span>
          </div>

          {inspectorMode === 'our_team' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#09151D] border border-teal-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono font-extrabold text-teal-300 text-base">
                    {selectedPlayer.label}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base font-display">
                      {selectedPlayer.name} ({selectedPlayer.label})
                    </h3>
                    <p className="text-xs text-teal-400 font-mono">{selectedPlayer.role}</p>
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
                <div className="p-3.5 rounded-xl bg-[#060E13] border border-[#162A33] space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                    Core Positional Assignment ({activeScheme.label})
                  </span>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {selectedPlayer.responsibility}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060E13] border border-[#162A33] space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-teal-400 block font-semibold">
                    Technique & Coaching Cue
                  </span>
                  <p className="text-teal-200 font-mono leading-relaxed">
                    &ldquo;{selectedPlayer.coachingCue}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#180A0A] border border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center font-mono font-extrabold text-red-300 text-base">
                    {selectedOpponent.label}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base font-display">
                      {selectedOpponent.name} ({selectedOpponent.label})
                    </h3>
                    <p className="text-xs text-red-400 font-mono">{selectedOpponent.role}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 text-xs font-mono font-bold border border-red-700/50">
                  Opponent Matchup
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0E0606] border border-red-900/40 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                    Opponent Assignment
                  </span>
                  <p className="text-slate-200 leading-relaxed font-sans">
                    {selectedOpponent.responsibility || 'Execute assigned special teams coverage/protection responsibility.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E0606] border border-red-900/40 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-red-400 block font-semibold">
                    Opposition Cue
                  </span>
                  <p className="text-red-200 font-mono leading-relaxed">
                    &ldquo;{selectedOpponent.coachingCue || 'Attack assignment with relentless speed.'}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Scheme Doctrine Breakdown */}
        <div className="lg:col-span-6 rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
            <div className="font-bold text-white text-sm font-display flex items-center gap-2">
              <Flag className="w-4 h-4 text-teal-400" />
              <span>{activeScheme.label} Tactical Doctrine & Directives</span>
            </div>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
              {activeUnit.shortName}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#09151D] border border-teal-500/20 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
              Scheme Directive:
            </span>
            <p className="text-slate-200 text-xs leading-relaxed font-sans">
              {activeScheme.description}
            </p>
          </div>

          {/* KOR Specific Deep Doctrine */}
          {isKickReturn && (
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
                </>
              )}

              {isWheelRight && (
                <>
                  <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                    <span className="font-bold text-teal-300 font-mono text-[11px] block">
                      1. Front 5 Stepped Drops & Horizontal Scrape (Right Sideline)
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Front 5 drop to stepped depths along the right boundary (FL5: 25 yds, FL4: 20 yds, FL3: 15 yds, FL2: 10 yds, FL1: 5 yds) reaching 10 yards from the sideline, then scrape horizontally inside.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1">
                    <span className="font-bold text-amber-300 font-mono text-[11px] block">
                      2. 4-Man Side-by-Side Wedge Wall (W3 · FB · W2 · W1)
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      W3 anchors the right boundary with Lead Fullback, W2, and W1 locking shoulder-to-shoulder ahead of the returner.
                    </p>
                  </div>
                </>
              )}

              {isHandsTeam && (
                <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1.5">
                  <span className="font-bold text-amber-300 font-mono text-[11px] block">
                    Hands Team Onside Recovery Doctrine
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    All 11 players advance to the front recovery zone. The Front 8 cover the 45-yard line shoulder-to-shoulder with 3 deep safety valves at the 35. See ball, two hands on the football, collapse to the turf.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Punt Coverage Doctrine */}
          {isPuntCoverage && (
            <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] text-xs space-y-1">
              <span className="font-bold text-teal-300 font-mono text-[11px] block">
                Punt Protection & Lane Integrity
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Protection first, coverage second. The 3 Personal Protectors step up at 7 yards depth to seal A and B-gap rushers. Gunners defeat press jammers and secure outside containment.
              </p>
            </div>
          )}

          {/* FG / PAT Doctrine */}
          {isFgPat && (
            <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] text-xs space-y-1">
              <span className="font-bold text-amber-300 font-mono text-[11px] block">
                Operation Speed: Under 1.3 Seconds
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Snap to kick must happen in under 1.3 seconds. Linemen execute inside gap lock (foot-to-foot) with no retreat. Wings step to deflect perimeter edge blitzers around the launch pocket.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3B. FULL-WIDTH 11-PLAYER POSITIONAL ASSIGNMENT & ROSTER TABLE (Matches Offense & Defense Tab Matrices) */}
      <section
        aria-label="11-Player Positional Assignment Matrix"
        className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#162A33]/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-teal-400 uppercase tracking-wider font-semibold">
                Positional Assignment Matrix
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{activeUnit.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 font-display tracking-tight flex items-center gap-2">
              <span>Roster & Assignments for</span>
              <span className="text-teal-400">{activeScheme.label}</span>
            </h2>
          </div>

          {/* Quick Roster Filter Button (Our Team 11 vs Opponent 11) */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 text-[11px] mr-1">View Matrix:</span>
            <button
              type="button"
              onClick={() => setInspectorMode('our_team')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                inspectorMode === 'our_team'
                  ? 'bg-teal-400 text-slate-950 shadow-sm'
                  : 'bg-[#0B151C] text-slate-400 hover:text-white border border-[#162A33]'
              }`}
            >
              Our Team (11)
            </button>
            <button
              type="button"
              onClick={() => setInspectorMode('opponent')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                inspectorMode === 'opponent'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-[#0B151C] text-slate-400 hover:text-white border border-[#162A33]'
              }`}
            >
              Opponent Unit (11)
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-[#162A33] bg-[#0A1318]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#162A33] bg-[#060D11] text-slate-300 font-mono">
                <th className="py-3 px-4 font-semibold">Pos</th>
                <th className="py-3 px-4 font-semibold">Player Name</th>
                <th className="py-3 px-4 font-semibold">Core Role</th>
                <th className="py-3 px-4 font-semibold text-teal-300">
                  Assignment for {activeScheme.label}
                </th>
                <th className="py-3 px-4 font-semibold text-amber-300">Coaching Cue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162A33]/70">
              {inspectorMode === 'our_team'
                ? rawActivePlayers.map((player) => {
                    const isSel = selectedPlayerId === player.id;
                    const isKey = player.isKickerOrKey;

                    return (
                      <tr
                        key={player.id}
                        onClick={() => setSelectedPlayerId(player.id)}
                        className={`cursor-pointer transition-colors ${
                          isSel ? 'bg-teal-950/40 text-white' : 'hover:bg-[#0E1A20]'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              isKey
                                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                                : 'bg-teal-500/15 border border-teal-500/30 text-teal-300'
                            }`}
                          >
                            {player.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                          {player.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                          {player.role}
                        </td>
                        <td className="py-3 px-4 text-slate-100 font-medium leading-relaxed max-w-md">
                          {player.responsibility}
                        </td>
                        <td className="py-3 px-4 text-teal-300 font-mono text-[11px] italic max-w-xs">
                          &ldquo;{player.coachingCue}&rdquo;
                        </td>
                      </tr>
                    );
                  })
                : activeOpponents.map((opp) => {
                    const isSel = selectedOpponentId === opp.id;

                    return (
                      <tr
                        key={opp.id}
                        onClick={() => setSelectedOpponentId(opp.id)}
                        className={`cursor-pointer transition-colors ${
                          isSel ? 'bg-red-950/40 text-white' : 'hover:bg-[#150A0A]'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-300">
                            {opp.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                          {opp.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                          {opp.role}
                        </td>
                        <td className="py-3 px-4 text-slate-100 font-medium leading-relaxed max-w-md">
                          {opp.responsibility || 'Execute assigned special teams coverage/protection responsibility.'}
                        </td>
                        <td className="py-3 px-4 text-red-300 font-mono text-[11px] italic max-w-xs">
                          &ldquo;{opp.coachingCue || 'Attack assignment with relentless speed.'}&rdquo;
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3C. UNIT RULES & DRILLS (Execution Non-Negotiables) */}
      <section
        aria-label="Unit Execution Rules & Drills"
        className="rounded-2xl border border-[#162A33] bg-[#070E13] p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
          <div className="font-bold text-white text-sm font-display flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            Execution Rules & Non-Negotiables ({activeUnit.shortName})
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {activeUnit.rulesAndDrills.map((rd, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#091318] border border-[#162A33] space-y-1.5"
            >
              <div className="font-bold text-teal-300 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                {rd.title}
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{rd.rule}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
