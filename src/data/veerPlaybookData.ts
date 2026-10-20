export type DefensiveFrontId = '5-3' | '4-4' | '6-2' | '5-2' | '4-3' | '3-4';
export type DiveKeyBehavior = 'crash' | 'squeeze' | 'upfield'; // 'upfield' is Bull Rush
export type PitchKeyBehavior = 'commit_qb' | 'feather_pitch';
export type EleventhPlayerMode = 'wide_z' | 'wing_z';
export type XPlayerMode = 'tight_x' | 'wide_x';

export type OffensiveConcept = 'inside_veer' | 'outside_veer' | 'trap' | 'counter' | 'power' | 'flood';
export type TargetSide = 'right' | 'left';
export type ZAlignmentSide = 'right' | 'left';
export type ZAlignmentType = 'wide' | 'wing';
export type YAlignmentSide = 'right' | 'left';
export type YAlignmentType = 'tight' | 'flex';
export type FloodAction = 'none' | 'fake_right' | 'fake_left';

export interface Point {
  x: number; // Field coordinates: 0 to 1000 (500 is ball X)
  y: number; // Field coordinates: 0 to 620 (390 is Line of Scrimmage Y, offense moves UP towards y < 390)
}

export interface PlayerPositionRule {
  id: string;
  label: string;
  fullName: string;
  group: 'OL' | 'TE' | 'BACK' | 'WR';
  split: string;
  stance: string;
  aimingPoint: string;
  footwork: string;
  assignmentsByFront: Record<DefensiveFrontId, string>;
  coachingCue: string;
  commonErrorsFix: string;
}

export interface OffensivePathDef {
  playerId: string;
  roleType: 'dive' | 'qb' | 'pitch' | 'block_down' | 'block_veer' | 'block_scoop' | 'block_pull' | 'route_pass' | 'fake';
  waypoints: Point[];
  blockTargetDefId?: string;
}

export interface PlayDefinition {
  id: string;
  concept?: OffensiveConcept;
  targetSide?: TargetSide;
  code: string;
  name: string;
  subtitle: string;
  seriesTag: string;
  playType: 'Triple Option' | 'Inside Read' | 'Misdirection Option' | 'Misdirection Trap' | 'Power' | 'Play-Action Pass';
  targetGap: string;
  primaryReadLabel: string;
  secondaryReadLabel: string;
  summary: string;
  whenToCall: string;
  qbDecisionMatrix: {
    crashPull: string;
    squeezeGive: string;
    pitchPhase: string;
  };
  coachingPhases: {
    phase: number;
    timeRange: [number, number];
    title: string;
    detail: string;
  }[];
  positionRules: Record<string, PlayerPositionRule>;
  getOffensivePaths: (
    front: DefensiveFrontId,
    diveBehavior: DiveKeyBehavior,
    pitchBehavior: PitchKeyBehavior,
    eleventhMode: EleventhPlayerMode,
    xMode?: XPlayerMode,
    zSide?: ZAlignmentSide,
    targetSide?: TargetSide,
    ySide?: YAlignmentSide,
    yType?: YAlignmentType,
    floodFake?: FloodAction
  ) => {
    paths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }>;
    ballCarrierSequence: {
      diveGive: boolean;
      qbKeep: boolean;
      pitchTriggered: boolean;
      finalCarrier: 'LH' | 'RH' | 'QB' | 'YTE' | 'XTE';
      outcomeLabel: string;
      expectedYards: string;
      coachingExplanation: string;
    };
  };
}

export interface DefensivePlayerNode {
  id: string;
  label: string;
  name: string;
  x: number;
  y: number;
  technique: string;
  gap?: string;
  isDiveKey?: boolean;
  isPitchKey?: boolean;
  weakDiveKey?: boolean;
  weakPitchKey?: boolean;
}

export interface DefensiveFrontConfig {
  id: DefensiveFrontId;
  name: string;
  shortLabel: string;
  frequencyInGame: string;
  boxCount: string;
  strengths: string;
  veerVulnerability: string;
  lineCallRule: string;
  players: DefensivePlayerNode[];
}

export interface PracticeDrill {
  id: string;
  title: string;
  durationMin: number;
  playersInvolved: string;
  equipment: string;
  objective: string;
  setupSteps: string[];
  coachingPoints: string[];
  levelProgression: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}

// Compute official Dynamic Play Call name:
// Based on:
// - X Alignment: wide or tight (denoted by "Double Tight" or "Wide")
// - Y Alignment: Right or Left side (sets the strength), plus optional Flex
// - Z Alignment: Right or Left, if wing it would be Wing Right/Left
// - Flood Action: where we're running or faking the flood to (e.g. Fake 36 Flood, Fake 35 Flood, or 36/35 Flood)
// - Number: depends on target side (Right = 42/46/32/24/36, Left = 41/45/31/23/35)
// - Concept: Inside Veer, Outside Veer, Counter, Power, Flood
export function formatOffensivePlayCall(
  concept: OffensiveConcept,
  targetSide: TargetSide = 'right',
  xMode: XPlayerMode = 'tight_x',
  ySide: YAlignmentSide = 'right',
  yType: YAlignmentType = 'tight',
  zSide: ZAlignmentSide = 'right',
  zType: ZAlignmentType = 'wide',
  floodFake: FloodAction = 'none'
): {
  fullName: string;
  formation: string;
  xDesc: string;
  yDesc: string;
  zDesc: string;
  floodFakeDesc: string;
  numberCode: string;
  conceptName: string;
  fullPlayCall: string;
} {
  // 1. Backside TE: Wide or Tight
  // Playside TE: no call, always end man on the LOS
  const backsideTEDesc = xMode === 'tight_x' ? 'Tight' : 'Wide';

  // 2. Z Alignment: Right or Left defaults wide 1 yard off LOS, if wing it's Wing Right/Left
  const zDesc = zType === 'wing'
    ? (zSide === 'right' ? 'Wing Right' : 'Wing Left')
    : (zSide === 'right' ? 'Right' : 'Left');

  // 3. Number & Concept: 22/31 Veer (Playside OG/OT Backside Hip), 24/33 Veer (B-Gap), 20/30 Trap, 34/23 Power
  let numberCode = '';
  let conceptName = '';
  if (concept === 'inside_veer') {
    numberCode = targetSide === 'right' ? '22' : '31';
    conceptName = 'Veer';
  } else if (concept === 'outside_veer') {
    numberCode = targetSide === 'right' ? '24' : '33';
    conceptName = 'Veer';
  } else if (concept === 'trap' || (concept as string) === 'counter') {
    numberCode = targetSide === 'right' ? '20' : '30';
    conceptName = 'Trap';
  } else if (concept === 'power') {
    numberCode = targetSide === 'right' ? '34' : '23';
    conceptName = 'Power';
  } else {
    // Flood
    numberCode = targetSide === 'right' ? '36' : '35';
    conceptName = 'Flood';
  }

  // 4. Flood Action / Fake: where we're faking the flood to on run plays
  let floodFakeDesc = '';
  if (concept !== 'flood') {
    if (floodFake === 'fake_right') {
      floodFakeDesc = 'Fake 36 Flood';
    } else if (floodFake === 'fake_left') {
      floodFakeDesc = 'Fake 35 Flood';
    }
  }

  // Combine into official spoken play call:
  // e.g. "Wide Wing Right 42 Veer"
  const parts = [
    backsideTEDesc,
    zDesc,
    floodFakeDesc,
    numberCode,
    conceptName,
  ].filter(Boolean);

  const fullPlayCall = parts.join(' ');

  return {
    fullName: fullPlayCall,
    formation: backsideTEDesc,
    xDesc: backsideTEDesc,
    yDesc: 'Attached to LOS (Playside TE — No Call)',
    zDesc,
    floodFakeDesc,
    numberCode,
    conceptName,
    fullPlayCall,
  };
}

// Base offensive coordinates on a 1000x620 tactical canvas
// Line of scrimmage is Y = 390. Ball is at X = 500, Y = 390.
// 3-Foot OL splits in Veer: 48px (~3 feet scaled for visual clarity)
export function getBaseOffensiveAlignment(
  eleventhMode: EleventhPlayerMode = 'wide_z',
  xMode: XPlayerMode = 'tight_x',
  zSide: ZAlignmentSide = 'right',
  ySide: YAlignmentSide = 'right',
  _yType: YAlignmentType = 'tight'
): Record<string, { x: number; y: number; label: string; name: string; group: 'OL' | 'TE' | 'BACK' | 'WR'; onLOS?: boolean }> {
  // Y Tight End: Y WILL NEVER BE OUT WIDE.
  // Y is always attached to the Line of Scrimmage (LOS at y = 394),
  // adjacent to the Tackle at the standard 3-foot split (48px).
  let yPoint: { x: number; y: number; label: string; name: string; group: 'TE'; onLOS: boolean };
  if (ySide === 'right') {
    yPoint = {
      x: 644, // Attached directly to Right Tackle (at 596) with 3-foot split
      y: 394, // Attached ON the Line of Scrimmage (LOS)
      label: 'Y',
      name: 'Y (Tight End — Attached to LOS)',
      group: 'TE',
      onLOS: true,
    };
  } else {
    yPoint = {
      x: 356, // Attached directly to Left Tackle (at 404) with 3-foot split
      y: 394, // Attached ON the Line of Scrimmage (LOS)
      label: 'Y',
      name: 'Y (Tight End — Attached to LOS)',
      group: 'TE',
      onLOS: true,
    };
  }

  // X positioning (opposite Y if tight, or split wide)
  // Tight X is attached to the LOS (y = 394). Wide X is on the LOS as a Split End (y = 394).
  let xPoint: { x: number; y: number; label: string; name: string; group: 'WR' | 'TE'; onLOS: boolean };
  if (ySide === 'right') {
    if (xMode === 'tight_x') {
      xPoint = { x: 356, y: 394, label: 'X', name: 'Tight X (Tight End — Attached to LOS)', group: 'TE', onLOS: true };
    } else {
      const xCoord = zSide === 'left' && eleventhMode === 'wide_z' ? 125 : 175;
      xPoint = { x: xCoord, y: 394, label: 'X', name: 'Wide X (Split End — On LOS)', group: 'WR', onLOS: true };
    }
  } else {
    // Y is on Left
    if (xMode === 'tight_x') {
      xPoint = { x: 644, y: 394, label: 'X', name: 'Tight X (Tight End — Attached to LOS)', group: 'TE', onLOS: true };
    } else {
      const xCoord = zSide === 'right' && eleventhMode === 'wide_z' ? 875 : 825;
      xPoint = { x: xCoord, y: 394, label: 'X', name: 'Wide X (Split End — On LOS)', group: 'WR', onLOS: true };
    }
  }

  // Z Flanker / Wing positioning:
  // If Z is in a wing, he is OFF the Line of Scrimmage (in the backfield at y = 418, 1 yd deep x 1 yd outside)
  // while Y is STILL attached to the Line of Scrimmage (at y = 394).
  let zPoint: { x: number; y: number; label: string; name: string; group: 'WR'; onLOS: boolean };
  if (zSide === 'right') {
    if (eleventhMode === 'wing_z') {
      // Wing Z on right: 1 yd outside attached YTE and 1 yd OFF the Line of Scrimmage in backfield
      const wingX = ySide === 'right' ? 688 : 640;
      zPoint = {
        x: wingX,
        y: 418, // OFF the Line of Scrimmage (in the backfield as a wingback)
        label: 'Z',
        name: 'Wing Z (Right — Off LOS, Wingback)',
        group: 'WR',
        onLOS: false,
      };
    } else {
      // Wide Z on right: split out wide as a flanker, off the LOS
      const wideX = ySide === 'left' && xMode === 'wide_x' ? 815 : 825;
      zPoint = {
        x: wideX,
        y: 416, // Off LOS as a flanker
        label: 'Z',
        name: 'Wide Z (Flanker Right — Off LOS)',
        group: 'WR',
        onLOS: false,
      };
    }
  } else {
    // Z is Left
    if (eleventhMode === 'wing_z') {
      // Wing Z on left: 1 yd outside attached YTE (if Y is left) or outside LT, 1 yd OFF the Line of Scrimmage
      const wingX = ySide === 'left' ? 312 : 360;
      zPoint = {
        x: wingX,
        y: 418, // OFF the Line of Scrimmage (in the backfield as a wingback)
        label: 'Z',
        name: 'Wing Z (Left — Off LOS, Wingback)',
        group: 'WR',
        onLOS: false,
      };
    } else {
      // Wide Z on left: split out wide as a flanker, off the LOS
      const wideX = ySide === 'right' && xMode === 'wide_x' ? 185 : 175;
      zPoint = {
        x: wideX,
        y: 416, // Off LOS as a flanker
        label: 'Z',
        name: 'Wide Z (Flanker Left — Off LOS)',
        group: 'WR',
        onLOS: false,
      };
    }
  }

  return {
    XTE: xPoint,
    LT: { x: 404, y: 392, label: 'LT', name: 'Left Tackle', group: 'OL' },
    LG: { x: 452, y: 392, label: 'LG', name: 'Left Guard', group: 'OL' },
    C: { x: 500, y: 390, label: 'C', name: 'Center', group: 'OL' },
    RG: { x: 548, y: 392, label: 'RG', name: 'Right Guard', group: 'OL' },
    RT: { x: 596, y: 392, label: 'RT', name: 'Right Tackle', group: 'OL' },
    YTE: yPoint,
    QB: { x: 500, y: 432, label: '1', name: '1 (Quarterback)', group: 'BACK' },
    LH: { x: 446, y: 496, label: '3', name: '3 (Left Halfback)', group: 'BACK' },
    RH: { x: 554, y: 496, label: '2', name: '2 (Right Halfback)', group: 'BACK' },
    W: zPoint,
  };
}

export const DEFENSIVE_FRONTS: Record<DefensiveFrontId, DefensiveFrontConfig> = {
  '5-3': {
    id: '5-3',
    name: '5-3 Bear / 50 Front',
    shortLabel: '5-3 Bear',
    frequencyInGame: 'Common Matchup',
    boxCount: '8-Man Box',
    strengths: 'Covers Center and both Tackles head-up; clogs inside A-gaps against standard interior runs.',
    veerVulnerability: 'Leaves B-Gap bubbles open for Inside Veer; heavy down-blocks crush 4-tech on Outside Veer & Power.',
    lineCallRule: '"50 Odd — Ace Scoop Nose, Tackle Inside Veer to Mike"',
    players: [
      { id: 'WDE', label: 'DE', name: 'Weak Defensive End (7-Tech)', x: 348, y: 348, technique: '7-Tech', gap: 'C-Gap', weakPitchKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (4-Tech)', x: 404, y: 348, technique: '4-Tech', gap: 'B-Gap', weakDiveKey: true },
      { id: 'NT', label: 'NT', name: 'Nose Guard (0-Tech)', x: 500, y: 348, technique: '0-Tech', gap: 'A-Gap' },
      { id: 'SDT', label: '#1', name: 'Strong Tackle (4b/5-Tech — Inside Veer Key)', x: 598, y: 348, technique: '4b-Tech', gap: 'B-Gap', isDiveKey: true },
      { id: 'SDE', label: '#2', name: 'Strong End (7/9-Tech — Outside Veer Key / EMLOS)', x: 658, y: 348, technique: '9-Tech', gap: 'D-Gap', isPitchKey: true },
      { id: 'WLB', label: 'WLB', name: 'Will Linebacker', x: 424, y: 282, technique: '30-Align', gap: 'B-Gap' },
      { id: 'MLB', label: 'MLB', name: 'Mike Linebacker', x: 500, y: 278, technique: '00-Align', gap: 'A-Gap' },
      { id: 'SLB', label: 'SLB', name: 'Sam Linebacker', x: 582, y: 282, technique: '30-Align', gap: 'C-Gap' },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 265, y: 285, technique: 'Contain', gap: 'Deep 1/3' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 185, technique: 'Middle', gap: 'Deep Post' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 745, y: 285, technique: 'Contain', gap: 'Deep 1/3' },
    ],
  },
  '4-4': {
    id: '4-4',
    name: '4-4 Split Stack',
    shortLabel: '4-4 Stack',
    frequencyInGame: 'Base Even Front',
    boxCount: '8-Man Box',
    strengths: 'Four scraping linebackers and edge overhang players built to contain perimeter runs.',
    veerVulnerability: 'Playside double-team on 3-tech leaves edge defenders vulnerable to Outside Veer read and pulling Guard kickout on Power.',
    lineCallRule: '"Even 40 — Deuce Combo 3-Tech to Inside Backer, Read 5-Tech End"',
    players: [
      { id: 'WDE', label: 'DE', name: 'Weak End (5-Tech)', x: 392, y: 348, technique: '5-Tech', gap: 'C-Gap', weakDiveKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (2i-Tech)', x: 462, y: 348, technique: '2i-Tech', gap: 'A-Gap' },
      { id: 'SDT', label: 'DT', name: 'Strong Tackle (3-Tech)', x: 560, y: 348, technique: '3-Tech', gap: 'B-Gap' },
      { id: 'SDE', label: '#1', name: 'Strong End (5/6-Tech — Inside Veer Key / EMLOS)', x: 616, y: 348, technique: '5-Tech', gap: 'C-Gap', isDiveKey: true },
      { id: 'WOLB', label: 'OLB', name: 'Weak Outside LB', x: 332, y: 306, technique: 'Ghost 9', gap: 'D-Gap', weakPitchKey: true },
      { id: 'WILB', label: 'ILB', name: 'Weak Inside LB', x: 462, y: 282, technique: 'Stack', gap: 'A-Gap' },
      { id: 'SILB', label: 'ILB', name: 'Strong Inside LB', x: 548, y: 282, technique: 'Stack', gap: 'B-Gap' },
      { id: 'SOLB', label: '#2', name: 'Strong Outside LB (Pitch Key / Force)', x: 678, y: 306, technique: '9-Overhang', gap: 'D-Gap', isPitchKey: true },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 255, y: 270, technique: 'Third', gap: 'Deep 1/3' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 180, technique: 'Centerfield', gap: 'Deep Post' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 760, y: 270, technique: 'Third', gap: 'Deep 1/3' },
    ],
  },
  '4-3': {
    id: '4-3',
    name: '4-3 Base / Over Front',
    shortLabel: '4-3 Base',
    frequencyInGame: 'Traditional Even Front',
    boxCount: '7/8-Man Box',
    strengths: 'Balanced 4-man line with dedicated Mike LB to flow A-to-C gap; solid 3-technique interior penetration in strong B-gap.',
    veerVulnerability: 'Leaving 7-tech End (#1) unblocked allows RT to climb instantly up to Mike LB; isolates Sam LB in option pitch space.',
    lineCallRule: '"Over 43 — Deuce Combo 3-Tech with RG/RT to Mike, Read Strong End"',
    players: [
      { id: 'WDE', label: 'DE', name: 'Weak Defensive End (5-Tech)', x: 372, y: 348, technique: '5-Tech', gap: 'C-Gap', weakPitchKey: true },
      { id: 'WDT', label: '1T', name: 'Nose Tackle (1-Tech)', x: 476, y: 348, technique: '1-Tech', gap: 'A-Gap', weakDiveKey: true },
      { id: 'SDT', label: '3T', name: '3-Technique Tackle', x: 566, y: 348, technique: '3-Tech', gap: 'B-Gap' },
      { id: 'SDE', label: '#1', name: 'Strong End (7-Tech — Inside Veer Key / EMLOS)', x: 620, y: 348, technique: '7-Tech', gap: 'C-Gap', isDiveKey: true },
      { id: 'WLB', label: 'WLB', name: 'Will Linebacker', x: 416, y: 282, technique: '30-Tech', gap: 'B-Gap' },
      { id: 'MLB', label: 'MLB', name: 'Mike Linebacker', x: 504, y: 278, technique: '00-Tech', gap: 'A-Gap' },
      { id: 'SLB', label: '#2', name: 'Sam Linebacker (Pitch Key / Strong Force)', x: 672, y: 300, technique: '9-Overhang', gap: 'D-Gap', isPitchKey: true },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 255, y: 270, technique: 'Third', gap: 'Deep 1/3' },
      { id: 'SS', label: 'SS', name: 'Strong Safety (Sky Force)', x: 708, y: 235, technique: 'Sky', gap: 'Sky Force' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 495, y: 180, technique: 'Deep Middle', gap: 'Deep Post' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 765, y: 270, technique: 'Third', gap: 'Deep 1/3' },
    ],
  },
  '3-4': {
    id: '3-4',
    name: '3-4 Okie / Two-Gap Front',
    shortLabel: '3-4 Okie',
    frequencyInGame: 'Modern Base Front',
    boxCount: '7/8-Man Box',
    strengths: 'Two-gapping 0-tech Nose disrupts Center; four fast linebackers disguise edge blitzes and scrape to perimeter.',
    veerVulnerability: 'RT easily inside-veer releases to Strong Inside LB while SDE 4-tech is left unblocked for 1; OLB is caught in space by 2 on pitch.',
    lineCallRule: '"Okie 34 — Ace Scoop 0-Tech Nose, RT Inside Veer to Inside Backer"',
    players: [
      { id: 'WDE', label: 'DE', name: 'Weak Defensive End (4-Tech)', x: 404, y: 348, technique: '4-Tech', gap: 'B-Gap', weakDiveKey: true },
      { id: 'NT', label: 'NT', name: 'Nose Tackle (0-Tech)', x: 500, y: 348, technique: '0-Tech', gap: 'A-Gap' },
      { id: 'SDE', label: '#1', name: 'Strong End (4/5-Tech — Inside Veer Key)', x: 598, y: 348, technique: '4-Tech', gap: 'B-Gap', isDiveKey: true },
      { id: 'WOLB', label: 'OLB', name: 'Weak Outside LB (Rush)', x: 338, y: 325, technique: 'Ghost 9', gap: 'D-Gap', weakPitchKey: true },
      { id: 'WILB', label: 'ILB', name: 'Weak Inside LB', x: 455, y: 282, technique: 'Stack', gap: 'A-Gap' },
      { id: 'SILB', label: 'ILB', name: 'Strong Inside LB', x: 545, y: 282, technique: 'Stack', gap: 'B-Gap' },
      { id: 'SOLB', label: '#2', name: 'Strong Outside LB (Pitch Key / Force)', x: 674, y: 310, technique: '9-Overhang', gap: 'D-Gap', isPitchKey: true },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 255, y: 270, technique: 'Third', gap: 'Deep 1/3' },
      { id: 'SS', label: 'SS', name: 'Strong Safety (Cover 3/Sky)', x: 695, y: 230, technique: 'Sky', gap: 'Sky Force' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 180, technique: 'Deep Middle', gap: 'Deep Post' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 760, y: 270, technique: 'Third', gap: 'Deep 1/3' },
    ],
  },
  '6-2': {
    id: '6-2',
    name: '6-2 Wide Tackle',
    shortLabel: '6-2 Wide',
    frequencyInGame: 'Goal Line & Short Yardage',
    boxCount: '8-Man Heavy Line',
    strengths: 'Six linemen on the line of scrimmage crowding every interior gap to disrupt front timing.',
    veerVulnerability: 'Only two linebackers behind the wall. Once the Dive or QB clears the line or Y pops into the seam, the defense has no safety net.',
    lineCallRule: '"60 Heavy — Base Drive 1-Tech, Outside Release RT to Near LB"',
    players: [
      { id: 'WDE', label: 'DE', name: 'Weak End (9-Tech)', x: 338, y: 348, technique: '9-Tech', gap: 'D-Gap', weakPitchKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (4i-Tech)', x: 408, y: 348, technique: '4i-Tech', gap: 'B-Gap', weakDiveKey: true },
      { id: 'WNG', label: 'NG', name: 'Weak Nose (1-Tech)', x: 468, y: 348, technique: '1-Tech', gap: 'A-Gap' },
      { id: 'SNG', label: 'NG', name: 'Strong Nose (1-Tech)', x: 532, y: 348, technique: '1-Tech', gap: 'A-Gap' },
      { id: 'SDT', label: '#1', name: 'Strong Tackle (4-Tech — Inside Veer Key)', x: 598, y: 348, technique: '4-Tech', gap: 'B-Gap', isDiveKey: true },
      { id: 'SDE', label: '#2', name: 'Strong End (9-Tech — Outside Veer Key / EMLOS)', x: 664, y: 348, technique: '9-Tech', gap: 'D-Gap', isPitchKey: true },
      { id: 'WLB', label: 'WLB', name: 'Left Linebacker', x: 448, y: 278, technique: '30-Tech', gap: 'B-Gap' },
      { id: 'SLB', label: 'SLB', name: 'Right Linebacker', x: 552, y: 278, technique: '30-Tech', gap: 'B-Gap' },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 260, y: 265, technique: 'Half', gap: 'Deep 1/2' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 175, technique: 'Deep', gap: 'Deep Post' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 755, y: 265, technique: 'Half', gap: 'Deep 1/2' },
    ],
  },
  '5-2': {
    id: '5-2',
    name: '5-2 Gap-8 Monster',
    shortLabel: '5-2 Gap-8',
    frequencyInGame: 'Aggressive Pressure Package',
    boxCount: '8-Man Gap Shooters',
    strengths: 'Slants defensive linemen into designated gaps on the snap to disrupt slow-developing offenses.',
    veerVulnerability: 'Fast-hitting Veer mesh and Power kickout punish gap slanters before penetration can recover.',
    lineCallRule: '"Monster — Scoop Slanters, Tight End Arc Release to Safety"',
    players: [
      { id: 'WDE', label: 'DE', name: 'Weak End (6-Tech)', x: 356, y: 348, technique: '6-Tech', gap: 'C-Gap', weakPitchKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (3-Tech)', x: 422, y: 348, technique: '3-Tech', gap: 'B-Gap', weakDiveKey: true },
      { id: 'NT', label: 'NT', name: 'Nose Tackle (0-Tech)', x: 500, y: 348, technique: '0-Tech', gap: 'A-Gap' },
      { id: 'SDT', label: '#1', name: 'Strong Tackle (4-Tech — Inside Veer Key)', x: 592, y: 348, technique: '4-Tech', gap: 'B-Gap', isDiveKey: true },
      { id: 'SDE', label: '#2', name: 'Monster End (7-Tech — Outside Veer Key / EMLOS)', x: 646, y: 348, technique: '7-Tech', gap: 'C-Gap', isPitchKey: true },
      { id: 'WLB', label: 'WLB', name: 'Weak Inside LB', x: 452, y: 280, technique: '20-Tech', gap: 'A-Gap' },
      { id: 'SLB', label: 'SLB', name: 'Strong Inside LB', x: 548, y: 280, technique: '20-Tech', gap: 'A-Gap' },
      { id: 'MON', label: 'MON', name: 'Monster Back (Strong Overhang)', x: 694, y: 295, technique: 'Monster', gap: 'D-Gap' },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 265, y: 270, technique: 'Man/Third', gap: 'Deep 1/3' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 180, technique: 'Deep Middle', gap: 'Deep Post' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 765, y: 265, technique: 'Deep Third', gap: 'Deep 1/3' },
    ],
  },
};

export const INSIDE_VEER_POSITION_RULES: Record<string, PlayerPositionRule> = {
  C: {
    id: 'C',
    label: 'C',
    fullName: 'Center',
    group: 'OL',
    split: '0 ft (Ball Spot)',
    stance: 'Balanced 3-point stance, minimal weight on snapping hand, cleats parallel.',
    aimingPoint: 'Playside A-Gap / Playside Hip of 0-Tech Nose',
    footwork: 'Snap & step 6 inches playside (right foot) to reach or combo Nose Tackle.',
    assignmentsByFront: {
      '5-3': 'Ace Combo with RG on 0-Tech Nose to backside Will LB; prevent A-gap run-through.',
      '4-4': 'Reach-scoop weakside 2i-Tech DT; prevent A-gap run-through.',
      '4-3': 'Reach or scoop 1-Tech Nose with LG; prevent backside A-gap run-through.',
      '3-4': 'Ace Combo 0-Tech Nose with RG; control head-up two-gapper to backside ILB.',
      '6-2': 'Base drive playside 1-Tech Nose; seal backside A-gap.',
      '5-2': 'Scoop playside hip of slanting 0-Tech Nose with RG.',
    },
    coachingCue: 'Snap and step playside on the whistle — never step backwards.',
    commonErrorsFix: 'Raising hips before snapping exposes the A-gap. Keep pad level lower than the Nose Guard chin.',
  },
  RG: {
    id: 'RG',
    label: 'RG',
    fullName: 'Right Guard',
    group: 'OL',
    split: '3 ft from Center',
    stance: '3-point weight-forward Veer stance; inside foot slightly up.',
    aimingPoint: 'Inside number of playside DT or 0-Tech Nose hip',
    footwork: 'Inside power step; drive feet through the whistle.',
    assignmentsByFront: {
      '5-3': 'Combo 0-Tech Nose with Center to backside Will LB; ignore 4/5-Tech #1 Dive Key.',
      '4-4': 'Deuce combo 3-Tech with RT to inside linebacker.',
      '4-3': 'Deuce combo 3-Tech with RT to Mike LB.',
      '3-4': 'Combo 0-Tech Nose with Center to backside ILB.',
      '6-2': 'Base drive 1-Tech Nose vertical into the lap of the LB.',
      '5-2': 'Cover playside A-gap; overtake slanting Nose Tackle.',
    },
    coachingCue: 'Widen the interior running lane; stay on your track and ignore #1.',
    commonErrorsFix: 'Do not chase the 4-tech outward — that defender is #1 (the QB\'s unblocked Dive Read).',
  },
  RT: {
    id: 'RT',
    label: 'RT',
    fullName: 'Right Tackle',
    group: 'OL',
    split: '3 ft from Right Guard',
    stance: '3-point crouch, hands ready to strike second-level linebacker.',
    aimingPoint: 'Inside Veer Release to Linebacker',
    footwork: 'Violent 45° inside Veer step past #1 directly to second level.',
    assignmentsByFront: {
      '5-3': 'Inside Veer release past 4b-Tech (#1 Dive Key) directly to Mike LB.',
      '4-4': 'Inside Veer release past 5-Tech (#1 Dive Key) to Strong ILB.',
      '4-3': 'Inside release past 7-Tech End to Mike LB.',
      '3-4': 'Inside release past 4-Tech End to Strong ILB.',
      '6-2': 'Inside Veer release to Near Linebacker.',
      '5-2': 'Inside Veer release to Strong Inside LB.',
    },
    coachingCue: 'Ignore #1 Dive Key — rip past him without contact directly to the LB.',
    commonErrorsFix: 'Linemen instinctively block the defender aligned head-up. Drill "Ignore #1, hunt the Backer".',
  },
  YTE: {
    id: 'YTE',
    label: 'Y',
    fullName: 'Y (Tight End — Attached to LOS)',
    group: 'TE',
    split: '3 ft from Right Tackle (Attached on Line of Scrimmage — Y is never out wide)',
    stance: '3-point tight end stance, attached on the Line of Scrimmage with outside foot staggered back.',
    aimingPoint: 'Arc Release outside past edge to Safety',
    footwork: 'Arc release to perimeter; seal secondary force.',
    assignmentsByFront: {
      '5-3': 'Arc release outside to Free Safety / strong perimeter.',
      '4-4': 'Arc release to Strong Safety / alley force.',
      '4-3': 'Arc release to Sam LB / Strong Safety.',
      '3-4': 'Arc release to Strong OLB / Safety.',
      '6-2': 'Arc release to Near Safety on perimeter.',
      '5-2': 'Arc release to Monster back.',
    },
    coachingCue: 'Firmly attached to LOS — arc outside to seal the alley for the option pitch.',
    commonErrorsFix: 'Never block the Pitch Key (#2) by mistake — release cleanly to the secondary.',
  },
  LG: {
    id: 'LG',
    label: 'LG',
    fullName: 'Left Guard',
    group: 'OL',
    split: '3 ft from Center',
    stance: '3-point stance, balanced and ready to scoop playside.',
    aimingPoint: 'Backside A-gap cutoff',
    footwork: 'Deep flat scoop playside; cut off interior pursuit.',
    assignmentsByFront: {
      '5-3': 'Scoop backside A-gap; seal interior penetration.',
      '4-4': 'Scoop backside 2i-Tech DT; protect backside cutoff.',
      '4-3': 'Scoop backside 1-Tech Nose; anchor pocket.',
      '3-4': 'Cutoff 0-Tech Nose / scoop backside B-gap.',
      '6-2': 'Cut off backside 1-Tech Nose.',
      '5-2': 'Flat scoop A/B gap against slanter.',
    },
    coachingCue: 'Deep flat scoop playside — prevent backside pursuit.',
    commonErrorsFix: 'Do not allow the backside DT across your face.',
  },
  LT: {
    id: 'LT',
    label: 'LT',
    fullName: 'Left Tackle',
    group: 'OL',
    split: '3 ft from Left Guard',
    stance: '3-point stance.',
    aimingPoint: 'Backside B-Gap / Cutoff second level',
    footwork: 'Flat playside step, rip inside arm through backside DT.',
    assignmentsByFront: {
      '5-3': 'Cutoff backside 4-Tech DT; do not let him chase from behind.',
      '4-4': 'Scoop backside B-gap to Weak ILB.',
      '4-3': 'Cutoff backside 5-Tech End to Will LB.',
      '3-4': 'Cutoff backside 4-Tech End; climb to Weak ILB.',
      '6-2': 'Cutoff backside 4i-Tech DT.',
      '5-2': 'Scoop backside 3-Tech DT.',
    },
    coachingCue: 'No leakage from backside — sprint helmet across defender beltline.',
    commonErrorsFix: 'Standing straight up at the snap ruins leverage. Keep pad level low.',
  },
  XTE: {
    id: 'XTE',
    label: 'X',
    fullName: 'X (Tight End / Wide X Split End)',
    group: 'TE',
    split: 'Tight X: 3 ft from Left Tackle | Wide X: 8–10 yds split wide',
    stance: '3-point stance (Tight X) or 2-point stance (Wide X).',
    aimingPoint: 'Deep Middle Third Cutoff (Free Safety) or Stalk CB',
    footwork: 'Tight X: Sprint across field to cut off Free Safety. Wide X: Stalk playside Corner.',
    assignmentsByFront: {
      '5-3': 'Sprint across field to cut off Free Safety (if tight) or stalk CB (if wide).',
      '4-4': 'Sprint across field to cut off Free Safety (if tight) or stalk CB (if wide).',
      '4-3': 'Sprint across field to cut off Free Safety (if tight) or stalk CB (if wide).',
      '3-4': 'Sprint across field to cut off Free Safety (if tight) or stalk CB (if wide).',
      '6-2': 'Cut off Free Safety in deep middle (or stalk CB).',
      '5-2': 'Cut off Free Safety in deep middle (or stalk CB).',
    },
    coachingCue: 'Erase the touchdown-saving Safety or stalk the Cornerback in space.',
    commonErrorsFix: 'Sprint directly to your target without hesitating.',
  },
  QB: {
    id: 'QB',
    label: '1',
    fullName: '1 (Quarterback)',
    group: 'BACK',
    split: 'Under Center',
    stance: 'Knees bent, thumbs together, scanning keys pre-snap.',
    aimingPoint: 'Seam Mesh Point off Backside Hip of Playside OG ➔ Attack Pitch Key Inside Shoulder',
    footwork: '4:30 step, ride seam mesh with 2 (Playside Dive Back) off backside hip of playside OG; read #1 Dive Key; if pulling, attack Pitch Key inside shoulder.',
    assignmentsByFront: {
      '5-3': 'Mesh at seam reading #1 4b-Tech DT; if pulling, attack #2 9-Tech inside shoulder with 3 keeping 4x4 pitch spacing.',
      '4-4': 'Mesh at seam reading #1 5-Tech End; if pulling, attack #2 SOLB inside shoulder with 3 keeping 4x4 pitch spacing.',
      '4-3': 'Mesh at seam reading #1 Strong End; if pulling, attack #2 Sam LB inside shoulder with 3 keeping 4x4 pitch spacing.',
      '3-4': 'Mesh at seam reading #1 4-Tech End; if pulling, attack #2 Strong OLB inside shoulder with 3 keeping 4x4 pitch spacing.',
      '6-2': 'Mesh at seam reading #1 4-Tech DT; if pulling, attack #2 9-Tech inside shoulder with 3 keeping 4x4 pitch spacing.',
      '5-2': 'Mesh at seam reading #1 4-Tech DT; if pulling, attack #2 Monster inside shoulder with 3 keeping 4x4 pitch spacing.',
    },
    coachingCue: '1-Back (QB): Mesh at seam off backside hip of playside OG, read dive key; if pulling, attack pitch key inside shoulder on 22 Veer.',
    commonErrorsFix: 'Looking down at the football during the mesh ruins option reads.',
  },
  LH: {
    id: 'LH',
    label: '3',
    fullName: '3 (Left Halfback / Backside Pitch Back)',
    group: 'BACK',
    split: '4 yards deep, inside foot behind Left Guard outside heel',
    stance: '2-point stance, hands on knees, zero false steps.',
    aimingPoint: 'Track Outside Hip of Playside Tackle — 4x4-Yard Pitch Spacing',
    footwork: 'Crossover step right, track outside hip of playside tackle, keeping 4x4-yard pitch spacing outside.',
    assignmentsByFront: {
      '5-3': 'Backside pitch back: sprint across backfield tracking outside hip of RT into 4x4-yard pitch spacing outside #2.',
      '4-4': 'Backside pitch back: sprint across backfield tracking outside hip of RT into 4x4-yard pitch spacing outside #2 SOLB.',
      '4-3': 'Backside pitch back: sprint across backfield tracking outside hip of RT into 4x4-yard pitch spacing outside #2 Sam LB.',
      '3-4': 'Backside pitch back: sprint across backfield tracking outside hip of RT into 4x4-yard pitch spacing outside #2 Strong OLB.',
      '6-2': 'Backside pitch back: sprint across backfield tracking outside hip of RT into 4x4-yard pitch spacing outside #2 9-Tech End.',
      '5-2': 'Backside pitch back: sprint across backfield tracking outside hip of RT into 4x4-yard pitch spacing outside #2 Monster.',
    },
    coachingCue: 'Pitch Back (Backside): Track outside hip of playside tackle, keeping 4x4-yard pitch spacing on 22 Veer.',
    commonErrorsFix: 'Trailing too close behind the 1 on option pitches allows one defender to tackle both.',
  },
  RH: {
    id: 'RH',
    label: '2',
    fullName: '2 (Right Halfback / Playside Dive Back)',
    group: 'BACK',
    split: '4 yards deep, inside foot behind Right Guard outside heel',
    stance: '2-point stance facing straight ahead so defense gets no tip.',
    aimingPoint: 'Backside Hip of Playside OG & OT ➔ Seam Attack',
    footwork: 'Downhill track aiming directly at the backside hip of playside OG (RG) and playside OT (RT); soft pocket shelf; attack downhill through seam.',
    assignmentsByFront: {
      '5-3': 'Playside dive back: aim for backside hip of RG & RT, attack downhill through seam off down blocks; hammer through crease.',
      '4-4': 'Playside dive back: aim for backside hip of RG & RT, attack downhill through seam off down blocks; hammer through crease.',
      '4-3': 'Playside dive back: aim for backside hip of RG & RT, attack downhill through seam off down blocks; hammer through crease.',
      '3-4': 'Playside dive back: aim for backside hip of RG & RT, attack downhill through seam off down blocks; hammer through crease.',
      '6-2': 'Playside dive back: aim for backside hip of RG & RT, attack downhill through seam off down blocks; hammer through crease.',
      '5-2': 'Playside dive back: aim for backside hip of RG & RT, attack downhill through seam off down blocks; hammer through crease.',
    },
    coachingCue: 'Dive Back (Playside): Aim for backside hip of playside OG and OT, attacking downhill through the seam on 22 Veer.',
    commonErrorsFix: 'Drifting outside toward C-gap destroys blocking angles on the inside veer.',
  },
  W: {
    id: 'W',
    label: 'Z',
    fullName: 'Z Receiver (Wide Z / Wing Z — Off LOS)',
    group: 'WR',
    split: 'Wide Z: 8–10 yds split wide (Off LOS) | Wing Z: 1 yd outside x 1 yd deep behind attached YTE (Off LOS)',
    stance: '2-point athletic stance in backfield (Off the LOS). Y remains attached to the LOS.',
    aimingPoint: 'Stalk Playside Cornerback',
    footwork: 'Release from off the LOS to stalk/seal Playside Cornerback; never block read keys.',
    assignmentsByFront: {
      '5-3': 'Stalk playside cornerback; never block unblocked read keys.',
      '4-4': 'Crack Strong Safety or stalk cornerback.',
      '4-3': 'Stalk playside cornerback / seal perimeter.',
      '3-4': 'Stalk playside cornerback / seal perimeter.',
      '6-2': 'Stalk playside cornerback.',
      '5-2': 'Stalk playside cornerback.',
    },
    coachingCue: 'Off the Line of Scrimmage — stalk the Cornerback while Y remains attached on the LOS.',
    commonErrorsFix: 'Blocking the Pitch Key (#2) by mistake breaks the option read.',
  },
};

export const OUTSIDE_VEER_POSITION_RULES: Record<string, PlayerPositionRule> = {
  C: {
    ...INSIDE_VEER_POSITION_RULES.C,
    assignmentsByFront: {
      '5-3': 'Reach-scoop 0-Tech Nose; control interior A-gap.',
      '4-4': 'Reach weakside 2i-Tech DT; seal A-gap.',
      '4-3': 'Scoop 1-Tech Nose with LG.',
      '3-4': 'Ace scoop 0-Tech Nose.',
      '6-2': 'Base drive 1-Tech Nose.',
      '5-2': 'Scoop slanting Nose.',
    },
    coachingCue: 'Reach and scoop playside — prevent interior leakage.',
  },
  RG: {
    ...INSIDE_VEER_POSITION_RULES.RG,
    aimingPoint: 'Base Down-Block on DT',
    footwork: 'Inside power step; wash defender inside.',
    assignmentsByFront: {
      '5-3': 'Down block 0-Tech Nose or combo with Center.',
      '4-4': 'Base down block 3-Tech DT; wash inside.',
      '4-3': 'Base down block 3-Tech DT.',
      '3-4': 'Down block 0-Tech Nose with Center.',
      '6-2': 'Base drive 1-Tech Nose.',
      '5-2': 'Down block interior slanter.',
    },
    coachingCue: 'Wash the defensive tackle inside with a leveraged down block.',
  },
  RT: {
    ...INSIDE_VEER_POSITION_RULES.RT,
    aimingPoint: 'Heavy Down-Block on 4/5-Tech DT',
    footwork: 'Violent 45° inside down block; drive feet and wash defender inside.',
    assignmentsByFront: {
      '5-3': 'Heavy down block on 4b-Tech DT; wash inside.',
      '4-4': 'Heavy down block on 3-Tech DT; wash inside.',
      '4-3': 'Heavy down block on 3-Tech DT; wash inside.',
      '3-4': 'Heavy down block on 4-Tech End; wash inside.',
      '6-2': 'Heavy down block on 4-Tech DT; wash inside.',
      '5-2': 'Heavy down block on 4-Tech DT; wash inside.',
    },
    coachingCue: 'On Outside Veer, do not release to LB — wash the DT inside.',
    commonErrorsFix: 'Hesitating allows the DT to penetrate the C-gap track. Fire out flat.',
  },
  YTE: {
    ...INSIDE_VEER_POSITION_RULES.YTE,
    aimingPoint: 'Inside Veer Release past EMLOS to Linebacker',
    footwork: '45° inside release underneath the DE straight onto Sam/Mike Linebacker.',
    assignmentsByFront: {
      '5-3': 'Veer inside 9-Tech End to Mike/Sam Linebacker.',
      '4-4': 'Veer release inside to Strong Inside LB.',
      '4-3': 'Veer release inside to Sam Linebacker.',
      '3-4': 'Veer release inside to Strong Inside LB.',
      '6-2': 'Veer release inside to Right Linebacker.',
      '5-2': 'Veer release inside to Strong Inside LB.',
    },
    coachingCue: 'Leave the Defensive End unblocked — hunt the Linebacker.',
    commonErrorsFix: 'Chipping the EMLOS End ruins the 1 read timing. Rip directly to the second level.',
  },
  LG: {
    ...INSIDE_VEER_POSITION_RULES.LG,
    assignmentsByFront: {
      '5-3': 'Scoop backside A-gap.',
      '4-4': 'Scoop 2i-Tech DT.',
      '4-3': 'Scoop 1-Tech Nose.',
      '3-4': 'Cutoff 0-Tech Nose.',
      '6-2': 'Cut off backside 1-Tech.',
      '5-2': 'Flat scoop A/B gap.',
    },
  },
  LT: {
    ...INSIDE_VEER_POSITION_RULES.LT,
    assignmentsByFront: {
      '5-3': 'Cutoff backside 4-Tech DT.',
      '4-4': 'Scoop backside B-gap to Weak ILB.',
      '4-3': 'Cutoff backside 5-Tech End.',
      '3-4': 'Cutoff backside 4-Tech End.',
      '6-2': 'Cutoff backside 4i-Tech DT.',
      '5-2': 'Scoop backside 3-Tech DT.',
    },
  },
  XTE: {
    ...INSIDE_VEER_POSITION_RULES.XTE,
    assignmentsByFront: {
      '5-3': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '4-4': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '4-3': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '3-4': 'Sprint across field to cut off Free Safety (if tight) or stalk CB.',
      '6-2': 'Cut off Free Safety in deep middle.',
      '5-2': 'Cut off Free Safety in deep middle.',
    },
  },
  QB: {
    ...INSIDE_VEER_POSITION_RULES.QB,
    aimingPoint: 'Playside B-Gap Mesh Point / Option Alley',
    footwork: '4:30 step, ride B-gap mesh with 2 (Playside Dive Back); read EMLOS (#1) then Corner (#2).',
    assignmentsByFront: {
      '5-3': 'Read #1 9-Tech End; pull if he crashes, give to 2 if he widens. If pull, attack Corner #2 with 3 trailing on pitch.',
      '4-4': 'Read #1 5-Tech End; pull if he crashes, give to 2 if he widens. If pull, attack OLB #2 with 3 trailing on pitch.',
      '4-3': 'Read #1 Strong End; pull if he crashes, give to 2 if he widens. If pull, attack Sam #2 with 3 trailing on pitch.',
      '3-4': 'Read #1 Strong OLB; pull if he crashes, give to 2 if he widens. If pull, attack Safety #2 with 3 trailing on pitch.',
      '6-2': 'Read #1 9-Tech End; pull if he crashes, give to 2 if he widens. If pull, attack Corner #2 with 3 trailing on pitch.',
      '5-2': 'Read #1 Monster End; pull if he crashes, give to 2 if he widens. If pull, attack Monster #2 with 3 trailing on pitch.',
    },
    coachingCue: 'Ride B-gap mesh with 2 on 24 Veer; force the perimeter defender to declare.',
  },
  LH: {
    ...INSIDE_VEER_POSITION_RULES.LH,
    aimingPoint: 'Wider 5x2 Pitch Track (Right Sideline Alley)',
    footwork: 'Crossover step right, sprint across backfield to wide 5x2 pitch trail outside #2 Corner.',
    assignmentsByFront: {
      '5-3': 'Backside pitch back: sprint to wider 5x2 pitch trail outside #2 Corner.',
      '4-4': 'Backside pitch back: sprint to 5x2 pitch trail outside #2 OLB.',
      '4-3': 'Backside pitch back: sprint to 5x2 pitch trail outside #2 Sam LB.',
      '3-4': 'Backside pitch back: sprint to 5x2 pitch trail outside #2 Strong OLB.',
      '6-2': 'Backside pitch back: sprint to 5x2 pitch trail outside #2 Corner.',
      '5-2': 'Backside pitch back: sprint to 5x2 pitch trail outside #2 Monster.',
    },
    coachingCue: 'Backside Pitch Back: Wider pitch track on 24 Veer — stay outside the numbers.',
  },
  RH: {
    ...INSIDE_VEER_POSITION_RULES.RH,
    aimingPoint: 'Outside Hip of Right Guard (Playside B-Gap)',
    footwork: 'Downhill 4:30 track to RG outside hip; press B-gap seam.',
    assignmentsByFront: {
      '5-3': 'Playside dive back: explode at RG outside hip (B-Gap) on 4:30 track; press B-gap seam on 24 Veer.',
      '4-4': 'Playside dive back: explode at RG outside hip (B-Gap) on 4:30 track; press B-gap seam on 24 Veer.',
      '4-3': 'Playside dive back: explode at RG outside hip (B-Gap) on 4:30 track; press B-gap seam on 24 Veer.',
      '3-4': 'Playside dive back: explode at RG outside hip (B-Gap) on 4:30 track; press B-gap seam on 24 Veer.',
      '6-2': 'Playside dive back: explode at RG outside hip (B-Gap) on 4:30 track; press B-gap seam on 24 Veer.',
      '5-2': 'Playside dive back: explode at RG outside hip (B-Gap) on 4:30 track; press B-gap seam on 24 Veer.',
    },
    coachingCue: 'Playside Dive Back: Hit the Guard\'s outside hip full speed — press the B-Gap on 24 Veer.',
  },
  W: {
    ...INSIDE_VEER_POSITION_RULES.W,
    assignmentsByFront: {
      '5-3': 'Stalk playside Cornerback / seal perimeter alley.',
      '4-4': 'Stalk playside Cornerback / seal perimeter alley.',
      '4-3': 'Stalk playside Cornerback / seal perimeter alley.',
      '3-4': 'Stalk playside Cornerback / seal perimeter alley.',
      '6-2': 'Stalk playside Cornerback / seal perimeter alley.',
      '5-2': 'Stalk playside Cornerback / seal perimeter alley.',
    },
  },
};

export const TRAP_POSITION_RULES: Record<string, PlayerPositionRule> = {
  C: {
    ...INSIDE_VEER_POSITION_RULES.C,
    aimingPoint: 'Engage NT/DT Right in Front ➔ Seal to Backside',
    footwork: 'Fire into the NT or DT aligned right in front of you, establish playside leverage, and drive/seal him to the backside to lock off the backside A-gap.',
    assignmentsByFront: {
      '5-3': 'Engage 0-Tech Nose right in front, drive and seal him to the backside away from the trap hole.',
      '4-4': 'Engage 1-Tech/2i DT right in front, drive and seal him to the backside away from the trap hole.',
      '4-3': 'Engage 1-Tech Nose right in front, drive and seal him to the backside away from the trap hole.',
      '3-4': 'Engage 0-Tech Nose right in front, drive and seal him to the backside away from the trap hole.',
      '6-2': 'Engage 1-Tech Nose right in front, drive and seal him to the backside away from the trap hole.',
      '5-2': 'Engage 0-Tech Nose right in front, drive and seal him to the backside away from the trap hole.',
    },
    coachingCue: 'Center: Seal to the backside with the NT or DT right in front of you — wall off backside penetration.',
  },
  LG: {
    ...INSIDE_VEER_POSITION_RULES.LG,
    aimingPoint: 'Pull Flat Right behind Center — Kick Out Playside Trap Lineman',
    footwork: 'Drop-step flat, pull tight along Center hips behind down block, kick out penetrated defensive tackle with inside shoulder.',
    assignmentsByFront: {
      '5-3': 'Pull flat right behind Center to kick out penetrated 4b-Tech DT.',
      '4-4': 'Pull flat right behind Center to kick out penetrated 3-Tech DT.',
      '4-3': 'Pull flat right behind Center to kick out penetrated 3-Tech DT.',
      '3-4': 'Pull flat right behind Center to kick out penetrated 4-Tech End.',
      '6-2': 'Pull flat right behind Center to kick out penetrated 4-Tech DT.',
      '5-2': 'Pull flat right behind Center to kick out penetrated 4-Tech DT.',
    },
    coachingCue: 'Pull flat down the line behind Center\'s down block — kick out the penetrated lineman to blow open the trap lane.',
    commonErrorsFix: 'Looping backwards creates penetration. Step flat along the line of scrimmage immediately.',
  },
  RG: {
    ...INSIDE_VEER_POSITION_RULES.RG,
    aimingPoint: 'Release to Second Level — Seal Linebacker',
    assignmentsByFront: {
      '5-3': 'Release inside past DT to climb onto Mike LB, letting DT penetrate into trap block.',
      '4-4': 'Release past 3-Tech DT to climb onto Inside LB, letting DT penetrate into trap block.',
      '4-3': 'Release past DT to climb onto Middle LB.',
      '3-4': 'Release past 4-Tech to climb onto Inside LB.',
      '6-2': 'Release inside to second level onto LB.',
      '5-2': 'Release inside to second level onto LB.',
    },
    coachingCue: 'Release inside to linebacker — let the defensive lineman penetrate into the trap block.',
  },
  RT: {
    ...INSIDE_VEER_POSITION_RULES.RT,
    aimingPoint: 'Release to Linebacker / Seal Inside',
    assignmentsByFront: {
      '5-3': 'Climb onto second-level linebacker; seal pursuit.',
      '4-4': 'Climb onto second-level linebacker; seal pursuit.',
      '4-3': 'Climb onto second-level linebacker; seal pursuit.',
      '3-4': 'Climb onto second-level linebacker; seal pursuit.',
      '6-2': 'Climb onto second-level linebacker; seal pursuit.',
      '5-2': 'Climb onto second-level linebacker; seal pursuit.',
    },
    coachingCue: 'Climb onto second-level linebacker — seal backside pursuit.',
  },
  YTE: {
    ...INSIDE_VEER_POSITION_RULES.YTE,
    assignmentsByFront: {
      '5-3': 'Down block on 9-Tech End or seal second-level LB.',
      '4-4': 'Down block on 5-Tech End.',
      '4-3': 'Down block on Strong End.',
      '3-4': 'Down block on Strong OLB.',
      '6-2': 'Down block on 9-Tech End.',
      '5-2': 'Down block on 7-Tech End.',
    },
    coachingCue: 'Down block to seal the edge.',
  },
  LT: {
    ...INSIDE_VEER_POSITION_RULES.LT,
    assignmentsByFront: {
      '5-3': 'Scoop backside B-gap to Will LB.',
      '4-4': 'Scoop backside DT; climb to Weak ILB.',
      '4-3': 'Scoop backside DT; climb to Will LB.',
      '3-4': 'Scoop backside End; climb to Weak ILB.',
      '6-2': 'Scoop backside 4i-Tech DT.',
      '5-2': 'Scoop backside 3-Tech DT.',
    },
    coachingCue: 'Cut off backside pursuit — no leakage.',
  },
  XTE: {
    ...INSIDE_VEER_POSITION_RULES.XTE,
    assignmentsByFront: {
      '5-3': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '4-4': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '4-3': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '3-4': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '6-2': 'Cut off Free Safety in deep middle.',
      '5-2': 'Cut off Free Safety in deep middle.',
    },
    coachingCue: 'Cut off safety or stalk CB.',
  },
  QB: {
    ...INSIDE_VEER_POSITION_RULES.QB,
    aimingPoint: 'Snap ➔ 180° Spin Fake to Off RB on Sweep Behind ➔ Backfield Mesh with Primary RB',
    footwork: 'Take snap, execute rapid 180° spin to fake to off RB sweeping behind 1, spin back to meet primary RB returning from pitch-fake step, seat ball into stomach at mesh, bootleg fake away.',
    assignmentsByFront: {
      '5-3': 'Take snap, spin 180° fake to off RB on sweep behind 1, square to primary RB returning from pitch fake for backfield mesh handoff.',
      '4-4': 'Take snap, spin 180° fake to off RB on sweep behind 1, square to primary RB returning from pitch fake for backfield mesh handoff.',
      '4-3': 'Take snap, spin 180° fake to off RB on sweep behind 1, square to primary RB returning from pitch fake for backfield mesh handoff.',
      '3-4': 'Take snap, spin 180° fake to off RB on sweep behind 1, square to primary RB returning from pitch fake for backfield mesh handoff.',
      '6-2': 'Take snap, spin 180° fake to off RB on sweep behind 1, square to primary RB returning from pitch fake for backfield mesh handoff.',
      '5-2': 'Take snap, spin 180° fake to off RB on sweep behind 1, square to primary RB returning from pitch fake for backfield mesh handoff.',
    },
    coachingCue: '1-Back: Take snap, spin 180° to fake to off RB on sweep behind 1, then square to primary RB for the mesh handoff.',
  },
  RH: {
    ...INSIDE_VEER_POSITION_RULES.RH,
    aimingPoint: 'Pitch-Fake Step Outside Right ➔ Cutback to 1 for Mesh ➔ Quick Trap Seam',
    footwork: 'Take one large explosive step to your outside right as if running for a pitch, plant hard on outside foot, cut back sharply to 1 for the mesh handoff, then accelerate through the trap seam.',
    assignmentsByFront: {
      '5-3': 'Pitch-fake step outside right, cut back to 1 for mesh, take handoff and burst through quick trap seam behind pulling LG.',
      '4-4': 'Pitch-fake step outside right, cut back to 1 for mesh, take handoff and burst through quick trap seam behind pulling LG.',
      '4-3': 'Pitch-fake step outside right, cut back to 1 for mesh, take handoff and burst through quick trap seam behind pulling LG.',
      '3-4': 'Pitch-fake step outside right, cut back to 1 for mesh, take handoff and burst through quick trap seam behind pulling LG.',
      '6-2': 'Pitch-fake step outside right, cut back to 1 for mesh, take handoff and burst through quick trap seam behind pulling LG.',
      '5-2': 'Pitch-fake step outside right, cut back to 1 for mesh, take handoff and burst through quick trap seam behind pulling LG.',
    },
    coachingCue: 'Primary RB: One large step as if running for pitch to outside, then come back to 1 for the mesh and burst through the trap.',
    commonErrorsFix: 'Do not rush downhill immediately. The large pitch-fake step outside is critical to freeze linebackers and open the trap hole.',
  },
  LH: {
    ...INSIDE_VEER_POSITION_RULES.LH,
    aimingPoint: 'Sweep Behind 1 ➔ Take 180° Fake ➔ Attack B-Gap Off Strong OT Hip ➔ Climb to Backer',
    footwork: 'Sprint on sweep track crossing tightly behind 1, take 180° spin fake, bend downhill through B-gap off Strong OT hip, and climb to block second-level linebacker.',
    assignmentsByFront: {
      '5-3': 'Sweep behind 1, take 180° spin fake, run through B-gap off Strong OT hip, and climb to Mike LB.',
      '4-4': 'Sweep behind 1, take 180° spin fake, run through B-gap off Strong OT hip, and climb to Inside LB.',
      '4-3': 'Sweep behind 1, take 180° spin fake, run through B-gap off Strong OT hip, and climb to Middle LB.',
      '3-4': 'Sweep behind 1, take 180° spin fake, run through B-gap off Strong OT hip, and climb to Inside LB.',
      '6-2': 'Sweep behind 1, take 180° spin fake, run through B-gap off Strong OT hip, and climb to second-level LB.',
      '5-2': 'Sweep behind 1, take 180° spin fake, run through B-gap off Strong OT hip, and climb to second-level LB.',
    },
    coachingCue: 'Off RB (The Fake): Run through B-gap off Strong OT hip and climb to backer — sell the dive to freeze linebackers.',
  },
  W: {
    ...INSIDE_VEER_POSITION_RULES.W,
    assignmentsByFront: {
      '5-3': 'Stalk cornerback / crack safety on backside.',
      '4-4': 'Stalk cornerback / crack safety on backside.',
      '4-3': 'Stalk cornerback / crack safety on backside.',
      '3-4': 'Stalk cornerback / crack safety on backside.',
      '6-2': 'Stalk cornerback.',
      '5-2': 'Stalk cornerback.',
    },
  },
};

export const COUNTER_POSITION_RULES = TRAP_POSITION_RULES;

export const POWER_POSITION_RULES: Record<string, PlayerPositionRule> = {
  C: {
    ...INSIDE_VEER_POSITION_RULES.C,
    assignmentsByFront: {
      '5-3': 'Ace combo 0-Tech Nose with RG to backside Will LB.',
      '4-4': 'Base reach 2i-Tech DT; secure backside A-gap.',
      '4-3': 'Combo 1-Tech Nose with LG.',
      '3-4': 'Ace combo 0-Tech Nose with RG.',
      '6-2': 'Base drive 1-Tech Nose.',
      '5-2': 'Scoop slanting Nose.',
    },
    coachingCue: 'Anchor Center of down-block wall.',
  },
  RG: {
    ...INSIDE_VEER_POSITION_RULES.RG,
    assignmentsByFront: {
      '5-3': 'Combo 0-Tech Nose with Center.',
      '4-4': 'Base down block on 3-Tech DT.',
      '4-3': 'Base down block on 3-Tech DT.',
      '3-4': 'Combo 0-Tech Nose with Center.',
      '6-2': 'Base drive 1-Tech Nose.',
      '5-2': 'Down block interior slanter.',
    },
    coachingCue: 'Down block inside — create running lane for 3.',
  },
  RT: {
    ...INSIDE_VEER_POSITION_RULES.RT,
    aimingPoint: 'Heavy Down-Block on 4/5-Tech DT',
    footwork: 'Violent 45° inside down block; wash defender inside.',
    assignmentsByFront: {
      '5-3': 'Heavy down block on 4b-Tech DT; wash inside.',
      '4-4': 'Heavy down block on 3-Tech DT; wash inside.',
      '4-3': 'Heavy down block on 3-Tech DT; wash inside.',
      '3-4': 'Heavy down block on 4-Tech End; wash inside.',
      '6-2': 'Heavy down block on 4-Tech DT; wash inside.',
      '5-2': 'Heavy down block on 4-Tech DT; wash inside.',
    },
    coachingCue: 'Heavy down block — seal the inside wall.',
  },
  YTE: {
    ...INSIDE_VEER_POSITION_RULES.YTE,
    aimingPoint: 'Heavy Down-Block on Defensive End',
    footwork: 'Explosive down block on edge defender; collapse the line.',
    assignmentsByFront: {
      '5-3': 'Down block on 9-Tech End; collapse inside.',
      '4-4': 'Down block on 5-Tech End.',
      '4-3': 'Down block on Strong End.',
      '3-4': 'Down block on Strong OLB.',
      '6-2': 'Down block on 9-Tech End.',
      '5-2': 'Down block on 7-Tech End.',
    },
    coachingCue: 'Heavy down block on the edge — seal the wall for LG kickout.',
  },
  LG: {
    ...INSIDE_VEER_POSITION_RULES.LG,
    aimingPoint: 'Pull Flat across Center — Kick Out Playside Edge Defender (EMLOS)',
    footwork: 'Skip-pull flat along Center/Tackle hips, wrap tight around RT down block, strike edge defender.',
    assignmentsByFront: {
      '5-3': 'Pull flat across Center, kick out 9-Tech End with inside shoulder.',
      '4-4': 'Pull flat across Center, kick out 5-Tech End/OLB.',
      '4-3': 'Skip-pull flat across Center, kick out 7-Tech End.',
      '3-4': 'Skip-pull flat across Center, kick out edge OLB.',
      '6-2': 'Pull flat right, kick out 9-Tech End.',
      '5-2': 'Pull flat right, kick out 7-Tech End.',
    },
    coachingCue: 'Pull flat, stay tight to the wall, kick out edge defender with inside shoulder.',
    commonErrorsFix: 'Drifting into backfield allows penetration. Skim hips of down-blockers.',
  },
  LT: {
    ...INSIDE_VEER_POSITION_RULES.LT,
    assignmentsByFront: {
      '5-3': 'Cutoff backside 4-Tech DT; do not allow chase.',
      '4-4': 'Cutoff backside DT; protect backside B-gap.',
      '4-3': 'Cutoff backside 5-Tech End.',
      '3-4': 'Cutoff backside 4-Tech End.',
      '6-2': 'Cutoff backside 4i-Tech DT.',
      '5-2': 'Scoop backside 3-Tech DT.',
    },
    coachingCue: 'No penetration from backside.',
  },
  XTE: {
    ...INSIDE_VEER_POSITION_RULES.XTE,
    assignmentsByFront: {
      '5-3': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '4-4': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '4-3': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '3-4': 'Sprint across field to cut off Free Safety (or stalk CB).',
      '6-2': 'Cut off Free Safety in deep middle.',
      '5-2': 'Cut off Free Safety in deep middle.',
    },
  },
  QB: {
    ...INSIDE_VEER_POSITION_RULES.QB,
    aimingPoint: 'Direct Handoff to 3 ➔ Bootleg Fake Weakside',
    footwork: 'Open at 4:30, seat ball firmly into 3-back, carry out naked bootleg fake left.',
    assignmentsByFront: {
      '5-3': 'Open 4:30, seat ball firmly into 3, bootleg fake left to hold backside end.',
      '4-4': 'Open 4:30, seat ball firmly into 3, bootleg fake left to hold backside end.',
      '4-3': 'Open 4:30, seat ball firmly into 3, bootleg fake left to hold backside end.',
      '3-4': 'Open 4:30, seat ball firmly into 3, bootleg fake left to hold backside end.',
      '6-2': 'Open 4:30, seat ball firmly into 3, bootleg fake left to hold backside end.',
      '5-2': 'Open 4:30, seat ball firmly into 3, bootleg fake left to hold backside end.',
    },
    coachingCue: 'Seat ball deep into 3; sprint out naked bootleg fake.',
  },
  LH: {
    ...INSIDE_VEER_POSITION_RULES.LH,
    aimingPoint: 'Hesitation Step ➔ Playside 4-Hole (C-Gap) behind Pulling LG and Lead RH',
    footwork: 'Take a deliberate hesitation/gather step in the backfield to allow pulling LG to clear the running lane, secure handoff at 4:30, press line, and cut vertical inside kickout block.',
    assignmentsByFront: {
      '5-3': 'Hesitation step to let LG clear, press 4-hole behind pulling LG, cut vertical inside kickout block.',
      '4-4': 'Hesitation step to let LG clear, press 4-hole behind pulling LG, cut vertical inside kickout block.',
      '4-3': 'Hesitation step to let LG clear, press 4-hole behind pulling LG, cut vertical inside kickout block.',
      '3-4': 'Hesitation step to let LG clear, press 4-hole behind pulling LG, cut vertical inside kickout block.',
      '6-2': 'Hesitation step to let LG clear, press 4-hole behind pulling LG, cut vertical inside kickout block.',
      '5-2': 'Hesitation step to let LG clear, press 4-hole behind pulling LG, cut vertical inside kickout block.',
    },
    coachingCue: 'Hesitation step first — allow LG to clear the running lane before bursting downhill.',
    commonErrorsFix: 'Rushing ahead of the pulling Guard clogs the hole. Take your hesitation step so LG kicks out the edge cleanly.',
  },
  RH: {
    ...INSIDE_VEER_POSITION_RULES.RH,
    aimingPoint: 'Lead through C-Gap — Isolate Playside Linebacker (Mike/Sam LB)',
    footwork: 'Explode downhill at 45°, fire through C-gap, fit and drive linebacker backwards.',
    assignmentsByFront: {
      '5-3': 'Lead through C-gap, isolate and drive Mike LB backwards.',
      '4-4': 'Lead through C-gap, isolate Strong Inside LB.',
      '4-3': 'Lead through C-gap, isolate Mike LB.',
      '3-4': 'Lead through C-gap, isolate Strong Inside LB.',
      '6-2': 'Lead through C-gap, isolate Right LB.',
      '5-2': 'Lead through C-gap, isolate Strong Inside LB.',
    },
    coachingCue: 'You are the Lead Blocker on Power — blow up the Linebacker.',
    commonErrorsFix: 'Hesitating at mesh ruins the hole. Hit C-gap at full speed and drive.',
  },
  W: {
    ...INSIDE_VEER_POSITION_RULES.W,
    assignmentsByFront: {
      '5-3': 'Stalk playside cornerback / crack safety.',
      '4-4': 'Crack Strong Safety or stalk cornerback.',
      '4-3': 'Stalk playside cornerback / seal perimeter.',
      '3-4': 'Stalk playside cornerback / seal perimeter.',
      '6-2': 'Stalk playside cornerback.',
      '5-2': 'Stalk playside cornerback.',
    },
  },
};

export const FLOOD_POSITION_RULES: Record<string, PlayerPositionRule> = {
  W: {
    id: 'W',
    label: 'Z',
    fullName: 'Z Receiver (Wide Z / Wing Z)',
    group: 'WR',
    split: 'Wide Z: 8–10 yds split wide | Wing Z: 1 yd outside x 1 yd behind YTE',
    stance: '2-point athletic stance, inside foot forward, eyes on secondary coverage.',
    aimingPoint: 'Post Corner (Deep Corner Pylon)',
    footwork: 'Drive vertical 10 yds, fake post hard to freeze safety, cut 45° to corner pylon.',
    assignmentsByFront: {
      '5-3': 'Z - post corner (drive 10 yds, stem post to freeze safety, cut 45° to corner pylon).',
      '4-4': 'Z - post corner (drive 10 yds, stem post to freeze safety, cut 45° to corner pylon).',
      '4-3': 'Z - post corner (drive 10 yds, stem post to freeze safety, cut 45° to corner pylon).',
      '3-4': 'Z - post corner (drive 10 yds, stem post to freeze safety, cut 45° to corner pylon).',
      '6-2': 'Z - post corner (drive 10 yds, stem post to freeze safety, cut 45° to corner pylon).',
      '5-2': 'Z - post corner (drive 10 yds, stem post to freeze safety, cut 45° to corner pylon).',
    },
    coachingCue: 'Sell post inside to freeze safety, then snap 45° to corner pylon.',
    commonErrorsFix: 'Drifting on the break lets the safety recover. Make a sharp, violent 45° plant and cut.',
  },
  RG: {
    id: 'RG',
    label: 'RG',
    fullName: 'Right Guard',
    group: 'OL',
    split: '3 ft from Center',
    stance: '3-point pass pro stance; weight balanced.',
    aimingPoint: 'Pull to Backside DE (Pass Protection)',
    footwork: 'Drop-step flat, pull across Center behind LOS, square up and stone the backside DE.',
    assignmentsByFront: {
      '5-3': 'RG - Pull to backside DE (pass pro kick out / wall off backside end).',
      '4-4': 'RG - Pull to backside DE (pass pro kick out / wall off backside end).',
      '4-3': 'RG - Pull to backside DE (pass pro kick out / wall off backside end).',
      '3-4': 'RG - Pull to backside DE (pass pro kick out / wall off backside end).',
      '6-2': 'RG - Pull to backside DE (pass pro kick out / wall off backside end).',
      '5-2': 'RG - Pull to backside DE (pass pro kick out / wall off backside end).',
    },
    coachingCue: 'Skip-pull flat across Center to backside DE — keep him off the QB.',
    commonErrorsFix: 'Pulling too deep lets the DE penetrate inside. Skim the heels of the interior linemen.',
  },
  RH: {
    id: 'RH',
    label: '2',
    fullName: '2 (Right Halfback / 2-Back)',
    group: 'BACK',
    split: '4 yards deep, inside foot behind Right Guard outside heel',
    stance: '2-point stance facing straight ahead so defense gets no tip.',
    aimingPoint: 'Outside Shoulder of Backside DE (2 Count) ➔ Release to Flat',
    footwork: 'Sprint across to outside shoulder of backside DE, engage for 2 count ("One-thousand-one, one-thousand-two"), then release into the flat.',
    assignmentsByFront: {
      '5-3': '2 back attacking outside shoulder of backside DE for a 2 count then releasing to flats.',
      '4-4': '2 back attacking outside shoulder of backside DE for a 2 count then releasing to flats.',
      '4-3': '2 back attacking outside shoulder of backside DE for a 2 count then releasing to flats.',
      '3-4': '2 back attacking outside shoulder of backside DE for a 2 count then releasing to flats.',
      '6-2': '2 back attacking outside shoulder of backside DE for a 2 count then releasing to flats.',
      '5-2': '2 back attacking outside shoulder of backside DE for a 2 count then releasing to flats.',
    },
    coachingCue: 'Attack outside shoulder of backside DE for 2 count, then release to the flat.',
    commonErrorsFix: 'Releasing too early allows the backside DE a free rush on the QB. Hold for the full 2 count.',
  },
  RT: {
    id: 'RT',
    label: 'RT',
    fullName: 'Right Tackle',
    group: 'OL',
    split: '3 ft from Right Guard',
    stance: '3-point pass pro crouch; maintain low pad level.',
    aimingPoint: 'Shift Inside for Pass Pro (Secure Inside B-Gap)',
    footwork: 'Short inside shift step, maintain inside leverage and lock down B-gap rusher.',
    assignmentsByFront: {
      '5-3': 'RT shifts for inside pass pro (secure inside B-gap against interior rush).',
      '4-4': 'RT shifts for inside pass pro (secure inside B-gap against interior rush).',
      '4-3': 'RT shifts for inside pass pro (secure inside B-gap against interior rush).',
      '3-4': 'RT shifts for inside pass pro (secure inside B-gap against interior rush).',
      '6-2': 'RT shifts for inside pass pro (secure inside B-gap against interior rush).',
      '5-2': 'RT shifts for inside pass pro (secure inside B-gap against interior rush).',
    },
    coachingCue: 'Shift inside for pass pro — give up zero inside penetration.',
    commonErrorsFix: 'Over-setting outside opens the B-gap. Protect your inside gap first.',
  },
  LH: {
    id: 'LH',
    label: '3',
    fullName: '3 (Left Halfback / 3-Back)',
    group: 'BACK',
    split: '4 yards deep, inside foot behind Left Guard outside heel',
    stance: '2-point stance, hands on knees, zero false steps.',
    aimingPoint: 'Outside Shoulder of SDE ➔ Release Arrow to Flat',
    footwork: 'Fire at outside shoulder of SDE, deliver two-hand punch, then release to right flat on arrow route.',
    assignmentsByFront: {
      '5-3': '3 back blocking outside shoulder of SDE then releasing arrow to flat.',
      '4-4': '3 back blocking outside shoulder of SDE then releasing arrow to flat.',
      '4-3': '3 back blocking outside shoulder of SDE then releasing arrow to flat.',
      '3-4': '3 back blocking outside shoulder of SDE then releasing arrow to flat.',
      '6-2': '3 back blocking outside shoulder of SDE then releasing arrow to flat.',
      '5-2': '3 back blocking outside shoulder of SDE then releasing arrow to flat.',
    },
    coachingCue: 'Block outside shoulder of SDE then release on arrow route to the flat.',
    commonErrorsFix: 'Whiffing on the chip allows immediate edge rush. Fit your hands on his shoulder pads before releasing.',
  },
  XTE: {
    id: 'XTE',
    label: 'X',
    fullName: 'X (Tight End / Wide X Split End)',
    group: 'TE',
    split: 'Tight X: 3 ft from Left Tackle | Wide X: 8–10 yds split wide',
    stance: '3-point stance (Tight X) or 2-point stance (Wide X).',
    aimingPoint: 'Left Side CB Outside Shoulder ➔ Cut Post',
    footwork: 'Attack left side CB stem hard directly at his outside shoulder for 8 yards, then cut sharp across middle on Post.',
    assignmentsByFront: {
      '5-3': 'X drives directly at outside shoulder of left side CB for 8 yards, then cuts sharply post across middle.',
      '4-4': 'X drives directly at outside shoulder of left side CB for 8 yards, then cuts sharply post across middle.',
      '4-3': 'X drives directly at outside shoulder of left side CB for 8 yards, then cuts sharply post across middle.',
      '3-4': 'X drives directly at outside shoulder of left side CB for 8 yards, then cuts sharply post across middle.',
      '6-2': 'X drives directly at outside shoulder of left side CB for 8 yards, then cuts sharply post across middle.',
      '5-2': 'X drives directly at outside shoulder of left side CB for 8 yards, then cuts sharply post across middle.',
    },
    coachingCue: 'Drive directly at outside shoulder of CB to turn his hips, then break post.',
    commonErrorsFix: 'Rounding the stem tips off the route. Drive at his outside shoulder at full speed.',
  },
  YTE: {
    id: 'YTE',
    label: 'Y',
    fullName: 'Y (Tight End)',
    group: 'TE',
    split: '3 ft from Right Tackle',
    stance: '3-point tight end stance, outside foot staggered back.',
    aimingPoint: '7-Yard Whip Out (Sideline Break)',
    footwork: 'Drive 7 yards vertical, break inside 2 steps to freeze defender, pivot back out to the sideline.',
    assignmentsByFront: {
      '5-3': 'Y is running 7 yard whip out (drive 7 yds, break inside 2 steps, pivot out to sideline).',
      '4-4': 'Y is running 7 yard whip out (drive 7 yds, break inside 2 steps, pivot out to sideline).',
      '4-3': 'Y is running 7 yard whip out (drive 7 yds, break inside 2 steps, pivot out to sideline).',
      '3-4': 'Y is running 7 yard whip out (drive 7 yds, break inside 2 steps, pivot out to sideline).',
      '6-2': 'Y is running 7 yard whip out (drive 7 yds, break inside 2 steps, pivot out to sideline).',
      '5-2': 'Y is running 7 yard whip out (drive 7 yds, break inside 2 steps, pivot out to sideline).',
    },
    coachingCue: 'Drive 7 yards, whip inside 2 steps, plant hard and explode out to sideline.',
    commonErrorsFix: 'Breaking too shallow brings the pass into linebacker reach. Reach full 7 yards before whipping out.',
  },
  C: {
    id: 'C',
    label: 'C',
    fullName: 'Center',
    group: 'OL',
    split: '0 ft (Ball Spot)',
    stance: 'Balanced pass pro stance.',
    aimingPoint: 'Playside A-Gap Pass Pro',
    footwork: 'Snap and short post step; anchor Center of pocket.',
    assignmentsByFront: {
      '5-3': 'Pass pro inside slide — anchor A-gap against interior rush.',
      '4-4': 'Pass pro inside slide — anchor A-gap against interior rush.',
      '4-3': 'Pass pro inside slide — anchor A-gap against interior rush.',
      '3-4': 'Pass pro inside slide — anchor A-gap against interior rush.',
      '6-2': 'Pass pro inside slide — anchor A-gap against interior rush.',
      '5-2': 'Pass pro inside slide — anchor A-gap against interior rush.',
    },
    coachingCue: 'Anchor Center of pocket — give zero interior push.',
    commonErrorsFix: 'Giving up depth collapses the QB pocket. Play with low pads and wide base.',
  },
  LG: {
    id: 'LG',
    label: 'LG',
    fullName: 'Left Guard',
    group: 'OL',
    split: '3 ft from Center',
    stance: '3-point pass pro stance.',
    aimingPoint: 'Pass Pro Step Inside (Lock Down B-Gap with LT)',
    footwork: 'Inside step, maintain low center of gravity, punch rusher.',
    assignmentsByFront: {
      '5-3': 'Pass pro step inside — lock down B-gap with LT.',
      '4-4': 'Pass pro step inside — lock down B-gap with LT.',
      '4-3': 'Pass pro step inside — lock down B-gap with LT.',
      '3-4': 'Pass pro step inside — lock down B-gap with LT.',
      '6-2': 'Pass pro step inside — lock down B-gap with LT.',
      '5-2': 'Pass pro step inside — lock down B-gap with LT.',
    },
    coachingCue: 'Step inside, keep low center of gravity, maintain firm pocket.',
    commonErrorsFix: 'Do not chase outside rushers; trust LT and pulling RG.',
  },
  LT: {
    id: 'LT',
    label: 'LT',
    fullName: 'Left Tackle',
    group: 'OL',
    split: '3 ft from Left Guard',
    stance: '3-point pass pro stance.',
    aimingPoint: 'Pass Pro Vertical Set (Secure Backside C-Gap with Pulling RG)',
    footwork: 'Kick step, vertical set, punch and mirror edge rusher.',
    assignmentsByFront: {
      '5-3': 'Pass pro vertical set — secure backside C-gap with pulling RG.',
      '4-4': 'Pass pro vertical set — secure backside C-gap with pulling RG.',
      '4-3': 'Pass pro vertical set — secure backside C-gap with pulling RG.',
      '3-4': 'Pass pro vertical set — secure backside C-gap with pulling RG.',
      '6-2': 'Pass pro vertical set — secure backside C-gap with pulling RG.',
      '5-2': 'Pass pro vertical set — secure backside C-gap with pulling RG.',
    },
    coachingCue: 'Vertical set, punch and mirror edge rusher.',
    commonErrorsFix: 'Lunging forward ruins balance. Let the rusher come to you and punch.',
  },
  QB: {
    id: 'QB',
    label: '1',
    fullName: '1 (Quarterback)',
    group: 'BACK',
    split: 'Under Center',
    stance: 'Knees bent, scanning secondary coverage pre-snap.',
    aimingPoint: 'Progression: 1) RB Arrow ➔ 2) Y Whip Out ➔ 3) Z Post Corner',
    footwork: 'Play-action fake to 3-back, 3-step gather drop behind RT inside pass pro.',
    assignmentsByFront: {
      '5-3': 'Play-action fake to 3, 3-step drop. Progression: 1) RB on Arrow route in flat ➔ 2) Y 7-yd Whip Out ➔ 3) Z Post Corner.',
      '4-4': 'Play-action fake to 3, 3-step drop. Progression: 1) RB on Arrow route in flat ➔ 2) Y 7-yd Whip Out ➔ 3) Z Post Corner.',
      '4-3': 'Play-action fake to 3, 3-step drop. Progression: 1) RB on Arrow route in flat ➔ 2) Y 7-yd Whip Out ➔ 3) Z Post Corner.',
      '3-4': 'Play-action fake to 3, 3-step drop. Progression: 1) RB on Arrow route in flat ➔ 2) Y 7-yd Whip Out ➔ 3) Z Post Corner.',
      '6-2': 'Play-action fake to 3, 3-step drop. Progression: 1) RB on Arrow route in flat ➔ 2) Y 7-yd Whip Out ➔ 3) Z Post Corner.',
      '5-2': 'Play-action fake to 3, 3-step drop. Progression: 1) RB on Arrow route in flat ➔ 2) Y 7-yd Whip Out ➔ 3) Z Post Corner.',
    },
    coachingCue: 'Fake run, plant back foot, read 1) RB Arrow in flat, then 2) Y on 7-yd whip out, then 3) Z.',
    commonErrorsFix: 'Rushing the throw before reading RB or Y breaks out causes incompletions. Work inside-out through the progression.',
  },
};

export const BASE_POSITION_RULES = INSIDE_VEER_POSITION_RULES;

export const VEER_PLAYBOOK: PlayDefinition[] = [
  // 1. INSIDE VEER (22/31 VEER)
  {
    id: '22-inside-veer',
    code: '22 VEER',
    name: '22/31 Veer',
    subtitle: 'Dive Back Aims for Backside Hip of Playside OG & OT — Reads #1 DT & #2 Pitch Key',
    seriesTag: 'Core 01',
    playType: 'Triple Option',
    targetGap: 'Playside Seam (Backside Hip of Playside OG/OT) / Perimeter Alley',
    primaryReadLabel: '#1 Dive Key (Playside DT)',
    secondaryReadLabel: '#2 Pitch Key (EMLOS End / Edge Force)',
    summary:
      'The foundational 22/31 Veer triple option (22 Veer to the right, 31 Veer to the left). Dive Back (Playside) aims for the backside hip of the playside OG and OT, attacking downhill through the seam. Pitch Back (Backside) tracks the outside hip of the playside tackle, keeping 4x4-yard pitch spacing. 1-Back (QB) meshes at the seam off the backside hip of the playside OG, reading the dive key; if #1 crashes with a full commit, 1 pulls into the backfield and options #2; the pitch happens in the backfield (never a forward pitch) when #2 commits to 1.',
    whenToCall:
      'First play of the game and whenever the defense packs 8 or 9 players into the box to stop inside runs.',
    qbDecisionMatrix: {
      crashPull: 'If #1 Dive Key crashes with a full commit to tackle the dive back → 1 pulls the ball into the backfield and attacks the #2 pitch key along the backfield track.',
      squeezeGive: 'If #1 Dive Key sits square, widens, or Bull Rushes → GIVE to playside dive back aiming for the backside hip of playside OG and OT.',
      pitchPhase: 'When #2 read commits to 1 in the backfield → 1 pitches backward/laterally to backside pitch back in the backfield (never a forward pitch); if #2 commits to 3 by feathering wide → 1 keeps and turns vertically upfield inside him.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: 3-Ft Splits & Key Identification',
        detail: '1 locates #1 Dive Key and #2 Pitch Key. O-line maintains strict 3-foot splits.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: Seam Mesh & Backside Hip Track',
        detail: 'Playside dive back aims for the backside hip of playside OG and OT, attacking downhill through the seam. 1 meshes at seam reading #1.',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: Backfield Pitch Execution & 4x4 Spacing',
        detail: 'If pulling, 1 attacks along the backfield track. When #2 commits to 1 in the backfield, 1 pitches backward/laterally in the backfield to the 4x4 pitch back.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: Perimeter Breakaway & Alley Finish',
        detail: 'Backside pitch back secures the pitch in the backfield and accelerates up the sideline, or 1 keeper cuts vertically upfield inside #2.',
      },
    ],
    positionRules: INSIDE_VEER_POSITION_RULES,
    getOffensivePaths: (
      _front,
      diveBehavior,
      pitchBehavior,
      eleventhMode,
      xMode = 'tight_x',
      zSide = 'right',
      targetSide = 'right',
      ySide = 'right',
      yType = 'tight',
      floodFake = 'none'
    ) => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode, zSide, ySide, yType);
      const diveGive = diveBehavior !== 'crash';
      const qbKeep = !diveGive && pitchBehavior === 'feather_pitch';
      const pitchTriggered = !diveGive && pitchBehavior === 'commit_qb';

      const finalCarrier = diveGive ? 'RH' : pitchTriggered ? 'LH' : 'QB';
      const outcomeLabel = diveGive
        ? 'GIVE TO 2 (22 Veer Seam Dive)'
        : pitchTriggered
        ? 'PITCH TO 3 (22 Veer Backfield Pitch)'
        : '1 KEEPER (22 Veer Inside Cut)';

      const rawPaths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }> = {
        C: { role: 'block_scoop', points: [base.C, { x: 506, y: 350 }, { x: 488, y: 318 }] },
        RG: { role: 'block_down', points: [base.RG, { x: 538, y: 350 }, { x: 532, y: 315 }] },
        RT: { role: 'block_veer', points: [base.RT, { x: 572, y: 344 }, { x: 530, y: 278 }] },
        YTE: { role: 'block_veer', points: [base.YTE, { x: 632, y: 340 }, { x: 590, y: 262 }] },
        LG: { role: 'block_scoop', points: [base.LG, { x: 472, y: 356 }, { x: 444, y: 288 }] },
        LT: { role: 'block_scoop', points: [base.LT, { x: 422, y: 350 }, { x: 418, y: 312 }] },
        XTE: {
          role: 'block_veer',
          points: xMode === 'wide_x'
            ? [base.XTE, { x: 195, y: 340 }, { x: 245, y: 265 }]
            : [base.XTE, { x: 405, y: 325 }, { x: 486, y: 192 }],
        },
        W: { role: 'block_veer', points: [base.W, { x: base.W.x + 28, y: 335 }, { x: 742, y: 268 }] },
        // Dive Back (Playside): Aims for backside hip of playside OG (RG) and OT (RT), attacking downhill through seam
        RH: {
          role: 'dive',
          points: diveGive
            ? [
                base.RH,
                { x: 550, y: 442 }, // aims downhill directly at backside hip of playside OG/OT
                { x: 544, y: 412 }, // meshes with 1 in backfield off backside hip of playside OG
                { x: 546, y: 348 }, // creases downhill through seam across LOS
                { x: 550, y: 245 }, // second level acceleration
                { x: 552, y: 150 }, // secondary breakaway
              ]
            : [
                base.RH,
                { x: 550, y: 442 },
                { x: 544, y: 412 }, // full commit tackle by crashing #1 DT
                { x: 544, y: 380 },
                { x: 544, y: 360 },
                { x: 544, y: 350 },
              ],
        },
        // 1-Back (QB): Meshes at seam off backside hip of playside OG; if pulling, attacks #2 in backfield; pitches in backfield when #2 commits to 1
        QB: {
          role: 'qb',
          points: diveGive
            ? [
                base.QB,
                { x: 538, y: 426 }, // steps to seam off backside hip of playside OG
                { x: 542, y: 412 }, // meshes at seam beside Dive Back
                { x: 620, y: 410 }, // carries out option fake along backfield
                { x: 660, y: 395 },
                { x: 685, y: 380 },
              ]
            : qbKeep
            ? [
                base.QB,
                { x: 538, y: 426 },
                { x: 542, y: 412 }, // pulls ball at seam
                { x: 630, y: 404 }, // attacks #2 along backfield track; #2 commits wide to 3-back
                { x: 630, y: 280 }, // 1 plants and cuts vertically upfield inside #2
                { x: 630, y: 155 }, // bursts through seam
              ]
            : [
                base.QB,
                { x: 538, y: 426 },
                { x: 542, y: 412 }, // pulls ball at seam
                { x: 630, y: 404 }, // attacks #2 along backfield track; #2 commits to 1 in backfield
                { x: 634, y: 404 }, // pitches ball in backfield and absorbs tackle
                { x: 636, y: 404 },
              ],
        },
        // Pitch Back (Backside): Tracks outside hip of tackle in 4x4 spacing; receives pitch IN THE BACKFIELD (never forward pitch)
        LH: {
          role: 'pitch',
          points: pitchTriggered
            ? [
                base.LH,
                { x: 520, y: 476 }, // crossover step across backfield
                { x: 610, y: 448 }, // tracks outside hip of playside tackle in backfield
                { x: 680, y: 420 }, // receives pitch in backfield (deeper and wider than QB at 630, 404)!
                { x: 710, y: 300 }, // turns upfield across LOS along sideline
                { x: 730, y: 155 }, // accelerates downfield
              ]
            : [
                base.LH,
                { x: 520, y: 476 },
                { x: 610, y: 448 },
                { x: 680, y: 420 }, // maintains 4x4 pitch relationship in backfield
                { x: 700, y: 380 },
                { x: 715, y: 340 },
              ],
        },
      };

      const paths = targetSide === 'left' ? mirrorPaths(rawPaths) : rawPaths;

      return {
        paths,
        ballCarrierSequence: {
          diveGive,
          qbKeep,
          pitchTriggered,
          finalCarrier: targetSide === 'left' ? (finalCarrier === 'RH' ? 'LH' : finalCarrier === 'LH' ? 'RH' : 'QB') : finalCarrier,
          outcomeLabel: targetSide === 'left'
            ? (diveGive ? 'GIVE TO 3 (31 Veer Seam Dive)' : pitchTriggered ? 'PITCH TO 2 (31 Veer Backfield Pitch)' : '1 KEEPER (31 Veer Inside Cut)')
            : outcomeLabel,
          expectedYards: diveGive ? '+7.0 Yds (Vertical Seam)' : pitchTriggered ? '+14.5 Yds (Perimeter Sideline Break)' : '+9.5 Yds (Inside Shoulder Seam)',
          coachingExplanation: diveGive
            ? (diveBehavior === 'upfield'
              ? '#1 Dive Key executed a Bull Rush into the line — 1 leaves ball in stomach of playside dive back aiming for the backside hip of playside OG and OT.'
              : 'Playside dive back aimed for the backside hip of playside OG and OT and attacked downhill through the seam. #1 Dive Key sat/widened, so 1 gave the ball cleanly.')
            : pitchTriggered
            ? '#1 Dive Key crashed with a full commit on the dive. 1 pulled into the backfield. When #2 Pitch Key committed to 1 in the backfield, 1 pitched cleanly backward/laterally in the backfield to the 4x4 pitch back, who secured it before exploding down the sideline.'
            : '#1 Dive Key crashed with a full commit on the dive. 1 pulled into the backfield. When #2 Pitch Key committed to the 3-back by feathering wide, 1 planted in the backfield and cut vertically upfield inside him.',
        },
      };
    },
  },

  // 2. OUTSIDE VEER (24/33 VEER)
  {
    id: '24-outside-veer',
    code: '24 VEER',
    name: '24/33 Veer',
    subtitle: 'RT & RG Down-Block Interior — Y Releases Inside to LB — Reads EMLOS (#1) & Corner (#2)',
    seriesTag: 'Core 02',
    playType: 'Triple Option',
    targetGap: 'Playside B-Gap (Dive) / D-Alley',
    primaryReadLabel: '#1 Dive Key (EMLOS 7/9-Tech Defensive End)',
    secondaryReadLabel: '#2 Pitch Key (Playside Corner / Alley Force)',
    summary:
      'The essential companion to Inside Veer (24 Veer to the right, 33 Veer to the left). Outside Veer attacks the B-gap dive track between Guard and Tackle: RT and RG down-block the interior defensive front, Y inside veer-releases to the Linebacker, and 1 reads the EMLOS (#1). If #1 crashes with a full commit, 1 pulls into the backfield and options #2; the pitch occurs in the backfield (never a forward pitch) when #2 commits to 1.',
    whenToCall:
      'When the defense stacks the A-gap or plays a heavy interior front who pinches inside against Inside Veer.',
    qbDecisionMatrix: {
      crashPull: 'If #1 (EMLOS End) crashes with a full commit on the B-gap dive → 1 pulls into the backfield and options #2 along the perimeter.',
      squeezeGive: 'If #1 (EMLOS End) widens, sits square, or Bull Rushes → GIVE to playside dive back diving through B-gap off down blocks.',
      pitchPhase: 'When #2 read commits to 1 in the backfield → 1 pitches backward/laterally to backside pitch back in the backfield (never a forward pitch); if #2 commits to 3 by staying wide → 1 keeps and turns vertically upfield inside him.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Down-Block Angle Leverage',
        detail: 'Playside Tackle and Guard fire out with aggressive 45° down-blocks to wash the interior defensive lineman inside.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: 4:30 Step, B-Gap Dive Mesh & EMLOS Read',
        detail: 'Playside dive back takes track to Guard outside hip (B-Gap). Y releases inside past DE to linebacker. 1 reads EMLOS (#1).',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: Backfield Pitch Execution & 5x2 Spacing',
        detail: 'If EMLOS crashes with a full commit, 1 pulls into the backfield. When #2 commits to 1 in the backfield, 1 pitches backward/laterally in the backfield to the pitch back.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: Perimeter Strike & Alley Finish',
        detail: 'Pitch back secures the pitch in the backfield and accelerates down the sideline, or 1 keeper cuts upfield inside #2.',
      },
    ],
    positionRules: OUTSIDE_VEER_POSITION_RULES,
    getOffensivePaths: (_front, diveBehavior, pitchBehavior, eleventhMode, xMode = 'tight_x', zSide = 'right', targetSide = 'right') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode, zSide);
      const diveGive = diveBehavior !== 'crash';
      const qbKeep = !diveGive && pitchBehavior === 'feather_pitch';
      const pitchTriggered = !diveGive && pitchBehavior === 'commit_qb';

      const finalCarrier = diveGive ? 'RH' : pitchTriggered ? 'LH' : 'QB';
      const outcomeLabel = diveGive
        ? 'GIVE TO 2 (24 Veer B-Gap Dive)'
        : pitchTriggered
        ? 'PITCH TO 3 (24 Veer Backfield Pitch)'
        : '1 KEEPER (24 Veer Inside Cut)';

      const rawPaths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }> = {
        C: { role: 'block_scoop', points: [base.C, { x: 504, y: 350 }, { x: 492, y: 318 }] },
        RG: { role: 'block_down', points: [base.RG, { x: 532, y: 348 }, { x: 525, y: 318 }] },
        RT: { role: 'block_down', points: [base.RT, { x: 574, y: 350 }, { x: 560, y: 315 }] },
        YTE: { role: 'block_veer', points: [base.YTE, { x: 618, y: 344 }, { x: 585, y: 278 }] },
        LG: { role: 'block_scoop', points: [base.LG, { x: 468, y: 354 }, { x: 448, y: 295 }] },
        LT: { role: 'block_scoop', points: [base.LT, { x: 418, y: 352 }, { x: 412, y: 318 }] },
        XTE: {
          role: 'block_veer',
          points: xMode === 'wide_x'
            ? [base.XTE, { x: 190, y: 340 }, { x: 240, y: 260 }]
            : [base.XTE, { x: 408, y: 325 }, { x: 488, y: 195 }],
        },
        W: { role: 'block_veer', points: [base.W, { x: base.W.x + 35, y: 330 }, { x: 760, y: 260 }] },
        // RH is playside back on 24 Veer -> DIVE BACK into B-Gap
        RH: {
          role: 'dive',
          points: diveGive
            ? [
                base.RH,
                { x: 570, y: 445 },
                { x: 574, y: 410 }, // meshes with 1 in backfield
                { x: 574, y: 345 }, // attacks B-gap across LOS
                { x: 574, y: 245 },
                { x: 574, y: 155 },
              ]
            : [
                base.RH,
                { x: 570, y: 445 },
                { x: 574, y: 410 }, // full commit tackle by crashing #1 EMLOS
                { x: 574, y: 375 },
                { x: 574, y: 360 },
                { x: 574, y: 350 },
              ],
        },
        // QB is 1-Back: meshes at B-gap; if pulling, attacks #2 in backfield; pitches in backfield when #2 commits to 1
        QB: {
          role: 'qb',
          points: diveGive
            ? [
                base.QB,
                { x: 566, y: 430 },
                { x: 570, y: 410 }, // meshes with dive back
                { x: 635, y: 410 }, // option fake in backfield
                { x: 675, y: 395 },
                { x: 700, y: 380 },
              ]
            : qbKeep
            ? [
                base.QB,
                { x: 566, y: 430 },
                { x: 570, y: 410 }, // pulls ball
                { x: 650, y: 404 }, // attacks #2 in backfield; #2 commits wide to 3-back
                { x: 650, y: 280 }, // 1 plants and cuts vertically upfield inside #2
                { x: 650, y: 155 },
              ]
            : [
                base.QB,
                { x: 566, y: 430 },
                { x: 570, y: 410 }, // pulls ball
                { x: 650, y: 404 }, // attacks #2 in backfield; #2 commits to 1 in backfield
                { x: 654, y: 404 }, // pitches ball in backfield and absorbs tackle
                { x: 656, y: 404 },
              ],
        },
        // LH is backside back on 24 Veer -> PITCH BACK; pitch happens IN THE BACKFIELD (never forward pitch)
        LH: {
          role: 'pitch',
          points: pitchTriggered
            ? [
                base.LH,
                { x: 535, y: 476 },
                { x: 630, y: 450 },
                { x: 710, y: 420 }, // receives pitch in backfield (deeper and wider than QB at 650, 404)!
                { x: 745, y: 295 }, // turns upfield across LOS along sideline
                { x: 775, y: 155 },
              ]
            : [
                base.LH,
                { x: 535, y: 476 },
                { x: 630, y: 450 },
                { x: 710, y: 420 },
                { x: 735, y: 380 },
                { x: 755, y: 335 },
              ],
        },
      };

      const paths = targetSide === 'left' ? mirrorPaths(rawPaths) : rawPaths;

      return {
        paths,
        ballCarrierSequence: {
          diveGive,
          qbKeep,
          pitchTriggered,
          finalCarrier: targetSide === 'left' ? (finalCarrier === 'RH' ? 'LH' : finalCarrier === 'LH' ? 'RH' : 'QB') : finalCarrier,
          outcomeLabel: targetSide === 'left'
            ? (diveGive ? 'GIVE TO 3 (33 Veer B-Gap Dive)' : pitchTriggered ? 'PITCH TO 2 (33 Veer Backfield Pitch)' : '1 KEEPER (33 Veer Inside Cut)')
            : outcomeLabel,
          expectedYards: diveGive ? '+7.5 Yds (Off-Guard B-Gap)' : pitchTriggered ? '+16.0 Yds (Sideline Strike)' : '+9.5 Yds (1 Keeper)',
          coachingExplanation: diveGive
            ? (diveBehavior === 'upfield'
              ? '#1 EMLOS End executed a Bull Rush — 1 leaves ball in playside dive back\'s stomach as dive back creases through the B-gap off down blocks.'
              : 'EMLOS End widened or sat flat — playside dive back hits B-gap crease off down block for big yards.')
            : pitchTriggered
            ? '#1 EMLOS End crashed with a full commit on the B-gap dive. 1 pulled into the backfield. When #2 read committed to 1 in the backfield, 1 pitched cleanly backward/laterally in the backfield to the pitch back, who secured it before sprinting down the sideline.'
            : '#1 EMLOS End crashed with a full commit on the dive. 1 pulled into the backfield. When #2 read stayed wide to cover the pitch back, 1 kept in the backfield and cut upfield inside him.',
        },
      };
    },
  },

  // 3. TRAP (20/30 TRAP)
  {
    id: '20-trap',
    code: '20 TRAP',
    name: '20/30 Trap',
    subtitle: 'Center Seals NT/DT to Backside — 1 Spins 180° Fake — Fake Runs Through B-Gap Off Strong OT Hip to Backer — Primary RB Pitch-Fake Step & Mesh',
    seriesTag: 'Core 03',
    playType: 'Misdirection Trap',
    targetGap: 'Playside 0-Hole / A-Gap Quick Trap',
    primaryReadLabel: 'Center Backside Seal & Pulling Guard Trap Kickout',
    secondaryReadLabel: 'Interior DL Penetration / LB Flow',
    summary:
      'The signature 20/30 Trap misdirection play (20 Trap to the right, 30 Trap to the left). The Center engages the NT or DT right in front of him and seals him to the backside. 1-back takes the snap and spins 180 degrees to fake to the off RB sweeping behind 1. The fake runner continues downhill running through the B-gap off the Strong OT hip and climbs to block the linebacker. Meanwhile, the primary RB takes one large step as if running for a pitch to his outside, then comes back to 1 for the mesh handoff and explodes through the trap seam behind the pulling Guard\'s kickout block.',
    whenToCall:
      'When defensive tackles penetrate aggressively upfield or linebackers flow hard to outside veer/pitch flow.',
    qbDecisionMatrix: {
      crashPull: 'Center seals to the backside with the NT or DT right in front of him. Backside Guard pulls flat behind Center to kick out trap defender.',
      squeezeGive: '1-back spins 180° to fake to off RB; the fake runs through the B-gap off the Strong OT hip and climbs to the linebacker. Primary RB takes pitch-fake step outside, then comes back to 1 for the mesh.',
      pitchPhase: 'Primary RB secures direct mesh handoff from 1 and explodes through the quick trap seam into the secondary.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Center Backside Seal & 180° Spin Fake',
        detail: 'Center seals to the backside with the NT or DT right in front of him. 1-back takes snap and executes a rapid 180° spin to fake to off RB sweeping behind 1.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.50],
        title: 'Phase 2: Fake B-Gap Track & Primary RB Pitch-Fake Step',
        detail: 'The fake runner attacks downhill running through the B-gap off the Strong OT hip and climbs to backer. Primary RB takes one large explosive step to his outside as if running for a pitch.',
      },
      {
        phase: 3,
        timeRange: [0.50, 0.70],
        title: 'Phase 3: Backfield Mesh & Trap Kickout',
        detail: 'Primary RB comes back to 1 for the mesh handoff. Pulling Guard kicks out the penetrated lineman to blow open the trap lane.',
      },
      {
        phase: 4,
        timeRange: [0.70, 1.0],
        title: 'Phase 4: North-South Trap Burst',
        detail: 'Primary RB secures handoff and explodes vertically through the trap seam into the second level.',
      },
    ],
    positionRules: TRAP_POSITION_RULES,
    getOffensivePaths: (_front, _diveBehavior, _pitchBehavior, eleventhMode, xMode = 'tight_x', zSide = 'right', targetSide = 'right') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode, zSide);

      const rawPaths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }> = {
        // Center seals to the backside with the NT or DT right in front of him
        C: { role: 'block_down', points: [base.C, { x: 496, y: 362 }, { x: 472, y: 338 }] },
        // Backside Guard pulls flat across behind Center to trap/kick out penetrated lineman
        LG: { role: 'block_pull', points: [base.LG, { x: 476, y: 405 }, { x: 520, y: 400 }, { x: 555, y: 365 }, { x: 565, y: 330 }] },
        // Playside Guard releases inside to second level (LB) to let trap lineman penetrate
        RG: { role: 'block_down', points: [base.RG, { x: 536, y: 350 }, { x: 528, y: 285 }] },
        // Playside Tackle (Strong OT) climbs to second level / seals inside; fake runs off Strong OT inside hip
        RT: { role: 'block_down', points: [base.RT, { x: 596, y: 350 }, { x: 605, y: 280 }] },
        YTE: { role: 'block_down', points: [base.YTE, { x: 630, y: 350 }, { x: 615, y: 290 }] },
        LT: { role: 'block_scoop', points: [base.LT, { x: 418, y: 355 }, { x: 428, y: 325 }] },
        XTE: {
          role: 'block_veer',
          points: xMode === 'wide_x'
            ? [base.XTE, { x: 200, y: 340 }, { x: 250, y: 260 }]
            : [base.XTE, { x: 400, y: 330 }, { x: 470, y: 210 }],
        },
        W: { role: 'block_veer', points: [base.W, { x: base.W.x + 20, y: 330 }, { x: 740, y: 240 }] },
        // 1-Back (QB): takes snap, spins 180° to fake to off RB (LH) on sweep behind 1, squares to primary RB (RH) for mesh handoff, then boots away
        QB: {
          role: 'qb',
          points: [
            base.QB,
            { x: 500, y: 424 }, // takes snap, spins 180° facing backfield
            { x: 512, y: 422 }, // fakes to off RB (LH) sweeping behind 1 and turns back to primary RB
            { x: 518, y: 418 }, // meets primary RB (RH) at mesh point for clean handoff
            { x: 460, y: 435 }, // bootleg fake away to freeze backside contain
            { x: 400, y: 415 },
          ],
        },
        // Off RB (LH on 20 Trap, The Fake): runs sweep behind 1, takes 180° fake, runs through B-gap off Strong OT hip, and climbs to backer
        LH: {
          role: 'dive',
          points: [
            base.LH,
            { x: 468, y: 448 }, // accelerates on sweep track
            { x: 504, y: 430 }, // sweeps tightly behind 1 taking 180° spin fake
            { x: 580, y: 395 }, // bends downhill aiming off the Strong OT (RT) hip
            { x: 584, y: 340 }, // runs through B-gap off Strong OT hip across LOS
            { x: 576, y: 220 }, // climbs to second level and locks onto linebacker
          ],
        },
        // Primary RB (RH on 20 Trap): takes one large step as if running for pitch to outside, then comes back to 1 for the mesh
        RH: {
          role: 'dive',
          points: [
            base.RH,
            { x: 620, y: 478 }, // one large step as if running for a pitch to his outside right!
            { x: 558, y: 445 }, // plants on outside foot and cuts sharply back inside toward 1
            { x: 518, y: 418 }, // meets 1 for backfield mesh and receives direct handoff
            { x: 522, y: 350 }, // bursts through trap seam opened by Center backside seal & pulling LG
            { x: 525, y: 155 }, // explosive breakaway into the secondary
          ],
        },
      };

      const paths = targetSide === 'left' ? mirrorPaths(rawPaths) : rawPaths;

      return {
        paths,
        ballCarrierSequence: {
          diveGive: true,
          qbKeep: false,
          pitchTriggered: false,
          finalCarrier: targetSide === 'left' ? 'LH' : 'RH',
          outcomeLabel: targetSide === 'left' ? 'DIRECT HANDOFF TO 3 (30 Trap)' : 'DIRECT HANDOFF TO 2 (20 Trap)',
          expectedYards: '+11.5 Yds (Quick Trap Seam)',
          coachingExplanation:
            'The Center sealed to the backside with the NT/DT right in front of him. 1-back spun 180° to fake to the off RB, who ran through the B-gap off the Strong OT hip and climbed to the linebacker. Primary RB took one large pitch-fake step outside, then came back to 1 for the mesh, taking the handoff and bursting through the trap seam behind the pulling Guard\'s kickout block.',
        },
      };
    },
  },

  // 4. POWER (34/23 POWER)
  {
    id: '34-power',
    code: '34 POWER',
    name: '34/23 Power',
    subtitle: 'Runner Takes Hesitation Step Before Running to Allow Guard to Clear Lane — Lead ISO Block',
    seriesTag: 'Core 04',
    playType: 'Power',
    targetGap: 'Playside 4-Hole / 3-Hole (Off-Tackle Power Tunnel)',
    primaryReadLabel: 'No Read — Backside Guard Kickout Pull on Edge',
    secondaryReadLabel: 'Lead Blocker ISO on Playside Linebacker',
    summary:
      'The classic Split Back 34/23 Power run (34 Power to the right, 23 Power to the left). The ball runner (3 / LH on 34 Power; 2 / RH on 23 Power) takes a deliberate hesitation step in the backfield before running to allow the pulling Guard (LG on 34 Power; RG on 23 Power) to clear the running lane. 3 secures the direct handoff at 4:30 and presses downhill into the 4-hole (C-gap) behind LG\'s kickout block and RH\'s lead block.',
    whenToCall:
      'Short yardage (3rd & 2, Goal Line), bad weather when option pitching is risky, or whenever defensive ends play soft/feathered.',
    qbDecisionMatrix: {
      crashPull: 'No option read — QB opens at 4:30 and seats the ball firmly into runner\'s stomach deep in backfield.',
      squeezeGive: 'Runner takes hesitation step to let pulling guard clear, secures handoff in backfield, and cuts vertically inside kickout block.',
      pitchPhase: 'QB carries out naked bootleg fake away to freeze backside pursuit.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Gap-Down-Backer Wall & Guard Pull',
        detail: 'Linemen block down hard inside. Backside Guard skip-pulls flat across Center. Runner takes hesitation step.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: Hesitation Step & Deep Backfield Handoff',
        detail: 'Runner takes deliberate hesitation step in backfield to allow Guard to clear running lane, then secures handoff at 4:30.',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: Guard Kickout Collision on Edge',
        detail: 'Pulling Guard kicks out the edge defender with inside shoulder, opening the power tunnel.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: North-South Power Finish',
        detail: 'Runner follows lead block into secondary with high-and-tight ball security.',
      },
    ],
    positionRules: POWER_POSITION_RULES,
    getOffensivePaths: (_front, _diveBehavior, _pitchBehavior, eleventhMode, xMode = 'tight_x', zSide = 'right', targetSide = 'right') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode, zSide);
      const rawPaths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }> = {
        C: { role: 'block_down', points: [base.C, { x: 488, y: 350 }, { x: 480, y: 320 }] },
        RG: { role: 'block_down', points: [base.RG, { x: 536, y: 348 }, { x: 528, y: 318 }] },
        RT: { role: 'block_down', points: [base.RT, { x: 574, y: 350 }, { x: 560, y: 316 }] },
        YTE: { role: 'block_down', points: [base.YTE, { x: 616, y: 350 }, { x: 602, y: 320 }] },
        LG: {
          role: 'block_pull',
          points: [base.LG, { x: 508, y: 418 }, { x: 602, y: 412 }, { x: 652, y: 382 }, { x: 668, y: 340 }],
        },
        LT: { role: 'block_scoop', points: [base.LT, { x: 412, y: 354 }, { x: 408, y: 318 }] },
        XTE: {
          role: 'block_veer',
          points: xMode === 'wide_x'
            ? [base.XTE, { x: 195, y: 340 }, { x: 245, y: 265 }]
            : [base.XTE, { x: 415, y: 325 }, { x: 488, y: 195 }],
        },
        W: { role: 'block_veer', points: [base.W, { x: base.W.x + 22, y: 332 }, { x: 745, y: 265 }] },
        // LH is ball runner on 34 Power: hesitation step in backfield to allow LG to clear running lane!
        LH: {
          role: 'dive',
          points: [
            base.LH,
            { x: 422, y: 488 }, // deliberate hesitation step in backfield while pulling LG clears
            { x: 492, y: 440 }, // meeting QB at 4:30 backfield mesh, securing handoff
            { x: 575, y: 405 }, // pressing downhill behind LG pull & RH lead
            { x: 618, y: 348 }, // bursting through 4-hole off-tackle
            { x: 628, y: 165 }, // North-South finish
          ],
        },
        QB: {
          role: 'qb',
          points: [
            base.QB,
            { x: 498, y: 424 }, // opens hips at 4:30, holds ball out into mesh line
            { x: 492, y: 440 }, // meeting runner at mesh point for direct handoff
            { x: 435, y: 448 }, // bootleg fake away to backside
            { x: 375, y: 440 },
            { x: 310, y: 380 },
          ],
        },
        RH: {
          role: 'block_veer',
          points: [base.RH, { x: 588, y: 420 }, { x: 615, y: 348 }, { x: 610, y: 280 }],
        },
      };

      const paths = targetSide === 'left' ? mirrorPaths(rawPaths) : rawPaths;

      return {
        paths,
        ballCarrierSequence: {
          diveGive: true,
          qbKeep: false,
          pitchTriggered: false,
          finalCarrier: targetSide === 'left' ? 'RH' : 'LH',
          outcomeLabel: targetSide === 'left' ? 'DIRECT HANDOFF TO 2 (23 Power Off-Tackle)' : 'DIRECT HANDOFF TO 3 (34 Power Off-Tackle)',
          expectedYards: '+8.0 Yds (Down-Block Wall + Kickout)',
          coachingExplanation:
            'Ball runner took a deliberate hesitation step in the backfield before running to allow the pulling Guard to clear the running lane, then accelerated downhill inside the kickout block.',
        },
      };
    },
  },

  // 5. FLOOD (36/35 FLOOD)
  {
    id: '324-power-pass',
    code: '36 FLOOD',
    name: '36/35 Flood',
    subtitle: 'Play-Action Flood — Z Post Corner · Y 7-Yd Whip Out · 3 Back Block SDE & Release Arrow · 2 Back Block Backside DE (2 Count) & Release Flat · RG Pull to Backside DE · RT Inside Shift · X Post',
    seriesTag: 'Core 05',
    playType: 'Play-Action Pass',
    targetGap: 'Flood Concept (1: RB Arrow Flat / 2: Y 7-Yd Whip Out / 3: Z Post Corner)',
    primaryReadLabel: 'Progression: 1) RB Arrow ➔ 2) Y 7-Yd Whip Out',
    secondaryReadLabel: '3rd Read: Z Post Corner | Checkdown: 2 Flat / Backside: X Post',
    summary:
      'The 36/35 Flood play-action passing concept (36 Flood to the right, 35 Flood to the left) off the power look. QB progression reads: 1) RB on Arrow route into the flat to challenge edge leverage immediately, 2) Y on 7-yd Whip Out snapping back out to the sideline, and 3) Z on Post Corner stretching deep coverage. 2 back protects backside then checks into flat. Backside guard pulls across to stone backside DE.',
    whenToCall:
      'When the defense bites hard on 24 Power run action or stacks the box against Veer, leaving perimeter zones vulnerable to flood overload.',
    qbDecisionMatrix: {
      crashPull: 'Play-action fake, 3-step gather drop behind RT inside pass pro.',
      squeezeGive: '1st Read: RB on the Arrow route releasing into flat to create immediate horizontal conflict on edge defender.',
      pitchPhase: '2nd Read: Y on the 7-yard Whip Out pivoting away from collapsing linebackers; 3rd Read: Z on Post Corner.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Power Fake & Pass Pro Setup',
        detail: 'O-line sets: RG pulls to backside DE, RT shifts inside for pass pro, 2 back attacks outside shoulder of backside DE for a 2 count, and 3 back attacks outside shoulder of SDE before releasing arrow.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: Route Stems & Dual Flat Releases',
        detail: 'Y drives 7 yards, X drives directly at outside shoulder of CB before going post, Z stems vertical on post move, 3 back releases arrow to right flat, and 2 back releases to left flat.',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: Route Breaks & Progression Timing',
        detail: 'QB progression: 1) RB on Arrow route into flat ➔ 2) Y on 7-yd Whip Out ➔ 3) Z on Post Corner.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: High-Percentage Strike & RAC',
        detail: 'QB delivers in rhythm to RB on the Arrow or Y snapping whip out to sideline, with Z over the top.',
      },
    ],
    positionRules: FLOOD_POSITION_RULES,
    getOffensivePaths: (_front, _diveBehavior, _pitchBehavior, eleventhMode, xMode = 'tight_x', zSide = 'right', targetSide = 'right') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode, zSide);

      const rawPaths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }> = {
        C: { role: 'block_down', points: [base.C, { x: 500, y: 368 }] },
        // RG pulls to backside DE
        RG: {
          role: 'block_pull',
          points: [base.RG, { x: 490, y: 405 }, { x: 420, y: 400 }, { x: 375, y: 355 }],
        },
        // RT shifts for inside pass pro
        RT: {
          role: 'block_down',
          points: [base.RT, { x: base.RT.x - 14, y: 365 }],
        },
        LG: {
          role: 'block_down',
          points: [base.LG, { x: 460, y: 368 }],
        },
        LT: {
          role: 'block_down',
          points: [base.LT, { x: 410, y: 368 }],
        },
        // Y is running 7 yard whip out (drives up 7 yds, breaks in 2 steps, whips out to sideline)
        YTE: {
          role: 'route_pass',
          points: [
            base.YTE,
            { x: 630, y: 320 },
            { x: 625, y: 280 },
            { x: 605, y: 272 },
            { x: 660, y: 265 },
            { x: 720, y: 260 },
          ],
        },
        // X drives directly at outside shoulder of left side CB before going post
        XTE: {
          role: 'route_pass',
          points: [base.XTE, { x: 195, y: 310 }, { x: 185, y: 260 }, { x: 420, y: 145 }],
        },
        // Z - post corner (stems vertical 10 yds, fakes post inside to freeze safety, cuts to corner pylon)
        W: {
          role: 'route_pass',
          points: [
            base.W,
            { x: base.W.x + 8, y: 300 },
            { x: base.W.x - 18, y: 220 },
            { x: base.W.x + 38, y: 135 },
          ],
        },
        // 3 back blocking outside shoulder of SDE then releasing arrow
        LH: {
          role: 'route_pass',
          points: [
            base.LH,
            { x: 575, y: 410 },
            { x: 650, y: 365 },
            { x: 730, y: 350 },
            { x: 800, y: 325 },
          ],
        },
        QB: {
          role: 'qb',
          points: [base.QB, { x: 508, y: 420 }, { x: 506, y: 445 }, { x: 506, y: 450 }],
        },
        // 2 back attacking outside shoulder of backside DE for a 2 count then releasing to flats
        RH: {
          role: 'route_pass',
          points: [
            base.RH,
            { x: 480, y: 425 },
            { x: 370, y: 385 },
            { x: 355, y: 365 },
            { x: 260, y: 345 },
            { x: 190, y: 330 },
          ],
        },
      };

      const paths = targetSide === 'left' ? mirrorPaths(rawPaths) : rawPaths;

      return {
        paths,
        ballCarrierSequence: {
          diveGive: false,
          qbKeep: false,
          pitchTriggered: false,
          finalCarrier: targetSide === 'left' ? 'XTE' : 'YTE',
          outcomeLabel: targetSide === 'left' ? '35 FLOOD PASS TO X (7-Yd Whip Out)' : '36 FLOOD PASS TO Y (7-Yd Whip Out)',
          expectedYards: targetSide === 'left' ? '+18.0 Yds (Double Tight Left 35 Flood)' : '+18.0 Yds (Double Tight Right 36 Flood)',
          coachingExplanation:
            'Play-action flood concept off the power look. Backside guard pulled to backside DE, RT shifted inside, 3 back chipped SDE before releasing arrow, and 2 back attacked outside shoulder of backside DE for a 2 count before releasing to the flat. Y whipped open to the sideline while Z stretched deep on the post corner and X threatened the CB before cutting post.',
        },
      };
    },
  },
];

// Helper to mirror points and paths horizontally across X = 500
function mirrorPoints(points: Point[]): Point[] {
  return points.map((p) => ({ x: 1000 - p.x, y: p.y }));
}

function mirrorPaths(
  paths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }>
): Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }> {
  const mirrored: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }> = {};

  const swapMap: Record<string, string> = {
    C: 'C',
    QB: 'QB',
    RG: 'LG',
    LG: 'RG',
    RT: 'LT',
    LT: 'RT',
    YTE: 'XTE',
    XTE: 'YTE',
    RH: 'LH',
    LH: 'RH',
    W: 'W',
  };

  for (const [key, val] of Object.entries(paths)) {
    const targetKey = swapMap[key] || key;
    mirrored[targetKey] = {
      role: val.role,
      points: mirrorPoints(val.points),
      label: val.label,
    };
  }

  return mirrored;
}

export const PRACTICE_DRILLS: PracticeDrill[] = [
  {
    id: 'drill-mesh-ride',
    title: '01. Inside & Outside Veer QB-Back Mesh Lab',
    durationMin: 10,
    playersInvolved: 'QBs, Left Halfbacks (LH), Right Halfbacks (RH), 1 Coach as Read Key',
    equipment: '3 Footballs, 3 Cones (B-gap & C-gap landmarks), 1 Coaching Towel',
    objective: 'Master both the 22/31 Veer (Playside OG/OT Backside Hip track / #1 DT read) and Outside Veer (24/33 Veer / #1 EMLOS read) meshes without ever looking down at the football.',
    setupSteps: [
      'Set cones for Center, Right Guard, and Right Tackle splits.',
      'Reps 1–5: 22/31 Veer track (Playside dive back aims for backside hip of playside OG and OT, attacking downhill through seam; 1 meshes at seam off backside hip of OG; backside back tracks tackle outside hip keeping 4x4 pitch spacing).',
      'Reps 6–10: Outside Veer track (Playside dive back aims into Guard-Tackle B-gap seam on 24/33 Veer, Coach stands on #1 EMLOS outside RT, backside back works wider pitch trail).',
    ],
    coachingPoints: [
      'Dive Back soft pocket shelf: top arm parallel to ground, eyes up field.',
      'QB rides from back hip to front hip with eyes locked on Coach\'s shoulders.',
      'Sprint 10 yards out of every fake so defense never knows who has the ball.',
    ],
    levelProgression: {
      beginner: 'Pre-call "Give" or "Keep" before snap so players master footwork tracks and mesh timing.',
      intermediate: 'Live #1 Crash vs Sit towel read at walking tempo, accelerating to full game speed.',
      advanced: 'Add #2 Pitch Key defender so QB executes both Dive Read and Pitch Phase in one live rep against rapid reaction.',
    },
  },
  {
    id: 'drill-power-pull-kick',
    title: '02. Power Pull-and-Kick Pod (LG Pull + RH Lead)',
    durationMin: 12,
    playersInvolved: 'Guards, Tackles, Tight Ends, Halfbacks + 2 Hand Shields',
    equipment: '2 Hand Shields, 4 Alignment Cones (3-ft splits)',
    objective: 'Train the Backside Guard (LG) flat skip-pull and kickout collision, paired with the Right Halfback (RH) lead block on the linebacker.',
    setupSteps: [
      'Align RT and YTE against a shield on the DE (down-block drill).',
      'Position LG at Backside Guard spot and RH at Right Halfback spot.',
      'On snap: RT/YTE down-block, LG pulls flat across and kicks out the edge shield, RH leads through C-gap to fit the linebacker shield.',
    ],
    coachingPoints: [
      'LG must stay tight to the backsides of the down-blockers — no looping deep.',
      'LG delivers kickout with inside shoulder, head on the upfield side.',
      'RH accelerates through the hole without hesitation to isolate the linebacker.',
    ],
    levelProgression: {
      beginner: 'Walk-through cadence focusing on LG taking flat skip steps without crossing feet.',
      intermediate: 'Full-speed fit-and-freeze contact on hand shields with proper pad leverage.',
      advanced: 'Live read where edge defender either spills inside or widens outside, forcing LG to kick or log.',
    },
  },
  {
    id: 'drill-power-pass-pop',
    title: '03. 36 Flood Play-Action Timing & Route Progression Drill',
    durationMin: 10,
    playersInvolved: 'QBs, Tight Ends (YTE), Wideouts (Z/X), Halfbacks (LH/RH)',
    equipment: '3 Footballs, 4 Sideline Cones, 2 Pass Rush Dummies',
    objective: 'Train the 36/35 Flood pass protection and rhythm passing: 1) RB arrow release to flat, 2) Y 7-yd whip out, 3) Z post-corner.',
    setupSteps: [
      'Align QB, LH, RH, YTE, Z, and X in 36/35 Flood formation.',
      'Dummy on SDE for 3-back to strike before releasing arrow to flat; backside dummy for RG pull pickup.',
      'On snap: Play-action fake, RG pulls to backside DE, 2-back attacks outside shoulder of backside DE for 2 count then releases to flat, RT shifts inside, 3-back releases on arrow to flat, Y drives 7 yards and whips out.',
    ],
    coachingPoints: [
      '3-back chip SDE outside shoulder then burst into flat on Arrow route.',
      'Y drive hard 7 yards, sell inside 2 steps, then snap whip out to the sideline.',
      'Z sell the post move with eyes and shoulders before cutting 45° to the corner pylon.',
      'QB progression rhythm: fake run, 3-step drop, read 1) RB Arrow in flat ➔ 2) Y snapping whip out to sideline ➔ 3) Z.',
    ],
    levelProgression: {
      beginner: 'Routes-on-air focusing on RB arrow timing into flat and Y whip out break at exactly 7 yards.',
      intermediate: 'Add linebackers and cornerbacks to read run vs pass and test QB flood progression.',
      advanced: 'Live 7-on-7 against Cover 2 and Cover 3 secondary looks.',
    },
  },
];

function adaptPositionRulesForTargetSide(
  rules: Record<string, PlayerPositionRule>,
  concept: OffensiveConcept,
  targetSide: TargetSide
): Record<string, PlayerPositionRule> {
  if (targetSide === 'right') return rules;

  const adapted: Record<string, PlayerPositionRule> = {};
  for (const [pid, rule] of Object.entries(rules)) {
    let newAiming = rule.aimingPoint;
    let newFootwork = rule.footwork;
    let newCue = rule.coachingCue;

    if (concept === 'inside_veer') {
      if (pid === 'LH') {
        newAiming = 'Backside Hip of Playside OG (LG) & OT (LT) ➔ Seam Attack';
        newFootwork = 'Downhill track aiming directly at the backside hip of playside OG (LG) and playside OT (LT); soft pocket shelf; attack downhill through seam.';
        newCue = 'Dive Back (Playside): Aim for backside hip of playside OG and OT, attacking downhill through the seam on 31 Veer.';
      } else if (pid === 'RH') {
        newAiming = 'Track Outside Hip of Playside Tackle — 4x4-Yard Pitch Spacing';
        newFootwork = 'Crossover step left, track outside hip of playside tackle, keeping 4x4-yard pitch spacing outside left edge.';
        newCue = 'Pitch Back (Backside): Track outside hip of playside tackle, keeping 4x4-yard pitch spacing on 31 Veer.';
      } else if (pid === 'QB') {
        newAiming = 'Playside Left Seam Mesh Point off Backside Hip of Playside OG ➔ Attack Pitch Key Inside Shoulder';
        newFootwork = 'Mesh at left seam off backside hip of playside OG reading dive key; if pulling, attack pitch key inside shoulder.';
        newCue = '1-Back (QB): Mesh at seam off backside hip of playside OG, read dive key; if pulling, attack pitch key inside shoulder on 31 Veer.';
      } else if (pid === 'LT') {
        newAiming = 'Inside Veer Release past #1 Dive Key to Will/Mike LB';
        newCue = 'Rip past #1 without contact directly to the second level.';
      } else if (pid === 'LG') {
        newAiming = 'Inside number of playside DT or 0-Tech Nose hip';
      } else if (pid === 'RT') {
        newAiming = 'Backside Cutoff';
      }
    } else if (concept === 'outside_veer') {
      if (pid === 'LH') {
        newAiming = 'Playside B-Gap (LG Outside Hip)';
        newFootwork = 'Downhill 4:30 track to LG outside hip; press B-gap seam.';
        newCue = '3-Back (Playside Dive Back): Hit the LG outside hip (B-Gap) full speed on 33 Veer.';
      } else if (pid === 'RH') {
        newAiming = 'Left Sideline Pitch Track';
        newFootwork = 'Crossover step left, sprint across backfield to wide 5x2 pitch trail outside left edge.';
        newCue = '2-Back (Backside Pitch Back): Wider pitch track outside the left numbers on 33 Veer.';
      } else if (pid === 'LT') {
        newAiming = 'Heavy Down Block on Defensive Tackle';
      }
    } else if (concept === 'power') {
      if (pid === 'RH') {
        newAiming = 'Hesitation Step ➔ Playside Left 3-Hole (C-Gap) behind Pulling RG & Lead LH';
        newFootwork = 'Take a deliberate hesitation step in the backfield to allow pulling RG to clear running lane, secure handoff at 4:30, and burst downhill.';
        newCue = '2-Back (Ball Runner): Hesitation step first to let RG clear the lane on 23 Power, then hit the 3-hole.';
      } else if (pid === 'LH') {
        newAiming = 'Lead through Left 3-Hole — Isolate Playside LB';
        newCue = '3-Back: Lead blocker on 23 Power — isolate and drive the linebacker.';
      } else if (pid === 'RG') {
        newAiming = 'Skip-Pull Flat Left across Center — Kick Out Left Edge';
        newCue = 'Backside RG: Skip-pull flat left, kick out edge defender with inside shoulder.';
      } else if (pid === 'QB') {
        newAiming = 'Direct Handoff to 2 at 4:30 ➔ Bootleg Fake Right';
        newCue = 'Seat ball deep into 2; sprint out naked bootleg fake right.';
      }
    } else if (concept === 'trap' || concept === 'counter') {
      if (pid === 'LH') {
        newAiming = 'Pitch-Fake Step Outside Left ➔ Cutback to 1 for Mesh ➔ Left Trap Seam';
        newFootwork = 'Take one large explosive step to your outside left as if running for a pitch, plant hard on outside foot, cut back sharply to 1 for the mesh handoff, then accelerate through the left trap seam.';
        newCue = '3-Back (Primary RB): One large step as if running for pitch to outside, then come back to 1 for the mesh and burst through the trap on 30 Trap.';
      } else if (pid === 'RH') {
        newAiming = 'Sweep Behind 1 ➔ Take 180° Fake ➔ Attack Left B-Gap Off Strong LT Hip ➔ Climb to Backer';
        newFootwork = 'Sprint on sweep track crossing tightly behind 1, take 180° spin fake, bend downhill through left B-gap off Strong LT hip, and climb to block second-level linebacker.';
        newCue = '2-Back (The Fake): Sweep behind 1, take 180° spin fake, run through B-gap off Strong LT hip, and climb to backer on 30 Trap.';
      } else if (pid === 'C') {
        newAiming = 'Engage NT/DT Right in Front ➔ Seal to Right Backside';
        newCue = 'Center: Seal to the backside with the NT or DT right in front of you — wall off backside penetration on 30 Trap.';
      } else if (pid === 'RG') {
        newAiming = 'Pull Flat Left behind Center — Kick Out Left Trap Lineman';
        newCue = 'Backside RG: Pull flat left behind Center\'s down block, kick out penetrated lineman on 30 Trap.';
      } else if (pid === 'QB') {
        newAiming = 'Snap ➔ 180° Spin Fake to 2 on Sweep Behind ➔ Backfield Mesh with 3';
        newFootwork = 'Take snap, execute rapid 180° spin to fake to 2 sweeping behind 1, spin back to meet 3 returning from pitch-fake step, hand off cleanly at mesh, bootleg fake away.';
        newCue = '1-Back: Take snap, spin 180° to fake to 2 on sweep behind 1, then square to 3 for direct mesh handoff on 30 Trap.';
      }
    } else if (concept === 'flood') {
      if (pid === 'XTE') {
        newAiming = '7-Yard Whip Out (Left Sideline)';
        newCue = 'Drive 7 yards, sell inside 2 steps, snap whip out to left sideline.';
      } else if (pid === 'RH') {
        newAiming = 'Block Outside Shoulder of Weak DE ➔ Release Arrow to Left Flat';
      } else if (pid === 'LH') {
        newAiming = 'Attack Outside Shoulder of Right DE (2 Count) ➔ Release Right Flat';
      } else if (pid === 'LG') {
        newAiming = 'Pull to Right DE (Pass Protection Kickout)';
      }
    }

    adapted[pid] = {
      ...rule,
      aimingPoint: newAiming,
      footwork: newFootwork,
      coachingCue: newCue,
    };
  }

  return adapted;
}

export function getActivePlayDefinition(
  concept: OffensiveConcept,
  targetSide: TargetSide = 'right',
  xMode: XPlayerMode = 'tight_x',
  ySide: YAlignmentSide = 'right',
  yType: YAlignmentType = 'tight',
  zSide: ZAlignmentSide = 'right',
  zType: ZAlignmentType = 'wide',
  floodFake: FloodAction = 'none'
): PlayDefinition {
  const baseMap: Record<OffensiveConcept, PlayDefinition> = {
    inside_veer: VEER_PLAYBOOK[0],
    outside_veer: VEER_PLAYBOOK[1],
    trap: VEER_PLAYBOOK[2],
    counter: VEER_PLAYBOOK[2],
    power: VEER_PLAYBOOK[3],
    flood: VEER_PLAYBOOK[4],
  };

  const basePlay = baseMap[concept] || VEER_PLAYBOOK[0];
  const callInfo = formatOffensivePlayCall(
    concept,
    targetSide,
    xMode,
    ySide,
    yType,
    zSide,
    zType,
    floodFake
  );

  const dynamicRules = adaptPositionRulesForTargetSide(basePlay.positionRules, concept, targetSide);

  return {
    ...basePlay,
    concept,
    targetSide,
    code: `${callInfo.numberCode} ${callInfo.conceptName.toUpperCase()}`,
    name: callInfo.fullPlayCall,
    subtitle: `${callInfo.fullPlayCall} vs Defense · Target: ${callInfo.numberCode}-Hole (${targetSide === 'right' ? 'Right' : 'Left'})${floodFake !== 'none' ? ` · ${callInfo.floodFakeDesc}` : ''}`,
    positionRules: dynamicRules,
    getOffensivePaths: (front, diveBehavior, pitchBehavior, eleventhMode) =>
      basePlay.getOffensivePaths(
        front,
        diveBehavior,
        pitchBehavior,
        eleventhMode,
        xMode,
        zSide,
        targetSide,
        ySide,
        yType,
        floodFake
      ),
  };
}
