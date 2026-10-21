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
  powerPassReceiver?: PowerPassReceiverOption;
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
  powerPassReceiver = 'whip',
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
  const isTrap = play.concept === 'trap' || play.id.includes('trap') || play.concept === 'counter' || play.id.includes('counter');
  const isCounter = isTrap;
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

  // Calculate animated defensive positions based on play context, assignments, and block reactions
  const getAnimatedDefenderPoint = (def: (typeof frontConfig.players)[number]): Point => {
    if (progress <= 0) return { x: def.x, y: def.y };

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

    // Check if this defender is an active Unblocked Read Key in the option
    const isActDive = isInsideVeer
      ? (targetSide === 'left' ? !!def.weakDiveKey : !!def.isDiveKey)
      : isOutsideVeer
      ? (targetSide === 'left'
        ? (def.id === 'WDE' || (def.weakPitchKey && isDL))
        : (def.id === 'SDE' || (def.isPitchKey && isDL)))
      : false;

    const isActPitch = !isActDive && (isInsideVeer
      ? (targetSide === 'left' ? !!def.weakPitchKey : !!def.isPitchKey)
      : isOutsideVeer
      ? (targetSide === 'left'
        ? (def.id === 'LCB' || def.id === 'WOLB' || def.id === 'WLB' || (!!def.weakPitchKey && !isDL))
        : (def.id === 'RCB' || def.id === 'SOLB' || def.id === 'SLB' || def.id === 'SS' || (!!def.isPitchKey && !isDL)))
      : false);

    // 1. UNBLOCKED OPTION READ KEYS: React to QB/Mesh assignments
    if (isActDive) {
      if (diveBehavior === 'crash') {
        // Crashes with full commit into the dive back in the backfield at the mesh
        const targetX = targetSide === 'left'
          ? (isOutsideVeer ? 426 : 456)
          : (isOutsideVeer ? 574 : 544);
        const targetY = isOutsideVeer ? 410 : 412;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, t * 1.8)
        );
      } else if (diveBehavior === 'squeeze') {
        // Squeezes square on LOS, refusing to commit to dive, forcing give
        const targetX = targetSide === 'left' ? def.x - 14 : def.x + 14;
        const targetY = 372;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, t * 1.2)
        );
      } else {
        // Bull Rush upfield
        const targetX = targetSide === 'left' ? def.x - 16 : def.x + 16;
        const targetY = 396;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, t * 1.2)
        );
      }
    }

    if (isActPitch) {
      if (pitchBehavior === 'commit_qb') {
        // Number 2 read commits to the 1-back (QB) in the backfield, forcing backfield pitch
        const targetX = targetSide === 'left'
          ? (isOutsideVeer ? 350 : 370)
          : (isOutsideVeer ? 650 : 630);
        const targetY = 404;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, t * 1.5)
        );
      } else {
        // Number 2 read feathers wide toward sideline to cover pitch back
        const targetX = targetSide === 'left'
          ? (isOutsideVeer ? 260 : 285)
          : (isOutsideVeer ? 740 : 715);
        const targetY = 376;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: targetX, y: targetY },
          ],
          Math.min(1, t * 1.3)
        );
      }
    }

    // 2. POWER PASS (Play-Action Flood)
    if (isPowerPass) {
      // Linebackers bite hard forward on run fake toward line of scrimmage
      if (isInsideLB || isOutsideLB) {
        const biteX = targetSide === 'left' ? def.x - 10 : def.x + 10;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: biteX, y: def.y + 42 },
          ],
          Math.min(1, t * 1.4)
        );
      }
      // Safeties step down on the run-action fake
      if (def.id === 'FS' || def.id === 'SS') {
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + (targetSide === 'left' ? -8 : 8), y: def.y + 32 },
          ],
          Math.min(1, t * 1.1)
        );
      }
      // Defensive Linemen rush passer but are stopped by offensive line pocket at LOS
      if (isDL) {
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: 370 }, // held at bay by pass protection pocket
          ],
          Math.min(1, t * 1.1)
        );
      }
      // Corners bail/squat in coverage
      if (def.id === 'LCB' || def.id === 'RCB') {
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + (def.id === 'LCB' ? -12 : 12), y: def.y - 10 },
          ],
          Math.min(1, t * 0.9)
        );
      }
    }

    // 3. POWER (34 / 23 Power): Pulling Guard Kickout & Lead Back ISO Block
    if (isPower) {
      const isEdgeDefender = targetSide === 'left'
        ? (def.id === 'WDE' || !!def.weakPitchKey || def.id === 'WOLB')
        : (def.id === 'SDE' || !!def.isPitchKey || def.id === 'SOLB');

      if (isEdgeDefender) {
        // Edge defender gets kicked out wide by pulling guard
        const kickX = targetSide === 'left' ? -38 : 38;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + kickX * 0.25, y: def.y + 8 },
            { x: def.x + kickX, y: def.y + 14 },
          ],
          Math.min(1, t * 1.4)
        );
      }

      // Playside Inside Linebacker meets Lead Back (LH/RH) ISO block in hole
      const isPlaysideILB = isInsideLB && (targetSide === 'left' ? def.x <= 500 : def.x >= 500);
      if (isPlaysideILB) {
        // Lead back collides with LB in B/C gap, sealing him inside away from runner
        const sealInsideX = targetSide === 'left' ? 26 : -26;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: def.y + 16 },
            { x: def.x + sealInsideX, y: def.y + 14 }, // sealed inside by Lead ISO block
          ],
          Math.min(1, t * 1.3)
        );
      }

      // Defensive Linemen are double-teamed / washed down by OL, held at LOS
      if (isDL) {
        const washX = targetSide === 'left' ? 24 : -24;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + washX * 0.4, y: 350 },
            { x: def.x + washX, y: 352 }, // held at line of scrimmage, washed inside
          ],
          Math.min(1, t * 1.2)
        );
      }
    }

    // 4. COUNTER TRAP (30 / 39 Trap): Pulling Guard Trap Block & Center Back-Block
    if (isTrap) {
      const isCenterFrontDefender =
        def.id === 'NT' ||
        (isDL && Math.abs(def.x - 500) <= 28);

      if (isCenterFrontDefender) {
        // Center seals defender to backside, pinned on backside of center
        const backsideX = targetSide === 'left' ? 28 : -28;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + backsideX * 0.4, y: def.y + 4 },
            { x: def.x + backsideX, y: 350 }, // sealed on backside
          ],
          Math.min(1, t * 1.5)
        );
      }

      const isTrapTarget = targetSide === 'left'
        ? (def.id === 'LDT' || def.id === 'WDT' || (isDL && def.x < 480 && def.x > 380 && !isCenterFrontDefender))
        : (def.id === 'RDT' || def.id === 'SDT' || (isDL && def.x > 520 && def.x < 620 && !isCenterFrontDefender));

      if (isTrapTarget) {
        // Penetrates 1 step, then trapped & kicked out wide by pulling guard
        const kickX = targetSide === 'left' ? -36 : 36;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: def.y + 18 }, // penetrates into backfield
            { x: def.x + kickX, y: def.y + 22 }, // trapped & kicked out wide by pulling guard
          ],
          Math.min(1, t * 1.4)
        );
      }

      // Linebackers false-step with fake sweep toward perimeter
      if (isInsideLB || isOutsideLB) {
        const flowX = targetSide === 'left' ? -24 : 24;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + flowX, y: def.y + 6 }, // flowed out of position
          ],
          Math.min(1, t * 1.2)
        );
      }
    }

    // 5. VEER PLAYS (Inside Veer 22/31 & Outside Veer 18/19): Blocking Reactions & Gap Integrity
    if (isDL) {
      // Nose Tackle / Head-up Center: Center & Backside Guard Ace Scoop block
      // Sealed to backside, NEVER crosses LOS into backfield!
      const isHeadUpOrBackside = targetSide === 'left' ? def.x >= 490 : def.x <= 510;
      if (def.id === 'NT' || isHeadUpOrBackside) {
        const sealBacksideX = targetSide === 'left' ? 26 : -26;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x + sealBacksideX * 0.5, y: def.y + 4 },
            { x: def.x + sealBacksideX, y: 352 }, // sealed to backside at line
          ],
          Math.min(1, t * 1.3)
        );
      }

      // Playside Interior DL (if not unblocked read key): Down-blocked by playside Guard/Tackle
      // Sealed inside toward center, opening B-gap / C-gap!
      const sealInsideX = targetSide === 'left' ? 32 : -32;
      return interpolatePoints(
        [
          { x: def.x, y: def.y },
          { x: def.x + sealInsideX * 0.4, y: def.y + 6 },
          { x: def.x + sealInsideX, y: 352 }, // sealed inside, held at line
        ],
        Math.min(1, t * 1.3)
      );
    }

    if (isInsideLB) {
      // Playside Inside LB (Mike/SILB): Met at second level by climbing Tackle veer-block!
      // Sealed inside away from dive track, establishing the running lane
      const isPlaysideILB = targetSide === 'left' ? def.x <= 510 : def.x >= 490;
      if (isPlaysideILB) {
        const washInsideX = targetSide === 'left' ? 28 : -28;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: def.y + 16 }, // steps to fill
            { x: def.x + washInsideX, y: def.y + 12 }, // met and sealed inside by climbing Tackle!
          ],
          Math.min(1, t * 1.3)
        );
      }

      // Backside Inside LB: Scrapes across formation over top of center scoop
      const flowX = targetSide === 'left' ? -22 : 22;
      return interpolatePoints(
        [
          { x: def.x, y: def.y },
          { x: def.x + flowX * 0.5, y: def.y + 6 },
          { x: def.x + flowX, y: def.y + 10 },
        ],
        Math.min(1, t * 1.1)
      );
    }

    if (isOutsideLB) {
      // Outside LB: forced wide by tight end / slot block, or flowing to perimeter pitch
      const flowOutX = targetSide === 'left' ? -26 : 26;
      return interpolatePoints(
        [
          { x: def.x, y: def.y },
          { x: def.x + flowOutX * 0.4, y: def.y + 4 },
          { x: def.x + flowOutX, y: def.y + 8 },
        ],
        Math.min(1, t * 1.2)
      );
    }

    if (isDB) {
      // Defensive Backs: Run support / contain assignments
      // Playside Corner: steps up to contain pitch along sideline
      const isPlaysideCB = (targetSide === 'left' && def.id === 'LCB') || (targetSide !== 'left' && def.id === 'RCB');
      if (isPlaysideCB) {
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: def.y + 35 }, // steps up to perimeter contain
          ],
          Math.min(1, t * 1.1)
        );
      }

      // Backside Corner: bails deep or stalks backside receiver
      const isBacksideCB = (targetSide === 'left' && def.id === 'RCB') || (targetSide !== 'left' && def.id === 'LCB');
      if (isBacksideCB) {
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: def.y - 12 }, // bails deep with backside receiver
          ],
          Math.min(1, t * 0.8)
        );
      }

      // Free Safety (FS): Reads mesh from deep centerfield, fills downhill into alley
      if (def.id === 'FS') {
        const fillX = targetSide === 'left' ? 440 : 560;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: def.x, y: def.y + 8 }, // read steps at snap
            { x: fillX, y: 240 }, // fills downhill into alley
          ],
          Math.min(1, t * 1.0)
        );
      }

      // Strong Safety (SS): Steps down into alley to support perimeter option
      if (def.id === 'SS') {
        const fillX = targetSide === 'left' ? 380 : 660;
        return interpolatePoints(
          [
            { x: def.x, y: def.y },
            { x: fillX, y: 255 }, // rolls into alley
          ],
          Math.min(1, t * 1.0)
        );
      }
    }

    // Default defensive assignment: step up into assigned gap and hold leverage
    const driftX = targetSide === 'left' ? -8 * t : 8 * t;
    const driftY = 6 * t;
    return { x: def.x + driftX, y: Math.min(360, def.y + driftY) };
  };

  // Compute live football position
  const getFootballPosition = (): Point => {
    if (progress <= 0.04) {
      const snapT = progress / 0.04;
      return interpolatePoints([currentOffensivePositions.C, currentOffensivePositions.QB], snapT);
    }

    // Power Pass (Play-Action Flood): Fake to back, gather drop, deliver pass to selected receiver
    if (isPowerPass) {
      let targetPlayerId = targetSide === 'left' ? 'XTE' : 'YTE';
      let releaseProgress = 0.42;
      let catchProgress = 0.76;
      let loftAmount = 14;

      if (powerPassReceiver === 'arrow') {
        // Quick 1st read to flat: release at 0.38, arrives 0.64
        targetPlayerId = targetSide === 'left' ? 'RH' : 'LH';
        releaseProgress = 0.38;
        catchProgress = 0.64;
        loftAmount = 10;
      } else if (powerPassReceiver === 'corner') {
        // Deep 3rd read post-corner: release at 0.46, arrives 0.82
        targetPlayerId = 'W';
        releaseProgress = 0.46;
        catchProgress = 0.82;
        loftAmount = 26;
      } else if (powerPassReceiver === 'checkdown') {
        // Backside flat safety valve: release at 0.48, arrives 0.78
        targetPlayerId = targetSide === 'left' ? 'LH' : 'RH';
        releaseProgress = 0.48;
        catchProgress = 0.78;
        loftAmount = 12;
      } else if (powerPassReceiver === 'post') {
        // Backside deep post: release at 0.46, arrives 0.80
        targetPlayerId = targetSide === 'left' ? 'YTE' : 'XTE';
        releaseProgress = 0.46;
        catchProgress = 0.80;
        loftAmount = 22;
      } else {
        // 'whip' (default 2nd read): release at 0.42, arrives 0.76
        targetPlayerId = targetSide === 'left' ? 'XTE' : 'YTE';
        releaseProgress = 0.42;
        catchProgress = 0.76;
        loftAmount = 14;
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

        {/* Center Backside Seal Annotation on Trap */}
        {isTrap && currentOffensivePositions.C && (
          <g opacity="0.95">
            <text
              x={currentOffensivePositions.C.x}
              y={currentOffensivePositions.C.y - 18}
              textAnchor="middle"
              fill="#FBBF24"
              fontSize="9.5"
              fontWeight="700"
              className="font-mono-tabular"
            >
              CENTER BACKSIDE SEAL
            </text>
          </g>
        )}

        {/* Pulling Guard Label Annotation on Power and Trap */}
        {(isPower || isTrap) && (
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
                  {isTrap ? 'PULL & TRAP KICKOUT' : 'PULLING GUARD'}
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
          const isTrapKickout = isTrap && (targetSide === 'left' ? (def.id === 'LDT' || def.id === 'WDT' || def.id === 'NT' || !!def.weakDiveKey) : (def.id === 'RDT' || def.id === 'SDT' || def.id === 'NT' || !!def.isDiveKey));
          const isPowerKickout = isPower && (targetSide === 'left' ? (def.id === 'WDE' || !!def.weakPitchKey) : (def.id === 'SDE' || !!def.isPitchKey));
          const isPowerIso = isPower && (def.id === 'MLB' || def.id === 'SLB' || def.id === 'SILB');

          const hasRedKey = isInsideVeerDive || isOutsideVeerDive || isPowerKickout || isTrapKickout;
          const hasTealKey = isInsideVeerPitch || isOutsideVeerPitch || isPowerIso;

          let keyText = '';
          if (isInsideVeerDive) keyText = '#1 DIVE KEY (DT)';
          else if (isOutsideVeerDive) keyText = '#1 DIVE KEY (EMLOS)';
          else if (isInsideVeerPitch) keyText = '#2 PITCH KEY (EMLOS)';
          else if (isOutsideVeerPitch) keyText = '#2 PITCH KEY (CORNER)';
          else if (isTrapKickout) keyText = targetSide === 'left' ? 'RG TRAP TARGET' : 'LG TRAP TARGET';
          else if (isPowerKickout) keyText = targetSide === 'left' ? 'RG KICKOUT TARGET' : 'LG KICKOUT TARGET';
          else if (isPowerIso) keyText = targetSide === 'left' ? 'LH LEAD ISO TARGET' : 'RH LEAD ISO TARGET';
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

              {/* Highlight Power Pass Targets & Selected Receiver Option */}
              {isPowerPass && (
                <>
                  {/* Read 1: Playside RB Arrow */}
                  {((targetSide === 'left' && pid === 'RH') || (targetSide !== 'left' && pid === 'LH')) && (
                    <>
                      <circle
                        r={isFinalCarrier ? 26 : 22}
                        fill="#14B8A6"
                        fillOpacity={isFinalCarrier ? 0.35 : 0.15}
                        stroke={isFinalCarrier ? '#5EEAD4' : '#14B8A6'}
                        strokeWidth={isFinalCarrier ? 2.5 : 1.5}
                        strokeDasharray={isFinalCarrier ? '5 2.5' : '4 2'}
                      />
                      <text
                        x="0"
                        y="-26"
                        textAnchor="middle"
                        fill={isFinalCarrier ? '#99F6E4' : '#5EEAD4'}
                        fontSize={isFinalCarrier ? '10' : '9'}
                        fontWeight="800"
                        className="font-mono-tabular"
                      >
                        {isFinalCarrier ? '★ TARGET: 1) RB ARROW' : '1: RB ARROW'}
                      </text>
                    </>
                  )}

                  {/* Read 2: Playside TE/SE Whip Out */}
                  {((targetSide === 'left' && pid === 'XTE') || (targetSide !== 'left' && pid === 'YTE')) && (
                    <>
                      <circle
                        r={isFinalCarrier ? 26 : 22}
                        fill="#A855F7"
                        fillOpacity={isFinalCarrier ? 0.35 : 0.15}
                        stroke={isFinalCarrier ? '#E9D5FF' : '#A855F7'}
                        strokeWidth={isFinalCarrier ? 2.5 : 1.5}
                        strokeDasharray={isFinalCarrier ? '5 2.5' : '4 2'}
                      />
                      <text
                        x="0"
                        y="-26"
                        textAnchor="middle"
                        fill={isFinalCarrier ? '#F5D0FE' : '#E9D5FF'}
                        fontSize={isFinalCarrier ? '10' : '9'}
                        fontWeight="800"
                        className="font-mono-tabular"
                      >
                        {isFinalCarrier ? `★ TARGET: 2) ${targetSide === 'left' ? 'X' : 'Y'} WHIP` : `2: ${targetSide === 'left' ? 'X' : 'Y'} WHIP`}
                      </text>
                    </>
                  )}

                  {/* Read 3: Z Post Corner */}
                  {pid === 'W' && (
                    <>
                      <circle
                        r={isFinalCarrier ? 26 : 22}
                        fill="#F59E0B"
                        fillOpacity={isFinalCarrier ? 0.35 : 0.12}
                        stroke={isFinalCarrier ? '#FDE68A' : '#F59E0B'}
                        strokeWidth={isFinalCarrier ? 2.5 : 1.5}
                        strokeDasharray={isFinalCarrier ? '5 2.5' : '4 2'}
                      />
                      <text
                        x="0"
                        y="-26"
                        textAnchor="middle"
                        fill={isFinalCarrier ? '#FEF08A' : '#FCD34D'}
                        fontSize={isFinalCarrier ? '10' : '9'}
                        fontWeight="800"
                        className="font-mono-tabular"
                      >
                        {isFinalCarrier ? '★ TARGET: 3) Z CORNER' : '3: Z CORNER'}
                      </text>
                    </>
                  )}

                  {/* Checkdown: Backside RB Flat */}
                  {((targetSide === 'left' && pid === 'LH') || (targetSide !== 'left' && pid === 'RH')) && (
                    <>
                      <circle
                        r={isFinalCarrier ? 26 : 20}
                        fill="#3B82F6"
                        fillOpacity={isFinalCarrier ? 0.35 : 0.12}
                        stroke={isFinalCarrier ? '#BFDBFE' : '#3B82F6'}
                        strokeWidth={isFinalCarrier ? 2.5 : 1.2}
                        strokeDasharray={isFinalCarrier ? '5 2.5' : '3 2'}
                      />
                      <text
                        x="0"
                        y="-26"
                        textAnchor="middle"
                        fill={isFinalCarrier ? '#BFDBFE' : '#93C5FD'}
                        fontSize={isFinalCarrier ? '10' : '8.5'}
                        fontWeight="800"
                        className="font-mono-tabular"
                      >
                        {isFinalCarrier ? '★ TARGET: CHECKDOWN' : 'CHECKDOWN'}
                      </text>
                    </>
                  )}

                  {/* Backside: Isolated Post */}
                  {((targetSide === 'left' && pid === 'YTE') || (targetSide !== 'left' && pid === 'XTE')) && (
                    <>
                      <circle
                        r={isFinalCarrier ? 26 : 20}
                        fill="#F43F5E"
                        fillOpacity={isFinalCarrier ? 0.35 : 0.12}
                        stroke={isFinalCarrier ? '#FECDD3' : '#F43F5E'}
                        strokeWidth={isFinalCarrier ? 2.5 : 1.2}
                        strokeDasharray={isFinalCarrier ? '5 2.5' : '3 2'}
                      />
                      <text
                        x="0"
                        y="-26"
                        textAnchor="middle"
                        fill={isFinalCarrier ? '#FECDD3' : '#FDA4AF'}
                        fontSize={isFinalCarrier ? '10' : '8.5'}
                        fontWeight="800"
                        className="font-mono-tabular"
                      >
                        {isFinalCarrier ? '★ TARGET: BACKSIDE POST' : 'POST'}
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
