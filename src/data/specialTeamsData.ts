export type SpecialTeamsUnitId = 'kickoff' | 'kick_return' | 'punt_coverage' | 'punt_return' | 'fg_pat' | 'fg_block';

export interface STPlayer {
  id: string;
  label: string;
  number: string;
  name: string;
  role: string;
  x: number; // 0 to 1000
  y: number; // 0 to 620
  targetX?: number; // End of initial path
  targetY?: number;
  responsibility: string;
  coachingCue: string;
  isKickerOrKey?: boolean;
}

export interface SpecialTeamsUnit {
  id: SpecialTeamsUnitId;
  name: string;
  shortName: string;
  personnelType: string;
  targetTempo: string;
  overview: string;
  schemeOptions: {
    id: string;
    label: string;
    description: string;
  }[];
  players: STPlayer[];
  rulesAndDrills: {
    title: string;
    rule: string;
  }[];
  coachingMotto: string;
}

export const SPECIAL_TEAMS_PLAYBOOK: Record<SpecialTeamsUnitId, SpecialTeamsUnit> = {
  kickoff: {
    id: 'kickoff',
    name: 'Kickoff Coverage Team',
    shortName: 'Kickoff Coverage',
    personnelType: '10 Fast Hitters + 1 Kicker',
    targetTempo: '4.1s Hangtime / Inside 20 Tackle',
    overview: 'Disciplined lane integrity is non-negotiable. 5 players to the left (L1-L5), Kicker as safety valve, 5 players to the right (R1-R5). Contain players force ball inside to wedge busters.',
    schemeOptions: [
      { id: 'middle_deep', label: 'Deep Middle Blast', description: 'Kick through the back of endzone or inside 5-yard line between hashes.' },
      { id: 'sky_right', label: 'Sky Right Hash', description: 'High hangtime drop at right 15-yard line to isolate the boundary up-man.' },
      { id: 'sky_left', label: 'Sky Left Hash', description: 'High hangtime drop at left 15-yard line with heavy L-side containment.' },
      { id: 'onside_surprise', label: 'Surprise Onside Hop', description: 'Kicker drives ball into ground at 10-yard mark for high spinning hop.' },
    ],
    coachingMotto: '“Stay in your lane, beat the block with speed and rip, fold inside-out.”',
    players: [
      { id: 'L5', label: 'L5', number: '28', name: 'Left Contain / Safety', role: 'Outside Contain', x: 120, y: 520, targetX: 160, targetY: 180, responsibility: 'Never let returner outside your outside shoulder. Force everything inside.', coachingCue: 'Squeeze the sideline alley. You are the left gatekeeper.' },
      { id: 'L4', label: 'L4', number: '33', name: 'Left Speed Fold', role: 'Speed Fold / Squeeze', x: 210, y: 520, targetX: 280, targetY: 200, responsibility: 'Sprint full speed, dip under front wall blocks, fold inside-out on ball.', coachingCue: 'Do not run past the ball. Break down at 5 yards from returner.' },
      { id: 'L3', label: 'L3', number: '44', name: 'Left Wedge Buster', role: 'Wedge Destroyer', x: 300, y: 520, targetX: 420, targetY: 220, responsibility: 'Sacrifice body to blow up the double-team wedge block. Create chaos.', coachingCue: 'Low man wins. Strike the point man with inside shoulder and rip.' },
      { id: 'L2', label: 'L2', number: '19', name: 'Left Bullet Tackler', role: 'First Contact Tackler', x: 390, y: 520, targetX: 460, targetY: 190, responsibility: 'Full speed bullet. First man down to force early cut from returner.', coachingCue: 'Head up, eyes through the belt buckle, wrap and drive.' },
      { id: 'L1', label: 'L1', number: '22', name: 'Left Center Fold', role: 'Cutback / Pursuit', x: 460, y: 520, targetX: 490, targetY: 210, responsibility: 'Attack near-side A-gap. Prevent any middle crease seam.', coachingCue: 'Stay square to the line of scrimmage while running.' },
      { id: 'K', label: 'K', number: '3', name: 'Kicker / Center Safety', role: 'Safety Valve / Kicker', x: 500, y: 560, targetX: 500, targetY: 340, responsibility: 'Drive ball deep. Trailing safety valve 15 yards behind the pack.', coachingCue: 'Follow your kick. Fill opposite cutback lane.', isKickerOrKey: true },
      { id: 'R1', label: 'R1', number: '25', name: 'Right Center Fold', role: 'Cutback / Pursuit', x: 540, y: 520, targetX: 510, targetY: 210, responsibility: 'Attack far-side A-gap. Clean up any broken tackles inside.', coachingCue: 'Inside-out pursuit angle.' },
      { id: 'R2', label: 'R2', number: '17', name: 'Right Bullet Tackler', role: 'First Contact Tackler', x: 610, y: 520, targetX: 540, targetY: 190, responsibility: 'Full speed bullet. Explode past blocker and funnel returner.', coachingCue: 'Rip through off-hand and accelerate.' },
      { id: 'R3', label: 'R3', number: '48', name: 'Right Wedge Buster', role: 'Wedge Destroyer', x: 700, y: 520, targetX: 580, targetY: 220, responsibility: 'Attack the wedge front block violently. Blow up the return lane.', coachingCue: 'Strike through center mass.' },
      { id: 'R4', label: 'R4', number: '36', name: 'Right Speed Fold', role: 'Speed Fold / Squeeze', x: 790, y: 520, targetX: 720, targetY: 200, responsibility: 'Sprint downfield, squeeze right hash, tackle returner bounce.', coachingCue: 'Maintain 5-yard separation from R5 contain.' },
      { id: 'R5', label: 'R5', number: '29', name: 'Right Contain / Safety', role: 'Outside Contain', x: 880, y: 520, targetX: 840, targetY: 180, responsibility: 'Contain right boundary. Maintain outside arm free at all times.', coachingCue: 'Sideline is your friend. Force ball back to pursuit.' },
    ],
    rulesAndDrills: [
      { title: 'The 5-Yard Breakdown Rule', rule: 'At 5 yards from the returner, decelerate into short choppy steps, widen base, and keep eyes locked on the returner’s core hips.' },
      { title: 'Lane Separation Discipline', rule: 'Never cross over two lanes. If L3 crosses in front of L2, an escape lane opens up for a 60-yard touchdown.' },
      { title: 'Wedge Busting Technique', rule: 'Wedge busters must target the thigh boards of the center blocker in a double-team to spill the ball carrier into the open.' },
    ],
  },
  kick_return: {
    id: 'kick_return',
    name: 'Kickoff Return Team',
    shortName: 'Kickoff Return',
    personnelType: '5 Front Wall + 3 Wedge + 1 Off-Back + 2 Deep Returners',
    targetTempo: 'Explosive 25+ Yard Starting Field Position',
    overview: 'Our return philosophy prioritizes creating a concrete wall on either the sideline or down the middle seam. Front line drops 15 yards at the kick to form the lead barrier.',
    schemeOptions: [
      { id: 'middle_wedge', label: 'Middle Wedge Power', description: 'Double team center busters, returner explodes between the hashes.' },
      { id: 'sideline_wall_rt', label: 'Sideline Wall Right', description: 'Seal pursuit inside, returner bounces behind 4-man convoy to right sideline.' },
      { id: 'sideline_wall_lt', label: 'Sideline Wall Left', description: 'Seal pursuit right, returner bounces behind 4-man convoy to left sideline.' },
      { id: 'reverse_trick', label: 'Double Returner Reverse', description: 'Right returner catches, angles left, hands off on end-around reverse.' },
    ],
    coachingMotto: '“Catch with your hands, hit the seam with zero hesitation, one cut and vertical.”',
    players: [
      { id: 'FL1', label: 'FL1', number: '72', name: 'Front Left End', role: 'Front Wall Left', x: 200, y: 350, targetX: 250, targetY: 420, responsibility: 'Drop 12 yards on kick flight, turn and kick out L5 contain.', coachingCue: 'Get depth first, keep eyes on kicker flight.' },
      { id: 'FL2', label: 'FL2', number: '75', name: 'Front Left Tackle', role: 'Front Wall Left-Center', x: 350, y: 350, targetX: 380, targetY: 420, responsibility: 'Drop and seal L4/L3 pursuit inside.', coachingCue: 'Never block in the back; maintain high hands.' },
      { id: 'FL3', label: 'FL3', number: '50', name: 'Front Center', role: 'Front Wall Center', x: 500, y: 350, targetX: 500, targetY: 430, responsibility: 'Drop and neutralize the bullet tackler.', coachingCue: 'Square shoulders, establish inside leverage.' },
      { id: 'FL4', label: 'FL4', number: '78', name: 'Front Right Tackle', role: 'Front Wall Right-Center', x: 650, y: 350, targetX: 620, targetY: 420, responsibility: 'Drop and seal R4/R3 pursuit inside.', coachingCue: 'Drive your feet through contact.' },
      { id: 'FL5', label: 'FL5', number: '79', name: 'Front Right End', role: 'Front Wall Right', x: 800, y: 350, targetX: 750, targetY: 420, responsibility: 'Drop 12 yards on kick, kick out R5 contain.', coachingCue: 'Do not let R5 pin you inside.' },
      { id: 'W1', label: 'W1', number: '42', name: 'Left Wedge Back', role: 'Wedge Captain', x: 420, y: 240, targetX: 450, targetY: 340, responsibility: 'Set wedge apex at 25-yard line. Double team first pursuit.', coachingCue: 'Lock shoulder-to-shoulder with center wedge.' },
      { id: 'W2', label: 'W2', number: '46', name: 'Center Wedge Back', role: 'Wedge Anchor', x: 500, y: 240, targetX: 500, targetY: 330, responsibility: 'Center anchor. Strike downhill into pursuit throat.', coachingCue: 'Low pad level, stay locked.' },
      { id: 'W3', label: 'W3', number: '45', name: 'Right Wedge Back', role: 'Wedge Wing', x: 580, y: 240, targetX: 550, targetY: 340, responsibility: 'Right wedge wing. Seal right A/B gap pursuit.', coachingCue: 'Maintain tight contact with center.' },
      { id: 'FB', label: 'FB', number: '34', name: 'Lead Off-Back / Fullback', role: 'Lead Blocker', x: 500, y: 150, targetX: 510, targetY: 260, responsibility: 'Lead through designated hole. Erase the first off-color jersey.', coachingCue: 'Be the bulldozer for the returner.' },
      { id: 'RTR1', label: 'R1', number: '2', name: 'Deep Returner (Primary)', role: 'Primary Returner', x: 420, y: 80, targetX: 480, targetY: 280, responsibility: 'Field kick cleanly. Communicate “YOU! YOU!” or “MINE! MINE!”.', coachingCue: 'Catch at eye level, accelerate through seam.', isKickerOrKey: true },
      { id: 'RTR2', label: 'R2', number: '5', name: 'Off Returner / Decoy', role: 'Off Returner / Lead Block', x: 580, y: 80, targetX: 540, targetY: 240, responsibility: 'If not fielding, sprint across and lead block for primary returner.', coachingCue: 'Clear the first free man.' },
    ],
    rulesAndDrills: [
      { title: 'The 10-Yard Catch Decider', rule: 'If kick is 9+ yards deep in endzone, take a knee for touchback. If caught on the run at 5 yards or closer, return immediately.' },
      { title: 'No Block in the Back Principle', rule: 'Only initiate contact when you see the chest of the defender. If you see the jersey number on their back, let them pass.' },
    ],
  },
  punt_coverage: {
    id: 'punt_coverage',
    name: 'Punt Team (Shield & Spread Punt)',
    shortName: 'Punt Coverage',
    personnelType: 'Snapper + 4 Linemen + 2 Gunners + 3 Shield + Punter',
    targetTempo: 'Snap to Kick: Under 2.0s / 45+ Yard Net',
    overview: 'The most critical play in football. A blocked punt swings win probability by 40%. We prioritize 100% protection first, then release into assigned coverage lanes.',
    schemeOptions: [
      { id: 'shield_base', label: '3-Man Shield Punt', description: 'Modern 3-man shield standing 7 yards deep behind line, giving maximum protection.' },
      { id: 'traditional_spread', label: 'Traditional Spread Punt', description: 'Pro-style spread alignment with personal protector and 2 tight ends.' },
      { id: 'rugby_roll_rt', label: 'Rugby Rollout Right', description: 'Punter takes 3 steps to the right on rollout, pinning coverage toward right sideline.' },
      { id: 'fake_jump_pass', label: 'Fake Punt: Up-Back Direct Snap', description: 'Direct snap to middle shield back who plunges forward for 3 yards.' },
    ],
    coachingMotto: '“Protection first, coverage second. Nobody touches our punter.”',
    players: [
      { id: 'LS', label: 'LS', number: '60', name: 'Long Snapper', role: 'Long Snapper (Protected)', x: 500, y: 390, targetX: 500, targetY: 200, responsibility: 'Accurate 14-yard snap to punter’s right hip in under 0.75 seconds. Head up rule.', coachingCue: 'Snap first, pick head up, release down middle lane.', isKickerOrKey: true },
      { id: 'LG', label: 'LG', number: '64', name: 'Left Guard', role: 'Interior Protection', x: 440, y: 390, targetX: 430, targetY: 230, responsibility: 'Lock inside foot with Snapper. Block inside gap first, then release.', coachingCue: 'Step inside, punch, release downfield.' },
      { id: 'RG', label: 'RG', number: '68', name: 'Right Guard', role: 'Interior Protection', x: 560, y: 390, targetX: 570, targetY: 230, responsibility: 'Lock inside foot with Snapper. Block inside gap first, release downfield.', coachingCue: 'Step inside, punch, release downfield.' },
      { id: 'LT', label: 'LT', number: '73', name: 'Left Tackle', role: 'Tackle Protection', x: 380, y: 390, targetX: 370, targetY: 220, responsibility: 'Block outside B-gap rusher, release into left alley.', coachingCue: 'Do not lunge; stay balanced.' },
      { id: 'RT', label: 'RT', number: '76', name: 'Right Tackle', role: 'Tackle Protection', x: 620, y: 390, targetX: 630, targetY: 220, responsibility: 'Block outside B-gap rusher, release into right alley.', coachingCue: 'Do not lunge; stay balanced.' },
      { id: 'GL', label: 'GL', number: '11', name: 'Left Gunner', role: 'Gunner (Speed Release)', x: 160, y: 390, targetX: 200, targetY: 100, responsibility: 'Beat jam with violent hand swipe. Sprint full speed to down ball inside 5-yard line.', coachingCue: 'Dip and rip, never get forced out of bounds.' },
      { id: 'GR', label: 'GR', number: '14', name: 'Right Gunner', role: 'Gunner (Speed Release)', x: 840, y: 390, targetX: 800, targetY: 100, responsibility: 'Beat jam with violent hand swipe. First to arrive at returner.', coachingCue: 'Force fair catch or pin at goal line.' },
      { id: 'S1', label: 'S1', number: '47', name: 'Left Shield Back', role: 'Shield Wall', x: 440, y: 460, targetX: 430, targetY: 270, responsibility: 'Set up 7 yards deep. Absorb any A/B gap rushers through contact.', coachingCue: 'Wall up shoulder-to-shoulder, eyes on rushers.' },
      { id: 'S2', label: 'S2', number: '49', name: 'Center Shield Back (PP)', role: 'Personal Protector', x: 500, y: 465, targetX: 500, targetY: 260, responsibility: 'Shield Captain. Call protection cadence, block first rusher inside.', coachingCue: 'Direct traffic, absorb bull rush.' },
      { id: 'S3', label: 'S3', number: '52', name: 'Right Shield Back', role: 'Shield Wall', x: 560, y: 460, targetX: 570, targetY: 270, responsibility: 'Set up 7 yards deep. Absorb any right-side edge rusher.', coachingCue: 'Do not back up into punter launch point.' },
      { id: 'P', label: 'P', number: '7', name: 'Punter', role: 'Punter (14 Yards Deep)', x: 500, y: 530, targetX: 500, targetY: 480, responsibility: 'Receive snap at 14 yards depth. 2-step punt with 4.3+ second hangtime.', coachingCue: 'Drop ball flat, follow through straight up.', isKickerOrKey: true },
    ],
    rulesAndDrills: [
      { title: 'The 2.0-Second Clock', rule: 'Snap must take 0.70-0.75s; punter get-off must take 1.25s. Total time from snap to foot contact cannot exceed 2.00s or kick is vulnerable to block.' },
      { title: 'Shield Alignment Discipline', rule: 'Shield backs stand with heels at 7 yards depth. If they set up at 5 yards, punter’s kick trajectory can strike them in the helmet.' },
    ],
  },
  punt_return: {
    id: 'punt_return',
    name: 'Punt Return & Block Packages',
    shortName: 'Punt Return / Block',
    personnelType: 'Rush Linemen + Jammers + Returner',
    targetTempo: 'Instant Momentum Shift / Touchdown or Block',
    overview: 'Dual threat unit: can dial up an 8-man all-out punt block or execute a precision sideline wall return while holding up gunners.',
    schemeOptions: [
      { id: 'safe_return', label: 'Safe / Fair Catch Hold-Up', description: 'Double jam gunners, front line plays safe hold-up, guarantee clean fair catch.' },
      { id: 'wall_right', label: 'Sideline Wall Right', description: 'Left jammer forces gunner inside, front linemen peel back to form wall along right numbers.' },
      { id: 'all_out_block', label: '8-Man Max Pressure Block', description: 'Overload both A-gaps and edge. Lay out across punter launch point.' },
    ],
    coachingMotto: '“Gunners cannot touch our returner. When the ball is in the air, you are the wall.”',
    players: [
      { id: 'J1', label: 'J1', number: '21', name: 'Left Jammer', role: 'Gunner Jammer', x: 170, y: 380, targetX: 180, targetY: 260, responsibility: 'Physical press-jam on left gunner. Mirror his feet, do not let him release clean.', coachingCue: 'Hands on chest plate, stay in front.' },
      { id: 'J2', label: 'J2', number: '24', name: 'Right Jammer', role: 'Gunner Jammer', x: 830, y: 380, targetX: 820, targetY: 260, responsibility: 'Physical press-jam on right gunner. Wash him toward sideline.', coachingCue: 'Do not let gunner get inside leverage.' },
      { id: 'B1', label: 'B1', number: '90', name: 'Nose Rusher', role: 'A-Gap Rusher', x: 480, y: 380, targetX: 490, targetY: 450, responsibility: 'Attack the A-gap between Snapper and Guard. Push shield back.', coachingCue: 'Drive through center.' },
      { id: 'B2', label: 'B2', number: '92', name: 'Right Guard Rusher', role: 'A-Gap Twist', x: 520, y: 380, targetX: 510, targetY: 450, responsibility: 'Twist behind Nose into shield crease.', coachingCue: 'Skinny through the crease.' },
      { id: 'B3', label: 'B3', number: '55', name: 'Left Edge Rusher', role: 'Edge Pressure', x: 360, y: 380, targetX: 420, targetY: 480, responsibility: 'Sprint around left tackle. Target the spot 3 yards in front of punter.', coachingCue: 'Lay out flat across the punter’s foot.' },
      { id: 'B4', label: 'B4', number: '58', name: 'Right Edge Rusher', role: 'Edge Pressure', x: 640, y: 380, targetX: 580, targetY: 480, responsibility: 'Speed rush outside right tackle. Dive horizontally across launch point.', coachingCue: 'Eyes on the ball, hands extended.' },
      { id: 'H1', label: 'H1', number: '31', name: 'Left Hold-Up', role: 'Lineman Hold-Up', x: 420, y: 380, targetX: 410, targetY: 300, responsibility: 'Engage tackle on snap. Delay his release downfield for 2 seconds.', coachingCue: 'Strike and lock out, do not allow free run.' },
      { id: 'H2', label: 'H2', number: '35', name: 'Right Hold-Up', role: 'Lineman Hold-Up', x: 580, y: 380, targetX: 590, targetY: 300, responsibility: 'Engage guard on snap. Delay release downfield.', coachingCue: 'Hold your ground.' },
      { id: 'W1', label: 'W1', number: '40', name: 'Wall Captain Left', role: 'Wall Setter', x: 320, y: 280, targetX: 680, targetY: 200, responsibility: 'Peel back 15 yards on punt, set up wall for returner.', coachingCue: 'Call out “WALL! WALL!” and seal pursuit.' },
      { id: 'W2', label: 'W2', number: '41', name: 'Wall Captain Right', role: 'Wall Setter', x: 680, y: 280, targetX: 720, targetY: 200, responsibility: 'Lead blocker in front of returner down the right sideline.', coachingCue: 'Block first pursuit jersey.' },
      { id: 'PR', label: 'PR', number: '1', name: 'Punt Returner', role: 'Elite Return Specialist', x: 500, y: 80, targetX: 680, targetY: 340, responsibility: 'Judge flight instantly. Call “POISON!” if bounce. Fair catch or explosive cut.', coachingCue: 'Catch with elbows in, tuck immediately.', isKickerOrKey: true },
    ],
    rulesAndDrills: [
      { title: 'The “Peter / Poison” Call', rule: 'If the punt is short or bouncing, returner screams “PETER! PETER!” or “POISON!” — all 10 teammates turn and sprint away from the ball to prevent a touched muff.' },
      { title: 'Block Angle: Spot, Not Punter', rule: 'Rushers must aim for the launch spot 2 yards in front of the punter. Hitting the punter’s body is a 15-yard roughing penalty.' },
    ],
  },
  fg_pat: {
    id: 'fg_pat',
    name: 'Field Goal & Extra Point (PAT)',
    shortName: 'FG / PAT Protection',
    personnelType: '9 Heavy Linemen & Wings + Holder + Kicker',
    targetTempo: 'Snap to Kick: 1.25 - 1.30s Maximum',
    overview: 'Unforgiving precision. A 9-man protection line locks down inside gaps with interlocking feet and violent low strikes. The ball is kicked in under 1.30 seconds.',
    schemeOptions: [
      { id: 'base_pat', label: 'Base Field Goal / PAT', description: 'Standard locked protection. Low pad level, zero interior penetration.' },
      { id: 'fake_jump', label: 'Fake FG: Jump Pass to Wing', description: 'Holder catches snap, pops up, flips jump pass over blitz to Right Wing.' },
      { id: 'fake_holder_roll', label: 'Fake FG: Holder Rollout Option', description: 'Holder rolls right with Kicker trailing as pitch option.' },
    ],
    coachingMotto: '“Lock toes, strike low, protect inside out. No penetration through the seams.”',
    players: [
      { id: 'LW', label: 'LW', number: '81', name: 'Left Wing', role: 'Edge Protection', x: 300, y: 390, targetX: 290, targetY: 395, responsibility: 'Step inside with right foot, protect C-to-D gap, punch edge rusher.', coachingCue: 'Do not allow rusher to turn corner inside.' },
      { id: 'LE', label: 'LE', number: '85', name: 'Left End / TE', role: 'Tight Protection', x: 350, y: 390, targetX: 345, targetY: 395, responsibility: 'Lock inside foot with LT. Protect B-to-C gap seam.', coachingCue: 'Stay low, anchor strong.' },
      { id: 'LT', label: 'LT', number: '71', name: 'Left Tackle', role: 'Tackle Protection', x: 400, y: 390, targetX: 395, targetY: 395, responsibility: 'Lock foot with LG. Squeeze any interior rush.', coachingCue: 'Zero backward give.' },
      { id: 'LG', label: 'LG', number: '66', name: 'Left Guard', role: 'Guard Protection', x: 450, y: 390, targetX: 445, targetY: 395, responsibility: 'Interlock foot with Snapper. Form an impenetrable wall.', coachingCue: 'Low center of gravity.' },
      { id: 'LS', label: 'LS', number: '61', name: 'Long Snapper', role: 'Snapper (7-Yard Precision)', x: 500, y: 390, targetX: 500, targetY: 390, responsibility: 'Perfect 7-yard snap with laces facing forward to holder spot in 0.35s.', coachingCue: 'Firm spiral to target spot.', isKickerOrKey: true },
      { id: 'RG', label: 'RG', number: '67', name: 'Right Guard', role: 'Guard Protection', x: 550, y: 390, targetX: 555, targetY: 395, responsibility: 'Interlock foot with Snapper. Anchor right A-gap.', coachingCue: 'Low center of gravity.' },
      { id: 'RT', label: 'RT', number: '72', name: 'Right Tackle', role: 'Tackle Protection', x: 600, y: 390, targetX: 605, targetY: 395, responsibility: 'Lock foot with RG. Squeeze B-gap.', coachingCue: 'Never open gate inside.' },
      { id: 'RE', label: 'RE', number: '86', name: 'Right End / TE', role: 'Tight Protection', x: 650, y: 390, targetX: 655, targetY: 395, responsibility: 'Lock inside foot with RT. Protect B-to-C gap seam.', coachingCue: 'Stay low, absorb edge force.' },
      { id: 'RW', label: 'RW', number: '82', name: 'Right Wing', role: 'Edge Protection', x: 700, y: 390, targetX: 710, targetY: 395, responsibility: 'Step inside with left foot, punch edge rusher with outside forearm.', coachingCue: 'Contain the edge sweep.' },
      { id: 'H', label: 'H', number: '10', name: 'Holder', role: 'Holder (7 Yards Deep)', x: 500, y: 460, targetX: 500, targetY: 460, responsibility: 'Right knee down at 7 yards. Spot finger on tee, catch snap, spin laces forward.', coachingCue: 'Soft hands, eye on the tee mark.', isKickerOrKey: true },
      { id: 'K', label: 'K', number: '3', name: 'Placekicker', role: 'Kicker (3 Steps Back, 2 Over)', x: 460, y: 490, targetX: 500, targetY: 460, responsibility: 'Take 3 steps back, 2 steps left. Accelerate through contact on holder spot.', coachingCue: 'Head down through contact, smooth swing.', isKickerOrKey: true },
    ],
    rulesAndDrills: [
      { title: 'The 1.28-Second Gold Standard', rule: 'Snap takes 0.35s; holder placement takes 0.35s; kicker approach takes 0.58s. Total execution: 1.28s. Any time over 1.35s invites penetration blocks.' },
      { title: 'Interlocking Foot Rule', rule: 'Linemen must overlap the instep of their outside shoe against the heel of their teammate’s inside shoe so no defender can step between them.' },
    ],
  },
  fg_block: {
    id: 'fg_block',
    name: 'Field Goal Block & Kick-Six Unit',
    shortName: 'FG Block / Safe',
    personnelType: 'Heavy Interior Push + Twin Edge Leapers + Deep Returner',
    targetTempo: 'Maximum Pressure or 100-Yard Return',
    overview: 'Designed to either reject the kick at the line or field a short attempt for a game-changing 100-yard Kick-Six return.',
    schemeOptions: [
      { id: 'middle_surge', label: 'Middle Surge Over Snapper', description: 'Two 300lb tackles bull rush the A-gaps to collapse the snapper and interior protection.' },
      { id: 'edge_leap', label: 'Twin Edge Speed Leap', description: 'Fastest corners sprint untouched off wings and layout with horizontal reach.' },
      { id: 'kick_six_safe', label: 'Kick-Six Return Alignment', description: 'Safeties retreat to goal posts to catch short kicks and mount return.' },
    ],
    coachingMotto: '“Get skinny in the seam, lay out with both palms flat, turn defense into 6 points.”',
    players: [
      { id: 'LE', label: 'LE', number: '21', name: 'Left Edge Leaper', role: 'Speed Edge Rusher', x: 260, y: 380, targetX: 470, targetY: 450, responsibility: 'Sprint full speed off left wing. Dive across holder spot.', coachingCue: 'Time snap cadence, stay onside.' },
      { id: 'T1', label: 'T1', number: '90', name: 'Left Interior Bull', role: 'A-Gap Bull Rush', x: 360, y: 380, targetX: 420, targetY: 410, responsibility: 'Bull rush through left guard and tackle seam.', coachingCue: 'Lower pad level, push back the line.' },
      { id: 'T2', label: 'T2', number: '95', name: 'Nose Penetrator', role: 'Center Destroyer', x: 460, y: 380, targetX: 480, targetY: 420, responsibility: 'Drive through left A-gap right past snapper.', coachingCue: 'Get hands up as soon as kicker steps.' },
      { id: 'T3', label: 'T3', number: '99', name: 'Nose Penetrator', role: 'Center Destroyer', x: 540, y: 380, targetX: 520, targetY: 420, responsibility: 'Drive through right A-gap right past snapper.', coachingCue: 'Get hands up high into kicking trajectory.' },
      { id: 'T4', label: 'T4', number: '93', name: 'Right Interior Bull', role: 'A-Gap Bull Rush', x: 640, y: 380, targetX: 580, targetY: 410, responsibility: 'Bull rush right guard and tackle seam.', coachingCue: 'Explode on snap.' },
      { id: 'RE', label: 'RE', number: '24', name: 'Right Edge Leaper', role: 'Speed Edge Rusher', x: 740, y: 380, targetX: 530, targetY: 450, responsibility: 'Sprint full speed off right wing. Layout horizontal.', coachingCue: 'Full extension toward holder hands.' },
      { id: 'LB1', label: 'LB1', number: '54', name: 'Left Spill LB', role: 'Fake Defense', x: 380, y: 340, targetX: 360, targetY: 380, responsibility: 'Watch for fake pass or holder roll.', coachingCue: 'Do not rush blindly; check tight end.' },
      { id: 'LB2', label: 'LB2', number: '51', name: 'Right Spill LB', role: 'Fake Defense', x: 620, y: 340, targetX: 640, targetY: 380, responsibility: 'Watch for fake run to right wing.', coachingCue: 'Contain the edge.' },
      { id: 'S1', label: 'S1', number: '32', name: 'Left Goalpost Safety', role: 'Return Wall', x: 420, y: 180, targetX: 450, targetY: 280, responsibility: 'Drop to goal line under crossbar. Lead block if kick falls short.', coachingCue: 'Watch ball trajectory.' },
      { id: 'S2', label: 'S2', number: '38', name: 'Right Goalpost Safety', role: 'Return Wall', x: 580, y: 180, targetX: 550, targetY: 280, responsibility: 'Drop to goal line under crossbar. Lead block if kick falls short.', coachingCue: 'Watch ball trajectory.' },
      { id: 'RET', label: 'RET', number: '1', name: 'Deep Kick-Six Returner', role: 'Kick-Six Returner', x: 500, y: 100, targetX: 500, targetY: 320, responsibility: 'Stationed under crossbar. Catch any short kick, return behind safety convoy.', coachingCue: 'Field cleanly, break outside down the sideline.', isKickerOrKey: true },
    ],
    rulesAndDrills: [
      { title: 'The Launch Point Rule', rule: 'Kick trajectory rises steeply after 4 yards. Blockers must get penetration into the first 2 yards behind LOS to reject the ball.' },
      { title: 'Do Not Jump Over the Line Penalty', rule: 'College & High School rules penalize players who leap over shield linemen with leverage. Rushers must shoot open seams.' },
    ],
  },
};
