import { Arrow, Group, Line, Text } from "react-konva";
import type { SectionDrawing } from "./cross-section";
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
  bounds: { minX: number, minY: number, maxX: number, maxY: number, cx: number, cy: number },
};

export function getDimensionLayout(drawing: SectionDrawing): DimensionLayout {
  const points = drawing.parts.flatMap((part) => part.points);
  const sc = shearCenter(drawing.parts.map((part) => ({ points: part.points, t: part.t })));

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

  const unit = (maxY - minY) * 0.085;
  const gap = unit * 0.2;
  const tick = unit * 0.3;
  const verticalX = minX - unit * 0.9;
  const horizontalY = Math.min(sc.y + unit * 1.2, maxY - unit * 0.6);
  const arrowLength = unit * 1.3;

  const boundsMinX = verticalX - unit * 1.2;
  const boundsMaxX = Math.max(maxX, sc.x) + unit * 0.3;
  const boundsMinY = Math.min(minY, drawing.load.y - gap - arrowLength) - unit * 0.3;
  const boundsMaxY = Math.max(maxY, horizontalY) + unit * 0.7;

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
  const dotted = [1.5 * px, 3 * px];
  const dashed = [6 * px, 4 * px];

  const { sc, minX, maxX, leftY, rightY, bottomY, bottomLeftX, load, horizontalY, verticalX, gap, tick, arrowLength } = layout;
  const eccentricity = Math.abs(load.x - sc.x);
  const showEccentricity = eccentricity >= 0.01;
  const arrowTip = load.y - gap;
  const arrowTail = arrowTip - arrowLength;
  const diamond = 5 * px;
  const labelWidth = 200 * px;

  return (
    <Group listening={false}>
      <Line points={[minX, leftY, minX, horizontalY + gap]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
      <Line points={[maxX, rightY, maxX, horizontalY + gap]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
      <Line points={[sc.x, sc.y, sc.x, horizontalY + gap]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
      <Line points={[bottomLeftX, bottomY, verticalX - gap, bottomY]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
      <Line points={[Math.min(sc.x, minX), sc.y, verticalX - gap, sc.y]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
      {sc.x > minX && (
        <Line points={[minX, sc.y, sc.x, sc.y]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
      )}

      <Line points={[minX, horizontalY, maxX, horizontalY]} stroke={DIMENSION_COLOR} strokeWidth={thin} />
      {[minX, sc.x, maxX].map((x, index) => (
        <Line key={index} points={[x, horizontalY - tick / 2, x, horizontalY + tick / 2]} stroke={DIMENSION_COLOR} strokeWidth={thin * 1.4} />
      ))}
      <DimensionText
        text={(sc.x - minX).toFixed(2)}
        x={(minX + sc.x) / 2}
        y={horizontalY + 4 * px}
        width={labelWidth}
        fontSize={fontSize}
      />
      <DimensionText
        text={(maxX - sc.x).toFixed(2)}
        x={(sc.x + maxX) / 2}
        y={horizontalY + 4 * px}
        width={labelWidth}
        fontSize={fontSize}
      />

      <Line points={[verticalX, bottomY, verticalX, sc.y]} stroke={DIMENSION_COLOR} strokeWidth={thin} />
      {[bottomY, sc.y].map((y, index) => (
        <Line key={index} points={[verticalX - tick / 2, y, verticalX + tick / 2, y]} stroke={DIMENSION_COLOR} strokeWidth={thin * 1.4} />
      ))}
      <DimensionText
        text={(bottomY - sc.y).toFixed(2)}
        x={verticalX - 4 * px - fontSize * 1.2}
        y={(bottomY + sc.y) / 2}
        width={labelWidth}
        fontSize={fontSize}
        rotation={-90}
      />

      {showEccentricity && (
        <>
          <Line points={[load.x, load.y, load.x, sc.y]} stroke={EXTENSION_COLOR} strokeWidth={thin} dash={dotted} />
          <Line points={[sc.x, sc.y, load.x, sc.y]} stroke={ACCENT_COLOR} strokeWidth={thin * 1.4} dash={dashed} />
          <DimensionText
            text={`e = ${eccentricity.toFixed(2)} in.`}
            x={Math.min(sc.x, load.x) + 7 * px}
            y={sc.y + 5 * px}
            width={labelWidth}
            fontSize={fontSize}
            color={ACCENT_COLOR}
            align="left"
            bold
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
      <DimensionText
        text="SC"
        x={sc.x + diamond + 3 * px}
        y={sc.y - diamond - fontSize * 1.15}
        width={labelWidth}
        fontSize={fontSize}
        color={ACCENT_COLOR}
        align="left"
        bold
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

type SectionDimensionsProps = {
  layout: DimensionLayout,
  zoom: number,
  loadDirection: "gravity" | "uplift",
}

function DimensionText({
  text,
  x,
  y,
  width,
  fontSize,
  rotation = 0,
  color = DIMENSION_COLOR,
  align = "center",
  bold = false,
}: DimensionTextProps) {
  return (
    <Text
      text={text}
      x={x}
      y={y}
      width={width}
      offsetX={align === "center" ? width / 2 : 0}
      align={align}
      rotation={rotation}
      fontSize={fontSize}
      fontFamily={FONT_FAMILY}
      fontStyle={bold ? "600" : "500"}
      fill={color}
      listening={false}
    />
  );
}

type DimensionTextProps = {
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  rotation?: number,
  color?: string,
  align?: "center" | "left",
  bold?: boolean,
}
