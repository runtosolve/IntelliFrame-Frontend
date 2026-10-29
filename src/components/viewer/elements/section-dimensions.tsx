import { Arrow, Group, Line, Text } from "react-konva";
import type { SectionDrawing, SectionDimAnchors } from "./cross-section";
import { Point, shearCenter } from "./section-properties";

const DIMENSION_COLOR = "#44403c";
const EXTENSION_COLOR = "#a8a29e";
const ACCENT_COLOR = "#2f6fb0";
const FONT_FAMILY = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const FONT_SIZE = 12;

export type DimensionLayout = {
  sc: Point,
  minX: number,
  maxX: number,
  leftY: number,
  rightY: number,
  bottomY: number,
  bottomLeftX: number,
  load: Point,
  horizontalY: number,
  verticalX: number,
  arrowLength: number,
  gap: number,
  tick: number,
  dims: SectionDimAnchors,
  upperFlangeOutside: boolean,
  bounds: { minX: number, minY: number, maxX: number, maxY: number, cx: number, cy: number },
};

export function getDimensionLayout(
  drawing: SectionDrawing,
  options: { analysis?: boolean } = {},
): DimensionLayout {
  const points = drawing.parts.flatMap((part) => part.points);
  const sc = shearCenter(drawing.parts.map((part) => ({ points: part.points, t: part.t })));
  const dims = drawing.dims;
  const analysis = options.analysis === true;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let leftY = 0;
  let rightY = 0;
  points.forEach((point) => {
    if (point.x < minX) { minX = point.x; leftY = point.y; }
    if (point.x > maxX) { maxX = point.x; rightY = point.y; }
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });
  const bottomLeftX = Math.min(...points.filter((point) => point.y > maxY - 1e-3).map((point) => point.x));

  const height = Math.max(Math.abs(dims.height.y1 - dims.height.y0), maxY - minY, 1e-3);
  const unit = height * 0.085;
  const gap = unit * 0.2;
  const tick = unit * 0.35;
  const dimOffset = unit * 1.15;
  const topDimOffset = drawing.upperFlangeOutside ? unit * 2.55 : dimOffset;
  const arrowLength = unit * 1.3;

  const flangesSorted = [...dims.flanges].sort(
    (a, b) => Math.min(a.y0, a.y1) - Math.min(b.y0, b.y1),
  );
  const topFlange = flangesSorted[0];
  const bottomFlange = flangesSorted[flangesSorted.length - 1] ?? topFlange;
  const topFlangeY = Math.min(topFlange.y0, topFlange.y1);
  const bottomFlangeY = Math.max(bottomFlange.y0, bottomFlange.y1);
  const topDimY = drawing.upperFlangeOutside ? topFlangeY - topDimOffset : topFlangeY + dimOffset;
  const bottomDimY = bottomFlangeY + dimOffset;

  const heightX = Math.min(minX, dims.height.x0, dims.height.x1, topFlange.x0, topFlange.x1, bottomFlange.x0, bottomFlange.x1) - dimOffset;
  const verticalX = heightX;
  const horizontalY = bottomDimY;

  let boundsMinX: number;
  let boundsMaxX: number;
  let boundsMinY: number;
  let boundsMaxY: number;

  if (analysis) {
    const eccPad = Math.abs(drawing.load.x - sc.x) + unit * 1.2;
    boundsMinX = Math.min(minX, sc.x, drawing.load.x) - unit * 0.35;
    boundsMaxX = Math.max(maxX, sc.x, drawing.load.x) + Math.max(unit * 0.55, eccPad * 0.28);
    boundsMinY = Math.min(minY, drawing.load.y - gap - arrowLength, sc.y) - unit * 0.28;
    boundsMaxY = Math.max(maxY, sc.y) + unit * 0.4;
  } else {
    boundsMinX = Math.min(minX, heightX, drawing.load.x) - unit * 0.9;
    boundsMaxX = Math.max(maxX, drawing.load.x) + unit * 0.55;
    boundsMinY = Math.min(minY, topDimY) - unit * 0.55;
    boundsMaxY = Math.max(maxY, bottomDimY) + unit * 0.7;
  }

  return {
    sc,
    minX,
    maxX,
    leftY,
    rightY,
    bottomY: maxY,
    bottomLeftX,
    load: drawing.load,
    horizontalY,
    verticalX,
    arrowLength,
    gap,
    tick,
    dims,
    upperFlangeOutside: drawing.upperFlangeOutside,
    bounds: {
      minX: boundsMinX,
      minY: boundsMinY,
      maxX: boundsMaxX,
      maxY: boundsMaxY,
      cx: (boundsMinX + boundsMaxX) / 2,
      cy: (boundsMinY + boundsMaxY) / 2,
    },
  };
}

export default function SectionDimensions({ layout, zoom, loadDirection }: SectionDimensionsProps) {
  const px = 1 / Math.max(zoom, 1e-6);
  const fontSize = FONT_SIZE * px;
  const thin = px;
  const tick = layout.tick;
  const { load, gap, arrowLength, dims, verticalX, upperFlangeOutside, sc } = layout;
  const arrowTip = load.y - gap;
  const arrowTail = arrowTip - arrowLength;
  const labelWidth = 220 * px;
  const analysis = loadDirection !== undefined;

  if (analysis) {
    const eccentricity = Math.abs(load.x - sc.x);
    const showEccentricity = eccentricity >= 0.01;
    const diamond = 5 * px;
    const dotted = [1.5 * px, 3 * px];
    const dashed = [6 * px, 4 * px];

    return (
      <Group listening={false}>
        {showEccentricity && (
          <>
            <Line points={[load.x, load.y, load.x, sc.y]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
            <Line points={[sc.x, sc.y, load.x, sc.y]} stroke={ACCENT_COLOR} strokeWidth={thin * 1.4} dash={dashed} />
            <Text
              text={`e = ${eccentricity.toFixed(2)} in.`}
              x={Math.min(sc.x, load.x) + 7 * px}
              y={sc.y + 5 * px}
              width={labelWidth}
              fontSize={fontSize}
              fontFamily={FONT_FAMILY}
              fontStyle="600"
              fill={ACCENT_COLOR}
              align="left"
              listening={false}
            />
          </>
        )}

        <Line
          points={[sc.x, sc.y - diamond, sc.x + diamond, sc.y, sc.x, sc.y + diamond, sc.x - diamond, sc.y]}
          closed
          fill={ACCENT_COLOR}
          stroke="#ffffff"
          strokeWidth={thin}
        />
        <Text
          text="Shear center"
          x={sc.x + diamond + 3 * px}
          y={sc.y - diamond - fontSize * 1.15}
          width={labelWidth}
          fontSize={fontSize}
          fontFamily={FONT_FAMILY}
          fontStyle="600"
          fill={ACCENT_COLOR}
          align="left"
          listening={false}
        />

        <Arrow
          points={loadDirection === "uplift" ? [load.x, arrowTip, load.x, arrowTail] : [load.x, arrowTail, load.x, arrowTip]}
          stroke={ACCENT_COLOR}
          fill={ACCENT_COLOR}
          strokeWidth={thin * 2}
          pointerLength={8 * px}
          pointerWidth={7 * px}
        />
      </Group>
    );
  }

  const heightDimX = verticalX;
  const flangesSorted = [...dims.flanges].sort(
    (a, b) => Math.min(a.y0, a.y1) - Math.min(b.y0, b.y1),
  );
  const topFlange = flangesSorted[0];
  const bottomFlange = flangesSorted[flangesSorted.length - 1] ?? topFlange;
  const unit = Math.abs(dims.height.y1 - dims.height.y0) * 0.085;
  const dimOffset = unit * 1.15;
  const topDimOffset = upperFlangeOutside ? unit * 2.55 : dimOffset;
  const topFlangeY = Math.min(topFlange.y0, topFlange.y1);
  const bottomFlangeY = Math.max(bottomFlange.y0, bottomFlange.y1);
  const topDimY = upperFlangeOutside ? topFlangeY - topDimOffset : topFlangeY + dimOffset;
  const topLabelSide = upperFlangeOutside ? "above" : "below";
  const bottomDimY = bottomFlangeY + dimOffset;
  const buildLabelWidth = 160 * px;

  return (
    <Group listening={false}>
      <LinearDimension
        x0={heightDimX}
        y0={dims.height.y0}
        x1={heightDimX}
        y1={dims.height.y1}
        value={dims.height.value}
        fontSize={fontSize}
        thin={thin}
        tick={tick}
        labelWidth={buildLabelWidth}
        labelSide="outside"
        extensionTo={[
          { x: Math.min(dims.height.x0, dims.height.x1), y: dims.height.y0 },
          { x: Math.min(dims.height.x0, dims.height.x1), y: dims.height.y1 },
        ]}
      />

      <LinearDimension
        x0={Math.min(topFlange.x0, topFlange.x1)}
        y0={topDimY}
        x1={Math.max(topFlange.x0, topFlange.x1)}
        y1={topDimY}
        value={topFlange.value}
        fontSize={fontSize}
        thin={thin}
        tick={tick}
        labelWidth={buildLabelWidth}
        labelSide={topLabelSide}
        extensionTo={[
          { x: topFlange.x0, y: topFlange.y0 },
          { x: topFlange.x1, y: topFlange.y1 },
        ]}
      />

      <LinearDimension
        x0={Math.min(bottomFlange.x0, bottomFlange.x1)}
        y0={bottomDimY}
        x1={Math.max(bottomFlange.x0, bottomFlange.x1)}
        y1={bottomDimY}
        value={bottomFlange.value}
        fontSize={fontSize}
        thin={thin}
        tick={tick}
        labelWidth={buildLabelWidth}
        labelSide="below"
        extensionTo={[
          { x: bottomFlange.x0, y: bottomFlange.y0 },
          { x: bottomFlange.x1, y: bottomFlange.y1 },
        ]}
      />
    </Group>
  );
}

function LinearDimension({
  x0,
  y0,
  x1,
  y1,
  value,
  fontSize,
  thin,
  tick,
  labelWidth,
  labelSide,
  extensionTo,
}: LinearDimensionProps) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) return null;

  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const isVertical = Math.abs(ux) < 0.5;
  const labelOffsetY = labelSide === "above"
    ? -fontSize * 0.3
    : labelSide === "below"
      ? fontSize * 1.15
      : fontSize * 1.0;

  const ends = [{ x: x0, y: y0 }, { x: x1, y: y1 }];

  return (
    <Group listening={false}>
      {extensionTo.map((point, index) => {
        const target = ends.reduce((best, end) => {
          const d = Math.hypot(end.x - point.x, end.y - point.y);
          return d < best.d ? { end, d } : best;
        }, { end: ends[0], d: Infinity }).end;
        return (
          <Line
            key={index}
            points={[point.x, point.y, target.x, target.y]}
            stroke={EXTENSION_COLOR}
            strokeWidth={thin}
            dash={[tick * 0.4, tick * 0.85]}
          />
        );
      })}
      <Line
        points={[x0, y0, x1, y1]}
        stroke={DIMENSION_COLOR}
        strokeWidth={thin}
      />
      <Line
        points={[x0 - nx * tick / 2, y0 - ny * tick / 2, x0 + nx * tick / 2, y0 + ny * tick / 2]}
        stroke={DIMENSION_COLOR}
        strokeWidth={thin * 1.5}
      />
      <Line
        points={[x1 - nx * tick / 2, y1 - ny * tick / 2, x1 + nx * tick / 2, y1 + ny * tick / 2]}
        stroke={DIMENSION_COLOR}
        strokeWidth={thin * 1.5}
      />
      <Text
        text={value.toFixed(2)}
        x={(x0 + x1) / 2}
        y={(y0 + y1) / 2}
        width={labelWidth}
        offsetX={labelWidth / 2}
        offsetY={labelOffsetY}
        align="center"
        rotation={isVertical ? -90 : 0}
        fontSize={fontSize}
        fontFamily={FONT_FAMILY}
        fontStyle="600"
        fill={DIMENSION_COLOR}
        listening={false}
      />
    </Group>
  );
}

type LinearDimensionProps = {
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  value: number,
  fontSize: number,
  thin: number,
  tick: number,
  labelWidth: number,
  labelSide: "above" | "below" | "outside",
  extensionTo: Point[],
}

type SectionDimensionsProps = {
  layout: DimensionLayout,
  zoom: number,
  loadDirection?: "gravity" | "uplift",
}
