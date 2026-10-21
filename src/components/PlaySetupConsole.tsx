import React from 'react';
import {
  AlertCircle,
  ArrowLeftRight,
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
  OffensiveConcept,
  PitchKeyBehavior,
  PlayDefinition,
  PowerPassReceiverOption,
  TargetSide,
  VEER_PLAYBOOK,
  XPlayerMode,
  ZAlignmentSide,
  ZAlignmentType,
  formatOffensivePlayCall,
} from '../data/veerPlaybookData';

interface PlaySetupConsoleProps {
  selectedPlay: PlayDefinition;
  onSelectPlay: (playId: string) => void;
  selectedConcept?: OffensiveConcept;
  onSelectConcept?: (concept: OffensiveConcept) => void;
  targetSide?: TargetSide;
  onChangeTargetSide?: (side: TargetSide) => void;
  zSide?: ZAlignmentSide;
  onChangeZSide?: (side: ZAlignmentSide) => void;
  zType?: ZAlignmentType;
  onChangeZType?: (type: ZAlignmentType) => void;
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
  powerPassReceiver?: PowerPassReceiverOption;
  onChangePowerPassReceiver?: (receiver: PowerPassReceiverOption) => void;
  onSelectPlayer?: (playerId: string) => void;
  // Simulation playback controls
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  onResetPreSnap: () => void;
  onStepForward: () => void;
  onStepBackward?: () => void;
  isLooping?: boolean;
  onToggleLoop?: () => void;
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
  selectedConcept = 'inside_veer',
  onSelectConcept,
  targetSide = 'right',
  onChangeTargetSide,
  zSide = 'right',
  onChangeZSide,
  zType = 'wide',
  onChangeZType,
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
  powerPassReceiver = 'whip',
  onChangePowerPassReceiver,
  onSelectPlayer,
  isPlaying,
  onTogglePlay,
  progress,
  onResetPreSnap,
  onStepForward,
  onStepBackward,
  isLooping = true,
  onToggleLoop,
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

  // Derive concept from selectedPlay if not provided explicitly
  const activeConcept: OffensiveConcept =
    selectedConcept ||
    (selectedPlay.id.includes('blank')
      ? 'blank'
      : selectedPlay.id.includes('inside-veer')
      ? 'inside_veer'
      : selectedPlay.id.includes('outside-veer')
      ? 'outside_veer'
      : selectedPlay.id.includes('trap') || selectedPlay.id.includes('counter')
      ? 'trap'
      : selectedPlay.id.includes('power-pass') || selectedPlay.id.includes('flood')
      ? 'flood'
      : 'power');

  // Compute live play call formatting: <Formation> <Z-Alignment> <Number> <Concept>
  const playCallInfo = formatOffensivePlayCall(
    activeConcept,
    targetSide,
    xMode,
    'right',
    'tight',
    zSide,
    zType
  );

  const isOptionPlay =
    activeConcept === 'inside_veer' ||
    activeConcept === 'outside_veer' ||
    activeConcept === 'trap' ||
    activeConcept === 'counter' ||
    selectedPlay.playType === 'Triple Option' ||
    selectedPlay.playType === 'Misdirection Option' ||
    selectedPlay.playType === 'Misdirection Trap' ||
    selectedPlay.playType === 'Inside Read';

  const isPower = activeConcept === 'power' || selectedPlay.playType === 'Power';

  // Compute live read outcome
  const simResult = selectedPlay.getOffensivePaths(
    frontId,
    diveBehavior,
    pitchBehavior,
    eleventhMode,
    xMode,
    zSide,
    targetSide
  );

  const handleSelectConcept = (concept: OffensiveConcept) => {
    if (onSelectConcept) {
      onSelectConcept(concept);
    } else {
      const playIdMap: Record<OffensiveConcept, string> = {
        inside_veer: '22-inside-veer',
        outside_veer: '24-outside-veer',
        trap: '20-trap',
        counter: '20-trap',
        power: '34-power',
        flood: '324-power-pass',
        blank: 'blank-whiteboard',
      };
      onSelectPlay(playIdMap[concept]);
    }
  };

  const handleToggleTargetSide = () => {
    const nextSide: TargetSide = targetSide === 'right' ? 'left' : 'right';
    if (onChangeTargetSide) {
      onChangeTargetSide(nextSide);
    }
  };

  const handleSelectZSide = (side: ZAlignmentSide) => {
    if (onChangeZSide) onChangeZSide(side);
  };

  const handleSelectZType = (type: ZAlignmentType) => {
    if (onChangeZType) {
      onChangeZType(type);
    }
    // Also sync eleventhMode for backward compatibility
    onChangeEleventhMode(type === 'wing' ? 'wing_z' : 'wide_z');
  };

  const concepts: {
    id: OffensiveConcept;
    name: string;
    rightNumber: string;
    leftNumber: string;
    callout: string;
    tag: string;
    description: string;
  }[] = [
    {
      id: 'inside_veer',
      name: '22/31 Veer',
      rightNumber: '22',
      leftNumber: '31',
      callout: '22/31 Veer',
      tag: 'Core Veer',
      description: 'Dive Back Aims for Backside Hip of Playside OG & OT · Backside Pitch (4x4 Spacing) · Backfield Pitch',
    },
    {
      id: 'outside_veer',
      name: '24/33 Veer',
      rightNumber: '24',
      leftNumber: '33',
      callout: '24/33 Veer',
      tag: 'B-Gap Option',
      description: 'Playside Down-Block · B-Gap Dive (2/3) · Reads EMLOS (#1) & Force (#2)',
    },
    {
      id: 'trap',
      name: '20/30 Trap',
      rightNumber: '20',
      leftNumber: '30',
      callout: '20/30 Trap',
      tag: 'Quick Trap',
      description: 'Center Seals Backside NT/DT · Fake Runs B-Gap Off Strong OT to Backer · Primary RB Pitch-Fake & Mesh',
    },
    {
      id: 'power',
      name: '34/23 Power',
      rightNumber: '34',
      leftNumber: '23',
      callout: '34/23 Power',
      tag: 'Hesitation Step',
      description: 'Hesitation Step to Let Guard Clear · Lead ISO Block · Direct Handoff',
    },
    {
      id: 'flood',
      name: '36/35 Flood',
      rightNumber: '36',
      leftNumber: '35',
      callout: '36/35 Flood',
      tag: 'Play-Action Pass',
      description: 'Play-Action Fake · Progression: 1) RB Flat 2) Y Whip Out 3) Z Corner',
    },
    {
      id: 'blank',
      name: 'Blank Formation',
      rightNumber: '00',
      leftNumber: '00',
      callout: 'Coach Whiteboard',
      tag: 'Coach Pen',
      description: 'Clean Slate · Zero Routes · Drag Any Player to Position · Whiteboard with Coach Pen',
    },
  ];

  return (
    <section
      id="play-setup"
      aria-label="Play Setup & Matchup Console"
      className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-6"
    >
      {/* Console Master Header Bar with Live Spoken Call */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#162A33]/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3 h-3" />
              Offensive Call System & Matchup Lab
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Formation · Direction · Concept</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-teal-400 font-semibold font-mono">
              &lt;Formation-ZAlignment-Number-Concept&gt;
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Live Offensive Call:
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight bg-teal-950/40 px-3 py-1 rounded-lg border border-teal-500/50 shadow-inner">
              {playCallInfo.fullPlayCall}
            </span>
          </div>
        </div>

        {/* Live Matchup Summary Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B151C] border border-[#162A33] text-xs font-mono-tabular shrink-0">
          <div className="flex items-center gap-1.5 text-teal-300 font-bold">
            <span>{playCallInfo.numberCode} {playCallInfo.conceptName.toUpperCase()}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300">{playCallInfo.formation}</span>
          </div>
          <span className="text-slate-500">vs</span>
          <span className="text-amber-400 font-bold">{activeFront.shortLabel}</span>
          <span className="text-slate-500">➔</span>
          <span className="px-2 py-0.5 rounded bg-teal-950/70 text-teal-300 border border-teal-800/60 font-semibold truncate max-w-[140px]">
            {simResult.ballCarrierSequence.outcomeLabel}
          </span>
        </div>
      </div>

      {/* 3-Column Consolidated Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* PANEL 1: OFFENSE CONFIGURATION (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-[#162A33] bg-[#0A1318] p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header with Call Breakdown Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#162A33]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-300 font-mono text-xs font-bold flex items-center justify-center border border-teal-500/40">
                  A
                </span>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                  Offense Configuration
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-teal-500/15 border border-teal-500/30 text-teal-300 font-bold">
                  {playCallInfo.formation}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold">
                  {playCallInfo.zDesc}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold" title="Y will never be out wide; always attached to LOS">
                  Y Attached (LOS)
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                  #{playCallInfo.numberCode}
                </span>
              </div>
            </div>

            {/* Direction / Target Side Switcher with Flip Button */}
            <div className="p-2.5 rounded-lg bg-[#060D11] border border-[#162A33] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Play Target Side / Direction:</span>
                <button
                  type="button"
                  onClick={handleToggleTargetSide}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#101F26] text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 transition-colors cursor-pointer"
                  title="Flip play target side (Right ⇄ Left)"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  Flip Play
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                {(() => {
                  const activeConceptConfig = concepts.find((c) => c.id === activeConcept) || concepts[0];
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => onChangeTargetSide && onChangeTargetSide('right')}
                        className={`py-1.5 px-2 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center text-xs ${
                          targetSide === 'right'
                            ? 'bg-teal-400 text-slate-950 shadow-md ring-1 ring-teal-400/50'
                            : 'bg-[#091318] text-slate-400 hover:text-white border border-[#162A33]'
                        }`}
                      >
                        <span>RIGHT</span>
                        <span className={`text-[10px] px-1 rounded ${targetSide === 'right' ? 'bg-slate-950/20 text-slate-900 font-extrabold' : 'text-slate-400'}`}>
                          Even ({activeConceptConfig.rightNumber})
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeTargetSide && onChangeTargetSide('left')}
                        className={`py-1.5 px-2 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center text-xs ${
                          targetSide === 'left'
                            ? 'bg-teal-400 text-slate-950 shadow-md ring-1 ring-teal-400/50'
                            : 'bg-[#091318] text-slate-400 hover:text-white border border-[#162A33]'
                        }`}
                      >
                        <span>LEFT</span>
                        <span className={`text-[10px] px-1 rounded ${targetSide === 'left' ? 'bg-slate-950/20 text-slate-900 font-extrabold' : 'text-slate-400'}`}>
                          Odd ({activeConceptConfig.leftNumber})
                        </span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Alignments: X Alignment (Formation) & Z Alignment Side/Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* X Alignment: Tight ("Double Tight") vs Wide ("Wide") */}
              <div className="space-y-1.5 p-2 rounded-lg bg-[#060D11] border border-[#162A33]">
                <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                  <span>X Alignment:</span>
                  <span className="text-[10px] text-teal-400 font-mono font-bold">
                    {xMode === 'tight_x' ? 'Double Tight' : 'Wide'}
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

              {/* Z Alignment: Side (Right/Left) & Position (Wide/Wing) */}
              <div className="space-y-1.5 p-2 rounded-lg bg-[#060D11] border border-[#162A33]">
                <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                  <span>Z Alignment:</span>
                  <span className="text-[10px] text-teal-400 font-mono font-bold">
                    {playCallInfo.zDesc}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#091318] border border-[#162A33] rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectZSide('right')}
                    className={`py-0.5 px-1.5 rounded font-medium transition-all cursor-pointer text-center truncate text-[10px] ${
                      zSide === 'right'
                        ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Right
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectZSide('left')}
                    className={`py-0.5 px-1.5 rounded font-medium transition-all cursor-pointer text-center truncate text-[10px] ${
                      zSide === 'left'
                        ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Left
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#091318] border border-[#162A33] rounded-md text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectZType('wide')}
                    title="Wide Z: Split out wide as flanker (Off LOS). Y attached to LOS."
                    className={`py-0.5 px-1.5 rounded font-medium transition-all cursor-pointer text-center truncate text-[10px] ${
                      zType === 'wide'
                        ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Wide Z
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectZType('wing')}
                    title="Wing Z: Aligns 1 yd off LOS in backfield. Y stays attached to LOS."
                    className={`py-0.5 px-1.5 rounded font-medium transition-all cursor-pointer text-center truncate text-[10px] ${
                      zType === 'wing'
                        ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Wing Z (Off LOS)
                  </button>
                </div>
                <div className="text-[9.5px] font-mono text-slate-400 flex items-center justify-between pt-1 px-0.5 border-t border-[#14262F]">
                  <span className="text-teal-300 font-semibold">
                    {zType === 'wing' ? 'Z: Wing (Off LOS)' : 'Z: Flanker (Off LOS)'}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Y: Attached (LOS)
                  </span>
                </div>
              </div>
            </div>

            {/* The 5 Core Offensive Play Concepts */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Select Offensive Play Concept:</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Target: {targetSide === 'right' ? 'Right' : 'Left'} side
                </span>
              </label>

              <div className="space-y-1.5">
                {concepts.map((concept) => {
                  const isSelected = activeConcept === concept.id;
                  const activeNumber = targetSide === 'right' ? concept.rightNumber : concept.leftNumber;

                  return (
                    <button
                      key={concept.id}
                      type="button"
                      onClick={() => handleSelectConcept(concept.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-teal-400 bg-[#0E222A] text-white shadow-md ring-1 ring-teal-400/50'
                          : 'border-[#162A33] bg-[#070F14] hover:border-[#20404E] hover:bg-[#0A161E]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-teal-400 text-slate-950 font-extrabold shadow-sm'
                              : 'bg-[#101F26] text-teal-300 border border-[#1B3542]'
                          }`}
                        >
                          {activeNumber}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {concept.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            Call: <span className="text-teal-300 font-mono font-bold">{activeNumber} {concept.id === 'blank' ? 'Whiteboard' : concept.id === 'trap' || (concept.id as string) === 'counter' ? 'Trap' : concept.id === 'power' ? 'Power' : concept.id === 'flood' ? 'Flood' : 'Veer'}</span> · {concept.description}
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
                          {concept.tag}
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
            <span>Call: {playCallInfo.fullPlayCall}</span>
            <span className="text-teal-400">Target: {playCallInfo.numberCode}-Hole</span>
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
                      {selectedPlay.id.includes('outside-veer')
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
                      Crash (Full Commit)
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
                      {selectedPlay.id.includes('outside-veer')
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
                      Commit to 3 (Pitch)
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
              /* Power Pass (36/35 Flood) */
              <div className="space-y-3.5 text-xs">
                {/* Receiver Option Selector */}
                <div className="p-3.5 rounded-lg bg-[#060D11] border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-purple-400" />
                      Select Receiver Option (Progression Target)
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40">
                      QB Read
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Choose which receiver the quarterback targets in the play-action pass rhythm:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      {
                        id: 'arrow' as PowerPassReceiverOption,
                        label: targetSide === 'left' ? '1) 2-Back Arrow (Flat)' : '1) 3-Back Arrow (Flat)',
                        badge: '1st Read · Throw @ 60%',
                        targetPid: targetSide === 'left' ? 'RH' : 'LH',
                        yards: '+12.0 Yds',
                        highlight: 'text-teal-300',
                      },
                      {
                        id: 'whip' as PowerPassReceiverOption,
                        label: targetSide === 'left' ? '2) X 7-Yd Whip Out' : '2) Y 7-Yd Whip Out',
                        badge: '2nd Read · Throw @ 65%',
                        targetPid: targetSide === 'left' ? 'XTE' : 'YTE',
                        yards: '+18.0 Yds',
                        highlight: 'text-purple-300',
                      },
                      {
                        id: 'corner' as PowerPassReceiverOption,
                        label: '3) Z Post Corner',
                        badge: '3rd Read · Throw @ 68%',
                        targetPid: 'W',
                        yards: '+35.0 Yds TD',
                        highlight: 'text-amber-300',
                      },
                      {
                        id: 'post' as PowerPassReceiverOption,
                        label: targetSide === 'left' ? 'Backside: Y Post' : 'Backside: X Post',
                        badge: '4th Read · Throw @ 73%',
                        targetPid: targetSide === 'left' ? 'YTE' : 'XTE',
                        yards: '+28.0 Yds',
                        highlight: 'text-rose-300',
                      },
                      {
                        id: 'checkdown' as PowerPassReceiverOption,
                        label: targetSide === 'left' ? 'Check: 3-Back Flat' : 'Check: 2-Back Flat',
                        badge: 'Safety Valve · Throw @ 75%',
                        targetPid: targetSide === 'left' ? 'LH' : 'RH',
                        yards: '+9.0 Yds',
                        highlight: 'text-blue-300',
                      },
                    ].map((rcv) => {
                      const isSelected = powerPassReceiver === rcv.id;
                      return (
                        <button
                          key={rcv.id}
                          type="button"
                          onClick={() => {
                            onChangePowerPassReceiver?.(rcv.id);
                            onSelectPlayer?.(rcv.targetPid);
                          }}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                            isSelected
                              ? 'bg-purple-950/70 border-purple-400 text-white shadow-md shadow-purple-900/30'
                              : 'bg-[#091318] border-[#162A33] text-slate-300 hover:border-purple-500/50 hover:bg-[#0c1a21]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-bold text-[11px] ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {rcv.label}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              {rcv.yards}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className={isSelected ? rcv.highlight : 'text-slate-400'}>
                              {rcv.badge}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-400/50 font-bold">
                                ACTIVE TARGET
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Defensive Coverage Reaction */}
                <div className="p-3 rounded-lg bg-[#060D11] border border-[#162A33] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" />
                      Coverage Reaction
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Play-Action Fake</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#091318] border border-[#162A33] rounded-lg">
                    <button
                      type="button"
                      onClick={() => onChangeDiveBehavior('squeeze')}
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
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
                      className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        diveBehavior === 'crash'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Safeties Drop Deep
                    </button>
                  </div>
                </div>

                {/* Target Execution Details */}
                <div className="p-3 rounded-lg bg-[#060D11] border border-teal-500/30 space-y-1.5">
                  <span className="text-[10px] text-teal-400 font-mono uppercase font-bold">
                    Target Execution & Coaching Point
                  </span>
                  <p className="text-xs font-bold text-white">
                    {powerPassReceiver === 'arrow'
                      ? targetSide === 'left' ? '1) 2-Back Arrow Route into Left Flat (+12 Yds)' : '1) 3-Back Arrow Route into Right Flat (+12 Yds)'
                      : powerPassReceiver === 'corner'
                      ? '3) Z Post Corner Over Top (+35 Yds Touchdown)'
                      : powerPassReceiver === 'checkdown'
                      ? targetSide === 'left' ? 'Checkdown: 3-Back Peeling into Backside Flat (+9 Yds)' : 'Checkdown: 2-Back Peeling into Backside Flat (+9 Yds)'
                      : powerPassReceiver === 'post'
                      ? targetSide === 'left' ? 'Backside: Y Snapping Deep Post Across Middle (+28 Yds)' : 'Backside: X Snapping Deep Post Across Middle (+28 Yds)'
                      : targetSide === 'left' ? '2) X 7-Yard Whip Out to Left Sideline (+18 Yds)' : '2) Y 7-Yard Whip Out to Right Sideline (+18 Yds)'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {powerPassReceiver === 'arrow'
                      ? 'Playside halfback chips the outside shoulder of the defensive end, then explodes on the arrow track to the flat. Immediate horizontal stress forces the perimeter overhang defender into a no-win spot.'
                      : powerPassReceiver === 'corner'
                      ? 'Z stems vertically 10 yards, fakes hard on the post move inside with head and shoulders to freeze the free safety, then breaks 45° to the corner pylon into the open honey-hole behind the cornerback.'
                      : powerPassReceiver === 'checkdown'
                      ? 'Backside halfback stones the backside defensive end for a 2-count pass protection block, then leaks into the backside flat as a safety valve when linebackers drop deep with receivers.'
                      : powerPassReceiver === 'post'
                      ? 'Backside split end attacks the cornerback’s outside leverage to flip his hips, then cuts across the deep middle into vacant space created by linebackers biting up on the run fake.'
                      : 'Tight end drives 7 yards upfield into the defender’s chest, plants hard for 2 steps inside, and violently snaps the whip out to the sideline away from collapsing linebackers.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#162A33] text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>
              Read Point: {isOptionPlay
                ? '#1 Dive / #2 Pitch'
                : isPower
                ? (targetSide === 'left' ? 'RG Pull Track' : 'LG Pull Track')
                : `Target: ${
                    powerPassReceiver === 'arrow'
                      ? '1) RB Arrow Flat'
                      : powerPassReceiver === 'corner'
                      ? '3) Z Post Corner'
                      : powerPassReceiver === 'checkdown'
                      ? 'Checkdown Flat'
                      : powerPassReceiver === 'post'
                      ? 'Backside Post'
                      : '2) Y Whip Out'
                  }`}
            </span>
            <span className="text-teal-400">Progression</span>
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

          {onStepBackward && (
            <button
              type="button"
              onClick={onStepBackward}
              title="Step backward 15%"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-200 bg-[#101F26] hover:bg-[#162B35] border border-[#1D3643] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              -15%
            </button>
          )}

          <button
            type="button"
            onClick={onStepForward}
            title="Step forward 15%"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#101F26] hover:bg-[#162B35] border border-[#1D3643] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <StepForward className="w-3.5 h-3.5" />
            +15%
          </button>

          <button
            type="button"
            onClick={onResetPreSnap}
            title="Reset to pre-snap alignment (0%)"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-[#0E1A20] hover:bg-[#162832] border border-[#162A33] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Pre-Snap
          </button>

          {onToggleLoop && (
            <button
              type="button"
              onClick={onToggleLoop}
              title="Toggle continuous looping animation"
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                isLooping
                  ? 'border-teal-400 bg-teal-950/60 text-teal-300'
                  : 'border-[#162A33] bg-[#0E1A20] text-slate-400 hover:text-white'
              }`}
            >
              🔁 Loop {isLooping ? 'ON' : 'OFF'}
            </button>
          )}

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
