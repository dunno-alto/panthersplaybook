import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  FastForward,
  Layers,
  Pause,
  PenTool,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  StepForward,
  Target,
  Zap,
} from 'lucide-react';
import {
  DEFENSIVE_FRONTS,
  DefensiveFrontId,
  DiveKeyBehavior,
  EleventhPlayerMode,
  PitchKeyBehavior,
  PlayDefinition,
  VEER_PLAYBOOK,
  XPlayerMode,
} from '../data/veerPlaybookData';

interface PlaySetupConsoleProps {
  selectedPlay: PlayDefinition;
  onSelectPlay: (playId: PlayDefinition['id']) => void;
  eleventhMode: EleventhPlayerMode;
  onChangeEleventhMode: (mode: EleventhPlayerMode) => void;
  xMode: XPlayerMode;
  onChangeXMode: (mode: XPlayerMode) => void;
  frontId: DefensiveFrontId;
  onChangeFrontId: (front: DefensiveFrontId) => void;
  diveBehavior: DiveKeyBehavior;
  onChangeDiveBehavior: (behavior: DiveKeyBehavior) => void;
  pitchBehavior: PitchKeyBehavior;
  onChangePitchBehavior: (behavior: PitchKeyBehavior) => void;
  // Simulation playback controls
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  onResetPreSnap: () => void;
  onStepForward: () => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
  currentPhaseNumber: number;
  onJumpToPhase: (phaseRange: [number, number]) => void;
  // Visual toggles
  showGapLabels: boolean;
  onToggleGapLabels: () => void;
  showBlockingAngles: boolean;
  onToggleBlockingAngles: () => void;
  chalkboardMode: boolean;
  onToggleChalkboardMode: () => void;
  onClearChalkboard: () => void;
  hasChalkboardDrawings: boolean;
}

export const PlaySetupConsole: React.FC<PlaySetupConsoleProps> = ({
  selectedPlay,
  onSelectPlay,
  eleventhMode,
  onChangeEleventhMode,
  xMode,
  onChangeXMode,
  frontId,
  onChangeFrontId,
  diveBehavior,
  onChangeDiveBehavior,
  pitchBehavior,
  onChangePitchBehavior,
  isPlaying,
  onTogglePlay,
  progress,
  onResetPreSnap,
  onStepForward,
  playbackSpeed,
  onChangePlaybackSpeed,
  currentPhaseNumber,
  onJumpToPhase,
  showGapLabels,
  onToggleGapLabels,
  showBlockingAngles,
  onToggleBlockingAngles,
  chalkboardMode,
  onToggleChalkboardMode,
  onClearChalkboard,
  hasChalkboardDrawings,
}) => {
  const activeFront = DEFENSIVE_FRONTS[frontId];
  const isOptionPlay =
    selectedPlay.playType === 'Triple Option' ||
    selectedPlay.playType === 'Misdirection Option';
  const isPower = selectedPlay.id === '24-power';
  const isPowerPass = selectedPlay.id === '324-power-pass';

  // Compute live read outcome
  const simResult = selectedPlay.getOffensivePaths(
    frontId,
    diveBehavior,
    pitchBehavior,
    eleventhMode,
    xMode
  );

  const formationName =
    xMode === 'tight_x' && eleventhMode === 'wing_z'
      ? 'Double Tight'
      : xMode === 'wide_x' && eleventhMode === 'wide_z'
      ? 'Double Wide (Spread)'
      : xMode === 'wide_x'
      ? 'Wide X / Wing Z'
      : 'Tight X / Wide Z';

  return (
    <section
      id="play-setup"
      aria-label="Play Setup & Matchup Console"
      className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-6"
    >
      {/* Console Master Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#162A33]/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3 h-3" />
              Unified Play Setup & Matchup Lab
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">All Player & Coach Inputs</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-teal-400 font-semibold">Pre-Play Decision Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 font-display tracking-tight flex items-center gap-2">
            Matchup & Play Setup Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Configure offensive formation & play, opponent defensive front, and reads/reactions in one consolidated command area before running the tactical field simulation.
          </p>
        </div>

        {/* Live Matchup Summary Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B151C] border border-[#162A33] text-xs font-mono-tabular shrink-0">
          <div className="flex items-center gap-1.5 text-teal-300 font-bold">
            <span>{selectedPlay.code}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">
              {formationName}
            </span>
          </div>
          <span className="text-slate-500">vs</span>
          <span className="text-amber-400 font-bold">{activeFront.shortLabel}</span>
          <span className="text-slate-500">➔</span>
          <span className="px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60 font-semibold truncate max-w-[140px]">
            {simResult.ballCarrierSequence.outcomeLabel}
          </span>
        </div>
      </div>

      {/* 3-Column Consolidated Inputs Grid (Desktop side-by-side, perfectly balanced) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1: OFFENSE CONFIGURATION (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[#162A33] bg-[#0A1318] p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 font-mono text-xs font-bold flex items-center justify-center border border-teal-500/40">
                  A
                </span>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                  Offense Configuration
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 text-[10px] text-teal-300 font-mono font-semibold">
                {formationName}
              </span>
            </div>

            {/* Formation Alignments: 11th Player (Z) & Opposite TE (X) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 11th Player (Z) Alignment */}
              <div className="space-y-1.5 p-2 rounded-lg bg-[#060D11] border border-[#162A33]">
                <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                  <span>11th Player (Z):</span>
                  <span className="text-[10px] text-teal-400 font-mono font-bold">
                    {eleventhMode === 'wide_z' ? 'Wide Z' : 'Wing Z'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#091318] border border-[#162A33] rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => onChangeEleventhMode('wide_z')}
                    className={`py-1 px-2 rounded font-medium transition-all cursor-pointer text-center truncate text-[11px] ${
                      eleventhMode === 'wide_z'
                        ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                    }`}
                  >
                    Wide Z
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeEleventhMode('wing_z')}
                    className={`py-1 px-2 rounded font-medium transition-all cursor-pointer text-center truncate text-[11px] ${
                      eleventhMode === 'wing_z'
                        ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                    }`}
                  >
                    Wing Z
                  </button>
                </div>
              </div>

              {/* Opposite TE (X) Alignment */}
              <div className="space-y-1.5 p-2 rounded-lg bg-[#060D11] border border-[#162A33]">
                <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                  <span>Opposite TE (X):</span>
                  <span className="text-[10px] text-teal-400 font-mono font-bold">
                    {xMode === 'wide_x' ? 'Wide X' : 'Tight X'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#091318] border border-[#162A33] rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => onChangeXMode('tight_x')}
                    className={`py-1 px-2 rounded font-medium transition-all cursor-pointer text-center truncate text-[11px] ${
                      xMode === 'tight_x'
                        ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                    }`}
                  >
                    Tight X
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeXMode('wide_x')}
                    className={`py-1 px-2 rounded font-medium transition-all cursor-pointer text-center truncate text-[11px] ${
                      xMode === 'wide_x'
                        ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                    }`}
                  >
                    Wide X
                  </button>
                </div>
              </div>
            </div>

            {/* Offensive Play Selector (The 5 Core Plays) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Select Offensive Play Concept:
              </label>
              <div className="space-y-1.5">
                {VEER_PLAYBOOK.map((play) => {
                  const isSelected = play.id === selectedPlay.id;
                  return (
                    <button
                      key={play.id}
                      type="button"
                      onClick={() => onSelectPlay(play.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-teal-400 bg-[#0E222A] text-white shadow-md ring-1 ring-teal-400/50'
                          : 'border-[#162A33] bg-[#070F14] hover:border-[#20404E] hover:bg-[#0A161E]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono-tabular font-bold text-xs px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-teal-400 text-slate-950 font-extrabold'
                              : 'bg-[#101F26] text-teal-300 border border-[#1B3542]'
                          }`}
                        >
                          {play.code}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {play.name.split('(')[0].trim()}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {play.targetGap.split('/')[0].trim()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            isSelected
                              ? 'bg-teal-500/20 text-teal-200 border border-teal-500/30 font-semibold'
                              : 'bg-[#091318] text-slate-400 border border-[#162A33]'
                          }`}
                        >
                          {play.playType}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-teal-400' : 'text-slate-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Play Intel Footer */}
          <div className="pt-2 border-t border-[#162A33] text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Primary Concept: {selectedPlay.playType}</span>
            <span className="text-teal-400">Aiming: {selectedPlay.targetGap}</span>
          </div>
        </div>

        {/* PANEL 2: DEFENSE CONFIGURATION (3 cols) */}
        <div className="lg:col-span-3 rounded-xl border border-[#162A33] bg-[#0A1318] p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/40">
                  B
                </span>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  Opponent Defense
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {Object.keys(DEFENSIVE_FRONTS).length} Fronts
              </span>
            </div>

            {/* Defensive Front Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Select Defensive Front:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(DEFENSIVE_FRONTS).map((f) => {
                  const active = f.id === frontId;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onChangeFrontId(f.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-amber-400 bg-[#1A180E] text-white shadow-sm ring-1 ring-amber-400/40'
                          : 'border-[#162A33] bg-[#060D11] text-slate-300 hover:border-[#20404E] hover:bg-[#091318]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-white">{f.shortLabel}</span>
                        <span
                          className={`text-[10px] font-mono-tabular px-1.5 py-0.5 rounded ${
                            active
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'text-slate-400'
                          }`}
                        >
                          {f.boxCount.split('-')[0]} Box
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {f.frequencyInGame}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Defensive Intel Callouts */}
            <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-2 text-xs">
              <div>
                <p className="text-[11px] text-slate-400 font-mono uppercase">Center Line Call</p>
                <p className="text-teal-300 font-semibold font-mono-tabular mt-0.5">
                  {activeFront.lineCallRule}
                </p>
              </div>
              <div className="pt-2 border-t border-[#162A33]/70">
                <p className="text-[11px] text-amber-400 font-mono uppercase">Vulnerability / Leverage</p>
                <p className="text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                  {activeFront.veerVulnerability}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#162A33] text-[11px] text-slate-400 font-mono">
            <span>Box Alignment: {activeFront.boxCount}</span>
          </div>
        </div>

        {/* PANEL 3: READS & REACTIONS (Incorporated right in Setup!) (4 cols) */}
        <div
          id="reads"
          className="lg:col-span-4 rounded-xl border border-[#162A33] bg-[#0A1318] p-4 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 font-mono text-xs font-bold flex items-center justify-center border border-teal-500/40">
                  C
                </span>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                  Reads & Reactions Lab
                </span>
              </div>
              <span className="text-[11px] text-teal-400 font-mono">Live Decisions</span>
            </div>

            {/* Dynamic Controls based on selected play type */}
            {isOptionPlay ? (
              <div className="space-y-3">
                {/* #1 Dive Key Reaction */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-rose-400" />
                      {selectedPlay.id === '46-outside-veer'
                        ? '#1 EMLOS End Reaction'
                        : '#1 Dive Key (DT) Reaction'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Mesh Read</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[#060D11] border border-[#162A33] rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('squeeze')}
                      className={`py-1.5 px-1 rounded font-medium transition-all cursor-pointer text-center text-[11px] truncate ${
                        diveBehavior === 'squeeze'
                          ? 'bg-rose-600 text-white font-bold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                      }`}
                    >
                      Sit / Squeeze
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('crash')}
                      className={`py-1.5 px-1 rounded font-medium transition-all cursor-pointer text-center text-[11px] truncate ${
                        diveBehavior === 'crash'
                          ? 'bg-rose-600 text-white font-bold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                      }`}
                    >
                      Crash on Dive
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('upfield')}
                      className={`py-1.5 px-1 rounded font-medium transition-all cursor-pointer text-center text-[11px] truncate ${
                        diveBehavior === 'upfield'
                          ? 'bg-rose-600 text-white font-bold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                      }`}
                    >
                      Bull Rush
                    </button>
                  </div>
                </div>

                {/* #2 Pitch Key Reaction */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-teal-400" />
                      {selectedPlay.id === '46-outside-veer'
                        ? '#2 Pitch Key (Corner) Reaction'
                        : '#2 Pitch Key (EMLOS) Reaction'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Perimeter Read</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#060D11] border border-[#162A33] rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => onChangePitchBehavior('commit_qb')}
                      className={`py-1.5 px-2 rounded font-medium transition-all cursor-pointer text-center text-[11px] truncate ${
                        pitchBehavior === 'commit_qb'
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                      }`}
                    >
                      Commit to 1
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangePitchBehavior('feather_pitch')}
                      className={`py-1.5 px-2 rounded font-medium transition-all cursor-pointer text-center text-[11px] truncate ${
                        pitchBehavior === 'feather_pitch'
                          ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-[#0D1820]'
                      }`}
                    >
                      Feather to 2
                    </button>
                  </div>
                </div>

                {/* Live Read Outcome Verdict */}
                <div className="p-3 rounded-lg bg-[#060D11] border border-teal-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      1 Decision Verdict
                    </span>
                    <span className="text-[11px] font-mono-tabular font-bold text-emerald-400">
                      {simResult.ballCarrierSequence.expectedYards}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-teal-300 font-mono-tabular flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{simResult.ballCarrierSequence.outcomeLabel}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {simResult.ballCarrierSequence.diveGive
                      ? selectedPlay.qbDecisionMatrix.squeezeGive
                      : simResult.ballCarrierSequence.pitchTriggered
                      ? selectedPlay.qbDecisionMatrix.pitchPhase
                      : selectedPlay.qbDecisionMatrix.crashPull}
                  </p>
                </div>
              </div>
            ) : isPower ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      Playside LB Reaction
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Lead Iso</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#091318] border border-[#162A33] rounded-lg">
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('squeeze')}
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                        diveBehavior === 'squeeze'
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      LB Scrapes Wide
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('crash')}
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                        diveBehavior === 'crash'
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      LB Plugs B-Gap
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#060D11] border border-teal-500/30 space-y-1.5">
                  <span className="text-[10px] text-teal-400 font-mono uppercase">
                    Execution Outcome
                  </span>
                  <p className="text-xs font-bold text-white">
                    {diveBehavior === 'crash'
                      ? 'LG Log-Blocks on Edge · 3 Bounces to C-Gap'
                      : 'LG Kicks Out SDE · 3 Cuts Inside B-Gap Lane'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Pulling Left Guard (LG) depth is 6 inches behind Center. 2 (Right Halfback) leads through the hole to isolate the Mike linebacker.
                  </p>
                </div>
              </div>
            ) : (
              /* Power Pass */
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      Coverage Reaction
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Play-Action</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#091318] border border-[#162A33] rounded-lg">
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('squeeze')}
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                        diveBehavior === 'squeeze'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      LBs Bite Run (TD)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('crash')}
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                        diveBehavior === 'crash'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Safeties Drop Deep
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#060D11] border border-teal-500/30 space-y-1.5">
                  <span className="text-[10px] text-teal-400 font-mono uppercase">
                    Target Progression
                  </span>
                  <p className="text-xs font-bold text-white">
                    {diveBehavior === 'squeeze'
                      ? 'Primary: Y Seam Pop (Wide Open in Void)'
                      : 'Checkdown: 2 Swing out of Backfield'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1 fakes 24 Power to 3 at 4 yards, sets feet at 3-step depth, and delivers to Y clearing 8-10 yards behind linebackers.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#162A33] text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Read Point: {isOptionPlay ? '#1 Dive / #2 Pitch' : isPower ? 'LG Pull Track' : 'Y Pop Seam'}</span>
            <span className="text-teal-400">Conflict Key</span>
          </div>
        </div>
      </div>

      {/* CONSOLIDATED PLAYBACK & SIMULATION ACTION BAR (All player/coach inputs in one area!) */}
      <div className="rounded-xl border border-[#162A33] bg-[#0A1318] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Playback Simulation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause Simulation
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                {progress > 0 && progress < 1 ? 'Resume Simulation' : 'Run Play Simulation'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStepForward}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#101F26] hover:bg-[#162B35] border border-[#1D3643] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <StepForward className="w-3.5 h-3.5" />
            Step +25%
          </button>

          <button
            type="button"
            onClick={onResetPreSnap}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-[#0E1A20] hover:bg-[#162832] border border-[#162A33] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Pre-Snap
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#060D11] border border-[#162A33] rounded-lg text-xs">
            <button
              type="button"
              onClick={() => onChangePlaybackSpeed(0.5)}
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
              onClick={() => onChangePlaybackSpeed(1)}
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

        {/* Phase Jumpers */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1">
            Jump to:
          </span>
          {selectedPlay.coachingPhases.map((ph) => {
            const isCurrent = currentPhaseNumber === ph.phase;
            return (
              <button
                key={ph.phase}
                type="button"
                onClick={() => onJumpToPhase(ph.timeRange)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? 'border-teal-400 bg-teal-950/60 text-teal-300 font-bold'
                    : 'border-[#162A33] bg-[#060D11] text-slate-400 hover:text-white hover:border-[#20404E]'
                }`}
              >
                P{ph.phase}: {ph.title.replace(/^Phase \d:\s*/, '').split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Tactical Canvas Tools Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleGapLabels}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              showGapLabels
                ? 'border-teal-500/50 bg-teal-950/40 text-teal-300'
                : 'border-[#162A33] bg-[#060D11] text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Gaps & Splits
          </button>

          <button
            type="button"
            onClick={onToggleChalkboardMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              chalkboardMode
                ? 'border-teal-400 bg-teal-950/50 text-teal-300'
                : 'border-[#162A33] bg-[#060D11] text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            {chalkboardMode ? 'Chalk Active' : 'Chalkboard'}
          </button>

          {hasChalkboardDrawings && (
            <button
              type="button"
              onClick={onClearChalkboard}
              className="px-2.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-lg hover:bg-rose-900/50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
