import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Radio,
  Printer,
  ChevronRight,
  Info,
  CheckCircle2,
  Sliders,
  Sparkles,
  BookOpen,
  ArrowRight,
  Eye,
  Crosshair,
  Compass,
  Users,
  Layers,
} from 'lucide-react';
import {
  COVERAGE_SCHEMES,
  CoverageScheme,
  DEFENSE_PLAYERS,
  DEFENSIVE_PRIMER_CHAPTERS,
  DefPlayerPosition,
  DefenseFormation,
  FORMATION_INFO,
  LINE_SLANTS,
  LineSlant,
  StrengthCall,
  OffensiveFormationId,
  COMMON_OFFENSE_FORMATIONS,
  SEQUENTIAL_TECH_RULES,
} from '../data/defensePrimerData';

interface DefenseCoordinatorProps {
  onOpenPrintModal: () => void;
}

export function DefenseCoordinatorSection({ onOpenPrintModal }: DefenseCoordinatorProps) {
  const [formation, setFormation] = useState<DefenseFormation>('base');
  const [coverageScheme, setCoverageScheme] = useState<CoverageScheme>('green');
  const [lineSlant, setLineSlant] = useState<LineSlant>('base_gap');
  const [strengthCall, setStrengthCall] = useState<StrengthCall>('rip');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('SAM');
  const [activeIndividualPressures, setActiveIndividualPressures] = useState<string[]>([]);
  const [showCoverageZones, setShowCoverageZones] = useState<boolean>(true);
  const [showPressureArrows, setShowPressureArrows] = useState<boolean>(true);
  const [showGaps, setShowGaps] = useState<boolean>(true);
  const [showTechniqueOverlay, setShowTechniqueOverlay] = useState<boolean>(true);
  const [offenseFormation, setOffenseFormation] = useState<OffensiveFormationId>('pro_i');
  const [alignmentMode, setAlignmentMode] = useState<'offense_adjust' | 'base_fronts'>('offense_adjust');
  const [showSequentialTechGuide, setShowSequentialTechGuide] = useState<boolean>(true);
  const [activePrimerChapter, setActivePrimerChapter] = useState<string>('philosophy');

  // Coach notes state
  const [coachNotes, setCoachNotes] = useState<string>(
    'Primer Rule: If you don’t hear a slant call, either pick the gap in front of you or if you’re heads up default pick the strong direction gap.\nShield Rule: Sam & Rover walk up aligned 2x0 at outside OL at end of LOS.\nVanguard Rule: MLBs @ 2 yds, if stacked over a lineman, pick open gap and align over it.\nShell Rule: Pass expected—linemen go get us a sack!'
  );
  const [isSavedNotes, setIsSavedNotes] = useState<boolean>(false);

  const activeFormationInfo = FORMATION_INFO[formation];
  const activeCoverage = COVERAGE_SCHEMES[coverageScheme];
  const activeSlant = LINE_SLANTS[lineSlant];
  const activeOffenseConfig = COMMON_OFFENSE_FORMATIONS[offenseFormation];
  const selectedPlayer =
    DEFENSE_PLAYERS.find((p) => p.id === selectedPlayerId) || DEFENSE_PLAYERS[4];

  const handleSelectFormation = (f: DefenseFormation) => {
    setFormation(f);
    // If selecting Shell, default to Bull Rush / sack mentality
    if (f === 'shell') {
      setLineSlant('bull_rush');
    }
  };

  const handleToggleIndividualPressure = (playerId: string) => {
    setActiveIndividualPressures((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleClearAllPressures = () => {
    setActiveIndividualPressures([]);
  };

  const handleSaveNotes = () => {
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-[#07131B] via-[#091822] to-[#0B1F2C] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              Defensive Coordinator Suite · 3-4 Defense System
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Base 3-4 <span className="text-teal-400">↔ Shield 5-2</span> · Vanguard & Shell
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Command our complete defensive scheme. Outside backers are strictly{' '}
              <strong className="text-teal-300">Sam</strong> and{' '}
              <strong className="text-teal-300">Rover</strong>, middle backers are{' '}
              <strong className="text-teal-300">Mike</strong> and{' '}
              <strong className="text-teal-300">Will</strong>. Call individual position pressures,
              line slants with 1-9 techniques, and master Base, Shield, Vanguard, and Shell.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Defensive Call Sheet
            </button>
          </div>
        </div>

        {/* Master Active Call Banner */}
        <div className="mt-6 pt-5 border-t border-[#18323F] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider font-semibold">Live Call:</span>
            <span className="px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
              FORMATION: {activeFormationInfo.name.toUpperCase()} ({activeFormationInfo.handSignal})
            </span>
            <span
              className="px-3 py-1 rounded-md font-bold border text-white flex items-center gap-1.5"
              style={{
                backgroundColor: `${activeCoverage.color}25`,
                borderColor: `${activeCoverage.color}60`,
              }}
            >
              <span>COVERAGE: {activeCoverage.codeName}</span>
              <span className="text-[11px] font-normal text-slate-300">({activeCoverage.handSignal})</span>
            </span>
            <span className="px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              SLANT: {activeSlant.name}
            </span>
            <span className="px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
              BLITZ CALLS:{' '}
              {activeIndividualPressures.length > 0
                ? activeIndividualPressures.join(' + ')
                : 'NONE (BASE COVERAGE)'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-bold border border-slate-700">
              STRENGTH: {strengthCall.toUpperCase()} ({strengthCall === 'rip' ? 'Right' : 'Left'})
            </span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tempo Check: &ldquo;RELOAD!&rdquo;</span>
          </div>
        </div>
      </div>

      {/* Control Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Formations, Slants & Individual Pressures */}
        <div className="lg:col-span-4 space-y-6">
          {/* Common Offense Formations & Alignment Adjustments */}
          <div className="rounded-2xl border border-teal-500/30 bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                <Users className="w-4 h-4 text-emerald-400" />
                Common Offense Formations
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                6 Formations
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Select an offensive look to see our 3-4 defense calibrate its sequential techniques, gap fits, and backer depths:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(COMMON_OFFENSE_FORMATIONS) as OffensiveFormationId[]).map((ofId) => {
                const off = COMMON_OFFENSE_FORMATIONS[ofId];
                const isSelected = offenseFormation === ofId;
                return (
                  <button
                    key={ofId}
                    onClick={() => {
                      setOffenseFormation(ofId);
                      setAlignmentMode('offense_adjust');
                      if (off.defaultStrength) setStrengthCall(off.defaultStrength);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/40 text-white shadow-lg shadow-emerald-950/50'
                        : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono text-emerald-300">
                        {off.shortName}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {off.personnel.split('(')[0].trim()}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Offense Breakdown & Adjustment Rule */}
            <div className="p-3 rounded-xl bg-[#091318] border border-emerald-500/20 text-xs space-y-2">
              <div className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>{activeOffenseConfig.name}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeOffenseConfig.formationStyle}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeOffenseConfig.description}
              </p>
              <div className="pt-2 border-t border-[#162A33] text-[11px] text-teal-200 bg-teal-950/30 p-2 rounded border border-teal-800/30">
                <strong className="text-teal-300">Sequential Tech Adjustment: </strong>
                {activeOffenseConfig.adjustmentSummary}
              </div>
            </div>
          </div>

          {/* 4 Formations Selector */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                <Sliders className="w-4 h-4 text-teal-400" />
                Defensive Formation & Hand Signal
              </div>
              <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                4 Formations
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(FORMATION_INFO) as DefenseFormation[]).map((fKey) => {
                const info = FORMATION_INFO[fKey];
                const isSelected = formation === fKey;
                return (
                  <button
                    key={fKey}
                    onClick={() => handleSelectFormation(fKey)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-teal-400 bg-teal-950/60 text-white shadow-lg shadow-teal-950/50'
                        : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase font-mono text-teal-300">
                        {info.codeName}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                      {info.name}
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono mt-1">
                      {info.handSignal}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Formation Callout */}
            <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] text-xs space-y-2">
              <div className="font-semibold text-teal-300 flex items-center justify-between">
                <span>{activeFormationInfo.name}</span>
                <span className="font-mono text-[11px] text-amber-400">
                  Signal: {activeFormationInfo.handSignal}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeFormationInfo.doctrine}
              </p>
              <div className="pt-1.5 border-t border-[#162A33] space-y-1 text-[10px] text-slate-400">
                <div>
                  <strong className="text-teal-400">OLBs (Sam & Rover):</strong>{' '}
                  {activeFormationInfo.olbRule}
                </div>
                <div>
                  <strong className="text-teal-400">MLBs (Mike & Will):</strong>{' '}
                  {activeFormationInfo.mlbRule}
                </div>
                <div>
                  <strong className="text-teal-400">Linemen:</strong>{' '}
                  {activeFormationInfo.linemenRule}
                </div>
              </div>
            </div>

            {/* Strength Switch (Rip / Liz) */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 font-mono">Front Strength Call:</span>
              <div className="inline-flex rounded-lg border border-[#162A33] bg-[#0A1318] p-0.5">
                <button
                  onClick={() => setStrengthCall('rip')}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                    strengthCall === 'rip'
                      ? 'bg-teal-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  RIP (Right / Strong)
                </button>
                <button
                  onClick={() => setStrengthCall('liz')}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                    strengthCall === 'liz'
                      ? 'bg-teal-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LIZ (Left / Weak)
                </button>
              </div>
            </div>
          </div>

          {/* D-Line Slants & Gap Stunts */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                <Crosshair className="w-4 h-4 text-amber-400" />
                Line Slants & Gap Stunts
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {activeSlant.slants.length} DL Tracks
              </span>
            </div>

            <div className="space-y-2">
              {(Object.keys(LINE_SLANTS) as LineSlant[]).map((sKey) => {
                const slant = LINE_SLANTS[sKey];
                const isSelected = lineSlant === sKey;
                return (
                  <button
                    key={sKey}
                    onClick={() => setLineSlant(sKey)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30 text-white'
                        : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{slant.name}</span>
                        {sKey === 'base_gap' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-900/60 text-teal-300 font-mono">
                            Primer Default
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{slant.signal}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-900/50">
                      {slant.description.split('.')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 rounded-lg bg-[#0A161E] border border-amber-500/20 text-[11px] text-slate-300">
              <strong className="text-amber-400">Primer Gap Rule: </strong>
              {activeSlant.linemenRule}
            </div>
          </div>

          {/* Individual Position Pressure Calls (No Packaged Blitzes) */}
          {/* Individual Position Blitz Calls: Mike, Will, Sam, Rover Only */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                <Zap className="w-4 h-4 text-purple-400" />
                Blitz Calls (Linebackers Only)
              </div>
              {activeIndividualPressures.length > 0 && (
                <button
                  onClick={handleClearAllPressures}
                  className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              From primer: Blitz calls are simply <strong className="text-purple-300">Mike, Will, Sam, Rover</strong>. No packaged blitzes, dog, or fire calls. Linebackers only shoot their assigned gap based on the DL alignment:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SAM', label: 'Sam', role: 'Assigned Edge / C-Gap' },
                { id: 'ROV', label: 'Rover', role: 'Assigned Edge / C-Gap' },
                { id: 'MIKE', label: 'Mike', role: 'Assigned Gap (DL Fit)' },
                { id: 'WILL', label: 'Will', role: 'Assigned Gap (DL Fit)' },
              ].map((b) => {
                const isActive = activeIndividualPressures.includes(b.id);
                return (
                  <button
                    key={b.id}
                    onClick={() => handleToggleIndividualPressure(b.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'border-purple-400 bg-purple-950/40 text-white shadow ring-1 ring-purple-400/50'
                        : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 font-mono">{b.label}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{b.role}</div>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-purple-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isActive ? 'BLITZ' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coverage Call Selector (Blue, Green, Black Only) */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm font-display">
                <Radio className="w-4 h-4 text-teal-400" />
                Coverage Signals (Blue · Green · Black)
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {activeCoverage.deepCoverage.split('(')[0]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(COVERAGE_SCHEMES) as CoverageScheme[]).map((covKey) => {
                const cov = COVERAGE_SCHEMES[covKey];
                const isSelected = coverageScheme === covKey;
                return (
                  <button
                    key={covKey}
                    onClick={() => setCoverageScheme(covKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-white text-white shadow-lg'
                        : 'border-[#162A33] bg-[#091318] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${cov.color}25` : undefined,
                      borderColor: isSelected ? cov.color : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-xs font-extrabold uppercase"
                        style={{ color: cov.color }}
                      >
                        {cov.codeName}
                      </span>
                      {isSelected && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cov.color }}
                        />
                      )}
                    </div>
                    <div className="text-[10px] text-amber-300 font-sans mt-1">
                      {cov.handSignal.split(' ')[0]} {cov.handSignal.split(' ').slice(1, 3).join(' ')}
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                      {cov.name.split('(')[0].trim()}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] text-xs space-y-2">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-400" />
                  {activeCoverage.name} ({activeCoverage.codeName})
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-300">
                  {activeCoverage.handSignal}
                </span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-[#162A33] text-[11px] text-amber-200/90 font-mono">
                <strong>Signal Action: </strong>{activeCoverage.handSignalDesc}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {activeCoverage.philosophy}
              </p>
              <div className="text-[11px] font-mono text-teal-300 pt-1">
                Situation: {activeCoverage.situationalCall}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Field Canvas & Chalkboard */}
        <div className="lg:col-span-8 space-y-6">
          {/* Canvas Wrapper */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-4 lg:p-6 shadow-2xl space-y-4">
            {/* Field Controls Header */}
            {/* Alignment Mode & Offense Quick Switch Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#09151E] border border-teal-500/30">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  Mode:
                </span>
                <div className="inline-flex rounded-lg border border-[#162A33] bg-[#070E13] p-0.5">
                  <button
                    onClick={() => setAlignmentMode('offense_adjust')}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      alignmentMode === 'offense_adjust'
                        ? 'bg-emerald-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🏈 Adjust to Offense ({activeOffenseConfig.shortName})</span>
                  </button>
                  <button
                    onClick={() => setAlignmentMode('base_fronts')}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      alignmentMode === 'base_fronts'
                        ? 'bg-teal-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🛡️ 4 Defense Fronts ({activeFormationInfo.codeName})</span>
                  </button>
                </div>
              </div>

              {/* Offense Quick Switch Pills */}
              <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
                <span className="text-[11px] text-slate-400 mr-1">Scout Set:</span>
                {(Object.keys(COMMON_OFFENSE_FORMATIONS) as OffensiveFormationId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setOffenseFormation(id);
                      setAlignmentMode('offense_adjust');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      offenseFormation === id && alignmentMode === 'offense_adjust'
                        ? 'bg-emerald-400 text-slate-950 font-bold shadow'
                        : 'bg-[#0A161E] text-slate-400 hover:text-slate-200 border border-[#162E3B]'
                    }`}
                  >
                    {COMMON_OFFENSE_FORMATIONS[id].shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Controls Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Tactical Chalkboard
                </span>
                <span className="text-xs text-slate-300">
                  {alignmentMode === 'offense_adjust' ? (
                    <span className="text-emerald-300 font-medium">
                      · Calibrated to: <strong>{activeOffenseConfig.name}</strong> ({activeOffenseConfig.personnel})
                    </span>
                  ) : (
                    <span className="text-teal-300 font-medium">
                      · Defense Front: <strong>{activeFormationInfo.name}</strong> ({activeFormationInfo.handSignal})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showCoverageZones}
                    onChange={(e) => setShowCoverageZones(e.target.checked)}
                    className="rounded border-slate-700 text-teal-400 focus:ring-0"
                  />
                  <span>Coverage Zones</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showPressureArrows}
                    onChange={(e) => setShowPressureArrows(e.target.checked)}
                    className="rounded border-slate-700 text-purple-400 focus:ring-0"
                  />
                  <span>Pressure / Slants</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showGaps}
                    onChange={(e) => setShowGaps(e.target.checked)}
                    className="rounded border-slate-700 text-teal-400 focus:ring-0"
                  />
                  <span>Gap Badges</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={showTechniqueOverlay}
                    onChange={(e) => setShowTechniqueOverlay(e.target.checked)}
                    className="rounded border-slate-700 text-amber-400 focus:ring-0"
                  />
                  <span>Sequential Tech System</span>
                </label>
              </div>
            </div>

            {/* Sequential Tech System Reference Panel */}
            {showTechniqueOverlay && (
              <div className="p-3.5 rounded-xl bg-[#08131A] border border-amber-500/30 text-xs space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-bold font-mono uppercase tracking-wider">
                      ★ Sequential Tech System:
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Center 0 · Guard 1,2,3 · Tackle 4,5,6 · TE 7,8,9 · Backers (Depth then Tech)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                    Base 3-4 Rules
                  </span>
                </div>

                {/* 4 Linemen Categories from Prompt */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-black/40 border border-[#182C37] space-y-1">
                    <div className="text-amber-400 font-bold">Center: 0 / 0W / 0S</div>
                    <div className="text-slate-300 text-[10px] leading-tight">
                      <strong>0:</strong> Head-up on C<br />
                      <strong>0 Weak:</strong> Weak A gap<br />
                      <strong>0 Strong:</strong> Strong A gap
                    </div>
                  </div>

                  <div className="p-2 rounded bg-black/40 border border-[#182C37] space-y-1">
                    <div className="text-amber-400 font-bold">Guard: 1, 2, 3</div>
                    <div className="text-slate-300 text-[10px] leading-tight">
                      <strong>1:</strong> Inside shade (A)<br />
                      <strong>2:</strong> Head-up on G<br />
                      <strong>3:</strong> Outside shade (B)
                    </div>
                  </div>

                  <div className="p-2 rounded bg-black/40 border border-[#182C37] space-y-1">
                    <div className="text-amber-400 font-bold">Tackle: 4, 5, 6</div>
                    <div className="text-slate-300 text-[10px] leading-tight">
                      <strong>4:</strong> Inside shade (B)<br />
                      <strong>5:</strong> Head-up on OT<br />
                      <strong>6:</strong> Outside shade (C)
                    </div>
                  </div>

                  <div className="p-2 rounded bg-black/40 border border-[#182C37] space-y-1">
                    <div className="text-amber-400 font-bold">TE: 7, 8, 9</div>
                    <div className="text-slate-300 text-[10px] leading-tight">
                      <strong>7:</strong> Inside shade (C)<br />
                      <strong>8:</strong> Head-up on TE<br />
                      <strong>9:</strong> Outside shade / 2x0 Edge
                    </div>
                  </div>
                </div>

                {/* Backers: Depth then Tech + Base 3-4 Exact Formula Callout */}
                <div className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-500/30 text-[11px] space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-teal-300 font-bold font-mono">
                    <span>Backers Rule: Depth then Tech (e.g. 34 Tech = 3 Tech outside shade G, 4 yds depth)</span>
                    <span className="text-amber-300">Base 3-4 Alignment Blueprint</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-[10.5px] font-mono text-slate-300">
                    <div>• <strong className="text-teal-300">NG:</strong> 0 Tech with Strong A gap</div>
                    <div>• <strong className="text-teal-300">SDE:</strong> 6 Tech (outside shade OT) Strong C Gap</div>
                    <div>• <strong className="text-teal-300">WDE:</strong> 4 Tech B Gap (inside shade OT)</div>
                    <div>• <strong className="text-teal-300">Rover:</strong> 2x2 yards outside LOS Outside contain for cutback/reverse</div>
                    <div>• <strong className="text-teal-300">Sam:</strong> 2x2 Outside Contain Strong side take blocks on inside shoulder</div>
                    <div>• <strong className="text-teal-300">Mike:</strong> 34 Tech, outside shade of G, 4 yds depth, Strong B Gap</div>
                    <div>• <strong className="text-teal-300">Will:</strong> 14 Tech, inside shade WG, 4 yds depth, Weak A Gap</div>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive SVG Chalkboard */}
            <div className="relative w-full aspect-[16/10] bg-[#050C10] rounded-xl border border-[#162A33] overflow-hidden select-none">
              <svg
                viewBox="0 0 1000 620"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Field hash pattern */}
                  <pattern id="defFieldGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="100" y2="0" stroke="#0E232E" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#0E232E" strokeWidth="1" strokeDasharray="4 4" />
                  </pattern>

                  {/* Marker arrow for slant */}
                  <marker
                    id="slantArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#F59E0B" />
                  </marker>

                  {/* Marker arrow for individual pressure */}
                  <marker
                    id="pressureArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#C084FC" />
                  </marker>
                </defs>

                {/* Field Grass Background */}
                <rect width="1000" height="620" fill="#04090D" />
                <rect width="1000" height="620" fill="url(#defFieldGrid)" opacity="0.6" />

                {/* Yard Lines */}
                <line x1="50" y1="170" x2="950" y2="170" stroke="#162E3B" strokeWidth="1.5" />
                <line x1="50" y1="280" x2="950" y2="280" stroke="#162E3B" strokeWidth="1.5" />
                <line x1="50" y1="390" x2="950" y2="390" stroke="#2DD4BF" strokeWidth="2.5" opacity="0.8" />
                <line x1="50" y1="500" x2="950" y2="500" stroke="#162E3B" strokeWidth="1.5" />

                {/* LOS Label */}
                <text x="70" y="384" fill="#2DD4BF" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  LINE OF SCRIMMAGE (LOS)
                </text>
                <text x="780" y="384" fill="#2DD4BF" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  FORMATION: {activeFormationInfo.codeName}
                </text>

                {/* Hash marks */}
                {[200, 300, 400, 500, 600, 700, 800].map((x) => (
                  <g key={x} stroke="#1D3E4F" strokeWidth="1">
                    <line x1={x} y1="380" x2={x} y2="400" />
                    <line x1={x} y1="270" x2={x} y2="290" />
                    <line x1={x} y1="160" x2={x} y2="180" />
                  </g>
                ))}

                {/* Gaps Label across LOS */}
                {showGaps && (
                  <g opacity="0.85">
                    <rect x="462" y="378" width="32" height="18" rx="4" fill="#0B232E" stroke="#14B8A6" strokeWidth="1" />
                    <text x="478" y="391" fill="#5EEAD4" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      A
                    </text>

                    <rect x="506" y="378" width="32" height="18" rx="4" fill="#0B232E" stroke="#14B8A6" strokeWidth="1" />
                    <text x="522" y="391" fill="#5EEAD4" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      A
                    </text>

                    <rect x="424" y="378" width="32" height="18" rx="4" fill="#0B232E" stroke="#14B8A6" strokeWidth="1" />
                    <text x="440" y="391" fill="#5EEAD4" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      B
                    </text>

                    <rect x="544" y="378" width="32" height="18" rx="4" fill="#0B232E" stroke="#14B8A6" strokeWidth="1" />
                    <text x="560" y="391" fill="#5EEAD4" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      B
                    </text>

                    <rect x="360" y="378" width="32" height="18" rx="4" fill="#0B232E" stroke="#14B8A6" strokeWidth="1" />
                    <text x="376" y="391" fill="#5EEAD4" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      C
                    </text>

                    <rect x="625" y="378" width="32" height="18" rx="4" fill="#0B232E" stroke="#14B8A6" strokeWidth="1" />
                    <text x="641" y="391" fill="#5EEAD4" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      C
                    </text>

                    <rect x="285" y="378" width="56" height="18" rx="4" fill="#0B232E" stroke="#F59E0B" strokeWidth="1" />
                    <text x="313" y="391" fill="#FCD34D" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      D (ROV 2x0)
                    </text>

                    <rect x="690" y="378" width="56" height="18" rx="4" fill="#0B232E" stroke="#F59E0B" strokeWidth="1" />
                    <text x="718" y="391" fill="#FCD34D" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      D (SAM 2x0)
                    </text>
                  </g>
                )}

                {/* OFFENSIVE FORMATION (Dynamic Scout Offensive Formation) */}
                <g id="offense-scout-look" opacity="0.88">
                  {activeOffenseConfig.players.map((o) => (
                    <g key={o.id} className="cursor-pointer group">
                      <circle
                        cx={o.x}
                        cy={o.y}
                        r="14.5"
                        fill="#101B23"
                        stroke={o.isEligible ? '#38BDF8' : '#64748B'}
                        strokeWidth={o.isEligible ? '1.8' : '1.4'}
                      />
                      <text
                        x={o.x}
                        y={o.y + 4}
                        fill={o.isEligible ? '#7DD3FC' : '#CBD5E1'}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {o.label}
                      </text>
                    </g>
                  ))}
                  <text
                    x="500"
                    y="555"
                    fill="#38BDF8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Offense: {activeOffenseConfig.name} · {activeOffenseConfig.formationStyle} ({activeOffenseConfig.personnel})
                  </text>
                </g>

                {/* COVERAGE ZONES OVERLAYS */}
                {showCoverageZones &&
                  activeCoverage.coverageZones.map((zone, idx) => (
                    <g key={idx} opacity="0.32">
                      <ellipse
                        cx={zone.x}
                        cy={zone.y}
                        rx={zone.radiusX}
                        ry={zone.radiusY}
                        fill={activeCoverage.color}
                        stroke={activeCoverage.color}
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <text
                        x={zone.x}
                        y={zone.y + 4}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        opacity="0.95"
                      >
                        {zone.label}
                      </text>
                    </g>
                  ))}

                {/* D-LINE SLANT ARROWS */}
                {showPressureArrows &&
                  activeSlant.slants.map((slant, idx) => {
                    const p = DEFENSE_PLAYERS.find((d) => d.id === slant.playerId);
                    if (!p) return null;
                    const adj = activeOffenseConfig.adjustments[slant.playerId];
                    const coords = (alignmentMode === 'offense_adjust' && adj)
                      ? { x: adj.x, y: adj.y }
                      : p.formations[formation];
                    return (
                      <g key={`slant-${idx}`}>
                        <line
                          x1={coords.x}
                          y1={coords.y}
                          x2={slant.arrowEnd.x}
                          y2={slant.arrowEnd.y}
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                          markerEnd="url(#slantArrow)"
                        />
                        <text
                          x={(coords.x + slant.arrowEnd.x) / 2}
                          y={(coords.y + slant.arrowEnd.y) / 2 - 4}
                          fill="#FDE68A"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {slant.label}
                        </text>
                      </g>
                    );
                  })}

                {/* INDIVIDUAL PRESSURE CALL ARROWS */}
                {showPressureArrows &&
                  activeIndividualPressures.map((playerId) => {
                    const p = DEFENSE_PLAYERS.find((d) => d.id === playerId);
                    if (!p) return null;
                    const adj = activeOffenseConfig.adjustments[playerId];
                    const coords = (alignmentMode === 'offense_adjust' && adj)
                      ? { x: adj.x, y: adj.y }
                      : p.formations[formation];
                    const pressure = p.individualPressure;
                    if (!pressure) return null;
                    return (
                      <g key={`pressure-${playerId}`}>
                        <line
                          x1={coords.x}
                          y1={coords.y}
                          x2={pressure.arrowEnd.x}
                          y2={pressure.arrowEnd.y}
                          stroke="#C084FC"
                          strokeWidth="3.2"
                          markerEnd="url(#pressureArrow)"
                        />
                        <text
                          x={(coords.x + pressure.arrowEnd.x) / 2}
                          y={(coords.y + pressure.arrowEnd.y) / 2 - 6}
                          fill="#F3E8FF"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {pressure.callName}
                        </text>
                      </g>
                    );
                  })}

                {/* DEFENSIVE PLAYERS (11) */}
                {DEFENSE_PLAYERS.map((player) => {
                  const adj = activeOffenseConfig.adjustments[player.id];
                  const coords = (alignmentMode === 'offense_adjust' && adj)
                    ? {
                        x: adj.x,
                        y: adj.y,
                        depthYards: adj.depthYards,
                        alignmentDesc: adj.assignmentNote,
                        technique: adj.sequentialTech,
                        gap: adj.gap,
                        sequentialTech: adj.sequentialTech,
                      }
                    : player.formations[formation];
                  const isSelected = selectedPlayerId === player.id;
                  const isSamOrRover = player.id === 'SAM' || player.id === 'ROV';
                  const isMikeOrWill = player.id === 'MIKE' || player.id === 'WILL';
                  const hasActivePressure = activeIndividualPressures.includes(player.id);

                  return (
                    <g
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className="cursor-pointer group"
                      style={{
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        transformOrigin: `${coords.x}px ${coords.y}px`,
                      }}
                    >
                      {/* Active individual pressure ring - stationary tactical reticle */}
                      {hasActivePressure && (
                        <g>
                          <circle
                            cx={coords.x}
                            cy={coords.y}
                            r="23"
                            fill="#C084FC"
                            fillOpacity="0.12"
                            stroke="#C084FC"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                          {/* Tactical crosshair notches */}
                          <line
                            x1={coords.x - 27}
                            y1={coords.y}
                            x2={coords.x - 21}
                            y2={coords.y}
                            stroke="#C084FC"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <line
                            x1={coords.x + 21}
                            y1={coords.y}
                            x2={coords.x + 27}
                            y2={coords.y}
                            stroke="#C084FC"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <line
                            x1={coords.x}
                            y1={coords.y - 27}
                            x2={coords.x}
                            y2={coords.y - 21}
                            stroke="#C084FC"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <line
                            x1={coords.x}
                            y1={coords.y + 21}
                            x2={coords.x}
                            y2={coords.y + 27}
                            stroke="#C084FC"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </g>
                      )}

                      {/* Selected halo */}
                      {isSelected && (
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r="22"
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="3"
                        />
                      )}

                      {/* Player Circle Node */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="16"
                        fill={
                          isSamOrRover
                            ? formation === 'shield' || formation === 'vanguard'
                              ? '#0F766E'
                              : '#134E4A'
                            : isMikeOrWill
                            ? '#1E3A8A'
                            : '#042F2E'
                        }
                        stroke={
                          hasActivePressure
                            ? '#C084FC'
                            : isSamOrRover
                            ? '#2DD4BF'
                            : isMikeOrWill
                            ? '#60A5FA'
                            : '#14B8A6'
                        }
                        strokeWidth={isSelected ? '2.5' : '1.8'}
                      />

                      {/* Player Label */}
                      <text
                        x={coords.x}
                        y={coords.y - 1}
                        fill="#FFFFFF"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {player.id}
                      </text>

                      {/* Jersey number under label */}
                      <text
                        x={coords.x}
                        y={coords.y + 9}
                        fill="#5EEAD4"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {player.number}
                      </text>

                      {/* Sequential Tech / Depth Tag indicator */}
                      <g>
                        <rect
                          x={coords.x - 30}
                          y={coords.y + 19}
                          width="60"
                          height="12"
                          rx="3"
                          fill="#0A1C24"
                          stroke={alignmentMode === 'offense_adjust' ? '#14B8A6' : '#1E3A8A'}
                          strokeWidth="0.8"
                        />
                        <text
                          x={coords.x}
                          y={coords.y + 28}
                          fill={alignmentMode === 'offense_adjust' ? '#5EEAD4' : '#93C5FD'}
                          fontSize="7.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {alignmentMode === 'offense_adjust' && adj
                            ? adj.sequentialTech.split('(')[0].trim()
                            : isSamOrRover && (formation === 'shield' || formation === 'vanguard')
                            ? '2x0 LOS'
                            : player.sequentialTechCode || `${coords.depthYards} yd`}
                        </text>
                      </g>

                      {/* Selected Player Name Tag */}
                      {isSelected && (
                        <g>
                          <rect
                            x={coords.x - 55}
                            y={coords.y - 34}
                            width="110"
                            height="18"
                            rx="4"
                            fill="#0A1C24"
                            stroke="#38BDF8"
                            strokeWidth="1"
                          />
                          <text
                            x={coords.x}
                            y={coords.y - 21}
                            fill="#E0F2FE"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {player.name} ({player.id})
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Selected Player Assignment & Alignment Inspector */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162A33] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono font-extrabold text-teal-300">
                  {selectedPlayer.id}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-display">
                    #{selectedPlayer.number} {selectedPlayer.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedPlayer.role}</p>
                </div>
              </div>

              {selectedPlayer.canBlitz && selectedPlayer.individualPressure ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleIndividualPressure(selectedPlayer.id)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeIndividualPressures.includes(selectedPlayer.id)
                        ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-900/50'
                        : 'bg-[#0B1A22] border border-purple-500/30 text-purple-300 hover:bg-purple-950/40'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {activeIndividualPressures.includes(selectedPlayer.id)
                      ? 'Blitz Called (Active)'
                      : `Call ${selectedPlayer.individualPressure.callName} Blitz`}
                  </button>
                </div>
              ) : (
                <div className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-[#091318] border border-[#162A33]">
                  Coverage / Gap Responsibility
                </div>
              )}
            </div>

            {/* Base 3-4 Sequential Tech Formula Box */}
            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider font-bold">
                  Base 3-4 Sequential Tech Formula:
                </span>
                <div className="text-xs font-mono font-bold text-slate-100">
                  {selectedPlayer.sequentialTechBase}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#0A1C24] text-amber-300 font-mono text-xs font-bold border border-amber-500/40 shrink-0">
                {selectedPlayer.sequentialTechCode || 'Backer/DB'}
              </span>
            </div>

            {/* Current Formation Alignment Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  {alignmentMode === 'offense_adjust' ? 'Target Offense Set' : 'Active Defense Front'}
                </div>
                <div className="text-xs font-bold text-teal-300 font-mono">
                  {alignmentMode === 'offense_adjust' ? activeOffenseConfig.name : activeFormationInfo.name}
                </div>
                <div className="text-[11px] text-slate-300">
                  {alignmentMode === 'offense_adjust' && activeOffenseConfig.adjustments[selectedPlayer.id]
                    ? activeOffenseConfig.adjustments[selectedPlayer.id].assignmentNote
                    : selectedPlayer.formations[formation].alignmentDesc}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  Technique & Depth
                </div>
                <div className="text-xs font-bold text-amber-300 font-mono">
                  {alignmentMode === 'offense_adjust' && activeOffenseConfig.adjustments[selectedPlayer.id]
                    ? activeOffenseConfig.adjustments[selectedPlayer.id].sequentialTech
                    : selectedPlayer.formations[formation].technique}
                </div>
                <div className="text-[11px] text-slate-300">
                  Depth:{' '}
                  {alignmentMode === 'offense_adjust' && activeOffenseConfig.adjustments[selectedPlayer.id]
                    ? `${activeOffenseConfig.adjustments[selectedPlayer.id].depthYards} yds`
                    : `${selectedPlayer.formations[formation].depthYards} yards off ball`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  Assigned Gap / Track
                </div>
                <div className="text-xs font-bold text-teal-300 font-mono">
                  {alignmentMode === 'offense_adjust' && activeOffenseConfig.adjustments[selectedPlayer.id]
                    ? activeOffenseConfig.adjustments[selectedPlayer.id].gap
                    : selectedPlayer.formations[formation].gap}
                </div>
                <div className="text-[11px] text-slate-400">
                  Coverage: {activeCoverage.responsibilities[selectedPlayer.id] || 'Pass rush / Spy'}
                </div>
              </div>
            </div>

            {/* 4 Formations Breakdown for this Player */}
            <div className="p-3.5 rounded-xl bg-[#09151E] border border-teal-500/20 text-xs space-y-2">
              <span className="font-bold text-teal-300 font-mono uppercase tracking-wider block">
                ★ 4-Formation Assignment Rules for {selectedPlayer.name}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="p-2 rounded bg-black/40 border border-[#162A33]">
                  <strong className="text-teal-400">Base (3-4):</strong>{' '}
                  {selectedPlayer.baseAssignment}
                </div>
                <div className="p-2 rounded bg-black/40 border border-[#162A33]">
                  <strong className="text-teal-400">Shield (5-2):</strong>{' '}
                  {selectedPlayer.shieldAssignment}
                </div>
                <div className="p-2 rounded bg-black/40 border border-[#162A33]">
                  <strong className="text-yellow-400">Vanguard (Goal Line):</strong>{' '}
                  {selectedPlayer.vanguardAssignment}
                </div>
                <div className="p-2 rounded bg-black/40 border border-[#162A33]">
                  <strong className="text-blue-400">Shell (Deep Pass):</strong>{' '}
                  {selectedPlayer.shellAssignment}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defensive Primer Manual Interactive Reader */}
      <div className="rounded-2xl border border-teal-500/30 bg-[#070E13] p-6 lg:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#162A33] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-teal-400 font-mono text-xs font-semibold uppercase">
              <BookOpen className="w-4 h-4" />
              Official Defensive Primer
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              Defensive Playbook & Doctrine Manual
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPrintModal}
              className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold hover:bg-teal-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Primer Call Card
            </button>
          </div>
        </div>

        {/* Chapter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {DEFENSIVE_PRIMER_CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActivePrimerChapter(ch.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activePrimerChapter === ch.id
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                  : 'bg-[#091318] border border-[#162A33] text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {ch.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Active Chapter Card */}
        {(() => {
          const ch =
            DEFENSIVE_PRIMER_CHAPTERS.find((c) => c.id === activePrimerChapter) ||
            DEFENSIVE_PRIMER_CHAPTERS[0];
          return (
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#08151D] to-[#0A1A24] border border-[#18323F] space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                  {ch.category.toUpperCase()} DOCTRINE
                </span>
                <h3 className="text-xl font-bold text-white font-display">{ch.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{ch.summary}</p>
              </div>

              {/* Key Teaching Points */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Key Teaching Points & Rules:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ch.keyPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#050C10] border border-[#162A33] text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coaching Quote */}
              {ch.coachingQuote && (
                <div className="p-4 rounded-xl bg-teal-950/20 border-l-4 border-teal-400 text-teal-200 text-xs sm:text-sm italic font-display">
                  {ch.coachingQuote}
                </div>
              )}
            </div>
          );
        })()}

        {/* Coach Custom Notes Pad */}
        <div className="p-5 rounded-xl bg-[#08131A] border border-[#162A33] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
              Coordinator Game-Day Adjustments & Sideline Rules
            </span>
            <div className="flex items-center gap-2">
              {isSavedNotes && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 rounded-md bg-teal-400 text-slate-950 font-bold text-xs hover:bg-teal-300 transition-colors cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
          <textarea
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            rows={4}
            className="w-full bg-[#050C10] border border-[#18323F] rounded-lg p-3 text-xs text-slate-200 font-mono focus:border-teal-400 focus:outline-none"
            placeholder="Type defensive adjustments, check rules, or opponent specific tells..."
          />
        </div>
      </div>
    </div>
  );
}
