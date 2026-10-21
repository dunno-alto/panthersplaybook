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
  Target,
  Lock,
  Volume2,
} from 'lucide-react';
import {
  COVERAGE_SCHEMES,
  CoverageScheme,
  DEFENSE_PLAYERS,
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
  PlayerCoverageAssignment,
  detectStrengthCall,
  BallHashPosition,
  StrengthDetectionResult,
} from '../data/defensePrimerData';

interface DefenseCoordinatorProps {
  onOpenPrintModal: () => void;
}

interface DefensiveSignalItem {
  id: string;
  category: 'formations' | 'coverages' | 'fronts' | 'blitzes' | 'verbal';
  categoryLabel: string;
  name: string;
  iconEmoji: string;
  signalMotion: string;
  whoSignals: string;
  onFieldMeaning: string;
  coachingRule: string;
}

const DEFENSIVE_SIGNALS_LIST: DefensiveSignalItem[] = [
  {
    id: 'base_sig',
    category: 'formations',
    categoryLabel: 'Formation',
    name: 'BASE (3-4)',
    iconEmoji: '✊',
    signalMotion: 'Fist held straight up in the air, palm facing out toward the field',
    whoSignals: 'Sideline Coordinator ➔ All 11 Defenders',
    onFieldMeaning: 'Normal 3-4 base alignment. 3 down linemen on LOS (NG 0-tech, SDE 6-tech, WDE 4-tech). 4 linebackers stacked off LOS (Mike 34-tech @ 4 yds, Will 14-tech @ 4 yds, Sam 2x2 contain, Rover 2x2 contain).',
    coachingRule: 'NG 0-tech head-up on Center defaults to Strong A gap on run action.',
  },
  {
    id: 'shield_sig',
    category: 'formations',
    categoryLabel: 'Formation',
    name: 'SHIELD (5-2)',
    iconEmoji: '👊',
    signalMotion: 'Fist held firmly in front of body/chest, palm facing in toward chest',
    whoSignals: 'Sideline Coordinator ➔ All 11 Defenders',
    onFieldMeaning: 'Sam and Rover walk up onto the line of scrimmage in 2x0 outside the end offensive lineman, creating an impenetrable 5-man front. Mike & Will stack at 4.5 yards depth.',
    coachingRule: 'Sam & Rover must never surrender outside contain—stone wall the perimeter.',
  },
  {
    id: 'vanguard_sig',
    category: 'formations',
    categoryLabel: 'Formation',
    name: 'VANGUARD (Goal Line)',
    iconEmoji: '⚔️',
    signalMotion: 'Crossed arms in front of chest or downward double chopping motion',
    whoSignals: 'Sideline Coordinator ➔ All 11 Defenders',
    onFieldMeaning: 'Short yardage & goal line package. 5-man defensive front locked on LOS. Middle linebackers (Mike & Will) walk up to 2-yard depth; Safeties creep down to 5-yard depth.',
    coachingRule: 'MLB rule: If stacked directly over an offensive lineman, pick the open gap assignment and align over it.',
  },
  {
    id: 'shell_sig',
    category: 'formations',
    categoryLabel: 'Formation',
    name: 'SHELL (Prevent)',
    iconEmoji: '🛡️',
    signalMotion: 'Both open hands pressed backwards as if pushing a wall behind you',
    whoSignals: 'Sideline Coordinator ➔ All 11 Defenders',
    onFieldMeaning: 'Deep prevent shell. Outside linebackers (Sam & Rover) drop to 4 yards off; inside linebackers drop back to 6 yards depth; Safeties bail to 12-14 yards depth.',
    coachingRule: 'Linemen: Expect pass and pin your ears back—hunt the sack!',
  },
  {
    id: 'green_sig',
    category: 'coverages',
    categoryLabel: 'Coverage',
    name: 'GREEN (Cover 3 Sky)',
    iconEmoji: '👇',
    signalMotion: 'Index finger pointing straight down at the ground / turf',
    whoSignals: 'Sideline Coordinator / Free Safety ➔ Secondary & LBs',
    onFieldMeaning: '3 Deep Thirds (Free Safety in deep middle third, LCB in deep weak third, RCB in deep strong third). Strong Safety rolls down into strong box/curl (8-man box).',
    coachingRule: 'Cornerbacks align 7 yards off with OUTSIDE LEVERAGE; take 3-step bail at snap to protect the sideline and deep outside third.',
  },
  {
    id: 'blue_sig',
    category: 'coverages',
    categoryLabel: 'Coverage',
    name: 'BLUE (Cover 2 Zone)',
    iconEmoji: '👆',
    signalMotion: 'Index finger pointing straight up toward the sky',
    whoSignals: 'Sideline Coordinator / Safeties ➔ Secondary & LBs',
    onFieldMeaning: '2 Deep Safeties dividing field into halves (12-14 yds). 5 underneath zone defenders (CBs, Will, Mike, Sam/Rov).',
    coachingRule: 'Cornerbacks align 5 yards off with OUTSIDE LEVERAGE. Re-route #1 WR inside toward deep safety help, then squat at 2-5 yards in the flat.',
  },
  {
    id: 'black_sig',
    category: 'coverages',
    categoryLabel: 'Coverage',
    name: 'BLACK (Cover 1 Man)',
    iconEmoji: '👕',
    signalMotion: 'Tug of the football jersey with one hand at chest level',
    whoSignals: 'Sideline Coordinator ➔ Secondary & LBs',
    onFieldMeaning: 'Single-high Free Safety deep middle roamer. Strong Safety in hole/robber/spy. 5 underneath defenders in tight man-to-man coverage. Cornerbacks align 7 yards off with inside leverage (not automatic press).',
    coachingRule: 'Will and Mike share the backfield back outside-in. Non-covering linebacker plays Hole/Robber/Spy.',
  },
  {
    id: 'jam_sig',
    category: 'coverages',
    categoryLabel: 'Coverage Modifier',
    name: '“JAM” Call (Press Modifier)',
    iconEmoji: '🙌',
    signalMotion: 'Both hands raised up, palms facing out, with a forward pushing/punching motion',
    whoSignals: 'Defensive Coordinator / Secondary Call',
    onFieldMeaning: 'Cornerbacks walk up directly onto the Line of Scrimmage over receivers. Hand-fight and deliver physical two-handed contact at the snap, then tightly ride the receiver\'s inside hip.',
    coachingRule: 'Strict press technique: Never allow an uncontested inside release.',
  },
  {
    id: 'base_front_sig',
    category: 'fronts',
    categoryLabel: 'DL Front',
    name: 'Base Front (Gap Integrity)',
    iconEmoji: '✋',
    signalMotion: 'No call needed (or flat open hand held level)',
    whoSignals: 'Default Front Call',
    onFieldMeaning: 'Defensive line holds base gap integrity. Nose Tackle aligns 0-Tech on Center and controls Strong A. Strong DE in 6-Tech (Strong C). Weak DE in 4-Tech (Weak B).',
    coachingRule: 'If you don’t hear a slant call, either pick the gap in front of you or default pick the strong direction gap.',
  },
  {
    id: 'slant_sig',
    category: 'fronts',
    categoryLabel: 'DL Front',
    name: 'SLANT (Weak Slant)',
    iconEmoji: '👉',
    signalMotion: 'Horizontal hand-swipe motion across chest toward the weak side',
    whoSignals: 'Defensive Coordinator / Mike Linebacker',
    onFieldMeaning: 'All 3 down linemen slant hard one gap toward the weak side. NT slants into Weak A; Strong DE slants into Strong B; Weak DE slants into Weak C/D.',
    coachingRule: 'Slant call is strictly to the weak side—there is no strong slant call in this system.',
  },
  {
    id: 'blitz_sig',
    category: 'blitzes',
    categoryLabel: 'Pressure Call',
    name: 'LB Blitz (Mike / Will / Sam / Rov)',
    iconEmoji: '⚡',
    signalMotion: 'Verbal position name call shouted: “MIKE!”, “WILL!”, “SAM!”, or “ROVER!”',
    whoSignals: 'Defensive Coordinator ➔ Specific Linebacker',
    onFieldMeaning: 'Individual linebacker shoots their assigned gap based on DL alignment. Sam shoots strong edge/C-gap; Rover shoots weak edge/C-gap; Mike & Will shoot interior open gaps.',
    coachingRule: 'No packaged fire/dog blitzes. Calls are strictly individual position names. Cornerbacks and Safeties never blitz.',
  },
  {
    id: 'rip_sig',
    category: 'verbal',
    categoryLabel: 'Verbal Call',
    name: '“RIP!” Strength Call',
    iconEmoji: '📢',
    signalMotion: 'Verbal shout by Mike Linebacker pointing right: “RIP! RIP! RIP!”',
    whoSignals: 'Mike Linebacker ➔ Entire Defense',
    onFieldMeaning: 'Designates Strong Right. Called when Tight End aligns on Offense Right / Defense Left, or when passing strength/field wide-side favors the right.',
    coachingRule: 'Sets Sam to the right edge and Rover to the left boundary edge.',
  },
  {
    id: 'liz_sig',
    category: 'verbal',
    categoryLabel: 'Verbal Call',
    name: '“LIZ!” Strength Call',
    iconEmoji: '📢',
    signalMotion: 'Verbal shout by Mike Linebacker pointing left: “LIZ! LIZ! LIZ!”',
    whoSignals: 'Mike Linebacker ➔ Entire Defense',
    onFieldMeaning: 'Designates Strong Left. Called when Tight End aligns on Offense Left / Defense Right, or default balanced formation middle call.',
    coachingRule: 'Sets Sam to the left edge and Rover to the right boundary edge.',
  },
  {
    id: 'reload_sig',
    category: 'verbal',
    categoryLabel: 'Emergency Reset',
    name: '“RELOAD!” Reset Call',
    iconEmoji: '🚨',
    signalMotion: 'Both arms circling overhead while shouting “RELOAD! RELOAD!”',
    whoSignals: 'Safeties / Middle Linebackers ➔ All 11 Players',
    onFieldMeaning: 'Emergency reset shouted whenever offense executes a hurry-up, no-huddle, or muddle-huddle tempo. Cancels all exotic checks.',
    coachingRule: 'All 11 players sprint into base alignment immediately, eyes locked on the ball, ready to fire at the snap.',
  },
];

export function DefenseCoordinatorSection({ onOpenPrintModal }: DefenseCoordinatorProps) {
  // 4 Core Live Call Components: <Formation-Front-Coverage-Blitz>
  const [formation, setFormation] = useState<DefenseFormation>('base');
  const [frontCall, setFrontCall] = useState<SelectableFront | null>(null); // null = Base gap integrity (default)
  const [coverageScheme, setCoverageScheme] = useState<CoverageScheme>('green');
  const [blitzCall, setBlitzCall] = useState<'MIKE' | 'WILL' | 'SAM' | 'ROV' | null>(null);

  // Cover Black Specific Rules: Normal (7 yds off) vs "Jam" (Press on LOS) & Will/Mike shared backfield flow
  const [isJamCall, setIsJamCall] = useState<boolean>(false);
  const [backfieldFlow, setBackfieldFlow] = useState<'weak' | 'strong'>('weak');

  // Field & Scout Setup with Auto-Detect Strength Call
  const [autoDetectStrength, setAutoDetectStrength] = useState<boolean>(true);
  const [ballHash, setBallHash] = useState<BallHashPosition>('middle');
  const [manualStrength, setManualStrength] = useState<StrengthCall>('liz');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('SAM');
  const [showCoverageZones, setShowCoverageZones] = useState<boolean>(true);
  const [showZoneDrops, setShowZoneDrops] = useState<boolean>(true);
  const [coverageRoleFilter, setCoverageRoleFilter] = useState<'ALL' | 'LB' | 'DB'>('ALL');
  const [showPressureArrows, setShowPressureArrows] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showLosGaps, setShowLosGaps] = useState<boolean>(false);
  const [showSecondaryBadges, setShowSecondaryBadges] = useState<boolean>(false);
  const [showTechniqueOverlay, setShowTechniqueOverlay] = useState<boolean>(true);
  const [offenseFormation, setOffenseFormation] = useState<OffensiveFormationId>('pro_i');
  const [alignmentMode, setAlignmentMode] = useState<'base_fronts' | 'offense_adjust'>('base_fronts');
  const [defenseSubTab, setDefenseSubTab] = useState<'playart' | 'signals'>('playart');
  const [signalsCategoryFilter, setSignalsCategoryFilter] = useState<'ALL' | 'formations' | 'coverages' | 'fronts' | 'blitzes' | 'verbal'>('ALL');

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
  const coverageCode = coverageScheme === 'black'
    ? (isJamCall ? 'BLACK-JAM' : 'BLACK')
    : activeCoverage.codeName; // 'BLUE' | 'GREEN' | 'BLACK' | 'BLACK-JAM'
  const blitzCode = blitzCall
    ? (DEFENSE_PLAYERS.find((p) => p.id === blitzCall)?.name.toUpperCase().split(' ')[0] || blitzCall)
    : null; // 'MIKE' | 'WILL' | 'SAM' | 'ROVER' | null

  // Spoken live call (e.g., BASE-PINCH-BLUE-MIKE or BASE-BLACK-JAM)
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
    setIsJamCall(false);
    setBackfieldFlow('weak');
    setAlignmentMode('base_fronts');
  };

  const getPlayerCoords = (player: (typeof DEFENSE_PLAYERS)[0]): FormationCoord => {
    // Cover Black: CBs are not automatic press! Normal Black = 7 yds off, inside leverage. Jam = on LOS hand fighting at snap.
    if (coverageScheme === 'black' && (player.id === 'LCB' || player.id === 'RCB')) {
      const oppPlayers = activeOffenseConfig.players;
      const wrLeft =
        oppPlayers.filter((p) => p.isEligible && p.x < 350).sort((a, b) => a.x - b.x)[0] ||
        oppPlayers.find((p) => p.id === 'OWR1') || { x: 160, y: 412 };
      const wrRight =
        oppPlayers.filter((p) => p.isEligible && p.x > 650).sort((a, b) => b.x - a.x)[0] ||
        oppPlayers.find((p) => p.id === 'OWR2' || p.id === 'OWR4' || p.id === 'OWR5') || { x: 840, y: 412 };

      if (player.id === 'LCB') {
        if (isJamCall) {
          return {
            x: wrLeft.x + 8, // tight inside shade on receiver
            y: 374,          // on line of scrimmage
            depthYards: 0.5,
            alignmentDesc: 'Jam Call: On LOS in press stance, hand fighting at snap then covering inside hip tightly',
            technique: 'Jam (LOS) · Hand Fight',
            sequentialTech: 'Jam at LOS',
            gap: 'Tight Inside Hip',
          };
        } else {
          return {
            x: wrLeft.x + 16, // inside leverage (shaded toward field center)
            y: 300,           // 7 yards off LOS (depthYards: 7)
            depthYards: 7,
            alignmentDesc: 'Normal Black: 7 yards off, inside leverage',
            technique: 'Off-Man (7 yds inside shade)',
            sequentialTech: 'Off-Man (7 yds)',
            gap: 'Inside Hip Lock',
          };
        }
      }

      if (player.id === 'RCB') {
        if (isJamCall) {
          return {
            x: wrRight.x - 8, // tight inside shade on receiver
            y: 374,           // on line of scrimmage
            depthYards: 0.5,
            alignmentDesc: 'Jam Call: On LOS in press stance, hand fighting at snap then covering inside hip tightly',
            technique: 'Jam (LOS) · Hand Fight',
            sequentialTech: 'Jam at LOS',
            gap: 'Tight Inside Hip',
          };
        } else {
          return {
            x: wrRight.x - 16, // inside leverage (shaded toward field center)
            y: 300,            // 7 yards off LOS (depthYards: 7)
            depthYards: 7,
            alignmentDesc: 'Normal Black: 7 yards off, inside leverage',
            technique: 'Off-Man (7 yds inside shade)',
            sequentialTech: 'Off-Man (7 yds)',
            gap: 'Inside Hip Lock',
          };
        }
      }
    }

    // Cover 2 (Blue) and Cover 3 (Green): CBs have outside leverage on #1 WR
    if ((coverageScheme === 'blue' || coverageScheme === 'green') && (player.id === 'LCB' || player.id === 'RCB')) {
      const oppPlayers = activeOffenseConfig.players;
      const wrLeft =
        oppPlayers.filter((p) => p.isEligible && p.x < 350).sort((a, b) => a.x - b.x)[0] ||
        oppPlayers.find((p) => p.id === 'OWR1') || { x: 160, y: 412 };
      const wrRight =
        oppPlayers.filter((p) => p.isEligible && p.x > 650).sort((a, b) => b.x - a.x)[0] ||
        oppPlayers.find((p) => p.id === 'OWR2' || p.id === 'OWR4' || p.id === 'OWR5') || { x: 840, y: 412 };

      const isBlue = coverageScheme === 'blue';
      let depthYards = isBlue ? 5 : 7;
      let y = isBlue ? 325 : 300;
      if (formation === 'shell') {
        depthYards = isBlue ? 6 : 9;
        y = isBlue ? 310 : 285;
      } else if (formation === 'vanguard') {
        depthYards = 1.5;
        y = 360;
      }

      if (player.id === 'LCB') {
        return {
          x: wrLeft.x - 18, // outside leverage (shaded toward left sideline)
          y,
          depthYards,
          alignmentDesc: isBlue
            ? 'Cover 2 (Blue): Outside leverage (5 yds off) · Funnel #1 inside to safety, squat in flat'
            : 'Cover 3 (Green): Outside leverage (7 yds off) · Outside-in cushion, protect sideline, bail deep 1/3',
          technique: isBlue ? 'Outside Leverage · Flat Squat' : 'Outside Leverage · 3-Step Bail',
          sequentialTech: isBlue ? 'Flat Squat (Outside Lev)' : 'Deep 1/3 (Outside Lev)',
          gap: isBlue ? 'Flat / Cloud (Outside Lev)' : 'Deep 1/3 (Outside Lev)',
        };
      }

      if (player.id === 'RCB') {
        return {
          x: wrRight.x + 18, // outside leverage (shaded toward right sideline)
          y,
          depthYards,
          alignmentDesc: isBlue
            ? 'Cover 2 (Blue): Outside leverage (5 yds off) · Funnel #1 inside to safety, squat in flat'
            : 'Cover 3 (Green): Outside leverage (7 yds off) · Outside-in cushion, protect sideline, bail deep 1/3',
          technique: isBlue ? 'Outside Leverage · Flat Squat' : 'Outside Leverage · 3-Step Bail',
          sequentialTech: isBlue ? 'Flat Squat (Outside Lev)' : 'Deep 1/3 (Outside Lev)',
          gap: isBlue ? 'Flat / Cloud (Outside Lev)' : 'Deep 1/3 (Outside Lev)',
        };
      }
    }

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
    // 1. Blitz call overrides run gap fit
    if (blitzCall === player.id) {
      if (player.id === 'MIKE') return 'A-Gap Blitz';
      if (player.id === 'WILL') return 'B-Gap Blitz';
      if (player.id === 'SAM') return 'Edge Blitz';
      if (player.id === 'ROV') return 'Edge Blitz';
    }

    const isStrongLeft = strengthCall === 'liz';

    // 2. Defensive Line Gap Fits based on frontCall (Base, Slant, Pinch, Out)
    if (player.id === 'NT') {
      if (frontCall === 'slant') return 'Weak A (Slant)';
      if (frontCall === 'pinch') return 'Both A (Bull)';
      if (frontCall === 'out') return 'Strong A (Slant)';
      return 'Strong A';
    }

    if (player.id === 'LDE') {
      // If Liz, LDE is Weak DE; If Rip, LDE is Strong DE
      const isWeakDE = isStrongLeft;
      if (frontCall === 'slant') {
        return isWeakDE ? 'Weak C (Slant)' : 'Strong A/B (2i Slant)';
      }
      if (frontCall === 'pinch') {
        return isWeakDE ? 'Weak A/B (Pinch)' : 'Strong A/B (Pinch)';
      }
      if (frontCall === 'out') {
        return isWeakDE ? 'Weak C (Angle Out)' : 'Strong C (Angle Out)';
      }
      return isWeakDE ? 'Weak B (4-Tech)' : 'Strong C (6-Tech)';
    }

    if (player.id === 'RDE') {
      // If Liz, RDE is Strong DE; If Rip, RDE is Weak DE
      const isStrongDE = isStrongLeft;
      if (frontCall === 'slant') {
        return isStrongDE ? 'Strong A/B (2i Slant)' : 'Weak C (Slant)';
      }
      if (frontCall === 'pinch') {
        return isStrongDE ? 'Strong A/B (Pinch)' : 'Weak A/B (Pinch)';
      }
      if (frontCall === 'out') {
        return isStrongDE ? 'Strong C (Angle Out)' : 'Weak C (Angle Out)';
      }
      return isStrongDE ? 'Strong C (6-Tech)' : 'Weak B (4-Tech)';
    }

    // 3. Outside Linebackers: Outside Edge / Contain on Run
    if (player.id === 'SAM') {
      return 'Strong D (Contain)';
    }
    if (player.id === 'ROV') {
      return 'Weak D (Contain)';
    }

    // 4. Inside Linebackers: OPEN GAP PRINCIPLE ON RUN
    // "Linebackers gap responsibility is on run and it changes based on what the front 3 are doing:
    //  - If Weak DE is in a 4 tech going B gap, and Rov has outside contain/C gap, then Will has the open gap to his side (Weak A).
    //  - NT going strong side A gap, Strong DE going C gap, Sam has outside contain/D gap then Mike has to take B gap, because it's the open gap (Strong B)."
    if (player.id === 'WILL') {
      // Will is Weak-Side Inside Linebacker
      if (frontCall === 'slant') {
        // Slant call: NT slants to Weak A, Weak DE slants to Weak C, Rov has Weak D.
        // Open gap to weak side is Weak B!
        return 'Weak B (Open Gap)';
      }
      if (frontCall === 'pinch') {
        // Pinch call: Interior squeezed (A/B gaps collapsed). Spill fit to Weak C.
        return 'Weak C (Spill Fit)';
      }
      if (frontCall === 'out') {
        // Out call: Weak DE in Weak C, Rover in Weak D -> Weak B is open!
        return 'Weak B (Open Gap)';
      }
      // Base Front: Weak DE in 4-tech takes Weak B, Rover has outside contain -> Will has open gap:
      return 'Weak A (Open Gap)';
    }

    if (player.id === 'MIKE') {
      // Mike is Strong-Side Inside Linebacker
      if (frontCall === 'slant') {
        // Slant call: NT slanted away to Weak A, Strong DE slants inside (2i).
        // Strong A gap is open!
        return 'Strong A (Open Gap)';
      }
      if (frontCall === 'pinch') {
        // Pinch call: Interior squeezed, spills outside to Strong C:
        return 'Strong C (Spill Fit)';
      }
      if (frontCall === 'out') {
        // Out call: Strong DE in Strong C, NT in Strong A, Sam has Strong D -> Strong B is open!
        return 'Strong B (Open Gap)';
      }
      // Base Front: NT in Strong A, Strong DE in Strong C, Sam in Strong D -> Mike has open gap:
      return 'Strong B (Open Gap)';
    }

    // 5. Secondary Run Support & Force
    if (player.id === 'LCB') {
      return 'Boundary Run Force';
    }
    if (player.id === 'RCB') {
      return 'Field Run Force';
    }
    if (player.id === 'FS') {
      return 'Deep Alley Fill';
    }
    if (player.id === 'SS') {
      return 'Strong Alley Force';
    }

    if (coords.gap) {
      return coords.gap.split('(')[0].replace(' Gap', '').trim();
    }
    return '';
  };

  // Pass Coverage Responsibility (Threat Counting in Cover Black, Drops in Cover 2/3)
  const getPassCoverageResponsibility = (player: (typeof DEFENSE_PLAYERS)[0]): { title: string; detail: string } => {
    if (player.isDefensiveLine) {
      if (blitzCall === player.id) {
        return { title: 'Blitz Pass Rush', detail: 'Interior pass rush track' };
      }
      return { title: 'Base 3-Man Rush', detail: 'Pocket collapse · Contain QB in pocket' };
    }

    if (blitzCall === player.id) {
      return { title: 'Assigned Blitz Track', detail: 'Pressure rush through assigned gap' };
    }

    if (coverageScheme === 'black') {
      if (offenseFormation === 'heavy_2te') {
        if (player.id === 'LCB') return { title: '🔒 #1 Threat to Left (X)', detail: 'Boundary WR · Matchup outside-in' };
        if (player.id === 'ROV') return { title: '🔒 #2 Threat to Left (Y1)', detail: 'Left TE (Y1) · Outside-in match' };
        if (player.id === 'WILL') return { title: '🔒 #3 Threat (TB)', detail: 'Tailback in backfield · Outside-in match' };
        if (player.id === 'RCB') return { title: '🔒 #1 Threat to Right (Y2)', detail: 'Right TE (Y2) · Outside-in match' };
        if (player.id === 'SAM') return { title: '🔒 #2 Threat to Right (TB)', detail: 'Tailback to strong side · Outside-in match' };
        if (player.id === 'MIKE') {
          return backfieldFlow === 'strong'
            ? { title: '🔒 #3 Threat to Right (FB)', detail: 'Fullback to strong side' }
            : { title: '🔒 #4 Threat to Left (FB)', detail: 'Fullback crossing to Will\'s side' };
        }
        if (player.id === 'FS') return { title: '🦅 Deep Post Free Roamer', detail: 'Single-high safety capping verticals' };
        if (player.id === 'SS') return { title: '🔒 Hole / Robber / Spy', detail: 'Down safety low hole patrol & spy support' };
      } else {
        if (player.id === 'LCB') return { title: isJamCall ? '💥 Press-Man Jam (LOS)' : '🔒 #1 Threat: X (7 Yds Inside Lev)', detail: 'Man-to-man on #1 boundary receiver X' };
        if (player.id === 'RCB') return { title: isJamCall ? '💥 Press-Man Jam (LOS)' : '🔒 #1 Threat: Z (7 Yds Inside Lev)', detail: 'Man-to-man on #1 field receiver Z' };
        if (player.id === 'SAM') return { title: '🔒 #2 Threat: Y (Tight End)', detail: 'Man-to-man lock on Tight End Y · Outside-in match' };
        if (player.id === 'ROV') {
          return backfieldFlow === 'weak'
            ? { title: '🔒 #2 Threat: TB (Weak Flow)', detail: 'Matches 2nd threat to weak side (Tailback release)' }
            : { title: 'Weak Edge Contain / Spy', detail: 'Maintains backside contain against reverse / bootleg' };
        }
        if (player.id === 'WILL') {
          return backfieldFlow === 'weak'
            ? { title: '🔒 #3 Threat: Fullback (FB)', detail: 'Attached to Fullback (FB) in man-to-man coverage' }
            : { title: '🔒 #4 Threat: Fullback (FB)', detail: '4th defender matching 4th strong-side threat (FB)' };
        }
        if (player.id === 'MIKE') {
          return backfieldFlow === 'strong'
            ? { title: '🔒 #3 Threat: TB (Strong Flow)', detail: 'Matches 3rd threat to strong side (Tailback release)' }
            : { title: '🐀 Hole / QB Spy', detail: 'Patrols low hole & spies QB scramble when flow goes away' };
        }
        if (player.id === 'SS') return { title: '🔒 Hole / Robber / Spy', detail: 'Down safety playing the hole, robber & underneath spy support' };
        if (player.id === 'FS') return { title: '🦅 Deep Post Free Roamer', detail: 'Single-high safety capping deep post & vertical threats' };
      }
    } else if (coverageScheme === 'blue') {
      if (player.id === 'LCB' || player.id === 'RCB') return { title: 'Flat Squat (Outside Leverage)', detail: 'Outside leverage, re-route #1 WR inside, squat in flat at 2-5 yds' };
      if (player.id === 'FS' || player.id === 'SS') return { title: 'Deep 1/2 Field Cap', detail: 'Deep half coverage, split field hash to sideline' };
      if (player.id === 'WILL') return { title: 'Weak Curl-to-Flat Drop', detail: 'Zone drop to weak curl landmark (10-12 yds)' };
      if (player.id === 'MIKE') return { title: 'Middle Hole / Hook Drop', detail: 'Zone drop to low hole / middle hook (8-10 yds)' };
      if (player.id === 'SAM') return { title: 'Strong Curl-to-Flat Drop', detail: 'Zone drop to strong curl landmark (10-12 yds)' };
      if (player.id === 'ROV') return { title: 'Weak Flat Buzz / Overhang', detail: 'Buzz weak flat to bracket quick speed outs' };
    } else if (coverageScheme === 'green') {
      if (player.id === 'LCB' || player.id === 'RCB') return { title: 'Deep Outside 1/3 (Outside Lev)', detail: 'Outside leverage, protect sideline, 3-step bail capping deep third' };
      if (player.id === 'FS') return { title: 'Deep Middle 1/3 Post Cap', detail: 'Middle of field post cap from hash to hash' };
      if (player.id === 'SS') return { title: 'Strong Sky Flat Curl', detail: 'Sky force down to strong flat / curl seam' };
      if (player.id === 'WILL') return { title: 'Weak Hook / Curl Drop', detail: 'Zone drop 10-12 yds to weak hash curl' };
      if (player.id === 'MIKE') return { title: 'Middle Hook / Low Hole', detail: 'Zone drop 8-10 yds to middle hook hole' };
      if (player.id === 'SAM') return { title: 'Strong Hook / Seam Drop', detail: 'Drop underneath #2 vertical in strong seam' };
      if (player.id === 'ROV') return { title: 'Weak Flat Curl / Robber', detail: 'Buzz weak underneath seam to curl' };
    }

    return {
      title: activeCoverage.responsibilities[player.id] || 'Pass Coverage Drop',
      detail: 'Standard coverage responsibility for active call',
    };
  };

  interface FrontGapArrow {
    playerId: string;
    arrowEnd: { x: number; y: number };
    technique: string;
    targetGap: string;
    label: string;
    type: 'dl' | 'olb' | 'ilb';
    stroke: string;
    markerEnd: string;
  }

  // Pass Assignment Description Label on Playart (swapped in place of gap label)
  const getPassAssignmentLabel = (player: (typeof DEFENSE_PLAYERS)[0]): string => {
    if (player.isDefensiveLine) {
      if (blitzCall === player.id) return 'BLITZ RUSH';
      return 'PASS RUSH';
    }

    if (blitzCall === player.id) {
      return 'BLITZ TRACK';
    }

    if (coverageScheme === 'black') {
      if (offenseFormation === 'heavy_2te') {
        if (player.id === 'LCB') return isJamCall ? 'JAM: X (LOS)' : '#1 THREAT (X)';
        if (player.id === 'ROV') return '#2 THREAT (Y1)';
        if (player.id === 'WILL') return '#3 THREAT (TB)';
        if (player.id === 'RCB') return isJamCall ? 'JAM: Y2 (LOS)' : '#1 THREAT (Y2)';
        if (player.id === 'SAM') return '#2 THREAT (TB)';
        if (player.id === 'MIKE') {
          return backfieldFlow === 'strong' ? '#3 THREAT (FB)' : '#4 THREAT (FB)';
        }
        if (player.id === 'FS') return 'DEEP POST';
        if (player.id === 'SS') return 'HOLE / ROBBER / SPY';
      } else {
        if (player.id === 'LCB') return isJamCall ? 'JAM: X (LOS)' : '#1 THREAT (X)';
        if (player.id === 'RCB') return isJamCall ? 'JAM: Z (LOS)' : '#1 THREAT (Z)';
        if (player.id === 'SAM') return '#2 THREAT (Y)';
        if (player.id === 'ROV') return backfieldFlow === 'weak' ? '#2 THREAT (TB)' : 'BACKSIDE CONTAIN';
        if (player.id === 'WILL') return backfieldFlow === 'weak' ? '#3 THREAT (FB)' : '#4 THREAT (FB)';
        if (player.id === 'MIKE') return backfieldFlow === 'strong' ? '#3 THREAT (TB)' : 'HOLE / QB SPY';
        if (player.id === 'FS') return 'DEEP POST';
        if (player.id === 'SS') return 'HOLE / ROBBER / SPY';
      }
    } else if (coverageScheme === 'blue') {
      if (player.id === 'LCB' || player.id === 'RCB') return 'FLAT SQUAT (OUTSIDE LEV)';
      if (player.id === 'FS' || player.id === 'SS') return 'DEEP 1/2';
      if (player.id === 'WILL') return 'CURL / FLAT';
      if (player.id === 'MIKE') return 'MIDDLE HOLE';
      if (player.id === 'SAM') return 'CURL / FLAT';
      if (player.id === 'ROV') return 'FLAT BUZZ';
    } else if (coverageScheme === 'green') {
      if (player.id === 'LCB' || player.id === 'RCB') return 'DEEP 1/3 (OUTSIDE LEV)';
      if (player.id === 'FS') return 'DEEP MID 1/3';
      if (player.id === 'SS') return 'SKY FLAT';
      if (player.id === 'WILL') return 'HOOK / CURL';
      if (player.id === 'MIKE') return 'MIDDLE HOLE';
      if (player.id === 'SAM') return 'STRONG HOOK';
      if (player.id === 'ROV') return 'FLAT / SEAM';
    }

    return (activeCoverage.responsibilities[player.id] || 'COVERAGE DROP').toUpperCase();
  };

  // End Man on Line of Scrimmage (EMLOS) coordinates for active offensive formation
  const { emlosLeft, emlosRight } = useMemo(() => {
    const leftPlayersOnLOS = activeOffenseConfig.players.filter(
      (p) => p.y <= 425 && (p.id === 'OLT' || p.id === 'OTE1' || (p.id === 'OTE' && p.x < 500) || p.label === 'Y1' || (p.label === 'TE' && p.x < 500))
    );
    const rightPlayersOnLOS = activeOffenseConfig.players.filter(
      (p) => p.y <= 425 && (p.id === 'ORT' || p.id === 'OTE2' || (p.id === 'OTE' && p.x > 500) || p.label === 'Y2' || (p.label === 'TE' && p.x > 500))
    );

    const leftEMLOS = leftPlayersOnLOS.length > 0
      ? leftPlayersOnLOS.reduce((min, p) => (p.x < min.x ? p : min), leftPlayersOnLOS[0])
      : activeOffenseConfig.players.find((p) => p.id === 'OLT') || { x: 390, y: 412, label: 'LT' };

    const rightEMLOS = rightPlayersOnLOS.length > 0
      ? rightPlayersOnLOS.reduce((max, p) => (p.x > max.x ? p : max), rightPlayersOnLOS[0])
      : activeOffenseConfig.players.find((p) => p.id === 'ORT') || { x: 610, y: 412, label: 'RT' };

    return {
      emlosLeft: leftEMLOS,
      emlosRight: rightEMLOS,
    };
  }, [activeOffenseConfig]);

  // Front Gap Arrows: Base Front Gaps, Slants, and Linebacker Run Fits (Sam/Rov 3 yds outside EMLOS, Will/Mike Open Gaps)
  const activeFrontGapArrows = useMemo(() => {
    const isStrongLeft = strengthCall === 'liz'; // Def Left = Screen Right (x > 500)

    // ROV and SAM run gap assignment: point arrows 3 yards outside of the EMLOS at heel depth of LOS (y=418)
    // Scale: 1 yd ~ 18.5px -> 3 yds outside = 55px beyond EMLOS
    const rovArrow: FrontGapArrow = {
      playerId: 'ROV',
      arrowEnd: { x: emlosLeft.x - 55, y: 418 },
      technique: '3 Yds Outside EMLOS',
      targetGap: 'Weak D-Gap Contain',
      label: 'Weak D (3 Yds Out)',
      type: 'olb',
      stroke: '#F59E0B',
      markerEnd: 'url(#slantArrow)',
    };

    const samArrow: FrontGapArrow = {
      playerId: 'SAM',
      arrowEnd: { x: emlosRight.x + 55, y: 418 },
      technique: '3 Yds Outside EMLOS',
      targetGap: 'Strong D-Gap Contain',
      label: 'Strong D (3 Yds Out)',
      type: 'olb',
      stroke: '#F59E0B',
      markerEnd: 'url(#slantArrow)',
    };

    // WILL and MIKE gap assignments: open gap principle at heel depth of LOS (y=418)
    let willArrow: FrontGapArrow;
    let mikeArrow: FrontGapArrow;

    if (frontCall === 'slant') {
      // Slant weak: NT slants Weak A, Weak DE slants Weak C -> Will takes Weak B; Mike takes Strong A
      willArrow = {
        playerId: 'WILL',
        arrowEnd: { x: isStrongLeft ? 418 : 583, y: 418 },
        technique: 'Slant Fill (Open Gap)',
        targetGap: 'Weak B (Open Gap)',
        label: 'Weak B (Open)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
      mikeArrow = {
        playerId: 'MIKE',
        arrowEnd: { x: isStrongLeft ? 528 : 472, y: 418 },
        technique: 'Slant Fill (Open Gap)',
        targetGap: 'Strong A (Open Gap)',
        label: 'Strong A (Open)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
    } else if (frontCall === 'pinch') {
      // Pinch: Interior squeezed, Will and Mike spill outside to C-gaps
      willArrow = {
        playerId: 'WILL',
        arrowEnd: { x: isStrongLeft ? 360 : 640, y: 418 },
        technique: 'Spill Fit (C-Gap)',
        targetGap: 'Weak C (Spill Fit)',
        label: 'Weak C (Spill)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
      mikeArrow = {
        playerId: 'MIKE',
        arrowEnd: { x: isStrongLeft ? 640 : 360, y: 418 },
        technique: 'Spill Fit (C-Gap)',
        targetGap: 'Strong C (Spill Fit)',
        label: 'Strong C (Spill)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
    } else if (frontCall === 'out') {
      // Angle Out: DEs angle to C-gaps -> Will takes Weak B; Mike takes Strong B
      willArrow = {
        playerId: 'WILL',
        arrowEnd: { x: isStrongLeft ? 418 : 583, y: 418 },
        technique: 'Angle Fill (Open Gap)',
        targetGap: 'Weak B (Open Gap)',
        label: 'Weak B (Open)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
      mikeArrow = {
        playerId: 'MIKE',
        arrowEnd: { x: isStrongLeft ? 583 : 418, y: 418 },
        technique: 'Angle Fill (Open Gap)',
        targetGap: 'Strong B (Open Gap)',
        label: 'Strong B (Open)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
    } else {
      // Base Front: Weak DE takes Weak B, Rov contains -> Will takes Weak A (Open Gap)
      // NT takes Strong A, Strong DE takes Strong C, Sam contains -> Mike takes Strong B (Open Gap)
      willArrow = {
        playerId: 'WILL',
        arrowEnd: { x: isStrongLeft ? 472 : 528, y: 418 },
        technique: 'Base Fill (Open Gap)',
        targetGap: 'Weak A (Open Gap)',
        label: 'Weak A (Open)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
      mikeArrow = {
        playerId: 'MIKE',
        arrowEnd: { x: isStrongLeft ? 583 : 418, y: 418 },
        technique: 'Base Fill (Open Gap)',
        targetGap: 'Strong B (Open Gap)',
        label: 'Strong B (Open)',
        type: 'ilb',
        stroke: '#F59E0B',
        markerEnd: 'url(#slantArrow)',
      };
    }

    // Defensive Line Gap Arrows (all ending just behind OL at heel depth y=418)
    let dlArrows: FrontGapArrow[] = [];
    if (frontCall === 'slant') {
      if (isStrongLeft) {
        dlArrows = [
          { playerId: 'NT', arrowEnd: { x: 465, y: 418 }, technique: 'Slant 1-Tech (Weak)', targetGap: 'Weak A-Gap', label: 'Slant Weak A', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
          { playerId: 'LDE', arrowEnd: { x: 385, y: 418 }, technique: 'Slant 7-Tech (Weak)', targetGap: 'Weak C-Gap', label: 'Slant Weak C', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
          { playerId: 'RDE', arrowEnd: { x: 550, y: 418 }, technique: 'Slant 2i-Tech', targetGap: 'Strong A/B-Gap', label: 'Slant Inside', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        ];
      } else {
        dlArrows = [
          { playerId: 'NT', arrowEnd: { x: 535, y: 418 }, technique: 'Slant 1-Tech (Weak)', targetGap: 'Weak A-Gap', label: 'Slant Weak A', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
          { playerId: 'RDE', arrowEnd: { x: 615, y: 418 }, technique: 'Slant 7-Tech (Weak)', targetGap: 'Weak C-Gap', label: 'Slant Weak C', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
          { playerId: 'LDE', arrowEnd: { x: 450, y: 418 }, technique: 'Slant 2i-Tech', targetGap: 'Strong A/B-Gap', label: 'Slant Inside', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        ];
      }
    } else if (frontCall === 'pinch') {
      dlArrows = [
        { playerId: 'NT', arrowEnd: { x: 500, y: 418 }, technique: 'Bull Rush Center', targetGap: 'Both A-Gaps', label: 'Center Bull', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'LDE', arrowEnd: { x: 450, y: 418 }, technique: 'Pinch B-to-A', targetGap: 'Weak A/B Squeeze', label: 'Pinch Inside', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'RDE', arrowEnd: { x: 550, y: 418 }, technique: 'Pinch B-to-A', targetGap: 'Strong A/B Squeeze', label: 'Pinch Inside', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
      ];
    } else if (frontCall === 'out') {
      dlArrows = [
        { playerId: 'NT', arrowEnd: { x: isStrongLeft ? 525 : 475, y: 418 }, technique: 'Slant 1-Tech', targetGap: 'Strong A-Gap', label: 'A-Gap Wedge', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'LDE', arrowEnd: { x: 380, y: 418 }, technique: 'Angle to 6/7-Tech', targetGap: 'Weak C-Gap', label: 'Angle Out', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'RDE', arrowEnd: { x: 620, y: 418 }, technique: 'Angle to 6/7-Tech', targetGap: 'Strong C-Gap', label: 'Angle Out', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
      ];
    } else if (formation === 'vanguard') {
      dlArrows = [
        { playerId: 'NT', arrowEnd: { x: 500, y: 418 }, technique: '0-Tech Submarine', targetGap: 'A-Gap Wedge', label: 'Submarine A', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'LDE', arrowEnd: { x: 420, y: 418 }, technique: '4-Tech Tight Squeeze', targetGap: 'B-Gap Seal', label: 'B-Gap Seal', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'RDE', arrowEnd: { x: 580, y: 418 }, technique: '6-Tech Tight Squeeze', targetGap: 'C-Gap Seal', label: 'C-Gap Seal', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
      ];
    } else if (formation === 'shell') {
      dlArrows = [
        { playerId: 'NT', arrowEnd: { x: 500, y: 418 }, technique: 'Bull Rush', targetGap: 'Sack QB', label: 'Bull Rush', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'LDE', arrowEnd: { x: 405, y: 418 }, technique: 'Speed Edge Rush', targetGap: 'Sack QB', label: 'Speed Rush', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'RDE', arrowEnd: { x: 595, y: 418 }, technique: 'Speed Edge Rush', targetGap: 'Sack QB', label: 'Speed Rush', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
      ];
    } else {
      // Base 3-4 Front:
      dlArrows = [
        { playerId: 'NT', arrowEnd: { x: isStrongLeft ? 525 : 475, y: 418 }, technique: '0-Tech (Strong A)', targetGap: 'Strong A', label: 'Strong A', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'LDE', arrowEnd: { x: isStrongLeft ? 418 : 360, y: 418 }, technique: isStrongLeft ? '4-Tech' : '6-Tech', targetGap: isStrongLeft ? 'Weak B' : 'Strong C', label: isStrongLeft ? 'Weak B' : 'Strong C', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
        { playerId: 'RDE', arrowEnd: { x: isStrongLeft ? 635 : 585, y: 418 }, technique: isStrongLeft ? '6-Tech' : '4-Tech', targetGap: isStrongLeft ? 'Strong C' : 'Weak B', label: isStrongLeft ? 'Strong C' : 'Weak B', type: 'dl', stroke: '#F59E0B', markerEnd: 'url(#slantArrow)' },
      ];
    }

    // Return all Front 7 gap arrows: DL + Linebackers (Rov, Sam, Will, Mike)
    return [...dlArrows, rovArrow, samArrow, willArrow, mikeArrow];
  }, [formation, frontCall, strengthCall, emlosLeft, emlosRight]);

  // Helper to get offensive receiver/back targets for Black coverage lock lines
  const getBlackCoverageTarget = (assign: PlayerCoverageAssignment): { x: number; y: number; label: string } => {
    const pId = assign.playerId;
    const oppPlayers = activeOffenseConfig.players;
    const isStrongLeft = strengthCall === 'liz';
    const isHeavy2TE = offenseFormation === 'heavy_2te';

    // SPECIAL THREAT-MATCHING RULE FOR DOUBLE TIGHT END HEAVY:
    // Matchup based on threats from outside in:
    // Left side:
    // - LCB has #1 threat (X) to his side
    // - Rover has #2 threat (Y1) to his side
    // - Will has #3 threat (TB)
    // - Mike has #4 threat (FB) to Will's side
    // Right side:
    // - RCB has #1 threat to his side (Y2)
    // - Sam has #2 threat (TB) to his side
    // - Mike has #3 threat (TB) to his side
    if (isHeavy2TE) {
      if (pId === 'LCB') {
        const xWr = oppPlayers.find((p) => p.id === 'OWR1') || { x: 150, y: 412, label: 'X' };
        if (isJamCall) {
          return { x: xWr.x + 8, y: 382, label: '#1 Threat: X (Jam @ LOS)' };
        }
        return { x: xWr.x + 16, y: xWr.y - 18, label: '#1 Threat: X' };
      }
      if (pId === 'ROV') {
        const y1 = oppPlayers.find((p) => p.id === 'OTE1' || p.label === 'Y1') || { x: 330, y: 412, label: 'Y1' };
        return { x: y1.x, y: 382, label: '#2 Threat: Y1 (Left TE)' };
      }
      if (pId === 'RCB') {
        const y2 = oppPlayers.find((p) => p.id === 'OTE2' || p.label === 'Y2') || { x: 670, y: 412, label: 'Y2' };
        if (isJamCall) {
          return { x: y2.x - 8, y: 382, label: '#1 Threat: Y2 (Jam @ LOS)' };
        }
        return { x: y2.x - 16, y: y2.y - 18, label: '#1 Threat: Y2 (Right TE)' };
      }
      if (pId === 'SAM') {
        // Sam has #2 threat (TB) to his side
        const tb = oppPlayers.find((p) => p.id === 'OTB') || { x: 500, y: 530, label: 'TB' };
        if (backfieldFlow === 'strong') {
          return { x: 580, y: 442, label: '#2 Threat: TB (Strong Release)' };
        } else {
          return { x: 610, y: 430, label: '#2 Threat to his side (TB)' };
        }
      }
      if (pId === 'WILL') {
        // Will has #3 threat (TB)
        const tb = oppPlayers.find((p) => p.id === 'OTB') || { x: 500, y: 530, label: 'TB' };
        if (backfieldFlow === 'weak') {
          return { x: 420, y: 442, label: '#3 Threat: TB (Weak Release)' };
        } else {
          return { x: 440, y: 430, label: '#3 Threat: TB' };
        }
      }
      if (pId === 'MIKE') {
        // Mike has #3 threat (TB) to his side and #4 threat (FB) to Will's side
        const fb = oppPlayers.find((p) => p.id === 'OFB') || { x: 500, y: 485, label: 'FB' };
        if (backfieldFlow === 'strong') {
          return { x: 540, y: 460, label: '#3 Threat: FB (to his side)' };
        } else {
          return { x: 460, y: 460, label: '#4 Threat: FB (to Will\'s side)' };
        }
      }
      if (pId === 'FS') {
        return { x: assign.dropTarget.x, y: assign.dropTarget.y, label: 'Centerfield Roamer' };
      }
      if (pId === 'SS') {
        return { x: 630, y: 220, label: 'Strong Alley Robber / Y2 Bracket' };
      }
    }

    if (pId === 'LCB') {
      const wrLeft =
        oppPlayers.filter((p) => p.isEligible && p.x < 350).sort((a, b) => a.x - b.x)[0] ||
        oppPlayers.find((p) => p.id === 'OWR1') || { x: 160, y: 412, label: 'X' };
      if (isJamCall) {
        return { x: wrLeft.x + 8, y: 382, label: `Jam #1 WR (${wrLeft.label}) at LOS` };
      }
      return { x: wrLeft.x + 16, y: wrLeft.y - 18, label: `#1 WR (${wrLeft.label}) [Inside Hip]` };
    }
    if (pId === 'RCB') {
      const wrRight =
        oppPlayers.filter((p) => p.isEligible && p.x > 650).sort((a, b) => b.x - a.x)[0] ||
        oppPlayers.find((p) => p.id === 'OWR2' || p.id === 'OWR4' || p.id === 'OWR5') || { x: 840, y: 412, label: 'Z' };
      if (isJamCall) {
        return { x: wrRight.x - 8, y: 382, label: `Jam #1 WR (${wrRight.label}) at LOS` };
      }
      return { x: wrRight.x - 16, y: wrRight.y - 18, label: `#1 WR (${wrRight.label}) [Inside Hip]` };
    }
    // Sam: "Sam does not have Strong Hook, he has Y."
    if (pId === 'SAM') {
      const teY =
        oppPlayers.find((p) => (p.id.includes('TE') || (p.label.startsWith('Y') && p.isEligible)) && (isStrongLeft ? p.x > 500 : p.x < 500)) ||
        oppPlayers.find((p) => p.id.includes('TE') || p.label === 'Y' || (p.label.startsWith('Y') && p.isEligible)) ||
        oppPlayers.find((p) => p.role.toLowerCase().includes('tight end')) ||
        { x: isStrongLeft ? 670 : 330, y: 412, label: 'Y' };
      return { x: teY.x, y: teY.y - 18, label: `#2 Threat: Y (${teY.label})` };
    }

    // Rover: "Rov will have the 2nd threat, which would be the TB if the TB goes to the weak side. Teal line should connect to the TB."
    if (pId === 'ROV') {
      if (backfieldFlow === 'weak') {
        const tbWeakX = isStrongLeft ? 420 : 580;
        return { x: tbWeakX, y: 465, label: '#2 Threat: TB (Weak Flow)' };
      } else {
        const weakEdgeX = isStrongLeft ? 330 : 670;
        return { x: weakEdgeX, y: 382, label: 'Backside Edge Contain / Spy' };
      }
    }

    // Will: "Will should be attached to the fullback... and Will still has the FB to the strong side because he is the 4th defender and FB is the 4th Strong Side threat."
    if (pId === 'WILL') {
      if (backfieldFlow === 'strong') {
        const fbStrongX = isStrongLeft ? 535 : 465;
        return { x: fbStrongX, y: 460, label: '#4 Threat: Fullback (FB)' };
      } else {
        const fbWeakX = isStrongLeft ? 465 : 535;
        return { x: fbWeakX, y: 460, label: '#3 Threat: Fullback (FB)' };
      }
    }

    // Mike: "Mike has the TB to the strong side."
    if (pId === 'MIKE') {
      if (backfieldFlow === 'strong') {
        const tbStrongX = isStrongLeft ? 580 : 420;
        return { x: tbStrongX, y: 465, label: '#3 Threat: TB (Strong Flow)' };
      } else {
        return { x: 500, y: 250, label: 'Hole / Underneath QB Spy' };
      }
    }

    // Strong Safety: "SS will have Hole/Robber/Spy"
    if (pId === 'SS') {
      const holeX = isStrongLeft ? 580 : 420;
      return { x: holeX, y: 235, label: 'Hole / Robber / Spy' };
    }

    if (pId === 'FS') {
      return { x: assign.dropTarget.x, y: assign.dropTarget.y, label: 'Centerfield Deep Post Roamer' };
    }
    return { x: assign.dropTarget.x, y: assign.dropTarget.y, label: assign.landmarkLabel };
  };
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Defensive Sub-Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070E13] p-2.5 rounded-2xl border border-[#162A33] shadow-lg">
        <div className="flex items-center gap-1.5 p-1 bg-[#050C10] rounded-xl border border-[#162A33]">
          <button
            onClick={() => setDefenseSubTab('playart')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              defenseSubTab === 'playart'
                ? 'bg-teal-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-[#0B1A24]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Playart & Call Simulator</span>
          </button>
          <button
            onClick={() => setDefenseSubTab('signals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              defenseSubTab === 'signals'
                ? 'bg-teal-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-[#0B1A24]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Defensive Signals & Communication</span>
          </button>
        </div>

        <button
          onClick={onOpenPrintModal}
          className="px-3.5 py-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold hover:bg-teal-500/30 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Sideline Call Sheet</span>
        </button>
      </div>

      {defenseSubTab === 'playart' ? (
        <>
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

        {/* Cover Black Specific Rules & Technique Tuning Strip */}
        {coverageScheme === 'black' && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#0B1720] to-[#0A1822] border border-amber-500/40 text-xs space-y-3 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* CB Technique: Normal Black (7 Yds Off) vs Jam Call (Press on LOS) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  CB Coverage Call:
                </span>
                <div className="inline-flex rounded-lg border border-amber-500/30 bg-[#070E13] p-0.5 font-mono text-[11px]">
                  <button
                    onClick={() => setIsJamCall(false)}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      !isJamCall
                        ? 'bg-amber-400 text-slate-950 shadow ring-1 ring-amber-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👕 Normal Black</span>
                    <span className="text-[9.5px] opacity-80 font-normal">(7 Yds Off · Inside Lev)</span>
                  </button>
                  <button
                    onClick={() => setIsJamCall(true)}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      isJamCall
                        ? 'bg-amber-400 text-slate-950 shadow ring-1 ring-amber-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🙌 Call: &quot;JAM&quot;</span>
                    <span className="text-[9.5px] opacity-80 font-normal">(Press @ LOS · Hand Fight)</span>
                  </button>
                </div>
              </div>

              {/* Will & Mike Shared Responsibility */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  Backfield Flow (Will &amp; Mike Share):
                </span>
                <div className="inline-flex rounded-lg border border-teal-500/30 bg-[#070E13] p-0.5 font-mono text-[11px]">
                  <button
                    onClick={() => setBackfieldFlow('weak')}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      backfieldFlow === 'weak'
                        ? 'bg-teal-400 text-slate-950 shadow ring-1 ring-teal-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👈 Back to Weak Side</span>
                    <span className="text-[9.5px] opacity-80 font-normal">(Rov has TB · Will has FB · Mike Spies)</span>
                  </button>
                  <button
                    onClick={() => setBackfieldFlow('strong')}
                    className={`px-3 py-1.5 rounded font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                      backfieldFlow === 'strong'
                        ? 'bg-teal-400 text-slate-950 shadow ring-1 ring-teal-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>👉 Back to Strong Side</span>
                    <span className="text-[9.5px] opacity-80 font-normal">(Mike has TB · Will has FB · Sam has Y)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cover 2 Blue Outside Leverage Doctrine Banner */}
        {coverageScheme === 'blue' && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 via-[#0B1720] to-[#0A1822] border border-sky-500/40 text-xs space-y-2 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Cover 2 (Blue) CB Leverage Rule:
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-950/90 text-sky-200 border border-sky-500/50 font-mono font-bold text-[11px]">
                  OUTSIDE LEVERAGE (5 Yds Off)
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">
                Hand Signal: 👆 Point at the sky
              </span>
            </div>
            <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
              In Cover 2 (Blue), Cornerbacks align with <strong>OUTSIDE LEVERAGE</strong> on #1 wide receivers. Deliver a physical re-route at the line of scrimmage to funnel the receiver inside toward deep safety help, then squat at 2-5 yards in the flat to shut down bubbles, screens, and quick out routes.
            </p>
          </div>
        )}

        {/* Cover 3 Green Outside Leverage Doctrine Banner */}
        {coverageScheme === 'green' && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#0B1720] to-[#0A1822] border border-emerald-500/40 text-xs space-y-2 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Cover 3 (Green) CB Leverage Rule:
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 font-mono font-bold text-[11px]">
                  OUTSIDE LEVERAGE (7 Yds Off · 3-Step Bail)
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">
                Hand Signal: 👇 Point at the grass/turf
              </span>
            </div>
            <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
              In Cover 3 (Green), Cornerbacks align 7 yards off with <strong>OUTSIDE LEVERAGE</strong>. Maintain outside-in cushion to protect the sideline, funnel all route breaks inside toward the single-high Free Safety, and bail 3 steps at snap to cap the deep outside third.
            </p>
          </div>
        )}

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
                checked={showZoneDrops}
                onChange={(e) => setShowZoneDrops(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span className="flex items-center gap-1 font-semibold text-teal-300">
                <span>Zone Drops & Assignments</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950/90 text-teal-300 border border-teal-700/60">
                  LBs & DBs
                </span>
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showCoverageZones}
                onChange={(e) => setShowCoverageZones(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span>Coverage Shells</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showPressureArrows}
                onChange={(e) => setShowPressureArrows(e.target.checked)}
                className="rounded border-slate-700 text-amber-400 focus:ring-0"
              />
              <span>Front Gap Arrows (DL & LBs)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span>Field Grid</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showLosGaps}
                onChange={(e) => setShowLosGaps(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span>LOS Gap Tags</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showSecondaryBadges}
                onChange={(e) => setShowSecondaryBadges(e.target.checked)}
                className="rounded border-slate-700 text-teal-400 focus:ring-0"
              />
              <span>Secondary Pass Badges (DBs)</span>
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

        {/* Chalkboard Legend Strip */}
        <div className="px-3.5 py-2 rounded-lg bg-[#07131B] border border-[#162A33] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-teal-300 font-semibold">
              <span className="inline-block w-6 border-b-2 border-dashed border-teal-400" />
              <span>Pass Assignment (Teal Dashed · No Arrow)</span>
            </span>
            <span className="flex items-center gap-2 text-amber-300 font-semibold">
              <span className="flex items-center">
                <span className="inline-block w-4 h-0.5 bg-amber-400" />
                <span className="inline-block w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-amber-400" />
                <span className="inline-block w-2.5 h-2.5 rounded-full border border-amber-400 bg-[#061219] ml-1" />
              </span>
              <span>Run Gap Responsibility (Orange Arrow + Target Circle at Heel Depth)</span>
            </span>
          </div>
          <span className="text-slate-400 text-[10.5px]">
            EMLOS ± 3 Yds (Rov/Sam) · Open Gaps (Will/Mike)
          </span>
        </div>

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
              <marker
                id="lbGapArrowBlue"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#60A5FA" />
              </marker>
              <marker
                id="lbEdgeArrowTeal"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#2DD4BF" />
              </marker>
              <marker
                id="covArrowBlue"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38BDF8" />
              </marker>
              <marker
                id="covArrowGreen"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#34D399" />
              </marker>
              <marker
                id="covArrowBlack"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#F59E0B" />
              </marker>
              <filter id="covDropGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Field Grid */}
            <rect width="1000" height="620" fill="#04090D" />
            {showGrid && <rect width="1000" height="620" fill="url(#grid)" />}

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
            {showLosGaps && (
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
                fontSize="11.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {activeOffenseConfig.name} {activeOffenseConfig.personnel}
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

            {/* Coverage Zones (Shells) */}
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

            {/* ZONE DROPS (Green & Blue) and ASSIGNMENTS (Black) for LBs & DBs */}
            {showZoneDrops && (
              <g id="coverage-zone-drops-and-assignments" opacity="0.95">
                {activeCoverage.playerAssignments.map((assign) => {
                  const p = DEFENSE_PLAYERS.find((d) => d.id === assign.playerId);
                  if (!p) return null;
                  const coords = getPlayerCoords(p);
                  const isSelected = selectedPlayerId === p.id;
                  const isBlitzing = blitzCall === p.id;

                  // 1. BLACK COVERAGE (Cover 1 Man-Free) - Teal dashed lines with NO arrow connecting to the assignment
                  if (coverageScheme === 'black') {
                    const target = getBlackCoverageTarget(assign);
                    const themeColor = '#2DD4BF'; // Teal for pass assignments

                    if (assign.playerId === 'FS') {
                      // Free Safety: Single-High Free Roamer
                      return (
                        <g
                          key={`cov-${assign.playerId}`}
                          onClick={() => setSelectedPlayerId(p.id)}
                          className="cursor-pointer group"
                        >
                          {/* Drop track from pre-snap alignment - Teal dashed, NO arrow */}
                          <line
                            x1={coords.x}
                            y1={coords.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={themeColor}
                            strokeWidth={isSelected ? '3.5' : '2.4'}
                            strokeDasharray="5 3"
                          />
                          {/* Roamer Patrol Sweep Arc across middle third */}
                          <path
                            d="M 370 120 Q 500 135 630 120"
                            fill="none"
                            stroke={themeColor}
                            strokeWidth={isSelected ? '2.8' : '2'}
                            strokeDasharray="4 2"
                          />
                          <circle cx="370" cy="120" r="4.5" fill={themeColor} />
                          <circle cx="630" cy="120" r="4.5" fill={themeColor} />
                          {/* Landmark Center Node */}
                          <circle
                            cx={target.x}
                            cy={target.y}
                            r={isSelected ? '9' : '7'}
                            fill="#0A1820"
                            stroke={themeColor}
                            strokeWidth="2.5"
                          />
                          <circle cx={target.x} cy={target.y} r="3.5" fill={themeColor} />
                        </g>
                      );
                    }

                    // MIKE: Shared Black Responsibility or Threat Matching in Heavy 2TE
                    if (assign.playerId === 'MIKE') {
                      if (isBlitzing) return null;
                      const isMikeInSpy = backfieldFlow === 'weak' && offenseFormation !== 'heavy_2te';
                      if (isMikeInSpy) {
                        return (
                          <g
                            key={`cov-${assign.playerId}`}
                            onClick={() => setSelectedPlayerId(p.id)}
                            className="cursor-pointer group"
                          >
                            <line
                              x1={coords.x}
                              y1={coords.y}
                              x2={target.x}
                              y2={target.y}
                              stroke={themeColor}
                              strokeWidth={isSelected ? '3.5' : '2.4'}
                              strokeDasharray="5 3"
                            />
                            <ellipse
                              cx={target.x}
                              cy={target.y}
                              rx="35"
                              ry="18"
                              fill={themeColor}
                              fillOpacity="0.12"
                              stroke={themeColor}
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={target.x}
                              cy={target.y}
                              r={isSelected ? '8' : '6'}
                              fill="#0A1820"
                              stroke={themeColor}
                              strokeWidth="2"
                            />
                            <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                          </g>
                        );
                      } else {
                        return (
                          <g
                            key={`cov-${assign.playerId}`}
                            onClick={() => setSelectedPlayerId(p.id)}
                            className="cursor-pointer group"
                          >
                            <line
                              x1={coords.x}
                              y1={coords.y}
                              x2={target.x}
                              y2={target.y}
                              stroke={themeColor}
                              strokeWidth={isSelected ? '3.5' : '2.4'}
                              strokeDasharray="5 3"
                            />
                            <circle cx={target.x} cy={target.y} r="7" fill="none" stroke={themeColor} strokeWidth="2" />
                            <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                          </g>
                        );
                      }
                    }

                    // WILL: Attached to Fullback (FB) in Base I-Formation / Threat Matching (Weak flow = #3 FB, Strong flow = #4 FB)
                    if (assign.playerId === 'WILL') {
                      if (isBlitzing) return null;
                      return (
                        <g
                          key={`cov-${assign.playerId}`}
                          onClick={() => setSelectedPlayerId(p.id)}
                          className="cursor-pointer group"
                        >
                          <line
                            x1={coords.x}
                            y1={coords.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={themeColor}
                            strokeWidth={isSelected ? '3.5' : '2.4'}
                            strokeDasharray="5 3"
                          />
                          <circle cx={target.x} cy={target.y} r="7" fill="none" stroke={themeColor} strokeWidth="2" />
                          <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                        </g>
                      );
                    }

                    // CORNERBACKS: Normal Black (7 Yds Off Inside Leverage) vs Jam (On LOS Hand Fight)
                    if (assign.playerId === 'LCB' || assign.playerId === 'RCB') {
                      if (isBlitzing) return null;

                      if (isJamCall) {
                        return (
                          <g
                            key={`cov-${assign.playerId}`}
                            onClick={() => setSelectedPlayerId(p.id)}
                            className="cursor-pointer group"
                          >
                            <line
                              x1={coords.x}
                              y1={coords.y}
                              x2={target.x}
                              y2={target.y}
                              stroke={themeColor}
                              strokeWidth={isSelected ? '4' : '3'}
                              strokeDasharray="5 3"
                            />
                            {/* Jam Hand-Fight Reticle at LOS */}
                            <circle cx={target.x} cy={target.y} r="8" fill="#EF4444" fillOpacity="0.25" stroke="#F87171" strokeWidth="2" />
                            <circle cx={target.x} cy={target.y} r="3" fill="#FFFFFF" />
                          </g>
                        );
                      } else {
                        return (
                          <g
                            key={`cov-${assign.playerId}`}
                            onClick={() => setSelectedPlayerId(p.id)}
                            className="cursor-pointer group"
                          >
                            <line
                              x1={coords.x}
                              y1={coords.y}
                              x2={target.x}
                              y2={target.y}
                              stroke={themeColor}
                              strokeWidth={isSelected ? '3.5' : '2.4'}
                              strokeDasharray="5 3"
                            />
                            <circle cx={target.x} cy={target.y} r="7" fill="none" stroke={themeColor} strokeWidth="2" />
                            <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                          </g>
                        );
                      }
                    }

                    // SAM: "Sam does not have Strong Hook, he has Y."
                    if (assign.playerId === 'SAM') {
                      if (isBlitzing) return null;
                      return (
                        <g
                          key={`cov-${assign.playerId}`}
                          onClick={() => setSelectedPlayerId(p.id)}
                          className="cursor-pointer group"
                        >
                          <line
                            x1={coords.x}
                            y1={coords.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={themeColor}
                            strokeWidth={isSelected ? '3.5' : '2.4'}
                            strokeDasharray="5 3"
                          />
                          <circle cx={target.x} cy={target.y} r="7" fill="none" stroke={themeColor} strokeWidth="2" />
                          <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                        </g>
                      );
                    }

                    // ROVER: "Rov will have the 2nd threat, which would be the TB if the TB goes to the weak side."
                    if (assign.playerId === 'ROV') {
                      if (isBlitzing) return null;
                      return (
                        <g
                          key={`cov-${assign.playerId}`}
                          onClick={() => setSelectedPlayerId(p.id)}
                          className="cursor-pointer group"
                        >
                          <line
                            x1={coords.x}
                            y1={coords.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={themeColor}
                            strokeWidth={isSelected ? '3.5' : '2.4'}
                            strokeDasharray="5 3"
                          />
                          <circle cx={target.x} cy={target.y} r="7" fill="none" stroke={themeColor} strokeWidth="2" />
                          <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                        </g>
                      );
                    }

                    // STRONG SAFETY: "SS will have Hole/Robber/Spy"
                    if (assign.playerId === 'SS') {
                      if (isBlitzing) return null;
                      return (
                        <g
                          key={`cov-${assign.playerId}`}
                          onClick={() => setSelectedPlayerId(p.id)}
                          className="cursor-pointer group"
                        >
                          <line
                            x1={coords.x}
                            y1={coords.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={themeColor}
                            strokeWidth={isSelected ? '3.5' : '2.4'}
                            strokeDasharray="5 3"
                          />
                          {/* Low Hole Robber Patrol Ellipse */}
                          <ellipse
                            cx={target.x}
                            cy={target.y}
                            rx="28"
                            ry="16"
                            fill={themeColor}
                            fillOpacity="0.12"
                            stroke={themeColor}
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />
                          <circle
                            cx={target.x}
                            cy={target.y}
                            r={isSelected ? '8' : '6'}
                            fill="#0A1820"
                            stroke={themeColor}
                            strokeWidth="2"
                          />
                          <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                        </g>
                      );
                    }

                    // Default Man-to-Man Lock
                    if (isBlitzing) return null;

                    return (
                      <g
                        key={`cov-${assign.playerId}`}
                        onClick={() => setSelectedPlayerId(p.id)}
                        className="cursor-pointer group"
                      >
                        <line
                          x1={coords.x}
                          y1={coords.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={themeColor}
                          strokeWidth={isSelected ? '3.5' : '2.4'}
                          strokeDasharray="5 3"
                        />
                        <circle
                          cx={target.x}
                          cy={target.y}
                          r="7"
                          fill="none"
                          stroke={themeColor}
                          strokeWidth="2"
                        />
                        <circle cx={target.x} cy={target.y} r="3" fill={themeColor} />
                      </g>
                    );
                  }
                  // 2. GREEN (Cover 3 Sky) & BLUE (Cover 2 Zone) DROPS - Teal dashed lines with NO arrow
                  if (isBlitzing) return null;
                  const themeColor = '#2DD4BF'; // Teal for pass assignments
                  const dropTarget = assign.dropTarget;
                  const controlPoint = assign.controlPoint || {
                    x: (coords.x + dropTarget.x) / 2,
                    y: (coords.y + dropTarget.y) / 2,
                  };

                  const badgeY = dropTarget.y > 220 ? dropTarget.y - 18 : dropTarget.y + 16;

                  return (
                    <g
                      key={`cov-${assign.playerId}`}
                      onClick={() => setSelectedPlayerId(p.id)}
                      className="cursor-pointer group"
                    >
                      {/* Curved drop trajectory path from pre-snap alignment to landmark - Teal dashed, NO arrow */}
                      <path
                        d={`M ${coords.x} ${coords.y} Q ${controlPoint.x} ${controlPoint.y} ${dropTarget.x} ${dropTarget.y}`}
                        fill="none"
                        stroke={themeColor}
                        strokeWidth={isSelected ? '3.6' : '2.4'}
                        strokeDasharray="5 3"
                        filter={isSelected ? 'url(#covDropGlow)' : undefined}
                      />

                      {/* Landmark Drop Ring & Center Node */}
                      <circle
                        cx={dropTarget.x}
                        cy={dropTarget.y}
                        r={isSelected ? '9' : '6.5'}
                        fill="#061219"
                        stroke={themeColor}
                        strokeWidth={isSelected ? '2.5' : '1.8'}
                      />
                      <circle
                        cx={dropTarget.x}
                        cy={dropTarget.y}
                        r="3.5"
                        fill={themeColor}
                      />

                      {/* Tactical Landmark Label Badge (only for Secondary DBs, hidden for LBs and DL) */}
                      {assign.group === 'DB' && (
                        <g transform={`translate(${dropTarget.x}, ${badgeY})`}>
                          <rect
                            x="-72"
                            y="-9"
                            width="144"
                            height="18"
                            rx="4"
                            fill="#040F16"
                            fillOpacity="0.95"
                            stroke={themeColor}
                            strokeWidth={isSelected ? '1.8' : '1'}
                          />
                          <text
                            x="0"
                            y="3.5"
                            fill="#FFFFFF"
                            fontSize="7.8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {assign.playerId}: {assign.landmarkLabel.split('(')[0].trim()} ({assign.depthYards})
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Front 7 Gap Assignment Arrows (DL + Linebackers: Sam, Rover, Will, Mike) - Orange lines with arrow and target circle at heel depth */}
            {showPressureArrows &&
              activeFrontGapArrows.map((arrow, idx) => {
                const p = DEFENSE_PLAYERS.find((d) => d.id === arrow.playerId);
                if (!p) return null;
                // If this player is blitzing, let the dedicated blitz arrow render instead
                if (blitzCall === arrow.playerId) return null;
                const coords = getPlayerCoords(p);
                const isSelected = selectedPlayerId === p.id;
                return (
                  <g
                    key={`front-gap-arrow-${idx}`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedPlayerId(p.id)}
                  >
                    {/* Orange run responsibility line with arrow */}
                    <line
                      x1={coords.x}
                      y1={coords.y}
                      x2={arrow.arrowEnd.x}
                      y2={arrow.arrowEnd.y}
                      stroke={arrow.stroke}
                      strokeWidth={isSelected ? '3.4' : '2.6'}
                      strokeDasharray={arrow.type === 'dl' ? '4 2' : '5 2.5'}
                      markerEnd={arrow.markerEnd}
                    />
                    {/* Target circle just behind the OL at "heel depth" of the LOS (y=418) */}
                    <circle
                      cx={arrow.arrowEnd.x}
                      cy={arrow.arrowEnd.y}
                      r={isSelected ? '6.5' : '5'}
                      fill="#061219"
                      stroke="#F59E0B"
                      strokeWidth={isSelected ? '2.4' : '1.8'}
                    />
                    <circle
                      cx={arrow.arrowEnd.x}
                      cy={arrow.arrowEnd.y}
                      r="2"
                      fill="#F59E0B"
                    />
                  </g>
                );
              })}

            {/* Linebacker Blitz Arrow (Mike, Will, Sam, Rover) - Clean arrow without text label */}
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

                  {/* Pass Assignment Badge on Playart - ONLY for Secondary DBs (removed for LB & DL) */}
                  {showSecondaryBadges && !player.isDefensiveLine && !isSamOrRover && !isMikeOrWill && (
                    <g>
                      {(() => {
                        const passText = getPassAssignmentLabel(player);
                        const badgeWidth = Math.max(68, passText.length * 5.6 + 12);
                        return (
                          <>
                            <rect
                              x={coords.x - badgeWidth / 2}
                              y={coords.y - 31}
                              width={badgeWidth}
                              height="13.5"
                              rx="3.5"
                              fill="#05131C"
                              fillOpacity="0.95"
                              stroke="#0D9488"
                              strokeWidth="1"
                            />
                            <text
                              x={coords.x}
                              y={coords.y - 21.5}
                              fill="#5EEAD4"
                              fontSize="7.5"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {passText}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* Sequential Tech / Depth Tag indicator - ONLY for Secondary DBs when enabled (removed for LB & DL) */}
                  {showTechniqueOverlay && !player.isDefensiveLine && !isSamOrRover && !isMikeOrWill && (
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
                          : player.sequentialTechCode || `${coords.depthYards} yd`}
                      </text>
                    </g>
                  )}

                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* COVERAGE DROPS & ASSIGNMENTS BREAKDOWN (LBs & DBs) */}
      <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 lg:p-6 shadow-2xl space-y-4">
        {/* Header & Quick Coverage Scheme Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#162A33] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: activeCoverage.color }}
              />
              <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: activeCoverage.color }}>
                Defensive Secondary & Linebacker Shell
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-display flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-teal-400" />
              Coverage Drops & Assignments Breakdown
            </h3>
            <p className="text-xs text-slate-300 font-mono flex flex-wrap items-center gap-2 pt-0.5">
              <span>Active Call: <strong className="text-white uppercase">{activeCoverage.name}</strong></span>
              <span>·</span>
              <span className="text-amber-300 font-bold">Signal: {coverageScheme === 'black' && isJamCall ? '🙌 Two hands up palms out, pushing motion ("JAM" Call)' : activeCoverage.handSignal}</span>
            </p>
          </div>

          {/* Quick Coverage Buttons (GREEN, BLUE, BLACK) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCoverageScheme('green')}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                coverageScheme === 'green'
                  ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-400/50 shadow-md shadow-emerald-950/60'
                  : 'border-[#162A33] bg-[#09151D] text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>👇 GREEN</span>
              <span className="text-[10px] opacity-80">(Cover 3 Sky)</span>
            </button>
            <button
              onClick={() => setCoverageScheme('blue')}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                coverageScheme === 'blue'
                  ? 'border-sky-400 bg-sky-950/80 text-sky-300 ring-1 ring-sky-400/50 shadow-md shadow-sky-950/60'
                  : 'border-[#162A33] bg-[#09151D] text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>👆 BLUE</span>
              <span className="text-[10px] opacity-80">(Cover 2 Zone)</span>
            </button>
            <button
              onClick={() => setCoverageScheme('black')}
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                coverageScheme === 'black'
                  ? 'border-amber-400 bg-amber-950/80 text-amber-300 ring-1 ring-amber-400/50 shadow-md shadow-amber-950/60'
                  : 'border-[#162A33] bg-[#09151D] text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>👕 BLACK</span>
              <span className="text-[10px] opacity-80">(Cover 1 Man)</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#050C10] border border-[#162A33]">
            <button
              onClick={() => setCoverageRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                coverageRoleFilter === 'ALL'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Coverage Defenders (8)
            </button>
            <button
              onClick={() => setCoverageRoleFilter('LB')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                coverageRoleFilter === 'LB'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Linebackers (4: SAM, MIKE, WILL, ROV)
            </button>
            <button
              onClick={() => setCoverageRoleFilter('DB')}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                coverageRoleFilter === 'DB'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Defensive Backs (4: LCB, RCB, FS, SS)
            </button>
          </div>

          <span className="text-slate-400 font-mono text-[11px] hidden sm:block">
            Click any defender to highlight drop & landmark on the chalkboard
          </span>
        </div>

        {/* 8 Defender Assignment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {activeCoverage.playerAssignments
            .filter((assign) => coverageRoleFilter === 'ALL' || assign.group === coverageRoleFilter)
            .map((assign) => {
              const p = DEFENSE_PLAYERS.find((d) => d.id === assign.playerId);
              if (!p) return null;
              const isSelected = selectedPlayerId === p.id;
              const isBlitzing = blitzCall === p.id;

              return (
                <div
                  key={assign.playerId}
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={`p-4 rounded-xl border text-xs space-y-3 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-400 bg-[#0C1E29] ring-2 ring-teal-400/40 shadow-xl'
                      : 'border-[#162A33] bg-[#09151D] hover:border-slate-600 hover:bg-[#0B1A24]'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Card Top: Player ID badge, Group, Full Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs border ${
                            isSelected
                              ? 'bg-teal-400 text-slate-950 border-teal-300'
                              : 'bg-[#050C10] text-teal-300 border-[#183644]'
                          }`}
                        >
                          {assign.playerId}
                        </span>
                        <div>
                          <span className="font-bold text-white text-xs block leading-tight font-display">
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {assign.group === 'DB' ? 'Defensive Back' : 'Linebacker'}
                          </span>
                        </div>
                      </div>

                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
                        style={{
                          backgroundColor: `${activeCoverage.color}15`,
                          borderColor: `${activeCoverage.color}40`,
                          color: activeCoverage.color,
                        }}
                      >
                        {assign.group}
                      </span>
                    </div>

                    {/* Dynamic Role / Assignment Name for Black Coverage */}
                    {(() => {
                      let displayRole = assign.roleName;
                      let displayLandmark = assign.landmarkLabel;
                      let displayDepth = assign.depthYards;
                      let displayTech = assign.technique;
                      let displayCoaching = assign.coachingPoint;

                      if (coverageScheme === 'black') {
                        if (offenseFormation === 'heavy_2te') {
                          // Double Tight End Heavy Outside-In Threat Matching
                          if (assign.playerId === 'LCB') {
                            displayRole = 'Man on #1 Threat to Left (X)';
                            displayLandmark = '🔒 #1 Threat: X (Boundary WR)';
                            displayDepth = isJamCall ? 'LOS (Jam)' : '7 Yds Off';
                            displayTech = isJamCall ? 'Jam Press-Man @ LOS' : 'Off-Man (Inside Leverage)';
                            displayCoaching = 'Threat Matching vs Heavy 2-TE: LCB has #1 threat (X) to his side.';
                          } else if (assign.playerId === 'ROV') {
                            displayRole = 'Man on #2 Threat to Left (Y1)';
                            displayLandmark = '🔒 #2 Threat: Y1 (Left TE)';
                            displayDepth = '2 Yds (LOS Edge)';
                            displayTech = 'Threat-Based Man: Rover locks #2 threat (Y1 TE)';
                            displayCoaching = 'Threat Matching vs Heavy 2-TE: Rover has #2 threat (Y1) to his side.';
                          } else if (assign.playerId === 'WILL') {
                            displayRole = 'Man on #3 Threat (TB)';
                            displayLandmark = '🔒 #3 Threat: TB (Tailback)';
                            displayDepth = '4 Yds (Flow)';
                            displayTech = 'Threat-Based Man: Will covers #3 threat (TB)';
                            displayCoaching = 'Threat Matching vs Heavy 2-TE: Will has #3 threat (TB).';
                          } else if (assign.playerId === 'RCB') {
                            displayRole = 'Man on #1 Threat to Right (Y2)';
                            displayLandmark = '🔒 #1 Threat: Y2 (Right TE)';
                            displayDepth = isJamCall ? 'LOS (Jam)' : '7 Yds Off';
                            displayTech = isJamCall ? 'Jam Press-Man @ LOS' : 'Off-Man (Inside Leverage)';
                            displayCoaching = 'Threat Matching vs Heavy 2-TE: RCB has #1 threat to his side (Y2).';
                          } else if (assign.playerId === 'SAM') {
                            displayRole = 'Man on #2 Threat to Right (TB)';
                            displayLandmark = '🔒 #2 Threat: TB (Tailback)';
                            displayDepth = '2 Yds (Contain)';
                            displayTech = 'Threat-Based Man: Sam covers #2 threat (TB) to his side';
                            displayCoaching = 'Threat Matching vs Heavy 2-TE: Sam has #2 threat (TB) to his side.';
                          } else if (assign.playerId === 'MIKE') {
                            if (backfieldFlow === 'strong') {
                              displayRole = 'Man on #3 Threat to Right (FB)';
                              displayLandmark = '🔒 #3 Threat: FB (to his side)';
                              displayDepth = '4.5 Yds';
                              displayTech = 'Threat-Based Man: Mike has #3 threat (TB/FB) to his side';
                              displayCoaching = 'Threat Matching vs Heavy 2-TE: Mike has #3 threat (TB) to his side.';
                            } else {
                              displayRole = 'Man on #4 Threat to Left (FB)';
                              displayLandmark = '🔒 #4 Threat: FB (to Will\'s side)';
                              displayDepth = '4.5 Yds';
                              displayTech = 'Threat-Based Man: Mike has #4 threat (FB) to Will\'s side';
                              displayCoaching = 'Threat Matching vs Heavy 2-TE: Mike has #4 threat (FB) to Will\'s side.';
                            }
                          }
                        } else {
                          if (assign.playerId === 'LCB' || assign.playerId === 'RCB') {
                            if (isJamCall) {
                              displayRole = 'Jam / Press-Man on #1 WR (LOS)';
                              displayLandmark = '💥 Jam on LOS (0-1 Yd)';
                              displayDepth = 'LOS (0-1 Yd)';
                              displayTech = 'Jam Press-Man · Two hands up palms out, pushing motion at snap ➔ Inside hip lock';
                              displayCoaching = 'Jam Call: Align on the LOS. Hand fight with receiver at snap to disrupt timing, then cover inside hip tightly.';
                            } else {
                              displayRole = 'Off-Man on #1 WR (7 Yds Inside Leverage)';
                              displayLandmark = '🔒 7 Yds Off (Inside Leverage)';
                              displayDepth = '7 Yds Off';
                              displayTech = 'Off-Man Technique · 7 Yds Cushion · Inside Leverage';
                              displayCoaching = 'Normal Black: Not automatic press! Play 7 yards off with inside leverage. Do not give up slant/inside release; match vertical with cushion.';
                            }
                          } else if (assign.playerId === 'WILL') {
                            if (backfieldFlow === 'weak') {
                              displayRole = 'Man-to-Man on Weak RB (Shared Black)';
                              displayLandmark = '🔒 Weak Release RB';
                              displayDepth = '4 Yds (Flow Lock)';
                              displayTech = 'Shared Black: Back went weak ➔ Will covers in man-to-man';
                              displayCoaching = 'Will and Mike share Black responsibility. Back released to weak side ➔ Will covers stride-for-stride on swing/wheel/flare.';
                            } else {
                              displayRole = 'Underneath QB Spy / Rat in Hole';
                              displayLandmark = '🐀 QB Spy (Non-Cover LB)';
                              displayDepth = '5-7 Yds';
                              displayTech = 'Shared Black: Back went strong ➔ Will is in Spy (Non-Cover LB)';
                              displayCoaching = 'Will and Mike share Black responsibility. Back released to strong side ➔ Will is non-cover LB in Spy, robbing crossers and spying scrambles.';
                            }
                          } else if (assign.playerId === 'MIKE') {
                            if (backfieldFlow === 'strong') {
                              displayRole = 'Man-to-Man on Strong RB (Shared Black)';
                              displayLandmark = '🔒 Strong Release RB';
                              displayDepth = '4 Yds (Flow Lock)';
                              displayTech = 'Shared Black: Back went strong ➔ Mike covers in man-to-man';
                              displayCoaching = 'Will and Mike share Black responsibility. Back released to strong side ➔ Mike covers stride-for-stride on swing/wheel/flare.';
                            } else {
                              displayRole = 'Underneath QB Spy / Rat in Hole';
                              displayLandmark = '🐀 QB Spy (Non-Cover LB)';
                              displayDepth = '5-7 Yds';
                              displayTech = 'Shared Black: Back went weak ➔ Mike is in Spy (Non-Cover LB)';
                              displayCoaching = 'Will and Mike share Black responsibility. Back released to weak side ➔ Mike is non-cover LB in Spy, robbing crossers and spying scrambles.';
                            }
                          }
                        }
                      } else if (coverageScheme === 'blue') {
                        if (assign.playerId === 'LCB' || assign.playerId === 'RCB') {
                          displayRole = 'Flat Squat / Cloud (Outside Leverage)';
                          displayLandmark = '🔒 Outside Leverage · Flat (2-5 Yds)';
                          displayDepth = '5 Yds Off';
                          displayTech = 'Outside Leverage · Re-route #1 WR Inside · Flat Squat';
                          displayCoaching = 'In Cover 2 (Blue), align with OUTSIDE LEVERAGE on #1 WR. Re-route receiver inside to safety help, then squat at 2-5 yards in flat to attack perimeter throws.';
                        }
                      } else if (coverageScheme === 'green') {
                        if (assign.playerId === 'LCB' || assign.playerId === 'RCB') {
                          displayRole = 'Deep Outside 1/3 (Outside-In Leverage)';
                          displayLandmark = '🔒 Outside Leverage · Deep 1/3 Bail';
                          displayDepth = '7 Yds Off';
                          displayTech = 'Outside Leverage · 3-Step Bail · Outside-In Funnel';
                          displayCoaching = 'In Cover 3 (Green), align 7 yards off with OUTSIDE LEVERAGE. Protect the sideline, funnel routes inside to Free Safety, and bail 3 steps at snap to cap deep third.';
                        }
                      }

                      return (
                        <>
                          {/* Dual Accountability: Run Fit (Open Gap Rule) vs Pass Coverage */}
                          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-[#050C10] border border-[#162A33] text-[10px] font-mono">
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-teal-400 block text-[9px] uppercase font-bold truncate">Run Fit (Open Gap)</span>
                              <span className="font-bold text-teal-200 block truncate">
                                {getAssignedGap(p, getPlayerCoords(p))}
                              </span>
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-amber-400 block text-[9px] uppercase font-bold truncate">Pass Coverage</span>
                              <span className="font-bold text-amber-200 block truncate">
                                {coverageScheme === 'black' && offenseFormation === 'heavy_2te'
                                  ? displayLandmark.replace('🔒 ', '').replace('💥 ', '')
                                  : displayRole.split('(')[0].trim()}
                              </span>
                            </div>
                          </div>

                          <div className="p-2 rounded-lg bg-[#050C10] border border-[#162A33] space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-200">
                                {displayRole}
                              </span>
                              {isBlitzing && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700 text-[9px] font-mono font-bold">
                                  BLITZ CALL
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-teal-300 flex items-center justify-between">
                              <span>Landmark: <strong className="text-white">{displayLandmark}</strong></span>
                              <span className="text-amber-300 font-bold">{displayDepth}</span>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] leading-relaxed">
                            <div className="text-slate-300">
                              <strong className="text-slate-400 font-mono text-[10px] uppercase block">Technique:</strong>
                              {displayTech}
                            </div>
                            <div className="text-slate-300">
                              <strong className="text-slate-400 font-mono text-[10px] uppercase block">Key Read:</strong>
                              <span className="text-teal-300 font-mono text-[10px]">{assign.keyRead}</span>
                            </div>
                          </div>

                          <div className="p-2 rounded bg-black/40 border border-[#142630] text-[10.5px] text-slate-400 italic">
                            &ldquo;{displayCoaching}&rdquo;
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {/* Highlight on Chalkboard action */}
                  <div className="pt-2 border-t border-[#162A33]/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {isSelected ? '✓ Showing Drop' : 'Click to Focus'}
                    </span>
                    <button
                      type="button"
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 shadow'
                          : 'bg-[#0E222D] text-teal-300 border border-teal-500/30 hover:bg-teal-950/60'
                      }`}
                    >
                      <Target className="w-3 h-3" />
                      Highlight
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* LOWER SECTION: Player Inspector & Sequential Tech Blueprint */}
      <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-4">
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

        {/* Sequential Tech & Assignment Grid (4 Pillars: Tech, Depth, Run Fit, Pass Coverage) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

          <div className="p-3 rounded-xl bg-[#091318] border border-teal-500/30 space-y-1">
            <div className="text-[10px] font-mono text-teal-400 uppercase font-bold">★ Run Fit (Open Gap)</div>
            <div className="text-xs font-bold text-teal-200 font-mono">
              {getAssignedGap(selectedPlayer, getPlayerCoords(selectedPlayer))}
            </div>
            <div className="text-[10.5px] text-slate-400">
              {selectedPlayer.id === 'MIKE' || selectedPlayer.id === 'WILL'
                ? 'Open Gap Principle via front 3 slants'
                : selectedPlayer.isDefensiveLine
                ? 'Interior penetration / gap control'
                : 'Perimeter edge contain & alley force'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#091318] border border-amber-500/30 space-y-1">
            <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">★ Pass Coverage</div>
            <div className="text-xs font-bold text-amber-200 font-mono truncate">
              {getPassCoverageResponsibility(selectedPlayer).title}
            </div>
            <div className="text-[10.5px] text-slate-400 line-clamp-1">
              {getPassCoverageResponsibility(selectedPlayer).detail}
            </div>
          </div>
        </div>

        {/* 4 Formations Breakdown for this Player */}
        <div className="p-3.5 rounded-xl bg-[#09151E] border border-teal-500/20 text-xs space-y-2">
          <span className="font-bold text-teal-300 font-mono uppercase tracking-wider block">
            ★ 4-Formation Assignment Rules for {selectedPlayer.name}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-slate-300">
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

          {/* Quick Access to Defensive Signals & Communication */}
          <div className="rounded-2xl border border-teal-500/30 bg-[#070E13] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-display">
                  Defensive Signals & Communication
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Physical hand gestures, verbal strength calls (Rip/Liz), emergency reset (Reload!), and sideline dial cadence.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDefenseSubTab('signals')}
                className="px-4 py-2 bg-teal-400 text-slate-950 font-mono font-bold text-xs rounded-xl hover:bg-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>View Signals Tab</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* DEFENSIVE SIGNALS & COMMUNICATION DEDICATED TAB */
        <div className="space-y-6">
          {/* Signals Workspace Header */}
          <div className="rounded-2xl border border-teal-500/30 bg-[#070E13] p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#162A33] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-teal-400 font-mono text-xs font-semibold uppercase">
                  <Radio className="w-4 h-4" />
                  Sideline Communication Matrix
                </div>
                <h2 className="text-2xl font-bold text-white font-display">
                  Defensive Signals & Communication
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Physical gestures, verbal calls, and tempo reset protocols keeping all 11 defenders coordinated at high speed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenPrintModal}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold hover:bg-teal-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Signals Call Sheet
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { id: 'ALL', label: 'All Signals (14)' },
                { id: 'formations', label: 'Formations (4)' },
                { id: 'coverages', label: 'Coverages (4)' },
                { id: 'fronts', label: 'Fronts & Slants (2)' },
                { id: 'blitzes', label: 'LB Blitzes (1)' },
                { id: 'verbal', label: 'Verbal Calls & Resets (3)' },
              ].map((cat) => {
                const isSelected = signalsCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSignalsCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-400 text-slate-950 shadow-md font-extrabold'
                        : 'bg-[#09151D] text-slate-400 border border-[#162A33] hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Signals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DEFENSIVE_SIGNALS_LIST
              .filter(
                (item) => signalsCategoryFilter === 'ALL' || item.category === signalsCategoryFilter
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-3.5 flex flex-col justify-between hover:border-teal-500/40 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header: Emoji Badge + Name + Category Tag */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#162A33] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-xl shrink-0">
                          {item.iconEmoji}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-sm font-display tracking-wide">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.whoSignals}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-950/80 border border-teal-700/50 text-teal-300 shrink-0">
                        {item.categoryLabel}
                      </span>
                    </div>

                    {/* Physical Signal / Action Box */}
                    <div className="p-3 rounded-xl bg-[#0A1822] border border-amber-500/30 space-y-1">
                      <div className="text-[10.5px] font-mono font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <span>✋ Signal Gesture / Movement:</span>
                      </div>
                      <p className="text-xs text-amber-100 font-sans leading-relaxed">
                        {item.signalMotion}
                      </p>
                    </div>

                    {/* On-Field Meaning & Rules */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10.5px] font-mono text-slate-400 uppercase font-bold block">
                        On-Field Execution:
                      </span>
                      <p className="text-slate-300 text-[11.5px] leading-relaxed">
                        {item.onFieldMeaning}
                      </p>
                    </div>
                  </div>

                  {/* Coaching Rule Footer */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-[#162A33] text-[11px] text-slate-400">
                    <strong className="text-teal-300">Coaching Rule: </strong>
                    <span className="text-slate-300">{item.coachingRule}</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Sideline Cadence & Operational Protocol Card */}
          <div className="rounded-2xl border border-[#162A33] bg-[#070E13] p-5 shadow-xl space-y-3 font-mono text-xs">
            <span className="text-teal-400 font-bold uppercase tracking-wider block text-xs">
              ★ Sideline Communication Architecture & Dial Matrix:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-[11.5px]">
              <div className="p-3 rounded-xl bg-[#09151D] border border-[#162A33] space-y-1">
                <strong className="text-amber-300 block">1. Three-Part Signal Call:</strong>
                <p className="text-slate-400 font-sans">
                  The sideline signals in sequence: <strong className="text-white">Formation</strong> (fist) ➔ <strong className="text-white">Front</strong> (slant) ➔ <strong className="text-white">Coverage</strong> (sky/ground/jersey).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#09151D] border border-[#162A33] space-y-1">
                <strong className="text-teal-300 block">2. Verbal Echo & Strength:</strong>
                <p className="text-slate-400 font-sans">
                  Mike LB shouts the call to the box and immediately calls the defensive strength: <strong className="text-white">“RIP!”</strong> (Right) or <strong className="text-white">“LIZ!”</strong> (Left).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#09151D] border border-[#162A33] space-y-1">
                <strong className="text-rose-300 block">3. Emergency Reset Tempo:</strong>
                <p className="text-slate-400 font-sans">
                  If the opponent goes muddle or fast hurry-up, safeties shout <strong className="text-white">“RELOAD!”</strong> to cancel all exotic checks and snap into base alignments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
