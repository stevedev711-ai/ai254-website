// Browser copy of the AI254 KSL glove sign classifier, plus a simulated glove.
// The network matches training/train.py in stevedev711-ai/ai254-deaf:
// Conv1D(24,5) -> MaxPool(2) -> Conv1D(16,3) -> Flatten -> Dense(softmax).
// Weights in /public/ksl-demo/model.json come from web/tools/train_demo_model.py
// in that repository, trained on simulated sensor data only.

type Matrix = number[][];
export type Frame = number[]; // [thumb, index, middle, ring, little, ax, ay, az]

export interface DemoModel {
  labels: string[];
  threshold: number;
  conv1: [number[][][], number[]];
  conv2: [number[][][], number[]];
  dense: [Matrix, number[]];
}

export interface DemoSign { bends: number[]; motion: number[] }
export type DemoSigns = Record<string, DemoSign>;

export interface Reading { probs: number[]; best: number; phrase: string | null }

export const FRAMES = 40;
const SCALE = [4095, 4095, 4095, 4095, 4095, 16384, 16384, 16384];

function conv1dRelu(x: Matrix, [kernel, bias]: [number[][][], number[]]): Matrix {
  const k = kernel.length, inC = kernel[0].length, outC = bias.length, out: Matrix = [];
  for (let t = 0; t + k <= x.length; t++) {
    const row = new Array<number>(outC);
    for (let o = 0; o < outC; o++) {
      let s = bias[o];
      for (let j = 0; j < k; j++) for (let c = 0; c < inC; c++) s += x[t + j][c] * kernel[j][c][o];
      row[o] = s > 0 ? s : 0;
    }
    out.push(row);
  }
  return out;
}

function maxPool2(x: Matrix): Matrix {
  const out: Matrix = [];
  for (let t = 0; t + 1 < x.length; t += 2) out.push(x[t].map((v, c) => Math.max(v, x[t + 1][c])));
  return out;
}

/** Classify 40 raw glove frames exactly as the Android app does (0.85 threshold, index 0 = not a sign). */
export function classify(model: DemoModel, frames: Frame[]): Reading {
  const x = frames.map((f) => f.map((v, i) => v / SCALE[i]));
  const flat = conv1dRelu(maxPool2(conv1dRelu(x, model.conv1)), model.conv2).flat();
  const [w, b] = model.dense;
  const logits = b.map((bias, o) => flat.reduce((s, v, i) => s + v * w[i][o], bias));
  const top = Math.max(...logits);
  const e = logits.map((v) => Math.exp(v - top));
  const sum = e.reduce((a, v) => a + v, 0);
  const probs = e.map((v) => v / sum);
  let best = 0;
  probs.forEach((p, i) => { if (p > probs[best]) best = i; });
  const accepted = best !== 0 && probs[best] >= model.threshold;
  return { probs, best, phrase: accepted ? model.labels[best] : null };
}

function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const uniform = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Two seconds of simulated glove readings. kind: a sign label, "near" (a distorted sign) or "rest". */
export function simulate(signs: DemoSigns, kind: string): Frame[] {
  const bias = uniform(-0.08, 0.08);
  let bends: number[], motion: number[];
  if (kind === "near") {
    const names = Object.keys(signs);
    const base = signs[names[Math.floor(Math.random() * names.length)]].bends;
    bends = base.map((b) => clamp(b + uniform(-0.45, 0.45), 0, 1));
    motion = [0, 0, 0].map(() => uniform(0, 2500));
  } else if (kind === "rest") {
    bends = Array(5).fill(uniform(0, 0.3));
    motion = [0, 0, 0];
  } else {
    ({ bends, motion } = signs[kind]);
  }
  const phase = Math.random(), frames: Frame[] = [];
  for (let t = 0; t < FRAMES; t++) {
    const w = Math.sin(2 * Math.PI * (t / 20 + phase));
    const flex = bends.map((b) => clamp(Math.round(4095 * (1 - 0.7 * clamp(b + bias, 0, 1)) + 60 * gauss()), 0, 4095));
    const acc = motion.map((a) => Math.round(a * w + 300 * gauss()));
    acc[2] += 16384;
    frames.push([...flex, ...acc]);
  }
  return frames;
}
