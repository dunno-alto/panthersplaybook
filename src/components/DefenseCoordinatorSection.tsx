import React, { useState, useMemo } from 'react';
import {
  Shield,
  Zap,
  Radio,
  Printer,
  ChevronRight,
  Info,
  CheckCircle2,
  Sliders,
  BookOpen,
  Crosshair,
  Compass,
  Users,
  Layers,
  RotateCcw,
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
  SELECTABLE_FRONTS,
  SelectableFront,
  StrengthCall,
  OffensiveFormationId,
  COMMON_OFFENSE_FORMATIONS,
  SEQUENTIAL_TECH_RULES,
  FormationCoord,
  detectStrengthCall,
  BallHashPosition,
  StrengthDetectionResult,
} from '../data/defensePrimerData';

interface DefenseCoordinatorProps {
  onOpenPrintModal: () => void;
}

export function DefenseCoordinatorSection({ onOpenPrintModal }: DefenseCoordinatorProps) {
  // 4 Core Live Call Components: <Formation-Front-Coverage-Blitz>
  const [formation, setFormation] = useState<DefenseFormation>('base');
  const [frontCall, setFrontCall] = useState<SelectableFront | null>(null); // null = Base gap integrity (default)
  const [coverageScheme, setCoverageScheme] = useState<CoverageScheme>('green');
  const [blitzCall, setBlitzCall] = useState<'MIKE' | 'WILL' | 'SAM' | 'ROV' | null>(null);

  // Field & Scout Setup with Auto-Detect Strength Call
  const [autoDetectStrength, setAutoDetectStrength] = useState<boolean>(true);
  const [ballHash, setBallHash] = useState<BallHashPosition>('middle');
  const [manualStrength, setManualStrength] = useState<StrengthCall>('liz');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('SAM');
  const [showCoverageZones, setShowCoverageZones] = useState<boolean>(true);
  const [showPressureArrows, setShowPressureArrows] = useState<boolean>(true);
  const [showGaps, setShowGaps] = useState<boolean>(true);
  const [showTechniqueOverlay, setShowTechniqueOverlay] = useState<boolean>(true);
  const [offenseFormation, setOffenseFormation] = useState<OffensiveFormationId>('pro_i');
  const [alignmentMode, setAlignmentMode] = useState<'base_fronts' | 'offense_adjust'>('base_fronts');
  const [activePrimerChapter, setActivePrimerChapter] = useState<string>('philosophy');

  // Auto-detect strength based on the 4 rules from defensive perspective:
  // 1: TE side
  // 2: WR heavy side
  // 3: Wide side of field if balanced formation
  // 4: If balanced in the middle - Strong Left
  const detectedStrength: StrengthDetectionResult = useMemo(() => {
    return detectStrengthCall(offenseFormation, ballHash);
  }, [offenseFormation, ballHash]);

  const strengthCall: StrengthCall = autoDetectStrength ? detectedStrength.call : manualStrength;

  // Active configurations
  const activeFormationInfo = FORMATION_INFO[formation];
  const activeCoverage = COVERAGE_SCHEMES[coverageScheme];
  const activeFront = frontCall ? LINE_SLANTS[frontCall] : null;
  const activeOffenseConfig = COMMON_OFFENSE_FORMATIONS[offenseFormation];
  const selectedPlayer =
    DEFENSE_PLAYERS.find((p) => p.id === selectedPlayerId) || DEFENSE_PLAYERS[4];

  // Live call format: <Formation-Front-Coverage-Blitz>
  // "there should not be bull rush or base. If no front is specified, that is base"
  // "Base, Shield, Vanguard, Shell"
  // "Slant, Pinch, Out"
  // "Blue, Green, Black"
  // "Mike, Will, Sam, Rover"
  const formationCode = activeFormationInfo.codeName; // 'BASE' | 'SHIELD' | 'VANGUARD' | 'SHELL'
  const frontCode = frontCall ? (LINE_SLANTS[frontCall]?.callCode || frontCall.toUpperCase()) : null; // 'SLANT' | 'PINCH' | 'OUT' | null
  const coverageCode = activeCoverage.codeName; // 'BLUE' | 'GREEN' | 'BLACK'
  const blitzCode = blitzCall
    ? (DEFENSE_PLAYERS.find((p) => p.id === blitzCall)?.name.toUpperCase().split(' ')[0] || blitzCall)
    : null; // 'MIKE' | 'WILL' | 'SAM' | 'ROVER' | null

  // Spoken live call (e.g., BASE-PINCH-BLUE-MIKE or BASE-BLUE)
  const liveCallParts = [formationCode, frontCode, coverageCode, blitzCode].filter(Boolean);
  const liveCallFormatted = liveCallParts.join('-');

  const handleSelectFormation = (f: DefenseFormation) => {
    setFormation(f);
    setAlignmentMode('base_fronts');
  };

  const handleSelectOffense = (ofId: OffensiveFormationId) => {
    setOffenseFormation(ofId);
    setAlignmentMode('offense_adjust');
    setFormation('base');
  };

  const handleResetCall = () => {
    setFormation('base');
    setFrontCall(null);
    setCoverageScheme('green');
    setBlitzCall(null);
    setAlignmentMode('base_fronts');
  };

  const getPlayerCoords = (player: (typeof DEFENSE_PLAYERS)[0]): FormationCoord => {
    const formationBase = player.formations[formation];
    if (alignmentMode === 'base_fronts') {
      return formationBase;
    }

    const adj = activeOffenseConfig.adjustments[player.id];
    if (!adj) return formationBase;

    // Apply selected defensive formation adjustments (Shield, Vanguard, Shell, Base)
    if (formation === 'shield') {
      if (player.id === 'SAM' || player.id === 'ROV') {
        return {
          x: player.formations.shield.x,
          y: 374,
          depthYards: 0,
          alignmentDesc: 'Walked up 2x0 on LOS in 5-2 Shield',
          technique: '9-Tech / 2x0 on LOS',
          gap: 'C/D-Gap Edge / Outside Contain',
          sequentialTech: '2x0 on LOS',
        };
      }
      if (player.id === 'MIKE' || player.id === 'WILL') {
        return {
          x: adj.x,
          y: 295,
          depthYards: 4.5,
          alignmentDesc: 'Stacked 4.5 yds in 5-2 Shield behind 5-man line',
          technique: adj.sequentialTech,
          gap: adj.gap,
          sequentialTech: adj.sequentialTech,
        };
      }
      return {
        x: adj.x,
        y: adj.y,
        depthYards: adj.depthYards,
        gap: adj.gap,
        sequentialTech: adj.sequentialTech,
        technique: adj.sequentialTech,
        alignmentDesc: player.formations.shield.alignmentDesc,
      };
    } else if (formation === 'vanguard') {
      if (player.id === 'SAM' || player.id === 'ROV') {
        return {
          x: player.formations.vanguard.x,
          y: 374,
          depthYards: 0,
          alignmentDesc: 'Walked up 2x0 on LOS (Vanguard Goal Line)',
          technique: '2x0 Goal Line Edge Crash',
          gap: 'Contain & Edge Destruction',
          sequentialTech: '2x0 Edge Crash',
        };
      }
      if (player.id === 'MIKE' || player.id === 'WILL') {
        return {
          x: adj.x,
          y: 345,
          depthYards: 2,
          alignmentDesc: 'Walked up to 2-yard depth (Open gap rule)',
          technique: player.id === 'MIKE' ? '32 Tech (2 yds)' : '12 Tech (2 yds)',
          gap: 'Open Gap Attack',
          sequentialTech: '2-Yd Depth Attack',
        };
      }
      if (player.id === 'FS' || player.id === 'SS') {
        return {
          x: player.id === 'FS' ? 450 : 580,
          y: 290,
          depthYards: 5,
          alignmentDesc: 'Walked up to 5-yard depth (Goal line support)',
          technique: '5-Yd Depth Support',
          gap: 'Secondary Alley Fill / Goal Line Cap',
          sequentialTech: '5-Yd Depth Support',
        };
      }
      if (player.id === 'LCB' || player.id === 'RCB') {
        return {
          x: adj.x,
          y: 360,
          depthYards: 1.5,
          alignmentDesc: 'Tight press-man on LOS (1-2 yds)',
          technique: 'Press-Man',
          gap: adj.gap,
          sequentialTech: 'Press-Man (1 yd)',
        };
      }
      return {
        x: adj.x,
        y: adj.y,
        depthYards: adj.depthYards,
        gap: adj.gap,
        sequentialTech: adj.sequentialTech,
        technique: adj.sequentialTech,
        alignmentDesc: player.formations.vanguard.alignmentDesc,
      };
    } else if (formation === 'shell') {
      if (player.id === 'SAM' || player.id === 'ROV') {
        return {
          x: player.id === 'SAM' ? 670 : 320,
          y: 310,
          depthYards: 4,
          alignmentDesc: 'Dropped to 4 yards off (Flat buzz)',
          technique: '4 Yards Off / Flat Buzz',
          gap: 'Flat / Hook Underneath',
          sequentialTech: '4 Yards Off',
        };
      }
      if (player.id === 'MIKE' || player.id === 'WILL') {
        return {
          x: adj.x,
          y: 260,
          depthYards: 6,
          alignmentDesc: 'Dropped back to 6 yards depth (Middle hole)',
          technique: player.id === 'MIKE' ? '36 Tech (6 yds)' : '16 Tech (6 yds)',
          gap: 'Middle Hole / Hook',
          sequentialTech: '6-Yd Pass Drop',
        };
      }
      if (player.id === 'FS' || player.id === 'SS') {
        return {
          x: player.id === 'FS' ? 420 : 620,
          y: 140,
          depthYards: 14,
          alignmentDesc: 'Deep prevent half / post cap (14 yds depth)',
          technique: 'Deep Prevent (14 yds)',
          gap: 'Deep Half / Prevent',
          sequentialTech: 'Deep Prevent (14 yds)',
        };
      }
      if (player.id === 'LCB' || player.id === 'RCB') {
        return {
          x: adj.x,
          y: 290,
          depthYards: 9,
          alignmentDesc: 'Deep cushion bail (9 yds)',
          technique: 'Deep Cushion Bail',
          gap: 'Deep Outside 1/3',
          sequentialTech: 'Deep Bail (9 yds)',
        };
      }
      return {
        x: adj.x,
        y: adj.y,
        depthYards: adj.depthYards,
        gap: adj.gap,
        sequentialTech: adj.sequentialTech,
        technique: adj.sequentialTech,
        alignmentDesc: player.formations.shell.alignmentDesc,
      };
    }

    return {
      x: adj.x,
      y: adj.y,
      depthYards: adj.depthYards,
      alignmentDesc: adj.assignmentNote,
      technique: adj.sequentialTech,
      gap: adj.gap,
      sequentialTech: adj.sequentialTech,
    };
  };

  const getAssignedGap = (player: (typeof DEFENSE_PLAYERS)[0], coords: FormationCoord): string => {
    // Check if player is on an active slant from frontCall
    if (activeFront) {
      if (frontCall === 'slant') {
        const isStrongLeft = strengthCall === 'liz';
        if (player.id === 'NT') return 'Weak A';
        if (player.id === 'LDE') return isStrongLeft ? 'Weak C' : 'Strong A/B';
        if (player.id === 'RDE') return isStrongLeft ? 'Strong A/B' : 'Weak C';
      }
      const slant = activeFront.slants.find((s) => s.playerId === player.id);
      if (slant?.targetGap) {
        return slant.targetGap.replace(' Gap', '').replace('-Gap', '');
      }
    }
    // Check if blitzing
    if (blitzCall === player.id) {
      if (player.id === 'MIKE') return 'A-Gap Blitz';
      if (player.id === 'WILL') return 'B-Gap Blitz';
      if (player.id === 'SAM') return 'Edge Blitz';
      if (player.id === 'ROV') return 'Edge Blitz';
    }
    // Base def line & linebacker front gaps reflecting strengthCall (LIZ = Def Left / Screen Right, RIP = Def Right / Screen Left)
    const isStrongLeft = strengthCall === 'liz';
    if (player.id === 'NT') return 'Strong A';
    if (player.id === 'LDE') return isStrongLeft ? 'Weak B' : 'Strong C';
    if (player.id === 'RDE') return isStrongLeft ? 'Strong C' : 'Weak B';
    if (player.id === 'SAM') return isStrongLeft ? 'Strong D' : 'Weak D';
    if (player.id === 'ROV') return isStrongLeft ? 'Weak D' : 'Strong D';
    if (player.id === 'MIKE') return isStrongLeft ? 'Strong B' : 'Weak A';
    if (player.id === 'WILL') return isStrongLeft ? 'Weak A' : 'Strong B';
    if (player.id === 'LCB' || player.id === 'RCB') return 'Deep 1/3';
    if (player.id === 'FS') return 'Deep Post';
    if (player.id === 'SS') return 'Sky Force';
    if (coords.gap) {
      return coords.gap.split('(')[0].replace(' Gap', '').trim();
    }
    return '';
  };

  // D-Line Arrows: Base front gap assignments (when frontCall is null), Slant, Pinch, Wide
  const activeLinemenArrows = useMemo(() => {
    const isStrongLeft = strengthCall === 'liz'; // Def Left = Screen Right (x > 500)

    if (frontCall === 'slant') {
      if (isStrongLeft) {
        // Strong side is right -> Slant weak is slanting LEFT (toward x < 500)
        return [
          { playerId: 'NT', arrowEnd: { x: 465, y: 430 }, technique: 'Slant 1-Tech (Weak)', targetGap: 'Weak A-Gap', label: 'Slant Weak A' },
          { playerId: 'LDE', arrowEnd: { x: 385, y: 430 }, technique: 'Slant 7-Tech (Weak)', targetGap: 'Weak C-Gap', label: 'Slant Weak C' },
          { playerId: 'RDE', arrowEnd: { x: 550, y: 430 }, technique: 'Slant 2i-Tech', targetGap: 'Strong A/B-Gap', label: 'Slant Inside' },
        ];
      } else {
        // Strong side is left -> Slant weak is slanting RIGHT (toward x > 500)
        return [
          { playerId: 'NT', arrowEnd: { x: 535, y: 430 }, technique: 'Slant 1-Tech (Weak)', targetGap: 'Weak A-Gap', label: 'Slant Weak A' },
          { playerId: 'RDE', arrowEnd: { x: 615, y: 430 }, technique: 'Slant 7-Tech (Weak)', targetGap: 'Weak C-Gap', label: 'Slant Weak C' },
          { playerId: 'LDE', arrowEnd: { x: 450, y: 430 }, technique: 'Slant 2i-Tech', targetGap: 'Strong A/B-Gap', label: 'Slant Inside' },
        ];
      }
    }

    if (frontCall === 'pinch') {
      return LINE_SLANTS.pinch.slants;
    }

    if (frontCall === 'out') {
      return LINE_SLANTS.out.slants;
    }

    // BASE FRONT GAP INTEGRITY ARROWS (When frontCall is null / Base):
    if (formation === 'shield') {
      return [
        {
          playerId: 'NT',
          arrowEnd: { x: isStrongLeft ? 525 : 475, y: 430 },
          technique: '0-Tech (Strong A)',
          targetGap: 'Strong A',
          label: 'Strong A',
        },
        {
          playerId: 'LDE',
          arrowEnd: { x: isStrongLeft ? 418 : 360, y: 430 },
          technique: isStrongLeft ? '4-Tech (Weak B)' : '6-Tech (Strong C)',
          targetGap: isStrongLeft ? 'Weak B' : 'Strong C',
          label: isStrongLeft ? 'Weak B' : 'Strong C',
        },
        {
          playerId: 'RDE',
          arrowEnd: { x: isStrongLeft ? 635 : 585, y: 430 },
          technique: isStrongLeft ? '6-Tech (Strong C)' : '4-Tech (Weak B)',
          targetGap: isStrongLeft ? 'Strong C' : 'Weak B',
          label: isStrongLeft ? 'Strong C' : 'Weak B',
        },
        {
          playerId: 'ROV',
          arrowEnd: { x: isStrongLeft ? 275 : 305, y: 430 },
          technique: '2x0 Edge',
          targetGap: isStrongLeft ? 'Weak Contain' : 'Strong Contain',
          label: isStrongLeft ? 'Weak Edge' : 'Strong Edge',
        },
        {
          playerId: 'SAM',
          arrowEnd: { x: isStrongLeft ? 725 : 695, y: 430 },
          technique: '2x0 Edge',
          targetGap: isStrongLeft ? 'Strong Contain' : 'Weak Contain',
          label: isStrongLeft ? 'Strong Edge' : 'Weak Edge',
        },
      ];
    }

    if (formation === 'vanguard') {
      return [
        {
          playerId: 'NT',
          arrowEnd: { x: 500, y: 435 },
          technique: '0-Tech Submarine',
          targetGap: 'A-Gap Wedge',
          label: 'Submarine A',
        },
        {
          playerId: 'LDE',
          arrowEnd: { x: 420, y: 430 },
          technique: '4-Tech Tight Squeeze',
          targetGap: 'B-Gap Seal',
          label: 'B-Gap Seal',
        },
        {
          playerId: 'RDE',
          arrowEnd: { x: 580, y: 430 },
          technique: '6-Tech Tight Squeeze',
          targetGap: 'C-Gap Seal',
          label: 'C-Gap Seal',
        },
      ];
    }

    if (formation === 'shell') {
      return [
        {
          playerId: 'NT',
          arrowEnd: { x: 500, y: 450 },
          technique: 'Bull Rush',
          targetGap: 'Sack QB',
          label: 'Bull Rush',
        },
        {
          playerId: 'LDE',
          arrowEnd: { x: 405, y: 450 },
          technique: 'Speed Edge Rush',
          targetGap: 'Sack QB',
          label: 'Speed Rush',
        },
        {
          playerId: 'RDE',
          arrowEnd: { x: 595, y: 450 },
          technique: 'Speed Edge Rush',
          targetGap: 'Sack QB',
          label: 'Speed Rush',
        },
      ];
    }

    // Default Base 3-4 Front:
    return [
      {
        playerId: 'NT',
        arrowEnd: { x: isStrongLeft ? 525 : 475, y: 430 },
        technique: '0-Tech (Strong A)',
        targetGap: 'Strong A',
        label: 'Strong A',
      },
      {
        playerId: 'LDE',
        arrowEnd: { x: isStrongLeft ? 418 : 360, y: 430 },
        technique: isStrongLeft ? '4-Tech' : '6-Tech',
        targetGap: isStrongLeft ? 'Weak B' : 'Strong C',
        label: isStrongLeft ? 'Weak B' : 'Strong C',
      },
      {
        playerId: 'RDE',
        arrowEnd: { x: isStrongLeft ? 635 : 585, y: 430 },
        technique: isStrongLeft ? '6-Tech' : '4-Tech',
        targetGap: isStrongLeft ? 'Strong C' : 'Weak B',
        label: isStrongLeft ? 'Strong C' : 'Weak B',
      },
    ];
  }, [formation, frontCall, strengthCall]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* UNIFIED DEFENSIVE CALL SIMULATOR CONSOLE (Directly Before Playart) */}
      <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-4 lg:p-5 shadow-xl space-y-4">
        {/* Top Header & Live Call Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#162A33]/80">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold uppercase tracking-wider text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              Call Simulator
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">Live Call:</span>
              <span className="px-3.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 font-extrabold border border-teal-500/50 text-sm sm:text-base tracking-wide shadow-sm font-mono">
                {liveCallFormatted}
              </span>
              <span className="text-slate-400 text-xs font-mono hidden sm:inline">
                &lt;Formation-Front-Coverage-Blitz&gt;
              </span>
            </div>
          </div>

          {/* Call Slot Breakdown Chips & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-teal-950/80 border border-teal-700/50 text-teal-300">
                F: <strong className="text-white">{formationCode}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/50 text-amber-300">
                Front: <strong className="text-white">{frontCode || 'Base'}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/50 text-sky-300">
                Cov: <strong className="text-white">{coverageCode}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded border ${blitzCode ? 'bg-purple-950/80 border-purple-700/50 text-purple-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                Blitz: <strong className="text-white">{blitzCode || 'None'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleResetCall}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-[#09151E] border border-[#162A33] hover:border-slate-700 cursor-pointer transition-colors"
                title="Reset Call to Base 3-4 Green"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              <button
                onClick={onOpenPrintModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Call Sheet
              </button>
            </div>
          </div>
        </div>

        {/* 4 Adjustment Inputs: Formation, Front, Coverage, Blitz */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. FORMATION */}
          <div className="p-3 rounded-xl border border-teal-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                1. Formation
              </span>
              <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/40">
                {activeFormationInfo.codeName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(FORMATION_INFO) as DefenseFormation[]).map((fKey) => {
                const info = FORMATION_INFO[fKey];
                const isSelected = formation === fKey;
                return (
                  <button
                    key={fKey}
                    onClick={() => handleSelectFormation(fKey)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-400 bg-teal-950 text-white shadow ring-1 ring-teal-400/50'
                        : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono text-teal-300 truncate">
                      {info.codeName}
                    </div>
                    <div className="text-[10px] text-slate-300 truncate mt-0.5">{info.name.split(' ')[0]}</div>
                    <div className="text-[9px] text-amber-300 font-mono truncate">{info.handSignal.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Signal: <span className="text-slate-200">{activeFormationInfo.handSignal}</span>
            </div>
          </div>

          {/* 2. FRONT (SLANTS) */}
          <div className="p-3 rounded-xl border border-amber-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                2. Front (Slants)
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/40">
                {frontCode || 'BASE'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SELECTABLE_FRONTS.map((front) => {
                const isSelected = frontCall === front.id;
                return (
                  <button
                    key={front.id}
                    onClick={() => setFrontCall(isSelected ? null : front.id)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950 text-white shadow ring-1 ring-amber-400/50'
                        : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono text-amber-300">{front.callCode}</div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{front.signal.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setFrontCall(null)}
              className={`w-full py-1 px-2 rounded-md border text-center text-[10px] font-mono transition-colors cursor-pointer truncate ${
                frontCall === null
                  ? 'border-amber-500/40 bg-amber-950/30 text-amber-300 font-bold'
                  : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-white'
              }`}
            >
              {frontCall === null ? '✓ Base Gap Default (No Front)' : 'Click to Clear ➔ Base Gap'}
            </button>
          </div>

          {/* 3. COVERAGE */}
          <div className="p-3 rounded-xl border border-sky-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                3. Coverage
              </span>
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/40">
                {activeCoverage.codeName}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(COVERAGE_SCHEMES) as CoverageScheme[]).map((covKey) => {
                const cov = COVERAGE_SCHEMES[covKey];
                const isSelected = coverageScheme === covKey;
                return (
                  <button
                    key={covKey}
                    onClick={() => setCoverageScheme(covKey)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white bg-[#0D2230] text-white shadow ring-1 ring-sky-400/50'
                        : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono" style={{ color: cov.color }}>
                      {cov.codeName}
                    </div>
                    <div className="text-[10px] text-slate-300 truncate mt-0.5">{cov.name.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate pt-0.5">
              Scheme: <span className="text-slate-200">{activeCoverage.name}</span>
            </div>
          </div>

          {/* 4. BLITZ */}
          <div className="p-3 rounded-xl border border-purple-500/25 bg-[#09151D] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                4. Blitz (Linebackers)
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${blitzCall ? 'bg-purple-950/80 border-purple-700/50 text-purple-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                {blitzCode || 'NONE'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'MIKE' as const, label: 'Mike' },
                { id: 'WILL' as const, label: 'Will' },
                { id: 'SAM' as const, label: 'Sam' },
                { id: 'ROV' as const, label: 'Rover' },
              ].map((b) => {
                const isSelected = blitzCall === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setBlitzCall(isSelected ? null : b.id)}
                    className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-400 bg-purple-950 text-white shadow ring-1 ring-purple-400/50'
                        : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono text-purple-300">{b.label}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">{isSelected ? 'ON' : 'OFF'}</div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setBlitzCall(null)}
              className={`w-full py-1 px-2 rounded-md border text-center text-[10px] font-mono transition-colors cursor-pointer truncate ${
                blitzCall === null
                  ? 'border-purple-500/40 bg-purple-950/30 text-purple-300 font-bold'
                  : 'border-[#162A33] bg-[#070E13] text-slate-400 hover:text-white'
              }`}
            >
              {blitzCall === null ? '✓ Coverage Only (No Blitz)' : 'Click to Clear ➔ No Blitz'}
            </button>
          </div>
        </div>

        {/* Scout Offense & Auto Strength Calibration Strip */}
        <div className="p-3 rounded-xl bg-[#09151E] border border-teal-500/20 text-xs space-y-2.5">
          {/* Row 1: Scout Formation & Alignment Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1 mr-1">
                <Users className="w-3.5 h-3.5" />
                Scout:
              </span>
              {(Object.keys(COMMON_OFFENSE_FORMATIONS) as OffensiveFormationId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => handleSelectOffense(id)}
                  className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                    offenseFormation === id && alignmentMode === 'offense_adjust'
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow'
                      : 'bg-[#0A161E] text-slate-400 hover:text-slate-200 border border-[#162E3B]'
                  }`}
                >
                  {COMMON_OFFENSE_FORMATIONS[id].shortName}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-lg border border-[#162A33] bg-[#070E13] p-0.5 font-mono text-[11px]">
              <button
                onClick={() => setAlignmentMode('base_fronts')}
                className={`px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  alignmentMode === 'base_fronts' ? 'bg-teal-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Base Fronts
              </button>
              <button
                onClick={() => setAlignmentMode('offense_adjust')}
                className={`px-2.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  alignmentMode === 'offense_adjust' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scout Fit
              </button>
            </div>
          </div>

          {/* Row 2: Defensive Strength Call Auto-Detection (4 Rules Engine) */}
          <div className="pt-2 border-t border-[#162A33] flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* Auto-Detection Indicator & Active Call */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAutoDetectStrength(true)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    autoDetectStrength
                      ? 'bg-teal-400 text-slate-950 shadow ring-1 ring-teal-300'
                      : 'bg-[#0A161E] text-slate-400 hover:text-teal-300 border border-[#162E3B]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Auto-Detect: {autoDetectStrength ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">Strength Call:</span>
                <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-teal-950/90 text-teal-300 border border-teal-500/40">
                  {strengthCall === 'liz' ? '★ STRONG LEFT (LIZ)' : '★ STRONG RIGHT (RIP)'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  {strengthCall === 'liz' ? '(Def Lt / Off Rt)' : '(Def Rt / Off Lt)'}
                </span>
              </div>

              {autoDetectStrength && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#061821] text-emerald-300 border border-emerald-500/30">
                  {detectedStrength.ruleTitle}
                </span>
              )}
            </div>

            {/* Ball Hash (Rules 3 & 4) and Manual Override Controls */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              {/* Ball Hash Spot selector */}
              <div className="flex items-center gap-1 bg-[#070E13] border border-[#162A33] px-1.5 py-0.5 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase mr-0.5">Hash:</span>
                <button
                  onClick={() => setBallHash('left_hash')}
                  title="Ball on Left Hash (Wide side is Defense Left)"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    ballHash === 'left_hash' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lt Hash
                </button>
                <button
                  onClick={() => setBallHash('middle')}
                  title="Ball in Middle of Field (Rule 4: Default Strong Left)"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    ballHash === 'middle' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mid
                </button>
                <button
                  onClick={() => setBallHash('right_hash')}
                  title="Ball on Right Hash (Wide side is Defense Right)"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    ballHash === 'right_hash' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Rt Hash
                </button>
              </div>

              {/* Manual Override Buttons */}
              <div className="inline-flex rounded-lg border border-[#162A33] bg-[#070E13] p-0.5">
                <button
                  onClick={() => {
                    setAutoDetectStrength(false);
                    setManualStrength('liz');
                  }}
                  title="Strong Left (From Defense perspective facing south, this is Screen Right)"
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    !autoDetectStrength && strengthCall === 'liz'
                      ? 'bg-teal-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Strong Lt (LIZ)
                </button>
                <button
                  onClick={() => {
                    setAutoDetectStrength(false);
                    setManualStrength('rip');
                  }}
                  title="Strong Right (From Defense perspective facing south, this is Screen Left)"
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    !autoDetectStrength && strengthCall === 'rip'
                      ? 'bg-teal-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Strong Rt (RIP)
                </button>
              </div>
            </div>
          </div>

          {/* Strength Call Rule Reason Explanation */}
          {autoDetectStrength && (
            <div className="text-[10px] font-mono text-slate-400 bg-[#061218] p-1.5 rounded-lg border border-teal-500/15 flex items-center justify-between gap-2">
              <span className="text-teal-300 truncate">
                ⚡ <strong className="text-white">{detectedStrength.ruleTitle}</strong>: {detectedStrength.explanation}
              </span>
              <span className="text-slate-500 text-[9px] shrink-0 hidden md:inline">
                Rules: 1:TE · 2:WR Heavy · 3:Wide Side · 4:Mid=Lt
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TACTICAL PLAYART CANVAS (Directly Below User Inputs) */}
      <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-4 lg:p-5 shadow-2xl space-y-3">
        {/* Playart Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162A33] pb-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              Tactical Playart Canvas
            </span>
            <span className="text-slate-300 font-mono">
              Live Call: <strong className="text-teal-300 font-extrabold">{liveCallFormatted}</strong>
              {alignmentMode === 'offense_adjust' && (
                <span className="text-emerald-300 ml-2">vs {activeOffenseConfig.name}</span>
              )}
            </span>
          </div>

          {/* Overlay Toggles */}
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
                className="rounded border-slate-700 text-amber-400 focus:ring-0"
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
              <span>Sequential Tech</span>
            </label>
          </div>
        </div>

        {/* Sequential Tech Reference Strip */}
        {showTechniqueOverlay && (
          <div className="p-3 rounded-xl bg-[#08131A] border border-amber-500/20 text-xs flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-amber-300 font-bold">
              ★ Sequential Tech: Center 0 · Guard 1,2,3 · Tackle 4,5,6 · TE 7,8,9 · Backers (Depth then Tech)
            </span>
            <span className="text-slate-400">
              Base Formula: NG 0 · SDE 6 · WDE 4 · Rover/Sam 2x2 · Mike 34 · Will 14
            </span>
          </div>
        )}

        {/* Interactive SVG Chalkboard Canvas */}
        <div className="relative w-full aspect-[16/10] bg-[#050C10] rounded-xl border border-[#162A33] overflow-hidden select-none">
          <svg viewBox="0 0 1000 620" className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#102531" strokeWidth="0.6" />
              </pattern>
              <marker
                id="slantArrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
              </marker>
              <marker
                id="pressureArrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#C084FC" />
              </marker>
            </defs>

            {/* Field Grid */}
            <rect width="1000" height="620" fill="#04090D" />
            <rect width="1000" height="620" fill="url(#grid)" />

            {/* Yard lines: LOS is at y=390 (Defense is above y=390, Offense below) */}
            <line x1="60" y1="210" x2="940" y2="210" stroke="#162D38" strokeWidth="1" strokeDasharray="3 3" />
            <text x="75" y="214" fill="#334E5C" fontSize="10" fontFamily="monospace">15 YDS (SECONDARY)</text>

            <line x1="60" y1="295" x2="940" y2="295" stroke="#1C3847" strokeWidth="1" strokeDasharray="4 4" />
            <text x="75" y="299" fill="#4B6A7A" fontSize="10" fontFamily="monospace">5 YDS (LINEBACKERS)</text>

            <line x1="60" y1="390" x2="940" y2="390" stroke="#38BDF8" strokeWidth="2.5" />
            <text x="75" y="386" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">LINE OF SCRIMMAGE</text>

            <line x1="60" y1="480" x2="940" y2="480" stroke="#162D38" strokeWidth="1" strokeDasharray="3 3" />
            <text x="75" y="484" fill="#334E5C" fontSize="10" fontFamily="monospace">OFFENSIVE BACKFIELD</text>

            {/* Sideline boundaries */}
            <line x1="60" y1="40" x2="60" y2="580" stroke="#1E3A4A" strokeWidth="2" />
            <line x1="940" y1="40" x2="940" y2="580" stroke="#1E3A4A" strokeWidth="2" />
            <text x="45" y="320" fill="#334E5C" fontSize="10" fontFamily="monospace" transform="rotate(-90 45 320)">LEFT SIDELINE</text>
            <text x="965" y="320" fill="#334E5C" fontSize="10" fontFamily="monospace" transform="rotate(90 965 320)">RIGHT SIDELINE</text>

            {/* Strength indicator (RIP / LIZ) placed over appropriate strong side */}
            <g opacity="0.95">
              <rect
                x={strengthCall === 'liz' ? 740 : 60}
                y="52"
                width="200"
                height="28"
                rx="6"
                fill="#061A23"
                stroke="#14B8A6"
                strokeWidth="1.5"
              />
              <text
                x={strengthCall === 'liz' ? 840 : 160}
                y="70"
                fill="#2DD4BF"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                ★ {strengthCall === 'liz' ? 'STRONG LEFT (LIZ)' : 'STRONG RIGHT (RIP)'}
              </text>
              <text
                x={strengthCall === 'liz' ? 840 : 160}
                y="90"
                fill="#5EEAD4"
                fontSize="8"
                fontFamily="monospace"
                textAnchor="middle"
                opacity="0.85"
              >
                {autoDetectStrength ? `[Auto] ${detectedStrength.ruleTitle}` : '[Manual Call]'}
              </text>
            </g>

            {/* Gap Labels across LOS */}
            {showGaps && (
              <g>
                {(strengthCall === 'liz'
                  ? [
                      { label: 'D-GAP', x: 310, type: 'weak' },
                      { label: 'C-GAP', x: 360, type: 'weak' },
                      { label: 'B-GAP', x: 418, type: 'weak' },
                      { label: 'A-GAP', x: 474, type: 'weak' },
                      { label: 'C', x: 500, type: 'center' },
                      { label: 'A-GAP', x: 526, type: 'strong' },
                      { label: 'B-GAP', x: 585, type: 'strong' },
                      { label: 'C-GAP', x: 640, type: 'strong' },
                      { label: 'D-GAP', x: 695, type: 'strong' },
                    ]
                  : [
                      { label: 'D-GAP', x: 310, type: 'strong' },
                      { label: 'C-GAP', x: 360, type: 'strong' },
                      { label: 'B-GAP', x: 418, type: 'strong' },
                      { label: 'A-GAP', x: 474, type: 'strong' },
                      { label: 'C', x: 500, type: 'center' },
                      { label: 'A-GAP', x: 526, type: 'weak' },
                      { label: 'B-GAP', x: 585, type: 'weak' },
                      { label: 'C-GAP', x: 640, type: 'weak' },
                      { label: 'D-GAP', x: 695, type: 'weak' },
                    ]
                ).map((gap, idx) => (
                  <g key={`${gap.label}-${idx}`} transform={`translate(${gap.x}, 404)`}>
                    <rect
                      x="-17"
                      y="-8"
                      width="34"
                      height="14"
                      rx="3"
                      fill={gap.type === 'strong' ? '#061F2A' : '#061217'}
                      fillOpacity="0.95"
                      stroke={gap.type === 'center' ? '#38BDF8' : gap.type === 'strong' ? '#14B8A6' : '#1E3A4A'}
                      strokeWidth={gap.type === 'strong' ? '1.2' : '0.8'}
                    />
                    <text
                      x="0"
                      y="2"
                      fill={gap.type === 'center' ? '#38BDF8' : gap.type === 'strong' ? '#2DD4BF' : '#94A3B8'}
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {gap.label}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* Scout Offensive Formation */}
            <g id="offense-scout-look" opacity="0.88">
              {activeOffenseConfig.players.map((o) => (
                <g key={o.id} className="cursor-pointer group">
                  <circle
                    cx={o.x}
                    cy={o.y}
                    r="14"
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

            {/* TRIPS OVERLOAD SHIFT TACTICAL VISUALIZATION */}
            {alignmentMode === 'offense_adjust' && offenseFormation === 'trips_3x1' && (
              <g id="trips-overload-shift-layer" opacity="0.95">
                <g>
                  <rect
                    x="100"
                    y="12"
                    width="800"
                    height="32"
                    rx="6"
                    fill="#061A23"
                    fillOpacity="0.95"
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                  />
                  <text
                    x="500"
                    y="32"
                    fill="#5EEAD4"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ⚡ PRIMER OVERLOAD RULE: Count & Shift (+1 toward strength) · FS up to 6 yds · SS deep bracket · Split Coverage
                  </text>
                </g>

                {/* Will shift vector to Mike */}
                <path
                  d="M 455 295 Q 495 282 540 300"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  markerEnd="url(#slantArrow)"
                />
                <text x="495" y="278" fill="#A7F3D0" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  Will ➔ Mike (+1)
                </text>

                {/* Mike shift vector to Sam */}
                <path
                  d="M 550 295 Q 590 282 630 300"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  markerEnd="url(#slantArrow)"
                />
                <text x="590" y="278" fill="#A7F3D0" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  Mike ➔ Sam (+1)
                </text>

                {/* Sam shift vector outward to split difference */}
                <path
                  d="M 660 310 Q 705 315 750 330"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  markerEnd="url(#slantArrow)"
                />
                <text x="705" y="305" fill="#A7F3D0" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  Sam Splits Difference
                </text>

                {/* FS move UP to 6 yds (Backside Contain) */}
                <path
                  d="M 430 170 Q 390 215 350 265"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  markerEnd="url(#slantArrow)"
                />
                <text x="390" y="210" fill="#BAE6FD" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  FS Up ➔ 6 Yds (Contain)
                </text>

                {/* SS adjust deep to 13 yds */}
                <path
                  d="M 590 210 Q 665 180 740 155"
                  fill="none"
                  stroke="#818CF8"
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  markerEnd="url(#slantArrow)"
                />
                <text x="665" y="170" fill="#C7D2FE" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  SS Deep ➔ 13 Yds (Bracket)
                </text>

                {/* Weakside Island Man Box on Solo X */}
                <g>
                  <rect
                    x="75"
                    y="370"
                    width="130"
                    height="20"
                    rx="4"
                    fill="#0B1C28"
                    stroke="#F59E0B"
                    strokeWidth="1.2"
                  />
                  <text x="140" y="384" fill="#FDE68A" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    ISLAND MAN (Solo X)
                  </text>
                </g>

                {/* Strongside Zone Overload Box on Trips */}
                <g>
                  <rect
                    x="660"
                    y="370"
                    width="240"
                    height="20"
                    rx="4"
                    fill="#0B1C28"
                    stroke="#38BDF8"
                    strokeWidth="1.2"
                  />
                  <text x="780" y="384" fill="#7DD3FC" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    OVERLOAD ZONE COVERAGE (3 WRs)
                  </text>
                </g>
              </g>
            )}

            {/* Coverage Zones */}
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

            {/* D-Line & Front Arrows (Base Front Gaps, Slant, Pinch, Wide) */}
            {showPressureArrows &&
              activeLinemenArrows.map((arrow, idx) => {
                const p = DEFENSE_PLAYERS.find((d) => d.id === arrow.playerId);
                if (!p) return null;
                const coords = getPlayerCoords(p);
                return (
                  <g key={`front-arrow-${idx}`}>
                    <line
                      x1={coords.x}
                      y1={coords.y}
                      x2={arrow.arrowEnd.x}
                      y2={arrow.arrowEnd.y}
                      stroke="#F59E0B"
                      strokeWidth="2.8"
                      strokeDasharray="4 2"
                      markerEnd="url(#slantArrow)"
                    />
                    <rect
                      x={(coords.x + arrow.arrowEnd.x) / 2 - 28}
                      y={(coords.y + arrow.arrowEnd.y) / 2 - 12}
                      width="56"
                      height="13.5"
                      rx="3"
                      fill="#04121A"
                      fillOpacity="0.95"
                      stroke="#F59E0B"
                      strokeWidth="0.8"
                    />
                    <text
                      x={(coords.x + arrow.arrowEnd.x) / 2}
                      y={(coords.y + arrow.arrowEnd.y) / 2 - 2.5}
                      fill="#FDE68A"
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {arrow.label}
                    </text>
                  </g>
                );
              })}

            {/* Linebacker Blitz Arrow (Mike, Will, Sam, Rover) */}
            {showPressureArrows && blitzCall && (
              (() => {
                const p = DEFENSE_PLAYERS.find((d) => d.id === blitzCall);
                if (!p || !p.individualPressure) return null;
                const coords = getPlayerCoords(p);
                const pressure = p.individualPressure;
                return (
                  <g key={`blitz-${blitzCall}`}>
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
                      {pressure.callName} Blitz
                    </text>
                  </g>
                );
              })()
            )}

            {/* DEFENSIVE PLAYERS (11) */}
            {DEFENSE_PLAYERS.map((player) => {
              const coords = getPlayerCoords(player);
              const isSelected = selectedPlayerId === player.id;
              const isSamOrRover = player.id === 'SAM' || player.id === 'ROV';
              const isMikeOrWill = player.id === 'MIKE' || player.id === 'WILL';
              const isBlitzing = blitzCall === player.id;

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
                  {/* Active Blitz Reticle */}
                  {isBlitzing && (
                    <g>
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="23"
                        fill="#C084FC"
                        fillOpacity="0.16"
                        stroke="#C084FC"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <line x1={coords.x - 27} y1={coords.y} x2={coords.x - 21} y2={coords.y} stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
                      <line x1={coords.x + 21} y1={coords.y} x2={coords.x + 27} y2={coords.y} stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
                      <line x1={coords.x} y1={coords.y - 27} x2={coords.x} y2={coords.y - 21} stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
                      <line x1={coords.x} y1={coords.y + 21} x2={coords.x} y2={coords.y + 27} stroke="#C084FC" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )}

                  {/* Selection Ring */}
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

                  {/* Player Node Circle */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="16"
                    fill={
                      isBlitzing
                        ? '#581C87'
                        : isSamOrRover
                        ? formation === 'shield' || formation === 'vanguard'
                          ? '#0F766E'
                          : '#134E4A'
                        : isMikeOrWill
                        ? '#1E3A8A'
                        : '#042F2E'
                    }
                    stroke={
                      isBlitzing
                        ? '#C084FC'
                        : isSamOrRover
                        ? '#2DD4BF'
                        : isMikeOrWill
                        ? '#60A5FA'
                        : '#14B8A6'
                    }
                    strokeWidth={isSelected ? '2.5' : '1.8'}
                  />

                  {/* Player Position Label (Position Only - Centered) */}
                  <text
                    x={coords.x}
                    y={coords.y + 4}
                    fill="#FFFFFF"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {player.id}
                  </text>

                  {/* Base Def Line & Front Gap Assignment Badge */}
                  {(showGaps || player.isDefensiveLine) && (
                    <g>
                      <rect
                        x={coords.x - 30}
                        y={coords.y - 31}
                        width="60"
                        height="13.5"
                        rx="3.5"
                        fill="#05131C"
                        fillOpacity="0.95"
                        stroke={
                          player.isDefensiveLine
                            ? '#F59E0B' // Amber for Defensive Line
                            : isSamOrRover
                            ? '#2DD4BF' // Teal for Edge Contain
                            : isMikeOrWill
                            ? '#60A5FA' // Blue for Inside Linebackers
                            : '#0D9488'
                        }
                        strokeWidth="1"
                      />
                      <text
                        x={coords.x}
                        y={coords.y - 21.5}
                        fill={
                          player.isDefensiveLine
                            ? '#FDE68A'
                            : isSamOrRover
                            ? '#99F6E4'
                            : isMikeOrWill
                            ? '#BFDBFE'
                            : '#5EEAD4'
                        }
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {`GAP: ${getAssignedGap(player, coords).toUpperCase()}`}
                      </text>
                    </g>
                  )}

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
                      {coords.sequentialTech
                        ? coords.sequentialTech.split('(')[0].trim()
                        : isSamOrRover && (formation === 'shield' || formation === 'vanguard')
                        ? '2x0 LOS'
                        : player.sequentialTechCode || `${coords.depthYards} yd`}
                    </text>
                  </g>

                  {/* Selected Player Tooltip */}
                  {isSelected && (
                    <g>
                      <rect
                        x={coords.x - 70}
                        y={coords.y - 53}
                        width="140"
                        height="19"
                        rx="4"
                        fill="#0A1C24"
                        stroke="#38BDF8"
                        strokeWidth="1.2"
                      />
                      <text
                        x={coords.x}
                        y={coords.y - 39.5}
                        fill="#E0F2FE"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {player.name} · {getAssignedGap(player, coords)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* LOWER SECTION: Player Inspector & Sequential Tech Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Player Inspector (Left) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162A33] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center font-mono font-extrabold text-teal-300">
                {selectedPlayer.id}
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-display">
                  {selectedPlayer.name} ({selectedPlayer.id})
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedPlayer.role}</p>
              </div>
            </div>

            {selectedPlayer.canBlitz && (
              <button
                onClick={() => setBlitzCall(blitzCall === selectedPlayer.id ? null : (selectedPlayer.id as any))}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  blitzCall === selectedPlayer.id
                    ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-900/50'
                    : 'bg-[#0B1A22] border border-purple-500/30 text-purple-300 hover:bg-purple-950/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {blitzCall === selectedPlayer.id ? 'Blitz Active' : `Call ${selectedPlayer.id} Blitz`}
              </button>
            )}
          </div>

          {/* Sequential Tech & Assignment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Sequential Tech</div>
              <div className="text-xs font-bold text-teal-300 font-mono">
                {selectedPlayer.sequentialTechCode}
              </div>
              <div className="text-[11px] text-slate-300">
                {selectedPlayer.sequentialTechBase}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Technique & Depth</div>
              <div className="text-xs font-bold text-amber-300 font-mono">
                {getPlayerCoords(selectedPlayer).technique}
              </div>
              <div className="text-[11px] text-slate-300">
                Depth: {getPlayerCoords(selectedPlayer).depthYards} yds off ball
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#091318] border border-[#162A33] space-y-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Assigned Gap / Role</div>
              <div className="text-xs font-bold text-teal-300 font-mono">
                {getPlayerCoords(selectedPlayer).gap}
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
                <strong className="text-teal-400">Base (3-4):</strong> {selectedPlayer.baseAssignment}
              </div>
              <div className="p-2 rounded bg-black/40 border border-[#162A33]">
                <strong className="text-teal-400">Shield (5-2):</strong> {selectedPlayer.shieldAssignment}
              </div>
              <div className="p-2 rounded bg-black/40 border border-[#162A33]">
                <strong className="text-yellow-400">Vanguard (Goal Line):</strong> {selectedPlayer.vanguardAssignment}
              </div>
              <div className="p-2 rounded bg-black/40 border border-[#162A33]">
                <strong className="text-blue-400">Shell (Deep Pass):</strong> {selectedPlayer.shellAssignment}
              </div>
            </div>
          </div>
        </div>

        {/* Active Call Coaching Doctrine & Primer Summary (Right) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#162A33] pb-3">
            <span className="font-bold text-white text-sm font-display flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400" />
              Active Call Doctrine & Rules
            </span>
            <span className="text-[11px] font-mono text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
              {liveCallFormatted}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Formation Doctrine */}
            <div className="p-3 rounded-xl bg-[#09151D] border border-teal-500/20 space-y-1">
              <div className="font-bold text-teal-300 flex items-center justify-between">
                <span>Formation: {activeFormationInfo.name}</span>
                <span className="text-amber-300 font-mono text-[11px]">{activeFormationInfo.handSignal}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeFormationInfo.doctrine}
              </p>
            </div>

            {/* Front Rule */}
            <div className="p-3 rounded-xl bg-[#09151D] border border-amber-500/20 space-y-1">
              <div className="font-bold text-amber-300 flex items-center justify-between">
                <span>Front: {activeFront ? activeFront.name : 'Base Gap Integrity (Default)'}</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {activeFront ? activeFront.signal : 'No Call Needed'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeFront
                  ? activeFront.linemenRule
                  : 'Primer Gap Rule: If you don’t hear a slant call, either pick the gap in front of you or default pick the strong direction gap.'}
              </p>
            </div>

            {/* Coverage Scheme */}
            <div className="p-3 rounded-xl bg-[#09151D] border border-sky-500/20 space-y-1">
              <div className="font-bold text-sky-300 flex items-center justify-between">
                <span>Coverage: {activeCoverage.name}</span>
                <span className="text-amber-300 font-mono text-[11px]">{activeCoverage.handSignal}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeCoverage.philosophy}
              </p>
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

        {/* Chapter Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {DEFENSIVE_PRIMER_CHAPTERS.map((chap) => {
            const isSelected = activePrimerChapter === chap.id;
            return (
              <button
                key={chap.id}
                onClick={() => setActivePrimerChapter(chap.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-400 bg-teal-950/60 text-white shadow-lg'
                    : 'border-[#162A33] bg-[#09151D] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono text-teal-400 uppercase font-bold">
                  {chap.category}
                </div>
                <div className="text-xs font-bold truncate mt-1 text-slate-200">{chap.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Chapter Details */}
        {(() => {
          const chap =
            DEFENSIVE_PRIMER_CHAPTERS.find((c) => c.id === activePrimerChapter) ||
            DEFENSIVE_PRIMER_CHAPTERS[0];
          return (
            <div className="p-5 rounded-2xl bg-[#09151D] border border-[#162A33] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#18323F] pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">{chap.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{chap.summary}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-teal-950 border border-teal-700/50 text-teal-300 text-xs font-mono font-bold self-start sm:self-auto">
                  {chap.category.toUpperCase()}
                </span>
              </div>

              {chap.coachingQuote && (
                <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 text-xs italic text-teal-200 font-serif">
                  {chap.coachingQuote}
                </div>
              )}

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
                  Key Doctrine Points:
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                  {chap.keyPoints.map((pt, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-lg bg-black/40 border border-[#162A33] flex items-start gap-2"
                    >
                      <span className="text-teal-400 font-mono font-bold text-xs">#{idx + 1}</span>
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {chap.diagramNotes && (
                <div className="p-3 rounded-xl bg-[#050C10] border border-[#162A33] text-[11px] text-slate-400 font-mono">
                  <strong className="text-slate-300">Coaching Diagram Notes: </strong>
                  {chap.diagramNotes}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
