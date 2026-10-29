import { PurlinSectionData } from "@/components/hooks/use-section-data";
import { useMemo } from "react";
import { Group, Line } from "react-konva";
import SectionDimensions, { DimensionLayout } from "./section-dimensions";
import { Point } from "./section-properties";

const EXISTING_SECTION_COLOR = "#78716c";
const INTELLI_FRAME_COLOR = "#d62d33";
const SINGLE_SECTION_COLOR = "#030712";

type SectionPart = { points: Point[], t: number, color: string };

export type SectionFlangeDim = {
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  value: number,
};

export type SectionDimAnchors = {
  height: { x0: number, y0: number, x1: number, y1: number, value: number },
  flanges: SectionFlangeDim[],
};

export type SectionDrawing = {
  parts: SectionPart[],
  load: Point,
  dims: SectionDimAnchors,
  upperFlangeOutside: boolean,
};

export function getSectionDrawing(section: PurlinSectionData, existing?: PurlinSectionData): SectionDrawing {
  if (!existing) {
    return {
      parts: [{ points: getSectionCoordinates(section), t: section.t, color: SINGLE_SECTION_COLOR }],
      load: getTopFlangeLoadPoint(section),
      dims: getSectionDimAnchors(section),
      upperFlangeOutside: true,
    };
  }

  const bottom = section.B_bottom ?? section.B;
  const top = section.B_top ?? section.B;
  const shiftX = (existing.B - bottom) / 2;
  const seat = (strokeWidth(existing.t) + strokeWidth(section.t)) / 2;
  const intelliFramePoints = getSectionCoordinates(section)
    .map((point) => ({ x: point.x + shiftX, y: point.y - seat }));
  const load = getTopFlangeLoadPoint(section);
  load.x += shiftX;
  load.y -= seat;

  return {
    parts: [
      { points: getSectionCoordinates(existing), t: existing.t, color: EXISTING_SECTION_COLOR },
      { points: intelliFramePoints, t: section.t, color: INTELLI_FRAME_COLOR },
    ],
    load,
    dims: getSectionDimAnchors(existing),
    upperFlangeOutside: false,
  };
}

function getTopFlangeLoadPoint(data: PurlinSectionData): Point {
  const r = Math.max(0, data.r);
  const lip = Math.abs(data.lipAngle) * Math.PI / 180;

  if (data.B_bottom != null || data.B_top != null) {
    const bottom = data.B_bottom ?? data.B;
    const top = data.B_top ?? data.B;
    const webTrim = filletTrimDistance(Math.PI / 2, r);
    const lipTrim = filletTrimDistance(Math.PI - lip, r);
    const x0 = bottom + webTrim;
    const x1 = bottom + top - lipTrim;
    return { x: (x0 + x1) / 2, y: -data.H };
  }

  const webTrim = filletTrimDistance(Math.PI / 2, r);
  const lipTrim = filletTrimDistance(Math.PI - lip, r);
  const x0 = webTrim;
  const x1 = data.B - lipTrim;
  return { x: (x0 + x1) / 2, y: 0 };
}

function filletTrimDistance(cornerAngle: number, radius: number) {
  const angle = Math.min(Math.max(cornerAngle, 1e-3), Math.PI - 1e-3);
  return radius / Math.tan(angle / 2);
}

function getSectionDimAnchors(data: PurlinSectionData): SectionDimAnchors {
  if (data.B_bottom != null || data.B_top != null) {
    const bottom = data.B_bottom ?? data.B;
    const top = data.B_top ?? data.B;
    return {
      height: { x0: 0, y0: 0, x1: 0, y1: -data.H, value: data.H },
      flanges: [
        { x0: 0, y0: 0, x1: bottom, y1: 0, value: bottom },
        { x0: bottom, y0: -data.H, x1: bottom + top, y1: -data.H, value: top },
      ],
    };
  }

  if (data.shape === "C") {
    return {
      height: { x0: 0, y0: 0, x1: 0, y1: data.H, value: data.H },
      flanges: [
        { x0: 0, y0: 0, x1: data.B, y1: 0, value: data.B },
        { x0: 0, y0: data.H, x1: data.B, y1: data.H, value: data.B },
      ],
    };
  }

  return {
    height: { x0: 0, y0: 0, x1: 0, y1: data.H, value: data.H },
    flanges: [
      { x0: 0, y0: 0, x1: data.B, y1: 0, value: data.B },
      { x0: 0, y0: data.H, x1: -data.B, y1: data.H, value: data.B },
    ],
  };
}

export function SectionDrawingView({ drawing, layout, zoom, rotation = 0, loadDirection }: SectionDrawingViewProps) {
  const { cx, cy } = layout.bounds;

  return (
    <Group x={cx} y={cy} offsetX={cx} offsetY={cy} rotation={rotation} listening={false}>
      {drawing.parts.map((part, index) => (
        <SectionLine key={index} points={part.points} thickness={part.t} color={part.color} />
      ))}
      <SectionDimensions layout={layout} zoom={zoom} loadDirection={loadDirection} />
    </Group>
  );
}

type SectionDrawingViewProps = {
  drawing: SectionDrawing,
  layout: DimensionLayout,
  zoom: number,
  rotation?: number,
  loadDirection?: "gravity" | "uplift",
}

function SectionLine({ points, thickness, color }: { points: Point[], thickness: number, color: string }) {
  const flatPoints = useMemo(() => flatten(points), [points]);
  return (
    <Line
      points={flatPoints}
      stroke={color}
      strokeWidth={strokeWidth(thickness)}
      lineCap="round"
      lineJoin="round"
      listening={false}
    />
  );
}

function strokeWidth(thickness: number) {
  return Math.max(thickness * 1.4, 0.05);
}

function getSectionCoordinates(data: PurlinSectionData): Point[] {
  if (data.B_bottom != null || data.B_top != null) {
    return getIntelliFrameCoordinates(data);
  }
  if (data.shape === "C") {
    return getCeeSectionPoints(data);
  }
  return getZeeSectionPoints(data);
}

function getIntelliFrameCoordinates(data: PurlinSectionData): Point[] {
  const bottom = data.B_bottom ?? data.B;
  const top = data.B_top ?? data.B;
  const lip = Math.abs(data.lipAngle) * Math.PI / 180;

  const corners: Point[] = [
    { x: 0, y: 0 },
    { x: bottom, y: 0 },
    { x: bottom, y: data.H },
    { x: bottom + top, y: data.H },
    { x: bottom + top + data.D * Math.cos(lip), y: data.H - data.D * Math.sin(lip) },
  ];

  return filletPolyline(corners, data.r).map((point) => ({ x: point.x, y: -point.y }));
}

function getCeeSectionPoints(data: PurlinSectionData): Point[] {
  const lip = Math.abs(data.lipAngle * Math.PI / 180);
  return filletPolyline([
    { x: data.B + data.D * Math.cos(lip), y: data.D * Math.sin(lip) },
    { x: data.B, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: data.H },
    { x: data.B, y: data.H },
    { x: data.B + data.D * Math.cos(lip), y: data.H - data.D * Math.sin(lip) },
  ], data.r);
}

function getZeeSectionPoints(data: PurlinSectionData): Point[] {
  const lip = Math.abs(data.lipAngle * Math.PI / 180);
  return filletPolyline([
    { x: data.B + data.D * Math.cos(lip), y: data.D * Math.sin(lip) },
    { x: data.B, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: data.H },
    { x: -data.B, y: data.H },
    { x: -(data.B + data.D * Math.cos(lip)), y: data.H - data.D * Math.sin(lip) },
  ], data.r);
}

function filletPolyline(points: Point[], radius: number, arcSteps = 8): Point[] {
  if (points.length < 3 || radius <= 0) {
    return points;
  }

  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    const toNext = { x: next.x - curr.x, y: next.y - curr.y };
    const lenPrev = length(toPrev);
    const lenNext = length(toNext);
    if (lenPrev < 1e-8 || lenNext < 1e-8) {
      result.push(curr);
      continue;
    }

    const v1 = scale(toPrev, 1 / lenPrev);
    const v2 = scale(toNext, 1 / lenNext);
    const angle = Math.acos(clamp(dot(v1, v2), -1, 1));
    if (angle < 1e-3 || Math.abs(Math.PI - angle) < 1e-3) {
      result.push(curr);
      continue;
    }

    const maxRadius = Math.min(radius, lenPrev * 0.45, lenNext * 0.45);
    const dist = maxRadius / Math.tan(angle / 2);
    const start = add(curr, scale(v1, dist));
    const end = add(curr, scale(v2, dist));
    const center = add(curr, scale(normalize(add(v1, v2)), maxRadius / Math.sin(angle / 2)));
    result.push(...arcPoints(center, maxRadius, start, end, arcSteps));
  }
  result.push(points[points.length - 1]);
  return result;
}

function arcPoints(center: Point, radius: number, from: Point, to: Point, steps: number): Point[] {
  const a0 = Math.atan2(from.y - center.y, from.x - center.x);
  const a1 = Math.atan2(to.y - center.y, to.x - center.x);
  let delta = a1 - a0;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = a0 + delta * (i / steps);
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return points;
}

function flatten(points: Point[]): number[] {
  const coords: number[] = [];
  points.forEach((point) => {
    coords.push(point.x, point.y);
  });
  return coords;
}

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(point: Point, factor: number): Point {
  return { x: point.x * factor, y: point.y * factor };
}

function length(point: Point): number {
  return Math.hypot(point.x, point.y);
}

function normalize(point: Point): Point {
  const size = length(point);
  return size < 1e-8 ? { x: 0, y: 0 } : scale(point, 1 / size);
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
