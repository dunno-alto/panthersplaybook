export type DefensiveFrontId = '5-3' | '4-4' | '6-2' | '5-2' | '4-3' | '3-4';
export type DiveKeyBehavior = 'crash' | 'squeeze' | 'upfield'; // 'upfield' is Bull Rush
export type PitchKeyBehavior = 'commit_qb' | 'feather_pitch';
export type EleventhPlayerMode = 'wide_z' | 'wing_z';
export type XPlayerMode = 'tight_x' | 'wide_x';

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
  id: '42-inside-veer' | '46-outside-veer' | '31-counter' | '24-power' | '324-power-pass';
  code: string;
  name: string;
  subtitle: string;
  seriesTag: string;
  playType: 'Triple Option' | 'Inside Read' | 'Misdirection Option' | 'Power' | 'Play-Action Pass';
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
    xMode?: XPlayerMode
  ) => {
    paths: Record<string, { role: OffensivePathDef['roleType']; points: Point[]; label?: string }>;
    ballCarrierSequence: {
      diveGive: boolean;
      qbKeep: boolean;
      pitchTriggered: boolean;
      finalCarrier: 'LH' | 'RH' | 'QB' | 'YTE';
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

// Base offensive coordinates on a 1000x620 tactical canvas
// Line of scrimmage is Y = 390. Ball is at X = 500, Y = 390.
// 3-Foot OL splits in Veer: 48px (~3 feet scaled for visual clarity)
export function getBaseOffensiveAlignment(
  eleventhMode: EleventhPlayerMode,
  xMode: XPlayerMode = 'tight_x'
): Record<string, { x: number; y: number; label: string; name: string; group: 'OL' | 'TE' | 'BACK' | 'WR' }> {
  const zPoint =
    eleventhMode === 'wing_z'
      ? { x: 676, y: 418, label: 'Z', name: 'Wing Z', group: 'WR' as const }
      : { x: 825, y: 416, label: 'Z', name: 'Wide Z', group: 'WR' as const };

  const xPoint =
    xMode === 'wide_x'
      ? { x: 175, y: 394, label: 'X', name: 'Wide X (Split End)', group: 'WR' as const }
      : { x: 356, y: 394, label: 'X', name: 'Tight X (Tight End)', group: 'TE' as const };

  return {
    XTE: xPoint,
    LT: { x: 404, y: 392, label: 'LT', name: 'Left Tackle', group: 'OL' },
    LG: { x: 452, y: 392, label: 'LG', name: 'Left Guard', group: 'OL' },
    C: { x: 500, y: 390, label: 'C', name: 'Center', group: 'OL' },
    RG: { x: 548, y: 392, label: 'RG', name: 'Right Guard', group: 'OL' },
    RT: { x: 596, y: 392, label: 'RT', name: 'Right Tackle', group: 'OL' },
    YTE: { x: 644, y: 394, label: 'Y', name: 'Y (Tight End)', group: 'TE' },
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
      { id: 'WDE', label: 'DE', name: 'Weak Defensive End (7-Tech)', x: 348, y: 348, technique: '7-Tech', weakPitchKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (4-Tech)', x: 404, y: 348, technique: '4-Tech', weakDiveKey: true },
      { id: 'NT', label: 'NT', name: 'Nose Guard (0-Tech)', x: 500, y: 348, technique: '0-Tech' },
      { id: 'SDT', label: '#1', name: 'Strong Tackle (4b/5-Tech — Inside Veer Key)', x: 598, y: 348, technique: '4b-Tech', isDiveKey: true },
      { id: 'SDE', label: '#2', name: 'Strong End (7/9-Tech — Outside Veer Key / EMLOS)', x: 658, y: 348, technique: '9-Tech', isPitchKey: true },
      { id: 'WLB', label: 'WLB', name: 'Will Linebacker', x: 424, y: 282, technique: '30-Align' },
      { id: 'MLB', label: 'MLB', name: 'Mike Linebacker', x: 500, y: 278, technique: '00-Align' },
      { id: 'SLB', label: 'SLB', name: 'Sam Linebacker', x: 582, y: 282, technique: '30-Align' },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 265, y: 285, technique: 'Contain' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 185, technique: 'Middle' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 745, y: 285, technique: 'Contain' },
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
      { id: 'WDE', label: 'DE', name: 'Weak End (5-Tech)', x: 392, y: 348, technique: '5-Tech', weakDiveKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (2i-Tech)', x: 462, y: 348, technique: '2i-Tech' },
      { id: 'SDT', label: 'DT', name: 'Strong Tackle (3-Tech)', x: 560, y: 348, technique: '3-Tech' },
      { id: 'SDE', label: '#1', name: 'Strong End (5/6-Tech — Inside Veer Key / EMLOS)', x: 616, y: 348, technique: '5-Tech', isDiveKey: true },
      { id: 'WOLB', label: 'OLB', name: 'Weak Outside LB', x: 332, y: 306, technique: 'Ghost 9', weakPitchKey: true },
      { id: 'WILB', label: 'ILB', name: 'Weak Inside LB', x: 462, y: 282, technique: 'Stack' },
      { id: 'SILB', label: 'ILB', name: 'Strong Inside LB', x: 548, y: 282, technique: 'Stack' },
      { id: 'SOLB', label: '#2', name: 'Strong Outside LB (Pitch Key / Force)', x: 678, y: 306, technique: '9-Overhang', isPitchKey: true },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 255, y: 270, technique: 'Third' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 180, technique: 'Centerfield' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 760, y: 270, technique: 'Third' },
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
      { id: 'WDE', label: 'DE', name: 'Weak Defensive End (5-Tech)', x: 372, y: 348, technique: '5-Tech', weakPitchKey: true },
      { id: 'WDT', label: '1T', name: 'Nose Tackle (1-Tech)', x: 476, y: 348, technique: '1-Tech', weakDiveKey: true },
      { id: 'SDT', label: '3T', name: '3-Technique Tackle', x: 566, y: 348, technique: '3-Tech' },
      { id: 'SDE', label: '#1', name: 'Strong End (7-Tech — Inside Veer Key / EMLOS)', x: 620, y: 348, technique: '7-Tech', isDiveKey: true },
      { id: 'WLB', label: 'WLB', name: 'Will Linebacker', x: 416, y: 282, technique: '30-Tech' },
      { id: 'MLB', label: 'MLB', name: 'Mike Linebacker', x: 504, y: 278, technique: '00-Tech' },
      { id: 'SLB', label: '#2', name: 'Sam Linebacker (Pitch Key / Strong Force)', x: 672, y: 300, technique: '9-Overhang', isPitchKey: true },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 255, y: 270, technique: 'Third' },
      { id: 'SS', label: 'SS', name: 'Strong Safety (Sky Force)', x: 708, y: 235, technique: 'Sky' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 495, y: 180, technique: 'Deep Middle' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 765, y: 270, technique: 'Third' },
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
      { id: 'WDE', label: 'DE', name: 'Weak Defensive End (4-Tech)', x: 404, y: 348, technique: '4-Tech', weakDiveKey: true },
      { id: 'NT', label: 'NT', name: 'Nose Tackle (0-Tech)', x: 500, y: 348, technique: '0-Tech' },
      { id: 'SDE', label: '#1', name: 'Strong End (4/5-Tech — Inside Veer Key)', x: 598, y: 348, technique: '4-Tech', isDiveKey: true },
      { id: 'WOLB', label: 'OLB', name: 'Weak Outside LB (Rush)', x: 338, y: 325, technique: 'Ghost 9', weakPitchKey: true },
      { id: 'WILB', label: 'ILB', name: 'Weak Inside LB', x: 455, y: 282, technique: 'Stack' },
      { id: 'SILB', label: 'ILB', name: 'Strong Inside LB', x: 545, y: 282, technique: 'Stack' },
      { id: 'SOLB', label: '#2', name: 'Strong Outside LB (Pitch Key / Force)', x: 674, y: 310, technique: '9-Overhang', isPitchKey: true },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 255, y: 270, technique: 'Third' },
      { id: 'SS', label: 'SS', name: 'Strong Safety (Cover 3/Sky)', x: 695, y: 230, technique: 'Sky' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 180, technique: 'Deep Middle' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 760, y: 270, technique: 'Third' },
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
      { id: 'WDE', label: 'DE', name: 'Weak End (9-Tech)', x: 338, y: 348, technique: '9-Tech', weakPitchKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (4i-Tech)', x: 408, y: 348, technique: '4i-Tech', weakDiveKey: true },
      { id: 'WNG', label: 'NG', name: 'Weak Nose (1-Tech)', x: 468, y: 348, technique: '1-Tech' },
      { id: 'SNG', label: 'NG', name: 'Strong Nose (1-Tech)', x: 532, y: 348, technique: '1-Tech' },
      { id: 'SDT', label: '#1', name: 'Strong Tackle (4-Tech — Inside Veer Key)', x: 598, y: 348, technique: '4-Tech', isDiveKey: true },
      { id: 'SDE', label: '#2', name: 'Strong End (9-Tech — Outside Veer Key / EMLOS)', x: 664, y: 348, technique: '9-Tech', isPitchKey: true },
      { id: 'WLB', label: 'WLB', name: 'Left Linebacker', x: 448, y: 278, technique: '30-Tech' },
      { id: 'SLB', label: 'SLB', name: 'Right Linebacker', x: 552, y: 278, technique: '30-Tech' },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 260, y: 265, technique: 'Half' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 175, technique: 'Deep' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 755, y: 265, technique: 'Half' },
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
      { id: 'WDE', label: 'DE', name: 'Weak End (6-Tech)', x: 356, y: 348, technique: '6-Tech', weakPitchKey: true },
      { id: 'WDT', label: 'DT', name: 'Weak Tackle (3-Tech)', x: 422, y: 348, technique: '3-Tech', weakDiveKey: true },
      { id: 'NT', label: 'NT', name: 'Nose Tackle (0-Tech)', x: 500, y: 348, technique: '0-Tech' },
      { id: 'SDT', label: '#1', name: 'Strong Tackle (4-Tech — Inside Veer Key)', x: 592, y: 348, technique: '4-Tech', isDiveKey: true },
      { id: 'SDE', label: '#2', name: 'Monster End (7-Tech — Outside Veer Key / EMLOS)', x: 646, y: 348, technique: '7-Tech', isPitchKey: true },
      { id: 'WLB', label: 'WLB', name: 'Weak Inside LB', x: 452, y: 280, technique: '20-Tech' },
      { id: 'SLB', label: 'SLB', name: 'Strong Inside LB', x: 548, y: 280, technique: '20-Tech' },
      { id: 'MON', label: 'MON', name: 'Monster Back (Strong Overhang)', x: 694, y: 295, technique: 'Monster' },
      { id: 'LCB', label: 'CB', name: 'Left Cornerback', x: 265, y: 270, technique: 'Man/Third' },
      { id: 'FS', label: 'FS', name: 'Free Safety', x: 500, y: 180, technique: 'Deep Middle' },
      { id: 'RCB', label: 'CB', name: 'Right Cornerback', x: 765, y: 265, technique: 'Deep Third' },
    ],
  },
};

const BASE_POSITION_RULES: Record<string, PlayerPositionRule> = {
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
      '5-3': 'Ace Combo with RG on 0-Tech Nose to backside Will LB.',
      '4-4': 'Reach-scoop weakside 2i-Tech DT; prevent A-gap run-through.',
      '4-3': 'Reach or scoop 1-Tech Nose with LG; prevent backside A-gap run-through.',
      '3-4': 'Ace Combo 0-Tech Nose with RG; control head-up two-gapper to backside ILB.',
      '6-2': 'Base drive playside 1-Tech Nose; seal backside A-gap.',
      '5-2': 'Scoop playside hip of slanting 0-Tech Nose with RG.',
    },
    coachingCue: 'Snap and step playside on the whistle — never step backwards.',
    commonErrorsFix: 'Raising hips before snapping exposes the A-gap. Keep pad level lower than the Nose Guard chin and step with the playside foot first.',
  },
  RG: {
    id: 'RG',
    label: 'RG',
    fullName: 'Right Guard',
    group: 'OL',
    split: '3 ft from Center',
    stance: '3-point weight-forward Veer stance; inside foot slightly up.',
    aimingPoint: 'Inside number of playside DT or 0-Tech Nose hip',
    footwork: 'Inside power step; on Counter, pull flat across Center to weakside edge.',
    assignmentsByFront: {
      '5-3': 'Inside Veer/Power: Combo 0-Tech Nose with Center. Counter: Pull flat left to kick out weak edge.',
      '4-4': 'Inside Veer: Deuce combo 3-Tech with RT. Outside Veer/Power: Base down-block 3-Tech. Counter: Pull left.',
      '4-3': 'Inside Veer: Deuce combo 3-Tech with RT to Mike LB. Outside Veer/Power: Base down-block 3-Tech. Counter: Pull left.',
      '3-4': 'Inside Veer/Power: Combo 0-Tech Nose with Center to backside ILB. Counter: Pull left.',
      '6-2': 'Base drive 1-Tech Nose vertical into the lap of the LB.',
      '5-2': 'Cover playside A-gap; overtake slanting Nose Tackle.',
    },
    coachingCue: 'On Veer, widen the running lane; on Counter, stay flat along the line of scrimmage and kick out.',
    commonErrorsFix: 'Do not chase the 4-tech or 5-tech outward on Inside Veer — that defender is #1 (the QB\'s unblocked Dive Read). Stay on your track.',
  },
  RT: {
    id: 'RT',
    label: 'RT',
    fullName: 'Right Tackle',
    group: 'OL',
    split: '3 ft from Right Guard',
    stance: '3-point crouch, hands ready to punch second-level linebacker or execute down-block.',
    aimingPoint: 'Inside Veer Release to Linebacker (Inside Veer) OR Down-Block on DT (Outside Veer/Power)',
    footwork: 'Inside Veer: 45° inside Veer step past #1. Outside Veer/Power: Explosive 45° DOWN BLOCK on DT.',
    assignmentsByFront: {
      '5-3': 'Inside Veer: Release past #1 to Mike LB. Outside Veer/Power: Heavy down block on 4-tech DT.',
      '4-4': 'Inside Veer: Combo 3-Tech with RG. Outside Veer/Power: Down block on 3-Tech DT.',
      '4-3': 'Inside Veer: Inside release past 7-Tech End to Mike LB. Outside Veer/Power: Down block 3-Tech DT.',
      '3-4': 'Inside Veer: Inside release past 4-Tech End to Strong ILB. Outside Veer/Power: Down block 4-Tech End.',
      '6-2': 'Inside Veer: Veer release to LB. Outside Veer/Power: Down block 4-Tech.',
      '5-2': 'Inside Veer: Veer release to SILB. Outside Veer/Power: Down block 4-Tech.',
    },
    coachingCue: 'Inside Veer: Rip past #1 without contact to the LB. Outside Veer/Power: Wash the DT inside with a leveraged down block.',
    commonErrorsFix: 'Linemen instinctively block the defender aligned head-up on Inside Veer. Drill "Ignore #1, hunt the Backer" to keep reads clean.',
  },
  YTE: {
    id: 'YTE',
    label: 'Y',
    fullName: 'Y (Tight End)',
    group: 'TE',
    split: '3 ft from Right Tackle',
    stance: '3-point tight end stance, outside foot staggered back.',
    aimingPoint: 'Arc Release (Inside Veer) / Veer Release to LB (Outside Veer) / Down Block (Power) / Pop Seam (Power Pass)',
    footwork: 'Inside Veer: Arc to Safety. Outside Veer: Veer inside #1 to LB. Power: Down block on DE. Power Pass: Sell down-block 1 count, then pop 8 yds vertical.',
    assignmentsByFront: {
      '5-3': 'Inside Veer: Arc to FS. Outside Veer: Veer inside 9-Tech to Sam LB. Power: Down block 9-Tech. Power Pass: Pop Seam.',
      '4-4': 'Inside Veer: Arc to SS. Outside Veer: Veer release to SOLB. Power: Down block 5-Tech. Power Pass: Pop Seam.',
      '4-3': 'Inside Veer: Arc release to Sam LB / Strong Safety. Outside Veer: Release to Sam LB. Power: Down block on End. Power Pass: Pop Seam.',
      '3-4': 'Inside Veer: Arc release to Strong OLB / Safety. Outside Veer: Release to SILB. Power: Down block on OLB. Power Pass: Pop Seam.',
      '6-2': 'Inside Veer: Release to Near Safety. Outside Veer: Release to SLB. Power: Down block 9-Tech. Power Pass: Pop Seam.',
      '5-2': 'Inside Veer: Stalk Monster. Outside Veer: Release to SLB. Power: Down block 7-Tech. Power Pass: Pop Seam.',
    },
    coachingCue: 'Inside Veer: Arc outside. Outside Veer: Release inside. Power: Down block. Power Pass: Pop the seam.',
    commonErrorsFix: 'On Power Pass, releasing too early alerts linebackers to drop. Sell the down block for one full second ("One-thousand-one") before bursting into the seam.',
  },
  LG: {
    id: 'LG',
    label: 'LG',
    fullName: 'Left Guard (Pulling Guard on Power)',
    group: 'OL',
    split: '3 ft from Center',
    stance: '3-point stance, balanced enough to flat-scoop or skip-pull across Center.',
    aimingPoint: 'Backside A-gap cutoff (Veer) / Playside Edge Kickout (Power)',
    footwork: 'Veer: Deep flat scoop playside. Power: Skip-pull flat across Center, wrap tight around RT down-block, kick out EMLOS.',
    assignmentsByFront: {
      '5-3': 'Inside/Outside Veer: Scoop backside A-gap. Power: Pull flat across Center, kick out 9-Tech End. Power Pass: Pull to pass protect.',
      '4-4': 'Veer: Scoop 2i-Tech DT. Power: Pull flat right, kick out 5-Tech End/OLB. Power Pass: Pull to protect.',
      '4-3': 'Veer: Scoop 1-Tech Nose. Power: Skip-pull flat across Center, kick out 7-Tech End. Power Pass: Pull to protect.',
      '3-4': 'Veer: Cutoff 0-Tech Nose / scoop B-gap. Power: Skip-pull flat across Center, kick out edge OLB. Power Pass: Pull to protect.',
      '6-2': 'Veer: Cut off backside 1-Tech. Power: Pull flat right, kick out 9-Tech End. Power Pass: Pull to protect.',
      '5-2': 'Veer: Flat scoop A/B gap. Power: Pull flat right, kick out 7-Tech End. Power Pass: Pull to protect.',
    },
    coachingCue: 'On Power: Pull tight to the down blocks and kick out the edge with your inside shoulder.',
    commonErrorsFix: 'Pulling guards often loop too deep in the backfield. Stay tight along the hip line of the Center and Tackle to prevent leakage.',
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
    coachingCue: 'No leakage from the backside; sprint your helmet across the defender beltline.',
    commonErrorsFix: 'Standing straight up at the snap ruins leverage. Keep pad level low and climb directly to the safety if no lineman crosses your face.',
  },
  XTE: {
    id: 'XTE',
    label: 'X',
    fullName: 'X (Tight End / Wide X Split End)',
    group: 'TE',
    split: 'Tight X: 3 ft from Left Tackle | Wide X: 8–10 yds split wide',
    stance: '3-point stance (Tight X) or 2-point stance (Wide X).',
    aimingPoint: 'Deep Middle Third Cutoff (Free Safety) / Shallow Drag (Power Pass) / Stalk Corner (Wide X)',
    footwork: 'Tight X: Sprint across field to cut off Free Safety. Wide X: Stalk playside Corner or run shallow drag.',
    assignmentsByFront: {
      '5-3': 'Veer/Power: Sprint across field to cut off Free Safety (or stalk CB). Counter: Down block 7-Tech. Power Pass: Shallow drag.',
      '4-4': 'Veer/Power: Sprint across field to cut off Free Safety (or stalk CB). Counter: Down block 5-Tech. Power Pass: Shallow drag.',
      '4-3': 'Veer/Power: Sprint across field to cut off Free Safety (or stalk CB). Counter: Down block 5-Tech. Power Pass: Shallow drag.',
      '3-4': 'Veer/Power: Sprint across field to cut off Free Safety (or stalk CB). Counter: Down block Rush OLB. Power Pass: Shallow drag.',
      '6-2': 'Veer/Power: Cut off Free Safety (or stalk CB). Counter: Down block 9-Tech. Power Pass: Shallow drag.',
      '5-2': 'Veer/Power: Cut off Free Safety (or stalk CB). Counter: Down block 6-Tech. Power Pass: Shallow drag.',
    },
    coachingCue: 'Erase the touchdown-saving Safety or stalk the Cornerback in space.',
    commonErrorsFix: 'Wasting energy chipping the backside defensive end on strongside runs allows the Free Safety to tackle the play. Sprint directly to your target.',
  },
  QB: {
    id: 'QB',
    label: '1',
    fullName: '1 (Quarterback)',
    group: 'BACK',
    split: 'Under Center',
    stance: 'Knees bent, thumbs together, scanning keys pre-snap.',
    aimingPoint: 'Playside Mesh Point / Option Alley / 3-Step Power Pass Drop',
    footwork: 'Inside Veer: 4:30 step, ride B-gap mesh with 3. Outside Veer: 5:00 step, ride C-gap mesh with 3. Power: 4:30 open, seat to 3, boot weak. Power Pass: Fake Power, 2 gather steps, throw Y Pop.',
    assignmentsByFront: {
      '5-3': 'Inside Veer: Read 4b-Tech (#1) & 9-Tech (#2). Outside Veer: Read 9-Tech (#1) & Corner (#2). Power: Seat to 3. Power Pass: Hit Y Pop.',
      '4-4': 'Inside Veer: Read 5-Tech (#1) & OLB (#2). Outside Veer: Read 5-Tech (#1) & OLB (#2). Power: Seat to 3. Power Pass: Hit Y Pop.',
      '4-3': 'Inside Veer: Read Strong End (#1) & Sam LB (#2). Outside Veer: Read End (#1) & Sam (#2). Power: Seat to 3. Power Pass: Hit Y Pop.',
      '3-4': 'Inside Veer: Read 4-Tech End (#1) & Strong OLB (#2). Outside Veer: Read End & OLB. Power: Seat to 3. Power Pass: Hit Y Pop.',
      '6-2': 'Inside Veer: Read 4-Tech & 9-Tech. Outside Veer: Read 9-Tech & Corner. Power: Seat to 3. Power Pass: Hit Y Pop.',
      '5-2': 'Inside Veer: Read 4-Tech & 7-Tech. Outside Veer: Read 7-Tech & Monster. Power: Seat to 3. Power Pass: Hit Y Pop.',
    },
    coachingCue: 'Veer: Eyes glued to Read Key. Power: Seat ball deep into 3. Power Pass: Rhythm strike to Y.',
    commonErrorsFix: 'Looking down at the football during the mesh ruins option reads. Keep your eyes locked on the defender\'s jersey numbers from snap to disconnect.',
  },
  LH: {
    id: 'LH',
    label: '3',
    fullName: '3 (Left Halfback / Dive Back)',
    group: 'BACK',
    split: '4 yards deep, inside foot behind Left Guard outside heel',
    stance: '2-point stance, hands on knees, zero false steps.',
    aimingPoint: 'Inside Veer: RG outside hip (B-Gap) / Outside Veer: RT outside hip (C-Gap) / Power: Off-Tackle C-Gap behind Pulling LG',
    footwork: 'Inside Veer: 45° crossover to RG hip. Outside Veer: Wider 45° track to RT outside hip. Power: Press C-gap, cut inside LG kickout. Counter: Violent flash fake right.',
    assignmentsByFront: {
      '5-3': 'Inside Veer: Hammer B-Gap. Outside Veer: Hammer C-Gap. Power: Carry off-tackle behind LG kickout. Counter: Flash fake right.',
      '4-4': 'Inside Veer: Cut off Deuce combo. Outside Veer: Press C-gap. Power: Follow LG kickout. Counter: Flash fake right.',
      '4-3': 'Inside Veer: Hammer B-Gap off 3-Tech hip. Outside Veer: Hammer C-Gap. Power: Follow LG kickout. Counter: Flash fake right.',
      '3-4': 'Inside Veer: Hammer B-Gap off RT hip. Outside Veer: Hammer C-Gap. Power: Follow LG kickout. Counter: Flash fake right.',
      '6-2': 'Inside Veer: B-Gap seam. Outside Veer: C-Gap seam. Power: Follow LG kickout. Counter: Flash fake right.',
      '5-2': 'Inside Veer: RG hip explosion. Outside Veer: RT hip explosion. Power: Follow LG kickout. Counter: Flash fake right.',
    },
    coachingCue: 'Inside Veer: Tight on Guard. Outside Veer: Outside hip of Tackle. Power: Follow the Pulling Guard.',
    commonErrorsFix: 'Curving too wide toward the Tackle on Inside Veer lets #1 tackle both backs. Stay tight to the Guard\'s hip to force the defender to commit.',
  },
  RH: {
    id: 'RH',
    label: '2',
    fullName: '2 (Right Halfback / Pitch Back)',
    group: 'BACK',
    split: '4 yards deep, inside foot behind Right Guard outside heel',
    stance: '2-point stance facing straight ahead so defense gets no tip.',
    aimingPoint: '5x2 Pitch Track (Veer) / Lead ISO Block on Linebacker (Power) / Flat Checkdown (Power Pass)',
    footwork: 'Inside/Outside Veer: Drop-step, sprint to 5x2 pitch relationship. Power: Fire through C-gap, ISO block playside LB. Power Pass: Fake lead, leak to flat.',
    assignmentsByFront: {
      '5-3': 'Veer: 5x2 pitch trail outside #2. Power: Fire through C-gap and block Mike LB. Counter: Pitch trail left. Power Pass: Flat route.',
      '4-4': 'Veer: Pitch trail outside OLB. Power: Fire through C-gap and block Strong ILB. Counter: Pitch trail left. Power Pass: Flat route.',
      '4-3': 'Veer: 5x2 pitch trail outside Sam LB. Power: Fire through C-gap and block Mike LB. Counter: Pitch trail left. Power Pass: Flat route.',
      '3-4': 'Veer: 5x2 pitch trail outside Strong OLB. Power: Fire through C-gap and block Strong ILB. Counter: Pitch trail left. Power Pass: Flat route.',
      '6-2': 'Veer: Pitch trail outside End. Power: Fire through C-gap and block Right LB. Counter: Pitch trail left. Power Pass: Flat route.',
      '5-2': 'Veer: Pitch trail outside Monster. Power: Fire through C-gap and block SILB. Counter: Pitch trail left. Power Pass: Flat route.',
    },
    coachingCue: 'Veer: Stay 5 yards wide, 2 yards deep. Power: Attack the inside Linebacker in the hole.',
    commonErrorsFix: 'Trailing too close behind the 1 on option pitches allows one defender to tackle both players. Maintain exact 5x2 width and depth.',
  },
  W: {
    id: 'W',
    label: 'Z',
    fullName: 'Z Receiver (Wide Z / Wing Z)',
    group: 'WR',
    split: 'Wide Z: 8–10 yds split wide | Wing Z: 1 yd outside x 1 yd behind YTE',
    stance: '2-point athletic stance, inside foot forward, eyes on secondary coverage.',
    aimingPoint: 'Stalk Playside Cornerback / Clear Route (Power Pass)',
    footwork: 'Veer/Power: Release to stalk/seal Playside Cornerback. Power Pass: 12-yard corner route to clear safety.',
    assignmentsByFront: {
      '5-3': 'Veer/Power: Stalk Playside Cornerback. Power Pass: Corner route.',
      '4-4': 'Veer/Power: Crack Strong Safety / stalk Corner. Power Pass: Corner route.',
      '4-3': 'Veer/Power: Stalk Playside Cornerback / crack Safety. Power Pass: Corner route.',
      '3-4': 'Veer/Power: Stalk Playside Cornerback / crack Safety. Power Pass: Corner route.',
      '6-2': 'Veer/Power: Stalk Playside Cornerback. Power Pass: Corner route.',
      '5-2': 'Veer/Power: Stalk Playside Cornerback. Power Pass: Corner route.',
    },
    coachingCue: 'Own the sideline perimeter for the ball carrier; stalk block the Cornerback and never block unblocked read keys.',
    commonErrorsFix: 'Blocking the Pitch Key (#2) by mistake breaks the option read. Release clean past the edge defender directly to the defensive back.',
  },
};

export const VEER_PLAYBOOK: PlayDefinition[] = [
  // 1. INSIDE VEER
  {
    id: '42-inside-veer',
    code: '42 INSIDE VEER',
    name: '42 Inside Veer (Base Triple Option)',
    subtitle: 'Playside Tackle Releases Inside to Mike LB — Reads #1 4/5-Tech DT & #2 Edge Force',
    seriesTag: 'Core 01',
    playType: 'Triple Option',
    targetGap: 'Playside B-Gap / C-D Alley',
    primaryReadLabel: '#1 Dive Key (Playside 4b/5-Tech DT)',
    secondaryReadLabel: '#2 Pitch Key (EMLOS 7/9-Tech End)',
    summary:
      'The foundation of the Split Back Veer offense. 3 (Left Halfback) explodes at the Right Guard\'s outside hip (B-Gap) while 2 (Right Halfback) maintains a 5x2 pitch relationship. Right Tackle (RT) inside veer-releases past #1 to the Mike LB, leaving #1 and #2 completely unblocked.',
    whenToCall:
      'First play of the game and whenever the defense packs 8 or 9 players into the box to stop inside runs.',
    qbDecisionMatrix: {
      crashPull: 'If #1 crashes inside to tackle 3 → 1 pulls ball & attacks #2 on perimeter.',
      squeezeGive: 'If #1 sits square, widens, or Bull Rushes → GIVE to 3 diving through B-gap.',
      pitchPhase: 'Once 1 pulls: if #2 commits to tackle 1 → PITCH to 2 in stride; if #2 feathers to 2 → 1 cuts upfield inside #2.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: 3-Ft Splits & Key Identification',
        detail: '1 locates #1 (first down lineman outside RG) and #2 (edge force). O-line maintains strict 3-foot splits.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: 4:30 Step, B-Gap Dive Mesh & #1 Read',
        detail: '3 hits RG outside hip full speed. RT inside veer-releases to MLB. 1 rides 3 while reading #1 shoulders.',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: Option Disconnect & 5x2 Pitch Leverage',
        detail: 'Based on #1, 3 carries into secondary OR 1 disconnects with 2 maintaining 5 yards width x 2 yards depth.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: Downfield Seal & Alley Finish',
        detail: 'Y and Z seal the perimeter while X sprints across the field to cut off the Free Safety (or stalk-blocks if wide).',
      },
    ],
    positionRules: BASE_POSITION_RULES,
    getOffensivePaths: (_front, diveBehavior, pitchBehavior, eleventhMode, xMode = 'tight_x') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode);
      const diveGive = diveBehavior !== 'crash';
      const qbKeep = !diveGive && pitchBehavior === 'feather_pitch';
      const pitchTriggered = !diveGive && pitchBehavior === 'commit_qb';

      const finalCarrier = diveGive ? 'LH' : pitchTriggered ? 'RH' : 'QB';
      const outcomeLabel = diveGive
        ? 'GIVE TO 3 (B-Gap Dive)'
        : pitchTriggered
        ? 'PITCH TO 2 (Perimeter Alley)'
        : '1 KEEPER (Off-Tackle Seam)';

      return {
        paths: {
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
          LH: {
            role: 'dive',
            points: diveGive
              ? [base.LH, { x: 526, y: 408 }, { x: 556, y: 332 }, { x: 562, y: 185 }]
              : [base.LH, { x: 526, y: 408 }, { x: 564, y: 354 }, { x: 575, y: 325 }],
          },
          QB: {
            role: 'qb',
            points: diveGive
              ? [base.QB, { x: 524, y: 412 }, { x: 618, y: 406 }, { x: 658, y: 375 }]
              : qbKeep
              ? [base.QB, { x: 524, y: 412 }, { x: 626, y: 402 }, { x: 642, y: 320 }, { x: 648, y: 175 }]
              : [base.QB, { x: 524, y: 412 }, { x: 628, y: 404 }, { x: 644, y: 392 }],
          },
          RH: {
            role: 'pitch',
            points: pitchTriggered
              ? [base.RH, { x: 636, y: 476 }, { x: 716, y: 418 }, { x: 748, y: 300 }, { x: 758, y: 155 }]
              : [base.RH, { x: 636, y: 476 }, { x: 716, y: 418 }, { x: 754, y: 345 }],
          },
        },
        ballCarrierSequence: {
          diveGive,
          qbKeep,
          pitchTriggered,
          finalCarrier,
          outcomeLabel,
          expectedYards: diveGive ? '+6.5 Yds (Interior B-Gap)' : pitchTriggered ? '+14.5 Yds (Perimeter Alley)' : '+9.0 Yds (Off-Tackle Seam)',
          coachingExplanation: diveGive
            ? (diveBehavior === 'upfield'
              ? '#1 executed a Bull Rush into the line — 1 leaves ball in 3\'s stomach as 3 creases right past the rush into the secondary.'
              : '#1 Dive Key stayed square/wide. 1 leaves ball in 3\'s stomach for a clean 6+ yard B-gap crease.')
            : pitchTriggered
            ? '#1 crashed on 3 and #2 committed to 1 — 1 flips a clean wrist-pitch to 2 in the open perimeter.'
            : '#1 crashed on 3 and #2 feathered wide with 2 — 1 plants outside foot and cuts upfield inside #2.',
        },
      };
    },
  },

  // 2. OUTSIDE VEER
  {
    id: '46-outside-veer',
    code: '46 OUTSIDE VEER',
    name: '46 Outside Veer (Off-Tackle Option)',
    subtitle: 'RT & RG Down-Block Interior — Y Releases Inside to LB — Reads EMLOS (#1) & Corner (#2)',
    seriesTag: 'Core 02',
    playType: 'Triple Option',
    targetGap: 'Playside C-Gap (Off-Tackle) / D-Alley',
    primaryReadLabel: '#1 Dive Key (EMLOS 7/9-Tech Defensive End)',
    secondaryReadLabel: '#2 Pitch Key (Playside Corner / Alley Force)',
    summary:
      'The essential companion to Inside Veer. When the defense widens its tackle to stop the B-gap dive, Outside Veer down-blocks the interior: Playside Tackle (RT) and Guard (RG) wash the DT and Nose inside. Y inside veer-releases to the Linebacker. 1 reads the Defensive End (EMLOS) as #1, and 3 hits the C-gap dive track right on RT\'s outside hip.',
    whenToCall:
      'When the defense stacks the B-gap or plays a heavy 4-tech/5-tech who pinches inside against Inside Veer.',
    qbDecisionMatrix: {
      crashPull: 'If #1 (EMLOS End) crashes inside on the C-gap dive → 1 pulls and attacks outside.',
      squeezeGive: 'If #1 (EMLOS End) widens, sits square, or Bull Rushes → GIVE to 3 diving through C-gap off RT\'s down block.',
      pitchPhase: 'If 1 pulls: if #2 (Corner/Safety) attacks 1 → PITCH to 2 on perimeter; if #2 stays wide → 1 turns up inside.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Down-Block Angle Leverage',
        detail: 'RT and RG fire out with aggressive 45° down-blocks to wash the interior defensive lineman inside.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: 5:00 Step, C-Gap Dive Mesh & EMLOS Read',
        detail: '3 takes a wider track to RT outside hip (C-Gap). Y releases inside past the DE to the Mike/Sam LB. 1 reads the EMLOS (#1).',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: Wider Perimeter Pitch Track',
        detail: 'If EMLOS crashes, 1 pulls and sprints to the D-gap alley with 2 maintaining 5x2 leverage outside.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: Optioning the Cornerback in Space',
        detail: '1 forces the Cornerback (#2) to declare: pitch to 2 for the sideline or 1 keeper off-tackle.',
      },
    ],
    positionRules: {
      ...BASE_POSITION_RULES,
      RT: {
        ...BASE_POSITION_RULES.RT,
        aimingPoint: 'Heavy Down-Block on 4/5-Tech DT',
        footwork: 'Violent 45° inside down-block; drive feet and wash the defender inside.',
        coachingCue: 'On Outside Veer, do not release to LB — wash the DT inside.',
        commonErrorsFix: 'Hesitating on the snap allows the DT to penetrate the C-gap track. Fire out flat and attack the near hip.',
      },
      YTE: {
        ...BASE_POSITION_RULES.YTE,
        aimingPoint: 'Inside Veer Release past EMLOS to Linebacker',
        footwork: '45° inside release underneath the DE straight onto Sam/Mike Linebacker.',
        coachingCue: 'Leave the Defensive End unblocked — hunt the Linebacker.',
        commonErrorsFix: 'Chipping the EMLOS End ruins the 1 read timing. Dip your shoulder and rip directly to the second level.',
      },
      LH: {
        ...BASE_POSITION_RULES.LH,
        aimingPoint: 'Outside Hip of Right Tackle (Playside C-Gap)',
        footwork: 'Wider 45° crossover track aiming 1 yard wider than Inside Veer.',
        coachingCue: 'Hit the Tackle\'s outside hip full speed — press the C-Gap.',
        commonErrorsFix: 'Cutting inside too early muddles the read. Press the C-gap cylinder so the Defensive End must declare.',
      },
    },
    getOffensivePaths: (_front, diveBehavior, pitchBehavior, eleventhMode, xMode = 'tight_x') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode);
      const diveGive = diveBehavior !== 'crash';
      const qbKeep = !diveGive && pitchBehavior === 'feather_pitch';
      const pitchTriggered = !diveGive && pitchBehavior === 'commit_qb';

      const finalCarrier = diveGive ? 'LH' : pitchTriggered ? 'RH' : 'QB';
      const outcomeLabel = diveGive
        ? 'GIVE TO 3 (C-Gap Off-Tackle Dive)'
        : pitchTriggered
        ? 'PITCH TO 2 (Sideline Alley)'
        : '1 KEEPER (D-Gap Burst)';

      return {
        paths: {
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
          LH: {
            role: 'dive',
            points: diveGive
              ? [base.LH, { x: 542, y: 412 }, { x: 612, y: 348 }, { x: 622, y: 185 }]
              : [base.LH, { x: 542, y: 412 }, { x: 612, y: 360 }],
          },
          QB: {
            role: 'qb',
            points: diveGive
              ? [base.QB, { x: 540, y: 416 }, { x: 642, y: 410 }, { x: 685, y: 375 }]
              : qbKeep
              ? [base.QB, { x: 540, y: 416 }, { x: 658, y: 408 }, { x: 688, y: 325 }, { x: 694, y: 175 }]
              : [base.QB, { x: 540, y: 416 }, { x: 662, y: 408 }, { x: 685, y: 395 }],
          },
          RH: {
            role: 'pitch',
            points: pitchTriggered
              ? [base.RH, { x: 654, y: 472 }, { x: 742, y: 415 }, { x: 772, y: 295 }, { x: 780, y: 155 }]
              : [base.RH, { x: 654, y: 472 }, { x: 742, y: 415 }, { x: 776, y: 345 }],
          },
        },
        ballCarrierSequence: {
          diveGive,
          qbKeep,
          pitchTriggered,
          finalCarrier,
          outcomeLabel,
          expectedYards: diveGive ? '+7.5 Yds (Off-Tackle C-Gap)' : pitchTriggered ? '+16.0 Yds (Sideline Strike)' : '+9.5 Yds (1 Keeper)',
          coachingExplanation: diveGive
            ? (diveBehavior === 'upfield'
              ? '#1 EMLOS End executed a Bull Rush — 1 leaves ball in 3\'s stomach as 3 creases off RT\'s down block for huge yards.'
              : 'EMLOS End widened or sat flat — 3 hits the C-gap crease off RT\'s down block for huge off-tackle yards.')
            : pitchTriggered
            ? 'EMLOS End crashed hard on 3\'s C-gap dive, and the Corner came up on 1 — 1 pitches to 2 on the perimeter for big yardage.'
            : 'EMLOS End crashed on Dive, and the Corner backed off with 2 — 1 keeps and accelerates North-South into the alley.',
        },
      };
    },
  },

  // 3. COUNTER
  {
    id: '31-counter',
    code: '31 COUNTER',
    name: '31 Counter (with Pulling RG & Pitch Back)',
    subtitle: 'Flash Fake to Right B-Gap — Backside RG Pulls Flat Left to Kick Out Edge Defender',
    seriesTag: 'Core 03',
    playType: 'Misdirection Option',
    targetGap: 'Weakside C/D Perimeter Alley',
    primaryReadLabel: 'Weakside EMLOS (#2 Weak End)',
    secondaryReadLabel: 'Weakside Corner / Alley Force',
    summary:
      'When linebackers over-pursue the 42 Inside Veer action, 31 Counter burns them with misdirection. LH executes a violent token flash fake into the right B-gap to freeze all three linebackers. Right Guard (RG) pulls flat down the line to the left, XTE blocks down on the weakside end, and QB reverse-pivots left with RH trailing on pitch relationship.',
    whenToCall:
      'Call in the 2nd quarter after running Inside Veer 3+ times. Linebackers sprint right on the snap, leaving the left sideline wide open.',
    qbDecisionMatrix: {
      crashPull: 'LH dive is a token flash fake to freeze linebackers — QB always disconnects and attacks left.',
      squeezeGive: 'RG pulls flat and kicks out the weakside force defender outside XTE\'s down block.',
      pitchPhase: 'If weakside defender attacks QB → PITCH left to RH in full stride; if defender feathers to RH → QB cuts up inside behind pulling RG.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Full-Speed 42 Veer Illusion',
        detail: 'LH steps hard toward right B-gap while QB shows initial mesh look to hold the inside linebackers.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: RG Pull & QB Reverse Pivot Left',
        detail: 'Right Guard pulls flat across Center to the left while XTE blocks down on the weakside defensive lineman.',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: Weakside Option Leverage',
        detail: 'QB and RH sprint to the left perimeter behind pulling RG with 5x2 pitch leverage.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: Misdirection Touchdown Alley',
        detail: 'With the entire defense flowing right on the fake, QB and RH create a 2-on-1 on the left sideline.',
      },
    ],
    positionRules: {
      ...BASE_POSITION_RULES,
      RG: {
        ...BASE_POSITION_RULES.RG,
        aimingPoint: 'Pull Flat Left across Center — Kick Out Weakside EMLOS',
        footwork: 'Drop-step left, stay tight along Center\'s hips, pull flat and kick out first defender outside XTE.',
        coachingCue: 'Pull flat down the line — kick out the weak edge with your inside shoulder.',
        commonErrorsFix: 'Looping backwards creates penetration. Step flat along the line of scrimmage immediately on the snap.',
      },
    },
    getOffensivePaths: (_front, _diveBehavior, pitchBehavior, eleventhMode, xMode = 'tight_x') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode);
      const pitchTriggered = pitchBehavior === 'commit_qb';
      const finalCarrier = pitchTriggered ? 'RH' : 'QB';

      return {
        paths: {
          C: { role: 'block_down', points: [base.C, { x: 518, y: 354 }, { x: 526, y: 325 }] },
          RG: { role: 'block_pull', points: [base.RG, { x: 515, y: 416 }, { x: 375, y: 412 }, { x: 332, y: 342 }, { x: 325, y: 275 }] },
          RT: { role: 'block_down', points: [base.RT, { x: 562, y: 352 }, { x: 545, y: 322 }] },
          YTE: { role: 'block_down', points: [base.YTE, { x: 608, y: 352 }, { x: 595, y: 320 }] },
          LG: { role: 'block_down', points: [base.LG, { x: 468, y: 352 }, { x: 478, y: 320 }] },
          LT: { role: 'block_down', points: [base.LT, { x: 418, y: 350 }, { x: 432, y: 318 }] },
          XTE: {
            role: 'block_down',
            points: xMode === 'wide_x'
              ? [base.XTE, { x: 220, y: 345 }, { x: 255, y: 280 }]
              : [base.XTE, { x: 388, y: 348 }, { x: 402, y: 315 }],
          },
          W: { role: 'block_veer', points: [base.W, { x: base.W.x - 35, y: 335 }, { x: 510, y: 210 }] },
          LH: {
            role: 'fake',
            points: [base.LH, { x: 525, y: 408 }, { x: 572, y: 348 }, { x: 585, y: 310 }],
          },
          QB: {
            role: 'qb',
            points: pitchTriggered
              ? [base.QB, { x: 512, y: 416 }, { x: 410, y: 418 }, { x: 342, y: 392 }]
              : [base.QB, { x: 512, y: 416 }, { x: 410, y: 418 }, { x: 336, y: 368 }, { x: 318, y: 175 }],
          },
          RH: {
            role: 'pitch',
            points: pitchTriggered
              ? [base.RH, { x: 455, y: 488 }, { x: 315, y: 448 }, { x: 258, y: 342 }, { x: 245, y: 155 }]
              : [base.RH, { x: 455, y: 488 }, { x: 315, y: 448 }, { x: 258, y: 342 }],
          },
        },
        ballCarrierSequence: {
          diveGive: false,
          qbKeep: !pitchTriggered,
          pitchTriggered,
          finalCarrier,
          outcomeLabel: pitchTriggered ? 'COUNTER PITCH TO 2 (Left Alley)' : 'COUNTER 1 KEEP (Behind Pulling RG)',
          expectedYards: '+16.5 Yds (Explosive Misdirection)',
          coachingExplanation:
            '3\'s violent fake to right B-gap froze the linebackers. X pinned the weakside DE inside (or stalked CB) while RG pulled around the horn to lead the Counter.',
        },
      };
    },
  },

  // 4. POWER (WITH PULLING GUARD)
  {
    id: '24-power',
    code: '24 POWER',
    name: '24 Power (with Pulling LG & Lead RH)',
    subtitle: 'Down-Block Wall — Backside LG Pulls to Kick Out Edge — RH Leads on LB — LH Carries',
    seriesTag: 'Core 04',
    playType: 'Power',
    targetGap: 'Playside C-Gap Off-Tackle Power Tunnel',
    primaryReadLabel: 'No Read — Backside Guard (LG) Kickout Pull on Edge',
    secondaryReadLabel: 'Lead Blocker (RH) ISO on Playside Linebacker',
    summary:
      'The classic Split Back Power run. When the defense cheats outside to defend the Veer option, 24 Power crushes them with downhill blocking: YTE and RT down-block to wall off the interior. Backside Guard (LG) pulls flat across Center to kick out the edge defender. Right Halfback (RH) leads through the C-gap to isolate the playside linebacker, and Left Halfback (LH) follows into the power hole with direct handoff.',
    whenToCall:
      'Short yardage (3rd & 2, Goal Line), bad weather when option pitching is risky, or whenever defensive ends play soft/feathered.',
    qbDecisionMatrix: {
      crashPull: 'No option read — QB opens at 4:30 and seats the ball firmly into LH\'s stomach.',
      squeezeGive: 'LH presses the C-gap, stays tight to the down blocks, and cuts vertically inside LG\'s kickout.',
      pitchPhase: 'QB carries out a naked bootleg fake left to hold the backside defensive end.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Gap-Down-Backer Wall & LG Pull',
        detail: 'RT and YTE block down hard inside. Backside Guard (LG) skip-pulls flat across Center.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: RH Lead Block & Direct Handoff',
        detail: 'RH fires off the snap straight into C-gap to lead on the inside linebacker. QB seats ball to LH at 4:30.',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: LG Kickout Collision on Edge',
        detail: 'LG kicks out the edge defender with his inside shoulder, opening the off-tackle power tunnel.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: North-South Power Finish',
        detail: 'LH follows RH\'s lead block, presses into the secondary, and finishes with high-and-tight ball security.',
      },
    ],
    positionRules: {
      ...BASE_POSITION_RULES,
      LG: {
        ...BASE_POSITION_RULES.LG,
        aimingPoint: 'Pull Flat across Center — Kick Out Playside Edge Defender (EMLOS)',
        footwork: 'Skip-pull flat along Center/Tackle hips, wrap tight around RT down-block, strike edge defender.',
        coachingCue: 'Pull flat, stay tight to the wall, kick out the edge defender with your inside shoulder.',
        commonErrorsFix: 'Drifting into the backfield allows the edge defender to penetrate. Skim the hips of the down-blockers.',
      },
      RH: {
        ...BASE_POSITION_RULES.RH,
        aimingPoint: 'Lead through C-Gap — Isolate Playside Linebacker (Mike/Sam LB)',
        footwork: 'Explode downhill at 45°, fire through C-gap, fit and drive the linebacker backwards.',
        coachingCue: 'You are the Lead Blocker on Power — blow up the Linebacker.',
        commonErrorsFix: 'Hesitating at the mesh ruins the hole. Hit the C-gap at full speed and drive through the linebacker.',
      },
      LH: {
        ...BASE_POSITION_RULES.LH,
        aimingPoint: 'Playside C-Gap behind Pulling LG and Lead RH',
        footwork: 'One gather step, secure handoff, press line, cut vertical inside kickout.',
        coachingCue: 'Soft hands on handoff, violent legs in the hole — run North-South.',
        commonErrorsFix: 'Bouncing outside before the kickout block opens ruins the play. Press the tackle hip and cut vertical.',
      },
    },
    getOffensivePaths: (_front, _diveBehavior, _pitchBehavior, eleventhMode, xMode = 'tight_x') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode);
      return {
        paths: {
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
          LH: {
            role: 'dive',
            points: [base.LH, { x: 528, y: 425 }, { x: 618, y: 385 }, { x: 636, y: 305 }, { x: 640, y: 165 }],
          },
          QB: {
            role: 'qb',
            points: [base.QB, { x: 524, y: 425 }, { x: 440, y: 450 }, { x: 380, y: 465 }],
          },
          RH: {
            role: 'block_veer',
            points: [base.RH, { x: 588, y: 420 }, { x: 615, y: 348 }, { x: 608, y: 280 }],
          },
        },
        ballCarrierSequence: {
          diveGive: true,
          qbKeep: false,
          pitchTriggered: false,
          finalCarrier: 'LH',
          outcomeLabel: 'DIRECT HANDOFF TO 3 (24 Power Off-Tackle)',
          expectedYards: '+8.0 Yds (Down-Block Wall + LG Kickout)',
          coachingExplanation:
            'Y and RT pinned the defensive front inside with heavy down blocks. Backside LG pulled and kicked out the edge defender, while 2 led through to erase the linebacker — giving 3 an open power tunnel.',
        },
      };
    },
  },

  // 5. POWER PASS (Y POP)
  {
    id: '324-power-pass',
    code: '324 POWER PASS',
    name: '324 Power Pass (Y Pop Seam)',
    subtitle: 'Exact 24 Power Action — Y Sells Down-Block for 1 Count, Then Pops into 10-Yd Seam',
    seriesTag: 'Core 05',
    playType: 'Play-Action Pass',
    targetGap: 'Playside Y Pop Seam (8–12 Yards Deep)',
    primaryReadLabel: 'Primary Target: Y Pop Seam',
    secondaryReadLabel: 'Checkdown: 2 Flat / X Drag',
    summary:
      'The ultimate big-play counter. Once you run 24 Power and Veer, the linebackers and safeties sprint to the line of scrimmage the moment they see the Power run action. 324 Power Pass fakes the exact same Power: LG pulls, 3 executes a violent power dive fake, and Y sells down block for 1 count before popping wide open into the vacated seam.',
    whenToCall:
      'When linebackers bite hard on the run or Free Safety creeps inside 8 yards of the line of scrimmage.',
    qbDecisionMatrix: {
      crashPull: 'Fake direct handoff to 3 (who chips edge rusher); take 2 quick gather steps behind RT.',
      squeezeGive: '1st Read: Y running the Pop Seam right behind the biting inside linebackers.',
      pitchPhase: '2nd Read: 2 in the right flat checkdown OR X dragging across middle at 6 yards.',
    },
    coachingPhases: [
      {
        phase: 1,
        timeRange: [0, 0.25],
        title: 'Phase 1: Full-Speed Power Run Sell',
        detail: 'O-line fires low, LG pulls right, and 3 explodes toward the C-gap just like 24 Power.',
      },
      {
        phase: 2,
        timeRange: [0.25, 0.55],
        title: 'Phase 2: Y Down-Block Hesitation & Pop Release',
        detail: 'Y initiates contact on the DE for 1 count ("One-thousand-one"), then slips vertical into the open seam.',
      },
      {
        phase: 3,
        timeRange: [0.55, 0.8],
        title: 'Phase 3: 1 Gather Steps & Rhythm Strike',
        detail: '1 fakes to 3, plants back foot at 3-step depth, and throws a firm chest strike to Y.',
      },
      {
        phase: 4,
        timeRange: [0.8, 1.0],
        title: 'Phase 4: Catch & Run in Empty Secondary',
        detail: 'With linebackers sucked into the line and safety frozen, Y catches in stride for an explosive touchdown.',
      },
    ],
    positionRules: {
      ...BASE_POSITION_RULES,
      YTE: {
        ...BASE_POSITION_RULES.YTE,
        aimingPoint: 'Y Pop Seam (8–10 Yards between Hashes and Numbers)',
        footwork: 'Punch DE for 1 count, disengage, burst 8 yards vertical behind linebackers.',
        coachingCue: 'Sell the down block 1-thousand-1, then pop straight down the seam.',
        commonErrorsFix: 'Slipping out without initial contact tips off the pass. Make firm shoulder contact before releasing.',
      },
      QB: {
        ...BASE_POSITION_RULES.QB,
        aimingPoint: 'Y on 10-Yard Seam Pop',
        footwork: 'Fake Power handoff, 2 quick gather steps, plant back foot and deliver to Y\'s numbers.',
        coachingCue: 'Fake Power, eye the linebackers, throw firm strike to Y.',
        commonErrorsFix: 'Floating the pass allows the safety to recover. Throw on a line right over the linebacker helmet level.',
      },
    },
    getOffensivePaths: (_front, _diveBehavior, _pitchBehavior, eleventhMode, xMode = 'tight_x') => {
      const base = getBaseOffensiveAlignment(eleventhMode, xMode);
      return {
        paths: {
          C: { role: 'block_down', points: [base.C, { x: 500, y: 368 }] },
          RG: { role: 'block_down', points: [base.RG, { x: 548, y: 368 }] },
          RT: { role: 'block_down', points: [base.RT, { x: 594, y: 368 }] },
          LG: {
            role: 'block_pull',
            points: [base.LG, { x: 512, y: 418 }, { x: 588, y: 412 }, { x: 615, y: 382 }],
          },
          LT: { role: 'block_down', points: [base.LT, { x: 406, y: 368 }] },
          YTE: {
            role: 'route_pass',
            points: [base.YTE, { x: 636, y: 360 }, { x: 630, y: 260 }, { x: 626, y: 135 }],
          },
          XTE: {
            role: 'route_pass',
            points: xMode === 'wide_x'
              ? [base.XTE, { x: 200, y: 340 }, { x: 340, y: 280 }, { x: 520, y: 260 }]
              : [base.XTE, { x: 375, y: 345 }, { x: 485, y: 290 }, { x: 565, y: 285 }],
          },
          W: {
            role: 'route_pass',
            points: [base.W, { x: base.W.x + 25, y: 310 }, { x: 795, y: 190 }],
          },
          LH: {
            role: 'fake',
            points: [base.LH, { x: 526, y: 415 }, { x: 602, y: 370 }, { x: 624, y: 350 }],
          },
          QB: {
            role: 'qb',
            points: [base.QB, { x: 524, y: 418 }, { x: 562, y: 442 }, { x: 566, y: 448 }],
          },
          RH: {
            role: 'route_pass',
            points: [base.RH, { x: 635, y: 450 }, { x: 730, y: 390 }, { x: 765, y: 335 }],
          },
        },
        ballCarrierSequence: {
          diveGive: false,
          qbKeep: false,
          pitchTriggered: false,
          finalCarrier: 'YTE',
          outcomeLabel: 'POWER PASS COMPLETION TO Y (Y Pop)',
          expectedYards: '+24.0 Yds (Wide Open Tight End Seam)',
          coachingExplanation:
            'Linebackers stepped up hard on the 24 Power run action and LG pull fake, leaving Y running wide open down the seam for an uncontested touchdown.',
        },
      };
    },
  },
];

export const PRACTICE_DRILLS: PracticeDrill[] = [
  {
    id: 'drill-mesh-ride',
    title: '01. Inside & Outside Veer QB-Back Mesh Lab',
    durationMin: 10,
    playersInvolved: 'QBs, Left Halfbacks (LH), Right Halfbacks (RH), 1 Coach as Read Key',
    equipment: '3 Footballs, 3 Cones (B-gap & C-gap landmarks), 1 Coaching Towel',
    objective: 'Master both the Inside Veer (B-Gap / #1 DT read) and Outside Veer (C-Gap / #1 EMLOS read) meshes without ever looking down at the football.',
    setupSteps: [
      'Set cones for Center, Right Guard, and Right Tackle splits.',
      'Reps 1–5: Inside Veer track (LH aims at RG hip, Coach stands on RG outside shoulder).',
      'Reps 6–10: Outside Veer track (LH aims at RT outside hip, Coach stands on edge outside RT).',
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
    title: '03. Power Pass Y-Pop Play-Action Timing Drill',
    durationMin: 10,
    playersInvolved: 'QBs, Tight Ends (YTE), Halfbacks (LH/RH), Safeties/LBs',
    equipment: '3 Footballs, 2 Sideline Cones',
    objective: 'Perfect the "1-thousand-1" down-block hesitation by YTE before popping into the seam on the 324 Power Pass.',
    setupSteps: [
      'Align QB, LH, RH, and YTE in base Split Back formation.',
      'Coach positions 2 linebackers at 4 yards depth with instructions to bite hard on run action.',
      'On snap: LH fakes Power, YTE makes contact on DE dummy for 1 second, then bursts into seam.',
    ],
    coachingPoints: [
      'YTE must sell the run. If you release immediately, the linebacker will read pass and drop.',
      'QB rhythm: fake Power, take 2 gather steps, plant back foot, throw firm strike.',
      'Catch the ball with two hands away from the body in the open secondary.',
    ],
    levelProgression: {
      beginner: 'Count out loud: "One-thousand-one... POP!" to build route patience before release.',
      intermediate: 'Add Free Safety who starts at 10 yards and must react to run vs pass flow.',
      advanced: 'Incorporate live checkdown to RH in the flat if safety stays deep over YTE.',
    },
  },
];
