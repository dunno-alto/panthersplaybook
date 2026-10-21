import React, { useEffect, useState, useRef } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  Pause,
  PenTool,
  Play,
  Printer,
  RotateCcw,
  Shield,
  Sparkles,
  StepForward,
  Zap,
  Undo2,
  Trash2,
} from 'lucide-react';
import {
  DEFENSIVE_FRONTS,
  DefensiveFrontId,
  DiveKeyBehavior,
  EleventhPlayerMode,
  OffensiveConcept,
  PitchKeyBehavior,
  Point,
  PowerPassReceiverOption,
  TargetSide,
  VEER_PLAYBOOK,
  XPlayerMode,
  ZAlignmentSide,
  ZAlignmentType,
  getActivePlayDefinition,
  getBaseOffensiveAlignment,
} from './data/veerPlaybookData';
import { TacticalFieldCanvas, CoachNotation } from './components/TacticalFieldCanvas';
import { PlaySetupConsole } from './components/PlaySetupConsole';
import { WristbandModal } from './components/WristbandModal';
import { DrillsSection } from './components/DrillsSection';
import { DefenseCoordinatorSection } from './components/DefenseCoordinatorSection';
import { SpecialTeamsSection } from './components/SpecialTeamsSection';
import { DefenseWristbandModal } from './components/DefenseWristbandModal';
import { SpecialTeamsPrintModal } from './components/SpecialTeamsPrintModal';

const OFFENSE_PEN_COLORS = [
  { label: 'Chalk Yellow', value: '#FACC15', bgClass: 'bg-yellow-400', ringColor: 'ring-yellow-400' },
  { label: 'Neon Teal', value: '#2DD4BF', bgClass: 'bg-teal-400', ringColor: 'ring-teal-400' },
  { label: 'Coral Red', value: '#F87171', bgClass: 'bg-red-400', ringColor: 'ring-red-400' },
  { label: 'Chalk White', value: '#FFFFFF', bgClass: 'bg-white', ringColor: 'ring-white' },
];

export type AppActiveTab = 'offense' | 'defense' | 'special_teams';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppActiveTab>('offense');

  // OFFENSE STATE (Split Back Veer)
  const [selectedPlayId, setSelectedPlayId] = useState<string>('22-inside-veer');
  const [concept, setConcept] = useState<OffensiveConcept>('inside_veer');
  const [targetSide, setTargetSide] = useState<TargetSide>('right');
  const [zSide, setZSide] = useState<ZAlignmentSide>('right');
  const [zType, setZType] = useState<ZAlignmentType>('wide');
  const [frontId, setFrontId] = useState<DefensiveFrontId>('5-3');
  const [diveBehavior, setDiveBehavior] = useState<DiveKeyBehavior>('squeeze');
  const [pitchBehavior, setPitchBehavior] = useState<PitchKeyBehavior>('commit_qb');
  const [eleventhMode, setEleventhMode] = useState<EleventhPlayerMode>('wide_z');
  const [xMode, setXMode] = useState<XPlayerMode>('tight_x');
  const [powerPassReceiver, setPowerPassReceiver] = useState<PowerPassReceiverOption>('whip');

  // Animation & playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Field appearance & chalkboard
  const [fieldTheme, setFieldTheme] = useState<'night_turf' | 'chalkboard' | 'high_contrast'>('night_turf');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('LH');
  const [showGapLabels, setShowGapLabels] = useState<boolean>(true);
  const [showBlockingAngles, setShowBlockingAngles] = useState<boolean>(true);
  const [chalkboardMode, setChalkboardMode] = useState<boolean>(false);
  const [isOffenseFullscreen, setIsOffenseFullscreen] = useState<boolean>(false);
  const offenseCanvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [customOffsets, setCustomOffsets] = useState<Record<string, Point>>({});
  const [customArrows, setCustomArrows] = useState<CoachNotation[]>([]);
  const [offensePenColor, setOffensePenColor] = useState<string>('#FACC15');
  const [offensePenMode, setOffensePenMode] = useState<'freehand' | 'arrow'>('freehand');

  // Sync fullscreen change & Escape key listener for offense
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isOffenseFullscreen) {
        setIsOffenseFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOffenseFullscreen) {
        setIsOffenseFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOffenseFullscreen]);

  const handleToggleOffenseFullscreen = () => {
    if (!isOffenseFullscreen) {
      setIsOffenseFullscreen(true);
      try {
        offenseCanvasContainerRef.current?.requestFullscreen?.();
      } catch {}
    } else {
      setIsOffenseFullscreen(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      } catch {}
    }
  };

  const handleToggleOffenseCoachPen = () => {
    setChalkboardMode((p) => {
      const next = !p;
      if (next) {
        setIsOffenseFullscreen(true);
        try {
          offenseCanvasContainerRef.current?.requestFullscreen?.();
        } catch {}
      } else {
        if (isOffenseFullscreen) {
          setIsOffenseFullscreen(false);
          try {
            if (document.fullscreenElement) {
              document.exitFullscreen?.();
            }
          } catch {}
        }
      }
      return next;
    });
  };

  // Print Modals
  const [isWristbandOpen, setIsWristbandOpen] = useState<boolean>(false);
  const [isDefenseWristbandOpen, setIsDefenseWristbandOpen] = useState<boolean>(false);
  const [isSpecialTeamsPrintOpen, setIsSpecialTeamsPrintOpen] = useState<boolean>(false);

  const activePlay = getActivePlayDefinition(
    concept,
    targetSide,
    xMode,
    'right',
    'tight',
    zSide,
    zType,
    'none',
    powerPassReceiver
  );
  const activeFront = DEFENSIVE_FRONTS[frontId];
  const baseOffense = getBaseOffensiveAlignment(eleventhMode, xMode, zSide);
  const simResult = activePlay.getOffensivePaths(
    frontId,
    diveBehavior,
    pitchBehavior,
    eleventhMode,
    xMode,
    zSide,
    targetSide,
    'right',
    'tight',
    'none',
    powerPassReceiver
  );

  const isLoopingRef = React.useRef(isLooping);
  isLoopingRef.current = isLooping;
  const playbackSpeedRef = React.useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  // Smooth 60fps animation loop with loop support and natural pause at whistle
  useEffect(() => {
    if (!isPlaying) return;
    let animationFrameId: number;
    let lastTime = performance.now();
    let holdDuration = 0;

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const deltaProgress = (dt * playbackSpeedRef.current) / 3.0;
      let shouldStop = false;

      setProgress((prev) => {
        if (prev >= 1) {
          if (isLoopingRef.current) {
            holdDuration += dt;
            if (holdDuration >= 0.75) {
              holdDuration = 0;
              return 0; // Restart smoothly from pre-snap
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

  const handleSelectPlay = (playId: string) => {
    setSelectedPlayId(playId);
    if (playId.includes('inside-veer')) setConcept('inside_veer');
    else if (playId.includes('outside-veer')) setConcept('outside_veer');
    else if (playId.includes('trap') || playId.includes('counter')) setConcept('trap');
    else if (playId.includes('power-pass') || playId.includes('flood')) setConcept('flood');
    else if (playId.includes('power')) setConcept('power');
    setIsPlaying(false);
    setProgress(0);
    if (playId.includes('power') && !playId.includes('pass') && !playId.includes('flood')) {
      setSelectedPlayerId(targetSide === 'left' ? 'RG' : 'LG');
    } else if (playId.includes('trap') || playId.includes('counter')) {
      // Primary RB is RH on 20 Trap (right), LH on 30 Trap (left)
      setSelectedPlayerId(targetSide === 'left' ? 'LH' : 'RH');
    } else if (playId.includes('flood') || playId === '324-power-pass') {
      if (powerPassReceiver === 'arrow') {
        setSelectedPlayerId(targetSide === 'left' ? 'RH' : 'LH');
      } else if (powerPassReceiver === 'corner') {
        setSelectedPlayerId('W');
      } else if (powerPassReceiver === 'checkdown') {
        setSelectedPlayerId(targetSide === 'left' ? 'LH' : 'RH');
      } else if (powerPassReceiver === 'post') {
        setSelectedPlayerId(targetSide === 'left' ? 'YTE' : 'XTE');
      } else {
        setSelectedPlayerId(targetSide === 'left' ? 'XTE' : 'YTE');
      }
    } else {
      // Inside Veer or Outside Veer: dive back is playside back
      setSelectedPlayerId(targetSide === 'left' ? 'LH' : 'RH');
    }
  };

  const handleSelectConcept = (newConcept: OffensiveConcept) => {
    setConcept(newConcept);
    setIsPlaying(false);
    setProgress(0);
    if (newConcept === 'power') {
      setSelectedPlayerId(targetSide === 'left' ? 'RG' : 'LG');
    } else if (newConcept === 'trap' || newConcept === 'counter') {
      // Primary RB is RH on 20 Trap (right), LH on 30 Trap (left)
      setSelectedPlayerId(targetSide === 'left' ? 'LH' : 'RH');
    } else if (newConcept === 'flood') {
      if (powerPassReceiver === 'arrow') {
        setSelectedPlayerId(targetSide === 'left' ? 'RH' : 'LH');
      } else if (powerPassReceiver === 'corner') {
        setSelectedPlayerId('W');
      } else if (powerPassReceiver === 'checkdown') {
        setSelectedPlayerId(targetSide === 'left' ? 'LH' : 'RH');
      } else if (powerPassReceiver === 'post') {
        setSelectedPlayerId(targetSide === 'left' ? 'YTE' : 'XTE');
      } else {
        setSelectedPlayerId(targetSide === 'left' ? 'XTE' : 'YTE');
      }
    } else {
      // Inside Veer or Outside Veer: dive back is playside back
      setSelectedPlayerId(targetSide === 'left' ? 'LH' : 'RH');
    }
  };

  const handleJumpToPhase = (phaseRange: [number, number]) => {
    setIsPlaying(false);
    setProgress(phaseRange[1]);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setProgress((prev) => (prev >= 1 ? 0 : Math.min(1, Number((prev + 0.15).toFixed(2)))));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setProgress((prev) => Math.max(0, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetPreSnap = () => {
    setIsPlaying(false);
    setProgress(0);
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
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-[#162A33] bg-[#060D11]/95 sticky top-0 z-40 no-print backdrop-blur-md">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center justify-between w-full md:w-auto">
            <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('offense');
            }}
            className="text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display flex items-center gap-2"
          >
            <span className="text-teal-400">12U Panthers Playbook</span>
          </a>

          {/* Mobile Tab Switcher */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setActiveTab('offense')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                activeTab === 'offense' ? 'bg-teal-400 text-slate-950' : 'text-slate-400'
              }`}
            >
              Offense
            </button>
            <button
              onClick={() => setActiveTab('defense')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                activeTab === 'defense' ? 'bg-teal-400 text-slate-950' : 'text-slate-400'
              }`}
            >
              Defense
            </button>
            <button
              onClick={() => setActiveTab('special_teams')}
              className={`px-2 py-1 text-xs font-bold rounded ${
                activeTab === 'special_teams' ? 'bg-teal-400 text-slate-950' : 'text-slate-400'
              }`}
            >
              Special
            </button>
          </div>
        </div>

        {/* Zone 2: Primary Phase Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-2 bg-[#09151C] p-1 rounded-xl border border-[#162A33]">
          <button
            onClick={() => setActiveTab('offense')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'offense'
                ? 'bg-teal-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#0E212B]'
            }`}
          >
            <span className="text-sm">🏈</span>
            <span>Offense</span>
          </button>

          <button
            onClick={() => setActiveTab('defense')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'defense'
                ? 'bg-teal-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#0E212B]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Defense</span>
          </button>

          <button
            onClick={() => setActiveTab('special_teams')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'special_teams'
                ? 'bg-teal-400 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#0E212B]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Special</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Print Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'offense' && (
            <button
              onClick={() => setIsWristbandOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Veer Card</span>
            </button>
          )}

          {activeTab === 'defense' && (
            <button
              onClick={() => setIsDefenseWristbandOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 3-4/5-2 Sheet</span>
            </button>
          )}

          {activeTab === 'special_teams' && (
            <button
              onClick={() => setIsSpecialTeamsPrintOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ST Sheet</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace (1440px desktop baseline) */}
      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8 flex-1">
        {/* TAB 1: OFFENSE (Split Back Veer) */}
        {activeTab === 'offense' && (
          <div className="space-y-8">
            {/* Play Setup Console */}
            <PlaySetupConsole
              selectedPlay={activePlay}
              onSelectPlay={handleSelectPlay}
              selectedConcept={concept}
              onSelectConcept={handleSelectConcept}
              targetSide={targetSide}
              onChangeTargetSide={(side) => {
                setTargetSide(side);
                setIsPlaying(false);
                setProgress(0);
              }}
              zSide={zSide}
              onChangeZSide={(side) => {
                setZSide(side);
                setIsPlaying(false);
                setProgress(0);
              }}
              zType={zType}
              onChangeZType={(type) => {
                setZType(type);
                setEleventhMode(type === 'wing' ? 'wing_z' : 'wide_z');
                setIsPlaying(false);
                setProgress(0);
              }}
              eleventhMode={eleventhMode}
              onChangeEleventhMode={setEleventhMode}
              xMode={xMode}
              onChangeXMode={setXMode}
              frontId={frontId}
              onChangeFrontId={setFrontId}
              diveBehavior={diveBehavior}
              onChangeDiveBehavior={(behavior) => setDiveBehavior(behavior)}
              pitchBehavior={pitchBehavior}
              onChangePitchBehavior={(behavior) => setPitchBehavior(behavior)}
              powerPassReceiver={powerPassReceiver}
              onChangePowerPassReceiver={(rcv) => {
                setPowerPassReceiver(rcv);
                setIsPlaying(false);
                setProgress(0);
              }}
              onSelectPlayer={setSelectedPlayerId}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              progress={progress}
              onResetPreSnap={handleResetPreSnap}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              isLooping={isLooping}
              onToggleLoop={() => setIsLooping((p) => !p)}
              playbackSpeed={playbackSpeed}
              onChangePlaybackSpeed={setPlaybackSpeed}
              currentPhaseNumber={currentPhase.phase}
              onJumpToPhase={handleJumpToPhase}
              showGapLabels={showGapLabels}
              onToggleGapLabels={() => setShowGapLabels((p) => !p)}
              showBlockingAngles={showBlockingAngles}
              onToggleBlockingAngles={() => setShowBlockingAngles((p) => !p)}
              chalkboardMode={chalkboardMode}
              onToggleChalkboardMode={() => setChalkboardMode((p) => !p)}
              onClearChalkboard={() => {
                setCustomOffsets({});
                setCustomArrows([]);
              }}
              hasChalkboardDrawings={
                Object.keys(customOffsets).length > 0 || customArrows.length > 0
              }
            />

            {/* Tactical Field Canvas & Chalkboard */}
            <section
              id="field-canvas"
              aria-label="Interactive Tactical Field Canvas"
              className="rounded-2xl border border-[#162A33] bg-[#070E13] p-4 lg:p-6 shadow-2xl space-y-4"
            >
              {/* Canvas Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162A33]/80">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                    Tactical Chalkboard
                  </span>
                  {isPlaying ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold animate-pulse">
                      <Play className="w-3 h-3 fill-emerald-300" />
                      LIVE SIMULATION RUNNING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0A1318] border border-[#162A33] text-slate-400 font-mono text-[11px]">
                      <Pause className="w-3 h-3" />
                      SIMULATION PAUSED ({Math.round(progress * 100)}%)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                        {progress > 0 && progress < 1 ? 'Resume' : 'Play'}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowGapLabels((p) => !p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                      showGapLabels
                        ? 'border-teal-400 bg-teal-950/60 text-teal-300'
                        : 'border-[#162A33] bg-[#0A1318] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Gaps {showGapLabels ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={() => setShowBlockingAngles((p) => !p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                      showBlockingAngles
                        ? 'border-teal-400 bg-teal-950/60 text-teal-300'
                        : 'border-[#162A33] bg-[#0A1318] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Blocks {showBlockingAngles ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={handleToggleOffenseCoachPen}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer flex items-center gap-1.5 ${
                      chalkboardMode
                        ? 'border-amber-400 bg-amber-950/60 text-amber-300 ring-1 ring-amber-400 shadow-sm'
                        : 'border-[#162A33] bg-[#0A1318] text-slate-400 hover:text-slate-200'
                    }`}
                    title="Activate Coach Pen to draw adjustments (opens Fullscreen on tablet)"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Coach Pen {chalkboardMode ? 'ACTIVE' : 'OFF'}</span>
                    {customArrows.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-200 text-[10px] border border-amber-600/50">
                        {customArrows.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleToggleOffenseFullscreen}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer flex items-center gap-1.5 ${
                      isOffenseFullscreen
                        ? 'border-teal-400 bg-teal-950 text-teal-300 ring-1 ring-teal-400 shadow-sm'
                        : 'border-[#162A33] bg-[#0A1318] text-slate-400 hover:text-slate-200'
                    }`}
                    title={isOffenseFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen Tablet Chalkboard'}
                  >
                    {isOffenseFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-teal-300" /> : <Maximize2 className="w-3.5 h-3.5 text-teal-400" />}
                    <span>{isOffenseFullscreen ? 'Exit' : 'Tablet Fullscreen'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCustomOffsets({});
                      setCustomArrows([]);
                    }}
                    title="Reset custom chalk and offsets"
                    className="p-1.5 rounded-lg border border-[#162A33] bg-[#0A1318] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Docked Coach Pen Toolbar Bar when active in regular view */}
              {chalkboardMode && !isOffenseFullscreen && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#0d212d] via-[#081822] to-[#0d212d] border border-amber-500/50 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <PenTool className="w-3.5 h-3.5 text-amber-400" />
                      <span>Coach Pen:</span>
                    </span>

                    {/* Mode: Freehand vs Arrow */}
                    <div className="inline-flex rounded-lg border border-[#162A33] bg-[#050C10] p-0.5">
                      <button
                        type="button"
                        onClick={() => setOffensePenMode('freehand')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          offensePenMode === 'freehand' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Freehand drawing: Draw routes, blocks, stunts or circles"
                      >
                        <span>〰️ Freehand</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOffensePenMode('arrow')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          offensePenMode === 'arrow' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Straight Arrow: Drag from point A to B with directional arrow"
                      >
                        <span>➔ Arrow</span>
                      </button>
                    </div>

                    {/* Chalk Colors */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-[#162A33]">
                      <span className="text-[10px] text-slate-400 uppercase">Chalk:</span>
                      {OFFENSE_PEN_COLORS.map((c) => {
                        const isSelected = offensePenColor === c.value;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setOffensePenColor(c.value)}
                            className={`w-5 h-5 rounded-full transition-all cursor-pointer flex items-center justify-center ${c.bgClass} ${
                              isSelected ? `ring-2 ${c.ringColor} ring-offset-2 ring-offset-[#070E13] scale-110 shadow` : 'opacity-65 hover:opacity-100'
                            }`}
                            title={c.label}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Step Undo, Clear, and Fullscreen Shortcut */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomArrows((prev) => prev.slice(0, -1))}
                      disabled={customArrows.length === 0}
                      className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        customArrows.length > 0
                          ? 'border-[#162A33] bg-[#050C10] text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer'
                          : 'border-[#162A33]/50 bg-transparent text-slate-600 cursor-not-allowed'
                      }`}
                      title="Undo last stroke"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Undo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomArrows([]);
                        setCustomOffsets({});
                      }}
                      disabled={customArrows.length === 0 && Object.keys(customOffsets).length === 0}
                      className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        customArrows.length > 0 || Object.keys(customOffsets).length > 0
                          ? 'border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-950/60 cursor-pointer'
                          : 'border-[#162A33]/50 bg-transparent text-slate-600 cursor-not-allowed'
                      }`}
                      title="Clear all coach chalk marks & player shifts"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleOffenseFullscreen}
                      className="px-2.5 py-1 rounded-lg border border-teal-500/40 bg-teal-950/60 text-teal-300 hover:bg-teal-900/60 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors"
                      title="Expand to Fullscreen Tablet Chalkboard"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Fullscreen</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2D Canvas Component with Fullscreen Tablet Mode */}
              <div
                ref={offenseCanvasContainerRef}
                className={
                  isOffenseFullscreen
                    ? 'fixed inset-0 z-50 bg-[#04090D] flex flex-col p-3 sm:p-5 w-screen h-screen overflow-hidden select-none shadow-2xl'
                    : 'relative w-full aspect-[16/10] bg-[#050C10] rounded-xl border border-[#162A33] overflow-hidden'
                }
              >
                {/* Fullscreen Offense Tablet Header & Sideline Drawing Toolbar */}
                {isOffenseFullscreen && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-[#162A33] bg-[#07131B]/95 px-4 py-2.5 rounded-xl text-xs font-mono shrink-0 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-bold text-teal-400 flex items-center gap-1.5 uppercase text-xs sm:text-sm">
                        <Play className="w-4 h-4 fill-teal-400 text-teal-400" />
                        <span>Sideline Tablet:</span>
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold border border-teal-500/50 text-xs sm:text-sm tracking-wide">
                        {activePlay.name}
                      </span>
                      <span className="text-slate-400 text-xs hidden md:inline">
                        vs {DEFENSIVE_FRONTS[frontId].name} · Night Turf
                      </span>
                    </div>

                    {/* Tablet Coach Pen Toolbar when Fullscreen */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {/* Freehand vs Arrow Switcher */}
                      <div className="inline-flex rounded-lg border border-[#162A33] bg-[#050C10] p-0.5">
                        <button
                          type="button"
                          onClick={() => setOffensePenMode('freehand')}
                          className={`px-2.5 sm:px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            offensePenMode === 'freehand' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Freehand drawing: Draw routes, blocks, adjustments or circles"
                        >
                          <span>〰️ Freehand</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setOffensePenMode('arrow')}
                          className={`px-2.5 sm:px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            offensePenMode === 'arrow' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                          }`}
                          title="Straight Arrow: Drag from point A to B with directional arrow"
                        >
                          <span>➔ Arrow</span>
                        </button>
                      </div>

                      {/* Chalk Color Swatches */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-[#162A33]">
                        {OFFENSE_PEN_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setOffensePenColor(c.value)}
                            className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full transition-all cursor-pointer ${c.bgClass} ${
                              offensePenColor === c.value ? `ring-2 ${c.ringColor} ring-offset-2 ring-offset-[#070E13] scale-110 shadow` : 'opacity-65 hover:opacity-100'
                            }`}
                            title={c.label}
                          />
                        ))}
                      </div>

                      {/* Step Undo Button */}
                      <button
                        type="button"
                        onClick={() => setCustomArrows((prev) => prev.slice(0, -1))}
                        disabled={customArrows.length === 0}
                        className={`px-2 sm:px-2.5 py-1 rounded-lg border flex items-center gap-1 text-xs font-bold transition-colors ${
                          customArrows.length > 0
                            ? 'border-[#162A33] bg-[#050C10] text-slate-300 hover:text-white cursor-pointer'
                            : 'border-[#162A33]/50 text-slate-600 cursor-not-allowed'
                        }`}
                        title="Undo last stroke"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Undo</span>
                        {customArrows.length > 0 && (
                          <span className="ml-1 px-1 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {customArrows.length}
                          </span>
                        )}
                      </button>

                      {/* Clear Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomArrows([]);
                          setCustomOffsets({});
                        }}
                        disabled={customArrows.length === 0 && Object.keys(customOffsets).length === 0}
                        className={`px-2 sm:px-2.5 py-1 rounded-lg border flex items-center gap-1 text-xs font-bold transition-colors ${
                          customArrows.length > 0 || Object.keys(customOffsets).length > 0
                            ? 'border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-950/60 cursor-pointer'
                            : 'border-[#162A33]/50 text-slate-600 cursor-not-allowed'
                        }`}
                        title="Clear all chalk marks & player shifts"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                      </button>

                      {/* Exit Fullscreen */}
                      <button
                        type="button"
                        onClick={handleToggleOffenseFullscreen}
                        className="px-3 py-1.5 rounded-lg border border-teal-500/50 bg-teal-950/80 text-teal-300 hover:bg-teal-900 font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                        title="Exit Fullscreen Mode (Esc)"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Exit Fullscreen</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className={isOffenseFullscreen ? 'flex-1 w-full h-full min-h-0 flex items-center justify-center p-1 relative' : 'w-full h-full relative'}>
                  <TacticalFieldCanvas
                    play={activePlay}
                    frontId={frontId}
                    diveBehavior={diveBehavior}
                    pitchBehavior={pitchBehavior}
                    eleventhMode={eleventhMode}
                    xMode={xMode}
                    zSide={zSide}
                    targetSide={targetSide}
                    progress={progress}
                    fieldTheme="night_turf"
                    selectedPlayerId={selectedPlayerId}
                    onSelectPlayer={setSelectedPlayerId}
                    showGapLabels={showGapLabels}
                    showBlockingAngles={showBlockingAngles}
                    chalkboardMode={chalkboardMode || isOffenseFullscreen}
                    customOffsets={customOffsets}
                    onUpdateCustomOffset={(pid: string, pt: Point) =>
                      setCustomOffsets((prev) => ({ ...prev, [pid]: pt }))
                    }
                    customArrows={customArrows}
                    onAddCustomArrow={(arr) => setCustomArrows((prev) => [...prev, arr])}
                    penMode={offensePenMode}
                    penColor={offensePenColor}
                    powerPassReceiver={powerPassReceiver}
                  />

                  {/* Big Center Overlay Play Prompt if Stopped at Pre-Snap (Hidden in Fullscreen and when Coach Pen is active) */}
                  {!isOffenseFullscreen && !chalkboardMode && !isPlaying && progress === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="pointer-events-auto px-5 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 hover:bg-teal-300 transition-all transform hover:scale-105 cursor-pointer border border-teal-200"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Start 60fps Play Simulation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Tactical Playback Console Bar */}
              <div className="p-4 rounded-xl border border-[#162A33] bg-[#0A1318] space-y-3">
                {/* Upper: Playback Action Buttons */}
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
                  </div>

                  {/* Playback Speed Controls */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-mono mr-1">Speed:</span>
                    <div className="flex items-center gap-1 p-0.5 bg-[#060D11] border border-[#162A33] rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setPlaybackSpeed(0.25)}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          playbackSpeed === 0.25
                            ? 'bg-teal-400 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        0.25x
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlaybackSpeed(0.5)}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          playbackSpeed === 0.5
                            ? 'bg-teal-400 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        0.5x
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlaybackSpeed(1)}
                        className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                          playbackSpeed === 1
                            ? 'bg-teal-400 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        1.0x
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phase Jumper Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1">
                    Coaching Phases:
                  </span>
                  {activePlay.coachingPhases.map((ph) => {
                    const isCurrent = currentPhase.phase === ph.phase;
                    return (
                      <button
                        key={ph.phase}
                        type="button"
                        onClick={() => handleJumpToPhase(ph.timeRange)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                          isCurrent
                            ? 'border-teal-400 bg-teal-950/70 text-teal-300 font-bold'
                            : 'border-[#162A33] bg-[#070F14] text-slate-400 hover:text-white hover:border-[#1E3B49]'
                        }`}
                      >
                        P{ph.phase}: {ph.title.replace(/^Phase \d:\s*/, '')}
                      </button>
                    );
                  })}
                </div>

                {/* Timeline Range Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">
                      Phase {currentPhase.phase}: <strong className="text-teal-400">{currentPhase.title}</strong>
                    </span>
                    <span className="text-teal-300 font-bold">Progress: {Math.round(progress * 100)}%</span>
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
                    <span>35% Mesh & Read</span>
                    <span>65% Pitch / Keep</span>
                    <span>100% Finish</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: READ REACTION & DECISION MATRIX */}
            <section
              id="reads"
              aria-label="QB Decision Tree & Read Keys"
              className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-5"
            >
              <div className="border-b border-[#162A33]/80 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-teal-400 font-mono uppercase tracking-wider font-semibold">
                    Veer Read Progression · {activePlay.code}
                  </p>
                  <h2 className="text-2xl font-bold text-white mt-0.5 font-display">
                    Quarterback Decision Matrix
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Primary Key: {activePlay.primaryReadLabel} · Pitch Key: {activePlay.secondaryReadLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-teal-500/30 bg-[#09151D] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-300">
                    <span>#1 Key Crashes / Squeezes</span>
                    <span className="px-2 py-0.5 rounded bg-teal-950 font-mono text-[10px] border border-teal-800">
                      PULL
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activePlay.qbDecisionMatrix.crashPull}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#162A33] bg-[#081217] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>#1 Key Upfield / Bull Rush</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 font-mono text-[10px] border border-amber-800">
                      GIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activePlay.qbDecisionMatrix.squeezeGive}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#162A33] bg-[#081217] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span>#2 Pitch Key Read</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950 font-mono text-[10px] border border-indigo-800">
                      KEEP / PITCH
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activePlay.qbDecisionMatrix.pitchPhase}
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: POSITION ASSIGNMENT INSPECTOR */}
            <section
              id="positions"
              aria-label="Position Assignment Inspector"
              className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-4"
            >
              <div className="border-b border-[#162A33]/80 pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-teal-400 font-mono uppercase tracking-wider font-semibold">
                    Position Detail · {selectedOffensiveRule.fullName}
                  </p>
                  <h2 className="text-2xl font-bold text-white mt-0.5 font-display">
                    Technique & Assignment Rule
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(activePlay.positionRules).map((pid) => (
                    <button
                      key={pid}
                      onClick={() => setSelectedPlayerId(pid)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                        selectedPlayerId === pid
                          ? 'bg-teal-400 text-slate-950 border-teal-400'
                          : 'bg-[#091318] text-slate-400 border-[#162A33] hover:text-white'
                      }`}
                    >
                      {pid}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Split & Stance
                  </span>
                  <div className="text-slate-200 font-bold">{selectedOffensiveRule.split}</div>
                  <div className="text-slate-400 text-[11px]">{selectedOffensiveRule.stance}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Aiming Point & Footwork
                  </span>
                  <div className="text-slate-200 font-bold">{selectedOffensiveRule.aimingPoint}</div>
                  <div className="text-slate-400 text-[11px]">{selectedOffensiveRule.footwork}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091318] border border-teal-500/30 space-y-1 md:col-span-2">
                  <span className="text-[10px] font-mono uppercase text-teal-400 font-semibold block">
                    Assignment vs {activeFront.name}
                  </span>
                  <div className="text-slate-200 leading-relaxed">
                    {selectedOffensiveRule.assignmentsByFront[frontId]}
                  </div>
                  <div className="text-[11px] font-mono text-teal-300 pt-1">
                    Cue: &ldquo;{selectedOffensiveRule.coachingCue}&rdquo;
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: MATCHUP BLOCKING RULES MATRIX */}
            <section
              id="defense-fronts"
              aria-label="Matchup Blocking Rules Matrix"
              className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#162A33]/80">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-teal-400 uppercase tracking-wider font-semibold">
                      Matchup Assignment Matrix
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{activePlay.name}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 font-display tracking-tight flex items-center gap-2">
                    <span>Blocking & Route Rules vs</span>
                    <span className="text-amber-400">{activeFront.name}</span>
                  </h2>
                </div>

                {/* Quick Defense Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  <span className="text-slate-400 text-[11px] mr-1">Defense:</span>
                  {(Object.keys(DEFENSIVE_FRONTS) as DefensiveFrontId[]).map((fKey) => {
                    const f = DEFENSIVE_FRONTS[fKey];
                    const isSelected = frontId === fKey;
                    return (
                      <button
                        key={fKey}
                        onClick={() => setFrontId(fKey)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-[#0B151C] text-slate-400 hover:text-white border border-[#162A33]'
                        }`}
                      >
                        {f.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#162A33] bg-[#0A1318]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#162A33] bg-[#060D11] text-slate-300 font-mono">
                      <th className="py-3 px-4 font-semibold">Pos</th>
                      <th className="py-3 px-4 font-semibold">Player & Role</th>
                      <th className="py-3 px-4 font-semibold">Split / Alignment</th>
                      <th className="py-3 px-4 font-semibold text-amber-300">
                        Assignment vs {activeFront.shortLabel}
                      </th>
                      <th className="py-3 px-4 font-semibold text-teal-300">Coaching Cue</th>
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
                          <td className="py-3 px-4 font-mono font-bold text-teal-400 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30">
                              {rule.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                            {rule.fullName.split('(')[0].trim()}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                            {rule.split}
                          </td>
                          <td className="py-3 px-4 text-slate-100 font-medium leading-relaxed max-w-md">
                            {rule.assignmentsByFront[frontId]}
                          </td>
                          <td className="py-3 px-4 text-teal-300 font-mono text-[11px] italic">
                            &ldquo;{rule.coachingCue}&rdquo;
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 5: DRILLS */}
            <DrillsSection />
          </div>
        )}

        {/* TAB 2: DEFENSE COORDINATOR (3-4 to 5-2 & Primer) */}
        {activeTab === 'defense' && (
          <DefenseCoordinatorSection
            onOpenPrintModal={() => setIsDefenseWristbandOpen(true)}
          />
        )}

        {/* TAB 3: SPECIAL TEAMS COORDINATOR */}
        {activeTab === 'special_teams' && (
          <SpecialTeamsSection
            onOpenPrintModal={() => setIsSpecialTeamsPrintOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#162A33] py-6 px-6 text-xs text-slate-400 no-print bg-[#04080B]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Playbook Studio</span>
            <span>· Split Back Veer Offense | 3-4 to 5-2 Defense Primer | Special Teams</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setActiveTab('offense');
                setIsWristbandOpen(true);
              }}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Veer Wristband
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                setActiveTab('defense');
                setIsDefenseWristbandOpen(true);
              }}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Defensive Call Sheet
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                setActiveTab('special_teams');
                setIsSpecialTeamsPrintOpen(true);
              }}
              className="hover:text-teal-400 transition-colors cursor-pointer"
            >
              Special Teams Sheet
            </button>
          </div>
        </div>
      </footer>

      {/* Printable Modals */}
      <WristbandModal
        isOpen={isWristbandOpen}
        onClose={() => setIsWristbandOpen(false)}
      />

      <DefenseWristbandModal
        isOpen={isDefenseWristbandOpen}
        onClose={() => setIsDefenseWristbandOpen(false)}
      />

      <SpecialTeamsPrintModal
        isOpen={isSpecialTeamsPrintOpen}
        onClose={() => setIsSpecialTeamsPrintOpen(false)}
      />
    </div>
  );
}
