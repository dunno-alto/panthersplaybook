import React, { useRef, useState } from 'react';
import {
  DEFENSIVE_FRONTS,
  DefensiveFrontId,
  DiveKeyBehavior,
  EleventhPlayerMode,
  PitchKeyBehavior,
  PlayDefinition,
  Point,
  PowerPassReceiverOption,
  TargetSide,
  XPlayerMode,
  ZAlignmentSide,
  getBaseOffensiveAlignment,
} from '../data/veerPlaybookData';

export interface CoachNotation {
  id: string;
  type?: 'arrow' | 'freehand';
  start?: Point;
  end?: Point;
  points?: Point[];
  color: string;
  width?: number;
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
  customArrows: CoachNotation[];
  onAddCustomArrow: (arrow: CoachNotation) => void;
  penMode?: 'freehand' | 'arrow';
  penColor?: string;
  fieldTheme?: 'night_turf' | 'chalkboard' | 'high_contrast';
  onChangeFieldTheme?: (theme: 'night_turf' | 'chalkboard' | 'high_contrast') => void;
  powerPassReceiver?: PowerPassReceiverOption;
  hideDefense?: boolean;
  showPlayerLabels?: boolean;
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
  penMode = 'freehand',
  penColor = '#FACC15',
  fieldTheme = 'night_turf',
  onChangeFieldTheme,
  powerPassReceiver = 'whip',
  hideDefense = false,
  showPlayerLabels = true,
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
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[] | null>(null);

  const baseOffense = getBaseOffensiveAlignment(eleventhMode, xMode, zSide);
  const frontConfig = DEFENSIVE_FRONTS[frontId];
  const simResult = play.getOffensivePaths(frontId, diveBehavior, pitchBehavior, eleventhMode, xMode, zSide, targetSide);

  const isInsideVeer = play.concept === 'inside_veer' || play.id.includes('inside-veer');
  const isOutsideVeer = play.concept === 'outside_veer' || play.id.includes('outside-veer');
  const isTrap = play.concept === 'trap' || play.id.includes('trap') || play.concept === 'counter' || play.id.includes('counter');
  const isCounter = isTrap;
  const isPower = (play.concept === 'power' || play.id.includes('power')) && !play.id.includes('pass') && play.concept !== 'flood';
  const isPowerPass = play.concept === 'flood' || play.id.includes('power-pass') || play.id.includes('flood');
  const isOptionPlay = isInsideVeer || isOutsideVeer || play.playType === 'Triple Option';

  const isBlankPlay = play.concept === 'blank';
  const shouldShowLabels = !!showPlayerLabels;

  const getSvgCoords = (e: React.PointerEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 500, y: 390 };
    const rect = svg.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 620 / rect.height;
    return {
      x: Math.max(10, Math.min(990, (e.clientX - rect.left) * scaleX)),
      y: Math.max(10, Math.min(610, (e.clientY - rect.top) * scaleY)),
    };
  };

  const handlePointerDownSvg = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!chalkboardMode || draggingPlayerId) return;
    e.preventDefault();
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {}
    const pt = getSvgCoords(e);
    setDrawingStart(pt);
    setDrawingCurrent(pt);
    setCurrentStrokePoints([pt]);
  };

  const handlePointerMoveSvg = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = getSvgCoords(e);
    if (draggingPlayerId) {
      const offBase = baseOffense[draggingPlayerId];
      const defNode = frontConfig.players.find((d) => d.id === draggingPlayerId);
      const basePt = offBase || defNode;
      if (basePt) {
        onUpdateCustomOffset(draggingPlayerId, {
          x: Math.round(pt.x - basePt.x),
          y: Math.round(pt.y - basePt.y),
        });
      }
      return;
    }
    if (chalkboardMode && currentStrokePoints) {
      e.preventDefault();
      setDrawingCurrent(pt);
      if (penMode === 'arrow') {
        setCurrentStrokePoints([currentStrokePoints[0], pt]);
      } else {
        const lastPt = currentStrokePoints[currentStrokePoints.length - 1];
        if (Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y) >= 2) {
          setCurrentStrokePoints((prev) => (prev ? [...prev, pt] : [pt]));
        }
      }
    }
  };

  const handlePointerUpSvg = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingPlayerId) {
      setDraggingPlayerId(null);
      return;
    }
    if (chalkboardMode && currentStrokePoints) {
      try {
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      } catch {}
      if (penMode === 'arrow' && drawingStart && drawingCurrent) {
        const dist = Math.hypot(drawingCurrent.x - drawingStart.x, drawingCurrent.y - drawingStart.y);
        if (dist > 8) {
          onAddCustomArrow({
            id: `arrow-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type: 'arrow',
            start: drawingStart,
            end: drawingCurrent,
            color: penColor,
            width: 3.5,
          });
        }
      } else if (currentStrokePoints.length >= 2) {
        onAddCustomArrow({
          id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'freehand',
          points: currentStrokePoints,
          color: penColor,
          width: 3.5,
        });
      }
    }
    setDrawingStart(null);
    setDrawingCurrent(null);
    setCurrentStrokePoints(null);
  };

  const handlePointerCancelSvg = () => {
    setDrawingStart(null);
    setDrawingCurrent(null);
    setCurrentStrokePoints(null);
  };

  // Normalize speed of playart respective to position:
  // RB = 1, QB = .85, Recivers = 1, OL = .75, TE = .9
  const getOffenseSpeedMultiplier = (pid: string): number => {
    if (pid === 'RH' || pid === 'LH' || pid === 'FB' || pid === 'RB') return 1.0;
    if (pid === 'QB') return 0.85;
    if (pid === 'C' || pid === 'LG' || pid === 'RG' || pid === 'LT' || pid === 'RT' || pid.includes('OL')) return 0.75;
    if (pid === 'YTE' || pid === 'TE' || (pid === 'XTE' && xMode === 'tight_x')) return 0.9;
    if (pid === 'W' || pid === 'Z' || pid === 'WR' || (pid === 'XTE' && xMode === 'wide_x')) return 1.0;
    return 1.0;
  };

  // DL = .8, inside lb = .85, DBs and Safeties = 1, outside lb = .9
  const getDefenseSpeedMultiplier = (def: (typeof frontConfig.players)[number]): number => {
    const id = def.id;
    // DL = .8
    if (
      id === 'NT' ||
      id === 'LDT' ||
      id === 'RDT' ||
      id === 'SDT' ||
      id === 'WDT' ||
      id === 'SNG' ||
      id === 'WNG' ||
      id === 'DT' ||
      id === 'NG' ||
      id === 'LDE' ||
      id === 'RDE' ||
      id === 'SDE' ||
      id === 'WDE' ||
      id === 'DE'
    ) {
      return 0.8;
    }
    // Inside lb = .85
    if (
      id === 'MLB' ||
      id === 'SILB' ||
      id === 'WILB' ||
      id === 'MIKE' ||
      id === 'WILL' ||
      id === 'ILB'
    ) {
      return 0.85;
    }
    // Outside lb = .9
    if (
      id === 'SLB' ||
      id === 'WLB' ||
      id === 'SOLB' ||
      id === 'WOLB' ||
      id === 'SAM' ||
      id === 'ROV' ||
      id === 'ROVER' ||
      id === 'OLB'
    ) {
      return 0.9;
    }
    // DBs and Safeties = 1
    if (
      id === 'LCB' ||
      id === 'RCB' ||
      id === 'FS' ||
      id === 'SS' ||
      id === 'CB' ||
      id === 'DB' ||
      id === 'SAF'
    ) {
      return 1.0;
    }
    return 0.85;
  };

  // Calculate animated offensive player coordinates with position-normalized speeds
  const currentOffensivePositions: Record<string, Point> = {};
  Object.keys(baseOffense).forEach((pid) => {
    const offset = customOffsets[pid] || { x: 0, y: 0 };
    const pathDef = simResult.paths[pid];
    const speed = getOffenseSpeedMultiplier(pid);
    const playerProgress = Math.min(1, progress * speed);
    if (pathDef && pathDef.points.length > 0) {
      const shiftedPoints = pathDef.points.map((p) => ({
        x: p.x + offset.x,
        y: p.y + offset.y,
      }));
      currentOffensivePositions[pid] = interpolatePoints(shiftedPoints, playerProgress);
    } else {
      currentOffensivePositions[pid] = {
        x: baseOffense[pid].x + offset.x,
        y: baseOffense[pid].y + offset.y,
      };
    }
  });

  // Calculate animated defensive positions based on physical blocking boundary conditions
  // (Defenders cannot phase through blockers; blockers physically drive, seal, or kick out defenders to form realistic gaps)
  const currentDefensivePositions: Record<string, Point> = {};
  if (progress <= 0) {
    frontConfig.players.forEach((def) => {
      currentDefensivePositions[def.id] = { x: def.x, y: def.y };
    });
  } else {
    const playsideGuardId = targetSide === 'left' ? 'LG' : 'RG';
    const playsideTackleId = targetSide === 'left' ? 'LT' : 'RT';
    const backsideTackleId = targetSide === 'left' ? 'RT' : 'LT';
    const pullingGuardId = targetSide === 'left' ? 'RG' : 'LG';
    const leadBackId = targetSide === 'left' ? 'LH' : 'RH';
    const playsideTEId = targetSide === 'left' ? 'XTE' : 'YTE';

    const centerPos = currentOffensivePositions.C || baseOffense.C;
    const playsideGuardPos = currentOffensivePositions[playsideGuardId] || baseOffense[playsideGuardId];
    const playsideTacklePos = currentOffensivePositions[playsideTackleId] || baseOffense[playsideTackleId];
    const backsideTacklePos = currentOffensivePositions[backsideTackleId] || baseOffense[backsideTackleId];
    const pullingGuardPos = currentOffensivePositions[pullingGuardId] || baseOffense[pullingGuardId];
    const leadBackPos = currentOffensivePositions[leadBackId] || baseOffense[leadBackId];
    const playsideTEPos = currentOffensivePositions[playsideTEId] || baseOffense[playsideTEId] || baseOffense.YTE;

    frontConfig.players.forEach((def) => {
      const defSpeed = getDefenseSpeedMultiplier(def);
      const t = Math.min(1, progress * defSpeed);

      const isDL =
        def.id === 'NT' ||
        def.id === 'LDT' ||
        def.id === 'RDT' ||
        def.id === 'SDT' ||
        def.id === 'WDT' ||
        def.id === 'SNG' ||
        def.id === 'WNG' ||
        def.id === 'DT' ||
        def.id === 'NG' ||
        def.id === 'LDE' ||
        def.id === 'RDE' ||
        def.id === 'SDE' ||
        def.id === 'WDE' ||
        def.id === 'DE' ||
        (def.y >= 335 && def.y <= 360);

      const isInsideLB =
        def.id === 'MLB' ||
        def.id === 'SILB' ||
        def.id === 'WILB' ||
        def.id === 'MIKE' ||
        def.id === 'WILL' ||
        def.id === 'ILB';

      const isOutsideLB =
        def.id === 'SLB' ||
        def.id === 'WLB' ||
        def.id === 'SOLB' ||
        def.id === 'WOLB' ||
        def.id === 'SAM' ||
        def.id === 'ROV' ||
        def.id === 'ROVER' ||
        def.id === 'OLB';

      const isDB =
        def.id === 'LCB' ||
        def.id === 'RCB' ||
        def.id === 'FS' ||
        def.id === 'SS' ||
        def.id === 'CB' ||
        def.id === 'DB' ||
        def.id === 'SAF' ||
        def.y < 280;

      // Unblocked Option Read Keys
      const isActDive = isInsideVeer
        ? (targetSide === 'left' ? !!def.weakDiveKey : !!def.isDiveKey)
        : isOutsideVeer
        ? (targetSide === 'left'
          ? (def.id === 'WDE' || (def.weakPitchKey && isDL))
          : (def.id === 'SDE' || (def.isPitchKey && isDL)))
        : false;

      const isActPitch = !isActDive && (isInsideVeer
        ? (targetSide === 'left' ? (!!def.weakPitchKey && def.id !== 'LCB' && def.id !== 'RCB') : (!!def.isPitchKey && def.id !== 'LCB' && def.id !== 'RCB'))
        : isOutsideVeer
        ? (targetSide === 'left'
          ? ((def.id === 'WOLB' || def.id === 'WLB' || !!def.weakPitchKey) && def.id !== 'LCB' && def.id !== 'RCB' && !isDL)
          : ((def.id === 'SOLB' || def.id === 'SLB' || def.id === 'SS' || !!def.isPitchKey) && def.id !== 'LCB' && def.id !== 'RCB' && !isDL))
        : false);

      // 1. UNBLOCKED OPTION READ KEYS: Free movement (not constrained by offensive blockers)
      if (isActDive) {
        if (diveBehavior === 'crash') {
          const targetX = targetSide === 'left'
            ? (isOutsideVeer ? 426 : 452)
            : (isOutsideVeer ? 574 : 548);
          const targetY = 410;
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: targetX, y: targetY },
            ],
            Math.min(1, t * 1.8)
          );
          return;
        } else if (diveBehavior === 'squeeze') {
          const targetX = targetSide === 'left' ? def.x - 14 : def.x + 14;
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: targetX, y: 368 },
            ],
            Math.min(1, t * 1.2)
          );
          return;
        } else {
          const targetX = targetSide === 'left' ? def.x - 16 : def.x + 16;
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: targetX, y: 396 },
            ],
            Math.min(1, t * 1.2)
          );
          return;
        }
      }

      if (isActPitch) {
        if (pitchBehavior === 'commit_qb') {
          const targetX = targetSide === 'left'
            ? (isOutsideVeer ? 350 : 370)
            : (isOutsideVeer ? 650 : 630);
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: targetX, y: 404 },
            ],
            Math.min(1, t * 1.5)
          );
          return;
        } else {
          const targetX = targetSide === 'left'
            ? (isOutsideVeer ? 260 : 285)
            : (isOutsideVeer ? 740 : 715);
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: targetX, y: 376 },
            ],
            Math.min(1, t * 1.3)
          );
          return;
        }
      }

      // 2. DEFENSIVE BACKS: Cornerbacks (Coverage-First) & Safeties (Run-Support / Deep Middle)
      if (def.id === 'LCB' || def.id === 'RCB') {
        const isLeftCB = def.id === 'LCB';
        const receiverId = isLeftCB
          ? (zSide === 'left' ? 'W' : 'XTE')
          : (zSide === 'left' ? 'XTE' : 'W');

        const recPos = currentOffensivePositions[receiverId] || baseOffense[receiverId];
        const recBase = baseOffense[receiverId];

        if (recPos && recBase) {
          const isSplitWide = isLeftCB
            ? (receiverId === 'XTE' ? xMode === 'wide_x' : true)
            : (receiverId === 'W' ? eleventhMode === 'wide_z' : true);

          if (isPowerPass) {
            // Power Pass / Flood: Full pass coverage matching receiver route downfield
            const targetX = recPos.x + (isLeftCB ? 8 : -8);
            const targetY = Math.min(def.y, recPos.y - 26);
            currentDefensivePositions[def.id] = {
              x: def.x + (targetX - def.x) * Math.min(1, t * 1.25),
              y: def.y + (targetY - def.y) * Math.min(1, t * 1.25),
            };
            return;
          }

          if (isSplitWide || recBase.y - recPos.y > 25) {
            // Receiver is split wide or releasing downfield:
            // CB plays coverage first on receiver! Backpedals, matches lateral stem, and holds outside contain leverage
            const leverageOffset = isLeftCB ? -14 : 14;
            const targetCoverX = recPos.x + leverageOffset;
            // CB maintains 18-24px cushion over the receiver as he stems upfield, engaging stalk in secondary
            const targetCoverY = Math.min(def.y, Math.max(160, recPos.y - 20));

            currentDefensivePositions[def.id] = {
              x: def.x + (targetCoverX - def.x) * Math.min(1, t * 1.15),
              y: def.y + (targetCoverY - def.y) * Math.min(1, t * 1.15),
            };
            return;
          }

          // If receiver is tight on this side (e.g. tight XTE blocking inside):
          // CB maintains deep third / boundary zone coverage cushion
          const zoneDropY = def.y - 18 * Math.min(1, t * 0.9);
          const zoneApexX = def.x + (isLeftCB ? 12 : -12) * Math.min(1, t * 0.8);
          currentDefensivePositions[def.id] = {
            x: zoneApexX,
            y: zoneDropY,
          };
          return;
        }
      }

      if (def.id === 'FS') {
        const fillX = targetSide === 'left' ? 440 : 560;
        currentDefensivePositions[def.id] = interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: def.y + 8 },
            { x: fillX, y: 245 },
          ],
          Math.min(1, t * 1.0)
        );
        return;
      }

      if (def.id === 'SS') {
        const fillX = targetSide === 'left' ? 380 : 660;
        currentDefensivePositions[def.id] = interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: fillX, y: 255 },
          ],
          Math.min(1, t * 1.0)
        );
        return;
      }

      // 3. POWER PASS (Play-Action Flood): Pass Protection Boundary Condition
      if (isPowerPass) {
        if (isDL) {
          // Hard pocket boundary: DL rush is completely arrested at LOS pocket (Y <= 352)
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: def.x, y: 352 },
            ],
            Math.min(1, t * 1.1)
          );
          return;
        }
        if (isInsideLB || isOutsideLB) {
          const biteX = targetSide === 'left' ? def.x - 10 : def.x + 10;
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: biteX, y: Math.min(340, def.y + 38) },
            ],
            Math.min(1, t * 1.4)
          );
          return;
        }
      }

      // 4. POWER (34 Power / 23 Power): Kickout, ISO, and Down-Block Boundary Conditions
      if (isPower) {
        const isEdgeDefender = targetSide === 'left'
          ? (def.id === 'WDE' || !!def.weakPitchKey || def.id === 'WOLB')
          : (def.id === 'SDE' || !!def.isPitchKey || def.id === 'SOLB');

        if (isEdgeDefender) {
          // Edge defender: Squeezes initially into C-gap track, then KICKED OUT WIDE by pulling guard upon physical contact
          const squeezeX = targetSide === 'left' ? 8 * Math.min(1, t * 1.2) : -8 * Math.min(1, t * 1.2);
          const squeezeY = 10 * Math.min(1, t * 1.2);
          const naturalPos = {
            x: def.x + squeezeX,
            y: def.y + squeezeY,
          };

          // Kickout boundary condition: Pulling guard contacts and drives edge defender wide
          // The kickout block occurs ONLY when the pulling guard physically arrives at the defender!
          const kickX = targetSide === 'left' ? -26 : 26;
          const kickoutX = pullingGuardPos.x + kickX;
          const isContactMade = targetSide === 'left'
            ? kickoutX <= naturalPos.x
            : kickoutX >= naturalPos.x;

          if (isContactMade) {
            // Guard has arrived: kicks out edge defender wide and drives him back
            const pushDist = Math.abs(kickoutX - naturalPos.x);
            currentDefensivePositions[def.id] = {
              x: kickoutX,
              y: naturalPos.y - Math.min(16, pushDist * 0.35),
            };
          } else {
            // Pre-contact: Defender squeezes natural run-fit into C-gap track (smooth, zero teleportation)
            currentDefensivePositions[def.id] = naturalPos;
          }
          return;
        }

        const isPlaysideILB = isInsideLB && (targetSide === 'left' ? def.x <= 500 : def.x >= 500);
        if (isPlaysideILB) {
          // Playside Inside LB: Steps downhill into hole, met and SEALED INSIDE by Lead Back ISO block
          const naturalY = def.y + 14 * Math.min(1, t * 1.4);
          const naturalX = def.x + (targetSide === 'left' ? -6 : 6) * Math.min(1, t * 1.2);
          const naturalILB = { x: naturalX, y: naturalY };

          // ISO block contact: when lead back meets the ILB at the second level
          const isISOContact = leadBackPos.y <= naturalILB.y + 16;
          if (isISOContact) {
            const pushDepth = Math.max(0, (naturalILB.y + 16) - leadBackPos.y);
            const sealDirection = targetSide === 'left' ? 18 : -18;
            currentDefensivePositions[def.id] = {
              x: naturalILB.x + sealDirection * Math.min(1, pushDepth / 28),
              y: naturalILB.y - pushDepth * 0.5,
            };
          } else {
            currentDefensivePositions[def.id] = naturalILB;
          }
          return;
        }

        if (isDL) {
          // Playside Interior DL: Washed down inside by OL down-blocks, held at LOS
          const washX = targetSide === 'left' ? 24 : -24;
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: def.x + washX * 0.5, y: 350 },
              { x: def.x + washX, y: 352 },
            ],
            Math.min(1, t * 1.3)
          );
          return;
        }
      }

      // 5. TRAP (20 Trap / 30 Trap): Center Backside Seal & Pulling Guard Trap Kickout
      if (isTrap) {
        const isCenterFrontDefender = def.id === 'NT' || (isDL && Math.abs(def.x - 500) <= 28);
        if (isCenterFrontDefender) {
          // BOUNDARY CONDITION: Center seals defender to backside; pinned on backside hip of Center
          const backsideOffset = targetSide === 'left' ? 22 : -22;
          if (progress < 0.15) {
            currentDefensivePositions[def.id] = {
              x: def.x + (backsideOffset * 0.4) * (progress / 0.15),
              y: def.y + 4 * (progress / 0.15),
            };
          } else {
            currentDefensivePositions[def.id] = {
              x: centerPos.x + backsideOffset,
              y: Math.min(352, centerPos.y - 16),
            };
          }
          return;
        }

        const isTrapTarget = targetSide === 'left'
          ? (def.id === 'LDT' || def.id === 'WDT' || (isDL && def.x < 480 && def.x > 380 && !isCenterFrontDefender))
          : (def.id === 'RDT' || def.id === 'SDT' || (isDL && def.x > 520 && def.x < 620 && !isCenterFrontDefender));

        if (isTrapTarget) {
          // Penetrates 1 step across LOS, then TRAP-KICKED OUT WIDE by pulling guard!
          if (progress < 0.35) {
            currentDefensivePositions[def.id] = {
              x: def.x,
              y: def.y + 20 * (progress / 0.35),
            };
          } else {
            // BOUNDARY CONDITION: Trapped and driven outward by pulling guard; cannot cross inside!
            const kickX = targetSide === 'left' ? -26 : 26;
            currentDefensivePositions[def.id] = {
              x: pullingGuardPos.x + kickX,
              y: pullingGuardPos.y - 8,
            };
          }
          return;
        }

        if (isInsideLB || isOutsideLB) {
          const flowX = targetSide === 'left' ? -24 : 24;
          currentDefensivePositions[def.id] = interpolatePoints(
            [
              { x: def.x, y: def.y },
              { x: def.x + flowX, y: def.y + 6 },
            ],
            Math.min(1, t * 1.2)
          );
          return;
        }
      }

      // 6. VEER PLAYS (Inside Veer 22/31 & Outside Veer 24/33): Physical Blocking Boundaries & Gap Creation
      if (isDL) {
        const isBackside = targetSide === 'left' ? def.x > 515 : def.x < 485;
        const isCenterDL = def.id === 'NT' || Math.abs(def.x - 500) <= 24;

        if (isCenterDL) {
          // A. Nose Tackle / 0-Tech: Center & Backside Guard Ace Scoop Block
          // Pinned on backside hip of Center in the A-gap; CANNOT cross Center to playside!
          const backsideOffset = targetSide === 'left' ? 22 : -22;
          if (progress < 0.14) {
            currentDefensivePositions[def.id] = {
              x: def.x + (backsideOffset * 0.3) * (progress / 0.14),
              y: def.y + 4 * (progress / 0.14),
            };
          } else {
            currentDefensivePositions[def.id] = {
              x: centerPos.x + backsideOffset,
              y: Math.min(352, centerPos.y - 16),
            };
          }
          return;
        }

        if (isBackside) {
          const isBacksideDE = def.id.includes('DE') || Math.abs(def.x - 500) >= 90;
          if (isBacksideDE) {
            // Backside DE: Executes bootleg/counter contain & slow trail pursuit across the backfield.
            // NEVER collapses into the Center! Stays in his backside edge contain lane.
            const flowDir = targetSide === 'left' ? -1 : 1;
            const squeezeX = flowDir * 14 * Math.min(1, t * 0.9);
            const stepY = 22 * Math.min(1, t * 1.1);
            currentDefensivePositions[def.id] = {
              x: def.x + squeezeX,
              y: Math.min(376, def.y + stepY),
            };
            return;
          }

          // Backside Interior DT (e.g. 2i, 3, or 4-Tech): Cutoff block by Backside Tackle (LT/RT)
          // Pinned on backside hip of the Backside Tackle at his own gap; NEVER teleported to Center!
          const cutoffOffset = targetSide === 'left' ? 22 : -22;
          if (progress < 0.16) {
            currentDefensivePositions[def.id] = {
              x: def.x + (cutoffOffset * 0.25) * (progress / 0.16),
              y: def.y + 5 * (progress / 0.16),
            };
          } else {
            currentDefensivePositions[def.id] = {
              x: backsideTacklePos.x + cutoffOffset,
              y: Math.min(352, backsideTacklePos.y - 16),
            };
          }
          return;
        }

        // B. Playside Interior DL: Playside Down-Block
        // Driven inside toward Center by Guard/Tackle; CANNOT cross into B-gap!
        const sealInsideOffset = targetSide === 'left' ? 24 : -24;
        if (progress < 0.16) {
          currentDefensivePositions[def.id] = {
            x: def.x + (sealInsideOffset * 0.3) * (progress / 0.16),
            y: def.y + 6 * (progress / 0.16),
          };
        } else {
          currentDefensivePositions[def.id] = {
            x: playsideGuardPos.x + sealInsideOffset,
            y: Math.min(352, playsideGuardPos.y - 18),
          };
        }
        return;
      }

      if (isInsideLB) {
        // Playside Inside LB (Mike/SILB): Met at second level by climbing Tackle veer-block!
        const isPlaysideILB = targetSide === 'left' ? def.x <= 510 : def.x >= 490;
        if (isPlaysideILB) {
          // BOUNDARY CONDITION: Sealed inside by climbing Tackle; CANNOT scrape into dive seam!
          const sealInsideOffset = targetSide === 'left' ? 22 : -22;
          if (progress < 0.30 || playsideTacklePos.y > 340) {
            currentDefensivePositions[def.id] = {
              x: def.x,
              y: def.y + 16 * Math.min(1, progress / 0.30),
            };
          } else {
            currentDefensivePositions[def.id] = {
              x: playsideTacklePos.x + sealInsideOffset,
              y: playsideTacklePos.y - 14,
            };
          }
          return;
        }

        // Backside Inside LB: Scrapes across formation over top of Center scoop
        const flowX = targetSide === 'left' ? -22 : 22;
        currentDefensivePositions[def.id] = interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + flowX * 0.5, y: def.y + 6 },
            { x: def.x + flowX, y: def.y + 10 },
          ],
          Math.min(1, t * 1.1)
        );
        return;
      }

      if (isOutsideLB) {
        // Outside LB: Natural scrape flow and edge leverage
        const flowOutX = targetSide === 'left' ? -12 : 12;
        currentDefensivePositions[def.id] = interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + flowOutX * 0.5, y: def.y + 4 },
            { x: def.x + flowOutX, y: def.y + 8 },
          ],
          Math.min(1, t * 1.1)
        );
        return;
      }

      // Default defensive movement: step up into assigned gap and hold leverage
      const driftX = targetSide === 'left' ? -8 * t : 8 * t;
      const driftY = 6 * t;
      currentDefensivePositions[def.id] = { x: def.x + driftX, y: Math.min(360, def.y + driftY) };
    });

    // 7. UNIVERSAL MULTI-BODY NON-PENETRATION BOUNDARY SOLVER
    // Guarantees no defender can phase through an offensive player while eliminating looping orbits.
    // Boundary radius reduced to 25% of previous 27px boundary (~7px) for realistic shoulder-to-shoulder interaction.
    const minDistance = 7; // Reduced to 25% of original 27px boundary radius
    frontConfig.players.forEach((def) => {
      const isDefDL = def.id.includes('DT') || def.id.includes('DE') || def.id.includes('NG') || def.id === 'NT' || def.y >= 335;

      const isActDive = isInsideVeer
        ? (targetSide === 'left' ? !!def.weakDiveKey : !!def.isDiveKey)
        : isOutsideVeer
        ? (targetSide === 'left' ? (def.id === 'WDE' || (def.weakPitchKey && def.y >= 335)) : (def.id === 'SDE' || (def.isPitchKey && def.y >= 335)))
        : false;

      const isActPitch = !isActDive && (isInsideVeer
        ? (targetSide === 'left' ? (!!def.weakPitchKey && def.id !== 'LCB' && def.id !== 'RCB') : (!!def.isPitchKey && def.id !== 'LCB' && def.id !== 'RCB'))
        : isOutsideVeer
        ? (targetSide === 'left'
          ? ((def.id === 'WOLB' || def.id === 'WLB' || !!def.weakPitchKey) && def.id !== 'LCB' && def.id !== 'RCB' && !isDefDL)
          : ((def.id === 'SOLB' || def.id === 'SLB' || def.id === 'SS' || !!def.isPitchKey) && def.id !== 'LCB' && def.id !== 'RCB' && !isDefDL))
        : false);

      const diveBackId = isOptionPlay
        ? (targetSide === 'left' ? 'LH' : 'RH')
        : (targetSide === 'left' ? 'RH' : 'LH');
      const pitchBackId = isOptionPlay
        ? (targetSide === 'left' ? 'RH' : 'LH')
        : (targetSide === 'left' ? 'LH' : 'RH');

      Object.entries(currentOffensivePositions).forEach(([offId, offPt]) => {
        // Allow tackle contact ONLY between designated read-key tackler and their specific target:
        if (isActDive) {
          // #1 crashes to tackle ONLY the dive back at the mesh; #1 CANNOT sit on or phase into QB!
          if (diveBehavior === 'crash' && offId === diveBackId) {
            return;
          }
        } else if (isActPitch) {
          // #2 Pitch Key tackles QB on commit_qb; or tracks pitch back on feather_pitch
          if (pitchBehavior === 'commit_qb' && offId === 'QB') {
            return;
          }
          if (pitchBehavior === 'feather_pitch' && offId === pitchBackId) {
            return;
          }
        }

        const dPt = currentDefensivePositions[def.id];
        if (!dPt) return;

        const dx = dPt.x - offPt.x;
        const dy = dPt.y - offPt.y;
        const dist = Math.hypot(dx, dy);

        if (dist < minDistance) {
          // Boundary violation! Apply subtle physical contact deflection (25% radius)
          // Nudges defender slightly away from blocker along contact normal without looping orbit
          const penetration = minDistance - dist;
          const nx = dist > 0.1 ? dx / dist : (targetSide === 'left' ? -1 : 1);
          const ny = dist > 0.1 ? dy / dist : 0;
          currentDefensivePositions[def.id] = {
            x: dPt.x + nx * penetration,
            y: dPt.y + ny * penetration,
          };
        }
      });
    });
  }

  const getAnimatedDefenderPoint = (def: (typeof frontConfig.players)[number]): Point => {
    const rawPos = currentDefensivePositions[def.id] || { x: def.x, y: def.y };
    const offset = customOffsets[def.id];
    if (offset) {
      return {
        x: rawPos.x + offset.x,
        y: rawPos.y + offset.y,
      };
    }
    return rawPos;
  };

  // Compute live football position
  const getFootballPosition = (): Point => {
    if (play.concept === 'blank') {
      return currentOffensivePositions.QB || currentOffensivePositions.C || { x: 500, y: 412 };
    }

    if (progress <= 0.04) {
      const snapT = progress / 0.04;
      return interpolatePoints([currentOffensivePositions.C, currentOffensivePositions.QB], snapT);
    }

    // Power Pass (Play-Action Flood): Fake to back, gather drop, deliver pass to selected receiver
    if (isPowerPass) {
      let targetPlayerId = targetSide === 'left' ? 'XTE' : 'YTE';
      let releaseProgress = 0.65;
      let catchProgress = 0.80;
      let loftAmount = 14;

if (powerPassReceiver === 'arrow') {
        // 1st Read: 2-Back (RH) Arrow route into weak flat
        targetPlayerId = 'RH';
        releaseProgress = 0.60;
        catchProgress = 0.76;
        loftAmount = 10;
      } else if (powerPassReceiver === 'whip') {
        // 2nd Read: Y (YTE) 7-10 Yd Dig across middle
        targetPlayerId = 'YTE';
        releaseProgress = 0.65;
        catchProgress = 0.80;
        loftAmount = 14;
      } else if (powerPassReceiver === 'corner') {
        // 3rd Read: X (XTE) Post-Corner / Boundary Vertical
        targetPlayerId = 'XTE';
        releaseProgress = 0.68;
        catchProgress = 0.86;
        loftAmount = 24;
      } else if (powerPassReceiver === 'post') {
        // 4th Read: Z (W) Deep Inside Post
        targetPlayerId = 'W';
        releaseProgress = 0.73;
        catchProgress = 0.89;
        loftAmount = 26;
      } else {
        // Default to 1st Read: 2-Back (RH) Arrow
        targetPlayerId = 'RH';
        releaseProgress = 0.60;
        catchProgress = 0.76;
        loftAmount = 10;
      }

      const qbPos = currentOffensivePositions.QB;
      const receiverPos = currentOffensivePositions[targetPlayerId] || qbPos;

      if (progress < releaseProgress) {
        return qbPos;
      }
      if (progress < catchProgress) {
        const passT = (progress - releaseProgress) / (catchProgress - releaseProgress);
        const basePt = interpolatePoints([qbPos, receiverPos], passT);
        // Realistic pass flight loft arc in negative Y
        const loft = Math.sin(passT * Math.PI) * loftAmount;
        return { x: basePt.x, y: basePt.y - loft };
      }
      return receiverPos;
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

    // Trap (20 Trap / 30 Trap):
    // 1-back takes snap, spins 180° to fake to off RB sweeping behind 1.
    // Primary RB takes one large step as if running for pitch to outside, then comes back to 1 for the mesh.
    // Handoff is made when 1 and primary RB mesh at progress 0.50-0.60
    if (isTrap) {
      const primaryRunnerId = targetSide === 'left' ? 'LH' : 'RH';
      const qbPos = currentOffensivePositions.QB;
      const runnerPos = currentOffensivePositions[primaryRunnerId] || qbPos;

      if (progress < 0.50) {
        // Ball stays in 1-back's hands as 1 spins 180° and fakes to off RB sweeping behind 1
        return qbPos;
      }
      if (progress <= 0.60) {
        // Direct handoff into primary RB's pocket at the exact mesh contact point (zero teleporting)
        const handoffT = (progress - 0.50) / 0.10;
        return {
          x: qbPos.x + (runnerPos.x - qbPos.x) * handoffT,
          y: qbPos.y + (runnerPos.y - qbPos.y) * handoffT,
        };
      }
      return runnerPos;
    }

    // Option plays (22/31 Veer & 24/33 Veer)
    const diveBackId = isOptionPlay
      ? (targetSide === 'left' ? 'LH' : 'RH')
      : (targetSide === 'left' ? 'RH' : 'LH');
    const pitchBackId = isOptionPlay
      ? (targetSide === 'left' ? 'RH' : 'LH')
      : (targetSide === 'left' ? 'LH' : 'RH');

    const qbPos = currentOffensivePositions.QB;
    const divePos = currentOffensivePositions[diveBackId] || qbPos;

    // Before mesh ride begins (progress < 0.12): 1-back (QB) holds ball firmly from snap
    if (progress < 0.12) {
      return qbPos;
    }

    // During the quick mesh ride in the backfield (progress 0.12 to 0.26):
    // 1-Back (QB) and Dive Back ride together just long enough to read #1 Dive Key.
    if (progress <= 0.26) {
      if (simResult.ballCarrierSequence.diveGive) {
        // Give is made during the mesh: smoothly seats into dive back's pocket as they mesh
        const meshT = (progress - 0.12) / 0.14;
        return {
          x: qbPos.x + (divePos.x - qbPos.x) * meshT,
          y: qbPos.y + (divePos.y - qbPos.y) * meshT,
        };
      }
      // On QB pull (keep or pitch), 1-back keeps ball in chest during the mesh read
      return qbPos;
    }

    // After quick mesh read completion (progress > 0.26):
    if (simResult.ballCarrierSequence.diveGive) {
      // Dive back attacks vertically through the seam with the ball
      return divePos;
    }

    // If pulling: 1 attacks along the backfield track
    if (simResult.ballCarrierSequence.pitchTriggered) {
      // 1-back attacks #2 in the backfield until #2 commits to 1
      if (progress < 0.54) {
        return qbPos;
      }
      const pitchBackPos = currentOffensivePositions[pitchBackId] || qbPos;
      if (progress < 0.64) {
        // Pitch happens IN THE BACKFIELD (backward/lateral from 1 to pitch back)
        const pitchFlightT = (progress - 0.54) / 0.10;
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
            {isBlankPlay
              ? 'Blank Whiteboard Formation (Drag Offense & Defense · Draw with Coach Pen)'
              : `Formation: Split Back (${xMode === 'wide_x' ? 'Wide X' : 'Tight X'} / ${eleventhMode === 'wide_z' ? 'Wide Z' : 'Wing Z'})`}
          </span>
          {!hideDefense && !isBlankPlay && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-semibold">{frontConfig.shortLabel}</span>
            </>
          )}
        </div>

        {/* Tactical Field Visual Contrast Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#091217] border border-teal-500/30 rounded-lg text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-teal-300 font-bold">Night Turf</span>
          </div>

          {!isBlankPlay && (
            <div className="flex items-center gap-2 font-mono-tabular pl-2 border-l border-[#162A33]">
              <span className="text-teal-400 font-bold">{simResult.ballCarrierSequence.outcomeLabel}</span>
              {simResult.ballCarrierSequence.expectedYards && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-emerald-400 font-semibold">{simResult.ballCarrierSequence.expectedYards}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Responsive SVG Chalkboard with guaranteed dark background */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 620"
        style={{
          backgroundColor: themeBg,
          touchAction: chalkboardMode ? 'none' : 'auto',
          cursor: chalkboardMode ? 'crosshair' : 'default',
        }}
        className="w-full h-auto block"
        onPointerDown={handlePointerDownSvg}
        onPointerMove={handlePointerMoveSvg}
        onPointerUp={handlePointerUpSvg}
        onPointerCancel={handlePointerCancelSvg}
        onPointerLeave={handlePointerCancelSvg}
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
          {/* Coach Chalk Palette Arrowhead Markers */}
          <marker id="arrow-FACC15" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#FACC15" />
          </marker>
          <marker id="arrow-2DD4BF" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#2DD4BF" />
          </marker>
          <marker id="arrow-F87171" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#F87171" />
          </marker>
          <marker id="arrow-FFFFFF" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#FFFFFF" />
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

        {/* Optional Gap Labels & Split Guides */}
        {showGapLabels && shouldShowLabels && !isBlankPlay && (
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

        {/* Pitch Relationship Dashed Line on Option Plays (Inside & Outside Veer) - Clean without floating text */}
        {(isInsideVeer || isOutsideVeer || play.playType === 'Triple Option') && (
          <g opacity="0.85">
            {(() => {
              const qbPt = currentOffensivePositions.QB;
              const pitchBackId = targetSide === 'left' ? 'RH' : 'LH';
              const pbPt = currentOffensivePositions[pitchBackId];
              if (!qbPt || !pbPt) return null;
              return (
                <line
                  x1={qbPt.x}
                  y1={qbPt.y}
                  x2={pbPt.x}
                  y2={pbPt.y}
                  stroke="#14B8A6"
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                />
              );
            })()}
          </g>
        )}

        {/* Custom Coach Chalkboard Notations (Freehand Paths & Arrows) */}
        <g id="offense-coach-chalk-layer" style={{ pointerEvents: 'none' }}>
          {customArrows.map((item) => {
            if (item.type === 'freehand' && item.points && item.points.length >= 2) {
              return (
                <path
                  key={item.id}
                  d={pointsToSvgPath(item.points)}
                  fill="none"
                  stroke={item.color || '#FACC15'}
                  strokeWidth={item.width || 3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            }
            // Arrow notation
            const start = item.start || (item.points ? item.points[0] : null);
            const end = item.end || (item.points ? item.points[item.points.length - 1] : null);
            if (!start || !end) return null;
            const markerColor = (item.color || '#2DD4BF').replace('#', '');
            const markerId = `arrow-${markerColor}`;
            return (
              <g key={item.id}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={item.color || '#2DD4BF'}
                  strokeWidth={item.width || 3.2}
                  strokeLinecap="round"
                  markerEnd={`url(#${markerId})`}
                />
                <circle cx={start.x} cy={start.y} r={item.width ? item.width - 0.5 : 2.5} fill={item.color || '#2DD4BF'} />
              </g>
            );
          })}

          {/* In-Progress Stroke Preview */}
          {currentStrokePoints && currentStrokePoints.length >= 1 && (
            penMode === 'arrow' && drawingStart && drawingCurrent ? (
              <g>
                <line
                  x1={drawingStart.x}
                  y1={drawingStart.y}
                  x2={drawingCurrent.x}
                  y2={drawingCurrent.y}
                  stroke={penColor || '#FACC15'}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  markerEnd={`url(#arrow-${(penColor || '#FACC15').replace('#', '')})`}
                />
                <circle cx={drawingStart.x} cy={drawingStart.y} r={3} fill={penColor || '#FACC15'} />
              </g>
            ) : (
              <path
                d={pointsToSvgPath(currentStrokePoints)}
                fill="none"
                stroke={penColor || '#FACC15'}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          )}
        </g>

        {/* Defensive Players (11 Defenders) with Adaptive Key Halos */}
        {!hideDefense &&
          frontConfig.players.map((def) => {
            const pos = getAnimatedDefenderPoint(def);
            const isSelected = selectedPlayerId === def.id;

            const isInsideVeerDive = isInsideVeer && (targetSide === 'left' ? !!def.weakDiveKey : !!def.isDiveKey);
            const isInsideVeerPitch = isInsideVeer && (targetSide === 'left' ? (!!def.weakPitchKey && def.id !== 'LCB' && def.id !== 'RCB') : (!!def.isPitchKey && def.id !== 'LCB' && def.id !== 'RCB'));
            const isOutsideVeerDive = isOutsideVeer && (targetSide === 'left' ? (!!def.weakPitchKey || def.id === 'WDE') : (!!def.isPitchKey || def.id === 'SDE'));
            const isOutsideVeerPitch = isOutsideVeer && (targetSide === 'left' ? ((def.id === 'WOLB' || def.id === 'WLB' || !!def.weakPitchKey) && def.id !== 'LCB' && def.id !== 'RCB') : ((def.id === 'SOLB' || def.id === 'SLB' || def.id === 'SS' || !!def.isPitchKey) && def.id !== 'RCB' && def.id !== 'LCB'));
            const isTrapKickout = isTrap && (targetSide === 'left' ? (def.id === 'LDT' || def.id === 'WDT' || def.id === 'NT' || !!def.weakDiveKey) : (def.id === 'RDT' || def.id === 'SDT' || def.id === 'NT' || !!def.isDiveKey));
            const isPowerKickout = isPower && (targetSide === 'left' ? (def.id === 'WDE' || !!def.weakPitchKey) : (def.id === 'SDE' || !!def.isPitchKey));
            const isPowerIso = isPower && (def.id === 'MLB' || def.id === 'SLB' || def.id === 'SILB');

            const hasRedKey = isInsideVeerDive || isOutsideVeerDive || isPowerKickout || isTrapKickout;
            const hasTealKey = isInsideVeerPitch || isOutsideVeerPitch || isPowerIso;

            let keyText = '';
            if (isInsideVeerDive) keyText = '#1 DIVE KEY (DT)';
            else if (isOutsideVeerDive) keyText = '#1 DIVE KEY (EMLOS)';
            else if (isInsideVeerPitch) keyText = '#2 PITCH KEY (EMLOS)';
            else if (isOutsideVeerPitch) keyText = '#2 PITCH KEY (OVERHANG)';
            else if (isTrapKickout) keyText = targetSide === 'left' ? 'RG TRAP TARGET' : 'LG TRAP TARGET';
            else if (isPowerKickout) keyText = targetSide === 'left' ? 'RG KICKOUT TARGET' : 'LG KICKOUT TARGET';
            else if (isPowerIso) keyText = targetSide === 'left' ? 'LH LEAD ISO TARGET' : 'RH LEAD ISO TARGET';

            return (
              <g
                key={def.id}
                transform={`translate(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`}
                className="cursor-pointer"
                onPointerDown={(e) => {
                  if (chalkboardMode || isBlankPlay) {
                    e.stopPropagation();
                    try {
                      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
                    } catch {}
                    setDraggingPlayerId(def.id);
                  }
                }}
                onMouseDown={(e) => {
                  if (chalkboardMode || isBlankPlay) {
                    e.stopPropagation();
                    setDraggingPlayerId(def.id);
                  }
                }}
                onTouchStart={(e) => {
                  if (chalkboardMode || isBlankPlay) {
                    e.stopPropagation();
                    setDraggingPlayerId(def.id);
                  }
                }}
                onPointerUp={(e) => {
                  if (draggingPlayerId) {
                    try {
                      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
                    } catch {}
                    setDraggingPlayerId(null);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlayer(def.id);
                }}
              >
                {(isSelected || draggingPlayerId === def.id) && (
                  <polygon
                    points="0,-20 20,0 0,20 -20,0"
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="2.2"
                    strokeDasharray={draggingPlayerId === def.id ? '3 2' : undefined}
                  />
                )}

                {hasRedKey && !isBlankPlay && (
                  <circle r="22" fill="#EF4444" fillOpacity="0.18" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
                )}
                {hasTealKey && !isBlankPlay && (
                  <circle r="22" fill="#14B8A6" fillOpacity="0.18" stroke="#14B8A6" strokeWidth="1.5" strokeDasharray="3 2" />
                )}

                {/* Defender Node */}
                <polygon
                  points="0,-15 15,0 0,15 -15,0"
                  fill={hasRedKey ? '#DC2626' : hasTealKey ? '#0D9488' : '#0B171E'}
                  stroke={isSelected ? '#FFFFFF' : hasRedKey ? '#FCA5A5' : hasTealKey ? '#5EEAD4' : '#334D5C'}
                  strokeWidth={isSelected ? 2.8 : 1.8}
                />

                {/* Defender Node Text (hidden if labels are toggled off) */}
                {shouldShowLabels && (
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="700"
                    className="font-mono-tabular pointer-events-none"
                  >
                    {def.label}
                  </text>
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
            if (isPowerPass && isFinalCarrier) {
              fill = '#581C87';
              stroke = '#E9D5FF';
            }
          } else if (meta.group === 'TE' || meta.group === 'WR') {
            fill = isPowerPass && isFinalCarrier ? '#581C87' : '#08252B';
            stroke = isPowerPass && isFinalCarrier ? '#E9D5FF' : '#5EEAD4';
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
              onPointerDown={(e) => {
                if (chalkboardMode || isBlankPlay) {
                  e.stopPropagation();
                  try {
                    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
                  } catch {}
                  setDraggingPlayerId(pid);
                }
              }}
              onMouseDown={(e) => {
                if (chalkboardMode || isBlankPlay) {
                  e.stopPropagation();
                  setDraggingPlayerId(pid);
                }
              }}
              onTouchStart={(e) => {
                if (chalkboardMode || isBlankPlay) {
                  e.stopPropagation();
                  setDraggingPlayerId(pid);
                }
              }}
              onPointerUp={(e) => {
                if (draggingPlayerId) {
                  try {
                    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
                  } catch {}
                  setDraggingPlayerId(null);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlayer(pid);
              }}
            >
              {(isSelected || draggingPlayerId === pid) && (
                <circle
                  r={draggingPlayerId === pid ? 24 : 22}
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2.5"
                  strokeDasharray={draggingPlayerId === pid ? '4 2' : undefined}
                />
              )}

              {/* Highlight Power Pass Targets & Selected Receiver Option */}
              {isPowerPass && (
                <>
                  {/* Read 1: Playside RB Arrow */}
                  {((targetSide === 'left' && pid === 'RH') || (targetSide !== 'left' && pid === 'LH')) && (
                    <circle
                      r={isFinalCarrier ? 26 : 22}
                      fill="#14B8A6"
                      fillOpacity={isFinalCarrier ? 0.35 : 0.15}
                      stroke={isFinalCarrier ? '#5EEAD4' : '#14B8A6'}
                      strokeWidth={isFinalCarrier ? 2.5 : 1.5}
                      strokeDasharray={isFinalCarrier ? '5 2.5' : '4 2'}
                    />
                  )}

                  {/* Read 2: Playside TE/SE Whip Out */}
                  {((targetSide === 'left' && pid === 'XTE') || (targetSide !== 'left' && pid === 'YTE')) && (
                    <circle
                      r={isFinalCarrier ? 26 : 22}
                      fill="#A855F7"
                      fillOpacity={isFinalCarrier ? 0.35 : 0.15}
                      stroke={isFinalCarrier ? '#E9D5FF' : '#A855F7'}
                      strokeWidth={isFinalCarrier ? 2.5 : 1.5}
                      strokeDasharray={isFinalCarrier ? '5 2.5' : '4 2'}
                    />
                  )}

                  {/* Read 3: Z Post Corner */}
                  {pid === 'W' && (
                    <circle
                      r={isFinalCarrier ? 26 : 22}
                      fill="#F59E0B"
                      fillOpacity={isFinalCarrier ? 0.35 : 0.12}
                      stroke={isFinalCarrier ? '#FDE68A' : '#F59E0B'}
                      strokeWidth={isFinalCarrier ? 2.5 : 1.5}
                      strokeDasharray={isFinalCarrier ? '5 2.5' : '4 2'}
                    />
                  )}

                  {/* Checkdown: Backside RB Flat */}
                  {((targetSide === 'left' && pid === 'LH') || (targetSide !== 'left' && pid === 'RH')) && (
                    <circle
                      r={isFinalCarrier ? 26 : 20}
                      fill="#3B82F6"
                      fillOpacity={isFinalCarrier ? 0.35 : 0.12}
                      stroke={isFinalCarrier ? '#BFDBFE' : '#3B82F6'}
                      strokeWidth={isFinalCarrier ? 2.5 : 1.2}
                      strokeDasharray={isFinalCarrier ? '5 2.5' : '3 2'}
                    />
                  )}

                  {/* Backside: Isolated Post */}
                  {((targetSide === 'left' && pid === 'YTE') || (targetSide !== 'left' && pid === 'XTE')) && (
                    <circle
                      r={isFinalCarrier ? 26 : 20}
                      fill="#F43F5E"
                      fillOpacity={isFinalCarrier ? 0.35 : 0.12}
                      stroke={isFinalCarrier ? '#FECDD3' : '#F43F5E'}
                      strokeWidth={isFinalCarrier ? 2.5 : 1.2}
                      strokeDasharray={isFinalCarrier ? '5 2.5' : '3 2'}
                    />
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

              {/* Offensive Player Label (hidden if labels are toggled off) */}
              {shouldShowLabels && (
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
          {isTrap ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B] inline-block" /> {targetSide === 'left' ? '3-Back (LH)' : '2-Back (RH)'} Pitch-Fake Step & Cutback
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#FBBF24] inline-block" /> Center Backside Seal (NT/DT)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#0D9488] inline-block" /> {targetSide === 'left' ? '2-Back (RH)' : '3-Back (LH)'} Fake Through B-Gap to Backer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#FFFFFF] inline-block" /> {targetSide === 'left' ? 'RG' : 'LG'} Pull & Trap Kickout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#DC2626] inline-block" /> Trap Kickout Target
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
                <span className="w-3 h-0.5 bg-[#14B8A6] inline-block" /> 1) 2-Back Arrow (Flat)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#A855F7] inline-block" /> 2) Y 7-10 Yd Dig
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" /> 3) X Post-Corner (or Vert)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F43F5E] inline-block" /> 4) Z Deep Post
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B] inline-block" /> 6-Hole Fake (3-Back)
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
