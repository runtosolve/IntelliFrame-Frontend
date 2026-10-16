import { useMemo, useRef, useState } from "react";
import { Layer, Rect, Stage, Group } from "react-konva";
import Konva from "konva"
import { useResponsiveStage } from "../hooks/use-responsive-stage";
import SteelBeam from "./elements/steel-beam";
import DistanceDimension from "./elements/dimension";
import UniformLoad from "./elements/uniform-load";
import { calcualtePurlinPosiions, calculateSupportPositions } from "./purlin-view-utils";


export default function PurlinView({ purlinData, frameFlangeWidth, loadDirection }: PurLinViewProps) {

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
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);

  const ready = useResponsiveStage({
    stageRef,
    containerRef,
    boundingBox: box,
    setZoom,
    padding: showLoad ? STAGE_PADDING : SPAN_ONLY_PADDING,
  })

  const purlins = useMemo(() => generatePurlins(purlinData, purlinPositions, zoom), [purlinData, purlinPositions, zoom]);
  const supports = useMemo(
    () => generateSupports(supportPositions, zoom, frameFlangeWidth),
    [supportPositions, zoom, frameFlangeWidth],
  );
  const uniformLoad = useMemo(
    () => (showLoad ? generateUniformLoad(supportPositions, zoom, loadDirection === "uplift") : null),
    [supportPositions, zoom, loadDirection, showLoad],
  );

  return (
    <div ref={containerRef} className="w-full h-full" style={{ visibility: ready ? "visible" : "hidden" }}>
      <Stage ref={stageRef}>
        <Layer listening={false}>
          {purlins}
          {supports}
          {uniformLoad}
        </Layer>
      </Stage>
    </div>
  )
}

const PURLIN_STYLE = {
  stroke: "#1e293b",
  fillEnabled: false,
}
const PURLIN_LAP_OFFSET_Y = 0.2;
const PURLIN_HEIGHT = 8 / 12;

const LOAD_GAP_PX = 27;
const STAGE_PADDING = { top: 24 + LOAD_GAP_PX, right: 16, bottom: 84, left: 16 };
const SPAN_ONLY_PADDING = { top: 24, right: 16, bottom: 84, left: 16 };

function getBoundingBox(data: Array<PurlinData>, frameFlangeWidth: number, showLoad: boolean) {
  let width = 0;
  data.forEach(item => {
    width += item.span;
  })

  const top = showLoad ? -width / 25 : 0;
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

  return (
    <UniformLoad
      x={0}
      y={-(loadWidth / 50 + LOAD_GAP_PX / zoom)}
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


type Point = { x: number, y: number };

type PurLinViewProps = {
  purlinData: Array<PurlinData>,
  frameFlangeWidth: number,
  loadDirection?: "gravity" | "uplift",
}


export type PurlinData = {
  id: string,
  index: number,
  leftLap: number,
  span: number,
  rightLap: number,
  length: number
}