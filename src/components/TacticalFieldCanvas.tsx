import React, { useRef, useState } from 'react';
import {
  DEFENSIVE_FRONTS,
  DefensiveFrontId,
  DiveKeyBehavior,
  EleventhPlayerMode,
  PitchKeyBehavior,
  PlayDefinition,
  Point,
  TargetSide,
  XPlayerMode,
  ZAlignmentSide,
  getBaseOffensiveAlignment,
} from '../data/veerPlaybookData';

interface CustomArrow {
  id: string;
  start: Point;
  end: Point;
  color: string;
}

interface TacticalFieldCanvasProps {
  play: PlayDefinition;
  frontId: DefensiveFrontId;
  diveBehavior: DiveKeyBehavior;
  pitchBehavior: PitchKeyBehavior;
  eleventhMode: EleventhPlayerMode;
  xMode?: XPlayerMode;
  zSide?: ZAlignmentSide;
  targetSide?: TargetSide;
  progress: number;
  selectedPlayerId: string;
  onSelectPlayer: (id: string) => void;
  showGapLabels: boolean;
  showBlockingAngles: boolean;
  chalkboardMode: boolean;
  customOffsets: Record<string, Point>;
  onUpdateCustomOffset: (id: string, offset: Point) => void;
  customArrows: CustomArrow[];
  onAddCustomArrow: (arrow: CustomArrow) => void;
  fieldTheme?: 'night_turf' | 'chalkboard' | 'high_contrast';
  onChangeFieldTheme?: (theme: 'night_turf' | 'chalkboard' | 'high_contrast') => void;
}

function interpolatePoints(points: Point[], progress: number): Point {
  if (!points || points.length === 0) return { x: 500, y: 390 };
  if (progress <= 0) return points[0];
  if (progress >= 1) return points[points.length - 1];

  const totalSegments = points.length - 1;
  const scaled = progress * totalSegments;
  const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
  const segT = scaled - segIndex;

  const p0 = points[segIndex];
  const p1 = points[segIndex + 1];
  return {
    x: p0.x + (p1.x - p0.x) * segT,
    y: p0.y + (p1.y - p0.y) * segT,
  };
}

function pointsToSvgPath(points: Point[]): string {
  if (!points || points.length === 0) return '';
  return points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
}

export const TacticalFieldCanvas: React.FC<TacticalFieldCanvasProps> = ({
  play,
  frontId,
  diveBehavior,
  pitchBehavior,
  eleventhMode,
  xMode = 'tight_x',
  zSide = 'right',
  targetSide = 'right',
  progress,
  selectedPlayerId,
  onSelectPlayer,
  showGapLabels,
  showBlockingAngles,
  chalkboardMode,
  customOffsets,
  onUpdateCustomOffset,
  customArrows,
  onAddCustomArrow,
  fieldTheme = 'night_turf',
  onChangeFieldTheme,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [internalFieldTheme, setInternalFieldTheme] = useState<'night_turf' | 'chalkboard' | 'high_contrast'>(fieldTheme);
  const activeTheme = onChangeFieldTheme ? fieldTheme : internalFieldTheme;
  const handleThemeChange = (newTheme: 'night_turf' | 'chalkboard' | 'high_contrast') => {
    if (onChangeFieldTheme) onChangeFieldTheme(newTheme);
    else setInternalFieldTheme(newTheme);
  };

  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [drawingStart, setDrawingStart] = useState<Point | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<Point | null>(null);

  const baseOffense = getBaseOffensiveAlignment(eleventhMode, xMode, zSide);
  const frontConfig = DEFENSIVE_FRONTS[frontId];
  const simResult = play.getOffensivePaths(frontId, diveBehavior, pitchBehavior, eleventhMode, xMode, zSide, targetSide);

  const isInsideVeer = play.concept === 'inside_veer' || play.id.includes('inside-veer');
  const isOutsideVeer = play.concept === 'outside_veer' || play.id.includes('outside-veer');
  const isCounter = play.concept === 'counter' || play.id.includes('counter');
  const isPower = (play.concept === 'power' || play.id.includes('power')) && !play.id.includes('pass') && play.concept !== 'flood';
  const isPowerPass = play.concept === 'flood' || play.id.includes('power-pass') || play.id.includes('flood');

  const getSvgCoords = (e: React.MouseEvent<SVGSVGElement>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 500, y: 390 };
    const rect = svg.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 620 / rect.height;
    return {
      x: Math.max(30, Math.min(970, (e.clientX - rect.left) * scaleX)),
      y: Math.max(30, Math.min(590, (e.clientY - rect.top) * scaleY)),
    };
  };

  const handleMouseDownSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chalkboardMode || draggingPlayerId) return;
    const pt = getSvgCoords(e);
    setDrawingStart(pt);
    setDrawingCurrent(pt);
  };

  const handleMouseMoveSvg = (e: React.MouseEvent<SVGSVGElement>) => {
    const pt = getSvgCoords(e);
    if (draggingPlayerId) {
      const basePt = baseOffense[draggingPlayerId];
      if (basePt) {
        onUpdateCustomOffset(draggingPlayerId, {
          x: pt.x - basePt.x,
          y: pt.y - basePt.y,
        });
      }
      return;
    }
    if (chalkboardMode && drawingStart) {
      setDrawingCurrent(pt);
    }
  };

  const handleMouseUpSvg = () => {
    if (draggingPlayerId) {
      setDraggingPlayerId(null);
      return;
    }
    if (chalkboardMode && drawingStart && drawingCurrent) {
      const dist = Math.hypot(drawingCurrent.x - drawingStart.x, drawingCurrent.y - drawingStart.y);
      if (dist > 24) {
        onAddCustomArrow({
          id: `arrow-${Date.now()}`,
          start: drawingStart,
          end: drawingCurrent,
          color: '#14B8A6',
        });
      }
    }
    setDrawingStart(null);
    setDrawingCurrent(null);
  };

  // Calculate animated offensive player coordinates
  const currentOffensivePositions: Record<string, Point> = {};
  Object.keys(baseOffense).forEach((pid) => {
    const offset = customOffsets[pid] || { x: 0, y: 0 };
    const pathDef = simResult.paths[pid];
    if (pathDef && pathDef.points.length > 0) {
      const shiftedPoints = pathDef.points.map((p) => ({
        x: p.x + offset.x,
        y: p.y + offset.y,
      }));
      currentOffensivePositions[pid] = interpolatePoints(shiftedPoints, progress);
    } else {
      currentOffensivePositions[pid] = {
        x: baseOffense[pid].x + offset.x,
        y: baseOffense[pid].y + offset.y,
      };
    }
  });

  // Calculate animated defensive positions based on play context
  const getAnimatedDefenderPoint = (def: (typeof frontConfig.players)[number]): Point => {
    if (progress <= 0) return { x: def.x, y: def.y };

    const isActDive =
      isInsideVeer
        ? (targetSide === 'left' ? !!def.weakDiveKey : !!def.isDiveKey)
        : isOutsideVeer
        ? (targetSide === 'left' ? (!!def.weakPitchKey || def.id === 'WDE') : (!!def.isPitchKey || def.id === 'SDE'))
        : false;

    const isActPitch =
      isInsideVeer
        ? (targetSide === 'left' ? !!def.weakPitchKey : !!def.isPitchKey)
        : isOutsideVeer
        ? (targetSide === 'left'
          ? (def.id === 'LCB' || def.id === 'WOLB' || !!def.weakPitchKey)
          : (def.id === 'RCB' || def.id === 'SOLB' || def.id === 'SLB' || !!def.isPitchKey))
        : false;

    if (isActDive) {
      if (diveBehavior === 'crash') {
        // Full commit directly into the dive back in the backfield at the B-gap mesh
        const targetX = targetSide === 'left'
          ? (isOutsideVeer ? 426 : 416)
          : (isOutsideVeer ? 574 : 584);
        const targetY = 412; // deep backfield commit to tackle dive back
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, progress * 2.2)
        );
      } else if (diveBehavior === 'squeeze') {
        const targetX = targetSide === 'left' ? def.x - 16 : def.x + 16;
        const targetY = 388;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, progress * 1.3)
        );
      } else {
        // Bull Rush / upfield
        const targetX = targetSide === 'left' ? def.x - 20 : def.x + 20;
        const targetY = 412;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, progress * 1.3)
        );
      }
    }

    if (isActPitch) {
      if (pitchBehavior === 'commit_qb') {
        // Number 2 read commits to the 1-back in the backfield, forcing backfield pitch
        const targetX = targetSide === 'left'
          ? (isOutsideVeer ? 350 : 370)
          : (isOutsideVeer ? 650 : 630);
        const targetY = 404; // drives into the backfield directly at the 1-back
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, progress * 1.65)
        );
      } else {
        // Number 2 read commits to the 3-back (pitch back), feathering wide to cover pitch
        const targetX = targetSide === 'left'
          ? (isOutsideVeer ? 260 : 290)
          : (isOutsideVeer ? 740 : 710);
        const targetY = 380; // wide perimeter leverage to cover pitch back
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, progress * 1.4)
        );
      }
    }

    // Power Pass: Linebackers bite hard forward on run fake; Free Safety steps down
    if (isPowerPass) {
      if (def.id === 'MLB' || def.id === 'SLB' || def.id === 'SILB' || def.id === 'WILB' || def.id === 'WLB') {
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + 12, y: def.y + 45 },
          ],
          Math.min(1, progress * 1.4)
        );
      }
      if (def.id === 'FS' || def.id === 'SS') {
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + 10, y: def.y + 35 },
          ],
          Math.min(1, progress * 1.1)
        );
      }
    }

    // Power: Edge defender gets kicked out wide by pulling guard
    const isEdgeDefender = targetSide === 'left'
      ? (def.id === 'WDE' || !!def.weakPitchKey)
      : (def.id === 'SDE' || !!def.isPitchKey);

    if (isPower && isEdgeDefender) {
      const kickX = targetSide === 'left' ? -28 : 28;
      return interpolatePoints(
        [
          { x: def.x, y: def.y },
          { x: def.x + kickX, y: def.y + 12 },
        ],
        Math.min(1, progress * 1.2)
      );
    }

    // Counter: Edge defender kicked out wide, linebackers pause on timing step
    if (isCounter && isEdgeDefender) {
      const kickX = targetSide === 'left' ? -28 : 28;
      return interpolatePoints(
        [
          { x: def.x, y: def.y },
          { x: def.x + kickX, y: def.y + 14 },
        ],
        Math.min(1, progress * 1.2)
      );
    }

    const driftX = targetSide === 'left' ? -14 * progress : 14 * progress;
    const driftY = 12 * progress;
    return { x: def.x + driftX, y: def.y + driftY };
  };

  // Compute live football position
  const getFootballPosition = (): Point => {
    if (progress <= 0.04) {
      const snapT = progress / 0.04;
      return interpolatePoints([currentOffensivePositions.C, currentOffensivePositions.QB], snapT);
    }

    // Power Pass (Y Pop): Fake to LH, gather, throw in the air to YTE
    if (isPowerPass) {
      if (progress < 0.42) {
        return currentOffensivePositions.QB;
      }
      if (progress < 0.78) {
        const passT = (progress - 0.42) / 0.36;
        return interpolatePoints([currentOffensivePositions.QB, currentOffensivePositions.YTE], passT);
      }
      return currentOffensivePositions.YTE;
    }

    // Power (34 Power / 23 Power):
    // Runner takes hesitation step to allow guard to clear; handoff is made when 1 back and runner mesh at 0.38-0.42
    if (isPower) {
      const runnerId = targetSide === 'left' ? 'RH' : 'LH';
      const qbPos = currentOffensivePositions.QB;
      const runnerPos = currentOffensivePositions[runnerId] || qbPos;

      if (progress < 0.38) {
        return qbPos;
      }
      if (progress <= 0.42) {
        // Handoff occurs cleanly when the 1 back and ball runner mesh
        const handoffT = (progress - 0.38) / 0.04;
        return {
          x: qbPos.x + (runnerPos.x - qbPos.x) * handoffT,
          y: qbPos.y + (runnerPos.y - qbPos.y) * handoffT,
        };
      }
      return runnerPos;
    }

    // Counter (23 Counter / 34 Counter):
    // Runner takes timing step to side; handoff is made when 1 back and runner mesh deep in backfield at 0.38-0.42
    if (isCounter) {
      const runnerId = targetSide === 'left' ? 'RH' : 'LH';
      const qbPos = currentOffensivePositions.QB;
      const runnerPos = currentOffensivePositions[runnerId] || qbPos;

      if (progress < 0.38) {
        return qbPos;
      }
      if (progress <= 0.42) {
        // Handoff occurs cleanly when the 1 back and ball runner mesh
        const handoffT = (progress - 0.38) / 0.04;
        return {
          x: qbPos.x + (runnerPos.x - qbPos.x) * handoffT,
          y: qbPos.y + (runnerPos.y - qbPos.y) * handoffT,
        };
      }
      return runnerPos;
    }

    // Option plays (21/31 Veer & 24/33 Veer)
    const isOptionPlay = isInsideVeer || isOutsideVeer || play.playType === 'Triple Option';
    const diveBackId = isOptionPlay
      ? (targetSide === 'left' ? 'LH' : 'RH')
      : (targetSide === 'left' ? 'RH' : 'LH');
    const pitchBackId = isOptionPlay
      ? (targetSide === 'left' ? 'RH' : 'LH')
      : (targetSide === 'left' ? 'LH' : 'RH');

    const qbPos = currentOffensivePositions.QB;
    const divePos = currentOffensivePositions[diveBackId] || qbPos;

    // Before mesh ride begins (progress < 0.20): 1-back (QB) holds ball firmly from snap
    if (progress < 0.20) {
      return qbPos;
    }

    // During the mesh ride in the backfield (progress 0.20 to 0.42):
    // 1-Back (QB) and Dive Back ride together at the B-gap seam reading #1 Dive Key.
    if (progress <= 0.42) {
      if (simResult.ballCarrierSequence.diveGive) {
        // Give is made during the mesh: smoothly seats into dive back's pocket as they mesh
        const meshT = (progress - 0.20) / 0.22;
        return {
          x: qbPos.x + (divePos.x - qbPos.x) * meshT,
          y: qbPos.y + (divePos.y - qbPos.y) * meshT,
        };
      }
      // On QB pull (keep or pitch), 1-back keeps ball in chest during the mesh read
      return qbPos;
    }

    // After mesh completion (progress > 0.42):
    if (simResult.ballCarrierSequence.diveGive) {
      // Dive back attacks vertically through the B-gap with the ball
      return divePos;
    }

    // If pulling: 1 attacks along the backfield track
    if (simResult.ballCarrierSequence.pitchTriggered) {
      // 1-back attacks #2 in the backfield until #2 commits to 1
      if (progress < 0.56) {
        return qbPos;
      }
      const pitchBackPos = currentOffensivePositions[pitchBackId] || qbPos;
      if (progress < 0.66) {
        // Pitch happens IN THE BACKFIELD (backward/lateral from 1 to pitch back)
        const pitchFlightT = (progress - 0.56) / 0.10;
        return {
          x: qbPos.x + (pitchBackPos.x - qbPos.x) * pitchFlightT,
          y: qbPos.y + (pitchBackPos.y - qbPos.y) * pitchFlightT,
        };
      }
      // Pitch back has secured the pitch in the backfield and carries it upfield
      return pitchBackPos;
    }

    // 1 keeper: QB cuts upfield inside pitch key
    return qbPos;
  };

  const ballPos = getFootballPosition();

  // Field landmarks along the Line of Scrimmage
  const gapMarkers = [
    { label: 'D-Gap', x: 332 },
    { label: 'C-Gap', x: 380 },
    { label: 'B-Gap', x: 428 },
    { label: 'A-Gap', x: 476 },
    { label: 'A-Gap', x: 524 },
    { label: 'B-Gap', x: 572 },
    { label: 'C-Gap', x: 620 },
    { label: 'D-Gap', x: 668 },
  ];

  // Colors based on active field theme
  const themeBg = activeTheme === 'chalkboard' ? '#03070A' : activeTheme === 'high_contrast' ? '#05090D' : '#060D12';
  const stripeA = activeTheme === 'chalkboard' ? '#03070A' : activeTheme === 'high_contrast' ? '#060A0E' : '#060E13';
  const stripeB = activeTheme === 'chalkboard' ? '#060B10' : activeTheme === 'high_contrast' ? '#0B1218' : '#09161F';
  const losStroke = activeTheme === 'chalkboard' ? '#2DD4BF' : activeTheme === 'high_contrast' ? '#00F5D4' : '#14B8A6';
  const yardLineColor = activeTheme === 'chalkboard' ? '#CBD5E1' : activeTheme === 'high_contrast' ? '#F8FAFC' : '#94A3B8';
  const yardLineOpacity = activeTheme === 'chalkboard' ? 0.35 : activeTheme === 'high_contrast' ? 0.45 : 0.22;

  return (
    <div
      style={{ backgroundColor: themeBg }}
      className="relative w-full rounded-2xl border border-[#162A33] overflow-hidden select-none shadow-2xl"
    >
      {/* Top tactical HUD strip inside canvas */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#050B0E]/95 border-b border-[#162A33] text-xs">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="font-bold text-white tracking-wide font-mono">{play.code}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>
            Formation: Split Back ({xMode === 'wide_x' ? 'Wide X' : 'Tight X'} / {eleventhMode === 'wide_z' ? 'Wide Z' : 'Wing Z'})
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-400 font-semibold">{frontConfig.shortLabel}</span>
        </div>

        {/* Tactical Field Visual Contrast Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Field Contrast:</span>
          <div className="flex items-center gap-1 p-0.5 bg-[#091217] border border-[#162A33] rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => handleThemeChange('night_turf')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeTheme === 'night_turf'
                  ? 'bg-teal-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Night Turf
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('chalkboard')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeTheme === 'chalkboard'
                  ? 'bg-teal-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chalkboard
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('high_contrast')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeTheme === 'high_contrast'
                  ? 'bg-teal-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              High Contrast
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono-tabular pl-2 border-l border-[#162A33]">
            <span className="text-teal-400 font-bold">{simResult.ballCarrierSequence.outcomeLabel}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-semibold">{simResult.ballCarrierSequence.expectedYards}</span>
          </div>
        </div>
      </div>

      {/* Main Responsive SVG Chalkboard with guaranteed dark background */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 620"
        style={{ backgroundColor: themeBg }}
        className={`w-full h-auto block ${chalkboardMode ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={handleMouseDownSvg}
        onMouseMove={handleMouseMoveSvg}
        onMouseUp={handleMouseUpSvg}
      >
        <defs>
          {/* Arrowhead markers */}
          <marker id="arrow-dive" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#F59E0B" />
          </marker>
          <marker id="arrow-qb" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
          </marker>
          <marker id="arrow-pitch" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#14B8A6" />
          </marker>
          <marker id="arrow-pass" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#A855F7" />
          </marker>
          <marker id="arrow-custom" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#2DD4BF" />
          </marker>
          <marker id="block-tee" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <line x1="5" y1="0" x2="5" y2="10" stroke="#CBD5E1" strokeWidth="3" />
          </marker>
          <marker id="block-kickout" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <line x1="5" y1="0" x2="5" y2="10" stroke="#FFFFFF" strokeWidth="3.4" />
          </marker>
        </defs>

        {/* Solid Field Base Rect (Guarantees NEVER white!) */}
        <rect x="0" y="0" width="1000" height="620" fill={themeBg} />

        {/* Direct Solid Turf Yard Bands (No SVG pattern dependencies!) */}
        {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((yVal, i) => (
          <rect
            key={`band-${yVal}`}
            x="0"
            y={yVal}
            width="1000"
            height="60"
            fill={i % 2 === 0 ? stripeA : stripeB}
          />
        ))}

        {/* Yard Lines & Numbers */}
        {[90, 150, 210, 270, 330, 390, 450, 510, 570].map((yVal, i) => (
          <g key={yVal}>
            <line
              x1="40"
              y1={yVal}
              x2="960"
              y2={yVal}
              stroke={yVal === 390 ? losStroke : yardLineColor}
              strokeOpacity={yVal === 390 ? 0.95 : yardLineOpacity}
              strokeWidth={yVal === 390 ? 2.8 : 1.2}
              strokeDasharray={yVal === 390 ? '8 6' : undefined}
            />
            {/* Hash marks */}
            <line x1="330" y1={yVal - 6} x2="330" y2={yVal + 6} stroke={yardLineColor} strokeOpacity={0.35} strokeWidth="1.8" />
            <line x1="670" y1={yVal - 6} x2="670" y2={yVal + 6} stroke={yardLineColor} strokeOpacity={0.35} strokeWidth="1.8" />
            {i % 2 === 1 && yVal !== 390 && (
              <>
                <text x="68" y={yVal + 5} fill="#FFFFFF" fillOpacity="0.25" fontSize="16" fontWeight="700" className="font-display">
                  {yVal < 390 ? `+${Math.round((390 - yVal) / 12)} YDS` : `-${Math.round((yVal - 390) / 12)} YDS`}
                </text>
                <text x="885" y={yVal + 5} fill="#FFFFFF" fillOpacity="0.25" fontSize="16" fontWeight="700" className="font-display">
                  {yVal < 390 ? `+${Math.round((390 - yVal) / 12)} YDS` : `-${Math.round((yVal - 390) / 12)} YDS`}
                </text>
              </>
            )}
          </g>
        ))}

        {/* Line of Scrimmage Label */}
        <text x="52" y="383" fill="#14B8A6" fillOpacity="0.9" fontSize="11" fontWeight="700" className="font-mono-tabular">
          LINE OF SCRIMMAGE (LOS)
        </text>

        {/* Optional Gap Labels & Split Guides */}
        {showGapLabels && (
          <g>
            {gapMarkers.map((g, idx) => (
              <g key={`${g.label}-${idx}`} transform={`translate(${g.x}, 372)`}>
                <rect x="-20" y="-11" width="40" height="15" rx="3" fill="#060D11" fillOpacity="0.85" stroke="#162A33" strokeWidth="0.8" />
                <text x="0" y="0" textAnchor="middle" fill="#5EEAD4" fontSize="9.5" fontWeight="600" className="font-mono-tabular">
                  {g.label}
                </text>
              </g>
            ))}
            <line x1="295" y1="390" x2="295" y2="496" stroke="#14B8A6" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
            <text x="286" y="448" textAnchor="end" fill="#5EEAD4" fontSize="10" className="font-mono-tabular">
              4.0 Yd Back Depth
            </text>
          </g>
        )}

        {/* Schematic Paths for All 11 Offensive Players */}
        {showBlockingAngles &&
          Object.entries(simResult.paths).map(([pid, pathObj]) => {
            const offset = customOffsets[pid] || { x: 0, y: 0 };
            const shiftedPts = pathObj.points.map((p) => ({
              x: p.x + offset.x,
              y: p.y + offset.y,
            }));
            const d = pointsToSvgPath(shiftedPts);

            let stroke = '#94A3B8';
            let strokeWidth = 2.2;
            let dashArray: string | undefined = undefined;
            let markerEnd = 'url(#block-tee)';

            if (pathObj.role === 'dive') {
              stroke = '#F59E0B';
              strokeWidth = 3.6;
              markerEnd = 'url(#arrow-dive)';
            } else if (pathObj.role === 'qb') {
              stroke = '#38BDF8';
              strokeWidth = 3.4;
              markerEnd = 'url(#arrow-qb)';
            } else if (pathObj.role === 'pitch') {
              stroke = '#14B8A6';
              strokeWidth = 3.2;
              dashArray = '7 4';
              markerEnd = 'url(#arrow-pitch)';
            } else if (pathObj.role === 'route_pass') {
              stroke = '#A855F7';
              strokeWidth = 3.4;
              markerEnd = 'url(#arrow-pass)';
            } else if (pathObj.role === 'fake') {
              stroke = '#F59E0B';
              strokeWidth = 2.4;
              dashArray = '4 4';
              markerEnd = 'url(#arrow-dive)';
            } else if (pathObj.role === 'block_pull') {
              stroke = '#FFFFFF';
              strokeWidth = 3.2;
              dashArray = '5 3';
              markerEnd = 'url(#block-kickout)';
            }

            const isSelected = selectedPlayerId === pid;

            return (
              <g key={`path-${pid}`} opacity={selectedPlayerId && !isSelected ? 0.55 : 0.95}>
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isSelected ? strokeWidth + 1.5 : strokeWidth}
                  strokeDasharray={dashArray}
                  markerEnd={markerEnd}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

        {/* Pitch Relationship Dashed Line on Option Plays (Inside & Outside Veer) */}
        {(isInsideVeer || isOutsideVeer || play.playType === 'Triple Option') && (
          <g opacity="0.85">
            {(() => {
              const qbPt = currentOffensivePositions.QB;
              const pitchBackId = targetSide === 'left' ? 'RH' : 'LH';
              const pbPt = currentOffensivePositions[pitchBackId];
              if (!qbPt || !pbPt) return null;
              return (
                <>
                  <line
                    x1={qbPt.x}
                    y1={qbPt.y}
                    x2={pbPt.x}
                    y2={pbPt.y}
                    stroke="#14B8A6"
                    strokeWidth="1.5"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={(qbPt.x + pbPt.x) / 2}
                    y={(qbPt.y + pbPt.y) / 2 + 16}
                    textAnchor="middle"
                    fill="#2DD4BF"
                    fontSize="9.5"
                    fontWeight="700"
                    className="font-mono-tabular"
                  >
                    {isInsideVeer ? '4x4 Backfield Pitch Spacing' : 'Backfield Pitch Track'}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Pulling Guard Label Annotation on Power and Counter */}
        {(isPower || isCounter) && (
          <g opacity="0.95">
            {(() => {
              const pullId = targetSide === 'left' ? 'RG' : 'LG';
              const pPt = currentOffensivePositions[pullId];
              if (!pPt) return null;
              return (
                <text
                  x={pPt.x}
                  y={pPt.y + 24}
                  textAnchor="middle"
                  fill="#5EEAD4"
                  fontSize="9.5"
                  fontWeight="700"
                  className="font-mono-tabular"
                >
                  PULLING GUARD
                </text>
              );
            })()}
          </g>
        )}

        {/* Custom Coach Chalkboard Arrows in Vibrant Teal */}
        {customArrows.map((arrow) => (
          <line
            key={arrow.id}
            x1={arrow.start.x}
            y1={arrow.start.y}
            x2={arrow.end.x}
            y2={arrow.end.y}
            stroke={arrow.color}
            strokeWidth="3.2"
            markerEnd="url(#arrow-custom)"
          />
        ))}
        {drawingStart && drawingCurrent && (
          <line
            x1={drawingStart.x}
            y1={drawingStart.y}
            x2={drawingCurrent.x}
            y2={drawingCurrent.y}
            stroke="#2DD4BF"
            strokeWidth="2.8"
            strokeDasharray="4 4"
            markerEnd="url(#arrow-custom)"
          />
        )}

        {/* Defensive Players (11 Defenders) with Adaptive Key Halos */}
        {frontConfig.players.map((def) => {
          const pos = getAnimatedDefenderPoint(def);
          const isSelected = selectedPlayerId === def.id;

          const isInsideVeerDive = isInsideVeer && (targetSide === 'left' ? !!def.weakDiveKey : !!def.isDiveKey);
          const isInsideVeerPitch = isInsideVeer && (targetSide === 'left' ? !!def.weakPitchKey : !!def.isPitchKey);
          const isOutsideVeerDive = isOutsideVeer && (targetSide === 'left' ? (!!def.weakPitchKey || def.id === 'WDE') : (!!def.isPitchKey || def.id === 'SDE'));
          const isOutsideVeerPitch = isOutsideVeer && (targetSide === 'left' ? (def.id === 'LCB' || def.id === 'WOLB' || !!def.weakPitchKey) : (def.id === 'RCB' || def.id === 'SOLB' || def.id === 'SLB' || !!def.isPitchKey));
          const isCounterKickout = isCounter && (targetSide === 'left' ? (def.id === 'WDE' || !!def.weakPitchKey) : (def.id === 'SDE' || !!def.isPitchKey));
          const isPowerKickout = isPower && (targetSide === 'left' ? (def.id === 'WDE' || !!def.weakPitchKey) : (def.id === 'SDE' || !!def.isPitchKey));
          const isPowerIso = isPower && (def.id === 'MLB' || def.id === 'SLB' || def.id === 'SILB');

          const hasRedKey = isInsideVeerDive || isOutsideVeerDive || isPowerKickout || isCounterKickout;
          const hasTealKey = isInsideVeerPitch || isOutsideVeerPitch || isPowerIso;

          let keyText = '';
          if (isInsideVeerDive) keyText = '#1 DIVE KEY (DT)';
          else if (isOutsideVeerDive) keyText = '#1 DIVE KEY (EMLOS)';
          else if (isInsideVeerPitch) keyText = '#2 PITCH KEY (EMLOS)';
          else if (isOutsideVeerPitch) keyText = '#2 PITCH KEY (CORNER)';
          else if (isCounterKickout) keyText = targetSide === 'left' ? 'RG KICKOUT TARGET' : 'LG KICKOUT TARGET';
          else if (isPowerKickout) keyText = targetSide === 'left' ? 'RG KICKOUT TARGET' : 'LG KICKOUT TARGET';
          else if (isPowerIso) keyText = targetSide === 'left' ? 'LH LEAD ISO TARGET' : 'RH LEAD ISO TARGET';

          return (
            <g
              key={def.id}
              transform={`translate(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlayer(def.id);
              }}
            >
              {hasRedKey && (
                <>
                  <circle r="22" fill="#EF4444" fillOpacity="0.18" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="0" y="-26" textAnchor="middle" fill="#FCA5A5" fontSize="9.5" fontWeight="700" className="font-mono-tabular">
                    {keyText}
                  </text>
                </>
              )}
              {hasTealKey && (
                <>
                  <circle r="22" fill="#14B8A6" fillOpacity="0.18" stroke="#14B8A6" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="0" y="-26" textAnchor="middle" fill="#5EEAD4" fontSize="9.5" fontWeight="700" className="font-mono-tabular">
                    {keyText}
                  </text>
                </>
              )}

              {/* Defender Node */}
              <polygon
                points="0,-15 15,0 0,15 -15,0"
                fill={hasRedKey ? '#DC2626' : hasTealKey ? '#0D9488' : '#0B171E'}
                stroke={isSelected ? '#FFFFFF' : hasRedKey ? '#FCA5A5' : hasTealKey ? '#5EEAD4' : '#334D5C'}
                strokeWidth={isSelected ? 2.8 : 1.8}
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="700"
                className="font-mono-tabular pointer-events-none"
              >
                {hasRedKey ? '#1' : hasTealKey ? '#2' : def.label}
              </text>

              {/* Front Gap Assignment Badge */}
              {def.gap && (
                <g>
                  <rect
                    x="-21"
                    y="18"
                    width="42"
                    height="13"
                    rx="3"
                    fill="#050C10"
                    fillOpacity="0.95"
                    stroke={hasRedKey ? '#EF4444' : hasTealKey ? '#14B8A6' : '#264250'}
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="27.5"
                    textAnchor="middle"
                    fill={hasRedKey ? '#FCA5A5' : hasTealKey ? '#5EEAD4' : '#94A3B8'}
                    fontSize="8"
                    fontWeight="700"
                    className="font-mono-tabular pointer-events-none"
                  >
                    {def.gap}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Offensive Players (11 Players) - Black & Teal Theme */}
        {Object.entries(baseOffense).map(([pid, meta]) => {
          const pos = currentOffensivePositions[pid] || { x: meta.x, y: meta.y };
          const isSelected = selectedPlayerId === pid;
          const isFinalCarrier = simResult.ballCarrierSequence.finalCarrier === pid;

          let fill = '#0A1318';
          let stroke = '#94A3B8';

          if (pid === 'QB') {
            fill = '#0F766E';
            stroke = '#5EEAD4';
          } else if (pid === 'LH' || pid === 'RH') {
            fill = isFinalCarrier ? '#0D9488' : '#042F2E';
            stroke = isFinalCarrier ? '#99F6E4' : '#2DD4BF';
          } else if (meta.group === 'TE' || meta.group === 'WR') {
            fill = isPowerPass && pid === 'YTE' ? '#581C87' : '#08252B';
            stroke = isPowerPass && pid === 'YTE' ? '#E9D5FF' : '#5EEAD4';
          }

          const isPullingGuard = (isPower || isCounter) && (targetSide === 'left' ? pid === 'RG' : pid === 'LG');
          if (isPullingGuard) {
            fill = '#115E59';
            stroke = '#A7F3D0';
          }

          return (
            <g
              key={pid}
              transform={`translate(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`}
              className="cursor-pointer"
              onMouseDown={(e) => {
                if (chalkboardMode) {
                  e.stopPropagation();
                  setDraggingPlayerId(pid);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlayer(pid);
              }}
            >
              {isSelected && (
                <circle r="22" fill="none" stroke="#2DD4BF" strokeWidth="2.5" />
              )}

              {/* Highlight Flood Targets: Read 1 is RB Arrow, Read 2 is Y on Whip */}
              {isPowerPass && (
                <>
                  {((targetSide === 'left' && pid === 'RH') || (targetSide !== 'left' && pid === 'LH')) && (
                    <>
                      <circle r="24" fill="#14B8A6" fillOpacity="0.22" stroke="#14B8A6" strokeWidth="1.8" strokeDasharray="4 2" />
                      <text x="0" y="-26" textAnchor="middle" fill="#5EEAD4" fontSize="9.5" fontWeight="700" className="font-mono-tabular">
                        READ 1: RB ARROW
                      </text>
                    </>
                  )}
                  {((targetSide === 'left' && pid === 'XTE') || (targetSide !== 'left' && pid === 'YTE')) && (
                    <>
                      <circle r="24" fill="#A855F7" fillOpacity="0.22" stroke="#A855F7" strokeWidth="1.8" strokeDasharray="4 2" />
                      <text x="0" y="-26" textAnchor="middle" fill="#E9D5FF" fontSize="9.5" fontWeight="700" className="font-mono-tabular">
                        READ 2: Y WHIP OUT
                      </text>
                    </>
                  )}
                </>
              )}

              {meta.group === 'OL' ? (
                <rect
                  x="-15"
                  y="-13"
                  width="30"
                  height="26"
                  rx="5"
                  fill={fill}
                  stroke={isSelected ? '#2DD4BF' : stroke}
                  strokeWidth={isSelected ? 2.8 : 2}
                />
              ) : (
                <circle
                  r="16"
                  fill={fill}
                  stroke={isSelected ? '#2DD4BF' : stroke}
                  strokeWidth={isSelected ? 2.8 : 2}
                />
              )}

              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10.5"
                fontWeight="700"
                className="font-mono-tabular pointer-events-none"
              >
                {meta.label}
              </text>

              {/* LOS Alignment Badge for Y and Z when Gaps/Splits tool is enabled */}
              {showGapLabels && (pid === 'YTE' || pid === 'W') && (
                <g transform="translate(0, 24)">
                  <rect
                    x="-36"
                    y="-7"
                    width="72"
                    height="14"
                    rx="3"
                    fill="#060D11"
                    fillOpacity="0.95"
                    stroke={pid === 'YTE' ? '#10B981' : '#38BDF8'}
                    strokeWidth="0.9"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={pid === 'YTE' ? '#6EE7B7' : '#BAE6FD'}
                    fontSize="7.5"
                    fontWeight="700"
                    className="font-mono-tabular pointer-events-none"
                  >
                    {pid === 'YTE'
                      ? 'Attached (LOS)'
                      : (eleventhMode === 'wing_z' ? 'Wing (Off LOS)' : 'Wide (Off LOS)')}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Animated Football */}
        <g transform={`translate(${ballPos.x.toFixed(1)}, ${(ballPos.y - 14).toFixed(1)})`}>
          <ellipse rx="8.5" ry="5.5" fill="#B45309" stroke="#FEF3C7" strokeWidth="1.5" transform="rotate(-20)" />
          <line x1="-4" y1="-1" x2="4" y2="1" stroke="#FEF3C7" strokeWidth="1.2" />
        </g>
      </svg>

      {/* Bottom Legend & Live Coaching Explanation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 bg-[#060D11] border-t border-[#162A33] text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          {isCounter ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B] inline-block" /> {targetSide === 'left' ? 'RH' : 'LH'} Timing Step & Cutback
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#FFFFFF] inline-block" /> {targetSide === 'left' ? 'RG' : 'LG'} Pull & Kickout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" /> QB Deep Backfield Mesh
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#DC2626] inline-block" /> Kickout Target
              </span>
            </>
          ) : isPower ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B] inline-block" /> {targetSide === 'left' ? 'RH' : 'LH'} Hesitation & Power Path
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#FFFFFF] inline-block" /> {targetSide === 'left' ? 'RG' : 'LG'} Pull & Kickout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#94A3B8] inline-block" /> {targetSide === 'left' ? 'LH' : 'RH'} Lead ISO Block
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#DC2626] inline-block" /> Kickout Target
              </span>
            </>
          ) : isPowerPass ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#14B8A6] inline-block" /> 1) RB Arrow (Flat)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#A855F7] inline-block" /> 2) Y 7-Yd Whip Out
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" /> 3) Z Post Corner
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B] inline-block" /> Power Run Fake
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B] inline-block" /> {isOutsideVeer ? 'B-Gap Dive Track' : 'A-Gap Dive Track'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" /> QB Option Path
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#14B8A6] inline-block" /> 5x2 Pitch Track
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#DC2626] inline-block" /> #1 Dive Key
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#0D9488] inline-block" /> #2 Pitch Key
              </span>
            </>
          )}
        </div>
        <p className="text-slate-300 font-medium">
          <span className="text-teal-400 font-semibold">Execution Analysis:</span> {simResult.ballCarrierSequence.coachingExplanation}
        </p>
      </div>
    </div>
  );
};
