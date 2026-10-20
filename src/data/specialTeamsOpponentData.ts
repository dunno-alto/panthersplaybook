import { SpecialTeamsUnitId } from './specialTeamsData';

export interface STOpponentPlayer {
  id: string;
  label: string;
  number?: string;
  name: string;
  role: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  waypoints?: Array<{ x: number; y: number }>;
  responsibility?: string;
  coachingCue?: string;
  schemeVariants?: Record<
    string,
    {
      x?: number;
      y?: number;
      targetX?: number;
      targetY?: number;
      waypoints?: Array<{ x: number; y: number }>;
      role?: string;
      responsibility?: string;
      coachingCue?: string;
    }
  >;
}

export interface STBallTrajectoryPhase {
  startProgress: number;
  endProgress: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  arcHeight?: number; // Visual elevation peak in pixels
  label?: string;
}

export interface STBallTrajectory {
  phases: STBallTrajectoryPhase[];
}

/**
 * 11-Man Opponent Rosters for every Special Teams Unit
 *
 * FIELD ORIENTATION STANDARD:
 * - Kicking/Coverage Units (kickoff, punt_coverage, fg_pat):
 *     Our team lines up at the BOTTOM (y: 390-520), kicking/attacking UP.
 *     Opponent lines up at the TOP (y: 90-370), receiving/rushing DOWN.
 *
 * - Returning/Blocking Units (kick_return, punt_return, fg_block):
 *     Opponent lines up at the TOP (y: 110-230), kicking/punting DOWN.
 *     Our team lines up at the BOTTOM (y: 245-560), returning/blocking UP.
 */
export const SPECIAL_TEAMS_OPPONENTS: Record<SpecialTeamsUnitId, STOpponentPlayer[]> = {
  // =========================================================================
  // 1. KICKOFF: Our team kicks from bottom (y=520) UP. Opponent KOR is at TOP (y=90-430).
  // =========================================================================
  kickoff: [
    // Front Line 5 (Positioned across the 45-yd line at y=430, facing our kicker at 520)
    {
      id: 'OPP_FL1',
      label: 'FL1',
      name: 'Left Front Blocker',
      role: 'Drop & Wall Left',
      x: 180,
      y: 430,
      targetX: 200,
      targetY: 310,
      waypoints: [{ x: 190, y: 370 }],
      responsibility: 'Drop 12 yards upfield, turn inside, and wall off outside lane disrupter L5/L4.',
      coachingCue: 'Drop with depth, then pin outside shoulder.',
      schemeVariants: {
        sky_kick_right: { targetX: 250, targetY: 340, responsibility: 'Drop short and seal backside lane against reverse.' },
        onside_kick_right: { x: 200, y: 460, targetX: 250, targetY: 480, role: 'Hands Front Boundary', responsibility: 'Alert for onside kick bounce. Secure on turf.' },
      },
    },
    {
      id: 'OPP_FL2',
      label: 'FL2',
      name: 'Left Center Blocker',
      role: 'Double-Team L3',
      x: 340,
      y: 430,
      targetX: 340,
      targetY: 290,
      waypoints: [{ x: 340, y: 360 }],
      responsibility: 'Drop 15 yards upfield into wedge funnel and double team incoming L3 coverage runner.',
      coachingCue: 'Lock hips with FL3, drive lane disrupter backward.',
      schemeVariants: {
        sky_kick_right: { targetX: 420, targetY: 360 },
        onside_kick_right: { x: 350, y: 460, targetX: 420, targetY: 480, role: 'Hands Front Guard', responsibility: 'Field onside squib with two hands.' },
      },
    },
    {
      id: 'OPP_FL3',
      label: 'FL3',
      name: 'Center Front Blocker',
      role: 'Middle Wedge Anchor',
      x: 500,
      y: 430,
      targetX: 500,
      targetY: 280,
      waypoints: [{ x: 500, y: 350 }],
      responsibility: 'Drop straight back upfield 15 yards, anchor the middle chute, and take on lead kicker/safety.',
      coachingCue: 'Stay square to the ball; absorb middle shock.',
      schemeVariants: {
        sky_kick_right: { targetX: 580, targetY: 370 },
        onside_kick_right: { x: 500, y: 460, targetX: 560, targetY: 480, role: 'Hands Front Center', responsibility: 'Attack rolling ball instantly.' },
      },
    },
    {
      id: 'OPP_FL4',
      label: 'FL4',
      name: 'Right Center Blocker',
      role: 'Double-Team R3',
      x: 660,
      y: 430,
      targetX: 640,
      targetY: 290,
      waypoints: [{ x: 650, y: 360 }],
      responsibility: 'Drop 15 yards upfield into right chute and double team incoming R3 coverage runner.',
      coachingCue: 'Strike through inside breastplate; maintain leverage.',
      schemeVariants: {
        sky_kick_right: { targetX: 720, targetY: 310, responsibility: 'Locate short sky kick trajectory and shield landing area.' },
        onside_kick_right: { x: 650, y: 460, targetX: 680, targetY: 480, role: 'Hands Front Guard', responsibility: 'Box out onside recovery sprint.' },
      },
    },
    {
      id: 'OPP_FL5',
      label: 'FL5',
      name: 'Right Front Blocker',
      role: 'Drop & Wall Right',
      x: 820,
      y: 430,
      targetX: 790,
      targetY: 310,
      waypoints: [{ x: 810, y: 370 }],
      responsibility: 'Drop 12 yards upfield, turn inside, and wall off outside disrupter R4/R5.',
      coachingCue: 'Seal sideline alley; do not let disrupter get inside.',
      schemeVariants: {
        sky_kick_right: { targetX: 780, targetY: 260, role: 'Sky Catch Cover', responsibility: 'Call fair catch or catch high pooch kick cleanly.' },
        onside_kick_right: { x: 800, y: 460, targetX: 790, targetY: 480, role: 'Hands Front Wing', responsibility: 'Recover ball on turf.' },
      },
    },
    // Wedge 3 & FB (Positioned at y=280-320, retreating to y=200-240 to build wedge)
    {
      id: 'OPP_W1',
      label: 'W1',
      name: 'Wedge Blocker 1',
      role: 'Left Wedge Wall',
      x: 380,
      y: 290,
      targetX: 420,
      targetY: 220,
      waypoints: [{ x: 400, y: 250 }],
      responsibility: 'Assemble left flank of moving 4-man wedge wall ahead of returner.',
      coachingCue: 'Shoulder-to-shoulder with FB; blow open the seam.',
      schemeVariants: {
        sky_kick_right: { targetX: 600, targetY: 280 },
        onside_kick_right: { x: 380, y: 380, targetX: 430, targetY: 430, role: 'Hands Second Layer' },
      },
    },
    {
      id: 'OPP_FB',
      label: 'FB',
      name: 'Lead Wedge Fullback',
      role: 'Wedge Point Man',
      x: 500,
      y: 290,
      targetX: 500,
      targetY: 210,
      waypoints: [{ x: 500, y: 250 }],
      responsibility: 'Lead wedge bulldozer: clear out first coverage man breaking into return alley.',
      coachingCue: 'Explode through middle lane contact; clear the path.',
      schemeVariants: {
        sky_kick_right: { targetX: 680, targetY: 270 },
        onside_kick_right: { x: 500, y: 380, targetX: 520, targetY: 430, role: 'Hands Second Layer' },
      },
    },
    {
      id: 'OPP_W2',
      label: 'W2',
      name: 'Wedge Blocker 2',
      role: 'Right Wedge Wall',
      x: 620,
      y: 290,
      targetX: 580,
      targetY: 220,
      waypoints: [{ x: 600, y: 250 }],
      responsibility: 'Assemble right flank of moving 4-man wedge wall ahead of returner.',
      coachingCue: 'Keep wedge tight; do not let disrupters split seams.',
      schemeVariants: {
        sky_kick_right: { targetX: 740, targetY: 260 },
        onside_kick_right: { x: 620, y: 380, targetX: 650, targetY: 430, role: 'Hands Second Layer' },
      },
    },
    {
      id: 'OPP_W3',
      label: 'W3',
      name: 'Up-Man / Wedge Anchor',
      role: 'Wedge Flank Protector',
      x: 500,
      y: 210,
      targetX: 510,
      targetY: 180,
      responsibility: 'Scan downfield for free coverage runners; pick up unblocked penetrators.',
      coachingCue: 'Read coverage flow; eliminate free runners.',
      schemeVariants: {
        sky_kick_right: { targetX: 720, targetY: 220 },
        onside_kick_right: { x: 300, y: 320, targetX: 400, targetY: 380, role: 'Hands Deep Safety' },
      },
    },
    // Returners (Deep at y=90-120, catch kick and advance DOWNFIELD)
    {
      id: 'OPP_R2',
      label: 'R2',
      name: 'Secondary Returner',
      role: 'Lead Escort / Wedge Lead',
      x: 400,
      y: 100,
      targetX: 480,
      targetY: 230,
      waypoints: [{ x: 440, y: 150 }],
      responsibility: 'Off-returner: communicate kick direction to R1, lead upfield as lead escort blocker.',
      coachingCue: 'Call “YOU YOU YOU” or “ME ME ME”; block first threat.',
      schemeVariants: {
        sky_kick_right: { targetX: 680, targetY: 200 },
        onside_kick_right: { x: 500, y: 250, targetX: 500, targetY: 360, role: 'Hands Deep Middle' },
      },
    },
    {
      id: 'OPP_R1',
      label: 'R1',
      name: 'Primary Returner',
      role: 'Ball Carrier Returner',
      x: 580,
      y: 90,
      targetX: 500,
      targetY: 310,
      waypoints: [{ x: 580, y: 120 }, { x: 540, y: 200 }],
      responsibility: 'Field kick at 10 yard line, accelerate downfield into wedge slipstream, cut off FB block.',
      coachingCue: 'Catch at eye level with tuck; explode through crease.',
      schemeVariants: {
        sky_kick_right: {
          x: 580,
          y: 90,
          targetX: 750,
          targetY: 230,
          waypoints: [{ x: 720, y: 140 }],
          responsibility: 'Sprint to right sideline numbers to field short sky kick.',
        },
        onside_kick_right: {
          x: 680,
          y: 250,
          targetX: 680,
          targetY: 380,
          role: 'Hands Deep Right',
          responsibility: 'Deep safety valve: secure any bounding kick that squirts through.',
        },
      },
    },
  ],

  // =========================================================================
  // 2. KICK RETURN: Opponent Kickoff team is at TOP (y=140), kicking DOWN.
  //    Our KOR team is at BOTTOM (y=220-560), returning UP.
  // =========================================================================
  kick_return: [
    {
      id: 'OPP_L5',
      label: 'L5',
      name: 'Opponent Contain Left',
      role: 'Safety Contain Lane 5',
      x: 100,
      y: 140,
      targetX: 110,
      targetY: 420,
      waypoints: [{ x: 105, y: 270 }],
      responsibility: 'Left boundary contain: keep outside arm free, do not let returner outside.',
      coachingCue: 'Squeeze boundary lane; funnel ball carrier inside.',
      schemeVariants: {
        wheel_left: { targetX: 110, targetY: 260, responsibility: 'Attacks sideline; engaged and driven by FL1 stepped drop.' },
        wheel_right: { targetX: 150, targetY: 460, responsibility: 'Backside pursuit across field.' },
        hands_team: { targetX: 180, targetY: 240, role: 'Onside Safety Left' },
      },
    },
    {
      id: 'OPP_L4',
      label: 'L4',
      name: 'Opponent Gunner Left',
      role: 'Bullet Lane 4',
      x: 180,
      y: 140,
      targetX: 190,
      targetY: 450,
      waypoints: [{ x: 185, y: 290 }],
      responsibility: 'Speed bullet down lane 4: penetrate wedge and disrupt return path.',
      coachingCue: 'Sprint full speed; rip through front blocker hands.',
      schemeVariants: {
        wheel_left: { targetX: 160, targetY: 280, responsibility: 'Stoned at point of attack by FL2 stepped drop.' },
        wheel_right: { targetX: 280, targetY: 470 },
        hands_team: { targetX: 280, targetY: 240 },
      },
    },
    {
      id: 'OPP_L3',
      label: 'L3',
      name: 'Opponent Lane Runner L3',
      role: 'Alley Disrupter',
      x: 260,
      y: 140,
      targetX: 260,
      targetY: 470,
      waypoints: [{ x: 250, y: 300 }],
      responsibility: 'Attack seam inside lane 3: engage wedge wall with explosive shock.',
      coachingCue: 'Keep shoulders square; blow up wedge seam.',
      schemeVariants: {
        wheel_left: { targetX: 200, targetY: 300, responsibility: 'Walled off by FL3 stepped drop.' },
        wheel_right: { targetX: 380, targetY: 480 },
        hands_team: { targetX: 380, targetY: 240 },
      },
    },
    {
      id: 'OPP_L2',
      label: 'L2',
      name: 'Opponent Lane Runner L2',
      role: 'Inside Fold Runner',
      x: 340,
      y: 140,
      targetX: 330,
      targetY: 490,
      waypoints: [{ x: 320, y: 310 }],
      responsibility: 'Disrupt wedge point man FB: strike low, do not get sealed inside.',
      coachingCue: 'Penetrate FB inside gap.',
      schemeVariants: {
        wheel_left: { targetX: 220, targetY: 310, responsibility: 'Engaged by Lead Fullback in wedge wall.' },
        wheel_right: { targetX: 480, targetY: 490 },
        hands_team: { targetX: 450, targetY: 240 },
      },
    },
    {
      id: 'OPP_L1',
      label: 'L1',
      name: 'Opponent Safety Valve L1',
      role: 'Safety Spill L1',
      x: 420,
      y: 140,
      targetX: 400,
      targetY: 510,
      waypoints: [{ x: 390, y: 320 }],
      responsibility: 'Inside spill runner: cross face of wedge, force returner to cut back.',
      coachingCue: 'Spill ball carrier wide into pursuit.',
      schemeVariants: {
        wheel_left: { targetX: 240, targetY: 320, responsibility: 'Sealed by W2 in 4-man wedge.' },
        wheel_right: { targetX: 560, targetY: 500 },
        hands_team: { targetX: 500, targetY: 240 },
      },
    },
    {
      id: 'OPP_K',
      label: 'K',
      name: 'Opponent Kicker',
      role: 'Safety Valve / Kicker',
      x: 500,
      y: 140,
      targetX: 480,
      targetY: 430,
      waypoints: [{ x: 500, y: 220 }, { x: 490, y: 320 }],
      responsibility: 'Drive kick deep between hash marks, then trail coverage as safety valve.',
      coachingCue: 'Follow ball trajectory; make open-field tackle as last line.',
      schemeVariants: {
        wheel_left: { targetX: 300, targetY: 360, responsibility: 'Trails play toward left sideline; held outside return alley.' },
        wheel_right: { targetX: 680, targetY: 360 },
        hands_team: { x: 500, y: 140, targetX: 560, targetY: 210, role: 'Onside Squib Striker', responsibility: 'Drive low spinning squib kick to boundary numbers.' },
      },
    },
    {
      id: 'OPP_R1',
      label: 'R1',
      name: 'Opponent Safety Valve R1',
      role: 'Safety Spill R1',
      x: 580,
      y: 140,
      targetX: 570,
      targetY: 510,
      waypoints: [{ x: 580, y: 320 }],
      responsibility: 'Inside spill runner: attack wedge seam, blow up wedge right flank.',
      coachingCue: 'Charge the wedge; blow up the right flank.',
      schemeVariants: {
        wheel_left: { targetX: 300, targetY: 360, responsibility: 'Chases backside across field.' },
        wheel_right: { targetX: 740, targetY: 320, responsibility: 'Sealed by W2 in right wedge.' },
        hands_team: { targetX: 580, targetY: 240 },
      },
    },
    {
      id: 'OPP_R2',
      label: 'R2',
      name: 'Opponent Lane Runner R2',
      role: 'Inside Fold Runner',
      x: 660,
      y: 140,
      targetX: 650,
      targetY: 490,
      waypoints: [{ x: 660, y: 310 }],
      responsibility: 'Lane 2 runner: match returner speed, scrape to football.',
      coachingCue: 'Mirror returner hips; scrape through congestion.',
      schemeVariants: {
        wheel_left: { targetX: 360, targetY: 400 },
        wheel_right: { targetX: 760, targetY: 310, responsibility: 'Engaged by Lead Fullback in right wedge.' },
        hands_team: { targetX: 640, targetY: 240 },
      },
    },
    {
      id: 'OPP_R3',
      label: 'R3',
      name: 'Opponent Lane Runner R3',
      role: 'Alley Disrupter',
      x: 740,
      y: 140,
      targetX: 730,
      targetY: 470,
      waypoints: [{ x: 740, y: 300 }],
      responsibility: 'Right seam attack: take on front blocker with physical hands.',
      coachingCue: 'Shed block cleanly; pursue returner.',
      schemeVariants: {
        wheel_left: { targetX: 420, targetY: 440 },
        wheel_right: { targetX: 780, targetY: 300, responsibility: 'Walled off by FL3 stepped drop.' },
        hands_team: { targetX: 700, targetY: 240 },
      },
    },
    {
      id: 'OPP_R4',
      label: 'R4',
      name: 'Opponent Gunner Right',
      role: 'Bullet Lane 4',
      x: 820,
      y: 140,
      targetX: 800,
      targetY: 450,
      waypoints: [{ x: 810, y: 290 }],
      responsibility: 'Right bullet: sprint full speed downfield, keep inside-out leverage.',
      coachingCue: 'Rip through perimeter block; pursue with speed.',
      schemeVariants: {
        wheel_left: { targetX: 480, targetY: 470 },
        wheel_right: { targetX: 820, targetY: 280, responsibility: 'Stoned at point of attack by FL4 stepped drop.' },
        hands_team: { targetX: 760, targetY: 240 },
      },
    },
    {
      id: 'OPP_R5',
      label: 'R5',
      name: 'Opponent Contain Right',
      role: 'Safety Contain Lane 5',
      x: 900,
      y: 140,
      targetX: 880,
      targetY: 420,
      waypoints: [{ x: 890, y: 270 }],
      responsibility: 'Right boundary contain: protect right sideline, keep outside arm free.',
      coachingCue: 'Do not let returner outside your outside shoulder.',
      schemeVariants: {
        wheel_left: { targetX: 520, targetY: 500 },
        wheel_right: { targetX: 870, targetY: 260, responsibility: 'Attacks sideline; driven by FL5 stepped drop.' },
        hands_team: { targetX: 820, targetY: 240 },
      },
    },
  ],

  // =========================================================================
  // 3. PUNT COVERAGE: Our punt unit is at BOTTOM (LOS y=390, Punter y=490) punting UP.
  //    Opponent is at TOP (D-line y=370, Returner y=100) rushing DOWN.
  // =========================================================================
  punt_coverage: [
    {
      id: 'OPP_JAML',
      label: 'JAM-L',
      name: 'Left Gunner Jammer',
      role: 'Press Jam Gunner L',
      x: 120,
      y: 370,
      targetX: 130,
      targetY: 240,
      waypoints: [{ x: 125, y: 310 }],
      responsibility: 'Two-hand press jam on Gunner Left at LOS to delay downfield release.',
      coachingCue: 'Feet first; mirror Gunner release and do not get stacked.',
      schemeVariants: {
        p3_power_35: { targetX: 180, targetY: 340, responsibility: 'Reacts late to fake power run.' },
        directional_left: { targetX: 110, targetY: 180, responsibility: 'Squeezes sideline to shield Gunner L.' },
      },
    },
    {
      id: 'OPP_JAMR',
      label: 'JAM-R',
      name: 'Right Gunner Jammer',
      role: 'Press Jam Gunner R',
      x: 880,
      y: 370,
      targetX: 870,
      targetY: 240,
      waypoints: [{ x: 875, y: 310 }],
      responsibility: 'Two-hand press jam on Gunner Right at LOS to delay downfield release.',
      coachingCue: 'Punch breastplate; ride Gunner into sideline.',
      schemeVariants: {
        p3_power_35: { targetX: 820, targetY: 340 },
        directional_left: { targetX: 840, targetY: 240 },
      },
    },
    {
      id: 'OPP_LE',
      label: 'LE',
      name: 'Opponent Rush Edge Left',
      role: 'Edge Rusher',
      x: 300,
      y: 370,
      targetX: 380,
      targetY: 450,
      waypoints: [{ x: 330, y: 410 }],
      responsibility: 'Bend edge hard toward punt shield to force rushed kick.',
      coachingCue: 'Dip shoulder under Wing; aim for punter launch spot.',
      schemeVariants: {
        p3_power_35: { targetX: 340, targetY: 390, responsibility: 'Bit by fake run in backfield.' },
      },
    },
    {
      id: 'OPP_LT',
      label: 'LT',
      name: 'Opponent Defensive Tackle',
      role: 'B-Gap Rusher',
      x: 380,
      y: 370,
      targetX: 420,
      targetY: 440,
      responsibility: 'Crash B-gap between Tackle and Guard, engage Personal Protector.',
      coachingCue: 'Strike through guard; collapse shield.',
      schemeVariants: {
        p3_power_35: { targetX: 400, targetY: 380, responsibility: 'Sealed by P1 lead block.' },
      },
    },
    {
      id: 'OPP_NT',
      label: 'NT',
      name: 'Opponent Nose Tackle',
      role: 'A-Gap Rusher',
      x: 500,
      y: 370,
      targetX: 500,
      targetY: 430,
      responsibility: 'Bull rush through Long Snapper gap directly at Punter.',
      coachingCue: 'Do not hit snapper early; surge through A-gap.',
      schemeVariants: {
        p3_power_35: { targetX: 480, targetY: 380, responsibility: 'Blindsided by P2 seal.' },
      },
    },
    {
      id: 'OPP_RT',
      label: 'RT',
      name: 'Opponent Defensive Tackle',
      role: 'B-Gap Rusher',
      x: 620,
      y: 370,
      targetX: 580,
      targetY: 440,
      responsibility: 'Crash right B-gap between RG and RT, penetrate into backfield.',
      coachingCue: 'Rip through tackle outside shoulder.',
      schemeVariants: {
        p3_power_35: { targetX: 560, targetY: 360, responsibility: 'Over-pursues fake direction.' },
      },
    },
    {
      id: 'OPP_RE',
      label: 'RE',
      name: 'Opponent Rush Edge Right',
      role: 'Edge Rusher',
      x: 700,
      y: 370,
      targetX: 620,
      targetY: 450,
      waypoints: [{ x: 670, y: 410 }],
      responsibility: 'Speed rush off right edge to challenge P3 protector.',
      coachingCue: 'Speed around edge; lay out for block.',
      schemeVariants: {
        p3_power_35: { targetX: 640, targetY: 370 },
      },
    },
    {
      id: 'OPP_LB1',
      label: 'LB1',
      name: 'Opponent Wall LB Left',
      role: 'Left Wall Drop',
      x: 360,
      y: 300,
      targetX: 300,
      targetY: 200,
      waypoints: [{ x: 330, y: 250 }],
      responsibility: 'Drop upfield into left alley to set up return wall on Gunner L.',
      coachingCue: 'Locate Gunner; seal outside shoulder.',
      schemeVariants: {
        p3_power_35: { targetX: 380, targetY: 320, responsibility: 'Scrapes to stop P3 power run.' },
      },
    },
    {
      id: 'OPP_LB2',
      label: 'LB2',
      name: 'Opponent Wall LB Right',
      role: 'Right Wall Drop',
      x: 640,
      y: 300,
      targetX: 680,
      targetY: 200,
      waypoints: [{ x: 660, y: 250 }],
      responsibility: 'Drop upfield into right alley to set up return wall on Gunner R.',
      coachingCue: 'Drive Gunner toward boundary.',
      schemeVariants: {
        p3_power_35: { targetX: 580, targetY: 320 },
      },
    },
    {
      id: 'OPP_PR2',
      label: 'PR2',
      name: 'Opponent Off-Returner',
      role: 'Short Punt / Lead Blocker',
      x: 580,
      y: 160,
      targetX: 520,
      targetY: 140,
      responsibility: 'Field short/shanked punt or lead block for primary returner PR1.',
      coachingCue: 'Communicate with PR1; peel back to block first gunner.',
      schemeVariants: {
        directional_left: { targetX: 320, targetY: 130, responsibility: 'Shift left to field directional punt.' },
      },
    },
    {
      id: 'OPP_PR1',
      label: 'PR1',
      name: 'Opponent Deep Returner',
      role: 'Primary Punt Returner',
      x: 500,
      y: 95,
      targetX: 500,
      targetY: 220,
      waypoints: [{ x: 500, y: 120 }, { x: 480, y: 160 }],
      responsibility: 'Track punt trajectory, secure catch, and accelerate downfield into return lane.',
      coachingCue: 'Keep feet under catch; one cut and explode downfield.',
      schemeVariants: {
        directional_left: {
          x: 500,
          y: 95,
          targetX: 200,
          targetY: 130,
          waypoints: [{ x: 300, y: 105 }],
          responsibility: 'Track directional punt to left boundary; call fair catch.',
        },
      },
    },
  ],

  // =========================================================================
  // 4. PUNT RETURN: Opponent Punt team is at TOP (Punter y=110, LOS y=230) punting DOWN.
  //    Our team is at BOTTOM (Rushers y=245, Returner y=540) returning/rushing UP.
  // =========================================================================
  punt_return: [
    // Punter (14 yds behind LOS at top!)
    {
      id: 'OPP_P',
      label: 'P',
      name: 'Opponent Punter',
      role: 'Specialist Punter',
      x: 500,
      y: 110,
      targetX: 500,
      targetY: 115,
      responsibility: 'Catch long snap at 14 yards depth, two-step launch high spiral punt downfield.',
      coachingCue: 'Catch, drop, and drive through football.',
      schemeVariants: {
        all_out_block: { targetX: 500, targetY: 110, responsibility: 'Rushed kick under heavy blitz pressure.' },
      },
    },
    // Personal Protector (7 yds behind LOS at top!)
    {
      id: 'OPP_PP',
      label: 'PP',
      name: 'Opponent Personal Protector',
      role: 'Punt Shield Leader',
      x: 470,
      y: 165,
      targetX: 470,
      targetY: 180,
      responsibility: 'Direct protection call, pick up free rusher in A-gap, then cover middle.',
      coachingCue: 'Block nearest inside penetration; do not let punter get hit.',
      schemeVariants: {
        all_out_block: { targetX: 470, targetY: 175, responsibility: 'Collapses under double A-gap rush.' },
      },
    },
    // Long Snapper (On the LOS at y=230, snapping UP to Punter at 110)
    {
      id: 'OPP_LS',
      label: 'LS',
      name: 'Opponent Long Snapper',
      role: 'Long Snap & Coverage',
      x: 500,
      y: 230,
      targetX: 500,
      targetY: 380,
      waypoints: [{ x: 500, y: 290 }],
      responsibility: 'Deliver accurate 14-yard snap up to punter, protect A-gap and release downfield.',
      coachingCue: 'Snap with zip, eyes up for rusher, release in lane.',
    },
    {
      id: 'OPP_LG',
      label: 'LG',
      name: 'Opponent Left Guard',
      role: 'Protection & Coverage',
      x: 430,
      y: 230,
      targetX: 410,
      targetY: 390,
      responsibility: 'Step inside to secure A-gap, then release downfield in lane 2.',
    },
    {
      id: 'OPP_RG',
      label: 'RG',
      name: 'Opponent Right Guard',
      role: 'Protection & Coverage',
      x: 570,
      y: 230,
      targetX: 590,
      targetY: 390,
      responsibility: 'Step inside to secure right A-gap, then release downfield in lane 2.',
    },
    {
      id: 'OPP_LT',
      label: 'LT',
      name: 'Opponent Left Tackle',
      role: 'Protection & Coverage',
      x: 360,
      y: 230,
      targetX: 320,
      targetY: 410,
      responsibility: 'Zone protect B-gap against rush, release to left seam.',
    },
    {
      id: 'OPP_RT',
      label: 'RT',
      name: 'Opponent Right Tackle',
      role: 'Protection & Coverage',
      x: 640,
      y: 230,
      targetX: 680,
      targetY: 410,
      responsibility: 'Zone protect B-gap against rush, release to right seam.',
    },
    {
      id: 'OPP_LW',
      label: 'LW',
      name: 'Opponent Left Wing',
      role: 'Perimeter Shield',
      x: 290,
      y: 220,
      targetX: 250,
      targetY: 430,
      responsibility: 'Seal perimeter against edge rush, release outside.',
    },
    {
      id: 'OPP_RW',
      label: 'RW',
      name: 'Opponent Right Wing',
      role: 'Perimeter Shield',
      x: 710,
      y: 220,
      targetX: 750,
      targetY: 430,
      responsibility: 'Seal right edge against overload rush, release outside.',
    },
    {
      id: 'OPP_GL',
      label: 'GL',
      name: 'Opponent Gunner Left',
      role: 'Gunner Bullet',
      x: 120,
      y: 230,
      targetX: 240,
      targetY: 480,
      waypoints: [{ x: 130, y: 340 }],
      responsibility: 'Defeat press jammer and sprint downfield to contain returner.',
      coachingCue: 'Beat jammer outside; force fair catch.',
      schemeVariants: {
        wall_left: { targetX: 220, targetY: 420, responsibility: 'Engaged and washed out by Left Wall blockers.' },
      },
    },
    {
      id: 'OPP_GR',
      label: 'GR',
      name: 'Opponent Gunner Right',
      role: 'Gunner Bullet',
      x: 880,
      y: 230,
      targetX: 760,
      targetY: 480,
      waypoints: [{ x: 870, y: 340 }],
      responsibility: 'Defeat press jammer and sprint downfield to contain returner.',
      coachingCue: 'Stack jammer; throttle down at 5 yards from returner.',
      schemeVariants: {
        wall_right: { targetX: 780, targetY: 420, responsibility: 'Engaged and washed out by Right Wall blockers.' },
      },
    },
  ],

  // =========================================================================
  // 5. FG / PAT: Our FG unit is at BOTTOM (LOS y=390, Holder y=460, Kicker y=490) kicking UP.
  //    Opponent FG Block is at TOP (Rushers y=370) rushing DOWN.
  // =========================================================================
  fg_pat: [
    {
      id: 'OPP_LEDGE',
      label: 'L-EDGE',
      name: 'Opponent Rush Edge Left',
      role: 'Speed Edge Rush',
      x: 210,
      y: 370,
      targetX: 380,
      targetY: 450,
      waypoints: [{ x: 260, y: 410 }],
      responsibility: 'Bend around left wing at top speed to disrupt kick angle.',
      coachingCue: 'Turn corner tight; dive across launch point.',
    },
    {
      id: 'OPP_BL',
      label: 'B-L',
      name: 'Opponent Rusher B-Gap Left',
      role: 'B-Gap Penetration',
      x: 310,
      y: 370,
      targetX: 420,
      targetY: 440,
      responsibility: 'Penetrate gap between Tackle and Tight End.',
    },
    {
      id: 'OPP_AL',
      label: 'A-L',
      name: 'Opponent Rusher A-Gap Left',
      role: 'A-Gap Bull Rush',
      x: 420,
      y: 370,
      targetX: 460,
      targetY: 435,
      responsibility: 'Drive through left guard outside shoulder.',
    },
    {
      id: 'OPP_NOSE',
      label: 'NOSE',
      name: 'Opponent Nose Rusher',
      role: 'Snapper Gap Surge',
      x: 500,
      y: 370,
      targetX: 500,
      targetY: 430,
      responsibility: 'Surge over snapper shoulder without illegal head contact to contest kick.',
    },
    {
      id: 'OPP_AR',
      label: 'A-R',
      name: 'Opponent Rusher A-Gap Right',
      role: 'A-Gap Bull Rush',
      x: 580,
      y: 370,
      targetX: 540,
      targetY: 435,
      responsibility: 'Drive through right guard outside shoulder.',
    },
    {
      id: 'OPP_BR',
      label: 'B-R',
      name: 'Opponent Rusher B-Gap Right',
      role: 'B-Gap Penetration',
      x: 690,
      y: 370,
      targetX: 580,
      targetY: 440,
      responsibility: 'Penetrate gap between RT and TE-R.',
    },
    {
      id: 'OPP_REDGE',
      label: 'R-EDGE',
      name: 'Opponent Rush Edge Right',
      role: 'Speed Edge Rush',
      x: 790,
      y: 370,
      targetX: 620,
      targetY: 450,
      waypoints: [{ x: 740, y: 410 }],
      responsibility: 'Bend around right wing at top speed to contest holder.',
      coachingCue: 'Lay out horizontal for block.',
      schemeVariants: {
        holder_rollout_pass: { targetX: 680, targetY: 430, responsibility: 'Pressures rollout holder.' },
      },
    },
    {
      id: 'OPP_LB1',
      label: 'LB1',
      name: 'Opponent Stack LB Left',
      role: 'A-Gap Delay Blitz',
      x: 370,
      y: 310,
      targetX: 440,
      targetY: 430,
      responsibility: 'Delay blitz behind defensive line to exploit any seam in protection.',
    },
    {
      id: 'OPP_LB2',
      label: 'LB2',
      name: 'Opponent Stack LB Right',
      role: 'Fake Contain / Scrape',
      x: 630,
      y: 310,
      targetX: 600,
      targetY: 430,
      responsibility: 'Scan for fake rollout or sweep; secure right flat.',
      schemeVariants: {
        holder_rollout_pass: { targetX: 720, targetY: 340, responsibility: 'Drops to cover TE-R in flat.' },
      },
    },
    {
      id: 'OPP_FS',
      label: 'FS',
      name: 'Opponent Free Safety',
      role: 'Fake Prevention',
      x: 310,
      y: 250,
      targetX: 350,
      targetY: 320,
      responsibility: 'Stay deep to prevent fake pass or trick play.',
      schemeVariants: {
        holder_rollout_pass: { targetX: 600, targetY: 280, responsibility: 'Breaks on holder throw.' },
      },
    },
    {
      id: 'OPP_RET',
      label: 'RET',
      name: 'Opponent Goal Line Returner',
      role: 'Kick-Six Alert Returner',
      x: 500,
      y: 80,
      targetX: 500,
      targetY: 140,
      responsibility: 'Positioned beneath goal posts ready to field short field goal and return for touchdown.',
      coachingCue: 'Field short kick in endzone, follow sideline return wall.',
    },
  ],

  // =========================================================================
  // 6. FG BLOCK: Opponent FG Unit is at TOP (Kicker y=110, Holder y=160, LOS y=230) kicking DOWN.
  //    Our team is at BOTTOM (Rushers y=245, Safeties y=310) rushing UP into holder spot!
  // =========================================================================
  fg_block: [
    // Opponent Kicker (at y=110, approaches holder at 160)
    {
      id: 'OPP_K',
      label: 'K',
      name: 'Opponent Kicker',
      role: 'Field Goal Kicker',
      x: 460,
      y: 110,
      targetX: 500,
      targetY: 155,
      waypoints: [{ x: 480, y: 135 }],
      responsibility: 'Take 2-step approach, strike ball cleanly through uprights.',
      coachingCue: 'Head down, swing through launch point.',
    },
    // Opponent Holder (at y=160, 7 yards behind LOS)
    {
      id: 'OPP_H',
      label: 'H',
      name: 'Opponent Holder',
      role: 'Snap Catch & Spot',
      x: 500,
      y: 160,
      targetX: 500,
      targetY: 160,
      responsibility: 'Catch snap cleanly, spot on tee, rotate laces toward uprights.',
      coachingCue: 'Soft hands, spot on tee in under 0.8s.',
    },
    // Opponent Snapper (at LOS y=230, snapping UP to Holder at 160)
    {
      id: 'OPP_LS',
      label: 'LS',
      name: 'Opponent Long Snapper',
      role: 'Snap to Holder',
      x: 500,
      y: 230,
      targetX: 500,
      targetY: 230,
      responsibility: 'Deliver dead-accurate 7-yard snap up to holder with laces facing field.',
      coachingCue: 'Low tight spiral straight to holder hands.',
    },
    {
      id: 'OPP_LG',
      label: 'LG',
      name: 'Opponent Left Guard',
      role: 'A-Gap Protection',
      x: 440,
      y: 230,
      targetX: 440,
      targetY: 220,
      responsibility: 'Firm inside punch to lock A-gap with Snapper.',
    },
    {
      id: 'OPP_RG',
      label: 'RG',
      name: 'Opponent Right Guard',
      role: 'A-Gap Protection',
      x: 560,
      y: 230,
      targetX: 560,
      targetY: 220,
      responsibility: 'Firm inside punch to lock right A-gap against rushers.',
    },
    {
      id: 'OPP_LT',
      label: 'LT',
      name: 'Opponent Left Tackle',
      role: 'B-Gap Protection',
      x: 380,
      y: 230,
      targetX: 380,
      targetY: 220,
      responsibility: 'Drop step and lock outside shoulder to protect launch pocket.',
    },
    {
      id: 'OPP_RT',
      label: 'RT',
      name: 'Opponent Right Tackle',
      role: 'B-Gap Protection',
      x: 620,
      y: 230,
      targetX: 620,
      targetY: 220,
      responsibility: 'Drop step and lock outside shoulder against overload rush.',
    },
    {
      id: 'OPP_TEL',
      label: 'TE-L',
      name: 'Opponent Left Tight End',
      role: 'Wing Protection',
      x: 320,
      y: 230,
      targetX: 320,
      targetY: 215,
      responsibility: 'Maintain inside leverage against edge blitzers.',
    },
    {
      id: 'OPP_TER',
      label: 'TE-R',
      name: 'Opponent Right Tight End',
      role: 'Wing Protection',
      x: 680,
      y: 230,
      targetX: 680,
      targetY: 215,
      responsibility: 'Maintain inside leverage against overload rushers.',
    },
    {
      id: 'OPP_WL',
      label: 'W-L',
      name: 'Opponent Left Wing',
      role: 'Edge Protection',
      x: 260,
      y: 220,
      targetX: 260,
      targetY: 210,
      responsibility: 'Step out to deflect edge speed rushers around the kicker.',
    },
    {
      id: 'OPP_WR',
      label: 'W-R',
      name: 'Opponent Right Wing',
      role: 'Edge Protection',
      x: 740,
      y: 220,
      targetX: 740,
      targetY: 210,
      responsibility: 'Step out to deflect right edge blitzers.',
    },
  ],
};

/**
 * Football trajectory arcs for every special teams unit & scheme
 */
export function getSTBallTrajectory(
  unitId: SpecialTeamsUnitId,
  schemeId: string,
  ballHash: 'left' | 'middle' | 'right' = 'middle'
): STBallTrajectory {
  const hashOffsetX = ballHash === 'left' ? -50 : ballHash === 'right' ? 50 : 0;

  switch (unitId) {
    case 'kickoff': {
      if (schemeId === 'onside_kick_right') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.12, fromX: 500, fromY: 520, toX: 500, toY: 520, arcHeight: 0 },
            { startProgress: 0.12, endProgress: 0.45, fromX: 500, fromY: 520, toX: 680, toY: 480, arcHeight: 18, label: 'Bounding Onside' },
            { startProgress: 0.45, endProgress: 1.0, fromX: 680, fromY: 480, toX: 680, toY: 470, arcHeight: 2, label: 'Turf Recovery' },
          ],
        };
      }
      if (schemeId === 'sky_kick_right') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.12, fromX: 500, fromY: 520, toX: 500, toY: 520, arcHeight: 0 },
            { startProgress: 0.12, endProgress: 0.55, fromX: 500, fromY: 520, toX: 750, toY: 230, arcHeight: 65, label: 'Sky Pooch Arc' },
            { startProgress: 0.55, endProgress: 1.0, fromX: 750, fromY: 230, toX: 750, toY: 235, arcHeight: 2, label: 'Fair Catch Downed' },
          ],
        };
      }
      // base_kickoff: deep high kick
      return {
        phases: [
          { startProgress: 0.0, endProgress: 0.12, fromX: 500, fromY: 520, toX: 500, toY: 520, arcHeight: 0 },
          { startProgress: 0.12, endProgress: 0.48, fromX: 500, fromY: 520, toX: 580, toY: 90, arcHeight: 80, label: 'Deep Kickoff Flight' },
          { startProgress: 0.48, endProgress: 1.0, fromX: 580, fromY: 90, toX: 500, toY: 310, arcHeight: 6, label: 'Return Advance' },
        ],
      };
    }

    case 'kick_return': {
      if (schemeId === 'hands_team') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.12, fromX: 500, fromY: 140, toX: 500, toY: 140, arcHeight: 0 },
            { startProgress: 0.12, endProgress: 0.45, fromX: 500, fromY: 140, toX: 500, toY: 220, arcHeight: 20, label: 'Onside Squib' },
            { startProgress: 0.45, endProgress: 1.0, fromX: 500, fromY: 220, toX: 500, toY: 220, arcHeight: 0, label: 'Secured on Turf' },
          ],
        };
      }
      if (schemeId === 'wheel_left') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.12, fromX: 500, fromY: 140, toX: 500, toY: 140, arcHeight: 0 },
            { startProgress: 0.12, endProgress: 0.45, fromX: 500, fromY: 140, toX: 430, toY: 560, arcHeight: 75, label: 'Kickoff Arc' },
            { startProgress: 0.45, endProgress: 0.70, fromX: 430, fromY: 560, toX: 200, toY: 460, arcHeight: 6, label: 'Wheel Cut' },
            { startProgress: 0.70, endProgress: 1.0, fromX: 200, fromY: 460, toX: 165, toY: 240, arcHeight: 6, label: 'Wedge Slipstream' },
          ],
        };
      }
      // wheel_right
      return {
        phases: [
          { startProgress: 0.0, endProgress: 0.12, fromX: 500, fromY: 140, toX: 500, toY: 140, arcHeight: 0 },
          { startProgress: 0.12, endProgress: 0.45, fromX: 500, fromY: 140, toX: 570, toY: 560, arcHeight: 75, label: 'Kickoff Arc' },
          { startProgress: 0.45, endProgress: 0.70, fromX: 570, fromY: 560, toX: 800, toY: 460, arcHeight: 6, label: 'Wheel Cut' },
          { startProgress: 0.70, endProgress: 1.0, fromX: 800, fromY: 460, toX: 835, toY: 240, arcHeight: 6, label: 'Wedge Slipstream' },
        ],
      };
    }

    case 'punt_coverage': {
      if (schemeId === 'p3_power_35') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.15, fromX: 500, fromY: 390, toX: 535, toY: 450, arcHeight: 12, label: 'Direct Snap to P3' },
            { startProgress: 0.15, endProgress: 1.0, fromX: 535, fromY: 450, toX: 380, toY: 230, arcHeight: 6, label: '5-Hole Power Run' },
          ],
        };
      }
      if (schemeId === 'directional_left') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.15, fromX: 500, fromY: 390, toX: 500, toY: 490, arcHeight: 10, label: 'Long Snap' },
            { startProgress: 0.15, endProgress: 0.22, fromX: 500, fromY: 490, toX: 500, toY: 485, arcHeight: 0, label: 'Punter Setup' },
            { startProgress: 0.22, endProgress: 0.65, fromX: 500, fromY: 485, toX: 180, toY: 110, arcHeight: 70, label: 'Directional Coffin Corner' },
            { startProgress: 0.65, endProgress: 1.0, fromX: 180, fromY: 110, toX: 160, toY: 105, arcHeight: 2, label: 'Fair Catch Pin' },
          ],
        };
      }
      // base_punt
      return {
        phases: [
          { startProgress: 0.0, endProgress: 0.15, fromX: 500, fromY: 390, toX: 500, toY: 490, arcHeight: 10, label: 'Long Snap' },
          { startProgress: 0.15, endProgress: 0.22, fromX: 500, fromY: 490, toX: 500, toY: 485, arcHeight: 0 },
          { startProgress: 0.22, endProgress: 0.62, fromX: 500, fromY: 485, toX: 500, toY: 95, arcHeight: 75, label: 'High Hangtime Punt' },
          { startProgress: 0.62, endProgress: 1.0, fromX: 500, fromY: 95, toX: 500, toY: 220, arcHeight: 6, label: 'Punt Return' },
        ],
      };
    }

    case 'punt_return': {
      return {
        phases: [
          // Snap travels UP from Snapper at 230 to Punter at 110
          { startProgress: 0.0, endProgress: 0.15, fromX: 500, fromY: 230, toX: 500, toY: 110, arcHeight: 10, label: 'Opponent Long Snap' },
          { startProgress: 0.15, endProgress: 0.22, fromX: 500, fromY: 110, toX: 500, toY: 115, arcHeight: 0 },
          // Punt travels DOWN from 115 to our Returner at 540
          { startProgress: 0.22, endProgress: 0.60, fromX: 500, fromY: 115, toX: 500, toY: 540, arcHeight: 75, label: 'Opponent Punt Flight' },
          // Returner catches and returns UP behind wall
          {
            startProgress: 0.60,
            endProgress: 1.0,
            fromX: 500,
            fromY: 540,
            toX: schemeId === 'wall_left' ? 240 : schemeId === 'wall_right' ? 740 : 500,
            toY: 280,
            arcHeight: 6,
            label: 'Return Track',
          },
        ],
      };
    }

    case 'fg_pat': {
      if (schemeId === 'holder_rollout_pass') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.15, fromX: 500 + hashOffsetX, fromY: 390, toX: 500 + hashOffsetX, toY: 460, arcHeight: 8, label: 'Snap to Holder' },
            { startProgress: 0.15, endProgress: 0.45, fromX: 500 + hashOffsetX, fromY: 460, toX: 620, toY: 420, arcHeight: 4, label: 'Holder Rollout' },
            { startProgress: 0.45, endProgress: 0.75, fromX: 620, fromY: 420, toX: 760, toY: 280, arcHeight: 25, label: 'Pass to RW' },
            { startProgress: 0.75, endProgress: 1.0, fromX: 760, fromY: 280, toX: 770, toY: 200, arcHeight: 6, label: 'Touchdown Run' },
          ],
        };
      }
      if (schemeId === 'swinging_gate') {
        return {
          phases: [
            { startProgress: 0.0, endProgress: 0.15, fromX: 500, fromY: 390, toX: 500, toY: 460, arcHeight: 6, label: 'Snap to Gate' },
            { startProgress: 0.15, endProgress: 1.0, fromX: 500, fromY: 460, toX: 380, toY: 300, arcHeight: 6, label: 'Perimeter Sweep' },
          ],
        };
      }
      // base_pat
      return {
        phases: [
          { startProgress: 0.0, endProgress: 0.15, fromX: 500 + hashOffsetX, fromY: 390, toX: 500 + hashOffsetX, toY: 460, arcHeight: 8, label: 'Snap to Holder' },
          { startProgress: 0.15, endProgress: 0.28, fromX: 500 + hashOffsetX, fromY: 460, toX: 500 + hashOffsetX, toY: 460, arcHeight: 0, label: 'Holder Set' },
          { startProgress: 0.28, endProgress: 0.75, fromX: 500 + hashOffsetX, fromY: 460, toX: 500, toY: 60, arcHeight: 85, label: 'Field Goal Through Uprights' },
          { startProgress: 0.75, endProgress: 1.0, fromX: 500, fromY: 60, toX: 500, toY: 30, arcHeight: 15, label: 'Kick is Good!' },
        ],
      };
    }

    case 'fg_block': {
      return {
        phases: [
          // Snap travels UP from Snapper at 230 to Holder at 160
          { startProgress: 0.0, endProgress: 0.15, fromX: 500, fromY: 230, toX: 500, toY: 160, arcHeight: 8, label: 'Opponent Snap to Holder' },
          { startProgress: 0.15, endProgress: 0.28, fromX: 500, fromY: 160, toX: 500, toY: 160, arcHeight: 0, label: 'Holder Sets Ball' },
          {
            startProgress: 0.28,
            endProgress: schemeId === 'safe_fake_alert' ? 0.75 : 0.40,
            fromX: 500,
            fromY: 160,
            toX: schemeId === 'safe_fake_alert' ? 500 : 510,
            toY: schemeId === 'safe_fake_alert' ? 400 : 165,
            arcHeight: schemeId === 'safe_fake_alert' ? 65 : 12,
            label: schemeId === 'safe_fake_alert' ? 'Contested Kick' : 'BLOCKED AT LAUNCH SPOT!',
          },
          {
            startProgress: schemeId === 'safe_fake_alert' ? 0.75 : 0.40,
            endProgress: 1.0,
            fromX: schemeId === 'safe_fake_alert' ? 500 : 510,
            fromY: schemeId === 'safe_fake_alert' ? 400 : 165,
            toX: schemeId === 'safe_fake_alert' ? 500 : 540,
            toY: schemeId === 'safe_fake_alert' ? 480 : 210,
            arcHeight: 4,
            label: schemeId === 'safe_fake_alert' ? 'Good' : 'Ball Loose / Recovered',
          },
        ],
      };
    }
  }
}

/**
 * Calculate football position and height at given animation progress
 */
export function interpolateBall(
  trajectory: STBallTrajectory,
  progress: number
): { x: number; y: number; height: number; phaseLabel: string } {
  if (!trajectory.phases || trajectory.phases.length === 0) {
    return { x: 500, y: 390, height: 0, phaseLabel: 'Pre-Snap' };
  }

  if (progress <= 0) {
    const first = trajectory.phases[0];
    return { x: first.fromX, y: first.fromY, height: 0, phaseLabel: 'Pre-Snap Alignment' };
  }

  if (progress >= 1) {
    const last = trajectory.phases[trajectory.phases.length - 1];
    return { x: last.toX, y: last.toY, height: 0, phaseLabel: last.label || 'Whistle / Finish' };
  }

  // Find active phase
  for (const phase of trajectory.phases) {
    if (progress >= phase.startProgress && progress <= phase.endProgress) {
      const span = phase.endProgress - phase.startProgress;
      const t = span > 0 ? (progress - phase.startProgress) / span : 0;
      const curX = phase.fromX + (phase.toX - phase.fromX) * t;
      const curY = phase.fromY + (phase.toY - phase.fromY) * t;
      const height = (phase.arcHeight || 0) * Math.sin(t * Math.PI);
      return { x: curX, y: curY, height, phaseLabel: phase.label || 'Play Action' };
    }
  }

  const last = trajectory.phases[trajectory.phases.length - 1];
  return { x: last.toX, y: last.toY, height: 0, phaseLabel: last.label || 'Whistle / Finish' };
}

/**
 * Helper to get active opponent player with scheme variants merged
 */
export function getActiveSTOpponent(
  opp: STOpponentPlayer,
  schemeId: string,
  ballHash: 'left' | 'middle' | 'right' = 'middle'
): STOpponentPlayer {
  const hashOffsetX = ballHash === 'left' ? -25 : ballHash === 'right' ? 25 : 0;
  const variant = opp.schemeVariants?.[schemeId];

  return {
    ...opp,
    x: (variant?.x ?? opp.x) + (opp.y < 300 ? hashOffsetX * 0.5 : hashOffsetX),
    y: variant?.y ?? opp.y,
    targetX: (variant?.targetX ?? opp.targetX) + hashOffsetX,
    targetY: variant?.targetY ?? opp.targetY,
    waypoints: variant?.waypoints ?? opp.waypoints,
    role: variant?.role ?? opp.role,
    responsibility: variant?.responsibility ?? opp.responsibility,
    coachingCue: variant?.coachingCue ?? opp.coachingCue,
  };
}

/**
 * Interpolate any player path (with optional waypoints) given a progress 0..1
 */
export function interpolatePlayerPath(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  waypoints: Array<{ x: number; y: number }> | undefined,
  progress: number
): { x: number; y: number } {
  const pts = [{ x: startX, y: startY }, ...(waypoints || []), { x: targetX, y: targetY }];
  if (pts.length <= 1) return { x: startX, y: startY };
  if (progress <= 0) return pts[0];
  if (progress >= 1) return pts[pts.length - 1];

  const totalSegments = pts.length - 1;
  const scaled = progress * totalSegments;
  const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
  const segT = scaled - segIndex;

  const p0 = pts[segIndex];
  const p1 = pts[segIndex + 1];

  return {
    x: p0.x + (p1.x - p0.x) * segT,
    y: p0.y + (p1.y - p0.y) * segT,
  };
}

/**
 * Determines whether a player is the primary returner / ball carrier in a special teams play,
 * and what progress fraction the ball is secured/caught.
 */
export function getSTCatchTiming(
  unitId: SpecialTeamsUnitId,
  schemeId: string,
  playerId: string,
  isOpponent: boolean
): { isCarrier: boolean; catchProgress: number } {
  if (!isOpponent) {
    // Our team players
    if (unitId === 'kick_return' && playerId === 'RTR1') {
      return { isCarrier: true, catchProgress: schemeId === 'hands_team' ? 0.45 : 0.42 };
    }
    if (unitId === 'punt_return' && playerId === 'PR') {
      return { isCarrier: true, catchProgress: 0.58 };
    }
    if (unitId === 'punt_coverage' && schemeId === 'p3_power_35' && playerId === 'P3') {
      return { isCarrier: true, catchProgress: 0.15 };
    }
    if (unitId === 'fg_pat' && schemeId === 'holder_rollout_pass' && playerId === 'H') {
      return { isCarrier: true, catchProgress: 0.15 };
    }
    if (unitId === 'fg_pat' && schemeId === 'holder_rollout_pass' && playerId === 'RW') {
      return { isCarrier: true, catchProgress: 0.75 };
    }
    if (unitId === 'fg_pat' && schemeId === 'swinging_gate' && (playerId === 'G4' || playerId === 'RH')) {
      return { isCarrier: true, catchProgress: 0.15 };
    }
  } else {
    // Opponent players
    if (unitId === 'kickoff' && (playerId === 'OPP_R1' || playerId === 'OPP_KR1' || playerId === 'R1')) {
      return { isCarrier: true, catchProgress: schemeId === 'sky_kick_right' ? 0.55 : 0.45 };
    }
    if (unitId === 'punt_coverage' && (playerId === 'OPP_PR1' || playerId === 'PR1')) {
      return { isCarrier: true, catchProgress: 0.58 };
    }
  }

  return { isCarrier: false, catchProgress: 0 };
}

/**
 * Calculates live player position, holding returners at their fielding spot until catch time
 */
export function getSTPlayerLivePosition(
  player: {
    id: string;
    x: number;
    y: number;
    targetX?: number;
    targetY?: number;
    waypoints?: Array<{ x: number; y: number }>;
  },
  unitId: SpecialTeamsUnitId,
  schemeId: string,
  isOpponent: boolean,
  progress: number
): { x: number; y: number } {
  const targetX = player.targetX ?? player.x;
  const targetY = player.targetY ?? player.y;

  const { isCarrier, catchProgress } = getSTCatchTiming(unitId, schemeId, player.id, isOpponent);

  if (!isCarrier || catchProgress <= 0) {
    // Standard player movement over full play progress 0..1
    return interpolatePlayerPath(player.x, player.y, targetX, targetY, player.waypoints, progress);
  }

  // Returner / Ball carrier behavior:
  // Before catch: returner stays at catch/fielding spot tracking the ball
  if (progress <= catchProgress) {
    return { x: player.x, y: player.y };
  }

  // After catch: returner advances along return route
  const returnProgress = Math.min(1, (progress - catchProgress) / (1 - catchProgress));
  return interpolatePlayerPath(player.x, player.y, targetX, targetY, player.waypoints, returnProgress);
}

/**
 * Computes exact football position during flight and locks it to the returner during return
 */
export function getLiveSTBallPosition(
  unitId: SpecialTeamsUnitId,
  schemeId: string,
  ballHash: 'left' | 'middle' | 'right',
  ourPlayers: Array<{ id: string; x: number; y: number; targetX?: number; targetY?: number; waypoints?: Array<{ x: number; y: number }> }>,
  opponents: Array<{ id: string; x: number; y: number; targetX?: number; targetY?: number; waypoints?: Array<{ x: number; y: number }> }>,
  progress: number
): { x: number; y: number; height: number; phaseLabel: string } {
  const hashOffsetX = ballHash === 'left' ? -50 : ballHash === 'right' ? 50 : 0;

  switch (unitId) {
    case 'kick_return': {
      const returner = ourPlayers.find((p) => p.id === 'RTR1') || { id: 'RTR1', x: 430, y: 560 };
      const catchT = schemeId === 'hands_team' ? 0.45 : 0.42;

      if (schemeId === 'hands_team') {
        if (progress <= 0.12) {
          return { x: 500, y: 140, height: 0, phaseLabel: 'Pre-Kick Alignment' };
        }
        if (progress < catchT) {
          const t = (progress - 0.12) / (catchT - 0.12);
          const curX = 500 + (returner.x - 500) * t;
          const curY = 140 + (returner.y - 140) * t;
          const height = 20 * Math.sin(t * Math.PI);
          return { x: curX, y: curY, height, phaseLabel: 'Onside Squib' };
        }
        const retPos = getSTPlayerLivePosition(returner, unitId, schemeId, false, progress);
        return { x: retPos.x, y: retPos.y, height: 0, phaseLabel: 'Secured on Turf' };
      }

      // wheel_left or wheel_right
      if (progress <= 0.12) {
        return { x: 500, y: 140, height: 0, phaseLabel: 'Pre-Kick Alignment' };
      }
      if (progress < catchT) {
        const t = (progress - 0.12) / (catchT - 0.12);
        const curX = 500 + (returner.x - 500) * t;
        const curY = 140 + (returner.y - 140) * t;
        const height = 75 * Math.sin(t * Math.PI);
        return { x: curX, y: curY, height, phaseLabel: 'Kickoff Flight' };
      }

      // Return in progress: ball is carried directly by Returner Primary in lockstep!
      const retPos = getSTPlayerLivePosition(returner, unitId, schemeId, false, progress);
      const isSlipstream = progress >= 0.70;
      return {
        x: retPos.x,
        y: retPos.y,
        height: 0,
        phaseLabel: isSlipstream ? 'Wedge Slipstream Break' : 'Wheel Cut with Ball',
      };
    }

    case 'punt_return': {
      const pr = ourPlayers.find((p) => p.id === 'PR') || { id: 'PR', x: 500, y: 540 };
      const catchT = 0.58;

      if (progress <= 0.15) {
        const t = progress / 0.15;
        return { x: 500, y: 230 + (110 - 230) * t, height: 10 * Math.sin(t * Math.PI), phaseLabel: 'Opponent Long Snap' };
      }
      if (progress <= 0.22) {
        return { x: 500, y: 115, height: 0, phaseLabel: 'Punter Setup' };
      }
      if (progress < catchT) {
        const t = (progress - 0.22) / (catchT - 0.22);
        const curX = 500 + (pr.x - 500) * t;
        const curY = 115 + (pr.y - 115) * t;
        const height = 75 * Math.sin(t * Math.PI);
        return { x: curX, y: curY, height, phaseLabel: 'Opponent Punt Flight' };
      }

      // Return in progress: ball is carried directly by Returner Primary in lockstep!
      const prPos = getSTPlayerLivePosition(pr, unitId, schemeId, false, progress);
      return {
        x: prPos.x,
        y: prPos.y,
        height: 0,
        phaseLabel: 'Punt Return Behind Wall',
      };
    }

    case 'kickoff': {
      const oppR1 = opponents.find((o) => o.id === 'OPP_R1' || o.id === 'OPP_KR1' || o.id === 'R1') || {
        id: 'OPP_R1',
        x: 580,
        y: 90,
      };

      if (schemeId === 'onside_kick_right') {
        if (progress <= 0.12) {
          return { x: 500, y: 520, height: 0, phaseLabel: 'Pre-Kick Alignment' };
        }
        if (progress <= 0.45) {
          const t = (progress - 0.12) / (0.45 - 0.12);
          return {
            x: 500 + (680 - 500) * t,
            y: 520 + (480 - 520) * t,
            height: 18 * Math.sin(t * Math.PI),
            phaseLabel: 'Bounding Onside',
          };
        }
        return { x: 680, y: 475, height: 0, phaseLabel: 'Turf Recovery' };
      }

      if (schemeId === 'sky_kick_right') {
        const catchT = 0.55;
        if (progress <= 0.12) {
          return { x: 500, y: 520, height: 0, phaseLabel: 'Pre-Kick Alignment' };
        }
        if (progress < catchT) {
          const t = (progress - 0.12) / (catchT - 0.12);
          return {
            x: 500 + (750 - 500) * t,
            y: 520 + (230 - 520) * t,
            height: 65 * Math.sin(t * Math.PI),
            phaseLabel: 'Sky Pooch Arc',
          };
        }
        const oppPos = getSTPlayerLivePosition(oppR1, unitId, schemeId, true, progress);
        return { x: oppPos.x, y: oppPos.y, height: 0, phaseLabel: 'Fair Catch Downed' };
      }

      // base_kickoff: deep kick, opponent returns
      const catchT = 0.45;
      if (progress <= 0.12) {
        return { x: 500, y: 520, height: 0, phaseLabel: 'Pre-Kick Alignment' };
      }
      if (progress < catchT) {
        const t = (progress - 0.12) / (catchT - 0.12);
        const curX = 500 + (oppR1.x - 500) * t;
        const curY = 520 + (oppR1.y - 520) * t;
        const height = 80 * Math.sin(t * Math.PI);
        return { x: curX, y: curY, height, phaseLabel: 'Deep Kickoff Flight' };
      }

      // Opponent return in progress: ball is carried directly by OPP_R1 in lockstep!
      const oppPos = getSTPlayerLivePosition(oppR1, unitId, schemeId, true, progress);
      return {
        x: oppPos.x,
        y: oppPos.y,
        height: 0,
        phaseLabel: 'Opponent Return Advance',
      };
    }

    case 'punt_coverage': {
      if (schemeId === 'p3_power_35') {
        const p3 = ourPlayers.find((p) => p.id === 'P3') || { id: 'P3', x: 535, y: 460 };
        const catchT = 0.15;
        if (progress <= catchT) {
          const t = progress / catchT;
          return {
            x: 500 + (p3.x - 500) * t,
            y: 390 + (p3.y - 390) * t,
            height: 12 * Math.sin(t * Math.PI),
            phaseLabel: 'Direct Snap to P3',
          };
        }
        const p3Pos = getSTPlayerLivePosition(p3, unitId, schemeId, false, progress);
        return { x: p3Pos.x, y: p3Pos.y, height: 0, phaseLabel: '5-Hole Power Run' };
      }

      if (schemeId === 'directional_left') {
        if (progress <= 0.15) {
          const t = progress / 0.15;
          return { x: 500, y: 390 + (490 - 390) * t, height: 10 * Math.sin(t * Math.PI), phaseLabel: 'Long Snap' };
        }
        if (progress <= 0.22) {
          return { x: 500, y: 485, height: 0, phaseLabel: 'Punter Setup' };
        }
        if (progress <= 0.65) {
          const t = (progress - 0.22) / (0.65 - 0.22);
          return {
            x: 500 + (180 - 500) * t,
            y: 485 + (110 - 485) * t,
            height: 70 * Math.sin(t * Math.PI),
            phaseLabel: 'Directional Coffin Corner',
          };
        }
        return { x: 170, y: 110, height: 0, phaseLabel: 'Fair Catch Pin' };
      }

      // base_punt: opponent returns
      const oppPR1 = opponents.find((o) => o.id === 'OPP_PR1' || o.id === 'PR1') || {
        id: 'OPP_PR1',
        x: 500,
        y: 95,
      };
      const catchT = 0.58;

      if (progress <= 0.15) {
        const t = progress / 0.15;
        return { x: 500, y: 390 + (490 - 390) * t, height: 10 * Math.sin(t * Math.PI), phaseLabel: 'Long Snap' };
      }
      if (progress <= 0.22) {
        return { x: 500, y: 485, height: 0, phaseLabel: 'Punter Setup' };
      }
      if (progress < catchT) {
        const t = (progress - 0.22) / (catchT - 0.22);
        const curX = 500 + (oppPR1.x - 500) * t;
        const curY = 485 + (oppPR1.y - 485) * t;
        const height = 75 * Math.sin(t * Math.PI);
        return { x: curX, y: curY, height, phaseLabel: 'High Hangtime Punt' };
      }

      // Opponent punt return in progress: ball is carried directly by OPP_PR1 in lockstep!
      const oppPos = getSTPlayerLivePosition(oppPR1, unitId, schemeId, true, progress);
      return {
        x: oppPos.x,
        y: oppPos.y,
        height: 0,
        phaseLabel: 'Opponent Punt Return',
      };
    }

    case 'fg_pat': {
      if (schemeId === 'holder_rollout_pass') {
        const holder = ourPlayers.find((p) => p.id === 'H') || { id: 'H', x: 500 + hashOffsetX, y: 460 };
        const rw = ourPlayers.find((p) => p.id === 'RW') || { id: 'RW', x: 760, y: 280 };

        if (progress <= 0.15) {
          const t = progress / 0.15;
          return {
            x: 500 + hashOffsetX,
            y: 390 + (460 - 390) * t,
            height: 8 * Math.sin(t * Math.PI),
            phaseLabel: 'Snap to Holder',
          };
        }
        if (progress <= 0.45) {
          const hPos = getSTPlayerLivePosition(holder, unitId, schemeId, false, progress);
          return { x: hPos.x, y: hPos.y, height: 0, phaseLabel: 'Holder Rollout' };
        }
        if (progress <= 0.75) {
          const t = (progress - 0.45) / (0.75 - 0.45);
          return {
            x: 620 + (rw.x - 620) * t,
            y: 420 + (rw.y - 420) * t,
            height: 25 * Math.sin(t * Math.PI),
            phaseLabel: 'Pass to RW',
          };
        }
        const rwPos = getSTPlayerLivePosition(rw, unitId, schemeId, false, progress);
        return { x: rwPos.x, y: rwPos.y, height: 0, phaseLabel: 'Touchdown Run' };
      }

      if (schemeId === 'swinging_gate') {
        if (progress <= 0.15) {
          const t = progress / 0.15;
          return {
            x: 500 + hashOffsetX,
            y: 390 + (460 - 390) * t,
            height: 6 * Math.sin(t * Math.PI),
            phaseLabel: 'Snap to Gate',
          };
        }
        const t = (progress - 0.15) / 0.85;
        return {
          x: 500 + (380 - 500) * t,
          y: 460 + (300 - 460) * t,
          height: 0,
          phaseLabel: 'Perimeter Sweep',
        };
      }

      // base_pat
      if (progress <= 0.15) {
        const t = progress / 0.15;
        return {
          x: 500 + hashOffsetX,
          y: 390 + (460 - 390) * t,
          height: 8 * Math.sin(t * Math.PI),
          phaseLabel: 'Snap to Holder',
        };
      }
      if (progress <= 0.28) {
        return { x: 500 + hashOffsetX, y: 460, height: 0, phaseLabel: 'Holder Set' };
      }
      if (progress <= 0.75) {
        const t = (progress - 0.28) / (0.75 - 0.28);
        return {
          x: 500 + hashOffsetX + (500 - (500 + hashOffsetX)) * t,
          y: 460 + (60 - 460) * t,
          height: 85 * Math.sin(t * Math.PI),
          phaseLabel: 'Field Goal Flight',
        };
      }
      return { x: 500, y: 35, height: 10, phaseLabel: 'Kick is Good!' };
    }

    case 'fg_block': {
      if (progress <= 0.15) {
        const t = progress / 0.15;
        return { x: 500, y: 230 + (160 - 230) * t, height: 8 * Math.sin(t * Math.PI), phaseLabel: 'Opponent Snap to Holder' };
      }
      if (progress <= 0.28) {
        return { x: 500, y: 160, height: 0, phaseLabel: 'Holder Sets Ball' };
      }
      if (progress <= 0.40) {
        const t = (progress - 0.28) / (0.40 - 0.28);
        return {
          x: 500 + (510 - 500) * t,
          y: 160 + (165 - 160) * t,
          height: 12 * Math.sin(t * Math.PI),
          phaseLabel: 'BLOCKED AT LAUNCH SPOT!',
        };
      }
      const t = (progress - 0.40) / 0.60;
      return {
        x: 510 + (540 - 510) * t,
        y: 165 + (210 - 165) * t,
        height: 4 * Math.sin(t * Math.PI),
        phaseLabel: 'Ball Loose / Recovered',
      };
    }

    default:
      return { x: 500, y: 390, height: 0, phaseLabel: 'Play Action' };
  }
}
