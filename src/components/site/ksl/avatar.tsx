/**
 * Illustrative 2D signing avatar for the AI254 KSL concept demo.
 *
 * The motions are animated illustrations of signing. They are NOT authentic
 * Kenyan Sign Language: real signs must be produced and reviewed with Deaf
 * KSL signers before anything here is presented as KSL output.
 */

export type Shape = "flat" | "open" | "fist" | "point" | "C" | "O" | "V" | "L" | "Y";
export type Mouth = "rest" | "smile" | "open" | "mid" | "oo";
export interface HandPose { x: number; y: number; rot: number; shape: Shape; z: number }
export interface Pose { D: HandPose; N: HandPose; brows: number; mouth: Mouth }

/** A sign: a pose as a function of progress p in [0, 1]. */
export type Motion = (p: number) => Pose;

// Body geometry (SVG units). D = dominant hand (avatar's right, viewer's left).
const SHOULDER_D = { x: 124, y: 222 };
const SHOULDER_N = { x: 236, y: 222 };
const UPPER = 76;
const FORE = 72;

const SKIN = "#8A5A3B";
const SKIN_DARK = "#6E4529";
const SHIRT = "#13254F";
const SHIRT_LIGHT = "#1F3D85";
const HAND_SCALE = 1.4;
const SLEEVE = "#1A3170";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const hp = (x: number, y: number, rot: number, shape: Shape, z = 1): HandPose => ({ x, y, rot, shape, z });

export const REST: Pose = { D: hp(170, 322, 78, "flat", 0.95), N: hp(192, 326, -84, "flat", 0.95), brows: 0, mouth: "rest" };

function mixHand(a: HandPose, b: HandPose, t: number): HandPose {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rot: lerp(a.rot, b.rot, t), z: lerp(a.z, b.z, t), shape: t < 0.5 ? a.shape : b.shape };
}
export function mixPose(a: Pose, b: Pose, t: number): Pose {
  return { D: mixHand(a.D, b.D, t), N: mixHand(a.N, b.N, t), brows: lerp(a.brows, b.brows, t), mouth: t < 0.5 ? a.mouth : b.mouth };
}

// ---------------------------------------------------------------------------
// Sign motions (illustrative). Non-dominant hand defaults to a low "support" position.
const low = hp(200, 324, -84, "flat", 0.95);
const talk = (p: number): Mouth => (Math.sin(p * 22) > 0.2 ? "open" : Math.sin(p * 22) < -0.5 ? "oo" : "mid");
const bounce = (p: number, n = 2) => Math.abs(Math.sin(p * Math.PI * n));

export const MOTIONS: Record<string, Motion> = {
  greet: (p) => { const t = ease(p); return { D: hp(lerp(162, 108, t), lerp(176, 236, t), lerp(-15, -55, t), "flat", lerp(1, 1.18, t)), N: low, brows: 0.3, mouth: "smile" }; },
  sweep: (p) => { const t = ease(p); const a = lerp(Math.PI * 0.95, Math.PI * 0.05, t); return { D: hp(180 + Math.cos(a) * 52, 258 - Math.sin(a) * 14, 95, "open", 1.05), N: low, brows: 0.2, mouth: talk(p) }; },
  today: (p) => { const b = bounce(p) * 12; return { D: hp(150, 268 + b, 72, "flat", 1.1), N: hp(210, 268 + b, -72, "flat", 1.1), brows: 0.1, mouth: talk(p) }; },
  cell: (p) => { const a = lerp(Math.PI, Math.PI * 2.6, ease(p)); return { D: hp(180 + Math.cos(a) * 30 - 6, 258 + Math.sin(a) * 26, 60, "C", 1.05), N: hp(180 - Math.cos(a) * 30 + 6, 258 + Math.sin(a) * 26, -60, "C", 1.05), brows: 0.1, mouth: talk(p) }; },
  life: (p) => { const t = ease(p); const w = Math.sin(p * 30) * 8; return { D: hp(150, lerp(310, 228, t), w, "open"), N: hp(210, lerp(310, 228, t), -w, "open"), brows: 0.4, mouth: talk(p) }; },
  basic: (p) => ({ D: hp(176, 262 - bounce(p, 2) * 16, 100, "fist"), N: hp(204, 282, -82, "flat"), brows: 0, mouth: talk(p) }),
  surround: (p) => { const a = lerp(-Math.PI * 0.6, Math.PI * 1.3, ease(p)); return { D: hp(196 + Math.cos(a) * 38, 262 + Math.sin(a) * 30, 30, "flat"), N: hp(204, 264, -20, "fist"), brows: 0.2, mouth: talk(p) }; },
  control: (p) => { const s = Math.sin(p * Math.PI * 3) * 14; return { D: hp(156, 262 + s, 10, "fist", 1.1), N: hp(204, 262 - s, -10, "fist", 1.1), brows: -0.3, mouth: talk(p) }; },
  inout: (p) => { const s = Math.sin(p * Math.PI * 2); return { D: hp(lerp(172, 132, (s + 1) / 2), 250, 70, "flat", lerp(0.9, 1.25, (s + 1) / 2)), N: low, brows: 0.2, mouth: talk(p) }; },
  energy: (p) => { const t = ease(Math.min(1, p * 1.6)); const pulse = p > 0.62 ? Math.sin((p - 0.62) * 30) * 4 : 0; return { D: hp(lerp(152, 112, t), lerp(272, 200, t) + pulse, lerp(20, -10, t), "fist", 1.05), N: hp(lerp(208, 248, t), lerp(272, 200, t) + pulse, lerp(-20, 10, t), "fist", 1.05), brows: -0.4, mouth: p > 0.5 ? "mid" : "open" }; },
  release: (p) => { const t = ease(p); return { D: hp(lerp(166, 120, t), lerp(250, 282, t), lerp(40, 70, t), t < 0.45 ? "fist" : "open", lerp(1, 1.2, t)), N: hp(lerp(194, 240, t), lerp(250, 282, t), lerp(-40, -70, t), t < 0.45 ? "fist" : "open", lerp(1, 1.2, t)), brows: 0.3, mouth: "oo" }; },
  sweet: (p) => ({ D: hp(172 + Math.sin(p * Math.PI * 4) * 4, 198 + bounce(p, 2) * 6, 150, "flat", 0.95), N: low, brows: 0.3, mouth: "smile" }),
  breathe: (p) => { const s = (Math.sin(p * Math.PI * 4 - Math.PI / 2) + 1) / 2; return { D: hp(lerp(166, 148, s), 252, 80, "flat", lerp(0.95, 1.12, s)), N: hp(lerp(194, 212, s), 252, -80, "flat", lerp(0.95, 1.12, s)), brows: 0, mouth: s > 0.5 ? "oo" : "mid" }; },
  house: (p) => { const t = ease(p); return { D: hp(lerp(172, 146, t), lerp(214, 262, t), lerp(42, 2, t), "flat", 1.05), N: hp(lerp(188, 214, t), lerp(214, 262, t), lerp(-42, -2, t), "flat", 1.05), brows: 0.2, mouth: talk(p) }; },
  why: (p) => { const t = ease(Math.min(1, p * 1.5)); return { D: hp(lerp(168, 130, t), lerp(116, 238, t), lerp(-20, -40, t), p < 0.5 ? "point" : "Y", lerp(1, 1.15, t)), N: low, brows: 0.9, mouth: "mid" }; },
  need: (p) => ({ D: hp(148, 250 + bounce(p, 2) * 20, 140, "point", 1.1), N: low, brows: -0.2, mouth: talk(p) }),
  yes: (p) => ({ D: hp(148, 236, Math.sin(p * Math.PI * 4) * 28, "fist", 1.1), N: low, brows: 0.5, mouth: "smile" }),
};

const SPELL: Shape[] = ["C", "O", "V", "L", "Y", "point", "fist", "open", "flat"];
/** Fingerspelling: dominant hand held up beside the shoulder, cycling handshapes. */
export function fingerspell(word: string): Motion {
  const letters = word.replace(/[^A-Z]/g, "").slice(0, 7);
  return (p) => {
    const i = Math.min(letters.length - 1, Math.floor(p * letters.length));
    const shape = SPELL[letters.charCodeAt(i) % SPELL.length];
    return { D: hp(114 + i, 226 + Math.sin(p * 40) * 1.5, -6, shape, 1.12), N: low, brows: 0.15, mouth: i % 2 ? "open" : "oo" };
  };
}

// ---------------------------------------------------------------------------
// Rendering

function solveElbow(s: { x: number; y: number }, x: number, y: number, outward: number) {
  let dx = x - s.x, dy = y - s.y;
  let d = Math.hypot(dx, dy);
  const max = UPPER + FORE - 0.5, min = Math.abs(UPPER - FORE) + 1;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < min) d = min;
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.max(-1, Math.min(1, (UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d))));
  const e1 = { x: s.x + UPPER * Math.cos(base + a), y: s.y + UPPER * Math.sin(base + a) };
  const e2 = { x: s.x + UPPER * Math.cos(base - a), y: s.y + UPPER * Math.sin(base - a) };
  // Keep the elbow low and out to the side, as a person's would be.
  const score = (e: { x: number; y: number }) => e.y + (e.x - s.x) * outward * 0.6;
  return { elbow: score(e1) > score(e2) ? e1 : e2, wrist: { x: s.x + dx, y: s.y + dy } };
}

const FINGER_X = [-7.6, -2.5, 2.6, 7.6];
const FINGER_LEN = [17, 19, 18, 14];
const SHAPES: Record<Shape, { f: number[]; spread: number; thumb: number }> = {
  flat: { f: [1, 1, 1, 1], spread: 1.5, thumb: 12 },
  open: { f: [1, 1, 1, 1], spread: 11, thumb: 55 },
  fist: { f: [0, 0, 0, 0], spread: 0, thumb: -60 },
  point: { f: [1, 0, 0, 0], spread: 0, thumb: -55 },
  C: { f: [0.6, 0.6, 0.6, 0.6], spread: 3, thumb: 60 },
  O: { f: [0.35, 0.35, 0.35, 0.35], spread: 2, thumb: 25 },
  V: { f: [1, 1, 0, 0], spread: 13, thumb: -55 },
  L: { f: [1, 0, 0, 0], spread: 0, thumb: 85 },
  Y: { f: [0, 0, 0, 1], spread: 22, thumb: 75 },
};

function Hand({ pose, mirror }: { pose: HandPose; mirror: boolean }) {
  const s = SHAPES[pose.shape];
  const z = pose.z * HAND_SCALE;
  const sx = (mirror ? -1 : 1) * z;
  return (
    <g transform={`translate(${pose.x.toFixed(1)} ${pose.y.toFixed(1)}) rotate(${pose.rot.toFixed(1)}) scale(${sx.toFixed(3)} ${z.toFixed(3)})`}>
      {FINGER_X.map((fx, i) => {
        const e = s.f[i];
        const len = 6 + e * (FINGER_LEN[i] - 6);
        const rot = (i - 1.5) * s.spread + (e > 0 && e < 1 ? -14 : 0);
        return (
          <rect key={i} x={fx - 2.6} y={-20 - len} width={5.2} height={len + 4} rx={2.6}
            fill={e < 0.2 ? SKIN_DARK : SKIN} stroke={SKIN_DARK} strokeWidth={0.8}
            transform={`rotate(${rot} ${fx} -20)`} />
        );
      })}
      <rect x={-11.5} y={-22} width={23} height={25} rx={8} fill={SKIN} stroke={SKIN_DARK} strokeWidth={0.9} />
      <rect x={-3} y={-18} width={6} height={15} rx={3} fill={SKIN} stroke={SKIN_DARK} strokeWidth={0.8}
        transform={`translate(10 -4) rotate(${s.thumb})`} />
    </g>
  );
}

function Arm({ shoulder, hand, outward, mirror }: { shoulder: { x: number; y: number }; hand: HandPose; outward: number; mirror: boolean }) {
  const { elbow, wrist } = solveElbow(shoulder, hand.x, hand.y, outward);
  const path = `M${shoulder.x} ${shoulder.y} L${elbow.x.toFixed(1)} ${elbow.y.toFixed(1)} L${wrist.x.toFixed(1)} ${wrist.y.toFixed(1)}`;
  return (
    <g>
      <circle cx={shoulder.x} cy={shoulder.y} r={14} fill={SLEEVE} />
      <path d={path} fill="none" stroke="#08122B" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke={SLEEVE} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke={SHIRT_LIGHT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
      <Hand pose={{ ...hand, x: wrist.x, y: wrist.y }} mirror={mirror} />
    </g>
  );
}

function MouthShape({ mouth }: { mouth: Mouth }) {
  switch (mouth) {
    case "smile": return <path d="M168 150 Q180 160 192 150" fill="none" stroke="#3B2216" strokeWidth={2.6} strokeLinecap="round" />;
    case "open": return <ellipse cx={180} cy={152} rx={7.5} ry={5.5} fill="#3B2216" />;
    case "mid": return <ellipse cx={180} cy={152} rx={7} ry={2.6} fill="#3B2216" />;
    case "oo": return <ellipse cx={180} cy={152} rx={4.2} ry={4.6} fill="#3B2216" />;
    default: return <path d="M170 152 Q180 156 190 152" fill="none" stroke="#3B2216" strokeWidth={2.4} strokeLinecap="round" />;
  }
}

export function Avatar({ pose, blink, breathe, look }: { pose: Pose; blink: number; breathe: number; look: number }) {
  const eyeRy = 5 * (1 - blink) + 0.5;
  const browY = 101 - pose.brows * 5;
  return (
    <svg viewBox="40 40 280 330" className="h-full w-full" role="img" aria-label="Signing avatar (animated illustration)">
      <defs>
        <radialGradient id="ksl-face" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#9A6A48" /><stop offset="1" stopColor={SKIN} />
        </radialGradient>
        <linearGradient id="ksl-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={SHIRT_LIGHT} /><stop offset=".35" stopColor={SHIRT} />
        </linearGradient>
      </defs>
      <g transform={`translate(0 ${breathe.toFixed(2)})`}>
        {/* torso */}
        <path d="M70 380 C74 280 84 236 120 214 C140 202 158 196 166 192 L194 192 C202 196 220 202 240 214 C276 236 286 280 290 380 Z" fill="url(#ksl-shirt)" />
        <path d="M166 192 L180 222 L194 192" fill="none" stroke="#0C1834" strokeWidth={3} strokeLinejoin="round" />
        {/* neck */}
        <path d="M166 158 L166 194 Q180 204 194 194 L194 158 Z" fill={SKIN_DARK} />
        {/* head */}
        <g transform={`rotate(${look.toFixed(2)} 180 160)`}>
          <ellipse cx={135} cy={124} rx={7} ry={11} fill={SKIN_DARK} />
          <ellipse cx={225} cy={124} rx={7} ry={11} fill={SKIN_DARK} />
          <ellipse cx={180} cy={118} rx={45} ry={52} fill="url(#ksl-face)" />
          <path d="M135 112 C132 74 156 60 180 60 C204 60 228 74 225 112 C220 92 206 82 180 82 C154 82 140 92 135 112 Z" fill="#1B1210" />
          <path d={`M158 ${browY} Q166 ${browY - 4} 174 ${browY}`} fill="none" stroke="#1B1210" strokeWidth={3.2} strokeLinecap="round" />
          <path d={`M186 ${browY} Q194 ${browY - 4} 202 ${browY}`} fill="none" stroke="#1B1210" strokeWidth={3.2} strokeLinecap="round" />
          <ellipse cx={166} cy={116} rx={6.5} ry={eyeRy} fill="#F4EEE8" />
          <ellipse cx={194} cy={116} rx={6.5} ry={eyeRy} fill="#F4EEE8" />
          {blink < 0.6 && <><circle cx={166.5} cy={116.5} r={3.4} fill="#2A1A12" /><circle cx={194.5} cy={116.5} r={3.4} fill="#2A1A12" /></>}
          <path d="M180 120 Q176 134 180 137 Q184 137 186 135" fill="none" stroke={SKIN_DARK} strokeWidth={2} strokeLinecap="round" />
          <MouthShape mouth={pose.mouth} />
        </g>
        {/* arms: non-dominant behind, dominant in front */}
        <Arm shoulder={SHOULDER_N} hand={pose.N} outward={1} mirror={false} />
        <Arm shoulder={SHOULDER_D} hand={pose.D} outward={-1} mirror={true} />
      </g>
    </svg>
  );
}
