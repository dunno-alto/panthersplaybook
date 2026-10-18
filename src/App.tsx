import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  Info,
  Maximize2,
  PenTool,
  Printer,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  DEFENSIVE_FRONTS,
  DefensiveFrontId,
  DiveKeyBehavior,
  EleventhPlayerMode,
  PitchKeyBehavior,
  Point,
  VEER_PLAYBOOK,
  XPlayerMode,
  getBaseOffensiveAlignment,
} from './data/veerPlaybookData';
import { TacticalFieldCanvas } from './components/TacticalFieldCanvas';
import { PlaySetupConsole } from './components/PlaySetupConsole';
import { WristbandModal } from './components/WristbandModal';
import { DrillsSection } from './components/DrillsSection';

export default function App() {
  const [selectedPlayId, setSelectedPlayId] = useState<string>('42-inside-veer');
  const [frontId, setFrontId] = useState<DefensiveFrontId>('5-3');
  const [diveBehavior, setDiveBehavior] = useState<DiveKeyBehavior>('squeeze');
  const [pitchBehavior, setPitchBehavior] = useState<PitchKeyBehavior>('commit_qb');
  const [eleventhMode, setEleventhMode] = useState<EleventhPlayerMode>('wide_z');
  const [xMode, setXMode] = useState<XPlayerMode>('tight_x');

  // Animation & playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);

  // Field appearance & chalkboard
  const [fieldTheme, setFieldTheme] = useState<'night_turf' | 'chalkboard' | 'high_contrast'>('night_turf');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('LH');
  const [showGapLabels, setShowGapLabels] = useState<boolean>(true);
  const [showBlockingAngles, setShowBlockingAngles] = useState<boolean>(true);
  const [chalkboardMode, setChalkboardMode] = useState<boolean>(false);
  const [customOffsets, setCustomOffsets] = useState<Record<string, Point>>({});
  const [customArrows, setCustomArrows] = useState<
    { id: string; start: Point; end: Point; color: string }[]
  >([]);
  const [isWristbandOpen, setIsWristbandOpen] = useState<boolean>(false);

  const activePlay =
    VEER_PLAYBOOK.find((p) => p.id === selectedPlayId) || VEER_PLAYBOOK[0];
  const activeFront = DEFENSIVE_FRONTS[frontId];
  const baseOffense = getBaseOffensiveAlignment(eleventhMode, xMode);
  const simResult = activePlay.getOffensivePaths(
    frontId,
    diveBehavior,
    pitchBehavior,
    eleventhMode,
    xMode
  );

  // Smooth 60fps animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const deltaProgress = (dt * playbackSpeed) / 3.0;

      setProgress((prev) => {
        const next = prev + deltaProgress;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed]);

  const handleSelectPlay = (playId: string) => {
    setSelectedPlayId(playId);
    setIsPlaying(false);
    setProgress(0);
    if (playId === '24-power') {
      setSelectedPlayerId('LG');
    } else if (playId === '324-power-pass') {
      setSelectedPlayerId('YTE');
    } else {
      setSelectedPlayerId('LH');
    }
  };

  const handleJumpToPhase = (phaseRange: [number, number]) => {
    setIsPlaying(false);
    setProgress(phaseRange[1]);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setProgress((prev) => (prev >= 1 ? 0 : Math.min(1, Number((prev + 0.25).toFixed(2)))));
  };

  const currentPhase =
    activePlay.coachingPhases.find(
      (ph) => progress >= ph.timeRange[0] && progress <= ph.timeRange[1]
    ) || activePlay.coachingPhases[activePlay.coachingPhases.length - 1];

  const selectedOffensiveRule =
    activePlay.positionRules[selectedPlayerId] || activePlay.positionRules.LH;
  const selectedDefensivePlayer = activeFront.players.find(
    (d) => d.id === selectedPlayerId
  );

  return (
    <div className="min-h-screen bg-[#05090C] text-[#F8FAFC] flex flex-col selection:bg-teal-500/30 selection:text-white">
      {/* Top Bar Header Contract */}
      <header className="flex items-center justify-between gap-6 px-6 py-4 border-b border-[#162A33] bg-[#060D11]/95 sticky top-0 z-40 no-print backdrop-blur-md">
        {/* Zone 1: Wordmark */}
        <a
          href="#playbook"
          className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display flex items-center gap-2"
        >
          <span className="text-teal-400">Playbook Studio</span>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            · Split Back Veer
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#playbook"
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Playbook
          </a>
          <a
            href="#reads"
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Reads
          </a>
          <a
            href="#positions"
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Positions
          </a>
          <a
            href="#defense"
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Defense
          </a>
          <a
            href="#drills"
            className="hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Drills
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsWristbandOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Wristband Card
          </button>
        </div>
      </header>

      {/* Main Workspace (1440px desktop baseline) */}
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8 flex-1">
        {/* SECTION 1: CONSOLIDATED PLAY SETUP CONSOLE (All player/coach inputs in one area!) */}
        <PlaySetupConsole
          selectedPlay={activePlay}
          onSelectPlay={handleSelectPlay}
          eleventhMode={eleventhMode}
          onChangeEleventhMode={setEleventhMode}
          xMode={xMode}
          onChangeXMode={setXMode}
          frontId={frontId}
          onChangeFrontId={setFrontId}
          diveBehavior={diveBehavior}
          onChangeDiveBehavior={(behavior) => {
            setDiveBehavior(behavior);
            setProgress(0.65);
          }}
          pitchBehavior={pitchBehavior}
          onChangePitchBehavior={(behavior) => {
            setPitchBehavior(behavior);
            setProgress(0.65);
          }}
          isPlaying={isPlaying}
          onTogglePlay={() => {
            if (progress >= 1) setProgress(0);
            setIsPlaying((prev) => !prev);
          }}
          progress={progress}
          onResetPreSnap={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
          onStepForward={handleStepForward}
          playbackSpeed={playbackSpeed}
          onChangePlaybackSpeed={setPlaybackSpeed}
          currentPhaseNumber={currentPhase.phase}
          onJumpToPhase={handleJumpToPhase}
          showGapLabels={showGapLabels}
          onToggleGapLabels={() => setShowGapLabels((v) => !v)}
          showBlockingAngles={showBlockingAngles}
          onToggleBlockingAngles={() => setShowBlockingAngles((v) => !v)}
          chalkboardMode={chalkboardMode}
          onToggleChalkboardMode={() => setChalkboardMode((v) => !v)}
          onClearChalkboard={() => {
            setCustomArrows([]);
            setCustomOffsets({});
          }}
          hasChalkboardDrawings={
            customArrows.length > 0 || Object.keys(customOffsets).length > 0
          }
        />

        {/* SECTION 2: TACTICAL PLAY EXECUTION VIEW (High-contrast field, timeline scrubber, and phase guide) */}
        <section
          id="playbook"
          aria-label="Tactical Play Execution View"
          className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-5"
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#162A33]/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-teal-400 font-bold">{activePlay.code}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300">{activePlay.targetGap}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-amber-400 font-semibold">vs {activeFront.shortLabel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 font-display">
                {activePlay.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl leading-relaxed">
                {activePlay.summary}
              </p>
            </div>

            {/* Quick Field Status Badge */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0B151C] border border-[#162A33] text-xs font-mono shrink-0">
              <span className="text-slate-400">Ball Carrier:</span>
              <span className="font-bold text-teal-300">
                {simResult.ballCarrierSequence.finalCarrier === 'QB'
                  ? '1 (Quarterback)'
                  : simResult.ballCarrierSequence.finalCarrier === 'LH'
                  ? '3 (Left Halfback)'
                  : simResult.ballCarrierSequence.finalCarrier === 'RH'
                  ? '2 (Right Halfback)'
                  : 'Y (Tight End)'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 font-semibold font-mono-tabular">
                {simResult.ballCarrierSequence.expectedYards}
              </span>
            </div>
          </div>

          {/* Interactive SVG Chalkboard Canvas */}
          <div className="w-full">
            <TacticalFieldCanvas
              play={activePlay}
              frontId={frontId}
              diveBehavior={diveBehavior}
              pitchBehavior={pitchBehavior}
              eleventhMode={eleventhMode}
              xMode={xMode}
              progress={progress}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
              showGapLabels={showGapLabels}
              showBlockingAngles={showBlockingAngles}
              chalkboardMode={chalkboardMode}
              customOffsets={customOffsets}
              onUpdateCustomOffset={(id, offset) =>
                setCustomOffsets((prev) => ({ ...prev, [id]: offset }))
              }
              customArrows={customArrows}
              onAddCustomArrow={(arrow) =>
                setCustomArrows((prev) => [...prev, arrow])
              }
              fieldTheme={fieldTheme}
              onChangeFieldTheme={setFieldTheme}
            />
          </div>

          {/* Timeline Range Scrubber & Active Coaching Phase Callout */}
          <div className="p-4 rounded-xl border border-[#162A33] bg-[#0A1318] space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="field-timeline"
                  className="font-medium text-slate-300 flex items-center gap-2"
                >
                  <span>Snap-to-Whistle Timeline Progression</span>
                  <span className="text-[11px] text-teal-400 font-mono">
                    (Drag scrubber to inspect frame-by-frame)
                  </span>
                </label>
                <span className="font-mono-tabular text-teal-400 font-semibold">
                  {(progress * 2.8).toFixed(2)}s / 2.80s ({Math.round(progress * 100)}%)
                </span>
              </div>
              <input
                id="field-timeline"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={progress}
                onChange={(e) => {
                  setIsPlaying(false);
                  setProgress(parseFloat(e.target.value));
                }}
                className="w-full h-2.5 bg-[#060D11] rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* 4 Coaching Phases Step Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
              {activePlay.coachingPhases.map((ph) => {
                const isCurrent = currentPhase.phase === ph.phase;
                return (
                  <button
                    key={ph.phase}
                    type="button"
                    onClick={() => handleJumpToPhase(ph.timeRange)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-teal-400 bg-[#0E222A] text-white shadow-md ring-1 ring-teal-400/50'
                        : 'border-[#162A33] bg-[#060D11]/80 hover:border-[#20404E] hover:bg-[#0A161E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono-tabular text-teal-400 font-bold">
                        Phase 0{ph.phase}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(ph.timeRange[0] * 2.8).toFixed(1)}s - {(ph.timeRange[1] * 2.8).toFixed(1)}s
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white mt-1 line-clamp-1">
                      {ph.title.replace(/^Phase \d:\s*/, '')}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Live Phase Detail Card */}
            <div className="p-3.5 rounded-lg bg-[#060D11] border border-[#162A33] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-teal-400 mr-2 font-mono">
                  {currentPhase.title}:
                </span>
                <span>{currentPhase.detail}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                Click any phase card above to jump
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: POSITIONS & COACHING CUES (One Unified Frame for Coaching Cues & Common Errors) */}
        <section
          id="positions"
          aria-label="Positions Section"
          className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#162A33]/80">
            <div>
              <p className="text-xs text-teal-400 font-mono uppercase tracking-wider font-semibold">
                Positions · Splits, Assignments & Coaching Cues
              </p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1 font-display">
                Position Technique & Assignment Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Select any offensive or defensive position to inspect footwork, aiming points, front-by-front blocking rules, and common errors.
              </p>
            </div>

            {/* 11 Offensive Positions Horizontal Selector Strip */}
            <div className="flex flex-wrap items-center gap-1.5">
              {Object.entries(baseOffense).map(([pid, meta]) => {
                const active = selectedPlayerId === pid;
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => setSelectedPlayerId(pid)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-teal-400 text-slate-950 shadow-sm font-extrabold ring-1 ring-teal-300'
                        : 'bg-[#0A1318] text-slate-300 border border-[#162A33] hover:border-[#20404E] hover:text-white'
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Position Details & Unified Coaching Card */}
          {selectedDefensivePlayer ? (
            <div className="p-6 rounded-xl border border-[#162A33] bg-[#0A1318] grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-rose-400 font-mono-tabular font-semibold">
                  DEFENSIVE POSITION · {selectedDefensivePlayer.technique}
                </p>
                <h3 className="text-2xl font-bold text-white mt-1 font-display">
                  {selectedDefensivePlayer.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {selectedDefensivePlayer.isDiveKey
                    ? 'Accounted for as #1 Dive Key on Inside Veer, or down-blocked on Outside Veer and Power.'
                    : selectedDefensivePlayer.isPitchKey
                    ? 'Accounted for as #2 Pitch Key on Inside Veer, or #1 Dive Key on Outside Veer, or kickout target on Power.'
                    : 'Interior or second-level defender accounted for by offensive line combination blocks and tight end releases.'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#060D11] border border-[#162A33]">
                <p className="text-xs font-semibold text-teal-400">Offensive Scheme vs This Defender</p>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {selectedDefensivePlayer.isDiveKey
                    ? 'On Inside Veer: read unblocked by 1. On Outside Veer & Power: washed inside by RT and Y down blocks.'
                    : selectedDefensivePlayer.isPitchKey
                    ? 'On Outside Veer: read unblocked by 1 as #1. On Power: kicked out by pulling LG. On Inside Veer: read as #2 Pitch Key.'
                    : 'Double-teamed by Center/Guard or sealed at the second level by Veer-releasing Tackle or lead-blocking Halfback.'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#060D11] border border-[#162A33] flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-sky-400">Switch to Offensive Position</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select 1 (Quarterback), Left Guard (LG), or 3 (Left Halfback) to review coaching cues.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlayerId('QB')}
                  className="mt-3 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer self-start"
                >
                  Inspect 1 (Quarterback)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-[#162A33] bg-[#0A1318] grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Position Overview (4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-teal-400 font-mono-tabular">
                  <span>Position: {selectedOffensiveRule.label}</span>
                  <span>·</span>
                  <span>Split: {selectedOffensiveRule.split}</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  {selectedOffensiveRule.fullName}
                </h3>
                <div className="space-y-2 text-xs text-slate-300 pt-1">
                  <p>
                    <span className="text-slate-400 font-semibold">Pre-Snap Stance:</span>{' '}
                    {selectedOffensiveRule.stance}
                  </p>
                  <p>
                    <span className="text-slate-400 font-semibold">Landmark / Aiming Point:</span>{' '}
                    <span className="text-teal-300 font-medium">{selectedOffensiveRule.aimingPoint}</span>
                  </p>
                  <p>
                    <span className="text-slate-400 font-semibold">First Two Steps:</span>{' '}
                    {selectedOffensiveRule.footwork}
                  </p>
                </div>
              </div>

              {/* Assignment across Fronts (4 cols) */}
              <div className="lg:col-span-4 p-4 rounded-lg bg-[#060D11] border border-[#162A33] space-y-3">
                <p className="text-xs font-semibold text-teal-400">
                  Assignment for {activePlay.code} vs {activeFront.name}
                </p>
                <p className="text-sm font-medium text-white leading-relaxed">
                  {selectedOffensiveRule.assignmentsByFront[frontId]}
                </p>
                <div className="pt-2 border-t border-[#162A33]">
                  <p className="text-[11px] text-slate-400">All Fronts Matrix for {selectedOffensiveRule.label}:</p>
                  <div className="mt-1.5 space-y-1 text-xs font-mono-tabular">
                    {(['5-3', '4-4', '4-3', '3-4', '6-2', '5-2'] as DefensiveFrontId[]).map((fKey) => (
                      <div
                        key={fKey}
                        className={`flex items-baseline gap-2 ${
                          fKey === frontId ? 'text-teal-300 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <span className="w-10 shrink-0">{fKey}:</span>
                        <span className="truncate">{selectedOffensiveRule.assignmentsByFront[fKey]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SINGLE UNIFIED COACHING FRAME (4 cols) - HIGHLIGHTS COMMON ERRORS */}
              <div className="lg:col-span-4 p-4 rounded-lg bg-[#060D11] border border-[#162A33] flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Coaching Cue</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-2 leading-relaxed">
                    "{selectedOffensiveRule.coachingCue}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#162A33]/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Common Errors & Fix</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedOffensiveRule.commonErrorsFix}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: MASTER DEFENSIVE FRONT MATRIX */}
        <section
          id="defense"
          aria-label="Defense Section"
          className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-[#162A33]/80">
            <div>
              <p className="text-xs text-teal-400 font-mono uppercase tracking-wider font-semibold">
                Defense · Master Assignment Sheet ({activePlay.code})
              </p>
              <h2 className="text-2xl font-bold text-white mt-0.5 font-display">
                Blocking & Movement Rules Across All 6 Defenses
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Click any row to inspect that position
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#162A33] bg-[#0A1318]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#162A33] bg-[#060D11] text-slate-300">
                  <th className="py-3 px-4 font-semibold">Position</th>
                  <th className="py-3 px-4 font-semibold">Split</th>
                  <th className="py-3 px-4 font-semibold">vs 5-3 Bear (Odd)</th>
                  <th className="py-3 px-4 font-semibold">vs 4-4 Stack (Even)</th>
                  <th className="py-3 px-4 font-semibold">vs 4-3 Base</th>
                  <th className="py-3 px-4 font-semibold">vs 3-4 Okie</th>
                  <th className="py-3 px-4 font-semibold">vs 6-2 Wide Tackle</th>
                  <th className="py-3 px-4 font-semibold">vs 5-2 Gap-8 Monster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162A33]/70">
                {['XTE', 'LT', 'LG', 'C', 'RG', 'RT', 'YTE', 'QB', 'LH', 'RH', 'W'].map((pid) => {
                  const rule = activePlay.positionRules[pid];
                  if (!rule) return null;
                  const isSel = selectedPlayerId === pid;
                  return (
                    <tr
                      key={pid}
                      onClick={() => setSelectedPlayerId(pid)}
                      className={`cursor-pointer transition-colors ${
                        isSel ? 'bg-teal-950/40 text-white' : 'hover:bg-[#0E1A20]'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono-tabular font-bold text-teal-400 whitespace-nowrap">
                        {rule.label} — {rule.fullName.split('(')[0].trim()}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-slate-300 whitespace-nowrap">
                        {rule.split}
                      </td>
                      <td className="py-3 px-4 text-slate-200">{rule.assignmentsByFront['5-3']}</td>
                      <td className="py-3 px-4 text-slate-200">{rule.assignmentsByFront['4-4']}</td>
                      <td className="py-3 px-4 text-slate-200">{rule.assignmentsByFront['4-3']}</td>
                      <td className="py-3 px-4 text-slate-200">{rule.assignmentsByFront['3-4']}</td>
                      <td className="py-3 px-4 text-slate-200">{rule.assignmentsByFront['6-2']}</td>
                      <td className="py-3 px-4 text-slate-200">{rule.assignmentsByFront['5-2']}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 5: DRILLS & PRACTICE PROGRESSION (Beginner, Intermediate, Advanced) */}
        <DrillsSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#162A33] py-6 px-6 text-xs text-slate-400 no-print bg-[#04080B]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Playbook Studio -- Split Back Veer · Team Colors: Black & Teal</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsWristbandOpen(true)}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Printable Wristband Sheet
            </button>
            <span aria-hidden="true">·</span>
            <a href="#play-setup" className="hover:text-teal-400 transition-colors">
              Play Setup Console
            </a>
            <span aria-hidden="true">·</span>
            <a href="#playbook" className="hover:text-teal-400 transition-colors">
              Back to Top
            </a>
          </div>
        </div>
      </footer>

      {/* Printable Wristband & Call Sheet Modal */}
      <WristbandModal
        isOpen={isWristbandOpen}
        onClose={() => setIsWristbandOpen(false)}
      />
    </div>
  );
}
