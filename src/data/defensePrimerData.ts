export type DefenseFormation = 'base' | 'shield' | 'vanguard' | 'shell';
export type DefenseFrontType = DefenseFormation; // backwards-compatible alias
export type CoverageScheme = 'blue' | 'green' | 'black';
export type SelectableFront = 'slant' | 'pinch' | 'out';
export type LineSlant = 'base_gap' | 'slant' | 'pinch' | 'angle_out' | 'out' | 'bull_rush';
export type StrengthCall = 'rip' | 'liz';
export type OffensiveFormationId = 'pro_i' | 'spread_2x2' | 'trips_3x1' | 'heavy_2te' | 'pistol_veer' | 'empty_5w';
export type BallHashPosition = 'middle' | 'left_hash' | 'right_hash';

export interface StrengthDetectionResult {
  call: StrengthCall; // 'liz' = Strong Left (from defense perspective), 'rip' = Strong Right (from defense perspective)
  ruleNumber: 1 | 2 | 3 | 4;
  ruleTitle: string;
  explanation: string;
  offensePerspective: string;
  defensePerspective: string;
}

export interface FormationCoord {
  x: number;
  y: number;
  depthYards: number;
  alignmentDesc: string;
  technique: string;
  sequentialTech?: string;
  gap: string;
}

export interface DefPlayerPosition {
  id: string; // 'NT' | 'LDE' | 'RDE' | 'ROV' | 'SAM' | 'MIKE' | 'WILL' | 'LCB' | 'RCB' | 'FS' | 'SS'
  name: string;
  role: string;
  number?: string;
  isOutsideBacker?: boolean;
  isMiddleBacker?: boolean;
  isDefensiveLine?: boolean;
  isSecondary?: boolean;
  canBlitz?: boolean; // strictly SAM, ROV, MIKE, WILL
  sequentialTechBase: string; // e.g. "0 Tech with Strong A gap", "34 Tech, outside shade of G, 4 yds depth, Strong B Gap"
  sequentialTechCode: string; // e.g. "0 Tech", "34 Tech", "6 Tech", "4 Tech", "14 Tech", "2x2 Contain"
  // Backward compatibility coordinates
  x34: number;
  y34: number;
  x52: number;
  y52: number;
  gap34: string;
  gap52: string;
  technique34: string;
  technique52: string;
  isWalkUpBacker?: boolean;
  // 4 Formations
  formations: Record<DefenseFormation, FormationCoord>;
  baseAssignment: string;
  shieldAssignment: string;
  vanguardAssignment: string;
  shellAssignment: string;
  individualPressure?: {
    callName: string;
    targetGap: string;
    description: string;
    arrowEnd: { x: number; y: number };
  };
}

export interface PlayerCoverageAssignment {
  playerId: string;
  playerName: string;
  group: 'LB' | 'DB';
  roleType: 'zone_drop' | 'man_lock' | 'roamer' | 'rat' | 'jam_rush';
  roleName: string;
  landmarkLabel: string;
  depthYards: string;
  dropTarget: { x: number; y: number };
  controlPoint?: { x: number; y: number };
  technique: string;
  leverage: string;
  keyRead: string;
  coachingPoint: string;
  manTarget?: string;
}

export interface CoverageDetail {
  id: CoverageScheme;
  name: string;
  codeName: string;
  handSignal: string;
  handSignalDesc: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  deepCoverage: string;
  underneathCoverage: string;
  philosophy: string;
  situationalCall: string;
  responsibilities: Record<string, string>;
  playerAssignments: PlayerCoverageAssignment[];
  coverageZones: {
    label: string;
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
    assignedPlayerId: string;
  }[];
}

export interface LineSlantDetail {
  id: LineSlant;
  name: string;
  callCode: string;
  signal: string;
  description: string;
  linemenRule: string;
  slants: {
    playerId: string;
    arrowEnd: { x: number; y: number };
    technique: string;
    targetGap: string;
    label: string;
  }[];
}

export interface FormationInfo {
  id: DefenseFormation;
  name: string;
  codeName: string;
  handSignal: string;
  handSignalDesc: string;
  badgeColor: string;
  summary: string;
  doctrine: string;
  olbRule: string;
  mlbRule: string;
  linemenRule: string;
  secondaryRule: string;
}

export interface PrimerSection {
  id: string;
  title: string;
  category: 'core' | 'adjustments' | 'communication' | 'fronts' | 'formations';
  summary: string;
  keyPoints: string[];
  coachingQuote?: string;
  diagramNotes?: string;
}

// Sequential Tech System Data
export interface SequentialTechItem {
  code: string;
  name: string;
  position: 'Center' | 'Guard' | 'Tackle' | 'TE';
  shade: string;
  gap: string;
  description: string;
}

export const SEQUENTIAL_TECH_RULES: Record<string, SequentialTechItem[]> = {
  Center: [
    { code: '0', name: '0-Tech (Head-Up)', position: 'Center', shade: 'Head-up on Center', gap: 'Default Strong A (or 2-Gap)', description: 'Nose Tackle aligned helmet-to-helmet with Center.' },
    { code: '0 Weak', name: '0-Weak Shade', position: 'Center', shade: 'Weak shoulder of Center', gap: 'Weak A-Gap', description: 'Nose Tackle tilted into weak A-gap.' },
    { code: '0 Strong', name: '0-Strong Shade', position: 'Center', shade: 'Strong shoulder of Center', gap: 'Strong A-Gap', description: 'Nose Tackle tilted into strong A-gap.' },
  ],
  Guard: [
    { code: '1', name: '1-Tech (Inside Shade)', position: 'Guard', shade: 'Inside shade of Guard', gap: 'A-Gap', description: 'Shading inside shoulder toward Center.' },
    { code: '2', name: '2-Tech (Head-Up)', position: 'Guard', shade: 'Head-up on Guard', gap: 'A or B Gap', description: 'Directly over the offensive guard.' },
    { code: '3', name: '3-Tech (Outside Shade)', position: 'Guard', shade: 'Outside shade of Guard', gap: 'B-Gap', description: 'Shading outside shoulder toward Tackle.' },
  ],
  Tackle: [
    { code: '4', name: '4-Tech (Inside Shade)', position: 'Tackle', shade: 'Inside shade of Tackle', gap: 'B-Gap', description: 'WDE standard alignment in Base 3-4 (squeezing B-gap).' },
    { code: '5', name: '5-Tech (Head-Up)', position: 'Tackle', shade: 'Head-up on Tackle', gap: 'B/C Gap', description: 'Directly over the offensive tackle.' },
    { code: '6', name: '6-Tech (Outside Shade)', position: 'Tackle', shade: 'Outside shade of Tackle', gap: 'Strong C-Gap', description: 'SDE standard alignment in Base 3-4 (controlling strong C-gap).' },
  ],
  TE: [
    { code: '7', name: '7-Tech (Inside Shade)', position: 'TE', shade: 'Inside shade of TE', gap: 'C-Gap', description: 'Shading inside shoulder of Tight End.' },
    { code: '8', name: '8-Tech (Head-Up)', position: 'TE', shade: 'Head-up on TE', gap: 'C/D Gap', description: 'Directly over the Tight End.' },
    { code: '9 / 2x0', name: '9-Tech / 2x0 Edge', position: 'TE', shade: 'Outside shade of TE / Edge', gap: 'D-Gap / Perimeter', description: 'Outside containment shoulder or walked up 2x0 on LOS.' },
  ],
};

export interface OffenseScoutPlayer {
  id: string;
  label: string;
  name: string;
  x: number;
  y: number;
  role: string;
  isEligible?: boolean;
}

export interface OffenseFormationConfig {
  id: OffensiveFormationId;
  name: string;
  shortName: string;
  personnel: string;
  formationStyle: 'Under Center' | 'Shotgun' | 'Pistol';
  defaultStrength: StrengthCall;
  description: string;
  adjustmentSummary: string;
  players: OffenseScoutPlayer[];
  adjustments: Record<
    string,
    {
      x: number;
      y: number;
      sequentialTech: string;
      gap: string;
      depthYards: number;
      assignmentNote: string;
    }
  >;
}

// 6 Common Offense Formations to adjust alignment to
export const COMMON_OFFENSE_FORMATIONS: Record<OffensiveFormationId, OffenseFormationConfig> = {
  pro_i: {
    id: 'pro_i',
    name: 'Pro I-Formation',
    shortName: 'Pro I-Form',
    personnel: '(2 RB - 1 TE - 2 WR)',
    formationStyle: 'Under Center',
    defaultStrength: 'liz',
    description: 'Traditional pro set with tight end on right (Y), Fullback and Tailback stacked in I-formation behind QB, split end (X) left and flanker (Z) right.',
    adjustmentSummary: 'Base 3-4 alignment: NG in 0-Tech (Strong A), SDE in 6-Tech (Strong C), WDE in 4-Tech (Weak B). Sam and Rover set 2x2 contain outside LOS. Mike is 34-Tech (Strong B), Will is 14-Tech (Weak A).',
    players: [
      { id: 'OC', label: 'C', name: 'Center', x: 500, y: 412, role: 'Offensive Center' },
      { id: 'OLG', label: 'LG', name: 'Left Guard', x: 445, y: 412, role: 'Weak Guard' },
      { id: 'ORG', label: 'RG', name: 'Right Guard', x: 555, y: 412, role: 'Strong Guard' },
      { id: 'OLT', label: 'LT', name: 'Left Tackle', x: 390, y: 412, role: 'Weak Tackle' },
      { id: 'ORT', label: 'RT', name: 'Right Tackle', x: 610, y: 412, role: 'Strong Tackle' },
      { id: 'OTE', label: 'Y', name: 'Tight End', x: 670, y: 412, role: 'In-line Strong TE', isEligible: true },
      { id: 'OWR1', label: 'X', name: 'Split End', x: 170, y: 412, role: 'Boundary Receiver', isEligible: true },
      { id: 'OWR2', label: 'Z', name: 'Flanker', x: 830, y: 415, role: 'Field Receiver', isEligible: true },
      { id: 'OQB', label: 'QB', name: 'Quarterback', x: 500, y: 445, role: 'Under Center QB' },
      { id: 'OFB', label: 'FB', name: 'Fullback', x: 500, y: 485, role: 'Lead Blocker FB' },
      { id: 'OTB', label: 'TB', name: 'Tailback', x: 500, y: 530, role: 'Deep Ball Carrier' },
    ],
    adjustments: {
      NT: { x: 500, y: 374, sequentialTech: '0 Tech', gap: 'Strong A Gap', depthYards: 0, assignmentNote: '0 Tech with Strong A gap' },
      LDE: { x: 415, y: 374, sequentialTech: '4 Tech', gap: 'Weak B Gap', depthYards: 0, assignmentNote: '4 Tech B Gap (inside shade of OT)' },
      RDE: { x: 615, y: 374, sequentialTech: '6 Tech', gap: 'Strong C Gap', depthYards: 0, assignmentNote: '6 Tech (outside shade of OT) Strong C Gap' },
      ROV: { x: 330, y: 345, sequentialTech: '2x2 Outside Contain', gap: 'Weak Perimeter Contain', depthYards: 2, assignmentNote: '2x2 yards outside LOS Outside contain for cutback/reverse' },
      SAM: { x: 710, y: 345, sequentialTech: '2x2 Outside Contain', gap: 'Strong Edge Contain', depthYards: 2, assignmentNote: '2x2 Outside Contain Strong side take blocks on inside shoulder' },
      MIKE: { x: 565, y: 300, sequentialTech: '34 Tech', gap: 'Strong B Gap', depthYards: 4, assignmentNote: '34 Tech, outside shade of G, 4 yds depth, Strong B Gap' },
      WILL: { x: 435, y: 300, sequentialTech: '14 Tech', gap: 'Weak A Gap', depthYards: 4, assignmentNote: '14 Tech, inside shade WG, 4 yds depth, Weak A Gap' },
      LCB: { x: 170, y: 325, sequentialTech: 'Off / Press (6 yds)', gap: 'Deep Outside 1/3', depthYards: 6, assignmentNote: 'Lock on X receiver' },
      RCB: { x: 830, y: 325, sequentialTech: 'Off / Press (6 yds)', gap: 'Deep Outside 1/3', depthYards: 6, assignmentNote: 'Lock on Z receiver' },
      FS: { x: 440, y: 170, sequentialTech: 'Single-High Post (12 yds)', gap: 'Deep Middle', depthYards: 12, assignmentNote: 'Centerfield cap' },
      SS: { x: 620, y: 220, sequentialTech: 'Invert Apex (8 yds)', gap: 'Strong Alley Fill', depthYards: 8, assignmentNote: 'Roll down into strong alley' },
    },
  },
  spread_2x2: {
    id: 'spread_2x2',
    name: 'Spread 2x2 Open',
    shortName: 'Spread 2x2',
    personnel: '(1 RB - 0 TE - 4 WR)',
    formationStyle: 'Shotgun',
    defaultStrength: 'liz',
    description: 'Shotgun spread with 2 wide receivers left (X and H slot) and 2 wide receivers right (Y slot and Z), single running back offset beside the QB.',
    adjustmentSummary: 'Defense widens apex backers: Sam apexes over Right Slot (3x4 yards off), Rover apexes over Left Slot (3x4 yards off). Mike & Will tighten inside 5-man box (34 and 14 Tech). Safeties play balanced 2-high shell.',
    players: [
      { id: 'OC', label: 'C', name: 'Center', x: 500, y: 412, role: 'Offensive Center' },
      { id: 'OLG', label: 'LG', name: 'Left Guard', x: 445, y: 412, role: 'Offensive Guard' },
      { id: 'ORG', label: 'RG', name: 'Right Guard', x: 555, y: 412, role: 'Offensive Guard' },
      { id: 'OLT', label: 'LT', name: 'Left Tackle', x: 390, y: 412, role: 'Offensive Tackle' },
      { id: 'ORT', label: 'RT', name: 'Right Tackle', x: 610, y: 412, role: 'Offensive Tackle' },
      { id: 'OWR1', label: 'X', name: 'Left Wideout', x: 140, y: 412, role: 'Outside WR Left', isEligible: true },
      { id: 'OWR2', label: 'H', name: 'Left Slot', x: 260, y: 416, role: 'Slot Receiver Left', isEligible: true },
      { id: 'OWR3', label: 'Y', name: 'Right Slot', x: 740, y: 416, role: 'Slot Receiver Right', isEligible: true },
      { id: 'OWR4', label: 'Z', name: 'Right Wideout', x: 860, y: 412, role: 'Outside WR Right', isEligible: true },
      { id: 'OQB', label: 'QB', name: 'Quarterback', x: 500, y: 460, role: 'Shotgun QB' },
      { id: 'ORB', label: 'RB', name: 'Running Back', x: 550, y: 460, role: 'Offset Pass/Draw Back' },
    ],
    adjustments: {
      NT: { x: 500, y: 374, sequentialTech: '0 Tech', gap: 'Strong A Gap', depthYards: 0, assignmentNote: '0 Tech on Center, push pocket' },
      LDE: { x: 405, y: 374, sequentialTech: '4 Tech', gap: 'Weak B Gap', depthYards: 0, assignmentNote: '4 Tech squeeze Tackle B-gap' },
      RDE: { x: 615, y: 374, sequentialTech: '6 Tech', gap: 'Strong C Gap', depthYards: 0, assignmentNote: '6 Tech rush edge on Tackle' },
      ROV: { x: 300, y: 340, sequentialTech: 'Apex 3x4 (Weak Slot)', gap: 'Weak Hook/Curl', depthYards: 3.5, assignmentNote: 'Apexed between LT and Slot H, carry vertical or fold on run' },
      SAM: { x: 700, y: 340, sequentialTech: 'Apex 3x4 (Strong Slot)', gap: 'Strong Hook/Curl', depthYards: 3.5, assignmentNote: 'Apexed between RT and Slot Y, re-route #2 slot receiver' },
      MIKE: { x: 545, y: 295, sequentialTech: '34 Tech Tight Box', gap: 'Strong A/B Gap', depthYards: 4.5, assignmentNote: '34 Tech tight box fit over RG' },
      WILL: { x: 455, y: 295, sequentialTech: '14 Tech Tight Box', gap: 'Weak A/B Gap', depthYards: 4.5, assignmentNote: '14 Tech tight box fit over LG' },
      LCB: { x: 140, y: 330, sequentialTech: 'Off / Press (6 yds)', gap: 'Deep Outside 1/3', depthYards: 6, assignmentNote: 'Press-bail on X' },
      RCB: { x: 860, y: 330, sequentialTech: 'Off / Press (6 yds)', gap: 'Deep Outside 1/3', depthYards: 6, assignmentNote: 'Press-bail on Z' },
      FS: { x: 410, y: 160, sequentialTech: 'Deep Half (13 yds)', gap: 'Weak Deep Half', depthYards: 13, assignmentNote: 'Cap post/seam weak side' },
      SS: { x: 590, y: 170, sequentialTech: 'Deep Half (12 yds)', gap: 'Strong Deep Half', depthYards: 12, assignmentNote: 'Cap post/seam strong side' },
    },
  },
  trips_3x1: {
    id: 'trips_3x1',
    name: 'Trips Right / 3x1',
    shortName: 'Trips Right',
    personnel: '(1 RB - 1 TE - 3 WR)',
    formationStyle: 'Shotgun',
    defaultStrength: 'liz',
    description: '3 receivers aligned to the right side (Y inner slot, H middle slot, Z outside) creating a 3-receiver passing surface, with solo X receiver to the left.',
    adjustmentSummary: 'OVERLOAD PRIMER RULE: (1) Count & Shift: Linebackers shift toward strength to match numbers (Will shifts to Mike, Mike shifts toward Sam, Sam splits the difference). (2) Adjust Safeties: Free Safety moves UP to 6-yard depth for backside containment; Strong Safety adjusts deep to cap vertical routes. (3) Split Coverage: Zone on overloaded strong side, Island Man-to-Man on weakside solo X.',
    players: [
      { id: 'OC', label: 'C', name: 'Center', x: 500, y: 412, role: 'Offensive Center' },
      { id: 'OLG', label: 'LG', name: 'Left Guard', x: 445, y: 412, role: 'Offensive Guard' },
      { id: 'ORG', label: 'RG', name: 'Right Guard', x: 555, y: 412, role: 'Offensive Guard' },
      { id: 'OLT', label: 'LT', name: 'Left Tackle', x: 390, y: 412, role: 'Offensive Tackle' },
      { id: 'ORT', label: 'RT', name: 'Right Tackle', x: 610, y: 412, role: 'Offensive Tackle' },
      { id: 'OWR1', label: 'X', name: 'Solo Wideout', x: 140, y: 412, role: 'Solo Receiver (Weak)', isEligible: true },
      { id: 'OWR2', label: 'Y', name: 'Inner Slot (#3)', x: 680, y: 416, role: '#3 Receiver (Trips)', isEligible: true },
      { id: 'OWR3', label: 'H', name: 'Mid Slot (#2)', x: 770, y: 416, role: '#2 Receiver (Trips)', isEligible: true },
      { id: 'OWR4', label: 'Z', name: 'Trips Wideout (#1)', x: 870, y: 412, role: '#1 Receiver (Trips)', isEligible: true },
      { id: 'OQB', label: 'QB', name: 'Quarterback', x: 500, y: 460, role: 'Shotgun QB' },
      { id: 'ORB', label: 'RB', name: 'Running Back', x: 440, y: 460, role: 'Offset RB' },
    ],
    adjustments: {
      NT: { x: 500, y: 374, sequentialTech: '0 Tech', gap: 'Strong A Gap', depthYards: 0, assignmentNote: '0 Tech with Strong A gap' },
      LDE: { x: 415, y: 374, sequentialTech: '4 Tech', gap: 'Weak B Gap', depthYards: 0, assignmentNote: '4 Tech B Gap (inside shade OT)' },
      RDE: { x: 615, y: 374, sequentialTech: '6 Tech', gap: 'Strong C Gap', depthYards: 0, assignmentNote: '6 Tech (outside shade OT) Strong C Gap' },
      ROV: { x: 370, y: 320, sequentialTech: '2x2 Weak Box Contain', gap: 'Weak B/C Gap Contain', depthYards: 2, assignmentNote: 'Maintain weakside containment and hold weak gap' },
      WILL: { x: 540, y: 300, sequentialTech: 'Shift to Mike (34 Tech)', gap: 'Strong A/B Gap', depthYards: 4, assignmentNote: 'Count & Shift: Will moves to next LB spot (Mike), matching overloaded numbers' },
      MIKE: { x: 630, y: 300, sequentialTech: 'Shift to Sam (64 Tech)', gap: 'Strong C Gap / Overhang', depthYards: 4, assignmentNote: 'Count & Shift: Mike shifts toward Sam to match numbers over strong tackle' },
      SAM: { x: 750, y: 330, sequentialTech: 'Split Difference Apex', gap: 'Trips Seam/Flat', depthYards: 3, assignmentNote: 'Count & Shift: Sam splits the difference between shifted LBs and Trips receivers' },
      LCB: { x: 140, y: 340, sequentialTech: 'Island Man-to-Man (4 yds)', gap: 'Weak Solo Island', depthYards: 4, assignmentNote: 'Split Coverage: Island man-to-man locked on solo X receiver' },
      RCB: { x: 870, y: 310, sequentialTech: 'Trips Zone Cloud (7 yds)', gap: 'Deep Outside 1/3 Zone', depthYards: 7, assignmentNote: 'Split Coverage: Zone coverage on overloaded strong side' },
      FS: { x: 350, y: 265, sequentialTech: 'Backside Contain (6 yds depth)', gap: 'Weak Alley / Contain', depthYards: 6, assignmentNote: 'Adjust Safeties: FS moves UP to 6-yard depth to handle backside containment' },
      SS: { x: 740, y: 155, sequentialTech: 'Deep Vertical Bracket (13 yds)', gap: 'Deep Trips Post/Seam', depthYards: 13, assignmentNote: 'Adjust Safeties: SS adjusts deep to 13-yard depth for potential vertical routes' },
    },
  },
  heavy_2te: {
    id: 'heavy_2te',
    name: 'Heavy Double TE',
    shortName: 'Double TE Heavy',
    personnel: '(2 RB - 2 TE - 1 WR)',
    formationStyle: 'Under Center',
    defaultStrength: 'rip',
    description: 'Power run formation with tight ends attached to both sides of the offensive line (Y1 left, Y2 right), creating 7 blockers on the line with Fullback and Tailback.',
    adjustmentSummary: 'SHIELD ADJUSTMENT: Both Sam and Rover walk up on the line in 2x0 outside the tight ends (9-Tech), creating an impenetrable 5-man line of scrimmage. Mike (34) & Will (14) scrape clean downhill.',
    players: [
      { id: 'OC', label: 'C', name: 'Center', x: 500, y: 412, role: 'Offensive Center' },
      { id: 'OLG', label: 'LG', name: 'Left Guard', x: 445, y: 412, role: 'Offensive Guard' },
      { id: 'ORG', label: 'RG', name: 'Right Guard', x: 555, y: 412, role: 'Offensive Guard' },
      { id: 'OLT', label: 'LT', name: 'Left Tackle', x: 390, y: 412, role: 'Offensive Tackle' },
      { id: 'ORT', label: 'RT', name: 'Right Tackle', x: 610, y: 412, role: 'Offensive Tackle' },
      { id: 'OTE1', label: 'Y1', name: 'Left Tight End', x: 330, y: 412, role: 'Weak Tight End', isEligible: true },
      { id: 'OTE2', label: 'Y2', name: 'Right Tight End', x: 670, y: 412, role: 'Strong Tight End', isEligible: true },
      { id: 'OWR1', label: 'X', name: 'Split End', x: 150, y: 412, role: 'Boundary WR', isEligible: true },
      { id: 'OQB', label: 'QB', name: 'Quarterback', x: 500, y: 445, role: 'Under Center QB' },
      { id: 'OFB', label: 'FB', name: 'Fullback', x: 500, y: 485, role: 'Lead Blocker' },
      { id: 'OTB', label: 'TB', name: 'Tailback', x: 500, y: 530, role: 'Power Back' },
    ],
    adjustments: {
      NT: { x: 500, y: 374, sequentialTech: '0 Tech', gap: 'Strong A Gap', depthYards: 0, assignmentNote: '0 Tech violently lockout Center' },
      LDE: { x: 380, y: 374, sequentialTech: '4/7 Tech', gap: 'Weak B/C Gap', depthYards: 0, assignmentNote: 'Squeeze inside shoulder of Left TE' },
      RDE: { x: 620, y: 374, sequentialTech: '6 Tech', gap: 'Strong C Gap', depthYards: 0, assignmentNote: '6 Tech outside RT, squeeze TE block' },
      ROV: { x: 290, y: 374, sequentialTech: '9 Tech (2x0 Walked-Up)', gap: 'Weak D Gap Contain', depthYards: 0, assignmentNote: 'Walked up 2x0 on LOS outside Left TE. Set stone edge' },
      SAM: { x: 710, y: 374, sequentialTech: '9 Tech (2x0 Walked-Up)', gap: 'Strong D Gap Contain', depthYards: 0, assignmentNote: 'Walked up 2x0 on LOS outside Right TE. Jam TE, turn runs inside' },
      MIKE: { x: 555, y: 295, sequentialTech: '34 Tech Downhill', gap: 'Strong B Gap', depthYards: 4.5, assignmentNote: '34 Tech clean downhill fill behind 5-man line' },
      WILL: { x: 445, y: 295, sequentialTech: '14 Tech Downhill', gap: 'Weak A Gap', depthYards: 4.5, assignmentNote: '14 Tech downhill run stopper' },
      LCB: { x: 150, y: 330, sequentialTech: 'Press-Man (5 yds)', gap: 'Deep 1/3', depthYards: 5, assignmentNote: 'Press-man on solo receiver' },
      RCB: { x: 840, y: 330, sequentialTech: 'Force Alley (5 yds)', gap: 'Deep 1/3 / Edge', depthYards: 5, assignmentNote: 'Run support on tight side' },
      FS: { x: 450, y: 170, sequentialTech: 'Single-High Post (12 yds)', gap: 'Deep Middle', depthYards: 12, assignmentNote: 'Deep post cap' },
      SS: { x: 630, y: 230, sequentialTech: '8-Man Box Alley (8 yds)', gap: 'Strong Alley Fill', depthYards: 8, assignmentNote: 'Roll into 8-man box outside Sam' },
    },
  },
  pistol_veer: {
    id: 'pistol_veer',
    name: 'Pistol Option Veer',
    shortName: 'Pistol Veer',
    personnel: '(2 RB - 1 TE - 2 WR)',
    formationStyle: 'Pistol',
    defaultStrength: 'liz',
    description: 'Quarterback in Pistol alignment at 4 yards depth with offset Fullback/Dive back and trailing Halfback/Pitch back, TE on right, split ends wide.',
    adjustmentSummary: 'Option Discipline: SDE (6-Tech) crashes to eliminate the inside dive. Sam (2x2) maintains strict outside contain on the pitch man. Mike scrapes downhill to QB keep track. Rover locks down weak reverse.',
    players: [
      { id: 'OC', label: 'C', name: 'Center', x: 500, y: 412, role: 'Offensive Center' },
      { id: 'OLG', label: 'LG', name: 'Left Guard', x: 445, y: 412, role: 'Offensive Guard' },
      { id: 'ORG', label: 'RG', name: 'Right Guard', x: 555, y: 412, role: 'Offensive Guard' },
      { id: 'OLT', label: 'LT', name: 'Left Tackle', x: 390, y: 412, role: 'Offensive Tackle' },
      { id: 'ORT', label: 'RT', name: 'Right Tackle', x: 610, y: 412, role: 'Offensive Tackle' },
      { id: 'OTE', label: 'Y', name: 'Tight End', x: 670, y: 412, role: 'In-line TE', isEligible: true },
      { id: 'OWR1', label: 'X', name: 'Split End', x: 170, y: 412, role: 'Boundary WR', isEligible: true },
      { id: 'OWR2', label: 'Z', name: 'Flanker', x: 830, y: 415, role: 'Field WR', isEligible: true },
      { id: 'OQB', label: 'QB', name: 'Quarterback', x: 500, y: 455, role: 'Pistol QB (4 yds)' },
      { id: 'OFB', label: 'FB', name: 'Dive Back', x: 460, y: 475, role: 'Offset Dive Back' },
      { id: 'OTB', label: 'HB', name: 'Pitch Back', x: 500, y: 520, role: 'Trailing Pitch Option' },
    ],
    adjustments: {
      NT: { x: 500, y: 374, sequentialTech: '0 Tech', gap: 'Strong A Gap', depthYards: 0, assignmentNote: '0 Tech command A-gaps against dive' },
      LDE: { x: 415, y: 374, sequentialTech: '4 Tech', gap: 'Weak B Gap', depthYards: 0, assignmentNote: '4 Tech squeeze dive back' },
      RDE: { x: 615, y: 374, sequentialTech: '6 Tech (Dive Squeeze)', gap: 'Dive Option', depthYards: 0, assignmentNote: '6 Tech squeeze tackle down-block and destroy dive back' },
      ROV: { x: 330, y: 345, sequentialTech: '2x2 Outside Contain', gap: 'Cutback / Bootleg', depthYards: 2, assignmentNote: '2x2 yards outside LOS Outside contain for cutback/reverse' },
      SAM: { x: 710, y: 345, sequentialTech: '2x2 Outside Contain (Pitch)', gap: 'Pitch Option', depthYards: 2, assignmentNote: '2x2 Outside Contain, take pitch on outside shoulder' },
      MIKE: { x: 565, y: 300, sequentialTech: '34 Tech (QB Keep)', gap: 'QB Keep Fit', depthYards: 4, assignmentNote: '34 Tech, attack QB keep on mesh' },
      WILL: { x: 435, y: 300, sequentialTech: '14 Tech (Fold Fill)', gap: 'Weak A Gap', depthYards: 4, assignmentNote: '14 Tech inside shade WG, fold downhill on trap' },
      LCB: { x: 170, y: 325, sequentialTech: 'Press-Bail (6 yds)', gap: 'Deep 1/3', depthYards: 6, assignmentNote: 'Lock X receiver' },
      RCB: { x: 830, y: 325, sequentialTech: 'Press-Bail (6 yds)', gap: 'Deep 1/3', depthYards: 6, assignmentNote: 'Lock Z receiver' },
      FS: { x: 440, y: 170, sequentialTech: 'Single-High Post (12 yds)', gap: 'Deep Middle', depthYards: 12, assignmentNote: 'Alley fill on option breakaway' },
      SS: { x: 620, y: 220, sequentialTech: 'Invert Pitch Force (8 yds)', gap: 'Secondary Pitch Alley', depthYards: 8, assignmentNote: 'Fast downhill fill on pitch track' },
    },
  },
  empty_5w: {
    id: 'empty_5w',
    name: 'Empty 5-Wide Spread',
    shortName: 'Empty 5-Wide',
    personnel: '(0 RB - 0 TE - 5 WR)',
    formationStyle: 'Shotgun',
    defaultStrength: 'liz',
    description: 'Empty backfield with 5 receivers deployed across the field (3 right, 2 left), QB isolated in shotgun.',
    adjustmentSummary: 'SHELL PREVENT ADJUSTMENT: 3-man rush pins ears back for speed sack. Mike & Will drop to 6 yards depth in hook/hole. Sam & Rover buzz flats at 4 yards off. Safeties cap deep halves at 14 yards.',
    players: [
      { id: 'OC', label: 'C', name: 'Center', x: 500, y: 412, role: 'Offensive Center' },
      { id: 'OLG', label: 'LG', name: 'Left Guard', x: 445, y: 412, role: 'Offensive Guard' },
      { id: 'ORG', label: 'RG', name: 'Right Guard', x: 555, y: 412, role: 'Offensive Guard' },
      { id: 'OLT', label: 'LT', name: 'Left Tackle', x: 390, y: 412, role: 'Offensive Tackle' },
      { id: 'ORT', label: 'RT', name: 'Right Tackle', x: 610, y: 412, role: 'Offensive Tackle' },
      { id: 'OWR1', label: 'X', name: 'Left Wideout', x: 120, y: 412, role: '#1 Left WR', isEligible: true },
      { id: 'OWR2', label: 'H', name: 'Left Slot', x: 250, y: 416, role: '#2 Left Slot', isEligible: true },
      { id: 'OWR3', label: 'Y', name: 'Inner Right Slot', x: 670, y: 416, role: '#3 Right Slot', isEligible: true },
      { id: 'OWR4', label: 'W', name: 'Mid Right Slot', x: 770, y: 416, role: '#2 Right Slot', isEligible: true },
      { id: 'OWR5', label: 'Z', name: 'Right Wideout', x: 880, y: 412, role: '#1 Right WR', isEligible: true },
      { id: 'OQB', label: 'QB', name: 'Quarterback', x: 500, y: 460, role: 'Solo Shotgun QB' },
    ],
    adjustments: {
      NT: { x: 500, y: 374, sequentialTech: '0 Tech (Bull Rush)', gap: 'Sack QB', depthYards: 0, assignmentNote: 'Bull rush pocket, go get a sack!' },
      LDE: { x: 405, y: 374, sequentialTech: '4 Tech (Speed Edge)', gap: 'Sack QB', depthYards: 0, assignmentNote: 'Speed edge rush on LT, hunt sack' },
      RDE: { x: 615, y: 374, sequentialTech: '6 Tech (Speed Edge)', gap: 'Sack QB', depthYards: 0, assignmentNote: 'Speed edge rush on RT, hunt sack' },
      ROV: { x: 310, y: 320, sequentialTech: 'Flat Buzz (4 yds)', gap: 'Weak Flat', depthYards: 4, assignmentNote: 'Drop 4 yds, match #2 slot out route' },
      SAM: { x: 710, y: 320, sequentialTech: 'Flat Buzz (4 yds)', gap: 'Strong Flat', depthYards: 4, assignmentNote: 'Drop 4 yds, match #2/#3 slot out route' },
      MIKE: { x: 550, y: 260, sequentialTech: 'Hook/Hole Drop (6 yds)', gap: 'Middle Hole', depthYards: 6, assignmentNote: 'Drop back 6 yds, protect intermediate dig' },
      WILL: { x: 450, y: 260, sequentialTech: 'Hook/Hole Drop (6 yds)', gap: 'Middle Hole', depthYards: 6, assignmentNote: 'Drop back 6 yds, match shallow crosses' },
      LCB: { x: 120, y: 290, sequentialTech: 'Deep Cushion (9 yds)', gap: 'Deep 1/3', depthYards: 9, assignmentNote: 'Deep bail, protect boundary sideline' },
      RCB: { x: 880, y: 290, sequentialTech: 'Deep Cushion (9 yds)', gap: 'Deep 1/3', depthYards: 9, assignmentNote: 'Deep bail, protect field sideline' },
      FS: { x: 420, y: 140, sequentialTech: 'Deep Half (14 yds)', gap: 'Deep Prevent Half', depthYards: 14, assignmentNote: 'Centerfield prevent' },
      SS: { x: 620, y: 140, sequentialTech: 'Deep Half (14 yds)', gap: 'Deep Prevent Half', depthYards: 14, assignmentNote: 'Deep half prevent' },
    },
  },
};

/**
 * AUTO-DETECT STRENGTH CALL
 * Strength Call Rules (from Defensive Perspective facing the offense):
 * Defense faces South (toward offense at y=412).
 * Screen Right (x > 500, Offense's Right) is DEFENSE'S LEFT (LIZ).
 * Screen Left (x < 500, Offense's Left) is DEFENSE'S RIGHT (RIP).
 * 
 * 1: TE side
 * 2: WR heavy side
 * 3: Wide side of field if balanced formation
 * 4: If balanced in the middle - Strong Left
 */
export function detectStrengthCall(
  formationId: OffensiveFormationId,
  ballHash: BallHashPosition = 'middle'
): StrengthDetectionResult {
  const config = COMMON_OFFENSE_FORMATIONS[formationId];
  const players = config.players;

  // Helper to accurately identify tight ends attached on line
  const isTE = (p: (typeof players)[0]) =>
    p.id.includes('TE') ||
    p.role.toLowerCase().includes('tight end') ||
    p.role.toLowerCase().includes('in-line') ||
    (p.label.startsWith('Y') && !p.id.startsWith('OWR') && !p.role.toLowerCase().includes('slot') && !p.role.toLowerCase().includes('wideout'));

  // Rule 1: TE side
  const leftTEs = players.filter((p) => p.x < 500 && isTE(p));
  const rightTEs = players.filter((p) => p.x > 500 && isTE(p));

  if (rightTEs.length > leftTEs.length) {
    // TE on Offense Right -> Defense Left (LIZ)
    const teLabel = rightTEs.map((t) => t.label).join('/');
    return {
      call: 'liz',
      ruleNumber: 1,
      ruleTitle: 'Rule 1: TE Side',
      explanation: `Tight End (${teLabel}) attached to Offense Right ➔ Defense calls Strong Left (LIZ)`,
      offensePerspective: 'Offense Right (TE Side)',
      defensePerspective: 'Strong Left (LIZ)',
    };
  }

  if (leftTEs.length > rightTEs.length) {
    // TE on Offense Left -> Defense Right (RIP)
    const teLabel = leftTEs.map((t) => t.label).join('/');
    return {
      call: 'rip',
      ruleNumber: 1,
      ruleTitle: 'Rule 1: TE Side',
      explanation: `Tight End (${teLabel}) attached to Offense Left ➔ Defense calls Strong Right (RIP)`,
      offensePerspective: 'Offense Left (TE Side)',
      defensePerspective: 'Strong Right (RIP)',
    };
  }

  // Rule 2: WR heavy side (if TEs are balanced or 0)
  const leftWRs = players.filter(
    (p) =>
      p.x < 490 &&
      p.isEligible &&
      !leftTEs.some((t) => t.id === p.id) &&
      (p.role.toLowerCase().includes('wr') ||
        p.role.toLowerCase().includes('wideout') ||
        p.role.toLowerCase().includes('receiver') ||
        p.role.toLowerCase().includes('slot') ||
        ['X', 'H', 'Z', 'W'].includes(p.label))
  );

  const rightWRs = players.filter(
    (p) =>
      p.x > 510 &&
      p.isEligible &&
      !rightTEs.some((t) => t.id === p.id) &&
      (p.role.toLowerCase().includes('wr') ||
        p.role.toLowerCase().includes('wideout') ||
        p.role.toLowerCase().includes('receiver') ||
        p.role.toLowerCase().includes('slot') ||
        ['X', 'H', 'Z', 'W'].includes(p.label))
  );

  if (rightWRs.length > leftWRs.length) {
    // WR heavy on Offense Right -> Defense Left (LIZ)
    return {
      call: 'liz',
      ruleNumber: 2,
      ruleTitle: 'Rule 2: WR Heavy Side',
      explanation: `${rightWRs.length} WRs on Offense Right vs ${leftWRs.length} on Left ➔ Defense calls Strong Left (LIZ)`,
      offensePerspective: 'Offense Right (WR Heavy)',
      defensePerspective: 'Strong Left (LIZ)',
    };
  }

  if (leftWRs.length > rightWRs.length) {
    // WR heavy on Offense Left -> Defense Right (RIP)
    return {
      call: 'rip',
      ruleNumber: 2,
      ruleTitle: 'Rule 2: WR Heavy Side',
      explanation: `${leftWRs.length} WRs on Offense Left vs ${rightWRs.length} on Right ➔ Defense calls Strong Right (RIP)`,
      offensePerspective: 'Offense Left (WR Heavy)',
      defensePerspective: 'Strong Right (RIP)',
    };
  }

  // Rule 3: Wide side of field if balanced formation
  if (ballHash === 'left_hash') {
    return {
      call: 'liz',
      ruleNumber: 3,
      ruleTitle: 'Rule 3: Wide Side of Field',
      explanation: 'Balanced formation with ball on Left Hash ➔ Wide side is Defense Left (LIZ)',
      offensePerspective: 'Wide Side Right',
      defensePerspective: 'Strong Left (LIZ)',
    };
  }

  if (ballHash === 'right_hash') {
    return {
      call: 'rip',
      ruleNumber: 3,
      ruleTitle: 'Rule 3: Wide Side of Field',
      explanation: 'Balanced formation with ball on Right Hash ➔ Wide side is Defense Right (RIP)',
      offensePerspective: 'Wide Side Left',
      defensePerspective: 'Strong Right (RIP)',
    };
  }

  // Rule 4: If balanced in the middle - Strong Left
  return {
    call: 'liz',
    ruleNumber: 4,
    ruleTitle: 'Rule 4: Balanced in Middle',
    explanation: 'Balanced formation in middle of field ➔ Defense default is Strong Left (LIZ)',
    offensePerspective: 'Balanced Center',
    defensePerspective: 'Strong Left (LIZ)',
  };
}

// 4 Formations from Defensive Primer
export const FORMATION_INFO: Record<DefenseFormation, FormationInfo> = {
  base: {
    id: 'base',
    name: 'Base 3-4 Alignment',
    codeName: 'BASE',
    handSignal: '✊ Fist held up, palm out',
    handSignalDesc: 'Closed fist raised high overhead, knuckles pointing forward, palm facing outward.',
    badgeColor: '#14B8A6',
    summary: 'Standard 3-4 alignment with 3 down linemen and 4 linebackers stacked off the line of scrimmage.',
    doctrine: 'Two-high safety disguise with 4 apexed/stacked linebackers. Gives flexibility to defend spread option, perimeter sweep, or drop 8 into coverage.',
    olbRule: 'Sam & Rover align apexed 4 yards off the line of scrimmage outside the offensive tackles/TE, maintaining force and edge leverage.',
    mlbRule: 'Mike & Will stacked 4.5–5 yards off the ball behind defensive ends. Read offensive guard uncovered/covered keys and flow inside-out.',
    linemenRule: 'From primer: If you don’t hear a slant call, either pick the gap in front of you or if you’re heads-up you default pick the strong direction gap.',
    secondaryRule: 'In zone coverages (Cover 2 Blue & Cover 3 Green), Cornerbacks align with outside leverage (5-7 yds off). In man (Cover 1 Black), CBs align with inside leverage. Safeties split at 10-12 yards depth reading quarterback intent.',
  },
  shield: {
    id: 'shield',
    name: 'Shield (5-2 Walked-Up)',
    codeName: 'SHIELD',
    handSignal: '👊 Fist held in front of body, palm in',
    handSignalDesc: 'Tight fist held centered in front of chest/sternum, knuckles facing outward, palm facing inward toward body.',
    badgeColor: '#2DD4BF',
    summary: 'The same 3-4 but the OLBs (Sam & Rover) walk up to the line in a 5-2 (5 D-line, 2 Linebackers).',
    doctrine: 'Transforms our odd front into an impenetrable 5-man line of scrimmage. Destroys outside veer release angles and keeps the 2 middle backers clean.',
    olbRule: 'Sam and Rover walk up to the line of scrimmage aligned 2x0 at the outside offensive lineman at the end of the line of scrimmage (2 yds outside, 0 yds back / on LOS). Set a stone wall edge.',
    mlbRule: 'Mike & Will stay stacked at 4.5 yards depth. With the 5-man line eating blocks, scrape downhill fast and fill inside gaps unblocked.',
    linemenRule: 'Interior 3 linemen command A and B gaps with violent lockout hands, spilling any inside dive to the walked-up outside linebackers.',
    secondaryRule: 'Strong Safety rolls down to provide alley fill on option/toss; Free Safety caps the deep middle third.',
  },
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard (Goal Line / Short-Yardage)',
    codeName: 'VANGUARD',
    handSignal: '⚔️ Vanguard Short-Yardage Alert',
    handSignalDesc: 'Both arms crossed at wrists low in front of knees / downward chopping motion.',
    badgeColor: '#EAB308',
    summary: 'Shield formation with MLBs walked up to 2 yard depth and Safeties walked up to 5 yards depth.',
    doctrine: 'Maximum run penetration for 3rd/4th & short and goal line stands inside the 5-yard line. Erases all interior bubbles.',
    olbRule: 'Sam and Rover locked in 2x0 on the line of scrimmage at the end man on the line. Jam tight end/tackle violently and close off any outside alley.',
    mlbRule: 'From primer: One rule for MLB, if you’re stacked over one of the linemen, pick the open gap assignment and align over it. Stance at aggressive 2-yard depth ready to fire through the gap on snap.',
    linemenRule: 'Zero pass drop hesitation. Fire low off the ball, establish half-man leverage in assigned gaps, and blow up the line of scrimmage.',
    secondaryRule: 'Safeties walked up to 5 yards depth acting as secondary linebackers. Cornerbacks locked in tight press-man (1-2 yards off WR).',
  },
  shell: {
    id: 'shell',
    name: 'Shell (Deep Pass / Prevent)',
    codeName: 'SHELL',
    handSignal: '🛡️ Shell Prevent Alert',
    handSignalDesc: 'Both open hands extended outward and pressed back, signaling secondary retreat.',
    badgeColor: '#60A5FA',
    summary: 'Prevent situation defending a deep pass. OLBs drop to 4 yds, MLBs back to 6 yds, Safeties back to 12+ yds.',
    doctrine: 'Used in 3rd & 15+, 2-minute prevent, or end of half. No receiver gets behind the defense, and linemen are freed to get a sack.',
    olbRule: 'Outside backers (Sam & Rover) drop to 4 yards off the line, buzzing underneath flats and matching slot crossers.',
    mlbRule: 'Middle backers (Mike & Will) drop back to 6 yards depth, matching low hole and intermediate middle dig routes.',
    linemenRule: 'From primer: Linemen, in Shell you should be expecting a pass, which means go get us a sack! Pin ears back on pure speed rush.',
    secondaryRule: 'Safeties drop back to 12–15 yards depth to cap any post or go route. Cornerbacks bail at snap protecting deep sidelines.',
  },
};

// 11 Defenders: Outside backers strictly SAM and ROVER; Inside backers MIKE and WILL
export const DEFENSE_PLAYERS: DefPlayerPosition[] = [
  {
    id: 'NT',
    name: 'Nose Tackle',
    role: 'Nose Tackle (Interior Anchor · 0-Tech)',
    number: '90',
    isDefensiveLine: true,
    sequentialTechBase: '0 Tech with Strong A gap',
    sequentialTechCode: '0 Tech',
    x34: 500,
    y34: 374,
    x52: 500,
    y52: 374,
    gap34: 'A-Gap (Pick strong gap default)',
    gap52: 'Strong A-Gap Wedge',
    technique34: '0-Technique (Head up Center)',
    technique52: '0/1-Technique Shade',
    formations: {
      base: {
        x: 500,
        y: 374,
        depthYards: 0,
        alignmentDesc: '0-Tech with Strong A gap. If no slant call heard, pick strong gap default.',
        technique: '0-Technique',
        sequentialTech: '0 Tech (Strong A)',
        gap: 'Strong A Gap',
      },
      shield: {
        x: 500,
        y: 374,
        depthYards: 0,
        alignmentDesc: '0/1-Tech Shade on Center. Occupy double-team so inside backers run free.',
        technique: '0/1-Technique',
        sequentialTech: '0-Strong Shade',
        gap: 'A-Gap (Interior wedge)',
      },
      vanguard: {
        x: 500,
        y: 374,
        depthYards: 0,
        alignmentDesc: '0-Tech heavy low stance on Center. Fire low into A-gap, collapse the wedge.',
        technique: '0-Technique Goal Line',
        sequentialTech: '0 Tech',
        gap: 'A-Gap Penetration',
      },
      shell: {
        x: 500,
        y: 374,
        depthYards: 0,
        alignmentDesc: '0-Tech pass rush. Expecting pass: push pocket straight back into QB’s face!',
        technique: 'Bull Rush / Pass Penetration',
        sequentialTech: '0 Tech (Bull Rush)',
        gap: 'Pass Rush / Go Get a Sack',
      },
    },
    baseAssignment: '0 Tech with Strong A gap. Strike breastplate with violent 2-gap hands. Default pick strong gap if no slant call heard.',
    shieldAssignment: 'Anchor against double-team, squeeze Strong A-gap and prevent interior climb on Mike/Will.',
    vanguardAssignment: 'Submarine low underneath Center pads to eliminate short-yardage quarterback sneak.',
    shellAssignment: 'From primer: In Shell you should be expecting a pass, which means go get us a sack! Violent bull rush into QB launch point.',
    canBlitz: false,
  },
  {
    id: 'LDE',
    name: 'Left Defensive End',
    role: 'Defensive End (Weak 4-Tech B Gap)',
    number: '95',
    isDefensiveLine: true,
    sequentialTechBase: '4 Tech B Gap',
    sequentialTechCode: '4 Tech',
    x34: 415,
    y34: 374,
    x52: 415,
    y52: 374,
    gap34: 'B-Gap / Squeeze Tackle',
    gap52: 'B-Gap hard squeeze',
    technique34: '4-Technique (Inside shade Tackle)',
    technique52: '4/5-Technique inside squeeze',
    formations: {
      base: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: '4 Tech B Gap (inside shade of OT). Squeeze B-gap and protect inside linebackers.',
        technique: '4-Technique',
        sequentialTech: '4 Tech (Weak B Gap)',
        gap: 'Weak B Gap',
      },
      shield: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: '4/5-Tech on Tackle. Hard inside squeeze to spill all runs to walked-up Rover.',
        technique: '4/5-Technique Squeeze',
        sequentialTech: '4 Tech Squeeze',
        gap: 'B-Gap Spill',
      },
      vanguard: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'Tight 4-Tech. Fire inside shoulder of tackle to seal off B-gap surge.',
        technique: '4-Technique Tight',
        sequentialTech: '4 Tech',
        gap: 'B-Gap Seal',
      },
      shell: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: '4-Tech speed rush. Pure sack mentality: rip and bend edge on QB.',
        technique: 'Speed Edge Rush',
        sequentialTech: '4 Tech (Speed Rush)',
        gap: 'Pass Rush / Go Get a Sack',
      },
    },
    baseAssignment: '4 Tech B Gap. Align inside shade of OT. Squeeze offensive tackle down-block and control B-gap.',
    shieldAssignment: 'Slant hard inside B-gap. Spill pulling guards or fullback directly to Rover on the edge.',
    vanguardAssignment: 'Pinch inside B-gap to stop dive instantly.',
    shellAssignment: 'Expecting pass! Speed rush through the B/C seam to chase down QB.',
    canBlitz: false,
  },
  {
    id: 'RDE',
    name: 'Right Defensive End',
    role: 'Defensive End (Strong 6-Tech Strong C Gap)',
    number: '99',
    isDefensiveLine: true,
    sequentialTechBase: '6 Tech (outside shade of OT) Strong C Gap',
    sequentialTechCode: '6 Tech',
    x34: 585,
    y34: 374,
    x52: 585,
    y52: 374,
    gap34: 'Strong C Gap / Outside OT',
    gap52: 'Strong C Gap hard squeeze',
    technique34: '6-Technique (Outside shade OT)',
    technique52: '6-Technique (Dense 5-man line wedge)',
    formations: {
      base: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: '6 Tech (outside shade of OT) Strong C Gap. Control C-gap and set strong perimeter.',
        technique: '6-Technique',
        sequentialTech: '6 Tech (Strong C Gap)',
        gap: 'Strong C Gap',
      },
      shield: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: '6-Tech on Tackle. Dense wedge to spill all runs outside to walked-up Sam.',
        technique: '6-Technique Squeeze',
        sequentialTech: '6 Tech Squeeze',
        gap: 'C-Gap Spill',
      },
      vanguard: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'Tight 6-Tech. Penetrate strong C-gap, stone pulling blockers.',
        technique: '6-Technique Tight',
        sequentialTech: '6 Tech',
        gap: 'C-Gap Seal',
      },
      shell: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: '6-Tech pass rush. Speed rush the strong tackle, hunt the sack.',
        technique: 'Pass Rush Penetration',
        sequentialTech: '6 Tech (Speed Rush)',
        gap: 'Pass Rush / Go Get a Sack',
      },
    },
    baseAssignment: '6 Tech (outside shade of OT) Strong C Gap. Lock out with arms, penetrate and protect inside linebackers.',
    shieldAssignment: 'Squeeze outside tackle. Prevent interior crease and force all runs outside to Sam.',
    vanguardAssignment: 'Squeeze violently and eliminate dive back.',
    shellAssignment: 'Pure sack mentality! Drive tackle back into QB pocket.',
    canBlitz: false,
  },
  {
    id: 'ROV',
    name: 'Rover',
    role: 'Rover (Weak Outside Linebacker / Hybrid Force)',
    number: '55',
    isOutsideBacker: true,
    isWalkUpBacker: true,
    sequentialTechBase: '2x2 yards outside LOS Outside contain for cutback/reverse',
    sequentialTechCode: '2x2 Contain',
    x34: 340,
    y34: 310,
    x52: 340,
    y52: 374,
    gap34: 'D-Gap / Weak Perimeter',
    gap52: '2x0 on LOS · C/D-Gap Contain & Hard Edge',
    technique34: '2x2 Outside Contain (2 yds off LOS)',
    technique52: '2x0 Alignment on LOS (9-Tech Edge)',
    formations: {
      base: {
        x: 340,
        y: 310,
        depthYards: 2,
        alignmentDesc: '2x2 yards outside LOS Outside contain for cutback/reverse. Never let ball outside.',
        technique: '2x2 Outside Contain',
        sequentialTech: '2x2 Outside Contain',
        gap: 'Weak D-Gap / Perimeter',
      },
      shield: {
        x: 330,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'WALKED UP ON LOS! Aligned 2x0 at outside OL at end of line. Hard edge.',
        technique: '2x0 Alignment at End of LOS',
        sequentialTech: '9-Tech / 2x0 on LOS',
        gap: 'C/D-Gap Edge / Outside Contain',
      },
      vanguard: {
        x: 330,
        y: 374,
        depthYards: 0,
        alignmentDesc: '2x0 on LOS at end man of line. Crash edge, destroy pitch or bootleg.',
        technique: '2x0 Goal Line Edge Crash',
        sequentialTech: '2x0 Edge Crash',
        gap: 'Contain & Edge Destruction',
      },
      shell: {
        x: 320,
        y: 310,
        depthYards: 4,
        alignmentDesc: 'From primer: Outside backer drops to 4 yards off to defend deep pass / flat.',
        technique: '4 Yards Off / Flat Buzz',
        sequentialTech: '4 Yards Off / Flat Buzz',
        gap: 'Weak Hook / Flat Underneath',
      },
    },
    baseAssignment: '2x2 yards outside LOS Outside contain for cutback/reverse. Read tackle release, contain bounce runs, drop to hook/curl on pass.',
    shieldAssignment: 'From primer: Walk up to the line in a 5-2, aligned 2x0 at the outside O-lineman at the end of the line. Set a hard edge: nothing gets outside your outside shoulder.',
    vanguardAssignment: 'Locked on LOS in 2x0. Blow up any toss or QB sweep at the boundary.',
    shellAssignment: 'Drop to 4 yards off. Buzz the weak flat and eliminate quick swing or curl routes.',
    canBlitz: true,
    individualPressure: {
      callName: 'Rover',
      targetGap: 'Assigned Weak Edge / C-Gap',
      description: 'Rover shoots assigned edge gap based on defensive line alignment.',
      arrowEnd: { x: 330, y: 450 },
    },
  },
  {
    id: 'SAM',
    name: 'Sam',
    role: 'Sam (Strong Outside Linebacker / Edge Enforcer)',
    number: '58',
    isOutsideBacker: true,
    isWalkUpBacker: true,
    sequentialTechBase: '2x2 Outside Contain Strong side take blocks on inside shoulder',
    sequentialTechCode: '2x2 Contain',
    x34: 660,
    y34: 310,
    x52: 700,
    y52: 374,
    gap34: 'C/D-Gap / Strong Alley Force',
    gap52: '2x0 on LOS · Hard Edge & TE Jam',
    technique34: '2x2 Outside Contain (2 yds off LOS)',
    technique52: '2x0 Alignment on LOS (7/9-Tech Edge)',
    formations: {
      base: {
        x: 660,
        y: 310,
        depthYards: 2,
        alignmentDesc: '2x2 Outside Contain Strong side take blocks on inside shoulder. Force defender.',
        technique: '2x2 Outside Contain',
        sequentialTech: '2x2 Outside Contain',
        gap: 'Strong C/D-Gap / Force',
      },
      shield: {
        x: 710,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'WALKED UP ON LOS! Aligned 2x0 at outside OL (TE) at end of line. Jam TE.',
        technique: '2x0 Alignment at End of LOS',
        sequentialTech: '9-Tech / 2x0 on LOS',
        gap: 'Hard Force & Strong Edge',
      },
      vanguard: {
        x: 710,
        y: 374,
        depthYards: 0,
        alignmentDesc: '2x0 on LOS outside TE. Jam TE release, turn all power runs back inside.',
        technique: '2x0 Goal Line Edge Jam',
        sequentialTech: '2x0 Edge Jam',
        gap: 'Hard Force & Goal Line Edge',
      },
      shell: {
        x: 670,
        y: 310,
        depthYards: 4,
        alignmentDesc: 'From primer: Outside backer drops to 4 yards off to defend deep pass / flat.',
        technique: '4 Yards Off / Curl-Flat Drop',
        sequentialTech: '4 Yards Off / Flat Drop',
        gap: 'Strong Hook / Flat Underneath',
      },
    },
    baseAssignment: '2x2 Outside Contain Strong side take blocks on inside shoulder. Force all perimeter runs back inside to Mike.',
    shieldAssignment: 'From primer: Walk up to the line in a 5-2, aligned 2x0 at the outside O-lineman at end of line. Jam TE violently on snap. Force option pitch/perimeter stretch back inside.',
    vanguardAssignment: 'Locked on LOS in 2x0. Crush the tight end block, bottle up power/lead runs at the line.',
    shellAssignment: 'Drop to 4 yards off. Take away the intermediate curl and collision any tight end seam route.',
    canBlitz: true,
    individualPressure: {
      callName: 'Sam',
      targetGap: 'Assigned Strong Edge / C-Gap',
      description: 'Sam shoots assigned edge gap based on defensive line alignment.',
      arrowEnd: { x: 700, y: 450 },
    },
  },
  {
    id: 'MIKE',
    name: 'Mike',
    role: 'Mike (Strong Inside Backer · 34-Tech)',
    number: '54',
    isMiddleBacker: true,
    sequentialTechBase: '34 Tech, outside shade of G, 4 yds depth, Strong B Gap',
    sequentialTechCode: '34 Tech',
    x34: 545,
    y34: 295,
    x52: 545,
    y52: 295,
    gap34: 'Strong B Gap Flow',
    gap52: 'Fast downhill scrape & A/B Gap fit',
    technique34: '34-Technique (3-Tech shade, 4 yds depth)',
    technique52: 'True 5-2 Stack Backer (Free to flow)',
    formations: {
      base: {
        x: 545,
        y: 295,
        depthYards: 4,
        alignmentDesc: '34 Tech, outside shade of G, 4 yds depth, Strong B Gap. Command RIP/LIZ call.',
        technique: '34-Technique',
        sequentialTech: '34 Tech (Strong B Gap)',
        gap: 'Strong B Gap Flow',
      },
      shield: {
        x: 545,
        y: 295,
        depthYards: 4.5,
        alignmentDesc: 'Stacked 4.5 yards deep. Clean downhill track behind the 5-man line.',
        technique: '5-2 Stack Backer',
        sequentialTech: '34 Stack Backer',
        gap: 'Downhill A/B Fill',
      },
      vanguard: {
        x: 545,
        y: 345,
        depthYards: 2,
        alignmentDesc: 'WALKED UP TO 2 YARDS DEPTH! Rule: If stacked over lineman, align over open gap.',
        technique: '2-Yard Depth Goal Line Attack',
        sequentialTech: '32 Tech (2-yd depth)',
        gap: 'Open Gap Alignment Rule',
      },
      shell: {
        x: 545,
        y: 260,
        depthYards: 6,
        alignmentDesc: 'DROPPED BACK TO 6 YARDS DEPTH! Defend deep pass, match low hole/crossing routes.',
        technique: '6-Yard Depth Pass Drop',
        sequentialTech: '36 Tech (6-yd depth)',
        gap: 'Middle Low Hole / Hook',
      },
    },
    baseAssignment: '34 Tech, outside shade of G, 4 yds depth, Strong B Gap. Read guard uncovered/covered, flow inside-out.',
    shieldAssignment: 'Clean downhill track! With 5 men on line absorbing blocks, trigger immediately on ball carrier in A/B gap.',
    vanguardAssignment: 'From primer: Walked up to 2 yard depth. Rule: If stacked over one of the linemen, pick the open gap assignment and align over it. Shoot gap on snap!',
    shellAssignment: 'From primer: Drop back to 6 yards depth defending deep pass. Read QB eyes, take away crossing routes.',
    canBlitz: true,
    individualPressure: {
      callName: 'Mike',
      targetGap: 'Assigned Gap (Based on DL)',
      description: 'Mike shoots assigned gap based on defensive line alignment.',
      arrowEnd: { x: 535, y: 440 },
    },
  },
  {
    id: 'WILL',
    name: 'Will',
    role: 'Will (Weak Inside Backer · 14-Tech)',
    number: '51',
    isMiddleBacker: true,
    sequentialTechBase: '14 Tech, inside shade WG, 4 yds depth, Weak A Gap',
    sequentialTechCode: '14 Tech',
    x34: 455,
    y34: 295,
    x52: 455,
    y52: 295,
    gap34: 'Weak A Gap Cutback',
    gap52: 'True 5-2 Stack Backer (Fast scrape to ball)',
    technique34: '14-Technique (1-Tech shade, 4 yds depth)',
    technique52: 'True 5-2 Stack Backer (Fast scrape to ball)',
    formations: {
      base: {
        x: 455,
        y: 295,
        depthYards: 4,
        alignmentDesc: '14 Tech, inside shade WG, 4 yds depth, Weak A Gap. Chase and cutback enforcer.',
        technique: '14-Technique',
        sequentialTech: '14 Tech (Weak A Gap)',
        gap: 'Weak A Gap Cutback',
      },
      shield: {
        x: 455,
        y: 295,
        depthYards: 4.5,
        alignmentDesc: 'Stacked 4.5 yards deep. Fast lateral scrape sideline-to-sideline.',
        technique: '5-2 Stack Backer',
        sequentialTech: '14 Stack Backer',
        gap: 'Cutback & Chase Track',
      },
      vanguard: {
        x: 455,
        y: 345,
        depthYards: 2,
        alignmentDesc: 'WALKED UP TO 2 YARDS DEPTH! Rule: If stacked over lineman, align over open gap.',
        technique: '2-Yard Depth Goal Line Attack',
        sequentialTech: '12 Tech (2-yd depth)',
        gap: 'Open Gap Alignment Rule',
      },
      shell: {
        x: 455,
        y: 260,
        depthYards: 6,
        alignmentDesc: 'DROPPED BACK TO 6 YARDS DEPTH! Defend deep pass, match underneath routes.',
        technique: '6-Yard Depth Pass Drop',
        sequentialTech: '16 Tech (6-yd depth)',
        gap: 'Weak Hook / Low Hole',
      },
    },
    baseAssignment: '14 Tech, inside shade WG, 4 yds depth, Weak A Gap. Mirror backfield mesh, shut down cutback lanes.',
    shieldAssignment: 'Free to scrape laterally. With Rover on edge and DE squeezing, attack cutbacks at full speed.',
    vanguardAssignment: 'From primer: Walked up to 2 yard depth. Rule: If stacked over one of the linemen, pick the open gap assignment and align over it. Strike open gap!',
    shellAssignment: 'From primer: Drop back to 6 yards depth defending deep pass. Read QB eyes, protect middle underneath hook zone.',
    canBlitz: true,
    individualPressure: {
      callName: 'Will',
      targetGap: 'Assigned Gap (Based on DL)',
      description: 'Will shoots assigned gap based on defensive line alignment.',
      arrowEnd: { x: 465, y: 440 },
    },
  },
  {
    id: 'LCB',
    name: 'Left Cornerback',
    role: 'Boundary / Field Cornerback',
    number: '21',
    isSecondary: true,
    canBlitz: false,
    sequentialTechBase: 'Off / Press-Bail (Outside Leverage)',
    sequentialTechCode: 'CB Off',
    x34: 152,
    y34: 300,
    x52: 152,
    y52: 300,
    gap34: 'Flat Squat (Blue) / Deep 1/3 (Green)',
    gap52: 'Flat Squat (Blue) / Deep 1/3 (Green)',
    technique34: 'Outside Leverage · Off / Press-Bail',
    technique52: 'Outside Leverage · Off / Press-Bail',
    formations: {
      base: {
        x: 152,
        y: 300,
        depthYards: 7,
        alignmentDesc: 'Align 5-7 yards off #1 receiver with outside leverage in Cover 2 (Blue) and Cover 3 (Green).',
        technique: 'Outside Leverage · Off / Bail',
        sequentialTech: 'Outside Lev (5-7 yds)',
        gap: 'Flat Squat (Blue) / Deep 1/3 (Green)',
      },
      shield: {
        x: 152,
        y: 300,
        depthYards: 7,
        alignmentDesc: 'Align 5-7 yards off with outside leverage. Secondary perimeter run support once pass cleared.',
        technique: 'Outside Leverage · Off / Bail',
        sequentialTech: 'Outside Lev (5-7 yds)',
        gap: 'Flat Squat (Blue) / Deep 1/3 (Green)',
      },
      vanguard: {
        x: 160,
        y: 360,
        depthYards: 1.5,
        alignmentDesc: 'Tight Press-Man on line of scrimmage with outside leverage. Deny outside fade / pylon.',
        technique: 'Tight Press-Man',
        sequentialTech: 'Press-Man (1 yd)',
        gap: 'Boundary Lockdown',
      },
      shell: {
        x: 140,
        y: 285,
        depthYards: 9,
        alignmentDesc: 'Deep cushion 8-10 yards with outside leverage. Protect deep sideline against home run shot.',
        technique: 'Deep Cushion Bail',
        sequentialTech: 'Deep Bail (9 yds)',
        gap: 'Deep Outside Third',
      },
    },
    baseAssignment: 'In Cover 2 (Blue) and Cover 3 (Green), maintain outside leverage on #1 WR. Protect deep third in Green, jam & funnel inside to squat in flat in Blue.',
    shieldAssignment: 'Align 5-7 yards. Support secondary perimeter run fits once pass read is cleared.',
    vanguardAssignment: 'Press-man technique on receiver. Do not allow inside release into end zone.',
    shellAssignment: 'Deep bail at snap! Keep all receivers in front of you.',
  },
  {
    id: 'RCB',
    name: 'Right Cornerback',
    role: 'Field / Strong Cornerback',
    number: '24',
    isSecondary: true,
    canBlitz: false,
    sequentialTechBase: 'Off / Press-Bail (Outside Leverage)',
    sequentialTechCode: 'CB Off',
    x34: 848,
    y34: 300,
    x52: 848,
    y52: 300,
    gap34: 'Flat Squat (Blue) / Deep 1/3 (Green)',
    gap52: 'Flat Squat (Blue) / Deep 1/3 (Green)',
    technique34: 'Outside Leverage · Off / Press-Bail',
    technique52: 'Outside Leverage · Off / Press-Bail',
    formations: {
      base: {
        x: 848,
        y: 300,
        depthYards: 7,
        alignmentDesc: 'Align 5-7 yards off #1 receiver with outside leverage. In Blue: funnel inside & squat flat. In Green: deep 1/3 bail.',
        technique: 'Outside Leverage · Off / Bail',
        sequentialTech: 'Outside Lev (5-7 yds)',
        gap: 'Flat Squat (Blue) / Deep 1/3 (Green)',
      },
      shield: {
        x: 848,
        y: 300,
        depthYards: 7,
        alignmentDesc: 'Align 5-7 yards off with outside leverage. Maintain top-down leverage against play-action shots.',
        technique: 'Outside Leverage · Off / Bail',
        sequentialTech: 'Outside Lev (5-7 yds)',
        gap: 'Flat Squat (Blue) / Deep 1/3 (Green)',
      },
      vanguard: {
        x: 840,
        y: 360,
        depthYards: 1.5,
        alignmentDesc: 'Tight Press-Man on line of scrimmage with outside leverage. Deny outside fade / pylon.',
        technique: 'Tight Press-Man',
        sequentialTech: 'Press-Man (1 yd)',
        gap: 'Field Lockdown',
      },
      shell: {
        x: 860,
        y: 285,
        depthYards: 9,
        alignmentDesc: 'Deep cushion 8-10 yards with outside leverage. Protect deep sideline against home run shot.',
        technique: 'Deep Cushion Bail',
        sequentialTech: 'Deep Bail (9 yds)',
        gap: 'Deep Outside Third',
      },
    },
    baseAssignment: 'In Cover 2 (Blue) and Cover 3 (Green), maintain outside leverage on #1 WR. In Blue: aggressive re-route and squat in flat. In Green: deep outside 1/3 bail.',
    shieldAssignment: 'Maintain top-down leverage against play-action deep shots caused by the 5-man rush.',
    vanguardAssignment: 'Press-man technique on receiver. Contest every throw to the goal line pylon.',
    shellAssignment: 'Deep bail at snap! Protect the sideline hole shot.',
  },
  {
    id: 'FS',
    name: 'Free Safety',
    role: 'Free Safety (Centerfield Cap & Deep Post)',
    number: '32',
    isSecondary: true,
    canBlitz: false,
    sequentialTechBase: 'Single-High Post / Deep Half (12-14 yds)',
    sequentialTechCode: 'FS Deep',
    x34: 430,
    y34: 170,
    x52: 430,
    y52: 170,
    gap34: 'Deep Middle Third / Deep Half',
    gap52: 'Deep Middle Third / Deep Half',
    technique34: 'Single-High Post / Deep Half (12-14 yds)',
    technique52: 'Single-High Post / Deep Half (12-14 yds)',
    formations: {
      base: {
        x: 430,
        y: 170,
        depthYards: 12,
        alignmentDesc: '12-14 yards deep. Single-high post or split deep half. Never get beat deep.',
        technique: 'Single-High Post / Deep Half',
        sequentialTech: 'Post Safety (12 yds)',
        gap: 'Deep Middle 1/3',
      },
      shield: {
        x: 430,
        y: 170,
        depthYards: 12,
        alignmentDesc: '12-14 yards deep. Cap all vertical seam routes behind the 5-man front.',
        technique: 'Deep Middle Cap',
        sequentialTech: 'Deep Cap (12 yds)',
        gap: 'Deep Middle Third',
      },
      vanguard: {
        x: 450,
        y: 290,
        depthYards: 5,
        alignmentDesc: 'WALKED UP TO 5 YARDS DEPTH! Acts as secondary downhill enforcer / alley fill.',
        technique: '5-Yard Depth Downhill Robber',
        sequentialTech: 'Robber / Fill (5 yds)',
        gap: 'Secondary Alley Fill / Goal Line Cap',
      },
      shell: {
        x: 420,
        y: 140,
        depthYards: 14,
        alignmentDesc: 'From primer: Safeties back to 12-14 yards depth! Cap any deep pass.',
        technique: '14-Yard Deep Centerfield Prevent',
        sequentialTech: 'Deep Prevent (14 yds)',
        gap: 'Deep Middle Cap',
      },
    },
    baseAssignment: 'Deep centerfielder. Never let any receiver get behind you. Read QB eyes and drive on seam/post.',
    shieldAssignment: 'Cap all vertical seam routes. Fast alley support against breakaway perimeter runs.',
    vanguardAssignment: 'From primer: Walked up to 5 yards depth. Attack downhill immediately on run read; tackle ball carrier at the line.',
    shellAssignment: 'Deep centerfield prevent at 12–14 yards depth. Play top-down, bat down or intercept any deep prayer.',
  },
  {
    id: 'SS',
    name: 'Strong Safety',
    role: 'Strong Safety (Alley Enforcer / Box Safety)',
    number: '38',
    isSecondary: true,
    canBlitz: false,
    sequentialTechBase: 'Split Safety / Invert Apex (8-10 yds)',
    sequentialTechCode: 'SS Invert',
    x34: 590,
    y34: 210,
    x52: 590,
    y52: 210,
    gap34: 'Deep Half (Blue) / Robber / Strong Curl (Green)',
    gap52: 'Deep Half (Blue) / Robber / Strong Curl (Green)',
    technique34: 'Split Safety / Invert Apex (8-10 yds)',
    technique52: 'Split Safety / Invert Apex (8-10 yds)',
    formations: {
      base: {
        x: 590,
        y: 210,
        depthYards: 10,
        alignmentDesc: '8-10 yards deep. In Blue: deep half. In Green: roll down into strong curl/flat.',
        technique: 'Split Safety / Invert Apex',
        sequentialTech: 'Invert / Box (8-10 yds)',
        gap: 'Strong Deep Half / Box Roll',
      },
      shield: {
        x: 590,
        y: 210,
        depthYards: 10,
        alignmentDesc: '8-10 yards deep. Vital alley fill on option/pitch outside Sam’s 2x0 edge.',
        technique: 'Alley Enforcer',
        sequentialTech: 'Alley Fill (10 yds)',
        gap: 'Strong Alley Fill',
      },
      vanguard: {
        x: 580,
        y: 290,
        depthYards: 5,
        alignmentDesc: 'WALKED UP TO 5 YARDS DEPTH! Invert hard into strong alley to destroy power/lead.',
        technique: '5-Yard Inverted Box Defender',
        sequentialTech: 'Box Stuffer (5 yds)',
        gap: 'Strong Alley Stuffer',
      },
      shell: {
        x: 620,
        y: 140,
        depthYards: 14,
        alignmentDesc: 'From primer: Safeties back to 12-14 yards depth! Protect deep strong half/third.',
        technique: '14-Yard Deep Half Prevent',
        sequentialTech: 'Deep Prevent (14 yds)',
        gap: 'Deep Strong Half / Third',
      },
    },
    baseAssignment: 'In Blue: split deep half with FS. In Green: roll down at snap into strong curl/flat to give an 8-man box look.',
    shieldAssignment: 'In 5-2 look, provide vital alley fill on toss/option perimeter plays outside Sam.',
    vanguardAssignment: 'From primer: Walked up to 5 yards depth. Fill strong alley with aggressive forward momentum on snap.',
    shellAssignment: 'Drop back to 12-14 yards depth. Cap deep post and sideline hole shot.',
  },
];

// Line Slants & Stunts (Preserved and fully supported)
export const LINE_SLANTS: Record<LineSlant, LineSlantDetail> = {
  base_gap: {
    id: 'base_gap',
    name: 'Base Gap Integrity (Default)',
    callCode: 'BASE GAP',
    signal: '✊ Fist held up, palm out',
    description: 'Standard gap accountability based on primary technique alignment.',
    linemenRule: 'From primer: If you don’t hear a slant call, either pick the gap in front of you or if you’re heads up you will default pick the strong direction gap.',
    slants: [
      { playerId: 'NT', arrowEnd: { x: 500, y: 430 }, technique: '0-Tech', targetGap: 'Strong A-Gap (Default heads-up pick)', label: 'Strong A' },
      { playerId: 'LDE', arrowEnd: { x: 420, y: 430 }, technique: '4i/5-Tech', targetGap: 'Weak B-Gap', label: 'Weak B' },
      { playerId: 'RDE', arrowEnd: { x: 580, y: 430 }, technique: '5-Tech', targetGap: 'Strong B-Gap', label: 'Strong B' },
    ],
  },
  slant: {
    id: 'slant',
    name: 'Slant Call (Weak Side)',
    callCode: 'SLANT',
    signal: '👈 Hand slicing across chest to weak side',
    description: 'All down linemen angle one gap toward the weak side away from the offensive strength.',
    linemenRule: 'From primer: No slant strong, since strong is default. The slant call slants weak. Attack the weak-side gap.',
    slants: [
      { playerId: 'NT', arrowEnd: { x: 465, y: 430 }, technique: 'Slant to 1-Tech (Weak)', targetGap: 'Weak A-Gap', label: 'Slant Weak A' },
      { playerId: 'LDE', arrowEnd: { x: 385, y: 430 }, technique: 'Slant to 7-Tech (Weak)', targetGap: 'Weak C-Gap', label: 'Slant Weak C' },
      { playerId: 'RDE', arrowEnd: { x: 550, y: 430 }, technique: 'Slant to 2i-Tech', targetGap: 'Strong A/B-Gap', label: 'Slant Inside' },
    ],
  },
  pinch: {
    id: 'pinch',
    name: 'Pinch Front (Interior Squeeze)',
    callCode: 'PINCH',
    signal: '👐 Both hands pressing together inward',
    description: 'Both defensive ends crash inside toward the A/B gaps; Nose drives the center back.',
    linemenRule: 'Collapses interior zone, dive, and veer inside giving. Spills all ball carriers to Sam and Rover on the edge.',
    slants: [
      { playerId: 'LDE', arrowEnd: { x: 450, y: 430 }, technique: 'Pinch B-to-A', targetGap: 'Weak A/B Squeeze', label: 'Pinch Inside' },
      { playerId: 'NT', arrowEnd: { x: 500, y: 435 }, technique: 'Bull Rush Center', targetGap: 'Both A-Gaps', label: 'Center Bull' },
      { playerId: 'RDE', arrowEnd: { x: 550, y: 430 }, technique: 'Pinch B-to-A', targetGap: 'Strong A/B Squeeze', label: 'Pinch Inside' },
    ],
  },
  angle_out: {
    id: 'angle_out',
    name: 'Angle Out (Perimeter Spill)',
    callCode: 'ANGLE OUT',
    signal: '👐 Both hands flaring outward from chest',
    description: 'Defensive ends slant into outside C-gaps while Nose slants into the strong A-gap.',
    linemenRule: 'Chokes off outside zone and perimeter sweep before the back can reach the corner.',
    slants: [
      { playerId: 'LDE', arrowEnd: { x: 380, y: 430 }, technique: 'Angle to 6/7-Tech', targetGap: 'Weak C-Gap', label: 'Angle Out' },
      { playerId: 'NT', arrowEnd: { x: 520, y: 430 }, technique: 'Slant 1-Tech', targetGap: 'Strong A-Gap', label: 'A-Gap Wedge' },
      { playerId: 'RDE', arrowEnd: { x: 620, y: 430 }, technique: 'Angle to 6/7-Tech', targetGap: 'Strong C-Gap', label: 'Angle Out' },
    ],
  },
  out: {
    id: 'out',
    name: 'Wide / Out (Perimeter Spill)',
    callCode: 'WIDE',
    signal: '👐 Both hands flaring outward from chest',
    description: 'Defensive ends slant into outside C-gaps while Nose slants into the strong A-gap.',
    linemenRule: 'Chokes off outside zone and perimeter sweep before the back can reach the corner.',
    slants: [
      { playerId: 'LDE', arrowEnd: { x: 380, y: 430 }, technique: 'Angle to 6/7-Tech', targetGap: 'Weak C-Gap', label: 'Angle Out' },
      { playerId: 'NT', arrowEnd: { x: 520, y: 430 }, technique: 'Slant 1-Tech', targetGap: 'Strong A-Gap', label: 'A-Gap Wedge' },
      { playerId: 'RDE', arrowEnd: { x: 620, y: 430 }, technique: 'Angle to 6/7-Tech', targetGap: 'Strong C-Gap', label: 'Angle Out' },
    ],
  },
  bull_rush: {
    id: 'bull_rush',
    name: 'Pass Push / Bull Rush (Shell Sack Mentality)',
    callCode: 'BULL RUSH',
    signal: '💥 Clenched fists driving forward',
    description: 'From primer: Linemen, in Shell you should be expecting a pass, which means go get us a sack!',
    linemenRule: 'Maximum forward power and hand violence. Drive offensive linemen straight back into the quarterback’s lap.',
    slants: [
      { playerId: 'LDE', arrowEnd: { x: 410, y: 450 }, technique: 'Speed Edge / Rip', targetGap: 'Sack QB', label: 'Get the Sack!' },
      { playerId: 'NT', arrowEnd: { x: 500, y: 450 }, technique: 'Pocket Collapse Bull', targetGap: 'Sack QB', label: 'Collapse Pocket' },
      { playerId: 'RDE', arrowEnd: { x: 590, y: 450 }, technique: 'Speed Edge / Club', targetGap: 'Sack QB', label: 'Get the Sack!' },
    ],
  },
};

// Selectable Fronts for Live Defensive Calls: Slant, Pinch, Out
// "there should not be bull rush or base. If no front is specified, that is base"
export const SELECTABLE_FRONTS: {
  id: SelectableFront;
  name: string;
  callCode: string;
  signal: string;
  description: string;
}[] = [
  {
    id: 'slant',
    name: 'Slant',
    callCode: 'SLANT',
    signal: '👈 Slicing weak',
    description: 'All down linemen angle one gap toward the weak side',
  },
  {
    id: 'pinch',
    name: 'Pinch',
    callCode: 'PINCH',
    signal: '👐 Pressing inward',
    description: 'Both ends crash inside to A/B gaps; Nose bull rushes center',
  },
  {
    id: 'out',
    name: 'Wide (Out)',
    callCode: 'WIDE',
    signal: '👐 Flaring outward',
    description: 'Defensive ends slant into outside C-gaps; Nose slants strong A',
  },
];

// Coverage Schemes from the Defensive Primer (Blue, Green, Black only)
export const COVERAGE_SCHEMES: Record<CoverageScheme, CoverageDetail> = {
  blue: {
    id: 'blue',
    name: 'Cover 2 Zone',
    codeName: 'BLUE',
    handSignal: '👆 Point at the sky',
    handSignalDesc: 'Index finger pointed straight up into the air toward the sky.',
    color: '#38BDF8',
    badgeBg: 'bg-sky-500/20',
    badgeBorder: 'border-sky-500/50',
    deepCoverage: '2 Deep Halves (Safeties split field at 12-14 yards)',
    underneathCoverage: '5 Underneath Zone Defenders (Corners in Flats, LBs Hook/Curl/Hole)',
    philosophy: 'Hard boundary clamp. Corners re-route outside receivers and squat on immediate flat routes. Safeties play deep halves and drive top-down.',
    situationalCall: '2nd & Long (7+), 2-Minute Drill, Red Zone inside 20-yard line against perimeter screens.',
    responsibilities: {
      FS: 'Deep Half (Field/Left) — Deepest player on field, read QB eyes and drive on seam/post.',
      SS: 'Deep Half (Boundary/Right) — Deepest player on strong side, protect sideline hole shot.',
      LCB: 'Flat Squat (2-5 yds) — Physical 2-handed punch on #1 WR inside release, squat in flat.',
      RCB: 'Flat Squat (2-5 yds) — Physical 2-handed punch on #1 WR, squat on quick out/bubble.',
      ROV: 'Weak Hook / Squeeze — Squeeze #2 receiver vertical, drop to 8-10 yards hash mark.',
      MIKE: 'Middle Hole / High Hole — Read QB eyes, sink to 10-12 yds into low hole or match crossing routes.',
      WILL: 'Weak Hook / Curl — Squeeze #2 vertical, drop 10-12 yds to weak hash, match crossers.',
      SAM: 'Strong Hook / Curl — Collision tight end, sink 10-12 yds to strong hook, deny intermediate seam.',
    },
    playerAssignments: [
      {
        playerId: 'FS',
        playerName: 'Free Safety',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Deep Half (Field / Left)',
        landmarkLabel: 'Deep Half (12-14 yds)',
        depthYards: '12-14 Yds',
        dropTarget: { x: 320, y: 130 },
        controlPoint: { x: 375, y: 145 },
        technique: 'Deep Half Split · Top-Down Break',
        leverage: 'Sideline to Hash Apex',
        keyRead: '#1 WR Release ➔ #2 Seam Threat',
        coachingPoint: 'Divide field from sideline to hash at 12-14 yards. Stay deeper than deepest receiver; drive top-down.',
      },
      {
        playerId: 'SS',
        playerName: 'Strong Safety',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Deep Half (Boundary / Right)',
        landmarkLabel: 'Deep Half (12-14 yds)',
        depthYards: '12-14 Yds',
        dropTarget: { x: 680, y: 130 },
        controlPoint: { x: 635, y: 165 },
        technique: 'Deep Half Split · Hole Shot Defense',
        leverage: 'Boundary Sideline to Hash',
        keyRead: 'TE Seam ➔ #1 WR Fade / Sideline Hole',
        coachingPoint: 'Protect sideline hole shot between corner and safety. Drive hard on out-breaking routes from depth.',
      },
      {
        playerId: 'LCB',
        playerName: 'Left Cornerback',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Flat Squat (Boundary Clamp)',
        landmarkLabel: 'Flat Squat (2-5 yds)',
        depthYards: '2-5 Yds',
        dropTarget: { x: 155, y: 315 },
        controlPoint: { x: 150, y: 320 },
        technique: 'Outside Leverage · Physical Jam & Squat',
        leverage: 'Outside Leverage · Funnel Inside',
        keyRead: '#1 WR Release ➔ #2 Flat Threat',
        coachingPoint: 'Align with OUTSIDE LEVERAGE on #1 WR. Physical jam to funnel release inside to safety help; squat at 2-5 yards in flat.',
      },
      {
        playerId: 'RCB',
        playerName: 'Right Cornerback',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Flat Squat (Field Clamp)',
        landmarkLabel: 'Flat Squat (2-5 yds)',
        depthYards: '2-5 Yds',
        dropTarget: { x: 845, y: 315 },
        controlPoint: { x: 850, y: 320 },
        technique: 'Outside Leverage · Physical Jam & Squat',
        leverage: 'Outside Leverage · Funnel Inside',
        keyRead: '#1 WR Release ➔ Bubble / Quick Flat',
        coachingPoint: 'Align with OUTSIDE LEVERAGE on #1 WR. Re-route receiver inside to safety help; squat in flat and tackle immediately.',
      },
      {
        playerId: 'WILL',
        playerName: 'Will (Inside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Weak Hook / Curl',
        landmarkLabel: 'Weak Hook (10-12 yds)',
        depthYards: '10-12 Yds',
        dropTarget: { x: 380, y: 255 },
        controlPoint: { x: 415, y: 275 },
        technique: 'Drop 10-12 Yds to Weak Hash',
        leverage: 'Inside-Out on #2',
        keyRead: '#2 Receiver Vertical / Backfield Flow',
        coachingPoint: 'Squeeze #2 receiver vertical, drop to 10-12 yards depth, match underneath crossing routes.',
      },
      {
        playerId: 'MIKE',
        playerName: 'Mike (Inside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Middle Hole / High Hole',
        landmarkLabel: 'Middle Hole (10-12 yds)',
        depthYards: '10-12 Yds',
        dropTarget: { x: 500, y: 240 },
        controlPoint: { x: 520, y: 265 },
        technique: 'Middle Hole Drop Between Safeties',
        leverage: 'Centerfield Low Hole',
        keyRead: 'Quarterback Eyes & Crossers',
        coachingPoint: 'Sink deep to 10-12 yards middle hole over the center. Close the soft spot between the 2 safeties.',
      },
      {
        playerId: 'SAM',
        playerName: 'Sam (Outside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Strong Hook / Curl',
        landmarkLabel: 'Strong Hook (10-12 yds)',
        depthYards: '10-12 Yds',
        dropTarget: { x: 620, y: 255 },
        controlPoint: { x: 640, y: 280 },
        technique: 'TE Collision & Hook Drop',
        leverage: 'Inside-Out on TE',
        keyRead: 'Tight End Seam / Out',
        coachingPoint: 'Collision tight end at line of scrimmage, sink to 10-12 yards strong hook, take away seam.',
      },
      {
        playerId: 'ROV',
        playerName: 'Rover (Outside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Weak Hook / Squeeze',
        landmarkLabel: 'Weak Hook / Squeeze',
        depthYards: '8-10 Yds',
        dropTarget: { x: 290, y: 265 },
        controlPoint: { x: 315, y: 285 },
        technique: 'Squeeze Weak Hash Window',
        leverage: 'Weak Apex',
        keyRead: 'Weak Backfield / Over Routes',
        coachingPoint: 'Squeeze #2 vertical route, protect weak intermediate hole, rally to perimeter checkdown.',
      },
    ],
    coverageZones: [
      { label: 'Deep Half (FS)', x: 320, y: 130, radiusX: 180, radiusY: 90, assignedPlayerId: 'FS' },
      { label: 'Deep Half (SS)', x: 680, y: 130, radiusX: 180, radiusY: 90, assignedPlayerId: 'SS' },
      { label: 'Flat (LCB)', x: 155, y: 315, radiusX: 85, radiusY: 55, assignedPlayerId: 'LCB' },
      { label: 'Weak Hook (WILL)', x: 380, y: 260, radiusX: 75, radiusY: 50, assignedPlayerId: 'WILL' },
      { label: 'Middle Hole (MIKE)', x: 500, y: 240, radiusX: 85, radiusY: 55, assignedPlayerId: 'MIKE' },
      { label: 'Strong Hook (SAM)', x: 620, y: 260, radiusX: 75, radiusY: 50, assignedPlayerId: 'SAM' },
      { label: 'Flat (RCB)', x: 845, y: 315, radiusX: 85, radiusY: 55, assignedPlayerId: 'RCB' },
    ],
  },
  green: {
    id: 'green',
    name: 'Cover 3 Sky / Cloud',
    codeName: 'GREEN',
    handSignal: '👇 Point at the ground/grass/turf',
    handSignalDesc: 'Index finger pointed directly down toward the grass or turf.',
    color: '#34D399',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/50',
    deepCoverage: '3 Deep Thirds (2 Cornerbacks bail deep 1/3, Free Safety middle 1/3)',
    underneathCoverage: '4 Underneath Zone Defenders (Curl-Flat / Hook-Curl / Hook-Curl / Curl-Flat)',
    philosophy: 'Anti-run base coverage with 8 men in the box. SS rolls down to play the strong curl/flat. Outside corners bail with outside-in leverage.',
    situationalCall: '1st & 10, Run-heavy downs, 2nd & Medium, vs 21 Personnel and Option offenses.',
    responsibilities: {
      FS: 'Deep Middle 1/3 — True post safety. Divide the field between the hashes, cap any post route.',
      SS: 'Strong Curl / Flat (Roll down) — Rotate down at snap into strong hook/flat alley.',
      LCB: 'Deep Outside 1/3 — 3-step bail at snap, stay on top of #1 WR vertical route.',
      RCB: 'Deep Outside 1/3 — 3-step bail at snap, protect deep outside third against go/fade routes.',
      ROV: 'Weak Curl / Flat (or pass rush if Shield/5-2) — Carry wheel route, squeeze weak flat.',
      MIKE: 'Strong Hook / Curl — Drop to 8-10 yards over ball, match crossers and underneath dig routes.',
      WILL: 'Weak Hook / Curl — Protect weak hook zone, read QB eyes and match delayed back routes.',
      SAM: 'Strong Curl / Flat — Squeeze strong flat if SS blitzes or play edge force.',
    },
    playerAssignments: [
      {
        playerId: 'LCB',
        playerName: 'Left Cornerback',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Deep Outside 1/3 (Outside-In)',
        landmarkLabel: 'Deep 1/3 Bail',
        depthYards: '12-15 Yds',
        dropTarget: { x: 160, y: 130 },
        controlPoint: { x: 150, y: 220 },
        technique: 'Outside Leverage · 3-Step Bail',
        leverage: 'Outside Leverage (Outside-In Cushion)',
        keyRead: 'QB Drop ➔ #1 WR Vertical Stem',
        coachingPoint: 'Align 7 yards off with OUTSIDE LEVERAGE. Bail 3 steps at snap, protect sideline and deep outside third, funneling routes inside.',
      },
      {
        playerId: 'RCB',
        playerName: 'Right Cornerback',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Deep Outside 1/3 (Outside-In)',
        landmarkLabel: 'Deep 1/3 Bail',
        depthYards: '12-15 Yds',
        dropTarget: { x: 840, y: 130 },
        controlPoint: { x: 850, y: 220 },
        technique: 'Outside Leverage · 3-Step Bail',
        leverage: 'Outside Leverage (Outside-In Cushion)',
        keyRead: 'QB Drop ➔ #1 WR Vertical Stem',
        coachingPoint: 'Align 7 yards off with OUTSIDE LEVERAGE. Bail 3 steps at snap, cap any deep fade/corner route, funneling routes inside toward Free Safety.',
      },
      {
        playerId: 'FS',
        playerName: 'Free Safety',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Deep Middle 1/3 (Post Safety)',
        landmarkLabel: 'Deep Middle 1/3',
        depthYards: '14-16 Yds',
        dropTarget: { x: 500, y: 110 },
        controlPoint: { x: 470, y: 135 },
        technique: 'Centerfield Post Safety Pedal',
        leverage: 'Divide the Field Between Hashes',
        keyRead: 'Quarterback Eyes & Front Shoulder',
        coachingPoint: 'True post safety. Open hips to QB eyes, drive downhill on any post or dig route.',
      },
      {
        playerId: 'SS',
        playerName: 'Strong Safety',
        group: 'DB',
        roleType: 'zone_drop',
        roleName: 'Strong Curl / Flat (Sky Roll)',
        landmarkLabel: 'Strong Curl/Flat Roll',
        depthYards: '8-10 Yds',
        dropTarget: { x: 700, y: 270 },
        controlPoint: { x: 655, y: 235 },
        technique: 'Sky Roll Down on Snap',
        leverage: 'Inside-Out Alley Leverage',
        keyRead: '#2 Receiver (TE/Slot) Release',
        coachingPoint: 'Roll down into strong curl/flat alley on snap. Rob intermediate seam; rally to flat.',
      },
      {
        playerId: 'WILL',
        playerName: 'Will (Inside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Weak Hook / Curl',
        landmarkLabel: 'Weak Hook (8-10 yds)',
        depthYards: '8-10 Yds',
        dropTarget: { x: 420, y: 260 },
        controlPoint: { x: 435, y: 275 },
        technique: 'Pass Drop to Weak Hash Landmark',
        leverage: 'Inside Out',
        keyRead: 'Offensive Guard Pass Set ➔ QB Eyes',
        coachingPoint: 'Drop to 8-10 yards over weak hash. Match underneath crossing routes and rob dig.',
      },
      {
        playerId: 'MIKE',
        playerName: 'Mike (Inside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Strong Hook / Curl',
        landmarkLabel: 'Strong Hook (8-10 yds)',
        depthYards: '8-10 Yds',
        dropTarget: { x: 580, y: 260 },
        controlPoint: { x: 565, y: 275 },
        technique: 'Pass Drop to Strong Hash Landmark',
        leverage: 'Inside Out',
        keyRead: 'Guard Pass Set ➔ High-Hole Crossers',
        coachingPoint: 'Sink to 8-10 yards. Squeeze strong hook window; match inside crossers.',
      },
      {
        playerId: 'ROV',
        playerName: 'Rover (Outside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Weak Curl / Flat (Edge Buzz)',
        landmarkLabel: 'Weak Curl/Flat (4-6 yds)',
        depthYards: '4-6 Yds',
        dropTarget: { x: 295, y: 275 },
        controlPoint: { x: 315, y: 290 },
        technique: 'Drop 4 Yards Off · Buzz Weak Flat',
        leverage: 'Outside Contain Leverage',
        keyRead: 'Offensive Tackle Pass Set ➔ Backfield Release',
        coachingPoint: 'From primer: Drop to 4 yards off. Buzz the weak flat, carry wheel routes, force runs.',
      },
      {
        playerId: 'SAM',
        playerName: 'Sam (Outside Backer)',
        group: 'LB',
        roleType: 'zone_drop',
        roleName: 'Strong Flat / TE Collision',
        landmarkLabel: 'Strong Flat Force',
        depthYards: '4-6 Yds',
        dropTarget: { x: 735, y: 285 },
        controlPoint: { x: 705, y: 295 },
        technique: 'Jam TE Release · Squeeze Alley',
        leverage: 'Outside Contain & Alley Squeeze',
        keyRead: 'Tight End Release ➔ Strong Flat Flow',
        coachingPoint: 'Disrupt tight end off LOS, squeeze strong alley, tackle immediate flat route.',
      },
    ],
    coverageZones: [
      { label: 'Deep 1/3 (LCB)', x: 165, y: 130, radiusX: 130, radiusY: 85, assignedPlayerId: 'LCB' },
      { label: 'Deep Middle (FS)', x: 500, y: 110, radiusX: 160, radiusY: 85, assignedPlayerId: 'FS' },
      { label: 'Deep 1/3 (RCB)', x: 835, y: 130, radiusX: 130, radiusY: 85, assignedPlayerId: 'RCB' },
      { label: 'Weak Curl/Flat (ROV)', x: 300, y: 270, radiusX: 85, radiusY: 50, assignedPlayerId: 'ROV' },
      { label: 'Weak Hook (WILL)', x: 420, y: 260, radiusX: 75, radiusY: 50, assignedPlayerId: 'WILL' },
      { label: 'Strong Hook (MIKE)', x: 580, y: 260, radiusX: 75, radiusY: 50, assignedPlayerId: 'MIKE' },
      { label: 'Strong Curl/Flat (SS)', x: 700, y: 270, radiusX: 85, radiusY: 50, assignedPlayerId: 'SS' },
    ],
  },
  black: {
    id: 'black',
    name: 'Cover 1 Man-Free',
    codeName: 'BLACK',
    handSignal: '👕 Tug of the jersey',
    handSignalDesc: 'Pulling or tugging the front of the jersey with a closed fist. (Press modifier call is "JAM": 🙌 Two hands up palms out, with a pushing motion).',
    color: '#F59E0B',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/50',
    deepCoverage: '1 Single-High Free Safety (Deep middle eraser)',
    underneathCoverage: 'Man-to-Man Outside-In Threat Matching: CBs (#1 Threats) · Sam (#2 Threat Y) · Rover (#2 Threat TB on Weak Flow) · Will (Fullback FB) · Mike (TB on Strong Flow / Hole Spy) · SS (Hole/Robber/Spy)',
    philosophy: 'Tight aggressive man coverage based on outside-in threat counting. In normal Black, CBs play 7 yards off with inside leverage (Jam modifier = press on LOS). In Base vs I-Formation (Defense Strong Left): Rover has #2 threat (TB if flows weak); Will is attached to the Fullback (FB) on both weak flow (#3 threat) and strong flow (#4 threat as 4th defender); Sam has Y (#2 threat on strong side); Mike has TB to strong side (#3 threat), or plays Hole/Spy on weak flow; SS plays Hole/Robber/Spy. Against Double Tight End Heavy: Left side: LCB (#1 X), Rover (#2 Y1), Will (#3 TB). Right side: RCB (#1 Y2), Sam (#2 TB to his side), Mike (#3 TB to strong side / #4 FB to Will\'s side).',
    situationalCall: '3rd & 3-6, Pressure downs, Redzone tight goal-to-go, vs spread motion.',
    responsibilities: {
      FS: 'Single High Free Roamer — Deep middle third, read QB intent and break on deep ball.',
      SS: 'Hole / Robber / Spy — Down safety robber in the low hole and underneath spy support.',
      LCB: 'Man on #1 Threat (X) — Normal Black: 7 yds off, inside leverage. In Jam: On the LOS, hand fighting with receiver at snap then covering inside hip.',
      RCB: 'Man on #1 Threat (Z / Y2) — Normal Black: 7 yds off, inside leverage. In Jam: On the LOS, hand fighting with receiver at snap then covering inside hip.',
      ROV: '#2 Threat (Weak Flow TB) / Backside Contain — If backfield flows weak, Rover takes #2 threat (TB). If strong, maintains backside contain/spy.',
      MIKE: '#3 Threat (Strong Flow TB) / Low Hole Spy — If backfield flows strong, Mike covers TB. If weak, Mike patrols low hole and spies QB.',
      WILL: 'Man on Fullback (FB) — Attached to Fullback (#3 threat on weak flow, #4 threat on strong flow as 4th defender).',
      SAM: '#2 Threat (Y Tight End) — Man-to-man lock on Tight End Y release outside-in.',
    },
    playerAssignments: [
      {
        playerId: 'FS',
        playerName: 'Free Safety',
        group: 'DB',
        roleType: 'roamer',
        roleName: 'Single-High Free Roamer',
        landmarkLabel: '★ Single-High Free Roamer',
        depthYards: '12-14 Yds',
        dropTarget: { x: 500, y: 120 },
        technique: 'Deep Centerfield Free Eraser',
        leverage: 'Deep Middle Cap',
        keyRead: 'Quarterback Eyes & Launch Point',
        coachingPoint: 'Deep middle roamer. Read quarterback intent, erase any post or deep vertical route.',
      },
      {
        playerId: 'LCB',
        playerName: 'Left Cornerback',
        group: 'DB',
        roleType: 'man_lock',
        roleName: 'Man on #1 WR (Left)',
        landmarkLabel: '🔒 Lock: #1 WR (7 Yds Off / Jam at LOS)',
        depthYards: '7 Yds Off / Jam at LOS',
        dropTarget: { x: 180, y: 320 },
        technique: 'Normal: 7 Yds Off Inside Lev · Jam: On LOS Hand Fight & Inside Hip',
        leverage: 'Inside Leverage (Deny Slants / In-Breaking Routes)',
        keyRead: '#1 WR Release & Inside Hip',
        coachingPoint: 'In normal Black: 7 yards off, inside leverage. In Jam: On the LOS, hand fighting with receiver at snap then covering inside hip tightly.',
        manTarget: '#1 WR (X)',
      },
      {
        playerId: 'RCB',
        playerName: 'Right Cornerback',
        group: 'DB',
        roleType: 'man_lock',
        roleName: 'Man on #1 WR (Right)',
        landmarkLabel: '🔒 Lock: #1 WR (7 Yds Off / Jam at LOS)',
        depthYards: '7 Yds Off / Jam at LOS',
        dropTarget: { x: 820, y: 320 },
        technique: 'Normal: 7 Yds Off Inside Lev · Jam: On LOS Hand Fight & Inside Hip',
        leverage: 'Inside Leverage',
        keyRead: '#1 WR Release & Inside Hip',
        coachingPoint: 'In normal Black: 7 yards off, inside leverage. In Jam: On the LOS, hand fighting with receiver at snap then covering inside hip tightly.',
        manTarget: '#1 WR (Z)',
      },
      {
        playerId: 'SS',
        playerName: 'Strong Safety',
        group: 'DB',
        roleType: 'man_lock',
        roleName: 'Hole / Robber / Spy',
        landmarkLabel: '🔒 Hole / Robber / Spy',
        depthYards: 'Underneath Hole (6-8 Yds)',
        dropTarget: { x: 580, y: 235 },
        technique: 'Down Safety Robber / Low Hole Patrol',
        leverage: 'Inside Robber Leverage',
        keyRead: 'Quarterback Eyes & Crossers',
        coachingPoint: 'Down safety playing the hole, robber & underneath spy support. Rob intermediate crossing routes.',
        manTarget: 'Hole / Robber / Spy',
      },
      {
        playerId: 'WILL',
        playerName: 'Will (Inside Backer)',
        group: 'LB',
        roleType: 'man_lock',
        roleName: 'Man-to-Man on Fullback (FB)',
        landmarkLabel: '🔒 Fullback (FB) Lock',
        depthYards: '4-7 Yds',
        dropTarget: { x: 465, y: 460 },
        technique: 'Attached to Fullback (FB) on both Weak and Strong Releases',
        leverage: 'Inside-Out on FB',
        keyRead: 'Fullback Release & Track',
        coachingPoint: 'Will is attached to the Fullback (FB). On weak flow, Will takes the 3rd threat (FB). On strong flow, Will takes the 4th threat (FB) as the 4th defender.',
        manTarget: 'Fullback (FB)',
      },
      {
        playerId: 'MIKE',
        playerName: 'Mike (Inside Backer)',
        group: 'LB',
        roleType: 'rat',
        roleName: '#3 Threat (Strong TB) / Hole Spy',
        landmarkLabel: '🔒 #3 Threat (TB) / Hole Spy',
        depthYards: '5-7 Yds',
        dropTarget: { x: 500, y: 250 },
        technique: 'Strong Flow = Cover TB · Weak Flow = Low Hole Spy',
        leverage: 'Middle Low Hole / Strong Inside-Out',
        keyRead: 'Running Back Flow Direction (Strong vs Weak)',
        coachingPoint: 'If backfield flows to strong side, Mike takes the #3 threat (TB). If backfield flows weak, Mike patrols low hole and spies QB.',
        manTarget: 'Strong Release TB (or Low Hole Spy)',
      },
      {
        playerId: 'ROV',
        playerName: 'Rover (Outside Backer)',
        group: 'LB',
        roleType: 'jam_rush',
        roleName: '#2 Threat (Weak TB) / Contain',
        landmarkLabel: '🔒 #2 Threat (TB) / Contain',
        depthYards: '2 Yds (Contain / Match)',
        dropTarget: { x: 330, y: 380 },
        technique: 'Weak Release = Match #2 TB · Strong Release = Backside Contain',
        leverage: 'Outside-In Leverage',
        keyRead: 'Weak Backfield Flow',
        coachingPoint: 'Outside-in threat counting: Rover has 2nd threat to weak side (TB if flows weak). If flow is strong, maintain backside edge contain/spy.',
        manTarget: 'Weak #2 Threat (TB) / Contain',
      },
      {
        playerId: 'SAM',
        playerName: 'Sam (Outside Backer)',
        group: 'LB',
        roleType: 'man_lock',
        roleName: 'Man-to-Man on Tight End (Y)',
        landmarkLabel: '🔒 #2 Threat: Y (Tight End)',
        depthYards: '0-2 Yds on Y',
        dropTarget: { x: 670, y: 395 },
        technique: 'Outside-In Man Match on Tight End Y',
        leverage: 'Outside-In Leverage on Y',
        keyRead: 'Tight End Y Release & Route Stem',
        coachingPoint: 'Sam does not have Strong Hook; he has Y (#2 threat on strong side). Lock onto Y stride-for-stride.',
        manTarget: 'Tight End (Y)',
      },
    ],
    coverageZones: [
      { label: 'Single High Free (FS)', x: 500, y: 120, radiusX: 200, radiusY: 90, assignedPlayerId: 'FS' },
      { label: 'Underneath Rat / Spy (Non-Cover LB)', x: 500, y: 250, radiusX: 110, radiusY: 55, assignedPlayerId: 'MIKE' },
    ],
  },
};

// Defensive Primer Manual Chapters
export const DEFENSIVE_PRIMER_CHAPTERS: PrimerSection[] = [
  {
    id: 'philosophy',
    title: '1. Defensive Formations: Base, Shield, Vanguard & Shell',
    category: 'formations',
    summary: 'Our 4-formation architecture: Base 3-4, Shield 5-2 walk-up, Vanguard goal line, and Shell prevent.',
    keyPoints: [
      'BASE (3-4 Normal Alignment): Hand signal = Fist held up, palm out. 3 down linemen, 4 linebackers stacked off the LOS.',
      'SHIELD (5-2 Walked-Up): Hand signal = Fist held in front of body, palm in. Sam and Rover walk up to the line of scrimmage in a 5-2, aligned 2x0 at the outside offensive lineman at the end of the line of scrimmage.',
      'VANGUARD (Goal Line / Short-Yardage): Shield with MLBs walked up to 2 yard depth and Safeties to 5 yards depth. One rule for MLB: if stacked over one of the linemen, pick the open gap assignment and align over it.',
      'SHELL (Prevent / Deep Pass): Outside backers drop to 4 yards off, middle backers back to 6 yards, safeties back to 12 yards. Linemen, in Shell you should be expecting a pass, which means go get us a sack!',
    ],
    coachingQuote: '“4 simple signals communicate our entire line and depth structure from short-yardage to deep prevent.”',
    diagramNotes: 'Select any of the 4 formations in the console to watch all 11 defenders move into their exact primer coordinates.',
  },
  {
    id: 'dline_techniques',
    title: '2. Sequential Tech System: Center 0, Guard 1-3, Tackle 4-6, TE 7-9 & Backers (Depth + Tech)',
    category: 'core',
    summary: 'Our sequential technique numbering system from Center outward and Backer depth rules in Base 3-4.',
    keyPoints: [
      'Center = 0, 0-Weak, or 0-Strong.',
      'Guard = 1 (inside shade), 2 (head-up), 3 (outside shade).',
      'Tackle = 4 (inside shade), 5 (head-up), 6 (outside shade).',
      'Tight End (TE) = 7 (inside shade), 8 (head-up), 9 (outside shade / 2x0 edge).',
      'For Backers = Depth then Tech: Depth in yards combined with the sequential tech alignment.',
      'Base 3-4 Alignment Rules:',
      '• NG = 0 Tech with Strong A gap (Heads up on Center, default pick strong A)',
      '• SDE = 6 Tech (outside shade of OT) Strong C Gap',
      '• WDE = 4 Tech B Gap (Inside shade of OT)',
      '• Rover = 2x2 yards outside LOS Outside contain for cutback/reverse',
      '• Sam = 2x2 Outside Contain Strong side take blocks on inside shoulder',
      '• Mike = 34 Tech, outside shade of G, 4 yds depth, Strong B Gap',
      '• Will = 14 Tech, inside shade WG, 4 yds depth, Weak A Gap',
      'Linemen Slant Rule: Default heads up picks strong gap. The slant call is strictly to the weak side.',
    ],
    coachingQuote: '“Center 0, Guard 1-2-3, Tackle 4-5-6, TE 7-8-9. Backers are Depth then Tech. Base 3-4 is locked in.”',
  },
  {
    id: 'linebackers_sam_rover',
    title: '3. Linebacker Doctrine: Sam, Rover, Mike & Will',
    category: 'adjustments',
    summary: 'Rules for outside linebackers (Sam & Rover) and middle linebackers (Mike & Will).',
    keyPoints: [
      'Outside Backers are strictly Sam and Rover. Sam sets the strong edge; Rover sets the weak/boundary edge.',
      '2x0 Alignment in Shield: Outside backers align 2 yards outside the end offensive lineman and 0 yards off the ball (on the LOS).',
      'Hard Edge Non-Negotiable: Outside backers must NEVER let anything get outside their outside shoulder.',
      'Middle Backers (Mike & Will): Stacked at 4.5 yards in Base and Shield. In Vanguard, they walk up to 2 yard depth. Rule: if stacked over a lineman, pick the open gap assignment and align over it.',
      'In Shell: Middle backers drop back to 6 yards depth to take away intermediate crossing routes.',
      'GAP Responsibility is Strictly on RUN (The Open Gap Principle): Gap responsibility changes dynamically based on what the front 3 defensive linemen and edge backers are doing. Pass responsibility in Cover Black is threat counting, but run gap responsibility is NEVER threat counting.',
      'The Open Gap Rule: If Weak DE is in a 4-tech taking B-gap and Rover has outside contain/C-gap, then Will takes the open gap to his side (Weak A). When NT takes strong A-gap, Strong DE takes C-gap, and Sam has outside contain/D-gap, then Mike takes B-gap, because it is the open gap (Strong B).',
    ],
    coachingQuote: '“Sam and Rover set the perimeter stone wall; Mike and Will take the open gap on run and match threats outside-in on pass.”',
  },
  {
    id: 'individual_pressures',
    title: '4. Blitz System: Mike, Will, Sam & Rover Only',
    category: 'core',
    summary: 'Individual position blitz calls shooting assigned gaps based on defensive line alignment.',
    keyPoints: [
      'No packaged blitzes: The blitz calls are simply Mike, Will, Sam, and Rover.',
      'No dog or fire calls: Calls are strictly the player position name.',
      'Assigned Gap Rule: Blitzing linebackers only shoot their assigned gap based on the DL alignment.',
      'Sam: Blitzes assigned strong edge/C-gap based on front.',
      'Rover: Blitzes assigned weak edge/C-gap based on front.',
      'Mike: Shoots assigned gap based on DL alignment.',
      'Will: Shoots assigned gap based on DL alignment.',
      'Zero Secondary Blitzes: Cornerbacks and Safeties do not blitz.',
    ],
    coachingQuote: '“Call blitz by linebacker name. They shoot their assigned gap based on our defensive line alignment.”',
  },
  {
    id: 'coverage_codes',
    title: '5. Coverage Signals: Blue, Green & Black',
    category: 'core',
    summary: '3 core coverage schemes communicated instantly by physical hand signals.',
    keyPoints: [
      'BLUE = Cover 2 Zone. Hand signal = 👆 Point at the sky. 2 Deep Safeties splitting halves. Corners align with OUTSIDE LEVERAGE (5 yds off) to funnel #1 WR inside, then squat in the flats. 5 underneath zone players.',
      'GREEN = Cover 3 Sky/Cloud. Hand signal = 👇 Point at the ground/grass/turf. 3 Deep Thirds (2 Corners + Free Safety). Corners align with OUTSIDE LEVERAGE (7 yds off) to protect the sideline and bail deep 1/3. Strong Safety rolls down into the box. Premier 8-man run defense.',
      'BLACK = Cover 1 Man-Free. Hand signal = 👕 Tug of the jersey. In normal Black, CBs play 7 yards off with inside leverage. Not automatic press coverage!',
      '“JAM” Call (Black Press Modifier): Hand signal = 🙌 Two hands up palms out, with a pushing motion. CBs align on the LOS, hand fighting with receiver at snap, then covering inside hip tightly.',
      'Will & Mike Shared Black Responsibility: Will and Mike share the back. If back goes to weak side, Will is covering. If to the strong side, Mike covers. The non-cover LB is in Spy.',
      'Cover Black vs Double Tight End Heavy: Matchup based on threats outside in: LCB has #1 threat (X) to his side, Rover has #2 threat (Y1) to his side, Will has #3 threat (TB). RCB has #1 threat to his side (Y2), Sam has #2 threat (TB) to his side. Mike has #3 threat (TB) to his side and #4 threat (FB) to Will\'s side.',
      'Run Gap vs Pass Threat Separation: In Cover Black, threat counting applies strictly to PASS COVERAGE. On run actions, inside linebackers fit the dynamic open gap (e.g. Will in Weak A and Mike in Strong B in Base Front; Will in Weak B and Mike in Strong A on Slant Front).',
    ],
    coachingQuote: '“Sky = Blue. Ground = Green. Jersey Tug = Black (7 yds off). Hands pushing = Jam (Press at LOS). Run fits take the open gap; pass drops match threats.”',
  },
  {
    id: 'tempo_communication',
    title: '6. Defensive Signals & Communication',
    category: 'communication',
    summary: 'Verbal calls and physical hand signals that keep all 11 players coordinated.',
    keyPoints: [
      'BASE Signal: ✊ Fist held up, palm out.',
      'SHIELD Signal: 👊 Fist held in front of body, palm in.',
      'VANGUARD Signal: ⚔️ Crossed arms / downward chop (Goal line short yardage).',
      'SHELL Signal: 🛡️ Open hands pressed back (Prevent pass defense).',
      'BLUE Coverage Signal: 👆 Point at the sky.',
      'GREEN Coverage Signal: 👇 Point at the ground/grass/turf.',
      'BLACK Coverage Signal: 👕 Tug of the jersey (Normal Black: 7 yds off, inside leverage).',
      'JAM Coverage Signal: 🙌 Two hands up palms out, with a pushing motion (Press at LOS, hand fighting at snap).',
      '“RELOAD!”: Urgent reset call shouted when offense runs hurry-up. All 11 sprint to alignment.',
      '“RIP” / “LIZ”: Strength call announced by Mike based on TE alignment (Rip = Right, Liz = Left).',
    ],
    coachingQuote: '“11 players executing the same call with violent effort will always dominate the line of scrimmage.”',
  },
];
