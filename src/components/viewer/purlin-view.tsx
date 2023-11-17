import { useRef, useState } from "react";
import { Layer, Rect, Stage, Group } from "react-konva";
import Konva from "konva"
import { useResponsiveStage } from "../hooks/use-responsive-stage";
import SteelBeam from "./elements/steel-beam";
import DistanceDimension from "./elements/dimension";
import UniformLoad from "./elements/uniform-load";


export default function PurlinView({ purlinData, frameFlangeWidth }: PurLinViewProps) {

  const box = getBoundingBox(purlinData);

  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null!);
  const stageRef = useRef<Konva.Stage>(null!);

  // Make stage responsive to container size
  // And make stage repsonsive to content by centering purlin spans
  useResponsiveStage({ stageRef, containerRef, boundingBox: box, setZoom})

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-300">
      <Stage ref={stageRef} draggable>
        <Layer>
          {generatePurlins(purlinData, zoom)}
          {generateSupports(purlinData, zoom, frameFlangeWidth)}
          {generateUniformLoad(purlinData, zoom)}
        </Layer>
      </Stage>
    </div>
  )
}

const PURLIN_STYLE = {
  stroke: "#1e293b",
  fillEnabled: false,
}
const SUPPORT_STYLE = {
  stroke: "#1e293b",
  fillEnabled: false,
}
const PURLIN_LAP_OFFSET_Y = 0.2;
const PURLIN_HEIGHT = 8 / 12;

const LOAD_OFFSET_Y = 3;


function getBoundingBox(data: Array<PurlinData>) {
  let width = 0;
  data.forEach(item => {
    width += item.span - item.rightLap;
  })
  
  const box = {
    x: width / 2,
    y: 0,
    width: width,
    height: PURLIN_HEIGHT,
  }

  return box;
}

function calcualtePurlinPosiions(data: Array<PurlinData>) {
  const purlinPositions: Array<{x: number, y: number}> = [];

  let curPurlinX = 0
  let curPurlinY = PURLIN_LAP_OFFSET_Y / 2;
  data.forEach((item, index) => {
    purlinPositions.push({x: curPurlinX, y:curPurlinY});
    curPurlinX += item.span - item.rightLap;
    curPurlinY = (curPurlinY < 0) ? (PURLIN_LAP_OFFSET_Y / 2) : (-PURLIN_LAP_OFFSET_Y / 2);

  });

  return purlinPositions;
}

function calculateSupportPositions(data: Array<PurlinData>) {
  const supportPositions: Array<{x: number, y: number}> = [];

  let curSupportX = 0
  let curSupportY = PURLIN_HEIGHT + PURLIN_LAP_OFFSET_Y
  data.forEach((item, index) => {
    if (index == 0) supportPositions.push({x: curSupportX, y: curSupportY});
    curSupportX += item.span - item.rightLap / 2 - item.leftLap / 2;
    supportPositions.push({x: curSupportX, y: curSupportY});
  });

  return supportPositions;
}


const generateUniformLoad = (data: Array<PurlinData>, zoom: number) => {
  const supportPositions = calculateSupportPositions(data);
  const loadWidth = Math.max(...supportPositions.map(item => item.x)) - Math.min(...supportPositions.map(item => item.x));

  return (
    <UniformLoad
      x={0}
      y={-LOAD_OFFSET_Y}
      width={loadWidth}
      zoom={zoom}
    />
  );  

}

const generatePurlins = (data: Array<PurlinData>, zoom: number) => {
  
  const purlinPositions = calcualtePurlinPosiions(data);

  return (
    purlinPositions.map((item, index) => {
    return (
      <Rect
        key={item.x}
        x={item.x}
        y={item.y}
        width={data[index].span}
        height={PURLIN_HEIGHT}
        strokeWidth={1.25 / zoom}
        {...PURLIN_STYLE}
      />
    );
  }))
}

const generateSupports = (data: Array<PurlinData>, zoom: number, frameFlangeWidth: number) => {
  const supportPositions = calculateSupportPositions(data);
  const numberSupport = supportPositions.length;

  const w = frameFlangeWidth / 12;  // Convert to ft
  const h = 3 * w;
  const tf = w / 13.7;
  const tw = (h - 2 * tf) / 49.6;

  let dimensionOn = true
  const dimensionObjsArr: Array<{startPoint: {x: number, y: number}, endPoint: {x: number, y: number}}> = []
  const dimensionY = PURLIN_HEIGHT + PURLIN_LAP_OFFSET_Y + h
  for (let index = 0; index < (numberSupport - 1); index++) {
    if (index == (numberSupport - 1)) continue;
    let startPoint = {x: supportPositions[index].x, y: dimensionY};
    let endPoint = {x: supportPositions[index + 1].x, y: dimensionY};
    dimensionObjsArr.push({startPoint, endPoint});
  }

  return (
    <Group>
      {supportPositions.map((item) => (
        <SteelBeam
          key={item.x}
          x={item.x}
          y={PURLIN_HEIGHT + PURLIN_LAP_OFFSET_Y}
          w={w}
          h={h}
          tf={tf}
          tw={tw}
          strokeWidth={1 / zoom}
        />
      ))}
      {dimensionOn && (dimensionObjsArr.map(item => (
        <DistanceDimension
          key={item.startPoint.x}
          distanceUnit="ft."
          scale={1 / zoom}
          {...item}
        />
      )))}
    </Group>
  );
}

type PurLinViewProps = {
  purlinData: Array<PurlinData>,
  frameFlangeWidth: number,
}

type PurlinData = {
  id: string,
  index: number,
  leftLap: number,
  span: number,
  rightLap: number,
}