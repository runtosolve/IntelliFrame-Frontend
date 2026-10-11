export type Point = { x: number, y: number };

type PlateChain = { points: Point[], t: number };

export function shearCenter(chains: PlateChain[]): Point {
  const nodes: Point[] = [];
  const elements: Array<[number, number, number]> = [];

  chains.forEach((chain, index) => {
    const start = nodes.length;
    chain.points.forEach((point) => nodes.push(point));
    for (let k = 0; k < chain.points.length - 1; k++) {
      elements.push([start + k, start + k + 1, chain.t]);
    }
    if (index > 0) {
      elements.push([nearestNode(nodes.slice(0, start), chain.points[0]), start, 0]);
    }
  });

  let area = 0;
  let firstX = 0;
  let firstY = 0;
  for (const [i, j, t] of elements) {
    const a = nodes[i];
    const b = nodes[j];
    const dA = distance(a, b) * t;
    area += dA;
    firstX += dA * (a.x + b.x) / 2;
    firstY += dA * (a.y + b.y) / 2;
  }
  if (area <= 0) return { x: 0, y: 0 };
  const xc = firstX / area;
  const yc = firstY / area;
  const p = nodes.map((node) => ({ x: node.x - xc, y: node.y - yc }));

  let Ix = 0;
  let Iy = 0;
  let Ixy = 0;
  for (const [i, j, t] of elements) {
    const a = p[i];
    const b = p[j];
    const k = distance(a, b) * t;
    Ix += k * (a.y * a.y + a.y * b.y + b.y * b.y) / 3;
    Iy += k * (a.x * a.x + a.x * b.x + b.x * b.x) / 3;
    Ixy += k * (2 * a.x * a.y + a.x * b.y + b.x * a.y + 2 * b.x * b.y) / 6;
  }

  const neighbours: number[][] = nodes.map(() => []);
  elements.forEach(([i, j]) => {
    neighbours[i].push(j);
    neighbours[j].push(i);
  });
  const omega: Array<number | null> = nodes.map(() => null);
  omega[0] = 0;
  const queue = [0];
  while (queue.length > 0) {
    const i = queue.shift()!;
    for (const j of neighbours[i]) {
      if (omega[j] !== null) continue;
      omega[j] = omega[i]! + (p[i].x * p[j].y - p[j].x * p[i].y);
      queue.push(j);
    }
  }

  let Iwx = 0;
  let Iwy = 0;
  for (const [i, j, t] of elements) {
    const a = p[i];
    const b = p[j];
    const k = distance(a, b) * t;
    const wi = omega[i] ?? 0;
    const wj = omega[j] ?? 0;
    Iwx += k * (wi * a.x / 3 + (wi * b.x + wj * a.x) / 6 + wj * b.x / 3);
    Iwy += k * (wi * a.y / 3 + (wi * b.y + wj * a.y) / 6 + wj * b.y / 3);
  }

  const det = Ix * Iy - Ixy * Ixy;
  if (Math.abs(det) < 1e-12) return { x: xc, y: yc };
  return {
    x: xc + (Iy * Iwy - Ixy * Iwx) / det,
    y: yc - (Ix * Iwx - Ixy * Iwy) / det,
  };
}

function nearestNode(nodes: Point[], target: Point): number {
  let best = 0;
  let bestDistance = Infinity;
  nodes.forEach((node, index) => {
    const d = distance(node, target);
    if (d < bestDistance) {
      bestDistance = d;
      best = index;
    }
  });
  return best;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}
