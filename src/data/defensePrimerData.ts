export type DefenseFormation = 'base' | 'shield' | 'vanguard' | 'shell';
export type DefenseFrontType = DefenseFormation; // backwards-compatible alias
export type CoverageScheme = 'blue' | 'green' | 'black' | 'black_blue' | 'red' | 'orange';
export type LineSlant = 'base_gap' | 'slant_strong' | 'slant_weak' | 'pinch' | 'angle_out' | 'bull_rush';
export type StrengthCall = 'rip' | 'liz';

export interface FormationCoord {
  x: number;
  y: number;
  depthYards: number;
  alignmentDesc: string;
  technique: string;
  gap: string;
}

export interface DefPlayerPosition {
  id: string; // 'NT' | 'LDE' | 'RDE' | 'ROV' | 'SAM' | 'MIKE' | 'WILL' | 'LCB' | 'RCB' | 'FS' | 'SS'
  name: string;
  role: string;
  number: string;
  isOutsideBacker?: boolean;
  isMiddleBacker?: boolean;
  isDefensiveLine?: boolean;
  isSecondary?: boolean;
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
  individualPressure: {
    callName: string;
    targetGap: string;
    description: string;
    arrowEnd: { x: number; y: number };
  };
}

export interface CoverageDetail {
  id: CoverageScheme;
  name: string;
  codeName: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  deepCoverage: string;
  underneathCoverage: string;
  philosophy: string;
  situationalCall: string;
  responsibilities: Record<string, string>;
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
  category: 'core' | 'adjustments' | 'communication' | 'fronts';
  summary: string;
  keyPoints: string[];
  coachingQuote?: string;
  diagramNotes?: string;
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
    secondaryRule: 'Cornerbacks align 5-7 yards off with inside leverage. Safeties split at 10-12 yards depth reading quarterback intent.',
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
        alignmentDesc: '0-Tech (Head-up on Center). If no slant call heard, pick strong gap default.',
        technique: '0-Technique',
        gap: 'A-Gap (Strong side default)',
      },
      shield: {
        x: 500,
        y: 374,
        depthYards: 0,
        alignmentDesc: '0/1-Tech Shade on Center. Occupy double-team so inside backers run free.',
        technique: '0/1-Technique',
        gap: 'A-Gap (Interior wedge)',
      },
      vanguard: {
        x: 500,
        y: 374,
        depthYards: 0,
        alignmentDesc: '0-Tech heavy low stance on Center. Fire low into A-gap, collapse the wedge.',
        technique: '0-Technique Goal Line',
        gap: 'A-Gap Penetration',
      },
      shell: {
        x: 500,
        y: 374,
        depthYards: 0,
        alignmentDesc: '0-Tech pass rush. Expecting pass: push pocket straight back into QB’s face!',
        technique: 'Bull Rush / Pass Penetration',
        gap: 'Pass Rush / Go Get a Sack',
      },
    },
    baseAssignment: 'Head up Center. Strike breastplate with violent 2-gap hands. Default pick strong gap if no slant call heard.',
    shieldAssignment: 'Anchor against double-team, squeeze Strong A-gap and prevent interior climb on Mike/Will.',
    vanguardAssignment: 'Submarine low underneath Center pads to eliminate short-yardage quarterback sneak.',
    shellAssignment: 'From primer: In Shell you should be expecting a pass, which means go get us a sack! Violent bull rush into QB launch point.',
    individualPressure: {
      callName: 'Nose Bull Rush',
      targetGap: 'Center Push / Both A-Gaps',
      description: 'Explodes directly into the center’s sternum to collapse the pocket into the QB’s face.',
      arrowEnd: { x: 500, y: 445 },
    },
  },
  {
    id: 'LDE',
    name: 'Left Defensive End',
    role: 'Defensive End (Weak/Field 5-Tech)',
    number: '95',
    isDefensiveLine: true,
    x34: 415,
    y34: 374,
    x52: 415,
    y52: 374,
    gap34: 'B-Gap / Squeeze Tackle',
    gap52: 'B-Gap hard squeeze',
    technique34: '4i / 5-Technique (Eye of Tackle)',
    technique52: '5-Technique inside squeeze',
    formations: {
      base: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: '4i/5-Tech (Eye or outside shade of Left Tackle). Pick gap in front or strong gap.',
        technique: '4i / 5-Technique',
        gap: 'B-Gap',
      },
      shield: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: '5-Tech on Tackle. Hard inside squeeze to spill all runs to walked-up Rover.',
        technique: '5-Technique Squeeze',
        gap: 'B-Gap Spill',
      },
      vanguard: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'Tight 4i-Tech. Fire inside shoulder of tackle to seal off B-gap surge.',
        technique: '4i-Technique Tight',
        gap: 'B-Gap Seal',
      },
      shell: {
        x: 415,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'Wide 5-Tech speed rush. Pure sack mentality: rip and bend edge on QB.',
        technique: 'Speed Edge Rush',
        gap: 'Pass Rush / Go Get a Sack',
      },
    },
    baseAssignment: 'Align 4i or 5-technique. Squeeze offensive tackle down-block and control B-gap.',
    shieldAssignment: 'Slant hard inside B-gap. Spill pulling guards or fullback directly to Rover on the edge.',
    vanguardAssignment: 'Pinch inside B-gap to stop dive instantly.',
    shellAssignment: 'Expecting pass! Speed rush through the B/C seam to chase down QB.',
    individualPressure: {
      callName: 'LDE B-Gap Spike',
      targetGap: 'Weak B-Gap',
      description: 'Penetrates weak B-gap between guard and tackle to blow up the mesh in the backfield.',
      arrowEnd: { x: 425, y: 440 },
    },
  },
  {
    id: 'RDE',
    name: 'Right Defensive End',
    role: 'Defensive End (Strong 5-Tech)',
    number: '99',
    isDefensiveLine: true,
    x34: 585,
    y34: 374,
    x52: 585,
    y52: 374,
    gap34: 'B-Gap / Squeeze Tackle',
    gap52: 'B-Gap hard squeeze',
    technique34: '5-Technique (Outside shoulder Tackle)',
    technique52: '5-Technique (Dense 5-man line wedge)',
    formations: {
      base: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: '5-Tech (Outside shoulder Right Tackle). Control B-gap and protect inside backers.',
        technique: '5-Technique',
        gap: 'B-Gap',
      },
      shield: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: '5-Tech on Tackle. Dense wedge to spill all runs outside to walked-up Sam.',
        technique: '5-Technique Squeeze',
        gap: 'B-Gap Spill',
      },
      vanguard: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'Tight 5-Tech. Penetrate strong B-gap, stone pulling blockers.',
        technique: '5-Technique Tight',
        gap: 'B-Gap Seal',
      },
      shell: {
        x: 585,
        y: 374,
        depthYards: 0,
        alignmentDesc: '5-Tech pass rush. Speed rush the strong tackle, hunt the sack.',
        technique: 'Pass Rush Penetration',
        gap: 'Pass Rush / Go Get a Sack',
      },
    },
    baseAssignment: 'Attack tackle outside shoulder. Lock out with arms, penetrate B-gap and protect inside linebackers.',
    shieldAssignment: 'Squeeze inside tackle B-gap. Prevent interior crease and force all runs outside to Sam.',
    vanguardAssignment: 'Squeeze B-gap violently and eliminate dive back.',
    shellAssignment: 'Pure sack mentality! Drive tackle back into QB pocket.',
    individualPressure: {
      callName: 'RDE B-Gap Spike',
      targetGap: 'Strong B-Gap',
      description: 'Spikes hard into strong B-gap to capture the fullback or running back at handoff.',
      arrowEnd: { x: 575, y: 440 },
    },
  },
  {
    id: 'ROV',
    name: 'Rover',
    role: 'Rover (Weak Outside Linebacker / Hybrid Force)',
    number: '55',
    isOutsideBacker: true,
    isWalkUpBacker: true,
    x34: 340,
    y34: 310,
    x52: 340,
    y52: 374,
    gap34: 'D-Gap / Weak Perimeter',
    gap52: '2x0 on LOS · C/D-Gap Contain & Hard Edge',
    technique34: 'Apex 2-Point Stance (4 yds off Tackle)',
    technique52: '2x0 Alignment on LOS (9-Tech Edge)',
    formations: {
      base: {
        x: 340,
        y: 310,
        depthYards: 4,
        alignmentDesc: 'Apexed 4 yards off the line of scrimmage outside weak tackle. Force & contain.',
        technique: 'Apex 2-Point Stance (4 yds off)',
        gap: 'D-Gap / Weak Alley',
      },
      shield: {
        x: 330,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'WALKED UP ON LOS! Aligned 2x0 at outside OL at end of line. Hard edge.',
        technique: '2x0 Alignment at End of LOS',
        gap: 'C/D-Gap Edge / Outside Contain',
      },
      vanguard: {
        x: 330,
        y: 374,
        depthYards: 0,
        alignmentDesc: '2x0 on LOS at end man of line. Crash edge, destroy pitch or bootleg.',
        technique: '2x0 Goal Line Edge Crash',
        gap: 'Contain & Edge Destruction',
      },
      shell: {
        x: 320,
        y: 310,
        depthYards: 4,
        alignmentDesc: 'From primer: Outside backer drops to 4 yards off to defend deep pass / flat.',
        technique: '4 Yards Off / Flat Buzz',
        gap: 'Weak Hook / Flat Underneath',
      },
    },
    baseAssignment: 'Apexed 4 yards off the ball. Read tackle release: set weak perimeter, contain bounce runs, drop to hook/curl on pass.',
    shieldAssignment: 'From primer: Walk up to the line in a 5-2, aligned 2x0 at the outside O-lineman at the end of the line. Set a hard edge: nothing gets outside your outside shoulder.',
    vanguardAssignment: 'Locked on LOS in 2x0. Blow up any toss or QB sweep at the boundary.',
    shellAssignment: 'Drop to 4 yards off. Buzz the weak flat and eliminate quick swing or curl routes.',
    individualPressure: {
      callName: 'Rover Fire Blitz',
      targetGap: 'Weak Edge / Blindside Rush',
      description: 'Rover fires off the weak edge directly at the quarterback’s blindside hip.',
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
    x34: 660,
    y34: 310,
    x52: 700,
    y52: 374,
    gap34: 'C/D-Gap / Strong Alley Force',
    gap52: '2x0 on LOS · Hard Edge & TE Jam',
    technique34: 'Apex 2-Point Stance (4 yds off TE)',
    technique52: '2x0 Alignment on LOS (7/9-Tech Edge)',
    formations: {
      base: {
        x: 660,
        y: 310,
        depthYards: 4,
        alignmentDesc: 'Apexed 4 yards off the line of scrimmage outside tight end. Force defender.',
        technique: 'Apex 2-Point Stance (4 yds off)',
        gap: 'C/D-Gap / Strong Alley Force',
      },
      shield: {
        x: 710,
        y: 374,
        depthYards: 0,
        alignmentDesc: 'WALKED UP ON LOS! Aligned 2x0 at outside OL (TE) at end of line. Jam TE.',
        technique: '2x0 Alignment at End of LOS',
        gap: 'Hard Force & Strong Edge',
      },
      vanguard: {
        x: 710,
        y: 374,
        depthYards: 0,
        alignmentDesc: '2x0 on LOS outside TE. Jam TE release, turn all power runs back inside.',
        technique: '2x0 Goal Line Edge Jam',
        gap: 'Hard Force & Goal Line Edge',
      },
      shell: {
        x: 670,
        y: 310,
        depthYards: 4,
        alignmentDesc: 'From primer: Outside backer drops to 4 yards off to defend deep pass / flat.',
        technique: '4 Yards Off / Curl-Flat Drop',
        gap: 'Strong Hook / Flat Underneath',
      },
    },
    baseAssignment: 'Apex outside strong tight end. Force all perimeter runs back inside to Mike. Funnel receivers in Cover 2.',
    shieldAssignment: 'From primer: Walk up to the line in a 5-2, aligned 2x0 at the outside O-lineman at end of line. Jam TE violently on snap. Force option pitch/perimeter stretch back inside.',
    vanguardAssignment: 'Locked on LOS in 2x0. Crush the tight end block, bottle up power/lead runs at the line.',
    shellAssignment: 'Drop to 4 yards off. Take away the intermediate curl and collision any tight end seam route.',
    individualPressure: {
      callName: 'Sam Edge Rush',
      targetGap: 'Strong Edge / C-Gap Fire',
      description: 'Sam crashes off the strong edge, containing the quarterback and blowing up rollout action.',
      arrowEnd: { x: 700, y: 450 },
    },
  },
  {
    id: 'MIKE',
    name: 'Mike',
    role: 'Mike (Middle Linebacker · Strong Inside Backer)',
    number: '54',
    isMiddleBacker: true,
    x34: 545,
    y34: 295,
    x52: 545,
    y52: 295,
    gap34: 'Strong A/B-Gap Flow',
    gap52: 'Fast downhill scrape & A/B Gap fit',
    technique34: '30-Technique Stack (4.5 yds off ball)',
    technique52: 'True 5-2 Stack Backer (Free to flow)',
    formations: {
      base: {
        x: 545,
        y: 295,
        depthYards: 4.5,
        alignmentDesc: 'Stacked 4.5-5 yards deep behind strong B-gap. Command RIP/LIZ front call.',
        technique: '30-Technique Stack',
        gap: 'Strong A/B Gap Flow',
      },
      shield: {
        x: 545,
        y: 295,
        depthYards: 4.5,
        alignmentDesc: 'Stacked 4.5 yards deep. Clean downhill track behind the 5-man line.',
        technique: '5-2 Stack Backer',
        gap: 'Downhill A/B Fill',
      },
      vanguard: {
        x: 545,
        y: 345,
        depthYards: 2,
        alignmentDesc: 'WALKED UP TO 2 YARDS DEPTH! Rule: If stacked over lineman, align over open gap.',
        technique: '2-Yard Depth Goal Line Attack',
        gap: 'Open Gap Alignment Rule',
      },
      shell: {
        x: 545,
        y: 260,
        depthYards: 6,
        alignmentDesc: 'DROPPED BACK TO 6 YARDS DEPTH! Defend deep pass, match low hole/crossing routes.',
        technique: '6-Yard Depth Pass Drop',
        gap: 'Middle Low Hole / Hook',
      },
    },
    baseAssignment: 'Set front call ("Rip / Liz"). Read guard uncovered/covered. Scrape A-to-B gap, fill with inside-out leverage.',
    shieldAssignment: 'Clean downhill track! With 5 men on line absorbing blocks, trigger immediately on ball carrier in A/B gap.',
    vanguardAssignment: 'From primer: Walked up to 2 yard depth. Rule: If stacked over one of the linemen, pick the open gap assignment and align over it. Shoot gap on snap!',
    shellAssignment: 'From primer: Drop back to 6 yards depth defending deep pass. Read QB eyes, take away crossing routes.',
    individualPressure: {
      callName: 'Mike Dog Blitz',
      targetGap: 'Strong A/B Gap Shoot',
      description: 'Mike attacks downhill into the strong A-gap right behind the nose tackle.',
      arrowEnd: { x: 535, y: 440 },
    },
  },
  {
    id: 'WILL',
    name: 'Will',
    role: 'Will (Middle Linebacker · Weak Inside Backer)',
    number: '51',
    isMiddleBacker: true,
    x34: 455,
    y34: 295,
    x52: 455,
    y52: 295,
    gap34: 'Weak A/B-Gap Cutback',
    gap52: 'True 5-2 Stack Backer (Fast scrape to ball)',
    technique34: '20-Technique Stack (4.5 yds off ball)',
    technique52: 'True 5-2 Stack Backer (Fast scrape to ball)',
    formations: {
      base: {
        x: 455,
        y: 295,
        depthYards: 4.5,
        alignmentDesc: 'Stacked 4.5-5 yards deep behind weak B-gap. Chase and cutback enforcer.',
        technique: '20-Technique Stack',
        gap: 'Weak A/B Gap Cutback',
      },
      shield: {
        x: 455,
        y: 295,
        depthYards: 4.5,
        alignmentDesc: 'Stacked 4.5 yards deep. Fast lateral scrape sideline-to-sideline.',
        technique: '5-2 Stack Backer',
        gap: 'Cutback & Chase Track',
      },
      vanguard: {
        x: 455,
        y: 345,
        depthYards: 2,
        alignmentDesc: 'WALKED UP TO 2 YARDS DEPTH! Rule: If stacked over lineman, align over open gap.',
        technique: '2-Yard Depth Goal Line Attack',
        gap: 'Open Gap Alignment Rule',
      },
      shell: {
        x: 455,
        y: 260,
        depthYards: 6,
        alignmentDesc: 'DROPPED BACK TO 6 YARDS DEPTH! Defend deep pass, match underneath routes.',
        technique: '6-Yard Depth Pass Drop',
        gap: 'Weak Hook / Low Hole',
      },
    },
    baseAssignment: 'Read through center to weak guard. Mirror backfield mesh, shut down cutback lanes and counter action.',
    shieldAssignment: 'Free to scrape laterally. With Rover on edge and DE squeezing, attack cutbacks at full speed.',
    vanguardAssignment: 'From primer: Walked up to 2 yard depth. Rule: If stacked over one of the linemen, pick the open gap assignment and align over it. Strike open gap!',
    shellAssignment: 'From primer: Drop back to 6 yards depth defending deep pass. Read QB eyes, protect middle underneath hook zone.',
    individualPressure: {
      callName: 'Will Dog Blitz',
      targetGap: 'Weak A/B Gap Cross',
      description: 'Will shoots the weak B-gap or crosses behind Mike to exploit open interior crease.',
      arrowEnd: { x: 465, y: 440 },
    },
  },
  {
    id: 'LCB',
    name: 'Left Cornerback',
    role: 'Boundary / Field Cornerback',
    number: '21',
    isSecondary: true,
    x34: 180,
    y34: 330,
    x52: 180,
    y52: 330,
    gap34: 'Deep Outside 1/3 or Flat Squat',
    gap52: 'Deep Outside 1/3 or Flat Squat',
    technique34: 'Off / Press-Bail (5-7 yds depth)',
    technique52: 'Off / Press-Bail (5-7 yds depth)',
    formations: {
      base: {
        x: 180,
        y: 330,
        depthYards: 6,
        alignmentDesc: 'Align 6-7 yards off #1 receiver with 1-yard inside leverage.',
        technique: 'Off / Press-Bail',
        gap: 'Deep Outside 1/3 / Flat',
      },
      shield: {
        x: 180,
        y: 330,
        depthYards: 6,
        alignmentDesc: 'Align 6-7 yards off. Secondary perimeter run support once pass cleared.',
        technique: 'Off / Press-Bail',
        gap: 'Deep Outside 1/3 / Flat',
      },
      vanguard: {
        x: 180,
        y: 360,
        depthYards: 1.5,
        alignmentDesc: 'Tight Press-Man on line of scrimmage. Deny quick slant or fade.',
        technique: 'Tight Press-Man',
        gap: 'Boundary Lockdown',
      },
      shell: {
        x: 170,
        y: 290,
        depthYards: 9,
        alignmentDesc: 'Deep cushion 8-10 yards. Protect deep sideline against home run shot.',
        technique: 'Deep Cushion Bail',
        gap: 'Deep Outside Third',
      },
    },
    baseAssignment: 'Alignment 7 yards off #1 receiver with inside leverage. Protect deep third in Green, jam flat in Blue.',
    shieldAssignment: 'Align 5-7 yards. Support secondary perimeter run fits once pass read is cleared.',
    vanguardAssignment: 'Press-man technique on receiver. Do not allow inside release into end zone.',
    shellAssignment: 'Deep bail at snap! Keep all receivers in front of you.',
    individualPressure: {
      callName: 'Boundary Corner Fire',
      targetGap: 'Wide Boundary Edge',
      description: 'Corner creeps into press alignment, then sprints on a surprise edge blitz off the quarterback’s blindside.',
      arrowEnd: { x: 260, y: 440 },
    },
  },
  {
    id: 'RCB',
    name: 'Right Cornerback',
    role: 'Field / Strong Cornerback',
    number: '24',
    isSecondary: true,
    x34: 820,
    y34: 330,
    x52: 820,
    y52: 330,
    gap34: 'Deep Outside 1/3 or Flat Squat',
    gap52: 'Deep Outside 1/3 or Flat Squat',
    technique34: 'Off / Press-Bail (5-7 yds depth)',
    technique52: 'Off / Press-Bail (5-7 yds depth)',
    formations: {
      base: {
        x: 820,
        y: 330,
        depthYards: 6,
        alignmentDesc: 'Align 6-7 yards off #1 receiver. In Blue: re-route and squat flat. In Green: deep 1/3.',
        technique: 'Off / Press-Bail',
        gap: 'Deep Outside 1/3 / Flat',
      },
      shield: {
        x: 820,
        y: 330,
        depthYards: 6,
        alignmentDesc: 'Align 6-7 yards. Maintain top-down leverage against play-action shots.',
        technique: 'Off / Press-Bail',
        gap: 'Deep Outside 1/3 / Flat',
      },
      vanguard: {
        x: 820,
        y: 360,
        depthYards: 1.5,
        alignmentDesc: 'Tight Press-Man on line of scrimmage. Deny quick slant or fade.',
        technique: 'Tight Press-Man',
        gap: 'Field Lockdown',
      },
      shell: {
        x: 830,
        y: 290,
        depthYards: 9,
        alignmentDesc: 'Deep cushion 8-10 yards. Protect deep sideline against home run shot.',
        technique: 'Deep Cushion Bail',
        gap: 'Deep Outside Third',
      },
    },
    baseAssignment: 'Alignment 7 yards off #1 receiver. In Blue: aggressive re-route and squat in flat. In Green: deep outside 1/3.',
    shieldAssignment: 'Maintain top-down leverage against play-action deep shots caused by the 5-man rush.',
    vanguardAssignment: 'Press-man technique on receiver. Contest every throw to the goal line pylon.',
    shellAssignment: 'Deep bail at snap! Protect the sideline hole shot.',
    individualPressure: {
      callName: 'Field Corner Fire',
      targetGap: 'Wide Field Edge',
      description: 'Corner creeps inward on snap count and fires off the strong edge.',
      arrowEnd: { x: 740, y: 440 },
    },
  },
  {
    id: 'FS',
    name: 'Free Safety',
    role: 'Free Safety (Centerfield Cap & Deep Post)',
    number: '32',
    isSecondary: true,
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
        gap: 'Deep Middle 1/3',
      },
      shield: {
        x: 430,
        y: 170,
        depthYards: 12,
        alignmentDesc: '12-14 yards deep. Cap all vertical seam routes behind the 5-man front.',
        technique: 'Deep Middle Cap',
        gap: 'Deep Middle Third',
      },
      vanguard: {
        x: 450,
        y: 290,
        depthYards: 5,
        alignmentDesc: 'WALKED UP TO 5 YARDS DEPTH! Acts as secondary downhill enforcer / alley fill.',
        technique: '5-Yard Depth Downhill Robber',
        gap: 'Secondary Alley Fill / Goal Line Cap',
      },
      shell: {
        x: 420,
        y: 140,
        depthYards: 14,
        alignmentDesc: 'From primer: Safeties back to 12-14 yards depth! Cap any deep pass.',
        technique: '14-Yard Deep Centerfield Prevent',
        gap: 'Deep Middle Cap',
      },
    },
    baseAssignment: 'Deep centerfielder. Never let any receiver get behind you. Read QB eyes and drive on seam/post.',
    shieldAssignment: 'Cap all vertical seam routes. Fast alley support against breakaway perimeter runs.',
    vanguardAssignment: 'From primer: Walked up to 5 yards depth. Attack downhill immediately on run read; tackle ball carrier at the line.',
    shellAssignment: 'Deep centerfield prevent at 12–14 yards depth. Play top-down, bat down or intercept any deep prayer.',
    individualPressure: {
      callName: 'Free Safety Green Dog',
      targetGap: 'Delayed A-Gap Fire',
      description: 'Free safety reads pass block: if running back stays in to block, triggers downhill full speed through the middle.',
      arrowEnd: { x: 490, y: 440 },
    },
  },
  {
    id: 'SS',
    name: 'Strong Safety',
    role: 'Strong Safety (Alley Enforcer / Box Safety)',
    number: '38',
    isSecondary: true,
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
        gap: 'Strong Deep Half / Box Roll',
      },
      shield: {
        x: 590,
        y: 210,
        depthYards: 10,
        alignmentDesc: '8-10 yards deep. Vital alley fill on option/pitch outside Sam’s 2x0 edge.',
        technique: 'Alley Enforcer',
        gap: 'Strong Alley Fill',
      },
      vanguard: {
        x: 580,
        y: 290,
        depthYards: 5,
        alignmentDesc: 'WALKED UP TO 5 YARDS DEPTH! Invert hard into strong alley to destroy power/lead.',
        technique: '5-Yard Inverted Box Defender',
        gap: 'Strong Alley Stuffer',
      },
      shell: {
        x: 620,
        y: 140,
        depthYards: 14,
        alignmentDesc: 'From primer: Safeties back to 12-14 yards depth! Protect deep strong half/third.',
        technique: '14-Yard Deep Half Prevent',
        gap: 'Deep Strong Half / Third',
      },
    },
    baseAssignment: 'In Blue: split deep half with FS. In Green: roll down at snap into strong curl/flat to give an 8-man box look.',
    shieldAssignment: 'In 5-2 look, provide vital alley fill on toss/option perimeter plays outside Sam.',
    vanguardAssignment: 'From primer: Walked up to 5 yards depth. Fill strong alley with aggressive forward momentum on snap.',
    shellAssignment: 'Drop back to 12-14 yards depth. Cap deep post and sideline hole shot.',
    individualPressure: {
      callName: 'Strong Safety Alley Fire',
      targetGap: 'Strong C/D Alley Blitz',
      description: 'Strong safety times the snap count and storms down the strong alley to disrupt rollouts and quick screens.',
      arrowEnd: { x: 650, y: 440 },
    },
  },
];

// Line Slants & Stunts (Preserved and fully supported)
export const LINE_SLANTS: Record<LineSlant, LineSlantDetail> = {
  base_gap: {
    id: 'base_gap',
    name: 'Base Gap Integrity (Default)',
    signal: '✊ Fist held up, palm out',
    description: 'Standard gap accountability based on primary technique alignment.',
    linemenRule: 'From primer: If you don’t hear a slant call, either pick the gap in front of you or if you’re heads up you will default pick the strong direction gap.',
    slants: [
      { playerId: 'NT', arrowEnd: { x: 500, y: 430 }, technique: '0-Tech', targetGap: 'Strong A-Gap (Default heads-up pick)', label: 'Strong A' },
      { playerId: 'LDE', arrowEnd: { x: 420, y: 430 }, technique: '4i/5-Tech', targetGap: 'Weak B-Gap', label: 'Weak B' },
      { playerId: 'RDE', arrowEnd: { x: 580, y: 430 }, technique: '5-Tech', targetGap: 'Strong B-Gap', label: 'Strong B' },
    ],
  },
  slant_strong: {
    id: 'slant_strong',
    name: 'Slant Strong (Rip Call)',
    signal: '👉 Right hand slicing across chest to right',
    description: 'All down linemen angle one gap toward the offensive strength (Right/Rip).',
    linemenRule: 'Attack the playside shoulder of the offensive lineman. Rip through frontside reach blocks and capture strong-side gaps.',
    slants: [
      { playerId: 'NT', arrowEnd: { x: 535, y: 430 }, technique: 'Slant to 1-Tech', targetGap: 'Strong A-Gap', label: 'Slant Strong A' },
      { playerId: 'RDE', arrowEnd: { x: 615, y: 430 }, technique: 'Slant to 7-Tech', targetGap: 'Strong C-Gap', label: 'Slant Strong C' },
      { playerId: 'LDE', arrowEnd: { x: 450, y: 430 }, technique: 'Slant to 2i-Tech', targetGap: 'Weak A/B-Gap', label: 'Slant Inside' },
    ],
  },
  slant_weak: {
    id: 'slant_weak',
    name: 'Slant Weak (Liz Call)',
    signal: '👈 Left hand slicing across chest to left',
    description: 'All down linemen angle one gap away from the offensive strength (Left/Liz).',
    linemenRule: 'Attack the weak-side gap. Excellent against backfield counter and backside cutoff blocks.',
    slants: [
      { playerId: 'NT', arrowEnd: { x: 465, y: 430 }, technique: 'Slant to 1-Tech (Weak)', targetGap: 'Weak A-Gap', label: 'Slant Weak A' },
      { playerId: 'LDE', arrowEnd: { x: 385, y: 430 }, technique: 'Slant to 7-Tech (Weak)', targetGap: 'Weak C-Gap', label: 'Slant Weak C' },
      { playerId: 'RDE', arrowEnd: { x: 550, y: 430 }, technique: 'Slant to 2i-Tech', targetGap: 'Strong A/B-Gap', label: 'Slant Inside' },
    ],
  },
  pinch: {
    id: 'pinch',
    name: 'Pinch Front (Interior Squeeze)',
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

// Coverage Schemes from the Defensive Primer
export const COVERAGE_SCHEMES: Record<CoverageScheme, CoverageDetail> = {
  blue: {
    id: 'blue',
    name: 'Cover 2 Zone',
    codeName: 'BLUE',
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
      ROV: 'Weak Hook / Curl — Squeeze #2 receiver vertical, drop to 10-12 yards hash mark.',
      MIKE: 'Middle Hole / High Hole — Read QB eyes, sink to 10-12 yds into low hole or match crossing routes.',
      WILL: 'Weak Hook / Curl — Match underneath crosses and protect the middle hook zone.',
      SAM: 'Strong Hook / Curl — Collision tight end, take away intermediate seam and out routes.',
    },
    coverageZones: [
      { label: 'Deep Half (FS)', x: 320, y: 130, radiusX: 180, radiusY: 90, assignedPlayerId: 'FS' },
      { label: 'Deep Half (SS)', x: 680, y: 130, radiusX: 180, radiusY: 90, assignedPlayerId: 'SS' },
      { label: 'Flat (LCB)', x: 190, y: 310, radiusX: 90, radiusY: 55, assignedPlayerId: 'LCB' },
      { label: 'Weak Hook (WILL)', x: 380, y: 260, radiusX: 75, radiusY: 50, assignedPlayerId: 'WILL' },
      { label: 'Middle Hole (MIKE)', x: 500, y: 240, radiusX: 85, radiusY: 55, assignedPlayerId: 'MIKE' },
      { label: 'Strong Hook (SAM)', x: 620, y: 260, radiusX: 75, radiusY: 50, assignedPlayerId: 'SAM' },
      { label: 'Flat (RCB)', x: 810, y: 310, radiusX: 90, radiusY: 55, assignedPlayerId: 'RCB' },
    ],
  },
  green: {
    id: 'green',
    name: 'Cover 3 Sky / Cloud',
    codeName: 'GREEN',
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
    coverageZones: [
      { label: 'Deep 1/3 (LCB)', x: 200, y: 130, radiusX: 130, radiusY: 85, assignedPlayerId: 'LCB' },
      { label: 'Deep Middle (FS)', x: 500, y: 110, radiusX: 160, radiusY: 85, assignedPlayerId: 'FS' },
      { label: 'Deep 1/3 (RCB)', x: 800, y: 130, radiusX: 130, radiusY: 85, assignedPlayerId: 'RCB' },
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
    color: '#F59E0B',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/50',
    deepCoverage: '1 Single-High Free Safety (Middle third eraser)',
    underneathCoverage: '5 Man-to-Man defenders lock tight on eligible receivers + 1 Low Hole / Blitzer',
    philosophy: 'Tight aggressive man coverage. Cornerbacks play press-man with inside leverage. Free Safety roams deep middle to erase posts and deep verticals.',
    situationalCall: '3rd & 3-6, Pressure downs, Redzone tight goal-to-go, vs spread motion.',
    responsibilities: {
      FS: 'Single High Free Roamer — Deep middle third, read QB intent and break on deep ball.',
      SS: 'Man on Tight End / #2 Strong — Play inside-out leverage, take away seam and crossing routes.',
      LCB: 'Man on #1 WR — Press-man technique, funnel receiver toward sideline or safety help.',
      RCB: 'Man on #1 WR — Press-man technique, inside leverage, take away slant and dig.',
      ROV: 'Man on Weak RB (or Edge Rush in Shield) — Step to backfield flow; if back blocks, add on rush.',
      MIKE: 'Rat in the Hole / Spy or Back Man — Rob underneath crossing routes and spy scrambles.',
      WILL: 'Man on Strong RB — Lock onto fullback/halfback on swing or wheel release.',
      SAM: 'Edge Rush or Man on TE/H-Back — Disrupt release at line of scrimmage.',
    },
    coverageZones: [
      { label: 'Single High Free (FS)', x: 500, y: 120, radiusX: 200, radiusY: 90, assignedPlayerId: 'FS' },
      { label: 'Underneath Rat (MIKE)', x: 500, y: 250, radiusX: 110, radiusY: 55, assignedPlayerId: 'MIKE' },
    ],
  },
  black_blue: {
    id: 'black_blue',
    name: 'Cover 2 Man (2-Man Under)',
    codeName: 'BLACK BLUE',
    color: '#818CF8',
    badgeBg: 'bg-indigo-500/20',
    badgeBorder: 'border-indigo-500/50',
    deepCoverage: '2 Deep Safeties (Halves over top)',
    underneathCoverage: '5 Man-to-Man defenders in Trail Technique',
    philosophy: 'The premier passing down defense. Underneath defenders play trail technique on the inside hip of receivers because they have 2 safeties capping deep routes.',
    situationalCall: '3rd & 8+ (Obvious Pass), End of Half hail-mary prevention, 2-minute defense.',
    responsibilities: {
      FS: 'Deep Half (Left) — No route gets over your head, stay backpedaling at 15 yards.',
      SS: 'Deep Half (Right) — Protect strong sideline and deep post.',
      LCB: 'Trail Man on #1 WR — Play underneath hip of receiver, take away out, slant, and comeback.',
      RCB: 'Trail Man on #1 WR — Underside hip coverage, contest all quick throws.',
      ROV: 'Man on #2 / Weak RB — Underneath trail coverage.',
      MIKE: 'Middle Hole Spy / Trail Back — Take away inside mesh and RB delayed screens.',
      WILL: 'Trail Man on Strong RB — Match back wherever he flows.',
      SAM: 'Trail Man on TE — Deny release, undercut out and cross routes.',
    },
    coverageZones: [
      { label: 'Deep Half (FS)', x: 330, y: 130, radiusX: 170, radiusY: 85, assignedPlayerId: 'FS' },
      { label: 'Deep Half (SS)', x: 670, y: 130, radiusX: 170, radiusY: 85, assignedPlayerId: 'SS' },
    ],
  },
  red: {
    id: 'red',
    name: 'Cover 0 All-Out House Pressure',
    codeName: 'RED',
    color: '#EF4444',
    badgeBg: 'bg-red-500/20',
    badgeBorder: 'border-red-500/50',
    deepCoverage: 'ZERO Deep Help (Pure zero safety coverage)',
    underneathCoverage: 'Man-to-Man on all 5 eligible receivers, 6 or 7 Rushers',
    philosophy: 'High-risk high-reward maximum pressure. Bring more rushers than the offense can protect. Forces immediate throw or sack in under 2.0 seconds.',
    situationalCall: 'Goal Line (inside 3-yard line), 3rd & 10+ surprise pressure, backing up opponent on own 1-yard line.',
    responsibilities: {
      FS: 'Man on Slot / Free Runner — Lock onto #2 receiver in pure man-to-man.',
      SS: 'Fire Strong Alley / Man on TE — Full sprint downhill at QB launch point.',
      LCB: 'Locked Press Man — Deny inside release, tackle catch immediately.',
      RCB: 'Locked Press Man — Deny inside release, physical boundary lockdown.',
      ROV: 'Weak Edge Fire — Attack QB hip directly.',
      MIKE: 'Strong A-Gap Spike — Explode into A-gap.',
      WILL: 'Weak B-Gap Cross — Overload interior protection.',
      SAM: 'Strong Edge Contain — Contain QB from escaping.',
    },
    coverageZones: [],
  },
  orange: {
    id: 'orange',
    name: 'Cover 4 Quarters / Match',
    codeName: 'ORANGE',
    color: '#FB923C',
    badgeBg: 'bg-orange-500/20',
    badgeBorder: 'border-orange-500/50',
    deepCoverage: '4 Deep Fourths (Corners and Safeties each take 1/4 of the deep field)',
    underneathCoverage: '3 Underneath Pattern-Match Defenders',
    philosophy: 'Safeties sit at 10-12 yards reading #2 receiver. If #2 runs vertical, safeties match man-to-man; if #2 goes out, safeties rob #1 curl.',
    situationalCall: 'Medium to long pass downs against 4-vertical passing offenses and trips sets.',
    responsibilities: {
      FS: 'Deep 1/4 (Weak/Inside) — Read #2 weak; carry vertical or rob #1.',
      SS: 'Deep 1/4 (Strong/Inside) — Read #2 strong (TE/slot); fast match.',
      LCB: 'Deep 1/4 (Weak Outside) — Bail to outside 4th; carry #1 vertical.',
      RCB: 'Deep 1/4 (Strong Outside) — Bail to outside 4th; carry #1 vertical.',
      ROV: 'Weak Flat / Underneath — Drop to weak flat.',
      MIKE: 'Hook to Curl Match — Match first crossing route.',
      WILL: 'Hook to Curl Match — Match second crossing route.',
      SAM: 'Strong Flat / Underneath — Drop to strong flat.',
    },
    coverageZones: [
      { label: 'Deep 1/4 (LCB)', x: 180, y: 130, radiusX: 110, radiusY: 80, assignedPlayerId: 'LCB' },
      { label: 'Deep 1/4 (FS)', x: 390, y: 130, radiusX: 110, radiusY: 80, assignedPlayerId: 'FS' },
      { label: 'Deep 1/4 (SS)', x: 610, y: 130, radiusX: 110, radiusY: 80, assignedPlayerId: 'SS' },
      { label: 'Deep 1/4 (RCB)', x: 820, y: 130, radiusX: 110, radiusY: 80, assignedPlayerId: 'RCB' },
    ],
  },
};

// Defensive Primer Manual Chapters
export const DEFENSIVE_PRIMER_CHAPTERS: PrimerSection[] = [
  {
    id: 'philosophy',
    title: '1. Defensive Fronts: Base, Shield, Vanguard & Shell',
    category: 'fronts',
    summary: 'Our 4-front architecture: Base 3-4, Shield 5-2 walk-up, Vanguard goal line, and Shell prevent.',
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
    title: '2. Defensive Line: Techniques 1-9 & Gap Rules',
    category: 'core',
    summary: 'Defensive Line numbering system from center outward (1-9) and default gap rules.',
    keyPoints: [
      'Technique Numbering: Starting with head up on center and moving out, we count 1-9.',
      '0-Tech = Head up on Center. 1-Tech = Shade on Center (A-gap). 2-Tech = Head up on Guard. 3-Tech = Outside shade on Guard (B-gap). 4i = Inside eye of Tackle. 4 = Head up on Tackle. 5 = Outside shade of Tackle. 6 = Head up on Tight End. 7 = Inside eye of Tight End. 9 = Outside shoulder of TE or 2x0 edge.',
      'Base Gap Rule (From Primer): If you don’t hear a slant call, either pick the gap in front of you or if you’re heads up you will default pick the strong direction gap.',
      'Line Slants: Slant Strong (Rip), Slant Weak (Liz), Pinch, and Angle Out alter gap assignments at the snap.',
      'Pass Rush Command: In Shell, linemen pin ears back on pure speed/bull rush: go get us a sack!',
    ],
    coachingQuote: '“Count 1 through 9 from center out. If no call is heard, heads-up always picks the strong gap.”',
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
    ],
    coachingQuote: '“Sam and Rover set the perimeter stone wall; Mike and Will flow downhill to finish the play.”',
  },
  {
    id: 'individual_pressures',
    title: '4. Pressure System: Individual Calls by Position',
    category: 'core',
    summary: 'Individual position pressure calls without complex packaged blitzes.',
    keyPoints: [
      'No packaged blitzes: Pressure is called individually by position to maintain gap integrity.',
      'Rover Fire: Weak edge blitz crashing into the quarterback’s blindside.',
      'Sam Edge Rush: Strong edge pressure containing rollout or blowing up outside handoff.',
      'Mike Dog: Mike attacks downhill directly through the strong A/B gap.',
      'Will Dog: Will shoots the weak A/B gap or crosses behind Mike.',
      'Secondary Pressures: Safety Fire (SS) down the alley and Boundary Corner Fire (LCB/RCB) can be dialed individually.',
    ],
    coachingQuote: '“Call pressure by position. When we bring one man, everyone else knows exactly who has gap and coverage responsibilities.”',
  },
  {
    id: 'coverage_codes',
    title: '5. Coverage Shell Codes (Blue, Green, Black, Black Blue, Red, Orange)',
    category: 'core',
    summary: 'One-word color calls communicate the secondary coverage shell and safety rotation in seconds.',
    keyPoints: [
      'BLUE = Cover 2 Zone. 2 Deep Safeties splitting halves. Corners squat in the flats. 5 underneath zone players.',
      'GREEN = Cover 3 Sky/Cloud. 3 Deep Thirds (2 Corners + Free Safety). Strong Safety rolls down into the box. Premier 8-man run defense.',
      'BLACK = Cover 1 Man-Free. Single-high Free Safety roaming centerfield. Tight press-man across all eligible receivers.',
      'BLACK BLUE = Cover 2 Man (2-Man Under). 2 Deep Safeties over top with underneath trail man coverage.',
      'RED = Cover 0 All-Out House Pressure. Zero safety help. 6 or 7 rushers.',
      'ORANGE = Cover 4 Quarters / Match. 4 Deep defenders dividing the field into quarters.',
    ],
    coachingQuote: '“Color calls allow our secondary to check coverage at the line without tipping off the offense.”',
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
      '“RELOAD!”: Urgent reset call shouted when offense runs hurry-up. All 11 sprint to alignment.',
      '“RIP” / “LIZ”: Strength call announced by Mike based on TE alignment (Rip = Right, Liz = Left).',
    ],
    coachingQuote: '“11 players executing the same call with violent effort will always dominate the line of scrimmage.”',
  },
];
