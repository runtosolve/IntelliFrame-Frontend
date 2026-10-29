import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { Layer, Rect, Stage, Group, Arrow, Text, Line, Circle } from "react-konva";
import Konva from "konva"
import { useResponsiveStage } from "../hooks/use-responsive-stage";
import SteelBeam from "./elements/steel-beam";
import DistanceDimension from "./elements/dimension";
import UniformLoad from "./elements/uniform-load";
import { calcualtePurlinPosiions, calculateSupportPositions } from "./purlin-view-utils";
import type { AnalaysisData } from "../results/results-display";


export default function PurlinView({ purlinData, frameFlangeWidth, loadDirection, deflection }: PurLinViewProps) {

  const showLoad = loadDirection !== undefined;
  const box = useMemo(
    () => getBoundingBox(purlinData, frameFlangeWidth, showLoad),
    [purlinData, frameFlangeWidth, showLoad],
  );
  const purlinPositions = useMemo(() => calcualtePurlinPosiions(purlinData, PURLIN_LAP_OFFSET_Y), [purlinData]);
  const supportPositions = useMemo(
    () => calculateSupportPositions(purlinData, PURLIN_LAP_OFFSET_Y, PURLIN_HEIGHT),
    [purlinData],
  );

  const [zoom, setZoom] = useState(1);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [pulse, setPulse] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);

  const ready = useResponsiveStage({
    stageRef,
    containerRef,
    boundingBox: box,
    setZoom,
    padding: showLoad ? STAGE_PADDING : SPAN_ONLY_PADDING,
  })

  useEffect(() => {
    if (!deflection || deflection.failureNodeIndex == null) return;
    let frame = 0;
    let raf = 0;
    const tick = () => {
      frame += 1;
      setPulse(0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame / 12)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [deflection]);

  const purlins = useMemo(() => generatePurlins(purlinData, purlinPositions, zoom), [purlinData, purlinPositions, zoom]);
  const supports = useMemo(
    () => generateSupports(supportPositions, zoom, frameFlangeWidth),
    [supportPositions, zoom, frameFlangeWidth],
  );
  const lapDimensions = useMemo(
    () => generateLapDimensions(purlinData, supportPositions, zoom),
    [purlinData, supportPositions, zoom],
  );
  const axes = useMemo(
    () => (showLoad ? null : generateSpanAxes(supportPositions, zoom)),
    [supportPositions, zoom, showLoad],
  );
  const uniformLoad = useMemo(
    () => (showLoad ? generateUniformLoad(supportPositions, zoom, loadDirection === "uplift") : null),
    [supportPositions, zoom, loadDirection, showLoad],
  );
  const deflectionPlot = useMemo(
    () => (deflection ? buildDeflectionPlot(deflection) : null),
    [deflection],
  );
  const maxDeflection = useMemo(
    () => (deflection ? Math.max(...deflection.nodeDeflections.map(Math.abs)) : 0),
    [deflection],
  );

  const worldToLocal = (worldX: number, worldY: number) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    return {
      x: stage.x() + worldX * stage.scaleX(),
      y: stage.y() + worldY * stage.scaleY(),
    };
  };

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ visibility: ready ? "visible" : "hidden" }}>
      <Stage ref={stageRef}>
        <Layer listening={false}>
          {purlins}
          {supports}
          {axes}
          {lapDimensions}
          {/* Comb (distributed load) sits above -Z/+Z and must stay in view */}
          {uniformLoad}
          {deflectionPlot && (
            <Line
              points={deflectionPlot.points}
              stroke="#111827"
              strokeWidth={2 / zoom}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />
          )}
          {deflectionPlot && deflectionPlot.failureIndex != null && (
            <Circle
              x={deflectionPlot.xs[deflectionPlot.failureIndex]}
              y={deflectionPlot.ys[deflectionPlot.failureIndex]}
              radius={(9 * pulse) / zoom}
              fill="#b91c1c"
              opacity={0.55 + 0.45 * pulse}
              listening={false}
            />
          )}
        </Layer>
        {deflectionPlot && (
          <Layer>
            {deflectionPlot.xs.map((x, index) => (
              <Circle
                key={`defl-hit-${index}`}
                x={x}
                y={deflectionPlot.ys[index]}
                radius={8 / zoom}
                fill="#111827"
                opacity={hoverIndex === index ? 1 : 0}
                onMouseEnter={(e) => {
                  const stage = e.target.getStage();
                  const pointer = stage?.getPointerPosition();
                  if (pointer) setTooltipPos(pointer);
                  else setTooltipPos(worldToLocal(x, deflectionPlot.ys[index]));
                  setHoverIndex(index);
                }}
                onMouseMove={(e) => {
                  const stage = e.target.getStage();
                  const pointer = stage?.getPointerPosition();
                  if (pointer) setTooltipPos(pointer);
                }}
                onMouseLeave={() => setHoverIndex(null)}
              />
            ))}
          </Layer>
        )}
      </Stage>
      {deflection && hoverIndex != null && (
        <div
          className="framing-deflection-tooltip"
          style={{ left: tooltipPos.x + 14, top: tooltipPos.y + 14 }}
        >
          <div>
            <span>deflection: </span>
            {deflection.nodeDeflections[hoverIndex].toPrecision(2)} in.
          </div>
          <div>
            <span>max deflection: </span>
            {maxDeflection.toPrecision(2)} in.
          </div>
        </div>
      )}
    </div>
  )
}

const PURLIN_STYLE = {
  stroke: "#1e293b",
  fillEnabled: false,
}
const PURLIN_LAP_OFFSET_Y = 0.2;
const PURLIN_HEIGHT = 8 / 12;
const LAP_DIMENSION_COLOR = "#2f6fb0";

const LAP_STACK_PX = 42;
const LOAD_GAP_PX = 16;
const LOAD_HEIGHT_FACTOR = 1 / 25;
const LAP_DIM_EXTENSION = 24;
const AXIS_TOP_CLEARANCE_PX = 52;
const AXIS_COLOR = "#44403c";
const STAGE_PADDING = {
  top: 22 + LAP_STACK_PX + LOAD_GAP_PX,
  right: 16,
  bottom: 86,
  left: 16,
};
const SPAN_ONLY_PADDING = {
  top: 22 + LAP_STACK_PX + AXIS_TOP_CLEARANCE_PX,
  right: 16,
  bottom: 86,
  left: 16,
};

function getBoundingBox(data: Array<PurlinData>, frameFlangeWidth: number, showLoad: boolean) {
  let width = 0;
  data.forEach(item => {
    width += item.span;
  })

  const top = showLoad ? -width * LOAD_HEIGHT_FACTOR : 0;
  const bottom = PURLIN_HEIGHT + PURLIN_LAP_OFFSET_Y + 3 * (frameFlangeWidth / 12);

  return {
    x: width / 2,
    y: (top + bottom) / 2,
    width: width,
    height: bottom - top,
  };
}


const generateUniformLoad = (supportPositions: Array<Point>, zoom: number, isUplift = false) => {
  if (supportPositions.length === 0) return null;
  const loadWidth = Math.max(...supportPositions.map(item => item.x)) - Math.min(...supportPositions.map(item => item.x));
  const loadY = -(loadWidth * LOAD_HEIGHT_FACTOR / 2 + (LAP_STACK_PX + LOAD_GAP_PX) / zoom);

  return (
    <UniformLoad
      x={0}
      y={loadY}
      width={loadWidth}
      zoom={zoom}
      rotation={isUplift ? 180 : 0}
    />
  );  

}


const generatePurlins = (data: Array<PurlinData>, purlinPositions: Array<Point>, zoom: number) => {
  return (
    purlinPositions.map((item, index) => {
    return (
      <Rect
        key={`${data[index].id}-${index}`}
        x={item.x}
        y={item.y}
        width={data[index].length}
        height={PURLIN_HEIGHT}
        strokeWidth={1.25 / zoom}
        {...PURLIN_STYLE}
      />
    );
  }))
}


const generateSupports = (supportPositions: Array<Point>, zoom: number, frameFlangeWidth: number) => {
  const numberSupport = supportPositions.length;

  const w = frameFlangeWidth / 12;
  const h = 3 * w;
  const tf = w / 13.7;
  const tw = (h - 2 * tf) / 49.6;

  const dimensionObjsArr: Array<{startPoint: {x: number, y: number}, endPoint: {x: number, y: number}}> = []
  const dimensionY = PURLIN_HEIGHT + PURLIN_LAP_OFFSET_Y + h
  for (let index = 0; index < (numberSupport - 1); index++) {
    const startPoint = {x: supportPositions[index].x, y: dimensionY};
    const endPoint = {x: supportPositions[index + 1].x, y: dimensionY};
    dimensionObjsArr.push({startPoint, endPoint});
  }

  return (
    <Group>
      {supportPositions.map((item, index) => (
        <SteelBeam
          key={`${item.x}-${index}`}
          x={item.x}
          y={PURLIN_HEIGHT + PURLIN_LAP_OFFSET_Y}
          w={w}
          h={h}
          tf={tf}
          tw={tw}
          strokeWidth={1 / zoom}
        />
      ))}
      {dimensionObjsArr.map((item, index) => (
        <DistanceDimension
          key={`${item.startPoint.x}-${index}`}
          distanceUnit="ft."
          scale={1 / zoom}
          {...item}
        />
      ))}
    </Group>
  );
}

const generateLapDimensions = (
  data: Array<PurlinData>,
  supportPositions: Array<Point>,
  zoom: number,
) => {
  if (supportPositions.length < 3) return null;

  const dimY = -PURLIN_LAP_OFFSET_Y / 2;
  const scale = 1 / zoom;
  const dims: Array<ReactElement> = [];

  for (let index = 1; index < supportPositions.length - 1; index++) {
    const supportX = supportPositions[index].x;
    const negZ = data[index]?.leftLap ?? 0;
    const posZ = data[index - 1]?.rightLap ?? 0;

    if (negZ > 0) {
      dims.push(
        <DistanceDimension
          key={`lap-neg-${index}`}
          startPoint={{ x: supportX - negZ, y: dimY }}
          endPoint={{ x: supportX, y: dimY }}
          distanceValue={negZ}
          scale={scale}
          color={LAP_DIMENSION_COLOR}
          side="above"
          centerLabel="-Z"
          label={`${negZ.toFixed(1)} ft`}
          extension={LAP_DIM_EXTENSION}
        />,
      );
    }

    if (posZ > 0) {
      dims.push(
        <DistanceDimension
          key={`lap-pos-${index}`}
          startPoint={{ x: supportX, y: dimY }}
          endPoint={{ x: supportX + posZ, y: dimY }}
          distanceValue={posZ}
          scale={scale}
          color={LAP_DIMENSION_COLOR}
          side="above"
          centerLabel="+Z"
          label={`${posZ.toFixed(1)} ft`}
          extension={LAP_DIM_EXTENSION}
        />,
      );
    }
  }

  return <Group>{dims}</Group>;
}

const generateSpanAxes = (
  supportPositions: Array<Point>,
  zoom: number,
) => {
  if (supportPositions.length === 0) return null;

  const scale = 1 / zoom;
  const axisLength = 32 * scale;
  const fontSize = 12 * scale;
  const lastX = supportPositions[supportPositions.length - 1].x;
  const originX = lastX - axisLength - fontSize - 8 * scale;
  const originY = -((LAP_STACK_PX + 12) * scale) - axisLength;
  const strokeWidth = 1.25 * scale;
  const pointer = 6.5 * scale;

  return (
    <Group x={originX} y={originY} listening={false}>
      <Arrow
        points={[0, 0, axisLength, 0]}
        stroke={AXIS_COLOR}
        fill={AXIS_COLOR}
        strokeWidth={strokeWidth}
        pointerLength={pointer}
        pointerWidth={pointer * 0.9}
      />
      <Text
        text="Z"
        x={axisLength + 4 * scale}
        y={-fontSize * 0.55}
        fontSize={fontSize}
        fontStyle="700"
        fill={AXIS_COLOR}
      />
      <Arrow
        points={[0, 0, 0, -axisLength]}
        stroke={AXIS_COLOR}
        fill={AXIS_COLOR}
        strokeWidth={strokeWidth}
        pointerLength={pointer}
        pointerWidth={pointer * 0.9}
      />
      <Text
        text="Y"
        x={-fontSize * 0.35}
        y={-axisLength - fontSize - 3 * scale}
        fontSize={fontSize}
        fontStyle="700"
        fill={AXIS_COLOR}
      />
    </Group>
  );
}


function buildDeflectionPlot(deflection: AnalaysisData) {
  const values = deflection.nodeDeflections;
  const zs = deflection.nodeLocations;
  if (zs.length === 0 || values.length === 0) return null;

  const zMin = Math.min(...zs);
  const xs = zs.map((z) => (z - zMin) / 12);
  const maxAbs = Math.max(...values.map(Math.abs), 1e-6);
  const amp = Math.min(1.15, 0.85 / maxAbs);
  const baseY = PURLIN_HEIGHT / 2;
  const ys = values.map((v) => baseY + v * amp);
  const points = xs.flatMap((x, index) => [x, ys[index]]);

  return {
    xs,
    ys,
    points,
    failureIndex: deflection.failureNodeIndex,
  };
}

type Point = { x: number, y: number };

type PurLinViewProps = {
  purlinData: Array<PurlinData>,
  frameFlangeWidth: number,
  loadDirection?: "gravity" | "uplift",
  deflection?: AnalaysisData | null,
}


export type PurlinData = {
  id: string,
  index: number,
  leftLap: number,
  span: number,
  rightLap: number,
  length: number
}
